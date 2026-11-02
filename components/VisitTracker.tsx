"use client";

import { useEffect } from "react";
import { trackPageView } from "@/lib/visits";

/**
 * تثبيت قياس زيارات الموقع مجهولًا (اعتماد المشرفة 2026-11-01):
 * يُركّب مرة واحدة في مستوى الجذر — لكل تحميل صفحة فعلي حدث مجهول واحد فقط
 * (إعادة التصيير المتلاصقة تُمتص)، بلا أي أثر مرئي في الواجهة.
 */
export default function VisitTracker() {
  useEffect(() => {
    trackPageView();
  }, []);
  return null;
}
