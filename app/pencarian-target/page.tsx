"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBaseData } from "@/components/BaseDataProvider";
import InfoTip from "@/components/InfoTip";
import TargetHeatmap from "@/components/TargetHeatmap";
import Step from "@/components/Step";
import { Toast, revealElement, toastError, toastInfo, toastOk, withMinDuration, type ToastMessage } from "@/components/RunFeedback";
import { ASSUMPTION_QUERY } from "@/components/ApplyLeversFromUrl";
import {
  ASSUMPTIONS,
  INDICATORS,
  LEVER_DIMS,
  TARGET_MODES,
  assumptionBaseValues,
  assumptionDims,
  assumptionOf,
  describeAssumptionChanges,
  indicatorOf,
  validateTargets,
  valueForThreshold,
  type AssumptionKey,
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
import { FINAL_YEAR } from "@/lib/baseData";
import { outputVariables } from "@/lib/scenarios";

const MAX_TARGETS = 3;
const TANPA = "tanpa kebijakan tambahan";

/** Nilai indikator dalam bahasa sehari-hari (format yang sama dengan halaman lain). */
const showValue = (id: IndicatorId, v: number) => formatValue(v, outputVariables.find((o) => o.id === id)?.unit ?? "", id);
const signedPct = (p: number) =>
  Math.abs(p) < 0.005 ? "0%" : `${p > 0 ? "+" : "−"}${nf(Math.abs(p), Math.abs(p) < 10 ? 2 : 1)}%`;
const leverPct = (v: number) => `${nf(v * 100, 1)}%`;

/** Kalimat syarat sebuah target, mis. "minimal 5% lebih tinggi daripada tanpa kebijakan tambahan". */
function ruleText(t: Target): string {
  const v = nf(t.value, t.value % 1 === 0 ? 0 : 2);
  switch (t.mode) {
    case "naik_min":
      return t.value === 0 ? `tidak lebih rendah daripada ${TANPA}` : `minimal ${v}% lebih tinggi daripada ${TANPA}`;
    case "turun_min":
      return `minimal ${v}% lebih rendah daripada ${TANPA}`;
    case "naik_maks":
      return t.value === 0 ? `tidak lebih tinggi daripada ${TANPA}` : `paling banyak ${v}% lebih tinggi daripada ${TANPA}`;
    case "abs_min":
      return `paling sedikit ${showValue(t.indicator, t.value)}`;
    case "abs_maks":
      return `paling banyak ${showValue(t.indicator, t.value)}`;
  }
}

const describeTarget = (t: Target) => `${indicatorOf(t.indicator).label} tahun ${t.year} ${ruleText(t)}`;
const roleName = (i: number) => (i === 0 ? "Hasil yang dicari" : `Syarat tambahan ${i}`);

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
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const closeToast = useCallback(() => setToast(null), []);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [revealTick, setRevealTick] = useState(0);
  useEffect(() => {
    if (revealTick) revealElement(resultsRef.current);
  }, [revealTick]);

  // Kondisi tanpa kebijakan tambahan sebagai gambaran pada isian target.
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
  const assumptionBase = assumptionBaseValues(config?.params);
  const dimsFor = (withAssumptions: boolean): Dim[] =>
    withAssumptions ? [...LEVER_DIMS, ...assumptionDims(assumptionBase)] : LEVER_DIMS;

  const updateTarget = (i: number, patch: Partial<Target>) =>
    setTargets(targets.map((t, k) => (k === i ? { ...t, ...patch } : t)));
  const removeTarget = (i: number) => setTargets(targets.filter((_, k) => k !== i));
  const addConstraint = () =>
    setTargets([...targets, { indicator: "indeks_kepadatan", year: targets[0]?.year ?? years[0], mode: "abs_maks", value: 2 }]);

  const start = async (nextTargets: Target[] = targets, withAssumptions: boolean = useAssumptions) => {
    setTargets(nextTargets);
    setUseAssumptions(withAssumptions);
    const v = validateTargets(nextTargets, baseYear);
    setErrors(v);
    if (v.length) {
      setToast(toastError("Perbaiki isian yang ditandai merah.", "Isian belum lengkap"));
      return;
    }
    const dims = dimsFor(withAssumptions);
    setRunning(true);
    setProgress(0);
    setToast(null);
    try {
      const { result, ms } = await withMinDuration(searchTargets(nextTargets, dims, override, setProgress));
      setRun({ targets: nextTargets, dims, result, ms, base: override });
      setToast(
        result.status === "tercapai"
          ? toastOk("Target bisa dicapai. Lihat sarannya di bawah.", "Pencarian selesai")
          : toastInfo("Target belum tercapai. Lihat saran perbaikannya di bawah.", "Pencarian selesai")
      );
      setRevealTick((t) => t + 1);
    } catch (err) {
      if (err instanceof SearchCancelled) setToast(toastInfo("Tidak ada hasil baru.", "Pencarian dibatalkan"));
      else setToast(toastError(err instanceof Error ? err.message : String(err), "Pencarian gagal"));
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .pt * { font-family: 'DM Sans', sans-serif; }
        .pt .font-display { font-family: 'Sora', sans-serif; }
        .pt .section-label { font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #14787B; }
        .page-hero { background: linear-gradient(135deg, #0d3554 0%, #1D5A8C 50%, #1a7a7c 100%); position: relative; overflow: hidden; }
        .page-hero::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(circle at 85% 30%, rgba(43,179,182,0.18) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(232,157,62,0.10) 0%, transparent 40%); }
        .pt .card { background: white; border: 1px solid #f1f5f9; border-radius: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .pt .btn { font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600; padding: 9px 16px; border-radius: 10px; transition: all .15s; display: inline-flex; align-items: center; gap: 6px; }
        .pt .btn-primary { background: #1D5A8C; color: white; }
        .pt .btn-primary:hover:not(:disabled) { background: #174a73; }
        .pt .btn-outline { background: white; color: #1D5A8C; border: 1.5px solid #1D5A8C; }
        .pt .btn-outline:hover:not(:disabled) { background: #eff6ff; }
        .pt .btn-sm { font-size: 12px; padding: 6px 12px; }
        .pt .btn:disabled { opacity: .45; cursor: not-allowed; }
        .pt .field { border: 1px solid #e2e8f0; border-radius: 8px; height: 40px; padding: 0 10px; font-size: 13.5px; background: white; width: 100%; }
        .pt .field-label { display: flex; align-items: center; gap: 4px; height: 20px; margin-bottom: 4px; font-size: 12px; color: #64748b; }
        .pt .field:focus { outline: 2px solid #1D5A8C33; border-color: #1D5A8C; }
        .pt table td, .pt table th { padding: 8px 10px; font-size: 12.5px; white-space: nowrap; }
      `}</style>

      <div className="pt min-h-screen" style={{ background: "#f8fafc" }}>
        <section className="page-hero text-white">
          <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
            <p className="section-label mb-2" style={{ color: "#F4CD53" }}>Alat lanjutan</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-2">
              Pencarian <span style={{ color: "#2BB3B6" }}>Target</span>
            </h1>
            <p className="text-blue-200 text-sm md:text-base max-w-2xl">
              Tentukan hasil yang ingin dicapai, lalu aplikasi mencari nilai kebijakan yang dibutuhkan.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-5">
          <div className="card overflow-hidden">
            <Step n={1} title="Tentukan target" note="Baris pertama adalah hasil yang dicari. Syarat tambahan boleh dikosongkan.">
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
                <button type="button" className="mt-3 text-sm font-semibold text-[#1D5A8C] hover:underline" onClick={addConstraint}>
                  + Tambah syarat
                </button>
              )}
            </Step>

            <Step n={2} title="Kebijakan yang dicari" note="Insentif Kebijakan 0–50% dan Kebijakan Konservasi Lahan 0–100%.">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  role="switch"
                  className="peer sr-only"
                  checked={useAssumptions}
                  onChange={(e) => setUseAssumptions(e.target.checked)}
                />
                <span
                  aria-hidden="true"
                  className="relative h-6 w-11 shrink-0 rounded-full bg-slate-300 transition-colors peer-checked:bg-amber-500 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-300 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
                />
                <span className="text-sm text-gray-800">Ikut ubah kondisi lain</span>
                <InfoTip
                  label="Kondisi lain"
                  text={`Kondisi ini tidak diatur langsung lewat kebijakan, tetapi bisa saja sedikit berbeda di lapangan. Aplikasi boleh menaikkan atau menurunkan paling banyak 10%: ${ASSUMPTIONS.map(
                    (a) => `${a.plain.toLowerCase()} (sekarang ${a.show(assumptionBase[a.key])})`
                  ).join(", ")}.`}
                />
              </label>
              {useAssumptions && (
                <p className="mt-2 text-xs text-amber-800">
                  Aplikasi juga boleh mengubah lama menginap, belanja per kunjungan, dan objek wisata baru (paling banyak ±10%). Ketiganya bukan kebijakan, hanya kemungkinan kondisi di lapangan.
                </p>
              )}
            </Step>

            <Step n={3} title="Cari" note="Sekitar 2.000 kombinasi dicoba, biasanya selesai dalam 1–2 detik." last>
              {errors.length > 0 && (
                <div role="alert" className="mb-3 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-800 border border-red-200">
                  <ul className="list-disc pl-5 space-y-0.5">
                    {errors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className="btn btn-primary" onClick={() => start()} disabled={running}>
                  {running ? "Mencari…" : "Cari kombinasi kebijakan"}
                </button>
                {running && (
                  <button type="button" className="btn btn-outline" onClick={cancelSearch}>
                    Batalkan
                  </button>
                )}
              </div>
              {running && (
                <div
                  className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden"
                  role="progressbar"
                  aria-label="Kemajuan pencarian"
                  aria-valuenow={Math.round(progress * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="h-full bg-[#2BB3B6] transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
                </div>
              )}
            </Step>
          </div>

          <Toast toast={toast} onClose={closeToast} />
          <div ref={resultsRef} className="scroll-mt-28">
          {run && (
            <Results
              run={run}
              busy={running}
              assumptionsOff={!useAssumptions}
              onRetry={(nextTargets, withAssumptions) => start(nextTargets, withAssumptions ?? useAssumptions)}
            />
          )}
          </div>

          <p className="text-xs text-gray-400 px-1">
            Hasil berupa gambaran, bukan ramalan, dan selalu dibandingkan dengan kondisi {TANPA} (BAU).
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
  const ind = indicatorOf(target.indicator);
  const idx = bau ? bau.years.indexOf(target.year) : -1;
  const bauValue = idx >= 0 ? bau![target.indicator][idx] : null;
  // Nilai absolut diketik dalam satuan yang mudah dibaca (mis. % luas wilayah), disimpan dalam satuan model.
  const scale = relatif ? 1 : ind.scale;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={index === 0 ? { background: "#e6eef7", color: "#1D5A8C" } : { background: "#eef2f6", color: "#475569" }}
        >
          {roleName(index)}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Hapus ${roleName(index).toLowerCase()}`}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600"
          >
            ✕
          </button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
        <label className="lg:col-span-4">
          <span className="field-label">
            Indikator <InfoTip text={GLOSSARY[target.indicator] ?? ind.label} label={ind.label} />
          </span>
          <select className="field" value={target.indicator} onChange={(e) => onChange({ indicator: e.target.value as IndicatorId })}>
            {INDICATORS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="lg:col-span-4">
          <span className="field-label">Bentuk target</span>
          <select className="field" value={target.mode} onChange={(e) => onChange({ mode: e.target.value as TargetMode })}>
            {TARGET_MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="lg:col-span-2">
          <span className="field-label">Angka</span>
          <span className="relative block">
            <input
              className="field pr-10"
              type="number"
              step="any"
              min={0}
              value={Number.isFinite(target.value) ? Number((target.value * scale).toPrecision(10)) : ""}
              onChange={(e) => onChange({ value: e.target.value === "" ? NaN : Number(e.target.value) / scale })}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              {relatif ? "%" : ind.scale !== 1 ? "%" : ""}
            </span>
          </span>
        </label>
        <label className="lg:col-span-2">
          <span className="field-label">Tahun</span>
          <select className="field" value={target.year} onChange={(e) => onChange({ year: Number(e.target.value) })}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>
      {Number.isFinite(target.value) && (
        <p className="mt-3 text-xs text-gray-600 leading-relaxed">
          <span className="font-semibold text-gray-800">Artinya:</span> {ind.label} {target.year} {ruleText(target)}.
          {bauValue !== null && (
            <span className="text-gray-400">
              {" "}
              Tanpa kebijakan: {showValue(target.indicator, bauValue)}.
            </span>
          )}
        </p>
      )}
    </div>
  );
}

// ── Hasil ───────────────────────────────────────────────────────────────────

/** Perubahan asumsi suatu titik dalam persen terhadap nilai dasar. */
function assumptionChanges(c: Candidate, dims: Dim[]): Partial<Record<AssumptionKey, number>> {
  const out: Partial<Record<AssumptionKey, number>> = {};
  for (const d of dims)
    if (d.kind === "asumsi") {
      const pct = Math.round((c.point[d.key] / d.base - 1) * 10000) / 100;
      if (pct !== 0) out[d.key as AssumptionKey] = pct;
    }
  return out;
}

const leversZero = (c: Candidate) => c.point.insentif_kebijakan < 5e-4 && c.point.kebijakan_konservasi_lahan < 5e-4;

function applyHref(c: Candidate, dims: Dim[]) {
  const q = new URLSearchParams({
    insentif: String(Math.round(c.point.insentif_kebijakan * 10000) / 10000),
    konservasi: String(Math.round(c.point.kebijakan_konservasi_lahan * 10000) / 10000),
  });
  for (const [key, pct] of Object.entries(assumptionChanges(c, dims))) q.set(ASSUMPTION_QUERY[key as AssumptionKey], String(pct));
  return `/simulasi?${q.toString()}`;
}

function PointSummary({ c, dims }: { c: Candidate; dims: Dim[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {dims.map((d) => {
        const v = c.point[d.key];
        const isLever = d.kind === "tuas";
        const text = isLever
          ? leverPct(v)
          : `${assumptionOf(d.key as AssumptionKey).show(v)} (${signedPct((v / d.base - 1) * 100)})`;
        return (
          <div
            key={d.key}
            className={`rounded-xl px-4 py-3 ${isLever ? "bg-blue-50 border border-blue-100" : "bg-amber-50 border border-amber-200"}`}
          >
            <p className="text-xs text-gray-600">
              {isLever ? d.label : `${assumptionOf(d.key as AssumptionKey).plain} · kondisi lain, bukan kebijakan`}
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
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tabel status target">
      <table className="min-w-full text-left">
        <thead className="text-gray-500 border-b border-slate-100">
          <tr>
            <th>Target</th>
            <th>Yang diminta</th>
            <th>Hasil simulasi</th>
            <th>Dibanding {TANPA}</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {targets.map((t, i) => {
            const e = evals[i];
            return (
              <tr key={i} className="border-b border-slate-50">
                <td className="font-medium text-gray-800">
                  {indicatorOf(t.indicator).label} {t.year}
                  <span className="block text-[11px] font-normal text-gray-400">{roleName(i)}</span>
                </td>
                <td className="text-gray-600 whitespace-normal min-w-[180px]">{ruleText(t)}</td>
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

interface Suggestion {
  text: string;
  action: string;
  targets: Target[];
  withAssumptions?: boolean;
}

/** Saran konkret ketika target tidak tercapai, masing-masing bisa langsung dicoba. */
function suggestionsFor(run: RunState, assumptionsOff: boolean): Suggestion[] {
  const { targets, result } = run;
  const out: Suggestion[] = [];
  const primary = targets[0];
  const best = result.best;

  if (best && !best.evals[0].satisfied) {
    const v = valueForThreshold(primary.mode, best.evals[0].metric);
    if (v !== null && v !== primary.value) {
      const lowered = { ...primary, value: v };
      out.push({
        text: `Sesuaikan target menjadi: ${indicatorOf(primary.indicator).label} tahun ${primary.year} ${ruleText(lowered)}. Ini angka terbaik yang masih bisa dicapai${targets.length > 1 && result.constraintsMetSomewhere ? " tanpa melanggar syarat tambahan" : ""}.`,
        action: "Cari ulang dengan target ini",
        targets: [lowered, ...targets.slice(1)],
      });
    }
  }
  if (result.earliestYear) {
    out.push({
      text: `Beri waktu lebih panjang: target yang sama baru bisa tercapai pada tahun ${result.earliestYear}.`,
      action: `Ganti tahun ke ${result.earliestYear}`,
      targets: [{ ...primary, year: result.earliestYear }, ...targets.slice(1)],
    });
  }
  for (const r of result.relaxations) {
    const t = targets[r.index];
    const v = valueForThreshold(t.mode, r.threshold);
    if (v === null || v === t.value) continue;
    const relaxed = { ...t, value: v };
    out.push({
      text: `Longgarkan ${roleName(r.index).toLowerCase()} menjadi: ${indicatorOf(t.indicator).label} tahun ${t.year} ${ruleText(relaxed)}.`,
      action: "Cari ulang dengan syarat ini",
      targets: targets.map((x, k) => (k === r.index ? relaxed : x)),
    });
  }
  for (const k of result.unreachable.filter((k) => k > 0)) {
    out.push({
      text: `Hapus ${roleName(k).toLowerCase()} (${describeTarget(targets[k])}), karena syarat ini tidak bisa dipenuhi dengan kebijakan apa pun.`,
      action: "Hapus syarat dan cari ulang",
      targets: targets.filter((_, m) => m !== k),
    });
  }
  if (assumptionsOff) {
    out.push({
      text: "Centang “Ikut ubah kondisi lain” untuk melihat apakah target tercapai bila kondisi lain sedikit berbeda. Kondisi ini tidak diatur langsung lewat kebijakan.",
      action: "Centang dan cari ulang",
      targets,
      withAssumptions: true,
    });
  }
  return out;
}

function Results({
  run,
  busy,
  assumptionsOff,
  onRetry,
}: {
  run: RunState;
  busy: boolean;
  assumptionsOff: boolean;
  onRetry: (targets: Target[], withAssumptions?: boolean) => void;
}) {
  const { targets, dims, result } = run;
  const rec = result.recommendation;
  const reached = result.status === "tercapai";
  const primary = targets[0];
  const hasConstraints = targets.length > 1;
  const rows = rec ? [rec, ...result.alternatives] : [];
  const asumsiDims = dims.filter((d) => d.kind === "asumsi");
  const shown = rec ?? result.best;
  const shownAssumptionNote = shown ? describeAssumptionChanges(assumptionChanges(shown, dims)) : "";
  const primaryReachable = !result.unreachable.includes(0);
  const suggestions = reached ? [] : suggestionsFor(run, assumptionsOff);

  return (
    <section className="space-y-6" aria-live="polite">
      {/* Status */}
      <div className="card p-5 sm:p-6 border-l-4" style={{ borderLeftColor: reached ? "#3A9C77" : "#b42318" }}>
        <p className="section-label mb-1">Hasil pencarian</p>
        <p className="font-display text-2xl font-bold" style={{ color: reached ? "#2f7d60" : "#b42318" }}>
          {reached ? "✓ Target bisa dicapai" : "✗ Target belum bisa dicapai"}
        </p>
        <div className="text-sm text-gray-700 mt-2 space-y-2 leading-relaxed">
          {reached && rec && rec.distance === 0 && <p>Target sudah tercapai walaupun {TANPA}.</p>}
          {reached && rec && rec.distance > 0 && leversZero(rec) && (
            <p>
              Target bisa tercapai <strong>{TANPA}</strong>, asalkan kondisi berikut terjadi: {shownAssumptionNote}. Kondisi ini
              tidak bisa diatur langsung lewat kebijakan, jadi belum tentu terjadi.
            </p>
          )}
          {reached && rec && rec.distance > 0 && !leversZero(rec) && (
            <p>
              Cukup dengan <strong>Insentif Kebijakan {leverPct(rec.point.insentif_kebijakan)}</strong> dan{" "}
              <strong>Kebijakan Konservasi Lahan {leverPct(rec.point.kebijakan_konservasi_lahan)}</strong>
              {shownAssumptionNote && <>, dengan mengandaikan {shownAssumptionNote}</>}. Ini perubahan kebijakan paling kecil yang
              sudah memenuhi semua target.
            </p>
          )}
          {!reached && result.best && !primaryReachable && (
            <p>
              Bahkan dengan kombinasi terbaik yang tersedia (Insentif {leverPct(result.best.point.insentif_kebijakan)}, Konservasi{" "}
              {leverPct(result.best.point.kebijakan_konservasi_lahan)}), {indicatorOf(primary.indicator).label} tahun {primary.year}{" "}
              hanya bisa mencapai <strong>{signedPct(result.best.evals[0].pct)}</strong> dibanding {TANPA}, sedangkan targetnya{" "}
              {ruleText(primary)}.
            </p>
          )}
          {!reached && primaryReachable && hasConstraints && (
            <p>
              Hasil yang dicari sebenarnya bisa dicapai, tetapi <strong>setiap kombinasi yang mencapainya melanggar syarat tambahan</strong>.
              Artinya kebijakan yang mendorong {indicatorOf(primary.indicator).label} juga ikut mendorong hal yang ingin dibatasi.
            </p>
          )}
          {!reached &&
            result.unreachable
              .filter((k) => k > 0)
              .map((k) => (
                <p key={k}>
                  {roleName(k)} ({describeTarget(targets[k])}) tidak bisa dipenuhi dengan kebijakan apa pun.
                </p>
              ))}
        </div>

        {suggestions.length > 0 && (
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-3">
            <p className="font-semibold text-amber-900 text-sm">Apa yang bisa dilakukan?</p>
            <ul className="space-y-3">
              {suggestions.map((s) => (
                <li key={s.action + s.text} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                  <span className="text-sm text-amber-900">{s.text}</span>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm shrink-0"
                    disabled={busy}
                    onClick={() => onRetry(s.targets, s.withAssumptions)}
                  >
                    {s.action}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Saran utama / kombinasi terbaik */}
      {shown && (
        <div className="card p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="section-label mb-1">{rec ? "Saran kebijakan" : "Kombinasi terbaik yang ada"}</p>
              <h3 className="font-display font-bold text-gray-900 flex items-center gap-1.5">
                {rec ? "Perubahan paling kecil yang sudah cukup" : "Paling mendekati hasil yang dicari"}
                {rec && (
                  <InfoTip
                    label="Perubahan paling kecil"
                    text="Dari semua kombinasi yang memenuhi target, dipilih yang paling dekat dengan kondisi tanpa kebijakan tambahan. Insentif (0–50%) dan Konservasi (0–100%) dihitung setara menurut lebar rentangnya."
                  />
                )}
              </h3>
            </div>
            <Link href={applyHref(shown, dims)} className="btn btn-primary">
              Coba di halaman Simulasi →
            </Link>
          </div>
          <PointSummary c={shown} dims={dims} />
          <EvalTable targets={targets} evals={shown.evals} />
          {shownAssumptionNote && (
            <p className="text-xs text-amber-800">
              Kondisi lain ikut dibawa ke halaman Simulasi.
            </p>
          )}
        </div>
      )}

      {/* Heatmap */}
      {result.grid && (
        <div className="card p-5 sm:p-6 space-y-3">
          <div>
            <p className="section-label mb-1">Peta kombinasi</p>
            <h3 className="font-display font-bold text-gray-900">Kombinasi mana yang memenuhi target?</h3>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Tiap kotak adalah satu kombinasi. Ke kanan insentif makin besar, ke atas konservasi makin besar.
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
      {rows.length > 1 && (
        <div className="card p-5 sm:p-6 space-y-3">
          <div>
            <p className="section-label mb-1">Pilihan lain</p>
            <h3 className="font-display font-bold text-gray-900">Kombinasi lain yang juga memenuhi target</h3>
            <p className="text-sm text-gray-500 mt-1">
              Perubahan dibanding {TANPA} pada {primary.year}. R = saran utama.
            </p>
          </div>
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tabel pilihan lain">
            <table className="min-w-full text-left">
              <thead className="text-gray-500 border-b border-slate-100">
                <tr>
                  <th>#</th>
                  <th>Insentif</th>
                  <th>Konservasi</th>
                  {asumsiDims.map((d) => (
                    <th key={d.key}>{assumptionOf(d.key as AssumptionKey).plain}</th>
                  ))}
                  <th>PDRB</th>
                  <th>Wisatawan</th>
                  <th>Lahan terbangun</th>
                  <th>Kepadatan</th>
                  <th>Tenaga kerja</th>
                  <th>
                    <span className="sr-only">Aksi</span>
                  </th>
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
                      <Link href={applyHref(c, dims)} className="text-xs font-semibold text-[#1D5A8C] hover:underline">
                        Coba →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <details className="card px-5 py-4 text-sm text-gray-600">
        <summary className="cursor-pointer font-semibold text-gray-700">Cara kerja pencarian (untuk peneliti)</summary>
        <div className="mt-2 space-y-1.5 leading-relaxed">
          <p>
            Model dijalankan {result.runs.toLocaleString("id-ID")} kali dalam {nf(run.ms / 1000, 1)} detik.{" "}
            {result.method === "grid"
              ? "Metode: grid search 41 × 41 titik pada ruang dua tuas, lalu bisection pada batas wilayah yang memenuhi target, lalu pattern search."
              : "Metode: Latin Hypercube Sampling 2.000 sampel pada ruang lima dimensi (dua tuas dan tiga asumsi ±10%), lalu penyempurnaan lokal (pattern search)."}
          </p>
          <p>
            Saran utama adalah titik yang memenuhi semua target dengan jarak ternormalisasi terkecil dari BAU, yaitu √Σ((xᵢ − xᵢ,BAU) ÷
            rentangᵢ)². Bila tidak tercapai, nilai terbaik target utama dicari di antara titik yang memenuhi batasan, lalu
            dipertajam dengan hill climbing.
          </p>
        </div>
      </details>
    </section>
  );
}
