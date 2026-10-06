import { AlignLeft, Gauge, MessageSquareText, Sparkles, Target } from "lucide-react";
import { SCORE_CRITERIA, SCORE_LABELS } from "@/lib/review";
import type { AnalysisResult, ScoreKey } from "@/types";

export function getScoreStatus(score: number | null) {
  if (score === null) return { label: "정보 부족", tone: "unknown" };
  if (score >= 80) return { label: "구체적", tone: "good" };
  if (score >= 60) return { label: "보강 가능", tone: "normal" };
  return { label: "보완 필요", tone: "attention" };
}
const SCORE_ICONS = {
  firstImpression: Sparkles,
  technicalSkill: Gauge,
  communication: MessageSquareText,
  designQuality: AlignLeft,
  roleFit: Target,
};

export function ScoreCard({ scoreKey, result, expandedEvidence = false }: { scoreKey: ScoreKey; result: AnalysisResult; expandedEvidence?: boolean }) {
  const score = result.scores[scoreKey];
  const status = getScoreStatus(score);
  const evidence = result.scoreEvidence[scoreKey];
  const Icon = SCORE_ICONS[scoreKey];
  return <article className="score-card">
    <div className="score-card-top"><span className="score-icon"><Icon size={19} /></span><span className={"status-tag " + status.tone}>{status.label}</span></div>
    <h3>{SCORE_LABELS[scoreKey]}</h3>
    <strong className="score-value">{score ?? "—"}<small>{score === null ? "" : "/100"}</small></strong>
    <div className="score-bar" role={score === null ? undefined : "meter"} aria-label={SCORE_LABELS[scoreKey]} aria-valuemin={0} aria-valuemax={100} aria-valuenow={score ?? undefined}><span className={status.tone} style={{ width: (score ?? 0) + "%" }} /></div>
    <p className="score-reason">{evidence.reason}</p>
    <details className="score-evidence" open={expandedEvidence}><summary>평가 근거</summary>
      {evidence.quote && <blockquote className="evidence"><span>입력 근거</span>{evidence.quote}</blockquote>}
      <p className="criterion">{SCORE_CRITERIA[scoreKey]}</p>
    </details>
  </article>;
}
