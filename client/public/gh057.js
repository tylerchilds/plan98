const cacheName = 'gh057-cache';
async function information() {
  try {
    return await fetch(`/plan98/about`)
      .then(res => res.json())
      .then((data) => {
        console.info('Factory Reset: Success')
				return data
      })
  } catch (e) {
    console.info('Factory Reset: Failed')
    console.error(e)
    return
  }
}

self.addEventListener('install', async (event) => {
	const filesToCache = information().files
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(cacheName).then((cache) => {
      return cache.match(event.request).then((response) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Update the cache with the latest response
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });

        // Return the cached version first, then update from the network in the background
        return response || fetchPromise;
      });
    })
  );
});
