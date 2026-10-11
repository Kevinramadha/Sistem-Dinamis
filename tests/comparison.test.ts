import { describe, expect, it } from "vitest";
import { buildComparison, isNiceLogTick, type CompareInput } from "@/lib/comparison";
import { outputVariables } from "@/lib/scenarios";

const v = (id: string) => outputVariables.find((o) => o.id === id)!;

describe("buildComparison", () => {
  it("mengindeks setiap variabel terhadap tahun dasar = 100", () => {
    const r = buildComparison(
      [
        { label: "W", variable: v("jumlah_wisatawan"), values: [40e6, 60e6, 80e6] },
        { label: "H", variable: v("jumlah_hotel_dan_akomodasi"), values: [2000, 2500, 3000] },
      ],
      "indeks"
    );
    expect(r.lines[0].plotted).toEqual([100, 150, 200]);
    expect(r.lines[1].plotted).toEqual([100, 125, 150]);
    expect(r.suggestLog).toBe(false);
    expect(r.skipped).toEqual([]);
  });

  it("memakai nilai tahun dasar BAU sebagai patokan semua skenario", () => {
    const inv = v("akumulasi_investasi");
    const inputs: CompareInput[] = [
      { label: "SUS", variable: inv, scenarioId: "SUS", values: [110, 220] },
      { label: "BAU", variable: inv, scenarioId: "BAU", values: [100, 200] },
      { label: "DP", variable: inv, scenarioId: "DP", values: [150, 300] },
    ];
    const r = buildComparison(inputs, "indeks");
    expect(r.lines.map((l) => Math.round(l.plotted[0]))).toEqual([110, 100, 150]);
  });

  it("melewatkan variabel bernilai nol di tahun dasar dan menandai nilai nol", () => {
    const kon = v("akumulasi_konversi_lahan_pariwisata");
    const r = buildComparison([{ label: "K", variable: kon, values: [0, 0, 0] }], "indeks");
    expect(r.lines).toHaveLength(0);
    expect(r.skipped).toEqual([kon.label]);
    const asli = buildComparison([{ label: "K", variable: kon, values: [0, 0, 0] }], "asli");
    expect(asli.lines[0].plotted).toEqual([0, 0, 0]);
    expect(asli.hasNonPositive).toBe(true);
  });

  it("menyarankan sumbu log bila besaran garis berbeda jauh", () => {
    const r = buildComparison(
      [
        { label: "W", variable: v("jumlah_wisatawan"), values: [40e6, 96e6] },
        { label: "H", variable: v("jumlah_hotel_dan_akomodasi"), values: [2291, 5404] },
      ],
      "asli"
    );
    expect(r.suggestLog).toBe(true);
    // Setelah diindeks, laju keduanya sebanding sehingga sumbu biasa cukup.
    expect(buildComparison(r.lines, "indeks").suggestLog).toBe(false);
  });
});

describe("isNiceLogTick", () => {
  it("hanya kelipatan 1, 2, 5", () => {
    expect([1, 2, 5, 10, 20, 50, 100, 200, 500, 0.5].every(isNiceLogTick)).toBe(true);
    expect([3, 4, 30, 700, 0, -10].some(isNiceLogTick)).toBe(false);
  });
});
