/* dup.js: công cụ "Kiểm tra trùng" (trùng thông tin và trùng ảnh) cho app Tìm nhà thuê.
   Hoạt động trực tiếp với index.html chỉ cần khai báo window.NT và <script src="dup.js" defer></script>.
   Quy tắc: báo cặp trùng từ 2 điều kiện trở lên, hoặc cặp có trùng ảnh. */
(function(){
"use strict";
var G=function(i){return document.getElementById(i)};
var NT=null,inited=false;
function N(){return NT||window.NT}
function esc(s){return N().esc(s)}
function su(u){return N().su(u)}
function imgSrc(s,w){return N().imgSrc(s,w)}
function addrOf(it){return N().addrOf(it)}
function stName(k){return N().stName(k)}
function fmt(x){return N().fmt(x)}
function ls(k,v){return N().ls(k,v)}
var items=[];
var CSS="#dupl,#dupignl,.dpc,.dprow{min-width:0}\n#dupmain[hidden],#dupignview[hidden],.dpbar2[hidden],.dpdet[hidden],.dpz[hidden]{display:none}\n.dpc{border:1px solid var(--line);border-left:5px solid var(--violet);border-radius:12px;padding:6px 12px 10px;margin-top:8px;background:var(--surface)}\n.dpc.hi{border-left-color:var(--danger)}\n.dprow{display:flex;align-items:center;gap:6px}\n.dprow+.dprow{border-top:1px dashed var(--line)}\n.dpr{display:flex;gap:8px;align-items:center;justify-content:space-between;flex:1;min-width:0;text-align:left;background:none;border:0;padding:8px 0;color:inherit;font:inherit;cursor:pointer}\n.dpt{min-width:0;flex:1;overflow:hidden}.dpt b{display:block;font-size:var(--fs-b);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpt small{display:block;color:var(--mute);font-size:var(--fs-s);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpdel{flex:none;border:1px solid var(--line);background:var(--bg);color:var(--danger);border-radius:8px;padding:4px 9px;min-height:30px;font-size:var(--fs-s);font-weight:600;cursor:pointer;white-space:nowrap}\n.dpdel:hover{background:var(--danger);border-color:var(--danger);color:#fff}\n.dpdel:disabled{opacity:.5;cursor:default}\n.dpw{display:flex;flex-wrap:wrap;gap:4px;margin-top:2px}\n.dpw span{font-size:var(--fs-s);font-weight:600;padding:2px 9px;border-radius:999px;background:var(--bg);border:1px solid var(--line);color:var(--ink)}\n.dpw span.im{background:var(--danger);border-color:var(--danger);color:#fff}\n.dpn[data-tog],.dpw[data-tog]{cursor:pointer}\n.dpm{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:8px}\n.dpm div{display:grid;grid-template-columns:1fr 1fr;gap:2px;cursor:zoom-in}\n.dpm img{width:100%;height:64px;object-fit:cover;border-radius:6px;background:var(--line);display:block}\n.dpbar2{display:flex;flex-wrap:wrap;align-items:center;gap:8px}\n.dpignbtn{border:1px solid var(--s-contact);background:var(--b-contact);color:var(--s-contact);border-radius:999px;padding:4px 12px;min-height:32px;font-size:var(--fs-s);font-weight:700;cursor:pointer}\n.dpignbtn:hover{filter:brightness(.95)}\n.dphead{display:flex;align-items:center;gap:10px;flex-wrap:wrap}\n.dphead h2{margin:0}\n.dphead .btn{min-height:34px;padding:5px 10px}\n.dpsens{display:flex;align-items:center;gap:8px;flex-wrap:wrap}\n.dpsens label{margin:0;white-space:nowrap}\n.dpsens select{width:auto;flex:1;min-width:180px;min-height:36px;padding:4px 8px;font-size:var(--fs-s)}\n.dpb{height:6px;border-radius:3px;background:var(--line);overflow:hidden}\n.dpb i{display:block;height:100%;width:0;background:var(--violet);transition:width .2s}\n.dpc.hi .dpn{color:var(--danger)}\n.dpn{font-size:var(--fs-s);font-weight:700;color:var(--violet);margin:6px 0 0}\n.dpa{margin-top:8px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}\n.dpno{border:1px solid var(--s-contact);background:var(--b-contact);color:var(--s-contact);border-radius:999px;padding:4px 11px;min-height:30px;font-size:var(--fs-s);font-weight:700;cursor:pointer}\n.dpno:hover{filter:brightness(.95)}\n.dpno.undo{color:var(--violet);border-color:var(--violet);background:var(--surface)}\n.dpchk{border:1px solid var(--s-seen);background:var(--b-seen);color:var(--s-seen);border-radius:999px;padding:4px 11px;min-height:30px;font-size:var(--fs-s);font-weight:700;cursor:pointer}\n.dpchk:hover{filter:brightness(.95)}\n.dpchk:disabled{opacity:.6;cursor:default}\n.dpv{font-size:var(--fs-s);font-weight:600;margin-left:auto}\n.dpst{margin:6px 0 0;font-size:var(--fs-s);color:var(--mute)}\n.dpst.ok{color:var(--s-won);font-weight:700}\n.dpst.bad{color:var(--danger);font-weight:700}\n.dpdet{margin-top:8px;padding-top:8px;border-top:1px dashed var(--line)}\n.dpfs{display:grid;gap:6px}\n.dpf{border:1px solid var(--line);border-radius:8px;padding:6px 8px;background:var(--bg)}\n.dpf.hit{border-color:var(--violet);background:var(--surface)}\n.dpfl{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:4px}\n.dpfl b{font-size:var(--fs-s)}\n.dptag{font-size:11px;font-weight:700;padding:1px 7px;border-radius:999px;background:var(--violet);color:#fff}\n.dpfc{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:var(--fs-s)}\n.dpfc small{display:block;color:var(--mute);font-size:11px}\n.dpfc span{display:block;overflow-wrap:anywhere;word-break:break-word}\n.dpfc a{color:var(--violet);text-decoration:underline;overflow-wrap:anywhere;word-break:break-all}\n.dpe{color:var(--mute);font-style:italic}\n.dpi{margin-top:8px}\n.dpil{margin:0 0 6px;font-size:var(--fs-s);font-weight:700;color:var(--danger)}\n.dpig{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px}\n.dpip{border:1px solid var(--line);border-radius:8px;padding:4px;background:var(--bg);cursor:zoom-in;text-align:center;font:inherit;color:inherit}\n.dpip span{display:grid;grid-template-columns:1fr 1fr;gap:2px}\n.dpip img{width:100%;height:72px;object-fit:cover;border-radius:5px;background:var(--line);display:block}\n.dpip small{display:block;margin-top:3px;font-size:11px;color:var(--mute)}\n.dpz{position:fixed;inset:0;z-index:20;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;padding:12px}\n.dpzb{background:var(--surface);color:var(--ink);border-radius:12px;padding:12px;width:min(680px,100%);max-height:90vh;overflow:auto}\n.dpzt{margin:0 0 8px;font-weight:700;font-size:var(--fs-b);text-align:center}\n.dpzg{display:grid;grid-template-columns:1fr 1fr;gap:8px}\n.dpzg img{width:100%;max-height:60vh;object-fit:contain;border-radius:8px;background:var(--bg);display:block}\n.dpzg small{display:block;margin-top:4px;font-size:var(--fs-s);color:var(--mute);text-align:center}\n";
var DLG="<dialog id=\"dupd\"><div class=\"form\" id=\"dupmain\">\n  <h2>Kiểm tra trùng</h2>\n  <p class=\"pm\" id=\"dupsum\"></p>\n  <div class=\"dpbar2\" id=\"duplinks\" hidden><button type=\"button\" class=\"link\" id=\"duptog\" hidden></button><button type=\"button\" class=\"dpignbtn\" id=\"dupigntog\" hidden></button></div>\n  <p class=\"pm\">Hiển thị cặp trùng từ 2 điều kiện trở lên (hoặc có trùng ảnh) trong: link tin đăng, link Maps, SĐT chủ, SĐT sale, địa chỉ, tên, giá + diện tích, ảnh. Quét ảnh sẽ tải ảnh thu nhỏ của tất cả căn nên tốn dữ liệu và mất một lúc.</p>\n  <div class=\"dpsens\"><label for=\"dupsens\">Độ nhạy quét ảnh:</label><select id=\"dupsens\"><option value=\"18\">Vừa (18/128 bit — ít nhầm)</option><option value=\"26\" selected>Nhạy (26/128 bit — khuyên dùng)</option><option value=\"34\">Rất nhạy (34/128 bit — bắt cả cắt / lật ảnh)</option></select></div>\n  <div class=\"foot2\"><button class=\"btn p\" type=\"button\" id=\"dupimg\">Quét ảnh trùng</button><button class=\"btn\" type=\"button\" id=\"dupstop\" hidden>Dừng</button></div>\n  <div class=\"dpb\" id=\"dupbar\" hidden><i></i></div>\n  <p class=\"pm\" id=\"dupm\" role=\"status\"></p>\n  <div id=\"dupl\"></div>\n  <div class=\"foot\"><button class=\"btn p\" type=\"button\" id=\"dupx\">Đóng</button></div>\n</div><div class=\"form\" id=\"dupignview\" hidden>\n  <div class=\"dphead\"><button type=\"button\" class=\"btn\" id=\"dupback\">← Quay lại</button><h2>Không phải trùng</h2></div>\n  <p class=\"pm\" id=\"dupignsum\"></p>\n  <button type=\"button\" class=\"link\" id=\"dupignclr\" hidden>Khôi phục tất cả về danh sách kiểm tra</button>\n  <div id=\"dupignl\"></div>\n  <div class=\"foot\"><button class=\"btn\" type=\"button\" id=\"dupback2\">← Quay lại</button><button class=\"btn p\" type=\"button\" id=\"dupx2\">Đóng</button></div>\n</div><div class=\"dpz\" id=\"dupz\" hidden><div class=\"dpzb\"><p class=\"dpzt\" id=\"dupzt\"></p><div class=\"dpzg\"><div><img id=\"dupz1\" alt=\"Ảnh căn 1\"><small id=\"dupz1n\"></small></div><div><img id=\"dupz2\" alt=\"Ảnh căn 2\"><small id=\"dupz2n\"></small></div></div><div class=\"foot\"><button class=\"btn p\" type=\"button\" id=\"dupzx\">Đóng</button></div></div></div></dialog>";
var TH=26,MIN=2,imgPairs=null,scanning=false,stopFlag=false,cache={},cacheLoaded=false,LIMIT=50,limMain=50,limIgn=50,memo=null,inflight={},neg={},syncT=0,showOne=false,showIgn=false,viewList=[],openSet={},ignored={},ignLoaded=false,pairImgMsg={};

/* ---------- Lưu danh sách "không phải trùng" vào localStorage ---------- */
function loadIgnored(){if(ignLoaded)return;ignLoaded=true;try{ignored=JSON.parse(ls("dign1")||"{}")||{}}catch(e){ignored={}}}
function saveIgnored(){try{ls("dign1",JSON.stringify(ignored))}catch(e){}}
function canWrite(){if(N()&&N().canW)return !!N().canW();var b=G("bnow");return b?!b.hidden:true}

/* ---------- Chuẩn hoá ---------- */
function nd(s){return String(s==null?"":s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/[^a-z0-9]+/g," ").trim()}
function pn(s){var d=String(s||"").replace(/\D/g,"");if(d.indexOf("84")===0&&d.length>=11)d="0"+d.slice(2);if(d.length===9&&d.charAt(0)!=="0")d="0"+d;return d.length>=9?d:""}
function ln(u){u=su(u);if(!u)return"";u=u.toLowerCase().replace(/^https?:\/\/(www\.|m\.)?/,"").replace(/#.*$/,"");var p=u.split("?"),b=p[0].replace(/\/+$/,""),q=(p[1]||"").split("&").filter(function(x){return x&&!/^(utm_|fbclid|gclid|zarsrc|ref=)/.test(x)}).sort().join("&");return b+(q?"?"+q:"")}
/* mã tin: cùng website + cùng dãy số dài cuối đường dẫn (khác slug vẫn nhận ra) */
function lid(u){u=ln(u);if(!u)return"";var h=u.split("/")[0],m=u.split("?")[0].match(/\d{6,}/g);return m?h+"#"+m[m.length-1]:""}
function nw(s){return nd(s).replace(/^(thanh pho|thi xa|thi tran|phuong|quan|huyen|xa|tp|p|q)(?=\s|\d|$)\s*/,"").replace(/^0+(?=\d)/,"")}
var STOP={so:1,nha:1,duong:1,d:1,hem:1,ngo:1,ngach:1,kiet:1,p:1,phuong:1,q:1,quan:1,xa:1,hcm:1,tphcm:1,tp:1};
function addrKey(it){var t=nd(it.a).replace(/\b(thanh pho ho chi minh|tp ho chi minh|ho chi minh)\b/g," ").split(" ").filter(function(w){return w&&!STOP[w]});
  var hasNum=t.some(function(w){return/\d/.test(w)}),hasWord=t.some(function(w){return/^[a-z]{2,}$/.test(w)});
  return hasNum&&hasWord?t.join(" "):""}
function feat(it){var nm=nd(it.n),set=Object.create(null),k=0;nm.split(" ").forEach(function(w){if(w&&!set[w]){set[w]=1;k++}});
  return{it:it,lk:ln(it.lk),li:lid(it.lk),mp:ln(it.mp),ph:pn(it.ph),sp:pn(it.sp),ad:addrKey(it),w:nw(it.w),d:nw(it.d),nm:nm,ns:set,nk:k,p:it.p,ar:it.ar}}
/* ---------- So từng cặp: mỗi điều kiện khớp được tính 1 ---------- */
function compat(x,y){return(!x.w||!y.w||x.w===y.w)&&(!x.d||!y.d||x.d===y.d)}
function sameArea(x,y){return(x.w&&x.w===y.w)||(x.d&&x.d===y.d)}
function nameSim(x,y){if(!x.nm||!y.nm)return false;if(x.nm===y.nm)return x.nm.length>=6;
  if(x.nk<3||y.nk<3)return false;var c=0;for(var w in x.ns)if(y.ns[w])c++;return c/(x.nk+y.nk-c)>=0.8}
function cmp(x,y){var w=[];
  if(x.lk&&(x.lk===y.lk||(x.li&&x.li===y.li)))w.push("Cùng link tin đăng");
  if(x.mp&&x.mp===y.mp)w.push("Cùng link Google Maps");
  if(x.ph&&x.ph===y.ph)w.push("Cùng SĐT chủ nhà");
  if(x.sp&&x.sp===y.sp)w.push("Cùng SĐT sale");
  if(x.ad&&x.ad===y.ad&&compat(x,y))w.push("Cùng địa chỉ");
  if(compat(x,y)&&nameSim(x,y))w.push("Tên giống nhau");
  if(x.p!=null&&y.p!=null&&x.ar&&y.ar&&Math.abs(x.p-y.p)<=0.05&&Math.abs(x.ar-y.ar)<=1&&compat(x,y)&&sameArea(x,y))w.push("Giá + diện tích giống nhau");
  return w}
function addP(P,a,b,why){if(a.id===b.id)return;var lo=a.id<b.id?a:b,hi=a.id<b.id?b:a,k=lo.id+"|"+hi.id,o=P[k]||(P[k]={a:lo,b:hi,why:[],img:[]});if(why&&o.why.indexOf(why)<0)o.why.push(why);return o}
function cleanImgPairs(){
  if(!imgPairs)return;
  var byId={};items.forEach(function(it){byId[it.id]=it});
  imgPairs=imgPairs.filter(function(r){
    var a=byId[r.a.id],b=byId[r.b.id];
    if(!a||!b)return false;
    if((a.im||[]).indexOf(r.x)<0||(b.im||[]).indexOf(r.y)<0)return false;
    r.a=a;r.b=b;return true;
  });
}
var WT={"Cùng link tin đăng":2};
function sc(o){var t=0;o.why.forEach(function(l){t+=WT[l]||1});return t}
function sigOf(it){return[it.id,it.n,it.a,it.w,it.d,it.p,it.ar,it.lk,it.mp,it.ph,it.sp].join("\u0001")}
/* Phần so thông tin là O(n²): chỉ tính lại khi dữ liệu liên quan thật sự đổi (không tính lại khi mở/ẩn, đánh dấu, kiểm tra ảnh) */
function textPairs(){
  var sig=items.map(sigOf).join("\u0002");
  if(memo&&memo.sig===sig)return memo.list;
  var F=items.map(feat),out=[],i,j,w,a,b;
  for(i=0;i<F.length;i++)for(j=i+1;j<F.length;j++){w=cmp(F[i],F[j]);if(w.length){a=F[i].it;b=F[j].it;out.push(a.id<b.id?{a:a.id,b:b.id,why:w}:{a:b.id,b:a.id,why:w})}}
  memo={sig:sig,list:out};return out}
function build(){
  loadIgnored();
  var P={},byId={};
  items.forEach(function(it){byId[it.id]=it});
  textPairs().forEach(function(t){var a=byId[t.a],b=byId[t.b];if(a&&b)P[t.a+"|"+t.b]={a:a,b:b,why:t.why.slice(),img:[]}});
  if(imgPairs)imgPairs.forEach(function(r){var o=addP(P,byId[r.a.id]||r.a,byId[r.b.id]||r.b,"img");if(!o)return;var sw=o.a.id!==r.a.id;o.img.push(sw?{x:r.y,y:r.x,d:r.d}:{x:r.x,y:r.y,d:r.d})});
  var all=Object.keys(P).map(function(k){var o=P[k];o.sc=sc(o);return o}).sort(function(a,b){return b.sc-a.sc||b.img.length-a.img.length});
  var active=[],ign=[];
  all.forEach(function(p){if(ignored[p.a.id+"|"+p.b.id])ign.push(p);else active.push(p)});
  return{
    strong:active.filter(function(o){return o.sc>=MIN||o.img.length>0}),
    weak:active.filter(function(o){return o.sc<MIN&&!o.img.length}),
    ign:ign
  }}
function pc(x){x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return(((x+(x>>>4))&0x0f0f0f0f)*0x01010101)>>>24}
function simText(d){return d===0?"Giống 100%":"Giống "+Math.round((128-d)/128*100)+"% (lệch "+d+"/128 bit)"}
function txtH(v){return v?esc(v):'<span class="dpe">Không có</span>'}
function linkH(u){var s=su(u);if(s)return'<a href="'+esc(s)+'" target="_blank" rel="noopener noreferrer">'+esc(s)+'</a>';return txtH(u)}
function paText(it){var a=[];if(it.p!=null)a.push(fmt(it.p)+" tr");if(it.ar)a.push(fmt(it.ar)+" m²");return a.join(" · ")}
function detailH(o,idx){
  function hasWhy(lb){return o.why.indexOf(lb)>=0}
  var rows=[
    {k:"Tên căn",hit:hasWhy("Tên giống nhau"),a:txtH(o.a.n),b:txtH(o.b.n)},
    {k:"Địa chỉ",hit:hasWhy("Cùng địa chỉ"),a:txtH(addrOf(o.a)||o.a.a),b:txtH(addrOf(o.b)||o.b.a)},
    {k:"Giá & diện tích",hit:hasWhy("Giá + diện tích giống nhau"),a:txtH(paText(o.a)),b:txtH(paText(o.b))},
    {k:"SĐT chủ nhà",hit:hasWhy("Cùng SĐT chủ nhà"),a:txtH(o.a.ph),b:txtH(o.b.ph)},
    {k:"SĐT sale",hit:hasWhy("Cùng SĐT sale"),a:txtH(o.a.sp),b:txtH(o.b.sp)},
    {k:"Link tin đăng",hit:hasWhy("Cùng link tin đăng"),a:linkH(o.a.lk),b:linkH(o.b.lk)},
    {k:"Link Google Maps",hit:hasWhy("Cùng link Google Maps"),a:linkH(o.a.mp),b:linkH(o.b.mp)},
    {k:"Trạng thái",hit:false,a:txtH(stName(o.a.st||"new")),b:txtH(stName(o.b.st||"new"))}
  ];
  rows.sort(function(x,y){return(y.hit?1:0)-(x.hit?1:0)});
  var h='<div class="dpfs">';
  rows.forEach(function(r){
    h+='<div class="dpf'+(r.hit?' hit':'')+'"><div class="dpfl"><b>'+esc(r.k)+'</b>'+(r.hit?'<span class="dptag">Trùng</span>':'')+'</div><div class="dpfc"><div><small>Căn 1</small><span>'+r.a+'</span></div><div><small>Căn 2</small><span>'+r.b+'</span></div></div></div>';
  });
  h+='</div>';
  if(o.img.length){
    h+='<div class="dpi"><p class="dpil">Ảnh giống nhau ('+o.img.length+' cặp — bấm vào ảnh để phóng to)</p><div class="dpig">';
    o.img.forEach(function(m,i){
      h+='<button type="button" class="dpip" data-zoom="'+idx+':'+i+'"><span><img alt="Ảnh căn 1" loading="lazy" src="'+esc(imgSrc(m.x,300))+'"><img alt="Ảnh căn 2" loading="lazy" src="'+esc(imgSrc(m.y,300))+'"></span><small>'+esc(simText(m.d))+'</small></button>';
    });
    h+='</div></div>';
  }
  return h;
}
function rowH(it,idx,side,allowDel){
  var k=it.st||"new",ad=addrOf(it);
  return '<div class="dprow"><button type="button" class="dpr" data-open="'+esc(it.id)+'"><span class="dpt"><b>'+esc(it.n)+'</b><small>'+esc(ad||"Chưa có địa chỉ")+(it.p!=null?" · "+fmt(it.p)+" tr":"")+(it.ar?" · "+fmt(it.ar)+" m²":"")+'</small></span><span class="pill" style="--c:var(--s-'+k+');--bg2:var(--b-'+k+')">'+esc(stName(k))+'</span></button>'+(allowDel?'<button type="button" class="dpdel" data-del="'+idx+':'+side+'" title="Xóa căn này" aria-label="Xóa căn '+esc(it.n)+'">Xóa</button>':'')+'</div>'}
function pairH(o,idx,isIgn){
  var n=o.why.length,s=o.sc||0,k=o.a.id+"|"+o.b.id,isOpen=!!openSet[k],allowDel=canWrite(),st=pairImgMsg[k];
  var lbl=s>=3?"Gần như chắc chắn trùng":s>=2?"Có thể trùng":o.img.length?"Trùng ảnh":"Chỉ trùng 1 điều kiện";
  var h='<div class="dpc'+(s>=3&&!isIgn?" hi":"")+'">'+rowH(o.a,idx,"a",allowDel)+rowH(o.b,idx,"b",allowDel)+'<p class="dpn" data-tog="'+idx+'">'+lbl+(n>1?' ('+n+' điều kiện)':'')+'</p><div class="dpw" data-tog="'+idx+'" title="Bấm để xem thông tin trùng">';
  o.why.forEach(function(w){if(w!=="img")h+='<span>'+esc(w)+'</span>'});
  if(o.img.length)h+='<span class="im">'+o.img.length+' ảnh giống nhau</span>';
  h+='</div>';
  if(o.img.length)h+='<div class="dpm">'+o.img.slice(0,3).map(function(m,i){return '<div data-zoom="'+idx+':'+i+'" title="Bấm để phóng to"><img alt="Ảnh căn 1" loading="lazy" src="'+esc(imgSrc(m.x,200))+'"><img alt="Ảnh căn 2" loading="lazy" src="'+esc(imgSrc(m.y,200))+'"></div>'}).join("")+'</div>';
  h+='<div class="dpa">';
  if(isIgn)h+='<button type="button" class="dpno undo" data-unign="'+idx+'">Khôi phục nghi trùng</button>';
  else h+='<button type="button" class="dpno" data-ign="'+idx+'">Không phải trùng</button>';
  h+='<button type="button" class="dpchk" data-chkimg="'+idx+'"'+(st&&st.busy?' disabled':'')+'>'+(st&&st.busy?'Đang kiểm tra…':'Kiểm tra ảnh')+'</button>';
  h+='<button type="button" class="link dpv" data-tog="'+idx+'">'+(isOpen?"Ẩn thông tin trùng":"Xem thông tin trùng")+'</button></div>';
  if(st&&st.text)h+='<p class="dpst'+(st.ok?' ok':st.bad?' bad':'')+'">'+esc(st.text)+'</p>';
  h+='<div class="dpdet"'+(isOpen?"":" hidden")+'>'+(isOpen?detailH(o,idx):"")+'</div>';
  return h+'</div>'}
function render(){
  var r=build(),list=showOne?r.strong.concat(r.weak):r.strong,el=G("dupl"),n=items.length,hi=r.strong.filter(function(o){return o.sc>=3}).length,tg=G("duptog"),itg=G("dupigntog"),ignEl=G("dupignl");
  viewList=[];
  G("dupmain").hidden=showIgn;
  G("dupignview").hidden=!showIgn;
  if(showIgn){
    el.innerHTML="";
    G("dupignsum").textContent=r.ign.length?"Có "+r.ign.length+" cặp đã đánh dấu không phải trùng (lưu trên máy này). Bấm Khôi phục nghi trùng để đưa lại vào danh sách kiểm tra.":"Không còn cặp nào đã đánh dấu không phải trùng.";
    G("dupignclr").hidden=r.ign.length<2;
    if(r.ign.length){
      var ignSlice=r.ign.slice(0,limIgn);
      ignEl.innerHTML=ignSlice.map(function(o){var idx=viewList.push(o)-1;return pairH(o,idx,true)}).join("")+(r.ign.length>limIgn?'<button type="button" class="link" data-more="ign">Hiện thêm '+Math.min(LIMIT,r.ign.length-limIgn)+' cặp (còn '+(r.ign.length-limIgn)+')</button>':'');
    }else{
      ignEl.innerHTML="";
    }
    return;
  }
  ignEl.innerHTML="";
  var mainSlice=list.slice(0,limMain);
  var mainHtml=mainSlice.map(function(o){var idx=viewList.push(o)-1;return pairH(o,idx,false)}).join("")+(list.length>limMain?'<button type="button" class="link" data-more="main">Hiện thêm '+Math.min(LIMIT,list.length-limMain)+' cặp (còn '+(list.length-limMain)+')</button>':'');
  G("dupsum").textContent=!n?"Chưa có căn nào để kiểm tra.":r.strong.length?"Có "+r.strong.length+" cặp nghi trùng"+(hi?" ("+hi+" cặp gần như chắc chắn)":"")+" trong "+n+" căn. Chạm vào căn để mở chi tiết, hoặc bấm Xem thông tin trùng để đối chiếu.":"Không có cặp nào trùng từ 2 điều kiện trở lên hoặc trùng ảnh trong "+n+" căn"+(imgPairs?" (đã tính cả ảnh).":".");
  tg.hidden=!r.weak.length;tg.textContent=showOne?"Ẩn "+r.weak.length+" cặp chỉ trùng 1 điều kiện":"Hiện thêm "+r.weak.length+" cặp chỉ trùng 1 điều kiện";
  itg.hidden=!r.ign.length;itg.textContent="Xem danh sách không phải trùng ("+r.ign.length+") →";
  G("duplinks").hidden=tg.hidden&&itg.hidden;
  el.innerHTML=mainHtml}
function togglePair(el){
  var idx=+el.dataset.tog,o=viewList[idx];if(!o)return;
  var k=o.a.id+"|"+o.b.id;openSet[k]=!openSet[k];
  var card=el.closest(".dpc");if(!card)return;
  var btn=card.querySelector(".dpv"),det=card.querySelector(".dpdet");
  if(btn)btn.textContent=openSet[k]?"Ẩn thông tin trùng":"Xem thông tin trùng";
  if(det){if(openSet[k]){det.innerHTML=detailH(o,idx);det.hidden=false}else det.hidden=true}}
function ignorePair(el,val){
  var idx=+(val?el.dataset.ign:el.dataset.unign),o=viewList[idx];if(!o)return;
  loadIgnored();
  var k=o.a.id+"|"+o.b.id;
  if(val){ignored[k]=Date.now();delete openSet[k]}else delete ignored[k];
  saveIgnored();render()}
function checkPairImg(el){
  var idx=+el.dataset.chkimg,o=viewList[idx];if(!o)return;
  var k=o.a.id+"|"+o.b.id;
  if(pairImgMsg[k]&&pairImgMsg[k].busy)return;
  var aIm=(o.a.im||[]).filter(Boolean),bIm=(o.b.im||[]).filter(Boolean);
  if(!aIm.length||!bIm.length){
    pairImgMsg[k]={text:"Chưa đủ ảnh để kiểm tra (Căn 1: "+aIm.length+" ảnh · Căn 2: "+bIm.length+" ảnh)."};
    render();return;
  }
  loadCache();
  pairImgMsg[k]={busy:true,text:"Đang kiểm tra "+aIm.length+" ảnh vs "+bIm.length+" ảnh…"};
  render();
  var uniq={},list=[];
  aIm.concat(bIm).forEach(function(s){if(!uniq[s]){uniq[s]=1;list.push(s)}});
  var map={},bad=0,pos=0;
  function worker(){
    if(pos>=list.length)return Promise.resolve();
    var s=list[pos++];
    return hashOf(s).then(function(h){if(h)map[s]=parseH(h);else if(h===null)bad++}).then(worker)}
  Promise.all([worker(),worker(),worker(),worker()]).then(function(){
    saveCache();
    var found=[],seen={},i,j,sa,sb,ha,hb,d;
    for(i=0;i<aIm.length;i++){
      sa=aIm[i];ha=map[sa];
      for(j=0;j<bIm.length;j++){
        sb=bIm[j];hb=map[sb];
        if(sa!==sb&&(!ha||!hb))continue;
        d=sa===sb?0:bestDist(ha,hb);
        if(d<=TH){
          var pk=sa+"|"+sb;
          if(!seen[pk]){seen[pk]=1;found.push({a:o.a,b:o.b,x:sa,y:sb,d:d})}
        }
      }
    }
    imgPairs=(imgPairs||[]).filter(function(r){
      return !((r.a.id===o.a.id&&r.b.id===o.b.id)||(r.a.id===o.b.id&&r.b.id===o.a.id));
    }).concat(found);
    if(found.length){
      pairImgMsg[k]={ok:true,text:"Tìm thấy "+found.length+" cặp ảnh giống nhau"+(bad?" ("+bad+" ảnh không đọc được)":"")+"."};
    }else if(bad&&bad===list.length){
      pairImgMsg[k]={bad:true,text:"Không đọc được ảnh của 2 căn này (trình duyệt chặn Drive hoặc mất mạng)."};
    }else{
      pairImgMsg[k]={text:"Không trùng ảnh ("+aIm.length+" vs "+bIm.length+" ảnh"+(bad?", "+bad+" ảnh lỗi":"")+"; ngưỡng lệch ≤ "+TH+"/128 bit)."};
    }
    render();
  })}
function afterDel(id){
  loadIgnored();var changed=false;
  Object.keys(ignored).forEach(function(k){var ids=k.split("|");if(ids[0]===id||ids[1]===id){delete ignored[k];changed=true}});
  if(changed)saveIgnored();
  sync()}
function delItem(el){
  var p=String(el.dataset.del||"").split(":"),o=viewList[+p[0]],it=o&&o[p[1]];
  if(!it)return;
  if(!canWrite()){alert("Bạn chỉ có quyền xem, không thể xóa.");return}
  if(N().del){
    if(!confirm('Xóa căn "'+it.n+'"? Thư mục ảnh của căn trên Drive cũng sẽ được chuyển vào thùng rác.'))return;
    el.disabled=true;el.textContent="Đang xóa…";
    N().del(it.id).then(function(){afterDel(it.id)},function(){if(document.contains(el)){el.disabled=false;el.textContent="Xóa"}});
    return;
  }
  /* Dùng trực tiếp luồng Xóa có sẵn của index.html khi window.NT chưa khai báo del */
  var dv=G("dv"),dlg=G("dlg");
  if(!dv||!dlg||!N().openDv){alert("Không thể xóa từ hộp thoại này.");return}
  dv.style.visibility="hidden";dlg.style.visibility="hidden";
  try{
    N().openDv(it.id);
    var ed=dv.querySelector("[data-dvedit]");
    if(!ed){if(dv.open)dv.close();alert("Bạn chỉ có quyền xem, không thể xóa.");return}
    ed.click();
    var dbtn=G("del");
    if(dbtn)dbtn.click();
    if(dlg.open)dlg.close();
  }finally{
    dv.style.visibility="";dlg.style.visibility="";
  }
  if(!N().items().some(function(x){return x.id===it.id}))afterDel(it.id)}
function openZoom(val){
  var p=String(val||"").split(":"),o=viewList[+p[0]],m=o&&o.img[+p[1]];if(!m)return;
  G("dupzt").textContent=simText(m.d);
  G("dupz1n").textContent=o.a.n||"Căn 1";
  G("dupz2n").textContent=o.b.n||"Căn 2";
  G("dupz1").src=imgSrc(m.x,800);
  G("dupz2").src=imgSrc(m.y,800);
  G("dupz").hidden=false}
function closeZoom(){var z=G("dupz");if(z&&!z.hidden){z.hidden=true;return true}return false}
function msg(t,bad){var m=G("dupm");m.textContent=t||"";m.className="pm"+(bad?" bad":"")}
function loadCache(){if(cacheLoaded)return;cacheLoaded=true;ls("dhc1","");ls("dhc2","");try{cache=JSON.parse(ls("dhc3")||"{}")||{}}catch(e){cache={}}}
function saveCache(){try{var k=Object.keys(cache);if(k.length>6000){var n={};k.slice(-4000).forEach(function(x){n[x]=cache[x]});cache=n}ls("dhc3",JSON.stringify(cache))}catch(e){}}
/* Băm 2 chiều (ngang + dọc, 128 bit) trên 3 biến thể: toàn ảnh | trung tâm 75% | lật ngang */
function dhash(cx){
  var d=cx.getImageData(0,0,9,9).data,g=[],i,x,y,bh="",bv="",b,hx="";
  for(i=0;i<81;i++)g.push(d[i*4]*.299+d[i*4+1]*.587+d[i*4+2]*.114);
  for(y=0;y<8;y++)for(x=0;x<8;x++){bh+=g[y*9+x]>g[y*9+x+1]?"1":"0";bv+=g[y*9+x]>g[(y+1)*9+x]?"1":"0"}
  b=bh+bv;
  var ones=b.split("1").length-1;
  if(ones<12||ones>116)return"";   /* ảnh gần như một màu: bỏ qua */
  for(i=0;i<128;i+=4)hx+=parseInt(b.substr(i,4),2).toString(16);
  return hx}
function hashOf(s){
  if(cache[s])return Promise.resolve(cache[s]==="0"?"":cache[s]);
  if(neg[s]&&Date.now()-neg[s]<60000)return Promise.resolve(null);
  if(inflight[s])return inflight[s];
  var p=new Promise(function(res){
    var im=new Image(),done=false,src=imgSrc(s,64);
    if(src.indexOf("https://lh3.googleusercontent.com/")===0){im.crossOrigin="anonymous";src+="?dh=1"}
    var t=setTimeout(function(){fin(null)},15000);
    function fin(h){if(done)return;done=true;clearTimeout(t);im.onload=im.onerror=null;
      if(h===null)neg[s]=Date.now();else if(String(s).indexOf("data:")!==0)cache[s]=h===""?"0":h;
      delete inflight[s];res(h)}
    im.onload=function(){try{
      var iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;
      if(!iw||!ih)return fin("");
      var cv=document.createElement("canvas");cv.width=9;cv.height=9;var cx=cv.getContext("2d",{willReadFrequently:true});
      cx.drawImage(im,0,0,9,9);var hf=dhash(cx);
      cx.clearRect(0,0,9,9);cx.drawImage(im,iw*0.125,ih*0.125,iw*0.75,ih*0.75,0,0,9,9);var hc=dhash(cx);
      cx.save();cx.clearRect(0,0,9,9);cx.translate(9,0);cx.scale(-1,1);cx.drawImage(im,0,0,9,9);cx.restore();var hm=dhash(cx);
      if(!hf&&!hc)return fin("");
      fin((hf||"")+"|"+(hc||"")+"|"+(hm||""))}catch(e){fin(null)}};
    im.onerror=function(){fin(null)};
    im.src=src});
  inflight[s]=p;return p}
function parseH(str){
  if(!str)return null;
  var p=String(str).split("|");
  function seg(x){return x&&x.length===32?[0,8,16,24].map(function(o){return parseInt(x.slice(o,o+8),16)>>>0}):null}
  var f=seg(p[0]),c=seg(p[1]),m=seg(p[2]);
  return(f||c)?{f:f,c:c,m:m}:null}
function dist(a,b){return pc(a[0]^b[0])+pc(a[1]^b[1])+pc(a[2]^b[2])+pc(a[3]^b[3])}
function bestDist(A,B){
  var best=999,d;
  if(A.f&&B.f){d=dist(A.f,B.f);if(d<best)best=d}
  if(A.c&&B.c){d=dist(A.c,B.c);if(d<best)best=d}
  if(A.f&&B.c){d=dist(A.f,B.c);if(d<best)best=d}
  if(A.c&&B.f){d=dist(A.c,B.f);if(d<best)best=d}
  if(A.f&&B.m){d=dist(A.f,B.m);if(d<best)best=d}
  return best}
function matchJobs(jobs,Hm){
  var out=[],seen={},i,j,A=jobs.map(function(x){return Hm[x.s]}),d,k;
  for(i=0;i<jobs.length;i++)for(j=i+1;j<jobs.length;j++){
    if(jobs[i].it.id===jobs[j].it.id)continue;
    if(jobs[i].s===jobs[j].s)d=0;
    else if(A[i]&&A[j])d=bestDist(A[i],A[j]);else continue;
    if(d<=TH){k=jobs[i].it.id+"|"+jobs[j].it.id+"|"+jobs[i].s+"|"+jobs[j].s;if(!seen[k]){seen[k]=1;out.push({a:jobs[i].it,b:jobs[j].it,x:jobs[i].s,y:jobs[j].s,d:d})}}}
  return out}
function rescanFromCache(){
  if(scanning||imgPairs===null)return;
  loadCache();
  var jobs=[],Hm={};
  items.forEach(function(it){(it.im||[]).forEach(function(s){if(s){jobs.push({it:it,s:s});if(cache[s]&&cache[s]!=="0"&&!Hm[s])Hm[s]=parseH(cache[s])}})});
  imgPairs=matchJobs(jobs,Hm);
  pairImgMsg={};
  msg("Đã cập nhật theo độ nhạy mới (lệch ≤ "+TH+"/128 bit): tìm thấy "+imgPairs.length+" cặp ảnh giống nhau.");
  render()}
function scan(){
  if(scanning){msg("Lần quét trước đang dừng, thử lại sau giây lát.");return}
  loadCache();neg={};
  var jobs=[];items.forEach(function(it){(it.im||[]).forEach(function(s){if(s)jobs.push({it:it,s:s})})});
  if(jobs.length<2){msg("Chưa đủ ảnh để so sánh.");return}
  var urls=[],seenU={};jobs.forEach(function(j){if(!seenU[j.s]){seenU[j.s]=1;urls.push(j.s)}});
  scanning=true;stopFlag=false;G("dupimg").disabled=true;G("dupstop").hidden=false;G("dupbar").hidden=false;
  var done=0,bad=0,idx=0,Hm={},bar=G("dupbar").firstChild;
  function upd(){bar.style.width=(done/urls.length*100)+"%";msg("Đang đọc ảnh "+done+"/"+urls.length+(bad?" ("+bad+" ảnh không đọc được)":"")+"…")}
  function worker(){
    if(stopFlag||idx>=urls.length)return Promise.resolve();
    var u=urls[idx++];
    return hashOf(u).then(function(h){if(h)Hm[u]=parseH(h);else if(h===null)bad++;done++;if(done%100===0)saveCache();if(done%5===0||done===urls.length)upd()}).then(worker)}
  upd();
  Promise.all([worker(),worker(),worker(),worker()]).then(function(){
    saveCache();
    var out=matchJobs(jobs,Hm);
    imgPairs=out;pairImgMsg={};
    scanning=false;G("dupimg").disabled=false;G("dupstop").hidden=true;G("dupbar").hidden=true;
    var ok=urls.length-bad;
    if(stopFlag)msg("Đã dừng. Kết quả tính trên "+ok+" ảnh đã đọc.");
    else if(bad&&bad>=urls.length*0.8)msg("Hầu hết ảnh không đọc được (trình duyệt chặn đọc ảnh Drive hoặc mất mạng), nên chưa so sánh ảnh được. Kết quả bên dưới chỉ theo thông tin và mã ảnh.",1);
    else if(!out.length)msg("Đã so "+ok+" ảnh"+(bad?" ("+bad+" ảnh không đọc được)":"")+": không tìm thấy ảnh nào trùng nhau (ngưỡng giống nhau: lệch ≤ "+TH+"/128 bit). Ảnh chụp lại cùng một căn từ góc khác có thể không bị bắt.");
    else msg("Đã so "+ok+" ảnh"+(bad?", "+bad+" ảnh không đọc được":"")+", tìm thấy "+out.length+" cặp ảnh giống nhau. Ảnh chụp lại cùng một căn từ góc khác có thể không bị bắt.");
    render()})}

function onPairClick(e){
  var mo=e.target.closest("[data-more]");if(mo){if(mo.dataset.more==="ign")limIgn+=LIMIT;else limMain+=LIMIT;render();return}
  var z=e.target.closest("[data-zoom]");if(z){openZoom(z.dataset.zoom);return}
  var ci=e.target.closest("[data-chkimg]");if(ci){checkPairImg(ci);return}
  var ig=e.target.closest("[data-ign]");if(ig){ignorePair(ig,true);return}
  var ug=e.target.closest("[data-unign]");if(ug){ignorePair(ug,false);return}
  var dl=e.target.closest("[data-del]");if(dl){delItem(dl);return}
  var t=e.target.closest("[data-tog]");if(t){togglePair(t);return}
  var r=e.target.closest("[data-open]");if(r)N().openDv(r.dataset.open)}
function goMain(){showIgn=false;render();G("dupd").scrollTop=0}
function init(nt){
  if(nt)NT=nt;
  if(inited)return;
  inited=true;
  var st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);
  var box=document.createElement("div");box.innerHTML=DLG;document.body.appendChild(box.firstChild);
  var b=G("dupb");
  if(!b){
    var tools=document.querySelector(".tools");
    b=document.createElement("button");
    b.className="link";b.id="dupb";b.type="button";b.textContent="Kiểm tra trùng";
    if(tools)tools.insertBefore(b,tools.children[1]||null);else document.body.appendChild(b);
  }
  if(!b.onclick)b.onclick=function(){open()};
  G("dupx").onclick=close;
  G("dupx2").onclick=close;
  G("dupzx").onclick=closeZoom;
  G("dupz").onclick=function(e){if(e.target===this)closeZoom()};
  G("dupd").addEventListener("cancel",function(e){
    if(closeZoom()){e.preventDefault();return}
    if(showIgn){e.preventDefault();goMain()}
  });
  G("dupsens").onchange=function(){TH=+this.value||26;rescanFromCache()};
  G("dupimg").onclick=function(){items=N().items();scan()};
  G("dupstop").onclick=function(){stopFlag=true};
  G("duptog").onclick=function(){showOne=!showOne;render()};
  G("dupigntog").onclick=function(){showIgn=true;render();G("dupd").scrollTop=0};
  G("dupback").onclick=goMain;
  G("dupback2").onclick=goMain;
  G("dupignclr").onclick=function(){
    if(!confirm("Khôi phục tất cả các cặp đã đánh dấu về lại danh sách kiểm tra trùng?"))return;
    ignored={};saveIgnored();goMain()};
  G("dupl").onclick=onPairClick;
  G("dupignl").onclick=onPairClick}
function open(nt){
  if(nt)NT=nt;
  if(!N()){alert("Ứng dụng đang tải, thử lại sau vài giây.");return}
  init(N());
  items=N().items();cleanImgPairs();limMain=limIgn=LIMIT;openSet={};pairImgMsg={};showIgn=false;msg("");G("dupbar").hidden=true;G("dupstop").hidden=true;G("dupz").hidden=true;render();
  if(!G("dupd").open)G("dupd").showModal();G("dupd").scrollTop=0}
function close(){
  stopFlag=true;
  var z=G("dupz"),d=G("dupd");
  if(z)z.hidden=true;
  if(d&&d.open)d.close()}
function sync(){
  var d=G("dupd");if(!(d&&d.open&&N()))return;
  clearTimeout(syncT);syncT=setTimeout(function(){items=N().items();cleanImgPairs();render()},120)}

window.Dup={init:init,open:open,close:close,sync:sync,closeZoom:closeZoom};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){init()});
else init();
})();
