import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateRefund, validateRefundInput } from "../lib/refund.ts";

test("제25조 공식: 수강 0시간이면 위약금 10%만 뺀다", () => {
  const r = calculateRefund({ paidFee: 5_710_000, totalFee: 5_710_000, attendedHours: 0 });
  assert.equal(r.penalty, 571_000);
  assert.equal(r.refund, 5_139_000);
});

test("제25조 공식: 시간당 교육비 × 수강시수를 뺀다", () => {
  // 시간당 10,000원, 100시간 수강 → 5,710,000 − 571,000 − 1,000,000
  const r = calculateRefund({ paidFee: 5_710_000, totalFee: 5_710_000, attendedHours: 100 });
  assert.equal(r.hourlyFee, 10_000);
  assert.equal(r.refund, 4_139_000);
});

test("원단위 절사: 1원 자리를 버린다", () => {
  // 3,000,000 − 300,000 − 3,000,000×7/571(=36,777.58…) = 2,663,222.41… → 2,663,220
  const r = calculateRefund({ paidFee: 3_000_000, totalFee: 3_000_000, attendedHours: 7 });
  assert.equal(r.refund, 2_663_220);
});

test("계산값이 음수면 환불액은 0", () => {
  const r = calculateRefund({ paidFee: 1_000_000, totalFee: 5_710_000, attendedHours: 500 });
  assert.equal(r.refund, 0);
  assert.equal(r.isZero, true);
});

test("입력 검증", () => {
  assert.ok(validateRefundInput({ paidFee: 1, totalFee: 0, attendedHours: 1 }));
  assert.ok(validateRefundInput({ paidFee: 1, totalFee: 100, attendedHours: 572 }));
  assert.ok(validateRefundInput({ paidFee: 1.5, totalFee: 100, attendedHours: 1 }));
  assert.equal(validateRefundInput({ paidFee: 1, totalFee: 100, attendedHours: 571 }), null);
});
