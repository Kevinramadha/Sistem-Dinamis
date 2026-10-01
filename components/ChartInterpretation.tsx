import type { Interpretation } from "@/lib/interpretation";

// Menampilkan teks bertanda **...** sebagai huruf tebal.
function RichText({ text }: { text: string }) {
  const parts = text.split("**");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-gray-900">{part}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function ChartInterpretation({ interpretation }: { interpretation: Interpretation }) {
  if (interpretation.points.length === 0 && !interpretation.context) return null;
  return (
    <div className="mx-4 sm:mx-6 mb-6 rounded-xl px-4 sm:px-5 py-4" style={{ background: "#f6f9fc", borderLeft: "3px solid #2BB3B6" }}>
      <p className="section-label mb-2" style={{ color: "#1D5A8C" }}>Interpretasi</p>
      <ul className="space-y-1.5 text-sm text-gray-600 leading-relaxed list-disc pl-4">
        {interpretation.points.map((p, i) => (
          <li key={i}><RichText text={p} /></li>
        ))}
      </ul>
      {interpretation.context && (
        <p className="mt-3 pt-3 text-xs text-gray-500 leading-relaxed" style={{ borderTop: "1px solid #e5edf5" }}>
          <span className="font-semibold text-gray-600">Makna indikator: </span>
          {interpretation.context}
        </p>
      )}
    </div>
  );
}

export function InterpretationNote({ compare = false }: { compare?: boolean }) {
  return (
    <p className="text-xs text-gray-400 leading-relaxed px-1">
      Interpretasi disusun otomatis dari hasil simulasi. Angka simulasi bukan ramalan, melainkan dasar
      perbandingan antarskenario dengan Business-as-Usual sebagai acuan.
      {compare && " Keunggulan skenario dinyatakan per dimensi; tidak ada skor gabungan antarindikator."}
    </p>
  );
}
