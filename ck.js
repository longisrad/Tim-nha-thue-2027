/* ck.js: giao diện và lưu checklist (trang chỉnh sửa mục đạt/lỗi, ghi chú, ảnh xem/lỗi, chấm điểm), tách khỏi index.html.
   Tối ưu: cache tham chiếu phần tử thống kê phần/mục ngay sau renderCk và chỉ ghi innerHTML gợi ý khi nội dung đổi,
   giúp mỗi lần chạm mục đạt/lỗi phản hồi O(1) không cần querySelector toàn trang. */
(function(){
"use strict";
var K=null,S=null,inited=false,KV=3;   // KV: phiên bản cầu nối NK mà ck.js này cần (index.html phải khớp)
var $,CK,LP,PARTS,TIPS,VW,ckCopy,ckLiteOf,ckLoad,ckSaveOff,ckSnap,ckStat,ckcSave,closeCk,esc,findItem,imgSrc,jumpTop,openLb,persist,rtgH,trashIds,upBusy;
var secEls=[],partEls={},cknEl=null,ckbarEl=null,rtsgEl=null,lastSugH="";
function secHas(s){
  var k,v;
  for(k=0;k<(s.i||[]).length;k++)if(S.cur.c[s.i[k][0]])return true;
  for(k=0;k<(s.f||[]).length;k++){v=S.cur.v[s.f[k][0]];if(Array.isArray(v)?v.length:v&&String(v).trim())return true}
  return false}
function fldH(s){var h="";(s.f||[]).forEach(function(f){
  var id=f[0],v=S.cur.v[id];
  h+='<div class="fl"><label>'+esc(f[1])+'</label>';
  if(f[2]==="t")h+='<input autocomplete="off" data-lpignore="true" data-1p-ignore data-f="'+id+'" value="'+esc(v||"")+'"'+(K.canW?'':' disabled')+'>';
  else{h+='<div class="opts">';f[3].forEach(function(o){
    var on=f[2]==="m"?(Array.isArray(v)&&v.indexOf(o)>-1):v===o;
    h+='<button type="button" class="opt" data-fo="'+id+'" data-t="'+f[2]+'" data-o="'+esc(o)+'" aria-pressed="'+on+'">'+esc(o)+'</button>'});h+='</div>'}
  h+='</div>'});return h}
function itH(s){return (s.i||[]).map(function(x){var st=S.cur.c[x[0]]||0;
  return '<button type="button" class="ci" data-i="'+x[0]+'" data-s="'+st+'"><span class="bx">'+["","✓","✕"][st]+'</span><span class="cl">'+esc(x[1])+'</span></button>'}).join("")}
function ckSuggest(c){
  var st=ckStat(c),n=st.d+st.b;if(n<5)return{n:n,t:st.t,d:st.d,b:st.b,s:0};
  var r=st.d/n,sc=r>=0.9?5:r>=0.75?4:r>=0.6?3:r>=0.4?2:1;
  return{n:n,t:st.t,d:st.d,b:st.b,s:sc}}
function updSug(){
  var el=rtsgEl||$("rtsg");if(!el||!S.cur)return;
  var g=ckSuggest(S.cur),h;
  if(!g.s){h='<span class="grow">💡 Cần kiểm thêm ít nhất 5 mục checklist để có gợi ý điểm.</span>'}
  else{
    var low=g.n<g.t/2;
    h='<span class="grow">💡 Gợi ý: <b>'+g.s+'/5</b> · '+g.d+' đạt'+(g.b?', '+g.b+' lỗi':'')+' (đã kiểm '+g.n+'/'+g.t+' mục)'+(low?'<small>Mới kiểm chưa tới nửa checklist, gợi ý chỉ mang tính tham khảo.</small>':'')+'</span>'+(K.canW&&S.cur.rt!==g.s?'<button type="button" class="btn" data-rts="'+g.s+'">Dùng gợi ý</button>':'');
  }
  if(h!==lastSugH){lastSugH=h;el.innerHTML=h}}
function setRt(n){
  S.cur.rt=n;
  Array.prototype.forEach.call($("ckb").getElementsByClassName("rtb"),function(b){b.setAttribute("aria-pressed",+b.dataset.rt===S.cur.rt)});
  var rv=$("rtv");if(rv)rv.textContent=S.cur.rt?S.cur.rt+"/5":"";
  var cs=$("ckst");if(cs)cs.innerHTML=rtgH(S.cur.rt);
  updSug();ckSave()}
function updProg(){
  if(!S.cur||!cknEl)return;
  var s=ckStat(S.cur);
  cknEl.innerHTML='<b>'+s.d+'/'+s.t+'</b> đạt'+(s.b?' · <span class="bad">'+s.b+' lỗi</span>':'');
  if(ckbarEl)ckbarEl.style.width=Math.round(s.d*100/s.t)+"%";
  var pd1=0,pc1=0,pd2=0,pc2=0;
  for(var si=0;si<CK.length;si++){
    var sec=CK[si],its=sec.i||[],n=0,j;
    for(j=0;j<its.length;j++){
      if(S.cur.c[its[j][0]]===1)n++;
      if(sec.p===1){pc1++;if(S.cur.c[its[j][0]]===1)pd1++}
      else if(sec.p===2){pc2++;if(S.cur.c[its[j][0]]===1)pd2++}
    }
    var se=secEls[si];if(se)se.textContent=its.length?n+"/"+its.length:"";
  }
  if(partEls[1])partEls[1].textContent=pd1+"/"+pc1;
  if(partEls[2])partEls[2].textContent=pd2+"/"+pc2;
  updSug();
}
var PH={view:{els:{},nm:{}},damage:{els:{},nm:{}}},upBad=[];   // PH: ô ảnh đang hiển thị theo mục (việc vẽ ô do img.js lo); upBad: ảnh tải lỗi, giữ ô đỏ để chạm thử lại hoặc bấm × xóa
function ckPhR(box,arr,kind,alt){
  var want=[];
  arr.forEach(function(s,i){want.push({k:"i:"+s,id:s,src:imgSrc(s,300),big:imgSrc(s,VW),i:i})});
  S.upQ.filter(function(u){return (u.cur===S.cur||(u.hid&&u.hid===S.id))&&u.k===kind}).forEach(function(u){want.push({k:"u:"+u.name,src:u.src,up:1})});
  upBad.filter(function(u){return u.hid===S.id&&u.k===kind}).forEach(function(u){want.push({k:"u:"+u.name,src:u.src,er:u})});
  if(window.Img&&Img.up)Img.up.tiles({box:box,st:PH[kind],want:want,rm:kind==="view"?"data-vrm":"data-crm",alt:alt,big:true,canW:K.canW})}
function ckPh(){
  var a=$("ckvph"),b=$("ckph");
  if(a)ckPhR(a,S.cur.vi,"view","Ảnh đi xem");
  if(b)ckPhR(b,S.cur.im,"damage","Ảnh hư hỏng");
  if(window.Img&&Img.sweep){if(a)Img.sweep(a);if(b)Img.sweep(b)}
  var la=$("ckvl"),lb=$("ckil");
  if(la){la.hidden=!(S.cur.vu&&S.cur.vi.length);if(!la.hidden)la.href=S.cur.vu}
  if(lb){lb.hidden=!(S.cur.du&&S.cur.im.length);if(!lb.hidden)lb.href=S.cur.du}}
function renderCk(full){
  var it=findItem(S.id),el=$("ckb");
  secEls=[];partEls={};cknEl=null;ckbarEl=null;rtsgEl=null;lastSugH="";
  if(!it){S.cur=null;S.dirty=false;el.className="";el.innerHTML='<div class="empty"><p>'+(K.items.length?"Hãy chọn một căn ở tab Danh sách rồi bấm Checklist.":"Chưa có căn nào. Hãy thêm nhà ở tab Danh sách trước.")+'</p></div>';return}
  S.cur=ckCopy(full);S.cur.rt=it.rt||0;S.cur.pr=it.pr||"";S.cur.co=it.co||"";S.dirty=false;el.className=K.canW?"":"ro";
  var h='<div class="ckhd"><h2 class="ckt">'+esc(it.n)+'</h2><button type="button" class="xc" data-ckx aria-label="Đóng"></button></div><div id="ckst" style="margin:-4px 0 8px">'+rtgH(S.cur.rt)+'</div>'+(K.canW?'<p class="hint">Sau mỗi lần đi xem, chạm từng mục: 1 lần = đạt ✓, 2 lần = có lỗi ✕, 3 lần = bỏ trống. Tự động lưu.</p>':'<p class="pm">Bạn chỉ có quyền xem checklist.</p>');
  h+='<div class="prog"><div class="pt"><span id="ckn"></span><span class="pm" id="cks"></span></div><div class="pbar"><i id="ckbar"></i></div></div>';
  CK.forEach(function(s,si){
    var np=s.p&&(si===0||CK[si-1].p!==s.p);
    if(np){var pc=0,pd=0;CK.forEach(function(q){if(q.p===s.p)(q.i||[]).forEach(function(x){pc++;if(S.cur.c[x[0]]===1)pd++})});h+='<div class="part p'+s.p+'"><b>'+PARTS[s.p].h+'</b><span class="pcnt" data-part="'+s.p+'">'+pd+'/'+pc+'</span><small>'+PARTS[s.p].d+'</small></div>'}
    h+='<details class="sec"'+(secHas(s)?' open':'')+'><summary><span>'+esc(s.t)+'</span><span class="cnt" data-sec="'+si+'"></span></summary><div class="sb">';
    if(s.fp)h+=fldH(s);
    h+=itH(s);
    if(!s.fp)h+=fldH(s);
    h+='</div></details>';
  });
  h+='<details class="sec" open><summary><span>👍 Ưu điểm &amp; 👎 Nhược điểm</span></summary><div class="sb"><div class="fl"><label>Ưu điểm</label><textarea autocomplete="off" data-lpignore="true" data-1p-ignore data-pc="pr" style="min-height:72px"'+(K.canW?'':' disabled')+' placeholder="Điểm tốt của căn này…">'+esc(S.cur.pr)+'</textarea></div><div class="fl"><label>Nhược điểm</label><textarea autocomplete="off" data-lpignore="true" data-1p-ignore data-pc="co" style="min-height:72px"'+(K.canW?'':' disabled')+' placeholder="Điểm chưa ổn…">'+esc(S.cur.co)+'</textarea></div></div></details>';
  h+='<details class="sec" open><summary><span>⭐ Chấm điểm căn này</span><span class="cnt" id="rtv">'+(S.cur.rt?S.cur.rt+"/5":"")+'</span></summary><div class="sb"><div class="sg" id="rtsg"></div><div class="rts">'+[1,2,3,4,5].map(function(n){return '<button type="button" class="rtb" data-rt="'+n+'" aria-pressed="'+(S.cur.rt===n)+'">'+n+'<small>'+["Tệ","Tạm","Ổn","Tốt","Rất tốt"][n-1]+'</small></button>'}).join("")+'</div><p class="pm" style="margin:6px 0 0">Chạm lại số đang chọn để bỏ chấm.</p></div></details>';
  h+='<details class="sec" open><summary><span>Ghi chú &amp; ảnh đi xem</span></summary><div class="sb"><textarea autocomplete="off" data-lpignore="true" data-1p-ignore data-nt="" style="min-height:96px"'+(K.canW?'':' disabled')+' placeholder="Ghi lỗi, hư hỏng, điều cần nhắc chủ nhà…">'+esc(S.cur.nt)+'</textarea>';
  h+='<div class="fl"><label>Ảnh đi xem (thực tế)</label>'+(K.canW?'<label class="btn upb" for="ckv">📷 Chọn ảnh đi xem từ thiết bị</label><input id="ckv" type="file" accept="image/*" multiple hidden>':'')+'<p class="pm" id="ckvm" style="margin:6px 0 0"></p><div class="pv cph" id="ckvph" style="margin-top:8px"></div><a id="ckvl" class="btn" target="_blank" rel="noopener" hidden style="margin-top:8px">📁 Thư mục ảnh đi xem trên Drive</a></div>';
  h+='<div class="fl"><label>Ảnh lỗi / hư hỏng</label>'+(K.canW?'<label class="btn upb" for="cki">📷 Chọn ảnh hư hỏng từ thiết bị</label><input id="cki" type="file" accept="image/*" multiple hidden>':'')+'<p class="pm" id="ckim" style="margin:6px 0 0"></p><div class="pv cph" id="ckph" style="margin-top:8px"></div><a id="ckil" class="btn" target="_blank" rel="noopener" hidden style="margin-top:8px">📁 Thư mục ảnh lỗi, hư hỏng trên Drive</a></div></div></details>';
  h+='<details class="sec" open><summary><span>Mẹo cuối</span></summary><div class="sb"><ul class="tips">'+TIPS.map(function(t){return '<li>'+esc(t)+'</li>'}).join("")+'</ul></div></details>';
  h+='<button type="button" class="ckx bt" data-ckx>Đóng checklist</button>';
  el.innerHTML=h;
  cknEl=$("ckn");ckbarEl=$("ckbar");rtsgEl=$("rtsg");
  Array.prototype.forEach.call(el.querySelectorAll("[data-sec]"),function(n){secEls[+n.dataset.sec]=n});
  Array.prototype.forEach.call(el.querySelectorAll("[data-part]"),function(n){partEls[+n.dataset.part]=n});
  ckPh();updProg();syncUi();
  if(S.fresh)jumpTop();
}
function syncUi(){
  if(!K)return;
  var bBusy=(S.upN||0)>0||S.upQ.length>0,sBusy=!!(S.dirty||(S.saveN||0)>0);
  var lock=!!(K.canW&&(bBusy||sBusy));
  var lblTop=bBusy?"Đang tải ảnh…":sBusy?"Đang lưu…":"Đóng";
  var lblBot=bBusy?"⏳ Đang tải ảnh…":sBusy?"⏳ Đang lưu…":"Đóng checklist";
  var el=$("ckb");
  if(el){
    var xs=el.querySelectorAll("[data-ckx]");
    for(var i=0;i<xs.length;i++){
      xs[i].disabled=lock;
      if(xs[i].classList.contains("bt"))xs[i].textContent=lblBot;else{xs[i].setAttribute("aria-label",lblTop);xs[i].title=lblTop}
    }
  }
  var st=$("cks");
  if(st){
    if(bBusy){st.textContent="Đang tải "+(S.upN||S.upQ.length)+" ảnh (chưa thể đóng)…";st.style.cursor=""}
    else if((S.saveN||0)>0){st.textContent="Đang lưu…";st.style.cursor=""}
    else if(S.err){st.textContent="Lưu lỗi — chạm để thử lại";st.style.cursor="pointer"}
    else if(S.dirty){st.textContent="Chưa lưu…";st.style.cursor=""}
    else st.style.cursor="";
  }
}
function ckSave(){S.dirty=true;S.err=false;clearTimeout(S.t);S.t=setTimeout(ckFlush,900);syncUi()}
function ckPersist(id,base,x){
  var o=Object.assign({},base,{ck:ckLiteOf(x.s,base.ck&&base.ck.h),rt:x.rt,pr:x.pr,co:x.co});
  return persist(o,x.s).then(function(d){if(d&&d.ch&&d.ch[id]){S.c[id]={h:d.ch[id],ck:x.s};S.a[id]=Date.now();ckcSave()}return d})}
function ckFlush(){
  clearTimeout(S.t);S.t=null;
  if(!S.dirty||!S.id||!S.cur||!K.canW){syncUi();return}
  var it=findItem(S.id);if(!it){syncUi();return}
  S.dirty=false;S.err=false;S.saveN=(S.saveN||0)+1;
  var tq=S.trashQ.splice(0),x=ckSnap(S.cur),id=S.id;
  syncUi();
  S.q=S.q.then(function(){var cur=findItem(id);if(!cur)return null;return ckPersist(id,cur,x)}).then(function(d){
    S.saveN=Math.max(0,(S.saveN||1)-1);
    if(!d){syncUi();return}
    trashIds(tq);
    var s2=$("cks");if(s2&&S.id===id&&!S.dirty&&!S.err)s2.textContent="Đã lưu ✓";
    syncUi();
    if(S.dirty&&S.id===id)ckFlush();
  },function(e){
    S.saveN=Math.max(0,(S.saveN||1)-1);
    S.trashQ=tq.concat(S.trashQ);
    if(S.id===id){S.dirty=true;S.err=true}
    syncUi();
    if(!document.hidden)K.fail(e);
  });
}
function skew(v){
  var m="ck.js (cầu nối v"+KV+") không khớp index.html (v"+v+"). Hãy đóng hẳn rồi mở lại app để cập nhật.";
  try{console.error(m);var d=document.createElement("div");d.textContent=m;d.style.cssText="position:fixed;left:0;right:0;top:0;z-index:99999;padding:10px 14px;background:#b3261e;color:#fff;font:14px/1.4 sans-serif";(document.body||document.documentElement).appendChild(d)}catch(e){}
}
/* Dòng thông báo dưới nút chọn ảnh của từng mục (đi xem / hư hỏng) */
function upMsg(kind,txt,isBad){
  if(!kind)return;var m=$(kind==="view"?"ckvm":"ckim");if(!m)return;
  if(txt==null){var n=upBad.filter(function(u){return u.hid===S.id&&u.k===kind}).length;
    txt=n?n+" ảnh lỗi. Chạm vào ảnh viền đỏ để thử lại, hoặc bấm × để xóa.":"";isBad=!!n}
  m.textContent=txt;m.className="pm"+(isBad?" bad":"")}
/* Tải một lô ảnh lên Drive (phần nén/tải/thử lại nằm ở img.js). Ảnh lỗi giữ lại thành ô đỏ "Lỗi": chạm để thử lại, bấm × để xóa. */
function ckUp(kind,fs){
  if(!(window.Img&&Img.up)){alert("Chưa nạp được img.js (công cụ ảnh). Hãy tải lại trang.");return}
  var cur=S.cur,fn=(findItem(S.id)||{}).n||"",hid=S.id,total=fs.length;
  function say(x,isBad){if(S.cur===cur)upMsg(kind,x,isBad)}
  function dropQ(x){var i=S.upQ.indexOf(x);if(i>-1)S.upQ.splice(i,1)}
  function tag(x){x.hid=hid;x.cur=cur;x.k=kind}
  Img.up.run({files:fs,pre:kind==="view"?"xem-":"loi-",
    payload:function(){var it=findItem(hid)||{};return{folder:fn,area:it.d||"",ward:it.w||"",addr:it.a||"",kind:kind,hid:hid,fid:(kind==="view"?cur.vu:cur.du)||""}},
    begin:function(){S.upN=(S.upN||0)+total;upBusy(total);syncUi();say("Đang tải ảnh 0/"+total+" lên Drive…")},
    say:say,
    queue:function(x){tag(x);S.upQ.push(x);if(S.cur===cur){ckPh();syncUi()}},
    unq:dropQ,
    bad:function(x){tag(x);upBad.push(x)},
    ok:function(x,d,u){
      LP[d.id]=u;PH[kind].nm[d.id]=x.name;
      dropQ(x);
      var tg=(S.id===hid&&S.cur)||cur;
      if(kind==="view"){tg.vi.push(d.id);if(d.url)tg.vu=d.url}
      else{tg.im.push(d.id);if(d.url)tg.du=d.url}
      if(tg!==cur){cur.vi=tg.vi;cur.im=tg.im;cur.vu=tg.vu;cur.du=tg.du}
      if(S.cur===tg){ckPh();ckSave()}else ckSaveOff(hid,tg)
    },
    step:function(done,total2,bad,why){
      S.upN=Math.max(0,(S.upN||1)-1);upBusy(-1);
      if(S.cur===cur)ckPh();
      if(done<total2){say("Đang tải ảnh "+done+"/"+total2+" lên Drive…");syncUi()}
      else{
        var nb=upBad.filter(function(u){return u.hid===hid&&u.k===kind}).length;
        say(nb?nb+" ảnh lỗi ("+why+"). Chạm vào ảnh viền đỏ để thử lại, hoặc bấm × để xóa.":"✓ Đã tải "+total2+" ảnh lên Drive",!!nb);
        if(S.cur===cur){if(total2>bad||S.dirty)ckFlush();else syncUi()}
        else ckSaveOff(hid,cur);
      }
    }})
}
function init(k){
  if(inited||!k)return;
  if(k.v!==KV||!k.S){skew(k.v);return}
  inited=true;K=k;S=k.S;
  $=K.$;
  CK=K.CK;
  LP=K.LP;
  PARTS=K.PARTS;
  TIPS=K.TIPS;
  VW=K.VW;
  ckCopy=K.ckCopy;
  ckLiteOf=K.ckLiteOf;
  ckLoad=K.ckLoad;
  ckSaveOff=K.ckSaveOff;
  ckSnap=K.ckSnap;
  ckStat=K.ckStat;
  ckcSave=K.ckcSave;
  closeCk=K.closeCk;
  esc=K.esc;
  findItem=K.findItem;
  imgSrc=K.imgSrc;
  jumpTop=K.jumpTop;
  openLb=K.openLb;
  persist=K.persist;
  rtgH=K.rtgH;
  trashIds=K.trashIds;
  upBusy=K.upBusy;
  $("ckb").onclick=function(e){
    if(e.target.closest("#cks")&&S.err&&K.canW){S.dirty=true;ckFlush();return}
    if(e.target.closest("[data-ckx]")){closeCk();return}
    if(e.target.closest("[data-ckretry]")){ckLoad(S.id);return}
    var rb=e.target.closest(".rtb");
    if(rb){if(!K.canW||!S.cur)return;var n=+rb.dataset.rt;setRt(S.cur.rt===n?0:n);return}
    var sb=e.target.closest("[data-rts]");
    if(sb){if(!K.canW||!S.cur)return;setRt(+sb.dataset.rts);return}
    var ci=e.target.closest(".ci");
    if(ci){if(!K.canW||!S.cur)return;var id=ci.dataset.i,s=((S.cur.c[id]||0)+1)%3;if(s)S.cur.c[id]=s;else delete S.cur.c[id];ci.dataset.s=s;ci.querySelector(".bx").textContent=["","✓","✕"][s];updProg();ckSave();return}
    var op=e.target.closest(".opt");
    if(op){if(!K.canW||!S.cur)return;var f=op.dataset.fo,o=op.dataset.o;
      if(op.dataset.t==="m"){var a=Array.isArray(S.cur.v[f])?S.cur.v[f]:[],k=a.indexOf(o);if(k>-1)a.splice(k,1);else a.push(o);S.cur.v[f]=a;op.setAttribute("aria-pressed",k<0)}
      else{var on=S.cur.v[f]!==o;S.cur.v[f]=on?o:"";Array.prototype.forEach.call(op.parentNode.children,function(b){b.setAttribute("aria-pressed",on&&b===op)})}
      ckSave();return}
    var bb=e.target.closest("[data-cbad]");
    if(bb&&K.canW){var nm=bb.dataset.cbad,k0="";
      upBad=upBad.filter(function(x){if(x.name!==nm)return true;k0=x.k;if(x.src.indexOf("blob:")===0)URL.revokeObjectURL(x.src);return false});
      ckPh();upMsg(k0);return}
    var et=e.target.closest(".cph .er");
    if(et&&K.canW&&S.cur){var nm2=et.dataset.nm,f=null,k1="";
      upBad=upBad.filter(function(x){if(x.name!==nm2)return true;f=x.file;k1=x.k;if(x.src.indexOf("blob:")===0)URL.revokeObjectURL(x.src);return false});
      if(f){ckPh();ckUp(k1,[f])}return}
    var im=e.target.closest(".cph img");if(im){openLb(im);return}
    var rm=e.target.closest("[data-crm]");if(rm&&K.canW&&S.cur){S.trashQ.push(S.cur.im.splice(+rm.dataset.crm,1)[0]);if(!S.cur.im.length)S.cur.du="";ckPh();ckSave();return}
    var rv2=e.target.closest("[data-vrm]");if(rv2&&K.canW&&S.cur){S.trashQ.push(S.cur.vi.splice(+rv2.dataset.vrm,1)[0]);if(!S.cur.vi.length)S.cur.vu="";ckPh();ckSave()}
  };
  $("ckb").oninput=function(e){var t=e.target;if(!S.cur||!K.canW)return;
    if(t.dataset.f){S.cur.v[t.dataset.f]=t.value;ckSave()}
    else if(t.dataset.pc){S.cur[t.dataset.pc]=t.value;ckSave()}
    else if(t.dataset.nt!=null){S.cur.nt=t.value;ckSave()}};
  $("ckb").onchange=function(e){
    var t=e.target;if((t.id!=="cki"&&t.id!=="ckv")||!K.canW||!S.cur)return;
    var fs=Array.prototype.slice.call(t.files);t.value="";if(!fs.length)return;
    ckUp(t.id==="ckv"?"view":"damage",fs)
  };
  if(K.tab==="ck"&&S.id)ckLoad(S.id);
}
window.Ck={v:KV,init:init,renderCk:renderCk,ckFlush:ckFlush,ckPersist:ckPersist,syncUi:syncUi};
if(window.NK)init(window.NK);
})();
