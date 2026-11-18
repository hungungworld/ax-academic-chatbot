"use client";
// 담당자 접수 폼: 기수·이름·연락처·내용 4개만 받는다 (CLAUDE.md, DESIGN.md 5-8)
import { useState } from "react";
import { TICKET_LIMITS as L } from "@/lib/limits";
import { IconAlert } from "./Icons";
import { Sheet } from "./Sheet";

type Props = {
  question: string | null;
  category: string | null;
  onClose: () => void;
  onDone: (id: number | null) => void;
};

type Fields = { cohort: string; name: string; contact: string; content: string };
const LABELS: Record<keyof Fields, string> = { cohort: "기수", name: "이름", contact: "연락처", content: "내용" };

function validate(f: Fields): Partial<Record<keyof Fields, string>> {
  const e: Partial<Record<keyof Fields, string>> = {};
  (Object.keys(LABELS) as (keyof Fields)[]).forEach((k) => {
    if (!f[k].trim()) e[k] = `${LABELS[k]}을(를) 적어 주세요.`;
    else if (f[k].trim().length > L[k]) e[k] = `${L[k]}자 이내로 적어 주세요.`;
  });
  const c = f.contact.trim();
  if (!e.contact && !/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(c) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c))
    e.contact = "전화번호나 이메일을 끝까지 적어 주세요. 예: 010-1234-5678";
  return e;
}

export function TicketSheet({ question, category, onClose, onDone }: Props) {
  const [f, setF] = useState<Fields>({ cohort: "제2기", name: "", contact: "", content: question ?? "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setF({ ...f, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: undefined });
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate(f);
    setErrors(v);
    setFormError(null);
    if (Object.keys(v).length) {
      document.getElementById(`t-${Object.keys(v)[0]}`)?.focus();
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, question, category }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setFormError(data.error ?? "접수하지 못했어요. 잠시 뒤 다시 시도해 주세요.");
        return;
      }
      onDone(data.id ?? null);
    } catch {
      setFormError("인터넷 연결을 확인한 뒤 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  const field = (k: keyof Fields, input: React.ReactNode, help?: string) => (
    <div className="field">
      <label className="field__label" htmlFor={`t-${k}`}>
        {LABELS[k]} <small>(필수)</small>
      </label>
      {input}
      {errors[k] ? (
        <p className="field__error" id={`t-${k}-e`}>
          <IconAlert size={16} />
          {errors[k]}
        </p>
      ) : (
        help && <p className="field__help" id={`t-${k}-e`}>{help}</p>
      )}
    </div>
  );
  const aria = (k: keyof Fields) => ({
    id: `t-${k}`,
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": `t-${k}-e`,
    maxLength: L[k],
    value: f[k],
    onChange: set(k),
  });

  return (
    <Sheet title="담당자에게 접수" description="기수, 이름, 연락처, 내용만 받아요. 성적 같은 개인정보는 적지 마세요." onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="field__row">
          {field("cohort", <input className="input" autoComplete="off" {...aria("cohort")} />)}
          {field("name", <input className="input" autoComplete="name" placeholder="홍길동" {...aria("name")} />)}
        </div>
        {field(
          "contact",
          <input className="input" inputMode="email" autoComplete="tel" placeholder="010-1234-5678 또는 이메일" {...aria("contact")} />,
        )}
        {field(
          "content",
          <textarea className="textarea" {...aria("content")} />,
          `담당자가 확인할 수 있게 상황을 짧게 적어 주세요. (${f.content.length}/${L.content})`,
        )}
        {formError && (
          <p className="form-error" role="alert">
            <IconAlert size={20} />
            {formError}
          </p>
        )}
        <div className="sheet__actions">
          <button type="submit" className="btn btn--primary btn--lg btn--block" aria-busy={busy || undefined} disabled={busy}>
            접수하기
          </button>
          <button type="button" className="btn btn--secondary btn--lg btn--block" onClick={onClose}>
            취소
          </button>
        </div>
      </form>
    </Sheet>
  );
}
