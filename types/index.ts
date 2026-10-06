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
  introduction?: string;
  projects?: PortfolioProject[];
  jobDescription?: string;
  experienceLevel?: (typeof EXPERIENCE_LEVELS)[number];
};

export const EXPERIENCE_LEVELS = ["신입", "주니어", "경력"] as const;
export const SCORE_KEYS = ["firstImpression", "technicalSkill", "communication", "designQuality", "roleFit"] as const;
export type PortfolioProject = { id: string; name: string; url: string; contribution: string; description: string };

export type ScoreKey =
  | "firstImpression"
  | "technicalSkill"
  | "communication"
  | "designQuality"
  | "roleFit";

export type AnalysisScores = Record<ScoreKey, number | null>;

export type PriorityItem = {
  title: string;
  reason: string;
  action: string;
  evidence: string;
};

export type AnalysisResult = {
  scores: AnalysisScores;
  scoreEvidence: Record<ScoreKey, { quote: string; reason: string }>;
  overallComment: string;
  strengths: string[];
  weaknesses: string[];
  missingInformation: string[];
  priorities: PriorityItem[];
  improvedDescription: string;
  interviewQuestions: string[];
  interviewAnswers: string[];
  interviewIntents: string[];
};

export type AnalyzeResponse = {
  result: AnalysisResult;
  input: AnalysisInput;
  storageEnabled: boolean;
  mode: "demo" | "ai";
  receipt?: string;
};

export type SavePayload = AnalysisInput & {
  result: AnalysisResult;
  receipt: string;
  completedPriorities?: number[];
};
