import {
  Bot,
  ClipboardCheck,
  Code2,
  Database,
  FileText,
  Gauge,
  Layers3,
  MessageSquareText,
  MonitorSmartphone,
  Server,
} from "lucide-react";

const stack = [
  "Next.js",
  "TypeScript",
  "OpenAI API",
  "Supabase",
  "Tailwind CSS",
  "Vercel",
];

const features = [
  {
    icon: Bot,
    title: "직무별 포트폴리오 분석",
  },
  {
    icon: ClipboardCheck,
    title: "샘플 결과 확인",
  },
  {
    icon: FileText,
    title: "피드백 복사",
  },
  {
    icon: MessageSquareText,
    title: "면접 질문과 답변",
  },
  {
    icon: Gauge,
    title: "점수 대시보드",
  },
  {
    icon: MonitorSmartphone,
    title: "반응형 화면",
  },
];

const stackIcons = [Code2, Server, Bot, Database, Layers3, MonitorSmartphone];

export function ProjectStackSection() {
  return (
    <section className="print-hidden border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1320px] gap-5 px-5 py-10 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-extrabold tracking-[0.14em] text-blue-600">
            TECH STACK
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-slate-950">
            사용 기술
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {stack.map((item, index) => {
              const Icon = stackIcons[index] ?? Code2;

              return (
                <span
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-extrabold text-slate-700"
                  key={item}
                >
                  <Icon className="size-4 text-blue-600" />
                  {item}
                </span>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-extrabold tracking-[0.14em] text-blue-600">
            주요 기능
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title }) => (
              <div
                className="flex min-h-20 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60"
                key={title}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon className="size-4" />
                </div>
                <p className="text-sm font-extrabold leading-6 text-slate-800">
                  {title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
