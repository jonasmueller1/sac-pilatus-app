/*
 Copyright 2022 Jonas Müller. All Rights Reserved.
 */

const cacheName = 'app-version-0.1.0'; // A change forces an update of its cached files

// Local URIs we always want to be cached (links must be always valid)
const contentToCache = [
  // Basic app content:
  '/app.js',
  '/manifest.json',
  '/files/app/home.html',
  // '/files/app/app.html',
  // App images:
  '/favicon.ico',
  '/files/favicon/favicon-196x196.png',
  '/files/favicon/favicon-96x96.png',
  '/files/favicon/favicon-32x32.png',
  '/files/favicon/favicon-16x16.png',
  '/files/favicon/favicon-128.png',
  '/files/theme-sac-pilatus/images/logos/logo-header.svg',
  '/bundles/markocupicswissalpineclubcontaologinclient/img/logo_sac_small.svg',
  // Big images (with hash in file name) to optimize bandwidth:
  '/assets/images/6/Urbachtal-ea756110.jpg',
  '/assets/images/f/Galtigengrat-528b6ec6.jpg',
  '/assets/images/6/005-81a10e4c.jpg',
  // No explicit caching of pages to enforce up-to-date content:
  // '/home.html',  
  // './',
];

// Installing Service Worker
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    console.log('[Service Worker] Caching all: app content');
    try {
      await cache.addAll(contentToCache);
    } catch(e) {
      console.error('[Service Worker] Error: App content failed to cache!');
    }
  })());
});

// Fetching content using Service Worker
self.addEventListener('fetch', function(event) {
  // Skip cross-origin requests
  //if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
      .then(function(response) {
          console.log(`[Service Worker] Fetching resource: ${event.request.url}`);
          // Check if current http request matches cached data
          if (response) {
            // Return only cached content if it is defined
            if (contentToCache.includes(event.request.url)) {
              return response;
            }
          }

          console.log(`[Service Worker] Caching new resource: ${event.request.url}`);
          var requestToCache = event.request.clone();

          // Try to make original http request
          return fetch(requestToCache).then(
            function(response) {
              // Return server error immediately
              if (!response || response.status !== 200) {
                return response;
              }

              console.log(`[Service Worker] Adding new resource: ${event.request.url}`);
              var responseToCache = response.clone();
              caches.open(cacheName)
                .then(function(cache) {
                  // Add response to cache
                  cache.put(requestToCache, responseToCache);
                });

              return response;
            }
          );
        }).catch(function(err) {
          console.error(`[Service Worker] Error: Fetch failed for resource: ${event.request.url}`);
          // If the network is unavailable to make a request, open cached page
          offlinePage = caches.match(event.request.url)
          console.log(`[Service Worker] Fetching cached resource: ${event.request.url}`);
          return offlinePage
          // return caches.match('/home.html');
        })
      );
  //}
});

// Clearing cache
self.addEventListener('activate', (e) => {
  console.log('[Service Worker] Activate');
  e.waitUntil(caches.keys().then((keyList) => {
    return Promise.all(keyList.map((key) => {
      if (key === cacheName) { return; }
      return caches.delete(key);
    }))
  }));
});

// Listen the periodic background sync events to update the cached resources.
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-cached-content') {
    // event.waitUntil(updateCachedContent());
  }
});

// Skip waiting for updating it
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message: ', event.data);
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notification data
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click: ', event.notification.data);
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
