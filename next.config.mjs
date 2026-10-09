// Static export for GitHub Pages (Pages serves static files only).
const basePath = process.env.PAGES_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  ...(basePath ? { basePath, assetPrefix: basePath + "/" } : {}),
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
