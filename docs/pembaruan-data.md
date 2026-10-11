# Fitur Pembaruan Data Tahunan

Fitur ini memungkinkan pengguna (Pemda/Dinas Pariwisata DIY) memasukkan data tahun
terbaru yang dirilis BPS sehingga simulasi dijalankan dari tahun dasar terbaru sampai
2050, tanpa mengubah kode aplikasi. Halaman: **Pembaruan Data** (`/pembaruan-data`).

## 1. Ringkasan perubahan

| Bagian | Perubahan |
|---|---|
| Model Vensim (`research/[FINAL] MODEL SISTEM DINAMIS.mdl`) | Nilai awal kelima stock yang sebelumnya ditulis sebagai angka di dalam `INTEG(...)` dipisahkan menjadi 5 konstanta bernama: `Nilai Awal Jumlah Wisatawan`, `Nilai Awal Jumlah Hotel dan Akomodasi`, `Nilai Awal Jumlah Objek Daya Tarik Wisata`, `Nilai Awal Tenaga Kerja Pariwisata`, `Nilai Awal Lahan Terbangun`. Nilainya sama persis dan persamaan lain tidak berubah. |
| `lib/model-final.js` | Dikompilasi ulang dengan SDEverywhere. Keluaran model lama dan baru untuk 3 skenario identik (selisih maksimum 0 pada 5.148 titik). |
| `lib/model.ts` | `runModel` menerima data dasar opsional (tahun dasar dan parameter). Untuk tahun dasar selain 2025 dibuat runner dengan `INITIAL TIME` = tahun dasar. Indeks Kepadatan tetap dinormalisasi terhadap kepadatan 2025. |
| `lib/baseData.ts` | Seri data 2015–2025 (13 seri) dari Master Data, sheet "Data Tahunan", beserta satuan dan sumber. |
| `lib/parameterUpdate.ts` | Rumus kelompok B, aturan pembulatan, validasi, daftar parameter kelompok C. |
| `lib/templateIO.ts` | Membuat dan membaca template `.xlsx` (ExcelJS) dan `.csv`. |
| `components/BaseDataProvider.tsx`, `components/BaseDataBanner.tsx` | Status data dasar global, penyimpanan `localStorage`, penanda data dasar di setiap halaman. |
| `app/pembaruan-data/page.tsx` | Halaman baru: unduh template, unggah atau isi form, validasi, pratinjau, terapkan, ekspor/impor `.json`, kembalikan ke data penelitian. |
| Halaman Skenario dan Simulasi | Simulasi memakai data dasar aktif; judul periode menjadi dinamis (`t0–2050`); hasil lama disembunyikan bila data dasar berubah. |
| Pengujian | Vitest: 57 tes (unit, regression, template). ESLint flat config (`npm run lint`). |

## 2. Pembaruan parameter

### Kelompok A: diganti nilai tahun dasar baru
Nilai awal kelima stock = nilai seri pada tahun `t0`.

### Kelompok B: dihitung ulang otomatis dari data
| Parameter | Rumus | Pembulatan |
|---|---|---|
| Pengeluaran per Kunjungan | Pengeluaran Wisatawan(t0) ÷ Jumlah Wisatawan(t0) | 6 angka penting |
| Rasio Nilai Tambah Pariwisata | PDRB Pariwisata ADHK(t0) ÷ Pengeluaran Wisatawan(t0) | 6 angka penting |
| Rasio Investasi terhadap PDRB | Σ Investasi(2015..t0) ÷ Σ PDRB Pariwisata(2015..t0) | 6 angka penting |
| Proporsi Wisatawan Menginap | Wisatawan Menginap(t0) ÷ Jumlah Wisatawan(t0) | 4 desimal |
| Rata-rata Lama Menginap Tamu | Total Malam Menginap(t0) ÷ Jumlah Tamu Menginap(t0) | 6 angka penting |
| Tingkat Penghunian Ganda Kamar | TPG(t0) dari BPS | 6 angka penting |
| Rata-rata Kamar per Unit Akomodasi | Jumlah Kamar(t0) ÷ Jumlah Unit Akomodasi(t0) | 6 angka penting |
| Malam Tersedia per Kamar | Σ(Total Malam_t ÷ TPG_t) ÷ Σ(TPK_t × Jumlah Kamar_t), t = 2015..t0 | 2 desimal |
| Intensitas Tenaga Kerja Awal | Tenaga Kerja Pariwisata(t0) ÷ PDRB Pariwisata(t0) | 6 angka penting |
| Laju Kenaikan Produktivitas | −b dari regresi ln(TK_t ÷ PDRB_t) = a + b·t, 2015..t0 | 6 angka penting |
| ODTW Referensi | ODTW(t0) | 6 angka penting |
| Kepadatan Referensi | Jumlah Wisatawan(t0) ÷ Luas Lahan Tersedia | 6 angka penting |
| Rasio Daya Dukung Lahan Referensi | 1 − Lahan Terbangun(t0) ÷ Luas Lahan Tersedia | 6 angka penting |
| Tahun Dasar Intensitas Tenaga Kerja | t0 | bilangan bulat |

Catatan kesesuaian dengan model:
- Tanda laju produktivitas: model memakai `Intensitas TK = Awal × EXP(−Laju × (Time − Tahun Dasar))`,
  sedangkan regresi data 2015–2025 memberi b = −0,0110205, sehingga laju = −b = 0,0110205.
- Pembulatan mengikuti cara konstanta ditulis di `.mdl` (6 angka penting, kecuali Proporsi
  Wisatawan Menginap 4 desimal dan Malam Tersedia per Kamar 2 desimal), sehingga data
  penelitian menghasilkan parameter yang identik dengan model.

### Kelompok C: tetap
Luas Lahan Tersedia; parameter hasil identitas stock-flow (Laju Pertumbuhan Eksternal, Laju
Penurunan Dasar, Sensitivitas Konstruksi terhadap TPK, TPK Ambang, Sensitivitas ODTW terhadap
Investasi, Laju Pembangunan ODTW Non Investasi, Laju Penutupan Dasar ODTW, Laju Konversi
Dasar); parameter regulasi (Laju Demolisi Dasar, Laju Keluar Dasar TK); parameter asumsi
(bobot daya tarik, elastisitas, batas efek ODTW, lahan per hotel/ODTW, waktu penyesuaian TK);
dan tuas kebijakan. Halaman Pembaruan Data menampilkan keterangan bahwa parameter ini
ditetapkan peneliti dan perlu diturunkan ulang secara terpisah bila struktur data berubah.

## 3. Keputusan desain

1. **Tahun dasar baru.** Runtime SDEverywhere mengunci tahun awal saat runner dibuat, sehingga
   untuk tahun dasar t0 dibuat runner dengan `INITIAL TIME` = t0 dan `FINAL TIME` = 2050.
   Satu-satunya pemakaian `Time` di model ada di Intensitas Tenaga Kerja, yang ikut digeser
   lewat Tahun Dasar Intensitas TK = t0.
2. **Indeks Kepadatan** yang ditampilkan tetap relatif terhadap kepadatan 2025 (= 1), dan
   ambang 2,0 tetap berarti dua kali kepadatan 2025. Kepadatan Referensi di dalam model
   (persamaan daya tarik) tetap diperbarui ke t0 sesuai aturan kelompok B.
3. **Seri Jumlah Wisatawan 2015–2018** memakai angka "Data Tahunan" (sebelum faktor
   sambung). Rumus hanya memakai nilai t0, dan pemeriksaan proporsi menginap ≤ 1 serta
   peringatan perubahan > 50% hanya diterapkan pada tahun baru dan tahun dasar.
4. **Penyimpanan** tanpa backend: `localStorage` (dibungkus try/catch; jika tidak tersedia,
   konfigurasi tetap berlaku selama halaman terbuka). Data penelitian berupa konstanta di kode
   dan tidak pernah tertimpa. Konfigurasi yang dibaca dari `localStorage` atau berkas `.json`
   selalu divalidasi ulang dan parameternya dihitung ulang dari baris data.

## 4. Validasi

**Galat (data tidak dapat diterapkan):** kolom kosong; teks bukan angka; nilai nol/negatif
(investasi boleh nol); data tidak dimulai dari 2015; tahun tidak berurutan, terlewat, atau
ganda; tahun dasar < 2025 atau ≥ 2050; TPK di luar 0–100; TPG di luar 1–4; dan untuk tahun
baru/tahun dasar: wisatawan menginap > jumlah wisatawan, total malam < tamu menginap, jumlah
kamar < jumlah unit akomodasi, lahan terbangun ≥ luas wilayah DIY.

**Peringatan (tetap dapat diterapkan):** perubahan > 50% dari tahun sebelumnya (tahun baru);
data 2015–2025 berbeda dari data penelitian; rata-rata lama menginap > 7 malam; Laju Kenaikan
Produktivitas negatif; rasio daya dukung lahan tahun dasar < 0,331.

## 5. Pengujian otomatis

```bash
npm test        # Vitest: 57 tes
npm run lint    # ESLint
npm run build   # build produksi
```

- `tests/parameterUpdate.test.ts`: unit test tiap rumus kelompok B, pembulatan, 19 parameter
  data penelitian = nilai `.mdl`, dan aturan validasi.
- `tests/regression.test.ts`: data 2015–2025 apa adanya menghasilkan keluaran 2025–2050 yang
  identik untuk BAU, Sustainable, dan Development Priority (toleransi relatif < 1e-6; hasil
  aktual selisih 0), serta simulasi tahun dummy 2026 berjalan 2026–2050.
- `tests/templateIO.test.ts`: unduh lalu unggah ulang template `.csv` dan `.xlsx` menghasilkan
  data identik; CSV format Excel Indonesia (titik koma, koma desimal).

## 6. Kompilasi ulang model

Bila `.mdl` diubah, `lib/model-final.js` dibuat ulang dengan SDEverywhere:

```bash
echo '{"customConstants": true, "customOutputs": true}' > spec.json
npx sde generate --outformat js --list -s spec.json -b build "research/[FINAL] MODEL SISTEM DINAMIS.mdl"
cp build/*.js lib/model-final.js
```

## 7. Kasus uji black-box

| ID | Fungsi | Masukan / langkah | Hasil yang diharapkan | Hasil uji |
|---|---|---|---|---|
| BB-01 | Penanda data dasar | Buka halaman mana pun tanpa pembaruan data | Muncul "Data dasar: 2025 (data penelitian) · simulasi 2025–2050" | Sesuai |
| BB-02 | Unduh template .xlsx | Klik "Unduh .xlsx" | Berkas `template-pembaruan-data-simdiy-2025.xlsx` berisi sheet Data (2015–2025, satuan, sumber) dan Petunjuk | Sesuai |
| BB-03 | Unduh template .csv | Klik "Unduh .csv" | Berkas `.csv` dengan baris kode kolom, nama, satuan, sumber, dan data 2015–2025 | Sesuai |
| BB-04 | Unggah tanpa perubahan | Unggah template apa adanya | Validasi lolos; seluruh parameter lama = baru (selisih 0) | Sesuai |
| BB-05 | Unggah tahun baru valid | Template + baris 2026 lengkap | Validasi lolos; tabel data 2026 dan pratinjau parameter 2025 → 2026 tampil; tombol "Terapkan data dasar 2026" aktif | Sesuai |
| BB-06 | Validasi kolom kosong | Baris 2026 dengan Jumlah Hotel kosong | Galat "… tahun 2026 belum diisi"; tombol Terapkan nonaktif | Sesuai |
| BB-07 | Validasi bukan angka | Sel berisi teks "abc" | Galat "… bukan angka yang valid" | Sesuai |
| BB-08 | Validasi angka negatif | Jumlah Kamar 2026 = −5 | Galat "Jumlah Kamar tahun 2026 harus positif" | Sesuai |
| BB-09 | Validasi tahun meloncat | Baris 2027 tanpa 2026 | Galat "Ada tahun yang terlewat antara 2025 dan 2027" | Sesuai |
| BB-10 | Validasi tahun ganda | Baris 2025 ditambahkan dua kali | Galat "Tahun 2025 muncul lebih dari sekali" | Sesuai |
| BB-11 | Validasi rentang TPK | TPK 2026 = 120 | Galat "TPK tahun 2026 harus di antara 0 dan 100"; Terapkan nonaktif | Sesuai |
| BB-12 | Validasi proporsi | Wisatawan menginap 2026 > jumlah wisatawan | Galat "… melebihi jumlah wisatawan (proporsi harus 0–1)" | Sesuai |
| BB-13 | Validasi luas lahan | Lahan terbangun 2026 = 400.000 ha | Galat "… tidak boleh melebihi luas wilayah DIY (317.036 ha)" | Sesuai |
| BB-14 | Peringatan perubahan ekstrem | Lahan terbangun 2026 naik 63,5% | Peringatan "Lahan Terbangun berubah +63,5% …"; Terapkan tetap aktif | Sesuai |
| BB-15 | Format berkas salah | Unggah berkas `.pdf` | Pesan "Format berkas tidak didukung. Gunakan .xlsx atau .csv" | Sesuai |
| BB-16 | Template tidak dikenali | CSV tanpa baris kode kolom | Pesan "Baris kode kolom … tidak ditemukan" | Sesuai |
| BB-17 | Isi form tahun baru | Tab "Isi form tahun …", isi 13 kolom, klik "Periksa data" | Validasi dan pratinjau tampil seperti unggah berkas | Sesuai |
| BB-18 | Terapkan data dasar | Klik "Terapkan data dasar 2026" | Pesan berhasil; penanda menjadi "tahun 2026 (pembaruan pengguna) · simulasi 2026–2050" | Sesuai |
| BB-19 | Simulasi dari tahun dasar baru | Jalankan simulasi di Eksplorasi Simulasi dan Skenario | Grafik dan tabel dimulai 2026 dan berakhir 2050; ringkasan menyebut "… kali lipat 2026" | Sesuai |
| BB-20 | Penyimpanan | Muat ulang halaman | Data dasar 2026 tetap dipakai | Sesuai |
| BB-21 | Hasil lama tidak tercampur | Jalankan simulasi, lalu terapkan data dasar lain dan buka kembali halaman simulasi | Hasil lama tidak ditampilkan sampai simulasi dijalankan ulang | Sesuai |
| BB-22 | Ekspor konfigurasi | Klik "Ekspor konfigurasi (.json)" | Berkas `konfigurasi-data-dasar-simdiy-2026.json` terunduh | Sesuai |
| BB-23 | Impor konfigurasi valid | Impor `.json` hasil ekspor, lalu Terapkan | Pratinjau tampil; setelah diterapkan penanda menjadi tahun 2026 | Sesuai |
| BB-24 | Impor konfigurasi rusak | Impor `.json` yang datanya tidak lengkap | Pesan "Konfigurasi tidak dapat diimpor …"; data dasar tidak berubah | Sesuai |
| BB-25 | Kembalikan ke data penelitian | Klik "Kembalikan ke data penelitian (2025)" lalu konfirmasi | Penanda kembali "2025 (data penelitian)"; data tersimpan dihapus | Sesuai |
| BB-26 | Tombol saat data penelitian | Buka halaman tanpa pembaruan data | Tombol Ekspor dan Kembalikan nonaktif | Sesuai |
| BB-27 | Informasi kelompok C | Buka panel "Parameter yang tidak diubah aplikasi" | Daftar parameter tetap dan keterangan perlu diturunkan ulang peneliti tampil | Sesuai |
| BB-28 | Penyimpanan tidak tersedia | `localStorage` diblokir peramban, lalu terapkan data 2026 | Aplikasi tetap berjalan; data dasar 2026 berlaku selama halaman terbuka | Sesuai |
| BB-29 | Fitur lama tetap berjalan | Buka Beranda dan Model; jalankan 3 skenario dengan data penelitian | Halaman tampil normal; hasil 2025–2050 identik dengan sebelum fitur ditambahkan | Sesuai |
