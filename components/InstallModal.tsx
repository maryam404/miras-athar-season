"use client";

import { ReactNode, useEffect, useRef } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
};

/**
 * نافذة حوارية أنيقة بلون الموقع وخطوطه:
 * - تُغلق بـ Escape أو بالنقر خارج النافذة أو زر الإغلاق.
 * - تمنع تمرير الخلفية أثناء فتحها.
 * - تدعم لوحة المفاتيح (احتواء Tab داخل النافذة + إعادة تركيز عند الإغلاق).
 * - لا تُعرض تلقائياً؛ تُفتح من زر التثبيت فقط.
 */
export default function InstallModal({ open, title, onClose, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  // مرجع الأحدث: التأثير يُثبَّت على [open] فقط، فلا يُعاد تركيزه ولا تسريب تركيز
  // مع أي إعادة رسم للصفحة (الهويات الدالية المتغيرة في onCancel بين الرسومات).
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

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
          className="pointer-events-auto relative max-h-[92vh] w-[min(92vw,24rem)] overflow-y-auto rounded-3xl bg-white p-6 shadow-card-hover outline-none animate-fade-up motion-reduce:animate-none"
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
