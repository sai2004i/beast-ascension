/* =========================================================
   BEAST ASCENSION — ADVANCED PWA SERVICE WORKER
   Dev-Safe Live Reload Engine + Zero-Fail Caching
========================================================= */

const CACHE_VERSION = "beast-v7-enterprise";
const PRECACHE_ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./assets/akaza.png",
    "./assets/baki.png",
    "./assets/toji.png",
    "./assets/hybrid.png",
    "./assets/day5.png",
    "./assets/icon-192.png",
    "./assets/icon-512.jpg"
];

// Pre-cache assets safely
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => {
            return Promise.allSettled(
                PRECACHE_ASSETS.map((asset) =>
                    fetch(asset).then((response) => {
                        if (!response.ok) throw new Error(`HTTP ${response.status} for ${asset}`);
                        return cache.put(asset, response);
                    }).catch((err) => {
                        console.warn(`[SW] Pre-cache skipped for asset: ${asset}`, err);
                    })
                )
            );
        }).then(() => self.skipWaiting())
    );
});

// Purge outdated caches immediately
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_VERSION) {
                        console.log(`[SW] Evicting legacy cache: ${key}`);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Stale-While-Revalidate with Live Dev Bypass for localhost
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // Bypass cache on localhost/127.0.0.1 for live editing
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        event.respondWith(fetch(event.request));
        return;
    }

    if (event.request.method !== "GET") return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_VERSION).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                if (event.request.mode === "navigate") {
                    return caches.match("./index.html");
                }
            });

            return cachedResponse || fetchPromise;
        })
    );
});