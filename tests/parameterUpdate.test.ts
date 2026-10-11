import { describe, expect, it } from "vitest";
import { RESEARCH_DATA, SERIES, type YearRow } from "../lib/baseData";
import {
  PARAM_DEFS,
  computeParameters,
  intensitasTenagaKerjaAwal,
  kepadatanReferensi,
  lajuKenaikanProduktivitas,
  malamTersediaPerKamar,
  odtwReferensi,
  olsSlope,
  pengeluaranPerKunjungan,
  proporsiWisatawanMenginap,
  rasioDayaDukungLahanReferensi,
  rasioInvestasiTerhadapPdrb,
  rasioNilaiTambah,
  rataRataKamarPerUnit,
  rataRataLamaMenginap,
  researchRows,
  roundDecimals,
  roundSig,
  tingkatPenghunianGanda,
  validateRows,
} from "../lib/parameterUpdate";

/** Dua baris sintetis dengan angka bulat agar hasil rumus mudah diperiksa manual. */
const ROWS: YearRow[] = [
  {
    tahun: 2015, jumlah_wisatawan: 1000, jumlah_hotel: 10, jumlah_odtw: 5, tenaga_kerja: 200, lahan_terbangun: 1000,
    pengeluaran_wisatawan: 50, pdrb_pariwisata: 10, investasi_pariwisata: 1, wisatawan_menginap: 400,
    total_malam_menginap: 600, tpg: 2, tpk: 50, jumlah_kamar: 20,
  },
  {
    tahun: 2016, jumlah_wisatawan: 2000, jumlah_hotel: 20, jumlah_odtw: 8, tenaga_kerja: 300, lahan_terbangun: 31703.6,
    pengeluaran_wisatawan: 80, pdrb_pariwisata: 20, investasi_pariwisata: 4, wisatawan_menginap: 500,
    total_malam_menginap: 1000, tpg: 2.5, tpk: 40, jumlah_kamar: 50,
  },
];

describe("rumus kelompok B (data sintetis)", () => {
  it("Pengeluaran per Kunjungan = Pengeluaran(t0) / Wisatawan(t0)", () => {
    expect(pengeluaranPerKunjungan(ROWS)).toBeCloseTo(80 / 2000, 12);
  });
  it("Rasio Nilai Tambah = PDRB(t0) / Pengeluaran(t0)", () => {
    expect(rasioNilaiTambah(ROWS)).toBeCloseTo(20 / 80, 12);
  });
  it("Rasio Investasi = Σ Investasi / Σ PDRB (kumulatif, bukan tahunan)", () => {
    expect(rasioInvestasiTerhadapPdrb(ROWS)).toBeCloseTo((1 + 4) / (10 + 20), 12);
    expect(rasioInvestasiTerhadapPdrb(ROWS)).not.toBeCloseTo(4 / 20, 6);
  });
  it("Proporsi Wisatawan Menginap = Menginap(t0) / Wisatawan(t0)", () => {
    expect(proporsiWisatawanMenginap(ROWS)).toBeCloseTo(500 / 2000, 12);
  });
  it("Rata-rata Lama Menginap = Total Malam(t0) / Tamu Menginap(t0)", () => {
    expect(rataRataLamaMenginap(ROWS)).toBeCloseTo(1000 / 500, 12);
  });
  it("TPG = TPG(t0)", () => {
    expect(tingkatPenghunianGanda(ROWS)).toBe(2.5);
  });
  it("Rata-rata Kamar per Unit = Kamar(t0) / Unit(t0)", () => {
    expect(rataRataKamarPerUnit(ROWS)).toBeCloseTo(50 / 20, 12);
  });
  it("Malam Tersedia per Kamar = Σ(Malam/TPG) / Σ(TPK×Kamar), TPK dalam pecahan", () => {
    const expected = (600 / 2 + 1000 / 2.5) / (0.5 * 20 + 0.4 * 50);
    expect(malamTersediaPerKamar(ROWS)).toBeCloseTo(expected, 12);
  });
  it("Intensitas TK Awal = TK(t0) / PDRB(t0)", () => {
    expect(intensitasTenagaKerjaAwal(ROWS)).toBeCloseTo(300 / 20, 12);
  });
  it("Laju Kenaikan Produktivitas = −b dari regresi ln(TK/PDRB) terhadap tahun", () => {
    const b = Math.log(300 / 20) - Math.log(200 / 10); // dua titik: kemiringan = selisih
    expect(lajuKenaikanProduktivitas(ROWS)).toBeCloseTo(-b, 12);
  });
  it("olsSlope menghasilkan kemiringan garis lurus", () => {
    expect(olsSlope([1, 2, 3, 4], [3, 5, 7, 9])).toBeCloseTo(2, 12);
  });
  it("parameter normalisasi memakai nilai t0", () => {
    expect(odtwReferensi(ROWS)).toBe(8);
    expect(kepadatanReferensi(ROWS)).toBeCloseTo(2000 / 317036, 12);
    expect(rasioDayaDukungLahanReferensi(ROWS)).toBeCloseTo(1 - 31703.6 / 317036, 12);
  });
});

describe("pembulatan", () => {
  it("roundSig membulatkan ke 6 angka penting seperti Vensim", () => {
    expect(roundSig(40695654)).toBe(40695700);
    expect(roundSig(0.002720208853)).toBe(0.00272021);
    expect(roundSig(55029.5352961885)).toBe(55029.5);
  });
  it("roundDecimals membulatkan ke n desimal", () => {
    expect(roundDecimals(0.2058477547, 4)).toBe(0.2058);
    expect(roundDecimals(329.0255955, 2)).toBe(329.03);
  });
});

describe("data penelitian 2015–2025 menghasilkan parameter yang identik dengan .mdl", () => {
  const p = computeParameters(RESEARCH_DATA);
  it("tahun dasar = 2025", () => expect(p.baseYear).toBe(2025));
  for (const d of PARAM_DEFS) {
    it(`${d.label} = ${d.nilaiModel}`, () => {
      expect(p.values[d.key]).toBe(d.nilaiModel);
    });
  }
});

describe("validasi", () => {
  const withNew = (patch: Partial<YearRow> = {}): YearRow[] => {
    const rows = researchRows();
    const last = rows[rows.length - 1];
    rows.push({ ...last, tahun: 2026, ...patch });
    return rows;
  };

  it("data penelitian lolos tanpa galat dan tanpa peringatan", () => {
    const v = validateRows(researchRows());
    expect(v.errors).toEqual([]);
    expect(v.warnings).toEqual([]);
  });
  it("tahun 2026 yang wajar lolos", () => {
    expect(validateRows(withNew({ jumlah_wisatawan: 42_000_000 })).errors).toEqual([]);
  });
  it("kolom kosong ditolak", () => {
    const v = validateRows(withNew({ jumlah_kamar: NaN }));
    expect(v.errors.some((e) => e.pesan.includes("belum diisi"))).toBe(true);
  });
  it("angka nol/negatif ditolak", () => {
    expect(validateRows(withNew({ jumlah_hotel: 0 })).errors.length).toBeGreaterThan(0);
    expect(validateRows(withNew({ pdrb_pariwisata: -5 })).errors.length).toBeGreaterThan(0);
  });
  it("investasi nol diperbolehkan", () => {
    expect(validateRows(withNew({ investasi_pariwisata: 0 })).errors).toEqual([]);
  });
  it("tahun meloncat ditolak", () => {
    const rows = withNew();
    rows[rows.length - 1].tahun = 2027;
    expect(validateRows(rows).errors.some((e) => e.pesan.includes("terlewat"))).toBe(true);
  });
  it("tahun duplikat ditolak", () => {
    const rows = withNew();
    rows[rows.length - 1].tahun = 2025;
    expect(validateRows(rows).errors.some((e) => e.pesan.includes("lebih dari sekali"))).toBe(true);
  });
  it("data tidak dimulai dari 2015 ditolak", () => {
    expect(validateRows(researchRows().slice(1)).errors.some((e) => e.pesan.includes("2015"))).toBe(true);
  });
  it("TPK di atas 100 ditolak", () => {
    expect(validateRows(withNew({ tpk: 120 })).errors.some((e) => e.pesan.includes("TPK"))).toBe(true);
  });
  it("wisatawan menginap melebihi jumlah wisatawan ditolak (proporsi > 1)", () => {
    expect(validateRows(withNew({ wisatawan_menginap: 50_000_000 })).errors.length).toBeGreaterThan(0);
  });
  it("lahan terbangun melebihi luas wilayah ditolak", () => {
    expect(validateRows(withNew({ lahan_terbangun: 400_000 })).errors.length).toBeGreaterThan(0);
  });
  it("perubahan > 50% memunculkan peringatan, bukan galat", () => {
    const v = validateRows(withNew({ jumlah_wisatawan: 70_000_000 }));
    expect(v.errors).toEqual([]);
    expect(v.warnings.some((w) => w.kolom === SERIES[0].label)).toBe(true);
  });
  it("perubahan data 2015–2025 memunculkan peringatan", () => {
    const rows = researchRows();
    rows[3] = { ...rows[3], jumlah_hotel: 1700 };
    expect(validateRows(rows).warnings.some((w) => w.tahun === 2018)).toBe(true);
  });
});
