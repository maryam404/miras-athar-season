/* مراس أثر الموسم — Service Worker
 * استراتيجية الصفحات (navigations): Network First — الشبكة أولاً، ومع الفشل
 * نرجع النسخة المخزَّنة. الأصول الثابتة (_next/static والخطوط): Cache First.
 */
const VERSION = "v1";
const PAGES_CACHE = `miras-pages-${VERSION}`;
const ASSETS_CACHE = `miras-assets-${VERSION}`;

const ASSET_EXTENSIONS = [
  ".css",
  ".js",
  ".mjs",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".webp",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".json",
  ".webmanifest",
];

const isAsset = (pathname) => {
  const lower = pathname.toLowerCase();
  return (
    pathname.includes("/_next/static/") ||
    ASSET_EXTENSIONS.some((ext) => lower.endsWith(ext))
  );
};

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      // تهيئة ذاكرة الصفحات وتخزين الصفحة الرئيسية مسبقاً
      try {
        const cache = await caches.open(PAGES_CACHE);
        const scopeUrl = new URL(self.registration.scope);
        await cache.put(
          new Request(scopeUrl.origin + scopeUrl.pathname, {
            redirect: "follow",
          }),
          await fetch(scopeUrl.origin + scopeUrl.pathname, {
            redirect: "follow",
            cache: "no-cache",
          }),
        );
      } catch (err) {
        // لا شيء — العرض يتم لاحقاً عند أول زيارة ناجحة
      }
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith("miras-") &&
              key !== PAGES_CACHE &&
              key !== ASSETS_CACHE,
          )
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // ===== الصفحات (HTML): Network First =====
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          try {
            const cache = await caches.open(PAGES_CACHE);
            await cache.put(request, fresh.clone());
          } catch (err) {
            // تجاهل فشل التخزين
          }
          return fresh;
        } catch (err) {
          const cache = await caches.open(PAGES_CACHE);
          let cached = await cache.match(request, { ignoreSearch: true });
          if (cached) return cached;

          // احتياط: أي صفحة مخزنة (الأفضل الرئيسية) بدل فشل كامل
          const keys = await cache.keys();
          const fallback =
            keys.find((req) => req.url.endsWith("/")) || keys[0];
          if (fallback) {
            const fallbackRes = await cache.match(fallback);
            if (fallbackRes) return fallbackRes;
          }
          return new Response("<h1>لا يوجد اتصال</h1>", {
            status: 503,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        }
      })(),
    );
    return;
  }

  // ===== الأصول الثابتة: Cache First مع تحديث خلفي =====
  if (isAsset(url.pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSETS_CACHE);
        let cached = await cache.match(request, { ignoreSearch: true });
        if (cached) {
          // تحديث صامت في الخلفية
          fetch(request)
            .then((fresh) => {
              if (fresh && fresh.ok) cache.put(request, fresh.clone());
            })
            .catch(() => {});
          return cached;
        }
        try {
          const fresh = await fetch(request);
          if (fresh && fresh.ok) {
            try {
              await cache.put(request, fresh.clone());
            } catch (err) {
              // تجاهل فشل التخزين
            }
          }
          return fresh;
        } catch (err) {
          // أول مرة دون اتصال ولا نسخة مخزنة
          return new Response("", { status: 504 });
        }
      })(),
    );
  }
});
