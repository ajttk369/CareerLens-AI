import { ScoreCard } from "@/components/score-card";
import { getReviewScore } from "@/lib/review";
import { SCORE_KEYS, type AnalysisInput, type AnalysisResult } from "@/types";

export function ScoresSection({ result }: { result: AnalysisResult }) {
  return <section className="report-section"><h2>항목별 근거</h2><div className="score-list">{SCORE_KEYS.map((key) => <ScoreCard key={key} scoreKey={key} result={result} />)}</div>
    <details className="rubric print-hidden"><summary>점수 기준</summary><p>0~39: 핵심 맥락 부족 · 40~59: 일부 맥락 확인 · 60~79: 역할과 과정 확인 · 80~100: 문제·판단·결과 연결</p><p>근거가 없는 항목은 점수와 평균에서 제외합니다. 개발 직무는 경험 근거와 직무 연결성, 디자인은 설명 구조, 콘텐츠는 전달력에 더 높은 비중을 둡니다.</p></details></section>;
}
export function FindingsSection({ result }: { result: AnalysisResult }) {
  return <section className="report-section findings"><div><h2>잘 드러나는 점</h2><ul>{result.strengths.map((item, index) => <li key={index}>{item}</li>)}</ul></div><div><h2>보완할 점</h2><ul>{result.weaknesses.map((item, index) => <li key={index}>{item}</li>)}</ul></div></section>;
}
export function MissingSection({ result }: { result: AnalysisResult }) {
  return result.missingInformation.length ? <section className="report-section missing-information"><h2>추가하면 좋은 사실</h2><ul>{result.missingInformation.map((item, index) => <li key={index}>{item}</li>)}</ul></section> : null;
}
export function DescriptionSection({ input, result, includeOriginal = true }: { input: AnalysisInput; result: AnalysisResult; includeOriginal?: boolean }) {
  return <section className="report-section"><h2>{includeOriginal ? "설명 문구 비교" : "설명 문구 제안"}</h2><p className="muted">확인 필요로 표시된 사실은 실제 경험을 확인한 뒤 사용하세요.</p><div className={includeOriginal ? "description-comparison" : ""}>{includeOriginal && <div><h3>입력 원문</h3><p className="prose preserve-lines">{input.inputText}</p></div>}<div><h3>수정 제안</h3><p className="prose preserve-lines">{result.improvedDescription}</p></div></div></section>;
}
export function InterviewSection({ result }: { result: AnalysisResult }) {
  return <section className="report-section"><h2>면접 준비</h2><div className="interview-list">{result.interviewQuestions.map((question, index) => <article key={index}><span className="question-number">Q{index + 1}</span><div><h3>{question}</h3><p className="interview-intent">{result.interviewIntents[index]}</p><p className="prose">{result.interviewAnswers[index]}</p></div></article>)}</div></section>;
}
export function StaticPriorities({ result, completed = [] }: { result: AnalysisResult; completed?: number[] }) {
  return <section className="report-section"><h2>개선 작업</h2><ol className="static-priorities">{result.priorities.map((item, index) => <li key={index}><h3>{item.title} {completed.includes(index) ? "(완료)" : ""}</h3><p>{item.reason}</p>{item.evidence && <blockquote className="evidence"><span>입력 근거</span>{item.evidence}</blockquote>}<p className="action-text">{item.action}</p></li>)}</ol></section>;
}
export function ReportContent({ input, result, completed = [], mode = "ai", includeOriginal = true }: { input: AnalysisInput; result: AnalysisResult; completed?: number[]; mode?: "ai" | "demo"; includeOriginal?: boolean }) {
  const score = getReviewScore(result, input.role);
  return <div className="print-report">
    <header className="report-intro"><p className="eyebrow">CareerLens AI {mode === "demo" ? "· 가상 샘플" : "· 설명 리뷰"}</p><h1>{input.role} 포트폴리오 설명 리뷰</h1><p>{input.experienceLevel} · {input.techStack}</p><strong>설명 준비도 {score ?? "평가 보류"}{score === null ? "" : "/100"}</strong><p>{result.overallComment}</p><p className="scope-note">입력 텍스트만 분석한 참고 의견입니다. 실제 사이트, 코드, 디자인 화면이나 채용 가능성을 평가하지 않습니다.</p></header>
    <FindingsSection result={result} /><ScoresSection result={result} /><StaticPriorities result={result} completed={completed} /><MissingSection result={result} /><DescriptionSection input={input} result={result} includeOriginal={includeOriginal} /><InterviewSection result={result} />
  </div>;
}
