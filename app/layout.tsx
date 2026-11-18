import type { Metadata, Viewport } from "next";
import { Gowun_Batang, Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import "./design.css";
import "./app.css";

const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});
const gowun = Gowun_Batang({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-gowun", display: "swap" });
const instrument = Instrument_Serif({ weight: "400", subsets: ["latin"], variable: "--font-instrument", display: "swap" });

export const metadata: Metadata = {
  title: "AX마스터 학사 도우미",
  description: "제2기 KITA 무역 AX마스터 학사규정을 물어보면 근거 조항과 함께 답하고, 개인 사정은 담당자에게 접수해 드려요.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F7F2FB",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${gowun.variable} ${instrument.variable}`}>
      <body>{children}</body>
    </html>
  );
}
