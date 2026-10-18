// Static export for GitHub Pages (Pages serves static files only).
// Base path is injected at build time by the deploy workflow:
//  - user site  (owner.github.io)       -> no base path
//  - project site (owner.github.io/repo) -> base path "/repo"
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
