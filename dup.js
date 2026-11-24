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
var CSS=".dphdr{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:3px 0 12px}\n.dphdr h1{margin:0;min-width:0;font-size:clamp(19px,5.5vw,26px)}\n.dphdr+.sub{color:var(--mute);font-size:var(--fs-s);margin:-6px 0 12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n@media (max-height:820px){.dphdr+.sub{display:none}}\n.dpbtn{flex:none;display:inline-flex;align-items:center;min-height:34px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:var(--fs-s);font-weight:700;cursor:pointer;white-space:nowrap;transition:transform .1s ease,background-color .15s ease,border-color .15s ease,color .15s ease,box-shadow .15s ease}\n.dpbtn:active{transform:scale(.96)}\n#dupl,#dupignl,.dpc,.dprow{min-width:0}\n#dupmain[hidden],#dupignview[hidden],.dpbar2[hidden],.dpignbar[hidden],.dpdet[hidden],.dpimgs[hidden],.dpz[hidden],.dpzctrl[hidden],.dpzstage img[hidden],.dpzempty[hidden]{display:none}\n.dpc{border:1px solid var(--line);border-left:4px solid var(--mute);border-radius:12px;padding:6px 12px 10px;margin-top:8px;background:var(--surface)}\n.dpc.im{border-left-color:var(--danger)}\n.dpc.pu{border-left-color:#7c3aed}\n.dpc.gr{border-left-color:#9ca3af}\n.dprow{display:flex;align-items:center;gap:6px}\n.dprow+.dprow{border-top:1px dashed var(--line)}\n.dpr{display:flex;gap:8px;align-items:center;justify-content:space-between;flex:1;min-width:0;padding:8px 0}\n.dpt{min-width:0;flex:1;overflow:hidden}.dpt b{display:block;font-size:var(--fs-b);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpt small{display:block;color:var(--mute);font-size:var(--fs-s);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpedit,.dpdel{flex:none;border:1px solid var(--line);background:var(--bg);border-radius:8px;padding:4px 9px;min-height:30px;font-size:var(--fs-s);font-weight:600;cursor:pointer;white-space:nowrap}\n.dpedit{color:var(--accent)}\n.dpdel{color:var(--danger)}\n.dpdel:disabled{opacity:.5;cursor:default}\n.dpw{display:flex;flex-wrap:wrap;gap:4px;margin-top:2px}\n.dpw span{font-size:var(--fs-s);font-weight:600;padding:2px 9px;border-radius:999px;background:var(--bg);border:1px solid var(--line);color:var(--ink)}\n.dpw span.im{background:var(--danger);border-color:var(--danger);color:#fff}\n.dpn[data-tog],.dpw[data-tog]{cursor:pointer}\n.dpm{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;margin-top:8px}\n.dpm div{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:2px;cursor:zoom-in;min-width:0}\n.dpm img{width:100%;height:64px;object-fit:cover;border-radius:6px;background:var(--line);display:block}\n.dpbar2{display:flex;flex-wrap:wrap;align-items:center;gap:8px}\n.dpignbtn{border:1px solid var(--s-contact);background:var(--b-contact);color:var(--s-contact);border-radius:999px;padding:4px 12px;min-height:32px;font-size:var(--fs-s);font-weight:700;cursor:pointer}\n.dphead{display:flex;align-items:center;gap:10px;flex-wrap:wrap}\n.dphead h2{margin:0}\n.dphead .btn{min-height:34px;padding:5px 10px}\n.dpsens{display:flex;align-items:center;gap:8px;flex-wrap:wrap}\n.dpsens label{margin:0;white-space:nowrap}\n.dpsens select{width:auto;flex:1;min-width:180px;min-height:36px;padding:4px 8px;font-size:var(--fs-s)}\n.dpopt{display:inline-flex;align-items:center;gap:6px;font-size:var(--fs-s);font-weight:600;color:var(--ink);cursor:pointer;margin:0}\n.dpopt input{width:auto;min-height:0;accent-color:var(--accent)}\n.dpb{height:6px;border-radius:3px;background:var(--line);overflow:hidden}\n.dpb i{display:block;height:100%;width:0;background:var(--accent);transition:width .35s cubic-bezier(.16,1,.3,1)}\n.dpc.im .dpn{color:var(--danger)}\n.dpc.pu .dpn{color:#7c3aed}\n.dpn{font-size:var(--fs-s);font-weight:700;color:var(--ink);margin:6px 0 0}\n.dpa{margin-top:8px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}\n.dpno{border:1px solid var(--s-contact);background:var(--b-contact);color:var(--s-contact);border-radius:999px;padding:4px 11px;min-height:30px;font-size:var(--fs-s);font-weight:700;cursor:pointer}\n.dpno.undo{color:var(--ink);border-color:var(--line);background:var(--bg)}\n.dpchk{border:1px solid var(--s-seen);background:var(--b-seen);color:var(--s-seen);border-radius:999px;padding:4px 11px;min-height:30px;font-size:var(--fs-s);font-weight:700;cursor:pointer}\n.dpchk:disabled{opacity:.6;cursor:default}\n.dpimgbtn{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:999px;padding:4px 11px;min-height:30px;font-size:var(--fs-s);font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:4px}\n.dpimgbtn[aria-expanded=\"true\"]{background:var(--s-new);border-color:var(--s-new);color:var(--surface)}\n.dpimgbtn:disabled{opacity:.55;cursor:default}\n.dpv{font-size:var(--fs-s);font-weight:600;margin-left:auto}\n.dpst{margin:6px 0 0;font-size:var(--fs-s);color:var(--mute)}\n.dpst.ok{color:var(--s-won);font-weight:700}\n.dpst.bad{color:var(--danger);font-weight:700}\n.dpdet,.dpimgs{margin-top:8px;padding-top:8px;border-top:1px dashed var(--line)}\n.dpimgbar{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px}\n.dpimgbar b{font-size:var(--fs-s);color:var(--ink)}\n.dpimgbar select{width:auto;min-width:165px;min-height:32px;padding:3px 8px;font-size:var(--fs-s);border-radius:8px}\n.dpcmps{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;align-items:stretch}\n.dpcmps.stack,.dpcmps.single{grid-template-columns:minmax(0,1fr)}\n.dpcmp{border:1px solid var(--line);border-radius:10px;padding:7px;background:var(--bg);min-width:0;display:flex;flex-direction:column}\n.dpcmph{display:flex;align-items:baseline;justify-content:space-between;gap:6px;margin-bottom:4px;min-width:0}\n.dpcmph b{font-size:var(--fs-s);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}\n.dpcmph span{flex:none;font-size:11px;font-weight:700;color:var(--mute)}\n.dpcmpm{font-size:11px;color:var(--mute);margin:0 0 6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-height:15px}\n.dpthumbs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px}\n.dpcmps.stack .dpthumbs,.dpcmps.single .dpthumbs{grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:6px}\n@media (min-width:600px){.dpcmps.both .dpthumbs{grid-template-columns:repeat(3,minmax(0,1fr))}}\n.dpth{position:relative;display:block;width:100%;min-width:0;min-height:0;border:1px solid var(--line);border-radius:7px;overflow:hidden;padding:0;background:var(--surface);cursor:zoom-in;aspect-ratio:4/3}\n.dpth.hit{border:2px solid var(--danger)}\n.dpth img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;background:var(--line)}\n.dpth i{position:absolute;left:3px;top:3px;font-style:normal;font-size:10px;font-weight:700;padding:1px 5px;border-radius:999px;background:var(--danger);color:#fff;line-height:1.3;pointer-events:none;z-index:1}\n.dpth u{position:absolute;right:3px;bottom:3px;text-decoration:none;font-size:10px;font-weight:700;padding:1px 5px;border-radius:6px;background:rgba(0,0,0,.62);color:#fff;line-height:1.3;pointer-events:none;z-index:1}\n.dpmess{font-size:var(--fs-s);color:var(--mute);font-style:italic;margin:8px 0 4px;text-align:center}\n.dpfs{display:grid;gap:6px}\n.dpf{border:1px solid var(--line);border-radius:8px;padding:6px 8px;background:var(--bg)}\n.dpf.hit{border-color:var(--mute);background:var(--surface)}\n.dpfl{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:4px}\n.dpfl b{font-size:var(--fs-s)}\n.dptag{font-size:11px;font-weight:700;padding:1px 7px;border-radius:999px;background:var(--s-new);color:var(--surface)}\n.dpfc{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:var(--fs-s)}\n.dpfc small{display:block;color:var(--mute);font-size:11px}\n.dpfc span{display:block;overflow-wrap:anywhere;word-break:break-word}\n.dpfc a{color:var(--s-seen);text-decoration:underline;overflow-wrap:anywhere;word-break:break-all}\n.dpe{color:var(--mute);font-style:italic}\n.dpi{margin-top:8px}\n.dpil{margin:0 0 6px;font-size:var(--fs-s);font-weight:700;color:var(--danger)}\n.dpig{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px}\n.dpip{border:1px solid var(--line);border-radius:8px;padding:4px;background:var(--bg);cursor:zoom-in;text-align:center;font:inherit;color:inherit}\n.dpip span{display:grid;grid-template-columns:1fr 1fr;gap:2px}\n.dpip img{width:100%;height:72px;object-fit:cover;border-radius:5px;background:var(--line);display:block}\n.dpip small{display:block;margin-top:3px;font-size:11px;color:var(--mute)}\n.dpz{position:fixed;inset:0;z-index:20;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;padding:calc(12px + env(safe-area-inset-top,0px)) 12px calc(12px + env(safe-area-inset-bottom,0px));overscroll-behavior:contain}\n.dpzb{background:var(--surface);color:var(--ink);border-radius:12px;padding:12px;width:min(760px,100%);max-height:calc(100dvh - 24px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}\n.dpzhdr{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}\n.dpzt{margin:0;font-weight:700;font-size:var(--fs-b);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpzlay,.dpzcls{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:8px;padding:4px 10px;min-height:32px;font-size:var(--fs-s);font-weight:600;cursor:pointer;white-space:nowrap;flex:none}\n.dpzcls{min-width:32px;padding:4px 8px;font-size:16px;line-height:1}\n.dpzg{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;align-items:stretch}\n.dpzg.stack{grid-template-columns:minmax(0,1fr)}\n.dpzcol{min-width:0;display:flex;flex-direction:column;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:8px}\n.dpzstage{position:relative;width:100%;height:clamp(210px,44dvh,420px);border-radius:8px;background:var(--surface);border:1px solid var(--line);overflow:hidden;display:flex;align-items:center;justify-content:center}\n.dpzg.stack .dpzstage{height:clamp(180px,33dvh,320px)}\n.dpzstage img{position:absolute;inset:0;width:100%;height:100%;padding:4px;object-fit:contain;display:block;cursor:pointer}\n.dpzempty{font-size:var(--fs-s);color:var(--mute);font-style:italic;padding:8px;text-align:center}\n.dpzmeta{margin-top:6px;text-align:center;min-width:0}\n.dpzmeta b{display:block;font-size:var(--fs-s);color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.35}\n.dpzmeta small{display:block;margin-top:1px;font-size:11px;color:var(--mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.35;min-height:15px}\n.dpzctrl{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:6px;min-height:32px}\n.dpzctrl.ghost{visibility:hidden;pointer-events:none}\n.dpzctrl button{border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:8px;min-width:38px;min-height:32px;padding:2px 10px;font-size:16px;font-weight:700;cursor:pointer}\n.dpzctrl button:disabled{opacity:.4;cursor:default}\n.dpzctrl span{font-size:var(--fs-s);font-weight:700;color:var(--ink);min-width:46px;text-align:center}\n.dpundo{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:30;display:flex;align-items:center;gap:8px;max-width:calc(100vw - 24px);background:var(--ink);color:var(--surface);border-radius:12px;padding:8px 8px 8px 14px;box-shadow:0 6px 20px rgba(0,0,0,.3);font-size:var(--fs-s)}\n.dpundo[hidden]{display:none}\n.dpundo span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpundo button{border:0;border-radius:8px;min-height:32px;padding:4px 12px;font-size:var(--fs-s);font-weight:700;cursor:pointer;background:var(--surface);color:var(--ink);white-space:nowrap}\n.dpundo button.x{background:transparent;color:inherit;padding:4px 8px}\n";
var CSS2=[
"@keyframes dpin{from{opacity:0}to{opacity:1}}",
"@keyframes dpfade{from{opacity:0}to{opacity:1}}",
"@keyframes dpcardin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}",
"@keyframes dpfwd{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:none}}",
"@keyframes dpback{from{opacity:0;transform:translateX(-28px)}to{opacity:1;transform:none}}",
"@keyframes dpzin{from{opacity:0;transform:translateY(28px) scale(.97)}to{opacity:1;transform:none}}",
"@keyframes dpopen{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:none}}",
"@keyframes dpnext{from{opacity:.35;transform:translateX(28px)}to{opacity:1;transform:none}}",
"@keyframes dpprev{from{opacity:.35;transform:translateX(-28px)}to{opacity:1;transform:none}}",
"@keyframes dpslide{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}",
"@keyframes dpup{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}",
"@keyframes dpspin{to{transform:rotate(360deg)}}",
"@keyframes dppulse{0%,100%{box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 34%,transparent),0 3px 10px color-mix(in srgb,var(--accent) 22%,transparent)}50%{box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 18%,transparent),0 4px 14px color-mix(in srgb,var(--accent) 32%,transparent)}}",
".dpc{content-visibility:auto;contain-intrinsic-size:auto 230px;transition:border-color .15s ease,box-shadow .15s ease}",
"#dupl.enter>.dpc:nth-child(-n+6){animation:dpcardin .22s cubic-bezier(.16,1,.3,1) both}",
"#dupl.enter>.dpc:nth-child(2){animation-delay:22ms}#dupl.enter>.dpc:nth-child(3){animation-delay:44ms}#dupl.enter>.dpc:nth-child(4){animation-delay:66ms}#dupl.enter>.dpc:nth-child(5){animation-delay:88ms}#dupl.enter>.dpc:nth-child(6){animation-delay:110ms}",
"#dupmain.dp-back{animation:dpback .22s cubic-bezier(.16,1,.3,1) both}",
"#dupignview.dp-fwd{animation:dpfwd .24s cubic-bezier(.16,1,.3,1) both}",
".dpl{animation:dpin .25s ease-out both}",
".dpl0{animation:none}",
".dpth{transition:transform .1s ease,border-color .15s ease,box-shadow .15s ease;touch-action:manipulation}",
".dpth:active{transform:scale(.96)}",
".dpth.hit{box-shadow:0 0 0 1px var(--danger)}",
".dpm div{border-radius:7px;transition:transform .1s ease,box-shadow .15s ease,filter .15s ease;touch-action:manipulation}",
".dpm div:active{transform:scale(.96)}",
".dpip{transition:transform .1s ease,border-color .15s ease,box-shadow .15s ease,background-color .15s ease;touch-action:manipulation}",
".dpip:active{transform:scale(.96)}",
".dpn[data-tog],.dpw[data-tog]{transition:opacity .15s ease,transform .1s ease;touch-action:manipulation}",
".dpn[data-tog]:active,.dpw[data-tog]:active{opacity:.76;transform:scale(.98)}",
".dpw[data-tog] span{transition:border-color .15s ease,background-color .15s ease,transform .1s ease}",
".dpmore{grid-column:1/-1;border:1px dashed var(--line);background:var(--surface);color:var(--mute);border-radius:8px;min-height:34px;font-size:var(--fs-s);font-weight:700;cursor:pointer;transition:transform .1s ease,color .15s ease,border-color .15s ease,background-color .15s ease;touch-action:manipulation}",
".dpmore:active{transform:scale(.97)}",
"@media (hover:hover){.dpbtn:hover{border-color:var(--accent);color:var(--accent)}.dpc:hover{box-shadow:0 2px 10px rgba(0,0,0,.08)}.dpedit:hover{background:var(--accent);border-color:var(--accent);color:var(--accent-ink);box-shadow:0 2px 8px rgba(0,0,0,.14);box-shadow:0 2px 8px color-mix(in srgb,var(--accent) 26%,transparent)}.dpdel:hover:not(:disabled){background:var(--danger);border-color:var(--danger);color:#fff;box-shadow:0 2px 8px rgba(220,38,38,.25)}.dpignbtn:hover,.dpno:hover,.dpchk:hover:not(:disabled),.dpimgbtn:hover:not(:disabled){filter:brightness(.95);box-shadow:0 2px 8px rgba(0,0,0,.12)}.dpmore:hover{color:var(--ink);border-color:var(--accent);background:var(--bg)}.dpth:hover{border-color:var(--accent);box-shadow:0 2px 10px rgba(0,0,0,.14)}.dpm div:hover{box-shadow:0 2px 10px rgba(0,0,0,.16)}.dpip:hover{border-color:var(--accent);box-shadow:0 2px 10px rgba(0,0,0,.14)}.dpw[data-tog]:hover span:not(.im){border-color:var(--accent)}#dupd .btn:not(:disabled):hover{filter:brightness(1.06)}#dupd .btn.p:not(:disabled):hover{box-shadow:0 3px 10px rgba(0,0,0,.18);box-shadow:0 3px 10px color-mix(in srgb,var(--accent) 32%,transparent)}#dupd .link:hover{opacity:.85;text-decoration:underline}.dpcfg>summary:hover{border-color:var(--accent);background:var(--b-new);background:color-mix(in srgb,var(--accent) 18%,var(--bg));box-shadow:0 3px 10px rgba(0,0,0,.14);box-shadow:0 3px 10px color-mix(in srgb,var(--accent) 20%,transparent)}.dpzlay:hover,.dpzcls:hover,.dpzctrl button:not(:disabled):hover,.dpzj:hover,.dpundo button:hover{filter:brightness(.94)}}",
"#dupd .btn,#dupd .link,.dpignbtn,.dpno,.dpchk,.dpimgbtn,.dpedit,.dpdel,.dpzlay,.dpzcls,.dpzctrl button,.dpundo button,.dpopt{transition:transform .1s ease,filter .15s ease,background-color .15s ease,border-color .15s ease,color .15s ease,box-shadow .15s ease,opacity .15s ease;touch-action:manipulation}",
"#dupd .btn.p{box-shadow:0 2px 8px rgba(0,0,0,.14);box-shadow:0 2px 8px color-mix(in srgb,var(--accent) 24%,transparent)}",
"#dupd .btn:not(:disabled):active,.dpignbtn:active,.dpno:active,.dpchk:not(:disabled):active,.dpimgbtn:not(:disabled):active,.dpedit:active,.dpdel:not(:disabled):active,.dpzlay:active,.dpzcls:active,.dpzctrl button:not(:disabled):active,.dpundo button:active{transform:scale(.96)}",
"#dupd .link:active,.dpopt:active{transform:scale(.97);opacity:.78}",
"#dupd button:focus-visible,#dupd summary:focus-visible,#dupd select:focus-visible,#dupd input:focus-visible,.dpbtn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}",
".dpset select,.dpset input[type=\"number\"]{transition:border-color .15s ease,box-shadow .15s ease,background-color .15s ease}",
".dpset select:focus,.dpset input[type=\"number\"]:focus{border-color:var(--accent);box-shadow:0 0 0 2px rgba(0,0,0,.12);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 22%,transparent)}",
".dpimgact{display:flex;align-items:center;gap:6px;flex-wrap:wrap}",
".dpimgs.dpopen{animation:dpslide .2s cubic-bezier(.16,1,.3,1)}",
".dpz:not([hidden]){animation:dpfade .18s ease}",
".dpz:not([hidden]) .dpzb{animation:dpzin .22s cubic-bezier(.16,1,.3,1)}",
".dpzm{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 0 8px;padding-bottom:2px}",
".dpzm::-webkit-scrollbar{display:none}",
".dpzm[hidden]{display:none}",
".dpzj{flex:none;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:999px;padding:3px 11px;min-height:30px;font-size:var(--fs-s);font-weight:700;cursor:pointer;transition:transform .1s ease,background-color .15s ease,border-color .15s ease,color .15s ease}",
".dpzj:active{transform:scale(.96)}",
".dpzj.cur{background:var(--danger);border-color:var(--danger);color:#fff}",
".dpzcol{transition:border-color .15s ease}",
".dpzcol.act{border-color:var(--accent)}",
".dpzstage{touch-action:pan-y;-webkit-user-select:none;user-select:none}",
".dpzstage img{transition:opacity .22s ease}",
".dpzstage.busy img{opacity:.55}",
".dpzstage::after{content:'';position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;border:3px solid var(--line);border-top-color:var(--accent);opacity:0;pointer-events:none;transition:opacity .2s}",
".dpzstage.busy::after{opacity:1;transition-delay:.12s;animation:dpspin .85s linear infinite}",
".dpzstage img.a-open{animation:dpopen .26s cubic-bezier(.16,1,.3,1)}",
".dpzstage img.a-next{animation:dpnext .22s cubic-bezier(.16,1,.3,1)}",
".dpzstage img.a-prev{animation:dpprev .22s cubic-bezier(.16,1,.3,1)}",
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
".dpcfg{margin:6px 0 10px}",
".dpcfg>summary{cursor:pointer;list-style:none;-webkit-user-select:none;user-select:none;color:var(--ink);font-size:var(--fs-s);font-weight:700;min-height:40px;padding:7px 12px;border-radius:11px;border:1.5px solid var(--accent);border-color:color-mix(in srgb,var(--accent) 46%,var(--line));background:var(--surface);background:color-mix(in srgb,var(--accent) 12%,var(--bg));display:flex;align-items:center;justify-content:space-between;gap:8px;box-shadow:0 2px 6px rgba(0,0,0,.08);transition:transform .1s ease,background-color .15s ease,border-color .15s ease,box-shadow .15s ease;touch-action:manipulation}",
".dpcfg>summary::-webkit-details-marker,.dpcfg>summary::marker{display:none;content:\"\"}",
".dpcfg>summary:active{transform:scale(.97)}",
".dpcfg-l{display:inline-flex;align-items:center;gap:7px;min-width:0}",
".dpcfg-ic{flex:none;color:var(--accent);transition:transform .22s cubic-bezier(.16,1,.3,1)}",
".dpcfg-r{display:inline-flex;align-items:center;gap:6px;flex:none}",
".dpcfg-tag{font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;background:var(--bg);background:color-mix(in srgb,var(--accent) 16%,var(--surface));border:1px solid var(--line);border-color:color-mix(in srgb,var(--accent) 32%,var(--line));color:var(--ink);white-space:nowrap}",
".dpcfg-tag:empty{display:none}",
".dpcfg-ar{width:24px;height:24px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;background:var(--bg);background:color-mix(in srgb,var(--accent) 18%,var(--surface));color:var(--accent);font-size:12px;line-height:1;transition:transform .15s ease,background-color .15s ease,color .15s ease}",
".dpcfg[open]>summary{margin-bottom:6px;border-color:var(--accent);background:var(--b-new);background:color-mix(in srgb,var(--accent) 18%,var(--bg));box-shadow:0 3px 10px rgba(0,0,0,.12);box-shadow:0 3px 10px color-mix(in srgb,var(--accent) 20%,transparent)}",
".dpcfg[open]>summary .dpcfg-ic{transform:rotate(45deg)}",
".dpcfg[open]>summary .dpcfg-ar{transform:rotate(180deg);background:var(--accent);color:var(--accent-ink)}",
".dpcfg>summary.dirty{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 30%,transparent)}",
".dpcfg[open]>.dpset{animation:dpslide .2s cubic-bezier(.16,1,.3,1)}",
"#dupm{margin:6px 0 4px}",
".dpset{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:6px 10px;margin:6px 0;padding:10px;border-radius:11px;border:1px solid var(--line);background:var(--surface);background:color-mix(in srgb,var(--bg) 70%,var(--surface))}",
".dpset .dpsens{flex-wrap:nowrap;gap:6px}",
".dpset .dpsens label{font-size:var(--fs-s);color:var(--mute);font-weight:600}",
".dpset .dpsens select{min-width:0}",
".dpset .dpfull{grid-column:1/-1}",
".dpcfgact{display:flex;align-items:center;justify-content:space-between;gap:8px 12px;flex-wrap:wrap;margin-top:2px;padding-top:8px;border-top:1px dashed var(--line)}",
".dpcfgact .dpopt{margin-right:auto}",
".dpcfgbtns{display:flex;align-items:center;gap:6px;flex-wrap:wrap}",
"#dupsave.dirty{animation:dppulse 1.6s ease-in-out infinite}",
".dpact{display:flex;align-items:center;justify-content:space-between;gap:8px 12px;flex-wrap:wrap;margin:4px 0 8px}",
".dpact .foot2{display:flex;gap:6px;margin:0;padding:0;border:0;background:none}",
".dpbar2{margin:2px 0 6px;gap:6px}",
".dpignbar{margin:8px 0 10px;padding:7px 10px;border-radius:10px;border:1px dashed var(--s-contact);border-color:color-mix(in srgb,var(--s-contact) 38%,var(--line));background:var(--b-contact);background:color-mix(in srgb,var(--b-contact) 55%,transparent);display:flex;align-items:center;justify-content:space-between;gap:8px}",
".dpc{padding:2px 10px 8px;margin-top:6px}",
".dpr{padding:6px 0}",
".dpn{margin:5px 0 3px}",
".dpa{margin-top:6px;gap:5px}",
".dpa-ign{margin-top:8px;padding-top:7px;border-top:1px dashed var(--line);display:flex;align-items:center;justify-content:flex-start}",
".dpa-ign .dpno,.dpa .dpchk,.dpa .dpimgbtn{min-height:28px;padding:3px 10px}",
".dpedit,.dpdel{min-height:28px;padding:3px 8px}",
".dpm{margin-top:6px}",
".dpm img{height:56px}",
".dpst{margin:4px 0 0}",
".dpundo{left:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));transform:none;gap:5px;max-width:min(245px,calc(100vw - 104px));border-radius:9px;padding:4px 5px 4px 9px;box-shadow:0 4px 14px rgba(0,0,0,.26);font-size:11.5px;line-height:1.25}",
".dpundo:not([hidden]){animation:dpup .18s cubic-bezier(.16,1,.3,1)}",
".dpundo button{border-radius:6px;min-height:24px;padding:2px 8px;font-size:11.5px}",
".dpundo button.x{padding:2px 6px;min-width:22px}",
"@media (max-width:420px){.dpa .dpv{margin-left:0;flex-basis:100%;text-align:left}.dpset{grid-template-columns:minmax(0,1fr)}}",
"@media (prefers-reduced-motion:reduce){.dpbtn,#dupd,#dupd *,.dpz,.dpz *{animation:none!important;transition:none!important}}"
].join("\n");
var DLG="<dialog id=\"dupd\"><div class=\"form\" id=\"dupmain\">\n  <h2>Kiểm tra trùng</h2>\n  <p class=\"pm\" id=\"dupsum\"></p>\n  <div class=\"dpact\"><div class=\"foot2\"><button class=\"btn p\" type=\"button\" id=\"dupimg\">Quét ảnh trùng</button><button class=\"btn\" type=\"button\" id=\"dupstop\" hidden>Dừng</button></div></div>\n  <div class=\"dpb\" id=\"dupbar\" hidden><i></i></div>\n  <p class=\"pm\" id=\"dupm\" role=\"status\"></p>\n  <div class=\"dpbar2\" id=\"duplinks\" hidden><button type=\"button\" class=\"link\" id=\"duptog\" hidden></button></div>\n  <div class=\"dpignbar\" id=\"dupignbar\" hidden><button type=\"button\" class=\"dpignbtn\" id=\"dupigntog\" hidden></button></div>\n  <details class=\"dpcfg\"><summary id=\"dupcfgbtn\"><span class=\"dpcfg-l\"><svg class=\"dpcfg-ic\" viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.86 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z\"/></svg><span>Cài đặt</span></span><span class=\"dpcfg-r\"><span class=\"dpcfg-tag\" id=\"dupcfgtag\"></span><span class=\"dpcfg-ar\" aria-hidden=\"true\">▾</span></span></summary><div class=\"dpset\"><div class=\"dpsens\"><label for=\"dupsens\">Độ nhạy ảnh</label><select id=\"dupsens\"><option value=\"87\">Ít nhầm · 87%</option><option value=\"80\" selected>Vừa · 80%</option><option value=\"77\">Nhạy · 77%</option><option value=\"73\">Rất nhạy · 73%</option><option value=\"custom\">Tùy chỉnh</option></select><input id=\"dupth\" type=\"number\" inputmode=\"numeric\" min=\"60\" max=\"99\" step=\"1\" aria-label=\"Ngưỡng giống (%)\" style=\"width:68px;flex:none;min-height:36px\"></div>\n  <div class=\"dpsens\"><label for=\"dupimgv\">Xem ảnh</label><select id=\"dupimgv\"><option value=\"manual\" selected>Bấm để mở</option><option value=\"both\">Mở sẵn · 2 cột</option><option value=\"stack\">Mở sẵn · xếp dọc</option></select></div>\n  <div class=\"dpsens\"><label for=\"dupmm\">Xác minh vùng xám</label><select id=\"dupmm\"><option value=\"2\" selected>Đa mô hình (Màu + Trung tâm)</option><option value=\"1\">Nhanh (Màu + Cạnh Pixel)</option><option value=\"0\">Tắt (Chỉ DINOv3)</option></select></div>\n  <div class=\"dpsens\"><label for=\"dupres\">Độ phân giải</label><select id=\"dupres\"><option value=\"192\">192 · nhanh</option><option value=\"224\" selected>224 · mặc định</option><option value=\"256\">256</option><option value=\"288\">288</option><option value=\"320\">320 · chi tiết</option></select></div>\n  <div class=\"dpsens\"><label for=\"duppre\">Độ chính xác</label><select id=\"duppre\"><option value=\"16\" selected>fp16 · nhanh</option><option value=\"32\">fp32 · chính xác hơn</option></select></div>\n  <div class=\"dpsens\"><label for=\"dupdev\">Thiết bị</label><select id=\"dupdev\"><option value=\"auto\" selected>Tự động (GPU nếu có)</option><option value=\"cpu\">Chỉ CPU</option></select></div>\n  <div class=\"dpsens\"><label for=\"dupbn\">Batch</label><select id=\"dupbn\"><option value=\"0\">Tự động</option><option value=\"1\">1</option><option value=\"2\">2</option><option value=\"4\" selected>4</option><option value=\"8\">8</option></select></div>\n  <div class=\"dpsens\"><label for=\"duppace\">Nhịp quét</label><select id=\"duppace\"><option value=\"0\">Nhanh nhất</option><option value=\"0.6\" selected>Cân bằng</option><option value=\"1.5\">Mát máy</option></select></div>\n  <p class=\"dpst dpfull\" id=\"dupengnote\" hidden></p>\n  <p class=\"dpst dpfull\" id=\"dupretnote\" hidden></p>\n  <div class=\"dpcfgact dpfull\"><label class=\"dpopt\"><input type=\"checkbox\" id=\"dupnoout\" checked><span>Bỏ qua căn Loại</span></label><div class=\"dpcfgbtns\"><button type=\"button\" class=\"btn\" id=\"dupanalyze\">Phân tích đa ngưỡng</button><button type=\"button\" class=\"btn\" id=\"duprst\">Đặt lại</button><button type=\"button\" class=\"btn p\" id=\"dupsave\">Lưu &amp; quét lại ảnh</button></div></div></div></details>\n  <div id=\"dupl\"></div>\n  <div class=\"foot\"><button class=\"btn p\" type=\"button\" id=\"dupx\">Đóng</button></div>\n</div><div class=\"form\" id=\"dupignview\" hidden>\n  <div class=\"dphead\"><button type=\"button\" class=\"btn\" id=\"dupback\">← Quay lại</button><h2>Không phải trùng</h2></div>\n  <p class=\"pm\" id=\"dupignsum\"></p>\n  <button type=\"button\" class=\"link\" id=\"dupignclr\" hidden>Khôi phục tất cả về danh sách kiểm tra</button>\n  <div id=\"dupignl\"></div>\n  <div class=\"foot\"><button class=\"btn\" type=\"button\" id=\"dupback2\">← Quay lại</button><button class=\"btn p\" type=\"button\" id=\"dupx2\">Đóng</button></div>\n</div><div class=\"dpz\" id=\"dupz\" hidden><div class=\"dpzb\"><div class=\"dpzhdr\"><p class=\"dpzt\" id=\"dupzt\"></p><button type=\"button\" class=\"dpzlay\" id=\"dupzlay\">Xếp dọc</button><button type=\"button\" class=\"dpzcls\" id=\"dupzx2\" aria-label=\"Đóng\">×</button></div><div class=\"dpzm\" id=\"dupzm\" hidden></div><div class=\"dpzg\" id=\"dupzg\"><div class=\"dpzcol\"><div class=\"dpzstage\"><img id=\"dupz1\" alt=\"Ảnh căn 1\"><span class=\"dpzempty\" id=\"dupze1\" hidden>Chưa có ảnh</span></div><div class=\"dpzmeta\"><b id=\"dupz1n\"></b><small id=\"dupz1m\"></small></div><div class=\"dpzctrl\" id=\"dupzc1\" hidden><button type=\"button\" id=\"dupz1prev\" aria-label=\"Ảnh trước căn 1\">‹</button><span id=\"dupz1c\"></span><button type=\"button\" id=\"dupz1next\" aria-label=\"Ảnh sau căn 1\">›</button></div></div><div class=\"dpzcol\"><div class=\"dpzstage\"><img id=\"dupz2\" alt=\"Ảnh căn 2\"><span class=\"dpzempty\" id=\"dupze2\" hidden>Chưa có ảnh</span></div><div class=\"dpzmeta\"><b id=\"dupz2n\"></b><small id=\"dupz2m\"></small></div><div class=\"dpzctrl\" id=\"dupzc2\" hidden><button type=\"button\" id=\"dupz2prev\" aria-label=\"Ảnh trước căn 2\">‹</button><span id=\"dupz2c\"></span><button type=\"button\" id=\"dupz2next\" aria-label=\"Ảnh sau căn 2\">›</button></div></div></div><div class=\"dpzact\" id=\"dupzact\"><button type=\"button\" class=\"dpno\" id=\"dupzign\">Không phải trùng</button><button type=\"button\" class=\"dpdel\" id=\"dupzdel1\">Xóa căn 1</button><button type=\"button\" class=\"dpdel\" id=\"dupzdel2\">Xóa căn 2</button></div><div class=\"foot\"><button class=\"btn p\" type=\"button\" id=\"dupzx\">Đóng</button></div></div></div><div class=\"dpundo\" id=\"dupundo\" hidden><span id=\"dupundot\"></span><button type=\"button\" id=\"dupundob\">↶ Hoàn tác</button><button type=\"button\" class=\"x\" id=\"dupundox\" aria-label=\"Ẩn\">✕</button></div></dialog>";
var TH=80,VL=1,ALGO_VER=3,MIN=2,imgPairs=null,scanning=false,stopFlag=false,cache={},cacheLoaded=false,cacheP=null,inflight={},LIMIT=50,limMain=50,limIgn=50,memo=null,syncT=0,showOne=false,showIgn=false,skipOut=true,skipLoaded=false,imgAutoMode="manual",imgModeLoaded=false,viewList=[],openSet={},openImgSet={},pairImgMode={},ignored={},ignLoaded=false,pairImgMsg={},zoomCmp=null;

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
   HUB (hubLim, cộng thêm theo số căn): ưu tiên chặn các cặp chỉ khớp 1 ảnh đơn lẻ (o.img.length===1) khi ảnh đó giống ≥HUB căn khác (<HUB_N%).
   Cặp trùng từ ≥2 ảnh riêng biệt trở lên (cụm nhiều sale cùng đăng 1 căn) được miễn trừ HUB trừ khi xung đột khu vực/giá. */
var HUB=3,HUB_N=90,HUB_STEP=100,HUB_MAX=12;
/* Ngưỡng HUB tăng theo số căn: càng nhiều căn thì ảnh chung chung càng dễ giống ngẫu nhiên với nhiều căn khác.
   n<100 căn: 3 · 100-199: 4 · 200-299: 5 … tối đa HUB_MAX */
function hubLim(n){return Math.min(HUB_MAX,HUB+Math.floor((n||0)/HUB_STEP))}
function ih(o){return o.img.length>0}
function pairCtx(a,b,tsText){
  var da=nw(a.d),db=nw(b.d),wa=nw(a.w),wb=nw(b.w);
  var sameDist=!!(da&&db&&da===db),diffDist=!!(da&&db&&da!==db);
  var sameWard=!!(wa&&wb&&wa===wb&&!diffDist);
  var pa=num(a.p),pb=num(b.p),pDiff=null;
  if(pa!=null&&pb!=null)pDiff=Math.abs(pa-pb)/Math.max(pa,pb);
  var aa=num(a.ar),ab=num(b.ar),aDiff=null;
  if(aa!=null&&ab!=null)aDiff=Math.abs(aa-ab)/Math.max(aa,ab);
  var support=tsText||0;
  if(sameWard)support++;
  else if(sameDist&&(pDiff===null||pDiff<=0.25))support++;
  if(pDiff!==null&&pDiff<=0.12&&!diffDist)support++;
  if(aDiff!==null&&aDiff<=0.15&&!diffDist)support++;
  var conflict=false;
  if(diffDist&&(pDiff===null||pDiff>0.2))conflict=true;
  if(pDiff!==null&&pDiff>0.45)conflict=true;
  if(aDiff!==null&&aDiff>0.55&&pDiff!==null&&pDiff>0.3)conflict=true;
  return{support:support,conflict:conflict,sameDist:sameDist,diffDist:diffDist,pDiff:pDiff}}
function oneToOnePairs(list,isNorm){
  var sorted=list.slice().sort(function(p,q){
    var np=p.n!=null?p.n:Math.max(0,100-p.d),nq=q.n!=null?q.n:Math.max(0,100-q.d);
    return (nq-np)||((q.x===q.y?1:0)-(p.x===p.y?1:0))});
  var usedA={},usedB={},out=[],dropped=0;
  sorted.forEach(function(r){
    var sx=isNorm?r.x:(r.a.id<r.b.id?r.x:r.y),sy=isNorm?r.y:(r.a.id<r.b.id?r.y:r.x);
    if(usedA[sx]||usedB[sy]){dropped++;return}
    usedA[sx]=1;usedB[sy]=1;out.push(r)});
  out.dropped=dropped;return out}
function filterGenericImgs(P,n,thRef){
  var hub={},lim=hubLim(n),tsBase=thRef||TH;
  function nn(m){return m.n!=null?m.n:Math.max(0,100-m.d)}
  function rec(img,otherId,sim){var h=hub[img]||(hub[img]={});if(h[otherId]===undefined||sim>h[otherId])h[otherId]=sim}
  Object.keys(P).forEach(function(k){
    var o=P[k];if(!o.img.length)return;
    o.img=oneToOnePairs(o.img,true);
    o.img.forEach(function(m){var s=nn(m);rec(m.x,o.b.id,s);rec(m.y,o.a.id,s)})});
  function hn(s){return hub[s]?Object.keys(hub[s]).length:0}
  function secMax(s,skipId){
    var h=hub[s],mx=0;if(!h)return 0;
    Object.keys(h).forEach(function(id){if(id!==skipId&&h[id]>mx)mx=h[id]});
    return mx}
  Object.keys(P).forEach(function(k){
    var o=P[k];if(!o.img.length)return;
    var ts=0;o.why.forEach(function(w){if(w!=="img")ts+=WT[w]||1});
    if(ts<MIN){
      var ctx=pairCtx(o.a,o.b,ts),nImg=o.img.length;
      var multiExempt=nImg>=2&&!ctx.conflict&&(ctx.support>=1||nImg>=3);
      o.img=o.img.filter(function(m){
        if(m.x===m.y)return true;
        var s=nn(m);
        if(s>=HUB_N)return true;
        if(multiExempt||(nImg>=2&&!ctx.conflict&&s>=84))return true;
        var dx=hn(m.x),dy=hn(m.y);
        var effLim=(nImg===1&&ctx.support>=1&&!ctx.conflict&&s>=85)?(lim+1):lim;
        if(dx>=effLim||dy>=effLim)return false;
        if(nImg===1&&s<tsBase+3&&(dx>=2||dy>=2)){
          var gapX=s-secMax(m.x,o.b.id),gapY=s-secMax(m.y,o.a.id);
          if((dx>=2&&gapX<=2)||(dy>=2&&gapY<=2)){if(ctx.conflict||s<tsBase+1)return false}
        }
        return true});
      if(!o.img.length){var i=o.why.indexOf("img");if(i>=0)o.why.splice(i,1)}
    }
    if(!o.why.length)delete P[k]})}
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
  var tag=k==="2m"?"DINOv3 · Màu + Trung tâm":k==="mc"?"DINOv3 + Trung tâm":k==="px"?"DINOv3 + Màu":"DINOv3";
  return p>=99?"Giống ~100% ("+tag+")":"Giống "+p+"% ("+tag+")"}
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
  h+='<button type="button" class="dpchk" data-chkimg="'+idx+'"'+(st&&st.busy?' disabled':'')+'>'+(st&&st.busy?'Đang kiểm tra…':'Kiểm tra ảnh')+'</button>';
  h+='<button type="button" class="dpimgbtn" data-imgtog="'+idx+'" aria-expanded="'+(totImg&&imgOpen?"true":"false")+'"'+(totImg?"":" disabled")+'>'+(totImg?(imgOpen?'Ẩn ảnh ('+na+' · '+nb+') ▴':'Xem ảnh ('+na+' · '+nb+') ▾'):'Không có ảnh')+'</button>';
  h+='<button type="button" class="link dpv" data-tog="'+idx+'">'+(isOpen?"Ẩn thông tin":"Thông tin")+'</button></div>';
  if(st&&st.text)h+='<p class="dpst'+(st.ok?' ok':st.bad?' bad':'')+'">'+esc(st.text)+'</p>';
  h+='<div class="dpa-ign">';
  if(isIgn)h+='<button type="button" class="dpno undo" data-unign="'+idx+'">Khôi phục nghi trùng</button>';
  else h+='<button type="button" class="dpno" data-ign="'+idx+'">Không phải trùng</button>';
  h+='</div>';
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
  G("duplinks").hidden=tg.hidden;
  var ib=G("dupignbar");if(ib)ib.hidden=!r.ign.length;
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
/* Cập nhật riêng thẻ của cặp đang kiểm tra (nút + dòng trạng thái) thay vì dựng lại cả danh sách → hết nháy màn hình */
function pairSig(list,o){
  return (list||[]).filter(function(r){return (r.a.id===o.a.id&&r.b.id===o.b.id)||(r.a.id===o.b.id&&r.b.id===o.a.id)})
    .map(function(r){return r.x+"|"+r.y+"|"+r.n}).sort().join(",")}
function paintPair(idx,k){
  var host=G(showIgn?"dupignl":"dupl"),btn=host&&host.querySelector('[data-chkimg="'+idx+'"]'),card=btn&&btn.closest(".dpc"),st=pairImgMsg[k];
  if(!card){render();return}
  var busy=!!(st&&st.busy);
  btn.disabled=busy;btn.textContent=busy?"Đang kiểm tra…":"Kiểm tra ảnh";
  var p=card.querySelector(".dpst");
  if(st&&st.text){
    if(!p){var a=card.querySelector(".dpa");if(!a){render();return}p=document.createElement("p");a.parentNode.insertBefore(p,a.nextSibling)}
    p.className="dpst"+(st.ok?" ok":st.bad?" bad":"");p.textContent=st.text
  }else if(p)p.parentNode.removeChild(p)}
function checkPairImg(el){
  var idx=+el.dataset.chkimg,o=viewList[idx];if(!o)return;
  var k=o.a.id+"|"+o.b.id;
  if(pairImgMsg[k]&&pairImgMsg[k].busy)return;
  var aIm=(o.a.im||[]).filter(Boolean),bIm=(o.b.im||[]).filter(Boolean);
  if(!aIm.length||!bIm.length){
    pairImgMsg[k]={text:"Chưa đủ ảnh để kiểm tra (Căn 1: "+aIm.length+" ảnh · Căn 2: "+bIm.length+" ảnh)."};
    paintPair(idx,k);return;
  }
  pairImgMsg[k]={busy:true,text:"Đang kiểm tra "+aIm.length+" ảnh vs "+bIm.length+" ảnh…"};
  paintPair(idx,k);
  Promise.all([loadCache(),loadPm(),dinoLoad()]).then(function(){
    smartCalc();
    var uniq={},list=[];
    aIm.concat(bIm).forEach(function(s){if(!uniq[s]){uniq[s]=1;list.push(s)}});
    var map={},doneSet={},bad=0,pos=0,aborted=false;
    function worker(){
      if(pos>=list.length)return Promise.resolve();
      var s=list[pos++];
      return hashOf(s).then(function(h){if(h===undefined){aborted=true;return}if(h!==null){doneSet[s]=1;if(h){var sg=sigOf(s)||parseSig(h);if(sg)map[s]=sg}}else bad++}).then(worker)}
    return Promise.all(spawnW(worker)).then(function(){
      saveCache();
      if(aborted){pairImgMsg[k]={bad:true,text:"Bị gián đoạn vì đang dừng quét ảnh, hãy bấm Kiểm tra ảnh lại."};paintPair(idx,k);return}
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
      var sigOld=pairSig(imgPairs,o);
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
        pm.th=TH;pm.vf=VL;pm.cal=SM.cal;pm.algo=ALGO_VER;pm.mm=MM_MODE;
        savePm();
      }
      if(found.length){
        pairImgMsg[k]={ok:true,text:"Tìm thấy "+found.length+" cặp ảnh giống nhau"+(bad?" ("+bad+" ảnh không đọc được)":"")+rjT+"."};
      }else if(bad&&bad===list.length){
        pairImgMsg[k]={bad:true,text:"Không đọc được ảnh của 2 căn này."};
      }else{
        pairImgMsg[k]={text:"Không trùng ảnh ("+aIm.length+" vs "+bIm.length+" ảnh"+(bad?", "+bad+" ảnh lỗi":"")+")"+rjT+"."};
      }
      if(pairSig(imgPairs,o)===sigOld)paintPair(idx,k);else render();
      });
    });
  },function(e){pairImgMsg[k]={bad:true,text:"Không tải được mô hình DINOv3 (cần mạng ở lần đầu): "+(e&&e.message||e)};paintPair(idx,k)})}
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
var ENG=(function(){var o=null;try{o=JSON.parse(localStorage.getItem("dup_eng")||"null")}catch(e){}return(o&&typeof o==="object")?o:{}})();   /* cài đặt mô hình lưu trong trình duyệt (khóa dup_eng); biến window.DUP_DINO_* nếu có sẽ được ưu tiên */
function engSave(){try{localStorage.setItem("dup_eng",JSON.stringify(ENG))}catch(e){}}
function cfgTagUi(dirty){var t=G("dupcfgtag"),c=G("dupcfgbtn");if(t)t.textContent=TH+"% · "+DS+"px"+(dirty?" *":"");if(c)c.classList.toggle("dirty",!!dirty)}
function engUi(def){var set=function(i,v){var e=G(i);if(e)e.value=String(v)};if(def){set("dupres",224);set("duppre","16");set("dupdev","auto");set("dupbn",4);set("duppace",0.6);set("dupmm",2);cfgTagUi(false);return}set("dupres",DS);set("duppre",F16?"16":"32");set("dupdev",DINO_GPU?"auto":"cpu");set("dupbn",ENG.bn===0?0:((ENG.bn>0&&ENG.bn<=8)?ENG.bn|0:4));set("duppace",PACE);set("dupmm",MM_MODE);cfgTagUi(false)}
var MM_MODE=(function(){var v=ENG.mm===undefined?2:(+ENG.mm|0);return(v===0||v===1||v===2)?v:2})();
var F16=window.DUP_DINO_F16!==undefined?window.DUP_DINO_F16!==false:ENG.f16!==false;
var DS=(function(){var r=+window.DUP_DINO_RES||+ENG.res;return(r>=112&&r<=448&&r%16===0)?r:224})();   /* 224 = mặc định; DINOv3 patch 16 nên chỉ nhận bội số của 16 (112…448; càng cao càng chậm/tốn RAM). Đặt window.DUP_DINO_RES=160 trước khi nạp dup.js để nhanh ~2x (cache tách riêng) */
var CACHE_KEY="dhc11"+(DS===256?"":"r"+DS)+(F16?"":"x");
function parseCache(raw){try{var o=JSON.parse(raw||"{}");return(o&&typeof o==="object")?o:{}}catch(e){return{}}}
function clearOldCaches(){
  ["dhc1","dhc2","dhc3","dhc4","dhc5","dhc7","dpm1","dpm3"].forEach(function(k){
    try{if(ls(k))ls(k,"")}catch(e){}
    if(N()&&N().idbSave)N().idbSave(k,"");
  });
}
/* ===== Cache của cấu hình cũ =====
   Đổi model / độ phân giải / độ chính xác thì khóa cache (CACHE_KEY) đổi theo, cache cũ nằm lại trên máy.
   Nó chỉ bị xóa SAU KHI đã đẩy hết hash lên máy chủ (hashSet đúng theo khóa cũ). Chưa đẩy được (mất mạng, tài khoản chỉ xem, máy chủ lỗi) thì giữ nguyên và thử lại ở lần mở sau. */
var RET_LAST="dup_last",RET_PEND="dup_pend",retiring=false;
function lsGetRaw(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsSetRaw(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function retList(){var a=null;try{a=JSON.parse(lsGetRaw(RET_PEND)||"[]")}catch(e){}return Array.isArray(a)?a.filter(function(x){return x&&x.c}):[]}
function retCheck(){
  var last=null,pend=retList();
  try{last=JSON.parse(lsGetRaw(RET_LAST)||"null")}catch(e){}
  function add(c,p){if(c&&c!==CACHE_KEY&&!pend.some(function(x){return x.c===c}))pend.push({c:c,p:p||""})}
  if(last&&last.c){add(last.c,last.p)}
  else{[["dhc8","dpm4"],["dhc9","dpm4"],["dhc10","dpm5"]].forEach(function(x){add(x[0],x[1])})}   /* lần đầu có tính năng này: gom các khóa của các bản trước */
  pend=pend.filter(function(x){return x.c!==CACHE_KEY});   /* quay lại cấu hình cũ thì giữ cache của nó */
  lsSetRaw(RET_LAST,JSON.stringify({c:CACHE_KEY,p:PM_KEY}));
  lsSetRaw(RET_PEND,JSON.stringify(pend));
  return pend}
function retNote(t){var e=G("dupretnote");if(e){e.textContent=t||"";e.hidden=!t}}
function readKey(k){
  var idb=N()&&N().idbGet,leg="";try{leg=ls(k)||""}catch(e){}
  if(!idb)return Promise.resolve(leg);
  return idb(k).then(function(v){return(typeof v==="string"&&v)?v:leg},function(){return leg})}
function wipeKey(k){try{if(ls(k))ls(k,"")}catch(e){}try{if(N()&&N().idbSave)N().idbSave(k,"")}catch(e){}}
function retireOld(){
  if(retiring||!(N()&&N().apiPost&&canWrite()))return;
  var pend=retList();if(!pend.length){retNote("");return}
  retiring=true;
  var o=pend[0];
  retNote("Đang đồng bộ cache cấu hình cũ lên máy chủ trước khi xóa…");
  readKey(o.c).then(function(raw){
    var c=parseCache(raw),q=Object.keys(c).filter(function(s){return String(s).indexOf("data:")!==0&&typeof c[s]==="string"});
    function send(){
      var ch=q.splice(0,300);if(!ch.length)return Promise.resolve();
      return N().apiPost("hashSet",{v:o.c,add:ch.map(function(s){return[s,c[s]]})},30000).then(function(d){
        if(!(d&&typeof d==="object"&&d.ok!==false))throw new Error("sync");
        return send()})}
    return send()
  }).then(function(){
    wipeKey(o.c);if(o.p&&o.p!==PM_KEY)wipeKey(o.p);
    lsSetRaw(RET_PEND,JSON.stringify(retList().filter(function(x){return x.c!==o.c})));
    retNote("");retiring=false;retireOld()
  },function(){retNote("Cache cấu hình cũ chưa đồng bộ được, sẽ thử lại ở lần mở sau.");retiring=false})}
function loadCache(){
  if(cacheLoaded)return Promise.resolve(cache);
  if(cacheP)return cacheP;
  var idb=N()&&N().idbGet;
  if(!idb){cacheLoaded=true;cache=parseCache(ls(CACHE_KEY));clearOldCaches();retCheck();return Promise.resolve(cache)}
  cacheP=idb(CACHE_KEY).then(function(v){
    var leg=ls(CACHE_KEY);
    if(typeof v==="string"&&v){cache=parseCache(v);if(leg)ls(CACHE_KEY,"")}
    else if(leg){cache=parseCache(leg);if(N().idbSave)N().idbSave(CACHE_KEY,leg);ls(CACHE_KEY,"")}
    clearOldCaches();retCheck();
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
  hsPullP=hsPhase.then(function(){return hsPush()}).then(function(){retireOld()}).then(function(){hsPullP=null},function(){hsPullP=null});
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
   Mỗi ảnh -> 1 vector 384 chiều (token CLS của dinov3-vits16, int8 + base64), so bằng cosine.
   Chuỗi lưu: "E<L|P>:<vec>" hoặc "E<L|P>:<vec>:<vec cắt viền>" (ảnh chụp màn hình có viền đen/trắng thì nhúng thêm bản đã cắt viền).
   Chuỗi rỗng "" = ảnh trơn/ít chi tiết (bỏ qua); null = không đọc được ảnh.
   Mô hình chạy ngay trong máy bằng transformers.js (WebGPU fp16/fp32 hoặc WASM fp32), tải lần đầu từ CDN rồi được trình duyệt lưu lại. */
var DINO_LIB="https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0",DINO_ID="olinesn/dinov3-vits16-lucid",DINO_LOCAL="models/",DINO_GPU=window.DUP_DINO_GPU!==undefined?window.DUP_DINO_GPU!==false:ENG.dev!=="cpu",FETCH_CONC=6;
var DIM=384,DINO={p:null,m:null,T:null,err:null},dinoErr=null,DW={w:null,dev:"",gpu:false,seq:0,pend:{},q:[],busy:false,tm:0},BN=window.DUP_DINO_BN>0?Math.min(8,+window.DUP_DINO_BN|0):(ENG.bn===0?(DS<=160?4:(DS<=224?2:1)):(ENG.bn>0?Math.min(8,ENG.bn|0):4)),PACE=window.DUP_DINO_PACE>=0?+window.DUP_DINO_PACE:(ENG.pace>=0?+ENG.pace:0.6),PACE_MAX=250;
/* Worker (nhúng bằng Blob, không cần file riêng): WebGPU fp16 nếu có shader-f16, không thì WebGPU fp32, không có WebGPU thì WASM fp32 (đa luồng khi crossOriginIsolated).
   Có kiểm tra thử 1 lần lúc khởi tạo; lỗi/NaN trên WebGPU tự hạ cấp fp16 -> fp32 -> WASM. Có thể tự host model tại ./models/olinesn/dinov3-vits16-lucid/ (kèm LICENSE của DINOv3) */
function dinoWorkerMain(){
  var L=null,M=null,T=null,dev="",dt="",C=null;
  function say(m,tr){self.postMessage(m,tr||[])}
  function build(d,t){
    var o={device:d,dtype:t};
    o.progress_callback=function(p){if(p&&p.status==="progress"&&/\.onnx$/.test(p.file||""))say({t:"prog",p:Math.round(p.progress||0)})};
    return L.AutoModel.from_pretrained(C.id,o).then(function(m){M=m;dev=d;dt=t;return m})}
  function wasm(){return build("wasm","fp32")}
  /* hạ cấp từng bước: WebGPU fp16 -> WebGPU fp32 -> WASM fp32 */
  function degrade(){
    if(dev==="webgpu"&&dt==="fp16")return build("webgpu","fp32").catch(wasm);
    return wasm()}
  function infer(list){
    var n=list.length,S=C.S,sz=S*S,f=new Float32Array(n*3*sz),k,i,p,u,o;
    for(k=0;k<n;k++){u=new Uint8ClampedArray(list[k]);o=k*3*sz;
      for(i=0;i<sz;i++){p=i*4;f[o+i]=(u[p]/255-.485)/.229;f[o+sz+i]=(u[p+1]/255-.456)/.224;f[o+2*sz+i]=(u[p+2]/255-.406)/.225}}
    return M({pixel_values:new T("float32",f,[n,3,S,S])}).then(function(r){
      var h=r.last_hidden_state||r.pooler_output||r[Object.keys(r)[0]],dm=h.dims,D=dm[dm.length-1],tk=dm.length===3?dm[1]:1,d=h.data,out=[],v,j,bad=false;
      for(k=0;k<n;k++){v=new Float32Array(D);for(j=0;j<D;j++){v[j]=d[k*tk*D+j];if(v[j]!==v[j]||v[j]===Infinity||v[j]===-Infinity)bad=true}out.push(v)}
      if(bad)throw new Error("NaN");
      return out})}
  function safe(list){
    return infer(list).catch(function(e){
      if(dev!=="webgpu")throw e;
      return degrade().then(function(){return infer(list)}).catch(function(e2){
        if(dev==="webgpu")return wasm().then(function(){return infer(list)});
        throw e2})})}
  function probe(c){
    if(!c.localBase)return Promise.resolve(false);
    return fetch(c.localBase+c.id+"/config.json").then(function(r){return r.ok?r.json().then(function(){return true},function(){return false}):false},function(){return false})}
  function gpuOk(c){
    if(!c.gpu||!self.navigator||!navigator.gpu)return Promise.resolve(null);
    return navigator.gpu.requestAdapter().then(function(a){
      if(!a)return null;
      var f=false;try{f=a.features.has("shader-f16")}catch(e){}
      return{f16:f}},function(){return null})}
  /* ảnh thử có nhiều chi tiết (không phải màu phẳng) để lộ lỗi tràn số fp16 */
  function testImg(){
    var S=C.S,n=S*S*4,u=new Uint8ClampedArray(n),i,x,y;
    for(i=0;i<n;i+=4){x=(i/4)%S;y=((i/4)/S)|0;u[i]=(x*7+y*3)%256;u[i+1]=(x*y)%256;u[i+2]=(x*13+y*29)%256;u[i+3]=255}
    return u.buffer}
  function init(c){
    C=c;
    return import(c.lib).then(function(x){
      L=x;T=x.Tensor;
      var w=x.env.backends&&x.env.backends.onnx&&x.env.backends.onnx.wasm;
      if(w)w.numThreads=self.crossOriginIsolated?Math.max(1,Math.min(4,self.navigator.hardwareConcurrency||2)):1;
      return probe(c)}).then(function(loc){
      L.env.allowLocalModels=!!loc;
      if(loc)L.env.localModelPath=c.localBase;
      return gpuOk(c)}).then(function(g){
      if(!g)return wasm();
      var t=(g.f16&&c.f16!==false)?"fp16":"fp32";
      return build("webgpu",t).catch(function(){return t==="fp16"?build("webgpu","fp32"):Promise.reject(new Error("webgpu"))}).catch(wasm)}).then(function(){
      if(dev!=="webgpu")return;
      function chk(){return infer([testImg()])}
      return chk().catch(function(){return degrade().then(chk)}).catch(function(){return wasm()})})}
  self.onmessage=function(e){
    var m=e.data||{};
    if(m.t==="init")init(m.cfg).then(function(){say({t:"ready",dev:dev,dt:dt})},function(err){say({t:"initerr",msg:String(err&&err.message||err)})});
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
    var w,done=false;
    try{w=new Worker(URL.createObjectURL(new Blob(["("+dinoWorkerMain.toString()+")()"],{type:"text/javascript"})))}catch(e){bad(e);return}
    w.onmessage=function(e){
      var m=e.data||{};
      if(m.t==="prog"&&!(scanning&&stopFlag))msg("Đang tải DINOv3… "+m.p+"%");
      else if(m.t==="ready"){done=true;DW.w=w;DW.dev=m.dev+(m.dt?"-"+m.dt:"");DW.gpu=m.dev==="webgpu";w.onmessage=onWorkerMsg;w.onerror=onWorkerErr;ok(w)}
      else if(m.t==="initerr"){done=true;try{w.terminate()}catch(_){}bad(new Error(m.msg))}};
    w.onerror=function(e){if(done)return;done=true;try{w.terminate()}catch(_){}bad(new Error(e&&e.message||"worker lỗi"))};
    w.postMessage({t:"init",cfg:{lib:DINO_LIB,id:DINO_ID,S:DS,gpu:DINO_GPU,f16:F16,localBase:new URL(DINO_LOCAL,location.href).href}})})}
function loadMain(){
  return import(DINO_LIB).then(function(L){
    L.env.allowLocalModels=false;
    return L.AutoModel.from_pretrained(DINO_ID,{dtype:"fp32",device:"wasm",progress_callback:function(p){
      if(p&&p.status==="progress"&&/\.onnx$/.test(p.file||"")&&!(scanning&&stopFlag))msg("Đang tải DINOv3… "+Math.round(p.progress||0)+"%")}
    }).then(function(m){DINO.m=m;DINO.T=L.Tensor;return m})})}
function dinoLoad(){
  if(DINO.p)return DINO.p;
  msg("Đang tải DINOv3 (lần đầu ~45–90 MB)…");
  DINO.p=loadWorker().catch(function(){return loadMain()}).then(function(r){DINO.err=null;return r}).catch(function(e){DINO.p=null;DINO.m=null;killWorker();DINO.err=String(e&&e.message||e);throw e});
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
  for(i=0;i<DIM;i++){x=Math.round(d[i]/q*250);u[i]=(x>127?127:x<-127?-127:x)&255}
  return btoa(String.fromCharCode.apply(null,u))}
function decVec(b64){
  var t,v=new Float32Array(DIM),i,x,q=0;
  try{t=atob(b64)}catch(e){return null}
  if(t.length!==DIM)return null;
  for(i=0;i<DIM;i++){x=t.charCodeAt(i);if(x>127)x-=256;v[i]=x/250;q+=v[i]*v[i]}
  q=Math.sqrt(q)||1;for(i=0;i<DIM;i++)v[i]/=q;
  return v}
function inferPx(px){
  return new Promise(function(ok,bad){DW.q.push({px:px,ok:ok,bad:bad});pump()}).then(encVec).catch(function(e){if(e&&typeof e==="object")e.isModel=true;throw e})}
var SP={n:0,ms:0,t0:0};
function spTxt(){if(SP.n<4||!SP.t0)return"";var sec=(Date.now()-SP.t0)/1000;return sec>0?" · "+(SP.n/sec).toFixed(1)+" ảnh/s · mô hình "+Math.round(SP.ms/SP.n)+" ms/ảnh":""}
function pump(){
  if(DW.busy||!DW.q.length)return;
  if(DW.q.length>=BN){flush();return}
  if(!DW.tm)DW.tm=setTimeout(flush,12)}
function flush(){
  if(DW.tm){clearTimeout(DW.tm);DW.tm=0}
  if(DW.busy||!DW.q.length)return;
  var b=DW.q.splice(0,BN),t0=Date.now();DW.busy=true;if(!SP.t0)SP.t0=t0;
  function rel(){DW.busy=false;pump()}
  runBatch(b.map(function(x){return x.px})).then(function(vs){b.forEach(function(x,i){x.ok(vs[i])})},function(e){b.forEach(function(x){x.bad(e)})}).then(function(){
    SP.n+=b.length;SP.ms+=Date.now()-t0;
    /* nghỉ ngắn sau mỗi batch khi chạy trên GPU hoặc luồng chính, để giao diện không bị giật */
    var gap=(DW.gpu||!DW.w)?Math.min(PACE_MAX,Math.round((Date.now()-t0)*PACE)):0;
    if(gap>0)setTimeout(rel,gap);else rel()})}
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
var hashAbort={},mmAbort={},stopWaiters=[],modelFail=null;
/* Dừng quét: đặt cờ, hủy ngay các ảnh đang chờ tải, đánh thức các bước đang đợi (đồng bộ hash, tải mô hình) */
function stopScan(){
  stopFlag=true;
  Object.keys(hashAbort).forEach(function(k){try{hashAbort[k]()}catch(e){}});
  Object.keys(mmAbort).forEach(function(k){try{mmAbort[k]()}catch(e){}});
  var w=stopWaiters;stopWaiters=[];w.forEach(function(f){try{f()}catch(e){}});
  if(scanning){var b=G("dupstop");if(b)b.disabled=true;msg("Đang dừng…")}}
function hashOf(s){
  if(cache[s]!==undefined)return Promise.resolve(cache[s]);
  if(inflight[s])return inflight[s];
  var p=new Promise(function(res){
    var u0=imgSrc(s,256),isLh=u0.indexOf("https://lh3.googleusercontent.com/")===0;
    var tries=isLh?[u0+"?dh=3",imgSrc(s,320)+"?dh=4",imgSrc(s,300)]:[u0];
    var step=0,done=false;
    function fin(h){if(done)return;done=true;delete hashAbort[s];if(h!==null&&String(s).indexOf("data:")!==0){if(hs&&hs.k[s]&&cache[s]!==undefined)h=cache[s];else cache[s]=h}delete inflight[s];res(h)}
    function stopNow(){if(done)return;done=true;delete inflight[s];delete hashAbort[s];res(undefined)}   /* undefined = bị dừng, không phải ảnh lỗi, không lưu cache */
    function next(){
      if(done)return;
      if(stopFlag&&scanning){stopNow();return}
      if(step>=tries.length){fin(null);return}
      var u=tries[step++],im=new Image(),settled=false;
      if(u.indexOf("https://lh3.googleusercontent.com/")===0)im.crossOrigin="anonymous";
      im.referrerPolicy="no-referrer";
      var t=setTimeout(fail,12000);
      hashAbort[s]=function(){if(settled||done)return;settled=true;clearTimeout(t);dropIm();stopNow()};
      function dropIm(){im.onload=im.onerror=null;try{im.src=""}catch(e){}}
      function fail(){if(settled||done)return;settled=true;clearTimeout(t);dropIm();setTimeout(next,step===1?400:700)}
      im.onload=function(){
        if(settled||done)return;settled=true;clearTimeout(t);delete hashAbort[s];
        embedImg(im).then(function(h){dropIm();fin(h)},function(e){dropIm();if(e&&e.isModel)modelFail=e;if(e&&e.message==="ảnh rỗng")setTimeout(next,400);else fin(null)})};
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
function thNorm(t){t=Math.round(+t);return(t>=60&&t<=99)?t:80}   /* ngưỡng tự do 60–99% (4 mức có sẵn là 73/77/80/87) */
function thUi(){var a=G("dupsens"),i=G("dupth");if(a)a.value=(TH===87||TH===80||TH===77||TH===73)?String(TH):"custom";if(i)i.value=String(TH);cfgTagUi(false)}
/* ===== Bộ lọc đa tầng: khớp 1-1 + độ nổi bật + ngữ cảnh căn =====
   Ngưỡng chính ts = độ nhạy chọn (mặc định 80%). Ngưỡng trung bình mid = ts - 3. Ngưỡng sàn tl = ts - 6 (tối thiểu 60%).
   Ảnh mỗi cặp căn được ghép 1-1 theo điểm cao nhất (tránh 1 ảnh trùng lặp nhiều góc bên kia tạo điểm ảo),
   sau đó kiểm tra kết hợp ngữ cảnh (phường/quận, giá, diện tích, thông tin trùng) trước khi giữ hoặc loại. */
var SM={ts:80,mid:77,tl:74,strong:86,cal:0,np:0,lv:0,key:"",kept:0,cut:0,dedupCut:0,ctxCut:0,mmChecked:0,mmCut:0,mmBoost:0};
function smartCalc(thOv){
  var t=thOv!=null?thOv:TH;
  SM.ts=t;
  SM.mid=Math.max(60,t-3);
  SM.tl=Math.max(60,t-6);
  SM.strong=Math.min(93,t+6);
  SM.cal=0;SM.np=0;SM.lv=0;
  return SM}
function textScoreMap(src){
  var m={};
  textPairs(src).forEach(function(t){
    var s=0;(t.why||[]).forEach(function(w){s+=WT[w]||1});
    m[t.a+"|"+t.b]=s});
  return m}
function smartFilter(list,thOv){
  var cfg=smartCalc(thOv),ts=cfg.ts,mid=cfg.mid,tl=cfg.tl,strong=cfg.strong;
  var tMap=textScoreMap(activeItems()),g={},out=[];
  SM.kept=0;SM.cut=0;SM.dedupCut=0;SM.ctxCut=0;
  list.forEach(function(r){
    var lo=r.a.id<r.b.id?r.a:r.b,hi=r.a.id<r.b.id?r.b:r.a,k=lo.id+"|"+hi.id;
    var o=g[k]||(g[k]={lo:lo,hi:hi,r:[]});
    o.r.push(r)});
  Object.keys(g).forEach(function(k){
    var o=g[k],m1=oneToOnePairs(o.r,false);
    SM.dedupCut+=m1.dropped;
    m1=m1.filter(function(r){return r.x===r.y||r.n>=tl});
    if(!m1.length)return;
    var tsText=tMap[k]||0,ctx=pairCtx(o.lo,o.hi,tsText);
    var na=(o.lo.im||[]).filter(Boolean).length||1,nb=(o.hi.im||[]).filter(Boolean).length||1;
    var cov=m1.length/Math.max(1,Math.min(na,nb));
    var cExact=0,cVery=0,cStrong=0,cMid=0;
    m1.forEach(function(r){
      if(r.x===r.y)cExact++;
      if(r.x===r.y||r.n>=strong)cVery++;
      if(r.x===r.y||r.n>=ts)cStrong++;
      if(r.x===r.y||r.n>=mid)cMid++});
    var keepPair=false;
    if(cExact>0||cVery>=1||cStrong>=2){
      keepPair=true;
    }else if(cStrong===1&&m1.length===1){
      if(!ctx.conflict||tsText>=1||m1[0].n>=Math.min(90,ts+4))keepPair=true;
      else SM.ctxCut++;
    }else if(cStrong===1&&m1.length>=2){
      if(!ctx.conflict||cMid>=2||m1.length>=3||tsText>=1)keepPair=true;
      else SM.ctxCut++;
    }else if(cStrong===0){
      if(m1.length>=3&&!ctx.conflict&&(cMid>=2||ctx.support>=1||cov>=0.45))keepPair=true;
      else if(m1.length>=2&&cMid>=2&&ctx.support>=1&&!ctx.conflict)keepPair=true;
    }
    if(keepPair){
      m1.forEach(function(r){out.push(r);if(r.n<ts&&r.x!==r.y)SM.kept++});
    }else{
      SM.cut+=m1.length;
    }
  });
  out.rej=0;return out}
function cmpSig(a,b,th){
  if(!a||!b)return null;
  var m=dotV(a.v,b.v),x;
  if(a.t){x=dotV(a.t,b.v);if(x>m)m=x}
  if(b.t){x=dotV(a.v,b.t);if(x>m)m=x}
  if(a.t&&b.t){x=dotV(a.t,b.t);if(x>m)m=x}
  var n=Math.min(100,Math.round(m*100));
  return n>=th?{d:100-n,k:"",o:"",n:n}:null}
/* ===== Mô hình 1 (Màu lưới 4x4 + Cạnh Sobel 4x4) & Mô hình 2 (DINOv3 vùng trung tâm 75%) =====
   Chỉ chạy trên các cặp thuộc "vùng xám" (< SM.strong) để diệt nhiễu phòng mẫu khác màu/chi tiết mà giữ nguyên cache dhc11. */
var pxCache={},mcCache={},mmInflight={};
function dotN(a,b,len){var s=0,i;for(i=0;i<len;i++)s+=a[i]*b[i];return s}
function normVec(v){var i,q=0;for(i=0;i<v.length;i++)q+=v[i]*v[i];q=Math.sqrt(q)||1;for(i=0;i<v.length;i++)v[i]/=q;return v}
function extractPxSig(im,iw,ih,crop){
  var W=64,B=16,cv=document.createElement("canvas"),cx=cv.getContext("2d",{willReadFrequently:true}),px;
  cv.width=W;cv.height=W;
  cx.drawImage(im,crop.sx,crop.sy,crop.sw,crop.sh,0,0,W,W);
  try{px=cx.getImageData(0,0,W,W).data}catch(e){return null}
  var gray=new Float32Array(W*W),col=new Float32Array(48),edge=new Float32Array(64);
  var i,r,c,p,bx,by,bi,sumL=0,sumC1=0,sumC2=0;
  for(r=0;r<W;r++){
    by=(r/B)|0;
    for(c=0;c<W;c++){
      bx=(c/B)|0;bi=(by*4+bx)*3;p=(r*W+c)*4;
      var R=px[p],G0=px[p+1],B0=px[p+2];
      var L=R*0.299+G0*0.587+B0*0.114,C1=R-B0,C2=G0-0.5*(R+B0);
      gray[r*W+c]=L;
      col[bi]+=L*0.65;col[bi+1]+=C1*1.15;col[bi+2]+=C2*1.15;
      sumL+=L;sumC1+=C1;sumC2+=C2;
    }
  }
  for(i=0;i<48;i++)col[i]/=256;
  normVec(col);
  for(r=1;r<W-1;r++){
    by=(r/B)|0;
    for(c=1;c<W-1;c++){
      bx=(c/B)|0;bi=(by*4+bx)*4;
      var gx=gray[r*W+c+1]-gray[r*W+c-1],gy=gray[(r+1)*W+c]-gray[(r-1)*W+c];
      edge[bi]+=Math.abs(gx);
      edge[bi+1]+=Math.abs(gy);
      edge[bi+2]+=Math.abs(gx+gy)*0.707;
      edge[bi+3]+=Math.abs(gx-gy)*0.707;
    }
  }
  normVec(edge);
  var np=W*W;
  return{col:col,edge:edge,mc0:sumL/np,mc1:sumC1/np,mc2:sumC2/np}
}
function extractMultiCrop(im,crop){
  if(!(DW.w||DINO.m))return Promise.resolve(null);
  var cv=document.createElement("canvas"),cx=cv.getContext("2d",{willReadFrequently:true});
  cv.width=DS;cv.height=DS;
  var sx=crop.sx+Math.round(crop.sw*0.125),sy=crop.sy+Math.round(crop.sh*0.125);
  var sw=Math.max(16,Math.round(crop.sw*0.75)),sh=Math.max(16,Math.round(crop.sh*0.75));
  var px=grab(cx,im,sx,sy,sw,sh);
  return inferPx(px).then(function(b64){return decVec(b64)},function(){return null});
}
function verifyImgOf(s,wantMc){
  if(pxCache[s]!==undefined&&(!wantMc||mcCache[s]!==undefined))return Promise.resolve({px:pxCache[s],mc:mcCache[s]||null});
  var key=s+"|"+(wantMc?1:0);
  if(mmInflight[key])return mmInflight[key];
  var p=new Promise(function(res){
    var u=imgSrc(s,256),isLh=u.indexOf("https://lh3.googleusercontent.com/")===0;
    var im=new Image(),done=false;
    if(isLh)im.crossOrigin="anonymous";
    im.referrerPolicy="no-referrer";
    function fin(v){if(done)return;done=true;clearTimeout(tm);delete mmAbort[key];delete mmInflight[key];im.onload=im.onerror=null;try{im.src=""}catch(e){}res(v)}
    var tm=setTimeout(function(){fin(null)},6000);
    mmAbort[key]=function(){fin(null)};
    im.onload=function(){
      if(done)return;
      var iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;
      if(!iw||!ih){fin(null);return}
      var ori=iw>=ih?"L":"P",gw=ori==="L"?144:108,gh=ori==="L"?104:144,cv=document.createElement("canvas"),cx=cv.getContext("2d",{willReadFrequently:true}),st,bar=null;
      cv.width=gw;cv.height=gh;cx.drawImage(im,0,0,gw,gh);
      try{st=lumaStats(cx.getImageData(0,0,gw,gh).data,gw*gh);bar=detectBars(st.gray,gw,gh,ori,iw,ih)}catch(e){bar=null}
      var crop=bar||{sx:0,sy:0,sw:iw,sh:ih};
      var px=pxCache[s]!==undefined?pxCache[s]:extractPxSig(im,iw,ih,crop);
      pxCache[s]=px;
      if(!wantMc||mcCache[s]!==undefined){fin({px:px,mc:mcCache[s]||null});return}
      extractMultiCrop(im,crop).then(function(mc){
        if(mc)mcCache[s]=mc;
        fin({px:px,mc:mc||null});
      },function(){fin({px:px,mc:null})});
    };
    im.onerror=function(){fin(null)};
    im.src=isLh?(u+"?dh=3"):u;
  });
  mmInflight[key]=p;return p}
function verifyGrayZonePairs(list,isScan){
  if(!MM_MODE||!list.length)return Promise.resolve(list);
  var cfg=smartCalc(),ts=cfg.ts,tl=cfg.tl,strong=cfg.strong;
  var tMap=textScoreMap(activeItems()),pairCnt={},grayPairs=[];
  list.forEach(function(r){
    var loId=r.a.id<r.b.id?r.a.id:r.b.id,hiId=r.a.id<r.b.id?r.b.id:r.a.id,k=loId+"|"+hiId;
    pairCnt[k]=(pairCnt[k]||0)+1;
    if(r.x!==r.y&&r.n<strong)grayPairs.push(r);
  });
  SM.mmChecked=0;SM.mmCut=0;SM.mmBoost=0;
  if(!grayPairs.length)return Promise.resolve(list);
  var cap=80,workPairs=grayPairs.slice(0,cap),uniq={},urls=[];
  workPairs.forEach(function(r){if(!uniq[r.x]){uniq[r.x]=1;urls.push(r.x)}if(!uniq[r.y]){uniq[r.y]=1;urls.push(r.y)}});
  var wantMc=MM_MODE>=2,modelReady=!!(DW.w||DINO.m);
  var prepMc=(wantMc&&!modelReady&&navigator.onLine!==false)?dinoLoad().then(function(){return true},function(){return false}):Promise.resolve(modelReady);
  return prepMc.then(function(canMc){
    if(stopFlag&&scanning)return list;
    if(isScan&&!stopFlag)msg("Đang xác minh đa mô hình ("+workPairs.length+" cặp vùng xám)…");
    var idx=0;
    function w(){
      if((stopFlag&&scanning)||idx>=urls.length)return Promise.resolve();
      var u=urls[idx++];
      return verifyImgOf(u,wantMc&&canMc).then(w);
    }
    return Promise.all(spawnW(w)).then(function(){
      if(stopFlag&&scanning)return list;
      var workSet={},kept=[];
      workPairs.forEach(function(r){workSet[r.a.id+"|"+r.b.id+"|"+r.x+"|"+r.y]=1});
      list.forEach(function(r){
        var rk=r.a.id+"|"+r.b.id+"|"+r.x+"|"+r.y;
        if(!workSet[rk]){kept.push(r);return}
        var fa=pxCache[r.x],fb=pxCache[r.y];
        if(!fa||!fb){kept.push(r);return}
        SM.mmChecked++;
        var colCos=dotN(fa.col,fb.col,48),edgeCos=dotN(fa.edge,fb.edge,64);
        var gGap=Math.abs(fa.mc1-fb.mc1)+Math.abs(fa.mc2-fb.mc2);
        var pxScore=Math.round((colCos*0.58+edgeCos*0.42)*100);
        var ma=mcCache[r.x],mb=mcCache[r.y];
        var mcSim=(ma&&mb)?Math.min(100,Math.round(dotV(ma,mb)*100)):null;
        var loId=r.a.id<r.b.id?r.a.id:r.b.id,hiId=r.a.id<r.b.id?r.b.id:r.a.id,hk=loId+"|"+hiId;
        var tsText=tMap[hk]||0,nInPair=pairCnt[hk]||1;
        var colorBad=colCos<0.72||(colCos<0.78&&gGap>34);
        var edgeBad=edgeCos<0.56;
        var mcBad=mcSim!==null&&mcSim<Math.max(58,ts-7);
        var pxGood=colCos>=0.85&&edgeCos>=0.72;
        var mcGood=mcSim!==null&&mcSim>=ts;
        var drop=false;
        if(colorBad&&(edgeBad||mcBad||r.n<ts+2))drop=true;
        else if(mcBad&&!pxGood&&r.n<ts+3)drop=true;
        else if(nInPair===1&&tsText<1&&r.n<ts+2&&(colCos<0.79||(mcSim!==null&&mcSim<ts-3)))drop=true;
        if(drop){SM.mmCut++;return}
        if(pxGood||mcGood){
          var ens=mcSim!==null?Math.round(r.n*0.55+mcSim*0.30+pxScore*0.15):Math.round(r.n*0.80+pxScore*0.20);
          ens=Math.max(Math.max(tl,r.n-1),Math.min(99,Math.min(r.n+4,ens)));
          r={a:r.a,b:r.b,x:r.x,y:r.y,n:ens,d:100-ens,k:(mcGood&&pxGood)?"2m":(mcGood?"mc":"px"),o:r.o};
          SM.mmBoost++;
        }
        kept.push(r);
      });
      var cutN=SM.mmCut;
      var finalOut=cutN?smartFilter(kept):kept;
      finalOut.rej=cutN;
      return finalOut;
    });
  });
}
function verifyList(list,isScan){
  var pre=smartFilter(list);
  return verifyGrayZonePairs(pre,isScan);
}
/* ===== So khớp ảnh theo từng lượt BATCH căn, lưu kết quả để lần sau chỉ so ảnh mới ===== */
var BATCH=20,FAIL_TTL=300000,PM_KEY="dpm6"+(DS===256?"":"r"+DS)+(F16?"":"x"),pm=null,pmLoaded=false,pmP=null,sigMemo={};
function sigOf(s){var v=sigMemo[s];if(v!==undefined)return v;var c=cache[s];v=c?parseSig(c):null;if(c!==undefined)sigMemo[s]=v;return v}
function pmEmpty(){return{th:TH,vf:VL,cal:smartCalc().cal,algo:ALGO_VER,mm:MM_MODE,done:{},pairs:[],seen:{},fail:{}}}
function pmStale(){return pm.th!==TH||(pm.vf||0)!==VL||(pm.cal||0)!==smartCalc().cal||(pm.algo||0)<ALGO_VER||(pm.mm!==undefined?pm.mm:2)!==MM_MODE}
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
    return verifyList(out,true)}
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
var scanDoneWaiters=[];
function waitScanStop(){if(!scanning)return Promise.resolve();stopScan();return new Promise(function(r){scanDoneWaiters.push(r)})}
function scan(auto){
  if(scanning)return;
  var cnt=0;activeItems().forEach(function(it){(it.im||[]).forEach(function(s){if(s)cnt++})});
  if(cnt<2){msg("Chưa đủ ảnh để so.");return}
  scanning=true;stopFlag=false;G("dupimg").disabled=true;G("dupstop").hidden=false;G("dupbar").hidden=false;
  var bar=G("dupbar").firstChild,stopP=new Promise(function(r){stopWaiters=[r]}),badSet={},offErr=false,t={ok:0,bad:0,flat:0,nL:0,nP:0,newPairs:0,căn:0};
  SP.n=0;SP.ms=0;SP.t0=0;modelFail=null;dinoErr=null;G("dupstop").disabled=false;bar.style.transition="none";bar.style.width="0";void bar.offsetWidth;bar.style.transition="";
  function end(){
    savePm();saveCache();hsPushSoon();
    scanning=false;stopWaiters=[];G("dupimg").disabled=false;G("dupstop").disabled=false;G("dupstop").hidden=true;G("dupbar").hidden=true;
    pairsFromPm();
    render();
    var extra=[],np=pendingItems().length,pendTxt=np&&!stopFlag?" · còn "+np+" căn chưa so":"";
    if(t.bad)extra.push(t.bad+" ảnh không đọc được");
    if(t.flat)extra.push(t.flat+" ảnh trơn ít chi tiết");
    var exTxt=extra.length?" ("+extra.join(" · ")+")":"";
    if(offErr){if(!auto)msg("Đang offline, chưa có đủ hash để quét ảnh mới.",1)}
    else if(dinoErr){msg("Không tải được DINOv3 (cần mạng lần đầu).",1);dinoErr=null}
    else if(stopFlag)msg("Đã dừng · so "+t["căn"]+" căn · "+imgPairs.length+" cặp ảnh giống");
    else if(modelFail&&t.ok===0)msg("Lỗi chạy mô hình DINOv3: "+(modelFail.message||modelFail),1);
    else if(t.bad&&t.ok===0)msg("Hầu hết ảnh không đọc được.",1);
    else if(!t["căn"])msg("Không có căn mới · "+imgPairs.length+" cặp ảnh giống"+pendTxt);
    else msg("Đã so "+t["căn"]+" căn mới · "+imgPairs.length+" cặp ảnh giống"+exTxt+pendTxt);
    var sdw=scanDoneWaiters;scanDoneWaiters=[];sdw.forEach(function(f){try{f()}catch(e){}});
    if(hsPendR){var pr=hsPendR;hsPendR=null;hsRefresh(pr)}}
  function batch(total){
    if(stopFlag)return Promise.resolve(false);
    var pend=pendingItems(badSet);
    if(!pend.length)return Promise.resolve(false);
    var B=pend.slice(0,BATCH),newJ=[],urls=[],seenU={},Bid={},now=Date.now();
    B.forEach(function(it){Bid[it.id]=1;(it.im||[]).forEach(function(s){if(!s)return;newJ.push({it:it,s:s});if(!pm.done[s]&&!badSet[s]&&!isFailCool(pm.fail&&pm.fail[s],now)&&!seenU[s]){seenU[s]=1;urls.push(s)}})});
    var idx=0,got={},flat={},doneU=0;
    function worker(){
      if(stopFlag||idx>=urls.length)return Promise.resolve();
      var u=urls[idx++];
      return hashOf(u).then(function(h){
        if(h===undefined)return;
        if(h){var sg=sigOf(u)||parseSig(h);if(sg){got[u]=1;t.ok++;if(sg.ori==="L")t.nL++;else t.nP++}}
        else if(h===null){badSet[u]=1;t.bad++;if(!modelFail){pm.fail=pm.fail||{};var cf=pm.fail[u];pm.fail[u]={n:(cf&&typeof cf==="object"?cf.n:0)+1,t:Date.now()}}}
        else{flat[u]=1;t.flat++}
        doneU++;var cur=t["căn"]+B.length*(doneU/Math.max(1,urls.length));
        bar.style.width=Math.min(100,cur/total*100)+"%";
        msg("Đang so ảnh "+Math.min(total,Math.floor(cur))+"/"+total+" căn…"+spTxt())
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
        pm.th=TH;pm.vf=VL;pm.cal=SM.cal;pm.algo=ALGO_VER;pm.mm=MM_MODE;t.newPairs+=out.length;t["căn"]+=B.length;
        savePm();
        bar.style.width=Math.min(100,t["căn"]/total*100)+"%";
        return true})})}
  function run(total){return batch(total).then(function(more){if(more&&!stopFlag)return run(total)})}
  if(hsPhase&&navigator.onLine!==false)msg("Đang đồng bộ hash…");
  Promise.all([loadCache(),loadPm(),navigator.onLine===false?Promise.resolve():Promise.race([hsWait(),stopP])]).then(function(){
    if(stopFlag)return;
    SM.key="";if(hsPendR){if(hsPendR.chg){pm=pmEmpty();savePm()}hsPendR=null}   // hash vừa đổi theo máy chủ: quét lại từ hash mới
    if(pmStale()){pm=pmEmpty();savePm()}
    if(!auto)pm.fail={};
    var pendList=pendingItems(),total=pendList.length;
    if(!total){return}
    var needModel=pendList.some(function(it){return (it.im||[]).some(function(s){return s&&!pm.done[s]&&cache[s]===undefined})});
    if(needModel&&navigator.onLine===false){offErr=true;return}
    return Promise.race([
      needModel?dinoLoad().then(function(){return 0},function(e){if(!stopFlag)dinoErr=e||new Error("lỗi không rõ");return 1}):Promise.resolve(0),
      stopP.then(function(){return 2})
    ]).then(function(r){if(r!==0)return;msg("Đang so ảnh 0/"+total+" căn…");return run(total)})
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
var dpPgT=0,dpEnT=0;
function dpPage(el,cls){if(!el)return;el.classList.remove("dp-fwd","dp-back");void el.offsetWidth;el.classList.add(cls);clearTimeout(dpPgT);dpPgT=setTimeout(function(){el.classList.remove("dp-fwd","dp-back")},260)}
function dpEnter(){var l=G("dupl");if(!l)return;l.classList.remove("enter");void l.offsetWidth;l.classList.add("enter");clearTimeout(dpEnT);dpEnT=setTimeout(function(){var el=G("dupl");if(el)el.classList.remove("enter")},400)}
function goMain(){showIgn=false;render();G("dupd").scrollTop=0;dpPage(G("dupmain"),"dp-back")}
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
  G("dupd").addEventListener("close",close);   /* Esc / nút Back đóng hộp thoại không qua nút ✕: vẫn phải dừng quét */
  G("dupd").addEventListener("cancel",function(e){
    if(closeZoom()){e.preventDefault();return}
    if(showIgn){e.preventDefault();goMain()}
  });
  function cfgDirtyUi(dirty,text,cls){
    var e=G("dupengnote"),b=G("dupsave");
    cfgTagUi(dirty);
    if(b){b.classList.toggle("dirty",!!dirty);b.textContent=dirty?"Lưu & quét lại ảnh *":"Lưu & quét lại ảnh"}
    if(!e)return;
    if(text){e.className="dpst dpfull"+(cls?" "+cls:"");e.textContent=text;e.hidden=false}
    else if(dirty){e.className="dpst dpfull";e.textContent="Có thay đổi cài đặt — bấm «Lưu & quét lại ảnh» để áp dụng.";e.hidden=false}
    else{e.className="dpst dpfull";e.textContent="";e.hidden=true}
  }
  function syncSensDraft(){
    var i=G("dupth"),s=G("dupsens");if(!i||!s)return;
    var v=Math.round(+i.value);
    s.value=(v===87||v===80||v===77||v===73)?String(v):"custom";
  }
  function applyEngineSettings(newEng){
    var oldCacheKey=CACHE_KEY,oldGpu=DINO_GPU,oldDs=DS,oldF16=F16;
    ENG=newEng;engSave();
    MM_MODE=(newEng.mm===0||newEng.mm===1||newEng.mm===2)?newEng.mm:2;
    F16=window.DUP_DINO_F16!==undefined?window.DUP_DINO_F16!==false:ENG.f16!==false;
    DS=(function(){var r=+window.DUP_DINO_RES||+ENG.res;return(r>=112&&r<=448&&r%16===0)?r:224})();
    DINO_GPU=window.DUP_DINO_GPU!==undefined?window.DUP_DINO_GPU!==false:ENG.dev!=="cpu";
    BN=window.DUP_DINO_BN>0?Math.min(8,+window.DUP_DINO_BN|0):(ENG.bn===0?(DS<=160?4:(DS<=224?2:1)):(ENG.bn>0?Math.min(8,ENG.bn|0):4));
    PACE=window.DUP_DINO_PACE>=0?+window.DUP_DINO_PACE:(ENG.pace>=0?+ENG.pace:0.6);
    var newCacheKey="dhc11"+(DS===256?"":"r"+DS)+(F16?"":"x");
    var newPmKey="dpm6"+(DS===256?"":"r"+DS)+(F16?"":"x");
    var keyChanged=newCacheKey!==oldCacheKey;
    var modelReset=keyChanged||DS!==oldDs||F16!==oldF16||DINO_GPU!==oldGpu;
    if(modelReset){
      if(cacheLoaded)saveCache();
      if(pmLoaded&&pm)savePm();
      failPend(new Error("Cấu hình mô hình đã thay đổi"));
      killWorker();
      DINO.p=null;DINO.m=null;DINO.err=null;
      DW.dev="";DW.gpu=false;DW.q=[];DW.busy=false;
      if(DW.tm){clearTimeout(DW.tm);DW.tm=0}
      mcCache={};
    }
    if(keyChanged){
      CACHE_KEY=newCacheKey;PM_KEY=newPmKey;
      cacheLoaded=false;cacheP=null;cache={};
      pmLoaded=false;pmP=null;pm=null;
      imgPairs=null;sigMemo={};
      hs=null;hsP=null;hsPendR=null;SM.key="";
    }
    return{keyChanged:keyChanged,modelReset:modelReset};
  }
  function applyAndSaveSettings(){
    var sb=G("dupsave");if(sb)sb.disabled=true;
    return waitScanStop().then(function(){
      var rawTh=Math.round(+G("dupth").value);
      var newTh=(rawTh>=60&&rawTh<=99)?thNorm(rawTh):TH;
      var newImgV=G("dupimgv").value;
      var newSkip=!!G("dupnoout").checked;
      var paceRaw=+G("duppace").value;
      var bnRaw=+G("dupbn").value;
      var mmEl=G("dupmm"),newMm=mmEl?(+mmEl.value|0):MM_MODE;
      if(newMm!==0&&newMm!==1&&newMm!==2)newMm=2;
      var newEng={
        res:+G("dupres").value||224,
        f16:G("duppre").value==="16",
        dev:G("dupdev").value==="cpu"?"cpu":"auto",
        bn:isNaN(bnRaw)?4:(bnRaw|0),
        pace:isNaN(paceRaw)?0.6:paceRaw,
        mm:newMm
      };
      var thChanged=newTh!==TH;
      var skipChanged=newSkip!==skipOut;
      var mmChanged=newMm!==MM_MODE;
      TH=newTh;imgAutoMode=(newImgV==="both"||newImgV==="stack")?newImgV:"manual";skipOut=newSkip;
      try{ls("dsim",String(TH));ls("dimgv",imgAutoMode);ls("dnoout",skipOut?"1":"0")}catch(e){}
      thUi();
      var engInfo=applyEngineSettings(newEng);
      engUi();
      openImgSet={};pairImgMode={};limMain=LIMIT;SM.key="";items=N().items();
      if(sb)sb.disabled=false;
      if(engInfo.keyChanged)hsPull();
      return Promise.all([loadCache(),loadPm()]).then(function(){
        if(thChanged||skipChanged||mmChanged||engInfo.keyChanged){
          pm=pmEmpty();pmLoaded=true;pmP=null;
          savePm();imgPairs=null;
        }
        render();
        cfgDirtyUi(false,"Đã lưu cài đặt.","ok");
        scan();
      });
    },function(){if(sb)sb.disabled=false});
  }
  G("dupsens").onchange=function(){
    if(this.value==="custom"){G("dupth").focus();cfgDirtyUi(true);return}
    var i=G("dupth");if(i)i.value=this.value;
    cfgDirtyUi(true);
  };
  G("dupth").oninput=function(){syncSensDraft();cfgDirtyUi(true)};
  G("dupth").onchange=function(){
    var v=Math.round(+this.value);
    if(!(v>=60&&v<=99))this.value=String(TH);
    syncSensDraft();cfgDirtyUi(true);
  };
  G("dupimgv").onchange=function(){cfgDirtyUi(true)};
  G("dupmm").onchange=function(){cfgDirtyUi(true)};
  G("dupnoout").onchange=function(){cfgDirtyUi(true)};
  G("dupres").onchange=function(){cfgDirtyUi(true)};
  G("duppre").onchange=function(){cfgDirtyUi(true)};
  G("dupdev").onchange=function(){cfgDirtyUi(true)};
  G("dupbn").onchange=function(){cfgDirtyUi(true)};
  G("duppace").onchange=function(){cfgDirtyUi(true)};
  G("dupsave").onclick=function(){applyAndSaveSettings()};
  G("dupanalyze").onclick=function(){
    var ab=G("dupanalyze");if(ab){ab.disabled=true;ab.textContent="Đang phân tích…"}
    cfgDirtyUi(false,"Đang phân tích nhiều ngưỡng trên hash đã lưu…");
    analyzeThresholds().then(function(res){
      if(ab){ab.disabled=false;ab.textContent="Phân tích đa ngưỡng"}
      if(!res||!res.ok){cfgDirtyUi(false,(res&&res.msg)||"Chưa phân tích được.","bad");return}
      cfgDirtyUi(false,res.summary,"ok");
    },function(){
      if(ab){ab.disabled=false;ab.textContent="Phân tích đa ngưỡng"}
      cfgDirtyUi(false,"Lỗi khi phân tích đa ngưỡng.","bad");
    });
  };
  G("duprst").onclick=function(){
    zlay=null;try{ls("dzl","");ls("dnoout","")}catch(e){}
    var s=G("dupsens"),t=G("dupth"),iv=G("dupimgv"),no=G("dupnoout");
    if(s)s.value="80";if(t)t.value="80";if(iv)iv.value="manual";if(no)no.checked=true;
    engUi(1);
    applyAndSaveSettings();
  };
  G("dupimg").onclick=function(){items=N().items();scan()};
  G("dupstop").onclick=stopScan;
  G("duptog").onclick=function(){showOne=!showOne;render()};
  G("dupigntog").onclick=function(){showIgn=true;render();G("dupd").scrollTop=0;dpPage(G("dupignview"),"dp-fwd")};
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
function evalPairsAtTh(rawList,ts,src,byId){
  var filtered=smartFilter(rawList,ts),P={};
  filtered.forEach(function(r){
    var a=byId[r.a.id],b=byId[r.b.id];if(!a||!b)return;
    var o=addP(P,a,b,"img");if(!o)return;
    var sw=o.a.id!==r.a.id;
    o.img.push(sw?{x:r.y,y:r.x,d:r.d,k:r.k||"",o:r.o||"",n:r.n}:{x:r.x,y:r.y,d:r.d,k:r.k||"",o:r.o||"",n:r.n});
  });
  filterGenericImgs(P,src.length,ts);
  var imgHousePairs=0,totalImgEdges=0;
  Object.keys(P).forEach(function(k){if(P[k].img.length){imgHousePairs++;totalImgEdges+=P[k].img.length}});
  return{th:ts,housePairs:imgHousePairs,imgPairs:totalImgEdges};
}
function analyzeThresholds(){
  items=N().items();
  return loadCache().then(function(){
    var src=activeItems(),byId={},allJ=[],A=[];
    src.forEach(function(it){
      byId[it.id]=it;
      (it.im||[]).forEach(function(s){
        if(!s)return;
        var sg=sigOf(s);
        if(sg){allJ.push({it:it,s:s});A.push(sg)}
      });
    });
    if(allJ.length<2){
      return{ok:false,imgs:allJ.length,msg:"Chưa đủ hash ảnh trên máy ("+allJ.length+" ảnh). Hãy bấm «Quét ảnh trùng» trước."};
    }
    var raw=[],seen={},p=0,FLOOR=64;
    function step(){
      var end=Math.min(p+25,allJ.length),j,a,b,m,k;
      for(;p<end;p++){
        b=allJ[p];
        for(j=0;j<p;j++){
          a=allJ[j];
          if(a.it.id===b.it.id)continue;
          m=a.s===b.s?{d:0,n:100,k:"",o:A[p].ori}:cmpSig(A[j],A[p],FLOOR);
          if(m){
            k=a.it.id+"|"+b.it.id+"|"+a.s+"|"+b.s;
            if(!seen[k]){seen[k]=1;raw.push({a:a.it,b:b.it,x:a.s,y:b.s,d:m.d,k:m.k,o:m.o||"",n:m.n})}
          }
        }
      }
      if(p<allJ.length)return new Promise(function(r){setTimeout(r,0)}).then(step);
      var tiers=[87,84,80,77,73,70],res=[];
      tiers.forEach(function(t){res.push(evalPairsAtTh(raw,t,src,byId))});
      var elbow=null,best=80;
      for(var i=0;i<res.length-1;i++){
        var cur=res[i],nxt=res[i+1];
        if(nxt.housePairs>=Math.max(cur.housePairs*2.2,cur.housePairs+8)){
          elbow=nxt.th;best=cur.th;break;
        }
      }
      if(!elbow){
        var r80=res[2],r77=res[3];
        best=(r77.housePairs<=r80.housePairs+Math.max(6,Math.round(r80.housePairs*0.4)))?77:80;
      }
      var parts=res.map(function(x){return x.th+"%: "+x.housePairs+" cặp"});
      var txt="Phân tích đa ngưỡng ("+allJ.length+" ảnh đã cache): "+parts.join(" · ")+(elbow?" · Nhiễu tăng mạnh từ ≤"+elbow+"%":"")+" · Gợi ý tối ưu: "+best+"%.";
      return{ok:true,imgs:allJ.length,rawEdges:raw.length,tiers:res,elbow:elbow,recommended:best,summary:txt};
    }
    return Promise.resolve().then(step);
  });
}
function open(nt){
  if(nt)NT=nt;
  if(!N()){alert("Ứng dụng đang tải, thử lại sau vài giây.");return}
  init(N());
  undoSt=[];undoUi();
  loadSkip();
  loadImgMode();
  thUi();
  G("dupimgv").value=imgAutoMode;
  G("dupnoout").checked=skipOut;
  engUi();
  var sb=G("dupsave"),en=G("dupengnote");
  if(sb){sb.classList.remove("dirty");sb.textContent="Lưu & quét lại ảnh"}
  if(en){en.hidden=true;en.textContent="";en.className="dpst dpfull"}
  items=N().items();cleanImgPairs();limMain=limIgn=LIMIT;openSet={};openImgSet={};pairImgMode={};pairImgMsg={};cmpAll={};zoomCmp=null;showIgn=false;msg(imgPairs&&imgPairs.length?imgPairs.length+" cặp ảnh giống":"");G("dupbar").hidden=!scanning;G("dupstop").hidden=!scanning;G("dupz").hidden=true;render();dpEnter();if(scanning)msg("Đang dừng lượt quét trước…");
  if(!G("dupd").open)G("dupd").showModal();G("dupd").scrollTop=0;
  loadCache().then(function(){if(G("dupd").open&&!scanning){if(imgPairs===null)applyCachedPairs();autoScan()}});
  pullIgnored(false);hsPull()}
function close(){
  stopScan();zoomCmp=null;undoSt=[];undoUi();
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

window.Dup={retire:function(){return retList().map(function(x){return x.c})},ignStat:function(){return ignStat()},smart:function(){loadImgMode();var s=smartCalc();return{th:TH,ts:s.ts,mid:s.mid,tl:s.tl,strong:s.strong,algo:ALGO_VER,mm:MM_MODE,np:s.np,lv:s.lv,cal:s.cal,kept:s.kept,cut:s.cut,dedupCut:s.dedupCut,ctxCut:s.ctxCut,mmChecked:s.mmChecked,mmCut:s.mmCut,mmBoost:s.mmBoost}},analyze:analyzeThresholds,keys:function(){return{h:CACHE_KEY,p:PM_KEY}},cached:function(){return cacheLoaded?Object.keys(cache).length:-1},dino:function(){
    if(DW.w)return"worker/"+DW.dev+" x"+BN+" res"+DS;
    if(DINO.m)return"main/wasm x"+BN+" res"+DS;
    if(DINO.p)return"đang tải";
    if(DINO.err)return"lỗi: "+DINO.err;
    return"chưa tải (chưa cần)"},dinoLoad:function(){return dinoLoad().then(function(){return window.Dup.dino()},function(e){return"lỗi: "+(e&&e.message||e)})},pull:function(f){var p=pullIgnored(f);if(f)hsPull();return p},init:init,open:open,close:close,sync:sync,closeZoom:closeZoom};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){init()});
else init();
})();
