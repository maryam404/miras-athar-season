"use client";

import { CalendarDays, Clock3, MapPin, MonitorSmartphone, Sparkles } from "lucide-react";
import type { SeasonEvent } from "@/data/events";
import { getEventStatus } from "@/lib/datetime";
import { cn } from "@/lib/cn";
import Countdown from "./Countdown";
import EventStatusBadge from "./EventStatusBadge";

interface Props {
  event: SeasonEvent;
  now: number;
  isNext?: boolean;
  index?: number;
}

export default function EventCard({ event, now, isNext = false, index = 0 }: Props) {
  const status = getEventStatus(event, now);
  const remote = event.execution === "عن بُعد";

  return (
    <article
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
      className={cn(
        "group flex animate-fade-up flex-col overflow-hidden rounded-3xl border bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover",
        status === "live" && "border-brand/40 shadow-live",
        status === "completed" && "border-stone-200/80 opacity-[0.92]",
        isNext && status === "upcoming" && "border-rose-brand/60 shadow-glow",
      )}
    >
      <div
        className={cn(
          "h-1.5 w-full",
          status === "live"
            ? "bg-gradient-to-l from-brand-deep via-brand to-rose-brand"
            : status === "completed"
              ? "bg-stone-200"
              : isNext
                ? "bg-gradient-to-l from-rose-brand via-rose-brand/70 to-sand"
                : "bg-gradient-to-l from-brand/70 via-brand/30 to-sand-light",
        )}
      />
      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-sand-pale px-3 py-1 text-[11px] font-bold text-brand-deep">
            {event.type}
          </span>
          <EventStatusBadge status={status} pulse />
          {isNext && status === "upcoming" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-brand/50 bg-rose-pale px-3 py-1 text-[11px] font-extrabold text-brand-deep">
              <Sparkles className="h-3.5 w-3.5" />
              البرنامج القادم
            </span>
          )}
        </div>

        <h3 className="text-[17px] font-extrabold leading-8 text-ink sm:text-lg">
          {event.title}
        </h3>

        <dl className="grid grid-cols-1 gap-2.5 text-[13px]">
          <div className="flex items-center gap-2 text-ink/80">
            <CalendarDays className="h-4 w-4 shrink-0 text-brand" />
            <span className="font-semibold">{event.displayGregorianDate}</span>
            <span className="text-muted">•</span>
            <span className="font-semibold text-muted">{event.hijriDate} هـ</span>
          </div>
          <div className="flex items-center gap-2 text-ink/80">
            <Clock3 className="h-4 w-4 shrink-0 text-brand" />
            <span className="font-semibold">5:00 مساءً - 8:00 مساءً</span>
            <span className="text-muted">(3 ساعات)</span>
          </div>
          <div className="flex items-center gap-2">
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
            <span className="text-xs text-muted">توقيت الرياض</span>
          </div>
        </dl>

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
                <p className="text-xs font-semibold text-muted">حتى الساعة 8:00 مساءً بتوقيت الرياض</p>
              </div>
            </div>
          )}
          {status === "completed" && (
            <p className="text-xs font-bold text-stone-400">انتهى هذا البرنامج — نلقاكم في القادم</p>
          )}
        </div>
      </div>
    </article>
  );
}
