"use client";

import { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { buildComparison, isNiceLogTick, type CompareInput, type CompareMode } from "@/lib/comparison";
import { formatValue, nf } from "@/lib/interpretation";

ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, PointElement, LineElement, Title, Tooltip, Legend);

// Warna dibedakan per variabel, jenis garis per skenario, sehingga garis
// variabel yang sama pada tiga skenario mudah dikenali sebagai satu kelompok.
const PALETTE = [
  "#1D5A8C", "#F28E2B", "#E15759", "#59A14F", "#B07AA1", "#76B7B2", "#EDC948",
  "#9C755F", "#FF9DA7", "#4E79A7", "#BAB0AC", "#17BECF", "#2CA02C", "#8C564B",
];
const DASH: Record<string, number[]> = { BAU: [], SUS: [7, 4], DP: [2, 3] };
const SCENARIO_NAMES: Record<string, string> = { BAU: "Business-as-Usual", SUS: "Sustainable", DP: "Development Priority" };

const compact = new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 2 });

interface Props {
  years: number[];
  inputs: CompareInput[];
  title: string;
  heightPx?: number;
}

export default function ComparisonChart({ years, inputs, title, heightPx = 450 }: Props) {
  const [mode, setMode] = useState<CompareMode>("indeks");
  // null = mengikuti saran otomatis; true/false = pilihan pengguna.
  const [logChoice, setLogChoice] = useState<boolean | null>(null);
  const baseYear = years[0];

  // Variabel yang disembunyikan lewat legenda; saran skala log dihitung
  // ulang dari garis yang tampak saja.
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const visibleInputs = useMemo(() => inputs.filter((s) => !hidden.has(s.variable.id)), [inputs, hidden]);

  const result = useMemo(() => buildComparison(visibleInputs, mode), [visibleInputs, mode]);
  const useLog = logChoice ?? result.suggestLog;

  const variables = useMemo(
    () => [...new Map(inputs.map((s) => [s.variable.id, s.variable])).values()],
    [inputs]
  );
  const scenarioIds = [...new Set(inputs.map((s) => s.scenarioId).filter((id): id is string => !!id))];
  const colorOf = (id: string) => PALETTE[variables.findIndex((v) => v.id === id) % PALETTE.length];
  const toggle = (id: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const datasets = result.lines.map((l) => {
    const color = colorOf(l.variable.id);
    return {
      label: l.label,
      // Sumbu log tidak dapat menggambar nilai ≤ 0: titik itu dikosongkan.
      data: l.plotted.map((v) => (useLog && !(v > 0) ? null : v)),
      borderColor: color,
      backgroundColor: color,
      borderWidth: 2,
      borderDash: DASH[l.scenarioId ?? ""] ?? [],
      pointRadius: 0,
      pointHoverRadius: 5,
      tension: 0.3,
      fill: false,
    };
  });

  const tickLabel = (v: number) => (mode === "indeks" ? nf(v, v < 10 ? 1 : 0) : compact.format(v));

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      // Judul sudah tampil di kepala kartu.
      title: { display: false, text: title },
      // Legenda dibuat sendiri di bawah grafik (warna = variabel, jenis garis = skenario).
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        callbacks: {
          label: (ctx: TooltipItem<"line">) => {
            const line = result.lines[ctx.datasetIndex];
            const raw = line.values[ctx.dataIndex];
            const asli = formatValue(raw, line.variable.unit, line.variable.id);
            if (mode === "asli") return `${line.label}: ${asli}`;
            return `${line.label}: indeks ${nf(line.plotted[ctx.dataIndex], 0)} (${asli})`;
          },
        },
      },
    },
    scales: {
      y: {
        type: useLog ? "logarithmic" : "linear",
        title: {
          display: true,
          text: mode === "indeks" ? `Indeks (${baseYear} = 100)` : "Nilai asli (satuan berbeda-beda)",
          font: { size: 13, weight: 600 },
        },
        ticks: {
          font: { size: 12 },
          callback: (value) => {
            const v = Number(value);
            if (useLog && !isNiceLogTick(v)) return "";
            return tickLabel(v);
          },
        },
        grid: {
          // Garis 100 = kondisi tahun dasar, dipertegas sebagai patokan.
          color: (ctx) =>
            mode === "indeks" && Math.abs((ctx.tick?.value ?? 0) - 100) < 1e-9 ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.08)",
          lineWidth: (ctx) => (mode === "indeks" && Math.abs((ctx.tick?.value ?? 0) - 100) < 1e-9 ? 1.5 : 1),
        },
      },
      x: { ticks: { font: { size: 12 } }, grid: { display: false } },
    },
  };

  const btn = (active: boolean) =>
    `px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
      active ? "bg-[#1D5A8C] text-white" : "text-[#1D5A8C] hover:bg-blue-50"
    }`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div role="group" aria-label="Cara menampilkan nilai" className="inline-flex rounded-lg border border-[#1D5A8C]/30 p-0.5 bg-white">
          <button type="button" className={btn(mode === "indeks")} aria-pressed={mode === "indeks"} onClick={() => setMode("indeks")}>
            Pertumbuhan ({baseYear} = 100)
          </button>
          <button type="button" className={btn(mode === "asli")} aria-pressed={mode === "asli"} onClick={() => setMode("asli")}>
            Nilai asli
          </button>
        </div>
        <label className="inline-flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            className="accent-[#1D5A8C] w-4 h-4"
            checked={useLog}
            onChange={(e) => setLogChoice(e.target.checked)}
          />
          Skala logaritmik
          {logChoice === null && result.suggestLog && <span className="text-gray-400">(dipilih otomatis)</span>}
        </label>
      </div>

      <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3 text-xs text-gray-600 leading-relaxed space-y-1.5">
        {mode === "indeks" ? (
          <p>
            Setiap variabel diukur terhadap nilainya di tahun {baseYear}, yang disetarakan menjadi <strong>100</strong>{" "}
            (garis tebal). <strong>200</strong> berarti dua kali lipat, <strong>50</strong> berarti tinggal separuhnya. Dengan
            cara ini variabel yang satuannya berbeda bisa dibandingkan laju perubahannya.
            {scenarioIds.length > 1 && ` Semua skenario memakai patokan yang sama (nilai ${baseYear} skenario Business-as-Usual).`}{" "}
            Arahkan kursor atau ketuk grafik untuk melihat nilai aslinya.
          </p>
        ) : (
          <p>
            Garis digambar dengan angka aslinya. Karena satuannya berbeda-beda (kunjungan, jiwa, rupiah, hektar, dan
            seterusnya), tinggi-rendah garis antarvariabel tidak dapat dibandingkan langsung.
          </p>
        )}
        {useLog && (
          <p>
            <strong>Skala logaritmik:</strong> jarak yang sama pada sumbu tegak berarti kelipatan yang sama (100→200 sama
            tingginya dengan 1.000→2.000). Skala ini dipakai agar variabel yang tumbuh jauh lebih cepat tidak membuat garis
            lain tampak datar.
            {logChoice === null &&
              mode === "indeks" &&
              " Sembunyikan variabel yang melonjak itu lewat daftar di bawah grafik untuk kembali ke skala biasa."}
          </p>
        )}
        {mode === "indeks" && result.skipped.length > 0 && (
          <p>
            Tidak ditampilkan pada mode ini karena nilainya di tahun {baseYear} adalah nol, sehingga tidak dapat dijadikan
            patokan: {result.skipped.join(", ")}. Lihat grafik individualnya atau pilih &ldquo;Nilai asli&rdquo;.
          </p>
        )}
        {useLog && result.hasNonPositive && (
          <p>
            Nilai nol tidak dapat digambar pada skala logaritmik, jadi garis berikut tidak tampak (seluruhnya atau
            sebagian):{" "}
            {result.lines
              .filter((l) => l.plotted.some((v) => !(v > 0)))
              .map((l) => l.label)
              .join(", ")}
            .
          </p>
        )}
      </div>

      <div className="w-full" style={{ height: `${heightPx}px` }} role="img" aria-label={title}>
        <Line data={{ labels: years.map(String), datasets }} options={options} />
      </div>

      <div className="space-y-2">
        <ul className="flex flex-wrap gap-2" aria-label="Variabel pada grafik">
          {variables.map((v) => {
            const off = hidden.has(v.id);
            return (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => toggle(v.id)}
                  aria-pressed={!off}
                  title={off ? "Klik untuk menampilkan" : "Klik untuk menyembunyikan"}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors ${
                    off ? "border-gray-200 text-gray-400 line-through" : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="inline-block w-3 h-3 rounded-full" style={{ background: off ? "#d1d5db" : colorOf(v.id) }} />
                  {v.label}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="text-[11px] text-gray-400 px-1">
          Klik nama variabel untuk menyembunyikan atau menampilkan garisnya.
          {scenarioIds.length > 1 && " Warna menunjukkan variabel, jenis garis menunjukkan skenario:"}
        </p>
        {scenarioIds.length > 1 && (
          <ul className="flex flex-wrap gap-x-5 gap-y-1 px-1 text-xs text-gray-600" aria-label="Jenis garis per skenario">
            {scenarioIds.map((id) => (
              <li key={id} className="inline-flex items-center gap-2">
                <svg width="28" height="6" aria-hidden="true">
                  <line x1="0" y1="3" x2="28" y2="3" stroke="#374151" strokeWidth="2" strokeDasharray={(DASH[id] ?? []).join(" ")} />
                </svg>
                {SCENARIO_NAMES[id] ?? id}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
