// 화면과 서버가 함께 쓰는 타입

/** ① 규정에 명시 / ② 개인 사정·담당자 판단 / ③ 규정에 없음·범위 밖 / 환불 계산 / 거절 */
export type Category = "rule" | "personal" | "out_of_scope" | "refund" | "blocked";

export type ChatTurn = { role: "user" | "bot"; text: string };

export type Citation = { label: string; title?: string };

export type ChatReply = {
  category: Category;
  /** 핵심 답 한 문장 (화면에서 굵게) */
  summary: string;
  /** 세부 내용. 화면에서 번호 목록으로 보여 준다. "구분: 설명" 형태면 구분을 굵게 */
  points: string[];
  /** 예외·주의·개별 판단 여지 (화면에서 '참고' 상자) */
  note?: string;
  /** 위 세 칸을 이어 붙인 글 (대화 기록·화면 읽기용) */
  answer: string;
  citations: Citation[];
  /** 담당자 접수 버튼을 보여 줄지 */
  handoff: boolean;
  /** 담당자 연락처 카드를 보여 줄지 */
  showContacts: boolean;
  /** 환불 계산기를 열 수 있게 할지 (수강시수를 말했으면 미리 채움) */
  refund?: { attendedHours?: number };
};

export type TicketStatus = "new" | "in_progress" | "done";

export type Ticket = {
  id: number;
  cohort: string;
  name: string;
  contact: string;
  content: string;
  question: string | null;
  category: string | null;
  status: TicketStatus;
  created_at: string;
};
