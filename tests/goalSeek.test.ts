import { describe, expect, it } from "vitest";
import {
  ASSUMPTION_RANGE,
  LEVER_DIMS,
  assumptionDims,
  assumptionConstants,
  distanceFromBau,
  evaluateTarget,
  goalSeek,
  latinHypercube,
  modelEvaluator,
  mulberry32,
  validateTargets,
  valueForThreshold,
  type Outputs,
  type Target,
} from "@/lib/goalSeek";
import { runModel } from "@/lib/model";
import { scenarios } from "@/lib/scenarios";

const evaluate = modelEvaluator(LEVER_DIMS, null);
const at = (o: Outputs, id: keyof Omit<Outputs, "years">, year: number) => o[id][o.years.indexOf(year)];

function fakeOutputs(pdrb: number, kepadatan: number): Outputs {
  const years = [2025, 2030];
  const fill = (v: number) => [v, v];
  return {
    years,
    pdrb_sektor_pariwisata: [100, pdrb],
    jumlah_wisatawan: fill(1),
    tenaga_kerja_pariwisata: fill(1),
    jumlah_hotel_dan_akomodasi: fill(1),
    jumlah_odtw: fill(1),
    lahan_terbangun: fill(1),
    rasio_daya_dukung_lahan: fill(0.8),
    indeks_kepadatan: [1, kepadatan],
  };
}

describe("evaluateTarget", () => {
  const bau = fakeOutputs(200, 1.5);
  const t = (mode: Target["mode"], value: number, indicator: Target["indicator"] = "pdrb_sektor_pariwisata"): Target => ({
    indicator,
    year: 2030,
    mode,
    value,
  });

  it("naik minimal X% dibanding BAU", () => {
    expect(evaluateTarget(t("naik_min", 10), fakeOutputs(220, 1.5), bau).satisfied).toBe(true);
    const e = evaluateTarget(t("naik_min", 10), fakeOutputs(218, 1.5), bau);
    expect(e.satisfied).toBe(false);
    expect(e.pct).toBeCloseTo(9);
    expect(e.margin).toBeCloseTo(-1);
  });

  it("turun minimal dan naik paling banyak X%", () => {
    expect(evaluateTarget(t("turun_min", 5), fakeOutputs(190, 1.5), bau).satisfied).toBe(true);
    expect(evaluateTarget(t("turun_min", 5), fakeOutputs(195, 1.5), bau).satisfied).toBe(false);
    expect(evaluateTarget(t("naik_maks", 5), fakeOutputs(210, 1.5), bau).satisfied).toBe(true);
    expect(evaluateTarget(t("naik_maks", 5), fakeOutputs(212, 1.5), bau).satisfied).toBe(false);
  });

  it("nilai absolut minimal dan maksimal", () => {
    expect(evaluateTarget(t("abs_maks", 2, "indeks_kepadatan"), fakeOutputs(200, 2), bau).satisfied).toBe(true);
    expect(evaluateTarget(t("abs_maks", 2, "indeks_kepadatan"), fakeOutputs(200, 2.01), bau).satisfied).toBe(false);
    expect(evaluateTarget(t("abs_min", 250), fakeOutputs(250, 1.5), bau).satisfied).toBe(true);
  });

  it("menolak tahun yang tidak ada di hasil simulasi", () => {
    expect(() => evaluateTarget({ ...t("naik_min", 1), year: 2099 }, bau, bau)).toThrow();
  });
});

describe("validateTargets", () => {
  const ok: Target = { indicator: "pdrb_sektor_pariwisata", year: 2040, mode: "naik_min", value: 5 };
  it("menerima target yang valid", () => expect(validateTargets([ok], 2025)).toEqual([]));
  it("menolak masukan yang tidak valid", () => {
    expect(validateTargets([], 2025)).toHaveLength(1);
    expect(validateTargets([ok, ok, ok, ok], 2025).length).toBeGreaterThan(0);
    expect(validateTargets([{ ...ok, year: 2025 }], 2025)).toHaveLength(1);
    expect(validateTargets([{ ...ok, value: NaN }], 2025)).toHaveLength(1);
    expect(validateTargets([{ ...ok, value: -1 }], 2025)).toHaveLength(1);
    expect(validateTargets([{ ...ok, mode: "turun_min", value: 100 }], 2025)).toHaveLength(1);
    expect(validateTargets([{ ...ok, indicator: "rasio_daya_dukung_lahan", mode: "abs_min", value: 2 }], 2025)).toHaveLength(1);
  });
});

describe("valueForThreshold", () => {
  it("membulatkan ke arah yang tetap tercapai", () => {
    expect(valueForThreshold("naik_min", 2.4567)).toBe(2.45);
    expect(valueForThreshold("naik_maks", 5.0012)).toBe(5.01);
    expect(valueForThreshold("turun_min", -1.239)).toBe(1.23);
    expect(valueForThreshold("abs_maks", 2.36381)).toBe(2.364);
    expect(valueForThreshold("abs_min", 36287.8)).toBe(36287);
  });
  it("menolak saran yang tidak valid", () => {
    expect(valueForThreshold("turun_min", 0.5)).toBeNull();
    expect(valueForThreshold("naik_min", -1)).toBeNull();
  });
});

describe("latinHypercube", () => {
  it("mengisi setiap strata tepat satu kali per dimensi dan deterministik", () => {
    const dims = assumptionDims({ lama_menginap: 1, pengeluaran_per_kunjungan: 2, laju_odtw_non_investasi: 3 });
    const pts = latinHypercube(dims, 50, mulberry32(7));
    for (const d of dims) {
      const strata = pts.map((p) => Math.floor(((p[d.key] - d.min) / (d.max - d.min)) * 50)).sort((a, b) => a - b);
      expect(strata).toEqual(Array.from({ length: 50 }, (_, i) => i));
    }
    expect(latinHypercube(dims, 50, mulberry32(7))).toEqual(pts);
  });

  it("rentang asumsi ±10% dari nilai dasar", () => {
    const [d] = assumptionDims({ lama_menginap: 2, pengeluaran_per_kunjungan: 1, laju_odtw_non_investasi: 1 });
    expect(ASSUMPTION_RANGE).toBe(0.1);
    expect(d.min).toBeCloseTo(1.8);
    expect(d.max).toBeCloseTo(2.2);
  });
});

describe("goalSeek dengan model (uji balik)", () => {
  for (const id of ["SUS", "DP"] as const) {
    it(`menemukan kembali tuas skenario ${id}`, async () => {
      const p = scenarios[id].params;
      const out = await runModel(p);
      const bau = await runModel(scenarios.BAU.params);
      const year = 2040;
      const pdrbPct = (at(out, "pdrb_sektor_pariwisata", year) / at(bau, "pdrb_sektor_pariwisata", year) - 1) * 100;
      const targets: Target[] = [
        { indicator: "pdrb_sektor_pariwisata", year, mode: "naik_min", value: pdrbPct },
        { indicator: "rasio_daya_dukung_lahan", year, mode: "abs_min", value: at(out, "rasio_daya_dukung_lahan", year) },
      ];
      const r = await goalSeek(targets, LEVER_DIMS, evaluate);
      expect(r.status).toBe("tercapai");
      const rec = r.recommendation!;
      expect(rec.evals.every((e) => e.satisfied)).toBe(true);
      const recovered =
        Math.abs(rec.point.insentif_kebijakan - p.insentif_kebijakan) < 0.01 &&
        Math.abs(rec.point.kebijakan_konservasi_lahan - p.kebijakan_konservasi_lahan) < 0.01;
      // Bila bukan titik aslinya, harus kombinasi lain yang juga memenuhi target dan intervensinya tidak lebih besar.
      expect(recovered || rec.distance <= distanceFromBau(p, LEVER_DIMS) + 1e-9).toBe(true);
      expect(recovered).toBe(true);
    });
  }

  it("target mustahil: TIDAK TERCAPAI beserta nilai maksimum", async () => {
    const r = await goalSeek([{ indicator: "pdrb_sektor_pariwisata", year: 2035, mode: "naik_min", value: 500 }], LEVER_DIMS, evaluate);
    expect(r.status).toBe("tidak_tercapai");
    expect(r.recommendation).toBeNull();
    expect(r.unreachable).toEqual([0]);
    // Maksimum pada tuas tertinggi: sekitar +2,4% dibanding BAU di 2035.
    expect(r.best!.evals[0].pct).toBeGreaterThan(2.3);
    expect(r.best!.evals[0].pct).toBeLessThan(2.6);
    expect(r.best!.point.insentif_kebijakan).toBeCloseTo(0.5, 5);
    expect(r.earliestYear).toBeNull(); // +500% tidak tercapai sampai 2050
    // Saran "sesuaikan target" harus benar-benar tercapai bila dicoba.
    const saran = valueForThreshold("naik_min", r.best!.evals[0].metric)!;
    const ulang = await goalSeek([{ indicator: "pdrb_sektor_pariwisata", year: 2035, mode: "naik_min", value: saran }], LEVER_DIMS, evaluate);
    expect(ulang.status).toBe("tercapai");
  });

  it("menyarankan tahun paling awal bila target belum tercapai di tahunnya", async () => {
    const target: Target = { indicator: "pdrb_sektor_pariwisata", year: 2035, mode: "naik_min", value: 10 };
    const r = await goalSeek([target], LEVER_DIMS, evaluate);
    expect(r.status).toBe("tidak_tercapai");
    expect(r.earliestYear).toBeGreaterThan(2035);
    const ulang = await goalSeek([{ ...target, year: r.earliestYear! }], LEVER_DIMS, evaluate);
    expect(ulang.status).toBe("tercapai");
    const sebelum = await goalSeek([{ ...target, year: r.earliestYear! - 1 }], LEVER_DIMS, evaluate);
    expect(sebelum.status).toBe("tidak_tercapai");
  });

  it("titik yang memenuhi PDRB tetapi melanggar batas kepadatan tidak direkomendasikan", async () => {
    const bau = await runModel(scenarios.BAU.params);
    const kBau = at(bau, "indeks_kepadatan", 2045);
    const pdrb: Target = { indicator: "pdrb_sektor_pariwisata", year: 2045, mode: "naik_min", value: 5 };
    // Batas kepadatan hanya 3% di atas BAU, padahal PDRB +5% membuat kepadatan juga +5%.
    const ketat = await goalSeek([pdrb, { indicator: "indeks_kepadatan", year: 2045, mode: "abs_maks", value: kBau * 1.03 }], LEVER_DIMS, evaluate);
    expect(ketat.status).toBe("tidak_tercapai");
    expect(ketat.grid!.cells.some((c) => c.status === "utama")).toBe(true);
    expect(ketat.grid!.cells.some((c) => c.status === "semua")).toBe(false);
    expect(ketat.best!.evals[1].satisfied).toBe(true);
    expect(ketat.best!.evals[0].pct).toBeLessThan(5);
    // Saran: batas kepadatan dilonggarkan menjadi sekitar +5% agar PDRB +5% tercapai.
    expect(ketat.relaxations).toHaveLength(1);
    const saran = valueForThreshold("abs_maks", ketat.relaxations[0].threshold)!;
    expect(saran / kBau).toBeGreaterThan(1.049);
    expect(saran / kBau).toBeLessThan(1.052);
    const ulang = await goalSeek([pdrb, { indicator: "indeks_kepadatan", year: 2045, mode: "abs_maks", value: saran }], LEVER_DIMS, evaluate);
    expect(ulang.status).toBe("tercapai");

    const longgar = await goalSeek([pdrb, { indicator: "indeks_kepadatan", year: 2045, mode: "abs_maks", value: kBau * 1.06 }], LEVER_DIMS, evaluate);
    expect(longgar.status).toBe("tercapai");
    for (const c of [longgar.recommendation!, ...longgar.alternatives]) {
      expect(c.evals[1].actual).toBeLessThanOrEqual(kBau * 1.06 + 1e-9);
      expect(c.evals[0].pct).toBeGreaterThanOrEqual(5 - 1e-7);
    }
  });

  it("batasan yang tidak terpenuhi di titik mana pun dilaporkan", async () => {
    const r = await goalSeek(
      [
        { indicator: "pdrb_sektor_pariwisata", year: 2045, mode: "naik_min", value: 1 },
        { indicator: "indeks_kepadatan", year: 2045, mode: "abs_maks", value: 2 },
      ],
      LEVER_DIMS,
      evaluate
    );
    expect(r.status).toBe("tidak_tercapai");
    expect(r.unreachable).toEqual([1]);
    expect(r.constraintsMetSomewhere).toBe(false);
  });

  it("target yang sudah dipenuhi BAU merekomendasikan tanpa intervensi", async () => {
    const r = await goalSeek([{ indicator: "pdrb_sektor_pariwisata", year: 2040, mode: "naik_min", value: 0 }], LEVER_DIMS, evaluate);
    expect(r.recommendation!.distance).toBe(0);
  });

  it("asumsi tambahan memakai Latin Hypercube Sampling", async () => {
    const dims = [
      ...LEVER_DIMS,
      ...assumptionDims({ lama_menginap: 1.427, pengeluaran_per_kunjungan: 0.00272021, laju_odtw_non_investasi: 5.427 }),
    ];
    const target: Target = { indicator: "pdrb_sektor_pariwisata", year: 2035, mode: "naik_min", value: 5 };
    const r = await goalSeek([target], dims, modelEvaluator(dims, null), { samples: 600 });
    expect(r.method).toBe("lhs");
    expect(r.status).toBe("tercapai");
    // Dengan tuas saja PDRB 2035 hanya bisa naik ±2,4%, jadi pengeluaran per kunjungan harus lebih tinggi dari dasar.
    expect(r.recommendation!.point.pengeluaran_per_kunjungan).toBeGreaterThan(0.00272021);
    expect(r.recommendation!.evals[0].pct).toBeGreaterThanOrEqual(5 - 1e-7);
  });

  it("nilai asumsi yang dibawa ke Simulasi menghasilkan angka yang sama", async () => {
    const base = { lama_menginap: 1.427, pengeluaran_per_kunjungan: 0.00272021, laju_odtw_non_investasi: 5.427 };
    const dims = [...LEVER_DIMS, ...assumptionDims(base)];
    const target: Target = { indicator: "pdrb_sektor_pariwisata", year: 2035, mode: "naik_min", value: 5 };
    const r = await goalSeek([target], dims, modelEvaluator(dims, null), { samples: 600 });
    const rec = r.recommendation!;
    // Sama seperti tombol "Coba di halaman Simulasi": persen dibulatkan 2 desimal.
    const pct = Object.fromEntries(
      dims.filter((d) => d.kind === "asumsi").map((d) => [d.key, Math.round((rec.point[d.key] / d.base - 1) * 10000) / 100])
    );
    const sim = await runModel(
      { insentif_kebijakan: rec.point.insentif_kebijakan, kebijakan_konservasi_lahan: rec.point.kebijakan_konservasi_lahan },
      null,
      assumptionConstants(pct)
    );
    const bau = await runModel(scenarios.BAU.params);
    const simPct = (at(sim, "pdrb_sektor_pariwisata", 2035) / at(bau, "pdrb_sektor_pariwisata", 2035) - 1) * 100;
    expect(Math.abs(simPct - rec.evals[0].pct)).toBeLessThan(0.05);
  });
});
