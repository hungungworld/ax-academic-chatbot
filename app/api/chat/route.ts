// 학생 질문 → LangGraph(분류 → 검색 → 답변/접수) → 답변
import { NextResponse } from "next/server";
import { z } from "zod";
import { ask } from "@/lib/graph";
import { attachVisitor, checkLimit, MAX_HISTORY_CHARS, MAX_HISTORY_MESSAGES, MAX_QUESTION_CHARS } from "@/lib/limits";
import { llmProblem } from "@/lib/llm";
import { indexProblem } from "@/lib/retrieve";
import type { ChatTurn } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  question: z.string(),
  history: z
    .array(z.object({ role: z.enum(["user", "bot"]), text: z.string() }))
    .optional()
    .default([]),
});

/** 최근 대화만, 글자 수 상한 안에서 남긴다 */
function trimHistory(history: ChatTurn[]): ChatTurn[] {
  const out: ChatTurn[] = [];
  let total = 0;
  for (const t of history.slice(-MAX_HISTORY_MESSAGES).reverse()) {
    const text = t.text.slice(0, 600);
    if (total + text.length > MAX_HISTORY_CHARS) break;
    total += text.length;
    out.unshift({ role: t.role, text });
  }
  return out;
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "요청 형식이 올바르지 않아요." }, { status: 400 });

  const question = parsed.data.question.trim();
  if (!question) return NextResponse.json({ error: "질문을 입력해 주세요." }, { status: 400 });
  if (question.length > MAX_QUESTION_CHARS)
    return NextResponse.json({ error: `질문은 ${MAX_QUESTION_CHARS}자 이내로 써 주세요.` }, { status: 400 });

  const limit = checkLimit("chat", req.headers);
  if (limit.limited)
    return attachVisitor(NextResponse.json({ error: "질문이 너무 많아요. 10분쯤 뒤에 다시 물어봐 주세요." }, { status: 429 }), limit);

  const problem = indexProblem() ?? llmProblem();
  if (problem) {
    console.error("[chat] 설정 문제:", problem);
    return NextResponse.json({ error: "챗봇 설정이 아직 끝나지 않았어요. 담당자에게 문의해 주세요." }, { status: 503 });
  }

  const reply = await ask(question, trimHistory(parsed.data.history));
  return attachVisitor(NextResponse.json(reply), limit);
}
