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
".dpzact{display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;margin-top:8px}",
".dpzact [hidden]{display:none}",
".dpzact button{min-height:34px}",
".dpz.stk .dpzact{flex:none;margin:0;padding:6px 8px}",
"#dupsum{font-size:var(--fs-b);font-weight:700;color:var(--ink);margin:2px 0 8px}",
"#dupsum:empty,#dupm:empty,#dupignsum:empty{display:none}",
".dpcfg{margin:4px 0 8px}",
".dpcfg>summary{cursor:pointer;color:var(--mute);font-size:var(--fs-s);font-weight:600;min-height:34px;display:flex;align-items:center}",
".dpcfg[open]>summary{margin-bottom:4px}",
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
var DLG="<dialog id=\"dupd\"><div class=\"form\" id=\"dupmain\">\n  <h2>Kiểm tra trùng</h2>\n  <p class=\"pm\" id=\"dupsum\"></p>\n  <div class=\"dpact\"><div class=\"foot2\"><button class=\"btn p\" type=\"button\" id=\"dupimg\">Quét ảnh trùng</button><button class=\"btn\" type=\"button\" id=\"dupstop\" hidden>Dừng</button></div></div>\n  <div class=\"dpb\" id=\"dupbar\" hidden><i></i></div>\n  <p class=\"pm\" id=\"dupm\" role=\"status\"></p>\n  <div class=\"dpbar2\" id=\"duplinks\" hidden><button type=\"button\" class=\"link\" id=\"duptog\" hidden></button><button type=\"button\" class=\"dpignbtn\" id=\"dupigntog\" hidden></button></div>\n  <details class=\"dpcfg\"><summary>Cài đặt</summary><div class=\"dpset\"><div class=\"dpsens\"><label for=\"dupsens\">Độ nhạy ảnh</label><select id=\"dupsens\"><option value=\"87\">Ít nhầm · 87%</option><option value=\"80\" selected>Vừa · 80%</option><option value=\"77\">Nhạy · 77%</option><option value=\"73\">Rất nhạy · 73%</option></select></div>\n  <div class=\"dpsens\"><label for=\"dupimgv\">Xem ảnh</label><select id=\"dupimgv\"><option value=\"manual\" selected>Bấm để mở</option><option value=\"both\">Mở sẵn · 2 cột</option><option value=\"stack\">Mở sẵn · xếp dọc</option></select></div>\n  <div class=\"dpsens\"><label class=\"dpopt\"><input type=\"checkbox\" id=\"dupnoout\"><span>Bỏ qua căn Loại</span></label><button type=\"button\" class=\"btn\" id=\"duprst\">Đặt lại</button></div></div></details>\n  <div id=\"dupl\"></div>\n  <div class=\"foot\"><button class=\"btn p\" type=\"button\" id=\"dupx\">Đóng</button></div>\n</div><div class=\"form\" id=\"dupignview\" hidden>\n  <div class=\"dphead\"><button type=\"button\" class=\"btn\" id=\"dupback\">← Quay lại</button><h2>Không phải trùng</h2></div>\n  <p class=\"pm\" id=\"dupignsum\"></p>\n  <button type=\"button\" class=\"link\" id=\"dupignclr\" hidden>Khôi phục tất cả về danh sách kiểm tra</button>\n  <div id=\"dupignl\"></div>\n  <div class=\"foot\"><button class=\"btn\" type=\"button\" id=\"dupback2\">← Quay lại</button><button class=\"btn p\" type=\"button\" id=\"dupx2\">Đóng</button></div>\n</div><div class=\"dpz\" id=\"dupz\" hidden><div class=\"dpzb\"><div class=\"dpzhdr\"><p class=\"dpzt\" id=\"dupzt\"></p><button type=\"button\" class=\"dpzlay\" id=\"dupzlay\">Xếp dọc</button><button type=\"button\" class=\"dpzcls\" id=\"dupzx2\" aria-label=\"Đóng\">×</button></div><div class=\"dpzm\" id=\"dupzm\" hidden></div><div class=\"dpzg\" id=\"dupzg\"><div class=\"dpzcol\"><div class=\"dpzstage\"><img id=\"dupz1\" alt=\"Ảnh căn 1\"><span class=\"dpzempty\" id=\"dupze1\" hidden>Chưa có ảnh</span></div><div class=\"dpzmeta\"><b id=\"dupz1n\"></b><small id=\"dupz1m\"></small></div><div class=\"dpzctrl\" id=\"dupzc1\" hidden><button type=\"button\" id=\"dupz1prev\" aria-label=\"Ảnh trước căn 1\">‹</button><span id=\"dupz1c\"></span><button type=\"button\" id=\"dupz1next\" aria-label=\"Ảnh sau căn 1\">›</button></div></div><div class=\"dpzcol\"><div class=\"dpzstage\"><img id=\"dupz2\" alt=\"Ảnh căn 2\"><span class=\"dpzempty\" id=\"dupze2\" hidden>Chưa có ảnh</span></div><div class=\"dpzmeta\"><b id=\"dupz2n\"></b><small id=\"dupz2m\"></small></div><div class=\"dpzctrl\" id=\"dupzc2\" hidden><button type=\"button\" id=\"dupz2prev\" aria-label=\"Ảnh trước căn 2\">‹</button><span id=\"dupz2c\"></span><button type=\"button\" id=\"dupz2next\" aria-label=\"Ảnh sau căn 2\">›</button></div></div></div><div class=\"dpzact\" id=\"dupzact\"><button type=\"button\" class=\"dpno\" id=\"dupzign\">Không phải trùng</button><button type=\"button\" class=\"dpdel\" id=\"dupzdel1\">Xóa căn 1</button><button type=\"button\" class=\"dpdel\" id=\"dupzdel2\">Xóa căn 2</button></div><div class=\"foot\"><button class=\"btn p\" type=\"button\" id=\"dupzx\">Đóng</button></div></div></div><div class=\"dpundo\" id=\"dupundo\" hidden><span id=\"dupundot\"></span><button type=\"button\" id=\"dupundob\">↶ Hoàn tác</button><button type=\"button\" class=\"x\" id=\"dupundox\" aria-label=\"Ẩn\">✕</button></div></dialog>";
var TH=80,VL=1,MIN=2,imgPairs=null,scanning=false,stopFlag=false,cache={},cacheLoaded=false,cacheP=null,inflight={},LIMIT=50,limMain=50,limIgn=50,memo=null,syncT=0,showOne=false,showIgn=false,skipOut=true,skipLoaded=false,imgAutoMode="manual",imgModeLoaded=false,viewList=[],openSet={},openImgSet={},pairImgMode={},ignored={},ignLoaded=false,pairImgMsg={},zoomCmp=null;

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
    var R={},nxt={},byId=null,its=N().items();
    (d.pairs||[]).forEach(function(p){R[p.k]=p.t||1;nxt[p.k]=p.t||1});
    Object.keys(ignDirty).forEach(function(k){if(ignDirty[k]>0)nxt[k]=ignDirty[k];else delete nxt[k]});
    if(its&&its.length){
      byId={};its.forEach(function(it){byId[it.id]=1});
      Object.keys(nxt).forEach(function(k){var ids=k.split("|");if(!byId[ids[0]]||!byId[ids[1]]){delete nxt[k];if(!(k in R))delete ignDirty[k]}   /* chỉ ẩn tạm trên máy, KHÔNG gửi lệnh xóa lên máy chủ: danh sách căn trên máy có thể cũ hơn máy chủ (căn mới do máy khác thêm). Máy chủ tự xóa cặp khi xóa căn (dupDropId_) */});
    }
    var chg=!sameMap(ignored,nxt);
    ignored=nxt;
    ignWriteLs();
    pushIgnored();
    var dd=G("dupd");if(dd&&dd.open&&chg)render()
  },function(){}).then(function(){pullP=null},function(){pullP=null});
  return pullP}
function canWrite(){if(N()&&N().canW)return !!N().canW();var b=G("bnow");return b?!b.hidden:true}

/* ---------- Chuẩn hoá ---------- */
function nd(s){return String(s==null?"":s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/[^a-z0-9]+/g," ").trim()}
function pn1(s){var d=String(s||"").replace(/\D/g,"");if(d.indexOf("84")===0&&d.length>=11)d="0"+d.slice(2);if(d.length===9&&d.charAt(0)!=="0")d="0"+d;return d.length>=9&&d.length<=11?d:""}
/* 1 ô có thể ghi nhiều số ("0901… / 0912…", "A - B", "hoặc"): trả về mảng số đã chuẩn hoá */
function pn(s){var o=[];String(s==null?"":s).split(/\s*[\/,;|&]\s*|\s+[-–]\s+|\s+(?:hoac|hoặc|và|va)\s+/i).forEach(function(x){x=pn1(x);if(x&&o.indexOf(x)<0)o.push(x)});return o}
function shareArr(a,b){for(var i=0;i<a.length;i++)if(b.indexOf(a[i])>=0)return true;return false}
function ln(u){u=su(u);if(!u)return"";u=u.toLowerCase().replace(/^https?:\/\/(www\.|m\.)?/,"").replace(/#.*$/,"");var p=u.split("?"),b=p[0].replace(/\/+$/,""),q=(p[1]||"").split("&").filter(function(x){return x&&!/^(utm_|fbclid|gclid|zarsrc|ref=)/.test(x)}).sort().join("&");return b+(q?"?"+q:"")}
/* mã tin: cùng website + cùng dãy số dài cuối đường dẫn (khác slug vẫn nhận ra) */
function lidOf(u){if(!u)return"";var h=u.split("/")[0],m=u.split("?")[0].match(/\d{6,}/g);return m?h+"#"+m[m.length-1]:""}
function lid(u){return lidOf(ln(u))}
function nw(s){return nd(s).replace(/^(thanh pho|thi xa|thi tran|phuong|quan|huyen|xa|tp|p|q)(?=\s|\d|$)\s*/,"").replace(/^0+(?=\d)/,"")}
var STOP={so:1,nha:1,duong:1,d:1,hem:1,ngo:1,ngach:1,kiet:1,p:1,phuong:1,q:1,quan:1,xa:1,hcm:1,tphcm:1,tp:1};
function addrKey(it){var t=nd(it.a).replace(/\b(thanh pho ho chi minh|tp ho chi minh|ho chi minh)\b/g," ").replace(/\b([pq])0*(\d+)\b/g,"$2").replace(/\b0+(?=\d)/g,"").split(" ").filter(function(w){return w&&!STOP[w]});
  var hasNum=t.some(function(w){return/\d/.test(w)}),hasWord=t.some(function(w){return/^[a-z]{2,}$/.test(w)});
  return hasNum&&hasWord?t.join(" "):""}
function num(v){v=v==null||v===""?NaN:+v;return v>0?v:null}
function feat(it){var nm=nd(it.n),set=Object.create(null),k=0,lk=ln(it.lk);nm.split(" ").forEach(function(w){if(w&&!set[w]){set[w]=1;k++}});
  return{it:it,lk:lk,li:lidOf(lk),mp:ln(it.mp),ph:pn(it.ph),sp:pn(it.sp),ad:addrKey(it),w:nw(it.w),d:nw(it.d),nm:nm,ns:set,nk:k,p:num(it.p),ar:num(it.ar)}}
/* ---------- So từng cặp: mỗi điều kiện khớp được tính 1 ---------- */
function compat(x,y){return(!x.w||!y.w||x.w===y.w)&&(!x.d||!y.d||x.d===y.d)}
function sameArea(x,y){return(x.w&&x.w===y.w)||(x.d&&x.d===y.d)}
function nameSim(x,y){if(!x.nm||!y.nm)return false;if(x.nm===y.nm)return x.nm.length>=6;
  if(x.nk<3||y.nk<3)return false;var c=0;for(var w in x.ns)if(y.ns[w])c++;return c/(x.nk+y.nk-c)>=0.8}
function cmp(x,y){var w=[],cp=compat(x,y);
  if(x.lk&&(x.lk===y.lk||(x.li&&x.li===y.li)))w.push("Cùng link tin đăng");
  if(x.mp&&x.mp===y.mp)w.push("Cùng link Google Maps");
  if(shareArr(x.ph,y.ph))w.push("Cùng SĐT chủ nhà");
  if(shareArr(x.sp,y.sp))w.push("Cùng SĐT sale");
  if(x.ad&&x.ad===y.ad&&cp)w.push("Cùng địa chỉ");
  if(cp&&nameSim(x,y))w.push("Tên giống nhau");
  if(x.p!=null&&y.p!=null&&x.ar&&y.ar&&Math.abs(x.p-y.p)<=0.05&&Math.abs(x.ar-y.ar)<=1&&cp&&sameArea(x,y))w.push("Giá + diện tích giống nhau");
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
/* Ảnh phòng chung (nhà vệ sinh, cầu thang...) rất giống nhau giữa các căn khác nhau.
   HUB (hubLim, cộng thêm theo số căn): ảnh giống với ảnh của ≥HUB căn khác nhau là ảnh chung chung; khi cặp căn chưa có đủ 2 điểm thông tin đi kèm thì cặp ảnh đó bị bỏ, trừ khi giống ≥HUB_N%.
   Cặp căn còn ít nhất 1 cặp ảnh hợp lệ vẫn nằm ở danh sách chính như bình thường. */
var HUB=3,HUB_N=90,HUB_STEP=100,HUB_MAX=12;
/* Ngưỡng HUB tăng theo số căn: càng nhiều căn thì ảnh chung chung càng dễ giống ngẫu nhiên với nhiều căn khác.
   n<100 căn: 3 · 100-199: 4 · 200-299: 5 … tối đa HUB_MAX */
function hubLim(n){return Math.min(HUB_MAX,HUB+Math.floor((n||0)/HUB_STEP))}
function ih(o){return o.img.length>0}
function filterGenericImgs(P,n){
  var hub={},lim=hubLim(n);
  Object.keys(P).forEach(function(k){var o=P[k];o.img.forEach(function(m){(hub[m.x]||(hub[m.x]={}))[o.b.id]=1;(hub[m.y]||(hub[m.y]={}))[o.a.id]=1})});
  function hn(s){return hub[s]?Object.keys(hub[s]).length:0}
  Object.keys(P).forEach(function(k){
    var o=P[k];if(!o.img.length)return;
    var ts=0;o.why.forEach(function(w){if(w!=="img")ts+=WT[w]||1});
    function nn(m){return m.n!=null?m.n:Math.max(0,100-m.d)}
    if(ts<MIN){
      o.img=o.img.filter(function(m){return nn(m)>=HUB_N||(hn(m.x)<lim&&hn(m.y)<lim)});
      if(!o.img.length){var i=o.why.indexOf("img");if(i>=0)o.why.splice(i,1)}
    }
    if(!o.why.length)delete P[k];
  })}
function sc(o){var t=0;o.why.forEach(function(l){t+=WT[l]||1});return t}
function itSig(it){return[it.id,it.n,it.a,it.w,it.d,it.p,it.ar,it.lk,it.mp,it.ph,it.sp].join("\u0001")}
function loadSkip(){if(skipLoaded)return;skipLoaded=true;try{skipOut=ls("dnoout")!=="0"}catch(e){skipOut=true}}
function activeItems(){loadSkip();return skipOut?items.filter(function(it){return (it.st||"new")!=="out"}):items}
/* Phần so thông tin là O(n²): chỉ tính lại khi dữ liệu liên quan thật sự đổi */
function textPairs(src){
  var sig=(skipOut?"1:":"0:")+src.map(itSig).join("\u0002");
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
  filterGenericImgs(P,src.length);
  var all=Object.keys(P).map(function(k){var o=P[k];o.sc=sc(o);return o}).sort(function(a,b){return(ih(b)?1:0)-(ih(a)?1:0)||b.sc-a.sc||b.img.length-a.img.length});
  var active=[],ign=[];
  all.forEach(function(p){
    if(ignored[p.a.id+"|"+p.b.id]){ign.push(p);return}
    if(!ih(p)&&p.sc>=MIN&&priceDiffOver20(p.a,p.b))return;
    active.push(p);
  });
  return{
    strong:active.filter(function(o){return o.sc>=MIN||ih(o)}),
    weak:active.filter(function(o){return o.sc<MIN&&!ih(o)}),
    ign:ign,
    nSrc:src.length,
    nSkip:items.length-src.length
  }}
function simText(d,k,ori,n){
  var p=n!=null?n:Math.max(0,100-d);
  return p>=99?"Giống ~100% (DINOv3)":"Giống "+p+"% (DINOv3)"}
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
    h+='<div class="dpi"><p class="dpil">Ảnh giống nhau ('+o.img.length+' cặp)</p><div class="dpig">';
    o.img.forEach(function(m,i){
      h+='<button type="button" class="dpip" data-zoom="'+idx+':'+i+'"><span><img alt="Ảnh căn 1" loading="lazy" src="'+esc(imgSrc(m.x,300))+'"><img alt="Ảnh căn 2" loading="lazy" src="'+esc(imgSrc(m.y,300))+'"></span><small>'+esc(simText(m.d,m.k,m.o,m.n))+'</small></button>';
    });
    h+='</div></div>';
  }
  return h;
}
function loadImgMode(){if(imgModeLoaded)return;imgModeLoaded=true;try{var v=ls("dimgv");imgAutoMode=(v==="both"||v==="stack")?v:"manual"}catch(e){imgAutoMode="manual"}try{var t=+ls("dsim");if(t>0){TH=thNorm(t);if(String(TH)!==String(t))ls("dsim",String(TH))}var z=ls("dzl");zlay=(z==="1"||z==="0")?z:null}catch(e){}}
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
  return '<div class="dprow"><div class="dpr"><span class="dpt"><b>'+esc(it.n)+'</b><small>'+esc(ad||"Chưa có địa chỉ")+(it.p!=null?" · "+fmt(it.p)+" tr":"")+(it.ar?" · "+fmt(it.ar)+" m²":"")+'</small></span><span class="pill" style="--c:var(--s-'+esc(k)+');--bg2:var(--b-'+esc(k)+')">'+esc(stName(k))+'</span></div>'+(allowWrite?'<button type="button" class="dpedit" data-edit="'+esc(it.id)+'" title="Sửa thông tin căn này" aria-label="Sửa căn '+esc(it.n)+'">Sửa</button><button type="button" class="dpdel" data-del="'+idx+':'+side+'" title="Xóa căn này" aria-label="Xóa căn '+esc(it.n)+'">Xóa</button>':'')+'</div>'}
function pairH(o,idx,isIgn){
  var n=o.why.length,s=o.sc||0,k=o.a.id+"|"+o.b.id,isOpen=!!openSet[k],imgOpen=isImgOpen(k),allowDel=canWrite(),st=pairImgMsg[k];
  var na=houseImgs(o.a).length,nb=houseImgs(o.b).length,totImg=na+nb;
  var lbl=s>=3?"Gần như chắc chắn":s>=2?"Có thể trùng":o.img.length?"Trùng ảnh":"Trùng 1 điều kiện";
  var ts=0;o.why.forEach(function(w){if(w!=="img")ts+=WT[w]||1});var cc=isIgn?"gr":ih(o)?"im":ts>=2?"pu":"gr";
  var h='<div class="dpc '+cc+'">'+rowH(o.a,idx,"a",allowDel)+rowH(o.b,idx,"b",allowDel)+'<p class="dpn" data-tog="'+idx+'">'+lbl+(n>1?' ('+n+' điều kiện)':'')+'</p><div class="dpw" data-tog="'+idx+'" title="Bấm để xem thông tin trùng">';
  o.why.forEach(function(w){if(w!=="img")h+='<span>'+esc(w)+'</span>'});
  if(o.img.length)h+='<span class="im">'+o.img.length+' ảnh giống nhau</span>';
  h+='</div>';
  if(o.img.length)h+='<div class="dpm">'+o.img.slice(0,3).map(function(m,i){return '<div data-zoom="'+idx+':'+i+'" title="Bấm để phóng to"><img alt="Ảnh căn 1" loading="lazy" src="'+esc(imgSrc(m.x,200))+'"><img alt="Ảnh căn 2" loading="lazy" src="'+esc(imgSrc(m.y,200))+'"></div>'}).join("")+'</div>';
  h+='<div class="dpa">';
  if(isIgn)h+='<button type="button" class="dpno undo" data-unign="'+idx+'">Khôi phục nghi trùng</button>';
  else h+='<button type="button" class="dpno" data-ign="'+idx+'">Không phải trùng</button>';
  h+='<button type="button" class="dpchk" data-chkimg="'+idx+'"'+(st&&st.busy?' disabled':'')+'>'+(st&&st.busy?'Đang kiểm tra…':'Kiểm tra ảnh')+'</button>';
  h+='<button type="button" class="dpimgbtn" data-imgtog="'+idx+'" aria-expanded="'+(totImg&&imgOpen?"true":"false")+'"'+(totImg?"":" disabled")+'>'+(totImg?(imgOpen?'Ẩn ảnh ('+na+' · '+nb+') ▴':'Xem ảnh ('+na+' · '+nb+') ▾'):'Không có ảnh')+'</button>';
  h+='<button type="button" class="link dpv" data-tog="'+idx+'">'+(isOpen?"Ẩn thông tin":"Thông tin")+'</button></div>';
  if(st&&st.text)h+='<p class="dpst'+(st.ok?' ok':st.bad?' bad':'')+'">'+esc(st.text)+'</p>';
  h+='<div class="dpdet"'+(isOpen?"":" hidden")+'>'+(isOpen?detailH(o,idx):"")+'</div>';
  h+='<div class="dpimgs"'+(totImg&&imgOpen?"":" hidden")+'>'+(totImg&&imgOpen?imgCmpH(o,idx):"")+'</div>';
  return h+'</div>'}
/* Thống kê "Không phải trùng": cặp đã đánh dấu chỉ hiện trong giao diện khi hai căn vẫn còn nghi trùng và không thuộc căn Loại đang bị ẩn */
function ignStat(r){
  loadIgnored();loadSkip();
  var byId={},keys,shown={},ok=0,out=0,none=0;
  items.forEach(function(it){byId[it.id]=it});
  keys=Object.keys(ignored).filter(function(k){var a=k.split("|");return ignored[k]&&byId[a[0]]&&byId[a[1]]});
  r=r||build();
  r.ign.forEach(function(p){shown[p.a.id+"|"+p.b.id]=1});
  keys.forEach(function(k){
    var a=k.split("|"),A=byId[a[0]],B=byId[a[1]];
    if(shown[k]){ok++;return}
    if(skipOut&&((A.st||"new")==="out"||(B.st||"new")==="out"))out++;else none++});
  return{total:keys.length,shown:ok,out:out,none:none,img:imgPairs!==null}}
function render(){
  var r=build(),list=showOne?r.strong.concat(r.weak):r.strong,el=G("dupl"),n=r.nSrc,sk=r.nSkip?" (đã bỏ qua "+r.nSkip+" căn Loại)":"",hi=r.strong.filter(function(o){return o.sc>=3}).length,tg=G("duptog"),itg=G("dupigntog"),ignEl=G("dupignl");
  viewList=[];
  G("dupmain").hidden=showIgn;
  G("dupignview").hidden=!showIgn;
  if(showIgn){
    el.innerHTML="";
    var ist=ignStat(r),hid=ist.out+ist.none;
    G("dupignsum").textContent=(r.ign.length?r.ign.length+" cặp không phải trùng":"Chưa có cặp nào")+(hid?" · "+hid+" cặp đang ẩn"+(ist.out||ist.none?" ("+(ist.out?ist.out+" căn Loại":"")+(ist.out&&ist.none?", ":"")+(ist.none?ist.none+" hết nghi trùng":"")+")":""):"");
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
  G("dupsum").textContent=!items.length?"Chưa có căn nào.":!n?"Tất cả căn đều đã Loại.":(r.strong.length?r.strong.length+" cặp nghi trùng"+(hi?" · "+hi+" gần như chắc chắn":""):"Không có cặp nghi trùng")+" · "+n+" căn"+(r.nSkip?" (bỏ "+r.nSkip+" Loại)":"");
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
  if(btn)btn.textContent=openSet[k]?"Ẩn thông tin":"Thông tin";
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
  Promise.all([loadCache(),loadPm(),dinoLoad()]).then(function(){
    smartCalc();
    var uniq={},list=[];
    aIm.concat(bIm).forEach(function(s){if(!uniq[s]){uniq[s]=1;list.push(s)}});
    var map={},doneSet={},bad=0,pos=0;
    function worker(){
      if(pos>=list.length)return Promise.resolve();
      var s=list[pos++];
      return hashOf(s).then(function(h){if(h!==null){doneSet[s]=1;if(h){var sg=sigOf(s)||parseSig(h);if(sg)map[s]=sg}}else bad++}).then(worker)}
    return Promise.all(spawnW(worker)).then(function(){
      saveCache();
      var found=[],seen={},i,j,sa,sb,ha,hb,m;
      for(i=0;i<aIm.length;i++){
        sa=aIm[i];ha=map[sa];
        for(j=0;j<bIm.length;j++){
          sb=bIm[j];hb=map[sb];
          if(sa!==sb&&(!ha||!hb))continue;
          m=sa===sb?{d:0,n:100,k:"",o:(ha||hb)?(ha||hb).ori:""}:cmpSig(ha,hb,SM.tl);
          if(m){
            var pk=sa+"|"+sb;
            if(!seen[pk]){seen[pk]=1;found.push({a:o.a,b:o.b,x:sa,y:sb,d:m.d,k:m.k,o:m.o||"",n:m.n})}
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
        pm.th=TH;pm.vf=VL;pm.cal=SM.cal;
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
  },function(e){pairImgMsg[k]={bad:true,text:"Không tải được mô hình DINOv3 (cần mạng ở lần đầu): "+(e&&e.message||e)};render()})}
function afterDel(id){
  loadIgnored();var changed=false;
  Object.keys(ignored).forEach(function(k){var ids=k.split("|");if(ids[0]===id||ids[1]===id){delete ignored[k];ignDirty[k]=0;changed=true}});
  if(changed)saveIgnored();
  sync()}
function delItem(el,cb){
  var p=String(el.dataset.del||"").split(":"),o=viewList[+p[0]],it=o&&o[p[1]];
  if(!it)return;
  if(!canWrite()){alert("Bạn chỉ có quyền xem, không thể xóa.");return}
  if(N().del){
    if(!confirm('Xóa căn "'+it.n+'"? Thư mục ảnh của căn trên Drive cũng sẽ được chuyển vào thùng rác.'))return;
    var t0=el.textContent;el.disabled=true;el.textContent="Đang xóa…";
    N().del(it.id).then(function(){afterDel(it.id);if(cb)cb()},function(){if(document.contains(el)){el.disabled=false;el.textContent=t0}});
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
  if(!N().items().some(function(x){return x.id===it.id})){afterDel(it.id);if(cb)cb()}}
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
/* viewList dựng lại sau mỗi render(): nếu hộp phóng to đang mở thì dò lại vị trí cặp theo key; cặp không còn trong danh sách thì đóng, để Xóa/Không trùng không tác động nhầm cặp khác */
function zoomResync(){
  var z=zoomCmp;if(!z)return;
  for(var i=0;i<viewList.length;i++)if(viewList[i].a.id+"|"+viewList[i].b.id===z.key){if(i!==z.idx){z.idx=i;renderCmpZoom()}return}
  closeZoom()}
function afterRender(){
  markImgs(G("dupl"));markImgs(G("dupignl"));zoomResync();
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
    zm.innerHTML=o.img.map(function(m,i){return '<button type="button" class="dpzj'+(i===mi?' cur':'')+'" data-zjump="'+i+'">Trùng '+(i+1)+' · '+(m.n!=null?m.n:Math.max(0,100-m.d))+'%</button>'}).join("");
  }else{zm.hidden=true;zm.innerHTML=""}
  var zk=o.a.id+"|"+o.b.id,zi=G("dupzign"),zd1=G("dupzdel1"),zd2=G("dupzdel2"),zw=canWrite();
  loadIgnored();
  zi.textContent=ignored[zk]?"Khôi phục nghi trùng":"Không phải trùng";
  zd1.hidden=zd2.hidden=!zw;
  zd1.dataset.del=zoomCmp.idx+":a";zd2.dataset.del=zoomCmp.idx+":b";
  zd1.title=o.a.n||"";zd2.title=o.b.n||"";
  markAct();
  ["a","b"].forEach(function(sd){
    var cur=sd==="a"?imA:imB,s=cur?cur.s:"";
    if(k[sd]!==undefined||zShown[sd]!==s){stageShow(sd,s,k[sd]);zShown[sd]=s}});
  G("dupz").hidden=false;
  zNear()}
function beginZoom(idx,L,ia,ib,loW,act){
  zoomCmp={idx:idx,key:viewList[idx].a.id+"|"+viewList[idx].b.id,imgsA:L.A,imgsB:L.B,ia:ia,ib:ib,act:act||"a",stack:zlay===null?imgAutoMode==="stack":zlay==="1"};
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
function zoomIgnore(){
  var o=zoomCmp&&viewList[zoomCmp.idx];if(!o)return;
  loadIgnored();
  var isIgn=!!ignored[o.a.id+"|"+o.b.id],idx=zoomCmp.idx;
  closeZoom();
  ignorePair(isIgn?{dataset:{unign:idx}}:{dataset:{ign:idx}},!isIgn)}
function zoomDel(el){delItem(el,function(){closeZoom()})}
function closeZoom(){zoomCmp=null;zT++;zt={};var z=G("dupz");if(z&&!z.hidden){z.hidden=true;return true}return false}
function msg(t,bad){var m=G("dupm");m.textContent=t||"";m.className="pm"+(bad?" bad":"")}

/* ---------- Quét ảnh bằng DINOv3 (embedding + cosine), thay cho dHash 3 nhánh cũ ---------- */
var DS=(function(){var r=+window.DUP_DINO_RES;return(r>=112&&r<=224&&r%16===0)?r:224})();   /* DINOv3 patch 16: độ phân giải phải chia hết cho 16. 224 = mặc định; đặt window.DUP_DINO_RES=160 trước khi nạp dup.js để nhanh ~2x (cache tách riêng) */
var CACHE_KEY="dhc7"+(DS===224?"":"r"+DS);
function parseCache(raw){try{var o=JSON.parse(raw||"{}");return(o&&typeof o==="object")?o:{}}catch(e){return{}}}
function clearOldCaches(){
  ["dhc1","dhc2","dhc3","dhc4","dhc5","dhc6","dpm1","dpm2"].forEach(function(k){
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
  if(add||chg)SM.key="";   /* hash đổi: tính lại ngưỡng thông minh */
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
/* ===== DINOv3 (thay cho dHash 3 nhánh) =====
   Mỗi ảnh -> 1 vector 384 chiều (token CLS của DINOv3 ViT-S/16 (4 register token đứng sau CLS, không ảnh hưởng), int8 + base64), so bằng cosine.
   Chuỗi lưu: "E<L|P>:<vec>" hoặc "E<L|P>:<vec>:<vec cắt viền>" (ảnh chụp màn hình có viền đen/trắng thì nhúng thêm bản đã cắt viền).
   Chuỗi rỗng "" = ảnh trơn/ít chi tiết (bỏ qua); null = không đọc được ảnh.
   Mô hình chạy ngay trong máy bằng transformers.js (WASM, bản lượng tử hóa q8 nếu repo có, không thì fp32 ~90 MB), tải lần đầu từ CDN rồi được trình duyệt lưu lại. */
var DINO_LIB="https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.6",DINO_ID="onnx-community/dinov3-vits16-pretrain-lvd1689m-ONNX",DINO_LOCAL="models/",DINO_GPU=window.DUP_DINO_GPU!==false,FETCH_CONC=6;   /* giống v2: ưu tiên WebGPU, đặt window.DUP_DINO_GPU=false để ép WASM */
var DIM=384,DINO={p:null,m:null,T:null,err:null},dinoErr=null,DW={w:null,dev:"",seq:0,pend:{},q:[],busy:false,tm:0},BN=DS<=176?8:4;
/* Worker (nhúng bằng Blob, không cần file riêng): WebGPU fp16 nếu có, không thì WASM q8 (đa luồng khi crossOriginIsolated).
   Có kiểm tra thử 1 lần lúc khởi tạo; lỗi/NaN trên WebGPU tự lùi về WASM. Có thể tự host model tại ./models/onnx-community/dinov3-vits16-pretrain-lvd1689m-ONNX/ */
function dinoWorkerMain(){
  var L=null,M=null,T=null,dev="",dt="",C=null;
  function say(m,tr){self.postMessage(m,tr||[])}
  /* dtype: WebGPU thử fp16 rồi fp32 (fp32 nếu fp16 ra NaN); WASM thử q8 rồi fp32 (repo không có bản q8 thì vẫn chạy được) */
  function build(d,f32){
    var dts=d==="webgpu"?(f32?["fp32"]:["fp16","fp32"]):["q8","fp32"];
    function go(i){
      var o={device:d==="webgpu"?"webgpu":"wasm",dtype:dts[i]};
      o.progress_callback=function(p){if(p&&p.status==="initiate")say({t:"stage",s:"tải "+String(p.file||"").split("/").pop()});if(p&&p.status==="progress"&&/\.onnx(_data)?$/.test(p.file||""))say({t:"prog",p:Math.round(p.progress||0)})};
      return L.AutoModel.from_pretrained(C.id,o).then(function(m){M=m;dev=d;dt=dts[i];return m},function(e){if(i+1<dts.length)return go(i+1);throw e})}
    return go(0)}
  function infer(list){
    var n=list.length,S=C.S,sz=S*S,f=new Float32Array(n*3*sz),k,i,p,u,o;
    for(k=0;k<n;k++){u=new Uint8ClampedArray(list[k]);o=k*3*sz;
      for(i=0;i<sz;i++){p=i*4;f[o+i]=(u[p]/255-.485)/.229;f[o+sz+i]=(u[p+1]/255-.456)/.224;f[o+2*sz+i]=(u[p+2]/255-.406)/.225}}
    return M({pixel_values:new T("float32",f,[n,3,S,S])}).then(function(r){
      var h=r.last_hidden_state||r.pooler_output||r[Object.keys(r)[0]],dm=h.dims,D=dm[dm.length-1],tk=dm.length===3?dm[1]:1,d=h.data,out=[],v,j,bad=false;
      for(k=0;k<n;k++){v=new Float32Array(D);for(j=0;j<D;j++){v[j]=d[k*tk*D+j];if(v[j]!==v[j])bad=true}out.push(v)}
      if(bad)throw new Error("NaN");
      return out})}
  function safe(list){
    return infer(list).catch(function(e){
      if(dev!=="webgpu")throw e;
      var p=dt==="fp16"?build("webgpu",true).then(function(){return infer(list)}):Promise.reject(e);
      return p.catch(function(){return build("wasm").then(function(){return infer(list)})})})}
  function probe(c){
    if(!c.localBase)return Promise.resolve(false);
    return fetch(c.localBase+c.id+"/config.json").then(function(r){return r.ok?r.json().then(function(){return true},function(){return false}):false},function(){return false})}
  function gpuOk(c){
    if(!c.gpu||!self.navigator||!navigator.gpu)return Promise.resolve(false);
    return Promise.race([navigator.gpu.requestAdapter().then(function(a){return !!a},function(){return false}),new Promise(function(r){setTimeout(function(){r(false)},3000)})])}
  function init(c){
    C=c;say({t:"stage",s:"nạp thư viện"});
    return import(c.lib).then(function(x){
      L=x;T=x.Tensor;
      var w=x.env.backends&&x.env.backends.onnx&&x.env.backends.onnx.wasm;
      if(w)w.numThreads=self.crossOriginIsolated?Math.max(1,Math.min(4,self.navigator.hardwareConcurrency||2)):1;
      return probe(c)}).then(function(loc){
      L.env.allowLocalModels=!!loc;
      if(loc)L.env.localModelPath=c.localBase;
      say({t:"stage",s:"kiểm tra GPU"});return gpuOk(c)}).then(function(g){say({t:"stage",s:g?"WebGPU":"WASM"});
      return build(g?"webgpu":"wasm").catch(function(e){if(!g)throw e;return build("wasm")})}).then(function(){
      if(dev!=="webgpu")return;
      var z=[new Uint8ClampedArray(C.S*C.S*4).fill(127).buffer];
      return safe(z).then(function(){})})}
  self.onmessage=function(e){
    var m=e.data||{};
    if(m.t==="init")init(m.cfg).then(function(){say({t:"ready",dev:dev+(dt?"/"+dt:"")})},function(err){say({t:"initerr",msg:String(err&&err.message||err)})});
    else if(m.t==="run")safe(m.px).then(function(v){say({t:"res",id:m.id,v:v},v.map(function(x){return x.buffer}))},function(err){say({t:"err",id:m.id,msg:String(err&&err.message||err)})})}}
function failPend(e){var p=DW.pend;DW.pend={};Object.keys(p).forEach(function(k){p[k].bad(e)})}
function killWorker(){if(DW.w){try{DW.w.terminate()}catch(e){}DW.w=null}}
function onWorkerMsg(e){
  var m=e.data||{},p=DW.pend[m.id];
  if(!p)return;
  delete DW.pend[m.id];
  if(m.t==="res")p.ok(m.v);else p.bad(new Error(m.msg||"lỗi suy luận"))}
function onWorkerErr(e){failPend(new Error(e&&e.message||"worker lỗi"));killWorker();DINO.p=null;DINO.err="worker lỗi: "+(e&&e.message||"")}
function loadWorker(){
  return new Promise(function(ok,bad){
    var w,done=false,last="khởi động",wt=0;function wd(){clearTimeout(wt);wt=setTimeout(function(){if(done)return;done=true;try{w.terminate()}catch(_){}bad(new Error("worker không phản hồi 45s ở bước: "+last))},45000)}
    try{w=new Worker(URL.createObjectURL(new Blob(["("+dinoWorkerMain.toString()+")()"],{type:"text/javascript"})))}catch(e){bad(e);return}
    w.onmessage=function(e){
      var m=e.data||{};
      wd();if(m.t==="stage"){last=m.s;msg("Đang tải DINOv3… ("+m.s+")")}else if(m.t==="prog")msg("Đang tải DINOv3… "+m.p+"%");
      else if(m.t==="ready"){done=true;DW.w=w;DW.dev=m.dev;w.onmessage=onWorkerMsg;w.onerror=onWorkerErr;ok(w)}
      else if(m.t==="initerr"){done=true;try{w.terminate()}catch(_){}bad(new Error(m.msg))}};
    w.onerror=function(e){if(done)return;done=true;try{w.terminate()}catch(_){}bad(new Error(e&&e.message||"worker lỗi"))};
    wd();w.postMessage({t:"init",cfg:{lib:DINO_LIB,id:DINO_ID,S:DS,gpu:DINO_GPU,localBase:new URL(DINO_LOCAL,location.href).href}})})}
function loadMain(){
  msg("Đang tải DINOv3… (luồng chính)");
  return import(DINO_LIB).then(function(L){
    L.env.allowLocalModels=false;
    function go(dtype){return L.AutoModel.from_pretrained(DINO_ID,{dtype:dtype,device:"wasm",progress_callback:function(p){
      if(p&&p.status==="progress"&&/\.onnx(_data)?$/.test(p.file||""))msg("Đang tải DINOv3… "+Math.round(p.progress||0)+"%")}
    })}
    return go("q8").catch(function(){return go("fp32")}).then(function(m){DINO.m=m;DINO.T=L.Tensor;return m})})}
function dinoLoad(){
  if(DINO.p)return DINO.p;
  msg("Đang tải DINOv3 (lần đầu, vài chục MB)…");
  DINO.p=loadWorker().catch(function(we){var wm=String(we&&we.message||we);return loadMain().catch(function(me){throw new Error(String(me&&me.message||me)+" | worker: "+wm)})}).then(function(r){DINO.err=null;return r}).catch(function(e){DINO.p=null;DINO.m=null;killWorker();DINO.err=String(e&&e.message||e);throw e});
  return DINO.p}
function mainRun(list){
  return new Promise(function(ok){setTimeout(ok,0)}).then(function(){   /* nhường giao diện (chỉ dùng khi không có worker) */
    var n=list.length,S=DS,sz=S*S,f=new Float32Array(n*3*sz),k,i,p,u,o;
    for(k=0;k<n;k++){u=list[k];o=k*3*sz;
      for(i=0;i<sz;i++){p=i*4;f[o+i]=(u[p]/255-.485)/.229;f[o+sz+i]=(u[p+1]/255-.456)/.224;f[o+2*sz+i]=(u[p+2]/255-.406)/.225}}
    return DINO.m({pixel_values:new DINO.T("float32",f,[n,3,S,S])})}).then(function(r){
    var h=r.last_hidden_state||r.pooler_output||r[Object.keys(r)[0]],dm=h.dims,D=dm[dm.length-1],tk=dm.length===3?dm[1]:1,out=[],k;
    for(k=0;k<list.length;k++)out.push(Float32Array.from(h.data.subarray(k*tk*D,k*tk*D+D)));
    return out})}
function runBatch(list){
  if(DW.w)return new Promise(function(ok,bad){
    var id=++DW.seq,bufs=list.map(function(u){return u.buffer});
    DW.pend[id]={ok:ok,bad:bad};
    DW.w.postMessage({t:"run",id:id,px:bufs},bufs)});
  if(DINO.m)return mainRun(list);
  return dinoLoad().then(function(){return runBatch(list)})}
function spawnW(f){var a=[],i;for(i=0;i<FETCH_CONC;i++)a.push(f());return a}
function lumaStats(px,npx){
  var gray=new Float32Array(npx),i,sum=0,sum2=0,l;
  for(i=0;i<npx;i++){l=px[i*4]*.299+px[i*4+1]*.587+px[i*4+2]*.114;gray[i]=l;sum+=l;sum2+=l*l}
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

function encVec(d){
  if(!d||d.length<DIM)throw new Error("mô hình trả vector sai kích thước, cần "+DIM);
  var i,q=0,u=new Uint8Array(DIM),x;
  for(i=0;i<DIM;i++)q+=d[i]*d[i];
  if(!isFinite(q))throw new Error("vector lỗi");
  q=Math.sqrt(q)||1;
  var mx=0,sc;for(i=0;i<DIM;i++){x=Math.abs(d[i]);if(x>mx)mx=x}
  sc=mx>0?127/mx:0;   /* dùng hết dải int8, không bị cắt ở ±0.5 như khi nhân cố định 250; decVec chuẩn hoá lại nên không cần biết hệ số */
  for(i=0;i<DIM;i++){x=Math.round(d[i]*sc);u[i]=(x>127?127:x<-127?-127:x)&255}
  return btoa(String.fromCharCode.apply(null,u))}
function decVec(b64){
  var t,v=new Float32Array(DIM),i,x,q=0;
  try{t=atob(b64)}catch(e){return null}
  if(t.length!==DIM)return null;
  for(i=0;i<DIM;i++){x=t.charCodeAt(i);if(x>127)x-=256;v[i]=x/250;q+=v[i]*v[i]}
  q=Math.sqrt(q)||1;for(i=0;i<DIM;i++)v[i]/=q;
  return v}
function inferPx(px){
  return new Promise(function(ok,bad){DW.q.push({px:px,ok:ok,bad:bad});pump()}).then(encVec)}
function pump(){
  if(DW.busy||!DW.q.length)return;
  if(DW.q.length>=BN){flush();return}
  if(!DW.tm)DW.tm=setTimeout(flush,12)}
function flush(){
  if(DW.tm){clearTimeout(DW.tm);DW.tm=0}
  if(DW.busy||!DW.q.length)return;
  var b=DW.q.splice(0,BN);DW.busy=true;
  runBatch(b.map(function(x){return x.px})).then(function(vs){b.forEach(function(x,i){x.ok(vs[i])})},function(e){b.forEach(function(x){x.bad(e)})}).then(function(){DW.busy=false;pump()})}
function grab(cx,im,sx,sy,sw,sh){cx.clearRect(0,0,DS,DS);cx.drawImage(im,sx,sy,sw,sh,0,0,DS,DS);return cx.getImageData(0,0,DS,DS).data}
/* Trả về Promise<chuỗi>: "" nếu ảnh trơn; ném lỗi nếu ảnh hỏng/mô hình lỗi */
function embedImg(im){
  var iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;
  if(!iw||!ih)return Promise.reject(new Error("ảnh rỗng"));
  var ori=iw>=ih?"L":"P",gw=ori==="L"?144:108,gh=ori==="L"?104:144,cv=document.createElement("canvas"),cx;
  cv.width=gw;cv.height=gh;cx=cv.getContext("2d",{willReadFrequently:true});
  cx.drawImage(im,0,0,gw,gh);
  var st=lumaStats(cx.getImageData(0,0,gw,gh).data,gw*gh);
  if(st.v<12)return Promise.resolve("");   /* ảnh trắng trơn / đen đặc */
  var bar=detectBars(st.gray,gw,gh,ori,iw,ih);
  cv.width=DS;cv.height=DS;
  var pf=grab(cx,im,0,0,iw,ih),pb=null;
  if(bar){pb=grab(cx,im,bar.sx,bar.sy,bar.sw,bar.sh);if(lumaStats(pb,DS*DS).v<16)pb=null}
  return Promise.all([inferPx(pf),pb?inferPx(pb):null]).then(function(r){var out="E"+ori+":"+r[0];return r[1]?out+":"+r[1]:out})}
function hashOf(s){
  if(cache[s]!==undefined)return Promise.resolve(cache[s]);
  if(inflight[s])return inflight[s];
  var p=new Promise(function(res){
    var u0=imgSrc(s,256),isLh=u0.indexOf("https://lh3.googleusercontent.com/")===0;
    var tries=isLh?[u0+"?dh=3",imgSrc(s,320)+"?dh=4",imgSrc(s,300)]:[u0];
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
        embedImg(im).then(function(h){dropIm();fin(h)},function(e){dropIm();if(e&&e.message==="ảnh rỗng")setTimeout(next,400);else fin(null)})};
      im.onerror=fail;
      im.src=u}
    next()});
  inflight[s]=p;return p}
function parseSig(raw){
  if(!raw||typeof raw!=="string")return null;
  var p=raw.split(":");
  if(!/^E[LP]$/.test(p[0])||!p[1])return null;
  var v=decVec(p[1]);if(!v)return null;
  var t=p[2]?decVec(p[2]):null;
  return{ori:p[0].charAt(1),v:v,t:t}}
function dotV(a,b){var s0=0,s1=0,s2=0,s3=0,i;for(i=0;i<DIM;i+=4){s0+=a[i]*b[i];s1+=a[i+1]*b[i+1];s2+=a[i+2]*b[i+2];s3+=a[i+3]*b[i+3]}return s0+s1+s2+s3}
/* th: ngưỡng cosine theo %. Trả về {d,k,o,n}: n = độ giống %, d = 100-n (giữ tên trường cũ cho phần hiển thị/lưu trữ) */
/* 4 mức độ nhạy: 87 Ít nhầm · 80 Bình thường (mặc định) · 77 Nhạy · 73 Rất nhạy. Giá trị cũ đã lưu (kể cả 81, 92/88/85/82) được đổi sang mức gần nhất. */
function thNorm(t){t=+t||0;return t>=86?87:t>=79?80:t>=75?77:t>0?73:80}
/* ===== Ngưỡng mạnh / yếu (không tự nâng) =====
   Ngưỡng mạnh ts = mức độ nhạy bạn chọn (mặc định 80%). Ngưỡng yếu tl = ts - 4 (tối thiểu 60).
   Cặp ảnh yếu (tl ≤ giống < ts) chỉ được giữ nếu cùng cặp căn đã có ≥1 cặp đạt ngưỡng mạnh và tổng ≥2 cặp ảnh, hoặc tổng ≥3 cặp ảnh. */
var SM={ts:80,tl:76,cal:0,np:0,lv:0,key:"",kept:0,cut:0};
function smartCalc(){SM.ts=TH;SM.tl=Math.max(60,TH-4);SM.cal=0;SM.np=0;SM.lv=0;return SM}
function smartFilter(list){
  var g={},out=[],ts=SM.ts;
  list.forEach(function(r){
    var k=r.a.id<r.b.id?r.a.id+"|"+r.b.id:r.b.id+"|"+r.a.id,o=g[k]||(g[k]={s:0,w:0,r:[]});
    o.r.push(r);if(r.n>=ts)o.s++;else o.w++});
  Object.keys(g).forEach(function(k){
    var o=g[k],ok=(o.s>=1&&o.s+o.w>=2)||o.s+o.w>=3;
    o.r.forEach(function(r){
      if(r.n>=ts)out.push(r);
      else if(ok){out.push(r);SM.kept++}
      else SM.cut++})});
  out.rej=0;return out}
function cmpSig(a,b,th){
  if(!a||!b)return null;
  var m=dotV(a.v,b.v),x;
  if(a.t){x=dotV(a.t,b.v);if(x>m)m=x}
  if(b.t){x=dotV(a.v,b.t);if(x>m)m=x}
  var n=Math.min(100,Math.round(m*100));
  return n>=th?{d:100-n,k:"",o:"",n:n}:null}
/* Không còn bước kiểm tra lần hai theo điểm ảnh (DINOv3 đã so theo nội dung); giữ hàm rỗng để các chỗ gọi không phải đổi */
function verifyList(list){return Promise.resolve(smartFilter(list))}
/* ===== So khớp ảnh theo từng lượt BATCH căn, lưu kết quả để lần sau chỉ so ảnh mới ===== */
var BATCH=20,FAIL_TTL=300000,PM_KEY="dpm3"+(DS===224?"":"r"+DS),pm=null,pmLoaded=false,pmP=null,sigMemo={};
function sigOf(s){var v=sigMemo[s];if(v!==undefined)return v;var c=cache[s];v=c?parseSig(c):null;if(c!==undefined)sigMemo[s]=v;return v}
function pmEmpty(){return{th:TH,vf:VL,cal:smartCalc().cal,done:{},pairs:[],seen:{},fail:{}}}
function pmStale(){return pm.th!==TH||(pm.vf||0)!==VL||(pm.cal||0)!==smartCalc().cal}
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
/* ảnh lỗi: thử lại sau 5 phút (lần 2), 1 giờ (lần 3), 24 giờ (từ lần 4) — tránh mỗi lần mở lại chờ ảnh đã bị xóa */
function isFailCool(f,now){return !!(f&&typeof f==="object"&&f.n>=2&&(now-f.t)<(f.n>=4?864e5:f.n>=3?36e5:FAIL_TTL))}
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
  smartCalc();var allJ=oldJ.concat(newJ),A=allJ.map(function(x){return sigOf(x.s)}),out=[],seen={},p=oldJ.length;
  function step(){
    var end=Math.min(p+25,allJ.length),j,m,k,a,b;
    for(;p<end;p++){
      b=allJ[p];
      for(j=0;j<p;j++){
        a=allJ[j];
        if(a.it.id===b.it.id)continue;
        if(a.s===b.s)m={d:0,n:100,k:"",o:(A[j]||A[p])?(A[j]||A[p]).ori:""};
        else if(A[j]&&A[p])m=cmpSig(A[j],A[p],SM.tl);else continue;
        if(m){k=a.it.id+"|"+b.it.id+"|"+a.s+"|"+b.s;if(!seen[k]){seen[k]=1;out.push({a:a.it,b:b.it,x:a.s,y:b.s,d:m.d,k:m.k,o:m.o||"",n:m.n})}}
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
      if(n>=2)msg("Chưa so khớp ảnh.");
      return}
    pairsFromPm();
    render();var np=pendingItems().length;
    msg(imgPairs.length+" cặp ảnh giống"+(np?" · "+np+" căn chưa so":""))})}
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
    render();var np=pendingItems().length;
    msg(imgPairs.length+" cặp ảnh giống"+(np?" · "+np+" căn chưa so":""))})}
function scan(auto){
  if(scanning)return;
  var cnt=0;activeItems().forEach(function(it){(it.im||[]).forEach(function(s){if(s)cnt++})});
  if(cnt<2){msg("Chưa đủ ảnh để so.");return}
  scanning=true;stopFlag=false;G("dupimg").disabled=true;G("dupstop").hidden=false;G("dupbar").hidden=false;
  var bar=G("dupbar").firstChild,badSet={},t={ok:0,bad:0,flat:0,nL:0,nP:0,newPairs:0,căn:0};
  function end(){
    savePm();saveCache();hsPushSoon();
    scanning=false;G("dupimg").disabled=false;G("dupstop").hidden=true;G("dupbar").hidden=true;
    pairsFromPm();
    render();
    var extra=[],np=pendingItems().length,pendTxt=np&&!stopFlag?" · còn "+np+" căn chưa so":"";
    if(t.bad)extra.push(t.bad+" ảnh không đọc được");
    if(t.flat)extra.push(t.flat+" ảnh trơn ít chi tiết");
    var exTxt=extra.length?" ("+extra.join(" · ")+")":"";
    if(dinoErr){msg("Không tải được DINOv3 (cần mạng lần đầu): "+String(dinoErr&&dinoErr.message||dinoErr),1);dinoErr=null}
    else if(stopFlag)msg("Đã dừng · so "+t["căn"]+" căn · "+imgPairs.length+" cặp ảnh giống");
    else if(t.bad&&t.ok===0)msg("Hầu hết ảnh không đọc được.",1);
    else if(!t["căn"])msg("Không có căn mới · "+imgPairs.length+" cặp ảnh giống"+pendTxt);
    else msg("Đã so "+t["căn"]+" căn mới · "+imgPairs.length+" cặp ảnh giống"+exTxt+pendTxt);
    if(hsPendR){var pr=hsPendR;hsPendR=null;hsRefresh(pr)}}
  function batch(total){
    if(stopFlag)return Promise.resolve(false);
    var pend=pendingItems(badSet);
    if(!pend.length)return Promise.resolve(false);
    var B=pend.slice(0,BATCH),newJ=[],urls=[],seenU={},Bid={},now=Date.now();
    B.forEach(function(it){Bid[it.id]=1;(it.im||[]).forEach(function(s){if(!s)return;newJ.push({it:it,s:s});if(!pm.done[s]&&!badSet[s]&&!isFailCool(pm.fail&&pm.fail[s],now)&&!seenU[s]){seenU[s]=1;urls.push(s)}})});
    var idx=0,got={},flat={},dn=0;
    function worker(){
      if(stopFlag||idx>=urls.length)return Promise.resolve();
      var u=urls[idx++];
      return hashOf(u).then(function(h){
        if(h){var sg=sigOf(u)||parseSig(h);if(sg){got[u]=1;t.ok++;if(sg.ori==="L")t.nL++;else t.nP++}}
        else if(h===null){badSet[u]=1;t.bad++;pm.fail=pm.fail||{};var cf=pm.fail[u];pm.fail[u]={n:(cf&&typeof cf==="object"?cf.n:0)+1,t:Date.now()}}
        else{flat[u]=1;t.flat++}
        dn++;msg("Đang so ảnh · "+t["căn"]+"/"+total+" căn · ảnh "+dn+"/"+urls.length+" · "+window.Dup.dino());bar.style.width=Math.min(100,(t["căn"]+B.length*dn/Math.max(1,urls.length))/total*100)+"%"
      }).then(worker)}
    return Promise.all(spawnW(worker)).then(function(){
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
        pm.th=TH;pm.vf=VL;pm.cal=SM.cal;t.newPairs+=out.length;t["căn"]+=B.length;
        savePm();
        bar.style.width=Math.min(100,t["căn"]/total*100)+"%";
        return true})})}
  function run(total){return batch(total).then(function(more){if(more&&!stopFlag)return run(total)})}
  if(hsPhase)msg("Đang đồng bộ hash…");
  Promise.all([loadCache(),loadPm(),hsWait()]).then(function(){
    SM.key="";if(hsPendR){if(hsPendR.chg){pm=pmEmpty();savePm()}hsPendR=null}   // hash vừa đổi theo máy chủ: quét lại từ hash mới
    if(pmStale()){pm=pmEmpty();savePm()}
    if(!auto)pm.fail={};
    var total=pendingItems().length;
    if(!total){return}
    return dinoLoad().then(function(){msg("Đang so ảnh 0/"+total+" căn…");return run(total)},function(e){dinoErr=e||new Error("lỗi không rõ")})
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
  G("dupzign").onclick=zoomIgnore;
  G("dupzdel1").onclick=function(){zoomDel(this)};
  G("dupzdel2").onclick=function(){zoomDel(this)};
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
  G("dupsens").onchange=function(){TH=thNorm(+this.value);try{ls("dsim",String(TH))}catch(e){}rescanFromCache()};
  G("dupimgv").onchange=function(){
    var v=this.value;
    imgAutoMode=(v==="both"||v==="stack")?v:"manual";
    try{ls("dimgv",imgAutoMode)}catch(e){}
    openImgSet={};pairImgMode={};render();
  };
  G("dupnoout").onchange=function(){skipOut=this.checked;try{ls("dnoout",skipOut?"1":"0")}catch(e){}limMain=LIMIT;if(imgPairs!==null)rescanFromCache();else{render();applyCachedPairs()}};
  G("duprst").onclick=function(){
    TH=80;imgAutoMode="manual";zlay=null;
    try{ls("dsim","");ls("dimgv","");ls("dzl","")}catch(e){}
    G("dupsens").value="80";G("dupimgv").value="manual";
    openImgSet={};pairImgMode={};SM.key="";
    if(imgPairs!==null)rescanFromCache();else{render();msg("Đã đặt lại cài đặt.")}};
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
  G("dupimgv").value=imgAutoMode;
  G("dupnoout").checked=skipOut;
  items=N().items();cleanImgPairs();limMain=limIgn=LIMIT;openSet={};openImgSet={};pairImgMode={};pairImgMsg={};cmpAll={};zoomCmp=null;showIgn=false;msg(imgPairs&&imgPairs.length?imgPairs.length+" cặp ảnh giống":"");G("dupbar").hidden=true;G("dupstop").hidden=true;G("dupz").hidden=true;render();
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
    loadIgnored();
    if(items.length){   /* danh sách rỗng/chưa nạp thì không dọn; chỉ ẩn trên máy, máy chủ tự xóa cặp khi xóa căn (như pullIgnored) */
      var byId={},chg=false;items.forEach(function(it){byId[it.id]=1});
      Object.keys(ignored).forEach(function(k){var ids=k.split("|");if(!byId[ids[0]]||!byId[ids[1]]){delete ignored[k];delete ignDirty[k];chg=true}});
      if(chg)ignWriteLs()}
    render();
    if(cacheLoaded&&!scanning)autoScan()
  },120)}

window.Dup={ignStat:function(){return ignStat()},smart:function(){loadImgMode();var s=smartCalc();return{th:TH,ts:s.ts,tl:s.tl,np:s.np,lv:s.lv,cal:s.cal,kept:s.kept,cut:s.cut}},keys:function(){return{h:CACHE_KEY,p:PM_KEY}},cached:function(){return cacheLoaded?Object.keys(cache).length:-1},dino:function(){
    if(DW.w)return"worker/"+DW.dev+" x"+BN+" res"+DS;
    if(DINO.m)return"main/wasm x"+BN+" res"+DS;
    if(DINO.p)return"đang tải";
    if(DINO.err)return"lỗi: "+DINO.err;
    return"chưa tải (chưa cần)"},dinoLoad:function(){return dinoLoad().then(function(){return window.Dup.dino()},function(e){return"lỗi: "+(e&&e.message||e)})},pull:function(f){var p=pullIgnored(f);if(f)hsPull();return p},init:init,open:open,close:close,sync:sync,closeZoom:closeZoom};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){init()});
else init();
})();
