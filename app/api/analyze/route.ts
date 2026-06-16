import { NextResponse } from "next/server";
import { getMockAnalysisResult, isMockAnalysisEnabled } from "@/lib/mock-analysis";
import { analyzePortfolio } from "@/lib/openai";
import { isSupabaseConfigured } from "@/lib/supabase";
import { JOB_ROLES, type AnalysisInput } from "@/types";

export const runtime = "nodejs";

class InputError extends Error {}

function validateInput(value: unknown): AnalysisInput {
  if (!value || typeof value !== "object") {
    throw new InputError("분석할 내용을 입력해주세요.");
  }

  const input = value as Partial<AnalysisInput>;
  const role = typeof input.role === "string" ? input.role.trim() : "";
  const portfolioUrl =
    typeof input.portfolioUrl === "string" ? input.portfolioUrl.trim() : "";
  const inputText =
    typeof input.inputText === "string" ? input.inputText.trim() : "";
  const techStack =
    typeof input.techStack === "string" ? input.techStack.trim() : "";

  if (!JOB_ROLES.includes(role as AnalysisInput["role"])) {
    throw new InputError("지원 직무를 선택해주세요.");
  }

  if (portfolioUrl && !/^https?:\/\/.+/i.test(portfolioUrl)) {
    throw new InputError(
      "포트폴리오 URL은 http 또는 https로 시작해야 합니다.",
    );
  }

  if (inputText.length < 80) {
    throw new InputError("분석 정확도를 위해 설명을 80자 이상 입력해주세요.");
  }

  if (inputText.length > 12000) {
    throw new InputError("설명은 12,000자 이하로 입력해주세요.");
  }

  if (techStack.length < 2) {
    throw new InputError("주요 기술 스택을 입력해주세요.");
  }

  return {
    role: role as AnalysisInput["role"],
    portfolioUrl,
    inputText,
    techStack,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = validateInput(body);

    if (isMockAnalysisEnabled()) {
      return NextResponse.json({
        result: getMockAnalysisResult(),
        storageEnabled: isSupabaseConfigured(),
      });
    }

    const result = await analyzePortfolio(input);

    return NextResponse.json({
      result,
      storageEnabled: isSupabaseConfigured(),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "분석 중 알 수 없는 오류가 발생했습니다.";

    const isConfigurationError = message.includes("OPENAI_API_KEY");
    const isInputError = error instanceof InputError;

    if (!isConfigurationError && !isInputError) {
      console.error("OpenAI analysis failed", error);
    }

    return NextResponse.json(
      {
        error: isConfigurationError
          ? "OPENAI_API_KEY가 설정되지 않았습니다. .env.local을 확인해주세요."
          : isInputError
            ? message
            : "AI 분석 요청을 처리하지 못했습니다. API 사용량 또는 결제 한도를 확인하고 잠시 후 다시 시도해주세요.",
      },
      {
        status: isConfigurationError ? 503 : isInputError ? 400 : 502,
      },
    );
  }
}
