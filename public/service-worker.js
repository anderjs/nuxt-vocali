// Placeholder service worker file
// This is intentional while service worker is not implemented yet.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});
