import { runModel, type BaseOverride, type SimulationData } from "./model";

// Pencarian Target (goal seeking): membalik arah simulasi. Pengguna menentukan
// target indikator, lalu dicari kombinasi tuas kebijakan (dan, bila diizinkan,
// asumsi model) yang memenuhinya dengan intervensi sekecil mungkin dari BAU.
// Modul ini tidak mengubah persamaan maupun parameter model; ia hanya
// menjalankan model berulang kali dengan nilai input yang berbeda.

// ── Indikator dan target ────────────────────────────────────────────────────

export const INDICATORS = [
  { id: "pdrb_sektor_pariwisata", label: "PDRB Sektor Pariwisata", unit: "miliar Rp" },
  { id: "jumlah_wisatawan", label: "Jumlah Wisatawan", unit: "kunjungan" },
  { id: "tenaga_kerja_pariwisata", label: "Tenaga Kerja Pariwisata", unit: "jiwa" },
  { id: "jumlah_hotel_dan_akomodasi", label: "Jumlah Hotel dan Akomodasi", unit: "unit akomodasi" },
  { id: "jumlah_odtw", label: "Jumlah ODTW", unit: "unit" },
  { id: "lahan_terbangun", label: "Lahan Terbangun", unit: "hektar" },
  { id: "rasio_daya_dukung_lahan", label: "Rasio Daya Dukung Lahan", unit: "rasio (0–1)" },
  { id: "indeks_kepadatan", label: "Indeks Kepadatan Wisatawan", unit: "indeks (2025 = 1)" },
] as const;

export type IndicatorId = (typeof INDICATORS)[number]["id"];
export const indicatorOf = (id: IndicatorId) => INDICATORS.find((i) => i.id === id)!;

/** Indikator yang ditampilkan sebagai dampak pada tabel alternatif. */
export const IMPACT_IDS: IndicatorId[] = [
  "pdrb_sektor_pariwisata",
  "jumlah_wisatawan",
  "lahan_terbangun",
  "indeks_kepadatan",
  "tenaga_kerja_pariwisata",
];

/**
 * Jenis target. Tiga yang pertama relatif terhadap BAU pada tahun yang sama
 * (nilai dalam persen, ≥ 0); dua terakhir nilai absolut dalam satuan indikator.
 */
export type TargetMode = "naik_min" | "turun_min" | "naik_maks" | "abs_min" | "abs_maks";

export const TARGET_MODES: { id: TargetMode; label: string; relatif: boolean }[] = [
  { id: "naik_min", label: "Naik minimal … % dibanding BAU", relatif: true },
  { id: "turun_min", label: "Turun minimal … % dibanding BAU", relatif: true },
  { id: "naik_maks", label: "Naik paling banyak … % dibanding BAU", relatif: true },
  { id: "abs_min", label: "Nilai minimal …", relatif: false },
  { id: "abs_maks", label: "Nilai maksimal …", relatif: false },
];

export interface Target {
  indicator: IndicatorId;
  year: number;
  mode: TargetMode;
  value: number;
}

export type Outputs = Pick<SimulationData, "years" | IndicatorId>;

export interface TargetEval {
  /** Nilai indikator pada titik yang dievaluasi. */
  actual: number;
  /** Nilai indikator pada BAU, tahun yang sama. */
  bau: number;
  /** Perubahan terhadap BAU (%). */
  pct: number;
  /** Besaran yang dibandingkan dengan ambang: persen (relatif) atau nilai (absolut). */
  metric: number;
  threshold: number;
  op: ">=" | "<=";
  /** Positif/nol = terpenuhi; besarnya = kelonggaran terhadap ambang. */
  margin: number;
  satisfied: boolean;
}

const isRelative = (m: TargetMode) => m === "naik_min" || m === "turun_min" || m === "naik_maks";

/** Ambang dan arah perbandingan untuk suatu target. */
export function targetRule(t: Target): { op: ">=" | "<="; threshold: number } {
  switch (t.mode) {
    case "naik_min":
      return { op: ">=", threshold: t.value };
    case "turun_min":
      return { op: "<=", threshold: -t.value };
    case "naik_maks":
      return { op: "<=", threshold: t.value };
    case "abs_min":
      return { op: ">=", threshold: t.value };
    case "abs_maks":
      return { op: "<=", threshold: t.value };
  }
}

/** Toleransi numerik agar titik tepat di ambang (mis. uji balik) dihitung terpenuhi. */
const tolerance = (threshold: number) => 1e-9 * Math.max(1, Math.abs(threshold));

export function evaluateTarget(t: Target, run: Outputs, bau: Outputs): TargetEval {
  const idx = run.years.indexOf(t.year);
  if (idx === -1) throw new Error(`Tahun ${t.year} tidak ada dalam hasil simulasi.`);
  const actual = run[t.indicator][idx];
  const bauValue = bau[t.indicator][idx];
  const pct = (actual / bauValue - 1) * 100;
  const { op, threshold } = targetRule(t);
  const metric = isRelative(t.mode) ? pct : actual;
  const margin = op === ">=" ? metric - threshold : threshold - metric;
  return { actual, bau: bauValue, pct, metric, threshold, op, margin, satisfied: margin >= -tolerance(threshold) };
}

export function evaluateTargets(targets: Target[], run: Outputs, bau: Outputs): TargetEval[] {
  return targets.map((t) => evaluateTarget(t, run, bau));
}

/** Validasi masukan target; mengembalikan daftar pesan galat (kosong = valid). */
export function validateTargets(targets: Target[], baseYear: number, finalYear = 2050): string[] {
  const errors: string[] = [];
  if (targets.length === 0) errors.push("Tentukan minimal satu target.");
  if (targets.length > 3) errors.push("Maksimal tiga target (satu target utama dan dua batasan).");
  targets.forEach((t, i) => {
    const nama = i === 0 ? "Target utama" : `Batasan ${i}`;
    if (!Number.isFinite(t.value)) errors.push(`${nama}: nilai target belum diisi atau bukan angka.`);
    if (!Number.isInteger(t.year) || t.year <= baseYear || t.year > finalYear)
      errors.push(`${nama}: tahun target harus antara ${baseYear + 1} dan ${finalYear}.`);
    if (isRelative(t.mode) && t.value < 0) errors.push(`${nama}: persentase tidak boleh negatif.`);
    if (t.mode === "turun_min" && t.value >= 100) errors.push(`${nama}: penurunan harus kurang dari 100%.`);
    if (!isRelative(t.mode) && t.value < 0) errors.push(`${nama}: nilai absolut tidak boleh negatif.`);
    if (t.indicator === "rasio_daya_dukung_lahan" && !isRelative(t.mode) && t.value > 1)
      errors.push(`${nama}: Rasio Daya Dukung Lahan bernilai antara 0 dan 1.`);
  });
  return errors;
}

// ── Ruang pencarian ─────────────────────────────────────────────────────────

export interface Dim {
  key: string;
  label: string;
  min: number;
  max: number;
  /** Nilai pada kondisi BAU (titik acuan "tanpa intervensi"). */
  base: number;
  kind: "tuas" | "asumsi";
  /** Nama konstanta Vensim untuk dimensi asumsi. */
  vensim?: string;
}

export type Point = Record<string, number>;

/** Dua tuas kebijakan resmi, dengan rentang yang sama seperti slider di halaman Simulasi. */
export const LEVER_DIMS: Dim[] = [
  { key: "insentif_kebijakan", label: "Insentif Kebijakan", min: 0, max: 0.5, base: 0, kind: "tuas" },
  { key: "kebijakan_konservasi_lahan", label: "Kebijakan Konservasi Lahan", min: 0, max: 1, base: 0, kind: "tuas" },
];

/** Rentang asumsi tambahan: ±10% dari nilai dasar, sama dengan analisis sensitivitas skripsi. */
export const ASSUMPTION_RANGE = 0.1;

export const ASSUMPTIONS = [
  { key: "lama_menginap", vensim: '"Rata-rata Lama Menginap Tamu"', label: "Rata-rata Lama Menginap Tamu" },
  { key: "pengeluaran_per_kunjungan", vensim: "Pengeluaran per Kunjungan", label: "Pengeluaran per Kunjungan" },
  { key: "laju_odtw_non_investasi", vensim: "Laju Pembangunan ODTW Non Investasi", label: "Laju Pembangunan ODTW Non Investasi" },
] as const;

export type AssumptionKey = (typeof ASSUMPTIONS)[number]["key"];

export function assumptionDims(baseValues: Record<AssumptionKey, number>): Dim[] {
  return ASSUMPTIONS.map((a) => {
    const b = baseValues[a.key];
    return { key: a.key, label: a.label, vensim: a.vensim, kind: "asumsi", base: b, min: b * (1 - ASSUMPTION_RANGE), max: b * (1 + ASSUMPTION_RANGE) };
  });
}

export const basePoint = (dims: Dim[]): Point => Object.fromEntries(dims.map((d) => [d.key, d.base]));

/** Jarak ternormalisasi dari BAU: setiap dimensi dibagi lebar rentangnya. */
export function distanceFromBau(p: Point, dims: Dim[]): number {
  return Math.sqrt(dims.reduce((s, d) => s + ((p[d.key] - d.base) / (d.max - d.min)) ** 2, 0));
}

const normDist = (a: Point, b: Point, dims: Dim[]) =>
  Math.sqrt(dims.reduce((s, d) => s + ((a[d.key] - b[d.key]) / (d.max - d.min)) ** 2, 0));

// ── Mesin pencarian ─────────────────────────────────────────────────────────

export type Evaluate = (p: Point) => Promise<Outputs> | Outputs;

export interface Impact {
  indicator: IndicatorId;
  value: number;
  bau: number;
  pct: number;
}

export interface Candidate {
  point: Point;
  distance: number;
  evals: TargetEval[];
  feasible: boolean;
  /** Dampak pada indikator utama di tahun target utama. */
  impacts: Impact[];
}

export type CellStatus = "semua" | "utama" | "tidak";

export interface GridResult {
  xs: number[];
  ys: number[];
  /** Baris demi baris: indeks = j × xs.length + i. */
  cells: { status: CellStatus; primaryMetric: number }[];
}

export interface SearchResult {
  status: "tercapai" | "tidak_tercapai";
  method: "grid" | "lhs";
  runs: number;
  /** Rekomendasi: titik yang memenuhi semua target dengan jarak terkecil dari BAU. */
  recommendation: Candidate | null;
  alternatives: Candidate[];
  /** Bila tidak tercapai: titik dengan nilai target utama terbaik (mengutamakan yang memenuhi batasan). */
  best: Candidate | null;
  /** Indeks target yang tidak terpenuhi di titik mana pun yang diuji. */
  unreachable: number[];
  /** Bila tidak tercapai: apakah ada titik yang memenuhi semua batasan (target ke-2 dan ke-3). */
  constraintsMetSomewhere: boolean;
  grid?: GridResult;
}

export interface SearchOptions {
  gridSize?: number;
  bisectIterations?: number;
  /** Jumlah pasangan batas grid yang dipertajam dengan bisection. */
  bisectPairs?: number;
  samples?: number;
  seed?: number;
  maxAlternatives?: number;
  onProgress?: (done: number, total: number) => void;
}

const linspace = (a: number, b: number, n: number) => Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));

/** PRNG deterministik agar hasil LHS dapat diulang. */
export function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Latin Hypercube Sampling: setiap dimensi dibagi n strata dan tiap strata terisi tepat satu sampel. */
export function latinHypercube(dims: Dim[], n: number, rand: () => number): Point[] {
  const columns = dims.map((d) => {
    const perm = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    return perm.map((k) => d.min + ((k + rand()) / n) * (d.max - d.min));
  });
  return Array.from({ length: n }, (_, i) => Object.fromEntries(dims.map((d, k) => [d.key, columns[k][i]])));
}

/** Skor target utama: makin besar makin baik, apa pun arah targetnya. */
const primaryScore = (c: Candidate) => (c.evals[0].op === ">=" ? c.evals[0].metric : -c.evals[0].metric);
const constraintsOk = (c: Candidate) => c.evals.slice(1).every((e) => e.satisfied);

export async function goalSeek(
  targets: Target[],
  dims: Dim[],
  evaluate: Evaluate,
  options: SearchOptions = {}
): Promise<SearchResult> {
  const {
    gridSize = 41,
    bisectIterations = 12,
    bisectPairs = 24,
    samples = 2000,
    seed = 20250101,
    maxAlternatives = 4,
    onProgress,
  } = options;
  if (targets.length === 0) throw new Error("Tentukan minimal satu target.");

  const useGrid = dims.length === 2;
  const total = (useGrid ? gridSize * gridSize + bisectPairs * bisectIterations : samples) + 270;
  let runs = 0;
  const tick = () => {
    runs++;
    if (onProgress && (runs % 25 === 0 || runs === total)) onProgress(Math.min(runs, total), total);
  };

  const bau = await evaluate(basePoint(dims));
  tick();
  const all: Candidate[] = [];
  const evalPoint = async (p: Point): Promise<Candidate> => {
    const out = await evaluate(p);
    tick();
    const evals = evaluateTargets(targets, out, bau);
    const idx = out.years.indexOf(targets[0].year);
    const c: Candidate = {
      point: p,
      distance: distanceFromBau(p, dims),
      evals,
      feasible: evals.every((e) => e.satisfied),
      impacts: IMPACT_IDS.map((id) => ({
        indicator: id,
        value: out[id][idx],
        bau: bau[id][idx],
        pct: (out[id][idx] / bau[id][idx] - 1) * 100,
      })),
    };
    all.push(c);
    return c;
  };

  let grid: GridResult | undefined;

  if (useGrid) {
    // 1) Grid search pada ruang dua tuas.
    const [dx, dy] = dims;
    const xs = linspace(dx.min, dx.max, gridSize);
    const ys = linspace(dy.min, dy.max, gridSize);
    const gridCands: Candidate[] = [];
    for (const y of ys) for (const x of xs) gridCands.push(await evalPoint({ [dx.key]: x, [dy.key]: y }));
    grid = {
      xs,
      ys,
      cells: gridCands.map((c) => ({
        status: c.feasible ? "semua" : c.evals[0].satisfied ? "utama" : "tidak",
        primaryMetric: c.evals[0].metric,
      })),
    };

    // 2) Bisection pada pasangan titik bertetangga yang statusnya berbeda
    //    (layak vs tidak layak), dipilih yang paling dekat dengan BAU, untuk
    //    mempertajam batas nilai tuas minimum yang memenuhi semua target.
    const at = (i: number, j: number) => gridCands[j * gridSize + i];
    const pairs: [Candidate, Candidate][] = [];
    for (let j = 0; j < gridSize; j++)
      for (let i = 0; i < gridSize; i++) {
        const c = at(i, j);
        for (const n of [i + 1 < gridSize ? at(i + 1, j) : null, j + 1 < gridSize ? at(i, j + 1) : null]) {
          if (n && n.feasible !== c.feasible) pairs.push(c.feasible ? [n, c] : [c, n]);
        }
      }
    pairs.sort((a, b) => Math.min(a[0].distance, a[1].distance) - Math.min(b[0].distance, b[1].distance));
    for (const [bad, good] of pairs.slice(0, bisectPairs)) {
      let lo = bad.point;
      let hi = good.point;
      for (let k = 0; k < bisectIterations; k++) {
        const mid = Object.fromEntries(dims.map((d) => [d.key, (lo[d.key] + hi[d.key]) / 2]));
        const c = await evalPoint(mid);
        if (c.feasible) hi = mid;
        else lo = mid;
      }
    }
  } else {
    // 1) Latin Hypercube Sampling untuk ruang berdimensi lebih dari dua.
    for (const p of latinHypercube(dims, samples, mulberry32(seed))) await evalPoint(p);
  }

  // 3) Penyempurnaan lokal (pattern search): geser titik layak terbaik mendekati
  //    BAU selama semua target tetap terpenuhi.
  const feasibleNow = all.filter((c) => c.feasible).sort((a, b) => a.distance - b.distance);
  if (feasibleNow.length && feasibleNow[0].distance > 0) {
    let cur = feasibleNow[0];
    let step = 0.25;
    let budget = 120;
    while (step > 1e-3 && budget > 0) {
      let moved = false;
      for (const d of dims) {
        const toward = Math.sign(d.base - cur.point[d.key]);
        if (toward === 0) continue;
        const delta = toward * step * (d.max - d.min);
        let v = cur.point[d.key] + delta;
        if ((toward > 0 && v > d.base) || (toward < 0 && v < d.base)) v = d.base;
        const c = await evalPoint({ ...cur.point, [d.key]: v });
        budget--;
        if (c.feasible && c.distance < cur.distance) {
          cur = c;
          moved = true;
        }
      }
      if (!moved) step /= 2;
    }
  }

  const feasible = all.filter((c) => c.feasible).sort((a, b) => a.distance - b.distance);
  let recommendation: Candidate | null = feasible[0] ?? null;

  // Alternatif: titik layak lain yang cukup berbeda satu sama lain.
  const alternatives: Candidate[] = [];
  if (recommendation) {
    for (const c of feasible.slice(1)) {
      if (alternatives.length >= maxAlternatives) break;
      if ([recommendation, ...alternatives].every((p) => normDist(p.point, c.point, dims) >= 0.12)) alternatives.push(c);
    }
  }

  // Bila tidak tercapai: nilai terbaik target utama, mengutamakan titik yang memenuhi batasan.
  let best: Candidate | null = null;
  const constraintsMetSomewhere = all.some(constraintsOk);
  if (!recommendation) {
    const pool = constraintsMetSomewhere ? all.filter(constraintsOk) : all;
    best = pool.reduce((a, b) => (primaryScore(b) > primaryScore(a) ? b : a));
    // Pertajam nilai maksimum dengan hill climbing ke segala arah, tanpa
    // melanggar batasan bila titik awalnya memenuhi batasan.
    let step = 0.25;
    let budget = 150;
    while (step > 1e-3 && budget > 0) {
      let moved = false;
      for (const d of dims) {
        for (const dir of [1, -1]) {
          const v = Math.min(d.max, Math.max(d.min, best.point[d.key] + dir * step * (d.max - d.min)));
          if (v === best.point[d.key]) continue;
          const c = await evalPoint({ ...best.point, [d.key]: v });
          budget--;
          if (primaryScore(c) > primaryScore(best) && (!constraintsMetSomewhere || constraintsOk(c))) {
            best = c;
            moved = true;
          }
        }
      }
      if (!moved) step /= 2;
    }
    // Pendakian bisa saja menemukan titik yang ternyata memenuhi semua target.
    if (best.feasible) {
      recommendation = best;
      best = null;
    }
  }

  const unreachable = targets.map((_, k) => k).filter((k) => !all.some((c) => c.evals[k].satisfied));
  onProgress?.(total, total);

  return {
    status: recommendation ? "tercapai" : "tidak_tercapai",
    method: useGrid ? "grid" : "lhs",
    runs,
    recommendation,
    alternatives,
    best,
    unreachable,
    constraintsMetSomewhere,
    grid,
  };
}

// ── Penghubung ke model ─────────────────────────────────────────────────────

/** Evaluator yang menjalankan model SDEverywhere untuk suatu titik ruang pencarian. */
export function modelEvaluator(dims: Dim[], base: BaseOverride | null): Evaluate {
  const asumsi = dims.filter((d) => d.kind === "asumsi");
  return (p) =>
    runModel(
      { insentif_kebijakan: p.insentif_kebijakan ?? 0, kebijakan_konservasi_lahan: p.kebijakan_konservasi_lahan ?? 0 },
      base,
      asumsi.map((d) => ({ varName: d.vensim!, value: p[d.key] }))
    );
}
