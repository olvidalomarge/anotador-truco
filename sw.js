const CACHE = "truco-v11";
const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "./fondos/fondo1.jpg",
  "./fondos/fondo2.jpg",
  "./fondos/fondo3.jpg",
  "./sonidos/punto.m4a",
  "./sonidos/punto.mp3",
  "./sonidos/victoria.m4a",
  "./sonidos/victoria.mp3"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((claves) =>
      Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia: red primero, cache como respaldo (así las actualizaciones llegan rápido).
// Al abrir la página (navegación) se saltea también el caché HTTP del navegador,
// para que la versión nueva llegue apenas se publica y no 10 minutos después.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const pedido = e.request.mode === "navigate"
    ? fetch(e.request.url, { cache: "no-cache" })
    : fetch(e.request);
  e.respondWith(
    pedido
      .then((resp) => {
        const copia = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copia));
        return resp;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});
