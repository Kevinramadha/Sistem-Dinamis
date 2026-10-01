import type { OutputVariable } from "./scenarios";

// Interpretasi otomatis berbasis template untuk setiap grafik, ditulis dengan
// bahasa sehari-hari agar mudah dipahami pemangku kepentingan dan orang awam.
// Aturannya tetap mengikuti rancangan indikator dan aturan pelaporan di
// skripsi (Tabel 11 dan Bab 3 "Aturan Evaluasi dan Pelaporan"):
// - arah penilaian per indikator (makin besar makin baik, makin kecil makin
//   baik, atau hanya menggambarkan kondisi);
// - pembanding selalu kondisi tanpa kebijakan tambahan (Business-as-Usual);
// - keunggulan skenario selalu disebut beserta sisinya (ekonomi, lingkungan,
//   sosial), tanpa skor gabungan;
// - indikator deskriptif dan skala tidak dipakai untuk mengurutkan skenario;
// - status batas (ambang) dilaporkan terpisah dari urutan skenario.
// Teks bertanda **...** ditampilkan tebal.

export interface Interpretation {
  points: string[];
  context: string;
}

export interface ScenarioSeries {
  id: string;
  label: string;
  values: number[];
}

// Nama indikator di dalam kalimat (huruf kecil, bahasa awam).
const SUBJECT: Record<string, string> = {
  jumlah_wisatawan: "jumlah kunjungan wisatawan",
  tenaga_kerja_pariwisata: "lapangan kerja di sektor pariwisata",
  pdrb_sektor_pariwisata: "nilai tambah ekonomi dari pariwisata (PDRB)",
  akumulasi_investasi: "total investasi pariwisata",
  tpk: "tingkat hunian kamar hotel (okupansi)",
  rasio_daya_dukung_lahan: "lahan yang belum terbangun",
  lahan_terbangun: "luas lahan terbangun",
  akumulasi_konversi_lahan_pariwisata: "lahan yang dialihfungsikan untuk fasilitas pariwisata",
  indeks_kepadatan: "kepadatan wisatawan",
  daya_tarik_wisata: "daya tarik destinasi",
  jumlah_hotel_dan_akomodasi: "jumlah hotel dan akomodasi",
  jumlah_odtw: "jumlah objek wisata",
  investasi_sektor_pariwisata: "investasi pariwisata per tahun",
  total_malam_menginap: "total malam menginap wisatawan",
};

// Penjelasan "Tentang indikator ini", disarikan dari skripsi dan persamaan model.
export const VARIABLE_CONTEXT: Record<string, string> = {
  jumlah_wisatawan:
    "Banyaknya kunjungan wisatawan ke DIY per tahun. Angka ini menunjukkan besarnya sektor pariwisata, tetapi lebih banyak wisatawan belum tentu lebih baik karena juga menambah kepadatan dan tekanan pada lahan. Karena itu angka ini dilaporkan apa adanya, tidak dinilai baik atau buruk.",
  tenaga_kerja_pariwisata:
    "Jumlah orang yang bekerja di sektor pariwisata. Makin banyak lapangan kerja, makin baik dari sisi ekonomi.",
  pdrb_sektor_pariwisata:
    "Nilai tambah ekonomi yang dihasilkan sektor pariwisata (bagian dari PDRB). Makin besar, makin baik dari sisi ekonomi.",
  akumulasi_investasi:
    "Jumlah seluruh investasi pariwisata yang masuk sejak 2025. Kebijakan insentif bekerja dengan menambah investasi ini. Angka ini hanya menggambarkan kondisi, tidak dinilai baik atau buruk.",
  tpk:
    "Persentase kamar hotel yang terisi. Angka ini hanya menggambarkan kondisi, karena belum ada patokan berapa tingkat hunian yang dianggap ideal.",
  rasio_daya_dukung_lahan:
    "Persentase wilayah DIY yang belum terbangun dan masih bisa berfungsi sebagai lahan pertanian, hijau, atau konservasi. Makin besar, makin baik dari sisi lingkungan. Batas minimumnya 33,1% wilayah, setara luas lahan pertanian pangan yang dilindungi Perda DIY No. 6/2021.",
  lahan_terbangun:
    "Luas seluruh lahan yang sudah dibangun di DIY, termasuk untuk permukiman dan kegiatan selain pariwisata. Makin kecil, makin baik dari sisi lingkungan. Kebijakan konservasi lahan hanya mengatur lahan untuk pariwisata, sehingga pengaruhnya pada angka ini kecil.",
  akumulasi_konversi_lahan_pariwisata:
    "Total lahan yang berubah fungsi menjadi hotel dan objek wisata sejak 2025. Makin kecil, makin baik dari sisi lingkungan. Kebijakan konservasi lahan 100% berarti fasilitas pariwisata baru dibangun tanpa membuka lahan baru, misalnya memakai bangunan yang sudah ada atau membangun ke atas (vertikal).",
  indeks_kepadatan:
    "Seberapa padat wisatawan di DIY dibanding kondisi tahun 2025. Nilai 2 berarti dua kali lebih padat dari 2025. Makin kecil, makin baik dari sisi sosial. Batas 2 kali lipat ditetapkan dalam penelitian ini sebagai tanda kepadatan sudah perlu diwaspadai.",
  daya_tarik_wisata:
    "Ukuran seberapa menarik DIY bagi wisatawan, dihitung dari jumlah objek wisata, tingkat kepadatan, dan ketersediaan lahan. Kondisi 2025 diberi nilai 1,00. Makin besar, makin baik. Bertambahnya objek wisata bisa menutupi penurunan akibat kepadatan.",
  jumlah_hotel_dan_akomodasi:
    "Banyaknya hotel dan akomodasi di DIY. Ini variabel pendukung model untuk transparansi, bukan ukuran keberhasilan kebijakan.",
  jumlah_odtw:
    "Banyaknya objek daya tarik wisata di DIY. Ini variabel pendukung model, tetapi berpengaruh besar pada daya tarik destinasi.",
  investasi_sektor_pariwisata:
    "Besarnya investasi pariwisata yang masuk setiap tahun. Ini variabel pendukung model; nilainya naik ketika kebijakan insentif diperbesar.",
  total_malam_menginap:
    "Jumlah malam yang dihabiskan wisatawan untuk menginap dalam setahun, yang menentukan kebutuhan kamar hotel. Ini variabel pendukung model.",
};

const CUMULATIVE = new Set(["akumulasi_investasi", "akumulasi_konversi_lahan_pariwisata"]);
const SMALL_PCT = 0.5; // selisih (%) di bawah ini dianggap praktis sama
const RASIO_BATAS = 0.331; // Perda DIY No. 6/2021 (KP2B) terhadap luas DIY
const KEPADATAN_BATAS = 2.0; // ketetapan peneliti

const nf = (v: number, digits: number) =>
  v.toLocaleString("id-ID", { minimumFractionDigits: digits, maximumFractionDigits: digits });

const pct = (p: number) => `${nf(Math.abs(p), Math.abs(p) < 10 ? 1 : 0)}%`;

const sisi = (v: OutputVariable) => `sisi ${v.dimension.toLowerCase()}`;

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function formatValue(v: number, unit: string, id = ""): string {
  if (id === "rasio_daya_dukung_lahan") return `${nf(v * 100, 1)}% wilayah`;
  if (id === "indeks_kepadatan") return `${nf(v, 2)} kali kondisi 2025`;
  if (unit === "%") return `${nf(v * 100, 1)}%`;
  if (unit === "Dmnl") return nf(v, 2);
  const abs = Math.abs(v);
  let num: string;
  if (abs < 0.05) num = "0";
  else if (abs >= 1e6) num = `${nf(v / 1e6, 1)} juta`;
  else if (abs >= 100) num = nf(v, 0);
  else num = nf(v, 1);
  if (unit === "miliar Rp") return `Rp${num} miliar`;
  return `${num} ${unit}`;
}

const fv = (v: OutputVariable, x: number) => formatValue(x, v.unit, v.id);

function pctChange(from: number, to: number): number | null {
  if (!isFinite(from) || Math.abs(from) < 1e-9) return null;
  return ((to - from) / Math.abs(from)) * 100;
}

// "naik sekitar 2,4 kali lipat" untuk kenaikan besar, selain itu "naik 83%".
function changePhrase(first: number, last: number): string {
  const p = pctChange(first, last) as number;
  if (p >= 100) return `naik sekitar **${nf(last / first, 1)} kali lipat**`;
  return `${p > 0 ? "naik" : "turun"} **${pct(p)}**`;
}

// `lead` adalah pembuka kalimat, misalnya "Dengan insentif 10% dan konservasi lahan 100%,".
function trendPoints(v: OutputVariable, years: number[], values: number[], lead: string): string[] {
  const out: string[] = [];
  const n = values.length;
  if (n < 2) return out;
  const first = values[0];
  const last = values[n - 1];
  const y0 = years[0];
  const y1 = years[n - 1];
  const subj = SUBJECT[v.id] ?? v.label.toLowerCase();

  if (CUMULATIVE.has(v.id)) {
    if (Math.abs(last) < 0.05) {
      out.push(
        v.id === "akumulasi_konversi_lahan_pariwisata"
          ? `${lead} **tidak ada lahan baru** yang dialihfungsikan untuk fasilitas pariwisata selama ${y0}–${y1}.`
          : `${lead} ${subj} selama ${y0}–${y1} **nol**.`
      );
    } else {
      out.push(`${lead} ${subj} selama ${y0}–${y1} mencapai **${fv(v, last)}**.`);
    }
    return out;
  }

  const p = pctChange(first, last);
  if (p === null) return out;

  if (v.id === "indeks_kepadatan") {
    out.push(`${lead} pada ${y1} ${subj} mencapai **${nf(last, 2)} kali lipat** kondisi tahun ${y0}.`);
  } else if (v.id === "daya_tarik_wisata") {
    out.push(
      Math.abs(p) < SMALL_PCT
        ? `${lead} ${subj} relatif tetap seperti kondisi ${y0}.`
        : `${lead} ${subj} ${p > 0 ? "naik" : "turun"} **${pct(p)}** dibanding kondisi ${y0} (indeks dari ${nf(first, 2)} menjadi ${nf(last, 2)}).`
    );
  } else if (v.id === "rasio_daya_dukung_lahan") {
    out.push(`${lead} ${subj} ${last < first ? "menyusut" : "bertambah"} dari **${fv(v, first)}** DIY (${y0}) menjadi **${fv(v, last)}** (${y1}).`);
  } else if (Math.abs(p) < SMALL_PCT) {
    out.push(`${lead} ${subj} relatif stabil di sekitar **${fv(v, last)}** sepanjang ${y0}–${y1}.`);
  } else {
    let s = `${lead} ${subj} ${changePhrase(first, last)}, dari ${fv(v, first)} pada ${y0} menjadi **${fv(v, last)}** pada ${y1}`;
    if (v.unit !== "%" && first > 0 && last > 0 && p > 0) {
      const cagr = (Math.pow(last / first, 1 / (n - 1)) - 1) * 100;
      s += `, atau rata-rata bertambah sekitar ${pct(cagr)} per tahun`;
    }
    out.push(s + ".");
  }

  // Titik tertinggi atau terendah di tengah periode.
  let maxI = 0;
  let minI = 0;
  values.forEach((x, i) => {
    if (x > values[maxI]) maxI = i;
    if (x < values[minI]) minI = i;
  });
  if (maxI > 0 && maxI < n - 1 && last < values[maxI] * 0.99) {
    out.push(`Angkanya sempat mencapai titik tertinggi **${fv(v, values[maxI])}** pada ${years[maxI]}, lalu turun kembali.`);
  } else if (minI > 0 && minI < n - 1 && values[minI] < first * 0.99 && last > values[minI]) {
    out.push(`Angkanya sempat turun ke **${fv(v, values[minI])}** pada ${years[minI]} sebelum naik kembali.`);
  }

  // Kenaikan yang makin pelan atau makin cepat. Hanya bermakna bila laju awal
  // tidak mendekati nol.
  if (v.unit !== "Dmnl" && v.unit !== "%" && p >= SMALL_PCT && values[0] > 0 && values[n - 2] > 0) {
    const gStart = (values[1] / values[0] - 1) * 100;
    const gEnd = (values[n - 1] / values[n - 2] - 1) * 100;
    if (gStart >= 0.1 && gEnd < gStart * 0.7) {
      out.push(`Kenaikannya **makin lama makin pelan**: di awal bertambah sekitar ${pct(gStart)} per tahun, menjelang ${y1} hanya sekitar ${pct(gEnd)} per tahun.`);
    } else if (gStart >= 0.1 && gEnd > gStart * 1.3) {
      out.push(`Kenaikannya **makin lama makin cepat**: di awal bertambah sekitar ${pct(gStart)} per tahun, menjelang ${y1} sekitar ${pct(gEnd)} per tahun.`);
    }
  }
  return out;
}

// Kalimat penilaian setelah membandingkan dengan BAU.
function verdict(v: OutputVariable, diff: number): string {
  if (v.arah === "Maksimum") {
    return diff > 0 ? `Ini **kabar baik** untuk ${sisi(v)}.` : `Ini **kurang baik** untuk ${sisi(v)}.`;
  }
  if (v.arah === "Minimum") {
    return diff < 0
      ? `Untuk indikator ini makin kecil justru makin baik, jadi ini **kabar baik** untuk ${sisi(v)}.`
      : `Untuk indikator ini makin besar berarti kondisinya memburuk, jadi ini **kurang baik** untuk ${sisi(v)}.`;
  }
  if (v.arah === "Dilaporkan") return "Wisatawan yang lebih banyak belum tentu lebih baik, jadi selisih ini tidak dinilai baik atau buruk.";
  if (v.dimension === "Struktur Model") return "Ini variabel pendukung model, jadi selisihnya tidak dinilai baik atau buruk.";
  return "Angka ini hanya menggambarkan kondisi, jadi selisihnya tidak dinilai baik atau buruk.";
}

function thresholdSingle(v: OutputVariable, years: number[], values: number[]): string | null {
  const n = values.length;
  if (v.id === "rasio_daya_dukung_lahan") {
    const i = values.findIndex((x) => x < RASIO_BATAS);
    if (i === -1) {
      return `Sampai ${years[n - 1]}, lahan yang belum terbangun **masih di atas batas minimum 33,1%** wilayah DIY (setara luas lahan pertanian pangan yang dilindungi Perda DIY No. 6/2021).`;
    }
    return `⚠ Mulai ${years[i]}, lahan yang belum terbangun **turun di bawah batas minimum 33,1%** wilayah DIY, lebih kecil dari luas lahan pertanian pangan yang dilindungi Perda DIY No. 6/2021.`;
  }
  if (v.id === "indeks_kepadatan") {
    const i = values.findIndex((x) => x > KEPADATAN_BATAS);
    if (i === -1) {
      return `Sampai ${years[n - 1]}, kepadatan wisatawan **masih di bawah batas waspada** (2 kali lipat kondisi 2025).`;
    }
    return `⚠ Mulai **${years[i]}**, kepadatan wisatawan sudah **lebih dari 2 kali lipat** kondisi 2025, melewati batas waspada yang ditetapkan dalam penelitian ini.`;
  }
  return null;
}

// Interpretasi satu seri (halaman Eksplorasi Simulasi, atau satu skenario).
// `subject` adalah pembuka kalimat yang diakhiri koma; `baseline` adalah seri
// BAU untuk pembanding, kosongkan bila seri ini BAU.
export function interpretSingle(
  v: OutputVariable,
  years: number[],
  values: number[],
  opts: { subject: string; baseline?: number[] | null }
): Interpretation {
  const points: string[] = [];
  points.push(...trendPoints(v, years, values, opts.subject));

  const n = values.length;
  const yEnd = years[n - 1];
  if (opts.baseline && opts.baseline.length === n) {
    const b = opts.baseline[n - 1];
    const d = pctChange(b, values[n - 1]);
    const pembanding = "kondisi tanpa kebijakan tambahan (skenario Business-as-Usual)";
    if (d !== null) {
      if (Math.abs(d) < 0.05) {
        points.push(`Pada ${yEnd} hasilnya **hampir sama** dengan ${pembanding}.`);
      } else {
        points.push(`Dibanding ${pembanding}, pada ${yEnd} hasilnya **${pct(d)} lebih ${d > 0 ? "tinggi" : "rendah"}**. ${verdict(v, d)}`);
      }
    } else if (Math.abs(b) < 1e-6 && Math.abs(values[n - 1]) > 1e-6) {
      points.push(`Tanpa kebijakan tambahan (Business-as-Usual) angkanya nol, sedangkan di sini mencapai **${fv(v, values[n - 1])}**.`);
    }
  }

  const th = thresholdSingle(v, years, values);
  if (th) points.push(th);

  return { points, context: VARIABLE_CONTEXT[v.id] ?? "" };
}

// Interpretasi perbandingan beberapa skenario (halaman Skenario, mode
// "Bandingkan Semua Skenario"). Seri BAU dipakai sebagai pembanding.
export function interpretCompare(v: OutputVariable, years: number[], series: ScenarioSeries[]): Interpretation {
  const points: string[] = [];
  const n = years.length;
  const yEnd = years[n - 1];
  const bau = series.find((s) => s.id === "BAU");
  const endOf = (s: ScenarioSeries) => s.values[n - 1];
  const subj = SUBJECT[v.id] ?? v.label.toLowerCase();

  const parts = series.map((s) => {
    let txt = `${s.label} **${fv(v, endOf(s))}**`;
    if (bau && s.id !== "BAU") {
      const d = pctChange(endOf(bau), endOf(s));
      if (d !== null && Math.abs(d) >= 0.05) txt += ` (${pct(d)} lebih ${d > 0 ? "tinggi" : "rendah"} dari BAU)`;
      else if (d !== null) txt += " (hampir sama dengan BAU)";
    }
    return txt;
  });
  points.push(`${capitalize(subj)} ${CUMULATIVE.has(v.id) ? "sampai" : "pada"} ${yEnd}: ${parts.join("; ")}.`);

  const ends = series.map(endOf);
  const ref = bau ? endOf(bau) : ends[0];
  const spread = Math.max(...ends.map((e) => Math.abs(pctChange(ref, e) ?? 0)));

  if (v.arah === "Maksimum" || v.arah === "Minimum") {
    if (spread < SMALL_PCT) {
      points.push(`Perbedaan antarskenario **sangat kecil** (kurang dari 0,5%), jadi pilihan kebijakan hampir tidak berpengaruh pada indikator ini sampai ${yEnd}.`);
    } else {
      const best = series.reduce((a, s) =>
        v.arah === "Maksimum" ? (endOf(s) > endOf(a) ? s : a) : endOf(s) < endOf(a) ? s : a
      );
      points.push(
        v.arah === "Maksimum"
          ? `Dari ${sisi(v)}, skenario **${best.label}** memberi hasil terbaik untuk indikator ini karena angkanya paling tinggi.`
          : `Dari ${sisi(v)}, skenario **${best.label}** memberi hasil terbaik untuk indikator ini karena angkanya paling kecil (di sini makin kecil makin baik).`
      );
    }
  } else if (v.arah === "Dilaporkan") {
    points.push("Wisatawan yang lebih banyak belum tentu lebih baik, jadi indikator ini **tidak dipakai** untuk menentukan skenario mana yang lebih baik.");
  } else if (v.dimension === "Struktur Model") {
    points.push("Ini variabel pendukung model, **bukan ukuran keberhasilan** kebijakan, jadi tidak dipakai untuk menentukan skenario mana yang lebih baik.");
  } else {
    points.push("Indikator ini hanya menggambarkan kondisi, jadi **tidak dipakai** untuk menentukan skenario mana yang lebih baik.");
  }

  if (v.id === "rasio_daya_dukung_lahan" || v.id === "indeks_kepadatan") {
    const isLahan = v.id === "rasio_daya_dukung_lahan";
    const crossed = series
      .map((s) => {
        const i = s.values.findIndex((x) => (isLahan ? x < RASIO_BATAS : x > KEPADATAN_BATAS));
        return { s, year: i === -1 ? null : years[i] };
      })
      .filter((c) => c.year !== null)
      .sort((a, b) => (a.year as number) - (b.year as number));
    const batas = isLahan
      ? "batas minimum 33,1% wilayah DIY (setara luas lahan pertanian pangan yang dilindungi Perda DIY No. 6/2021)"
      : "batas waspada 2 kali lipat kondisi 2025";
    if (crossed.length === 0) {
      points.push(
        isLahan
          ? `Di semua skenario, lahan yang belum terbangun **tetap di atas ${batas}**.`
          : `Di semua skenario, kepadatan wisatawan **tetap di bawah ${batas}**.`
      );
    } else {
      const list = crossed.map((c) => `${c.s.label} mulai ${c.year}`).join(", ");
      const semua = crossed.length === series.length;
      let s = isLahan
        ? `⚠ Lahan yang belum terbangun turun di bawah ${batas} pada ${semua ? "semua skenario" : `${crossed.length} skenario`}: ${list}.`
        : `⚠ Kepadatan wisatawan melewati ${batas} pada ${semua ? "semua skenario" : `${crossed.length} skenario`}: ${list}.`;
      if (semua && series.length > 1) {
        const ys = crossed.map((c) => c.year as number);
        const gap = Math.max(...ys) - Math.min(...ys);
        s += ` Selisihnya hanya **${gap} tahun**, artinya kebijakan yang diuji **hanya menunda** masalah ini, belum mencegahnya.`;
      }
      points.push(s);
    }
  }

  return { points, context: VARIABLE_CONTEXT[v.id] ?? "" };
}

export function describeParams(p: { insentif_kebijakan: number; kebijakan_konservasi_lahan: number }) {
  return `Dengan insentif ${nf(p.insentif_kebijakan * 100, 0)}% dan konservasi lahan ${nf(p.kebijakan_konservasi_lahan * 100, 0)}%,`;
}

export const BAU_SUBJECT = "Tanpa kebijakan tambahan (Business-as-Usual),";
