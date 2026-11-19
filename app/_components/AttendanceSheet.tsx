"use client";
// 내 출결 조회. 출석부(구글 시트)를 서버(/api/attendance)가 읽어 온다.
// 이름만 받고, 같은 이름이 여러 명일 때만 출석부 번호를 고르게 한다.
import { useEffect, useState } from "react";
import type { AttendanceRecord, LookupResult } from "@/lib/attendance";
import { IconAlert, IconUser } from "./Icons";
import { Sheet } from "./Sheet";

const SAVE_KEY = "ax-attendance-name";
const load = () => { try { return localStorage.getItem(SAVE_KEY) ?? ""; } catch { return ""; } };
const save = (v: string | null) => {
  try { if (v) localStorage.setItem(SAVE_KEY, v); else localStorage.removeItem(SAVE_KEY); } catch { /* 저장 불가한 브라우저 */ }
};

const fmtDay = (iso: string) => {
  const wd = "일월화수목금토"[new Date(`${iso}T00:00:00Z`).getUTCDay()];
  return `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}(${wd})`;
};
/** 0.1점 단위 점수: 18 → "18", 18.6 → "18.6" */
const pt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const days = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)}일`;

function AsOf({ r }: { r: AttendanceRecord }) {
  if (!r.asOf)
    return (
      <p className="att-asof att-asof--warn">
        <IconAlert size={18} />
        <span>{r.month}월 출석부에 반영 날짜가 적혀 있지 않아요. 최근 기록은 아직 반영되지 않았을 수 있어요.</span>
      </p>
    );
  return (
    <p className={`att-asof${r.asOfStale ? " att-asof--warn" : ""}`}>
      {r.asOfStale && <IconAlert size={18} />}
      <span>
        <strong>{r.month}월 출석부는 {fmtDay(r.asOf)}까지 반영</strong>되어 있어요.
        {r.asOfStale ? " 반영일이 꽤 지나서 최근 기록은 빠져 있을 수 있어요." : " 그 뒤 기록은 아직 반영 전일 수 있어요."}
      </span>
    </p>
  );
}

function Result({ r }: { r: AttendanceRecord }) {
  const current = r.monthly.find((m) => m.month === r.month);
  const past = r.monthly.filter((m) => m.month !== r.month).reverse();
  const fallback = r.excusedMonth !== null && r.excusedMonth !== r.month;
  return (
    <div className="att-result" aria-live="polite">
      <AsOf r={r} />

      <section className="att-block">
        <h3 className="att-block__title">출결 벌점 <small>전체 기간 누적</small></h3>
        <p className="att-penalty">{r.penalty === null ? "기록 없음" : `${r.penalty}점`}</p>
      </section>

      <section className="att-block">
        <h3 className="att-block__title">최종 성적 출결 점수 <small>20점 만점</small></h3>
        <p className="att-penalty">
          {pt(r.grade.score)}점 <span className="att-max">/ 20점</span>
          {r.grade.deduction > 0 && <span className="att-deduct">−{pt(r.grade.deduction)}점</span>}
        </p>
        <dl className="att-dl att-sub">
          {r.grade.lines.map((l) => (
            <div key={l.label} className="att-dl__row">
              <dt>{l.label} {l.count}회 × {pt(l.each)}점</dt>
              <dd>{l.total > 0 ? `−${pt(l.total)}점` : "0점"}</dd>
            </div>
          ))}
        </dl>
        <p className="t-caption att-sub">
          출결은 최종 성적의 20%예요. 1회당 경미 −0.4점, 지각·조퇴 −1점, 결석 −2점이고 0점 아래로는 내려가지 않아요. 출석부 월별 횟수를 더한 참고값이라 공지되는 학사관리 점수와 다를 수 있어요.
        </p>
      </section>

      <section className="att-block">
        <h3 className="att-block__title">공결 사용 <small>전체 기간 누적 / 인정 한도</small></h3>
        {r.excused ? (
          <dl className="att-dl">
            {r.excused.map((e) => (
              <div key={e.label} className="att-dl__row">
                <dt>{e.label}</dt>
                <dd>{days(e.used)}{e.max !== null && <span className="att-max"> / {days(e.max)}</span>}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="t-caption">아직 집계된 공결 기록이 없어요.</p>
        )}
        {fallback && <p className="t-caption att-sub">{r.month}월 집계가 아직 없어 벌점과 공결은 {r.excusedMonth}월 출석부 기준이에요.</p>}
      </section>

      {current && (
        <section className="att-block">
          <h3 className="att-block__title">{r.month}월 기록</h3>
          <dl className="att-dl">
            <div className="att-dl__row"><dt>경미한 지각·퇴실 누락</dt><dd>{current.minor}회</dd></div>
            <div className="att-dl__row"><dt>지각·조퇴</dt><dd>{current.late}회</dd></div>
            <div className="att-dl__row"><dt>결석</dt><dd>{current.absent}회</dd></div>
          </dl>
        </section>
      )}

      {past.length > 0 && (
        <details className="att-block att-past">
          <summary>지난 달 기록 보기</summary>
          <table className="att-table">
            <thead><tr><th scope="col">달</th><th scope="col">경미·누락</th><th scope="col">지각·조퇴</th><th scope="col">결석</th></tr></thead>
            <tbody>
              {past.map((m) => (
                <tr key={m.month}><th scope="row">{m.month}월</th><td>{m.minor}</td><td>{m.late}</td><td>{m.absent}</td></tr>
              ))}
            </tbody>
          </table>
        </details>
      )}

      <p className="t-caption att-sub">
        출석부에 적힌 그대로예요. 출결 벌점에는 생활태도 벌점이 들어 있지 않아요. 공결 인정 여부와 퇴교 여부는 담당자가 판단해요.
      </p>
    </div>
  );
}

export function AttendanceSheet({ onClose, onTicket }: { onClose: () => void; onTicket: () => void }) {
  const [name, setName] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  useEffect(() => { const v = load(); if (v) setName(v); }, []);

  const run = async (no: number | null = null) => {
    const n = name.trim();
    if (!n || loading) { if (!n) setError("이름을 입력해 주세요."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, no }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "조회하지 못했어요.");
      const r = data as LookupResult;
      setResult(r);
      if (r.status === "ok") save(remember ? n : null);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "조회하지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet title="내 출결 조회" description="출석부에서 공결 사용 일수와 지각·결석 기록을 찾아 드려요." onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); run(); }} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="att-name">이름</label>
          <input id="att-name" className="input" autoComplete="name" maxLength={20} placeholder="출석부에 적힌 이름" value={name}
            onChange={(e) => { setName(e.target.value); setResult(null); }} />
          <label className="att-remember">
            <input type="checkbox" checked={remember} onChange={(e) => { setRemember(e.target.checked); if (!e.target.checked) save(null); }} />
            이 기기에 이름 기억하기
          </label>
        </div>
        <div className="sheet__actions">
          <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={loading}>
            {loading ? "조회하고 있어요…" : "조회하기"}
          </button>
        </div>
      </form>

      {error && <p className="form-error" role="alert"><IconAlert size={20} />{error}</p>}

      {result?.status === "not_found" && (
        <p className="form-error" role="alert"><IconAlert size={20} />출석부에서 이름을 찾지 못했어요. 이름을 다시 확인해 주세요.</p>
      )}

      {result?.status === "choose" && (
        <div className="att-choose">
          <p className="att-choose__title">같은 이름이 {result.numbers.length}명 있어요. 출석부 번호를 골라 주세요.</p>
          <div className="chips">
            {result.numbers.map((no) => (
              <button key={no} type="button" className="chip" onClick={() => run(no)} disabled={loading}>{no}번</button>
            ))}
          </div>
          <p className="field__help">번호는 밴드에 올라온 출석부 맨 왼쪽 &lsquo;번호&rsquo; 칸에서 확인할 수 있어요.</p>
        </div>
      )}

      {result?.status === "ok" && (
        <>
          <Result r={result.record} />
          <div className="sheet__actions">
            <button type="button" className="btn btn--soft btn--lg btn--block" onClick={onTicket}>
              <IconUser />
              기록이 다르면 담당자에게 접수하기
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}
