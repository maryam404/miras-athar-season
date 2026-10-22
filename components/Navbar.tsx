"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === "/" || pathname === "";
  const isAbout = pathname.startsWith("/about");

  // مسار جذر التطبيق (يُحقن وقت البناء عبر env — نمط مسجّل Service Worker نفسه)
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

  // إغلاق القائمة عند تغيّر الصفحة (زر رجوع/أمام)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // إغلاق القائمة بـEscape أو الضغط خارجها
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || btnRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  const items = [
    { href: "/", label: "الرئيسية", active: isHome },
    { href: "/about", label: "عن مراس", active: isAbout },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md border-b border-sand-200 shadow-sm">
      <div className="mx-auto max-w-6xl px-5 py-2.5 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          {/* شعارات الجهات — يمين الشريط العلوي، تصلح كرابط للصفحة الرئيسية */}
          <Link href="/" className="shrink-0 rounded-lg transition-opacity duration-200 hover:opacity-90">
            <img
              src={`${base}/logo.png`}
              alt="شعارات: جمعية علم الحج — نون متحد — مراس"
              width={1688}
              height={136}
              className="h-auto w-auto max-h-7 max-w-[calc(100vw-7.5rem)] object-contain sm:max-h-9 md:max-h-10 lg:max-h-11"
              decoding="async"
              draggable={false}
            />
          </Link>

          {/* أيقونة قائمة التنقل — يسار الشريط العلوي */}
          <div ref={panelRef} className="relative">
            <button
              ref={btnRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="nav-menu"
              aria-haspopup="menu"
              aria-label={open ? "إغلاق قائمة التنقل" : "فتح قائمة التنقل"}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl border transition-colors duration-200",
                open
                  ? "bg-brand-deep text-white border-brand-deep shadow-card"
                  : "bg-white/70 text-brand-deep border-sand-200 hover:bg-sand-pale",
              )}
            >
              {open ? (
                <X className="h-5 w-5" aria-hidden />
              ) : (
                <Menu className="h-5 w-5" aria-hidden />
              )}
            </button>

            {open && (
              <div
                id="nav-menu"
                aria-label="قائمة التنقل"
                className="absolute end-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-sand-200 bg-white/95 p-1.5 shadow-card-hover backdrop-blur-md"
              >
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={item.active ? "page" : undefined}
                    className={cn(
                      "block rounded-xl px-4 py-2.5 text-sm font-bold transition-colors duration-200",
                      item.active
                        ? "bg-brand-deep text-white shadow-card"
                        : "text-brand-deep hover:bg-sand-pale",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
