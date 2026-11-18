// 담당자: 접수 상태 바꾸기 (접수 → 처리 중 → 완료)
import { NextResponse } from "next/server";
import { z } from "zod";
import { setTicketStatus } from "@/lib/db";
import { isAdmin } from "@/lib/session";

export const runtime = "nodejs";

const Body = z.object({ status: z.enum(["new", "in_progress", "done"]) });

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  const id = Number((await ctx.params).id);
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!Number.isInteger(id) || !parsed.success)
    return NextResponse.json({ error: "요청 형식이 올바르지 않아요." }, { status: 400 });
  try {
    const ok = await setTicketStatus(id, parsed.data.status);
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "접수를 찾을 수 없어요." }, { status: 404 });
  } catch (e) {
    console.error("[admin] 상태 변경 실패:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "저장하지 못했어요." }, { status: 500 });
  }
}
