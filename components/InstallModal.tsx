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
 * - على الجوال: النافذة تبقى بارتفاعها الطبيعي ونفس عرضها وهوامشها وحوافها في كل الحالات
 *   (fixed inset-0 بلا أي إحداثيات أو سقف مشتق من visualViewport)؛ عند ظهور لوحة المفاتيح
 *   تثبت أعلى الشاشة بنفس الهوامش (تبقى منبثقة ولا تتحول إلى صفحة كاملة) مع تمرير داخلي رأسي
 *   للمحتوى فقط عند ضاقت المساحة، مع إبقاء الحقل النشط مرئيًا ودون أي تغيير على الكمبيوتر.
 * - لا تُعرض تلقائياً؛ تُفتح من زر التثبيت فقط.
 */
export default function InstallModal({ open, title, onClose, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  // مرجع الأحدث: التأثير يُثبَّت على [open] فقط، فلا يُعاد تركيزه ولا تسريب تركيز
  // مع أي إعادة رسم للصفحة (الهويات الدالية المتغيرة في onCancel بين الرسومات).
  const onCloseRef = useRef(onClose);
  // أبعاد منطقة العرض المرئية على الجوال فقط (لا شيء على الكمبيوتر)، مع خط الأساس المرصود
  // لحظة فتح النافذة: تعمل كاشفًا لظهور لوحة المفاتيح (انكماش المنطقة المرئية) لا مقيّدًا لأبعاد النافذة.
  const [vv, setVv] = useState<VVSize | null>(null);
  const baselineHeightRef = useRef<number | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // تتبع visualViewport قيد فتح النافذة فقط — بلا أي مساس بالتركيز أو بلوحة المفاتيح،
  // والاستماع لـ resize فقط: إزاحة/سحب الصفحة من iOS لا يجب أن يحرك النافذة إطلاقًا.
  useEffect(() => {
    if (!open) {
      setVv(null);
      baselineHeightRef.current = null;
      return;
    }
    const vvp = window.visualViewport;
    if (!vvp) return; // بيئة بلا visualViewport (كمبيوتر قديم): السلوك السابق كما هو
    const update = () => {
      if (window.innerWidth <= MOBILE_MAX) {
        if (baselineHeightRef.current == null) baselineHeightRef.current = vvp.height;
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

  // إبقاء الحقل النشط مرئيًا بالتمرير الداخلي **بالمقدار اللازم فقط** (مستوى الجسم الداخلي للنافذة):
  // لا scrollIntoView إطلاقًا (ينتشر في iPhone إلى مستند الصفحة فيُزاح كل شيء = الرقصة أعلى/أسفل)،
  // بل ضبط scrollTop للجسم مباشرة ولمستند غير قابل للتمرير أصلًا — بلا تحريك مركز ولا اهتزاز.
  useEffect(() => {
    if (vv == null) return;
    const body = bodyRef.current;
    const el = document.activeElement as HTMLElement | null;
    if (body && el && body.contains(el)) {
      requestAnimationFrame(() => {
        const br = body.getBoundingClientRect();
        const er = el.getBoundingClientRect();
        const pad = 8;
        try {
          if (er.top < br.top + pad) {
            body.scrollTop -= br.top + pad - er.top;
          } else if (er.bottom > br.bottom - pad) {
            body.scrollTop += er.bottom - (br.bottom - pad);
          }
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

  // كشف ظهور لوحة المفاتيح على الجوال: المنطقة المرئية انكمشت كثيرًا عن خط الأساس (≥80px)
  // — يعمل مع نموذج iOS (بان لا يغيّر innerHeight) ونموذج أندرويد (تغيير innerHeight) معًا.
  const keyboardOpen =
    vv != null && baselineHeightRef.current != null && vv.height < baselineHeightRef.current - 80;

  // سقف عرض ملاذ آمن ضد أي تكبير يدوي خارجي (pinch) — لا يتفعل في الاستخدام العادي إطلاقًا،
  // ولا تُكتب أي أبعاد/مواضع إطلاقًا: الارتفاع الطبيعي للنافذة والتمركز الكلي يجريان من CSS وحده.
  const panelStyle =
    vv != null && keyboardOpen
      ? { maxHeight: Math.max(240, Math.floor(vv.height - 32)), maxWidth: Math.floor(vv.width) }
      : vv != null
        ? { maxWidth: Math.floor(vv.width) }
        : undefined;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={title}>
      {/* الخلفية: النقر خارج النافذة يغلقها */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] motion-reduce:backdrop-blur-none"
      />
      {/* التمركز الأفقي دوماً؛ ومع لوحة المفاتيح تثبت أعلى الشاشة (بنفس الهوامش) لتبقى
          النافذة بارتفاعها الطبيعي منبثقة — وليست بضغطها لتملأ كل المساحة المتبقية —
          والمحتوى الأطول من المساحة يُقرأ بالتمرير الداخلي رأسياً فقط. */}
      <div
        className={
          keyboardOpen
            ? "pointer-events-none absolute inset-0 grid items-start justify-items-center p-4"
            : "pointer-events-none absolute inset-0 grid place-items-center p-4"
        }
      >
        <div
          ref={panelRef}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          style={panelStyle}
          className="pointer-events-auto relative flex max-h-[92vh] w-[min(92vw,24rem)] flex-col overflow-hidden rounded-3xl bg-white p-6 shadow-card-hover outline-none animate-fade-up motion-reduce:animate-none"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="absolute end-3 top-3 rounded-full p-2 text-brand-deep transition-colors duration-200 hover:bg-sand-pale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pale"
          >
            <X size={18} strokeWidth={2.5} aria-hidden="true" />
          </button>
          {title ? <h2 className="mb-2 shrink-0 pe-8 text-xl font-black text-brand-deep">{title}</h2> : null}
          {/* bodyRef: منطقة التمرير الرأسي الداخلية الوحيدة — المحتوى يتحرك داخليًا بالقدر اللازم فقط، */}
          {/* والرأس (زر الإغلاق + العنوان) ثابت خارجها فلا يخرج أعلى الشاشة إطلاقًا. */}
          <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

