"use client";

import { useEffect } from "react";

/**
 * تسجيلService Worker لدعم العمل دون إنترنت.
 * - لا تسجيل في بيئة التطوير (next dev).
 * - لا تسجيل داخل iframe (نافذة المعاينة).
 */
export default function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") return;
    if (typeof window === "undefined") return;
    if (window.self !== window.top) return; // داخل iframe للمعاينة
    if (!("serviceWorker" in navigator)) return;

    const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";

    const register = () => {
      navigator.serviceWorker
        .register(`${bp}/sw.js`)
        // تجاهل فشل التسجيل بصمت (لا يؤثر على الاستخدام العادي)
        .catch(() => {});
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
