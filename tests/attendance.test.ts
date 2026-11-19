import { test } from "node:test";
import assert from "node:assert/strict";
import { attendanceGrade, lookup, parseCsv, parseDateCell, parseSheet, type ParsedSheet } from "../lib/attendance.ts";

// 실제 출석부와 같은 모양의 가짜 시트 (이름은 모두 가짜)
// 1행: 공결 칸(8번째 열부터) 위에 "최대 N일". 앞 두 칸에는 운영진이 반영일을 적을 수 있다.
const topRow = (first = "", second = "") =>
  [first, second, "", "", "", "", "", "최대 5일", "최대 10일", "최대 3일", "최대 5일", "최대 5일", "최대 5일", "", "", "", ""].join(",");
const LIMITS = topRow();
const HEAD = (d1: string, d2: string) =>
  `번 호,성 명,출결벌점,${d1},,${d2},,병가(3),면접(5),설명회(6),상담(7),학업(8),집안(9),,경미(누락),"지각,조퇴",결석`;
const LEGEND = "0,누락/샤플오류,,,,,,,,,,,,,,,\n3-1,병가(조퇴),,,,,,,,,,,,,,,";

function sheet(opts: { top?: string; d1: string; d2: string; rows: string[] }): ParsedSheet {
  const csv = [opts.top ?? LIMITS, HEAD(opts.d1, opts.d2), ",,,오전,,오전,,,,,,,,,,,", ...opts.rows, "총인원,,0,,,,,,,,,,,,,,", ",,,,,,,,,,,,,,,,", LEGEND].join("\n");
  const s = parseSheet(parseCsv(csv));
  assert.ok(s);
  return s;
}

const OCT = sheet({ d1: "2026-10-05", d2: "2026-10-06", rows: ["1,김가나,-6,,,,,3,0,0,0,0,0,,1,0,0", "2,이다라,0,,,,,0,1,0,0,0,0,,0,0,0", "3,김가나,-2,,,,,1,0,0,0,0,0,,0,0,0"] });
const NOV = sheet({
  top: topRow("반영일", "2026-11-18"),
  d1: "2026-11-02",
  d2: "2026-11-03",
  rows: ["1,김가나,-8,,,,,3.5,0,0,0,0,0,,1,0,0", "2,이다라,-5,,,,,0,2,0,0,0,0,,0,1,0", "3,김가나,-2,,,,,1,0,0,0,0,0,,0,0,0"],
});
// 다음 달 시트: 공결 칸은 비어 있고 벌점은 옛 값이 복사돼 있다
const DEC = sheet({ d1: "2026-12-01", d2: "2026-12-02", rows: ["1,김가나,-6,,,,,,,,,,,,0,0,0", "2,이다라,0,,,,,,,,,,,,0,0,0", "3,김가나,-2,,,,,,,,,,,,0,0,0"] });
const ALL = [DEC, OCT, NOV];

test("시트 읽기: 달·반영일·학생 줄 (총인원 아래 기호 설명은 무시)", () => {
  assert.equal(NOV.month, 11);
  assert.equal(NOV.asOf, "2026-11-18");
  assert.equal(OCT.asOf, null);
  assert.equal(NOV.students.length, 3);
  assert.deepEqual(NOV.students[1].counts, { minor: 0, late: 1, absent: 0 });
  assert.equal(NOV.students[0].penalty, 8);
  assert.deepEqual(NOV.students[0].excused?.[0], { label: "병가", used: 3.5, max: 5 });
  assert.equal(NOV.students[0].excused?.[1].max, 10);
  assert.equal(DEC.students[0].excused, null);
});

test("이름 하나면 바로 결과: 벌점·공결은 이번 달 누적값, 횟수는 달마다", () => {
  const r = lookup(ALL, " 이 다라 ", null, "2026-11-19");
  assert.equal(r.status, "ok");
  if (r.status !== "ok") return;
  assert.equal(r.record.month, 11);
  assert.equal(r.record.penalty, 5);
  assert.equal(r.record.excused?.[1].used, 2);
  assert.deepEqual(r.record.monthly.map((m) => m.month), [10, 11]);
  assert.equal(r.record.asOf, "2026-11-18");
  assert.equal(r.record.asOfStale, false);
});

test("동명이인이면 번호를 고르게 하고, 고른 번호로 찾는다", () => {
  assert.deepEqual(lookup(ALL, "김가나", null, "2026-11-19"), { status: "choose", numbers: [1, 3] });
  assert.deepEqual(lookup(ALL, "김가나", 2, "2026-11-19"), { status: "choose", numbers: [1, 3] });
  const r = lookup(ALL, "김가나", 3, "2026-11-19");
  assert.equal(r.status === "ok" && r.record.no, 3);
  assert.equal(r.status === "ok" && r.record.penalty, 2);
});

test("없는 이름은 not_found (비슷한 이름을 알려 주지 않는다)", () => {
  assert.deepEqual(lookup(ALL, "김가", null, "2026-11-19"), { status: "not_found" });
});

test("반영일이 7일 넘게 지나면 오래됨 표시", () => {
  const r = lookup(ALL, "이다라", null, "2026-11-26");
  assert.equal(r.status === "ok" && r.record.asOfStale, true);
});

test("새 달 초 공결 칸이 비어 있으면 벌점·공결은 지난달 시트 기준", () => {
  const r = lookup(ALL, "이다라", null, "2026-12-02");
  assert.equal(r.status, "ok");
  if (r.status !== "ok") return;
  assert.equal(r.record.month, 12);
  assert.equal(r.record.excusedMonth, 11);
  assert.equal(r.record.penalty, 5); // 12월 시트의 옛 값(0)이 아니라 11월 값
  assert.equal(r.record.asOf, null);
});

test("반영일 형식: 날짜만, 한 칸에 '반영일: 11/18'", () => {
  assert.equal(parseDateCell("11/18", 2026), "2026-11-18");
  assert.equal(parseDateCell("2026.11.8", 2026), "2026-11-08");
  assert.equal(parseDateCell("아직", 2026), null);
  const s = sheet({ top: topRow("반영일: 11/18"), d1: "2026-11-02", d2: "2026-11-03", rows: ["1,박마바,0,,,,,0,0,0,0,0,0,,0,0,0"] });
  assert.equal(s.asOf, "2026-11-18");
});

test("최종 성적 출결 점수: 1회당 경미 −0.4, 지각 −1, 결석 −2 (20점 만점)", () => {
  const g = attendanceGrade({ minor: 3, late: 1, absent: 1 });
  assert.deepEqual(g.lines.map((l) => [l.each, l.total]), [[0.4, 1.2], [1, 1], [2, 2]]);
  assert.equal(g.deduction, 4.2);
  assert.equal(g.score, 15.8);
  assert.deepEqual(attendanceGrade({ minor: 0, late: 0, absent: 0 }), { ...attendanceGrade({ minor: 0, late: 0, absent: 0 }), deduction: 0, score: 20 });
});

test("출결 점수는 0점 아래로 내려가지 않는다", () => {
  const g = attendanceGrade({ minor: 0, late: 0, absent: 11 }); // 원점수 100 − 110 → 0
  assert.equal(g.score, 0);
  assert.equal(g.deduction, 20);
});

test("조회 결과의 출결 점수는 월별 횟수를 더해 계산한다", () => {
  const r = lookup(ALL, "김가나", 1, "2026-11-19"); // 10월 경미 1 + 11월 경미 1
  assert.equal(r.status, "ok");
  if (r.status !== "ok") return;
  assert.deepEqual(r.record.grade.counts, { minor: 2, late: 0, absent: 0 });
  assert.equal(r.record.grade.score, 19.2);
});
