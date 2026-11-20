/* dup.js: công cụ "Kiểm tra trùng" (trùng thông tin và trùng ảnh) cho app Tìm nhà thuê.
   Hoạt động trực tiếp với index.html chỉ cần khai báo window.NT và <script src="dup.js" defer></script>.
   Quy tắc: báo cặp đạt từ 2 điểm điều kiện trở lên ("Cùng link tin đăng" = 2 điểm) hoặc có trùng ảnh (ưu tiên hiện đầu tiên);
   tự ẩn cặp đạt ngưỡng này nếu giá thuê lệch quá 20% tính theo giá cao hơn. */
(function(){
"use strict";
var G=function(i){return document.getElementById(i)};
var NT=null,inited=false;
function N(){return NT||window.NT}
function esc(s){return N().esc(s)}
function su(u){return N().su(u)}
function imgSrc(s,w){return N().imgSrc(s,w)}
function addrOf(it){return N().addrOf(it)}
function stName(k){return N().stName(k)}
function fmt(x){return N().fmt(x)}
function ls(k,v){return N().ls(k,v)}
var items=[];
var CSS=".dphdr{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:3px 0 12px}\n.dphdr h1{margin:0;min-width:0;font-size:clamp(19px,5.5vw,26px)}\n.dphdr+.sub{color:var(--mute);font-size:var(--fs-s);margin:-6px 0 12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n@media (max-height:820px){.dphdr+.sub{display:none}}\n.dpbtn{flex:none;display:inline-flex;align-items:center;min-height:34px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:var(--fs-s);font-weight:700;cursor:pointer;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.06);transition:transform .12s ease,background-color .2s ease,border-color .2s ease,color .2s ease}\n.dpbtn:hover{background:var(--b-new);border-color:var(--mute);color:var(--ink)}\n.dpbtn:active{transform:scale(.96)}\n#dupl,#dupignl,.dpc,.dprow{min-width:0}\n#dupmain[hidden],#dupignview[hidden],.dpbar2[hidden],.dpdet[hidden],.dpimgs[hidden],.dpz[hidden],.dpzctrl[hidden],.dpzstage img[hidden],.dpzempty[hidden]{display:none}\n.dpc{border:1px solid var(--line);border-left:4px solid var(--mute);border-radius:12px;padding:6px 12px 10px;margin-top:8px;background:var(--surface)}\n.dpc.hi{border-left-color:var(--danger)}\n.dprow{display:flex;align-items:center;gap:6px}\n.dprow+.dprow{border-top:1px dashed var(--line)}\n.dpr{display:flex;gap:8px;align-items:center;justify-content:space-between;flex:1;min-width:0;padding:8px 0}\n.dpt{min-width:0;flex:1;overflow:hidden}.dpt b{display:block;font-size:var(--fs-b);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpt small{display:block;color:var(--mute);font-size:var(--fs-s);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpedit,.dpdel{flex:none;border:1px solid var(--line);background:var(--bg);border-radius:8px;padding:4px 9px;min-height:30px;font-size:var(--fs-s);font-weight:600;cursor:pointer;white-space:nowrap}\n.dpedit{color:var(--accent)}\n.dpedit:hover{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}\n.dpdel{color:var(--danger)}\n.dpdel:hover{background:var(--danger);border-color:var(--danger);color:#fff}\n.dpdel:disabled{opacity:.5;cursor:default}\n.dpw{display:flex;flex-wrap:wrap;gap:4px;margin-top:2px}\n.dpw span{font-size:var(--fs-s);font-weight:600;padding:2px 9px;border-radius:999px;background:var(--bg);border:1px solid var(--line);color:var(--ink)}\n.dpw span.im{background:var(--danger);border-color:var(--danger);color:#fff}\n.dpn[data-tog],.dpw[data-tog]{cursor:pointer}\n.dpm{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;margin-top:8px}\n.dpm div{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:2px;cursor:zoom-in;min-width:0}\n.dpm img{width:100%;height:64px;object-fit:cover;border-radius:6px;background:var(--line);display:block}\n.dpbar2{display:flex;flex-wrap:wrap;align-items:center;gap:8px}\n.dpignbtn{border:1px solid var(--s-contact);background:var(--b-contact);color:var(--s-contact);border-radius:999px;padding:4px 12px;min-height:32px;font-size:var(--fs-s);font-weight:700;cursor:pointer}\n.dpignbtn:hover{filter:brightness(.95)}\n.dphead{display:flex;align-items:center;gap:10px;flex-wrap:wrap}\n.dphead h2{margin:0}\n.dphead .btn{min-height:34px;padding:5px 10px}\n.dpsens{display:flex;align-items:center;gap:8px;flex-wrap:wrap}\n.dpsens label{margin:0;white-space:nowrap}\n.dpsens select{width:auto;flex:1;min-width:180px;min-height:36px;padding:4px 8px;font-size:var(--fs-s)}\n.dpopt{display:inline-flex;align-items:center;gap:6px;font-size:var(--fs-s);font-weight:600;color:var(--ink);cursor:pointer;margin:0}\n.dpopt input{width:auto;min-height:0;accent-color:var(--accent)}\n.dpb{height:6px;border-radius:3px;background:var(--line);overflow:hidden}\n.dpb i{display:block;height:100%;width:0;background:var(--accent);transition:width .2s}\n.dpc.hi .dpn{color:var(--danger)}\n.dpn{font-size:var(--fs-s);font-weight:700;color:var(--ink);margin:6px 0 0}\n.dpa{margin-top:8px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}\n.dpno{border:1px solid var(--s-contact);background:var(--b-contact);color:var(--s-contact);border-radius:999px;padding:4px 11px;min-height:30px;font-size:var(--fs-s);font-weight:700;cursor:pointer}\n.dpno:hover{filter:brightness(.95)}\n.dpno.undo{color:var(--ink);border-color:var(--line);background:var(--bg)}\n.dpchk{border:1px solid var(--s-seen);background:var(--b-seen);color:var(--s-seen);border-radius:999px;padding:4px 11px;min-height:30px;font-size:var(--fs-s);font-weight:700;cursor:pointer}\n.dpchk:hover{filter:brightness(.95)}\n.dpchk:disabled{opacity:.6;cursor:default}\n.dpimgbtn{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:999px;padding:4px 11px;min-height:30px;font-size:var(--fs-s);font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:4px}\n.dpimgbtn[aria-expanded=\"true\"]{background:var(--s-new);border-color:var(--s-new);color:var(--surface)}\n.dpimgbtn:hover:not(:disabled){filter:brightness(.95)}\n.dpimgbtn:disabled{opacity:.55;cursor:default}\n.dpv{font-size:var(--fs-s);font-weight:600;margin-left:auto}\n.dpst{margin:6px 0 0;font-size:var(--fs-s);color:var(--mute)}\n.dpst.ok{color:var(--s-won);font-weight:700}\n.dpst.bad{color:var(--danger);font-weight:700}\n.dpdet,.dpimgs{margin-top:8px;padding-top:8px;border-top:1px dashed var(--line)}\n.dpimgbar{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px}\n.dpimgbar b{font-size:var(--fs-s);color:var(--ink)}\n.dpimgbar select{width:auto;min-width:165px;min-height:32px;padding:3px 8px;font-size:var(--fs-s);border-radius:8px}\n.dpcmps{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;align-items:stretch}\n.dpcmps.stack,.dpcmps.single{grid-template-columns:minmax(0,1fr)}\n.dpcmp{border:1px solid var(--line);border-radius:10px;padding:7px;background:var(--bg);min-width:0;display:flex;flex-direction:column}\n.dpcmph{display:flex;align-items:baseline;justify-content:space-between;gap:6px;margin-bottom:4px;min-width:0}\n.dpcmph b{font-size:var(--fs-s);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}\n.dpcmph span{flex:none;font-size:11px;font-weight:700;color:var(--mute)}\n.dpcmpm{font-size:11px;color:var(--mute);margin:0 0 6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-height:15px}\n.dpthumbs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px}\n.dpcmps.stack .dpthumbs,.dpcmps.single .dpthumbs{grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:6px}\n@media (min-width:600px){.dpcmps.both .dpthumbs{grid-template-columns:repeat(3,minmax(0,1fr))}}\n.dpth{position:relative;display:block;width:100%;min-width:0;min-height:0;border:1px solid var(--line);border-radius:7px;overflow:hidden;padding:0;background:var(--surface);cursor:zoom-in;aspect-ratio:4/3}\n.dpth.hit{border:2px solid var(--danger)}\n.dpth img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;background:var(--line)}\n.dpth i{position:absolute;left:3px;top:3px;font-style:normal;font-size:10px;font-weight:700;padding:1px 5px;border-radius:999px;background:var(--danger);color:#fff;line-height:1.3;pointer-events:none;z-index:1}\n.dpth u{position:absolute;right:3px;bottom:3px;text-decoration:none;font-size:10px;font-weight:700;padding:1px 5px;border-radius:6px;background:rgba(0,0,0,.62);color:#fff;line-height:1.3;pointer-events:none;z-index:1}\n.dpmess{font-size:var(--fs-s);color:var(--mute);font-style:italic;margin:8px 0 4px;text-align:center}\n.dpfs{display:grid;gap:6px}\n.dpf{border:1px solid var(--line);border-radius:8px;padding:6px 8px;background:var(--bg)}\n.dpf.hit{border-color:var(--mute);background:var(--surface)}\n.dpfl{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:4px}\n.dpfl b{font-size:var(--fs-s)}\n.dptag{font-size:11px;font-weight:700;padding:1px 7px;border-radius:999px;background:var(--s-new);color:var(--surface)}\n.dpfc{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:var(--fs-s)}\n.dpfc small{display:block;color:var(--mute);font-size:11px}\n.dpfc span{display:block;overflow-wrap:anywhere;word-break:break-word}\n.dpfc a{color:var(--s-seen);text-decoration:underline;overflow-wrap:anywhere;word-break:break-all}\n.dpe{color:var(--mute);font-style:italic}\n.dpi{margin-top:8px}\n.dpil{margin:0 0 6px;font-size:var(--fs-s);font-weight:700;color:var(--danger)}\n.dpig{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px}\n.dpip{border:1px solid var(--line);border-radius:8px;padding:4px;background:var(--bg);cursor:zoom-in;text-align:center;font:inherit;color:inherit}\n.dpip span{display:grid;grid-template-columns:1fr 1fr;gap:2px}\n.dpip img{width:100%;height:72px;object-fit:cover;border-radius:5px;background:var(--line);display:block}\n.dpip small{display:block;margin-top:3px;font-size:11px;color:var(--mute)}\n.dpz{position:fixed;inset:0;z-index:20;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;padding:calc(12px + env(safe-area-inset-top,0px)) 12px calc(12px + env(safe-area-inset-bottom,0px));overscroll-behavior:contain}\n.dpzb{background:var(--surface);color:var(--ink);border-radius:12px;padding:12px;width:min(760px,100%);max-height:calc(100dvh - 24px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}\n.dpzhdr{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}\n.dpzt{margin:0;font-weight:700;font-size:var(--fs-b);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpzlay,.dpzcls{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:8px;padding:4px 10px;min-height:32px;font-size:var(--fs-s);font-weight:600;cursor:pointer;white-space:nowrap;flex:none}\n.dpzcls{min-width:32px;padding:4px 8px;font-size:16px;line-height:1}\n.dpzg{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;align-items:stretch}\n.dpzg.stack{grid-template-columns:minmax(0,1fr)}\n.dpzcol{min-width:0;display:flex;flex-direction:column;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:8px}\n.dpzstage{position:relative;width:100%;height:clamp(210px,44dvh,420px);border-radius:8px;background:var(--surface);border:1px solid var(--line);overflow:hidden;display:flex;align-items:center;justify-content:center}\n.dpzg.stack .dpzstage{height:clamp(180px,33dvh,320px)}\n.dpzstage img{position:absolute;inset:0;width:100%;height:100%;padding:4px;object-fit:contain;display:block;cursor:pointer}\n.dpzempty{font-size:var(--fs-s);color:var(--mute);font-style:italic;padding:8px;text-align:center}\n.dpzmeta{margin-top:6px;text-align:center;min-width:0}\n.dpzmeta b{display:block;font-size:var(--fs-s);color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.35}\n.dpzmeta small{display:block;margin-top:1px;font-size:11px;color:var(--mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.35;min-height:15px}\n.dpzctrl{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:6px;min-height:32px}\n.dpzctrl.ghost{visibility:hidden;pointer-events:none}\n.dpzctrl button{border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:8px;min-width:38px;min-height:32px;padding:2px 10px;font-size:16px;font-weight:700;cursor:pointer}\n.dpzctrl button:disabled{opacity:.4;cursor:default}\n.dpzctrl span{font-size:var(--fs-s);font-weight:700;color:var(--ink);min-width:46px;text-align:center}\n";
var DLG="<dialog id=\"dupd\"><div class=\"form\" id=\"dupmain\">\n  <h2>Kiểm tra trùng</h2>\n  <p class=\"pm\" id=\"dupsum\"></p>\n  <div class=\"dpbar2\" id=\"duplinks\" hidden><button type=\"button\" class=\"link\" id=\"duptog\" hidden></button><button type=\"button\" class=\"dpignbtn\" id=\"dupigntog\" hidden></button></div>\n  <p class=\"pm\">Hiển thị cặp đạt từ 2 điểm điều kiện trở lên (Cùng link tin đăng = 2 điểm) hoặc có trùng ảnh trong: link tin đăng, link Maps, SĐT chủ, SĐT sale, địa chỉ, tên, giá + diện tích, ảnh (tự ẩn nếu giá lệch quá 20% theo giá cao). Quét ảnh sẽ tải ảnh thu nhỏ của tất cả căn nên tốn dữ liệu và mất một lúc.</p>\n  <div class=\"dpsens\"><label for=\"dupsens\">Độ nhạy quét ảnh:</label><select id=\"dupsens\"><option value=\"6\">Ít nhầm (6/64 bit)</option><option value=\"10\" selected>Bình thường (10/64 bit — mặc định)</option><option value=\"14\">Nhạy (14/64 bit)</option><option value=\"18\">Rất nhạy (18/64 bit)</option></select></div>\n  <div class=\"dpsens\"><label for=\"dupimgv\">Hộp thả xem ảnh:</label><select id=\"dupimgv\"><option value=\"manual\" selected>Đóng sẵn · bấm “Xem ảnh” ở từng cặp</option><option value=\"both\">Mở sẵn · so sánh 2 căn cạnh nhau</option><option value=\"stack\">Mở sẵn · xếp dọc từng căn</option></select></div>\n  <label class=\"dpopt\"><input type=\"checkbox\" id=\"dupnoout\"><span>Bỏ qua căn đã “Loại”</span></label>\n  <div class=\"foot2\"><button class=\"btn p\" type=\"button\" id=\"dupimg\">Quét ảnh trùng</button><button class=\"btn\" type=\"button\" id=\"dupstop\" hidden>Dừng</button></div>\n  <div class=\"dpb\" id=\"dupbar\" hidden><i></i></div>\n  <p class=\"pm\" id=\"dupm\" role=\"status\"></p>\n  <div id=\"dupl\"></div>\n  <div class=\"foot\"><button class=\"btn p\" type=\"button\" id=\"dupx\">Đóng</button></div>\n</div><div class=\"form\" id=\"dupignview\" hidden>\n  <div class=\"dphead\"><button type=\"button\" class=\"btn\" id=\"dupback\">← Quay lại</button><h2>Không phải trùng</h2></div>\n  <p class=\"pm\" id=\"dupignsum\"></p>\n  <button type=\"button\" class=\"link\" id=\"dupignclr\" hidden>Khôi phục tất cả về danh sách kiểm tra</button>\n  <div id=\"dupignl\"></div>\n  <div class=\"foot\"><button class=\"btn\" type=\"button\" id=\"dupback2\">← Quay lại</button><button class=\"btn p\" type=\"button\" id=\"dupx2\">Đóng</button></div>\n</div><div class=\"dpz\" id=\"dupz\" hidden><div class=\"dpzb\"><div class=\"dpzhdr\"><p class=\"dpzt\" id=\"dupzt\"></p><button type=\"button\" class=\"dpzlay\" id=\"dupzlay\">Xếp dọc</button><button type=\"button\" class=\"dpzcls\" id=\"dupzx2\" aria-label=\"Đóng\">×</button></div><div class=\"dpzg\" id=\"dupzg\"><div class=\"dpzcol\"><div class=\"dpzstage\"><img id=\"dupz1\" alt=\"Ảnh căn 1\"><span class=\"dpzempty\" id=\"dupze1\" hidden>Chưa có ảnh</span></div><div class=\"dpzmeta\"><b id=\"dupz1n\"></b><small id=\"dupz1m\"></small></div><div class=\"dpzctrl\" id=\"dupzc1\" hidden><button type=\"button\" id=\"dupz1prev\" aria-label=\"Ảnh trước căn 1\">‹</button><span id=\"dupz1c\"></span><button type=\"button\" id=\"dupz1next\" aria-label=\"Ảnh sau căn 1\">›</button></div></div><div class=\"dpzcol\"><div class=\"dpzstage\"><img id=\"dupz2\" alt=\"Ảnh căn 2\"><span class=\"dpzempty\" id=\"dupze2\" hidden>Chưa có ảnh</span></div><div class=\"dpzmeta\"><b id=\"dupz2n\"></b><small id=\"dupz2m\"></small></div><div class=\"dpzctrl\" id=\"dupzc2\" hidden><button type=\"button\" id=\"dupz2prev\" aria-label=\"Ảnh trước căn 2\">‹</button><span id=\"dupz2c\"></span><button type=\"button\" id=\"dupz2next\" aria-label=\"Ảnh sau căn 2\">›</button></div></div></div><div class=\"foot\"><button class=\"btn p\" type=\"button\" id=\"dupzx\">Đóng</button></div></div></div></dialog>";
var TH=10,MIN=2,imgPairs=null,scanning=false,stopFlag=false,cache={},cacheLoaded=false,cacheP=null,inflight={},LIMIT=50,limMain=50,limIgn=50,memo=null,syncT=0,showOne=false,showIgn=false,skipOut=true,skipLoaded=false,imgAutoMode="manual",imgModeLoaded=false,viewList=[],openSet={},openImgSet={},pairImgMode={},ignored={},ignLoaded=false,pairImgMsg={},zoomCmp=null;

/* ---------- Lưu danh sách "không phải trùng" vào localStorage ---------- */
function loadIgnored(){if(ignLoaded)return;ignLoaded=true;try{ignored=JSON.parse(ls("dign1")||"{}")||{}}catch(e){ignored={}}}
function saveIgnored(){try{ls("dign1",JSON.stringify(ignored))}catch(e){}}
function canWrite(){if(N()&&N().canW)return !!N().canW();var b=G("bnow");return b?!b.hidden:true}

/* ---------- Chuẩn hoá ---------- */
function nd(s){return String(s==null?"":s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/[^a-z0-9]+/g," ").trim()}
function pn(s){var d=String(s||"").replace(/\D/g,"");if(d.indexOf("84")===0&&d.length>=11)d="0"+d.slice(2);if(d.length===9&&d.charAt(0)!=="0")d="0"+d;return d.length>=9?d:""}
function ln(u){u=su(u);if(!u)return"";u=u.toLowerCase().replace(/^https?:\/\/(www\.|m\.)?/,"").replace(/#.*$/,"");var p=u.split("?"),b=p[0].replace(/\/+$/,""),q=(p[1]||"").split("&").filter(function(x){return x&&!/^(utm_|fbclid|gclid|zarsrc|ref=)/.test(x)}).sort().join("&");return b+(q?"?"+q:"")}
/* mã tin: cùng website + cùng dãy số dài cuối đường dẫn (khác slug vẫn nhận ra) */
function lid(u){u=ln(u);if(!u)return"";var h=u.split("/")[0],m=u.split("?")[0].match(/\d{6,}/g);return m?h+"#"+m[m.length-1]:""}
function nw(s){return nd(s).replace(/^(thanh pho|thi xa|thi tran|phuong|quan|huyen|xa|tp|p|q)(?=\s|\d|$)\s*/,"").replace(/^0+(?=\d)/,"")}
var STOP={so:1,nha:1,duong:1,d:1,hem:1,ngo:1,ngach:1,kiet:1,p:1,phuong:1,q:1,quan:1,xa:1,hcm:1,tphcm:1,tp:1};
function addrKey(it){var t=nd(it.a).replace(/\b(thanh pho ho chi minh|tp ho chi minh|ho chi minh)\b/g," ").split(" ").filter(function(w){return w&&!STOP[w]});
  var hasNum=t.some(function(w){return/\d/.test(w)}),hasWord=t.some(function(w){return/^[a-z]{2,}$/.test(w)});
  return hasNum&&hasWord?t.join(" "):""}
function feat(it){var nm=nd(it.n),set=Object.create(null),k=0;nm.split(" ").forEach(function(w){if(w&&!set[w]){set[w]=1;k++}});
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
  if(x.p!=null&&y.p!=null&&x.ar&&y.ar&&Math.abs(x.p-y.p)<=0.05&&Math.abs(x.ar-y.ar)<=1&&compat(x,y)&&sameArea(x,y))w.push("Giá + diện tích giống nhau");
  return w}
function addP(P,a,b,why){if(a.id===b.id)return;var lo=a.id<b.id?a:b,hi=a.id<b.id?b:a,k=lo.id+"|"+hi.id,o=P[k]||(P[k]={a:lo,b:hi,why:[],img:[]});if(why&&o.why.indexOf(why)<0)o.why.push(why);return o}
function cleanImgPairs(){
  if(!imgPairs)return;
  var byId={};items.forEach(function(it){byId[it.id]=it});
  imgPairs=imgPairs.filter(function(r){
    var a=byId[r.a.id],b=byId[r.b.id];
    if(!a||!b)return false;
    if((a.im||[]).indexOf(r.x)<0||(b.im||[]).indexOf(r.y)<0)return false;
    r.a=a;r.b=b;return true;
  });
}
function priceDiffOver20(a,b){
  if(a.p==null||b.p==null)return false;
  var pa=+a.p,pb=+b.p;
  if(!(pa>0)||!(pb>0))return false;
  return Math.abs(pa-pb)/Math.max(pa,pb)>0.2;
}
var WT={"Cùng link tin đăng":2};
function sc(o){var t=0;o.why.forEach(function(l){t+=WT[l]||1});return t}
function sigOf(it){return[it.id,it.n,it.a,it.w,it.d,it.p,it.ar,it.lk,it.mp,it.ph,it.sp].join("\u0001")}
function loadSkip(){if(skipLoaded)return;skipLoaded=true;try{skipOut=ls("dnoout")!=="0"}catch(e){skipOut=true}}
function activeItems(){loadSkip();return skipOut?items.filter(function(it){return (it.st||"new")!=="out"}):items}
/* Phần so thông tin là O(n²): chỉ tính lại khi dữ liệu liên quan thật sự đổi */
function textPairs(src){
  var sig=(skipOut?"1:":"0:")+src.map(sigOf).join("\u0002");
  if(memo&&memo.sig===sig)return memo.list;
  var F=src.map(feat),out=[],i,j,w,a,b;
  for(i=0;i<F.length;i++)for(j=i+1;j<F.length;j++){w=cmp(F[i],F[j]);if(w.length){a=F[i].it;b=F[j].it;out.push(a.id<b.id?{a:a.id,b:b.id,why:w}:{a:b.id,b:a.id,why:w})}}
  memo={sig:sig,list:out};return out}
function build(){
  loadIgnored();
  var src=activeItems(),P={},byId={};
  src.forEach(function(it){byId[it.id]=it});
  textPairs(src).forEach(function(t){var a=byId[t.a],b=byId[t.b];if(a&&b)P[t.a+"|"+t.b]={a:a,b:b,why:t.why.slice(),img:[]}});
  if(imgPairs)imgPairs.forEach(function(r){var a=byId[r.a.id],b=byId[r.b.id];if(!a||!b)return;var o=addP(P,a,b,"img");if(!o)return;var sw=o.a.id!==r.a.id;o.img.push(sw?{x:r.y,y:r.x,d:r.d,k:r.k||""}:{x:r.x,y:r.y,d:r.d,k:r.k||""})});
  var all=Object.keys(P).map(function(k){var o=P[k];o.sc=sc(o);return o}).sort(function(a,b){return(b.img.length>0?1:0)-(a.img.length>0?1:0)||b.sc-a.sc||b.img.length-a.img.length});
  var active=[],ign=[];
  all.forEach(function(p){
    if(ignored[p.a.id+"|"+p.b.id]){ign.push(p);return}
    if(!p.img.length&&p.sc>=MIN&&priceDiffOver20(p.a,p.b))return;
    active.push(p);
  });
  return{
    strong:active.filter(function(o){return o.sc>=MIN||o.img.length>0}),
    weak:active.filter(function(o){return o.sc<MIN&&!o.img.length}),
    ign:ign,
    nSrc:src.length,
    nSkip:items.length-src.length
  }}
function pc(x){x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return(((x+(x>>>4))&0x0f0f0f0f)*0x01010101)>>>24}
function simText(d,k){var tag=k==="m"?"lật ngang · ":k==="c"?"vùng giữa · ":k==="cm"?"lật + vùng giữa · ":"";if(d===0&&!k)return"Giống 100%";return"Giống "+Math.round((64-d)/64*100)+"% ("+tag+"lệch "+d+"/64 bit)"}
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
      h+='<button type="button" class="dpip" data-zoom="'+idx+':'+i+'"><span><img alt="Ảnh căn 1" loading="lazy" src="'+esc(imgSrc(m.x,300))+'"><img alt="Ảnh căn 2" loading="lazy" src="'+esc(imgSrc(m.y,300))+'"></span><small>'+esc(simText(m.d,m.k))+'</small></button>';
    });
    h+='</div></div>';
  }
  return h;
}
function loadImgMode(){if(imgModeLoaded)return;imgModeLoaded=true;try{var v=ls("dimgv");imgAutoMode=(v==="both"||v==="stack")?v:"manual"}catch(e){imgAutoMode="manual"}}
function isImgOpen(k){return openImgSet[k]!==undefined?!!openImgSet[k]:imgAutoMode!=="manual"}
function modeFor(k){return pairImgMode[k]||(imgAutoMode==="stack"?"stack":"both")}
function houseImgs(it){
  var out=[],seen={};
  function push(arr,tag){(arr||[]).forEach(function(s){if(!s||seen[s])return;seen[s]=1;out.push({s:s,tag:tag})})}
  push(it&&it.im,"");
  var ck=it&&it.ck;
  if(ck){push(ck.vi,"Đi xem");push(ck.im,"Lỗi")}
  return out;
}
function imgCmpH(o,idx){
  var k=o.a.id+"|"+o.b.id,mode=modeFor(k);
  var imgsA=houseImgs(o.a),imgsB=houseImgs(o.b);
  var hitA={},hitB={};
  o.img.forEach(function(m){hitA[m.x]=1;hitB[m.y]=1});
  function colH(it,side,list,hits,label){
    var meta=[paText(it),stName(it.st||"new")].filter(Boolean).join(" · ");
    var h='<div class="dpcmp"><div class="dpcmph"><b>'+esc(label+": "+(it.n||"Chưa đặt tên"))+'</b><span>'+list.length+' ảnh</span></div>';
    if(meta)h+='<p class="dpcmpm">'+esc(meta)+'</p>';
    if(!list.length){
      h+='<p class="dpmess">Chưa có ảnh</p>';
    }else{
      h+='<div class="dpthumbs">';
      list.forEach(function(im,i){
        h+='<button type="button" class="dpth'+(hits[im.s]?' hit':'')+'" data-cmpzoom="'+idx+':'+side+':'+i+'" title="Bấm để phóng to &amp; so sánh">';
        h+='<img alt="'+esc(label)+'" loading="lazy" src="'+esc(imgSrc(im.s,300))+'">';
        if(hits[im.s])h+='<i>Trùng</i>';
        if(im.tag)h+='<u>'+esc(im.tag)+'</u>';
        h+='</button>';
      });
      h+='</div>';
    }
    return h+'</div>';
  }
  var cls=mode==="stack"?"stack":(mode==="a"||mode==="b")?"single":"both";
  var h='<div class="dpimgbar"><b>So sánh ảnh 2 căn ('+imgsA.length+' · '+imgsB.length+')</b><select class="dpimgsel" data-imgmode="'+idx+'" aria-label="Chế độ xem ảnh 2 căn">';
  h+='<option value="both"'+(mode==="both"?' selected':'')+'>2 cột cạnh nhau</option>';
  h+='<option value="stack"'+(mode==="stack"?' selected':'')+'>Xếp dọc từng căn</option>';
  h+='<option value="a"'+(mode==="a"?' selected':'')+'>Chỉ Căn 1 ('+imgsA.length+' ảnh)</option>';
  h+='<option value="b"'+(mode==="b"?' selected':'')+'>Chỉ Căn 2 ('+imgsB.length+' ảnh)</option>';
  h+='</select></div><div class="dpcmps '+cls+'">';
  if(mode!=="b")h+=colH(o.a,"a",imgsA,hitA,"Căn 1");
  if(mode!=="a")h+=colH(o.b,"b",imgsB,hitB,"Căn 2");
  return h+'</div>';
}
function rowH(it,idx,side,allowWrite){
  var k=it.st||"new",ad=addrOf(it);
  return '<div class="dprow"><div class="dpr"><span class="dpt"><b>'+esc(it.n)+'</b><small>'+esc(ad||"Chưa có địa chỉ")+(it.p!=null?" · "+fmt(it.p)+" tr":"")+(it.ar?" · "+fmt(it.ar)+" m²":"")+'</small></span><span class="pill" style="--c:var(--s-'+k+');--bg2:var(--b-'+k+')">'+esc(stName(k))+'</span></div>'+(allowWrite?'<button type="button" class="dpedit" data-edit="'+esc(it.id)+'" title="Sửa thông tin căn này" aria-label="Sửa căn '+esc(it.n)+'">Sửa</button><button type="button" class="dpdel" data-del="'+idx+':'+side+'" title="Xóa căn này" aria-label="Xóa căn '+esc(it.n)+'">Xóa</button>':'')+'</div>'}
function pairH(o,idx,isIgn){
  var n=o.why.length,s=o.sc||0,k=o.a.id+"|"+o.b.id,isOpen=!!openSet[k],imgOpen=isImgOpen(k),allowDel=canWrite(),st=pairImgMsg[k];
  var na=houseImgs(o.a).length,nb=houseImgs(o.b).length,totImg=na+nb;
  var lbl=s>=3?"Gần như chắc chắn trùng":s>=2?"Có thể trùng":o.img.length?"Trùng ảnh":"Chỉ trùng 1 điều kiện";
  var h='<div class="dpc'+(s>=3&&!isIgn?" hi":"")+'">'+rowH(o.a,idx,"a",allowDel)+rowH(o.b,idx,"b",allowDel)+'<p class="dpn" data-tog="'+idx+'">'+lbl+(n>1?' ('+n+' điều kiện)':'')+'</p><div class="dpw" data-tog="'+idx+'" title="Bấm để xem thông tin trùng">';
  o.why.forEach(function(w){if(w!=="img")h+='<span>'+esc(w)+'</span>'});
  if(o.img.length)h+='<span class="im">'+o.img.length+' ảnh giống nhau</span>';
  h+='</div>';
  if(o.img.length)h+='<div class="dpm">'+o.img.slice(0,3).map(function(m,i){return '<div data-zoom="'+idx+':'+i+'" title="Bấm để phóng to"><img alt="Ảnh căn 1" loading="lazy" src="'+esc(imgSrc(m.x,200))+'"><img alt="Ảnh căn 2" loading="lazy" src="'+esc(imgSrc(m.y,200))+'"></div>'}).join("")+'</div>';
  h+='<div class="dpa">';
  if(isIgn)h+='<button type="button" class="dpno undo" data-unign="'+idx+'">Khôi phục nghi trùng</button>';
  else h+='<button type="button" class="dpno" data-ign="'+idx+'">Không phải trùng</button>';
  h+='<button type="button" class="dpchk" data-chkimg="'+idx+'"'+(st&&st.busy?' disabled':'')+'>'+(st&&st.busy?'Đang kiểm tra…':'Kiểm tra ảnh')+'</button>';
  h+='<button type="button" class="dpimgbtn" data-imgtog="'+idx+'" aria-expanded="'+(totImg&&imgOpen?"true":"false")+'"'+(totImg?"":" disabled")+'>'+(totImg?(imgOpen?'Ẩn ảnh ('+na+' · '+nb+') ▴':'Xem ảnh ('+na+' · '+nb+') ▾'):'Chưa có ảnh (0 · 0)')+'</button>';
  h+='<button type="button" class="link dpv" data-tog="'+idx+'">'+(isOpen?"Ẩn thông tin trùng":"Xem thông tin trùng")+'</button></div>';
  if(st&&st.text)h+='<p class="dpst'+(st.ok?' ok':st.bad?' bad':'')+'">'+esc(st.text)+'</p>';
  h+='<div class="dpdet"'+(isOpen?"":" hidden")+'>'+(isOpen?detailH(o,idx):"")+'</div>';
  h+='<div class="dpimgs"'+(totImg&&imgOpen?"":" hidden")+'>'+(totImg&&imgOpen?imgCmpH(o,idx):"")+'</div>';
  return h+'</div>'}
function render(){
  var r=build(),list=showOne?r.strong.concat(r.weak):r.strong,el=G("dupl"),n=r.nSrc,sk=r.nSkip?" (đã bỏ qua "+r.nSkip+" căn Loại)":"",hi=r.strong.filter(function(o){return o.sc>=3}).length,tg=G("duptog"),itg=G("dupigntog"),ignEl=G("dupignl");
  viewList=[];
  G("dupmain").hidden=showIgn;
  G("dupignview").hidden=!showIgn;
  if(showIgn){
    el.innerHTML="";
    G("dupignsum").textContent=r.ign.length?"Có "+r.ign.length+" cặp đã đánh dấu không phải trùng (lưu trên máy này). Bấm Khôi phục nghi trùng để đưa lại vào danh sách kiểm tra.":"Không còn cặp nào đã đánh dấu không phải trùng.";
    G("dupignclr").hidden=r.ign.length<2;
    if(r.ign.length){
      var ignSlice=r.ign.slice(0,limIgn);
      ignEl.innerHTML=ignSlice.map(function(o){var idx=viewList.push(o)-1;return pairH(o,idx,true)}).join("")+(r.ign.length>limIgn?'<button type="button" class="link" data-more="ign">Hiện thêm '+Math.min(LIMIT,r.ign.length-limIgn)+' cặp (còn '+(r.ign.length-limIgn)+')</button>':'');
    }else{
      ignEl.innerHTML="";
    }
    return;
  }
  ignEl.innerHTML="";
  var mainSlice=list.slice(0,limMain);
  var mainHtml=mainSlice.map(function(o){var idx=viewList.push(o)-1;return pairH(o,idx,false)}).join("")+(list.length>limMain?'<button type="button" class="link" data-more="main">Hiện thêm '+Math.min(LIMIT,list.length-limMain)+' cặp (còn '+(list.length-limMain)+')</button>':'');
  G("dupsum").textContent=!items.length?"Chưa có căn nào để kiểm tra.":!n?"Tất cả "+items.length+" căn đều đang ở trạng thái Loại. Bỏ chọn “Bỏ qua căn đã Loại” để kiểm tra.":r.strong.length?"Có "+r.strong.length+" cặp nghi trùng"+(hi?" ("+hi+" cặp gần như chắc chắn)":"")+" trong "+n+" căn"+sk+". "+(canWrite()?"Bấm Sửa hoặc Xóa trên từng căn, hoặc bấm Xem thông tin trùng để đối chiếu.":"Bấm Xem thông tin trùng để đối chiếu."):"Không có cặp nào trùng từ 2 điều kiện trở lên hoặc trùng ảnh trong "+n+" căn"+sk+(imgPairs?" (đã tính cả ảnh).":".");
  tg.hidden=!r.weak.length;tg.textContent=showOne?"Ẩn "+r.weak.length+" cặp chỉ trùng 1 điều kiện":"Hiện thêm "+r.weak.length+" cặp chỉ trùng 1 điều kiện";
  itg.hidden=!r.ign.length;itg.textContent="Xem danh sách không phải trùng ("+r.ign.length+") →";
  G("duplinks").hidden=tg.hidden&&itg.hidden;
  el.innerHTML=mainHtml;
  return r}
function togglePair(el){
  var idx=+el.dataset.tog,o=viewList[idx];if(!o)return;
  var k=o.a.id+"|"+o.b.id;openSet[k]=!openSet[k];
  var card=el.closest(".dpc");if(!card)return;
  var btn=card.querySelector(".dpv"),det=card.querySelector(".dpdet");
  if(btn)btn.textContent=openSet[k]?"Ẩn thông tin trùng":"Xem thông tin trùng";
  if(det){if(openSet[k]){det.innerHTML=detailH(o,idx);det.hidden=false}else det.hidden=true}}
function toggleImgPair(el){
  var idx=+el.dataset.imgtog,o=viewList[idx];if(!o)return;
  var k=o.a.id+"|"+o.b.id,na=houseImgs(o.a).length,nb=houseImgs(o.b).length;
  if(!(na+nb))return;
  var next=!isImgOpen(k);openImgSet[k]=next;
  var card=el.closest(".dpc");if(!card)return;
  var btn=card.querySelector(".dpimgbtn"),box=card.querySelector(".dpimgs");
  if(btn){
    btn.setAttribute("aria-expanded",next?"true":"false");
    btn.textContent=(next?"Ẩn ảnh ("+na+" · "+nb+") ▴":"Xem ảnh ("+na+" · "+nb+") ▾");
  }
  if(box){if(next){box.innerHTML=imgCmpH(o,idx);box.hidden=false}else box.hidden=true}}
function changeImgMode(sel){
  var idx=+sel.dataset.imgmode,o=viewList[idx];if(!o)return;
  pairImgMode[o.a.id+"|"+o.b.id]=sel.value;
  var card=sel.closest(".dpc"),box=card&&card.querySelector(".dpimgs");
  if(box)box.innerHTML=imgCmpH(o,idx)}
function ignorePair(el,val){
  var idx=+(val?el.dataset.ign:el.dataset.unign),o=viewList[idx];if(!o)return;
  loadIgnored();
  var k=o.a.id+"|"+o.b.id;
  if(val){ignored[k]=Date.now();delete openSet[k];delete openImgSet[k]}else delete ignored[k];
  saveIgnored();render()}
function checkPairImg(el){
  var idx=+el.dataset.chkimg,o=viewList[idx];if(!o)return;
  var k=o.a.id+"|"+o.b.id;
  if(pairImgMsg[k]&&pairImgMsg[k].busy)return;
  var aIm=(o.a.im||[]).filter(Boolean),bIm=(o.b.im||[]).filter(Boolean);
  if(!aIm.length||!bIm.length){
    pairImgMsg[k]={text:"Chưa đủ ảnh để kiểm tra (Căn 1: "+aIm.length+" ảnh · Căn 2: "+bIm.length+" ảnh)."};
    render();return;
  }
  pairImgMsg[k]={busy:true,text:"Đang kiểm tra "+aIm.length+" ảnh vs "+bIm.length+" ảnh…"};
  render();
  loadCache().then(function(){
    var uniq={},list=[];
    aIm.concat(bIm).forEach(function(s){if(!uniq[s]){uniq[s]=1;list.push(s)}});
    var map={},bad=0,pos=0;
    function worker(){
      if(pos>=list.length)return Promise.resolve();
      var s=list[pos++];
      return hashOf(s).then(function(h){if(h){var sg=parseSig(h);if(sg)map[s]=sg}else if(h===null)bad++}).then(worker)}
    return Promise.all([worker(),worker(),worker()]).then(function(){
      saveCache();
      var found=[],seen={},i,j,sa,sb,ha,hb,m;
      for(i=0;i<aIm.length;i++){
        sa=aIm[i];ha=map[sa];
        for(j=0;j<bIm.length;j++){
          sb=bIm[j];hb=map[sb];
          if(sa!==sb&&(!ha||!hb))continue;
          m=sa===sb?{d:0,k:""}:cmpSig(ha,hb,TH);
          if(m){
            var pk=sa+"|"+sb;
            if(!seen[pk]){seen[pk]=1;found.push({a:o.a,b:o.b,x:sa,y:sb,d:m.d,k:m.k})}
          }
        }
      }
      imgPairs=(imgPairs||[]).filter(function(r){
        return !((r.a.id===o.a.id&&r.b.id===o.b.id)||(r.a.id===o.b.id&&r.b.id===o.a.id));
      }).concat(found);
      if(found.length){
        pairImgMsg[k]={ok:true,text:"Tìm thấy "+found.length+" cặp ảnh giống nhau"+(bad?" ("+bad+" ảnh không đọc được)":"")+"."};
      }else if(bad&&bad===list.length){
        pairImgMsg[k]={bad:true,text:"Không đọc được ảnh của 2 căn này (trình duyệt chặn Drive hoặc mất mạng)."};
      }else{
        pairImgMsg[k]={text:"Không trùng ảnh ("+aIm.length+" vs "+bIm.length+" ảnh"+(bad?", "+bad+" ảnh lỗi":"")+"; ngưỡng lệch ≤ "+TH+"/64 bit)."};
      }
      render();
    });
  })}
function afterDel(id){
  loadIgnored();var changed=false;
  Object.keys(ignored).forEach(function(k){var ids=k.split("|");if(ids[0]===id||ids[1]===id){delete ignored[k];changed=true}});
  if(changed)saveIgnored();
  sync()}
function delItem(el){
  var p=String(el.dataset.del||"").split(":"),o=viewList[+p[0]],it=o&&o[p[1]];
  if(!it)return;
  if(!canWrite()){alert("Bạn chỉ có quyền xem, không thể xóa.");return}
  if(N().del){
    if(!confirm('Xóa căn "'+it.n+'"? Thư mục ảnh của căn trên Drive cũng sẽ được chuyển vào thùng rác.'))return;
    el.disabled=true;el.textContent="Đang xóa…";
    N().del(it.id).then(function(){afterDel(it.id)},function(){if(document.contains(el)){el.disabled=false;el.textContent="Xóa"}});
    return;
  }
  /* Dùng trực tiếp luồng Xóa có sẵn của index.html khi window.NT chưa khai báo del */
  var dv=G("dv"),dlg=G("dlg");
  if(!dv||!dlg||!N().openDv){alert("Không thể xóa từ hộp thoại này.");return}
  dv.style.visibility="hidden";dlg.style.visibility="hidden";
  try{
    N().openDv(it.id);
    var ed=dv.querySelector("[data-dvedit]");
    if(!ed){if(dv.open)dv.close();alert("Bạn chỉ có quyền xem, không thể xóa.");return}
    ed.click();
    var dbtn=G("del");
    if(dbtn)dbtn.click();
    if(dlg.open)dlg.close();
  }finally{
    dv.style.visibility="";dlg.style.visibility="";
  }
  if(!N().items().some(function(x){return x.id===it.id}))afterDel(it.id)}
function editItem(id){
  if(!canWrite()){alert("Bạn chỉ có quyền xem, không thể sửa.");return}
  if(N().openEdit){N().openEdit(id);return}
  var dv=G("dv"),dlg=G("dlg");
  if(!dv||!dlg||!N().openDv){alert("Không thể sửa từ hộp thoại này.");return}
  dv.style.visibility="hidden";
  try{
    N().openDv(id);
    var ed=dv.querySelector("[data-dvedit]");
    if(!ed){if(dv.open)dv.close();alert("Bạn chỉ có quyền xem, không thể sửa.");return}
    ed.click();
    if(dv.open)dv.close();
    if(dlg.open)dlg.addEventListener("close",function(){sync()},{once:true});
  }finally{
    dv.style.visibility="";
  }}
function setZoomImg(imgEl,emptyEl,s){
  imgEl.removeAttribute("data-rt");
  if(s){imgEl.hidden=false;if(emptyEl)emptyEl.hidden=true;imgEl.src=imgSrc(s,900)}
  else{imgEl.hidden=true;if(emptyEl)emptyEl.hidden=false;imgEl.removeAttribute("src")}}
function renderCmpZoom(){
  if(!zoomCmp)return;
  var o=viewList[zoomCmp.idx];if(!o){closeZoom();return}
  var ia=zoomCmp.ia,ib=zoomCmp.ib,la=zoomCmp.imgsA,lb=zoomCmp.imgsB;
  var imA=la[ia],imB=lb[ib],anyCtrl=la.length>1||lb.length>1;
  G("dupzt").textContent="So sánh ảnh 2 căn";
  G("dupzlay").textContent=zoomCmp.stack?"Cạnh nhau":"Xếp dọc";
  G("dupzg").classList.toggle("stack",!!zoomCmp.stack);
  setZoomImg(G("dupz1"),G("dupze1"),imA?imA.s:"");
  setZoomImg(G("dupz2"),G("dupze2"),imB?imB.s:"");
  G("dupz1n").textContent=o.a.n||"Căn 1";
  G("dupz2n").textContent=o.b.n||"Căn 2";
  G("dupz1m").textContent=[paText(o.a),imA?(ia+1)+"/"+la.length+(imA.tag?" · "+imA.tag:""):"Chưa có ảnh"].filter(Boolean).join(" · ");
  G("dupz2m").textContent=[paText(o.b),imB?(ib+1)+"/"+lb.length+(imB.tag?" · "+imB.tag:""):"Chưa có ảnh"].filter(Boolean).join(" · ");
  var c1=G("dupzc1"),c2=G("dupzc2");
  c1.hidden=!anyCtrl;c2.hidden=!anyCtrl;
  c1.classList.toggle("ghost",anyCtrl&&la.length<=1);
  c2.classList.toggle("ghost",anyCtrl&&lb.length<=1);
  if(la.length>1){G("dupz1c").textContent=(ia+1)+"/"+la.length}
  if(lb.length>1){G("dupz2c").textContent=(ib+1)+"/"+lb.length}
  G("dupz").hidden=false}
function openCmpZoom(val){
  var p=String(val||"").split(":"),idx=+p[0],side=p[1],i=+p[2]||0,o=viewList[idx];if(!o)return;
  var la=houseImgs(o.a),lb=houseImgs(o.b);
  zoomCmp={idx:idx,imgsA:la,imgsB:lb,ia:side==="a"?Math.min(i,Math.max(0,la.length-1)):0,ib:side==="b"?Math.min(i,Math.max(0,lb.length-1)):0,stack:imgAutoMode==="stack"};
  renderCmpZoom()}
function stepCmpZoom(side,dir){
  if(!zoomCmp)return;
  var len=side==="a"?zoomCmp.imgsA.length:zoomCmp.imgsB.length;
  if(len<=1)return;
  if(side==="a")zoomCmp.ia=(zoomCmp.ia+dir+len)%len;
  else zoomCmp.ib=(zoomCmp.ib+dir+len)%len;
  renderCmpZoom()}
function openZoom(val){
  var p=String(val||"").split(":"),o=viewList[+p[0]],m=o&&o.img[+p[1]];if(!m)return;
  zoomCmp=null;
  var c1=G("dupzc1"),c2=G("dupzc2");
  c1.hidden=true;c2.hidden=true;c1.classList.remove("ghost");c2.classList.remove("ghost");
  G("dupzlay").textContent=G("dupzg").classList.contains("stack")?"Cạnh nhau":"Xếp dọc";
  G("dupzt").textContent=simText(m.d,m.k);
  G("dupz1n").textContent=o.a.n||"Căn 1";
  G("dupz2n").textContent=o.b.n||"Căn 2";
  G("dupz1m").textContent=paText(o.a);
  G("dupz2m").textContent=paText(o.b);
  setZoomImg(G("dupz1"),G("dupze1"),m.x);
  setZoomImg(G("dupz2"),G("dupze2"),m.y);
  G("dupz").hidden=false}
function closeZoom(){zoomCmp=null;var z=G("dupz");if(z&&!z.hidden){z.hidden=true;return true}return false}
function msg(t,bad){var m=G("dupm");m.textContent=t||"";m.className="pm"+(bad?" bad":"")}

/* ---------- Thuật toán quét ảnh thông minh: dHash 64-bit + Lật ngang + Vùng giữa 75% + Tông màu 4 góc ---------- */
var CACHE_KEY="dhc3";
function parseCache(raw){try{var o=JSON.parse(raw||"{}");return(o&&typeof o==="object")?o:{}}catch(e){return{}}}
function clearOldCaches(){
  ["dhc1","dhc2"].forEach(function(k){
    try{if(ls(k))ls(k,"")}catch(e){}
    if(N()&&N().idbSave)N().idbSave(k,"");
  });
}
function loadCache(){
  if(cacheLoaded)return Promise.resolve(cache);
  if(cacheP)return cacheP;
  var idb=N()&&N().idbGet;
  if(!idb){cacheLoaded=true;cache=parseCache(ls(CACHE_KEY));clearOldCaches();return Promise.resolve(cache)}
  cacheP=idb(CACHE_KEY).then(function(v){
    var leg=ls(CACHE_KEY);
    if(typeof v==="string"&&v){cache=parseCache(v);if(leg)ls(CACHE_KEY,"")}
    else if(leg){cache=parseCache(leg);if(N().idbSave)N().idbSave(CACHE_KEY,leg);ls(CACHE_KEY,"")}
    clearOldCaches();
    cacheLoaded=true;cacheP=null;return cache;
  },function(){cacheLoaded=true;cacheP=null;cache=parseCache(ls(CACHE_KEY));return cache});
  return cacheP}
function saveCache(){try{var k=Object.keys(cache);if(k.length>10000){var n={};k.slice(-8000).forEach(function(x){n[x]=cache[x]});cache=n}var raw=JSON.stringify(cache);if(N()&&N().idbSave){N().idbSave(CACHE_KEY,raw);if(ls(CACHE_KEY))ls(CACHE_KEY,"")}else ls(CACHE_KEY,raw)}catch(e){}}
function grid9x8(gray,x0,y0,w,h){
  var g=[],gy,gx,cw=w/9,ch=h/8,rx0,rx1,ry0,ry1,x,y,sum,cnt;
  for(gy=0;gy<8;gy++){
    ry0=Math.round(y0+gy*ch);ry1=Math.min(64,Math.max(ry0+1,Math.round(y0+(gy+1)*ch)));
    for(gx=0;gx<9;gx++){
      rx0=Math.round(x0+gx*cw);rx1=Math.min(72,Math.max(rx0+1,Math.round(x0+(gx+1)*cw)));
      sum=0;cnt=0;
      for(y=ry0;y<ry1;y++)for(x=rx0;x<rx1;x++){sum+=gray[y*72+x];cnt++}
      g.push(cnt?sum/cnt:0);
    }
  }
  return g}
function dhOf(g,mirror){
  var hx="",bits="",x,y,i,a,b;
  for(y=0;y<8;y++)for(x=0;x<8;x++){
    a=mirror?g[y*9+(8-x)]:g[y*9+x];
    b=mirror?g[y*9+(7-x)]:g[y*9+x+1];
    bits+=a>b?"1":"0";
  }
  for(i=0;i<64;i+=4)hx+=parseInt(bits.substr(i,4),2).toString(16);
  return{hx:hx,ones:bits.split("1").length-1}}
function hex2(n){var s=Math.max(0,Math.min(255,Math.round(n))).toString(16);return s.length<2?"0"+s:s}
function colorHex(px){
  var qs=[[9,8],[36,8],[9,32],[36,32]],out="",qi,x,y,r,g,b,p;
  for(qi=0;qi<4;qi++){
    r=g=b=0;
    for(y=qs[qi][1];y<qs[qi][1]+24;y++)for(x=qs[qi][0];x<qs[qi][0]+27;x++){
      p=(y*72+x)*4;r+=px[p];g+=px[p+1];b+=px[p+2];
    }
    out+=hex2(r/648)+hex2(g/648)+hex2(b/648);
  }
  return out}
function hashOf(s){
  if(cache[s]!==undefined)return Promise.resolve(cache[s]);
  if(inflight[s])return inflight[s];
  var p=new Promise(function(res){
    var s0=imgSrc(s,64),isLh=s0.indexOf("https://lh3.googleusercontent.com/")===0;
    var tries=isLh?[s0+"?dh=1",imgSrc(s,120)+"?dh=2",imgSrc(s,200)]:[s0];
    var step=0,done=false;
    function fin(h){if(done)return;done=true;if(h!==null&&String(s).indexOf("data:")!==0)cache[s]=h;delete inflight[s];res(h)}
    function next(){
      if(done)return;
      if(step>=tries.length){fin(null);return}
      var u=tries[step++],im=new Image(),settled=false;
      if(u.indexOf("https://lh3.googleusercontent.com/")===0)im.crossOrigin="anonymous";
      im.referrerPolicy="no-referrer";
      var t=setTimeout(fail,12000);
      function dropIm(){im.onload=im.onerror=null;try{im.src=""}catch(e){}}
      function fail(){if(settled||done)return;settled=true;clearTimeout(t);dropIm();setTimeout(next,step===1?400:700)}
      im.onload=function(){
        if(settled||done)return;settled=true;clearTimeout(t);
        try{
          if(!(im.naturalWidth||im.width)){dropIm();setTimeout(next,400);return}
          var cv=document.createElement("canvas");cv.width=72;cv.height=64;var cx=cv.getContext("2d",{willReadFrequently:true});cx.drawImage(im,0,0,72,64);
          dropIm();
          var px=cx.getImageData(0,0,72,64).data,gray=[],i,sum=0,sum2=0,l,Npx=4608;
          for(i=0;i<Npx;i++){l=px[i*4]*.299+px[i*4+1]*.587+px[i*4+2]*.114;gray.push(l);sum+=l;sum2+=l*l}
          var mean=sum/Npx;
          if(sum2/Npx-mean*mean<12)return fin("");   /* ảnh trắng trơn / đen đặc không có chi tiết: bỏ qua */
          var gF=grid9x8(gray,0,0,72,64),f=dhOf(gF,false);
          if(f.ones<=1||f.ones>=63)return fin("");   /* ảnh chuyển sắc hoàn toàn đơn điệu: bỏ qua */
          var fm=dhOf(gF,true),gC=grid9x8(gray,9,8,54,48),c=dhOf(gC,false),cm=dhOf(gC,true);
          fin(f.hx+":"+fm.hx+":"+c.hx+":"+cm.hx+":"+colorHex(px))
        }catch(e){dropIm();setTimeout(next,400)}};
      im.onerror=fail;
      im.src=u}
    next()});
  inflight[s]=p;return p}
function hx2(h){return[parseInt(h.slice(0,8),16)>>>0,parseInt(h.slice(8,16),16)>>>0]}
function parseSig(raw){
  if(!raw||typeof raw!=="string")return null;
  var p=raw.split(":");if(p.length<5)return null;
  var col=[],i;for(i=0;i<24;i+=2)col.push(parseInt(p[4].slice(i,i+2),16)||0);
  return{f:hx2(p[0]),fm:hx2(p[1]),c:hx2(p[2]),cm:hx2(p[3]),col:col}}
function hd(x,y){return pc(x[0]^y[0])+pc(x[1]^y[1])}
function colorDiff(c1,c2,mirror){
  var s1=0,s2=0,i;for(i=0;i<12;i++){s1+=c1[i];s2+=c2[i]}
  var sh=(s1-s2)/12;if(sh>75)sh=75;else if(sh<-75)sh=-75;
  var d=0;
  for(i=0;i<12;i++){
    var j=mirror?(i<6?(i<3?i+3:i-3):(i<9?i+3:i-3)):i;
    d+=Math.abs((c1[i]-sh)-c2[j]);
  }
  return d/12}
function cmpSig(a,b,th){
  var best=null,ct=Math.max(4,th-2),cmt=Math.max(4,th-2),cMin=Math.max(4,Math.floor(th*0.5)),boost=Math.max(0,th-10)*1.5;
  function tryM(d,lim,mirror,clim,k){
    if(d>lim)return;
    if(d>cMin&&colorDiff(a.col,b.col,mirror)>clim+boost)return;
    if(!best||d<best.d||(d===best.d&&k===""))best={d:d,k:k};
  }
  tryM(hd(a.f,b.f),th,false,66,"");
  tryM(hd(a.f,b.fm),Math.max(4,th-1),true,64,"m");
  tryM(hd(a.c,b.c),ct,false,72,"c");
  tryM(hd(a.c,b.f),ct,false,72,"c");
  tryM(hd(a.f,b.c),ct,false,72,"c");
  tryM(hd(a.c,b.cm),cmt,true,68,"cm");
  tryM(hd(a.c,b.fm),cmt,true,68,"cm");
  tryM(hd(a.f,b.cm),cmt,true,68,"cm");
  return best}
function matchJobs(jobs,Hm){
  var out=[],seen={},i,j,A=jobs.map(function(x){return Hm[x.s]}),m,k;
  for(i=0;i<jobs.length;i++)for(j=i+1;j<jobs.length;j++){
    if(jobs[i].it.id===jobs[j].it.id)continue;
    if(jobs[i].s===jobs[j].s)m={d:0,k:""};
    else if(A[i]&&A[j])m=cmpSig(A[i],A[j],TH);else continue;
    if(m){k=jobs[i].it.id+"|"+jobs[j].it.id+"|"+jobs[i].s+"|"+jobs[j].s;if(!seen[k]){seen[k]=1;out.push({a:jobs[i].it,b:jobs[j].it,x:jobs[i].s,y:jobs[j].s,d:m.d,k:m.k})}}}
  return out}
function ignImgNote(r){
  if(!r||!r.ign||!r.ign.length)return"";
  var n=0;r.ign.forEach(function(o){if(o.img&&o.img.length)n++});
  return n?" ("+n+" cặp đang ở mục “Không phải trùng”).":""}
function applyCachedPairs(){
  if(scanning||!cacheLoaded)return;
  var jobs=[],Hm={},src=activeItems(),hc=0;
  src.forEach(function(it){(it.im||[]).forEach(function(s){if(s){jobs.push({it:it,s:s});if(cache[s]&&!Hm[s]){var sg=parseSig(cache[s]);if(sg){Hm[s]=sg;hc++}}}})});
  if(hc<2||jobs.length<2)return;
  imgPairs=matchJobs(jobs,Hm);pairImgMsg={};
  var missed=0,seenM={};
  jobs.forEach(function(j){if(cache[j.s]===undefined&&!seenM[j.s]){seenM[j.s]=1;missed++}});
  var r=render(),note=ignImgNote(r);
  if(imgPairs.length||!missed){
    if(missed)msg("Đã đối chiếu từ bộ nhớ đệm: tìm thấy "+imgPairs.length+" cặp trùng ảnh (còn "+missed+" ảnh chưa quét — bấm “Quét ảnh trùng” để quét đủ)."+note);
    else msg("Đã đối chiếu "+hc+" ảnh đã lưu: tìm thấy "+imgPairs.length+" cặp ảnh giống nhau (lệch ≤ "+TH+"/64 bit)."+note);
  }}
function rescanFromCache(){
  if(scanning||imgPairs===null)return;
  loadCache().then(function(){
    var jobs=[],Hm={},src=activeItems();
    src.forEach(function(it){(it.im||[]).forEach(function(s){if(s){jobs.push({it:it,s:s});if(cache[s]&&!Hm[s]){var sg=parseSig(cache[s]);if(sg)Hm[s]=sg}}})});
    imgPairs=matchJobs(jobs,Hm);pairImgMsg={};
    var r=render(),note=ignImgNote(r);
    msg("Đã cập nhật theo độ nhạy mới (lệch ≤ "+TH+"/64 bit): tìm thấy "+imgPairs.length+" cặp ảnh giống nhau."+note)})}
function scan(){
  if(scanning)return;
  var src=activeItems(),sk=items.length-src.length,jobs=[];
  src.forEach(function(it){(it.im||[]).forEach(function(s){if(s)jobs.push({it:it,s:s})})});
  if(jobs.length<2){msg("Chưa đủ ảnh để so sánh"+(sk?" (đang bỏ qua "+sk+" căn Loại).":"."));return}
  var urls=[],seenU={};jobs.forEach(function(j){if(!seenU[j.s]){seenU[j.s]=1;urls.push(j.s)}});
  scanning=true;stopFlag=false;G("dupimg").disabled=true;G("dupstop").hidden=false;G("dupbar").hidden=false;
  var done=0,bad=0,skipFlat=0,idx=0,Hm={},bar=G("dupbar").firstChild;
  function upd(){bar.style.width=(done/urls.length*100)+"%";msg("Đang đọc ảnh "+done+"/"+urls.length+(bad?" ("+bad+" ảnh không đọc được)":"")+"…")}
  function worker(){
    if(stopFlag||idx>=urls.length)return Promise.resolve();
    var u=urls[idx++];
    return hashOf(u).then(function(h){if(h){var sg=parseSig(h);if(sg)Hm[u]=sg}else if(h===null)bad++;else skipFlat++;done++;if(done%50===0)saveCache();if(done%5===0||done===urls.length)upd()}).then(worker)}
  upd();
  loadCache().then(function(){
    return Promise.all([worker(),worker(),worker()]).then(function(){
      saveCache();
      var out=matchJobs(jobs,Hm);
      imgPairs=out;pairImgMsg={};
      scanning=false;G("dupimg").disabled=false;G("dupstop").hidden=true;G("dupbar").hidden=true;
      var r=render(),note=ignImgNote(r);
      var ok=urls.length-bad,extra=[];
      if(bad)extra.push(bad+" ảnh không đọc được");
      if(skipFlat)extra.push(skipFlat+" ảnh trơn ít chi tiết");
      var exTxt=extra.length?" ("+extra.join(", ")+")":"";
      if(stopFlag)msg("Đã dừng. Kết quả tính trên "+ok+" ảnh đã đọc.");
      else if(bad&&bad>=urls.length*0.8)msg("Hầu hết ảnh không đọc được (trình duyệt chặn đọc ảnh Drive hoặc mất mạng), nên chưa so sánh ảnh được. Kết quả bên dưới chỉ theo thông tin và mã ảnh.",1);
      else if(!out.length)msg("Đã so "+ok+" ảnh"+exTxt+": không tìm thấy ảnh nào trùng nhau (ngưỡng giống nhau: lệch ≤ "+TH+"/64 bit). Ảnh chụp lại cùng một căn từ góc khác có thể không bị bắt.");
      else msg("Đã so "+ok+" ảnh"+exTxt+", tìm thấy "+out.length+" cặp ảnh giống nhau. Ảnh chụp lại cùng một căn từ góc khác có thể không bị bắt."+note)})})}

function onPairClick(e){
  var mo=e.target.closest("[data-more]");if(mo){if(mo.dataset.more==="ign")limIgn+=LIMIT;else limMain+=LIMIT;render();return}
  var cz=e.target.closest("[data-cmpzoom]");if(cz){openCmpZoom(cz.dataset.cmpzoom);return}
  var z=e.target.closest("[data-zoom]");if(z){openZoom(z.dataset.zoom);return}
  var itg=e.target.closest("[data-imgtog]");if(itg){toggleImgPair(itg);return}
  var ci=e.target.closest("[data-chkimg]");if(ci){checkPairImg(ci);return}
  var ig=e.target.closest("[data-ign]");if(ig){ignorePair(ig,true);return}
  var ug=e.target.closest("[data-unign]");if(ug){ignorePair(ug,false);return}
  var dl=e.target.closest("[data-del]");if(dl){delItem(dl);return}
  var ed=e.target.closest("[data-edit]");if(ed){editItem(ed.dataset.edit);return}
  var t=e.target.closest("[data-tog]");if(t){togglePair(t)}}
function onPairChange(e){
  var sel=e.target.closest("[data-imgmode]");
  if(sel)changeImgMode(sel)}
function goMain(){showIgn=false;render();G("dupd").scrollTop=0}
function init(nt){
  if(nt)NT=nt;
  if(inited)return;
  inited=true;
  var st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);
  var box=document.createElement("div");box.innerHTML=DLG;document.body.appendChild(box.firstChild);
  var b=G("dupb"),h1=document.querySelector(".wrap h1")||document.querySelector("h1");
  if(!b){
    b=document.createElement("button");
    b.className="dpbtn";b.id="dupb";b.type="button";b.textContent="Kiểm tra trùng";
  }else{
    b.className="dpbtn";
  }
  if(h1&&h1.parentNode){
    var hdr=h1.parentNode;
    if(!hdr.classList.contains("dphdr")){
      hdr=document.createElement("div");hdr.className="dphdr";
      h1.parentNode.insertBefore(hdr,h1);
      hdr.appendChild(h1);
    }
    var hdra=hdr.querySelector(".hdra");
    if(hdra){if(b.parentNode!==hdra)hdra.insertBefore(b,hdra.firstChild)}
    else if(b.parentNode!==hdr)hdr.appendChild(b);
  }else if(!b.parentNode){
    var tools=document.querySelector(".tools");
    if(tools)tools.insertBefore(b,tools.children[1]||null);else document.body.appendChild(b);
  }
  if(!b.onclick)b.onclick=function(){open()};
  G("dupx").onclick=close;
  G("dupx2").onclick=close;
  G("dupzx").onclick=closeZoom;
  G("dupzx2").onclick=closeZoom;
  G("dupzlay").onclick=function(){
    if(zoomCmp){zoomCmp.stack=!zoomCmp.stack;renderCmpZoom()}
    else{
      var zg=G("dupzg"),sk=!zg.classList.contains("stack");
      zg.classList.toggle("stack",sk);
      G("dupzlay").textContent=sk?"Cạnh nhau":"Xếp dọc";
    }
  };
  G("dupz1").onclick=function(){stepCmpZoom("a",1)};
  G("dupz2").onclick=function(){stepCmpZoom("b",1)};
  G("dupz1prev").onclick=function(){stepCmpZoom("a",-1)};
  G("dupz1next").onclick=function(){stepCmpZoom("a",1)};
  G("dupz2prev").onclick=function(){stepCmpZoom("b",-1)};
  G("dupz2next").onclick=function(){stepCmpZoom("b",1)};
  G("dupz").onclick=function(e){if(e.target===this)closeZoom()};
  G("dupd").addEventListener("cancel",function(e){
    if(closeZoom()){e.preventDefault();return}
    if(showIgn){e.preventDefault();goMain()}
  });
  G("dupsens").onchange=function(){TH=+this.value||10;rescanFromCache()};
  G("dupimgv").onchange=function(){
    var v=this.value;
    imgAutoMode=(v==="both"||v==="stack")?v:"manual";
    try{ls("dimgv",imgAutoMode)}catch(e){}
    openImgSet={};pairImgMode={};render();
  };
  G("dupnoout").onchange=function(){skipOut=this.checked;try{ls("dnoout",skipOut?"1":"0")}catch(e){}limMain=LIMIT;if(imgPairs!==null)rescanFromCache();else{render();applyCachedPairs()}};
  G("dupimg").onclick=function(){items=N().items();scan()};
  G("dupstop").onclick=function(){stopFlag=true};
  G("duptog").onclick=function(){showOne=!showOne;render()};
  G("dupigntog").onclick=function(){showIgn=true;render();G("dupd").scrollTop=0};
  G("dupback").onclick=goMain;
  G("dupback2").onclick=goMain;
  G("dupignclr").onclick=function(){
    if(!confirm("Khôi phục tất cả các cặp đã đánh dấu về lại danh sách kiểm tra trùng?"))return;
    ignored={};saveIgnored();goMain()};
  G("dupl").onclick=onPairClick;
  G("dupignl").onclick=onPairClick;
  G("dupl").onchange=onPairChange;
  G("dupignl").onchange=onPairChange}
function open(nt){
  if(nt)NT=nt;
  if(!N()){alert("Ứng dụng đang tải, thử lại sau vài giây.");return}
  init(N());
  loadSkip();
  loadImgMode();
  G("dupsens").value=String(TH);
  G("dupimgv").value=imgAutoMode;
  G("dupnoout").checked=skipOut;
  items=N().items();cleanImgPairs();limMain=limIgn=LIMIT;openSet={};openImgSet={};pairImgMode={};pairImgMsg={};zoomCmp=null;showIgn=false;msg(imgPairs&&imgPairs.length?"Đang hiện "+imgPairs.length+" cặp ảnh giống nhau (lệch ≤ "+TH+"/64 bit).":"");G("dupbar").hidden=true;G("dupstop").hidden=true;G("dupz").hidden=true;render();
  if(!G("dupd").open)G("dupd").showModal();G("dupd").scrollTop=0;
  loadCache().then(function(){if(G("dupd").open&&!scanning&&imgPairs===null)applyCachedPairs()})}
function close(){
  stopFlag=true;zoomCmp=null;
  var z=G("dupz"),d=G("dupd");
  if(z)z.hidden=true;
  if(d&&d.open)d.close()}
function sync(){
  var d=G("dupd");if(!(d&&d.open&&N()))return;
  clearTimeout(syncT);syncT=setTimeout(function(){
    items=N().items();cleanImgPairs();
    loadIgnored();var byId={},chg=false;items.forEach(function(it){byId[it.id]=1});
    Object.keys(ignored).forEach(function(k){var ids=k.split("|");if(!byId[ids[0]]||!byId[ids[1]]){delete ignored[k];chg=true}});
    if(chg)saveIgnored();
    render()
  },120)}

window.Dup={init:init,open:open,close:close,sync:sync,closeZoom:closeZoom};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){init()});
else init();
})();
