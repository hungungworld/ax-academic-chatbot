// 담당자 화면 로그인 쿠키. ADMIN_PASSWORD로 로그인하면 SESSION_SECRET으로 서명한 쿠키를 준다.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE = "ax_admin";
const MAX_AGE = 60 * 60 * 12; // 12시간

export function adminProblem(): string | null {
  if (!process.env.ADMIN_PASSWORD) return "ADMIN_PASSWORD 환경변수가 없습니다.";
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 16)
    return "SESSION_SECRET 환경변수가 없거나 너무 짧습니다 (32자 이상 권장).";
  return null;
}

const sign = (payload: string) => createHmac("sha256", process.env.SESSION_SECRET!).update(payload).digest("base64url");

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  // 길이가 달라도 시간 차이로 드러나지 않게 해시끼리 비교
  const h = (s: string) => createHmac("sha256", "pw").update(s).digest("hex");
  return safeEqual(h(input), h(pw));
}

export function makeToken(): string {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  return `${exp}.${sign(exp)}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token || adminProblem()) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !safeEqual(sig, sign(exp))) return false;
  return Number(exp) > Date.now() / 1000;
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(COOKIE)?.value);
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};
