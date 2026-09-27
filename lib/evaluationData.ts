// Data hasil evaluasi model (uji struktural, uji perilaku, uji kondisi ekstrem,
// analisis sensitivitas), diambil apa adanya dari:
//   hasil_uji_loop_dan_kekekalan.xlsx, hasil_uji_perilaku_baseline_v2.xlsx,
//   hasil_P1_P4_baseline_v2.xlsx, hasil_uji_kondisi_ekstrem_v2.xlsx,
//   hasil_sensitivitas_bagianA.xlsx, hasil_sensitivitas_bagianB.xlsx
// Angka tidak diperhalus atau diubah kesimpulannya dari sumber.

export interface KekekalanRow {
  stok: string; inflow: string; outflow: string; stok2025: number; simulasi2026: number;
  selisihMaks: number; selisihRelatif: number; status: string;
}
export const kekekalanMateri: KekekalanRow[] = [
  {
    "stok": "Jumlah Wisatawan",
    "inflow": "Laju Kedatangan Wisatawan",
    "outflow": "Laju Penurunan Wisatawan",
    "stok2025": 40695700,
    "simulasi2026": 43516521.9309,
    "selisihMaks": 0.0,
    "selisihRelatif": 0,
    "status": "Kekal"
  },
  {
    "stok": "Jumlah Hotel dan Akomodasi",
    "inflow": "Laju Konstruksi Hotel dan Akomodasi",
    "outflow": "Laju Demolisi Hotel dan Akomodasi",
    "stok2025": 2291,
    "simulasi2026": 2334.6294,
    "selisihMaks": 0,
    "selisihRelatif": 0,
    "status": "Kekal"
  },
  {
    "stok": "Jumlah Objek Daya Tarik Wisata",
    "inflow": "Laju Pembangunan/Penambahan ODTW",
    "outflow": "Laju Penutupan ODTW",
    "stok2025": 201,
    "simulasi2026": 205.0941,
    "selisihMaks": 0,
    "selisihRelatif": 0,
    "status": "Kekal"
  },
  {
    "stok": "Tenaga Kerja Pariwisata",
    "inflow": "Laju Penyerapan Tenaga Kerja Pariwisata",
    "outflow": "Laju Keluar Tenaga Kerja Pariwisata",
    "stok2025": 364994,
    "simulasi2026": 364994.4563,
    "selisihMaks": 0,
    "selisihRelatif": 0,
    "status": "Kekal"
  },
  {
    "stok": "Lahan Terbangun",
    "inflow": "Laju Konversi Lahan Pariwisata + Laju Konversi Lahan Non Pariwisata",
    "outflow": "(tidak ada)",
    "stok2025": 55029.5,
    "simulasi2026": 57035.45,
    "selisihMaks": 0,
    "selisihRelatif": 0,
    "status": "Kekal"
  }
];

export interface LoopUjiRow {
  kondisi: string; jwJuta: number; hotel: number; odtw: number; tkRibu: number; lahanHa: number;
  dayaTarik: number; selisihJwPct: number;
}
export const ujiLoopUmpanBalik: LoopUjiRow[] = [
  {
    "kondisi": "BASE (semua loop aktif)",
    "jwJuta": 96.1972,
    "hotel": 5404.3699,
    "odtw": 367.2417,
    "tkRibu": 650.3552,
    "lahanHa": 122207.6209,
    "dayaTarik": 0.8132,
    "selisihJwPct": 0
  },
  {
    "kondisi": "B1 kepadatan",
    "jwJuta": 250.3196,
    "hotel": 12150.834,
    "odtw": 528.2925,
    "tkRibu": 1585.4641,
    "lahanHa": 123069.8866,
    "dayaTarik": 1.0696,
    "selisihJwPct": 160.2152
  },
  {
    "kondisi": "B2 daya dukung lahan",
    "jwJuta": 111.6577,
    "hotel": 6081.4095,
    "odtw": 383.8454,
    "tkRibu": 745.2595,
    "lahanHa": 135035.4456,
    "dayaTarik": 0.8632,
    "selisihJwPct": 16.0717
  },
  {
    "kondisi": "R2 ekonomi-atraksi",
    "jwJuta": 80.2382,
    "hotel": 4670.5738,
    "odtw": 201,
    "tkRibu": 549.7312,
    "lahanHa": 122108.8585,
    "dayaTarik": 0.7635,
    "selisihJwPct": -16.5899
  },
  {
    "kondisi": "B okupansi hotel",
    "jwJuta": 96.2298,
    "hotel": 4866.5764,
    "odtw": 367.2802,
    "tkRibu": 650.5608,
    "lahanHa": 122080.1219,
    "dayaTarik": 0.8133,
    "selisihJwPct": 0.0339
  },
  {
    "kondisi": "B goal-seeking TK",
    "jwJuta": 96.1972,
    "hotel": 5404.3699,
    "odtw": 367.2417,
    "tkRibu": 364.994,
    "lahanHa": 122207.6209,
    "dayaTarik": 0.8132,
    "selisihJwPct": 0
  },
  {
    "kondisi": "Semua rem mati (R1 murni)",
    "jwJuta": 217.3652,
    "hotel": 10885.4896,
    "odtw": 503.9007,
    "tkRibu": 1399.4412,
    "lahanHa": 122930.4137,
    "dayaTarik": 1,
    "selisihJwPct": 125.958
  }
];

export interface RingkasanDampakLoopRow {
  loop: string; variabelTerdampak: string; selisihPct: number; jumlahVariabelBerubah: number;
}
export const ringkasanDampakLoop: RingkasanDampakLoopRow[] = [
  {
    "loop": "B1 kepadatan",
    "variabelTerdampak": "Jumlah Wisatawan",
    "selisihPct": 160.2152,
    "jumlahVariabelBerubah": 5
  },
  {
    "loop": "B2 daya dukung lahan",
    "variabelTerdampak": "Jumlah Wisatawan",
    "selisihPct": 16.0717,
    "jumlahVariabelBerubah": 6
  },
  {
    "loop": "R2 ekonomi-atraksi",
    "variabelTerdampak": "Jumlah Objek Daya Tarik Wisata",
    "selisihPct": -45.2677,
    "jumlahVariabelBerubah": 5
  },
  {
    "loop": "B okupansi hotel",
    "variabelTerdampak": "Jumlah Hotel dan Akomodasi",
    "selisihPct": -9.9511,
    "jumlahVariabelBerubah": 1
  },
  {
    "loop": "B goal-seeking TK",
    "variabelTerdampak": "Tenaga Kerja Pariwisata",
    "selisihPct": -43.8777,
    "jumlahVariabelBerubah": 1
  },
  {
    "loop": "Semua rem mati (R1 murni)",
    "variabelTerdampak": "Jumlah Wisatawan",
    "selisihPct": 125.958,
    "jumlahVariabelBerubah": 5
  }
];

export interface NilaiLoopRow {
  kondisi: string; jw: number; hotel: number; odtw: number; tk: number; lahan: number; dayaTarik: number;
}
export interface SelisihLoopRow {
  loop: string; jw: number; hotel: number; odtw: number; tk: number; lahan: number; dayaTarik: number;
}
export const nilai2050PerLoop: NilaiLoopRow[] = [
  {
    "kondisi": "BASE",
    "jw": 96197154.2126,
    "hotel": 5404.3699,
    "odtw": 367.2417,
    "tk": 650355.2026,
    "lahan": 122207.6209,
    "dayaTarik": 0.8132
  },
  {
    "kondisi": "B1 kepadatan",
    "jw": 250319645.4671,
    "hotel": 12150.834,
    "odtw": 528.2925,
    "tk": 1585464.1355,
    "lahan": 123069.8866,
    "dayaTarik": 1.0696
  },
  {
    "kondisi": "B2 daya dukung lahan",
    "jw": 111657678.7124,
    "hotel": 6081.4095,
    "odtw": 383.8454,
    "tk": 745259.4532,
    "lahan": 135035.4456,
    "dayaTarik": 0.8632
  },
  {
    "kondisi": "R2 ekonomi-atraksi",
    "jw": 80238156.7101,
    "hotel": 4670.5738,
    "odtw": 201,
    "tk": 549731.2474,
    "lahan": 122108.8585,
    "dayaTarik": 0.7635
  },
  {
    "kondisi": "B okupansi hotel",
    "jw": 96229805.7761,
    "hotel": 4866.5764,
    "odtw": 367.2802,
    "tk": 650560.7803,
    "lahan": 122080.1219,
    "dayaTarik": 0.8133
  },
  {
    "kondisi": "B goal-seeking TK",
    "jw": 96197154.2126,
    "hotel": 5404.3699,
    "odtw": 367.2417,
    "tk": 364994,
    "lahan": 122207.6209,
    "dayaTarik": 0.8132
  },
  {
    "kondisi": "Semua rem mati (R1 murni)",
    "jw": 217365191.578,
    "hotel": 10885.4896,
    "odtw": 503.9007,
    "tk": 1399441.2411,
    "lahan": 122930.4137,
    "dayaTarik": 1
  }
];
export const selisihPersenPerLoop: SelisihLoopRow[] = [
  {
    "loop": "B1 kepadatan",
    "jw": 160.2152,
    "hotel": 124.8335,
    "odtw": 43.8541,
    "tk": 143.7843,
    "lahan": 0.7056,
    "dayaTarik": 31.5224
  },
  {
    "loop": "B2 daya dukung lahan",
    "jw": 16.0717,
    "hotel": 12.5276,
    "odtw": 4.5212,
    "tk": 14.5927,
    "lahan": 10.4967,
    "dayaTarik": 6.148
  },
  {
    "loop": "R2 ekonomi-atraksi",
    "jw": -16.5899,
    "hotel": -13.5778,
    "odtw": -45.2677,
    "tk": -15.4722,
    "lahan": -0.0808,
    "dayaTarik": -6.1154
  },
  {
    "loop": "B okupansi hotel",
    "jw": 0.0339,
    "hotel": -9.9511,
    "odtw": 0.0105,
    "tk": 0.0316,
    "lahan": -0.1043,
    "dayaTarik": 0.0106
  },
  {
    "loop": "B goal-seeking TK",
    "jw": 0,
    "hotel": 0,
    "odtw": 0,
    "tk": -43.8777,
    "lahan": 0,
    "dayaTarik": 0
  },
  {
    "loop": "Semua rem mati (R1 murni)",
    "jw": 125.958,
    "hotel": 101.4201,
    "odtw": 37.2123,
    "tk": 115.1811,
    "lahan": 0.5914,
    "dayaTarik": 22.9644
  }
];

export interface GalatIntegrasiRow {
  variabel: string; ts1: number; ts05: number; selisihPct: number;
}
export const ujiGalatIntegrasi: GalatIntegrasiRow[] = [
  {
    "variabel": "Jumlah Wisatawan",
    "ts1": 96197154.2126,
    "ts05": 95940352.1419,
    "selisihPct": -0.267
  },
  {
    "variabel": "Daya Tarik Destinasi Wisata",
    "ts1": 0.8132,
    "ts05": 0.8132,
    "selisihPct": -0.003
  },
  {
    "variabel": "Tingkat Penghunian Kamar (TPK)",
    "ts1": 0.3584,
    "ts05": 0.3584,
    "selisihPct": 0.0024
  },
  {
    "variabel": "Rasio Daya Dukung Lahan",
    "ts1": 0.6145,
    "ts05": 0.6132,
    "selisihPct": -0.2104
  },
  {
    "variabel": "Lahan Terbangun",
    "ts1": 122207.6209,
    "ts05": 122617.5099,
    "selisihPct": 0.3354
  },
  {
    "variabel": "Jumlah Hotel dan Akomodasi",
    "ts1": 5404.3699,
    "ts05": 5389.8137,
    "selisihPct": -0.2693
  },
  {
    "variabel": "Jumlah Objek Daya Tarik Wisata",
    "ts1": 367.2417,
    "ts05": 367.1655,
    "selisihPct": -0.0207
  },
  {
    "variabel": "Tenaga Kerja Pariwisata",
    "ts1": 650355.2026,
    "ts05": 648572.1866,
    "selisihPct": -0.2742
  },
  {
    "variabel": "PDRB Sektor Pariwisata",
    "ts1": 40061.0961,
    "ts05": 39954.1514,
    "selisihPct": -0.267
  },
  {
    "variabel": "Investasi Sektor Pariwisata",
    "ts1": 1955.6786,
    "ts05": 1950.4578,
    "selisihPct": -0.267
  }
];

export interface StatistikPerilakuRow {
  uji: string; variabel: string; versi: string; arahKemiringan: string; tren: string; statusTren: string;
  e1: number; statusE1: string; e2: number; statusE2: string; dc: number; kategoriDC: string;
  u1: number; u2: number; u3: number; komponenDominan: string; mape: number; nrmse?: number;
}
export const statistikUjiPenuh: StatistikPerilakuRow[] = [
  {
    "uji": "B",
    "variabel": "Jumlah Wisatawan",
    "versi": "Dengan COVID",
    "arahKemiringan": "Searah",
    "tren": "Berbeda nyata",
    "statusTren": "Tidak lolos",
    "e1": 0.1194,
    "statusE1": "Tidak ditafsirkan",
    "e2": 0.6064,
    "statusE2": "Tidak ditafsirkan",
    "dc": 0.4482,
    "kategoriDC": "Cukup",
    "u1": 0.3237,
    "u2": 0.6374,
    "u3": 0.0389,
    "komponenDominan": "U2 (variasi)",
    "mape": 12.064
  },
  {
    "uji": "B",
    "variabel": "Jumlah Wisatawan",
    "versi": "Tanpa COVID",
    "arahKemiringan": "Searah",
    "tren": "Berbeda nyata",
    "statusTren": "Tidak lolos",
    "e1": 0.169,
    "statusE1": "Tidak ditafsirkan",
    "e2": 0.5808,
    "statusE2": "Tidak ditafsirkan",
    "dc": 0.4258,
    "kategoriDC": "Cukup",
    "u1": 0.5731,
    "u2": 0.3945,
    "u3": 0.0325,
    "komponenDominan": "U1 (bias)",
    "mape": 14.2362
  },
  {
    "uji": "B",
    "variabel": "Jumlah Hotel dan Akomodasi",
    "versi": "Dengan COVID",
    "arahKemiringan": "Berlawanan",
    "tren": "Berlawanan arah",
    "statusTren": "Tidak lolos",
    "e1": 0.1399,
    "statusE1": "Tidak ditafsirkan",
    "e2": 0.4685,
    "statusE2": "Tidak ditafsirkan",
    "dc": 0.8228,
    "kategoriDC": "Kurang",
    "u1": 0.5779,
    "u2": 0.0584,
    "u3": 0.3637,
    "komponenDominan": "U1 (bias)",
    "mape": 13.1619
  },
  {
    "uji": "B",
    "variabel": "Jumlah Hotel dan Akomodasi",
    "versi": "Tanpa COVID",
    "arahKemiringan": "Berlawanan",
    "tren": "Berlawanan arah",
    "statusTren": "Tidak lolos",
    "e1": 0.1725,
    "statusE1": "Tidak ditafsirkan",
    "e2": 0.4406,
    "statusE2": "Tidak ditafsirkan",
    "dc": 0.8082,
    "kategoriDC": "Kurang",
    "u1": 0.6758,
    "u2": 0.0396,
    "u3": 0.2846,
    "komponenDominan": "U1 (bias)",
    "mape": 16.4458
  },
  {
    "uji": "B",
    "variabel": "Jumlah Objek Daya Tarik Wisata",
    "versi": "Dengan COVID",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.0012,
    "statusE1": "Lolos",
    "e2": 0.855,
    "statusE2": "Tidak lolos",
    "dc": 0.7855,
    "kategoriDC": "Kurang",
    "u1": 0.0003,
    "u2": 0.9033,
    "u3": 0.0964,
    "komponenDominan": "U2 (variasi)",
    "mape": 5.6795
  },
  {
    "uji": "B",
    "variabel": "Jumlah Objek Daya Tarik Wisata",
    "versi": "Tanpa COVID",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.0313,
    "statusE1": "Lolos",
    "e2": 0.8193,
    "statusE2": "Tidak lolos",
    "dc": 0.7568,
    "kategoriDC": "Kurang",
    "u1": 0.2499,
    "u2": 0.6307,
    "u3": 0.1194,
    "komponenDominan": "U2 (variasi)",
    "mape": 4.5536
  },
  {
    "uji": "B",
    "variabel": "Tenaga Kerja Pariwisata",
    "versi": "Dengan COVID",
    "arahKemiringan": "Berlawanan",
    "tren": "Berlawanan arah",
    "statusTren": "Tidak lolos",
    "e1": 0.1182,
    "statusE1": "Tidak ditafsirkan",
    "e2": 0.328,
    "statusE2": "Tidak ditafsirkan",
    "dc": 0.886,
    "kategoriDC": "Kurang",
    "u1": 0.4991,
    "u2": 0.0245,
    "u3": 0.4763,
    "komponenDominan": "U1 (bias)",
    "mape": 12.3913
  },
  {
    "uji": "B",
    "variabel": "Tenaga Kerja Pariwisata",
    "versi": "Tanpa COVID",
    "arahKemiringan": "Berlawanan",
    "tren": "Berlawanan arah",
    "statusTren": "Tidak lolos",
    "e1": 0.1674,
    "statusE1": "Tidak ditafsirkan",
    "e2": 0.0327,
    "statusE2": "Tidak ditafsirkan",
    "dc": 0.8222,
    "kategoriDC": "Kurang",
    "u1": 0.7789,
    "u2": 0.0001,
    "u3": 0.221,
    "komponenDominan": "U1 (bias)",
    "mape": 16.3801
  },
  {
    "uji": "B",
    "variabel": "Lahan Terbangun",
    "versi": "Dengan COVID",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.1099,
    "statusE1": "Tidak lolos",
    "e2": 0.3627,
    "statusE2": "Tidak lolos",
    "dc": 0.6619,
    "kategoriDC": "Cukup",
    "u1": 0.4286,
    "u2": 0.064,
    "u3": 0.5073,
    "komponenDominan": "U3 (kovariasi)",
    "mape": 13.432
  },
  {
    "uji": "B",
    "variabel": "Lahan Terbangun",
    "versi": "Tanpa COVID",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.1044,
    "statusE1": "Tidak lolos",
    "e2": 0.4108,
    "statusE2": "Tidak lolos",
    "dc": 0.7254,
    "kategoriDC": "Kurang",
    "u1": 0.3381,
    "u2": 0.0841,
    "u3": 0.5778,
    "komponenDominan": "U3 (kovariasi)",
    "mape": 13.819
  },
  {
    "uji": "B",
    "variabel": "TPK",
    "versi": "Dengan COVID",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.2013,
    "statusE1": "Tidak lolos",
    "e2": 0.267,
    "statusE2": "Lolos",
    "dc": 0.6224,
    "kategoriDC": "Cukup",
    "u1": 0.5086,
    "u2": 0.0301,
    "u3": 0.4612,
    "komponenDominan": "U1 (bias)",
    "mape": 18.9791
  },
  {
    "uji": "B",
    "variabel": "TPK",
    "versi": "Tanpa COVID",
    "arahKemiringan": "Berlawanan",
    "tren": "Berlawanan arah",
    "statusTren": "Tidak lolos",
    "e1": 0.2431,
    "statusE1": "Tidak ditafsirkan",
    "e2": 0.942,
    "statusE2": "Tidak ditafsirkan",
    "dc": 0.9263,
    "kategoriDC": "Kurang",
    "u1": 0.6629,
    "u2": 0.0403,
    "u3": 0.2968,
    "komponenDominan": "U1 (bias)",
    "mape": 23.4226
  },
  {
    "uji": "B",
    "variabel": "PDRB Sektor Pariwisata",
    "versi": "Dengan COVID",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.2543,
    "statusE1": "Tidak lolos",
    "e2": 0.345,
    "statusE2": "Tidak lolos",
    "dc": 0.3062,
    "kategoriDC": "Baik",
    "u1": 0.9273,
    "u2": 0.0337,
    "u3": 0.039,
    "komponenDominan": "U1 (bias)",
    "mape": 25.0614
  },
  {
    "uji": "B",
    "variabel": "PDRB Sektor Pariwisata",
    "versi": "Tanpa COVID",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.2761,
    "statusE1": "Tidak lolos",
    "e2": 0.0667,
    "statusE2": "Lolos",
    "dc": 0.168,
    "kategoriDC": "Baik",
    "u1": 0.9878,
    "u2": 0.0005,
    "u3": 0.0117,
    "komponenDominan": "U1 (bias)",
    "mape": 27.7631
  },
  {
    "uji": "B",
    "variabel": "Investasi Sektor Pariwisata",
    "versi": "Dengan COVID",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.3839,
    "statusE1": "Tidak lolos",
    "e2": 0.7927,
    "statusE2": "Tidak lolos",
    "dc": 0.7356,
    "kategoriDC": "Kurang",
    "u1": 0.5814,
    "u2": 0.3334,
    "u3": 0.0852,
    "komponenDominan": "U1 (bias)",
    "mape": 33.5417
  },
  {
    "uji": "B",
    "variabel": "Investasi Sektor Pariwisata",
    "versi": "Tanpa COVID",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.4049,
    "statusE1": "Tidak lolos",
    "e2": 0.7988,
    "statusE2": "Tidak lolos",
    "dc": 0.7551,
    "kategoriDC": "Kurang",
    "u1": 0.6056,
    "u2": 0.3059,
    "u3": 0.0885,
    "komponenDominan": "U1 (bias)",
    "mape": 36.2494
  },
  {
    "uji": "B",
    "variabel": "Total Malam Menginap",
    "versi": "Dengan COVID",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.2643,
    "statusE1": "Tidak lolos",
    "e2": 0.6757,
    "statusE2": "Tidak lolos",
    "dc": 0.7041,
    "kategoriDC": "Kurang",
    "u1": 0.506,
    "u2": 0.2594,
    "u3": 0.2346,
    "komponenDominan": "U1 (bias)",
    "mape": 29.5205
  },
  {
    "uji": "B",
    "variabel": "Total Malam Menginap",
    "versi": "Tanpa COVID",
    "arahKemiringan": "Berlawanan",
    "tren": "Berlawanan arah",
    "statusTren": "Tidak lolos",
    "e1": 0.3395,
    "statusE1": "Tidak ditafsirkan",
    "e2": 0.2976,
    "statusE2": "Tidak ditafsirkan",
    "dc": 0.806,
    "kategoriDC": "Kurang",
    "u1": 0.8236,
    "u2": 0.0083,
    "u3": 0.1681,
    "komponenDominan": "U1 (bias)",
    "mape": 32.8391
  }
];
export const statistikP5: StatistikPerilakuRow[] = [
  {
    "uji": "P5",
    "variabel": "Jumlah Wisatawan",
    "versi": "Dengan COVID",
    "arahKemiringan": "Searah",
    "tren": "Berbeda nyata",
    "statusTren": "Tidak lolos",
    "e1": 0.1776,
    "statusE1": "Tidak ditafsirkan",
    "e2": 0.5767,
    "statusE2": "Tidak ditafsirkan",
    "dc": 0.4203,
    "kategoriDC": "Cukup",
    "u1": 0.4207,
    "u2": 0.5385,
    "u3": 0.0408,
    "komponenDominan": "U2 (variasi)",
    "mape": 14.25
  },
  {
    "uji": "P5",
    "variabel": "Jumlah Wisatawan",
    "versi": "Tanpa COVID",
    "arahKemiringan": "Searah",
    "tren": "Berbeda nyata",
    "statusTren": "Tidak lolos",
    "e1": 0.2025,
    "statusE1": "Tidak ditafsirkan",
    "e2": 0.568,
    "statusE2": "Tidak ditafsirkan",
    "dc": 0.4057,
    "kategoriDC": "Cukup",
    "u1": 0.4737,
    "u2": 0.5031,
    "u3": 0.0233,
    "komponenDominan": "U2 (variasi)",
    "mape": 16.4448
  }
];
export const statistikUjiParsial: StatistikPerilakuRow[] = [
  {
    "uji": "P1",
    "variabel": "Jumlah Hotel dan Akomodasi",
    "versi": "Dengan COVID",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.0089,
    "statusE1": "Lolos",
    "e2": 0.1435,
    "statusE2": "Lolos",
    "dc": 0.2476,
    "kategoriDC": "Baik",
    "u1": 0.0078,
    "u2": 0.0726,
    "u3": 0.9196,
    "komponenDominan": "U3 (kovariasi)",
    "mape": 7.0997,
    "nrmse": 0.1003
  },
  {
    "uji": "P1",
    "variabel": "Jumlah Hotel dan Akomodasi",
    "versi": "Tanpa COVID",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.0402,
    "statusE1": "Lolos",
    "e2": 0.0773,
    "statusE2": "Lolos",
    "dc": 0.2011,
    "kategoriDC": "Baik",
    "u1": 0.1728,
    "u2": 0.0283,
    "u3": 0.7988,
    "komponenDominan": "U3 (kovariasi)",
    "mape": 6.048,
    "nrmse": 0.0966
  },
  {
    "uji": "P1",
    "variabel": "Jumlah Hotel dan Akomodasi",
    "versi": "Periode objektif",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.0468,
    "statusE1": "Lolos",
    "e2": 0.0672,
    "statusE2": "Lolos",
    "dc": 0.1997,
    "kategoriDC": "Baik",
    "u1": 0.2021,
    "u2": 0.0211,
    "u3": 0.7767,
    "komponenDominan": "U3 (kovariasi)",
    "mape": 6.8622,
    "nrmse": 0.1041
  },
  {
    "uji": "P1",
    "variabel": "TPK",
    "versi": "Dengan COVID",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.0204,
    "statusE1": "Lolos",
    "e2": 1.1513,
    "statusE2": "Tidak lolos",
    "dc": 0.4667,
    "kategoriDC": "Cukup",
    "u1": 0.0072,
    "u2": 0.6085,
    "u3": 0.3843,
    "komponenDominan": "U2 (variasi)",
    "mape": 18.7346,
    "nrmse": 0.2398
  },
  {
    "uji": "P1",
    "variabel": "TPK",
    "versi": "Tanpa COVID",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.0643,
    "statusE1": "Tidak lolos",
    "e2": 2.5684,
    "statusE2": "Tidak lolos",
    "dc": 0.6692,
    "kategoriDC": "Cukup",
    "u1": 0.0807,
    "u2": 0.6488,
    "u3": 0.2705,
    "komponenDominan": "U2 (variasi)",
    "mape": 17.374,
    "nrmse": 0.2263
  },
  {
    "uji": "P1",
    "variabel": "TPK",
    "versi": "Periode objektif",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.1081,
    "statusE1": "Tidak lolos",
    "e2": 2.4214,
    "statusE2": "Tidak lolos",
    "dc": 0.6094,
    "kategoriDC": "Cukup",
    "u1": 0.2281,
    "u2": 0.6235,
    "u3": 0.1484,
    "komponenDominan": "U2 (variasi)",
    "mape": 16.6281,
    "nrmse": 0.2263
  },
  {
    "uji": "P1b",
    "variabel": "Jumlah Hotel dan Akomodasi",
    "versi": "Dengan COVID",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.02,
    "statusE1": "Lolos",
    "e2": 0.2128,
    "statusE2": "Lolos",
    "dc": 0.2868,
    "kategoriDC": "Baik",
    "u1": 0.0273,
    "u2": 0.1093,
    "u3": 0.8634,
    "komponenDominan": "U3 (kovariasi)",
    "mape": 9.6624,
    "nrmse": 0.1212
  },
  {
    "uji": "P1b",
    "variabel": "Jumlah Hotel dan Akomodasi",
    "versi": "Tanpa COVID",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.0182,
    "statusE1": "Lolos",
    "e2": 0.1223,
    "statusE2": "Lolos",
    "dc": 0.2319,
    "kategoriDC": "Baik",
    "u1": 0.0299,
    "u2": 0.0599,
    "u3": 0.9103,
    "komponenDominan": "U3 (kovariasi)",
    "mape": 7.8624,
    "nrmse": 0.1051
  },
  {
    "uji": "P1b",
    "variabel": "Jumlah Hotel dan Akomodasi",
    "versi": "Periode objektif",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.0291,
    "statusE1": "Lolos",
    "e2": 0.102,
    "statusE2": "Lolos",
    "dc": 0.2265,
    "kategoriDC": "Baik",
    "u1": 0.0686,
    "u2": 0.0427,
    "u3": 0.8887,
    "komponenDominan": "U3 (kovariasi)",
    "mape": 8.2203,
    "nrmse": 0.1112
  },
  {
    "uji": "P1b",
    "variabel": "TPK",
    "versi": "Dengan COVID",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.0193,
    "statusE1": "Lolos",
    "e2": 1.2416,
    "statusE2": "Tidak lolos",
    "dc": 0.4985,
    "kategoriDC": "Cukup",
    "u1": 0.0054,
    "u2": 0.5871,
    "u3": 0.4075,
    "komponenDominan": "U2 (variasi)",
    "mape": 20.239,
    "nrmse": 0.2633
  },
  {
    "uji": "P1b",
    "variabel": "TPK",
    "versi": "Tanpa COVID",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.061,
    "statusE1": "Tidak lolos",
    "e2": 2.9435,
    "statusE2": "Tidak lolos",
    "dc": 0.7053,
    "kategoriDC": "Kurang",
    "u1": 0.0572,
    "u2": 0.6719,
    "u3": 0.2709,
    "komponenDominan": "U2 (variasi)",
    "mape": 19.5598,
    "nrmse": 0.2548
  },
  {
    "uji": "P1b",
    "variabel": "TPK",
    "versi": "Periode objektif",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.1028,
    "statusE1": "Tidak lolos",
    "e2": 2.8628,
    "statusE2": "Tidak lolos",
    "dc": 0.6665,
    "kategoriDC": "Cukup",
    "u1": 0.1561,
    "u2": 0.6584,
    "u3": 0.1855,
    "komponenDominan": "U2 (variasi)",
    "mape": 19.2591,
    "nrmse": 0.2603
  },
  {
    "uji": "P4",
    "variabel": "Lahan Terbangun",
    "versi": "Dengan COVID",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.1129,
    "statusE1": "Tidak lolos",
    "e2": 0.3901,
    "statusE2": "Tidak lolos",
    "dc": 0.4809,
    "kategoriDC": "Cukup",
    "u1": 0.4811,
    "u2": 0.1317,
    "u3": 0.3872,
    "komponenDominan": "U1 (bias)",
    "mape": 12.6378,
    "nrmse": 0.1627
  },
  {
    "uji": "P4",
    "variabel": "Lahan Terbangun",
    "versi": "Tanpa COVID",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.1125,
    "statusE1": "Tidak lolos",
    "e2": 0.3918,
    "statusE2": "Tidak lolos",
    "dc": 0.4813,
    "kategoriDC": "Cukup",
    "u1": 0.425,
    "u2": 0.1473,
    "u3": 0.4277,
    "komponenDominan": "U3 (kovariasi)",
    "mape": 12.9414,
    "nrmse": 0.1726
  },
  {
    "uji": "P4",
    "variabel": "Lahan Terbangun",
    "versi": "Periode objektif",
    "arahKemiringan": "Searah",
    "tren": "Tidak berbeda nyata",
    "statusTren": "Lolos",
    "e1": 0.1125,
    "statusE1": "Tidak lolos",
    "e2": 0.3918,
    "statusE2": "Tidak lolos",
    "dc": 0.4813,
    "kategoriDC": "Cukup",
    "u1": 0.425,
    "u2": 0.1473,
    "u3": 0.4277,
    "komponenDominan": "U3 (kovariasi)",
    "mape": 12.9414,
    "nrmse": 0.1726
  }
];

export interface FitPoint { tahun: number; data: number; simulasi: number }
export const fitSeriesPenuh: Record<string, FitPoint[]> = {
  "jumlah_wisatawan": [
    {
      "tahun": 2019,
      "data": 20520104.0,
      "simulasi": 20520100.0
    },
    {
      "tahun": 2020,
      "data": 19610135.0,
      "simulasi": 21854934.1245
    },
    {
      "tahun": 2021,
      "data": 22849394.5,
      "simulasi": 23265200.0406
    },
    {
      "tahun": 2022,
      "data": 25755726.0,
      "simulasi": 24755046.2402
    },
    {
      "tahun": 2023,
      "data": 30542580.0,
      "simulasi": 26328899.6231
    },
    {
      "tahun": 2024,
      "data": 38134536.0,
      "simulasi": 27991479.7295
    },
    {
      "tahun": 2025,
      "data": 40695654.0,
      "simulasi": 29747841.3901
    }
  ],
  "jumlah_hotel_dan_akomodasi": [
    {
      "tahun": 2019,
      "data": 1817.0,
      "simulasi": 1817.0
    },
    {
      "tahun": 2020,
      "data": 1848.0,
      "simulasi": 1726.15
    },
    {
      "tahun": 2021,
      "data": 1696.0,
      "simulasi": 1639.8425
    },
    {
      "tahun": 2022,
      "data": 1818.0,
      "simulasi": 1569.4909
    },
    {
      "tahun": 2023,
      "data": 1820.0,
      "simulasi": 1540.5667
    },
    {
      "tahun": 2024,
      "data": 2000.0,
      "simulasi": 1549.097
    },
    {
      "tahun": 2025,
      "data": 2291.0,
      "simulasi": 1588.5605
    }
  ],
  "jumlah_odtw": [
    {
      "tahun": 2019,
      "data": 189.0,
      "simulasi": 189.0
    },
    {
      "tahun": 2020,
      "data": 180.0,
      "simulasi": 189.3784
    },
    {
      "tahun": 2021,
      "data": 170.0,
      "simulasi": 190.0233
    },
    {
      "tahun": 2022,
      "data": 183.0,
      "simulasi": 190.9377
    },
    {
      "tahun": 2023,
      "data": 201.0,
      "simulasi": 192.125
    },
    {
      "tahun": 2024,
      "data": 218.0,
      "simulasi": 193.5897
    },
    {
      "tahun": 2025,
      "data": 201.0,
      "simulasi": 195.3368
    }
  ],
  "tenaga_kerja_pariwisata": [
    {
      "tahun": 2019,
      "data": 334784.0,
      "simulasi": 334784.0
    },
    {
      "tahun": 2020,
      "data": 313840.0,
      "simulasi": 324740.48
    },
    {
      "tahun": 2021,
      "data": 310755.0,
      "simulasi": 314998.2656
    },
    {
      "tahun": 2022,
      "data": 395284.0,
      "simulasi": 305548.3176
    },
    {
      "tahun": 2023,
      "data": 359340.0,
      "simulasi": 296381.8681
    },
    {
      "tahun": 2024,
      "data": 350946.0,
      "simulasi": 287490.4121
    },
    {
      "tahun": 2025,
      "data": 364994.0,
      "simulasi": 278865.6997
    }
  ],
  "lahan_terbangun": [
    {
      "tahun": 2019,
      "data": 63480.0442,
      "simulasi": 63480.0
    },
    {
      "tahun": 2020,
      "data": 58962.0411,
      "simulasi": 65698.5604
    },
    {
      "tahun": 2021,
      "data": 59887.526,
      "simulasi": 67974.5392
    },
    {
      "tahun": 2022,
      "data": 57709.0758,
      "simulasi": 70309.1237
    },
    {
      "tahun": 2023,
      "data": 75624.4035,
      "simulasi": 72704.7687
    },
    {
      "tahun": 2024,
      "data": 73511.5747,
      "simulasi": 75161.174
    },
    {
      "tahun": 2025,
      "data": 55029.5353,
      "simulasi": 77677.6613
    }
  ],
  "tpk": [
    {
      "tahun": 2019,
      "data": 0.4534,
      "simulasi": 0.2274
    },
    {
      "tahun": 2020,
      "data": 0.289,
      "simulasi": 0.2549
    },
    {
      "tahun": 2021,
      "data": 0.2748,
      "simulasi": 0.2856
    },
    {
      "tahun": 2022,
      "data": 0.4499,
      "simulasi": 0.3176
    },
    {
      "tahun": 2023,
      "data": 0.4477,
      "simulasi": 0.3441
    },
    {
      "tahun": 2024,
      "data": 0.4217,
      "simulasi": 0.3638
    },
    {
      "tahun": 2025,
      "data": 0.3807,
      "simulasi": 0.377
    }
  ],
  "pdrb_sektor_pariwisata": [
    {
      "tahun": 2019,
      "data": 13104.38,
      "simulasi": 8545.5511
    },
    {
      "tahun": 2020,
      "data": 10926.83,
      "simulasi": 9101.4399
    },
    {
      "tahun": 2021,
      "data": 12097.19,
      "simulasi": 9688.7421
    },
    {
      "tahun": 2022,
      "data": 13672.58,
      "simulasi": 10309.1853
    },
    {
      "tahun": 2023,
      "data": 14809.2,
      "simulasi": 10964.6131
    },
    {
      "tahun": 2024,
      "data": 15873.81,
      "simulasi": 11656.991
    },
    {
      "tahun": 2025,
      "data": 16947.62,
      "simulasi": 12388.424
    }
  ],
  "investasi_sektor_pariwisata": [
    {
      "tahun": 2019,
      "data": 741.4483,
      "simulasi": 417.1716
    },
    {
      "tahun": 2020,
      "data": 489.6932,
      "simulasi": 444.3086
    },
    {
      "tahun": 2021,
      "data": 848.8042,
      "simulasi": 472.9792
    },
    {
      "tahun": 2022,
      "data": 463.5886,
      "simulasi": 503.2676
    },
    {
      "tahun": 2023,
      "data": 1175.2552,
      "simulasi": 535.2639
    },
    {
      "tahun": 2024,
      "data": 712.2835,
      "simulasi": 569.064
    },
    {
      "tahun": 2025,
      "data": 1325.9504,
      "simulasi": 604.7706
    }
  ],
  "total_malam_menginap": [
    {
      "tahun": 2019,
      "data": 13363923.0,
      "simulasi": 6026273.1997
    },
    {
      "tahun": 2020,
      "data": 4753098.0,
      "simulasi": 6418282.7469
    },
    {
      "tahun": 2021,
      "data": 7379577.0,
      "simulasi": 6832444.8462
    },
    {
      "tahun": 2022,
      "data": 9267217.0,
      "simulasi": 7269977.8127
    },
    {
      "tahun": 2023,
      "data": 11417702.0,
      "simulasi": 7732181.7231
    },
    {
      "tahun": 2024,
      "data": 11503540.0,
      "simulasi": 8220442.5959
    },
    {
      "tahun": 2025,
      "data": 11954114.0,
      "simulasi": 8736244.9168
    }
  ]
};
export const fitSeriesParsial: Record<string, FitPoint[]> = {
  "jumlah_hotel_dan_akomodasi_P1": [
    {
      "tahun": 2016,
      "data": 1170.0,
      "simulasi": 1170.0
    },
    {
      "tahun": 2017,
      "data": 1179.0,
      "simulasi": 1182.662
    },
    {
      "tahun": 2018,
      "data": 1617.0,
      "simulasi": 1260.0848
    },
    {
      "tahun": 2019,
      "data": 1817.0,
      "simulasi": 1571.8777
    },
    {
      "tahun": 2020,
      "data": 1848.0,
      "simulasi": 2021.4248
    },
    {
      "tahun": 2021,
      "data": 1696.0,
      "simulasi": 1920.3535
    },
    {
      "tahun": 2022,
      "data": 1818.0,
      "simulasi": 1824.3358
    },
    {
      "tahun": 2023,
      "data": 1820.0,
      "simulasi": 1811.6866
    },
    {
      "tahun": 2024,
      "data": 2000.0,
      "simulasi": 2148.1832
    },
    {
      "tahun": 2025,
      "data": 2291.0,
      "simulasi": 2192.5851
    }
  ],
  "tpk_P1": [
    {
      "tahun": 2016,
      "data": 0.3772,
      "simulasi": 0.3573
    },
    {
      "tahun": 2017,
      "data": 0.4508,
      "simulasi": 0.6318
    },
    {
      "tahun": 2018,
      "data": 0.4511,
      "simulasi": 0.56
    },
    {
      "tahun": 2019,
      "data": 0.4534,
      "simulasi": 0.5828
    },
    {
      "tahun": 2020,
      "data": 0.289,
      "simulasi": 0.1612
    },
    {
      "tahun": 2021,
      "data": 0.2748,
      "simulasi": 0.2634
    },
    {
      "tahun": 2022,
      "data": 0.4499,
      "simulasi": 0.3482
    },
    {
      "tahun": 2023,
      "data": 0.4477,
      "simulasi": 0.4321
    },
    {
      "tahun": 2024,
      "data": 0.4217,
      "simulasi": 0.3671
    },
    {
      "tahun": 2025,
      "data": 0.3807,
      "simulasi": 0.3738
    }
  ],
  "jumlah_hotel_dan_akomodasi_P1b": [
    {
      "tahun": 2016,
      "data": 1170.0,
      "simulasi": 1170.0
    },
    {
      "tahun": 2017,
      "data": 1179.0,
      "simulasi": 1201.5685
    },
    {
      "tahun": 2018,
      "data": 1617.0,
      "simulasi": 1265.9311
    },
    {
      "tahun": 2019,
      "data": 1817.0,
      "simulasi": 1613.3273
    },
    {
      "tahun": 2020,
      "data": 1848.0,
      "simulasi": 2122.3255
    },
    {
      "tahun": 2021,
      "data": 1696.0,
      "simulasi": 2016.2092
    },
    {
      "tahun": 2022,
      "data": 1818.0,
      "simulasi": 1915.3987
    },
    {
      "tahun": 2023,
      "data": 1820.0,
      "simulasi": 1902.6886
    },
    {
      "tahun": 2024,
      "data": 2000.0,
      "simulasi": 2242.0024
    },
    {
      "tahun": 2025,
      "data": 2291.0,
      "simulasi": 2152.0723
    }
  ],
  "tpk_P1b": [
    {
      "tahun": 2016,
      "data": 0.3772,
      "simulasi": 0.3791
    },
    {
      "tahun": 2017,
      "data": 0.4508,
      "simulasi": 0.6002
    },
    {
      "tahun": 2018,
      "data": 0.4511,
      "simulasi": 0.5873
    },
    {
      "tahun": 2019,
      "data": 0.4534,
      "simulasi": 0.6187
    },
    {
      "tahun": 2020,
      "data": 0.289,
      "simulasi": 0.1666
    },
    {
      "tahun": 2021,
      "data": 0.2748,
      "simulasi": 0.2651
    },
    {
      "tahun": 2022,
      "data": 0.4499,
      "simulasi": 0.3524
    },
    {
      "tahun": 2023,
      "data": 0.4477,
      "simulasi": 0.4348
    },
    {
      "tahun": 2024,
      "data": 0.4217,
      "simulasi": 0.2885
    },
    {
      "tahun": 2025,
      "data": 0.3807,
      "simulasi": 0.3808
    }
  ],
  "lahan_terbangun_P4": [
    {
      "tahun": 2016,
      "data": 44561.0785,
      "simulasi": 44561.1
    },
    {
      "tahun": 2017,
      "data": 50223.957,
      "simulasi": 46243.3506
    },
    {
      "tahun": 2018,
      "data": 56624.3602,
      "simulasi": 47983.4958
    },
    {
      "tahun": 2019,
      "data": 63480.0442,
      "simulasi": 49803.4949
    },
    {
      "tahun": 2020,
      "data": 58962.0411,
      "simulasi": 51694.6461
    },
    {
      "tahun": 2021,
      "data": 59887.526,
      "simulasi": 53586.6044
    },
    {
      "tahun": 2022,
      "data": 57709.0758,
      "simulasi": 55535.5267
    },
    {
      "tahun": 2023,
      "data": 75624.4035,
      "simulasi": 57545.9472
    },
    {
      "tahun": 2024,
      "data": 73511.5747,
      "simulasi": 59650.8882
    },
    {
      "tahun": 2025,
      "data": 55029.5353,
      "simulasi": 61783.8371
    }
  ],
  "jumlah_wisatawan_P5": [
    {
      "tahun": 2016,
      "data": 15066309.46,
      "simulasi": 15066300.0
    },
    {
      "tahun": 2017,
      "data": 15280457.17,
      "simulasi": 16035938.3225
    },
    {
      "tahun": 2018,
      "data": 18390971.16,
      "simulasi": 17083672.5718
    },
    {
      "tahun": 2019,
      "data": 20520104,
      "simulasi": 18189706.0616
    },
    {
      "tahun": 2020,
      "data": 19610135,
      "simulasi": 19372947.8765
    },
    {
      "tahun": 2021,
      "data": 22849394.5,
      "simulasi": 20625667.3573
    },
    {
      "tahun": 2022,
      "data": 25755726,
      "simulasi": 21916718.0779
    },
    {
      "tahun": 2023,
      "data": 30542580,
      "simulasi": 23352880.3285
    },
    {
      "tahun": 2024,
      "data": 38134536,
      "simulasi": 24844347.8118
    },
    {
      "tahun": 2025,
      "data": 40695654,
      "simulasi": 26512892.8042
    }
  ]
};

export interface KondisiEkstremRow {
  kode: string; subsistem: string; parameter: string; hipotesis: string;
  wisatawanJuta: number; hotel: number; odtw: number; tkRibu: number; lahanHa: number;
  tpkMaks: number; rasioPermintaanMaks: number; rasioDayaDukungMin: number;
  dayaTarikMin: number; dayaTarikMaks: number; status: string;
}
export const ujiKondisiEkstrem: KondisiEkstremRow[] = [
  {
    "kode": "E01",
    "subsistem": "Wisatawan",
    "parameter": "Laju Pertumbuhan Eksternal = 0",
    "hipotesis": "Tanpa kedatangan: wisatawan turun eksponensial mendekati nol tanpa nilai negatif; Daya Tarik tidak boleh melonjak di atas kondisi tahun dasar.",
    "wisatawanJuta": 0.1198,
    "hotel": 683.0694,
    "odtw": 149.4826,
    "tkRibu": 175.7146,
    "lahanHa": 121225.558,
    "tpkMaks": 0.3576,
    "rasioPermintaanMaks": 0.3576,
    "rasioDayaDukungMin": 0.6176,
    "dayaTarikMin": 0.9028,
    "dayaTarikMaks": 1.0005,
    "status": "LOLOS"
  },
  {
    "kode": "E02",
    "subsistem": "Wisatawan",
    "parameter": "Laju Penurunan Dasar = 0",
    "hipotesis": "Tanpa penurunan: wisatawan tidak pernah turun; rem daya tarik tetap bekerja menurunkan Daya Tarik di bawah 1.",
    "wisatawanJuta": 6343.7166,
    "hotel": 254955.8741,
    "odtw": 5179.2494,
    "tkRibu": 35985.5562,
    "lahanHa": 148742.3703,
    "tpkMaks": 0.511,
    "rasioPermintaanMaks": 0.511,
    "rasioDayaDukungMin": 0.5308,
    "dayaTarikMin": 0.7575,
    "dayaTarikMaks": 1.0,
    "status": "LOLOS DENGAN CATATAN"
  },
  {
    "kode": "E03",
    "subsistem": "Ekonomi",
    "parameter": "Pengeluaran per Kunjungan = 0",
    "hipotesis": "Tanpa belanja wisatawan: PDRB dan investasi nol; konstruksi akomodasi berhenti; akomodasi, ODTW, dan tenaga kerja menurun; TPK naik tetapi tidak melebihi 1.",
    "wisatawanJuta": 71.5567,
    "hotel": 635.4995,
    "odtw": 134.3385,
    "tkRibu": 170.443,
    "lahanHa": 121169.4443,
    "tpkMaks": 1,
    "rasioPermintaanMaks": 2.267,
    "rasioDayaDukungMin": 0.6178,
    "dayaTarikMin": 0.7404,
    "dayaTarikMaks": 1.0,
    "status": "LOLOS"
  },
  {
    "kode": "E04",
    "subsistem": "Hotel",
    "parameter": "Rasio Investasi terhadap PDRB = 0",
    "hipotesis": "Tanpa investasi: konstruksi akomodasi berhenti dan jumlah akomodasi turun; TPK naik tetapi tidak melebihi 1; PDRB tetap tumbuh karena wisatawan masih berbelanja.",
    "wisatawanJuta": 71.5567,
    "hotel": 635.4995,
    "odtw": 134.3385,
    "tkRibu": 493.4198,
    "lahanHa": 121169.4443,
    "tpkMaks": 1,
    "rasioPermintaanMaks": 2.267,
    "rasioDayaDukungMin": 0.6178,
    "dayaTarikMin": 0.7404,
    "dayaTarikMaks": 1.0,
    "status": "LOLOS"
  },
  {
    "kode": "E05",
    "subsistem": "Hotel",
    "parameter": "Laju Demolisi Dasar = 0",
    "hipotesis": "Tanpa demolisi: jumlah akomodasi tidak pernah turun dan lebih tinggi dari simulasi dasar.",
    "wisatawanJuta": 96.2681,
    "hotel": 6357.0879,
    "odtw": 367.3126,
    "tkRibu": 650.7878,
    "lahanHa": 121826.4855,
    "tpkMaks": 0.3577,
    "rasioPermintaanMaks": 0.3577,
    "rasioDayaDukungMin": 0.6157,
    "dayaTarikMin": 0.8135,
    "dayaTarikMaks": 1.0,
    "status": "LOLOS"
  },
  {
    "kode": "E06",
    "subsistem": "Hotel",
    "parameter": "TPK Ambang = 1",
    "hipotesis": "Ambang setinggi kapasitas penuh: konstruksi berhenti selama permintaan belum melampaui kapasitas, dan aktif kembali bila permintaan melebihi 100% kapasitas (hipotesis revisi setelah perbaikan A).",
    "wisatawanJuta": 96.3533,
    "hotel": 1820.8554,
    "odtw": 367.4206,
    "tkRibu": 651.3292,
    "lahanHa": 121519.2778,
    "tpkMaks": 1,
    "rasioPermintaanMaks": 1.0853,
    "rasioDayaDukungMin": 0.6167,
    "dayaTarikMin": 0.8137,
    "dayaTarikMaks": 1.0,
    "status": "LOLOS"
  },
  {
    "kode": "E07",
    "subsistem": "Hotel",
    "parameter": "Proporsi Wisatawan Menginap = 0",
    "hipotesis": "Tanpa wisatawan menginap: TPK dan Rasio Permintaan nol; konstruksi berhenti; akomodasi turun hanya karena demolisi.",
    "wisatawanJuta": 96.3756,
    "hotel": 635.4995,
    "odtw": 367.4367,
    "tkRibu": 651.4589,
    "lahanHa": 121366.4233,
    "tpkMaks": 0,
    "rasioPermintaanMaks": 0,
    "rasioDayaDukungMin": 0.6172,
    "dayaTarikMin": 0.8138,
    "dayaTarikMaks": 1.0,
    "status": "LOLOS"
  },
  {
    "kode": "E08",
    "subsistem": "ODTW",
    "parameter": "Sensitivitas ODTW terhadap Investasi = 0; Laju Pembangunan ODTW Non Investasi = 0",
    "hipotesis": "Tanpa pembangunan ODTW: jumlah ODTW turun eksponensial; Daya Tarik turun; wisatawan memuncak lalu menurun.",
    "wisatawanJuta": 59.6239,
    "hotel": 3667.11,
    "odtw": 55.8541,
    "tkRibu": 416.0401,
    "lahanHa": 121719.0782,
    "tpkMaks": 0.3858,
    "rasioPermintaanMaks": 0.3858,
    "rasioDayaDukungMin": 0.6161,
    "dayaTarikMin": 0.6977,
    "dayaTarikMaks": 1.0,
    "status": "LOLOS"
  },
  {
    "kode": "E09",
    "subsistem": "Lahan",
    "parameter": "Laju Konversi Dasar = 0.436052",
    "hipotesis": "Konversi non-pariwisata 10x: lahan terbangun mendekati tetapi tidak melebihi luas wilayah; Rasio Daya Dukung Lahan tidak negatif; konversi pariwisata berhenti saat lahan habis.",
    "wisatawanJuta": 47.4041,
    "hotel": 2846.1244,
    "odtw": 285.6934,
    "tkRibu": 326.9127,
    "lahanHa": 317033.1728,
    "tpkMaks": 0.3832,
    "rasioPermintaanMaks": 0.3832,
    "rasioDayaDukungMin": 0.0,
    "dayaTarikMin": 0.7148,
    "dayaTarikMaks": 1.0,
    "status": "LOLOS"
  },
  {
    "kode": "E10",
    "subsistem": "Lahan",
    "parameter": "Kebijakan Konservasi Lahan = 1",
    "hipotesis": "Konservasi penuh: konversi lahan pariwisata nol; konversi non-pariwisata tetap berjalan.",
    "wisatawanJuta": 96.4331,
    "hotel": 5414.7927,
    "odtw": 367.4996,
    "tkRibu": 651.8139,
    "lahanHa": 121093.5907,
    "tpkMaks": 0.3884,
    "rasioPermintaanMaks": 0.3884,
    "rasioDayaDukungMin": 0.618,
    "dayaTarikMin": 0.814,
    "dayaTarikMaks": 1.0,
    "status": "LOLOS"
  },
  {
    "kode": "E11",
    "subsistem": "Lahan",
    "parameter": "Lahan Per Hotel dan Akomodasi = 0; Lahan Per ODTW = 0",
    "hipotesis": "Tanpa kebutuhan lahan: konversi lahan pariwisata nol; hasil setara dengan E10.",
    "wisatawanJuta": 96.4331,
    "hotel": 5414.7927,
    "odtw": 367.4996,
    "tkRibu": 651.8139,
    "lahanHa": 121093.5907,
    "tpkMaks": 0.3884,
    "rasioPermintaanMaks": 0.3884,
    "rasioDayaDukungMin": 0.618,
    "dayaTarikMin": 0.814,
    "dayaTarikMaks": 1.0,
    "status": "LOLOS"
  },
  {
    "kode": "E12",
    "subsistem": "Tenaga Kerja",
    "parameter": "Laju Kenaikan Produktivitas = 0",
    "hipotesis": "Produktivitas tetap: intensitas tenaga kerja konstan sehingga tenaga kerja tumbuh sebanding PDRB dan lebih tinggi dari simulasi dasar; variabel lain tidak berubah.",
    "wisatawanJuta": 96.1972,
    "hotel": 5404.3699,
    "odtw": 367.2417,
    "tkRibu": 847.2626,
    "lahanHa": 122207.6209,
    "tpkMaks": 0.3884,
    "rasioPermintaanMaks": 0.3884,
    "rasioDayaDukungMin": 0.6145,
    "dayaTarikMin": 0.8132,
    "dayaTarikMaks": 1.0,
    "status": "LOLOS"
  },
  {
    "kode": "E13",
    "subsistem": "Tenaga Kerja",
    "parameter": "Laju Keluar Dasar Tenaga Kerja = 0",
    "hipotesis": "Tanpa pekerja keluar: tenaga kerja tetap mengikuti kebutuhan dan tidak menumpuk; laju penyerapan menurun karena tidak perlu mengganti pekerja yang keluar.",
    "wisatawanJuta": 96.1972,
    "hotel": 5404.3699,
    "odtw": 367.2417,
    "tkRibu": 650.3552,
    "lahanHa": 122207.6209,
    "tpkMaks": 0.3884,
    "rasioPermintaanMaks": 0.3884,
    "rasioDayaDukungMin": 0.6145,
    "dayaTarikMin": 0.8132,
    "dayaTarikMaks": 1.0,
    "status": "LOLOS"
  },
  {
    "kode": "E14",
    "subsistem": "Kebijakan",
    "parameter": "Insentif Kebijakan = 5",
    "hipotesis": "Insentif sangat besar: konstruksi melonjak, okupansi turun, lalu konstruksi melambat sendiri (loop balancing okupansi); Daya Tarik tidak lepas kendali.",
    "wisatawanJuta": 166.5918,
    "hotel": 11354.6487,
    "odtw": 2143.4705,
    "tkRibu": 1108.3407,
    "lahanHa": 124478.0446,
    "tpkMaks": 0.3576,
    "rasioPermintaanMaks": 0.3576,
    "rasioDayaDukungMin": 0.6074,
    "dayaTarikMin": 0.8692,
    "dayaTarikMaks": 1.0022,
    "status": "LOLOS"
  },
  {
    "kode": "E15",
    "subsistem": "Wisatawan",
    "parameter": "Laju Pertumbuhan Eksternal = 0.83178; TIME STEP = 0.25",
    "hipotesis": "Permintaan eksternal 3x: seluruh rem struktural bekerja (Daya Tarik menuju batas bawah, lahan tidak melebihi luas wilayah, okupansi tidak melebihi 100%).",
    "wisatawanJuta": 581801.4867,
    "hotel": 21542004.4999,
    "odtw": 353869.678,
    "tkRibu": 3096262.4624,
    "lahanHa": 317035.8176,
    "tpkMaks": 0.633,
    "rasioPermintaanMaks": 0.633,
    "rasioDayaDukungMin": 0.0,
    "dayaTarikMin": 0.6,
    "dayaTarikMaks": 1.0,
    "status": "LOLOS DENGAN CATATAN"
  },
  {
    "kode": "E16",
    "subsistem": "ODTW",
    "parameter": "Laju Penutupan Dasar ODTW = 0",
    "hipotesis": "Tanpa penutupan ODTW: jumlah ODTW naik monoton dan lebih tinggi dari simulasi dasar; Daya Tarik lebih tinggi sehingga wisatawan juga lebih banyak.",
    "wisatawanJuta": 127.7757,
    "hotel": 6829.2392,
    "odtw": 754.6626,
    "tkRibu": 846.3483,
    "lahanHa": 122397.1566,
    "tpkMaks": 0.3908,
    "rasioPermintaanMaks": 0.3908,
    "rasioDayaDukungMin": 0.6139,
    "dayaTarikMin": 0.892,
    "dayaTarikMaks": 1.0,
    "status": "LOLOS"
  },
  {
    "kode": "E17",
    "subsistem": "Lahan",
    "parameter": "Laju Konversi Dasar = 0",
    "hipotesis": "Tanpa konversi non-pariwisata: lahan terbangun hanya bertambah dari konversi pariwisata sehingga naik sangat lambat; Rasio Daya Dukung Lahan hampir tidak berubah.",
    "wisatawanJuta": 111.3873,
    "hotel": 6069.8103,
    "odtw": 383.5702,
    "tkRibu": 743.619,
    "lahanHa": 56160.8838,
    "tpkMaks": 0.3892,
    "rasioPermintaanMaks": 0.3892,
    "rasioDayaDukungMin": 0.8229,
    "dayaTarikMin": 0.8624,
    "dayaTarikMaks": 1.0,
    "status": "LOLOS"
  }
];

export interface DiagnostikE15Row {
  kondisi: string; lahanMaksHa: number; selisih317036: number; rddlMin: number;
  konversiPariwisata2049: number; statusAturanLahan: string;
}
export const diagnostikE15: DiagnostikE15Row[] = [
  {
    "kondisi": "E15 (LPE 0,83178), TIME STEP 1",
    "lahanMaksHa": 317093.7049,
    "selisih317036": 57.7049,
    "rddlMin": 0,
    "konversiPariwisata2049": 823.5116,
    "statusAturanLahan": "Dilanggar"
  },
  {
    "kondisi": "E15 (LPE 0,83178), TIME STEP 0,5",
    "lahanMaksHa": 317036.0126,
    "selisih317036": 0.0126,
    "rddlMin": 0,
    "konversiPariwisata2049": 88.2938,
    "statusAturanLahan": "Dilanggar"
  },
  {
    "kondisi": "E15 (LPE 0,83178), TIME STEP 0,25  <-- hasil resmi",
    "lahanMaksHa": 317035.8176,
    "selisih317036": -0.1824,
    "rddlMin": 0.0,
    "konversiPariwisata2049": 29.7885,
    "statusAturanLahan": "Lolos"
  },
  {
    "kondisi": "E15 (LPE 0,83178), TIME STEP 0,125",
    "lahanMaksHa": 317035.8764,
    "selisih317036": -0.1236,
    "rddlMin": 0.0,
    "konversiPariwisata2049": 17.2572,
    "statusAturanLahan": "Lolos"
  },
  {
    "kondisi": "E15 nilai lama (LPE 0,8059), TIME STEP 1",
    "lahanMaksHa": 316213.8913,
    "selisih317036": -822.1087,
    "rddlMin": 0.0026,
    "konversiPariwisata2049": 3796.0027,
    "statusAturanLahan": "Lolos"
  }
];

export interface Horizon2150Row {
  tahun: number; jumlahWisatawan: number; dayaTarik: number; tpk: number; rasioDayaDukungLahan: number;
  lahanTerbangun: number; jumlahHotel: number; jumlahOdtw: number; tenagaKerja: number; pdrb: number; investasi: number;
}
export const horizon2150: Horizon2150Row[] = [
  {
    "tahun": 2050,
    "jumlahWisatawan": 96197154.2126,
    "dayaTarik": 0.8132,
    "tpk": 0.3584,
    "rasioDayaDukungLahan": 0.6145,
    "lahanTerbangun": 122207.6209,
    "jumlahHotel": 5404.3699,
    "jumlahOdtw": 367.2417,
    "tenagaKerja": 650355.2026,
    "pdrb": 40061.0961,
    "investasi": 1955.6786
  },
  {
    "tahun": 2075,
    "jumlahWisatawan": 122225381.2074,
    "dayaTarik": 0.7577,
    "tpk": 0.3422,
    "rasioDayaDukungLahan": 0.3464,
    "lahanTerbangun": 207210.3554,
    "jumlahHotel": 7191.1482,
    "jumlahOdtw": 534.3921,
    "tenagaKerja": 637138.5034,
    "pdrb": 50900.4947,
    "investasi": 2484.8298
  },
  {
    "tahun": 2100,
    "jumlahWisatawan": 113791822.7256,
    "dayaTarik": 0.7246,
    "tpk": 0.3315,
    "rasioDayaDukungLahan": 0.1488,
    "lahanTerbangun": 269864.0094,
    "jumlahHotel": 6910.0635,
    "jumlahOdtw": 596.6782,
    "tenagaKerja": 454615.3943,
    "pdrb": 47388.3576,
    "investasi": 2313.3764
  },
  {
    "tahun": 2125,
    "jumlahWisatawan": 91298991.709,
    "dayaTarik": 0.7152,
    "tpk": 0.3278,
    "rasioDayaDukungLahan": 0.0543,
    "lahanTerbangun": 299836.5315,
    "jumlahHotel": 5607.7523,
    "jumlahOdtw": 556.0468,
    "tenagaKerja": 277704.9031,
    "pdrb": 38021.267,
    "investasi": 1856.0994
  },
  {
    "tahun": 2150,
    "jumlahWisatawan": 72648506.1376,
    "dayaTarik": 0.7209,
    "tpk": 0.3291,
    "rasioDayaDukungLahan": 0.0184,
    "lahanTerbangun": 311189.5468,
    "jumlahHotel": 4444.1945,
    "jumlahOdtw": 479.7727,
    "tenagaKerja": 167510.7197,
    "pdrb": 30254.3127,
    "investasi": 1476.9369
  }
];
export const horizon2150Keterangan: Record<string, number> = {
  "Puncak Jumlah Wisatawan (juta)": 122.9353,
  "Tahun puncak": 2080,
  "Lahan Terbangun maksimum (ha)": 311189.5468,
  "TPK maksimum": 0.3884,
  "Daya Tarik minimum": 0.7152
};

export interface TornadoRow {
  parameter: string;
  wisatawanMin10: number; wisatawanPlus10: number; wisatawanMaks: number;
  lahanMin10: number; lahanPlus10: number; lahanMaks: number;
  pdrbMin10: number; pdrbPlus10: number; pdrbMaks: number;
  hotelMin10: number; hotelPlus10: number; hotelMaks: number;
  tkMin10: number; tkPlus10: number; tkMaks: number;
  odtwMin10: number; odtwPlus10: number; odtwMaks: number;
  peringkatWisatawan: number;
}
export const peringkatTornadoTop: TornadoRow[] = [
  {
    "parameter": "Laju Penurunan Dasar",
    "wisatawanMin10": 42.0739,
    "wisatawanPlus10": -26.93,
    "wisatawanMaks": 42.0739,
    "lahanMin10": 0.2626,
    "lahanPlus10": -0.1901,
    "lahanMaks": 0.2626,
    "pdrbMin10": 42.0739,
    "pdrbPlus10": -26.93,
    "pdrbMaks": 42.0739,
    "hotelMin10": 36.9961,
    "hotelPlus10": -24.7308,
    "hotelMaks": 36.9961,
    "tkMin10": 40.0654,
    "tkPlus10": -26.1573,
    "tkMaks": 40.0654,
    "odtwMin10": 16.6496,
    "odtwPlus10": -12.0858,
    "odtwMaks": 16.6496,
    "peringkatWisatawan": 1
  },
  {
    "parameter": "Bobot ODTW",
    "wisatawanMin10": -17.1991,
    "wisatawanPlus10": 22.7898,
    "wisatawanMaks": 22.7898,
    "lahanMin10": -0.1156,
    "lahanPlus10": 0.1412,
    "lahanMaks": 0.1412,
    "pdrbMin10": -17.1991,
    "pdrbPlus10": 22.7898,
    "pdrbMaks": 22.7898,
    "hotelMin10": -15.5297,
    "hotelPlus10": 19.9675,
    "hotelMaks": 19.9675,
    "tkMin10": -16.5943,
    "tkPlus10": 21.6846,
    "tkMaks": 21.6846,
    "odtwMin10": -7.3553,
    "odtwPlus10": 8.9583,
    "odtwMaks": 8.9583,
    "peringkatWisatawan": 2
  },
  {
    "parameter": "Rasio Daya Dukung Lahan Referensi",
    "wisatawanMin10": 11.4771,
    "wisatawanPlus10": -8.2214,
    "wisatawanMaks": 11.4771,
    "lahanMin10": 0.1883,
    "lahanPlus10": -0.1358,
    "lahanMaks": 0.1883,
    "pdrbMin10": 11.4771,
    "pdrbPlus10": -8.2214,
    "pdrbMaks": 11.4771,
    "hotelMin10": 10.4614,
    "hotelPlus10": -7.5837,
    "hotelMaks": 10.4614,
    "tkMin10": 11.1041,
    "tkPlus10": -7.9952,
    "tkMaks": 11.1041,
    "odtwMin10": 4.9972,
    "odtwPlus10": -3.709,
    "odtwMaks": 4.9972,
    "peringkatWisatawan": 3
  },
  {
    "parameter": "Bobot Daya Dukung Lahan",
    "wisatawanMin10": -9.0096,
    "wisatawanPlus10": 10.2842,
    "wisatawanMaks": 10.2842,
    "lahanMin10": -0.0641,
    "lahanPlus10": 0.0706,
    "lahanMaks": 0.0706,
    "pdrbMin10": -9.0096,
    "pdrbPlus10": 10.2842,
    "pdrbMaks": 10.2842,
    "hotelMin10": -8.3128,
    "hotelPlus10": 9.3762,
    "hotelMaks": 9.3762,
    "tkMin10": -8.7627,
    "tkPlus10": 9.951,
    "tkMaks": 9.951,
    "odtwMin10": -4.0679,
    "odtwPlus10": 4.4818,
    "odtwMaks": 4.4818,
    "peringkatWisatawan": 4
  },
  {
    "parameter": "Bobot Kepadatan",
    "wisatawanMin10": -8.9044,
    "wisatawanPlus10": 9.0699,
    "wisatawanMaks": 9.0699,
    "lahanMin10": -0.0678,
    "lahanPlus10": 0.0685,
    "lahanMaks": 0.0685,
    "pdrbMin10": -8.9044,
    "pdrbPlus10": 9.0699,
    "pdrbMaks": 9.0699,
    "hotelMin10": -8.3511,
    "hotelPlus10": 8.4781,
    "hotelMaks": 8.4781,
    "tkMin10": -8.7061,
    "tkPlus10": 8.8533,
    "tkMaks": 8.8533,
    "odtwMin10": -4.2753,
    "odtwPlus10": 4.3151,
    "odtwMaks": 4.3151,
    "peringkatWisatawan": 5
  },
  {
    "parameter": "Kepadatan Referensi",
    "wisatawanMin10": -8.9044,
    "wisatawanPlus10": 8.6055,
    "wisatawanMaks": 8.9044,
    "lahanMin10": -0.0678,
    "lahanPlus10": 0.062,
    "lahanMaks": 0.0678,
    "pdrbMin10": -8.9044,
    "pdrbPlus10": 8.6055,
    "pdrbMaks": 8.9044,
    "hotelMin10": -8.3511,
    "hotelPlus10": 7.9991,
    "hotelMaks": 8.3511,
    "tkMin10": -8.7061,
    "tkPlus10": 8.3849,
    "tkMaks": 8.7061,
    "odtwMin10": -4.2753,
    "odtwPlus10": 3.9545,
    "odtwMaks": 4.2753,
    "peringkatWisatawan": 6
  },
  {
    "parameter": "ODTW Referensi",
    "wisatawanMin10": 6.6189,
    "wisatawanPlus10": -5.3371,
    "wisatawanMaks": 6.6189,
    "lahanMin10": 0.0422,
    "lahanPlus10": -0.0349,
    "lahanMaks": 0.0422,
    "pdrbMin10": 6.6189,
    "pdrbPlus10": -5.3371,
    "pdrbMaks": 6.6189,
    "hotelMin10": 5.8636,
    "hotelPlus10": -4.7712,
    "hotelMaks": 5.8636,
    "tkMin10": 6.3312,
    "tkPlus10": -5.1265,
    "tkMaks": 6.3312,
    "odtwMin10": 2.6829,
    "odtwPlus10": -2.219,
    "odtwMaks": 2.6829,
    "peringkatWisatawan": 7
  },
  {
    "parameter": "Laju Pertumbuhan Eksternal",
    "wisatawanMin10": -5.0584,
    "wisatawanPlus10": 4.9879,
    "wisatawanMaks": 5.0584,
    "lahanMin10": -0.0413,
    "lahanPlus10": 0.0406,
    "lahanMaks": 0.0413,
    "pdrbMin10": -5.0584,
    "pdrbPlus10": 4.9879,
    "pdrbMaks": 5.0584,
    "hotelMin10": -4.8548,
    "hotelPlus10": 4.7745,
    "hotelMaks": 4.8548,
    "tkMin10": -4.9894,
    "tkPlus10": 4.9137,
    "tkMaks": 4.9894,
    "odtwMin10": -2.5914,
    "odtwPlus10": 2.5447,
    "odtwMaks": 2.5914,
    "peringkatWisatawan": 8
  },
  {
    "parameter": "Sensitivitas ODTW terhadap Investasi",
    "wisatawanMin10": -2.5602,
    "wisatawanPlus10": 2.5677,
    "wisatawanMaks": 2.5677,
    "lahanMin10": -0.0287,
    "lahanPlus10": 0.029,
    "lahanMaks": 0.029,
    "pdrbMin10": -2.5602,
    "pdrbPlus10": 2.5677,
    "pdrbMaks": 2.5677,
    "hotelMin10": -2.117,
    "hotelPlus10": 2.1168,
    "hotelMaks": 2.117,
    "tkMin10": -2.3906,
    "tkPlus10": 2.3929,
    "tkMaks": 2.3929,
    "odtwMin10": -7.0862,
    "odtwPlus10": 7.2471,
    "odtwMaks": 7.2471,
    "peringkatWisatawan": 9
  },
  {
    "parameter": "Rasio Nilai Tambah Pariwisata",
    "wisatawanMin10": -2.5541,
    "wisatawanPlus10": 2.5617,
    "wisatawanMaks": 2.5617,
    "lahanMin10": -0.0485,
    "lahanPlus10": 0.0471,
    "lahanMaks": 0.0485,
    "pdrbMin10": -12.2987,
    "pdrbPlus10": 12.8179,
    "pdrbMaks": 12.8179,
    "hotelMin10": -4.1054,
    "hotelPlus10": 3.971,
    "hotelMaks": 4.1054,
    "tkMin10": -12.1464,
    "tkPlus10": 12.6261,
    "tkMaks": 12.6261,
    "odtwMin10": -7.0844,
    "odtwPlus10": 7.2451,
    "odtwMaks": 7.2451,
    "peringkatWisatawan": 11
  }
];
export const peringkatTornadoAll: TornadoRow[] = [
  {
    "parameter": "Laju Penurunan Dasar",
    "wisatawanMin10": 42.0739,
    "wisatawanPlus10": -26.93,
    "wisatawanMaks": 42.0739,
    "lahanMin10": 0.2626,
    "lahanPlus10": -0.1901,
    "lahanMaks": 0.2626,
    "pdrbMin10": 42.0739,
    "pdrbPlus10": -26.93,
    "pdrbMaks": 42.0739,
    "hotelMin10": 36.9961,
    "hotelPlus10": -24.7308,
    "hotelMaks": 36.9961,
    "tkMin10": 40.0654,
    "tkPlus10": -26.1573,
    "tkMaks": 40.0654,
    "odtwMin10": 16.6496,
    "odtwPlus10": -12.0858,
    "odtwMaks": 16.6496,
    "peringkatWisatawan": 1
  },
  {
    "parameter": "Bobot ODTW",
    "wisatawanMin10": -17.1991,
    "wisatawanPlus10": 22.7898,
    "wisatawanMaks": 22.7898,
    "lahanMin10": -0.1156,
    "lahanPlus10": 0.1412,
    "lahanMaks": 0.1412,
    "pdrbMin10": -17.1991,
    "pdrbPlus10": 22.7898,
    "pdrbMaks": 22.7898,
    "hotelMin10": -15.5297,
    "hotelPlus10": 19.9675,
    "hotelMaks": 19.9675,
    "tkMin10": -16.5943,
    "tkPlus10": 21.6846,
    "tkMaks": 21.6846,
    "odtwMin10": -7.3553,
    "odtwPlus10": 8.9583,
    "odtwMaks": 8.9583,
    "peringkatWisatawan": 2
  },
  {
    "parameter": "Rasio Daya Dukung Lahan Referensi",
    "wisatawanMin10": 11.4771,
    "wisatawanPlus10": -8.2214,
    "wisatawanMaks": 11.4771,
    "lahanMin10": 0.1883,
    "lahanPlus10": -0.1358,
    "lahanMaks": 0.1883,
    "pdrbMin10": 11.4771,
    "pdrbPlus10": -8.2214,
    "pdrbMaks": 11.4771,
    "hotelMin10": 10.4614,
    "hotelPlus10": -7.5837,
    "hotelMaks": 10.4614,
    "tkMin10": 11.1041,
    "tkPlus10": -7.9952,
    "tkMaks": 11.1041,
    "odtwMin10": 4.9972,
    "odtwPlus10": -3.709,
    "odtwMaks": 4.9972,
    "peringkatWisatawan": 3
  },
  {
    "parameter": "Bobot Daya Dukung Lahan",
    "wisatawanMin10": -9.0096,
    "wisatawanPlus10": 10.2842,
    "wisatawanMaks": 10.2842,
    "lahanMin10": -0.0641,
    "lahanPlus10": 0.0706,
    "lahanMaks": 0.0706,
    "pdrbMin10": -9.0096,
    "pdrbPlus10": 10.2842,
    "pdrbMaks": 10.2842,
    "hotelMin10": -8.3128,
    "hotelPlus10": 9.3762,
    "hotelMaks": 9.3762,
    "tkMin10": -8.7627,
    "tkPlus10": 9.951,
    "tkMaks": 9.951,
    "odtwMin10": -4.0679,
    "odtwPlus10": 4.4818,
    "odtwMaks": 4.4818,
    "peringkatWisatawan": 4
  },
  {
    "parameter": "Bobot Kepadatan",
    "wisatawanMin10": -8.9044,
    "wisatawanPlus10": 9.0699,
    "wisatawanMaks": 9.0699,
    "lahanMin10": -0.0678,
    "lahanPlus10": 0.0685,
    "lahanMaks": 0.0685,
    "pdrbMin10": -8.9044,
    "pdrbPlus10": 9.0699,
    "pdrbMaks": 9.0699,
    "hotelMin10": -8.3511,
    "hotelPlus10": 8.4781,
    "hotelMaks": 8.4781,
    "tkMin10": -8.7061,
    "tkPlus10": 8.8533,
    "tkMaks": 8.8533,
    "odtwMin10": -4.2753,
    "odtwPlus10": 4.3151,
    "odtwMaks": 4.3151,
    "peringkatWisatawan": 5
  },
  {
    "parameter": "Kepadatan Referensi",
    "wisatawanMin10": -8.9044,
    "wisatawanPlus10": 8.6055,
    "wisatawanMaks": 8.9044,
    "lahanMin10": -0.0678,
    "lahanPlus10": 0.062,
    "lahanMaks": 0.0678,
    "pdrbMin10": -8.9044,
    "pdrbPlus10": 8.6055,
    "pdrbMaks": 8.9044,
    "hotelMin10": -8.3511,
    "hotelPlus10": 7.9991,
    "hotelMaks": 8.3511,
    "tkMin10": -8.7061,
    "tkPlus10": 8.3849,
    "tkMaks": 8.7061,
    "odtwMin10": -4.2753,
    "odtwPlus10": 3.9545,
    "odtwMaks": 4.2753,
    "peringkatWisatawan": 6
  },
  {
    "parameter": "ODTW Referensi",
    "wisatawanMin10": 6.6189,
    "wisatawanPlus10": -5.3371,
    "wisatawanMaks": 6.6189,
    "lahanMin10": 0.0422,
    "lahanPlus10": -0.0349,
    "lahanMaks": 0.0422,
    "pdrbMin10": 6.6189,
    "pdrbPlus10": -5.3371,
    "pdrbMaks": 6.6189,
    "hotelMin10": 5.8636,
    "hotelPlus10": -4.7712,
    "hotelMaks": 5.8636,
    "tkMin10": 6.3312,
    "tkPlus10": -5.1265,
    "tkMaks": 6.3312,
    "odtwMin10": 2.6829,
    "odtwPlus10": -2.219,
    "odtwMaks": 2.6829,
    "peringkatWisatawan": 7
  },
  {
    "parameter": "Laju Pertumbuhan Eksternal",
    "wisatawanMin10": -5.0584,
    "wisatawanPlus10": 4.9879,
    "wisatawanMaks": 5.0584,
    "lahanMin10": -0.0413,
    "lahanPlus10": 0.0406,
    "lahanMaks": 0.0413,
    "pdrbMin10": -5.0584,
    "pdrbPlus10": 4.9879,
    "pdrbMaks": 5.0584,
    "hotelMin10": -4.8548,
    "hotelPlus10": 4.7745,
    "hotelMaks": 4.8548,
    "tkMin10": -4.9894,
    "tkPlus10": 4.9137,
    "tkMaks": 4.9894,
    "odtwMin10": -2.5914,
    "odtwPlus10": 2.5447,
    "odtwMaks": 2.5914,
    "peringkatWisatawan": 8
  },
  {
    "parameter": "Sensitivitas ODTW terhadap Investasi",
    "wisatawanMin10": -2.5602,
    "wisatawanPlus10": 2.5677,
    "wisatawanMaks": 2.5677,
    "lahanMin10": -0.0287,
    "lahanPlus10": 0.029,
    "lahanMaks": 0.029,
    "pdrbMin10": -2.5602,
    "pdrbPlus10": 2.5677,
    "pdrbMaks": 2.5677,
    "hotelMin10": -2.117,
    "hotelPlus10": 2.1168,
    "hotelMaks": 2.117,
    "tkMin10": -2.3906,
    "tkPlus10": 2.3929,
    "tkMaks": 2.3929,
    "odtwMin10": -7.0862,
    "odtwPlus10": 7.2471,
    "odtwMaks": 7.2471,
    "peringkatWisatawan": 9
  },
  {
    "parameter": "Rasio Nilai Tambah Pariwisata",
    "wisatawanMin10": -2.5541,
    "wisatawanPlus10": 2.5617,
    "wisatawanMaks": 2.5617,
    "lahanMin10": -0.0485,
    "lahanPlus10": 0.0471,
    "lahanMaks": 0.0485,
    "pdrbMin10": -12.2987,
    "pdrbPlus10": 12.8179,
    "pdrbMaks": 12.8179,
    "hotelMin10": -4.1054,
    "hotelPlus10": 3.971,
    "hotelMaks": 4.1054,
    "tkMin10": -12.1464,
    "tkPlus10": 12.6261,
    "tkMaks": 12.6261,
    "odtwMin10": -7.0844,
    "odtwPlus10": 7.2451,
    "odtwMaks": 7.2451,
    "peringkatWisatawan": 11
  },
  {
    "parameter": "Rasio Investasi terhadap PDRB",
    "wisatawanMin10": -2.5541,
    "wisatawanPlus10": 2.5617,
    "wisatawanMaks": 2.5617,
    "lahanMin10": -0.0485,
    "lahanPlus10": 0.0471,
    "lahanMaks": 0.0485,
    "pdrbMin10": -2.5541,
    "pdrbPlus10": 2.5617,
    "pdrbMaks": 2.5617,
    "hotelMin10": -4.1054,
    "hotelPlus10": 3.971,
    "hotelMaks": 4.1054,
    "tkMin10": -2.3849,
    "tkPlus10": 2.3873,
    "tkMaks": 2.3873,
    "odtwMin10": -7.0844,
    "odtwPlus10": 7.2451,
    "odtwMaks": 7.2451,
    "peringkatWisatawan": 11
  },
  {
    "parameter": "Pengeluaran per Kunjungan",
    "wisatawanMin10": -2.5541,
    "wisatawanPlus10": 2.5617,
    "wisatawanMaks": 2.5617,
    "lahanMin10": -0.0485,
    "lahanPlus10": 0.0471,
    "lahanMaks": 0.0485,
    "pdrbMin10": -12.2987,
    "pdrbPlus10": 12.8179,
    "pdrbMaks": 12.8179,
    "hotelMin10": -4.1054,
    "hotelPlus10": 3.971,
    "hotelMaks": 4.1054,
    "tkMin10": -12.1464,
    "tkPlus10": 12.6261,
    "tkMaks": 12.6261,
    "odtwMin10": -7.0844,
    "odtwPlus10": 7.2451,
    "odtwMaks": 7.2451,
    "peringkatWisatawan": 11
  },
  {
    "parameter": "Elastisitas Daya Tarik ODTW",
    "wisatawanMin10": -2.0239,
    "wisatawanPlus10": 2.1262,
    "wisatawanMaks": 2.1262,
    "lahanMin10": -0.0094,
    "lahanPlus10": 0.0097,
    "lahanMaks": 0.0097,
    "pdrbMin10": -2.0239,
    "pdrbPlus10": 2.1262,
    "pdrbMaks": 2.1262,
    "hotelMin10": -1.6139,
    "hotelPlus10": 1.684,
    "hotelMaks": 1.684,
    "tkMin10": -1.8624,
    "tkPlus10": 1.9494,
    "tkMaks": 1.9494,
    "odtwMin10": -0.5991,
    "odtwPlus10": 0.6193,
    "odtwMaks": 0.6193,
    "peringkatWisatawan": 13
  },
  {
    "parameter": "Laju Konversi Dasar",
    "wisatawanMin10": 1.6997,
    "wisatawanPlus10": -1.7101,
    "wisatawanMaks": 1.7101,
    "lahanMin10": -6.4721,
    "lahanPlus10": 6.6355,
    "lahanMaks": 6.6355,
    "pdrbMin10": 1.6997,
    "pdrbPlus10": -1.7101,
    "pdrbMaks": 1.7101,
    "hotelMin10": 1.3265,
    "hotelPlus10": -1.3375,
    "hotelMaks": 1.3375,
    "tkMin10": 1.5485,
    "tkPlus10": -1.5607,
    "tkMaks": 1.5607,
    "odtwMin10": 0.4808,
    "odtwPlus10": -0.4862,
    "odtwMaks": 0.4862,
    "peringkatWisatawan": 14
  },
  {
    "parameter": "Luas Lahan Tersedia",
    "wisatawanMin10": -1.3485,
    "wisatawanPlus10": 1.1545,
    "wisatawanMaks": 1.3485,
    "lahanMin10": -2.6765,
    "lahanPlus10": 2.2976,
    "lahanMaks": 2.6765,
    "pdrbMin10": -1.3485,
    "pdrbPlus10": 1.1545,
    "pdrbMaks": 1.3485,
    "hotelMin10": -1.0912,
    "hotelPlus10": 0.9288,
    "hotelMaks": 1.0912,
    "tkMin10": -1.2482,
    "tkPlus10": 1.0656,
    "tkMaks": 1.2482,
    "odtwMin10": -0.4135,
    "odtwPlus10": 0.3493,
    "odtwMaks": 0.4135,
    "peringkatWisatawan": 15
  },
  {
    "parameter": "Laju Pembangunan ODTW Non Investasi",
    "wisatawanMin10": -1.0382,
    "wisatawanPlus10": 1.0351,
    "wisatawanMaks": 1.0382,
    "lahanMin10": -0.0118,
    "lahanPlus10": 0.0118,
    "lahanMaks": 0.0118,
    "pdrbMin10": -1.0382,
    "pdrbPlus10": 1.0351,
    "pdrbMaks": 1.0382,
    "hotelMin10": -0.889,
    "hotelPlus10": 0.8857,
    "hotelMaks": 0.889,
    "tkMin10": -0.9828,
    "tkPlus10": 0.9794,
    "tkMaks": 0.9828,
    "odtwMin10": -2.5021,
    "odtwPlus10": 2.5002,
    "odtwMaks": 2.5021,
    "peringkatWisatawan": 16
  },
  {
    "parameter": "Laju Penutupan Dasar ODTW",
    "wisatawanMin10": -0.1747,
    "wisatawanPlus10": 0.1593,
    "wisatawanMaks": 0.1747,
    "lahanMin10": -0.0168,
    "lahanPlus10": 0.0167,
    "lahanMaks": 0.0168,
    "pdrbMin10": -0.1747,
    "pdrbPlus10": 0.1593,
    "pdrbMaks": 0.1747,
    "hotelMin10": -0.148,
    "hotelPlus10": 0.1359,
    "hotelMaks": 0.148,
    "tkMin10": -0.1654,
    "tkPlus10": 0.1513,
    "tkMaks": 0.1654,
    "odtwMin10": -0.4191,
    "odtwPlus10": 0.3699,
    "odtwMaks": 0.4191,
    "peringkatWisatawan": 17
  },
  {
    "parameter": "Tingkat Penghunian Ganda Kamar",
    "wisatawanMin10": -0.0247,
    "wisatawanPlus10": 0.021,
    "wisatawanMaks": 0.0247,
    "lahanMin10": 0.081,
    "lahanPlus10": -0.0686,
    "lahanMaks": 0.081,
    "pdrbMin10": -0.0247,
    "pdrbPlus10": 0.021,
    "pdrbMaks": 0.0247,
    "hotelMin10": 8.8035,
    "hotelPlus10": -7.4371,
    "hotelMaks": 8.8035,
    "tkMin10": -0.0229,
    "tkPlus10": 0.0194,
    "tkMaks": 0.0229,
    "odtwMin10": -0.0078,
    "odtwPlus10": 0.0066,
    "odtwMaks": 0.0078,
    "peringkatWisatawan": 19
  },
  {
    "parameter": "Malam Tersedia per Kamar",
    "wisatawanMin10": -0.0247,
    "wisatawanPlus10": 0.021,
    "wisatawanMaks": 0.0247,
    "lahanMin10": 0.081,
    "lahanPlus10": -0.0686,
    "lahanMaks": 0.081,
    "pdrbMin10": -0.0247,
    "pdrbPlus10": 0.021,
    "pdrbMaks": 0.0247,
    "hotelMin10": 8.8035,
    "hotelPlus10": -7.4371,
    "hotelMaks": 8.8035,
    "tkMin10": -0.0229,
    "tkPlus10": 0.0194,
    "tkMaks": 0.0229,
    "odtwMin10": -0.0078,
    "odtwPlus10": 0.0066,
    "odtwMaks": 0.0078,
    "peringkatWisatawan": 19
  },
  {
    "parameter": "Rata-rata Kamar per Unit Akomodasi",
    "wisatawanMin10": -0.0247,
    "wisatawanPlus10": 0.021,
    "wisatawanMaks": 0.0247,
    "lahanMin10": 0.081,
    "lahanPlus10": -0.0686,
    "lahanMaks": 0.081,
    "pdrbMin10": -0.0247,
    "pdrbPlus10": 0.021,
    "pdrbMaks": 0.0247,
    "hotelMin10": 8.8035,
    "hotelPlus10": -7.4371,
    "hotelMaks": 8.8035,
    "tkMin10": -0.0229,
    "tkPlus10": 0.0194,
    "tkMaks": 0.0229,
    "odtwMin10": -0.0078,
    "odtwPlus10": 0.0066,
    "odtwMaks": 0.0078,
    "peringkatWisatawan": 19
  },
  {
    "parameter": "Rata-rata Lama Menginap Tamu",
    "wisatawanMin10": 0.0231,
    "wisatawanPlus10": -0.0223,
    "wisatawanMaks": 0.0231,
    "lahanMin10": -0.0756,
    "lahanPlus10": 0.073,
    "lahanMaks": 0.0756,
    "pdrbMin10": 0.0231,
    "pdrbPlus10": -0.0223,
    "pdrbMaks": 0.0231,
    "hotelMin10": -8.1932,
    "hotelPlus10": 7.9365,
    "hotelMaks": 8.1932,
    "tkMin10": 0.0214,
    "tkPlus10": -0.0207,
    "tkMaks": 0.0214,
    "odtwMin10": 0.0073,
    "odtwPlus10": -0.007,
    "odtwMaks": 0.0073,
    "peringkatWisatawan": 21
  },
  {
    "parameter": "Proporsi Wisatawan Menginap",
    "wisatawanMin10": 0.0231,
    "wisatawanPlus10": -0.0223,
    "wisatawanMaks": 0.0231,
    "lahanMin10": -0.0756,
    "lahanPlus10": 0.073,
    "lahanMaks": 0.0756,
    "pdrbMin10": 0.0231,
    "pdrbPlus10": -0.0223,
    "pdrbMaks": 0.0231,
    "hotelMin10": -8.1932,
    "hotelPlus10": 7.9365,
    "hotelMaks": 8.1932,
    "tkMin10": 0.0214,
    "tkPlus10": -0.0207,
    "tkMaks": 0.0214,
    "odtwMin10": 0.0073,
    "odtwPlus10": -0.007,
    "odtwMaks": 0.0073,
    "peringkatWisatawan": 21
  },
  {
    "parameter": "Lahan Per Hotel dan Akomodasi",
    "wisatawanMin10": 0.0185,
    "wisatawanPlus10": -0.0185,
    "wisatawanMaks": 0.0185,
    "lahanMin10": -0.0686,
    "lahanPlus10": 0.0686,
    "lahanMaks": 0.0686,
    "pdrbMin10": 0.0185,
    "pdrbPlus10": -0.0185,
    "pdrbMaks": 0.0185,
    "hotelMin10": 0.0146,
    "hotelPlus10": -0.0146,
    "hotelMaks": 0.0146,
    "tkMin10": 0.0169,
    "tkPlus10": -0.0169,
    "tkMaks": 0.0169,
    "odtwMin10": 0.0053,
    "odtwPlus10": -0.0053,
    "odtwMaks": 0.0053,
    "peringkatWisatawan": 23
  },
  {
    "parameter": "Laju Demolisi Dasar",
    "wisatawanMin10": 0.0094,
    "wisatawanPlus10": -0.0095,
    "wisatawanMaks": 0.0095,
    "lahanMin10": -0.0366,
    "lahanPlus10": 0.0367,
    "lahanMaks": 0.0367,
    "pdrbMin10": 0.0094,
    "pdrbPlus10": -0.0095,
    "pdrbMaks": 0.0095,
    "hotelMin10": 0.5602,
    "hotelPlus10": -0.5107,
    "hotelMaks": 0.5602,
    "tkMin10": 0.0086,
    "tkPlus10": -0.0086,
    "tkMaks": 0.0086,
    "odtwMin10": 0.0026,
    "odtwPlus10": -0.0026,
    "odtwMaks": 0.0026,
    "peringkatWisatawan": 24
  },
  {
    "parameter": "Sensitivitas Konstruksi terhadap TPK",
    "wisatawanMin10": 0.0064,
    "wisatawanPlus10": -0.0057,
    "wisatawanMaks": 0.0064,
    "lahanMin10": -0.0201,
    "lahanPlus10": 0.0178,
    "lahanMaks": 0.0201,
    "pdrbMin10": 0.0064,
    "pdrbPlus10": -0.0057,
    "pdrbMaks": 0.0064,
    "hotelMin10": -2.0522,
    "hotelPlus10": 1.7968,
    "hotelMaks": 2.0522,
    "tkMin10": 0.0059,
    "tkPlus10": -0.0053,
    "tkMaks": 0.0059,
    "odtwMin10": 0.002,
    "odtwPlus10": -0.0018,
    "odtwMaks": 0.002,
    "peringkatWisatawan": 25
  },
  {
    "parameter": "Lahan Per ODTW",
    "wisatawanMin10": 0.0059,
    "wisatawanPlus10": -0.0059,
    "wisatawanMaks": 0.0059,
    "lahanMin10": -0.0222,
    "lahanPlus10": 0.0222,
    "lahanMaks": 0.0222,
    "pdrbMin10": 0.0059,
    "pdrbPlus10": -0.0059,
    "pdrbMaks": 0.0059,
    "hotelMin10": 0.0047,
    "hotelPlus10": -0.0047,
    "hotelMaks": 0.0047,
    "tkMin10": 0.0054,
    "tkPlus10": -0.0054,
    "tkMaks": 0.0054,
    "odtwMin10": 0.0017,
    "odtwPlus10": -0.0017,
    "odtwMaks": 0.0017,
    "peringkatWisatawan": 26
  },
  {
    "parameter": "TPK Ambang",
    "wisatawanMin10": -0.0029,
    "wisatawanPlus10": 0.0055,
    "wisatawanMaks": 0.0055,
    "lahanMin10": 0.012,
    "lahanPlus10": -0.0202,
    "lahanMaks": 0.0202,
    "pdrbMin10": -0.0029,
    "pdrbPlus10": 0.0055,
    "pdrbMaks": 0.0055,
    "hotelMin10": 1.7357,
    "hotelPlus10": -2.5679,
    "hotelMaks": 2.5679,
    "tkMin10": -0.0026,
    "tkPlus10": 0.0051,
    "tkMaks": 0.0051,
    "odtwMin10": -0.0008,
    "odtwPlus10": 0.0016,
    "odtwMaks": 0.0016,
    "peringkatWisatawan": 27
  },
  {
    "parameter": "Batas Maksimum Efek ODTW",
    "wisatawanMin10": 0,
    "wisatawanPlus10": 0,
    "wisatawanMaks": 0,
    "lahanMin10": 0,
    "lahanPlus10": 0,
    "lahanMaks": 0,
    "pdrbMin10": 0,
    "pdrbPlus10": 0,
    "pdrbMaks": 0,
    "hotelMin10": 0,
    "hotelPlus10": 0,
    "hotelMaks": 0,
    "tkMin10": 0,
    "tkPlus10": 0,
    "tkMaks": 0,
    "odtwMin10": 0,
    "odtwPlus10": 0,
    "odtwMaks": 0,
    "peringkatWisatawan": 30
  },
  {
    "parameter": "Intensitas Tenaga Kerja Awal",
    "wisatawanMin10": 0,
    "wisatawanPlus10": 0,
    "wisatawanMaks": 0,
    "lahanMin10": 0,
    "lahanPlus10": 0,
    "lahanMaks": 0,
    "pdrbMin10": 0,
    "pdrbPlus10": 0,
    "pdrbMaks": 0,
    "hotelMin10": 0,
    "hotelPlus10": 0,
    "hotelMaks": 0,
    "tkMin10": -10,
    "tkPlus10": 10,
    "tkMaks": 10,
    "odtwMin10": 0,
    "odtwPlus10": 0,
    "odtwMaks": 0,
    "peringkatWisatawan": 30
  },
  {
    "parameter": "Laju Kenaikan Produktivitas",
    "wisatawanMin10": 0,
    "wisatawanPlus10": 0,
    "wisatawanMaks": 0,
    "lahanMin10": 0,
    "lahanPlus10": 0,
    "lahanMaks": 0,
    "pdrbMin10": 0,
    "pdrbPlus10": 0,
    "pdrbMaks": 0,
    "hotelMin10": 0,
    "hotelPlus10": 0,
    "hotelMaks": 0,
    "tkMin10": 2.6802,
    "tkPlus10": -2.6102,
    "tkMaks": 2.6802,
    "odtwMin10": 0,
    "odtwPlus10": 0,
    "odtwMaks": 0,
    "peringkatWisatawan": 30
  },
  {
    "parameter": "Laju Keluar Dasar Tenaga Kerja",
    "wisatawanMin10": 0,
    "wisatawanPlus10": 0,
    "wisatawanMaks": 0,
    "lahanMin10": 0,
    "lahanPlus10": 0,
    "lahanMaks": 0,
    "pdrbMin10": 0,
    "pdrbPlus10": 0,
    "pdrbMaks": 0,
    "hotelMin10": 0,
    "hotelPlus10": 0,
    "hotelMaks": 0,
    "tkMin10": 0,
    "tkPlus10": 0,
    "tkMaks": 0,
    "odtwMin10": 0,
    "odtwPlus10": 0,
    "odtwMaks": 0,
    "peringkatWisatawan": 30
  },
  {
    "parameter": "Waktu Penyesuaian Tenaga Kerja",
    "wisatawanMin10": 0,
    "wisatawanPlus10": 0,
    "wisatawanMaks": 0,
    "lahanMin10": 0,
    "lahanPlus10": 0,
    "lahanMaks": 0,
    "pdrbMin10": 0,
    "pdrbPlus10": 0,
    "pdrbMaks": 0,
    "hotelMin10": 0,
    "hotelPlus10": 0,
    "hotelMaks": 0,
    "tkMin10": 0.0781,
    "tkPlus10": -0.0796,
    "tkMaks": 0.0796,
    "odtwMin10": 0,
    "odtwPlus10": 0,
    "odtwMaks": 0,
    "peringkatWisatawan": 30
  }
];

export interface LebarRentangRow {
  kelompok: string; wisatawanMin: number; wisatawanMaks: number; lahanMin: number; lahanMaks: number;
  pdrbMin: number; pdrbMaks: number; lebarWisatawan: number; lebarLahan: number; lebarPdrb: number;
}
export const lebarRentang: LebarRentangRow[] = [
  {
    "kelompok": "Rasio LPD/LPE",
    "wisatawanMin": -44.5393,
    "wisatawanMaks": 109.0287,
    "lahanMin": -0.3306,
    "lahanMaks": 0.633,
    "pdrbMin": -44.5393,
    "pdrbMaks": 109.0287,
    "lebarWisatawan": 153.568,
    "lebarLahan": 0.9636,
    "lebarPdrb": 153.568
  },
  {
    "kelompok": "Bobot Daya Tarik",
    "wisatawanMin": -18.5068,
    "wisatawanMaks": 30.986,
    "lahanMin": -0.1027,
    "lahanMaks": 0.1519,
    "pdrbMin": -18.5068,
    "pdrbMaks": 30.986,
    "lebarWisatawan": 49.4928,
    "lebarLahan": 0.2546,
    "lebarPdrb": 49.4928
  },
  {
    "kelompok": "Laju Konversi Dasar (CI 95%)",
    "wisatawanMin": -15.9485,
    "wisatawanMaks": 14.6869,
    "lahanMin": -50.7775,
    "lahanMaks": 64.9217,
    "pdrbMin": -15.9485,
    "pdrbMaks": 14.6869,
    "lebarWisatawan": 30.6354,
    "lebarLahan": 115.6992,
    "lebarPdrb": 30.6354
  },
  {
    "kelompok": "Elastisitas Daya Tarik ODTW",
    "wisatawanMin": -6.3854,
    "wisatawanMaks": 7.5282,
    "lahanMin": -0.0299,
    "lahanMaks": 0.0337,
    "pdrbMin": -6.3854,
    "pdrbMaks": 7.5282,
    "lebarWisatawan": 13.9136,
    "lebarLahan": 0.0637,
    "lebarPdrb": 13.9136
  },
  {
    "kelompok": "Insentif Kebijakan",
    "wisatawanMin": 2.5617,
    "wisatawanMaks": 12.9161,
    "lahanMin": 0.0471,
    "lahanMaks": 0.2269,
    "pdrbMin": 2.5617,
    "pdrbMaks": 12.9161,
    "lebarWisatawan": 10.3544,
    "lebarLahan": 0.1798,
    "lebarPdrb": 10.3544
  },
  {
    "kelompok": "ODTW 2025 (nilai awal & referensi)",
    "wisatawanMin": -2.8117,
    "wisatawanMaks": 2.2905,
    "lahanMin": -0.0144,
    "lahanMaks": 0.0117,
    "pdrbMin": -2.8117,
    "pdrbMaks": 2.2905,
    "lebarWisatawan": 5.1022,
    "lebarLahan": 0.0261,
    "lebarPdrb": 5.1022
  },
  {
    "kelompok": "Laju Penutupan Dasar ODTW",
    "wisatawanMin": -1.7048,
    "wisatawanMaks": 0.5972,
    "lahanMin": -0.1347,
    "lahanMaks": 0.0669,
    "pdrbMin": -1.7048,
    "pdrbMaks": 0.5972,
    "lebarWisatawan": 2.302,
    "lebarLahan": 0.2016,
    "lebarPdrb": 2.302
  },
  {
    "kelompok": "Lahan Per Hotel dan Akomodasi",
    "wisatawanMin": -0.1843,
    "wisatawanMaks": 0.0926,
    "lahanMin": -0.3436,
    "lahanMaks": 0.6835,
    "pdrbMin": -0.1843,
    "pdrbMaks": 0.0926,
    "lebarWisatawan": 0.2769,
    "lebarLahan": 1.027,
    "lebarPdrb": 0.2769
  },
  {
    "kelompok": "Lahan Per ODTW",
    "wisatawanMin": -0.1775,
    "wisatawanMaks": 0.0475,
    "lahanMin": -0.1774,
    "lahanMaks": 0.663,
    "pdrbMin": -0.1775,
    "pdrbMaks": 0.0475,
    "lebarWisatawan": 0.225,
    "lebarLahan": 0.8405,
    "lebarPdrb": 0.225
  },
  {
    "kelompok": "Kebijakan Konservasi Lahan",
    "wisatawanMin": 0.0611,
    "wisatawanMaks": 0.2452,
    "lahanMin": -0.9116,
    "lahanMaks": -0.2271,
    "pdrbMin": 0.0611,
    "pdrbMaks": 0.2452,
    "lebarWisatawan": 0.1841,
    "lebarLahan": 0.6845,
    "lebarPdrb": 0.1841
  },
  {
    "kelompok": "Laju Demolisi Dasar",
    "wisatawanMin": -0.0569,
    "wisatawanMaks": 0.0561,
    "lahanMin": -0.2183,
    "lahanMaks": 0.221,
    "pdrbMin": -0.0569,
    "pdrbMaks": 0.0561,
    "lebarWisatawan": 0.113,
    "lebarLahan": 0.4393,
    "lebarPdrb": 0.113
  },
  {
    "kelompok": "TPK Ambang",
    "wisatawanMin": -0.007,
    "wisatawanMaks": 0.0172,
    "lahanMin": -0.0612,
    "lahanMaks": 0.0295,
    "pdrbMin": -0.007,
    "pdrbMaks": 0.0172,
    "lebarWisatawan": 0.0242,
    "lebarLahan": 0.0907,
    "lebarPdrb": 0.0242
  },
  {
    "kelompok": "Batas Maksimum Efek ODTW",
    "wisatawanMin": 0,
    "wisatawanMaks": 0,
    "lahanMin": 0,
    "lahanMaks": 0,
    "pdrbMin": 0,
    "pdrbMaks": 0,
    "lebarWisatawan": 0,
    "lebarLahan": 0,
    "lebarPdrb": 0
  },
  {
    "kelompok": "Laju Kenaikan Produktivitas",
    "wisatawanMin": 0,
    "wisatawanMaks": 0,
    "lahanMin": 0,
    "lahanMaks": 0,
    "pdrbMin": 0,
    "pdrbMaks": 0,
    "lebarWisatawan": 0,
    "lebarLahan": 0,
    "lebarPdrb": 0
  },
  {
    "kelompok": "Laju Keluar Dasar Tenaga Kerja",
    "wisatawanMin": 0,
    "wisatawanMaks": 0,
    "lahanMin": 0,
    "lahanMaks": 0,
    "pdrbMin": 0,
    "pdrbMaks": 0,
    "lebarWisatawan": 0,
    "lebarLahan": 0,
    "lebarPdrb": 0
  },
  {
    "kelompok": "Waktu Penyesuaian Tenaga Kerja",
    "wisatawanMin": 0,
    "wisatawanMaks": 0,
    "lahanMin": 0,
    "lahanMaks": 0,
    "pdrbMin": 0,
    "pdrbMaks": 0,
    "lebarWisatawan": 0,
    "lebarLahan": 0,
    "lebarPdrb": 0
  }
];

export interface RentangTuasRow {
  kelompok: string; nilaiUji: string; lahanPct: number; konversiPariwisataPct: number;
  wisatawanPct: number; pdrbPct: number;
}
export const rentangTuasKebijakan: RentangTuasRow[] = [
  {
    "kelompok": "Insentif Kebijakan",
    "nilaiUji": "0.1",
    "lahanPct": 0.0471,
    "konversiPariwisataPct": 7.2117,
    "wisatawanPct": 2.5617,
    "pdrbPct": 2.5617
  },
  {
    "kelompok": "Insentif Kebijakan",
    "nilaiUji": "0.3",
    "lahanPct": 0.1383,
    "konversiPariwisataPct": 22.0976,
    "wisatawanPct": 7.7146,
    "pdrbPct": 7.7146
  },
  {
    "kelompok": "Insentif Kebijakan",
    "nilaiUji": "0.5",
    "lahanPct": 0.2269,
    "konversiPariwisataPct": 37.6694,
    "wisatawanPct": 12.9161,
    "pdrbPct": 12.9161
  },
  {
    "kelompok": "Kebijakan Konservasi Lahan",
    "nilaiUji": "0.25",
    "lahanPct": -0.2271,
    "konversiPariwisataPct": -24.8184,
    "wisatawanPct": 0.0611,
    "pdrbPct": 0.0611
  },
  {
    "kelompok": "Kebijakan Konservasi Lahan",
    "nilaiUji": "0.5",
    "lahanPct": -0.4548,
    "konversiPariwisataPct": -49.7574,
    "wisatawanPct": 0.1224,
    "pdrbPct": 0.1224
  },
  {
    "kelompok": "Kebijakan Konservasi Lahan",
    "nilaiUji": "0.75",
    "lahanPct": -0.6829,
    "konversiPariwisataPct": -74.8178,
    "wisatawanPct": 0.1837,
    "pdrbPct": 0.1837
  },
  {
    "kelompok": "Kebijakan Konservasi Lahan",
    "nilaiUji": "1.0",
    "lahanPct": -0.9116,
    "konversiPariwisataPct": -100,
    "wisatawanPct": 0.2452,
    "pdrbPct": 0.2452
  }
];
