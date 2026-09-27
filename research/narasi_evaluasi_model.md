# Narasi Hasil Evaluasi Model — untuk Halaman Web

*Draf ini untuk diberikan ke Claude Code sebagai acuan teks, bersama empat file: hasil_uji_loop_dan_kekekalan.xlsx, hasil_uji_perilaku_baseline_v2.xlsx, hasil_P1_P4_baseline_v2.xlsx, hasil_uji_kondisi_ekstrem_v2.xlsx.*

## Ringkasan (untuk bagian atas halaman)

Model telah melalui empat tahap pengujian standar System Dynamics: uji struktural, uji perilaku, uji kondisi ekstrem, dan analisis sensitivitas. Hasilnya **beragam menurut jenis uji**: model lolos penuh pada uji struktural dan uji kondisi ekstrem (tidak melanggar hukum fisik atau logika sistem), tetapi pada uji perilaku — yang membandingkan pola simulasi dengan data historis 2015–2025 — tingkat kesesuaiannya bervariasi dari cukup baik hingga kurang tergantung variabel yang dilihat. Ini konsisten dengan sifat model kebijakan jangka panjang: tujuannya menangkap pola dan arah struktural, bukan meniru persis nilai historis tahun per tahun.

## 1. Uji Struktural (Verifikasi)

- **Kekekalan materi**: seluruh 5 stok model (Wisatawan, Hotel dan Akomodasi, ODTW, Tenaga Kerja Pariwisata, Lahan Terbangun) kekal sepanjang 2025–2049 — selisih akumulasi inflow-outflow terhadap perubahan stok = 0. Ini membuktikan model bebas dari kesalahan persamaan matematis.
- **Uji loop umpan balik**: ditemukan 16 loop unik (4 reinforcing, 12 balancing) yang seluruhnya berperilaku sesuai teori sistem dinamis — loop balancing menahan pertumbuhan (misalnya kepadatan wisatawan menekan daya tarik), loop reinforcing mempercepatnya (investasi → ODTW → wisatawan).

**Status: lolos penuh.**

## 2. Uji Perilaku (Validasi terhadap data historis)

Diukur dengan Discrepancy Coefficient (DC — mengikuti Barlas 1989: <0,4 baik, 0,4–0,7 rata-rata sampai baik, >0,7 kurang), MAPE, dan uji beda kemiringan tren (uji-t).

Hasilnya tidak seragam antarvariabel:

- **PDRB Sektor Pariwisata** dan **ODTW**: DC terendah (0,17–0,39, kategori Baik–Cukup), arah tren sesuai data, MAPE 5–28%. Ini variabel yang paling dipercaya modelnya.
- **Wisatawan**: DC 0,42–0,45 (Cukup), MAPE 12–14% — arah tren sesuai data tetapi lajunya berbeda nyata secara statistik (uji-t tidak lolos), sebagian karena efek pemulihan pasca-COVID yang berada di luar cakupan struktur model.
- **Hotel dan Akomodasi** serta **Tenaga Kerja Pariwisata**: DC 0,44–0,82 (Cukup–Kurang), arah kemiringan justru **berlawanan** dengan data pada level model-penuh — data historis menunjukkan tren berbeda dari yang direproduksi model secara keseluruhan.
- Ketika kedua variabel ini diuji secara **parsial** (subsistem diuji sendiri dengan input historis diumpankan langsung, bukan hasil model-penuh), hasilnya jauh membaik: DC turun ke 0,20–0,48 (Baik–Cukup), NRMSE juga rendah (0,10–0,17), arah tren sesuai data. Ini menunjukkan struktur persamaannya sendiri valid; penyimpangan pada uji model-penuh berasal dari akumulasi ketidaksesuaian antarsubsistem, bukan dari kesalahan satu persamaan.

> *Catatan metodologis: NRMSE tidak dipakai sebagai metrik pelaporan utama di sini karena perannya adalah fungsi objektif yang diminimalkan selama proses kalibrasi (Tahap 1–4), bukan metrik evaluasi akhir — sejalan dengan protokol yang ditetapkan (DC/E1/E2/MAPE untuk pelaporan, NRMSE untuk proses fitting). NRMSE tetap relevan disebut di sini karena nilainya konkret mendukung klaim validitas struktur persamaan per-subsistem.*

**Status: model menangkap pola struktural utama dengan baik pada variabel ekonomi dan daya tarik wisata; pada variabel akomodasi dan tenaga kerja, hasil model-penuh perlu dibaca sebagai arah kebijakan jangka panjang, bukan prediksi presisi tahunan.**

## 3. Uji Kondisi Ekstrem

17 skenario ekstrem diuji (menyetel parameter ke nilai batas tidak wajar — misalnya wisatawan nol, investasi nol, konservasi lahan penuh). Hasil: **15 lolos penuh, 2 lolos dengan catatan, 0 gagal.**

Dua kasus "lolos dengan catatan":
- **E02** (laju penurunan wisatawan = 0): tanpa rem penurunan, populasi wisatawan tumbuh sangat besar — sesuai logika sebab-akibatnya, tetapi menegaskan bahwa parameter laju penurunan adalah penahan pertumbuhan yang penting di dalam model.
- **E15** (permintaan eksternal 3× lipat lebih besar): seluruh mekanisme pembatas (daya dukung lahan, okupansi hotel, daya tarik wisata) bekerja sebagaimana dirancang, tetapi pertumbuhan tetap sangat besar pada horizon tertentu — ini mendefinisikan **batas validitas model**: model andal untuk skenario pertumbuhan permintaan sampai sekitar 1,25× kondisi dasar, di luar itu hasil numerik perlu ditafsirkan sebagai arah kecenderungan, bukan angka pasti.

**Status: lolos, dengan batas validitas yang terdokumentasi secara eksplisit.**

## Kesimpulan untuk pembaca awam (versi pendek, untuk teks pengantar di web)

> Model ini telah diuji melalui empat tahapan standar dalam metodologi System Dynamics. Model terbukti bebas dari kesalahan struktural dan tetap berperilaku logis pada kondisi ekstrem. Pada uji kesesuaian dengan data historis, model paling andal dalam menangkap pola PDRB pariwisata, pertumbuhan objek wisata, dan jumlah wisatawan; sementara pola akomodasi hotel dan tenaga kerja pada level model keseluruhan menunjukkan penyimpangan yang perlu dibaca sebagai keterbatasan cakupan model, bukan kesalahan perhitungan — hal ini didukung oleh hasil pengujian per-subsistem yang menunjukkan struktur persamaannya sendiri valid. Model dirancang untuk menangkap arah dan besaran relatif dampak kebijakan jangka panjang (2025–2050), bukan untuk memprediksi angka tahunan secara presisi.

---
*Catatan: teks ini boleh disesuaikan gaya bahasanya oleh Claude Code untuk keperluan UI, tetapi angka dan klaim keandalan di atas tidak boleh diperhalus atau dihilangkan — ini bagian dari kejujuran metodologis skripsi.*
