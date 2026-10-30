import { API_URL } from "./config";
import type {
  AddressLookup,
  BlockStats,
  BlockSummary,
  Checkpoint,
  NetworkHistory,
  NodeStatus,
  RecentBlocks,
  Supply,
} from "./types";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const TIMEOUT_MS = 12_000;
const ATTEMPTS = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// The node answers 429 or 503 when it is busy, with Retry-After: waiting and
// asking again is the polite thing. A 404 is an answer, not a failure.
export async function request<T>(
  path: string,
  fetcher: typeof fetch = fetch,
  read: (response: Response) => Promise<T> = (response) => response.json() as Promise<T>,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetcher(`${API_URL}${path}`, { signal: controller.signal });
      if (response.ok) return await read(response);
      const body = await response.json().catch(() => ({}) as { error?: string });
      const message = (body as { error?: string }).error || `HTTP ${response.status}`;
      if (response.status !== 429 && response.status !== 503) {
        throw new ApiError(message, response.status);
      }
      lastError = new ApiError(message, response.status);
      const wait = Number(response.headers.get("retry-after")) || attempt + 1;
      await sleep(Math.min(wait, 5) * 1000);
    } catch (error) {
      if (error instanceof ApiError && error.status !== 429 && error.status !== 503) throw error;
      lastError = error;
      if (attempt + 1 < ATTEMPTS) await sleep((attempt + 1) * 800);
    } finally {
      clearTimeout(timer);
    }
  }
  if (lastError instanceof ApiError) throw lastError;
  throw new ApiError("The explorer API did not answer", 0);
}

const isHeight = (id: string) => /^\d{1,12}$/.test(id);
export const isBlockHash = (id: string) => /^[0-9a-fA-F]{64}$/.test(id);

export const api = {
  status: () => request<NodeStatus>("/status"),
  recent: (count = 15) => request<RecentBlocks>(`/blocks/recent?count=${count}`),
  block: (id: string) =>
    isHeight(id)
      ? request<BlockSummary>(`/blocks/${Number(id)}/summary`)
      : request<BlockSummary>(`/blocks/hash/${id.toLowerCase()}/summary`),
  address: (short: string) => request<AddressLookup>(`/address/${encodeURIComponent(short)}`),
  checkpoint: () => request<Checkpoint>("/checkpoint"),
  stats: (count = 720) => request<BlockStats>(`/blocks/stats?count=${count}`),
  history: () => request<NetworkHistory>("/network/history"),
  supply: () => request<Supply>("/supply"),
  // The encrypted outputs of up to 100 blocks from `from`, for the view-key
  // scanner. Every visitor downloads the same pages.
  scanPage: (from: number) =>
    request(`/scan?from=${from}&count=100`, fetch, async (response) => new Uint8Array(await response.arrayBuffer())),
};

// The last good answer, kept in this browser: an explorer that goes blank reads
// as "the chain died". It is shown with its age while the API is unreachable.
const CACHE_PREFIX = "zokascan:v2:";

export interface Remembered<T> {
  value: T;
  savedAt: number;
}

export function remember<T>(key: string, value: T): void {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ value, savedAt: Date.now() }));
  } catch {
    // Private windows and full storage: the page works without it.
  }
}

export function recall<T>(key: string): Remembered<T> | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    return raw ? (JSON.parse(raw) as Remembered<T>) : null;
  } catch {
    return null;
  }
}
