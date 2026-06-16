import type { LucideIcon } from "lucide-react";

type ScoreCardProps = {
  label: string;
  score: number;
  icon: LucideIcon;
  description?: string;
};

export function getScoreStatus(score: number) {
  if (score >= 80) {
    return {
      label: "우수",
      text: "경쟁력 있게 전달됩니다",
      badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      bar: "bg-emerald-500",
    };
  }

  if (score >= 60) {
    return {
      label: "보통",
      text: "보강하면 더 선명해집니다",
      badge: "bg-blue-50 text-blue-700 ring-blue-200",
      bar: "bg-blue-500",
    };
  }

  return {
    label: "보완 필요",
    text: "우선순위 개선이 필요합니다",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    bar: "bg-amber-500",
  };
}

export function ScoreCard({
  label,
  score,
  icon: Icon,
  description,
}: ScoreCardProps) {
  const status = getScoreStatus(score);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <Icon className="size-4.5" />
        </div>
        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] font-extrabold ring-1 ${status.badge}`}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <p className="text-sm font-extrabold text-slate-700">{label}</p>
        {description ? (
          <details className="relative">
            <summary className="flex size-5 cursor-pointer list-none items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-500 transition hover:bg-blue-50 hover:text-blue-700">
              ?
            </summary>
            <div className="absolute right-0 top-7 z-10 w-56 rounded-2xl border border-slate-200 bg-white p-3 text-xs font-semibold leading-5 text-slate-600 shadow-xl shadow-slate-200/80">
              {description}
            </div>
          </details>
        ) : null}
      </div>
      <div className="mt-1 flex items-end gap-1">
        <p className="text-3xl font-black tracking-[-0.04em] text-slate-950">
          {score}
        </p>
        <span className="pb-1 text-[13px] font-bold text-slate-400">/100</span>
      </div>
      <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
        {status.text}
      </p>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${status.bar}`}
          style={{ width: `${Math.max(0, Math.min(score, 100))}%` }}
        />
      </div>
    </article>
  );
}
