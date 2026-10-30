import Layout from "@/components/Layout";
import { API_URL, EXPLORER_REPO } from "@/lib/config";

interface Endpoint {
  path: string;
  what: string;
  example?: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    path: "/status",
    what: "The chain tip, issued supply, the next block's difficulty and estimated hashrate, the latest checkpoint and the explorer node's peers.",
    example: '{"chain_id":"zoka-quantic-testnet-v2","height":513,"next_difficulty_bits":14,"hashrate_estimate_hps":136,…}',
  },
  {
    path: "/blocks/recent?count=N",
    what: "The latest N block summaries, newest first (N ≤ 25).",
  },
  {
    path: "/blocks/{height}/summary",
    what: "One canonical block: header, reward, fees, difficulty, confirmations and its transactions (id, kind, inputs, outputs, fee, sizes), without the proofs.",
  },
  {
    path: "/blocks/hash/{hash}/summary",
    what: "The same for a stored block by its hash, canonical or not.",
  },
  {
    path: "/blocks/stats?count=N&before=H",
    what: "Per-block figures for charts, oldest first: time, interval, difficulty bits, estimated hashrate, transactions and size. Up to 720 blocks, ending before H (default: the tip).",
    example: '{"height":513,"blocks":[{"height":512,"timestamp":1793232000,"interval_secs":97,"difficulty_bits":14,…}]}',
  },
  {
    path: "/supply",
    what: "Issued and maximum supply, the premine of block 1 and the next block's subsidy, in atoms (1 ZKA = 1,000,000 atoms).",
  },
  {
    path: "/supply/total",
    what: "The issued supply in ZKA, as plain text, for listing sites.",
    example: "5006144.000000",
  },
  {
    path: "/network/history",
    what: "The explorer node's peers, height and the network's difficulty, sampled every 5 minutes for the last 24 hours.",
  },
  {
    path: "/scan?from=H&count=N",
    what: "Every encrypted output of up to 100 canonical blocks from H, for view-key scanners. Binary (postcard): zoka-pq-pool's scan::ScanPage. ZokaScan's own scanner is that code compiled to WebAssembly.",
  },
  {
    path: "/address/{short}",
    what: "The full address behind a short one (zqtest2…), if the explorer node's directory has it.",
  },
  {
    path: "/checkpoint",
    what: "The latest checkpoint signed by the network's authority (Ed25519 and ML-DSA-65).",
  },
];

const ApiDocs = () => (
  <Layout title="API">
    <section className="scan-hero">
      <div className="scan-eyebrow">API</div>
      <h1 className="scan-title">Read the chain from your own code.</h1>
      <p className="scan-lede">
        ZokaScan is a page over a Zoka node's public API: read-only, JSON, open to any origin. Everything the explorer
        shows comes from these endpoints.
      </p>
    </section>

    <div className="scan-card mt-8">
      <dl className="scan-facts">
        <dt>Base URL</dt>
        <dd className="scan-mono">{API_URL}</dd>
        <dt>Methods</dt>
        <dd>GET only. Nothing here writes, mines or signs.</dd>
        <dt>Rate</dt>
        <dd>
          20 requests a second shared by everyone, bursts of 40.{" "}
          <span className="scan-muted">A busy node answers 429 with Retry-After: wait and ask again.</span>
        </dd>
        <dt>Caching</dt>
        <dd>
          Blocks under the latest checkpoint never change and are served as immutable; the rest for a few seconds.
        </dd>
        <dt>Source</dt>
        <dd>
          <span className="scan-mono">quantic-pq-node serve --public-api</span>{" "}
          <span className="scan-muted">· run your own: any node can serve it.</span>
        </dd>
      </dl>
    </div>

    <h2 className="scan-heading">Endpoints</h2>
    <div className="scan-endpoints">
      {ENDPOINTS.map((endpoint) => (
        <article key={endpoint.path} className="scan-card scan-endpoint">
          <div className="scan-endpoint-path">
            <span className="scan-chip">GET</span>
            <code className="scan-mono">{endpoint.path}</code>
          </div>
          <p>{endpoint.what}</p>
          {endpoint.example && <pre className="scan-code">{endpoint.example}</pre>}
        </article>
      ))}
    </div>

    <h2 className="scan-heading">Example</h2>
    <pre className="scan-code">{`curl ${API_URL}/status
curl "${API_URL}/blocks/stats?count=30"
curl ${API_URL}/supply/total`}</pre>
    <p className="scan-note">
      <strong>What the API cannot tell.</strong> Balances and who paid whom: the chain does not say. A wallet's own
      balance is found with its view key, opened where the key is (see My wallet). The explorer's code is at{" "}
      <a className="scan-link" href={EXPLORER_REPO} target="_blank" rel="noopener noreferrer">
        {EXPLORER_REPO.replace("https://", "")}
      </a>
      .
    </p>
  </Layout>
);

export default ApiDocs;
