import { FINAL_YEAR, FIRST_YEAR, RESEARCH_BASE_YEAR, RESEARCH_DATA, SERIES, type SeriesKey, type YearRow } from "./baseData";

// Pembaruan data tahunan: menghitung ulang parameter model dari seri data
// 2015..t0. Rumus mengikuti definisi persamaan di research/[FINAL] MODEL SISTEM
// DINAMIS.mdl dan cara penurunan di Master Data (sheet "Data Tahunan").

/** Luas wilayah administratif DIY (parameter kelompok C, tetap). */
export const LUAS_LAHAN_TERSEDIA = 317036;

/** Kepadatan Referensi 2025: patokan tetap untuk menampilkan Indeks Kepadatan
 *  (2025 = 1) agar ambang 2,0 bermakna sama setelah data diperbarui. */
export const KEPADATAN_REFERENSI_2025 = 128.363;

// ── Pembulatan ──────────────────────────────────────────────────────────────
// Konstanta di .mdl ditulis dengan 6 angka penting (presisi Vensim), kecuali dua
// parameter yang dibulatkan peneliti: Proporsi Wisatawan Menginap (4 desimal)
// dan Malam Tersedia per Kamar (2 desimal). Aturan yang sama dipakai di sini
// agar data penelitian menghasilkan parameter yang identik dengan model.

export function roundSig(x: number, digits = 6): number {
  if (x === 0 || !isFinite(x)) return x;
  return Number(x.toPrecision(digits));
}

export function roundDecimals(x: number, decimals: number): number {
  return Number(x.toFixed(decimals));
}

type Precision = { sig: number } | { decimals: number } | "integer";

function applyPrecision(x: number, p: Precision): number {
  if (p === "integer") return Math.round(x);
  return "sig" in p ? roundSig(x, p.sig) : roundDecimals(x, p.decimals);
}

// ── Rumus kelompok B (dihitung ulang dari data) ─────────────────────────────

function last(rows: readonly YearRow[]): YearRow {
  return rows[rows.length - 1];
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** Pengeluaran Wisatawan(t0) / Jumlah Wisatawan(t0)  [miliar rupiah per kunjungan] */
export function pengeluaranPerKunjungan(rows: readonly YearRow[]): number {
  const r = last(rows);
  return r.pengeluaran_wisatawan / r.jumlah_wisatawan;
}

/** PDRB Pariwisata ADHK(t0) / Pengeluaran Wisatawan(t0) */
export function rasioNilaiTambah(rows: readonly YearRow[]): number {
  const r = last(rows);
  return r.pdrb_pariwisata / r.pengeluaran_wisatawan;
}

/** Σ Investasi(2015..t0) / Σ PDRB Pariwisata(2015..t0) (kumulatif) */
export function rasioInvestasiTerhadapPdrb(rows: readonly YearRow[]): number {
  return sum(rows.map((r) => r.investasi_pariwisata)) / sum(rows.map((r) => r.pdrb_pariwisata));
}

/** Wisatawan Menginap(t0) / Jumlah Wisatawan(t0) */
export function proporsiWisatawanMenginap(rows: readonly YearRow[]): number {
  const r = last(rows);
  return r.wisatawan_menginap / r.jumlah_wisatawan;
}

/** Total Malam Menginap(t0) / Jumlah Tamu Menginap(t0) */
export function rataRataLamaMenginap(rows: readonly YearRow[]): number {
  const r = last(rows);
  return r.total_malam_menginap / r.wisatawan_menginap;
}

/** TPG(t0) dari BPS */
export function tingkatPenghunianGanda(rows: readonly YearRow[]): number {
  return last(rows).tpg;
}

/** Jumlah Kamar(t0) / Jumlah Unit Akomodasi(t0) */
export function rataRataKamarPerUnit(rows: readonly YearRow[]): number {
  const r = last(rows);
  return r.jumlah_kamar / r.jumlah_hotel;
}

/** Σ_t (Total Malam_t / TPG_t) / Σ_t (TPK_t × Jumlah Kamar_t), t = 2015..t0; TPK dalam pecahan. */
export function malamTersediaPerKamar(rows: readonly YearRow[]): number {
  const kamarTerisi = sum(rows.map((r) => r.total_malam_menginap / r.tpg));
  const kamarTpk = sum(rows.map((r) => (r.tpk / 100) * r.jumlah_kamar));
  return kamarTerisi / kamarTpk;
}

/** Tenaga Kerja Pariwisata(t0) / PDRB Pariwisata(t0) */
export function intensitasTenagaKerjaAwal(rows: readonly YearRow[]): number {
  const r = last(rows);
  return r.tenaga_kerja / r.pdrb_pariwisata;
}

/** Kemiringan b regresi OLS y = a + b·x. */
export function olsSlope(xs: number[], ys: number[]): number {
  const n = xs.length;
  const mx = sum(xs) / n;
  const my = sum(ys) / n;
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
  }
  return sxy / sxx;
}

/** −b dari regresi ln(TK_t / PDRB_t) = a + b·t pada 2015..t0. Model memakai
 *  Intensitas TK = Awal · EXP(−Laju · (Time − Tahun Dasar)), sehingga laju = −b. */
export function lajuKenaikanProduktivitas(rows: readonly YearRow[]): number {
  const xs = rows.map((r) => r.tahun);
  const ys = rows.map((r) => Math.log(r.tenaga_kerja / r.pdrb_pariwisata));
  return -olsSlope(xs, ys);
}

export const odtwReferensi = (rows: readonly YearRow[]) => last(rows).jumlah_odtw;
export const kepadatanReferensi = (rows: readonly YearRow[]) => last(rows).jumlah_wisatawan / LUAS_LAHAN_TERSEDIA;
export const rasioDayaDukungLahanReferensi = (rows: readonly YearRow[]) => 1 - last(rows).lahan_terbangun / LUAS_LAHAN_TERSEDIA;

// ── Definisi parameter yang diperbarui (kelompok A dan B) ───────────────────

export type ParamKey =
  | "nilai_awal_wisatawan"
  | "nilai_awal_hotel"
  | "nilai_awal_odtw"
  | "nilai_awal_tenaga_kerja"
  | "nilai_awal_lahan"
  | "pengeluaran_per_kunjungan"
  | "rasio_nilai_tambah"
  | "rasio_investasi"
  | "proporsi_menginap"
  | "lama_menginap"
  | "tpg"
  | "kamar_per_unit"
  | "malam_tersedia"
  | "intensitas_tk_awal"
  | "laju_produktivitas"
  | "odtw_referensi"
  | "kepadatan_referensi"
  | "rddl_referensi"
  | "tahun_dasar_tk";

export interface ParamDef {
  key: ParamKey;
  /** Nama variabel di model Vensim (dipakai untuk setConstant); nama bertanda kutip ditulis lengkap dengan kutipnya. */
  vensim: string;
  label: string;
  satuan: string;
  kelompok: "A" | "B";
  rumus: string;
  precision: Precision;
  /** Nilai di .mdl (data penelitian, tahun dasar 2025). */
  nilaiModel: number;
  hitung: (rows: readonly YearRow[]) => number;
}

export const PARAM_DEFS: ParamDef[] = [
  { key: "nilai_awal_wisatawan", vensim: "Nilai Awal Jumlah Wisatawan", label: "Nilai awal Jumlah Wisatawan", satuan: "Kunjungan", kelompok: "A", rumus: "Jumlah Wisatawan(t0)", precision: { sig: 6 }, nilaiModel: 4.06957e7, hitung: (r) => last(r).jumlah_wisatawan },
  { key: "nilai_awal_hotel", vensim: "Nilai Awal Jumlah Hotel dan Akomodasi", label: "Nilai awal Jumlah Hotel dan Akomodasi", satuan: "Unit Akomodasi", kelompok: "A", rumus: "Jumlah Hotel dan Akomodasi(t0)", precision: { sig: 6 }, nilaiModel: 2291, hitung: (r) => last(r).jumlah_hotel },
  { key: "nilai_awal_odtw", vensim: "Nilai Awal Jumlah Objek Daya Tarik Wisata", label: "Nilai awal Jumlah ODTW", satuan: "Unit", kelompok: "A", rumus: "Jumlah ODTW(t0)", precision: { sig: 6 }, nilaiModel: 201, hitung: (r) => last(r).jumlah_odtw },
  { key: "nilai_awal_tenaga_kerja", vensim: "Nilai Awal Tenaga Kerja Pariwisata", label: "Nilai awal Tenaga Kerja Pariwisata", satuan: "Jiwa", kelompok: "A", rumus: "Tenaga Kerja Pariwisata(t0)", precision: { sig: 6 }, nilaiModel: 364994, hitung: (r) => last(r).tenaga_kerja },
  { key: "nilai_awal_lahan", vensim: "Nilai Awal Lahan Terbangun", label: "Nilai awal Lahan Terbangun", satuan: "Hektar", kelompok: "A", rumus: "Lahan Terbangun(t0)", precision: { sig: 6 }, nilaiModel: 55029.5, hitung: (r) => last(r).lahan_terbangun },

  { key: "pengeluaran_per_kunjungan", vensim: "Pengeluaran per Kunjungan", label: "Pengeluaran per Kunjungan", satuan: "Miliar Rupiah/Kunjungan", kelompok: "B", rumus: "Pengeluaran Wisatawan(t0) ÷ Jumlah Wisatawan(t0)", precision: { sig: 6 }, nilaiModel: 0.00272021, hitung: pengeluaranPerKunjungan },
  { key: "rasio_nilai_tambah", vensim: "Rasio Nilai Tambah Pariwisata", label: "Rasio Nilai Tambah Pariwisata", satuan: "Dmnl", kelompok: "B", rumus: "PDRB Pariwisata ADHK(t0) ÷ Pengeluaran Wisatawan(t0)", precision: { sig: 6 }, nilaiModel: 0.153094, hitung: rasioNilaiTambah },
  { key: "rasio_investasi", vensim: "Rasio Investasi terhadap PDRB", label: "Rasio Investasi terhadap PDRB", satuan: "Dmnl", kelompok: "B", rumus: "Σ Investasi(2015..t0) ÷ Σ PDRB Pariwisata(2015..t0)", precision: { sig: 6 }, nilaiModel: 0.0488174, hitung: rasioInvestasiTerhadapPdrb },
  { key: "proporsi_menginap", vensim: "Proporsi Wisatawan Menginap", label: "Proporsi Wisatawan Menginap", satuan: "Dmnl", kelompok: "B", rumus: "Wisatawan Menginap(t0) ÷ Jumlah Wisatawan(t0)", precision: { decimals: 4 }, nilaiModel: 0.2058, hitung: proporsiWisatawanMenginap },
  { key: "lama_menginap", vensim: '"Rata-rata Lama Menginap Tamu"', label: "Rata-rata Lama Menginap Tamu", satuan: "Malam/Kunjungan", kelompok: "B", rumus: "Total Malam Menginap(t0) ÷ Jumlah Tamu Menginap(t0)", precision: { sig: 6 }, nilaiModel: 1.427, hitung: rataRataLamaMenginap },
  { key: "tpg", vensim: "Tingkat Penghunian Ganda Kamar", label: "Tingkat Penghunian Ganda Kamar (TPG)", satuan: "Dmnl", kelompok: "B", rumus: "TPG(t0) dari BPS", precision: { sig: 6 }, nilaiModel: 2.07, hitung: tingkatPenghunianGanda },
  { key: "kamar_per_unit", vensim: '"Rata-rata Kamar per Unit Akomodasi"', label: "Rata-rata Kamar per Unit Akomodasi", satuan: "Kamar/Unit Akomodasi", kelompok: "B", rumus: "Jumlah Kamar(t0) ÷ Jumlah Unit Akomodasi(t0)", precision: { sig: 6 }, nilaiModel: 21.4168, hitung: rataRataKamarPerUnit },
  { key: "malam_tersedia", vensim: "Malam Tersedia per Kamar", label: "Malam Tersedia per Kamar", satuan: "Malam/Kamar", kelompok: "B", rumus: "Σ(Total Malam ÷ TPG) ÷ Σ(TPK × Jumlah Kamar), 2015..t0", precision: { decimals: 2 }, nilaiModel: 329.03, hitung: malamTersediaPerKamar },
  { key: "intensitas_tk_awal", vensim: "Intensitas Tenaga Kerja Awal", label: "Intensitas Tenaga Kerja Awal", satuan: "Jiwa/Miliar Rupiah", kelompok: "B", rumus: "Tenaga Kerja Pariwisata(t0) ÷ PDRB Pariwisata(t0)", precision: { sig: 6 }, nilaiModel: 21.5366, hitung: intensitasTenagaKerjaAwal },
  { key: "laju_produktivitas", vensim: "Laju Kenaikan Produktivitas", label: "Laju Kenaikan Produktivitas", satuan: "1/Tahun", kelompok: "B", rumus: "−b dari regresi ln(TK_t ÷ PDRB_t) = a + b·t, 2015..t0", precision: { sig: 6 }, nilaiModel: 0.0110205, hitung: lajuKenaikanProduktivitas },
  { key: "odtw_referensi", vensim: "ODTW Referensi", label: "ODTW Referensi", satuan: "Unit", kelompok: "B", rumus: "Jumlah ODTW(t0)", precision: { sig: 6 }, nilaiModel: 201, hitung: odtwReferensi },
  { key: "kepadatan_referensi", vensim: "Kepadatan Referensi", label: "Kepadatan Referensi", satuan: "Kunjungan/Hektar", kelompok: "B", rumus: "Jumlah Wisatawan(t0) ÷ Luas Lahan Tersedia", precision: { sig: 6 }, nilaiModel: 128.363, hitung: kepadatanReferensi },
  { key: "rddl_referensi", vensim: "Rasio Daya Dukung Lahan Referensi", label: "Rasio Daya Dukung Lahan Referensi", satuan: "Dmnl", kelompok: "B", rumus: "1 − Lahan Terbangun(t0) ÷ Luas Lahan Tersedia", precision: { sig: 6 }, nilaiModel: 0.826425, hitung: rasioDayaDukungLahanReferensi },
  { key: "tahun_dasar_tk", vensim: "Tahun Dasar Intensitas Tenaga Kerja", label: "Tahun Dasar Intensitas Tenaga Kerja", satuan: "Tahun", kelompok: "B", rumus: "t0", precision: "integer", nilaiModel: 2025, hitung: (r) => last(r).tahun },
];

export type ParamValues = Record<ParamKey, number>;

/** Nilai parameter di .mdl (data penelitian). */
export const RESEARCH_PARAMS: ParamValues = Object.freeze(
  Object.fromEntries(PARAM_DEFS.map((d) => [d.key, d.nilaiModel]))
) as ParamValues;

export interface ComputedParameters {
  baseYear: number;
  /** Nilai setelah pembulatan; inilah yang dikirim ke model. */
  values: ParamValues;
  /** Nilai presisi penuh sebelum pembulatan, untuk transparansi. */
  raw: ParamValues;
}

/** Menghitung ulang parameter kelompok A dan B dari seri 2015..t0. Baris diasumsikan sudah tervalidasi dan terurut. */
export function computeParameters(rows: readonly YearRow[]): ComputedParameters {
  const values = {} as ParamValues;
  const raw = {} as ParamValues;
  for (const d of PARAM_DEFS) {
    raw[d.key] = d.hitung(rows);
    values[d.key] = applyPrecision(raw[d.key], d.precision);
  }
  return { baseYear: last(rows).tahun, values, raw };
}

// ── Parameter kelompok C (tetap, hanya ditampilkan) ─────────────────────────

export interface FixedParam {
  /** Nama variabel di model (dipakai di skripsi). */
  nama: string;
  /** Nama dalam bahasa sehari-hari. */
  label: string;
  nilai: number;
  satuan: string;
  /** Nilai siap tampil untuk pengguna awam. */
  tampil: string;
  keterangan: string;
}

export const FIXED_PARAMS: { kategori: string; penjelasan: string; items: FixedParam[] }[] = [
  {
    kategori: "Luas wilayah",
    penjelasan: "Batas lahan yang bisa dibangun.",
    items: [
      { nama: "Luas Lahan Tersedia", label: "Luas wilayah DIY", nilai: LUAS_LAHAN_TERSEDIA, satuan: "Hektar", tampil: "317.036 ha", keterangan: "Luas wilayah administratif DIY, dipakai sebagai batas maksimum lahan yang bisa terbangun." },
    ],
  },
  {
    kategori: "Kecepatan perubahan",
    penjelasan: "Dihitung dari data 2015–2025.",
    items: [
      { nama: "Laju Pertumbuhan Eksternal", label: "Laju datangnya wisatawan baru", nilai: 0.27726, satuan: "1/Tahun", tampil: "27,7% per tahun", keterangan: "Seberapa cepat kunjungan baru bertambah setiap tahun, sebelum dipengaruhi daya tarik destinasi." },
      { nama: "Laju Penurunan Dasar", label: "Laju berkurangnya kunjungan", nilai: 0.207945, satuan: "1/Tahun", tampil: "20,8% per tahun", keterangan: "Bagian kunjungan yang berkurang secara alami setiap tahun." },
      { nama: "Sensitivitas Konstruksi terhadap TPK", label: "Respons pembangunan hotel", nilai: 2.31385, satuan: "Unit/(Miliar Rp·Tahun)", tampil: "2,31 unit per miliar Rp", keterangan: "Jumlah hotel baru yang dibangun per miliar rupiah investasi per tahun ketika kamar hotel ramai terisi." },
      { nama: "TPK Ambang", label: "Batas hunian kamar untuk membangun hotel", nilai: 0.275, satuan: "Dmnl", tampil: "27,5%", keterangan: "Hotel baru hanya dibangun bila tingkat hunian kamar di atas angka ini." },
      { nama: "Sensitivitas ODTW terhadap Investasi", label: "Respons pembangunan objek wisata", nilai: 0.01052, satuan: "Unit/(Miliar Rp·Tahun)", tampil: "0,0105 unit per miliar Rp", keterangan: "Jumlah objek wisata baru per miliar rupiah investasi per tahun (sekitar 1 objek per 95 miliar rupiah)." },
      { nama: "Laju Pembangunan ODTW Non Investasi", label: "Objek wisata baru dari pemerintah dan masyarakat", nilai: 5.427, satuan: "Unit/Tahun", tampil: "5,4 unit per tahun", keterangan: "Objek wisata baru di luar investasi tercatat, misalnya dibangun pemerintah, desa, atau kelompok masyarakat." },
      { nama: "Laju Penutupan Dasar ODTW", label: "Laju tutupnya objek wisata", nilai: 0.0499327, satuan: "1/Tahun", tampil: "5,0% per tahun", keterangan: "Bagian objek wisata yang berhenti beroperasi setiap tahun." },
      { nama: "Laju Konversi Dasar", label: "Laju pembangunan lahan di luar pariwisata", nilai: 0.0436052, satuan: "1/Tahun", tampil: "4,4% per tahun", keterangan: "Seberapa cepat lahan terbangun bertambah untuk permukiman dan kegiatan selain pariwisata." },
    ],
  },
  {
    kategori: "Aturan umum",
    penjelasan: "Diambil dari peraturan dan acuan umum.",
    items: [
      { nama: "Laju Demolisi Dasar", label: "Laju tutupnya hotel dan akomodasi", nilai: 0.05, satuan: "1/Tahun", tampil: "5% per tahun", keterangan: "Bagian hotel dan akomodasi yang tutup atau dibongkar setiap tahun." },
      { nama: "Laju Keluar Dasar Tenaga Kerja", label: "Laju keluarnya tenaga kerja", nilai: 0.03, satuan: "1/Tahun", tampil: "3% per tahun", keterangan: "Bagian pekerja pariwisata yang berhenti setiap tahun, misalnya pensiun atau pindah sektor." },
    ],
  },
  {
    kategori: "Perkiraan peneliti",
    penjelasan: "Ditentukan peneliti, lalu diuji pengaruhnya terhadap hasil.",
    items: [
      { nama: "Bobot ODTW", label: "Peran objek wisata dalam daya tarik", nilai: 0.4, satuan: "Dmnl", tampil: "40%", keterangan: "Porsi jumlah objek wisata dalam menentukan daya tarik destinasi." },
      { nama: "Bobot Kepadatan", label: "Peran kepadatan dalam daya tarik", nilai: 0.35, satuan: "Dmnl", tampil: "35%", keterangan: "Porsi tingkat kepadatan wisatawan dalam menentukan daya tarik destinasi." },
      { nama: "Bobot Daya Dukung Lahan", label: "Peran ketersediaan lahan dalam daya tarik", nilai: 0.25, satuan: "Dmnl", tampil: "25%", keterangan: "Porsi lahan yang belum terbangun dalam menentukan daya tarik destinasi. Ketiga porsi berjumlah 100%." },
      { nama: "Elastisitas Daya Tarik ODTW", label: "Tingkat kejenuhan objek wisata", nilai: 0.3, satuan: "Dmnl", tampil: "0,3", keterangan: "Makin banyak objek wisata, tambahan daya tariknya makin kecil. Nilai di bawah 1 berarti ada efek jenuh." },
      { nama: "Batas Maksimum Efek ODTW", label: "Batas pengaruh objek wisata", nilai: 1.5, satuan: "Dmnl", tampil: "1,5 kali", keterangan: "Pengaruh jumlah objek wisata terhadap daya tarik paling besar 1,5 kali kondisi tahun dasar." },
      { nama: "Lahan per Hotel dan Akomodasi", label: "Lahan untuk satu hotel baru", nilai: 0.1, satuan: "Hektar/Unit", tampil: "0,1 ha", keterangan: "Rata-rata luas lahan yang dipakai satu hotel atau akomodasi baru." },
      { nama: "Lahan per ODTW", label: "Lahan untuk satu objek wisata baru", nilai: 0.5, satuan: "Hektar/Unit", tampil: "0,5 ha", keterangan: "Rata-rata luas lahan yang dipakai satu objek wisata baru." },
      { nama: "Waktu Penyesuaian Tenaga Kerja", label: "Waktu mengisi kebutuhan pekerja", nilai: 1, satuan: "Tahun", tampil: "1 tahun", keterangan: "Waktu yang dibutuhkan sektor pariwisata untuk memenuhi kebutuhan tenaga kerja." },
    ],
  },
];

// ── Validasi ────────────────────────────────────────────────────────────────

export interface Issue {
  tahun?: number;
  kolom?: string;
  pesan: string;
}

export interface ValidationResult {
  errors: Issue[];
  warnings: Issue[];
}

export const EXTREME_CHANGE = 0.5; // perubahan > 50% dari tahun sebelumnya

const labelOf = (k: SeriesKey) => SERIES.find((s) => s.key === k)?.label ?? k;

/**
 * Memeriksa seri tahunan sebelum parameter dihitung.
 * Galat (errors) menghentikan proses; peringatan (warnings) hanya diinformasikan.
 */
export function validateRows(rows: readonly YearRow[]): ValidationResult {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];

  if (rows.length === 0) {
    errors.push({ pesan: "Data kosong. Template harus berisi baris tahun 2015 sampai tahun dasar baru." });
    return { errors, warnings };
  }

  // Tahun: bilangan bulat, urut, tanpa loncatan/duplikat.
  rows.forEach((r, i) => {
    if (!Number.isInteger(r.tahun)) errors.push({ pesan: `Baris ${i + 1}: kolom Tahun harus bilangan bulat.` });
  });
  if (errors.length) return { errors, warnings };

  if (rows[0].tahun !== FIRST_YEAR) {
    errors.push({ tahun: rows[0].tahun, pesan: `Data harus dimulai dari tahun ${FIRST_YEAR} (beberapa parameter dihitung kumulatif sejak ${FIRST_YEAR}).` });
  }
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1].tahun;
    const cur = rows[i].tahun;
    if (cur === prev) errors.push({ tahun: cur, pesan: `Tahun ${cur} muncul lebih dari sekali.` });
    else if (cur < prev) errors.push({ tahun: cur, pesan: `Tahun tidak berurutan: ${cur} muncul setelah ${prev}.` });
    else if (cur !== prev + 1) errors.push({ tahun: cur, pesan: `Ada tahun yang terlewat antara ${prev} dan ${cur}.` });
  }
  const t0 = rows[rows.length - 1].tahun;
  if (t0 < RESEARCH_BASE_YEAR) {
    errors.push({ tahun: t0, pesan: `Tahun dasar terakhir (${t0}) tidak boleh lebih awal dari ${RESEARCH_BASE_YEAR}.` });
  }
  if (t0 >= FINAL_YEAR) {
    errors.push({ tahun: t0, pesan: `Tahun dasar harus sebelum ${FINAL_YEAR} agar masih ada periode simulasi.` });
  }

  // Nilai: wajib terisi, angka, positif.
  for (const r of rows) {
    for (const s of SERIES) {
      const v = r[s.key];
      if (v === undefined || v === null || (typeof v === "number" && isNaN(v))) {
        errors.push({ tahun: r.tahun, kolom: s.label, pesan: `${s.label} tahun ${r.tahun} belum diisi.` });
      } else if (typeof v !== "number" || !isFinite(v)) {
        errors.push({ tahun: r.tahun, kolom: s.label, pesan: `${s.label} tahun ${r.tahun} bukan angka yang valid.` });
      } else if (s.bolehNol ? v < 0 : v <= 0) {
        errors.push({ tahun: r.tahun, kolom: s.label, pesan: `${s.label} tahun ${r.tahun} harus ${s.bolehNol ? "nol atau positif" : "positif"}.` });
      }
    }
  }
  if (errors.length) return { errors, warnings };

  // Rentang wajar. TPK dan TPG dipakai pada penjumlahan 2015..t0, jadi diperiksa di semua tahun.
  for (const r of rows) {
    if (r.tpk > 100) errors.push({ tahun: r.tahun, kolom: labelOf("tpk"), pesan: `TPK tahun ${r.tahun} harus di antara 0 dan 100 (persen).` });
    if (r.tpg < 1 || r.tpg > 4) errors.push({ tahun: r.tahun, kolom: labelOf("tpg"), pesan: `TPG tahun ${r.tahun} harus di antara 1 dan 4 tamu per kamar.` });
  }

  // Konsistensi antarkolom untuk tahun baru dan tahun dasar (nilai t0 dipakai
  // langsung sebagai parameter). Seri 2015–2018 sebelum faktor sambung memang
  // memuat proporsi menginap > 1, sehingga tidak diperiksa di sini.
  for (const r of rows) {
    if (r.tahun <= RESEARCH_BASE_YEAR && r.tahun !== t0) continue;
    if (r.wisatawan_menginap > r.jumlah_wisatawan) {
      errors.push({ tahun: r.tahun, kolom: labelOf("wisatawan_menginap"), pesan: `Wisatawan menginap tahun ${r.tahun} melebihi jumlah wisatawan (proporsi harus 0–1).` });
    }
    if (r.total_malam_menginap < r.wisatawan_menginap) {
      errors.push({ tahun: r.tahun, kolom: labelOf("total_malam_menginap"), pesan: `Total malam menginap tahun ${r.tahun} lebih kecil dari jumlah tamu menginap (rata-rata lama menginap < 1 malam).` });
    }
    if (r.jumlah_kamar < r.jumlah_hotel) {
      errors.push({ tahun: r.tahun, kolom: labelOf("jumlah_kamar"), pesan: `Jumlah kamar tahun ${r.tahun} lebih kecil dari jumlah unit akomodasi.` });
    }
    if (r.lahan_terbangun >= LUAS_LAHAN_TERSEDIA) {
      errors.push({ tahun: r.tahun, kolom: labelOf("lahan_terbangun"), pesan: `Lahan terbangun tahun ${r.tahun} tidak boleh melebihi luas wilayah DIY (${LUAS_LAHAN_TERSEDIA.toLocaleString("id-ID")} ha).` });
    }
    const lama = r.total_malam_menginap / r.wisatawan_menginap;
    if (lama > 7) warnings.push({ tahun: r.tahun, kolom: labelOf("total_malam_menginap"), pesan: `Rata-rata lama menginap tahun ${r.tahun} sebesar ${lama.toFixed(2)} malam, jauh di atas kisaran historis (±1,4 malam).` });
  }

  // Data 2015–2025 yang berbeda dari data penelitian.
  for (const r of rows) {
    const ref = RESEARCH_DATA.find((x) => x.tahun === r.tahun);
    if (!ref) continue;
    const beda = SERIES.filter((s) => Math.abs(r[s.key] - ref[s.key]) > 1e-9 * Math.max(1, Math.abs(ref[s.key])));
    if (beda.length) {
      warnings.push({ tahun: r.tahun, pesan: `Data tahun ${r.tahun} berbeda dari data penelitian pada: ${beda.map((s) => s.label).join(", ")}.` });
    }
  }

  // Perubahan ekstrem pada tahun baru (setelah data penelitian).
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r.tahun <= RESEARCH_BASE_YEAR) continue;
    const prev = rows[i - 1];
    for (const s of SERIES) {
      if (prev[s.key] === 0) continue;
      const ch = (r[s.key] - prev[s.key]) / prev[s.key];
      if (Math.abs(ch) > EXTREME_CHANGE) {
        warnings.push({
          tahun: r.tahun,
          kolom: s.label,
          pesan: `${s.label} berubah ${ch > 0 ? "+" : ""}${(ch * 100).toFixed(1).replace(".", ",")}% dari tahun ${prev.tahun}. Periksa kembali apakah angka ini benar.`,
        });
      }
    }
  }

  return { errors, warnings };
}

/** Peringatan atas parameter hasil hitung (dipanggil setelah validasi lolos). */
export function parameterWarnings(p: ComputedParameters): Issue[] {
  const out: Issue[] = [];
  if (p.values.laju_produktivitas < 0) {
    out.push({ pesan: "Laju Kenaikan Produktivitas bernilai negatif (produktivitas tenaga kerja menurun pada tren 2015–t0)." });
  }
  if (p.values.rddl_referensi < 0.331) {
    out.push({ pesan: "Rasio daya dukung lahan pada tahun dasar sudah di bawah ambang 0,331." });
  }
  return out;
}

// ── Konfigurasi data dasar ──────────────────────────────────────────────────

export interface BaseDataConfig {
  version: 1;
  baseYear: number;
  rows: YearRow[];
  params: ParamValues;
  appliedAt: string;
}

/** Konstanta yang dikirim ke model untuk sebuah konfigurasi. */
export function toModelConstants(params: ParamValues): { varName: string; value: number }[] {
  return PARAM_DEFS.map((d) => ({ varName: d.vensim, value: params[d.key] }));
}

export function sortRows(rows: YearRow[]): YearRow[] {
  return [...rows].sort((a, b) => a.tahun - b.tahun);
}

export function researchRows(): YearRow[] {
  return RESEARCH_DATA.map((r) => ({ ...r }));
}
