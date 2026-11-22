/* dbg.js: tự kiểm tra sau khi các thành phần đã nạp xong + công cụ gỡ lỗi.
   - Chạy ngầm ~3 giây sau khi trang tải xong, không hiện gì khi mọi thứ ổn (chỉ có nút ⚠ nhỏ khi có lỗi nghiêm trọng).
   - Mở bảng báo cáo: chạm 7 lần liên tiếp vào tiêu đề trang, hoặc thêm ?debug=1 vào địa chỉ (PWA), hoặc gọi Dbg.show() trong console.
   - Chỉ ĐỌC dữ liệu (ngoại lệ duy nhất: mỗi phiên xin trình duyệt lưu trữ bền một lần, không hiện hộp thoại; không áp dụng cho APK). Báo cáo không chứa link Web app, mã truy cập hay tên căn (chỉ số lượng).
   - Các nút sửa lỗi đều hỏi xác nhận, không động tới dữ liệu trên Sheet/Drive, và từ chối khi đang có thay đổi chưa lưu hoặc ảnh đang tải lên.
   Cần đoạn bắt lỗi sớm (window.__dbg) trong <head> của index.html; thiếu đoạn đó thì dbg.js vẫn chạy nhưng chỉ thấy lỗi xảy ra sau khi nó nạp. */
(function(){
"use strict";
var G=function(i){return document.getElementById(i)};
var B=window.__dbg||(window.__dbg={e:[],lt:0,ltn:0,lts:[],t:Date.now()});
var R=null,running=false,taps=0,tapT=0;
var FILES=["ck.js","img.js","dup.js","dbg.js"];
var NK_KEYS=["tab","$","CK","LP","PARTS","TIPS","VW","canW","ckA","ckC","ckCopy","ckCur","ckDirty","ckFresh","ckId","ckLiteOf","ckLoad","ckQ","ckSaveOff","ckSnap","ckStat","ckT","ckTrashQ","ckUpQ","ckcSave","closeCk","esc","fail","findItem","imgSrc","items","jumpTop","openLb","persist","rtgH","runPool","shrink","trashIds","uname","upBusy","upMon","upSafe"];
var NK_FN=["$","ckCopy","ckLiteOf","ckLoad","ckSaveOff","ckSnap","ckStat","ckcSave","closeCk","esc","fail","findItem","imgSrc","jumpTop","openLb","persist","rtgH","runPool","shrink","trashIds","uname","upBusy","upMon","upSafe"];
var NI_KEYS=["IW","VW","imgSrc","findItem","segArr","curSeg","ckWarm","tab","items"];
var NI_FN=["imgSrc","findItem","segArr","curSeg","ckWarm","tab","items"];
var NT_KEYS=["apiGet","apiPost","items","esc","su","imgSrc","addrOf","stName","fmt","ls","openDv","openEdit","canW","idbGet","idbSave","del"];
var MOD={Ck:["init","renderCk","ckFlush","ckPersist"],Img:["init","openLb","iwGal","iwNow","iwIntent","iwCkNow"],Dup:["pull","init","open","close","sync","closeZoom"]};
var IDS=["list","ckb","lb","lbi","lbc","lbn","lbp","upd","pgCk"];
var NET=/failed to fetch|load failed|networkerror|network request|internet connection|mất kết nối|aborted/i;
var LIM={s:3000,l:700,w:360};   // mặc định; sw.js mới trả đúng số đang dùng

function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function kb(n){return n>=1048576?(n/1048576).toFixed(1)+" MB":Math.round(n/1024)+" KB"}

/* ---------- Chờ các thành phần nạp xong (tối đa 10 giây) ---------- */
function ready(){return !!(window.NK&&window.NI&&window.NT&&window.Ck&&window.Img&&window.Dup)}
function wait(){
  return new Promise(function(res){
    var t0=Date.now();
    (function poll(){
      if(ready()){res({ok:true,ms:Date.now()-t0});return}
      if(Date.now()-t0>10000){res({ok:false,ms:Date.now()-t0});return}
      setTimeout(poll,250)})()})}

/* ---------- Môi trường chạy ---------- */
function isApk(){return !!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform())}
function isStandalone(){try{return !!(window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true}catch(e){return false}}
function whyNoPersist(){
  if(isApk())return "APK: dữ liệu nằm trong bộ nhớ riêng của app (WebView), không bị tự xóa khi thiếu chỗ, chỉ mất khi bạn xóa dữ liệu app hoặc gỡ cài đặt. Cờ \"lưu trữ bền\" của WebView luôn tắt và không cần bật.";
  if(!isStandalone())return "Đang mở trong tab trình duyệt: Chrome không cấp quyền lưu trữ bền cho tab. Hãy chọn \"Cài đặt ứng dụng\" (menu ⋮) để đưa app ra màn hình chính, rồi mở từ biểu tượng đó.";
  return "Chrome chưa cấp (thường tự cấp cho app đã cài sau vài ngày dùng thường xuyên). Có thể thử lại sau.";}

/* ---------- Các nhóm kiểm tra ---------- */
function chkComponents(add,w){
  var g="Thành phần";
  if(!w.ok){
    ["NK","NI","NT","Ck","Img","Dup"].forEach(function(k){if(!window[k])add("bad",g,k+" chưa sẵn sàng sau 10 giây (tệp liên quan không nạp được hoặc index.html chạy lỗi)")});
  }else add("ok",g,"Đủ NK, NI, NT, Ck, Img, Dup (sẵn sàng sau "+w.ms+" ms kể từ lúc kiểm tra)");
  Object.keys(MOD).forEach(function(m){
    if(!window[m])return;
    var miss=MOD[m].filter(function(k){return typeof window[m][k]!=="function"});
    if(miss.length)add("bad",g,m+" thiếu hàm: "+miss.join(", ")+" (có thể lệch phiên bản giữa các tệp)")});
  if(window.Ck&&!(G("ckb")&&typeof G("ckb").onclick==="function"))add("bad",g,"ck.js đã nạp nhưng chưa khởi tạo (Ck.init chưa chạy)");
  if(window.Img&&!(G("lb")&&typeof G("lb").onclick==="function"))add("bad",g,"img.js đã nạp nhưng chưa khởi tạo (Img.init chưa chạy)");
  if(window.Dup&&!(G("dupd")&&G("dupb")))add("bad",g,"dup.js đã nạp nhưng chưa dựng giao diện Kiểm tra trùng");
  var noId=IDS.filter(function(i){return !G(i)});
  if(noId.length)add("bad",g,"Thiếu phần tử trong trang: "+noId.join(", "))}
function bridge(add,obj,name,keys,fns){
  if(!obj){add("bad","Cầu nối",name+" chưa khai báo");return}
  var miss=keys.filter(function(k){return !(k in obj)});
  var bad=fns.filter(function(k){var v;try{v=obj[k]}catch(e){return true}return k in obj&&typeof v!=="function"});
  if(miss.length||bad.length)add("bad","Cầu nối",name+": thiếu "+(miss.join(", ")||"–")+(bad.length?" · sai kiểu "+bad.join(", "):"")+" (index.html và các tệp con không cùng phiên bản)");
  else add("ok","Cầu nối",name+": đủ "+keys.length+" mục")}
function chkBridges(add){
  bridge(add,window.NK,"NK (ck.js)",NK_KEYS,NK_FN);
  bridge(add,window.NI,"NI (img.js)",NI_KEYS,NI_FN);
  bridge(add,window.NT,"NT (dup.js)",NT_KEYS,NT_KEYS)}
function chkRes(add){
  var rs=[];try{rs=performance.getEntriesByType("resource")||[]}catch(e){}
  FILES.forEach(function(f){
    var r=rs.filter(function(x){return x.name.split("?")[0].slice(-f.length-1)==="/"+f})[0];
    if(!r){add("info","Tệp",f+": không có trong số liệu tải (có thể bị trình duyệt giới hạn)");return}
    if(r.responseStatus&&r.responseStatus>=400){add("bad","Tệp",f+": lỗi HTTP "+r.responseStatus);return}
    var local=r.transferSize===0&&!r.decodedBodySize;   // APK: tệp lấy thẳng từ gói app, trình duyệt không đo được dung lượng
    var from=local?"gói app":(r.transferSize===0?"bộ nhớ đệm":"mạng");
    add(r.duration>2500?"warn":"ok","Tệp",f+": "+Math.round(r.duration)+" ms · "+from+(r.decodedBodySize?" · "+kb(r.decodedBodySize):""))})}
function ping(sw){
  return new Promise(function(res){
    if(!sw){res(null);return}
    var done=false;
    function on(e){if(e.data&&e.data.type==="pong"){fin(e.data)}}
    function fin(v){if(done)return;done=true;navigator.serviceWorker.removeEventListener("message",on);res(v)}
    navigator.serviceWorker.addEventListener("message",on);
    try{sw.postMessage({type:"ping"})}catch(e){fin(null)}
    setTimeout(function(){fin(null)},1500)})}
function chkSw(add){
  var g="Service worker";
  if(!("serviceWorker" in navigator)){add("info",g,"Không được hỗ trợ ở môi trường này");return Promise.resolve()}
  if(!/^https?:$/i.test(location.protocol)){add("info",g,"Không chạy ở giao thức "+location.protocol);return Promise.resolve()}
  return navigator.serviceWorker.getRegistration().then(function(reg){
    if(!reg){add("warn",g,"Chưa đăng ký (ảnh chưa được lưu bền)");return}
    var sw=reg.active;
    add(sw?"ok":"warn",g,"Đăng ký rồi · "+(sw?sw.state:reg.installing?"đang cài":reg.waiting?"đang chờ":"?")+" · phạm vi "+reg.scope.replace(location.origin,""));
    if(!navigator.serviceWorker.controller)add("warn",g,"Chưa kiểm soát trang này: ảnh chưa được lưu bền. Mở lại trang một lần nữa.");
    if(reg.waiting)add("warn",g,"Có bản service worker mới đang chờ kích hoạt. Đóng hết cửa sổ app rồi mở lại.");
    return ping(sw).then(function(p){
      if(!p){add("info",g,"Chưa đọc được phiên bản (service worker cũ chưa hỗ trợ lệnh kiểm tra)");return}
      if(p.lim)LIM=p.lim;
      add("ok",g,"Phiên bản "+p.v+" · chế độ "+(p.app?"APK/App (không lưu vỏ app)":"PWA"));
      if(window.Capacitor&&!p.app)add("warn",g,"Đang chạy trong APK nhưng service worker ở chế độ PWA");
      if(!window.Capacitor&&p.app)add("warn",g,"Service worker ở chế độ APK nhưng trang không chạy trong APK")})})}
function chkCaches(add){
  var g="Bộ nhớ đệm";
  if(!window.caches){add("info",g,"Không hỗ trợ Cache API");return Promise.resolve()}
  return caches.keys().then(function(ks){
    if(!ks.length){add("info",g,"Chưa có bộ nhớ đệm nào");return}
    return Promise.all(ks.map(function(k){return caches.open(k).then(function(c){return c.keys()}).then(function(l){return{k:k,l:l}})})).then(function(all){
      all.forEach(function(x){
        if(x.k==="img-v1"){
          var s=0,b=0;x.l.forEach(function(r){var m=/=w(\d+)$/.exec(r.url);if(m&&+m[1]<=LIM.w)s++;else b++});
          var pS=Math.round(s*100/LIM.s),pL=Math.round(b*100/LIM.l);
          add(pS>=95||pL>=95?"warn":"ok",g,"Ảnh: "+s+" nhỏ ("+pS+"% hạn mức "+LIM.s+") · "+b+" lớn ("+pL+"% hạn mức "+LIM.l+")"+(pS>=95||pL>=95?" — cache đầy, ảnh cũ đang bị xóa dần":""));
        }else if(/^next-/.test(x.k)){
          add(x.l.length?"warn":"ok",g,x.k+": "+(x.l.length?x.l.length+" tệp bản mới đang chờ áp dụng, hãy tải lại trang":"trống"));
        }else add("ok",g,x.k+": "+x.l.length+" mục")})})})}
function chkStorage(add){
  var g="Dung lượng";
  var p=[];
  if(navigator.storage&&navigator.storage.estimate)p.push(navigator.storage.estimate().then(function(e){
    var pc=e.quota?Math.round(e.usage*100/e.quota):0;
    add(pc>=80?"warn":"ok",g,"Đã dùng "+kb(e.usage||0)+" / "+kb(e.quota||0)+" ("+pc+"%)")},function(){}));
  if(navigator.storage&&navigator.storage.persisted)p.push(navigator.storage.persisted().then(function(v){
    if(v)add("ok",g,"Lưu trữ bền: đã bật (trình duyệt không tự xóa khi thiếu chỗ)");
    else if(isApk())add("ok",g,whyNoPersist());
    else{add("info",g,"Lưu trữ bền: chưa bật. "+whyNoPersist());if(R)R.canPersist=true}},function(){}));
  try{
    var n=0,i,k;
    for(i=0;i<localStorage.length;i++){k=localStorage.key(i);n+=(k.length+(localStorage.getItem(k)||"").length)*2}
    add(n>4000000?"warn":"ok",g,"localStorage: "+kb(n)+(n>4000000?" — gần giới hạn 5 MB của iOS":""))
  }catch(e){add("warn",g,"Không đọc được localStorage")}
  return Promise.all(p)}
function chkData(add){
  var g="Dữ liệu",K=window.NK,T=window.NT,items=[];
  try{items=(K&&K.items)||(T&&T.items&&T.items())||[]}catch(e){}
  if(!items.length&&!ready()){return}
  var ids={},dup=0,noName=0,withCk=0,need=0,odd=0,imgs=0,ckImgs=0,ckC={},CKIDS={};
  try{ckC=K.ckC||{}}catch(e){}
  try{(K.CK||[]).forEach(function(s){(s.i||[]).forEach(function(x){CKIDS[x[0]]=1})})}catch(e){}
  items.forEach(function(it){
    if(ids[it.id])dup++;ids[it.id]=1;
    if(!it.n)noName++;
    imgs+=(it.im||[]).length;
    if(it.ck){
      withCk++;ckImgs+=((it.ck.vi||[]).length+(it.ck.im||[]).length);
      var e=ckC[it.id];if(!(e&&e.h===(it.ck.h||"")))need++;
      if(e&&e.ck&&e.ck.c)for(var k in e.ck.c)if(!CKIDS[k]){odd++;break}}});
  add("ok",g,items.length+" căn · "+imgs+" ảnh nhà · "+withCk+" căn có checklist ("+ckImgs+" ảnh)");
  if(dup)add("bad",g,dup+" căn bị trùng mã (id), cần kiểm tra Sheet");
  if(noName)add("warn",g,noName+" căn chưa có tên");
  if(need)add("info",g,need+"/"+withCk+" checklist chưa tải về máy (đang tải ngầm hoặc đang offline)");
  if(odd)add("info",g,odd+" checklist có mục không còn trong biểu mẫu hiện tại (dữ liệu cũ, không ảnh hưởng)");
  if(K){
    if(K.ckDirty)add("info",g,"Đang có thay đổi checklist chưa lưu");
    if(K.ckUpQ&&K.ckUpQ.length)add("info",g,K.ckUpQ.length+" ảnh đang tải lên");
    if(K.ckTrashQ&&K.ckTrashQ.length)add("info",g,K.ckTrashQ.length+" ảnh chờ chuyển vào thùng rác")}}
function chkPerf(add){
  var g="Hiệu năng";
  try{
    var n=performance.getEntriesByType("navigation")[0];
    if(n){
      var d=Math.round(n.domContentLoadedEventEnd),l=Math.round(n.loadEventEnd);
      add(d>4000?"warn":"ok",g,"DOM sẵn sàng sau "+d+" ms · tải xong sau "+(l||"?")+" ms")}
  }catch(e){}
  var up=Math.round(performance.now()/1000);
  add("info",g,"Trang đã mở "+(up>=120?Math.round(up/60)+" phút":up+" giây")+" (số tác vụ treo bên dưới tính từ lúc mở)");
  if(B.ltn){
    var ls=B.lts||[],worst=0,early=0;
    ls.forEach(function(x){if(x.d>worst)worst=x.d;if(x.s<5000)early+=x.d});
    add(worst>1000||B.lt>up*150?"warn":"info",g,B.ltn+" tác vụ treo giao diện >50 ms, tổng "+Math.round(B.lt)+" ms"+(worst?", dài nhất "+worst+" ms":""));
    if(ls.length){
      var top=ls.slice().sort(function(a,b){return b.d-a.d}).slice(0,3).map(function(x){return x.d+" ms lúc +"+(x.s/1000).toFixed(1)+"s"}).join(" · ");
      add("info",g,"Nặng nhất: "+top+" · "+Math.round(early)+" ms nằm trong 5 giây đầu")}}
  var c=navigator.connection||{};
  add("info",g,"Mạng: "+(navigator.onLine===false?"offline":(c.effectiveType||"online"))+(c.saveData?" · tiết kiệm dữ liệu":"")+(navigator.deviceMemory?" · RAM ~"+navigator.deviceMemory+" GB":""))}
function chkErrors(add){
  var g="Lỗi đã ghi";
  if(!B.e.length){add("ok",g,"Không có lỗi nào được ghi lại");return}
  B.e.slice(-8).forEach(function(x){
    var own=/\/(ck|img|dup|dbg|sw)\.js|index\.html/.test(x.s||"")||x.k==="load";
    var net=NET.test(x.m);
    var lv=net?"info":(x.k==="load"||own)?"bad":"warn";   // lỗi đăng ký service worker (k=sw) chỉ là cảnh báo
    var where=x.s?" ("+x.s.split("/").pop()+(x.l?":"+x.l:"")+")":"";
    add(lv,g,"["+x.k+" +"+(x.t/1000).toFixed(1)+"s] "+x.m+where)})}

/* ---------- Chạy toàn bộ ---------- */
function run(){
  if(running)return Promise.resolve(R);
  running=true;
  var L=[];
  function add(s,g,t){L.push({s:s,g:g,t:t})}
  R={at:Date.now(),L:L};
  return wait().then(function(w){
    chkComponents(add,w);chkBridges(add);chkRes(add);
    return chkSw(add).then(function(){return chkCaches(add)}).then(function(){return chkStorage(add)}).then(function(){
      chkData(add);chkPerf(add);chkErrors(add)})
  }).then(function(){running=false;badge();return R},function(e){running=false;add("bad","Kiểm tra","Chính bộ kiểm tra bị lỗi: "+(e&&e.message||e));badge();return R})}
function count(s){return R?R.L.filter(function(x){return x.s===s}).length:0}

/* ---------- Giao diện ---------- */
var CSS="#dbgd .dbgr{display:flex;gap:8px;padding:5px 0;border-top:1px dashed var(--line);font-size:var(--fs-s);align-items:flex-start}"+
"#dbgd .dbgr i{flex:none;font-style:normal;width:18px;text-align:center}"+
"#dbgd .dbgr span{min-width:0;overflow-wrap:anywhere}"+
"#dbgd .dbgr.bad span{color:var(--danger);font-weight:700}"+
"#dbgd .dbgr.warn i{color:#b45309}#dbgd .dbgr.info span{color:var(--mute)}"+
"#dbgd h3{margin:12px 0 2px;font-size:var(--fs-b)}"+
"#dbgd .dbga{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0 4px}"+
"#dbgb{position:fixed;left:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:25;border:0;border-radius:999px;padding:6px 12px;min-height:34px;background:var(--danger);color:#fff;font-weight:700;font-size:var(--fs-s);box-shadow:0 3px 10px rgba(0,0,0,.3);cursor:pointer}";
var ICON={ok:"✓",warn:"⚠",bad:"✕",info:"•"};
function style(){if(G("dbgcss"))return;var st=document.createElement("style");st.id="dbgcss";st.textContent=CSS;document.head.appendChild(st)}
function panel(){
  var d=G("dbgd");if(d)return d;
  style();
  d=document.createElement("dialog");d.id="dbgd";
  d.innerHTML='<div class="form"><h2>Kiểm tra hệ thống</h2><p class="pm" id="dbgs" role="status"></p><div id="dbgl"></div><div class="dbga" id="dbga"></div><div class="foot"><button class="btn p" type="button" id="dbgx">Đóng</button></div></div>';
  document.body.appendChild(d);
  d.addEventListener("click",onClick);
  G("dbgx").onclick=function(){d.close()};
  return d}
function say(t){var s=G("dbgs");if(s)s.textContent=t||""}
function draw(){
  panel();
  var b=count("bad"),w=count("warn"),g="",h="";
  say(!R?"Đang kiểm tra…":b?b+" vấn đề nghiêm trọng, "+w+" cảnh báo.":w?"Không có lỗi nghiêm trọng, "+w+" cảnh báo.":"Mọi thứ hoạt động bình thường.");
  if(R)R.L.forEach(function(x){
    if(x.g!==g){g=x.g;h+="<h3>"+esc(g)+"</h3>"}
    h+='<div class="dbgr '+x.s+'"><i>'+ICON[x.s]+"</i><span>"+esc(x.t)+"</span></div>"});
  G("dbgl").innerHTML=h;
  var a='<button type="button" class="btn" data-act="run">Kiểm tra lại</button><button type="button" class="btn" data-act="copy">Sao chép báo cáo</button>';
  if(R&&R.canPersist&&navigator.storage&&navigator.storage.persist)a+='<button type="button" class="btn" data-act="persist">Bật lưu trữ bền</button>';
  a+='<button type="button" class="btn" data-act="reset">Làm mới bản cài app</button><button type="button" class="btn" data-act="img">Xóa cache ảnh</button><button type="button" class="btn" data-act="ck">Xóa checklist đã nhớ</button><button type="button" class="btn" data-act="dup">Đặt lại dữ liệu quét trùng</button>';
  G("dbga").innerHTML=a}
function show(){
  var d=panel();draw();
  if(!d.open)d.showModal();
  if(!R||Date.now()-R.at>30000)rerun()}
function rerun(){say("Đang kiểm tra…");return run().then(draw)}
function badge(){
  var b=G("dbgb"),n=count("bad"),hide=false;
  try{hide=sessionStorage.getItem("dbg-hide")==="1"}catch(e){}
  if(!n||hide){if(b)b.hidden=true;return}
  if(!b){style();b=document.createElement("button");b.id="dbgb";b.type="button";b.onclick=function(){show()};document.body.appendChild(b)}
  b.hidden=false;b.textContent="⚠ "+n+" lỗi"}
function report(){
  var c=navigator.connection||{},t="Báo cáo kiểm tra · "+new Date(R.at).toLocaleString("vi-VN")+"\n"+(navigator.userAgent||"")+"\n"+(window.Capacitor?"APK (Capacitor)":"Trình duyệt/PWA")+"\n",g="";
  R.L.forEach(function(x){if(x.g!==g){g=x.g;t+="\n["+g+"]\n"}t+=ICON[x.s]+" "+x.t+"\n"});
  return t}
function copy(t){
  if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t);
  return new Promise(function(res,rej){
    var ta=document.createElement("textarea");ta.value=t;ta.style.cssText="position:fixed;opacity:0";document.body.appendChild(ta);ta.select();
    var ok=false;try{ok=document.execCommand("copy")}catch(e){}
    ta.remove();ok?res():rej(new Error("copy"))})}

/* ---------- Nút sửa lỗi (đều hỏi xác nhận, không đụng dữ liệu trên Sheet/Drive) ---------- */
function guard(){
  var K=window.NK;
  if(K&&(K.ckDirty||(K.ckUpQ&&K.ckUpQ.length)||(K.ckTrashQ&&K.ckTrashQ.length)))return "Đang có thay đổi chưa lưu hoặc ảnh đang tải lên. Hãy đợi xong rồi thử lại.";
  return ""}
function reload(){setTimeout(function(){location.reload()},400)}
function onClick(e){
  var b=e.target.closest("[data-act]");if(!b)return;
  var a=b.dataset.act,gd;
  if(a==="run"){rerun();return}
  if(a==="copy"){if(R)copy(report()).then(function(){say("Đã sao chép báo cáo.")},function(){say("Không sao chép được, hãy thử lại.")});return}
  if(a==="persist"){
    navigator.storage.persist().then(function(v){
      var m=v?"Đã bật lưu trữ bền.":"Chưa được cấp. "+whyNoPersist();
      rerun().then(function(){say(m)})},function(){say("Không gửi được yêu cầu lưu trữ bền.")});return}
  gd=guard();if(gd){say(gd);return}
  if(a==="reset"){
    if(!confirm("Xóa vỏ app đã lưu (không xóa ảnh, dữ liệu Sheet hay cài đặt) và tải lại bản mới nhất?"))return;
    say("Đang làm mới…");
    (window.caches?caches.keys():Promise.resolve([])).then(function(ks){return Promise.all(ks.filter(function(k){return k!=="img-v1"}).map(function(k){return caches.delete(k)}))})
      .then(function(){return navigator.serviceWorker?navigator.serviceWorker.getRegistrations():[]})
      .then(function(rs){return Promise.all(rs.map(function(r){return r.unregister()}))})
      .then(reload,reload);return}
  if(a==="img"){
    if(!confirm("Xóa toàn bộ ảnh đã lưu trên máy? Ảnh sẽ được tải lại từ Drive khi cần."))return;
    say("Đang xóa…");(window.caches?caches.delete("img-v1"):Promise.resolve()).then(reload,reload);return}
  if(a==="ck"){
    if(!confirm("Xóa chi tiết checklist đã nhớ trên máy? Dữ liệu trên Sheet không bị ảnh hưởng, app sẽ tải lại khi cần."))return;
    say("Đang xóa…");
    try{window.NK.ckC={};window.NK.ckcSave()}catch(x){}
    Promise.resolve(window.NT&&window.NT.idbSave?window.NT.idbSave("ckc1",""):0).catch(function(){}).then(function(){setTimeout(reload,1800)});return}
  if(a==="dup"){
    if(!confirm("Đặt lại dữ liệu quét ảnh trùng trên máy này? Danh sách \"Không phải trùng\" được giữ nguyên, lần sau cần quét lại."))return;
    say("Đang đặt lại…");
    var T=window.NT||{},ks=["dhc5","dpm1"];
    Promise.all(ks.map(function(k){try{if(T.ls)T.ls(k,"")}catch(x){}return T.idbSave?Promise.resolve(T.idbSave(k,"")).catch(function(){}):0})).then(reload,reload)}}

/* ---------- Kích hoạt ---------- */
function tapTitle(e){
  var h=e.target.closest&&e.target.closest("h1");if(!h)return;
  var n=Date.now();taps=(n-tapT<1200)?taps+1:1;tapT=n;
  if(taps>=7){taps=0;show()}}
document.addEventListener("click",tapTitle,true);
function autoPersist(){
  try{
    if(isApk()||!navigator.storage||!navigator.storage.persist||sessionStorage.getItem("dbg-persist"))return;
    sessionStorage.setItem("dbg-persist","1");
    navigator.storage.persisted().then(function(v){if(!v)return navigator.storage.persist()}).catch(function(){})
  }catch(e){}}
function start(){
  autoPersist();
  var go=function(){run().then(function(){if(/[?&]debug=1/.test(location.search))show()})};
  setTimeout(function(){if(window.requestIdleCallback)requestIdleCallback(go,{timeout:4000});else go()},3000)}
if(document.readyState==="complete")start();else window.addEventListener("load",start);
window.Dbg={run:run,show:show,report:function(){return R?report():""}};
})();
