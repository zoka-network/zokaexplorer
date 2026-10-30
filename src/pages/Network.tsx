import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Copy from "@/components/Copy";
import Layout from "@/components/Layout";
import LiveStatus from "@/components/LiveStatus";
import NetworkCharts from "@/components/NetworkCharts";
import { api } from "@/lib/api";
import { API_URL, COINBASE_MATURITY, REFRESH_MS, ZOKA_SITE } from "@/lib/config";
import { formatInteger, formatZka } from "@/lib/format";
import { useRemembered } from "@/lib/live";

const Network = () => {
  const status = useRemembered("status", api.status, REFRESH_MS);
  const checkpoint = useQuery({ queryKey: ["checkpoint"], queryFn: api.checkpoint, refetchInterval: 60_000 });
  const s = status.data;
  const cp = checkpoint.data;

  return (
    <Layout title="Network">
      <section className="scan-hero">
        <div className="scan-eyebrow">Network</div>
        <h1 className="scan-title">Zoka Quantic Testnet v2.</h1>
        <p className="scan-lede">
          A chain whose private pool is post-quantum by design: STARK spend proofs over Poseidon2, X-Wing note
          encryption, and ML-DSA-65 for node identities and the team's checkpoints. Test coins, with no value.
        </p>
        <LiveStatus status={status} />
      </section>

      <NetworkCharts />

      <h2 className="scan-heading">Parameters</h2>
      <div className="scan-card">
        <dl className="scan-facts">
          <dt>Chain id</dt>
          <dd className="scan-mono">{s?.chain_id ?? "—"}</dd>
          <dt>Proof of work</dt>
          <dd>
            RandomX <span className="scan-muted">· rx/0, mined with XMRig through a node's Stratum server</span>
          </dd>
          <dt>Block time</dt>
          <dd>
            {s?.target_block_secs ?? 120} seconds on average <span className="scan-muted">· ASERT difficulty</span>
          </dd>
          <dt>Block reward</dt>
          <dd>
            12 ZKA <span className="scan-muted">· spendable after {COINBASE_MATURITY} blocks</span>
          </dd>
          <dt>Issued</dt>
          <dd>{s ? `${formatZka(s.issued_atoms)} ZKA of 23,000,000` : "—"}</dd>
          <dt>Notes</dt>
          <dd>{s ? formatInteger(s.notes) : "—"}</dd>
          <dt>Explorer node</dt>
          <dd>
            {s ? `Zoka ${s.node_version}` : "—"}
            {s && (
              <span className="scan-muted">
                {" "}
                · {s.peers.outbound} outbound and {s.peers.inbound} inbound peers
              </span>
            )}
          </dd>
        </dl>
      </div>

      <h2 className="scan-heading">The team's checkpoint</h2>
      <div className="scan-card">
        <dl className="scan-facts">
          <dt>Height</dt>
          <dd>
            {cp ? (
              <Link className="scan-link" to={`/block/${cp.height}`}>
                #{formatInteger(cp.height)}
              </Link>
            ) : (
              "—"
            )}
          </dd>
          <dt>Block</dt>
          <dd className="scan-mono">
            {cp ? (
              <>
                {cp.block_hash}
                <Copy value={cp.block_hash} label="Copy the block hash" />
              </>
            ) : (
              "—"
            )}
          </dd>
          <dt>Signatures</dt>
          <dd>
            {cp ? (
              <>
                Ed25519 and ML-DSA-65{" "}
                <span className="scan-muted">
                  · {cp.signature.length / 2} and {(cp.mldsa_signature?.length ?? 0) / 2} bytes, both required
                </span>
              </>
            ) : (
              "—"
            )}
          </dd>
        </dl>
      </div>
      <p className="scan-note">
        <strong>What a checkpoint can and cannot do.</strong> The team's node signs, every 30 blocks, which block is
        canonical at a height, and nodes never follow a branch that contradicts it. That prevents deep forks. It cannot
        make an invalid block valid, create coins or spend anyone's: every node still validates every block.
      </p>

      <h2 className="scan-heading">Where this data comes from</h2>
      <p className="scan-note">
        ZokaScan reads the read-only API of a Zoka node, at <span className="scan-mono">{API_URL}</span>. It sees what
        any node sees: blocks, their work, fees and sizes. It cannot see balances or who paid whom, because the chain
        does not say; a wallet's own balance is read with its view key, in the browser (
        <Link className="scan-link" to="/wallet">
          My wallet
        </Link>
        ). The endpoints are documented under{" "}
        <Link className="scan-link" to="/api">
          API
        </Link>
        . Learn more at{" "}
        <a className="scan-link" href={ZOKA_SITE} target="_blank" rel="noopener noreferrer">
          zoka.network
        </a>
        .
      </p>
    </Layout>
  );
};

export default Network;
