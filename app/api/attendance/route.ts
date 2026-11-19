// 내 출결 조회: 출석부(구글 시트)에서 이름으로 찾는다. 동명이인이면 출석부 번호를 고르게 한다.
import { NextResponse } from "next/server";
import { z } from "zod";
import { attendanceProblem, loadSheets, lookup, todayKst } from "@/lib/attendance";
import { clientKey, rateLimited } from "@/lib/limits";

export const runtime = "nodejs";

const Body = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요.").max(20, "이름은 20자 이내로 써 주세요."),
  no: z.number().int().positive().max(999).nullable().optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "입력 내용을 확인해 주세요." }, { status: 400 });

  if (rateLimited("attendance", clientKey(req.headers)))
    return NextResponse.json({ error: "조회가 너무 많아요. 10분쯤 뒤에 다시 시도해 주세요." }, { status: 429 });

  const problem = attendanceProblem();
  if (problem) {
    console.error("[attendance]", problem);
    return NextResponse.json({ error: "지금은 출결 조회를 할 수 없어요. 담당자에게 문의해 주세요." }, { status: 503 });
  }

  try {
    const sheets = await loadSheets();
    return NextResponse.json(lookup(sheets, parsed.data.name, parsed.data.no ?? null, todayKst()));
  } catch (e) {
    console.error("[attendance] 출석부 읽기 실패:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "출석부를 불러오지 못했어요. 잠시 뒤 다시 시도하거나 담당자에게 문의해 주세요." }, { status: 502 });
  }
}
