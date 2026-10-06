"use client";
import { useEffect, useRef, useState } from "react";
import { ExternalLink, History, LoaderCircle, Trash2 } from "lucide-react";
import { initializeHistory, requestJson } from "@/lib/client-api";

type Item = { id: string; role: string; techStack: string; score: number | null; summary: string; completed: number; shared: boolean; createdAt: string };
type HistoryResponse = { enabled: boolean; items: Item[]; message?: string };
export function AnalysisHistory() {
  const [items, setItems] = useState<Item[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState("");
  const sequence = useRef(0);
  useEffect(() => {
    let mounted = true;
    async function load() {
      const version = ++sequence.current;
      setLoading(true);
      try {
        await initializeHistory<HistoryResponse>();
        const data = await requestJson<HistoryResponse>("/api/history");
        if (!mounted || version !== sequence.current) return;
        setItems(data.items ?? []); setEnabled(data.enabled); setMessage(data.message ?? "");
      } catch (failure) { if (mounted && version === sequence.current) setMessage(failure instanceof Error ? failure.message : "기록을 불러오지 못했습니다."); }
      finally { if (mounted && version === sequence.current) setLoading(false); }
    }
    void load();
    window.addEventListener("analysis-saved", load);
    window.addEventListener("careerlens-history-refresh", load);
    return () => { mounted = false; sequence.current += 1; window.removeEventListener("analysis-saved", load); window.removeEventListener("careerlens-history-refresh", load); };
  }, []);
  async function remove(id: string) {
    if (deleting || !window.confirm("이 기록과 공유 링크를 영구 삭제할까요? 삭제 후 복구할 수 없습니다.")) return;
    setDeleting(id); setMessage("");
    try {
      await requestJson("/api/history?id=" + encodeURIComponent(id), { method: "DELETE" });
      sequence.current += 1;
      setLoading(false);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (failure) { setMessage(failure instanceof Error ? failure.message : "삭제하지 못했습니다."); }
    finally { setDeleting(""); }
  }
  return <section className="history-section section-shell print-hidden" id="history">
    <div className="section-heading"><div><p className="eyebrow">PRIVATE HISTORY</p><h2>내 리뷰 기록</h2></div><History size={20} /></div>
    <p className="muted">이 브라우저에 연결된 최근 12개 기록입니다. 다른 기기나 쿠키 삭제 후에는 개인 기록에 접근할 수 없습니다.</p>
    {message && <p className="notice" role="status">{message}{enabled && <button className="text-button" onClick={() => window.dispatchEvent(new Event("careerlens-history-refresh"))}>다시 불러오기</button>}</p>}
    {loading ? <p className="history-empty"><LoaderCircle size={16} className="spin" /> 기록을 불러오는 중</p> : !enabled ? <p className="history-empty">저장 기능은 현재 사용할 수 없습니다.</p> : !items.length ? <p className="history-empty">아직 저장한 리뷰가 없습니다.</p> : <div className="history-list">{items.map((item) => <article className="history-item" key={item.id}>
      <div className="history-score">{item.score ?? "—"}<small>준비도</small></div>
      <div className="history-description"><div className="history-meta"><strong>{item.role}</strong><span>{new Date(item.createdAt).toLocaleDateString("ko-KR")}</span><span>{item.completed}/5 완료</span><span className={"status-tag " + (item.shared ? "attention" : "good")}>{item.shared ? "공유 중" : "비공개"}</span></div><p>{item.summary}</p><span className="muted">{item.techStack}</span></div>
      <div className="history-actions"><a className="icon-button" href={"/report/" + item.id} aria-label={item.role + " 개인 리포트 열기"} title="개인 리포트 열기"><ExternalLink size={17} /></a><button className="icon-button danger" disabled={Boolean(deleting)} onClick={() => remove(item.id)} aria-label={item.role + " 기록 삭제"} title="기록 삭제">{deleting === item.id ? <LoaderCircle className="spin" size={17} /> : <Trash2 size={17} />}</button></div>
    </article>)}</div>}
  </section>;
}
