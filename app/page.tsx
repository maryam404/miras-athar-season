"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { SEASON_EVENTS } from "@/data/events";
import {
  getEventEndDateTime,
  getEventStartDateTime,
  getEventStatus,
  getNearestUpcomingEventId,
  getSeasonStats,
  sortCompletedEvents,
  sortLiveEvents,
  sortUpcomingEvents,
} from "@/lib/datetime";
import { useNow } from "@/lib/hooks";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsCards from "@/components/StatsCards";
import Filters, { type ExecutionFilter, type StatusFilter } from "@/components/Filters";
import LiveEventSection from "@/components/LiveEventSection";
import NearestEventSection from "@/components/NearestEventSection";
import UpcomingEvents from "@/components/UpcomingEvents";
import CompletedEvents from "@/components/CompletedEvents";
import Footer from "@/components/Footer";

/** مدة بقاء البرنامج مثبتًا تحت «جاري الآن» بعد نهايته (نصف ساعة). */
const LIVE_HOLD_GRACE_MS = 30 * 60 * 1000;

export default function HomePage() {
  const now = useNow(1000);
  const [execution, setExecution] = useState<ExecutionFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const stats = useMemo(() => getSeasonStats(now), [now]);

  // بطاقة أقرب برنامج قادم + حالة الطي/التوسع حسب نمط العرض
  const nearestUpcomingId = useMemo(() => getNearestUpcomingEventId(now), [now]);
  const isDefaultView = execution === "all" && statusFilter === "all";
  const [openId, setOpenId] = useState<number | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<ReadonlySet<number>>(new Set());

  // الوضع الافتراضي: أكورديون بطاقة إضافية واحدة — وضع الفرز: بطاقات مفتوحة بتفاصيلها وطي مستقل
  // عند تبديل نمط العرض (افتراضي/فرز) تُصفَّر حالات الطي لضمان سلوك متوقع
  useEffect(() => {
    setOpenId(null);
    setCollapsedIds(new Set());
  }, [isDefaultView]);

  const isOpen = useCallback(
    (id: number) => (isDefaultView ? openId === id : !collapsedIds.has(id)),
    [isDefaultView, openId, collapsedIds],
  );
  const toggleCard = useCallback(
    (id: number) => {
      if (isDefaultView) {
        setOpenId((current) => (current === id ? null : id));
      } else {
        setCollapsedIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      }
    },
    [isDefaultView],
  );

  // بطاقة البرنامج الأقرب موعدًا (تُعرض مفتوحة في قسمها الخاص أعلى القائمة)
  const nearestEvent = useMemo(
    () => (nearestUpcomingId === null ? null : SEASON_EVENTS.find((e) => e.id === nearestUpcomingId) ?? null),
    [nearestUpcomingId],
  );

  const filtered = useMemo(() => {
    // فرز «الأقرب موعدًا»: يعرض البرنامج الأقرب دائمًا بغض النظر عن فرز التنفيذ
    if (statusFilter === "nearest") {
      return nearestUpcomingId === null ? [] : SEASON_EVENTS.filter((e) => e.id === nearestUpcomingId);
    }
    return SEASON_EVENTS.filter((e) => {
      if (statusFilter !== "all" && getEventStatus(e, now) !== statusFilter) return false;
      return true;
    }).filter((e) => execution === "all" || e.execution === execution);
  }, [execution, statusFilter, now, nearestUpcomingId]);

  const live = useMemo(
    () => sortLiveEvents(filtered, now),
    [filtered, now],
  );

  // التثبيت المرن: يبقى البرنامج مثبتًا تحت «جاري الآن» حتى نصف ساعة بعد نهايته،
  // وتُخفى بطاقة الأقرب موعدًا أثناء إقامة البرنامج وتعود أسفل القسم المثبت خلال فترة السماح
  const { holdEvents, anyGrace } = useMemo(() => {
    const liveList = sortLiveEvents(filtered, now);
    const graceList = filtered.filter(
      (e) => getEventStatus(e, now) === "completed" && now - getEventEndDateTime(e) < LIVE_HOLD_GRACE_MS,
    );
    const hold =
      graceList.length > 0
        ? [...liveList, ...graceList].sort((a, b) => getEventStartDateTime(a) - getEventStartDateTime(b))
        : liveList;
    return { holdEvents: hold, anyGrace: graceList.length > 0 };
  }, [filtered, now]);

  const upcoming = useMemo(
    // في وضع الكل/اللل تُستبعد بطاقة الأقرب من القائمة لأن قسمها المثبت يعرضها (بلا تكرار)
    () => sortUpcomingEvents(filtered, now).filter((e) => !(isDefaultView && e.id === nearestUpcomingId)),
    [filtered, now, isDefaultView, nearestUpcomingId],
  );
  const completed = useMemo(
    () =>
      sortCompletedEvents(filtered, now).filter(
        (e) =>
          !(
            isDefaultView &&
            getEventStatus(e, now) === "completed" &&
            now - getEventEndDateTime(e) < LIVE_HOLD_GRACE_MS
          ),
      ),
    [filtered, now, isDefaultView],
  );

  return (
    <main className="min-h-screen bg-sand-cream pb-0 pt-14">
      <Navbar />
      <HeroSection now={now} />
      <StatsCards stats={stats} />
      <Filters
        execution={execution}
        status={statusFilter}
        onExecution={setExecution}
        onStatus={setStatusFilter}
        shown={filtered.length}
        total={SEASON_EVENTS.length}
      />

      {/* إظهار القسم المطابق للفرز فقط — والبقية تُخفى كليًّا (بدون رسائل فراغ) */}
      {(isDefaultView || statusFilter === "live") && (
        <LiveEventSection
          events={isDefaultView ? holdEvents : live}
          now={now}
          isOpen={isOpen}
          onToggle={toggleCard}
          pinned={isDefaultView}
        />
      )}
      {isDefaultView && nearestEvent && !(holdEvents.length > 0 && !anyGrace) && (
        <NearestEventSection event={nearestEvent} now={now} />
      )}
      {(isDefaultView || statusFilter === "all" || statusFilter === "upcoming" || statusFilter === "nearest") && (
        <UpcomingEvents
          events={upcoming}
          now={now}
          pinnedId={nearestUpcomingId}
          isOpen={isOpen}
          onToggle={toggleCard}
        />
      )}
      {(isDefaultView || statusFilter === "completed") && (
        <CompletedEvents events={completed} now={now} isOpen={isOpen} onToggle={toggleCard} />
      )}

      <Footer />
    </main>
  );
}
