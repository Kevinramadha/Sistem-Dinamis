# Visibilitas Status Sistem

Perbaikan ini mengikuti heuristik Nielsen pertama, *visibility of system status*: setiap
klik pengguna harus segera diikuti tanda bahwa sistem sedang memproses, sudah selesai,
atau gagal. Sebelumnya beberapa klik terasa "tidak terjadi apa-apa".

Semua pemberitahuan memakai **popup di tengah layar**: kartu putih dengan ikon bulat di atas,
judul, penjelasan singkat, dan tombol, dengan latar halaman sedikit digelapkan.

| Jenis popup | Warna ikon | Perilaku |
|---|---|---|
| Berhasil | hijau ✓, tombol "Oke" | tertutup sendiri setelah ±4 detik (ada garis hitung mundur) |
| Info (langkah berikutnya) | biru i, tombol "Mengerti" | tertutup sendiri setelah ±4 detik |
| Galat | merah !, tombol "Tutup" | tetap tampil sampai ditutup |
| Hasil perlu diperbarui | oranye ↻, tombol "Perbarui hasil" dan "Nanti saja" | muncul ±0,7 detik setelah pengguna berhenti mengubah pengaturan (tidak menghalangi saat menggeser slider); "Nanti saja" mengubahnya menjadi tombol kecil "… berubah · Perbarui hasil" di pojok kanan bawah |

Semua popup dapat ditutup lewat tombol ✕, klik di luar kartu, atau tombol Esc; tombol utama
langsung mendapat fokus sehingga bisa ditutup dengan Enter. Popup memakai `role="dialog"`
(galat: `role="alertdialog"`) agar dibacakan pembaca layar.

## Masalah dan perbaikan

| Masalah sebelumnya | Perbaikan | Halaman |
|---|---|---|
| Satu simulasi hanya ±0,2 ms, sehingga "Menjalankan…" tidak sempat terlihat dan grafik berganti tanpa tanda. | Indikator proses tampil minimal 0,6 detik, lalu popup **"Simulasi selesai: …"** berisi pengaturan yang dipakai. | Skenario, Eksplorasi Simulasi, Pencarian Target |
| Di ponsel hasil muncul jauh di bawah panel tuas. | Setelah selesai, layar bergulir ke hasil bila hasil belum terlihat. | Skenario, Eksplorasi Simulasi, Pencarian Target |
| Setelah tuas/preset/skenario diganti, grafik tetap menampilkan hasil lama tanpa keterangan. | Popup kuning **"… sudah berubah"** dengan tombol **Perbarui hasil**. Popup hilang begitu hasil diperbarui. | Eksplorasi Simulasi, Skenario |
| Memilih preset atau skenario sebelum ada hasil tidak memberi tanda langkah berikutnya. | Popup info, mis. "Preset Sustainable dimuat. Klik Jalankan Simulasi…". | Eksplorasi Simulasi, Skenario |
| "Kembalikan ke kondisi dasar" dan "Reset ke BAU" tidak memberi tanda, dan hasil lama tetap tampil. | Hasil lama **dihapus** dan popup berhasil tampil ("Berhasil kembali ke kondisi dasar…", "Pengaturan dikembalikan ke kondisi tanpa kebijakan tambahan (BAU)…"). | Eksplorasi Simulasi |
| Pemberitahuan "Nilai dari Pencarian Target sudah dimuat" berupa kotak permanen yang tidak hilang. | Diganti popup info sekali tampil; parameter di alamat halaman dihapus sehingga tidak dimuat ulang. | Eksplorasi Simulasi |
| Unduh tabel CSV, template, atau berkas konfigurasi tidak memberi konfirmasi. | Popup berhasil berisi nama berkas dan langkah berikutnya. | Eksplorasi Simulasi, Skenario, Pembaruan Data |
| Berkas unggahan selesai dibaca tanpa pemberitahuan; pesan berhasil/galat hanya di atas halaman. | Popup info/berhasil/galat untuk unggah, periksa isian, buka berkas, terapkan, dan kembali ke data penelitian. | Pembaruan Data |
| Isian target tidak valid, pembatalan, atau kegagalan pencarian kurang terlihat. | Popup galat/info ("Ada isian target yang perlu diperbaiki…", "Pencarian dibatalkan."). | Pencarian Target |
| Pada koneksi lambat, klik menu tidak menunjukkan apa pun. | Garis progres tipis di bagian atas layar sampai halaman tujuan tampil. | Semua halaman |

Berkas: `components/RunFeedback.tsx` (popup status, popup perbarui hasil, indikator minimum,
gulir ke hasil), `components/RouteProgress.tsx`, `components/ApplyLeversFromUrl.tsx`,
`app/layout.tsx`, `app/simulasi/page.tsx`, `app/skenario/page.tsx`,
`app/pencarian-target/page.tsx`, `app/pembaruan-data/page.tsx`.

## Kasus uji black-box

| No | Fungsi | Masukan | Hasil yang diharapkan |
|---|---|---|---|
| SS-01 | Indikator proses | Klik "Jalankan Simulasi" di Eksplorasi Simulasi | Tombol berubah menjadi "Menjalankan…" dan nonaktif selama ±0,6 detik |
| SS-02 | Popup selesai | Tunggu simulasi SS-01 selesai | Popup tengah "Simulasi selesai" berisi Insentif, Konservasi, dan periode; tertutup sendiri ±4 detik, atau lewat "Oke", ✕, klik di luar kartu, Esc |
| SS-03 | Gulir ke hasil (ponsel) | Lebar layar 390 px, klik "Jalankan Simulasi" | Layar bergulir ke "Ringkasan Hasil" |
| SS-04 | Popup perbarui hasil | Setelah SS-02, klik preset SUS atau ubah nilai tuas | Selama nilai masih diubah tidak ada popup; ±0,7 detik setelah berhenti muncul popup "Nilai tuas kebijakan sudah berubah" dengan tombol "Perbarui hasil" dan "Nanti saja" |
| SS-04b | Nanti saja | Pada SS-04 klik "Nanti saja" | Popup tertutup; tombol kecil "Nilai tuas kebijakan berubah · Perbarui hasil" tampil di pojok kanan bawah sampai hasil diperbarui |
| SS-05 | Perbarui hasil | Pada SS-04 atau SS-04b klik "Perbarui hasil" | Simulasi berjalan, popup/tombol perbarui hilang, popup "Simulasi selesai" menyebut nilai tuas baru |
| SS-06 | Preset tanpa hasil | Sebelum menjalankan simulasi, klik preset DP | Popup info "Preset Development Priority dimuat. Klik Jalankan Simulasi…" |
| SS-07 | Reset ke BAU | Setelah ada hasil, klik "Reset ke BAU" | Tuas kembali 0, hasil dihapus (tampil "Belum ada hasil simulasi"), popup hijau "Pengaturan dikembalikan ke kondisi tanpa kebijakan tambahan (BAU)…" |
| SS-08 | Nilai dari Pencarian Target | Klik "Coba di halaman Simulasi →" di Pencarian Target | Popup info berisi nilai tuas dan kondisi lain yang dimuat; alamat halaman menjadi `/simulasi` tanpa parameter; tidak ada kotak pemberitahuan permanen |
| SS-09 | Kembali ke kondisi dasar | Pada SS-08, jalankan simulasi lalu klik "Kembalikan ke kondisi dasar" | Kotak kondisi lain hilang, hasil dihapus, popup hijau "Berhasil kembali ke kondisi dasar…" |
| SS-10 | Unduh tabel | Setelah simulasi, klik tombol unduh CSV | Berkas `simulasi.csv` terunduh dan popup hijau "Tabel data diunduh sebagai simulasi.csv." |
| SS-11 | Variabel yang ditampilkan | Setelah simulasi, centang/hapus centang variabel output | Grafik langsung menyesuaikan; tidak ada popup perbarui hasil |
| SS-12 | Skenario tanpa hasil | Di halaman Skenario, klik kartu Sustainable sebelum menjalankan simulasi | Popup info "Skenario Sustainable dipilih. Klik Jalankan Simulasi…" |
| SS-13 | Skenario berubah | Setelah simulasi Skenario, klik kartu skenario lain atau "Bandingkan Semua Skenario" | Popup "Pilihan skenario sudah berubah" dengan tombol "Perbarui hasil" dan "Nanti saja" |
| SS-14 | Unduh template | Di Pembaruan Data klik "Unduh .csv" atau "Unduh .xlsx" | Berkas terunduh dan popup hijau "Template … diunduh…" |
| SS-15 | Terapkan data dasar | Di Pembaruan Data terapkan data tahun baru yang valid | Popup hijau "Data dasar tahun … diterapkan…" |
| SS-16 | Validasi Pencarian Target | Kosongkan angka target lalu klik "Cari kombinasi kebijakan" | Pesan merah di form dan popup galat "Isian belum lengkap" yang tetap tampil sampai ditutup |
| SS-17 | Pencarian selesai | Klik "Cari kombinasi kebijakan" dengan isian valid | Progress bar tampil; popup "Pencarian selesai: target bisa/belum bisa dicapai…"; layar bergulir ke hasil |
| SS-18 | Pindah halaman | Pada koneksi lambat, klik salah satu menu | Garis progres tampil di atas layar sampai halaman tujuan muncul |
