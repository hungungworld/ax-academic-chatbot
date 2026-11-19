// 담당자 접수: Neon에 저장하고 담당자에게 알림 메일을 보낸다.
import { NextResponse } from "next/server";
import { z } from "zod";
import { dbReady, insertTicket, type NewTicket } from "@/lib/db";
import { attachVisitor, checkLimit, MAX_QUESTION_CHARS, TICKET_LIMITS as L } from "@/lib/limits";
import { mailReady, sendTicketMail } from "@/lib/mail";

export const runtime = "nodejs";

const field = (max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label}을(를) 입력해 주세요.`)
    .max(max, `${label}은(는) ${max}자 이내로 써 주세요.`);

const Body = z.object({
  cohort: field(L.cohort, "기수"),
  name: field(L.name, "이름"),
  contact: field(L.contact, "연락처"),
  content: field(L.content, "문의 내용"),
  question: z.string().trim().max(MAX_QUESTION_CHARS).optional().nullable(),
  category: z.string().trim().max(20).optional().nullable(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return NextResponse.json({ error: "입력 내용을 확인해 주세요.", fieldErrors }, { status: 400 });
  }

  const limit = checkLimit("ticket", req.headers);
  if (limit.limited)
    return attachVisitor(NextResponse.json({ error: "접수가 너무 많아요. 잠시 뒤 다시 시도하거나 담당자에게 전화해 주세요." }, { status: 429 }), limit);

  const t: NewTicket = { ...parsed.data, question: parsed.data.question || null, category: parsed.data.category || null };

  if (!dbReady() && !mailReady()) {
    console.error("[tickets] DATABASE_URL 과 Gmail 설정이 모두 없어 접수를 받을 수 없습니다.");
    return NextResponse.json({ error: "지금은 접수를 받을 수 없어요. 담당자에게 전화나 이메일로 문의해 주세요." }, { status: 503 });
  }

  let id: number | null = null;
  let saved = false;
  if (dbReady()) {
    try {
      id = (await insertTicket(t)).id;
      saved = true;
    } catch (e) {
      console.error("[tickets] DB 저장 실패:", e instanceof Error ? e.message : e);
    }
  }

  let mailed = false;
  if (mailReady()) {
    try {
      const origin = new URL(req.url).origin;
      await sendTicketMail(t, id, saved ? `${origin}/admin` : null);
      mailed = true;
    } catch (e) {
      console.error("[tickets] 알림 메일 실패:", e instanceof Error ? e.message : e);
    }
  }

  if (!saved && !mailed)
    return NextResponse.json({ error: "접수 중 문제가 생겼어요. 담당자에게 전화나 이메일로 문의해 주세요." }, { status: 500 });

  return attachVisitor(NextResponse.json({ ok: true, id }), limit);
}
