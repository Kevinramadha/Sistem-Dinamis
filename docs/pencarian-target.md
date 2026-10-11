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
| `components/ApplyLeversFromUrl.tsx`, `app/simulasi/page.tsx` | Halaman Simulasi membaca `?insentif=…&konservasi=…` (dan, bila ada, perubahan asumsi `a_lama`, `a_pengeluaran`, `a_odtw` dalam persen, dibatasi ±10%) dari tombol "Coba di halaman Simulasi". Nilai tuas dimuat ke panel; perubahan asumsi ditampilkan pada kotak kuning "Kondisi lain yang diubah" dengan tombol "Kembalikan ke kondisi dasar", ikut dipakai saat simulasi dijalankan, dan disebut dalam ringkasan serta interpretasi. Pembanding tetap BAU dengan asumsi dasar. |
| `lib/model.ts` | `runModel` menerima daftar konstanta tambahan opsional (dipakai hanya untuk asumsi tambahan). Pemanggilan lama tidak berubah. |
| `components/Navbar.tsx` | Menu baru "Pencarian Target". |
| `tests/goalSeek.test.ts` | 19 tes: evaluasi target, validasi, pembulatan saran, LHS, uji balik SUS dan DP, target mustahil, saran tahun, constraint kepadatan dan saran pelonggarannya, batasan yang tidak terpenuhi di titik mana pun, target yang sudah dipenuhi BAU, pencarian dengan asumsi tambahan, kesamaan hasil asumsi yang dibawa ke Simulasi. |

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

### Bila target tidak tercapai

Halaman tidak berhenti pada status "Target belum bisa dicapai". Aplikasi menjelaskan
penyebabnya dan memberi saran yang masing-masing dapat langsung dicoba dengan satu tombol
(pencarian diulang otomatis):

| Saran | Cara menghitung |
|---|---|
| Sesuaikan target | Angka terbaik target utama yang masih bisa dicapai (tanpa melanggar syarat tambahan bila memungkinkan), dibulatkan ke arah yang tetap tercapai. |
| Beri waktu lebih panjang | Dengan kombinasi terbaik, dicari tahun paling awal setelah tahun target ketika target yang sama tercapai. |
| Longgarkan syarat tambahan | Di antara kombinasi yang memenuhi hasil yang dicari dan syarat lain, diambil yang paling sedikit melanggar syarat tersebut; nilainya menjadi batas baru yang disarankan. |
| Hapus syarat | Untuk syarat yang tidak terpenuhi oleh kombinasi mana pun (mis. kepadatan ≤ 2,0 setelah 2043). |
| Ikut ubah kondisi lain | Bila asumsi tambahan belum dicentang; ditegaskan sebagai pengandaian, bukan kebijakan. |

### Bahasa pada halaman

Istilah teknis diganti bahasa sehari-hari: "target utama" menjadi **hasil yang dicari**,
"batasan/constraint" menjadi **syarat tambahan**, "dibanding BAU" menjadi **dibanding tanpa
kebijakan tambahan**, "rekomendasi intervensi terkecil" menjadi **perubahan paling kecil yang
sudah cukup**, dan "asumsi tambahan" menjadi **ikut ubah kondisi lain (bukan kebijakan)**.
Setiap baris target menampilkan kalimat "Artinya: …". Nilai absolut lahan konservasi diketik
dalam persen luas wilayah. Penjelasan metode untuk peneliti tersedia di panel lipat "Cara
kerja pencarian".

## 3. Pilihan pada fitur

| Pilihan | Isi |
|---|---|
| Indikator | PDRB Sektor Pariwisata, Jumlah Wisatawan, Tenaga Kerja Pariwisata, Jumlah Hotel dan Akomodasi, Jumlah Objek Wisata (ODTW), Luas Lahan Terbangun, Lahan Tersedia untuk Konservasi (Rasio Daya Dukung Lahan; diketik dalam % luas wilayah), Kepadatan Wisatawan (Indeks Kepadatan, kali kepadatan 2025, ambang 2,0) |
| Tahun target | tahun dasar + 1 sampai 2050 (2026–2050 dengan data penelitian) |
| Bentuk target | Lebih tinggi minimal X% dari tanpa kebijakan (bawaan) · Lebih rendah minimal X% dari tanpa kebijakan · Naik paling banyak X% dari tanpa kebijakan · Paling sedikit Y · Paling banyak Y |
| Jumlah target | 1 hasil yang dicari + paling banyak 2 syarat tambahan |
| Ikut ubah kondisi lain (nonaktif) | Lama menginap rata-rata (Rata-rata Lama Menginap Tamu), belanja wisatawan per kunjungan (Pengeluaran per Kunjungan), objek wisata baru dari pemerintah/masyarakat (Laju Pembangunan ODTW Non Investasi); masing-masing ±10% dari nilai dasar, sama dengan rentang analisis sensitivitas skripsi. Bila Pembaruan Data aktif, nilai dasar dua parameter pertama mengikuti data dasar tersebut. |

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
| Saran tahun | PDRB 2035 naik minimal 10% | TIDAK TERCAPAI; saran tahun 2047; pencarian ulang dengan tahun 2047 TERCAPAI, dengan 2046 tetap tidak tercapai |
| Saran pelonggaran syarat | PDRB 2045 naik minimal 5%; kepadatan naik paling banyak 3% | Saran: kepadatan naik paling banyak 5,01%; pencarian ulang TERCAPAI |
| Asumsi dibawa ke Simulasi | Rekomendasi uji LHS dibuka di halaman Simulasi | Perubahan PDRB 2035 di Simulasi sama dengan hasil pencarian (selisih < 0,05 poin persen) |

Pemeriksaan lain: `npm test` (82 tes) lulus, `next build` tanpa galat TypeScript, dan
`npm run lint` tidak menambah temuan baru (33 temuan lama di berkas lain tetap). Pengujian
end-to-end dengan Playwright mencakup pencarian di Web Worker, tombol Coba di halaman Simulasi (termasuk perubahan
kondisi lain dan tombol mengembalikannya), tombol-tombol saran saat target tidak tercapai,
validasi isian kosong, dan tampilan ponsel tanpa geser horizontal.

## 5. Kasus uji black-box

| No | Fungsi | Masukan | Hasil yang diharapkan |
|---|---|---|---|
| BT-01 | Membuka halaman | Klik menu "Pencarian Target" | Halaman "Cari Nilai Kebijakan yang Dibutuhkan" tampil dengan hasil yang dicari bawaan (PDRB 2045 lebih tinggi minimal 5% dari tanpa kebijakan) dan satu syarat tambahan (Lahan Tersedia untuk Konservasi 2045 tidak lebih rendah daripada tanpa kebijakan) |
| BT-02 | Kalimat "Artinya" dan gambaran | Ganti indikator, bentuk target, angka, atau tahun pada satu baris | Kalimat "Artinya: …" dan nilai "bila tanpa kebijakan tambahan" ikut berubah |
| BT-03 | Menambah syarat | Klik "+ Tambah syarat" hingga 3 baris | Baris syarat bertambah; tombol hilang setelah 3 target |
| BT-04 | Menghapus syarat | Klik "Hapus" pada baris syarat tambahan | Baris terhapus; baris hasil yang dicari tidak memiliki tombol Hapus |
| BT-05 | Validasi angka kosong | Kosongkan angka hasil yang dicari, klik "Cari kombinasi kebijakan" | Pesan "Hasil yang dicari: angka target belum diisi."; pencarian tidak berjalan |
| BT-06 | Validasi persentase negatif | Isi −5 pada bentuk "Lebih tinggi minimal …%" | Pesan persentase tidak boleh negatif |
| BT-07 | Validasi penurunan ≥ 100% | Pilih "Lebih rendah minimal …%", isi 100 | Pesan penurunan harus kurang dari 100% |
| BT-08 | Validasi lahan konservasi | Lahan Tersedia untuk Konservasi, "Paling sedikit … (angka)", isi 150 | Pesan lahan tersedia harus antara 0% dan 100% luas wilayah |
| BT-09 | Pencarian dua kebijakan | Klik "Cari kombinasi kebijakan" dengan target bawaan | Progress bar tampil; "✓ Target bisa dicapai"; saran Insentif ≈ 28,8% dan Konservasi ≈ 12,5% |
| BT-10 | Antarmuka tidak membeku | Gulir halaman selama pencarian berjalan | Halaman tetap responsif (pencarian berjalan di Web Worker) |
| BT-11 | Membatalkan pencarian | Klik "Batalkan" saat pencarian berjalan | Pencarian berhenti, tidak ada hasil baru dan tidak ada pesan galat |
| BT-12 | Peta kombinasi | Lihat bagian "Peta kombinasi" | Heatmap 41 × 41: hijau (semua target terpenuhi), kuning (hasil tercapai, syarat dilanggar), abu-abu (belum tercapai); penanda R dan 1–4 |
| BT-13 | Pilihan lain | Lihat tabel "Kombinasi lain yang juga memenuhi target" | 3–5 baris (R dan pilihan lain) dengan nilai kebijakan dan perubahan (%) PDRB, wisatawan, lahan terbangun, kepadatan, tenaga kerja |
| BT-14 | Coba di Simulasi | Klik "Coba di halaman Simulasi →" pada saran kebijakan | Halaman Simulasi terbuka, pemberitahuan tampil, input Insentif dan Konservasi berisi nilai saran |
| BT-15 | Coba pilihan lain | Klik "Coba →" pada salah satu baris pilihan lain | Halaman Simulasi memuat nilai kebijakan baris tersebut |
| BT-16 | Uji balik skenario SUS | Hasil yang dicari: PDRB 2040 lebih tinggi minimal 1,1271%; syarat: Lahan Tersedia 2040 paling sedikit 71,3845% luas wilayah | Target bisa dicapai; Insentif ≈ 10%, Konservasi ≈ 100% |
| BT-17 | Uji balik skenario DP | PDRB 2040 lebih tinggi minimal 3,0967%; syarat: Lahan Tersedia 2040 paling sedikit 71,1667% luas wilayah | Target bisa dicapai; Insentif ≈ 30%, Konservasi ≈ 0% |
| BT-18 | Target mustahil | PDRB 2035 lebih tinggi minimal 500%, tanpa syarat | "✗ Target belum bisa dicapai"; kalimat bahwa kombinasi terbaik (Insentif 50%, Konservasi 100%) hanya mencapai +2,45%; kotak "Apa yang bisa dilakukan?" dengan saran sesuaikan target (2,44%) |
| BT-19 | Saran sesuaikan target | Pada BT-18 klik "Cari ulang dengan target ini" | Angka target berubah menjadi 2,44 dan hasil menjadi "✓ Target bisa dicapai" |
| BT-20 | Saran tahun | PDRB 2035 lebih tinggi minimal 10%, lalu klik "Ganti tahun ke 2047" | Saran tahun 2047 tampil; setelah diklik tahun berubah menjadi 2047 dan target bisa dicapai |
| BT-21 | Syarat bertentangan | PDRB 2045 lebih tinggi minimal 5%; syarat Kepadatan Wisatawan 2045 naik paling banyak 3% | Target belum bisa dicapai; penjelasan bahwa setiap kombinasi yang mencapai hasil melanggar syarat; peta tanpa kotak hijau; tidak ada saran yang melanggar batas kepadatan |
| BT-22 | Saran longgarkan syarat | Pada BT-21 klik "Cari ulang dengan syarat ini" | Angka syarat berubah menjadi 5,01 dan target bisa dicapai |
| BT-23 | Syarat yang tidak mungkin | Syarat Kepadatan Wisatawan 2045 paling banyak 2 (angka) | Kalimat bahwa syarat tidak bisa dipenuhi dengan kebijakan apa pun dan tombol "Hapus syarat dan cari ulang" |
| BT-24 | Target sudah dipenuhi tanpa kebijakan | PDRB 2040 lebih tinggi minimal 0% | Target bisa dicapai; kalimat "Target sudah tercapai walaupun tanpa kebijakan tambahan"; saran Insentif 0% dan Konservasi 0% |
| BT-25 | Ikut ubah kondisi lain | PDRB 2035 lebih tinggi minimal 5%, lalu klik "Centang dan cari ulang" | Kotak dicentang otomatis; target bisa dicapai "tanpa kebijakan tambahan, asalkan … belanja wisatawan per kunjungan +4,8%"; kartu kondisi lain berwarna kuning dengan label "bukan kebijakan" |
| BT-26 | Membawa kondisi lain ke Simulasi | Pada BT-25 klik "Coba di halaman Simulasi →", lalu "Jalankan Simulasi" | Kotak "Kondisi lain yang diubah" tampil di panel kiri (belanja per kunjungan +4,8%, menjadi Rp2,85 juta); ringkasan hasil menyebut "serta perubahan kondisi lain"; PDRB 2035 sama dengan hasil pencarian |
| BT-27 | Mengembalikan kondisi dasar | Pada BT-26 klik "Kembalikan ke kondisi dasar" atau "Reset ke BAU" | Kotak kondisi lain hilang; simulasi berikutnya memakai asumsi dasar |
| BT-28 | Data dasar berubah | Jalankan pencarian, lalu terapkan data dasar baru di Pembaruan Data dan kembali | Hasil lama disembunyikan; pilihan tahun dimulai dari tahun dasar baru + 1 |
| BT-29 | Tampilan ponsel | Buka halaman pada lebar layar 390 px dan jalankan pencarian | Semua bagian terbaca tanpa geser horizontal halaman; tabel lebar dapat digeser di dalam kartunya |
| BT-30 | Catatan tetap | Buka halaman | Catatan bahwa hasil adalah gambaran, bukan ramalan, dibandingkan dengan kondisi tanpa kebijakan tambahan, dan hanya memperhitungkan hal di dalam model selalu tampil |
