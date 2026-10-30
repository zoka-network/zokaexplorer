import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import Copy from "@/components/Copy";
import Layout from "@/components/Layout";
import { api, ApiError } from "@/lib/api";
import { formatBytes, formatHashrate, formatInteger, formatUtc, formatZka, shortHash, timeAgo } from "@/lib/format";

const BlockDetail = () => {
  const { id = "" } = useParams();
  const block = useQuery({ queryKey: ["block", id], queryFn: () => api.block(id), retry: false });
  const b = block.data;
  const missing = block.error instanceof ApiError && block.error.status === 404;

  return (
    <Layout title={b ? `Block #${b.height}` : "Block"}>
      <section className="scan-hero">
        <div className="scan-eyebrow">Block</div>
        <h1 className="scan-title">{b ? `#${formatInteger(b.height)}` : missing ? "Not found" : "…"}</h1>
        {b && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={b.canonical ? "scan-chip scan-chip-pink" : "scan-chip scan-chip-amber"}>
              {b.canonical ? "Canonical" : "Side branch"}
            </span>
            <span className="scan-chip">
              {b.confirmations} confirmation{b.confirmations === 1 ? "" : "s"}
            </span>
          </div>
        )}
        {missing && (
          <p className="scan-lede">
            The explorer node does not have a block {/^\d+$/.test(id) ? `at height ${id}` : `with hash ${shortHash(id)}`}.
          </p>
        )}
        {block.isError && !missing && <p className="scan-notice">The explorer API does not answer right now.</p>}
      </section>

      {b && (
        <>
          <div className="scan-card mt-8">
            <dl className="scan-facts">
              <dt>Hash</dt>
              <dd className="scan-mono">
                {b.hash}
                <Copy value={b.hash} label="Copy the block hash" />
              </dd>
              <dt>Previous</dt>
              <dd className="scan-mono">
                {b.height > 1 ? (
                  <Link className="scan-link" to={`/block/${b.previous_hash}`}>
                    {b.previous_hash}
                  </Link>
                ) : (
                  <span className="scan-muted">{b.previous_hash} (before block 1)</span>
                )}
              </dd>
              <dt>Time</dt>
              <dd>
                {formatUtc(b.timestamp)} <span className="scan-muted">· {timeAgo(b.timestamp)}</span>
              </dd>
              <dt>Reward</dt>
              <dd>
                {formatZka(b.reward_atoms)} ZKA
                {b.height === 1 && <span className="scan-muted"> · the team allocation at genesis</span>}
                {b.fees_atoms > 0 && <span className="scan-muted"> · includes {formatZka(b.fees_atoms)} ZKA of fees</span>}
              </dd>
              <dt>Difficulty</dt>
              <dd>
                {b.difficulty_bits} bits <span className="scan-muted">· about {formatHashrate(b.hashrate_estimate_hps)} for one block every two minutes</span>
              </dd>
              <dt>Transactions</dt>
              <dd>
                {b.transactions_count} <span className="scan-muted">· {b.private_tx_count} private transfers, {b.private_nullifier_count} notes spent</span>
              </dd>
              <dt>Size</dt>
              <dd>{formatBytes(b.size_bytes)}</dd>
              <dt>Nonce</dt>
              <dd className="scan-mono">{b.nonce}</dd>
              <dt>State root</dt>
              <dd className="scan-mono scan-muted">{b.state_root}</dd>
            </dl>
          </div>

          <h2 className="scan-heading">Transactions</h2>
          <div className="scan-card scan-scroll">
            <table className="scan-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Kind</th>
                  <th className="num">Spends</th>
                  <th className="num">Creates</th>
                  <th className="num">Fee</th>
                  <th className="num">Size</th>
                </tr>
              </thead>
              <tbody>
                {b.transactions.map((tx) => (
                  <tr key={tx.txid}>
                    <td className="scan-mono">
                      <Link className="scan-link" to={`/tx/${tx.txid}?block=${b.height}`}>
                        {shortHash(tx.txid, 10)}
                      </Link>
                    </td>
                    <td>
                      <span className={tx.kind === "coinbase" ? "scan-chip" : "scan-chip scan-chip-pink"}>
                        {tx.kind === "coinbase" ? "Reward" : "Private transfer"}
                      </span>
                    </td>
                    <td className="num">{tx.inputs}</td>
                    <td className="num">{tx.outputs}</td>
                    <td className="num">{tx.kind === "coinbase" ? "—" : `${formatZka(tx.fee_atoms)} ZKA`}</td>
                    <td className="num scan-muted">{formatBytes(tx.size_bytes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="scan-pager">
            {b.height > 1 ? (
              <Link className="scan-link" to={`/block/${b.height - 1}`}>
                ← #{formatInteger(b.height - 1)}
              </Link>
            ) : (
              <span />
            )}
            {b.confirmations > 1 && (
              <Link className="scan-link" to={`/block/${b.height + 1}`}>
                #{formatInteger(b.height + 1)} →
              </Link>
            )}
          </div>
        </>
      )}
    </Layout>
  );
};

export default BlockDetail;
