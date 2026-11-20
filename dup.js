/* dup.js: công cụ "Kiểm tra trùng" (trùng thông tin và trùng ảnh) cho app Tìm nhà thuê.
   Tự gắn nút, hộp thoại và CSS vào trang; index.html chỉ cần <script src="dup.js" defer></script>.
   Dùng các hàm của app qua window.NT (index.html khai báo khi app khởi động xong).
   Quy tắc: báo cặp trùng từ 2 điều kiện trở lên, hoặc cặp có trùng ảnh. */
(function(){
"use strict";
var G=function(i){return document.getElementById(i)};
function N(){return window.NT}
function esc(s){return N().esc(s)}
function su(u){return N().su(u)}
function imgSrc(s,w){return N().imgSrc(s,w)}
function addrOf(it){return N().addrOf(it)}
function stName(k){return N().stName(k)}
function fmt(x){return N().fmt(x)}
function ls(k,v){return N().ls(k,v)}
var items=[];
var CSS=".dpc{border:1px solid var(--line);border-left:5px solid var(--violet);border-radius:12px;padding:6px 12px 10px;margin-top:8px;background:var(--surface)}\n.dpc.hi{border-left-color:var(--danger)}\n.dpr{display:flex;gap:8px;align-items:center;justify-content:space-between;width:100%;text-align:left;background:none;border:0;padding:8px 0;color:inherit;font:inherit;cursor:pointer}\n.dpr+.dpr{border-top:1px dashed var(--line)}\n.dpt{min-width:0;flex:1}.dpt b{display:block;font-size:var(--fs-b);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpt small{display:block;color:var(--mute);font-size:var(--fs-s);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpw{display:flex;flex-wrap:wrap;gap:4px;margin-top:2px}\n.dpw span{font-size:var(--fs-s);font-weight:600;padding:2px 9px;border-radius:999px;background:var(--bg);border:1px solid var(--line);color:var(--ink)}\n.dpw span.im{background:var(--danger);border-color:var(--danger);color:#fff}\n.dpn[data-tog],.dpw[data-tog]{cursor:pointer}\n.dpm{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:8px}\n.dpm div{display:grid;grid-template-columns:1fr 1fr;gap:2px;cursor:zoom-in}\n.dpm img{width:100%;height:64px;object-fit:cover;border-radius:6px;background:var(--line);display:block}\n.dpb{height:6px;border-radius:3px;background:var(--line);overflow:hidden}\n.dpb i{display:block;height:100%;width:0;background:var(--violet);transition:width .2s}\n.dpc.hi .dpn{color:var(--danger)}\n.dpn{font-size:var(--fs-s);font-weight:700;color:var(--violet);margin:6px 0 0}\n.dpa{margin-top:6px;display:flex;justify-content:flex-end}\n.dpv{font-size:var(--fs-s);font-weight:600}\n.dpdet{margin-top:8px;padding-top:8px;border-top:1px dashed var(--line)}\n.dpdet[hidden],.dpz[hidden]{display:none}\n.dpfs{display:grid;gap:6px}\n.dpf{border:1px solid var(--line);border-radius:8px;padding:6px 8px;background:var(--bg)}\n.dpf.hit{border-color:var(--violet);background:var(--surface)}\n.dpfl{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:4px}\n.dpfl b{font-size:var(--fs-s)}\n.dptag{font-size:11px;font-weight:700;padding:1px 7px;border-radius:999px;background:var(--violet);color:#fff}\n.dpfc{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:var(--fs-s)}\n.dpfc small{display:block;color:var(--mute);font-size:11px}\n.dpfc span{display:block;overflow-wrap:anywhere;word-break:break-word}\n.dpfc a{color:var(--violet);text-decoration:underline;overflow-wrap:anywhere;word-break:break-all}\n.dpe{color:var(--mute);font-style:italic}\n.dpi{margin-top:8px}\n.dpil{margin:0 0 6px;font-size:var(--fs-s);font-weight:700;color:var(--danger)}\n.dpig{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px}\n.dpip{border:1px solid var(--line);border-radius:8px;padding:4px;background:var(--bg);cursor:zoom-in;text-align:center;font:inherit;color:inherit}\n.dpip span{display:grid;grid-template-columns:1fr 1fr;gap:2px}\n.dpip img{width:100%;height:72px;object-fit:cover;border-radius:5px;background:var(--line);display:block}\n.dpip small{display:block;margin-top:3px;font-size:11px;color:var(--mute)}\n.dpz{position:fixed;inset:0;z-index:20;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;padding:12px}\n.dpzb{background:var(--surface);color:var(--ink);border-radius:12px;padding:12px;width:min(680px,100%);max-height:90vh;overflow:auto}\n.dpzt{margin:0 0 8px;font-weight:700;font-size:var(--fs-b);text-align:center}\n.dpzg{display:grid;grid-template-columns:1fr 1fr;gap:8px}\n.dpzg img{width:100%;max-height:60vh;object-fit:contain;border-radius:8px;background:var(--bg);display:block}\n.dpzg small{display:block;margin-top:4px;font-size:var(--fs-s);color:var(--mute);text-align:center}\n";
var DLG="<dialog id=\"dupd\"><div class=\"form\">\n  <h2>Kiểm tra trùng</h2>\n  <p class=\"pm\" id=\"dupsum\"></p>\n  <button type=\"button\" class=\"link\" id=\"duptog\" hidden></button>\n  <p class=\"pm\">Hiển thị cặp trùng từ 2 điều kiện trở lên (hoặc có trùng ảnh) trong: link tin đăng, link Maps, SĐT chủ, SĐT sale, địa chỉ, tên, giá + diện tích, ảnh. Quét ảnh sẽ tải ảnh thu nhỏ của tất cả căn nên tốn dữ liệu và mất một lúc.</p>\n  <div class=\"foot2\"><button class=\"btn p\" type=\"button\" id=\"dupimg\">Quét ảnh trùng</button><button class=\"btn\" type=\"button\" id=\"dupstop\" hidden>Dừng</button></div>\n  <div class=\"dpb\" id=\"dupbar\" hidden><i></i></div>\n  <p class=\"pm\" id=\"dupm\" role=\"status\"></p>\n  <div id=\"dupl\"></div>\n  <div class=\"foot\"><button class=\"btn p\" type=\"button\" id=\"dupx\">Đóng</button></div>\n</div><div class=\"dpz\" id=\"dupz\" hidden><div class=\"dpzb\"><p class=\"dpzt\" id=\"dupzt\"></p><div class=\"dpzg\"><div><img id=\"dupz1\" alt=\"Ảnh căn 1\"><small id=\"dupz1n\"></small></div><div><img id=\"dupz2\" alt=\"Ảnh căn 2\"><small id=\"dupz2n\"></small></div></div><div class=\"foot\"><button class=\"btn p\" type=\"button\" id=\"dupzx\">Đóng</button></div></div></div></dialog>";
var TH=10,MIN=2,imgPairs=null,scanning=false,stopFlag=false,cache={},cacheLoaded=false,LIMIT=50,showOne=false,renderedList=[],openSet={};

/* ---------- Chuẩn hoá ---------- */
function nd(s){return String(s==null?"":s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/[^a-z0-9]+/g," ").trim()}
function pn(s){var d=String(s||"").replace(/\D/g,"");if(d.indexOf("84")===0&&d.length>=11)d="0"+d.slice(2);return d.length>=9?d:""}
function ln(u){u=su(u);if(!u)return"";u=u.toLowerCase().replace(/^https?:\/\/(www\.|m\.)?/,"").replace(/#.*$/,"");var p=u.split("?"),b=p[0].replace(/\/+$/,""),q=(p[1]||"").split("&").filter(function(x){return x&&!/^(utm_|fbclid|gclid|zarsrc|ref=)/.test(x)}).sort().join("&");return b+(q?"?"+q:"")}
/* mã tin: cùng website + cùng dãy số dài cuối đường dẫn (khác slug vẫn nhận ra) */
function lid(u){u=ln(u);if(!u)return"";var h=u.split("/")[0],m=u.split("?")[0].match(/\d{6,}/g);return m?h+"#"+m[m.length-1]:""}
function nw(s){return nd(s).replace(/^(phuong|p|quan|q|huyen|thi xa|tp)\s*/,"").replace(/^0+(?=\d)/,"")}
var STOP={so:1,nha:1,duong:1,d:1,hem:1,ngo:1,ngach:1,kiet:1,p:1,phuong:1,q:1,quan:1,xa:1,hcm:1,tphcm:1,tp:1};
function addrKey(it){var t=nd(it.a).replace(/\b(thanh pho ho chi minh|tp ho chi minh|ho chi minh)\b/g," ").split(" ").filter(function(w){return w&&!STOP[w]});
  var hasNum=t.some(function(w){return/\d/.test(w)}),hasWord=t.some(function(w){return/^[a-z]{2,}$/.test(w)});
  return hasNum&&hasWord?t.join(" "):""}
function feat(it){var nm=nd(it.n),set={},k=0;nm.split(" ").forEach(function(w){if(w&&!set[w]){set[w]=1;k++}});
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
  if(x.p!=null&&y.p!=null&&x.ar&&y.ar&&Math.abs(x.p-y.p)<=0.05&&Math.abs(x.ar-y.ar)<=1&&sameArea(x,y))w.push("Giá + diện tích giống nhau");
  return w}
function addP(P,a,b,why){if(a.id===b.id)return;var lo=a.id<b.id?a:b,hi=a.id<b.id?b:a,k=lo.id+"|"+hi.id,o=P[k]||(P[k]={a:lo,b:hi,why:[],img:[]});if(why&&o.why.indexOf(why)<0)o.why.push(why);return o}
function build(){
  var P={},F=items.map(feat),i,j,w,o;
  for(i=0;i<F.length;i++)for(j=i+1;j<F.length;j++){w=cmp(F[i],F[j]);if(w.length){o=addP(P,F[i].it,F[j].it);o.why=w}}
  if(imgPairs)imgPairs.forEach(function(r){var o=addP(P,r.a,r.b,"img");if(!o)return;var sw=o.a.id!==r.a.id;o.img.push(sw?{x:r.y,y:r.x,d:r.d}:{x:r.x,y:r.y,d:r.d})});
  var all=Object.keys(P).map(function(k){return P[k]}).sort(function(a,b){return b.why.length-a.why.length||b.img.length-a.img.length});
  return{
    strong:all.filter(function(o){return o.why.length>=MIN||o.img.length>0}),
    weak:all.filter(function(o){return o.why.length<MIN&&!o.img.length})
  }}
function pc(x){x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return(((x+(x>>>4))&0x0f0f0f0f)*0x01010101)>>>24}
function simText(d){return d===0?"Giống 100%":"Giống "+Math.round((64-d)/64*100)+"% (lệch "+d+"/64 bit)"}
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
function rowH(it){var k=it.st||"new",ad=addrOf(it);return '<button type="button" class="dpr" data-open="'+esc(it.id)+'"><span class="dpt"><b>'+esc(it.n)+'</b><small>'+esc(ad||"Chưa có địa chỉ")+(it.p!=null?" · "+fmt(it.p)+" tr":"")+(it.ar?" · "+fmt(it.ar)+" m²":"")+'</small></span><span class="pill" style="--c:var(--s-'+k+');--bg2:var(--b-'+k+')">'+esc(stName(k))+'</span></button>'}
function pairH(o,idx){
  var n=o.why.length,k=o.a.id+"|"+o.b.id,isOpen=!!openSet[k];
  var lbl=n>=3?"Gần như chắc chắn trùng":n>=2?"Có thể trùng":o.img.length?"Trùng ảnh":"Chỉ trùng 1 điều kiện";
  var h='<div class="dpc'+(n>=3?" hi":"")+'">'+rowH(o.a)+rowH(o.b)+'<p class="dpn" data-tog="'+idx+'">'+lbl+' ('+n+' điều kiện)</p><div class="dpw" data-tog="'+idx+'" title="Bấm để xem thông tin trùng">';
  o.why.forEach(function(w){if(w!=="img")h+='<span>'+esc(w)+'</span>'});
  if(o.img.length)h+='<span class="im">'+o.img.length+' ảnh giống nhau</span>';
  h+='</div>';
  if(o.img.length)h+='<div class="dpm">'+o.img.slice(0,3).map(function(m,i){return '<div data-zoom="'+idx+':'+i+'" title="Bấm để phóng to"><img alt="Ảnh căn 1" loading="lazy" src="'+esc(imgSrc(m.x,200))+'"><img alt="Ảnh căn 2" loading="lazy" src="'+esc(imgSrc(m.y,200))+'"></div>'}).join("")+'</div>';
  h+='<div class="dpa"><button type="button" class="link dpv" data-tog="'+idx+'">'+(isOpen?"Ẩn thông tin trùng":"Xem thông tin trùng")+'</button></div>';
  h+='<div class="dpdet"'+(isOpen?"":" hidden")+'>'+(isOpen?detailH(o,idx):"")+'</div>';
  return h+'</div>'}
function render(){
  var r=build(),list=showOne?r.strong.concat(r.weak):r.strong,el=G("dupl"),n=items.length,hi=r.strong.filter(function(o){return o.why.length>=3}).length,tg=G("duptog");
  renderedList=list.slice(0,LIMIT);
  G("dupsum").textContent=!n?"Chưa có căn nào để kiểm tra.":r.strong.length?"Có "+r.strong.length+" cặp nghi trùng"+(hi?" ("+hi+" cặp gần như chắc chắn)":"")+" trong "+n+" căn. Chạm vào căn để mở chi tiết, hoặc bấm Xem thông tin trùng để đối chiếu.":"Không có cặp nào trùng từ 2 điều kiện trở lên hoặc trùng ảnh trong "+n+" căn"+(imgPairs?" (đã tính cả ảnh).":".");
  tg.hidden=!r.weak.length;tg.textContent=showOne?"Ẩn "+r.weak.length+" cặp chỉ trùng 1 điều kiện":"Hiện thêm "+r.weak.length+" cặp chỉ trùng 1 điều kiện";
  el.innerHTML=renderedList.map(pairH).join("")+(list.length>LIMIT?'<p class="pm">Còn '+(list.length-LIMIT)+' cặp chưa hiện.</p>':'')}
function togglePair(el){
  var idx=+el.dataset.tog,o=renderedList[idx];if(!o)return;
  var k=o.a.id+"|"+o.b.id;openSet[k]=!openSet[k];
  var card=el.closest(".dpc");if(!card)return;
  var btn=card.querySelector(".dpv"),det=card.querySelector(".dpdet");
  if(btn)btn.textContent=openSet[k]?"Ẩn thông tin trùng":"Xem thông tin trùng";
  if(det){if(openSet[k]){det.innerHTML=detailH(o,idx);det.hidden=false}else det.hidden=true}}
function openZoom(val){
  var p=String(val||"").split(":"),o=renderedList[+p[0]],m=o&&o.img[+p[1]];if(!m)return;
  G("dupzt").textContent=simText(m.d);
  G("dupz1n").textContent=o.a.n||"Căn 1";
  G("dupz2n").textContent=o.b.n||"Căn 2";
  G("dupz1").src=imgSrc(m.x,800);
  G("dupz2").src=imgSrc(m.y,800);
  G("dupz").hidden=false}
function msg(t,bad){var m=G("dupm");m.textContent=t||"";m.className="pm"+(bad?" bad":"")}
function loadCache(){if(cacheLoaded)return;cacheLoaded=true;try{cache=JSON.parse(ls("dhc1")||"{}")||{}}catch(e){cache={}}}
function saveCache(){try{var k=Object.keys(cache);if(k.length>6000){var n={};k.slice(-4000).forEach(function(x){n[x]=cache[x]});cache=n}ls("dhc1",JSON.stringify(cache))}catch(e){}}
function hashOf(s){
  return new Promise(function(res){
    if(cache[s])return res(cache[s]);
    var im=new Image(),done=false,src=imgSrc(s,64);
    if(src.indexOf("https://lh3.googleusercontent.com/")===0){im.crossOrigin="anonymous";src+="?dh=1"}
    var t=setTimeout(function(){fin(null)},15000);
    function fin(h){if(done)return;done=true;clearTimeout(t);im.onload=im.onerror=null;if(h&&String(s).indexOf("data:")!==0)cache[s]=h;res(h)}
    im.onload=function(){try{
      var cv=document.createElement("canvas");cv.width=9;cv.height=8;var cx=cv.getContext("2d",{willReadFrequently:true});cx.drawImage(im,0,0,9,8);
      var d=cx.getImageData(0,0,9,8).data,g=[],i,x,y;for(i=0;i<72;i++)g.push(d[i*4]*.299+d[i*4+1]*.587+d[i*4+2]*.114);
      var hx="",bits="";for(y=0;y<8;y++)for(x=0;x<8;x++)bits+=g[y*9+x]>g[y*9+x+1]?"1":"0";
      for(i=0;i<64;i+=4)hx+=parseInt(bits.substr(i,4),2).toString(16);
      if(bits.split("1").length-1<6)return fin("");   /* ảnh gần như một màu: bỏ qua */
      fin(hx)}catch(e){fin(null)}};
    im.onerror=function(){fin(null)};
    im.src=src})}
function hx2(h){return[parseInt(h.slice(0,8),16)>>>0,parseInt(h.slice(8,16),16)>>>0]}
function scan(){
  if(scanning)return;loadCache();
  var jobs=[];items.forEach(function(it){(it.im||[]).forEach(function(s){if(s)jobs.push({it:it,s:s})})});
  if(jobs.length<2){msg("Chưa đủ ảnh để so sánh.");return}
  scanning=true;stopFlag=false;G("dupimg").disabled=true;G("dupstop").hidden=false;G("dupbar").hidden=false;
  var done=0,bad=0,idx=0,H=new Array(jobs.length),bar=G("dupbar").firstChild;
  function upd(){bar.style.width=(done/jobs.length*100)+"%";msg("Đang đọc ảnh "+done+"/"+jobs.length+(bad?" ("+bad+" ảnh không đọc được)":"")+"…")}
  function worker(){
    if(stopFlag||idx>=jobs.length)return Promise.resolve();
    var i=idx++;
    return hashOf(jobs[i].s).then(function(h){if(h)H[i]=hx2(h);else if(h===null)bad++;done++;if(done%5===0||done===jobs.length)upd()}).then(worker)}
  upd();
  Promise.all([worker(),worker(),worker(),worker()]).then(function(){
    saveCache();
    var out=[],seen={},i,j;
    for(i=0;i<jobs.length;i++){if(!H[i])continue;
      for(j=i+1;j<jobs.length;j++){if(!H[j]||jobs[i].it.id===jobs[j].it.id)continue;
        var d=jobs[i].s===jobs[j].s?0:pc(H[i][0]^H[j][0])+pc(H[i][1]^H[j][1]);
        if(d<=TH){var k=jobs[i].it.id+"|"+jobs[j].it.id+"|"+jobs[i].s+"|"+jobs[j].s;if(!seen[k]){seen[k]=1;out.push({a:jobs[i].it,b:jobs[j].it,x:jobs[i].s,y:jobs[j].s,d:d})}}}}
    imgPairs=out;
    scanning=false;G("dupimg").disabled=false;G("dupstop").hidden=true;G("dupbar").hidden=true;
    var ok=jobs.length-bad;
    if(stopFlag)msg("Đã dừng. Kết quả tính trên "+ok+" ảnh đã đọc.");
    else if(bad&&bad>=jobs.length*0.8)msg("Hầu hết ảnh không đọc được (trình duyệt chặn đọc ảnh Drive hoặc mất mạng), nên chưa so sánh ảnh được. Kết quả bên dưới chỉ theo thông tin và mã ảnh.",1);
    else if(!out.length)msg("Đã so "+ok+" ảnh"+(bad?" ("+bad+" ảnh không đọc được)":"")+": không tìm thấy ảnh nào trùng nhau (ngưỡng giống nhau: lệch ≤ "+TH+"/64 bit). Ảnh chụp lại cùng một căn từ góc khác có thể không bị bắt.");
    else msg("Đã so "+ok+" ảnh"+(bad?", "+bad+" ảnh không đọc được":"")+", tìm thấy "+out.length+" cặp ảnh giống nhau. Ảnh chụp lại cùng một căn từ góc khác có thể không bị bắt.");
    render()})}

function open(){
  if(!N()){alert("Ứng dụng đang tải, thử lại sau vài giây.");return}
  items=N().items();imgPairs=imgPairs||null;openSet={};msg("");G("dupbar").hidden=true;G("dupstop").hidden=true;G("dupz").hidden=true;render();G("dupd").showModal()}
function init(){
  var st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);
  var box=document.createElement("div");box.innerHTML=DLG;document.body.appendChild(box.firstChild);
  var tools=document.querySelector(".tools"),b=document.createElement("button");
  b.className="link";b.id="dupb";b.textContent="Kiểm tra trùng";
  if(tools)tools.insertBefore(b,tools.children[1]||null);else document.body.appendChild(b);
  b.onclick=open;
  G("dupx").onclick=function(){stopFlag=true;G("dupz").hidden=true;G("dupd").close()};
  G("dupzx").onclick=function(){G("dupz").hidden=true};
  G("dupz").onclick=function(e){if(e.target===this)this.hidden=true};
  G("dupd").addEventListener("cancel",function(e){var z=G("dupz");if(z&&!z.hidden){e.preventDefault();z.hidden=true}});
  G("dupimg").onclick=function(){items=N().items();scan()};
  G("dupstop").onclick=function(){stopFlag=true};
  G("duptog").onclick=function(){showOne=!showOne;render()};
  G("dupl").onclick=function(e){
    var z=e.target.closest("[data-zoom]");if(z){openZoom(z.dataset.zoom);return}
    var t=e.target.closest("[data-tog]");if(t){togglePair(t);return}
    var r=e.target.closest("[data-open]");if(r)N().openDv(r.dataset.open)}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
