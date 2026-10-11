"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

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

/**
 * Pemberitahuan bahwa hasil di layar dibuat dengan pengaturan lama. Dipasang
 * hanya selama hasil tidak sesuai pengaturan (pemanggil memakai `stale && …`).
 * Popup tengah baru muncul setelah pengguna berhenti mengubah pengaturan,
 * agar tidak menghalangi saat menggeser slider. "Nanti saja" mengecilkannya
 * menjadi tombol kecil di pojok bawah.
 */
export function StalePopup({
  changeKey,
  onRun,
  busy,
  what = "Pengaturan",
  text = "Hasil yang tampil masih memakai pengaturan sebelumnya. Perbarui hasil agar sesuai dengan pengaturan baru.",
  primaryLabel = "Perbarui hasil",
  secondary,
}: {
  /** Berubah setiap kali pengaturan berubah; dipakai untuk menunda popup. */
  changeKey: string;
  onRun: () => void;
  busy: boolean;
  what?: string;
  text?: string;
  primaryLabel?: string;
  /** Pilihan kedua, mis. memperbarui hasil dengan kondisi dasar. */
  secondary?: { label: string; onClick: () => void };
}) {
  const mode = useDelayedOpen(changeKey);
  const [dismissed, setDismissed] = useState(false);
  const later = useCallback(() => setDismissed(true), []);

  if (mode && !dismissed)
    return (
      <CenterDialog role="dialog" color="#d97706" soft="#fef3c7" icon="↻" title={`${what} sudah berubah`} onDismiss={later}>
        <p className="text-sm text-gray-600 leading-relaxed mb-5">{text}</p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            data-primary
            onClick={onRun}
            disabled={busy}
            className="w-full rounded-xl bg-amber-600 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {busy ? "Menjalankan…" : primaryLabel}
          </button>
          {secondary && (
            <button
              type="button"
              onClick={secondary.onClick}
              disabled={busy}
              className="w-full rounded-xl border border-amber-600 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50"
            >
              {secondary.label}
            </button>
          )}
          <button type="button" onClick={later} className="w-full rounded-xl py-2 text-sm font-semibold text-gray-500 hover:bg-slate-50">
            Nanti saja
          </button>
        </div>
      </CenterDialog>
    );

  return (
    <div role="status" aria-live="polite" className="fixed right-4 bottom-4 z-40">
      {dismissed && (
        <button
          type="button"
          onClick={onRun}
          disabled={busy}
          className="flex items-center gap-2 rounded-full bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-amber-700 disabled:opacity-60"
        >
          <span aria-hidden="true">↻</span>
          {busy ? "Menjalankan…" : `${what} berubah · Perbarui hasil`}
        </button>
      )}
    </div>
  );
}

/** true setelah `changeKey` tidak berubah selama `ms` milidetik (pengguna berhenti mengubah pengaturan). */
function useDelayedOpen(changeKey: string, ms = 700): boolean {
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  useEffect(() => {
    const t = setTimeout(() => setOpenedFor(changeKey), ms);
    return () => clearTimeout(t);
  }, [changeKey, ms]);
  return openedFor !== null;
}

/**
 * Popup pilihan di tengah layar, mis. kondisi mana yang dipakai setelah tuas
 * diubah. Muncul setelah pengguna berhenti mengubah pengaturan. Menutup popup
 * (✕, Esc, klik di luar) sama dengan memilih opsi pertama.
 */
export function ChoiceDialog({
  changeKey,
  title,
  text,
  options,
}: {
  changeKey: string;
  title: string;
  text: string;
  options: { label: string; onSelect: () => void }[];
}) {
  const open = useDelayedOpen(changeKey);
  if (!open) return null;
  return (
    <CenterDialog role="dialog" color="#1D5A8C" soft="#e8f1fa" icon="?" title={title} onDismiss={options[0].onSelect}>
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
      </div>
    </CenterDialog>
  );
}
