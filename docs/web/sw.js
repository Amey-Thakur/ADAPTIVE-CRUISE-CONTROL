/* ┌──────────────────────────────────────────────────────────────────────────────┐
 * │  File:         sw.js                                                         │
 * │  Author:       Amey Thakur                                                   │
 * │  Profile:      https://github.com/Amey-Thakur                                │
 * │  Repository:   https://github.com/Amey-Thakur/ADAPTIVE-CRUISE-CONTROL        │
 * │                                                                              │
 * │  Description:  Service Worker for the Adaptive Cruise Control (ACC) web      │
 * │                application. Implements a Cache-First strategy to enable      │
 * │                offline functionality and improve load performance by         │
 * │                storing core assets (HTML, CSS, JS, Fonts) locally within     │
 * │                the browser's Cache Storage.                                  │
 * │                                                                              │
 * │  Technology:   Service Worker API, Cache Storage API                         │
 * │  Released:     September 08, 2023                                            │
 * │  License:      MIT                                                           │
 * └──────────────────────────────────────────────────────────────────────────────┘ */

const CACHE_NAME = 'acc-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './simulation.js',
    './manifest.json',
    './icon.svg'
];

/**
 * INSTALL EVENT
 * Triggered when the service worker is first registered.
 * Pre-caches all essential assets for offline access.
 */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('SW: Pre-caching offline assets');
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

/**
 * ACTIVATE EVENT
 * Triggered after installation. Used to clean up legacy caches 
 * from previous versions of the application.
 */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

/**
 * FETCH EVENT
 * Intercepts network requests. Implements a "Cache First, falling back
 * to Network" strategy to ensure the app remains functional offline.
 */
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});
