import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Copy from "@/components/Copy";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import { api } from "@/lib/api";
import { COINBASE_MATURITY } from "@/lib/config";
import { formatBytes, formatInteger, formatUtc, formatZka, timeAgo } from "@/lib/format";

// The node keeps no index by transaction id yet, so a transaction is found
// through its block: the block page links here with ?block=height.
const TxDetail = () => {
  const { txid = "" } = useParams();
  const [params] = useSearchParams();
  const height = params.get("block") ?? "";
  const block = useQuery({
    queryKey: ["block", height],
    queryFn: () => api.block(height),
    enabled: /^\d+$/.test(height),
    retry: false,
  });
  const tx = block.data?.transactions.find((entry) => entry.txid === txid.toLowerCase());
  const b = block.data;

  return (
    <Layout title="Transaction">
      <section className="scan-hero">
        <div className="scan-eyebrow">{tx?.kind === "coinbase" ? "Block reward" : "Private transfer"}</div>
        <h1 className="scan-title scan-mono" style={{ fontSize: "clamp(16px, 2.2vw, 24px)", letterSpacing: 0 }}>
          {txid}
          <Copy value={txid} label="Copy the transaction id" />
        </h1>
        {!height && (
          <>
            <p className="scan-lede">
              Transactions are found through their block for now: open the block, then the transaction. Search a block
              by its height or hash.
            </p>
            <SearchBar />
          </>
        )}
        {b && !tx && <p className="scan-notice">Block #{formatInteger(b.height)} has no transaction with this id.</p>}
        {block.isError && <p className="scan-notice">The explorer API does not answer right now.</p>}
      </section>

      {b && tx && (
        <>
          <div className="scan-card mt-8">
            <dl className="scan-facts">
              <dt>Block</dt>
              <dd>
                <Link className="scan-link" to={`/block/${b.height}`}>
                  #{formatInteger(b.height)}
                </Link>{" "}
                <span className="scan-muted">
                  · {formatUtc(b.timestamp)} · {timeAgo(b.timestamp)} · {b.confirmations} confirmations
                </span>
              </dd>
              <dt>Kind</dt>
              <dd>{tx.kind === "coinbase" ? "Coinbase: the block reward, paid to private notes" : "Private transfer"}</dd>
              <dt>Spends</dt>
              <dd>
                {tx.inputs} note{tx.inputs === 1 ? "" : "s"}
                {tx.kind === "transfer" && <span className="scan-muted"> · by nullifier, never naming the note</span>}
              </dd>
              <dt>Creates</dt>
              <dd>
                {tx.outputs} note{tx.outputs === 1 ? "" : "s"}
                <span className="scan-muted"> · each sealed with X-Wing for its recipient</span>
              </dd>
              <dt>{tx.kind === "coinbase" ? "Amount" : "Fee"}</dt>
              <dd>
                {tx.kind === "coinbase" ? (
                  <>
                    {formatZka(b.reward_atoms)} ZKA{" "}
                    <span className="scan-muted">· spendable after {COINBASE_MATURITY} blocks</span>
                  </>
                ) : (
                  `${formatZka(tx.fee_atoms)} ZKA`
                )}
              </dd>
              <dt>Size</dt>
              <dd>
                {formatBytes(tx.size_bytes)}
                {tx.proof_bytes > 0 && <span className="scan-muted"> · STARK proof {formatBytes(tx.proof_bytes)}</span>}
              </dd>
            </dl>
          </div>
          <p className="scan-note">
            {tx.kind === "coinbase" ? (
              <>
                <strong>A reward's amount is public, its recipient is not.</strong> Anyone can check how much each block
                created; only the miner's wallet can tell the notes are its own.
              </>
            ) : (
              <>
                <strong>What this transfer hides:</strong> who paid, who was paid, how much and which notes it spent. One
                STARK proof shows that the spender owns those notes and that inputs equal outputs plus the fee. The chain
                only shows the fee, the number of notes in and out, and the size.
              </>
            )}
          </p>
        </>
      )}
    </Layout>
  );
};

export default TxDetail;
