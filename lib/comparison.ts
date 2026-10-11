import type { OutputVariable } from "./scenarios";

// Grafik perbandingan menggabungkan variabel dengan satuan dan besaran yang
// sangat berbeda (puluhan juta kunjungan vs ribuan hotel vs rasio < 1). Pada
// sumbu nilai asli variabel kecil menjadi garis datar di dasar grafik, jadi
// tersedia dua cara tampil:
// - "indeks": nilai dibagi nilai tahun dasar × 100 (bawaan, mudah dibaca awam);
// - "ln": logaritma natural nilai. Semua variabel (termasuk kumulatif) tampak,
//   dan kemiringan garis menunjukkan laju pertumbuhan relatif
//   (selisih ln 0,1 ≈ naik 10%; selisih ln 0,69 = dua kali lipat).

export type CompareMode = "indeks" | "ln";

/**
 * Variabel kumulatif dimulai dari jumlah satu tahun saja, sehingga indeksnya
 * melonjak puluhan kali lipat dan membuat garis lain tampak datar. Variabel
 * ini tidak digabung ke grafik perbandingan; grafik individualnya tetap ada.
 */
export const CUMULATIVE_IDS = new Set(["akumulasi_investasi", "akumulasi_konversi_lahan_pariwisata"]);

/** Selisih indeks maksimum (poin) agar dua garis dianggap berimpit. */
export const OVERLAP_TOLERANCE = 1;

export interface CompareInput {
  label: string;
  variable: OutputVariable;
  /** BAU/SUS/DP; kosong bila hanya satu hasil simulasi. */
  scenarioId?: string;
  values: number[];
}

export interface CompareLine extends CompareInput {
  /** Nilai yang digambar: indeks (tahun dasar = 100) atau ln(nilai); NaN = tidak dapat digambar. */
  plotted: number[];
}

export interface ComparisonResult {
  lines: CompareLine[];
  /** Variabel kumulatif yang tidak digabung ke grafik ini. */
  cumulative: string[];
  /** Indeks: variabel yang nilai tahun dasarnya 0. ln: garis yang memuat nilai ≤ 0. */
  zeroBase: string[];
  /** Pasangan variabel yang garisnya berimpit (tumbuh dengan laju sama). */
  overlaps: [string, string][];
}

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

const addOnce = (list: string[], label: string) => {
  if (!list.includes(label)) list.push(label);
};

export function buildComparison(inputs: CompareInput[], mode: CompareMode = "indeks"): ComparisonResult {
  const ref = referenceValues(inputs);
  const cumulative: string[] = [];
  const zeroBase: string[] = [];
  const lines: CompareLine[] = [];

  if (mode === "ln") {
    for (const s of inputs) {
      const plotted = s.values.map((v) => (v > 0 ? Math.log(v) : NaN));
      if (plotted.some(Number.isNaN)) addOnce(zeroBase, s.label);
      if (plotted.every(Number.isNaN)) continue;
      lines.push({ ...s, plotted });
    }
    return { lines, cumulative, zeroBase, overlaps: [] };
  }

  for (const s of inputs) {
    if (CUMULATIVE_IDS.has(s.variable.id)) {
      addOnce(cumulative, s.variable.label);
      continue;
    }
    const r = ref.get(s.variable.id) ?? NaN;
    if (!(r > 0)) {
      addOnce(zeroBase, s.variable.label);
      continue;
    }
    lines.push({ ...s, plotted: s.values.map((v) => (v / r) * 100) });
  }

  const overlaps: [string, string][] = [];
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const a = lines[i];
      const b = lines[j];
      if (a.variable.id === b.variable.id || a.scenarioId !== b.scenarioId) continue;
      const close = a.plotted.every((v, k) => Math.abs(v - b.plotted[k]) <= OVERLAP_TOLERANCE);
      const pair: [string, string] = [a.variable.label, b.variable.label];
      if (close && !overlaps.some(([x, y]) => x === pair[0] && y === pair[1])) overlaps.push(pair);
    }
  }

  return { lines, cumulative, zeroBase, overlaps };
}
