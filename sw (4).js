/* Service worker – Tìm nhà thuê. Đổi VERSION khi muốn ép máy khách làm mới cache. */
const VERSION = 'v7';
const SHELL = 'shell-' + VERSION;
const RUNTIME = 'runtime-' + VERSION;
const INDEX = './index.html';
const MARK = './__update';   // dấu "đã có bản mới chưa được mở" (trang mở lên sẽ hỏi lại, không lỡ thông báo)
const SHELL_FILES = [
  './',
  INDEX,
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const RUNTIME_MAX = 40;   // số file tối đa giữ trong cache runtime (font, file tĩnh)

self.addEventListener('install', function (e) {
  // Từng file một: thiếu một file (vd icon chưa upload) không làm hỏng cả lần cài đặt.
  // cache:'reload' bỏ qua cache HTTP để chắc chắn lấy bản mới nhất.
  e.waitUntil(caches.open(SHELL).then(function (c) {
    return Promise.all(SHELL_FILES.map(function (f) {
      return c.add(new Request(f, { cache: 'reload' })).catch(function () {});
    }));
  }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== SHELL && k !== RUNTIME; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  // Không bao giờ đụng tới API Apps Script và ảnh Drive: luôn lấy dữ liệu mới
  if (url.hostname === 'script.google.com' || url.hostname === 'drive.google.com' ||
      url.hostname.endsWith('googleusercontent.com')) return;

  if (req.mode === 'navigate') { e.respondWith(openPage(e)); return; }
  if (url.origin === location.origin || FONT_HOSTS.indexOf(url.hostname) > -1) e.respondWith(asset(e, req));
});

/* Trang chính: mở ngay từ bản đã lưu, tải bản mới ngầm. Nếu bản mới khác bản đang hiện thì báo cho trang
   (trang hiện nút "Có bản mới, chạm để tải lại"). */
function openPage(e) {
  var net = fetch(e.request).then(function (res) {
    if (!res || !res.ok) return res;
    return caches.open(SHELL).then(function (c) {
      return c.match(INDEX).then(function (old) {
        return Promise.all([c.put(INDEX, res.clone()), c.put('./', res.clone())]).then(function () {
          return old ? differs(old, res.clone()) : false;
        }).then(function (changed) {
          return (changed ? c.put(MARK, new Response('1')) : c.delete(MARK)).then(function () { return changed; });
        });
      });
    }).then(function (changed) { if (changed) tellPages(); return res; }, function () { return res; });
  }).catch(function () { return null; });
  e.waitUntil(net);                    // gọi ngay trong sự kiện fetch (không gọi muộn trong then)
  return caches.match(INDEX).then(function (hit) {
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
/* Trang hỏi "có bản mới chưa?" ngay sau khi mở */
self.addEventListener('message', function (e) {
  if (!e.data || e.data.type !== 'status' || !e.source) return;
  e.waitUntil(caches.open(SHELL).then(function (c) { return c.match(MARK); }).then(function (m) {
    if (m) e.source.postMessage({ type: 'update' });
  }));
});

/* Font Google và file tĩnh cùng nguồn: dùng cache trước, cập nhật ngầm. Bản trong RUNTIME luôn ưu tiên hơn bản cài sẵn. */
function asset(e, req) {
  var net = fetch(req).then(function (res) {
    if (res && (res.ok || res.type === 'opaque')) {
      var copy = res.clone();
      caches.open(RUNTIME).then(function (c) { return c.put(req, copy).then(function () { return trim(c); }); });
    }
    return res;
  }).catch(function () { return null; });
  e.waitUntil(net);
  return caches.open(RUNTIME).then(function (c) { return c.match(req); }).then(function (hit) {
    return hit || caches.match(req);
  }).then(function (hit) {
    return hit || net.then(function (r) { return r || Response.error(); });
  });
}
function trim(c) {
  return c.keys().then(function (ks) {
    return Promise.all(ks.slice(0, Math.max(0, ks.length - RUNTIME_MAX)).map(function (k) { return c.delete(k); }));
  });
}
