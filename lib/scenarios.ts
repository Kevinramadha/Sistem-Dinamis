export interface Scenario {
  id: string;
  label: string;
  color: string;
  description: string;
  params: {
    laju_wisnus: number;
    laju_wisman: number;
    laju_konstruksi_hotel: number;
    proporsi_olah_limbah_cair: number;
    proporsi_olah_limbah_padat: number;
    ekstraksi_air_diizinkan: number;
    infiltrasi_normal: number;
    lahan_diizinkan_resort: number;
    luas_lahan_per_unit: number;
  };
}

export interface OutputVariable {
  id: string;
  label: string;
  unit: string;
  color?: string;
}

export const scenarios: Record<string, Scenario> = {
  S1_BAU: {
    id: "S1",
    label: "Baseline (BAU)",
    color: "#1D5A8C",
    description: "Skenario bisnis seperti biasa (Business as Usual) tanpa intervensi",
    params: {
      laju_wisnus: 0.062,
      laju_wisman: 0.045,
      laju_konstruksi_hotel: 2500,
      proporsi_olah_limbah_cair: 0.25,
      proporsi_olah_limbah_padat: 0.30,
      ekstraksi_air_diizinkan: 4e7,
      infiltrasi_normal: 2.5e7,
      lahan_diizinkan_resort: 0.15,
      luas_lahan_per_unit: 1500,
    },
  },
  S2_Sustainable: {
    id: "S2",
    label: "Keberlanjutan",
    color: "#3A9C77",
    description: "Pertumbuhan moderat dengan pengelolaan lingkungan tinggi",
    params: {
      laju_wisnus: 0.035,
      laju_wisman: 0.025,
      laju_konstruksi_hotel: 1500,
      proporsi_olah_limbah_cair: 0.75,
      proporsi_olah_limbah_padat: 0.70,
      ekstraksi_air_diizinkan: 3.5e7,
      infiltrasi_normal: 3.0e7,
      lahan_diizinkan_resort: 0.08,
      luas_lahan_per_unit: 2000,
    },
  },
  S3_Conservation: {
    id: "S3",
    label: "Konservasi",
    color: "#2BB3B6",
    description: "Konservasi ketat dengan pembatasan pertumbuhan pariwisata",
    params: {
      laju_wisnus: 0.015,
      laju_wisman: 0.010,
      laju_konstruksi_hotel: 800,
      proporsi_olah_limbah_cair: 0.85,
      proporsi_olah_limbah_padat: 0.80,
      ekstraksi_air_diizinkan: 3.0e7,
      infiltrasi_normal: 3.2e7,
      lahan_diizinkan_resort: 0.05,
      luas_lahan_per_unit: 2500,
    },
  },
  S4_Aggressive: {
    id: "S4",
    label: "Pengembangan Agresif",
    color: "#E89D3E",
    description: "Ekspansi maksimal pariwisata dengan risiko overshoot lingkungan",
    params: {
      laju_wisnus: 0.090,
      laju_wisman: 0.075,
      laju_konstruksi_hotel: 4000,
      proporsi_olah_limbah_cair: 0.15,
      proporsi_olah_limbah_padat: 0.15,
      ekstraksi_air_diizinkan: 5.0e7,
      infiltrasi_normal: 2.0e7,
      lahan_diizinkan_resort: 0.25,
      luas_lahan_per_unit: 1000,
    },
  },
  S5_ClimateAdapt: {
    id: "S5",
    label: "Adaptasi Iklim",
    color: "#F4CD53",
    description: "Skenario adaptasi terhadap perubahan iklim dan resiliensi",
    params: {
      laju_wisnus: 0.040,
      laju_wisman: 0.030,
      laju_konstruksi_hotel: 1800,
      proporsi_olah_limbah_cair: 0.80,
      proporsi_olah_limbah_padat: 0.75,
      ekstraksi_air_diizinkan: 3.2e7,
      infiltrasi_normal: 3.5e7,
      lahan_diizinkan_resort: 0.10,
      luas_lahan_per_unit: 1800,
    },
  },
};

export const outputVariables: OutputVariable[] = [
  { id: "jumlah_wisnus", label: "Wisatawan Nusantara", unit: "orang" },
  { id: "jumlah_wisman", label: "Wisatawan Mancanegara", unit: "orang" },
  { id: "jumlah_akomodasi", label: "Unit Akomodasi", unit: "unit" },
  { id: "populasi", label: "Populasi DIY", unit: "jiwa" },
  { id: "stok_air_tanah", label: "Stok Air Tanah", unit: "juta m³" },
  { id: "luas_area_terbangun", label: "Luas Area Terbangun", unit: "hektar" },
  { id: "akumulasi_polusi", label: "Akumulasi Polusi", unit: "indeks" },
  { id: "indeks_kualitas", label: "Indeks Kualitas Lingkungan", unit: "0-1" },
  { id: "lapangan_kerja", label: "Lapangan Kerja Pariwisata", unit: "orang" },
  { id: "rasio_demand_supply", label: "Rasio Demand-Supply Air", unit: "rasio" },
];

export const scenariosList = Object.values(scenarios);
