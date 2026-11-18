// 제25조(교육비 환불) 계산식을 코드로 그대로 계산한다. 모델에 맡기지 않는다.
//   환불액 = 납입 교육비 − 위약금 − (1시간당 교육비 × 수강시수)
//   위약금 = 전체교육비의 10%,  1시간당 교육비 = 전체교육비 / 전체교육시수(571H)
//   * 원단위 절사 → 1원 자리를 버려 10원 단위로 맞춘다.

export const TOTAL_HOURS = 571;

export type RefundInput = { paidFee: number; totalFee: number; attendedHours: number };

export type RefundResult = RefundInput & {
  penalty: number; // 위약금
  hourlyFee: number; // 1시간당 교육비 (원 미만 버림, 표시용)
  attendedFee: number; // 수강분 교육비 (원 미만 버림, 표시용)
  refund: number; // 환불액 (10원 단위 절사, 0 미만이면 0)
  isZero: boolean; // 계산값이 0 이하라 환불액이 없는 경우
};

export function validateRefundInput(input: Partial<RefundInput>): string | null {
  const { paidFee, totalFee, attendedHours } = input;
  const isInt = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n);
  if (!isInt(totalFee) || totalFee <= 0) return "전체 교육비를 원 단위 정수로 입력해 주세요.";
  if (!isInt(paidFee) || paidFee < 0) return "납입 교육비를 원 단위 정수로 입력해 주세요.";
  if (!isInt(attendedHours) || attendedHours < 0) return "수강시수를 시간 단위 정수로 입력해 주세요.";
  if (attendedHours > TOTAL_HOURS) return `수강시수는 전체 교육시수(${TOTAL_HOURS}시간)를 넘을 수 없어요.`;
  if (totalFee > 1_000_000_000 || paidFee > 1_000_000_000) return "금액이 너무 커요. 다시 확인해 주세요.";
  return null;
}

export function calculateRefund(input: RefundInput): RefundResult {
  const error = validateRefundInput(input);
  if (error) throw new Error(error);
  const { paidFee, totalFee, attendedHours } = input;

  // 소수 오차를 피하려고 분모(571 × 10)를 곱한 정수로 계산한 뒤 마지막에 한 번만 나눈다.
  //   환불액 × 5710 = 납입 × 5710 − 전체 × 571 − 전체 × 시수 × 10
  const scaled = paidFee * 5710 - totalFee * 571 - totalFee * attendedHours * 10;
  const refundWon = Math.floor(scaled / 5710); // 원 미만 버림
  const refund = Math.max(0, Math.floor(refundWon / 10) * 10); // 원단위 절사

  return {
    ...input,
    penalty: Math.floor(totalFee / 10),
    hourlyFee: Math.floor(totalFee / TOTAL_HOURS),
    attendedFee: Math.floor((totalFee * attendedHours) / TOTAL_HOURS),
    refund,
    isZero: refund === 0,
  };
}

export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
