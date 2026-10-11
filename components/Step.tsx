/**
 * Satu langkah bernomor di dalam kartu: lingkaran nomor dengan garis
 * penghubung ke langkah berikutnya, judul, catatan satu baris, dan isi.
 */
export default function Step({
  n,
  title,
  note,
  aside,
  last = false,
  children,
}: {
  n: number;
  title: string;
  note?: React.ReactNode;
  /** Elemen di kanan judul, mis. pilihan tab. */
  aside?: React.ReactNode;
  last?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative flex gap-4 px-5 sm:px-6 pt-5" style={{ paddingBottom: last ? 20 : 4 }}>
      <div className="flex flex-col items-center">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ background: "#1D5A8C", fontFamily: "'Sora', sans-serif" }}
        >
          {n}
        </span>
        {!last && <span className="mt-1 w-px flex-1 bg-slate-200" aria-hidden="true" />}
      </div>
      <div className="min-w-0 flex-1 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900 leading-8" style={{ fontFamily: "'Sora', sans-serif" }}>
              {title}
            </h2>
            {note && <p className="text-sm text-gray-500 -mt-0.5">{note}</p>}
          </div>
          {aside}
        </div>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}
