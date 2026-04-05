/**
 * Kanonas SaaS — Service Worker
 * Minimal Implementation for PWA Installability and Web Push Notifications
 */

const CACHE_NAME = 'kanonas-cache-v1';
const OFFLINE_URL = '/';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache core files
      return cache.addAll([
        OFFLINE_URL,
        '/favicon.ico',
        '/icon-192.png',
        '/icon-512.png',
      ]);
    })
  );
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  // Tell the active service worker to take control of the page immediately.
  self.clients.claim();
});

// Network-first strategy for navigation requests.
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  } else {
    // For other requests, try network first, then cache.
    event.respondWith(
      fetch(event.request).catch(() => {
         return caches.match(event.request);
      })
    );
  }
});

// ─── Web Push Notifications ──────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
      },
      requireInteraction: true // Keep notification until user interacts
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Kanonas', options)
    );
  } catch (e) {
    console.error('[SW] Error parsing push data', e);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data.url;

  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // If so, just focus it.
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
