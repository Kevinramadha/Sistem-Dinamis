/// <reference lib="webworker" />
// Web Worker untuk Pencarian Target: ribuan simulasi dijalankan di luar thread
// utama agar antarmuka tidak membeku, dengan laporan progres berkala.
import { goalSeek, modelEvaluator, type Dim, type SearchResult, type Target } from "./goalSeek";
import type { BaseOverride } from "./model";

export interface GoalSeekRequest {
  id: number;
  targets: Target[];
  dims: Dim[];
  base: BaseOverride | null;
}

export type GoalSeekMessage =
  | { type: "progress"; id: number; done: number; total: number }
  | { type: "done"; id: number; result: SearchResult; ms: number }
  | { type: "error"; id: number; message: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = async (e: MessageEvent<GoalSeekRequest>) => {
  const { id, targets, dims, base } = e.data;
  const t0 = performance.now();
  try {
    const result = await goalSeek(targets, dims, modelEvaluator(dims, base), {
      onProgress: (done, total) => ctx.postMessage({ type: "progress", id, done, total } satisfies GoalSeekMessage),
    });
    ctx.postMessage({ type: "done", id, result, ms: performance.now() - t0 } satisfies GoalSeekMessage);
  } catch (err) {
    ctx.postMessage({ type: "error", id, message: err instanceof Error ? err.message : String(err) } satisfies GoalSeekMessage);
  }
};
