"use client";

export async function requestJson<T>(url: string, options: RequestInit = {}, milliseconds = 45000): Promise<T> {
  const controller = new AbortController();
  const external = options.signal;
  const abort = () => controller.abort();
  if (external?.aborted) abort();
  else external?.addEventListener("abort", abort, { once: true });
  const timeout = window.setTimeout(abort, milliseconds);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal, cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.message || "요청을 완료하지 못했습니다.");
    return data as T;
  } catch (error) {
    if (controller.signal.aborted) throw new Error("요청이 취소되었거나 시간이 초과되었습니다. 다시 시도해 주세요.");
    throw error;
  } finally {
    window.clearTimeout(timeout);
    external?.removeEventListener("abort", abort);
  }
}
let initialHistory: Promise<unknown> | undefined;
export function initializeHistory<T>(): Promise<T> {
  if (!initialHistory) initialHistory = requestJson("/api/history").catch((error) => { initialHistory = undefined; throw error; });
  return initialHistory as Promise<T>;
}
