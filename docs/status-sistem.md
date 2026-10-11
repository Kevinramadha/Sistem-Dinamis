# Visibilitas Status Sistem

Perbaikan ini mengikuti heuristik Nielsen pertama, *visibility of system status*: setiap
klik pengguna harus segera diikuti tanda bahwa sistem sedang memproses, sudah selesai,
atau gagal. Sebelumnya beberapa klik terasa "tidak terjadi apa-apa".

## Masalah dan perbaikan

| Masalah sebelumnya | Perbaikan | Halaman |
|---|---|---|
| Satu simulasi hanya ±0,2 ms, sehingga tulisan "Menjalankan…" tidak sempat terlihat dan grafik berganti tanpa tanda. | Indikator proses tampil minimal 0,6 detik (`withMinDuration`), lalu muncul pesan **"✓ Simulasi selesai: …"** berisi pengaturan yang dipakai. Pesan hilang sendiri setelah ±4,5 detik atau bisa ditutup. | Skenario, Eksplorasi Simulasi, Pencarian Target |
| Di ponsel hasil muncul jauh di bawah panel tuas, jadi setelah klik layar tidak berubah. | Setelah proses selesai, layar otomatis bergulir ke hasil bila hasil belum terlihat (gulir halus, atau langsung bila pengguna memilih *reduce motion*). | Skenario, Eksplorasi Simulasi, Pencarian Target |
| Setelah slider/preset (atau kartu skenario) diganti, grafik tetap menampilkan hasil lama tanpa keterangan. | Muncul banner kuning **"Nilai tuas kebijakan sudah berubah"** / **"Pilihan skenario sudah berubah"** dengan tombol **Perbarui hasil**, dan area hasil dipudarkan sampai simulasi dijalankan ulang. Mengganti variabel yang ditampilkan tidak memicu banner karena grafik langsung menyesuaikan. | Eksplorasi Simulasi, Skenario |
| Kesalahan saat simulasi hanya tercatat di konsol. | Pesan galat ditampilkan di halaman. | Eksplorasi Simulasi, Skenario |
| Pada koneksi lambat, klik menu tidak menunjukkan apa pun sampai halaman berikutnya muncul. | Garis progres tipis di bagian atas layar sejak tautan diklik sampai halaman tujuan tampil (tidak muncul bila perpindahan < 0,12 detik). | Semua halaman |

Pesan selesai dan banner memakai `role="status"` dan pesan galat memakai `role="alert"`,
sehingga juga dibacakan oleh pembaca layar.

Berkas: `components/RunFeedback.tsx` (indikator minimum, pesan selesai, banner hasil lama,
gulir ke hasil), `components/RouteProgress.tsx` (garis progres pindah halaman),
`app/layout.tsx`, `app/simulasi/page.tsx`, `app/skenario/page.tsx`,
`app/pencarian-target/page.tsx`.

## Kasus uji black-box

| No | Fungsi | Masukan | Hasil yang diharapkan |
|---|---|---|---|
| SS-01 | Indikator proses | Klik "Jalankan Simulasi" di Eksplorasi Simulasi | Tombol berubah menjadi "Menjalankan…" dan nonaktif selama ±0,6 detik |
| SS-02 | Pesan selesai | Tunggu simulasi SS-01 selesai | Muncul pesan "✓ Simulasi selesai: Insentif …%, Konservasi …% · 2025–2050."; hilang sendiri setelah beberapa detik atau saat tombol ✕ diklik |
| SS-03 | Gulir ke hasil (ponsel) | Lebar layar 390 px, klik "Jalankan Simulasi" | Layar bergulir ke "Ringkasan Hasil" |
| SS-04 | Penanda hasil lama | Setelah SS-02, klik preset SUS atau geser slider | Banner kuning "Nilai tuas kebijakan sudah berubah" muncul, area hasil dipudarkan, pesan selesai lama hilang |
| SS-05 | Perbarui hasil | Pada SS-04 klik "Perbarui hasil" | Simulasi berjalan, banner hilang, hasil kembali jelas, pesan selesai menyebut nilai tuas baru |
| SS-06 | Variabel yang ditampilkan | Setelah simulasi, centang/hapus centang variabel output | Grafik langsung menyesuaikan; tidak ada banner hasil lama |
| SS-07 | Pesan selesai Skenario | Di halaman Skenario klik "Jalankan Simulasi" | Pesan "✓ Simulasi selesai: skenario … · 2025–2050." (atau "ketiga skenario dibandingkan") |
| SS-08 | Hasil lama Skenario | Setelah SS-07, klik kartu skenario lain atau "Bandingkan Semua Skenario" | Banner "Pilihan skenario sudah berubah" dengan tombol "Perbarui hasil" |
| SS-09 | Pencarian Target | Klik "Cari kombinasi kebijakan" | Progress bar tampil; setelah selesai muncul pesan "Pencarian selesai: target bisa/belum bisa dicapai…" dan layar bergulir ke hasil |
| SS-10 | Pindah halaman | Pada koneksi lambat, klik salah satu menu | Garis progres tampil di atas layar sampai halaman tujuan muncul, lalu hilang |
| SS-11 | Tombol kembali peramban | Tekan tombol Back saat garis progres tampil | Garis progres hilang |
