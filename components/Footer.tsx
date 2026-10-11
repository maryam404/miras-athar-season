import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-14 bg-brand-deep text-white">
      <div className="mx-auto max-w-6xl px-5 py-10 text-center sm:px-8">
        <Image
          src="/logos.png"
          alt="شعارات مبادرة نون متحد وجمعية علم الحج"
          width={3163}
          height={249}
          className="mx-auto h-auto w-full max-w-2xl"
          unoptimized
        />
        <p className="mt-5 text-[11px] font-semibold text-white/60 sm:text-xs">
          الحقوق محفوظة - مريم كريم - حلول رقمية للأعمال
        </p>
      </div>
    </footer>
  );
}
