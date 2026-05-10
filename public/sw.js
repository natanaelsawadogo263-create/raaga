/**
 * Service worker minimal mais conforme aux critères d'installation de Chrome.
 *
 * Critères validés ici :
 *  - un évènement `install` déclenche un précaching de `start_url`
 *  - un évènement `fetch` répond effectivement aux requêtes (sinon Chrome
 *    considère le site comme non-PWA)
 *  - prise de contrôle immédiate (skipWaiting + clients.claim) pour éviter
 *    les états bloqués entre versions.
 */
const VERSION = "raaga-v3";
const PRECACHE = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION);
      try {
        await cache.addAll(PRECACHE);
      } catch (_) {
        /* Si une URL n'est pas atteignable on ignore — l'install ne doit pas échouer. */
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  /** Stratégie network-first avec fallback cache (utile pour le start_url offline). */
  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok && (req.mode === "navigate" || PRECACHE.includes(url.pathname))) {
          const cache = await caches.open(VERSION);
          cache.put(req, fresh.clone()).catch(() => undefined);
        }
        return fresh;
      } catch (_) {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.mode === "navigate") {
          const home = await caches.match("/");
          if (home) return home;
        }
        return Response.error();
      }
    })(),
  );
});
