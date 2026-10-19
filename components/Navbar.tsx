"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export default function Navbar() {
  const pathname = usePathname();

  const isHome = pathname === "/" || pathname === "";
  const isAbout = pathname.startsWith("/about");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md border-b border-sand-200 shadow-sm">
      <div className="mx-auto max-w-6xl px-5 py-2.5 sm:px-8">
        <div className="flex items-center justify-between">
          {/* brand */}
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-2 font-black text-lg transition-colors duration-200 sm:text-xl",
              isHome
                ? "text-brand-deep"
                : "text-brand-deep hover:text-brand",
            )}
          >
            مِراس أثر الموسم
          </Link>

          {/* links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold transition-colors duration-200",
                isHome
                  ? "bg-brand-deep text-white shadow-card"
                  : "text-brand-deep hover:bg-sand-pale",
              )}
            >
              الرئيسية
            </Link>
            <Link
              href="/about/"
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold transition-colors duration-200",
                isAbout
                  ? "bg-brand-deep text-white shadow-card"
                  : "text-brand-deep hover:bg-sand-pale",
              )}
            >
              عن المبادرة
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
