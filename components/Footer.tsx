const basePath = process.env.PAGES_BASE_PATH || "";

export default function Footer() {
  return (
    <footer className="mt-14 bg-brand-deep text-white">
      <div className="mx-auto max-w-6xl px-5 py-10 text-center sm:px-8">
        <img
          src={`${basePath}/logos-footer.png`}
          alt="شعارات مبادرة نون متحد وجمعية علم الحج"
          width={3163}
          height={249}
          loading="eager"
          decoding="sync"
          className="mx-auto h-auto w-full max-w-2xl"
        />
        <p className="mt-5 text-[11px] font-semibold text-white/60 sm:text-xs">
          الحقوق محفوظة - مريم كريم - حلول رقمية للأعمال
        </p>
      </div>
    </footer>
  );
}
