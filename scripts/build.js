// Build: gộp ck.js + img.js + dup.js + bk.js thành app.js (nén nếu có esbuild), chép phần còn lại ra thư mục đầu ra.
// Dùng: node scripts/build.js [thư_mục_đầu_ra=dist] [--no-map]
//   dist -> đưa lên GitHub Pages (PWA);  www --no-map -> đóng gói vào APK (Capacitor).
// File nguồn ở gốc repo giữ nguyên, tách riêng như cũ để dễ sửa.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const args = process.argv.slice(2);
const OUT = args.find(a => !a.startsWith('--')) || 'dist';
const WANT_MAP = !args.includes('--no-map');
const BUNDLE = ['ck.js', 'img.js', 'dup.js', 'bk.js'];          // thứ tự nạp (giữ đúng thứ tự thẻ <script> cũ)
const COPY_FILES = ['manifest.webmanifest', 'CNAME', '.nojekyll', 'robots.txt', 'favicon.ico'];
const COPY_DIRS = ['icons', 'fonts', 'models'];

function fail(msg) { console.error('::error::' + msg); process.exit(1); }
function read(f) { return fs.readFileSync(f, 'utf8'); }
function write(f, s) { fs.writeFileSync(path.join(OUT, f), s); }
function swap(s, from, to, what) {                               // thay đúng 1 chỗ; không thấy thì dừng build để khỏi ra bản hỏng âm thầm
  const i = s.indexOf(from);
  if (i < 0 || s.indexOf(from, i + 1) >= 0) fail('Không khớp đúng 1 chỗ khi sửa ' + what + '. Mẫu: ' + JSON.stringify(from.slice(0, 60)));
  return s.replace(from, () => to);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// ---------- 1. app.js ----------
for (const f of BUNDLE) if (!fs.existsSync(f)) fail('Thiếu ' + f);
const joined = BUNDLE.map(f => '/* ===== ' + f + ' ===== */\n' + read(f).replace(/\s+$/, '')).join('\n;\n') + '\n';
let esbuild = null;
try { esbuild = require('esbuild'); } catch (e) {}
let code = joined, map = null;
if (esbuild) {
  // Chỉ nén khoảng trắng + cú pháp, KHÔNG đổi tên biến: dup.js tạo Web Worker từ mã hàm (toString), đổi tên dễ làm hỏng.
  try {
    const r = esbuild.transformSync(joined, {
      loader: 'js', minifyWhitespace: true, minifySyntax: true, minifyIdentifiers: false,
      legalComments: 'none', sourcefile: 'app.src.js', sourcemap: WANT_MAP ? 'external' : false
    });
    code = r.code; map = r.map || null;
  } catch (e) {
    console.warn('Cảnh báo: esbuild không nén được app.js, dùng bản nối chưa nén. Lý do: ' + String(e.message).split('\n')[0]);
    esbuild = null; code = joined; map = null;
  }
} else if (process.env.CI) {
  fail('Thiếu esbuild trong CI (chạy npm ci / npm install).');
} else {
  console.warn('Cảnh báo: chưa cài esbuild, chỉ nối file, chưa nén.');
}
try { new vm.Script(code, { filename: 'app.js' }); } catch (e) { fail('app.js lỗi cú pháp sau khi gộp: ' + e.message); }
for (const g of ['window.Ck=', 'window.Img=', 'window.Dup=', 'window.Bk=']) if (code.indexOf(g) < 0) fail('app.js thiếu ' + g);
if (map) { code += '//# sourceMappingURL=app.js.map\n'; write('app.js.map', map); write('app.src.js', joined); }
write('app.js', code);

// ---------- 2. index.html: 4 thẻ script -> 1 thẻ, rồi nén khoảng trắng ----------
// Nén an toàn: script/style đi qua esbuild (không đổi tên biến), phần HTML chỉ bỏ thụt đầu dòng, khoảng trắng cuối dòng và dòng trống.
// Giữ nguyên <pre>, <textarea>. Khối nào nén lỗi thì giữ bản gốc, không làm hỏng build.
function minJs(code) {
  if (!esbuild) return code;
  try {
    const o = esbuild.transformSync(code, { loader: 'js', minifyWhitespace: true, minifySyntax: true, minifyIdentifiers: false, legalComments: 'none' }).code.trim();
    if (/<\/script/i.test(o)) return code;
    new vm.Script(o);
    return o.length < code.length ? o : code;
  } catch (e) { console.warn('Không nén được 1 khối script, giữ nguyên: ' + String(e.message).split('\n')[0]); return code; }
}
function minCss(code) {
  if (!esbuild) return code;
  try {
    const o = esbuild.transformSync(code, { loader: 'css', minifyWhitespace: true, legalComments: 'none' }).code.trim();
    return o && o.length < code.length ? o : code;
  } catch (e) { console.warn('Không nén được 1 khối style, giữ nguyên: ' + String(e.message).split('\n')[0]); return code; }
}
function minifyHtml(src) {
  const parts = src.split(/(<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<pre\b[\s\S]*?<\/pre>|<textarea\b[\s\S]*?<\/textarea>)/i);
  return parts.map((p, i) => {
    if (i % 2 === 0) return p.replace(/[ \t]+$/gm, '').replace(/^[ \t]+/gm, '').replace(/\n{2,}/g, '\n');
    const m = /^(<(script|style)\b[^>]*>)([\s\S]*?)(<\/\2>)$/i.exec(p);
    if (!m) return p;
    const tag = m[2].toLowerCase(), open = m[1];
    if (tag === 'script') {
      if (/\bsrc\s*=/i.test(open)) return p;
      const ty = /\btype\s*=\s*["']?([^"'\s>]+)/i.exec(open);
      if (ty && !/^(text\/javascript|module)$/i.test(ty[1])) return p;      // JSON, template... giữ nguyên
      return open + minJs(m[3]) + m[4];
    }
    return open + minCss(m[3]) + m[4];
  }).join('');
}

let html = read('index.html');
const tags = BUNDLE.map(f => '<script src="' + f + '" defer></script>');
html = swap(html.replace(/\r\n/g, '\n'), tags.join('\n'), '<script src="app.js" defer></script>', 'thẻ script trong index.html');
const htmlBefore = Buffer.byteLength(html);
html = minifyHtml(html);
write('index.html', html);

// ---------- 3. sw.js: danh sách file của vỏ app ----------
let sw = read('sw.js').replace(/\r\n/g, '\n');
sw = swap(sw, "const DUP = './dup.js';\nconst IMGJS = './img.js';\nconst CKJS = './ck.js';\nconst BKJS = './bk.js';\n", "const APPJS = './app.js';\n", 'hằng số file trong sw.js');
sw = swap(sw, '  DUP,\n  IMGJS,\n  CKJS,\n  BKJS,\n', '  APPJS,\n', 'SHELL_FILES trong sw.js');
sw = swap(sw, 'var APP_FILES = [INDEX, DUP, IMGJS, CKJS, BKJS, DBGJS];', 'var APP_FILES = [INDEX, APPJS, DBGJS];', 'APP_FILES trong sw.js');
if (/\b(DUP|IMGJS|CKJS|BKJS)\b/.test(sw)) fail('sw.js còn tham chiếu file cũ sau khi sửa');
write('sw.js', sw);

// ---------- 4. dbg.js: danh sách file để đo ----------
let dbg = read('dbg.js');
dbg = swap(dbg, 'var FILES=["ck.js","img.js","dup.js","bk.js","dbg.js"];', 'var FILES=["app.js","dbg.js"];', 'FILES trong dbg.js');
write('dbg.js', dbg);

// ---------- 5. file tĩnh ----------
for (const f of COPY_FILES) if (fs.existsSync(f)) fs.copyFileSync(f, path.join(OUT, f));
for (const d of COPY_DIRS) if (fs.existsSync(d)) fs.cpSync(d, path.join(OUT, d), { recursive: true });

// ---------- 6. kiểm tra: mọi <script src> / <link href> nội bộ phải có trong thư mục đầu ra ----------
const refs = [...html.matchAll(/<(?:script|link)[^>]+(?:src|href)=["']([^"':#?]+)["']/g)].map(m => m[1]);
const missing = refs.filter(r => !fs.existsSync(path.join(OUT, r)));
if (missing.length) fail('index.html tham chiếu file không có trong ' + OUT + ': ' + missing.join(', '));
const kb = f => (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0) + ' KB';
console.log('Build OK -> ' + OUT + '/  app.js ' + kb('app.js') + (esbuild ? ' (đã nén)' : ' (chưa nén)') +
  ' · index.html ' + (htmlBefore / 1024).toFixed(0) + ' -> ' + kb('index.html') + ' · dbg.js ' + kb('dbg.js'));
