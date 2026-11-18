import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { chunkRules } from "../lib/chunk-rules.ts";

const md = readFileSync(new URL("../rules_with_tables.md", import.meta.url), "utf-8");
const chunks = chunkRules(md);

test("제1조~제29조가 빠짐없이 한 번씩 나온다", () => {
  for (let n = 1; n <= 29; n++) {
    assert.equal(chunks.filter((c) => c.label === `제${n}조`).length, 1, `제${n}조`);
  }
});

test("조 뒤에 붙은 표는 그 조에 들어간다", () => {
  const a7 = chunks.find((c) => c.label === "제7조")!;
  assert.match(a7.text, /취업\s*\n?\s*활동/);
  assert.match(a7.text, /병가 인정 원칙/);
  const a25 = chunks.find((c) => c.label === "제25조")!;
  assert.match(a25.text, /571H/);
});

test("연락처와 생활수칙이 따로 있다", () => {
  assert.ok(chunks.find((c) => c.label === "생활수칙"));
  assert.match(chunks.find((c) => c.title === "공지 및 연락망")!.text, /02-6000-5968/);
});

test("id가 겹치지 않는다", () => {
  assert.equal(new Set(chunks.map((c) => c.id)).size, chunks.length);
});
