import type { Metadata } from "next";
import "./globals.css";
import { handicrafts } from "./fonts";

export const metadata: Metadata = {
  title: "مراس أثر الموسم | مبادرة نون متحد",
  description:
    "أجندة برامج وفعاليات مبادرة نون متحد بالشراكة مع جمعية علم الحج لموسم 1448هـ - 2026 - 2027م",
  keywords: ["نون متحد", "مراس أثر الموسم", "جمعية علم الحج", "فعاليات", "برامج"],
  openGraph: {
    title: "مراس أثر الموسم | مبادرة نون متحد",
    description:
      "أجندة برامج وفعاليات مبادرة نون متحد بالشراكة مع جمعية علم الحج لموسم 1448هـ - 2026 - 2027م",
    locale: "ar_SA",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Tajawal:wght@400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`min-h-screen bg-sand-cream ${handicrafts.variable}`}>{children}</body>
    </html>
  );
}
