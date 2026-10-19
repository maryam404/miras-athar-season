// Static export for GitHub Pages (Pages serves static files only).
// Base path is injected at build time by the deploy workflow:
//  - user site  (owner.github.io)       -> no base path
//  - project site (owner.github.io/repo) -> base path "/repo"
const basePath = process.env.PAGES_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // شرطة نهاية موحّدة: يجعل كل الروابط داخل نطاق Service Worker حتى دون إنترنت
  trailingSlash: true,
  ...(basePath ? { basePath, assetPrefix: basePath + "/" } : {}),
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    // للعميل: مسار جذر التطبيق (يستخدمه مسجّل Service Worker)
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
