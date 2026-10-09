export default function Footer() {
  return (
    <footer className="mt-14 bg-brand-deep text-white">
      <div className="mx-auto max-w-6xl px-5 py-10 text-center sm:px-8">
        <div className="mx-auto mb-4 h-px w-24 bg-gradient-to-l from-transparent via-rose-brand to-transparent" />
        <p className="text-base font-black sm:text-lg">مبادرة نون متحد × جمعية علم الحج</p>
        <p className="mt-2 text-xs font-semibold text-white/70 sm:text-sm">
          مراس أثر الموسم — 1448هـ | 2026 - 2027م
        </p>
        <p className="mt-1 text-[11px] font-semibold text-white/50">
          جميع البرامج من 5:00 إلى 8:00 مساءً بتوقيت الرياض (Asia/Riyadh)
        </p>
      </div>
    </footer>
  );
}
