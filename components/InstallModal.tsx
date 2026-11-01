"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
};

/** أبعاد منطقة العرض المرئية على الجوال (visualViewport) — العرض والارتفاع فقط،
 *  ولا تُقرأ offsetLeft/offsetTop إطلاقًا حتى لا تتحرك النافذة مرتين على iOS Safari. */
type VVSize = { width: number; height: number };

const MOBILE_MAX = 767;

/**
 * نافذة حوارية أنيقة بلون الموقع وخطوطه:
 * - تُغلق بـ Escape أو بالنقر خارج النافذة أو زر الإغلاق.
 * - تمنع تمرير الخلفية أثناء فتحها.
 * - تدعم لوحة المفاتيح (احتواء Tab داخل النافذة + إعادة تركيز عند الإغلاق).
 * - على الجوال: النافذة تبقى متمركزة أفقيًا داخل عرض الشاشة دائمًا (fixed inset-0 بلا أي إحداثيات
 *   من visualViewport — لا انزياح ولا قصّ على iPhone Safari)، ولوحة المفاتيح تقلّص ارتفاع المحتوى
 *   المتاح فقط (سقف ارتفاع + تمرير داخلي رأسي) مع إبقاء الحقل النشط مرئيًا،
 *   ومحتواها قابل للتمرير داخليًا دون تغيير أي شيء على الكمبيوتر.
 * - لا تُعرض تلقائياً؛ تُفتح من زر التثبيت فقط.
 */
export default function InstallModal({ open, title, onClose, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  // مرجع الأحدث: التأثير يُثبَّت على [open] فقط، فلا يُعاد تركيزه ولا تسريب تركيز
  // مع أي إعادة رسم للصفحة (الهويات الدالية المتغيرة في onCancel بين الرسومات).
  const onCloseRef = useRef(onClose);
  // أبعاد منطقة العرض المرئية على الجوال فقط (لا شيء على الكمبيوتر):
  // تُستخدم لسقف ارتفاع المحتوى فوق لوحة المفاتيح فقط — لا لتحديد موضع النافذة.
  const [vv, setVv] = useState<VVSize | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // تتبع visualViewport قيد فتح النافذة فقط — بلا أي مساس بالتركيز أو بلوحة المفاتيح،
  // والاستماع لـ resize فقط: إزاحة/سحب الصفحة من iOS لا يجب أن يحرك النافذة إطلاقًا.
  useEffect(() => {
    if (!open) {
      setVv(null);
      return;
    }
    const vvp = window.visualViewport;
    if (!vvp) return; // بيئة بلا visualViewport (كمبيوتر قديم): السلوك السابق كما هو
    const update = () => {
      if (window.innerWidth <= MOBILE_MAX) {
        setVv({ width: vvp.width, height: vvp.height });
      } else {
        setVv(null);
      }
    };
    update();
    vvp.addEventListener("resize", update);
    return () => {
      vvp.removeEventListener("resize", update);
    };
  }, [open]);

  // إبقاء الحقل النشط داخل النافذة عند تقلّص الارتفاع المتاح (فتح اللوحة):
  // تمرير داخلي لمحتوى النافذة فقط — موضع النافذة نفسها لا يُعدَّل مطلقًا (لا translate ولا top/left).
  useEffect(() => {
    if (vv == null) return;
    const panel = panelRef.current;
    const el = document.activeElement as HTMLElement | null;
    if (panel && el && panel.contains(el)) {
      requestAnimationFrame(() => {
        try {
          el.scrollIntoView({ block: "center" });
        } catch {
          /* بيئة قديمة: تجاهل */
        }
      });
    }
  }, [vv]);

  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    if (panel) panel.focus({ preventScroll: true });

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key === "Tab" && panel) {
        const focusables = panel.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === panel)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || active === document.body)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      const toRestore = lastFocused.current;
      if (toRestore && toRestore.isConnected) toRestore.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  // الجوال فقط: سقف ارتفاع المحتوى فوق لوحة المفاتيح + سقف عرض ملاذ آمن ضد أي تكبير (pinch)
  // — لا تُلمس مواضع top/left إطلاقًا: التمركز الأفقي يبقى لـ CSS (grid place-items-center) وحده.
  const panelStyle =
    vv != null
      ? { maxHeight: Math.max(240, Math.floor(vv.height * 0.92)), maxWidth: Math.floor(vv.width) }
      : undefined;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={title}>
      {/* الخلفية: النقر خارج النافذة يغلقها */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] motion-reduce:backdrop-blur-none"
      />
      <div className="pointer-events-none absolute inset-0 grid place-items-center p-4">
        <div
          ref={panelRef}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          style={panelStyle}
          className="pointer-events-auto relative max-h-[92vh] w-[min(92vw,24rem)] overflow-y-auto overflow-x-hidden rounded-3xl bg-white p-6 shadow-card-hover outline-none animate-fade-up motion-reduce:animate-none"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="absolute end-3 top-3 rounded-full p-2 text-brand-deep transition-colors duration-200 hover:bg-sand-pale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pale"
          >
            <X size={18} strokeWidth={2.5} aria-hidden="true" />
          </button>
          {title ? <h2 className="mb-2 pe-8 text-xl font-black text-brand-deep">{title}</h2> : null}
          {children}
        </div>
      </div>
    </div>
  );
}

