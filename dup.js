/* dup.js: công cụ "Kiểm tra trùng" (trùng thông tin và trùng ảnh) cho app Tìm nhà thuê.
   Hoạt động trực tiếp với index.html chỉ cần khai báo window.NT và <script src="dup.js" defer></script>.
   Quy tắc: báo cặp đạt từ 2 điểm điều kiện trở lên ("Cùng link tin đăng" = 2 điểm) hoặc có trùng ảnh (ưu tiên hiện đầu tiên). */
(function(){
"use strict";
var G=function(i){return document.getElementById(i)};
var NT=null,inited=false,KV=1;   // KV: phiên bản cầu nối NT mà dup.js này cần
function N(){return NT||window.NT}
function esc(s){return N().esc(s)}
function su(u){return N().su(u)}
function imgSrc(s,w){return N().imgSrc(s,w)}
function addrOf(it){return N().addrOf(it)}
function stName(k){return N().stName(k)}
function fmt(x){return N().fmt(x)}
function ls(k,v){return N().ls(k,v)}
var items=[];
var CSS=".dphdr{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:3px 0 12px}\n.dphdr h1{margin:0;min-width:0;font-size:clamp(19px,5.5vw,26px)}\n.dphdr+.sub{color:var(--mute);font-size:var(--fs-s);margin:-6px 0 12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n@media (max-height:820px){.dphdr+.sub{display:none}}\n.dpbtn,.dpbtn:hover,.dpbtn:focus,.dpbtn:active{text-decoration:none}\n.dpbtn{flex:none;display:inline-flex;align-items:center;min-height:34px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:var(--fs-s);font-weight:700;cursor:pointer;white-space:nowrap;transition:transform .1s ease,background-color .15s ease,border-color .15s ease,color .15s ease,box-shadow .15s ease}\n.dpbtn:active{transform:scale(.96)}\n#dupl,#dupignl,.dpc,.dprow{min-width:0}\n#dupmain[hidden],#dupignview[hidden],.dpbar2[hidden],.dpignbar[hidden],.dpviewbar[hidden],.dpseg[hidden],.dpsegbtn[hidden],.dpapply[hidden],.dpdet[hidden],.dpimgs[hidden],.dpz[hidden],.dpzctrl[hidden],.dpzstage img[hidden],.dpzempty[hidden]{display:none}\n.dpc{border:1px solid var(--line);border-left:4px solid var(--mute);border-radius:12px;padding:2px 10px 8px;margin-top:6px;background:var(--surface)}\n.dpc.im{border-left-color:var(--danger)}\n.dpc.pu{border-left-color:#7c3aed}\n.dpc.gr{border-left-color:#9ca3af}\n.dprow{display:flex;align-items:center;gap:6px}\n.dprow+.dprow{border-top:1px dashed var(--line)}\n.dpr{display:flex;gap:8px;align-items:center;justify-content:space-between;flex:1;min-width:0;padding:6px 0}\n.dpt{min-width:0;flex:1;overflow:hidden}.dpt b{display:block;font-size:var(--fs-b);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpt small{display:block;color:var(--mute);font-size:var(--fs-s);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpedit,.dpdel{flex:none;border:1px solid var(--line);background:var(--bg);border-radius:8px;padding:3px 8px;min-height:28px;font-size:var(--fs-s);font-weight:600;cursor:pointer;white-space:nowrap}\n.dpedit{color:var(--accent)}\n.dpdel{color:var(--danger)}\n.dpdel:disabled{opacity:.5;cursor:default}\n.dpw{display:flex;flex-wrap:wrap;gap:4px;margin-top:2px}\n.dpw span{font-size:var(--fs-s);font-weight:600;padding:2px 9px;border-radius:999px;background:var(--bg);border:1px solid var(--line);color:var(--ink)}\n.dpw span.im{background:var(--danger);border-color:var(--danger);color:#fff}\n.dpn[data-tog],.dpw[data-tog]{cursor:pointer}\n.dpm{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;margin-top:6px}\n.dpm div{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:2px;cursor:zoom-in;min-width:0}\n.dpm img{width:100%;height:56px;object-fit:cover;border-radius:6px;background:var(--line);display:block}\n.dpbar2{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0}\n.dpignbtn{border:1px solid var(--s-contact);background:var(--b-contact);color:var(--s-contact);border-radius:999px;padding:4px 12px;min-height:32px;font-size:var(--fs-s);font-weight:700;cursor:pointer}\n.dphead{display:flex;align-items:center;gap:10px;flex-wrap:wrap}\n.dphead h2{margin:0}\n.dphead .btn{min-height:34px;padding:5px 10px}\n.dpopt{display:inline-flex;align-items:center;gap:6px;font-size:var(--fs-s);font-weight:600;color:var(--ink);cursor:pointer;margin:0}\n.dpopt input{width:auto;min-height:0;accent-color:var(--accent)}\n.dpb{height:6px;border-radius:3px;background:var(--line);overflow:hidden}\n.dpb i{display:block;height:100%;width:0;background:var(--accent);transition:width .35s cubic-bezier(.16,1,.3,1)}\n.dpc.im .dpn{color:var(--danger)}\n.dpc.pu .dpn{color:#7c3aed}\n.dpn{font-size:var(--fs-s);font-weight:700;color:var(--ink);margin:5px 0 3px}\n.dpa{margin-top:6px;display:flex;align-items:center;gap:5px;flex-wrap:wrap}\n.dpno{border:1px solid var(--s-contact);background:var(--b-contact);color:var(--s-contact);border-radius:999px;padding:4px 11px;min-height:30px;font-size:var(--fs-s);font-weight:700;cursor:pointer}\n.dpno.undo{color:var(--ink);border-color:var(--line);background:var(--bg)}\n.dpchk{border:1px solid var(--s-seen);background:var(--b-seen);color:var(--s-seen);border-radius:999px;padding:4px 11px;min-height:30px;font-size:var(--fs-s);font-weight:700;cursor:pointer}\n.dpchk:disabled{opacity:.6;cursor:default}\n.dpimgbtn{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:999px;padding:4px 11px;min-height:30px;font-size:var(--fs-s);font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:4px}\n.dpimgbtn[aria-expanded=\"true\"]{background:var(--s-new);border-color:var(--s-new);color:var(--surface)}\n.dpimgbtn:disabled{opacity:.55;cursor:default}\n.dpv{font-size:var(--fs-s);font-weight:600;margin-left:auto}\n.dpst{margin:4px 0 0;font-size:var(--fs-s);color:var(--mute)}\n.dpst.ok{color:var(--s-won);font-weight:700}\n.dpst.bad{color:var(--danger);font-weight:700}\n.dpdet,.dpimgs{margin-top:8px;padding-top:8px;border-top:1px dashed var(--line)}\n.dpimgbar{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px}\n.dpimgbar b{font-size:var(--fs-s);color:var(--ink)}\n.dpimgbar select{width:auto;min-width:165px;min-height:32px;padding:3px 8px;font-size:var(--fs-s);border-radius:8px}\n.dpcmps{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;align-items:stretch}\n.dpcmps.stack,.dpcmps.single{grid-template-columns:minmax(0,1fr)}\n.dpcmp{border:1px solid var(--line);border-radius:10px;padding:7px;background:var(--bg);min-width:0;display:flex;flex-direction:column}\n.dpcmph{display:flex;align-items:baseline;justify-content:space-between;gap:6px;margin-bottom:4px;min-width:0}\n.dpcmph b{font-size:var(--fs-s);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}\n.dpcmph span{flex:none;font-size:11px;font-weight:700;color:var(--mute)}\n.dpcmpm{font-size:11px;color:var(--mute);margin:0 0 6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-height:15px}\n.dpthumbs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px}\n.dpcmps.stack .dpthumbs,.dpcmps.single .dpthumbs{grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:6px}\n@media (min-width:600px){.dpcmps.both .dpthumbs{grid-template-columns:repeat(3,minmax(0,1fr))}}\n.dpth{position:relative;display:block;width:100%;min-width:0;min-height:0;border:1px solid var(--line);border-radius:7px;overflow:hidden;padding:0;background:var(--surface);cursor:zoom-in;aspect-ratio:4/3}\n.dpth.hit{border:2px solid var(--danger)}\n.dpth img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;background:var(--line)}\n.dpth i{position:absolute;left:3px;top:3px;font-style:normal;font-size:10px;font-weight:700;padding:1px 5px;border-radius:999px;background:var(--danger);color:#fff;line-height:1.3;pointer-events:none;z-index:1}\n.dpth u{position:absolute;right:3px;bottom:3px;text-decoration:none;font-size:10px;font-weight:700;padding:1px 5px;border-radius:6px;background:rgba(0,0,0,.62);color:#fff;line-height:1.3;pointer-events:none;z-index:1}\n.dpmess{font-size:var(--fs-s);color:var(--mute);font-style:italic;margin:8px 0 4px;text-align:center}\n.dpfs{display:grid;gap:6px}\n.dpf{border:1px solid var(--line);border-radius:8px;padding:6px 8px;background:var(--bg)}\n.dpf.hit{border-color:var(--mute);background:var(--surface)}\n.dpfl{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:4px}\n.dpfl b{font-size:var(--fs-s)}\n.dptag{font-size:11px;font-weight:700;padding:1px 7px;border-radius:999px;background:var(--s-new);color:var(--surface)}\n.dpfc{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:var(--fs-s)}\n.dpfc small{display:block;color:var(--mute);font-size:11px}\n.dpfc span{display:block;overflow-wrap:anywhere;word-break:break-word}\n.dpfc a{color:var(--s-seen);text-decoration:underline;overflow-wrap:anywhere;word-break:break-all}\n.dpe{color:var(--mute);font-style:italic}\n.dpi{margin-top:8px}\n.dpil{margin:0 0 6px;font-size:var(--fs-s);font-weight:700;color:var(--danger)}\n.dpig{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px}\n.dpip{border:1px solid var(--line);border-radius:8px;padding:4px;background:var(--bg);cursor:zoom-in;text-align:center;font:inherit;color:inherit}\n.dpip span{display:grid;grid-template-columns:1fr 1fr;gap:2px}\n.dpip img{width:100%;height:72px;object-fit:cover;border-radius:5px;background:var(--line);display:block}\n.dpip small{display:block;margin-top:3px;font-size:11px;color:var(--mute)}\n.dpz{position:fixed;inset:0;z-index:20;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;padding:calc(12px + env(safe-area-inset-top,0px)) 12px calc(12px + env(safe-area-inset-bottom,0px));overscroll-behavior:contain}\n.dpzb{background:var(--surface);color:var(--ink);border-radius:12px;padding:12px;width:min(760px,100%);max-height:calc(100dvh - 24px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}\n.dpzhdr{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}\n.dpzt{margin:0;font-weight:700;font-size:var(--fs-b);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpzlay,.dpzcls{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:8px;padding:4px 10px;min-height:32px;font-size:var(--fs-s);font-weight:600;cursor:pointer;white-space:nowrap;flex:none}\n.dpzcls{min-width:32px;padding:4px 8px;font-size:16px;line-height:1}\n.dpzg{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;align-items:stretch}\n.dpzg.stack{grid-template-columns:minmax(0,1fr)}\n.dpzcol{min-width:0;display:flex;flex-direction:column;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:8px}\n.dpzstage{position:relative;width:100%;height:clamp(210px,44dvh,420px);border-radius:8px;background:var(--surface);border:1px solid var(--line);overflow:hidden;display:flex;align-items:center;justify-content:center}\n.dpzg.stack .dpzstage{height:clamp(180px,33dvh,320px)}\n.dpzstage img{position:absolute;inset:0;width:100%;height:100%;padding:4px;object-fit:contain;display:block;cursor:pointer}\n.dpzempty{font-size:var(--fs-s);color:var(--mute);font-style:italic;padding:8px;text-align:center}\n.dpzmeta{margin-top:6px;text-align:center;min-width:0}\n.dpzmeta b{display:block;font-size:var(--fs-s);color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.35}\n.dpzmeta small{display:block;margin-top:1px;font-size:11px;color:var(--mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.35;min-height:15px}\n.dpzctrl{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:6px;min-height:32px}\n.dpzctrl.ghost{visibility:hidden;pointer-events:none}\n.dpzctrl button{border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:8px;min-width:38px;min-height:32px;padding:2px 10px;font-size:16px;font-weight:700;cursor:pointer}\n.dpzctrl button:disabled{opacity:.4;cursor:default}\n.dpzctrl span{font-size:var(--fs-s);font-weight:700;color:var(--ink);min-width:46px;text-align:center}\n.dpundo{position:fixed;left:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:30;display:flex;align-items:center;gap:5px;max-width:min(245px,calc(100vw - 104px));background:var(--ink);color:var(--surface);border-radius:9px;padding:4px 5px 4px 9px;box-shadow:0 4px 14px rgba(0,0,0,.26);font-size:11.5px;line-height:1.25}\n.dpundo[hidden]{display:none}\n.dpundo span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.dpundo button{border:0;border-radius:6px;min-height:24px;padding:2px 8px;font-size:11.5px;font-weight:700;cursor:pointer;background:var(--surface);color:var(--ink);white-space:nowrap}\n.dpundo button.x{background:transparent;color:inherit;padding:2px 6px;min-width:22px}\n.dpgo{cursor:pointer;text-decoration:none}\n.dpgo:hover,.dpgo:focus-visible{color:var(--accent);text-decoration:none;outline:0}\n.dpt b.dpgo{display:block;width:fit-content;max-width:100%}\n.dpz.stk .dpzmeta b.dpgo{pointer-events:auto;cursor:pointer}\n.dpz.stk .dpzmeta b.dpgo:hover{color:#fff}\n";
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
"@media (hover:hover){.dpbtn:hover{border-color:var(--accent);color:var(--accent)}.dpc:hover{box-shadow:0 2px 10px rgba(0,0,0,.08)}.dpedit:hover{background:var(--accent);border-color:var(--accent);color:var(--accent-ink);box-shadow:0 2px 8px color-mix(in srgb,var(--accent) 26%,transparent)}.dpdel:hover:not(:disabled){background:var(--danger);border-color:var(--danger);color:#fff;box-shadow:0 2px 8px rgba(220,38,38,.25)}.dpignbtn:hover,.dpno:hover,.dpchk:hover:not(:disabled),.dpimgbtn:hover:not(:disabled){filter:brightness(.95);box-shadow:0 2px 8px rgba(0,0,0,.12)}.dptogbtn:hover{border-color:var(--accent);color:var(--ink)}.dpmore:hover{color:var(--ink);border-color:var(--accent);background:var(--bg)}.dpth:hover{border-color:var(--accent);box-shadow:0 2px 10px rgba(0,0,0,.14)}.dpm div:hover{box-shadow:0 2px 10px rgba(0,0,0,.16)}.dpip:hover{border-color:var(--accent);box-shadow:0 2px 10px rgba(0,0,0,.14)}.dpw[data-tog]:hover span:not(.im){border-color:var(--accent)}#dupd .btn:not(:disabled):hover{filter:brightness(1.06)}#dupd .btn.p:not(:disabled):hover{box-shadow:0 3px 10px color-mix(in srgb,var(--accent) 32%,transparent)}#dupd .link:hover{opacity:.85;text-decoration:underline}.dpcfg>summary:hover{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 18%,var(--bg));box-shadow:0 3px 10px color-mix(in srgb,var(--accent) 20%,transparent)}.dpzlay:hover,.dpzcls:hover,.dpzctrl button:not(:disabled):hover,.dpzj:hover,.dpundo button:hover{filter:brightness(.94)}}",
"#dupd .btn,#dupd .link,.dpignbtn,.dptogbtn,.dpno,.dpchk,.dpimgbtn,.dpedit,.dpdel,.dpzlay,.dpzcls,.dpzctrl button,.dpundo button,.dpopt{transition:transform .1s ease,filter .15s ease,background-color .15s ease,border-color .15s ease,color .15s ease,box-shadow .15s ease,opacity .15s ease;touch-action:manipulation}",
"#dupd .btn:disabled{opacity:.55;cursor:default}",
"#dupd .btn.p{box-shadow:0 2px 8px color-mix(in srgb,var(--accent) 24%,transparent)}",
"#dupd .btn:not(:disabled):active,.dpignbtn:active,.dptogbtn:active,.dpno:active,.dpchk:not(:disabled):active,.dpimgbtn:not(:disabled):active,.dpedit:active,.dpdel:not(:disabled):active,.dpzlay:active,.dpzcls:active,.dpzctrl button:not(:disabled):active,.dpundo button:active{transform:scale(.96)}",
"#dupd .link:active,.dpopt:active{transform:scale(.97);opacity:.78}",
"#dupd button:focus-visible,#dupd summary:focus-visible,#dupd select:focus-visible,#dupd input:focus-visible,.dpbtn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}",
".dpset select,.dpset input[type=\"number\"]{transition:border-color .15s ease,box-shadow .15s ease,background-color .15s ease}",
".dpset select:focus,.dpset input[type=\"number\"]:focus{border-color:var(--accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 22%,transparent)}",
".dpimgact{display:flex;align-items:center;gap:6px;flex-wrap:wrap}",
".dpimgs.dpopen{animation:dpslide .2s cubic-bezier(.16,1,.3,1)}",
".dpz:not([hidden]){animation:dpfade .18s ease}",
".dpz:not([hidden]) .dpzb{animation:dpzin .22s cubic-bezier(.16,1,.3,1)}",
"@keyframes dpripple{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--accent) 50%,transparent)}100%{box-shadow:0 0 0 14px transparent}}",
".dpbtn:active{transform:scale(.93);background:color-mix(in srgb,var(--accent) 14%,var(--surface));border-color:var(--accent);color:var(--accent)}",
".dpbtn.dprp{animation:dpripple .5s ease-out}",
"@supports (transition-behavior:allow-discrete){.dpz{transition:opacity .16s ease-in,display .16s allow-discrete}.dpzb{transition:transform .16s ease-in,opacity .16s ease-in}.dpz[hidden]{opacity:0;pointer-events:none}.dpz[hidden] .dpzb{opacity:0;transform:translateY(14px) scale(.98)}}",
".dpzm{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 0 8px;padding-bottom:2px}",
".dpzm::-webkit-scrollbar{display:none}",
".dpzm[hidden]{display:none}",
".dpzj{flex:none;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:999px;padding:3px 11px;min-height:30px;font-size:var(--fs-s);font-weight:700;cursor:pointer;transition:transform .1s ease,background-color .15s ease,border-color .15s ease,color .15s ease}",
".dpzj:active{transform:scale(.96)}",
".dpzj.cur{background:var(--danger);border-color:var(--danger);color:#fff}",
".dpzcol{transition:border-color .15s ease}",
".dpzcol.act{border-color:var(--accent)}",
".dpzstage{touch-action:none;-webkit-user-select:none;user-select:none}",
".dpzstage img{transition:opacity .22s ease}",
".dpzstage.busy img{opacity:.55}",
".dpzstage img.zm{will-change:transform;cursor:grab}",
".dpzstage.zt img{transition:transform .2s ease,opacity .22s ease}",
".dpzrst{position:absolute;right:8px;top:8px;z-index:3;min-height:28px;padding:0 10px;border:0;border-radius:999px;background:rgba(0,0,0,.6);color:#fff;font:inherit;font-size:12px;font-weight:700;line-height:1;cursor:pointer;transition:opacity .15s ease}",
".dpzstage.zg .dpzrst{opacity:0;pointer-events:none}",
".dpzrst[hidden]{display:none}",
".dpzstage::after{content:'';position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;border:3px solid var(--line);border-top-color:var(--accent);opacity:0;pointer-events:none;transition:opacity .2s}",
".dpzstage.busy::after{opacity:1;transition-delay:.12s;animation:dpspin .85s linear infinite}",
".dpzstage img.a-open{animation:dpopen .26s cubic-bezier(.16,1,.3,1)}",
".dpzstage img.a-next{animation:dpnext .22s cubic-bezier(.16,1,.3,1)}",
".dpzstage img.a-prev{animation:dpprev .22s cubic-bezier(.16,1,.3,1)}",
".dpz.stk{padding:0;background:#000}",
".dpz.stk .dpzb{width:100%;max-height:none;height:100dvh;border-radius:0;padding:calc(6px + env(safe-area-inset-top,0px)) 0 env(safe-area-inset-bottom,0px);background:#000;color:#fff;display:flex;flex-direction:column;overflow:hidden}",
".dpz.stk .dpzhdr{flex:none;margin:0;padding:0 8px 4px}",
".dpz.stk .dpzt{color:#fff}",
".dpz.stk .dpzlay,.dpz.stk .xc{background:rgba(255,255,255,.14);border:0;color:#fff}",
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
"#dupmain,#dupignview{padding:14px;gap:10px}",
".dpmhdr{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}",
".dpmhdr-t{min-width:0;flex:1;display:grid;gap:2px}",
".dpmhdr-t h2{margin:0;line-height:1.2}",
"#dupsum{font-size:var(--fs-s);font-weight:600;color:var(--mute);margin:0;line-height:1.35}",
"#dupsum:empty,#dupm:empty,#dupignsum:empty{display:none}",
".dpctl{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px 11px;display:grid;gap:7px}",
".dpact{display:flex;align-items:center;gap:8px;margin:0}",
".dpact .foot2{display:flex;flex-wrap:wrap;gap:8px;flex:1;min-width:0;margin:0;padding:0;border:0;background:none}",
"#dupimg,#dupsmartbtn{flex:1 1 132px;justify-content:center;min-height:38px;white-space:nowrap}",
".dpsmbtn{border:1px solid var(--accent);background:color-mix(in srgb,var(--accent) 12%,var(--surface));color:var(--accent);font-weight:700}",
"#dupstop{flex:none;justify-content:center;min-height:38px;padding:0 14px}",
"#dupm{margin:0;font-size:var(--fs-s);line-height:1.35}",
".dpcfg{margin:0}",
".dpcfg>summary{cursor:pointer;list-style:none;-webkit-user-select:none;user-select:none;color:var(--ink);font-size:var(--fs-s);font-weight:700;min-height:40px;padding:7px 12px;border-radius:11px;border:1.5px solid color-mix(in srgb,var(--accent) 46%,var(--line));background:color-mix(in srgb,var(--accent) 12%,var(--bg));display:flex;align-items:center;justify-content:space-between;gap:8px;box-shadow:0 2px 6px rgba(0,0,0,.08);transition:transform .1s ease,background-color .15s ease,border-color .15s ease,box-shadow .15s ease;touch-action:manipulation}",
".dpcfg>summary::-webkit-details-marker,.dpcfg>summary::marker{display:none;content:\"\"}",
".dpcfg>summary:active{transform:scale(.97)}",
".dpcfg-l{display:inline-flex;align-items:center;gap:7px;min-width:0}",
".dpcfg-ic{flex:none;color:var(--accent);transition:transform .22s cubic-bezier(.16,1,.3,1)}",
".dpcfg-r{display:inline-flex;align-items:center;gap:6px;flex:none}",
".dpcfg-tag{font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,var(--accent) 16%,var(--surface));border:1px solid color-mix(in srgb,var(--accent) 32%,var(--line));color:var(--ink);white-space:nowrap}",
".dpcfg-tag:empty{display:none}",
".dpcfg-ar{width:24px;height:24px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--accent) 18%,var(--surface));color:var(--accent);font-size:12px;line-height:1;transition:transform .15s ease,background-color .15s ease,color .15s ease}",
".dpcfg[open]>summary{margin-bottom:6px;border-color:var(--accent);background:color-mix(in srgb,var(--accent) 18%,var(--bg));box-shadow:0 3px 10px color-mix(in srgb,var(--accent) 20%,transparent)}",
".dpcfg[open]>summary .dpcfg-ic{transform:rotate(45deg)}",
".dpcfg[open]>summary .dpcfg-ar{transform:rotate(180deg);background:var(--accent);color:var(--accent-ink)}",
".dpcfg>summary.dirty{border-color:var(--accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 30%,transparent)}",
".dpcfg[open]>.dpset{animation:dpslide .2s cubic-bezier(.16,1,.3,1)}",
".dpset{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 10px;margin:0;padding:10px 11px;border-radius:11px;border:1px solid var(--line);background:color-mix(in srgb,var(--bg) 55%,var(--surface))}",
".dpset .dpsens{display:flex;flex-direction:column;align-items:stretch;gap:3px;min-width:0}",
".dpset .dpsens label{margin:0;font-size:11.5px;color:var(--mute);font-weight:600;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
".dpset .dpsens select,.dpset .dpsens input[type=\"number\"]{width:100%;min-width:0;min-height:36px;padding:4px 8px;font-size:var(--fs-s);border-radius:8px;text-overflow:ellipsis}",
".dpsens-row{display:flex;align-items:center;gap:6px;min-width:0}",
".dpsens-row select{flex:1;min-width:0}",
".dpset .dpsens-row input[type=\"number\"]{width:64px;flex:none;text-align:center;font-weight:700}",
".dpset .dpfull{grid-column:1/-1}",
".dpcfgact{display:grid;gap:8px;margin-top:2px;padding-top:9px;border-top:1px dashed var(--line)}",
".dpcfgbtns{display:grid;grid-template-columns:1fr auto;gap:6px}",
".dpcfgbtns .btn{justify-content:center;min-height:36px;padding:6px 10px;font-size:var(--fs-s);white-space:nowrap}",
"#dupsave{grid-column:1/-1;min-height:38px;font-size:var(--fs-m)}",
"#dupsave.dirty{animation:dppulse 1.6s ease-in-out infinite}",
".dptogbtn{width:100%;display:flex;align-items:center;justify-content:center;gap:6px;min-height:34px;padding:6px 12px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--mute);font-size:var(--fs-s);font-weight:700;cursor:pointer}",
".dptogbtn[aria-pressed=\"true\"]{border-color:var(--accent);background:var(--b-new);color:var(--ink)}",
".dpignbar{margin:0;padding:7px 10px;border-radius:10px;border:1px dashed color-mix(in srgb,var(--s-contact) 38%,var(--line));background:color-mix(in srgb,var(--b-contact) 55%,transparent);display:flex;align-items:center;justify-content:space-between;gap:8px}",
".dpign-t{font-size:var(--fs-s);font-weight:700;color:var(--s-contact);min-width:0}",
".dpignbar .dpignbtn{min-height:30px;padding:3px 11px}",
".dpa-ign{margin-top:8px;padding-top:7px;border-top:1px dashed var(--line);display:flex;align-items:center;justify-content:flex-start}",
".dpa-ign .dpno,.dpa .dpchk,.dpa .dpimgbtn{min-height:28px;padding:3px 10px}",
".dpan{font-size:var(--fs-s);margin-top:6px}",
".dpan-h{display:flex;align-items:center;justify-content:space-between;gap:8px;position:sticky;top:0;z-index:1;background:var(--bg);padding:4px 0;border-bottom:1px solid var(--line)}",
".dpan-c{border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-top:10px;background:var(--surface)}",
".dpan-c h4{margin:0 0 8px;font-size:var(--fs-s);color:var(--mute);font-weight:600}",
".dpan-c p{margin:0}",
".dpan-sum{display:flex;align-items:center;gap:14px;flex-wrap:wrap}",
".dpan-big{font-size:30px;font-weight:700;line-height:1;color:var(--accent)}",
".dpan-big small{display:block;font-size:11px;font-weight:400;color:var(--mute);margin-top:5px}",
".dpan-chips{display:flex;flex-wrap:wrap;gap:6px}",
".dpan-chips span{padding:2px 9px;border:1px solid var(--line);border-radius:999px;font-size:12px}",
".dpan-chips .bad{color:var(--danger,#c0392b);border-color:var(--danger,#c0392b)}",
".dpan-tr{display:grid;grid-template-columns:54px 1fr 34px;column-gap:8px;align-items:center;padding:4px 0}",
".dpan-th{font-size:12px}",
".dpan-tr.best .dpan-th{font-weight:700;color:var(--accent)}",
".dpan-tr.noise .dpan-th{color:var(--danger,#c0392b)}",
".dpan-tr.lost{opacity:.5}",
".dpan-tr b{text-align:right;font-weight:600}",
".dpan-bar{display:flex;height:10px;border-radius:5px;overflow:hidden;background:var(--line)}",
".dpan-bar i{display:block;height:100%}",
".dpan-bar .g{background:#1e8449}",
".dpan-bar .n{background:#9aa0a6}",
".dpan-bar .x{background:var(--danger,#c0392b)}",
".dpan-sub{grid-column:2/4;color:var(--mute);font-size:11px}",
".dpan-lg{display:flex;gap:12px;flex-wrap:wrap;color:var(--mute);font-size:11px;margin-top:8px}",
".dpan-s{border-top:1px solid var(--line);padding:6px 0}",
".dpan-s>summary{cursor:pointer;font-weight:600}",
".dpan-s>summary em{font-style:normal;color:var(--mute);font-weight:400;margin-left:6px}",
".dpan-g{margin:6px 0 0 4px}",
".dpan-g>summary{cursor:pointer;font-size:12px;color:var(--mute)}",
".dpan-g.c>summary,.dpan-g.r>summary{color:var(--danger,#c0392b)}",
".dpan-r{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:6px 0;border-top:1px solid var(--line)}",
".dpan-rt{flex:1;min-width:140px}",
".dpan-rt small{display:block;color:var(--mute)}",
".dpan-i{display:flex;gap:6px;flex-wrap:wrap}",
".dpan-i a{display:flex;gap:2px}",
".dpan-i img{width:64px;height:48px;object-fit:cover;border-radius:4px;background:var(--line);display:block}",
".dpan-f{display:flex;justify-content:flex-end;margin-top:10px}",
"@media (max-width:420px){.dpa .dpv{margin-left:0;flex-basis:100%;text-align:left}}",
".dpviewbar{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin:2px 0 0}",
".dpseg{display:inline-flex;align-items:center;gap:3px;padding:3px;border-radius:10px;border:1px solid var(--line);background:var(--bg)}",
".dpsegbtn{border:0;background:transparent;color:var(--mute);border-radius:7px;padding:5px 11px;min-height:30px;font-size:var(--fs-s);font-weight:700;cursor:pointer;white-space:nowrap;transition:background-color .15s ease,color .15s ease,box-shadow .15s ease,transform .1s ease}",
".dpsegbtn[aria-pressed=\"true\"]{background:var(--surface);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.1)}",
".dpsegbtn:active{transform:scale(.96)}",
".dpapply{border:1px solid var(--accent);background:var(--surface);color:var(--accent);border-radius:999px;padding:4px 12px;min-height:30px;font-size:var(--fs-s);font-weight:700;cursor:pointer;white-space:nowrap;transition:background-color .15s ease,color .15s ease,transform .1s ease}",
".dpapply:active{transform:scale(.96)}",
".dpclusthdr{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:12px 0 4px;padding:5px 10px;border-radius:9px;background:var(--bg);border:1px solid var(--line);font-size:var(--fs-s)}",
".dpclusthdr:first-child{margin-top:4px}",
".dpclusthdr b{color:var(--ink);font-weight:700}",
".dpclusthdr span{display:inline-flex;align-items:center;gap:6px;color:var(--mute);font-size:11.5px;font-weight:600;white-space:nowrap}",
".dpsim{display:inline-block;padding:0 7px;border-radius:999px;font-size:11px;font-weight:700;line-height:1.6;border:1px solid currentColor}",
".dpsim.hi{color:var(--danger,#c0392b)}",
".dpsim.mid{color:#b9770e}",
".dpsim.lo{color:var(--mute)}",
".dpclcard{border:1px solid var(--line);border-left:4px solid var(--mute);border-radius:12px;padding:0 8px 8px;margin-top:10px;background:var(--surface)}",
".dpclcard.hi{border-left-color:var(--danger,#c0392b)}",
".dpclcard.mid{border-left-color:#b9770e}",
".dpclhead{display:flex;align-items:center;gap:8px;cursor:pointer;list-style:none;padding:10px 4px 8px;-webkit-tap-highlight-color:transparent}",
".dpclhead::-webkit-details-marker{display:none}",
".dpclhead::before{content:\"▸\";color:var(--mute);font-size:11px;transition:transform .15s ease}",
".dpclcard[open]>.dpclhead::before{transform:rotate(90deg)}",
".dpclt{flex:1;min-width:0;display:flex;flex-direction:column}",
".dpclt b{font-size:var(--fs-b);color:var(--ink)}",
".dpclt small{font-size:11.5px;color:var(--mute);font-weight:600}",
".dpclm{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--mute);font-weight:600;flex:none}",
".dpclbody{display:grid;gap:0;min-width:0}",
".dpclbody>.dpc:first-child{margin-top:0}",
".dpanact{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:0}",
".dpanact[hidden]{display:none}",
".dpanact .btn{min-height:32px;padding:4px 12px;font-size:var(--fs-s);white-space:nowrap}",
".dpsmart{border:1px solid var(--line);border-radius:12px;background:var(--surface);padding:10px 12px;margin:8px 0 4px;display:grid;gap:8px;min-width:0}",
".dpsmart[hidden]{display:none}",
".dpsm-h{display:flex;align-items:center;justify-content:space-between;gap:8px}",
".dpsm-h b{font-size:var(--fs-b);color:var(--ink)}",
".dpsm-chip{padding:1px 10px;border-radius:999px;border:1px solid var(--accent);color:var(--accent);font-size:var(--fs-s);font-weight:700;white-space:nowrap}",
".dpsm-p{margin:0;color:var(--mute);font-size:var(--fs-s)}",
".dpsm-opt{padding:8px 10px;border-radius:10px;border:1px solid var(--accent);background:color-mix(in srgb,var(--accent) 10%,var(--surface));color:var(--ink);font-size:var(--fs-s);line-height:1.4}",
".dpsm-opt b{color:var(--accent);font-size:var(--fs-b)}",
".dpsm-opt.dpcalc{opacity:.7}",
".dpsm-f{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}",
".dpsm-f .btn{min-height:34px}",
".dpsc{border:1px solid var(--line);border-left:4px solid #b9770e;border-radius:10px;padding:8px 10px;margin:0;display:grid;gap:6px;background:var(--bg);min-width:0;transition:opacity .15s ease}",
".dpsc.y{border-left-color:var(--s-won,#16a34a)}",
".dpsc.n{border-left-color:var(--mute);opacity:.7}",
".dpsc-h{display:flex;align-items:center;gap:8px}",
".dpsc-t{font-size:11.5px;color:var(--mute);font-weight:600}",
".dpsc-hs{display:grid;gap:2px;min-width:0}",
".dpsc-nm{min-width:0;display:block}",
".dpsc-nm b{display:block;font-size:var(--fs-b);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
".dpsc-nm small{display:block;color:var(--mute);font-size:var(--fs-s);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
".dpsc-i{display:flex;gap:8px;flex-wrap:wrap;align-items:center}",
".dpsc-i>span[data-zoom]{display:inline-grid;grid-template-columns:1fr 1fr;gap:2px;padding:2px;border-radius:8px;background:var(--surface);border:1px solid var(--line);cursor:zoom-in}",
".dpsc-i img{width:64px;height:48px;object-fit:cover;border-radius:5px;background:var(--line);display:block}",
".dpsc-i em{font-style:normal;font-size:11px;font-weight:700;color:var(--mute)}",
".dpsc-b{display:flex;gap:6px;flex-wrap:wrap}",
".dpsc-b .dpimgbtn{flex:1 1 0;justify-content:center;min-width:110px}",
".dpsc-b .dpv{margin-left:0}",
".dpsc-a{display:flex;gap:6px}",
".dpsc-a button{flex:1;min-height:36px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:var(--fs-s);font-weight:700;cursor:pointer}",
".dpsc-a .dpsc-yes.on{background:var(--s-won,#16a34a);border-color:var(--s-won,#16a34a);color:#fff}",
".dpsc-a .dpsc-no.on{background:var(--danger);border-color:var(--danger);color:#fff}",
"@media (prefers-reduced-motion:reduce){.dpbtn,#dupd,#dupd *,.dpz,.dpz *{animation:none!important;transition:none!important}}"
].join("\n");
var DLG="<dialog id=\"dupd\"><div class=\"form\" id=\"dupmain\">\n  <div class=\"dpmhdr\"><div class=\"dpmhdr-t\"><h2>Kiểm tra trùng</h2><p class=\"pm\" id=\"dupsum\"></p></div><button type=\"button\" class=\"xc\" id=\"dupx3\" aria-label=\"Đóng\"></button></div>\n  <div class=\"dpctl\"><div class=\"dpact\"><div class=\"foot2\"><button class=\"btn p\" type=\"button\" id=\"dupimg\">Quét ảnh trùng</button><button class=\"btn dpsmbtn\" type=\"button\" id=\"dupsmartbtn\">Quét thông minh</button><button class=\"btn\" type=\"button\" id=\"dupstop\" hidden>Dừng</button></div></div><div class=\"dpb\" id=\"dupbar\" hidden><i></i></div><p class=\"pm\" id=\"dupm\" role=\"status\"></p></div>\n  <details class=\"dpcfg\"><summary id=\"dupcfgbtn\"><span class=\"dpcfg-l\"><svg class=\"dpcfg-ic\" viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.86 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z\"/></svg><span>Cài đặt</span></span><span class=\"dpcfg-r\"><span class=\"dpcfg-tag\" id=\"dupcfgtag\"></span><span class=\"dpcfg-ar\" aria-hidden=\"true\">▾</span></span></summary><div class=\"dpset\"><div class=\"dpsens dpfull\"><label for=\"dupsens\">Độ nhạy ảnh</label><div class=\"dpsens-row\"><select id=\"dupsens\"><option value=\"87\">Ít nhầm · 87%</option><option value=\"80\" selected>Vừa · 80%</option><option value=\"77\">Nhạy · 77%</option><option value=\"73\">Rất nhạy · 73%</option><option value=\"custom\">Tùy chỉnh</option></select><input id=\"dupth\" type=\"number\" inputmode=\"numeric\" min=\"66\" max=\"99\" step=\"1\" aria-label=\"Ngưỡng giống (%)\"></div></div>\n  <div class=\"dpsens dpfull\"><label for=\"dupmm\">Xác minh vùng xám</label><select id=\"dupmm\"><option value=\"3\" selected>Patch Token + MaxSim + Spatial + CSLS (mặc định)</option><option value=\"4\">Kỹ nhất (Patch + Spatial + Trung tâm + CSLS)</option><option value=\"2\">Trung tâm 75% + CSLS (Multi-crop)</option><option value=\"0\">Tắt (Chỉ DINOv3)</option></select></div>\n  <div class=\"dpsens\"><label for=\"dupimgv\">Xem ảnh</label><select id=\"dupimgv\"><option value=\"manual\" selected>Bấm để mở</option><option value=\"both\">Mở sẵn · 2 cột</option><option value=\"stack\">Mở sẵn · xếp dọc</option></select></div>\n  <div class=\"dpsens\"><label for=\"dupres\">Độ phân giải</label><select id=\"dupres\"><option value=\"192\">192 · nhanh</option><option value=\"224\" selected>224 · mặc định</option><option value=\"256\">256</option><option value=\"288\">288</option><option value=\"320\">320 · chi tiết</option></select></div>\n  <div class=\"dpsens\"><label for=\"duppre\">Độ chính xác</label><select id=\"duppre\"><option value=\"16\" selected>fp16 · nhanh</option><option value=\"32\">fp32 · chính xác hơn</option></select></div>\n  <div class=\"dpsens\"><label for=\"dupdev\">Thiết bị</label><select id=\"dupdev\"><option value=\"auto\" selected>Tự động (GPU nếu có)</option><option value=\"cpu\">Chỉ CPU</option></select></div>\n  <div class=\"dpsens\"><label for=\"dupbn\">Batch</label><select id=\"dupbn\"><option value=\"0\">Tự động</option><option value=\"1\">1</option><option value=\"2\">2</option><option value=\"4\" selected>4</option><option value=\"8\">8</option></select></div>\n  <div class=\"dpsens\"><label for=\"duppace\">Nhịp quét</label><select id=\"duppace\"><option value=\"0\">Nhanh nhất</option><option value=\"0.6\" selected>Cân bằng</option><option value=\"1.5\">Mát máy</option></select></div>\n  <p class=\"dpst dpfull\" id=\"dupengnote\" hidden></p>\n  <div class=\"dpanact dpfull\" id=\"dupanact\" hidden><button type=\"button\" class=\"btn p\" id=\"dupapplyrec\">Áp dụng gợi ý</button></div>\n  <p class=\"dpst dpfull\" id=\"dupretnote\" hidden></p>\n  <div class=\"dpan dpfull\" id=\"dupandet\" hidden></div>\n  <div class=\"dpcfgact dpfull\"><label class=\"dpopt\"><input type=\"checkbox\" id=\"dupnoout\" checked><span>Bỏ qua căn Loại</span></label><div class=\"dpcfgbtns\"><button type=\"button\" class=\"btn\" id=\"dupanalyze\">Phân tích đa ngưỡng</button><button type=\"button\" class=\"btn\" id=\"duprst\">Đặt lại</button><button type=\"button\" class=\"btn p\" id=\"dupsave\">Lưu &amp; quét lại ảnh</button></div></div></div></details>\n  <div class=\"dpbar2\" id=\"duplinks\" hidden><button type=\"button\" class=\"dptogbtn\" id=\"duptog\" hidden></button></div>\n  <div class=\"dpignbar\" id=\"dupignbar\" hidden><span class=\"dpign-t\">Không phải trùng</span><button type=\"button\" class=\"dpignbtn\" id=\"dupigntog\" hidden></button></div>\n  <div class=\"dpviewbar\" id=\"dupviewbar\" hidden><div class=\"dpseg\" role=\"tablist\" aria-label=\"Kiểu hiển thị\"><button type=\"button\" class=\"dpsegbtn\" id=\"dupvpair\" aria-pressed=\"true\">Theo cặp</button><button type=\"button\" class=\"dpsegbtn\" id=\"dupvclust\" aria-pressed=\"false\">Cụm liền kề</button></div><button type=\"button\" class=\"dpapply\" id=\"dupapplyord\" hidden>Xếp liền kề ra danh sách</button></div>\n  <div class=\"dpsmart\" id=\"dupsmart\" hidden></div>\n  <div id=\"dupl\"></div>\n  <div class=\"foot\"><button class=\"btn p\" type=\"button\" id=\"dupx\">Đóng</button></div>\n</div><div class=\"form\" id=\"dupignview\" hidden>\n  <div class=\"dphead\"><button type=\"button\" class=\"btn\" id=\"dupback\">← Quay lại</button><h2>Không phải trùng</h2></div>\n  <p class=\"pm\" id=\"dupignsum\"></p>\n  <button type=\"button\" class=\"link\" id=\"dupignclr\" hidden>Khôi phục tất cả về danh sách kiểm tra</button>\n  <div id=\"dupignl\"></div>\n  <div class=\"foot\"><button class=\"btn\" type=\"button\" id=\"dupback2\">← Quay lại</button><button class=\"btn p\" type=\"button\" id=\"dupx2\">Đóng</button></div>\n</div><div class=\"dpz\" id=\"dupz\" hidden><div class=\"dpzb\"><div class=\"dpzhdr\"><p class=\"dpzt\" id=\"dupzt\"></p><button type=\"button\" class=\"dpzlay\" id=\"dupzlay\">Xếp dọc</button><button type=\"button\" class=\"xc\" id=\"dupzx2\" aria-label=\"Đóng\"></button></div><div class=\"dpzm\" id=\"dupzm\" hidden></div><div class=\"dpzg\" id=\"dupzg\"><div class=\"dpzcol\"><div class=\"dpzstage\"><img id=\"dupz1\" alt=\"Ảnh căn 1\"><span class=\"dpzempty\" id=\"dupze1\" hidden>Chưa có ảnh</span></div><div class=\"dpzmeta\"><b id=\"dupz1n\"></b><small id=\"dupz1m\"></small></div><div class=\"dpzctrl\" id=\"dupzc1\" hidden><button type=\"button\" id=\"dupz1prev\" aria-label=\"Ảnh trước căn 1\">‹</button><span id=\"dupz1c\"></span><button type=\"button\" id=\"dupz1next\" aria-label=\"Ảnh sau căn 1\">›</button></div></div><div class=\"dpzcol\"><div class=\"dpzstage\"><img id=\"dupz2\" alt=\"Ảnh căn 2\"><span class=\"dpzempty\" id=\"dupze2\" hidden>Chưa có ảnh</span></div><div class=\"dpzmeta\"><b id=\"dupz2n\"></b><small id=\"dupz2m\"></small></div><div class=\"dpzctrl\" id=\"dupzc2\" hidden><button type=\"button\" id=\"dupz2prev\" aria-label=\"Ảnh trước căn 2\">‹</button><span id=\"dupz2c\"></span><button type=\"button\" id=\"dupz2next\" aria-label=\"Ảnh sau căn 2\">›</button></div></div></div><div class=\"dpzact\" id=\"dupzact\"><button type=\"button\" class=\"dpchk\" id=\"dupzyes\" hidden>Trùng</button><button type=\"button\" class=\"dpno\" id=\"dupzign\">Không phải trùng</button><button type=\"button\" class=\"dpdel\" id=\"dupzdel1\">Xóa căn 1</button><button type=\"button\" class=\"dpdel\" id=\"dupzdel2\">Xóa căn 2</button></div><div class=\"foot\"><button class=\"btn p\" type=\"button\" id=\"dupzx\">Đóng</button></div></div></div><div class=\"dpundo\" id=\"dupundo\" hidden><span id=\"dupundot\"></span><button type=\"button\" id=\"dupundob\">↶ Hoàn tác</button><button type=\"button\" id=\"dupundox\" aria-label=\"Ẩn\">✕</button></div></dialog>";
var TH=80,TH_MIN=66,VL=1,ALGO_VER=10,MIN=2,imgPairs=null,scanning=false,smRunning=false,stopFlag=false,cache={},cacheLoaded=false,cacheP=null,inflight={},LIMIT=50,limMain=50,limIgn=50,memo=null,syncT=0,showOne=false,showIgn=false,skipOut=true,skipLoaded=false,imgAutoMode="manual",imgModeLoaded=false,viewList=[],openSet={},openImgSet={},pairImgMode={},ignored={},ignLoaded=false,pairImgMsg={},zoomCmp=null,viewMode="pairs",lastGraph=null,lastRecTh=null;
function hkOf(aId,bId){return aId<bId?(aId+"|"+bId):(bId+"|"+aId)}
function simOf(m){return m.n!=null?m.n:Math.max(0,100-m.d)}
function imgItemOf(r,sw){return sw?{x:r.y,y:r.x,d:r.d,k:r.k||"",o:r.o||"",n:r.n}:{x:r.x,y:r.y,d:r.d,k:r.k||"",o:r.o||"",n:r.n}}
function canonPairKey(aId,bId,x,y){return aId<bId?(aId+"|"+bId+"|"+x+"|"+y):(bId+"|"+aId+"|"+y+"|"+x)}
function mmResKey(x,y){return x<y?(MM_MODE+"|"+CACHE_KEY+"|"+x+"|"+y):(MM_MODE+"|"+CACHE_KEY+"|"+y+"|"+x)}
function isAborted(isScan){return stopFlag&&(smRunning||(scanning&&isScan))}
function syncScanUi(){
  var busy=scanning||smRunning;
  var bi=G("dupimg"),bsm=G("dupsmartbtn"),bst=G("dupstop"),br=G("dupbar");
  if(bi)bi.disabled=busy;
  if(bsm)bsm.disabled=busy;
  if(bst){bst.hidden=!busy;bst.disabled=busy&&stopFlag}
  if(br)br.hidden=!scanning;
}

/* ---------- Lưu danh sách "không phải trùng" vào localStorage ---------- */
var undoSt=[],zlay=null,cmpAll={},smartPos={},smartImg={},posLoaded=false,posDirty={},posIdbDone=false,smView=[],smHook=null,smCloseHook=null,smFinNote="";
function slimImgs(arr){
  if(!Array.isArray(arr))return[];
  return arr.slice(0,12).filter(function(m){return m&&m.x&&m.y}).map(function(m){
    return{x:String(m.x),y:String(m.y),d:+m.d||0,k:m.k||"",o:m.o||"",n:m.n!=null?+m.n:Math.max(0,100-(+m.d||0))};
  });
}
function posWriteLs(){
  /* giống ignWriteLs: không giới hạn số cặp, không lưu ảnh (smartImg chỉ giữ trong phiên) */
  var pStr=JSON.stringify(smartPos),qStr=Object.keys(posDirty).length?JSON.stringify(posDirty):"";
  try{ls("dsp1",pStr);ls("dsp1q",qStr);if(ls("dsp2"))ls("dsp2","")}catch(e){}
  if(N()&&N().idbSave){N().idbSave("dsp1",pStr);N().idbSave("dsp1q",qStr)}
}
function loadSmartPos(){
  if(!posLoaded){
    posLoaded=true;
    var rawP=null,rawQ=null;
    try{rawP=JSON.parse(ls("dsp1")||"null")}catch(e){}
    if(Array.isArray(rawP)){rawP.forEach(function(k){if(k)smartPos[String(k)]=1})}
    else if(rawP&&typeof rawP==="object"){Object.keys(rawP).forEach(function(k){if(rawP[k])smartPos[k]=+rawP[k]||1})}
    try{rawQ=JSON.parse(ls("dsp1q")||"{}")}catch(e){}
    if(rawQ&&typeof rawQ==="object"){Object.keys(rawQ).forEach(function(k){posDirty[k]=+rawQ[k]||0})}
  }
  if(!posIdbDone&&!ls("dsp1")&&N()&&N().idbGet){
    posIdbDone=true;
    Promise.all([N().idbGet("dsp1").catch(function(){return null}),N().idbGet("dsp1q").catch(function(){return null})]).then(function(v){
      var chg=false;
      if(typeof v[0]==="string"&&v[0]&&!ls("dsp1")){
        try{
          var o0=JSON.parse(v[0]);
          if(Array.isArray(o0)){o0.forEach(function(k){if(k&&!(k in smartPos)&&!(k in posDirty)&&!ignored[k]){smartPos[String(k)]=1;chg=true}})}
          else if(o0&&typeof o0==="object"){Object.keys(o0).forEach(function(k){if(o0[k]&&!(k in smartPos)&&!(k in posDirty)&&!ignored[k]){smartPos[k]=+o0[k]||1;chg=true}})}
        }catch(e){}
      }
      if(typeof v[1]==="string"&&v[1]&&!ls("dsp1q")){
        try{var o1=JSON.parse(v[1]);if(o1&&typeof o1==="object"){Object.keys(o1).forEach(function(k){if(!(k in posDirty)){posDirty[k]=+o1[k]||0;if(posDirty[k]>0)smartPos[k]=posDirty[k];else{delete smartPos[k];delete smartImg[k]}chg=true}})}}catch(e){}
      }
      if(chg){posWriteLs();var dd=G("dupd");if(dd&&dd.open)render()}
    });
  }
}
function saveSmartPos(now){
  posWriteLs();clearTimeout(dsT);
  if(now){dsT=0;pushIgnored()}
  else dsT=setTimeout(function(){dsT=0;pushIgnored()},150);
}
function cleanSmartPos(byId){
  var ch=false;
  Object.keys(smartPos).forEach(function(k){
    var ids=k.split("|");
    if((byId&&(!byId[ids[0]]||!byId[ids[1]]))||ignored[k]){delete smartPos[k];delete smartImg[k];if(byId&&(!byId[ids[0]]||!byId[ids[1]]))delete posDirty[k];ch=true}
  });
  if(ch)posWriteLs();
  return ch;
}
function buildInfCtx(byId){
  var par={};
  function fnd(x){if(par[x]===undefined)par[x]=x;while(par[x]!==x){par[x]=par[par[x]];x=par[x]}return x}
  Object.keys(smartPos).forEach(function(k){
    if(ignored[k])return;
    var q=k.split("|");
    if(byId&&(!byId[q[0]]||!byId[q[1]]))return;
    par[fnd(q[0])]=fnd(q[1]);
  });
  var negC={};
  Object.keys(ignored).forEach(function(k){
    if(!ignored[k])return;
    var q=k.split("|");
    if(byId&&(!byId[q[0]]||!byId[q[1]]))return;
    var x=fnd(q[0]),y=fnd(q[1]);
    if(x!==y){negC[x+"\u0001"+y]=1;negC[y+"\u0001"+x]=1}
  });
  function isNeg(aId,bId){var x=fnd(aId),y=fnd(bId);return x!==y&&!!negC[x+"\u0001"+y]}
  function samePos(aId,bId){return fnd(aId)===fnd(bId)}
  function compPair(aId,bId){var x=fnd(aId),y=fnd(bId);return x<y?(x+"\u0001"+y):(y+"\u0001"+x)}
  return{fnd:fnd,isNeg:isNeg,samePos:samePos,compPair:compPair};
}
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
function flushIgnored(){if(dsT){clearTimeout(dsT);dsT=0;pushIgnored()}else if(Object.keys(ignDirty).length||Object.keys(posDirty).length)pushIgnored()}
function undoDo(){
  var u=undoSt.pop();if(!u)return;
  loadIgnored();loadSmartPos();
  var spCh=false;
  u.a.forEach(function(x){
    if(x.p===undefined){delete ignored[x.k];ignDirty[x.k]=0}
    else{ignored[x.k]=x.p;ignDirty[x.k]=x.p;if(smartPos[x.k]){delete smartPos[x.k];delete smartImg[x.k];posDirty[x.k]=0;spCh=true}}
    if(x.sp!==undefined&&x.p===undefined){smartPos[x.k]=x.sp;posDirty[x.k]=x.sp;if(x.si)smartImg[x.k]=slimImgs(x.si);spCh=true}
  });
  if(spCh)posWriteLs();
  saveIgnored();undoUi();render()}
/* Đồng bộ cả cặp "Không phải trùng" (ignored) và "Trùng" (smartPos) lên tab "Trùng" của Sheet */
function pushIgnored(){
  if(!(N()&&N().apiPost&&canWrite()))return;
  if(dsBusy){dsAgain=true;return}
  var keys=Object.keys(ignDirty),pkeys=Object.keys(posDirty);
  if(!keys.length&&!pkeys.length)return;
  var add=[],del=[],sent={},posAdd=[],posDel=[],sentPos={};
  keys.forEach(function(k){var v=ignDirty[k];sent[k]=v;if(v>0)add.push({k:k,t:v});else del.push(k)});
  pkeys.forEach(function(k){var v=posDirty[k];sentPos[k]=v;if(v>0)posAdd.push({k:k,t:v});else posDel.push(k)});
  dsBusy=true;
  N().apiPost("dupSet",{add:add,del:del,posAdd:posAdd,posDel:posDel},30000).then(function(){
    Object.keys(sent).forEach(function(k){if(ignDirty[k]===sent[k])delete ignDirty[k]});
    Object.keys(sentPos).forEach(function(k){if(posDirty[k]===sentPos[k])delete posDirty[k]});
    ignWriteLs();posWriteLs();
    try{ls("dsp3s","1")}catch(e){}
  },function(){}).then(function(){dsBusy=false;if(dsAgain){dsAgain=false;pushIgnored()}})}
function sameMap(a,b){var ka=Object.keys(a),kb=Object.keys(b);if(ka.length!==kb.length)return false;for(var i=0;i<ka.length;i++)if(a[ka[i]]!==b[ka[i]])return false;return true}
function pullIgnored(force){
  if(!(N()&&N().apiGet))return Promise.resolve();
  loadIgnored();loadSmartPos();
  if(pullP)return pullP;
  if(!force&&lastPull&&Date.now()-lastPull<20000)return Promise.resolve();
  pullP=N().apiGet("&action=dup",20000).then(function(d){
    lastPull=Date.now();
    if(!d||!d.ok)return;
    var R={},nxt={},Rpos={},nxtPos={},nxtImg={},byId=null,its=N().items();
    (d.pairs||[]).forEach(function(p){R[p.k]=p.t||1;nxt[p.k]=p.t||1});
    (d.pos||[]).forEach(function(p){
      Rpos[p.k]=p.t||1;nxtPos[p.k]=p.t||1;
      if(smartImg[p.k])nxtImg[p.k]=smartImg[p.k];   /* ảnh chỉ giữ trong phiên, không lưu / không đồng bộ */
    });
    var mig="";try{mig=ls("dsp3s")||""}catch(e){}
    if(mig!=="1"){
      Object.keys(smartPos).forEach(function(k){
        if(!(k in R)&&!(k in Rpos)&&!(k in ignDirty)&&!(k in posDirty)){
          var tsPos=+smartPos[k]>1?+smartPos[k]:Date.now();
          posDirty[k]=tsPos;
        }
      });
      try{ls("dsp3s","1")}catch(e){}
    }
    Object.keys(ignDirty).forEach(function(k){if(ignDirty[k]>0)nxt[k]=ignDirty[k];else delete nxt[k]});
    Object.keys(posDirty).forEach(function(k){
      if(posDirty[k]>0){nxtPos[k]=posDirty[k];if(smartImg[k])nxtImg[k]=smartImg[k]}
      else{delete nxtPos[k];delete nxtImg[k]}
    });
    Object.keys(nxtPos).forEach(function(k){
      if(nxt[k]){
        if(posDirty[k]>0&&!(ignDirty[k]>0)){delete nxt[k];ignDirty[k]=0}
        else{delete nxtPos[k];delete nxtImg[k]}
      }
    });
    if(its&&its.length){
      byId={};its.forEach(function(it){byId[it.id]=1});
      Object.keys(nxt).forEach(function(k){var ids=k.split("|");if(!byId[ids[0]]||!byId[ids[1]]){delete nxt[k];if(!(k in R))delete ignDirty[k]}   /* chỉ ẩn tạm trên máy, KHÔNG gửi lệnh xóa lên máy chủ: danh sách căn trên máy có thể cũ hơn máy chủ (căn mới do máy khác thêm). Máy chủ tự xóa cặp khi xóa căn (dupDropId_) */});
      Object.keys(nxtPos).forEach(function(k){var ids=k.split("|");if(!byId[ids[0]]||!byId[ids[1]]){delete nxtPos[k];delete nxtImg[k];if(!(k in Rpos))delete posDirty[k]}});
    }
    var imgChg=JSON.stringify(smartImg)!==JSON.stringify(nxtImg);
    var chg=!sameMap(ignored,nxt)||!sameMap(smartPos,nxtPos)||imgChg;
    ignored=nxt;smartPos=nxtPos;smartImg=nxtImg;
    ignWriteLs();posWriteLs();
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
var WT={"Cùng link tin đăng":2};
/* Ảnh phòng chung (nhà vệ sinh, cầu thang...) rất giống nhau giữa các căn khác nhau.
   HUB (hubLim, cộng thêm theo số căn): ưu tiên chặn các cặp chỉ khớp 1 ảnh đơn lẻ (o.img.length===1) khi ảnh đó giống ≥HUB căn khác (<HUB_N%).
   Cặp trùng từ ≥2 ảnh riêng biệt trở lên (cụm nhiều sale cùng đăng 1 căn) được miễn trừ HUB trừ khi xung đột khu vực. */
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
  var pClose=pDiff!==null&&pDiff<=0.12&&!diffDist;
  var aClose=aDiff!==null&&aDiff<=0.15&&!diffDist;
  var support=tsText||0;
  if(sameWard)support++;
  else if(sameDist)support++;
  if(pClose)support++;
  if(aClose)support++;
  var conflict=diffDist;
  return{support:support,conflict:conflict,sameDist:sameDist,sameWard:sameWard,diffDist:diffDist,pDiff:pDiff,pClose:pClose,aClose:aClose}}
function oneToOnePairs(list,isNorm){
  var sorted=list.slice().sort(function(p,q){
    var np=simOf(p),nq=simOf(q);
    return (nq-np)||((q.x===q.y?1:0)-(p.x===p.y?1:0))});
  var usedA={},usedB={},out=[],dropped=0;
  sorted.forEach(function(r){
    var sx=isNorm?r.x:(r.a.id<r.b.id?r.x:r.y),sy=isNorm?r.y:(r.a.id<r.b.id?r.y:r.x);
    if(usedA[sx]||usedB[sy]){dropped++;return}
    usedA[sx]=1;usedB[sy]=1;out.push(r)});
  out.dropped=dropped;return out}
function filterGenericImgs(P,n,thRef){
  var hub={},lim=hubLim(n),tsBase=thRef||TH;
  function rec(img,otherId,sim){var h=hub[img]||(hub[img]={});if(h[otherId]===undefined||sim>h[otherId])h[otherId]=sim}
  Object.keys(P).forEach(function(k){
    var o=P[k];if(!o.img.length)return;
    o.img=oneToOnePairs(o.img,true);
    o.img.forEach(function(m){var s=simOf(m);rec(m.x,o.b.id,s);rec(m.y,o.a.id,s)})});
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
        var s=simOf(m);
        if(s>=96)return true;
        if(s>=HUB_N&&!ctx.conflict&&(nImg>=2||ctx.support>=1||ts>=1))return true;
        if(multiExempt||(nImg>=2&&!ctx.conflict&&s>=84))return true;
        var dx=hn(m.x),dy=hn(m.y);
        var effLim=(nImg===1&&!ctx.conflict&&(s>=92||(ctx.support>=1&&s>=85)))?(lim+1):lim;
        if(dx>=effLim||dy>=effLim)return false;
        if(nImg===1&&(s<tsBase+3||(ctx.conflict&&s<94))&&(dx>=2||dy>=2)){
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
/* ===== Graph Clustering & Sắp xếp liền kề (Connected Components + Weighted Louvain Modularity + MinLA Seriation) ===== */
function pairEdgeWeight(p){
  var imgs=p.img||[];
  if(!imgs.length)return{w:(p.sc||1)*0.3,maxSim:0,nImg:0};
  var simSum=0,maxSim=0,i,m,s;
  for(i=0;i<imgs.length;i++){
    m=imgs[i];
    s=(m.n!=null?m.n:Math.max(0,100-m.d))/100;
    if(s>maxSim)maxSim=s;
    simSum+=s+(m.x===m.y?0.25:0);
  }
  var tsText=0;
  (p.why||[]).forEach(function(lb){
    if(lb==="img")return;
    tsText+=(lb==="Cùng SĐT sale")?0.15:(WT[lb]||1);
  });
  return{w:imgs.length*1.0+simSum*0.8+maxSim*0.5+Math.min(1.5,tsText*0.25),maxSim:Math.round(maxSim*100),nImg:imgs.length};
}
function louvainSplitComponent(compNodes,adj,nodeWeight,total2m,pairMeta){
  var k=compNodes.length;
  if(k<4||!(total2m>0))return[compNodes];
  var GAMMA=1.05,comm={},commTot={},sorted=compNodes.slice().sort(function(a,b){return(nodeWeight[b]-nodeWeight[a])||(a<b?-1:1)}),i,pass,changed;
  for(i=0;i<k;i++){comm[sorted[i]]=i;commTot[i]=nodeWeight[sorted[i]]}
  for(pass=0;pass<15;pass++){
    changed=false;
    for(i=0;i<k;i++){
      var u=sorted[i],curC=comm[u],wu=nodeWeight[u],nb=adj[u]||{},kToC={};
      commTot[curC]-=wu;
      Object.keys(nb).forEach(function(v){var cv=comm[v];kToC[cv]=(kToC[cv]||0)+nb[v]});
      var bestC=curC,bestQ=-1e9;
      if(kToC[curC]===undefined)kToC[curC]=0;
      Object.keys(kToC).forEach(function(cStr){
        var c=+cStr,dq=kToC[c]-GAMMA*(wu*(commTot[c]||0))/total2m;
        if(dq>bestQ+1e-9||(Math.abs(dq-bestQ)<=1e-9&&c===curC)){bestQ=dq;bestC=c}
      });
      comm[u]=bestC;
      commTot[bestC]=(commTot[bestC]||0)+wu;
      if(bestC!==curC)changed=true;
    }
    if(!changed)break;
  }
  var gMap={},groups=[];
  compNodes.forEach(function(id){var c=comm[id];(gMap[c]||(gMap[c]=[])).push(id)});
  Object.keys(gMap).sort(function(a,b){return(+a)-(+b)}).forEach(function(c){groups.push(gMap[c])});
  if(groups.length<=1)return[compNodes];
  /* Bảo vệ chống tách lẻ (node đơn lẻ phải nhập vào cụm nối mạnh nhất) & bảo vệ cầu nối mạnh */
  var merged=true;
  while(merged&&groups.length>1){
    merged=false;
    var gi,gj,uIdx,vIdx;
    for(gi=0;gi<groups.length;gi++){
      if(groups[gi].length===1){
        var solo=groups[gi][0],bestGi=-1,bestW=-1;
        for(gj=0;gj<groups.length;gj++){
          if(gj===gi)continue;
          var sumW=0;
          groups[gj].forEach(function(v){sumW+=(adj[solo]&&adj[solo][v])||0});
          if(sumW>bestW){bestW=sumW;bestGi=gj}
        }
        if(bestGi>=0){groups[bestGi].push(solo);groups.splice(gi,1);merged=true;break}
      }
    }
    if(merged)continue;
    for(gi=0;gi<groups.length&&!merged;gi++){
      for(gj=gi+1;gj<groups.length&&!merged;gj++){
        var ga=groups[gi],gb=groups[gj],cutW=0,cutCnt=0,maxCutImgs=0,maxCutSim=0;
        for(uIdx=0;uIdx<ga.length;uIdx++){
          var uId=ga[uIdx],nu=adj[uId]||{};
          for(vIdx=0;vIdx<gb.length;vIdx++){
            var vId=gb[vIdx],wuv=nu[vId];
            if(wuv>0){
              cutW+=wuv;cutCnt++;
              var pk=hkOf(uId,vId),pm=pairMeta[pk];
              if(pm){if(pm.nImg>maxCutImgs)maxCutImgs=pm.nImg;if(pm.maxSim>maxCutSim)maxCutSim=pm.maxSim}
            }
          }
        }
        if(cutCnt>0&&((maxCutImgs>=2&&maxCutSim>=85)||(cutCnt>=Math.min(ga.length,gb.length)&&(cutW/cutCnt)>=2.6))){
          groups[gi]=ga.concat(gb);groups.splice(gj,1);merged=true;
        }
      }
    }
  }
  return groups;
}
function orderClusterNodes(nodeIds,adj,origIdx){
  var k=nodeIds.length;
  if(k<=1)return nodeIds.slice();
  if(k===2){
    var a=nodeIds[0],b=nodeIds[1];
    return (origIdx[a]||0)<=(origIdx[b]||0)?[a,b]:[b,a];
  }
  var deg={},wDeg={},i,j;
  nodeIds.forEach(function(u){
    var nb=adj[u]||{},dc=0,dw=0;
    nodeIds.forEach(function(v){if(v!==u&&nb[v]>0){dc++;dw+=nb[v]}});
    deg[u]=dc;wDeg[u]=dw;
  });
  function scoreSeq(seq){
    var pos={},adjSum=0,spanPen=0,m,n,u,v,w;
    for(m=0;m<k;m++)pos[seq[m]]=m;
    for(m=0;m<k-1;m++){u=seq[m];v=seq[m+1];adjSum+=(adj[u]&&adj[u][v])||0}
    for(m=0;m<k;m++){
      u=seq[m];
      for(n=m+1;n<k;n++){v=seq[n];w=(adj[u]&&adj[u][v])||0;if(w>0)spanPen+=w*(n-m)}
    }
    return adjSum*1000-spanPen;
  }
  var cands;
  if(k<=12){cands=nodeIds.slice()}
  else{
    var byLow=nodeIds.slice().sort(function(x,y){return(deg[x]-deg[y])||(wDeg[y]-wDeg[x])||(origIdx[x]-origIdx[y])});
    var byHigh=nodeIds.slice().sort(function(x,y){return(wDeg[y]-wDeg[x])||(origIdx[x]-origIdx[y])});
    cands=[];
    byLow.slice(0,4).concat(byHigh.slice(0,4)).forEach(function(id){if(cands.indexOf(id)<0)cands.push(id)});
  }
  var bestSeq=null,bestScore=-1e18;
  cands.forEach(function(start){
    var seq=[start],used={};used[start]=1;
    while(seq.length<k){
      var cur=seq[seq.length-1],nbCur=adj[cur]||{},pick=null,pDirect=-1,pPull=-1;
      for(i=0;i<k;i++){
        var u=nodeIds[i];if(used[u])continue;
        var dW=nbCur[u]||0,pull=0;
        for(j=seq.length-1;j>=0;j--){
          var wj=(adj[seq[j]]&&adj[seq[j]][u])||0;
          if(wj>0)pull+=wj/(seq.length-j);
        }
        if(dW>pDirect+1e-9||(Math.abs(dW-pDirect)<=1e-9&&(pull>pPull+1e-9||(Math.abs(pull-pPull)<=1e-9&&(origIdx[u]||0)<(origIdx[pick]||0))))){
          pick=u;pDirect=dW;pPull=pull;
        }
      }
      seq.push(pick);used[pick]=1;
    }
    var sc=scoreSeq(seq);
    if(sc>bestScore){bestScore=sc;bestSeq=seq}
  });
  if(k<=40){
    var pass,improved=true;
    for(pass=0;pass<4&&improved;pass++){
      improved=false;
      for(i=0;i<k;i++){
        for(j=i+1;j<k;j++){
          var tmp=bestSeq[i];bestSeq[i]=bestSeq[j];bestSeq[j]=tmp;
          var s1=scoreSeq(bestSeq);
          if(s1>bestScore+1e-9){bestScore=s1;improved=true}
          else{tmp=bestSeq[i];bestSeq[i]=bestSeq[j];bestSeq[j]=tmp}
          if(j-i>=2){
            var l=i,r=j;while(l<r){tmp=bestSeq[l];bestSeq[l]=bestSeq[r];bestSeq[r]=tmp;l++;r--}
            var s2=scoreSeq(bestSeq);
            if(s2>bestScore+1e-9){bestScore=s2;improved=true}
            else{l=i;r=j;while(l<r){tmp=bestSeq[l];bestSeq[l]=bestSeq[r];bestSeq[r]=tmp;l++;r--}}
          }
        }
      }
    }
  }
  return bestSeq;
}
function clusterDupGraph(imgPairList,allItems){
  var adj={},nodeWeight={},byId={},origIdx={},pairMap={},pairMeta={},nodes=[],seenN={};
  (allItems||[]).forEach(function(it,idx){byId[it.id]=it;origIdx[it.id]=idx});
  (imgPairList||[]).forEach(function(p){
    var u=p.a.id,v=p.b.id;if(u===v)return;
    var pk=hkOf(u,v);
    if(!byId[u])byId[u]=p.a;if(!byId[v])byId[v]=p.b;
    if(!seenN[u]){seenN[u]=1;nodes.push(u)}
    if(!seenN[v]){seenN[v]=1;nodes.push(v)}
    var em=pairEdgeWeight(p);
    pairMap[pk]=p;pairMeta[pk]=em;
    (adj[u]||(adj[u]={}))[v]=em.w;
    (adj[v]||(adj[v]={}))[u]=em.w;
    nodeWeight[u]=(nodeWeight[u]||0)+em.w;
    nodeWeight[v]=(nodeWeight[v]||0)+em.w;
  });
  var visited={},rawComps=[],total2m=0;
  nodes.forEach(function(id){total2m+=nodeWeight[id]||0});
  nodes.sort(function(a,b){return(origIdx[a]||0)-(origIdx[b]||0)});
  nodes.forEach(function(start){
    if(visited[start])return;
    var q=[start],comp=[],qi=0;visited[start]=1;
    while(qi<q.length){
      var u=q[qi++];comp.push(u);
      var nb=adj[u]||{};
      Object.keys(nb).forEach(function(v){if(!visited[v]){visited[v]=1;q.push(v)}});
    }
    rawComps.push(comp);
  });
  var splitCount=0,subComps=[];
  rawComps.forEach(function(comp){
    if(comp.length>=4){
      var cAdj={},cW={},c2m=0,cMap={};
      comp.forEach(function(u){cMap[u]=1;cAdj[u]={};cW[u]=0});
      comp.forEach(function(u){
        var nb=adj[u]||{};
        Object.keys(nb).forEach(function(v){if(cMap[v]){cAdj[u][v]=nb[v];cW[u]+=nb[v];c2m+=nb[v]}});
      });
      var parts=louvainSplitComponent(comp,cAdj,cW,c2m,pairMeta);
      if(parts.length>1)splitCount+=(parts.length-1);
      parts.forEach(function(pt){subComps.push(pt)});
    }else subComps.push(comp);
  });
  var clusters=[],nodeCluster={};
  subComps.forEach(function(nodeIds,ci){
    var cSet={},cAdj={},i,j;
    nodeIds.forEach(function(u){cSet[u]=1;cAdj[u]={}});
    nodeIds.forEach(function(u){var nb=adj[u]||{};Object.keys(nb).forEach(function(v){if(cSet[v])cAdj[u][v]=nb[v]})});
    var ordIds=orderClusterNodes(nodeIds,cAdj,origIdx);
    var posInC={};ordIds.forEach(function(id,idx){posInC[id]=idx});
    var cPairs=[],maxImg=0,maxSim=0,totW=0,simAcc=0;
    for(i=0;i<ordIds.length;i++){
      for(j=i+1;j<ordIds.length;j++){
        var u=ordIds[i],v=ordIds[j],pk=hkOf(u,v),pr=pairMap[pk];
        if(pr){
          cPairs.push(pr);
          var em=pairMeta[pk];
          totW+=em.w;simAcc+=em.maxSim;
          if(em.nImg>maxImg)maxImg=em.nImg;
          if(em.maxSim>maxSim)maxSim=em.maxSim;
        }
      }
    }
    cPairs.sort(function(p,q){
      var pa0=posInC[p.a.id],pb0=posInC[p.b.id],qa0=posInC[q.a.id],qb0=posInC[q.b.id];
      var pLo=Math.min(pa0,pb0),pHi=Math.max(pa0,pb0),qLo=Math.min(qa0,qb0),qHi=Math.max(qa0,qb0);
      return (pLo-qLo)||(pHi-qHi)||q.img.length-p.img.length;
    });
    var nNodes=ordIds.length,possibleE=nNodes*(nNodes-1)/2;
    clusters.push({
      id:ci+1,
      nodeIds:ordIds,
      nodes:ordIds.map(function(id){return byId[id]}),
      pairs:cPairs,
      maxImgCount:maxImg,
      maxSim:maxSim,
      totalWeight:Math.round(totW*100)/100,
      avgSim:cPairs.length?Math.round(simAcc/cPairs.length):0,
      density:possibleE>0?Math.round((cPairs.length/possibleE)*100)/100:1,
      _pos:posInC
    });
  });
  clusters.sort(function(a,b){
    return (b.maxImgCount-a.maxImgCount)||(b.maxSim-a.maxSim)||(b.totalWeight-a.totalWeight)||(b.nodes.length-a.nodes.length)||(a.nodeIds[0]<b.nodeIds[0]?-1:1);
  });
  var nodePos={},orderedDupIds=[],modQ=0;
  clusters.forEach(function(cl,idx){
    cl.id=idx+1;
    var sigmaIn=0,sigmaTot=0;
    cl.nodeIds.forEach(function(id){
      nodeCluster[id]=cl.id;
      nodePos[id]=orderedDupIds.length;
      orderedDupIds.push(id);
      sigmaTot+=nodeWeight[id]||0;
    });
    cl.pairs.forEach(function(p){var pk=p.a.id<p.b.id?p.a.id+"|"+p.b.id:p.b.id+"|"+p.a.id;sigmaIn+=2*(pairMeta[pk]?pairMeta[pk].w:0)});
    if(total2m>0)modQ+=(sigmaIn/total2m)-1.05*Math.pow(sigmaTot/total2m,2);
  });
  var bridgePairs=[];
  Object.keys(pairMap).forEach(function(pk){
    var p=pairMap[pk];
    if(nodeCluster[p.a.id]!==nodeCluster[p.b.id])bridgePairs.push(p);
  });
  bridgePairs.sort(function(a,b){return b.img.length-a.img.length||b.sc-a.sc});
  var crossClusters=clusters.filter(function(cl){return cl.nodes.length>=3}),crossNodeCount=0;
  crossClusters.forEach(function(cl){crossNodeCount+=cl.nodes.length});
  return{
    clusters:clusters,
    bridgePairs:bridgePairs,
    nodeCluster:nodeCluster,
    nodePos:nodePos,
    orderedDupIds:orderedDupIds,
    orderedDupItems:orderedDupIds.map(function(id){return byId[id]}),
    pairMap:pairMap,
    pairMeta:pairMeta,
    stats:{
      clusterCount:clusters.length,
      nodeCount:orderedDupIds.length,
      crossClusterCount:crossClusters.length,
      crossNodeCount:crossNodeCount,
      edgeCount:Object.keys(pairMap).length,
      bridgeCount:bridgePairs.length,
      splitCount:splitCount,
      modularity:total2m>0?Math.round(modQ*1000)/1000:0
    }
  };
}
function sortHousesAdjacent(list,graphObj){
  var arr=(list||[]).slice(),g=graphObj||build().graph;
  if(!g||!g.orderedDupIds||!g.orderedDupIds.length)return arr;
  var byId={},inDup={},out=[];
  arr.forEach(function(it){byId[it.id]=it});
  g.orderedDupIds.forEach(function(id){if(byId[id]){inDup[id]=1;out.push(byId[id])}});
  arr.forEach(function(it){if(!inDup[it.id])out.push(it)});
  return out;
}
function build(){
  loadIgnored();loadSmartPos();
  var src=activeItems(),P={},byId={};
  src.forEach(function(it){byId[it.id]=it});
  var inf=buildInfCtx(byId);
  textPairs(src).forEach(function(t){var a=byId[t.a],b=byId[t.b];if(a&&b)P[t.a+"|"+t.b]={a:a,b:b,why:t.why.slice(),img:[]}});
  if(imgPairs)imgPairs.forEach(function(r){var a=byId[r.a.id],b=byId[r.b.id];if(!a||!b)return;var o=addP(P,a,b,"img");if(!o)return;o.img.push(imgItemOf(r,o.a.id!==r.a.id))});
  filterGenericImgs(P,src.length);
  /* Cặp đã xác nhận «Trùng» (quét thông minh) là danh sách đúng: luôn giữ, không qua smartFilter/xác minh vùng xám. Ảnh phải còn thuộc đúng căn. */
  Object.keys(smartPos).forEach(function(k){
    var ids=k.split("|"),a=byId[ids[0]],b=byId[ids[1]],ims=smartImg[k];
    if(!a||!b||ignored[k]||!ims||!ims.length)return;
    var ha=a.im||[],hb=b.im||[];
    var ok=ims.filter(function(m){return ha.indexOf(m.x)>=0&&hb.indexOf(m.y)>=0});
    if(!ok.length)return;
    var o=addP(P,a,b,"img");if(!o)return;
    ok.forEach(function(m){if(!o.img.some(function(q){return q.x===m.x&&q.y===m.y}))o.img.push(imgItemOf(m,false))});
  });
  var all=Object.keys(P).map(function(k){var o=P[k];o.sc=sc(o);return o}).sort(function(a,b){return(ih(b)?1:0)-(ih(a)?1:0)||b.sc-a.sc||b.img.length-a.img.length});
  var active=[],ign=[];
  all.forEach(function(p){
    var pk=p.a.id+"|"+p.b.id;
    if(ignored[pk]){ign.push(p);return}
    if(!smartPos[pk]&&inf.isNeg(p.a.id,p.b.id))return;   /* suy luận bắc cầu âm: tự ẩn cặp chắc chắn không trùng */
    if(smartPos[pk]||inf.samePos(p.a.id,p.b.id))p.smPos=true;
    active.push(p);
  });
  var imgActive=active.filter(ih),txtStrong=active.filter(function(o){return !ih(o)&&o.sc>=MIN});
  var graph=clusterDupGraph(imgActive,src),emitted={},orderedStrong=[];
  graph.clusters.forEach(function(cl){
    cl.pairs.forEach(function(p){
      var pk=p.a.id+"|"+p.b.id;
      if(emitted[pk])return;
      emitted[pk]=1;p.cid=cl.id;p.cSize=cl.nodes.length;p.bridge=false;
      orderedStrong.push(p);
    });
    graph.bridgePairs.forEach(function(bp){
      var pk=bp.a.id+"|"+bp.b.id;
      if(emitted[pk])return;
      if(graph.nodeCluster[bp.a.id]===cl.id||graph.nodeCluster[bp.b.id]===cl.id){
        emitted[pk]=1;bp.cid=cl.id;bp.cSize=cl.nodes.length;bp.bridge=true;
        orderedStrong.push(bp);
      }
    });
  });
  txtStrong.forEach(function(p){p.cid=0;p.cSize=0;p.bridge=false;orderedStrong.push(p)});
  lastGraph=graph;
  return{
    strong:orderedStrong,
    weak:active.filter(function(o){return o.sc<MIN&&!ih(o)}),
    ign:ign,
    graph:graph,
    nSrc:src.length,
    nSkip:items.length-src.length
  }}
function simText(d,k,ori,n){
  var p=n!=null?n:Math.max(0,100-d);
  var tag=k==="pms"?"DINOv3 · Patch MaxSim + Spatial + Trung tâm + CSLS":k==="ps"?"DINOv3 · Patch MaxSim + Spatial + CSLS":k==="sp"?"DINOv3 · Spatial + CSLS":k==="pm"?"DINOv3 · Patch MaxSim + Trung tâm + CSLS":k==="pt"?"DINOv3 · Patch MaxSim + CSLS":k==="mc"?"DINOv3 · Trung tâm + CSLS":k==="cs"?"DINOv3 · CSLS":"DINOv3";
  return p>=99?"Giống ~100% ("+tag+")":"Giống "+p+"% ("+tag+")"}
function goN(it,t){if(!t)return'<span class="dpe">Không có</span>';return'<span class="dpgo" data-goto="'+esc(it.id)+'" role="link" tabindex="0" title="Xem căn này trong Danh sách">'+esc(t)+'</span>'}
function txtH(v){return v?esc(v):'<span class="dpe">Không có</span>'}
function linkH(u){var s=su(u);if(s)return'<a href="'+esc(s)+'" target="_blank" rel="noopener noreferrer">'+esc(s)+'</a>';return txtH(u)}
function paText(it){var a=[];if(it.p!=null)a.push(fmt(it.p)+" tr");if(it.ar)a.push(fmt(it.ar)+" m²");return a.join(" · ")}
function detailH(o,idx){
  function hasWhy(lb){return o.why.indexOf(lb)>=0}
  var rows=[
    {k:"Tên căn",hit:hasWhy("Tên giống nhau"),a:goN(o.a,o.a.n),b:goN(o.b,o.b.n)},
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
    var h='<div class="dpcmp"><div class="dpcmph"><b>'+esc(label+": ")+goN(it,it.n||"Chưa đặt tên")+'</b><span>'+list.length+' ảnh'+(nh?' · '+nh+' trùng':'')+'</span></div>';
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
  return '<div class="dprow"><div class="dpr"><span class="dpt"><b class="dpgo" data-goto="'+esc(it.id)+'" role="link" tabindex="0" title="Xem căn này trong Danh sách">'+esc(it.n)+'</b><small>'+esc(ad||"Chưa có địa chỉ")+(it.p!=null?" · "+fmt(it.p)+" tr":"")+(it.ar?" · "+fmt(it.ar)+" m²":"")+'</small></span><span class="pill" style="--c:var(--s-'+esc(k)+');--bg2:var(--b-'+esc(k)+')">'+esc(stName(k))+'</span></div>'+(allowWrite?'<button type="button" class="dpedit" data-edit="'+esc(it.id)+'" title="Sửa thông tin căn này" aria-label="Sửa căn '+esc(it.n)+'">Sửa</button><button type="button" class="dpdel" data-del="'+idx+':'+side+'" title="Xóa căn này" aria-label="Xóa căn '+esc(it.n)+'">Xóa</button>':'')+'</div>'}
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
/* Mức giống của cụm/cặp: hi ≥88 · mid ≥80 · lo còn lại (đổi màu viền thẻ và huy hiệu %) */
function simTone(n){return n>=88?"hi":n>=80?"mid":"lo"}
function simBadge(n){return '<span class="dpsim '+simTone(n)+'">'+n+'%</span>'}
/* Thẻ cụm: tiêu đề thu gọn được · chuỗi các căn liền kề nối nhau bằng thanh dọc · cặp trùng chéo (không liền kề) tách thành mục riêng */
function clusterCardsH(graph){
  var cls=((graph&&graph.clusters)||[]).filter(function(cl){return cl.nodes&&cl.nodes.length>=3});
  if(!cls.length)return '<p class="dpmess">Chưa có cụm nào từ 3 căn trở lên trùng chéo ảnh. Hãy bấm «Quét ảnh trùng» hoặc chuyển sang «Theo cặp».</p>';
  var h="";
  cls.forEach(function(cl){
    h+='<details class="dpclcard '+simTone(cl.maxSim)+'" open><summary class="dpclhead"><span class="dpclt"><b>Cụm #'+cl.id+'</b><small>'+cl.nodes.length+' căn liền kề</small></span><span class="dpclm"><span>'+cl.pairs.length+' cặp</span>'+simBadge(cl.maxSim)+'</span></summary><div class="dpclbody">';
    cl.pairs.forEach(function(p){var idx=viewList.push(p)-1;h+=pairH(p,idx,false)});
    h+='</div></details>';
  });
  return h;
}
function render(){
  var r=build(),list=showOne?r.strong.concat(r.weak):r.strong,el=G("dupl"),n=r.nSrc,hi=r.strong.filter(function(o){return o.sc>=3}).length,tg=G("duptog"),itg=G("dupigntog"),ignEl=G("dupignl");
  var gStats=r.graph&&r.graph.stats?r.graph.stats:{clusterCount:0,nodeCount:0,crossClusterCount:0,crossNodeCount:0};
  var crossCount=gStats.crossClusterCount||0,crossNodes=gStats.crossNodeCount||0,hasCross=crossCount>0;
  viewList=smView.slice();
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
  if(!hasCross&&viewMode==="clusters")viewMode="pairs";
  var vbar=G("dupviewbar"),seg=vbar?vbar.querySelector(".dpseg"):null,vp=G("dupvpair"),vc=G("dupvclust"),va=G("dupapplyord");
  var showReorder=gStats.clusterCount>0&&N()&&typeof N().reorder==="function";
  if(seg)seg.hidden=!hasCross;
  if(vbar)vbar.hidden=!hasCross&&!showReorder;
  if(vp)vp.setAttribute("aria-pressed",viewMode==="pairs"?"true":"false");
  if(vc){vc.hidden=!hasCross;vc.setAttribute("aria-pressed",viewMode==="clusters"?"true":"false");vc.textContent="Cụm liền kề ("+crossCount+" cụm · "+crossNodes+" căn)"}
  if(va)va.hidden=!showReorder;
  var mainHtml="";
  if(viewMode==="clusters"&&hasCross){
    mainHtml=clusterCardsH(r.graph);
  }else{
    var mainSlice=list.slice(0,limMain),prevKey=null,showClusterHdr=hasCross;
    mainHtml=mainSlice.map(function(o){
      var idx=viewList.push(o)-1,hdr="";
      if(showClusterHdr){
        var cl=o.cid>0?r.graph.clusters[o.cid-1]:null;
        var gKey=(cl&&cl.nodes.length>=3)?("c"+o.cid):(o.cid>0?"p2":"txt");
        if(gKey!==prevKey){
          prevKey=gKey;
          if(cl&&cl.nodes.length>=3){
            hdr='<div class="dpclusthdr"><b>Cụm #'+o.cid+' · '+cl.nodes.length+' căn liền kề</b><span>'+cl.pairs.length+' cặp '+simBadge(cl.maxSim)+'</span></div>';
          }else if(gKey==="p2"){
            hdr='<div class="dpclusthdr"><b>Cặp trùng ảnh (2 căn)</b><span>'+r.strong.filter(function(x){var xc=x.cid>0?r.graph.clusters[x.cid-1]:null;return xc&&xc.nodes.length<3}).length+' cặp</span></div>';
          }else{
            hdr='<div class="dpclusthdr"><b>Trùng thông tin (không trùng ảnh)</b><span>'+r.strong.filter(function(x){return !x.cid}).length+' cặp</span></div>';
          }
        }
      }
      return hdr+pairH(o,idx,false);
    }).join("")+(list.length>limMain?'<button type="button" class="link" data-more="main">Hiện thêm '+Math.min(LIMIT,list.length-limMain)+' cặp (còn '+(list.length-limMain)+')</button>':'');
  }
  G("dupsum").textContent=!items.length?"Chưa có căn nào.":!n?"Tất cả căn đều đã Loại.":(r.strong.length?r.strong.length+" cặp nghi trùng"+(hasCross?" · "+crossCount+" cụm ("+crossNodes+" căn trùng chéo)":(hi?" · "+hi+" gần như chắc chắn":"")):"Không có cặp nghi trùng")+" · "+n+" căn"+(r.nSkip?" (bỏ "+r.nSkip+" Loại)":"");
  tg.hidden=!r.weak.length||viewMode==="clusters";tg.textContent=showOne?"Ẩn "+r.weak.length+" cặp chỉ trùng 1 điều kiện":"Hiện thêm "+r.weak.length+" cặp chỉ trùng 1 điều kiện";tg.setAttribute("aria-pressed",showOne?"true":"false");
  itg.hidden=!r.ign.length;itg.textContent="Xem "+r.ign.length+" cặp →";
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
  loadIgnored();loadSmartPos();
  var k=o.a.id+"|"+o.b.id,prev=ignored[k],spPrev=smartPos[k],siPrev=smartImg[k],ts=Date.now();
  if(val){
    ignored[k]=ts;ignDirty[k]=ts;
    if(smartPos[k]||(k in posDirty)){delete smartPos[k];delete smartImg[k];posDirty[k]=0;posWriteLs()}
    delete openSet[k];delete openImgSet[k];
  }else{delete ignored[k];ignDirty[k]=0}
  undoPush(val?"Đã đánh dấu Không trùng":"Đã bỏ đánh dấu Không trùng",[{k:k,p:prev,sp:spPrev,si:siPrev}]);
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
  loadIgnored();loadSmartPos();var changed=false,spChg=false;
  Object.keys(ignored).forEach(function(k){var ids=k.split("|");if(ids[0]===id||ids[1]===id){delete ignored[k];ignDirty[k]=0;changed=true}});
  Object.keys(smartPos).forEach(function(k){var ids=k.split("|");if(ids[0]===id||ids[1]===id){delete smartPos[k];delete smartImg[k];posDirty[k]=0;spChg=true}});
  if(spChg)posWriteLs();
  if(changed||spChg)saveIgnored();
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
var zT=0,zt={},zShown={},zLoW=300;
/* Tải ảnh lớn dùng chung sổ ảnh của img.js (window.Img.pre/done/mark/pump): ảnh đã tải ở lightbox thì ở đây coi như xong, và ngược lại.
   Nếu img.js chưa nạp thì dùng bản tối giản bên dưới để hộp phóng to vẫn chạy. */
var zFb={};
function IMGX(){return window.Img&&window.Img.pre?window.Img:null}
function netOk(){var I=IMGX();return I?I.netOk():navigator.onLine!==false}
function swCtl(){var I=IMGX();return I?I.swCtl():!!(navigator.serviceWorker&&navigator.serviceWorker.controller)}
function zIsDone(u){var I=IMGX();return I?I.done(u):!!zFb[u]}
function zIsBusy(u){var I=IMGX();return I?I.busy(u):false}
function zMark(u){var I=IMGX();if(I)I.mark(u);else zFb[u]=1}
function zPump(){var I=IMGX();if(I)I.pump()}
/* zPre(url, callback, nền?): ảnh người dùng đang cần tải ngay, ảnh dự phòng xếp hàng nền */
function zPre(u,cb,bg){
  var I=IMGX();if(I){I.pre(u,cb,bg);return}
  if(!u)return;if(zFb[u]){if(cb)cb(true);return}
  var im=new Image();im.onload=function(){zFb[u]=1;if(cb)cb(true)};im.onerror=function(){if(cb)cb(false)};im.src=u}
var zC=null;
function zCache(){return zC||(zC=caches.open("img-v1").catch(function(e){zC=null;throw e}))}
function zHas(u){var m=/^(.*=w)(\d+)$/.exec(u);if(!m||!window.caches)return Promise.resolve(false);
  var w=+m[2],ws=[w].concat([200,300,360,640,900,1280].filter(function(x){return x>w&&x<=w*2}));
  return zCache().then(function(c){return Promise.all(ws.map(function(x){return c.match(m[1]+x)}))}).then(function(r){return r.some(Boolean)},function(){return false})}
function warmPair(o){
  if(!netOk()||!swCtl())return;
  var L=cmpLists(o),us=[];
  [L.A,L.B].forEach(function(arr){arr.slice(0,2).forEach(function(im){us.push(bigU(im.s))})});
  us.forEach(function(u){
    if(u.indexOf("https://lh3.")!==0||zIsDone(u)||zIsBusy(u))return;
    zHas(u).then(function(has){if(has)zMark(u);else zPre(u,null,true)})})}
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
  markImgs(G("dupl"));markImgs(G("dupignl"));markImgs(G("dupsmart"));zoomResync();
  if(smHook)smHook();
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
/* ===== Thu phóng 2 ngón (pinch) + kéo + lăn chuột cho từng ảnh trong hộp so sánh ===== */
var zS={a:{s:1,x:0,y:0,t:0},b:{s:1,x:0,y:0,t:0}},zStk=null,ZMAX=6;
function zEl(sd){var img=G("dupz"+(sd==="a"?1:2));return{img:img,st:img.parentNode,rb:img.parentNode.querySelector(".dpzrst")}}
function zApply(sd,anim){
  var z=zS[sd],e=zEl(sd),w=e.st.clientWidth,h=e.st.clientHeight;
  z.s=Math.min(ZMAX,Math.max(1,z.s));
  var mx=(z.s-1)*w/2,my=(z.s-1)*h/2;
  z.x=Math.min(mx,Math.max(-mx,z.x));z.y=Math.min(my,Math.max(-my,z.y));
  if(z.s<1.02){z.s=1;z.x=0;z.y=0}
  var on=z.s>1;
  if(anim){e.st.classList.add("zt");clearTimeout(z.tt);z.tt=setTimeout(function(){e.st.classList.remove("zt")},240)}
  e.img.style.transform=on?"translate("+z.x.toFixed(1)+"px,"+z.y.toFixed(1)+"px) scale("+z.s.toFixed(3)+")":"";
  e.img.classList.toggle("zm",on);
  if(e.rb){e.rb.hidden=!on;if(on)e.rb.textContent="↺ "+(Math.round(z.s*10)/10)+"×"}}
function zReset(sd,anim){var z=zS[sd];z.s=1;z.x=0;z.y=0;try{zApply(sd,anim)}catch(e){}}
function zInit(sd){
  var e=zEl(sd),st=e.st,img=e.img,z=zS[sd],P={},g=null,tap=null,dbl=null;
  var rb=document.createElement("button");rb.type="button";rb.className="dpzrst";rb.hidden=true;rb.setAttribute("aria-label","Đặt lại thu phóng");rb.title="Đặt lại thu phóng";
  rb.onclick=function(ev){ev.stopPropagation();z.t=Date.now();zReset(sd,true)};st.appendChild(rb);
  function rel(ev){var r=st.getBoundingClientRect();return{x:ev.clientX-r.left-r.width/2,y:ev.clientY-r.top-r.height/2}}
  function list(){return Object.keys(P).map(function(k){return P[k]})}
  function base(){
    var p=list();if(!p.length){g=null;return}
    var two=p.length>1;
    g={s:z.s,x:z.x,y:z.y,n:two?2:1,
      m:two?{x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2}:p[0],
      d:two?(Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)||1):0}}
  function far(ev){return tap&&(Math.abs(ev.clientX-tap.x)>8||Math.abs(ev.clientY-tap.y)>8)}
  st.addEventListener("pointerdown",function(ev){
    if(ev.target.closest&&ev.target.closest(".dpzrst"))return;
    if(img.hidden||Object.keys(P).length>=2)return;
    P[ev.pointerId]=rel(ev);
    try{st.setPointerCapture(ev.pointerId)}catch(x){}
    if(Object.keys(P).length===1)tap={t:Date.now(),x:ev.clientX,y:ev.clientY,mv:false};
    else if(tap)tap.mv=true;
    st.classList.add("zg");base()});
  st.addEventListener("pointermove",function(ev){
    if(!P[ev.pointerId]||!g)return;
    P[ev.pointerId]=rel(ev);
    var p=list();
    if(g.n===2&&p.length>1){
      var m={x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2},d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)||1;
      var ns=Math.min(ZMAX,Math.max(1,g.s*d/g.d)),qx=(g.m.x-g.x)/g.s,qy=(g.m.y-g.y)/g.s;
      z.s=ns;z.x=m.x-ns*qx;z.y=m.y-ns*qy;zApply(sd);z.t=Date.now();
      if(tap)tap.mv=true;
    }else if(g.n===1&&z.s>1){
      z.x=g.x+(p[0].x-g.m.x);z.y=g.y+(p[0].y-g.m.y);zApply(sd);
      if(far(ev)){tap.mv=true;z.t=Date.now()}
    }else if(far(ev))tap.mv=true});
  function up(ev){
    if(!P[ev.pointerId])return;
    var was=Object.keys(P).length;
    delete P[ev.pointerId];
    try{st.releasePointerCapture(ev.pointerId)}catch(x){}
    if(was>1)z.t=Date.now();
    if(Object.keys(P).length){base();return}
    st.classList.remove("zg");
    if(z.s<1.05&&z.s>1){z.t=Date.now();zReset(sd,true)}
    if(ev.type==="pointerup"&&tap&&!tap.mv&&Date.now()-tap.t<300&&z.s>1){
      var n=Date.now();
      if(dbl&&n-dbl.t<320&&Math.abs(dbl.x-tap.x)<30&&Math.abs(dbl.y-tap.y)<30){dbl=null;z.t=n;zReset(sd,true)}
      else dbl={t:n,x:tap.x,y:tap.y}}
    tap=null;g=null}
  st.addEventListener("pointerup",up);st.addEventListener("pointercancel",up);
  st.addEventListener("wheel",function(ev){
    if(img.hidden)return;
    ev.preventDefault();
    var m=rel(ev),ns=Math.min(ZMAX,Math.max(1,z.s*Math.exp(-ev.deltaY*(ev.ctrlKey?0.01:0.0015))));
    if(ns===z.s)return;
    var qx=(m.x-z.x)/z.s,qy=(m.y-z.y)/z.s;
    z.s=ns;z.x=m.x-ns*qx;z.y=m.y-ns*qy;zApply(sd);z.t=Date.now()},{passive:false});
  if(sd==="a")window.addEventListener("resize",function(){zReset("a");zReset("b")})}
function zBlocked(sd){return zS[sd].s>1||Date.now()-zS[sd].t<400}
/* Tìm trong trang một ảnh thu nhỏ của cùng ảnh gốc đã tải xong (khung danh sách, lưới…), lấy bản có độ phân giải cao nhất */
function zLoOf(s,except){
  var m=/lh3\.googleusercontent\.com\/d\/([^=?&]+)=w/.exec(imgSrc(s,zLoW)||"");
  if(!m||!/^[\w-]+$/.test(m[1]))return null;
  var best=null,bw=0;
  try{var l=document.querySelectorAll('img[src*="'+m[1]+'="]'),i,x;
    for(i=0;i<l.length;i++){x=l[i];if(x!==except&&x.complete&&x.naturalWidth>bw&&x.currentSrc){best=x.currentSrc;bw=x.naturalWidth}}}catch(e){}
  return best}
function stageShow(side,s,kind){
  zReset(side);
  var n=side==="a"?1:2,img=G("dupz"+n),emp=G("dupze"+n),st=img.parentNode,t=zt[side]=++zT;
  img.removeAttribute("data-rt");
  if(!s){img.hidden=true;emp.hidden=false;img.removeAttribute("src");st.classList.remove("busy");return}
  img.hidden=false;emp.hidden=true;
  var big=bigU(s);
  if(zIsDone(big)){setSrc(img,big);st.classList.remove("busy");zAnim(img,kind);return}
  /* Giống lightbox của img.js: có khung thu nhỏ đã tải sẵn thì hiện luôn, rõ nét, không mờ/xoay; chưa có mới dựng bản nhỏ và báo bận */
  var lo=zLoOf(s,img);
  if(lo){setSrc(img,lo);zAnim(img,kind);st.classList.remove("busy")}
  else{setSrc(img,imgSrc(s,zLoW));zAnim(img,kind);st.classList.add("busy")}
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
  if(zStk!==!!zoomCmp.stack){zStk=!!zoomCmp.stack;zReset("a");zReset("b")}
  G("dupz").classList.add("stk");G("dupz").classList.toggle("side",!zoomCmp.stack);
  G("dupz1n").textContent=o.a.n||"Căn 1";
  G("dupz2n").textContent=o.b.n||"Căn 2";
  [["dupz1n",o.a],["dupz2n",o.b]].forEach(function(p){var e=G(p[0]);e.className="dpgo";e.dataset.goto=p[1].id;e.title="Xem căn này trong Danh sách"});
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
  loadIgnored();loadSmartPos();
  zi.textContent=ignored[zk]?"Khôi phục nghi trùng":"Không phải trùng";
  var zy=G("dupzyes");if(zy){zy.hidden=!!ignored[zk];zy.textContent=smartPos[zk]?"Bỏ xác nhận trùng":"Trùng"}
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
function closeZoom(){zoomCmp=null;zT++;zt={};zReset("a");zReset("b");var z=G("dupz");if(z&&!z.hidden){z.hidden=true;return true}return false}
function msg(t,bad){var m=G("dupm");m.textContent=t||"";m.className="pm"+(bad?" bad":"")}

/* ---------- Quét ảnh bằng DINOv3 (embedding + cosine), thay cho dHash 3 nhánh cũ ---------- */
var ENG=(function(){var o=null;try{o=JSON.parse(localStorage.getItem("dup_eng")||"null")}catch(e){}return(o&&typeof o==="object")?o:{}})();   /* cài đặt mô hình lưu trong trình duyệt (khóa dup_eng); biến window.DUP_DINO_* nếu có sẽ được ưu tiên */
function engSave(){try{localStorage.setItem("dup_eng",JSON.stringify(ENG))}catch(e){}}
function cfgTagUi(dirty){var t=G("dupcfgtag"),c=G("dupcfgbtn");if(t)t.textContent=TH+"% · "+DS+"px"+(dirty?" *":"");if(c)c.classList.toggle("dirty",!!dirty)}
function engUi(def){var set=function(i,v){var e=G(i);if(e)e.value=String(v)};if(def){set("dupres",224);set("duppre","16");set("dupdev","auto");set("dupbn",4);set("duppace",0.6);set("dupmm",3);cfgTagUi(false);return}set("dupres",DS);set("duppre",F16?"16":"32");set("dupdev",DINO_GPU?"auto":"cpu");set("dupbn",ENG.bn===0?0:((ENG.bn>0&&ENG.bn<=8)?ENG.bn|0:4));set("duppace",PACE);set("dupmm",MM_MODE);cfgTagUi(false)}
function mmNorm(o){var v=o&&o.mm!==undefined?(+o.mm|0):3,mv=o&&o.mmv?(+o.mmv|0):0;if(mv<2)return v===0?0:3;return(v===0||v===2||v===3||v===4)?v:3}
var MM_MODE=mmNorm(ENG);
var F16=window.DUP_DINO_F16!==undefined?window.DUP_DINO_F16!==false:ENG.f16!==false;
var DS=(function(){var r=+window.DUP_DINO_RES||+ENG.res;return(r>=112&&r<=448&&r%16===0)?r:224})();   /* 224 = mặc định; DINOv3 patch 16 nên chỉ nhận bội số của 16 (112…448; càng cao càng chậm/tốn RAM). Đặt window.DUP_DINO_RES=160 trước khi nạp dup.js để nhanh ~2x (cache tách riêng) */
function cfgSfx(ds,f16){return (ds===256?"":"r"+ds)+(f16?"":"x")}
var CACHE_KEY="dhc12"+cfgSfx(DS,F16),PM_KEY="dpm7"+cfgSfx(DS,F16);
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
var RET_LAST="dup_last",RET_PEND="dup_pend",retiring=false,precisionWipeP=null;
function lsGetRaw(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsSetRaw(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function keyIsF16(k){return !/x$/.test(String(k||""))}
function retList(){var a=null;try{a=JSON.parse(lsGetRaw(RET_PEND)||"[]")}catch(e){}return Array.isArray(a)?a.filter(function(x){return x&&x.c}):[]}
function retCheck(){
  var last=null,pend=retList();
  try{last=JSON.parse(lsGetRaw(RET_LAST)||"null")}catch(e){}
  function add(c,p){if(c&&c!==CACHE_KEY&&!pend.some(function(x){return x.c===c}))pend.push({c:c,p:p||""})}
  if(last&&last.c){
    add(last.c,last.p);
    if(last.c===CACHE_KEY&&last.p&&last.p!==PM_KEY)wipeKey(last.p);
  }
  else{[["dhc8","dpm4"],["dhc9","dpm4"],["dhc10","dpm5"],["dhc11","dpm6"],["dhc11r224","dpm6r224"]].forEach(function(x){add(x[0],x[1])})}   /* lần đầu có tính năng này: gom các khóa của các bản trước */
  pend=pend.filter(function(x){return x.c!==CACHE_KEY});   /* quay lại cấu hình cũ thì giữ cache của nó */
  lsSetRaw(RET_LAST,JSON.stringify({c:CACHE_KEY,p:PM_KEY,f16:F16}));
  lsSetRaw(RET_PEND,JSON.stringify(pend));
  return pend}
function retNote(t){var e=G("dupretnote");if(e){e.textContent=t||"";e.hidden=!t}}
function readKey(k){
  var idb=N()&&N().idbGet,leg="";try{leg=ls(k)||""}catch(e){}
  if(!idb)return Promise.resolve(leg);
  return idb(k).then(function(v){return(typeof v==="string"&&v)?v:leg},function(){return leg})}
function wipeKey(k){try{if(ls(k))ls(k,"")}catch(e){}try{if(N()&&N().idbSave)N().idbSave(k,"")}catch(e){}}
function wipeKeyNow(k){
  if(!k)return Promise.resolve();
  var waitIdb=Promise.resolve();
  try{if(ls(k))ls(k,"")}catch(e){}
  try{localStorage.removeItem(k)}catch(e){}
  var idbm=typeof window!=="undefined"&&window.NB&&window.NB.IDBM;
  if(N()&&N().idbSave){try{N().idbSave(k,"")}catch(e){}}
  if(idbm&&typeof idbm.set==="function"){
    waitIdb=Promise.resolve(idbm.set(k,"")).catch(function(){});
  }else if(N()&&N().idbGet&&N().idbSave){
    waitIdb=Promise.resolve(N().idbGet(k)).then(function(v){
      if(typeof v==="string"&&v)return new Promise(function(r){setTimeout(r,850)});
    },function(){});
  }
  return waitIdb}
function clearModelFileCache(){
  if(typeof caches==="undefined"||!caches||typeof caches.keys!=="function")return Promise.resolve();
  return caches.keys().then(function(ks){
    var tasks=[];
    ks.forEach(function(k){
      if(/transformers|onnx/i.test(k)){
        tasks.push(caches.delete(k).catch(function(){}));
        return;
      }
      if(k==="img-v1"||k==="lib-v1"||/^(?:shell|next)-/.test(k))return;
      tasks.push(caches.open(k).then(function(c){
        return c.keys().then(function(reqs){
          return Promise.all(reqs.filter(function(r){
            var u=(r&&r.url)||"";
            return u.indexOf(DINO_ID)>=0||/\.onnx(?:_data)?(?:$|\?)/i.test(u);
          }).map(function(r){return c.delete(r).catch(function(){})}));
        });
      }).catch(function(){}));
    });
    return Promise.all(tasks);
  }).catch(function(){})}
function clearPrecisionCache(oldC,oldP,newC,newP,oldF16Flag){
  var keys={};
  function addK(k){if(k)keys[k]=1}
  addK(oldC);addK(oldP);addK(newC);addK(newP);addK(HS_KEY);if(oldC)addK("dsm1_"+oldC);if(newC)addK("dsm1_"+newC);
  var pend=retList();
  pend.forEach(function(x){
    if(x.c&&((oldF16Flag!==undefined&&keyIsF16(x.c)===oldF16Flag)||x.c===oldC||x.c===newC)){
      addK(x.c);if(x.p)addK(x.p);
    }
  });
  try{
    for(var i=0;i<localStorage.length;i++){
      var lk=localStorage.key(i);
      if(lk&&/^d(?:hc12|pm7)(?:r\d+)?x?$/.test(lk)){
        if((oldF16Flag!==undefined&&keyIsF16(lk)===oldF16Flag)||lk===oldC||lk===oldP||lk===newC||lk===newP)addK(lk);
      }
    }
  }catch(e){}
  pend=pend.filter(function(x){return !keys[x.c]&&!(x.p&&keys[x.p])});
  lsSetRaw(RET_PEND,JSON.stringify(pend));
  lsSetRaw(RET_LAST,JSON.stringify({c:newC||CACHE_KEY,p:newP||PM_KEY,f16:F16}));
  var run=function(){
    var jobs=Object.keys(keys).map(wipeKeyNow);
    jobs.push(clearModelFileCache());
    return Promise.all(jobs).then(function(){});
  };
  var p=(precisionWipeP?precisionWipeP.then(run,run):run()).then(function(){if(precisionWipeP===p)precisionWipeP=null},function(){if(precisionWipeP===p)precisionWipeP=null});
  precisionWipeP=p;
  return p}
function ensurePrecisionSync(){
  var last=null;
  try{last=JSON.parse(lsGetRaw(RET_LAST)||"null")}catch(e){}
  if(last&&last.c){
    var lastF16=last.f16!==undefined?!!last.f16:keyIsF16(last.c);
    if(lastF16!==F16)return clearPrecisionCache(last.c,last.p,CACHE_KEY,PM_KEY,lastF16);
  }
  return precisionWipeP||Promise.resolve()}
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
  cacheP=ensurePrecisionSync().then(function(){
    var idb=N()&&N().idbGet;
    if(!idb){cache=parseCache(ls(CACHE_KEY));clearOldCaches();retCheck();cacheLoaded=true;cacheP=null;return cache}
    return idb(CACHE_KEY).then(function(v){
      var leg=ls(CACHE_KEY);
      if(typeof v==="string"&&v){cache=parseCache(v);if(leg)ls(CACHE_KEY,"")}
      else if(leg){cache=parseCache(leg);if(N().idbSave)N().idbSave(CACHE_KEY,leg);ls(CACHE_KEY,"")}
      clearOldCaches();retCheck();
      cacheLoaded=true;cacheP=null;return cache;
    },function(){cache=parseCache(ls(CACHE_KEY));clearOldCaches();retCheck();cacheLoaded=true;cacheP=null;return cache});
  });
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
  hsP=ensurePrecisionSync().then(function(){
    var idb=N()&&N().idbGet;
    if(!idb)return fin(ls(HS_KEY));
    return idb(HS_KEY).then(function(v){return fin(typeof v==="string"?v:"")},function(){return fin(ls(HS_KEY))});
  });
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
var DINO_LIB="https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0",DINO_ID="olinesn/dinov3-vits16-lucid",DINO_LOCAL="models/",DINO_GPU=window.DUP_DINO_GPU!==undefined?window.DUP_DINO_GPU!==false:ENG.dev!=="cpu",FETCH_CONC=6,IS_APK=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());   /* trong APK mô hình đã nằm sẵn trong gói app: không chép thêm vào Cache Storage */
var DIM=384,DINO={p:null,m:null,T:null,err:null},dinoErr=null,DW={w:null,url:"",dev:"",gpu:false,seq:0,pend:{},q:[],busy:false,tm:0},BN=window.DUP_DINO_BN>0?Math.min(8,+window.DUP_DINO_BN|0):(ENG.bn===0?(DS<=160?4:(DS<=224?2:1)):(ENG.bn>0?Math.min(8,ENG.bn|0):4)),PACE=window.DUP_DINO_PACE>=0?+window.DUP_DINO_PACE:(ENG.pace>=0?+ENG.pace:0.6),PACE_MAX=250;
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
  function packPatches(d,baseOff,tk,D,S,box){
    var grid=Math.round(S/16),np=grid*grid;
    if(!(grid>0&&tk>=1+np))return null;
    var pStart=tk-np,tg=Math.min(14,grid),tCnt=tg*tg,fv=new Float32Array(tCnt*D),keep=[];
    var oy,ox,y0,y1,x0,x1,py,pxi,idx,j,cnt,norm,o,bad=false,cell=S/tg;
    for(oy=0;oy<tg;oy++){
      y0=tg===grid?oy:Math.floor(oy*grid/tg);
      y1=tg===grid?(oy+1):Math.max(y0+1,Math.floor((oy+1)*grid/tg));
      for(ox=0;ox<tg;ox++){
        x0=tg===grid?ox:Math.floor(ox*grid/tg);
        x1=tg===grid?(ox+1):Math.max(x0+1,Math.floor((ox+1)*grid/tg));
        o=(oy*tg+ox)*D;cnt=0;
        for(py=y0;py<y1;py++)for(pxi=x0;pxi<x1;pxi++){
          idx=baseOff+(pStart+py*grid+pxi)*D;cnt++;
          for(j=0;j<D;j++){var val=d[idx+j];if(val!==val||val===Infinity||val===-Infinity)bad=true;fv[o+j]+=val}
        }
        if(bad)return{bad:true};
        norm=0;
        for(j=0;j<D;j++){fv[o+j]/=cnt;norm+=fv[o+j]*fv[o+j]}
        norm=Math.sqrt(norm)||1;
        for(j=0;j<D;j++)fv[o+j]/=norm;
        if(box){
          var ix=Math.min((ox+1)*cell,box[2])-Math.max(ox*cell,box[0]);
          var iy=Math.min((oy+1)*cell,box[3])-Math.max(oy*cell,box[1]);
          if(ix>0&&iy>0&&(ix*iy)/(cell*cell)>=0.45)keep.push(oy*tg+ox);
        }else keep.push(oy*tg+ox);
      }
    }
    if(keep.length<4){keep=[];for(idx=0;idx<tCnt;idx++)keep.push(idx)}
    var vCnt=keep.length,meanP=new Float32Array(D),mn=0,ki;
    for(ki=0;ki<vCnt;ki++){o=keep[ki]*D;for(j=0;j<D;j++)meanP[j]+=fv[o+j]}
    for(j=0;j<D;j++)mn+=meanP[j]*meanP[j];
    mn=Math.sqrt(mn)||1;
    for(j=0;j<D;j++)meanP[j]/=mn;
    var q=new Int8Array(vCnt*D),sc=new Float32Array(vCnt),wt=new Float32Array(vCnt),wSum=0,qo;
    for(ki=0;ki<vCnt;ki++){
      o=keep[ki]*D;qo=ki*D;var mx=0,simM=0;
      for(j=0;j<D;j++){var v0=fv[o+j],av=v0<0?-v0:v0;if(av>mx)mx=av;simM+=v0*meanP[j]}
      var s=mx>0?(mx/127):0;
      sc[ki]=s;
      if(s>0)for(j=0;j<D;j++){var qi=Math.round(fv[o+j]/s);q[qo+j]=qi>127?127:qi<-127?-127:qi}
      var w0=1.15-0.65*(simM>0?simM:0);
      if(w0<0.35)w0=0.35;else if(w0>1.35)w0=1.35;
      wt[ki]=w0;wSum+=w0;
    }
    if(wSum>0)for(ki=0;ki<vCnt;ki++)wt[ki]=wt[ki]*vCnt/wSum;
    var pbx=box?box[0]:0,pby=box?box[1]:0,pbw=box?(box[2]-box[0]):S,pbh=box?(box[3]-box[1]):S,pos=new Float32Array(vCnt*2),pci;if(!(pbw>0))pbw=S;if(!(pbh>0))pbh=S;for(ki=0;ki<vCnt;ki++){pci=keep[ki];pos[ki*2]=((pci%tg+0.5)*cell-pbx)/pbw;pos[ki*2+1]=((((pci/tg)|0)+0.5)*cell-pby)/pbh}return{n:vCnt,q:q,sc:sc,wt:wt,pos:pos}}
  function infer(list,wantPt,boxes){
    var n=list.length,S=C.S,sz=S*S,f=new Float32Array(n*3*sz),k,i,p,u,o;
    for(k=0;k<n;k++){u=new Uint8ClampedArray(list[k]);o=k*3*sz;
      for(i=0;i<sz;i++){p=i*4;f[o+i]=(u[p]/255-.485)/.229;f[o+sz+i]=(u[p+1]/255-.456)/.224;f[o+2*sz+i]=(u[p+2]/255-.406)/.225}}
    return M({pixel_values:new T("float32",f,[n,3,S,S])}).then(function(r){
      var h=r.last_hidden_state||r.pooler_output||r[Object.keys(r)[0]],dm=h.dims,D=dm[dm.length-1],tk=dm.length===3?dm[1]:1,d=h.data,out=[],v,j,bad=false,pt;
      for(k=0;k<n;k++){
        v=new Float32Array(D);for(j=0;j<D;j++){v[j]=d[k*tk*D+j];if(v[j]!==v[j]||v[j]===Infinity||v[j]===-Infinity)bad=true}
        if(bad)break;
        if(wantPt){
          pt=dm.length===3?packPatches(d,k*tk*D,tk,D,S,boxes&&boxes[k]):null;
          if(pt&&pt.bad){bad=true;break}
          out.push({cls:v,pt:pt});
        }else out.push(v);
      }
      if(bad)throw new Error("NaN");
      return out})}
  function safe(list,wantPt,boxes){
    return infer(list,wantPt,boxes).catch(function(e){
      if(dev!=="webgpu")throw e;
      return degrade().then(function(){return infer(list,wantPt,boxes)}).catch(function(e2){
        if(dev==="webgpu")return wasm().then(function(){return infer(list,wantPt,boxes)});
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
      if(loc&&c.nocache)L.env.useBrowserCache=false;
      return gpuOk(c)}).then(function(g){
      if(!g)return wasm();
      var t=(g.f16&&c.f16!==false)?"fp16":"fp32";
      return build("webgpu",t).catch(function(){return t==="fp16"?build("webgpu","fp32"):Promise.reject(new Error("webgpu"))}).catch(wasm)}).then(function(){
      if(dev!=="webgpu")return;
      function chk(){return infer([testImg()],false)}
      return chk().catch(function(){return degrade().then(chk)}).catch(function(){return wasm()})})}
  self.onmessage=function(e){
    var m=e.data||{};
    if(m.t==="init")init(m.cfg).then(function(){say({t:"ready",dev:dev,dt:dt})},function(err){say({t:"initerr",msg:String(err&&err.message||err)})});
    else if(m.t==="run")safe(m.px,!!m.pt,m.boxes||null).then(function(v){
      var tr=[];
      function pushTr(b){if(b&&b.byteLength&&tr.indexOf(b)<0)tr.push(b)}
      if(m.pt)v.forEach(function(x){if(x.cls)pushTr(x.cls.buffer);if(x.pt){pushTr(x.pt.q.buffer);pushTr(x.pt.sc.buffer);pushTr(x.pt.wt.buffer);pushTr(x.pt.pos.buffer)}});
      else v.forEach(function(x){if(x)pushTr(x.buffer)});
      say({t:"res",id:m.id,v:v},tr);
    },function(err){say({t:"err",id:m.id,msg:String(err&&err.message||err)})})}}
function failPend(e){var p=DW.pend;DW.pend={};Object.keys(p).forEach(function(k){p[k].bad(e)})}
function killWorker(){if(DW.w){try{DW.w.terminate()}catch(e){}DW.w=null}if(DW.revoke){DW.revoke();DW.revoke=null}else if(DW.url){try{URL.revokeObjectURL(DW.url)}catch(e){}DW.url=""}}
function onWorkerMsg(e){
  var m=e.data||{},p=DW.pend[m.id];
  if(!p)return;
  delete DW.pend[m.id];
  if(m.t==="res")p.ok(m.v);else p.bad(new Error(m.msg||"lỗi suy luận"))}
function onWorkerErr(e){failPend(new Error(e&&e.message||"worker lỗi"));killWorker();DINO.p=null;DINO.err="worker lỗi: "+(e&&e.message||"")}
function loadWorker(){
  return new Promise(function(ok,bad){
    var w,done=false,url="";
    function revokeUrl(){if(DW.url===url)DW.url="";if(DW.revoke===revokeUrl)DW.revoke=null;if(url){try{URL.revokeObjectURL(url)}catch(e){}url=""}}
    try{url=URL.createObjectURL(new Blob(["("+dinoWorkerMain.toString()+")()"],{type:"text/javascript"}));DW.url=url;DW.revoke=revokeUrl;w=new Worker(url)}catch(e){revokeUrl();bad(e);return}
    w.onmessage=function(e){
      var m=e.data||{};
      if(m.t==="prog"&&!(scanning&&stopFlag))msg("Đang tải DINOv3… "+m.p+"%");
      else if(m.t==="ready"){done=true;revokeUrl();DW.w=w;DW.dev=m.dev+(m.dt?"-"+m.dt:"");DW.gpu=m.dev==="webgpu";w.onmessage=onWorkerMsg;w.onerror=onWorkerErr;ok(w)}
      else if(m.t==="initerr"){done=true;revokeUrl();try{w.terminate()}catch(_){}bad(new Error(m.msg))}};
    w.onerror=function(e){if(done)return;done=true;revokeUrl();try{w.terminate()}catch(_){}bad(new Error(e&&e.message||"worker lỗi"))};
    w.postMessage({t:"init",cfg:{lib:DINO_LIB,id:DINO_ID,S:DS,gpu:DINO_GPU,f16:F16,localBase:new URL(DINO_LOCAL,location.href).href,nocache:IS_APK}})})}
function loadMain(){
  var base=new URL(DINO_LOCAL,location.href).href;
  return import(DINO_LIB).then(function(L){
    return fetch(base+DINO_ID+"/config.json").then(function(r){return r.ok?r.json().then(function(){return true},function(){return false}):false},function(){return false}).then(function(loc){
      L.env.allowLocalModels=!!loc;
      if(loc){L.env.localModelPath=base;if(IS_APK)L.env.useBrowserCache=false}
      return L.AutoModel.from_pretrained(DINO_ID,{dtype:"fp32",device:"wasm",progress_callback:function(p){
        if(p&&p.status==="progress"&&/\.onnx$/.test(p.file||"")&&!(scanning&&stopFlag))msg("Đang tải DINOv3… "+Math.round(p.progress||0)+"%")}
      })}).then(function(m){DINO.m=m;DINO.T=L.Tensor;return m})})}
function dinoLoad(){
  if(DINO.p)return DINO.p;
  msg("Đang tải DINOv3 (lần đầu ~45–90 MB)…");
  DINO.p=ensurePrecisionSync().then(function(){
    return loadWorker().catch(function(){return loadMain()});
  }).then(function(r){DINO.err=null;return r}).catch(function(e){DINO.p=null;DINO.m=null;killWorker();DINO.err=String(e&&e.message||e);throw e});
  return DINO.p}
function packPatchesMain(d,baseOff,tk,D,S,box){
  var grid=Math.round(S/16),np=grid*grid;
  if(!(grid>0&&tk>=1+np))return null;
  var pStart=tk-np,tg=Math.min(14,grid),tCnt=tg*tg,fv=new Float32Array(tCnt*D),keep=[];
  var oy,ox,y0,y1,x0,x1,py,pxi,idx,j,cnt,norm,o,cell=S/tg;
  for(oy=0;oy<tg;oy++){
    y0=tg===grid?oy:Math.floor(oy*grid/tg);
    y1=tg===grid?(oy+1):Math.max(y0+1,Math.floor((oy+1)*grid/tg));
    for(ox=0;ox<tg;ox++){
      x0=tg===grid?ox:Math.floor(ox*grid/tg);
      x1=tg===grid?(ox+1):Math.max(x0+1,Math.floor((ox+1)*grid/tg));
      o=(oy*tg+ox)*D;cnt=0;
      for(py=y0;py<y1;py++)for(pxi=x0;pxi<x1;pxi++){idx=baseOff+(pStart+py*grid+pxi)*D;cnt++;for(j=0;j<D;j++)fv[o+j]+=d[idx+j]}
      norm=0;for(j=0;j<D;j++){fv[o+j]/=cnt;norm+=fv[o+j]*fv[o+j]}
      norm=Math.sqrt(norm)||1;for(j=0;j<D;j++)fv[o+j]/=norm;
      if(box){
        var ix=Math.min((ox+1)*cell,box[2])-Math.max(ox*cell,box[0]);
        var iy=Math.min((oy+1)*cell,box[3])-Math.max(oy*cell,box[1]);
        if(ix>0&&iy>0&&(ix*iy)/(cell*cell)>=0.45)keep.push(oy*tg+ox);
      }else keep.push(oy*tg+ox);
    }
  }
  if(keep.length<4){keep=[];for(idx=0;idx<tCnt;idx++)keep.push(idx)}
  var vCnt=keep.length,meanP=new Float32Array(D),mn=0,ki;
  for(ki=0;ki<vCnt;ki++){o=keep[ki]*D;for(j=0;j<D;j++)meanP[j]+=fv[o+j]}
  for(j=0;j<D;j++)mn+=meanP[j]*meanP[j];mn=Math.sqrt(mn)||1;for(j=0;j<D;j++)meanP[j]/=mn;
  var q=new Int8Array(vCnt*D),sc=new Float32Array(vCnt),wt=new Float32Array(vCnt),wSum=0,qo;
  for(ki=0;ki<vCnt;ki++){
    o=keep[ki]*D;qo=ki*D;var mx=0,simM=0;
    for(j=0;j<D;j++){var v0=fv[o+j],av=v0<0?-v0:v0;if(av>mx)mx=av;simM+=v0*meanP[j]}
    var s=mx>0?(mx/127):0;sc[ki]=s;
    if(s>0)for(j=0;j<D;j++){var qi=Math.round(fv[o+j]/s);q[qo+j]=qi>127?127:qi<-127?-127:qi}
    var w0=1.15-0.65*(simM>0?simM:0);if(w0<0.35)w0=0.35;else if(w0>1.35)w0=1.35;
    wt[ki]=w0;wSum+=w0;
  }
  if(wSum>0)for(ki=0;ki<vCnt;ki++)wt[ki]=wt[ki]*vCnt/wSum;
  var pbx=box?box[0]:0,pby=box?box[1]:0,pbw=box?(box[2]-box[0]):S,pbh=box?(box[3]-box[1]):S,pos=new Float32Array(vCnt*2),pci;if(!(pbw>0))pbw=S;if(!(pbh>0))pbh=S;for(ki=0;ki<vCnt;ki++){pci=keep[ki];pos[ki*2]=((pci%tg+0.5)*cell-pbx)/pbw;pos[ki*2+1]=((((pci/tg)|0)+0.5)*cell-pby)/pbh}return{n:vCnt,q:q,sc:sc,wt:wt,pos:pos}}
function mainRun(list,wantPt,boxes){
  return new Promise(function(ok){setTimeout(ok,0)}).then(function(){   /* nhường giao diện (chỉ dùng khi không có worker) */
    var n=list.length,S=DS,sz=S*S,f=new Float32Array(n*3*sz),k,i,p,u,o;
    for(k=0;k<n;k++){u=list[k];o=k*3*sz;
      for(i=0;i<sz;i++){p=i*4;f[o+i]=(u[p]/255-.485)/.229;f[o+sz+i]=(u[p+1]/255-.456)/.224;f[o+2*sz+i]=(u[p+2]/255-.406)/.225}}
    return DINO.m({pixel_values:new DINO.T("float32",f,[n,3,S,S])})}).then(function(r){
    var h=r.last_hidden_state||r.pooler_output||r[Object.keys(r)[0]],dm=h.dims,D=dm[dm.length-1],tk=dm.length===3?dm[1]:1,out=[],k;
    for(k=0;k<list.length;k++){
      var cls=Float32Array.from(h.data.subarray(k*tk*D,k*tk*D+D));
      out.push(wantPt?{cls:cls,pt:(dm.length===3?packPatchesMain(h.data,k*tk*D,tk,D,DS,boxes&&boxes[k]):null)}:cls);
    }
    return out})}
function runBatch(list,wantPt,boxes){
  if(DW.w)return new Promise(function(ok,bad){
    var bufs=[],tr=[],i,u,b;
    for(i=0;i<list.length;i++){
      u=list[i];
      if(!u||!u.buffer||!u.buffer.byteLength){bad(new Error("buffer ảnh rỗng"));return}
      b=(u.byteOffset===0&&u.byteLength===u.buffer.byteLength&&tr.indexOf(u.buffer)<0)?u.buffer:u.slice().buffer;
      bufs.push(b);
      if(tr.indexOf(b)<0)tr.push(b);
    }
    var id=++DW.seq;
    DW.pend[id]={ok:ok,bad:bad};
    try{DW.w.postMessage({t:"run",id:id,px:bufs,pt:!!wantPt,boxes:boxes||null},tr)}
    catch(e){delete DW.pend[id];bad(e)}});
  if(DINO.m)return mainRun(list,wantPt,boxes);
  return dinoLoad().then(function(){return runBatch(list,wantPt,boxes)})}
function spawnW(f){var a=[],i;for(i=0;i<FETCH_CONC;i++)a.push(f());return a}
function lumaStats(px,npx){
  var gray=new Float32Array(npx),i,sum=0,sum2=0,l;
  for(i=0;i<npx;i++){l=px[i*4]*.299+px[i*4+1]*.587+px[i*4+2]*.114;gray[i]=l;sum+=l;sum2+=l*l}
  var mean=sum/npx;
  return{gray:gray,v:sum2/npx-mean*mean}}
function detectBars(gray,gw,gh,ori,iw,ih){
  var i,j,s,s2,cnt,m,r0,r1,top,bot;
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
function inferPx(px,wantPt,box){
  return new Promise(function(ok,bad){DW.q.push({px:px,pt:!!wantPt,box:box||null,ok:ok,bad:bad});pump()}).then(function(r){
    return wantPt?r:encVec(r);
  }).catch(function(e){if(e&&typeof e==="object")e.isModel=true;throw e})}
var SP={n:0,ms:0,t0:0};
function spTxt(){if(SP.n<4||!SP.t0)return"";var sec=(Date.now()-SP.t0)/1000;return sec>0?" · "+(SP.n/sec).toFixed(1)+" ảnh/s · mô hình "+Math.round(SP.ms/SP.n)+" ms/ảnh":""}
function pump(){
  if(DW.busy||!DW.q.length)return;
  if(DW.q.length>=BN){flush();return}
  if(!DW.tm)DW.tm=setTimeout(flush,12)}
function flush(){
  if(DW.tm){clearTimeout(DW.tm);DW.tm=0}
  if(DW.busy||!DW.q.length)return;
  var b=DW.q.splice(0,BN),wantPt=b.some(function(x){return !!x.pt}),boxes=wantPt?b.map(function(x){return x.box||null}):null,t0=Date.now();DW.busy=true;if(!SP.t0)SP.t0=t0;
  function rel(){DW.busy=false;pump()}
  runBatch(b.map(function(x){return x.px}),wantPt,boxes).then(function(vs){
    b.forEach(function(x,i){var r=vs[i];x.ok(wantPt?(x.pt?r.pt:r.cls):r)});
  },function(e){b.forEach(function(x){x.bad(e)})}).then(function(){
    SP.n+=b.length;SP.ms+=Date.now()-t0;
    /* nghỉ ngắn sau mỗi batch khi chạy trên GPU hoặc luồng chính, để giao diện không bị giật */
    var gap=(DW.gpu||!DW.w)?Math.min(PACE_MAX,Math.round((Date.now()-t0)*PACE)):0;
    if(gap>0)setTimeout(rel,gap);else rel()})}
function grabFit(cx,im,sx,sy,sw,sh){
  cx.imageSmoothingEnabled=true;
  try{cx.imageSmoothingQuality="high"}catch(e){}
  cx.fillStyle="rgb(124,116,104)";
  cx.fillRect(0,0,DS,DS);
  var sc=Math.min(DS/sw,DS/sh),dw=Math.max(1,Math.round(sw*sc)),dh=Math.max(1,Math.round(sh*sc));
  var dx=Math.floor((DS-dw)/2),dy=Math.floor((DS-dh)/2);
  cx.drawImage(im,sx,sy,sw,sh,dx,dy,dw,dh);
  return{px:cx.getImageData(0,0,DS,DS).data,box:[dx,dy,dx+dw,dy+dh]}}
function analyzeFrame(im,iw,ih){
  var ori=iw>=ih?"L":"P",gw=ori==="L"?144:108,gh=ori==="L"?104:144,cv=document.createElement("canvas"),cx=cv.getContext("2d",{willReadFrequently:true}),st,bar=null;
  cv.width=gw;cv.height=gh;cx.drawImage(im,0,0,gw,gh);
  try{st=lumaStats(cx.getImageData(0,0,gw,gh).data,gw*gh);bar=detectBars(st.gray,gw,gh,ori,iw,ih)}catch(e){st={v:99};bar=null}
  return{ori:ori,cv:cv,cx:cx,v:st.v,bar:bar,crop:bar||{sx:0,sy:0,sw:iw,sh:ih}}}
/* Trả về Promise<chuỗi>: "" nếu ảnh trơn; ném lỗi nếu ảnh hỏng/mô hình lỗi */
function embedImg(im){
  var iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;
  if(!iw||!ih)return Promise.reject(new Error("ảnh rỗng"));
  var fr=analyzeFrame(im,iw,ih);
  if(fr.v<12)return Promise.resolve("");   /* ảnh trắng trơn / đen đặc */
  var cv=fr.cv,cx=fr.cx,crop=fr.crop;
  cv.width=DS;cv.height=DS;
  var pf=grabFit(cx,im,crop.sx,crop.sy,crop.sw,crop.sh).px,pb=null;
  var ratio=Math.max(crop.sw/crop.sh,crop.sh/crop.sw);
  if(ratio>1.38){
    var side=Math.min(crop.sw,crop.sh);
    var csx=crop.sx+Math.round((crop.sw-side)/2),csy=crop.sy+Math.round((crop.sh-side)/2);
    pb=grabFit(cx,im,csx,csy,side,side).px;
  }else if(fr.bar){
    pb=grabFit(cx,im,0,0,iw,ih).px;
  }
  if(pb&&lumaStats(pb,DS*DS).v<12)pb=null;
  return Promise.all([inferPx(pf),pb?inferPx(pb):null]).then(function(r){var out="E"+fr.ori+":"+r[0];return r[1]?out+":"+r[1]:out})}
var hashAbort={},mmAbort={},stopWaiters=[],modelFail=null;
/* Dừng quét: đặt cờ, hủy ngay các ảnh đang chờ tải, đánh thức các bước đang đợi (đồng bộ hash, tải mô hình) */
function stopScan(){
  stopFlag=true;
  Object.keys(hashAbort).forEach(function(k){try{hashAbort[k]()}catch(e){}});
  Object.keys(mmAbort).forEach(function(k){try{mmAbort[k]()}catch(e){}});
  var w=stopWaiters;stopWaiters=[];w.forEach(function(f){try{f()}catch(e){}});
  if(scanning||smRunning){syncScanUi();msg("Đang dừng…")}}
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
      if(isAborted(true)){stopNow();return}
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
/* 4 mức độ nhạy có sẵn: 87 Ít nhầm · 80 Vừa (mặc định) · 77 Nhạy · 73 Rất nhạy; ngoài ra nhập tự do 66–99%. */
function thNorm(t){t=Math.round(+t);return(t>=TH_MIN&&t<=99)?t:80}
function thUi(){var a=G("dupsens"),i=G("dupth");if(a)a.value=(TH===87||TH===80||TH===77||TH===73)?String(TH):"custom";if(i)i.value=String(TH);cfgTagUi(false)}
/* ===== Bộ lọc đa tầng: khớp 1-1 + độ nổi bật + ngữ cảnh căn =====
   Ngưỡng chính ts = độ nhạy chọn (mặc định 80%). Ngưỡng trung bình mid = ts - 3. Ngưỡng sàn tl = ts - 6 (tối thiểu 66%).
   Ảnh mỗi cặp căn được ghép 1-1 theo điểm cao nhất (tránh 1 ảnh trùng lặp nhiều góc bên kia tạo điểm ảo),
   sau đó kiểm tra kết hợp ngữ cảnh (phường/quận, giá, diện tích, thông tin trùng) trước khi giữ hoặc loại. */
var SM={ts:80,mid:77,tl:74,strong:86,cal:0,kept:0,cut:0,dedupCut:0,ctxCut:0,mmChecked:0,mmCut:0,mmBoost:0,spChecked:0,spCut:0,spSave:0};
function smartCalc(thOv){
  var t=thOv!=null?thOv:TH;
  SM.ts=t;
  SM.mid=Math.max(TH_MIN,t-3);
  SM.tl=Math.max(TH_MIN,t-6);
  SM.strong=Math.max(Math.min(93,t+6),Math.min(99,t+1));   /* luôn > ts, kể cả khi ts ≥ 93 */
  SM.cal=0;
  return SM}
function textScoreMap(src){
  var m={};
  textPairs(src).forEach(function(t){
    var s=0;(t.why||[]).forEach(function(w){s+=WT[w]||1});
    m[t.a+"|"+t.b]=s});
  return m}
function smartEvalGroup(m1All,na,nb,ctx,tsText,cfg,postVis,out){
  var ts=cfg.ts,mid=cfg.mid,tl=cfg.tl,strong=cfg.strong;
  SM.dedupCut+=m1All.dropped||0;
  var m1=[],i,r;
  for(i=0;i<m1All.length;i++){r=m1All[i];if(r.x===r.y||r.n>=tl)m1.push(r)}
  if(!m1.length)return null;
  var cov=m1.length/Math.max(1,Math.min(na,nb));
  var cExact=0,cVery=0,cStrong=0,cMid=0,hasVisStrong=false;
  for(i=0;i<m1.length;i++){
    r=m1[i];
    if(r.x===r.y){cExact++;cVery++;cStrong++;cMid++;hasVisStrong=true}
    else{
      if(r.n>=strong)cVery++;
      if(r.n>=ts)cStrong++;
      if(r.n>=mid)cMid++;
      if(r.k==="pms"||r.k==="ps"||r.k==="sp"||(r.k==="pm"&&r.n>=88))hasVisStrong=true;
    }
  }
  var keepPair=false;
  if(cExact>0){
    keepPair=true;
  }else if(cStrong>=2){
    if(!ctx.conflict||cStrong>=3||tsText>=1||cVery>=1||hasVisStrong)keepPair=true;
    else SM.ctxCut++;
  }else if(cStrong===1&&m1.length===1){
    var r0=m1[0],visOk0=r0.k==="pms"||r0.k==="ps"||r0.k==="sp"||(r0.k==="pm"&&r0.n>=88);
    var preVisTry=!postVis&&!r0.k&&MM_MODE!==0&&r0.n>=Math.min(90,ts+4);
    if(!ctx.conflict||tsText>=1||visOk0||r0.n>=95||preVisTry)keepPair=true;
    else SM.ctxCut++;
  }else if(cStrong===1&&m1.length>=2){
    if(!ctx.conflict||cMid>=2||m1.length>=3||tsText>=1||hasVisStrong)keepPair=true;
    else SM.ctxCut++;
  }else if(cStrong===0){
    if(m1.length>=3&&!ctx.conflict&&(cMid>=2||ctx.support>=1||cov>=0.45))keepPair=true;
    else if(m1.length>=2&&cMid>=2&&ctx.support>=1&&!ctx.conflict)keepPair=true;
  }
  if(keepPair){
    if(out){for(i=0;i<m1.length;i++){r=m1[i];out.push(r);if(r.n<ts&&r.x!==r.y)SM.kept++}}
    return m1;
  }
  SM.cut+=m1.length;
  return null}
function smartFilter(list,thOv,preSrc,preTMap,postVis){
  var cfg=smartCalc(thOv);
  var tMap=preTMap||textScoreMap(preSrc||activeItems()),g={},out=[];
  SM.kept=0;SM.cut=0;SM.dedupCut=0;SM.ctxCut=0;
  list.forEach(function(r){
    var lo=r.a.id<r.b.id?r.a:r.b,hi=lo===r.a?r.b:r.a,k=lo.id+"|"+hi.id;
    var o=g[k]||(g[k]={lo:lo,hi:hi,r:[]});
    o.r.push(r)});
  Object.keys(g).forEach(function(k){
    var o=g[k],m1All=oneToOnePairs(o.r,false),tsText=tMap[k]||0,ctx=pairCtx(o.lo,o.hi,tsText);
    var na=(o.lo.im||[]).filter(Boolean).length||1,nb=(o.hi.im||[]).filter(Boolean).length||1;
    smartEvalGroup(m1All,na,nb,ctx,tsText,cfg,postVis,out);
  });
  return out}
function cmpRaw(a,b){
  if(!a||!b)return 0;
  var m=dotV(a.v,b.v),x;
  if(a.t){x=dotV(a.t,b.v);if(x>m)m=x}
  if(b.t){x=dotV(a.v,b.t);if(x>m)m=x}
  if(a.t&&b.t){x=dotV(a.t,b.t);if(x>m)m=x}
  return m<0?0:m>1?100:m*100}
function cmpSig(a,b,th){
  if(!a||!b)return null;
  var n=Math.min(100,Math.round(cmpRaw(a,b)));
  return n>=th?{d:100-n,k:"",o:"",n:n}:null}
/* ===== Xác minh vùng xám (< SM.strong): DINOv3 Patch Token + MaxSim + Spatial Verification (mặc định), Trung tâm 75% (Multi-crop) & CSLS =====
   - Giữ nguyên tỉ lệ ảnh bằng Letterbox + loại patch viền pad.
   - Tối ưu vòng lặp patchMaxSim bằng register blocking 4x4 (d+=2), Float32 scratch buffer & sort in-place không cấp phát rác.
   - Kết hợp CSLS (Cross-domain Similarity Local Scaling) trên mọi kịch bản vùng xám để triệt tiêu hub ảnh phòng chung. */
var ptCache={},ptOrder=[],PT_CAP=240,mcCache={},mcOrder=[],MC_CAP=8000,mmInflight={};
var smMmPairRes={},smMmOrder=[],SM_MM_CAP=20000,smRawCache=null;
function putSmMmRes(s,val){
  if(smMmPairRes[s]===undefined){
    smMmOrder.push(s);
    while(smMmOrder.length>SM_MM_CAP){var old=smMmOrder.shift();delete smMmPairRes[old]}
  }
  smMmPairRes[s]=val}
var ptBufCap=0,ptBufA=null,ptBufB=null,ptVecCap=0,ptMaxA=null,ptMaxB=null,ptBgA=null,ptBgB=null;
function ensurePtBuf(na,nb){
  var needV=Math.max(256,na,nb);
  if(needV>ptVecCap){
    ptVecCap=needV;
    ptMaxA=new Float32Array(needV);ptMaxB=new Float32Array(needV);
    ptBgA=new Float32Array(needV);ptBgB=new Float32Array(needV);
  }
  var needD=needV*DIM;
  if(needD>ptBufCap){
    ptBufCap=needD;
    ptBufA=new Float32Array(needD);ptBufB=new Float32Array(needD);
  }
}
function putPtCache(s,val){
  if(ptCache[s]===undefined){
    ptOrder.push(s);
    while(ptOrder.length>PT_CAP){var old=ptOrder.shift();delete ptCache[old]}
  }
  ptCache[s]=val}
function putMcCache(s,val){
  if(mcCache[s]===undefined){
    mcOrder.push(s);
    while(mcOrder.length>MC_CAP){var old=mcOrder.shift();delete mcCache[old]}
  }
  mcCache[s]=val}
/* ===== Lưu bền cho Quét thông minh (IndexedDB): danh sách cặp thô ≥66% (theo chỉ số), vector Multi-crop (int8 base64) và kết quả so sâu từng cặp.
   Không lưu token Patch (quá nặng). Khóa theo CACHE_KEY (độ phân giải/độ chính xác) + ALGO_VER; danh sách cặp thô còn có chữ ký tập ảnh nên tự bỏ khi ảnh đổi. ===== */
/* Đo các bước tính nặng (chỉ ghi khi một lượt chạy liền >=40 ms) để Dbg báo đúng chỗ gây đứng giao diện */
var PERF={};
function pf(name,ms){if(!(ms>=40))return;var o=PERF[name]||(PERF[name]={n:0,sum:0,max:0});o.n++;o.sum+=ms;if(ms>o.max)o.max=Math.round(ms)}
var SMP_V=1,smpPK="",smpP=null,smpRaw=null,smpRawOf=null,smpT=0,smpBusy=false,smpMcSent={},smpCur={n:0,sv:""},smpPullP=null,smpPullAt=0,smpPullSV="",smpSyncBusy=false,smpLog={pull:null,push:null,srvTotal:null,pulled:0,pushed:0};
function smpKey(){return "dsm1_"+CACHE_KEY}
function smpHash(str){var h1=0x811c9dc5,h2=5381,i,c;for(i=0;i<str.length;i++){c=str.charCodeAt(i);h1=Math.imul(h1^c,16777619);h2=(Math.imul(h2,33)^c)|0}return (h1>>>0).toString(36)+"."+(h2>>>0).toString(36)+"."+str.length.toString(36)}
function smpLoad(){
  var key=smpKey();
  if(smpP&&smpPK===key)return smpP;
  smpPK=key;smpRaw=null;smpRawOf=null;smpMcSent={};smpCur={n:0,sv:""};smpPullP=null;smpPullAt=0;smpLog={pull:null,push:null,srvTotal:null,pulled:0,pushed:0};
  var idb=N()&&N().idbGet;
  if(!idb)return(smpP=Promise.resolve());
  smpP=Promise.resolve().then(function(){return idb(key)}).then(function(raw){
    if(smpPK!==key||typeof raw!=="string"||!raw)return;
    var o=null;try{o=JSON.parse(raw)}catch(e){}
    if(!o||o.v!==SMP_V||o.ck!==CACHE_KEY||o.algo!==ALGO_VER)return;
    var pre=MM_MODE+"|"+CACHE_KEY+"|";
    if(o.mc)Object.keys(o.mc).forEach(function(k){if(mcCache[k]===undefined){var v=decVec(o.mc[k]);if(v)putMcCache(k,v)}});
    if(o.mm)Object.keys(o.mm).forEach(function(k){if(k.indexOf(pre)===0&&smMmPairRes[k]===undefined)putSmMmRes(k,o.mm[k])});
    if(Array.isArray(o.ms))o.ms.forEach(function(k){smpMcSent[k]=1});
    if(o.cur&&typeof o.cur==="object")smpCur={n:+o.cur.n||0,sv:String(o.cur.sv||"")};
    if(o.raw&&o.raw.s&&Array.isArray(o.raw.p)&&Array.isArray(o.raw.h)&&Array.isArray(o.raw.u))smpRaw=o.raw;
  }).then(null,function(){});
  return smpP}
/* Dựng lại danh sách cặp thô từ bản lưu nếu chữ ký tập ảnh khớp; null nếu không dùng được */
function smpRawList(sig,byId){
  var R=smpRaw;if(!R||R.s!==smpHash(sig))return null;
  var out=[],i,q,a,b;
  for(i=0;i<R.p.length;i++){
    q=R.p[i];a=byId[R.h[q[0]]];b=byId[R.h[q[1]]];
    if(!a||!b)return null;
    out.push({a:a,b:b,x:R.u[q[2]],y:R.u[q[3]],d:q[4],k:q[5],o:q[6],n:q[7]})
  }
  return out}
function smpPackRaw(){
  if(!smRawCache||!smRawCache.list)return smpRaw;
  if(smpRawOf===smRawCache&&smpRaw)return smpRaw;
  var hi={},h=[],ui={},u=[],p=[],L=smRawCache.list,i,r;
  function H(id){var v=hi[id];if(v===undefined){v=h.length;hi[id]=v;h.push(id)}return v}
  function U(x){var v=ui[x];if(v===undefined){v=u.length;ui[x]=v;u.push(x)}return v}
  for(i=0;i<L.length;i++){r=L[i];p.push([H(r.a.id),H(r.b.id),U(r.x),U(r.y),r.d,r.k||"",r.o||"",r.n])}
  smpRaw={s:smpHash(smRawCache.sig),h:h,u:u,p:p};smpRawOf=smRawCache;
  return smpRaw}
function smpSaveSoon(){
  if(smpT)return;
  smpT=setTimeout(function(){
    smpT=0;
    if(smpBusy)return;
    var idb=N()&&N().idbSave;if(!idb)return;
    smpBusy=true;
    smpLoad().then(function(){
      var o={v:SMP_V,algo:ALGO_VER,ck:CACHE_KEY},pre=MM_MODE+"|"+CACHE_KEY+"|",mc={},mm={},k,v,n=0;
      var raw=smpPackRaw();if(raw){o.raw=raw;n++}
      for(k in mcCache){v=mcCache[k];if(v&&v.length===DIM){try{mc[k]=encVec(v);n++}catch(e){}}}
      for(k in smMmPairRes){if(k.indexOf(pre)===0){mm[k]=smMmPairRes[k];n++}}
      if(!n)return;
      o.mc=mc;o.mm=mm;o.ms=Object.keys(smpMcSent);o.cur=smpCur;
      return idb(smpKey(),JSON.stringify(o));
    }).then(function(){smpBusy=false;smpPush()},function(){smpBusy=false})
  },1500)}
/* ===== Đồng bộ lên Sheet (tab "MM") để PWA và APK dùng chung: vector Multi-crop theo mã ảnh + kết quả so sâu theo cặp ảnh.
   Chỉ ghi thêm, máy chủ giữ bản ghi đầu tiên; kéo về theo mốc dòng như hash. Danh sách cặp thô KHÔNG đồng bộ (dựng lại được từ hash). ===== */
function smpVC(){return "mc|"+ALGO_VER+"|"+CACHE_KEY}
function smpVP(){return "mm|"+MM_MODE+"|"+ALGO_VER+"|"+CACHE_KEY}
function smpOk(){return !!(N()&&N().apiGet&&N().apiPost)}
function smpApply(rows){
  var c=0,pre=MM_MODE+"|"+CACHE_KEY+"|";
  (rows||[]).forEach(function(r){
    var t=r&&r[0],k=r&&r[1],v=r&&r[2];
    if(!k||typeof v!=="string")return;
    if(t==="c"){var vec=decVec(v);if(vec){putMcCache(k,vec);smpMcSent[k]=1;c++}}
    else if(t==="p"){var o=null;try{o=JSON.parse(v)}catch(e){}if(o&&typeof o==="object"){o.s=1;putSmMmRes(pre+k,o);c++}}
  });
  return c}
function smpGet(q,t){
  /* Thử lại 1 lần; nếu vẫn lỗi thì gọi thêm 1 yêu cầu rất nhẹ để phân biệt: lỗi do phản hồi thật (lớn/chậm) hay do máy chủ/đường truyền/bản Code.gs. */
  var t0=Date.now();
  /* Thêm tham số vô hại "_" để mỗi lần gọi là một URL mới: tránh WebView dùng lại phản hồi/chuyển hướng cũ đã lỗi */
  function bust(x){return x+"&_="+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36)}
  function once(){return N().apiGet(bust(q),t)}
  return once().then(null,function(){
    return new Promise(function(r){setTimeout(r,1500)}).then(once).then(null,function(e2){
      var m=String((e2&&e2.message)||e2||"lỗi"),sec=Math.round((Date.now()-t0)/100)/10;
      return N().apiGet(bust("&action=mm&vc=x&vp=x&from=0"),15000).then(function(d){
        var dx=(d&&typeof d.total==="number")?"thăm dò nhẹ OK (tab MM "+d.total+" dòng) nên phản hồi thật bị lỗi/quá lớn":"máy chủ chưa hiểu action mm (chưa Deploy bản Code.gs mới?)";
        throw new Error(m+" · "+sec+"s · URL "+q.length+" ký tự · "+dx)
      },function(e3){
        /* Phân biệt: (a) yêu cầu no-cors tới được máy chủ = máy chủ trả trang lỗi thiếu header CORS; (b) không tới được = lỗi mạng. Và thử action hash để so sánh. */
        function nocors(){
          var NBo=window.NB,Nt=N(),u=(NBo&&NBo.apiUrl&&NBo.apiUrl())||(Nt.ls&&Nt.ls("nha-thue-url"))||"",k=(Nt.ls&&Nt.ls("nha-thue-key"))||"";
          if(!u||typeof fetch!=="function")return Promise.resolve("no-cors: không có URL");
          return fetch(u+"?key="+encodeURIComponent(k)+bust("&action=mm&vc=x&vp=x&from=0"),{mode:"no-cors",cache:"no-store"}).then(
            function(){return "no-cors tới được máy chủ (bị chặn đọc do CORS: máy chủ trả trang lỗi?)"},
            function(){return "no-cors cũng không tới được (lỗi mạng/chặn)"})}
        function hashp(){return N().apiGet(bust("&action=hash&count=1&v=x"),15000).then(function(){return "action hash vẫn OK"},function(){return "action hash cũng lỗi"})}
        return Promise.all([nocors(),hashp()]).then(function(a){
          throw new Error(m+" · "+sec+"s · URL "+q.length+" ký tự · thăm dò nhẹ cũng lỗi ("+String((e3&&e3.message)||e3)+") · "+a.join(" · "))})
      })
    })
  })
}
/* Đọc 1 trang tab MM: ưu tiên POST (đường đã chạy ổn với mmSet), nếu máy chủ cũ hoặc POST lỗi thì dùng GET (có chẩn đoán) */
function smpRead(from,t){
  var q="&action=mm&vc="+encodeURIComponent(smpVC())+"&vp="+encodeURIComponent(smpVP())+"&from="+from;
  return N().apiPost("mmRead",{vc:smpVC(),vp:smpVP(),from:from},t).then(null,function(ep){
    return smpGet(q,t).then(null,function(eg){
      throw new Error(String((eg&&eg.message)||eg)+" · POST mmRead: "+String((ep&&ep.message)||ep))})})}
function smpPull(){
  if(!smpOk())return Promise.resolve();
  var t0=Date.now(),pages=0,got=0,err="";
  return smpLoad().then(function(){
    var sv=smpVC()+"~"+smpVP();
    if(smpCur.sv!==sv)smpCur={n:0,sv:sv};
    function page(){
      return smpRead(smpCur.n,20000).then(function(d){
        if(!d||!d.ok||typeof d.next!=="number"){err=(d&&d.error)||"máy chủ chưa hỗ trợ action mm (cần triển khai Code.gs mới)";return}
        pages++;
        if(d.reset)smpCur.n=0;
        got+=smpApply(d.rows);smpCur.n=d.next;smpLog.srvTotal=d.total;
        if(d.more)return page()})}
    return page().then(function(){if(got)smpSaveSoon()})
  }).then(null,function(e){err=String(e&&e.message||e)}).then(function(){
    smpLog.pulled+=got;smpLog.pull={at:Date.now(),ms:Date.now()-t0,ok:!err,pages:pages,got:got,err:err}})}
/* Kéo về trước khi quét (tối đa ~12 giây; quá thời gian thì chạy tiếp, phần còn lại kéo nền) */
function smpWait(){
  if(!smpOk())return Promise.resolve();
  var sv=smpVC()+"~"+smpVP();
  if(!(smpPullP&&smpPullSV===sv&&Date.now()-smpPullAt<120000)){smpPullSV=sv;smpPullAt=Date.now();smpPullP=smpPull()}
  return Promise.race([smpPullP,new Promise(function(r){setTimeout(r,12000)})])}
function smpPush(){
  if(!(smpOk()&&canWrite())||smpSyncBusy)return Promise.resolve();
  smpSyncBusy=true;
  var pre=MM_MODE+"|"+CACHE_KEY+"|",q=[],sent=0,err="",t0=Date.now(),want=0;
  Object.keys(mcCache).forEach(function(k){
    var v=mcCache[k];
    if(smpMcSent[k]||!/^[\w-]{6,120}$/.test(k)||!v||v.length!==DIM)return;
    try{q.push(["c",k,encVec(v)])}catch(e){}});
  Object.keys(smMmPairRes).forEach(function(k){
    if(k.indexOf(pre)!==0)return;
    var v=smMmPairRes[k],kk=k.slice(pre.length),j;
    if(!v||v.s||!/^[\w-]{6,120}\|[\w-]{6,120}$/.test(kk))return;
    try{j=JSON.stringify(v)}catch(e){return}
    if(j.length<=1400)q.push(["p",kk,j])});
  want=q.length;
  function send(){
    var ch=q.splice(0,300);if(!ch.length)return;
    return N().apiPost("mmSet",{vc:smpVC(),vp:smpVP(),add:ch},30000).then(function(d){
      if(!(d&&typeof d==="object"&&d.ok!==false))throw new Error((d&&d.error)||"máy chủ từ chối mmSet");
      ch.forEach(function(x){if(x[0]==="c")smpMcSent[x[1]]=1;else{var e=smMmPairRes[pre+x[1]];if(e)e.s=1}});
      sent+=ch.length;
      return send()})}
  return Promise.resolve().then(send).then(null,function(e){err=String(e&&e.message||e)}).then(function(){
    smpSyncBusy=false;smpLog.pushed+=sent;
    smpLog.push={at:Date.now(),ms:Date.now()-t0,ok:!err,want:want,sent:sent,err:err};
    if(sent)smpSaveSoon()})}
/* ---------- Kiểm / tự sửa đồng bộ Quét thông minh (vector Multi-crop + kết quả so sâu) — dùng bởi dbg.js: Dup.mmState() / Dup.mmResync(mode) ---------- */
function smpStat(){
  var pre=MM_MODE+"|"+CACHE_KEY+"|",k,v,mc=0,mcU=0,pr=0,prU=0,ts=function(t){return t?new Date(t).toLocaleTimeString()+" ("+Math.round((Date.now()-t)/1000)+"s trước)":null};
  for(k in mcCache){v=mcCache[k];if(v&&v.length===DIM){mc++;if(!smpMcSent[k])mcU++}}
  for(k in smMmPairRes){if(k.indexOf(pre)===0){pr++;if(!smMmPairRes[k].s)prU++}}
  var P=smpLog.pull,Q=smpLog.push;
  return{
    api:{get:!!(N()&&N().apiGet),post:!!(N()&&N().apiPost),canWrite:!!canWrite()},
    ver:{vc:smpVC(),vp:smpVP()},blobKey:smpKey(),blobLoaded:smpPK===smpKey(),
    cursor:{n:smpCur.n,serverTotal:smpLog.srvTotal,behind:smpLog.srvTotal==null?null:Math.max(0,smpLog.srvTotal-smpCur.n),sv:smpCur.sv},
    local:{mc:mc,mcChuaDay:mcU,pairs:pr,pairsChuaDay:prU,rawPairs:smRawCache&&smRawCache.list?smRawCache.list.length:(smpRaw&&smpRaw.p?smpRaw.p.length+" (bản lưu)":0)},
    daDong:{keo:smpLog.pulled,day:smpLog.pushed},
    keoCuoi:P?{luc:ts(P.at),ms:P.ms,ok:P.ok,trang:P.pages,nhan:P.got,loi:P.err||null}:null,
    dayCuoi:Q?{luc:ts(Q.at),ms:Q.ms,ok:Q.ok,canDay:Q.want,daDay:Q.sent,loi:Q.err||null}:null,
    dangChay:{keo:!!smpPullP&&Date.now()-smpPullAt<12000,day:smpSyncBusy,luu:smpBusy,hen:!!smpT}}}
function smpState(){
  var r=smpStat();
  return{mc:r.local.mc,mcQ:r.local.mcChuaDay,pair:r.local.pairs,pairQ:r.local.pairsChuaDay,cur:smpCur.n,srv:smpLog.srvTotal,behind:r.cursor.behind,
    ver:r.ver,pull:r.keoCuoi,push:r.dayCuoi,busy:!!(smpSyncBusy||smpBusy||smpT),canW:!!canWrite(),api:smpOk()}}
function smpIdle(ms){
  return new Promise(function(res){
    var t0=Date.now();
    (function chk(){if((!smpSyncBusy&&!smpBusy&&!smpT)||Date.now()-t0>ms)res();else setTimeout(chk,300)})()})}
/* mode: "pull" (mặc định) = đọc lại TOÀN BỘ tab MM để biết máy chủ có gì, nhận phần máy chủ có, gỡ cờ "đã gửi" của mục máy chủ thực sự không có (gửi lỗi âm thầm / tab bị xóa) rồi gửi lại;
         "mirror" = lấy máy chủ làm chuẩn: bỏ các mục chỉ có trên máy. ("repush" coi như "pull"). */
function smpResync(mode){
  mode=mode==="mirror"?"mirror":"pull";
  if(!smpOk())return Promise.resolve({ok:false,msg:"Chưa có API máy chủ"});
  var r={srv:0,got:0,miss:0,drop:0,pushed:0,rejected:0,left:0},pre=MM_MODE+"|"+CACHE_KEY+"|",srvC={},srvP={};
  function readAll(){
    function page(){
      return smpRead(smpCur.n,25000).then(function(d){
        if(!d||!d.ok||typeof d.next!=="number")throw new Error((d&&d.error)||"máy chủ chưa hỗ trợ action mm (cần triển khai Code.gs mới)");
        if(d.reset){smpCur.n=0;srvC={};srvP={};r.got=0}
        (d.rows||[]).forEach(function(x){if(x[0]==="c")srvC[x[1]]=1;else if(x[0]==="p")srvP[x[1]]=1});
        r.got+=smpApply(d.rows);smpCur.n=d.next;smpLog.srvTotal=d.total;r.srv=d.total;
        if(d.more)return page()})}
    return page()}
  return smpIdle(30000).then(smpLoad).then(function(){
    smpCur={n:0,sv:smpVC()+"~"+smpVP()};
    return readAll()
  }).then(function(){
    var k,v,kk;
    for(k in mcCache){
      if(!/^[\w-]{6,120}$/.test(k))continue;
      if(srvC[k]){smpMcSent[k]=1;continue}
      if(mode==="mirror"){delete mcCache[k];delete smpMcSent[k];r.drop++}
      else if(smpMcSent[k]){delete smpMcSent[k];r.miss++}}
    for(k in smMmPairRes){
      if(k.indexOf(pre)!==0)continue;
      kk=k.slice(pre.length);v=smMmPairRes[k];
      if(!/^[\w-]{6,120}\|[\w-]{6,120}$/.test(kk))continue;
      if(srvP[kk]){if(v)v.s=1;continue}
      if(mode==="mirror"){delete smMmPairRes[k];r.drop++}
      else if(v&&v.s){delete v.s;r.miss++}}
    if(mode==="mirror"||!canWrite())return;
    var before=smpLog.pushed;
    return smpPush().then(function(){r.pushed=smpLog.pushed-before;return readAll()}).then(function(){
      /* kiểm lại: mục đã gửi mà máy chủ vẫn không có = bị máy chủ từ chối (khóa/giá trị không hợp lệ) */
      var kx;
      for(kx in mcCache){if(smpMcSent[kx]&&/^[\w-]{6,120}$/.test(kx)&&!srvC[kx])r.rejected++}
      for(kx in smMmPairRes){if(kx.indexOf(pre)===0&&smMmPairRes[kx]&&smMmPairRes[kx].s&&!srvP[kx.slice(pre.length)])r.rejected++}})
  }).then(function(){
    var st=smpStat();r.left=st.local.mcChuaDay+st.local.pairsChuaDay;
    r.ok=!r.rejected&&(mode==="mirror"||!canWrite()||!r.left);
    r.msg=(mode==="mirror"?"Đã bỏ "+r.drop+" mục chỉ có trên máy (lấy máy chủ làm chuẩn)":"Đã đọc lại máy chủ ("+r.srv+" dòng), nhận "+r.got+" mục"+(r.miss?", phát hiện "+r.miss+" mục máy chủ chưa có":"")+(canWrite()?", gửi lại "+r.pushed:", máy này chỉ xem nên không gửi"))+(r.rejected?" · "+r.rejected+" mục bị máy chủ từ chối":"")+(r.left?" · còn "+r.left+" mục chưa gửi":"");
    smpSaveSoon();
    return r
  },function(e){return{ok:false,msg:"Không đồng bộ được: "+(e&&e.message||e)}})}
function patchMaxSim(pa,pb){
  var na=pa.n,nb=pb.n,qa=pa.q,qb=pb.q,sa=pa.sc,sb=pb.sc,wa=pa.wt,wb=pb.wt,D=DIM;
  ensurePtBuf(na,nb);
  var fA=ptBufA,fB=ptBufB,maxA=ptMaxA.subarray(0,na),maxB=ptMaxB.subarray(0,nb);
  var sumA=ptBgA.subarray(0,na),sumB=ptBgB.subarray(0,nb);
  var i,j,d,o,sc;
  for(i=0;i<na;i++){
    o=i*D;sc=sa[i];maxA[i]=-1;sumA[i]=0;
    for(d=0;d<D;d+=4){fA[o+d]=qa[o+d]*sc;fA[o+d+1]=qa[o+d+1]*sc;fA[o+d+2]=qa[o+d+2]*sc;fA[o+d+3]=qa[o+d+3]*sc}
  }
  for(j=0;j<nb;j++){
    o=j*D;sc=sb[j];maxB[j]=-1;sumB[j]=0;
    for(d=0;d<D;d+=4){fB[o+d]=qb[o+d]*sc;fB[o+d+1]=qb[o+d+1]*sc;fB[o+d+2]=qb[o+d+2]*sc;fB[o+d+3]=qb[o+d+3]*sc}
  }
  for(i=0;i+3<na;i+=4){
    var oA0=i*D,oA1=oA0+D,oA2=oA1+D,oA3=oA2+D;
    var ma0=maxA[i],ma1=maxA[i+1],ma2=maxA[i+2],ma3=maxA[i+3];
    var ra0=sumA[i],ra1=sumA[i+1],ra2=sumA[i+2],ra3=sumA[i+3];
    for(j=0;j+3<nb;j+=4){
      var oB0=j*D,oB1=oB0+D,oB2=oB1+D,oB3=oB2+D;
      var s00=0,s01=0,s02=0,s03=0,s10=0,s11=0,s12=0,s13=0,s20=0,s21=0,s22=0,s23=0,s30=0,s31=0,s32=0,s33=0;
      for(d=0;d<D;d+=2){
        var a0=fA[oA0+d],a1=fA[oA1+d],a2=fA[oA2+d],a3=fA[oA3+d];
        var b0=fB[oB0+d],b1=fB[oB1+d],b2=fB[oB2+d],b3=fB[oB3+d];
        s00+=a0*b0;s01+=a0*b1;s02+=a0*b2;s03+=a0*b3;
        s10+=a1*b0;s11+=a1*b1;s12+=a1*b2;s13+=a1*b3;
        s20+=a2*b0;s21+=a2*b1;s22+=a2*b2;s23+=a2*b3;
        s30+=a3*b0;s31+=a3*b1;s32+=a3*b2;s33+=a3*b3;
        var d1=d+1;
        a0=fA[oA0+d1];a1=fA[oA1+d1];a2=fA[oA2+d1];a3=fA[oA3+d1];
        b0=fB[oB0+d1];b1=fB[oB1+d1];b2=fB[oB2+d1];b3=fB[oB3+d1];
        s00+=a0*b0;s01+=a0*b1;s02+=a0*b2;s03+=a0*b3;
        s10+=a1*b0;s11+=a1*b1;s12+=a1*b2;s13+=a1*b3;
        s20+=a2*b0;s21+=a2*b1;s22+=a2*b2;s23+=a2*b3;
        s30+=a3*b0;s31+=a3*b1;s32+=a3*b2;s33+=a3*b3;
      }
      var mb0=maxB[j],mb1=maxB[j+1],mb2=maxB[j+2],mb3=maxB[j+3];
      var rb0=sumB[j],rb1=sumB[j+1],rb2=sumB[j+2],rb3=sumB[j+3];
      if(s00>ma0)ma0=s00;if(s00>mb0)mb0=s00;if(s00>0){ra0+=s00;rb0+=s00}
      if(s01>ma0)ma0=s01;if(s01>mb1)mb1=s01;if(s01>0){ra0+=s01;rb1+=s01}
      if(s02>ma0)ma0=s02;if(s02>mb2)mb2=s02;if(s02>0){ra0+=s02;rb2+=s02}
      if(s03>ma0)ma0=s03;if(s03>mb3)mb3=s03;if(s03>0){ra0+=s03;rb3+=s03}
      if(s10>ma1)ma1=s10;if(s10>mb0)mb0=s10;if(s10>0){ra1+=s10;rb0+=s10}
      if(s11>ma1)ma1=s11;if(s11>mb1)mb1=s11;if(s11>0){ra1+=s11;rb1+=s11}
      if(s12>ma1)ma1=s12;if(s12>mb2)mb2=s12;if(s12>0){ra1+=s12;rb2+=s12}
      if(s13>ma1)ma1=s13;if(s13>mb3)mb3=s13;if(s13>0){ra1+=s13;rb3+=s13}
      if(s20>ma2)ma2=s20;if(s20>mb0)mb0=s20;if(s20>0){ra2+=s20;rb0+=s20}
      if(s21>ma2)ma2=s21;if(s21>mb1)mb1=s21;if(s21>0){ra2+=s21;rb1+=s21}
      if(s22>ma2)ma2=s22;if(s22>mb2)mb2=s22;if(s22>0){ra2+=s22;rb2+=s22}
      if(s23>ma2)ma2=s23;if(s23>mb3)mb3=s23;if(s23>0){ra2+=s23;rb3+=s23}
      if(s30>ma3)ma3=s30;if(s30>mb0)mb0=s30;if(s30>0){ra3+=s30;rb0+=s30}
      if(s31>ma3)ma3=s31;if(s31>mb1)mb1=s31;if(s31>0){ra3+=s31;rb1+=s31}
      if(s32>ma3)ma3=s32;if(s32>mb2)mb2=s32;if(s32>0){ra3+=s32;rb2+=s32}
      if(s33>ma3)ma3=s33;if(s33>mb3)mb3=s33;if(s33>0){ra3+=s33;rb3+=s33}
      maxB[j]=mb0;maxB[j+1]=mb1;maxB[j+2]=mb2;maxB[j+3]=mb3;
      sumB[j]=rb0;sumB[j+1]=rb1;sumB[j+2]=rb2;sumB[j+3]=rb3;
    }
    for(;j<nb;j++){
      var oB=j*D,mb=maxB[j],rb=sumB[j],s0=0,s1=0,s2=0,s3=0;
      for(d=0;d<D;d+=2){
        var bv=fB[oB+d];s0+=fA[oA0+d]*bv;s1+=fA[oA1+d]*bv;s2+=fA[oA2+d]*bv;s3+=fA[oA3+d]*bv;
        bv=fB[oB+d+1];s0+=fA[oA0+d+1]*bv;s1+=fA[oA1+d+1]*bv;s2+=fA[oA2+d+1]*bv;s3+=fA[oA3+d+1]*bv;
      }
      if(s0>ma0)ma0=s0;if(s0>mb)mb=s0;if(s0>0){ra0+=s0;rb+=s0}
      if(s1>ma1)ma1=s1;if(s1>mb)mb=s1;if(s1>0){ra1+=s1;rb+=s1}
      if(s2>ma2)ma2=s2;if(s2>mb)mb=s2;if(s2>0){ra2+=s2;rb+=s2}
      if(s3>ma3)ma3=s3;if(s3>mb)mb=s3;if(s3>0){ra3+=s3;rb+=s3}
      maxB[j]=mb;sumB[j]=rb;
    }
    maxA[i]=ma0;maxA[i+1]=ma1;maxA[i+2]=ma2;maxA[i+3]=ma3;
    sumA[i]=ra0;sumA[i+1]=ra1;sumA[i+2]=ra2;sumA[i+3]=ra3;
  }
  for(;i<na;i++){
    var oA=i*D,ma=maxA[i],ra=sumA[i];
    for(j=0;j<nb;j++){
      var oB=j*D,sd=0;
      for(d=0;d<D;d+=4)sd+=fA[oA+d]*fB[oB+d]+fA[oA+d+1]*fB[oB+d+1]+fA[oA+d+2]*fB[oB+d+2]+fA[oA+d+3]*fB[oB+d+3];
      if(sd>ma)ma=sd;if(sd>maxB[j])maxB[j]=sd;if(sd>0){ra+=sd;sumB[j]+=sd}
    }
    maxA[i]=ma;sumA[i]=ra;
  }
  var wSumA=0,wA=0,wSumB=0,wB=0,bgSumA=0,bgSumB=0;
  for(i=0;i<na;i++){var wai=wa[i];wSumA+=maxA[i]*wai;bgSumA+=(sumA[i]/nb)*wai;wA+=wai}
  for(j=0;j<nb;j++){var wbj=wb[j];wSumB+=maxB[j]*wbj;bgSumB+=(sumB[j]/na)*wbj;wB+=wbj}
  var mA=wA>0?wSumA/wA:0,mB=wB>0?wSumB/wB:0;
  var bgA=wA>0?bgSumA/wA:0,bgB=wB>0?bgSumB/wB:0;
  var sym=0.5*(mA+mB),asym=mA>mB?mA:mB,bgSym=0.5*(bgA+bgB);
  maxA.sort();maxB.sort();
  var kA=Math.max(1,Math.round(na*0.35)),kB=Math.max(1,Math.round(nb*0.35)),tA=0,tB=0;
  for(i=na-kA;i<na;i++)tA+=maxA[i];
  for(j=nb-kB;j<nb;j++)tB+=maxB[j];
  var top=0.5*(tA/kA+tB/kB);
  var base=0.65*sym+0.20*top+0.15*(asym<sym+0.12?asym:sym+0.12);
  return{
    sim:Math.round(Math.max(0,Math.min(1,base))*100),
    top:Math.round(Math.max(0,Math.min(1,top))*100),
    sym:Math.round(Math.max(0,Math.min(1,sym))*100),
    asym:Math.round(Math.max(0,Math.min(1,asym))*100),
    gap:Math.round(Math.max(0,sym-bgSym)*100)
  }}
/* ===== Spatial Verification (kịch bản 3 & 4): ghép patch mutual-NN rồi RANSAC (scale + tịnh tiến, không lật) trên toạ độ patch chuẩn hoá theo khung ảnh.
   Ảnh trùng thật (cùng cảnh, có thể crop/zoom nhẹ) có nhiều cặp patch khớp NHẤT QUÁN về hình học; ảnh phòng "na ná" (cùng kiểu nội thất) chỉ khớp rải rác, không theo mô hình nào.
   Ngưỡng SP_* và spGood/spStrong/spBad (trong verifyGrayZonePairs) có thể chỉnh; xem Dup.smart(): spChecked / spCut / spSave. */
var SP_MIN_SIM=0.50,SP_MARGIN=0.02,SP_TOL=0.09,SP_ITER=200,SP_MINSEP=0.12;
function spNeeded(pr,ts){return !!pr&&pr.sim>=40&&!(pr.sim>=88&&pr.top>=90)}
function spLsq(X,Y,idx){
  var n=idx.length,sx=0,sy=0,sxx=0,sxy=0,k,i;
  for(k=0;k<n;k++){i=idx[k];sx+=X[i];sy+=Y[i];sxx+=X[i]*X[i];sxy+=X[i]*Y[i]}
  var den=n*sxx-sx*sx;if(!(den>1e-6))return null;
  var s=(n*sxy-sx*sy)/den;return{s:s,t:(sy-s*sx)/n}}
function spaceOk(sx,sy){return sx>=0.5&&sx<=2&&sy>=0.5&&sy<=2&&sx/sy<=1.6&&sy/sx<=1.6}
function spatialVerify(pa,pb,preUnpacked){
  if(!pa||!pb||!pa.pos||!pb.pos)return null;
  var na=pa.n,nb=pb.n,D=DIM;
  if(na<8||nb<8)return null;
  if(!preUnpacked)ensurePtBuf(na,nb);
  var fA=ptBufA,fB=ptBufB,i,j,d;
  if(!preUnpacked){
    var qa=pa.q,qb=pb.q,sa=pa.sc,sb=pb.sc,o,sc;
    for(i=0;i<na;i++){o=i*D;sc=sa[i];for(d=0;d<D;d+=4){fA[o+d]=qa[o+d]*sc;fA[o+d+1]=qa[o+d+1]*sc;fA[o+d+2]=qa[o+d+2]*sc;fA[o+d+3]=qa[o+d+3]*sc}}
    for(j=0;j<nb;j++){o=j*D;sc=sb[j];for(d=0;d<D;d+=4){fB[o+d]=qb[o+d]*sc;fB[o+d+1]=qb[o+d+1]*sc;fB[o+d+2]=qb[o+d+2]*sc;fB[o+d+3]=qb[o+d+3]*sc}}
  }
  var bestB=new Float32Array(nb),idxB=new Int32Array(nb),bestA=new Float32Array(na),secA=new Float32Array(na),idxA=new Int32Array(na);
  for(j=0;j<nb;j++)bestB[j]=-2;
  for(i=0;i<na;i++){
    var oA=i*D,b1=-2,b2=-2,bj=-1;
    for(j=0;j<nb;j++){
      var oB=j*D,s=0;
      for(d=0;d<D;d+=4)s+=fA[oA+d]*fB[oB+d]+fA[oA+d+1]*fB[oB+d+1]+fA[oA+d+2]*fB[oB+d+2]+fA[oA+d+3]*fB[oB+d+3];
      if(s>b1){b2=b1;b1=s;bj=j}else if(s>b2)b2=s;
      if(s>bestB[j]){bestB[j]=s;idxB[j]=i}
    }
    bestA[i]=b1;secA[i]=b2;idxA[i]=bj;
  }
  /* mutual nearest neighbour + sim tối thiểu + margin so với ứng viên thứ 2 (loại texture lặp: tường, sàn) */
  var X1=[],Y1=[],X2=[],Y2=[],pA=pa.pos,pB=pb.pos,m=0;
  for(i=0;i<na;i++){
    j=idxA[i];
    if(j<0||idxB[j]!==i||bestA[i]<SP_MIN_SIM||bestA[i]-secA[i]<SP_MARGIN)continue;
    X1.push(pA[i*2]);Y1.push(pA[i*2+1]);X2.push(pB[j*2]);Y2.push(pB[j*2+1]);m++;
  }
  var den=Math.min(na,nb),res={m:m,inl:0,inlR:0,cov:0,sx:1,sy:1};
  if(m<4)return res;
  var seed=((m*2654435761)^(na*40503)^nb)>>>0;if(!seed)seed=1;
  function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296}
  function inl(sx,tx,sy,ty,out){
    var c=0,k;
    for(k=0;k<m;k++)if(Math.abs(X2[k]-(sx*X1[k]+tx))<=SP_TOL&&Math.abs(Y2[k]-(sy*Y1[k]+ty))<=SP_TOL){c++;if(out)out.push(k)}
    return c}
  var bestIn=0,bsx=1,btx=0,bsy=1,bty=0,it,p,q2,dx1,dy1,sx,sy,tx,ty,c;
  for(it=0;it<SP_ITER;it++){
    p=(rnd()*m)|0;q2=(rnd()*m)|0;if(p===q2)continue;
    dx1=X1[q2]-X1[p];dy1=Y1[q2]-Y1[p];
    if(Math.abs(dx1)<SP_MINSEP||Math.abs(dy1)<SP_MINSEP)continue;
    sx=(X2[q2]-X2[p])/dx1;sy=(Y2[q2]-Y2[p])/dy1;
    if(!spaceOk(sx,sy))continue;
    tx=X2[p]-sx*X1[p];ty=Y2[p]-sy*Y1[p];
    c=inl(sx,tx,sy,ty,null);
    if(c>bestIn){bestIn=c;bsx=sx;btx=tx;bsy=sy;bty=ty}
  }
  if(bestIn<3)return res;
  var inI=[];inl(bsx,btx,bsy,bty,inI);
  var fx=spLsq(X1,X2,inI),fy=spLsq(Y1,Y2,inI);   /* tinh chỉnh bằng bình phương tối thiểu trên tập inlier */
  if(fx&&fy&&spaceOk(fx.s,fy.s)){
    var in2=[];inl(fx.s,fx.t,fy.s,fy.t,in2);
    if(in2.length>=inI.length){inI=in2;bsx=fx.s;bsy=fy.s}
  }
  var cA={},cB={},k2,gx,gy;
  for(k2=0;k2<inI.length;k2++){
    c=inI[k2];
    gx=Math.min(3,Math.max(0,(X1[c]*4)|0));gy=Math.min(3,Math.max(0,(Y1[c]*4)|0));cA[gy*4+gx]=1;
    gx=Math.min(3,Math.max(0,(X2[c]*4)|0));gy=Math.min(3,Math.max(0,(Y2[c]*4)|0));cB[gy*4+gx]=1;
  }
  res.inl=inI.length;res.inlR=inI.length/den;
  res.cov=Math.min(Object.keys(cA).length,Object.keys(cB).length)/16;
  res.sx=bsx;res.sy=bsy;
  return res}
function buildOwnerMap(workPairs){
  var own={};
  function reg(s,id){if(!s||!id)return;(own[s]||(own[s]={}))[id]=1}
  activeItems().forEach(function(it){(it.im||[]).forEach(function(s){reg(s,it.id)})});
  (workPairs||[]).forEach(function(r){reg(r.x,r.a&&r.a.id);reg(r.y,r.b&&r.b.id)});
  return own}
function topKMeanPush(top,len,K,sc){
  if(len<K){top[len++]=sc;return len}
  var ti,mi=0,mv=top[0];
  for(ti=1;ti<K;ti++)if(top[ti]<mv){mv=top[ti];mi=ti}
  if(sc>mv)top[mi]=sc;
  return len}
function sampleHubPool(pool,cap){
  if(pool.length<=cap)return pool;
  var pri=pool.filter(function(x){return x.pri}),rest=pool.filter(function(x){return !x.pri});
  var need=Math.max(0,cap-pri.length),step=need>0?rest.length/need:rest.length+1,sampled=[],i;
  for(i=0;i<need&&Math.floor(i*step)<rest.length;i++)sampled.push(rest[Math.floor(i*step)]);
  return pri.concat(sampled)}
function buildClsHubMap(urls,ownerMap){
  var uMap={},pool=[],seenS={},src=activeItems(),i,j;
  urls.forEach(function(u){uMap[u]=1});
  src.forEach(function(it){
    (it.im||[]).forEach(function(s){
      if(!s||seenS[s])return;
      var sg=sigOf(s);
      if(sg){seenS[s]=1;pool.push({s:s,id:it.id,sg:sg,pri:!!uMap[s]})}
    });
  });
  pool=sampleHubPool(pool,360);
  var K=5,top=new Float32Array(K),out={};
  for(i=0;i<urls.length;i++){
    var u=urls[i],sgU=sigOf(u);if(!sgU)continue;
    var ownU=ownerMap[u]||{},len=0,cnt=0;
    for(j=0;j<pool.length;j++){
      var z=pool[j];
      if(z.s===u||ownU[z.id])continue;
      cnt++;
      len=topKMeanPush(top,len,K,cmpRaw(sgU,z.sg));
    }
    if(cnt>=4&&len>0){
      var sum=0;for(j=0;j<len;j++)sum+=top[j];
      out[u]=sum/len;
    }
  }
  return out}
function buildVecHubMap(urls,vecMap,ownerMap,K){
  var pool=[],i,j,uMap={};
  urls.forEach(function(u){uMap[u]=1});
  Object.keys(vecMap).forEach(function(s){
    var v=vecMap[s],own=ownerMap[s];
    if(v&&own)pool.push({s:s,own:own,v:v,pri:!!uMap[s]});
  });
  pool=sampleHubPool(pool,300);
  var top=new Float32Array(K),out={};
  for(i=0;i<urls.length;i++){
    var u=urls[i],vu=vecMap[u];if(!vu)continue;
    var ownU=ownerMap[u]||{},len=0,cnt=0;
    for(j=0;j<pool.length;j++){
      var z=pool[j],same=z.s===u;
      if(!same){for(var id in ownU)if(z.own[id]){same=true;break}}
      if(same)continue;
      cnt++;
      var sc=dotV(vu,z.v)*100;if(sc<0)sc=0;else if(sc>100)sc=100;
      len=topKMeanPush(top,len,K,sc);
    }
    if(cnt>=4&&len>0){
      var sum=0;for(j=0;j<len;j++)sum+=top[j];
      out[u]=sum/len;
    }
  }
  return out}
function buildPtHubMap(workPairs,ptResults){
  var byU={},out={};
  workPairs.forEach(function(r){
    var pr=ptResults[canonPairKey(r.a.id,r.b.id,r.x,r.y)];
    if(!pr)return;
    var mx=byU[r.x]||(byU[r.x]={});if(mx[r.b.id]===undefined||pr.sim>mx[r.b.id])mx[r.b.id]=pr.sim;
    var my=byU[r.y]||(byU[r.y]={});if(my[r.a.id]===undefined||pr.sim>my[r.a.id])my[r.a.id]=pr.sim;
  });
  Object.keys(byU).forEach(function(u){
    var m=byU[u],vals=Object.keys(m).map(function(id){return m[id]}).sort(function(a,b){return b-a});
    if(vals.length>=3){
      var k=Math.min(5,vals.length),s=0;
      for(var i=0;i<k;i++)s+=vals[i];
      out[u]=s/k;
    }
  });
  return out}
function extractPatchTokens(im,crop){
  if(!(DW.w||DINO.m))return Promise.resolve(null);
  var cv=document.createElement("canvas"),cx=cv.getContext("2d",{willReadFrequently:true});
  cv.width=DS;cv.height=DS;
  var g=grabFit(cx,im,crop.sx,crop.sy,crop.sw,crop.sh);
  return inferPx(g.px,true,g.box).catch(function(){return null})}
function extractMultiCrop(im,crop){
  if(!(DW.w||DINO.m))return Promise.resolve(null);
  var cv=document.createElement("canvas"),cx=cv.getContext("2d",{willReadFrequently:true});
  cv.width=DS;cv.height=DS;
  var sx=crop.sx+Math.round(crop.sw*0.125),sy=crop.sy+Math.round(crop.sh*0.125);
  var sw=Math.max(16,Math.round(crop.sw*0.75)),sh=Math.max(16,Math.round(crop.sh*0.75));
  var px=grabFit(cx,im,sx,sy,sw,sh).px;
  return inferPx(px).then(function(b64){return decVec(b64)},function(){return null});
}
function verifyImgOf(s,wantPt,wantMc){
  var hasPt=!wantPt||ptCache[s]!==undefined,hasMc=!wantMc||mcCache[s]!==undefined;
  if(hasPt&&hasMc)return Promise.resolve({pt:ptCache[s]||null,mc:mcCache[s]||null});
  var key=s+"|"+(wantPt?1:0)+(wantMc?1:0);
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
      var crop=analyzeFrame(im,iw,ih).crop;
      var pPt=(!wantPt||ptCache[s]!==undefined)?Promise.resolve(ptCache[s]||null):extractPatchTokens(im,crop).then(function(pt){if(pt)putPtCache(s,pt);return pt});
      var pMc=(!wantMc||mcCache[s]!==undefined)?Promise.resolve(mcCache[s]||null):extractMultiCrop(im,crop).then(function(mc){if(mc)putMcCache(s,mc);return mc});
      Promise.all([pPt,pMc]).then(function(arr){fin({pt:arr[0],mc:arr[1]})},function(){fin(null)});
    };
    im.onerror=function(){fin(null)};
    im.src=isLh?(u+"?dh=3"):u;
  });
  mmInflight[key]=p;return p}
function evalMmPair(r,pmRes,spRes,mcSim,clsMargin,mcMargin,ptMargin,ts,tl,ctx,tsText,nInPair,clsMin){
  var cMin=clsMin!=null?clsMin:2.5;
  var ptBad=pmRes?(pmRes.sim<Math.max(48,ts-26)||(pmRes.sim<Math.max(54,ts-20)&&pmRes.top<Math.max(66,ts-10))):false;
  var ptWeak=pmRes?(pmRes.sim<Math.max(58,ts-17)&&pmRes.top<Math.max(72,ts-5)):false;
  var ptGood=pmRes?(pmRes.sim>=Math.max(62,ts-14)||(pmRes.sim>=Math.max(57,ts-19)&&pmRes.top>=Math.max(76,ts-2))):false;
  var ptHighStrong=pmRes?(pmRes.sim>=72||(pmRes.sim>=68&&pmRes.top>=84&&pmRes.gap>=15)):false;
  var ptLowGap=pmRes?(pmRes.gap<16&&pmRes.sim<68&&pmRes.top<78):false;
  var ptMapped=pmRes?Math.min(99,Math.round(pmRes.sim*0.72+pmRes.top*0.28+8)):0;
  var spGood=!!spRes&&spRes.inl>=10&&spRes.inlR>=0.25&&spRes.cov>=0.30;
  var spStrong=!!spRes&&spRes.inl>=18&&spRes.inlR>=0.40&&spRes.cov>=0.45;
  var spBad=!!spRes&&((spRes.inlR<0.12&&spRes.inl<10)||spRes.inl<5||spRes.cov<0.15);
  var spMapped=spRes?Math.min(99,Math.round(62+spRes.inlR*70)):0;
  var mcBad=mcSim!==null&&mcSim<Math.max(58,ts-7);
  var mcWeak=mcSim!==null&&mcSim<ts-3;
  var mcGood=mcSim!==null&&mcSim>=ts;
  var cClsBad=clsMargin!==null&&clsMargin<=cMin&&r.n<94;
  var cClsWeak=clsMargin!==null&&clsMargin<=5.0;
  var cClsGood=clsMargin!==null&&clsMargin>=10.0;
  var cMcBad=mcMargin!==null&&mcMargin<=2.0&&mcSim<92;
  var cMcWeak=mcMargin!==null&&mcMargin<=4.5;
  var cMcGood=mcMargin!==null&&mcMargin>=9.0;
  var cPtBad=ptMargin!==null&&ptMargin<=1.5&&(pmRes.sim<64||(pmRes.sim<72&&pmRes.gap<20));
  var cPtWeak=ptMargin!==null&&ptMargin<=3.5;
  var cPtGood=ptMargin!==null&&ptMargin>=7.0;
  var cslsBad=false,cslsWeak=cClsWeak||cMcWeak||cPtWeak||ptLowGap,cslsGood=cClsGood||cMcGood||cPtGood;
  if(pmRes&&mcSim!==null)cslsBad=cPtBad||(cMcBad&&cClsBad)||(cClsBad&&!ptHighStrong&&(!ptGood||spBad||ptLowGap)&&!mcGood);
  else if(pmRes)cslsBad=cPtBad||(cClsBad&&!ptHighStrong&&(ptWeak||ptLowGap||spBad||r.n<ts+2));
  else if(mcSim!==null)cslsBad=cMcBad||(cClsBad&&(mcWeak||r.n<ts+2));
  else cslsBad=cClsBad&&((nInPair===1&&tsText<1)?r.n<94:r.n<ts+2);
  var clsDrop=(pmRes&&(r.n-pmRes.sim)>=26&&pmRes.top<78&&!spGood)
    ||(mcSim!==null&&(r.n-mcSim)>=13&&!ptGood&&!spGood)
    ||(pmRes&&pmRes.sim<Math.max(52,ts-22)&&pmRes.top<Math.max(68,ts-8)&&!spGood&&!mcGood);
  var hiGapBad=!!(pmRes&&r.n>=84&&(r.n-pmRes.sim)>=20&&!spGood&&(spBad||pmRes.gap<16||pmRes.top<82));
  var hiStyleFake=!!(pmRes&&spRes&&r.n>=84&&r.n<94&&spBad&&!ptHighStrong&&(pmRes.gap<15||(r.n-pmRes.sim)>=18)&&(ctx.conflict||(nInPair===1&&tsText<1)||(r.n-pmRes.sim)>=22));
  var drop=false;
  if(clsDrop||hiGapBad||hiStyleFake){
    drop=true;
  }else if(pmRes&&mcSim!==null){
    if(ptBad&&(mcBad||(!spStrong&&r.n<95)))drop=true;
    else if(mcBad&&!ptGood&&!spGood&&r.n<94)drop=true;
    else if(cslsBad&&((!ptGood&&!mcGood)||r.n<ts+4))drop=true;
    else if(spBad&&!ptGood&&!mcGood&&r.n<94)drop=true;
    else if((ptWeak||ptLowGap)&&spBad&&!mcGood&&r.n<94)drop=true;
    else if(ctx.conflict&&nInPair===1&&tsText<1&&r.n<95&&!(spGood||(ptGood&&mcGood)))drop=true;
    else if(nInPair===1&&tsText<1&&r.n<ts+3&&(ptWeak||mcWeak||(spBad&&!ptGood)||(cslsWeak&&!ptGood&&!mcGood)))drop=true;
  }else if(pmRes){
    if(ptBad&&!spStrong&&r.n<95)drop=true;
    else if(cslsBad&&(!ptGood||r.n<ts+4))drop=true;
    else if(spBad&&!ptGood&&r.n<94)drop=true;
    else if((ptWeak||ptLowGap)&&spBad&&r.n<94)drop=true;
    else if(ctx.conflict&&nInPair===1&&tsText<1&&r.n<95&&!(spGood||(ptGood&&!spBad&&!cslsWeak)))drop=true;
    else if(nInPair===1&&tsText<1&&r.n<ts+3&&(ptWeak||(spBad&&!ptGood)||(cslsWeak&&!ptGood)))drop=true;
  }else if(mcSim!==null){
    if(mcBad&&r.n<94)drop=true;
    else if(cslsBad&&(!mcGood||r.n<ts+4))drop=true;
    else if(ctx.conflict&&nInPair===1&&tsText<1&&r.n<95&&!mcGood)drop=true;
    else if(nInPair===1&&tsText<1&&r.n<ts+3&&(mcWeak||(cslsWeak&&!mcGood)))drop=true;
  }else{
    if(cslsBad)drop=true;
    else if(ctx.conflict&&nInPair===1&&tsText<1&&r.n<94&&cClsWeak)drop=true;
    else if(nInPair===1&&tsText<1&&r.n<ts+2&&cClsWeak)drop=true;
  }
  var spSaved=false;
  if(drop&&spStrong&&!ptBad&&!mcBad&&!clsDrop&&r.n>=ts-2){drop=false;spSaved=true}
  var hasVis=!!(pmRes||mcSim!==null),outEns=r.n,tagK=r.k||"",boosted=false;
  if(!drop&&(ptGood||mcGood||spStrong||(cslsGood&&!ptWeak&&!mcWeak&&r.n>=ts-2))){
    var ens=r.n,cAdj=((cslsGood&&!cslsWeak)?2:(cslsWeak&&!cslsGood?-2:0))+(spBad?-2:0);
    if(ptGood&&mcGood){ens=(spGood?Math.round(r.n*0.40+ptMapped*0.27+mcSim*0.20+spMapped*0.13):Math.round(r.n*0.45+ptMapped*0.30+mcSim*0.25))+cAdj;tagK=spGood?"pms":"pm"}
    else if(ptGood){ens=(spGood?Math.round(r.n*0.50+ptMapped*0.32+spMapped*0.18):Math.round(r.n*0.60+ptMapped*0.40))+cAdj;tagK=spGood?"ps":"pt"}
    else if(mcGood){ens=Math.round(r.n*0.65+mcSim*0.35)+cAdj;tagK="mc"}
    else if(spStrong){ens=Math.round(r.n*0.70+spMapped*0.30)+cAdj;tagK="sp"}
    else{ens=r.n+cAdj;tagK="cs"}
    outEns=Math.max(Math.max(tl,r.n-2),Math.min(99,Math.min(r.n+5,ens)));
    boosted=true;
  }
  var visStrong=hasVis&&!cslsWeak&&!ctx.conflict&&((spStrong&&ptGood)||(ptGood&&mcGood&&!spBad));
  return{drop:drop,spBad:spBad,spSaved:spSaved,hasVis:hasVis,ens:outEns,tagK:tagK,boosted:boosted,visStrong:visStrong,cClsBad:cClsBad,cslsWeak:cslsWeak};
}
function verifyGrayZonePairs(list,isScan,thOv,opts){
  opts=opts||{};
  if(!MM_MODE||!list.length)return Promise.resolve(list);
  var cfg=smartCalc(thOv),ts=cfg.ts,tl=cfg.tl,strong=cfg.strong;
  var tMap=opts.preTMap||textScoreMap(opts.preSrc||activeItems()),pairCnt={},grayPairs=[],visMax=Math.max(strong,96);
  list.forEach(function(r){
    var k=hkOf(r.a.id,r.b.id);
    pairCnt[k]=(pairCnt[k]||0)+1;
    if(r.x!==r.y&&(r.n<visMax||(r.n<98&&pairCtx(r.a,r.b,tMap[k]||0).conflict)))grayPairs.push(r);
  });
  SM.mmChecked=0;SM.mmCut=0;SM.mmBoost=0;SM.spChecked=0;SM.spCut=0;SM.spSave=0;
  var visInfo=opts.visInfo||null;
  function bumpVis(hk,checkedInc,hasVis,keptInc,ens,strongInc,dropInc){
    if(!visInfo)return;
    var vi=visInfo[hk]||(visInfo[hk]={checked:0,hasVis:false,kept:0,strongOk:0,dropped:0,maxEns:0});
    vi.checked+=checkedInc;if(hasVis)vi.hasVis=true;
    vi.kept+=keptInc;vi.strongOk+=strongInc;vi.dropped+=dropInc;
    if(ens>vi.maxEns)vi.maxEns=ens;
  }
  if(!grayPairs.length){
    if(visInfo)list.forEach(function(r){bumpVis(hkOf(r.a.id,r.b.id),0,false,1,r.n,0,0)});
    return Promise.resolve(list);
  }
  var workPairs=grayPairs,uniq={},urls=[],wantPt=MM_MODE===3||MM_MODE===4,wantMc=MM_MODE===2||MM_MODE===4;
  var extractPairs=[];
  workPairs.forEach(function(r){
    if(!uniq[r.x]){uniq[r.x]=1;urls.push(r.x)}
    if(!uniq[r.y]){uniq[r.y]=1;urls.push(r.y)}
    var cm=smMmPairRes[mmResKey(r.x,r.y)];
    var hasPt=!wantPt||(cm&&cm.pt!==undefined);
    var hasMc=!wantMc||(cm&&cm.mc!=null)||(mcCache[r.x]!==undefined&&mcCache[r.y]!==undefined);
    if(!(hasPt&&hasMc))extractPairs.push(r);
  });
  if(MC_CAP<urls.length+50)MC_CAP=urls.length+50;   /* vector Trung tâm nhỏ: giữ đủ cho mọi ảnh vùng xám để tính hub */
  var ownerMap=buildOwnerMap(workPairs),rCls=buildClsHubMap(urls,ownerMap);
  var modelReady=!!(DW.w||DINO.m);
  var prepModel=(extractPairs.length&&!modelReady&&navigator.onLine!==false)?dinoLoad().then(function(){return true},function(){return false}):Promise.resolve(modelReady||!extractPairs.length);
  return prepModel.then(function(canDino){
    if(isAborted(isScan))return list;
    var mmTxt="Đang xác minh "+(wantPt&&wantMc?"Patch MaxSim + Spatial + Trung tâm + CSLS":wantPt?"Patch Token + MaxSim + Spatial + CSLS":"Trung tâm 75% + CSLS");
    return Promise.resolve().then(function(){
      if(isAborted(isScan))return list;
      var workMap={},ptResults={},spResults={},doneN=0;
      workPairs.forEach(function(r){
        var rk0=canonPairKey(r.a.id,r.b.id,r.x,r.y),cm=smMmPairRes[mmResKey(r.x,r.y)];
        workMap[rk0]=r;
        if(cm){if(cm.pt)ptResults[rk0]=cm.pt;if(cm.sv)spResults[rk0]=cm.sv}
      });
      /* Chia đợt: mỗi đợt tối đa PT_CAP-40 ảnh khác nhau để ảnh đã trích không bị đẩy khỏi cache trước khi chấm điểm */
      var batches=[],cur=[],curU={},curN=0,LIM=(canDino&&wantPt)?Math.max(20,PT_CAP-40):1e9;
      extractPairs.forEach(function(r){
        var add=(curU[r.x]?0:1)+((r.y!==r.x&&!curU[r.y])?1:0);
        if(cur.length&&curN+add>LIM){batches.push(cur);cur=[];curU={};curN=0}
        cur.push(r);
        if(!curU[r.x]){curU[r.x]=1;curN++}
        if(!curU[r.y]){curU[r.y]=1;curN++}
      });
      if(cur.length)batches.push(cur);
      var bi=0;
      function scoreBatch(bp){
        var wi=0;
        function chunk(){
          if(isAborted(isScan))return Promise.resolve(false);
          var t0=Date.now();
          while(wi<bp.length){
            var r=bp[wi++];doneN++;
            if(canDino){
              var pr0=null,sv0=null,mc0=null;
              if(wantPt){
                var pa=ptCache[r.x],pb=ptCache[r.y];
                if(pa&&pb){var rk0=canonPairKey(r.a.id,r.b.id,r.x,r.y);pr0=patchMaxSim(pa,pb);ptResults[rk0]=pr0;if(spNeeded(pr0,ts)){sv0=spatialVerify(pa,pb,true);if(sv0)spResults[rk0]=sv0}}
              }
              if(wantMc){
                var ma0=mcCache[r.x],mb0=mcCache[r.y];
                if(ma0&&mb0)mc0=Math.min(100,Math.round(dotV(ma0,mb0)*100));
              }
              if(pr0||mc0!==null)putSmMmRes(mmResKey(r.x,r.y),{pt:pr0,sv:sv0,mc:mc0});
            }
            if(canDino&&wantPt&&wi<bp.length&&(Date.now()-t0>=24)){
              pf("patchScore",Date.now()-t0);
              if((isScan||smRunning)&&!stopFlag)msg("Đang so Patch MaxSim + Spatial + CSLS ("+doneN+"/"+extractPairs.length+" cặp)…");
              return new Promise(function(ok){setTimeout(ok,0)}).then(chunk);
            }
          }
          return Promise.resolve(true);
        }
        return chunk();
      }
      function runBatch(){
        if(isAborted(isScan))return Promise.resolve(false);
        if(bi>=batches.length)return Promise.resolve(true);
        var bp=batches[bi++],bu=[],bs={},ext,idx=0;
        bp.forEach(function(r){if(!bs[r.x]){bs[r.x]=1;bu.push(r.x)}if(!bs[r.y]){bs[r.y]=1;bu.push(r.y)}});
        if(canDino&&bu.length){
          if((isScan||smRunning)&&!stopFlag)msg(mmTxt+" ("+extractPairs.length+" cặp vùng xám"+(batches.length>1?" · đợt "+bi+"/"+batches.length:"")+")…");
          var w=function(){
            if(isAborted(isScan)||idx>=bu.length)return Promise.resolve();
            var u=bu[idx++];
            return verifyImgOf(u,wantPt,wantMc).then(w);
          };
          ext=Promise.all(spawnW(w));
        }else ext=Promise.resolve();
        return ext.then(function(){return scoreBatch(bp)}).then(function(ok){return ok?runBatch():false});
      }
      if(!canDino&&(isScan||smRunning)&&!stopFlag&&extractPairs.length)msg("Đang xác minh CSLS ("+extractPairs.length+" cặp vùng xám)…");
      return runBatch().then(function(ok){
        if(!ok||isAborted(isScan))return list;
        var rMc=(canDino&&wantMc)?buildVecHubMap(urls,mcCache,ownerMap,5):null;
        var rPt=(canDino&&wantPt)?buildPtHubMap(workPairs,ptResults):null;
        var kept=[];
        list.forEach(function(r){
          var rk=canonPairKey(r.a.id,r.b.id,r.x,r.y),hk=hkOf(r.a.id,r.b.id);
          if(!workMap[rk]){bumpVis(hk,0,false,1,r.n,0,0);kept.push(r);return}
          var cm=smMmPairRes[mmResKey(r.x,r.y)];
          var pmRes=wantPt?(ptResults[rk]||(cm&&cm.pt)||null):null,spRes=(pmRes&&(spResults[rk]||(cm&&cm.sv)))||null;
          var ma=wantMc?mcCache[r.x]:null,mb=wantMc?mcCache[r.y]:null;
          var mcSim=(ma&&mb)?Math.min(100,Math.round(dotV(ma,mb)*100)):(wantMc&&cm&&cm.mc!=null?cm.mc:null);
          var clsMargin=(rCls[r.x]!==undefined&&rCls[r.y]!==undefined)?(r.n-0.5*(rCls[r.x]+rCls[r.y])):null;
          var mcHub=(mcSim!==null&&rMc&&rMc[r.x]!==undefined&&rMc[r.y]!==undefined)?0.5*(rMc[r.x]+rMc[r.y]):null;
          var mcMargin=mcHub!==null?(mcSim-mcHub):null;
          var ptHub=(pmRes&&rPt&&rPt[r.x]!==undefined&&rPt[r.y]!==undefined)?0.5*(rPt[r.x]+rPt[r.y]):null;
          var ptMargin=ptHub!==null?(pmRes.sim-ptHub):null;
          if(!pmRes&&mcSim===null&&clsMargin===null){bumpVis(hk,0,false,1,r.n,0,0);kept.push(r);return}
          SM.mmChecked++;if(spRes)SM.spChecked++;
          var tsText=tMap[hk]||0,nInPair=pairCnt[hk]||1,ctx=pairCtx(r.a,r.b,tsText);
          var ev=evalMmPair(r,pmRes,spRes,mcSim,clsMargin,mcMargin,ptMargin,ts,tl,ctx,tsText,nInPair);
          if(ev.spSaved)SM.spSave++;
          if(ev.drop){
            SM.mmCut++;if(ev.spBad)SM.spCut++;
            bumpVis(hk,1,ev.hasVis,0,0,0,1);
            return;
          }
          if(ev.boosted){
            r={a:r.a,b:r.b,x:r.x,y:r.y,n:ev.ens,d:100-ev.ens,k:ev.tagK,o:r.o};
            SM.mmBoost++;
          }
          bumpVis(hk,1,ev.hasVis,1,ev.ens,ev.visStrong?1:0,0);
          kept.push(r);
        });
        var cutN=SM.mmCut;
        var finalOut=smartFilter(kept,thOv,opts.preSrc,tMap,true);
        finalOut.rej=cutN;
        return finalOut;
      });
    });
  });
}
function verifyList(list,isScan){
  var pre=smartFilter(list);
  return verifyGrayZonePairs(pre,isScan);
}
/* ===== So khớp ảnh toàn bộ căn chưa quét, lưu kết quả để lần sau chỉ so ảnh mới ===== */
var FAIL_TTL=300000,pm=null,pmLoaded=false,pmP=null,sigMemo={};
function sigOf(s){var v=sigMemo[s];if(v!==undefined)return v;var c=cache[s];v=c?parseSig(c):null;if(c!==undefined)sigMemo[s]=v;return v}
function pmEmpty(){return{th:TH,vf:VL,cal:smartCalc().cal,algo:ALGO_VER,mm:MM_MODE,done:{},pairs:[],seen:{},fail:{}}}
function pmStale(){return pm.th!==TH||(pm.vf||0)!==VL||(pm.cal||0)!==smartCalc().cal||(pm.algo||0)<ALGO_VER||(pm.mm!==undefined?pm.mm:3)!==MM_MODE}
function loadPm(){
  if(pmLoaded)return Promise.resolve(pm);
  if(pmP)return pmP;
  function fin(raw){
    var o=null;try{o=JSON.parse(raw||"null")}catch(e){}
    if(!o||typeof o!=="object"||!o.done||!o.pairs)o=pmEmpty();
    if(!o.seen||typeof o.seen!=="object")o.seen={};
    if(!o.fail||typeof o.fail!=="object")o.fail={};
    pm=o;pmLoaded=true;pmP=null;return pm}
  pmP=ensurePrecisionSync().then(function(){
    var idb=N()&&N().idbGet;
    if(!idb)return fin(ls(PM_KEY));
    return idb(PM_KEY).then(function(v){return fin(typeof v==="string"?v:"")},function(){return fin(ls(PM_KEY))});
  });
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
  smartCalc();var allJ=oldJ.concat(newJ),A=allJ.map(function(x){return sigOf(x.s)}),out=[],seen={},p=oldJ.length,jj=0;
  /* Mỗi lượt chạy tối đa ~12 ms rồi nhường giao diện (trước đây 25 ảnh/lượt, mỗi lượt có thể đứng ~400 ms trên máy yếu) */
  function step(){
    var t0=Date.now(),cnt=0,j,m,k,a,b;
    while(p<allJ.length){
      b=allJ[p];
      while(jj<p){
        j=jj++;a=allJ[j];
        if(a.it.id!==b.it.id){
          m=null;
          if(a.s===b.s)m={d:0,n:100,k:"",o:(A[j]||A[p])?(A[j]||A[p]).ori:""};
          else if(A[j]&&A[p])m=cmpSig(A[j],A[p],SM.tl);
          if(m){k=a.it.id+"|"+b.it.id+"|"+a.s+"|"+b.s;if(!seen[k]){seen[k]=1;out.push({a:a.it,b:b.it,x:a.s,y:b.s,d:m.d,k:m.k,o:m.o||"",n:m.n})}}
        }
        if((++cnt&31)===0&&Date.now()-t0>=12){pf("matchInc",Date.now()-t0);return new Promise(function(r){setTimeout(r,0)}).then(step)}
      }
      p++;jj=0;
    }
    pf("matchInc",Date.now()-t0);
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
var scanDoneWaiters=[];
function waitScanStop(){if(!scanning)return Promise.resolve();stopScan();return new Promise(function(r){scanDoneWaiters.push(r)})}
function scan(auto){
  if(scanning)return;
  var cnt=0;activeItems().forEach(function(it){(it.im||[]).forEach(function(s){if(s)cnt++})});
  if(cnt<2){msg("Chưa đủ ảnh để so.");return}
  scanning=true;stopFlag=false;syncScanUi();
  var bar=G("dupbar").firstChild,stopP=new Promise(function(r){stopWaiters=[r]}),badSet={},offErr=false,t={ok:0,bad:0,flat:0,nL:0,nP:0,newPairs:0,căn:0};
  SP.n=0;SP.ms=0;SP.t0=0;modelFail=null;dinoErr=null;bar.style.transition="none";bar.style.width="0";void bar.offsetWidth;bar.style.transition="";
  function end(){
    savePm();saveCache();hsPushSoon();smpSaveSoon();
    scanning=false;stopWaiters=[];syncScanUi();
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
    if(smFinNote){var fm=G("dupm");if(!stopFlag&&!offErr&&!dinoErr&&!modelFail&&fm&&!/\bbad\b/.test(fm.className))fm.textContent=smFinNote+" · "+fm.textContent;smFinNote=""}
    var sdw=scanDoneWaiters;scanDoneWaiters=[];sdw.forEach(function(f){try{f()}catch(e){}});
    if(hsPendR){var pr=hsPendR;hsPendR=null;hsRefresh(pr)}}
  function runAll(total){
    if(stopFlag)return Promise.resolve();
    var B=pendingItems(badSet);
    if(!B.length)return Promise.resolve();
    var newJ=[],urls=[],seenU={},Bid={},now=Date.now();
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
        doneU++;var cur=B.length*(doneU/Math.max(1,urls.length));
        bar.style.width=Math.min(100,cur/total*100)+"%";
        msg("Đang so ảnh "+Math.min(total,Math.floor(cur))+"/"+total+" căn…"+spTxt())
      }).then(worker)}
    return Promise.all(spawnW(worker)).then(function(){
      if(stopFlag)return;
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
        bar.style.width="100%"})})}
  if(hsPhase&&navigator.onLine!==false)msg("Đang đồng bộ hash…");
  Promise.all([loadCache(),loadPm(),navigator.onLine===false?Promise.resolve():Promise.race([hsWait(),stopP])]).then(function(){
    if(stopFlag)return;
    if(hsPendR){if(hsPendR.chg){pm=pmEmpty();savePm()}hsPendR=null}   // hash vừa đổi theo máy chủ: quét lại từ hash mới
    if(pmStale()){pm=pmEmpty();savePm()}
    if(!auto)pm.fail={};
    var pendList=pendingItems(),total=pendList.length;
    if(!total){return}
    var needModel=pendList.some(function(it){return (it.im||[]).some(function(s){return s&&!pm.done[s]&&cache[s]===undefined})});
    if(needModel&&navigator.onLine===false){offErr=true;return}
    return Promise.race([
      needModel?dinoLoad().then(function(){return 0},function(e){if(!stopFlag)dinoErr=e||new Error("lỗi không rõ");return 1}):Promise.resolve(0),
      stopP.then(function(){return 2})
    ]).then(function(r){if(r!==0)return;msg("Đang so ảnh 0/"+total+" căn…");return runAll(total)})
  }).then(end,function(){end()})}
/* Bấm tên căn: đóng hộp thoại, về tab Danh sách, cuộn tới căn đó và nháy viền (giống lúc đóng Checklist) */
function goHouse(id){
  var nt=N();if(!id||!nt)return;
  if(typeof nt.showItem!=="function"){alert("Cần cập nhật app: hãy đóng hẳn rồi mở lại để dùng tính năng này.");return}
  close();
  setTimeout(function(){nt.showItem(id)},30)}
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
function skew(n,v){var m=n+" (cầu nối v"+KV+") không khớp index.html (v"+v+"). Hãy đóng hẳn rồi mở lại app để cập nhật.";try{console.error(m);var d=document.createElement("div");d.textContent=m;d.style.cssText="position:fixed;left:0;right:0;top:0;z-index:99999;padding:10px 14px;background:#b3261e;color:#fff;font:14px/1.4 sans-serif";(document.body||document.documentElement).appendChild(d)}catch(e){}}
function init(nt){
  if(nt)NT=nt;
  if(inited)return;
  var nv=NT||window.NT;
  if(nv&&nv.v!==KV){skew("dup.js",nv.v);return}
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
  /* Nhấn nút: lan một vòng sáng màu chủ đạo ngay lúc chạm (trước khi hộp thoại mở) */
  b.addEventListener("pointerdown",function(){b.classList.remove("dprp");void b.offsetWidth;b.classList.add("dprp")},{passive:true});
  b.addEventListener("animationend",function(e){if(e.animationName==="dpripple")b.classList.remove("dprp")});
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
  G("dupx3").onclick=close;
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
  G("dupz1").onclick=function(){if(zBlocked("a"))return;stepCmpZoom("a",1)};
  G("dupz2").onclick=function(){if(zBlocked("b"))return;stepCmpZoom("b",1)};
  G("dupz1prev").onclick=function(){stepCmpZoom("a",-1)};
  G("dupz1next").onclick=function(){stepCmpZoom("a",1)};
  G("dupz2prev").onclick=function(){stepCmpZoom("b",-1)};
  G("dupz2next").onclick=function(){stepCmpZoom("b",1)};
  G("dupz").onclick=function(e){if(e.target===this)closeZoom()};
  G("dupzm").onclick=function(e){var b=e.target.closest("[data-zjump]");if(b)zJump(+b.dataset.zjump)};
  ["a","b"].forEach(function(sd,i){
    var st=G("dupz"+(i+1)).parentNode,x0=null,y0=0;
    st.addEventListener("pointerdown",function(){if(zoomCmp){zoomCmp.act=sd;markAct()}},{passive:true});
    st.addEventListener("touchstart",function(e){if(e.touches.length===1&&zS[sd].s<=1.01){x0=e.touches[0].clientX;y0=e.touches[0].clientY}else x0=null},{passive:true});
    st.addEventListener("touchend",function(e){
      if(x0===null||!zoomCmp)return;
      if(zBlocked(sd)){x0=null;return}
      var dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;
      if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.4){stepCmpZoom(sd,dx<0?1:-1);e.preventDefault()}},{passive:false});
    zInit(sd)});
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
  function cfgDirtyUi(dirty,text,cls,recTh){
    var e=G("dupengnote"),b=G("dupsave"),preEl=G("duppre"),aa=G("dupanact"),rb=G("dupapplyrec");
    var f16Draft=!!(dirty&&preEl&&(preEl.value==="16")!==F16);
    cfgTagUi(dirty);
    if(b){b.classList.toggle("dirty",!!dirty);b.textContent=dirty?"Lưu & quét lại ảnh *":"Lưu & quét lại ảnh"}
    if(aa){
      if(recTh>0){
        lastRecTh=recTh;
        if(rb)rb.textContent="Áp dụng gợi ý ("+recTh+"%)";
        aa.hidden=false;
      }else{
        lastRecTh=null;
        aa.hidden=true;
      }
    }
    if(!e)return;
    if(text){e.className="dpst dpfull"+(cls?" "+cls:"");e.textContent=text;e.hidden=false}
    else if(dirty){e.className="dpst dpfull";e.textContent=f16Draft?"Đổi giữa fp16 ↔ fp32 sẽ xóa cache mô hình & hash cũ — bấm «Lưu & quét lại ảnh» để áp dụng.":"Có thay đổi cài đặt — bấm «Lưu & quét lại ảnh» để áp dụng.";e.hidden=false}
    else{e.className="dpst dpfull";e.textContent="";e.hidden=true}
  }
  function syncSensDraft(){
    var i=G("dupth"),s=G("dupsens");if(!i||!s)return;
    var v=Math.round(+i.value);
    s.value=(v===87||v===80||v===77||v===73)?String(v):"custom";
  }
  function applyEngineSettings(newEng){
    var oldCacheKey=CACHE_KEY,oldPmKey=PM_KEY,oldGpu=DINO_GPU,oldDs=DS,oldF16=F16;
    ENG=newEng;engSave();
    MM_MODE=mmNorm(newEng);
    F16=window.DUP_DINO_F16!==undefined?window.DUP_DINO_F16!==false:ENG.f16!==false;
    DS=(function(){var r=+window.DUP_DINO_RES||+ENG.res;return(r>=112&&r<=448&&r%16===0)?r:224})();
    DINO_GPU=window.DUP_DINO_GPU!==undefined?window.DUP_DINO_GPU!==false:ENG.dev!=="cpu";
    BN=window.DUP_DINO_BN>0?Math.min(8,+window.DUP_DINO_BN|0):(ENG.bn===0?(DS<=160?4:(DS<=224?2:1)):(ENG.bn>0?Math.min(8,ENG.bn|0):4));
    PACE=window.DUP_DINO_PACE>=0?+window.DUP_DINO_PACE:(ENG.pace>=0?+ENG.pace:0.6);
    var sfx=cfgSfx(DS,F16),newCacheKey="dhc12"+sfx,newPmKey="dpm7"+sfx;
    var f16Changed=F16!==oldF16;
    var keyChanged=newCacheKey!==oldCacheKey||newPmKey!==oldPmKey;
    var modelReset=keyChanged||DS!==oldDs||f16Changed||DINO_GPU!==oldGpu;
    var wipeP=Promise.resolve();
    if(modelReset){
      if(!f16Changed){
        if(cacheLoaded)saveCache();
        if(pmLoaded&&pm)savePm();
      }
      failPend(new Error("Cấu hình mô hình đã thay đổi"));
      killWorker();
      DINO.p=null;DINO.m=null;DINO.err=null;
      var q=DW.q;DW.dev="";DW.gpu=false;DW.q=[];DW.busy=false;
      q.forEach(function(x){try{x.bad(new Error("Cấu hình mô hình đã thay đổi"))}catch(e){}});
      if(DW.tm){clearTimeout(DW.tm);DW.tm=0}
      mcCache={};mcOrder=[];ptCache={};ptOrder=[];
      smMmPairRes={};smMmOrder=[];smRawCache=null;
    }
    if(newEng.mm!==MM_MODE){smMmPairRes={};smMmOrder=[]}
    if(keyChanged||f16Changed){
      CACHE_KEY=newCacheKey;PM_KEY=newPmKey;
      cacheLoaded=false;cacheP=null;cache={};
      pmLoaded=false;pmP=null;pm=null;
      imgPairs=null;sigMemo={};
      hs=null;hsP=null;hsPendR=null;
      smRawCache=null;
    }
    if(f16Changed){
      wipeP=clearPrecisionCache(oldCacheKey,oldPmKey,newCacheKey,newPmKey,oldF16);
    }
    return{keyChanged:keyChanged,modelReset:modelReset,f16Changed:f16Changed,wipeP:wipeP};
  }
  function applyAndSaveSettings(forceRescan){
    var sb=G("dupsave");if(sb)sb.disabled=true;
    return waitScanStop().then(function(){
      var rawTh=Math.round(+G("dupth").value);
      var newTh=(rawTh>=TH_MIN&&rawTh<=99)?thNorm(rawTh):TH;
      var newImgV=G("dupimgv").value;
      var newSkip=!!G("dupnoout").checked;
      var paceRaw=+G("duppace").value;
      var bnRaw=+G("dupbn").value;
      var mmEl=G("dupmm"),newMm=mmEl?(+mmEl.value|0):MM_MODE;
      if(newMm!==0&&newMm!==2&&newMm!==3&&newMm!==4)newMm=3;
      var newEng={
        res:+G("dupres").value||224,
        f16:G("duppre").value==="16",
        dev:G("dupdev").value==="cpu"?"cpu":"auto",
        bn:isNaN(bnRaw)?4:(bnRaw|0),
        pace:isNaN(paceRaw)?0.6:paceRaw,
        mm:newMm,
        mmv:2
      };
      var thChanged=newTh!==TH;
      var skipChanged=newSkip!==skipOut;
      var mmChanged=newMm!==MM_MODE;
      TH=newTh;imgAutoMode=(newImgV==="both"||newImgV==="stack")?newImgV:"manual";skipOut=newSkip;
      try{ls("dsim",String(TH));ls("dimgv",imgAutoMode);ls("dnoout",skipOut?"1":"0")}catch(e){}
      thUi();
      var engInfo=applyEngineSettings(newEng);
      engUi();
      openImgSet={};pairImgMode={};limMain=LIMIT;items=N().items();
      if(sb)sb.disabled=false;
      return (engInfo.wipeP||Promise.resolve()).then(function(){
        if(engInfo.keyChanged)hsPull();
        return Promise.all([loadCache(),loadPm()]).then(function(){
          if(forceRescan===true||thChanged||skipChanged||mmChanged||engInfo.keyChanged||(pm&&pmStale())){
            pm=pmEmpty();pmLoaded=true;pmP=null;
            savePm();imgPairs=null;
          }
          if(smCloseHook)smCloseHook();
          render();
          cfgDirtyUi(false,engInfo.f16Changed?"Đã lưu cài đặt và xóa cache mô hình cũ.":"Đã lưu cài đặt.","ok");
          scan();
        });
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
    if(!(v>=TH_MIN&&v<=99))this.value=String(TH);
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
  G("dupapplyrec").onclick=function(){
    if(!(lastRecTh>=TH_MIN&&lastRecTh<=99))return;
    var i=G("dupth");if(i)i.value=String(lastRecTh);
    syncSensDraft();
    applyAndSaveSettings();
  };
  /* Bảng phân tích chia thành 4 cụm: Kết luận · Mốc xác nhận · Số cặp theo ngưỡng (thanh tỉ lệ) · Cặp mới thêm ở mỗi bước (gom theo nhãn) */
  function renderAnaDetail(res){
    var pn=G("dupandet");if(!pn)return;
    var GRP=["c","r","n","t"],GT={c:"Xung đột — nên xem kỹ",r:"Rủi ro — 1 ảnh lẻ, thiếu ngữ cảnh",n:"Trung tính",t:"Tin cậy / đã xác nhận"};
    var CLOSE='<button type="button" class="btn" data-anclose="1">Đóng</button>',tiers=res.tiers,mxP=1,rec=null,h="";
    tiers.forEach(function(t){if(t.housePairs>mxP)mxP=t.housePairs;if(t.th===res.recommended)rec=t});
    h+='<div class="dpan-h"><b>Phân tích đa ngưỡng</b>'+CLOSE+'</div>';
    /* Cụm 1 · Kết luận */
    h+='<section class="dpan-c dpan-sum"><div class="dpan-big">'+res.recommended+'%<small>ngưỡng gợi ý</small></div><div class="dpan-chips">';
    if(rec){
      var sus=rec.riskyPairs+rec.conflictPairs;
      h+='<span>'+rec.housePairs+' cặp</span><span>'+rec.trustedPairs+' tin cậy</span>'+(sus?'<span class="bad">'+sus+' đáng ngờ</span>':'')+(rec.ignFP?'<span class="bad">'+rec.ignFP+' cặp đã loại lọt qua</span>':'');
    }
    h+=res.noiseOnset?'<span class="bad">nhiễu từ '+res.noiseOnset+'%</span>':'<span>chưa thấy nhiễu</span>';
    if(res.cal&&res.cal.active)h+='<span>hiệu chuẩn '+res.cal.posN+' trùng · '+res.cal.negN+' loại</span>';
    if(res.cal&&res.cal.preVisCut)h+='<span>lọc trước '+res.cal.preVisCut+' nhiễu ảnh</span>';
    h+='</div></section>';
    /* Cụm 2 · Mốc xác nhận */
    if(res.ref)h+='<section class="dpan-c"><h4>Mốc xác nhận</h4><p>Dùng '+res.ref.total+' cặp đã xác nhận «Trùng» làm cặp đúng. Giữ đủ '+res.ref.goal+' cặp thì ngưỡng phải ≤ '+res.ref.minTh+'%, gợi ý không cao hơn mức đó.'+(res.ref.total>res.ref.goal?' '+(res.ref.total-res.ref.goal)+' cặp nằm ngoài tầm 70–90% thô (được cứu nhờ xác minh vùng xám hoặc dưới 70%) nên không tính.':'')+'</p></section>';
    else if(res.refNote)h+='<section class="dpan-c"><h4>Mốc xác nhận</h4><p>'+esc(res.refNote)+'</p></section>';
    /* Cụm 3 · Số cặp theo ngưỡng */
    h+='<section class="dpan-c"><h4>Số cặp theo ngưỡng</h4>';
    tiers.forEach(function(t){
      var cls=t.th===res.recommended?" best":(res.noiseOnset&&t.th<=res.noiseOnset?" noise":(res.ref&&t.posKept<res.ref.goal?" lost":""));
      var bad=t.riskyPairs+t.conflictPairs,neu=Math.max(0,t.housePairs-t.trustedPairs-bad);
      h+='<div class="dpan-tr'+cls+'"><span class="dpan-th">'+t.th+'%'+(t.th===res.recommended?' ★':'')+'</span><span class="dpan-bar"><i class="g" data-w="'+(t.trustedPairs/mxP*100)+'"></i><i class="n" data-w="'+(neu/mxP*100)+'"></i><i class="x" data-w="'+(bad/mxP*100)+'"></i></span><b>'+t.housePairs+'</b>'
        +'<span class="dpan-sub">'+t.trustedPairs+' tin cậy · '+neu+' trung tính · '+t.riskyPairs+' rủi ro · '+t.conflictPairs+' xung đột'+(t.ignFP?' · '+t.ignFP+' đã loại':'')+(res.ref?' · giữ '+t.posKept+'/'+res.ref.goal:'')+'</span></div>';
    });
    h+='<div class="dpan-lg"><span>■ tin cậy</span><span>■ trung tính</span><span>■ đáng ngờ</span><span>★ gợi ý</span></div></section>';
    /* Cụm 4 · Cặp mới thêm ở mỗi bước hạ ngưỡng, gom theo nhãn */
    var steps=res.steps.filter(function(st){return st.add.length});
    if(steps.length){
      h+='<section class="dpan-c"><h4>Cặp mới thêm ở mỗi bước hạ ngưỡng</h4>';
      steps.forEach(function(st){
        var grp={c:[],r:[],n:[],t:[]};
        st.add.forEach(function(d){grp[d.cf?"t":d.lbl].push(d)});
        var sus=grp.c.length+grp.r.length;
        h+='<details class="dpan-s"'+(res.noiseOnset&&st.to===res.noiseOnset?' open':'')+'><summary>'+st.from+'→'+st.to+'%<em>+'+st.add.length+' cặp'+(sus?' · '+sus+' đáng ngờ':'')+'</em></summary>';
        GRP.forEach(function(g){
          var L=grp[g];if(!L.length)return;
          L.sort(function(p,q){return q.mx-p.mx});
          h+='<details class="dpan-g '+g+'"'+(g==="t"?'':' open')+'><summary>'+GT[g]+' ('+L.length+')</summary>';
          L.slice(0,40).forEach(function(d){
            var ctxT=(d.dd?"khác quận":d.sd?"cùng quận":"không rõ quận")+(d.pd!=null?" · giá lệch "+Math.round(d.pd*100)+"%":"")+" · hỗ trợ "+d.sup+(d.tx>=1?" · trùng văn bản":"")+(d.cf?" · đã xác nhận":"");
            var th=d.best.map(function(m){return '<a href="'+esc(imgSrc(m.x,(N()&&N().VW)||VW))+'" target="_blank" rel="noopener" title="'+(m.n!=null?m.n+'%':'')+'"><img alt="Ảnh căn 1" loading="lazy" src="'+esc(imgSrc(m.x,200))+'"><img alt="Ảnh căn 2" loading="lazy" src="'+esc(imgSrc(m.y,200))+'"></a>'}).join("");
            h+='<div class="dpan-r"><div class="dpan-rt"><b>'+esc(d.a.n)+' ↔ '+esc(d.b.n)+'</b><small>max '+d.mx+'% · '+d.nImg+' ảnh khớp · '+ctxT+'</small></div><div class="dpan-i">'+th+'</div></div>';
          });
          if(L.length>40)h+='<p class="dpst">… còn '+(L.length-40)+' cặp nữa.</p>';
          h+='</details>';
        });
        h+='</details>';
      });
      h+='</section>';
    }
    h+='<div class="dpan-f">'+CLOSE+'</div>';
    pn.innerHTML=h;pn.hidden=false;
    var ws=pn.querySelectorAll("[data-w]"),wi;
    for(wi=0;wi<ws.length;wi++)ws[wi].style.width=ws[wi].getAttribute("data-w")+"%";
    pn.onclick=function(e){if(e.target.closest&&e.target.closest("[data-anclose]")){pn.hidden=true;pn.innerHTML="";pn.onclick=null}};
  }
  G("dupanalyze").onclick=function(){
    var ab=G("dupanalyze"),pn0=G("dupandet");if(pn0){pn0.hidden=true;pn0.innerHTML=""}
    if(ab){ab.disabled=true;ab.textContent="Đang phân tích…"}
    cfgDirtyUi(false,"Đang phân tích đa ngưỡng…");
    analyzeThresholds().then(function(res){
      if(ab){ab.disabled=false;ab.textContent="Phân tích đa ngưỡng"}
      if(!res||!res.ok){cfgDirtyUi(false,(res&&res.msg)||"Chưa phân tích được.","bad");return}
      cfgDirtyUi(false,res.summary,"ok",res.recommended);renderAnaDetail(res);
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
  /* ===== Chế độ Quét thông minh riêng: hoạt động cả khi danh sách «Không phải trùng» trống hoặc đã có dữ liệu =====
     Quét ảnh → phân tích đa ngưỡng & hiệu chuẩn theo nhãn đã có → hiện các cặp vùng xám (có xem ảnh + so sánh lớn) để xác nhận Trùng / Không phải trùng → tự tinh chỉnh tới khi sạch vùng xám.
     Trạng thái từng cặp lấy thẳng từ danh sách «Không phải trùng» (ignored) và smartPos nên đồng bộ cả khi đánh dấu từ khung so sánh lớn. */
  var smRes=null,smGray=[],smCalc=false,smTok=0,smSig="",smRoundN=0,smThDirty=false;
  loadSmartPos();
  function scanAwait(){return new Promise(function(r){scan();if(scanning)scanDoneWaiters.push(r);else r()})}
  var smScrollRaf=0,smScrollUseRaf=false;
  function smScrollCancel(){
    if(!smScrollRaf)return;
    if(smScrollUseRaf&&typeof cancelAnimationFrame==="function")cancelAnimationFrame(smScrollRaf);
    else clearTimeout(smScrollRaf);
    smScrollRaf=0;
  }
  function smScrollTo(target,instant){
    smScrollCancel();
    function run(){
      smScrollRaf=0;
      var d=G("dupd"),mn=G("dupmain"),z=G("dupz");
      if(!d||!d.open||(mn&&mn.hidden)||(z&&!z.hidden))return;
      if(target&&typeof target!=="number"){if(target.hidden||(!smRunning&&!smRes))return}
      var top=0,pad=8;
      if(typeof target==="number"){top=target}
      else if(target){
        if(typeof target.getBoundingClientRect==="function"&&typeof d.getBoundingClientRect==="function"){
          var dr=d.getBoundingClientRect(),er=target.getBoundingClientRect();
          if(dr&&er&&(dr.height>0||er.height>0||dr.top!==0||er.top!==0))top=(d.scrollTop||0)+(er.top-dr.top)-pad;
          else if(typeof target.offsetTop==="number")top=target.offsetTop-pad;
        }else if(typeof target.offsetTop==="number"){
          top=target.offsetTop-pad;
        }
      }
      top=Math.max(0,Math.round(top));
      if(Math.abs(top-(d.scrollTop||0))<4)return;
      var red=false;
      try{red=!!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)}catch(e){}
      var beh=(instant||red)?"auto":"smooth";
      if(typeof d.scrollTo==="function"){
        try{d.scrollTo({top:top,behavior:beh})}catch(e2){d.scrollTop=top}
      }else{
        d.scrollTop=top;
      }
    }
    if(typeof requestAnimationFrame==="function"){smScrollUseRaf=true;smScrollRaf=requestAnimationFrame(run)}
    else{smScrollUseRaf=false;smScrollRaf=setTimeout(run,0)}
  }
  function smPanel(html){var p=G("dupsmart");if(!p)return;p.innerHTML=html||"";p.hidden=!html}
  function smSt(k){return ignored[k]?"n":(smartPos[k]?"y":"")}
  function smImgTxt(o,open){var na=houseImgs(o.a).length,nb=houseImgs(o.b).length;return open?"Ẩn ảnh ("+na+" · "+nb+") ▴":"Xem ảnh ("+na+" · "+nb+") ▾"}
  function smCardH(g,i){
    var o=smView[i],st=smSt(g.k),tot=houseImgs(o.a).length+houseImgs(o.b).length;
    var th=o.img.slice(0,3).map(function(m,j){return '<span data-zoom="'+i+':'+j+'" title="Bấm để phóng to"><img alt="Ảnh căn 1" loading="lazy" src="'+esc(imgSrc(m.x,200))+'"><img alt="Ảnh căn 2" loading="lazy" src="'+esc(imgSrc(m.y,200))+'"></span>'}).join("")+(o.img.length>3?'<em>+'+(o.img.length-3)+'</em>':"");
    function nm(it){return '<span class="dpsc-nm"><b class="dpgo" data-goto="'+esc(it.id)+'" role="link" tabindex="0" title="Xem căn này trong Danh sách">'+esc(it.n)+'</b><small>'+esc(addrOf(it)||"Chưa có địa chỉ")+(it.p!=null?" · "+fmt(it.p)+" tr":"")+'</small></span>'}
    return '<div class="dpc dpsc'+(st?" "+st:"")+'" data-k="'+esc(g.k)+'" data-i="'+i+'"><div class="dpsc-h">'+simBadge(g.mx)+'<span class="dpsc-t">'+g.nImg+' ảnh khớp · '+(g.side==="below"?"dưới ngưỡng gợi ý":"sát ngưỡng gợi ý")+'</span></div><div class="dpsc-hs">'+nm(g.a)+nm(g.b)+'</div><div class="dpsc-i">'+th+'</div><div class="dpsc-b"><button type="button" class="dpimgbtn" data-cmpfull="'+i+'" title="Mở so sánh toàn màn hình">So sánh lớn</button><button type="button" class="dpimgbtn" data-smimg="'+i+'" aria-expanded="'+(g.open?"true":"false")+'"'+(tot?"":" disabled")+'>'+(tot?smImgTxt(o,!!g.open):"Không có ảnh")+'</button><button type="button" class="dpimgbtn dpv" data-tog="'+i+'" title="Xem thông tin hai căn">'+(openSet[g.k]?"Ẩn thông tin":"Thông tin")+'</button></div><div class="dpdet"'+(openSet[g.k]?"":" hidden")+'>'+(openSet[g.k]?detailH(o,i):"")+'</div><div class="dpimgs"'+(g.open?"":" hidden")+'>'+(g.open?imgCmpH(o,i):"")+'</div><div class="dpsc-a"><button type="button" class="dpsc-yes'+(st==="y"?" on":"")+'" data-sa="y">Trùng</button><button type="button" class="dpsc-no'+(st==="n"?" on":"")+'" data-sa="n">Không phải trùng</button></div></div>'}
  function smAskH(){
    var remTxt=(smRes&&smRes.grayTotal>smGray.length)?(" · còn "+smRes.grayTotal+" cặp vùng xám"):"";
    var calNote=(smRes&&smRes.cal&&smRes.cal.active)?(" · đã học "+smRes.cal.posN+" trùng / "+smRes.cal.negN+" loại"):"";
    return '<div class="dpsm-h"><b>Quét thông minh'+(smRoundN>1?' · vòng '+smRoundN:'')+'</b><span class="dpsm-chip"></span></div><p class="dpsm-p">Ngưỡng đang dùng '+TH+'%'+remTxt+calNote+'. Đánh dấu từng cặp rồi hệ thống tự tinh chỉnh tới khi danh sách cuối chỉ còn các cặp trùng. «Không phải trùng» ẩn cặp đó và đẩy ngưỡng lên, «Trùng» giữ cặp đó làm mốc đúng.</p><div class="dpsm-opt" role="status" aria-live="polite"></div>'+smGray.map(smCardH).join("")+'<div class="dpsm-f"><button type="button" class="btn" data-sm="skip">Bỏ qua</button><button type="button" class="btn p" data-sm="apply"></button></div>'}
  /* cập nhật tại chỗ (không dựng lại thẻ) để ảnh không nháy */
  function smPaint(){
    var p=G("dupsmart");if(!p||p.hidden||!smRes)return;
    var rec=smRes.recommended,cs=p.querySelectorAll(".dpsc"),i;
    loadIgnored();
    for(i=0;i<cs.length;i++){
      var a=smSt(cs[i].dataset.k);
      cs[i].className="dpc dpsc"+(a?" "+a:"");
      cs[i].querySelector("[data-sa=y]").classList.toggle("on",a==="y");
      cs[i].querySelector("[data-sa=n]").classList.toggle("on",a==="n");
    }
    var ch=p.querySelector(".dpsm-chip");if(ch)ch.textContent="Tối ưu "+rec+"%"+(smCalc?" …":"");
    var op=p.querySelector(".dpsm-opt");
    if(op){op.className="dpsm-opt"+(smCalc?" dpcalc":"");op.innerHTML=smCalc?"Đang tính lại ngưỡng tối ưu…":"Ngưỡng tối ưu: <b>"+rec+"%</b>"+(rec!==TH?" · đang dùng "+TH+"%, sẽ áp dụng khi bấm tiếp tục":" · trùng với ngưỡng đang dùng")}
    var ap=p.querySelector("[data-sm=apply]");
    if(ap){ap.disabled=smCalc;ap.textContent=rec!==TH?"Áp dụng "+rec+"% & tiếp tục":"Áp dụng & tiếp tục"}
  }
  function smAllDone(){return smGray.length>0&&smGray.every(function(g){return !!smSt(g.k)})}
  function smSigOf(){loadIgnored();return smGray.map(function(g){return smSt(g.k)||"-"}).join("")}
  function smClose(){smScrollCancel();smTok++;smCalc=false;smRes=null;smGray=[];smView=[];closeZoom();smPanel("")}
  smCloseHook=smClose;
  function smRefresh(){
    var tok=++smTok;smCalc=true;smPaint();
    analyzeThresholds({fast:true}).then(function(res){
      if(tok!==smTok)return;
      smCalc=false;
      if(res&&res.ok&&smRes){smRes.recommended=res.recommended;smRes.hasMore=!!res.hasMore;smRes.grayTotal=res.grayTotal||0;if(res.cal)smRes.cal=res.cal}
      smPaint();
      if(smAllDone())smApply();
    },function(){if(tok===smTok){smCalc=false;smPaint()}});
  }
  /* gọi sau mỗi lần render (kể cả khi đánh dấu từ khung so sánh lớn / hoàn tác) */
  function smSync(){
    if(!smRes||!smGray.length)return;
    loadIgnored();loadSmartPos();
    var ch=false;
    smGray.forEach(function(g){if(ignored[g.k]&&smartPos[g.k]){delete smartPos[g.k];delete smartImg[g.k];posDirty[g.k]=0;ch=true}});
    if(ch)saveSmartPos();
    var sg=smSigOf();
    if(sg!==smSig){smSig=sg;smRefresh()}else smPaint();
  }
  smHook=function(){if(smRes&&smView.length)smSync()};
  function smAnswer(k,v){
    loadIgnored();loadSmartPos();
    var prev=smSt(k),ts=Date.now();
    if(prev===v)v="";
    if(prev==="n"){delete ignored[k];ignDirty[k]=0}
    if(prev==="y"){delete smartPos[k];delete smartImg[k];posDirty[k]=0}
    if(v==="n"){ignored[k]=ts;ignDirty[k]=ts;delete smartPos[k];delete smartImg[k];posDirty[k]=0;delete openSet[k];delete openImgSet[k]}
    if(v==="y"){
      smartPos[k]=ts;posDirty[k]=ts;delete ignored[k];ignDirty[k]=0;
      var _g=smGray.filter(function(x){return x.k===k})[0];
      var _ims=(_g&&_g.imgs&&_g.imgs.length)?_g.imgs:null;
      if(!_ims){var _vo=viewList.filter(function(x){return x&&(x.a.id+"|"+x.b.id)===k})[0];if(_vo&&_vo.img&&_vo.img.length)_ims=_vo.img}
      if(_ims)smartImg[k]=slimImgs(_ims);
    }
    ignWriteLs();saveSmartPos();
    render();smSync();
  }
  function smImgToggle(i){
    var g=smGray[i],o=smView[i],card=G("dupsmart").querySelector('.dpsc[data-i="'+i+'"]');
    if(!g||!o||!card)return;
    g.open=!g.open;
    var btn=card.querySelector("[data-smimg]"),box=card.querySelector(".dpimgs");
    if(btn){btn.setAttribute("aria-expanded",g.open?"true":"false");btn.textContent=smImgTxt(o,g.open)}
    if(box){
      if(g.open){box.innerHTML=imgCmpH(o,i);markImgs(box);box.hidden=false;box.classList.remove("dpopen");void box.offsetWidth;box.classList.add("dpopen");warmPair(o)}
      else box.hidden=true}
  }
  function quickRefilterPairs(th){
    if(!smRawCache||!smRawCache.list)return;
    var snap=smSnap();
    var byId={};activeItems().forEach(function(it){byId[it.id]=it});
    var inf=buildInfCtx(byId);
    var cand=smRawCache.list.filter(function(r){
      var lo=r.a.id<r.b.id?r.a.id:r.b.id,hi=r.a.id<r.b.id?r.b.id:r.a.id,k=lo+"|"+hi;
      return !ignored[k]&&(smartPos[k]||!inf.isNeg(lo,hi));
    });
    imgPairs=smartFilter(cand,th);
    smBack(snap);
  }
  /* Một vòng: phân tích ngưỡng → xác minh thị giác ứng viên vùng xám → tự loại cặp chắc chắn sai → hiện tối đa 6 cặp đáng hỏi nhất.
     Lặp không giới hạn số vòng cho tới khi sạch hết vùng xám (hoặc các cặp còn lại đều là Trùng và không còn ứng viên mờ). */
  function smRound(){
    smRoundN++;smRunning=true;syncScanUi();
    smPanel('<div class="dpsm-h"><b>Quét thông minh'+(smRoundN>1?' · vòng '+smRoundN:'')+'</b></div><p class="dpsm-p" id="dupsmst">Đang tìm ngưỡng &amp; xác minh vùng xám…</p>');
    smScrollTo(G("dupsmart"));
    return analyzeThresholds().then(function(res){
      smpSaveSoon();
      smRunning=false;syncScanUi();
      if(stopFlag){smPanel("");msg((res&&res.msg)||"Đã dừng quét thông minh.");smScrollTo(0);return}
      if(!res||!res.ok){smPanel("");msg((res&&res.msg)||"Chưa phân tích được.",1);smScrollTo(0);return}
      var autoTxt="";
      if(res.autoNeg&&res.autoNeg.length){
        loadIgnored();loadSmartPos();
        var tsA=Date.now(),nA=0,spChA=false;
        res.autoNeg.forEach(function(k){if(!ignored[k]){ignored[k]=tsA;ignDirty[k]=tsA;if(smartPos[k]){delete smartPos[k];delete smartImg[k];posDirty[k]=0;spChA=true}delete openSet[k];delete openImgSet[k];nA++}});
        if(spChA)posWriteLs();
        if(nA){saveIgnored();autoTxt=" · tự loại "+nA+" cặp không trùng"}
      }
      if(res.auto){
        var skipCnt=(res.auto.dom||0)+(res.auto.weak||0)+(res.auto.mm||0);
        if(skipCnt>0||res.auto.pos>0||res.auto.mmOk>0)autoTxt+=" · lọc "+skipCnt+" cặp yếu"+(res.auto.mmOk?", giữ "+res.auto.mmOk+" cặp chắc chắn trùng":"")+(res.auto.pos?", suy ra "+res.auto.pos+" cặp trùng":"");
      }
      smRes={recommended:res.recommended,hasMore:!!res.hasMore,grayTotal:res.grayTotal||0,cal:res.cal||null};
      smGray=(res.gray||[]).slice().sort(function(x,y){return((y.mx||0)-(x.mx||0))||(y.nImg||0)-(x.nImg||0)});
      if(!smGray.length){
        smPanel("");smRes=null;
        if(res.recommended!==TH||smThDirty||imgPairs===null){
          var i=G("dupth");if(i)i.value=String(res.recommended);
          syncSensDraft();var dirty=smThDirty;smThDirty=false;
          msg((smRoundN>1?"Đã lọc sạch vùng xám":"Không có cặp vùng xám cần xác nhận")+autoTxt+" · quét lại với ngưỡng tối ưu "+res.recommended+"%…");
          smFinNote="Quét thông minh hoàn tất · ngưỡng tối ưu "+res.recommended+"%";
          applyAndSaveSettings(dirty);
        }else{
          render();
          msg((smRoundN>1?"Đã xác nhận xong":"Ngưỡng "+TH+"% đã tối ưu")+autoTxt+" · danh sách chỉ còn các cặp trùng.");
        }
        smScrollTo(0);
        return;
      }
      /* đăng ký cặp vào viewList (đứng đầu, chỉ số cố định) để dùng chung khung so sánh lớn / xem ảnh */
      smView=smGray.map(function(g){return{a:g.a,b:g.b,why:["img"],img:g.imgs||[],sc:0}});
      render();
      smPanel(smAskH());smSig=smSigOf();smPaint();
      msg((smRoundN>1?"Vòng "+smRoundN+": ":"")+"cần xác nhận "+smGray.length+(res.grayTotal>smGray.length?"/"+res.grayTotal:"")+" cặp vùng xám · ngưỡng tối ưu "+res.recommended+"%"+autoTxt+".");
      smScrollTo(G("dupsmart"));
    }).then(null,function(){smRunning=false;syncScanUi();smPanel("");smScrollTo(0)});
  }
  function smApply(){
    var rec=smRes&&smRes.recommended;
    var hadN=smGray.some(function(g){return smSt(g.k)==="n"});
    var hasMore=!!(smRes&&smRes.hasMore);
    var allY=smGray.length>0&&smGray.every(function(g){return smSt(g.k)==="y"});
    smClose();
    function finishScan(){
      if(stopFlag)return;
      if(rec>=TH_MIN&&rec<=99&&(rec!==TH||smThDirty||imgPairs===null)){
        var i=G("dupth");if(i)i.value=String(rec);
        syncSensDraft();var dirty=smThDirty;smThDirty=false;
        msg((allY?"Tất cả đều trùng · ":"")+"đang hoàn tất quét ở ngưỡng tối ưu "+rec+"%…");
        smFinNote="Quét thông minh hoàn tất · ngưỡng tối ưu "+rec+"%";
        var r=applyAndSaveSettings(dirty);
        smScrollTo(0);
        return r;
      }
      render();
      msg(allY?"Đã xác nhận xong · danh sách chỉ còn các cặp trùng · ngưỡng "+TH+"%.":"Đã áp dụng ngưỡng "+TH+"%.");
      smScrollTo(0);
    }
    if(hadN||hasMore){
      if(rec>=TH_MIN&&rec<=99&&rec!==TH){
        TH=rec;smThDirty=true;
        var i2=G("dupth");if(i2)i2.value=String(rec);
        syncSensDraft();thUi();
        try{ls("dsim",String(TH))}catch(e){}
        quickRefilterPairs(rec);
        if(pm){
          pm.th=TH;
          if(imgPairs)pm.pairs=imgPairs.map(function(r){return{a:r.a.id,b:r.b.id,x:r.x,y:r.y,d:r.d,k:r.k||"",o:r.o||"",n:r.n}});
          savePm();
        }
      }else if(pm&&pm.th!==TH){
        pm.th=TH;savePm();
      }
      render();
      if(stopFlag)return;
      return smRound();
    }
    return finishScan();
  }
  var SM_BASE_TH=70;   /* ngưỡng quét thường ở bước đầu của Quét thông minh */
  function smStart(){
    if(scanning||smRunning)return;
    smClose();stopFlag=false;smRunning=true;smRoundN=0;smThDirty=false;smFinNote="";syncScanUi();
    /* Bước 1: quét thường ở ngưỡng 70% rồi lấy ngưỡng đó làm nền cho các bước sau (phân tích đa ngưỡng, vùng xám…) */
    if(TH!==SM_BASE_TH){
      TH=SM_BASE_TH;
      var i0=G("dupth");if(i0)i0.value=String(TH);
      syncSensDraft();thUi();
      try{ls("dsim",String(TH))}catch(e){}
    }
    smPanel('<div class="dpsm-h"><b>Quét thông minh</b></div><p class="dpsm-p" id="dupsmst">Bước 1: quét thường ở '+SM_BASE_TH+'%…</p>');
    smScrollTo(G("dupsmart"));
    smpWait().then(scanAwait).then(function(){
      if(stopFlag){smRunning=false;syncScanUi();smPanel("");smScrollTo(0);return}
      return smRound();
    }).then(null,function(){smRunning=false;syncScanUi();smPanel("");smScrollTo(0)});
  }
  G("dupsmart").onclick=function(e){
    var b=e.target.closest("[data-sa]");
    if(b){var c=b.closest("[data-k]");if(c)smAnswer(c.dataset.k,b.dataset.sa);return}
    var s=e.target.closest("[data-sm]");
    if(s){
      if(s.dataset.sm==="skip"){smClose();if(smThDirty){smThDirty=false;applyAndSaveSettings(true)}else render();smScrollTo(0)}
      else if(s.dataset.sm==="apply"&&!s.disabled)smApply();
      return}
    var ti=e.target.closest("[data-smimg]");
    if(ti){smImgToggle(+ti.dataset.smimg);return}
    if(e.target.closest("[data-zoom],[data-cmpfull],[data-cmpzoom],[data-cmpmore],[data-tog]"))onPairClick(e);
  };
  G("dupsmart").onchange=onPairChange;
  G("dupsmart").addEventListener("pointerdown",onPairDown,{passive:true});
  G("dupzyes").onclick=function(){var z=zoomCmp;if(!z)return;var k=z.key;closeZoom();smAnswer(k,"y")};
  G("dupimg").onclick=function(){if(scanning||smRunning)return;smClose();items=N().items();scan()};
  var sb2=G("dupsmartbtn");if(sb2)sb2.onclick=function(){if(scanning||smRunning)return;items=N().items();smStart()};
  G("dupstop").onclick=stopScan;
  G("dupvpair").onclick=function(){if(viewMode!=="pairs"){viewMode="pairs";render()}};
  G("dupvclust").onclick=function(){if(lastGraph&&lastGraph.stats&&lastGraph.stats.crossClusterCount>0&&viewMode!=="clusters"){viewMode="clusters";render()}};
  G("dupapplyord").onclick=function(){
    if(!(N()&&typeof N().reorder==="function"))return;
    var r=build(),sorted=sortHousesAdjacent(N().items(),r.graph);
    N().reorder(sorted,r.graph);
    items=N().items();
    msg("Đã sắp xếp "+r.graph.stats.nodeCount+" căn trong "+r.graph.stats.clusterCount+" cụm trùng ảnh nằm liền kề.");
  };
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
  (function(){var dd=G("dupd");if(!dd)return;
    dd.addEventListener("click",function(e){var g=e.target.closest&&e.target.closest("[data-goto]");if(!g)return;e.preventDefault();e.stopPropagation();goHouse(g.dataset.goto)},true);
    dd.addEventListener("keydown",function(e){if(e.key!=="Enter"&&e.key!==" ")return;var g=e.target.closest&&e.target.closest("[data-goto]");if(!g||g!==e.target)return;e.preventDefault();e.stopPropagation();goHouse(g.dataset.goto)},true)})();
  G("dupl").onchange=onPairChange;
  G("dupignl").onchange=onPairChange}
function maxCompSizeOf(P){
  var adj={},nodes=[],seen={};
  Object.keys(P).forEach(function(k){
    var o=P[k];if(!o||!o.img||!o.img.length)return;
    var u=o.a.id,v=o.b.id;
    if(!seen[u]){seen[u]=1;nodes.push(u)}
    if(!seen[v]){seen[v]=1;nodes.push(v)}
    (adj[u]||(adj[u]={}))[v]=1;(adj[v]||(adj[v]={}))[u]=1;
  });
  var vis={},mx=0;
  nodes.forEach(function(st){
    if(vis[st])return;
    var q=[st],qi=0;vis[st]=1;
    while(qi<q.length){
      var u=q[qi++],nb=adj[u]||{};
      Object.keys(nb).forEach(function(v){if(!vis[v]){vis[v]=1;q.push(v)}});
    }
    if(q.length>mx)mx=q.length;
  });
  return mx;
}
/* Mốc tuyệt đối để chấm nhãn cặp khi phân tích đa ngưỡng: trust = 1 ảnh đủ tin · ctxSim = cùng quận, không xung đột · risk = 1 ảnh lẻ, không ngữ cảnh hỗ trợ dưới mốc này bị coi là rủi ro */
var LB={trust:88,ctxSim:78,risk:80,multi:85,hubMin:2.5};
function smSnap(){var o={},k;for(k in SM)o[k]=SM[k];return o}
function smBack(o){var k;for(k in o)SM[k]=o[k]}
function qVal(arr,q){
  if(!arr.length)return null;
  var s=arr.slice().sort(function(a,b){return a-b});
  var idx=(s.length-1)*q,lo=Math.floor(idx),hi=Math.ceil(idx);
  return lo===hi?s[lo]:(s[lo]+(s[hi]-s[lo])*(idx-lo));
}
function clampN(v,lo,hi){return Math.max(lo,Math.min(hi,Math.round(v)))}
/* Hiệu chuẩn động LB và khoảng phân tách theo nhãn thực người dùng đã bấm («Trùng» vs «Không phải trùng») */
function calibrateFromLabels(posFeats,negFeats){
  var base={trust:LB.trust,ctxSim:LB.ctxSim,risk:LB.risk,multi:LB.multi,hubMin:LB.hubMin,active:false,posN:posFeats.length,negN:negFeats.length,sepMin:null,sepMax:null};
  if(!posFeats.length&&!negFeats.length)return base;
  var posAll=[],posSingle=[],posCtx=[],posMulti=[],posMarg=[];
  var negClean=[],negSingle=[],negCtx=[],negMulti=[],negMarg=[];
  posFeats.forEach(function(f){
    posAll.push(f.mx);
    if(f.nImg===1&&f.sup<1&&f.tx<1)posSingle.push(f.mx);
    if(f.sd&&!f.conf)posCtx.push(f.mx);
    if(f.nImg>=2&&!f.conf)posMulti.push(f.mx);
    if(f.clsMargin!=null)posMarg.push(f.clsMargin);
  });
  negFeats.forEach(function(f){
    if(!f.conf)negClean.push(f.mx);
    if(f.nImg===1&&f.sup<1&&f.tx<1)negSingle.push(f.mx);
    if(f.sd&&!f.conf)negCtx.push(f.mx);
    if(f.nImg>=2&&!f.conf)negMulti.push(f.mx);
    if(f.clsMargin!=null)negMarg.push(f.clsMargin);
  });
  function blendTarget(cur,target,n,fullAt){
    if(target===null||!n)return cur;
    var w=Math.min(1,n/fullAt);
    return cur+(target-cur)*w;
  }
  var negRef=negSingle.length?negSingle:negClean;
  var negTop=qVal(negRef,0.85),posLow=qVal(posAll,0.20);
  var tTrust=base.trust;
  if(negTop!==null&&posLow!==null){
    var gapMid=posLow>negTop?Math.max(negTop+2,0.55*(negTop+2)+0.45*posLow):Math.max(negTop+2,base.trust);
    tTrust=blendTarget(base.trust,gapMid,negRef.length+posAll.length,6);
  }else if(negTop!==null&&negTop+2>base.trust){
    tTrust=blendTarget(base.trust,negTop+2,negRef.length,4);
  }else if(posLow!==null&&posAll.length>=2){
    tTrust=blendTarget(base.trust,Math.max(83,posLow),posAll.length,6);
  }
  var trust=clampN(tTrust,82,95);

  var negRiskRef=negSingle.length?negSingle:negClean;
  var negRiskTop=qVal(negRiskRef,0.85),posRiskLow=qVal(posSingle.length?posSingle:posAll,0.20);
  var tRisk=base.risk;
  if(negRiskTop!==null){
    var rGoal=negRiskTop+1;
    if(posRiskLow!==null&&posRiskLow>negRiskTop+1)rGoal=0.6*(negRiskTop+1)+0.4*posRiskLow;
    tRisk=blendTarget(base.risk,rGoal,negRiskRef.length+posSingle.length,5);
  }else if(posRiskLow!==null&&posSingle.length>=2){
    tRisk=blendTarget(base.risk,posRiskLow,posSingle.length,6);
  }
  var risk=clampN(Math.min(trust,tRisk),75,89);

  var negCtxTop=qVal(negCtx,0.85),posCtxLow=qVal(posCtx,0.20);
  var tCtx=base.ctxSim;
  if(negCtxTop!==null&&posCtxLow!==null){
    var cGoal=posCtxLow>negCtxTop?Math.max(negCtxTop+1.5,0.5*(negCtxTop+2)+0.5*posCtxLow):(negCtxTop+2);
    tCtx=blendTarget(base.ctxSim,cGoal,negCtx.length+posCtx.length,5);
  }else if(negCtxTop!==null&&negCtxTop+1.5>base.ctxSim){
    tCtx=blendTarget(base.ctxSim,negCtxTop+2,negCtx.length,4);
  }else if(posCtxLow!==null&&posCtx.length>=2){
    tCtx=blendTarget(base.ctxSim,posCtxLow,posCtx.length,5);
  }
  var ctxSim=clampN(Math.min(trust,tCtx),72,86);

  var negMTop=qVal(negMulti,0.85),posMLow=qVal(posMulti,0.20);
  var tMulti=base.multi;
  if(negMTop!==null&&posMLow!==null){
    var mGoal=posMLow>negMTop?Math.max(negMTop+1.5,0.5*(negMTop+2)+0.5*posMLow):(negMTop+2);
    tMulti=blendTarget(base.multi,mGoal,negMulti.length+posMulti.length,5);
  }else if(negMTop!==null&&negMTop+1.5>base.multi){
    tMulti=blendTarget(base.multi,negMTop+2,negMulti.length,4);
  }else if(posMLow!==null&&posMulti.length>=2){
    tMulti=blendTarget(base.multi,posMLow,posMulti.length,5);
  }
  var multi=clampN(Math.min(trust,tMulti),79,90);

  var hubMin=base.hubMin;
  var negM80=qVal(negMarg,0.80),posM20=qVal(posMarg,0.20);
  if(negM80!==null&&posM20!==null&&posM20>negM80){
    var hGoal=0.5*(negM80+posM20);
    hubMin=Math.max(1.5,Math.min(4.5,Math.round(blendTarget(base.hubMin,hGoal,negMarg.length+posMarg.length,8)*10)/10));
  }

  var sepMin=null,sepMax=null;
  var negCleanTop=qVal(negClean,0.85);
  if(posAll.length>=2&&negClean.length>=2&&negCleanTop!==null&&posLow!==null&&posLow>=negCleanTop){
    sepMin=Math.ceil(negCleanTop+0.5);
    sepMax=Math.max(sepMin,Math.floor(posLow));
  }
  return{trust:trust,ctxSim:ctxSim,risk:risk,multi:multi,hubMin:hubMin,active:true,posN:posFeats.length,negN:negFeats.length,sepMin:sepMin,sepMax:sepMax};
}
/* Chọn ngưỡng từ các tầng đã đo (res đi từ ngưỡng cao → thấp).
   1) Điểm nhiễu "đã quy đổi": risky + 1.5×conflict (cặp "Không phải trùng" chỉ dùng chấm điểm, không kích hoạt nhiễu).
   2) Nhiễu bắt đầu khi bước hạ ngưỡng thêm nhiều cặp bẩn hơn cặp tin cậy; xét cả cửa sổ 2 bước vì lưới 2% mịn, nhiễu hay tích dần.
   3) Trong vùng sạch chọn tầng điểm cao nhất; phạt "sát vực" và thưởng nhẹ nếu trùng khớp vùng phân tách nhãn thực (calLB.sepMin..sepMax). */
function pickThreshold(res,nH,minIdx,calLB){
  minIdx=minIdx||0;   /* tầng có chỉ số < minIdx (ngưỡng cao hơn) sẽ làm mất cặp đã xác nhận → không được chọn */
  var n=res.length,i,minNoise=Math.max(3,Math.min(5,Math.ceil(nH*0.03)));   /* ≥3 cặp bẩn mới coi là nhiễu: 2 cặp lẻ chưa đủ mẫu */
  function bw(r){return r.riskyPairs+r.conflictPairs*1.5}
  var st=[];
  for(i=0;i<n-1;i++){
    var c=res[i],x=res[i+1];
    st.push({pairs:x.housePairs-c.housePairs,good:Math.max(0,x.trustedPairs-c.trustedPairs),bad:Math.max(0,bw(x)-bw(c)),conf:Math.max(0,x.conflictPairs-c.conflictPairs)});
  }
  var maxCand=n-1,noiseMark=null;
  for(i=minIdx;i<n-1;i++){
    var s1=st[i],c1=res[i],x1=res[i+1],w2=i<n-2?st[i+1]:null;
    if(s1.pairs<=0&&!(w2&&w2.pairs>0))continue;
    var highOk=x1.th<84||s1.conf>=minNoise||(s1.bad>=minNoise+1&&s1.bad>s1.good);
    var jump=x1.housePairs>=Math.max(c1.housePairs*1.9,c1.housePairs+Math.max(5,Math.ceil(nH*0.15)));
    var comp=c1.maxComp>=2&&x1.maxComp>=Math.max(c1.maxComp*2,c1.maxComp+Math.max(4,Math.ceil(nH*0.12)));
    var one=s1.pairs>0&&highOk&&((s1.bad>=minNoise&&(s1.bad>s1.good*1.2||s1.conf>=minNoise||s1.bad>=s1.good+2))||(s1.bad>=2&&s1.bad>=s1.good*1.2&&(jump||comp)));
    var two=!one&&!!w2&&x1.th<=84&&s1.bad>0&&w2.bad>0&&(s1.bad+w2.bad)>=minNoise+1&&(s1.bad+w2.bad)>(s1.good+w2.good)*1.2;
    if(one){noiseMark=x1.th;maxCand=i;break}
    if(two){noiseMark=res[i+2].th;maxCand=i+1;break}   /* nhiễu tích dần qua 2 bước: đánh dấu ở cuối cửa sổ */
  }
  if(res[n-1].housePairs===0)return{best:80,noiseMark:null,maxCand:n-1};
  var best=res[maxCand].th,bestScore=-1e9;
  var pairCap=Math.max(2,nH*0.35),compCap=Math.max(3,Math.round(nH*0.25));
  var hasSep=!!(calLB&&calLB.sepMin!==null&&calLB.sepMax!==null);
  function softPen(cnt,firstW,restW){return cnt<=0?0:cnt===1?firstW:firstW+(cnt-1)*restW}
  for(i=minIdx;i<=maxCand;i++){
    var r=res[i],neutral=Math.max(0,r.housePairs-r.trustedPairs-r.riskyPairs-r.conflictPairs);
    var pairExcess=Math.max(0,r.housePairs-pairCap),compExcess=Math.max(0,r.maxComp-compCap);
    var bloat=pairExcess*(2.6+Math.min(3.0,(r.housePairs/nH)*2.5))+compExcess*(2.2+(r.maxComp/nH)*4.0);
    var cliff=i<n-1?0.5*st[i].bad:0;
    var sepBonus=(hasSep&&r.th>=calLB.sepMin&&r.th<=calLB.sepMax)?0.5:0;
    var sc2=r.trustedPairs*2.2+neutral*0.85-softPen(r.riskyPairs,0.1,1.1)-softPen(r.conflictPairs,0.15,2.6)-softPen(r.ignFP,0.05,0.65)-bloat-cliff-0.06*Math.abs(r.th-80)+sepBonus;
    if(r.housePairs===0&&res[maxCand].housePairs>0)sc2-=50;
    if(sc2>bestScore){bestScore=sc2;best=r.th}
  }
  return{best:best,noiseMark:noiseMark,maxCand:maxCand};
}
function buildAnalysisGroups(list,prePairMap,pos,infNeg,tMap){
  var gMap={},groups=[],i,r,lo,hi,sw,hk,pv,nr;
  for(i=0;i<list.length;i++){
    r=list[i];
    sw=r.a.id>r.b.id;lo=sw?r.b:r.a;hi=sw?r.a:r.b;hk=lo.id+"|"+hi.id;
    if(infNeg&&infNeg(lo.id,hi.id))continue;
    nr={a:lo,b:hi,x:sw?r.y:r.x,y:sw?r.x:r.y,d:r.d,k:r.k||"",o:r.o||"",n:r.n};
    if(prePairMap){
      pv=prePairMap[canonPairKey(r.a.id,r.b.id,r.x,r.y)];
      if(pv&&pv.drop&&!(pos&&pos[hk]))continue;
      if(pv&&pv.ens!==r.n){nr.n=pv.ens;nr.d=100-pv.ens;if(pv.tagK)nr.k=pv.tagK}
    }
    var g=gMap[hk];
    if(!g){g=gMap[hk]={k:hk,lo:lo,hi:hi,r:[]};groups.push(g)}
    g.r.push(nr);
  }
  for(i=0;i<groups.length;i++){
    var og=groups[i],tsText=tMap[og.k]||0;
    og.m1=oneToOnePairs(og.r,true);
    og.ctx=pairCtx(og.lo,og.hi,tsText);
    og.tsText=tsText;
    og.na=(og.lo.im||[]).filter(Boolean).length||1;
    og.nb=(og.hi.im||[]).filter(Boolean).length||1;
    og.r=null;
  }
  return{groups:groups,map:gMap};
}
function evalPairsAtTh(rawGrp,ignGrp,ts,nSrc,pos,prePairMap,calLB){
  var cfg=smartCalc(ts),useLB=calLB||LB,P={},i;
  for(i=0;i<rawGrp.groups.length;i++){
    var g=rawGrp.groups[i];
    var kept=smartEvalGroup(g.m1,g.na,g.nb,g.ctx,g.tsText,cfg,false,null);
    if(kept)P[g.k]={a:g.lo,b:g.hi,why:["img"],img:kept.map(function(r){return imgItemOf(r,false)})};
  }
  filterGenericImgs(P,nSrc,ts);
  var imgHousePairs=0,trustedPairs=0,riskyPairs=0,conflictPairs=0,det=[];
  Object.keys(P).forEach(function(k){
    var o=P[k];if(!o.img.length)return;
    imgHousePairs++;
    var g=rawGrp.map[k],tsText=g?g.tsText:0,ctx=g?g.ctx:pairCtx(o.a,o.b,tsText),nImg=o.img.length;
    var mx=0,hasExact=false,visStrong=false,pvCnt=0,hubBadCnt=0;
    for(i=0;i<nImg;i++){
      if(o.img[i].x===o.img[i].y)hasExact=true;
      var s=simOf(o.img[i]);
      if(s>mx)mx=s;
      if(prePairMap){
        var pv=prePairMap[canonPairKey(o.a.id,o.b.id,o.img[i].x,o.img[i].y)];
        if(pv){
          pvCnt++;
          if(pv.visStrong)visStrong=true;
          var isHubBad=pv.hubSus||(!pv.hasVis&&pv.clsMargin!==null&&pv.clsMargin<=(useLB.hubMin||2.5)&&s<94);
          if(isHubBad&&!pv.visStrong)hubBadCnt++;
        }
      }
    }
    var hubBad=!hasExact&&pvCnt>0&&hubBadCnt===nImg;
    /* Nhãn dùng mốc TUYỆT ĐỐI đã hiệu chuẩn (useLB), không trượt theo ts. */
    var lbl="n",cf=!!(pos&&pos[k]);   /* cf: cặp người dùng đã xác nhận «Trùng» */
    var strongSameDist=ctx.sameDist&&!ctx.conflict&&!hubBad&&(tsText>=1||visStrong||(mx>=84&&ctx.support>=2)||(mx>=useLB.ctxSim&&(ctx.sameWard||(ctx.pClose&&ctx.aClose))));
    var highImgTrust=mx>=96||(!hubBad&&((visStrong&&!ctx.conflict&&mx>=useLB.risk)||(mx>=useLB.trust&&!ctx.conflict&&(ctx.support>=1||nImg>=2||tsText>=1))));
    var multiImgTrust=nImg>=2&&!ctx.conflict&&!hubBad&&(mx>=(useLB.multi||85)||ctx.support>=1||tsText>=1||nImg>=3||visStrong);
    if(cf){trustedPairs++;lbl="t"}
    else if(hasExact||highImgTrust||multiImgTrust||strongSameDist){trustedPairs++;lbl="t"}
    else if(ctx.conflict){if(nImg===1){conflictPairs++;lbl="c"}else{riskyPairs++;lbl="r"}}
    else if(hubBad||(nImg===1&&!ctx.support&&tsText<1&&mx<useLB.risk)){riskyPairs++;lbl="r"}
    /* chi tiết từng cặp để hiển thị/kiểm chứng thủ công (xem renderAnaDetail) */
    det.push({k:k,cf:cf,ex:hasExact,a:o.a,b:o.b,mx:mx,nImg:nImg,lbl:lbl,sd:ctx.sameDist,sw:ctx.sameWard,dd:ctx.diffDist,pd:ctx.pDiff,conf:ctx.conflict,sup:ctx.support,tx:tsText,
      best:o.img.slice().sort(function(p,q){return (q.n||0)-(p.n||0)}).slice(0,2).map(function(m){return{x:m.x,y:m.y,n:m.n}})});
  });
  var ignFP=0;
  if(ignGrp&&ignGrp.groups.length){
    for(i=0;i<ignGrp.groups.length;i++){
      var ig=ignGrp.groups[i];
      if(smartEvalGroup(ig.m1,ig.na,ig.nb,ig.ctx,ig.tsText,cfg,false,null))ignFP++;
    }
  }
  return{th:ts,housePairs:imgHousePairs,trustedPairs:trustedPairs,riskyPairs:riskyPairs,conflictPairs:conflictPairs,ignFP:ignFP,maxComp:maxCompSizeOf(P),det:det};
}
function analyzeThresholds(opts){
  opts=opts||{};
  items=N().items();
  loadIgnored();
  return Promise.all([loadCache(),smpLoad()]).then(function(){
    var src=items.filter(function(it){return (it.st||"new")!=="out"});
    var byId={},allJ=[],A=[];
    src.forEach(function(it){
      byId[it.id]=it;
      (it.im||[]).forEach(function(s){
        if(!s)return;
        var sg=sigOf(s);
        if(sg){allJ.push({it:it,s:s});A.push(sg)}
      });
    });
    if(allJ.length<2){
      smartCalc();
      return{ok:false,imgs:allJ.length,msg:"Chưa đủ hash ảnh trên máy ("+allJ.length+" ảnh từ căn đang hoạt động). Hãy bấm «Quét ảnh trùng» trước."};
    }
    var pos={},posN=0,refNote="";
    Object.keys(smartPos).forEach(function(k){var ids=k.split("|");if(byId[ids[0]]&&byId[ids[1]]&&!ignored[k]&&!pos[k]){pos[k]=1;posN++}});
    if(!posN)refNote="Chưa có cặp nào xác nhận «Trùng» nên chưa có mốc xác nhận.";
    var tMap=textScoreMap(src),FLOOR=TH_MIN;
    var rawSig=CACHE_KEY+"\u0001"+allJ.map(function(x){return x.it.id+":"+x.s}).join("\u0002");
    var allPairs=null,p=0,seen={};
    if(!(smRawCache&&smRawCache.sig===rawSig)){var rl=smpRawList(rawSig,byId);if(rl)smRawCache={sig:rawSig,list:rl}}
    if(smRawCache&&smRawCache.sig===rawSig){
      allPairs=smRawCache.list;
    }else{
      allPairs=[];
    }
    var jr=0;
    function buildRawStep(){
      if(isAborted(false))return Promise.resolve();
      if(smRawCache&&smRawCache.sig===rawSig)return Promise.resolve();
      var t0=Date.now(),cnt=0,j,a,b,m,k;
      while(p<allJ.length){
        b=allJ[p];
        while(jr<p){
          j=jr++;a=allJ[j];
          if(a.it.id!==b.it.id){
            m=a.s===b.s?{d:0,n:100,k:"",o:A[p].ori}:cmpSig(A[j],A[p],FLOOR);
            if(m){
              k=a.it.id+"|"+b.it.id+"|"+a.s+"|"+b.s;
              if(!seen[k]){seen[k]=1;allPairs.push({a:a.it,b:b.it,x:a.s,y:b.s,d:m.d,k:m.k,o:m.o||"",n:m.n})}
            }
          }
          if((++cnt&31)===0&&Date.now()-t0>=12){pf("rawBuild",Date.now()-t0);return new Promise(function(r){setTimeout(r,0)}).then(buildRawStep)}
        }
        p++;jr=0;
      }
      pf("rawBuild",Date.now()-t0);
      smRawCache={sig:rawSig,list:allPairs};
      return Promise.resolve();
    }
    return Promise.resolve().then(buildRawStep).then(function(){
      if(isAborted(false))return{ok:false,stopped:true,msg:"Đã dừng quét thông minh."};
      var raw=[],ignRaw=[],exactHouse={};
      allPairs.forEach(function(r){
        var hk=hkOf(r.a.id,r.b.id);
        if(ignored[hk])ignRaw.push(r);
        else{raw.push(r);if(r.x===r.y)exactHouse[hk]=1}
      });
      var inf=buildInfCtx(byId);
      var infPos=0;
      if(posN){
        raw.forEach(function(r){
          var hk=hkOf(r.a.id,r.b.id),ids=hk.split("|");
          if(!pos[hk]&&inf.samePos(ids[0],ids[1])){pos[hk]=1;posN++;infPos++}});
      }
      var wantPreVis=!opts.fast&&MM_MODE!==0;
      var prePassPromise=Promise.resolve();
      if(wantPreVis){
        var borderG={},wantPt0=MM_MODE===3||MM_MODE===4,wantMc0=MM_MODE===2||MM_MODE===4;
        raw.forEach(function(r){
          if(r.x===r.y||r.n<72)return;
          var hk=hkOf(r.a.id,r.b.id);
          if(exactHouse[hk]||pos[hk]||inf.isNeg(r.a.id,r.b.id))return;
          var cm=smMmPairRes[mmResKey(r.x,r.y)];
          var hasPt=!wantPt0||(cm&&cm.pt!==undefined);
          var hasMc=!wantMc0||(cm&&cm.mc!=null)||(mcCache[r.x]!==undefined&&mcCache[r.y]!==undefined);
          if(hasPt&&hasMc)return;
          var ids=hk.split("|"),bg=borderG[hk]||(borderG[hk]={lo:byId[ids[0]],hi:byId[ids[1]],mx:0,r:[]});
          if(r.n>bg.mx)bg.mx=r.n;
          bg.r.push(r);
        });
        var borderList=[];
        Object.keys(borderG).forEach(function(hk){
          var bg=borderG[hk];
          if(!bg.lo||!bg.hi)return;
          var conf=pairCtx(bg.lo,bg.hi,tMap[hk]||0).conflict;
          if((bg.mx>=74&&bg.mx<=93)||(conf&&bg.mx>=74&&bg.mx<98)){
            bg.conf=conf;borderList.push(bg);
          }
        });
        borderList.sort(function(p0,q0){
          var zp=(p0.mx>=76&&p0.mx<=90)?0:1,zq=(q0.mx>=76&&q0.mx<=90)?0:1;
          return (zp-zq)||(Math.abs(p0.mx-82)-Math.abs(q0.mx-82))||((q0.conf?1:0)-(p0.conf?1:0));
        });
        var preSeed=[];
        borderList.slice(0,40).forEach(function(bg){
          bg.r.sort(function(p0,q0){return q0.n-p0.n}).slice(0,2).forEach(function(r){preSeed.push(r)});
        });
        if(preSeed.length){
          var snapPre=smSnap();
          prePassPromise=verifyGrayZonePairs(preSeed,false,78,{preSrc:src,preTMap:tMap}).then(function(){smBack(snapPre)},function(){smBack(snapPre)});
        }
      }
      return prePassPromise.then(function(){
        if(isAborted(false))return{ok:false,stopped:true,msg:"Đã dừng quét thông minh."};
        /* Xây dựng bản đồ xác minh trước (CSLS hub + cache Patch/Spatial/Trung tâm) trước khi chọn ngưỡng */
        var wantPt=MM_MODE===3||MM_MODE===4,wantMc=MM_MODE===2||MM_MODE===4;
        var hubUrls=[],hubSeen={},hubRest=[],ptResultsAll={},pairCntAll={};
        allPairs.forEach(function(r){
          var hk=hkOf(r.a.id,r.b.id);
          if(r.n>=72)pairCntAll[hk]=(pairCntAll[hk]||0)+1;
          if(MM_MODE!==0&&wantPt){
            var cm=smMmPairRes[mmResKey(r.x,r.y)];
            if(cm&&cm.pt)ptResultsAll[canonPairKey(r.a.id,r.b.id,r.x,r.y)]=cm.pt;
          }
          if(r.x!==r.y&&r.n>=70){
            var pri=r.n>=72&&r.n<=94;
            [r.x,r.y].forEach(function(u){
              if(hubSeen[u])return;
              if(pri){hubSeen[u]=1;hubUrls.push(u)}else hubRest.push(u);
            });
          }
        });
        hubRest.forEach(function(u){if(!hubSeen[u]&&hubUrls.length<260){hubSeen[u]=1;hubUrls.push(u)}});
        if(hubUrls.length>260)hubUrls=hubUrls.slice(0,260);
        var ownerMap=buildOwnerMap(allPairs),rCls=hubUrls.length?buildClsHubMap(hubUrls,ownerMap):{};
        var rMc=(MM_MODE!==0&&wantMc&&Object.keys(mcCache).length>=4)?buildVecHubMap(hubUrls,mcCache,ownerMap,5):null;
        var rPt=(MM_MODE!==0&&wantPt&&Object.keys(ptResultsAll).length)?buildPtHubMap(allPairs,ptResultsAll):null;
        var prePairMap={},preDropTrack={};
        allPairs.forEach(function(r){
          if(r.x===r.y||r.n<FLOOR)return;
          var hk=hkOf(r.a.id,r.b.id);
          var cm=MM_MODE?smMmPairRes[mmResKey(r.x,r.y)]:null;
          var pmRes=(MM_MODE&&wantPt&&cm)?(cm.pt||null):null,spRes=(pmRes&&cm)?(cm.sv||null):null;
          var ma=(MM_MODE&&wantMc)?mcCache[r.x]:null,mb=(MM_MODE&&wantMc)?mcCache[r.y]:null;
          var mcSim=(ma&&mb)?Math.min(100,Math.round(dotV(ma,mb)*100)):(MM_MODE&&wantMc&&cm&&cm.mc!=null?cm.mc:null);
          var clsMargin=(rCls[r.x]!==undefined&&rCls[r.y]!==undefined)?(r.n-0.5*(rCls[r.x]+rCls[r.y])):null;
          var mcMargin=(mcSim!==null&&rMc&&rMc[r.x]!==undefined&&rMc[r.y]!==undefined)?(mcSim-0.5*(rMc[r.x]+rMc[r.y])):null;
          var ptMargin=(pmRes&&rPt&&rPt[r.x]!==undefined&&rPt[r.y]!==undefined)?(pmRes.sim-0.5*(rPt[r.x]+rPt[r.y])):null;
          if(!pmRes&&mcSim===null&&clsMargin===null)return;
          var tsText=tMap[hk]||0,nInPair=pairCntAll[hk]||1,ctx=pairCtx(r.a,r.b,tsText);
          var ev=evalMmPair(r,pmRes,spRes,mcSim,clsMargin,mcMargin,ptMargin,78,72,ctx,tsText,nInPair,LB.hubMin);
          var ck=canonPairKey(r.a.id,r.b.id,r.x,r.y);
          var hardDrop=ev.hasVis&&ev.drop;
          var hubSus=!ev.hasVis&&clsMargin!==null&&clsMargin<=LB.hubMin&&r.n<94;
          prePairMap[ck]={drop:hardDrop,ens:ev.hasVis?ev.ens:r.n,tagK:ev.hasVis?ev.tagK:(r.k||""),visStrong:ev.visStrong,hubSus:hubSus,clsMargin:clsMargin,hasVis:ev.hasVis};
          if(!ignored[hk]&&!pos[hk]&&!exactHouse[hk]){
            var tr=preDropTrack[hk]||(preDropTrack[hk]={mx:0,tot:0,drp:0});
            tr.tot++;if(r.n>tr.mx)tr.mx=r.n;if(hardDrop)tr.drp++;
          }
        });
        var preDropHouse={},preVisCut=0;
        Object.keys(preDropTrack).forEach(function(hk){
          var tr=preDropTrack[hk];
          if(tr.tot>0&&tr.drp===tr.tot){preDropHouse[hk]=tr;preVisCut++}
        });

        /* Thu thập đặc trưng nhãn thực («Trùng» & «Không phải trùng») để hiệu chuẩn mốc */
        function collectLabelFeats(pairList){
          var g={},out=[];
          pairList.forEach(function(r){
            var lo=r.a.id<r.b.id?r.a:r.b,hi=lo===r.a?r.b:r.a,hk=lo.id+"|"+hi.id;
            var pv=prePairMap[canonPairKey(r.a.id,r.b.id,r.x,r.y)];
            var nr=(pv&&pv.ens!==r.n)?{a:r.a,b:r.b,x:r.x,y:r.y,n:pv.ens,d:100-pv.ens,k:pv.tagK||r.k,o:r.o}:r;
            (g[hk]||(g[hk]={lo:lo,hi:hi,r:[]})).r.push(nr);
          });
          Object.keys(g).forEach(function(hk){
            var o=g[hk];if(!byId[o.lo.id]||!byId[o.hi.id])return;
            var m1=oneToOnePairs(o.r,false),mx=0,ex=false,bestM=null;
            m1.forEach(function(m){if(m.x===m.y)ex=true;if(m.n>mx){mx=m.n;bestM=m}});
            if(ex||mx<FLOOR)return;
            var cx=pairCtx(o.lo,o.hi,tMap[hk]||0);
            var pvB=bestM?prePairMap[canonPairKey(bestM.a.id,bestM.b.id,bestM.x,bestM.y)]:null;
            out.push({hk:hk,mx:mx,nImg:m1.length,sup:cx.support,tx:tMap[hk]||0,sd:cx.sameDist,sw:cx.sameWard,dd:cx.diffDist,pc:cx.pClose,ac:cx.aClose,conf:cx.conflict,clsMargin:pvB?pvB.clsMargin:null});
          });
          return out;
        }
        var posFeats=posN?collectLabelFeats(raw.filter(function(r){return !!pos[hkOf(r.a.id,r.b.id)]})):[];
        var negFeats=ignRaw.length?collectLabelFeats(ignRaw):[];
        var calLB=calibrateFromLabels(posFeats,negFeats);
        var negProf=negFeats.filter(function(f){return !f.conf}).map(function(f){return{mx:f.mx,n:f.nImg,sup:f.sup,tx:f.tx,sw:f.sw,pc:f.pc,ac:f.ac}});
        function negDom(d){
          for(var i=0;i<negProf.length;i++){
            var p0=negProf[i];
            if(p0.mx>=d.mx+2&&p0.n>=d.nImg&&p0.sup>=d.sup&&p0.tx>=d.tx&&(!d.sw||p0.sw)&&(!d.pc||p0.pc)&&(!d.ac||p0.ac))return true;
          }
          return false}
        var rawGrp=buildAnalysisGroups(raw,prePairMap,posN?pos:null,inf.isNeg,tMap);
        var ignGrp=buildAnalysisGroups(ignRaw,null,null,null,tMap);
        var tiers=[90,88,86,84,82,80,78,76,74,72,70],res=[],ti=0,snap=smSnap(),nH=Math.max(1,src.length);
        function tierStep(){
          if(isAborted(false)){smBack(snap);return Promise.resolve({ok:false,stopped:true,msg:"Đã dừng quét thông minh."})}
          var t0=Date.now();
          while(ti<tiers.length&&Date.now()-t0<30){var tq=Date.now();res.push(evalPairsAtTh(rawGrp,ignGrp,tiers[ti],src.length,posN?pos:null,prePairMap,calLB));smBack(snap);ti++;pf("tier",Date.now()-tq)}
          if(ti<tiers.length)return new Promise(function(r){setTimeout(r,0)}).then(tierStep);
          return finish();
        }
        function finish(){
          smartCalc();
          var cleanPk=pickThreshold(res,nH,0,calLB);
          var ref=null,minIdx=0;
          if(posN){
            var mxKept=0;
            res.forEach(function(r){r.posKept=0;r.det.forEach(function(d){if(d.cf)r.posKept++});if(r.posKept>mxKept)mxKept=r.posKept});
            var goal=mxKept;
            if(goal>0){
              for(var ri=0;ri<res.length;ri++)if(res[ri].posKept>=goal){minIdx=ri;break}
              var pinned=0;
              if(minIdx>cleanPk.maxCand){
                var atClean=res[cleanPk.maxCand].posKept;
                if(mxKept>=3&&atClean>=Math.ceil(mxKept*0.75)){
                  for(var ri2=0;ri2<=cleanPk.maxCand;ri2++)if(res[ri2].posKept>=atClean){minIdx=ri2;break}
                  pinned=goal-atClean;goal=atClean;
                }
              }
              ref={total:posN,goal:goal,minTh:res[minIdx].th,pinned:pinned};
            }else refNote="Không cặp «Trùng» đã xác nhận nào nằm trong khoảng 70–90% thô nên chưa dùng làm mốc xác nhận.";
          }
          var pk=pickThreshold(res,nH,minIdx,calLB),best=pk.best,noiseMark=pk.noiseMark;
          var grayMin=Math.max(FLOOR,best-15);
          var steps=[],si;
          for(si=0;si<res.length-1;si++){
            var prevK={};res[si].det.forEach(function(d){prevK[d.k]=1});
            steps.push({from:res[si].th,to:res[si+1].th,add:res[si+1].det.filter(function(d){return !prevK[d.k]})});
          }
          var first={};
          res.forEach(function(r){r.det.forEach(function(d){if(!first[d.k])first[d.k]={d:d,th:r.th}})});
          if(grayMin<tiers[tiers.length-1]){
            var loScan=[],lt=tiers[tiers.length-1]-2;
            while(lt>grayMin){loScan.push(lt);lt-=2}
            loScan.push(grayMin);
            loScan.forEach(function(thLo){
              var er=evalPairsAtTh(rawGrp,ignGrp,thLo,src.length,posN?pos:null,prePairMap,calLB);
              smBack(snap);
              er.det.forEach(function(d){if(!first[d.k])first[d.k]={d:d,th:thLo}});
            });
          }
          var autoNeg=[],autoSeen={},skipSt={clr:0,dom:0,weak:0,mm:0,mmOk:0};
          Object.keys(preDropHouse).forEach(function(hk){
            var tr=preDropHouse[hk];
            if(!opts.fast&&MM_MODE!==0&&tr.mx>=best&&!autoSeen[hk]&&!ignored[hk]){
              skipSt.mm++;autoSeen[hk]=1;autoNeg.push(hk);
            }
          });
          function skipWhy(d,below){
            if(d.ex)return "";
            if(d.lbl==="c"&&d.nImg<=1&&d.tx<1&&d.mx<calLB.trust){
              /* Chỉ bỏ qua không hỏi khi dưới ngưỡng; cặp ≥best có xung đột khu vực vẫn giữ để hỏi lại */
              if(below)return "clr";
              return "";
            }
            if(below&&negDom(d))return "dom";
            if(below&&d.nImg<=1&&d.sup<1&&d.tx<1&&d.mx<best-3)return "weak";
            return ""}
          function grayPick(lo,strictWeak){
            var out=[],sk={clr:0,dom:0,weak:0,mm:skipSt.mm,mmOk:0},an=[];
            Object.keys(first).forEach(function(k){
              var f=first[k],d=f.d;
              if(d.cf||smartPos[k]||ignored[k]||inf.isNeg(d.a.id,d.b.id))return;
              if(d.mx<grayMin)return;
              var below=f.th<best&&f.th>=lo,above=f.th>=best&&d.lbl!=="t";
              if(!(below||above))return;
              if(strictWeak&&below&&d.nImg<=1&&d.sup<1&&d.tx<1&&d.mx<best-2)return;
              var why=skipWhy(d,below);
              if(why){
                sk[why]++;
                return;
              }
              var thDist=Math.abs(f.th-best),mxDist=Math.abs(d.mx-best);
              var amb=(above?(mxDist*0.5+(d.lbl==="r"?0:d.lbl==="n"?1:2.5)):(thDist*0.6+mxDist*0.4))-2*Math.min(2,d.sup||0)-(d.nImg>1?1.5:0)-(d.tx>=1?1.5:0);
              out.push({k:k,a:d.a,b:d.b,mx:d.mx,nImg:d.nImg,lbl:d.lbl,th:f.th,side:below?"below":"above",best:d.best,amb:amb,ex:d.ex,sup:d.sup,tx:d.tx,conf:d.conf});
            });
            out.sort(function(p0,q0){return p0.amb-q0.amb||q0.nImg-p0.nImg});
            /* Gộp các cặp nối cùng hai cụm đã xác nhận «Trùng»: chỉ hỏi 1 cặp đại diện tốt nhất */
            var compSeen={},dedup=[];
            out.forEach(function(g){
              var ck=inf.compPair(g.a.id,g.b.id);
              if(compSeen[ck])return;
              compSeen[ck]=1;dedup.push(g);
            });
            dedup.sk=sk;dedup.an=an;
            return dedup;
          }
          var gray=grayPick(grayMin,false);
          skipSt=gray.sk;
          gray.an.forEach(function(k){if(!autoSeen[k]&&!ignored[k]){autoSeen[k]=1;autoNeg.push(k)}});
          var calInfo={active:calLB.active,posN:calLB.posN,negN:calLB.negN,trust:calLB.trust,ctxSim:calLB.ctxSim,risk:calLB.risk,multi:calLB.multi,hubMin:calLB.hubMin,sepMin:calLB.sepMin,sepMax:calLB.sepMax,preVisCut:preVisCut};
          function finalizeGray(finalList){
            if(isAborted(false))return{ok:false,stopped:true,msg:"Đã dừng quét thông minh."};
            var totalCand=finalList.length;
            var aboveRem=finalList.slice(6).filter(function(x){return x.side==="above"}).length;
            var belowStrongRem=finalList.slice(6).filter(function(x){return x.side==="below"&&(x.nImg>=2||x.sup>=1||x.tx>=1||x.mx>=best-2)}).length;
            var hasMore=aboveRem>0||belowStrongRem>0;
            var shown=finalList.slice(0,6);
            var needK={};shown.forEach(function(g){needK[g.k]=g});
            raw.forEach(function(r){
              var sw=r.a.id>r.b.id,lo=sw?r.b:r.a,hi=sw?r.a:r.b,g=needK[lo.id+"|"+hi.id];if(!g)return;
              (g.imgs=g.imgs||[]).push(imgItemOf(r,sw));
            });
            shown.forEach(function(g){
              var seenM={},im=(g.imgs||[]).filter(function(m){var q=m.x+"|"+m.y;if(seenM[q]||(m.n||0)<g.mx-12)return false;seenM[q]=1;return true}).sort(function(p0,q0){return (q0.n||0)-(p0.n||0)}).slice(0,12);
              if(!im.length)im=(g.best||[]).map(function(m){return{x:m.x,y:m.y,d:100-(m.n||0),k:"",o:"",n:m.n}});
              g.imgs=im;
            });
            res.forEach(function(r){delete r.det});
            var parts=res.map(function(x){return x.th+"→"+x.housePairs});
            var noiseNote=noiseMark?" · Nhiễu từ "+noiseMark+"%":"";
            var refTxt=ref?" · Giữ đủ "+ref.goal+"/"+ref.total+" cặp đã xác nhận cần ≤"+ref.minTh+"%":"";
            var calTxt=calInfo.active?(" · Hiệu chuẩn "+calInfo.posN+"✓/"+calInfo.negN+"✕"):"";
            var txt="Cặp theo ngưỡng (%): "+parts.join(" · ")+refTxt+noiseNote+calTxt+" · Gợi ý: "+best+"%";
            return{ok:true,imgs:allJ.length,houses:nH,tiers:res,steps:steps,noiseOnset:noiseMark,recommended:best,summary:txt,ref:ref,refNote:refNote,cal:calInfo,gray:shown,grayTotal:totalCand,hasMore:hasMore,autoNeg:autoNeg,auto:{pos:infPos,clr:skipSt.clr,dom:skipSt.dom,weak:skipSt.weak,mm:skipSt.mm,mmOk:skipSt.mmOk}};
          }
          /* Xác minh thị giác sâu (Patch MaxSim + Spatial + Trung tâm + CSLS) cho ứng viên vùng xám trước khi hỏi */
          if(!opts.fast&&MM_MODE!==0&&gray.length){
            var visInfo={},snapV=smSnap();
            function runVisPass(cands){
              if(!cands.length||isAborted(false))return Promise.resolve();
              var candMap={};cands.forEach(function(g){candMap[g.k]=g});
              var candRaw=raw.filter(function(r){
                return !!candMap[hkOf(r.a.id,r.b.id)]&&r.n>=Math.max(FLOOR,grayMin);
              });
              if(!candRaw.length)return Promise.resolve();
              return verifyGrayZonePairs(candRaw,false,best,{preSrc:src,preTMap:tMap,visInfo:visInfo});
            }
            function filterVisList(list){
              var outVis=[];
              list.forEach(function(g){
                var vi=visInfo[g.k];
                if(vi&&vi.checked&&vi.hasVis&&vi.kept===0){
                  skipSt.mm++;
                  if(g.side==="above"&&!autoSeen[g.k]&&!ignored[g.k]){autoSeen[g.k]=1;autoNeg.push(g.k)}
                  return;
                }
                if(vi&&vi.strongOk>0&&!g.conf&&(((g.nImg>=2||g.sup>=1||g.tx>=1)&&vi.maxEns>=Math.max(84,best+2))||(vi.maxEns>=91&&g.mx>=88))){
                  if(g.side==="above"){skipSt.mmOk++;return}   /* đã đồng thuận mạnh cả thị giác + ngữ cảnh: không cần hỏi lại */
                  if(vi.maxEns>g.mx)g.mx=vi.maxEns;
                }
                outVis.push(g);
              });
              return outVis;
            }
            var aboveCands=gray.filter(function(g){return !g.ex&&g.side==="above"});
            var belowCands=gray.filter(function(g){return !g.ex&&g.side==="below"});
            var visCands=aboveCands.slice(0,30).concat(belowCands.slice(0,Math.max(12,48-Math.min(30,aboveCands.length))));
            if(visCands.length){
              return runVisPass(visCands).then(function(){
                if(isAborted(false)){smBack(snapV);return finalizeGray(gray)}
                var fg=filterVisList(gray);
                var extra=fg.slice(0,6).filter(function(g){return !g.ex&&!visInfo[g.k]});
                if(!extra.length){smBack(snapV);return finalizeGray(fg)}
                return runVisPass(extra).then(function(){
                  smBack(snapV);
                  return finalizeGray(filterVisList(fg));
                });
              },function(){
                smBack(snapV);
                return finalizeGray(gray);
              });
            }
          }
          return finalizeGray(gray);
        }
        return tierStep();
      });
    });
  });
}
function open(nt){
  if(nt)NT=nt;
  if(!N()){alert("Ứng dụng đang tải, thử lại sau vài giây.");return}
  init(N());
  undoSt=[];undoUi();
  if(smCloseHook)smCloseHook();
  loadSkip();
  loadImgMode();
  thUi();
  G("dupimgv").value=imgAutoMode;
  G("dupnoout").checked=skipOut;
  engUi();
  var sb=G("dupsave"),en=G("dupengnote"),aa=G("dupanact");
  if(sb){sb.classList.remove("dirty");sb.textContent="Lưu & quét lại ảnh"}
  if(en){en.hidden=true;en.textContent="";en.className="dpst dpfull"}
  if(aa){aa.hidden=true;lastRecTh=null}
  items=N().items();cleanImgPairs();limMain=limIgn=LIMIT;openSet={};openImgSet={};pairImgMode={};pairImgMsg={};cmpAll={};zoomCmp=null;showIgn=false;msg(imgPairs&&imgPairs.length?imgPairs.length+" cặp ảnh giống":"");syncScanUi();G("dupz").hidden=true;render();dpEnter();if(scanning||smRunning)msg("Đang dừng lượt quét trước…");
  if(!G("dupd").open)G("dupd").showModal();G("dupd").scrollTop=0;
  loadCache().then(function(){if(G("dupd").open&&!scanning&&!smRunning){if(imgPairs===null)applyCachedPairs();autoScan()}});
  pullIgnored(false);hsPull()}
function close(){
  stopScan();if(smCloseHook)smCloseHook();zoomCmp=null;undoSt=[];undoUi();
  flushIgnored();hsFlush();
  var z=G("dupz"),d=G("dupd");
  if(z)z.hidden=true;
  if(d&&d.open)d.close()}
function sync(){
  var d=G("dupd");if(!(d&&d.open&&N()))return;
  clearTimeout(syncT);syncT=setTimeout(function(){
    items=N().items();cleanImgPairs();
    loadIgnored();loadSmartPos();
    smRawCache=null;
    if(items.length){   /* danh sách rỗng/chưa nạp thì không dọn; chỉ ẩn trên máy, máy chủ tự xóa cặp khi xóa căn (như pullIgnored) */
      var byId={},chg=false;items.forEach(function(it){byId[it.id]=1});
      Object.keys(ignored).forEach(function(k){var ids=k.split("|");if(!byId[ids[0]]||!byId[ids[1]]){delete ignored[k];delete ignDirty[k];chg=true}});
      if(chg)ignWriteLs();
      cleanSmartPos(byId)}
    render();
    if(cacheLoaded&&!scanning)autoScan()
  },120)}

/* ---------- Quét kiểm / sửa đồng bộ cặp «Không phải trùng» + «Trùng» (dùng bởi dbg.js) ---------- */
function syncState(){
  loadIgnored();loadSmartPos();
  return{ign:Object.assign({},ignored),ignQ:Object.assign({},ignDirty),pos:Object.assign({},smartPos),posQ:Object.assign({},posDirty),busy:!!dsBusy,canW:!!canWrite()}
}
function waitPushIdle(ms){
  return new Promise(function(res){
    var t0=Date.now();
    (function chk(){if((!dsBusy&&!dsAgain&&!dsT)||Date.now()-t0>ms)res();else setTimeout(chk,300)})()
  })
}
/* mode: "pull" (mặc định) = ghi lại bộ nhớ từ RAM, tự giải xung đột, kéo từ máy chủ rồi gửi hàng đợi;
         "repush" = đẩy lại các cặp chỉ có trên máy mà máy chủ chưa có (cả «Không phải trùng» lẫn «Trùng»);
         "mirror" = lấy máy chủ làm chuẩn: bỏ các cặp chỉ có trên máy (không đụng cặp đang chờ gửi). */
function resyncDup(mode){
  mode=mode||"pull";
  if(!(N()&&N().apiGet))return Promise.resolve({ok:false,msg:"Chưa có API máy chủ"});
  loadIgnored();loadSmartPos();
  return N().apiGet("&action=dup",25000).then(function(d){
    if(!d||!d.ok)return{ok:false,msg:"Máy chủ từ chối: "+(d&&d.error||"không rõ lý do")};
    var S={},SP={},its=N().items(),byId=null,r={ign:0,pos:0,conf:0,drop:0,noPos:!Array.isArray(d.pos)};
    (d.pairs||[]).forEach(function(p){S[p.k]=p.t||1});
    (d.pos||[]).forEach(function(p){SP[p.k]=p.t||1});
    if(its&&its.length){byId={};its.forEach(function(it){byId[it.id]=1})}
    function live(k){var q=k.split("|");return !byId||(byId[q[0]]&&byId[q[1]])}
    if(mode==="repush"){
      if(!canWrite())return{ok:false,msg:"Máy này chỉ xem, không gửi được lên máy chủ"};
      Object.keys(ignored).forEach(function(k){if(!(k in S)&&!(k in ignDirty)&&ignored[k]>0&&live(k)){ignDirty[k]=ignored[k];r.ign++}});
      if(!r.noPos)Object.keys(smartPos).forEach(function(k){if(!(k in SP)&&!(k in posDirty)&&live(k)){posDirty[k]=smartPos[k]>0?smartPos[k]:Date.now();r.pos++}});
      else r.pos=-1;
    }else if(mode==="mirror"){
      Object.keys(ignored).forEach(function(k){if(!(k in S)&&!(k in ignDirty)){delete ignored[k];r.drop++}});
      if(!r.noPos)Object.keys(smartPos).forEach(function(k){if(!(k in SP)&&!(k in posDirty)){delete smartPos[k];delete smartImg[k];r.drop++}});
    }
    /* cặp nằm ở cả hai danh sách: bên mới hơn thắng (bằng nhau thì «Không phải trùng» thắng, giống pullIgnored) */
    Object.keys(smartPos).forEach(function(k){
      if(!ignored[k])return;
      if(+ignored[k]>=+smartPos[k]){delete smartPos[k];delete smartImg[k];if(k in SP||k in posDirty)posDirty[k]=0}
      else{delete ignored[k];if(k in S||k in ignDirty)ignDirty[k]=0}
      r.conf++});
    if(mode==="repush"){r.ign=Object.keys(ignDirty).filter(function(k){return ignDirty[k]>0}).length;if(!r.noPos)r.pos=Object.keys(posDirty).filter(function(k){return posDirty[k]>0}).length}
    ignWriteLs();posWriteLs();
    return pullIgnored(true).then(function(){pushIgnored();return waitPushIdle(30000)}).then(function(){
      r.left=Object.keys(ignDirty).length+Object.keys(posDirty).length;
      r.ok=true;
      r.msg=(mode==="repush"?"Đã gửi lại "+r.ign+" cặp Không phải trùng"+(r.pos>=0?" + "+r.pos+" cặp Trùng":" (máy chủ chưa hỗ trợ cặp Trùng, cần cập nhật Code.gs)"):mode==="mirror"?"Đã bỏ "+r.drop+" cặp chỉ có trên máy (lấy máy chủ làm chuẩn)":"Đã ghi lại bộ nhớ và kéo từ máy chủ")+(r.conf?" · giải "+r.conf+" cặp xung đột":"")+(r.left?" · còn "+r.left+" thay đổi chờ gửi":"");
      var dd=G("dupd");if(dd&&dd.open)render();
      return r})
  },function(e){return{ok:false,msg:"Không kết nối được máy chủ: "+(e&&e.message||e)}})
}
window.Dup={v:KV,perf:function(){var o={};Object.keys(PERF).forEach(function(k){o[k]={n:PERF[k].n,max:PERF[k].max,avg:Math.round(PERF[k].sum/PERF[k].n)}});return o},mmState:smpState,mmResync:smpResync,retire:function(){return retList().map(function(x){return x.c})},ignStat:function(){return ignStat()},smart:function(){loadImgMode();var s=smartCalc();return{th:TH,ts:s.ts,mid:s.mid,tl:s.tl,strong:s.strong,algo:ALGO_VER,mm:MM_MODE,cal:s.cal,kept:s.kept,cut:s.cut,dedupCut:s.dedupCut,ctxCut:s.ctxCut,mmChecked:s.mmChecked,mmCut:s.mmCut,mmBoost:s.mmBoost,spChecked:s.spChecked,spCut:s.spCut,spSave:s.spSave,clusters:lastGraph?lastGraph.stats.clusterCount:0}},clusters:function(customImgPairs,customItems){if(customItems)items=customItems;else if(N())items=N().items();if(customImgPairs){imgPairs=customImgPairs}var r=build();return r.graph},sortAdjacent:function(list,customImgPairs){if(customImgPairs)imgPairs=customImgPairs;var srcList=list||(N()?N().items():items);if(!items.length&&srcList.length)items=srcList;var r=build();return sortHousesAdjacent(srcList,r.graph)},analyze:analyzeThresholds,keys:function(){return{h:CACHE_KEY,p:PM_KEY}},cached:function(){return cacheLoaded?Object.keys(cache).length:-1},dino:function(){
    if(DW.w)return"worker/"+DW.dev+" x"+BN+" res"+DS;
    if(DINO.m)return"main/wasm x"+BN+" res"+DS;
    if(DINO.p)return"đang tải";
    if(DINO.err)return"lỗi: "+DINO.err;
    return"chưa tải (chưa cần)"},dinoLoad:function(){return dinoLoad().then(function(){return window.Dup.dino()},function(e){return"lỗi: "+(e&&e.message||e)})},pull:function(f){var p=pullIgnored(f);if(f)hsPull();return p},syncState:syncState,resync:resyncDup,init:init,open:open,close:close,sync:sync,closeZoom:closeZoom};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){init()});
else init();
})();
