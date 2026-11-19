// 공개 링크라서 질문 길이와 사용량에 상한을 둔다 (CLAUDE.md 보안 규칙).
import type { NextResponse } from "next/server";
export const MAX_QUESTION_CHARS = 500;
export const MAX_HISTORY_MESSAGES = 6;
export const MAX_HISTORY_CHARS = 1500;

export const TICKET_LIMITS = { cohort: 20, name: 30, contact: 60, content: 1000 } as const;

/**
 * 정해진 시간 안에 보낼 수 있는 횟수.
 * 교육장 학생들은 같은 와이파이(같은 IP)를 쓰므로 IP로만 세면 반 전체가 한도를 나눠 쓰게 된다.
 * 그래서 사람(브라우저 쿠키)마다 세고, IP에는 넉넉한 전체 상한만 둔다 (쿠키를 지워 가며 보내는 것 차단).
 */
export const RATE = {
  chat: { max: 20, windowMs: 10 * 60_000 }, // 질문: 한 사람 10분에 20개
  chatIp: { max: 300, windowMs: 10 * 60_000 }, //       같은 IP 10분에 300개
  ticket: { max: 5, windowMs: 60 * 60_000 }, // 접수: 한 사람 1시간에 5건
  ticketIp: { max: 40, windowMs: 60 * 60_000 }, //       같은 IP 1시간에 40건
  attendance: { max: 10, windowMs: 10 * 60_000 }, // 출결 조회: 한 사람 10분에 10번 (이름을 하나씩 넣어 명단을 훑지 못하게)
  attendanceIp: { max: 150, windowMs: 10 * 60_000 }, //           같은 IP 10분에 150번
  login: { max: 10, windowMs: 15 * 60_000 }, // 담당자 로그인 15분에 10번 (IP 기준)
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

// ---------- 사람(브라우저)별 제한 ----------

/** 브라우저마다 주는 익명 ID 쿠키. 이름·연락처 같은 개인정보는 담지 않는다. */
export const VISITOR_COOKIE = "ax_vid";
const VISITOR_ID = /^[a-f0-9-]{36}$/;

function readCookie(headers: Headers, name: string): string | undefined {
  for (const part of (headers.get("cookie") ?? "").split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

export type LimitCheck = {
  limited: boolean;
  /** 처음 온 브라우저면 응답에 붙일 새 ID (없으면 이미 있는 ID) */
  newVisitorId: string | null;
};

/** 사람별 한도와 같은 IP 전체 상한을 함께 센다. 둘 중 하나라도 넘으면 limited. */
export function checkLimit(kind: "chat" | "ticket" | "attendance", headers: Headers): LimitCheck {
  const existing = readCookie(headers, VISITOR_COOKIE);
  const id = existing && VISITOR_ID.test(existing) ? existing : null;
  const visitor = id ?? crypto.randomUUID();
  // 쿠키 없는 첫 요청도 한 번은 센다. 다음 요청부터 같은 ID로 센다.
  const ipLimited = rateLimited(`${kind}Ip`, clientKey(headers));
  const userLimited = rateLimited(kind, visitor);
  return { limited: ipLimited || userLimited, newVisitorId: id ? null : visitor };
}

/** 새 브라우저면 익명 ID 쿠키를 붙인다 (1년, 서버만 읽음) */
export function attachVisitor<T extends NextResponse>(res: T, check: LimitCheck): T {
  if (check.newVisitorId)
    res.cookies.set(VISITOR_COOKIE, check.newVisitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  return res;
}
