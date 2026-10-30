import { CHAIN_ID, STALE_AFTER_SECS } from "@/lib/config";
import { formatInteger, timeAgo } from "@/lib/format";
import type { Live } from "@/lib/live";
import type { NodeStatus } from "@/lib/types";

// Whether what is on screen is current, and if not, how old it is and why.
const LiveStatus = ({ status }: { status: Live<NodeStatus> }) => {
  const now = Date.now() / 1000;
  const data = status.data;
  if (!data) {
    return (
      <div className="scan-status" role="status">
        <span className="scan-dot scan-dot-off" />
        {status.loading ? "Connecting to the explorer API…" : "The explorer API does not answer yet."}
      </div>
    );
  }
  const wrongChain = data.chain_id !== CHAIN_ID;
  const quiet = now - data.tip_timestamp > STALE_AFTER_SECS;
  const dot = !status.live ? "scan-dot scan-dot-off" : quiet || wrongChain ? "scan-dot scan-dot-late" : "scan-dot";
  return (
    <>
      <div className="scan-status" role="status">
        <span className={dot} />
        <span>{status.live ? "Live" : "Offline"}</span>
        <span>Height {formatInteger(data.height)}</span>
        <span>Last block {timeAgo(data.tip_timestamp, now)}</span>
        <span>Node {data.node_version}</span>
      </div>
      {!status.live && status.savedAt && (
        <p className="scan-notice">
          The explorer API does not answer right now. This is what it showed {timeAgo(status.savedAt / 1000, now)}.
        </p>
      )}
      {status.live && quiet && (
        <p className="scan-notice">
          No block for {timeAgo(data.tip_timestamp, now).replace(" ago", "")}. The testnet runs on few miners, so a pause
          like this is possible; the difficulty drops on its own while nobody finds a block.
        </p>
      )}
      {wrongChain && (
        <p className="scan-notice">
          This API serves {data.chain_id}, not {CHAIN_ID}.
        </p>
      )}
    </>
  );
};

export default LiveStatus;
