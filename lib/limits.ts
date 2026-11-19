// 공개 링크라서 질문 길이와 사용량에 상한을 둔다 (CLAUDE.md 보안 규칙).
export const MAX_QUESTION_CHARS = 500;
export const MAX_HISTORY_MESSAGES = 6;
export const MAX_HISTORY_CHARS = 1500;

export const TICKET_LIMITS = { cohort: 20, name: 30, contact: 60, content: 1000 } as const;

/** 한 사람(IP)이 정해진 시간 안에 보낼 수 있는 횟수 */
export const RATE = {
  chat: { max: 20, windowMs: 10 * 60_000 }, // 질문 10분에 20개
  ticket: { max: 5, windowMs: 60 * 60_000 }, // 접수 1시간에 5건
  login: { max: 10, windowMs: 15 * 60_000 }, // 담당자 로그인 15분에 10번
  attendance: { max: 10, windowMs: 10 * 60_000 }, // 출결 조회 10분에 10번 (이름을 하나씩 넣어 명단을 훑지 못하게)
} as const;

// 서버 메모리에 기록하는 간단한 제한. (Vercel은 인스턴스가 여러 개일 수 있어 대략적인 상한이다)
const hits = new Map<string, number[]>();

export function rateLimited(kind: keyof typeof RATE, key: string): boolean {
  const { max, windowMs } = RATE[kind];
  const now = Date.now();
  const id = `${kind}:${key}`;
  const recent = (hits.get(id) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(id, recent);
    return true;
  }
  recent.push(now);
  hits.set(id, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return false;
}

export function clientKey(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "local";
}
