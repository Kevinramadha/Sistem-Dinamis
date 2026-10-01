"use client";

import { useEffect, useId, useRef, useState } from "react";

const WIDTH = 260;
const MARGIN = 12;

// Ikon ⓘ kecil yang menampilkan penjelasan singkat saat diarahkan kursor,
// diketuk (layar sentuh), atau difokus lewat keyboard. Aman dipakai di dalam
// <label>: klik pada ikon tidak ikut mencentang checkbox.
export default function InfoTip({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  const place = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const width = Math.min(WIDTH, window.innerWidth - MARGIN * 2);
    const left = Math.min(Math.max(r.left + r.width / 2 - width / 2, MARGIN), window.innerWidth - width - MARGIN);
    setPos({ top: r.bottom + 6, left });
  };

  const show = () => {
    place();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e.type === "pointerdown" && btnRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={`Penjelasan: ${label}`}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Dengan mouse tooltip sudah terbuka lewat hover, jadi klik tidak menutupnya.
          if ((e.nativeEvent as PointerEvent).pointerType === "mouse") show();
          else if (open) setOpen(false);
          else show();
        }}
        // Hover hanya untuk mouse dan fokus hanya untuk keyboard; pada layar sentuh
        // tooltip dibuka/ditutup lewat ketukan (onClick) agar tidak langsung menutup.
        onPointerEnter={(e) => e.pointerType === "mouse" && show()}
        onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && show()}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center justify-center shrink-0 w-4 h-4 rounded-full text-[10px] font-bold leading-none align-middle transition-colors"
        style={{ color: "#1D5A8C", background: "#e6eef7" }}
      >
        i
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="fixed z-[60] rounded-lg px-3 py-2 text-xs font-normal leading-relaxed text-left normal-case tracking-normal"
          style={{
            top: pos.top,
            left: pos.left,
            width: Math.min(WIDTH, typeof window !== "undefined" ? window.innerWidth - MARGIN * 2 : WIDTH),
            background: "#1f2937",
            color: "#f9fafb",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            pointerEvents: "none",
          }}
        >
          {text}
        </span>
      )}
    </>
  );
}
