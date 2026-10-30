// ZokaScan reads the public, read-only API of a Zoka node (`quantic-pq-node
// serve --public-api`): in production the team's explorer node, published by
// a tunnel at api.zokascan.cc; in development the one running on this PC.
export const CHAIN_ID = "zoka-quantic-testnet-v2";
export const NETWORK_LABEL = "Zoka Quantic Testnet";
export const ADDRESS_PREFIX = "zqtest2";

const configured = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
export const API_URL = (
  configured || (import.meta.env.DEV ? "http://127.0.0.1:9181" : "https://api.zokascan.cc")
).replace(/\/+$/, "");

export const ATOMS_PER_ZKA = 1_000_000;
export const TARGET_BLOCK_SECS = 120;
export const COINBASE_MATURITY = 60;

// How often the front page asks for news, and when its data counts as late.
export const REFRESH_MS = 15_000;
export const STALE_AFTER_SECS = 20 * 60;

export const ZOKA_SITE = "https://zoka.network";
export const ZSILENT_RELEASES = "https://github.com/zoka-network/zsilent-core/releases";
export const EXPLORER_REPO = "https://github.com/zoka-network/zokaexplorer";
export const DISCORD = "https://discord.gg/uZRPcNb3m7";
