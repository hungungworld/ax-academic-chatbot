"use client";
// 모바일: 아래에서 올라오는 바텀시트 / 태블릿 이상: 가운데 모달 (DESIGN.md 5-9)
import { useEffect, useRef } from "react";
import { IconClose } from "./Icons";

type Props = { title: string; description?: React.ReactNode; onClose: () => void; children: React.ReactNode };

export function Sheet({ title, description, onClose, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useRef(`sheet-${Math.random().toString(36).slice(2, 8)}`).current;

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>("input, textarea, select, button:not([data-close])");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !ref.current) return;
      // 시트 안에서만 Tab 이동
      const items = ref.current.querySelectorAll<HTMLElement>("a, button, input, textarea, select");
      const list = Array.from(items).filter((el) => !el.hasAttribute("disabled"));
      if (!list.length) return;
      const [a, z] = [list[0], list[list.length - 1]];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus();
    };
  }, [onClose]);

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby={`${id}-t`} ref={ref}>
        <div className="sheet__handle" aria-hidden="true" />
        <div className="sheet__head">
          <div>
            <h2 id={`${id}-t`} className="t-h2 sheet__title">{title}</h2>
            {description && <p className="t-sub">{description}</p>}
          </div>
          <button type="button" className="btn btn--icon btn--glass btn--sm" aria-label="닫기" data-close onClick={onClose}>
            <IconClose />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
