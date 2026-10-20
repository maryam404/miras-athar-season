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
  { title: "القيادة الميدانية", Icon: Compass },
  { title: "الابتكار والتطوير", Icon: Lightbulb },
  { title: "تحديات العمل الموسمي", Icon: Mountain },
  { title: "التواصل الفعال", Icon: Speech },
  { title: "العمل الجماعي وتبادل الخبرات", Icon: UsersRound },
  { title: "جودة الخدمات", Icon: Sparkles },
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
        <ul className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {FIELDS.map(({ title, Icon }) => (
            <li
              key={title}
              className="flex h-full flex-col items-center rounded-3xl border border-brand/15 bg-white px-4 py-6 text-center shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-card-hover active:translate-y-0 active:scale-[0.98] sm:px-6 motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:active:transform-none"
            >
              <Icon
                className="h-10 w-10 text-brand sm:h-12 sm:w-12"
                strokeWidth={2}
                aria-hidden="true"
              />
              <h3 className="mt-3 text-sm font-bold leading-6 text-ink sm:mt-4 sm:text-base sm:leading-7">
                {title}
              </h3>
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
