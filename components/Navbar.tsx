"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/model", label: "Model" },
  { href: "/skenario", label: "Skenario" },
  { href: "/simulasi", label: "Simulasi" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

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
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname === link.href ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Link href="/simulasi" className="nav-cta hidden md:inline-flex">
              Mulai Simulasi →
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
              <Link
                href="/simulasi"
                onClick={() => setIsOpen(false)}
                className="mt-2 text-center py-3 rounded-xl text-sm font-semibold"
                style={{ background: '#1D5A8C', color: 'white', fontFamily: 'Sora, sans-serif' }}
              >
                Mulai Simulasi →
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
