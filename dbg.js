/* dbg.js: tự kiểm tra sau khi các thành phần đã nạp xong + công cụ gỡ lỗi + tự động sửa lỗi hệ thống.
   Đã đối chiếu chuẩn xác với kiến trúc sw.js (v51, cơ chế next-* -> promote), index.html (IDBM, NK, NI, NT, NB),
   dup.js (dhc12/dpm7 theo hậu tố cấu hình, ALGO_VER=6 CSLS + Patch MaxSim, DINOv3 lib-v1, Dup.retire), ck.js, img.js, bk.js và manifest.webmanifest.
   - Chạy ngầm ~3 giây sau khi trang tải xong, không hiện gì khi mọi thứ ổn (chỉ có nút ⚠ nhỏ khi có lỗi nghiêm trọng).
   - Thanh cảnh báo trên màn hình (#dbgw): hiện ngay các lỗi nghiêm trọng của bộ kiểm tra và lỗi chạy thực tế (error/promise/load) để xác nhận;
     bấm Chi tiết để mở bảng kiểm tra, Chép để sao chép, × để ẩn. Thử nhanh: Dbg.test() hoặc mở trang với ?dbgtest=1.
   - Tự động sửa lỗi (Auto-Fix) cho cả:
     1) Máy mới cài chưa cache (fresh): đăng ký sw.js (kèm ?app=1 cho APK), nạp bù SHELL_FILES còn thiếu vào shell-{ver},
        khởi tạo kho IndexedDB "nha-thue-kv" (store "kv"), xin lưu trữ bền, và đồng bộ sẵn danh sách căn + hash ảnh.
     2) Máy đã cài thành công (installed): kích hoạt bản cập nhật đang chờ trong next-{ver} qua reload có kiểm soát,
        làm mới vỏ app khi lệch cầu nối (giữ nguyên img-v1, lib-v1 DINOv3 và IndexedDB), tỉa cache ảnh >95% xuống 75%,
        dọn localStorage >4 MB (không chạm hàng đợi Dup.retire), phẫu thuật làm sạch dpm7 theo hậu tố (giữ nguyên dhc12),
        đồng bộ hai chiều dign1 và khôi phục ckc1 hỏng.
   - Bảo vệ dữ liệu tuyệt đối: khóa toàn bộ thao tác ghi/xóa/tải lại khi đang sửa/tải ảnh (ckDirty, ckSaveN, ckUpN, ckUpQ, ckTrashQ, ckErr)
     và từ chối tự tải lại khi đang ở màn hình Checklist (tab==="ck") hoặc đang mở hộp thoại khác.
   - Chống lặp tải lại (Loop Breaker): tối đa 2 lần/phiên và không lặp cùng mã lỗi trong 5 phút.
   - API: window.Dbg = { run, show, all, report, autoFix, plan, profile, test, dupScan, fixDup }.
   - Quét kiểm đồng bộ cặp trùng: Dbg.dupScan() (so cặp Không phải trùng + Trùng giữa máy và máy chủ, phát hiện lệch / xung đột / máy chủ cũ).
   - Lệnh sửa: Dbg.fixDup("repush") đẩy lại cặp chỉ có trên máy · "pull" ghi lại + kéo + giải xung đột · "heal" sửa bản lưu dsp1 · "mirror" lấy máy chủ làm chuẩn. */
(function(){
"use strict";
var G=function(i){return document.getElementById(i)};
var NOTRAP=!window.__dbg;
var B=window.__dbg||(window.__dbg={e:[],lt:0,ltn:0,lts:[],t:Date.now()});
if(NOTRAP){
  (function(){
    function put(o){try{o.t=Date.now()-B.t;B.e.push(o);if(B.e.length>50)B.e.shift()}catch(x){}}
    window.addEventListener("error",function(e){
      var t=e&&e.target;
      if(t&&t!==window&&(t.src||t.href)){var u=t.src||t.href;put({k:"load",m:"Không nạp được "+u,s:u,l:0});return}
      put({k:"error",m:String(e&&(e.message||(e.error&&e.error.message))||"error"),s:(e&&e.filename)||"",l:(e&&e.lineno)||0})},true);
    window.addEventListener("unhandledrejection",function(e){
      var r=e&&e.reason;put({k:"promise",m:String(r&&r.message||r||"promise rejected"),s:"",l:0})})
  })()}
var R=null,running=false,taps=0,tapT=0;
var FILES=["ck.js","img.js","dup.js","bk.js","dbg.js"];
var NK_KEYS=["v","S","tab","$","CK","LP","PARTS","TIPS","VW","canW","ckCopy","ckLiteOf","ckLoad","ckSaveOff","ckSnap","ckStat","ckcSave","closeCk","esc","fail","findItem","imgSrc","items","jumpTop","openLb","persist","rtgH","runPool","shrink","trashIds","uname","upBusy","upMon","upSafe"];
var NK_FN=["$","ckCopy","ckLiteOf","ckLoad","ckSaveOff","ckSnap","ckStat","ckcSave","closeCk","esc","fail","findItem","imgSrc","jumpTop","openLb","persist","rtgH","runPool","shrink","trashIds","uname","upBusy","upMon","upSafe"];
var NI_KEYS=["v","IW","VW","imgSrc","findItem","segArr","curSeg","ckWarm","tab","items"];
var NI_FN=["imgSrc","findItem","segArr","curSeg","ckWarm","tab","items"];
var NB_KEYS=["v","$","IDBM","apiGet","apiPost","apiUrl","capP","hs","netMsg","nrm","refresh","items","canW","pendAdd","bumpVer"];
var NB_FN=["$","apiGet","apiPost","apiUrl","capP","hs","netMsg","nrm","refresh","pendAdd","bumpVer"];
var NT_KEYS=["v","apiGet","apiPost","items","esc","su","imgSrc","addrOf","stName","fmt","ls","openDv","openEdit","canW","idbGet","idbSave","del"];
var MM_NAMES={0:"Tắt (Chỉ DINOv3)",2:"Trung tâm 75% + CSLS",3:"Patch Token + MaxSim + Spatial + CSLS",4:"Patch + Spatial + Trung tâm + CSLS"};
function dupSfx(){
  var e=null,ds=224,f16=true,r;
  try{e=JSON.parse(localStorage.getItem("dup_eng")||"null")}catch(x){}
  r=+window.DUP_DINO_RES||(e&&+e.res)||0;
  if(r>=112&&r<=448&&r%16===0)ds=r;
  f16=window.DUP_DINO_F16!==undefined?window.DUP_DINO_F16!==false:!(e&&e.f16===false);
  return (ds===256?"":"r"+ds)+(f16?"":"x")}
function KH(){try{return window.Dup.keys().h}catch(e){return"dhc12"+dupSfx()}}
function KP(){try{return window.Dup.keys().p}catch(e){return"dpm7"+dupSfx()}}
function failCoolMs(f){return f&&f.n>=4?86400000:f&&f.n>=3?3600000:300000}
function dupCfg(){
  var sm=null;try{if(window.Dup&&typeof window.Dup.smart==="function")sm=window.Dup.smart()}catch(e){}
  if(sm)return{th:sm.th||80,algo:sm.algo||0,mm:sm.mm!==undefined?sm.mm:3};
  var T=window.NT,th=80,eng=null,mm=3;
  try{var t=+(T&&T.ls?T.ls("dsim"):localStorage.getItem("dsim"));if(t>=60&&t<=99)th=Math.round(t)}catch(e){}
  try{eng=JSON.parse(localStorage.getItem("dup_eng")||"null")}catch(e){}
  if(eng&&typeof eng==="object"){
    var v=eng.mm!==undefined?(+eng.mm|0):3,mv=eng.mmv?(+eng.mmv|0):0;
    mm=mv<2?(v===0?0:3):((v===0||v===2||v===3||v===4)?v:3);
  }
  return{th:th,algo:0,mm:mm}}
var MOD={Ck:["init","renderCk","ckFlush","ckPersist"],Img:["init","openLb","iwGal","iwNow","iwIntent","iwCkNow"],Dup:["pull","init","open","close","sync","closeZoom"],Bk:["init"]};
var IDS=["list","ckb","lb","lbi","lbc","lbn","lbp","upd","pgCk","bk","bd","bsel","bim","bm"];
var NET=/failed to fetch|load failed|networkerror|network request|internet connection|mất kết nối|aborted/i;
var LIM={s:3000,l:700,w:360};

function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function kb(n){return n>=1048576?(n/1048576).toFixed(1)+" MB":Math.round(n/1024)+" KB"}

/* ---------- Chờ các thành phần nạp xong (tối đa 10 giây) ---------- */
function ready(){return !!(window.NK&&window.NI&&window.NT&&window.NB&&window.Ck&&window.Img&&window.Dup&&window.Bk)}
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

/* ---------- Thu thập trạng thái có cấu trúc cho thuật toán Auto-Fix ---------- */
function freshMeta(){
  return {
    swReg:null,swActive:false,swWaiting:false,swNoController:false,swCallMissing:false,swVer:"",swList:[],
    shellCacheName:"",hasShellCache:false,shellCachedCount:0,shellMiss:[],nextCaches:[],
    imgCount:0,imgS:0,imgL:0,imgPS:0,imgPL:0,
    lsBytes:0,persisted:true,canPersist:false,
    idbExists:false,idbMissingStore:false,idbUnreadable:false,idbCount:0,
    compBroken:false,bridgeBroken:false,missingIgnStat:false,
    itemsCount:0,hasDpm:false,hasDhc:false,
    pmBad:false,pmThMismatch:false,pmTargetTh:80,pmTargetAlgo:0,pmTargetMm:3,pmMismatchReason:"",pmStale:0,pmOrphan:0,pmExpiredFail:0,
    hcBad:false,
    igBad:false,igLsN:-1,igIdbN:-1,igQueueCount:0,igRawLs:"",igRawIdb:"",
    ckcBad:false,ckNeedCount:0,
    srvItemMismatch:false,srvRoleMismatch:false,srvHashBehind:false,srvDupDesync:false,
    psBad:false,psLsN:-1,psIdbN:-1,psQueueCount:0,psRawLs:"",psRawIdb:"",dupConflict:0,dupRamDiff:false,srvPosDesync:false,srvPosUnsupported:false,srvPairConflict:0,srvOnlyLocal:0
  }}

/* ---------- Các nhóm kiểm tra ---------- */
function chkComponents(add,w,M){
  var g="Thành phần";
  if(!w.ok){
    M.compBroken=true;
    ["NK","NI","NT","NB","Ck","Img","Dup","Bk"].forEach(function(k){if(!window[k])add("bad",g,k+" chưa sẵn sàng sau 10 giây (tệp liên quan không nạp được hoặc index.html chạy lỗi)","COMP_NOT_READY")});
  }else add("ok",g,"Đủ NK, NI, NT, NB, Ck, Img, Dup, Bk (sẵn sàng sau "+w.ms+" ms kể từ lúc kiểm tra)");
  Object.keys(MOD).forEach(function(m){
    if(!window[m])return;
    var miss=MOD[m].filter(function(k){return typeof window[m][k]!=="function"});
    if(miss.length){M.compBroken=true;add("bad",g,m+" thiếu hàm: "+miss.join(", ")+" (có thể lệch phiên bản giữa các tệp)","MOD_METHOD_MISSING")}});
  if(window.Ck&&!(G("ckb")&&typeof G("ckb").onclick==="function")){M.compBroken=true;add("bad",g,"ck.js đã nạp nhưng chưa khởi tạo (Ck.init chưa chạy)","MOD_NOT_INIT")}
  if(window.Img&&!(G("lb")&&typeof G("lb").onclick==="function")){M.compBroken=true;add("bad",g,"img.js đã nạp nhưng chưa khởi tạo (Img.init chưa chạy)","MOD_NOT_INIT")}
  if(window.Bk&&!(G("bk")&&G("bk").dataset.ready==="1")){M.compBroken=true;add("bad",g,"bk.js đã nạp nhưng chưa khởi tạo (Bk.init chưa chạy, nút Sao lưu/khôi phục sẽ không hoạt động)","MOD_NOT_INIT")}
  if(window.Dup&&!(G("dupd")&&G("dupb"))){M.compBroken=true;add("bad",g,"dup.js đã nạp nhưng chưa dựng giao diện Kiểm tra trùng","MOD_NOT_INIT")}
  if(NOTRAP)add("warn",g,"Thiếu đoạn bắt lỗi sớm (window.__dbg) trong <head> của index.html: lỗi và tác vụ treo xảy ra trước khi dbg.js nạp sẽ không được ghi lại");
  var noId=IDS.filter(function(i){return !G(i)});
  if(noId.length){M.compBroken=true;add("bad",g,"Thiếu phần tử trong trang: "+noId.join(", "),"DOM_MISSING")}}
function bridge(add,obj,name,keys,fns,M){
  if(!obj){M.bridgeBroken=true;add("bad","Cầu nối",name+" chưa khai báo","BRIDGE_MISSING");return}
  var miss=keys.filter(function(k){return !(k in obj)});
  var bad=fns.filter(function(k){var v;try{v=obj[k]}catch(e){return true}return k in obj&&typeof v!=="function"});
  if(miss.length||bad.length){
    M.bridgeBroken=true;
    add("bad","Cầu nối",name+": thiếu "+(miss.join(", ")||"–")+(bad.length?" · sai kiểu "+bad.join(", "):"")+" (index.html và các tệp con không cùng phiên bản)","BRIDGE_SKEW");
  }else add("ok","Cầu nối",name+": đủ "+keys.length+" mục")}
var S_KEYS=["id","cur","dirty","t","q","upN","saveN","err","fresh","trashQ","upQ","c","a"];
function chkBridgeVer(add,M){
  [["NK","Ck"],["NI","Img"],["NT","Dup"],["NB","Bk"]].forEach(function(p){
    var a=window[p[0]],b=window[p[1]];if(!a||!b)return;
    if(a.v!==b.v){M.bridgeBroken=true;add("bad","Cầu nối",p[0]+" v"+a.v+" khác "+p[1]+" v"+b.v+" (index.html và tệp con không cùng phiên bản)","BRIDGE_VER")}
    else add("ok","Cầu nối",p[0]+" và "+p[1]+" cùng phiên bản v"+a.v)});
  var S=window.NK&&window.NK.S;
  if(S){var ms=S_KEYS.filter(function(k){return !(k in S)});
    if(ms.length){M.bridgeBroken=true;add("bad","Cầu nối","NK.S thiếu: "+ms.join(", "),"BRIDGE_STATE")}
    else add("ok","Cầu nối","NK.S (trạng thái checklist): đủ "+S_KEYS.length+" mục")}}
function chkBridges(add,M){
  bridge(add,window.NK,"NK (ck.js)",NK_KEYS,NK_FN,M);
  bridge(add,window.NI,"NI (img.js)",NI_KEYS,NI_FN,M);
  bridge(add,window.NT,"NT (dup.js)",NT_KEYS,NT_KEYS.filter(function(k){return k!=="v"}),M);
  bridge(add,window.NB,"NB (bk.js)",NB_KEYS,NB_FN,M);
  chkBridgeVer(add,M)}
function chkRes(add){
  var rs=[];try{rs=performance.getEntriesByType("resource")||[]}catch(e){}
  FILES.forEach(function(f){
    var r=rs.filter(function(x){return x.name.split("?")[0].slice(-f.length-1)==="/"+f})[0];
    if(!r){add("info","Tệp",f+": không có trong số liệu tải (có thể bị trình duyệt giới hạn)");return}
    if(r.responseStatus&&r.responseStatus>=400){add("bad","Tệp",f+": lỗi HTTP "+r.responseStatus,"ASSET_HTTP_ERR");return}
    var local=r.transferSize===0&&!r.decodedBodySize;
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
function chkSw(add,M){
  var g="Service worker";
  if(!("serviceWorker" in navigator)){add("info",g,"Không được hỗ trợ ở môi trường này");return Promise.resolve()}
  if(!/^https?:$/i.test(location.protocol)){add("info",g,"Không chạy ở giao thức "+location.protocol);return Promise.resolve()}
  return navigator.serviceWorker.getRegistration().then(function(reg){
    M.swReg=reg||null;
    if(!reg){
      add("warn",g,"Chưa đăng ký (ảnh chưa được lưu bền)","SW_NOT_REGISTERED");
      if(B.swCall===undefined){M.swCallMissing=true;add("bad",g,"Mã đăng ký service worker chưa từng được gọi (trang tải xong trước khi đoạn đăng ký kịp chạy)","SW_CALL_MISSING")}
      else add("info",g,"Đã gọi đăng ký lúc +"+(B.swCall/1000).toFixed(1)+"s"+(B.swOk!==undefined?", hoàn tất lúc +"+(B.swOk/1000).toFixed(1)+"s":", chưa hoàn tất (xem mục Lỗi đã ghi)"));
      return}
    if(B.swCall!==undefined)add("info",g,"Đăng ký được gọi lúc +"+(B.swCall/1000).toFixed(1)+"s"+(B.swOk!==undefined?", sẵn sàng lúc +"+(B.swOk/1000).toFixed(1)+"s":""));
    var sw=reg.active;
    M.swActive=!!sw;
    add(sw?"ok":"warn",g,"Đăng ký rồi · "+(sw?sw.state:reg.installing?"đang cài":reg.waiting?"đang chờ":"?")+" · phạm vi "+reg.scope.replace(location.origin,""));
    if(!navigator.serviceWorker.controller){M.swNoController=true;add("warn",g,"Chưa kiểm soát trang này: ảnh chưa được lưu bền. Mở lại trang một lần nữa.","SW_NO_CONTROLLER")}
    if(reg.waiting){M.swWaiting=true;add("warn",g,"Có bản service worker mới đang chờ kích hoạt. Đóng hết cửa sổ app rồi mở lại.","SW_WAITING")}
    return ping(sw).then(function(p){
      if(!p){add("info",g,"Chưa đọc được phiên bản (service worker cũ chưa hỗ trợ lệnh kiểm tra)");return}
      if(p.lim)LIM=p.lim;
      add("ok",g,"Phiên bản "+p.v+" · chế độ "+(p.app?"APK/App (không lưu vỏ app)":"PWA"));
      if(window.Capacitor&&!p.app)add("warn",g,"Đang chạy trong APK nhưng service worker ở chế độ PWA");
      if(!window.Capacitor&&p.app)add("warn",g,"Service worker ở chế độ APK nhưng trang không chạy trong APK")})},function(){})}
function headOk(u){return fetch(u,{method:"HEAD",cache:"no-store"}).then(function(r){return r.status},function(){return 0})}
function swFiles(tx){
  var o={v:"",list:[]},m=/const\s+VERSION\s*=\s*'([^']+)'/.exec(tx);if(m)o.v=m[1];
  var map={},re=/const\s+(\w+)\s*=\s*'(\.\/[^']+)'/g,x;
  while((x=re.exec(tx)))map[x[1]]=x[2];
  var l=/SHELL_FILES\s*=\s*\[([\s\S]*?)\]\s*;/.exec(tx);
  if(l)l[1].split(",").forEach(function(t){t=t.replace(/\/\/.*$/gm,"").trim();var q=/^'([^']+)'$/.exec(t);var f=q?q[1]:map[t];if(f&&f!=="./")o.list.push(f)});
  return o}
function chkAssets(add,M){
  var g="Tệp cài đặt";
  if(!/^https?:$/i.test(location.protocol))return Promise.resolve();
  var sw={v:"",list:[]};
  return fetch("sw.js",{cache:"no-store"}).then(function(r){
    if(!r.ok){add("bad",g,"sw.js: HTTP "+r.status);return}
    return r.text().then(function(tx){sw=swFiles(tx);M.swVer=sw.v;M.swList=sw.list.slice()})
  },function(){}).then(function(){
    return fetch("manifest.webmanifest",{cache:"no-store"}).then(function(r){
      if(!r.ok){add("bad",g,"manifest.webmanifest: HTTP "+r.status+" (không cài được ra màn hình chính)");return null}
      return r.json().then(function(m){return m},function(){add("bad",g,"manifest.webmanifest không phải JSON hợp lệ");return null})
    },function(){add("warn",g,"Không tải được manifest.webmanifest (đang offline?)");return null})
  }).then(function(m){
    var urls=[],seen={};
    sw.list.forEach(function(f){urls.push(new URL(f,location.href).href)});
    if(m){
      var ic=m.icons||[],has={},mask=false;
      ic.forEach(function(x){
        String(x.sizes||"").split(/\s+/).forEach(function(z){has[z]=1});
        if(/maskable/.test(x.purpose||""))mask=true;
        if(x.src)urls.push(new URL(x.src,location.href).href)});
      if(!m.name&&!m.short_name)add("warn",g,"manifest thiếu name/short_name");
      if(!m.start_url)add("warn",g,"manifest thiếu start_url");
      if(!/^(standalone|fullscreen|minimal-ui)$/.test(m.display||""))add("warn",g,"manifest display=\""+(m.display||"không có")+"\": app sẽ mở như tab trình duyệt thay vì app riêng");
      if(!has["192x192"]||!has["512x512"])add("warn",g,"manifest thiếu icon 192x192 hoặc 512x512 (Chrome cần đủ cả hai để cho cài)");
      if(!mask)add("warn",g,"manifest chưa có icon maskable: Android tự thu nhỏ icon vào ô tròn nên logo có thể nhỏ và có viền trắng");
      else add("ok",g,"manifest: có icon maskable, "+ic.length+" icon, display="+m.display)}
    Array.prototype.forEach.call(document.querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"],link[rel="manifest"]'),function(l){if(l.href)urls.push(l.href)});
    urls=urls.filter(function(u){if(seen[u])return false;return seen[u]=1}).slice(0,40);
    return Promise.all(urls.map(function(u){return headOk(u).then(function(c){return{u:u,c:c,ok:c>=200&&c<400}})})).then(function(rs){
      var bad=rs.filter(function(x){return !x.ok});
      bad.forEach(function(x){
        var font=/\/fonts\//.test(x.u);
        add(font?"warn":"bad",g,x.u.replace(location.origin,"")+": "+(x.c?"HTTP "+x.c:"không tải được")+(font?" (sw.js liệt kê nhưng không có: không lưu offline được, chữ có thể đổi font)":/icon/.test(x.u)?" (thiếu tệp icon hoặc sai đường dẫn)":""))});
      if(!bad.length)add("ok",g,"Đủ "+rs.length+" tệp (sw.js"+(sw.v?" "+sw.v:"")+", manifest, icon, font, mã nguồn)");
      if(isApk()||!window.caches||!sw.v||!navigator.serviceWorker||!navigator.serviceWorker.controller)return;
      M.shellCacheName="shell-"+sw.v;
      return caches.open("shell-"+sw.v).then(function(c){
        return Promise.all(rs.filter(function(x){return x.ok&&sw.list.some(function(f){return new URL(f,location.href).href===x.u})}).map(function(x){return c.match(x.u).then(function(h){return h?null:x.u})}))
      }).then(function(miss){
        miss=miss.filter(Boolean);
        M.shellMiss=miss.slice();
        if(miss.length)add("warn",g,miss.length+" tệp chưa lưu để dùng offline: "+miss.map(function(u){return u.replace(location.origin+"/","")}).join(", ")+" (mở lại app một lần khi có mạng)","SHELL_MISS_FILES")},function(){})})})}
function chkCaches(add,M){
  var g="Bộ nhớ đệm";
  if(!window.caches){add("info",g,"Không hỗ trợ Cache API");return Promise.resolve()}
  return caches.keys().then(function(ks){
    if(!ks.length){add("info",g,"Chưa có bộ nhớ đệm nào");return}
    return Promise.all(ks.map(function(k){return caches.open(k).then(function(c){return c.keys()}).then(function(l){return{k:k,l:l}})})).then(function(all){
      all.forEach(function(x){
        if(x.k==="img-v1"){
          var s=0,b=0;x.l.forEach(function(r){var m=/=w(\d+)$/.exec(r.url);if(m&&+m[1]<=LIM.w)s++;else b++});
          var pS=Math.round(s*100/LIM.s),pL=Math.round(b*100/LIM.l);
          M.imgCount=x.l.length;M.imgS=s;M.imgL=b;M.imgPS=pS;M.imgPL=pL;
          add(pS>=95||pL>=95?"warn":"ok",g,"Ảnh: "+s+" nhỏ ("+pS+"% hạn mức "+LIM.s+") · "+b+" lớn ("+pL+"% hạn mức "+LIM.l+")"+(pS>=95||pL>=95?" — cache đầy, ảnh cũ đang bị xóa dần":"") ,pS>=95||pL>=95?"IMG_CACHE_NEAR_LIMIT":null);
        }else if(/^next-/.test(x.k)){
          if(x.l.length)M.nextCaches.push(x.k);
          add(x.l.length?"warn":"ok",g,x.k+": "+(x.l.length?x.l.length+" tệp bản mới đang chờ áp dụng, hãy tải lại trang":"trống"),x.l.length?"NEXT_CACHE_PENDING":null);
        }else{
          if(/^shell-/.test(x.k)){M.hasShellCache=true;M.shellCachedCount=Math.max(M.shellCachedCount,x.l.length);if(!M.shellCacheName)M.shellCacheName=x.k}
          add("ok",g,x.k+": "+x.l.length+" mục")}})})})}
function chkStorage(add,M){
  var g="Dung lượng";
  var p=[];
  if(navigator.storage&&navigator.storage.estimate)p.push(navigator.storage.estimate().then(function(e){
    var pc=e.quota?Math.round(e.usage*100/e.quota):0;
    add(pc>=80?"warn":"ok",g,"Đã dùng "+kb(e.usage||0)+" / "+kb(e.quota||0)+" ("+pc+"%)")},function(){}));
  if(navigator.storage&&navigator.storage.persisted)p.push(navigator.storage.persisted().then(function(v){
    M.persisted=!!v;
    if(v)add("ok",g,"Lưu trữ bền: đã bật (trình duyệt không tự xóa khi thiếu chỗ)");
    else if(isApk())add("ok",g,whyNoPersist());
    else{add("info",g,"Lưu trữ bền: chưa bật. "+whyNoPersist());CAN=true;M.canPersist=true}},function(){}));
  try{
    var n=0,i,k;
    for(i=0;i<localStorage.length;i++){k=localStorage.key(i);n+=(k.length+(localStorage.getItem(k)||"").length)*2}
    M.lsBytes=n;
    add(n>4000000?"warn":"ok",g,"localStorage: "+kb(n)+(n>4000000?" — gần giới hạn 5 MB của iOS":""),n>4000000?"LS_NEAR_QUOTA":null)
  }catch(e){add("warn",g,"Không đọc được localStorage")}
  return Promise.all(p)}
function chkData(add,M){
  var g="Dữ liệu",K=window.NK,T=window.NT,items=[];
  try{items=(K&&K.items)||(T&&T.items&&T.items())||[]}catch(e){}
  M.itemsCount=items.length;
  var checkCkc=rdKey("ckc1").then(function(r){
    var raw=r.idb||r.ls;
    if(raw){
      var p=pjson(raw);
      if(p.bad||(p.o&&typeof p.o.c!=="object")){M.ckcBad=true;add("warn",g,"Dữ liệu checklist đã nhớ trên máy (ckc1) bị hỏng định dạng, cần đặt lại để tải lại từ Sheet","CKC_CORRUPT")}
    }
  },function(){});
  if(!items.length&&!ready()){return checkCkc}
  if(!items.length){add("warn",g,"Chưa có căn nào trên máy (chưa tải xong, đang offline, hoặc danh sách trống). Bấm \"Kiểm tra toàn bộ\" để xem lý do.","NO_ITEMS");return checkCkc}
  var ids={},dup=0,noName=0,withCk=0,need=0,odd=0,imG=0,imV=0,imH=0,ckC={},CKIDS={};
  try{ckC=K.S.c||{}}catch(e){}
  try{(K.CK||[]).forEach(function(s){(s.i||[]).forEach(function(x){CKIDS[x[0]]=1})})}catch(e){}
  items.forEach(function(it){
    if(ids[it.id])dup++;ids[it.id]=1;
    if(!it.n)noName++;
    imG+=(it.im||[]).length;
    var c=it.ck;if(!c)return;
    var nv=(c.vi||[]).length,nh=(c.im||[]).length;
    imV+=nv;imH+=nh;
    var has=nv+nh>0||!!(c.nt&&String(c.nt).trim());
    try{var l=K&&K.ckLiteOf?K.ckLiteOf(c):null;if(l&&l.s&&(l.s[0]+l.s[1]+l.s[2])>0)has=true}catch(e){}
    if(!has)return;
    withCk++;
    var cc=ckC[it.id];if(!(cc&&cc.h===(c.h||"")))need++;
    if(cc&&cc.ck&&cc.ck.c)for(var k in cc.ck.c)if(!CKIDS[k]){odd++;break}});
  M.ckNeedCount=need;
  add("ok",g,items.length+" căn · ảnh gốc "+imG+" · ảnh đi xem "+imV+" · ảnh hư hỏng "+imH+" · "+withCk+" căn có checklist");
  if(dup)add("bad",g,dup+" căn bị trùng mã (id), cần kiểm tra Sheet");
  if(noName)add("warn",g,noName+" căn chưa có tên");
  if(need)add("info",g,need+"/"+withCk+" checklist chưa tải về máy (đang tải ngầm hoặc đang offline)");
  if(odd)add("info",g,odd+" checklist có mục không còn trong biểu mẫu hiện tại (dữ liệu cũ, không ảnh hưởng)");
  if(K){
    if(K.S&&K.S.dirty)add("info",g,"Đang có thay đổi checklist chưa lưu");
    if(K.S&&K.S.saveN)add("info",g,"Đang lưu checklist lên Sheet");
    if(K.S&&((K.S.upN||0)>0||(K.S.upQ&&K.S.upQ.length)))add("info",g,(K.S.upN||(K.S.upQ&&K.S.upQ.length))+" ảnh đang tải lên");
    if(K.S&&K.S.trashQ&&K.S.trashQ.length)add("info",g,K.S.trashQ.length+" ảnh chờ chuyển vào thùng rác")}
  return checkCkc}
function clk(s){return new Date(B.t+s).toLocaleTimeString("vi-VN")}
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
      var top=ls.slice().sort(function(a,b){return b.d-a.d}).slice(0,3).map(function(x){return x.d+" ms lúc +"+(x.s/1000).toFixed(1)+"s ("+clk(x.s)+")"}).join(" · ");
      add("info",g,"Nặng nhất: "+top+" · "+Math.round(early)+" ms nằm trong 5 giây đầu")}}
  if(B.laf&&B.laf.length){
    var tl=B.laf.slice().sort(function(a,b){return b.d-a.d}).slice(0,5).map(function(x){return x.d+" ms lúc +"+(x.s/1000).toFixed(1)+"s ("+clk(x.s)+"): "+(x.u||"không có script")+(x.f?" "+x.f+"()":"")+(x.i?" ← "+x.i:"")+" · script "+x.c+" ms · bố cục/vẽ "+x.y+" ms"}).join(" | ");
    add("info",g,"Khung hình nặng nhất theo nguồn: "+tl)}
  else if(B.laf)add("info",g,"Chưa ghi nhận khung hình nặng nào (trên 50 ms), hoặc trình duyệt không hỗ trợ đo theo nguồn")}
function mb(n){return (n/1048576).toFixed(n>=104857600?0:1)+" MB"}
function chkEnv(add){
  var g="Thiết bị & mạng",c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  if(navigator.onLine===false)add("warn",g,"Trình duyệt báo đang offline");
  else add("info",g,"Trình duyệt báo có mạng (chỉ là trạng thái của thiết bị, chưa chắc ra được internet"+(S?"":"; bấm \"Kiểm tra toàn bộ\" để thử thật")+")");
  if(c){
    var p=[];
    if(c.type)p.push("loại "+c.type);
    if(c.effectiveType)p.push("tốc độ ước tính "+c.effectiveType);
    if(typeof c.downlink==="number")p.push("băng thông ~"+c.downlink+" Mbps"+(c.downlink>=10?" (trình duyệt chỉ báo tối đa 10)":""));
    if(typeof c.rtt==="number")p.push("độ trễ ~"+c.rtt+" ms");
    if(c.saveData)p.push("đang bật tiết kiệm dữ liệu");
    add(/^(slow-2g|2g)$/.test(c.effectiveType||"")?"warn":"info",g,"Kết nối: "+(p.join(" · ")||"không có chi tiết")+". Đây là số ước tính từ các lần tải gần đây, không phải phép đo tốc độ, và \"4g\" không có nghĩa là đang dùng 4G (Wi-Fi cũng hiện 4g)");
  }else add("info",g,"Trình duyệt này (Safari/Firefox) không cung cấp loại mạng, băng thông hay độ trễ");
  var dm=navigator.deviceMemory;
  if(dm)add(dm<=1?"warn":"info",g,"RAM máy: "+(dm>=8?"từ 8 GB trở lên (trình duyệt chỉ báo tối đa 8)":"khoảng "+dm+" GB")+". Số đã làm tròn xuống theo bậc 0,5/1/2/4/8, là tổng RAM chứ không phải RAM còn trống");
  else add("info",g,"Trình duyệt không cho biết RAM máy (chỉ Chrome/Edge/Opera và chỉ trên https)");
  if(navigator.hardwareConcurrency)add("info",g,"Số nhân CPU: "+navigator.hardwareConcurrency);
  var wg=!!navigator.gpu;
  add("info",g,"WebGPU: "+(wg?"có (DINOv3 sẽ chạy bằng GPU nếu qua bước thử)":"không có (DINOv3 chạy WASM)")+" · crossOriginIsolated: "+(window.crossOriginIsolated?"bật":"tắt"));
  try{if(window.Dup&&typeof window.Dup.dino==="function")(function(){var ds=window.Dup.dino(),nc=typeof window.Dup.cached==="function"?window.Dup.cached():-1;add("info",g,"DINOv3: "+ds+(nc>=0?" · hash ảnh đã có trên máy: "+nc+"":"")+" · khóa "+KH()+"/"+KP())})()}catch(e){}
  try{if(window.Dup&&typeof window.Dup.smart==="function"){var sm=window.Dup.smart(),mmLbl=MM_NAMES[sm.mm!==undefined?sm.mm:3]||("mode "+sm.mm);add("info",g,"Ngưỡng ảnh: mạnh "+sm.ts+"% · yếu "+sm.tl+"%"+(sm.algo?" · algo v"+sm.algo:"")+" · vùng xám: "+mmLbl+" · giữ "+sm.kept+" · bỏ "+sm.cut+(sm.mmChecked?" (xác minh "+sm.mmChecked+": bỏ "+sm.mmCut+", giữ/tăng "+sm.mmBoost+")":""))}}catch(e){}
  var m=null;try{m=performance.memory}catch(e){}
  if(m&&m.jsHeapSizeLimit){
    var pc=Math.round(m.usedJSHeapSize*100/m.jsHeapSizeLimit);
    add(pc>=70?"warn":"info",g,"Bộ nhớ JS của trang: "+mb(m.usedJSHeapSize)+" / giới hạn "+mb(m.jsHeapSizeLimit)+" ("+pc+"%). Chrome làm tròn thô số này, chỉ dùng để so sánh tương đối")}
  else add("info",g,"Không đọc được bộ nhớ JS của trang (trình duyệt không hỗ trợ)")}
function chkGpu(add){
  var g="GPU (WebGPU)",ua=navigator.userAgent||"",cm=/Chrome\/(\d+)/.exec(ua);
  add("info",g,"Môi trường: "+(isApk()?"APK (WebView)":isStandalone()?"PWA":"tab trình duyệt")+(cm?" · Chromium "+cm[1]:"")+" · DINOv3 dùng GPU: "+(window.DUP_DINO_GPU===false?"đã tắt bằng DUP_DINO_GPU=false":"cho phép"));
  if(!navigator.gpu){add("info",g,"Không có WebGPU ở môi trường này (navigator.gpu không tồn tại) → DINOv3 chạy WASM, không dùng được fp16 trên GPU");return Promise.resolve()}
  var to=new Promise(function(r){setTimeout(function(){r("timeout")},4000)});
  return Promise.race([navigator.gpu.requestAdapter(),to]).then(function(a){
    if(a==="timeout"){add("warn",g,"requestAdapter không phản hồi sau 4 giây");return}
    if(!a){add("warn",g,"Có navigator.gpu nhưng không lấy được adapter (thiết bị/driver không hỗ trợ) → chạy WASM");return}
    var f=false,sg=false,inf=null,lim=a.limits||{},p=[];
    try{f=a.features.has("shader-f16");sg=a.features.has("subgroups")}catch(e){}
    try{inf=a.info||null}catch(e){}
    if(inf){var n=[inf.vendor,inf.architecture,inf.description||inf.device].filter(Boolean).join(" / ");if(n)p.push("GPU: "+n)}
    if(a.isFallbackAdapter)p.push("adapter phần mềm (fallback, sẽ chậm)");
    if(lim.maxBufferSize)p.push("maxBufferSize "+mb(lim.maxBufferSize));
    if(lim.maxStorageBufferBindingSize)p.push("maxStorageBinding "+mb(lim.maxStorageBufferBindingSize));
    add(f?"ok":"info",g,"shader-f16: "+(f?"CÓ → chạy được model fp16/q4f16 trên GPU":"KHÔNG → chỉ nên dùng fp32 trên WebGPU (hoặc WASM)")+" · subgroups: "+(sg?"có":"không"));
    add(a.isFallbackAdapter?"warn":"info",g,"Adapter WebGPU lấy được"+(p.length?": "+p.join(" · "):""))
  },function(e){add("warn",g,"requestAdapter lỗi: "+(e&&e.message||e))})}
function chkErrors(add){
  var g="Lỗi đã ghi";
  if(!B.e.length){add("ok",g,"Không có lỗi nào được ghi lại");return}
  B.e.slice(-8).forEach(function(x){
    var own=/\/(ck|img|dup|dbg|sw)\.js|index\.html/.test(x.s||"")||x.k==="load";
    var net=NET.test(x.m);
    var lv=net?"info":(x.k==="load"||own)?"bad":"warn";
    var where=x.s?" ("+x.s.split("/").pop()+(x.l?":"+x.l:"")+")":"";
    add(lv,g,"["+x.k+" +"+(x.t/1000).toFixed(1)+"s] "+x.m+where)})}

/* ---------- Theo dõi mạng thụ động + kiểm tra IndexedDB ---------- */
var NL=B.nl||(B.nl={off:0,on:0,t:0,ev:[]});
function nlog(k){NL[k]++;NL.t=Date.now();if(NL.ev.length<30)NL.ev.push({k:k,t:Date.now()-B.t})}
window.addEventListener("offline",function(){nlog("off")});
window.addEventListener("online",function(){nlog("on")});
function chkNative(add){
  var g="Plugin Android (APK)",C=window.Capacitor,names=[];
  if(!isApk()||!C)return;
  try{(C.PluginHeaders||[]).forEach(function(h){if(h&&h.name)names.push(h.name)})}catch(e){}
  if(!names.length){add("warn",g,"Không đọc được danh sách plugin gốc (Capacitor.PluginHeaders trống)");return}
  var need=["App","StatusBar","Filesystem","Share","SplashScreen"],miss=need.filter(function(n){return names.indexOf(n)<0});
  add(miss.length?"bad":"ok",g,miss.length?"Thiếu plugin app đang dùng: "+miss.join(", ")+" (chạy lại npm run sync và build lại APK)":"Đủ 5 plugin app đang dùng: "+need.join(", "));
  var extra=names.filter(function(n){return need.indexOf(n)<0});
  add("info",g,"Tất cả plugin đã đăng ký ("+names.length+"): "+names.sort().join(", ")+(extra.length?"":" · không có plugin dịch vụ nền hay plugin riêng nào khác"))}
function chkMode(add){
  var g="Thiết bị & mạng";
  if(isApk()){add("ok",g,"Chế độ chạy: APK (Capacitor)");return}
  if(isStandalone()){add("ok",g,"Chế độ chạy: PWA đã cài, mở từ màn hình chính");return}
  add("warn",g,"Chế độ chạy: tab trình duyệt (chưa cài app). Chrome có thể dọn dữ liệu và không cấp lưu trữ bền cho tab; hãy chọn \"Cài đặt ứng dụng\" (menu ⋮) rồi mở từ biểu tượng trên màn hình chính")}
function chkLink(add){
  var g="Thiết bị & mạng";
  if(!NL.off&&!NL.on){add("ok",g,"Từ lúc mở trang chưa có lần mất/có mạng nào");return}
  var n=NL.off,last=Math.round((Date.now()-NL.t)/1000);
  add(n>=3?"warn":"info",g,"Từ lúc mở trang: mất mạng "+n+" lần, có lại "+NL.on+" lần (gần nhất "+(last>=120?Math.round(last/60)+" phút":last+" giây")+" trước)"+(n>=3?" — kết nối chập chờn, ảnh và lưu dữ liệu dễ bị gián đoạn":""))}
function chkIdb(add,M){
  var g="Dung lượng";
  if(!window.indexedDB)return Promise.resolve();
  var checkDb=function(){
    return new Promise(function(res){
      var done=false,tm=setTimeout(function(){fin(function(){M.idbUnreadable=true;add("warn",g,"IndexedDB: mở kho dữ liệu quá 4 giây (bị khóa bởi cửa sổ khác?)","IDB_TIMEOUT")})},4000);
      function fin(f){if(done)return;done=true;clearTimeout(tm);try{f()}catch(e){}res()}
      var r;try{r=indexedDB.open("nha-thue-kv")}catch(e){fin(function(){M.idbUnreadable=true;add("bad",g,"IndexedDB: không mở được ("+(e&&e.message||e)+")","IDB_OPEN_ERR")});return}
      r.onerror=function(){fin(function(){M.idbUnreadable=true;add("bad",g,"IndexedDB: không mở được ("+(r.error&&r.error.message||"lỗi")+"), dữ liệu bền của app có thể không lưu được","IDB_OPEN_ERR")})};
      r.onblocked=function(){};
      r.onsuccess=function(){
        var db=r.result;
        if(!db.objectStoreNames.contains("kv")){
          db.close();
          fin(function(){M.idbMissingStore=true;add("bad",g,"IndexedDB: thiếu kho \"kv\" (kho dữ liệu bị tạo dở, hãy dùng \"Làm mới bản cài app\")","IDB_NO_STORE")});
          return}
        try{
          var q=db.transaction("kv","readonly").objectStore("kv").count();
          q.onsuccess=function(){var n=q.result;M.idbExists=true;M.idbCount=n;db.close();fin(function(){add("ok",g,"IndexedDB: đọc được, "+n+" mục")})};
          q.onerror=function(){db.close();fin(function(){M.idbUnreadable=true;add("warn",g,"IndexedDB: mở được nhưng không đọc được","IDB_READ_ERR")})}
        }catch(e){try{db.close()}catch(x){}fin(function(){M.idbUnreadable=true;add("warn",g,"IndexedDB: lỗi khi đọc ("+(e&&e.message||e)+")","IDB_READ_ERR")})}}})};
  if(indexedDB.databases){
    return indexedDB.databases().then(function(ds){
      if(!ds.some(function(d){return d.name==="nha-thue-kv"})){M.idbExists=false;add("info",g,"IndexedDB: chưa có kho dữ liệu của app (sẽ tạo khi có dữ liệu)","IDB_NOT_CREATED");return}
      M.idbExists=true;
      return checkDb()},function(){return checkDb()})}
  return checkDb()}

/* ---------- Đồng bộ dữ liệu quét trùng ---------- */
function fnv(s){var h=2166136261,i;s=String(s);for(i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return("0000000"+(h>>>0).toString(16)).slice(-8)}
function imgsOf(it){return(it.im||[]).filter(function(s){return s&&String(s).indexOf("data:")!==0})}
function fpItems(L){return fnv(L.map(function(it){return it.id+":"+(it.st||"new")+":"+imgsOf(it).slice().sort().join(",")}).sort().join("\n"))}
function fpKeys(ks){return fnv(ks.slice().sort().join("\n"))}
function rdKey(k){
  var T=window.NT,v="";
  try{v=(T&&T.ls&&T.ls(k))||""}catch(e){}
  return Promise.resolve(T&&T.idbGet?T.idbGet(k):"").then(function(x){return{ls:v,idb:typeof x==="string"?x:""}},function(){return{ls:v,idb:""}})}
function pjson(raw){if(!raw)return{o:null};try{var o=JSON.parse(raw);return o&&typeof o==="object"?{o:o}:{o:null,bad:true}}catch(e){return{o:null,bad:true}}}
function ignRead(){
  return Promise.all([rdKey("dign1"),rdKey("dign1q")]).then(function(r){
    var a=pjson(r[0].ls||r[0].idb),q=pjson(r[1].ls||r[1].idb);
    return{ign:a.o||{},q:q.o||{},bad:!!(a.bad||q.bad),rawLs:r[0].ls,rawIdb:r[0].idb,
      lsN:r[0].ls?Object.keys(pjson(r[0].ls).o||{}).length:-1,idbN:r[0].idb?Object.keys(pjson(r[0].idb).o||{}).length:-1}})}
/* ---------- Đồng bộ cặp «Trùng» (dsp1/dsp1q) + quét kiểm + lệnh sửa ---------- */
function posNorm(o){
  if(Array.isArray(o)){var m={};o.forEach(function(k){if(k)m[String(k)]=1});return m}
  var m2={};Object.keys(o||{}).forEach(function(k){if(o[k])m2[k]=+o[k]||1});return m2}
function posRead(){
  return Promise.all([rdKey("dsp1"),rdKey("dsp1q")]).then(function(r){
    var a=pjson(r[0].ls||r[0].idb),q=pjson(r[1].ls||r[1].idb);
    return{pos:posNorm(a.o),q:q.o||{},bad:!!(a.bad||q.bad),rawLs:r[0].ls,rawIdb:r[0].idb,
      lsN:r[0].ls?Object.keys(posNorm(pjson(r[0].ls).o)).length:-1,idbN:r[0].idb?Object.keys(posNorm(pjson(r[0].idb).o)).length:-1}})}
function liveFn(items){var m={};items.forEach(function(it){m[it.id]=1});return function(k){var a=k.split("|");return !!(m[a[0]]&&m[a[1]])}}
/* so một danh sách cặp trên máy với máy chủ (có tính hàng đợi chưa gửi: q[k]>0 = chờ thêm, q[k]===0 = chờ xóa) */
function cmpPairs(loc,q,srv,live){
  var lk=Object.keys(loc).filter(live),sk=Object.keys(srv).filter(live);
  return{lk:lk,sk:sk,
    onlyL:lk.filter(function(k){return !srv[k]&&!(q[k]>0)}),
    onlyS:sk.filter(function(k){return !loc[k]&&q[k]!==0}),
    fL:fpKeys(lk),fS:fpKeys(sk)}}
function bothKeys(a,b){return Object.keys(a).filter(function(k){return a[k]>0&&b[k]>0})}
function chkPosLocal(add,g,M,ig,ps,live){
  M.psBad=!!ps.bad;M.psRawLs=ps.rawLs;M.psRawIdb=ps.rawIdb;M.psLsN=ps.lsN;M.psIdbN=ps.idbN;
  var nq=Object.keys(ps.q).length;M.psQueueCount=nq;
  if(ps.bad)add("bad",g,"Danh sách \"Trùng\" (dsp1) bị hỏng, không đọc được. Dùng \"Sửa đồng bộ cặp trùng\"","DSP_CORRUPT");
  if(nq)add("warn",g,nq+" thay đổi \"Trùng\" chưa gửi lên máy chủ: máy khác chưa thấy. Cần có mạng và quyền sửa; dùng \"Sửa đồng bộ cặp trùng\" để gửi","DSP_QUEUE");
  if(ps.lsN>=0&&ps.idbN>=0&&ps.lsN!==ps.idbN)add("info",g,"\"Trùng\": localStorage có "+ps.lsN+" cặp, IndexedDB có "+ps.idbN+" cặp (có thể vừa thay đổi, đang ghi dở)","DSP_LS_IDB_DIFF");
  var cf=bothKeys(ig.ign,ps.pos).filter(live);M.dupConflict=cf.length;
  if(cf.length)add("warn",g,cf.length+" cặp nằm cùng lúc ở \"Không phải trùng\" và \"Trùng\" trên máy: bên đánh dấu sau sẽ thắng khi sửa đồng bộ","DUP_CONFLICT");
  var orph=Object.keys(ps.pos).filter(function(k){return !live(k)}).length;
  add("info",g,"Trùng: "+Object.keys(ps.pos).length+" cặp trên máy"+(orph?" · "+orph+" cặp trỏ tới căn không còn (app tự ẩn)":"")+" · mã "+fpKeys(Object.keys(ps.pos).filter(live)));
  try{
    if(window.Dup&&typeof window.Dup.syncState==="function"){
      var st=window.Dup.syncState();
      if(!st.busy){
        var dI=fpKeys(Object.keys(st.ign))!==fpKeys(Object.keys(ig.ign)),dP=fpKeys(Object.keys(st.pos))!==fpKeys(Object.keys(ps.pos));
        if(dI||dP){M.dupRamDiff=true;add("warn",g,"Bộ nhớ đang chạy lệch bản đã lưu ("+(dI?"Không phải trùng":"")+(dI&&dP?" + ":"")+(dP?"Trùng":"")+"): dữ liệu lưu có thể bị ghi đè hoặc thiếu khi tải lại. Dùng \"Sửa đồng bộ cặp trùng\" để ghi lại","DUP_RAM_DIFF")}
      }
    }else add("info",g,"dup.js trên máy này chưa có Dup.syncState/Dup.resync: cập nhật dup.js để dùng quét kiểm và lệnh sửa đồng bộ cặp trùng","DUP_OLD_SYNC")
  }catch(e){}
}
/* Quét kiểm đồng bộ cặp trùng (nhóm "Đồng bộ · Cặp trùng"): so «Không phải trùng» + «Trùng» giữa máy và máy chủ.
   Trả {L: dòng kết quả, SM: cờ lệch, M: số liệu máy để lập kế hoạch sửa}. Dòng đầu là kết luận "thành công" khi mọi thứ khớp. */
var DGRP="Đồng bộ · Cặp trùng";
function dupScan(){
  var g=DGRP,L=[],SM={dupDesync:false,posDesync:false,posUnsupported:false,pairConflict:0,onlyLocal:0},M={},T=window.NT,items=[];
  function add(s,gr,t){L.push({s:s,g:g,t:t})}
  function res(){return{L:L,SM:SM,M:M}}
  try{items=(T&&T.items&&T.items())||[]}catch(e){}
  if(!(window.NB&&window.NB.apiGet)||!items.length){return Promise.resolve(res())}
  if(navigator.onLine===false){add("info",g,"Thiết bị đang offline: chưa đối chiếu cặp trùng với máy chủ");return Promise.resolve(res())}
  return Promise.all([ignRead(),posRead(),window.NB.apiGet("&action=dup",25000)]).then(function(r){
    var ig=r[0],ps=r[1],dd=r[2],live=liveFn(items),body=[];
    if(!dd||!dd.ok){add("bad",g,"Máy chủ từ chối danh sách cặp trùng: "+(dd&&dd.error||"không rõ lý do"));return}
    chkPosLocal(function(){},g,M,ig,ps,live);
    var sp={};(dd.pairs||[]).forEach(function(p){sp[p.k]=p.t||1});
    var c=cmpPairs(ig.ign,ig.q,sp,live),nqI=Object.keys(ig.q).length;
    SM.onlyLocal+=c.onlyL.length;
    if(c.onlyL.length||c.onlyS.length){SM.dupDesync=true;body.push({s:"warn",t:"Không phải trùng lệch máy chủ (mã máy "+c.fL+", máy chủ "+c.fS+"): "+(c.onlyL.length?c.onlyL.length+" cặp chỉ có trên máy":"")+(c.onlyL.length&&c.onlyS.length?", ":"")+(c.onlyS.length?c.onlyS.length+" cặp chỉ có trên máy chủ":"")})}
    var pc=null,nqP=Object.keys(ps.q).length;
    if(!Array.isArray(dd.pos)){
      SM.posUnsupported=true;
      body.push({s:"bad",t:"Máy chủ không trả danh sách cặp \"Trùng\" (thiếu trường pos): Code.gs trên Apps Script là bản cũ nên cặp \"Trùng\" CHƯA lên Sheet. Dán Code.gs mới rồi Deploy > Manage deployments > Edit > New version"})}
    else{
      var spo={};dd.pos.forEach(function(p){spo[p.k]=p.t||1});
      pc=cmpPairs(ps.pos,ps.q,spo,live);SM.onlyLocal+=pc.onlyL.length;
      if(pc.onlyL.length||pc.onlyS.length){SM.posDesync=true;body.push({s:"warn",t:"Trùng lệch máy chủ (mã máy "+pc.fL+", máy chủ "+pc.fS+"): "+(pc.onlyL.length?pc.onlyL.length+" cặp chỉ có trên máy":"")+(pc.onlyL.length&&pc.onlyS.length?", ":"")+(pc.onlyS.length?pc.onlyS.length+" cặp chỉ có trên máy chủ":"")})}
      var sc=bothKeys(spo,sp).filter(live);SM.pairConflict=sc.length;
      if(sc.length)body.push({s:"warn",t:sc.length+" cặp có ở cả hai danh sách \"Không phải trùng\" và \"Trùng\" trên máy chủ (bên mới hơn thắng khi đồng bộ lại)"})}
    if(ig.bad)body.push({s:"bad",t:"Danh sách \"Không phải trùng\" (dign1) bị hỏng, không đọc được"});
    if(ps.bad)body.push({s:"bad",t:"Danh sách \"Trùng\" (dsp1) bị hỏng, không đọc được"});
    if(M.dupConflict)body.push({s:"warn",t:M.dupConflict+" cặp nằm cùng lúc ở \"Không phải trùng\" và \"Trùng\" trên máy"});
    if(M.dupRamDiff)body.push({s:"warn",t:"Bộ nhớ đang chạy lệch bản đã lưu của cặp trùng"});
    var queued=nqI+nqP,clean=!body.length;
    if(clean&&!queued)add("ok",g,"Đồng bộ cặp trùng thành công: Không phải trùng "+c.sk.length+" cặp · Trùng "+(pc?pc.sk.length:0)+" cặp, khớp máy chủ (mã "+c.fS+" · "+(pc?pc.fS:"")+")");
    else if(clean)add("info",g,"Cặp trùng khớp máy chủ, đang chờ gửi "+queued+" thay đổi mới ("+nqI+" Không phải trùng, "+nqP+" Trùng): sẽ tự gửi khi có mạng và quyền sửa");
    else add("warn",g,"Đồng bộ cặp trùng CHƯA hoàn tất: "+body.length+" vấn đề"+(SM.onlyLocal?" · \"Tự động sửa lỗi\" sẽ đẩy lại "+SM.onlyLocal+" cặp chỉ có trên máy":""));
    body.forEach(function(x){add(x.s,g,x.t)});
    if(queued&&!clean)add("info",g,"Đang chờ gửi "+queued+" thay đổi ("+nqI+" Không phải trùng, "+nqP+" Trùng)")
  },function(e){add("warn",g,"Không đối chiếu được cặp trùng với máy chủ: "+netMsg(e))}).then(res)}
function netMsg(e){return e&&e.message?String(e.message):"lỗi kết nối"}
/* Gộp kết quả quét vào báo cáo máy chủ (S) và số liệu máy (R.M) để kế hoạch tự sửa dùng */
function mergeDupScan(x){
  if(!x)return;
  if(!S)S={at:Date.now(),L:[],SM:{}};
  S.L=S.L.filter(function(l){return l.g!==DGRP}).concat(x.L);S.at=Date.now();
  S.SM=S.SM||{};
  S.SM.dupDesync=!!x.SM.dupDesync;S.SM.posDesync=!!x.SM.posDesync;S.SM.posUnsupported=!!x.SM.posUnsupported;S.SM.pairConflict=x.SM.pairConflict||0;S.SM.onlyLocal=x.SM.onlyLocal||0;
  if(R&&R.M){
    var m=R.M;
    m.srvDupDesync=S.SM.dupDesync;m.srvPosDesync=S.SM.posDesync;m.srvPosUnsupported=S.SM.posUnsupported;m.srvPairConflict=S.SM.pairConflict;m.srvOnlyLocal=S.SM.onlyLocal;
    ["psBad","psLsN","psIdbN","psQueueCount","psRawLs","psRawIdb","dupConflict","dupRamDiff"].forEach(function(k){if(x.M[k]!==undefined)m[k]=x.M[k]})}}
function dupPre(){
  if(navigator.onLine===false||!(window.NB&&window.NB.apiGet))return Promise.resolve();
  return dupScan().then(mergeDupScan,function(){})}
/* Sửa lưu trữ dsp1: hợp nhất localStorage ↔ IndexedDB rồi ghi lại từ bộ nhớ đang chạy */
function repairDsp(M){
  var lsP=pjson(M.psRawLs),idbP=pjson(M.psRawIdb),note="";
  var go=function(){
    if(window.Dup&&typeof window.Dup.resync==="function"){
      return Promise.resolve(window.Dup.resync("pull")).then(function(r){return{ok:!!(r&&r.ok),msg:"Đã sửa \"Trùng\" ("+(note||"ghi lại từ bộ nhớ")+"): "+((r&&r.msg)||"")}})}
    if(window.Dup&&typeof window.Dup.pull==="function"){try{window.Dup.pull(true)}catch(e){}}
    return{ok:true,msg:"Đã sửa \"Trùng\" ("+(note||"ổn định")+")"}};
  if(lsP.bad&&idbP.bad)return wipeKeys(["dsp1"]).then(function(){note="cả 2 bản lưu hỏng → đặt lại";return go()});
  var src=null;
  if(idbP.o&&!idbP.bad&&(lsP.bad||M.psIdbN>M.psLsN)){src=posNorm(idbP.o);note="IndexedDB → localStorage"}
  else if(lsP.o&&!lsP.bad&&(idbP.bad||M.psLsN>M.psIdbN)){src=posNorm(lsP.o);note="localStorage → IndexedDB"}
  else if(lsP.o&&idbP.o){src=Object.assign({},posNorm(idbP.o),posNorm(lsP.o));note="hợp nhất localStorage ↔ IndexedDB"}
  return(src?saveKeyBoth("dsp1",JSON.stringify(src)):Promise.resolve()).then(function(){return Promise.resolve(go())})}
/* Lệnh sửa: mode = "pull" | "repush" | "mirror" | "heal" */
function fixDup(mode){
  mode=mode||"repush";
  if(!(window.Dup&&typeof window.Dup.resync==="function"))return Promise.resolve({ok:false,msg:"dup.js trên máy này chưa có Dup.resync: cần cập nhật dup.js"});
  if(mode==="heal"){
    return Promise.all([ignRead(),posRead()]).then(function(r){return repairDsp({psRawLs:r[1].rawLs,psRawIdb:r[1].rawIdb,psLsN:r[1].lsN,psIdbN:r[1].idbN})})}
  return Promise.resolve(window.Dup.resync(mode))}

function chkSync(add,M){
  var g="Đồng bộ · Dữ liệu quét trùng",g2="Đồng bộ · Mã đối chiếu",T=window.NT,items=[];
  try{items=(T&&T.items&&T.items())||[]}catch(e){}
  if(!T||!T.idbGet||!items.length)return Promise.resolve();
  return Promise.all([rdKey(KP()),rdKey(KH()),ignRead(),rdKey("dhs1"),posRead()]).then(function(r){
    var dc=dupCfg(),th=dc.th,algo=dc.algo,mm=dc.mm,skip=true;
    try{skip=T.ls("dnoout")!=="0"}catch(e){}
    M.pmTargetTh=th;M.pmTargetAlgo=algo;M.pmTargetMm=mm;
    var pmP=pjson(r[0].idb||r[0].ls),hcP=pjson(r[1].idb||r[1].ls),ig=r[2],pm=pmP.o,hc=hcP.o||{};
    M.hasDpm=!!pm;M.hasDhc=!!(hc&&Object.keys(hc).length);
    if(pmP.bad){M.pmBad=true;add("bad",g,"Kết quả quét ảnh ("+KP()+") bị hỏng, không đọc được. Dùng \"Xóa kết quả quét (giữ hash ảnh)\" rồi quét lại","DPM_CORRUPT")}
    if(hcP.bad){M.hcBad=true;add("bad",g,"Hash ảnh ("+KH()+") bị hỏng, không đọc được. Dùng \"Đặt lại dữ liệu quét trùng\"","DHC_CORRUPT")}
    if(ig.bad){M.igBad=true;add("bad",g,"Danh sách \"Không phải trùng\" (dign1) bị hỏng, không đọc được","DIGN_CORRUPT")}
    M.igRawLs=ig.rawLs;M.igRawIdb=ig.rawIdb;M.igLsN=ig.lsN;M.igIdbN=ig.idbN;
    var byId={},allImg={},actImg=[],active;
    items.forEach(function(it){byId[it.id]=it;imgsOf(it).forEach(function(s){allImg[s]=1})});
    active=skip?items.filter(function(it){return(it.st||"new")!=="out"}):items;
    active.forEach(function(it){imgsOf(it).forEach(function(s){actImg.push(s)})});
    var nImg=Object.keys(allImg).length,noHash=actImg.filter(function(s){return !hc[s]}).length;
    var pairs=[],stale=0,done={},doneN=0,orphan=0,pend=0,fail=0,expFail=0,now=Date.now();
    if(pm&&pm.done&&pm.pairs){
      done=pm.done;doneN=Object.keys(done).length;
      pm.pairs.forEach(function(p){
        var a=byId[p.a],b=byId[p.b];
        if(!a||!b||imgsOf(a).indexOf(p.x)<0||imgsOf(b).indexOf(p.y)<0){stale++;return}
        pairs.push([p.a+"\u0001"+p.x,p.b+"\u0001"+p.y].sort().join("|"))});
      Object.keys(done).forEach(function(s){if(!allImg[s])orphan++});
      var seen=pm.seen||{};
      active.forEach(function(it){
        var ims=(it.im||[]).filter(Boolean);
        if(!ims.length)return;
        if(ims.some(function(s){return !done[s]})||seen[it.id]!==ims.join("|"))pend++});
      var pf=pm.fail||{};Object.keys(pf).forEach(function(s){var f=pf[s];if(f&&typeof f==="object"){var cool=failCoolMs(f);if(f.n>=2&&(now-f.t)<cool)fail++;if(f.t&&(now-f.t)>cool)expFail++}});
      var thBad=pm.th!==th,vfBad=(pm.vf||0)!==1,calBad=(pm.cal||0)!==0,algoBad=algo>0&&(pm.algo||0)<algo,pmMm=(pm.mm!==undefined?pm.mm:3),mmBad=pmMm!==mm;
      var staleMode=thBad||vfBad||calBad||algoBad||mmBad;
      var whyStale=thBad?("cài đặt hiện tại là "+th+"%"):algoBad?("thuật toán hiện tại là v"+algo+", đã nâng cấp so với bản quét cũ v"+(pm.algo||0)):mmBad?("chế độ vùng xám hiện tại là "+(MM_NAMES[mm]||mm)):"cài đặt quét đã thay đổi";
      M.pmThMismatch=staleMode;M.pmMismatchReason=staleMode?whyStale:"";M.pmStale=stale;M.pmOrphan=orphan;M.pmExpiredFail=expFail;
      add(staleMode?"warn":"ok",g,"Kết quả quét theo độ nhạy "+pm.th+"%"+(pm.algo?" · v"+pm.algo:"")+(staleMode?", nhưng "+whyStale+": lần mở Kiểm tra trùng tới máy này sẽ quét lại và kết quả có thể khác máy kia":" (khớp cài đặt hiện tại)")+" · "+pairs.length+" cặp ảnh giống nhau · "+doneN+" ảnh đã so",staleMode?"DPM_TH_MISMATCH":null);
      add(pend?"info":"ok",g,pend?pend+"/"+active.length+" căn chưa so ảnh (căn mới, ảnh đổi hoặc chưa quét xong), nên danh sách cặp trùng chưa đầy đủ":"Mọi căn có ảnh đều đã được so");
      if(stale)add("warn",g,stale+" cặp ảnh trỏ tới căn đã xóa hoặc ảnh đã đổi (kết quả quét cũ chưa dọn). Mở Kiểm tra trùng một lần để app tự dọn, hoặc dùng \"Xóa kết quả quét (giữ hash ảnh)\"","DPM_STALE");
      if(orphan)add("info",g,orphan+" ảnh đã so nhưng không còn thuộc căn nào (dữ liệu thừa, không ảnh hưởng kết quả)");
      if(fail)add("warn",g,fail+" ảnh đang tạm bỏ qua do lỗi tải/xử lý (5 phút / 1 giờ / 24 giờ tùy số lần lỗi). Ảnh Drive lỗi hoặc mạng chặn có thể làm kết quả thiếu so với máy kia")
    }else if(!pmP.bad)add("info",g,"Máy này chưa quét ảnh trùng (chưa có kết quả so khớp). Mở Kiểm tra trùng → Quét ảnh trùng");
    if(noHash)add("info",g,noHash+"/"+actImg.length+" ảnh chưa có hash trên máy này (sẽ tính khi quét)");
    var hsO=pjson(r[3].idb||r[3].ls).o||{},hsK={};
    if(hsO.v===KH())String(hsO.k||"").split(",").forEach(function(x){if(x)hsK[x]=1});
    var unsent=Object.keys(hc).filter(function(s){return !hsK[s]&&s.indexOf("data:")!==0}).length,canW=true;
    try{canW=!!(T.canW&&T.canW())}catch(e){}
    if(unsent)add(canW?"warn":"info",g,unsent+" hash ảnh chưa gửi lên máy chủ"+(canW?": máy khác chưa dùng được, nên kết quả quét có thể khác. Mở Kiểm tra trùng và để app tự gửi (cần mạng)":" (máy này chỉ xem nên không gửi được)"));
    else if(Object.keys(hc).length)add("ok",g,"Mọi hash ảnh trên máy đã có trên máy chủ (đã kéo tới dòng "+(+hsO.n||0)+")");
    var nq=Object.keys(ig.q).length;
    M.igQueueCount=nq;
    if(nq)add("warn",g,nq+" thay đổi \"Không phải trùng\" chưa gửi lên máy chủ: máy khác chưa thấy. Cần có mạng và quyền sửa; mở Kiểm tra trùng rồi đóng lại để gửi","DIGN_QUEUE");
    if(ig.lsN>=0&&ig.idbN>=0&&ig.lsN!==ig.idbN)add("info",g,"\"Không phải trùng\": localStorage có "+ig.lsN+" cặp, IndexedDB có "+ig.idbN+" cặp (có thể vừa thay đổi, đang ghi dở)","DIGN_LS_IDB_DIFF");
    try{chkPosLocal(add,g,M,ig,r[4],liveFn(items))}catch(e){add("info",g,"Không kiểm được cặp Trùng: "+(e&&e.message||e))}
    try{if(window.Dup&&typeof window.Dup.ignStat==="function"&&typeof window.Dup.keys==="function"&&typeof window.Dup.smart==="function"){var st=window.Dup.ignStat();add("info",g,"Không phải trùng: "+st.total+" cặp trên máy · giao diện đang hiện "+st.shown+" · ẩn "+(st.out+st.none)+" (căn Loại "+st.out+", không còn nghi trùng "+st.none+")"+(st.img?"":" · chưa nạp kết quả quét ảnh nên cặp dựa trên ảnh có thể bị tính vào mục không còn nghi trùng; mở Kiểm tra trùng rồi chạy lại báo cáo"))}else{M.missingIgnStat=true;add("info",g,"Chưa đủ API đối chiếu mới trên dup.js: dup.js trên máy này là bản cũ, hãy cập nhật dup.js","DUP_OLD_VER")}}catch(e){add("info",g,"Không đọc được thống kê cặp Không phải trùng bị ẩn: "+(e&&e.message||e))}
    var igk=Object.keys(ig.ign).filter(function(k){var a=k.split("|");return byId[a[0]]&&byId[a[1]]});
    var hcFp=fnv(actImg.slice().sort().map(function(s){return s+"="+(hc[s]||"")}).join("\n"));
    add("info",g2,"So các mã này giữa PWA và APK: mã nào khác là phần đang lệch. Kết quả quét chỉ lưu riêng từng máy, không đồng bộ qua máy chủ");
    add("info",g2,"Danh sách căn & ảnh: "+fpItems(items)+" · "+items.length+" căn · "+nImg+" ảnh");
    add("info",g2,"Cài đặt quét: "+fnv(th+"|"+skip+"|"+mm+"|"+algo+"|"+KH())+" · độ nhạy "+th+"% · "+(skip?"bỏ qua căn Loại":"gồm cả căn Loại")+" · "+(MM_NAMES[mm]||mm)+" · "+KH());
    add("info",g2,"Hash ảnh: "+hcFp+" · "+(actImg.length-noHash)+"/"+actImg.length+" ảnh đã có hash"+(unsent?" · chờ gửi "+unsent:""));
    add("info",g2,"Kết quả quét: "+(pm&&pm.pairs?fpKeys(pairs)+" · "+pairs.length+" cặp ảnh · "+doneN+" ảnh đã so":"chưa quét"));
    add("info",g2,"Không phải trùng: "+fpKeys(igk)+" · "+igk.length+" cặp"+(nq?" (đang chờ gửi "+nq+")":""))
  },function(){})}

/* ---------- Kiểm tra kết nối máy chủ ---------- */
var S=null,srvBusy=false,stopped=false,ACT=[],PROG=null;
function sfg(){
  var u="",k="";
  try{u=(window.NB&&window.NB.apiUrl&&window.NB.apiUrl())||""}catch(e){}
  try{k=(window.NT&&window.NT.ls&&window.NT.ls("nha-thue-key"))||""}catch(e){}
  return{u:u,k:k}}
function pg(t){if(PROG)PROG(t)}
function stopSrv(){stopped=true;ACT.slice().forEach(function(c){try{c.abort()}catch(e){}})}
function tfetch(url,opt,ms){
  var c=window.AbortController?new AbortController():null,t0=performance.now(),tm=0;
  opt=opt||{};
  if(c){opt.signal=c.signal;tm=setTimeout(function(){c.abort()},ms);ACT.push(c)}
  function el(){return Math.round(performance.now()-t0)}
  function done(){clearTimeout(tm);if(c){var i=ACT.indexOf(c);if(i>=0)ACT.splice(i,1)}}
  return fetch(url,opt).then(function(r){
    if(opt.mode==="no-cors"){done();return{r:r,tx:"",ms:el()}}
    return r.text().then(function(tx){done();return{r:r,tx:tx,ms:el()}})
  }).catch(function(e){
    done();
    var ab=!!(e&&e.name==="AbortError"),er=new Error(stopped?"đã dừng":ab?"quá thời gian chờ "+Math.round(ms/1000)+" giây":(e&&e.message)||"lỗi mạng");
    er.ms=el();er.abort=ab&&!stopped;er.stopped=stopped;throw er})}
function tget(url,opt,ms,ms2){
  return tfetch(url,Object.assign({},opt),ms).then(function(v){return v},function(e){
    if(e.stopped)throw e;
    return new Promise(function(r){setTimeout(r,800)}).then(function(){
      if(stopped){var s=new Error("đã dừng");s.stopped=true;throw s}
      return tfetch(url,Object.assign({},opt),ms2||ms).then(function(v){v.retried=e.message;return v},function(e2){e2.first=e.message;throw e2})})})}
function parseSrv(res,add,g,what){
  var r=res.r,d=null,host="";
  try{host=new URL(r.url).hostname}catch(e){}
  try{d=JSON.parse(res.tx)}catch(e){}
  if(d&&typeof d==="object")return d;
  var why;
  if(/accounts\.google\.com/.test(host))why="bị chuyển tới trang đăng nhập Google: Web app chưa được triển khai với quyền truy cập \"Bất kỳ ai\" (Anyone)";
  else if(r.status===404)why="HTTP 404: link Web app sai hoặc đã bị xóa";
  else if(r.status>=500)why="HTTP "+r.status+": lỗi phía Google/Apps Script";
  else if(/<html|<!doctype/i.test(String(res.tx).slice(0,300)))why="trả về trang HTML thay vì dữ liệu (mã Apps Script báo lỗi, hoặc link không phải bản /exec đã triển khai)";
  else why="phản hồi không đọc được dưới dạng JSON ("+(res.tx?res.tx.length+" ký tự":"rỗng")+")";
  add("bad",g,what+": "+why+" · HTTP "+r.status+" · "+res.ms+" ms");
  return null}
function srvFail(add,g,what,e){
  if(e&&e.stopped){add("info",g,what+": đã dừng theo yêu cầu");return}
  var hint=e&&e.abort?" (Apps Script khởi động nguội đôi khi mất hơn 20 giây, thử lại lần nữa)":". Đường truyền tới Google bình thường nên thường do: Web app chưa cho \"Bất kỳ ai\" truy cập, link sai, hoặc chưa triển khai lại phiên bản mới sau khi sửa mã";
  add("bad",g,what+" thất bại"+(e&&e.first?" 2 lần (lần 1: "+e.first+")":"")+": "+(e&&e.message||e)+hint)}
function imgLoad(u,ms){
  return new Promise(function(res){
    var t0=performance.now(),im=new Image(),d=false,tm;
    function fin(ok){if(d)return;d=true;clearTimeout(tm);im.onload=im.onerror=null;res({ok:ok,ms:Math.round(performance.now()-t0)})}
    tm=setTimeout(function(){fin(false)},ms);im.onload=function(){fin(true)};im.onerror=function(){fin(false)};im.src=u})}
function chkImg(add,g,T){
  var id="",items=[];
  try{items=(T&&T.items&&T.items())||[]}catch(e){}
  items.some(function(it){return (it.im||[]).some(function(s){if(s&&String(s).indexOf("data:")!==0){id=s;return true}})});
  if(!id){add("info",g,"Chưa có căn nào có ảnh trên Drive để thử tải");return Promise.resolve()}
  var e=encodeURIComponent(id),ts=Date.now();
  var src=[["lh3.googleusercontent.com (nguồn chính)","https://lh3.googleusercontent.com/d/"+e+"=w64?r="+ts],["drive.google.com/thumbnail (dự phòng)","https://drive.google.com/thumbnail?id="+e+"&sz=w64&r="+ts],["drive.google.com/uc (dự phòng)","https://drive.google.com/uc?export=view&id="+e+"&r="+ts]];
  var bad=[];
  function next(i){
    if(stopped){add("info",g,"Thử tải ảnh: đã dừng theo yêu cầu");return}
    if(i>=src.length){add("bad",g,"Không tải được ảnh Drive nào ("+bad.join(", ")+"). Ảnh có thể đã bị xóa, chưa chia sẻ \"Bất kỳ ai có link\", hoặc mạng đang chặn Google");return}
    return imgLoad(src[i][1],10000).then(function(v){
      if(v.ok){
        if(i===0)add(v.ms>4000?"warn":"ok",g,"Tải thử 1 ảnh nhỏ từ "+src[0][0]+": "+v.ms+" ms"+(v.ms>4000?" (chậm)":""));
        else add("warn",g,"Nguồn chính không tải được ảnh, nhưng "+src[i][0]+" chạy ("+v.ms+" ms). App sẽ tự chuyển nguồn khi ảnh lỗi, có thể thấy ảnh hiện chậm");
        return}
      bad.push(src[i][0].split(" ")[0]);return next(i+1)})}
  return next(0)}
function chkSyncSrv(add,base,d,SM){
  var g="Máy chủ · Đồng bộ",T=window.NT,loc=[],sv=d.items||[];
  try{loc=(T&&T.items&&T.items())||[]}catch(e){}
  if(stopped)return Promise.resolve();
  var lm={},sm={},onlyL=0,onlyS=0,imD=0,stD=0;
  loc.forEach(function(x){lm[x.id]=x});sv.forEach(function(x){sm[x.id]=x});
  Object.keys(lm).forEach(function(k){
    var s=sm[k];if(!s){onlyL++;return}
    if((s.st||"new")!==(lm[k].st||"new"))stD++;
    if(imgsOf(s).slice().sort().join(",")!==imgsOf(lm[k]).slice().sort().join(","))imD++});
  Object.keys(sm).forEach(function(k){if(!lm[k])onlyS++});
  var fpS=fpItems(sv),fpL=fpItems(loc);
  if(fpS===fpL)add("ok",g,"Danh sách căn & ảnh trên máy khớp máy chủ · mã "+fpS+" · "+sv.length+" căn");
  else{
    SM.itemMismatch=true;
    var p=[];
    if(onlyL)p.push(onlyL+" căn chỉ có trên máy");
    if(onlyS)p.push(onlyS+" căn chỉ có trên máy chủ");
    if(imD)p.push(imD+" căn khác danh sách ảnh");
    if(stD)p.push(stD+" căn khác trạng thái");
    add("warn",g,"Danh sách trên máy lệch máy chủ (mã máy "+fpL+", máy chủ "+fpS+"): "+(p.join(", ")||"khác thứ tự ảnh")+". Nếu vừa thêm/sửa ở nơi khác thì kéo làm mới danh sách; nếu vẫn lệch, kết quả quét trùng trên máy này sẽ khác máy kia")}
  pg("5/5 · Đối chiếu cặp Không phải trùng");
  return tget(base+"&action=dup",{cache:"no-store"},25000,15000).then(function(res){
    var dd=parseSrv(res,add,g,"Tải cặp Không phải trùng");if(!dd)return;
    if(!dd.ok){add("bad",g,"Máy chủ từ chối danh sách Không phải trùng: "+(dd.error||"không rõ lý do"));return}
    return ignRead().then(function(ig){
      var sp={},nAll=0,svIds={};
      sv.forEach(function(x){svIds[x.id]=1});
      (dd.pairs||[]).forEach(function(q){sp[q.k]=1;nAll++});
      var sk=Object.keys(sp).filter(function(k){var a=k.split("|");return svIds[a[0]]&&svIds[a[1]]});
      var lk=Object.keys(ig.ign).filter(function(k){var a=k.split("|");return lm[a[0]]&&lm[a[1]]});
      var onlyLp=lk.filter(function(k){return !sp[k]&&!(ig.q[k]>0)}).length;
      var onlySp=sk.filter(function(k){return !ig.ign[k]&&ig.q[k]!==0}).length;
      var fS=fpKeys(sk),fL=fpKeys(lk);
      if(!onlyLp&&!onlySp)add(Object.keys(ig.q).length?"info":"ok",g,"Cặp Không phải trùng "+(Object.keys(ig.q).length?"(đang chờ gửi "+Object.keys(ig.q).length+" thay đổi) ":"")+"khớp máy chủ · mã "+fS+" · "+sk.length+" cặp");
      else{SM.dupDesync=true;add("warn",g,"Cặp Không phải trùng lệch máy chủ (mã máy "+fL+", máy chủ "+fS+"): "+(onlyLp?onlyLp+" cặp chỉ có trên máy":"")+(onlyLp&&onlySp?", ":"")+(onlySp?onlySp+" cặp chỉ có trên máy chủ":"")+". Mở Kiểm tra trùng để kéo/gửi lại; nếu máy chỉ xem thì không gửi được")}
      if(nAll>sk.length)add("info",g,(nAll-sk.length)+" cặp trên máy chủ trỏ tới căn không còn (app bỏ qua, không ảnh hưởng)");
      add("info",g,"So mã danh sách căn & ảnh ở trên với nhóm \"Đồng bộ · Mã đối chiếu\" của từng máy (PWA, APK): mã máy chủ là chuẩn chung")})
  },function(e){srvFail(add,g,"Tải cặp Không phải trùng",e)}).then(function(){return hashProbe(add,base,g,SM)})}
function hashProbe(add,base,g,SM){
  if(stopped)return Promise.resolve();
  return tget(base+"&action=hash&v="+encodeURIComponent(KH())+"&count=1",{cache:"no-store"},25000,15000).then(function(res){
    var d=parseSrv(res,add,g,"Đếm hash ảnh");if(!d)return;
    if(typeof d.total!=="number"){add("warn",g,"Máy chủ chưa hỗ trợ đồng bộ hash ảnh: dán Code.gs mới vào Apps Script rồi Deploy > Manage deployments > Edit > New version");return}
    return rdKey("dhs1").then(function(r){
      var o=pjson(r.idb||r.ls).o||{},n=o.v===KH()?(+o.n||0):0;
      if(d.total>n){SM.hashBehind=true;add("warn",g,"Tab Hash trên máy chủ có "+d.total+" dòng, máy mới kéo tới dòng "+n+": còn "+(d.total-n)+" dòng chưa kéo về. Mở Kiểm tra trùng để kéo")}
      else if(d.total<n)add("warn",g,"Máy đã kéo tới dòng "+n+" nhưng tab Hash chỉ còn "+d.total+" dòng (Sheet bị xóa bớt). Mở Kiểm tra trùng để máy gửi lại");
      else add("ok",g,"Hash ảnh khớp máy chủ: "+d.total+" dòng, máy đã kéo hết")})
  },function(e){srvFail(add,g,"Đếm hash ảnh",e)})}
function chkServer(){
  var L=[],SM={itemMismatch:false,roleMismatch:false,hashBehind:false,dupDesync:false,posDesync:false,posUnsupported:false,pairConflict:0,onlyLocal:0};
  function add(s,g,t){L.push({s:s,g:g,t:t})}
  var X={at:Date.now(),L:L,SM:SM},g1="Máy chủ · Cấu hình",g2="Máy chủ · Đường truyền",g3="Máy chủ · Phản hồi",g4="Máy chủ · Ảnh Drive";
  stopped=false;
  var cf=sfg(),u=cf.u,k=cf.k,host="",okCfg=true;
  pg("1/5 · Kiểm tra cấu hình");
  if(!u){add("bad",g1,"Chưa có link Web app (app đang ở màn hình nhập link)");okCfg=false}
  else{
    try{host=new URL(u).hostname}catch(e){}
    if(!/^https:\/\//i.test(u)){add("bad",g1,"Link Web app không bắt đầu bằng https://");okCfg=false}
    else if(!host){add("bad",g1,"Link Web app không hợp lệ");okCfg=false}
    else{
      add(host==="script.google.com"?"ok":"warn",g1,"Đã có link Web app, máy chủ "+host+(host==="script.google.com"?"":" (không phải script.google.com, hãy kiểm tra lại link)"));
      if(!/\/exec\/?$/.test(u.split("?")[0]))add("warn",g1,"Link không kết thúc bằng /exec (link /dev chỉ chạy cho chủ tài khoản, link bị cắt cũng báo lỗi)")}}
  if(!k){add("bad",g1,"Chưa có mã truy cập");okCfg=false}else add("ok",g1,"Đã có mã truy cập");
  var off=navigator.onLine===false;
  var tg=[["script.google.com","https://script.google.com/","nc"],["script.googleusercontent.com (nơi Apps Script trả dữ liệu)","https://script.googleusercontent.com/","nc"],["lh3.googleusercontent.com (ảnh Drive)","https://lh3.googleusercontent.com/","nc"]];
  if(/^https?:$/i.test(location.protocol)&&!isApk())tg.push(["trang app ("+location.host+")",location.href.split("#")[0],"origin"]);
  pg("2/5 · Đường truyền");
  return Promise.all(tg.map(function(x){
    var opt=x[2]==="origin"?{method:"HEAD",cache:"no-store"}:{mode:"no-cors",cache:"no-store"};
    return tget(x[1],opt,8000,8000).then(function(v){
      var st=x[2]==="origin"?v.r.status:200;
      return{x:x,ok:st>=200&&st<400,ms:v.ms,st:st,re:v.retried}},function(e){return{x:x,ok:false,m:e.message,stop:e.stopped}})
  })).then(function(rs){
    var okN=0,gg=false;
    rs.forEach(function(v){
      if(v.stop)return;
      if(v.ok){
        okN++;if(/^script\.google\.com/.test(v.x[0]))gg=true;
        add(v.re?"warn":v.ms>3000?"warn":"ok",g2,"Tới được "+v.x[0]+" · "+v.ms+" ms"+(v.re?" (lần đầu lỗi: "+v.re+", thử lại mới được: kết nối chập chờn)":""))}
      else if(v.st)add("bad",g2,"Tới "+v.x[0]+" nhưng trả HTTP "+v.st+" (tệp trang chưa được đăng lên hoặc sai đường dẫn)");
      else add(off?"info":"bad",g2,"Không tới được "+v.x[0]+": "+v.m)});
    if(stopped){add("info",g2,"Đã dừng theo yêu cầu");return X}
    if(!okN){add("info",g2,"Không ra được internet nên bỏ qua các bước sau. Kiểm tra Wi-Fi/dữ liệu di động, rồi bấm lại.");return X}
    if(!gg){add("info",g3,"Bỏ qua vì không tới được script.google.com");return X}
    if(!okCfg){add("info",g3,"Bỏ qua vì cấu hình chưa đủ");return X}
    var base=u+"?key="+encodeURIComponent(k)+"&app="+encodeURIComponent(u);
    pg("3/5 · Tải danh sách");
    return tget(base+"&since=",{cache:"no-store"},25000,20000).then(function(res){
      var d=parseSrv(res,add,g3,"Tải danh sách");if(!d)return X;
      if(!d.ok){add("bad",g3,"Máy chủ từ chối: "+(d.error||"không rõ lý do")+" · "+res.ms+" ms");return X}
      var sz=0;try{sz=new Blob([res.tx]).size}catch(e){sz=res.tx.length}
      var n=(d.items||[]).length;
      add(res.retried||res.ms>8000?"warn":"ok",g3,"Tải danh sách: "+res.ms+" ms · "+kb(sz)+(res.retried?" (lần đầu lỗi: "+res.retried+", thử lại mới được)":res.ms>8000?" (chậm; Apps Script khởi động nguội hoặc danh sách quá nặng)":""));
      add("ok",g3,"Quyền: "+(d.role==="edit"?"sửa":d.role==="view"?"chỉ xem":String(d.role))+" · máy chủ có "+n+" căn");
      var T=window.NT,K=window.NK,local=-1;
      try{local=T&&T.items?T.items().length:-1}catch(e){}
      if(local>=0&&local!==n){SM.itemMismatch=true;add("warn",g3,"Lệch số căn: máy chủ "+n+", trên máy "+local+" (nếu vừa thêm/xóa thì bình thường, bấm Kiểm tra lại; nếu vẫn lệch hãy kéo làm mới danh sách)")}
      try{if(K&&typeof K.canW==="boolean"&&K.canW!==(d.role==="edit")){SM.roleMismatch=true;add("warn",g3,"Quyền trên máy ("+(K.canW?"sửa":"xem")+") khác máy chủ ("+(d.role==="edit"?"sửa":"xem")+"), hãy tải lại app")}}catch(e){}
      if(!d.ver)add("warn",g3,"Máy chủ không trả số phiên bản dữ liệu (ver): app sẽ tải lại cả danh sách mỗi lần làm mới");
      var q=Promise.resolve();
      if(d.ver)q=(function(){
        var ms=[],chg=0,stop=false;
        function one(i){
          if(i>=3||stop)return Promise.resolve();
          pg("4/5 · Làm mới nhanh "+(i+1)+"/3");
          return tget(base+"&since="+encodeURIComponent(d.ver),{cache:"no-store"},25000,15000).then(function(r2){
            var d2=parseSrv(r2,add,g3,"Làm mới nhanh");if(!d2){stop=true;return}
            if(!d2.ok){add("bad",g3,"Làm mới nhanh bị từ chối: "+(d2.error||"không rõ lý do"));stop=true;return}
            if(!d2.same)chg++;ms.push(r2.ms);
            return new Promise(function(r){setTimeout(r,300)}).then(function(){return one(i+1)})
          },function(e){srvFail(add,g3,"Làm mới nhanh lần "+(i+1),e);stop=true})}
        return one(0).then(function(){
          if(!ms.length)return;
          var mn=Math.min.apply(null,ms),mx=Math.max.apply(null,ms),jit=ms.length>1&&mx>4000&&mx>=3*mn;
          add(mx>6000||jit?"warn":"ok",g3,"Làm mới nhanh "+ms.length+" lần: "+ms.join(" / ")+" ms"+(chg?" · dữ liệu vừa thay đổi trong lúc kiểm tra":" · dữ liệu không đổi (cách app kiểm tra định kỳ)")+(jit?" — dao động lớn, đường truyền không ổn định":mx>6000?" (chậm)":""))})})();
      return q.then(function(){
        if(stopped){add("info",g3,"Đã dừng theo yêu cầu");return X}
        var it=null;try{(T.items()||[]).some(function(x){if(x.ck){it=x;return true}})}catch(e){}
        pg("5/5 · Tải checklist, đối chiếu đồng bộ và ảnh");
        var p=it?tget(base+"&action=ck&id="+encodeURIComponent(it.id),{cache:"no-store"},25000,15000).then(function(r3){
          var d3=parseSrv(r3,add,g3,"Tải checklist");if(!d3)return;
          if(!d3.ok)add("bad",g3,"Tải checklist bị từ chối: "+(d3.error||"không rõ lý do")+" · "+r3.ms+" ms");
          else add(r3.retried||r3.ms>6000?"warn":"ok",g3,"Tải checklist 1 căn: "+r3.ms+" ms"+(d3.ck?"":" (căn này chưa có nội dung checklist)")+(r3.retried?" (lần đầu lỗi, thử lại mới được)":""))
        },function(e){srvFail(add,g3,"Tải checklist",e)}):(add("info",g3,"Chưa có căn nào có checklist để thử tải"),Promise.resolve());
        return p.then(function(){return chkSyncSrv(add,base,d,SM)}).then(function(){return chkImg(add,g4,T)}).then(function(){return X})})
    },function(e){srvFail(add,g3,"Tải danh sách",e);return X})})}
function chkPost(){
  var L=[],g="Máy chủ · Gửi dữ liệu (POST)",cf=sfg();
  function add(s,t){L.push({s:s,g:g,t:t})}
  stopped=false;
  if(!cf.u||!cf.k){add("bad","Thiếu link Web app hoặc mã truy cập");return Promise.resolve(L)}
  var f=function(m,e){if(e&&e.stopped){add("info",m.replace(/ thất bại$/,"")+": đã dừng theo yêu cầu");return}add("bad",m+": "+(e&&e.first?"2 lần (lần 1: "+e.first+") · ":"")+(e&&e.message||e)+". Kiểm tra link /exec đã triển khai và quyền \"Bất kỳ ai\"")};
  return tfetch(cf.u,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({key:cf.k,action:"dbg-ping"}),cache:"no-store"},25000).then(function(res){
    var d=parseSrv(res,function(s,gg,t){add(s,t)},g,"Gửi thử");if(!d)return L;
    if(d.ok===true)add("warn","Máy chủ chấp nhận lệnh lạ \"dbg-ping\" (mã máy chủ không kiểm tra tên lệnh) · "+res.ms+" ms");
    else add(res.ms>8000?"warn":"ok","Đường gửi (POST) hoạt động: máy chủ đã nhận và trả lời"+(d.error?" \""+d.error+"\"":"")+" · "+res.ms+" ms. Lệnh thử bị từ chối là bình thường");
    return L},function(e){f("Gửi thử thất bại",e);return L})}

/* ---------- Chạy kiểm tra thiết bị ---------- */
var CAN=false;
function assetsDue(){
  try{var n=Date.now(),v=+localStorage.getItem("dbg-as")||0;if(n-v<43200000)return false;localStorage.setItem("dbg-as",String(n));return true}catch(e){return true}}
function run(force){
  if(running)return Promise.resolve(R);
  running=true;CAN=false;
  var L=[],F=[],M=freshMeta();
  function add(s,g,t,code){
    L.push({s:s,g:g,t:t});
    if(code)F.push({c:code,s:s,g:g,t:t})}
  function fin(){
    if(S&&S.SM){M.srvItemMismatch=S.SM.itemMismatch;M.srvRoleMismatch=S.SM.roleMismatch;M.srvHashBehind=S.SM.hashBehind;M.srvDupDesync=S.SM.dupDesync;M.srvPosDesync=!!S.SM.posDesync;M.srvPosUnsupported=!!S.SM.posUnsupported;M.srvPairConflict=S.SM.pairConflict||0;M.srvOnlyLocal=S.SM.onlyLocal||0}
    R={at:Date.now(),L:L,F:F,M:M,P:detectProfile(M),can:CAN};
    running=false;badge();
    var d=G("dbgd");if(d&&d.open)draw();
    return R}
  return wait().then(function(w){
    chkComponents(add,w,M);chkBridges(add,M);chkRes(add);
    return chkSw(add,M).then(function(){return (force||assetsDue())?chkAssets(add,M):0}).then(function(){return chkCaches(add,M)}).then(function(){return chkStorage(add,M)}).then(function(){return chkIdb(add,M)}).then(function(){return chkSync(add,M)}).then(function(){return chkGpu(add)}).then(function(){
      chkNative(add);return chkData(add,M)}).then(function(){chkPerf(add);chkMode(add);chkLink(add);chkEnv(add);chkErrors(add)})
  }).then(fin,function(e){add("bad","Kiểm tra","Chính bộ kiểm tra bị lỗi: "+(e&&e.message||e),"CHECKER_ERR");return fin()})}
function allL(){return (S?S.L:[]).concat(R?R.L:[])}
function cnt(s){return allL().filter(function(x){return x.s===s}).length}

/* ==========================================================================
   THUẬT TOÁN TỰ ĐỘNG SỬA LỖI HỆ THỐNG (AUTO-FIX ENGINE)
   ========================================================================== */
var AF_LOG=B.afLog||(B.afLog=[]);
var afBusy=false;

function detectProfile(M){
  M=M||(R&&R.M)||freshMeta();
  var apk=isApk(),pwa=isStandalone(),env=apk?"apk":(pwa?"pwa":"browser");
  var online=navigator.onLine!==false;
  var fresh=false,why=[];
  if(apk){
    if((!M.idbExists||M.idbCount===0)&&M.imgCount===0&&(!M.hasDhc||M.itemsCount===0)){
      fresh=true;why.push("APK chưa có kho IndexedDB hoặc chưa có cache dữ liệu/ảnh")}}
  else{
    if(!M.swReg||!M.hasShellCache||M.shellCachedCount===0){
      fresh=true;why.push(!M.swReg?"Service Worker chưa đăng ký":"chưa có bộ nhớ đệm vỏ app (shell-*)")}
    else if((!M.idbExists||M.idbCount===0)&&M.imgCount===0&&!M.hasDpm&&!M.hasDhc){
      fresh=true;why.push("chưa có dữ liệu đệm ban đầu (IndexedDB/cache ảnh trống)")}}
  return {
    kind:fresh?"fresh":"installed",
    label:fresh?"Máy mới cài chưa cache":"Máy đã cài thành công",
    env:env,
    envLabel:apk?"APK (Capacitor)":(pwa?"PWA đã cài":"Trình duyệt"),
    online:online,
    reason:why.length?why.join("; "):"Đã có vỏ app/kho dữ liệu hoạt động trên máy"
  }}

/* Chống vòng lặp reload: tối đa 2 lần/phiên và không lặp cùng 1 lý do trong 5 phút */
function rlRead(){
  try{var raw=sessionStorage.getItem("dbg-af-rl");return raw?JSON.parse(raw):{count:0,by:{}}}catch(e){return{count:0,by:{}}}}
function rlCan(reason){
  var d=rlRead(),now=Date.now();
  if((d.count||0)>=2)return false;
  if(d.by&&d.by[reason]&&now-d.by[reason]<300000)return false;
  return true}
function rlMark(reason){
  try{
    var d=rlRead();
    d.count=(d.count||0)+1;
    d.by=d.by||{};d.by[reason]=Date.now();
    sessionStorage.setItem("dbg-af-rl",JSON.stringify(d))
  }catch(e){}}

/* Khớp chính xác index.html: IDBM.set(k, "") xóa key ngay lập tức (không bị trễ 700ms của idbSave) */
function saveKeyBoth(k,val){
  var T=window.NT||{},M=window.NB&&window.NB.IDBM;
  try{if(T.ls)T.ls(k,val);else if(val==="")localStorage.removeItem(k);else localStorage.setItem(k,val)}catch(e){}
  if(M&&M.set)return M.set(k,val).catch(function(){});
  if(T.idbSave){try{T.idbSave(k,val)}catch(e){}return new Promise(function(r){setTimeout(r,850)})}
  return Promise.resolve()}

function repairIdbKv(){
  if(!window.indexedDB)return Promise.resolve({ok:false,msg:"Trình duyệt không hỗ trợ IndexedDB"});
  return new Promise(function(res){
    var delReq;
    try{delReq=indexedDB.deleteDatabase("nha-thue-kv")}catch(e){res({ok:false,msg:"Không xóa được kho lỗi: "+(e&&e.message||e)});return}
    var done=false,tm=setTimeout(function(){if(!done){done=true;res({ok:false,msg:"Kho đang bị cửa sổ khác giữ khóa"})}},4500);
    function openFresh(){
      var req=indexedDB.open("nha-thue-kv",1);
      req.onupgradeneeded=function(){
        var db=req.result;
        if(!db.objectStoreNames.contains("kv"))db.createObjectStore("kv")};
      req.onsuccess=function(){
        var db=req.result,restored=0;
        var keys=["nha-thue-url","nha-thue-key","nha-thue-c2","dign1","dign1q","dsim","dnoout","dimgv","dzl","dhs1","ckc1"];
        try{
          var tx=db.transaction("kv","readwrite"),st=tx.objectStore("kv");
          keys.forEach(function(k){
            var v="";try{v=localStorage.getItem(k)||""}catch(e){}
            if(v){st.put(v,k);restored++}});
          tx.oncomplete=function(){db.close();if(!done){done=true;clearTimeout(tm);res({ok:true,msg:"Đã tạo lại kho \"kv\" và khôi phục "+restored+" khóa từ localStorage"})}};
          tx.onerror=function(){db.close();if(!done){done=true;clearTimeout(tm);res({ok:true,msg:"Đã tạo lại kho \"kv\""})}}
        }catch(e){try{db.close()}catch(x){}if(!done){done=true;clearTimeout(tm);res({ok:true,msg:"Đã khởi tạo lại kho \"kv\""})}}};
      req.onerror=function(){if(!done){done=true;clearTimeout(tm);res({ok:false,msg:"Không mở lại được IndexedDB sau khi đặt lại"})}}}
    delReq.onsuccess=openFresh;
    delReq.onerror=openFresh;
    delReq.onblocked=function(){if(!done){done=true;clearTimeout(tm);res({ok:false,msg:"IndexedDB bị khóa bởi tab khác, hãy đóng tab trùng"})}}})}

function trimImgCache(){
  if(!window.caches)return Promise.resolve({ok:false,msg:"Không hỗ trợ Cache API"});
  var T=window.NT,items=[];
  try{items=(T&&T.items&&T.items())||[]}catch(e){}
  var activeIds={};
  items.forEach(function(it){if((it.st||"new")!=="out")(it.im||[]).forEach(function(id){if(id){activeIds[encodeURIComponent(id)]=1;activeIds[id]=1}})});
  var tS=Math.floor(LIM.s*0.75),tL=Math.floor(LIM.l*0.75);
  return caches.open("img-v1").then(function(c){
    return c.keys().then(function(reqs){
      var small=[],large=[];
      reqs.forEach(function(r){var m=/=w(\d+)$/.exec(r.url);if(m&&+m[1]<=LIM.w)small.push(r);else large.push(r)});
      function pickDel(arr,target){
        if(arr.length<=target)return[];
        var need=arr.length-target,out=[],keep=[];
        arr.forEach(function(r){
          var act=false;
          Object.keys(activeIds).some(function(id){if(r.url.indexOf(id)>=0){act=true;return true}});
          if(act)keep.push(r);else out.push(r)});
        var del=out.slice(0,need);
        if(del.length<need)del=del.concat(keep.slice(0,need-del.length));
        return del}
      var dels=pickDel(small,tS).concat(pickDel(large,tL));
      if(!dels.length)return{ok:true,msg:"Cache ảnh đã ở mức an toàn"};
      return Promise.all(dels.map(function(r){return c.delete(r)})).then(function(){
        return{ok:true,msg:"Đã tỉa "+dels.length+" ảnh cũ/thừa (giữ ảnh đang dùng), đưa cache về ~75% hạn mức"}})})})}

/* Tôn trọng hàng đợi Dup.retire() (dup_pend) và các khóa cấu hình quan trọng của app */
function trimLocalStorage(){
  var removed=0,freed=0,kh=KH(),kp=KP(),retireKeys={};
  try{if(window.Dup&&typeof window.Dup.retire==="function")window.Dup.retire().forEach(function(c){retireKeys[c]=1})}catch(e){}
  return new Promise(function(res){
    var checks=["ckc1",kp,kh];
    var idbDone=Promise.resolve({});
    if(window.NT&&window.NT.idbGet){
      idbDone=Promise.all(checks.map(function(k){return Promise.resolve(window.NT.idbGet(k)).then(function(v){return[k,!!v]},function(){return[k,false]})}))
        .then(function(arr){var m={};arr.forEach(function(x){m[x[0]]=x[1]});return m})}
    idbDone.then(function(hasInIdb){
      try{
        var keys=[],i;
        for(i=0;i<localStorage.length;i++)keys.push(localStorage.key(i));
        keys.forEach(function(k){
          if(retireKeys[k])return;
          var val=localStorage.getItem(k)||"";
          var isOldVer=(/^dhc\d/.test(k)&&k!==kh)||(/^dpm\d/.test(k)&&k!==kp);
          var isHeavyDup=(k===kp||k===kh||k==="ckc1")&&hasInIdb[k]&&val.length>8192;
          if(isOldVer||isHeavyDup){
            freed+=(k.length+val.length)*2;
            localStorage.removeItem(k);
            removed++}})
      }catch(e){}
      res({ok:true,msg:removed?"Đã giải phóng "+kb(freed)+" ("+removed+" khóa thừa/trùng bản sao IndexedDB)":"Không có khóa thừa an toàn để xóa tự động"})})})}

/* Kiểm tra xem dup.js đã nạp pm vào RAM chưa (Dup.cached() >= 0):
   Nếu dup.js chưa nạp, ghi thẳng IndexedDB có tác dụng ngay; nếu dup.js đã nạp vào RAM thì cần reload sau sửa để đồng bộ RAM. */
function pruneDpmInPlace(targetTh,targetAlgo,targetMm){
  var kp=KP();
  var dupInRam=false;
  try{dupInRam=!!(window.Dup&&typeof window.Dup.cached==="function"&&window.Dup.cached()>=0)}catch(e){}
  return rdKey(kp).then(function(r){
    var p=pjson(r.idb||r.ls);
    if(p.bad||!p.o){return wipeKeys([kp]).then(function(){return{ok:true,reloadAfter:dupInRam,msg:"Đã xóa kết quả quét lỗi ("+kp+"), giữ nguyên hash ảnh "+KH()}})}
    var pm=p.o,pmMm=(pm.mm!==undefined?pm.mm:3);
    if(pm.th!==targetTh||(pm.vf||0)!==1||(pm.cal||0)!==0||(targetAlgo&&(pm.algo||0)<targetAlgo)||(targetMm!==undefined&&pmMm!==targetMm)){
      var why=pm.th!==targetTh?(pm.th+"% → "+targetTh+"%"):(targetAlgo&&(pm.algo||0)<targetAlgo)?("algo v"+(pm.algo||0)+" → v"+targetAlgo):(targetMm!==undefined&&pmMm!==targetMm)?("vùng xám "+pmMm+" → "+targetMm):"vf/cal cũ";
      return wipeKeys([kp]).then(function(){return{ok:true,reloadAfter:dupInRam,msg:"Đã đặt lại kết quả quét cũ ("+why+"), giữ nguyên hash ảnh "+KH()}})}
    var T=window.NT,items=[];try{items=(T&&T.items&&T.items())||[]}catch(e){}
    var byId={},allImg={};
    items.forEach(function(it){byId[it.id]=it;imgsOf(it).forEach(function(s){allImg[s]=1})});
    var oldPairs=(pm.pairs||[]).length,oldDone=pm.done?Object.keys(pm.done).length:0,prunedF=0,prunedS=0,now=Date.now();
    if(Array.isArray(pm.pairs)){
      pm.pairs=pm.pairs.filter(function(q){
        var a=byId[q.a],b=byId[q.b];
        return !!(a&&b&&imgsOf(a).indexOf(q.x)>=0&&imgsOf(b).indexOf(q.y)>=0)})}
    if(pm.done&&typeof pm.done==="object"){
      Object.keys(pm.done).forEach(function(s){if(!allImg[s])delete pm.done[s]})}
    if(pm.seen&&typeof pm.seen==="object"){
      Object.keys(pm.seen).forEach(function(id){
        var it=byId[id],ims=it?(it.im||[]).filter(Boolean).join("|"):"";
        if(!it||pm.seen[id]!==ims){delete pm.seen[id];prunedS++}})}
    if(pm.fail&&typeof pm.fail==="object"){
      Object.keys(pm.fail).forEach(function(s){var f=pm.fail[s];if(f&&f.t&&(now-f.t)>failCoolMs(f)){delete pm.fail[s];prunedF++}})}
    var rmP=oldPairs-(pm.pairs||[]).length,rmD=oldDone-(pm.done?Object.keys(pm.done).length:0);
    return saveKeyBoth(kp,JSON.stringify(pm)).then(function(){
      return{ok:true,reloadAfter:dupInRam,msg:"Đã phẫu thuật làm sạch "+kp+": bỏ "+rmP+" cặp stale, "+rmD+" ảnh thừa"+(prunedS?", "+prunedS+" mục seen cũ":"")+(prunedF?", "+prunedF+" mục fail quá hạn":"")+" (giữ nguyên "+KH()+")"}})})}

function repairDign(M){
  var lsP=pjson(M.igRawLs),idbP=pjson(M.igRawIdb);
  if(lsP.bad&&idbP.bad){
    return wipeKeys(["dign1"]).then(function(){
      var p=Promise.resolve();
      if(window.Dup&&typeof window.Dup.pull==="function"){try{p=Promise.resolve(window.Dup.pull(true))}catch(e){}}
      return p.then(function(){return{ok:true,msg:"Cả 2 bản lưu dign1 đều hỏng → đã đặt lại và kéo từ máy chủ"}})})}
  var srcObj=null,note="";
  if(idbP.o&&!idbP.bad&&(lsP.bad||M.igIdbN>M.igLsN)){srcObj=idbP.o;note="IndexedDB → localStorage"}
  else if(lsP.o&&!lsP.bad&&(idbP.bad||M.igLsN>M.igIdbN)){srcObj=lsP.o;note="localStorage → IndexedDB"}
  else if(lsP.o&&idbP.o){
    srcObj=Object.assign({},idbP.o,lsP.o);note="hợp nhất localStorage ↔ IndexedDB"}
  var p=srcObj?saveKeyBoth("dign1",JSON.stringify(srcObj)):Promise.resolve();
  return p.then(function(){
    if(M.igQueueCount>0&&navigator.onLine!==false&&window.Dup&&typeof window.Dup.pull==="function"){
      try{window.Dup.pull(true)}catch(e){}
      note+=(note?" + ":"")+"đẩy "+M.igQueueCount+" mục chờ gửi"}
    return{ok:true,msg:"Đã đồng bộ \"Không phải trùng\" ("+(note||"ổn định")+")"}})}

function warmMissingShell(M){
  if(isApk()||!window.caches||!M.shellCacheName||!M.shellMiss.length)return Promise.resolve({ok:false,msg:"Không áp dụng"});
  var targets=M.shellMiss.slice(),saved=0;
  return caches.open(M.shellCacheName).then(function(c){
    return Promise.all(targets.map(function(u){
      return fetch(u,{cache:"reload"}).then(function(r){
        if(!(r&&r.ok))return;
        var putRes=r.redirected?r.blob().then(function(b){return new Response(b,{status:r.status,statusText:r.statusText,headers:r.headers})}):Promise.resolve(r);
        return putRes.then(function(cleanR){
          var ps=[c.put(u,cleanR.clone())];
          if(/\/index\.html$/.test(new URL(u).pathname))ps.push(c.put("./",cleanR.clone()));
          return Promise.all(ps).then(function(){saved++})})
      },function(){})}))
  }).then(function(){
    return{ok:saved>0,msg:saved?"Đã nạp bù "+saved+"/"+targets.length+" tệp vào "+M.shellCacheName+" để chạy offline":"Không tải được tệp còn thiếu (mạng lỗi hoặc máy chủ từ chối)"}})}

function buildFixPlan(opts){
  opts=opts||{};
  var M=(R&&R.M)||freshMeta();
  var P=detectProfile(M);
  var gd=guard(true);
  var steps=[];
  function addStep(st){
    if(st.respectsGuard&&gd)st.blockedBy=gd;
    else if(st.requiresOnline&&!P.online)st.blockedBy="Thiết bị đang offline";
    steps.push(st)}

  /* --- NHÓM 1: MÁY MỚI CÀI CHƯA CACHE (FRESH) --- */
  if("serviceWorker"in navigator&&/^https?:$/i.test(location.protocol)&&!M.swReg){
    addStep({
      id:"SW_REGISTER",title:"Đăng ký Service Worker (kèm chế độ thiết bị)",target:"fresh",safeSilent:true,needsReload:false,requiresOnline:true,respectsGuard:false,
      run:function(){
        var swUrl="sw.js"+(isApk()?"?app=1":"");
        return navigator.serviceWorker.register(swUrl,{updateViaCache:"none"}).then(function(reg){
          return{ok:true,msg:"Đã đăng ký "+swUrl+" thành công (scope: "+reg.scope.replace(location.origin,"")+")"}
        },function(e){return{ok:false,msg:"Đăng ký "+swUrl+" thất bại: "+(e&&e.message||e)}})}})}

  if(M.idbMissingStore||M.idbUnreadable){
    addStep({
      id:"IDB_REPAIR",title:"Khởi tạo / khôi phục kho IndexedDB \"nha-thue-kv\"",target:"both",safeSilent:true,needsReload:false,requiresOnline:false,respectsGuard:true,
      run:repairIdbKv})}

  if(!isApk()&&M.shellMiss&&M.shellMiss.length){
    addStep({
      id:"SHELL_WARM",title:"Nạp bù "+M.shellMiss.length+" tệp vỏ app để dùng offline",target:"both",safeSilent:true,needsReload:false,requiresOnline:true,respectsGuard:false,
      run:function(){return warmMissingShell(M)}})}

  if(!isApk()&&isStandalone()&&M.canPersist&&navigator.storage&&navigator.storage.persist){
    addStep({
      id:"PERSIST_ENABLE",title:"Xin trình duyệt cấp quyền lưu trữ bền",target:"fresh",safeSilent:true,needsReload:false,requiresOnline:false,respectsGuard:false,
      run:function(){
        return navigator.storage.persist().then(function(v){
          return{ok:v,msg:v?"Đã bật lưu trữ bền thành công":"Trình duyệt tạm chưa cấp (sẽ tự cấp sau vài lần mở app)"}})}})}

  if(P.kind==="fresh"&&P.online&&(M.itemsCount===0||!M.hasDhc)&&sfg().u&&sfg().k){
    addStep({
      id:"FRESH_BOOTSTRAP",title:"Tải danh sách căn & kéo sẵn hash ảnh ban đầu",target:"fresh",safeSilent:true,needsReload:false,requiresOnline:true,respectsGuard:true,
      run:function(){
        var acts=[];
        if(M.itemsCount===0&&window.NB&&typeof window.NB.refresh==="function"){
          acts.push(Promise.resolve(window.NB.refresh(false)).catch(function(){}))}
        if(!M.hasDhc&&window.Dup&&typeof window.Dup.pull==="function"){
          acts.push(Promise.resolve(window.Dup.pull(true)).catch(function(){}))}
        if(!acts.length)return Promise.resolve({ok:false,msg:"Hàm refresh/pull chưa sẵn sàng"});
        return Promise.all(acts).then(function(){return{ok:true,msg:"Đã kích hoạt đồng bộ danh sách căn & hash ảnh từ máy chủ"}})}})}

  /* --- NHÓM 2: MÁY ĐÃ CÀI THÀNH CÔNG (INSTALLED) --- */
  if(M.ckcBad){
    addStep({
      id:"CKC_REPAIR",title:"Làm sạch dữ liệu checklist hỏng (ckc1)",target:"installed",safeSilent:true,needsReload:false,requiresOnline:false,respectsGuard:true,
      run:function(){
        try{if(window.NK&&window.NK.S)window.NK.S.c={}}catch(e){}
        return wipeKeys(["ckc1"]).then(function(){return{ok:true,msg:"Đã xóa ckc1 hỏng (Sheet an toàn), app sẽ tự tải lại khi mở căn"}})}})}

  if(M.hcBad){
    addStep({
      id:"DHC_REPAIR",title:"Đặt lại kho hash ảnh hỏng ("+KH()+")",target:"installed",safeSilent:true,needsReload:false,requiresOnline:false,respectsGuard:true,
      run:function(){
        var dupInRam=false;try{dupInRam=!!(window.Dup&&window.Dup.cached()>=0)}catch(e){}
        return wipeKeys([KH(),KP(),"dhs1"]).then(function(){
          if(P.online&&window.Dup&&typeof window.Dup.pull==="function"){try{window.Dup.pull(true)}catch(e){}}
          return{ok:true,reloadAfter:dupInRam,msg:"Đã đặt lại "+KH()+", "+KP()+", dhs1 bị hỏng (giữ nguyên Không phải trùng)"}})}})}

  if(M.pmBad||M.pmThMismatch||M.pmStale>0||M.pmOrphan>0||M.pmExpiredFail>0){
    var dupRam=false;try{dupRam=!!(window.Dup&&window.Dup.cached()>=0)}catch(e){}
    addStep({
      id:"DPM_HEAL",title:(M.pmBad||M.pmThMismatch?"Đặt lại kết quả quét lỗi/lệch cấu hình ("+KP()+")":"Phẫu thuật làm sạch "+KP()+" (stale/orphan)"),target:"installed",safeSilent:!dupRam,needsReload:dupRam,requiresOnline:false,respectsGuard:true,
      run:function(){return pruneDpmInPlace(M.pmTargetTh,M.pmTargetAlgo,M.pmTargetMm)}})}

  if(M.igBad||(M.igLsN>=0&&M.igIdbN>=0&&M.igLsN!==M.igIdbN)||(M.igQueueCount>0&&P.online)){
    addStep({
      id:"DIGN_HEAL",title:"Đồng bộ & sửa danh sách \"Không phải trùng\" (dign1)",target:"installed",safeSilent:true,needsReload:false,requiresOnline:false,respectsGuard:true,
      run:function(){return repairDign(M)}})}

  if(M.psBad||(M.psLsN>=0&&M.psIdbN>=0&&M.psLsN!==M.psIdbN)){
    addStep({
      id:"DSP_HEAL",title:"Đồng bộ & sửa danh sách \"Trùng\" (dsp1)",target:"installed",safeSilent:true,needsReload:false,requiresOnline:false,respectsGuard:true,
      run:function(){return repairDsp(M)}})}

  if((M.dupConflict>0||M.dupRamDiff||M.srvPairConflict>0||(M.psQueueCount>0&&P.online))&&window.Dup&&typeof window.Dup.resync==="function"){
    addStep({
      id:"DUP_RESYNC",title:"Ghi lại & giải xung đột cặp Trùng / Không phải trùng, gửi hàng đợi",target:"installed",safeSilent:true,needsReload:false,requiresOnline:true,respectsGuard:true,
      run:function(){return Promise.resolve(window.Dup.resync("pull")).then(function(r){return{ok:!!(r&&r.ok),msg:(r&&r.msg)||""}})}})}

  if(M.srvOnlyLocal>0&&P.online&&window.NB&&window.NB.canW&&window.Dup&&typeof window.Dup.resync==="function"){
    addStep({
      id:"DUP_REPUSH",title:"Đẩy lại "+M.srvOnlyLocal+" cặp trùng chỉ có trên máy lên máy chủ",target:"installed",safeSilent:true,needsReload:false,requiresOnline:true,respectsGuard:true,
      run:function(){return Promise.resolve(window.Dup.resync("repush")).then(function(r){return{ok:!!(r&&r.ok),msg:(r&&r.msg)||""}})}})}

  if(M.imgPS>=95||M.imgPL>=95){
    addStep({
      id:"IMG_CACHE_TRIM",title:"Tỉa bớt cache ảnh đầy (>95%) xuống 75%",target:"installed",safeSilent:true,needsReload:false,requiresOnline:false,respectsGuard:false,
      run:trimImgCache})}

  if(M.lsBytes>4000000){
    addStep({
      id:"LS_QUOTA_TRIM",title:"Giải phóng localStorage gần đầy ("+kb(M.lsBytes)+")",target:"installed",safeSilent:true,needsReload:false,requiresOnline:false,respectsGuard:true,
      run:trimLocalStorage})}

  if((M.srvItemMismatch||M.srvRoleMismatch||M.srvHashBehind||M.srvDupDesync||M.srvPosDesync)&&P.online){
    addStep({
      id:"SRV_SYNC_PULL",title:"Đồng bộ lại danh sách, quyền & hash từ máy chủ",target:"installed",safeSilent:true,needsReload:false,requiresOnline:true,respectsGuard:true,
      run:function(){
        var ps=[];
        if(window.NB&&typeof window.NB.refresh==="function")ps.push(Promise.resolve(window.NB.refresh(false)).catch(function(){}));
        if(window.Dup&&typeof window.Dup.pull==="function")ps.push(Promise.resolve(window.Dup.pull(true)).catch(function(){}));
        return Promise.all(ps).then(function(){return{ok:true,msg:"Đã kéo lại danh sách căn, quyền & dữ liệu trùng từ máy chủ"}})}})}

  /* --- NHÓM 3: KÍCH HOẠT BẢN MỚI TRONG next-* / RELOAD CÓ CHỐNG LẶP --- */
  if(M.swWaiting||(!isApk()&&M.nextCaches.length)||(M.swActive&&M.swNoController)){
    addStep({
      id:"SW_ACTIVATE_RELOAD",title:(M.nextCaches.length?"Áp dụng bản mới trong "+M.nextCaches[0]+" (promote sang shell)":M.swWaiting?"Kích hoạt bản Service Worker đang chờ":"Nhận quyền kiểm soát trang cho Service Worker"),target:(M.nextCaches.length||M.swWaiting)?"installed":"fresh",safeSilent:false,needsReload:true,requiresOnline:false,respectsGuard:true,
      run:function(){
        if(!rlCan("SW_ACTIVATE_RELOAD"))return Promise.resolve({ok:false,skippedLoop:true,msg:"Đã bỏ qua tải lại để tránh vòng lặp (đã thử gần đây)"});
        rlMark("SW_ACTIVATE_RELOAD");
        return Promise.resolve({ok:true,reloadAfter:true,msg:M.nextCaches.length?"Đang tải lại trang để sw.js chuyển bản mới từ "+M.nextCaches[0]+" sang shell":"Đang tải lại trang để kích hoạt Service Worker kiểm soát"})}})}

  if(M.compBroken||M.bridgeBroken||M.missingIgnStat){
    addStep({
      id:"VERSION_SKEW_HEAL",title:"Làm mới vỏ app do lệch phiên bản tệp con (giữ ảnh & model DINOv3)",target:"installed",safeSilent:false,needsReload:true,requiresOnline:true,respectsGuard:true,
      run:function(){
        if(!rlCan("VERSION_SKEW_HEAL"))return Promise.resolve({ok:false,skippedLoop:true,msg:"Đã bỏ qua tải lại để tránh vòng lặp (cần kiểm tra bản deploy trên máy chủ)"});
        rlMark("VERSION_SKEW_HEAL");
        if(isApk())return Promise.resolve({ok:true,reloadAfter:true,msg:"Đã tải lại WebView APK để khởi tạo lại thành phần"});
        return (window.caches?caches.keys():Promise.resolve([])).then(function(ks){
          return Promise.all(ks.filter(function(k){return k!=="img-v1"&&k!=="lib-v1"}).map(function(k){return caches.delete(k)}))
        }).then(function(){return navigator.serviceWorker?navigator.serviceWorker.getRegistrations():[]})
          .then(function(rs){return Promise.all(rs.map(function(r){return r.update().catch(function(){return r.unregister()})}))})
          .then(function(){return{ok:true,reloadAfter:true,msg:"Đã xóa vỏ app lỗi (giữ nguyên img-v1, lib-v1 DINOv3 & dữ liệu) và tải lại bản đồng bộ"}})}})}

  return{profile:P,guard:gd,steps:steps}}

function autoFix(opts){
  opts=opts||{};
  if(afBusy)return Promise.resolve({ok:false,busy:true,results:[]});
  var silent=!!opts.silent,allowReload=opts.allowReload!==undefined?!!opts.allowReload:!silent,dryRun=!!opts.dryRun;
  afBusy=true;
  var ensureRun=R?Promise.resolve(R):run(true);
  return ensureRun.then(function(){return opts.noScan?null:dupPre()}).then(function(){
    var plan=buildFixPlan(opts);
    if(dryRun){afBusy=false;return{ok:true,dryRun:true,plan:plan,results:[]}}
    var results=[],needReload=false;
    var todo=plan.steps.filter(function(s){
      if(s.blockedBy){results.push({id:s.id,title:s.title,status:"blocked",msg:s.blockedBy});return false}
      if(silent&&!s.safeSilent){results.push({id:s.id,title:s.title,status:"deferred",msg:"Cần xác nhận hoặc tải lại trang"});return false}
      if(s.needsReload&&!allowReload){results.push({id:s.id,title:s.title,status:"deferred",msg:"Đang tắt tự tải lại trang"});return false}
      return true});
    var chain=Promise.resolve();
    todo.forEach(function(s){
      chain=chain.then(function(){
        if(!silent)say("Đang sửa: "+s.title+"…");
        return Promise.resolve(s.run()).then(function(res){
          res=res||{ok:false};
          if(res.reloadAfter)needReload=true;
          results.push({id:s.id,title:s.title,status:res.skippedLoop?"skipped":res.ok?"fixed":"failed",msg:res.msg||""})
        },function(e){
          results.push({id:s.id,title:s.title,status:"failed",msg:(e&&e.message||e)})})})});
    return chain.then(function(){
      var entry={at:Date.now(),profile:plan.profile.kind,silent:silent,results:results};
      AF_LOG.push(entry);if(AF_LOG.length>15)AF_LOG.shift();
      if(needReload&&allowReload){
        if(!silent)say("Đã sửa xong, đang tải lại để áp dụng…");
        reload();
        afBusy=false;
        return{ok:true,reloading:true,plan:plan,results:results}}
      var dupRan=results.some(function(r){return /^(DSP_|DUP_)/.test(r.id)&&r.status!=="blocked"&&r.status!=="deferred"});
      return (dupRan?dupPre():Promise.resolve()).then(function(){return run(true)}).then(function(){
        afBusy=false;
        var d=G("dbgd");if(d&&d.open)draw();
        return{ok:true,reloading:false,plan:plan,results:results}})})},function(e){afBusy=false;return{ok:false,error:e&&e.message||e,results:[]}})}

/* ---------- Giao diện ---------- */
var CSS="#dbgd .form{gap:10px}"+
"#dbgd .dbgst{position:sticky;top:0;z-index:3;margin:calc(-1*var(--sp-4)) calc(-1*var(--sp-4)) 0;padding:var(--sp-4) var(--sp-4) 10px;background:var(--bg);border-bottom:1px solid var(--line)}"+
"#dbgd .dbgh{display:flex;align-items:center;justify-content:space-between;gap:8px}#dbgd .dbgh h2{margin:0}"+
"#dbgd .dbgv{display:flex;align-items:center;gap:10px;margin:10px 0 0}"+
"#dbgd .big{flex:none;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;color:#fff;background:var(--mute)}"+
"#dbgd .big.ok{background:var(--s-won)}#dbgd .big.warn{background:#b45309}#dbgd .big.bad{background:var(--danger)}"+
"#dbgd .dbgv div{min-width:0}#dbgd .dbgv b{display:block;font-size:var(--fs-b);overflow-wrap:anywhere}#dbgd .dbgv small{display:block;color:var(--mute);font-size:var(--fs-xs);overflow-wrap:anywhere}"+
"#dbgd .dbgprof{margin-top:8px;padding:6px 10px;border-radius:8px;background:var(--surface);border:1px solid var(--line);font-size:var(--fs-xs);color:var(--mute);display:flex;flex-wrap:wrap;gap:6px;align-items:center}"+
"#dbgd .dbgprof strong{color:var(--ink)}"+
"#dbgd .dbgbar{height:3px;border-radius:2px;background:var(--line);overflow:hidden;margin-top:8px}#dbgd .dbgbar[hidden]{display:none}"+
"#dbgd .dbgbar::after{content:\"\";display:block;height:100%;width:35%;background:var(--accent);animation:dbgbar 1.1s ease-in-out infinite}"+
"@keyframes dbgbar{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}"+
"@media (prefers-reduced-motion:reduce){#dbgd .dbgbar::after{animation:none;width:100%}}"+
"#dbgd .dbgfl{display:flex;gap:6px;margin-top:10px}#dbgd .dbgfl .chip{min-height:32px;padding:2px 12px;font-size:var(--fs-s)}"+
"#dbgd #dbgl{display:grid;gap:8px}"+
"#dbgd details.dbgg{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:0 10px}"+
"#dbgd details.dbgg>summary{display:flex;align-items:center;gap:8px;min-height:42px;cursor:pointer;list-style:none;font-weight:700;font-size:var(--fs-m)}"+
"#dbgd summary::-webkit-details-marker{display:none}"+
"#dbgd summary::after{content:\"▾\";color:var(--mute);transition:transform .15s}#dbgd details[open]>summary::after{transform:rotate(180deg)}"+
"#dbgd summary span{min-width:0;overflow-wrap:anywhere}"+
"#dbgd summary em{margin-left:auto;font-style:normal;font-weight:500;color:var(--mute);font-size:var(--fs-xs);white-space:nowrap}"+
"#dbgd .st{flex:none;font-style:normal;width:18px;text-align:center;font-weight:800}"+
"#dbgd .st.ok,#dbgd .dbgr.ok i{color:var(--s-won)}#dbgd .st.warn,#dbgd .dbgr.warn i{color:var(--s-contact)}#dbgd .st.bad{color:var(--danger)}#dbgd .st.info{color:var(--mute)}"+
"#dbgd .dbgr{display:flex;gap:8px;padding:6px 0;border-top:1px dashed var(--line);font-size:var(--fs-s);align-items:flex-start}"+
"#dbgd .dbgr i{flex:none;font-style:normal;width:18px;text-align:center}"+
"#dbgd .dbgr span{min-width:0;overflow-wrap:anywhere}"+
"#dbgd .dbgr.bad i,#dbgd .dbgr.bad span{color:var(--danger)}#dbgd .dbgr.bad span{font-weight:700}#dbgd .dbgr.info span{color:var(--mute)}"+
"#dbgd .dbgn{min-width:0;flex:1}#dbgd .dbgn summary{display:block;cursor:pointer;list-style:none;overflow-wrap:anywhere}#dbgd .dbgn summary::after{margin-left:6px;font-size:11px}#dbgd .dbgn p{margin:4px 0 0;color:var(--mute);font-size:var(--fs-xs);overflow-wrap:anywhere}"+
"#dbgd .dbgr.bad summary{color:var(--danger);font-weight:700}#dbgd .dbgr.info summary{color:var(--mute)}"+
"#dbgd .dbgem{text-align:center;color:var(--mute);font-size:var(--fs-m);padding:18px 0}"+
"#dbgd details.dbgt>summary{cursor:pointer;color:var(--mute);font-size:var(--fs-m);font-weight:600;min-height:36px;display:flex;align-items:center;gap:8px}"+
"#dbgd .foot{justify-content:flex-start;flex-wrap:wrap;gap:6px;display:flex}"+
"#dbgd .dbga{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 8px}"+
"#dbgd .dbgaf{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:8px 10px;display:grid;gap:6px;font-size:var(--fs-xs)}"+
"#dbgd button:disabled{opacity:.5;cursor:default}"+
"#dbgb{position:fixed;left:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:25;border:0;border-radius:999px;padding:6px 12px;min-height:34px;background:var(--danger);color:#fff;font-weight:700;font-size:var(--fs-s);box-shadow:0 3px 10px rgba(0,0,0,.3);cursor:pointer}"+
"#dbgw{position:fixed;left:8px;right:8px;top:calc(8px + env(safe-area-inset-top,0px));z-index:24;max-width:640px;margin:0 auto;background:var(--surface,#fff);color:var(--ink,#111);border:1px solid var(--danger,#c00);border-left-width:5px;border-radius:10px;padding:8px 10px;box-shadow:0 4px 16px rgba(0,0,0,.28);font-size:var(--fs-xs,12px);display:grid;gap:4px}#dbgw[hidden]{display:none}"+
"#dbgw .dbgwh{display:flex;align-items:center;justify-content:space-between;gap:8px}#dbgw .dbgwh b{color:var(--danger,#c00);font-size:var(--fs-s,13px)}#dbgw .dbgwh span{display:flex;gap:6px}"+
"#dbgw button{border:1px solid var(--line,#ccc);background:transparent;color:inherit;border-radius:999px;min-height:28px;padding:2px 10px;font-size:var(--fs-xs,12px);cursor:pointer}"+
"#dbgw .xc{width:28px;height:28px;min-height:0;padding:0;border:0;background:none;color:var(--mute,#888)}"+
"#dbgw .dbgwi{display:flex;gap:6px;align-items:flex-start;border-top:1px dashed var(--line,#ccc);padding-top:4px}#dbgw .dbgwi i{flex:none;font-style:normal;width:16px;text-align:center;font-weight:800}#dbgw .dbgwi.bad i{color:var(--danger,#c00)}#dbgw .dbgwi.warn i{color:#b45309}"+
"#dbgw .dbgwi span{min-width:0;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}#dbgw .dbgwm{color:var(--mute,#666)}";
var ICON={ok:"✓",warn:"⚠",bad:"✕",info:"•"};
var FLT="issues",OPEN={},MSG="",LH="",busy=false;
function style(){if(G("dbgcss"))return;var st=document.createElement("style");st.id="dbgcss";st.textContent=CSS;document.head.appendChild(st)}
function panel(){
  var d=G("dbgd");if(d)return d;
  style();
  d=document.createElement("dialog");d.id="dbgd";
  d.innerHTML='<div class="form"><div class="dbgst"><div class="dbgh"><h2>Kiểm tra hệ thống</h2><button type="button" class="xc" id="dbgx" aria-label="Đóng"></button></div>'+
  '<div class="dbgv"><span class="big" id="dbgbig" aria-hidden="true">•</span><div role="status" aria-live="polite"><b id="dbgt1"></b><small id="dbgt2"></small></div></div>'+
  '<div class="dbgprof" id="dbgprof"></div>'+
  '<div class="dbgbar" id="dbgbar" hidden></div><div class="dbgfl" id="dbgfl"></div></div>'+
  '<div id="dbgl"></div>'+
  '<details class="dbgt" id="dbgafwrap"><summary>Kế hoạch &amp; nhật ký tự động sửa lỗi</summary><div class="dbgaf" id="dbgaf"></div></details>'+
  '<details class="dbgt"><summary>Kiểm tra riêng lẻ</summary><div class="dbga" id="dbgq"></div></details>'+
  '<details class="dbgt"><summary>Công cụ sửa lỗi thủ công</summary><div class="dbga" id="dbgtl"></div></details>'+
  '<div class="foot" id="dbga"></div></div>';
  document.body.appendChild(d);
  d.addEventListener("click",onClick);
  d.addEventListener("toggle",function(e){var t=e.target;if(t&&t.dataset&&t.dataset.g!==undefined)OPEN[t.dataset.g]=t.open},true);
  G("dbgx").onclick=function(){d.close()};
  return d}
function say(t){MSG=t||"";var e=G("dbgt2");if(e)e.textContent=MSG||sub()}
function hm(t){return new Date(t).toLocaleTimeString("vi-VN")}
function sub(){
  var t=Math.max(R?R.at:0,S?S.at:0);
  var p=[];if(t)p.push("Cập nhật "+hm(t));
  var s=srvSum();if(s)p.push(s);
  return p.join(" · ")}
function srvSum(){
  if(!S)return "";
  var b=S.L.filter(function(x){return x.s==="bad"}).length,w=S.L.filter(function(x){return x.s==="warn"}).length;
  return b?"Máy chủ: "+b+" lỗi, "+w+" cảnh báo":w?"Máy chủ: kết nối được, "+w+" cảnh báo":"Máy chủ: kết nối bình thường"}
function groupsH(L){
  var ord=[],map={};
  L.forEach(function(x){if(!map[x.g]){map[x.g]={g:x.g,L:[],b:0,w:0};ord.push(map[x.g])}var o=map[x.g];o.L.push(x);if(x.s==="bad")o.b++;else if(x.s==="warn")o.w++});
  var h="",shown=0;
  ord.forEach(function(o){
    var iss=o.b+o.w;
    if(FLT==="issues"&&!iss)return;
    shown++;
    var rows=FLT==="issues"?o.L.filter(function(x){return x.s==="bad"||x.s==="warn"}):o.L;
    var lv=o.b?"bad":o.w?"warn":"ok";
    var op=OPEN[o.g]!==undefined?OPEN[o.g]:iss>0;
    var em=o.b?"✕ "+o.b+(o.w?" · ⚠ "+o.w:""):o.w?"⚠ "+o.w:o.L.length+" mục";
    h+='<details class="dbgg" data-g="'+esc(o.g)+'"'+(op?" open":"")+'><summary><i class="st '+lv+'">'+ICON[lv]+'</i><span>'+esc(o.g)+'</span><em>'+em+'</em></summary>';
    rows.forEach(function(x){h+=rowH(x)});
    h+='</details>'});
  if(!shown)h=!L.length?'<div class="dbgem">Chưa có kết quả</div>':'<div class="dbgem">Không có vấn đề nào. Chọn "Tất cả" để xem chi tiết.</div>';
  return h}
function rowH(x){
  var t=String(x.t),m=/^([\s\S]{16,}?[.;])\s+(\S[\s\S]*)$/.exec(t),h='<div class="dbgr '+x.s+'"><i>'+ICON[x.s]+'</i>';
  if(m&&m[2].length>8)h+='<details class="dbgn"><summary>'+esc(m[1])+'</summary><p>'+esc(m[2])+'</p></details>';
  else h+='<span>'+esc(t)+'</span>';
  return h+'</div>'}
function btn(a,t,cls,extra){return '<button type="button" class="btn'+(cls?" "+cls:"")+'" data-act="'+a+'"'+(extra||"")+'>'+t+'</button>'}
function afSectionH(){
  var plan=R?buildFixPlan():null,h="";
  if(plan){
    if(plan.guard)h+='<div style="color:var(--danger);font-weight:600">Khóa an toàn đang bật: '+esc(plan.guard)+'</div>';
    if(plan.steps.length){
      h+='<div><b>Đề xuất sửa tự động ('+plan.steps.length+' bước):</b></div>';
      plan.steps.forEach(function(s){
        var tag=s.blockedBy?"Bị khóa: "+s.blockedBy:(s.needsReload?"Cần tải lại trang":"An toàn · Không tải lại");
        h+='<div style="padding-top:4px;border-top:1px dashed var(--line)">• <b>'+esc(s.title)+'</b> <span style="color:var(--mute)">('+esc(tag)+')</span></div>'})}
    else h+='<div>Không phát hiện mục nào cần tự động sửa trên máy.</div>'}
  if(AF_LOG.length){
    var last=AF_LOG[AF_LOG.length-1];
    h+='<div style="margin-top:4px;padding-top:6px;border-top:1px solid var(--line)"><b>Lần chạy gần nhất ('+hm(last.at)+' · '+(last.silent?"chạy ngầm":"thủ công")+'):</b></div>';
    last.results.forEach(function(r){
      var ic=r.status==="fixed"?"✓":r.status==="blocked"||r.status==="deferred"?"⚠":"✕";
      h+='<div>'+ic+' '+esc(r.title)+(r.msg?" — "+esc(r.msg):"")+'</div>'})}
  return h||'<div>Chưa có dữ liệu kế hoạch sửa.</div>'}
function draw(){
  panel();
  var b=cnt("bad"),w=cnt("warn"),o=cnt("ok"),bs=busy||running||srvBusy||afBusy,has=!!(R||S);
  var lv=!has?"":b?"bad":w?"warn":"ok";
  var big=G("dbgbig");big.className="big "+lv;big.textContent=bs&&!has?"…":ICON[lv||"info"];
  G("dbgt1").textContent=bs?(afBusy?"Đang tự động sửa lỗi…":"Đang kiểm tra…"):!has?"Chưa có kết quả":b?b+" vấn đề nghiêm trọng"+(w?", "+w+" cảnh báo":""):w?w+" cảnh báo, không có lỗi nghiêm trọng":"Mọi thứ hoạt động bình thường";
  var P=R&&R.P?R.P:detectProfile();
  G("dbgprof").innerHTML='<span>Hồ sơ: <strong>'+esc(P.label)+'</strong> · '+esc(P.envLabel)+' · '+(P.online?"Có mạng":"Offline")+'</span>';
  G("dbgbar").hidden=!bs;
  G("dbgfl").innerHTML='<button type="button" class="chip" data-act="flt" data-v="issues" aria-pressed="'+(FLT==="issues")+'">Cần xử lý ('+(b+w)+')</button><button type="button" class="chip" data-act="flt" data-v="all" aria-pressed="'+(FLT==="all")+'">Tất cả ('+(b+w+o+cnt("info"))+')</button>';
  var h=groupsH(allL());
  if(h!==LH){G("dbgl").innerHTML=h;LH=h}
  G("dbgaf").innerHTML=afSectionH();
  G("dbgq").innerHTML=btn("run","Thiết bị")+btn("srv","Máy chủ")+btn("srvpost","Thử gửi (POST)");
  var afOff=false;try{afOff=localStorage.getItem("dbg-af-off")==="1"}catch(e){}
  var t=btn("toggleaf",afOff?"Bật tự sửa ngầm":"Tắt tự sửa ngầm")+btn("hide","Ẩn nút ⚠ phiên này");
  if(R&&R.can&&navigator.storage&&navigator.storage.persist)t+=btn("persist","Bật lưu trữ bền");
  t+=btn("reset","Làm mới bản cài app")+btn("img","Xóa cache ảnh")+btn("ck","Xóa checklist đã nhớ")+btn("dpm","Xóa kết quả quét (giữ hash ảnh)")+btn("dup","Đặt lại dữ liệu quét trùng");
  G("dbgtl").innerHTML=t;
  var planNow=R?buildFixPlan():null,fixN=planNow?planNow.steps.filter(function(s){return !s.blockedBy}).length:0;
  G("dbga").innerHTML=btn("autofix","Tự động sửa lỗi"+(fixN?" ("+fixN+")":""),"p")+btn("all","Kiểm tra toàn bộ")+(srvBusy?btn("stop","Dừng"):"")+btn("copy","Sao chép báo cáo");
  Array.prototype.forEach.call(G("dbgd").querySelectorAll("[data-act]"),function(x){var a=x.dataset.act;if(a==="copy"||a==="stop"||a==="flt")return;x.disabled=bs});
  say(MSG)}
function show(){
  var d=panel();draw();
  if(!d.open)d.showModal();
  if(!R||Date.now()-R.at>30000)rerun()}
function rerun(){
  if(busy)return Promise.resolve();
  busy=true;say("Đang kiểm tra thiết bị…");draw();
  return run(true).then(function(){busy=false;say("");draw()})}
function srvRun(){
  if(srvBusy)return Promise.resolve();
  srvBusy=true;PROG=function(t){say("Máy chủ "+t)};say("Máy chủ 1/5 · Kiểm tra cấu hình");draw();
  return chkServer().then(function(x){S=x},function(er){S={at:Date.now(),L:[{s:"bad",g:"Máy chủ",t:"Bộ kiểm tra bị lỗi: "+(er&&er.message||er)}]}}).then(function(){PROG=null;say("Máy chủ · Đối chiếu cặp trùng");return dupPre()}).then(function(){srvBusy=false;PROG=null;say("");draw()})}
function allRun(){
  if(busy||srvBusy)return Promise.resolve();
  busy=true;say("Đang kiểm tra thiết bị…");draw();
  return run(true).then(function(){busy=false;return srvRun()}).then(function(){busy=false;draw()})}
/* ---------- Thanh cảnh báo lỗi hiện trên màn hình ---------- */
var WE=[],WSEEN={},WDIS={},WLAST=null;
function wLv(x){
  var own=/\/(ck|img|dup|dbg|sw)\.js|index\.html/.test(x.s||"")||x.k==="load";
  return NET.test(x.m||"")?"info":own?"bad":"warn"}
function wPoll(){
  var a=B.e||[],i=WLAST?a.lastIndexOf(WLAST):-1,n=a.slice(i+1),ch=false;
  if(!a.length)return;
  WLAST=a[a.length-1];
  n.forEach(function(x){
    var lv=wLv(x),k="e|"+x.k+"|"+x.t+"|"+x.m;
    if(lv==="info"||WSEEN[k])return;
    WSEEN[k]=1;ch=true;
    var where=x.s?" ("+String(x.s).split("/").pop()+(x.l?":"+x.l:"")+")":"";
    WE.push({k:k,lv:lv,h:"Lỗi chạy ["+x.k+"]",t:(x.k==="load"?"Không nạp được ":"")+String(x.m)+where});
    if(WE.length>20)WE.shift()});
  if(ch)wDraw()}
function wItems(){
  var out=[],hide=false;
  try{hide=sessionStorage.getItem("dbg-hide")==="1"}catch(e){}
  if(hide)return out;
  allL().forEach(function(x){if(x.s==="bad")out.push({k:"c|"+x.g+"|"+x.t,lv:"bad",h:x.g,t:x.t})});
  WE.forEach(function(x){out.push(x)});
  return out.filter(function(x){return !WDIS[x.k]})}
function wDraw(){
  if(!document.body)return;
  var it=wItems(),w=G("dbgw");
  if(!it.length){if(w)w.hidden=true;return}
  if(!w){style();w=document.createElement("div");w.id="dbgw";w.setAttribute("role","alert");w.addEventListener("click",wClick);document.body.appendChild(w)}
  var h='<div class="dbgwh"><b>⚠ '+it.length+' cảnh báo lỗi</b><span><button type="button" data-w="open">Chi tiết</button><button type="button" data-w="copy">Chép</button><button type="button" class="xc sm" data-w="x" aria-label="Ẩn"></button></span></div>';
  it.slice(-3).reverse().forEach(function(x){
    h+='<div class="dbgwi '+x.lv+'"><i>'+(x.lv==="bad"?"✕":"⚠")+'</i><span>'+esc(x.h)+": "+esc(x.t)+'</span></div>'});
  if(it.length>3)h+='<div class="dbgwm">… và '+(it.length-3)+' mục khác (bấm Chi tiết)</div>';
  w.innerHTML=h;w.hidden=false}
function wClick(e){
  var b=e.target.closest&&e.target.closest("[data-w]");if(!b)return;
  var a=b.dataset.w;
  if(a==="x"){wItems().forEach(function(x){WDIS[x.k]=1});wDraw();return}
  if(a==="open"){show();return}
  if(a==="copy"){
    var t=wItems().map(function(x){return x.h+": "+x.t}).join("\n");
    copy(t).then(function(){b.textContent="Đã chép"},function(){b.textContent="Lỗi chép"});
    setTimeout(function(){b.textContent="Chép"},1500)}}
function wTest(){
  setTimeout(function(){throw new Error("Lỗi thử nghiệm từ Dbg.test(): nếu thấy thanh này là cơ chế cảnh báo hoạt động")},0);
  return "Đã phát lỗi thử, thanh cảnh báo sẽ hiện trong ~1 giây"}
var pkT=0;function pokeNow(){if(document.body)wPoll();else document.addEventListener("DOMContentLoaded",wPoll,{once:true})}
B.poke=function(){clearTimeout(pkT);pkT=setTimeout(pokeNow,300)};pokeNow();   // không còn setInterval 1 giây: index.html gọi B.poke khi có lỗi mới
function badge(){
  var b=G("dbgb"),n=cnt("bad"),hide=false;
  try{hide=sessionStorage.getItem("dbg-hide")==="1"}catch(e){}
  if(!n||hide){if(b)b.hidden=true;wDraw();return}
  if(!b){style();b=document.createElement("button");b.id="dbgb";b.type="button";b.onclick=function(){show()};document.body.appendChild(b)}
  b.hidden=false;b.textContent="⚠ "+n+" lỗi";wDraw()}
function report(){
  var t0=Math.max(R?R.at:0,S?S.at:0);
  var P=R&&R.P?R.P:detectProfile();
  var t="Báo cáo kiểm tra · "+new Date(t0||Date.now()).toLocaleString("vi-VN")+"\nHồ sơ: "+P.label+" ("+P.envLabel+")\n"+(navigator.userAgent||"")+"\nTổng: "+cnt("bad")+" lỗi · "+cnt("warn")+" cảnh báo · "+cnt("ok")+" ổn\n",g="";
  function sec(L){g="";L.forEach(function(x){if(x.g!==g){g=x.g;t+="\n["+g+"]\n"}t+=ICON[x.s]+" "+x.t+"\n"})}
  if(S){t+="\n=== Kết nối máy chủ · "+new Date(S.at).toLocaleString("vi-VN")+" ===";sec(S.L)}
  if(R){t+="\n=== Thiết bị ===";sec(R.L)}
  if(AF_LOG.length){
    t+="\n=== Nhật ký tự động sửa ===\n";
    AF_LOG.slice(-3).forEach(function(e){
      t+="- "+hm(e.at)+" ["+e.profile+(e.silent?" · ngầm":" · tay")+"]: "+e.results.map(function(r){return r.id+"="+r.status}).join(", ")+"\n"})}
  return t}
function copy(t){
  if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t);
  return new Promise(function(res,rej){
    var ta=document.createElement("textarea");ta.value=t;ta.style.cssText="position:fixed;opacity:0";document.body.appendChild(ta);ta.select();
    var ok=false;try{ok=document.execCommand("copy")}catch(e){}
    ta.remove();ok?res():rej(new Error("copy"))})}

/* ---------- Bảo vệ dữ liệu dựa trên trạng thái thật của index.html & ck.js ---------- */
function guard(forAutoFix){
  var K=window.NK;
  if(K&&K.S&&(K.S.dirty||(K.S.saveN||0)>0||(K.S.upN||0)>0||(K.S.upQ&&K.S.upQ.length)||(K.S.trashQ&&K.S.trashQ.length)||K.S.err)){
    return "Đang có thay đổi checklist chưa lưu hoặc ảnh đang tải lên. Hãy đợi xong rồi thử lại."}
  if(forAutoFix&&K&&K.tab==="ck")return "Đang mở trang Checklist, tạm hoãn để tránh gián đoạn thao tác.";
  if(forAutoFix){
    var openDlgs=document.querySelectorAll("dialog[open]");
    for(var i=0;i<openDlgs.length;i++){
      if(openDlgs[i].id!=="dbgd")return "Đang mở hộp thoại khác ("+openDlgs[i].id+"), tạm hoãn tự động sửa."}}
  return ""}
function reload(){setTimeout(function(){location.reload()},400)}
function wipeKeys(ks){
  var T=window.NT||{},M=window.NB&&window.NB.IDBM;
  return Promise.all(ks.map(function(k){
    try{if(T.ls)T.ls(k,"");else localStorage.removeItem(k)}catch(x){}
    if(M&&M.set)return M.set(k,"").catch(function(){});
    try{if(T.idbSave)T.idbSave(k,"")}catch(x){}
    return new Promise(function(r){setTimeout(r,1200)})}))}
function onClick(e){
  var b=e.target.closest("[data-act]");if(!b||b.disabled)return;
  var a=b.dataset.act,gd,bs=busy||running||srvBusy||afBusy;
  if(a==="flt"){FLT=b.dataset.v;draw();return}
  if(a==="stop"){stopSrv();say("Đang dừng…");return}
  if(a==="copy"){if(R||S)copy(report()).then(function(){say("Đã sao chép báo cáo")},function(){say("Không sao chép được, hãy thử lại")});return}
  if(bs)return;
  if(a==="autofix"){
    var pl=buildFixPlan();
    if(!pl.steps.length){say("Hệ thống đang ổn, không có mục cần sửa tự động");return}
    var hasRel=pl.steps.some(function(s){return !s.blockedBy&&s.needsReload});
    if(hasRel&&!confirm("Thuật toán sẽ sửa "+pl.steps.filter(function(s){return !s.blockedBy}).length+" mục (hồ sơ: "+pl.profile.label+") và tải lại trang để áp dụng. Dữ liệu trên Sheet/Drive, ảnh (img-v1) và model DINOv3 (lib-v1) được giữ nguyên. Tiếp tục?"))return;
    say("Đang chạy thuật toán tự động sửa…");draw();
    autoFix({silent:false,allowReload:true}).then(function(res){
      var fN=(res.results||[]).filter(function(r){return r.status==="fixed"}).length;
      var dN=(res.results||[]).filter(function(r){return r.status==="blocked"||r.status==="deferred"}).length;
      if(!res.reloading)say(fN?"Đã tự sửa "+fN+" mục"+(dN?" · "+dN+" mục tạm hoãn":""):"Không có mục nào sửa được ("+dN+" mục tạm hoãn)");
      var w=G("dbgafwrap");if(w)w.open=true;
      draw()});
    return}
  if(a==="toggleaf"){
    var off=false;try{off=localStorage.getItem("dbg-af-off")==="1";localStorage.setItem("dbg-af-off",off?"0":"1")}catch(x){}
    say(off?"Đã bật tự động sửa lỗi an toàn ngầm":"Đã tắt tự động sửa lỗi ngầm");draw();return}
  if(a==="all"){allRun();return}
  if(a==="run"){rerun();return}
  if(a==="hide"){try{sessionStorage.setItem("dbg-hide","1")}catch(x){}badge();say("Đã ẩn nút ⚠ cho đến khi mở lại app");return}
  if(a==="persist"){
    navigator.storage.persist().then(function(v){
      var m=v?"Đã bật lưu trữ bền.":"Chưa được cấp. "+whyNoPersist();
      rerun().then(function(){say(m)})},function(){say("Không gửi được yêu cầu lưu trữ bền")});return}
  if(a==="srv"){srvRun();return}
  if(a==="srvpost"){
    if(!confirm("Gửi 1 lệnh thử không có thật (dbg-ping) tới máy chủ bằng đường POST, đúng cách app vẫn dùng để lưu. Máy chủ chỉ nên trả lời \"lệnh không hợp lệ\" và không ghi gì vào Sheet/Drive. Tiếp tục?"))return;
    srvBusy=true;PROG=null;say("Đang gửi lệnh thử…");draw();
    chkPost().then(function(L){
      if(!S)S={at:Date.now(),L:[]};
      S.L=S.L.filter(function(x){return x.g!==L[0].g}).concat(L);S.at=Date.now()
    }).then(function(){srvBusy=false;say("");draw()});return}
  gd=guard(false);if(gd){say(gd);return}
  if(a==="reset"){
    if(!confirm("Xóa vỏ app đã lưu (giữ nguyên ảnh img-v1, model DINOv3 lib-v1, dữ liệu Sheet hay cài đặt) và tải lại bản mới nhất?"))return;
    say("Đang làm mới…");
    (window.caches?caches.keys():Promise.resolve([])).then(function(ks){return Promise.all(ks.filter(function(k){return k!=="img-v1"&&k!=="lib-v1"}).map(function(k){return caches.delete(k)}))})
      .then(function(){return navigator.serviceWorker?navigator.serviceWorker.getRegistrations():[]})
      .then(function(rs){return Promise.all(rs.map(function(r){return r.unregister()}))})
      .then(reload,reload);return}
  if(a==="img"){
    if(!confirm("Xóa toàn bộ ảnh đã lưu trên máy? Ảnh sẽ được tải lại từ Drive khi cần."))return;
    say("Đang xóa…");(window.caches?caches.delete("img-v1"):Promise.resolve()).then(reload,reload);return}
  if(a==="ck"){
    if(!confirm("Xóa chi tiết checklist đã nhớ trên máy? Dữ liệu trên Sheet không bị ảnh hưởng, app sẽ tải lại khi cần."))return;
    say("Đang xóa…");
    try{window.NK.S.c={}}catch(x){}
    wipeKeys(["ckc1"]).then(reload,reload);return}
  if(a==="dpm"){
    if(!confirm("Xóa kết quả so khớp ảnh trùng trên máy này? Hash ảnh được giữ nên quét lại rất nhanh. Danh sách \"Không phải trùng\" và dữ liệu trên Sheet không bị ảnh hưởng."))return;
    say("Đang xóa…");wipeKeys([KP()]).then(reload,reload);return}
  if(a==="dup"){
    if(!confirm("Đặt lại dữ liệu quét ảnh trùng trên máy này? Danh sách \"Không phải trùng\" được giữ nguyên, lần sau cần quét lại."))return;
    say("Đang đặt lại…");wipeKeys([KH(),KP(),"dhs1"]).then(reload,reload)}}

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
function autoHealSilent(){
  try{
    if(window.DBG_NO_AUTOFIX||localStorage.getItem("dbg-af-off")==="1")return Promise.resolve();
  }catch(e){}
  return dupPre().then(function(){
    var pl=buildFixPlan();
    var safe=pl.steps.filter(function(s){return !s.blockedBy&&s.safeSilent});
    if(!safe.length)return;
    return autoFix({silent:true,allowReload:false,noScan:true})})}
function start(){
  autoPersist();
  if(/[?&]dbgtest=1/.test(location.search))wTest();
  var go=function(){
    run().then(function(){return autoHealSilent()}).then(function(){
      if(/[?&]debug=1/.test(location.search))show()})};
  if(B.open){B.open=0;show();run().then(function(){return autoHealSilent()});return}   // mở thủ công (chạm tiêu đề / ?debug=1): hiện bảng ngay
  var dl=B.why?600:3000;   // được gọi do lỗi / kiểm tra hằng ngày thì chạy sớm
  setTimeout(function(){if(window.requestIdleCallback)requestIdleCallback(go,{timeout:4000});else go()},dl)}
if(document.readyState==="complete")start();else window.addEventListener("load",start);
window.Dbg={
  run:function(){return run(true)},
  show:show,
  all:allRun,
  report:function(){return R||S?report():""},
  autoFix:autoFix,
  plan:function(){return buildFixPlan()},
  profile:function(){return detectProfile(R&&R.M)},
  test:wTest,
  dupScan:function(){return dupScan().then(function(x){x.text=x.L.map(function(l){return"["+l.s+"] "+l.t}).join("\n");return x})},
  fixDup:fixDup
};
})();
