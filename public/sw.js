/* مراس أثر الموسم — Service Worker
 * استراتيجية الصفحات (navigations): Network First — الشبكة أولاً، ومع الفشل
 * نرجع النسخة المخزَّنة. الأصول الثابتة (_next/static والخطوط): Cache First.
 *
 * v2: تخزين الصفحتين (الرئيسية + عن المبادرة) وأصولهما مسبقاً عند التثبيت،
 *     وإصلاح الدخول المباشر دون إنترنت، وتخزين الخطوط المتقاطعة المصدر.
 * v5: تحديث أيقونات التطبيق (شعار جديد) — كسر كاش الأيقونة القديمة عبر أسماء كاش جديدة.
 */
const VERSION = "v5";
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
  ".txt",
];

const ASSET_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

const isAsset = (pathname) => {
  const lower = pathname.toLowerCase();
  return (
    pathname.includes("/_next/static/") ||
    ASSET_EXTENSIONS.some((ext) => lower.endsWith(ext))
  );
};

const isAssetHost = (hostname) => ASSET_HOSTS.includes(hostname);

// تخزين أصل واحد بأمان: من الذاكرة إلى Cache First (إفشال مورد واحد لا يُفشل التثبيت)
const preCacheAsset = async (cache, url) => {
  try {
    const resp = await fetch(url, { cache: "no-cache" });
    if (resp && (resp.ok || resp.type === "opaque")) {
      await cache.put(url, resp.clone());
      await cache.put(resp.url, resp.clone());
    }
  } catch (err) {
    // تجاهل موردًا فاشلاً — مشكلة الانسداد للتثبيت غير مقبولة
  }
};

// استخراج موارد الموهج (HTML) القادمة من نفس المصدر أو خوادم الخطوط
const extractAssets = (html) => {
  const urls = new Set();
  try {
    const patterns = [
      /<link[^>]+href=["']([^"'#]+)["']/gi,
      /<script[^>]+src=["']([^"'#]+)["']/gi,
      /<img[^>]+src=["']([^"'#]+)["']/gi,
    ];
    for (const re of patterns) {
      let m;
      while ((m = re.exec(html))) {
        try {
          const u = new URL(m[1], self.location.origin);
          const lower = u.pathname.toLowerCase();
          const isResource = lower.endsWith(".js") || lower.endsWith(".css") ||
            lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") ||
            lower.endsWith(".svg") || lower.endsWith(".woff") || lower.endsWith(".woff2") ||
            lower.endsWith(".webp") || lower.endsWith(".ico") ||
            u.hostname === "fonts.googleapis.com" ||
            u.hostname === "fonts.gstatic.com";
          if (!isResource) continue;
          if (u.origin === self.location.origin || ASSET_HOSTS.includes(u.hostname)) {
            urls.add(u.href);
          }
        } catch (e) {
          // تجاهل رابطًا خاطئًا
        }
      }
    }
  } catch (e) {
    // تجاهل
  }
  return Array.from(urls);
};

// تخزين صفحة مع مفاتيح عنوانها المختلفة (مع/بدون الشرطة)
const preCachePage = async (cache, url) => {
  try {
    const resp = await fetch(url, { redirect: "follow", cache: "no-cache" });
    if (resp && resp.ok) {
      await cache.put(new Request(url, { redirect: "follow" }), resp.clone());
      if (resp.url && resp.url !== url && new URL(resp.url).origin === self.location.origin) {
        await cache.put(new Request(resp.url, { redirect: "follow" }), resp.clone());
      }
      return await resp.text();
    }
  } catch (err) {
    // تجاهل
  }
  return null;
};

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const pages = await caches.open(PAGES_CACHE);
      const scopeUrl = new URL(self.registration.scope);

      // تخزين الصفحتين مسبقاً (الرئيسية + عن المبادرة)
      const targets = [
        scopeUrl.origin + scopeUrl.pathname,
        scopeUrl.origin + scopeUrl.pathname.replace(/\/$/, "") + "/about/",
      ];
      let htmls = [];
      for (const t of targets) {
        const html = await preCachePage(pages, t);
        if (html) htmls.push(html);
      }

      // تخزين أصول الصفحتين المكتشفة داخل HTML (موارد نفس المصدر + الخطوط)
      try {
        const assets = await caches.open(ASSETS_CACHE);
        const all = new Set();
        for (const h of htmls) {
          for (const u of extractAssets(h)) all.add(u);
        }
        const assetList = Array.from(all).slice(0, 60);
        await Promise.all(assetList.map((u) => preCacheAsset(assets, u)));
        // بيانات التنقل الناعم (RSC payloads) — تضمن عمل الروابط الداخلية دون إنترنت
        await Promise.all([
          preCacheAsset(assets, scopeUrl.origin + scopeUrl.pathname + "index.txt"),
          preCacheAsset(assets, scopeUrl.origin + scopeUrl.pathname + "about/index.txt"),
        ]);
      } catch (err) {
        // تجاهل
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
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && !isAssetHost(url.hostname)) return;

  // ===== الصفحات (HTML): Network First =====
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          // استجابات 5xx (اعتراض/انقطاع عبر بروكسير) تُعامل كفشل الشبكة
          if (!fresh || fresh.status >= 500) {
            throw new Error("unacceptable-status-" + (fresh ? fresh.status : "null"));
          }
          try {
            const cache = await caches.open(PAGES_CACHE);
            // التخزين تحت المفتاح القانوني (بلا معاملات بحث) — يمنع الظلال القديمة
            const pathname = url.pathname.endsWith("/") ? url.pathname : url.pathname + "/";
            const canonical = url.origin + pathname;
            await cache.put(canonical, fresh.clone());
          } catch (err) {
            // تجاهل فشل التخزين
          }
          return fresh;
        } catch (err) {
          const cache = await caches.open(PAGES_CACHE);
          // 1) المطابقة القانونية غير المحوَّلة أولاً ثم 2) ignoreSearch احتياطاً
          const pathname = url.pathname.endsWith("/") ? url.pathname : url.pathname + "/";
          const canonical = url.origin + pathname;
          const direct = await cache.match(canonical);
          if (direct) return direct;
          const cached = await cache.match(request, { ignoreSearch: true });
          if (cached) return cached;
          // احتياط: الصفحة الرئيسية المخزنة أولاً، ثم أي صفحة مخزنة
          const scopeUrl = new URL(self.registration.scope);
          const scopeRoot = scopeUrl.origin + scopeUrl.pathname;
          const keys = await cache.keys();
          const fallback = keys.find((req) => req.url === scopeRoot) || keys[0];
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
  if (isAsset(url.pathname) || isAssetHost(url.hostname)) {
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
