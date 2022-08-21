// Files to cache
const cacheName = 'pilatus-pwa-v0.0.1';
const appShellFiles = [
  '/files/app/app.js',
  '/files/app/manifest.json',
  '/files/app/home.html',
  '/files/app/app.html',
  '/files/app/service/nachrichten.html',
  '/favicon.ico',
  '/files/favicon/favicon-196x196.png',
  '/files/favicon/favicon-96x96.png',
  '/files/favicon/favicon-32x32.png',
  '/files/favicon/favicon-16x16.png',
  '/files/favicon/favicon-128.png',
  // TODO: Add more pages or files
];
const contentToCache = appShellFiles;

// Installing Service Worker
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    console.log('[Service Worker] Caching all: app shell and content');
    await cache.addAll(contentToCache);
  })());
});

// Fetching content using Service Worker
self.addEventListener('fetch', (e) => {
  e.respondWith((async () => {
    const r = await caches.match(e.request);
    console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
    if (r) return r;
    const response = await fetch(e.request);
    const cache = await caches.open(cacheName);
    console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
    cache.put(e.request, response.clone());
    return response;
  })());
});

// Clearing cache
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keyList) => {
    return Promise.all(keyList.map((key) => {
      if (key === cacheName) { return; }
      return caches.delete(key);
    }))
  }));
});

self.addEventListener('notificationclick', function(event) {
  console.log('On notification click: ', event.notification.data);
  const nUrl = event.notification.data.url;
  event.notification.close();
  // Open the app and navigate to url after clicking the notification
  if (clients.openWindow && nUrl) {
    // Enumerate windows, and call window.focus(), or open a new one.
    event.waitUntil(
      clients.matchAll().then(matchedClients => {
        for (let client of matchedClients) {
          if (client.url === nUrl) {
            return client.focus();
          }
        }
        return clients.openWindow(nUrl);
      })
    );
  }
});