// AnalyzeMyTeam - The Algorithm of Defense
// Service Worker for PWA Functionality and Offline Intelligence
// Version: 2.0.0

const CACHE_NAME = 'analyzemeateam-v2-0-0';
const STATIC_CACHE = 'amt-static-v2';
const DYNAMIC_CACHE = 'amt-dynamic-v2';
const BLOG_CACHE = 'amt-blog-v2';
const IMAGES_CACHE = 'amt-images-v2';

// ============================================================================
// CACHE STRATEGIES AND RESOURCES
// ============================================================================

// Essential files for offline Triangle Defense functionality
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/blog.html',
  '/css/style.css',
  '/css/blog.css',
  '/js/script.js',
  '/js/blog.js',
  '/manifest.json'
];

// Triangle Defense methodology and critical content
const TRIANGLE_DEFENSE_ASSETS = [
  '/triangle-defense/',
  '/cls-analysis/',
  '/formations/',
  '/mo-targeting/',
  '/about/denauld-brown/',
  '/resources/coaching-guides/'
];

// Publication assets for offline reading
const PUBLICATION_ASSETS = [
  '/mo-report/',
  '/nfl-edge/',
  '/newsletter/archive/'
];

// External resources (fonts, icons, CDN)
const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Critical images and assets
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'];
const DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx'];

// ============================================================================
// SERVICE WORKER INSTALLATION
// ============================================================================

self.addEventListener('install', function(event) {
  console.log('[SW] Installing AnalyzeMyTeam Service Worker v2.0.0');
  
  event.waitUntil(
    Promise.all([
      // Cache core assets
      caches.open(STATIC_CACHE).then(function(cache) {
        console.log('[SW] Caching core assets');
        return cache.addAll(CORE_ASSETS);
      }),
      
      // Cache Triangle Defense methodology
      caches.open(STATIC_CACHE).then(function(cache) {
        console.log('[SW] Caching Triangle Defense assets');
        return cache.addAll(TRIANGLE_DEFENSE_ASSETS.map(url => {
          return new Request(url, { mode: 'no-cors' });
        })).catch(err => {
          console.log('[SW] Some Triangle Defense assets not available:', err);
        });
      }),
      
      // Cache external resources
      caches.open(STATIC_CACHE).then(function(cache) {
        console.log('[SW] Caching external resources');
        return cache.addAll(EXTERNAL_ASSETS.map(url => {
          return new Request(url, { mode: 'no-cors' });
        })).catch(err => {
          console.log('[SW] Some external resources not available:', err);
        });
      })
    ]).then(() => {
      console.log('[SW] Installation complete - Triangle Defense ready for offline use');
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// ============================================================================
// SERVICE WORKER ACTIVATION
// ============================================================================

self.addEventListener('activate', function(event) {
  console.log('[SW] Activating AnalyzeMyTeam Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== BLOG_CACHE && 
                cacheName !== IMAGES_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] AnalyzeMyTeam Service Worker activated and ready');
      
      // Notify all clients of activation
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            message: 'Triangle Defense offline intelligence ready'
          });
        });
      });
    })
  );
});

// ============================================================================
// FETCH HANDLING AND CACHING STRATEGIES
// ============================================================================

self.addEventListener('fetch', function(event) {
  const requestURL = new URL(event.request.url);
  
  // Handle different types of requests with appropriate strategies
  if (event.request.method === 'GET') {
    
    // Core application files - Cache First
    if (CORE_ASSETS.includes(requestURL.pathname) || 
        TRIANGLE_DEFENSE_ASSETS.includes(requestURL.pathname)) {
      event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    }
    
    // Blog content - Network First with fallback
    else if (requestURL.pathname.startsWith('/blog/') || 
             requestURL.pathname.includes('beehive')) {
      event.respondWith(networkFirstWithFallback(event.request, BLOG_CACHE));
    }
    
    // Images and media - Cache First with network fallback
    else if (IMAGE_EXTENSIONS.some(ext => requestURL.pathname.endsWith(ext))) {
      event.respondWith(cacheFirst(event.request, IMAGES_CACHE));
    }
    
    // External resources (fonts, CDN) - Cache First
    else if (requestURL.origin !== location.origin) {
      event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    }
    
    // API calls and dynamic content - Network First
    else if (requestURL.pathname.startsWith('/api/') || 
             requestURL.search.includes('dynamic')) {
      event.respondWith(networkFirst(event.request, DYNAMIC_CACHE));
    }
    
    // All other requests - Stale While Revalidate
    else {
      event.respondWith(staleWhileRevalidate(event.request, DYNAMIC_CACHE));
    }
  }
  
  // Handle POST requests (forms, analytics)
  else if (event.request.method === 'POST') {
    event.respondWith(handlePostRequest(event.request));
  }
});

// ============================================================================
// CACHING STRATEGIES
// ============================================================================

// Cache First - For static assets
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Update cache in background if needed
      updateCacheInBackground(request, cache);
      return cachedResponse;
    }
    
    // Fetch from network if not in cache
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('[SW] Cache First failed:', error);
    return getOfflineFallback(request);
  }
}

// Network First - For dynamic content
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('[SW] Network First fallback to cache:', error);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    return cachedResponse || getOfflineFallback(request);
  }
}

// Network First with Offline Fallback - For blog content
async function networkFirstWithFallback(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
    
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline blog page
    return getOfflineBlogFallback();
  }
}

// Stale While Revalidate - For general content
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Update cache in background
  const networkResponsePromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  
  // Return cached version immediately, or wait for network
  return cachedResponse || networkResponsePromise || getOfflineFallback(request);
}

// ============================================================================
// BACKGROUND SYNC AND UPDATES
// ============================================================================

// Update cache in background for fresh content
async function updateCacheInBackground(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    // Silent fail for background updates
  }
}

// Handle POST requests (forms, analytics)
async function handlePostRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // Store for background sync when online
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      await storeForBackgroundSync(request);
      return new Response('Request queued for sync', { status: 202 });
    }
    
    return new Response('Offline - Request failed', { status: 503 });
  }
}

// Store requests for background sync
async function storeForBackgroundSync(request) {
  const data = {
    url: request.url,
    method: request.method,
    headers: [...request.headers.entries()],
    body: await request.text(),
    timestamp: Date.now()
  };
  
  // Store in IndexedDB for sync when online
  // Implementation would depend on IndexedDB setup
  console.log('[SW] Storing request for background sync:', data);
}

// ============================================================================
// OFFLINE FALLBACKS
// ============================================================================

// General offline fallback
function getOfflineFallback(request) {
  const requestURL = new URL(request.url);
  
  // HTML pages
  if (request.headers.get('accept').includes('text/html')) {
    return caches.match('/offline.html').then(response => {
      return response || createOfflineResponse();
    });
  }
  
  // Images
  if (IMAGE_EXTENSIONS.some(ext => requestURL.pathname.endsWith(ext))) {
    return caches.match('/assets/offline-image.svg');
  }
  
  // Default offline response
  return createOfflineResponse();
}

// Offline blog fallback
async function getOfflineBlogFallback() {
  const offlineContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Offline - The Beehive Blog</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
      <div class="offline-container">
        <h1>🦅 Triangle Defense Intelligence Offline</h1>
        <p>You're currently offline, but your defensive intelligence is still available.</p>
        <h2>Available Offline:</h2>
        <ul>
          <li>Triangle Defense methodology</li>
          <li>5-3-1 system overview</li>
          <li>CLS analysis framework</li>
          <li>Formation classification</li>
          <li>Cached blog posts</li>
        </ul>
        <p>Connect to the internet to access the latest defensive analysis.</p>
        <a href="/" class="btn-primary">Return to Homepage</a>
      </div>
    </body>
    </html>
  `;
  
  return new Response(offlineContent, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Create basic offline response
function createOfflineResponse() {
  return new Response('Offline - AnalyzeMyTeam Triangle Defense', {
    status: 503,
    headers: { 'Content-Type': 'text/plain' }
  });
}

// ============================================================================
// BACKGROUND SYNC
// ============================================================================

self.addEventListener('sync', function(event) {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'triangle-defense-sync') {
    event.waitUntil(syncTriangleDefenseData());
  } else if (event.tag === 'blog-content-sync') {
    event.waitUntil(syncBlogContent());
  } else if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalyticsData());
  }
});

// Sync Triangle Defense data
async function syncTriangleDefenseData() {
  try {
    console.log('[SW] Syncing Triangle Defense data');
    
    // Fetch latest methodology updates
    const methodologyResponse = await fetch('/api/methodology/latest');
    if (methodologyResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put('/triangle-defense/', methodologyResponse.clone());
    }
    
    // Fetch formation updates
    const formationsResponse = await fetch('/api/formations/latest');
    if (formationsResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put('/formations/', formationsResponse.clone());
    }
    
    console.log('[SW] Triangle Defense sync complete');
    
  } catch (error) {
    console.log('[SW] Triangle Defense sync failed:', error);
    throw error;
  }
}

// Sync blog content
async function syncBlogContent() {
  try {
    console.log('[SW] Syncing blog content');
    
    const blogResponse = await fetch('/api/blog/latest');
    if (blogResponse.ok) {
      const cache = await caches.open(BLOG_CACHE);
      cache.put('/blog/', blogResponse.clone());
    }
    
  } catch (error) {
    console.log('[SW] Blog sync failed:', error);
    throw error;
  }
}

// Sync analytics data
async function syncAnalyticsData() {
  try {
    console.log('[SW] Syncing analytics data');
    
    // Process queued analytics events
    // Implementation would handle stored analytics data
    
  } catch (error) {
    console.log('[SW] Analytics sync failed:', error);
  }
}

// ============================================================================
// PUSH NOTIFICATIONS
// ============================================================================

self.addEventListener('push', function(event) {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'New Triangle Defense analysis available',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    tag: 'triangle-defense-update',
    requireInteraction: false,
    actions: [
      {
        action: 'read',
        title: 'Read Analysis',
        icon: '/assets/icons/action-read.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/assets/icons/action-dismiss.png'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title || 'AnalyzeMyTeam Update';
    options.data = data;
  }
  
  event.waitUntil(
    self.registration.showNotification('AnalyzeMyTeam', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'read') {
    event.waitUntil(
      clients.openWindow('/blog.html')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

self.addEventListener('message', function(event) {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'CACHE_TRIANGLE_DEFENSE') {
    event.waitUntil(cacheTriangleDefenseContent());
  } else if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  } else if (event.data.type === 'GET_CACHE_STATUS') {
    event.waitUntil(sendCacheStatus(event.source));
  }
});

// Cache Triangle Defense content on demand
async function cacheTriangleDefenseContent() {
  try {
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(TRIANGLE_DEFENSE_ASSETS);
    console.log('[SW] Triangle Defense content cached successfully');
  } catch (error) {
    console.log('[SW] Failed to cache Triangle Defense content:', error);
  }
}

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('[SW] All caches cleared');
}

// Send cache status to client
async function sendCacheStatus(client) {
  const cacheNames = await caches.keys();
  const status = {
    caches: cacheNames,
    version: CACHE_NAME,
    triangleDefense: await checkTriangleDefenseCache()
  };
  
  client.postMessage({
    type: 'CACHE_STATUS',
    status: status
  });
}

// Check Triangle Defense cache status
async function checkTriangleDefenseCache() {
  const cache = await caches.open(STATIC_CACHE);
  const cachedAssets = await Promise.all(
    TRIANGLE_DEFENSE_ASSETS.map(asset => cache.match(asset))
  );
  
  return {
    total: TRIANGLE_DEFENSE_ASSETS.length,
    cached: cachedAssets.filter(Boolean).length,
    complete: cachedAssets.every(Boolean)
  };
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

self.addEventListener('error', function(event) {
  console.error('[SW] Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', function(event) {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

// Monitor cache performance
let cacheHits = 0;
let cacheMisses = 0;

function trackCachePerformance(hit) {
  if (hit) {
    cacheHits++;
  } else {
    cacheMisses++;
  }
  
  // Report performance periodically
  if ((cacheHits + cacheMisses) % 100 === 0) {
    const hitRate = (cacheHits / (cacheHits + cacheMisses) * 100).toFixed(2);
    console.log(`[SW] Cache hit rate: ${hitRate}% (${cacheHits}/${cacheHits + cacheMisses})`);
  }
}

console.log('[SW] AnalyzeMyTeam Service Worker v2.0.0 loaded - Triangle Defense ready for offline intelligence');
