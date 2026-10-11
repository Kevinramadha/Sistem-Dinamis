"use client";

import { useEffect, useId, useRef } from "react";

// Umpan balik status sistem (heuristik "visibility of system status"):
// proses yang sangat cepat tetap terlihat berjalan, setiap aksi penting
// diumumkan lewat popup singkat, dan hasil yang sudah tidak sesuai
// pengaturan ditandai dengan popup "Perbarui hasil".

/** Lama minimum indikator "Menjalankan…" tampil, agar proses yang sangat cepat tetap terlihat. */
export const MIN_RUN_MS = 600;

/** Menunggu `task` selesai, tetapi paling cepat `ms` milidetik. */
export async function withMinDuration<T>(task: Promise<T>, ms = MIN_RUN_MS): Promise<T> {
  const [result] = await Promise.all([task, new Promise((r) => setTimeout(r, ms))]);
  return result;
}

/** Menggulir ke elemen bila belum terlihat jelas di layar (mis. hasil di bawah panel pada ponsel). */
export function revealElement(el: HTMLElement | null) {
  if (!el) return;
  const top = el.getBoundingClientRect().top;
  if (top < 80 || top > window.innerHeight * 0.6) {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
}

export type ToastTone = "success" | "info" | "error";
export interface ToastMessage {
  tone: ToastTone;
  title: string;
  text: string;
}

const DEFAULT_TITLE: Record<ToastTone, string> = { success: "Berhasil", info: "Informasi", error: "Terjadi kesalahan" };

export const toastOk = (text: string, title = DEFAULT_TITLE.success): ToastMessage => ({ tone: "success", title, text });
export const toastInfo = (text: string, title = DEFAULT_TITLE.info): ToastMessage => ({ tone: "info", title, text });
export const toastError = (text: string, title = DEFAULT_TITLE.error): ToastMessage => ({ tone: "error", title, text });

const TONE: Record<ToastTone, { color: string; soft: string; icon: string; button: string }> = {
  success: { color: "#2f8f6b", soft: "#e8f6ef", icon: "✓", button: "Oke" },
  info: { color: "#1D5A8C", soft: "#e8f1fa", icon: "i", button: "Mengerti" },
  error: { color: "#c0392b", soft: "#fdecea", icon: "!", button: "Tutup" },
};

/** Kartu di tengah layar dengan latar gelap tipis; ditutup lewat tombol, klik di luar kartu, atau Esc. */
function CenterDialog({
  role,
  color,
  soft,
  icon,
  title,
  onDismiss,
  children,
}: {
  role: "dialog" | "alertdialog";
  color: string;
  soft: string;
  icon: string;
  title: string;
  onDismiss: () => void;
  children: React.ReactNode;
}) {
  const titleId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onDismiss();
    window.addEventListener("keydown", onKey);
    // Fokus ke tombol utama agar langsung bisa ditutup dengan Enter.
    cardRef.current?.querySelector<HTMLButtonElement>("button[data-primary]")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.35)", animation: "dialog-fade .15s ease-out" }}
      onClick={onDismiss}
    >
      <div
        ref={cardRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl bg-white px-6 pb-6 pt-12 text-center shadow-2xl"
        style={{ animation: "dialog-pop .2s ease-out" }}
      >
        <div
          aria-hidden="true"
          className="absolute left-1/2 -top-9 -translate-x-1/2 flex h-[72px] w-[72px] items-center justify-center rounded-full border-[6px] border-white text-3xl font-bold text-white shadow-md"
          style={{ background: color, boxShadow: `0 0 0 10px ${soft}` }}
        >
          {icon}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Tutup"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
        >
          ✕
        </button>
        <h2 id={titleId} className="font-bold text-lg text-gray-900 mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
          {title}
        </h2>
        {children}
      </div>
      <style>{`
        @keyframes dialog-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dialog-pop { from { opacity: 0; transform: translateY(10px) scale(.96); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}

/**
 * Popup status di tengah layar. Popup berhasil dan info tertutup sendiri
 * setelah beberapa detik; popup galat tetap tampil sampai ditutup.
 */
export function Toast({ toast, onClose }: { toast: ToastMessage | null; onClose: () => void }) {
  useEffect(() => {
    if (!toast || toast.tone === "error") return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const tone = TONE[toast.tone];
  return (
    <CenterDialog
      role={toast.tone === "error" ? "alertdialog" : "dialog"}
      color={tone.color}
      soft={tone.soft}
      icon={tone.icon}
      title={toast.title}
      onDismiss={onClose}
    >
      <p className="text-sm text-gray-600 leading-relaxed mb-5">{toast.text}</p>
      <button
        type="button"
        data-primary
        onClick={onClose}
        className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: tone.color }}
      >
        {tone.button}
      </button>
      {toast.tone !== "error" && (
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
          <div key={toast.title + toast.text} className="h-full" style={{ background: tone.color, animation: "dialog-timer 4s linear forwards" }} />
          <style>{`@keyframes dialog-timer { from { width: 100%; } to { width: 0%; } }`}</style>
        </div>
      )}
    </CenterDialog>
  );
}

/** Keterangan kecil di bawah tombol Jalankan Simulasi bila hasil di layar memakai pengaturan lama. */
export function StaleHint({ show }: { show: boolean }) {
  return (
    <p role="status" aria-live="polite" className="text-[11px] text-center leading-snug" style={{ color: "#b45309" }}>
      {show && "Pengaturan berubah. Klik Jalankan Simulasi untuk memperbarui hasil."}
    </p>
  );
}

/**
 * Popup pilihan di tengah layar, mis. kondisi mana yang dipakai sebelum
 * simulasi dijalankan. ✕, Esc, atau klik di luar kartu membatalkan.
 */
export function ChoiceDialog({
  title,
  text,
  options,
  onCancel,
}: {
  title: string;
  text: string;
  options: { label: string; onSelect: () => void }[];
  onCancel: () => void;
}) {
  return (
    <CenterDialog role="dialog" color="#1D5A8C" soft="#e8f1fa" icon="?" title={title} onDismiss={onCancel}>
      <p className="text-sm text-gray-600 leading-relaxed mb-5">{text}</p>
      <div className="flex flex-col gap-2">
        {options.map((o, i) => (
          <button
            key={o.label}
            type="button"
            data-primary={i === 0 ? true : undefined}
            onClick={o.onSelect}
            className={
              i === 0
                ? "w-full rounded-xl bg-[#1D5A8C] py-2.5 text-sm font-semibold text-white hover:bg-[#174a73]"
                : "w-full rounded-xl border border-[#1D5A8C] py-2.5 text-sm font-semibold text-[#1D5A8C] hover:bg-blue-50"
            }
          >
            {o.label}
          </button>
        ))}
        <button type="button" onClick={onCancel} className="w-full rounded-xl py-2 text-sm font-semibold text-gray-500 hover:bg-slate-50">
          Batal
        </button>
      </div>
    </CenterDialog>
  );
}
