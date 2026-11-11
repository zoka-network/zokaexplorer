import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { ApiError } from "@/lib/api";
import { COINBASE_MATURITY, INCOMING_VIEW_KEY_PREFIX, VIEW_KEY_PREFIX } from "@/lib/config";
import { formatInteger, formatZka, shortHash } from "@/lib/format";
import type { WalletBalance, WalletReceipts } from "@/lib/types";
import { looksLikeViewKey, scanWallet, takeHandedOver, type ScanProgress, type WalletView } from "@/lib/viewkey";

type Row = {
  height: number;
  txid: string;
  kind: "Mined" | "Received" | "Sent";
  amount: number;
  fee: number;
  memo: string;
};

// One row per transaction: a payment of the wallet's own shows what left it
// (paid plus fee); its change is not a payment received.
function rows(balance: WalletBalance | WalletReceipts): Row[] {
  if (balance.kind === "incoming") {
    return balance.received.filter((r) => !r.change).map((r): Row => ({
      height: r.height, txid: r.txid, kind: r.coinbase ? "Mined" : "Received",
      amount: r.value, fee: 0, memo: r.memo,
    })).sort((a, b) => b.height - a.height);
  }
  const own = new Set(balance.sent.map((s) => s.txid));
  const received: Row[] = balance.received
    .filter((r) => !own.has(r.txid))
    .map((r) => ({
      height: r.height,
      txid: r.txid,
      kind: r.coinbase ? "Mined" : "Received",
      amount: r.value,
      fee: 0,
      memo: r.memo,
    }));
  const sent: Row[] = balance.sent.map((s) => ({
    height: s.height,
    txid: s.txid,
    kind: "Sent",
    amount: -(s.paid + s.fee),
    fee: s.fee,
    memo: "",
  }));
  return [...received, ...sent].sort((a, b) => b.height - a.height);
}

// Change goes out and comes back in the same transaction: neither income nor spending.
const changeOf = (balance: WalletBalance) => balance.sent.reduce((sum, s) => sum + s.change, 0);

const Figure = ({ label, atoms, hint }: { label: string; atoms: number; hint?: string }) => (
  <div className="scan-stat">
    <div className="scan-label">{label}</div>
    <div className="scan-stat-value">{formatZka(atoms)} ZKA</div>
    {hint && <div className="scan-stat-hint">{hint}</div>}
  </div>
);

const Wallet = () => {
  const [key, setKey] = useState("");
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const [view, setView] = useState<WalletView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const abort = useRef<AbortController | null>(null);

  const scan = async (text: string) => {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setError(null);
    setView(null);
    setProgress(null);
    setScanning(true);
    try {
      const result = await scanWallet(text, (next) => {
        if (!controller.signal.aborted) setProgress(next);
      }, controller.signal);
      if (!controller.signal.aborted) setView(result);
    } catch (failure) {
      if (controller.signal.aborted) return;
      setError(
        failure instanceof ApiError
          ? "The explorer API does not answer right now. Try again in a minute."
          : failure instanceof Error
            ? failure.message
            : String(failure),
      );
    } finally {
      if (abort.current === controller) setScanning(false);
    }
  };

  // A key pasted in the search box arrives here in memory.
  useEffect(() => {
    const handed = takeHandedOver();
    if (handed) {
      setKey(handed);
      void scan(handed);
    }
    return () => abort.current?.abort();
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = key.trim();
    if (!looksLikeViewKey(text)) {
      setError(`An incoming view key starts with ${INCOMING_VIEW_KEY_PREFIX}; a full view key starts with ${VIEW_KEY_PREFIX}.`);
      return;
    }
    void scan(text);
  };

  const forget = () => {
    abort.current?.abort();
    setKey("");
    setView(null);
    setProgress(null);
    setError(null);
    setScanning(false);
  };

  const balance = view?.balance;
  const history = balance ? rows(balance) : [];
  const percent = progress && progress.tip > 0 ? Math.min(100, (progress.scanned / progress.tip) * 100) : 0;

  return (
    <Layout title="My wallet">
      <section className="scan-hero">
        <div className="scan-eyebrow">My wallet</div>
        <h1 className="scan-title">Your payments, read in your browser.</h1>
        <p className="scan-lede">
          Paste your wallet's view key. ZokaScan downloads the chain's encrypted outputs, the same pages for every
          visitor, and opens them here. The key never leaves this page, and it cannot spend.
          {" "}An incoming view key shows receipts; a full view key also shows outgoing payments and balance.
        </p>
        <form className="scan-keyform" onSubmit={submit}>
          <label className="scan-label" htmlFor="view-key">
            View key
          </label>
          <textarea
            id="view-key"
            value={key}
            onChange={(event) => setKey(event.target.value)}
            placeholder={`${INCOMING_VIEW_KEY_PREFIX}… or ${VIEW_KEY_PREFIX}…`}
            rows={3}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            data-1p-ignore
            data-lpignore="true"
          />
          <div className="scan-keyform-actions">
            <button type="submit" className="scan-button" disabled={scanning || !key.trim()}>
              {scanning ? "Scanning…" : "Scan"}
            </button>
            {(key || view) && (
              <button type="button" className="scan-button scan-button-quiet" onClick={forget}>
                Forget the key
              </button>
            )}
          </div>
        </form>
        {scanning && (
          <div className="scan-progress" role="status" aria-live="polite">
            <div className="scan-progress-bar">
              <span style={{ width: `${percent}%` }} />
            </div>
            <span>
              {progress
                ? `Block ${formatInteger(progress.scanned)} of ${formatInteger(progress.tip)}`
                : "Loading the scanner…"}
            </span>
          </div>
        )}
        {error && <p className="scan-notice">{error}</p>}
      </section>

      {view && balance && (
        <>
          <div className="scan-card mt-10">
            <div className="scan-card-head">
              <span className="scan-label">Address</span>
              <span className="scan-muted text-xs">scanned up to block #{formatInteger(balance.height)}</span>
            </div>
            <p className="scan-mono p-5">
              <Link className="scan-link" to={`/address/${view.address}`}>
                {view.address}
              </Link>
            </p>
          </div>
          <div className="scan-stats">
            {balance.kind === "full" ? <>
            <Figure label="Balance" atoms={balance.balance_atoms} hint="Everything this wallet holds" />
            <Figure label="Spendable" atoms={balance.spendable_atoms} hint="What it can send now" />
            <Figure
              label="Immature"
              atoms={balance.immature_atoms}
              hint={`Mined rewards wait ${COINBASE_MATURITY} blocks`}
            />
            <div className="scan-stat">
              <div className="scan-label">Payments</div>
              <div className="scan-stat-value">{formatInteger(history.length)}</div>
              <div className="scan-stat-hint">
                {formatZka(balance.received_atoms - changeOf(balance))} ZKA in, {formatZka(balance.sent_atoms - changeOf(balance))} ZKA
                out
              </div>
            </div>
            </> : <>
              <Figure label="Total received" atoms={balance.received_atoms} hint="Receipts over time, excluding marked change" />
              <Figure label="Immature rewards" atoms={balance.immature_atoms} hint={`Mined rewards wait ${COINBASE_MATURITY} blocks`} />
              <Figure label="Marked change" atoms={balance.change_atoms} hint="Returned to this wallet; excluded from receipts" />
              <div className="scan-stat">
                <div className="scan-label">Received payments</div>
                <div className="scan-stat-value">{formatInteger(history.length)}</div>
                <div className="scan-stat-hint">Incoming view key</div>
              </div>
            </>}
          </div>
          {balance.kind === "incoming" && <p className="scan-note">
            This key cannot show the balance or outgoing payments. Change from older wallets is unmarked and may appear
            as a received payment, so the total received may include older change.
          </p>}

          <h2 className="scan-heading">{balance.kind === "incoming" ? "Received payments" : "History"}</h2>
          <div className="scan-card scan-scroll">
            <table className="scan-table">
              <thead>
                <tr>
                  <th>Block</th>
                  <th>Type</th>
                  <th className="num">Amount</th>
                  <th className="num">Fee</th>
                  <th>Memo</th>
                  <th>Transaction</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, index) => (
                  <tr key={`${row.txid}-${index}`}>
                    <td>
                      <Link className="scan-link" to={`/block/${row.height}`}>
                        #{formatInteger(row.height)}
                      </Link>
                    </td>
                    <td>
                      <span className={`scan-chip ${row.kind === "Sent" ? "" : "scan-chip-pink"}`}>{row.kind}</span>
                    </td>
                    <td className="num">
                      {row.amount < 0 ? "−" : "+"}
                      {formatZka(Math.abs(row.amount))} ZKA
                    </td>
                    <td className="num scan-muted">{row.fee ? formatZka(row.fee) : "—"}</td>
                    <td className="scan-muted scan-memo">{row.memo || "—"}</td>
                    <td className="scan-mono">
                      <Link className="scan-link" to={`/tx/${row.txid}?block=${row.height}`}>
                        {shortHash(row.txid)}
                      </Link>
                    </td>
                  </tr>
                ))}
                {!history.length && (
                  <tr>
                    <td colSpan={6} className="scan-muted">
                      No payments for this wallet yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2 className="scan-heading">Where to find your view key</h2>
      <div className="scan-card p-5 text-sm leading-relaxed text-[#cfc7d3]">
        <p>
          Open View keys in your wallet's settings. Choose Incoming payments only to share receipts, or Full history and
          balance when you need to see spending too. Your wallet derives both automatically from the same recovery words.
        </p>
        <pre className="scan-code mt-3">
          zoka quantic-pq-wallet show-view-key --network testnet --dir &lt;wallets folder&gt; --name &lt;wallet&gt; --incoming
        </pre>
        <p className="mt-3">
          With the command-line wallet, use the command above for an incoming key. Omit --incoming for a full key.
        </p>
      </div>
      <p className="scan-note">
        <strong>Choose how much to share.</strong> An incoming key reveals received payments and memos, past and future.
        A full key also reveals outgoing payments and the balance. Neither can spend: spending needs the recovery phrase. A view key
        cannot be revoked; if one leaks, send the coins to a new wallet.
      </p>
      <p className="scan-note">
        <strong>What the explorer's node sees.</strong> That this browser downloaded the scan pages, the same ones every
        visitor downloads. Not the key, not the address, not which outputs are yours: they are opened here, by
        WebAssembly built from the same code as the node and the wallets.
      </p>
    </Layout>
  );
};

export default Wallet;
