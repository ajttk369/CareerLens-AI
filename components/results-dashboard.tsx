"use client";
import { useState } from "react";
import { Check, Clipboard, ExternalLink, Link2, LoaderCircle, Printer, Save, ShieldCheck, Unlink } from "lucide-react";
import { DescriptionSection, FindingsSection, InterviewSection, MissingSection, ReportContent, ScoresSection } from "@/components/review-content";
import { getReviewScore, getReviewText } from "@/lib/review";
import { requestJson } from "@/lib/client-api";
import type { AnalyzeResponse } from "@/types";

type Tab = "summary" | "description" | "interview";
export function ResultsDashboard({ response, onEditInput }: { response: AnalyzeResponse; onEditInput: () => void }) {
  const { input, result, mode, receipt, storageEnabled } = response;
  const [tab, setTab] = useState<Tab>("summary");
  const [completed, setCompleted] = useState<number[]>([]);
  const [savedId, setSavedId] = useState("");
  const [progressDirty, setProgressDirty] = useState(false);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState("");
  const [fallback, setFallback] = useState("");
  const score = getReviewScore(result, input.role);
  async function copy(text: string, target: string) {
    try { await navigator.clipboard.writeText(text); setCopied(target); setFallback(""); window.setTimeout(() => setCopied(""), 2000); }
    catch { setFallback(text); setMessage("자동 복사가 제한됐습니다. 아래 텍스트를 선택해 복사할 수 있습니다."); }
  }
  async function save() {
    if (busy || !receipt || mode === "demo" || !storageEnabled) return;
    setBusy("save"); setMessage("");
    try {
      const data = await requestJson<{ id: string }>("/api/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...input, result, receipt, completedPriorities: completed }) });
      setSavedId(data.id); setProgressDirty(false); setMessage("이 브라우저의 비공개 기록에 저장했습니다.");
      window.dispatchEvent(new Event("analysis-saved"));
    } catch (error) { setMessage(error instanceof Error ? error.message : "저장하지 못했습니다."); }
    finally { setBusy(""); }
  }
  async function saveProgress() {
    if (!savedId || busy) return;
    setBusy("progress"); setMessage("");
    try {
      await requestJson("/api/history", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: savedId, completedPriorities: completed }) });
      setProgressDirty(false); setMessage("진행 상황을 저장했습니다."); window.dispatchEvent(new Event("analysis-saved"));
    } catch (error) { setMessage(error instanceof Error ? error.message : "진행 상황을 저장하지 못했습니다."); }
    finally { setBusy(""); }
  }
  async function share(enabled: boolean) {
    if (!savedId || busy) return;
    if (enabled && !window.confirm("리뷰 결과, 입력 근거, 기술 정보가 링크를 가진 사람에게 7일 동안 공개됩니다. 민감정보가 없는지 확인했나요?")) return;
    setBusy("share"); setMessage("");
    try {
      const data = await requestJson<{ path: string | null }>("/api/share", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: savedId, enabled }) });
      setShareUrl(data.path ? window.location.origin + data.path : "");
      setMessage(enabled ? "7일 동안 사용할 수 있는 공유 링크를 만들었습니다." : "공유 링크를 해제했습니다.");
      window.dispatchEvent(new Event("analysis-saved"));
    } catch (error) { setMessage(error instanceof Error ? error.message : "공유 설정을 변경하지 못했습니다."); }
    finally { setBusy(""); }
  }
  function toggle(index: number) {
    setCompleted((current) => current.includes(index) ? current.filter((value) => value !== index) : [...current, index]);
    if (savedId) setProgressDirty(true);
  }
  const tabs: { value: Tab; label: string }[] = [{ value: "summary", label: "요약과 수정 작업" }, { value: "description", label: "문구 개선" }, { value: "interview", label: "면접 준비" }];
  return <>
    <div className="dashboard print-hidden">
      <div className="result-heading"><div><p className="eyebrow">{mode === "demo" ? "가상 샘플 · 실제 AI 분석 아님" : "포트폴리오 설명 리뷰"}</p><h2>{input.role} 리뷰</h2></div><div className="result-toolbar">
        <button className="icon-button" aria-label="전체 결과 복사" title="전체 결과 복사" onClick={() => copy(getReviewText(result, input.role), "all")}>{copied === "all" ? <Check size={18} /> : <Clipboard size={18} />}</button>
        <button className="icon-button" aria-label="리포트 인쇄 또는 PDF 저장" title="인쇄 / PDF 저장" onClick={() => window.print()}><Printer size={18} /></button>
        <button className="button secondary compact" disabled={Boolean(busy) || !storageEnabled || mode === "demo" || Boolean(savedId)} onClick={save}>{busy === "save" ? <LoaderCircle size={16} className="spin" /> : savedId ? <ShieldCheck size={16} /> : <Save size={16} />}{savedId ? "저장됨" : "비공개 저장"}</button>
        <button className="button secondary compact" onClick={onEditInput}>입력 수정</button>
      </div></div>
      <p className="scope-note">입력한 설명만 분석합니다. 실제 웹사이트·코드·디자인 화면과 채용 가능성은 평가하지 않습니다.</p>
      {mode === "demo" && <p className="notice">가상 프로젝트의 고정 샘플입니다. 저장은 제공하지 않으며, 입력 수정으로 실제 경험을 작성할 수 있습니다.</p>}
      {mode === "ai" && !storageEnabled && <p className="notice">저장 기능은 현재 사용할 수 없습니다. 결과 복사와 인쇄는 가능합니다.</p>}
      <div className="review-overview"><div className="overall-score"><span>설명 준비도</span><strong>{score ?? "—"}<small>{score === null ? "정보 부족" : "/100"}</small></strong></div><div className="overall-comment"><p>{result.overallComment}</p><span>{input.experienceLevel} · {input.jobDescription ? "채용 공고 반영" : "일반 직무 기준"} · {completed.length}/5 작업 완료</span></div></div>
      {savedId && <div className="saved-actions">
        <a className="button secondary compact" href={"/report/" + savedId}><ExternalLink size={15} /> 개인 리포트</a>
        {shareUrl ? <><button className="button secondary compact" onClick={() => copy(shareUrl, "link")}><Link2 size={15} />{copied === "link" ? "복사됨" : "공유 링크 복사"}</button><button className="button secondary compact" disabled={Boolean(busy)} onClick={() => share(false)}><Unlink size={15} /> 공유 해제</button></> : <button className="button secondary compact" disabled={Boolean(busy)} onClick={() => share(true)}><Link2 size={15} /> 공유 링크 만들기</button>}
        <span className="muted">기본 비공개 · 공유 링크 7일 유효</span>
      </div>}
      {(message || busy === "share") && <p className="notice" role="status" aria-live="polite">{busy === "share" ? "공유 설정을 변경하고 있습니다." : message}</p>}
      {fallback && <label className="clipboard-fallback">복사할 텍스트<textarea rows={5} readOnly value={fallback} onFocus={(event) => event.target.select()} /><button className="button secondary compact" onClick={() => setFallback("")}>닫기</button></label>}
      <div className="result-tabs" role="tablist" aria-label="리뷰 결과">{tabs.map((item) => <button key={item.value} role="tab" id={"tab-" + item.value} aria-selected={tab === item.value} aria-controls={"panel-" + item.value} tabIndex={tab === item.value ? 0 : -1} onClick={() => setTab(item.value)} onKeyDown={(event) => {
        if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const current = tabs.findIndex((entry) => entry.value === tab);
        const next = event.key === "Home" ? 0 : event.key === "End" ? 2 : (current + (event.key === "ArrowRight" ? 1 : 2)) % 3;
        setTab(tabs[next].value); document.getElementById("tab-" + tabs[next].value)?.focus();
      }}>{item.label}</button>)}</div>
      <div id="panel-summary" role="tabpanel" aria-labelledby="tab-summary" hidden={tab !== "summary"}>
        <FindingsSection result={result} />
        <section className="report-section"><div className="section-heading"><h2>다음 수정 작업</h2><div className="progress-actions"><span className="muted">{completed.length}/5 완료</span>{savedId && <button className="button secondary compact" disabled={Boolean(busy) || !progressDirty} onClick={saveProgress}>{busy === "progress" ? "저장 중" : progressDirty ? "진행 저장" : "진행 저장됨"}</button>}</div></div>
          <div className="priority-table-wrapper"><table className="priority-table"><thead><tr><th scope="col">완료</th><th scope="col">수정 대상과 이유</th><th scope="col">해야 할 작업</th></tr></thead><tbody>{result.priorities.map((item, index) => <tr key={index} className={completed.includes(index) ? "is-complete" : ""}><td><label className="priority-check"><input type="checkbox" checked={completed.includes(index)} disabled={Boolean(busy)} onChange={() => toggle(index)} aria-label={item.title + " 완료"} /><span>{String(index + 1).padStart(2, "0")}</span></label></td><td><h3>{item.title}</h3><p>{item.reason}</p>{item.evidence ? <details><summary>입력 근거</summary><blockquote>{item.evidence}</blockquote></details> : <span className="missing-tag">추가 사실 필요</span>}</td><td><p className="action-text">{item.action}</p></td></tr>)}</tbody></table></div>
        </section>
        <MissingSection result={result} /><ScoresSection result={result} />
      </div>
      <div id="panel-description" role="tabpanel" aria-labelledby="tab-description" hidden={tab !== "description"}><div className="tab-tools"><button className="button secondary compact" onClick={() => copy(result.improvedDescription, "description")}><Clipboard size={15} />{copied === "description" ? "복사됨" : "수정 문구 복사"}</button></div><DescriptionSection input={input} result={result} /></div>
      <div id="panel-interview" role="tabpanel" aria-labelledby="tab-interview" hidden={tab !== "interview"}><InterviewSection result={result} /></div>
    </div>
    <div className="print-version"><ReportContent input={input} result={result} completed={completed} mode={mode} /></div>
  </>;
}
