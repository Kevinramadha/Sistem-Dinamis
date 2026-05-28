"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { scenarios, outputVariables, scenariosList } from "@/lib/scenarios";
import { runModel } from "@/lib/model";

const LineChart = dynamic(() => import("@/components/LineChart"), { ssr: false });

export default function SkenarioPage() {
  const [activeScenario, setActiveScenario] = useState<string>("S1");
  const [selectedVariables, setSelectedVariables] = useState<string[]>([
    "jumlah_wisnus",
    "jumlah_akomodasi",
  ]);
  const [compareAll, setCompareAll] = useState(false);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCombinedChart, setShowCombinedChart] = useState(false);
  const [activeTableVariable, setActiveTableVariable] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      if (compareAll) {
        const allData: any = {};
        for (const scenario of scenariosList) {
          const data = await runModel(scenario.params);
          allData[scenario.label] = data;
        }
        setSimulationData(allData);
      } else {
        const activeScenarioObj = scenariosList.find((s) => s.id === activeScenario);
        if (activeScenarioObj) {
          const data = await runModel(activeScenarioObj.params);
          setSimulationData({ [activeScenarioObj.label]: data });
        }
      }
    } catch (error) {
      console.error("Simulation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!simulationData || selectedVariables.length === 0) return null;
    const result: any = {};
    const yearReference = (Object.values(simulationData)[0] as any)?.years;
    selectedVariables.forEach((varId) => {
      const variable = outputVariables.find((v) => v.id === varId);
      if (!variable) return;
      Object.entries(simulationData).forEach(([scenarioName, data]: any) => {
        const key = `${variable.label} (${scenarioName})`;
        result[key] = data[varId] || [];
      });
    });
    return { years: yearReference, data: result };
  }, [simulationData, selectedVariables]);

  const individualChartsData = useMemo(() => {
    if (!simulationData || selectedVariables.length === 0) return null;
    const yearReference = (Object.values(simulationData)[0] as any)?.years;
    return selectedVariables.map((varId) => {
      const variable = outputVariables.find((v) => v.id === varId);
      const data: any = {};
      Object.entries(simulationData).forEach(([scenarioName, scenarioData]: any) => {
        const key = `${variable?.label} (${scenarioName})`;
        data[key] = scenarioData[varId] || [];
      });
      return { varId, variable, years: yearReference, data };
    });
  }, [simulationData, selectedVariables]);

  useEffect(() => {
    if (simulationData && selectedVariables.length > 0) {
      if (!activeTableVariable || !selectedVariables.includes(activeTableVariable)) {
        setActiveTableVariable(selectedVariables[0]);
      }
    }
  }, [simulationData, selectedVariables, activeTableVariable]);

  // Reset sort when variable changes
  useEffect(() => {
    setSortConfig(null);
  }, [activeTableVariable]);

  const activeScenarioObj = scenariosList.find((s) => s.id === activeScenario);

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

  // Build sorted rows for single scenario table
  const getSortedRows = (years: number[], data: any, sortKey: string | null, sortDir: 'asc' | 'desc') => {
    const rows = years.map((year: number, idx: number) => ({ year, idx }));
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      if (sortKey === 'year') {
        return sortDir === 'asc' ? a.year - b.year : b.year - a.year;
      }
      const va = data?.[sortKey]?.[a.idx] ?? 0;
      const vb = data?.[sortKey]?.[b.idx] ?? 0;
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  };

  // Build sorted rows for multi scenario table (sort by year or first scenario value)
  const getSortedRowsMulti = (years: number[], simulationData: any, activeVar: string, sortKey: string | null, sortDir: 'asc' | 'desc') => {
    const rows = years.map((year: number, idx: number) => ({ year, idx }));
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      if (sortKey === 'year') {
        return sortDir === 'asc' ? a.year - b.year : b.year - a.year;
      }
      const scenarioData = simulationData?.[sortKey];
      const va = scenarioData?.[activeVar]?.[a.idx] ?? 0;
      const vb = scenarioData?.[activeVar]?.[b.idx] ?? 0;
      return sortDir === 'asc' ? va - vb : vb - va;
    });
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
            radial-gradient(circle at 80% 40%, rgba(43,179,182,0.18) 0%, transparent 50%),
            radial-gradient(circle at 10% 70%, rgba(244,205,83,0.08) 0%, transparent 40%);
        }

        .scenario-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 12px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
          text-align: left;
        }
        .scenario-btn:hover { transform: translateX(2px); }
        .scenario-btn.active { border-color: transparent; box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
        .scenario-btn.inactive { border-color: #f0f4f8; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        .scenario-btn.inactive:hover { border-color: #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }

        .var-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .var-checkbox:hover { background: #f8fafc; }

        .run-btn {
          width: 100%;
          padding: 14px;
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
        }
        .run-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(29,90,140,0.3);
        }
        .run-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

        .compare-toggle {
          width: 100%;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1.5px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .custom-checkbox {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1.5px solid #cbd5e1;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          background: white;
        }
        .custom-checkbox.checked { background: #1D5A8C; border-color: #1D5A8C; }

        .chart-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 420px;
          border-radius: 20px;
          border: 2px dashed #e2e8f0;
          background: white;
        }

        .pulse-ring { animation: pulse-ring 1.5s ease-in-out infinite; }
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        .divider { height: 1px; background: #f0f4f8; margin: 16px 0; }

        th[data-sortable]:hover { opacity: 0.85; }
      `}</style>

      <div className="min-h-screen" style={{ background: '#f8fafc' }}>

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="page-hero text-white">
          <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <div>
                <p className="section-label mb-4" style={{ color: '#F4CD53' }}>Analisis Kebijakan</p>
                <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">
                  Perbandingan<br />
                  <span style={{ color: '#2BB3B6' }}>Skenario</span>
                </h1>
                <p className="text-blue-200 text-base max-w-lg leading-relaxed">
                  Jalankan dan bandingkan hasil simulasi dari 5 skenario kebijakan pariwisata DIY (2024–2050)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── MAIN CONTENT ─────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* ── CONTROL PANEL ────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.05)', position: 'sticky', top: '88px' }}>

              <div className="px-6 py-5" style={{ borderBottom: '1px solid #f0f4f8' }}>
                <p className="section-label mb-1">Pengaturan Simulasi</p>
                <h2 className="font-display font-bold text-gray-900 text-lg">Panel Kontrol</h2>
              </div>

              <div className="p-5 space-y-5">

                {/* Scenario selector */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pilih Skenario</p>
                  <div className="space-y-2">
                    {scenariosList.map((scenario) => {
                      const isActive = activeScenario === scenario.id && !compareAll;
                      return (
                        <button
                          key={scenario.id}
                          onClick={() => { setActiveScenario(scenario.id); setCompareAll(false); }}
                          className={`scenario-btn ${isActive ? "active" : "inactive"}`}
                          style={isActive ? { background: scenario.color, color: 'white' } : { color: '#374151' }}
                        >
                          <div className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: isActive ? 'rgba(255,255,255,0.7)' : scenario.color }}></div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold leading-tight"
                              style={{ fontFamily: 'Sora, sans-serif', opacity: isActive ? 0.8 : 1, color: isActive ? 'white' : scenario.color }}>
                              {scenario.id}
                            </div>
                            <div className="text-xs font-medium leading-snug truncate" style={{ opacity: isActive ? 0.95 : 0.85 }}>
                              {scenario.label}
                            </div>
                          </div>
                          {isActive && (
                            <svg className="w-3.5 h-3.5 shrink-0 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Compare toggle */}
                <div>
                  <button
                    onClick={() => setCompareAll(!compareAll)}
                    className="compare-toggle"
                    style={compareAll
                      ? { background: '#E89D3E', borderColor: '#E89D3E', color: 'white' }
                      : { background: 'white', borderColor: '#e2e8f0', color: '#374151' }
                    }
                  >
                    <span>{compareAll ? "✓" : "⊕"}</span>
                    {compareAll ? "Bandingkan Semua Aktif" : "Bandingkan Semua Skenario"}
                  </button>
                  {compareAll && (
                    <p className="text-[11px] text-gray-400 mt-2 text-center">
                      5 skenario akan dijalankan secara bersamaan
                    </p>
                  )}
                </div>

                <div className="divider"></div>

                {/* Variable selector */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Variabel Output
                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-white text-[10px]"
                      style={{ background: '#1D5A8C', fontFamily: 'Sora, sans-serif' }}>
                      {selectedVariables.length}
                    </span>
                  </p>
                  <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
                    {outputVariables.map((variable) => {
                      const isChecked = selectedVariables.includes(variable.id);
                      return (
                        <label key={variable.id} className="var-checkbox">
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
                          <span className="text-xs text-gray-700 leading-tight">{variable.label}</span>
                          <span className="ml-auto text-[10px] text-gray-400">{variable.unit}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="divider"></div>

                {/* Run button */}
                <button
                  onClick={runSimulation}
                  disabled={isLoading || selectedVariables.length === 0}
                  className="run-btn"
                  style={{ background: 'linear-gradient(135deg, #1D5A8C, #2BB3B6)', color: 'white', boxShadow: '0 4px 16px rgba(29,90,140,0.25)' }}
                >
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

                {selectedVariables.length === 0 && (
                  <p className="text-[11px] text-center" style={{ color: '#E89D3E' }}>
                    ⚠ Pilih minimal 1 variabel output
                  </p>
                )}
              </div>
            </div>

            {/* ── CHART AREA ───────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4">

              {/* Active scenario info bar */}
              {!compareAll && activeScenarioObj && (
                <div className="bg-white rounded-2xl px-5 py-4 border flex items-center gap-4"
                  style={{ borderColor: activeScenarioObj.color + '40', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-display text-xs font-bold" style={{ color: activeScenarioObj.color }}>{activeScenarioObj.id}</span>
                      <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                      <span className="font-semibold text-gray-900 text-sm">{activeScenarioObj.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed truncate">{activeScenarioObj.description}</p>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: activeScenarioObj.color }}></div>
                </div>
              )}

              {compareAll && (
                <div className="bg-white rounded-2xl px-5 py-4 border border-gray-100 flex items-center gap-4"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div className="flex gap-1.5">
                    {scenariosList.map(s => (
                      <div key={s.id} className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }}></div>
                    ))}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">Mode Perbandingan</span>
                    <p className="text-xs text-gray-400 mt-0.5">Semua 5 skenario akan dibandingkan dalam satu grafik</p>
                  </div>
                </div>
              )}

              {/* Chart or placeholder */}
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
                      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="section-label mb-0.5">Hasil Simulasi</p>
                          <h3 className="font-display font-bold text-gray-900 text-sm">
                            {compareAll ? 'Perbandingan 5 Skenario - Semua Variabel' : 'Perbandingan Variabel - ' + activeScenarioObj?.label}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          <span className="text-xs text-gray-400">Data tersedia</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <LineChart
                          years={chartData.years}
                          data={chartData.data}
                          title={compareAll ? 'Perbandingan 5 Skenario - Semua Variabel' : 'Perbandingan Variabel'}
                          yAxisLabel="Nilai"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {individualChartsData?.map((chartItem) => (
                        <div key={chartItem.varId} className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                              <p className="section-label mb-0.5" style={{ color: '#1D5A8C' }}>{chartItem.variable?.label}</p>
                              <h3 className="font-display font-bold text-gray-900 text-sm">
                                {compareAll ? 'Perbandingan 5 Skenario' : activeScenarioObj?.label}
                              </h3>
                            </div>
                            <div className="flex items-center gap-1.5">
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
                  <div className="pulse-ring w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-5"
                    style={{ background: '#eff6ff', border: '2px solid #bfdbfe' }}>
                    📊
                  </div>
                  <h3 className="font-display font-bold text-gray-700 text-lg mb-2">
                    {isLoading ? "Menjalankan simulasi…" : "Belum ada data"}
                  </h3>
                  <p className="text-sm text-gray-400 text-center max-w-xs leading-relaxed">
                    {isLoading
                      ? "Mohon tunggu, model sedang diproses"
                      : "Pilih skenario dan variabel output, lalu klik Jalankan Simulasi"
                    }
                  </p>
                  {isLoading && (
                    <div className="mt-5 flex gap-1.5">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full"
                          style={{ background: '#2BB3B6', animation: `pulse-ring 1.2s ease-in-out ${i * 0.2}s infinite` }}></div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── DATA TABLE ───────────────────────────────── */}
              {simulationData && selectedVariables.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>

                  {(() => {
                    const scenarioCount = Object.keys(simulationData).length;
                    const isSingleScenario = scenarioCount === 1;
                    const years = (Object.values(simulationData)[0] as any)?.years || [];
                    const [, singleScenarioData] = Object.entries(simulationData)[0] as any;

                    if (isSingleScenario) {
                      // ── SINGLE SCENARIO TABLE ──
                      const sortedRows = getSortedRows(
                        years,
                        singleScenarioData,
                        sortConfig?.key || null,
                        sortConfig?.dir || 'asc'
                      );

                      return (
                        <>
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
                                const rows2 = years.map((yr: number, i: number) =>
                                  [yr, ...selectedVariables.map((id: string) => singleScenarioData?.[id]?.[i] ?? "")].join(",")
                                );
                                const csv = [header, ...rows2].join("\n");
                                const blob = new Blob([csv], { type: "text/csv" });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a"); a.href = url; a.download = "skenario.csv"; a.click();
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
                                {sortedRows.map(({ year, idx: yearIdx }: { year: number; idx: number }) => (
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
                                      const value = singleScenarioData?.[varId]?.[yearIdx];
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
                        </>
                      );

                    } else {
                      // ── MULTIPLE SCENARIOS TABLE with variable navigation ──
                      const currentIdx = selectedVariables.indexOf(activeTableVariable);
                      const currentVar = outputVariables.find((v) => v.id === activeTableVariable);
                      const prevVar = currentIdx > 0
                        ? outputVariables.find((v) => v.id === selectedVariables[currentIdx - 1])
                        : null;
                      const nextVar = currentIdx < selectedVariables.length - 1
                        ? outputVariables.find((v) => v.id === selectedVariables[currentIdx + 1])
                        : null;

                      const sortedRows = getSortedRowsMulti(
                        years,
                        simulationData,
                        activeTableVariable,
                        sortConfig?.key || null,
                        sortConfig?.dir || 'asc'
                      );

                      return (
                        <>
                          {/* Navigation header */}
                          <div className="px-6 py-4" style={{ borderBottom: '1px solid #f0f4f8' }}>
                            <div className="flex items-center justify-between mb-3">
                              <p className="section-label">Tabel Data</p>
                              <button
                                onClick={() => {
                                  const header = ["Tahun", ...Object.keys(simulationData)].join(",");
                                  const rows2 = years.map((yr: number, i: number) =>
                                    [yr, ...Object.entries(simulationData).map(([, sd]: any) => sd?.[activeTableVariable]?.[i] ?? "")].join(",")
                                  );
                                  const csv = [header, ...rows2].join("\n");
                                  const blob = new Blob([csv], { type: "text/csv" });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement("a"); a.href = url; a.download = "skenario-komparasi.csv"; a.click();
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

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {/* ← Prev */}
                              <button
                                onClick={() => prevVar && setActiveTableVariable(selectedVariables[currentIdx - 1])}
                                disabled={!prevVar}
                                style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  width: 32, height: 32, borderRadius: 8,
                                  border: 'none', background: '#1D5A8C',
                                  fontSize: 16, color: 'white', cursor: 'pointer',
                                  opacity: prevVar ? 1 : 0.25, transition: 'background 0.12s',
                                  flexShrink: 0,
                                }}
                              >
                                ‹
                              </button>

                              {/* Center */}
                              <div style={{ flex: 1, textAlign: 'center' }}>
                                <div className="font-display font-bold text-gray-900" style={{ fontSize: 15 }}>
                                  {currentVar?.label}
                                </div>
                                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                                  ({currentVar?.unit}) · {currentIdx + 1} dari {selectedVariables.length}
                                </div>
                                <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 6 }}>
                                  {selectedVariables.map((id, i) => (
                                    <button
                                      key={i}
                                      onClick={() => { setActiveTableVariable(selectedVariables[i]); setSortConfig(null); }}
                                      style={{
                                        height: 3, width: i === currentIdx ? 16 : 6,
                                        borderRadius: 99, border: 'none', padding: 0, cursor: 'pointer',
                                        background: i === currentIdx ? '#1D5A8C' : '#e2e8f0',
                                        transition: 'width 0.18s ease, background 0.18s ease',
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* → Next */}
                              <button
                                onClick={() => nextVar && setActiveTableVariable(selectedVariables[currentIdx + 1])}
                                disabled={!nextVar}
                                style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  width: 32, height: 32, borderRadius: 8,
                                  border: 'none', background: '#1D5A8C',
                                  fontSize: 16, color: 'white', cursor: 'pointer',
                                  opacity: nextVar ? 1 : 0.25, transition: 'background 0.12s',
                                  flexShrink: 0,
                                }}
                              >
                                ›
                              </button>
                            </div>
                          </div>

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
                                  {Object.keys(simulationData).map((scenarioName) => (
                                    <th
                                      key={scenarioName}
                                      data-sortable
                                      onClick={() => handleSort(scenarioName)}
                                      style={{ padding: '10px 16px', textAlign: 'right', whiteSpace: 'nowrap', background: '#1D5A8C', cursor: 'pointer', userSelect: 'none' }}
                                    >
                                      <div style={{ fontSize: 11, fontWeight: 600, color: 'white' }}>
                                        {scenarioName} <SortIcon colKey={scenarioName} />
                                      </div>
                                      <div style={{ fontSize: 10, fontWeight: 400, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>{currentVar?.unit}</div>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {sortedRows.map(({ year, idx: yearIdx }: { year: number; idx: number }) => (
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
                                    {Object.entries(simulationData).map(([scenarioName, scenarioData]: any) => {
                                      const value = scenarioData?.[activeTableVariable]?.[yearIdx];
                                      const displayValue = typeof value === 'number'
                                        ? currentVar?.unit === '%'
                                          ? (value * 100).toFixed(1) + '%'
                                          : value.toLocaleString('id-ID', { maximumFractionDigits: 2 })
                                        : '-';
                                      return (
                                        <td key={scenarioName} style={{ padding: '9px 16px', textAlign: 'right', color: '#475569', fontWeight: 400, whiteSpace: 'nowrap' }}>
                                          {displayValue}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      );
                    }
                  })()}
                </div>
              )}

              {/* Parameter preview */}
              {!compareAll && activeScenarioObj && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div className="px-6 py-4 border-b border-gray-100">
                    <p className="section-label mb-0.5">Detail Skenario</p>
                    <h3 className="font-display font-bold text-gray-900 text-sm">Parameter {activeScenarioObj.label}</h3>
                  </div>
                  <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(activeScenarioObj.params).map(([key, val]) => (
                      <div key={key} className="p-3 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #f0f4f8' }}>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 leading-tight">
                          {key.replace(/_/g, " ")}
                        </div>
                        <div className="font-display font-bold text-sm" style={{ color: activeScenarioObj.color }}>
                          {typeof val === 'number' && val > 1e5
                            ? (val / 1e6).toFixed(1) + "M"
                            : typeof val === 'number' && val < 1
                            ? (val * 100).toFixed(1) + "%"
                            : val.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}