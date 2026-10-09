// Static export for GitHub Pages.
const basePath = process.env.PAGES_BASE_PATH || "";
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
};
export default nextConfig;
