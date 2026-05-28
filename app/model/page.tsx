"use client";

import Image from "next/image";
import { useState } from "react";

const feedbackLoops = [
  {
    code: "B1",
    type: "Balancing",
    name: "Turis Ekspansi",
    desc: "Lebih banyak turis → lebih banyak akomodasi → daya tarik meningkat → lebih banyak turis",
    color: "#1D5A8C",
    icon: "🏨",
  },
  {
    code: "B2",
    type: "Balancing",
    name: "Water Depletion",
    desc: "Ekstraksi air meningkat → stok menurun → kualitas air menurun → ekstraksi lebih banyak",
    color: "#2BB3B6",
    icon: "💧",
  },
  {
    code: "B3",
    type: "Balancing",
    name: "Polusi Lingkungan",
    desc: "Pembangunan meningkat → limbah meningkat → kualitas menurun → dampak ekonomi",
    color: "#3A9C77",
    icon: "🌱",
  },
  {
    code: "R1",
    type: "Reinforcing",
    name: "Pertumbuhan Populasi",
    desc: "Pekerjaan pariwisata terbuka → migrasi masuk → populasi naik → demand lebih tinggi",
    color: "#E89D3E",
    icon: "👥",
  },
];

export default function ModelPage() {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');
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

        .model-hero {
          background: linear-gradient(135deg, #0d3554 0%, #1D5A8C 50%, #1a7a7c 100%);
          position: relative;
          overflow: hidden;
        }
        .model-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 75% 50%, rgba(43,179,182,0.18) 0%, transparent 55%),
            radial-gradient(circle at 15% 80%, rgba(244,205,83,0.08) 0%, transparent 40%);
        }

        .diagram-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e8f0f8;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(29,90,140,0.06);
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .diagram-card:hover {
          box-shadow: 0 12px 40px rgba(29,90,140,0.12);
          transform: translateY(-3px);
        }

        .loop-card {
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #f0f4f8;
          background: white;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          transition: all 0.25s ease;
        }
        .loop-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.08);
        }

        .tag-sm {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 500;
        }

        .zoomable-image {
          cursor: zoom-in;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .zoomable-image:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          position: relative;
          background: white;
          border-radius: 20px;
          max-width: 90vw;
          max-height: 90vh;
          overflow: auto;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        }

        .modal-close-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #1D5A8C;
          transition: all 0.2s ease;
          z-index: 51;
        }
        .modal-close-btn:hover {
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `}</style>

      <div className="min-h-screen" style={{ background: '#f8fafc' }}>

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="model-hero text-white">
          <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <div>
                <p className="section-label mb-4" style={{ color: '#F4CD53' }}>Dokumentasi Teknis</p>
                <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">
                  Struktur Model<br />
                  <span style={{ color: '#2BB3B6' }}>Sistem Dinamis</span>
                </h1>
                <p className="text-blue-200 text-base max-w-lg leading-relaxed">
                  Causal Loop Diagram (CLD) dan Stock &amp; Flow Diagram (SFD) untuk pariwisata berkelanjutan DIY
                </p>
              </div>

            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">

          {/* ── CLD & SFD ────────────────────────────────────── */}
          <section>
            <div className="mb-10">
              <p className="section-label mb-2">Diagram Model</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900">Visualisasi Struktur</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CLD */}
              <div className="diagram-card">
                <div className="px-6 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f4f8' }}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#1D5A8C' }}></div>
                      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#1D5A8C', fontFamily: 'Sora, sans-serif' }}>CLD</span>
                    </div>
                    <h3 className="font-display font-bold text-gray-900 text-lg">Causal Loop Diagram</h3>
                  </div>
                  <span className="tag-sm" style={{ background: '#eff6ff', color: '#1D5A8C', border: '1px solid #bfdbfe' }}>
                    Hubungan Kausal
                  </span>
                </div>
                <div className="p-4" style={{ background: '#f8fafc' }}>
                  <button
                    onClick={() => setExpandedImage('/CLD.png')}
                    className="w-full flex items-center justify-center rounded-xl overflow-hidden zoomable-image"
                    style={{ minHeight: '320px', background: '#f1f5f9', border: 'none', padding: 0, cursor: 'zoom-in' }}
                    title="Klik untuk memperbesar"
                  >
                    <Image
                      src="/CLD.png"
                      alt="Causal Loop Diagram"
                      width={500}
                      height={380}
                      className="max-w-full h-auto"
                    />
                  </button>
                </div>
                <div className="px-6 pb-6 pt-2">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Menunjukkan hubungan sebab-akibat dan feedback loops dalam sistem pariwisata DIY
                  </p>
                </div>
              </div>

              {/* SFD */}
              <div className="diagram-card">
                <div className="px-6 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f4f8' }}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#2BB3B6' }}></div>
                      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#2BB3B6', fontFamily: 'Sora, sans-serif' }}>SFD</span>
                    </div>
                    <h3 className="font-display font-bold text-gray-900 text-lg">Stock & Flow Diagram</h3>
                  </div>
                  <span className="tag-sm" style={{ background: '#e6fafa', color: '#2BB3B6', border: '1px solid #a5f0f0' }}>
                    DYNAMO Notation
                  </span>
                </div>
                <div className="p-4" style={{ background: '#f8fafc' }}>
                  <button
                    onClick={() => setExpandedImage('/SFD.png')}
                    className="w-full flex items-center justify-center rounded-xl overflow-hidden zoomable-image"
                    style={{ minHeight: '320px', background: '#f1f5f9', border: 'none', padding: 0, cursor: 'zoom-in' }}
                    title="Klik untuk memperbesar"
                  >
                    <Image
                      src="/SFD.png"
                      alt="Stock & Flow Diagram"
                      width={500}
                      height={380}
                      className="max-w-full h-auto"
                    />
                  </button>
                </div>
                <div className="px-6 pb-6 pt-2">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Menampilkan detail stocks, flows, dan auxiliaries dalam bentuk DYNAMO notation
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── FEEDBACK LOOPS ───────────────────────────────── */}
          <section>
            <div className="mb-10">
              <p className="section-label mb-2">Dinamika Sistem</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900">Feedback Loops</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbackLoops.map((loop, i) => (
                <div key={i} className="loop-card">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: loop.color + '15' }}>
                      {loop.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-display font-bold text-sm" style={{ color: loop.color }}>{loop.code}</span>
                        <span className="tag-sm text-[10px]"
                          style={{
                            background: loop.color + '12',
                            color: loop.color,
                            border: `1px solid ${loop.color}30`,
                          }}>
                          {loop.type}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-2">{loop.name}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{loop.desc}</p>
                    </div>
                  </div>
                  {/* flow line */}
                  <div className="mt-4 h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, ${loop.color}40, transparent)` }}></div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Image zoom modal */}
        {expandedImage && (
          <div className="modal-overlay" onClick={() => setExpandedImage(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close-btn"
                onClick={() => setExpandedImage(null)}
                aria-label="Close"
              >
                ✕
              </button>
              <Image
                src={expandedImage}
                alt="Diagram"
                width={1200}
                height={900}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}