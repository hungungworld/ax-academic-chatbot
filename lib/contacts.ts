// 학사 안내 문서 "Ⅴ-2. 공지 및 연락망"의 교육 담당자 (규정 원문 그대로)
// 개인 핸드폰 번호는 챗봇에 노출하지 않는다 (운영담당자 요청). 사무실 전화와 이메일만 안내한다.
export type Contact = { name: string; role: string; phone: string; email: string };

export const CONTACTS: Contact[] = [
  { name: "이승제", role: "대리", phone: "02-6000-5968", email: "seongje.lee@kita.or.kr" },
  { name: "이현영", role: "매니저", phone: "02-6000-7609", email: "hylee0120@kita.net" },
];

/** 규정 원문 조각에서 핸드폰 번호를 지운다 (모델에 넘기기 전에). */
export function stripMobile(text: string): string {
  return text
    .replace(/(<br>)?\s*-\s*핸드폰\s*:\s*010-\d{3,4}-\d{4}/g, "")
    .replace(/010-\d{3,4}-\d{4}/g, "");
}
