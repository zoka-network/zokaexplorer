import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import { api, ApiError, isBlockHash } from "@/lib/api";
import { ADDRESS_PREFIX } from "@/lib/config";

type Outcome = { to: string } | { message: string } | null;

// What a query names: a height, a block hash, a payment id or a short address.
// A 64-hex string that is not a block is looked up as a payment: the node finds
// it in its mempool or in its last 720 blocks.
const Search = () => {
  const { query = "" } = useParams();
  const q = decodeURIComponent(query).trim();
  const [outcome, setOutcome] = useState<Outcome>(null);

  useEffect(() => {
    let cancelled = false;
    const done = (value: Outcome) => !cancelled && setOutcome(value);
    setOutcome(null);
    if (/^#?\d{1,12}$/.test(q)) {
      done({ to: `/block/${q.replace("#", "")}` });
    } else if (q.startsWith(ADDRESS_PREFIX) && q.length <= 64) {
      done({ to: `/address/${q}` });
    } else if (q.startsWith(ADDRESS_PREFIX)) {
      done({
        message:
          "That is a full address. Search its short form (57 characters, zqtest2…), the one wallets show and share.",
      });
    } else if (isBlockHash(q)) {
      const silent = "The explorer API does not answer right now.";
      api
        .block(q)
        .then(() => done({ to: `/block/${q.toLowerCase()}` }))
        .catch((error) => {
          if (!(error instanceof ApiError && error.status === 404)) return done({ message: silent });
          return api
            .transaction(q)
            .then((payment) =>
              done(
                payment.status === "confirmed" && payment.height
                  ? { to: `/block/${payment.height}` }
                  : {
                      message:
                        "This payment is in the mempool: the network accepted it and no block has taken it yet. Amounts and parties stay private.",
                    },
              ),
            )
            .catch((lookup) =>
              done({
                message:
                  lookup instanceof ApiError && lookup.status === 404
                    ? "No block has this hash, and no payment with this id is waiting or was mined in the last 720 blocks (about a day)."
                    : silent,
              }),
            );
        });
    } else {
      done({ message: "Search a block height, a block hash (64 hex characters) or a short address (zqtest2…)." });
    }
    return () => {
      cancelled = true;
    };
  }, [q]);

  if (outcome && "to" in outcome) return <Navigate to={outcome.to} replace />;
  return (
    <Layout title="Search">
      <section className="scan-hero">
        <div className="scan-eyebrow">Search</div>
        <h1 className="scan-title scan-mono" style={{ fontSize: "clamp(16px, 2.4vw, 26px)", letterSpacing: 0 }}>
          {q}
        </h1>
        {outcome && "message" in outcome && <p className="scan-notice">{outcome.message}</p>}
        <SearchBar autoFocus />
      </section>
    </Layout>
  );
};

export default Search;
