// Penjelasan singkat istilah untuk ikon ⓘ di panel pilihan variabel dan tuas
// kebijakan. Disarikan dari skripsi dan persamaan model (.mdl), ditulis dalam
// bahasa awam.
export const GLOSSARY: Record<string, string> = {
  jumlah_wisatawan: "Jumlah kunjungan wisatawan ke DIY dalam setahun.",
  tenaga_kerja_pariwisata: "Jumlah orang yang bekerja di sektor pariwisata DIY.",
  pdrb_sektor_pariwisata:
    "PDRB (Produk Domestik Regional Bruto) sektor pariwisata: nilai tambah ekonomi yang dihasilkan pariwisata DIY dalam setahun, dalam miliar rupiah.",
  akumulasi_investasi: "Total investasi di sektor pariwisata yang terkumpul sejak 2025, dalam miliar rupiah.",
  tpk: "TPK (Tingkat Penghunian Kamar): persentase kamar hotel dan akomodasi yang terisi.",
  rasio_daya_dukung_lahan:
    "Rasio daya dukung lahan: bagian wilayah DIY yang belum terbangun (0–1). Batas minimumnya 0,331 atau 33,1% wilayah, setara luas lahan pertanian pangan yang dilindungi Perda DIY No. 6/2021.",
  lahan_terbangun: "Luas seluruh lahan yang sudah dibangun di DIY, untuk pariwisata maupun bukan, dalam hektar.",
  akumulasi_konversi_lahan_pariwisata:
    "Konversi lahan: perubahan fungsi lahan menjadi hotel/akomodasi dan objek wisata. Angka ini adalah totalnya sejak 2025, dalam hektar.",
  indeks_kepadatan:
    "Kepadatan wisatawan per hektar wilayah dibanding kondisi 2025 (= 1). Nilai 2 berarti dua kali lebih padat dari 2025 dan menjadi batas waspada.",
  daya_tarik_wisata:
    "Indeks seberapa menarik DIY bagi wisatawan, dihitung dari jumlah objek wisata, kepadatan, dan lahan yang tersedia. Kondisi 2025 = 1.",
  jumlah_hotel_dan_akomodasi: "Jumlah hotel dan usaha akomodasi lain (penginapan, homestay, dan sejenisnya) di DIY.",
  jumlah_odtw:
    "ODTW (Objek Daya Tarik Wisata): tempat yang dikunjungi wisatawan, seperti pantai, candi, museum, atau desa wisata.",
  investasi_sektor_pariwisata: "Investasi yang masuk ke sektor pariwisata setiap tahun, dalam miliar rupiah.",
  total_malam_menginap: "Jumlah malam yang dihabiskan seluruh wisatawan untuk menginap di DIY dalam setahun.",

  // Tuas kebijakan
  insentif_kebijakan:
    "Tambahan dorongan investasi pariwisata, misalnya insentif fiskal atau nonfiskal. Nilai 10% berarti investasi 10% lebih tinggi dari pola biasanya. Nilai skenario ditetapkan peneliti, bukan target resmi pemerintah.",
  kebijakan_konservasi_lahan:
    "Bagian kebutuhan lahan untuk hotel dan objek wisata baru yang dipenuhi tanpa membuka lahan baru, misalnya memakai bangunan yang sudah ada atau membangun vertikal. Nilai 100% berarti tidak ada alih fungsi lahan untuk pariwisata.",
};

// Satuan untuk ditampilkan ke pengguna; "Dmnl" (tak berdimensi) diganti "indeks".
export const displayUnit = (unit?: string) => (unit === "Dmnl" ? "indeks" : unit ?? "");
