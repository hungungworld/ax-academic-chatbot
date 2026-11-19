// 출석부(구글 시트) 조회. 링크 공개 시트를 CSV로 내려받아 코드로 읽는다 (API 키 불필요).
//
// 시트 구조 (월별 시트 1장 = 한 달):
//   1행: 공결 한도 표시("최대 5일" …), 운영진이 적는 "반영일" 칸
//   2행: 번 호 | 성 명 | 출결벌점 | 날짜별 칸 … | 병가(3) 면접(5) 설명회(6) 상담(7) 학업(8) 집안(9) | 경미(누락) 지각,조퇴 결석
//   4행~: 학생 한 명이 한 줄. "총인원" 줄에서 끝난다 (그 아래는 기호 설명).
//
// 값의 성격 (2기 시트로 확인):
//   - 출결벌점, 공결 사용 일수: 과정 시작부터의 누적값 → 이번 달 시트의 값을 쓴다 (더하지 않는다).
//   - 경미(누락), 지각·조퇴, 결석 횟수: 그달 값 → 시트마다 따로 보여 준다.
// 열은 위치가 아니라 2행 글자로 찾는다. 운영진이 열을 조금 옮겨도 깨지지 않게.

export const EXCUSED_TYPES = [
  { key: "병가", label: "병가" },
  { key: "면접", label: "취업활동(면접·필기)" },
  { key: "설명회", label: "취업정보(설명회·박람회)" },
  { key: "상담", label: "상담" },
  { key: "학업", label: "학업·업무" },
  { key: "집안", label: "경조사" },
] as const;

export type Excused = { label: string; used: number; max: number | null };
export type MonthCounts = { month: number; minor: number; late: number; absent: number };

export type StudentRow = {
  no: number;
  name: string;
  penalty: number | null; // 출결 벌점 (양수로 바꿔 둔다)
  excused: Excused[] | null; // 공결 칸이 비어 있으면 null (아직 수식이 없는 달)
  counts: Omit<MonthCounts, "month">;
};

export type ParsedSheet = {
  year: number;
  month: number; // 이 시트가 맡은 달 (날짜 칸에서 가장 많이 나온 달)
  asOf: string | null; // "반영일" 칸 값 (YYYY-MM-DD), 없거나 못 읽으면 null
  students: StudentRow[];
};

// ---------- 최종 성적의 출결 점수 (운영담당자 확인, 학사관리표 수식) ----------
//   출결 점수 = MIN(100, MAX(0, 100 − 경미×2 − 지각·조퇴×5 − 결석×10)) × 20%
//   → 20점 만점, 1회당 경미 −0.4 · 지각·조퇴 −1.0 · 결석 −2.0, 0점 아래로는 내려가지 않는다.
export const GRADE_WEIGHT = { minor: 2, late: 5, absent: 10 } as const;
export const GRADE_RATIO = 0.2;
export const GRADE_MAX = 100 * GRADE_RATIO; // 20점

export type GradeResult = {
  counts: Omit<MonthCounts, "month">; // 전체 기간 횟수
  lines: { label: string; count: number; each: number; total: number }[]; // 항목별 감점 (최종 점수 기준, 음수 아님)
  deduction: number; // 최종 점수에서 빠지는 점수 (0~20)
  score: number; // 출결 점수 (0~20)
};

/** 0.1점 단위로 정확히 맞춘다 (0.4×3 = 1.2000000000000002 같은 부동소수 오차 제거) */
const tenth = (n: number) => Math.round(n * 10) / 10;

export function attendanceGrade(counts: Omit<MonthCounts, "month">): GradeResult {
  const raw = Math.min(100, Math.max(0, 100 - counts.minor * GRADE_WEIGHT.minor - counts.late * GRADE_WEIGHT.late - counts.absent * GRADE_WEIGHT.absent));
  const score = tenth(raw * GRADE_RATIO);
  const line = (label: string, count: number, w: number) => ({ label, count, each: tenth(w * GRADE_RATIO), total: tenth(count * w * GRADE_RATIO) });
  return {
    counts,
    lines: [
      line("경미한 지각·퇴실 누락", counts.minor, GRADE_WEIGHT.minor),
      line("지각·조퇴", counts.late, GRADE_WEIGHT.late),
      line("결석", counts.absent, GRADE_WEIGHT.absent),
    ],
    deduction: tenth(GRADE_MAX - score),
    score,
  };
}

export type AttendanceRecord = {
  no: number;
  name: string;
  month: number; // 기준이 된 달
  asOf: string | null;
  asOfStale: boolean; // 반영일이 오늘보다 STALE_DAYS일 넘게 지났는지
  penalty: number | null;
  excused: Excused[] | null;
  excusedMonth: number | null; // 벌점·공결 누적값을 읽은 달 (이번 달 칸이 비어 있으면 지난달)
  monthly: MonthCounts[]; // 지난달부터 이번 달까지, 달 순서대로
  grade: GradeResult; // 월별 횟수를 더해 계산한 최종 성적 출결 점수 (참고값)
};

export type LookupResult =
  | { status: "ok"; record: AttendanceRecord }
  | { status: "choose"; numbers: number[] } // 동명이인: 출석부 번호를 골라야 한다
  | { status: "not_found" };

export const STALE_DAYS = 7;

// ---------- CSV ----------

/** 따옴표·줄바꿈이 들어간 칸까지 읽는 작은 CSV 파서 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

// ---------- 시트 읽기 ----------

const squash = (s: string | undefined) => (s ?? "").replace(/\s+/g, "");
/** 이름 비교용: 공백 제거 */
export const normalizeName = (s: string) => s.normalize("NFC").replace(/\s+/g, "");

const num = (s: string | undefined): number | null => {
  const t = (s ?? "").replace(/,/g, "").trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

/** "2026-11-18", "2026.11.18", "11/18", "11.18" → "YYYY-MM-DD" */
export function parseDateCell(s: string, fallbackYear: number): string | null {
  const t = s.trim();
  let m = t.match(/^(\d{4})\s*[-./년]\s*(\d{1,2})\s*[-./월]\s*(\d{1,2})/);
  let y = fallbackYear, mo: number, d: number;
  if (m) { y = Number(m[1]); mo = Number(m[2]); d = Number(m[3]); }
  else {
    m = t.match(/^(\d{1,2})\s*[./월]\s*(\d{1,2})/);
    if (!m) return null;
    mo = Number(m[1]); d = Number(m[2]);
  }
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function parseSheet(rows: string[][]): ParsedSheet | null {
  const h = rows.findIndex((r) => r.some((c) => squash(c) === "성명") && r.some((c) => squash(c) === "번호"));
  if (h < 0) return null;
  const head = rows[h].map(squash);
  const col = (pred: (c: string) => boolean) => head.findIndex(pred);
  const cNo = col((c) => c === "번호");
  const cName = col((c) => c === "성명");
  const cPenalty = col((c) => c === "출결벌점");
  // 공결 칸은 "병가(3)"처럼 기호 번호가 붙는다. 날짜 칸 안의 글자와 헷갈리지 않게 헤더 줄에서만 찾는다.
  const excusedCols = EXCUSED_TYPES.map((t) => col((c) => c === t.key || c.startsWith(`${t.key}(`)));
  const cMinor = col((c) => c.startsWith("경미"));
  const cLate = col((c) => c.startsWith("지각"));
  const cAbsent = col((c) => c === "결석");

  // 이 시트의 달: 헤더 줄 날짜 칸에서 가장 많이 나온 달
  const months = new Map<string, number>();
  for (const c of rows[h]) {
    const m = c.trim().match(/^(\d{4})-(\d{2})-\d{2}$/);
    if (m) months.set(`${m[1]}-${m[2]}`, (months.get(`${m[1]}-${m[2]}`) ?? 0) + 1);
  }
  const top = [...months.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!top) return null;
  const [year, month] = top.split("-").map(Number);

  // "반영일" 칸: 헤더 위쪽 줄에서 글자를 찾아 오른쪽 첫 값
  let asOf: string | null = null;
  for (const r of rows.slice(0, h + 1)) {
    const i = r.findIndex((c) => squash(c).startsWith("반영일"));
    if (i < 0) continue;
    const inline = r[i].split(/[:：]/)[1]; // "반영일: 11/18"처럼 한 칸에 쓴 경우
    const value = inline?.trim() || r.slice(i + 1).find((c) => c.trim()) || "";
    asOf = parseDateCell(value, year);
    break;
  }

  const students: StudentRow[] = [];
  for (const r of rows.slice(h + 1)) {
    if (squash(r[cNo]).startsWith("총인원")) break;
    const no = Number(r[cNo]?.trim());
    const name = (r[cName] ?? "").trim();
    if (!Number.isInteger(no) || no <= 0 || !name) continue;
    const penalty = cPenalty >= 0 ? num(r[cPenalty]) : null;
    const usedList = excusedCols.map((c) => (c >= 0 ? num(r[c]) : null));
    const excused = usedList.every((v) => v === null)
      ? null
      : EXCUSED_TYPES.map((t, i) => {
          const c = excusedCols[i];
          const maxCell = c >= 0 ? rows.slice(0, h).map((rr) => rr[c] ?? "").find((v) => /최대/.test(v)) : undefined;
          const max = maxCell ? Number(maxCell.match(/(\d+(?:\.\d+)?)/)?.[1]) : NaN;
          return { label: t.label, used: usedList[i] ?? 0, max: Number.isFinite(max) ? max : null };
        });
    students.push({
      no,
      name,
      penalty: penalty === null ? null : Math.abs(penalty),
      excused,
      counts: { minor: num(r[cMinor]) ?? 0, late: num(r[cLate]) ?? 0, absent: num(r[cAbsent]) ?? 0 },
    });
  }
  return { year, month, asOf, students };
}

// ---------- 조회 ----------

const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

/** today: 한국 시간 "YYYY-MM-DD" */
export function lookup(sheets: ParsedSheet[], name: string, no: number | null, today: string): LookupResult {
  const [ty, tm] = today.split("-").map(Number);
  const key = (s: ParsedSheet) => s.year * 100 + s.month;
  // 오늘 이후의 달 시트는 쓰지 않는다 (미리 만들어 둔 다음 달 시트의 값은 아직 의미가 없다)
  const usable = sheets.filter((s) => key(s) <= ty * 100 + tm).sort((a, b) => key(a) - key(b));
  if (!usable.length) return { status: "not_found" };
  const current = usable[usable.length - 1];

  const target = normalizeName(name);
  const matches = current.students.filter((s) => normalizeName(s.name) === target);
  if (!matches.length) return { status: "not_found" };
  let me = matches[0];
  if (matches.length > 1) {
    const picked = no === null ? undefined : matches.find((s) => s.no === no);
    if (!picked) return { status: "choose", numbers: matches.map((s) => s.no).sort((a, b) => a - b) };
    me = picked;
  }

  // 같은 사람은 번호로 따라간다 (달마다 줄 순서가 같다는 보장이 없어서 이름+번호로 맞춘다)
  const rowIn = (s: ParsedSheet) => s.students.find((r) => r.no === me.no && normalizeName(r.name) === target);
  const withExcused = [...usable].reverse().find((s) => rowIn(s)?.excused);
  const monthly = usable.flatMap((s) => {
    const r = rowIn(s);
    return r ? [{ month: s.month, ...r.counts }] : [];
  });
  // 경미·지각·결석 횟수는 그달 값이라 여기서는 더한다 (누적값인 벌점·공결과 다르다)
  const totals = monthly.reduce((t, m) => ({ minor: t.minor + m.minor, late: t.late + m.late, absent: t.absent + m.absent }), { minor: 0, late: 0, absent: 0 });
  return {
    status: "ok",
    record: {
      no: me.no,
      name: me.name,
      month: current.month,
      asOf: current.asOf,
      asOfStale: current.asOf ? daysBetween(current.asOf, today) > STALE_DAYS : false,
      // 이번 달 시트의 공결 칸이 아직 비어 있으면(새 달 초) 벌점도 아직 정리 전이라 공결과 같은 시트에서 읽는다.
      penalty: withExcused ? rowIn(withExcused)!.penalty : me.penalty,
      excused: withExcused ? rowIn(withExcused)!.excused : null,
      excusedMonth: withExcused?.month ?? null,
      monthly,
      grade: attendanceGrade(totals),
    },
  };
}

// ---------- 내려받기 (서버 전용) ----------

const CACHE_MS = 5 * 60_000;
let cache: { at: number; sheets: ParsedSheet[] } | null = null;

export function attendanceProblem(): string | null {
  if (!process.env.ATTENDANCE_SHEET_ID?.trim()) return "ATTENDANCE_SHEET_ID 가 설정되지 않았습니다.";
  if (!process.env.ATTENDANCE_SHEET_GIDS?.trim()) return "ATTENDANCE_SHEET_GIDS 가 설정되지 않았습니다.";
  return null;
}

async function fetchSheet(id: string, gid: string): Promise<ParsedSheet | null> {
  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(id)}/export?format=csv&gid=${encodeURIComponent(gid)}`;
  const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(10_000), cache: "no-store" });
  if (!res.ok) throw new Error(`출석부 시트(gid ${gid})를 받지 못했습니다: HTTP ${res.status}`);
  const text = await res.text();
  if (/^\s*<(!doctype|html)/i.test(text)) throw new Error("출석부가 CSV가 아니라 로그인 화면으로 돌아왔습니다. 시트의 링크 공유가 꺼졌을 수 있습니다.");
  return parseSheet(parseCsv(text));
}

/** 월별 시트를 모두 읽는다. 5분 동안은 다시 받지 않는다. */
export async function loadSheets(): Promise<ParsedSheet[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.sheets;
  const id = process.env.ATTENDANCE_SHEET_ID!.trim();
  const gids = process.env.ATTENDANCE_SHEET_GIDS!.split(",").map((g) => g.trim()).filter(Boolean);
  const sheets = (await Promise.all(gids.map((g) => fetchSheet(id, g)))).filter((s): s is ParsedSheet => !!s);
  if (!sheets.length) throw new Error("출석부에서 읽을 수 있는 시트가 없습니다. 헤더(번 호, 성 명)를 확인해 주세요.");
  cache = { at: Date.now(), sheets };
  return sheets;
}

/** 한국 시간 오늘 날짜 "YYYY-MM-DD" */
export function todayKst(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
