"use client";

import { type ReactNode, useMemo, useState } from "react";
import {
  BadgeCheck,
  Check,
  ChevronDown,
  Clipboard,
  ExternalLink,
  FileQuestion,
  Gauge,
  MessageSquareText,
  Palette,
  Printer,
  RefreshCw,
  Save,
  Sparkles,
  Target,
  TriangleAlert,
} from "lucide-react";
import { getScoreStatus, ScoreCard } from "@/components/score-card";
import type { AnalysisInput, AnalysisResult } from "@/types";

type ResultsDashboardProps = {
  input: AnalysisInput;
  isDemoResult: boolean;
  result: AnalysisResult;
  storageEnabled: boolean;
};

const scoreCards = [
  {
    key: "firstImpression" as const,
    label: "첫인상",
    icon: Sparkles,
    description: "채용자가 30초 안에 확인하는 완성도와 정보 구조를 평가합니다.",
  },
  {
    key: "technicalSkill" as const,
    label: "기술력",
    icon: Gauge,
    description: "사용 기술, 구현 난이도, API/DB 활용 여부를 기준으로 평가합니다.",
  },
  {
    key: "communication" as const,
    label: "전달력",
    icon: MessageSquareText,
    description: "프로젝트 목적, 본인 역할, 문제 해결 과정이 명확한지 평가합니다.",
  },
  {
    key: "designQuality" as const,
    label: "디자인 완성도",
    icon: Palette,
    description: "레이아웃, 시각적 위계, 반응형 완성도를 평가합니다.",
  },
  {
    key: "roleFit" as const,
    label: "직무 적합도",
    icon: Target,
    description: "지원 직무와 프로젝트/기술 스택의 연결성을 평가합니다.",
  },
];

export function ResultsDashboard({
  input,
  isDemoResult,
  result,
  storageEnabled,
}: ResultsDashboardProps) {
  const [copiedTarget, setCopiedTarget] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [checkedPriorities, setCheckedPriorities] = useState<
    Record<number, boolean>
  >({});
  const [savedAnalysisId, setSavedAnalysisId] = useState("");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveMessage, setSaveMessage] = useState("");

  const average = Math.round(
    Object.values(result.scores).reduce((sum, score) => sum + score, 0) / 5,
  );
  const status = getScoreStatus(average);
  const completedPriorityCount = Object.values(checkedPriorities).filter(
    Boolean,
  ).length;
  const targetAverage = Math.min(100, average + 8);

  const summary = useMemo(() => {
    const sentences = splitSentences(result.overallComment);

    return {
      headline: sentences[0] || result.overallComment,
      judgments: sentences.slice(1, 4),
      actions: result.priorities.slice(0, 2).map((priority) => priority.action),
    };
  }, [result]);

  async function copyText(text: string, target: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTarget(target);
      setCopyMessage("");
      window.setTimeout(() => setCopiedTarget(""), 1800);
    } catch {
      setCopyMessage("복사에 실패했습니다. 브라우저 권한을 확인해주세요.");
      window.setTimeout(() => setCopyMessage(""), 2200);
    }
  }

  async function saveAnalysis() {
    if (!storageEnabled || saveStatus === "saving") return;

    setSaveStatus("saving");
    setSaveMessage("");

    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, result }),
      });
      const data = (await response.json()) as {
        id?: string;
        saved?: boolean;
        message?: string;
      };

      if (!response.ok || !data.saved) {
        throw new Error(data.message || "저장에 실패했습니다.");
      }

      setSaveStatus("saved");
      setSavedAnalysisId(data.id ?? "");
      setSaveMessage("분석 결과가 저장되었습니다.");
    } catch (error) {
      setSaveStatus("error");
      setSaveMessage(
        error instanceof Error
          ? error.message
          : "분석 결과를 저장하지 못했습니다.",
      );
    }
  }

  function buildFullCopyText() {
    return [
      "CareerLens AI 분석 결과",
      "",
      "[종합 점수]",
      `${average}점`,
      "",
      "[한 줄 총평]",
      summary.headline,
      "",
      "[핵심 강점]",
      "",
      ...result.strengths.map((item, index) => `${index + 1}. ${item}`),
      "",
      "[보완할 점]",
      "",
      ...result.weaknesses.map((item, index) => `${index + 1}. ${item}`),
      "",
      "[개선 우선순위 TOP 5]",
      "",
      ...result.priorities.map(
        (priority, index) =>
          `${index + 1}. ${priority.title}\n   이유: ${priority.reason}\n   예시: ${priority.action}`,
      ),
      "",
      "[개선된 프로젝트 설명]",
      result.improvedDescription,
      "",
      "[예상 면접 질문]",
      "",
      ...result.interviewQuestions.map(
        (question, index) =>
          `${index + 1}. ${question}\n   답변: ${getInterviewAnswer(result, question, index)}`,
      ),
    ].join("\n");
  }

  function printReport() {
    window.print();
  }

  function shareUrl() {
    if (!savedAnalysisId) return "";

    return `${window.location.origin}/report/${savedAnalysisId}`;
  }

  return (
    <section className="print-report scroll-mt-24" id="results">
      <div className="hidden print:block">
        <p className="text-sm font-extrabold tracking-[0.14em] text-blue-700">
          CareerLens AI
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">
          AI 포트폴리오 분석 리포트
        </h1>
      </div>
      <div className="mb-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[13px] font-extrabold tracking-[0.12em] text-blue-600">
              CAREER REVIEW RESULT
            </p>
            {isDemoResult ? (
              <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-extrabold text-blue-700">
                데모 결과
              </span>
            ) : null}
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">
            {input.role} 지원 분석 결과
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            핵심 요약을 먼저 확인하고, 필요한 세부 항목만 펼쳐보세요.
          </p>
        </div>

        <div className="print-hidden flex w-full flex-row flex-wrap items-center gap-2.5 lg:w-auto lg:justify-end">
          <button
            className="inline-flex min-h-11 min-w-[112px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 max-sm:w-full"
            onClick={() => copyText(buildFullCopyText(), "full-result")}
            type="button"
          >
            {copiedTarget === "full-result" ? (
              <Check className="size-4" />
            ) : (
              <Clipboard className="size-4" />
            )}
            {copiedTarget === "full-result" ? "복사 완료" : "결과 복사"}
          </button>
          {savedAnalysisId ? (
            <button
              className="inline-flex min-h-11 min-w-[118px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 max-sm:w-full"
              onClick={() => copyText(shareUrl(), "share-link")}
              type="button"
            >
              {copiedTarget === "share-link" ? (
                <Check className="size-4" />
              ) : (
                <ExternalLink className="size-4" />
              )}
              {copiedTarget === "share-link" ? "복사 완료" : "공유 링크"}
            </button>
          ) : null}
          <a
            className="inline-flex min-h-11 min-w-[112px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 max-sm:w-full"
            href="#analyze"
          >
            <RefreshCw className="size-4" />
            입력 수정
          </a>
          <a
            className="inline-flex min-h-11 min-w-[118px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 max-sm:w-full"
            href="#analyze"
          >
            <RefreshCw className="size-4" />
            다시 분석하기
          </a>
          <button
            className="inline-flex min-h-11 min-w-[120px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 max-sm:w-full"
            disabled={!storageEnabled || saveStatus === "saving"}
            onClick={saveAnalysis}
            title={!storageEnabled ? "저장 기능 준비 중" : undefined}
            type="button"
          >
            {saveStatus === "saved" ? (
              <Check className="size-4" />
            ) : (
              <Save className="size-4" />
            )}
            {saveStatus === "saving"
              ? "저장 중"
              : saveStatus === "saved"
                ? "저장 완료"
                : storageEnabled
                  ? "결과 저장"
                  : "저장 준비 중"}
          </button>
          <button
            className="inline-flex min-h-11 min-w-[104px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-4 text-sm font-extrabold text-blue-700 transition hover:border-blue-300 hover:bg-white max-sm:w-full"
            onClick={printReport}
            type="button"
          >
            <Printer className="size-4" />
            PDF 저장
          </button>
        </div>
      </div>

      {copyMessage ? (
        <p className="print-hidden mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          {copyMessage}
        </p>
      ) : null}

      {saveMessage ? (
        <p
          className={`print-hidden mb-5 rounded-2xl px-4 py-3 text-sm font-semibold ${
            saveStatus === "error"
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {saveMessage}
        </p>
      ) : null}

      {!storageEnabled ? (
        <p className="print-hidden mb-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500">
          Supabase 환경변수가 없어 저장 버튼은 비활성화되어 있습니다. AI 분석과
          복사 기능은 정상적으로 사용할 수 있습니다.
        </p>
      ) : null}

      <ProgressSnapshot
        completedCount={completedPriorityCount}
        currentScore={average}
        totalCount={result.priorities.length}
        targetScore={targetAverage}
      />

      <article className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg shadow-slate-200/70">
        <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
          <div className="bg-slate-950 p-6 text-white sm:p-8">
            <p className="text-sm font-extrabold tracking-[0.1em] text-blue-300">
              TOTAL SCORE
            </p>
            <div className="mt-5 flex items-end gap-2">
              <p className="text-6xl font-black tracking-[-0.04em] min-[380px]:text-7xl lg:tracking-[-0.07em]">
                {average}
              </p>
              <span className="pb-3 text-sm font-bold text-slate-400">
                /100
              </span>
            </div>
            <span
              className={`mt-5 inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold ring-1 ${status.badge}`}
            >
              {status.label}
            </span>
            <p className="mt-5 text-[15px] leading-7 text-slate-300">
              5개 평가 항목의 평균 점수입니다.
            </p>
          </div>

          <div className="p-5 min-[380px]:p-6 sm:p-8">
            <p className="text-[13px] font-extrabold tracking-[0.1em] text-blue-600">
              SUMMARY
            </p>
            <h3 className="mt-3 break-words text-2xl font-black leading-snug tracking-[-0.025em] text-slate-950">
              {summary.headline}
            </h3>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <MiniList
                items={
                  summary.judgments.length
                    ? summary.judgments
                    : result.strengths.slice(0, 3)
                }
                title="핵심 판단"
              />
              <MiniList items={summary.actions} title="바로 실행할 것" />
            </div>
          </div>
        </div>
      </article>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <HighlightCard
          items={result.strengths.slice(0, 3)}
          tone="blue"
          title="핵심 강점 3개"
        />
        <HighlightCard
          items={result.weaknesses.slice(0, 3)}
          tone="amber"
          title="가장 중요한 개선점 3개"
        />
        <PriorityPreview priorities={result.priorities.slice(0, 3)} />
      </div>

      <DetailsSection title="세부 점수 카드" defaultOpen>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {scoreCards.map((card) => (
            <ScoreCard
              icon={card.icon}
              key={card.key}
              label={card.label}
              score={result.scores[card.key]}
              description={card.description}
            />
          ))}
        </div>
      </DetailsSection>

      <DetailsSection title="개선 우선순위 TOP 5" defaultOpen>
        <div className="grid gap-3">
          {result.priorities.map((priority, index) => (
            <ActionCard
              action={priority.action}
              checked={Boolean(checkedPriorities[index])}
              index={index}
              key={`${priority.title}-${index}`}
              onToggle={() =>
                setCheckedPriorities((current) => ({
                  ...current,
                  [index]: !current[index],
                }))
              }
              reason={priority.reason}
              title={priority.title}
            />
          ))}
        </div>
      </DetailsSection>

      <article className="mt-4 rounded-3xl border border-blue-200 bg-blue-50 p-6 sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[13px] font-extrabold tracking-[0.1em] text-blue-700">
              REWRITTEN DESCRIPTION
            </p>
            <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-950">
              프로젝트 설명 개선 문구
            </h3>
          </div>
          <button
            className="print-hidden inline-flex min-h-11 min-w-[136px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-4 text-sm font-extrabold text-slate-700 shadow-sm transition hover:text-blue-700 max-sm:w-full"
            onClick={() =>
              copyText(result.improvedDescription, "description")
            }
            type="button"
          >
            {copiedTarget === "description" ? (
              <Check className="size-4" />
            ) : (
              <Clipboard className="size-4" />
            )}
            {copiedTarget === "description" ? "복사 완료" : "개선 문구 복사"}
          </button>
        </div>
        <div className="mt-5 whitespace-pre-wrap break-words rounded-2xl border border-blue-100 bg-white p-5 text-[15px] font-medium leading-7 text-slate-700 sm:text-base sm:leading-8">
          {result.improvedDescription}
        </div>
      </article>

      <DetailsSection title="예상 면접 질문 5개" defaultOpen>
        <div className="grid gap-3 md:grid-cols-2">
          {result.interviewQuestions.map((question, index) => {
            const answer = getInterviewAnswer(result, question, index);
            const copyValue = `Q. ${question}\n\nA. ${answer}`;

            return (
              <div
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
                key={`${question}-${index}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-lime-100 text-sm font-black text-lime-800">
                    Q{index + 1}
                  </div>
                  <p className="break-words text-[15px] font-semibold leading-7 text-slate-700">
                    {question}
                  </p>
                </div>
                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-extrabold tracking-[0.1em] text-blue-700">
                    ANSWER EXAMPLE
                  </p>
                  <p className="mt-2 break-words text-sm font-semibold leading-7 text-slate-700">
                    {answer}
                  </p>
                </div>
                <button
                  className="print-hidden mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 px-4 text-xs font-extrabold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 min-[420px]:w-auto"
                  onClick={() => copyText(copyValue, `question-${index}`)}
                  type="button"
                >
                  {copiedTarget === `question-${index}` ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Clipboard className="size-3.5" />
                  )}
                  {copiedTarget === `question-${index}`
                    ? "복사 완료"
                    : "질문 답변 복사"}
                </button>
              </div>
            );
          })}
        </div>
        <button
          className="print-hidden mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-slate-950 px-5 text-sm font-extrabold text-white transition hover:bg-blue-600 min-[420px]:w-auto"
          onClick={() =>
            copyText(
              result.interviewQuestions
                .map(
                  (question, index) =>
                    `Q${index + 1}. ${question}\nA. ${getInterviewAnswer(result, question, index)}`,
                )
                .join("\n\n"),
              "questions",
            )
          }
          type="button"
        >
          {copiedTarget === "questions" ? (
            <Check className="size-4" />
          ) : (
            <FileQuestion className="size-4" />
          )}
          {copiedTarget === "questions"
            ? "전체 복사 완료"
            : "전체 질문 답변 복사"}
        </button>
      </DetailsSection>
    </section>
  );
}

function ProgressSnapshot({
  completedCount,
  currentScore,
  targetScore,
  totalCount,
}: {
  completedCount: number;
  currentScore: number;
  targetScore: number;
  totalCount: number;
}) {
  const completionRate =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="mb-4 grid gap-3 sm:grid-cols-3">
      <SnapshotCard label="현재 종합 점수" value={`${currentScore}점`} />
      <SnapshotCard label="개선 목표" value={`${targetScore}점`} />
      <SnapshotCard
        label="우선순위 완료"
        value={`${completedCount}/${totalCount}`}
        helper={`${completionRate}% 진행`}
      />
    </div>
  );
}

function SnapshotCard({
  helper,
  label,
  value,
}: {
  helper?: string;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
      <p className="text-xs font-extrabold tracking-[0.1em] text-slate-500">
        {label}
      </p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-2xl font-black tracking-[-0.04em] text-slate-950">
          {value}
        </p>
        {helper ? (
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-extrabold text-blue-700">
            {helper}
          </span>
        ) : null}
      </div>
    </article>
  );
}

function MiniList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-xs font-extrabold tracking-[0.08em] text-slate-500">
        {title}
      </p>
      <ul className="mt-3 grid gap-2.5">
        {items.slice(0, 3).map((item, index) => (
          <li
            className="flex gap-2.5 break-words text-[15px] font-semibold leading-7 text-slate-700"
            key={`${item}-${index}`}
          >
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-blue-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HighlightCard({
  items,
  title,
  tone,
}: {
  items: string[];
  title: string;
  tone: "blue" | "amber";
}) {
  const isBlue = tone === "blue";
  const Icon = isBlue ? BadgeCheck : TriangleAlert;

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div
          className={`flex size-10 items-center justify-center rounded-2xl ${
            isBlue
              ? "bg-blue-50 text-blue-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          <Icon className="size-4.5" />
        </div>
        <h3 className="font-black tracking-[-0.02em] text-slate-950">
          {title}
        </h3>
      </div>
      <ul className="mt-5 grid gap-3">
        {items.map((item, index) => (
          <li
            className="rounded-2xl bg-slate-50 p-4 text-[15px] leading-7 text-slate-700"
            key={`${item}-${index}`}
          >
            <p className="font-extrabold text-slate-950">
              {shortTitle(item, index)}
            </p>
            <p className="mt-1 break-words">{item}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

function PriorityPreview({
  priorities,
}: {
  priorities: AnalysisResult["priorities"];
}) {
  return (
    <article className="rounded-3xl border border-blue-100 bg-blue-50 p-5 sm:p-6">
      <p className="text-xs font-extrabold tracking-[0.12em] text-blue-700">
        TOP PRIORITY
      </p>
      <h3 className="mt-1 font-black tracking-[-0.02em] text-slate-950">
        개선 우선순위 TOP 3
      </h3>
      <ol className="mt-5 grid gap-3">
        {priorities.map((priority, index) => (
          <li
            className="flex gap-3 rounded-2xl bg-white p-4"
            key={`${priority.title}-${index}`}
          >
            <span className="font-black text-blue-600">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="break-words text-[15px] font-extrabold leading-6 text-slate-950">
                {priority.title}
              </p>
              <p className="mt-1 break-words text-sm leading-6 text-slate-500">
                {priority.action}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}

function DetailsSection({
  children,
  title,
  defaultOpen = false,
}: {
  children: ReactNode;
  title: string;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="group mt-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <h3 className="text-xl font-black tracking-[-0.025em] text-slate-950">
          {title}
        </h3>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-open:rotate-180">
          <ChevronDown className="size-4" />
        </span>
      </summary>
      <div className="mt-5">{children}</div>
    </details>
  );
}

function ActionCard({
  action,
  checked,
  index,
  onToggle,
  reason,
  title,
}: {
  action: string;
  checked: boolean;
  index: number;
  onToggle: () => void;
  reason: string;
  title: string;
}) {
  return (
    <div
      className={`grid gap-4 rounded-2xl border p-5 transition sm:grid-cols-[52px_1fr] sm:p-6 ${
        checked
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <button
        aria-pressed={checked}
        className={`flex size-12 items-center justify-center rounded-2xl text-sm font-black transition ${
          checked
            ? "bg-emerald-500 text-white"
            : "bg-slate-950 text-white hover:bg-blue-600"
        }`}
        onClick={onToggle}
        type="button"
      >
        {String(index + 1).padStart(2, "0")}
      </button>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          {checked ? (
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-200">
              완료
            </span>
          ) : (
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-extrabold text-slate-500 ring-1 ring-slate-200">
              체크 가능
            </span>
          )}
        </div>
        <h4 className="mt-2 break-words text-base font-extrabold leading-6 text-slate-950">
          {title}
        </h4>
        <p className="mt-2 break-words text-[15px] leading-7 text-slate-600">
          <span className="font-extrabold text-slate-700">이유: </span>
          {reason}
        </p>
        <p className="mt-3 break-words rounded-xl bg-white px-4 py-3 text-[15px] font-semibold leading-7 text-blue-700">
          <span className="font-extrabold text-slate-800">예시: </span>
          {action}
        </p>
      </div>
    </div>
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
  const strength = result.strengths[index % result.strengths.length];

  return [
    `이 질문에는 ${priority?.title ?? "프로젝트 개선 방향"}을 중심으로 답변하겠습니다.`,
    strength
      ? `제가 강조할 부분은 ${strength}`
      : "프로젝트에서 맡은 역할과 문제 해결 과정을 먼저 설명하겠습니다.",
    priority?.action
      ? `답변에서는 "${priority.action}"처럼 구체적인 구현 내용과 결과를 함께 말하겠습니다.`
      : `마지막에는 사용한 기술, 판단 근거, 개선 결과를 연결해서 설명하겠습니다.`,
    `단순히 기술명을 나열하기보다 왜 그렇게 구현했는지와 사용자 경험에 어떤 변화가 있었는지를 함께 전달하겠습니다.`,
  ].join(" ");
}

function splitSentences(text: string) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?。]|다\.)\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function shortTitle(item: string, index: number) {
  const [firstClause] = item.split(/[,.。]| 때문에 | 통해 |에서 /);

  return firstClause && firstClause.length <= 28
    ? firstClause
    : `핵심 포인트 ${index + 1}`;
}
