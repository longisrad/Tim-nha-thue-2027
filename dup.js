/* dup.js: công cụ "Kiểm tra trùng" (trùng thông tin và trùng ảnh) cho app Tìm nhà thuê.
   Tự gắn nút, hộp thoại và CSS vào trang; index.html chỉ cần <script src="dup.js" defer></script>.
   Dùng các hàm của app qua window.NT (index.html khai báo khi app khởi động xong). */
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
var CSS=".dpc{border:1px solid var(--line);border-left:5px solid var(--violet);border-radius:12px;padding:6px 12px 10px;margin-top:8px;background:var(--surface)}\n.dpc.hi{border-left-color:var(--danger)}\n.dpr{display:flex;gap:8px;align-items:center;justify-content:space-between;width:100%;text-align:left;background:none;border:0;padding:8px 0;color:inherit;font:inherit;cursor:pointer}\n.dpr+.dpr{border-top:1px dashed var(--line)}\n.dpt{min-width:0;flex:1}.dpt b{display:block;font-size:var(--fs-b);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpt small{display:block;color:var(--mute);font-size:var(--fs-s);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpw{display:flex;flex-wrap:wrap;gap:4px;margin-top:2px}\n.dpw span{font-size:var(--fs-s);font-weight:600;padding:2px 9px;border-radius:999px;background:var(--bg);border:1px solid var(--line);color:var(--ink)}\n.dpw span.im{background:var(--danger);border-color:var(--danger);color:#fff}\n.dpm{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:8px}\n.dpm div{display:grid;grid-template-columns:1fr 1fr;gap:2px}\n.dpm img{width:100%;height:64px;object-fit:cover;border-radius:6px;background:var(--line);display:block}\n.dpb{height:6px;border-radius:3px;background:var(--line);overflow:hidden}\n.dpb i{display:block;height:100%;width:0;background:var(--violet);transition:width .2s}\n";
var DLG="<dialog id=\"dupd\"><div class=\"form\">\n  <h2>Kiểm tra trùng</h2>\n  <p class=\"pm\" id=\"dupsum\"></p>\n  <p class=\"pm\">So theo link tin đăng, link Maps, SĐT chủ, địa chỉ, tên, giá + diện tích. Quét ảnh sẽ tải ảnh thu nhỏ của tất cả căn nên tốn dữ liệu và mất một lúc.</p>\n  <div class=\"foot2\"><button class=\"btn p\" type=\"button\" id=\"dupimg\">Quét ảnh trùng</button><button class=\"btn\" type=\"button\" id=\"dupstop\" hidden>Dừng</button></div>\n  <div class=\"dpb\" id=\"dupbar\" hidden><i></i></div>\n  <p class=\"pm\" id=\"dupm\" role=\"status\"></p>\n  <div id=\"dupl\"></div>\n  <div class=\"foot\"><button class=\"btn p\" type=\"button\" id=\"dupx\">Đóng</button></div>\n</div></dialog>";

var TH=6,imgPairs=null,scanning=false,stopFlag=false,cache={},cacheLoaded=false,LIMIT=50;
function nd(s){return String(s==null?"":s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/[^a-z0-9]+/g," ").trim()}
function pn(s){var d=String(s||"").replace(/\D/g,"");if(d.indexOf("84")===0&&d.length>=11)d="0"+d.slice(2);return d.length>=9?d:""}
function ln(u){u=su(u);if(!u)return"";u=u.toLowerCase().replace(/^https?:\/\/(www\.|m\.)?/,"").replace(/#.*$/,"");var p=u.split("?"),b=p[0].replace(/\/+$/,""),q=(p[1]||"").split("&").filter(function(x){return x&&!/^(utm_|fbclid|gclid|zarsrc|ref=)/.test(x)}).sort().join("&");return b+(q?"?"+q:"")}
function addP(P,a,b,why,w){if(a.id===b.id)return;var lo=a.id<b.id?a:b,hi=a.id<b.id?b:a,k=lo.id+"|"+hi.id,o=P[k]||(P[k]={a:lo,b:hi,why:[],sc:0,img:[]});if(o.why.indexOf(why)<0){o.why.push(why);o.sc+=w}return o}
function grp(P,fn,why,w){var m={};items.forEach(function(it){var k=fn(it);if(k)(m[k]=m[k]||[]).push(it)});Object.keys(m).forEach(function(k){var g=m[k];if(g.length<2||g.length>20)return;for(var i=0;i<g.length;i++)for(var j=i+1;j<g.length;j++)addP(P,g[i],g[j],why,w)})}
function build(){
  var P={};
  grp(P,function(it){return ln(it.lk)},"Cùng link tin đăng",5);
  grp(P,function(it){return ln(it.mp)},"Cùng link Google Maps",4);
  grp(P,function(it){return pn(it.ph)},"Cùng SĐT chủ nhà",4);
  grp(P,function(it){var a=nd(it.a);return a.length>=5&&/\d/.test(a)?a+"|"+nd(it.w)+"|"+nd(it.d):""},"Cùng địa chỉ",4);
  grp(P,function(it){var n=nd(it.n);return n.length>=6?n:""},"Trùng tên",2);
  grp(P,function(it){var w=nd(it.w),d=nd(it.d);return it.p!=null&&it.ar&&(w||d)?it.p+"|"+it.ar+"|"+w+"|"+d:""},"Cùng giá + diện tích + khu vực",2);
  if(imgPairs)imgPairs.forEach(function(r){var o=addP(P,r.a,r.b,"img",5);if(!o)return;var sw=o.a.id!==r.a.id;o.img.push(sw?{x:r.y,y:r.x,d:r.d}:{x:r.x,y:r.y,d:r.d})});
  return Object.keys(P).map(function(k){return P[k]}).sort(function(a,b){return b.sc-a.sc||b.img.length-a.img.length});
}
function pc(x){x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return(((x+(x>>>4))&0x0f0f0f0f)*0x01010101)>>>24}
function rowH(it){var k=it.st||"new",ad=addrOf(it);return '<button type="button" class="dpr" data-open="'+esc(it.id)+'"><span class="dpt"><b>'+esc(it.n)+'</b><small>'+esc(ad||"Chưa có địa chỉ")+(it.p!=null?" · "+fmt(it.p)+" tr":"")+(it.ar?" · "+fmt(it.ar)+" m²":"")+'</small></span><span class="pill" style="--c:var(--s-'+k+');--bg2:var(--b-'+k+')">'+esc(stName(k))+'</span></button>'}
function pairH(o){
  var h='<div class="dpc'+(o.sc>=5?" hi":"")+'">'+rowH(o.a)+rowH(o.b)+'<div class="dpw">';
  o.why.forEach(function(w){if(w!=="img")h+='<span>'+esc(w)+'</span>'});
  if(o.img.length)h+='<span class="im">'+o.img.length+' ảnh giống nhau</span>';
  h+='</div>';
  if(o.img.length)h+='<div class="dpm">'+o.img.slice(0,3).map(function(m){return '<div><img alt="Ảnh căn 1" loading="lazy" src="'+esc(imgSrc(m.x,200))+'"><img alt="Ảnh căn 2" loading="lazy" src="'+esc(imgSrc(m.y,200))+'"></div>'}).join("")+'</div>';
  return h+'</div>'}
function render(){
  var list=build(),el=G("dupl"),n=items.length,hi=list.filter(function(o){return o.sc>=4}).length;
  G("dupsum").textContent=!n?"Chưa có căn nào để kiểm tra.":list.length?"Có "+list.length+" cặp nghi trùng ("+hi+" cặp rất có thể trùng) trong "+n+" căn. Chạm vào căn để mở chi tiết.":"Không thấy căn nào trùng thông tin"+(imgPairs?" hoặc ảnh":"")+" trong "+n+" căn.";
  el.innerHTML=list.slice(0,LIMIT).map(pairH).join("")+(list.length>LIMIT?'<p class="pm">Còn '+(list.length-LIMIT)+' cặp ít khả năng hơn, chưa hiện.</p>':'');
}
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
    else msg("Đã so "+ok+" ảnh"+(bad?", "+bad+" ảnh không đọc được":"")+". Ảnh chụp lại cùng một căn từ góc khác có thể không bị bắt.");
    render()})}

function open(){
  if(!N()){alert("Ứng dụng đang tải, thử lại sau vài giây.");return}
  items=N().items();imgPairs=imgPairs||null;msg("");G("dupbar").hidden=true;G("dupstop").hidden=true;render();G("dupd").showModal()}
function init(){
  var st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);
  var box=document.createElement("div");box.innerHTML=DLG;document.body.appendChild(box.firstChild);
  var tools=document.querySelector(".tools"),b=document.createElement("button");
  b.className="link";b.id="dupb";b.textContent="Kiểm tra trùng";
  if(tools)tools.insertBefore(b,tools.children[1]||null);else document.body.appendChild(b);
  b.onclick=open;
  G("dupx").onclick=function(){stopFlag=true;G("dupd").close()};
  G("dupimg").onclick=function(){items=N().items();scan()};
  G("dupstop").onclick=function(){stopFlag=true};
  G("dupl").onclick=function(e){var r=e.target.closest("[data-open]");if(r)N().openDv(r.dataset.open)}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
