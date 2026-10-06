import { getSupabaseAdmin, withSupabaseTimeout } from "@/lib/supabase";
import { consumeLimit, hashToken, jsonResponse, newToken, ownerSession, readJson, requestFailure } from "@/lib/security";
import { RequestError, validateId } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await ownerSession();
    if (!session) throw new RequestError("이 브라우저의 기록만 공유할 수 있습니다.", 401);
    const body = await readJson(request, 3000) as Record<string, unknown>;
    const id = validateId(body?.id);
    if (typeof body?.enabled !== "boolean") throw new RequestError("공유 설정을 확인해 주세요.");
    const database = getSupabaseAdmin();
    if (!database) throw new RequestError("공유 기능을 사용할 수 없습니다.", 503);
    await consumeLimit("storage:global", 200, 3600);
    await consumeLimit("share:" + session.hash, 30, 3600);
    const token = body.enabled ? newToken() : null;
    const expires = token ? new Date(Date.now() + 7 * 86400000).toISOString() : null;
    const { data, error } = await withSupabaseTimeout(database.from("analyses")
      .update({ share_token_hash: token ? hashToken(token) : null, share_expires_at: expires })
      .eq("id", id).eq("owner_hash", session.hash).select("id"));
    if (error) throw new Error("Share update failed");
    if (!data?.length) throw new RequestError("기록을 찾을 수 없습니다.", 404);
    return jsonResponse({ shared: Boolean(token), path: token ? "/share/" + token : null, expiresAt: expires });
  } catch (error) { return requestFailure(error); }
}
