"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Check,
  ExternalLink,
  History,
  LoaderCircle,
  ServerOff,
  Trash2,
} from "lucide-react";

type HistoryItem = {
  id: string;
  role: string;
  portfolioUrl: string | null;
  techStack: string;
  score: number;
  summary: string;
  createdAt: string;
};

type HistoryResponse = {
  enabled: boolean;
  items: HistoryItem[];
  message?: string;
};

export function AnalysisHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [deletedId, setDeletedId] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadHistory() {
      try {
        const response = await fetch("/api/history");
        const data = (await response.json()) as HistoryResponse;

        if (ignore) return;

        setEnabled(data.enabled);
        setItems(data.items ?? []);
        setMessage(data.message ?? "");
      } catch {
        if (!ignore) {
          setMessage("히스토리를 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      ignore = true;
    };
  }, []);

  async function deleteItem(id: string) {
    if (deletingId) return;

    const ok = window.confirm("저장된 분석 결과를 삭제할까요?");

    if (!ok) return;

    setDeletingId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/history?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as {
        deleted?: boolean;
        message?: string;
      };

      if (!response.ok || !data.deleted) {
        throw new Error(data.message || "삭제하지 못했습니다.");
      }

      setItems((current) => current.filter((item) => item.id !== id));
      setDeletedId(id);
      window.setTimeout(() => setDeletedId(""), 1600);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "저장된 분석 결과를 삭제하지 못했습니다.",
      );
    } finally {
      setDeletingId("");
    }
  }

  return (
    <section className="print-hidden bg-slate-50 pb-16">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-extrabold tracking-[0.14em] text-blue-600">
                ANALYSIS HISTORY
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-slate-950">
                저장된 분석 결과
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                저장된 결과를 다시 열거나 공유용 리포트 링크로 확인할 수
                있습니다.
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <History className="size-5" />
            </div>
          </div>

          {enabled && message && !isLoading && items.length > 0 ? (
            <HistoryNotice message={message} />
          ) : null}

          {!enabled ? (
            <HistoryNotice
              icon={<ServerOff className="size-4" />}
              message={message || "Supabase 연결 후 히스토리를 사용할 수 있습니다."}
            />
          ) : isLoading ? (
            <HistoryNotice message="히스토리를 불러오는 중입니다." />
          ) : items.length === 0 ? (
            <HistoryNotice message={message || "아직 저장된 분석 결과가 없습니다."} />
          ) : (
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <article
                  className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-white hover:shadow-md hover:shadow-slate-200/70"
                  key={item.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold text-blue-600">
                        {item.role}
                      </p>
                      <p className="mt-1 text-sm font-bold leading-6 text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-950 px-3 py-1.5 text-sm font-black text-white">
                      {item.score}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold leading-6 text-slate-700">
                    {item.summary}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                    <p className="truncate text-xs font-bold text-slate-400">
                      {item.techStack}
                    </p>
                    <div className="flex shrink-0 items-center gap-2">
                      <a
                        className="inline-flex min-h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
                        href={`/report/${item.id}`}
                      >
                        <ExternalLink className="size-3.5" />
                        열기
                      </a>
                      <button
                        className="inline-flex min-h-9 min-w-[72px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-rose-100 bg-white px-3 text-xs font-extrabold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={Boolean(deletingId)}
                        onClick={() => deleteItem(item.id)}
                        type="button"
                      >
                        {deletingId === item.id ? (
                          <LoaderCircle className="size-3.5 animate-spin" />
                        ) : deletedId === item.id ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                        삭제
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function HistoryNotice({
  icon,
  message,
}: {
  icon?: ReactNode;
  message: string;
}) {
  return (
    <div className="mt-6 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
      {icon}
      {message}
    </div>
  );
}
