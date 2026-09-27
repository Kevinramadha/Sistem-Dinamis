# SimDIY — Simulasi Sistem Dinamis Pariwisata Berkelanjutan DIY

Platform simulasi berbasis web untuk model sistem dinamis (system dynamics) pariwisata
Daerah Istimewa Yogyakarta, dibangun sebagai bagian dari skripsi Diploma IV Politeknik
Statistika STIS. Model Vensim asli dikompilasi ke JavaScript dengan
[SDEverywhere](https://sdeverywhere.org/) dan dijalankan langsung di browser — bukan data
dummy — sehingga proyeksi 2025–2050 di situs ini benar-benar hasil simulasi model.

## Halaman

| Halaman | Rute | Isi |
|---|---|---|
| Beranda | `/` | Ringkasan proyek, peta lokasi studi (batas Provinsi DIY di-highlight), ringkasan skenario |
| Model | `/model` | Tab **Struktur Model** (CLD, SFD, 6 feedback loop) dan tab **Evaluasi Model** (hasil uji struktural, perilaku, kondisi ekstrem, dan sensitivitas) |
| Skenario | `/skenario` | Perbandingan 3 skenario kebijakan resmi, dengan overlay data aktual 2016–2025 |
| Eksplorasi Simulasi | `/simulasi` | Simulasi bebas dengan 2 tuas kebijakan resmi |

## Model sistem dinamis

- **Tahun dasar 2025, horizon proyeksi 2025–2050**, 5 stok (Jumlah Wisatawan, Jumlah Hotel
  dan Akomodasi, Jumlah Objek Daya Tarik Wisata, Tenaga Kerja Pariwisata, Lahan Terbangun).
- Model final: `research/[FINAL] MODEL SISTEM DINAMIS.mdl`, dikompilasi ke
  `lib/model-final.js` via `@sdeverywhere/runtime`.
- **Dua tuas kebijakan** yang bisa diatur pengguna — Insentif Kebijakan dan Kebijakan
  Konservasi Lahan — hasil penyaringan tiga kriteria (relevansi struktural, dasar kebijakan,
  keterkendalian). Parameter lain sudah final hasil kalibrasi dan sengaja tidak diekspos
  sebagai input, karena berstatus asumsi struktural yang diuji lewat analisis sensitivitas,
  bukan instrumen kebijakan.
- **Tiga skenario resmi**: Business-as-Usual, Sustainable, Development Priority (definisi
  lengkap di `lib/scenarios.ts`).
- Indikator kinerja dikelompokkan 4 dimensi: Ekonomi, Lingkungan, Sosial, dan Skala.
- Data historis 2016–2025 (`lib/historicalData.ts`) ditampilkan sebagai overlay validasi di
  chart Skenario dan Eksplorasi Simulasi.

## Evaluasi model

Halaman `/model` → tab **Evaluasi Model** menyajikan hasil empat tahap pengujian standar
System Dynamics (Barlas 1989; Sterman 2000), datanya diambil apa adanya dari file di
`research/` (lihat bagian di bawah):

1. **Uji struktural** — kekekalan materi, uji loop umpan balik, uji galat integrasi.
2. **Uji perilaku** — kesesuaian terhadap data historis (Discrepancy Coefficient, MAPE, uji
   beda kemiringan tren), untuk model penuh maupun uji parsial per-subsistem.
3. **Uji kondisi ekstrem** — 17 skenario nilai batas, termasuk pendokumentasian batas
   validitas model.
4. **Analisis sensitivitas** — tornado ranking ±10% dan pengujian rentang penuh, termasuk
   temuan bahwa Kebijakan Konservasi Lahan hanya menggerakkan total Lahan Terbangun ≤1%.

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

> Jika sebelumnya menjalankan `npm run build`, hapus dulu `.next/` sebelum `npm run dev`
> (`rm -rf .next`) — Turbopack bisa panic kalau cache build-produksi dan dev tercampur.

### Build produksi

```bash
npm run build
npm start
```

## Struktur proyek

```
app/
  page.tsx              Beranda
  model/page.tsx         Model (Struktur Model + Evaluasi Model)
  skenario/page.tsx       Skenario
  simulasi/page.tsx       Eksplorasi Simulasi
components/
  ModelEvaluation.tsx    Konten tab Evaluasi Model
  LineChart.tsx          Wrapper Chart.js
  MapComponent.tsx        Peta Leaflet + batas wilayah DIY
lib/
  model.ts               Runner simulasi (@sdeverywhere/runtime)
  model-final.js          Model hasil kompilasi SDEverywhere (dari research/*.mdl)
  scenarios.ts            Definisi 3 skenario resmi + daftar indikator kinerja
  historicalData.ts        Data aktual 2016-2025 untuk overlay chart
  evaluationData.ts        Data hasil uji struktural/perilaku/ekstrem/sensitivitas
public/
  CLD.png, SFD.png         Diagram model final
  diy-boundary.geojson      Batas Provinsi DIY untuk peta beranda
research/
  Buku Skripsi Kevin.docx   Naskah skripsi lengkap
  [FINAL] MODEL SISTEM DINAMIS.mdl   Model Vensim sumber
  [FIX] Master Data final.xlsx        Data kalibrasi
  hasil_*.xlsx, narasi_evaluasi_model.md   Data & narasi evaluasi model
```

## Tech stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 ·
Chart.js + react-chartjs-2 · Leaflet + react-leaflet · `@sdeverywhere/runtime`

## Metadata penelitian

| | |
|---|---|
| Judul | Simulasi Sistem Dinamis Pariwisata Berkelanjutan DIY |
| Peneliti | Kevin Atha Fathoni Ramadha (222212691) |
| Program Studi | Komputasi Statistik, Program Diploma IV — Politeknik Statistika STIS |
| Lokasi studi | Daerah Istimewa Yogyakarta |
| Horizon simulasi | 2025 – 2050 |

Naskah skripsi lengkap, data kalibrasi, dan data hasil evaluasi model tersedia di folder
[`research/`](./research) untuk keperluan telusur dan reproduksi.
