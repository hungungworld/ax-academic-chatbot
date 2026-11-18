// 접수 알림 메일 (Gmail SMTP + nodemailer). 운영담당자 Gmail 앱 비밀번호는 서버 환경변수에만 둔다.
import nodemailer from "nodemailer";
import type { NewTicket } from "./db";

export const mailReady = () => !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD && process.env.NOTIFY_TO);

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function sendTicketMail(t: NewTicket, id: number | null, adminUrl: string | null): Promise<void> {
  const user = process.env.GMAIL_USER!;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass: process.env.GMAIL_APP_PASSWORD! },
  });
  const rows: [string, string][] = [
    ["기수", t.cohort],
    ["이름", t.name],
    ["연락처", t.contact],
    ["문의 내용", t.content],
    ...(t.question ? ([["챗봇에 한 질문", t.question]] as [string, string][]) : []),
  ];
  const text = [
    "AX마스터 학사 챗봇에 담당자 접수가 들어왔어요.",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    adminUrl ? `접수 목록: ${adminUrl}` : "",
  ].join("\n");
  const html = `<div style="font-family:sans-serif;word-break:keep-all;line-height:1.6">
<p>AX마스터 학사 챗봇에 담당자 접수가 들어왔어요.</p>
<table style="border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><th style="text-align:left;padding:4px 12px 4px 0;vertical-align:top;white-space:nowrap">${esc(k)}</th><td style="padding:4px 0;white-space:pre-wrap">${esc(v)}</td></tr>`,
    )
    .join("")}</table>
${adminUrl ? `<p><a href="${esc(adminUrl)}">접수 목록 열기</a></p>` : ""}</div>`;

  await transporter.sendMail({
    from: `"AX마스터 학사 챗봇" <${user}>`,
    to: process.env.NOTIFY_TO,
    subject: `[학사 챗봇 접수${id ? ` #${id}` : ""}] ${t.cohort} ${t.name}`,
    text,
    html,
  });
}
