import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { AnalysisResult } from "@/types";

export const dynamic = "force-dynamic";

type ReportRow = {
  id: string;
  role: string;
  portfolio_url: string | null;
  input_text: string;
  tech_stack: string;
  result_json: AnalysisResult;
  created_at: string;
};

type ReportPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    notFound();
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    notFound();
  }

  const { data, error } = await supabase
    .from("analyses")
    .select("id, role, portfolio_url, input_text, tech_stack, result_json, created_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const report = data as ReportRow;
  const result = report.result_json;
  const scoreValues = Object.values(result.scores);
  const average = Math.round(
    scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length,
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 min-[380px]:px-5 sm:px-8 sm:py-8">
      <article className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/80 min-[380px]:p-6 sm:p-10">
        <header className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark />
              <div>
                <p className="text-sm font-black text-slate-950">
                  CareerLens AI
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  Shared portfolio review report
                </p>
              </div>
            </div>
            <h1 className="mt-8 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
              {report.role} 지원 분석 리포트
            </h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
              {new Date(report.created_at).toLocaleString("ko-KR")} 저장됨
            </p>
          </div>
          <div className="rounded-3xl bg-slate-950 p-6 text-white">
            <p className="text-sm font-extrabold tracking-[0.1em] text-blue-300">
              TOTAL SCORE
            </p>
            <p className="mt-3 text-6xl font-black tracking-[-0.07em]">
              {average}
              <span className="ml-1 text-sm text-slate-400">/100</span>
            </p>
          </div>
        </header>

        <section className="grid gap-5 py-8 lg:grid-cols-2">
          <InfoCard title="포트폴리오 URL" value={report.portfolio_url || "입력 없음"} />
          <InfoCard title="기술 스택" value={report.tech_stack} />
        </section>

        <Section title="한 줄 총평">
          <p className="text-lg font-bold leading-8 text-slate-800">
            {result.overallComment}
          </p>
        </Section>

        <section className="grid gap-5 py-8 lg:grid-cols-2">
          <ListSection title="핵심 강점" items={result.strengths} />
          <ListSection title="보완할 점" items={result.weaknesses} />
        </section>

        <Section title="개선 우선순위 TOP 5">
          <div className="grid gap-3">
            {result.priorities.map((priority, index) => (
              <div
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                key={`${priority.title}-${index}`}
              >
                <p className="text-sm font-black text-blue-600">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-black text-slate-950">
                  {priority.title}
                </h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  이유: {priority.reason}
                </p>
                <p className="mt-3 rounded-xl bg-white px-4 py-3 text-sm font-bold leading-6 text-blue-700">
                  예시: {priority.action}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="개선된 프로젝트 설명">
          <p className="whitespace-pre-wrap rounded-2xl bg-blue-50 p-5 text-base font-semibold leading-8 text-slate-700">
            {result.improvedDescription}
          </p>
        </Section>

        <Section title="예상 면접 질문과 답변">
          <div className="grid gap-3 md:grid-cols-2">
            {result.interviewQuestions.map((question, index) => {
              const answer = getInterviewAnswer(result, question, index);

              return (
                <article
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                  key={`${question}-${index}`}
                >
                  <p className="text-xs font-black text-blue-600">
                    Q{index + 1}
                  </p>
                  <h3 className="mt-2 break-words text-sm font-black leading-6 text-slate-950">
                    {question}
                  </h3>
                  <p className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm font-semibold leading-7 text-slate-700">
                    {answer}
                  </p>
                </article>
              );
            })}
          </div>
        </Section>
      </article>
    </main>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-extrabold tracking-[0.12em] text-blue-600">
        {title}
      </p>
      <p className="mt-2 break-words text-sm font-bold leading-6 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function Section({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="border-t border-slate-200 py-8">
      <h2 className="mb-5 text-xl font-black tracking-[-0.02em] text-slate-950">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ListSection({ items, title }: { items: string[]; title: string }) {
  return (
    <Section title={title}>
      <ol className="grid gap-3">
        {items.map((item, index) => (
          <li
            className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold leading-7 text-slate-700"
            key={`${item}-${index}`}
          >
            <span className="mr-2 font-black text-blue-600">
              {String(index + 1).padStart(2, "0")}
            </span>
            {item}
          </li>
        ))}
      </ol>
    </Section>
  );
}

function getInterviewAnswer(
  result: AnalysisResult,
  question: string,
  index: number,
) {
  const answer = result.interviewAnswers?.[index]?.trim();

  if (answer) return answer;

  const priority = result.priorities[index % result.priorities.length];

  return [
    `이 질문에는 ${priority?.title ?? "프로젝트 개선 방향"}을 중심으로 답변하겠습니다.`,
    `질문의 핵심은 "${question}"이므로, 제가 맡은 역할과 구현 판단 근거를 먼저 설명하겠습니다.`,
    priority?.action
      ? `예시로는 ${priority.action}`
      : "마지막에는 사용한 기술, 문제 해결 과정, 개선 결과를 연결해서 말하겠습니다.",
  ].join(" ");
}
