import { EXPERIENCE_LEVELS, JOB_ROLES, SCORE_KEYS, type AnalysisInput, type AnalysisResult, type PortfolioProject } from "@/types";

export class RequestError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new RequestError("입력 형식이 올바르지 않습니다.");
  return value as Record<string, unknown>;
}
function text(value: unknown, name: string, max: number, required = false) {
  if (value === undefined && !required) return "";
  if (typeof value !== "string") throw new RequestError(`${name} 형식을 확인해 주세요.`);
  const result = value.trim();
  if ((required && !result) || result.length > max) throw new RequestError(`${name}은(는) ${required ? "1~" : "최대 "}${max.toLocaleString()}자로 입력해 주세요.`);
  return result;
}
export function httpUrl(value: unknown, name = "URL") {
  const result = text(value, name, 2048);
  if (!result) return result;
  try {
    const url = new URL(result);
    if (!["https:", "http:"].includes(url.protocol) || !url.hostname || url.username || url.password) throw new Error();
  } catch { throw new RequestError(`${name}은(는) 올바른 http/https 주소로 입력해 주세요.`); }
  return result;
}
export function validateInput(value: unknown): AnalysisInput {
  const data = object(value);
  if (!JOB_ROLES.includes(data.role as AnalysisInput["role"])) throw new RequestError("지원 직무를 선택해 주세요.");
  const experience = data.experienceLevel ?? "신입";
  if (!EXPERIENCE_LEVELS.includes(experience as (typeof EXPERIENCE_LEVELS)[number])) throw new RequestError("경력 수준을 확인해 주세요.");
  let projects: PortfolioProject[] | undefined;
  let inputText: string;
  let introduction: string | undefined;
  if (data.projects !== undefined) {
    if (!Array.isArray(data.projects) || data.projects.length > 5) throw new RequestError("대표 프로젝트는 최대 5개까지 입력할 수 있습니다.");
    introduction = text(data.introduction, "소개", 12000);
    projects = data.projects.map((entry, index) => {
      const project = object(entry);
      return { id: text(project.id, "프로젝트 ID", 80, true), name: text(project.name, "프로젝트명", 100) || `프로젝트 ${index + 1}`, url: httpUrl(project.url, "프로젝트 URL"), contribution: text(project.contribution, "담당 역할", 500), description: text(project.description, "프로젝트 설명", 6000) };
    });
    const description = [introduction, ...projects.map((project) => project.description)].join("\n").trim();
    if (description.length < 80 || description.length > 12000) throw new RequestError("소개와 프로젝트 설명을 합쳐 80~12,000자로 입력해 주세요.");
    inputText = [introduction, ...projects.filter((project) => project.description || project.contribution).map((project) => `${project.name}\n담당 역할: ${project.contribution || "미입력"}\n${project.description}`)].filter(Boolean).join("\n\n");
    if (inputText.length > 15000) throw new RequestError("프로젝트 설명과 역할을 조금 줄여 주세요.");
  } else {
    inputText = text(data.inputText, "설명", 12000, true);
    if (inputText.length < 80) throw new RequestError("설명을 80자 이상 입력해 주세요.");
  }
  return {
    role: data.role as AnalysisInput["role"], portfolioUrl: httpUrl(data.portfolioUrl), inputText,
    techStack: text(data.techStack, "주요 기술 / 도구", 800, true), experienceLevel: experience as AnalysisInput["experienceLevel"], jobDescription: text(data.jobDescription, "채용 공고", 6000),
    ...(projects ? { projects, introduction } : {}),
  };
}
function strings(value: unknown, name: string, min: number, max: number, length = 2500) {
  if (!Array.isArray(value) || value.length < min || value.length > max) throw new RequestError(`${name} 형식이 올바르지 않습니다.`);
  return value.map((item) => text(item, name, length, true));
}
export function validateResult(value: unknown): AnalysisResult {
  const data = object(value);
  const scores = object(data.scores);
  const evidence = object(data.scoreEvidence);
  const parsedScores = {} as AnalysisResult["scores"];
  const parsedEvidence = {} as AnalysisResult["scoreEvidence"];
  for (const key of SCORE_KEYS) {
    const score = scores[key];
    if (score !== null && (typeof score !== "number" || !Number.isInteger(score) || score < 0 || score > 100)) throw new RequestError("점수 형식이 올바르지 않습니다.");
    parsedScores[key] = score as number | null;
    const item = object(evidence[key]);
    parsedEvidence[key] = { quote: text(item.quote, "점수 근거", 1200), reason: text(item.reason, "점수 설명", 1600, true) };
  }
  if (!Array.isArray(data.priorities) || data.priorities.length !== 5) throw new RequestError("개선 항목 형식이 올바르지 않습니다.");
  return {
    scores: parsedScores, scoreEvidence: parsedEvidence, overallComment: text(data.overallComment, "총평", 2500, true),
    strengths: strings(data.strengths, "강점", 3, 3), weaknesses: strings(data.weaknesses, "보완점", 3, 3), missingInformation: strings(data.missingInformation, "추가 정보", 0, 5),
    priorities: data.priorities.map((value) => { const item = object(value); return { title: text(item.title, "제목", 150, true), reason: text(item.reason, "이유", 2000, true), action: text(item.action, "수정 제안", 2500, true), evidence: text(item.evidence, "입력 근거", 1200) }; }),
    improvedDescription: text(data.improvedDescription, "개선 문구", 8000, true), interviewQuestions: strings(data.interviewQuestions, "면접 질문", 5, 5, 1200), interviewAnswers: strings(data.interviewAnswers, "답변 초안", 5, 5), interviewIntents: strings(data.interviewIntents, "질문 의도", 5, 5, 1200),
  };
}
export function validateCompleted(value: unknown): number[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 5 || value.some((index) => !Number.isInteger(index) || index < 0 || index > 4)) throw new RequestError("체크리스트 형식이 올바르지 않습니다.");
  return [...new Set(value as number[])].sort();
}
export function validateId(value: unknown) {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) throw new RequestError("리포트 주소가 올바르지 않습니다.");
  return value;
}
