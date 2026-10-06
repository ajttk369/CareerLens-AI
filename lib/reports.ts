import "server-only";
import { getSupabaseAdmin, withSupabaseTimeout } from "@/lib/supabase";
import { hashToken, ownerSession } from "@/lib/security";
import { validateCompleted, validateId, validateInput, validateResult } from "@/lib/validation";

export async function readReport(key: string, shared = false) {
  try {
    const database = getSupabaseAdmin();
    if (!database) return null;
    let query = database.from("analyses").select("id, input_json, result_json, completed_priorities, share_token_hash, share_expires_at, created_at");
    if (shared) {
      if (!/^[a-f0-9]{64}$/.test(key)) return null;
      query = query.eq("share_token_hash", hashToken(key)).gt("share_expires_at", new Date().toISOString());
    } else {
      const session = await ownerSession();
      if (!session) return null;
      query = query.eq("id", validateId(key)).eq("owner_hash", session.hash);
    }
    const { data, error } = await withSupabaseTimeout(query.single());
    if (error || !data) return null;
    return { id: data.id as string, input: validateInput(data.input_json), result: validateResult(data.result_json), completed: validateCompleted(data.completed_priorities), shared: Boolean(data.share_token_hash && new Date(data.share_expires_at).getTime() > Date.now()), createdAt: data.created_at as string };
  } catch { return null; }
}
