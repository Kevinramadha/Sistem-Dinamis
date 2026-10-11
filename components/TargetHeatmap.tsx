"use client";

import type { CellStatus, GridResult, Point } from "@/lib/goalSeek";

const COLORS: Record<CellStatus, string> = {
  semua: "#3A9C77",
  utama: "#F4CD53",
  tidak: "#e2e8f0",
};

const W = 520;
const H = 400;
const M = { top: 12, right: 12, bottom: 46, left: 56 };

const pctLabel = (v: number) => `${Math.round(v * 100)}%`;

interface Marker {
  point: Point;
  label: string;
  primary?: boolean;
}

/**
 * Peta ruang dua tuas: sumbu x Insentif Kebijakan, sumbu y Kebijakan
 * Konservasi Lahan. Setiap sel adalah satu titik grid simulasi, diwarnai
 * menurut target mana yang terpenuhi.
 */
export default function TargetHeatmap({
  grid,
  xKey,
  yKey,
  markers,
  hasConstraints,
}: {
  grid: GridResult;
  xKey: string;
  yKey: string;
  markers: Marker[];
  hasConstraints: boolean;
}) {
  const { xs, ys, cells } = grid;
  const pw = W - M.left - M.right;
  const ph = H - M.top - M.bottom;
  const cw = pw / xs.length;
  const ch = ph / ys.length;
  const xMin = xs[0];
  const xMax = xs[xs.length - 1];
  const yMin = ys[0];
  const yMax = ys[ys.length - 1];
  // Pusat sel pertama/terakhir berada di tepi nilai minimum/maksimum.
  const sx = (v: number) => M.left + cw / 2 + ((v - xMin) / (xMax - xMin)) * (pw - cw);
  const sy = (v: number) => M.top + ph - ch / 2 - ((v - yMin) / (yMax - yMin)) * (ph - ch);
  const xTicks = [0, 0.1, 0.2, 0.3, 0.4, 0.5].filter((t) => t >= xMin - 1e-9 && t <= xMax + 1e-9);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].filter((t) => t >= yMin - 1e-9 && t <= yMax + 1e-9);

  return (
    <figure className="space-y-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto max-w-[620px]"
        role="img"
        aria-label="Peta ruang tuas kebijakan: wilayah hijau memenuhi semua target"
      >
        {cells.map((c, k) => {
          const i = k % xs.length;
          const j = Math.floor(k / xs.length);
          return (
            <rect
              key={k}
              x={sx(xs[i]) - cw / 2}
              y={sy(ys[j]) - ch / 2}
              width={cw + 0.4}
              height={ch + 0.4}
              fill={COLORS[c.status]}
            >
              <title>{`Insentif ${pctLabel(xs[i])}, Konservasi ${pctLabel(ys[j])}`}</title>
            </rect>
          );
        })}
        <rect x={M.left} y={M.top} width={pw} height={ph} fill="none" stroke="#94a3b8" />

        {xTicks.map((t) => (
          <g key={`x${t}`}>
            <line x1={sx(t)} x2={sx(t)} y1={M.top + ph} y2={M.top + ph + 5} stroke="#64748b" />
            <text x={sx(t)} y={M.top + ph + 18} textAnchor="middle" fontSize="11" fill="#475569">
              {pctLabel(t)}
            </text>
          </g>
        ))}
        {yTicks.map((t) => (
          <g key={`y${t}`}>
            <line x1={M.left - 5} x2={M.left} y1={sy(t)} y2={sy(t)} stroke="#64748b" />
            <text x={M.left - 8} y={sy(t) + 4} textAnchor="end" fontSize="11" fill="#475569">
              {pctLabel(t)}
            </text>
          </g>
        ))}
        <text x={M.left + pw / 2} y={H - 6} textAnchor="middle" fontSize="12" fontWeight="600" fill="#334155">
          Insentif Kebijakan
        </text>
        <text
          x={14}
          y={M.top + ph / 2}
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill="#334155"
          transform={`rotate(-90 14 ${M.top + ph / 2})`}
        >
          Kebijakan Konservasi Lahan
        </text>

        {markers.map((m) => {
          const x = sx(m.point[xKey]);
          const y = sy(m.point[yKey]);
          return (
            <g key={m.label}>
              <circle cx={x} cy={y} r={m.primary ? 10 : 8} fill="white" stroke={m.primary ? "#b42318" : "#1D5A8C"} strokeWidth={2.5} />
              <text x={x} y={y + 4} textAnchor="middle" fontSize={m.primary ? 11 : 10} fontWeight="700" fill={m.primary ? "#b42318" : "#1D5A8C"}>
                {m.label}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: COLORS.semua }} />
          Memenuhi {hasConstraints ? "semua target" : "target"}
        </span>
        {hasConstraints && (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: COLORS.utama }} />
            Target utama tercapai, tetapi batasan dilanggar
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border border-gray-300" style={{ background: COLORS.tidak }} />
          Target utama belum tercapai
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-[#b42318] bg-white" /> R = rekomendasi
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-[#1D5A8C] bg-white" /> 1–4 = alternatif
        </span>
      </figcaption>
    </figure>
  );
}
