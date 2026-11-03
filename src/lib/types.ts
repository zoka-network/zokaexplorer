// What the node's public API answers (see `public_router` in the node's
// src/quantic/stark_api.rs).

export interface NodeStatus {
  chain_id: string;
  node_version: string;
  pool_version: number;
  height: number;
  hash: string;
  tip_timestamp: number;
  issued_atoms: number;
  notes: number;
  mempool_transactions: number;
  pow_algorithm: string;
  target_block_secs: number;
  next_difficulty_bits: number;
  hashrate_estimate_hps: number;
  checkpoint: { height: number; block_hash: string } | null;
  peers: { outbound: number; inbound: number };
  directory: { addresses: number };
}

export interface TxSummary {
  txid: string;
  kind: "coinbase" | "transfer";
  inputs: number;
  outputs: number;
  fee_atoms: number;
  size_bytes: number;
  proof_bytes: number;
}

export interface BlockSummary {
  hash: string;
  height: number;
  timestamp: number;
  state_root: string;
  previous_hash: string;
  /** u64 as decimal text: it does not fit in a JavaScript number. */
  nonce: string;
  size_bytes: number;
  reward_atoms: number;
  transactions_count: number;
  private_tx_count: number;
  private_nullifier_count: number;
  canonical: boolean;
  confirmations: number;
  difficulty_bits: number;
  target_compact: number;
  hashrate_estimate_hps: number;
  fees_atoms: number;
  transactions: TxSummary[];
}

export interface RecentBlocks {
  height: number;
  blocks: BlockSummary[];
}

export interface AddressLookup {
  short_address: string;
  address: string;
}

/** `GET /transactions/{txid}`: in the mempool, or in one of the last 720 blocks. */
export interface TransactionStatus {
  txid: string;
  status: "pending" | "confirmed";
  height?: number;
  block_hash?: string;
  confirmations?: number;
}

export interface Checkpoint {
  version: number;
  chain_id: string;
  height: number;
  block_hash: string;
  signature: string;
  mldsa_signature?: string;
}

export interface BlockStat {
  height: number;
  timestamp: number;
  /** Null for block 1, which has no parent on the chain. */
  interval_secs: number | null;
  difficulty_bits: number;
  hashrate_estimate_hps: number;
  transactions: number;
  size_bytes: number;
}

export interface BlockStats {
  height: number;
  blocks: BlockStat[];
}

export interface NetworkSample {
  time: number;
  height: number;
  outbound: number;
  inbound: number;
  known: number;
  difficulty_bits: number;
  hashrate_estimate_hps: number;
  mempool_transactions: number;
}

export interface NetworkHistory {
  every_secs: number;
  samples: NetworkSample[];
}

export interface Supply {
  height: number;
  issued_atoms: number;
  issued_zka: string;
  max_supply_atoms: number;
  max_supply_zka: string;
  premine_atoms: number;
  next_block_subsidy_atoms: number;
  atoms_per_zka: number;
}

// What the in-browser scanner finds with a view key (zoka-pq-pool's
// `scan::Balance`), in atoms.
export interface ReceivedNote {
  height: number;
  txid: string;
  coinbase: boolean;
  value: number;
  memo: string;
}

export interface SentTransfer {
  height: number;
  txid: string;
  spent: number;
  paid: number;
  change: number;
  fee: number;
}

export interface WalletBalance {
  height: number;
  balance_atoms: number;
  spendable_atoms: number;
  immature_atoms: number;
  received_atoms: number;
  sent_atoms: number;
  received: ReceivedNote[];
  sent: SentTransfer[];
}
