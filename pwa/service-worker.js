/*
 Copyright 2023 Jonas Mueller (SAC Section Pilatus). All Rights Reserved.
 Updated 2024 with improved cache strategies for iOS, Android, and Windows.
 */

const CACHE_VERSION = '0.3.0';
const CACHE_NAME = `sac-pilatus-app-v${CACHE_VERSION}`;
const OFFLINE_PAGE = '/home.html';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/app.js',
  '/service-worker.js',
  '/files/favicon/app-icon-512x512.png',
  '/files/favicon/app-icon-192x192.png',
  '/files/favicon/app-icon-144x144.png',
  '/files/favicon/app-icon-96x96.png',
  '/files/favicon/app-icon-72x72.png',
  '/files/favicon/app-icon-48x48.png',
  '/files/favicon/app-icon-32x32.png',
  '/files/favicon/app-icon-16x16.png',
  '/favicon.ico'
];

/**
 * Service Worker: Install Event
 * Cache static assets on installation
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.warn('[SW] Error caching some assets (may not exist yet):', error.message);
        // Continue even if some assets don't exist
        return Promise.resolve();
      });
    })
  );
  
  // Force new service worker to activate immediately
  self.skipWaiting();
});

/**
 * Service Worker: Activate Event
 * Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients immediately
  self.clients.claim();
});

/**
 * Service Worker: Fetch Event
 * Implement intelligent caching strategy:
 * - Network-first for HTML pages and API calls
 * - Cache-first for images and assets
 * - Stale-while-revalidate for non-critical assets
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests and chrome extensions
  if (!url.origin.includes(self.location.origin)) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Determine cache strategy based on request type
  if (isHTMLPage(event.request)) {
    // Network-first for HTML pages
    event.respondWith(networkFirstStrategy(event.request));
  } else if (isImage(event.request) || isFont(event.request)) {
    // Cache-first for images and fonts
    event.respondWith(cacheFirstStrategy(event.request));
  } else if (isAPI(event.request)) {
    // Network-first for API calls with timeout
    event.respondWith(networkFirstWithTimeoutStrategy(event.request));
  } else {
    // Stale-while-revalidate for other assets
    event.respondWith(staleWhileRevalidateStrategy(event.request));
  }
});

/**
 * Network-first strategy
 * Try network first, fall back to cache, then offline page
 */
function networkFirstStrategy(request) {
  return fetch(request)
    .then((response) => {
      // Check if response is valid
      if (!response || response.status !== 200 || response.type === 'error') {
        return response;
      }
      
      // Clone and cache the response
      const responseClone = response.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, responseClone);
      });
      
      return response;
    })
    .catch((error) => {
      console.log('[SW] Network request failed for:', request.url, error.message);
      // Try to return from cache
      return caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        // Return offline page if both network and cache fail
        return caches.match(OFFLINE_PAGE);
      });
    });
}

/**
 * Cache-first strategy
 * Try cache first, fall back to network
 */
function cacheFirstStrategy(request) {
  return caches.match(request).then((cached) => {
    if (cached) {
      return cached;
    }
    
    return fetch(request)
      .then((response) => {
        // Don't cache invalid responses
        if (!response || response.status !== 200) {
          return response;
        }
        
        // Clone and cache the response
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        
        return response;
      })
      .catch((error) => {
        console.log('[SW] Failed to fetch:', request.url, error.message);
        return caches.match(request);
      });
  });
}

/**
 * Network-first with timeout strategy
 * Try network with timeout, fall back to cache for API calls
 */
function networkFirstWithTimeoutStrategy(request) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    )
  ])
    .then((response) => {
      if (!response || response.status !== 200) {
        return response;
      }
      
      const responseClone = response.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, responseClone);
      });
      
      return response;
    })
    .catch((error) => {
      console.log('[SW] Network timeout or error for:', request.url);
      return caches.match(request);
    });
}

/**
 * Stale-while-revalidate strategy
 * Return cached version immediately while fetching new version in background
 */
function staleWhileRevalidateStrategy(request) {
  return caches.match(request).then((cached) => {
    // Return cached version immediately
    const fetchPromise = fetch(request).then((response) => {
      if (!response || response.status !== 200) {
        return response;
      }
      
      // Update cache in background
      const responseClone = response.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, responseClone);
      });
      
      return response;
    });
    
    // Return cached or fetch in parallel
    return cached || fetchPromise;
  });
}

/**
 * Check if request is for an HTML page
 */
function isHTMLPage(request) {
  return request.headers.get('accept')?.includes('text/html') ||
         request.url.endsWith('.html') ||
         request.url.endsWith('/');
}

/**
 * Check if request is for an image
 */
function isImage(request) {
  return request.headers.get('accept')?.includes('image/') ||
         /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(request.url);
}

/**
 * Check if request is for a font
 */
function isFont(request) {
  return /\.(woff|woff2|ttf|eot|otf)$/i.test(request.url);
}

/**
 * Check if request is for an API call
 */
function isAPI(request) {
  return request.url.includes('/api/') || 
         request.url.includes('/service/');
}

/**
 * Handle messages from clients (e.g., SKIP_WAITING)
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING received, activating immediately');
    self.skipWaiting();
  }
});

/**
 * Periodic background sync (experimental)
 * Used for updating cached content in the background
 */
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'update-content') {
    event.waitUntil(
      updateCachedContent()
    );
  }
});

/**
 * Update cached content in background
 */
function updateCachedContent() {
  return caches.open(CACHE_NAME).then((cache) => {
    // Add URLs you want to periodically update
    const urlsToUpdate = [
      '/home.html',
      '/api/content'
    ];
    
    return Promise.all(
      urlsToUpdate.map((url) => {
        return fetch(url)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(url, response.clone());
            }
          })
          .catch((error) => {
            console.log('[SW] Periodic sync error for:', url, error.message);
          });
      })
    );
  });
}

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.data);
  const nUrl = event.notification.data.url;
  event.notification.close();
  
  // Open the app and navigate to URL after clicking notification
  if (clients.openWindow && nUrl) {
    event.waitUntil(
      clients.matchAll().then((matchedClients) => {
        // Check if window is already open
        for (let client of matchedClients) {
          if (client.url === nUrl) {
            return client.focus();
          }
        }
        // Open new window if not found
        return clients.openWindow(nUrl);
      })
    );
  }
});

