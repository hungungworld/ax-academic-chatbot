"use client";
// 제25조 환불 계산기. 모델이 아니라 lib/refund.ts 코드가 계산한다.
import { useMemo, useState } from "react";
import { calculateRefund, TOTAL_HOURS, validateRefundInput, won, type RefundInput } from "@/lib/refund";
import { IconAlert } from "./Icons";
import { Sheet } from "./Sheet";

const digits = (s: string) => s.replace(/[^\d]/g, "");
const toNum = (s: string) => (digits(s) ? Number(digits(s)) : undefined);
const fmt = (s: string) => (digits(s) ? Number(digits(s)).toLocaleString("ko-KR") : "");

export function RefundSheet({ attendedHours, onClose }: { attendedHours?: number; onClose: () => void }) {
  const [total, setTotal] = useState("");
  const [paid, setPaid] = useState("");
  const [hours, setHours] = useState(attendedHours != null ? String(attendedHours) : "");
  const [touched, setTouched] = useState(false);

  const input = { totalFee: toNum(total), paidFee: toNum(paid) ?? toNum(total), attendedHours: toNum(hours) };
  const error = validateRefundInput(input);
  const result = useMemo(() => (error ? null : calculateRefund(input as RefundInput)), [error, input.totalFee, input.paidFee, input.attendedHours]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Sheet
      title="환불액 계산 (제25조)"
      description="교육비 금액을 넣으면 규정 공식대로 계산해요. 실제 환불액은 담당자 확인이 필요해요."
      onClose={onClose}
    >
      <form onSubmit={(e) => { e.preventDefault(); setTouched(true); }} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="r-total">전체 교육비 <small>(원)</small></label>
          <input id="r-total" className="input t-num" inputMode="numeric" placeholder="예: 5,710,000" value={fmt(total)}
            onChange={(e) => setTotal(digits(e.target.value))} onBlur={() => setTouched(true)} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="r-paid">납입 교육비 <small>(원)</small></label>
          <input id="r-paid" className="input t-num" inputMode="numeric" placeholder="비우면 전체 교육비와 같게 계산" value={fmt(paid)}
            onChange={(e) => setPaid(digits(e.target.value))} aria-describedby="r-paid-h" />
          <p className="field__help" id="r-paid-h">장학금 환급 등으로 실제 낸 금액이 다르면 그 금액을 넣어 주세요.</p>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="r-hours">수강시수 <small>(시간, 전체 {TOTAL_HOURS}시간)</small></label>
          <input id="r-hours" className="input t-num" inputMode="numeric" placeholder="예: 100" value={hours}
            onChange={(e) => setHours(digits(e.target.value).slice(0, 3))} onBlur={() => setTouched(true)} />
        </div>

        {touched && error && (total || hours) && (
          <p className="form-error" role="alert"><IconAlert size={20} />{error}</p>
        )}

        {result && (
          <div className="refund-result" aria-live="polite">
            <dl>
              <dt>납입 교육비</dt><dd>{won(result.paidFee)}</dd>
              <dt>위약금 (전체의 10%)</dt><dd>− {won(result.penalty)}</dd>
              <dt>수강분 ({won(result.hourlyFee)} × {result.attendedHours}시간)</dt><dd>− {won(result.attendedFee)}</dd>
              <dt className="refund-total">환불액</dt><dd className="refund-total">{won(result.refund)}</dd>
            </dl>
            <p className="t-caption">
              {result.isZero ? "계산값이 0원 이하라 환불액이 없어요. " : ""}
              1시간당 교육비 = 전체 교육비 ÷ {TOTAL_HOURS}시간, 원 단위 절사. 조기수료(제24조)로 수료하면 교육비는 환불되지 않아요.
            </p>
          </div>
        )}

        <div className="sheet__actions">
          <button type="button" className="btn btn--secondary btn--lg btn--block" onClick={onClose}>닫기</button>
        </div>
      </form>
    </Sheet>
  );
}
