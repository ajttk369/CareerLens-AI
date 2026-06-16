import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { AnalysisResult } from "@/types";

export const runtime = "nodejs";

type AnalysisRow = {
  id: string;
  role: string;
  portfolio_url: string | null;
  tech_stack: string;
  result_json: AnalysisResult;
  created_at: string;
};

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      enabled: false,
      items: [],
      message: "Supabase 환경변수가 없어 히스토리를 불러올 수 없습니다.",
    });
  }

  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      throw new Error("Supabase 클라이언트를 초기화하지 못했습니다.");
    }

    const { data, error } = await supabase
      .from("analyses")
      .select("id, role, portfolio_url, tech_stack, result_json, created_at")
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) {
      throw error;
    }

    const items = ((data ?? []) as AnalysisRow[]).map((item) => {
      const scores = Object.values(item.result_json.scores);
      const average = Math.round(
        scores.reduce((sum, score) => sum + score, 0) / scores.length,
      );

      return {
        id: item.id,
        role: item.role,
        portfolioUrl: item.portfolio_url,
        techStack: item.tech_stack,
        score: average,
        summary: item.result_json.overallComment,
        createdAt: item.created_at,
      };
    });

    return NextResponse.json({ enabled: true, items });
  } catch (error) {
    console.error("Failed to load analysis history", error);

    return NextResponse.json(
      {
        enabled: true,
        items: [],
        message: "저장된 분석 결과를 불러오지 못했습니다.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        deleted: false,
        message: "Supabase 환경변수가 없어 삭제 기능을 사용할 수 없습니다.",
      },
      { status: 503 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { deleted: false, message: "삭제할 분석 결과 ID가 없습니다." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

    if (!supabase) {
      throw new Error("Supabase 클라이언트를 초기화하지 못했습니다.");
    }

    const { error } = await supabase.from("analyses").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Failed to delete analysis history item", error);

    return NextResponse.json(
      {
        deleted: false,
        message: "저장된 분석 결과를 삭제하지 못했습니다.",
      },
      { status: 500 },
    );
  }
}
