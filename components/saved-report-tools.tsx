"use client";
import { useState } from "react";
import { Clipboard, Link2, Printer, Save, Unlink } from "lucide-react";
import { useRouter } from "next/navigation";
import { requestJson } from "@/lib/client-api";
import type { PriorityItem } from "@/types";

export function SavedReportTools({ id, shared: initialShared, completed, priorities }: { id: string; shared: boolean; completed: number[]; priorities: PriorityItem[] }) {
  const router = useRouter();
  const [shared, setShared] = useState(initialShared);
  const [url, setUrl] = useState("");
  const [checked, setChecked] = useState(completed);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function share(enabled: boolean) {
    if (busy || (enabled && !window.confirm("리뷰 결과와 입력 근거가 링크를 가진 사람에게 7일 동안 공개됩니다. 공유할까요? 새 링크를 만들면 기존 링크는 해제됩니다."))) return;
    setBusy(true);
    try {
      const data = await requestJson<{ path: string | null }>("/api/share", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, enabled }) });
      setShared(enabled); setUrl(data.path ? window.location.origin + data.path : ""); setMessage(enabled ? "공유 링크를 만들었습니다. 7일 뒤 만료됩니다." : "공유를 해제했습니다.");
    } catch (failure) { setMessage(failure instanceof Error ? failure.message : "공유 설정을 변경하지 못했습니다."); }
    finally { setBusy(false); }
  }
  async function progress() {
    setBusy(true);
    try {
      await requestJson("/api/history", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, completedPriorities: checked }) });
      setMessage("진행 상황을 저장했습니다."); router.refresh();
    } catch (failure) { setMessage(failure instanceof Error ? failure.message : "진행 상황을 저장하지 못했습니다."); }
    finally { setBusy(false); }
  }
  return <aside className="saved-report-tools print-hidden"><div className="saved-actions">
    <a className="button secondary compact" href="/#history">내 기록</a>
    <button className="icon-button" title="인쇄 / PDF 저장" aria-label="인쇄 또는 PDF 저장" onClick={() => window.print()}><Printer size={17} /></button>
    <button className="button secondary compact" disabled={busy} onClick={() => share(true)}><Link2 size={16} />{shared ? "새 공유 링크" : "공유 링크 만들기"}</button>
    {shared && <button className="button secondary compact" disabled={busy} onClick={() => share(false)}><Unlink size={16} /> 공유 해제</button>}
    <span className={"status-tag " + (shared ? "attention" : "good")}>{shared ? "공유 중" : "비공개"}</span>
  </div>
  {url && <div className="share-link"><input aria-label="공유 링크" readOnly value={url} onFocus={(event) => event.target.select()} /><button className="icon-button" title="링크 복사" aria-label="공유 링크 복사" onClick={async () => { try { await navigator.clipboard.writeText(url); setMessage("링크를 복사했습니다."); } catch { setMessage("링크를 선택해 직접 복사해 주세요."); } }}><Clipboard size={16} /></button></div>}
  <details className="progress-editor"><summary>개선 작업 진행 편집</summary><div>{priorities.map((item, index) => <label key={index}><input type="checkbox" disabled={busy} checked={checked.includes(index)} onChange={() => setChecked((current) => current.includes(index) ? current.filter((value) => value !== index) : [...current, index])} />{item.title}</label>)}</div><button className="button secondary compact" disabled={busy} onClick={progress}><Save size={15} /> 진행 저장</button></details>
  {message && <p className="notice" role="status">{message}</p>}</aside>;
}
