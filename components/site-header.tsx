import { BrandMark } from "@/components/brand-mark";

export function SiteHeader() {
  return (
    <header className="print-hidden sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 py-2 sm:px-8">
        <a className="flex min-w-0 items-center gap-3" href="#top">
          <BrandMark />
          <div className="min-w-0 leading-[1.18]">
            <p className="whitespace-nowrap text-base font-black tracking-[-0.01em] text-slate-950">
              CareerLens AI
            </p>
            <p className="mt-0.5 whitespace-nowrap text-xs font-semibold text-slate-500">
              Portfolio Review
            </p>
          </div>
        </a>
        <a
          className="inline-flex min-h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 text-[13px] font-extrabold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
          href="#analyze"
        >
          분석 시작
        </a>
      </div>
    </header>
  );
}
