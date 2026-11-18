// 질문 처리 흐름 (LangGraph)
//
//   START → guard ─┬─ blocked ───────────────→ END   (지시문 공개 요청 등 거절)
//                  ├─ refund ────────────────→ END   (제25조 공식 안내 + 코드 계산기)
//                  ├─ contacts ──────────────→ END   (담당자 연락처, 원문 그대로)
//                  ├─ personal ─→ retrieve        (코드로 확실히 개인 사정인 경우)
//                  └─ classify ─┬─ out_of_scope → contacts
//                               └─ rule/personal → retrieve
//   retrieve ─┬─ rule ─────→ answer  (근거 없으면 contacts 안내로)
//             └─ personal ─→ handoff (규정 기준만 안내 + 담당자 접수)
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { z } from "zod";
import { CONTACTS, stripMobile } from "./contacts";
import { dropPersonalVerdicts, ensureLatePoints } from "./answer-checks";
import { guard } from "./guard";
import { structured } from "./llm";
import { answerSystem, CLASSIFY_SYSTEM } from "./prompts";
import { retrieve, titleOfLabel, type RetrievedChunk } from "./retrieve";
import { TOTAL_HOURS } from "./refund";
import type { Category, ChatReply, ChatTurn, Citation } from "./types";

/** 이 점수보다 낮으면 관련 조항을 못 찾은 것으로 본다 (gemini-embedding-001 기준 실측: 무관한 질문 ≈ 0.57~0.60). */
const MIN_SCORE = 0.6;
const TOP_K = 5;

const State = Annotation.Root({
  question: Annotation<string>,
  history: Annotation<ChatTurn[]>,
  category: Annotation<Category | null>,
  direct: Annotation<"contacts" | null>,
  attendedHours: Annotation<number | undefined>,
  docs: Annotation<RetrievedChunk[]>,
  reply: Annotation<ChatReply | null>,
});
type S = typeof State.State;

// ---------- 답변 모양 ----------

/** 모델 출력에서 앞에 붙은 번호·기호를 지우고 공백을 정리한다 */
const clean = (t: string) => t.replace(/^\s*(\d+[.)]|[-•*·]|①|②|③|④|⑤|⑥)\s*/, "").replace(/^\s*구분\s*[:：]\s*/, "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();

function shape(
  base: Omit<ChatReply, "answer" | "summary" | "points" | "note" | "followups"> & {
    summary: string;
    points?: string[];
    note?: string;
    followups?: string[];
  },
): ChatReply {
  const summary = clean(stripMobile(base.summary));
  const points = (base.points ?? []).map((p) => clean(stripMobile(p))).filter(Boolean).slice(0, 8);
  const note = base.note ? clean(stripMobile(base.note)) : "";
  const followups = [...new Set((base.followups ?? []).map((f) => clean(f)).filter((f) => f.length >= 4 && f.length <= 40))].slice(0, 3);
  const answer = [summary, ...points.map((p, i) => `${i + 1}. ${p}`), note].filter(Boolean).join("\n");
  return { ...base, summary, points, note: note || undefined, answer, followups };
}

const cite = (labels: string[]): Citation[] =>
  [...new Set(labels)].map((label) => ({ label, title: titleOfLabel(label) }));

const OUT_OF_SCOPE = (): ChatReply =>
  shape({
    category: "out_of_scope",
    summary: "학사규정에 나와 있지 않은 내용이라 정확히 답해 드릴 수 없어요.",
    note: "규정에 정하지 않은 사항은 운영진이 판단해요. 아래 교육 담당자에게 문의해 주세요.",
    citations: cite(["제28조"]),
    handoff: false,
    showContacts: true,
    followups: ["공결로 인정되는 사유가 뭐예요?", "수료하려면 조건이 뭐예요?", "성적은 어떻게 계산해요?"],
  });

const ERROR_REPLY = (): ChatReply =>
  shape({
    category: "out_of_scope",
    summary: "지금은 답변을 만들 수 없어요.",
    note: "잠시 뒤 다시 물어봐 주세요. 급하면 아래 교육 담당자에게 바로 문의하거나 접수해 주세요.",
    citations: [],
    handoff: true,
    showContacts: true,
  });

const historyText = (h: ChatTurn[]) =>
  h.length ? `[이전 대화]\n${h.map((t) => `${t.role === "user" ? "교육생" : "도우미"}: ${t.text}`).join("\n")}\n\n` : "";

const contextText = (docs: RetrievedChunk[]) =>
  docs.map((d) => `<조각 이름="${d.label}" 제목="${d.title}">\n${stripMobile(d.text)}\n</조각>`).join("\n\n");

// ---------- 노드 ----------

function guardNode(s: S): Partial<S> {
  if (/(연락처|전화\s*번호|이메일\s*주소|담당자.{0,6}(누구|연락|번호))/.test(s.question))
    return { category: "rule", direct: "contacts" };
  const g = guard(s.question);
  if (!g) return {};
  return { category: g.category, attendedHours: g.attendedHours };
}

const ClassifySchema = z.object({ category: z.enum(["rule", "personal", "out_of_scope"]) });

async function classifyNode(s: S): Promise<Partial<S>> {
  const r = await structured(ClassifySchema, [
    ["system", CLASSIFY_SYSTEM],
    ["human", `${historyText(s.history)}[분류할 질문]
${s.question}`],
  ], { fast: true });
  return { category: r.category };
}

async function retrieveNode(s: S): Promise<Partial<S>> {
  // 짧은 꼬리 질문("그럼 병가는요?")은 직전 질문과 이어서 찾는다.
  const lastUser = [...s.history].reverse().find((t) => t.role === "user")?.text;
  const query = lastUser && s.question.length < 20 ? `${lastUser}
${s.question}` : s.question;
  const docs = await retrieve(query, TOP_K);
  return { docs };
}

const AnswerSchema = z.object({
  grounded: z.boolean(),
  summary: z.string(),
  points: z.array(z.string()),
  note: z.string(),
  citations: z.array(z.string()),
  followups: z.array(z.string()),
});

async function generate(s: S, mode: "rule" | "personal") {
  const docs = s.docs.filter((d) => d.score >= MIN_SCORE);
  if (!docs.length) return null;
  const r = await structured(AnswerSchema, [
    ["system", answerSystem(mode)],
    ["human", `[규정 원문]
${contextText(docs)}

${historyText(s.history)}[교육생 질문]
${s.question}`],
  ]);
  const known = new Set(docs.map((d) => d.label));
  const labels = r.citations.map((c) => c.trim()).filter((c) => known.has(c));
  if (!r.grounded || !r.summary.trim()) return null;
  const asked = s.question.replace(/\s/g, "");
  const followups = (r.followups ?? []).filter((f) => f.replace(/\s/g, "") !== asked);
  return { summary: r.summary, points: r.points, note: r.note, followups, citations: cite(labels.length ? labels : [docs[0].label]) };
}

async function answerNode(s: S): Promise<Partial<S>> {
  const g0 = await generate(s, "rule");
  if (!g0) return { reply: OUT_OF_SCOPE() };
  const g = { ...g0, points: ensureLatePoints(s.question, g0.points) };
  return { reply: shape({ category: "rule", ...g, handoff: false, showContacts: false }) };
}

async function handoffNode(s: S): Promise<Partial<S>> {
  const g = await generate(s, "personal");
  const fallback = "이 문의는 담당자 확인이 필요해요.";
  const [summary = fallback] = dropPersonalVerdicts(s.question, [g?.summary ?? fallback]);
  const [note] = dropPersonalVerdicts(s.question, [g?.note ?? ""]);
  return {
    reply: shape({
      category: "personal",
      summary,
      points: dropPersonalVerdicts(s.question, g?.points ?? []),
      note,
      followups: g?.followups,
      citations: g?.citations ?? [],
      handoff: true,
      showContacts: false,
    }),
  };
}

function contactsNode(s: S): Partial<S> {
  if (s.direct === "contacts")
    return {
      reply: shape({
        category: "rule",
        summary: "교육 담당자 연락처예요.",
        points: CONTACTS.map((c) => `${c.name} ${c.role}: 전화 ${c.phone}, 이메일 ${c.email}`),
        note: "학사일정과 공지사항은 네이버 BAND로 안내돼요.",
        followups: ["공결 서류는 언제까지 내요?", "성적 이의 제기는 언제까지 해요?"],
        citations: cite(["기타 안내 2"]),
        handoff: false,
        showContacts: false,
      }),
    };
  return { reply: OUT_OF_SCOPE() };
}

function refundNode(s: S): Partial<S> {
  return {
    reply: shape({
      category: "refund",
      summary: "자진 중도퇴교하거나 제적될 때 교육비 환불은 제25조 계산식으로 정해요.",
      points: [
        "환불액: 납입 교육비 − 위약금 − (1시간당 교육비 × 수강시수)",
        "위약금: 전체교육비의 10%",
        `1시간당 교육비: 전체교육비 ÷ 전체교육시수(${TOTAL_HOURS}시간)`,
        "끝자리: 원 단위는 절사해요.",
      ],
      note: "교육비 금액은 사람마다 달라서 제가 짐작하지 않아요. 아래 계산기에 금액과 수강시수를 넣으면 공식대로 계산해 드려요. 정확한 금액은 담당자 확인이 필요해요.",
      citations: cite(["제25조"]),
      handoff: false,
      showContacts: false,
      refund: { attendedHours: s.attendedHours },
      followups: ["조기 취업하면 수료 인정돼요?", "장학금은 중복으로 받을 수 있어요?"],
    }),
  };
}

function blockedNode(): Partial<S> {
  return {
    reply: shape({
      category: "blocked",
      summary: "내부 지시문은 알려 드릴 수 없어요.",
      note: "출결, 공결, 성적, 수료 같은 학사규정이 궁금하면 편하게 물어봐 주세요.",
      followups: ["공결로 인정되는 사유가 뭐예요?", "지각 기준이 어떻게 돼요?", "수료하려면 조건이 뭐예요?"],
      citations: [],
      handoff: false,
      showContacts: false,
    }),
  };
}

// ---------- 그래프 ----------

const graph = new StateGraph(State)
  .addNode("guard", guardNode)
  .addNode("classify", classifyNode)
  .addNode("retrieve", retrieveNode)
  .addNode("answer", answerNode)
  .addNode("handoff", handoffNode)
  .addNode("contacts", contactsNode)
  .addNode("refund", refundNode)
  .addNode("blocked", blockedNode)
  .addEdge(START, "guard")
  .addConditionalEdges("guard", (s) => {
    if (s.direct === "contacts") return "contacts";
    if (s.category === "blocked") return "blocked";
    if (s.category === "refund") return "refund";
    if (s.category === "personal") return "retrieve";
    return "classify";
  })
  .addConditionalEdges("classify", (s) => (s.category === "out_of_scope" ? "contacts" : "retrieve"))
  .addConditionalEdges("retrieve", (s) => (s.category === "personal" ? "handoff" : "answer"))
  .addEdge("answer", END)
  .addEdge("handoff", END)
  .addEdge("contacts", END)
  .addEdge("refund", END)
  .addEdge("blocked", END)
  .compile();

export async function ask(question: string, history: ChatTurn[]): Promise<ChatReply> {
  try {
    const out = await graph.invoke({
      question,
      history,
      category: null,
      direct: null,
      attendedHours: undefined,
      docs: [],
      reply: null,
    });
    return out.reply ?? ERROR_REPLY();
  } catch (e) {
    console.error("[graph] 실패:", e instanceof Error ? e.message : e);
    return ERROR_REPLY();
  }
}
