// 디자인 시안(preview/index.html)의 아이콘을 그대로 옮겼다.
type P = { size?: number };
const svg = (size: number | undefined, children: React.ReactNode) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
    {children}
  </svg>
);
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const IconSend = ({ size }: P) => svg(size, <path fill="currentColor" d="M3.4 20.4 21 12 3.4 3.6l-.1 6.5L15 12 3.3 13.9z" />);
export const IconClose = ({ size }: P) => svg(size, <path {...stroke} d="M6 6l12 12M18 6 6 18" />);
export const IconCheck = ({ size }: P) => svg(size, <path {...stroke} strokeWidth={2.2} d="M5 12.5l4.5 4.5L19 7.5" />);
export const IconClock = ({ size }: P) =>
  svg(size, <><circle cx="12" cy="12" r="8.5" {...stroke} /><path {...stroke} d="M12 7.5V12l3 2" /></>);
export const IconWon = ({ size }: P) => svg(size, <path {...stroke} d="M4 6l3.5 12L12 8l4.5 10L20 6M3 11h18" />);
export const IconAward = ({ size }: P) =>
  svg(size, <><circle cx="12" cy="9" r="5.5" {...stroke} /><path {...stroke} d="M8.5 13.5 7 21l5-2.5 5 2.5-1.5-7.5" /></>);
export const IconUser = ({ size }: P) =>
  svg(size, <><circle cx="12" cy="8.5" r="4" {...stroke} /><path {...stroke} d="M4.5 20c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" /></>);
export const IconAlert = ({ size }: P) =>
  svg(size, <><circle cx="12" cy="12" r="8.5" {...stroke} /><path {...stroke} d="M12 7.5v5.5M12 16.4v.1" /></>);
export const IconPhone = ({ size }: P) =>
  svg(size, <path {...stroke} d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />);
export const IconRefresh = ({ size }: P) =>
  svg(size, <path {...stroke} d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6" />);
export const IconChart = ({ size }: P) => svg(size, <path {...stroke} d="M5 20V10M12 20V4M19 20v-7" />);
