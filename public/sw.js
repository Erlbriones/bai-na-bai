const CACHE_NAME = 'spotibai-v1';
const STATIC_CACHE_NAME = 'spotibai-static-v1';
const RUNTIME_CACHE = 'spotibai-runtime-v1';

// Static assets to cache immediately (app shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Cache static assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Clean up old caches on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== RUNTIME_CACHE
            );
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// Network-first strategy for HTML, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip Supabase API calls - don't cache private data
  if (url.hostname.includes('supabase')) {
    return;
  }

  // Skip auth/session endpoints
  if (url.pathname.includes('/auth/')) {
    return;
  }

  // Cache static assets (JS, CSS, fonts, images) with cache-first
  if (
    url.pathname.match(/\.(js|css|woff|woff2|ttf|otf|eot|png|jpg|jpeg|gif|webp|svg|ico)$/) ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Network-first for HTML and API calls
  event.respondWith(networkFirst(event.request));
});

// Cache-first strategy for static assets
async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    // Only cache successful responses
    if (networkResponse.ok && !networkResponse.url.includes('supabase')) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached response if network fails
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Network-first strategy for HTML and dynamic content
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful HTML responses
    if (networkResponse.ok && request.headers.get('accept')?.includes('text/html')) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached HTML if network fails
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}
