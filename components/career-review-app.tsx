"use client";

import { useRef, useState } from "react";
import { AnalysisForm } from "@/components/analysis-form";
import { ResultsDashboard } from "@/components/results-dashboard";
import { demoInput, getMockAnalysisResult } from "@/lib/mock-analysis";
import type {
  AnalysisInput,
  AnalysisResult,
  AnalyzeResponse,
} from "@/types";

export function CareerReviewApp() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [submittedInput, setSubmittedInput] = useState<AnalysisInput | null>(
    null,
  );
  const [storageEnabled, setStorageEnabled] = useState(false);
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  const [isDemoResult, setIsDemoResult] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  async function handleAnalyze(input: AnalysisInput) {
    setIsLoading(true);
    setError("");
    setIsDemoResult(false);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await response.json()) as AnalyzeResponse & {
        error?: string;
      };

      if (!response.ok || !data.result) {
        throw new Error(
          data.error || "분석 결과를 불러오지 못했습니다. 다시 시도해주세요.",
        );
      }

      setSubmittedInput(input);
      setResult(data.result);
      setStorageEnabled(data.storageEnabled);
      setIsInputCollapsed(true);

      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "분석 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleDemoResult() {
    setError("");
    setSubmittedInput(demoInput);
    setResult(getMockAnalysisResult());
    setStorageEnabled(false);
    setIsDemoResult(true);
    setIsInputCollapsed(true);

    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  return (
    <section className="bg-slate-50 py-10 sm:py-20" id="analyze">
      <div className="mx-auto max-w-[1320px] px-4 min-[380px]:px-5 sm:px-8">
        <div className="grid min-w-0 items-start gap-7 lg:grid-cols-[minmax(360px,380px)_minmax(0,1fr)]">
          <div className="print-hidden lg:sticky lg:top-24">
            <AnalysisForm
              hasResult={Boolean(result)}
              isCollapsed={isInputCollapsed}
              isLoading={isLoading}
              onAnalyze={handleAnalyze}
              onDemoResult={handleDemoResult}
              onToggleCollapsed={() =>
                setIsInputCollapsed((current) => !current)
              }
              submittedInput={submittedInput}
            />
          </div>

          <div className="min-w-0" ref={resultRef}>
            {error ? (
              <ErrorCard message={error} />
            ) : null}

            {result && submittedInput ? (
              <ResultsDashboard
                input={submittedInput}
                isDemoResult={isDemoResult}
                result={result}
                storageEnabled={storageEnabled}
              />
            ) : (
              <EmptyResults />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="mb-5 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-800">
      <p className="text-sm font-black">분석을 완료하지 못했습니다</p>
      <p className="mt-2 text-sm leading-6">{message}</p>
      <ul className="mt-4 grid gap-1.5 text-xs font-semibold leading-5 text-red-700">
        <li>OPENAI_API_KEY가 설정되지 않았다면 .env.local을 확인해주세요.</li>
        <li>API 사용량 또는 결제 한도에 도달했는지 확인해주세요.</li>
        <li>잠시 후 다시 시도하거나 데모 결과 보기로 화면을 확인할 수 있습니다.</li>
      </ul>
    </div>
  );
}

function EmptyResults() {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-center sm:min-h-[560px] sm:p-7">
      <div className="max-w-md">
        <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-blue-50 text-2xl font-black text-blue-600">
          01
        </div>
        <h2 className="mt-6 text-2xl font-black tracking-[-0.04em] text-slate-950">
          분석 결과가 여기에 표시됩니다
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          왼쪽 입력 패널에 지원 직무와 포트폴리오 정보를 입력하면 종합 점수,
          강점, 개선 우선순위와 면접 질문을 대시보드로 확인할 수 있습니다.
        </p>
        <div className="mt-7 grid grid-cols-5 gap-2">
          {[72, 84, 68, 90, 78].map((height, index) => (
            <div
              className="flex h-24 items-end rounded-xl bg-slate-50 p-1.5"
              key={`${height}-${index}`}
            >
              <div
                className="w-full rounded-lg bg-blue-100"
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
