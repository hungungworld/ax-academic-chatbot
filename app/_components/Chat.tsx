"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { CONTACTS } from "@/lib/contacts";
import { MAX_QUESTION_CHARS } from "@/lib/limits";
import type { ChatReply, ChatTurn } from "@/lib/types";
import { IconAlert, IconAward, IconChart, IconCheck, IconClock, IconPhone, IconRefresh, IconSend, IconUser, IconWon } from "./Icons";
import { AttendanceSheet } from "./AttendanceSheet";
import { RefundSheet } from "./RefundSheet";
import { TicketSheet } from "./TicketSheet";
import { Sheet } from "./Sheet";

type Msg =
  | { id: string; role: "user"; text: string; time: string }
  | { id: string; role: "bot"; text: string; time: string; reply?: ChatReply; error?: boolean };

// open: 질문을 보내지 않고 바로 창을 연다
const SUGGESTIONS: { icon: React.ReactNode; label: string; q: string; open?: "attendance" }[] = [
  { icon: <IconUser size={16} />, label: "내 출결 조회", q: "내 출결 조회", open: "attendance" },
  { icon: <IconCheck size={16} />, label: "공결 인정 사유", q: "공결로 인정되는 사유가 뭐가 있어요?" },
  { icon: <IconClock size={16} />, label: "지각 기준", q: "지각은 몇 시부터이고 벌점은 몇 점이에요?" },
  { icon: <IconWon size={16} />, label: "환불 계산", q: "중도 퇴교하면 교육비 환불은 어떻게 계산해요?" },
  { icon: <IconAward size={16} />, label: "수료 요건", q: "수료하려면 조건이 뭐예요?" },
  { icon: <IconChart size={16} />, label: "성적 계산", q: "성적은 어떻게 계산해요?" },
  { icon: <IconPhone size={16} />, label: "담당자 연락처", q: "담당자 연락처 알려 주세요." },
];

const now = () => new Date().toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" });
const uid = () => Math.random().toString(36).slice(2, 10);

/** 챗봇 답변: "- " 줄은 목록, 나머지는 문단 */
function RichText({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let para: string[] = [];
  const flushList = () => {
    if (list.length) blocks.push(<ul key={blocks.length}>{list.map((l, i) => <li key={i}>{l}</li>)}</ul>);
    list = [];
  };
  const flushPara = () => {
    if (para.length) blocks.push(<p key={blocks.length}>{para.join(" ")}</p>);
    para = [];
  };
  // "가. - 나 - 다"처럼 한 줄에 몰린 목록은 줄을 나눈다
  const normalized = (text.match(/\s-\s/g)?.length ?? 0) >= 2 ? text.replace(/\s+-\s+(?=\S)/g, "\n- ") : text;
  for (const raw of normalized.split("\n")) {
    const line = raw.trim();
    if (!line) { flushList(); flushPara(); continue; }
    const m = line.match(/^[-•*]\s+(.*)$/);
    if (m) { flushPara(); list.push(m[1]); }
    else { flushList(); para.push(line); }
  }
  flushList();
  flushPara();
  return <>{blocks}</>;
}

/** "구분: 설명" 항목이면 구분을 굵게 */
function Point({ text }: { text: string }) {
  const m = text.match(/^([^:：]{1,14})[:：]\s*(.+)$/);
  if (!m || /\d$/.test(m[1])) return <>{text}</>; // "09:50" 같은 시각은 나누지 않음
  return (
    <>
      <strong className="answer__label">{m[1]}</strong>
      {m[2]}
    </>
  );
}

/** 답변 아래 "이어서 물어보기" 질문 칩. 누르면 바로 보낸다 */
function FollowUps({ items, onPick }: { items: string[]; onPick: (q: string) => void }) {
  if (!items.length) return null;
  return (
    <nav className="followups" aria-label="이어서 물어보기">
      <p className="followups__title t-caption">이어서 물어보기</p>
      <div className="followups__list">
        {items.map((q) => (
          <button key={q} type="button" className="chip followups__chip" onClick={() => onPick(q)}>
            <IconSend size={14} />
            {q}
          </button>
        ))}
      </div>
    </nav>
  );
}

/** 구조화된 답변: 핵심 한 줄(굵게) → 번호 목록 → 참고 상자 */
function AnswerBody({ reply }: { reply: ChatReply }) {
  return (
    <div className="answer">
      <p className="answer__summary">{reply.summary}</p>
      {reply.points.length > 0 && (
        <ol className="answer__points">
          {reply.points.map((p, i) => (
            <li key={i}>
              <span className="answer__num" aria-hidden="true">{i + 1}</span>
              <span className="answer__text"><Point text={p} /></span>
            </li>
          ))}
        </ol>
      )}
      {reply.note && (
        <p className="answer__note">
          <span className="answer__note-tag">참고</span>
          {reply.note}
        </p>
      )}
    </div>
  );
}

function ContactCards() {
  return (
    <div className="contacts layout-2">
      {CONTACTS.map((c) => (
        <div key={c.email} className="contact-card glass glass--strong">
          <p className="contact-card__name">{c.name} {c.role}</p>
          <ul>
            <li>전화 <a href={`tel:${c.phone}`}>{c.phone}</a></li>
            <li>이메일 <a href={`mailto:${c.email}`}>{c.email}</a></li>
          </ul>
        </div>
      ))}
    </div>
  );
}

export function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<{ question: string | null; category: string | null } | null>(null);
  const [refund, setRefund] = useState<{ attendedHours?: number } | null>(null);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "danger"; text: string } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // 입력창 높이: 최대 4줄
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  useEffect(() => {
    // 맨 아래까지 내린다 (입력창에 가리지 않도록 아래 여백까지 포함)
    if (endRef.current) window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || loading || question.length > MAX_QUESTION_CHARS) return;
      const history: ChatTurn[] = messages
        .filter((m) => !(m.role === "bot" && m.error))
        .map((m) => ({ role: m.role, text: m.text }));
      setMessages((ms) => [...ms, { id: uid(), role: "user", text: question, time: now() }]);
      setInput("");
      setLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, history }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "답변을 받지 못했어요.");
        const reply = data as ChatReply;
        setMessages((ms) => [...ms, { id: uid(), role: "bot", text: reply.answer, time: now(), reply }]);
      } catch (e) {
        setMessages((ms) => [
          ...ms,
          { id: uid(), role: "bot", text: e instanceof Error ? e.message : "답변을 받지 못했어요.", time: now(), error: true },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages],
  );

  const lastUserBefore = (index: number) => {
    for (let i = index - 1; i >= 0; i--) if (messages[i].role === "user") return messages[i].text;
    return null;
  };

  /** 모델이 준 이어질 질문, 없으면 아직 안 물어본 추천 질문 */
  const followupsFor = (r?: ChatReply) => {
    if (r?.followups?.length) return r.followups;
    const asked = new Set(messages.filter((m) => m.role === "user").map((m) => m.text));
    return SUGGESTIONS.filter((s) => !s.open && !asked.has(s.q)).slice(0, 3).map((s) => s.q);
  };

  const reset = () => {
    setMessages([]);
    setInput("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const count = input.length;
  const over = count > MAX_QUESTION_CHARS;
  const multiline = input.includes("\n") || (inputRef.current?.scrollHeight ?? 0) > 52;
  const started = messages.length > 0;

  return (
    <>
      <div className="bg-blobs" aria-hidden="true" />

      <header className="header" style={started ? undefined : { background: "transparent", borderBottomColor: "transparent", backdropFilter: "none", WebkitBackdropFilter: "none" }}>
        <div className="header-inner">
          <button type="button" className="header__brand" onClick={reset} aria-label="AX마스터 학사 도우미, 처음 화면으로">
            <div className="orb orb--sm" aria-hidden="true" />
            <span>AX마스터 학사 도우미</span>
          </button>
          <div className="header__actions">
            {started && (
              <button type="button" className="btn btn--icon btn--glass btn--sm" aria-label="새 대화" title="새 대화" onClick={reset}>
                <IconRefresh />
              </button>
            )}
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => setContactsOpen(true)}>
              <IconPhone />
              담당자
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        {!started && (
          <>
            <section className="hero">
              <div className="orb" aria-hidden="true" />
              <h1 className="t-display">
                <em>안녕하세요,</em>
                <br />
                무엇이 궁금하세요?
              </h1>
              <p className="t-sub">
                제2기 KITA 무역 AX마스터 학사규정을 근거로 바로 답해 드리고,
                <br />
                판단이 필요한 문의는 담당자에게 이어 드려요.
              </p>
            </section>
            <section className="hero-chips" aria-label="추천 질문">
              <div className="chips" role="list">
                {SUGGESTIONS.map((s) => (
                  <button key={s.label} type="button" className="chip" role="listitem" onClick={() => (s.open ? setAttendanceOpen(true) : send(s.q))}>
                    <span className="chip__icon">{s.icon}</span>
                    {s.label}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        <section className={`chat${started ? " chat-main" : ""}`} aria-live="polite" aria-label="대화">
          {messages.map((m, i) => {
            const same = i > 0 && messages[i - 1].role === m.role;
            if (m.role === "user")
              return (
                <div key={m.id} className={`msg msg--me${same ? " msg--same" : ""}`}>
                  <div className="bubble">{m.text}</div>
                  <p className="msg__meta t-caption">{m.time}</p>
                </div>
              );
            const r = m.reply;
            return (
              <div key={m.id} className={`msg msg--bot${same ? " msg--same" : ""}${m.error ? " msg--error" : ""}`}>
                <div className="bubble">
                  {m.error && <span className="sr-only">오류: </span>}
                  {r?.summary ? <AnswerBody reply={r} /> : <RichText text={m.text} />}
                </div>
                {r?.handoff && (
                  <p className="handoff-note">
                    <IconUser size={16} />
                    <span><strong>담당자 확인이 필요해요.</strong> 개인별 인정 여부는 담당자가 판단해요. 아래 버튼으로 접수하면 확인 후 연락드려요.</span>
                  </p>
                )}
                {!!r?.citations.length && (
                  <div className="badges" aria-label="근거 조항">
                    {r.citations.map((c) => (
                      <span key={c.label} className="badge badge--info">
                        {c.label}
                        {c.title && c.label.startsWith("제") && <span className="badge__title">{c.title}</span>}
                      </span>
                    ))}
                  </div>
                )}
                {r?.showContacts && <ContactCards />}
                {(r?.handoff || r?.refund || r?.attendance || m.error) && (
                  <div className="msg__actions">
                    {r?.attendance && (
                      <button type="button" className="btn btn--soft btn--sm" onClick={() => setAttendanceOpen(true)}>
                        <IconUser />
                        내 출결 조회하기
                      </button>
                    )}
                    {r?.refund && (
                      <button type="button" className="btn btn--soft btn--sm" onClick={() => setRefund(r.refund ?? {})}>
                        <IconWon />
                        환불액 계산하기
                      </button>
                    )}
                    {(r?.handoff || m.error) && (
                      <button
                        type="button"
                        className="btn btn--soft btn--sm"
                        onClick={() => setTicket({ question: lastUserBefore(i), category: r?.category ?? null })}
                      >
                        <IconUser />
                        담당자에게 접수하기
                      </button>
                    )}
                  </div>
                )}
                <p className="msg__meta t-caption">{m.time}</p>
                {i === messages.length - 1 && !loading && !m.error && (
                  <FollowUps items={followupsFor(r)} onPick={send} />
                )}
              </div>
            );
          })}
          {loading && (
            <div className="typing" role="status">
              <div className="orb orb--sm" aria-hidden="true" />
              <span className="t-caption">답변을 준비하고 있어요…</span>
            </div>
          )}
          <div ref={endRef} />
        </section>
      </main>

      <div className="composer-wrap">
        <p className="composer__notice t-caption">성적 등 개인정보는 입력하지 마세요.</p>
        <form
          className="composer"
          data-multiline={multiline || undefined}
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <label htmlFor="q" className="sr-only">질문 입력</label>
          <textarea
            id="q"
            ref={inputRef}
            className="composer__input"
            rows={1}
            placeholder="학사규정을 물어보세요"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // 한글 입력 중(조합 중) Enter는 무시. Shift+Enter는 줄바꿈.
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send(input);
              }
            }}
            aria-describedby={over ? "q-over" : undefined}
          />
          {count > MAX_QUESTION_CHARS - 100 && (
            <span className="composer__count" data-over={over || undefined} id="q-over">
              {count}/{MAX_QUESTION_CHARS}
            </span>
          )}
          <button
            type="submit"
            className="btn btn--send btn--icon"
            aria-label="보내기"
            disabled={!input.trim() || over || loading}
          >
            <IconSend />
          </button>
        </form>
      </div>

      {ticket && (
        <TicketSheet
          question={ticket.question}
          category={ticket.category}
          onClose={() => setTicket(null)}
          onDone={(id) => {
            setTicket(null);
            setToast({ kind: "success", text: "담당자에게 접수했어요." });
            setMessages((ms) => [
              ...ms,
              {
                id: uid(),
                role: "bot",
                time: now(),
                text: `담당자에게 접수했어요${id ? ` (접수 번호 ${id})` : ""}. 확인 후 적어 주신 연락처로 연락드릴게요. 급한 일이면 담당자에게 바로 전화해 주세요.`,
              },
            ]);
          }}
        />
      )}
      {attendanceOpen && (
        <AttendanceSheet
          onClose={() => setAttendanceOpen(false)}
          onTicket={() => {
            setAttendanceOpen(false);
            setTicket({ question: "출석부 기록 확인 요청", category: "attendance" });
          }}
        />
      )}
      {refund && <RefundSheet attendedHours={refund.attendedHours} onClose={() => setRefund(null)} />}
      {contactsOpen && (
        <Sheet title="교육 담당자" description="규정에 없는 내용이나 급한 문의는 담당자에게 연락해 주세요." onClose={() => setContactsOpen(false)}>
          <ContactCards />
          <div className="sheet__actions">
            <button
              type="button"
              className="btn btn--soft btn--lg btn--block"
              onClick={() => {
                setContactsOpen(false);
                setTicket({ question: null, category: null });
              }}
            >
              <IconUser />
              챗봇으로 접수하기
            </button>
          </div>
        </Sheet>
      )}
      {toast && (
        <div className={`toast toast--${toast.kind}`} role="status">
          {toast.kind === "success" ? <IconCheck /> : <IconAlert />}
          {toast.text}
        </div>
      )}
    </>
  );
}
