import { api, ApiError } from "./api";
import { NETWORK_ID, VIEW_KEY_PREFIX } from "./config";
import init, { Scanner } from "./scan-wasm/zoka_pq_scan_wasm.js";
import type { WalletBalance } from "./types";

// A view key opens the wallet's notes and recognises its own transfers, so it
// gives the exact balance, and it cannot spend. It stays in this page: the
// scanner runs here (WebAssembly built from the node's own zoka-pq-pool) on
// pages of encrypted outputs that every visitor downloads alike, so the node
// never learns whose wallet is being read.

export const looksLikeViewKey = (text: string) => text.trim().startsWith(VIEW_KEY_PREFIX);

// The search box hands a pasted key over in memory, never through the URL.
let handedOver: string | null = null;
export function handOver(key: string) {
  handedOver = key;
}
export function takeHandedOver(): string | null {
  const key = handedOver;
  handedOver = null;
  return key;
}

export interface ScanProgress {
  scanned: number;
  tip: number;
}

export interface WalletView {
  address: string;
  balance: WalletBalance;
}

let ready: Promise<unknown> | null = null;

// Scan pages have a slow rate of their own (one a second after a burst of
// ten): when the node says "too many", the scan waits instead of failing.
async function pageFrom(from: number, signal: AbortSignal): Promise<Uint8Array> {
  for (;;) {
    try {
      return await api.scanPage(from);
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 429) || signal.aborted) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2_000));
    }
  }
}

export async function scanWallet(
  key: string,
  onProgress: (progress: ScanProgress) => void,
  signal: AbortSignal,
): Promise<WalletView> {
  ready ??= init();
  await ready;
  const scanner = new Scanner(key.trim(), NETWORK_ID);
  try {
    const address = scanner.address();
    let tip = Infinity;
    while (scanner.next() <= tip) {
      if (signal.aborted) throw new DOMException("The scan was stopped", "AbortError");
      const page = await pageFrom(scanner.next(), signal);
      // A page past the tip comes back empty, and the loop ends.
      tip = scanner.add_page(page);
      onProgress({ scanned: Math.min(scanner.next() - 1, tip), tip });
    }
    return { address, balance: JSON.parse(scanner.balance()) as WalletBalance };
  } finally {
    scanner.free();
  }
}
