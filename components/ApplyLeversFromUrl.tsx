"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ASSUMPTIONS, ASSUMPTION_RANGE, type AssumptionKey } from "@/lib/goalSeek";
import type { SimulationParams } from "@/lib/model";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Nama parameter URL untuk perubahan asumsi (dalam persen terhadap nilai dasar). */
export const ASSUMPTION_QUERY: Record<AssumptionKey, string> = {
  lama_menginap: "a_lama",
  pengeluaran_per_kunjungan: "a_pengeluaran",
  laju_odtw_non_investasi: "a_odtw",
};

/** Perubahan asumsi dalam persen terhadap nilai dasar; kunci yang tidak ada = nilai dasar. */
export type AssumptionChanges = Partial<Record<AssumptionKey, number>>;

export interface AppliedFromUrl {
  levers: SimulationParams;
  assumptions: AssumptionChanges;
}

/** Membaca ?insentif=…&konservasi=…[&a_…=…] (dari Pencarian Target); null bila tidak ada atau tidak valid. */
export function leversFromQuery(q: URLSearchParams): AppliedFromUrl | null {
  const i = q.get("insentif");
  const k = q.get("konservasi");
  if (i === null || k === null) return null;
  const insentif = Number(i);
  const konservasi = Number(k);
  if (!Number.isFinite(insentif) || !Number.isFinite(konservasi)) return null;
  const limit = ASSUMPTION_RANGE * 100;
  const assumptions: AssumptionChanges = {};
  for (const a of ASSUMPTIONS) {
    const raw = q.get(ASSUMPTION_QUERY[a.key]);
    const pct = raw === null ? NaN : Number(raw);
    if (Number.isFinite(pct) && pct !== 0) assumptions[a.key] = clamp(pct, -limit, limit);
  }
  return {
    levers: { insentif_kebijakan: clamp(insentif, 0, 0.5), kebijakan_konservasi_lahan: clamp(konservasi, 0, 1) },
    assumptions,
  };
}

/**
 * Memuat nilai tuas (dan asumsi, bila ada) yang dikirim halaman Pencarian
 * Target lewat URL ke panel Simulasi, lalu menghapus parameter itu dari
 * alamat halaman agar tidak dimuat ulang. Pemberitahuan ditampilkan oleh
 * pemanggil (popup). Dibungkus <Suspense> karena memakai useSearchParams.
 */
export default function ApplyLeversFromUrl({ onApply }: { onApply: (applied: AppliedFromUrl) => void }) {
  const query = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryString = query.toString();

  useEffect(() => {
    const applied = leversFromQuery(new URLSearchParams(queryString));
    if (!applied) return;
    onApply(applied);
    router.replace(pathname, { scroll: false });
    // Hanya dijalankan saat isi URL berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  return null;
}
