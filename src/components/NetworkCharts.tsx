import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ChartCard, { type ChartPoint } from "@/components/ChartCard";
import { api } from "@/lib/api";
import { TARGET_BLOCK_SECS } from "@/lib/config";
import { formatClock, formatDuration, formatHashrate, formatInteger } from "@/lib/format";
import type { BlockStat } from "@/lib/types";

const RANGES = [
  { blocks: 180, label: "180 blocks · ~6 h" },
  { blocks: 720, label: "720 blocks · ~24 h" },
];

const series = (blocks: BlockStat[], pick: (b: BlockStat) => number | null): ChartPoint[] =>
  blocks.flatMap((b) => {
    const y = pick(b);
    return y === null ? [] : [{ x: b.height, y }];
  });

const block = (height: number) => `#${formatInteger(height)}`;

// The chain's work over its last blocks, and the explorer node's peers over
// the last day. One range control scopes every block chart.
const NetworkCharts = () => {
  const [range, setRange] = useState(RANGES[0].blocks);
  const stats = useQuery({
    queryKey: ["stats", range],
    queryFn: () => api.stats(range),
    refetchInterval: 60_000,
    placeholderData: keepPreviousData,
  });
  const history = useQuery({ queryKey: ["history"], queryFn: api.history, refetchInterval: 300_000 });
  const blocks = stats.data?.blocks ?? [];
  const samples = history.data?.samples ?? [];
  const stale = stats.isPlaceholderData;

  return (
    <>
      <div className="scan-chart-head">
        <h2 className="scan-heading">Charts</h2>
        <div className="scan-segmented" role="group" aria-label="Range of the block charts">
          {RANGES.map((option) => (
            <button
              key={option.blocks}
              type="button"
              aria-pressed={range === option.blocks}
              onClick={() => setRange(option.blocks)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {stats.isError && !blocks.length && <p className="scan-notice">The explorer API does not answer right now.</p>}
      <div className="scan-charts">
        <ChartCard
          title="Network hashrate"
          hint="Estimated from the difficulty each block met"
          kind="line"
          step
          data={series(blocks, (b) => b.hashrate_estimate_hps)}
          xName="Block"
          yName="Hashrate"
          formatX={block}
          formatY={formatHashrate}
          stale={stale}
        />
        <ChartCard
          title="Difficulty"
          hint="Leading zero bits of the block's target (ASERT)"
          kind="line"
          step
          data={series(blocks, (b) => b.difficulty_bits)}
          xName="Block"
          yName="Bits"
          formatX={block}
          formatY={(bits) => `${bits} bits`}
          stale={stale}
        />
        <ChartCard
          title="Time between blocks"
          hint={`Seconds after the previous block; the target is ${TARGET_BLOCK_SECS}`}
          kind="bar"
          data={series(blocks, (b) => b.interval_secs)}
          xName="Block"
          yName="Interval"
          formatX={block}
          formatY={formatDuration}
          reference={{ y: TARGET_BLOCK_SECS, label: `target ${TARGET_BLOCK_SECS}s` }}
          stale={stale}
        />
        <ChartCard
          title="Transactions per block"
          hint="The coinbase plus private transfers"
          kind="line"
          step
          data={series(blocks, (b) => b.transactions)}
          xName="Block"
          yName="Transactions"
          formatX={block}
          formatY={(n) => formatInteger(n)}
          stale={stale}
        />
        <ChartCard
          title="Peers of the explorer node"
          hint="Outbound plus inbound sessions, sampled every 5 minutes for 24 hours"
          kind="line"
          step
          data={samples.map((s) => ({ x: s.time, y: s.outbound + s.inbound }))}
          xName="Time"
          yName="Peers"
          formatX={formatClock}
          formatY={(n) => formatInteger(n)}
        />
        <ChartCard
          title="Height seen by the explorer node"
          hint="Its chain tip at each sample: a flat stretch means no new blocks"
          kind="line"
          data={samples.map((s) => ({ x: s.time, y: s.height }))}
          xName="Time"
          yName="Height"
          formatX={formatClock}
          formatY={(n) => formatInteger(n)}
        />
      </div>
    </>
  );
};

export default NetworkCharts;
