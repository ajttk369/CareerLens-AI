import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { AnalysisInput, AnalysisResult } from "@/types";
import { RequestError } from "@/lib/validation";
import { getSupabaseAdmin, withSupabaseTimeout } from "@/lib/supabase";

const COOKIE_NAME = "careerlens_owner";
export const hashToken = (value: string) => createHash("sha256").update(value).digest("hex");
export const newToken = () => randomBytes(32).toString("hex");
export async function ownerSession(create = false) {
  const existing = (await cookies()).get(COOKIE_NAME)?.value;
  const token = existing && /^[a-f0-9]{64}$/.test(existing) ? existing : create ? newToken() : null;
  return token ? { token, hash: hashToken(token), fresh: token !== existing } : null;
}
export function jsonResponse(data: unknown, session?: Awaited<ReturnType<typeof ownerSession>>, status = 200) {
  const response = NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store", "Vary": "Cookie" } });
  if (session?.fresh) response.cookies.set(COOKIE_NAME, session.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return response;
}
export function checkMutation(request: Request) {
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  if ((origin && origin !== new URL(request.url).origin) || (site && !["same-origin", "none"].includes(site))) throw new RequestError("이 사이트에서 다시 요청해 주세요.", 403);
  if (request.method !== "DELETE" && !/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) throw new RequestError("JSON 요청만 사용할 수 있습니다.", 415);
}
export async function readJson(request: Request, maxBytes = 180_000) {
  checkMutation(request);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError("입력 내용이 없습니다.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new RequestError("입력 데이터가 너무 큽니다.", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown; }
  catch { throw new RequestError("입력 데이터를 읽을 수 없습니다."); }
}
function signingKey() {
  const key = process.env.ANALYSIS_SIGNING_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.OPENAI_API_KEY;
  if (!key) throw new RequestError("현재 저장 기능을 사용할 수 없습니다.", 503);
  return key;
}
function signature(owner: string, input: AnalysisInput, result: AnalysisResult, issued: string) {
  return createHmac("sha256", signingKey()).update(JSON.stringify({ owner, input, result, issued })).digest("hex");
}
export function issueReceipt(owner: string, input: AnalysisInput, result: AnalysisResult) {
  const issued = String(Date.now());
  return `${issued}.${signature(owner, input, result, issued)}`;
}
export function verifyReceipt(receipt: unknown, owner: string, input: AnalysisInput, result: AnalysisResult) {
  if (typeof receipt !== "string" || !/^\d{13}\.[a-f0-9]{64}$/.test(receipt)) throw new RequestError("실제 분석을 완료한 결과만 저장할 수 있습니다.");
  const [issued, supplied] = receipt.split(".");
  const age = Date.now() - Number(issued);
  if (age < 0 || age > 2 * 60 * 60 * 1000) throw new RequestError("저장 가능 시간이 지났습니다. 다시 분석해 주세요.");
  if (!timingSafeEqual(Buffer.from(supplied, "hex"), Buffer.from(signature(owner, input, result, issued), "hex"))) throw new RequestError("분석 결과가 변경되었습니다. 다시 분석해 주세요.", 403);
  return hashToken(receipt);
}
export function requestFailure(error: unknown) {
  if (error instanceof RequestError) return jsonResponse({ error: error.message, message: error.message }, null, error.status);
  console.error("CareerLens request failed", { name: error instanceof Error ? error.name : "UnknownError" });
  return jsonResponse({ error: "요청을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.", message: "요청을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요." }, null, 503);
}
export async function consumeLimit(key: string, limit: number, seconds: number) {
  const database = getSupabaseAdmin();
  if (!database) throw new RequestError("현재 요청을 처리할 수 없습니다. 데모 결과를 이용해 주세요.", 503);
  const { data, error } = await withSupabaseTimeout(database.rpc("consume_careerlens_limit", { p_key: hashToken(key), p_limit: limit, p_window_seconds: seconds }));
  if (error) throw new RequestError("서비스 설정을 준비 중입니다. 잠시 후 다시 이용해 주세요.", 503);
  if (data !== true) throw new RequestError("사용 횟수 제한에 도달했습니다. 잠시 후 다시 이용해 주세요.", 429);
}
export async function analysisLimits(owner: string, request: Request) {
  const configured = Number(process.env.ANALYSIS_DAILY_LIMIT ?? 30);
  const daily = Number.isInteger(configured) && configured > 0 ? Math.min(configured, 200) : 30;
  // Consume the global budget first so rotating anonymous sessions cannot grow quota rows indefinitely.
  await consumeLimit("analysis:global", daily, 86400);
  await consumeLimit(`analysis:owner:${owner}`, 5, 86400);
  if (process.env.VERCEL === "1") {
    const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
    if (ip) await consumeLimit(`analysis:ip:${ip}`, 10, 3600);
  }
}
