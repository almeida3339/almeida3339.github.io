// A CADA ATUALIZAÇÃO IMPORTANTE, MUDE O NÚMERO DA VERSÃO (v2, v3, v4...)
const CACHE_NAME = 'achados-de-cozinha-v3';
const IMAGE_CACHE_NAME = 'achados-imagens-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/products.json',
  '/perfil.jpg',
  '/politica-de-privacidade.html',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap'
];

// Instala o Service Worker e adiciona os arquivos essenciais ao cache principal
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Limpa caches antigos quando uma nova versão do SW é ativada
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return (cacheName.startsWith('achados-de-cozinha-') && cacheName !== CACHE_NAME) ||
                 (cacheName.startsWith('achados-imagens-') && cacheName !== IMAGE_CACHE_NAME);
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Intercepta as requisições de rede
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégia para imagens: Stale-While-Revalidate
  if (url.pathname.startsWith('/images/')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  
  // Estratégia para outros arquivos: Cache First
  event.respondWith(cacheFirst(request));
});

// Estratégia Cache First: Serve do cache, se falhar, vai para a rede.
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || fetch(request);
}

// Estratégia Stale-While-Revalidate: Serve do cache e atualiza em segundo plano.
async function staleWhileRevalidate(request) {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    const fetchPromise = fetch(request).then(networkResponse => {
        cache.put(request, networkResponse.clone());
        return networkResponse;
    });
    return cachedResponse || fetchPromise;
}