/* 
  Defensive service worker placeholder.
  If an old worker exists, this one clears caches and unregisters itself.
*/

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(Promise.resolve())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys()
        await Promise.all(keys.map((key) => caches.delete(key)))
      } catch {
        // no-op
      } finally {
        await self.clients.claim()
        await self.registration.unregister()
      }
    })()
  )
})

self.addEventListener('fetch', () => {
  // Intentionally empty: no interception.
})
