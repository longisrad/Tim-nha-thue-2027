/* bk.js: sao lưu / khôi phục dữ liệu (tách khỏi index.html).
   Sao lưu: lên Drive (server, giữ 30 bản), tải file về máy, hoặc ghi ra thư mục trên máy (Chrome/Edge máy tính).
   Khôi phục: chọn bản → xem trước số căn thêm/khác → tự sao lưu bản hiện tại → ghi từng đợt nhỏ, không xóa gì.
   index.html chỉ giữ hộp thoại #bd (HTML), nút #bk, hàm mỏng dirAuto() và cầu nối window.NB.
   Nạp theo thứ tự nào cũng được: index.html gọi Bk.init(NB) nếu bk.js nạp trước, bk.js tự gọi nếu NB có trước. */
(function(){
var inst=null;
function init(nb){
  if(inst||!nb)return;
  var N=nb,$=nb.$,IDBM=nb.IDBM,apiGet=nb.apiGet,apiPost=nb.apiPost,apiUrl=nb.apiUrl,capP=nb.capP,hs=nb.hs,netMsg=nb.netMsg,nrm=nb.nrm,refresh=nb.refresh;
  var api={};
  /* ===== Sao lưu / khôi phục =====
     Sao lưu: lên Drive (server, giữ 30 bản) hoặc tải file. Khôi phục: chọn bản → xem trước số căn thêm/khác → tự sao lưu bản hiện tại → ghi từng đợt nhỏ, không xóa gì. */
  var bkItems=null,bkMeta="",bkBusy=false;
  function stab(v){if(Array.isArray(v))return"["+v.map(stab).join(",")+"]";if(v&&typeof v==="object")return"{"+Object.keys(v).sort().map(function(k){return JSON.stringify(k)+":"+stab(v[k])}).join(",")+"}";return JSON.stringify(v===undefined?null:v)}
  /* So sánh căn trong app (bản nhẹ) với căn trong bản sao lưu (đầy đủ): bỏ trường rỗng, checklist so bằng mã h */
  function cmpKey(x){var o={};Object.keys(x).forEach(function(k){var v=x[k];
    if(k==="ck"){if(v&&typeof v==="object")o.ck=v.h||hs(JSON.stringify(v))}
    else if(!(v==null||v===""||(k==="t"&&!v)||(typeof v==="number"&&isNaN(v))||(Array.isArray(v)&&!v.length)))o[k]=v});return stab(o)}
  function bmsg(t,bad){var e=$("bm");e.textContent=t||"";e.className="pm"+(bad?" bad":"")}
  function bfmt(iso){var d=new Date(iso);return isNaN(d)?"":d.toLocaleString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}
  function bmode(){var r=document.querySelector('input[name="bmode"]:checked');return r?r.value:"missing"}
  function parseBk(text){
    var d=JSON.parse(text),a=Array.isArray(d)?d:(d&&Array.isArray(d.items)?d.items:null);
    if(!a)throw new Error("không phải file sao lưu");
    a=nrm(a.filter(function(x){return x&&x.n}));
    if(!a.length)throw new Error("không có căn nào trong bản sao lưu");
    a.forEach(function(x,k){if(!x.id)x.id="h"+Date.now().toString(36)+k});
    return a}
  /* Điền giá trị mặc định khi ghi (mã dán kiểu cũ có thể thiếu); không dùng khi so sánh để căn giống hệt không bị tính là khác */
  function bFill(x){var y=Object.assign({},x);if(!y.t)y.t=Date.now();if(!Array.isArray(y.im))y.im=[];return y}
  function bTodo(){
    var cur={},mode=bmode(),add=[],ov=[],same=0;
    N.items.forEach(function(x){cur[x.id]=x});
    (bkItems||[]).forEach(function(x){var c=cur[x.id];if(!c)add.push(x);else if(cmpKey(c)===cmpKey(x))same++;else ov.push(x)});
    return{add:add,ov:ov,same:same,run:mode==="all"?add.concat(ov):add}}
  function bPlan(){
    var el=$("bplan"),btn=$("bim");
    if(!bkItems){el.textContent="";btn.disabled=true;return}
    var t=bTodo();
    el.textContent=bkMeta+bkItems.length+" căn: "+t.add.length+" căn chưa có, "+t.ov.length+" căn đã có nhưng khác, "+t.same+" căn giống hệt."+(bmode()==="missing"&&t.ov.length?" Các căn khác nhau sẽ được giữ nguyên.":"");
    btn.disabled=!N.canW||bkBusy||!t.run.length}
  var BKL={"thu-cong":"thủ công","tu-dong":"tự động","truoc-khoi-phuc":"trước khi khôi phục"};
  function bLoad(){
    var sel=$("bsel"),keep=sel.value;sel.innerHTML='<option value="">Chọn bản sao lưu trên Drive…</option>';
    if(!N.canW||!apiUrl())return;
    apiPost("backups",{},20000).then(function(d){
      (d.list||[]).forEach(function(b){var o=document.createElement("option");o.value=b.id;o.textContent=bfmt(b.at)+" · "+b.count+" căn"+(b.label?" · "+(BKL[b.label]||b.label):"");sel.appendChild(o)});
      if(keep)sel.value=keep;
      if(!(d.list||[]).length)bmsg("Chưa có bản sao lưu nào trên Drive. Bấm “Sao lưu lên Drive” để tạo.")
    },function(e){bmsg("Không đọc được danh sách sao lưu: "+e.message,1)})}
  $("bk").onclick=function(){
    bkItems=null;bkMeta="";$("bsel").value="";$("bt").value="";$("bplan").textContent="";$("bim").disabled=true;bmsg("");
    if(!$("bd").open)$("bd").showModal();
    dirInit();refresh(true);bLoad()};
  $("bcl").onclick=function(){$("bd").close()};
  $("bnow").onclick=function(){
    if(bkBusy)return;bkBusy=true;bmsg("Đang sao lưu lên Drive…");
    apiPost("backup",{label:"thu-cong"},60000).then(function(d){bmsg("Đã sao lưu "+d.backup.count+" căn: "+d.backup.name);bLoad()},function(e){bmsg("Chưa sao lưu được: "+e.message,1)}).then(function(){bkBusy=false;bPlan()})};
  /* App Android: WebView không tải được link blob, nên ghi file vào bộ nhớ tạm rồi mở hộp chia sẻ để người dùng chọn nơi lưu (Drive, Tệp...) */
  function capSave(name,txt,n){
    return capP("Filesystem").writeFile({path:name,data:txt,directory:"CACHE",encoding:"utf8"}).then(function(r){
      return capP("Share").share({title:"Sao lưu nhà thuê",text:name,url:r.uri,dialogTitle:"Lưu bản sao lưu"})
    }).then(function(){bmsg("Đã tạo "+name+" ("+n+" căn). Chọn nơi lưu trong hộp chia sẻ.")},function(e){
      if(e&&/cancel/i.test(e.message||""))bmsg("");else bmsg("Chưa lưu được: "+(e&&e.message?e.message:e),1)})}
  $("bdl").onclick=function(){
    bmsg("Đang chuẩn bị file…");
    apiGet("&action=export",45000).then(function(d){
      if(!d.ok)throw new Error(d.error||"Lỗi máy chủ");
      var arr=d.items||[];
      if(!arr.length){bmsg("Chưa có dữ liệu để sao lưu.",1);return}
      var at=new Date(),pd=function(n){return(n<10?"0":"")+n},
          name="nha-thue_"+at.getFullYear()+"-"+pd(at.getMonth()+1)+"-"+pd(at.getDate())+"_"+pd(at.getHours())+"-"+pd(at.getMinutes())+".json",
          txt=JSON.stringify({app:"nha-thue",v:2,at:at.toISOString(),count:arr.length,items:arr}),
          blob=new Blob([txt],{type:"application/json"}),
          a=document.createElement("a");
      if(capP("Filesystem")&&capP("Share"))return capSave(name,txt,arr.length);
      a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();
      setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},60000);
      bmsg("Đã tải "+name+" ("+arr.length+" căn).")
    }).catch(function(e){bmsg("Chưa tải được: "+netMsg(e),1)})};
  /* Thư mục trên máy (File System Access API, Chrome/Edge máy tính): ghi bản sao dữ liệu ra file thật */
  var dirH=null,dirT=0,dirBusy=false;
  function dirMsg(t,bad){var e=$("bdirm");e.textContent=t||"";e.className="pm"+(bad?" bad":"")}
  function dirUi(){var on=!!dirH;$("bdirnow").disabled=!on||dirBusy;$("bdiroff").disabled=!on;if(on&&!$("bdirm").textContent)dirMsg("Đang dùng thư mục: "+dirH.name)}
  function dirLoad(){if(!window.showDirectoryPicker||dirH)return Promise.resolve();return IDBM.get("dir").then(function(h){if(h&&h.kind==="directory")dirH=h},function(){})}
  function dirInit(){if(!window.showDirectoryPicker)return;$("bdirbox").hidden=false;dirLoad().then(dirUi)}
  function dirPerm(ask){
    if(!dirH)return Promise.resolve(false);var o={mode:"readwrite"};
    return dirH.queryPermission(o).then(function(p){if(p==="granted")return true;if(!ask)return false;return dirH.requestPermission(o).then(function(q){return q==="granted"})}).catch(function(){return false})}
  function dirFile(name,txt){return dirH.getFileHandle(name,{create:true}).then(function(f){return f.createWritable()}).then(function(w){return w.write(txt).then(function(){return w.close()})})}
  async function dirPrune(){try{var ds=[];for await(var e of dirH.values()){if(e.kind==="file"&&/^nha-thue_\d{4}-\d\d-\d\d\.json$/.test(e.name))ds.push(e.name)}ds.sort().reverse();for(var i=14;i<ds.length;i++)await dirH.removeEntry(ds[i])}catch(e){}}
  function dirSave(ask){
    if(dirBusy||!dirH)return Promise.resolve(false);
    dirBusy=true;dirUi();
    return dirPerm(ask).then(function(ok){
      if(!ok)throw new Error("chưa được phép ghi vào thư mục (bấm “Ghi ngay” rồi chọn Cho phép)");
      return apiGet("&action=export",45000)}).then(function(d){
      if(!d.ok)throw new Error(d.error||"Lỗi máy chủ");
      var arr=d.items||[];if(!arr.length)throw new Error("chưa có dữ liệu");
      var at=new Date(),pd=function(n){return(n<10?"0":"")+n},day=at.getFullYear()+"-"+pd(at.getMonth()+1)+"-"+pd(at.getDate());
      var txt=JSON.stringify({app:"nha-thue",v:2,at:at.toISOString(),count:arr.length,items:arr});
      return dirFile("nha-thue_moi-nhat.json",txt).then(function(){return dirFile("nha-thue_"+day+".json",txt)}).then(dirPrune).then(function(){return arr.length})
    }).then(function(n){dirBusy=false;dirUi();dirMsg("Đã ghi "+n+" căn vào thư mục “"+dirH.name+"” lúc "+bfmt(new Date().toISOString()));return true},function(e){dirBusy=false;dirUi();dirMsg("Chưa ghi được: "+(e&&e.message?e.message:e),1);return false})}
  function dirAuto(){if(dirH&&!dirBusy&&Date.now()-dirT>600000){dirT=Date.now();dirSave(false)}}
  $("bdir").onclick=function(){
    window.showDirectoryPicker({mode:"readwrite"}).then(function(h){dirH=h;return IDBM.set("dir",h)}).then(function(){dirMsg("");dirUi();return dirSave(true)}).catch(function(e){if(!e||e.name!=="AbortError")dirMsg("Không chọn được thư mục: "+(e&&e.message||e),1)})};
  $("bdirnow").onclick=function(){dirSave(true)};
  $("bdiroff").onclick=function(){dirH=null;IDBM.set("dir","").catch(function(){});dirMsg("Đã tắt ghi vào thư mục.");dirUi()};
  $("bsel").onchange=function(){
    var id=this.value;bkItems=null;bPlan();if(!id)return;
    bmsg("Đang đọc bản sao lưu…");
    apiPost("backupGet",{id:id},60000).then(function(d){
      bkItems=parseBk(JSON.stringify(d.items));bkMeta="Bản "+bfmt(d.at)+": ";bmsg("");bPlan()
    },function(e){bkItems=null;bPlan();bmsg("Không đọc được bản sao lưu: "+e.message,1)})};
  $("bpick").onclick=function(){$("bfile").click()};
  $("bfile").onchange=function(){
    var f=this.files&&this.files[0];this.value="";if(!f)return;
    $("bsel").value="";bkItems=null;bPlan();bmsg("Đang đọc file…");
    var r=new FileReader();
    r.onload=function(){try{bkItems=parseBk(String(r.result));bkMeta="File "+f.name+": ";bmsg("");bPlan()}catch(e){bkItems=null;bPlan();bmsg("File không hợp lệ: "+e.message,1)}};
    r.onerror=function(){bmsg("Không đọc được file.",1)};
    r.readAsText(f)};
  $("bpar").onclick=function(){
    $("bsel").value="";
    try{bkItems=parseBk($("bt").value);bkMeta="Mã dán vào: ";bmsg("");bPlan()}catch(e){bkItems=null;bPlan();bmsg("Mã không hợp lệ.",1)}};
  Array.prototype.forEach.call(document.querySelectorAll('input[name="bmode"]'),function(r){r.onchange=bPlan});
  function bSend(part,mode,left){
    return apiPost("restoreItems",{items:part,mode:mode},60000).catch(function(e){
      if(left<=0)throw e;
      return new Promise(function(z){setTimeout(z,1500)}).then(function(){return bSend(part,mode,left-1)})})}
  $("bim").onclick=function(){
    if(!bkItems||bkBusy||!N.canW)return;
    var mode=bmode(),t=bTodo(),run=t.run;
    if(!run.length)return;
    var nOv=mode==="all"?t.ov.length:0;
    if(!confirm("Khôi phục "+run.length+" căn ("+t.add.length+" thêm mới"+(nOv?", "+nOv+" ghi đè":"")+")?\nHệ thống sẽ tự sao lưu dữ liệu hiện tại lên Drive trước khi ghi. Không có căn nào bị xóa."))return;
    bkBusy=true;N.pendAdd(1);$("bim").disabled=true;bmsg("Đang sao lưu dữ liệu hiện tại…");
    var n=0,CH=15,tot=run.length;
    function step(){
      if(n>=tot)return Promise.resolve();
      var part=run.slice(n,n+CH).map(bFill);
      return bSend(part,mode,2).then(function(){n+=part.length;bmsg("Đang khôi phục "+n+"/"+tot+"…");return step()})}
    apiPost("backup",{label:"truoc-khoi-phuc"},60000).then(function(){return step()},function(e){
      throw new Error("chưa tạo được bản sao lưu an toàn ("+e.message+"), chưa ghi gì")
    }).then(function(){
      bmsg("Đã khôi phục "+tot+" căn.")
    },function(e){
      bmsg(n?"Dừng ở "+n+"/"+tot+" căn: "+e.message+". Phần đã ghi vẫn giữ nguyên, bấm Khôi phục lại để làm tiếp.":"Chưa khôi phục: "+e.message,1)
    }).then(function(){
      bkBusy=false;N.pendAdd(-1);N.bumpVer();
      return refresh(true)
    }).then(function(){bPlan();bLoad()})};
  api.dirAuto=dirAuto;api.dirLoad=dirLoad;
  inst=api;
  try{$("bk").dataset.ready="1"}catch(e){}
  dirLoad().catch(function(){});
}
window.Bk={
  init:init,
  dirAuto:function(){if(inst)inst.dirAuto()},
  dirLoad:function(){return inst?inst.dirLoad():Promise.resolve()}
};
if(window.NB)init(window.NB);
})();
