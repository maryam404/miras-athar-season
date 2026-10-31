"use client";

import { useEffect, useState } from "react";
import { EXPORT_NOW_MS } from "@/lib/build-stamp";

declare global {
  interface Window {
    __MIRAS_NOW__?: number;
  }
}

/**
 * ساعة النبض المعتمدة:
 * أول رسم (المُصدَّر ثابتًا + أول رسم عميل) يستخدمان طابع لحظة التصدير نفسه
 * (العميل يقرؤه من HTML المعقون) — فتتطابق الإمااعة حرفيًا بلا أي أخطاء إماهة.
 * بعد الركوب يُزامن فورًا مع الوقت الفعلي ثم ينبض بانتظام حتى تعيش الأعداد والحالات
 * حيًة دون إعادة تحميل. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState<number>(() => {
    if (typeof window !== "undefined" && typeof window.__MIRAS_NOW__ === "number" && Number.isFinite(window.__MIRAS_NOW__)) {
      return window.__MIRAS_NOW__;
    }
    // الخادم/المُصدّر: ثابت التصدير (مطابق لما يحقنه التخطيط في HTML)
    return EXPORT_NOW_MS;
  });
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
