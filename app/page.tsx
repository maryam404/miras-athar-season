"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-sand-cream pt-14">
      <Navbar />

      {/* Hero Section */}
      <header className="relative overflow-hidden bg-brand-deep text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-rose-brand/25 blur-3xl" />
          <div className="absolute top-10 right-[12%] h-40 w-40 rounded-full bg-sand/25 blur-2xl" />
          <div className="absolute -bottom-28 right-[30%] h-80 w-80 rounded-full bg-white/[0.06] blur-3xl" />
          <svg className="absolute inset-x-0 bottom-0 h-10 w-full text-sand-cream sm:h-14" viewBox="0 0 1440 56" preserveAspectRatio="none">
            <path d="M0 56h1440V28C1200 52 960 8 720 24 480 40 240 52 0 20v36Z" fill="currentColor" opacity="0.9" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { title: "تطوير القدرات المهنية", desc: "تنمية مهارات العاملات في الأقسام النسائية بشركات حجاج الداخل" },
            { title: "إثراء المعرفة", desc: "تعزيز المعرفة المهنية المرتبطة بالعمل الموسمي وخدمة ضيوف الرحمن" },
            { title: "تبادل الخبرات", desc: "إتاحة مساحات لتبادل التجارب والممارسات المهنية" },
            { title: "تعزيز التكامل", desc: "دعم التواصل والتعاون والعمل الجماعي بين الفرق" },
            { title: "تحسين جودة الخدمات", desc: "المساهمة في تطوير تجربة ضيوف الرحمن والارتقاء بجودة الخدمات" },
            { title: "استدامة الأثر", desc: "تعزيز استمرار الاستفادة من المعرفة والخبرات بعد انتهاء الموسم" },
          ].map((item, idx) => (
            <div key={idx} className="rounded-3xl border border-brand/10 bg-white/70 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 group hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/[0.1] text-brand-deep mb-4">
                ◆
              </div>
              <h3 className="text-lg font-bold text-ink mb-2">{item.title}</h3>
              <p className="text-muted text-sm leading-6">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* البرامج والفعاليات */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <h2 className="text-2xl font-black text-ink mb-8 sm:text-3xl">البرامج والفعاليات</h2>
        <div className="rounded-3xl border border-brand/10 bg-white/70 p-8 shadow-card">
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {["احتفال", "أمسية", "ندوة", "ورشة", "لقاء مفتوح", "نقل تجربة"].map((label, idx) => (
              <span key={idx} className="inline-flex items-center rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-xs font-bold text-brand-deep">
                {label}
              </span>
            ))}
          </div>
          <h3 className="text-lg font-black text-ink mb-3">18 برنامجًا ولقاءً</h3>
          <p className="text-muted text-sm leading-6">
            تضم المبادرة 18 برنامجًا ولقاءً متنوعًا بين الورش التدريبية والندوات والأمسيات واللقاءات الحوارية والفعاليات الحضورية وعن بُعد، تتناول القيادة الميدانية، والابتكار، وجودة الخدمات، والتواصل الفعال، وتحديات العمل الموسمي؛ بما يسهم في تطوير الممارسات المهنية، واستدامة الأثر، والارتقاء بجودة الخدمات المقدمة لضيوف الرحمن.
          </p>
        </div>
      </section>

      {/* المجالات الرئيسية */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <h2 className="text-2xl font-black text-ink mb-8 sm:text-3xl">المجالات الرئيسية</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {["القيادة الميدانية", "الابتكار والتطوير", "جودة الخدمات", "التواصل الفعال", "تحديات العمل الموسمي", "العمل الجماعي وتبادل الخبرات"].map((field, idx) => (
            <span key={idx} className="inline-flex items-center rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-xs font-bold text-brand-deep">{field}</span>
          ))}
        </div>
      </section>

      {/* الجهات القائمة */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <h2 className="text-2xl font-black text-ink mb-8 sm:text-3xl">الجهات القائمة والشراكة</h2>
        <div className="rounded-3xl border border-brand/10 bg-white/70 p-8 shadow-card flex flex-col sm:flex-row gap-6 items-center text-center sm:text-start">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/[0.1] text-brand-deep">◆</div>
            <div>
              <h3 className="font-bold text-lg text-ink">المجلس التنسيقي لمنشآت حجاج الداخل – نون متحد</h3>
              <p className="text-muted text-sm mt-1">الجهة الرئيسية المنظمة للمبادرة</p>
            </div>
          </div>
          <div className="w-full sm:w-auto sm:mt-0 border-t sm:border-t-0 sm:border-l border-brand/20 sm:px-6 pt-4 sm:pt-0"></div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/[0.1] text-brand-deep">◆</div>
            <div>
              <h3 className="font-bold text-lg text-ink">جمعية علم الحج</h3>
              <p className="text-muted text-sm mt-1">الشراكة في تنظيم وتنفيذ البرامج والفعاليات</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 text-center">
        <div className="rounded-3xl border border-brand/20 bg-gradient-to-r from-brand-deep to-brand text-white p-8 sm:p-12 shadow-card">
          <h2 className="text-2xl font-black mb-4">اكتشفي برامج مِراس أثر الموسم</h2>
          <p className="mt-2 text-white/80 sm:text-sm max-w-lg mx-auto">
            تعرفي على البرامج واللقاءات القادمة ضمن المبادرة، واطّلعي على مواعيدها وتفاصيلها.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-white text-brand-deep px-6 py-3 font-bold hover:bg-white/90 transition-all duration-300 shadow-card mt-8 sm:mt-10">عرض جميع البرامج</Link>
        </div>
      </section>
    </main>
  );
}
