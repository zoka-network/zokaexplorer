import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import { api, ApiError, isBlockHash } from "@/lib/api";
import { ADDRESS_PREFIX } from "@/lib/config";

type Outcome = { to: string } | { message: string } | null;

// What a query names: a height, a block hash or a short address. A 64-hex
// string that is not a block may be a transaction id, which the node does not
// index yet.
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
      api
        .block(q)
        .then(() => done({ to: `/block/${q.toLowerCase()}` }))
        .catch((error) =>
          done({
            message:
              error instanceof ApiError && error.status === 404
                ? "No block has this hash. If it is a transaction id, open its block: transactions are found through their block for now."
                : "The explorer API does not answer right now.",
          }),
        );
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
