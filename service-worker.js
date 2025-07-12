const CACHE_NAME = 'axon-medical-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/axon.png', // Certifique-se de que esta imagem existe
  '/appicon.jpg', // O ícone do seu app
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  // Adicione aqui outros assets estáticos que seu app usa e que devem ser cacheados
  // Ex: 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js',
  // 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'
  // No entanto, para scripts do Firebase, é geralmente melhor deixá-los serem buscados da CDN
  // a menos que você tenha um motivo específico para cacheá-los localmente.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // If not in cache, fetch from network
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and can only be consumed once. We must clone it so that
            // we can consume the stream twice: one for the cache and one for the browser.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
