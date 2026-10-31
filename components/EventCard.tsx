"use client";

import { useId, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronDown, ClipboardCheck, Clock3, MapPin, MonitorSmartphone, Sparkles, Star, Video } from "lucide-react";
import type { SeasonEvent } from "@/data/events";
import { checkAttendanceStatus, getZoomPhase, isRegistrationOpen } from "@/lib/attendance";
import { sendZoomHit } from "@/lib/zoom-hits";
import { formatEventDuration, formatEventTimeRange, formatTime12h, getEventEndDateTime, getEventStatus } from "@/lib/datetime";
import { EVALUATION_UNAVAILABLE_NOTE, EVALUATION_WINDOW_ENDED_NOTE } from "@/lib/notices";
import { getEvaluationPhase } from "@/lib/evaluation";
import { cn } from "@/lib/cn";
import AttendanceConfirm from "./AttendanceConfirm";
import InstallModal from "./InstallModal";
import Countdown from "./Countdown";
import EventStatusBadge from "./EventStatusBadge";

interface Props {
  event: SeasonEvent;
  now: number;
  isNext?: boolean;
  index?: number;
  /** بطاقة مثبتة (أقرب برنامج قادم): مفتوحة دائمًا ولا تُغلق بالنقر عليها. */
  pinned?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}

export default function EventCard({
  event,
  now,
  isNext = false,
  index = 0,
  pinned = false,
  expanded = false,
  onToggle,
}: Props) {
  const status = getEventStatus(event, now);
  const remote = event.execution === "عن بُعد";
  const isNearest = isNext && status === "upcoming";
  // البطاقة المثبتة تبقى مفتوحة ولا يمكن إغلاقها بالنقر عليها.
  const isOpen = pinned ? true : expanded;

  // نافذة تأكيد الحضور (حالة محلية لكل بطاقة)
  const [modalOpen, setModalOpen] = useState(false);

  // نافذة الملاحظة الموحّدة — نفس مكوّن نوافذ الموقع (InstallModal) لكل حالات «غير متاح الآن»
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);

  // لوحة الدخول عبر Zoom: تحقق برقم الجوال فقط (بلا تخزين على الجهاز)
  const [zoomPanelOpen, setZoomPanelOpen] = useState(false);
  const [zoomPhone, setZoomPhone] = useState("");
  const [zoomChecking, setZoomChecking] = useState(false);
  const [zoomNote, setZoomNote] = useState("");
  const [zoomUnlocked, setZoomUnlocked] = useState(false);

  const zoomPhase = getZoomPhase(event, now);
  const hasZoom = Boolean(event.zoomLink);
  const zoomOpen = hasZoom && zoomPhase === "open";
  const attendingOpen = isRegistrationOpen(event, now);

  // نافذة التقييم (نهاية−15د .. نهاية+60د): تفتح النموذج فقط خلالها مع توفر الرابط — القرار 2026-10-31
  const evaluationPhase = getEvaluationPhase(event, now);
  const evaluationOpen = Boolean(event.evaluationLink) && evaluationPhase === "open";
  // الضغط خارج النافذة: «انتهت الفترة» بعد نافذة رابط موجود، و«غير متاح حاليًا» قبله أو بالحالات بلا رابط (في أي وقت)
  const evaluationNote =
    Boolean(event.evaluationLink) && evaluationPhase === "ended"
      ? EVALUATION_WINDOW_ENDED_NOTE
      : EVALUATION_UNAVAILABLE_NOTE;

  /** ملاحظة Zoom المعتمدة عند عدم إتاحتها (قبل النافذة/بعد نهايتها/بلا رابط) — تُعرض بنافذة الموقع عند الضغط، والزر يبقى أزرقًا نشطًا دائمًا. */
  const zoomNoteText = !hasZoom
    ? "رابط Zoom غير متوفر بعد — يُضاف عند تجهيز الموعد"
    : zoomPhase === "before_window"
      ? "يُفعَّل الدخول عبر Zoom قبل موعد البرنامج بساعة"
      : zoomPhase === "ended"
        ? "انتهت نافذة الدخول عبر Zoom لهذا البرنامج"
        : null;

  async function handleZoomCheck() {
    if (zoomChecking) return;
    setZoomNote("");
    setZoomChecking(true);
    try {
      const res = await checkAttendanceStatus(String(event.id), zoomPhone);
      if (res.kind === "confirmed") {
        setZoomUnlocked(true);
        setZoomPanelOpen(false);
      } else {
        setZoomNote(res.kind === "network" ? "تعذر الاتصال بالخادم — تحققي من الإنترنت وحاولي مجددًا." : res.message);
      }
    } finally {
      setZoomChecking(false);
    }
  }

  // معرّفات فريدة لكل ظهور للبطاقة (قد تظهر نفس البطاقة في أكثر من قسم)
  const uid = useId().replace(/[^a-zA-Z0-9_]/g, "");
  const summaryId = `event-summary-${event.id}-${uid}`;
  const detailsId = `event-details-${event.id}-${uid}`;

  return (
    <article
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
      className={cn(
        "group flex animate-fade-up flex-col overflow-hidden rounded-3xl border bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover",
        status === "live" && "border-brand/40 shadow-live",
        status === "completed" && "border-stone-200/80 opacity-[0.92]",
        isNearest && pinned && "border-rose-brand/60 shadow-glow",
      )}
    >
      {/* top accent */}
      <div
        className={cn(
          "h-1.5 w-full",
          status === "live"
            ? "bg-gradient-to-l from-brand-deep via-brand to-rose-brand"
            : status === "completed"
              ? "bg-stone-200"
              : isNearest
                ? "bg-gradient-to-l from-rose-brand via-rose-brand/70 to-sand"
                : "bg-gradient-to-l from-brand/70 via-brand/30 to-sand-light",
        )}
      />

      {/* الملخص المختصر: نوع البرنامج + عنوانه + طريقة الحضور، مع سهم إشاري */}
      <button
        type="button"
        id={summaryId}
        aria-expanded={isOpen}
        aria-controls={detailsId}
        onClick={pinned ? undefined : onToggle}
        title={
          pinned
            ? isNearest
              ? "بطاقة البرنامج الأقرب موعدًا — مثبتة مفتوحة دائمًا"
              : "بطاقة البرنامج مثبتة مفتوحة دائمًا حتى تتحول إلى المنتهية"
            : undefined
        }
        className="flex w-full flex-col gap-4 p-5 text-start sm:p-6"
      >
        {/* badges row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-sand-pale px-3 py-1 text-[11px] font-bold text-brand-deep">
            {event.type}
          </span>
          {isNearest ? (
            /* شارة واحدة فقط للأقرب: الأقرب موعدًا (دون تكرار «قادم») */
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-brand/50 bg-rose-pale px-3 py-1 text-[11px] font-extrabold text-brand-deep">
              <Sparkles className="h-3.5 w-3.5" />
              الأقرب موعدًا
            </span>
          ) : (
            <EventStatusBadge status={status} pulse />
          )}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "ms-auto h-4 w-4 shrink-0 text-brand/40 transition-transform duration-300",
              isOpen && "rotate-180",
              pinned && "text-brand/20",
            )}
          />
        </div>

        {/* title */}
        <h3 className="text-[17px] font-extrabold leading-8 text-ink sm:text-lg">
          {event.title}
        </h3>

      </button>

      {/* التفاصيل: التاريخ، الساعة، المدة، العداد والتفاصيل السفلية — تتوسع بسلاسة */}
      <div
        id={detailsId}
        role="region"
        aria-labelledby={summaryId}
        className="grid flex-1 transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex h-full flex-col px-5 pb-5 sm:px-6 sm:pb-6">
            <dl className="grid grid-cols-1 gap-2.5 text-[13px]">
              <div className="flex items-center gap-2 text-ink/80">
                <CalendarDays className="h-4 w-4 shrink-0 text-brand" />
                <span className="font-semibold">{event.displayGregorianDate}</span>
                <span className="text-muted">•</span>
                <span className="font-semibold text-muted">{event.hijriDate} هـ</span>
              </div>
              <div className="flex items-center gap-2 text-ink/80">
                <Clock3 className="h-4 w-4 shrink-0 text-brand" />
                <span className="font-semibold">{formatEventTimeRange(event)}</span>
                <span className="text-muted">{formatEventDuration(event)}</span>
              </div>
              <div className="flex items-center gap-2 text-ink/80">
                {remote ? (
                  <MonitorSmartphone className="h-4 w-4 shrink-0 text-brand" />
                ) : (
                  <MapPin className="h-4 w-4 shrink-0 text-brand" />
                )}
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold",
                    remote
                      ? "border-brand/20 bg-brand/5 text-brand-deep"
                      : "border-sand bg-sand-pale text-brand-deep",
                  )}
                >
                  {event.execution === "حضوري" ? "حضوري وعن بُعد" : event.execution}
                </span>
              </div>
            </dl>

            {/* countdown / live / done */}
            <div className="mt-auto border-t border-dashed border-brand/15 pt-4">
              {/* العدّاد: يظهر قبل البداية (متبقي على بداية البرنامج) وأثناءها (متبقي على نهاية البرنامج) — بعد النهاية لا شيء */}
              {status !== "completed" && <Countdown event={event} now={now} />}
              {status === "live" && (
                <div className="flex items-center gap-3 rounded-2xl bg-brand/[0.06] px-4 py-3">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-soft-pulse rounded-full bg-brand" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-brand-deep">البرنامج منعقد الآن</p>
                    <p className="text-xs font-semibold text-muted">حتى الساعة {formatTime12h(event.endTime)}</p>
                  </div>
                </div>
              )}
              {status === "completed" && (
                <p className="text-xs font-bold text-stone-400">انتهى هذا البرنامج — نلقاكم في القادم</p>
              )}

              {/* صف الإجراءات: «التسجيل — Zoom — التقييم» بالترتيب الصحيح لواجهة RTL (يمين ← يسار)،
                  ثلاث خلايا متساوية تمامًا في العرض والارتفاع وبمسافات متساوية، وأيقونة كل زر بجانب نصه في سطر واحد بلا التفاف؛
                  الأزرار ظاهرة بألوانها الطبيعية وقابلة للضغط (لا disabled ولا opacity منخفضة ولا رمادي)،
                  وحالات «غير متاح الآن» تُعرض بنافذة الموقع نفسها (InstallModal) عند الضغط؛
                  بعد انتهاء البرنامج (نهاية مدته) يُخفى زرا «التسجيل» و«Zoom» فقط ويبقى زر «التقييم» ظاهرًا وملونًا بالشكل نفسه (قرار المشرفة 2026-10-31) */}
              <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2">
                {now < getEventEndDateTime(event) && (
                  <>
                  {/* التسجيل — اللون الأساسي للهوية دائمًا، وبنفس آلية التأكيد المعتمدة؛ عند إغلاق التسجيل (قبل النهاية بـ15 دقيقة) تفتح النافذة بالملاحظة المعتمدة */}
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    title={attendingOpen ? "فتح نافذة التسجيل" : "انتهى وقت التسجيل لهذا البرنامج"}
                    aria-label="التسجيل لهذا البرنامج"
                    className="flex h-9 w-full items-center justify-center gap-1 whitespace-nowrap rounded-xl bg-brand px-1.5 text-[11px] font-black text-white shadow-sm transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pale sm:gap-1.5 sm:px-3 sm:text-[13px]"
                  >
                    <ClipboardCheck className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
                    التسجيل
                  </button>

                  {/* Zoom — أزرق #2D8CFF بنص وأيقونة بيضاء دائمًا سواء حان موعد الدخول أم لا؛ قبل الإتاحة تفتح النافذة بالملاحظة المعتمدة، وداخل النافذة لوحة التحقق كما هي */}
                  {zoomUnlocked ? (
                    <a
                      href={event.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => sendZoomHit(String(event.id), "open")}
                      title="فتح قاعة اللقاء عبر Zoom"
                      aria-label="فتح قاعة اللقاء عبر Zoom"
                      style={{ backgroundColor: "#2D8CFF" }}
                      className="flex h-9 w-full items-center justify-center gap-1 whitespace-nowrap rounded-xl px-1.5 text-[11px] font-black text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D8CFF]/50 sm:gap-1.5 sm:px-3 sm:text-[13px]"
                    >
                      <Video className="h-3.5 w-3.5 shrink-0 text-white sm:h-4 sm:w-4" aria-hidden="true" />
                      Zoom
                    </a>
                  ) : zoomOpen ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (hasZoom) sendZoomHit(String(event.id), "press");
                        setZoomPanelOpen((v) => !v);
                        setZoomNote("");
                      }}
                      title="الدخول عبر Zoom — التحقق من التأكيد ثم فتح القاعة"
                      aria-label="الدخول عبر Zoom — فتح لوحة التحقق"
                      style={{ backgroundColor: "#2D8CFF" }}
                      className="flex h-9 w-full items-center justify-center gap-1 whitespace-nowrap rounded-xl px-1.5 text-[11px] font-black text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D8CFF]/50 sm:gap-1.5 sm:px-3 sm:text-[13px]"
                    >
                      <Video className="h-3.5 w-3.5 shrink-0 text-white sm:h-4 sm:w-4" aria-hidden="true" />
                      Zoom
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (hasZoom) sendZoomHit(String(event.id), "press");
                        setNotice({ title: "الدخول عبر Zoom", message: zoomNoteText ?? "" });
                      }}
                      title={zoomNoteText ?? undefined}
                      aria-label={`Zoom — ${zoomNoteText ?? ""}`}
                      style={{ backgroundColor: "#2D8CFF" }}
                      className="flex h-9 w-full items-center justify-center gap-1 whitespace-nowrap rounded-xl px-1.5 text-[11px] font-black text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D8CFF]/50 sm:gap-1.5 sm:px-3 sm:text-[13px]"
                    >
                      <Video className="h-3.5 w-3.5 shrink-0 text-white sm:h-4 sm:w-4" aria-hidden="true" />
                      Zoom
                    </button>
                  )}
                </>
              )}

                  {/* التقييم — الوردي المعتمد (rose.brand #DB949F) بنص وأيقونة بيضاء؛ يبقى ظاهرًا وملونًا وقابلًا للضغط في كل الحالات (قرار المشرفة 2026-10-31):
                      خلال نافذته (قبل نهاية البرنامج بـ15 دقيقة حتى بعد نهايته بـ60 دقيقة) ومع وجود رابطه يفتح النموذج مباشرة بتبويب جديد،
                      وقبل النافذة أو بالحالات بلا رابط تفتح نافذة «التقييم غير متاح حاليًا»، وبعد النافذة «انتهت فترة تقييم هذا البرنامج» — بلا disabled ولا تمييز لوني للإغلاق */}
                  {evaluationOpen ? (
                    <a
                      href={event.evaluationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="فتح نموذج تقييم هذا البرنامج"
                      aria-label="فتح نموذج تقييم هذا البرنامج"
                      className="flex h-9 w-full items-center justify-center gap-1 whitespace-nowrap rounded-xl bg-rose-brand px-1.5 text-[11px] font-black text-white transition-colors hover:bg-brand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-brand/40 sm:gap-1.5 sm:px-3 sm:text-[13px]"
                    >
                      <Star className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
                      التقييم
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setNotice({ title: "التقييم", message: evaluationNote })}
                      title={evaluationNote}
                      aria-label="التقييم"
                      className="flex h-9 w-full items-center justify-center gap-1 whitespace-nowrap rounded-xl bg-rose-brand px-1.5 text-[11px] font-black text-white transition-colors hover:bg-brand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-brand/40 sm:gap-1.5 sm:px-3 sm:text-[13px]"
                    >
                      <Star className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
                      التقييم
                    </button>
                  )}
                </div>

              {zoomOpen && !zoomUnlocked && zoomPanelOpen && (
                <div className="mt-2 rounded-2xl border border-sand bg-sand-pale/60 p-3">
                  <p className="text-[11px] font-bold leading-5 text-ink/75">
                    {attendingOpen
                      ? "للدخول: أكدي حضوركِ أولًا، أو تحقّقي برقم جوالكِ إن كنتِ أكدتِ في جلسة سابقة."
                      : "انتهى وقت التأكيد — إن كنتِ أكدتِ حضوركِ من قبل فتحقّقي برقم جوالكِ للدخول."}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="tel"
                      dir="ltr"
                      inputMode="tel"
                      maxLength={20}
                      value={zoomPhone}
                      onChange={(e) => setZoomPhone(e.target.value)}
                      placeholder="05XXXXXXXX"
                      aria-label="رقم الجوال للتحقق من تأكيد الحضور"
                      className="w-full rounded-xl border border-sand bg-white px-3 py-2 text-left text-sm font-semibold text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-pale"
                    />
                    <button
                      type="button"
                      onClick={handleZoomCheck}
                      disabled={zoomChecking}
                      className="shrink-0 rounded-xl bg-brand px-4 py-2 text-sm font-black text-white transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {zoomChecking ? "جارٍ التحقق…" : "تحقّقي"}
                    </button>
                  </div>
                  {attendingOpen && (
                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-brand/40 bg-white px-3 py-2 text-[13px] font-extrabold text-brand-deep transition-colors hover:bg-sand-pale"
                    >
                      <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                      تأكيد الحضور الآن
                    </button>
                  )}
                  {zoomNote && (
                    <p
                      role="alert"
                      className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold leading-5 text-amber-800"
                    >
                      {zoomNote}
                    </p>
                  )}
                  <p className="mt-2 text-[10px] font-semibold text-muted">
                    التحقق لفتح الدخول فقط ولا يُسجل حضورًا فعليًا عند فتح القاعة.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* نافذة التأكيد — تُرسم على مستوى الصفحة عبر Portal لتجاوز قصّ البطاقة */}
      <AttendanceConfirm event={event} now={now} open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* نافذة الملاحظة الموحّدة (نفس مكوّن نوافذ الموقع) — عبر Portal لتجاوز قصّ البطاقة */}
      {notice !== null &&
        createPortal(
          <InstallModal open title={notice.title} onClose={() => setNotice(null)}>
            <p className="px-1 py-5 text-center text-sm font-bold leading-7 text-ink">{notice.message}</p>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="w-full rounded-2xl bg-brand px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pale"
            >
              حسنًا
            </button>
          </InstallModal>,
          document.body,
        )}
    </article>
  );
}
