import { test } from "node:test";
import assert from "node:assert/strict";
import { checkLimit, RATE, VISITOR_COOKIE } from "../lib/limits.ts";

const headers = (ip: string, vid?: string) =>
  new Headers({ "x-forwarded-for": ip, ...(vid ? { cookie: `other=1; ${VISITOR_COOKIE}=${vid}` } : {}) });
const vid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

test("같은 와이파이(같은 IP)여도 사람마다 따로 센다", () => {
  const ip = "10.1.0.1";
  // 1번 학생이 한도를 다 쓴다
  for (let i = 0; i < RATE.attendance.max; i++) assert.equal(checkLimit("attendance", headers(ip, vid(1))).limited, false);
  assert.equal(checkLimit("attendance", headers(ip, vid(1))).limited, true);
  // 같은 IP의 2번 학생은 아직 조회할 수 있다
  assert.equal(checkLimit("attendance", headers(ip, vid(2))).limited, false);
});

test("처음 온 브라우저에는 익명 ID를 새로 준다", () => {
  const first = checkLimit("chat", headers("10.1.0.2"));
  assert.match(first.newVisitorId ?? "", /^[a-f0-9-]{36}$/);
  assert.equal(checkLimit("chat", headers("10.1.0.2", vid(3))).newVisitorId, null);
  assert.notEqual(checkLimit("chat", headers("10.1.0.2", "not-a-real-id")).newVisitorId, null); // 이상한 쿠키는 새로 준다
});

test("쿠키를 지워 가며 보내도 같은 IP 전체 상한에서 막힌다", () => {
  const ip = "10.1.0.3";
  for (let i = 0; i < RATE.attendanceIp.max; i++) checkLimit("attendance", headers(ip));
  assert.equal(checkLimit("attendance", headers(ip, vid(99))).limited, true);
  assert.equal(checkLimit("attendance", headers("10.1.0.4", vid(99))).limited, false); // 다른 IP는 영향 없음
});
