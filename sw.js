// A CADA ATUALIZAÇÃO IMPORTANTE, MUDE O NÚMERO DA VERSÃO (v2, v3, v4...)
const CACHE_NAME = 'achados-de-cozinha-v2';
// Lista de arquivos essenciais para o funcionamento do app offline
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/products.json',
  '/perfil.jpg',
  '/politica-de-privacidade.html'
];

// Evento de instalação: abre o cache e salva os arquivos essenciais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// ======================================================
// === NOVO BLOCO PARA LIMPAR CACHES ANTIGOS ===
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          // Deleta todos os caches que começam com 'achados-de-cozinha-' mas não são o cache atual
          return cacheName.startsWith('achados-de-cozinha-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});
// ======================================================


// Evento de fetch: intercepta as requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    // Tenta encontrar o recurso no cache primeiro
    caches.match(event.request)
      .then(response => {
        // Se encontrar no cache, retorna ele. Se não, busca na rede.
        return response || fetch(event.request);
      })
  );
});