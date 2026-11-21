/* Service worker – Tìm nhà thuê.
   Hai chế độ:
   - PWA (mặc định): cache vỏ app + font/icon + ảnh Drive.
   - APK Capacitor (đăng ký với ?app=1): file app đã nằm sẵn trong APK nên KHÔNG cache vỏ app, chỉ cache ảnh Drive.
   Đổi VERSION khi đổi font/icon/manifest. Sửa index.html thì không cần đổi (tự cập nhật mỗi lần mở). */
const VERSION = 'v22';
const SHELL = 'shell-' + VERSION;
const RUNTIME = 'runtime-' + VERSION;
const NEXT = 'next-' + VERSION;   // bản mới tải về, chờ lần mở trang kế tiếp mới áp dụng (tránh lệch index.html cũ + ck.js mới)
const IMG = 'img-v1';            // KHÔNG gắn VERSION: đổi VERSION không làm mất ảnh đã tải
const APP_MODE = new URL(self.location.href).searchParams.get('app') === '1';
const INDEX = './index.html';
const DUP = './dup.js';
const IMGJS = './img.js';
const CKJS = './ck.js';
const SHELL_FILES = [
  './',
  INDEX,
  DUP,
  IMGJS,
  CKJS,
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './fonts/bvp-400.woff',
  './fonts/bvp-500.woff',
  './fonts/bvp-700.woff',
  './fonts/bvp-800.woff',
  './fonts/montserrat-800.woff'
];
const RUNTIME_MAX = 30;          // file tĩnh lạ cùng nguồn
const IMG_MAX_S = 1500;          // ảnh nhỏ (<= 360px, thumbnail/checklist): ~25 KB/ảnh
const IMG_MAX_L = 240;           // ảnh lớn (> 360px, xem chi tiết/lightbox): ~150 KB/ảnh
const SMALL_W = 360;             // tách 2 hạn mức để ảnh nhỏ của hàng trăm căn không đẩy ảnh lớn ra khỏi cache (và ngược lại)
const IMG_SIZES = [200, 300, 360, 640, 900, 1280];   // các cỡ app đang dùng
const IMG_RE = /^\/d\/([^=\/?]+)=w(\d+)$/;           // lh3.googleusercontent.com/d/<id>=w<px>
const noop = function () {};

self.addEventListener('install', function (e) {
  if (!APP_MODE) {
    // Từng file một: thiếu một file không làm hỏng cả lần cài. cache:'reload' bỏ qua cache HTTP.
    e.waitUntil(caches.open(SHELL).then(function (c) {
      return Promise.all(SHELL_FILES.map(function (f) {
        return c.add(new Request(f, { cache: 'reload' })).catch(noop);
      }));
    }));
  }
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== SHELL && k !== RUNTIME && k !== IMG && k !== NEXT; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  // Ảnh Drive qua lh3 (cỡ cố định, không có ?query): cache lâu dài. Các URL ảnh dự phòng/thử lại để trình duyệt tự xử lý.
  if (url.hostname === 'lh3.googleusercontent.com') {
    var m = !url.search && IMG_RE.exec(url.pathname);
    if (m) e.respondWith(image(e, url, m[1], +m[2]));
    return;
  }
  // API Apps Script và mọi nguồn Google khác: luôn lấy dữ liệu mới
  if (url.origin !== location.origin) return;
  if (APP_MODE) return;            // APK/App: file app lấy thẳng từ gói app

  if (req.mode === 'navigate') { e.respondWith(openPage(e)); return; }
  e.respondWith(asset(e, req));
});

/* ---------- Ảnh Drive: cache trước, không hỏi lại mạng (ảnh theo id là bất biến) ---------- */
var putN = 0;
var pending = {};   // key -> { p: Promise<Response>, saved: Promise<void>|null }
function image(e, url, id, w) {
  var base = url.origin + '/d/' + id + '=w', key = base + w;
  // Ưu tiên đúng cỡ; nếu chưa có thì dùng cỡ lớn hơn nhưng không quá 2 lần (đỡ tải lại, không tốn RAM giải mã)
  var list = [w].concat(IMG_SIZES.filter(function (s) { return s > w && s <= w * 2; }));
  var work = caches.open(IMG).then(function (c) {
    return pick(c, base, list).then(function (hit) {
      if (hit) return { res: hit };
      var ent = pending[key];
      if (!ent) {
        ent = { p: null, saved: null };
        // mode:'cors' để lưu được phản hồi đầy đủ (opaque bị Chrome tính ~7 MB/ảnh vào hạn mức)
        ent.p = fetch(new Request(url.href, { mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer' })).then(function (res) {
          if (res.ok) ent.saved = c.put(key, res.clone()).then(function () { return (++putN % 10 === 0) ? trimImg(c) : null; }).catch(noop);
          return res;
        });
        pending[key] = ent;
        var done = function () { delete pending[key]; };
        ent.p.then(function () { return ent.saved; }).then(done, done);   // giữ mục này đến khi ghi cache xong, tránh khe hở tải trùng
      }
      return ent.p.then(function (res) { return { res: res.clone(), saved: ent.saved }; },
                        function () { return { res: null }; });            // CORS bị chặn hoặc mất mạng: để trình duyệt tải như cũ (không lưu)
    });
  });
  e.waitUntil(work.then(function (w2) { return w2.saved; }).catch(noop));   // gọi ngay trong sự kiện fetch
  return work.then(function (w2) { return w2.res || fetch(e.request); });
}
function pick(c, base, list) {
  if (!list.length) return Promise.resolve(null);
  return c.match(base + list[0]).then(function (h) { return h || pick(c, base, list.slice(1)); });
}

/* ---------- PWA: trang chính mở ngay từ bản đã lưu, tải bản mới ngầm (index.html, dup.js, img.js và ck.js) ----------
   Bản mới được tải đủ cả 4 file rồi mới đưa vào NEXT; lần mở trang kế tiếp mới chuyển sang SHELL cùng lúc.
   Nhờ vậy trang đang chạy không bao giờ nhận index.html cũ ghép với ck.js/img.js/dup.js mới (cầu nối NK/NI sẽ lệch). */
var APP_FILES = [INDEX, DUP, IMGJS, CKJS];
function clean(res) {   // phản hồi đã bị chuyển hướng không dùng được cho điều hướng trang
  return res.redirected ? res.blob().then(function (b) {
    return new Response(b, { status: res.status, statusText: res.statusText, headers: res.headers });
  }) : res;
}
function differs(a, b) {
  return Promise.all([a.text(), b.text()]).then(function (t) { return t[0] !== t[1]; }, function () { return true; });
}
function fetchFile(path) {
  return fetch(path, { cache: 'no-cache' }).then(clean).then(function (res) { return res && res.ok ? res : null; }, function () { return null; });
}
// Đưa bản đã chờ trong NEXT vào SHELL (chạy trước khi phục vụ trang)
function promote() {
  return Promise.all([caches.open(NEXT), caches.open(SHELL)]).then(function (cs) {
    var n = cs[0], s = cs[1];
    return n.keys().then(function (ks) {
      return Promise.all(ks.map(function (k) {
        return n.match(k).then(function (r) {
          var p = [s.put(k, r.clone())];
          if (new URL(k.url).pathname === new URL(INDEX, self.location.href).pathname) p.push(s.put('./', r.clone()));
          return Promise.all(p);
        });
      })).then(function () { return Promise.all(ks.map(function (k) { return n.delete(k); })); });
    });
  }).catch(noop);
}
// Tải ngầm bản mới: chỉ khi tải đủ cả 4 file mới xếp vào NEXT (có file lỗi thì bỏ cả đợt, lần mở sau thử lại)
function syncNext() {
  return Promise.all([caches.open(SHELL), caches.open(NEXT)]).then(function (cs) {
    var s = cs[0], n = cs[1];
    return Promise.all(APP_FILES.map(fetchFile)).then(function (rs) {
      if (rs.some(function (r) { return !r; })) return false;
      return Promise.all(rs.map(function (r, i) {
        return s.match(APP_FILES[i]).then(function (old) {
          if (!old) return s.put(APP_FILES[i], r.clone()).then(function () { return false; });   // lần cài đầu: ghi thẳng
          return differs(old, r.clone()).then(function (d) { return d ? n.put(APP_FILES[i], r.clone()).then(function () { return true; }) : false; });
        });
      })).then(function (ch) { return ch.some(Boolean); });
    });
  }).then(function (changed) { if (changed) return tellPages(); }).catch(noop);
}
function openPage(e) {
  var serve = promote().then(function () {
    return caches.match(INDEX, { ignoreSearch: true });
  });
  e.waitUntil(serve.then(syncNext));   // sau khi đã phục vụ trang mới tải bản kế tiếp
  return serve.then(function (hit) {
    return hit || fetch(e.request).catch(function () { return caches.match('./'); });
  }).then(function (r) { return r || Response.error(); });
}
function tellPages() {
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cs) {
    cs.forEach(function (c) { c.postMessage({ type: 'update' }); });
  });
}
self.addEventListener('message', function (e) {
  if (APP_MODE || !e.data || e.data.type !== 'status' || !e.source) return;
  e.waitUntil(caches.open(NEXT).then(function (c) { return c.keys(); }).then(function (ks) {
    if (ks.length) e.source.postMessage({ type: 'update' });
  }));
});

/* ---------- File tĩnh cùng nguồn ---------- */
function asset(e, req) {
  // File cài sẵn (font, icon, manifest): lấy thẳng từ cache, KHÔNG gọi mạng mỗi lần. Muốn làm mới thì đổi VERSION.
  return caches.open(SHELL).then(function (s) { return s.match(req); }).then(function (hit) {
    return hit || swr(e, req);
  });
}
/* File lạ cùng nguồn: dùng cache trước, cập nhật ngầm */
function swr(e, req) {
  var net = fetch(req).then(function (res) {
    if (res && res.ok) {
      var copy = res.clone();
      caches.open(RUNTIME).then(function (c) { return c.put(req, copy).then(function () { return trim(c, RUNTIME_MAX); }); }).catch(noop);
    }
    return res;
  }).catch(function () { return null; });
  e.waitUntil(net);
  return caches.open(RUNTIME).then(function (c) { return c.match(req); }).then(function (hit) {
    return hit || net.then(function (r) { return r || Response.error(); });
  });
}
function trim(c, max) {
  return c.keys().then(function (ks) {
    return Promise.all(ks.slice(0, Math.max(0, ks.length - max)).map(function (k) { return c.delete(k); }));
  });
}
function trimImg(c) {   // hạn mức riêng cho ảnh nhỏ và ảnh lớn; thứ tự keys() = thứ tự ghi, nên xóa ảnh cũ nhất trước
  return c.keys().then(function (ks) {
    var sm = [], lg = [];
    ks.forEach(function (k) { var m = /=w(\d+)$/.exec(k.url); (m && +m[1] <= SMALL_W ? sm : lg).push(k); });
    var del = sm.slice(0, Math.max(0, sm.length - IMG_MAX_S)).concat(lg.slice(0, Math.max(0, lg.length - IMG_MAX_L)));
    return Promise.all(del.map(function (k) { return c.delete(k); }));
  });
}
