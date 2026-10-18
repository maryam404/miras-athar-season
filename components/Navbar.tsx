"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export default function Navbar() {
  const pathname = usePathname();

  const isHome = pathname === "/" || pathname === "/";
  const isAbout = pathname === "/about/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-sand-200">
      <div className="mx-auto max-w-6xl px-5 py-3 sm:px-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-2xl transition-colors duration-200",
              isHome ? "bg-brand-deep text-white shadow-lg" : "text-brand-deep hover:bg-sand-200"
            )}
          >
            مراس أثر الموسم
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/"
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors duration-200",
                isHome ? "bg-brand-deep text-white shadow-md" : "text-brand-deep hover:bg-sand-200 hover:text-brand-deep"
              )}
            >
              الرئيسية
            </Link>
            <Link
              href="/about/"
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors duration-200",
                isAbout ? "bg-brand-deep text-white shadow-md" : "text-brand-deep hover:bg-sand-200 hover:text-brand-deep"
              )}
            >
              البرنامج القادم
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
