"use client";

import { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { buildComparison, type CompareInput, type CompareMode } from "@/lib/comparison";
import { formatValue, nf } from "@/lib/interpretation";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Warna dibedakan per variabel, jenis garis per skenario, sehingga garis
// variabel yang sama pada tiga skenario mudah dikenali sebagai satu kelompok.
const PALETTE = [
  "#1D5A8C", "#F28E2B", "#E15759", "#59A14F", "#B07AA1", "#76B7B2", "#EDC948",
  "#9C755F", "#FF9DA7", "#4E79A7", "#BAB0AC", "#17BECF", "#2CA02C", "#8C564B",
];
const DASH: Record<string, number[]> = { BAU: [], SUS: [7, 4], DP: [2, 3] };
const SCENARIO_NAMES: Record<string, string> = { BAU: "Business-as-Usual", SUS: "Sustainable", DP: "Development Priority" };

interface Props {
  years: number[];
  inputs: CompareInput[];
  title: string;
  heightPx?: number;
}

export default function ComparisonChart({ years, inputs, title, heightPx = 450 }: Props) {
  const baseYear = years[0];
  const [mode, setMode] = useState<CompareMode>("indeks");

  // Variabel yang disembunyikan lewat legenda.
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const result = useMemo(() => buildComparison(inputs, mode), [inputs, mode]);
  const visibleLines = result.lines.filter((l) => !hidden.has(l.variable.id));

  const variables = useMemo(
    () => [...new Map(result.lines.map((s) => [s.variable.id, s.variable])).values()],
    [result]
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

  const datasets = visibleLines.map((l) => {
    const color = colorOf(l.variable.id);
    return {
      label: l.label,
      data: l.plotted.map((v) => (Number.isNaN(v) ? null : v)),
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
            const line = visibleLines[ctx.datasetIndex];
            const asli = formatValue(line.values[ctx.dataIndex], line.variable.unit, line.variable.id);
            const p = line.plotted[ctx.dataIndex];
            return mode === "ln"
              ? `${line.label}: ${asli} (ln = ${nf(p, 2)})`
              : `${line.label}: ${asli} (indeks ${nf(p, 0)})`;
          },
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: mode === "ln" ? "ln(nilai)" : `Indeks (${baseYear} = 100)`,
          font: { size: 13, weight: 600 },
        },
        ticks: { font: { size: 12 }, callback: (value) => nf(Number(value), mode === "ln" ? 1 : 0) },
        grid: {
          // Garis 100 = kondisi tahun dasar, dipertegas sebagai patokan.
          color: (ctx) => (mode === "indeks" && ctx.tick?.value === 100 ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.08)"),
          lineWidth: (ctx) => (mode === "indeks" && ctx.tick?.value === 100 ? 1.5 : 1),
        },
      },
      x: { ticks: { font: { size: 12 } }, grid: { display: false } },
    },
  };

  const notes: string[] = [];
  if (result.overlaps.length)
    notes.push(
      `Garis ${result.overlaps.map(([a, b]) => `${a} dan ${b}`).join("; ")} saling menumpuk karena keduanya tumbuh dengan laju yang sama.`
    );
  if (result.cumulative.length)
    notes.push(
      `${result.cumulative.join(" dan ")} tidak dimasukkan ke grafik ini karena berupa jumlah yang terus ditambahkan setiap tahun, sehingga angkanya melonjak puluhan kali lipat dan membuat garis lain tampak datar. Lihat grafik individualnya.`
    );
  if (result.zeroBase.length)
    notes.push(
      mode === "ln"
        ? `ln dari nol tidak terdefinisi, jadi garis berikut tidak tampak (seluruhnya atau sebagian): ${result.zeroBase.join(", ")}.`
        : `${result.zeroBase.join(" dan ")} tidak dimasukkan karena nilainya di tahun ${baseYear} nol, sehingga tidak bisa dijadikan patokan. Lihat grafik individualnya.`
    );

  const tab = (m: CompareMode) =>
    `px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
      mode === m ? "bg-[#1D5A8C] text-white" : "text-[#1D5A8C] hover:bg-blue-50"
    }`;

  return (
    <div className="space-y-4">
      <div role="group" aria-label="Cara menampilkan nilai" className="inline-flex rounded-lg border border-[#1D5A8C]/30 p-0.5 bg-white">
        <button type="button" className={tab("indeks")} aria-pressed={mode === "indeks"} onClick={() => setMode("indeks")}>
          Indeks pertumbuhan
        </button>
        <button type="button" className={tab("ln")} aria-pressed={mode === "ln"} onClick={() => setMode("ln")}>
          Log natural (ln)
        </button>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
        {mode === "indeks" ? (
          <>
            Grafik ini membandingkan <strong>seberapa cepat</strong> setiap variabel berubah. Nilai tahun {baseYear} dianggap{" "}
            <strong>100</strong> (garis tebal): angka 150 berarti naik 50%, angka 80 berarti turun 20%.
          </>
        ) : (
          <>
            Setiap nilai diubah menjadi logaritma natural (ln) agar variabel bernilai puluhan juta dan bernilai kecil bisa
            tampil bersama. <strong>Tinggi garis tidak untuk dibandingkan</strong> antarvariabel karena satuannya berbeda;
            yang dibandingkan adalah <strong>kemiringannya</strong>: naik 0,1 ≈ tumbuh 10%, naik 0,69 = dua kali lipat.
          </>
        )}{" "}
        Arahkan kursor atau ketuk grafik untuk melihat angka sebenarnya.
      </p>

      {result.lines.length > 0 ? (
        <div className="w-full" style={{ height: `${heightPx}px` }} role="img" aria-label={title}>
          <Line data={{ labels: years.map(String), datasets }} options={options} />
        </div>
      ) : (
        <p className="text-sm text-gray-500 px-1">Pilih variabel lain untuk dibandingkan di grafik ini.</p>
      )}

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
        {notes.map((n) => (
          <p key={n} className="text-xs text-gray-500 px-1 leading-relaxed">
            {n}
          </p>
        ))}
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
