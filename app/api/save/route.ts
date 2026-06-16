import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { SavePayload } from "@/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        saved: false,
        disabled: true,
        message:
          "Supabase 환경변수가 없어 저장 기능이 비활성화되어 있습니다.",
      },
      { status: 503 },
    );
  }

  try {
    const payload = (await request.json()) as SavePayload;

    if (!payload.role || !payload.inputText || !payload.result) {
      return NextResponse.json(
        { saved: false, message: "저장할 분석 결과가 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

    if (!supabase) {
      throw new Error("Supabase 클라이언트를 초기화하지 못했습니다.");
    }

    const { data, error } = await supabase
      .from("analyses")
      .insert({
        role: payload.role,
        portfolio_url: payload.portfolioUrl || null,
        input_text: payload.inputText,
        tech_stack: payload.techStack,
        result_json: payload.result,
      })
      .select("id, created_at")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      saved: true,
      id: data.id,
      createdAt: data.created_at,
    });
  } catch (error) {
    console.error("Failed to save analysis", error);

    return NextResponse.json(
      {
        saved: false,
        message:
          "분석 결과를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.",
      },
      { status: 500 },
    );
  }
}
