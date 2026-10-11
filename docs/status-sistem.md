# Visibilitas Status Sistem

Perbaikan ini mengikuti heuristik Nielsen pertama, *visibility of system status*: setiap
klik pengguna harus segera diikuti tanda bahwa sistem sedang memproses, sudah selesai,
atau gagal. Sebelumnya beberapa klik terasa "tidak terjadi apa-apa".

## Bentuk pemberitahuan

Pemberitahuan memakai **popup di tengah layar**: kartu putih dengan ikon bulat di atas, judul
singkat, satu kalimat penjelasan, dan tombol. Halaman di belakangnya sedikit digelapkan.

| Jenis popup | Ikon dan tombol | Perilaku |
|---|---|---|
| Berhasil | hijau ✓, "Oke" | tertutup sendiri setelah ±4 detik (ada garis hitung mundur) |
| Info | biru i, "Mengerti" | tertutup sendiri setelah ±4 detik |
| Galat | merah !, "Tutup" | tetap tampil sampai ditutup |
| Pilihan | biru ?, dua pilihan dan "Batal" | muncul hanya saat pengguna mengklik Jalankan Simulasi dan perlu memilih |

Semua popup dapat ditutup lewat ✕, klik di luar kartu, atau Esc; tombol utama langsung
mendapat fokus. Popup memakai `role="dialog"` (galat: `role="alertdialog"`) agar dibacakan
pembaca layar.

**Mengubah pengaturan tidak memunculkan popup.** Menggeser tuas, memilih preset, atau memilih
skenario hanya mengubah panel. Bila sudah ada hasil, di bawah tombol Jalankan Simulasi muncul
keterangan kecil "Pengaturan berubah. Klik Jalankan Simulasi untuk memperbarui hasil."

Teks pemberitahuan dibuat ringkas dan memakai kata sehari-hari, mis. "Simulasi selesai —
Skenario Sustainable · 2025–2050.", "Kembali ke BAU — Tuas kembali ke 0% dan hasil lama dihapus."

## Masalah dan perbaikan

| Masalah sebelumnya | Perbaikan | Halaman |
|---|---|---|
| Satu simulasi hanya ±0,2 ms, sehingga "Menjalankan…" tidak sempat terlihat dan grafik berganti tanpa tanda. | Indikator proses tampil minimal 0,6 detik, lalu popup "Simulasi selesai" berisi pengaturan yang dipakai. | Skenario, Eksplorasi Simulasi, Pencarian Target |
| Di ponsel hasil muncul jauh di bawah panel tuas. | Setelah selesai, layar bergulir ke hasil bila hasil belum terlihat. | Skenario, Eksplorasi Simulasi, Pencarian Target |
| Setelah tuas/preset/skenario diganti, grafik tetap menampilkan hasil lama tanpa keterangan. | Keterangan kecil di bawah tombol Jalankan Simulasi, tanpa popup. | Eksplorasi Simulasi, Skenario |
| "Reset ke BAU" dan "Kembalikan ke kondisi asli" tidak memberi tanda dan hasil lama tetap tampil. | Hasil lama dihapus dan popup berhasil tampil. | Eksplorasi Simulasi |
| Pemberitahuan "nilai dari Pencarian Target" berupa kotak permanen yang tidak hilang. | Diganti popup info sekali tampil; parameter di alamat halaman dihapus. | Eksplorasi Simulasi |
| Setelah nilai dari Pencarian Target dimuat, pengguna tidak tahu apakah kondisi lain (mis. belanja per kunjungan +4,26%) ikut terpakai ketika tuas diubah. | Saat Jalankan Simulasi diklik setelah tuas diubah, popup "Pakai kondisi yang mana?" menawarkan "Tetap pakai kondisi itu" atau "Pakai kondisi asli". Ditanyakan sekali sampai nilai baru dimuat. Angka kondisi lain ditampilkan dua desimal, sama dengan Pencarian Target. | Eksplorasi Simulasi |
| Unduh tabel CSV, template, atau berkas konfigurasi tidak memberi konfirmasi. | Popup berhasil. | Eksplorasi Simulasi, Skenario, Pembaruan Data |
| Berkas unggahan selesai dibaca tanpa pemberitahuan; pesan berhasil/galat hanya di atas halaman. | Popup untuk unggah, periksa isian, buka berkas, terapkan, dan kembali ke data penelitian. | Pembaruan Data |
| Isian target tidak valid, pembatalan, atau kegagalan pencarian kurang terlihat. | Popup galat/info. | Pencarian Target |
| Kesalahan simulasi hanya tercatat di konsol. | Popup galat. | Eksplorasi Simulasi, Skenario |
| Pada koneksi lambat, klik menu tidak menunjukkan apa pun. | Garis progres tipis di bagian atas layar sampai halaman tujuan tampil. | Semua halaman |

Berkas: `components/RunFeedback.tsx`, `components/RouteProgress.tsx`,
`components/ApplyLeversFromUrl.tsx`, `app/layout.tsx`, `app/simulasi/page.tsx`,
`app/skenario/page.tsx`, `app/pencarian-target/page.tsx`, `app/pembaruan-data/page.tsx`.

## Kasus uji black-box

| No | Fungsi | Masukan | Hasil yang diharapkan |
|---|---|---|---|
| SS-01 | Indikator proses | Klik "Jalankan Simulasi" di Eksplorasi Simulasi | Tombol berubah menjadi "Menjalankan…" dan nonaktif selama ±0,6 detik |
| SS-02 | Popup selesai | Tunggu simulasi SS-01 selesai | Popup "Simulasi selesai" berisi Insentif, Konservasi, dan periode; tertutup sendiri ±4 detik, atau lewat "Oke", ✕, klik di luar kartu, Esc |
| SS-03 | Gulir ke hasil (ponsel) | Lebar layar 390 px, klik "Jalankan Simulasi" | Layar bergulir ke "Ringkasan Hasil" |
| SS-04 | Ubah tuas tanpa popup | Setelah SS-02, geser slider atau klik preset SUS | Tidak ada popup; di bawah tombol muncul "Pengaturan berubah. Klik Jalankan Simulasi untuk memperbarui hasil." |
| SS-05 | Perbarui hasil | Pada SS-04 klik "Jalankan Simulasi" | Simulasi berjalan, keterangan hilang, popup "Simulasi selesai" menyebut nilai tuas baru |
| SS-06 | Preset sebelum ada hasil | Sebelum menjalankan simulasi, klik preset DP | Tombol preset aktif dan nilai tuas berubah; tidak ada popup |
| SS-07 | Reset ke BAU | Setelah ada hasil, klik "Reset ke BAU" | Tuas kembali 0%, hasil dihapus, popup "Kembali ke BAU" |
| SS-08 | Nilai dari Pencarian Target | Klik "Coba di halaman Simulasi →" di Pencarian Target | Popup info "Nilai dari Pencarian Target" berisi nilai tuas dan kondisi lain; alamat halaman menjadi `/simulasi` tanpa parameter; kotak "Kondisi lain yang diubah" menampilkan angka dua desimal yang sama dengan Pencarian Target (mis. +4,26%) |
| SS-09 | Kembali ke kondisi asli | Pada SS-08, jalankan simulasi lalu klik "Kembalikan ke kondisi asli" | Kotak kondisi lain hilang, hasil dihapus, popup "Kembali ke kondisi asli" |
| SS-09a | Ubah tuas setelah Pencarian Target | Setelah SS-08, ubah Insentif | Tidak ada popup saat mengubah tuas |
| SS-09b | Pilih kondisi saat menjalankan | Setelah SS-09a klik "Jalankan Simulasi" | Popup "Pakai kondisi yang mana?" dengan pilihan "Tetap pakai kondisi itu", "Pakai kondisi asli", dan "Batal" |
| SS-09c | Tetap pakai kondisi | Pada SS-09b klik "Tetap pakai kondisi itu" | Simulasi berjalan dengan kondisi dari Pencarian Target; kotak kondisi lain tetap ada; perubahan tuas berikutnya tidak ditanya ulang |
| SS-09d | Pakai kondisi asli | Pada SS-09b klik "Pakai kondisi asli" | Simulasi berjalan tanpa kondisi lain; kotak kondisi lain hilang |
| SS-09e | Batal | Pada SS-09b klik "Batal" | Popup tertutup; simulasi tidak dijalankan |
| SS-10 | Unduh tabel | Setelah simulasi, klik tombol unduh CSV | Berkas `simulasi.csv` terunduh dan popup "Tabel diunduh" |
| SS-11 | Variabel yang ditampilkan | Setelah simulasi, centang/hapus centang variabel output | Grafik langsung menyesuaikan; tidak ada keterangan "Pengaturan berubah" |
| SS-12 | Pilih skenario | Di halaman Skenario, klik kartu Sustainable | Kartu aktif; tidak ada popup |
| SS-13 | Skenario berubah | Setelah simulasi Skenario, klik kartu skenario lain atau "Bandingkan Semua Skenario" | Tidak ada popup; keterangan "Pengaturan berubah…" di bawah tombol Jalankan Simulasi |
| SS-14 | Unduh template | Di Pembaruan Data klik "Unduh .csv" atau "Unduh .xlsx" | Berkas terunduh dan popup "Template diunduh" |
| SS-15 | Terapkan data dasar | Di Pembaruan Data terapkan data tahun baru yang valid | Popup "Data diterapkan — Simulasi kini berjalan …–2050." |
| SS-16 | Validasi Pencarian Target | Kosongkan angka target lalu klik "Cari kombinasi kebijakan" | Pesan merah di form dan popup galat "Isian belum lengkap" yang tetap tampil sampai ditutup |
| SS-17 | Pencarian selesai | Klik "Cari kombinasi kebijakan" dengan isian valid | Progress bar tampil; popup "Pencarian selesai"; layar bergulir ke hasil |
| SS-18 | Pindah halaman | Pada koneksi lambat, klik salah satu menu | Garis progres tampil di atas layar sampai halaman tujuan muncul |
