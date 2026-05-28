"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { scenarios, outputVariables, scenariosList } from "@/lib/scenarios";
import { runModel, SimulationParams } from "@/lib/model";

const LineChart = dynamic(() => import("@/components/LineChart"), { ssr: false });

const sliderConfigs = [
  { id: "laju_wisnus", label: "Laju Wisatawan Nusantara", unit: "%", scale: 100, min: 0, max: 0.15, step: 0.005, group: "Pariwisata" },
  { id: "laju_wisman", label: "Laju Wisatawan Mancanegara", unit: "%", scale: 100, min: 0, max: 0.15, step: 0.005, group: "Pariwisata" },
  { id: "laju_konstruksi_hotel", label: "Konstruksi Hotel", unit: "unit/thn", scale: 1, min: 500, max: 5000, step: 100, group: "Pariwisata" },
  { id: "proporsi_olah_limbah_cair", label: "Pengolahan Air Limbah", unit: "%", scale: 100, min: 0, max: 1, step: 0.05, group: "Lingkungan" },
  { id: "proporsi_olah_limbah_padat", label: "Pengolahan Limbah Padat", unit: "%", scale: 100, min: 0, max: 1, step: 0.05, group: "Lingkungan" },
  { id: "ekstraksi_air_diizinkan", label: "Ekstraksi Air Diizinkan", unit: "juta m³", scale: 1e-6, min: 2e7, max: 6e7, step: 0.5e7, group: "Lingkungan" },
  { id: "infiltrasi_normal", label: "Normal Infiltration Rate", unit: "juta m³", scale: 1e-6, min: 1.5e7, max: 4e7, step: 0.25e7, group: "Lingkungan" },
  { id: "lahan_diizinkan_resort", label: "Lahan untuk Resort", unit: "%", scale: 100, min: 0, max: 0.3, step: 0.01, group: "Tata Ruang" },
  { id: "luas_lahan_per_unit", label: "Luas Lahan per Unit", unit: "m²", scale: 1, min: 800, max: 3000, step: 100, group: "Tata Ruang" },
];

const sliderGroups = ["Pariwisata", "Lingkungan", "Tata Ruang"];
const groupColors: Record<string, string> = {
  Pariwisata: "#1D5A8C",
  Lingkungan: "#3A9C77",
  "Tata Ruang": "#E89D3E",
};

export default function SimulasiPage() {
  const bau = scenarios.S1_BAU;
  const [params, setParams] = useState<SimulationParams>(bau.params);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVariables, setSelectedVariables] = useState<string[]>([
    "jumlah_wisnus",
    "jumlah_akomodasi",
  ]);
  const [activeGroup, setActiveGroup] = useState<string>("Pariwisata");
  const [activePreset, setActivePreset] = useState<string>("S1");
  const [showCombinedChart, setShowCombinedChart] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);

  const handleParamChange = (key: string, value: number) => {
    setParams({ ...params, [key]: value });
    setActivePreset("");
  };

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      const data = await runModel(params);
      setSimulationData(data);
    } catch (error) {
      console.error("Simulation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadScenario = (scenarioKey: string) => {
    const scenarioMap: any = {
      S1: scenarios.S1_BAU,
      S2: scenarios.S2_Sustainable,
      S3: scenarios.S3_Conservation,
      S4: scenarios.S4_Aggressive,
      S5: scenarios.S5_ClimateAdapt,
    };
    const scenario = scenarioMap[scenarioKey];
    if (scenario) {
      setParams(scenario.params);
      setActivePreset(scenarioKey);
    }
  };

  const chartData = useMemo(() => {
    if (!simulationData || selectedVariables.length === 0) return null;
    const result: any = {};
    selectedVariables.forEach((varId) => {
      result[varId] = (simulationData as any)[varId] || [];
    });
    return { years: simulationData.years, data: result };
  }, [simulationData, selectedVariables]);

  const individualChartsData = useMemo(() => {
    if (!simulationData || selectedVariables.length === 0) return null;
    return selectedVariables.map((varId) => {
      const variable = outputVariables.find((v) => v.id === varId);
      const data: any = {};
      data[variable?.label || varId] = (simulationData as any)[varId] || [];
      return { varId, variable, years: simulationData.years, data };
    });
  }, [simulationData, selectedVariables]);

  const filteredSliders = sliderConfigs.filter((s) => s.group === activeGroup);

  const formatValue = (config: typeof sliderConfigs[0], raw: number) => {
    const v = raw * config.scale;
    if (config.unit === "%") return v.toFixed(1) + "%";
    if (config.unit === "juta m³") return v.toFixed(1) + " jt m³";
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
                <p className="section-label mb-4" style={{ color: '#F4CD53' }}>Simulasi Real-Time</p>
                <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">
                  Simulasi<br />
                  <span style={{ color: '#2BB3B6' }}>Interaktif</span>
                </h1>
                <p className="text-blue-200 text-base max-w-lg leading-relaxed">
                  Sesuaikan parameter kebijakan secara bebas dan lihat dampaknya terhadap sistem pariwisata DIY 2024–2050
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── MAIN CONTENT ─────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

            {/* ── LEFT PANEL ───────────────────────────────── */}
            <div className="lg:col-span-1 space-y-4" style={{ position: 'sticky', top: '88px' }}>

              {/* Preset Scenarios */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f4f8' }}>
                  <p className="section-label mb-0.5">Preset Cepat</p>
                  <h3 className="font-display font-bold text-gray-900 text-sm">Muat Skenario</h3>
                </div>
                <div className="p-4 grid grid-cols-5 gap-2">
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
                  <p className="section-label mb-1">Konfigurasi</p>
                  <h3 className="font-display font-bold text-gray-900 text-sm">Parameter Simulasi</h3>
                </div>

                <div className="group-tabs-container">
                  {sliderGroups.map((group) => (
                    <button
                      key={group}
                      onClick={() => setActiveGroup(group)}
                      className={`group-tab ${activeGroup === group ? 'active' : ''}`}
                    >
                      {group}
                    </button>
                  ))}
                </div>

                <div className="p-4 space-y-5">
                  {filteredSliders.map((config) => {
                    const rawVal = (params as any)[config.id];
                    const pct = getSliderPercent(config, rawVal);
                    const groupColor = groupColors[config.group];
                    return (
                      <div key={config.id}>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-gray-600 leading-tight" style={{ maxWidth: '60%' }}>
                            {config.label}
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
                            style={{ color: groupColor }}
                          />
                        </div>
                        <div style={{ position: 'relative' }}>
                          <div className="slider-track">
                            <div className="slider-fill" style={{ width: `${pct}%`, background: groupColor + '60' }}></div>
                          </div>
                          <input
                            type="range"
                            min={config.min}
                            max={config.max}
                            step={config.step}
                            value={rawVal}
                            onChange={(e) => handleParamChange(config.id, parseFloat(e.target.value))}
                            style={{ accentColor: groupColor, marginTop: '-2px' }}
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

              {/* Action buttons */}
              <div className="space-y-2">
                <button onClick={runSimulation} disabled={isLoading} className="run-btn">
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
                <button onClick={() => { loadScenario("S1"); }} className="reset-btn">
                  ↺ Reset ke BAU
                </button>
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
                <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1">
                  {outputVariables.map((variable) => {
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
                        <span className="leading-tight">{variable.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

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
                          <h3 className="font-display font-bold text-gray-900 text-sm">Perbandingan Semua Variabel - 2024 – 2050</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          <span className="text-xs text-gray-400">Data tersedia</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <LineChart
                          years={chartData.years}
                          data={chartData.data}
                          title="Perbandingan Semua Variabel"
                          yAxisLabel="Nilai"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {individualChartsData?.map((chartItem) => (
                        <div key={chartItem.varId} className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f4f8' }}>
                            <div>
                              <p className="section-label mb-0.5" style={{ color: '#1D5A8C' }}>{chartItem.variable?.label}</p>
                              <h3 className="font-display font-bold text-gray-900 text-sm">Simulasi 2024 – 2050</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-400"></div>
                              <span className="text-xs text-gray-400">{chartItem.variable?.unit}</span>
                            </div>
                          </div>
                          <div className="p-6">
                            <LineChart
                              years={chartItem.years}
                              data={chartItem.data}
                              title={chartItem.variable?.label || ''}
                              yAxisLabel={chartItem.variable?.unit || 'Nilai'}
                            />
                          </div>
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
                        <span className="ml-2 text-xs font-normal text-gray-400">· Proyeksi 2024–2050</span>
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
                                <div style={{ fontSize: 10, fontWeight: 400, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>{variable?.unit}</div>
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
                <div className="p-5 grid grid-cols-3 gap-3">
                  {sliderConfigs.map((config) => {
                    const rawVal = (params as any)[config.id];
                    const groupColor = groupColors[config.group];
                    return (
                      <div key={config.id} className="rounded-xl p-3"
                        style={{ background: '#f8fafc', border: '1px solid #f0f4f8' }}>
                        <div className="text-[10px] text-gray-400 mb-1 leading-tight">{config.label}</div>
                        <div className="font-display font-bold text-sm" style={{ color: groupColor }}>
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
