// 모델 답변을 코드로 한 번 더 점검한다 (운영 확정 기준 보충, 개인 판단 문장 제거)

/** 지각 벌점 질문이면 운영 확정 기준(2점·5점)을 둘 다 넣는다. 빠른 모델이 한쪽만 쓰는 경우가 있다. */
const LATE_POINTS = [
  "경미한 지각: 09:51~10:00 입실 체크는 벌점 2점이에요.",
  "지각: 10:01 이후 입실 체크는 벌점 5점이에요.",
];
export function ensureLatePoints(question: string, points: string[]): string[] {
  if (!/(지각|늦|출근\s*체크|\d{1,2}\s*시\s*\d{1,2}\s*분)/.test(question) || !/(벌점|몇\s*점|점수)/.test(question)) return points;
  const text = points.join(" ");
  const missing = LATE_POINTS.filter((p) => !text.includes(p.includes("2점") ? "2점" : "5점"));
  return [...missing, ...points];
}

/**
 * 개인 사정 답변에서 학생이 말한 숫자에 규정을 대입한 결론("28점은 퇴교 대상이 아니에요")을 지운다.
 * 판단은 담당자가 한다 (CLAUDE.md 답변 규칙).
 */
const VERDICT = /(대상이\s*아니|대상이에요|대상이\s*돼|해당하지\s*않|해당돼|해당해요|인정돼요|인정되지\s*않|인정받을\s*수|면제돼|안전|괜찮|문제없|위험)/;
export function dropPersonalVerdicts(question: string, texts: string[]): string[] {
  const nums = question.match(/\d+(?:\.\d+)?/g) ?? [];
  if (!nums.length) return texts;
  return texts.filter((t) => !(VERDICT.test(t) && nums.some((n) => new RegExp(`(^|[^\\d])${n}([^\\d]|$)`).test(t))));
}
