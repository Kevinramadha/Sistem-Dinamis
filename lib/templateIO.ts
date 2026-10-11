import { SERIES, type SeriesKey, type YearRow } from "./baseData";

// Template pembaruan data: satu baris per tahun, satu kolom per seri.
// Empat baris teratas berisi metadata (kode kolom, nama, satuan, sumber),
// baris data dimulai dari baris ke-5. Pengguna cukup menambah satu baris
// tahun baru di bagian bawah lalu mengunggah kembali berkasnya.

export const TEMPLATE_BASENAME = "template-pembaruan-data-simdiy";
const KEY_TAHUN = "tahun";

function metaRows(): string[][] {
  return [
    [KEY_TAHUN, ...SERIES.map((s) => s.key)],
    ["Tahun", ...SERIES.map((s) => s.label)],
    ["Satuan", ...SERIES.map((s) => s.satuan)],
    ["Sumber", ...SERIES.map((s) => s.sumber)],
  ];
}

function dataRows(rows: readonly YearRow[]): number[][] {
  return rows.map((r) => [r.tahun, ...SERIES.map((s) => r[s.key])]);
}

// ── CSV ─────────────────────────────────────────────────────────────────────

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildTemplateCsv(rows: readonly YearRow[]): string {
  const lines = [...metaRows(), ...dataRows(rows)].map((r) => r.map(csvCell).join(","));
  return "﻿" + lines.join("\r\n") + "\r\n";
}

function splitCsvLine(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delim) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

/**
 * Angka dari sel teks. Untuk CSV berpemisah titik koma (format Excel Indonesia)
 * koma dibaca sebagai desimal dan titik sebagai pemisah ribuan.
 */
export function parseNumberText(text: string, decimalComma: boolean): number {
  let t = text.trim().replace(/\s/g, "");
  if (t === "") return NaN;
  if (decimalComma) t = t.replace(/\./g, "").replace(",", ".");
  return Number(t);
}

export function parseTemplateCsv(text: string): YearRow[] {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) throw new Error("Berkas CSV kosong.");
  const delim = lines[0].split(";").length > lines[0].split(",").length ? ";" : ",";
  const grid = lines.map((l) => splitCsvLine(l, delim));
  return gridToRows(grid, (cell) => parseNumberText(cell, delim === ";"));
}

// ── Grid → baris ────────────────────────────────────────────────────────────

/** Mengubah tabel (baris × kolom) menjadi YearRow[]; baris data = baris yang kolom pertamanya berupa tahun. */
function gridToRows<T>(grid: T[][], parse: (cell: T) => number): YearRow[] {
  // Sel kosong → NaN ("belum diisi"); sel berisi teks yang bukan angka → Infinity ("bukan angka yang valid").
  const toNumber = (cell: T) => {
    const n = parse(cell);
    return Number.isNaN(n) && String(cell ?? "").trim() !== "" ? Infinity : n;
  };
  const headerIdx = grid.findIndex((r) => String(r[0] ?? "").trim().toLowerCase() === KEY_TAHUN);
  if (headerIdx === -1) {
    throw new Error("Baris kode kolom (diawali 'tahun') tidak ditemukan. Gunakan template yang diunduh dari halaman ini.");
  }
  const header = grid[headerIdx].map((c) => String(c ?? "").trim());
  const colOf = {} as Record<SeriesKey, number>;
  const missing: string[] = [];
  for (const s of SERIES) {
    const i = header.indexOf(s.key);
    if (i === -1) missing.push(s.label);
    colOf[s.key] = i;
  }
  if (missing.length) throw new Error(`Kolom berikut tidak ditemukan di template: ${missing.join(", ")}.`);

  const rows: YearRow[] = [];
  for (const r of grid.slice(headerIdx + 1)) {
    const tahun = toNumber(r[0]);
    if (!Number.isFinite(tahun)) continue; // baris nama, satuan, sumber, atau kosong
    const row = { tahun } as YearRow;
    for (const s of SERIES) row[s.key] = toNumber(r[colOf[s.key]]);
    rows.push(row);
  }
  if (rows.length === 0) throw new Error("Tidak ada baris data tahunan di dalam berkas.");
  return rows;
}

// ── XLSX (ExcelJS dimuat hanya saat dibutuhkan) ─────────────────────────────

export async function buildTemplateXlsx(rows: readonly YearRow[]): Promise<Blob> {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "SimDIY";
  const ws = wb.addWorksheet("Data");
  for (const r of metaRows()) ws.addRow(r);
  for (const r of dataRows(rows)) ws.addRow(r);

  ws.getRow(1).font = { color: { argb: "FF94A3B8" }, size: 9 };
  ws.getRow(2).font = { bold: true };
  ws.getRow(3).font = { italic: true, color: { argb: "FF475569" } };
  ws.getRow(4).font = { color: { argb: "FF64748B" }, size: 9 };
  ws.getRow(4).alignment = { wrapText: true, vertical: "top" };
  for (let r = 1; r <= 4; r++) ws.getRow(r).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
  ws.getColumn(1).width = 10;
  SERIES.forEach((_, i) => (ws.getColumn(i + 2).width = 22));
  ws.views = [{ state: "frozen", xSplit: 1, ySplit: 4 }];

  const help = wb.addWorksheet("Petunjuk");
  [
    ["Petunjuk pengisian template pembaruan data SimDIY"],
    [""],
    ["1. Jangan mengubah baris 1 (kode kolom). Baris 2–4 berisi nama, satuan, dan sumber data."],
    ["2. Tambahkan satu baris di bawah baris tahun terakhir untuk tahun baru, lalu isi seluruh kolomnya."],
    ["3. Tahun harus berurutan tanpa loncatan, dimulai dari 2015."],
    ["4. Isi angka saja tanpa satuan. TPK dalam persen (0–100). TPG dalam tamu per kamar."],
    ["5. Data 2015–2025 adalah data penelitian; ubah hanya bila ada revisi resmi dari sumbernya."],
    ["6. Unggah kembali berkas ini di halaman Pembaruan Data untuk divalidasi dan dipratinjau."],
  ].forEach((r) => help.addRow(r));
  help.getColumn(1).width = 110;
  help.getRow(1).font = { bold: true, size: 13 };

  const buf = await wb.xlsx.writeBuffer();
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

function excelCellToNumber(v: unknown): number {
  if (v === null || v === undefined || v === "") return NaN;
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseNumberText(v, v.includes(",") && !v.includes("."));
  if (typeof v === "object") {
    const o = v as { result?: unknown; text?: unknown; richText?: { text: string }[] };
    if (o.result !== undefined) return excelCellToNumber(o.result);
    if (Array.isArray(o.richText)) return excelCellToNumber(o.richText.map((t) => t.text).join(""));
    if (typeof o.text === "string") return excelCellToNumber(o.text);
  }
  return NaN;
}

export async function parseTemplateXlsx(data: ArrayBuffer): Promise<YearRow[]> {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  try {
    await wb.xlsx.load(data);
  } catch {
    throw new Error("Berkas .xlsx tidak dapat dibaca. Pastikan berkas tidak rusak dan berformat Excel (.xlsx).");
  }
  const ws = wb.getWorksheet("Data") ?? wb.worksheets[0];
  if (!ws) throw new Error("Lembar kerja 'Data' tidak ditemukan.");
  const grid: unknown[][] = [];
  ws.eachRow({ includeEmpty: false }, (row) => {
    const values = row.values as unknown[]; // indeks 0 kosong pada ExcelJS
    grid.push(values.slice(1));
  });
  return gridToRows(grid, (cell) => {
    if (typeof cell === "string" && cell.trim().toLowerCase() === KEY_TAHUN) return NaN;
    return excelCellToNumber(cell);
  });
}

export async function parseTemplateFile(file: File): Promise<YearRow[]> {
  const name = file.name.toLowerCase();
  if (file.size > 5 * 1024 * 1024) throw new Error("Ukuran berkas melebihi 5 MB.");
  if (name.endsWith(".xlsx")) return parseTemplateXlsx(await file.arrayBuffer());
  if (name.endsWith(".csv")) return parseTemplateCsv(await file.text());
  throw new Error("Format berkas tidak didukung. Gunakan .xlsx atau .csv dari template.");
}

// ── Unduh berkas ────────────────────────────────────────────────────────────

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
