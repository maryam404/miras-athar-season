"use client";

import { useId } from "react";
import { CalendarDays, ChevronDown, Clock3, MapPin, MonitorSmartphone, Sparkles } from "lucide-react";
import type { SeasonEvent } from "@/data/events";
import { formatEventDuration, formatEventTimeRange, formatTime12h, getEventStatus } from "@/lib/datetime";
import { cn } from "@/lib/cn";
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
        title={pinned ? "بطاقة أقرب برنامج قادم — مثبتة مفتوحة دائمًا" : undefined}
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
                  {event.execution}
                </span>
              </div>
            </dl>

            {/* countdown / live / done */}
            <div className="mt-auto border-t border-dashed border-brand/15 pt-4">
              {status === "upcoming" && <Countdown event={event} now={now} />}
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
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
