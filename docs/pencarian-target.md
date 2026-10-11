# Fitur Pencarian Target Kebijakan (Goal Seeking)

Fitur ini membalik arah simulasi. Pada halaman Simulasi, pengguna memilih nilai tuas lalu
melihat hasilnya. Pada halaman **Pencarian Target** (`/pencarian-target`), pengguna
menentukan target indikator, lalu aplikasi mencari kombinasi nilai tuas yang mencapai
target tersebut dengan intervensi sekecil mungkin dari kondisi Business-as-Usual (BAU).

## 1. Ringkasan perubahan

| Bagian | Perubahan |
|---|---|
| `lib/goalSeek.ts` | Mesin pencarian: daftar indikator, 5 jenis target, fungsi evaluasi target, validasi masukan, ruang pencarian (2 tuas resmi dan 3 asumsi tambahan ±10%), grid search + bisection, Latin Hypercube Sampling + penyempurnaan lokal, pemilihan rekomendasi dan alternatif, diagnosis bila target tidak tercapai. |
| `lib/goalSeek.worker.ts`, `lib/goalSeekClient.ts` | Pencarian dijalankan di Web Worker dengan laporan progres dan tombol batal; cadangan di thread utama bila browser tidak mendukung Worker. |
| `app/pencarian-target/page.tsx` | Halaman baru: isian 1–3 target, pilihan asumsi tambahan, progress bar, status, rekomendasi, peta ruang tuas, tabel alternatif, tombol "Terapkan ke Simulasi", catatan tetap tentang sifat hasil. |
| `components/TargetHeatmap.tsx` | Peta (heatmap) 41 × 41 ruang dua tuas: wilayah yang memenuhi semua target, wilayah yang hanya memenuhi target utama, dan titik rekomendasi/alternatif. |
| `components/ApplyLeversFromUrl.tsx`, `app/simulasi/page.tsx` | Halaman Simulasi membaca `?insentif=…&konservasi=…` dari tombol "Terapkan ke Simulasi" dan memuat nilai tuas tersebut ke panel. |
| `lib/model.ts` | `runModel` menerima daftar konstanta tambahan opsional (dipakai hanya untuk asumsi tambahan). Pemanggilan lama tidak berubah. |
| `components/Navbar.tsx` | Menu baru "Pencarian Target". |
| `tests/goalSeek.test.ts` | 15 tes: evaluasi target, validasi, LHS, uji balik SUS dan DP, target mustahil, constraint kepadatan, batasan yang tidak terpenuhi di titik mana pun, target yang sudah dipenuhi BAU, pencarian dengan asumsi tambahan. |

Persamaan model dan nilai parameter tidak diubah. Pencarian hanya menjalankan model
berulang kali dengan nilai input yang berbeda.

## 2. Metode pencarian

Setiap kombinasi nilai input disimulasikan dengan model SDEverywhere yang sama dengan
halaman Simulasi. Hasilnya dibandingkan dengan simulasi BAU (kedua tuas = 0) pada tahun
target. Satu target terpenuhi bila perubahan terhadap BAU (atau nilai absolutnya) memenuhi
syarat yang ditetapkan pengguna. Target pertama adalah target utama; target kedua dan ketiga
adalah batasan (constraint). Untuk dua tuas resmi digunakan **grid search** 41 × 41 titik
(1.681 simulasi) pada rentang slider, yaitu Insentif Kebijakan 0–50% dan Kebijakan
Konservasi Lahan 0–100%. Pasangan titik bertetangga yang statusnya berbeda (memenuhi vs
tidak memenuhi semua target) lalu dipertajam dengan **bisection** (12 iterasi per pasangan,
24 pasangan terdekat dengan BAU) untuk menemukan batas nilai tuas minimum. Bila asumsi
tambahan diaktifkan (5 dimensi), digunakan **Latin Hypercube Sampling** sebanyak 2.000
sampel dengan *seed* tetap agar hasil dapat diulang. Kedua cara diakhiri **penyempurnaan
lokal** (pattern search) yang menggeser titik layak terbaik mendekati BAU selama semua target
tetap terpenuhi.

Rekomendasi utama adalah kombinasi yang memenuhi semua target dengan **jarak ternormalisasi
terkecil dari BAU**, yaitu √Σ((xᵢ − xᵢ,BAU) ÷ rentangᵢ)². Pembagian dengan rentang membuat
Insentif (0–0,5) dan Konservasi (0–1) setara. Alternatif adalah hingga empat kombinasi layak
berikutnya yang berjarak minimal 0,12 satu sama lain. Bila tidak ada kombinasi yang memenuhi
semua target, status menjadi TIDAK TERCAPAI. Aplikasi lalu melaporkan nilai terbaik target
utama yang bisa dicapai tanpa melanggar batasan, dipertajam dengan *hill climbing*, beserta
kombinasi tuasnya. Aplikasi juga menjelaskan penyebabnya: target utama mustahil dicapai,
atau target utama dan batasan saling bertentangan. Satu pencarian membutuhkan sekitar 2.000
simulasi. Satu simulasi berlangsung 0,1–0,3 ms, sehingga seluruh pencarian selesai sekitar
0,2–0,4 detik di peramban.

## 3. Pilihan pada fitur

| Pilihan | Isi |
|---|---|
| Indikator | PDRB Sektor Pariwisata, Jumlah Wisatawan, Tenaga Kerja Pariwisata, Jumlah Hotel dan Akomodasi, Jumlah ODTW, Lahan Terbangun, Rasio Daya Dukung Lahan, Indeks Kepadatan Wisatawan (2025 = 1, ambang 2,0) |
| Tahun target | tahun dasar + 1 sampai 2050 (2026–2050 dengan data penelitian) |
| Jenis target | Naik minimal X% dibanding BAU (bawaan) · Turun minimal X% dibanding BAU · Naik paling banyak X% dibanding BAU · Nilai minimal Y · Nilai maksimal Y |
| Jumlah target | 1 target utama + paling banyak 2 batasan |
| Asumsi tambahan (nonaktif) | Rata-rata Lama Menginap Tamu, Pengeluaran per Kunjungan, Laju Pembangunan ODTW Non Investasi; masing-masing ±10% dari nilai dasar, sama dengan rentang analisis sensitivitas skripsi. Bila Pembaruan Data aktif, nilai dasar dua parameter pertama mengikuti data dasar tersebut. |

Catatan dari struktur model yang relevan untuk pembacaan hasil:

- Dengan kedua tuas pada nilai maksimum, PDRB 2035 hanya naik sekitar +2,4% dibanding BAU
  (2050: sekitar +13,3%). Target besar pada tahun dekat akan TIDAK TERCAPAI.
- PDRB, Jumlah Wisatawan, dan Indeks Kepadatan berubah dengan persentase yang sama terhadap
  BAU. Target "PDRB naik" dengan batasan "kepadatan naik paling banyak" adalah *trade-off*
  langsung.
- Indeks Kepadatan pada BAU melewati 2,0 mulai 2043. Batasan "kepadatan maksimal 2,0" untuk
  tahun 2043 ke atas tidak dapat dipenuhi oleh tuas mana pun.

## 4. Hasil pengujian

| Uji | Masukan | Hasil |
|---|---|---|
| Uji balik SUS | PDRB 2040 naik minimal 1,1271% (keluaran SUS); Rasio Daya Dukung Lahan 2040 minimal 0,713845 (keluaran SUS) | TERCAPAI; Insentif 0,10000, Konservasi 1,00000 (sama dengan skenario SUS, selisih < 0,01) |
| Uji balik DP | PDRB 2040 naik minimal 3,0967%; Rasio Daya Dukung Lahan 2040 minimal 0,711667 | TERCAPAI; Insentif 0,30000, Konservasi 0,00000 (sama dengan skenario DP) |
| Target mustahil | PDRB 2035 naik minimal 500% | TIDAK TERCAPAI; nilai maksimum +2,45% pada Insentif 50% dan Konservasi 100% |
| Constraint bertentangan | PDRB 2045 naik minimal 5%; Indeks Kepadatan 2045 naik paling banyak 3% | TIDAK TERCAPAI; tidak ada sel hijau; terbaik PDRB +2,99% (Insentif 16,3%, Konservasi 100%) tanpa melanggar batasan |
| Constraint longgar | PDRB 2045 naik minimal 5%; Indeks Kepadatan 2045 maksimal 1,06 × BAU | TERCAPAI; semua titik yang direkomendasikan memenuhi batas kepadatan |
| Contoh bawaan halaman | PDRB 2045 naik minimal 5%; Rasio Daya Dukung Lahan 2045 tidak lebih rendah dari BAU | TERCAPAI; Insentif 28,8%, Konservasi 12,5%; 1.986 simulasi, sekitar 0,2 detik |
| Asumsi tambahan (LHS) | PDRB 2035 naik minimal 5% dengan asumsi tambahan aktif | TERCAPAI; Pengeluaran per Kunjungan +4,8% dari nilai dasar, kedua tuas 0; 2.015 simulasi, sekitar 0,2 detik |

Pemeriksaan lain: `npm test` (78 tes) lulus, `next build` tanpa galat TypeScript, dan
`npm run lint` tidak menambah temuan baru (33 temuan lama di berkas lain tetap). Pengujian
end-to-end dengan Playwright mencakup pencarian di Web Worker, tombol Terapkan ke Simulasi,
validasi isian kosong, dan tampilan ponsel tanpa geser horizontal.

## 5. Kasus uji black-box

| No | Fungsi | Masukan | Hasil yang diharapkan |
|---|---|---|---|
| BT-01 | Membuka halaman | Klik menu "Pencarian Target" | Halaman tampil dengan target utama bawaan (PDRB 2045 naik minimal 5%) dan satu batasan (Rasio Daya Dukung Lahan 2045 tidak lebih rendah dari BAU) |
| BT-02 | Menampilkan acuan BAU | Ganti indikator atau tahun pada satu baris target | Di bawah baris tampil nilai BAU untuk indikator dan tahun tersebut |
| BT-03 | Menambah batasan | Klik "+ Tambah batasan" hingga 3 baris | Baris batasan bertambah; tombol hilang setelah 3 target |
| BT-04 | Menghapus batasan | Klik "Hapus" pada baris batasan | Baris terhapus; target utama tidak memiliki tombol Hapus |
| BT-05 | Validasi nilai kosong | Kosongkan nilai target utama, klik "Cari kombinasi tuas" | Pesan "Target utama: nilai target belum diisi atau bukan angka."; pencarian tidak berjalan |
| BT-06 | Validasi persentase negatif | Isi −5 pada target "Naik minimal … %" | Pesan persentase tidak boleh negatif |
| BT-07 | Validasi penurunan ≥ 100% | Pilih "Turun minimal", isi 100 | Pesan penurunan harus kurang dari 100% |
| BT-08 | Validasi rasio | Rasio Daya Dukung Lahan, "Nilai minimal", isi 2 | Pesan Rasio Daya Dukung Lahan bernilai antara 0 dan 1 |
| BT-09 | Pencarian dua tuas | Klik "Cari kombinasi tuas" dengan target bawaan | Progress bar tampil; status TERCAPAI; rekomendasi Insentif ≈ 28,8% dan Konservasi ≈ 12,5%; jumlah simulasi dan waktu tampil |
| BT-10 | Antarmuka tidak membeku | Gulir halaman selama pencarian berjalan | Halaman tetap responsif (pencarian berjalan di Web Worker) |
| BT-11 | Membatalkan pencarian | Klik "Batalkan" saat pencarian berjalan | Pencarian berhenti, tidak ada hasil baru dan tidak ada pesan galat |
| BT-12 | Peta ruang tuas | Lihat bagian "Peta ruang tuas" setelah pencarian dua tuas | Heatmap 41 × 41 dengan wilayah hijau (semua target), kuning (target utama saja), abu-abu (belum tercapai), penanda R dan 1–4 |
| BT-13 | Tabel alternatif | Lihat bagian "Alternatif" | 3–5 baris (R dan alternatif) dengan nilai tuas dan dampak (%) pada PDRB, wisatawan, lahan terbangun, kepadatan, tenaga kerja |
| BT-14 | Terapkan ke Simulasi | Klik "Terapkan ke Simulasi →" pada rekomendasi | Halaman Simulasi terbuka, pemberitahuan nilai tuas tampil, input Insentif dan Konservasi berisi nilai rekomendasi |
| BT-15 | Terapkan alternatif | Klik "Terapkan →" pada salah satu baris alternatif | Halaman Simulasi memuat nilai tuas baris tersebut |
| BT-16 | Uji balik skenario SUS | Target: PDRB 2040 naik minimal 1,1271%; batasan Rasio Daya Dukung Lahan 2040 minimal 0,713845 | TERCAPAI; Insentif ≈ 10%, Konservasi ≈ 100% |
| BT-17 | Uji balik skenario DP | Target: PDRB 2040 naik minimal 3,0967%; batasan Rasio Daya Dukung Lahan 2040 minimal 0,711667 | TERCAPAI; Insentif ≈ 30%, Konservasi ≈ 0% |
| BT-18 | Target mustahil | PDRB 2035 naik minimal 500%, tanpa batasan | TIDAK TERCAPAI; tampil nilai terbaik (+2,45% dibanding BAU) dan kombinasi tuasnya (Insentif 50%, Konservasi 100%) |
| BT-19 | Constraint dilanggar | PDRB 2045 naik minimal 5%; batasan Indeks Kepadatan 2045 naik paling banyak 3% | TIDAK TERCAPAI; penjelasan bahwa target utama dan batasan bertentangan; peta tanpa wilayah hijau; tidak ada rekomendasi yang melanggar batas kepadatan |
| BT-20 | Target sudah dipenuhi BAU | PDRB 2040 naik minimal 0% | TERCAPAI; pesan bahwa tidak dibutuhkan kebijakan tambahan; rekomendasi Insentif 0% dan Konservasi 0% |
| BT-21 | Batasan tak terpenuhi | Batasan Indeks Kepadatan 2045 nilai maksimal 2 | TIDAK TERCAPAI; batasan tercantum sebagai tidak terpenuhi di kombinasi mana pun (BAU sudah > 2,0 sejak 2043) |
| BT-22 | Asumsi tambahan | Centang "Ikutkan asumsi tambahan"; PDRB 2035 naik minimal 5% | Metode LHS; TERCAPAI; kartu asumsi berwarna kuning dengan label "asumsi model, bukan tuas kebijakan"; peringatan bahwa Terapkan hanya membawa nilai tuas |
| BT-23 | Data dasar berubah | Jalankan pencarian, lalu terapkan data dasar baru di Pembaruan Data dan kembali | Hasil lama disembunyikan; pilihan tahun dimulai dari tahun dasar baru + 1 |
| BT-24 | Tampilan ponsel | Buka halaman pada lebar layar 390 px dan jalankan pencarian | Semua bagian terbaca tanpa geser horizontal halaman; tabel lebar dapat digeser di dalam kartunya |
| BT-25 | Catatan tetap | Buka halaman | Catatan bahwa hasil bersifat indikatif, relatif terhadap BAU, bukan ramalan nilai absolut, dan hanya mencakup variabel model selalu tampil |
