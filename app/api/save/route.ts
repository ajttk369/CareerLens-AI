import { getSupabaseAdmin, withSupabaseTimeout } from "@/lib/supabase";
import { consumeLimit, jsonResponse, ownerSession, readJson, requestFailure, verifyReceipt } from "@/lib/security";
import { RequestError, validateCompleted, validateInput, validateResult } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await ownerSession();
    if (!session) throw new RequestError("이 브라우저에서 다시 분석해 주세요.", 401);
    const body = await readJson(request) as Record<string, unknown>;
    const input = validateInput(body);
    const result = validateResult(body.result);
    const receiptHash = verifyReceipt(body.receipt, session.hash, input, result);
    const completed = validateCompleted(body.completedPriorities);
    const database = getSupabaseAdmin();
    if (!database) throw new RequestError("현재 저장 기능을 사용할 수 없습니다.", 503);
    await consumeLimit("storage:global", 200, 3600);
    await consumeLimit("save:" + session.hash, 20, 3600);
    const { data, error } = await withSupabaseTimeout(database.from("analyses").insert({
      owner_hash: session.hash, role: input.role, portfolio_url: input.portfolioUrl || null,
      input_text: input.inputText, input_json: input, tech_stack: input.techStack,
      result_json: result, completed_priorities: completed, receipt_hash: receiptHash,
    }).select("id, created_at").single());
    if (error?.code === "23505") {
      const existing = await withSupabaseTimeout(database.from("analyses").select("id, created_at").eq("receipt_hash", receiptHash).eq("owner_hash", session.hash).single());
      if (!existing.error && existing.data) return jsonResponse({ saved: true, id: existing.data.id, createdAt: existing.data.created_at });
    }
    if (error || !data) throw new Error("Save failed");
    return jsonResponse({ saved: true, id: data.id, createdAt: data.created_at });
  } catch (error) { return requestFailure(error); }
}
