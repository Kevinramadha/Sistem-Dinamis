"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { RESEARCH_BASE_YEAR, SERIES, type YearRow } from "@/lib/baseData";
import type { BaseOverride } from "@/lib/model";
import { computeParameters, sortRows, validateRows, type BaseDataConfig } from "@/lib/parameterUpdate";

const STORAGE_KEY = "simdiy.dataDasar.v1";

interface BaseDataState {
  /** null = memakai data penelitian (2025). */
  config: BaseDataConfig | null;
  /** Untuk dikirim ke runModel; null = data penelitian. */
  override: BaseOverride | null;
  baseYear: number;
  isCustom: boolean;
  /** false sampai localStorage selesai dibaca di browser. */
  ready: boolean;
  apply: (rows: YearRow[]) => BaseDataConfig;
  reset: () => void;
}

const BaseDataContext = createContext<BaseDataState | null>(null);

/**
 * Membangun konfigurasi dari seri data. Parameter selalu dihitung ulang dari
 * baris data (bukan dibaca dari berkas) supaya konfigurasi yang disimpan atau
 * diimpor tidak bisa memuat parameter yang tidak konsisten dengan datanya.
 * Melempar Error bila data tidak lolos validasi.
 */
export function buildConfig(rows: YearRow[]): BaseDataConfig {
  const sorted = sortRows(rows);
  const v = validateRows(sorted);
  if (v.errors.length) throw new Error(v.errors.map((e) => e.pesan).join("\n"));
  const p = computeParameters(sorted);
  return { version: 1, baseYear: p.baseYear, rows: sorted, params: p.values, appliedAt: new Date().toISOString() };
}

/** Membaca konfigurasi dari JSON (localStorage atau berkas impor). */
export function parseConfig(json: unknown): BaseDataConfig {
  if (!json || typeof json !== "object") throw new Error("Berkas konfigurasi tidak dikenali.");
  const obj = json as Partial<BaseDataConfig>;
  if (obj.version !== 1 || !Array.isArray(obj.rows)) throw new Error("Berkas konfigurasi tidak dikenali atau versinya tidak didukung.");
  const rows: YearRow[] = obj.rows.map((r: Record<string, unknown>) => {
    const row = { tahun: Number(r.tahun) } as YearRow;
    for (const s of SERIES) row[s.key] = Number(r[s.key]);
    return row;
  });
  const cfg = buildConfig(rows);
  return { ...cfg, appliedAt: typeof obj.appliedAt === "string" ? obj.appliedAt : cfg.appliedAt };
}

// ── Penyimpanan (localStorage) sebagai external store ───────────────────────
// Dibaca lewat useSyncExternalStore agar aman untuk hydration: server selalu
// merender data penelitian, lalu browser memakai konfigurasi tersimpan.

let memory: BaseDataConfig | null | undefined; // dipakai bila localStorage tidak tersedia
let cache: { raw: string | null; cfg: BaseDataConfig | null } = { raw: null, cfg: null };
const listeners = new Set<() => void>();

function getSnapshot(): BaseDataConfig | null {
  if (memory !== undefined) return memory;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (raw === cache.raw) return cache.cfg;
  let cfg: BaseDataConfig | null = null;
  try {
    cfg = raw ? parseConfig(JSON.parse(raw)) : null;
  } catch {
    // Data tersimpan rusak atau tidak valid: kembali ke data penelitian.
    cfg = null;
  }
  cache = { raw, cfg };
  return cfg;
}

const getServerSnapshot = () => null;

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function writeStorage(cfg: BaseDataConfig | null) {
  try {
    if (cfg) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    else window.localStorage.removeItem(STORAGE_KEY);
    memory = undefined;
  } catch {
    // Penyimpanan tidak tersedia (mode privat, kuota penuh): konfigurasi tetap
    // berlaku selama halaman terbuka, dan pengguna masih bisa mengekspor JSON.
    memory = cfg;
  }
  listeners.forEach((l) => l());
}

const noopSubscribe = () => () => {};

export function BaseDataProvider({ children }: { children: React.ReactNode }) {
  const config = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const apply = useCallback((rows: YearRow[]) => {
    const cfg = buildConfig(rows);
    writeStorage(cfg);
    return cfg;
  }, []);

  const reset = useCallback(() => writeStorage(null), []);

  const value = useMemo<BaseDataState>(
    () => ({
      config,
      override: config ? { baseYear: config.baseYear, params: config.params } : null,
      baseYear: config?.baseYear ?? RESEARCH_BASE_YEAR,
      isCustom: config !== null,
      ready,
      apply,
      reset,
    }),
    [config, ready, apply, reset]
  );

  return <BaseDataContext.Provider value={value}>{children}</BaseDataContext.Provider>;
}

export function useBaseData(): BaseDataState {
  const ctx = useContext(BaseDataContext);
  if (!ctx) throw new Error("useBaseData harus dipakai di dalam BaseDataProvider");
  return ctx;
}
