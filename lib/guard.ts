// 모델에 묻기 전에 코드로 먼저 정하는 분류 (CLAUDE.md 답변 규칙).
// 확실한 경우만 여기서 정하고, 나머지는 LangGraph의 분류 노드(모델)가 정한다.
import type { Category } from "./types";

export type GuardResult = { category: Category; reason: string; attendedHours?: number } | null;

const INJECTION =
  /(시스템\s*프롬프트|system\s*prompt|지시문|내부\s*(규칙|지침|설정)|프롬프트.*(보여|알려|출력|공개)|(이전|위의?|앞의?)\s*(지시|명령).*(무시|잊)|ignore\s+(all|previous|the)|개발자\s*모드|jailbreak)/i;

// 개인 점수·벌점 조회: 챗봇은 조회하지 않고 접수한다.
const MY_SCORE = /(제|내|저의|나의|저)\s*(현재\s*)?(벌점|상점|점수|성적|출석률|출결)\s*(이|은|는|가)?\s*.{0,10}(몇|얼마|알려|조회|확인)/;
// 운영진 구두 허락 주장, 처리 지시: 예외사항이라 담당자에게 접수한다.
const VERBAL_OK = /(운영진|담당자|선생님|매니저|대리).{0,12}(허락|허가|괜찮다고|된다고|오케이|OK)/i;
const ORDER = /(무조건|꼭|반드시|그냥).{0,20}(인정|처리|해\s*줘|해\s*주세요|바꿔)/;
// 성적 이의, 퇴교 여부 등 개인 판단
const APPEAL = /(이의\s*(제기|신청)|성적.*(이상|틀렸|잘못))/;

const REFUND = /(환불|환급받|돌려받)/;

export function guard(question: string): GuardResult {
  const q = question.trim();
  if (INJECTION.test(q)) return { category: "blocked", reason: "내부 지시문 요청" };
  if (MY_SCORE.test(q)) return { category: "personal", reason: "개인 점수 조회" };
  if (VERBAL_OK.test(q) || ORDER.test(q)) return { category: "personal", reason: "구두 허락·처리 요청" };
  if (APPEAL.test(q) && /(하고\s*싶|할래|하려|어떻게)/.test(q)) return { category: "personal", reason: "성적 이의 제기" };
  // "교육비 환불" 질문: 공식 안내 + 코드 계산기. (장학금 '환급'은 제외)
  if (REFUND.test(q) && !/장학금/.test(q)) {
    const h = q.match(/(\d{1,3})\s*시간/);
    return { category: "refund", reason: "환불 계산", attendedHours: h ? Number(h[1]) : undefined };
  }
  return null;
}
