"use client";

import { useEffect } from "react";

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
  text: string;
}

export const toastOk = (text: string): ToastMessage => ({ tone: "success", text });
export const toastInfo = (text: string): ToastMessage => ({ tone: "info", text });
export const toastError = (text: string): ToastMessage => ({ tone: "error", text });

const TONE: Record<ToastTone, { bg: string; icon: string }> = {
  success: { bg: "#1f6f55", icon: "✓" },
  info: { bg: "#1D5A8C", icon: "i" },
  error: { bg: "#b42318", icon: "!" },
};

/**
 * Popup status di bagian bawah layar. Pesan berhasil dan info hilang sendiri
 * setelah beberapa detik; pesan galat tetap tampil sampai ditutup.
 */
export function Toast({ toast, onClose }: { toast: ToastMessage | null; onClose: () => void }) {
  useEffect(() => {
    if (!toast || toast.tone === "error") return;
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  const tone = toast ? TONE[toast.tone] : null;
  return (
    <div
      role={toast?.tone === "error" ? "alert" : "status"}
      aria-live={toast?.tone === "error" ? "assertive" : "polite"}
      className="fixed left-1/2 -translate-x-1/2 bottom-5 z-50 w-[calc(100%-32px)] max-w-md pointer-events-none"
    >
      {toast && tone && (
        <div
          key={toast.text}
          className="pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-lg"
          style={{ background: tone.bg, animation: "popup-in .2s ease-out" }}
        >
          <span
            aria-hidden="true"
            className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold"
          >
            {tone.icon}
          </span>
          <span className="flex-1 leading-snug">{toast.text}</span>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white text-xs font-semibold" aria-label="Tutup pesan">
            ✕
          </button>
        </div>
      )}
      <PopupKeyframes />
    </div>
  );
}

/**
 * Popup yang tetap tampil selama hasil di layar dibuat dengan pengaturan lama,
 * dengan tombol untuk langsung memperbaruinya.
 */
export function StalePopup({
  show,
  onRun,
  busy,
  what = "Pengaturan",
}: {
  show: boolean;
  onRun: () => void;
  busy: boolean;
  what?: string;
}) {
  return (
    <div role="status" aria-live="polite" className="fixed left-1/2 -translate-x-1/2 bottom-5 z-40 w-[calc(100%-32px)] max-w-lg pointer-events-none">
      {show && (
        <div
          className="pointer-events-auto flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-lg"
          style={{ animation: "popup-in .2s ease-out" }}
        >
          <span className="flex-1 leading-snug">
            <strong>{what} sudah berubah.</strong> Hasil yang tampil masih memakai pengaturan sebelumnya.
          </span>
          <button
            type="button"
            onClick={onRun}
            disabled={busy}
            className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {busy ? "Menjalankan…" : "Perbarui hasil"}
          </button>
        </div>
      )}
      <PopupKeyframes />
    </div>
  );
}

function PopupKeyframes() {
  return <style>{`@keyframes popup-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`}</style>;
}
