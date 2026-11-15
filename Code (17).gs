/**
 * Backend app "Tìm nhà thuê": dữ liệu -> Google Sheets, ảnh -> Google Drive.
 * ĐỔI HAI MÃ DƯỚI ĐÂY. Sau khi dán code mới: chạy lại hàm setup() một lần,
 * rồi Deploy > Manage deployments > Edit > New version.
 */
var EDIT_KEY = '17071993@';   // xem + sửa + tải ảnh
var VIEW_KEY = '17071993@';   // chỉ xem

var SHEET = 'Houses';
var SUMMARY = 'Tổng hợp';
// Ảnh lưu theo cấu trúc: [thư mục chứa file Sheet này] / Ảnh nhà / [tên từng căn] / ảnh
var PHOTO_FOLDER_NAME = 'Ảnh nhà';
var VIEW_FOLDER_NAME = 'Ảnh đi xem';          // cùng cấp với 'Ảnh nhà'; bên trong mỗi căn một thư mục theo tên căn
var DAMAGE_FOLDER_NAME = 'Ảnh lỗi, hư hỏng';   // nằm trong thư mục căn của 'Ảnh đi xem'
var PARENT_FOLDER_ID = '';   // để trống = tự dùng thư mục đang chứa file Sheet. Muốn đặt chỗ khác thì dán ID thư mục vào đây.
var GREEN = '#0f6b57';

var COLS = ['id','t','n','a','d','st','p','ar','dp','u','ph','on','sn','sp','mp','dr','vd','lh','lk','pr','co','rt','im','cp','cn','ck','cf','fv'];
var HEAD = ['ID','Thêm lúc','Tên / mã','Địa chỉ','Khu vực','Trạng thái','Giá (triệu/tháng)','Diện tích (m²)','Cọc (triệu)','Điện / nước','SĐT chủ nhà','Tên chủ nhà','Tên sale / môi giới','SĐT sale','Link bản đồ','Album ảnh','Ngày hẹn xem','Ngày liên hệ','Tin đăng','Ưu điểm','Nhược điểm','Điểm (1–5)','Ảnh (mã Drive)','Checklist (đạt / tổng)','Ghi chú & hư hỏng khi xem','Checklist (dữ liệu)','Checklist (theo form)','Yêu thích (1 = có)'];
var WIDTH = [60,90,220,220,120,110,110,100,90,110,115,130,140,115,160,160,115,115,160,240,240,80,160,120,240,160,340,90];
var NUM = {t:1,p:1,ar:1,dp:1,rt:1,fv:1};
var FMT = COLS.map(function(c){ return (c==='p'||c==='dp') ? '#,##0.0' : (c==='ar'||c==='rt'||c==='t'||c==='fv') ? '0' : '@'; });

// Form checklist (khớp với tab Checklist trong app). CK_FULL = true: liệt kê cả mục chưa kiểm (☐).
var CK_FULL = false;
var CK = [
 {t:"Tổng thể căn hộ",i:[["a1","Không mùi ẩm, mốc"],["a2","Tường/trần không thấm nước, loang ố"],["a3","Sàn không phồng, nứt"],["a4","Cửa chính chắc chắn, khóa an toàn"],["a5","Ánh sáng tự nhiên ổn"],["a6","Hướng nắng (có nắng gắt chiều?)"]]},
 {t:"Lầu & an toàn thoát hiểm",fp:1,f:[["floor","Căn hộ ở lầu","t"]],i:[["b1","Có thang máy"],["b2","Có thang thoát hiểm riêng, dễ tiếp cận"],["b3","Lối thoát hiểm không bị khóa / chặn"],["b4","Có đèn EXIT / đèn hành lang ban đêm"]]},
 {t:"Phòng tắm & thoát nước",i:[["c1","Áp lực nước mạnh"],["c2","Máy nước nóng hoạt động"],["c3","Thoát nước nhanh, không đọng"],["c4","Không mùi cống"],["c5","Ron gạch không mốc đen"],["c6","Toilet xả mạnh, không rò"]]},
 {t:"Bếp",i:[["d1","Bếp gas / điện từ hoạt động"],["d2","Gas trung tâm hay bình riêng?"],["d3","Máy hút mùi hoạt động"],["d4","Bồn rửa không rò nước"],["d5","Tủ bếp không mối mọt"],["d6","Có sẵn nồi, chảo?"]]},
 {t:"Máy giặt (theo yêu cầu)",i:[["e1","Có máy giặt riêng trong căn"],["e2","Máy giặt dùng chung hay riêng?"],["e3","Vị trí phơi đồ thoáng, có nắng?"],["e4","Có quy định giờ giặt?"]]},
 {t:"Điện – Nước – Điều hòa",f:[["elec","Giá điện","s",["Nhà nước","Giá chủ nhà"]]],i:[["f1","Đồng hồ điện riêng"],["f2","Đồng hồ nước riêng"],["f3","Máy lạnh chạy êm, không chảy nước"],["f4","Ổ cắm đủ dùng, không lỏng"]]},
 {t:"Internet & sóng",f:[["isp","Nhà mạng","s",["VNPT","Viettel","FPT","Khác"]]],i:[["g1","Có sẵn internet?"],["g2","Tốc độ ổn định (test wifi)"],["g3","Sóng điện thoại mạnh (4G/5G)"],["g4","Cho lắp thêm mạng riêng nếu cần?"]]},
 {t:"Phòng ngủ",i:[["h1","Cách âm ổn (xe, karaoke, hàng xóm)"],["h2","Có cửa sổ thông thoáng"],["h3","Rèm, khóa cửa sổ đầy đủ"],["h4","Tủ/giường chắc chắn (nếu có)"]]},
 {t:"Khách thuê & môi trường xung quanh",f:[["tenants","Tệp khách thuê cùng khu vực","m",["Văn phòng / gia đình","Sinh viên","Người nước ngoài","Airbnb / ngắn hạn"]]],i:[["i1","Khu vực yên tĩnh ban đêm"],["i2","Không gần karaoke / quán nhậu"],["i3","Không hay ngập nước"]]},
 {t:"An ninh & tiện ích",f:[["park","Gửi xe máy","s",["Miễn phí","Tính phí"]],["hours","Giờ giấc ra vào","t"]],i:[["j1","Bảo vệ / lễ tân"],["j2","Camera an ninh"],["j3","Ra vào bằng thẻ từ / khóa vân tay"]]},
 {t:"Hợp đồng & chi phí (bắt buộc hỏi)",f:[["term","Thời hạn thuê","t"],["depm","Cọc (số tháng)","t"],["mgmt","Giá thuê đã bao gồm phí quản lý?","t"],["unit","Điện / nước ghi rõ đơn giá","t"],["refund","Điều kiện hoàn cọc","t"],["notice","Báo trước bao lâu khi trả nhà?","t"],["repair","Ai chịu phí sửa chữa?","t"],["resid","Có hỗ trợ đăng ký tạm trú?","t"]]}
];
function ckForm_(ck){
  if(!ck) return '';
  var c = ck.c || {}, v = ck.v || {}, out = [], any = false, good = 0, bad = 0, total = 0;
  CK.forEach(function(s){
    var lines = [], d = 0, n = (s.i || []).length;
    function flds(){
      (s.f || []).forEach(function(f){
        var val = v[f[0]];
        if(Array.isArray(val)) val = val.join(', ');
        if(val !== undefined && val !== null && String(val).trim() !== ''){ lines.push('• ' + f[1] + ': ' + val); any = true; }
        else if(CK_FULL) lines.push('• ' + f[1] + ': …');
      });
    }
    function items(){
      (s.i || []).forEach(function(x){
        var st = c[x[0]] || 0;
        total++;
        if(st === 1){ d++; good++; any = true; }
        else if(st === 2){ bad++; any = true; }
        if(st || CK_FULL) lines.push((st === 1 ? '✓ ' : st === 2 ? '✕ ' : '☐ ') + x[1]);
      });
    }
    if(s.fp) flds();
    items();
    if(!s.fp) flds();
    if(lines.length){
      if(out.length) out.push('');
      out.push('■ ' + s.t + ' (' + d + '/' + n + ')');
      out = out.concat(lines);
    }
  });
  if(ck.nt && String(ck.nt).trim() !== ''){
    if(out.length) out.push('');
    out.push('📝 Ghi chú & hư hỏng:', String(ck.nt).trim());
    any = true;
  }
  if(!any) return '';
  var head = 'CHECKLIST: ' + good + '/' + total + ' đạt' + (bad ? ' · ' + bad + ' lỗi' : '');
  var left = total - good - bad;
  if(!CK_FULL && left > 0) out.push('', '☐ Chưa kiểm: ' + left + ' mục');
  return head + '\n\n' + out.join('\n');
}
/** Điền lại cột "Checklist (theo form)" cho các căn đã lưu từ trước. */
function backfillCf_(sh){
  var last = sh.getLastRow();
  if(last < 2) return;
  var jc = COLS.indexOf('ck') + 1, cc = COLS.indexOf('cf') + 1;
  var out = sh.getRange(2,jc,last-1,1).getValues().map(function(r){
    var ck = null;
    try{ ck = r[0] ? JSON.parse(r[0]) : null; }catch(e){}
    return [ckForm_(ck)];
  });
  sh.getRange(2,cc,last-1,1).setNumberFormat('@').setValues(out);
}

// mã trạng thái, nhãn hiển thị, màu nền, màu chữ
var ST = [
  ['new','Mới tìm','#e4e9e6','#5f6f6a'],
  ['contact','Đã liên hệ','#faecc8','#8a5a00'],
  ['seen','Đã xem','#dbe8f7','#1d5fa8'],
  ['won','Chốt','#d2eee4','#0f6b57'],
  ['out','Loại','#ececec','#7d8884']
];
function stLabel_(c){ for(var i=0;i<ST.length;i++) if(ST[i][0]===c) return ST[i][1]; return ST[0][1]; }
function stCode_(v){ for(var i=0;i<ST.length;i++) if(ST[i][0]===v || ST[i][1]===v) return ST[i][0]; return 'new'; }

function role_(k){ if(k && k === EDIT_KEY) return 'edit'; if(k && k === VIEW_KEY) return 'view'; return null; }
function out_(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function sheet_(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET);
  if(!sh){ sh = ss.insertSheet(SHEET); format_(sh); }
  else if(sh.getMaxColumns() < COLS.length) ensureCols_(sh);
  return sh;
}
/** Bảng cũ chưa có cột mới (vd Yêu thích): tự thêm cột + tiêu đề, không đụng dữ liệu cũ. */
function ensureCols_(sh){
  var n = COLS.length, have = sh.getMaxColumns();
  if(have >= n) return;
  sh.insertColumnsAfter(have, n - have);
  var rows = sh.getMaxRows();
  sh.getRange(1,have+1,1,n-have).setNumberFormat('@').setValues([HEAD.slice(have)])
    .setBackground(GREEN).setFontColor('#ffffff').setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
  for(var i = have; i < n; i++){
    sh.setColumnWidth(i+1, WIDTH[i]);
    if(rows > 1) sh.getRange(2,i+1,rows-1,1).setNumberFormat(FMT[i]).setHorizontalAlignment('center');
  }
}
/** Thư mục "Ảnh nhà" (tạo một lần, nằm cạnh file Sheet). */
function folder_(){
  var props = PropertiesService.getScriptProperties();
  function saved_(){
    var id = props.getProperty('PHOTOROOT');
    if(!id) return null;
    try{ var c = DriveApp.getFolderById(id); if(!c.isTrashed()) return c; }catch(e){}
    return null;
  }
  var f = saved_();
  if(f) return f;
  var lock = LockService.getScriptLock(), got = false;
  try{
    got = lock.tryLock(10000);
    f = saved_();                      // có thể request khác vừa tạo xong
    if(f) return f;
    var parent;
    if(PARENT_FOLDER_ID){
      try{ parent = DriveApp.getFolderById(PARENT_FOLDER_ID); }
      catch(e){ throw new Error('Không mở được thư mục cha trên Drive. Kiểm tra PARENT_FOLDER_ID và quyền của tài khoản chạy script.'); }
    }else{
      var ps = DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId()).getParents();
      parent = ps.hasNext() ? ps.next() : DriveApp.getRootFolder();
    }
    var it = parent.getFoldersByName(PHOTO_FOLDER_NAME);
    f = it.hasNext() ? it.next() : parent.createFolder(PHOTO_FOLDER_NAME);
    props.setProperty('PHOTOROOT', f.getId());
    return f;
  }finally{
    if(got){ try{ lock.releaseLock(); }catch(e2){} }
  }
}

/** Thư mục gốc "Ảnh đi xem": tạo một lần, nằm cùng cấp (cùng thư mục cha) với "Ảnh nhà". */
function viewRoot_(){
  var props = PropertiesService.getScriptProperties();
  function saved_(){
    var id = props.getProperty('VIEWROOT');
    if(!id) return null;
    try{ var c = DriveApp.getFolderById(id); if(!c.isTrashed()) return c; }catch(e){}
    return null;
  }
  var f = saved_();
  if(f) return f;
  var lock = LockService.getScriptLock(), got = false;
  try{
    got = lock.tryLock(10000);
    f = saved_();
    if(f) return f;
    var ps = folder_().getParents();
    var parent = ps.hasNext() ? ps.next() : DriveApp.getRootFolder();
    var it = parent.getFoldersByName(VIEW_FOLDER_NAME);
    f = it.hasNext() ? it.next() : parent.createFolder(VIEW_FOLDER_NAME);
    props.setProperty('VIEWROOT', f.getId());
    return f;
  }finally{
    if(got){ try{ lock.releaseLock(); }catch(e2){} }
  }
}
/** Chia sẻ "Ai có link được xem" cho "Ảnh đi xem" đúng một lần (để app hiện được ảnh). */
function shareViewRoot_(){
  var props = PropertiesService.getScriptProperties();
  if(props.getProperty('VIEWSHARED')) return;
  var ok = '1';
  try{ viewRoot_().setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); }catch(err){ ok = 'x'; }
  props.setProperty('VIEWSHARED', ok);
}

/** Chia sẻ "Ai có link được xem" cho thư mục gốc \"Ảnh nhà\" đúng một lần; mọi thư mục/ảnh bên trong kế thừa. */
function shareRoot_(){
  var props = PropertiesService.getScriptProperties();
  if(props.getProperty('PHOTOSHARED')) return;     // '1' = đã chia sẻ, 'x' = đã thử nhưng bị chặn (không thử lại mỗi ảnh)
  var ok = '1';
  try{ folder_().setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); }catch(err){ ok = 'x'; }
  props.setProperty('PHOTOSHARED', ok);
}

function folderName_(name){ return String(name || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 100) || 'Chưa đặt tên'; }
function folderUrl_(f){ return 'https://drive.google.com/drive/folders/' + f.getId(); }
var DRCOL = COLS.indexOf('dr') + 1;
/** Ô \"Album ảnh\": hiện đúng link thư mục và bấm mở được (giá trị vẫn là URL nên app đọc lại bình thường). */
function linkCell_(sh, row, url){
  if(!/^https?:\/\//.test(url || '')) return;
  try{ sh.getRange(row, DRCOL).setRichTextValue(SpreadsheetApp.newRichTextValue().setText(url).setLinkUrl(url).build()); }catch(e){}
}
/** Điền link thư mục ảnh cho các căn đã có thư mục trên Drive mà cột Album ảnh còn trống (không tạo thư mục mới). */
function backfillAlbum_(sh){
  var last = sh.getLastRow();
  if(last < 2) return;
  var root = folder_(), names = sh.getRange(2,3,last-1,1).getValues(), cur = sh.getRange(2,DRCOL,last-1,1).getValues();
  for(var i=0;i<names.length;i++){
    var nm = String(names[i][0] || '').trim();
    if(!nm) continue;
    var have = String(cur[i][0] || '');
    if(/^https?:\/\//.test(have)){ linkCell_(sh, i+2, have); continue; }
    var it = root.getFoldersByName(folderName_(nm));
    if(it.hasNext()){
      var u = folderUrl_(it.next());
      sh.getRange(i+2,DRCOL).setNumberFormat('@').setValue(u);
      linkCell_(sh, i+2, u);
    }
  }
}

function hfKey_(name, root){ return 'hf:' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, name + '|' + root.getId())); }
function folderIdFromUrl_(u){ var m = /folders\/([\w-]+)/.exec(String(u || '')); return m ? m[1] : ''; }

/* ===== Mỗi căn một thư mục riêng, kể cả khi trùng tên =====
   Thư mục được gắn mã căn trong phần Mô tả ("hid:<id>"). Trùng tên thì thư mục sau tự đổi thành "Tên (2)", "Tên (3)"… */
function hidTag_(hid){ return 'hid:' + hid; }
function childOf_(f, root){
  var ps = f.getParents();
  while(ps.hasNext()){ if(ps.next().getId() === root.getId()) return true; }
  return false;
}
/** Tên chưa bị thư mục nào trong root dùng: base, base (2), base (3)… (bỏ qua thư mục skipId). */
function uniqueName_(root, base, skipId){
  for(var n = 1; n < 100; n++){
    var cand = n === 1 ? base : (base + ' (' + n + ')'), taken = false, it = root.getFoldersByName(cand);
    while(it.hasNext()){ var f = it.next(); if(f.isTrashed()) continue; if(skipId && f.getId() === skipId) continue; taken = true; break; }
    if(!taken) return cand;
  }
  return base + ' (' + Date.now() + ')';
}
/** Có căn khác (mã khác) đang dùng đúng tên này không (để nhận thư mục cũ chưa gắn mã). */
function otherHouseHasName_(hid, name){
  var sh = sheet_(), last = sh.getLastRow();
  if(last < 2) return false;
  var ids = sh.getRange(2,1,last-1,1).getValues(), nms = sh.getRange(2,3,last-1,1).getValues();
  for(var i = 0; i < ids.length; i++){
    if(String(ids[i][0]) !== String(hid) && String(nms[i][0] || '').trim() && folderName_(nms[i][0]) === name) return true;
  }
  return false;
}
/** Tìm thư mục cũ theo tên: ưu tiên thư mục đã gắn mã căn này; thư mục chưa gắn mã chỉ nhận khi không có căn nào khác trùng tên. */
function pickOld_(root, oldN, hid, shared){
  var tag = hid ? hidTag_(hid) : '', it = root.getFoldersByName(oldN), legacy = null;
  while(it.hasNext()){
    var f = it.next(), d = f.getDescription() || '';
    if(tag && d === tag) return f;
    if(!d && !legacy) legacy = f;
  }
  return (legacy && !shared) ? legacy : null;
}
/** Thư mục của căn `hid` trong `root`: theo link đã lưu -> theo mã gắn trên thư mục -> tạo mới với tên không trùng. */
function folderFor_(root, name, hid, hint){
  name = folderName_(name);
  if(!hid) return houseFolderIn_(root, name);
  var tag = hidTag_(hid), cache = CacheService.getScriptCache(), key = 'hid2:' + root.getId() + '|' + hid;
  var id = folderIdFromUrl_(hint);
  if(id){
    try{
      var c = DriveApp.getFolderById(id);
      if(!c.isTrashed() && childOf_(c, root)){ if(!c.getDescription()) c.setDescription(tag); return c; }
    }catch(e){}
  }
  id = cache.get(key);
  if(id){ try{ var c1 = DriveApp.getFolderById(id); if(!c1.isTrashed()) return c1; }catch(e){} }
  var lock = LockService.getScriptLock(), got = false;
  try{
    got = lock.tryLock(10000);
    id = cache.get(key);
    if(id){ try{ var c2 = DriveApp.getFolderById(id); if(!c2.isTrashed()) return c2; }catch(e){} }
    var f = null, legacy = null;
    for(var n = 1; n < 30 && !f; n++){
      var cand = n === 1 ? name : name + ' (' + n + ')', it = root.getFoldersByName(cand);
      while(it.hasNext()){
        var x = it.next(), d = x.getDescription() || '';
        if(d === tag){ f = x; break; }
        if(!d && n === 1 && !legacy) legacy = x;
      }
    }
    if(!f && legacy && !otherHouseHasName_(hid, name)){ legacy.setDescription(tag); f = legacy; }
    if(!f){ f = root.createFolder(uniqueName_(root, name)); f.setDescription(tag); }
    cache.put(key, f.getId(), 21600);
    return f;
  }finally{
    if(got){ try{ lock.releaseLock(); }catch(e3){} }
  }
}

/**
 * Căn đổi tên -> đổi tên thư mục ảnh theo. Trả về URL thư mục (hoặc '' nếu không đổi gì).
 * - Thư mục cũ tìm theo link trong cột Album ảnh, không có thì tìm theo tên cũ.
 * - Chưa có thư mục trùng tên mới: đổi tên tại chỗ (ID thư mục và ID ảnh giữ nguyên).
 * - Đã có thư mục tên mới do chính căn này vừa tải ảnh lên (link mới trùng): chuyển ảnh cũ sang đó,
 *   thư mục cũ rỗng thì cho vào thùng rác.
 * - Trùng tên với thư mục của căn khác: không đụng gì để khỏi trộn ảnh hai căn.
 */
function renameHouseFolder_(oldName, newName, oldDr, newDr, hid, shared){
  var root = folder_(), oldN = folderName_(oldName), newN = folderName_(newName);
  if(oldN === newN) return '';
  var old = null, id = folderIdFromUrl_(oldDr);
  if(id){ try{ var c = DriveApp.getFolderById(id); if(!c.isTrashed()) old = c; }catch(e){} }
  if(!old) old = pickOld_(root, oldN, hid, shared);
  if(!old) return '';
  var target = null, ex = root.getFoldersByName(newN);
  while(ex.hasNext()){ var f = ex.next(); if(f.getId() !== old.getId()){ target = f; break; } }
  var out = old, finalN = newN;
  if(!target){
    old.setName(newN);
  }else if(folderIdFromUrl_(newDr) === target.getId()){
    var fl = old.getFiles();
    while(fl.hasNext()) fl.next().moveTo(target);
    if(!old.getFiles().hasNext() && !old.getFolders().hasNext()) old.setTrashed(true);
    out = target;
  }else{
    finalN = uniqueName_(root, newN, old.getId());   // trùng tên với thư mục căn khác -> tự thêm (2), (3)…
    old.setName(finalN);
  }
  if(hid && !(out.getDescription() || '')) out.setDescription(hidTag_(hid));
  var cache = CacheService.getScriptCache();
  cache.remove(hfKey_(oldN, root));
  cache.put(hfKey_(finalN, root), out.getId(), 21600);
  return folderUrl_(out);
}

/** Thư mục riêng của từng căn (tạo nếu chưa có), nằm trong thư mục gốc. */
function houseFolder_(name){ return houseFolderIn_(folder_(), name); }
function houseFolderIn_(root, name){
  name = folderName_(name);
  var cache = CacheService.getScriptCache();
  var key = hfKey_(name, root);
  var id = cache.get(key);
  if(id){ try{ var c = DriveApp.getFolderById(id); if(!c.isTrashed()) return c; }catch(e){} }
  var lock = LockService.getScriptLock(), got = false;
  try{
    got = lock.tryLock(10000);
    id = cache.get(key);               // request khác vừa tạo xong trong lúc mình chờ khóa
    if(id){ try{ var c2 = DriveApp.getFolderById(id); if(!c2.isTrashed()) return c2; }catch(e){} }
    var it = root.getFoldersByName(name);
    var f = it.hasNext() ? it.next() : root.createFolder(name);
    cache.put(key, f.getId(), 21600);
    return f;
  }finally{
    if(got){ try{ lock.releaseLock(); }catch(e2){} }
  }
}

/** Chỉ cho xóa file/thư mục nằm trong 2 thư mục gốc ảnh của app (không đụng file khác trong Drive). */
function rootIds_(){
  var p = PropertiesService.getScriptProperties(), o = {};
  ['PHOTOROOT','VIEWROOT'].forEach(function(k){ var v = p.getProperty(k); if(v) o[v] = 1; });
  return o;
}
function underRoot_(item, roots){
  var cur = item;
  for(var d = 0; d < 5; d++){
    var ps = cur.getParents();
    if(!ps.hasNext()) return false;
    var par = ps.next();
    if(roots[par.getId()]) return true;
    cur = par;
  }
  return false;
}
/** Chuyển ảnh vào thùng rác Drive (khôi phục được trong 30 ngày). */
function trashFiles_(ids){
  var roots = rootIds_(), n = 0;
  (ids || []).forEach(function(id){
    id = String(id || '');
    if(!/^[\w-]{10,}$/.test(id)) return;
    try{ var f = DriveApp.getFileById(id); if(underRoot_(f, roots)){ f.setTrashed(true); n++; } }catch(e){}
  });
  return n;
}
/** Xóa căn -> chuyển thư mục ảnh của căn (Ảnh nhà + Ảnh đi xem, gồm cả Ảnh lỗi, hư hỏng) vào thùng rác.
 *  Bỏ qua thư mục đã gắn mã căn khác, hoặc còn căn khác đang dùng chung (dữ liệu cũ trùng tên). */
function trashHouseFolders_(sh, row){
  var it = rowToItem_(sh.getRange(row,1,1,COLS.length).getValues()[0]);
  var name = folderName_(it.n), last = sh.getLastRow(), tag = hidTag_(it.id);
  var refs = {}, sameName = 0, CKCOL = COLS.indexOf('ck') + 1;
  if(last > 1){
    var nms = sh.getRange(2,3,last-1,1).getValues(), drs = sh.getRange(2,DRCOL,last-1,1).getValues(), cks = sh.getRange(2,CKCOL,last-1,1).getValues();
    for(var i = 0; i < nms.length; i++){
      if(i + 2 === row) continue;
      if(String(nms[i][0] || '').trim() && folderName_(nms[i][0]) === name) sameName++;
      var a = folderIdFromUrl_(drs[i][0]); if(a) refs[a] = 1;
      try{ var o = cks[i][0] ? JSON.parse(cks[i][0]) : null; var b = folderIdFromUrl_(o && o.vu); if(b) refs[b] = 1; }catch(e){}
    }
  }
  var props = PropertiesService.getScriptProperties(), cache = CacheService.getScriptCache();
  [['PHOTOROOT', it.dr], ['VIEWROOT', it.ck && it.ck.vu]].forEach(function(pair){
    var rid = props.getProperty(pair[0]);
    if(!rid) return;
    try{
      var root = DriveApp.getFolderById(rid), f = null, id = folderIdFromUrl_(pair[1]);
      if(id){
        try{ var c = DriveApp.getFolderById(id); if(!c.isTrashed() && childOf_(c, root)) f = c; }catch(e){}
      }
      if(!f) f = pickOld_(root, name, it.id, sameName > 0);
      if(!f) return;
      var d = f.getDescription() || '';
      if(d && d !== tag) return;            // thư mục của căn khác
      if(refs[f.getId()]) return;           // căn khác còn dùng chung thư mục này
      f.setTrashed(true);
      cache.remove(hfKey_(name, root));
      cache.remove('hid2:' + root.getId() + '|' + it.id);
    }catch(e){}
  });
}

/** Thư mục "Ảnh lỗi, hư hỏng" nằm trong thư mục căn của "Ảnh đi xem". */
function damageIn_(par){
  var cache = CacheService.getScriptCache();
  var key = 'df:' + par.getId();
  var id = cache.get(key);
  if(id){ try{ var c = DriveApp.getFolderById(id); if(!c.isTrashed()) return c; }catch(e){} }
  var lock = LockService.getScriptLock(), got = false;
  try{
    got = lock.tryLock(10000);
    id = cache.get(key);
    if(id){ try{ var c2 = DriveApp.getFolderById(id); if(!c2.isTrashed()) return c2; }catch(e){} }
    var it = par.getFoldersByName(DAMAGE_FOLDER_NAME);
    var f = it.hasNext() ? it.next() : par.createFolder(DAMAGE_FOLDER_NAME);
    cache.put(key, f.getId(), 21600);
    return f;
  }finally{
    if(got){ try{ lock.releaseLock(); }catch(e2){} }
  }
}
/** kind: 'view' = ảnh thực tế, 'damage' = ảnh lỗi/hư hỏng (trong thư mục căn của Ảnh đi xem), còn lại = ảnh nhà. hid + hint (link thư mục đã lưu) giúp mỗi căn một thư mục riêng. */
function targetFolder_(kind, name, hid, hint){
  if(kind === 'damage') return damageIn_(folderFor_(viewRoot_(), name, hid, hint));
  if(kind === 'view') return folderFor_(viewRoot_(), name, hid, hint);
  return folderFor_(folder_(), name, hid, hint);
}
/** Căn đổi tên -> đổi tên thư mục căn trong "Ảnh đi xem" (kèm thư mục lỗi/hư hỏng bên trong). Trả về {vu, du} hoặc null. */
function renameViewFolder_(oldName, newName, hintUrl, hid, shared){
  var root = viewRoot_(), oldN = folderName_(oldName), newN = folderName_(newName);
  if(oldN === newN) return null;
  var old = null, id = folderIdFromUrl_(hintUrl);
  if(id){ try{ var c = DriveApp.getFolderById(id); if(!c.isTrashed()) old = c; }catch(e){} }
  if(!old) old = pickOld_(root, oldN, hid, shared);
  if(!old) return null;
  var out = old, finalN = uniqueName_(root, newN, old.getId());   // trùng tên căn khác -> tự thêm (2), (3)…
  old.setName(finalN);
  if(hid && !(out.getDescription() || '')) out.setDescription(hidTag_(hid));
  var cache = CacheService.getScriptCache();
  cache.remove(hfKey_(oldN, root));
  cache.put(hfKey_(finalN, root), out.getId(), 21600);
  var du = '', dit = out.getFoldersByName(DAMAGE_FOLDER_NAME);
  if(dit.hasNext()) du = folderUrl_(dit.next());
  return {vu: folderUrl_(out), du: du};
}

/** Chạy hàm này một lần (và chạy lại mỗi khi muốn dựng lại giao diện bảng). Không xóa dữ liệu. */
function setup(){
  var sh = sheet_();
  format_(sh);
  backfillCf_(sh);
  folder_();
  shareRoot_();
  backfillAlbum_(sh);
  summary_();
}

function format_(sh){
  var n = COLS.length, rows = sh.getMaxRows();
  if(sh.getMaxColumns() < n) sh.insertColumnsAfter(sh.getMaxColumns(), n - sh.getMaxColumns());
  if(rows < 2){ sh.insertRowsAfter(1,100); rows = sh.getMaxRows(); }
  var body = rows - 1;

  sh.getRange(1,1,1,n).setNumberFormat('@').setValues([HEAD]);
  for(var i=0;i<n;i++) sh.getRange(2,i+1,body,1).setNumberFormat(FMT[i]);

  sh.getBandings().forEach(function(x){ x.remove(); });
  var b = sh.getRange(1,1,rows,n).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY,true,false);
  b.setHeaderRowColor(GREEN);
  sh.getRange(1,1,1,n).setBackground(GREEN).setFontColor('#ffffff').setFontWeight('bold')
    .setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
  sh.setRowHeight(1,40);
  sh.setFrozenRows(1);

  sh.getRange(2,1,body,n).setVerticalAlignment('middle').setFontSize(10);
  [6,7,8,9,22,24].forEach(function(c){ sh.getRange(2,c,body,1).setHorizontalAlignment('center'); });
  [4,20,21,25].forEach(function(c){ sh.getRange(2,c,body,1).setWrap(true); });
  sh.getRange(2,27,body,1).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP).setHorizontalAlignment('left');
  sh.getRange(2,16,body,1).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP).setHorizontalAlignment('left');
  WIDTH.forEach(function(w,i){ sh.setColumnWidth(i+1,w); });
  sh.hideColumns(1,2);   // ID, Thêm lúc
  sh.hideColumns(23);    // mã ảnh Drive
  sh.hideColumns(26);    // dữ liệu checklist (JSON)
  sh.setTabColor(GREEN);

  var stRange = sh.getRange(2,6,body,1);
  stRange.setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(ST.map(function(s){return s[1];}),true).setAllowInvalid(true).build());
  sh.getRange(2,22,body,1).setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(['1','2','3','4','5'],true).setAllowInvalid(true).build());
  sh.setConditionalFormatRules(ST.map(function(s){
    return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(s[1])
      .setBackground(s[2]).setFontColor(s[3]).setBold(true).setRanges([stRange]).build();
  }));
}

/** Sheet đặt ngôn ngữ/khu vực dùng dấu ; (vd Việt Nam) thì công thức dấu , bị #ERROR!. Tự dò và đổi. */
function semi_(sh){
  var c = sh.getRange('A1');
  c.setFormula('=IF(TRUE,1,2)');
  SpreadsheetApp.flush();
  var bad = String(c.getDisplayValue()).indexOf('#ERROR') === 0;
  c.clear();
  return bad;
}
function fx_(f, semi){
  if(!semi) return f;
  var o = '', q = false;
  for(var i=0;i<f.length;i++){
    var ch = f.charAt(i);
    if(ch === '"') q = !q;
    o += (!q && ch === ',') ? ';' : ch;
  }
  return o;
}

/** Số căn đã chấm điểm (tối đa 5) để biểu đồ chỉ vẽ đúng số cột có dữ liệu. */
function rankN_(){
  var h = sheet_(), last = h.getLastRow();
  if(last < 2) return 1;
  var n = 0;
  h.getRange(2,22,last-1,1).getValues().forEach(function(r){
    if(r[0] !== '' && r[0] != null && !isNaN(Number(r[0]))) n++;
  });
  return Math.max(1, Math.min(5, n));
}
function rankChart_(){
  var props = PropertiesService.getScriptProperties();
  var n = rankN_();
  if(props.getProperty('RANKN') === String(n)) return;   // số cột biểu đồ không đổi: khỏi cập nhật (nhanh hơn)
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SUMMARY);
  if(!sh) return;
  props.setProperty('RANKN', String(n));
  sh.getCharts().forEach(function(c){
    sh.updateChart(c.modify().clearRanges().addRange(sh.getRange(8,47,n+1,2)).build());
  });
}
function done_(){ try{ rankChart_(); }catch(e){} }

function summary_(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SUMMARY) || ss.insertSheet(SUMMARY);
  var keep = null;   // giữ lại giá trị 5 ô lọc (A19:E19) khi dựng lại bảng
  try{ if(sh.getRange('A21').getValue() === 'Trạng thái') keep = sh.getRange('A19:E19').getValues()[0]; }catch(e){}
  sh.getRange(1,1,sh.getMaxRows(),sh.getMaxColumns()).breakApart();
  sh.clear(); sh.clearConditionalFormatRules();
  sh.getCharts().forEach(function(c){ sh.removeChart(c); });
  if(sh.getMaxColumns() < 80) sh.insertColumnsAfter(sh.getMaxColumns(), 80 - sh.getMaxColumns());
  if(sh.getMaxRows() < 350) sh.insertRowsAfter(sh.getMaxRows(), 350 - sh.getMaxRows());
  sh.getRange(1,1,sh.getMaxRows(),sh.getMaxColumns()).clearDataValidations();
  sh.showColumns(1, sh.getMaxColumns());
  var SEMI = semi_(sh);
  try{ sh.getRange('BC1').setValue(appUrl_()); }catch(e){}
  var F = function(x){ return fx_(x,SEMI); };
  var LINE = '#d5ddd8', SOLID = SpreadsheetApp.BorderStyle.SOLID;
  sh.setHiddenGridlines(true);
  sh.setTabColor('#1d5fa8');
  [120,220,120,110,170,180,110,100,90,105,105,105,300,130,110,130].forEach(function(w,i){ sh.setColumnWidth(i+1,w); });
  sh.getRange('A1:P350').setFontSize(10).setVerticalAlignment('middle');

  function sec_(a1, text){
    sh.getRange(a1).merge().setValue(text).setFontWeight('bold').setFontSize(14).setFontColor(GREEN)
      .setBorder(false,false,true,false,false,false,GREEN,SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  }
  function hdr_(a1, arr){
    sh.getRange(a1).setValues([arr]).setBackground(GREEN).setFontColor('#ffffff').setFontWeight('bold')
      .setFontSize(10).setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
  }
  function card_(lab, val, label, formula, bg, fg){
    var l = sh.getRange(lab), v = sh.getRange(val);
    if(l.getNumColumns() > 1){ l.merge(); v.merge(); }
    l.setValue(label).setBackground(bg || '#e6f0eb').setFontColor(fg || '#4a5d57').setFontSize(10).setFontWeight('bold')
      .setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
    sh.getRange(val.split(':')[0]).setFormula(F(formula));
    v.setBackground(bg || '#f4f9f6').setFontColor(fg || GREEN).setFontSize(22).setFontWeight('bold')
      .setHorizontalAlignment('center').setVerticalAlignment('middle');
    sh.getRange(lab.split(':')[0] + ':' + val.split(':').pop())
      .setBorder(true,true,true,true,null,null,'#ffffff',SpreadsheetApp.BorderStyle.SOLID_THICK);
  }

  // Tiêu đề
  sh.getRange('A1:H1').merge().setValue('🏠  TỔNG HỢP TÌM NHÀ THUÊ 2027')
    .setBackground(GREEN).setFontColor('#ffffff').setFontWeight('bold').setFontSize(20)
    .setVerticalAlignment('middle').setHorizontalAlignment('left');
  sh.setRowHeight(1,58);
  sh.getRange('A2:H2').merge().setValue('Tự động cập nhật từ sheet Houses. Không sửa trực tiếp ở đây.')
    .setFontStyle('italic').setFontColor('#5f6f6a').setFontSize(10);
  sh.setRowHeight(3,10);

  // Thẻ chỉ số
  card_('A4','A5','🏠 Tổng số căn','=COUNTA(Houses!C2:C)','#cfe6dc',GREEN);
  [['B4','B5'],['C4:D4','C5:D5'],['E4:F4','E5:F5'],['G4','G5'],['H4','H5']].forEach(function(p,i){
    var st = ST[i];
    card_(p[0], p[1], ['🆕 ','📞 ','👀 ','✅ ','🚫 '][i] + st[1], '=COUNTIF(Houses!F2:F,"' + st[1] + '")', st[2], st[3]);
  });
  sh.setRowHeight(4,30); sh.setRowHeight(5,54); sh.setRowHeight(6,14);

  // Top 5 (giống tab Tổng hợp trong app): hạng | căn (tên + khu vực · giá) | điểm, biểu đồ cột bên cạnh
  // Dữ liệu thô nằm ở cột ẩn AU:AX (tên, điểm, khu vực, giá)
  sec_('A7:C7','🏆 Top 5 căn điểm cao nhất');
  sh.setRowHeight(7,30); sh.setRowHeight(8,28);
  hdr_('A8:C8',['Hạng','Căn','Điểm']);
  sh.getRange('AU8:AX8').setValues([['Căn','Điểm','Khu vực','Giá']]);
  sh.getRange('AU9').setFormula(F('=IF(COUNT(Houses!V2:V)=0,"",IFERROR(QUERY(Houses!A2:Z,"select C, V, E, G where C is not null order by V desc limit 5",0),""))'));
  var MEDAL = ['🥇','🥈','🥉','#4','#5'];
  for(var i=0;i<5;i++){
    var r = 9 + i;
    var core = 'IF(AU'+r+'="","",AU'+r+'&CHAR(10)&IF(AW'+r+'="","—",AW'+r+')&IF(AX'+r+'="",""," · "&AX'+r+'&" triệu"))';
    sh.getRange(r,1).setFormula(F('=IF(AU'+r+'="","","'+MEDAL[i]+'")'));
    sh.getRange(r,2).setFormula(F(i === 0 ? '=IF(COUNT(Houses!V2:V)=0,"Chưa có căn nào được chấm điểm",'+core+')' : '='+core));
    sh.getRange(r,3).setFormula(F('=IF(AU'+r+'="","",IF(AV'+r+'="","–",AV'+r+'))'));
  }
  sh.setRowHeights(9,5,44);
  sh.getRange('A9:A13').setHorizontalAlignment('center').setFontSize(16);
  sh.getRange('B9:B13').setFontWeight('bold').setFontSize(11).setWrap(true);
  sh.getRange('C9:C13').setNumberFormat('0').setHorizontalAlignment('center').setFontWeight('bold').setFontSize(18).setFontColor(GREEN);
  sh.getRange('A8:C13').setBorder(null,null,true,null,null,true,LINE,SOLID);
  var chart = sh.newChart().setChartType(Charts.ChartType.COLUMN)
    .addRange(sh.getRange(8,47,rankN_()+1,2)).setNumHeaders(1)
    .setPosition(7,4,12,0)
    .setOption('title','Điểm top 5 căn (cao → thấp)')
    .setOption('legend',{position:'none'})
    .setOption('colors',[GREEN])
    .setOption('vAxis',{viewWindow:{min:0,max:5},gridlines:{count:6}})
    .setOption('width',540).setOption('height',240)
    .build();
  sh.insertChart(chart);
  PropertiesService.getScriptProperties().setProperty('RANKN', String(rankN_()));
  sh.getRange('A14').setValue('Biểu đồ chỉ vẽ các căn đã chấm điểm (1–5). Căn chưa chấm vẫn có trong bảng.')
    .setFontStyle('italic').setFontColor('#5f6f6a').setFontSize(9);

  // ===== Chi tiết các căn theo trạng thái (gần chốt → mới tìm) + bộ lọc Trạng thái / Khu vực / Loại ngày / Từ–Đến ngày =====
  // Ô lọc A19:E19 (ô vàng) là chỗ duy nhất được sửa tay. Công thức lọc + sắp xếp nằm ở các cột ẩn T:CB.
  var STORDER = ['won','seen','contact','new','out'];
  var STICON = {won:'✅ ', seen:'👀 ', contact:'📞 ', 'new':'🆕 ', out:'🚫 '};
  var SEC = 17, CT = 19, CNT = 20, HD = 21, R0 = 22, R1 = R0 + 299, B2 = 55;   // B2 = cột đứng trước khối kết quả (khối kết quả bắt đầu ở BD)
  function R_(c){ return c + R0 + ':' + c + R1; }
  function cl_(n){ var s = ''; while(n > 0){ var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }
  function b2_(k){ return R_(cl_(B2 + k)); }   // cột thứ k của khối kết quả (đã lọc + sắp xếp)
  function nest_(ref, pick, last){
    var o = last;
    for(var i = STORDER.length - 1; i >= 0; i--) o = 'IF(' + ref + '="' + stLabel_(STORDER[i]) + '",' + pick(STORDER[i], i) + ',' + o + ')';
    return o;
  }

  sec_('A'+SEC+':P'+SEC,'📋 Chi tiết các căn theo trạng thái (gần chốt → mới tìm; trong mỗi nhóm xếp theo khu vực, điểm cao trước)');
  sh.setRowHeight(SEC,30); sh.setRowHeight(18,22); sh.setRowHeight(CT,32); sh.setRowHeight(CNT,24); sh.setRowHeight(HD,40);

  // Bộ lọc (giữ lại giá trị đang chọn mỗi lần dựng lại bảng)
  var stList = ['Tất cả'].concat(STORDER.map(stLabel_)), tyList = ['Ngày thêm','Ngày liên hệ','Ngày hẹn xem'];
  var ctl = ['Tất cả','Tất cả','Ngày thêm','',''];
  if(keep){
    if(stList.indexOf(keep[0]) >= 0) ctl[0] = keep[0];
    if(keep[1] !== '' && keep[1] != null) ctl[1] = keep[1];
    if(tyList.indexOf(keep[2]) >= 0) ctl[2] = keep[2];
    ctl[3] = keep[3]; ctl[4] = keep[4];
  }
  sh.getRange('A18:E18').setValues([['Trạng thái','Khu vực','Loại ngày','Từ ngày','Đến ngày']])
    .setFontWeight('bold').setFontSize(9).setFontColor('#5f6f6a').setHorizontalAlignment('center').setVerticalAlignment('bottom');
  sh.getRange('A19:E19').setValues([ctl]).setBackground('#fff4c2').setFontWeight('bold').setFontSize(11)
    .setHorizontalAlignment('center').setVerticalAlignment('middle').setBorder(true,true,true,true,true,true,'#d9b400',SOLID);
  sh.getRange('D19:E19').setNumberFormat('dd/mm/yyyy');
  sh.getRange('F19:P19').merge().setValue('←  Chọn bộ lọc ở các ô vàng (chỉ các ô này sửa được). Từ ngày / Đến ngày để trống = không giới hạn.')
    .setFontStyle('italic').setFontColor('#5f6f6a').setFontSize(9).setVerticalAlignment('middle');
  // Danh sách khu vực cho ô lọc (cột ẩn AZ)
  sh.getRange('AZ1').setFormula(F('=IFERROR({"Tất cả";"(chưa có khu vực)";SORT(UNIQUE(FILTER(Houses!E2:E,Houses!E2:E<>"")))},{"Tất cả";"(chưa có khu vực)"})'));
  sh.getRange('A19').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(stList, true).setAllowInvalid(false).build());
  sh.getRange('B19').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(sh.getRange('AZ1:AZ100'), true).setAllowInvalid(true).build());
  sh.getRange('C19').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(tyList, true).setAllowInvalid(false).build());
  sh.getRange('D19:E19').setDataValidation(SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(false).build());

  // Bước 1 (cột ẩn T:AS): lấy toàn bộ căn từ Houses, thêm cột tính: thứ tự trạng thái, các ngày, cờ "khớp bộ lọc"
  var kv = R_('T'), ten = R_('U'), tt = R_('AB'), hen = R_('AF'), tms = R_('AM'), lhr = R_('AN'), passR = R_('AS');
  var dsel = 'IF($C$19="Ngày liên hệ",' + R_('AQ') + ',IF($C$19="Ngày hẹn xem",' + R_('AR') + ',' + R_('AP') + '))';
  sh.getRange('T'+HD+':AS'+HD).setValues([['khuvuc','ten','diachi','link','sdt_sale','sale','chu','sdt_chu','trangthai','gia','dt','coc','hen','uu','nhuoc','checklist','diem','album','id','themluc','lienhe','thutu','ngaythem','ngaylienhe','ngayhen','loc']]);
  sh.getRange('T'+R0).setFormula(F('=IFERROR(QUERY(Houses!A2:AA,"select E, C, D, S, N, M, L, K, F, G, H, I, Q, T, U, X, V, P, A, B, R where C is not null",0),"")'));
  sh.getRange('AO'+R0).setFormula(F('=ARRAYFORMULA(IF('+ten+'="","",'+nest_(tt, function(c,i){ return i + 1; }, 4)+'))'));
  sh.getRange('AP'+R0).setFormula(F('=ARRAYFORMULA(IF('+ten+'="","",IF('+tms+'="","",INT('+tms+'/86400000+25569+7/24))))'));
  sh.getRange('AQ'+R0).setFormula(F('=ARRAYFORMULA(IF('+ten+'="","",IFERROR(DATEVALUE('+lhr+'),IF(ISNUMBER('+lhr+'),'+lhr+',""))))'));
  sh.getRange('AR'+R0).setFormula(F('=ARRAYFORMULA(IF('+ten+'="","",IFERROR(DATEVALUE('+hen+'),IF(ISNUMBER('+hen+'),'+hen+',""))))'));
  sh.getRange('AS'+R0).setFormula(F('=ARRAYFORMULA(IF('+ten+'="","",'
    + 'IF(OR($B$19="Tất cả",$B$19=""),1,IF($B$19="(chưa có khu vực)",IF('+kv+'="",1,0),IF('+kv+'=$B$19,1,0)))'
    + '*IF(OR($A$19="Tất cả",$A$19=""),1,IF('+tt+'=$A$19,1,0))'
    + '*IF(AND($D$19="",$E$19=""),1,IF('+dsel+'="",0,IF($D$19="",1,IF('+dsel+'>=$D$19,1,0))*IF($E$19="",1,IF('+dsel+'<=$E$19,1,0))))'
    + '))'));

  // Bước 2 (cột ẩn BD:CB): lọc rồi sắp xếp: trạng thái (chốt → loại) → khu vực → điểm cao trước
  sh.getRange(cl_(B2+1)+HD+':'+cl_(B2+25)+HD).setValues([['khuvuc','ten','diachi','link','sdt_sale','sale','chu','sdt_chu','trangthai','gia','dt','coc','hen','uu','nhuoc','checklist','diem','album','id','themluc','lienhe','thutu','ngaythem','ngaylienhe','ngayhen']]);
  sh.getRange(cl_(B2+1)+R0).setFormula(F('=IFERROR(SORT(FILTER(T'+R0+':AR'+R1+',AS'+R0+':AS'+R1+'=1),22,TRUE,1,TRUE,17,FALSE),"")'));

  // Bước 3 (cột hiển thị A:P): đọc từ khối kết quả
  var kv2 = b2_(1), t2 = b2_(2), dc2 = b2_(3), lk2 = b2_(4), sdts2 = b2_(5), sale2 = b2_(6), chu2 = b2_(7), sdtc2 = b2_(8), tt2 = b2_(9),
      gia2 = b2_(10), dt2 = b2_(11), coc2 = b2_(12), uu2 = b2_(14), nh2 = b2_(15), ck2 = b2_(16), diem2 = b2_(17), al2 = b2_(18), hid2 = b2_(19),
      ord2 = b2_(22), dAdd2 = b2_(23), dLh2 = b2_(24), dHen2 = b2_(25);
  var ordCol = cl_(B2 + 22), prevOrd = ordCol + (R0 - 1) + ':' + ordCol + (R1 - 1);
  function dash_(rng){ return '=ARRAYFORMULA(IF('+t2+'="","",IF('+rng+'="","–",'+rng+')))'; }
  function contact_(nm, ph){
    return '=ARRAYFORMULA(IF('+t2+'="","",IF(('+nm+'="")*('+ph+'=""),"–",TRIM('+nm+'&IF(('+nm+'<>"")*('+ph+'<>"")," · ","")&'+ph+'))))';
  }
  function link_(u, label){ return '=ARRAYFORMULA(IF('+t2+'="","",IF('+u+'="","–",HYPERLINK('+u+',"'+label+'"))))'; }
  // Checklist: hiện x/y đạt; bấm vào mở trang bảng checklist theo form của căn đó (do Web app dựng). BC1 = link Web app.
  var ckLink = '=ARRAYFORMULA(IF('+t2+'="","",IF('+ck2+'="","–",IF($BC$1="",'+ck2+',HYPERLINK($BC$1&"?view=ck&id="&'+hid2+'&"&key='+encodeURIComponent(VIEW_KEY)+'",'+ck2+')))))';

  hdr_('A'+HD+':P'+HD,['Trạng thái','Tên · địa chỉ','Khu vực','Link tin','Sale / môi giới','Chủ nhà','Giá (triệu/tháng)','Diện tích (m²)','Cọc (triệu)','Ngày thêm','Ngày liên hệ','Ngày hẹn xem','Ưu điểm / nhược điểm','Checklist (bấm để xem)','Điểm','Album ảnh']);
  sh.getRange('A'+CNT).setFormula(F('="Đang hiển thị "&COUNTIF('+passR+',1)&" / "&COUNTIF('+passR+',">=0")&" căn"'));
  sh.getRange('A'+CNT+':P'+CNT).merge().setFontWeight('bold').setFontColor(GREEN).setFontSize(10).setHorizontalAlignment('left').setVerticalAlignment('middle');

  var f = {
    A: '=ARRAYFORMULA(IF('+t2+'="","",IF((ROW('+t2+')>'+R0+')*('+ord2+'='+prevOrd+'),"",'
       + nest_(tt2, function(c){ return '"' + STICON[c] + '"'; }, '""') + '&'+tt2+'&CHAR(10)&"("&COUNTIF('+ord2+','+ord2+')&" căn)")))',
    B: '=ARRAYFORMULA(IF('+t2+'="","",'+t2+'&IF('+dc2+'="","",CHAR(10)&'+dc2+')))',
    C: '=ARRAYFORMULA(IF('+t2+'="","",IF('+kv2+'="","(chưa có khu vực)",'+kv2+')))',
    D: link_(lk2,'🔗 Mở tin'),
    E: contact_(sale2,sdts2),
    F: contact_(chu2,sdtc2),
    G: dash_(gia2),
    H: dash_(dt2),
    I: dash_(coc2),
    J: dash_(dAdd2),
    K: dash_(dLh2),
    L: dash_(dHen2),
    M: '=ARRAYFORMULA(IF('+t2+'="","",TRIM(IF('+uu2+'="","","＋ "&'+uu2+')&IF(('+uu2+'<>"")*('+nh2+'<>""),CHAR(10),"")&IF('+nh2+'="","","－ "&'+nh2+'))))',
    N: ckLink,
    O: '=ARRAYFORMULA(IF('+t2+'="","",IF('+diem2+'="","chưa chấm",REPT("★",'+diem2+')&REPT("☆",5-'+diem2+'))))',
    P: link_(al2,'📁 Mở album')
  };
  for(var col in f) sh.getRange(col + R0).setFormula(F(f[col]));

  sh.getRange('A'+R0+':P'+R1).setVerticalAlignment('middle').setFontSize(10);
  sh.getRange('A'+R0+':A'+R1).setFontWeight('bold').setHorizontalAlignment('center').setWrap(true);
  sh.getRange('B'+R0+':B'+R1).setFontWeight('bold').setWrap(true);
  sh.getRange('C'+R0+':C'+R1).setFontWeight('bold').setFontColor(GREEN).setWrap(true);
  ['E','F','M'].forEach(function(c){ sh.getRange(c+R0+':'+c+R1).setWrap(true); });
  ['D','G','H','I','J','K','L','N','O','P'].forEach(function(c){ sh.getRange(c+R0+':'+c+R1).setHorizontalAlignment('center'); });
  sh.getRange('G'+R0+':G'+R1).setNumberFormat('0.0');
  sh.getRange('H'+R0+':H'+R1).setNumberFormat('0');
  sh.getRange('I'+R0+':I'+R1).setNumberFormat('0.0');
  sh.getRange('J'+R0+':L'+R1).setNumberFormat('dd/mm/yyyy');
  sh.getRange('N'+R0+':N'+R1).setFontWeight('bold');
  sh.getRange('O'+R0+':O'+R1).setFontColor('#d99a00').setFontSize(12);

  // Màu theo trạng thái (cột A, theo nhóm) + dải màu xen kẽ các cột còn lại
  var rules = ST.map(function(s){
    return SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(F('=$' + ordCol + R0 + '=' + (STORDER.indexOf(s[0]) + 1)))
      .setBackground(s[2]).setFontColor(s[3]).setBold(true).setRanges([sh.getRange('A'+R0+':A'+R1)]).build();
  });
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(F('=AND($B'+R0+'<>"",ISEVEN(ROW()))')).setBackground('#f4f8f6')
    .setRanges([sh.getRange('B'+R0+':P'+R1)]).build());
  sh.setConditionalFormatRules(rules);

  sh.hideColumns(20,61);   // cột kỹ thuật T:CB
  ss.setActiveSheet(sh); ss.moveActiveSheet(1);
  try{ lock_(sh); }catch(e){}
}

/** Khóa tab Tổng hợp: chỉ chủ sheet (và tài khoản chạy script) sửa được, người khác chỉ xem. */
function lock_(sh){
  sh.getProtections(SpreadsheetApp.ProtectionType.SHEET).forEach(function(p){ p.remove(); });
  var p = sh.protect().setDescription('Tab tổng hợp chỉ xem (tự động cập nhật từ sheet Houses)');
  var me = '';
  try{ me = Session.getEffectiveUser().getEmail(); }catch(e){}
  try{ p.setUnprotectedRanges([sh.getRange('A19:E19')]); }catch(e){}   // cho người có quyền sửa dùng ô lọc
  try{
    p.removeEditors(p.getEditors().filter(function(u){ return !me || u.getEmail() !== me; }));
  }catch(e){}
  try{ if(p.canDomainEdit()) p.setDomainEdit(false); }catch(e){}
}

function rowToItem_(r){
  var o = {};
  COLS.forEach(function(c,i){
    var v = r[i];
    if(c === 'im'){ try{ o.im = v ? JSON.parse(v) : []; }catch(e){ o.im = []; } }
    else if(c === 'cp' || c === 'cn' || c === 'cf'){ return; }
    else if(c === 'ck'){ try{ o.ck = v ? JSON.parse(v) : null; }catch(e){ o.ck = null; } }
    else if(c === 'st'){ o.st = stCode_(String(v)); }
    else if(NUM[c]){ var x = (v === '' || v == null) ? NaN : Number(v); o[c] = isNaN(x) ? null : x; }
    else o[c] = v == null ? '' : String(v);
  });
  return o;
}
function cpText_(ck){
  if(!ck || !ck.c) return '';
  var d = 0, b = 0;
  for(var k in ck.c){ if(ck.c[k] === 1) d++; else if(ck.c[k] === 2) b++; }
  if(!d && !b) return '';
  return d + '/' + (ck.tot || '?') + (b ? ' · ' + b + ' lỗi' : '');
}
function itemToRow_(it){
  return COLS.map(function(c){
    if(c === 'im') return JSON.stringify(it.im || []);
    if(c === 'cf') return ckForm_(it.ck);
    if(c === 'cp') return cpText_(it.ck);
    if(c === 'cn') return (it.ck && it.ck.nt) ? String(it.ck.nt) : '';
    if(c === 'ck') return it.ck ? JSON.stringify(it.ck) : '';
    if(c === 'st') return stLabel_(it.st);
    if(NUM[c]){ var x = it[c]; return (x == null || x === '' || isNaN(Number(x))) ? '' : Number(x); }
    return it[c] == null ? '' : String(it[c]);
  });
}
function findRow_(sh, id){
  var n = sh.getLastRow() - 1;
  if(n < 1) return -1;
  var ids = sh.getRange(2,1,n,1).getValues();
  for(var i=0;i<ids.length;i++) if(String(ids[i][0]) === String(id)) return i + 2;
  return -1;
}
function saveMany_(sh, items){
  var seen = {}, list = [];
  (items || []).forEach(function(it){ if(it && it.id && it.n){ seen[String(it.id)] = it; } });
  for(var k in seen) list.push(seen[k]);
  if(!list.length) return;
  var last = sh.getLastRow(), map = {}, oldN = {}, oldD = {}, cnt = {}, add = [];
  if(last > 1){
    var ids = sh.getRange(2,1,last-1,1).getValues(), nms = sh.getRange(2,3,last-1,1).getValues(), drs = sh.getRange(2,DRCOL,last-1,1).getValues();
    ids.forEach(function(r,i){ var k = String(r[0]); map[k] = i + 2; oldN[k] = String(nms[i][0] || ''); oldD[k] = String(drs[i][0] || ''); var fk = folderName_(nms[i][0]); if(String(nms[i][0] || '').trim()) cnt[fk] = (cnt[fk] || 0) + 1; });
  }
  var links = [];
  list.forEach(function(it){
    var row = map[String(it.id)];
    if(row){
      var on = oldN[String(it.id)];
      if(on && folderName_(on) !== folderName_(it.n)){
        try{ var nu = renameHouseFolder_(on, it.n, oldD[String(it.id)] || it.dr, it.dr, it.id, (cnt[folderName_(on)] || 0) > 1); if(nu) it.dr = nu; }catch(e){}
        try{ var rv = renameViewFolder_(on, it.n, it.ck && it.ck.vu, it.id, (cnt[folderName_(on)] || 0) > 1); if(rv){ it.ck = it.ck || {}; it.ck.vu = rv.vu; if(rv.du) it.ck.du = rv.du; } }catch(e){}
      }
      sh.getRange(row,1,1,COLS.length).setNumberFormats([FMT]).setValues([itemToRow_(it)]); links.push([row, it.dr]); }
    else add.push(it);
  });
  if(add.length){
    var start = Math.max(last,1) + 1, need = start + add.length - 1;
    if(need > sh.getMaxRows()) sh.insertRowsAfter(sh.getMaxRows(), need - sh.getMaxRows() + 100);
    sh.getRange(start,1,add.length,COLS.length)
      .setNumberFormats(add.map(function(){ return FMT; }))
      .setValues(add.map(itemToRow_));
    add.forEach(function(it,i){ links.push([start + i, it.dr]); });
  }
  links.forEach(function(l){ linkCell_(sh, l[0], l[1]); });
}
function save_(sh, it){ saveMany_(sh, [it]); }

/** Link Web app (…/exec) để ô Checklist ở tab Tổng hợp mở trang bảng theo form. Ưu tiên WEBAPP_URL nếu bạn tự dán. */
var WEBAPP_URL = '';
function appUrl_(){
  var p = PropertiesService.getScriptProperties(), u = WEBAPP_URL || p.getProperty('APPURL') || '';
  if(!u){ try{ u = ScriptApp.getService().getUrl() || ''; }catch(e){} }
  return u;
}
/** Mỗi lần app gọi doGet (chạy trong bản deploy): nhớ link /exec thật và cập nhật ô BC1 nếu đổi. */
function syncUrl_(){
  try{
    var u = ScriptApp.getService().getUrl() || '', p = PropertiesService.getScriptProperties();
    if(!WEBAPP_URL && u.indexOf('/exec') > 0 && p.getProperty('APPURL') !== u){
      p.setProperty('APPURL', u);
      var s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SUMMARY);
      if(s) s.getRange('BC1').setValue(u);
    }
  }catch(e){}
}
function hesc_(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
/** Trang bảng checklist theo form của một căn (mở từ ô Checklist ở tab Tổng hợp). */
function ckHtml_(it){
  var ck = it.ck || {}, c = ck.c || {}, v = ck.v || {}, good = 0, bad = 0, total = 0, body = '';
  CK.forEach(function(s){
    var rows = '', d = 0, n = (s.i || []).length;
    function flds(){
      (s.f || []).forEach(function(f){
        var val = v[f[0]];
        if(Array.isArray(val)) val = val.join(', ');
        if(val != null && String(val).trim() !== '') rows += '<tr class="f"><td>' + hesc_(f[1]) + '</td><td>' + hesc_(val) + '</td></tr>';
      });
    }
    function items(){
      (s.i || []).forEach(function(x){
        var st = c[x[0]] || 0; total++;
        if(st === 1){ d++; good++; } else if(st === 2){ bad++; }
        rows += '<tr><td>' + hesc_(x[1]) + '</td><td class="' + (st === 1 ? 'ok' : st === 2 ? 'bad' : 'no') + '">' + (st === 1 ? '✓ Đạt' : st === 2 ? '✕ Lỗi' : '☐ Chưa kiểm') + '</td></tr>';
      });
    }
    if(s.fp) flds();
    items();
    if(!s.fp) flds();
    body += '<h3>' + hesc_(s.t) + ' <span>(' + d + '/' + n + ')</span></h3><table>' + rows + '</table>';
  });
  var note = ck.nt && String(ck.nt).trim() ? '<h3>📝 Ghi chú &amp; hư hỏng</h3><p class="nt">' + hesc_(String(ck.nt).trim()).replace(/\n/g,'<br>') + '</p>' : '';
  var ph = (ck.im || []).map(function(id){
    id = String(id).replace(/[^\w-]/g,'');
    return '<a href="https://drive.google.com/file/d/' + id + '/view" target="_blank"><img src="https://lh3.googleusercontent.com/d/' + id + '=w300"></a>';
  }).join('');
  return '<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>'
    + 'body{font:14px/1.45 system-ui,Arial,sans-serif;margin:0;background:#f4f8f6;color:#1d2b27}'
    + 'header{background:' + GREEN + ';color:#fff;padding:14px 16px}header h1{margin:0;font-size:18px}header p{margin:4px 0 0;opacity:.9}'
    + 'main{padding:12px 16px 28px;max-width:760px;margin:auto}h3{margin:18px 0 6px;color:' + GREEN + ';font-size:15px}h3 span{color:#5f6f6a;font-weight:400}'
    + 'table{width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden}td{padding:7px 10px;border-bottom:1px solid #e3ebe7;vertical-align:top}'
    + 'td:last-child{white-space:nowrap;text-align:right}tr.f td{background:#eef6f2}.ok{color:#0f6b57;font-weight:700}.bad{color:#c0392b;font-weight:700}.no{color:#8a9691}'
    + '.nt{background:#fff;padding:10px;border-radius:8px}.ph img{height:90px;margin:4px 6px 0 0;border-radius:6px}'
    + '</style></head><body><header><h1>' + hesc_(it.n) + '</h1><p>' + hesc_([it.a, it.d].filter(Boolean).join(', ')) + '</p>'
    + '<p>Checklist: <b>' + good + '/' + total + ' đạt</b>' + (bad ? ' · ' + bad + ' lỗi' : '') + '</p></header><main>'
    + body + note + (ph ? '<h3>Ảnh hư hỏng</h3><div class="ph">' + ph + '</div>' : '') + '</main></body></html>';
}

function doGet(e){
  var r = role_(e.parameter.key);
  if(e.parameter.view === 'ck'){
    if(!r) return HtmlService.createHtmlOutput('<p style="font:16px sans-serif;padding:20px">Sai mã truy cập.</p>');
    var sh0 = sheet_(), row0 = findRow_(sh0, e.parameter.id);
    if(row0 < 0) return HtmlService.createHtmlOutput('<p style="font:16px sans-serif;padding:20px">Không tìm thấy căn này.</p>');
    var it0 = rowToItem_(sh0.getRange(row0, 1, 1, COLS.length).getValues()[0]);
    return HtmlService.createHtmlOutput(ckHtml_(it0)).setTitle('Checklist · ' + it0.n)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
  if(!r) return out_({ok:false,error:'Sai mã truy cập.'});
  syncUrl_();
  var sh = sheet_(), n = sh.getLastRow() - 1, items = [];
  if(n > 0) items = sh.getRange(2,1,n,COLS.length).getValues().map(rowToItem_).filter(function(x){return x.id;});
  return out_({ok:true,role:r,items:items});
}

function doPost(e){
  var lock = null, locked = false;
  try{
    var b = JSON.parse(e.postData.contents);
    if(role_(b.key) !== 'edit') return out_({ok:false,error:'Bạn không có quyền sửa.'});

    // Tải ảnh lên Drive: không đụng tới Sheet, không khóa (để nhiều ảnh tải song song).
    // Chỉ khi client gửi lại (retry) mới dò trùng tên để không tạo file đôi.
    if(b.action === 'upload'){
      var blob = Utilities.newBlob(Utilities.base64Decode(b.data), b.mime || 'image/jpeg', b.name || 'anh.jpg');
      var fol = targetFolder_(b.kind, b.folder, b.hid, b.fid), fid = '';
      if(b.retry && b.name){ var ex = fol.getFilesByName(b.name); if(ex.hasNext()) fid = ex.next().getId(); }
      if(!fid) fid = fol.createFile(blob).getId();
      if(b.kind === 'view' || b.kind === 'damage') shareViewRoot_(); else shareRoot_();
      return out_({ok:true,id:fid,url:folderUrl_(fol)});
    }
    if(b.action === 'trash'){ return out_({ok:true,n:trashFiles_(b.ids)}); }
    if(b.action === 'find'){
      var fol2 = targetFolder_(b.kind, b.folder, b.hid, b.fid), f2 = fol2.getFilesByName(b.name || '');
      return out_({ok:true,id:f2.hasNext() ? f2.next().getId() : '',url:folderUrl_(fol2)});
    }

    // Ghi Sheet: tryLock không ném lỗi, hết giờ thì trả thông báo dễ hiểu
    lock = LockService.getScriptLock();
    locked = lock.tryLock(30000);
    if(!locked) return out_({ok:false,error:'Máy chủ đang bận, bấm lưu lại sau vài giây.'});

    var sh = sheet_();
    if(b.action === 'save'){ saveMany_(sh, [b.item]); done_(); return out_({ok:true}); }
    if(b.action === 'saveMany'){ saveMany_(sh, b.items); done_(); return out_({ok:true}); }
    if(b.action === 'delete'){ var row = findRow_(sh, b.id); if(row > 0){ try{ trashHouseFolders_(sh, row); }catch(e){} sh.deleteRow(row); } done_(); return out_({ok:true}); }
    return out_({ok:false,error:'Hành động không hợp lệ.'});
  }catch(err){
    return out_({ok:false,error:String(err)});
  }finally{
    if(locked){ try{ lock.releaseLock(); }catch(e2){} }
  }
}
