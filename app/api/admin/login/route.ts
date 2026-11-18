import { NextResponse } from "next/server";
import { clientKey, rateLimited } from "@/lib/limits";
import { adminProblem, checkPassword, COOKIE, cookieOptions, makeToken } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (adminProblem()) return NextResponse.json({ error: "담당자 화면 설정이 아직 끝나지 않았어요." }, { status: 503 });
  if (rateLimited("login", clientKey(req.headers)))
    return NextResponse.json({ error: "시도가 너무 많아요. 15분 뒤 다시 해 주세요." }, { status: 429 });

  const body = (await req.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  if (!checkPassword(password)) return NextResponse.json({ error: "비밀번호가 맞지 않아요." }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, makeToken(), cookieOptions);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return res;
}
