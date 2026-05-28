"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { scenariosList } from "@/lib/scenarios";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-sm">
      Memuat peta…
    </div>
  ),
});

const modelElements = [
  { 
    title: "Stock", 
    desc: "Stock adalah variabel yang merepresentasikan akumulasi atau jumlah suatu kondisi dalam sistem pada waktu tertentu, yang nilainya berubah seiring waktu akibat adanya aliran (flow).",
    color: "#1D5A8C" 
  },
  { 
    title: "Flow", 
    desc: "Flow adalah variabel yang merepresentasikan laju perubahan suatu stock per satuan waktu, baik berupa aliran masuk (inflow) maupun aliran keluar (outflow).",
    color: "#2BB3B6" 
  },
  { 
    title: "Auxiliary", 
    desc: "Auxiliary variable adalah variabel yang digunakan untuk mendukung perhitungan dalam model, terutama dalam menentukan nilai flow atau hubungan antar variabel, tetapi tidak memiliki sifat akumulasi.",
    color: "#3A9C77" 
  },
  { 
    title: "Parameter", 
    desc: "Parameter adalah nilai atau konstanta dalam model yang ditetapkan terlebih dahulu (fixed) dan digunakan sebagai input dalam perhitungan variabel lain, serta tidak berubah selama simulasi (kecuali dimodifikasi dalam skenario).",
    color: "#E89D3E" 
  },
];

const sectors = [
  { icon: "🏨", label: "Pariwisata", sub: "Wisatawan & Akomodasi" },
  { icon: "🌱", label: "Demografis", sub: "Populasi & Migrasi" },
  { icon: "💧", label: "Lingkungan", sub: "Air & Kualitas" },
  { icon: "🏭", label: "Ekonomi", sub: "Lapangan Kerja" },
];

export default function Home() {
  const [hoveredScenario, setHoveredScenario] = useState<string | null>(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Sora', sans-serif; }

        .hero-bg {
          background: linear-gradient(135deg, #0d3554 0%, #1D5A8C 45%, #1a7a7c 100%);
          position: relative;
          overflow: hidden;
        }
        .hero-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 20% 50%, rgba(43,179,182,0.18) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(244,205,83,0.10) 0%, transparent 40%);
        }
        .hero-bg::after {
          content: '';
          position: absolute;
          right: -80px;
          top: -80px;
          width: 380px;
          height: 380px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.06);
        }

        .grid-dot-bg {
          background-image: radial-gradient(circle, #cbd5e1 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .card-hover {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(29,90,140,0.10);
        }

        .scenario-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .scenario-card:hover {
          transform: translateY(-3px);
        }

        .tag-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .section-label {
          font-family: 'Sora', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #2BB3B6;
        }

        .divider-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #E89D3E;
          display: inline-block;
          margin: 0 8px;
          vertical-align: middle;
        }

        .stat-number {
          font-family: 'Sora', sans-serif;
          font-size: 2.8rem;
          font-weight: 800;
          line-height: 1;
          background: linear-gradient(135deg, #1D5A8C, #2BB3B6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <div className="min-h-screen bg-white">

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="hero-bg text-white">
          <div className="relative z-10 max-w-6xl mx-auto px-6 py-28">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-6">
                <span className="tag-pill" style={{ background: 'rgba(244,205,83,0.15)', color: '#F4CD53', border: '1px solid rgba(244,205,83,0.3)' }}>
                  🎓 Penelitian Sistem Dinamis
                </span>
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-5">
                Simulasi<br />
                <span style={{ color: '#F4CD53' }}>Pariwisata</span>{" "}
                <span style={{ color: '#2BB3B6' }}>Berkelanjutan</span>
              </h1>
              <p className="text-lg text-blue-100 leading-relaxed mb-10 max-w-xl">
                Model sistem dinamis untuk memproyeksikan dampak kebijakan pariwisata di Daerah Istimewa Yogyakarta hingga tahun 2050.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link
                  href="/model"
                  className="font-display px-7 py-3.5 rounded-xl font-semibold text-sm transition-all"
                  style={{ background: '#F4CD53', color: '#0d3554', boxShadow: '0 4px 20px rgba(244,205,83,0.35)' }}
                >
                  Lihat Model →
                </Link>
                <Link
                  href="/simulasi"
                  className="font-display px-7 py-3.5 rounded-xl font-semibold text-sm border transition-all"
                  style={{ borderColor: 'rgba(255,255,255,0.25)', color: 'white', background: 'rgba(255,255,255,0.08)' }}
                >
                  Mulai Simulasi
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── MODEL ELEMENTS ────────────────────────────────── */}
        <section className="py-24 max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Arsitektur Model</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">Elemen Model Sistem Dinamis</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {modelElements.map((el, i) => (
              <div key={i} className="card-hover bg-white rounded-2xl p-6 border border-gray-100" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ background: el.color + '18' }}>
                  <div className="w-4 h-4 rounded-md" style={{ background: el.color }}></div>
                </div>
                <div className="font-semibold text-gray-900 text-lg mb-3" style={{ color: el.color }}>{el.title}</div>
                <div className="text-sm text-gray-600 leading-relaxed">{el.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SCENARIOS ─────────────────────────────────────── */}
        <section className="py-24" style={{ background: '#f8fafc' }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="section-label mb-3">Analisis Kebijakan</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">5 Skenario Kebijakan</h2>
              <p className="text-gray-500 mt-3 max-w-lg mx-auto text-sm leading-relaxed">Hover pada kartu untuk melihat deskripsi skenario kebijakan yang tersedia</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {scenariosList.map((scenario, i) => (
                <div
                  key={scenario.id}
                  onMouseEnter={() => setHoveredScenario(scenario.id)}
                  onMouseLeave={() => setHoveredScenario(null)}
                  className="scenario-card bg-white rounded-2xl overflow-hidden border border-gray-100"
                  style={{
                    boxShadow: hoveredScenario === scenario.id ? `0 16px 40px ${scenario.color}22` : '0 2px 12px rgba(0,0,0,0.04)',
                    borderColor: hoveredScenario === scenario.id ? scenario.color + '55' : '#f1f5f9',
                  }}
                >
                  <div className="h-1.5 w-full" style={{ background: scenario.color }}></div>
                  <div className="p-5">
                    <div className="font-display text-xs font-bold mb-1" style={{ color: scenario.color }}>
                      {scenario.id}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2">{scenario.label}</h3>
                    <div
                      className="overflow-hidden transition-all duration-300 text-xs text-gray-500 leading-relaxed"
                      style={{ maxHeight: hoveredScenario === scenario.id ? '100px' : '0', opacity: hoveredScenario === scenario.id ? 1 : 0 }}
                    >
                      {scenario.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/skenario"
                className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                style={{ color: '#1D5A8C' }}
              >
                Lihat semua skenario →
              </Link>
            </div>
          </div>
        </section>

        {/* ── SECTOR + RESEARCH INFO ────────────────────────── */}
        <section className="py-24 max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Sectors */}
            <div>
              <p className="section-label mb-3">Cakupan Model</p>
              <h2 className="font-display text-3xl font-bold text-gray-900 mb-8">Sektor yang Dimodelkan</h2>
              <div className="space-y-4">
                {sectors.map((s, i) => (
                  <div key={i} className="card-hover flex items-center gap-5 p-5 rounded-2xl bg-white border border-gray-100"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: ['#1D5A8C', '#2BB3B6', '#3A9C77', '#E89D3E'][i] + '15' }}>
                      {s.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{s.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
                    </div>
                    <div className="ml-auto w-2 h-2 rounded-full shrink-0"
                      style={{ background: ['#1D5A8C', '#2BB3B6', '#3A9C77', '#E89D3E'][i] }}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Research info */}
            <div>
              <p className="section-label mb-3">Informasi Penelitian</p>
              <h2 className="font-display text-3xl font-bold text-gray-900 mb-8">Detail Studi</h2>
              <div className="space-y-5">
                {[
                  { label: "Lokasi Penelitian", value: "Daerah Istimewa Yogyakarta", icon: "📍" },
                  { label: "Peneliti", value: "Kevin Atha Fathoni Ramadha", icon: "👤" },
                  { label: "Periode Simulasi", value: "2024 – 2050 (27 Tahun)", icon: "📅" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 rounded-2xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <span className="text-xl mt-0.5">{item.icon}</span>
                    <div>
                      <div className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">{item.label}</div>
                      <div className="font-semibold text-gray-800">{item.value}</div>
                    </div>
                  </div>
                ))}

                <div className="mt-6 p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, #1D5A8C, #2BB3B6)', boxShadow: '0 8px 32px rgba(29,90,140,0.2)' }}>
                  <p className="text-white text-sm leading-relaxed opacity-90">
                    Model sistem dinamis ini dirancang untuk mendukung pengambilan keputusan berbasis data dalam pengelolaan pariwisata berkelanjutan di DIY.
                  </p>
                  <Link href="/model" className="inline-flex items-center gap-1 mt-3 text-sm font-semibold" style={{ color: '#F4CD53' }}>
                    Pelajari metodologi →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MAP SECTION ───────────────────────────────────── */}
        <section className="py-24 grid-dot-bg" style={{ background: '#f8fafc' }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-10">
              <p className="section-label mb-3">Lokasi Studi</p>
              <h2 className="font-display text-3xl font-bold text-gray-900">Daerah Istimewa Yogyakarta</h2>
            </div>
            <div className="rounded-2xl overflow-hidden border border-gray-200" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
              <MapComponent />
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ────────────────────────────────────── */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="section-label mb-4">Mulai Eksplorasi</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Siap menjalankan simulasi?
            </h2>
            <p className="text-gray-500 mb-10 leading-relaxed max-w-md mx-auto">
              Pilih skenario kebijakan dan lihat bagaimana proyeksi sistem pariwisata DIY berubah dari tahun ke tahun.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/simulasi"
                className="font-display px-8 py-4 rounded-xl font-bold text-sm transition-all"
                style={{ background: '#1D5A8C', color: 'white', boxShadow: '0 6px 24px rgba(29,90,140,0.25)' }}
              >
                Mulai Simulasi →
              </Link>
              <Link
                href="/skenario"
                className="font-display px-8 py-4 rounded-xl font-bold text-sm border transition-all"
                style={{ borderColor: '#e2e8f0', color: '#1D5A8C' }}
              >
                Jelajahi Skenario
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
