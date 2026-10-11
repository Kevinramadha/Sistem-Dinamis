import type { OutputVariable } from "./scenarios";

// Grafik perbandingan menggabungkan variabel dengan satuan dan besaran yang
// sangat berbeda (puluhan juta kunjungan vs ribuan hotel vs rasio < 1).
// Pada sumbu biasa variabel kecil menjadi garis datar di dasar grafik, jadi
// grafik ini secara bawaan menampilkan indeks pertumbuhan (tahun dasar = 100)
// dan beralih ke sumbu logaritmik bila laju pertumbuhan antarvariabel masih
// terlalu jauh berbeda (mis. variabel kumulatif yang tumbuh puluhan kali lipat).

export type CompareMode = "indeks" | "asli";

export interface CompareInput {
  label: string;
  variable: OutputVariable;
  /** BAU/SUS/DP; kosong bila hanya satu hasil simulasi. */
  scenarioId?: string;
  values: number[];
}

export interface CompareLine extends CompareInput {
  /** Nilai yang digambar (indeks atau nilai asli). */
  plotted: number[];
}

export interface ComparisonResult {
  lines: CompareLine[];
  /** Variabel yang tidak dapat diindeks karena nilai tahun dasarnya 0. */
  skipped: string[];
  /** true bila garis-garisnya berbeda besaran sangat jauh sehingga sumbu log lebih terbaca. */
  suggestLog: boolean;
  /** true bila ada nilai ≤ 0, yang tidak dapat digambar pada sumbu log. */
  hasNonPositive: boolean;
}

/** Rasio puncak garis tertinggi terhadap puncak garis terendah yang masih nyaman dibaca pada sumbu biasa. */
export const LOG_THRESHOLD = 10;

/**
 * Nilai acuan indeks per variabel: nilai tahun dasar skenario BAU bila ada,
 * selain itu nilai tahun dasar garis pertama variabel tersebut. Satu acuan
 * dipakai untuk semua skenario agar selisih antarskenario tetap terlihat.
 */
function referenceValues(inputs: CompareInput[]): Map<string, number> {
  const ref = new Map<string, number>();
  for (const s of inputs) {
    if (!ref.has(s.variable.id) || s.scenarioId === "BAU") ref.set(s.variable.id, s.values[0]);
  }
  return ref;
}

export function buildComparison(inputs: CompareInput[], mode: CompareMode): ComparisonResult {
  const ref = referenceValues(inputs);
  const skipped: string[] = [];
  const lines: CompareLine[] = [];

  for (const s of inputs) {
    if (mode === "asli") {
      lines.push({ ...s, plotted: s.values });
      continue;
    }
    const r = ref.get(s.variable.id) ?? NaN;
    if (!(r > 0)) {
      if (!skipped.includes(s.variable.label)) skipped.push(s.variable.label);
      continue;
    }
    lines.push({ ...s, plotted: s.values.map((v) => (v / r) * 100) });
  }

  const peaks = lines
    .map((l) => Math.max(...l.plotted.map((v) => Math.abs(v)).filter(Number.isFinite)))
    .filter((p) => p > 0);
  const suggestLog = peaks.length > 1 && Math.max(...peaks) / Math.min(...peaks) > LOG_THRESHOLD;
  const hasNonPositive = lines.some((l) => l.plotted.some((v) => !(v > 0)));

  return { lines, skipped, suggestLog, hasNonPositive };
}

/** Pada sumbu log hanya kelipatan 1, 2, dan 5 yang diberi label agar tidak berdesakan. */
export function isNiceLogTick(v: number): boolean {
  if (!(v > 0)) return false;
  const m = v / 10 ** Math.floor(Math.log10(v) + 1e-9);
  return [1, 2, 5].some((n) => Math.abs(m - n) < 1e-6);
}
