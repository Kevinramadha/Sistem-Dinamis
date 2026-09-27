// Data aktual 2016-2025, diambil dari "[FIX] Master Data final.xlsx", sheet
// "Data Historis". Dipakai untuk overlay "data aktual" pada chart simulasi
// (validasi visual terhadap hasil model 2025-2050). Baseline model (INITIAL
// TIME = 2025) dicocokkan terhadap kolom 2025 sheet ini.
export const historicalYears = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

// Tingkat Penghunian Kamar (TPK) di sheet sumber dalam persen (mis. 37.72);
// di sini disimpan sebagai fraksi 0-1 agar sesuai satuan output model.
export const historicalSeries: Record<string, number[]> = {
  jumlah_wisatawan: [
    15066309.46, 15280457.17, 18390971.16, 20520104, 19610135, 22849394.5, 25755726, 30542580,
    38134536, 40695654,
  ],
  jumlah_hotel_dan_akomodasi: [1170, 1179, 1617, 1817, 1848, 1696, 1818, 1820, 2000, 2291],
  jumlah_odtw: [158, 171, 177, 189, 180, 170, 183, 201, 218, 201],
  tenaga_kerja_pariwisata: [263878, 273563, 354684, 334784, 313840, 310755, 395284, 359340, 350946, 364994],
  lahan_terbangun: [
    44561.0784555117, 50223.957001398, 56624.3602289948, 63480.0442236269, 58962.0411105434,
    59887.5260314565, 57709.075808398, 75624.403529316, 73511.574651116, 55029.5352961885,
  ],
  tpk: [0.3772, 0.4508, 0.4511, 0.4534, 0.289, 0.2748, 0.4499, 0.4477, 0.4217, 0.3807],
  pdrb_sektor_pariwisata: [
    10694.03, 11347.59, 12100.99, 13104.38, 10926.83, 12097.19, 13672.58, 14809.2, 15873.81, 16947.62,
  ],
  investasi_sektor_pariwisata: [
    373.8424, 165.3915, 568.3341, 741.4483, 489.6932, 848.8042, 463.5886, 1175.2552, 712.2835,
    1325.950398995,
  ],
  total_malam_menginap: [
    6097324, 10899900, 10293319, 13363923, 4753098, 7379577, 9267217, 11417702, 11503540, 11954114,
  ],
};

export function getHistoricalSeries(varId: string): number[] | undefined {
  return historicalSeries[varId];
}
