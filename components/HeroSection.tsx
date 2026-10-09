import { formatRiyadhNow } from "@/lib/datetime";

export default function HeroSection({ now }: { now: number }) {
  return (
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

      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-12 text-center sm:px-8 sm:pb-24 sm:pt-16">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-brand" />
          مبادرة نون متحد × جمعية علم الحج
        </div>

        <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl sm:leading-[1.25]">
          مراس أثر الموسم
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-8 text-white/80 sm:text-lg sm:leading-10">
          برامج وفعاليات مبادرة نون متحد 1448هـ - 2026 - 2027م
          <br className="hidden sm:block" />
          بالشراكة مع جمعية علم الحج
        </p>

        <div className="mx-auto mt-7 flex max-w-xl flex-wrap items-center justify-center gap-2.5 text-[12px] font-bold">
          <span className="rounded-full bg-white/10 px-4 py-1.5 backdrop-blur border border-white/15">
            18 برنامجًا وفعالية
          </span>
          <span className="rounded-full bg-white/10 px-4 py-1.5 backdrop-blur border border-white/15">
            5:00 - 8:00 مساءً بتوقيت الرياض
          </span>
          <span className="rounded-full bg-rose-brand/90 px-4 py-1.5 text-white">
            {formatRiyadhNow(now)}
          </span>
        </div>
      </div>
    </header>
  );
}
