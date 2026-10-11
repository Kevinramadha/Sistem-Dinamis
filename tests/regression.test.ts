import { describe, expect, it } from "vitest";
import { RESEARCH_DATA } from "../lib/baseData";
import { runModel, type SimulationData } from "../lib/model";
import { computeParameters, researchRows } from "../lib/parameterUpdate";
import { scenariosList } from "../lib/scenarios";

const TOL = 1e-6;

function maxRelDiff(a: SimulationData, b: SimulationData): number {
  let max = 0;
  for (const key of Object.keys(a) as (keyof SimulationData)[]) {
    const xs = a[key];
    const ys = b[key];
    expect(ys.length).toBe(xs.length);
    xs.forEach((x, i) => {
      const rel = Math.abs(x - ys[i]) / Math.max(Math.abs(x), 1e-12);
      if (rel > max) max = rel;
    });
  }
  return max;
}

describe("regression: data 2015–2025 apa adanya = model penelitian", () => {
  const computed = computeParameters(RESEARCH_DATA);

  for (const s of scenariosList) {
    it(`skenario ${s.label}: keluaran 2025–2050 identik (selisih relatif < ${TOL})`, async () => {
      const original = await runModel(s.params);
      const updated = await runModel(s.params, { baseYear: computed.baseYear, params: computed.values });
      expect(updated.years).toEqual(original.years);
      expect(original.years[0]).toBe(2025);
      expect(original.years[original.years.length - 1]).toBe(2050);
      expect(maxRelDiff(original, updated)).toBeLessThan(TOL);
    });
  }
});

describe("tahun dasar baru (dummy 2026)", () => {
  const rows = researchRows();
  rows.push({ ...rows[rows.length - 1], tahun: 2026, jumlah_wisatawan: 42_500_000, jumlah_hotel: 2350, tenaga_kerja: 372_000 });
  const computed = computeParameters(rows);

  it("simulasi berjalan 2026–2050 dan dimulai dari nilai stock 2026", async () => {
    const data = await runModel({ insentif_kebijakan: 0, kebijakan_konservasi_lahan: 0 }, { baseYear: computed.baseYear, params: computed.values });
    expect(data.years[0]).toBe(2026);
    expect(data.years[data.years.length - 1]).toBe(2050);
    expect(data.years.length).toBe(25);
    expect(data.jumlah_wisatawan[0]).toBe(computed.values.nilai_awal_wisatawan);
    expect(data.jumlah_hotel_dan_akomodasi[0]).toBe(2350);
    expect(data.tenaga_kerja_pariwisata[0]).toBe(372_000);
    // Daya tarik dinormalisasi terhadap tahun dasar baru sehingga ≈ 1 pada t0.
    expect(data.daya_tarik_wisata[0]).toBeCloseTo(1, 3);
    // Indeks kepadatan tetap relatif terhadap 2025 (= 1), bukan terhadap t0.
    expect(data.indeks_kepadatan[0]).toBeCloseTo(42_500_000 / 317036 / 128.363, 6);
    for (const k of Object.keys(data) as (keyof typeof data)[]) {
      expect(data[k].every((v) => Number.isFinite(v))).toBe(true);
    }
  });
});
