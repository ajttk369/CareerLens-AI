"use client";
import { useEffect, useRef, useState } from "react";
import { FileText, LoaderCircle } from "lucide-react";
import { AnalysisForm } from "@/components/analysis-form";
import { ResultsDashboard } from "@/components/results-dashboard";
import { demoInput, getMockAnalysisResult } from "@/lib/mock-analysis";
import { initializeHistory, requestJson } from "@/lib/client-api";
import { validateInput } from "@/lib/validation";
import type { AnalysisInput, AnalyzeResponse } from "@/types";

const initialInput: AnalysisInput = { role: "프론트엔드", experienceLevel: "신입", portfolioUrl: "", introduction: "", inputText: "", techStack: "", jobDescription: "", projects: [{ id: "first-project", name: "", url: "", contribution: "", description: "" }] };

export function CareerReviewApp() {
  const [draft, setDraft] = useState<AnalysisInput>(initialInput);
  const [response, setResponse] = useState<AnalyzeResponse | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const active = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => () => { generation.current += 1; active.current?.abort(); }, []);
  function cancel() {
    generation.current += 1;
    active.current?.abort();
    active.current = null;
    setLoading(false);
    setError("대기를 취소했습니다. 서버에서 시작된 분석은 이미 처리 중일 수 있습니다.");
  }
  async function analyze(input: AnalysisInput) {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    const current = ++generation.current;
    setLoading(true);
    setError("");
    try {
      await initializeHistory();
      if (controller.signal.aborted) return;
      const data = await requestJson<AnalyzeResponse>("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), signal: controller.signal }, 55000);
      if (current !== generation.current) return;
      if (!data.result || !data.input) throw new Error("결과를 불러오지 못했습니다.");
      setResponse(data);
      setDraft(data.input);
      setCollapsed(true);
      setVersion((value) => value + 1);
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (failure) {
      if (current === generation.current) setError(failure instanceof Error ? failure.message : "분석을 완료하지 못했습니다.");
    } finally {
      if (current === generation.current) { setLoading(false); active.current = null; }
    }
  }
  function demo() {
    generation.current += 1;
    active.current?.abort();
    setLoading(false);
    setError("");
    const input = validateInput(demoInput);
    setDraft(input);
    setResponse({ input, result: getMockAnalysisResult(), mode: "demo", storageEnabled: false });
    setCollapsed(true);
    setVersion((value) => value + 1);
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return <section className="workspace section-shell" id="analyze">
    <div className="input-column print-hidden"><AnalysisForm value={draft} onChange={setDraft} onAnalyze={analyze} onDemo={demo} isLoading={isLoading} collapsed={collapsed} onExpand={() => setCollapsed(false)} onCancel={cancel} /></div>
    <div className="result-column" ref={resultRef}>
      {error && <p className="notice error print-hidden" role="alert">{error}</p>}
      {isLoading ? <div className="loading-result" role="status" aria-live="polite"><LoaderCircle className="spin" size={24} /><h2>입력한 경험을 읽고 있습니다</h2><p>설명 근거와 개선 항목을 정리하는 중입니다.</p></div> : response ? <ResultsDashboard key={version} response={response} onEditInput={() => setCollapsed(false)} /> : <div className="empty-result">
        <FileText size={28} /><h2>아직 리뷰가 없습니다</h2><p>제출된 프로젝트 설명이 없습니다.</p>
        <div className="empty-result-outline"><span>직무 경험 근거 <strong>—</strong></span><span>역할과 전달력 <strong>—</strong></span><span>직무 연결성 <strong>—</strong></span></div>
        <button className="button secondary" type="button" onClick={demo}>샘플 리뷰 보기</button>
      </div>}
    </div>
  </section>;
}
