-- 담당자 접수 내용 (Neon Postgres)
-- 만들기: npm run db:init
CREATE TABLE IF NOT EXISTS tickets (
  id          BIGSERIAL PRIMARY KEY,
  cohort      TEXT NOT NULL,              -- 기수
  name        TEXT NOT NULL,              -- 이름
  contact     TEXT NOT NULL,              -- 연락처 (전화 또는 이메일)
  content     TEXT NOT NULL,              -- 문의 내용
  question    TEXT,                       -- 접수 직전에 챗봇에 한 질문 (있으면)
  category    TEXT,                       -- 챗봇 분류 (personal 등)
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'done')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tickets_created_at_idx ON tickets (created_at DESC);
