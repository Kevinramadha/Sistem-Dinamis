"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBaseData } from "./BaseDataProvider";

// Penanda data dasar yang sedang dipakai simulasi; hanya di halaman yang menjalankan simulasi.
const SHOW_ON = ["/skenario", "/simulasi"];
export default function BaseDataBanner() {
  const { baseYear, isCustom, ready } = useBaseData();
  const pathname = usePathname();
  if (!SHOW_ON.includes(pathname)) return null;

  return (
    <div
      className="w-full text-xs"
      style={{
        background: isCustom ? "#fff8eb" : "#f1f6fb",
        borderBottom: `1px solid ${isCustom ? "#fde3b0" : "#e2ebf4"}`,
        color: isCustom ? "#8a5300" : "#475569",
      }}
      role="status"
      aria-live="polite"
    >
      <div className="max-w-6xl mx-auto px-6 py-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <span style={{ visibility: ready ? "visible" : "hidden" }}>
          <span className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle" style={{ background: isCustom ? "#E89D3E" : "#1D5A8C" }} />
          Data dasar: <strong>{isCustom ? `tahun ${baseYear} (pembaruan pengguna)` : `${baseYear} (data penelitian)`}</strong>
          {" · "}simulasi {baseYear}–2050
        </span>
        <Link href="/pembaruan-data" className="font-semibold underline-offset-2 hover:underline" style={{ color: isCustom ? "#8a5300" : "#1D5A8C" }}>
          {isCustom ? "Kelola data dasar →" : "Perbarui data tahunan →"}
        </Link>
      </div>
    </div>
  );
}
