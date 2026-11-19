/* Service worker – Tìm nhà thuê.
   Hai chế độ:
   - PWA (mặc định): cache vỏ app + font/icon + ảnh Drive.
   - APK Capacitor (đăng ký với ?app=1): file app đã nằm sẵn trong APK nên KHÔNG cache vỏ app, chỉ cache ảnh Drive.
   Đổi VERSION khi đổi font/icon/manifest. Sửa index.html thì không cần đổi (tự cập nhật mỗi lần mở). */
const VERSION = 'v11';
const SHELL = 'shell-' + VERSION;
const RUNTIME = 'runtime-' + VERSION;
const IMG = 'img-v1';            // KHÔNG gắn VERSION: đổi VERSION không làm mất ảnh đã tải
const APP_MODE = new URL(self.location.href).searchParams.get('app') === '1';
const INDEX = './index.html';
const MARK = './__update';       // dấu "đã có bản mới chưa được mở"
const SHELL_FILES = [
  './',
  INDEX,
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './fonts/bvp-400.ttf',
  './fonts/bvp-500.ttf',
  './fonts/bvp-700.ttf',
  './fonts/bvp-800.ttf'
];
const RUNTIME_MAX = 30;          // file tĩnh lạ cùng nguồn
const IMG_MAX = 250;             // số ảnh tối đa giữ lại (~25–50 MB với ảnh thu nhỏ)
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
      return Promise.all(keys.filter(function (k) { return k !== SHELL && k !== RUNTIME && k !== IMG; })
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
  if (APP_MODE) return;            // APK: file app lấy thẳng từ gói APK

  if (req.mode === 'navigate') { e.respondWith(openPage(e)); return; }
  e.respondWith(asset(e, req));
});

/* ---------- Ảnh Drive: cache trước, không hỏi lại mạng (ảnh theo id là bất biến) ---------- */
function image(e, url, id, w) {
  var base = url.origin + '/d/' + id + '=w', key = base + w;
  // Ưu tiên đúng cỡ; nếu chưa có thì dùng cỡ lớn hơn nhưng không quá 2 lần (đỡ tải lại, không tốn RAM giải mã)
  var list = [w].concat(IMG_SIZES.filter(function (s) { return s > w && s <= w * 2; }));
  var work = caches.open(IMG).then(function (c) {
    return pick(c, base, list).then(function (hit) {
      if (hit) return { res: hit };
      // mode:'cors' để lưu được phản hồi đầy đủ (opaque bị Chrome tính ~7 MB/ảnh vào hạn mức)
      return fetch(new Request(url.href, { mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer' })).then(function (res) {
        if (!res.ok) return { res: res };
        return { res: res, saved: c.put(key, res.clone()).then(function () { return trim(c, IMG_MAX); }).catch(noop) };
      }, function () { return { res: null }; });   // CORS bị chặn hoặc mất mạng: bên dưới để trình duyệt tải như cũ (không lưu)
    });
  });
  e.waitUntil(work.then(function (w2) { return w2.saved; }).catch(noop));   // gọi ngay trong sự kiện fetch
  return work.then(function (w2) { return w2.res || fetch(e.request); });
}
function pick(c, base, list) {
  if (!list.length) return Promise.resolve(null);
  return c.match(base + list[0]).then(function (h) { return h || pick(c, base, list.slice(1)); });
}

/* ---------- PWA: trang chính mở ngay từ bản đã lưu, tải bản mới ngầm ---------- */
function clean(res) {   // phản hồi đã bị chuyển hướng không dùng được cho điều hướng trang
  return res.redirected ? res.blob().then(function (b) {
    return new Response(b, { status: res.status, statusText: res.statusText, headers: res.headers });
  }) : res;
}
function openPage(e) {
  // cache:'no-cache' = hỏi lại server bằng ETag (nhẹ, thường 304); không bị kẹt bản cũ trong cache HTTP
  var net = fetch(INDEX, { cache: 'no-cache' }).then(clean).then(function (res) {
    if (!res || !res.ok) return res;
    return caches.open(SHELL).then(function (c) {
      return c.match(INDEX).then(function (old) {
        return (old ? differs(old, res.clone()) : Promise.resolve(false)).then(function (changed) {
          // Chỉ ghi khi có thay đổi (trước đây ghi 2 lần ~160 KB mỗi lần mở app)
          var write = (changed || !old) ? Promise.all([c.put(INDEX, res.clone()), c.put('./', res.clone())]) : Promise.resolve();
          return write.then(function () {
            return changed ? c.put(MARK, new Response('1')) : c.delete(MARK);
          }).then(function () { if (changed) tellPages(); return res; });
        });
      });
    }).catch(function () { return res; });
  }).catch(function () { return null; });
  e.waitUntil(net);
  return caches.match(INDEX, { ignoreSearch: true }).then(function (hit) {
    return hit || net.then(function (r) { return r || caches.match('./'); });
  }).then(function (r) { return r || Response.error(); });
}
function differs(a, b) {
  return Promise.all([a.text(), b.text()]).then(function (t) { return t[0] !== t[1]; }, function () { return false; });
}
function tellPages() {
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cs) {
    cs.forEach(function (c) { c.postMessage({ type: 'update' }); });
  });
}
self.addEventListener('message', function (e) {
  if (APP_MODE || !e.data || e.data.type !== 'status' || !e.source) return;
  e.waitUntil(caches.open(SHELL).then(function (c) { return c.match(MARK); }).then(function (m) {
    if (m) e.source.postMessage({ type: 'update' });
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
