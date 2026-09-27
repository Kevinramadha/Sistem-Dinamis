export interface Scenario {
  id: string;
  label: string;
  color: string;
  description: string;
  params: {
    insentif_kebijakan: number;
    kebijakan_konservasi_lahan: number;
  };
}

export interface OutputVariable {
  id: string;
  label: string;
  unit: string;
  dimension: "Ekonomi" | "Lingkungan" | "Sosial" | "Skala" | "Struktur Model";
  arah: "Maksimum" | "Minimum" | "Deskriptif" | "Dilaporkan";
  ambang?: string;
  color?: string;
}

// Dua tuas kebijakan resmi hasil penyaringan tiga kriteria (relevansi
// struktural, dasar kebijakan, keterkendalian) pada skripsi Bab 3.8.1, dan
// tiga skenario definisinya sesuai Tabel 18 Bab 4.8.1. Nilai tuas merupakan
// ketetapan peneliti, bukan target resmi pemerintah.
export const scenarios: Record<string, Scenario> = {
  BAU: {
    id: "BAU",
    label: "Business-as-Usual",
    color: "#1D5A8C",
    description:
      "Tidak ada insentif investasi tambahan; kebutuhan lahan fasilitas pariwisata dipenuhi melalui konversi seperti pola historis.",
    params: {
      insentif_kebijakan: 0,
      kebijakan_konservasi_lahan: 0,
    },
  },
  SUS: {
    id: "SUS",
    label: "Sustainable",
    color: "#3A9C77",
    description:
      "Dorongan investasi terbatas disertai pemenuhan kebutuhan lahan fasilitas pariwisata tanpa konversi lahan tambahan.",
    params: {
      insentif_kebijakan: 0.1,
      kebijakan_konservasi_lahan: 1.0,
    },
  },
  DP: {
    id: "DP",
    label: "Development Priority",
    color: "#E89D3E",
    description: "Ekspansi investasi agresif tanpa pengendalian kebutuhan lahan pariwisata.",
    params: {
      insentif_kebijakan: 0.3,
      kebijakan_konservasi_lahan: 0,
    },
  },
};

// Indikator kinerja evaluasi skenario, dikelompokkan dalam tiga dimensi
// keberlanjutan (ekonomi, lingkungan, sosial) ditambah satu indikator skala,
// sesuai Tabel 19 Bab 4.8.2. Variabel struktur model (hotel, ODTW, malam
// menginap) disertakan sebagai kelompok tambahan untuk transparansi, di luar
// indikator kinerja formal yang dipakai untuk membandingkan skenario.
export const outputVariables: OutputVariable[] = [
  // Skala — dilaporkan, tidak dinilai baik/buruk
  { id: "jumlah_wisatawan", label: "Jumlah Wisatawan", unit: "kunjungan", dimension: "Skala", arah: "Dilaporkan" },

  // Ekonomi — diarahkan pada nilai maksimum, kecuali dua indikator deskriptif
  { id: "tenaga_kerja_pariwisata", label: "Lapangan Kerja Pariwisata", unit: "jiwa", dimension: "Ekonomi", arah: "Maksimum" },
  { id: "pdrb_sektor_pariwisata", label: "Nilai Tambah Pariwisata (PDRB)", unit: "miliar Rp", dimension: "Ekonomi", arah: "Maksimum" },
  { id: "akumulasi_investasi", label: "Investasi Kumulatif", unit: "miliar Rp", dimension: "Ekonomi", arah: "Deskriptif" },
  { id: "tpk", label: "Okupansi Akomodasi (TPK)", unit: "%", dimension: "Ekonomi", arah: "Deskriptif" },

  // Lingkungan
  { id: "rasio_daya_dukung_lahan", label: "Lahan Tersedia untuk Konservasi", unit: "Dmnl", dimension: "Lingkungan", arah: "Maksimum", ambang: "> 0,331" },
  { id: "lahan_terbangun", label: "Luas Lahan Terbangun", unit: "hektar", dimension: "Lingkungan", arah: "Minimum" },
  { id: "akumulasi_konversi_lahan_pariwisata", label: "Konversi Lahan Pariwisata Kumulatif", unit: "hektar", dimension: "Lingkungan", arah: "Minimum" },

  // Sosial
  { id: "indeks_kepadatan", label: "Indeks Kepadatan", unit: "Dmnl", dimension: "Sosial", arah: "Minimum", ambang: "< 2,0" },
  { id: "daya_tarik_wisata", label: "Kualitas Destinasi (Daya Tarik)", unit: "Dmnl", dimension: "Sosial", arah: "Maksimum" },

  // Struktur model — komponen pendukung, di luar indikator kinerja formal
  { id: "jumlah_hotel_dan_akomodasi", label: "Jumlah Hotel dan Akomodasi", unit: "unit akomodasi", dimension: "Struktur Model", arah: "Deskriptif" },
  { id: "jumlah_odtw", label: "Jumlah Objek Daya Tarik Wisata", unit: "unit", dimension: "Struktur Model", arah: "Deskriptif" },
  { id: "investasi_sektor_pariwisata", label: "Investasi Sektor Pariwisata (Tahunan)", unit: "miliar Rp", dimension: "Struktur Model", arah: "Deskriptif" },
  { id: "total_malam_menginap", label: "Total Malam Menginap", unit: "malam", dimension: "Struktur Model", arah: "Deskriptif" },
];

export const outputDimensions: OutputVariable["dimension"][] = [
  "Skala",
  "Ekonomi",
  "Lingkungan",
  "Sosial",
  "Struktur Model",
];

export const scenariosList = Object.values(scenarios);
