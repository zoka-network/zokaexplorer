import { Link } from "react-router-dom";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Layout from "@/components/Layout";
import LiveStatus from "@/components/LiveStatus";
import SearchBar from "@/components/SearchBar";
import { api } from "@/lib/api";
import { REFRESH_MS, TARGET_BLOCK_SECS } from "@/lib/config";
import { formatBytes, formatDuration, formatHashrate, formatInteger, formatZka, shortHash, timeAgo } from "@/lib/format";
import { useRemembered } from "@/lib/live";
import type { BlockSummary } from "@/lib/types";

const MAX_SUPPLY_ZKA = 23_000_000;

const Stat = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="scan-stat">
    <div className="scan-label">{label}</div>
    <div className="scan-stat-value">{value}</div>
    {hint && <div className="scan-stat-hint">{hint}</div>}
  </div>
);

// Seconds between consecutive blocks, oldest first.
function intervals(blocks: BlockSummary[]) {
  const ordered = [...blocks].sort((a, b) => a.height - b.height);
  return ordered.slice(1).map((block, i) => ({
    height: block.height,
    seconds: Math.max(0, block.timestamp - ordered[i].timestamp),
  }));
}

const Index = () => {
  const status = useRemembered("status", api.status, REFRESH_MS);
  const recent = useRemembered("recent", () => api.recent(25), REFRESH_MS);
  const s = status.data;
  const blocks = recent.data?.blocks ?? [];
  const gaps = intervals(blocks);
  const average = gaps.length ? gaps.reduce((sum, gap) => sum + gap.seconds, 0) / gaps.length : 0;
  const now = Date.now() / 1000;

  return (
    <Layout>
      <section className="scan-hero">
        <div className="scan-eyebrow">Zoka Quantic Testnet · STARK v2</div>
        <h1 className="scan-title">The explorer of Zoka Quantic.</h1>
        <p className="scan-lede">
          Blocks, transactions, difficulty and the team's checkpoints, read live from a Zoka node. Payments are
          private: the chain shows that they happened, not who paid whom or how much.
        </p>
        <SearchBar />
        <LiveStatus status={status} />
      </section>

      <div className="scan-stats">
        <Stat label="Height" value={s ? formatInteger(s.height) : "—"} hint={s ? `${shortHash(s.hash, 6)}` : undefined} />
        <Stat
          label="Last block"
          value={s ? timeAgo(s.tip_timestamp, now) : "—"}
          hint={average ? `Average ${formatDuration(average)} over ${gaps.length} blocks` : `Target ${TARGET_BLOCK_SECS}s`}
        />
        <Stat
          label="Difficulty"
          value={s ? `${s.next_difficulty_bits} bits` : "—"}
          hint="Leading zero bits the next block needs"
        />
        <Stat
          label="Network hashrate"
          value={s ? formatHashrate(s.hashrate_estimate_hps) : "—"}
          hint="Estimated from the difficulty"
        />
        <Stat
          label="Issued"
          value={s ? `${formatZka(s.issued_atoms)} ZKA` : "—"}
          hint={`of ${formatInteger(MAX_SUPPLY_ZKA)} ZKA`}
        />
        <Stat
          label="Checkpoint"
          value={s?.checkpoint ? `#${formatInteger(s.checkpoint.height)}` : "—"}
          hint="Signed by the team, Ed25519 + ML-DSA-65"
        />
        <Stat label="Mempool" value={s ? formatInteger(s.mempool_transactions) : "—"} hint="Transfers waiting for a block" />
        <Stat
          label="Short addresses"
          value={s ? formatInteger(s.directory.addresses) : "—"}
          hint="Published in the nodes' directory"
        />
      </div>

      {gaps.length > 1 && (
        <>
          <h2 className="scan-heading">Time between blocks</h2>
          <div className="scan-card p-4" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gaps} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <XAxis dataKey="height" tick={{ fill: "#8d8492", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: "#8d8492", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  unit="s"
                />
                <Tooltip
                  cursor={{ fill: "#f2abd010" }}
                  contentStyle={{ background: "#0a0709", border: "1px solid #302a33", fontSize: 12 }}
                  labelFormatter={(height) => `Block #${height}`}
                  formatter={(seconds: number) => [formatDuration(seconds), "after the previous one"]}
                />
                <Bar dataKey="seconds" fill="#f2abd0" fillOpacity={0.75} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <h2 className="scan-heading">Latest blocks</h2>
      <div className="scan-card scan-scroll">
        <table className="scan-table">
          <thead>
            <tr>
              <th>Height</th>
              <th>Hash</th>
              <th>Age</th>
              <th className="num">Transactions</th>
              <th className="num">Reward</th>
              <th className="num">Size</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((block) => (
              <tr key={block.hash}>
                <td>
                  <Link className="scan-link" to={`/block/${block.height}`}>
                    #{formatInteger(block.height)}
                  </Link>
                </td>
                <td className="scan-mono">
                  <Link className="scan-link" to={`/block/${block.hash}`}>
                    {shortHash(block.hash)}
                  </Link>
                </td>
                <td className="scan-muted">{timeAgo(block.timestamp, now)}</td>
                <td className="num">
                  {block.transactions_count}
                  {block.private_tx_count > 0 && <span className="scan-chip scan-chip-pink ml-2">{block.private_tx_count} private</span>}
                </td>
                <td className="num">{formatZka(block.reward_atoms)} ZKA</td>
                <td className="num scan-muted">{formatBytes(block.size_bytes)}</td>
              </tr>
            ))}
            {!blocks.length && (
              <tr>
                <td colSpan={6} className="scan-muted">
                  {recent.loading ? "Loading the latest blocks…" : "No blocks to show yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Index;
