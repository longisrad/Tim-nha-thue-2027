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
var CSS=".dphdr{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:3px 0 12px}\n.dphdr h1{margin:0;min-width:0;font-size:clamp(19px,5.5vw,26px)}\n.dphdr+.sub{color:var(--mute);font-size:var(--fs-s);margin:-6px 0 12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n@media (max-height:820px){.dphdr+.sub{display:none}}\n.dpbtn{flex:none;display:inline-flex;align-items:center;min-height:34px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:var(--fs-s);font-weight:700;cursor:pointer;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.06);transition:transform .12s ease,background-color .2s ease,border-color .2s ease,color .2s ease}\n.dpbtn:active{transform:scale(.96)}\n#dupl,#dupignl,.dpc,.dprow{min-width:0}\n#dupmain[hidden],#dupignview[hidden],.dpbar2[hidden],.dpdet[hidden],.dpimgs[hidden],.dpz[hidden],.dpzctrl[hidden],.dpzstage img[hidden],.dpzempty[hidden]{display:none}\n.dpc{border:1px solid var(--line);border-left:4px solid var(--mute);border-radius:12px;padding:6px 12px 10px;margin-top:8px;background:var(--surface)}\n.dpc.im{border-left-color:var(--danger)}\n.dpc.pu{border-left-color:#7c3aed}\n.dpc.gr{border-left-color:#9ca3af}\n.dprow{display:flex;align-items:center;gap:6px}\n.dprow+.dprow{border-top:1px dashed var(--line)}\n.dpr{display:flex;gap:8px;align-items:center;justify-content:space-between;flex:1;min-width:0;padding:8px 0}\n.dpt{min-width:0;flex:1;overflow:hidden}.dpt b{display:block;font-size:var(--fs-b);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpt small{display:block;color:var(--mute);font-size:var(--fs-s);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpedit,.dpdel{flex:none;border:1px solid var(--line);background:var(--bg);border-radius:8px;padding:4px 9px;min-height:30px;font-size:var(--fs-s);font-weight:600;cursor:pointer;white-space:nowrap}\n.dpedit{color:var(--accent)}\n.dpdel{color:var(--danger)}\n.dpdel:disabled{opacity:.5;cursor:default}\n.dpw{display:flex;flex-wrap:wrap;gap:4px;margin-top:2px}\n.dpw span{font-size:var(--fs-s);font-weight:600;padding:2px 9px;border-radius:999px;background:var(--bg);border:1px solid var(--line);color:var(--ink)}\n.dpw span.im{background:var(--danger);border-color:var(--danger);color:#fff}\n.dpn[data-tog],.dpw[data-tog]{cursor:pointer}\n.dpm{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;margin-top:8px}\n.dpm div{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:2px;cursor:zoom-in;min-width:0}\n.dpm img{width:100%;height:64px;object-fit:cover;border-radius:6px;background:var(--line);display:block}\n.dpbar2{display:flex;flex-wrap:wrap;align-items:center;gap:8px}\n.dpignbtn{border:1px solid var(--s-contact);background:var(--b-contact);color:var(--s-contact);border-radius:999px;padding:4px 12px;min-height:32px;font-size:var(--fs-s);font-weight:700;cursor:pointer}\n.dphead{display:flex;align-items:center;gap:10px;flex-wrap:wrap}\n.dphead h2{margin:0}\n.dphead .btn{min-height:34px;padding:5px 10px}\n.dpsens{display:flex;align-items:center;gap:8px;flex-wrap:wrap}\n.dpsens label{margin:0;white-space:nowrap}\n.dpsens select{width:auto;flex:1;min-width:180px;min-height:36px;padding:4px 8px;font-size:var(--fs-s)}\n.dpopt{display:inline-flex;align-items:center;gap:6px;font-size:var(--fs-s);font-weight:600;color:var(--ink);cursor:pointer;margin:0}\n.dpopt input{width:auto;min-height:0;accent-color:var(--accent)}\n.dpb{height:6px;border-radius:3px;background:var(--line);overflow:hidden}\n.dpb i{display:block;height:100%;width:0;background:var(--accent);transition:width .2s}\n.dpc.im .dpn{color:var(--danger)}\n.dpc.pu .dpn{color:#7c3aed}\n.dpn{font-size:var(--fs-s);font-weight:700;color:var(--ink);margin:6px 0 0}\n.dpa{margin-top:8px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}\n.dpno{border:1px solid var(--s-contact);background:var(--b-contact);color:var(--s-contact);border-radius:999px;padding:4px 11px;min-height:30px;font-size:var(--fs-s);font-weight:700;cursor:pointer}\n.dpno.undo{color:var(--ink);border-color:var(--line);background:var(--bg)}\n.dpchk{border:1px solid var(--s-seen);background:var(--b-seen);color:var(--s-seen);border-radius:999px;padding:4px 11px;min-height:30px;font-size:var(--fs-s);font-weight:700;cursor:pointer}\n.dpchk:disabled{opacity:.6;cursor:default}\n.dpimgbtn{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:999px;padding:4px 11px;min-height:30px;font-size:var(--fs-s);font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:4px}\n.dpimgbtn[aria-expanded=\"true\"]{background:var(--s-new);border-color:var(--s-new);color:var(--surface)}\n.dpimgbtn:disabled{opacity:.55;cursor:default}\n.dpv{font-size:var(--fs-s);font-weight:600;margin-left:auto}\n.dpst{margin:6px 0 0;font-size:var(--fs-s);color:var(--mute)}\n.dpst.ok{color:var(--s-won);font-weight:700}\n.dpst.bad{color:var(--danger);font-weight:700}\n.dpdet,.dpimgs{margin-top:8px;padding-top:8px;border-top:1px dashed var(--line)}\n.dpimgbar{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px}\n.dpimgbar b{font-size:var(--fs-s);color:var(--ink)}\n.dpimgbar select{width:auto;min-width:165px;min-height:32px;padding:3px 8px;font-size:var(--fs-s);border-radius:8px}\n.dpcmps{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;align-items:stretch}\n.dpcmps.stack,.dpcmps.single{grid-template-columns:minmax(0,1fr)}\n.dpcmp{border:1px solid var(--line);border-radius:10px;padding:7px;background:var(--bg);min-width:0;display:flex;flex-direction:column}\n.dpcmph{display:flex;align-items:baseline;justify-content:space-between;gap:6px;margin-bottom:4px;min-width:0}\n.dpcmph b{font-size:var(--fs-s);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}\n.dpcmph span{flex:none;font-size:11px;font-weight:700;color:var(--mute)}\n.dpcmpm{font-size:11px;color:var(--mute);margin:0 0 6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-height:15px}\n.dpthumbs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px}\n.dpcmps.stack .dpthumbs,.dpcmps.single .dpthumbs{grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:6px}\n@media (min-width:600px){.dpcmps.both .dpthumbs{grid-template-columns:repeat(3,minmax(0,1fr))}}\n.dpth{position:relative;display:block;width:100%;min-width:0;min-height:0;border:1px solid var(--line);border-radius:7px;overflow:hidden;padding:0;background:var(--surface);cursor:zoom-in;aspect-ratio:4/3}\n.dpth.hit{border:2px solid var(--danger)}\n.dpth img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;background:var(--line)}\n.dpth i{position:absolute;left:3px;top:3px;font-style:normal;font-size:10px;font-weight:700;padding:1px 5px;border-radius:999px;background:var(--danger);color:#fff;line-height:1.3;pointer-events:none;z-index:1}\n.dpth u{position:absolute;right:3px;bottom:3px;text-decoration:none;font-size:10px;font-weight:700;padding:1px 5px;border-radius:6px;background:rgba(0,0,0,.62);color:#fff;line-height:1.3;pointer-events:none;z-index:1}\n.dpmess{font-size:var(--fs-s);color:var(--mute);font-style:italic;margin:8px 0 4px;text-align:center}\n.dpfs{display:grid;gap:6px}\n.dpf{border:1px solid var(--line);border-radius:8px;padding:6px 8px;background:var(--bg)}\n.dpf.hit{border-color:var(--mute);background:var(--surface)}\n.dpfl{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:4px}\n.dpfl b{font-size:var(--fs-s)}\n.dptag{font-size:11px;font-weight:700;padding:1px 7px;border-radius:999px;background:var(--s-new);color:var(--surface)}\n.dpfc{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:var(--fs-s)}\n.dpfc small{display:block;color:var(--mute);font-size:11px}\n.dpfc span{display:block;overflow-wrap:anywhere;word-break:break-word}\n.dpfc a{color:var(--s-seen);text-decoration:underline;overflow-wrap:anywhere;word-break:break-all}\n.dpe{color:var(--mute);font-style:italic}\n.dpi{margin-top:8px}\n.dpil{margin:0 0 6px;font-size:var(--fs-s);font-weight:700;color:var(--danger)}\n.dpig{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px}\n.dpip{border:1px solid var(--line);border-radius:8px;padding:4px;background:var(--bg);cursor:zoom-in;text-align:center;font:inherit;color:inherit}\n.dpip span{display:grid;grid-template-columns:1fr 1fr;gap:2px}\n.dpip img{width:100%;height:72px;object-fit:cover;border-radius:5px;background:var(--line);display:block}\n.dpip small{display:block;margin-top:3px;font-size:11px;color:var(--mute)}\n.dpz{position:fixed;inset:0;z-index:20;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;padding:calc(12px + env(safe-area-inset-top,0px)) 12px calc(12px + env(safe-area-inset-bottom,0px));overscroll-behavior:contain}\n.dpzb{background:var(--surface);color:var(--ink);border-radius:12px;padding:12px;width:min(760px,100%);max-height:calc(100dvh - 24px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}\n.dpzhdr{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}\n.dpzt{margin:0;font-weight:700;font-size:var(--fs-b);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpzlay,.dpzcls{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:8px;padding:4px 10px;min-height:32px;font-size:var(--fs-s);font-weight:600;cursor:pointer;white-space:nowrap;flex:none}\n.dpzcls{min-width:32px;padding:4px 8px;font-size:16px;line-height:1}\n.dpzg{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;align-items:stretch}\n.dpzg.stack{grid-template-columns:minmax(0,1fr)}\n.dpzcol{min-width:0;display:flex;flex-direction:column;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:8px}\n.dpzstage{position:relative;width:100%;height:clamp(210px,44dvh,420px);border-radius:8px;background:var(--surface);border:1px solid var(--line);overflow:hidden;display:flex;align-items:center;justify-content:center}\n.dpzg.stack .dpzstage{height:clamp(180px,33dvh,320px)}\n.dpzstage img{position:absolute;inset:0;width:100%;height:100%;padding:4px;object-fit:contain;display:block;cursor:pointer}\n.dpzempty{font-size:var(--fs-s);color:var(--mute);font-style:italic;padding:8px;text-align:center}\n.dpzmeta{margin-top:6px;text-align:center;min-width:0}\n.dpzmeta b{display:block;font-size:var(--fs-s);color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.35}\n.dpzmeta small{display:block;margin-top:1px;font-size:11px;color:var(--mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.35;min-height:15px}\n.dpzctrl{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:6px;min-height:32px}\n.dpzctrl.ghost{visibility:hidden;pointer-events:none}\n.dpzctrl button{border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:8px;min-width:38px;min-height:32px;padding:2px 10px;font-size:16px;font-weight:700;cursor:pointer}\n.dpzctrl button:disabled{opacity:.4;cursor:default}\n.dpzctrl span{font-size:var(--fs-s);font-weight:700;color:var(--ink);min-width:46px;text-align:center}\n.dpundo{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:30;display:flex;align-items:center;gap:8px;max-width:calc(100vw - 24px);background:var(--ink);color:var(--surface);border-radius:12px;padding:8px 8px 8px 14px;box-shadow:0 6px 20px rgba(0,0,0,.3);font-size:var(--fs-s)}\n.dpundo[hidden]{display:none}\n.dpundo span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpundo button{border:0;border-radius:8px;min-height:32px;padding:4px 12px;font-size:var(--fs-s);font-weight:700;cursor:pointer;background:var(--surface);color:var(--ink);white-space:nowrap}\n.dpundo button.x{background:transparent;color:inherit;padding:4px 8px}\n";
var CSS2=[
"@keyframes dpin{from{opacity:0}to{opacity:1}}",
"@keyframes dpfade{from{opacity:0}to{opacity:1}}",
"@keyframes dpzin{from{opacity:0;transform:translateY(14px) scale(.93)}to{opacity:1;transform:none}}",
"@keyframes dpopen{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:none}}",
"@keyframes dpnext{from{opacity:0;transform:translateX(34px)}to{opacity:1;transform:none}}",
"@keyframes dpprev{from{opacity:0;transform:translateX(-34px)}to{opacity:1;transform:none}}",
"@keyframes dpslide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}",
"@keyframes dpspin{to{transform:rotate(360deg)}}",
".dpc{content-visibility:auto;contain-intrinsic-size:auto 230px}",
".dpl{animation:dpin .4s cubic-bezier(.2,.7,.2,1) both}",
".dpl0{animation:none}",
".dpth{transition:transform .15s ease}",
".dpth:active{transform:scale(.97)}",
".dpth.hit{box-shadow:0 0 0 1px var(--danger)}",
".dpmore{grid-column:1/-1;border:1px dashed var(--line);background:var(--surface);color:var(--mute);border-radius:8px;min-height:34px;font-size:var(--fs-s);font-weight:700;cursor:pointer}",
"@media (hover:hover){.dpbtn:hover{background:var(--b-new);border-color:var(--mute);color:var(--ink)}.dpedit:hover{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}.dpdel:hover{background:var(--danger);border-color:var(--danger);color:#fff}.dpignbtn:hover,.dpno:hover,.dpchk:hover,.dpimgbtn:hover:not(:disabled){filter:brightness(.95)}.dpmore:hover{color:var(--ink);border-color:var(--mute)}}",
".dpimgact{display:flex;align-items:center;gap:6px;flex-wrap:wrap}",
".dpimgs.dpopen{animation:dpslide .26s cubic-bezier(.2,.8,.2,1)}",
".dpz:not([hidden]){animation:dpfade .22s ease}",
".dpz:not([hidden]) .dpzb{animation:dpzin .36s cubic-bezier(.2,.9,.25,1.08)}",
".dpzm{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 0 8px;padding-bottom:2px}",
".dpzm::-webkit-scrollbar{display:none}",
".dpzm[hidden]{display:none}",
".dpzj{flex:none;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:999px;padding:3px 11px;min-height:30px;font-size:var(--fs-s);font-weight:700;cursor:pointer;transition:transform .12s ease,background-color .2s ease,border-color .2s ease,color .2s ease}",
".dpzj:active{transform:scale(.96)}",
".dpzj.cur{background:var(--danger);border-color:var(--danger);color:#fff}",
".dpzcol{transition:border-color .2s ease}",
".dpzcol.act{border-color:var(--accent)}",
".dpzstage{touch-action:pan-y;-webkit-user-select:none;user-select:none}",
".dpzstage img{transition:opacity .25s ease}",
".dpzstage.busy img{opacity:.55}",
".dpzstage::after{content:'';position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;border:3px solid var(--line);border-top-color:var(--accent);opacity:0;pointer-events:none;transition:opacity .2s}",
".dpzstage.busy::after{opacity:1;transition-delay:.15s;animation:dpspin .8s linear infinite}",
".dpzstage img.a-open{animation:dpopen .32s cubic-bezier(.2,.9,.25,1.12)}",
".dpzstage img.a-next{animation:dpnext .28s cubic-bezier(.2,.8,.2,1)}",
".dpzstage img.a-prev{animation:dpprev .28s cubic-bezier(.2,.8,.2,1)}",
".dpz.stk{padding:0;background:#000}",
".dpz.stk .dpzb{width:100%;max-height:none;height:100vh;height:100dvh;border-radius:0;padding:calc(6px + env(safe-area-inset-top,0px)) 0 env(safe-area-inset-bottom,0px);background:#000;color:#fff;display:flex;flex-direction:column;overflow:hidden}",
".dpz.stk .dpzhdr{flex:none;margin:0;padding:0 8px 4px}",
".dpz.stk .dpzt{color:#fff}",
".dpz.stk .dpzlay,.dpz.stk .dpzcls{background:rgba(255,255,255,.14);border:0;color:#fff}",
".dpz.stk .dpzm{flex:none;margin:0;padding:0 8px 4px}",
".dpz.stk .dpzm .dpzj:not(.cur){background:rgba(255,255,255,.14);border-color:transparent;color:#fff}",
".dpz.stk .dpzg{flex:1;min-height:0;grid-template-rows:minmax(0,1fr) minmax(0,1fr);gap:2px}",
".dpz.stk .dpzcol{position:relative;min-height:0;background:none;border:0;border-radius:0;padding:0}",
".dpz.stk .dpzcol.act{box-shadow:inset 0 0 0 2px var(--accent)}",
".dpz.stk .dpzg .dpzstage{flex:1;height:auto;min-height:0;border:0;border-radius:0;background:#000}",
".dpz.stk .dpzstage img{padding:0}",
".dpz.stk .dpzmeta{position:absolute;left:6px;bottom:6px;right:112px;margin:0;text-align:left;pointer-events:none;z-index:1;background:rgba(0,0,0,.55);border-radius:8px;padding:2px 8px;width:fit-content;max-width:calc(100% - 118px)}",
".dpz.stk .dpzmeta b,.dpz.stk .dpzmeta small{color:#fff}",
".dpz.stk .dpzmeta small{min-height:0}",
".dpz.stk .dpzctrl{position:absolute;right:6px;bottom:6px;z-index:1;margin:0;min-height:0;gap:2px;background:rgba(0,0,0,.55);border-radius:10px;padding:2px}",
".dpz.stk .dpzctrl button{background:transparent;border:0;color:#fff;min-width:34px}",
".dpz.stk .dpzctrl span{color:#fff;min-width:40px}",
".dpz.stk .foot{display:none}",
".dpz.stk.side .dpzg{grid-template-rows:minmax(0,1fr);grid-template-columns:minmax(0,1fr) minmax(0,1fr)}",
".dpz.stk.side .dpzmeta{right:6px;max-width:calc(100% - 12px)}",
".dpz.stk.side .dpzcol:has(.dpzctrl:not([hidden])) .dpzmeta{bottom:42px}",
".dpz.stk.side .dpzcol+.dpzcol{box-shadow:-1px 0 0 rgba(255,255,255,.18)}",
"#dupsum{font-size:var(--fs-b);font-weight:700;color:var(--ink);margin:2px 0 8px}",
"#dupsum:empty,#dupm:empty,#dupignsum:empty{display:none}",
"#dupm{margin:6px 0 4px}",
".dpset{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:6px 10px;margin:6px 0}",
".dpset .dpsens{flex-wrap:nowrap;gap:6px}",
".dpset .dpsens label{font-size:var(--fs-s);color:var(--mute);font-weight:600}",
".dpset .dpsens select{min-width:0}",
".dpact{display:flex;align-items:center;justify-content:space-between;gap:8px 12px;flex-wrap:wrap;margin:4px 0 8px}",
".dpact .foot2{display:flex;gap:6px;margin:0;padding:0;border:0;background:none}",
".dpbar2{margin:2px 0 6px;gap:6px}",
".dpc{padding:2px 10px 8px;margin-top:6px}",
".dpr{padding:6px 0}",
".dpn{margin:5px 0 3px}",
".dpa{margin-top:6px;gap:5px}",
".dpa .dpno,.dpa .dpchk,.dpa .dpimgbtn{min-height:28px;padding:3px 10px}",
".dpedit,.dpdel{min-height:28px;padding:3px 8px}",
".dpm{margin-top:6px}",
".dpm img{height:56px}",
".dpst{margin:4px 0 0}",
"@media (max-width:420px){.dpa .dpv{margin-left:0;flex-basis:100%;text-align:left}.dpset{grid-template-columns:minmax(0,1fr)}}",
"@media (prefers-reduced-motion:reduce){.dpz,.dpz *,.dpimgs,.dpl,.dpth img,.dpm img,.dpip img,.dpzstage::after{animation:none!important;transition:none!important}}"
].join("\n");
var DLG="<dialog id=\"dupd\"><div class=\"form\" id=\"dupmain\">\n  <h2>Kiểm tra trùng</h2>\n  <p class=\"pm\" id=\"dupsum\"></p>\n  <div class=\"dpbar2\" id=\"duplinks\" hidden><button type=\"button\" class=\"link\" id=\"duptog\" hidden></button><button type=\"button\" class=\"dpignbtn\" id=\"dupigntog\" hidden></button></div>\n  <div class=\"dpset\"><div class=\"dpsens\"><label for=\"dupsens\">Độ nhạy ảnh</label><select id=\"dupsens\"><option value=\"6\">Ít nhầm (6/64 bit)</option><option value=\"10\">Bình thường (10/64 bit)</option><option value=\"14\" selected>Nhạy (14/64 bit — mặc định)</option><option value=\"18\">Rất nhạy (18/64 bit)</option></select></div>\n  <div class=\"dpsens\"><label for=\"dupvf\">Kiểm tra lần hai (so điểm ảnh)</label><select id=\"dupvf\"><option value=\"0\">Tắt (chỉ dùng hash)</option><option value=\"1\" selected>Vừa (mặc định)</option><option value=\"2\">Chặt (ít nhầm nhất)</option></select></div>\n  <div class=\"dpsens\"><label for=\"dupimgv\">Cách xem ảnh</label><select id=\"dupimgv\"><option value=\"manual\" selected>Đóng sẵn · bấm “Xem ảnh” ở từng cặp</option><option value=\"both\">Mở sẵn · so sánh 2 căn cạnh nhau</option><option value=\"stack\">Mở sẵn · xếp dọc từng căn</option></select></div></div>\n  <div class=\"dpact\"><label class=\"dpopt\"><input type=\"checkbox\" id=\"dupnoout\"><span>Bỏ qua căn đã “Loại”</span></label>\n  <div class=\"foot2\"><button class=\"btn p\" type=\"button\" id=\"dupimg\">Quét ảnh trùng</button><button class=\"btn\" type=\"button\" id=\"dupstop\" hidden>Dừng</button></div></div>\n  <div class=\"dpb\" id=\"dupbar\" hidden><i></i></div>\n  <p class=\"pm\" id=\"dupm\" role=\"status\"></p>\n  <div id=\"dupl\"></div>\n  <div class=\"foot\"><button class=\"btn p\" type=\"button\" id=\"dupx\">Đóng</button></div>\n</div><div class=\"form\" id=\"dupignview\" hidden>\n  <div class=\"dphead\"><button type=\"button\" class=\"btn\" id=\"dupback\">← Quay lại</button><h2>Không phải trùng</h2></div>\n  <p class=\"pm\" id=\"dupignsum\"></p>\n  <button type=\"button\" class=\"link\" id=\"dupignclr\" hidden>Khôi phục tất cả về danh sách kiểm tra</button>\n  <div id=\"dupignl\"></div>\n  <div class=\"foot\"><button class=\"btn\" type=\"button\" id=\"dupback2\">← Quay lại</button><button class=\"btn p\" type=\"button\" id=\"dupx2\">Đóng</button></div>\n</div><div class=\"dpz\" id=\"dupz\" hidden><div class=\"dpzb\"><div class=\"dpzhdr\"><p class=\"dpzt\" id=\"dupzt\"></p><button type=\"button\" class=\"dpzlay\" id=\"dupzlay\">Xếp dọc</button><button type=\"button\" class=\"dpzcls\" id=\"dupzx2\" aria-label=\"Đóng\">×</button></div><div class=\"dpzm\" id=\"dupzm\" hidden></div><div class=\"dpzg\" id=\"dupzg\"><div class=\"dpzcol\"><div class=\"dpzstage\"><img id=\"dupz1\" alt=\"Ảnh căn 1\"><span class=\"dpzempty\" id=\"dupze1\" hidden>Chưa có ảnh</span></div><div class=\"dpzmeta\"><b id=\"dupz1n\"></b><small id=\"dupz1m\"></small></div><div class=\"dpzctrl\" id=\"dupzc1\" hidden><button type=\"button\" id=\"dupz1prev\" aria-label=\"Ảnh trước căn 1\">‹</button><span id=\"dupz1c\"></span><button type=\"button\" id=\"dupz1next\" aria-label=\"Ảnh sau căn 1\">›</button></div></div><div class=\"dpzcol\"><div class=\"dpzstage\"><img id=\"dupz2\" alt=\"Ảnh căn 2\"><span class=\"dpzempty\" id=\"dupze2\" hidden>Chưa có ảnh</span></div><div class=\"dpzmeta\"><b id=\"dupz2n\"></b><small id=\"dupz2m\"></small></div><div class=\"dpzctrl\" id=\"dupzc2\" hidden><button type=\"button\" id=\"dupz2prev\" aria-label=\"Ảnh trước căn 2\">‹</button><span id=\"dupz2c\"></span><button type=\"button\" id=\"dupz2next\" aria-label=\"Ảnh sau căn 2\">›</button></div></div></div><div class=\"foot\"><button class=\"btn p\" type=\"button\" id=\"dupzx\">Đóng</button></div></div></div><div class=\"dpundo\" id=\"dupundo\" hidden><span id=\"dupundot\"></span><button type=\"button\" id=\"dupundob\">↶ Hoàn tác</button><button type=\"button\" class=\"x\" id=\"dupundox\" aria-label=\"Ẩn\">✕</button></div></dialog>";
var TH=14,VL=1,MIN=2,imgPairs=null,scanning=false,stopFlag=false,cache={},cacheLoaded=false,cacheP=null,inflight={},LIMIT=50,limMain=50,limIgn=50,memo=null,syncT=0,showOne=false,showIgn=false,skipOut=true,skipLoaded=false,imgAutoMode="manual",imgModeLoaded=false,viewList=[],openSet={},openImgSet={},pairImgMode={},ignored={},ignLoaded=false,pairImgMsg={},zoomCmp=null;

/* ---------- Lưu danh sách "không phải trùng" vào localStorage ---------- */
var undoSt=[],zlay=null,cmpAll={};
function undoUi(){var b=G("dupundo"),u=undoSt[undoSt.length-1];if(!b)return;b.hidden=!u;if(u){G("dupundot").textContent=u.l;G("dupundob").textContent="↶ Hoàn tác"+(undoSt.length>1?" ("+undoSt.length+")":"")}}
function undoPush(l,a){if(!a||!a.length)return;undoSt.push({l:l,a:a});if(undoSt.length>30)undoSt.shift();undoUi()}
var ignDirty={},dsBusy=false,dsAgain=false,dsT=0,pullP=null,lastPull=0,ignIdbDone=false;
function ignWriteLs(){
  var qStr=Object.keys(ignDirty).length?JSON.stringify(ignDirty):"";
  try{ls("dign1",JSON.stringify(ignored));ls("dign1q",qStr)}catch(e){}
  if(N()&&N().idbSave){N().idbSave("dign1",JSON.stringify(ignored));N().idbSave("dign1q",qStr)}
}
function loadIgnored(){
  if(!ignLoaded){
    ignLoaded=true;
    try{ignored=JSON.parse(ls("dign1")||"{}")||{}}catch(e){ignored={}}
    try{ignDirty=JSON.parse(ls("dign1q")||"{}")||{}}catch(e){ignDirty={}}
    if(!ignored||typeof ignored!=="object")ignored={};
    if(!ignDirty||typeof ignDirty!=="object")ignDirty={};
    try{if(ls("dign1s"))ls("dign1s","")}catch(e){}
  }
  if(!ignIdbDone&&!ls("dign1")&&N()&&N().idbGet){
    ignIdbDone=true;
    Promise.all([N().idbGet("dign1").catch(function(){return null}),N().idbGet("dign1q").catch(function(){return null})]).then(function(v){
      var chg=false;
      if(typeof v[0]==="string"&&v[0]&&!ls("dign1")){
        try{var o0=JSON.parse(v[0]);if(o0&&typeof o0==="object"){Object.keys(o0).forEach(function(k){if(!(k in ignored)&&!(k in ignDirty)){ignored[k]=o0[k];chg=true}})}}catch(e){}
      }
      if(typeof v[1]==="string"&&v[1]&&!ls("dign1q")){
        try{var o1=JSON.parse(v[1]);if(o1&&typeof o1==="object"){Object.keys(o1).forEach(function(k){if(!(k in ignDirty)){ignDirty[k]=o1[k];if(o1[k]>0)ignored[k]=o1[k];else delete ignored[k];chg=true}})}}catch(e){}
      }
      if(chg){ignWriteLs();var dd=G("dupd");if(dd&&dd.open)render()}
    });
  }
}
function saveIgnored(now){
  ignWriteLs();clearTimeout(dsT);
  if(now){dsT=0;pushIgnored()}
  else dsT=setTimeout(function(){dsT=0;pushIgnored()},150);
}
function flushIgnored(){if(dsT){clearTimeout(dsT);dsT=0;pushIgnored()}else if(Object.keys(ignDirty).length)pushIgnored()}
function undoDo(){var u=undoSt.pop();if(!u)return;loadIgnored();u.a.forEach(function(x){if(x.p===undefined){delete ignored[x.k];ignDirty[x.k]=0}else{ignored[x.k]=x.p;ignDirty[x.k]=x.p}});saveIgnored();undoUi();render()}
/* Đồng bộ cặp "Không trùng" lên tab "Trùng" của Sheet dựa theo hàng đợi thay đổi cục bộ ignDirty */
function pushIgnored(){
  if(!(N()&&N().apiPost&&canWrite()))return;
  if(dsBusy){dsAgain=true;return}
  var keys=Object.keys(ignDirty);
  if(!keys.length)return;
  var add=[],del=[],sent={};
  keys.forEach(function(k){var v=ignDirty[k];sent[k]=v;if(v>0)add.push({k:k,t:v});else del.push(k)});
  dsBusy=true;
  N().apiPost("dupSet",{add:add,del:del},30000).then(function(){
    Object.keys(sent).forEach(function(k){if(ignDirty[k]===sent[k])delete ignDirty[k]});
    ignWriteLs();
  },function(){}).then(function(){dsBusy=false;if(dsAgain){dsAgain=false;pushIgnored()}})}
function sameMap(a,b){var ka=Object.keys(a),kb=Object.keys(b);if(ka.length!==kb.length)return false;for(var i=0;i<ka.length;i++)if(a[ka[i]]!==b[ka[i]])return false;return true}
function pullIgnored(force){
  if(!(N()&&N().apiGet))return Promise.resolve();
  loadIgnored();
  if(pullP)return pullP;
  if(!force&&lastPull&&Date.now()-lastPull<20000)return Promise.resolve();
  pullP=N().apiGet("&action=dup",20000).then(function(d){
    lastPull=Date.now();
    if(!d||!d.ok)return;
    var R={},nw={},byId=null,its=N().items();
    (d.pairs||[]).forEach(function(p){R[p.k]=p.t||1;nw[p.k]=p.t||1});
    Object.keys(ignDirty).forEach(function(k){if(ignDirty[k]>0)nw[k]=ignDirty[k];else delete nw[k]});
    if(its&&its.length){
      byId={};its.forEach(function(it){byId[it.id]=1});
      Object.keys(nw).forEach(function(k){var ids=k.split("|");if(!byId[ids[0]]||!byId[ids[1]]){delete nw[k];if(k in R)ignDirty[k]=0;else delete ignDirty[k]}});
    }
    var chg=!sameMap(ignored,nw);
    ignored=nw;
    ignWriteLs();
    pushIgnored();
    var dd=G("dupd");if(dd&&dd.open&&chg)render()
  },function(){}).then(function(){pullP=null},function(){pullP=null});
  return pullP}
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
  if(imgPairs)imgPairs.forEach(function(r){var a=byId[r.a.id],b=byId[r.b.id];if(!a||!b)return;var o=addP(P,a,b,"img");if(!o)return;var sw=o.a.id!==r.a.id;o.img.push(sw?{x:r.y,y:r.x,d:r.d,k:r.k||"",o:r.o||"",n:r.n}:{x:r.x,y:r.y,d:r.d,k:r.k||"",o:r.o||"",n:r.n})});
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
function simText(d,k,ori,n){
  var parts=[];
  if(ori==="LP")parts.push("ngang ↔ dọc");
  else if(ori==="L")parts.push("ảnh ngang");
  else if(ori==="P")parts.push("ảnh dọc");
  if(k==="m"||k==="lpm")parts.push("lật ngang");
  else if(k==="c")parts.push("vùng giữa");
  else if(k==="cm")parts.push("lật + vùng giữa");
  else if(k==="lpt")parts.push("cắt viền màn hình");
  else if(k==="lptm")parts.push("cắt viền + lật");
  if(d===0&&(!k||k==="lp"))return"Giống 100%"+(parts.length?" ("+parts.join(" · ")+")":"");
  parts.push("lệch "+d+"/64 bit");
  if(n!=null)parts.push("điểm ảnh khớp "+n+"%");
  return"Giống "+Math.round((64-d)/64*100)+"% ("+parts.join(" · ")+")"}
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
      h+='<button type="button" class="dpip" data-zoom="'+idx+':'+i+'"><span><img alt="Ảnh căn 1" loading="lazy" src="'+esc(imgSrc(m.x,300))+'"><img alt="Ảnh căn 2" loading="lazy" src="'+esc(imgSrc(m.y,300))+'"></span><small>'+esc(simText(m.d,m.k,m.o,m.n))+'</small></button>';
    });
    h+='</div></div>';
  }
  return h;
}
function loadImgMode(){if(imgModeLoaded)return;imgModeLoaded=true;try{var v=ls("dimgv");imgAutoMode=(v==="both"||v==="stack")?v:"manual"}catch(e){imgAutoMode="manual"}try{var t=+ls("dth");if(t===6||t===10||t===14||t===18)TH=t;var vv=ls("dvf");if(vv==="0"||vv==="1"||vv==="2")VL=+vv;var z=ls("dzl");zlay=(z==="1"||z==="0")?z:null}catch(e){}}
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
/* Danh sách ảnh 2 căn cho khung so sánh: ảnh trùng xếp lên đầu, đánh số khớp nhau giữa 2 bên (Trùng 1 ↔ Trùng 1) */
function idxOf(list,s){for(var i=0;i<list.length;i++)if(list[i].s===s)return i;return -1}
function cmpLists(o){
  var A=houseImgs(o.a),B=houseImgs(o.b),hitA={},hitB={};
  o.img.forEach(function(m,i){if(hitA[m.x]===undefined)hitA[m.x]=i;if(hitB[m.y]===undefined)hitB[m.y]=i});
  function ord(L,H){return L.map(function(x,i){return{x:x,i:i}}).sort(function(p,q){var a=H[p.x.s],b=H[q.x.s];if(a!==undefined&&b!==undefined)return a-b||p.i-q.i;if(a!==undefined)return -1;if(b!==undefined)return 1;return p.i-q.i}).map(function(p){return p.x})}
  return{A:ord(A,hitA),B:ord(B,hitB),hitA:hitA,hitB:hitB}}
function thumbH(im,i,side,idx,hits,label,total){
  var hi=hits[im.s],isHit=hi!==undefined;
  return '<button type="button" class="dpth'+(isHit?' hit':'')+'" data-cmpzoom="'+idx+':'+side+':'+i+'" title="Bấm để phóng to và so sánh"><img alt="'+esc(label)+'" loading="lazy" decoding="async" src="'+esc(imgSrc(im.s,300))+'">'+(isHit?'<i>Trùng'+(total>1?' '+(hi+1):'')+'</i>':'')+(im.tag?'<u>'+esc(im.tag)+'</u>':'')+'</button>'}
function imgCmpH(o,idx){
  var k=o.a.id+"|"+o.b.id,mode=modeFor(k),L=cmpLists(o),imgsA=L.A,imgsB=L.B,tot=o.img.length;
  function colH(it,side,list,hits,label){
    var meta=[paText(it),stName(it.st||"new")].filter(Boolean).join(" · "),nh=0,j;
    for(j=0;j<list.length;j++)if(hits[list[j].s]!==undefined)nh++;
    var lim=cmpAll[k]?list.length:Math.max(mode==="both"?6:12,nh),shown=Math.min(lim,list.length);
    var h='<div class="dpcmp"><div class="dpcmph"><b>'+esc(label+": "+(it.n||"Chưa đặt tên"))+'</b><span>'+list.length+' ảnh'+(nh?' · '+nh+' trùng':'')+'</span></div>';
    if(meta)h+='<p class="dpcmpm">'+esc(meta)+'</p>';
    if(!list.length)h+='<p class="dpmess">Chưa có ảnh</p>';
    else{
      h+='<div class="dpthumbs">';
      for(j=0;j<shown;j++)h+=thumbH(list[j],j,side,idx,hits,label,tot);
      if(shown<list.length)h+='<button type="button" class="dpmore" data-cmpmore="'+idx+'">+'+(list.length-shown)+' ảnh nữa</button>';
      h+='</div>';
    }
    return h+'</div>'}
  var cls=mode==="stack"?"stack":(mode==="a"||mode==="b")?"single":"both";
  var h='<div class="dpimgbar"><b>So sánh ảnh 2 căn ('+imgsA.length+' · '+imgsB.length+')</b><span class="dpimgact"><button type="button" class="dpimgbtn" data-cmpfull="'+idx+'" title="Mở so sánh toàn màn hình">Xem lớn</button><select class="dpimgsel" data-imgmode="'+idx+'" aria-label="Chế độ xem ảnh 2 căn">';
  h+='<option value="both"'+(mode==="both"?' selected':'')+'>2 cột cạnh nhau</option>';
  h+='<option value="stack"'+(mode==="stack"?' selected':'')+'>Xếp dọc từng căn</option>';
  h+='<option value="a"'+(mode==="a"?' selected':'')+'>Chỉ Căn 1 ('+imgsA.length+' ảnh)</option>';
  h+='<option value="b"'+(mode==="b"?' selected':'')+'>Chỉ Căn 2 ('+imgsB.length+' ảnh)</option>';
  h+='</select></span></div><div class="dpcmps '+cls+'">';
  if(mode!=="b")h+=colH(o.a,"a",imgsA,L.hitA,"Căn 1");
  if(mode!=="a")h+=colH(o.b,"b",imgsB,L.hitB,"Căn 2");
  return h+'</div>'}
function rowH(it,idx,side,allowWrite){
  var k=it.st||"new",ad=addrOf(it);
  return '<div class="dprow"><div class="dpr"><span class="dpt"><b>'+esc(it.n)+'</b><small>'+esc(ad||"Chưa có địa chỉ")+(it.p!=null?" · "+fmt(it.p)+" tr":"")+(it.ar?" · "+fmt(it.ar)+" m²":"")+'</small></span><span class="pill" style="--c:var(--s-'+k+');--bg2:var(--b-'+k+')">'+esc(stName(k))+'</span></div>'+(allowWrite?'<button type="button" class="dpedit" data-edit="'+esc(it.id)+'" title="Sửa thông tin căn này" aria-label="Sửa căn '+esc(it.n)+'">Sửa</button><button type="button" class="dpdel" data-del="'+idx+':'+side+'" title="Xóa căn này" aria-label="Xóa căn '+esc(it.n)+'">Xóa</button>':'')+'</div>'}
function pairH(o,idx,isIgn){
  var n=o.why.length,s=o.sc||0,k=o.a.id+"|"+o.b.id,isOpen=!!openSet[k],imgOpen=isImgOpen(k),allowDel=canWrite(),st=pairImgMsg[k];
  var na=houseImgs(o.a).length,nb=houseImgs(o.b).length,totImg=na+nb;
  var lbl=s>=3?"Gần như chắc chắn trùng":s>=2?"Có thể trùng":o.img.length?"Trùng ảnh":"Chỉ trùng 1 điều kiện";
  var ts=0;o.why.forEach(function(w){if(w!=="img")ts+=WT[w]||1});var cc=isIgn?"gr":o.img.length?"im":ts>=2?"pu":"gr";
  var h='<div class="dpc '+cc+'">'+rowH(o.a,idx,"a",allowDel)+rowH(o.b,idx,"b",allowDel)+'<p class="dpn" data-tog="'+idx+'">'+lbl+(n>1?' ('+n+' điều kiện)':'')+'</p><div class="dpw" data-tog="'+idx+'" title="Bấm để xem thông tin trùng">';
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
    G("dupignsum").textContent=r.ign.length?"Có "+r.ign.length+" cặp đã đánh dấu không phải trùng.":"Không còn cặp nào đã đánh dấu không phải trùng.";
    G("dupignclr").hidden=r.ign.length<2;
    if(r.ign.length){
      var ignSlice=r.ign.slice(0,limIgn);
      ignEl.innerHTML=ignSlice.map(function(o){var idx=viewList.push(o)-1;return pairH(o,idx,true)}).join("")+(r.ign.length>limIgn?'<button type="button" class="link" data-more="ign">Hiện thêm '+Math.min(LIMIT,r.ign.length-limIgn)+' cặp (còn '+(r.ign.length-limIgn)+')</button>':'');
    }else{
      ignEl.innerHTML="";
    }
    afterRender();return;
  }
  ignEl.innerHTML="";
  var mainSlice=list.slice(0,limMain);
  var mainHtml=mainSlice.map(function(o){var idx=viewList.push(o)-1;return pairH(o,idx,false)}).join("")+(list.length>limMain?'<button type="button" class="link" data-more="main">Hiện thêm '+Math.min(LIMIT,list.length-limMain)+' cặp (còn '+(list.length-limMain)+')</button>':'');
  G("dupsum").textContent=!items.length?"Chưa có căn nào để kiểm tra.":!n?"Tất cả "+items.length+" căn đều đang ở trạng thái Loại.":r.strong.length?"Có "+r.strong.length+" cặp nghi trùng"+(hi?" ("+hi+" cặp gần như chắc chắn)":"")+" trong "+n+" căn"+sk+".":"Không có cặp nào trùng từ 2 điều kiện trở lên hoặc trùng ảnh trong "+n+" căn"+sk+(imgPairs?" (đã tính cả ảnh).":".");
  tg.hidden=!r.weak.length;tg.textContent=showOne?"Ẩn "+r.weak.length+" cặp chỉ trùng 1 điều kiện":"Hiện thêm "+r.weak.length+" cặp chỉ trùng 1 điều kiện";
  itg.hidden=!r.ign.length;itg.textContent="Xem danh sách không phải trùng ("+r.ign.length+") →";
  G("duplinks").hidden=tg.hidden&&itg.hidden;
  el.innerHTML=mainHtml;afterRender();
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
  var btn=card.querySelector(".dpimgbtn[data-imgtog]"),box=card.querySelector(".dpimgs");
  if(btn){
    btn.setAttribute("aria-expanded",next?"true":"false");
    btn.textContent=(next?"Ẩn ảnh ("+na+" · "+nb+") ▴":"Xem ảnh ("+na+" · "+nb+") ▾");
  }
  if(box){
    if(next){box.innerHTML=imgCmpH(o,idx);markImgs(box);box.hidden=false;box.classList.remove("dpopen");void box.offsetWidth;box.classList.add("dpopen");warmPair(o)}
    else box.hidden=true}}
function changeImgMode(sel){
  var idx=+sel.dataset.imgmode,o=viewList[idx];if(!o)return;
  pairImgMode[o.a.id+"|"+o.b.id]=sel.value;
  var card=sel.closest(".dpc"),box=card&&card.querySelector(".dpimgs");
  if(box){box.innerHTML=imgCmpH(o,idx);markImgs(box)}}
function ignorePair(el,val){
  var idx=+(val?el.dataset.ign:el.dataset.unign),o=viewList[idx];if(!o)return;
  loadIgnored();
  var k=o.a.id+"|"+o.b.id,prev=ignored[k],ts=Date.now();
  if(val){ignored[k]=ts;ignDirty[k]=ts;delete openSet[k];delete openImgSet[k]}else{delete ignored[k];ignDirty[k]=0}
  undoPush(val?"Đã đánh dấu Không trùng":"Đã bỏ đánh dấu Không trùng",[{k:k,p:prev}]);
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
  Promise.all([loadCache(),loadPm()]).then(function(){
    var uniq={},list=[];
    aIm.concat(bIm).forEach(function(s){if(!uniq[s]){uniq[s]=1;list.push(s)}});
    var map={},doneSet={},bad=0,pos=0;
    function worker(){
      if(pos>=list.length)return Promise.resolve();
      var s=list[pos++];
      return hashOf(s).then(function(h){if(h!==null){doneSet[s]=1;if(h){var sg=sigOf(s)||parseSig(h);if(sg)map[s]=sg}}else bad++}).then(worker)}
    return Promise.all([worker(),worker(),worker()]).then(function(){
      saveCache();
      var found=[],seen={},i,j,sa,sb,ha,hb,m;
      for(i=0;i<aIm.length;i++){
        sa=aIm[i];ha=map[sa];
        for(j=0;j<bIm.length;j++){
          sb=bIm[j];hb=map[sb];
          if(sa!==sb&&(!ha||!hb))continue;
          m=sa===sb?{d:0,k:"",o:(ha||hb)?(ha||hb).ori:""}:cmpSig(ha,hb,TH);
          if(m){
            var pk=sa+"|"+sb;
            if(!seen[pk]){seen[pk]=1;found.push({a:o.a,b:o.b,x:sa,y:sb,d:m.d,k:m.k,o:m.o||""})}
          }
        }
      }
      return verifyList(found).then(function(found){
      var rjT=found.rej?" (đã loại "+found.rej+" cặp nhầm sau kiểm tra lần hai)":"";
      imgPairs=(imgPairs||[]).filter(function(r){
        return !((r.a.id===o.a.id&&r.b.id===o.b.id)||(r.a.id===o.b.id&&r.b.id===o.a.id));
      }).concat(found);
      if(pm){
        if(pmStale()){pm=pmEmpty()}
        Object.keys(doneSet).forEach(function(s){pm.done[s]=1;if(pm.fail)delete pm.fail[s]});
        pm.pairs=(pm.pairs||[]).filter(function(r){
          return !((r.a===o.a.id&&r.b===o.b.id)||(r.a===o.b.id&&r.b===o.a.id));
        }).concat(found.map(function(r){return{a:r.a.id,b:r.b.id,x:r.x,y:r.y,d:r.d,k:r.k,o:r.o,n:r.n}}));
        pm.th=TH;pm.vf=VL;
        savePm();
      }
      if(found.length){
        pairImgMsg[k]={ok:true,text:"Tìm thấy "+found.length+" cặp ảnh giống nhau"+(bad?" ("+bad+" ảnh không đọc được)":"")+rjT+"."};
      }else if(bad&&bad===list.length){
        pairImgMsg[k]={bad:true,text:"Không đọc được ảnh của 2 căn này."};
      }else{
        pairImgMsg[k]={text:"Không trùng ảnh ("+aIm.length+" vs "+bIm.length+" ảnh"+(bad?", "+bad+" ảnh lỗi":"")+")"+rjT+"."};
      }
      render();
      });
    });
  })}
function afterDel(id){
  loadIgnored();var changed=false;
  Object.keys(ignored).forEach(function(k){var ids=k.split("|");if(ids[0]===id||ids[1]===id){delete ignored[k];ignDirty[k]=0;changed=true}});
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
/* ===== Nạp ảnh xem lớn giống index.html =====
   - Ảnh xem lớn dùng đúng cỡ VW như trang chi tiết/lightbox của index.html, nên ảnh đã tải ở đó (và đã nằm trong cache của sw.js) dùng lại luôn, không tải thêm.
   - Mở ảnh: hiện ngay bản nhỏ (đã có từ khung thu nhỏ), tải bản lớn rồi thay vào; tải trước ảnh kế bên (zNear) để lướt không bị chờ.
   - Chạm vào ảnh là tải ngay (onPairDown); tải nền chỉ chạy khi có mạng tốt, không bật tiết kiệm dữ liệu, tab đang hiện và sw.js đã kiểm soát trang. */
var VW=(function(){var n=Math.min(screen.width||innerWidth,screen.height||innerHeight)*(window.devicePixelRatio||1)*0.8,a=[640,900,1280];for(var i=0;i<a.length;i++)if(a[i]>=n)return a[i];return 1280})();
function bigU(s){return imgSrc(s,(N()&&N().VW)||VW)}
var zDone={},zWait={},zQ=[],zRun=0,zT=0,zt={},zShown={},zLoW=300;
function netOk(){var c=navigator.connection||{};return !(document.hidden||navigator.onLine===false||c.saveData||/2g/.test(c.effectiveType||""))}
function swCtl(){return !!(navigator.serviceWorker&&navigator.serviceWorker.controller)}
var zC=null;
function zCache(){return zC||(zC=caches.open("img-v1").catch(function(e){zC=null;throw e}))}
function zHas(u){var m=/^(.*=w)(\d+)$/.exec(u);if(!m||!window.caches)return Promise.resolve(false);
  var w=+m[2],ws=[w].concat([200,300,360,640,900,1280].filter(function(x){return x>w&&x<=w*2}));
  return zCache().then(function(c){return Promise.all(ws.map(function(x){return c.match(m[1]+x)}))}).then(function(r){return r.some(Boolean)},function(){return false})}
function zFetch(u,bg,n,done){
  var im=new Image();im.decoding="async";
  if(bg){try{im.fetchPriority="low"}catch(e){}}
  im.onload=function(){im.onload=im.onerror=null;done(true)};
  im.onerror=function(){im.onload=im.onerror=null;if(n<1&&netOk())setTimeout(function(){zFetch(u,bg,n+1,done)},700);else done(false)};
  im.src=u}
function zStart(u,bg){
  zFetch(u,bg,0,function(ok){
    if(ok)zDone[u]=1;
    var q=zWait[u]||[];delete zWait[u];
    if(bg){zRun--;setTimeout(zPump,150)}
    q.forEach(function(f){f(ok)})})}
function zPump(){
  if(!netOk())return;
  while(zRun<2&&zQ.length){var u=zQ.shift();if(zDone[u]||!zWait[u])continue;zRun++;zStart(u,true)}}
/* zPre(url, callback, nền?): ảnh người dùng đang cần tải ngay, ảnh dự phòng xếp hàng tải 2 ảnh một lúc */
function zPre(u,cb,bg){
  if(!u)return;
  if(u.indexOf("data:")===0)zDone[u]=1;
  if(zDone[u]){if(cb)cb(true);return}
  if(zWait[u]){
    if(cb)zWait[u].push(cb);
    if(!bg){var i=zQ.indexOf(u);if(i>=0){zQ.splice(i,1);zStart(u,false)}}
    return}
  zWait[u]=cb?[cb]:[];
  if(bg){zQ.push(u);zPump()}else zStart(u,false)}
function warmPair(o){
  if(!netOk()||!swCtl())return;
  var L=cmpLists(o),us=[];
  [L.A,L.B].forEach(function(arr){arr.slice(0,2).forEach(function(im){us.push(bigU(im.s))})});
  us.forEach(function(u){
    if(u.indexOf("https://lh3.")!==0||zDone[u]||zWait[u])return;
    zHas(u).then(function(has){if(has)zDone[u]=1;else zPre(u,null,true)})})}
function markImgs(root){
  if(!root)return;
  var l=root.getElementsByTagName("img"),i,m;
  for(i=0;i<l.length;i++){m=l[i];if(!m.classList.contains("dpl")&&m.complete&&m.naturalWidth)m.classList.add("dpl","dpl0")}}
function afterRender(){
  markImgs(G("dupl"));markImgs(G("dupignl"));
  if(imgAutoMode!=="manual")viewList.slice(0,3).forEach(function(o){if(isImgOpen(o.a.id+"|"+o.b.id))warmPair(o)})}
function onPairDown(e){
  var t=e.target,c=t.closest&&t.closest("[data-cmpzoom]");
  if(c){
    var p=c.dataset.cmpzoom.split(":"),o=viewList[+p[0]];
    if(o){var L=cmpLists(o),im=(p[1]==="a"?L.A:L.B)[+p[2]];if(im)zPre(bigU(im.s))}
    return}
  var z=t.closest&&t.closest("[data-zoom]");
  if(z){var q=z.dataset.zoom.split(":"),o2=viewList[+q[0]],m=o2&&o2.img[+q[1]];if(m){zPre(bigU(m.x));zPre(bigU(m.y))}}}

/* ===== Hộp phóng to so sánh 2 căn ===== */
function setSrc(img,u){if(img.getAttribute("src")!==u)img.src=u}
function zAnim(el,k){el.classList.remove("a-open","a-next","a-prev");void el.offsetWidth;if(k)el.classList.add("a-"+k)}
function stageShow(side,s,kind){
  var n=side==="a"?1:2,img=G("dupz"+n),emp=G("dupze"+n),st=img.parentNode,t=zt[side]=++zT;
  img.removeAttribute("data-rt");
  if(!s){img.hidden=true;emp.hidden=false;img.removeAttribute("src");st.classList.remove("busy");return}
  img.hidden=false;emp.hidden=true;
  var big=bigU(s);
  if(zDone[big]){setSrc(img,big);st.classList.remove("busy");zAnim(img,kind);return}
  setSrc(img,imgSrc(s,zLoW));zAnim(img,kind);st.classList.add("busy");
  zPre(big,function(ok){if(zt[side]!==t)return;st.classList.remove("busy");if(ok)setSrc(img,big)})}
function markAct(){
  if(!zoomCmp)return;
  [["a","dupz1"],["b","dupz2"]].forEach(function(p){var c=G(p[1]).closest(".dpzcol");if(c)c.classList.toggle("act",zoomCmp.act===p[0])})}
function zMatchIdx(o,imA,imB){var r=-1;if(imA&&imB)o.img.forEach(function(m,i){if(r<0&&m.x===imA.s&&m.y===imB.s)r=i});return r}
function zNear(){
  var z=zoomCmp;if(!z)return;
  [[z.imgsA,z.ia],[z.imgsB,z.ib]].forEach(function(p){
    var L=p[0],i=p[1];if(L.length<2)return;
    [1,-1].forEach(function(d){var n=L[(i+d+L.length)%L.length];if(n)zPre(bigU(n.s))});
    var n2=L[(i+2)%L.length];if(n2)zPre(bigU(n2.s),null,true)})}
function renderCmpZoom(k){
  if(!zoomCmp)return;
  k=k||{};
  var o=viewList[zoomCmp.idx];if(!o){closeZoom();return}
  var ia=zoomCmp.ia,ib=zoomCmp.ib,la=zoomCmp.imgsA,lb=zoomCmp.imgsB;
  var imA=la[ia],imB=lb[ib],anyCtrl=la.length>1||lb.length>1,mi=zMatchIdx(o,imA,imB);
  G("dupzt").textContent=mi>=0?simText(o.img[mi].d,o.img[mi].k,o.img[mi].o,o.img[mi].n):"So sánh ảnh 2 căn";
  G("dupzlay").textContent=zoomCmp.stack?"Cạnh nhau":"Xếp dọc";
  G("dupzg").classList.toggle("stack",!!zoomCmp.stack);
  G("dupz").classList.add("stk");G("dupz").classList.toggle("side",!zoomCmp.stack);
  G("dupz1n").textContent=o.a.n||"Căn 1";
  G("dupz2n").textContent=o.b.n||"Căn 2";
  G("dupz1m").textContent=[paText(o.a),imA?(ia+1)+"/"+la.length+(imA.tag?" · "+imA.tag:""):"Chưa có ảnh"].filter(Boolean).join(" · ");
  G("dupz2m").textContent=[paText(o.b),imB?(ib+1)+"/"+lb.length+(imB.tag?" · "+imB.tag:""):"Chưa có ảnh"].filter(Boolean).join(" · ");
  var c1=G("dupzc1"),c2=G("dupzc2");
  c1.hidden=!anyCtrl;c2.hidden=!anyCtrl;
  c1.classList.toggle("ghost",anyCtrl&&la.length<=1);
  c2.classList.toggle("ghost",anyCtrl&&lb.length<=1);
  if(la.length>1)G("dupz1c").textContent=(ia+1)+"/"+la.length;
  if(lb.length>1)G("dupz2c").textContent=(ib+1)+"/"+lb.length;
  var zm=G("dupzm");
  if(o.img.length){
    zm.hidden=false;
    zm.innerHTML=o.img.map(function(m,i){return '<button type="button" class="dpzj'+(i===mi?' cur':'')+'" data-zjump="'+i+'">Trùng '+(i+1)+' · '+Math.round((64-m.d)/64*100)+'%</button>'}).join("");
  }else{zm.hidden=true;zm.innerHTML=""}
  markAct();
  ["a","b"].forEach(function(sd){
    var cur=sd==="a"?imA:imB,s=cur?cur.s:"";
    if(k[sd]!==undefined||zShown[sd]!==s){stageShow(sd,s,k[sd]);zShown[sd]=s}});
  G("dupz").hidden=false;
  zNear()}
function beginZoom(idx,L,ia,ib,loW,act){
  zoomCmp={idx:idx,imgsA:L.A,imgsB:L.B,ia:ia,ib:ib,act:act||"a",stack:zlay===null?imgAutoMode==="stack":zlay==="1"};
  zLoW=loW;zShown={};
  renderCmpZoom({a:"open",b:"open"})}
function openCmpZoom(val){
  var p=String(val||"").split(":"),idx=+p[0],side=p[1],i=+p[2]||0,o=viewList[idx];if(!o)return;
  var L=cmpLists(o),ia=0,ib=0,cur,mm;
  if(side==="a"){
    ia=Math.min(i,Math.max(0,L.A.length-1));cur=L.A[ia];
    mm=cur&&L.hitA[cur.s]!==undefined?o.img[L.hitA[cur.s]]:null;
    if(mm)ib=Math.max(0,idxOf(L.B,mm.y));
  }else{
    ib=Math.min(i,Math.max(0,L.B.length-1));cur=L.B[ib];
    mm=cur&&L.hitB[cur.s]!==undefined?o.img[L.hitB[cur.s]]:null;
    if(mm)ia=Math.max(0,idxOf(L.A,mm.x));
  }
  beginZoom(idx,L,ia,ib,300,side==="b"?"b":"a")}
function openZoom(val){
  var p=String(val||"").split(":"),idx=+p[0],o=viewList[idx],m=o&&o.img[+p[1]];if(!m)return;
  var L=cmpLists(o);
  beginZoom(idx,L,Math.max(0,idxOf(L.A,m.x)),Math.max(0,idxOf(L.B,m.y)),200,"a")}
function openFull(idx){
  var o=viewList[idx];if(!o)return;
  if(o.img.length)openZoom(idx+":0");else openCmpZoom(idx+":a:0")}
function stepCmpZoom(side,dir){
  if(!zoomCmp)return;
  var len=side==="a"?zoomCmp.imgsA.length:zoomCmp.imgsB.length;
  if(len<=1)return;
  if(side==="a")zoomCmp.ia=(zoomCmp.ia+dir+len)%len;
  else zoomCmp.ib=(zoomCmp.ib+dir+len)%len;
  zoomCmp.act=side;
  var k={};k[side]=dir>0?"next":"prev";
  renderCmpZoom(k)}
function zJump(i){
  var z=zoomCmp,o=z&&viewList[z.idx],m=o&&o.img[i];if(!m)return;
  var a=idxOf(z.imgsA,m.x),b=idxOf(z.imgsB,m.y);if(a<0||b<0)return;
  var k={};if(a!==z.ia)k.a="open";if(b!==z.ib)k.b="open";
  z.ia=a;z.ib=b;renderCmpZoom(k)}
function closeZoom(){zoomCmp=null;zT++;zt={};var z=G("dupz");if(z&&!z.hidden){z.hidden=true;return true}return false}
function msg(t,bad){var m=G("dupm");m.textContent=t||"";m.className="pm"+(bad?" bad":"")}

/* ---------- Thuật toán quét ảnh 3 nhánh (Cách 1): Ngang↔Ngang (L:144x104), Dọc↔Dọc (P:108x144), và Ngang↔Dọc (vuông 1:1 + cắt viền màn hình) ---------- */
var CACHE_KEY="dhc5";
function parseCache(raw){try{var o=JSON.parse(raw||"{}");return(o&&typeof o==="object")?o:{}}catch(e){return{}}}
function clearOldCaches(){
  ["dhc1","dhc2","dhc3","dhc4"].forEach(function(k){
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
function saveCache(){try{var k=Object.keys(cache);if(k.length>30000){var n={},keepN=24000;k.slice(-keepN).forEach(function(x){n[x]=cache[x]});if(pm&&pm.done)k.slice(0,k.length-keepN).forEach(function(x){delete pm.done[x]});cache=n}var raw=JSON.stringify(cache);if(N()&&N().idbSave){N().idbSave(CACHE_KEY,raw);if(ls(CACHE_KEY))ls(CACHE_KEY,"")}else ls(CACHE_KEY,raw)}catch(e){}}
/* ===== Đồng bộ hash ảnh qua tab "Hash" của Sheet =====
   Mỗi ảnh chỉ có một hash trên máy chủ (ai ghi trước thì giữ). Mọi bản cài (PWA, APK) kéo hash về dùng, không tự tính lại ảnh đã có,
   nên cùng danh sách căn + cùng cài đặt thì kết quả quét giống nhau. dhs1 lưu mốc đã kéo (n) và các mã ảnh đã có trên máy chủ (k). */
var HS_KEY="dhs1",hs=null,hsP=null,hsPhase=null,hsBusy=false,hsAgain=false,hsPullP=null,hsT=0,hsPendR=null;
function hsLoad(){
  if(hs)return Promise.resolve(hs);
  if(hsP)return hsP;
  function fin(raw){
    var o=null,k={};try{o=JSON.parse(raw||"null")}catch(e){}
    if(o&&typeof o==="object"&&o.v===CACHE_KEY){String(o.k||"").split(",").forEach(function(x){if(x)k[x]=1});hs={n:+o.n||0,k:k}}
    else hs={n:0,k:{}};
    hsP=null;return hs}
  var idb=N()&&N().idbGet;
  if(!idb)return Promise.resolve(fin(ls(HS_KEY)));
  hsP=idb(HS_KEY).then(function(v){return fin(typeof v==="string"?v:"")},function(){return fin(ls(HS_KEY))});
  return hsP}
function hsSave(){try{var raw=JSON.stringify({v:CACHE_KEY,n:hs.n,k:Object.keys(hs.k).join(",")});if(N()&&N().idbSave)N().idbSave(HS_KEY,raw);else ls(HS_KEY,raw)}catch(e){}}
/* Hash của máy chủ luôn thắng: ảnh chưa có thì thêm, ảnh có hash khác thì thay */
function hsApply(rows){
  var add=0,chg=0;
  (rows||[]).forEach(function(r){
    var id=r&&r[0];if(!id)return;
    var h=r[1]==null?"":String(r[1]);
    hs.k[id]=1;
    if(cache[id]===undefined){cache[id]=h;delete sigMemo[id];add++}
    else if(cache[id]!==h){cache[id]=h;delete sigMemo[id];chg++}});
  return{add:add,chg:chg}}
function hsRefresh(r){
  if(!(r.add||r.chg))return;
  if(scanning){hsPendR=hsPendR||{add:0,chg:0};hsPendR.add+=r.add;hsPendR.chg+=r.chg;return}   // đang quét: làm sau khi quét xong
  saveCache();
  var d=G("dupd");
  loadPm().then(function(){
    var had=Object.keys(pm.done).length>0;
    if(r.chg&&had){pm=pmEmpty();savePm();imgPairs=null}   // hash đổi theo máy chủ: kết quả cũ không còn đúng, tính lại từ hash đã lưu (không tải ảnh)
    if(d&&d.open&&!scanning){
      if(imgPairs===null)applyCachedPairs();
      if(r.chg&&had)scan(true);else autoScan()}})}
function hsPull(){
  if(!(N()&&N().apiGet))return Promise.resolve();
  if(hsPullP)return hsPullP;
  hsPhase=Promise.all([loadCache(),hsLoad()]).then(function(){
    if(hs.n>0&&!Object.keys(cache).length)hs={n:0,k:{}};   // hash trên máy đã bị xóa: kéo lại từ đầu
    var tot={add:0,chg:0};
    function page(){
      return N().apiGet("&action=hash&v="+encodeURIComponent(CACHE_KEY)+"&from="+hs.n,20000).then(function(d){
        if(!d||!d.ok||typeof d.next!=="number")return;
        if(d.reset)hs={n:0,k:{}};
        var a=hsApply(d.rows);tot.add+=a.add;tot.chg+=a.chg;
        hs.n=d.next;hsSave();
        if(d.more)return page()})}
    return page().then(function(){hsRefresh(tot)})
  }).then(function(){hsPhase=null},function(){hsPhase=null});
  hsPullP=hsPhase.then(function(){return hsPush()}).then(function(){hsPullP=null},function(){hsPullP=null});
  return hsPullP}
function hsPush(){
  if(!(N()&&N().apiPost&&canWrite()))return Promise.resolve();
  if(hsBusy){hsAgain=true;return Promise.resolve()}
  hsBusy=true;
  return Promise.all([loadCache(),hsLoad()]).then(function(){
    var q=Object.keys(cache).filter(function(s){return !hs.k[s]&&String(s).indexOf("data:")!==0&&typeof cache[s]==="string"});
    function send(){
      var ch=q.splice(0,300);if(!ch.length)return;
      return N().apiPost("hashSet",{v:CACHE_KEY,add:ch.map(function(s){return[s,cache[s]]})},30000).then(function(d){
        ch.forEach(function(s){hs.k[s]=1});
        var a=hsApply(d&&d.conf);   // máy chủ đã có hash khác cho ảnh này: dùng bản của máy chủ
        hsSave();
        if(a.add||a.chg)hsRefresh(a);
        return send()})}
    return send()
  }).then(function(){},function(){}).then(function(){hsBusy=false;if(hsAgain){hsAgain=false;hsPush()}})}
function hsWait(){return hsPhase?Promise.race([hsPhase,new Promise(function(r){setTimeout(r,15000)})]):Promise.resolve()}
function hsPushSoon(){clearTimeout(hsT);hsT=setTimeout(function(){hsT=0;hsPush()},3000)}
function hsFlush(){if(hsT){clearTimeout(hsT);hsT=0}hsPush()}
function grid9x8(gray,gw,gh,x0,y0,w,h){
  var g=[],gy,gx,cw=w/9,ch=h/8,rx0,rx1,ry0,ry1,x,y,sum,cnt;
  for(gy=0;gy<8;gy++){
    ry0=Math.round(y0+gy*ch);ry1=Math.min(gh,Math.max(ry0+1,Math.round(y0+(gy+1)*ch)));
    for(gx=0;gx<9;gx++){
      rx0=Math.round(x0+gx*cw);rx1=Math.min(gw,Math.max(rx0+1,Math.round(x0+(gx+1)*cw)));
      sum=0;cnt=0;
      for(y=ry0;y<ry1;y++)for(x=rx0;x<rx1;x++){sum+=gray[y*gw+x];cnt++}
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
function colorHex(px,gw,x0,y0,qw,qh){
  var qs=[[x0,y0],[x0+qw,y0],[x0,y0+qh],[x0+qw,y0+qh]],area=qw*qh,out="",qi,x,y,r,g,b,p;
  for(qi=0;qi<4;qi++){
    r=g=b=0;
    for(y=qs[qi][1];y<qs[qi][1]+qh;y++)for(x=qs[qi][0];x<qs[qi][0]+qw;x++){
      p=(y*gw+x)*4;r+=px[p];g+=px[p+1];b+=px[p+2];
    }
    out+=hex2(r/area)+hex2(g/area)+hex2(b/area);
  }
  return out}
function lumaStats(px,npx){
  var gray=[],i,sum=0,sum2=0,l;
  for(i=0;i<npx;i++){l=px[i*4]*.299+px[i*4+1]*.587+px[i*4+2]*.114;gray.push(l);sum+=l;sum2+=l*l}
  var mean=sum/npx;
  return{gray:gray,v:sum2/npx-mean*mean}}
function detectBars(gray,gw,gh,ori,iw,ih){
  var i,j,s,s2,cnt,m,v,r0,r1,top,bot;
  if(ori==="P"){
    var rm=[],rv=[];
    for(i=0;i<gh;i++){
      s=s2=0;cnt=0;
      for(j=12;j<gw-12;j++){m=gray[i*gw+j];s+=m;s2+=m*m;cnt++}
      m=s/cnt;rm.push(m);rv.push(s2/cnt-m*m);
    }
    top=0;while(top<52&&rv[top]<40&&Math.abs(rm[top]-rm[0])<18)top++;
    bot=gh-1;while(bot>gh-53&&rv[bot]<40&&Math.abs(rm[bot]-rm[gh-1])<18)bot--;
    var hRow=bot-top+1;
    if((top>=12||gh-1-bot>=12)&&hRow>=42){
      var th=Math.max(1,Math.round(hRow/gh*ih));
      if(iw>=th)return{sx:0,sy:Math.round(top/gh*ih),sw:iw,sh:th,tgw:144,tgh:104};
    }
  }else{
    var cm=[],cv=[];
    for(j=0;j<gw;j++){
      s=s2=0;cnt=0;
      for(i=10;i<gh-10;i++){m=gray[i*gw+j];s+=m;s2+=m*m;cnt++}
      m=s/cnt;cm.push(m);cv.push(s2/cnt-m*m);
    }
    r0=0;while(r0<52&&cv[r0]<40&&Math.abs(cm[r0]-cm[0])<18)r0++;
    r1=gw-1;while(r1>gw-53&&cv[r1]<40&&Math.abs(cm[r1]-cm[gw-1])<18)r1--;
    var wCol=r1-r0+1;
    if((r0>=16||gw-1-r1>=16)&&wCol>=42){
      var tw=Math.max(1,Math.round(wCol/gw*iw));
      if(ih>tw)return{sx:Math.round(r0/gw*iw),sy:0,sw:tw,sh:ih,tgw:108,tgh:144};
    }
  }
  return null}
function hashOf(s){
  if(cache[s]!==undefined)return Promise.resolve(cache[s]);
  if(inflight[s])return inflight[s];
  var p=new Promise(function(res){
    var s0=imgSrc(s,64),isLh=s0.indexOf("https://lh3.googleusercontent.com/")===0;
    var tries=isLh?[s0+"?dh=1",imgSrc(s,120)+"?dh=2",imgSrc(s,200)]:[s0];
    var step=0,done=false;
    function fin(h){if(done)return;done=true;if(h!==null&&String(s).indexOf("data:")!==0){if(hs&&hs.k[s]&&cache[s]!==undefined)h=cache[s];else cache[s]=h}delete inflight[s];res(h)}
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
          var iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;
          if(!iw||!ih){dropIm();setTimeout(next,400);return}
          var ori=iw>=ih?"L":"P";
          var gw=ori==="L"?144:108,gh=ori==="L"?104:144;
          var cv=document.createElement("canvas");cv.width=gw;cv.height=gh;
          var cx=cv.getContext("2d",{willReadFrequently:true});
          cx.drawImage(im,0,0,gw,gh);
          var px=cx.getImageData(0,0,gw,gh).data,st=lumaStats(px,gw*gh);
          if(st.v<12){dropIm();return fin("")}          /* ảnh trắng trơn / đen đặc không có chi tiết: bỏ qua */
          var gF=grid9x8(st.gray,gw,gh,0,0,gw,gh),f=dhOf(gF,false);
          if(f.ones===0||f.ones===64){dropIm();return fin("")} /* ảnh chuyển sắc hoàn toàn đơn điệu: bỏ qua */
          var fm=dhOf(gF,true);
          var cx0=18,cy0=ori==="L"?12:16,cw=ori==="L"?108:72,ch=ori==="L"?80:112;
          var gC=grid9x8(st.gray,gw,gh,cx0,cy0,cw,ch),c=dhOf(gC,false),cm=dhOf(gC,true);
          var col=colorHex(px,gw,cx0,cy0,cw/2,ch/2);
          /* Nhánh phụ L↔P (1): vùng vuông 1:1 trung tâm không méo tỷ lệ */
          var side=Math.min(iw,ih),sx0=Math.floor((iw-side)/2),sy0=Math.floor((ih-side)/2);
          cv.width=72;cv.height=72;
          cx.drawImage(im,sx0,sy0,side,side,0,0,72,72);
          var pxS=cx.getImageData(0,0,72,72).data,stS=lumaStats(pxS,5184),sqH="",sqmH="",sqCol="";
          if(stS.v>=24){
            var gS=grid9x8(stS.gray,72,72,0,0,72,72),sqF=dhOf(gS,false);
            if(sqF.ones>=4&&sqF.ones<=60){sqH=sqF.hx;sqmH=dhOf(gS,true).hx;sqCol=colorHex(pxS,72,8,8,28,28)}
          }
          /* Nhánh phụ L↔P (2): cắt viền đen/trắng nếu là ảnh chụp màn hình chứa ảnh chiều ngược lại */
          var bar=detectBars(st.gray,gw,gh,ori,iw,ih),trH="",trmH="",trCol="";
          if(bar){
            cv.width=bar.tgw;cv.height=bar.tgh;
            cx.drawImage(im,bar.sx,bar.sy,bar.sw,bar.sh,0,0,bar.tgw,bar.tgh);
            var pxT=cx.getImageData(0,0,bar.tgw,bar.tgh).data,stT=lumaStats(pxT,bar.tgw*bar.tgh);
            if(stT.v>=16){
              var gT=grid9x8(stT.gray,bar.tgw,bar.tgh,0,0,bar.tgw,bar.tgh),tF=dhOf(gT,false);
              if(tF.ones>=3&&tF.ones<=61){
                trH=tF.hx;trmH=dhOf(gT,true).hx;
                var tx0=18,ty0=bar.tgw===144?12:16,tcw=bar.tgw===144?108:72,tch=bar.tgw===144?80:112;
                trCol=colorHex(pxT,bar.tgw,tx0,ty0,tcw/2,tch/2);
              }
            }
          }
          dropIm();
          fin([ori,f.hx,fm.hx,c.hx,cm.hx,col,sqH,sqmH,sqCol,trH,trmH,trCol].join(":"))
        }catch(e){dropIm();setTimeout(next,400)}};
      im.onerror=fail;
      im.src=u}
    next()});
  inflight[s]=p;return p}
function hx2(h){return h?[parseInt(h.slice(0,8),16)>>>0,parseInt(h.slice(8,16),16)>>>0]:null}
function colArr(h){if(!h||h.length<24)return null;var col=[],i;for(i=0;i<24;i+=2)col.push(parseInt(h.slice(i,i+2),16)||0);return col}
function parseSig(raw){
  if(!raw||typeof raw!=="string")return null;
  var p=raw.split(":");if(p.length<12||(p[0]!=="L"&&p[0]!=="P"))return null;
  return{ori:p[0],f:hx2(p[1]),fm:hx2(p[2]),c:hx2(p[3]),cm:hx2(p[4]),col:colArr(p[5]),sq:hx2(p[6]),sqm:hx2(p[7]),sqcol:colArr(p[8]),tr:hx2(p[9]),trm:hx2(p[10]),trcol:colArr(p[11])}}
function hd(x,y){return pc(x[0]^y[0])+pc(x[1]^y[1])}
function colorDiff(c1,c2,mirror){
  if(!c1||!c2)return 0;
  var s1=0,s2=0,i;for(i=0;i<12;i++){s1+=c1[i];s2+=c2[i]}
  var sh=(s1-s2)/12;if(sh>75)sh=75;else if(sh<-75)sh=-75;
  var d=0;
  for(i=0;i<12;i++){
    var j=mirror?(i<6?(i<3?i+3:i-3):(i<9?i+3:i-3)):i;
    d+=Math.abs((c1[i]-sh)-c2[j]);
  }
  return d/12}
function cmpSig(a,b,th){
  if(!a||!b)return null;
  var best=null,boost=Math.max(0,th-10)*1.5;
  function tryM(h1,h2,c1,c2,lim,mirror,clim,cmin,k,o){
    if(!h1||!h2)return;
    var d=hd(h1,h2);
    if(d>lim)return;
    if(d>cmin&&colorDiff(c1,c2,mirror)>clim+boost)return;
    if(!best||d<best.d||(d===best.d&&(k===""||k==="lpt")))best={d:d,k:k,o:o};
  }
  if(a.ori===b.ori){
    /* Trường hợp 1 & 2: Ngang-Ngang (L-L) hoặc Dọc-Dọc (P-P) */
    var ct=Math.max(4,th-2),cmt=Math.max(4,th-2),cMin=Math.max(4,Math.floor(th*0.5));
    tryM(a.f,b.f,a.col,b.col,th,false,66,cMin,"",a.ori);
    tryM(a.f,b.fm,a.col,b.col,Math.max(4,th-1),true,64,cMin,"m",a.ori);
    tryM(a.c,b.c,a.col,b.col,ct,false,72,cMin,"c",a.ori);
    tryM(a.c,b.f,a.col,b.col,ct,false,72,cMin,"c",a.ori);
    tryM(a.f,b.c,a.col,b.col,ct,false,72,cMin,"c",a.ori);
    tryM(a.c,b.cm,a.col,b.col,cmt,true,68,cMin,"cm",a.ori);
    tryM(a.c,b.fm,a.col,b.col,cmt,true,68,cMin,"cm",a.ori);
    tryM(a.f,b.cm,a.col,b.col,cmt,true,68,cMin,"cm",a.ori);
    return best;
  }
  /* Trường hợp 3: Ngang-Dọc (L-P) — ưu tiên cắt viền màn hình, sau đó vùng vuông 1:1 trung tâm */
  var trLim=Math.max(4,th-2),sqLim=Math.max(3,th-3);
  if(a.tr){
    tryM(a.tr,b.f,a.trcol,b.col,trLim,false,62,3,"lpt","LP");
    tryM(a.trm,b.f,a.trcol,b.col,trLim,true,60,3,"lptm","LP");
  }
  if(b.tr){
    tryM(a.f,b.tr,a.col,b.trcol,trLim,false,62,3,"lpt","LP");
    tryM(a.f,b.trm,a.col,b.trcol,trLim,true,60,3,"lptm","LP");
  }
  if(a.sq&&b.sq){
    tryM(a.sq,b.sq,a.sqcol,b.sqcol,sqLim,false,48,2,"lp","LP");
    tryM(a.sq,b.sqm,a.sqcol,b.sqcol,sqLim,true,46,2,"lpm","LP");
  }
  return best}
/* ===== Kiểm tra lần hai: so điểm ảnh sau khi hash đã chọn cặp ứng viên =====
   Hash dHash chỉ giữ dấu chiều sáng nên hai phòng khác nhau cùng bố cục sáng/tối vẫn có thể khớp.
   Ở đây mỗi ảnh được thu về bản xám 32×32, bỏ phần sáng tối nền (trừ trung bình cục bộ 7×7) rồi so
   tương quan chuẩn hóa (-1..1): chỉ ảnh có cùng đường nét mới cao. Chỉ chạy cho cặp ứng viên, không chạy cho mọi cặp. */
var PIX=32,pixMemo={},VTHR=[null,{f:.45,c:.30,s:.30},{f:.65,c:.40,s:.40}];
function pixTry(s){
  var s0=imgSrc(s,64),isLh=s0.indexOf("https://lh3.googleusercontent.com/")===0;
  return isLh?[s0+"?dh=1",imgSrc(s,120)+"?dh=2",imgSrc(s,200)]:[s0]}
function normVec(px){
  var n=PIX*PIX,g=new Float32Array(n),h=new Float32Array(n),i,x,y,dx,dy,xx,yy,m,q=0,k=3,t;
  for(i=0;i<n;i++)g[i]=px[i*4]*.299+px[i*4+1]*.587+px[i*4+2]*.114;
  for(y=0;y<PIX;y++)for(x=0;x<PIX;x++){
    m=0;
    for(dy=-k;dy<=k;dy++){yy=y+dy;yy=yy<0?0:yy>=PIX?PIX-1:yy;
      for(dx=-k;dx<=k;dx++){xx=x+dx;xx=xx<0?0:xx>=PIX?PIX-1:xx;m+=g[yy*PIX+xx]}}
    h[y*PIX+x]=g[y*PIX+x]-m/((2*k+1)*(2*k+1))}
  m=0;for(i=0;i<n;i++)m+=h[i];m/=n;
  for(i=0;i<n;i++){t=h[i]-m;h[i]=t;q+=t*t}
  if(q<n)return null;   /* gần như phẳng: không đủ nét để so */
  q=Math.sqrt(q);for(i=0;i<n;i++)h[i]/=q;
  return h}
function pixOf(s){
  if(pixMemo[s]!==undefined)return Promise.resolve(pixMemo[s]);
  return new Promise(function(res){
    var tries=pixTry(s),step=0;
    function next(){
      if(step>=tries.length){res(null);return}
      var u=tries[step++],im=new Image(),settled=false,t;
      if(u.indexOf("https://lh3.googleusercontent.com/")===0)im.crossOrigin="anonymous";
      im.referrerPolicy="no-referrer";
      function drop(){im.onload=im.onerror=null;try{im.src=""}catch(e){}}
      function fail(){if(settled)return;settled=true;clearTimeout(t);drop();setTimeout(next,300)}
      t=setTimeout(fail,12000);
      im.onload=function(){
        if(settled)return;settled=true;clearTimeout(t);
        try{
          var iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;
          if(!iw||!ih){drop();setTimeout(next,300);return}
          var L=iw>=ih,cv=document.createElement("canvas");cv.width=cv.height=PIX;
          var cx=cv.getContext("2d",{willReadFrequently:true}),side=Math.min(iw,ih);
          var grab=function(sx,sy,sw,sh){cx.clearRect(0,0,PIX,PIX);cx.drawImage(im,sx,sy,sw,sh,0,0,PIX,PIX);return normVec(cx.getImageData(0,0,PIX,PIX).data)};
          var v={F:grab(0,0,iw,ih),
                 C:L?grab(iw*18/144,ih*12/104,iw*108/144,ih*80/104):grab(iw*18/108,ih*16/144,iw*72/108,ih*112/144),
                 S:grab(Math.floor((iw-side)/2),Math.floor((ih-side)/2),side,side)};
          drop();pixMemo[s]=v;res(v)
        }catch(e){drop();setTimeout(next,300)}};
      im.onerror=fail;im.src=u}
    next()})}
function dotV(a,b,flip){
  var s=0,n=PIX*PIX,i,y,x;
  if(!flip){for(i=0;i<n;i++)s+=a[i]*b[i];return s}
  for(y=0;y<PIX;y++)for(x=0;x<PIX;x++)s+=a[y*PIX+x]*b[y*PIX+PIX-1-x];
  return s}
function bestDot(pa,pb,keys,flip){
  var best=-2,i,a,b,v;
  for(i=0;i<keys.length;i++){a=pa[keys[i][0]];b=pb[keys[i][1]];if(!a||!b)continue;v=dotV(a,b,flip);if(v>best)best=v}
  return best}
/* Trả về {ok,n}: n là điểm khớp 0..100 (null nếu không kiểm tra được); không đọc được ảnh thì giữ kết quả của hash */
function verOne(m,sa,sb){
  var T=VTHR[VL];
  if(!T||m.k==="lpt"||m.k==="lptm"||(m.d<=3&&!m.k))return Promise.resolve({ok:true,n:null});
  return Promise.all([pixOf(sa),pixOf(sb)]).then(function(r){
    var pa=r[0],pb=r[1];
    if(!pa||!pb)return{ok:true,n:null};
    var k=m.k,n,thr,CC=[["C","C"],["C","F"],["F","C"]];
    if(k===""){n=bestDot(pa,pb,[["F","F"]],false);thr=T.f}
    else if(k==="m"){n=bestDot(pa,pb,[["F","F"]],true);thr=T.f}
    else if(k==="c"){n=bestDot(pa,pb,CC,false);thr=T.c}
    else if(k==="cm"){n=bestDot(pa,pb,CC,true);thr=T.c}
    else if(k==="lp"){n=bestDot(pa,pb,[["S","S"]],false);thr=T.s}
    else if(k==="lpm"){n=bestDot(pa,pb,[["S","S"]],true);thr=T.s}
    else return{ok:true,n:null};
    if(n<=-2)return{ok:true,n:null};
    return{ok:n>=thr,n:Math.max(0,Math.round(n*100))}})}
function verifyList(list){
  if(!VTHR[VL]||!list.length){list.rej=0;return Promise.resolve(list)}
  var res=new Array(list.length),i=0;
  function worker(){
    if(i>=list.length)return Promise.resolve();
    var j=i++,r=list[j];
    return verOne(r,r.x,r.y).then(function(v){res[j]=v}).then(worker)}
  return Promise.all([worker(),worker(),worker()]).then(function(){
    var out=[],rej=0;
    list.forEach(function(r,j){var v=res[j];if(v&&v.ok){if(v.n!==null)r.n=v.n;out.push(r)}else rej++});
    out.rej=rej;return out})}
function matchJobs(jobs,Hm){
  var out=[],seen={},i,j,A=jobs.map(function(x){return Hm[x.s]}),m,k;
  for(i=0;i<jobs.length;i++)for(j=i+1;j<jobs.length;j++){
    if(jobs[i].it.id===jobs[j].it.id)continue;
    if(jobs[i].s===jobs[j].s)m={d:0,k:"",o:(A[i]||A[j])?(A[i]||A[j]).ori:""};
    else if(A[i]&&A[j])m=cmpSig(A[i],A[j],TH);else continue;
    if(m){k=jobs[i].it.id+"|"+jobs[j].it.id+"|"+jobs[i].s+"|"+jobs[j].s;if(!seen[k]){seen[k]=1;out.push({a:jobs[i].it,b:jobs[j].it,x:jobs[i].s,y:jobs[j].s,d:m.d,k:m.k,o:m.o||""})}}}
  return out}
function ignImgNote(r){
  if(!r||!r.ign||!r.ign.length)return"";
  var n=0;r.ign.forEach(function(o){if(o.img&&o.img.length)n++});
  return n?" ("+n+" cặp đang ở mục “Không phải trùng”).":""}
/* ===== So khớp ảnh theo từng lượt BATCH căn, lưu kết quả để lần sau chỉ so ảnh mới ===== */
var BATCH=20,FAIL_TTL=300000,PM_KEY="dpm1",pm=null,pmLoaded=false,pmP=null,sigMemo={};
function sigOf(s){var v=sigMemo[s];if(v!==undefined)return v;var c=cache[s];v=c?parseSig(c):null;if(c!==undefined)sigMemo[s]=v;return v}
function pmEmpty(){return{th:TH,vf:VL,done:{},pairs:[],seen:{},fail:{}}}
function pmStale(){return pm.th!==TH||(pm.vf||0)!==VL}
function loadPm(){
  if(pmLoaded)return Promise.resolve(pm);
  if(pmP)return pmP;
  function fin(raw){
    var o=null;try{o=JSON.parse(raw||"null")}catch(e){}
    if(!o||typeof o!=="object"||!o.done||!o.pairs)o=pmEmpty();
    if(!o.seen||typeof o.seen!=="object")o.seen={};
    if(!o.fail||typeof o.fail!=="object")o.fail={};
    pm=o;pmLoaded=true;pmP=null;return pm}
  var idb=N()&&N().idbGet;
  if(!idb)return Promise.resolve(fin(ls(PM_KEY)));
  pmP=idb(PM_KEY).then(function(v){return fin(typeof v==="string"?v:"")},function(){return fin(ls(PM_KEY))});
  return pmP}
function savePm(){try{var raw=JSON.stringify(pm);if(N()&&N().idbSave)N().idbSave(PM_KEY,raw);else ls(PM_KEY,raw)}catch(e){}}
function seedPmSeen(){
  if(!pm||!items.length||!Object.keys(pm.done).length||Object.keys(pm.seen).length)return;
  var chg=false;
  activeItems().forEach(function(it){
    var ims=(it.im||[]).filter(Boolean);
    if(ims.length&&ims.every(function(s){return !!pm.done[s]})){pm.seen[it.id]=ims.join("|");chg=true}
  });
  if(chg)savePm()}
function pairsFromPm(){
  if(!items.length){imgPairs=[];return imgPairs}
  var byId={};items.forEach(function(it){byId[it.id]=it});
  var seenP={};
  imgPairs=pm.pairs.map(function(r){return{a:byId[r.a],b:byId[r.b],x:r.x,y:r.y,d:r.d,k:r.k||"",o:r.o||"",n:r.n}}).filter(function(r){
    if(!r.a||!r.b)return false;
    var pk=[r.a.id+"\u0001"+r.x,r.b.id+"\u0001"+r.y].sort().join("|");   // cùng cặp ảnh (kể cả đảo chiều) chỉ giữ một
    if(seenP[pk])return false;seenP[pk]=1;return true});
  cleanImgPairs();
  pm.pairs=imgPairs.map(function(r){return{a:r.a.id,b:r.b.id,x:r.x,y:r.y,d:r.d,k:r.k,o:r.o,n:r.n}});
  return imgPairs}
function isFailCool(f,now){return !!(f&&typeof f==="object"&&f.n>=2&&(now-f.t)<FAIL_TTL)}
function pendingItems(skip){
  seedPmSeen();
  var now=Date.now();
  return activeItems().filter(function(it){
    var ims=(it.im||[]).filter(Boolean);
    if(!ims.length)return false;
    if(ims.some(function(s){return !pm.done[s]&&!(skip&&skip[s])&&!isFailCool(pm.fail&&pm.fail[s],now)}))return true;
    return ims.every(function(s){return !!pm.done[s]})&&pm.seen[it.id]!==ims.join("|");
  })}
function matchInc(newJ,oldJ){
  var allJ=oldJ.concat(newJ),A=allJ.map(function(x){return sigOf(x.s)}),out=[],seen={},p=oldJ.length;
  function step(){
    var end=Math.min(p+25,allJ.length),j,m,k,a,b;
    for(;p<end;p++){
      b=allJ[p];
      for(j=0;j<p;j++){
        a=allJ[j];
        if(a.it.id===b.it.id)continue;
        if(a.s===b.s)m={d:0,k:"",o:(A[j]||A[p])?(A[j]||A[p]).ori:""};
        else if(A[j]&&A[p])m=cmpSig(A[j],A[p],TH);else continue;
        if(m){k=a.it.id+"|"+b.it.id+"|"+a.s+"|"+b.s;if(!seen[k]){seen[k]=1;out.push({a:a.it,b:b.it,x:a.s,y:b.s,d:m.d,k:m.k,o:m.o||""})}}
      }
    }
    if(p<allJ.length)return new Promise(function(r){setTimeout(r,0)}).then(step);
    return verifyList(out)}
  return Promise.resolve().then(step)}
function applyCachedPairs(){
  if(scanning||!cacheLoaded)return;
  loadPm().then(function(){
    if(scanning||imgPairs!==null)return;
    if(pmStale()||(!pm.pairs.length&&!Object.keys(pm.done).length)){
      var n=0;activeItems().forEach(function(it){(it.im||[]).forEach(function(s){if(s&&cache[s])n++})});
      if(n>=2)msg("Có "+n+" ảnh đã lưu, chưa so khớp.");
      return}
    pairsFromPm();
    var r=render(),note=ignImgNote(r),np=pendingItems().length;
    msg("Đã nạp "+imgPairs.length+" cặp ảnh giống nhau từ lần quét trước."+(np?" Còn "+np+" căn mới chưa so.":"")+note)})}
function autoScan(){
  if(scanning||!cacheLoaded)return;
  loadPm().then(function(){
    var d=G("dupd");
    if(scanning||!d||!d.open)return;
    if(pmStale()||!Object.keys(pm.done).length)return;   /* chỉ tự chạy sau khi đã quét thủ công một lần */
    if(pendingItems().length>0)scan(true)})}
function rescanFromCache(){
  if(scanning||imgPairs===null)return;
  Promise.all([loadCache(),loadPm()]).then(function(){
    if(pmStale()){scan();return}
    pairsFromPm();
    var r=render(),note=ignImgNote(r),np=pendingItems().length;
    msg("Đã cập nhật: "+imgPairs.length+" cặp ảnh giống nhau."+(np?" Còn "+np+" căn chưa so.":"")+note)})}
function scan(auto){
  if(scanning)return;
  var cnt=0;activeItems().forEach(function(it){(it.im||[]).forEach(function(s){if(s)cnt++})});
  if(cnt<2){msg("Chưa đủ ảnh để so sánh"+(items.length-activeItems().length?" (đang bỏ qua "+(items.length-activeItems().length)+" căn Loại).":"."));return}
  scanning=true;stopFlag=false;G("dupimg").disabled=true;G("dupstop").hidden=false;G("dupbar").hidden=false;
  var bar=G("dupbar").firstChild,badSet={},t={ok:0,bad:0,flat:0,nL:0,nP:0,newPairs:0,căn:0};
  function end(){
    savePm();saveCache();hsPushSoon();
    scanning=false;G("dupimg").disabled=false;G("dupstop").hidden=true;G("dupbar").hidden=true;
    pairsFromPm();
    var r=render(),note=ignImgNote(r),extra=[],np=pendingItems().length;
    if(np&&!stopFlag)note+=" Còn "+np+" căn chưa so.";
    if(t.nL||t.nP)extra.push(t.nL+" ngang, "+t.nP+" dọc");
    if(t.bad)extra.push(t.bad+" ảnh không đọc được");
    if(t.flat)extra.push(t.flat+" ảnh trơn ít chi tiết");
    var exTxt=extra.length?" ("+extra.join(" · ")+")":"";
    if(stopFlag)msg("Đã dừng. Đã so "+t["căn"]+" căn; hiện có "+imgPairs.length+" cặp ảnh giống nhau."+note);
    else if(t.bad&&t.ok===0)msg("Hầu hết ảnh không đọc được, chưa so sánh ảnh được.",1);
    else if(!t["căn"])msg("Không có căn mới cần so. Hiện có "+imgPairs.length+" cặp ảnh giống nhau."+note);
    else msg("Đã so "+t["căn"]+" căn mới ("+t.ok+" ảnh"+exTxt+"): hiện có "+imgPairs.length+" cặp ảnh giống nhau."+note);
    if(hsPendR){var pr=hsPendR;hsPendR=null;hsRefresh(pr)}}
  function batch(total){
    if(stopFlag)return Promise.resolve(false);
    var pend=pendingItems(badSet);
    if(!pend.length)return Promise.resolve(false);
    var B=pend.slice(0,BATCH),newJ=[],urls=[],seenU={},Bid={},now=Date.now();
    B.forEach(function(it){Bid[it.id]=1;(it.im||[]).forEach(function(s){if(!s)return;newJ.push({it:it,s:s});if(!pm.done[s]&&!badSet[s]&&!isFailCool(pm.fail&&pm.fail[s],now)&&!seenU[s]){seenU[s]=1;urls.push(s)}})});
    var idx=0,got={},flat={};
    function worker(){
      if(stopFlag||idx>=urls.length)return Promise.resolve();
      var u=urls[idx++];
      return hashOf(u).then(function(h){
        if(h){var sg=sigOf(u)||parseSig(h);if(sg){got[u]=1;t.ok++;if(sg.ori==="L")t.nL++;else t.nP++}}
        else if(h===null){badSet[u]=1;t.bad++;pm.fail=pm.fail||{};var cf=pm.fail[u];pm.fail[u]={n:(cf&&typeof cf==="object"?cf.n:0)+1,t:Date.now()}}
        else{flat[u]=1;t.flat++}
        msg("Đang so ảnh: "+t["căn"]+"/"+total+" căn (đọc ảnh "+Math.min(idx,urls.length)+"/"+urls.length+")…")
      }).then(worker)}
    return Promise.all([worker(),worker(),worker()]).then(function(){
      if(stopFlag)return false;
      saveCache();hsPushSoon();
      var oldJ=[];
      activeItems().forEach(function(it){if(Bid[it.id])return;(it.im||[]).forEach(function(s){if(s&&pm.done[s])oldJ.push({it:it,s:s})})});
      Object.keys(got).forEach(function(u){pm.done[u]=1;if(pm.fail)delete pm.fail[u]});
      Object.keys(flat).forEach(function(u){pm.done[u]=1;if(pm.fail)delete pm.fail[u]});
      var nj=newJ.filter(function(j){return pm.done[j.s]});
      return matchInc(nj,oldJ).then(function(out){
        out.forEach(function(r){pm.pairs.push({a:r.a.id,b:r.b.id,x:r.x,y:r.y,d:r.d,k:r.k,o:r.o,n:r.n})});
        B.forEach(function(it){
          var ims=(it.im||[]).filter(Boolean);
          if(ims.length&&ims.every(function(s){return !!pm.done[s]}))pm.seen[it.id]=ims.join("|");
        });
        pm.th=TH;pm.vf=VL;t.newPairs+=out.length;t["căn"]+=B.length;
        savePm();
        bar.style.width=Math.min(100,t["căn"]/total*100)+"%";
        return true})})}
  function run(total){return batch(total).then(function(more){if(more&&!stopFlag)return run(total)})}
  if(hsPhase)msg("Đang đồng bộ hash từ máy chủ…");
  Promise.all([loadCache(),loadPm(),hsWait()]).then(function(){
    if(hsPendR){if(hsPendR.chg){pm=pmEmpty();savePm()}hsPendR=null}   // hash vừa đổi theo máy chủ: quét lại từ hash mới
    if(pmStale()){pm=pmEmpty();savePm()}
    if(!auto)pm.fail={};
    var total=pendingItems().length;
    if(!total){return}
    msg("Đang so ảnh: 0/"+total+" căn…");
    return run(total)
  }).then(end,function(){end()})}
function onPairClick(e){
  var mo=e.target.closest("[data-more]");if(mo){if(mo.dataset.more==="ign")limIgn+=LIMIT;else limMain+=LIMIT;render();return}
  var cm=e.target.closest("[data-cmpmore]");if(cm){var oi=+cm.dataset.cmpmore,oo=viewList[oi];if(oo){cmpAll[oo.a.id+"|"+oo.b.id]=true;var bx=cm.closest(".dpimgs");if(bx){bx.innerHTML=imgCmpH(oo,oi);markImgs(bx)}}return}
  var cf=e.target.closest("[data-cmpfull]");if(cf){openFull(+cf.dataset.cmpfull);return}
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
  var st=document.createElement("style");st.textContent=CSS+CSS2;document.head.appendChild(st);
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
    if(zoomCmp){zoomCmp.stack=!zoomCmp.stack;zlay=zoomCmp.stack?"1":"0";try{ls("dzl",zlay)}catch(e){}renderCmpZoom()}
    else{
      var zg=G("dupzg"),sk=!zg.classList.contains("stack");
      zg.classList.toggle("stack",sk);
      G("dupzlay").textContent=sk?"Cạnh nhau":"Xếp dọc";zlay=sk?"1":"0";try{ls("dzl",zlay)}catch(e){}
    }
  };
  G("dupz1").onclick=function(){stepCmpZoom("a",1)};
  G("dupz2").onclick=function(){stepCmpZoom("b",1)};
  G("dupz1prev").onclick=function(){stepCmpZoom("a",-1)};
  G("dupz1next").onclick=function(){stepCmpZoom("a",1)};
  G("dupz2prev").onclick=function(){stepCmpZoom("b",-1)};
  G("dupz2next").onclick=function(){stepCmpZoom("b",1)};
  G("dupz").onclick=function(e){if(e.target===this)closeZoom()};
  G("dupzm").onclick=function(e){var b=e.target.closest("[data-zjump]");if(b)zJump(+b.dataset.zjump)};
  ["a","b"].forEach(function(sd,i){
    var st=G("dupz"+(i+1)).parentNode,x0=null,y0=0;
    st.addEventListener("pointerdown",function(){if(zoomCmp){zoomCmp.act=sd;markAct()}},{passive:true});
    st.addEventListener("touchstart",function(e){if(e.touches.length===1){x0=e.touches[0].clientX;y0=e.touches[0].clientY}else x0=null},{passive:true});
    st.addEventListener("touchend",function(e){
      if(x0===null||!zoomCmp)return;
      var dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;
      if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.4){stepCmpZoom(sd,dx<0?1:-1);e.preventDefault()}},{passive:false})});
  G("dupd").addEventListener("keydown",function(e){
    if(!zoomCmp||G("dupz").hidden)return;
    if(e.key==="ArrowRight"){stepCmpZoom(zoomCmp.act||"a",1);e.preventDefault()}
    else if(e.key==="ArrowLeft"){stepCmpZoom(zoomCmp.act||"a",-1);e.preventDefault()}});
  G("dupd").addEventListener("load",function(e){var t=e.target;if(t&&t.tagName==="IMG"&&!t.classList.contains("dpl")&&!t.closest(".dpzstage"))t.classList.add("dpl")},true);
  G("dupl").addEventListener("pointerdown",onPairDown,{passive:true});
  G("dupignl").addEventListener("pointerdown",onPairDown,{passive:true});
  document.addEventListener("visibilitychange",function(){if(document.hidden)flushIgnored();else{zPump();var dd=G("dupd");if(dd&&dd.open)pullIgnored(false)}});
  window.addEventListener("pagehide",flushIgnored);
  window.addEventListener("online",function(){zPump();flushIgnored()});
  G("dupd").addEventListener("cancel",function(e){
    if(closeZoom()){e.preventDefault();return}
    if(showIgn){e.preventDefault();goMain()}
  });
  G("dupsens").onchange=function(){TH=+this.value||14;try{ls("dth",String(TH))}catch(e){}rescanFromCache()};
  G("dupvf").onchange=function(){VL=+this.value||0;try{ls("dvf",String(VL))}catch(e){}rescanFromCache()};
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
  G("dupundob").onclick=undoDo;
  G("dupundox").onclick=function(){undoSt=[];undoUi()};
  G("dupignclr").onclick=function(){
    if(!confirm("Khôi phục tất cả các cặp đã đánh dấu về lại danh sách kiểm tra trùng?"))return;
    loadIgnored();
    var pa=Object.keys(ignored).map(function(k){ignDirty[k]=0;return{k:k,p:ignored[k]}});
    ignored={};undoPush("Đã khôi phục "+pa.length+" cặp",pa);saveIgnored();goMain()};
  G("dupl").onclick=onPairClick;
  G("dupignl").onclick=onPairClick;
  G("dupl").onchange=onPairChange;
  G("dupignl").onchange=onPairChange}
function open(nt){
  if(nt)NT=nt;
  if(!N()){alert("Ứng dụng đang tải, thử lại sau vài giây.");return}
  init(N());
  undoSt=[];undoUi();
  loadSkip();
  loadImgMode();
  G("dupsens").value=String(TH);
  G("dupvf").value=String(VL);
  G("dupimgv").value=imgAutoMode;
  G("dupnoout").checked=skipOut;
  items=N().items();cleanImgPairs();limMain=limIgn=LIMIT;openSet={};openImgSet={};pairImgMode={};pairImgMsg={};cmpAll={};zoomCmp=null;showIgn=false;msg(imgPairs&&imgPairs.length?"Đang hiện "+imgPairs.length+" cặp ảnh giống nhau.":"");G("dupbar").hidden=true;G("dupstop").hidden=true;G("dupz").hidden=true;render();
  if(!G("dupd").open)G("dupd").showModal();G("dupd").scrollTop=0;
  loadCache().then(function(){if(G("dupd").open&&!scanning){if(imgPairs===null)applyCachedPairs();autoScan()}});
  pullIgnored(true);hsPull()}
function close(){
  stopFlag=true;zoomCmp=null;undoSt=[];undoUi();
  flushIgnored();hsFlush();
  var z=G("dupz"),d=G("dupd");
  if(z)z.hidden=true;
  if(d&&d.open)d.close()}
function sync(){
  var d=G("dupd");if(!(d&&d.open&&N()))return;
  clearTimeout(syncT);syncT=setTimeout(function(){
    items=N().items();cleanImgPairs();
    loadIgnored();var byId={},chg=false;items.forEach(function(it){byId[it.id]=1});
    Object.keys(ignored).forEach(function(k){var ids=k.split("|");if(!byId[ids[0]]||!byId[ids[1]]){delete ignored[k];ignDirty[k]=0;chg=true}});
    if(chg)saveIgnored();
    render();
    if(cacheLoaded&&!scanning)autoScan()
  },120)}

window.Dup={pull:function(f){var p=pullIgnored(f);if(f)hsPull();return p},init:init,open:open,close:close,sync:sync,closeZoom:closeZoom};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){init()});
else init();
})();
