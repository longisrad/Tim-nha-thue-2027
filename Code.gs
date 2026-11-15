/**
 * Backend app "Tìm nhà thuê": dữ liệu -> Google Sheets, ảnh -> Google Drive.
 * ĐỔI HAI MÃ DƯỚI ĐÂY. Sau khi dán code mới: chạy lại hàm setup() một lần,
 * rồi Deploy > Manage deployments > Edit > New version.
 */
var EDIT_KEY = '17071993@';   // xem + sửa + tải ảnh
var VIEW_KEY = '17071993@';   // chỉ xem

var SHEET = 'Houses';
var SUMMARY = 'Tổng hợp';
var FOLDER_NAME = 'Nha-thue-anh';
var GREEN = '#0f6b57';

var COLS = ['id','t','n','a','d','st','p','ar','dp','u','ph','on','sn','sp','mp','dr','vd','lh','lk','pr','co','rt','im','cp','cn','ck','cf'];
var HEAD = ['ID','Thêm lúc','Tên / mã','Địa chỉ','Khu vực','Trạng thái','Giá (triệu/tháng)','Diện tích (m²)','Cọc (triệu)','Điện / nước','SĐT chủ nhà','Tên chủ nhà','Tên sale / môi giới','SĐT sale','Link bản đồ','Album ảnh','Ngày hẹn xem','Ngày liên hệ','Tin đăng','Ưu điểm','Nhược điểm','Điểm (1–5)','Ảnh (mã Drive)','Checklist (đạt / tổng)','Ghi chú & hư hỏng khi xem','Checklist (dữ liệu)','Checklist (theo form)'];
var WIDTH = [60,90,220,220,120,110,110,100,90,110,115,130,140,115,160,160,115,115,160,240,240,80,160,120,240,160,340];
var NUM = {t:1,p:1,ar:1,dp:1,rt:1};
var FMT = COLS.map(function(c){ return (c==='p'||c==='dp') ? '#,##0.0' : (c==='ar'||c==='rt'||c==='t') ? '0' : '@'; });

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
  return sh;
}
function folder_(){
  var p = PropertiesService.getScriptProperties(), id = p.getProperty('FOLDER');
  if(id){ try{ return DriveApp.getFolderById(id); }catch(e){} }
  var f = DriveApp.createFolder(FOLDER_NAME);
  p.setProperty('FOLDER', f.getId());
  return f;
}

/** Chạy hàm này một lần (và chạy lại mỗi khi muốn dựng lại giao diện bảng). Không xóa dữ liệu. */
function setup(){
  var sh = sheet_();
  format_(sh);
  backfillCf_(sh);
  folder_();
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
  sh.getRange(1,1,sh.getMaxRows(),sh.getMaxColumns()).breakApart();
  sh.clear(); sh.clearConditionalFormatRules();
  sh.getCharts().forEach(function(c){ sh.removeChart(c); });
  if(sh.getMaxColumns() < 50) sh.insertColumnsAfter(sh.getMaxColumns(), 50 - sh.getMaxColumns());
  if(sh.getMaxRows() < 350) sh.insertRowsAfter(sh.getMaxRows(), 350 - sh.getMaxRows());
  sh.showColumns(1, sh.getMaxColumns());
  var SEMI = semi_(sh);
  var F = function(x){ return fx_(x,SEMI); };
  var LINE = '#d5ddd8', SOLID = SpreadsheetApp.BorderStyle.SOLID;
  sh.setHiddenGridlines(true);
  sh.setTabColor('#1d5fa8');
  [120,220,110,110,110,110,120,110,180,180,100,280,240,340].forEach(function(w,i){ sh.setColumnWidth(i+1,w); });
  sh.getRange('A1:N350').setFontSize(10).setVerticalAlignment('middle');

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

  // Theo khu vực
  sec_('A17:H17','📍 Theo khu vực');
  sh.setRowHeight(17,30); sh.setRowHeight(18,32);
  hdr_('A18:G18',['Khu vực','Số căn','Giá TB (triệu)','Giá thấp nhất','Giá cao nhất','Điểm cao nhất','Điểm TB']);
  // QUERY vào cột ẩn AM:AS để căn chưa nhập khu vực vẫn được tính (nhóm "(chưa có khu vực)")
  sh.getRange('AM19').setFormula(F('=IFERROR(QUERY(Houses!A2:Z,"select E, count(C), avg(G), min(G), max(G), max(V), avg(V) where C is not null group by E order by E",0),"")'));
  var AR_ = function(c){ return c + '19:' + c + '38'; };
  sh.getRange('A19').setFormula(F('=ARRAYFORMULA(IF('+AR_('AN')+'="","",IF('+AR_('AM')+'="","(chưa có khu vực)",'+AR_('AM')+')))'));
  sh.getRange('B19').setFormula(F('=ARRAYFORMULA(IF('+AR_('AN')+'="","",'+AR_('AN')+'))'));
  [['C','AO'],['D','AP'],['E','AQ'],['F','AR'],['G','AS']].forEach(function(p){
    sh.getRange(p[0]+'19').setFormula(F('=ARRAYFORMULA(IF('+AR_('AN')+'="","",IF('+AR_(p[1])+'="","–",'+AR_(p[1])+')))'));
  });
  sh.getRange('A19:G38').setHorizontalAlignment('center');
  sh.getRange('A19:A38').setFontWeight('bold').setFontColor(GREEN).setHorizontalAlignment('left');
  sh.getRange('B19:B38').setNumberFormat('0');
  sh.getRange('C19:E38').setNumberFormat('0.0');
  sh.getRange('F19:F38').setNumberFormat('0');
  sh.getRange('G19:G38').setNumberFormat('0.0');
  sh.getRange('A39:G39').setBackground('#e6f0eb').setFontWeight('bold').setHorizontalAlignment('center')
    .setBorder(true,null,null,null,null,null,GREEN,SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sh.getRange('A39').setValue('Tất cả').setHorizontalAlignment('left').setFontColor(GREEN);
  [['B39','=COUNTA(Houses!C2:C)'],
   ['C39','=IFERROR(ROUND(AVERAGE(Houses!G2:G),1),"–")'],
   ['D39','=IF(COUNT(Houses!G2:G)=0,"–",MIN(Houses!G2:G))'],
   ['E39','=IF(COUNT(Houses!G2:G)=0,"–",MAX(Houses!G2:G))'],
   ['F39','=IF(COUNT(Houses!V2:V)=0,"–",MAX(Houses!V2:V))'],
   ['G39','=IFERROR(ROUND(AVERAGE(Houses!V2:V),1),"–")']
  ].forEach(function(p){ sh.getRange(p[0]).setFormula(F(p[1])); });
  sh.getRange('B39').setNumberFormat('0');
  sh.getRange('C39:E39').setNumberFormat('0.0');
  sh.getRange('F39').setNumberFormat('0');
  sh.getRange('G39').setNumberFormat('0.0');

  // Chi tiết từng căn: QUERY vào cột ẩn T:AK, các cột A:N hiển thị gọn gàng từ đó
  var R0 = 43, R1 = 342;
  function R_(c){ return c + R0 + ':' + c + R1; }
  var hk=R_('T'), ten=R_('U'), dc=R_('V'), tt=R_('W'), gia=R_('X'), dt=R_('Y'), coc=R_('Z'),
      sdtc=R_('AA'), chu=R_('AB'), sale=R_('AC'), sdts=R_('AD'), hen=R_('AE'), diem=R_('AF'),
      ck=R_('AG'), uu=R_('AH'), nh=R_('AI'), gc=R_('AJ'), cf=R_('AK');
  function dash_(rng){ return '=ARRAYFORMULA(IF('+ten+'="","",IF('+rng+'="","–",'+rng+')))'; }
  function contact_(nm, ph){
    return '=ARRAYFORMULA(IF('+ten+'="","",IF(('+nm+'="")*('+ph+'="")," –",TRIM('+nm+'&IF(('+nm+'<>"")*('+ph+'<>"")," · ","")&'+ph+'))))';
  }

  sec_('A41:N41','📋 Chi tiết từng căn (nhóm theo khu vực, điểm cao xếp trước)');
  sh.setRowHeight(41,30); sh.setRowHeight(42,40);
  hdr_('A42:N42',['Khu vực','Căn (tên · địa chỉ)','Trạng thái','Giá (triệu/tháng)','Diện tích (m²)','Cọc (triệu)','Điểm','Checklist','Chủ nhà','Sale / môi giới','Ngày hẹn xem','Ưu điểm / nhược điểm','Ghi chú & hư hỏng','Checklist (theo form)']);
  sh.getRange('T42:AK42').setValues([['khuvuc','ten','diachi','trangthai','gia','dt','coc','sdt_chu','chu','sale','sdt_sale','hen','diem','checklist','uu','nhuoc','ghichu','cf']]);
  sh.getRange('T43').setFormula(F('=IFERROR(QUERY(Houses!A2:AA,"select E, C, D, F, G, H, I, K, L, M, N, Q, V, X, T, U, Y, AA where C is not null order by E, V desc",0),"")'));

  var f = {
    A: '=ARRAYFORMULA(IF('+ten+'="","",IF((ROW('+ten+')>'+R0+')*('+hk+'=T'+(R0-1)+':T'+(R1-1)+'),"",IF('+hk+'="","(chưa có khu vực)",'+hk+'))))',
    B: '=ARRAYFORMULA(IF('+ten+'="","",'+ten+'&IF('+dc+'="","",CHAR(10)&'+dc+')))',
    C: '=ARRAYFORMULA(IF('+ten+'="","",'+tt+'))',
    D: dash_(gia),
    E: dash_(dt),
    F: dash_(coc),
    G: '=ARRAYFORMULA(IF('+ten+'="","",IF('+diem+'="","chưa chấm",REPT("★",'+diem+')&REPT("☆",5-'+diem+'))))',
    H: dash_(ck),
    I: contact_(chu,sdtc),
    J: contact_(sale,sdts),
    K: '=ARRAYFORMULA(IF('+ten+'="","",IF('+hen+'="","–",IFERROR(DATEVALUE('+hen+'),'+hen+'))))',
    L: '=ARRAYFORMULA(IF('+ten+'="","",TRIM(IF('+uu+'="","","＋ "&'+uu+')&IF(('+uu+'<>"")*('+nh+'<>""),CHAR(10),"")&IF('+nh+'="","","－ "&'+nh+'))))',
    M: '=ARRAYFORMULA(IF('+ten+'="","",IF('+gc+'="","",'+gc+')))',
    N: '=ARRAYFORMULA(IF('+ten+'="","",IF('+cf+'="","",'+cf+')))'
  };
  for(var col in f) sh.getRange(col + R0).setFormula(F(f[col]));

  var body = sh.getRange('A'+R0+':N'+R1);
  body.setVerticalAlignment('middle').setFontSize(10);
  sh.getRange('A'+R0+':A'+R1).setFontWeight('bold').setFontColor(GREEN);
  sh.getRange('B'+R0+':B'+R1).setFontWeight('bold').setWrap(true);
  ['I','J','L','M','N'].forEach(function(c){ sh.getRange(c+R0+':'+c+R1).setWrap(true); });
  sh.getRange('N'+R0+':N'+R1).setVerticalAlignment('top').setFontSize(9);
  ['C','D','E','F','G','H','K'].forEach(function(c){ sh.getRange(c+R0+':'+c+R1).setHorizontalAlignment('center'); });
  sh.getRange('D'+R0+':D'+R1).setNumberFormat('0.0');
  sh.getRange('E'+R0+':E'+R1).setNumberFormat('0');
  sh.getRange('F'+R0+':F'+R1).setNumberFormat('0.0');
  sh.getRange('G'+R0+':G'+R1).setFontColor('#d99a00').setFontSize(12);
  sh.getRange('K'+R0+':K'+R1).setNumberFormat('dd/mm/yyyy');

  // Màu trạng thái, dải màu xen kẽ, thang màu điểm
  var rules = ST.map(function(s){
    return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(s[1])
      .setBackground(s[2]).setFontColor(s[3]).setBold(true).setRanges([sh.getRange('C'+R0+':C'+R1)]).build();
  });
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(F('=AND($B'+R0+'<>"",ISEVEN(ROW()))')).setBackground('#f4f8f6')
    .setRanges([sh.getRange('A'+R0+':N'+R1)]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(F('=AND($A19<>"",ISEVEN(ROW()))')).setBackground('#f4f8f6')
    .setRanges([sh.getRange('A19:G38')]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .setGradientMinpoint('#ffffff').setGradientMaxpoint('#8fd3bc')
    .setRanges([sh.getRange('G19:G38')]).build());
  sh.setConditionalFormatRules(rules);

  sh.hideColumns(20,31);   // cột kỹ thuật T:AX
  ss.setActiveSheet(sh); ss.moveActiveSheet(1);
  try{ lock_(sh); }catch(e){}
}

/** Khóa tab Tổng hợp: chỉ chủ sheet (và tài khoản chạy script) sửa được, người khác chỉ xem. */
function lock_(sh){
  sh.getProtections(SpreadsheetApp.ProtectionType.SHEET).forEach(function(p){ p.remove(); });
  var p = sh.protect().setDescription('Tab tổng hợp chỉ xem (tự động cập nhật từ sheet Houses)');
  var me = '';
  try{ me = Session.getEffectiveUser().getEmail(); }catch(e){}
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
  var last = sh.getLastRow(), map = {}, add = [];
  if(last > 1){
    sh.getRange(2,1,last-1,1).getValues().forEach(function(r,i){ map[String(r[0])] = i + 2; });
  }
  list.forEach(function(it){
    var row = map[String(it.id)];
    if(row) sh.getRange(row,1,1,COLS.length).setNumberFormats([FMT]).setValues([itemToRow_(it)]);
    else add.push(it);
  });
  if(add.length){
    var start = Math.max(last,1) + 1, need = start + add.length - 1;
    if(need > sh.getMaxRows()) sh.insertRowsAfter(sh.getMaxRows(), need - sh.getMaxRows() + 100);
    sh.getRange(start,1,add.length,COLS.length)
      .setNumberFormats(add.map(function(){ return FMT; }))
      .setValues(add.map(itemToRow_));
  }
}
function save_(sh, it){ saveMany_(sh, [it]); }

function doGet(e){
  var r = role_(e.parameter.key);
  if(!r) return out_({ok:false,error:'Sai mã truy cập.'});
  var sh = sheet_(), n = sh.getLastRow() - 1, items = [];
  if(n > 0) items = sh.getRange(2,1,n,COLS.length).getValues().map(rowToItem_).filter(function(x){return x.id;});
  return out_({ok:true,role:r,items:items});
}

function doPost(e){
  var lock = null, locked = false;
  try{
    var b = JSON.parse(e.postData.contents);
    if(role_(b.key) !== 'edit') return out_({ok:false,error:'Bạn không có quyền sửa.'});

    // Tải ảnh lên Drive: không đụng tới Sheet nên không cần khóa (tránh tắc khi tải nhiều ảnh cùng lúc)
    if(b.action === 'upload'){
      var blob = Utilities.newBlob(Utilities.base64Decode(b.data), b.mime || 'image/jpeg', b.name || 'anh.jpg');
      var f = folder_().createFile(blob);
      try{ f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); }catch(err){}
      return out_({ok:true,id:f.getId()});
    }

    // Ghi Sheet: tryLock không ném lỗi, hết giờ thì trả thông báo dễ hiểu
    lock = LockService.getScriptLock();
    locked = lock.tryLock(30000);
    if(!locked) return out_({ok:false,error:'Máy chủ đang bận, bấm lưu lại sau vài giây.'});

    var sh = sheet_();
    if(b.action === 'save'){ saveMany_(sh, [b.item]); done_(); return out_({ok:true}); }
    if(b.action === 'saveMany'){ saveMany_(sh, b.items); done_(); return out_({ok:true}); }
    if(b.action === 'delete'){ var row = findRow_(sh, b.id); if(row > 0) sh.deleteRow(row); done_(); return out_({ok:true}); }
    return out_({ok:false,error:'Hành động không hợp lệ.'});
  }catch(err){
    return out_({ok:false,error:String(err)});
  }finally{
    if(locked){ try{ lock.releaseLock(); }catch(e2){} }
  }
}
