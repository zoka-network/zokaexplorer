import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import Copy from "@/components/Copy";
import Layout from "@/components/Layout";
import { api, ApiError } from "@/lib/api";
import { ZSILENT_RELEASES } from "@/lib/config";

// A short address resolves to the full one that wallets pay. Balances and
// history are not on the chain to show: payments are sealed for the recipient.
const AddressDetail = () => {
  const { address = "" } = useParams();
  const lookup = useQuery({ queryKey: ["address", address], queryFn: () => api.address(address), retry: false });
  const status = lookup.error instanceof ApiError ? lookup.error.status : 0;

  return (
    <Layout title="Address">
      <section className="scan-hero">
        <div className="scan-eyebrow">Short address</div>
        <h1 className="scan-title scan-mono" style={{ fontSize: "clamp(16px, 2.4vw, 26px)", letterSpacing: 0 }}>
          {address}
          <Copy value={address} label="Copy the short address" />
        </h1>
        {lookup.data && <p className="scan-lede">Published in the nodes' directory: wallets can pay it.</p>}
        {status === 404 && (
          <p className="scan-notice">
            The explorer node does not know this short address. Its owner has to connect their wallet so it gets
            published; until then, only the full address can be paid.
          </p>
        )}
        {status === 422 && <p className="scan-notice">This is not a short address of Zoka Quantic Testnet v2.</p>}
        {lookup.isError && status !== 404 && status !== 422 && (
          <p className="scan-notice">The explorer API does not answer right now.</p>
        )}
      </section>

      {lookup.data && (
        <div className="scan-card mt-8">
          <div className="scan-card-head">
            <span className="scan-label">Full address</span>
            <Copy value={lookup.data.address} label="Copy the full address" />
          </div>
          <p className="scan-mono p-5 leading-relaxed text-[#cfc7d3]">{lookup.data.address}</p>
        </div>
      )}

      <p className="scan-note">
        <strong>No balance, no history.</strong> A Zoka Quantic payment is a note sealed for its recipient with X-Wing,
        and the chain never says which address received it. Only the owner's wallet can find its payments and add
        them up. To see yours, open your wallet in{" "}
        <a className="scan-link" href={ZSILENT_RELEASES} target="_blank" rel="noopener noreferrer">
          ZSilent
        </a>
        .
      </p>
    </Layout>
  );
};

export default AddressDetail;
