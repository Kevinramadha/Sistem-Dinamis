# Perbaikan Aksesibilitas (Google Lighthouse)

Perbaikan ini menindaklanjuti audit kategori **Accessibility** Google Lighthouse pada enam
halaman SimDIY, dalam mode Desktop dan Mobile. Fungsi, alur, dan tampilan aplikasi tidak
berubah. Warna hanya digelapkan atau diterangkan seperlunya agar memenuhi WCAG 2.2 AA.

## Cara pengujian

- **Lighthouse 12.2.1** (Node API, Chromium headless), kategori Accessibility, pada build
  produksi (`next build` + `next start`). Mode Desktop (1350×940) dan Mobile (emulasi bawaan
  Lighthouse).
- **axe-core 4.10** lewat `@axe-core/playwright`, aturan WCAG 2.0/2.1/2.2 A–AA dan
  *best practice*. Lighthouse hanya memeriksa kondisi awal halaman, jadi axe juga
  dijalankan pada kondisi setelah interaksi:
  - hasil simulasi dan popup di Skenario;
  - mode Bandingkan Semua Skenario;
  - hasil di Eksplorasi Simulasi;
  - hasil Pencarian Target;
  - pratinjau Pembaruan Data dan panel yang dibuka;
  - tab Evaluasi Model;
  - dropdown Alat Lanjutan (desktop) dan menu ☰ terbuka (mobile).

## Skor Accessibility

| Halaman | Desktop sebelum | Desktop sesudah | Mobile sebelum | Mobile sesudah |
|---|---|---|---|---|
| `/` Beranda | 91 | **100** | 85 | **100** |
| `/model` | 96 | **100** | 90 | **100** |
| `/skenario` | 96 | **100** | 89 | **100** |
| `/simulasi` | 90 | **100** | 84 | **100** |
| `/pencarian-target` | 96 | **100** | 90 | **100** |
| `/pembaruan-data` | 96 | **100** | 91 | **100** |

Audit yang gagal sebelum perbaikan:

| Halaman | Desktop | Mobile |
|---|---|---|
| `/` | aria-allowed-attr (3), color-contrast (26) | + button-name (1) |
| `/model` | color-contrast (23) | + button-name (1) |
| `/skenario` | color-contrast (32) | color-contrast (30), button-name (1) |
| `/simulasi` | color-contrast (28), heading-order (1), label (4) | + button-name (1) |
| `/pencarian-target` | color-contrast (11) | + button-name (1) |
| `/pembaruan-data` | color-contrast (8) | + button-name (1) |

Angka dalam kurung adalah jumlah elemen yang gagal. Setelah perbaikan, **tidak ada audit
Lighthouse yang gagal**, dan axe-core tidak menemukan pelanggaran pada semua halaman dan
kondisi interaksi di atas.

## Ringkasan per temuan

| No | Temuan Lighthouse | Penyebab | Perbaikan |
|---|---|---|---|
| 1 | *Background and foreground colors do not have a sufficient contrast ratio* (semua halaman) | (a) Teks abu-abu muda Tailwind `gray-400` (#99a1af, kontras 2,5–2,6:1). (b) Warna identitas dipakai langsung sebagai warna teks: teal #2BB3B6 (2,55:1), hijau #3A9C77 (3,38:1), oranye #E89D3E (2,25:1), kuning #F4CD53 (1,53:1), abu #94a3b8 (2,56:1). Contohnya label bagian, kode skenario, kode loop, tombol preset, dan badge. (c) Teks putih di atas kartu skenario aktif hijau/oranye, ditambah `opacity`. (d) Teks gelap di footer (#5a7a96, #4a6a84) dan badge footer. (e) Satuan di kepala tabel memakai putih 60%. (f) Tombol popup berhasil (#2f8f6b, 3,99:1). | (a) `--color-gray-400` di `app/globals.css` diganti #646c7b (≥ 4,5:1 di latar putih dan abu sangat muda); `gray-400` di aplikasi hanya dipakai untuk teks. (b) Fungsi `readableText()` di `lib/a11yColors.ts` memetakan warna identitas ke varian teks yang lebih gelap: teal #14787B, hijau #2C7A5C, oranye #A35F0B, kuning #8A6A00, abu #5C6B7D (semua ≥ 4,7:1). Warna asli tetap dipakai untuk garis, isian, ikon, dan grafik. (c) Latar kartu atau tombol aktif memakai varian gelap yang sama, `opacity` teks dihapus. (d) Teks footer diterangkan (#7D9BB5, badge #7FB2E0/#5FD0D2/#6FCFA8; ≥ 5,7:1 di latar gelap). (e) Putih 60% menjadi 85%. (f) Hijau popup menjadi #267A5A (5,23:1). |
| 2 | *Buttons do not have an accessible name* (semua halaman, mobile) | Tombol menu ☰ di header hanya berisi ikon SVG tanpa teks. | `aria-label` dinamis "Buka menu navigasi" / "Tutup menu navigasi", ditambah `aria-expanded`, `aria-controls="menu-navigasi-seluler"`, dan `aria-hidden` pada ikon. Tombol titik navigasi tabel di mode Bandingkan Semua Skenario (temuan axe) diberi `aria-label` "Tampilkan tabel …" dan `aria-current`. Tombol ⓘ (`Penjelasan: …`) dan tombol tutup popup (`Tutup`) sudah punya nama. |
| 3 | *Form elements do not have associated labels* (`/simulasi`) | Input angka dan slider (`type="range"`) kedua parameter kebijakan kebijakan berada di samping `<label>`, tetapi tidak terhubung dengannya. | `<label>` diberi `id` dan `htmlFor` ke input angka (`nilai-…`); slider diberi `aria-labelledby` ke label yang sama. Checkbox variabel keluaran sudah dibungkus `<label>`. |
| 4 | *Heading elements are not in a sequentially-descending order* (`/simulasi`) | Setelah `<h1>` di hero, judul kartu langsung memakai `<h3>` (melompati `<h2>`). | Judul kartu di halaman Eksplorasi Simulasi diubah dari `<h3>` ke `<h2>`. Ukuran visual tetap karena diatur lewat class (`text-sm`, `font-bold`). |
| 5 | *[aria-\*] attributes do not match their roles* (`/`) | Kartu skenario di Beranda adalah `<div tabIndex={0}>` dengan `aria-expanded`. Atribut ini tidak diizinkan untuk `div` tanpa role. | Kartu diberi `role="button"`, sehingga `aria-expanded` sah dan pembaca layar mengenali kartu sebagai kontrol yang membuka deskripsi. |
| 6 | Elemen dengan `tabindex` > 0 | Diperiksa di seluruh `app/` dan `components/`. | Tidak ada. Yang ada hanya `tabIndex={0}` dan `tabIndex={-1}`. |

### Perbaikan tambahan dari pemeriksaan axe-core (kondisi setelah interaksi)

| Temuan | Perbaikan |
|---|---|
| Grafik `<canvas role="img">` tanpa teks alternatif | `aria-label` berisi judul grafik, periode, dan variabel, serta rujukan ke tabel data (`LineChart`, `ComparisonChart`) |
| Wadah tabel bergulir horizontal tidak bisa difokus keyboard | `tabIndex={0}`, `role="region"`, dan `aria-label` pada wadah tabel di Skenario, Eksplorasi Simulasi, Pencarian Target, dan Pembaruan Data |
| Kepala tabel kosong (kolom tombol "Coba") | Teks khusus pembaca layar "Aksi" (`sr-only`) |
| Area sentuh ikon ⓘ dan titik navigasi tabel di bawah 24×24 px (WCAG 2.5.8) | Area klik diperbesar menjadi 24×24 px; ukuran ikon yang terlihat tetap (margin negatif / elemen dalam) |
| Label kartu parameter di hasil Pencarian Target (`gray-500` di latar biru muda, 4,4:1) | Menjadi `gray-600` |

## Berkas yang diubah

- `app/globals.css`
- `lib/a11yColors.ts` (baru)
- `components/Navbar.tsx`, `components/Footer.tsx`, `components/InfoTip.tsx`
- `components/RunFeedback.tsx`, `components/SimulationSummary.tsx`
- `components/LineChart.tsx`, `components/ComparisonChart.tsx`
- `app/page.tsx`, `app/model/page.tsx`, `app/skenario/page.tsx`, `app/simulasi/page.tsx`
- `app/pencarian-target/page.tsx`, `app/pembaruan-data/page.tsx`

## Pemeriksaan lain

- 82 tes otomatis (Vitest) lolos.
- `tsc` dan `next build` tanpa error.
- ESLint tanpa temuan baru (33 temuan lama tetap).
- Uji tampilan Playwright (desktop dan 390 px) tidak menemukan perubahan tata letak, geser
  horizontal, atau error halaman.
