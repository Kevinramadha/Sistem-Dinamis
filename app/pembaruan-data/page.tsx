"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { RESEARCH_BASE_YEAR, RESEARCH_DATA, SERIES, type SeriesKey, type YearRow } from "@/lib/baseData";
import {
  FIXED_PARAMS,
  PARAM_DEFS,
  RESEARCH_PARAMS,
  computeParameters,
  parameterWarnings,
  sortRows,
  validateRows,
  type ComputedParameters,
  type Issue,
} from "@/lib/parameterUpdate";
import {
  TEMPLATE_BASENAME,
  buildTemplateCsv,
  buildTemplateXlsx,
  downloadBlob,
  parseTemplateFile,
} from "@/lib/templateIO";
import { parseConfig, useBaseData } from "@/components/BaseDataProvider";

type Source = "unggah" | "form" | "impor";

interface Candidate {
  source: Source;
  label: string;
  rows: YearRow[];
  errors: Issue[];
  warnings: Issue[];
  computed: ComputedParameters | null;
}

const fmtNum = (v: number, max = 6) =>
  Number.isFinite(v) ? v.toLocaleString("id-ID", { maximumFractionDigits: max }) : "—";

function fmtParam(v: number): string {
  if (!Number.isFinite(v)) return "—";
  const abs = Math.abs(v);
  if (abs !== 0 && abs < 0.01) return v.toLocaleString("id-ID", { maximumSignificantDigits: 6 });
  return v.toLocaleString("id-ID", { maximumFractionDigits: 6 });
}

function makeCandidate(source: Source, label: string, rows: YearRow[]): Candidate {
  const sorted = sortRows(rows);
  const v = validateRows(rows); // validasi urutan memakai urutan asli
  const computed = v.errors.length ? null : computeParameters(sorted);
  const warnings = computed ? [...v.warnings, ...parameterWarnings(computed)] : v.warnings;
  return { source, label, rows: sorted, errors: v.errors, warnings, computed };
}

export default function PembaruanDataPage() {
  const { config, baseYear, isCustom, apply, reset } = useBaseData();
  const activeRows: readonly YearRow[] = config?.rows ?? RESEARCH_DATA;
  const activeParams = config?.params ?? RESEARCH_PARAMS;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [mode, setMode] = useState<"unggah" | "form">("unggah");
  const fileRef = useRef<HTMLInputElement>(null);
  const jsonRef = useRef<HTMLInputElement>(null);

  const nextYear = activeRows[activeRows.length - 1].tahun + 1;
  const prevRow = activeRows[activeRows.length - 1];
  const [form, setForm] = useState<Record<SeriesKey, string>>(
    () => Object.fromEntries(SERIES.map((s) => [s.key, ""])) as Record<SeriesKey, string>
  );

  // ── Aksi ────────────────────────────────────────────────────────────────
  const downloadXlsx = async () => {
    setBusy("Menyiapkan template .xlsx…");
    try {
      downloadBlob(await buildTemplateXlsx(activeRows), `${TEMPLATE_BASENAME}-${baseYear}.xlsx`);
    } catch (e) {
      setMessage({ kind: "error", text: `Gagal membuat template: ${(e as Error).message}` });
    } finally {
      setBusy(null);
    }
  };

  const downloadCsv = () => {
    downloadBlob(new Blob([buildTemplateCsv(activeRows)], { type: "text/csv;charset=utf-8" }), `${TEMPLATE_BASENAME}-${baseYear}.csv`);
  };

  const onUpload = async (file: File | undefined) => {
    if (!file) return;
    setMessage(null);
    setBusy("Membaca berkas…");
    try {
      const rows = await parseTemplateFile(file);
      setCandidate(makeCandidate("unggah", `Berkas: ${file.name}`, rows));
    } catch (e) {
      setCandidate(null);
      setMessage({ kind: "error", text: (e as Error).message });
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onFormCheck = () => {
    setMessage(null);
    const row = { tahun: nextYear } as YearRow;
    for (const s of SERIES) {
      const t = form[s.key].trim().replace(/\s/g, "");
      const n = Number(t.replace(",", "."));
      row[s.key] = t === "" ? NaN : Number.isNaN(n) ? Infinity : n;
    }
    setCandidate(makeCandidate("form", `Isian form tahun ${nextYear}`, [...activeRows.map((r) => ({ ...r })), row]));
  };

  const onImportJson = async (file: File | undefined) => {
    if (!file) return;
    setMessage(null);
    try {
      const cfg = parseConfig(JSON.parse(await file.text()));
      setCandidate(makeCandidate("impor", `Konfigurasi: ${file.name}`, cfg.rows));
    } catch (e) {
      setCandidate(null);
      setMessage({ kind: "error", text: `Konfigurasi tidak dapat diimpor. ${(e as Error).message}` });
    } finally {
      if (jsonRef.current) jsonRef.current.value = "";
    }
  };

  const onApply = () => {
    if (!candidate?.computed) return;
    try {
      const cfg = apply(candidate.rows);
      setCandidate(null);
      setForm(Object.fromEntries(SERIES.map((s) => [s.key, ""])) as Record<SeriesKey, string>);
      setMessage({ kind: "ok", text: `Data dasar tahun ${cfg.baseYear} diterapkan. Simulasi di halaman Skenario dan Eksplorasi Simulasi kini berjalan ${cfg.baseYear}–2050.` });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setMessage({ kind: "error", text: (e as Error).message });
    }
  };

  const onReset = () => {
    if (!window.confirm(`Kembalikan ke data penelitian (${RESEARCH_BASE_YEAR})? Data dasar hasil pembaruan akan dihapus dari peramban ini. Ekspor konfigurasi terlebih dahulu bila masih diperlukan.`)) return;
    reset();
    setCandidate(null);
    setMessage({ kind: "ok", text: `Data dasar dikembalikan ke data penelitian (${RESEARCH_BASE_YEAR}).` });
  };

  const onExport = () => {
    if (!config) return;
    downloadBlob(new Blob([JSON.stringify(config, null, 2)], { type: "application/json" }), `konfigurasi-data-dasar-simdiy-${config.baseYear}.json`);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .pd * { font-family: 'DM Sans', sans-serif; }
        .pd .font-display { font-family: 'Sora', sans-serif; }
        .pd .section-label { font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #2BB3B6; }
        .page-hero { background: linear-gradient(135deg, #0d3554 0%, #1D5A8C 50%, #1a7a7c 100%); position: relative; overflow: hidden; }
        .page-hero::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(circle at 85% 30%, rgba(43,179,182,0.18) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(232,157,62,0.10) 0%, transparent 40%); }
        .pd .card { background: white; border: 1px solid #f1f5f9; border-radius: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .pd .btn { font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600; padding: 9px 16px; border-radius: 10px; transition: all .15s; display: inline-flex; align-items: center; gap: 6px; }
        .pd .btn-primary { background: #1D5A8C; color: white; }
        .pd .btn-primary:hover:not(:disabled) { background: #174a73; }
        .pd .btn-outline { background: white; color: #1D5A8C; border: 1.5px solid #1D5A8C; }
        .pd .btn-outline:hover:not(:disabled) { background: #eff6ff; }
        .pd .btn-danger { background: white; color: #b42318; border: 1.5px solid #f3c2bd; }
        .pd .btn-danger:hover:not(:disabled) { background: #fdecec; }
        .pd .btn:disabled { opacity: .45; cursor: not-allowed; }
        .pd table td, .pd table th { padding: 7px 10px; white-space: nowrap; font-size: 12.5px; }
        .pd .tab { font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600; padding: 8px 14px; border-radius: 10px; }
      `}</style>

      <div className="pd min-h-screen" style={{ background: "#f8fafc" }}>
        <section className="page-hero text-white">
          <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
            <p className="section-label mb-4" style={{ color: "#F4CD53" }}>Pembaruan Data Tahunan</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">
              Pembaruan <span style={{ color: "#2BB3B6" }}>Data Dasar</span>
            </h1>
            <p className="text-blue-200 text-base max-w-2xl leading-relaxed">
              Saat BPS merilis data tahun baru, masukkan datanya di sini. Parameter model dihitung ulang otomatis dan simulasi
              dijalankan dari tahun dasar terbaru sampai 2050, tanpa mengubah kode aplikasi.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
          {message && (
            <div
              role="alert"
              className="rounded-xl px-4 py-3 text-sm"
              style={message.kind === "ok" ? { background: "#e8f6ef", color: "#1f7a52", border: "1px solid #bfe5d1" } : { background: "#fdecec", color: "#b42318", border: "1px solid #f3c2bd" }}
            >
              {message.text}
              {message.kind === "ok" && (
                <span className="ml-2">
                  <Link href="/skenario" className="font-semibold underline">Buka Skenario</Link>
                  {" · "}
                  <Link href="/simulasi" className="font-semibold underline">Buka Eksplorasi Simulasi</Link>
                </span>
              )}
            </div>
          )}

          {/* ── STATUS ─────────────────────────────────────── */}
          <div className="card p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="max-w-2xl">
              <p className="section-label mb-1">Data dasar yang dipakai sekarang</p>
              <p className="font-display text-xl font-bold text-gray-900">
                Tahun {baseYear}{" "}
                <span className="text-sm font-semibold px-2 py-0.5 rounded-full align-middle whitespace-nowrap" style={isCustom ? { background: "#fff4e0", color: "#9a5b00" } : { background: "#e6eef7", color: "#1D5A8C" }}>
                  {isCustom ? "pembaruan pengguna" : "data penelitian"}
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {isCustom ? (
                  <>
                    Simulasi memakai data sampai tahun {baseYear} yang Anda terapkan
                    {config && ` pada ${new Date(config.appliedAt).toLocaleString("id-ID")}`}, sehingga proyeksi berjalan {baseYear}–2050.
                    Data ini hanya tersimpan di peramban ini.
                  </>
                ) : (
                  <>
                    Simulasi memakai data asli penelitian (seri 2015–{RESEARCH_BASE_YEAR}), sehingga proyeksi berjalan {RESEARCH_BASE_YEAR}–2050.
                    Untuk memakai data tahun yang lebih baru, ikuti langkah di bawah.
                  </>
                )}
              </p>
            </div>
            {isCustom && (
              <div className="shrink-0 md:text-right">
                <button className="btn btn-danger" onClick={onReset}>
                  Kembali ke data penelitian ({RESEARCH_BASE_YEAR})
                </button>
                <p className="text-[11px] text-gray-400 mt-1.5 md:max-w-[16rem] md:ml-auto">
                  Menghapus data hasil pembaruan dan memakai lagi data asli penelitian.
                </p>
              </div>
            )}
          </div>

          {/* ── LANGKAH 1–2 ─────────────────────────────────── */}
          <div className="card overflow-hidden">
            <div className="px-5 sm:px-6 py-4" style={{ borderBottom: "1px solid #f0f4f8" }}>
              <p className="section-label mb-0.5">Langkah 1</p>
              <h2 className="font-display font-bold text-gray-900">Unduh template data</h2>
            </div>
            <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                Template berisi {SERIES.length} seri tahunan yang dibutuhkan rumus parameter, sudah terisi data{" "}
                {activeRows[0].tahun}–{activeRows[activeRows.length - 1].tahun} yang dipakai sekarang, lengkap dengan satuan dan sumber.
                Tambahkan satu baris untuk tahun {nextYear}, lalu unggah kembali.
              </p>
              <div className="flex gap-2 shrink-0">
                <button className="btn btn-primary" onClick={downloadXlsx} disabled={!!busy}>Unduh .xlsx</button>
                <button className="btn btn-outline" onClick={downloadCsv}>Unduh .csv</button>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3" style={{ borderBottom: "1px solid #f0f4f8" }}>
              <div>
                <p className="section-label mb-0.5">Langkah 2</p>
                <h2 className="font-display font-bold text-gray-900">Masukkan data tahun baru</h2>
              </div>
              <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#f1f5f9" }} role="tablist">
                {(["unggah", "form"] as const).map((m) => (
                  <button key={m} role="tab" aria-selected={mode === m} className="tab" onClick={() => setMode(m)}
                    style={mode === m ? { background: "#1D5A8C", color: "white" } : { color: "#475569" }}>
                    {m === "unggah" ? "Unggah template" : `Isi form tahun ${nextYear}`}
                  </button>
                ))}
              </div>
            </div>

            {mode === "unggah" ? (
              <div className="p-5 sm:p-6">
                <label
                  className="flex flex-col items-center justify-center text-center gap-2 rounded-xl border-2 border-dashed px-4 py-10 cursor-pointer transition-colors hover:bg-blue-50"
                  style={{ borderColor: "#bfdbfe" }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); onUpload(e.dataTransfer.files?.[0]); }}
                >
                  <span className="font-display font-semibold text-gray-800">Pilih atau seret berkas template ke sini</span>
                  <span className="text-xs text-gray-500">Format .xlsx atau .csv, maksimal 5 MB</span>
                  <input ref={fileRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={(e) => onUpload(e.target.files?.[0])} aria-label="Unggah template data" />
                </label>
                {busy && <p className="text-sm text-gray-500 mt-3">{busy}</p>}
              </div>
            ) : (
              <div className="p-5 sm:p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Isi seluruh kolom untuk tahun <strong>{nextYear}</strong>. Angka tahun {prevRow.tahun} ditampilkan sebagai pembanding.
                  Gunakan titik atau koma untuk desimal, tanpa pemisah ribuan.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SERIES.map((s) => (
                    <label key={s.key} className="block">
                      <span className="block text-xs font-semibold text-gray-700 mb-1">{s.label}</span>
                      <input
                        inputMode="decimal"
                        value={form[s.key]}
                        onChange={(e) => setForm({ ...form, [s.key]: e.target.value })}
                        placeholder={`${prevRow.tahun}: ${fmtNum(prevRow[s.key])}`}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                      />
                      <span className="block text-[11px] text-gray-400 mt-1">{s.satuan} · {s.sumber}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-5">
                  <button className="btn btn-primary" onClick={onFormCheck}>Periksa data</button>
                </div>
              </div>
            )}
          </div>

          {/* ── LANGKAH 3: VALIDASI & PRATINJAU ───────────────── */}
          {candidate && (
            <Preview
              candidate={candidate}
              activeParams={activeParams}
              activeBaseYear={baseYear}
              onApply={onApply}
              onCancel={() => setCandidate(null)}
            />
          )}

          {/* ── SIMPAN / PINDAHKAN ──────────────────────────── */}
          <div className="card overflow-hidden">
            <div className="px-5 sm:px-6 py-4" style={{ borderBottom: "1px solid #f0f4f8" }}>
              <p className="section-label mb-0.5">Opsional</p>
              <h2 className="font-display font-bold text-gray-900">Simpan atau pindahkan data dasar</h2>
              <p className="text-sm text-gray-500 mt-1">
                Data hasil pembaruan hanya tersimpan di peramban ini. Simpan ke berkas sebagai cadangan, atau untuk dibuka di perangkat lain.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-5 sm:p-6 md:border-r" style={{ borderColor: "#f0f4f8" }}>
                <p className="font-semibold text-gray-900 text-sm mb-1">Simpan ke berkas</p>
                <p className="text-sm text-gray-500 mb-3">
                  Mengunduh data dasar yang sedang dipakai beserta parameternya sebagai berkas <code>.json</code>.
                </p>
                {isCustom ? (
                  <button className="btn btn-outline" onClick={onExport}>Simpan ke berkas</button>
                ) : (
                  <p className="text-xs rounded-lg px-3 py-2 inline-block" style={{ background: "#f1f5f9", color: "#64748b" }}>
                    Tersedia setelah Anda menerapkan data tahun baru. Data penelitian selalu tersedia tanpa perlu disimpan.
                  </p>
                )}
              </div>
              <div className="p-5 sm:p-6 border-t md:border-t-0" style={{ borderColor: "#f0f4f8" }}>
                <p className="font-semibold text-gray-900 text-sm mb-1">Buka berkas tersimpan</p>
                <p className="text-sm text-gray-500 mb-3">
                  Memakai kembali data dasar dari berkas <code>.json</code> yang pernah disimpan. Datanya diperiksa dan dipratinjau dulu sebelum diterapkan.
                </p>
                <button className="btn btn-outline" onClick={() => jsonRef.current?.click()}>Buka berkas tersimpan</button>
                <input ref={jsonRef} type="file" accept=".json,application/json" className="hidden" onChange={(e) => onImportJson(e.target.files?.[0])} aria-label="Impor konfigurasi JSON" />
              </div>
            </div>
          </div>

          {/* ── PARAMETER TETAP ─────────────────────────────── */}
          <details className="card overflow-hidden">
            <summary className="px-5 sm:px-6 py-4 cursor-pointer select-none">
              <span className="section-label">Parameter yang tidak diubah aplikasi</span>
              <span className="block font-display font-bold text-gray-900 mt-0.5">Kelompok C: ditetapkan peneliti</span>
            </summary>
            <div className="px-5 sm:px-6 pb-6">
              <p className="text-sm rounded-xl px-4 py-3 mb-4" style={{ background: "#fff8eb", color: "#8a5300", border: "1px solid #fde3b0" }}>
                Parameter berikut ditetapkan peneliti dari identitas stock-flow, regulasi, dan asumsi model, sehingga tidak dihitung ulang
                oleh aplikasi. Bila struktur data berubah (misalnya definisi atau cakupan pendataan BPS berganti), parameter ini perlu
                diturunkan ulang secara terpisah oleh peneliti.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {FIXED_PARAMS.map((g) => (
                  <div key={g.kategori}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{g.kategori}</p>
                    <table className="w-full">
                      <tbody>
                        {g.items.map((it) => (
                          <tr key={it.nama} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td className="text-gray-700" style={{ whiteSpace: "normal" }}>{it.nama}</td>
                            <td className="text-right font-semibold text-gray-900">{fmtParam(it.nilai)}</td>
                            <td className="text-gray-400">{it.satuan}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </div>
      </div>
    </>
  );
}

function IssueList({ title, items, tone }: { title: string; items: Issue[]; tone: "error" | "warning" }) {
  const c = tone === "error" ? { bg: "#fdecec", fg: "#b42318", bd: "#f3c2bd" } : { bg: "#fff8eb", fg: "#8a5300", bd: "#fde3b0" };
  return (
    <div className="rounded-xl px-4 py-3" style={{ background: c.bg, color: c.fg, border: `1px solid ${c.bd}` }}>
      <p className="text-sm font-semibold mb-1">{title} ({items.length})</p>
      <ul className="text-sm list-disc pl-5 space-y-0.5 max-h-56 overflow-auto">
        {items.map((it, i) => <li key={i}>{it.pesan}</li>)}
      </ul>
    </div>
  );
}

function Preview({
  candidate,
  activeParams,
  activeBaseYear,
  onApply,
  onCancel,
}: {
  candidate: Candidate;
  activeParams: Record<string, number>;
  activeBaseYear: number;
  onApply: () => void;
  onCancel: () => void;
}) {
  const { computed, errors, warnings, rows } = candidate;
  const newRows = useMemo(() => rows.filter((r) => r.tahun > RESEARCH_BASE_YEAR), [rows]);
  const ok = errors.length === 0 && computed !== null;

  return (
    <div className="card overflow-hidden" id="pratinjau">
      <div className="px-5 sm:px-6 py-4" style={{ borderBottom: "1px solid #f0f4f8" }}>
        <p className="section-label mb-0.5">Langkah 3</p>
        <h2 className="font-display font-bold text-gray-900">Validasi dan pratinjau</h2>
        <p className="text-xs text-gray-500 mt-1">
          {candidate.label} · {rows.length} baris ({rows[0]?.tahun}–{rows[rows.length - 1]?.tahun})
        </p>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        {errors.length > 0 && <IssueList title="Data belum dapat diterapkan" items={errors} tone="error" />}
        {warnings.length > 0 && <IssueList title="Peringatan, periksa kembali" items={warnings} tone="warning" />}
        {ok && errors.length === 0 && warnings.length === 0 && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#e8f6ef", color: "#1f7a52", border: "1px solid #bfe5d1" }}>
            Semua pemeriksaan lolos.
          </div>
        )}

        {newRows.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">Data tahun baru</p>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full">
                <thead style={{ background: "#f8fafc" }}>
                  <tr>
                    <th className="text-left text-gray-500">Seri</th>
                    {newRows.map((r) => <th key={r.tahun} className="text-right text-gray-700">{r.tahun}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {SERIES.map((s) => (
                    <tr key={s.key} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td className="text-gray-600">{s.label}</td>
                      {newRows.map((r) => <td key={r.tahun} className="text-right text-gray-900">{fmtNum(r[s.key])}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {ok && computed && (
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">
              Parameter: tahun dasar {activeBaseYear} → {computed.baseYear}
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full">
                <thead style={{ background: "#f8fafc" }}>
                  <tr className="text-gray-500">
                    <th className="text-left">Kel.</th>
                    <th className="text-left">Parameter</th>
                    <th className="text-right">Lama ({activeBaseYear})</th>
                    <th className="text-right">Baru ({computed.baseYear})</th>
                    <th className="text-right">Selisih</th>
                    <th className="text-right">Selisih (%)</th>
                    <th className="text-left">Rumus</th>
                  </tr>
                </thead>
                <tbody>
                  {PARAM_DEFS.map((d) => {
                    const lama = activeParams[d.key];
                    const baru = computed.values[d.key];
                    const diff = baru - lama;
                    const isYear = d.precision === "integer";
                    const pct = lama !== 0 && !isYear ? (diff / Math.abs(lama)) * 100 : NaN;
                    const changed = Math.abs(diff) > 0;
                    const show = (v: number) => (isYear ? String(v) : fmtParam(v));
                    return (
                      <tr key={d.key} style={{ borderTop: "1px solid #f1f5f9", background: changed ? "#fffdf5" : undefined }}>
                        <td className="text-gray-400">{d.kelompok}</td>
                        <td className="text-gray-800">{d.label}<span className="block text-[11px] text-gray-400">{d.satuan}</span></td>
                        <td className="text-right text-gray-600">{show(lama)}</td>
                        <td className="text-right font-semibold text-gray-900">{show(baru)}</td>
                        <td className="text-right" style={{ color: changed ? "#9a5b00" : "#94a3b8" }}>{changed ? (diff > 0 ? "+" : "") + show(diff) : "0"}</td>
                        <td className="text-right" style={{ color: changed ? "#9a5b00" : "#94a3b8" }}>
                          {Number.isFinite(pct) ? `${pct > 0 ? "+" : ""}${pct.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%` : "—"}
                        </td>
                        <td className="text-gray-400 text-[11px]">{d.rumus}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              Nilai baru dibulatkan seperti di model penelitian: 6 angka penting; Proporsi Wisatawan Menginap 4 desimal; Malam Tersedia per Kamar 2 desimal.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <button className="btn btn-primary" onClick={onApply} disabled={!ok}>
            Terapkan data dasar {computed ? computed.baseYear : ""}
          </button>
          <button className="btn btn-outline" onClick={onCancel}>Batal</button>
        </div>
      </div>
    </div>
  );
}
