const CACHE = 'japan-planner-v12';
const ASSETS = [
  '/japan-travel-planner/',
  '/japan-travel-planner/index.html',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 네트워크 우선 (HTML/JS) + 캐시 fallback (오프라인 대응)
// 정적 외부 리소스(api 등)는 통과
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  // 동일 출처(앱 자체 파일)만 캐시 관리, 외부 API는 그대로 통과
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        // 네트워크 성공 시 캐시 갱신
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then(cached => cached || caches.match('/japan-travel-planner/')))
  );
});
