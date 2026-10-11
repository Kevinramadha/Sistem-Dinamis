"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Garis progres tipis di bagian atas layar saat pengguna mengklik tautan ke
 * halaman lain, agar terlihat bahwa klik sedang diproses (berguna saat
 * koneksi lambat). Garis hilang begitu alamat halaman berganti.
 */
export default function RouteProgress() {
  const pathname = usePathname();
  // Halaman asal saat navigasi dimulai; garis tampil selama masih di halaman itu.
  const [pendingFrom, setPendingFrom] = useState<string | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || !a.href) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      setPendingFrom(window.location.pathname);
    };
    const clear = () => setPendingFrom(null);
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", clear);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", clear);
    };
  }, []);

  const active = pendingFrom !== null && pendingFrom === pathname;

  return (
    <div aria-hidden="true" className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none">
      {active && (
        <div
          className="h-full"
          style={{
            background: "linear-gradient(90deg, #2BB3B6, #E89D3E)",
            animation: "route-progress 8s cubic-bezier(.1,.7,.2,1) forwards",
            animationDelay: "120ms",
            width: 0,
          }}
        />
      )}
      <style>{`@keyframes route-progress { 0% { width: 0; } 10% { width: 35%; } 100% { width: 92%; } }`}</style>
    </div>
  );
}
