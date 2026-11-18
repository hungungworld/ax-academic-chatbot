// db/schema.sql 로 Neon에 테이블을 만든다. 실행: npm run db:init  (.env 의 DATABASE_URL 필요)
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(".env 에 DATABASE_URL(Neon 연결 문자열)을 넣은 뒤 다시 실행하세요.");
  process.exit(1);
}

const sql = neon(url);
const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf-8");
const statements = schema
  .split("\n")
  .filter((l) => !l.trim().startsWith("--"))
  .join("\n")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const st of statements) {
  await sql.query(st);
  console.log("실행:", st.split("\n")[0]);
}
console.log("tickets 테이블 준비 완료");
