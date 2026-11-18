"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconAlert } from "../_components/Icons";
import type { Ticket, TicketStatus } from "@/lib/types";

const STATUS: Record<TicketStatus, { label: string; badge: string }> = {
  new: { label: "접수", badge: "badge--info" },
  in_progress: { label: "처리 중", badge: "badge--warning" },
  done: { label: "완료", badge: "badge--success" },
};

const when = (s: string) =>
  new Date(s).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "numeric", minute: "2-digit" });

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) return router.refresh();
    const data = await res?.json().catch(() => ({}));
    setError(data?.error ?? "로그인하지 못했어요.");
  }

  return (
    <form className="card glass glass--strong login-card" onSubmit={submit}>
      <h1 className="t-h2">담당자 로그인</h1>
      <p className="t-sub" style={{ marginTop: "var(--space-2)" }}>접수 목록은 운영담당자만 볼 수 있어요.</p>
      <div className="field" style={{ marginTop: "var(--space-6)" }}>
        <label className="field__label" htmlFor="pw">비밀번호</label>
        <input id="pw" className="input" type="password" autoComplete="current-password" value={password}
          onChange={(e) => setPassword(e.target.value)} aria-invalid={error ? true : undefined} aria-describedby="pw-e" />
        {error && <p className="field__error" id="pw-e"><IconAlert size={16} />{error}</p>}
      </div>
      <div className="form__actions">
        <button type="submit" className="btn btn--primary btn--block" disabled={!password || busy} aria-busy={busy || undefined}>
          로그인하기
        </button>
      </div>
    </form>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button type="button" className="btn btn--secondary btn--sm"
      onClick={async () => { await fetch("/api/admin/login", { method: "DELETE" }); router.refresh(); }}>
      로그아웃
    </button>
  );
}

function StatusSelect({ t }: { t: Ticket }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <select
      className="select"
      aria-label={`#${t.id} 상태`}
      value={t.status}
      disabled={busy}
      onChange={async (e) => {
        setBusy(true);
        const res = await fetch(`/api/admin/tickets/${t.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: e.target.value }),
        }).catch(() => null);
        setBusy(false);
        if (!res?.ok) alert("상태를 바꾸지 못했어요. 다시 시도해 주세요.");
        router.refresh();
      }}
    >
      {(Object.keys(STATUS) as TicketStatus[]).map((s) => (
        <option key={s} value={s}>{STATUS[s].label}</option>
      ))}
    </select>
  );
}

const Badge = ({ s }: { s: TicketStatus }) => <span className={`badge ${STATUS[s].badge}`}>{STATUS[s].label}</span>;

export function TicketList({ tickets }: { tickets: Ticket[] }) {
  if (!tickets.length)
    return (
      <div className="admin-panel">
        <p className="empty t-sub">접수된 문의가 없어요.</p>
      </div>
    );
  return (
    <div className="admin-panel">
      {/* 태블릿 이상: 표 */}
      <div className="admin-table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th className="t-num">번호</th>
              <th>접수 시각</th>
              <th>기수 · 이름</th>
              <th>연락처</th>
              <th>내용</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td className="t-num">{t.id}</td>
                <td className="t-num" style={{ whiteSpace: "nowrap", textAlign: "left" }}>{when(t.created_at)}</td>
                <td style={{ whiteSpace: "nowrap" }}>{t.cohort} · {t.name}</td>
                <td><a href={t.contact.includes("@") ? `mailto:${t.contact}` : `tel:${t.contact}`}>{t.contact}</a></td>
                <td>
                  <div className="cell-content">{t.content}</div>
                  {t.question && t.question !== t.content && <p className="cell-sub t-caption">챗봇 질문: {t.question}</p>}
                </td>
                <td><div className="stack-2"><Badge s={t.status} /><StatusSelect t={t} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* 모바일: 카드 목록 */}
      <div className="admin-cards">
        {tickets.map((t) => (
          <article key={t.id} className="ticket-card">
            <div className="ticket-card__head">
              <strong>#{t.id} {t.cohort} · {t.name}</strong>
              <Badge s={t.status} />
            </div>
            <p className="ticket-card__content">{t.content}</p>
            {t.question && t.question !== t.content && <p className="ticket-card__meta t-caption">챗봇 질문: {t.question}</p>}
            <div className="ticket-card__foot">
              <span className="t-caption">
                {when(t.created_at)} · <a href={t.contact.includes("@") ? `mailto:${t.contact}` : `tel:${t.contact}`}>{t.contact}</a>
              </span>
              <StatusSelect t={t} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
