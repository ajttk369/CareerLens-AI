import { analyzePortfolio } from "@/lib/openai";
import { demoInput, getMockAnalysisResult, isMockAnalysisEnabled } from "@/lib/mock-analysis";
import { isSupabaseConfigured } from "@/lib/supabase";
import { analysisLimits, issueReceipt, jsonResponse, ownerSession, readJson, requestFailure } from "@/lib/security";
import { validateInput } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const deadline = AbortSignal.timeout(50_000);
  try {
    const input = validateInput(await readJson(request, 100_000));
    const session = await ownerSession(true);
    if (!session) throw new Error("Session unavailable");
    if (isMockAnalysisEnabled()) {
      return jsonResponse({ result: getMockAnalysisResult(), input: validateInput(demoInput), storageEnabled: false, mode: "demo" }, session);
    }
    await analysisLimits(session.hash, request);
    const result = await analyzePortfolio(input, AbortSignal.any([request.signal, deadline]));
    return jsonResponse({ result, input, storageEnabled: isSupabaseConfigured(), mode: "ai", receipt: issueReceipt(session.hash, input, result) }, session);
  } catch (error) { return requestFailure(error); }
}
