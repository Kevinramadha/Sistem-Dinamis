import { describe, expect, it } from "vitest";
import { buildComparison, type CompareInput } from "@/lib/comparison";
import { outputVariables } from "@/lib/scenarios";

const v = (id: string) => outputVariables.find((o) => o.id === id)!;

describe("buildComparison", () => {
  it("mengindeks setiap variabel terhadap tahun dasar = 100", () => {
    const r = buildComparison([
      { label: "W", variable: v("jumlah_wisatawan"), values: [40e6, 60e6, 80e6] },
      { label: "H", variable: v("jumlah_hotel_dan_akomodasi"), values: [2000, 2500, 3000] },
    ]);
    expect(r.lines[0].plotted).toEqual([100, 150, 200]);
    expect(r.lines[1].plotted).toEqual([100, 125, 150]);
    expect(r.overlaps).toEqual([]);
  });

  it("memakai nilai tahun dasar BAU sebagai patokan semua skenario", () => {
    const w = v("jumlah_wisatawan");
    const inputs: CompareInput[] = [
      { label: "SUS", variable: w, scenarioId: "SUS", values: [110, 220] },
      { label: "BAU", variable: w, scenarioId: "BAU", values: [100, 200] },
      { label: "DP", variable: w, scenarioId: "DP", values: [150, 300] },
    ];
    expect(buildComparison(inputs).lines.map((l) => Math.round(l.plotted[0]))).toEqual([110, 100, 150]);
  });

  it("tidak menggabungkan variabel kumulatif dan variabel bernilai nol di tahun dasar", () => {
    const r = buildComparison([
      { label: "I", variable: v("akumulasi_investasi"), values: [800, 37000] },
      { label: "T", variable: v("investasi_sektor_pariwisata"), values: [0, 10] },
      { label: "W", variable: v("jumlah_wisatawan"), values: [40e6, 96e6] },
    ]);
    expect(r.lines.map((l) => l.variable.id)).toEqual(["jumlah_wisatawan"]);
    expect(r.cumulative).toEqual([v("akumulasi_investasi").label]);
    expect(r.zeroBase).toEqual([v("investasi_sektor_pariwisata").label]);
  });

  it("menandai garis yang berimpit pada skenario yang sama", () => {
    const r = buildComparison([
      { label: "W", variable: v("jumlah_wisatawan"), scenarioId: "BAU", values: [40e6, 96e6] },
      { label: "P", variable: v("pdrb_sektor_pariwisata"), scenarioId: "BAU", values: [17000, 40800] },
      { label: "H", variable: v("jumlah_hotel_dan_akomodasi"), scenarioId: "BAU", values: [2291, 5404] },
    ]);
    expect(r.overlaps).toEqual([[v("jumlah_wisatawan").label, v("pdrb_sektor_pariwisata").label]]);
  });
});

describe("buildComparison mode ln", () => {
  it("menggambar ln(nilai) untuk semua variabel termasuk kumulatif", () => {
    const r = buildComparison(
      [
        { label: "I", variable: v("akumulasi_investasi"), values: [Math.E, Math.E ** 3] },
        { label: "W", variable: v("jumlah_wisatawan"), values: [1, Math.E] },
      ],
      "ln"
    );
    expect(r.lines.map((l) => l.plotted.map((x) => Math.round(x * 1e9) / 1e9))).toEqual([[1, 3], [0, 1]]);
    expect(r.cumulative).toEqual([]);
  });

  it("menandai garis bernilai nol dan melewatkan garis yang seluruhnya nol", () => {
    const kon = v("akumulasi_konversi_lahan_pariwisata");
    const r = buildComparison(
      [
        { label: "K (SUS)", variable: kon, values: [0, 0] },
        { label: "T", variable: v("investasi_sektor_pariwisata"), values: [0, 5] },
      ],
      "ln"
    );
    expect(r.lines.map((l) => l.label)).toEqual(["T"]);
    expect(r.lines[0].plotted[0]).toBeNaN();
    expect(r.zeroBase).toEqual(["K (SUS)", "T"]);
  });
});
