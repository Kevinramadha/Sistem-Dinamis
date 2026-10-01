import { outputVariables, type OutputVariable } from "./scenarios";
import {
  KEPADATAN_BATAS,
  RASIO_BATAS,
  SMALL_PCT,
  formatValue,
  nf,
  pct,
  pctChange,
} from "./interpretation";

// Ringkasan singkat di atas hasil simulasi. Dihitung dari seluruh indikator
// kinerja (bukan hanya grafik yang dipilih) dan dikelompokkan per sisi
// keberlanjutan, mengikuti aturan pelaporan skripsi: pembanding BAU, keunggulan
// disebut per sisi, tanpa skor gabungan, dan status batas dilaporkan terpisah.

export type Tone = "baik" | "buruk" | "campuran" | "netral";

export interface SummaryRow {
  label: string; // "Ekonomi", "Lingkungan", "Sosial"
  status: string; // "Lebih baik", "Development Priority unggul", ...
  tone: Tone;
  text: string;
}

export interface Summary {
  headline: string;
  rows: SummaryRow[];
  warnings: string[];
  conclusion: string;
}

type Series = Record<string, number[]>;

export interface NamedSeries {
  id: string;
  label: string;
  data: Series;
}

const DIMENSIONS = ["Ekonomi", "Lingkungan", "Sosial"] as const;

const SHORT: Record<string, string> = {
  tenaga_kerja_pariwisata: "lapangan kerja",
  pdrb_sektor_pariwisata: "nilai tambah ekonomi (PDRB)",
  rasio_daya_dukung_lahan: "lahan belum terbangun",
  lahan_terbangun: "lahan terbangun",
  akumulasi_konversi_lahan_pariwisata: "alih fungsi lahan untuk pariwisata",
  indeks_kepadatan: "kepadatan wisatawan",
  daya_tarik_wisata: "daya tarik destinasi",
};

const ranked = (dim: string) =>
  outputVariables.filter((v) => v.dimension === dim && (v.arah === "Maksimum" || v.arah === "Minimum"));

const last = (xs: number[]) => xs[xs.length - 1];

const isGood = (v: OutputVariable, d: number) => (v.arah === "Maksimum" ? d > 0 : d < 0);

const joinList = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} dan ${items[items.length - 1]}`;

// Uraian singkat perubahan 2025→2050 untuk kondisi tanpa pembanding (BAU).
function trendShort(v: OutputVariable, values: number[]): string {
  const a = values[0];
  const b = last(values);
  switch (v.id) {
    case "rasio_daya_dukung_lahan":
      return `lahan belum terbangun menyusut dari ${nf(a * 100, 1)}% menjadi ${nf(b * 100, 1)}% wilayah DIY`;
    case "akumulasi_konversi_lahan_pariwisata":
      return b < 0.05
        ? "tidak ada lahan yang dialihfungsikan untuk pariwisata"
        : `${formatValue(b, v.unit)} lahan dialihfungsikan untuk pariwisata`;
    case "indeks_kepadatan":
      return `kepadatan wisatawan menjadi ${nf(b, 2)} kali kondisi 2025`;
    default: {
      const p = pctChange(a, b) ?? 0;
      if (Math.abs(p) < SMALL_PCT) return `${SHORT[v.id]} relatif tetap`;
      if (p >= 100) return `${SHORT[v.id]} naik sekitar ${nf(b / a, 1)} kali lipat`;
      return `${SHORT[v.id]} ${p > 0 ? "naik" : "turun"} ${pct(p)}`;
    }
  }
}

// Uraian selisih satu indikator terhadap BAU.
function diffShort(v: OutputVariable, value: number, base: number): { text: string; d: number | null } {
  if (v.id === "akumulasi_konversi_lahan_pariwisata" && value < 0.05 && base >= 0.05) {
    return { text: `alih fungsi lahan untuk pariwisata menjadi nol (sebelumnya ${formatValue(base, v.unit)})`, d: -100 };
  }
  const d = pctChange(base, value);
  if (d === null) return { text: `${SHORT[v.id]} ${formatValue(value, v.unit)}`, d: null };
  if (Math.abs(d) < SMALL_PCT) return { text: `${SHORT[v.id]} hampir sama`, d };
  return { text: `${SHORT[v.id]} ${pct(d)} lebih ${d > 0 ? "tinggi" : "rendah"}`, d };
}

function warningsFor(seriesList: { label: string; data: Series }[], years: number[], compare: boolean): string[] {
  const out: string[] = [];
  const crossYear = (xs: number[], test: (x: number) => boolean) => {
    const i = xs.findIndex(test);
    return i === -1 ? null : years[i];
  };

  const kep = seriesList
    .map((s) => ({ label: s.label, year: crossYear(s.data.indeks_kepadatan ?? [], (x) => x > KEPADATAN_BATAS) }))
    .filter((c) => c.year !== null)
    .sort((a, b) => (a.year as number) - (b.year as number));
  if (kep.length > 0) {
    if (compare) {
      const ys = kep.map((c) => c.year as number);
      let s = `Kepadatan wisatawan melewati batas waspada (2 kali lipat kondisi 2025) pada ${kep.length === seriesList.length ? "semua skenario" : `${kep.length} skenario`}: ${kep.map((c) => `${c.label} mulai ${c.year}`).join(", ")}.`;
      if (kep.length === seriesList.length && seriesList.length > 1) {
        s += ` Kebijakan yang diuji hanya menunda masalah ini sekitar ${Math.max(...ys) - Math.min(...ys)} tahun, belum mencegahnya.`;
      }
      out.push(s);
    } else {
      out.push(`Mulai ${kep[0].year}, kepadatan wisatawan melewati batas waspada (lebih dari 2 kali lipat kondisi 2025).`);
    }
  }

  const lahan = seriesList
    .map((s) => ({ label: s.label, year: crossYear(s.data.rasio_daya_dukung_lahan ?? [], (x) => x < RASIO_BATAS) }))
    .filter((c) => c.year !== null);
  if (lahan.length > 0) {
    out.push(
      compare
        ? `Lahan belum terbangun turun di bawah batas minimum 33,1% wilayah DIY pada: ${lahan.map((c) => `${c.label} mulai ${c.year}`).join(", ")}.`
        : `Mulai ${lahan[0].year}, lahan belum terbangun turun di bawah batas minimum 33,1% wilayah DIY.`
    );
  }
  return out;
}

// Ringkasan untuk satu pengaturan (Eksplorasi Simulasi atau satu skenario).
export function summarizeSingle(
  data: Series & { years: number[] },
  baseline: Series | null,
  opts: { lead: string; hintWhenBaseline: string }
): Summary {
  const years = data.years;
  const yEnd = last(years);
  const wis = data.jumlah_wisatawan;
  let headline = `${opts.lead} kunjungan wisatawan pada ${yEnd} mencapai **${formatValue(last(wis), "kunjungan")}**, sekitar ${nf(last(wis) / wis[0], 1)} kali lipat ${years[0]}`;
  if (baseline) {
    const d = pctChange(last(baseline.jumlah_wisatawan), last(wis));
    if (d !== null && Math.abs(d) >= 0.05) headline += `, atau ${pct(d)} lebih ${d > 0 ? "banyak" : "sedikit"} dibanding tanpa kebijakan tambahan`;
  }
  headline += ".";

  const rows: SummaryRow[] = DIMENSIONS.map((dim) => {
    const vars = ranked(dim);
    if (!baseline) {
      return {
        label: dim,
        status: "Kondisi acuan",
        tone: "netral" as Tone,
        text: capitalize(joinList(vars.map((v) => trendShort(v, data[v.id] ?? [])))) + ".",
      };
    }
    const changed: { text: string; good: boolean }[] = [];
    const same: string[] = [];
    vars.forEach((v) => {
      const r = diffShort(v, last(data[v.id] ?? []), last(baseline[v.id] ?? []));
      if (r.d !== null && Math.abs(r.d) >= SMALL_PCT) changed.push({ text: r.text, good: isGood(v, r.d) });
      else same.push(SHORT[v.id]);
    });
    const good = changed.filter((c) => c.good).length;
    const bad = changed.length - good;
    const tone: Tone = good && !bad ? "baik" : bad && !good ? "buruk" : good && bad ? "campuran" : "netral";
    const status = { baik: "Lebih baik", buruk: "Kurang baik", campuran: "Ada untung-ruginya", netral: "Hampir sama" }[tone];
    let text: string;
    if (changed.length === 0) {
      text = `${capitalize(joinList(same))} hampir sama dengan kondisi tanpa kebijakan tambahan.`;
    } else {
      const items = changed.map((c) => (tone === "campuran" ? `${c.text} (${c.good ? "baik" : "kurang baik"})` : c.text));
      text = `${capitalize(joinList(items))} dibanding tanpa kebijakan tambahan.`;
      if (same.length) text += ` ${capitalize(joinList(same))} hampir sama.`;
    }
    return { label: dim, status, tone, text };
  });

  const warnings = warningsFor([{ label: "", data }], years, false);

  let conclusion: string;
  if (!baseline) {
    conclusion = opts.hintWhenBaseline;
  } else {
    const by = (t: Tone) => rows.filter((r) => r.tone === t).map((r) => r.label.toLowerCase());
    const baik = by("baik");
    const buruk = by("buruk");
    const campur = by("campuran");
    const bits: string[] = [];
    if (baik.length) bits.push(`**menguntungkan** sisi ${joinList(baik)}`);
    if (buruk.length) bits.push(`${bits.length ? "tetapi " : ""}**kurang baik** untuk sisi ${joinList(buruk)}`);
    if (campur.length) bits.push(`${bits.length ? "serta " : ""}**ada untung-ruginya** di sisi ${joinList(campur)}`);
    conclusion = bits.length
      ? `Dibanding tanpa kebijakan tambahan, pengaturan ini ${bits.join(", ")}.`
      : "Dibanding tanpa kebijakan tambahan, pengaturan ini hampir tidak mengubah hasil di semua sisi.";
    if (baik.length === DIMENSIONS.length) conclusion = "Dibanding tanpa kebijakan tambahan, pengaturan ini **menguntungkan di semua sisi**.";
  }

  return { headline, rows, warnings, conclusion };
}

// Ringkasan perbandingan beberapa skenario (halaman Skenario).
export function summarizeCompare(series: NamedSeries[], years: number[]): Summary {
  const yEnd = last(years);
  const bau = series.find((s) => s.id === "BAU") ?? series[0];
  const headline = `Hasil ${series.length} skenario pada ${yEnd} dibandingkan dengan **Business-as-Usual** (tanpa kebijakan tambahan) sebagai acuan.`;

  const winners: string[] = [];
  const rows: SummaryRow[] = DIMENSIONS.map((dim) => {
    const vars = ranked(dim);
    const results = vars.map((v) => {
      const ends = series.map((s) => last(s.data[v.id] ?? []));
      const ref = last(bau.data[v.id] ?? []);
      const spread = Math.max(...ends.map((e) => Math.abs(pctChange(ref, e) ?? 0)));
      if (spread < SMALL_PCT) return { v, best: null as NamedSeries | null, detail: `${SHORT[v.id]} hampir sama di semua skenario` };
      const best = series.reduce((a, s) => {
        const x = last(s.data[v.id] ?? []);
        const y = last(a.data[v.id] ?? []);
        return v.arah === "Maksimum" ? (x > y ? s : a) : x < y ? s : a;
      });
      let detail: string;
      if (best.id === bau.id) {
        detail = `${SHORT[v.id]} paling ${v.arah === "Maksimum" ? "tinggi" : "rendah"}`;
      } else {
        detail = diffShort(v, last(best.data[v.id] ?? []), ref).text;
      }
      return { v, best, detail };
    });
    const bests = Array.from(new Set(results.filter((r) => r.best).map((r) => r.best!.label)));
    if (bests.length === 0) {
      return { label: dim, status: "Hampir sama", tone: "netral" as Tone, text: capitalize(joinList(results.map((r) => r.detail))) + "." };
    }
    if (bests.length === 1) {
      winners.push(bests[0]);
      const winner = series.find((s) => s.label === bests[0])!;
      const suffix = winner.id === bau.id ? "" : " dibanding BAU";
      return {
        label: dim,
        status: `${bests[0]} unggul`,
        tone: "baik" as Tone,
        text: capitalize(joinList(results.map((r) => r.detail))) + suffix + ".",
      };
    }
    return {
      label: dim,
      status: "Hasil terbagi",
      tone: "campuran" as Tone,
      text:
        capitalize(
          joinList(
            results.map((r) =>
              r.best ? `${SHORT[r.v.id]} paling ${r.v.arah === "Maksimum" ? "tinggi" : "rendah"} pada **${r.best.label}**` : r.detail
            )
          )
        ) + ".",
    };
  });

  const warnings = warningsFor(series, years, true);
  const distinct = Array.from(new Set(winners));
  const conclusion =
    distinct.length === 1 && winners.length === DIMENSIONS.length
      ? `Skenario **${distinct[0]}** unggul di semua sisi pada tahun ${yEnd}.`
      : "Tidak ada satu skenario yang unggul di semua sisi. Pilihan skenario bergantung pada sisi mana yang paling diprioritaskan: ekonomi, lingkungan, atau sosial.";

  return { headline, rows, warnings, conclusion };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
