// Menjalankan Pencarian Target di Web Worker (dengan cadangan di thread utama
// bila browser tidak mendukung Worker). Satu pencarian aktif pada satu waktu.
import { goalSeek, modelEvaluator, type Dim, type SearchResult, type Target } from "./goalSeek";
import type { GoalSeekMessage, GoalSeekRequest } from "./goalSeek.worker";
import type { BaseOverride } from "./model";

export class SearchCancelled extends Error {
  constructor() {
    super("Pencarian dibatalkan.");
  }
}

interface Pending {
  id: number;
  resolve: (v: { result: SearchResult; ms: number }) => void;
  reject: (e: Error) => void;
  onProgress: (fraction: number) => void;
}

let worker: Worker | null = null;
let pending: Pending | null = null;
let nextId = 0;

function ensureWorker(): Worker | null {
  if (worker) return worker;
  if (typeof Worker === "undefined") return null;
  try {
    worker = new Worker(new URL("./goalSeek.worker.ts", import.meta.url), { type: "module" });
  } catch {
    return null;
  }
  worker.onmessage = (e: MessageEvent<GoalSeekMessage>) => {
    const m = e.data;
    if (!pending || m.id !== pending.id) return;
    if (m.type === "progress") pending.onProgress(m.done / m.total);
    else {
      const p = pending;
      pending = null;
      if (m.type === "done") p.resolve({ result: m.result, ms: m.ms });
      else p.reject(new Error(m.message));
    }
  };
  worker.onerror = (e) => {
    pending?.reject(new Error(e.message || "Web Worker tidak dapat dijalankan."));
    pending = null;
  };
  return worker;
}

export async function searchTargets(
  targets: Target[],
  dims: Dim[],
  base: BaseOverride | null,
  onProgress: (fraction: number) => void
): Promise<{ result: SearchResult; ms: number }> {
  const id = ++nextId;
  const w = ensureWorker();
  if (!w) {
    const t0 = performance.now();
    const result = await goalSeek(targets, dims, modelEvaluator(dims, base), { onProgress: (d, t) => onProgress(d / t) });
    return { result, ms: performance.now() - t0 };
  }
  pending?.reject(new SearchCancelled());
  return new Promise((resolve, reject) => {
    pending = { id, resolve, reject, onProgress };
    w.postMessage({ id, targets, dims, base } satisfies GoalSeekRequest);
  });
}

/** Menghentikan pencarian yang sedang berjalan (Worker dihentikan dan dibuat ulang saat dibutuhkan). */
export function cancelSearch() {
  worker?.terminate();
  worker = null;
  pending?.reject(new SearchCancelled());
  pending = null;
}
