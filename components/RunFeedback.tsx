"use client";

import { useEffect } from "react";

// Umpan balik status sistem (heuristik "visibility of system status"):
// proses yang sangat cepat tetap terlihat berjalan, hasil yang selesai
// diumumkan, dan hasil lama ditandai bila pengaturannya sudah berubah.

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

/** Pesan singkat di bagian bawah layar setelah proses selesai; hilang sendiri setelah beberapa detik. */
export function DoneToast({ message, onClose }: { message: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [message, onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 -translate-x-1/2 bottom-5 z-50 w-[calc(100%-32px)] max-w-md pointer-events-none"
    >
      {message && (
        <div
          className="pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-lg"
          style={{ background: "#1f6f55", animation: "toast-in .2s ease-out" }}
        >
          <span aria-hidden="true" className="font-bold">✓</span>
          <span className="flex-1 leading-snug">{message}</span>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white text-xs font-semibold" aria-label="Tutup pesan">
            ✕
          </button>
        </div>
      )}
      <style>{`@keyframes toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}

/** Penanda bahwa hasil yang tampil dibuat dengan pengaturan lama. */
export function StaleNotice({ onRun, busy, what = "Pengaturan" }: { onRun: () => void; busy: boolean; what?: string }) {
  return (
    <div
      role="status"
      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      <span>
        <strong>{what} sudah berubah.</strong> Hasil di bawah masih memakai pengaturan sebelumnya.
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
  );
}

/** Kelas untuk area hasil: dipudarkan saat hasil sudah tidak sesuai pengaturan. */
export const resultsClass = (stale: boolean) =>
  `space-y-5 scroll-mt-28 transition-opacity duration-300 ${stale ? "opacity-50" : "opacity-100"}`;
