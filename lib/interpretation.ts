import type { OutputVariable } from "./scenarios";

// Interpretasi otomatis berbasis template untuk setiap grafik. Aturannya
// mengikuti rancangan indikator dan aturan pelaporan di skripsi (Tabel 11 dan
// Bab 3 "Aturan Evaluasi dan Pelaporan"):
// - arah interpretasi per indikator (maksimum, minimum, deskriptif, skala);
// - pembanding selalu skenario tanpa intervensi (Business-as-Usual);
// - untuk indikator berarah minimum, nilai lebih rendah ditandai eksplisit
//   sebagai kinerja lebih baik;
// - keunggulan selalu disebut beserta dimensinya, tanpa skor gabungan;
// - indikator deskriptif dan skala tidak diperingkat;
// - status ambang dilaporkan terpisah dari peringkat.
// Kalimat ditandai **...** untuk bagian yang ditebalkan saat ditampilkan.

export interface Interpretation {
  points: string[];
  context: string;
}

export interface ScenarioSeries {
  id: string;
  label: string;
  values: number[];
}

interface Threshold {
  value: number;
  // "atas": indikator seharusnya tetap di atas ambang; "bawah": di bawah ambang.
  keep: "atas" | "bawah";
  source: string;
}

const THRESHOLDS: Record<string, Threshold> = {
  rasio_daya_dukung_lahan: {
    value: 0.331,
    keep: "atas",
    source: "tolok ukur luas Kawasan Pertanian Pangan Berkelanjutan, Perda DIY No. 6/2021",
  },
  indeks_kepadatan: {
    value: 2.0,
    keep: "bawah",
    source: "ketetapan peneliti, setara dua kali kepadatan tahun 2025",
  },
};

// Makna tiap indikator dalam bahasa awam, disarikan dari skripsi dan
// persamaan model (.mdl).
export const VARIABLE_CONTEXT: Record<string, string> = {
  jumlah_wisatawan:
    "Indikator skala: dilaporkan tetapi tidak dinilai baik atau buruk, karena dalam kerangka pariwisata berkelanjutan kunjungan yang lebih banyak tidak otomatis berarti kinerja lebih baik. Pertumbuhannya diredam oleh turunnya daya tarik destinasi akibat kepadatan yang meningkat dan lahan tersedia yang menyusut.",
  tenaga_kerja_pariwisata:
    "Indikator ekonomi berarah maksimum: makin banyak lapangan kerja pariwisata, makin baik. Dalam model, tenaga kerja merupakan keluaran yang tidak memengaruhi subsistem lain.",
  pdrb_sektor_pariwisata:
    "Indikator ekonomi berarah maksimum: nilai tambah yang dihasilkan sektor pariwisata; makin tinggi makin baik.",
  akumulasi_investasi:
    "Indikator deskriptif: total investasi pariwisata yang tertanam sejak 2025. Tuas Insentif Kebijakan bekerja dengan menambah investasi ini, tetapi besarnya investasi tidak dinilai baik atau buruk.",
  tpk:
    "Indikator deskriptif: persentase kamar akomodasi yang terisi. Tidak diberi ambang karena belum ada dasar teoretis maupun empiris untuk menetapkan rentang okupansi yang sehat.",
  rasio_daya_dukung_lahan:
    "Indikator lingkungan berarah maksimum: proporsi wilayah DIY yang belum terbangun. Ambang 0,331 berasal dari luas Kawasan Pertanian Pangan Berkelanjutan (Perda DIY No. 6/2021) dibanding luas DIY; sifatnya tolok ukur luas, bukan pengendalian lokasi.",
  lahan_terbangun:
    "Indikator lingkungan berarah minimum: makin kecil makin baik. Mencakup seluruh lahan terbangun, termasuk yang bukan untuk pariwisata, sehingga tuas Kebijakan Konservasi Lahan hanya memengaruhi sebagian kecil darinya.",
  akumulasi_konversi_lahan_pariwisata:
    "Indikator lingkungan berarah minimum: total lahan yang beralih fungsi untuk membangun hotel dan objek wisata. Kebijakan Konservasi Lahan 100% menihilkan konversi ini, misalnya lewat pemanfaatan bangunan yang sudah ada atau pembangunan vertikal.",
  indeks_kepadatan:
    "Indikator sosial berarah minimum: kepadatan kunjungan per hektar wilayah dibanding kondisi tahun 2025 (nilai 1,0). Nilai 2,0 berarti kepadatan dua kali lipat tahun 2025; ambang ini merupakan ketetapan peneliti.",
  daya_tarik_wisata:
    "Indikator sosial berarah maksimum: indeks gabungan dari jumlah objek wisata, kepadatan, dan lahan tersedia (nilai 1,000 pada 2025). Bertambahnya objek wisata dapat menutupi penurunan akibat kepadatan, sehingga skenario dengan pembangunan lebih banyak bisa memiliki daya tarik lebih tinggi.",
  jumlah_hotel_dan_akomodasi:
    "Variabel struktur model, ditampilkan untuk transparansi dan bukan indikator kinerja. Jumlah akomodasi bertambah mengikuti investasi dan tingkat okupansi.",
  jumlah_odtw:
    "Variabel struktur model, ditampilkan untuk transparansi dan bukan indikator kinerja. Jumlah objek wisata menjadi komponen terbesar indeks daya tarik destinasi.",
  investasi_sektor_pariwisata:
    "Variabel struktur model: investasi pariwisata per tahun. Bukan indikator kinerja; nilainya naik ketika tuas Insentif Kebijakan diperbesar.",
  total_malam_menginap:
    "Variabel struktur model: jumlah malam menginap wisatawan per tahun, yang menjadi dasar permintaan kamar akomodasi.",
};

const CUMULATIVE = new Set(["akumulasi_investasi", "akumulasi_konversi_lahan_pariwisata"]);
const SMALL_PCT = 0.5; // selisih (%) di bawah ini dianggap praktis sama

const nf = (v: number, digits: number) =>
  v.toLocaleString("id-ID", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export function formatValue(v: number, unit: string): string {
  if (unit === "%") return `${nf(v * 100, 1)}%`;
  if (unit === "Dmnl") return nf(v, 3);
  const abs = Math.abs(v);
  let num: string;
  if (abs < 0.05) num = "0";
  else if (abs >= 1e6) num = `${nf(v / 1e6, 1)} juta`;
  else if (abs >= 100) num = nf(v, 0);
  else num = nf(v, 1);
  if (unit === "miliar Rp") return `Rp${num} miliar`;
  return `${num} ${unit}`;
}

function formatPct(p: number, signed = true): string {
  const sign = !signed ? "" : p > 0 ? "+" : p < 0 ? "−" : "";
  return `${sign}${nf(Math.abs(p), Math.abs(p) < 10 ? 2 : 1)}%`;
}

function pctChange(from: number, to: number): number | null {
  if (!isFinite(from) || Math.abs(from) < 1e-9) return null;
  return ((to - from) / Math.abs(from)) * 100;
}

function dimensionName(v: OutputVariable) {
  return v.dimension.toLowerCase();
}

function trendPoints(v: OutputVariable, years: number[], values: number[]): string[] {
  const out: string[] = [];
  const n = values.length;
  if (n < 2) return out;
  const first = values[0];
  const last = values[n - 1];
  const y0 = years[0];
  const y1 = years[n - 1];

  if (CUMULATIVE.has(v.id)) {
    if (Math.abs(last) < 0.05) {
      out.push(
        v.id === "akumulasi_konversi_lahan_pariwisata"
          ? `Selama ${y0}–${y1} **tidak ada lahan** yang dikonversi untuk fasilitas pariwisata.`
          : `Selama ${y0}–${y1} akumulasinya **nol**.`
      );
    } else {
      out.push(`Akumulasi selama ${y0}–${y1} mencapai **${formatValue(last, v.unit)}**.`);
    }
    return out;
  }

  const p = pctChange(first, last);
  if (p === null) return out;
  if (Math.abs(p) < SMALL_PCT) {
    out.push(`Nilainya relatif stabil di sekitar **${formatValue(last, v.unit)}** sepanjang ${y0}–${y1}.`);
  } else {
    const arah = p > 0 ? "meningkat" : "menurun";
    let s = `Nilainya ${arah} dari **${formatValue(first, v.unit)}** (${y0}) menjadi **${formatValue(last, v.unit)}** (${y1}), atau **${formatPct(p)}**`;
    // Rata-rata per tahun hanya bermakna untuk besaran yang bertumbuh, bukan indeks/rasio.
    if (v.unit !== "Dmnl" && v.unit !== "%" && first > 0 && last > 0) {
      const cagr = (Math.pow(last / first, 1 / (n - 1)) - 1) * 100;
      s += ` (rata-rata ${formatPct(cagr)} per tahun)`;
    }
    out.push(s + ".");
  }

  // Puncak atau titik terendah di tengah periode.
  let maxI = 0;
  let minI = 0;
  values.forEach((x, i) => {
    if (x > values[maxI]) maxI = i;
    if (x < values[minI]) minI = i;
  });
  if (maxI > 0 && maxI < n - 1 && last < values[maxI] * 0.99) {
    out.push(`Sempat mencapai puncak **${formatValue(values[maxI], v.unit)}** pada ${years[maxI]}, lalu menurun.`);
  } else if (minI > 0 && minI < n - 1 && values[minI] < first * 0.99 && last > values[minI]) {
    out.push(`Sempat turun ke **${formatValue(values[minI], v.unit)}** pada ${years[minI]} sebelum kembali naik.`);
  }

  // Perlambatan atau percepatan pertumbuhan.
  if (v.unit !== "Dmnl" && v.unit !== "%" && p !== null && p >= SMALL_PCT && values[0] > 0 && values[n - 2] > 0) {
    const gStart = (values[1] / values[0] - 1) * 100;
    const gEnd = (values[n - 1] / values[n - 2] - 1) * 100;
    // Perbandingan laju hanya bermakna bila laju awal tidak mendekati nol.
    if (gStart >= 0.1 && gEnd < gStart * 0.7) {
      out.push(`Laju pertumbuhan tahunannya **melambat**, dari ${formatPct(gStart)} di awal periode menjadi ${formatPct(gEnd)} menjelang ${y1}.`);
    } else if (gStart >= 0.1 && gEnd > gStart * 1.3) {
      out.push(`Laju pertumbuhan tahunannya **makin cepat**, dari ${formatPct(gStart)} di awal periode menjadi ${formatPct(gEnd)} menjelang ${y1}.`);
    }
  }
  return out;
}

function thresholdPoint(v: OutputVariable, years: number[], values: number[], who = ""): string | null {
  const t = THRESHOLDS[v.id];
  if (!t) return null;
  const ambang = nf(t.value, t.value < 1 ? 3 : 1);
  const crossI = values.findIndex((x) => (t.keep === "atas" ? x < t.value : x > t.value));
  if (crossI === -1) {
    const ext = t.keep === "atas" ? Math.min(...values) : Math.max(...values);
    return `${who}Tetap ${t.keep === "atas" ? "di atas" : "di bawah"} ambang **${ambang}** sepanjang periode (${t.keep === "atas" ? "terendah" : "tertinggi"} ${formatValue(ext, v.unit)}); ambang ini merupakan ${t.source}.`;
  }
  return `${who}**Melewati ambang ${ambang}** mulai tahun **${years[crossI]}** (${t.keep === "atas" ? "turun di bawah" : "naik di atas"} ambang); ambang ini merupakan ${t.source}.`;
}

function judgement(v: OutputVariable, diff: number): string {
  if (v.arah === "Maksimum") {
    return diff > 0
      ? `artinya kinerja dimensi ${dimensionName(v)} **lebih baik**`
      : `artinya kinerja dimensi ${dimensionName(v)} **lebih buruk**`;
  }
  if (v.arah === "Minimum") {
    return diff < 0
      ? `untuk indikator ini nilai lebih rendah berarti kinerja dimensi ${dimensionName(v)} **lebih baik**`
      : `untuk indikator ini nilai lebih tinggi berarti kinerja dimensi ${dimensionName(v)} **lebih buruk**`;
  }
  if (v.arah === "Dilaporkan") return "indikator skala ini tidak dinilai baik atau buruk";
  if (v.dimension === "Struktur Model") return "variabel struktur model ini bukan indikator kinerja sehingga tidak dinilai baik atau buruk";
  return "indikator ini deskriptif sehingga tidak dinilai baik atau buruk";
}

// Interpretasi satu seri (halaman Eksplorasi Simulasi, atau satu skenario).
// `baseline` adalah seri BAU untuk pembanding; kosongkan bila seri ini BAU.
export function interpretSingle(
  v: OutputVariable,
  years: number[],
  values: number[],
  opts: { subject: string; baseline?: number[] | null }
): Interpretation {
  const points: string[] = [];
  const trend = trendPoints(v, years, values);
  if (trend.length) trend[0] = `${opts.subject}, ${trend[0].charAt(0).toLowerCase()}${trend[0].slice(1)}`;
  points.push(...trend);

  const n = values.length;
  if (opts.baseline && opts.baseline.length === n) {
    const b = opts.baseline[n - 1];
    const d = pctChange(b, values[n - 1]);
    if (d !== null) {
      if (Math.abs(d) < 0.05) {
        points.push(`Nilai ${years[n - 1]} **praktis sama** dengan skenario Business-as-Usual (acuan tanpa intervensi).`);
      } else {
        points.push(
          `Dibanding skenario Business-as-Usual (acuan tanpa intervensi), nilai ${years[n - 1]} ${d > 0 ? "lebih tinggi" : "lebih rendah"} **${formatPct(Math.abs(d), false)}**; ${judgement(v, d)}.`
        );
      }
    } else if (Math.abs(b) < 1e-6 && Math.abs(values[n - 1]) > 1e-6) {
      points.push(`Pada skenario Business-as-Usual nilainya nol, sedangkan pada pengaturan ini mencapai **${formatValue(values[n - 1], v.unit)}**.`);
    }
  }

  const th = thresholdPoint(v, years, values);
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

  const parts = series.map((s) => {
    let txt = `${s.label} **${formatValue(endOf(s), v.unit)}**`;
    if (bau && s.id !== "BAU") {
      const d = pctChange(endOf(bau), endOf(s));
      if (d !== null) txt += ` (${formatPct(d)} dibanding BAU)`;
    }
    return txt;
  });
  points.push(`Pada ${yEnd}: ${parts.join(", ")}.`);

  const ends = series.map(endOf);
  const ref = bau ? endOf(bau) : ends[0];
  const spread = Math.max(...ends.map((e) => Math.abs(pctChange(ref, e) ?? 0)));

  if (v.arah === "Maksimum" || v.arah === "Minimum") {
    if (spread < SMALL_PCT) {
      points.push(`Perbedaan antarskenario **sangat kecil** (di bawah ${nf(SMALL_PCT, 1)}%), sehingga kedua tuas kebijakan hampir tidak memengaruhi indikator ini hingga ${yEnd}.`);
    } else {
      const best = series.reduce((a, s) =>
        v.arah === "Maksimum" ? (endOf(s) > endOf(a) ? s : a) : endOf(s) < endOf(a) ? s : a
      );
      const how = v.arah === "Maksimum" ? "nilainya paling tinggi" : "nilainya paling rendah (nilai lebih rendah berarti lebih baik)";
      points.push(`Skenario **${best.label}** paling unggul pada indikator ini, dalam dimensi ${dimensionName(v)}, karena ${how}.`);
    }
  } else {
    const jenis =
      v.arah === "Dilaporkan"
        ? "Indikator skala ini"
        : v.dimension === "Struktur Model"
          ? "Variabel struktur model ini bukan indikator kinerja sehingga"
          : "Indikator ini deskriptif sehingga";
    points.push(`${jenis} tidak diperingkat; perbedaannya dibaca sebagai konsekuensi kebijakan, bukan sebagai baik atau buruk.`);
  }

  const t = THRESHOLDS[v.id];
  if (t) {
    const crossYears = series.map((s) => {
      const i = s.values.findIndex((x) => (t.keep === "atas" ? x < t.value : x > t.value));
      return { s, year: i === -1 ? null : years[i] };
    });
    const ambang = nf(t.value, t.value < 1 ? 3 : 1);
    const crossed = crossYears.filter((c) => c.year !== null);
    if (crossed.length === 0) {
      points.push(`Ambang **${ambang}** tidak terlewati pada semua skenario; ambang ini merupakan ${t.source}.`);
    } else {
      const list = crossed
        .sort((a, b) => (a.year as number) - (b.year as number))
        .map((c) => `${c.s.label} ${c.year}`)
        .join(", ");
      let s = `Ambang **${ambang}** terlewati pada ${crossed.length === series.length ? "semua skenario" : `${crossed.length} skenario`} (${list}).`;
      if (crossed.length === series.length && series.length > 1) {
        const ys = crossed.map((c) => c.year as number);
        const gap = Math.max(...ys) - Math.min(...ys);
        s += ` Selisih waktunya hanya **${gap} tahun**, artinya tuas kebijakan menggeser waktu terlewatinya ambang, bukan mencegahnya.`;
      }
      points.push(s + ` Ambang ini merupakan ${t.source}.`);
    }
  }

  return { points, context: VARIABLE_CONTEXT[v.id] ?? "" };
}

export function describeParams(p: { insentif_kebijakan: number; kebijakan_konservasi_lahan: number }) {
  return `Pada pengaturan ini (Insentif Kebijakan ${nf(p.insentif_kebijakan * 100, 0)}%, Konservasi Lahan ${nf(p.kebijakan_konservasi_lahan * 100, 0)}%)`;
}
