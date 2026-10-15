"use client";

import { IDENTITAS } from "@/lib/identitas";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/model", label: "Model" },
  { href: "/skenario", label: "Skenario" },
  { href: "/simulasi", label: "Simulasi" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500&display=swap');
      `}</style>

      <footer style={{ background: '#0d1f33', color: 'white' }}>

        {/* Top gradient strip */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #1D5A8C, #2BB3B6, #3A9C77, #E89D3E, #F4CD53)' }}></div>

        <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">

            {/* Brand column */}
            <div className="md:col-span-5">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="relative w-9 h-9 shrink-0">
                  <div className="absolute inset-0 rounded-xl" style={{ background: '#2BB3B6' }}></div>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-md" style={{ background: '#E89D3E' }}></div>
                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>S</span>
                </div>
                <span className="text-lg font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'white' }}>SimDIY</span>
              </div>
              <p className="text-sm leading-relaxed mb-6" style={{ color: '#8ba7c0', fontFamily: 'DM Sans, sans-serif', maxWidth: '280px' }}>
                Simulasi Sistem Dinamis untuk mendukung kebijakan pariwisata berkelanjutan di Daerah Istimewa Yogyakarta.
              </p>
              <div className="flex gap-2">
                {[
                  { label: "Model", color: '#1D5A8C', text: '#7FB2E0' },
                  { label: "Simulasi", color: '#2BB3B6', text: '#5FD0D2' },
                  { label: "2025-2050", color: '#3A9C77', text: '#6FCFA8' },
                ].map((tag, i) => (
                  <span key={i} className="text-xs px-3 py-1 rounded-full font-medium shrink-0" style={{ background: tag.color + '25', color: tag.text, border: `1px solid ${tag.color}40`, fontFamily: 'DM Sans, sans-serif' }}>
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Spacer */}
            <div className="md:col-span-1 hidden md:block"></div>

            {/* Info column */}
            <div className="md:col-span-3">
              <h3 className="text-xs font-semibold mb-5 uppercase tracking-widest" style={{ color: '#F4CD53', fontFamily: 'Sora, sans-serif' }}>
                Penelitian
              </h3>
              <div className="space-y-3">
                {[
                  { key: "Lokasi", val: "DIY, Indonesia" },
                  { key: "Periode", val: "2025 – 2050" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    <span className="text-xs w-16 shrink-0" style={{ color: '#7d9bb5' }}>{item.key}</span>
                    <span className="text-xs" style={{ color: '#b8cfe0' }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nav column */}
            <div className="md:col-span-3">
              <h3 className="text-xs font-semibold mb-5 uppercase tracking-widest" style={{ color: '#F4CD53', fontFamily: 'Sora, sans-serif' }}>
                Navigasi
              </h3>
              <ul className="space-y-2.5">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors"
                      style={{ color: '#8ba7c0', fontFamily: 'DM Sans, sans-serif', textDecoration: 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#2BB3B6')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#8ba7c0')}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Identitas skripsi */}
          <section
            aria-labelledby="profil-peneliti"
            className="rounded-2xl p-6 mb-10"
            style={{ background: '#112a43', border: '1px solid #1e3a52' }}
          >
            <h3 id="profil-peneliti" className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: '#F4CD53', fontFamily: 'Sora, sans-serif' }}>
              Profil
            </h3>
            <p className="text-sm font-semibold leading-relaxed mb-5" style={{ color: '#e6eef6', fontFamily: 'Sora, sans-serif' }}>
              {IDENTITAS.judul}
            </p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {[
                { key: "Nama", val: IDENTITAS.nama },
                { key: "NIM", val: IDENTITAS.nim },
                { key: "Tahun Lulus", val: IDENTITAS.tahunLulus },
                { key: "Program Studi", val: `${IDENTITAS.programStudi}, ${IDENTITAS.institusi}` },
                { key: "Dosen Pembimbing", val: IDENTITAS.dosenPembimbing },
              ].map((item) => (
                <div key={item.key}>
                  <dt className="text-xs" style={{ color: '#7d9bb5' }}>{item.key}</dt>
                  <dd className="text-sm mt-0.5" style={{ color: '#d3e1ee', margin: 0 }}>{item.val}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 gap-4" style={{ borderTop: '1px solid #1e3a52' }}>
            <p className="text-xs" style={{ color: '#7d9bb5', fontFamily: 'DM Sans, sans-serif' }}>
              © {currentYear} SimDIY — Simulasi Sistem Dinamis DIY. Semua hak dilindungi.
            </p>
            <div className="flex items-center gap-1.5">
              {['#1D5A8C', '#2BB3B6', '#3A9C77', '#E89D3E', '#F4CD53'].map((c, i) => (
                <div key={i} className="w-2 h-2 rounded-full" style={{ background: c, opacity: 0.7 }}></div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}