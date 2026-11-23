/* dbg.js: tự kiểm tra sau khi các thành phần đã nạp xong + công cụ gỡ lỗi.
   - Chạy ngầm ~3 giây sau khi trang tải xong, không hiện gì khi mọi thứ ổn (chỉ có nút ⚠ nhỏ khi có lỗi nghiêm trọng).
     Chạy ngầm không gửi loạt yêu cầu HEAD kiểm tra tệp cài đặt, chỉ làm mỗi 12 giờ một lần (bấm tay thì luôn làm).
   - Mở bảng báo cáo: chạm 7 lần liên tiếp vào tiêu đề trang, hoặc thêm ?debug=1 vào địa chỉ (PWA), hoặc gọi Dbg.show() trong console.
   - Bảng gồm: tóm tắt trạng thái cố định ở trên, lọc "Cần xử lý"/"Tất cả", nhóm thu gọn (tự mở nhóm có lỗi), nút "Kiểm tra toàn bộ" (thiết bị + máy chủ), nút Dừng.
   - Chỉ ĐỌC dữ liệu (ngoại lệ: mỗi phiên xin trình duyệt lưu trữ bền một lần, không hiện hộp thoại, không áp dụng cho APK; và nút "Thử gửi (POST)" do bạn tự bấm, có hỏi xác nhận).
   - Kiểm tra máy chủ chỉ chạy khi bạn bấm (không chạy ngầm): cấu hình, đường truyền tới Google và trang app (tự thử lại 1 lần để tránh báo lỗi oan), tải danh sách, làm mới nhanh 3 lần (đo độ dao động), tải checklist, tải thử 1 ảnh Drive. Toàn bộ chỉ đọc. Báo cáo không chứa link Web app, mã truy cập hay tên căn (chỉ số lượng).
   - Theo dõi thụ động số lần mất/có mạng từ lúc mở trang; kiểm tra đọc được kho IndexedDB của app.
   - Đồng bộ dữ liệu quét trùng giữa các bản cài (PWA/APK): nhóm "Đồng bộ" đọc kết quả quét (dpm2), hash ảnh (dhc6), danh sách "Không phải trùng" (dign1) và phát hiện mục cũ/lệch cài đặt; in 5 mã đối chiếu ngắn để so PWA với APK; khi bấm kiểm tra máy chủ thì đối chiếu thêm danh sách căn/ảnh và cặp "Không phải trùng" với Sheet. Chỉ đọc.
   - Các nút sửa lỗi đều hỏi xác nhận, không động tới dữ liệu trên Sheet/Drive, và từ chối khi đang có thay đổi chưa lưu hoặc ảnh đang tải lên.
   Cần đoạn bắt lỗi sớm (window.__dbg) trong <head> của index.html; thiếu đoạn đó thì dbg.js vẫn chạy nhưng chỉ thấy lỗi xảy ra sau khi nó nạp. */
(function(){
"use strict";
var G=function(i){return document.getElementById(i)};
var NOTRAP=!window.__dbg;
var B=window.__dbg||(window.__dbg={e:[],lt:0,ltn:0,lts:[],t:Date.now()});
var R=null,running=false,taps=0,tapT=0;
var FILES=["ck.js","img.js","dup.js","bk.js","dbg.js"];
var NK_KEYS=["tab","$","CK","LP","PARTS","TIPS","VW","canW","ckA","ckC","ckCopy","ckCur","ckDirty","ckFresh","ckId","ckLiteOf","ckLoad","ckQ","ckSaveOff","ckSnap","ckStat","ckT","ckTrashQ","ckUpQ","ckcSave","closeCk","esc","fail","findItem","imgSrc","items","jumpTop","openLb","persist","rtgH","runPool","shrink","trashIds","uname","upBusy","upMon","upSafe"];
var NK_FN=["$","ckCopy","ckLiteOf","ckLoad","ckSaveOff","ckSnap","ckStat","ckcSave","closeCk","esc","fail","findItem","imgSrc","jumpTop","openLb","persist","rtgH","runPool","shrink","trashIds","uname","upBusy","upMon","upSafe"];
var NI_KEYS=["IW","VW","imgSrc","findItem","segArr","curSeg","ckWarm","tab","items"];
var NI_FN=["imgSrc","findItem","segArr","curSeg","ckWarm","tab","items"];
var NB_KEYS=["$","IDBM","apiGet","apiPost","apiUrl","capP","hs","netMsg","nrm","refresh","items","canW","pendAdd","bumpVer"];
var NB_FN=["$","apiGet","apiPost","apiUrl","capP","hs","netMsg","nrm","refresh","pendAdd","bumpVer"];
var NT_KEYS=["apiGet","apiPost","items","esc","su","imgSrc","addrOf","stName","fmt","ls","openDv","openEdit","canW","idbGet","idbSave","del"];
function KH(){try{return window.Dup.keys().h}catch(e){return"dhc6"}}   /* khóa hash ảnh đang dùng (dhc6, hoặc dhc6r168 khi đổi độ phân giải) */
function KP(){try{return window.Dup.keys().p}catch(e){return"dpm2"}}   /* khóa kết quả quét */
var MOD={Ck:["init","renderCk","ckFlush","ckPersist"],Img:["init","openLb","iwGal","iwNow","iwIntent","iwCkNow"],Dup:["pull","init","open","close","sync","closeZoom"],Bk:["init"]};
var IDS=["list","ckb","lb","lbi","lbc","lbn","lbp","upd","pgCk","bk","bd","bsel","bim","bm"];
var NET=/failed to fetch|load failed|networkerror|network request|internet connection|mất kết nối|aborted/i;
var LIM={s:3000,l:700,w:360};   // mặc định; sw.js mới trả đúng số đang dùng

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

/* ---------- Các nhóm kiểm tra ---------- */
function chkComponents(add,w){
  var g="Thành phần";
  if(!w.ok){
    ["NK","NI","NT","NB","Ck","Img","Dup","Bk"].forEach(function(k){if(!window[k])add("bad",g,k+" chưa sẵn sàng sau 10 giây (tệp liên quan không nạp được hoặc index.html chạy lỗi)")});
  }else add("ok",g,"Đủ NK, NI, NT, NB, Ck, Img, Dup, Bk (sẵn sàng sau "+w.ms+" ms kể từ lúc kiểm tra)");
  Object.keys(MOD).forEach(function(m){
    if(!window[m])return;
    var miss=MOD[m].filter(function(k){return typeof window[m][k]!=="function"});
    if(miss.length)add("bad",g,m+" thiếu hàm: "+miss.join(", ")+" (có thể lệch phiên bản giữa các tệp)")});
  if(window.Ck&&!(G("ckb")&&typeof G("ckb").onclick==="function"))add("bad",g,"ck.js đã nạp nhưng chưa khởi tạo (Ck.init chưa chạy)");
  if(window.Img&&!(G("lb")&&typeof G("lb").onclick==="function"))add("bad",g,"img.js đã nạp nhưng chưa khởi tạo (Img.init chưa chạy)");
  if(window.Bk&&!(G("bk")&&G("bk").dataset.ready==="1"))add("bad",g,"bk.js đã nạp nhưng chưa khởi tạo (Bk.init chưa chạy, nút Sao lưu/khôi phục sẽ không hoạt động)");
  if(window.Dup&&!(G("dupd")&&G("dupb")))add("bad",g,"dup.js đã nạp nhưng chưa dựng giao diện Kiểm tra trùng");
  if(NOTRAP)add("warn",g,"Thiếu đoạn bắt lỗi sớm (window.__dbg) trong <head> của index.html: lỗi và tác vụ treo xảy ra trước khi dbg.js nạp sẽ không được ghi lại");
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
  bridge(add,window.NT,"NT (dup.js)",NT_KEYS,NT_KEYS);
  bridge(add,window.NB,"NB (bk.js)",NB_KEYS,NB_FN)}
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
    if(!reg){
      add("warn",g,"Chưa đăng ký (ảnh chưa được lưu bền)");
      if(B.swCall===undefined)add("bad",g,"Mã đăng ký service worker chưa từng được gọi (trang tải xong trước khi đoạn đăng ký kịp chạy)");
      else add("info",g,"Đã gọi đăng ký lúc +"+(B.swCall/1000).toFixed(1)+"s"+(B.swOk!==undefined?", hoàn tất lúc +"+(B.swOk/1000).toFixed(1)+"s":", chưa hoàn tất (xem mục Lỗi đã ghi)"));
      return}
    if(B.swCall!==undefined)add("info",g,"Đăng ký được gọi lúc +"+(B.swCall/1000).toFixed(1)+"s"+(B.swOk!==undefined?", sẵn sàng lúc +"+(B.swOk/1000).toFixed(1)+"s":""));
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
function headOk(u){return fetch(u,{method:"HEAD",cache:"no-store"}).then(function(r){return r.status},function(){return 0})}
function swFiles(tx){   // đọc danh sách SHELL_FILES và VERSION từ sw.js
  var o={v:"",list:[]},m=/const\s+VERSION\s*=\s*'([^']+)'/.exec(tx);if(m)o.v=m[1];
  var map={},re=/const\s+(\w+)\s*=\s*'(\.\/[^']+)'/g,x;
  while((x=re.exec(tx)))map[x[1]]=x[2];
  var l=/SHELL_FILES\s*=\s*\[([\s\S]*?)\]\s*;/.exec(tx);
  if(l)l[1].split(",").forEach(function(t){t=t.replace(/\/\/.*$/gm,"").trim();var q=/^'([^']+)'$/.exec(t);var f=q?q[1]:map[t];if(f&&f!=="./")o.list.push(f)});
  return o}
function chkAssets(add){
  var g="Tệp cài đặt";
  if(!/^https?:$/i.test(location.protocol))return Promise.resolve();
  var sw={v:"",list:[]};
  return fetch("sw.js",{cache:"no-store"}).then(function(r){
    if(!r.ok){add("bad",g,"sw.js: HTTP "+r.status);return}
    return r.text().then(function(tx){sw=swFiles(tx)})
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
        var font=/\/fonts\//.test(x.u);   // sw.js bỏ qua tệp thiếu khi cài, nên font thiếu chỉ là cảnh báo
        add(font?"warn":"bad",g,x.u.replace(location.origin,"")+": "+(x.c?"HTTP "+x.c:"không tải được")+(font?" (sw.js liệt kê nhưng không có: không lưu offline được, chữ có thể đổi font)":/icon/.test(x.u)?" (thiếu tệp icon hoặc sai đường dẫn)":""))});
      if(!bad.length)add("ok",g,"Đủ "+rs.length+" tệp (sw.js"+(sw.v?" "+sw.v:"")+", manifest, icon, font, mã nguồn)");
      // PWA: tệp nào có trên máy chủ mà chưa nằm trong bộ nhớ đệm vỏ app thì offline sẽ thiếu
      if(isApk()||!window.caches||!sw.v||!navigator.serviceWorker||!navigator.serviceWorker.controller)return;
      return caches.open("shell-"+sw.v).then(function(c){
        return Promise.all(rs.filter(function(x){return x.ok&&sw.list.some(function(f){return new URL(f,location.href).href===x.u})}).map(function(x){return c.match(x.u).then(function(h){return h?null:x.u})}))
      }).then(function(miss){
        miss=miss.filter(Boolean);
        if(miss.length)add("warn",g,miss.length+" tệp chưa lưu để dùng offline: "+miss.map(function(u){return u.replace(location.origin+"/","")}).join(", ")+" (mở lại app một lần khi có mạng)")},function(){})})})}
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
    else{add("info",g,"Lưu trữ bền: chưa bật. "+whyNoPersist());CAN=true}},function(){}));
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
  if(!items.length){add("warn",g,"Chưa có căn nào trên máy (chưa tải xong, đang offline, hoặc danh sách trống). Bấm \"Kiểm tra toàn bộ\" để xem lý do.");return}
  var ids={},dup=0,noName=0,withCk=0,need=0,odd=0,imG=0,imV=0,imH=0,ckC={},CKIDS={};
  try{ckC=K.ckC||{}}catch(e){}
  try{(K.CK||[]).forEach(function(s){(s.i||[]).forEach(function(x){CKIDS[x[0]]=1})})}catch(e){}
  items.forEach(function(it){
    if(ids[it.id])dup++;ids[it.id]=1;
    if(!it.n)noName++;
    imG+=(it.im||[]).length;                       // ảnh gốc (it.im)
    var c=it.ck;if(!c)return;
    var nv=(c.vi||[]).length,nh=(c.im||[]).length;  // ảnh đi xem (ck.vi), ảnh hư hỏng (ck.im)
    imV+=nv;imH+=nh;
    var has=nv+nh>0||!!(c.nt&&String(c.nt).trim());
    try{var l=K&&K.ckLiteOf?K.ckLiteOf(c):null;if(l&&l.s&&(l.s[0]+l.s[1]+l.s[2])>0)has=true}catch(e){}
    if(!has)return;                                 // chỉ tính checklist có nội dung thật, giống ckHas trong index.html
    withCk++;
    var cc=ckC[it.id];if(!(cc&&cc.h===(c.h||"")))need++;
    if(cc&&cc.ck&&cc.ck.c)for(var k in cc.ck.c)if(!CKIDS[k]){odd++;break}});
  add("ok",g,items.length+" căn · ảnh gốc "+imG+" · ảnh đi xem "+imV+" · ảnh hư hỏng "+imH+" · "+withCk+" căn có checklist");
  if(dup)add("bad",g,dup+" căn bị trùng mã (id), cần kiểm tra Sheet");
  if(noName)add("warn",g,noName+" căn chưa có tên");
  if(need)add("info",g,need+"/"+withCk+" checklist chưa tải về máy (đang tải ngầm hoặc đang offline)");
  if(odd)add("info",g,odd+" checklist có mục không còn trong biểu mẫu hiện tại (dữ liệu cũ, không ảnh hưởng)");
  if(K){
    if(K.ckDirty)add("info",g,"Đang có thay đổi checklist chưa lưu");
    if(K.ckUpQ&&K.ckUpQ.length)add("info",g,K.ckUpQ.length+" ảnh đang tải lên");
    if(K.ckTrashQ&&K.ckTrashQ.length)add("info",g,K.ckTrashQ.length+" ảnh chờ chuyển vào thùng rác")}}
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
  else if(B.laf)add("info",g,"Chưa ghi nhận khung hình nặng nào (trên 50 ms), hoặc trình duyệt không hỗ trợ đo theo nguồn")
}
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
  add("info",g,"WebGPU: "+(wg?"có (DINOv2 sẽ chạy bằng GPU nếu qua bước thử)":"không có (DINOv2 chạy WASM)")+" · crossOriginIsolated: "+(window.crossOriginIsolated?"bật":"tắt"));
  try{if(window.Dup&&typeof window.Dup.dino==="function")add("info",g,"DINOv2: "+window.Dup.dino())}catch(e){}
  var m=null;try{m=performance.memory}catch(e){}
  if(m&&m.jsHeapSizeLimit){
    var pc=Math.round(m.usedJSHeapSize*100/m.jsHeapSizeLimit);
    add(pc>=70?"warn":"info",g,"Bộ nhớ JS của trang: "+mb(m.usedJSHeapSize)+" / giới hạn "+mb(m.jsHeapSizeLimit)+" ("+pc+"%). Chrome làm tròn thô số này, chỉ dùng để so sánh tương đối")}
  else add("info",g,"Không đọc được bộ nhớ JS của trang (trình duyệt không hỗ trợ)")}
function chkErrors(add){
  var g="Lỗi đã ghi";
  if(!B.e.length){add("ok",g,"Không có lỗi nào được ghi lại");return}
  B.e.slice(-8).forEach(function(x){
    var own=/\/(ck|img|dup|dbg|sw)\.js|index\.html/.test(x.s||"")||x.k==="load";
    var net=NET.test(x.m);
    var lv=net?"info":(x.k==="load"||own)?"bad":"warn";   // lỗi đăng ký service worker (k=sw) chỉ là cảnh báo
    var where=x.s?" ("+x.s.split("/").pop()+(x.l?":"+x.l:"")+")":"";
    add(lv,g,"["+x.k+" +"+(x.t/1000).toFixed(1)+"s] "+x.m+where)})}

/* ---------- Theo dõi mạng thụ động (không gửi yêu cầu nào) + kiểm tra IndexedDB (chỉ đọc) ---------- */
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
function chkIdb(add){
  var g="Dung lượng";
  if(!window.indexedDB||!indexedDB.databases)return Promise.resolve();
  return indexedDB.databases().then(function(ds){
    if(!ds.some(function(d){return d.name==="nha-thue-kv"})){add("info",g,"IndexedDB: chưa có kho dữ liệu của app (sẽ tạo khi có dữ liệu)");return}
    return new Promise(function(res){
      var done=false,tm=setTimeout(function(){fin(function(){add("warn",g,"IndexedDB: mở kho dữ liệu quá 4 giây (bị khóa bởi cửa sổ khác?)")})},4000);
      function fin(f){if(done)return;done=true;clearTimeout(tm);try{f()}catch(e){}res()}
      var r;try{r=indexedDB.open("nha-thue-kv")}catch(e){fin(function(){add("bad",g,"IndexedDB: không mở được ("+(e&&e.message||e)+")")});return}
      r.onerror=function(){fin(function(){add("bad",g,"IndexedDB: không mở được ("+(r.error&&r.error.message||"lỗi")+"), dữ liệu bền của app có thể không lưu được")})};
      r.onblocked=function(){};
      r.onsuccess=function(){
        var db=r.result;
        if(!db.objectStoreNames.contains("kv")){db.close();fin(function(){add("bad",g,"IndexedDB: thiếu kho \"kv\" (kho dữ liệu bị tạo dở, hãy dùng \"Làm mới bản cài app\")")});return}
        try{
          var q=db.transaction("kv","readonly").objectStore("kv").count();
          q.onsuccess=function(){var n=q.result;db.close();fin(function(){add("ok",g,"IndexedDB: đọc được, "+n+" mục")})};
          q.onerror=function(){db.close();fin(function(){add("warn",g,"IndexedDB: mở được nhưng không đọc được")})}
        }catch(e){try{db.close()}catch(x){}fin(function(){add("warn",g,"IndexedDB: lỗi khi đọc ("+(e&&e.message||e)+")")})}}})
  },function(){})}

/* ---------- Đồng bộ dữ liệu quét trùng giữa các bản cài (PWA/APK). Chỉ ĐỌC ----------
   Kết quả quét ảnh (dpm2) và hash ảnh (dhc6) chỉ nằm trong IndexedDB của TỪNG bản cài, không đi qua máy chủ.
   Chỉ danh sách "Không phải trùng" (dign1) được đồng bộ lên Sheet. Nên PWA và APK chỉ ra cùng kết quả khi cùng danh sách căn,
   cùng cài đặt, cùng hash ảnh. Các mã đối chiếu dưới đây giúp thấy ngay phần nào đang lệch giữa hai bên. */
function fnv(s){var h=2166136261,i;s=String(s);for(i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return("0000000"+(h>>>0).toString(16)).slice(-8)}
function imgsOf(it){return(it.im||[]).filter(function(s){return s&&String(s).indexOf("data:")!==0})}
function fpItems(L){return fnv(L.map(function(it){return it.id+":"+(it.st||"new")+":"+imgsOf(it).slice().sort().join(",")}).sort().join("\n"))}
function fpKeys(ks){return fnv(ks.slice().sort().join("\n"))}
function rdKey(k){
  var T=window.NT,v="";
  try{v=(T&&T.ls&&T.ls(k))||""}catch(e){}
  return Promise.resolve(T&&T.idbGet?T.idbGet(k):"").then(function(x){return{ls:v,idb:typeof x==="string"?x:""}},function(){return{ls:v,idb:""}})}
function pjson(raw){if(!raw)return{o:null};try{var o=JSON.parse(raw);return o&&typeof o==="object"?{o:o}:{o:null,bad:true}}catch(e){return{o:null,bad:true}}}
function ignRead(){   // giống loadIgnored trong dup.js: ưu tiên localStorage, thiếu thì lấy IndexedDB
  return Promise.all([rdKey("dign1"),rdKey("dign1q")]).then(function(r){
    var a=pjson(r[0].ls||r[0].idb),q=pjson(r[1].ls||r[1].idb);
    return{ign:a.o||{},q:q.o||{},bad:!!(a.bad||q.bad),
      lsN:r[0].ls?Object.keys(pjson(r[0].ls).o||{}).length:-1,idbN:r[0].idb?Object.keys(pjson(r[0].idb).o||{}).length:-1}})}
function chkSync(add){
  var g="Đồng bộ · Dữ liệu quét trùng",g2="Đồng bộ · Mã đối chiếu",T=window.NT,items=[];
  try{items=(T&&T.items&&T.items())||[]}catch(e){}
  if(!T||!T.idbGet||!items.length)return Promise.resolve();
  return Promise.all([rdKey(KP()),rdKey(KH()),ignRead(),rdKey("dhs1")]).then(function(r){
    var th=85,skip=true;
    try{var t=+T.ls("dsim");if(t===92||t===88||t===85||t===80)th=t}catch(e){}
    try{skip=T.ls("dnoout")!=="0"}catch(e){}
    var pmP=pjson(r[0].idb||r[0].ls),hcP=pjson(r[1].idb||r[1].ls),ig=r[2],pm=pmP.o,hc=hcP.o||{};
    if(pmP.bad)add("bad",g,"Kết quả quét ảnh (dpm2) bị hỏng, không đọc được. Dùng \"Xóa kết quả quét (giữ hash ảnh)\" rồi quét lại");
    if(hcP.bad)add("bad",g,"Hash ảnh (dhc6) bị hỏng, không đọc được. Dùng \"Đặt lại dữ liệu quét trùng\"");
    if(ig.bad)add("bad",g,"Danh sách \"Không phải trùng\" (dign1) bị hỏng, không đọc được");
    var byId={},allImg={},actImg=[],active;
    items.forEach(function(it){byId[it.id]=it;imgsOf(it).forEach(function(s){allImg[s]=1})});
    active=skip?items.filter(function(it){return(it.st||"new")!=="out"}):items;
    active.forEach(function(it){imgsOf(it).forEach(function(s){actImg.push(s)})});
    var nImg=Object.keys(allImg).length,noHash=actImg.filter(function(s){return !hc[s]}).length;
    var pairs=[],stale=0,done={},doneN=0,orphan=0,pend=0,fail=0;
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
      var pf=pm.fail||{};Object.keys(pf).forEach(function(s){var f=pf[s];if(f&&typeof f==="object"&&f.n>=2)fail++});
      add(pm.th!==th?"warn":"ok",g,"Kết quả quét theo độ nhạy "+pm.th+"%"+(pm.th!==th?", nhưng cài đặt hiện tại là "+th+": lần mở Kiểm tra trùng tới máy này sẽ quét lại toàn bộ và kết quả có thể khác máy kia":" (khớp cài đặt hiện tại)")+" · "+pairs.length+" cặp ảnh giống nhau · "+doneN+" ảnh đã so");
      add(pend?"info":"ok",g,pend?pend+"/"+active.length+" căn chưa so ảnh (căn mới, ảnh đổi hoặc chưa quét xong), nên danh sách cặp trùng chưa đầy đủ":"Mọi căn có ảnh đều đã được so");
      if(stale)add("warn",g,stale+" cặp ảnh trỏ tới căn đã xóa hoặc ảnh đã đổi (kết quả quét cũ chưa dọn). Mở Kiểm tra trùng một lần để app tự dọn, hoặc dùng \"Xóa kết quả quét (giữ hash ảnh)\"");
      if(orphan)add("info",g,orphan+" ảnh đã so nhưng không còn thuộc căn nào (dữ liệu thừa, không ảnh hưởng kết quả)");
      if(fail)add("warn",g,fail+" ảnh không tính được hash sau nhiều lần thử (bị bỏ qua 5 phút rồi thử lại). Ảnh Drive lỗi hoặc mạng chặn, có thể làm kết quả thiếu so với máy kia")
    }else if(!pmP.bad)add("info",g,"Máy này chưa quét ảnh trùng (chưa có kết quả so khớp). Mở Kiểm tra trùng → Quét ảnh trùng");
    if(noHash)add("info",g,noHash+"/"+actImg.length+" ảnh chưa có hash trên máy này (sẽ tính khi quét)");
    var hsO=pjson(r[3].idb||r[3].ls).o||{},hsK={};
    if(hsO.v===KH())String(hsO.k||"").split(",").forEach(function(x){if(x)hsK[x]=1});
    var unsent=Object.keys(hc).filter(function(s){return !hsK[s]&&s.indexOf("data:")!==0}).length,canW=true;
    try{canW=!!(T.canW&&T.canW())}catch(e){}
    if(unsent)add(canW?"warn":"info",g,unsent+" hash ảnh chưa gửi lên máy chủ"+(canW?": máy khác chưa dùng được, nên kết quả quét có thể khác. Mở Kiểm tra trùng và để app tự gửi (cần mạng)":" (máy này chỉ xem nên không gửi được)"));
    else if(Object.keys(hc).length)add("ok",g,"Mọi hash ảnh trên máy đã có trên máy chủ (đã kéo tới dòng "+(+hsO.n||0)+")");
    var nq=Object.keys(ig.q).length;
    if(nq)add("warn",g,nq+" thay đổi \"Không phải trùng\" chưa gửi lên máy chủ: máy khác chưa thấy. Cần có mạng và quyền sửa; mở Kiểm tra trùng rồi đóng lại để gửi");
    if(ig.lsN>=0&&ig.idbN>=0&&ig.lsN!==ig.idbN)add("info",g,"\"Không phải trùng\": localStorage có "+ig.lsN+" cặp, IndexedDB có "+ig.idbN+" cặp (có thể vừa thay đổi, đang ghi dở)");
    var igk=Object.keys(ig.ign).filter(function(k){var a=k.split("|");return byId[a[0]]&&byId[a[1]]});
    var hcFp=fnv(actImg.slice().sort().map(function(s){return s+"="+(hc[s]||"")}).join("\n"));
    add("info",g2,"So các mã này giữa PWA và APK: mã nào khác là phần đang lệch. Kết quả quét chỉ lưu riêng từng máy, không đồng bộ qua máy chủ");
    add("info",g2,"Danh sách căn & ảnh: "+fpItems(items)+" · "+items.length+" căn · "+nImg+" ảnh");
    add("info",g2,"Cài đặt quét: "+fnv(th+"|"+skip)+" · độ nhạy "+th+" · "+(skip?"bỏ qua căn Loại":"gồm cả căn Loại"));
    add("info",g2,"Hash ảnh: "+hcFp+" · "+(actImg.length-noHash)+"/"+actImg.length+" ảnh đã có hash"+(unsent?" · chờ gửi "+unsent:""));
    add("info",g2,"Kết quả quét: "+(pm&&pm.pairs?fpKeys(pairs)+" · "+pairs.length+" cặp ảnh · "+doneN+" ảnh đã so":"chưa quét"));
    add("info",g2,"Không phải trùng: "+fpKeys(igk)+" · "+igk.length+" cặp"+(nq?" (đang chờ gửi "+nq+")":""))
  },function(){})}

/* ---------- Kiểm tra kết nối máy chủ (Google Apps Script). Chỉ chạy khi bấm nút, toàn bộ là yêu cầu ĐỌC ---------- */
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
/* Thử lại 1 lần sau 0,8 giây khi lỗi mạng hoặc quá giờ (Apps Script khởi động nguội, sóng chập chờn), tránh báo lỗi oan. Thử lại thành công vẫn ghi nhận (v.retried) để thấy kết nối không ổn định */
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
function chkSyncSrv(add,base,d){
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
      else add("warn",g,"Cặp Không phải trùng lệch máy chủ (mã máy "+fL+", máy chủ "+fS+"): "+(onlyLp?onlyLp+" cặp chỉ có trên máy":"")+(onlyLp&&onlySp?", ":"")+(onlySp?onlySp+" cặp chỉ có trên máy chủ":"")+". Mở Kiểm tra trùng để kéo/gửi lại; nếu máy chỉ xem thì không gửi được");
      if(nAll>sk.length)add("info",g,(nAll-sk.length)+" cặp trên máy chủ trỏ tới căn không còn (app bỏ qua, không ảnh hưởng)");
      add("info",g,"So mã danh sách căn & ảnh ở trên với nhóm \"Đồng bộ · Mã đối chiếu\" của từng máy (PWA, APK): mã máy chủ là chuẩn chung")})
  },function(e){srvFail(add,g,"Tải cặp Không phải trùng",e)}).then(function(){return hashProbe(add,base,g)})}
function hashProbe(add,base,g){
  if(stopped)return Promise.resolve();
  return tget(base+"&action=hash&v="+encodeURIComponent(KH())+"&count=1",{cache:"no-store"},25000,15000).then(function(res){
    var d=parseSrv(res,add,g,"Đếm hash ảnh");if(!d)return;
    if(typeof d.total!=="number"){add("warn",g,"Máy chủ chưa hỗ trợ đồng bộ hash ảnh: dán Code.gs mới vào Apps Script rồi Deploy > Manage deployments > Edit > New version");return}
    return rdKey("dhs1").then(function(r){
      var o=pjson(r.idb||r.ls).o||{},n=o.v===KH()?(+o.n||0):0;
      if(d.total>n)add("warn",g,"Tab Hash trên máy chủ có "+d.total+" dòng, máy mới kéo tới dòng "+n+": còn "+(d.total-n)+" dòng chưa kéo về. Mở Kiểm tra trùng để kéo");
      else if(d.total<n)add("warn",g,"Máy đã kéo tới dòng "+n+" nhưng tab Hash chỉ còn "+d.total+" dòng (Sheet bị xóa bớt). Mở Kiểm tra trùng để máy gửi lại");
      else add("ok",g,"Hash ảnh khớp máy chủ: "+d.total+" dòng, máy đã kéo hết")})
  },function(e){srvFail(add,g,"Đếm hash ảnh",e)})}
function chkServer(){
  var L=[];function add(s,g,t){L.push({s:s,g:g,t:t})}
  var X={at:Date.now(),L:L},g1="Máy chủ · Cấu hình",g2="Máy chủ · Đường truyền",g3="Máy chủ · Phản hồi",g4="Máy chủ · Ảnh Drive";
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
      if(local>=0&&local!==n)add("warn",g3,"Lệch số căn: máy chủ "+n+", trên máy "+local+" (nếu vừa thêm/xóa thì bình thường, bấm Kiểm tra lại; nếu vẫn lệch hãy kéo làm mới danh sách)");
      try{if(K&&typeof K.canW==="boolean"&&K.canW!==(d.role==="edit"))add("warn",g3,"Quyền trên máy ("+(K.canW?"sửa":"xem")+") khác máy chủ ("+(d.role==="edit"?"sửa":"xem")+"), hãy tải lại app")}catch(e){}
      if(!d.ver)add("warn",g3,"Máy chủ không trả số phiên bản dữ liệu (ver): app sẽ tải lại cả danh sách mỗi lần làm mới");
      /* Làm mới nhanh 3 lần liên tiếp: đo độ ổn định (nhanh nhất / chậm nhất) thay vì chỉ 1 mẫu */
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
        return p.then(function(){return chkSyncSrv(add,base,d)}).then(function(){return chkImg(add,g4,T)}).then(function(){return X})})
    },function(e){srvFail(add,g3,"Tải danh sách",e);return X})})}
function chkPost(){
  var L=[],g="Máy chủ · Gửi dữ liệu (POST)",cf=sfg();
  function add(s,t){L.push({s:s,g:g,t:t})}
  stopped=false;
  if(!cf.u||!cf.k){add("bad","Thiếu link Web app hoặc mã truy cập");return Promise.resolve(L)}
  var f=function(m,e){if(e&&e.stopped){add("info",m.replace(/ thất bại$/,"")+": đã dừng theo yêu cầu");return}add("bad",m+": "+(e&&e.first?"2 lần (lần 1: "+e.first+") · ":"")+(e&&e.message||e)+". Kiểm tra link /exec đã triển khai và quyền \"Bất kỳ ai\"")};
  /* Không thử lại tự động: POST có thể đã tới máy chủ dù phản hồi bị mất */
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
  var L=[];
  function add(s,g,t){L.push({s:s,g:g,t:t})}
  function fin(){R={at:Date.now(),L:L,can:CAN};running=false;badge();var d=G("dbgd");if(d&&d.open)draw();return R}
  return wait().then(function(w){
    chkComponents(add,w);chkBridges(add);chkRes(add);
    return chkSw(add).then(function(){return (force||assetsDue())?chkAssets(add):0}).then(function(){return chkCaches(add)}).then(function(){return chkStorage(add)}).then(function(){return chkIdb(add)}).then(function(){return chkSync(add)}).then(function(){
      chkNative(add);chkData(add);chkPerf(add);chkMode(add);chkLink(add);chkEnv(add);chkErrors(add)})
  }).then(fin,function(e){add("bad","Kiểm tra","Chính bộ kiểm tra bị lỗi: "+(e&&e.message||e));return fin()})}
function allL(){return (S?S.L:[]).concat(R?R.L:[])}
function cnt(s){return allL().filter(function(x){return x.s===s}).length}

/* ---------- Giao diện ---------- */
var CSS="#dbgd .form{gap:10px}"+
"#dbgd .dbgst{position:sticky;top:0;z-index:3;margin:calc(-1*var(--sp-4)) calc(-1*var(--sp-4)) 0;padding:var(--sp-4) var(--sp-4) 10px;background:var(--bg);border-bottom:1px solid var(--line)}"+
"#dbgd .dbgh{display:flex;align-items:center;justify-content:space-between;gap:8px}#dbgd .dbgh h2{margin:0}"+
"#dbgd .dbgxb{flex:none;width:36px;height:36px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:20px;line-height:1;cursor:pointer;padding:0}"+
"#dbgd .dbgv{display:flex;align-items:center;gap:10px;margin:10px 0 0}"+
"#dbgd .big{flex:none;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;color:#fff;background:var(--mute)}"+
"#dbgd .big.ok{background:var(--s-won)}#dbgd .big.warn{background:#b45309}#dbgd .big.bad{background:var(--danger)}"+
"#dbgd .dbgv div{min-width:0}#dbgd .dbgv b{display:block;font-size:var(--fs-b);overflow-wrap:anywhere}#dbgd .dbgv small{display:block;color:var(--mute);font-size:var(--fs-xs);overflow-wrap:anywhere}"+
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
"#dbgd .dbgem{text-align:center;color:var(--mute);font-size:var(--fs-m);padding:18px 0}"+
"#dbgd details.dbgt>summary{cursor:pointer;color:var(--mute);font-size:var(--fs-m);font-weight:600;min-height:36px;display:flex;align-items:center;gap:8px}"+
"#dbgd .foot{justify-content:flex-start;flex-wrap:wrap}"+
"#dbgd .dbga{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 8px}"+
"#dbgd button:disabled{opacity:.5;cursor:default}"+
"#dbgb{position:fixed;left:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:25;border:0;border-radius:999px;padding:6px 12px;min-height:34px;background:var(--danger);color:#fff;font-weight:700;font-size:var(--fs-s);box-shadow:0 3px 10px rgba(0,0,0,.3);cursor:pointer}";
var ICON={ok:"✓",warn:"⚠",bad:"✕",info:"•"};
var FLT="issues",OPEN={},MSG="",LH="",busy=false;
function style(){if(G("dbgcss"))return;var st=document.createElement("style");st.id="dbgcss";st.textContent=CSS;document.head.appendChild(st)}
function panel(){
  var d=G("dbgd");if(d)return d;
  style();
  d=document.createElement("dialog");d.id="dbgd";
  d.innerHTML='<div class="form"><div class="dbgst"><div class="dbgh"><h2>Kiểm tra hệ thống</h2><button type="button" class="dbgxb" id="dbgx" aria-label="Đóng">×</button></div>'+
  '<div class="dbgv"><span class="big" id="dbgbig" aria-hidden="true">•</span><div role="status" aria-live="polite"><b id="dbgt1"></b><small id="dbgt2"></small></div></div>'+
  '<div class="dbgbar" id="dbgbar" hidden></div><div class="dbgfl" id="dbgfl"></div></div>'+
  '<div id="dbgl"></div>'+
  '<details class="dbgt"><summary>Kiểm tra riêng lẻ</summary><div class="dbga" id="dbgq"></div></details>'+
  '<details class="dbgt"><summary>Công cụ sửa lỗi</summary><div class="dbga" id="dbgtl"></div></details>'+
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
    rows.forEach(function(x){h+='<div class="dbgr '+x.s+'"><i>'+ICON[x.s]+'</i><span>'+esc(x.t)+'</span></div>'});
    h+='</details>'});
  if(!shown)h=!L.length?'<div class="dbgem">Chưa có kết quả</div>':'<div class="dbgem">Không có vấn đề nào. Chọn "Tất cả" để xem chi tiết.</div>';
  return h}
function btn(a,t,cls,extra){return '<button type="button" class="btn'+(cls?" "+cls:"")+'" data-act="'+a+'"'+(extra||"")+'>'+t+'</button>'}
function draw(){
  panel();
  var b=cnt("bad"),w=cnt("warn"),o=cnt("ok"),bs=busy||running||srvBusy,has=!!(R||S);
  var lv=!has?"":b?"bad":w?"warn":"ok";
  var big=G("dbgbig");big.className="big "+lv;big.textContent=bs&&!has?"…":ICON[lv||"info"];
  G("dbgt1").textContent=bs?"Đang kiểm tra…":!has?"Chưa có kết quả":b?b+" vấn đề nghiêm trọng"+(w?", "+w+" cảnh báo":""):w?w+" cảnh báo, không có lỗi nghiêm trọng":"Mọi thứ hoạt động bình thường";
  G("dbgbar").hidden=!bs;
  G("dbgfl").innerHTML='<button type="button" class="chip" data-act="flt" data-v="issues" aria-pressed="'+(FLT==="issues")+'">Cần xử lý ('+(b+w)+')</button><button type="button" class="chip" data-act="flt" data-v="all" aria-pressed="'+(FLT==="all")+'">Tất cả ('+(b+w+o+cnt("info"))+')</button>';
  var h=groupsH(allL());
  if(h!==LH){G("dbgl").innerHTML=h;LH=h}
  G("dbgq").innerHTML=btn("run","Thiết bị")+btn("srv","Máy chủ")+btn("srvpost","Thử gửi (POST)");
  var t=btn("hide","Ẩn nút ⚠ phiên này");
  if(R&&R.can&&navigator.storage&&navigator.storage.persist)t+=btn("persist","Bật lưu trữ bền");
  t+=btn("reset","Làm mới bản cài app")+btn("img","Xóa cache ảnh")+btn("ck","Xóa checklist đã nhớ")+btn("dpm","Xóa kết quả quét (giữ hash ảnh)")+btn("dup","Đặt lại dữ liệu quét trùng");
  G("dbgtl").innerHTML=t;
  G("dbga").innerHTML=btn("all","Kiểm tra toàn bộ","p")+(srvBusy?btn("stop","Dừng"):"")+btn("copy","Sao chép báo cáo");
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
  return chkServer().then(function(x){S=x},function(er){S={at:Date.now(),L:[{s:"bad",g:"Máy chủ",t:"Bộ kiểm tra bị lỗi: "+(er&&er.message||er)}]}}).then(function(){srvBusy=false;PROG=null;say("");draw()})}
function allRun(){
  if(busy||srvBusy)return Promise.resolve();
  busy=true;say("Đang kiểm tra thiết bị…");draw();
  return run(true).then(function(){busy=false;return srvRun()}).then(function(){busy=false;draw()})}
function badge(){
  var b=G("dbgb"),n=cnt("bad"),hide=false;
  try{hide=sessionStorage.getItem("dbg-hide")==="1"}catch(e){}
  if(!n||hide){if(b)b.hidden=true;return}
  if(!b){style();b=document.createElement("button");b.id="dbgb";b.type="button";b.onclick=function(){show()};document.body.appendChild(b)}
  b.hidden=false;b.textContent="⚠ "+n+" lỗi"}
function report(){
  var t0=Math.max(R?R.at:0,S?S.at:0);
  var t="Báo cáo kiểm tra · "+new Date(t0||Date.now()).toLocaleString("vi-VN")+"\n"+(navigator.userAgent||"")+"\n"+(window.Capacitor?"APK (Capacitor)":"Trình duyệt/PWA")+"\nTổng: "+cnt("bad")+" lỗi · "+cnt("warn")+" cảnh báo · "+cnt("ok")+" ổn\n",g="";
  function sec(L){g="";L.forEach(function(x){if(x.g!==g){g=x.g;t+="\n["+g+"]\n"}t+=ICON[x.s]+" "+x.t+"\n"})}
  if(S){t+="\n=== Kết nối máy chủ · "+new Date(S.at).toLocaleString("vi-VN")+" ===";sec(S.L)}
  if(R){t+="\n=== Thiết bị ==="+"";sec(R.L)}
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
/* Xóa khóa trong IndexedDB và chờ ghi xong rồi mới tải lại (idbSave của app có độ trễ 0,7 giây, tải lại ngay sẽ làm lệnh xóa bị mất) */
function wipeKeys(ks){
  var T=window.NT||{},M=window.NB&&window.NB.IDBM;
  return Promise.all(ks.map(function(k){
    try{if(T.ls)T.ls(k,"")}catch(x){}
    if(M&&M.set)return M.set(k,"").catch(function(){});
    try{if(T.idbSave)T.idbSave(k,"")}catch(x){}
    return new Promise(function(r){setTimeout(r,1200)})}))}
function onClick(e){
  var b=e.target.closest("[data-act]");if(!b||b.disabled)return;
  var a=b.dataset.act,gd,bs=busy||running||srvBusy;
  if(a==="flt"){FLT=b.dataset.v;draw();return}
  if(a==="stop"){stopSrv();say("Đang dừng…");return}
  if(a==="copy"){if(R||S)copy(report()).then(function(){say("Đã sao chép báo cáo")},function(){say("Không sao chép được, hãy thử lại")});return}
  if(bs)return;
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
function start(){
  autoPersist();
  var go=function(){run().then(function(){if(/[?&]debug=1/.test(location.search))show()})};
  setTimeout(function(){if(window.requestIdleCallback)requestIdleCallback(go,{timeout:4000});else go()},3000)}
if(document.readyState==="complete")start();else window.addEventListener("load",start);
window.Dbg={run:function(){return run(true)},show:show,all:allRun,report:function(){return R||S?report():""}};
})();
