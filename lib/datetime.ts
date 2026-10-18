import { SEASON_EVENTS, type EventStatus, type SeasonEvent } from "@/data/events";

/**
 * All date logic is anchored to Asia/Riyadh wall-clock, never the visitor device.
 * Riyadh observes UTC+3 year-round (no DST), so an event day at 17:00 Riyadh
 * is exactly 14:00 UTC, and 20:00 Riyadh is 17:00 UTC.
 */

const RIYADH_OFFSET_MINUTES = 3 * 60;

function parseHM(hm: string): { h: number; m: number } {
  const [h, m] = hm.split(":").map(Number);
  return { h, m };
}

function dayParts(isoDate: string): { y: number; mo: number; d: number } {
  const [y, mo, d] = isoDate.split("-").map(Number);
  return { y, mo, d };
}

/** Start timestamp (ms) in UTC, derived from the event date + startTime (Asia/Riyadh wall-clock). */
export function getEventStartDateTime(event: SeasonEvent): number {
  const { y, mo, d } = dayParts(event.gregorianDate);
  const { h, m } = parseHM(event.startTime);
  return Date.UTC(y, mo - 1, d, h, m) - RIYADH_OFFSET_MINUTES * 60_000;
}

/** End timestamp (ms) in UTC, derived from the event date + endTime (Asia/Riyadh wall-clock). */
export function getEventEndDateTime(event: SeasonEvent): number {
  const { y, mo, d } = dayParts(event.gregorianDate);
  const { h, m } = parseHM(event.endTime);
  return Date.UTC(y, mo - 1, d, h, m) - RIYADH_OFFSET_MINUTES * 60_000;
}

/**
 * Status rule (Asia/Riyadh), driven by each event's own startTime/endTime:
 *  before start on event day  -> upcoming
 *  start (inclusive) .. end (exclusive) -> live
 *  end and later -> completed
 */
export function getEventStatus(
  event: SeasonEvent,
  nowMs: number = Date.now(),
): EventStatus {
  const start = getEventStartDateTime(event);
  const end = getEventEndDateTime(event);
  if (nowMs < start) return "upcoming";
  if (nowMs < end) return "live";
  return "completed";
}

export interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOverdue: boolean;
}

/** Live countdown to the event start. Never returns negatives. */
export function getTimeRemaining(
  event: SeasonEvent,
  nowMs: number = Date.now(),
): TimeRemaining {
  const start = getEventStartDateTime(event);
  const diff = Math.max(0, start - nowMs);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { totalMs: diff, days, hours, minutes, seconds, isOverdue: start - nowMs <= 0 };
}

export function withStatus(nowMs: number = Date.now()) {
  return SEASON_EVENTS.map((event) => ({
    event,
    status: getEventStatus(event, nowMs),
    start: getEventStartDateTime(event),
    end: getEventEndDateTime(event),
  }));
}

export function sortUpcomingEvents(
  events: SeasonEvent[] = SEASON_EVENTS,
  nowMs: number = Date.now(),
): SeasonEvent[] {
  return events
    .filter((e) => getEventStatus(e, nowMs) === "upcoming")
    .sort((a, b) => getEventStartDateTime(a) - getEventStartDateTime(b));
}

export function sortLiveEvents(
  events: SeasonEvent[] = SEASON_EVENTS,
  nowMs: number = Date.now(),
): SeasonEvent[] {
  return events
    .filter((e) => getEventStatus(e, nowMs) === "live")
    .sort((a, b) => getEventStartDateTime(a) - getEventStartDateTime(b));
}

export function sortCompletedEvents(
  events: SeasonEvent[] = SEASON_EVENTS,
  nowMs: number = Date.now(),
): SeasonEvent[] {
  return events
    .filter((e) => getEventStatus(e, nowMs) === "completed")
    .sort((a, b) => getEventEndDateTime(b) - getEventEndDateTime(a));
}

export interface SeasonStats {
  totalEvents: number;
  completedEvents: number;
  upcomingEvents: number;
  liveEvents: number;
}

export function getSeasonStats(nowMs: number = Date.now()): SeasonStats {
  let completedEvents = 0;
  let upcomingEvents = 0;
  let liveEvents = 0;
  for (const e of SEASON_EVENTS) {
    const s = getEventStatus(e, nowMs);
    if (s === "completed") completedEvents += 1;
    else if (s === "upcoming") upcomingEvents += 1;
    else liveEvents += 1;
  }
  return {
    totalEvents: SEASON_EVENTS.length,
    completedEvents,
    upcomingEvents,
    liveEvents,
  };
}

/** Current wall-clock time in Riyadh, formatted for display. */
export function formatRiyadhNow(nowMs: number = Date.now()): string {
  try {
    return new Intl.DateTimeFormat("ar-SA", {
      timeZone: "Asia/Riyadh",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(nowMs));
  } catch {
    return new Date(nowMs).toLocaleString("ar-SA");
  }
}

export const STATUS_LABEL: Record<EventStatus, string> = {
  upcoming: "قادم",
  live: "جاري الآن",
  completed: "منتهي",
};

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

export function formatTime12h(hm: string): string {
  const { h, m } = parseHM(hm);
  const period = h < 12 ? "صباحًا" : "مساءً";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad2(m)} ${period}`;
}

export function formatEventTimeRange(event: SeasonEvent): string {
  return `${formatTime12h(event.startTime)} - ${formatTime12h(event.endTime)}`;
}

export function formatEventDuration(event: SeasonEvent): string {
  const s = parseHM(event.startTime);
  const e = parseHM(event.endTime);
  const hours = Math.round((e.h * 60 + e.m - (s.h * 60 + s.m)) / 60);
  return `(${hours} ساعات)`;
}
