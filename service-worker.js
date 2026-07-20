const CACHE_NAME = 'afripartition-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Poppins:wght@300;400;500;600;700&display=swap'
];

// Installation : cache les fichiers essentiels
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✅ Cache ouvert');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation : nettoie les vieux caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('️ Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie : Cache First, puis Network (parfait pour hors ligne)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si en cache, on retourne le cache
      if (response) {
        return response;
      }
      // Sinon on va sur le réseau et on met en cache
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        // Page hors ligne de secours
        return caches.match('/index.html');
      });
    })
  );
});