import {
  ArrowDown,
  BadgeCheck,
  ClipboardList,
  MessageSquareText,
  ScanSearch,
  Sparkles,
} from "lucide-react";

const highlights = [
  {
    icon: ScanSearch,
    title: "채용자 관점 분석",
    text: "첫인상, 직무 적합도, 전달력을 기준으로 평가합니다.",
  },
  {
    icon: ClipboardList,
    title: "포트폴리오·자기소개서 동시 리뷰",
    text: "URL과 설명을 함께 보고 핵심 메시지를 정리합니다.",
  },
  {
    icon: MessageSquareText,
    title: "개선 문구·면접 질문 자동 생성",
    text: "수정 문장과 면접 준비 질문을 함께 정리합니다.",
  },
];

export function HeroSection() {
  return (
    <section
      className="print-hidden relative overflow-hidden border-b border-slate-200 bg-white"
      id="top"
    >
      <div className="hero-grid absolute inset-0 opacity-80" />

      <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.04fr_0.96fr] lg:py-24">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-[13px] font-extrabold text-blue-700">
            <Sparkles className="size-3.5" />
            PORTFOLIO REVIEW
          </div>
          <h1 className="max-w-3xl text-[2.45rem] font-black leading-[1.12] tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-[3.75rem]">
            지원 내용을 한눈에 정리하는
            <br />
            <span className="text-blue-600">포트폴리오 분석 도구</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            CareerLens AI는 포트폴리오와 자기소개서를 바탕으로 총점, 강점,
            보완점, 개선 문구, 면접 질문을 정리합니다.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {highlights.map(({ icon: Icon, title, text }) => (
              <div
                className="flex min-h-36 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60"
                key={title}
              >
                <div className="flex size-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon className="size-4" />
                </div>
                <p className="mt-3 text-sm font-extrabold text-slate-950">
                  {title}
                </p>
                <p className="mt-1 text-[13px] leading-6 text-slate-500">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-extrabold text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-blue-600"
              href="#analyze"
            >
              분석 시작하기
              <ArrowDown className="size-4" />
            </a>
            <div className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-slate-600">
              <BadgeCheck className="size-4 text-blue-600" />
              결과를 카드 형태로 정리
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70 sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-[13px] font-extrabold tracking-[0.12em] text-blue-600">
                  LIVE PREVIEW
                </p>
                <p className="mt-1 font-extrabold text-slate-950">
                  프론트엔드 포트폴리오 분석
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <ScanSearch className="size-5" />
              </div>
            </div>

            <div className="mt-4 rounded-3xl bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-extrabold tracking-[0.1em] text-blue-300">
                  TOTAL SCORE
                </p>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-extrabold text-emerald-200">
                  우수
                </span>
              </div>
              <div className="mt-5 flex items-end gap-2">
                <p className="text-6xl font-black tracking-[-0.07em]">84</p>
                <span className="pb-2 text-sm font-bold text-slate-400">
                  /100
                </span>
              </div>
              <p className="mt-4 text-[15px] leading-7 text-slate-300">
                기술 경험은 충분하며, 프로젝트 성과와 역할을 더 앞에 배치하면
                설득력이 높아집니다.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
              {[
                ["첫인상", "84"],
                ["기술력", "78"],
                ["직무 적합도", "86"],
              ].map(([label, score]) => (
                <div
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5"
                  key={label}
                >
                  <p className="text-[13px] font-extrabold text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
                    {score}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm shadow-blue-100/60">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-extrabold tracking-[0.1em] text-blue-700">
                  TOP PRIORITY
                </p>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-blue-700">
                  01
                </span>
              </div>
              <p className="mt-3 text-base font-extrabold text-slate-950">
                대표 프로젝트 설명 강화
              </p>
              <p className="mt-2 text-[15px] leading-7 text-slate-600">
                문제, 역할, 성과 순서로 설명을 재구성하세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
