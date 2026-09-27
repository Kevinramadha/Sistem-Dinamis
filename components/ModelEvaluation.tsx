"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import * as ev from "@/lib/evaluationData";

const LineChart = dynamic(() => import("@/components/LineChart"), { ssr: false });

function fmt(n: number, d = 2): string {
  return n.toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtSigned(n: number, d = 2): string {
  return (n > 0 ? "+" : "") + fmt(n, d);
}
function fmtPct(n: number, d = 2): string {
  return fmtSigned(n, d) + "%";
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Kekal: { bg: "#dcfce7", color: "#15803d" },
  Lolos: { bg: "#dcfce7", color: "#15803d" },
  LOLOS: { bg: "#dcfce7", color: "#15803d" },
  Baik: { bg: "#dcfce7", color: "#15803d" },
  "Tidak lolos": { bg: "#fee2e2", color: "#b91c1c" },
  Kurang: { bg: "#fee2e2", color: "#b91c1c" },
  Dilanggar: { bg: "#fee2e2", color: "#b91c1c" },
  Cukup: { bg: "#fef3c7", color: "#b45309" },
  "Lolos dengan Catatan": { bg: "#fef3c7", color: "#b45309" },
  "LOLOS DENGAN CATATAN": { bg: "#fef3c7", color: "#b45309" },
  "Tidak ditafsirkan": { bg: "#f1f5f9", color: "#64748b" },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? { bg: "#f1f5f9", color: "#475569" };
  return (
    <span
      className="tag-sm"
      style={{ background: c.bg, color: c.color, fontWeight: 600, whiteSpace: "nowrap" }}
    >
      {status}
    </span>
  );
}

interface Column<T> {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  render?: (row: T) => React.ReactNode;
}

function DataTable<T extends Record<string, any>>({
  columns,
  rows,
  highlightRow,
}: {
  columns: Column<T>[];
  rows: T[];
  highlightRow?: (row: T) => boolean;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  padding: "8px 12px",
                  textAlign: c.align || "left",
                  background: "#1D5A8C",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const flagged = highlightRow?.(r);
            return (
              <tr
                key={i}
                style={{
                  borderTop: "1px solid #f0f4f8",
                  background: flagged ? "#fef9e7" : i % 2 === 0 ? "white" : "#f8fafc",
                }}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    style={{
                      padding: "7px 12px",
                      textAlign: c.align || "left",
                      whiteSpace: "nowrap",
                      color: "#334155",
                    }}
                  >
                    {c.render ? c.render(r) : (r[c.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
    >
      <div className="px-6 py-4" style={{ borderBottom: "1px solid #f0f4f8" }}>
        <p className="section-label mb-0.5">{title}</p>
        {subtitle && <h3 className="font-display font-bold text-gray-900 text-sm">{subtitle}</h3>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ExpandButton({ open, onClick, labelOpen, labelClosed }: { open: boolean; onClick: () => void; labelOpen: string; labelClosed: string }) {
  return (
    <button
      onClick={onClick}
      className="font-display text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
      style={{ background: open ? "#1D5A8C" : "white", color: open ? "white" : "#1D5A8C", border: "1.5px solid #1D5A8C" }}
    >
      {open ? labelOpen : labelClosed}
    </button>
  );
}

const FIT_LABELS: Record<string, string> = {
  jumlah_wisatawan: "Jumlah Wisatawan",
  jumlah_hotel_dan_akomodasi: "Jumlah Hotel dan Akomodasi",
  jumlah_odtw: "Jumlah Objek Daya Tarik Wisata",
  tenaga_kerja_pariwisata: "Tenaga Kerja Pariwisata",
  lahan_terbangun: "Lahan Terbangun",
  tpk: "Tingkat Penghunian Kamar (TPK)",
  pdrb_sektor_pariwisata: "PDRB Sektor Pariwisata",
  investasi_sektor_pariwisata: "Investasi Sektor Pariwisata",
  total_malam_menginap: "Total Malam Menginap",
};

function FitChart({ label, points }: { label: string; points: ev.FitPoint[] }) {
  const years = points.map((p) => p.tahun);
  const data = {
    "Data (Aktual)": points.map((p) => p.data),
    Simulasi: points.map((p) => p.simulasi),
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <LineChart years={years} data={data} title={label} yAxisLabel="" heightPx={230} colors={["#94a3b8", "#1D5A8C"]} />
    </div>
  );
}

const statPerilakuColumns: Column<ev.StatistikPerilakuRow>[] = [
  { key: "variabel", label: "Variabel" },
  { key: "versi", label: "Versi" },
  {
    key: "tren",
    label: "Tren",
    render: (r) => (
      <span>
        {r.tren} <StatusBadge status={r.statusTren} />
      </span>
    ),
  },
  {
    key: "e1",
    label: "E1",
    align: "right",
    render: (r) => (
      <span>
        {fmt(r.e1, 3)} <StatusBadge status={r.statusE1} />
      </span>
    ),
  },
  {
    key: "e2",
    label: "E2",
    align: "right",
    render: (r) => (
      <span>
        {fmt(r.e2, 3)} <StatusBadge status={r.statusE2} />
      </span>
    ),
  },
  {
    key: "dc",
    label: "DC",
    align: "right",
    render: (r) => (
      <span>
        {fmt(r.dc, 3)} <StatusBadge status={r.kategoriDC} />
      </span>
    ),
  },
  {
    key: "u",
    label: "U1 / U2 / U3",
    align: "right",
    render: (r) => `${fmt(r.u1, 2)} / ${fmt(r.u2, 2)} / ${fmt(r.u3, 2)}`,
  },
  { key: "komponenDominan", label: "Komponen Dominan" },
  { key: "mape", label: "MAPE", align: "right", render: (r) => fmt(r.mape, 1) + "%" },
  ...([{ key: "nrmse", label: "NRMSE", align: "right" as const, render: (r: ev.StatistikPerilakuRow) => (r.nrmse !== undefined ? fmt(r.nrmse, 3) : "—") }]),
];

export default function ModelEvaluation() {
  const [versiPerilaku, setVersiPerilaku] = useState<"Dengan COVID" | "Tanpa COVID">("Dengan COVID");
  const [loopDetail, setLoopDetail] = useState(false);
  const [ekstremDetail, setEkstremDetail] = useState<string | null>(null);
  const [horizonOpen, setHorizonOpen] = useState(false);
  const [tornadoDetail, setTornadoDetail] = useState(false);

  const statPenuhFiltered = ev.statistikUjiPenuh.filter((r) => r.versi === versiPerilaku);
  const statParsialFiltered = ev.statistikUjiParsial.filter((r) => r.versi === versiPerilaku || r.versi === "Periode objektif");
  const statP5Filtered = ev.statistikP5.filter((r) => r.versi === versiPerilaku);

  return (
    <div className="space-y-16">
      {/* ── RINGKASAN ───────────────────────────────────── */}
      <section>
        <div className="mb-6">
          <p className="section-label mb-2">Empat Tahap Pengujian System Dynamics</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900">Evaluasi Model</h2>
        </div>
        <div className="rounded-2xl p-6" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
          <p className="text-sm text-gray-700 leading-relaxed">
            Model telah melalui empat tahap pengujian standar System Dynamics: uji struktural, uji perilaku, uji
            kondisi ekstrem, dan analisis sensitivitas. Hasilnya <strong>beragam menurut jenis uji</strong>: model
            lolos penuh pada uji struktural dan uji kondisi ekstrem (tidak melanggar hukum fisik atau logika
            sistem), tetapi pada uji perilaku — yang membandingkan pola simulasi dengan data historis 2015–2025 —
            tingkat kesesuaiannya bervariasi dari cukup baik hingga kurang tergantung variabel yang dilihat. Ini
            konsisten dengan sifat model kebijakan jangka panjang: tujuannya menangkap pola dan arah struktural,
            bukan meniru persis nilai historis tahun per tahun.
          </p>
          <div className="flex gap-2 flex-wrap mt-4">
            <StatusBadge status="Lolos" /> <span className="text-xs text-gray-500 mr-3">Uji Struktural</span>
            <span className="text-xs text-gray-500 mr-1">Uji Perilaku: beragam (lihat Bagian 2)</span>
            <StatusBadge status="LOLOS DENGAN CATATAN" /> <span className="text-xs text-gray-500">Uji Kondisi Ekstrem (2 dari 17)</span>
          </div>
        </div>
      </section>

      {/* ── 1. UJI STRUKTURAL ───────────────────────────── */}
      <section className="space-y-5">
        <div>
          <p className="section-label mb-2">1. Verifikasi</p>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Uji Struktural</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            <strong>Kekekalan materi</strong>: seluruh 5 stok model (Wisatawan, Hotel dan Akomodasi, ODTW, Tenaga
            Kerja Pariwisata, Lahan Terbangun) kekal sepanjang 2025–2049 — selisih akumulasi inflow-outflow
            terhadap perubahan stok = 0. Ini membuktikan model bebas dari kesalahan persamaan matematis.{" "}
            <strong>Uji loop umpan balik</strong>: ditemukan 16 loop unik (4 reinforcing, 12 balancing) yang
            seluruhnya berperilaku sesuai teori sistem dinamis — loop balancing menahan pertumbuhan (misalnya
            kepadatan wisatawan menekan daya tarik), loop reinforcing mempercepatnya (investasi → ODTW →
            wisatawan). <strong>Status: lolos penuh.</strong>
          </p>
        </div>

        <Card title="Kekekalan Materi" subtitle="Selisih akumulasi inflow-outflow terhadap perubahan stok, 2025-2049">
          <DataTable
            columns={[
              { key: "stok", label: "Stok" },
              { key: "inflow", label: "Inflow" },
              { key: "outflow", label: "Outflow" },
              { key: "stok2025", label: "Stok 2025", align: "right", render: (r) => fmt(r.stok2025, 0) },
              { key: "simulasi2026", label: "Simulasi 2026", align: "right", render: (r) => fmt(r.simulasi2026, 2) },
              { key: "selisihMaks", label: "Selisih Maks", align: "right", render: (r) => r.selisihMaks.toExponential(2) },
              { key: "selisihRelatif", label: "Selisih Relatif", align: "right", render: (r) => fmt(r.selisihRelatif, 4) },
              { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
            ]}
            rows={ev.kekekalanMateri}
          />
        </Card>

        <Card title="Uji Loop Umpan Balik" subtitle="Dampak mematikan tiap loop terhadap keluaran 2050 (BASE = seluruh loop aktif)">
          <div className="flex justify-end mb-3">
            <ExpandButton open={loopDetail} onClick={() => setLoopDetail(!loopDetail)} labelOpen="Sembunyikan detail per variabel" labelClosed="Lihat detail per variabel →" />
          </div>
          <DataTable
            columns={[
              { key: "kondisi", label: "Kondisi" },
              { key: "jwJuta", label: "JW 2050 (juta)", align: "right", render: (r) => fmt(r.jwJuta, 2) },
              { key: "hotel", label: "Hotel 2050", align: "right", render: (r) => fmt(r.hotel, 1) },
              { key: "odtw", label: "ODTW 2050", align: "right", render: (r) => fmt(r.odtw, 1) },
              { key: "tkRibu", label: "TK 2050 (ribu)", align: "right", render: (r) => fmt(r.tkRibu, 1) },
              { key: "lahanHa", label: "Lahan 2050 (ha)", align: "right", render: (r) => fmt(r.lahanHa, 1) },
              { key: "dayaTarik", label: "Daya Tarik 2050", align: "right", render: (r) => fmt(r.dayaTarik, 4) },
              { key: "selisihJwPct", label: "Selisih JW vs BASE", align: "right", render: (r) => fmtPct(r.selisihJwPct, 2) },
            ]}
            rows={ev.ujiLoopUmpanBalik}
            highlightRow={(r) => r.kondisi.includes("BASE")}
          />
          {loopDetail && (
            <div className="mt-5 space-y-4">
              <p className="text-xs text-gray-500">Ringkasan dampak loop: variabel paling terdampak dan jumlah variabel yang berubah &gt;1% saat loop tersebut dimatikan.</p>
              <DataTable
                columns={[
                  { key: "loop", label: "Loop" },
                  { key: "variabelTerdampak", label: "Variabel Paling Terdampak" },
                  { key: "selisihPct", label: "Selisih (%)", align: "right", render: (r) => fmtPct(r.selisihPct, 2) },
                  { key: "jumlahVariabelBerubah", label: "Jml Variabel Berubah >1%", align: "right" },
                ]}
                rows={ev.ringkasanDampakLoop}
              />
              <p className="text-xs text-gray-500 mt-4">Nilai 2050 penuh per variabel, untuk tiap kondisi loop:</p>
              <DataTable
                columns={[
                  { key: "kondisi", label: "Kondisi" },
                  { key: "jw", label: "Jumlah Wisatawan", align: "right", render: (r) => fmt(r.jw, 0) },
                  { key: "hotel", label: "Hotel", align: "right", render: (r) => fmt(r.hotel, 1) },
                  { key: "odtw", label: "ODTW", align: "right", render: (r) => fmt(r.odtw, 1) },
                  { key: "tk", label: "Tenaga Kerja", align: "right", render: (r) => fmt(r.tk, 1) },
                  { key: "lahan", label: "Lahan", align: "right", render: (r) => fmt(r.lahan, 1) },
                  { key: "dayaTarik", label: "Daya Tarik", align: "right", render: (r) => fmt(r.dayaTarik, 4) },
                ]}
                rows={ev.nilai2050PerLoop}
              />
            </div>
          )}
        </Card>

        <Card title="Uji Galat Integrasi" subtitle="Perbandingan hasil 2050 pada TIME STEP 1 vs 0,5 — solusi numerik stabil bila selisih kecil">
          <DataTable
            columns={[
              { key: "variabel", label: "Variabel" },
              { key: "ts1", label: "2050 (TIME STEP 1)", align: "right", render: (r) => fmt(r.ts1, 2) },
              { key: "ts05", label: "2050 (TIME STEP 0,5)", align: "right", render: (r) => fmt(r.ts05, 2) },
              { key: "selisihPct", label: "Selisih (%)", align: "right", render: (r) => fmtPct(r.selisihPct, 3) },
            ]}
            rows={ev.ujiGalatIntegrasi}
          />
          <p className="text-xs text-gray-400 mt-3">Seluruh selisih berada di bawah 1%, menunjukkan solusi numerik pada TIME STEP 1 tahun sudah stabil.</p>
        </Card>
      </section>

      {/* ── 2. UJI PERILAKU ─────────────────────────────── */}
      <section className="space-y-5">
        <div>
          <p className="section-label mb-2">2. Validasi</p>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Uji Perilaku (Validasi terhadap Data Historis)</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Diukur dengan Discrepancy Coefficient (DC — mengikuti Barlas 1989: &lt;0,4 baik, 0,4–0,7 rata-rata
            sampai baik, &gt;0,7 kurang), MAPE, dan uji beda kemiringan tren (uji-t). Hasilnya tidak seragam
            antarvariabel: <strong>PDRB Sektor Pariwisata</strong> dan <strong>ODTW</strong> — DC terendah
            (0,17–0,39, kategori Baik–Cukup), arah tren sesuai data, MAPE 5–28%, paling dipercaya modelnya.{" "}
            <strong>Wisatawan</strong> — DC 0,42–0,45 (Cukup), MAPE 12–14%, arah tren sesuai tetapi lajunya berbeda
            nyata secara statistik, sebagian karena efek pemulihan pasca-COVID di luar cakupan struktur model.{" "}
            <strong>Hotel dan Akomodasi</strong> serta <strong>Tenaga Kerja Pariwisata</strong> — DC 0,44–0,82
            (Cukup–Kurang), arah kemiringan justru <strong>berlawanan</strong> dengan data pada level model-penuh.
            Ketika diuji secara <strong>parsial</strong> (subsistem diuji sendiri dengan input historis diumpankan
            langsung), hasilnya jauh membaik: DC turun ke 0,20–0,48 (Baik–Cukup), NRMSE rendah (0,10–0,17), arah
            tren sesuai data — struktur persamaannya sendiri valid; penyimpangan pada uji model-penuh berasal dari
            akumulasi ketidaksesuaian antarsubsistem, bukan dari kesalahan satu persamaan.
          </p>
          <p className="text-xs text-gray-400 mt-3 italic">
            Catatan metodologis: NRMSE tidak dipakai sebagai metrik pelaporan utama di sini karena perannya adalah
            fungsi objektif yang diminimalkan selama proses kalibrasi, bukan metrik evaluasi akhir — sejalan dengan
            protokol yang ditetapkan (DC/E1/E2/MAPE untuk pelaporan, NRMSE untuk proses fitting). NRMSE tetap
            relevan disebut di sini karena nilainya konkret mendukung klaim validitas struktur persamaan
            per-subsistem.
          </p>
          <p className="text-sm text-gray-700 mt-3">
            <strong>Status: model menangkap pola struktural utama dengan baik pada variabel ekonomi dan daya
            tarik wisata; pada variabel akomodasi dan tenaga kerja, hasil model-penuh perlu dibaca sebagai arah
            kebijakan jangka panjang, bukan prediksi presisi tahunan.</strong>
          </p>
        </div>

        <Card title="Kesesuaian Model — Data vs Simulasi" subtitle="Uji perilaku model penuh, 2019-2025 (Dengan COVID) / 2021-2025 (Tanpa COVID)">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {Object.entries(ev.fitSeriesPenuh).map(([key, points]) => (
              <FitChart key={key} label={FIT_LABELS[key] ?? key} points={points} />
            ))}
          </div>
        </Card>

        <Card title="Statistik Uji Perilaku — Model Penuh">
          <div className="flex justify-end mb-3 gap-2">
            <ExpandButton open={versiPerilaku === "Dengan COVID"} onClick={() => setVersiPerilaku("Dengan COVID")} labelOpen="Dengan COVID (7 tahun)" labelClosed="Dengan COVID (7 tahun)" />
            <ExpandButton open={versiPerilaku === "Tanpa COVID"} onClick={() => setVersiPerilaku("Tanpa COVID")} labelOpen="Tanpa COVID (5 tahun)" labelClosed="Tanpa COVID (5 tahun)" />
          </div>
          <DataTable columns={statPerilakuColumns as Column<ev.StatistikPerilakuRow>[]} rows={statPenuhFiltered} highlightRow={(r) => r.kategoriDC === "Kurang"} />
        </Card>

        <Card title="Fit Uji Parsial — Subsistem Diuji dengan Input Historis" subtitle="P1 (Hotel & TPK), P4 (Lahan), P5 (Wisatawan)">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FitChart label="Jumlah Hotel dan Akomodasi (P1)" points={ev.fitSeriesParsial.jumlah_hotel_dan_akomodasi_P1} />
            <FitChart label="TPK (P1)" points={ev.fitSeriesParsial.tpk_P1} />
            <FitChart label="Lahan Terbangun (P4)" points={ev.fitSeriesParsial.lahan_terbangun_P4} />
            <FitChart label="Jumlah Wisatawan (P5)" points={ev.fitSeriesParsial.jumlah_wisatawan_P5} />
          </div>
        </Card>

        <Card title="Statistik Uji Perilaku — Subsistem Parsial (P1 / P1b / P4 / P5)">
          <DataTable columns={statPerilakuColumns as Column<ev.StatistikPerilakuRow>[]} rows={[...statParsialFiltered, ...statP5Filtered]} highlightRow={(r) => r.kategoriDC === "Kurang"} />
        </Card>

        <div className="rounded-2xl p-5" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <p className="font-display font-bold text-sm text-gray-900 mb-3">Perbandingan DC: Model Penuh → Uji Parsial</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-500 w-40 shrink-0">Jumlah Hotel dan Akomodasi</span>
              <StatusBadge status="Kurang" /> <span className="text-gray-400 text-xs">DC 0,82 (penuh)</span>
              <span>→</span>
              <StatusBadge status="Baik" /> <span className="text-gray-400 text-xs">DC 0,20–0,29 (P1/P1b)</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-500 w-40 shrink-0">TPK</span>
              <StatusBadge status="Cukup" /> <span className="text-gray-400 text-xs">DC 0,47–0,62 (penuh)</span>
              <span>→</span>
              <StatusBadge status="Cukup" /> <span className="text-gray-400 text-xs">DC 0,47–0,67 (P1/P1b, membaik pada versi objektif)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. UJI KONDISI EKSTREM ──────────────────────── */}
      <section className="space-y-5">
        <div>
          <p className="section-label mb-2">3. Robustness</p>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Uji Kondisi Ekstrem</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            17 skenario ekstrem diuji (menyetel parameter ke nilai batas tidak wajar — misalnya wisatawan nol,
            investasi nol, konservasi lahan penuh). Hasil: <strong>15 lolos penuh, 2 lolos dengan catatan, 0
            gagal.</strong> Dua kasus &quot;lolos dengan catatan&quot;: <strong>E02</strong> (laju penurunan
            wisatawan = 0) — tanpa rem penurunan, populasi wisatawan tumbuh sangat besar sesuai logika
            sebab-akibatnya, tetapi menegaskan parameter ini adalah penahan pertumbuhan penting dalam model.{" "}
            <strong>E15</strong> (permintaan eksternal 3× lipat) — seluruh mekanisme pembatas bekerja
            sebagaimana dirancang, tetapi pertumbuhan tetap sangat besar; ini mendefinisikan batas validitas
            model: andal untuk skenario pertumbuhan permintaan sampai sekitar 1,25× kondisi dasar, di luar itu
            hasil numerik perlu ditafsirkan sebagai arah kecenderungan, bukan angka pasti.
          </p>
          <p className="text-sm text-gray-700 mt-3">
            <strong>Status: lolos, dengan batas validitas yang terdokumentasi secara eksplisit.</strong>
          </p>
        </div>

        <Card title="17 Uji Kondisi Ekstrem (E01-E17)">
          <div className="space-y-2">
            {ev.ujiKondisiEkstrem.map((r) => {
              const open = ekstremDetail === r.kode;
              return (
                <div key={r.kode} className="rounded-xl border" style={{ borderColor: r.status.includes("CATATAN") ? "#fde68a" : "#f0f4f8", background: r.status.includes("CATATAN") ? "#fffbeb" : "white" }}>
                  <button
                    onClick={() => setEkstremDetail(open ? null : r.kode)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    <span className="font-display font-bold text-sm shrink-0" style={{ color: "#1D5A8C", width: 40 }}>{r.kode}</span>
                    <span className="text-xs font-semibold shrink-0 px-2 py-0.5 rounded-full" style={{ background: "#eff6ff", color: "#1D5A8C" }}>{r.subsistem}</span>
                    <span className="text-xs text-gray-600 flex-1">{r.parameter}</span>
                    <StatusBadge status={r.status} />
                    <span className="text-gray-400 text-xs shrink-0">{open ? "▲" : "▼"}</span>
                  </button>
                  {open && (
                    <div className="px-4 pb-4 space-y-3">
                      <p className="text-xs text-gray-600 leading-relaxed"><strong>Hipotesis perilaku:</strong> {r.hipotesis}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className="p-2 rounded-lg" style={{ background: "#f8fafc" }}><div className="text-gray-400">Wisatawan 2050</div><div className="font-semibold">{fmt(r.wisatawanJuta, 2)} juta</div></div>
                        <div className="p-2 rounded-lg" style={{ background: "#f8fafc" }}><div className="text-gray-400">Hotel 2050</div><div className="font-semibold">{fmt(r.hotel, 1)}</div></div>
                        <div className="p-2 rounded-lg" style={{ background: "#f8fafc" }}><div className="text-gray-400">ODTW 2050</div><div className="font-semibold">{fmt(r.odtw, 1)}</div></div>
                        <div className="p-2 rounded-lg" style={{ background: "#f8fafc" }}><div className="text-gray-400">Tenaga Kerja 2050</div><div className="font-semibold">{fmt(r.tkRibu, 1)} ribu</div></div>
                        <div className="p-2 rounded-lg" style={{ background: "#f8fafc" }}><div className="text-gray-400">Lahan 2050</div><div className="font-semibold">{fmt(r.lahanHa, 1)} ha</div></div>
                        <div className="p-2 rounded-lg" style={{ background: "#f8fafc" }}><div className="text-gray-400">TPK Maks</div><div className="font-semibold">{fmt(r.tpkMaks, 3)}</div></div>
                        <div className="p-2 rounded-lg" style={{ background: "#f8fafc" }}><div className="text-gray-400">Rasio Daya Dukung Min</div><div className="font-semibold">{fmt(r.rasioDayaDukungMin, 4)}</div></div>
                        <div className="p-2 rounded-lg" style={{ background: "#f8fafc" }}><div className="text-gray-400">Daya Tarik Min–Maks</div><div className="font-semibold">{fmt(r.dayaTarikMin, 3)} – {fmt(r.dayaTarikMaks, 3)}</div></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="rounded-2xl p-5" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
          <p className="font-display font-bold text-sm text-gray-900 mb-2">E15 — Batas Validitas Model</p>
          <p className="text-xs text-gray-600 leading-relaxed mb-4">
            Model dijalankan dengan TIME STEP lebih kecil untuk memastikan hasil E15 tidak melanggar batas fisik
            luas wilayah DIY (317.036 ha). Hasil resmi memakai TIME STEP 0,25 tahun, satu-satunya kondisi (bersama
            0,125) yang lolos aturan lahan.
          </p>
          <DataTable
            columns={[
              { key: "kondisi", label: "Kondisi" },
              { key: "lahanMaksHa", label: "Lahan Maks (ha)", align: "right", render: (r) => fmt(r.lahanMaksHa, 2) },
              { key: "selisih317036", label: "Selisih vs 317.036 ha", align: "right", render: (r) => fmt(r.selisih317036, 2) },
              { key: "rddlMin", label: "RDDL Min", align: "right", render: (r) => r.rddlMin.toExponential(2) },
              { key: "statusAturanLahan", label: "Status Aturan Lahan", render: (r) => <StatusBadge status={r.statusAturanLahan} /> },
            ]}
            rows={ev.diagnostikE15}
            highlightRow={(r) => r.kondisi.includes("resmi")}
          />
          <div className="mt-4">
            <ExpandButton open={horizonOpen} onClick={() => setHorizonOpen(!horizonOpen)} labelOpen="Sembunyikan proyeksi hingga 2150" labelClosed="Lihat proyeksi hingga 2150 (di luar cakupan formal) →" />
          </div>
          {horizonOpen && (
            <div className="mt-4 space-y-3">
              <p className="text-xs text-amber-800 font-semibold">
                ⚠ Proyeksi 2075–2150 ini berada di luar horizon dan kriteria uji formal skripsi (2025–2050). Disajikan
                sebagai eksplorasi tambahan perilaku jangka sangat panjang, bukan bagian dari kesimpulan model yang
                diuji.
              </p>
              <DataTable
                columns={[
                  { key: "tahun", label: "Tahun" },
                  { key: "jumlahWisatawan", label: "Wisatawan", align: "right", render: (r) => fmt(r.jumlahWisatawan, 0) },
                  { key: "dayaTarik", label: "Daya Tarik", align: "right", render: (r) => fmt(r.dayaTarik, 4) },
                  { key: "tpk", label: "TPK", align: "right", render: (r) => fmt(r.tpk, 4) },
                  { key: "rasioDayaDukungLahan", label: "RDDL", align: "right", render: (r) => fmt(r.rasioDayaDukungLahan, 4) },
                  { key: "lahanTerbangun", label: "Lahan Terbangun", align: "right", render: (r) => fmt(r.lahanTerbangun, 1) },
                  { key: "jumlahHotel", label: "Hotel", align: "right", render: (r) => fmt(r.jumlahHotel, 1) },
                  { key: "jumlahOdtw", label: "ODTW", align: "right", render: (r) => fmt(r.jumlahOdtw, 1) },
                  { key: "tenagaKerja", label: "Tenaga Kerja", align: "right", render: (r) => fmt(r.tenagaKerja, 1) },
                  { key: "pdrb", label: "PDRB", align: "right", render: (r) => fmt(r.pdrb, 1) },
                  { key: "investasi", label: "Investasi", align: "right", render: (r) => fmt(r.investasi, 1) },
                ]}
                rows={ev.horizon2150}
              />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                {Object.entries(ev.horizon2150Keterangan).map(([k, v]) => (
                  <div key={k} className="p-2 rounded-lg" style={{ background: "#f8fafc" }}>
                    <div className="text-gray-400">{k}</div>
                    <div className="font-semibold">{fmt(v, k.toLowerCase().includes("tahun") ? 0 : 4)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 4. ANALISIS SENSITIVITAS ────────────────────── */}
      <section className="space-y-5">
        <div>
          <p className="section-label mb-2">4. Sensitivitas</p>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Analisis Sensitivitas</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Analisis dilakukan dua tahap. Tahap pertama menguji ke-30 parameter dengan mengubah masing-masing ±10%
            dari nilai dasar untuk menyaring parameter yang paling memengaruhi keluaran model (tornado ranking).
            Tahap kedua menguji kelompok parameter dengan ketidakpastian terbesar, serta kedua tuas kebijakan,
            pada rentang nilai yang lebih realistis (bukan sekadar ±10%).
          </p>
          <p className="text-sm text-gray-500 leading-relaxed mt-3">
            Pada tahap pertama, <strong>Laju Penurunan Dasar</strong> menempati peringkat 1 untuk hampir semua
            variabel keluaran (memengaruhi Jumlah Wisatawan hingga 42,07%), diikuti <strong>Bobot ODTW</strong>{" "}
            (22,79%) dan <strong>Rasio Daya Dukung Lahan Referensi</strong> (11,48%). Parameter-parameter ini
            berstatus asumsi struktural, bukan tuas kebijakan — karena itu diuji lewat rentang penuh dan
            pengujian kekokohan, bukan dijadikan skenario.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed mt-3">
            Pada tahap kedua, dua tuas kebijakan diuji pada rentang aktualnya. <strong>Insentif Kebijakan</strong>{" "}
            (0–0,5) menggerakkan Jumlah Wisatawan dan PDRB secara hampir linear, dari +2,56% pada 0,1 hingga
            +12,92% pada 0,5. Sebaliknya, <strong>Kebijakan Konservasi Lahan</strong> (0–1) nyaris tak berdaya
            menggerakkan Lahan Terbangun total: pada nilai maksimum (1,0) sekalipun, Lahan Terbangun 2050 hanya
            turun <strong>0,91%</strong>, meskipun Laju Konversi Lahan Pariwisata berhasil ditekan hingga{" "}
            <strong>−100%</strong>. Ini karena tuas tersebut hanya menghentikan konversi lahan yang berasal dari
            pembangunan hotel dan ODTW, sedangkan konversi lahan non-pariwisata — yang mendominasi total lahan
            terbangun — tidak terpengaruh sama sekali.
          </p>
        </div>

        <Card title="Peringkat Tornado (±10%)" subtitle="Pengaruh terhadap Jumlah Wisatawan 2050, diurutkan dari terbesar">
          <div className="flex justify-end mb-3">
            <ExpandButton open={tornadoDetail} onClick={() => setTornadoDetail(!tornadoDetail)} labelOpen="Tampilkan 10 teratas saja" labelClosed="Lihat seluruh 30 parameter & variabel lain →" />
          </div>
          {!tornadoDetail ? (
            <DataTable
              columns={[
                { key: "peringkatWisatawan", label: "#", align: "right" },
                { key: "parameter", label: "Parameter" },
                { key: "wisatawanMin10", label: "-10%", align: "right", render: (r) => fmtPct(r.wisatawanMin10, 2) },
                { key: "wisatawanPlus10", label: "+10%", align: "right", render: (r) => fmtPct(r.wisatawanPlus10, 2) },
                { key: "wisatawanMaks", label: "|Maks|", align: "right", render: (r) => fmtPct(r.wisatawanMaks, 2) },
              ]}
              rows={ev.peringkatTornadoTop}
            />
          ) : (
            <DataTable
              columns={[
                { key: "peringkatWisatawan", label: "# Wisatawan", align: "right" },
                { key: "parameter", label: "Parameter" },
                { key: "wisatawanMaks", label: "Wisatawan |Maks|", align: "right", render: (r) => fmtPct(r.wisatawanMaks, 2) },
                { key: "lahanMaks", label: "Lahan |Maks|", align: "right", render: (r) => fmtPct(r.lahanMaks, 3) },
                { key: "pdrbMaks", label: "PDRB |Maks|", align: "right", render: (r) => fmtPct(r.pdrbMaks, 2) },
                { key: "hotelMaks", label: "Hotel |Maks|", align: "right", render: (r) => fmtPct(r.hotelMaks, 2) },
                { key: "tkMaks", label: "TK |Maks|", align: "right", render: (r) => fmtPct(r.tkMaks, 2) },
                { key: "odtwMaks", label: "ODTW |Maks|", align: "right", render: (r) => fmtPct(r.odtwMaks, 2) },
              ]}
              rows={ev.peringkatTornadoAll}
            />
          )}
        </Card>

        <Card title="Rentang Uji Penuh" subtitle="Lebar dampak (poin %) per kelompok parameter berketidakpastian terbesar, dan kedua tuas kebijakan">
          <DataTable
            columns={[
              { key: "kelompok", label: "Kelompok / Parameter" },
              { key: "lebarWisatawan", label: "Lebar Wisatawan", align: "right", render: (r) => fmt(r.lebarWisatawan, 3) },
              { key: "lebarLahan", label: "Lebar Lahan", align: "right", render: (r) => fmt(r.lebarLahan, 3) },
              { key: "lebarPdrb", label: "Lebar PDRB", align: "right", render: (r) => fmt(r.lebarPdrb, 3) },
            ]}
            rows={ev.lebarRentang}
            highlightRow={(r) => r.kelompok === "Kebijakan Konservasi Lahan"}
          />
          <p className="text-xs text-gray-400 mt-3">
            Baris <strong>Kebijakan Konservasi Lahan</strong> (ditandai kuning) memiliki lebar dampak Lahan Terbangun
            terkecil di antara seluruh kelompok yang diuji — jauh di bawah Rasio LPD/LPE (153,6 poin%) atau Bobot
            Daya Tarik (49,5 poin%).
          </p>
        </Card>

        <Card title="Rentang Penuh Dua Tuas Kebijakan" subtitle="Insentif Kebijakan vs Kebijakan Konservasi Lahan, pada rentang nilai aktualnya">
          <DataTable
            columns={[
              { key: "kelompok", label: "Tuas" },
              { key: "nilaiUji", label: "Nilai Uji" },
              { key: "wisatawanPct", label: "Wisatawan (%)", align: "right", render: (r) => fmtPct(r.wisatawanPct, 3) },
              { key: "pdrbPct", label: "PDRB (%)", align: "right", render: (r) => fmtPct(r.pdrbPct, 3) },
              { key: "lahanPct", label: "Lahan Terbangun (%)", align: "right", render: (r) => fmtPct(r.lahanPct, 3) },
              { key: "konversiPariwisataPct", label: "Konversi Lahan Pariwisata (%)", align: "right", render: (r) => fmtPct(r.konversiPariwisataPct, 2) },
            ]}
            rows={ev.rentangTuasKebijakan}
            highlightRow={(r) => r.kelompok === "Kebijakan Konservasi Lahan"}
          />
        </Card>
      </section>

      {/* ── KESIMPULAN ──────────────────────────────────── */}
      <section>
        <div className="rounded-2xl p-6" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderLeft: "4px solid #1D5A8C" }}>
          <p className="section-label mb-3">Kesimpulan</p>
          <p className="text-sm text-gray-700 leading-relaxed italic">
            Model ini telah diuji melalui empat tahapan standar dalam metodologi System Dynamics. Model terbukti
            bebas dari kesalahan struktural dan tetap berperilaku logis pada kondisi ekstrem. Pada uji kesesuaian
            dengan data historis, model paling andal dalam menangkap pola PDRB pariwisata, pertumbuhan objek
            wisata, dan jumlah wisatawan; sementara pola akomodasi hotel dan tenaga kerja pada level model
            keseluruhan menunjukkan penyimpangan yang perlu dibaca sebagai keterbatasan cakupan model, bukan
            kesalahan perhitungan — hal ini didukung oleh hasil pengujian per-subsistem yang menunjukkan struktur
            persamaannya sendiri valid. Model dirancang untuk menangkap arah dan besaran relatif dampak kebijakan
            jangka panjang (2025–2050), bukan untuk memprediksi angka tahunan secara presisi.
          </p>
        </div>
      </section>
    </div>
  );
}
