/* img.js: lightbox xem ảnh + tải sẵn ảnh thông minh, tách khỏi index.html.
   Nạp bằng <script src="img.js" defer></script>. index.html cung cấp cầu nối window.NI rồi gọi Img.init(NI);
   nạp theo thứ tự nào cũng được (index đặt NI trước thì img.js tự init, sau thì index gọi Img.init).
   index.html giữ hàm mỏng openLb / iwGal / iwNow / iwIntent gọi sang đây; thiếu img.js thì các hàm này im lặng bỏ qua. */
(function(){
"use strict";
var G=function(i){return document.getElementById(i)};
var NI=null,inited=false,IW=null,VW=0;
function imgSrc(s,w){return NI.imgSrc(s,w)}
function segArr(it,k){return NI.segArr(it,k)}
function curSeg(it){return NI.curSeg(it)}
function findItem(id){return NI.findItem(id)}
function ckWarm(){return NI.ckWarm()}

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
   Ưu tiên: (0) người dùng vừa chạm/mở -> tải ngay, không giới hạn; (1) thẻ đang hiện trên màn hình;
   (2) thẻ sắp tới theo hướng cuộn; (3) 2 thẻ vừa lướt qua. Hàng đợi được lập lại mỗi khi cuộn nên thẻ đã trôi xa tự bị bỏ.
   Chiều sâu: thẻ chỉ lướt qua tải 1 ảnh đầu; thẻ "quan tâm" (chạm hoặc dừng >1 giây) tải 3 ảnh.
   Ngân sách theo mạng (wifi nhiều, mạng di động ít, tiết kiệm dữ liệu/2G thì không), nhường băng thông cho ảnh nhỏ đang hiện.
   Chỉ chạy khi sw.js đã kiểm soát trang (lúc đó ảnh mới được lưu bền). Ảnh tải bằng cỡ xem VW nên trang chi tiết và lightbox dùng chung. */
var IWT=[null,{max:36,maxT:80,ahead:4,par:1},{max:120,maxT:400,ahead:10,par:2}];   // max: ảnh xem; maxT: ảnh nhỏ của checklist (nhẹ nên tính riêng)
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
var iwC=null;
function iwCache(){return iwC||(iwC=caches.open("img-v1").catch(function(e){iwC=null;throw e}))}   // mở cache một lần, không mở lại cho từng ảnh
function iwHas(u){var m=/^(.*=w)(\d+)$/.exec(u);if(!m||!window.caches)return Promise.resolve(false);
  var w=+m[2],ws=[w].concat([200,300,360,640,900,1280].filter(function(x){return x>w&&x<=w*2}));
  return iwCache().then(function(c){return Promise.all(ws.map(function(x){return c.match(m[1]+x)}))}).then(function(r){return r.some(Boolean)},function(){return false})}
function iwBusy(){var im=document.querySelectorAll("#list .card img"),i,r;for(i=0;i<im.length;i++){if(im[i].complete)continue;r=im[i].getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)return true}return false}
function iwObs(){
  if(!IW.io&&window.IntersectionObserver)IW.io=new IntersectionObserver(function(es){
    es.forEach(function(e){var id=e.target.dataset.id;
      if(e.isIntersecting){if(!IW.vis[id]){IW.vis[id]=1;setTimeout(function(){if(IW.vis[id]&&!IW.eng[id]){IW.eng[id]=1;iwLater(200)}},1000)}}
      else delete IW.vis[id]});
    iwLater(350)});
  if(IW.io){var cs=document.querySelectorAll("#list .card");for(var i=0;i<cs.length;i++)IW.io.observe(cs[i])}}
function iwPlan(){
  var T=iwTier();IW.q=[];if(!T)return;
  var P=IWT[T],cs=[].slice.call(document.querySelectorAll("#list .card")),vis=[],i,k;
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
  order.forEach(function(ix){var it=findItem(cs[ix].dataset.id);if(it)ckT(it,100)});   // ảnh checklist: căn đang xem trước, rồi tất cả căn còn lại
  NI.items().forEach(function(it){ckT(it,200)});
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
  if(window.MutationObserver)new MutationObserver(function(){iwLater(1200)}).observe(G("list"),{childList:true,subtree:true});
  document.addEventListener("visibilitychange",function(){if(!document.hidden){IW.fail=0;iwLater(600)}});
  window.addEventListener("online",function(){IW.fail=0;iwLater(600)});
  if(navigator.serviceWorker)navigator.serviceWorker.addEventListener("controllerchange",function(){iwLater(1500)});
  iwLater(2500);
}
window.Img={init:init,openLb:openLb,iwGal:iwGal,iwNow:iwNow,iwIntent:iwIntent,iwCkNow:iwCkNow};
if(window.NI)init(window.NI);
})();
