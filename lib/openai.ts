import OpenAI from "openai";
import type { AnalysisInput, AnalysisResult } from "@/types";

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "scores",
    "overallComment",
    "strengths",
    "weaknesses",
    "priorities",
    "improvedDescription",
    "interviewQuestions",
    "interviewAnswers",
  ],
  properties: {
    scores: {
      type: "object",
      additionalProperties: false,
      required: [
        "firstImpression",
        "technicalSkill",
        "communication",
        "designQuality",
        "roleFit",
      ],
      properties: {
        firstImpression: { type: "integer", minimum: 0, maximum: 100 },
        technicalSkill: { type: "integer", minimum: 0, maximum: 100 },
        communication: { type: "integer", minimum: 0, maximum: 100 },
        designQuality: { type: "integer", minimum: 0, maximum: 100 },
        roleFit: { type: "integer", minimum: 0, maximum: 100 },
      },
    },
    overallComment: { type: "string" },
    strengths: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" },
    },
    weaknesses: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" },
    },
    priorities: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "reason", "action"],
        properties: {
          title: { type: "string" },
          reason: { type: "string" },
          action: { type: "string" },
        },
      },
    },
    improvedDescription: { type: "string" },
    interviewQuestions: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: { type: "string" },
    },
    interviewAnswers: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: { type: "string" },
    },
  },
} as const;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY가 설정되지 않았습니다.");
  }

  return new OpenAI({ apiKey });
}

export async function analyzePortfolio(
  input: AnalysisInput,
): Promise<AnalysisResult> {
  const client = getOpenAIClient();

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5-mini",
    instructions: [
      "당신은 10년 경력의 IT 채용 담당자이자 포트폴리오 리뷰어입니다.",
      "지원자의 입력만 근거로 평가하고 확인할 수 없는 경력이나 성과를 만들어내지 마세요.",
      "채용자가 30초 안에 판단한다는 관점에서 구체적이고 실행 가능한 피드백을 한국어로 작성하세요.",
      "점수는 0에서 100 사이 정수이며, 근거가 부족한 항목은 보수적으로 평가하세요.",
      "개선 문구는 지원자가 포트폴리오에 바로 사용할 수 있는 완성된 문단으로 작성하세요.",
      "URL은 직접 탐색하지 못할 수 있으므로 URL 자체보다 사용자가 제공한 본문을 우선 분석하세요.",
      "interviewQuestions와 interviewAnswers는 같은 순서로 5개씩 작성하고, 답변은 지원자가 실제 면접에서 말할 수 있는 3~5문장 예시로 작성하세요.",
    ].join("\n"),
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: [
              `지원 직무: ${input.role}`,
              `포트폴리오 URL: ${input.portfolioUrl || "입력 없음"}`,
              `주요 기술 스택: ${input.techStack}`,
              "",
              "자기소개서 또는 프로젝트 설명:",
              input.inputText,
            ].join("\n"),
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "career_portfolio_review",
        strict: true,
        schema: analysisSchema,
      },
    },
  });

  if (!response.output_text) {
    throw new Error("AI 분석 결과를 생성하지 못했습니다.");
  }

  return JSON.parse(response.output_text) as AnalysisResult;
}
