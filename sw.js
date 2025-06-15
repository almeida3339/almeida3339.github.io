// sw.js – v5 (2025-06-15)
const CACHE_NAME = "achados-de-cozinha-v5";
const IMAGE_CACHE_NAME = "achados-imagens-v2";

const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/offline.html",
  "/perfil.jpg",
  "/politica-de-privacidade.html"
];

// Cache First + fallback offline (para páginas essenciais)
async function cacheFirstWithNetworkFallback(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const network = await fetch(request);
    return network;
  } catch (err) {
    return await cache.match("/offline.html");
  }
}

// Stale-While-Revalidate (para dados e scripts)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(networkResponse => {
    cache.put(request, networkResponse.clone());
    return networkResponse;
  });
  return cached || fetchPromise;
}

// Específico para imagens
async function imageCache(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(networkResponse => {
    cache.put(request, networkResponse.clone());
    return networkResponse;
  });
  return cached || fetchPromise;
}

// Instalação
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

// Ativação: limpar caches antigos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => (key.startsWith("achados-de-cozinha-") && key !== CACHE_NAME) || (key.startsWith("achados-imagens-") && key !== IMAGE_CACHE_NAME))
          .map(key => caches.delete(key))
      )
    )
  );
});

// Fetch handler
self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.pathname.startsWith("/images/")) {
    event.respondWith(imageCache(request));
  } else if (url.pathname.endsWith("products.json") || url.pathname.endsWith("script.js")) {
    event.respondWith(staleWhileRevalidate(request));
  } else {
    event.respondWith(cacheFirstWithNetworkFallback(request));
  }
});
