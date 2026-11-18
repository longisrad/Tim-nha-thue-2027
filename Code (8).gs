/**
 * Backend app "Tìm nhà thuê": dữ liệu -> Google Sheets, ảnh -> Google Drive.
 * ĐỔI HAI MÃ DƯỚI ĐÂY. Sau khi dán code mới: chạy lại hàm setup() một lần,
 * rồi Deploy > Manage deployments > Edit > New version.
 * Bản này dùng cache cho danh sách + checklist (xem khối "Cache danh sách + checklist"), cần dùng cùng index.html mới.
 */
// LƯU Ý BẢO MẬT: hai mã phải KHÁC NHAU. Nếu trùng, người chỉ có mã xem cũng sửa/xóa được dữ liệu.
// Mã xem còn nằm trong link ô Checklist ở tab Tổng hợp, nên chỉ chia sẻ mã xem, không chia sẻ mã sửa.
var EDIT_KEY = '17071993@';   // xem + sửa + tải ảnh
var VIEW_KEY = '17071993@';   // chỉ xem (nên đổi khác EDIT_KEY)

var SHEET = 'Houses';
var SUMMARY = 'Tổng hợp';
var SUM_FR = 40;   // hàng chứa 6 ô lọc (ô vàng) ở tab Tổng hợp; các hàng chi tiết tính từ đây
// Ảnh lưu theo cấu trúc: [thư mục chứa file Sheet này] / Ảnh nhà / [tên từng căn] / ảnh
var PHOTO_FOLDER_NAME = 'Ảnh nhà';
var VIEW_FOLDER_NAME = 'Ảnh đi xem';          // cùng cấp với 'Ảnh nhà'; bên trong mỗi căn một thư mục theo tên căn
var DAMAGE_FOLDER_NAME = 'Ảnh lỗi, hư hỏng';   // nằm trong thư mục căn của 'Ảnh đi xem'
var PARENT_FOLDER_ID = '';   // để trống = tự dùng thư mục đang chứa file Sheet. Muốn đặt chỗ khác thì dán ID thư mục vào đây.
var GREEN = '#0f6b57';

var COLS = ['id','t','n','a','d','st','p','ar','dp','u','ph','on','sn','sp','mp','dr','vd','lh','lk','pr','co','rt','im','cp','cn','ck','cf','fv','w','sv'];
var HEAD = ['ID','Thêm lúc','Tên / mã','Địa chỉ','Khu vực','Trạng thái','Giá (triệu/tháng)','Diện tích (m²)','Cọc (triệu)','Điện / nước','SĐT chủ nhà','Tên chủ nhà','Tên sale / môi giới','SĐT sale','Link bản đồ','Album ảnh','Ngày hẹn xem','Ngày liên hệ','Tin đăng','Ưu điểm','Nhược điểm','Điểm (1–5)','Ảnh (mã Drive)','Checklist (đạt / tổng)','Ghi chú & hư hỏng khi xem','Checklist (dữ liệu)','Checklist (theo form)','Yêu thích (1 = có)','Phường','Phí dịch vụ'];
var WIDTH = [60,90,220,220,120,110,110,100,90,110,115,130,140,115,160,160,115,115,160,240,240,80,160,120,240,160,210,90,130,120];
var NUM = {t:1,p:1,ar:1,dp:1,rt:1,fv:1};
var IX = {}; COLS.forEach(function(c,i){ IX[c] = i; });   // tên cột -> chỉ số (0-based) trong mảng dòng
var DRCOL = IX.dr + 1, CKCOL = IX.ck + 1;                  // số cột (1-based) của Album ảnh và dữ liệu checklist
var FMT = COLS.map(function(c){ return (c==='p'||c==='dp') ? '#,##0.0' : (c==='ar'||c==='rt'||c==='t'||c==='fv') ? '0' : '@'; });

// Form checklist (khớp với tab Checklist trong app). CK_FULL = true: liệt kê cả mục chưa kiểm (☐).
var CK_FULL = false;
var CF_FMT = '@';   // ô checklist: CLIP => chỉ hiện dòng đầu (VD: CHECKLIST: 8/31 đạt · 3 lỗi), bấm vào ô mới thấy nguyên nội dung
var PARTS={1:{h:"💬 PHẦN 1 · HỎI KHI TRAO ĐỔI",d:"Hỏi qua Zalo / điện thoại trước khi đi xem. Chạm ✓ nếu câu trả lời ổn, ✕ nếu không ổn."},2:{h:"👀 PHẦN 2 · ĐI THỰC TẾ",d:"Phải tận mắt nhìn, tự thử, tự nghe. Chạm ✓ nếu đạt, ✕ nếu có lỗi."}};
var CK=[
 /* ===== PHẦN 1: HỎI KHI TRAO ĐỔI ===== */
 {p:1,t:"Điện – Nước – Điều hòa",f:[["elec","Điện tính theo giá nhà nước hay giá chủ nhà?","s",["Nhà nước","Giá chủ nhà"]]],i:[["f1","Điện có đồng hồ riêng không?"]]},
 {p:1,t:"Internet & sóng",f:[["isp","Nhà mạng đang dùng là gì?","s",["VNPT","Viettel","FPT","Khác"]]],i:[["g1","Có sẵn internet không?"]]},
 {p:1,t:"Lầu & an toàn thoát hiểm",fp:1,f:[["floor","Căn ở lầu mấy?","t"]],i:[["b1","Tòa nhà có thang máy không?"]]},
 {p:1,t:"An ninh & tiện ích",f:[["park","Gửi xe máy có tính phí không?","s",["Miễn phí","Tính phí"]],["hours","Giờ ra vào có bị giới hạn không?","t"]],i:[["j1","Có bảo vệ / lễ tân không?"],["j2","Có camera an ninh không?"],["j3","Ra vào bằng thẻ từ / khóa vân tay không?"]]},
 {p:1,t:"Máy giặt (theo yêu cầu)",i:[["e1","Trong căn có máy giặt riêng không?"],["e4","Nếu dùng máy giặt chung, có giới hạn giờ giặt không?"]]},
 {p:1,t:"Bếp",i:[["d7","Có bếp sẵn không?"],["d6","Có nồi, chảo sẵn không?"]]},
 {p:1,t:"Khách thuê & môi trường xung quanh",f:[["tenants","Khu này chủ yếu là khách thuê nào?","m",["Văn phòng / gia đình","Sinh viên","Người nước ngoài","Airbnb / ngắn hạn"]]],i:[["i3","Mưa lớn khu này có bị ngập không?"]]},
 {p:1,t:"Hợp đồng & chi phí (bắt buộc hỏi)",f:[["term","Hợp đồng thuê tối thiểu bao lâu?","t"],["depm","Tiền cọc mấy tháng?","t"],["mgmt","Giá thuê đã gồm phí quản lý chưa?","t"],["unit","Đơn giá điện, nước là bao nhiêu? Có ghi vào hợp đồng không?","t"],["refund","Điều kiện hoàn cọc thế nào?","t"],["notice","Trả nhà phải báo trước bao lâu?","t"],["repair","Hỏng hóc, sửa chữa thì ai chịu phí?","t"],["resid","Có hỗ trợ đăng ký tạm trú không?","t"]]},
 /* ===== PHẦN 2: ĐI THỰC TẾ ===== */
 {p:2,t:"Tổng thể căn hộ",i:[["a1","Ngửi: không có mùi ẩm, mốc"],["a2","Nhìn tường, trần: không thấm nước, loang ố"],["a3","Đi trên sàn: không phồng, nứt"],["a4","Thử cửa chính, khóa: chắc chắn, an toàn"],["a5","Ánh sáng tự nhiên đủ sáng (xem ban ngày)"],["a6","Hướng nắng: không bị nắng gắt buổi chiều"]]},
 {p:2,t:"Lầu & an toàn thoát hiểm",i:[["b2","Tìm thang thoát hiểm: có, dễ đi tới"],["b3","Thử cửa thoát hiểm: không bị khóa, không bị chặn"],["b4","Có đèn EXIT / đèn hành lang ban đêm"]]},
 {p:2,t:"Phòng tắm & thoát nước",i:[["c1","Mở vòi: nước chảy mạnh"],["c2","Bật máy nước nóng: chạy được"],["c3","Đổ nước thử: thoát nhanh, không đọng"],["c4","Ngửi cống: không có mùi"],["c5","Nhìn ron gạch: không mốc đen"],["c6","Xả toilet thử: xả mạnh, không rò"]]},
 {p:2,t:"Bếp",i:[["d1","Bật bếp thử: bếp gas / điện hoạt động"],["d3","Bật máy hút mùi: chạy tốt"],["d4","Mở vòi bồn rửa, nhìn bên dưới: không rò nước"],["d5","Mở tủ bếp: không mối mọt"]]},
 {p:2,t:"Máy giặt (theo yêu cầu)",i:[["e3","Nhìn chỗ phơi đồ: thoáng, có nắng"]]},
 {p:2,t:"Điện – Nước – Điều hòa",i:[["f3","Bật máy lạnh: chạy êm, không chảy nước"],["f4","Thử cắm sạc ổ cắm: đủ dùng, không lỏng"]]},
 {p:2,t:"Internet & sóng",i:[["g2","Test tốc độ wifi: ổn định"],["g3","Xem sóng điện thoại: mạnh (4G/5G)"]]},
 {p:2,t:"Phòng ngủ",i:[["h1","Đứng trong phòng nghe thử: cách âm ổn (xe, karaoke, hàng xóm)"],["h2","Cửa sổ thông thoáng"],["h3","Kiểm tra rèm, khóa cửa sổ: đầy đủ"],["h4","Thử tủ, giường: chắc chắn (nếu có)"]]},
 {p:2,t:"Khách thuê & môi trường xung quanh",i:[["i1","Ghé buổi tối: khu vực yên tĩnh"],["i2","Nhìn quanh: không gần karaoke, quán nhậu"]]}
];
var CKIDS = {}; CK.forEach(function(s){ (s.i || []).forEach(function(x){ CKIDS[x[0]] = 1; }); });   // mã các mục tick (để đếm đạt / lỗi)
function ckForm_(ck){
  if(!ck) return '';
  var c = ck.c || {}, v = ck.v || {}, out = [], any = false, good = 0, bad = 0, total = 0, lastP = 0;
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
      if(s.p && s.p !== lastP){ lastP = s.p; if(out.length) out.push(''); out.push(PARTS[s.p].h); }
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
  // Một dòng duy nhất (không xuống dòng): ô CLIP chỉ hiện phần đầu "CHECKLIST: x/y đạt · z lỗi", bấm vào ô mới thấy nguyên nội dung
  var rest = out.filter(function(x){ return x !== ''; }).join(' │ ').replace(/\s*[\r\n]+\s*/g, ' ⏎ ');
  return rest ? head + '          │ ' + rest : head;
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
  sh.getRange(2,cc,last-1,1).setNumberFormat(CF_FMT).setValues(out);
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

/* ===== Cache danh sách + checklist =====
   Mục tiêu: tải nhanh khi có nhiều căn.
   - Danh sách trả về là bản NHẸ: bỏ trường rỗng, checklist chỉ kèm tóm tắt s = [đạt, lỗi, ô đã điền], ghi chú, ảnh, mã bản h (không kèm chi tiết c, v).
   - Bản nhẹ được cache (CacheService) theo "phiên bản dữ liệu". Mọi lần ghi qua app, hoặc sửa tay trong sheet Houses (onEdit), đổi phiên bản.
   - App gửi kèm phiên bản đang có (since): chưa đổi thì server chỉ trả vài chục byte, không đọc Sheet.
   - Chi tiết checklist của một căn chỉ tải khi mở checklist đó (action=ck), cache riêng từng căn; app so mã h để biết bản đang giữ còn mới không.
   Cache hết hạn hoặc bị xóa thì tự đọc lại từ Sheet, nên không bao giờ làm sai dữ liệu. */
var LIST_TTL = 1800;   // giây. Cũng là độ dài "ô thời gian" nhúng vào phiên bản: chỉnh Sheet bằng cách khác onEdit (script, import) cũng hiện sau tối đa chừng này
var ITEM_TTL = 1800;
var CHUNK = 30000;     // ký tự mỗi mảnh cache (giới hạn 100 KB/giá trị; tiếng Việt tối đa 3 byte/ký tự)
function cache_(){ return CacheService.getScriptCache(); }
/** Mã băm ngắn (djb2). index.html dùng đúng cùng hàm này (hs). */
function hash_(s){ var h = 5381, i = s.length; while(i) h = (h * 33) ^ s.charCodeAt(--i); return (h >>> 0).toString(36); }
function ckHash_(ck){ return hash_(JSON.stringify(ck)); }
function dver_(){
  var p = PropertiesService.getScriptProperties(), d = p.getProperty('DVER');
  if(!d){ d = Date.now().toString(36); p.setProperty('DVER', d); }
  return d;
}
/** Dữ liệu vừa đổi: đổi phiên bản (cache cũ tự bỏ vì khóa cache chứa phiên bản). */
function bump_(){ try{ PropertiesService.getScriptProperties().setProperty('DVER', Date.now().toString(36) + Math.random().toString(36).slice(2, 5)); }catch(e){} }
function ver_(){ return dver_() + '.' + Math.floor(Date.now() / (LIST_TTL * 1000)).toString(36); }
function raw_(s){ return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.JSON); }

/** Tóm tắt checklist cho danh sách: không có c, v. */
function liteCk_(ck){
  try{ return liteCk2_(ck); }catch(e){ return null; }
}
function liteCk2_(ck){
  if(!ck || typeof ck !== 'object') return null;
  var c = ck.c || {}, v = ck.v || {}, d = 0, b = 0, f = 0, k;
  for(k in c){ if(!CKIDS[k]) continue; if(c[k] === 1) d++; else if(c[k] === 2) b++; }
  for(k in v){ var x = v[k]; if(Array.isArray(x) ? x.length : (x != null && String(x).trim() !== '')) f++; }
  var o = {s: [d, b, f], h: ckHash_(ck)};
  if(ck.nt) o.nt = ck.nt;
  if(ck.vu) o.vu = ck.vu;
  if(ck.du) o.du = ck.du;
  if(ck.vi && ck.vi.length) o.vi = ck.vi;
  if(ck.im && ck.im.length) o.im = ck.im;
  return o;
}
/** Bản nhẹ của một căn: bỏ trường rỗng, checklist chỉ giữ tóm tắt. */
function liteOf_(it){
  var o = {};
  COLS.forEach(function(c){
    if(c === 'cp' || c === 'cn' || c === 'cf') return;
    var v = it[c];
    if(c === 'ck'){ v = liteCk_(v); if(v) o.ck = v; return; }
    if(c === 'st'){ o.st = stCode_(v); return; }
    if(c === 'im'){ if(Array.isArray(v) && v.length) o.im = v; return; }
    if(NUM[c]){ var x = (v === '' || v == null) ? NaN : Number(v); if(!isNaN(x)) o[c] = x; return; }
    if(v != null && v !== '') o[c] = String(v);
  });
  return o;
}
/** Danh sách bản nhẹ dạng chuỗi JSON: lấy từ cache theo phiên bản v, không có thì đọc Sheet một lần rồi cache (chia mảnh). */
function listJson_(v){
  var cache = cache_(), i;
  try{
    var n = parseInt(cache.get('L:' + v + ':n'), 10);
    if(n > 0){
      var keys = [];
      for(i = 0; i < n; i++) keys.push('L:' + v + ':' + i);
      var got = cache.getAll(keys), parts = [];
      for(i = 0; i < n; i++){ if(got[keys[i]] == null){ parts = null; break; } parts.push(got[keys[i]]); }
      if(parts) return parts.join('');
    }
  }catch(e){}
  var sh = sheet_(), cnt = sh.getLastRow() - 1, arr = [];
  if(cnt > 0) sh.getRange(2,1,cnt,COLS.length).getValues().forEach(function(r){
    if(r[IX.id] === '' || r[IX.id] == null) return;
    try{ arr.push(rowToItem_(r, true)); }catch(e){ try{ var x = rowToItem_(r); delete x.ck; arr.push(liteOf_(x)); }catch(e2){} }   // một dòng lỗi không làm hỏng cả danh sách
  });
  var json = JSON.stringify(arr);
  try{
    var put = {}, a = 0, k = 0;
    while(a < json.length){
      var e = Math.min(json.length, a + CHUNK), cc = json.charCodeAt(e - 1);
      if(e < json.length && cc >= 0xD800 && cc <= 0xDBFF) e++;   // không cắt giữa cặp surrogate (emoji)
      put['L:' + v + ':' + (k++)] = json.slice(a, e); a = e;
    }
    if(k <= 80){ put['L:' + v + ':n'] = String(k); cache.putAll(put, LIST_TTL); }
  }catch(err){}
  return json;
}
/** Một căn đầy đủ (kèm chi tiết checklist), cache theo phiên bản. */
function itemFull_(id){
  id = String(id == null ? '' : id);
  if(!id) return null;
  var key = '';
  try{
    key = 'it:' + id + ':' + dver_();
    var c = cache_().get(key);
    if(c) return JSON.parse(c);
  }catch(e){}
  var sh = sheet_(), row = findRow_(sh, id);
  if(row < 0) return null;
  var it = rowToItem_(sh.getRange(row,1,1,COLS.length).getValues()[0]);
  try{ if(key) cache_().put(key, JSON.stringify(it), ITEM_TTL); }catch(e){}
  return it;
}
/** Sửa tay trong sheet Houses (kể cả bằng app Google Sheets trên điện thoại): đổi phiên bản để app lấy dữ liệu mới. */
function onEdit(e){
  try{ if(e && e.range && e.range.getSheet().getName() === SHEET) bump_(); }catch(err){}
}

/* ===== Helper dùng chung cho Drive / khóa / cache ===== */
/** Thư mục theo ID nếu còn tồn tại và chưa vào thùng rác, ngược lại null. */
function liveFolder_(id){
  if(!id) return null;
  try{ var c = DriveApp.getFolderById(id); if(!c.isTrashed()) return c; }catch(e){}
  return null;
}
/** Chạy fn trong khóa script (held = true: đang giữ khóa rồi, không khóa lại). Hết giờ chờ vẫn chạy tiếp như trước. */
function withLock_(fn, held){
  var lock = held ? null : LockService.getScriptLock(), got = false;
  try{
    if(lock) got = lock.tryLock(10000);
    return fn();
  }finally{
    if(got){ try{ lock.releaseLock(); }catch(e){} }
  }
}
/** Thư mục con chưa bị xóa theo tên (null nếu chưa có). */
function childByName_(par, name){
  var it = par.getFoldersByName(name);
  while(it.hasNext()){ var f = it.next(); if(!f.isTrashed()) return f; }
  return null;
}
/** Lấy thư mục theo cache; không có thì vào khóa, kiểm tra lại rồi make() và ghi cache (6 giờ). */
function cachedFolder_(key, make, held){
  var cache = CacheService.getScriptCache();
  function hit_(){ return liveFolder_(cache.get(key)); }
  var f = hit_();
  if(f) return f;
  return withLock_(function(){
    var g = hit_();                    // request khác vừa tạo xong trong lúc mình chờ khóa
    if(g) return g;
    g = make();
    cache.put(key, g.getId(), 21600);
    return g;
  }, held);
}
/** Thư mục gốc lưu ID ở Script Properties (tạo một lần bằng make()). */
function rootFolder_(prop, make){
  var props = PropertiesService.getScriptProperties();
  function saved_(){ return liveFolder_(props.getProperty(prop)); }
  return saved_() || withLock_(function(){
    var f = saved_();
    if(f) return f;
    f = make();
    props.setProperty(prop, f.getId());
    return f;
  });
}

var SH_ = null;   // nhớ sheet trong một lần chạy (đỡ gọi getMaxColumns nhiều lần)
function sheet_(){
  if(SH_) return SH_;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET);
  if(!sh){ sh = ss.insertSheet(SHEET); format_(sh); }
  else if(sh.getMaxColumns() < COLS.length) ensureCols_(sh);
  return (SH_ = sh);
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
  return rootFolder_('PHOTOROOT', function(){
    var parent;
    if(PARENT_FOLDER_ID){
      try{ parent = DriveApp.getFolderById(PARENT_FOLDER_ID); }
      catch(e){ throw new Error('Không mở được thư mục cha trên Drive. Kiểm tra PARENT_FOLDER_ID và quyền của tài khoản chạy script.'); }
    }else{
      var ps = DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId()).getParents();
      parent = ps.hasNext() ? ps.next() : DriveApp.getRootFolder();
    }
    return childByName_(parent, PHOTO_FOLDER_NAME) || parent.createFolder(PHOTO_FOLDER_NAME);
  });
}

/** Thư mục gốc "Ảnh đi xem": tạo một lần, nằm cùng cấp (cùng thư mục cha) với "Ảnh nhà". */
function viewRoot_(){
  return rootFolder_('VIEWROOT', function(){
    var ps = folder_().getParents(), parent = ps.hasNext() ? ps.next() : DriveApp.getRootFolder();
    return childByName_(parent, VIEW_FOLDER_NAME) || parent.createFolder(VIEW_FOLDER_NAME);
  });
}
/** Chia sẻ "Ai có link được xem" đúng một lần cho thư mục gốc; mọi thư mục/ảnh bên trong kế thừa.
 *  Cờ '1' = đã chia sẻ, 'x' = đã thử nhưng bị chặn (không thử lại mỗi ảnh). */
function shareOnce_(flag, getFolder){
  var props = PropertiesService.getScriptProperties();
  if(props.getProperty(flag)) return;
  var ok = '1';
  try{ getFolder().setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); }catch(err){ ok = 'x'; }
  props.setProperty(flag, ok);
}
function shareViewRoot_(){ shareOnce_('VIEWSHARED', viewRoot_); }
function shareRoot_(){ shareOnce_('PHOTOSHARED', folder_); }

function folderName_(name){ return String(name || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 100) || 'Chưa đặt tên'; }
function folderUrl_(f){ return 'https://drive.google.com/drive/folders/' + f.getId(); }

/* ===== Cấu trúc thư mục ảnh: <Ảnh nhà | Ảnh đi xem> / Khu vực (quận) / Phường / Tên căn =====
   Khu vực lấy từ cột "Khu vực", phường lấy từ cột "Phường" (cột trống thì thử tách từ "Địa chỉ", vd "P.5").
   Thiếu thì vào "Chưa rõ khu vực" / "Chưa rõ phường". loc = {d: khu vực, w: phường, a: địa chỉ}. Ảnh lỗi, hư hỏng vẫn nằm trong thư mục căn của "Ảnh đi xem". */
var NO_AREA = 'Chưa rõ khu vực', NO_WARD = 'Chưa rõ phường';
function placeName_(v, fb){ var s = String(v == null ? '' : v).replace(/[\r\n]+/g, ' ').replace(/[\/\\]+/g, '-').replace(/\s+/g, ' ').trim().slice(0, 100); return s || fb; }
/** Tên phường của căn: cột Phường; trống thì tách từ địa chỉ. */
function wardOf_(loc){ loc = loc || {}; var w = String(loc.w == null ? '' : loc.w).trim(); return w || wardFrom_(loc.a); }
function locOf_(it){ return {d: it.d, w: it.w, a: it.a}; }
function sameLoc_(x, y){
  return placeName_(x && x.d, NO_AREA) === placeName_(y && y.d, NO_AREA) && placeName_(wardOf_(x), NO_WARD) === placeName_(wardOf_(y), NO_WARD);
}
/** Tách phường từ địa chỉ (chỉ dùng khi cột Phường trống). Trả về '' nếu không thấy. */
function wardFrom_(addr){
  var s = String(addr == null ? '' : addr).replace(/[\r\n]+/g, ' '), pre = '', w = '';
  var m = /(?:^|[\s,;(\-–])(phường|phuong|ph\.|p\.|xã|xa|thị trấn|thi tran|tt\.)\s*([^,;()\n]+)/i.exec(s);
  if(m){
    var k = m[1].toLowerCase();
    pre = /^x/.test(k) ? 'Xã' : (/^t/.test(k) ? 'Thị trấn' : 'Phường');
    w = m[2];
  }else{
    m = /(?:^|[\s,;(\-–])p\s?(\d{1,2})(?=$|[\s,;).\-])/i.exec(s);
    if(m){ pre = 'Phường'; w = m[1]; }
  }
  if(!m) return '';
  w = w.replace(/\s+(?:quận|quan|q\.|huyện|huyen|thành phố|thanh pho|tp\.|tp |tỉnh|tinh).*$/i, '').trim();
  var dg = /^(\d{1,2})(?![\wÀ-ỹ])/.exec(w); if(dg) w = dg[1];
  w = w.replace(/[.\-–\s]+$/, '');
  return w ? (pre + ' ' + w) : '';
}
/** Thư mục con theo tên (lấy hoặc tạo; peek = true thì chỉ tìm, không tạo; held = true khi đang giữ khóa của doPost). */
function placeFolder_(par, name, held, peek){
  var key = 'pf:' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, name + '|' + par.getId()));
  function find_(){
    var it = par.getFoldersByName(name);
    while(it.hasNext()){
      var x = it.next();
      if(x.isTrashed()) continue;
      if((x.getDescription() || '').indexOf('hid:') === 0) continue;   // thư mục căn, không phải thư mục khu vực/phường
      return x;
    }
    return null;
  }
  if(peek){
    var cache = CacheService.getScriptCache(), c = liveFolder_(cache.get(key));
    if(c) return c;
    var f0 = find_();
    if(f0) cache.put(key, f0.getId(), 21600);
    return f0;
  }
  return cachedFolder_(key, function(){ return find_() || par.createFolder(name); }, held);
}
/** <top>/<Khu vực>/<Phường> (tạo nếu chưa có). */
function wardFolder_(top, loc, held){
  var a = placeFolder_(top, placeName_(loc && loc.d, NO_AREA), held);
  return placeFolder_(a, placeName_(wardOf_(loc), NO_WARD), held);
}
/** Như trên nhưng chỉ tìm, không tạo; trả về null nếu chưa có. */
function wardPeek_(top, loc){
  try{
    var a = placeFolder_(top, placeName_(loc && loc.d, NO_AREA), true, true);
    return a ? placeFolder_(a, placeName_(wardOf_(loc), NO_WARD), true, true) : null;
  }catch(e){ return null; }
}
/** Thư mục f nằm đâu đó bên dưới root (tối đa 6 cấp). */
function isUnder_(f, root){
  var cur = f;
  for(var d = 0; d < 6; d++){
    var ps = cur.getParents();
    if(!ps.hasNext()) return false;
    var par = ps.next();
    if(par.getId() === root.getId()) return true;
    cur = par;
  }
  return false;
}
function parentIn_(f, root){ var ps = f.getParents(); return ps.hasNext() ? ps.next() : root; }
/** Đưa thư mục căn f vào đúng thư mục phường `want` (nếu chưa ở đó). Trùng tên trong phường thì tự thêm (2), (3)… */
function putIn_(f, want){
  try{
    var ps = f.getParents();
    while(ps.hasNext()){ if(ps.next().getId() === want.getId()) return f; }
    var nm = uniqueName_(want, f.getName(), f.getId());
    if(nm !== f.getName()) f.setName(nm);
    f.moveTo(want);
  }catch(e){}
  return f;
}
/** Xóa thư mục phường / khu vực nếu đã rỗng (không bao giờ đụng tới thư mục gốc). */
function pruneEmpty_(par, root){
  try{
    for(var d = 0; d < 2 && par; d++){
      if(par.getId() === root.getId()) return;
      if(par.getFiles().hasNext() || par.getFolders().hasNext()) return;
      var ps = par.getParents(), gp = ps.hasNext() ? ps.next() : null;
      par.setTrashed(true);
      par = gp;
    }
  }catch(e){}
}
/** Ô \"Album ảnh\": hiện đúng link thư mục và bấm mở được (giá trị vẫn là URL nên app đọc lại bình thường). */
function linkCell_(sh, row, url){
  if(!/^https?:\/\//.test(url || '')) return;
  try{ sh.getRange(row, DRCOL).setRichTextValue(SpreadsheetApp.newRichTextValue().setText(url).setLinkUrl(url).build()); }catch(e){}
}
/** Điền link thư mục ảnh cho các căn đã có thư mục trên Drive mà cột Album ảnh còn trống (không tạo thư mục mới). */
function backfillAlbum_(sh){
  var last = sh.getLastRow();
  if(last < 2) return;
  var root = folder_(), data = sh.getRange(2,1,last-1,COLS.length).getValues();
  for(var i=0;i<data.length;i++){
    var r = data[i], nm = String(r[IX.n] || '').trim();
    if(!nm) continue;
    var have = String(r[IX.dr] || '');
    if(/^https?:\/\//.test(have)){ linkCell_(sh, i+2, have); continue; }
    var pw = wardPeek_(root, {d: r[IX.d], w: r[IX.w], a: r[IX.a]}), it = (pw || root).getFoldersByName(folderName_(nm));
    if(!it.hasNext() && pw) it = root.getFoldersByName(folderName_(nm));   // thư mục cũ còn nằm phẳng
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
/** Tìm thư mục cũ theo tên (trong một hoặc nhiều thư mục): ưu tiên thư mục đã gắn mã căn này; thư mục chưa gắn mã chỉ nhận khi không có căn nào khác trùng tên. */
function pickOld_(roots, oldN, hid, shared){
  var tag = hid ? hidTag_(hid) : '', legacy = null, rs = Array.isArray(roots) ? roots : [roots];
  for(var i = 0; i < rs.length; i++){
    if(!rs[i]) continue;
    var it = rs[i].getFoldersByName(oldN);
    while(it.hasNext()){
      var f = it.next(), d = f.getDescription() || '';
      if(f.isTrashed()) continue;
      if(tag && d === tag) return f;
      if(!d && !legacy) legacy = f;
    }
  }
  return (legacy && !shared) ? legacy : null;
}
/** Thư mục của căn `hid` trong `top` (nằm ở top/Khu vực/Phường/Tên): theo link đã lưu -> theo mã gắn trên thư mục -> tạo mới với tên không trùng.
 *  Thư mục tìm thấy mà đang ở sai chỗ (đổi khu vực/địa chỉ, hoặc dữ liệu cũ nằm phẳng) thì được chuyển sang đúng chỗ.
 *  loc = undefined (app cũ chưa gửi khu vực/phường) thì giữ nguyên chỗ cũ, chỉ tạo mới ở "Chưa rõ khu vực". */
function folderFor_(top, name, hid, hint, loc){
  name = folderName_(name);
  var keep = (loc === undefined), want = null;
  function W_(){ return want || (want = wardFolder_(top, loc)); }   // chỉ dựng đường dẫn khi cần
  if(!hid) return houseFolderIn_(W_(), name);
  var tag = hidTag_(hid), cache = CacheService.getScriptCache(), key = 'hid3:' + top.getId() + '|' + hid;
  function settle_(f){ return keep ? f : putIn_(f, W_()); }
  var id = folderIdFromUrl_(hint);
  if(id){
    try{
      var c = DriveApp.getFolderById(id);
      if(!c.isTrashed() && isUnder_(c, top)){ if(!c.getDescription()) c.setDescription(tag); return settle_(c); }
    }catch(e){}
  }
  id = cache.get(key);
  if(id){ try{ var c1 = DriveApp.getFolderById(id); if(!c1.isTrashed() && isUnder_(c1, top)) return settle_(c1); }catch(e){} }
  var wf = W_();                                   // dựng Khu vực/Phường trước khi giữ khóa (tránh khóa lồng nhau)
  var lock = LockService.getScriptLock(), got = false;
  try{
    got = lock.tryLock(10000);
    id = cache.get(key);
    if(id){ try{ var c2 = DriveApp.getFolderById(id); if(!c2.isTrashed() && isUnder_(c2, top)) return settle_(c2); }catch(e){} }
    var f = null, legacy = null, places = [wf, top];
    for(var pi = 0; pi < places.length && !f; pi++){
      for(var n = 1; n < 30 && !f; n++){
        var cand = n === 1 ? name : name + ' (' + n + ')', it = places[pi].getFoldersByName(cand);
        while(it.hasNext()){
          var x = it.next(), d = x.getDescription() || '';
          if(x.isTrashed()) continue;
          if(d === tag){ f = x; break; }
          if(!d && n === 1 && !legacy) legacy = x;
        }
      }
    }
    if(!f && legacy && !otherHouseHasName_(hid, name)){ legacy.setDescription(tag); f = legacy; }
    if(!f){ f = wf.createFolder(uniqueName_(wf, name)); f.setDescription(tag); }
    cache.put(key, f.getId(), 21600);
    return settle_(f);
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
function renameHouseFolder_(oldName, newName, oldDr, newDr, hid, shared, oldLoc, loc){
  var root = folder_(), oldN = folderName_(oldName), newN = folderName_(newName);
  if(oldN === newN) return '';
  var old = null, id = folderIdFromUrl_(oldDr);
  if(id){ try{ var c = DriveApp.getFolderById(id); if(!c.isTrashed()) old = c; }catch(e){} }
  if(!old) old = pickOld_([wardPeek_(root, oldLoc), wardPeek_(root, loc), root], oldN, hid, shared);
  if(!old) return '';
  var par = parentIn_(old, root);                 // thư mục phường (hoặc gốc nếu dữ liệu cũ nằm phẳng)
  var target = null, ex = par.getFoldersByName(newN);
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
    finalN = uniqueName_(par, newN, old.getId());   // trùng tên với thư mục của căn khác -> tự thêm (2), (3)…
    old.setName(finalN);
  }
  if(hid && !(out.getDescription() || '')) out.setDescription(hidTag_(hid));
  var cache = CacheService.getScriptCache();
  cache.remove(hfKey_(oldN, root));
  cache.put(hfKey_(finalN, root), out.getId(), 21600);
  return folderUrl_(out);
}

function houseFolderIn_(root, name){
  name = folderName_(name);
  return cachedFolder_(hfKey_(name, root), function(){ return childByName_(root, name) || root.createFolder(name); });
}

/** Chỉ cho xóa file/thư mục nằm trong 2 thư mục gốc ảnh của app (không đụng file khác trong Drive). */
function rootIds_(){
  var p = PropertiesService.getScriptProperties(), o = {};
  ['PHOTOROOT','VIEWROOT'].forEach(function(k){ var v = p.getProperty(k); if(v) o[v] = 1; });
  return o;
}
function underRoot_(item, roots){
  var cur = item;
  for(var d = 0; d < 7; d++){
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
  var refs = {}, sameName = 0;
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
        try{ var c = DriveApp.getFolderById(id); if(!c.isTrashed() && isUnder_(c, root)) f = c; }catch(e){}
      }
      if(!f) f = pickOld_([wardPeek_(root, locOf_(it)), root], name, it.id, sameName > 0);
      if(!f) return;
      var d = f.getDescription() || '';
      if(d && d !== tag) return;            // thư mục của căn khác
      if(refs[f.getId()]) return;           // căn khác còn dùng chung thư mục này
      var par0 = null; try{ par0 = parentIn_(f, root); }catch(e){}
      f.setTrashed(true);
      pruneEmpty_(par0, root);                // phường / khu vực rỗng thì dọn luôn
      cache.remove(hfKey_(name, root));
      cache.remove('hid2:' + root.getId() + '|' + it.id);
      cache.remove('hid3:' + root.getId() + '|' + it.id);
    }catch(e){}
  });
}

/** Thư mục "Ảnh lỗi, hư hỏng" nằm trong thư mục căn của "Ảnh đi xem". */
function damageIn_(par){
  return cachedFolder_('df:' + par.getId(), function(){ return childByName_(par, DAMAGE_FOLDER_NAME) || par.createFolder(DAMAGE_FOLDER_NAME); });
}
/** kind: 'view' = ảnh thực tế, 'damage' = ảnh lỗi/hư hỏng (trong thư mục căn của Ảnh đi xem), còn lại = ảnh nhà.
 *  Đường dẫn: Ảnh nhà | Ảnh đi xem / Khu vực / Phường / Tên căn (loc = {d, w, a}). hid + hint (link thư mục đã lưu) giúp mỗi căn một thư mục riêng. */
function targetFolder_(kind, name, hid, hint, loc){
  if(kind === 'damage') return damageIn_(folderFor_(viewRoot_(), name, hid, hint, loc));
  if(kind === 'view') return folderFor_(viewRoot_(), name, hid, hint, loc);
  return folderFor_(folder_(), name, hid, hint, loc);
}
/** Căn đổi tên -> đổi tên thư mục căn trong "Ảnh đi xem" (kèm thư mục lỗi/hư hỏng bên trong). Trả về {vu, du} hoặc null. */
function renameViewFolder_(oldName, newName, hintUrl, hid, shared, oldLoc, loc){
  var root = viewRoot_(), oldN = folderName_(oldName), newN = folderName_(newName);
  if(oldN === newN) return null;
  var old = null, id = folderIdFromUrl_(hintUrl);
  if(id){ try{ var c = DriveApp.getFolderById(id); if(!c.isTrashed()) old = c; }catch(e){} }
  if(!old) old = pickOld_([wardPeek_(root, oldLoc), wardPeek_(root, loc), root], oldN, hid, shared);
  if(!old) return null;
  var out = old, finalN = uniqueName_(parentIn_(old, root), newN, old.getId());   // trùng tên căn khác -> tự thêm (2), (3)…
  old.setName(finalN);
  if(hid && !(out.getDescription() || '')) out.setDescription(hidTag_(hid));
  var cache = CacheService.getScriptCache();
  cache.remove(hfKey_(oldN, root));
  cache.put(hfKey_(finalN, root), out.getId(), 21600);
  var du = '', dit = out.getFoldersByName(DAMAGE_FOLDER_NAME);
  if(dit.hasNext()) du = folderUrl_(dit.next());
  return {vu: folderUrl_(out), du: du};
}

/** Chuyển thư mục ảnh của một căn (Ảnh nhà + Ảnh đi xem) vào đúng Khu vực / Phường. Dùng khi đổi khu vực, địa chỉ. */
function relocate_(it){
  [[folder_, it.dr], [viewRoot_, it.ck && it.ck.vu]].forEach(function(pair){
    var id = folderIdFromUrl_(pair[1]);
    if(!id) return;
    var root = pair[0]();
    try{
      var c = DriveApp.getFolderById(id);
      if(c.isTrashed() || !isUnder_(c, root)) return;
      var old = parentIn_(c, root);
      putIn_(c, wardFolder_(root, locOf_(it), true));
      pruneEmpty_(old, root);
    }catch(e){}
  });
}

/** CHẠY MỘT LẦN để xếp lại ảnh đã có: chuyển thư mục từng căn (Ảnh nhà + Ảnh đi xem) vào Khu vực / Phường / Tên.
 *  Chỉ di chuyển thư mục, không đổi ID nên link ảnh và link album trong Sheet vẫn dùng được. Chạy lại nhiều lần cũng an toàn. */
function sapXepThuMucAnh(){
  var sh = sheet_(), last = sh.getLastRow();
  if(last < 2) return 'Chưa có căn nào.';
  var items = sh.getRange(2,1,last-1,COLS.length).getValues().map(function(r){ return rowToItem_(r); }).filter(function(x){ return x.id; });
  var roots = [folder_(), viewRoot_()], moved = 0, miss = 0;
  items.forEach(function(it){
    var hints = [it.dr, it.ck && it.ck.vu], name = folderName_(it.n);
    roots.forEach(function(root, k){
      var f = null, id = folderIdFromUrl_(hints[k]);
      if(id){ try{ var c = DriveApp.getFolderById(id); if(!c.isTrashed() && isUnder_(c, root)) f = c; }catch(e){} }
      if(!f) f = pickOld_([wardPeek_(root, locOf_(it)), root], name, it.id, false);
      if(!f){ miss++; return; }
      var before = parentIn_(f, root).getId(), want = wardFolder_(root, locOf_(it));
      if(before !== want.getId()){ putIn_(f, want); pruneEmpty_(DriveApp.getFolderById(before), root); moved++; }
    });
  });
  var msg = 'Đã xếp ' + moved + ' thư mục vào Khu vực / Phường' + (miss ? ' (' + miss + ' căn chưa có thư mục ảnh)' : '') + '.';
  try{ SpreadsheetApp.getActive().toast(msg, 'Sắp xếp ảnh', 8); }catch(e){}
  return msg;
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
  bump_();
}

/** Dựng lại riêng tab Tổng hợp (cập nhật link Checklist theo VIEW_KEY và link Web app hiện tại). Chạy khi đổi mã truy cập hoặc đổi link Web app. Không đụng dữ liệu. */
function taoLaiTongHop(){
  try{ CacheService.getScriptCache().remove('urlsync'); }catch(e){}
  summary_();
  bump_();
  try{ SpreadsheetApp.getActive().toast('Đã dựng lại tab Tổng hợp với mã và link hiện tại.', 'Tổng hợp', 8); }catch(e){}
}

function format_(sh){
  var n = COLS.length, rows = sh.getMaxRows();
  if(sh.getMaxColumns() < n) sh.insertColumnsAfter(sh.getMaxColumns(), n - sh.getMaxColumns());
  if(rows < 2){ sh.insertRowsAfter(1,100); rows = sh.getMaxRows(); }
  var body = rows - 1;

  sh.getRange(1,1,1,n).setNumberFormat('@').setValues([HEAD]);
  for(var i=0,j;i<n;i=j){ for(j=i+1;j<n&&FMT[j]===FMT[i];j++); sh.getRange(2,i+1,body,j-i).setNumberFormat(FMT[i]); }   // gộp cột liền nhau cùng định dạng

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
  sh.getRange(2,27,body,1).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP).setHorizontalAlignment('left').setVerticalAlignment('top')
    .setNumberFormat(CF_FMT);   // CLIP: chỉ hiện dòng đầu 'CHECKLIST: x/y đạt · z lỗi'
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

function summary_(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SUMMARY) || ss.insertSheet(SUMMARY);
  var CT = SUM_FR, SEC = CT - 2, CNT = CT + 1, HD = CT + 2, R0 = CT + 3, R1 = R0 + 299, B2 = 55;   // B2 = cột đứng trước khối kết quả (khối kết quả bắt đầu ở BD)
  var keep = null;   // giữ lại giá trị 6 ô lọc khi dựng lại bảng: [trạng thái, khu vực, phường, loại ngày, từ, đến]
  try{
    var k5 = null;
    [CT, 34].forEach(function(c){   // 34 = vị trí cũ của hàng lọc
      if(keep || k5) return;
      if(sh.getRange('A' + (c + 2)).getValue() === 'Trạng thái'){
        if(sh.getRange('C' + (c - 1)).getValue() === 'Phường') keep = sh.getRange('A' + c + ':F' + c).getValues()[0];
        else k5 = sh.getRange('A' + c + ':E' + c).getValues()[0];
      }
    });
    if(!keep && !k5 && sh.getRange('A21').getValue() === 'Trạng thái') k5 = sh.getRange('A19:E19').getValues()[0];   // bố cục rất cũ
    if(k5) keep = [k5[0], k5[1], 'Tất cả', k5[2], k5[3], k5[4]];
  }catch(e){}
  sh.getRange(1,1,sh.getMaxRows(),sh.getMaxColumns()).breakApart();
  sh.clear(); sh.clearConditionalFormatRules();
  sh.getCharts().forEach(function(c){ sh.removeChart(c); });
  if(sh.getMaxColumns() < 96) sh.insertColumnsAfter(sh.getMaxColumns(), 96 - sh.getMaxColumns());
  if(sh.getMaxRows() < 350) sh.insertRowsAfter(sh.getMaxRows(), 350 - sh.getMaxRows());
  sh.getRange(1,1,sh.getMaxRows(),sh.getMaxColumns()).clearDataValidations();
  sh.showColumns(1, sh.getMaxColumns());
  var SEMI = semi_(sh);
  try{ CacheService.getScriptCache().remove('urlsync'); }catch(e){}   // bỏ cờ chặn để syncUrl_ sửa lại BC1 ngay ở lần gọi kế tiếp
  try{ var au = appUrl_(); if(au.indexOf('/exec') > 0) sh.getRange('BC1').setValue(au); }catch(e){}   // chỉ ghi link /exec; link /dev (chạy từ editor) sẽ làm trang checklist báo lỗi địa chỉ
  var F = function(x){ return fx_(x,SEMI); };
  var LINE = '#d5ddd8', SOLID = SpreadsheetApp.BorderStyle.SOLID;
  sh.setHiddenGridlines(true);
  sh.setTabColor('#1d5fa8');
  [120,220,150,110,170,180,110,100,210,90,105,105,105,300,130,110,130].forEach(function(w,i){ sh.setColumnWidth(i+1,w); });
  sh.getRange('A1:Q350').setFontSize(10).setVerticalAlignment('middle');

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

  // Top 5 (giống tab Tổng hợp trong app): hạng | căn (tên + khu vực · giá) | điểm
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

  // ===== Chi tiết các căn theo trạng thái (gần chốt → mới tìm) + bộ lọc Trạng thái / Khu vực / Loại ngày / Từ–Đến ngày =====
  // Ô lọc (ô vàng, hàng SUM_FR, cột A:F) là chỗ duy nhất được sửa tay. Công thức lọc + sắp xếp nằm ở các cột ẩn T:CB.
  var STORDER = ['won','seen','contact','new','out'];
  var STICON = {won:'✅ ', seen:'👀 ', contact:'📞 ', 'new':'🆕 ', out:'🚫 '};
  var WC = cl_(COLS.indexOf('w') + 1);   // cột Phường trong sheet Houses
  function R_(c){ return c + R0 + ':' + c + R1; }
  function cl_(n){ var s = ''; while(n > 0){ var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }
  function b2_(k){ return R_(cl_(B2 + k)); }   // cột thứ k của khối kết quả (đã lọc + sắp xếp)
  function nest_(ref, pick, last){
    var o = last;
    for(var i = STORDER.length - 1; i >= 0; i--) o = 'IF(' + ref + '="' + stLabel_(STORDER[i]) + '",' + pick(STORDER[i], i) + ',' + o + ')';
    return o;
  }

  sec_('A'+SEC+':Q'+SEC,'📋 Chi tiết các căn theo trạng thái (gần chốt → mới tìm; trong mỗi nhóm xếp theo khu vực, điểm cao trước)');
  sh.setRowHeight(SEC,30); sh.setRowHeight(CT-1,22); sh.setRowHeight(CT,32); sh.setRowHeight(CNT,24); sh.setRowHeight(HD,40);

  // Bộ lọc (giữ lại giá trị đang chọn mỗi lần dựng lại bảng)
  var stList = ['Tất cả'].concat(STORDER.map(stLabel_)), tyList = ['Ngày thêm','Ngày liên hệ','Ngày hẹn xem'];
  var ctl = ['Tất cả','Tất cả','Tất cả','Ngày thêm','',''];
  if(keep){
    if(stList.indexOf(keep[0]) >= 0) ctl[0] = keep[0];
    if(keep[1] !== '' && keep[1] != null) ctl[1] = keep[1];
    if(keep[2] !== '' && keep[2] != null) ctl[2] = keep[2];
    if(tyList.indexOf(keep[3]) >= 0) ctl[3] = keep[3];
    ctl[4] = keep[4]; ctl[5] = keep[5];
  }
  sh.getRange('A'+(CT-1)+':F'+(CT-1)).setValues([['Trạng thái','Khu vực','Phường','Loại ngày','Từ ngày','Đến ngày']])
    .setFontWeight('bold').setFontSize(9).setFontColor('#5f6f6a').setHorizontalAlignment('center').setVerticalAlignment('bottom');
  sh.getRange('A'+CT+':F'+CT).setValues([ctl]).setBackground('#fff4c2').setFontWeight('bold').setFontSize(11)
    .setHorizontalAlignment('center').setVerticalAlignment('middle').setBorder(true,true,true,true,true,true,'#d9b400',SOLID);
  sh.getRange('E'+CT+':F'+CT).setNumberFormat('dd/mm/yyyy');
  sh.getRange('G'+CT+':P'+CT).merge().setValue('←  Chọn bộ lọc ở các ô vàng (chỉ các ô này sửa được). Từ ngày / Đến ngày để trống = không giới hạn.')
    .setFontStyle('italic').setFontColor('#5f6f6a').setFontSize(9).setVerticalAlignment('middle');
  // Danh sách khu vực (cột ẩn AZ) và phường (cột ẩn BA) cho ô lọc
  sh.getRange('AZ1').setFormula(F('=IFERROR({"Tất cả";"(chưa có khu vực)";SORT(UNIQUE(FILTER(Houses!E2:E,Houses!E2:E<>"")))},{"Tất cả";"(chưa có khu vực)"})'));
  sh.getRange('BA1').setFormula(F('=IFERROR({"Tất cả";"(chưa có phường)";SORT(UNIQUE(FILTER(Houses!' + WC + '2:' + WC + ',Houses!' + WC + '2:' + WC + '<>"")))},{"Tất cả";"(chưa có phường)"})'));
  sh.getRange('A'+CT).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(stList, true).setAllowInvalid(false).build());
  sh.getRange('B'+CT).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(sh.getRange('AZ1:AZ100'), true).setAllowInvalid(true).build());
  sh.getRange('C'+CT).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(sh.getRange('BA1:BA200'), true).setAllowInvalid(true).build());
  sh.getRange('D'+CT).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(tyList, true).setAllowInvalid(false).build());
  sh.getRange('E'+CT+':F'+CT).setDataValidation(SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(false).build());

  // Bước 1 (cột ẩn T:AS): lấy toàn bộ căn từ Houses, thêm cột tính: thứ tự trạng thái, các ngày, cờ "khớp bộ lọc"
  var kv = R_('T'), ten = R_('U'), tt = R_('AB'), hen = R_('AF'), tms = R_('AM'), lhr = R_('AN'), passR = R_('AS');
  var dsel = 'IF($D$'+CT+'="Ngày liên hệ",' + R_('AQ') + ',IF($D$'+CT+'="Ngày hẹn xem",' + R_('AR') + ',' + R_('AP') + '))';
  sh.getRange('T'+HD+':AS'+HD).setValues([['khuvuc','ten','diachi','link','sdt_sale','sale','chu','sdt_chu','trangthai','gia','dt','coc','hen','uu','nhuoc','checklist','diem','album','id','themluc','lienhe','thutu','ngaythem','ngaylienhe','ngayhen','loc']]);
  sh.getRange('T'+R0).setFormula(F('=IFERROR(QUERY(Houses!A2:AA,"select E, C, D, S, N, M, L, K, F, G, H, I, Q, T, U, X, V, P, A, B, R where C is not null",0),"")'));
  sh.getRange('AO'+R0).setFormula(F('=ARRAYFORMULA(IF('+ten+'="","",'+nest_(tt, function(c,i){ return i + 1; }, 4)+'))'));
  sh.getRange('AP'+R0).setFormula(F('=ARRAYFORMULA(IF('+ten+'="","",IF('+tms+'="","",INT('+tms+'/86400000+25569+7/24))))'));
  sh.getRange('AQ'+R0).setFormula(F('=ARRAYFORMULA(IF('+ten+'="","",IFERROR(DATEVALUE('+lhr+'),IF(ISNUMBER('+lhr+'),'+lhr+',""))))'));
  sh.getRange('AR'+R0).setFormula(F('=ARRAYFORMULA(IF('+ten+'="","",IFERROR(DATEVALUE('+hen+'),IF(ISNUMBER('+hen+'),'+hen+',""))))'));
  sh.getRange('AS'+R0).setFormula(F('=ARRAYFORMULA(IF('+ten+'="","",'
    + 'IF(OR($B$'+CT+'="Tất cả",$B$'+CT+'=""),1,IF($B$'+CT+'="(chưa có khu vực)",IF('+kv+'="",1,0),IF('+kv+'=$B$'+CT+',1,0)))'
    + '*IF(OR($A$'+CT+'="Tất cả",$A$'+CT+'=""),1,IF('+tt+'=$A$'+CT+',1,0))'
    + '*IF(OR($C$'+CT+'="Tất cả",$C$'+CT+'=""),1,IF($C$'+CT+'="(chưa có phường)",IF('+R_('AY')+'="",1,0),IF('+R_('AY')+'=$C$'+CT+',1,0)))'
    + '*IF(AND($E$'+CT+'="",$F$'+CT+'=""),1,IF('+dsel+'="",0,IF($E$'+CT+'="",1,IF('+dsel+'>=$E$'+CT+',1,0))*IF($F$'+CT+'="",1,IF('+dsel+'<=$F$'+CT+',1,0))))'
    + '))'));

  // Phường (cột ẩn AY, cùng thứ tự dòng với khối T:AS) và nhãn gộp "Khu vực · Phường" (cột ẩn BB) cho bảng giá theo khu vực
  sh.getRange('AY'+HD).setValue('phuong');
  sh.getRange('AY'+R0).setFormula(F('=IFERROR(FILTER(Houses!' + WC + '2:' + WC + ',Houses!C2:C<>""),"")'));
  sh.getRange('BB'+HD).setValue('khuvuc_phuong');
  sh.getRange('BB'+R0).setFormula(F('=ARRAYFORMULA(IF('+ten+'="","",IF('+kv+'="",IF('+R_('AY')+'="","(chưa có khu vực)",'+R_('AY')+'),IF('+R_('AY')+'="",'+kv+','+kv+'&" · "&'+R_('AY')+'))))'));

  sh.getRange('AT'+HD).setValue('k_m2');
  sh.getRange('AT'+R0).setFormula(F('=ARRAYFORMULA(IF('+ten+'="","",IFERROR(IF((('+R_('AC')+'="")+('+R_('AD')+'=""))>0,"",'+R_('AC')+'*1000/'+R_('AD')+'),"")))'));

  // ===== Bảng giá thuê theo khu vực (A15:H30): mọi căn trong sheet Houses, xếp theo giá trung bình tăng dần =====
  // Số liệu lấy từ khối ẩn T:AT (bước 1); thống kê từng khu vực tính ở cột ẩn CD:CI, sắp xếp ở CK:CP.
  var ARS = 15, ARH = 16, AR0 = 17, ARN = 18, ART = AR0 + ARN, ARX = ART + 1, ARM = 40;   // ARN = số dòng hiển thị, ARM = số khu vực tối đa tính toán
  var kvA = R_('BB'), tenA = R_('U'), giaA = R_('AC'), ppmA = R_('AT');
  sec_('A'+ARS+':H'+ARS,'💰 Giá thuê theo khu vực / phường (triệu/tháng, xếp theo giá trung bình tăng dần)');
  sh.setRowHeight(14,14); sh.setRowHeight(ARS,30); sh.setRowHeight(ARH,34);
  hdr_('A'+ARH+':H'+ARH,['#','Khu vực / phường','Số căn','Thấp nhất','Trung bình','Cao nhất','TB k/m²','So với TB chung']);
  var stA = [];
  for(var ai = 0; ai < ARM; ai++){
    var ar = AR0 + ai, nm = '$CD' + ar, crit = nm;
    var cg = 'COUNTIFS(' + kvA + ',' + crit + ',' + giaA + ',">0")';
    var ifs = function(fn, rngA){ return 'IF(N($CE' + ar + ')=0,"",IF(' + cg + '=0,"",' + fn + '(' + rngA + ',' + kvA + ',' + crit + ',' + giaA + ',">0")))'; };
    stA.push([
      F('=IF(CR' + (1 + ai) + '="","",CR' + (1 + ai) + ')'),
      F('=IF(' + nm + '="","",COUNTIFS(' + kvA + ',' + crit + ',' + tenA + ',"<>"))'),
      F('=' + ifs('MINIFS', giaA)),
      F('=' + ifs('AVERAGEIFS', giaA)),
      F('=' + ifs('MAXIFS', giaA)),
      F('=IF(N($CE' + ar + ')=0,"",IFERROR(AVERAGEIFS(' + ppmA + ',' + kvA + ',' + crit + ',' + ppmA + ',">0"),""))')
    ]);
  }
  sh.getRange('CR1').setFormula(F('=IFERROR(SORT(UNIQUE(FILTER(' + kvA + ',' + kvA + '<>""))),"")'));   // danh sách khu vực · phường (cột ẩn CR)
  sh.getRange(AR0, 82, ARM, 6).setFormulas(stA);   // CD:CI = khu vực | số căn | thấp nhất | trung bình | cao nhất | k/m²
  var rngCD = 'CD' + AR0 + ':CD' + (AR0 + ARM - 1), rngCE = 'CE' + AR0 + ':CE' + (AR0 + ARM - 1);
  sh.getRange('CK' + AR0).setFormula(F('=IFERROR(SORT(FILTER(CD' + AR0 + ':CI' + (AR0 + ARM - 1) + ',' + rngCD + '<>"",' + rngCE + '<>"",' + rngCE + '>0),4,TRUE,2,FALSE,1,TRUE),"")'));
  var vA = [];
  for(var vi = 0; vi < ARN; vi++){
    var vr = AR0 + vi, k = '$CK' + vr;
    var dash = function(col){ return F('=IF(' + k + '="","",IF($' + col + vr + '="","–",$' + col + vr + '))'); };
    vA.push([
      F('=IF(' + k + '="","",' + (vi + 1) + ')'),
      F('=IF(' + k + '="","",' + k + ')'),
      F('=IF(' + k + '="","",$CL' + vr + ')'),
      dash('CM'), dash('CN'), dash('CO'), dash('CP'),
      F('=IF(' + k + '="","",IFERROR(IF($CN' + vr + '="","–",$CN' + vr + '/$E$' + ART + '-1),"–"))')
    ]);
  }
  sh.getRange(AR0, 1, ARN, 8).setFormulas(vA);
  sh.getRange('A'+ART+':B'+ART).merge().setValue('Tất cả khu vực');
  sh.getRange('C'+ART).setFormula(F('=COUNTA(Houses!C2:C)'));
  sh.getRange('D'+ART).setFormula(F('=IFERROR(IF(COUNTIF(Houses!G2:G,">0")=0,"–",MINIFS(Houses!G2:G,Houses!G2:G,">0")),"–")'));
  sh.getRange('E'+ART).setFormula(F('=IFERROR(AVERAGEIF(Houses!G2:G,">0"),"–")'));
  sh.getRange('F'+ART).setFormula(F('=IFERROR(IF(COUNTIF(Houses!G2:G,">0")=0,"–",MAX(Houses!G2:G)),"–")'));
  sh.getRange('G'+ART).setFormula(F('=IFERROR(AVERAGEIF(' + ppmA + ',">0"),"–")'));
  sh.getRange('H'+ART).setValue('–');
  var cntA = 'COUNTIF(' + rngCE + ',">0")';
  sh.getRange('A'+ARX+':H'+ARX).merge().setFormula(F('=IF(' + cntA + '>' + ARN + ',"… còn "&(' + cntA + '-' + ARN + ')&" khu vực / phường khác chưa hiển thị. ","")&"Tính trên mọi căn có nhập giá (kể cả căn đã loại). Xanh = rẻ hơn mức trung bình chung, đỏ = đắt hơn."'))
    .setFontStyle('italic').setFontColor('#5f6f6a').setFontSize(9).setVerticalAlignment('middle').setHorizontalAlignment('left');
  sh.setRowHeights(AR0, ARN, 26); sh.setRowHeight(ART,30); sh.setRowHeight(ARX,22); sh.setRowHeight(ARX+1,14);
  sh.getRange('A'+AR0+':H'+ART).setVerticalAlignment('middle').setFontSize(10);
  sh.getRange('A'+AR0+':A'+ART).setHorizontalAlignment('center').setFontWeight('bold');
  sh.getRange('B'+AR0+':B'+ART).setHorizontalAlignment('left').setFontWeight('bold').setFontColor(GREEN).setWrap(true);
  sh.getRange('C'+AR0+':H'+ART).setHorizontalAlignment('center');
  sh.getRange('E'+AR0+':E'+(ART-1)).setFontWeight('bold');
  sh.getRange('C'+AR0+':C'+ART).setNumberFormat('0');
  sh.getRange('D'+AR0+':G'+ART).setNumberFormat('0.0');
  sh.getRange('H'+AR0+':H'+(ART-1)).setNumberFormat('+0%;-0%;0%');
  sh.getRange('A'+ART+':H'+ART).setBackground('#cfe6dc').setFontWeight('bold').setFontColor(GREEN)
    .setBorder(true,null,null,null,null,null,GREEN,SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sh.getRange('A'+ARH+':H'+(ART-1)).setBorder(null,null,true,null,null,true,LINE,SOLID);

  // Bước 2 (cột ẩn BD:CB): lọc rồi sắp xếp: trạng thái (chốt → loại) → khu vực → điểm cao trước
  sh.getRange(cl_(B2+1)+HD+':'+cl_(B2+26)+HD).setValues([['khuvuc','ten','diachi','link','sdt_sale','sale','chu','sdt_chu','trangthai','gia','dt','coc','hen','uu','nhuoc','checklist','diem','album','id','themluc','lienhe','thutu','ngaythem','ngaylienhe','ngayhen','phuong']]);
  sh.getRange(cl_(B2+1)+R0).setFormula(F('=IFERROR(SORT(FILTER(HSTACK(T'+R0+':AR'+R1+',AY'+R0+':AY'+R1+'),AS'+R0+':AS'+R1+'=1),22,TRUE,1,TRUE,17,FALSE),"")'));

  // Bước 3 (cột hiển thị A:P): đọc từ khối kết quả
  var kv2 = b2_(1), t2 = b2_(2), dc2 = b2_(3), lk2 = b2_(4), sdts2 = b2_(5), sale2 = b2_(6), chu2 = b2_(7), sdtc2 = b2_(8), tt2 = b2_(9),
      gia2 = b2_(10), dt2 = b2_(11), coc2 = b2_(12), uu2 = b2_(14), nh2 = b2_(15), ck2 = b2_(16), diem2 = b2_(17), al2 = b2_(18), hid2 = b2_(19),
      w2 = b2_(26), ord2 = b2_(22), dAdd2 = b2_(23), dLh2 = b2_(24), dHen2 = b2_(25);
  var ordCol = cl_(B2 + 22), prevOrd = ordCol + (R0 - 1) + ':' + ordCol + (R1 - 1);
  function dash_(rng){ return '=ARRAYFORMULA(IF('+t2+'="","",IF('+rng+'="","–",'+rng+')))'; }
  function contact_(nm, ph){
    return '=ARRAYFORMULA(IF('+t2+'="","",IF(('+nm+'="")*('+ph+'=""),"–",TRIM('+nm+'&IF(('+nm+'<>"")*('+ph+'<>"")," · ","")&'+ph+'))))';
  }
  function link_(u, label){ return '=ARRAYFORMULA(IF('+t2+'="","",IF('+u+'="","–",HYPERLINK('+u+',"'+label+'"))))'; }
  // Checklist: hiện x/y đạt; bấm vào mở trang bảng checklist theo form của căn đó (do Web app dựng). BC1 = link Web app.
  var ckLink = '=ARRAYFORMULA(IF('+t2+'="","",IF('+ck2+'="","–",IF($BC$1="",'+ck2+',HYPERLINK($BC$1&"?view=ck&id="&'+hid2+'&"&key='+encodeURIComponent(VIEW_KEY)+'",'+ck2+')))))';

  hdr_('A'+HD+':Q'+HD,['Trạng thái','Tên · địa chỉ','Khu vực / phường','Link tin','Sale / môi giới','Chủ nhà','Giá (triệu/tháng)','Diện tích (m²)','Điện / nước · Phí dịch vụ','Cọc (triệu)','Ngày thêm','Ngày liên hệ','Ngày hẹn xem','Ưu điểm / nhược điểm','Checklist (bấm để xem)','Điểm','Album ảnh']);
  sh.getRange('A'+CNT).setFormula(F('="Đang hiển thị "&COUNTIF('+passR+',1)&" / "&COUNTIF('+passR+',">=0")&" căn"'));
  sh.getRange('A'+CNT+':Q'+CNT).merge().setFontWeight('bold').setFontColor(GREEN).setFontSize(10).setHorizontalAlignment('left').setVerticalAlignment('middle');

  var SVC = cl_(COLS.indexOf('sv') + 1), UC = cl_(COLS.indexOf('u') + 1);
  function pick_(c){ return 'IFERROR(VLOOKUP('+hid2+',HSTACK(Houses!A2:A,Houses!'+c+'2:'+c+'),2,FALSE),"")'; }
  var uu_ = pick_(UC), sv_ = pick_(SVC);
  var feeF_ = '=ARRAYFORMULA(IF('+t2+'="","",IF(('+uu_+'="")*('+sv_+'=""),"–",TRIM(IF('+uu_+'="","","Điện / nước: "&'+uu_+')&IF(('+uu_+'<>"")*('+sv_+'<>""),CHAR(10),"")&IF('+sv_+'="","","Phí DV: "&'+sv_+')))))';
  var f = {
    A: '=ARRAYFORMULA(IF('+t2+'="","",IF((ROW('+t2+')>'+R0+')*('+ord2+'='+prevOrd+'),"",'
       + nest_(tt2, function(c){ return '"' + STICON[c] + '"'; }, '""') + '&'+tt2+'&CHAR(10)&"("&COUNTIF('+ord2+','+ord2+')&" căn)")))',
    B: '=ARRAYFORMULA(IF('+t2+'="","",'+t2+'&IF('+dc2+'="","",CHAR(10)&'+dc2+')))',
    C: '=ARRAYFORMULA(IF('+t2+'="","",IF('+kv2+'="",IF('+w2+'="","(chưa có khu vực)",'+w2+'),IF('+w2+'="",'+kv2+','+kv2+'&CHAR(10)&'+w2+'))))',
    D: link_(lk2,'🔗 Mở tin'),
    E: contact_(sale2,sdts2),
    F: contact_(chu2,sdtc2),
    G: dash_(gia2),
    H: dash_(dt2),
    J: dash_(coc2),
    K: dash_(dAdd2),
    L: dash_(dLh2),
    M: dash_(dHen2),
    N: '=ARRAYFORMULA(IF('+t2+'="","",TRIM(IF('+uu2+'="","","＋ "&'+uu2+')&IF(('+uu2+'<>"")*('+nh2+'<>""),CHAR(10),"")&IF('+nh2+'="","","－ "&'+nh2+'))))',
    O: ckLink,
    P: '=ARRAYFORMULA(IF('+t2+'="","",IF('+diem2+'="","chưa chấm",REPT("★",'+diem2+')&REPT("☆",5-'+diem2+'))))',
    Q: link_(al2,'📁 Mở album'),
    I: feeF_
  };
  for(var col in f) sh.getRange(col + R0).setFormula(F(f[col]));

  sh.getRange('A'+R0+':Q'+R1).setVerticalAlignment('middle').setFontSize(10);
  sh.getRange('A'+R0+':A'+R1).setFontWeight('bold').setHorizontalAlignment('center').setWrap(true);
  sh.getRange('B'+R0+':B'+R1).setFontWeight('bold').setWrap(true);
  sh.getRange('C'+R0+':C'+R1).setFontWeight('bold').setFontColor(GREEN).setWrap(true);
  ['E','F','I','N'].forEach(function(c){ sh.getRange(c+R0+':'+c+R1).setWrap(true); });
  ['D','G','H','J','K','L','M','O','P','Q'].forEach(function(c){ sh.getRange(c+R0+':'+c+R1).setHorizontalAlignment('center'); });
  sh.getRange('G'+R0+':G'+R1).setNumberFormat('0.0');
  sh.getRange('H'+R0+':H'+R1).setNumberFormat('0');
  sh.getRange('J'+R0+':J'+R1).setNumberFormat('0.0');
  sh.getRange('K'+R0+':M'+R1).setNumberFormat('dd/mm/yyyy');
  sh.getRange('O'+R0+':O'+R1).setFontWeight('bold');
  sh.getRange('P'+R0+':P'+R1).setFontColor('#d99a00').setFontSize(12);

  // Màu theo trạng thái (cột A, theo nhóm) + dải màu xen kẽ các cột còn lại
  var rules = ST.map(function(s){
    return SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(F('=$' + ordCol + R0 + '=' + (STORDER.indexOf(s[0]) + 1)))
      .setBackground(s[2]).setFontColor(s[3]).setBold(true).setRanges([sh.getRange('A'+R0+':A'+R1)]).build();
  });
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(F('=AND($B'+R0+'<>"",ISEVEN(ROW()))')).setBackground('#f4f8f6')
    .setRanges([sh.getRange('B'+R0+':Q'+R1)]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied(F('=AND($B'+AR0+'<>"",ISEVEN(ROW()))')).setBackground('#f4f8f6').setRanges([sh.getRange('A'+AR0+':H'+(ART-1))]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied(F('=AND(ISNUMBER($H'+AR0+'),$H'+AR0+'<0)')).setFontColor('#0f6b57').setBold(true).setRanges([sh.getRange('H'+AR0+':H'+(ART-1))]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied(F('=AND(ISNUMBER($H'+AR0+'),$H'+AR0+'>0)')).setFontColor('#b3261e').setBold(true).setRanges([sh.getRange('H'+AR0+':H'+(ART-1))]).build());
  sh.setConditionalFormatRules(rules);

  sh.hideColumns(20,77);   // cột kỹ thuật T:CR
  ss.setActiveSheet(sh); ss.moveActiveSheet(1);
  try{ lock_(sh); }catch(e){}
}

/** Khóa tab Tổng hợp: chỉ chủ sheet (và tài khoản chạy script) sửa được, người khác chỉ xem. */
function lock_(sh){
  sh.getProtections(SpreadsheetApp.ProtectionType.SHEET).forEach(function(p){ p.remove(); });
  var p = sh.protect().setDescription('Tab tổng hợp chỉ xem (tự động cập nhật từ sheet Houses)');
  var me = '';
  try{ me = Session.getEffectiveUser().getEmail(); }catch(e){}
  try{ p.setUnprotectedRanges([sh.getRange('A' + SUM_FR + ':F' + SUM_FR)]); }catch(e){}   // cho người có quyền sửa dùng ô lọc
  try{
    p.removeEditors(p.getEditors().filter(function(u){ return !me || u.getEmail() !== me; }));
  }catch(e){}
  try{ if(p.canDomainEdit()) p.setDomainEdit(false); }catch(e){}
}

function rowToItem_(r, lite){
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
  return lite ? liteOf_(o) : o;
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
  id = String(id == null ? '' : id);
  var n = sh.getLastRow() - 1;
  if(!id || n < 1) return -1;
  var ids = sh.getRange(2,1,n,1).getValues(), t = id.trim(), loose = -1;
  for(var i=0;i<ids.length;i++){
    var v = String(ids[i][0]);
    if(v === id) return i + 2;
    if(loose < 0 && t && v.trim() === t) loose = i + 2;
  }
  return loose;
}
/** Bản checklist app gửi lên: đầy đủ (có c) -> thay hẳn; bản nhẹ (không có c, v) -> chỉ cập nhật ghi chú / ảnh trên bản đang lưu;
 *  không gửi -> giữ nguyên bản đang lưu. Nhờ vậy lưu căn từ danh sách (bản nhẹ) không bao giờ làm mất chi tiết checklist. */
function mergeCk_(it, oldCk){
  var cur = null, n = it.ck;
  try{ cur = oldCk ? JSON.parse(oldCk) : null; }catch(e){}
  if(!n){ it.ck = cur; return; }
  if(n.c){ cleanCk_(it); return; }
  var m = cur || {}, E = {nt: '', vi: [], im: [], vu: '', du: ''};
  Object.keys(E).forEach(function(k){
    var nv = n[k] === undefined ? E[k] : n[k], ov = m[k] === undefined ? E[k] : m[k];
    if(JSON.stringify(nv) !== JSON.stringify(ov)) m[k] = nv;
  });
  it.ck = (cur || Object.keys(m).length) ? m : null;
}
/** Bỏ các trường chỉ dùng khi truyền (tóm tắt s, mã h) khỏi checklist trước khi ghi vào Sheet. */
function cleanCk_(it){ if(it.ck && typeof it.ck === 'object'){ delete it.ck.s; delete it.ck.h; delete it.ck.ts; } }
/** opts.restore = true: khôi phục từ bản sao lưu, chỉ ghi Sheet, không đổi tên / chuyển thư mục ảnh trên Drive.
 *  opts.onlyNew = true: bỏ qua căn đã có trong Sheet (chỉ thêm căn còn thiếu).
 *  Trả về {ids, lite: bản nhẹ của các căn đã ghi, ch: {id: mã bản checklist}} để app cập nhật mà không phải tải lại cả danh sách. */
function saveMany_(sh, items, opts){
  opts = opts || {};
  var seen = {}, list = [], res = {ids: [], lite: [], ch: {}};
  (items || []).forEach(function(it){ if(it && it.id && it.n){ seen[String(it.id)] = it; } });
  for(var k in seen) list.push(seen[k]);
  if(!list.length) return res;
  var last = sh.getLastRow(), map = {}, names = {}, all = null;
  if(last > 1){
    sh.getRange(2,1,last-1,1).getValues().forEach(function(r,i){ map[String(r[0])] = i + 2; });   // chỉ đọc cột ID (không đọc cả bảng)
    if(!opts.restore) sh.getRange(2,IX.n+1,last-1,1).getValues().forEach(function(r){          // số căn đang dùng mỗi tên thư mục (để biết thư mục có dùng chung không)
      if(String(r[0] || '').trim()){ var fk = folderName_(r[0]); names[fk] = (names[fk] || 0) + 1; }
    });
  }
  function rowOf_(row){   // nhiều căn một lượt (khôi phục) thì đọc cả bảng một lần, ít căn thì chỉ đọc đúng dòng
    if(list.length > 8){ all = all || sh.getRange(2,1,last-1,COLS.length).getValues(); return all[row-2]; }
    return sh.getRange(row,1,1,COLS.length).getValues()[0];
  }
  function done_(it){
    var id = String(it.id);
    res.ids.push(id); res.lite.push(liteOf_(it));
    if(it.ck) res.ch[id] = ckHash_(it.ck);
  }
  var links = [], add = [];
  list.forEach(function(it){
    var row = map[String(it.id)];
    if(row && opts.onlyNew) return;
    if(row){
      var old = rowOf_(row);
      if(!opts.restore){
        mergeCk_(it, old[IX.ck]);
        var on = String(old[IX.n] || ''), oldLoc = {d: String(old[IX.d] || ''), w: String(old[IX.w] || ''), a: String(old[IX.a] || '')};
        if(on && folderName_(on) !== folderName_(it.n)){
          var shared = (names[folderName_(on)] || 0) > 1;
          try{ var nu = renameHouseFolder_(on, it.n, String(old[IX.dr] || '') || it.dr, it.dr, it.id, shared, oldLoc, locOf_(it)); if(nu) it.dr = nu; }catch(e){}
          try{ var rv = renameViewFolder_(on, it.n, it.ck && it.ck.vu, it.id, shared, oldLoc, locOf_(it)); if(rv){ it.ck = it.ck || {}; it.ck.vu = rv.vu; if(rv.du) it.ck.du = rv.du; } }catch(e){}
        }
        if(!sameLoc_(oldLoc, locOf_(it))){
          try{ relocate_(it); }catch(e){}            // đổi khu vực / phường -> chuyển thư mục ảnh sang chỗ mới (link thư mục giữ nguyên)
        }
      }
      var vals = itemToRow_(it);
      sh.getRange(row,1,1,COLS.length).setValues([vals]);   // dòng đã có định dạng từ trước nên không đặt lại định dạng mỗi lần lưu
      links.push([row, it.dr]); done_(it);
    }else{
      try{ if(!opts.restore && (it.dr || (it.ck && it.ck.vu))) relocate_(it); }catch(e){}   // căn mới đã tải ảnh trước khi nhập đủ khu vực / địa chỉ
      cleanCk_(it);
      add.push(it);
    }
  });
  if(add.length){
    var rows = add.map(itemToRow_), start = Math.max(last,1) + 1, need = start + add.length - 1;
    if(need > sh.getMaxRows()) sh.insertRowsAfter(sh.getMaxRows(), need - sh.getMaxRows() + 100);
    sh.getRange(start,1,add.length,COLS.length)
      .setNumberFormats(add.map(function(){ return FMT; }))
      .setValues(rows);
    add.forEach(function(it,i){ links.push([start + i, it.dr]); done_(it); });
  }
  links.forEach(function(l){ linkCell_(sh, l[0], l[1]); });
  return res;
}


/* ===== Sao lưu trên Drive =====
   Mỗi bản là một file JSON trong thư mục "Sao lưu nhà thuê" (cùng chỗ với "Ảnh nhà"), giữ BK_KEEP bản mới nhất.
   Khôi phục chỉ ghi lại các dòng trong Sheet, không bao giờ xóa căn và không đụng tới thư mục ảnh. */
var BK_FOLDER_NAME = 'Sao lưu nhà thuê', BK_KEEP = 30;
function backupFolder_(){
  return rootFolder_('BKROOT', function(){
    var ps = folder_().getParents(), parent = ps.hasNext() ? ps.next() : DriveApp.getRootFolder();
    return childByName_(parent, BK_FOLDER_NAME) || parent.createFolder(BK_FOLDER_NAME);
  });
}
function allItems_(){
  var sh = sheet_(), n = sh.getLastRow() - 1;
  return n > 0 ? sh.getRange(2,1,n,COLS.length).getValues().map(function(r){ return rowToItem_(r); }).filter(function(x){ return x.id; }) : [];
}
/** Tạo một bản sao lưu toàn bộ dữ liệu các căn. label: chữ ngắn gắn vào tên file (vd 'truoc-khoi-phuc'). */
function makeBackup_(label){
  var items = allItems_(), at = new Date();
  var stamp = Utilities.formatDate(at, Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm-ss');
  var lb = String(label || '').toLowerCase().replace(/[^a-z0-9\-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30);
  var name = 'nha-thue_' + stamp + (lb ? '_' + lb : '') + '.json';
  var payload = {app: 'nha-thue', v: 2, at: at.toISOString(), count: items.length, items: items};
  var f = backupFolder_().createFile(name, JSON.stringify(payload), 'application/json');
  f.setDescription(String(items.length));
  pruneBackups_();
  return {id: f.getId(), name: name, at: at.toISOString(), count: items.length};
}
function backupFiles_(){
  var it = backupFolder_().getFiles(), out = [];
  while(it.hasNext()){
    var f = it.next(), nm = f.getName();
    if(f.isTrashed() || !/^nha-thue_.*\.json$/.test(nm)) continue;
    var parts = nm.replace(/\.json$/, '').split('_');
    out.push({id: f.getId(), name: nm, at: f.getDateCreated().toISOString(), count: parseInt(f.getDescription(), 10) || 0, label: parts.slice(3).join(' '), size: f.getSize()});
  }
  out.sort(function(a, b){ return a.at < b.at ? 1 : (a.at > b.at ? -1 : 0); });
  return out;
}
function pruneBackups_(){
  try{
    var it = backupFolder_().getFiles(), all = [];
    while(it.hasNext()){
      var f = it.next(), nm = f.getName();
      if(/^nha-thue_.*\.json$/.test(nm) && !f.isTrashed()) all.push({f: f, nm: nm});
    }
    all.sort(function(a, b){ return a.nm < b.nm ? 1 : (a.nm > b.nm ? -1 : 0); });   // tên chứa yyyy-MM-dd_HH-mm-ss nên xếp theo tên = mới nhất trước
    all.slice(BK_KEEP).forEach(function(x){ x.f.setTrashed(true); });
  }catch(e){}
}
/** Đọc nội dung một bản sao lưu (chỉ file nằm trong thư mục sao lưu). */
function getBackup_(id){
  var f = DriveApp.getFileById(String(id || '')), root = backupFolder_(), ok = false, ps = f.getParents();
  while(ps.hasNext()){ if(ps.next().getId() === root.getId()){ ok = true; break; } }
  if(!ok || f.isTrashed()) throw new Error('Không tìm thấy bản sao lưu này.');
  var d = JSON.parse(f.getBlob().getDataAsString('UTF-8'));
  var items = Array.isArray(d) ? d : (d && d.items);
  if(!Array.isArray(items)) throw new Error('File sao lưu không đúng định dạng.');
  return {items: items, at: d && d.at || f.getDateCreated().toISOString(), name: f.getName()};
}
/** Sao lưu tự động hằng ngày (cài bằng batLichSaoLuu). */
function autoBackup(){ makeBackup_('tu-dong'); }
/** CHẠY MỘT LẦN để bật sao lưu tự động mỗi ngày lúc 3 giờ sáng (chạy lại sẽ thay lịch cũ). Cần cấp thêm quyền quản lý trigger. */
function batLichSaoLuu(){
  ScriptApp.getProjectTriggers().forEach(function(t){ if(t.getHandlerFunction() === 'autoBackup') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('autoBackup').timeBased().everyDays(1).atHour(3).create();
  try{ SpreadsheetApp.getActive().toast('Đã bật sao lưu tự động mỗi ngày (giữ ' + BK_KEEP + ' bản gần nhất).', 'Sao lưu', 8); }catch(e){}
}

/** Link Web app (…/exec) để ô Checklist ở tab Tổng hợp mở trang bảng theo form. Ưu tiên WEBAPP_URL nếu bạn tự dán. */
var WEBAPP_URL = '';
function appUrl_(){
  var p = PropertiesService.getScriptProperties(), u = WEBAPP_URL || p.getProperty('APPURL') || '';
  if(!u){ try{ u = ScriptApp.getService().getUrl() || ''; }catch(e){} }
  return u.indexOf('/exec') > 0 ? u : '';   // không dùng link /dev
}
/** Mỗi lần app gọi doGet (chạy trong bản deploy): nhớ link /exec thật và cập nhật ô BC1 nếu đổi. */
function syncUrl_(){
  try{
    var cache = CacheService.getScriptCache();
    if(cache.get('urlsync')) return;
    var u = WEBAPP_URL || ScriptApp.getService().getUrl() || '', p = PropertiesService.getScriptProperties();
    if(u.indexOf('/exec') > 0){
      if(p.getProperty('APPURL') !== u) p.setProperty('APPURL', u);
      var s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SUMMARY);
      if(s && String(s.getRange('BC1').getValue()) !== u) s.getRange('BC1').setValue(u);   // ô trống (vd sau khi chạy setup) hoặc sai link thì điền lại
    }
    cache.put('urlsync', '1', 3600);
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
  function pics_(arr){ return (Array.isArray(arr) ? arr : []).map(function(id){
    id = String(id).replace(/[^\w-]/g,'');
    return '<a href="https://drive.google.com/file/d/' + id + '/view" target="_blank"><img src="https://lh3.googleusercontent.com/d/' + id + '=w300"></a>';
  }).join(''); }
  var ph = pics_(ck.im), pv = pics_(ck.vi);
  return '<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>'
    + 'body{font:14px/1.45 system-ui,Arial,sans-serif;margin:0;background:#f4f8f6;color:#1d2b27}'
    + 'header{background:' + GREEN + ';color:#fff;padding:14px 16px}header h1{margin:0;font-size:18px}header p{margin:4px 0 0;opacity:.9}'
    + 'main{padding:12px 16px 28px;max-width:760px;margin:auto}h3{margin:18px 0 6px;color:' + GREEN + ';font-size:15px}h3 span{color:#5f6f6a;font-weight:400}'
    + 'table{width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden}td{padding:7px 10px;border-bottom:1px solid #e3ebe7;vertical-align:top}'
    + 'td:last-child{white-space:nowrap;text-align:right}tr.f td{background:#eef6f2}.ok{color:#0f6b57;font-weight:700}.bad{color:#c0392b;font-weight:700}.no{color:#8a9691}'
    + '.nt{background:#fff;padding:10px;border-radius:8px}.ph img{height:90px;margin:4px 6px 0 0;border-radius:6px}'
    + '</style></head><body><header><h1>' + hesc_(it.n) + '</h1><p>' + hesc_([it.a, it.w, it.d].filter(Boolean).join(', ')) + '</p>'
    + '<p>Checklist: <b>' + good + '/' + total + ' đạt</b>' + (bad ? ' · ' + bad + ' lỗi' : '') + '</p></header><main>'
    + body + note + (pv ? '<h3>Ảnh đi xem</h3><div class="ph">' + pv + '</div>' : '') + (ph ? '<h3>Ảnh hư hỏng</h3><div class="ph">' + ph + '</div>' : '') + '</main></body></html>';
}

function msg_(t){ return HtmlService.createHtmlOutput('<p style="font:16px sans-serif;padding:20px">' + t + '</p>'); }
/** GET: ?key=…[&since=<phiên bản>] danh sách bản nhẹ (since trùng thì chỉ trả same) | &action=ck&id=… chi tiết checklist một căn | &action=export toàn bộ dữ liệu đầy đủ | ?view=ck&id=… trang checklist. */
function doGet(e){
  try{ return doGet_(e); }
  catch(err){
    var m = 'Lỗi máy chủ: ' + (err && err.message ? err.message : err) + (err && err.stack ? ' | ' + String(err.stack).split('\n').slice(0, 3).join(' ; ') : '');
    if(e && e.parameter && e.parameter.view === 'ck') return msg_(hesc_(m));
    return out_({ok:false, error:m});
  }
}
function doGet_(e){
  var p = e.parameter || {}, r = role_(p.key);
  if(p.view === 'ck'){
    if(!r) return msg_('Sai mã truy cập. Link ở tab Tổng hợp ghi sẵn mã lúc dựng bảng; nếu bạn đã đổi EDIT_KEY / VIEW_KEY thì chạy hàm taoLaiTongHop() trong Apps Script một lần để cập nhật lại link.');
    var it0 = itemFull_(p.id);
    if(!it0) return msg_('Không tìm thấy căn này.');
    return HtmlService.createHtmlOutput(ckHtml_(it0)).setTitle('Checklist · ' + it0.n)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
  if(!r) return out_({ok:false,error:'Sai mã truy cập.'});
  if(p.action === 'ck'){
    var it1 = itemFull_(p.id);
    if(!it1) return out_({ok:false,error:'Không tìm thấy căn này.'});
    return out_({ok:true, ck: it1.ck || null, h: it1.ck ? ckHash_(it1.ck) : ''});
  }
  if(p.action === 'export') return out_({ok:true, items: allItems_()});
  syncUrl_();
  var v = ver_();
  if(p.since && p.since === v) return out_({ok:true, role:r, same:1, ver:v});
  return raw_('{"ok":true,"role":"' + r + '","ver":"' + v + '","items":' + listJson_(v) + '}');
}

/** Khu vực / phường / địa chỉ app gửi kèm khi tải ảnh (app cũ không gửi -> undefined). */
function locIn_(b){ return (b.area === undefined && b.ward === undefined && b.addr === undefined) ? undefined : {d: b.area, w: b.ward, a: b.addr}; }
function doPost(e){
  var lock = null, locked = false;
  try{
    var b = JSON.parse(e.postData.contents);
    if(role_(b.key) !== 'edit') return out_({ok:false,error:'Bạn không có quyền sửa.'});

    // Tải ảnh lên Drive: không đụng tới Sheet, không khóa (để nhiều ảnh tải song song).
    // Chỉ khi client gửi lại (retry) mới dò trùng tên để không tạo file đôi.
    if(b.action === 'upload'){
      if(!/^image\//i.test(b.mime || 'image/jpeg')) return out_({ok:false,error:'Chỉ nhận file ảnh.'});
      if(String(b.data || '').length > 14000000) return out_({ok:false,error:'Ảnh quá lớn (tối đa khoảng 10 MB).'});
      var blob = Utilities.newBlob(Utilities.base64Decode(b.data), b.mime || 'image/jpeg', b.name || 'anh.jpg');
      var fol = targetFolder_(b.kind, b.folder, b.hid, b.fid, locIn_(b)), fid = '';
      if(b.retry && b.name){ var ex = fol.getFilesByName(b.name); if(ex.hasNext()) fid = ex.next().getId(); }
      if(!fid) fid = fol.createFile(blob).getId();
      if(b.kind === 'view' || b.kind === 'damage') shareViewRoot_(); else shareRoot_();
      return out_({ok:true,id:fid,url:folderUrl_(fol)});
    }
    if(b.action === 'trash'){ return out_({ok:true,n:trashFiles_(b.ids)}); }
    if(b.action === 'find'){
      var fol2 = targetFolder_(b.kind, b.folder, b.hid, b.fid, locIn_(b)), f2 = fol2.getFilesByName(b.name || '');
      return out_({ok:true,id:f2.hasNext() ? f2.next().getId() : '',url:folderUrl_(fol2)});
    }

    // Sao lưu: không giữ khóa Sheet (chỉ đọc Sheet và ghi file trên Drive)
    if(b.action === 'backup'){ return out_({ok:true, backup:makeBackup_(b.label)}); }
    if(b.action === 'backups'){ return out_({ok:true, list:backupFiles_()}); }
    if(b.action === 'backupGet'){ var bg = getBackup_(b.id); return out_({ok:true, items:bg.items, at:bg.at, name:bg.name}); }

    // Ghi Sheet: tryLock không ném lỗi, hết giờ thì trả thông báo dễ hiểu
    lock = LockService.getScriptLock();
    locked = lock.tryLock(30000);
    if(!locked) return out_({ok:false,error:'Máy chủ đang bận, bấm lưu lại sau vài giây.'});

    var sh = sheet_(), prev = ver_(), res;
    if(b.action === 'save' || b.action === 'saveMany'){
      res = saveMany_(sh, b.action === 'save' ? [b.item] : b.items);
      bump_();
      return out_({ok:true, prev:prev, ver:ver_(), it:res.lite, ch:res.ch});
    }
    if(b.action === 'restoreItems'){
      saveMany_(sh, b.items, {restore: true, onlyNew: b.mode !== 'all'});
      bump_();
      return out_({ok:true, n:(b.items || []).length, prev:prev, ver:ver_()});
    }
    if(b.action === 'delete'){
      var row = findRow_(sh, b.id);
      if(row > 0){ try{ trashHouseFolders_(sh, row); }catch(e){} sh.deleteRow(row); bump_(); }
      return out_({ok:true, prev:prev, ver:ver_()});
    }
    return out_({ok:false,error:'Hành động không hợp lệ.'});
  }catch(err){
    return out_({ok:false,error:String(err)});
  }finally{
    if(locked){ try{ lock.releaseLock(); }catch(e2){} }
  }
}
