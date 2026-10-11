import { describe, expect, it } from "vitest";
import { RESEARCH_DATA, SERIES } from "../lib/baseData";
import { buildTemplateCsv, buildTemplateXlsx, parseNumberText, parseTemplateCsv, parseTemplateXlsx } from "../lib/templateIO";
import { validateRows } from "../lib/parameterUpdate";

describe("template CSV", () => {
  it("unduh lalu unggah ulang tanpa perubahan menghasilkan data yang sama persis", () => {
    const rows = parseTemplateCsv(buildTemplateCsv(RESEARCH_DATA));
    expect(rows).toEqual(RESEARCH_DATA.map((r) => ({ ...r })));
  });
  it("membaca CSV berpemisah titik koma dengan koma desimal (Excel Indonesia)", () => {
    const header = ["tahun", ...SERIES.map((s) => s.key)].join(";");
    const vals = SERIES.map((s) => (s.key === "tpg" ? "2,07" : s.key === "jumlah_wisatawan" ? "40.695.654" : "1"));
    const rows = parseTemplateCsv(`${header}\n2015;${vals.join(";")}`);
    expect(rows[0].tpg).toBeCloseTo(2.07, 10);
    expect(rows[0].jumlah_wisatawan).toBe(40695654);
  });
  it("teks bukan angka ditandai tidak valid, sel kosong ditandai belum diisi", () => {
    const csv = buildTemplateCsv(RESEARCH_DATA).trimEnd() + `\r\n2026,abc,${SERIES.slice(1).map(() => "").join(",")}\r\n`;
    const rows = parseTemplateCsv(csv);
    const v = validateRows(rows);
    expect(v.errors.some((e) => e.pesan.includes("bukan angka"))).toBe(true);
    expect(v.errors.some((e) => e.pesan.includes("belum diisi"))).toBe(true);
  });
  it("menolak berkas tanpa baris kode kolom", () => {
    expect(() => parseTemplateCsv("a,b,c\n1,2,3")).toThrow(/kode kolom/);
  });
  it("parseNumberText", () => {
    expect(parseNumberText("1.234,5", true)).toBe(1234.5);
    expect(parseNumberText("1234.5", false)).toBe(1234.5);
    expect(Number.isNaN(parseNumberText("", false))).toBe(true);
  });
});

describe("template XLSX", () => {
  it("unduh lalu unggah ulang tanpa perubahan menghasilkan data yang sama persis", async () => {
    const blob = await buildTemplateXlsx(RESEARCH_DATA);
    const rows = await parseTemplateXlsx(await blob.arrayBuffer());
    expect(rows).toEqual(RESEARCH_DATA.map((r) => ({ ...r })));
  });
});
