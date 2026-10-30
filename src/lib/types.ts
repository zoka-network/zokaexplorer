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
  nonce: number;
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

export interface Checkpoint {
  version: number;
  chain_id: string;
  height: number;
  block_hash: string;
  signature: string;
  mldsa_signature?: string;
}
