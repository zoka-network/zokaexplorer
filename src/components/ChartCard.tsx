import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_INK } from "@/lib/config";

export interface ChartPoint {
  x: number;
  y: number;
}

interface Props {
  title: string;
  hint: string;
  data: ChartPoint[];
  kind: "line" | "bar";
  /** Column names of the table view. */
  xName: string;
  yName: string;
  formatX: (x: number) => string;
  formatY: (y: number) => string;
  /** A labelled hairline, such as the target block time. */
  reference?: { y: number; label: string };
  step?: boolean;
  /** Held at reduced opacity while a new range loads. */
  stale?: boolean;
}

const AXIS = { fill: "#8d8492", fontSize: 10 };
const GRID = "#1d1a20";

// One series per chart: its title names it, so no legend. Every chart has a
// table twin, so that no value is reachable only by hovering.
const ChartCard = ({ title, hint, data, kind, xName, yName, formatX, formatY, reference, step, stale }: Props) => {
  const [table, setTable] = useState(false);
  const tooltip = (
    <Tooltip
      cursor={kind === "line" ? { stroke: "#5a4f60", strokeWidth: 1 } : { fill: "#f2abd00d" }}
      contentStyle={{ background: "#0a0709", border: "1px solid #302a33", fontSize: 12, color: "#e6e0e8" }}
      labelFormatter={(x) => formatX(Number(x))}
      formatter={(y) => [formatY(Number(y)), yName]}
    />
  );
  const axes = (
    <>
      <CartesianGrid vertical={false} stroke={GRID} />
      <XAxis
        dataKey="x"
        tick={AXIS}
        axisLine={{ stroke: "#302a33" }}
        tickLine={false}
        tickFormatter={(x) => formatX(Number(x))}
        minTickGap={28}
      />
      <YAxis tick={AXIS} axisLine={false} tickLine={false} width={64} tickFormatter={(y) => formatY(Number(y))} />
      {reference && (
        <ReferenceLine
          y={reference.y}
          stroke="#8d8492"
          strokeWidth={1}
          label={{ value: reference.label, position: "insideTopLeft", fill: "#a49aa8", fontSize: 10 }}
        />
      )}
    </>
  );
  return (
    <figure className="scan-card scan-chart" style={{ opacity: stale ? 0.55 : 1 }}>
      <figcaption className="scan-card-head">
        <div>
          <div className="scan-label">{title}</div>
          <div className="scan-stat-hint">{hint}</div>
        </div>
        <button type="button" className="scan-toggle" onClick={() => setTable(!table)} aria-pressed={table}>
          {table ? "Chart" : "Table"}
        </button>
      </figcaption>
      {table ? (
        <div className="scan-chart-table">
          <table className="scan-table">
            <thead>
              <tr>
                <th>{xName}</th>
                <th className="num">{yName}</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((point) => (
                <tr key={point.x}>
                  <td>{formatX(point.x)}</td>
                  <td className="num">{formatY(point.y)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="scan-chart-plot">
          {data.length < 2 ? (
            <p className="scan-muted p-5 text-sm">Not enough data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {kind === "line" ? (
                <LineChart data={data} margin={{ top: 14, right: 16, bottom: 4, left: 0 }}>
                  {axes}
                  {tooltip}
                  <Line
                    type={step ? "stepAfter" : "monotone"}
                    dataKey="y"
                    stroke={CHART_INK}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: CHART_INK, stroke: "#000", strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              ) : (
                <BarChart data={data} margin={{ top: 14, right: 16, bottom: 4, left: 0 }} barCategoryGap={2}>
                  {axes}
                  {tooltip}
                  <Bar dataKey="y" fill={CHART_INK} radius={[2, 2, 0, 0]} isAnimationActive={false} />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      )}
    </figure>
  );
};

export default ChartCard;
