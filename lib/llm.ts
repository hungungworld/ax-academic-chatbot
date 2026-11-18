// Gemini 채팅 모델 호출. 모델 이름은 .env 에서 읽는다.
// 무료 모델은 "high demand(503)"로 자주 실패하므로, 실패하거나 오래 걸리면 예비 모델로 한 번 더 시도한다.
//   GEMINI_MODEL           기본 모델
//   GEMINI_FALLBACK_MODEL  예비 모델 (쉼표로 여러 개 가능, 선택)
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { BaseMessageLike } from "@langchain/core/messages";
import type { z } from "zod";

const TIMEOUT_MS = 15_000;

function modelNames(): string[] {
  const names = [process.env.GEMINI_MODEL, ...(process.env.GEMINI_FALLBACK_MODEL ?? "").split(",")]
    .map((s) => s?.trim())
    .filter((s): s is string => !!s);
  return [...new Set(names)];
}

const cache = new Map<string, ChatGoogleGenerativeAI>();
function model(name: string) {
  let m = cache.get(name);
  if (!m) {
    // 재시도는 여기서 직접 하므로 라이브러리 재시도는 끈다 (끄지 않으면 수십 초씩 기다림).
    m = new ChatGoogleGenerativeAI({ model: name, temperature: 0, maxRetries: 0, maxOutputTokens: 2048 });
    cache.set(name, m);
  }
  return m;
}

export function llmProblem(): string | null {
  if (!process.env.GOOGLE_API_KEY) return "GOOGLE_API_KEY 환경변수가 없습니다.";
  if (!modelNames().length) return "GEMINI_MODEL 환경변수가 없습니다.";
  return null;
}

/** 스키마에 맞는 JSON 결과를 받는다. 모든 모델이 실패하면 마지막 오류를 던진다. */
export async function structured<T extends Record<string, unknown>>(
  schema: z.ZodType<T>,
  messages: BaseMessageLike[],
): Promise<T> {
  let lastError: unknown = new Error("사용할 모델이 없습니다.");
  const names = modelNames();
  // 최근에 실패한 모델은 잠시 건너뛴다. 모두 쉬는 중이면 원래 순서대로 다시 시도한다.
  const ready = names.filter((n) => (coolUntil.get(n) ?? 0) < Date.now());
  for (const name of ready.length ? ready : names) {
    try {
      const runnable = model(name).withStructuredOutput(schema);
      const out = (await runnable.invoke(messages, { signal: AbortSignal.timeout(TIMEOUT_MS) })) as T;
      coolUntil.delete(name);
      return out;
    } catch (e) {
      lastError = e;
      coolUntil.set(name, Date.now() + COOLDOWN_MS);
      console.warn(`[llm] ${name} 실패:`, e instanceof Error ? e.message.slice(0, 160) : e);
    }
  }
  throw lastError;
}

const COOLDOWN_MS = 2 * 60_000;
const coolUntil = new Map<string, number>();
