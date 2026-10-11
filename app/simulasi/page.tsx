"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { scenarios, outputVariables, outputDimensions, scenariosList } from "@/lib/scenarios";
import { runModel, SimulationParams } from "@/lib/model";
import { interpretSingle, describeParams, BAU_SUBJECT } from "@/lib/interpretation";
import ChartInterpretation, { InterpretationNote } from "@/components/ChartInterpretation";
import SimulationSummary from "@/components/SimulationSummary";
import { summarizeSingle } from "@/lib/summary";
import InfoTip from "@/components/InfoTip";
import { useBaseData } from "@/components/BaseDataProvider";
import { ChoiceDialog, StaleHint, Toast, revealElement, toastError, toastInfo, toastOk, withMinDuration, type ToastMessage } from "@/components/RunFeedback";
import Link from "next/link";
import { toolLinks } from "@/components/Navbar";
import ApplyLeversFromUrl, { type AssumptionChanges } from "@/components/ApplyLeversFromUrl";
import { ASSUMPTIONS, assumptionBaseValues, assumptionConstants, describeAssumptionChanges } from "@/lib/goalSeek";
import { GLOSSARY, displayUnit } from "@/lib/glossary";
import type { CompareInput } from "@/lib/comparison";

const LineChart = dynamic(() => import("@/components/LineChart"), { ssr: false });
const ComparisonChart = dynamic(() => import("@/components/ComparisonChart"), { ssr: false });

// Dua tuas kebijakan resmi (Bab 3.8.1 & 4.8.1 skripsi): parameter lain sudah
// final hasil kalibrasi dan tidak diekspos sebagai input agar sejalan dengan
// kriteria keterkendalian yang dipakai untuk menyaring tuas kebijakan.
const sliderConfigs = [
  { id: "insentif_kebijakan", label: "Insentif Kebijakan", unit: "%", scale: 100, min: 0, max: 0.5, step: 0.01 },
  { id: "kebijakan_konservasi_lahan", label: "Kebijakan Konservasi Lahan", unit: "%", scale: 100, min: 0, max: 1, step: 0.05 },
];
const sliderColor = "#1D5A8C";

export default function SimulasiPage() {
  const bau = scenarios.BAU;
  const { override, baseYear, config: baseConfig } = useBaseData();
  const [params, setParams] = useState<SimulationParams>(bau.params);
  const [simulationDataRaw, setSimulationData] = useState<any>(null);
  // Parameter saat simulasi terakhir dijalankan dan hasil BAU sebagai pembanding interpretasi.
  const [runParamsRaw, setRunParams] = useState<SimulationParams | null>(null);
  const [baselineDataRaw, setBaselineData] = useState<any>(null);
  // Data dasar yang dipakai saat simulasi terakhir; hasil lama disembunyikan bila data dasar berubah.
  const [resultBase, setResultBase] = useState<typeof override | undefined>(undefined);
  const fresh = resultBase === override;
  const simulationData = fresh ? simulationDataRaw : null;
  const baselineData = fresh ? baselineDataRaw : null;
  const runParams = fresh ? runParamsRaw : null;
  const [isLoading, setIsLoading] = useState(false);
  // Perubahan asumsi model (persen dari nilai dasar) yang dibawa dari Pencarian Target.
  // Bukan tuas kebijakan; kosong pada pemakaian biasa.
  const [assumptions, setAssumptions] = useState<AssumptionChanges>({});
  const currentAssumptions = assumptions;
  // Nilai tuas yang dibawa dari Pencarian Target, untuk mendeteksi bila pengguna mengubah tuas
  // sementara kondisi lain dari Pencarian Target masih aktif.
  const [loadedLevers, setLoadedLevers] = useState<SimulationParams | null>(null);
  // Pengguna sudah memilih tetap memakai kondisi Pencarian Target; tidak ditanya ulang sampai nilai baru dimuat.
  const [keepChosen, setKeepChosen] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [runAssumptionsRaw, setRunAssumptions] = useState<AssumptionChanges>({});
  const runAssumptions = fresh ? runAssumptionsRaw : {};
  // Umpan balik status: pesan selesai, gulir ke hasil, dan penanda hasil lama.
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const closeToast = useCallback(() => setToast(null), []);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [revealTick, setRevealTick] = useState(0);
  useEffect(() => {
    if (revealTick) revealElement(resultsRef.current);
  }, [revealTick]);
  const stale =
    !!runParams &&
    (params.insentif_kebijakan !== runParams.insentif_kebijakan ||
      params.kebijakan_konservasi_lahan !== runParams.kebijakan_konservasi_lahan ||
      JSON.stringify(assumptions) !== JSON.stringify(runAssumptions));
  const hasAssumptions = Object.keys(assumptions).length > 0;
  const assumptionNote = describeAssumptionChanges(assumptions);
  // Saat Jalankan Simulasi diklik: bila tuas sudah diubah dari nilai Pencarian Target
  // sementara kondisinya masih aktif, tanyakan dulu kondisi mana yang dipakai.
  const needsChoice =
    hasAssumptions &&
    !!loadedLevers &&
    !keepChosen &&
    (params.insentif_kebijakan !== loadedLevers.insentif_kebijakan ||
      params.kebijakan_konservasi_lahan !== loadedLevers.kebijakan_konservasi_lahan);
  const onRunClick = () => (needsChoice ? setChoiceOpen(true) : runSimulation());

  const describeRun = (p: SimulationParams, a: AssumptionChanges) => {
    const note = describeAssumptionChanges(a);
    const lead = describeParams(p);
    return note ? `${lead.slice(0, -1)} serta perubahan kondisi lain (${note}),` : lead;
  };
  const [selectedVariables, setSelectedVariables] = useState<string[]>([
    "jumlah_wisatawan",
    "tenaga_kerja_pariwisata",
  ]);
  const [activePreset, setActivePreset] = useState<string>("BAU");
  const [showCombinedChart, setShowCombinedChart] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);

  const handleParamChange = (key: string, value: number) => {
    setParams({ ...params, [key]: value });
    setActivePreset("");
  };

  /**
   * Menjalankan simulasi dengan pengaturan di panel kiri. `opts.assumptions`
   * dipakai bila pengguna memilih kondisi lain yang berbeda (mis. kembali ke
   * kondisi dasar) langsung dari popup.
   */
  const runSimulation = async (opts?: { assumptions?: AssumptionChanges }) => {
    const assumptions = opts?.assumptions ?? currentAssumptions;
    if (opts?.assumptions) {
      setAssumptions(opts.assumptions);
      if (Object.keys(opts.assumptions).length === 0) setLoadedLevers(null);
    }
    setIsLoading(true);
    setToast(null);
    try {
      const isBau =
        params.insentif_kebijakan === bau.params.insentif_kebijakan &&
        params.kebijakan_konservasi_lahan === bau.params.kebijakan_konservasi_lahan;
      const extras = assumptionConstants(assumptions, baseConfig?.params);
      const [data, baseline] = await withMinDuration(
        Promise.all([
          runModel(params, override, extras),
          // Pembanding selalu BAU dengan asumsi dasar.
          isBau && extras.length === 0 ? Promise.resolve(null) : runModel(bau.params, override),
        ])
      );
      setSimulationData(data);
      setResultBase(override);
      setRunParams(params);
      setRunAssumptions(assumptions);
      const note = describeAssumptionChanges(assumptions);
      setToast(toastOk(
        `Insentif ${(params.insentif_kebijakan * 100).toLocaleString("id-ID", { maximumFractionDigits: 1 })}%, ` +
          `Konservasi ${(params.kebijakan_konservasi_lahan * 100).toLocaleString("id-ID", { maximumFractionDigits: 1 })}%` +
          `${note ? `, ${note}` : ""} · ${baseYear}–2050.`,
        "Simulasi selesai"
      ));
      setRevealTick((t) => t + 1);
      setBaselineData(baseline);
    } catch (error) {
      console.error("Simulation error:", error);
      setToast(toastError("Muat ulang halaman, lalu coba lagi.", "Simulasi gagal"));
    } finally {
      setIsLoading(false);
    }
  };

  const pctText = (v: number) => `${(v * 100).toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`;

  /** Menghapus hasil simulasi yang sedang tampil. */
  const clearResults = () => {
    setSimulationData(null);
    setBaselineData(null);
    setRunParams(null);
    setRunAssumptions({});
  };

  const loadScenario = (scenarioKey: string) => {
    const scenario = scenariosList.find((s) => s.id === scenarioKey);
    if (scenario) {
      setParams(scenario.params);
      setActivePreset(scenarioKey);
    }
  };

  const resetToBau = () => {
    setLoadedLevers(null);
    setParams(bau.params);
    setActivePreset("BAU");
    setAssumptions({});
    clearResults();
    setToast(toastOk("Tuas kembali ke 0% dan hasil lama dihapus.", "Kembali ke BAU"));
  };

  const resetAssumptions = () => {
    setLoadedLevers(null);
    setAssumptions({});
    clearResults();
    setToast(toastOk("Kondisi lain kembali sesuai data. Hasil lama dihapus.", "Kembali ke kondisi asli"));
  };

  const chartData = useMemo(() => {
    if (!simulationData || selectedVariables.length === 0) return null;
    const result: any = {};
    selectedVariables.forEach((varId) => {
      result[varId] = (simulationData as any)[varId] || [];
    });
    return { years: simulationData.years, data: result };
  }, [simulationData, selectedVariables]);

  const comparisonInputs = useMemo<CompareInput[]>(() => {
    if (!simulationData) return [];
    return selectedVariables.flatMap((varId) => {
      const variable = outputVariables.find((v) => v.id === varId);
      return variable ? [{ label: variable.label, variable, values: (simulationData as unknown as Record<string, number[]>)[varId] || [] }] : [];
    });
  }, [simulationData, selectedVariables]);

  const individualChartsData = useMemo(() => {
    if (!simulationData || selectedVariables.length === 0) return null;
    const simYears: number[] = simulationData.years;
    return selectedVariables.map((varId) => {
      const variable = outputVariables.find((v) => v.id === varId);
      const years = simYears;
      const simValues: number[] = (simulationData as any)[varId] || [];
      const data: any = {
        [variable?.label || varId]: simValues,
      };
      const interpretation =
        variable && runParams
          ? interpretSingle(variable, years, simValues, {
              subject: baselineData ? describeRun(runParams, runAssumptions) : BAU_SUBJECT,
              baseline: baselineData?.[varId] ?? null,
            })
          : null;
      return { varId, variable, years, data, interpretation };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulationData, selectedVariables, runParams, baselineData, runAssumptionsRaw]);

  const summary = useMemo(() => {
    if (!simulationData || !runParams) return null;
    return summarizeSingle(simulationData, baselineData, {
      lead: baselineData ? describeRun(runParams, runAssumptions) : BAU_SUBJECT,
      hintWhenBaseline:
        "Ini kondisi acuan tanpa kebijakan tambahan. Ubah tuas kebijakan atau pilih preset SUS/DP, lalu jalankan simulasi untuk melihat dampaknya.",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulationData, baselineData, runParams, runAssumptionsRaw]);

  const formatValue = (config: typeof sliderConfigs[0], raw: number) => {
    const v = raw * config.scale;
    if (config.unit === "%") return v.toFixed(1) + "%";
    if (v >= 1000) return v.toLocaleString("id-ID");
    return v.toFixed(0);
  };

  const getSliderPercent = (config: typeof sliderConfigs[0], val: number) => {
    return ((val - config.min) / (config.max - config.min)) * 100;
  };

  const sortedYears = useMemo(() => {
    if (!chartData) return [];
    const rows = chartData.years?.map((year: number, idx: number) => ({ year, idx })) || [];
    if (!sortConfig) return rows;
    return [...rows].sort((a, b) => {
      if (sortConfig.key === 'year') {
        return sortConfig.dir === 'asc' ? a.year - b.year : b.year - a.year;
      }
      const va = (chartData.data[sortConfig.key] || [])[a.idx] ?? 0;
      const vb = (chartData.data[sortConfig.key] || [])[b.idx] ?? 0;
      return sortConfig.dir === 'asc' ? va - vb : vb - va;
    });
  }, [chartData, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev =>
      prev?.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  };

  const SortIcon = ({ colKey }: { colKey: string }) => {
    const active = sortConfig?.key === colKey;
    const isAsc = sortConfig?.dir === 'asc';
    return (
      <span style={{ marginLeft: 4, opacity: active ? 1 : 0.3, fontSize: 10 }}>
        {active ? (isAsc ? '↑' : '↓') : '↕'}
      </span>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Sora', sans-serif; }

        .section-label {
          font-family: 'Sora', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #2BB3B6;
        }

        .page-hero {
          background: linear-gradient(135deg, #0d3554 0%, #1D5A8C 50%, #1a7a7c 100%);
          position: relative;
          overflow: hidden;
        }
        .page-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 85% 30%, rgba(43,179,182,0.18) 0%, transparent 50%),
            radial-gradient(circle at 10% 80%, rgba(232,157,62,0.10) 0%, transparent 40%);
        }

        input[type='range'] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 4px;
          outline: none;
          cursor: pointer;
          background: #e2e8f0;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          border: 2.5px solid #1D5A8C;
          box-shadow: 0 2px 6px rgba(29,90,140,0.25);
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(29,90,140,0.35);
        }
        input[type='range']::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          border: 2.5px solid #1D5A8C;
          box-shadow: 0 2px 6px rgba(29,90,140,0.25);
          cursor: pointer;
        }

        .preset-btn {
          padding: 8px 10px;
          border-radius: 10px;
          font-family: 'Sora', sans-serif;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1.5px solid transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }
        .preset-btn:hover { transform: translateY(-2px); }

        .group-tabs-container {
          display: flex;
          gap: 0;
          border-bottom: 2px solid #e2e8f0;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .group-tabs-container::-webkit-scrollbar { display: none; }

        .group-tab {
          padding: 10px 16px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: transparent;
          color: #64748b;
          position: relative;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .group-tab:hover { color: #475569; }
        .group-tab.active { color: #1D5A8C; font-weight: 700; }
        .group-tab.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: #1D5A8C;
        }

        .run-btn {
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          font-family: 'Sora', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: white;
          background: linear-gradient(135deg, #1D5A8C, #2BB3B6);
          box-shadow: 0 4px 16px rgba(29,90,140,0.25);
        }
        .run-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(29,90,140,0.35);
        }
        .run-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

        .reset-btn {
          width: 100%;
          padding: 10px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1.5px solid #e2e8f0;
          color: #64748b;
          background: white;
        }
        .reset-btn:hover { border-color: #cbd5e1; background: #f8fafc; }

        .var-check-label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
          font-size: 12px;
          color: #374151;
        }
        .var-check-label:hover { background: #f8fafc; }

        .custom-checkbox {
          width: 15px;
          height: 15px;
          border-radius: 4px;
          border: 1.5px solid #cbd5e1;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          background: white;
        }
        .custom-checkbox.checked {
          background: #1D5A8C;
          border-color: #1D5A8C;
        }

        .chart-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 380px;
          border-radius: 20px;
          border: 2px dashed #e2e8f0;
          background: white;
        }

        .slider-track {
          position: relative;
          height: 4px;
          border-radius: 4px;
          background: #e2e8f0;
          margin-bottom: 4px;
        }
        .slider-fill {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          border-radius: 4px;
          pointer-events: none;
        }

        th[data-sortable]:hover { opacity: 0.85; }
      `}</style>

      <div className="min-h-screen" style={{ background: '#f8fafc' }}>

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="page-hero text-white">
          <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <div>
                <p className="section-label mb-4" style={{ color: '#F4CD53' }}>Eksplorasi Bebas</p>
                <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">
                  Eksplorasi<br />
                  <span style={{ color: '#2BB3B6' }}>Simulasi</span>
                </h1>
                <p className="text-blue-200 text-base max-w-lg leading-relaxed">
                  Atur bebas dua tuas kebijakan resmi — Insentif Kebijakan dan Kebijakan Konservasi Lahan — dan lihat dampaknya terhadap sistem pariwisata DIY {baseYear}–2050
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── MAIN CONTENT ─────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 py-10">
          <Suspense fallback={null}>
            <ApplyLeversFromUrl
              onApply={(applied) => {
                setLoadedLevers(Object.keys(applied.assumptions).length ? applied.levers : null);
                setKeepChosen(false);
                setParams(applied.levers);
                setAssumptions(applied.assumptions);
                setActivePreset("");
                clearResults();
                const note = describeAssumptionChanges(applied.assumptions);
                setToast(
                  toastInfo(
                    `Insentif ${pctText(applied.levers.insentif_kebijakan)}, ` +
                      `Konservasi ${pctText(applied.levers.kebijakan_konservasi_lahan)}${note ? `, ${note}` : ""}. ` +
                      "Klik Jalankan Simulasi.",
                    "Nilai dari Pencarian Target"
                  )
                );
              }}
            />
          </Suspense>
          <Toast toast={stale ? null : toast} onClose={closeToast} />
          {choiceOpen && (
            <ChoiceDialog
              title="Pakai kondisi yang mana?"
              text={`Tuas sudah diubah, tetapi kondisi dari Pencarian Target (${assumptionNote}) masih aktif.`}
              onCancel={() => setChoiceOpen(false)}
              options={[
                {
                  label: "Tetap pakai kondisi itu",
                  onSelect: () => {
                    setChoiceOpen(false);
                    setKeepChosen(true);
                    runSimulation();
                  },
                },
                {
                  label: "Pakai kondisi asli",
                  onSelect: () => {
                    setChoiceOpen(false);
                    runSimulation({ assumptions: {} });
                  },
                },
              ]}
            />
          )}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

            {/* ── LEFT PANEL ───────────────────────────────── */}
            <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-[88px]">

              {/* Preset Scenarios */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f4f8' }}>
                  <p className="section-label mb-0.5">Preset Cepat</p>
                  <h3 className="font-display font-bold text-gray-900 text-sm">Muat Skenario</h3>
                </div>
                <div className="p-4 grid grid-cols-3 gap-2">
                  {scenariosList.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => loadScenario(s.id)}
                      className="preset-btn"
                      title={s.label}
                      style={activePreset === s.id
                        ? { background: s.color, color: 'white', border: `1.5px solid ${s.color}` }
                        : { background: s.color + '15', color: s.color, border: `1.5px solid ${s.color}30` }
                      }
                    >
                      <span>{s.id}</span>
                    </button>
                  ))}
                </div>
                {activePreset && (
                  <div className="px-4 pb-4">
                    <div className="text-xs text-center text-gray-400 px-3 py-2 rounded-lg" style={{ background: '#f8fafc' }}>
                      {scenariosList.find(s => s.id === activePreset)?.label}
                    </div>
                  </div>
                )}
              </div>

              {/* Parameter Sliders */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f4f8' }}>
                  <p className="section-label mb-1">Tuas Kebijakan</p>
                  <h3 className="font-display font-bold text-gray-900 text-sm">Parameter Simulasi</h3>
                </div>

                <div className="p-4 space-y-5">
                  {sliderConfigs.map((config) => {
                    const rawVal = (params as any)[config.id];
                    const pct = getSliderPercent(config, rawVal);
                    return (
                      <div key={config.id}>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-gray-600 leading-tight" style={{ maxWidth: '60%' }}>
                            {config.label}
                            {GLOSSARY[config.id] && (
                              <span className="ml-1 inline-block"><InfoTip text={GLOSSARY[config.id]} label={config.label} /></span>
                            )}
                          </label>
                          <input
                            type="number"
                            min={config.min}
                            max={config.max}
                            step={config.step}
                            value={rawVal}
                            onChange={(e) => {
                              const newVal = parseFloat(e.target.value);
                              if (!isNaN(newVal) && newVal >= config.min && newVal <= config.max) {
                                handleParamChange(config.id, newVal);
                              }
                            }}
                            className="text-xs font-bold px-2 py-1 rounded-lg border border-gray-200 w-20 text-right"
                            style={{ color: sliderColor }}
                          />
                        </div>
                        <div style={{ position: 'relative' }}>
                          <div className="slider-track">
                            <div className="slider-fill" style={{ width: `${pct}%`, background: sliderColor + '60' }}></div>
                          </div>
                          <input
                            type="range"
                            min={config.min}
                            max={config.max}
                            step={config.step}
                            value={rawVal}
                            onChange={(e) => handleParamChange(config.id, parseFloat(e.target.value))}
                            style={{ accentColor: sliderColor, marginTop: '-2px' }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-300 mt-1">
                          <span>{formatValue(config, config.min)}</span>
                          <span>{formatValue(config, config.max)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {Object.keys(assumptions).length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1">Kondisi lain yang diubah</p>
                  <ul className="text-sm space-y-0.5">
                    {ASSUMPTIONS.filter((a) => assumptions[a.key] !== undefined).map((a) => {
                      const pct = assumptions[a.key]!;
                      const base = assumptionBaseValues(baseConfig?.params)[a.key];
                      return (
                        <li key={a.key}>
                          {a.plain}: <strong>{pct >= 0 ? "+" : "−"}{Math.abs(pct).toLocaleString("id-ID", { maximumFractionDigits: 2 })}%</strong>{" "}
                          <span className="text-xs">(menjadi {a.show(base * (1 + pct / 100))})</span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="text-xs mt-2 leading-relaxed">
                    Dari Pencarian Target. Ini pengandaian, <strong>bukan kebijakan</strong>. Hasil tetap dibandingkan dengan
                    kondisi tanpa kebijakan.
                  </p>
                  <button type="button" onClick={resetAssumptions} className="mt-2 text-xs font-semibold underline">
                    Kembalikan ke kondisi asli
                  </button>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-2">
                <button onClick={onRunClick} disabled={isLoading} className="run-btn">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Menjalankan…
                    </>
                  ) : (
                    <>Jalankan Simulasi</>
                  )}
                </button>
                <StaleHint show={stale && !isLoading} />
                <button onClick={resetToBau} className="reset-btn">
                  ↺ Reset ke BAU
                </button>
              </div>

              {/* Pintasan ke alat lanjutan */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <p className="section-label mb-2">Alat lanjutan</p>
                <div className="space-y-1">
                  {toolLinks.map((t) => (
                    <Link key={t.href} href={t.href} className="block rounded-lg px-2 py-1.5 hover:bg-slate-50">
                      <span className="block text-sm font-semibold" style={{ color: '#1D5A8C' }}>{t.label} →</span>
                      <span className="block text-xs text-gray-500">{t.desc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT PANEL ──────────────────────────────── */}
            <div className="lg:col-span-3 space-y-5">

              {/* Variable selector */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f4f8' }}>
                  <div>
                    <p className="section-label mb-0.5">Output Model</p>
                    <h3 className="font-display font-bold text-gray-900 text-sm">Variabel yang Ditampilkan</h3>
                  </div>
                  <span className="font-display text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: '#eff6ff', color: '#1D5A8C', border: '1px solid #bfdbfe' }}>
                    {selectedVariables.length} dipilih
                  </span>
                </div>
                <div className="p-5 space-y-4">
                  {outputDimensions.map((dim) => (
                    <div key={dim}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">{dim}</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
                        {outputVariables.filter((v) => v.dimension === dim).map((variable) => {
                          const isChecked = selectedVariables.includes(variable.id);
                          return (
                            <label key={variable.id} className="var-check-label">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedVariables([...selectedVariables, variable.id]);
                                  } else {
                                    setSelectedVariables(selectedVariables.filter(id => id !== variable.id));
                                  }
                                }}
                                className="hidden"
                              />
                              <div className={`custom-checkbox ${isChecked ? "checked" : ""}`}>
                                {isChecked && (
                                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <span className="leading-tight">
                                {variable.label}
                                {GLOSSARY[variable.id] && (
                                  <span className="ml-1 inline-block"><InfoTip text={GLOSSARY[variable.id]} label={variable.label} /></span>
                                )}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div ref={resultsRef} className="space-y-5 scroll-mt-28">
              {summary && <SimulationSummary summary={summary} />}

              {/* Chart */}
              {chartData && chartData.data ? (
                <div className="space-y-5">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowCombinedChart(!showCombinedChart)}
                      className="font-display px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                      style={{
                        background: showCombinedChart ? '#1D5A8C' : 'white',
                        color: showCombinedChart ? 'white' : '#1D5A8C',
                        border: '1.5px solid #1D5A8C',
                      }}
                    >
                      {showCombinedChart ? '← Kembali ke Individual' : 'Lihat Perbandingan →'}
                    </button>
                  </div>

                  {showCombinedChart ? (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f4f8' }}>
                        <div>
                          <p className="section-label mb-0.5">Hasil Proyeksi</p>
                          <h3 className="font-display font-bold text-gray-900 text-sm">Perbandingan Semua Variabel - {baseYear} – 2050</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          <span className="text-xs text-gray-400">Data tersedia</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <ComparisonChart
                          years={chartData.years}
                          inputs={comparisonInputs}
                          title="Perbandingan Semua Variabel"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <InterpretationNote />
                      {individualChartsData?.map((chartItem) => (
                        <div key={chartItem.varId} className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f4f8' }}>
                            <div>
                              <p className="section-label mb-0.5" style={{ color: '#1D5A8C' }}>{chartItem.variable?.label}</p>
                              <h3 className="font-display font-bold text-gray-900 text-sm">Simulasi {baseYear} – 2050</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-400"></div>
                              <span className="text-xs text-gray-400">{displayUnit(chartItem.variable?.unit)}</span>
                            </div>
                          </div>
                          <div className="p-6">
                            <LineChart
                              years={chartItem.years}
                              data={chartItem.data}
                              title={chartItem.variable?.label || ''}
                              yAxisLabel={displayUnit(chartItem.variable?.unit) || 'Nilai'}
                            />
                          </div>
                          {chartItem.interpretation && <ChartInterpretation interpretation={chartItem.interpretation} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="chart-placeholder">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-5"
                    style={{ background: '#eff6ff', border: '2px solid #bfdbfe' }}>
                    {isLoading ? (
                      <svg className="animate-spin w-7 h-7" style={{ color: '#1D5A8C' }} fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                    ) : "📊"}
                  </div>
                  <h3 className="font-display font-bold text-gray-700 text-lg mb-2">
                    {isLoading ? "Menjalankan simulasi…" : "Belum ada hasil simulasi"}
                  </h3>
                  <p className="text-sm text-gray-400 text-center max-w-xs leading-relaxed">
                    {isLoading
                      ? "Model sedang memproses parameter yang dipilih"
                      : "Atur parameter di panel kiri, pilih variabel output, lalu klik Jalankan Simulasi"
                    }
                  </p>
                </div>
              )}

              {/* Data table */}
              {chartData && chartData.data && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>

                  {/* Header */}
                  <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f4f8' }}>
                    <div>
                      <p className="section-label mb-0.5">Tabel Data</p>
                      <h3 className="font-display font-bold text-gray-900 text-sm">
                        Detail Output Simulasi
                        <span className="ml-2 text-xs font-normal text-gray-400">· Proyeksi {baseYear}–2050</span>
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        const header = ["Tahun", ...selectedVariables.map(id => outputVariables.find(v => v.id === id)?.label)].join(",");
                        const rows = chartData.years?.map((yr: number, i: number) =>
                          [yr, ...selectedVariables.map(id => (chartData.data[id] || [])[i] ?? "")].join(",")
                        );
                        const csv = [header, ...(rows || [])].join("\n");
                        const blob = new Blob([csv], { type: "text/csv" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a"); a.href = url; a.download = "simulasi.csv"; a.click();
                        setToast(toastOk("simulasi.csv tersimpan di folder unduhan.", "Tabel diunduh"));
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px', borderRadius: 8,
                        border: '1px solid #e2e8f0', background: 'white',
                        fontSize: 12, color: '#64748b', cursor: 'pointer',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1v9M4 6l4 4 4-4M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      Ekspor CSV
                    </button>
                  </div>

                  {/* Table */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr>
                          <th
                            data-sortable
                            onClick={() => handleSort('year')}
                            style={{ padding: '10px 20px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', background: '#1D5A8C', cursor: 'pointer', userSelect: 'none' }}
                          >
                            Tahun <SortIcon colKey="year" />
                          </th>
                          {selectedVariables.map((varId) => {
                            const variable = outputVariables.find((v) => v.id === varId);
                            return (
                              <th
                                key={varId}
                                data-sortable
                                onClick={() => handleSort(varId)}
                                style={{ padding: '10px 16px', textAlign: 'right', whiteSpace: 'nowrap', background: '#1D5A8C', cursor: 'pointer', userSelect: 'none' }}
                              >
                                <div style={{ fontSize: 11, fontWeight: 600, color: 'white' }}>
                                  {variable?.label} <SortIcon colKey={varId} />
                                </div>
                                <div style={{ fontSize: 10, fontWeight: 400, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>{displayUnit(variable?.unit)}</div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {sortedYears.map(({ year, idx: yearIdx }: { year: number; idx: number }) => (
                          <tr
                            key={year}
                            style={{
                              borderTop: '1px solid #f0f4f8',
                              background: yearIdx % 2 === 0 ? 'white' : '#f8fafc',
                            }}
                            onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#eff6ff'}
                            onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = yearIdx % 2 === 0 ? 'white' : '#f8fafc'}
                          >
                            <td style={{ padding: '9px 20px', fontWeight: 500, color: '#1e293b', whiteSpace: 'nowrap' }}>
                              <span style={{
                                display: 'inline-block', padding: '2px 7px', borderRadius: 4,
                                background: yearIdx % 2 === 0 ? '#f1f5f9' : '#e2e8f0',
                                fontSize: 11, color: '#64748b',
                              }}>
                                {year}
                              </span>
                            </td>
                            {selectedVariables.map((varId) => {
                              const variable = outputVariables.find((v) => v.id === varId);
                              const value = (chartData.data[varId] || [])[yearIdx];
                              const displayValue = typeof value === 'number'
                                ? variable?.unit === '%'
                                  ? (value * 100).toFixed(1) + '%'
                                  : value.toLocaleString('id-ID', { maximumFractionDigits: 2 })
                                : '-';
                              return (
                                <td key={varId} style={{ padding: '9px 16px', textAlign: 'right', color: '#475569', fontWeight: 400, whiteSpace: 'nowrap' }}>
                                  {displayValue}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              </div>

              {/* Current params summary */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <div className="px-6 py-4" style={{ borderBottom: '1px solid #f0f4f8' }}>
                  <p className="section-label mb-0.5">Konfigurasi Aktif</p>
                  <h3 className="font-display font-bold text-gray-900 text-sm">
                    {activePreset
                      ? `Preset: ${scenariosList.find(s => s.id === activePreset)?.label}`
                      : "Parameter Kustom"}
                  </h3>
                </div>
                <div className="p-5 grid grid-cols-2 gap-3">
                  {sliderConfigs.map((config) => {
                    const rawVal = (params as any)[config.id];
                    return (
                      <div key={config.id} className="rounded-xl p-3"
                        style={{ background: '#f8fafc', border: '1px solid #f0f4f8' }}>
                        <div className="text-[10px] text-gray-400 mb-1 leading-tight">{config.label}</div>
                        <div className="font-display font-bold text-sm" style={{ color: sliderColor }}>
                          {formatValue(config, rawVal)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
