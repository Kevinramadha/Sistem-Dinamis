"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/model", label: "Model" },
  { href: "/skenario", label: "Skenario" },
  { href: "/simulasi", label: "Eksplorasi Simulasi" },
];

// Fitur pendukung (bukan menu utama) dikumpulkan dalam satu menu tarik-turun.
export const toolLinks = [
  { href: "/pencarian-target", label: "Pencarian Target", desc: "Cari nilai kebijakan untuk target tertentu" },
  { href: "/pembaruan-data", label: "Pembaruan Data", desc: "Masukkan data BPS tahun terbaru" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isSimulasiPage = pathname === "/simulasi";
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
  const onToolPage = toolLinks.some((t) => t.href === pathname);
  useEffect(() => {
    if (!toolsOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!toolsRef.current?.contains(e.target as Node)) setToolsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setToolsOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [toolsOpen]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap');
        .nav-link {
          position: relative;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          color: #4a5568;
          padding: 6px 0;
          transition: color 0.2s;
          text-decoration: none;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0;
          width: 0; height: 2px;
          border-radius: 2px;
          background: #E89D3E;
          transition: width 0.25s ease;
        }
        /* Cadangkan lebar versi tebal agar menu aktif tidak menggeser menu lain */
        .nav-link::before {
          content: attr(data-label);
          font-weight: 600;
          height: 0;
          overflow: hidden;
          visibility: hidden;
        }
        .nav-link:hover { color: #1D5A8C; }
        .nav-link:hover::after { width: 100%; }
        .nav-link.active { color: #1D5A8C; font-weight: 600; }
        .nav-link.active::after { width: 100%; }
        .nav-cta {
          font-family: 'Sora', sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          padding: 9px 20px;
          border-radius: 10px;
          background: #1D5A8C;
          color: white;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .nav-cta:hover {
          background: #174b76;
          box-shadow: 0 4px 16px rgba(29,90,140,0.3);
          transform: translateY(-1px);
        }
      `}</style>

      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f0f4f8',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
      }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="relative w-8 h-8 shrink-0">
              <div className="absolute inset-0 rounded-xl" style={{ background: '#1D5A8C' }}></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-md" style={{ background: '#E89D3E' }}></div>
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs" style={{ fontFamily: 'Sora, sans-serif' }}>S</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-base" style={{ fontFamily: 'Sora, sans-serif', color: '#1D5A8C' }}>SimDIY</span>
              <span className="text-[10px] text-gray-400" style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.04em' }}>Sistem Dinamis</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname === link.href ? "active" : ""}`}
                data-label={link.label}
              >
                {link.label}
              </Link>
            ))}
            <div className="relative flex" ref={toolsRef}>
              <button
                type="button"
                onClick={() => setToolsOpen((o) => !o)}
                aria-expanded={toolsOpen}
                aria-haspopup="menu"
                className={`nav-link ${onToolPage ? "active" : ""}`}
                data-label="Alat Lanjutan ▾"
                style={{ background: "none", border: "none", cursor: "pointer", margin: 0 }}
              >
                Alat Lanjutan ▾
              </button>
              {toolsOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-3 w-72 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl"
                >
                  {toolLinks.map((t) => (
                    <Link
                      key={t.href}
                      href={t.href}
                      role="menuitem"
                      onClick={() => setToolsOpen(false)}
                      className="block rounded-xl px-3 py-2.5 hover:bg-slate-50"
                      style={{ background: pathname === t.href ? "#eff6ff" : undefined }}
                    >
                      <span className="block text-sm font-semibold" style={{ color: "#1D5A8C", fontFamily: "Sora, sans-serif" }}>
                        {t.label}
                      </span>
                      <span className="block text-xs text-gray-500">{t.desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-4">
            {/* Tetap dirender (tak terlihat) di /simulasi agar posisi menu tidak bergeser */}
            <Link
              href="/simulasi"
              className={`nav-cta hidden lg:inline-flex ${isSimulasiPage ? "invisible" : ""}`}
              aria-hidden={isSimulasiPage}
              tabIndex={isSimulasiPage ? -1 : undefined}
            >
              Mulai Eksplorasi →
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: '#1D5A8C', background: isOpen ? '#eff6ff' : 'transparent' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t" style={{ borderColor: '#f0f4f8', background: '#fafcff' }}>
            <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    color: pathname === link.href ? '#1D5A8C' : '#4a5568',
                    background: pathname === link.href ? '#eff6ff' : 'transparent',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Alat lanjutan</p>
              {toolLinks.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl transition-colors"
                  style={{ background: pathname === t.href ? '#eff6ff' : 'transparent', fontFamily: 'DM Sans, sans-serif' }}
                >
                  <span className="block text-sm font-medium" style={{ color: pathname === t.href ? '#1D5A8C' : '#4a5568' }}>{t.label}</span>
                  <span className="block text-xs text-gray-400">{t.desc}</span>
                </Link>
              ))}
              {!isSimulasiPage && (
                <Link
                  href="/simulasi"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 text-center py-3 rounded-xl text-sm font-semibold"
                  style={{ background: '#1D5A8C', color: 'white', fontFamily: 'Sora, sans-serif' }}
                >
                  Mulai Eksplorasi →
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
