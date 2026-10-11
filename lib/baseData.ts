// Seri data tahunan yang dibutuhkan untuk menghitung ulang parameter model saat
// data tahun baru dirilis. Nilai 2015–2025 disalin apa adanya dari
// research/[FIX] Master Data final.xlsx, sheet "Data Tahunan". Data ini adalah
// data penelitian (default) dan tidak pernah ditimpa oleh pembaruan pengguna.

export type SeriesKey =
  | "jumlah_wisatawan"
  | "jumlah_hotel"
  | "jumlah_odtw"
  | "tenaga_kerja"
  | "lahan_terbangun"
  | "pengeluaran_wisatawan"
  | "pdrb_pariwisata"
  | "investasi_pariwisata"
  | "wisatawan_menginap"
  | "total_malam_menginap"
  | "tpg"
  | "tpk"
  | "jumlah_kamar";

export interface SeriesMeta {
  key: SeriesKey;
  label: string;
  satuan: string;
  sumber: string;
  /** Boleh bernilai nol (misalnya investasi tahunan); selain itu wajib > 0. */
  bolehNol?: boolean;
}

export const SERIES: SeriesMeta[] = [
  { key: "jumlah_wisatawan", label: "Jumlah Wisatawan", satuan: "Kunjungan", sumber: "BPS: publikasi wisatawan nusantara dan mancanegara" },
  { key: "jumlah_hotel", label: "Jumlah Hotel dan Akomodasi Lainnya", satuan: "Unit Akomodasi", sumber: "BPS: Statistik Hotel dan Akomodasi Lainnya" },
  { key: "jumlah_odtw", label: "Jumlah Objek Daya Tarik Wisata", satuan: "Unit", sumber: "BPS: Statistik Objek Daya Tarik Wisata (2015–2017 dan 2025 estimasi cahaya malam VIIRS)" },
  { key: "tenaga_kerja", label: "Tenaga Kerja Pariwisata (KBLI I dan R,S,T,U)", satuan: "Jiwa", sumber: "BPS: Daerah Istimewa Yogyakarta Dalam Angka" },
  { key: "lahan_terbangun", label: "Lahan Terbangun", satuan: "Hektar", sumber: "Citra satelit Dynamic World, kelas built (2015 imputasi)" },
  { key: "pengeluaran_wisatawan", label: "Pengeluaran Wisatawan", satuan: "Miliar Rupiah", sumber: "Diolah dari publikasi wisatawan BPS" },
  { key: "pdrb_pariwisata", label: "PDRB ADHK Pariwisata (KBLI I dan R,S,T,U)", satuan: "Miliar Rupiah", sumber: "BPS Provinsi DIY: PDRB ADHK 2010 menurut lapangan usaha" },
  { key: "investasi_pariwisata", label: "Investasi Sektor Pariwisata", satuan: "Miliar Rupiah", sumber: "BKPM: realisasi investasi PMA dan PMDN", bolehNol: true },
  { key: "wisatawan_menginap", label: "Jumlah Wisatawan (Tamu) Menginap", satuan: "Orang", sumber: "BPS: Tingkat Penghunian Kamar Hotel" },
  { key: "total_malam_menginap", label: "Total Malam Menginap", satuan: "Malam", sumber: "BPS: Tingkat Penghunian Kamar Hotel" },
  { key: "tpg", label: "Tingkat Penghunian Ganda Kamar (TPG)", satuan: "Tamu per Kamar", sumber: "BPS: Tingkat Penghunian Kamar Hotel" },
  { key: "tpk", label: "Tingkat Penghunian Kamar (TPK)", satuan: "Persen", sumber: "BPS: Tingkat Penghunian Kamar Hotel" },
  { key: "jumlah_kamar", label: "Jumlah Kamar", satuan: "Kamar", sumber: "BPS: Statistik Hotel dan Akomodasi Lainnya" },
];

export type YearRow = { tahun: number } & Record<SeriesKey, number>;

const YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

const RAW: Record<SeriesKey, number[]> = {
  jumlah_wisatawan: [6413735, 6551294, 6644412, 7996959, 20520104, 19610135, 22849394.5, 25755726, 30542580, 38134536, 40695654],
  jumlah_hotel: [1165, 1170, 1179, 1617, 1817, 1848, 1696, 1818, 1820, 2000, 2291],
  jumlah_odtw: [165, 158, 171, 177, 189, 180, 170, 183, 201, 218, 201],
  tenaga_kerja: [254537, 263878, 273563, 354684, 334784, 313840, 310755, 395284, 359340, 350946, 364994],
  lahan_terbangun: [43037.00491, 44561.0784555117, 50223.957001398, 56624.3602289948, 63480.0442236269, 58962.0411105434, 59887.5260314565, 57709.075808398, 75624.403529316, 73511.574651116, 55029.5352961885],
  pengeluaran_wisatawan: [6566.052848, 7395.394403, 8270.498617, 10975.91911, 25567.65171, 24683.59769, 46504.79615, 51768.49335, 74244.10158, 103744.195, 110700.6783],
  pdrb_pariwisata: [10131.09, 10694.03, 11347.59, 12100.99, 13104.38, 10926.83, 12097.19, 13672.58, 14809.2, 15873.81, 16947.62],
  investasi_pariwisata: [53.0896, 373.8424, 165.3915, 568.3341, 741.4483, 489.6932, 848.8042, 463.5886, 1175.2552, 712.2835, 1325.950399],
  wisatawan_menginap: [4056916, 4407538, 6854907, 6525894, 9006150, 3210480, 4642840, 6364013, 7857534, 8154522, 8377109],
  total_malam_menginap: [5698325, 6097324, 10899900, 10293319, 13363923, 4753098, 7379577, 9267217, 11417702, 11503540, 11954114],
  tpg: [1.97, 2.11, 1.91, 1.93, 2.02, 2.05, 2.15, 2.08, 2.1, 2.06, 2.07],
  tpk: [34.89, 37.72, 45.08, 45.11, 45.34, 28.9, 27.48, 44.99, 44.77, 42.17, 38.07],
  jumlah_kamar: [22594, 23613, 26164, 32869, 35717, 36482, 34386, 36644, 36883, 52233, 49066],
};

/** Data penelitian 2015–2025 (default). Dibekukan agar tidak dapat diubah. */
export const RESEARCH_DATA: readonly YearRow[] = Object.freeze(
  YEARS.map((tahun, i) => {
    const row = { tahun } as YearRow;
    for (const s of SERIES) row[s.key] = RAW[s.key][i];
    return Object.freeze(row);
  })
);

export const RESEARCH_BASE_YEAR = 2025;
export const FIRST_YEAR = 2015;
export const FINAL_YEAR = 2050;
