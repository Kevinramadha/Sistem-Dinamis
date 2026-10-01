import type { Summary, Tone } from "@/lib/summary";

const TONE: Record<Tone, { bg: string; fg: string; dot: string }> = {
  baik: { bg: "#e8f6ef", fg: "#1f7a52", dot: "#3A9C77" },
  buruk: { bg: "#fdecec", fg: "#b42318", dot: "#e5484d" },
  campuran: { bg: "#fff4e0", fg: "#9a5b00", dot: "#E89D3E" },
  netral: { bg: "#eef2f7", fg: "#475569", dot: "#94a3b8" },
};

// Menampilkan teks bertanda **...** sebagai huruf tebal.
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) =>
        i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : <span key={i}>{part}</span>
      )}
    </>
  );
}

export default function SimulationSummary({ summary }: { summary: Summary }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
      <div className="px-5 sm:px-6 py-4" style={{ borderBottom: "1px solid #f0f4f8" }}>
        <p className="section-label mb-0.5" style={{ color: "#2BB3B6" }}>Ringkasan Hasil</p>
        <p className="text-sm text-gray-600 leading-relaxed mt-1"><RichText text={summary.headline} /></p>
      </div>

      <div className="px-5 sm:px-6 py-4 space-y-3">
        {summary.rows.map((row) => {
          const t = TONE[row.tone];
          return (
            <div key={row.label} className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4">
              <div className="sm:w-44 shrink-0 flex items-center sm:flex-col sm:items-start gap-2 sm:gap-1">
                <span className="text-sm font-semibold text-gray-900">{row.label}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: t.bg, color: t.fg }}>
                  {row.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed"><RichText text={row.text} /></p>
            </div>
          );
        })}
      </div>

      {summary.warnings.length > 0 && (
        <div className="mx-5 sm:mx-6 mb-4 rounded-xl px-4 py-3 space-y-1" style={{ background: "#fff8eb", border: "1px solid #fde3b0" }}>
          {summary.warnings.map((w, i) => (
            <p key={i} className="text-sm leading-relaxed" style={{ color: "#8a5300" }}>⚠ <RichText text={w} /></p>
          ))}
        </div>
      )}

      <div className="px-5 sm:px-6 py-3 text-sm text-gray-700 leading-relaxed" style={{ background: "#f6f9fc", borderTop: "1px solid #eef2f7" }}>
        <span className="font-semibold text-gray-900">Kesimpulan: </span>
        <RichText text={summary.conclusion} />
      </div>
    </div>
  );
}
