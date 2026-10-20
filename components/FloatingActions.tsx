"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Check, Compass, Plus, Share, Smartphone, SquarePlus } from "lucide-react";
import InstallModal from "./InstallModal";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Mode = "installed" | "success" | "ios" | "prompt" | "manual";

const WHATSAPP_NUMBER = "966534404415";
const WHATSAPP_TEXT = "السلام عليكم استاذة حسنى اتواصل معاك بخصوص برامج مراس اثر الموسم";
// رابط WhatsApp الرسمي — يفتح المحادثة ويضع النص في خانة الكتابة، والإرسال بيد الزائرة
const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;

// اكتشاف وضع standalone (مثبّت مسبقاً) — يعمل على أندرويد وسطح المكتب وعلى iOS (navigator.standalone)
const isStandaloneNow = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)")?.matches === true ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true);

const UA_HAS_IOS = () => {
  const ua = window.navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) // iPadOS يقدم نفسه بزي Mac
  );
};

function Step({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2.5 text-sm font-semibold text-brand-deep">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sand-pale text-brand-deep" aria-hidden="true">
        {icon}
      </span>
      <span className="leading-snug">{children}</span>
    </li>
  );
}

/**
 * زران عائمان ثابتان (يسار أسفل الشاشة): تثبيت تطبيق مراس + تواصل واتساب.
 * يظهران في كل الصفحات عبر التخطيط الجذري، ولا يخفيان أثناء التمرير.
 * لا يلقيان أي استدعاء لمتصفح أثناء التصيير — كل اكتشاف الجهاز يحدث عند النقر أو في المؤثرات فقط.
 */
export default function FloatingActions() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("manual");
  const [iosNeedsSafari, setIosNeedsSafari] = useState(false);
  const [pending, setPending] = useState(false);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const openRef = useRef(false);
  openRef.current = open;

  // التقاط حدث التثبيت المؤجل (أندرويد/كمبيوتر) — بلا أي تثبيت تلقائي
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      promptRef.current = e as BeforeInstallPromptEvent;
    };
    const onInstalled = () => {
      // رسالة النجاح فقط بعد التأكد من إتمام التثبيت (حدث appinstalled)
      promptRef.current = null;
      setPending(false);
      if (openRef.current) setMode("success");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const detect = useCallback(() => {
    const ua = window.navigator.userAgent;
    if (UA_HAS_IOS()) {
      const safari =
        /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|Chrome|Firefox/i.test(ua);
      setIosNeedsSafari(!safari);
      setMode("ios");
      return;
    }
    setIosNeedsSafari(false);
    setMode(promptRef.current ? "prompt" : "manual");
  }, []);

  const openModal = useCallback(() => {
    if (isStandaloneNow()) {
      setMode("installed"); // «مراس معاكِ بالفعل 🌷»
    } else {
      detect();
    }
    setOpen(true);
  }, [detect]);

  const runInstall = useCallback(async () => {
    const e = promptRef.current;
    if (!e) {
      detect(); // انتهى الدفع المؤجل: ارجع للتعليمات اليدوية
      return;
    }
    setPending(true);
    try {
      await e.prompt(); // فتح نافذة التثبيت الرسمية بعلمة الزائرة نفسها
      const { outcome } = await e.userChoice;
      if (outcome === "dismissed") setPending(false);
      // عند القبول يأتي appinstalled فيتحول النص إلى رسالة النجاح
    } catch {
      setPending(false);
    }
  }, [detect]);

  const installButtonClass =
    "grid h-[52px] w-[52px] place-items-center rounded-full bg-brand text-white shadow-card ring-1 ring-white/25 transition-all duration-200 hover:bg-brand-dark hover:shadow-card-hover active:scale-95 motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:active:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pale focus-visible:ring-offset-2 focus-visible:ring-offset-sand-cream";

  const content: ReactNode =
    mode === "installed" || mode === "success" ? (
      <div className="text-center">
        <p className="text-lg font-extrabold text-brand-deep">مراس معاكِ بالفعل 🌷</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {mode === "success"
            ? "تم تثبيت أيقونة مراس على شاشتكِ الرئيسية بنجاح."
            : "تستطيعين فتح مراس من أيقونتها على الشاشة الرئيسية في أي وقت."}
        </p>
      </div>
    ) : (
      <>
        <p className="text-sm leading-relaxed text-ink">
          أضيفي مراس إلى الشاشة الرئيسية لجوالكِ، واستمتعي بالوصول السريع إلى برامج المبادرة
          وتصفح الصفحات المحفوظة حتى بدون إنترنت.
        </p>

        {mode === "prompt" && (
          <div className="mt-4">
            <button
              type="button"
              onClick={runInstall}
              disabled={pending}
              className="w-full rounded-full bg-brand px-5 py-3 text-sm font-bold text-white shadow-card transition-all duration-200 hover:bg-brand-dark active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pale focus-visible:ring-offset-2"
            >
              {pending ? "…يفتح مربّع تثبيت المتصفح" : "تثبيت التطبيق"}
            </button>
          </div>
        )}

        {mode === "ios" && (
          <>
            {iosNeedsSafari && (
              <p className="mt-3 rounded-2xl bg-rose-pale px-4 py-2.5 text-xs leading-relaxed text-brand-deep">
                متصفحكِ الحالي لا يدعم الإضافة بهذه الطريقة — افتحي الموقع في Safari أولاً ثم
                تابعي الخطوات:
              </p>
            )}
            <ol className="mt-3 space-y-2.5">
              <Step icon={<Compass size={15} strokeWidth={2.2} />}>افتحي الموقع باستخدام Safari.</Step>
              <Step icon={<Share size={15} strokeWidth={2.2} />}>اضغطي على زر المشاركة.</Step>
              <Step icon={<SquarePlus size={15} strokeWidth={2.2} />}>
                اختاري «إضافة إلى الشاشة الرئيسية».
              </Step>
              <Step icon={<Check size={15} strokeWidth={2.6} />}>
                اضغطي «إضافة» لتظهر أيقونة مراس على جوالكِ.
              </Step>
            </ol>
          </>
        )}

        {mode === "manual" && (
          <ol className="mt-3 space-y-2.5">
            <Step icon={<Share size={15} strokeWidth={2.2} />}>
              افتحي قائمة متصفحكِ (⋮ على أندرويد، أو زر القائمة على الكمبيوتر).
            </Step>
            <Step icon={<SquarePlus size={15} strokeWidth={2.2} />}>
              اختاري «إضافة إلى الشاشة الرئيسية» أو «تثبيت التطبيق».
            </Step>
            <Step icon={<Check size={15} strokeWidth={2.6} />}>أكّدي الإضافة لتظهر أيقونة مراس.</Step>
          </ol>
        )}

        <p className="mt-4 border-t border-sand-light pt-3 text-[11px] leading-relaxed text-muted">
          الصفحات المتاحة دون إنترنت حالياً: الرئيسية و«عن المبادرة».
        </p>
      </>
    );

  return (
    <>
      <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 z-40 flex flex-col items-center gap-3">
        {/* الزر الأول: تثبيت تطبيق مراس */}
        <button
          type="button"
          onClick={openModal}
          aria-haspopup="dialog"
          aria-label="تثبيت تطبيق مراس على جوالكِ"
          title="تثبيت تطبيق مراس"
          className={installButtonClass}
        >
          <span className="relative inline-flex">
            <Smartphone size={24} strokeWidth={2.1} aria-hidden="true" />
            <span
              className="absolute -left-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-white text-brand shadow-sm"
              aria-hidden="true"
            >
              <Plus size={11} strokeWidth={3.5} />
            </span>
          </span>
        </button>

        {/* الزر الثاني: واتساب */}
        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="تواصلي عبر واتساب"
          title="تواصلي عبر واتساب"
          className="grid h-[52px] w-[52px] place-items-center rounded-full bg-[#25D366] text-white shadow-card ring-1 ring-white/25 transition-all duration-200 hover:bg-[#1DA851] hover:shadow-card-hover active:scale-95 motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:active:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pale focus-visible:ring-offset-2 focus-visible:ring-offset-sand-cream"
        >
          <svg
            viewBox="0 0 448 512"
            className="h-[27px] w-[24px]"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-184.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
          </svg>
        </a>
      </div>

      <InstallModal open={open} onClose={() => setOpen(false)} title="خذي مراس معاكِ">
        {content}
      </InstallModal>
    </>
  );
}
