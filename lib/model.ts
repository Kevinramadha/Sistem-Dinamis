import { createSynchronousModelRunner, createConstantDef } from "@sdeverywhere/runtime";
import { KEPADATAN_REFERENSI_2025, toModelConstants, type ParamValues } from "./parameterUpdate";

// Dua tuas kebijakan resmi (lihat lib/scenarios.ts untuk kriteria penetapannya).
// Parameter model lain (elastisitas, ambang TPK, laju demolisi, dsb.) adalah
// hasil kalibrasi final dan sengaja TIDAK diekspos sebagai input pengguna,
// karena skripsi memperlakukannya sebagai asumsi struktural yang diuji lewat
// analisis sensitivitas/kekokohan, bukan sebagai instrumen kebijakan.
export interface SimulationParams {
  insentif_kebijakan: number;
  kebijakan_konservasi_lahan: number;
}

export interface SimulationData {
  years: number[];
  jumlah_wisatawan: number[];
  jumlah_hotel_dan_akomodasi: number[];
  jumlah_odtw: number[];
  tenaga_kerja_pariwisata: number[];
  lahan_terbangun: number[];
  tpk: number[];
  rasio_daya_dukung_lahan: number[];
  pdrb_sektor_pariwisata: number[];
  daya_tarik_wisata: number[];
  indeks_kepadatan: number[];
  akumulasi_investasi: number[];
  akumulasi_konversi_lahan_pariwisata: number[];
  investasi_sektor_pariwisata: number[];
  total_malam_menginap: number[];
}

// Indeks Kepadatan yang ditampilkan selalu dinormalisasi terhadap kepadatan
// 2025 (= 1), meskipun Kepadatan Referensi di dalam model ikut diperbarui saat
// data tahun baru diterapkan. Dengan begitu ambang 2,0 bermakna sama.
const KEPADATAN_REFERENSI = KEPADATAN_REFERENSI_2025;

/** Data dasar hasil pembaruan pengguna. Tanpa ini model memakai data penelitian (2025). */
export interface BaseOverride {
  baseYear: number;
  params: ParamValues;
}

const PARAM_TO_VENSIM_NAME: Record<keyof SimulationParams, string> = {
  insentif_kebijakan: "Insentif Kebijakan",
  kebijakan_konservasi_lahan: "Kebijakan Konservasi Lahan",
};

// Canonical (SDEverywhere) variable IDs for the outputs we read back.
const OUTPUT_VAR_IDS = {
  jumlah_wisatawan: "_jumlah_wisatawan",
  jumlah_hotel_dan_akomodasi: "_jumlah_hotel_dan_akomodasi",
  jumlah_odtw: "_jumlah_objek_daya_tarik_wisata",
  tenaga_kerja_pariwisata: "_tenaga_kerja_pariwisata",
  lahan_terbangun: "_lahan_terbangun",
  tpk: "__tingkat_penghunian_kamar__tpk__",
  rasio_daya_dukung_lahan: "_rasio_daya_dukung_lahan",
  pdrb_sektor_pariwisata: "_pdrb_sektor_pariwisata",
  daya_tarik_wisata: "_daya_tarik_destinasi_wisata",
  kepadatan_wisatawan: "_kepadatan_wisatawan",
  investasi_sektor_pariwisata: "_investasi_sektor_pariwisata",
  total_malam_menginap: "_total_malam_menginap",
  laju_konversi_lahan_pariwisata: "_laju_konversi_lahan_pariwisata",
} as const;

function cumulativeSum(values: number[]): number[] {
  let running = 0;
  return values.map((v) => (running += v));
}

type Runner = ReturnType<typeof createSynchronousModelRunner>;
const runnerCache = new Map<number | "default", Runner>();

// Runtime SDEverywhere mengunci tahun awal saat runner dibuat, sehingga untuk
// tahun dasar lain dibuat runner baru dengan INITIAL TIME = tahun dasar.
// Persamaan model tidak berubah; satu-satunya pemakaian Time di model adalah
// Intensitas Tenaga Kerja, yang ikut digeser lewat Tahun Dasar Intensitas TK.
async function getRunner(baseYear?: number): Promise<Runner> {
  const key = baseYear ?? "default";
  let runner = runnerCache.get(key);
  if (!runner) {
    const loadModel = (await import("./model-final.js")).default;
    const generatedModel = await loadModel();
    const model = baseYear === undefined ? generatedModel : { ...generatedModel, getInitialTime: () => baseYear };
    runner = createSynchronousModelRunner({ ...model, kind: "js" as const });
    runnerCache.set(key, runner);
  }
  return runner;
}

// Fallback used only if the compiled model fails to load (e.g. build issue).
function generateFallbackData(params: SimulationParams): SimulationData {
  const years = Array.from({ length: 26 }, (_, i) => 2025 + i);

  const wisatawan_base = 4.06957e7;
  const hotel_base = 2291;
  const odtw_base = 201;
  const tk_base = 364994;
  const lahan_base = 55029.5;
  const luasLahanTersedia = 317036;

  // Parameter kalibrasi final (nilai tetap dari ".mdl"), bukan input pengguna.
  const elastisitasDayaTarikOdtw = 0.3;
  const lajuPembangunanOdtwNonInvestasi = 5.427;
  const lajuPenutupanDasarOdtw = 0.0499327;
  const lajuDemolisiDasar = 0.05;
  const lajuKeluarDasarTenagaKerja = 0.03;

  const data: SimulationData = {
    years,
    jumlah_wisatawan: [],
    jumlah_hotel_dan_akomodasi: [],
    jumlah_odtw: [],
    tenaga_kerja_pariwisata: [],
    lahan_terbangun: [],
    tpk: [],
    rasio_daya_dukung_lahan: [],
    pdrb_sektor_pariwisata: [],
    daya_tarik_wisata: [],
    indeks_kepadatan: [],
    akumulasi_investasi: [],
    akumulasi_konversi_lahan_pariwisata: [],
    investasi_sektor_pariwisata: [],
    total_malam_menginap: [],
  };

  let wisatawan = wisatawan_base;
  let hotel = hotel_base;
  let odtw = odtw_base;
  let tenagaKerja = tk_base;
  let lahan = lahan_base;
  const investasiFlow: number[] = [];
  const konversiLahanPariwisataFlow: number[] = [];

  for (let t = 0; t < years.length; t++) {
    const rasioDayaDukungLahan = Math.max(0, 1 - lahan / luasLahanTersedia);
    const dayaTarik =
      0.4 * Math.min(1.5, Math.pow(odtw / odtw_base, elastisitasDayaTarikOdtw)) +
      0.35 +
      0.25 * rasioDayaDukungLahan;

    data.years[t] = years[t];
    data.jumlah_wisatawan.push(Math.round(wisatawan));
    data.jumlah_hotel_dan_akomodasi.push(Math.round(hotel));
    data.jumlah_odtw.push(Math.round(odtw));
    data.tenaga_kerja_pariwisata.push(Math.round(tenagaKerja));
    data.lahan_terbangun.push(Math.round(lahan));
    data.tpk.push(Math.min(1, 0.3 + rasioDayaDukungLahan * 0.1));
    data.rasio_daya_dukung_lahan.push(rasioDayaDukungLahan);
    const pdrb = wisatawan * 0.00272021 * 0.153094 * (1 + params.insentif_kebijakan * 0.1);
    data.pdrb_sektor_pariwisata.push(pdrb);
    data.daya_tarik_wisata.push(dayaTarik);
    data.indeks_kepadatan.push(wisatawan / luasLahanTersedia / KEPADATAN_REFERENSI);
    data.total_malam_menginap.push(wisatawan * 0.2058 * 1.427);

    const investasi = pdrb * 0.0488174 * (1 + params.insentif_kebijakan);
    data.investasi_sektor_pariwisata.push(investasi);
    investasiFlow.push(investasi);

    const konversiPariwisata =
      hotel * 0.001 * 0.1 * (1 - params.kebijakan_konservasi_lahan) * rasioDayaDukungLahan;
    konversiLahanPariwisataFlow.push(konversiPariwisata);

    wisatawan *= 1 + 0.27726 * dayaTarik - 0.207945;
    odtw += lajuPembangunanOdtwNonInvestasi - odtw * lajuPenutupanDasarOdtw;
    hotel -= hotel * lajuDemolisiDasar;
    tenagaKerja -= tenagaKerja * lajuKeluarDasarTenagaKerja;
    lahan += lahan * 0.01 * (1 - params.kebijakan_konservasi_lahan * 0.3);
  }

  data.akumulasi_investasi = cumulativeSum(investasiFlow);
  data.akumulasi_konversi_lahan_pariwisata = cumulativeSum(konversiLahanPariwisataFlow);

  return data;
}

export async function runModel(params: SimulationParams, base?: BaseOverride | null): Promise<SimulationData> {
  try {
    const runner = await getRunner(base?.baseYear);
    const outputs = runner.createOutputs();

    const constants = [
      ...(base ? toModelConstants(base.params).map((c) => createConstantDef({ varName: c.varName }, c.value)) : []),
      ...(Object.keys(params) as (keyof SimulationParams)[]).map((key) =>
        createConstantDef({ varName: PARAM_TO_VENSIM_NAME[key] }, params[key])
      ),
    ];

    const result = await runner.runModel([], outputs, { constants });

    const years = result.varSeries[0]?.points.map((p) => Math.round(p.x)) ?? [];

    const seriesFor = (varId: string) =>
      result.getSeriesForVar(varId)?.points.map((p) => p.y) ?? [];

    const kepadatanWisatawan = seriesFor(OUTPUT_VAR_IDS.kepadatan_wisatawan);
    const investasiSektorPariwisata = seriesFor(OUTPUT_VAR_IDS.investasi_sektor_pariwisata);
    const lajuKonversiLahanPariwisata = seriesFor(OUTPUT_VAR_IDS.laju_konversi_lahan_pariwisata);

    return {
      years,
      jumlah_wisatawan: seriesFor(OUTPUT_VAR_IDS.jumlah_wisatawan),
      jumlah_hotel_dan_akomodasi: seriesFor(OUTPUT_VAR_IDS.jumlah_hotel_dan_akomodasi),
      jumlah_odtw: seriesFor(OUTPUT_VAR_IDS.jumlah_odtw),
      tenaga_kerja_pariwisata: seriesFor(OUTPUT_VAR_IDS.tenaga_kerja_pariwisata),
      lahan_terbangun: seriesFor(OUTPUT_VAR_IDS.lahan_terbangun),
      tpk: seriesFor(OUTPUT_VAR_IDS.tpk),
      rasio_daya_dukung_lahan: seriesFor(OUTPUT_VAR_IDS.rasio_daya_dukung_lahan),
      pdrb_sektor_pariwisata: seriesFor(OUTPUT_VAR_IDS.pdrb_sektor_pariwisata),
      daya_tarik_wisata: seriesFor(OUTPUT_VAR_IDS.daya_tarik_wisata),
      indeks_kepadatan: kepadatanWisatawan.map((v) => v / KEPADATAN_REFERENSI),
      akumulasi_investasi: cumulativeSum(investasiSektorPariwisata),
      akumulasi_konversi_lahan_pariwisata: cumulativeSum(lajuKonversiLahanPariwisata),
      investasi_sektor_pariwisata: investasiSektorPariwisata,
      total_malam_menginap: seriesFor(OUTPUT_VAR_IDS.total_malam_menginap),
    };
  } catch (error) {
    // Data cadangan hanya mewakili data penelitian; untuk data dasar pengguna
    // galat diteruskan agar tidak menampilkan hasil yang menyesatkan.
    if (base) throw error;
    console.error("Model execution error, using fallback data:", error);
    return generateFallbackData(params);
  }
}
