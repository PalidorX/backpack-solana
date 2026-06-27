// Affix Brawlers service worker — offline cache for the PWA shell.
// Bump CACHE when assets change to force an update.
const CACHE = "affix-brawlers-v6";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for navigations (so updates show), cache-first for the rest.
self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request).then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put("./index.html", copy));
        return r;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }
  e.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((r) => {
      const copy = r.clone();
      caches.open(CACHE).then((c) => c.put(request, copy));
      return r;
    }).catch(() => cached))
  );
});
