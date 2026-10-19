import type { MetadataRoute } from "next";

const basePath = process.env.PAGES_BASE_PATH || "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "مراس أثر الموسم",
    short_name: "مِراس أثر الموسم",
    description:
      "أجندة برامج وفعاليات مبادرة نون متحد بالشراكة مع جمعية علم الحج لموسم 1448هـ - 2026 - 2027م",
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf7f2",
    theme_color: "#855970",
    lang: "ar",
    dir: "rtl",
    categories: ["events", "education"],
    icons: [
      {
        src: `${basePath}/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${basePath}/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${basePath}/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: `${basePath}/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
