/*
  SudoBotz Service Worker
  Elite PWA implementation with advanced caching strategies
*/

const CACHE_NAME = "sudobotz-v2.1.0";
const RUNTIME_CACHE = "sudobotz-runtime-v2.1.0";

// Core files to cache immediately
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/assets/css/main.css",
  "/assets/js/main.js",
  "/assets/js/jquery.min.js",
  "/assets/js/browser.min.js",
  "/assets/js/breakpoints.min.js",
  "/assets/js/util.js",
  "/images/SB_Icon_Small.png",
  "/images/logo.png",
  "/images/bg.jpg",
  "/images/banner.png",
  "/manifest.json",
];

// External resources to cache with runtime strategy
const EXTERNAL_RESOURCES = [
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
  "https://fonts.gstatic.com",
  "https://cdn.jsdelivr.net/gh/devicons/devicon",
];

// Install event - cache core assets
self.addEventListener("install", (event) => {
  console.log("SudoBotz SW: Installing...");

  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log("SudoBotz SW: Caching core assets");
        return cache.addAll(CORE_ASSETS);
      }),
      caches.open(RUNTIME_CACHE).then((cache) => {
        console.log("SudoBotz SW: Runtime cache initialized");
        return Promise.resolve();
      }),
    ]).then(() => {
      console.log("SudoBotz SW: Installation complete");
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("SudoBotz SW: Activating...");

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log("SudoBotz SW: Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages
      self.clients.claim(),
    ]).then(() => {
      console.log("SudoBotz SW: Activation complete");
    })
  );
});

// Fetch event - handle requests with sophisticated caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests
  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle static assets
  if (url.origin === location.origin) {
    event.respondWith(handleSameOriginRequest(request));
    return;
  }

  // Handle external resources
  if (isExternalResource(url)) {
    event.respondWith(handleExternalResource(request));
    return;
  }

  // Handle API calls and other requests
  event.respondWith(handleOtherRequests(request));
});

// Navigation request handler - always try network first for HTML
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log("SudoBotz SW: Network failed for navigation, serving cache");

    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Ultimate fallback - serve offline page or main page
    const fallbackResponse = await caches.match("/index.html");
    return fallbackResponse || createOfflineResponse();
  }
}

// Same-origin request handler - cache first for assets
async function handleSameOriginRequest(request) {
  try {
    // Check cache first for static assets
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Serve from cache and update in background
      updateCacheInBackground(request);
      return cachedResponse;
    }

    // Not in cache, fetch from network
    const response = await fetch(request);

    if (response.ok) {
      // Cache successful responses
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log("SudoBotz SW: Failed to fetch asset:", request.url);

    // Return cached version if available
    const cachedResponse = await caches.match(request);
    return cachedResponse || createErrorResponse();
  }
}

// External resource handler - runtime caching with expiration
async function handleExternalResource(request) {
  try {
    // Check runtime cache first
    const cachedResponse = await caches.match(request, {
      cacheName: RUNTIME_CACHE,
    });

    if (cachedResponse) {
      // Check if cache is still fresh (24 hours)
      const cacheDate = new Date(
        cachedResponse.headers.get("sw-cache-date") || 0
      );
      const now = new Date();
      const isExpired =
        now.getTime() - cacheDate.getTime() > 24 * 60 * 60 * 1000;

      if (!isExpired) {
        return cachedResponse;
      }
    }

    // Fetch from network
    const response = await fetch(request);

    if (response.ok) {
      // Clone and add cache date header
      const responseClone = response.clone();
      const modifiedResponse = new Response(await responseClone.blob(), {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          "sw-cache-date": new Date().toISOString(),
        },
      });

      // Cache the response
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, modifiedResponse.clone());

      return response;
    }

    return response;
  } catch (error) {
    console.log("SudoBotz SW: External resource failed:", request.url);

    // Return cached version if available
    const cachedResponse = await caches.match(request, {
      cacheName: RUNTIME_CACHE,
    });
    return cachedResponse || createErrorResponse();
  }
}

// Other requests handler - network first with runtime caching
async function handleOtherRequests(request) {
  try {
    const response = await fetch(request);

    // Cache successful GET requests
    if (response.ok && request.method === "GET") {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Fallback to cache for GET requests
    if (request.method === "GET") {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    return createErrorResponse();
  }
}

// Background cache update
async function updateCacheInBackground(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response);
    }
  } catch (error) {
    console.log("SudoBotz SW: Background update failed for:", request.url);
  }
}

// Helper functions
function isExternalResource(url) {
  return (
    EXTERNAL_RESOURCES.some((resource) => url.href.startsWith(resource)) ||
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com" ||
    url.hostname === "cdn.jsdelivr.net"
  );
}

function createOfflineResponse() {
  return new Response(
    `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>SudoBotz - Offline</title>
      <style>
        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #0f0f0f, #1a1a1a);
          color: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          text-align: center;
        }
        .offline-container {
          max-width: 400px;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }
        .offline-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          color: #FF6B35;
        }
        .offline-title {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #FF6B35;
        }
        .offline-message {
          color: #b3b3b3;
          line-height: 1.6;
        }
        .retry-button {
          background: linear-gradient(135deg, #FF6B35, #00A8E8);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          margin-top: 1rem;
          transition: transform 0.2s ease;
        }
        .retry-button:hover {
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">🤖</div>
        <h1 class="offline-title">You're Offline</h1>
        <p class="offline-message">
          It looks like you're not connected to the internet. 
          Check your connection and try again.
        </p>
        <button class="retry-button" onclick="window.location.reload()">
          Try Again
        </button>
      </div>
    </body>
    </html>
  `,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-cache",
      },
    }
  );
}

function createErrorResponse() {
  return new Response("Service Unavailable", {
    status: 503,
    statusText: "Service Unavailable",
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

// Message handling for cache management
self.addEventListener("message", (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;

    case "CLEAR_CACHE":
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;

    case "GET_CACHE_SIZE":
      getCacheSize().then((size) => {
        event.ports[0].postMessage({ size });
      });
      break;

    default:
      console.log("SudoBotz SW: Unknown message type:", type);
  }
});

// Cache management utilities
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
  console.log("SudoBotz SW: All caches cleared");
}

async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }

  return totalSize;
}

// Performance monitoring
self.addEventListener("fetch", (event) => {
  const startTime = performance.now();

  event.respondWith(
    event.respondWith.then((response) => {
      const duration = performance.now() - startTime;

      // Log slow requests
      if (duration > 1000) {
        console.warn(
          `SudoBotz SW: Slow request (${duration.toFixed(2)}ms):`,
          event.request.url
        );
      }

      return response;
    })
  );
});

console.log("SudoBotz SW: Service Worker initialized successfully");
