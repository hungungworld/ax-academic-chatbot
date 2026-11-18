// 담당자 접수 목록 (비밀번호 보호)
import type { Metadata } from "next";
import Link from "next/link";
import { dbReady, listTickets } from "@/lib/db";
import { adminProblem, isAdmin } from "@/lib/session";
import type { Ticket, TicketStatus } from "@/lib/types";
import { AdminLogin, LogoutButton, TicketList } from "./AdminClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "접수 목록 · AX마스터 학사 도우미" };

const TABS: { key: TicketStatus | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "new", label: "접수" },
  { key: "in_progress", label: "처리 중" },
  { key: "done", label: "완료" },
];

function Shell({ children, loggedIn = false }: { children: React.ReactNode; loggedIn?: boolean }) {
  return (
    <div className="admin-bg">
      <div className="bg-blobs" aria-hidden="true" />
      <header className="header">
        <div className="header-inner header-inner--admin">
          <div className="header__brand">
            <div className="orb orb--sm" aria-hidden="true" />
            <span>학사 도우미 · 담당자</span>
          </div>
          <div className="header__actions">
            <Link href="/" className="btn btn--ghost btn--sm">챗봇 화면</Link>
            {loggedIn && <LogoutButton />}
          </div>
        </div>
      </header>
      <main className="container container--admin admin-main">{children}</main>
    </div>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const problem = adminProblem();
  if (problem)
    return (
      <Shell>
        <div className="card glass glass--strong login-card">
          <h1 className="t-h2">담당자 화면 설정이 필요해요</h1>
          <p className="t-sub" style={{ marginTop: "var(--space-2)" }}>
            서버 환경변수 <code>ADMIN_PASSWORD</code>와 <code>SESSION_SECRET</code>(32자 이상)을 넣은 뒤 다시 열어 주세요.
          </p>
        </div>
      </Shell>
    );

  if (!(await isAdmin()))
    return (
      <Shell>
        <AdminLogin />
      </Shell>
    );

  const { status: raw } = await searchParams;
  const status = (["new", "in_progress", "done"] as const).find((s) => s === raw);

  let tickets: Ticket[] = [];
  let error: string | null = null;
  if (!dbReady()) error = "DATABASE_URL 환경변수가 없어 접수를 저장·조회할 수 없어요. 지금은 알림 메일로만 접수가 전달돼요.";
  else {
    try {
      tickets = await listTickets(status);
    } catch (e) {
      console.error("[admin] 목록 조회 실패:", e instanceof Error ? e.message : e);
      error = "접수 목록을 불러오지 못했어요. Neon 연결과 tickets 테이블(npm run db:init)을 확인해 주세요.";
    }
  }

  return (
    <Shell loggedIn>
      <div className="admin-head">
        <div className="stack-2">
          <h1 className="t-h1">접수 목록</h1>
          <p className="t-sub">챗봇에서 담당자에게 접수된 문의예요. 최근 300건까지 보여요.</p>
        </div>
      </div>
      <nav className="tabs" aria-label="상태별 보기">
        {TABS.map((t) => {
          const active = (t.key === "all" && !status) || t.key === status;
          return (
            <Link key={t.key} href={t.key === "all" ? "/admin" : `/admin?status=${t.key}`} className="chip" aria-pressed={active} aria-current={active ? "page" : undefined}>
              {t.label}
            </Link>
          );
        })}
      </nav>
      {error ? (
        <div className="admin-panel">
          <p className="empty t-sub">{error}</p>
        </div>
      ) : (
        <TicketList tickets={tickets} />
      )}
    </Shell>
  );
}
