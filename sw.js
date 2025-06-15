const CACHE_NAME = 'achados-de-cozinha-v1';
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

// Evento de fetch: intercepta as requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    // Tenta encontrar o recurso no cache primeiro
    caches.match(event.request)
      .then(response => {
        // Se encontrar no cache, retorna ele.
        // Se não, busca na rede (e opcionalmente poderia salvar no cache).
        return response || fetch(event.request);
      })
  );
});