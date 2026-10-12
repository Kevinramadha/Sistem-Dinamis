/**
 * Varian teks warna identitas SimDIY yang memenuhi kontras WCAG 2.2 AA (≥ 4,5:1)
 * di atas latar putih/terang. Warna asli tetap dipakai untuk isian, garis, dan
 * grafik; varian ini hanya untuk teks.
 */
const TEXT_ON_LIGHT: Record<string, string> = {
  "#2bb3b6": "#14787b", // teal
  "#3a9c77": "#2c7a5c", // hijau
  "#e89d3e": "#a35f0b", // oranye
  "#f4cd53": "#8a6a00", // kuning
  "#94a3b8": "#5c6b7d", // abu-abu
};

/** Warna teks yang terbaca di latar terang untuk warna identitas `hex`. */
export function readableText(hex: string): string {
  return TEXT_ON_LIGHT[hex.toLowerCase()] ?? hex;
}
