export const JOB_ROLES = [
  "프론트엔드",
  "웹디자인",
  "콘텐츠 제작",
  "풀스택",
  "AI 활용 직무",
] as const;

export type JobRole = (typeof JOB_ROLES)[number];

export type AnalysisInput = {
  role: JobRole;
  portfolioUrl: string;
  inputText: string;
  techStack: string;
};

export type ScoreKey =
  | "firstImpression"
  | "technicalSkill"
  | "communication"
  | "designQuality"
  | "roleFit";

export type AnalysisScores = Record<ScoreKey, number>;

export type PriorityItem = {
  title: string;
  reason: string;
  action: string;
};

export type AnalysisResult = {
  scores: AnalysisScores;
  overallComment: string;
  strengths: string[];
  weaknesses: string[];
  priorities: PriorityItem[];
  improvedDescription: string;
  interviewQuestions: string[];
  interviewAnswers?: string[];
};

export type AnalyzeResponse = {
  result: AnalysisResult;
  storageEnabled: boolean;
};

export type SavePayload = AnalysisInput & {
  result: AnalysisResult;
};
