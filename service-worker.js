const CACHE_NAME = "tb2-hesaplayici-v4";
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./tma-harita.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const kabulBasligi = req.headers.get('accept') || '';
  const htmlIstegi = req.mode === 'navigate' || kabulBasligi.includes('text/html');

  if(htmlIstegi){
    // HTML: ÖNCE AĞDAN dene (her zaman en güncel sürüm), çevrimdışıysa önbelleğe düş
    event.respondWith(
      fetch(req).then((res) => {
        const kopya = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, kopya));
        return res;
      }).catch(() => caches.match(req))
    );
  }else{
    // Diğer statik dosyalar: önbellekten hızlı göster, yoksa ağdan çek
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
  }
});
