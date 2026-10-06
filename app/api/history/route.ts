import { getSupabaseAdmin, isSupabaseConfigured, withSupabaseTimeout } from "@/lib/supabase";
import { checkMutation, consumeLimit, jsonResponse, ownerSession, readJson, requestFailure } from "@/lib/security";
import { RequestError, validateCompleted, validateId, validateResult } from "@/lib/validation";
import { getReviewScore } from "@/lib/review";
import { JOB_ROLES, type JobRole } from "@/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const site = request.headers.get("sec-fetch-site");
    if (site && !["same-origin", "none"].includes(site)) throw new RequestError("이 사이트에서 기록을 열어 주세요.", 403);
    const session = await ownerSession(true);
    if (!isSupabaseConfigured()) return jsonResponse({ enabled: false, items: [], message: "저장 기능은 현재 사용할 수 없습니다." }, session);
    const database = getSupabaseAdmin();
    if (!database || !session) throw new Error("Storage unavailable");
    const { data, error } = await withSupabaseTimeout(database.from("analyses")
      .select("id, role, portfolio_url, tech_stack, result_json, completed_priorities, share_token_hash, share_expires_at, created_at")
      .eq("owner_hash", session.hash).order("created_at", { ascending: false }).limit(12));
    if (error) throw new Error("History unavailable");
    const items = (data ?? []).flatMap((row) => {
      try {
        if (!JOB_ROLES.includes(row.role as JobRole)) return [];
        const result = validateResult(row.result_json);
        return [{ id: row.id, role: row.role, portfolioUrl: row.portfolio_url, techStack: row.tech_stack,
          score: getReviewScore(result, row.role as JobRole), summary: result.overallComment,
          completed: validateCompleted(row.completed_priorities).length, shared: Boolean(row.share_token_hash && new Date(row.share_expires_at).getTime() > Date.now()), createdAt: row.created_at }];
      } catch { return []; }
    });
    return jsonResponse({ enabled: true, items }, session);
  } catch (error) { return requestFailure(error); }
}

export async function DELETE(request: Request) {
  try {
    checkMutation(request);
    const session = await ownerSession();
    if (!session) throw new RequestError("이 브라우저의 기록만 삭제할 수 있습니다.", 401);
    const id = validateId(new URL(request.url).searchParams.get("id"));
    const database = getSupabaseAdmin();
    if (!database) throw new RequestError("저장 기능을 사용할 수 없습니다.", 503);
    await consumeLimit("storage:global", 200, 3600);
    await consumeLimit("delete:" + session.hash, 30, 3600);
    const { data, error } = await withSupabaseTimeout(database.from("analyses").delete().eq("id", id).eq("owner_hash", session.hash).select("id"));
    if (error) throw new Error("Delete failed");
    if (!data?.length) throw new RequestError("기록을 찾을 수 없습니다.", 404);
    return jsonResponse({ deleted: true });
  } catch (error) { return requestFailure(error); }
}

export async function PATCH(request: Request) {
  try {
    const session = await ownerSession();
    if (!session) throw new RequestError("이 브라우저의 기록만 수정할 수 있습니다.", 401);
    const body = await readJson(request, 3000) as Record<string, unknown>;
    const id = validateId(body?.id);
    const completed = validateCompleted(body?.completedPriorities);
    const database = getSupabaseAdmin();
    if (!database) throw new RequestError("저장 기능을 사용할 수 없습니다.", 503);
    await consumeLimit("storage:global", 200, 3600);
    await consumeLimit("progress:" + session.hash, 60, 3600);
    const { data, error } = await withSupabaseTimeout(database.from("analyses").update({ completed_priorities: completed }).eq("id", id).eq("owner_hash", session.hash).select("id"));
    if (error) throw new Error("Progress update failed");
    if (!data?.length) throw new RequestError("기록을 찾을 수 없습니다.", 404);
    return jsonResponse({ updated: true });
  } catch (error) { return requestFailure(error); }
}
