/* img.js: bộ công cụ ảnh toàn app — lightbox, tải sẵn thông minh, nén ảnh trước khi upload,
   tự đổi nguồn Drive khi lỗi, hiện ảnh mượt (.ld) và quét ảnh đã cache (.ld0).
   Nạp bằng <script src="img.js" defer></script>. index.html cung cấp cầu nối window.NI rồi gọi Img.init(NI);
   nạp theo thứ tự nào cũng được (index đặt NI trước thì img.js tự init, sau thì index gọi Img.init).
   Tối ưu: bỏ getBoundingClientRect() trên thẻ ngoài màn hình (dùng tập thẻ đang hiển thị visEls từ IntersectionObserver)
   và bỏ subtree trên MutationObserver #list để giữ nguyên hiệu quả content-visibility: auto khi cuộn. */
(function(){
"use strict";
var G=function(i){return document.getElementById(i)};
var NI=null,inited=false,IW=null,VW=0;
function imgSrc(s,w){return NI.imgSrc(s,w)}
function segArr(it,k){return NI.segArr(it,k)}
function curSeg(it){return NI.curSeg(it)}
function findItem(id){return NI.findItem(id)}
function ckWarm(){return NI.ckWarm()}

/* ---------- Nén & thu nhỏ ảnh trước khi tải lên Drive (tuần tự tránh ngốn RAM) ---------- */
var shrinkQ=Promise.resolve();
function shrink(file){
  var p=shrinkQ.then(function(){return new Promise(function(res){
    var url=URL.createObjectURL(file),im=new Image();
    function clean(out){im.onload=im.onerror=null;try{im.src=""}catch(x){}URL.revokeObjectURL(url);res(out)}
    im.onload=function(){try{
      var k=Math.min(1,1200/Math.max(im.width,im.height)),c=document.createElement("canvas");
      c.width=Math.max(1,Math.round(im.width*k));c.height=Math.max(1,Math.round(im.height*k));
      c.getContext("2d").drawImage(im,0,0,c.width,c.height);
      var d=c.toDataURL("image/jpeg",0.7);c.width=c.height=0;clean(d)
    }catch(e){clean(null)}};
    im.onerror=function(){clean(null)};
    im.src=url})});
  shrinkQ=p.catch(function(){});
  return p}

/* ---------- Hiện ảnh mượt & tự thử lại nguồn Drive khác khi lỗi ---------- */
function retryImg(t){
  if(!t||t.tagName!=="IMG")return;
  var s=t.getAttribute("src")||"",m=s.match(/lh3\.googleusercontent\.com\/d\/([^=?&]+)=w(\d+)/);
  var n=+t.dataset.rt||0;if(n>=3)return;t.dataset.rt=n+1;
  var id=m?m[1]:(s.match(/[?&]id=([^&]+)/)||[])[1],w=m?m[2]:((s.match(/sz=w(\d+)/)||[])[1]||"500");
  if(!id)return;
  var alt=[
    "https://drive.google.com/thumbnail?id="+id+"&sz=w"+w,
    "https://drive.google.com/uc?export=view&id="+id,
    "https://lh3.googleusercontent.com/d/"+id+"=w"+w+"?r="+Date.now()
  ][n];
  setTimeout(function(){t.src=alt},400*(n+1))}
function sweep(root){
  var imgs=(root||document).getElementsByTagName("img");
  for(var i=0;i<imgs.length;i++){var im=imgs[i];if(im.complete&&im.naturalWidth&&!im.classList.contains("ld"))im.classList.add("ld","ld0")}}

/* ---------- Lightbox ---------- */
var lbL=[],lbI=0;
var lbT=0,lbDone={};
var lbWait={};
function lbPre(u,cb){if(!u)return;if(lbDone[u]){if(cb)cb();return}
  if(lbWait[u]){if(cb)lbWait[u].push(cb);return}
  lbWait[u]=cb?[cb]:[];var p=new Image();p.decoding="async";
  function fin(ok){if(ok)lbDone[u]=1;var q=lbWait[u]||[];delete lbWait[u];q.forEach(function(f){f()})}
  p.onload=function(){fin(true)};p.onerror=function(){fin(false)};p.src=u}
function lbAnim(k){var el=G("lbi");el.classList.remove("a-open","a-next","a-prev");void el.offsetWidth;if(k)el.classList.add("a-"+k)}
function lbShow(kind){var im=lbL[lbI],big=im.dataset.big||im.src,el=G("lbi"),lb=G("lb"),t=++lbT;
  G("lbc").textContent=(lbI+1)+" / "+lbL.length;lb.classList.toggle("single",lbL.length<2);
  if(lbDone[big]){el.src=big;lb.classList.remove("busy");lbAnim(kind)}
  else{var lo=im.currentSrc||im.src;
    if(lo&&lo!==big){lb.classList.remove("busy");el.src=lo;lbAnim(kind);lbPre(big,function(){if(t===lbT)el.src=big})}
    else{lb.classList.add("busy");lbAnim("");lbPre(big,function(){if(t===lbT){el.src=big;lb.classList.remove("busy");lbAnim(kind)}})}}
  if(lbL.length>1)[1,-1,2,3].forEach(function(d){var n=lbL[(lbI+d+lbL.length)%lbL.length];if(n&&n!==im)lbPre(n.dataset.big||n.src)})}
function lbGo(d){if(lbL.length<2)return;lbI=(lbI+d+lbL.length)%lbL.length;lbShow(d>0?"next":"prev")}
function openLb(img){lbL=Array.prototype.slice.call(img.closest(".ph,.cph,.dvg").querySelectorAll("img")).filter(function(x){return !x.closest(".up")});
  if(!lbL.length)lbL=[img];lbI=Math.max(0,lbL.indexOf(img));lbShow("open");if(!G("lb").open)G("lb").showModal()}
G("lb").onclick=function(e){var t=e.target;
  if(t.id==="lbn"){lbGo(1);return}
  if(t.id==="lbp"){lbGo(-1);return}
  if(t.id==="lbi"){if(lbL.length>1)lbGo(1);else this.close();return}
  this.close()};
G("lb").addEventListener("keydown",function(e){if(e.key==="ArrowRight")lbGo(1);else if(e.key==="ArrowLeft")lbGo(-1)});
(function(){var x0=null;var lb=G("lb");
  lb.addEventListener("touchstart",function(e){x0=e.touches.length===1?e.touches[0].clientX:null},{passive:true});
  lb.addEventListener("touchend",function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;x0=null;
    if(Math.abs(dx)>50){lbGo(dx<0?1:-1);e.preventDefault()}},{passive:false});
})();

/* ===== Tải sẵn ảnh thông minh =====
   Chỉ kiểm tra ảnh chưa tải xong trên các thẻ đang nằm trong viewport (visEls) để không ép browser tính layout thẻ ẩn. */
var IWT=[null,{max:36,maxT:80,ahead:4,par:1},{max:120,maxT:400,ahead:10,par:2}];
var visEls={},obsSet=typeof WeakSet!=="undefined"?new WeakSet():null;
function iwTier(){var c=navigator.connection||{};
  if(document.hidden||navigator.onLine===false||c.saveData||/2g/.test(c.effectiveType||""))return 0;
  if(!(navigator.serviceWorker&&navigator.serviceWorker.controller))return 0;
  return (c.type==="wifi"||c.type==="ethernet")?2:1}
function iwArr(it){return NI.tab()==="real"?segArr(it,curSeg(it)):(it.im||[])}
function iwUrls(it,n){var o=[];iwArr(it).slice(0,n).forEach(function(x){var u=imgSrc(x,VW);if(u.indexOf("https://lh3.")===0)o.push(u)});return o}
function iwCkUrls(it){var o=[];segArr(it,"v").concat(segArr(it,"h")).slice(0,12).forEach(function(x){var u=imgSrc(x,300);if(u.indexOf("https://lh3.")===0)o.push(u)});return o}
function iwCkNow(it){if(it)iwCkUrls(it).forEach(iwNow)}
function iwNow(u){if(!u||IW.seen[u])return;IW.seen[u]=1;var im=new Image();im.decoding="async";im.onerror=function(){delete IW.seen[u]};im.src=u}
function iwIntent(it){IW.eng[it.id]=1;iwUrls(it,2).forEach(iwNow)}
function iwGal(g,i){var c=g.children;[i+1,i+2,i-1].forEach(function(k){if(k<0||k>=c.length)return;var u=c[k].getAttribute&&c[k].getAttribute("src");if(u&&u.indexOf("https://lh3.")===0)iwNow(u)})}
function iwPre(e){
  var t=e.target;if(!t||!t.closest)return;
  var b=t.closest("[data-ck],[data-sck]");
  if(b){var cid=b.dataset.ck||b.dataset.sck;if(NI.ckGet)NI.ckGet(cid).catch(function(){});iwCkNow(findItem(cid))}
  var tp=t.closest(".top");
  if(tp&&!t.closest("a,button,.th")){var cd=tp.closest(".card"),it=cd&&findItem(cd.dataset.id);if(it)iwIntent(it)}
  var pi=t.closest(".ph img,.cph img");
  if(pi&&pi.dataset.big)iwNow(pi.dataset.big)}
var iwC=null;
function iwCache(){return iwC||(iwC=caches.open("img-v1").catch(function(e){iwC=null;throw e}))}
function iwHas(u){var m=/^(.*=w)(\d+)$/.exec(u);if(!m||!window.caches)return Promise.resolve(false);
  var w=+m[2],ws=[w].concat([200,300,360,640,900,1280].filter(function(x){return x>w&&x<=w*2}));
  return iwCache().then(function(c){return Promise.all(ws.map(function(x){return c.match(m[1]+x)}))}).then(function(r){return r.some(Boolean)},function(){return false})}
function iwBusy(){
  for(var id in visEls){
    var card=visEls[id];
    if(!card||!card.isConnected){delete visEls[id];delete IW.vis[id];continue}
    var im=card.getElementsByTagName("img");
    for(var i=0;i<im.length;i++)if(!im[i].complete)return true;
  }
  return false}
function iwObs(){
  if(!IW.io&&window.IntersectionObserver)IW.io=new IntersectionObserver(function(es){
    es.forEach(function(e){var id=e.target.dataset.id;if(!id)return;
      if(e.isIntersecting){visEls[id]=e.target;if(!IW.vis[id]){IW.vis[id]=1;setTimeout(function(){if(IW.vis[id]&&!IW.eng[id]){IW.eng[id]=1;iwLater(200)}},1000)}}
      else{delete IW.vis[id];delete visEls[id]}});
    iwLater(350)});
  if(IW.io){
    var cs=G("list").getElementsByClassName("card");
    for(var i=0;i<cs.length;i++){
      var c=cs[i];
      if(obsSet){if(obsSet.has(c))continue;obsSet.add(c)}
      IW.io.observe(c);
    }
  }}
function iwPlan(){
  var T=iwTier();IW.q=[];if(!T)return;
  var P=IWT[T];
  if(IW.n>=P.max&&IW.nt>=P.maxT)return;
  var cs=G("list").getElementsByClassName("card"),vis=[],i,k;
  for(i=0;i<cs.length;i++)if(IW.vis[cs[i].dataset.id])vis.push(i);
  if(!vis.length)for(i=0;i<Math.min(3,cs.length);i++)vis.push(i);
  if(!vis.length)return;
  var lo=vis[0],hi=vis[vis.length-1],dir=lo<IW.lo?-1:1,order=vis.slice();IW.lo=lo;
  for(k=1;k<=P.ahead;k++){var j=dir>0?hi+k:lo-k;if(j>=0&&j<cs.length)order.push(j)}
  for(k=1;k<=2;k++){var b=dir>0?lo-k:hi+k;if(b>=0&&b<cs.length)order.push(b)}
  var q=[],o=0;
  order.forEach(function(ix,rank){var it=findItem(cs[ix].dataset.id);if(!it)return;
    iwUrls(it,IW.eng[it.id]?IW.PER:1).forEach(function(u,n){if(!IW.seen[u])q.push({u:u,p:(rank<vis.length?0:10)+n,o:o++})})});
  var dn={};function ckT(it,p){if(dn[it.id])return;dn[it.id]=1;iwCkUrls(it).forEach(function(u){if(!IW.seen[u])q.push({u:u,p:p,o:o++,t:1})})}
  if(IW.nt<P.maxT){
    order.forEach(function(ix){var it=findItem(cs[ix].dataset.id);if(it)ckT(it,100)});
    NI.items().forEach(function(it){ckT(it,200)});
  }
  q.sort(function(x,y){return x.p-y.p||x.o-y.o});IW.q=q}
function iwLoad(u,t){
  iwHas(u).then(function(has){
    if(has){IW.run--;iwPump();return}
    if(t)IW.nt++;else IW.n++;var im=new Image();im.decoding="async";try{im.fetchPriority="low"}catch(e){}
    function done(ok){im.onload=im.onerror=null;IW.fail=ok?0:IW.fail+1;if(!ok)delete IW.seen[u];setTimeout(function(){IW.run--;iwPump()},150)}
    im.onload=function(){done(true)};im.onerror=function(){done(false)};im.src=u})}
function iwPump(){
  var T=iwTier();if(!T||IW.fail>=3)return;var P=IWT[T];
  while(IW.run<P.par&&IW.q.length){
    if(IW.wait<8&&iwBusy()){IW.wait++;iwLater(500);return}
    IW.wait=0;var x=IW.q.shift(),u=x.u;if(IW.seen[u]||(x.t?IW.nt>=P.maxT:IW.n>=P.max))continue;
    IW.seen[u]=1;IW.run++;iwLoad(u,x.t)}}
function iwGo(){ckWarm();iwObs();iwPlan();iwPump()}
function iwLater(ms){clearTimeout(IW.t);IW.t=setTimeout(iwGo,ms)}
function init(ni){
  if(inited||!ni)return;
  inited=true;NI=ni;IW=ni.IW;VW=ni.VW;
  sweep(document);
  document.addEventListener("load",function(e){var im=e.target;if(im&&im.tagName==="IMG"&&!im.classList.contains("ld"))im.classList.add("ld")},true);
  document.addEventListener("error",function(e){retryImg(e.target)},true);
  var lEl=G("list"),mEl=G("mdl"),cEl=G("ckb");
  if(lEl)lEl.addEventListener("pointerdown",iwPre,{passive:true});
  if(mEl)mEl.addEventListener("pointerdown",iwPre,{passive:true});
  if(cEl)cEl.addEventListener("pointerdown",iwPre,{passive:true});
  /* Chỉ theo dõi childList trực tiếp của #list (không cần subtree) để không kích hoạt lại khi mở menu/tải ảnh trong thẻ */
  if(window.MutationObserver)new MutationObserver(function(){iwLater(1200)}).observe(G("list"),{childList:true});
  document.addEventListener("visibilitychange",function(){if(!document.hidden){IW.fail=0;iwLater(600)}});
  window.addEventListener("online",function(){IW.fail=0;iwLater(600)});
  if(navigator.serviceWorker)navigator.serviceWorker.addEventListener("controllerchange",function(){iwLater(1500)});
  iwLater(2500);
}
window.Img={init:init,openLb:openLb,iwGal:iwGal,iwNow:iwNow,iwIntent:iwIntent,iwCkNow:iwCkNow,shrink:shrink,sweep:sweep};
if(window.NI)init(window.NI);
})();
