# 🚀 Quick Start Guide

## ⚡ Mulai dalam 30 Detik

Server sudah running di **http://localhost:3000**. Buka browser dan akses!

---

## 📖 Panduan Singkat

### 🏠 Halaman Beranda
- Lihat overview 4 skenario pilihan
- Klik tombol "Mulai Simulasi" untuk ke halaman simulasi
- Klik "Lihat Model" untuk melihat detail struktur model

### 📊 Halaman Model  
- Lihat diagram CLD dan SFD asli dari Vensim
- Baca deskripsi 4 feedback loops
- Pahami struktur model: 9 Stocks, 16 Flows, dll

### 🎯 Halaman Skenario
1. Pilih skenario (S1-S5)
2. Centang variabel yang ingin dilihat
3. Klik "Jalankan Simulasi"
4. Bandingkan dengan "Bandingkan Semua" untuk overlay 5 skenario

### ⚙️ Halaman Simulasi (MAIN)
1. **Atur Parameter** di panel kiri:
   - Gunakan slider atau ketik angka langsung
   - Atau klik preset skenario (S1-S5)

2. **Klik "Jalankan Simulasi"**

3. **Lihat Hasil** di area kanan:
   - Pilih variabel dengan checkbox
   - Hover chart untuk lihat nilai exact
   - Refresh untuk reset

---

## 🎮 Cara Bermain dengan Skenario

### Strategi 1: Explore Skenario Preset
```
1. Klik S1 (BAU) → Jalankan
2. Lihat baseline pertumbuhan wisata
3. Switch ke S2 (Sustainable) → Jalankan
4. Bandingkan dampak kebijakan lingkungan
```

### Strategi 2: Custom Experiment
```
1. Mulai dari S1 (BAU)
2. Turunkan satu parameter: Laju Wisnus dari 6.2% → 3%
3. Jalankan → Lihat hasil
4. Analisis impact ke 10 variabel
```

### Strategi 3: Sensitivity Analysis
```
1. Load skenario S2 (Sustainable)
2. Naik-turunkan "Proporsi Pengolahan Limbah" 0% → 100%
3. Amati perubahan pada "Indeks Kualitas" dan "Polusi"
4. Catat threshold kritis
```

---

## 📊 Interpretasi Hasil

### Variabel Positif (naik = lebih baik)
- ✅ Wisatawan Nusantara (Pendapatan)
- ✅ Wisatawan Mancanegara (Devisa)
- ✅ Unit Akomodasi (Infrastruktur)
- ✅ Lapangan Kerja (Ekonomi)
- ✅ Indeks Kualitas Lingkungan (Sustainability)

### Variabel Negatif (naik = lebih buruk)
- ⚠️ Stok Air Tanah (jika turun drastis)
- ⚠️ Akumulasi Polusi (target: minimize)
- ⚠️ Rasio Demand-Supply Air (target: < 1)

---

## 🔧 Troubleshooting Cepat

| Problem | Solusi |
|---------|--------|
| Halaman putih kosong | Refresh (Cmd+R atau Ctrl+R) |
| Chart tidak muncul | Tunggu 2 detik, pastikan data loaded |
| Map tidak terlihat | Zoom out halaman atau scroll |
| Slider tidak bergerak | Coba ketik di input number di bawah |
| Simulasi lama | Normal (~1-2 detik), tunggu status "Ready" |

---

## 💡 Tips & Tricks

1. **Dual Control**: Slider + number input untuk presisi
2. **Batch Compare**: Centang semua 10 variabel untuk big picture
3. **Individual Check**: Pilih 2-3 variabel saja untuk clarity
4. **Reset**: Klik "Reset ke BAU" untuk kembali baseline
5. **Print**: Right-click chart → Print untuk laporan

---

## 🎯 Contoh Simulasi Sederhana

### Kasus: "Bagaimana Pengelolaan Limbah Mempengaruhi Kualitas?"

**Step 1:** Ke halaman Simulasi

**Step 2:** Load S1 (BAU)
- Scroll ke "Proporsi Pengolahan Air Limbah"
- Set ke 25% (current value)

**Step 3:** Centang variabel:
- ✅ Akumulasi Polusi
- ✅ Indeks Kualitas Lingkungan

**Step 4:** Jalankan Simulasi
- Amati: Polusi naik, Kualitas turun

**Step 5:** Ubah parameter
- "Proporsi Pengolahan Air Limbah" → 75%
- Jalankan ulang

**Step 6:** Bandingkan
- Polusi lebih terkontrol
- Kualitas tetap lebih tinggi
- **Kesimpulan**: Investasi pengelolaan limbah terbukti berdampak!

---

## 📚 Pelajari Lebih Lanjut

- Baca **README.md** untuk dokumentasi lengkap
- Lihat **MODEL.md** untuk detail struktur (akan segera ada)
- Akses Vensim file asli: `model-fix.mdl`

---

## 🔄 Integrasi Model Asli (SDEverywhere)

Saat ini menggunakan dummy data. Untuk gunakan model Vensim asli:

```bash
# 1. Install CLI
npm install -g @climateinteractive/sd-js-tools

# 2. Convert
sde build model-fix.mdl --format javascript

# 3. Copy hasil ke lib/sde-model.js

# 4. Uncomment kode di lib/model.ts
```

Dokumentasi lengkap ada di README.md section "Integrasi SDEverywhere".

---

## ✨ Selamat Mencoba!

**Website Live**: http://localhost:3000

Nikmati eksplorasi model sistem dinamis pariwisata berkelanjutan DIY! 🎉

Jika ada pertanyaan, lihat README.md atau hubungi peneliti.
