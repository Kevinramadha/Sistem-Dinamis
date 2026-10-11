"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useBaseData } from "@/components/BaseDataProvider";
import InfoTip from "@/components/InfoTip";
import TargetHeatmap from "@/components/TargetHeatmap";
import {
  ASSUMPTIONS,
  INDICATORS,
  LEVER_DIMS,
  TARGET_MODES,
  assumptionDims,
  indicatorOf,
  validateTargets,
  type Candidate,
  type Dim,
  type IndicatorId,
  type SearchResult,
  type Target,
  type TargetEval,
  type TargetMode,
} from "@/lib/goalSeek";
import { SearchCancelled, cancelSearch, searchTargets } from "@/lib/goalSeekClient";
import { GLOSSARY } from "@/lib/glossary";
import { formatValue, nf } from "@/lib/interpretation";
import { runModel, type BaseOverride, type SimulationData } from "@/lib/model";
import { FIXED_PARAMS, RESEARCH_PARAMS } from "@/lib/parameterUpdate";
import { FINAL_YEAR } from "@/lib/baseData";
import { outputVariables } from "@/lib/scenarios";

const MAX_TARGETS = 3;

const LAJU_ODTW_DASAR =
  FIXED_PARAMS.flatMap((k) => k.items).find((i) => i.nama === "Laju Pembangunan ODTW Non Investasi")?.nilai ?? 5.427;

/** Nilai indikator dalam bahasa sehari-hari (memakai format yang sama dengan halaman lain). */
const showValue = (id: IndicatorId, v: number) => formatValue(v, outputVariables.find((o) => o.id === id)?.unit ?? "", id);
const rawValue = (v: number) => v.toLocaleString("id-ID", { maximumSignificantDigits: 6 });
const signedPct = (p: number) =>
  Math.abs(p) < 0.005 ? "0,00%" : `${p > 0 ? "+" : "−"}${nf(Math.abs(p), Math.abs(p) < 10 ? 2 : 1)}%`;
const leverPct = (v: number) => `${nf(v * 100, 1)}%`;

function ruleText(t: Target): string {
  const v = nf(t.value, t.value % 1 === 0 ? 0 : 2);
  switch (t.mode) {
    case "naik_min":
      return t.value === 0 ? "tidak lebih rendah dari BAU" : `naik minimal ${v}% dibanding BAU`;
    case "turun_min":
      return `turun minimal ${v}% dibanding BAU`;
    case "naik_maks":
      return t.value === 0 ? "tidak lebih tinggi dari BAU" : `naik paling banyak ${v}% dibanding BAU`;
    case "abs_min":
      return `minimal ${rawValue(t.value)}`;
    case "abs_maks":
      return `maksimal ${rawValue(t.value)}`;
  }
}

const describeTarget = (t: Target) => `${indicatorOf(t.indicator).label} ${t.year}: ${ruleText(t)}`;

function defaultTargets(baseYear: number): Target[] {
  const year = Math.min(FINAL_YEAR, Math.max(baseYear + 1, 2045));
  return [
    { indicator: "pdrb_sektor_pariwisata", year, mode: "naik_min", value: 5 },
    { indicator: "rasio_daya_dukung_lahan", year, mode: "naik_min", value: 0 },
  ];
}

interface RunState {
  targets: Target[];
  dims: Dim[];
  result: SearchResult;
  ms: number;
  base: BaseOverride | null;
}

// ── Halaman ─────────────────────────────────────────────────────────────────

export default function PencarianTargetPage() {
  const { override, baseYear, config } = useBaseData();
  const [targetsRaw, setTargets] = useState<Target[] | null>(null);
  const targets = targetsRaw ?? defaultTargets(baseYear);
  const [useAssumptions, setUseAssumptions] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [runRaw, setRun] = useState<RunState | null>(null);
  // Hasil disembunyikan bila data dasar berubah setelah pencarian dijalankan.
  const run = runRaw && runRaw.base === override ? runRaw : null;

  // BAU sebagai acuan nilai pada isian target absolut.
  const [bauRef, setBauRef] = useState<{ base: BaseOverride | null; data: SimulationData } | null>(null);
  const bau = bauRef && bauRef.base === override ? bauRef.data : null;
  useEffect(() => {
    let cancelled = false;
    runModel({ insentif_kebijakan: 0, kebijakan_konservasi_lahan: 0 }, override)
      .then((data) => !cancelled && setBauRef({ base: override, data }))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [override]);

  useEffect(() => cancelSearch, []);

  const years = Array.from({ length: FINAL_YEAR - baseYear }, (_, i) => baseYear + 1 + i);
  const assumptionBase = {
    lama_menginap: config?.params.lama_menginap ?? RESEARCH_PARAMS.lama_menginap,
    pengeluaran_per_kunjungan: config?.params.pengeluaran_per_kunjungan ?? RESEARCH_PARAMS.pengeluaran_per_kunjungan,
    laju_odtw_non_investasi: LAJU_ODTW_DASAR,
  };
  const dims: Dim[] = useAssumptions ? [...LEVER_DIMS, ...assumptionDims(assumptionBase)] : LEVER_DIMS;

  const updateTarget = (i: number, patch: Partial<Target>) =>
    setTargets(targets.map((t, k) => (k === i ? { ...t, ...patch } : t)));
  const removeTarget = (i: number) => setTargets(targets.filter((_, k) => k !== i));
  const addConstraint = () =>
    setTargets([...targets, { indicator: "indeks_kepadatan", year: targets[0]?.year ?? years[0], mode: "abs_maks", value: 2 }]);

  const start = async () => {
    const v = validateTargets(targets, baseYear);
    setErrors(v);
    if (v.length) return;
    setRunning(true);
    setProgress(0);
    try {
      const { result, ms } = await searchTargets(targets, dims, override, setProgress);
      setRun({ targets, dims, result, ms, base: override });
    } catch (err) {
      if (!(err instanceof SearchCancelled)) setErrors([`Pencarian gagal: ${err instanceof Error ? err.message : String(err)}`]);
    } finally {
      setRunning(false);
    }
  };

  const cancel = () => cancelSearch();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .pt * { font-family: 'DM Sans', sans-serif; }
        .pt .font-display { font-family: 'Sora', sans-serif; }
        .pt .section-label { font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #2BB3B6; }
        .page-hero { background: linear-gradient(135deg, #0d3554 0%, #1D5A8C 50%, #1a7a7c 100%); position: relative; overflow: hidden; }
        .page-hero::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(circle at 85% 30%, rgba(43,179,182,0.18) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(232,157,62,0.10) 0%, transparent 40%); }
        .pt .card { background: white; border: 1px solid #f1f5f9; border-radius: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .pt .btn { font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600; padding: 9px 16px; border-radius: 10px; transition: all .15s; display: inline-flex; align-items: center; gap: 6px; }
        .pt .btn-primary { background: #1D5A8C; color: white; }
        .pt .btn-primary:hover:not(:disabled) { background: #174a73; }
        .pt .btn-outline { background: white; color: #1D5A8C; border: 1.5px solid #1D5A8C; }
        .pt .btn-outline:hover:not(:disabled) { background: #eff6ff; }
        .pt .btn:disabled { opacity: .45; cursor: not-allowed; }
        .pt .field { border: 1px solid #e2e8f0; border-radius: 8px; padding: 7px 10px; font-size: 13.5px; background: white; width: 100%; }
        .pt .field:focus { outline: 2px solid #1D5A8C33; border-color: #1D5A8C; }
        .pt table td, .pt table th { padding: 8px 10px; font-size: 12.5px; white-space: nowrap; }
      `}</style>

      <div className="pt min-h-screen" style={{ background: "#f8fafc" }}>
        <section className="page-hero text-white">
          <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
            <p className="section-label mb-4" style={{ color: "#F4CD53" }}>Goal Seeking</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">
              Pencarian <span style={{ color: "#2BB3B6" }}>Target Kebijakan</span>
            </h1>
            <p className="text-blue-200 text-base max-w-2xl leading-relaxed">
              Tentukan hasil yang ingin dicapai, lalu aplikasi mencari nilai Insentif Kebijakan dan Kebijakan Konservasi Lahan
              yang dibutuhkan, dengan intervensi sekecil mungkin dari kondisi tanpa kebijakan tambahan (BAU).
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
          {/* Langkah 1: target */}
          <section className="card p-5 sm:p-6 space-y-4">
            <div>
              <p className="section-label mb-1">Langkah 1</p>
              <h2 className="font-display font-bold text-gray-900 text-lg">Tentukan target</h2>
              <p className="text-sm text-gray-500 mt-1">
                Baris pertama adalah <strong>target utama</strong>. Baris berikutnya adalah <strong>batasan</strong>: syarat yang
                tidak boleh dilanggar, misalnya kepadatan maksimal atau daya dukung lahan minimal.
              </p>
            </div>

            <div className="space-y-3">
              {targets.map((t, i) => (
                <TargetRow
                  key={i}
                  index={i}
                  target={t}
                  years={years}
                  bau={bau}
                  onChange={(patch) => updateTarget(i, patch)}
                  onRemove={i > 0 ? () => removeTarget(i) : undefined}
                />
              ))}
            </div>

            {targets.length < MAX_TARGETS && (
              <button type="button" className="btn btn-outline" onClick={addConstraint}>
                + Tambah batasan
              </button>
            )}
          </section>

          {/* Langkah 2: ruang pencarian */}
          <section className="card p-5 sm:p-6 space-y-4">
            <div>
              <p className="section-label mb-1">Langkah 2</p>
              <h2 className="font-display font-bold text-gray-900 text-lg">Ruang pencarian</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {LEVER_DIMS.map((d) => (
                <div key={d.key} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                    {d.label}
                    <InfoTip text={GLOSSARY[d.key]} label={d.label} />
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Dicari antara {leverPct(d.min)} dan {leverPct(d.max)} (sama dengan rentang slider di halaman Simulasi).
                  </p>
                </div>
              ))}
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 accent-[#b45309]"
                checked={useAssumptions}
                onChange={(e) => setUseAssumptions(e.target.checked)}
              />
              <span className="text-sm text-amber-900">
                <strong>Ikutkan asumsi tambahan</strong> (tidak aktif secara bawaan)
                <span className="block text-xs mt-1 leading-relaxed">
                  Ketiga nilai berikut adalah <strong>parameter model, bukan tuas kebijakan resmi</strong>. Mengaktifkannya berarti
                  bertanya &ldquo;bagaimana bila asumsi ini sedikit berbeda?&rdquo;, bukan memilih kebijakan. Masing-masing dicari
                  dalam rentang ±10% dari nilai dasarnya, sama seperti analisis sensitivitas model:
                </span>
                <span className="block text-xs mt-1">
                  {ASSUMPTIONS.map((a) => `${a.label} (${rawValue(assumptionBase[a.key])})`).join(" · ")}
                </span>
              </span>
            </label>

            {errors.length > 0 && (
              <div role="alert" className="rounded-xl px-4 py-3 text-sm bg-red-50 text-red-800 border border-red-200">
                <ul className="list-disc pl-5 space-y-0.5">
                  {errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="btn btn-primary" onClick={start} disabled={running}>
                {running ? "Mencari…" : "Cari kombinasi tuas"}
              </button>
              {running && (
                <button type="button" className="btn btn-outline" onClick={cancel}>
                  Batalkan
                </button>
              )}
              <span className="text-xs text-gray-500">
                {useAssumptions
                  ? "Latin Hypercube Sampling: sekitar 2.000 simulasi."
                  : "Grid 41 × 41 titik lalu bisection: sekitar 2.000 simulasi."}
              </span>
            </div>
            {running && (
              <div
                className="h-2 rounded-full bg-slate-100 overflow-hidden"
                role="progressbar"
                aria-label="Kemajuan pencarian"
                aria-valuenow={Math.round(progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full bg-[#2BB3B6] transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
              </div>
            )}
          </section>

          {run && <Results run={run} />}

          <p className="text-xs text-gray-500 leading-relaxed px-1">
            <strong>Catatan:</strong> hasil pencarian bersifat indikatif. Angka dibandingkan secara relatif terhadap kondisi
            Business-as-Usual (BAU) pada tahun yang sama, bukan ramalan nilai absolut, dan hanya mencakup variabel yang ada di
            dalam model. Faktor di luar model (anggaran, regulasi, dampak sosial lain) tetap perlu dipertimbangkan.
          </p>
        </div>
      </div>
    </>
  );
}

// ── Isian satu target ───────────────────────────────────────────────────────

function TargetRow({
  index,
  target,
  years,
  bau,
  onChange,
  onRemove,
}: {
  index: number;
  target: Target;
  years: number[];
  bau: SimulationData | null;
  onChange: (patch: Partial<Target>) => void;
  onRemove?: () => void;
}) {
  const relatif = TARGET_MODES.find((m) => m.id === target.mode)!.relatif;
  const idx = bau ? bau.years.indexOf(target.year) : -1;
  const bauValue = idx >= 0 ? bau![target.indicator][idx] : null;
  const unit = indicatorOf(target.indicator).unit;

  return (
    <div className="rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold" style={{ color: index === 0 ? "#1D5A8C" : "#475569" }}>
          {index === 0 ? "Target utama" : `Batasan ${index}`}
        </p>
        {onRemove && (
          <button type="button" onClick={onRemove} className="text-xs text-red-700 hover:underline">
            Hapus
          </button>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-[1.4fr_1.6fr_0.9fr_0.8fr]">
        <label className="text-xs text-gray-500 space-y-1">
          <span>Indikator</span>
          <select className="field" value={target.indicator} onChange={(e) => onChange({ indicator: e.target.value as IndicatorId })}>
            {INDICATORS.map((ind) => (
              <option key={ind.id} value={ind.id}>
                {ind.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-gray-500 space-y-1">
          <span>Jenis target</span>
          <select className="field" value={target.mode} onChange={(e) => onChange({ mode: e.target.value as TargetMode })}>
            {TARGET_MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-gray-500 space-y-1">
          <span>Nilai {relatif ? "(%)" : `(${unit})`}</span>
          <input
            className="field"
            type="number"
            step="any"
            min={0}
            value={Number.isFinite(target.value) ? target.value : ""}
            onChange={(e) => onChange({ value: e.target.value === "" ? NaN : Number(e.target.value) })}
          />
        </label>
        <label className="text-xs text-gray-500 space-y-1">
          <span>Tahun</span>
          <select className="field" value={target.year} onChange={(e) => onChange({ year: Number(e.target.value) })}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>
      {bauValue !== null && (
        <p className="text-xs text-gray-500">
          Sebagai acuan, nilai BAU {target.year}: <strong>{rawValue(bauValue)}</strong>{" "}
          ({showValue(target.indicator, bauValue)}).
        </p>
      )}
    </div>
  );
}

// ── Hasil ───────────────────────────────────────────────────────────────────

function applyHref(c: Candidate) {
  const q = new URLSearchParams({
    insentif: String(Math.round(c.point.insentif_kebijakan * 10000) / 10000),
    konservasi: String(Math.round(c.point.kebijakan_konservasi_lahan * 10000) / 10000),
  });
  return `/simulasi?${q.toString()}`;
}

function PointSummary({ c, dims }: { c: Candidate; dims: Dim[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {dims.map((d) => {
        const v = c.point[d.key];
        const text =
          d.kind === "tuas"
            ? leverPct(v)
            : `${rawValue(v)} (${signedPct((v / d.base - 1) * 100)} dari nilai dasar)`;
        return (
          <div
            key={d.key}
            className={`rounded-xl px-4 py-3 ${d.kind === "tuas" ? "bg-blue-50 border border-blue-100" : "bg-amber-50 border border-amber-200"}`}
          >
            <p className="text-xs text-gray-500">
              {d.label}
              {d.kind === "asumsi" && " · asumsi model, bukan tuas kebijakan"}
            </p>
            <p className="font-display font-bold text-lg text-gray-900">{text}</p>
          </div>
        );
      })}
    </div>
  );
}

function EvalTable({ targets, evals }: { targets: Target[]; evals: TargetEval[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead className="text-gray-500 border-b border-slate-100">
          <tr>
            <th>Target</th>
            <th>Syarat</th>
            <th>Hasil</th>
            <th>Dibanding BAU</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {targets.map((t, i) => {
            const e = evals[i];
            return (
              <tr key={i} className="border-b border-slate-50">
                <td className="font-medium text-gray-800">
                  {i === 0 ? "Utama" : `Batasan ${i}`}: {indicatorOf(t.indicator).label} {t.year}
                </td>
                <td className="text-gray-600">{ruleText(t)}</td>
                <td className="text-gray-800">{showValue(t.indicator, e.actual)}</td>
                <td className="text-gray-800">{signedPct(e.pct)}</td>
                <td>
                  {e.satisfied ? (
                    <span className="text-green-700 font-semibold">✓ Terpenuhi</span>
                  ) : (
                    <span className="text-red-700 font-semibold">✗ Belum</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Results({ run }: { run: RunState }) {
  const { targets, dims, result } = run;
  const rec = result.recommendation;
  const reached = result.status === "tercapai";
  const primary = targets[0];
  const hasConstraints = targets.length > 1;
  const rows = rec ? [rec, ...result.alternatives] : [];
  const asumsiDims = dims.filter((d) => d.kind === "asumsi");

  return (
    <section className="space-y-6" aria-live="polite">
      {/* Status */}
      <div
        className="card p-5 sm:p-6 border-l-4"
        style={{ borderLeftColor: reached ? "#3A9C77" : "#b42318" }}
      >
        <p className="section-label mb-1">Hasil pencarian</p>
        <p className="font-display text-2xl font-bold" style={{ color: reached ? "#2f7d60" : "#b42318" }}>
          {reached ? "TERCAPAI" : "TIDAK TERCAPAI"}
        </p>
        <div className="text-sm text-gray-700 mt-2 space-y-1.5 leading-relaxed">
          {reached && rec && rec.distance === 0 && (
            <p>Target sudah terpenuhi pada kondisi BAU, jadi tidak dibutuhkan kebijakan tambahan.</p>
          )}
          {reached && rec && rec.distance > 0 && (
            <p>
              Kombinasi dengan intervensi terkecil dari BAU: <strong>Insentif Kebijakan {leverPct(rec.point.insentif_kebijakan)}</strong>{" "}
              dan <strong>Kebijakan Konservasi Lahan {leverPct(rec.point.kebijakan_konservasi_lahan)}</strong>
              {asumsiDims.length > 0 && ", dengan asumsi tambahan seperti di bawah"}.
            </p>
          )}
          {!reached && result.best && (
            <>
              <p>
                Tidak ada kombinasi dalam ruang pencarian yang memenuhi {hasConstraints ? "semua target" : "target"}. Nilai
                terbaik untuk target utama ({describeTarget(primary)}) adalah{" "}
                <strong>
                  {showValue(primary.indicator, result.best.evals[0].actual)} ({signedPct(result.best.evals[0].pct)} dibanding BAU)
                </strong>
                , dicapai dengan Insentif Kebijakan {leverPct(result.best.point.insentif_kebijakan)} dan Kebijakan Konservasi
                Lahan {leverPct(result.best.point.kebijakan_konservasi_lahan)}
                {hasConstraints && result.constraintsMetSomewhere && " tanpa melanggar batasan"}.
              </p>
              {hasConstraints && result.constraintsMetSomewhere && !result.unreachable.includes(0) && (
                <p>
                  Target utama sebenarnya bisa dicapai, tetapi selalu dengan melanggar batasan. Artinya target utama dan batasan
                  saling bertentangan di dalam model; longgarkan salah satunya.
                </p>
              )}
              {result.unreachable.length > 0 && (
                <p>
                  Tidak terpenuhi di kombinasi mana pun: {result.unreachable.map((k) => describeTarget(targets[k])).join("; ")}.
                </p>
              )}
            </>
          )}
          <p className="text-xs text-gray-500">
            {result.runs.toLocaleString("id-ID")} simulasi dalam {nf(run.ms / 1000, 1)} detik ·{" "}
            {result.method === "grid" ? "grid search 41 × 41 + bisection" : "Latin Hypercube Sampling + penyempurnaan lokal"}
          </p>
        </div>
      </div>

      {/* Rekomendasi */}
      {(rec ?? result.best) && (
        <div className="card p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="section-label mb-1">{rec ? "Rekomendasi utama" : "Kombinasi terbaik yang bisa dicapai"}</p>
              <h3 className="font-display font-bold text-gray-900 flex items-center gap-1.5">
                {rec ? "Intervensi terkecil yang memenuhi target" : "Paling mendekati target utama"}
                {rec && (
                  <InfoTip
                    label="Intervensi terkecil"
                    text="Dari semua kombinasi yang memenuhi target, dipilih yang paling dekat dengan kondisi BAU. Jarak dihitung setelah setiap tuas dibagi lebar rentangnya, supaya Insentif (0–50%) dan Konservasi (0–100%) setara."
                  />
                )}
              </h3>
            </div>
            <Link href={applyHref((rec ?? result.best)!)} className="btn btn-primary">
              Terapkan ke Simulasi →
            </Link>
          </div>
          <PointSummary c={(rec ?? result.best)!} dims={dims} />
          <EvalTable targets={targets} evals={(rec ?? result.best)!.evals} />
          {asumsiDims.length > 0 && (
            <p className="text-xs text-amber-800">
              Tombol &ldquo;Terapkan ke Simulasi&rdquo; hanya membawa nilai kedua tuas. Halaman Simulasi memakai asumsi dasar
              model, sehingga hasilnya bisa berbeda dari angka di atas.
            </p>
          )}
        </div>
      )}

      {/* Heatmap */}
      {result.grid && (
        <div className="card p-5 sm:p-6 space-y-3">
          <div>
            <p className="section-label mb-1">Peta ruang tuas</p>
            <h3 className="font-display font-bold text-gray-900">Kombinasi mana yang memenuhi target?</h3>
            <p className="text-sm text-gray-500 mt-1">
              Setiap kotak adalah satu kombinasi Insentif (mendatar) dan Konservasi (tegak) yang disimulasikan. Pojok kiri bawah
              adalah kondisi BAU.
            </p>
          </div>
          <TargetHeatmap
            grid={result.grid}
            xKey="insentif_kebijakan"
            yKey="kebijakan_konservasi_lahan"
            hasConstraints={hasConstraints}
            markers={[
              ...result.alternatives.map((c, i) => ({ point: c.point, label: String(i + 1) })),
              ...(rec ? [{ point: rec.point, label: "R", primary: true }] : []),
              ...(!rec && result.best ? [{ point: result.best.point, label: "★", primary: true }] : []),
            ]}
          />
        </div>
      )}

      {/* Alternatif */}
      {rows.length > 0 && (
        <div className="card p-5 sm:p-6 space-y-3">
          <div>
            <p className="section-label mb-1">Alternatif</p>
            <h3 className="font-display font-bold text-gray-900">Kombinasi lain yang juga memenuhi target</h3>
            <p className="text-sm text-gray-500 mt-1">
              Dampak pada indikator lain di tahun {primary.year}, dibanding BAU. Baris R adalah rekomendasi utama.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="text-gray-500 border-b border-slate-100">
                <tr>
                  <th>#</th>
                  <th>Insentif</th>
                  <th>Konservasi</th>
                  {asumsiDims.map((d) => (
                    <th key={d.key}>{d.label}</th>
                  ))}
                  {rec!.impacts.map((im) => (
                    <th key={im.indicator}>{indicatorOf(im.indicator).label}</th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((c, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="font-semibold" style={{ color: i === 0 ? "#b42318" : "#1D5A8C" }}>
                      {i === 0 ? "R" : i}
                    </td>
                    <td>{leverPct(c.point.insentif_kebijakan)}</td>
                    <td>{leverPct(c.point.kebijakan_konservasi_lahan)}</td>
                    {asumsiDims.map((d) => (
                      <td key={d.key}>{signedPct((c.point[d.key] / d.base - 1) * 100)}</td>
                    ))}
                    {c.impacts.map((im) => (
                      <td key={im.indicator} title={showValue(im.indicator, im.value)}>
                        {signedPct(im.pct)}
                      </td>
                    ))}
                    <td>
                      <Link href={applyHref(c)} className="text-xs font-semibold text-[#1D5A8C] hover:underline">
                        Terapkan →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
