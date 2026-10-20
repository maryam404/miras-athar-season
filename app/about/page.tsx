"use client";

import Link from "next/link";
import {
  BadgeCheck,
  BookOpen,
  Compass,
  GraduationCap,
  Lightbulb,
  MessagesSquare,
  Mountain,
  Network,
  Sparkles,
  Speech,
  Sprout,
  UsersRound,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { handicrafts } from "@/app/fonts";

const GOALS = [
  {
    title: "تطوير القدرات المهنية",
    desc: "تنمية مهارات العاملات في الأقسام النسائية بشركات حجاج الداخل",
    Icon: GraduationCap,
  },
  {
    title: "إثراء المعرفة",
    desc: "تعزيز المعرفة المهنية المرتبطة بالعمل الموسمي وخدمة ضيوف الرحمن",
    Icon: BookOpen,
  },
  {
    title: "تبادل الخبرات",
    desc: "إتاحة مساحات لتبادل التجارب والممارسات المهنية",
    Icon: MessagesSquare,
  },
  {
    title: "تعزيز التكامل",
    desc: "دعم التواصل والتعاون والعمل الجماعي بين الفرق",
    Icon: Network,
  },
  {
    title: "تحسين جودة الخدمات",
    desc: "المساهمة في تطوير تجربة ضيوف الرحمن والارتقاء بجودة الخدمات",
    Icon: BadgeCheck,
  },
  {
    title: "استدامة الأثر",
    desc: "تعزيز استمرار الاستفادة من المعرفة والخبرات بعد انتهاء الموسم",
    Icon: Sprout,
  },
] as const;

const FIELDS = [
  { title: "القيادة الميدانية", num: "٠١", Icon: Compass },
  { title: "الابتكار والتطوير", num: "٠٢", Icon: Lightbulb },
  { title: "جودة الخدمات", num: "٠٣", Icon: Sparkles },
  { title: "التواصل الفعال", num: "٠٤", Icon: Speech },
  { title: "تحديات العمل الموسمي", num: "٠٥", Icon: Mountain },
  { title: "العمل الجماعي وتبادل الخبرات", num: "٠٦", Icon: UsersRound },
] as const;

export default function AboutPage() {
  return (
    <main className={`min-h-screen bg-sand-cream pt-14 ${handicrafts.variable}`}>
      <Navbar />

      {/* Hero Section */}
      <header className="relative overflow-hidden bg-brand-deep text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-rose-brand/25 blur-3xl" />
          <div className="absolute top-10 right-[12%] h-40 w-40 rounded-full bg-sand/25 blur-2xl" />
          <div className="absolute -bottom-28 right-[30%] h-80 w-80 rounded-full bg-white/[0.06] blur-3xl" />
          <svg
            className="absolute inset-x-0 bottom-0 h-10 w-full text-sand-cream sm:h-14"
            viewBox="0 0 1440 56"
            preserveAspectRatio="none"
          >
            <path
              d="M0 56h1440V28C1200 52 960 8 720 24 480 40 240 52 0 20v36Z"
              fill="currentColor"
              opacity="0.9"
            />
          </svg>
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-16 text-center sm:px-8 sm:pb-32 sm:pt-24">
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl sm:leading-[1.25]">
            مراس أثر الموسم
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-8 text-white/80 sm:text-lg sm:leading-10">
            مبادرة نون متحد بالشراكة مع جمعية علم الحج لموسم 1448هـ - 2026 - 2027م
          </p>
        </div>
      </header>

      {/* نبذة عن المبادرة */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <h2 className="text-2xl font-black text-ink mb-8 sm:text-3xl">نبذة عن المبادرة</h2>
        <div className="rounded-3xl border border-brand/10 bg-white/70 p-8 shadow-card">
          <p className="mb-4 text-slate-700 leading-8">
            مبادرة نون متحد بالشراكة مع جمعية علم الحج لموسم 1448هـ - 2026 - 2027م.
          </p>
          <p className="text-slate-700 leading-8">
            تقدم المبادرة برامج وفعاليات متنوعة تهدف إلى تطوير قدرات العاملات في الأقسام النسائية بشركات حجاج الداخل، وتغطي مواضيع متنوعة تشمل القيادة الميدانية، والابتكار، وجودة الخدمات، والتواصل الفعال، والتحديات التي تواجه العمل الموسمي.
          </p>
        </div>
      </section>

      {/* أهداف المبادرة */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <h2 className="text-2xl font-black text-ink mb-8 sm:text-3xl">أهداف المبادرة</h2>
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GOALS.map(({ title, desc, Icon }) => (
            <li
              key={title}
              className="group rounded-3xl border border-brand/10 bg-white/70 p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:transform-none motion-reduce:hover:shadow-card"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-brand/15 bg-brand/[0.08] text-brand-deep transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none">
                <Icon className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-ink mb-2">{title}</h3>
              <p className="text-muted text-sm leading-6">{desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* البرامج والفعاليات */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <h2 className="text-2xl font-black text-ink mb-8 sm:text-3xl">البرامج والفعاليات</h2>
        <div className="rounded-3xl border border-brand/10 bg-white/70 p-8 shadow-card">
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {[
              "احتفال",
              "أمسية",
              "ندوة",
              "ورشة",
              "لقاء مفتوح",
              "نقل تجربة",
            ].map((label, idx) => (
              <span key={idx} className="inline-flex items-center rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-xs font-bold text-brand-deep">
                {label}
              </span>
            ))}
          </div>
          <h3 className="text-lg font-black text-ink mb-3">18 برنامجًا ولقاءً</h3>
          <p className="text-muted text-sm leading-6">
            تضم المبادرة 18 برنامجًا ولقاءً متنوعًا بين الورش التدريبية
            والندوات والأمسيات واللقاءات الحوارية والفعاليات الحضورية وعن بُعد،
            تتناول القيادة الميدانية، والابتكار، وجودة الخدمات، والتواصل
            الفعال، وتحديات العمل الموسمي؛ بما يسهم في تطوير الممارسات
            المهنية، واستدامة الأثر، والارتقاء بجودة الخدمات المقدمة لضيوف
            الرحمن.
          </p>
        </div>
      </section>

      {/* المجالات الرئيسية */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <h2 className="text-2xl font-black text-ink mb-8 sm:text-3xl">المجالات الرئيسية</h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {FIELDS.map(({ title, num, Icon }) => (
            <li
              key={num}
              className="group relative overflow-hidden rounded-3xl border border-brand/10 bg-gradient-to-bl from-white/90 via-rose-pale/70 to-sand-pale p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:transform-none motion-reduce:hover:shadow-card"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-rose-brand/15 blur-2xl opacity-50 transition-opacity duration-300 group-hover:opacity-90 motion-reduce:transition-none"
              />
              <div className="relative flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand/20 bg-white text-brand-deep shadow-sm transition-colors duration-300 group-hover:border-brand-dark group-hover:bg-brand group-hover:text-white motion-reduce:transition-none">
                  <Icon className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
                </span>
                <h3 className="min-h-14 text-base font-black leading-7 text-ink sm:text-lg">
                  {title}
                </h3>
              </div>
              <div className="relative mt-6 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-gradient-to-l from-transparent via-brand/25 to-brand/40"
                />
                <span
                  aria-hidden="true"
                  dir="ltr"
                  className="text-2xl font-black tabular-nums leading-none text-brand/25 transition-colors duration-300 group-hover:text-brand/45 motion-reduce:transition-none"
                >
                  {num}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 text-center">
        <div className="rounded-3xl border border-brand/20 bg-gradient-to-r from-brand-deep to-brand text-white p-8 sm:p-12 shadow-card">
          <h2 className="text-2xl font-black mb-4">اكتشفي برامج مِراس أثر الموسم</h2>
          <p className="mt-2 text-white/80 sm:text-sm max-w-lg mx-auto">
            تعرفي على البرامج واللقاءات القادمة ضمن المبادرة، واطّلعي على
            مواعيدها وتفاصيلها.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white text-brand-deep px-6 py-3 font-bold hover:bg-white/90 transition-all duration-300 shadow-card mt-8 sm:mt-10"
          >
            عرض جميع البرامج
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
