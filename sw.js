// sw.js

// Nama cache
const CACHE_NAME = 'aneska-noodle-cache-v1';

// Daftar file yang akan di-cache saat service worker di-install
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/detail.html',
  '/css/style.css',
  '/css/bootstrap.min.css',        
  '/fonts/Poppins-Light.ttf',
  '/fonts/Poppins-Regular.ttf',
  '/fonts/Poppins-SemiBold.ttf',
  '/img/background-footer.png',
  '/img/bg-pattern.png',
  '/img/mie1.jpg',
  '/img/mie2.jpg',
  '/img/mie3.jpg',
  '/img/mie4.jpg',
  '/img/mie5.jpg',
  '/img/mie6.jpg',
  '/img/mie7.jpg',
  '/img/mie8.jpg',
];

// ====================================
// Event Install: cache file-file penting
// ====================================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Cache semua file yang diperlukan aplikasi
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Langsung aktifkan SW setelah install
  );
});

// ====================================
// Event Activate: hapus cache lama jika ada
// ====================================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys.map(key => {
            if (key !== CACHE_NAME) {
              // Hapus cache yang bukan CACHE_NAME sekarang
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim()) // Mengambil kontrol klien langsung
  );
});

// ====================================
// Event Fetch: ambil dari cache dulu, kalau tidak ada baru fetch network
// ====================================
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Jika ada di cache, pakai itu
        if (cachedResponse) {
          return cachedResponse;
        }
        // Kalau tidak ada, ambil dari jaringan (network)
        return fetch(event.request)
          .then(networkResponse => {
            // Cache respons baru (optional, tapi bisa bikin cache dinamis)
            return caches.open(CACHE_NAME)
              .then(cache => {
                // Simpan response clone supaya bisa dipakai nanti
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
          })
          .catch(() => {
            // Bisa kasih fallback kalau fetch gagal dan tidak ada cache
            // Misal tampilkan halaman offline sederhana jika ada
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});
