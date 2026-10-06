import { SCORE_KEYS, type AnalysisResult, type JobRole, type ScoreKey } from "@/types";

export const SCORE_LABELS: Record<ScoreKey, string> = {
  firstImpression: "핵심 소개", technicalSkill: "직무 경험 근거", communication: "역할과 전달력", designQuality: "설명 구조", roleFit: "직무 연결성",
};
export const SCORE_CRITERIA: Record<ScoreKey, string> = {
  firstImpression: "프로젝트 목적과 강점이 설명의 앞부분에 드러나는지",
  technicalSkill: "직무에 필요한 기술이나 방법을 적용한 구체적인 경험이 있는지",
  communication: "본인의 역할, 판단, 결과가 구분되어 전달되는지",
  designQuality: "설명이 문제, 역할, 해결 과정, 결과 순서로 구성되는지",
  roleFit: "지원 직무 및 제공된 채용 공고와 경험이 연결되는지",
};
const weights: Record<JobRole, number[]> = {
  "프론트엔드": [1, 3, 2, 1, 3], "풀스택": [1, 3, 2, 1, 3], "웹디자인": [1, 2, 2, 3, 2], "콘텐츠 제작": [2, 1, 3, 2, 2], "AI 활용 직무": [1, 3, 2, 1, 3],
};
export function getReviewScore(result: AnalysisResult, role: JobRole): number | null {
  let total = 0;
  let divisor = 0;
  SCORE_KEYS.forEach((key, index) => {
    const score = result.scores[key];
    if (score !== null && Number.isFinite(score)) {
      const weight = (weights[role] ?? weights["프론트엔드"])[index];
      total += score * weight;
      divisor += weight;
    }
  });
  return divisor ? Math.round(total / divisor) : null;
}
export function getReviewText(result: AnalysisResult, role: JobRole) {
  return [
    `CareerLens AI | ${role} 설명 리뷰`,
    "입력한 텍스트 기준의 참고 평가이며 실제 사이트, 코드, 채용 가능성을 평가하지 않습니다.",
    `설명 준비도: ${getReviewScore(result, role) ?? "평가 보류"}`, result.overallComment,
    ...SCORE_KEYS.map((key) => `${SCORE_LABELS[key]}: ${result.scores[key] ?? "정보 부족"}\n근거: ${result.scoreEvidence[key].quote || "입력 근거 없음"}\n${result.scoreEvidence[key].reason}`),
    "[강점]", ...result.strengths, "[보완점]", ...result.weaknesses, "[추가로 필요한 정보]", ...result.missingInformation,
    "[개선 작업]", ...result.priorities.map((item, index) => `${index + 1}. ${item.title}\n근거: ${item.evidence || "입력 근거 없음"}\n이유: ${item.reason}\n수정: ${item.action}`),
    "[문구 제안]", result.improvedDescription,
    "[면접 준비]", ...result.interviewQuestions.map((question, index) => `${question}\n질문 의도: ${result.interviewIntents[index]}\n답변 초안: ${result.interviewAnswers[index]}`),
  ].join("\n\n");
}
