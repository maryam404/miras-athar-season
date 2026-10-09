export type ExecutionType = "حضوري" | "عن بُعد";
export type EventStatus = "upcoming" | "live" | "completed";

export interface SeasonEvent {
  id: number;
  title: string;
  type: string;
  hijriDate: string;
  gregorianDate: string;
  displayGregorianDate: string;
  startTime: string;
  endTime: string;
  execution: ExecutionType;
}

export const TIMEZONE = "Asia/Riyadh" as const;
export const SEASON_EVENTS: SeasonEvent[] = [
  { id: 1, title: "تعارف وعرض الخطة السنوية والبرامج", type: "احتفال", hijriDate: "1448/4/1", gregorianDate: "2026-09-12", displayGregorianDate: "12 سبتمبر 2026", startTime: "17:00", endTime: "20:00", execution: "حضوري" },
  { id: 2, title: "وطن يخدم هويتنا في خدمة ضيوف الرحمن", type: "احتفال", hijriDate: "1448/4/22", gregorianDate: "2026-10-03", displayGregorianDate: "3 أكتوبر 2026", startTime: "17:00", endTime: "20:00", execution: "حضوري" },
  { id: 3, title: "صوت الحاج - قراءة في تجربة ضيف الرحمن خلال الموسم", type: "أمسية", hijriDate: "1448/5/6", gregorianDate: "2026-10-17", displayGregorianDate: "17 أكتوبر 2026", startTime: "17:00", endTime: "20:00", execution: "عن بُعد" },
  { id: 4, title: "وحدة القيادة في فرق خدمة ضيوف الرحمن - دروس من الموسم", type: "ندوة", hijriDate: "1448/5/13", gregorianDate: "2026-10-24", displayGregorianDate: "24 أكتوبر 2026", startTime: "17:00", endTime: "20:00", execution: "حضوري" },
  { id: 5, title: "الرفق والاحتواء في المواقف الميدانية لخدمة ضيوف الرحمن", type: "أمسية", hijriDate: "1448/5/26", gregorianDate: "2026-11-07", displayGregorianDate: "7 نوفمبر 2026", startTime: "17:00", endTime: "20:00", execution: "حضوري" },
  { id: 6, title: "مبادرات صنعت أثراً في موسم الحج", type: "لقاء مفتوح", hijriDate: "1448/6/18", gregorianDate: "2026-11-28", displayGregorianDate: "28 نوفمبر 2026", startTime: "17:00", endTime: "20:00", execution: "حضوري" },
  { id: 7, title: "تكامل فرق العمل في موسم الحج", type: "ندوة", hijriDate: "1448/7/3", gregorianDate: "2026-12-12", displayGregorianDate: "12 ديسمبر 2026", startTime: "17:00", endTime: "20:00", execution: "حضوري" },
  { id: 8, title: "الشورى وصناعة القرار في فرق العمل الميدانية", type: "فعالية", hijriDate: "1448/7/17", gregorianDate: "2026-12-26", displayGregorianDate: "26 ديسمبر 2026", startTime: "17:00", endTime: "20:00", execution: "حضوري" },
  { id: 9, title: "ملتقى الخبرات في صناعة المبادرات المتميزة بشركات حجاج الداخل - الأقسام النسائية موسم 1448هـ", type: "نقل تجربة", hijriDate: "1448/7/24", gregorianDate: "2027-01-02", displayGregorianDate: "2 يناير 2027", startTime: "17:00", endTime: "20:00", execution: "حضوري" },
  { id: 10, title: "الابتكار والحلول والتحديات وفرص التحسين", type: "ندوة", hijriDate: "1448/8/8", gregorianDate: "2027-01-16", displayGregorianDate: "16 يناير 2027", startTime: "17:00", endTime: "20:00", execution: "حضوري" },
  { id: 11, title: "التواصل الفعال وأثره في جودة الخدمة خلال الموسم", type: "ندوة", hijriDate: "1448/8/22", gregorianDate: "2027-01-30", displayGregorianDate: "30 يناير 2027", startTime: "17:00", endTime: "20:00", execution: "عن بُعد" },
  { id: 12, title: "الإحسان قيمة مهنية في خدمة ضيوف الرحمن", type: "أمسية", hijriDate: "1448/9/6", gregorianDate: "2027-02-13", displayGregorianDate: "13 فبراير 2027", startTime: "17:00", endTime: "20:00", execution: "حضوري" },
  { id: 13, title: "عيد نون متحد - لقاء وإثراء", type: "احتفال", hijriDate: "1448/10/12", gregorianDate: "2027-03-20", displayGregorianDate: "20 مارس 2027", startTime: "17:00", endTime: "20:00", execution: "حضوري" },
  { id: 14, title: "لماذا تنهار فرق الموسم؟ تحديات بناء الفريق واستدامته", type: "ورشة", hijriDate: "1448/10/19", gregorianDate: "2027-03-27", displayGregorianDate: "27 مارس 2027", startTime: "17:00", endTime: "20:00", execution: "حضوري" },
  { id: 15, title: "القيادة الميدانية من منظور فريق التنفيذ", type: "ندوة", hijriDate: "1448/10/26", gregorianDate: "2027-04-03", displayGregorianDate: "3 أبريل 2027", startTime: "17:00", endTime: "20:00", execution: "عن بُعد" },
  { id: 16, title: "تطبيقات الذكاء الاصطناعي في تطوير خدمات الحج وتحسين تجربة المستفيد", type: "ورشة", hijriDate: "1448/11/3", gregorianDate: "2027-04-10", displayGregorianDate: "10 أبريل 2027", startTime: "17:00", endTime: "20:00", execution: "عن بُعد" },
  { id: 17, title: "إدارة الخلاف والمسؤولية تحت ضغط الموسم", type: "ندوة", hijriDate: "1448/11/10", gregorianDate: "2027-04-17", displayGregorianDate: "17 أبريل 2027", startTime: "17:00", endTime: "20:00", execution: "عن بُعد" },
  { id: 18, title: "جاهزية المرافق والخدمات في موسم الحج (تحديات وحلول)", type: "لقاء مفتوح", hijriDate: "1448/11/17", gregorianDate: "2027-04-24", displayGregorianDate: "24 أبريل 2027", startTime: "17:00", endTime: "20:00", execution: "عن بُعد" },
];
