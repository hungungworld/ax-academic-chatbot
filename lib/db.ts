// 담당자 접수 저장 (Neon Postgres). 서버에서만 쓴다.
import { neon } from "@neondatabase/serverless";
import type { Ticket, TicketStatus } from "./types";

export const dbReady = () => !!process.env.DATABASE_URL;

const sql = () => {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL 환경변수가 없습니다.");
  return neon(url);
};

export type NewTicket = Pick<Ticket, "cohort" | "name" | "contact" | "content" | "question" | "category">;

export async function insertTicket(t: NewTicket): Promise<{ id: number; created_at: string }> {
  const rows = (await sql()`
    INSERT INTO tickets (cohort, name, contact, content, question, category)
    VALUES (${t.cohort}, ${t.name}, ${t.contact}, ${t.content}, ${t.question}, ${t.category})
    RETURNING id, created_at`) as { id: number | string; created_at: string }[];
  return { id: Number(rows[0].id), created_at: String(rows[0].created_at) };
}

export async function listTickets(status?: TicketStatus): Promise<Ticket[]> {
  const rows = status
    ? await sql()`SELECT * FROM tickets WHERE status = ${status} ORDER BY created_at DESC LIMIT 300`
    : await sql()`SELECT * FROM tickets ORDER BY created_at DESC LIMIT 300`;
  return (rows as Ticket[]).map((r) => ({ ...r, id: Number(r.id), created_at: String(r.created_at) }));
}

export async function setTicketStatus(id: number, status: TicketStatus): Promise<boolean> {
  const rows = await sql()`UPDATE tickets SET status = ${status} WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
