"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { SimulationParams } from "@/lib/model";

const clamp = (v: number, max: number) => Math.min(max, Math.max(0, v));

/** Membaca ?insentif=…&konservasi=… (dari Pencarian Target); null bila tidak ada atau tidak valid. */
export function leversFromQuery(q: URLSearchParams): SimulationParams | null {
  const i = q.get("insentif");
  const k = q.get("konservasi");
  if (i === null || k === null) return null;
  const insentif = Number(i);
  const konservasi = Number(k);
  if (!Number.isFinite(insentif) || !Number.isFinite(konservasi)) return null;
  return { insentif_kebijakan: clamp(insentif, 0.5), kebijakan_konservasi_lahan: clamp(konservasi, 1) };
}

/**
 * Memuat nilai tuas yang dikirim halaman Pencarian Target lewat URL ke panel
 * Simulasi, lalu menampilkan pemberitahuan singkat. Dibungkus <Suspense> oleh
 * pemanggil karena memakai useSearchParams.
 */
export default function ApplyLeversFromUrl({ onApply }: { onApply: (p: SimulationParams) => void }) {
  const query = useSearchParams();
  const levers = leversFromQuery(new URLSearchParams(query.toString()));
  const key = levers ? `${levers.insentif_kebijakan}|${levers.kebijakan_konservasi_lahan}` : "";

  useEffect(() => {
    if (levers) onApply(levers);
    // Hanya dijalankan saat nilai di URL berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!levers) return null;
  const pct = (v: number) => `${(v * 100).toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`;
  return (
    <div role="status" className="mb-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
      Nilai tuas dari <strong>Pencarian Target</strong> sudah dimuat: Insentif Kebijakan {pct(levers.insentif_kebijakan)} dan
      Kebijakan Konservasi Lahan {pct(levers.kebijakan_konservasi_lahan)}. Klik <strong>Jalankan Simulasi</strong> untuk melihat
      hasilnya.
    </div>
  );
}
