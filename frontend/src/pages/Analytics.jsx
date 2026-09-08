import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber, formatTime, signed } from "../lib/format.js";
import { useAppStore } from "../store/useAppStore.js";

export function Analytics() {
  const summary = useAppStore((s) => s.summary);
  const lastPolledAt = useAppStore((s) => s.lastPolledAt);
  const pollError = useAppStore((s) => s.pollError);
  const pollInterval = useAppStore((s) => s.pollInterval);

  const history = (summary?.history || []).map((row) => ({
    ...row,
    label: formatTime(row.t),
  }));

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted">
            15-minute aggregates and trend deltas — not the raw live feed.
          </p>
        </div>
        <p className="text-xs text-muted">
          Last updated {formatTime(lastPolledAt)} · every {pollInterval}s
          {pollError ? ` · ${pollError}` : ""}
        </p>
      </header>

      {!summary ? (
        <p className="mt-10 text-sm text-muted">Loading the first periodic window…</p>
      ) : (
        <>
          <section className="mt-8 grid gap-3 sm:grid-cols-3">
            <Stat
              label="Avg occupancy"
              value={`${formatNumber(summary.campus.avgOccupancy)}%`}
              delta={summary.campus.deltaOccupancy}
            />
            <Stat
              label="Avg flow"
              value={formatNumber(summary.campus.avgFlow)}
              unit="ppl/min"
              delta={summary.campus.deltaFlow}
            />
            <Stat
              label="Avg queue"
              value={formatNumber(summary.campus.avgQueue)}
              unit="vehicles"
              delta={summary.campus.deltaQueue}
            />
          </section>

          <section className="mt-10 border border-line bg-paper px-4 py-4">
            <h2 className="text-sm font-medium">One-minute campus trend</h2>
            {history.every((h) => h.avgOccupancy === 0 && h.avgFlow === 0) ? (
              <p className="mt-6 text-sm text-muted">Not enough samples in this window yet.</p>
            ) : (
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="var(--line)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--paper)",
                        border: "1px solid var(--line)",
                        borderRadius: 0,
                        fontSize: 12,
                      }}
                    />
                    <Line type="monotone" dataKey="avgOccupancy" name="Occupancy" stroke="var(--ink)" dot={false} strokeWidth={1.25} />
                    <Line type="monotone" dataKey="avgFlow" name="Flow" stroke="var(--muted)" dot={false} strokeWidth={1.25} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="mt-10 overflow-x-auto">
            <h2 className="text-sm font-medium">Zone window</h2>
            <table className="mt-3 w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-[0.12em] text-muted">
                  <th className="py-2 font-normal">Zone</th>
                  <th className="py-2 font-normal">Occupancy</th>
                  <th className="py-2 font-normal">Δ occ.</th>
                  <th className="py-2 font-normal">Flow</th>
                  <th className="py-2 font-normal">Δ flow</th>
                  <th className="py-2 font-normal">Queue</th>
                  <th className="py-2 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.zones.map((z) => (
                  <tr key={z.zone} className="border-b border-line">
                    <td className="py-2.5">{z.zone}</td>
                    <td className="tabular py-2.5">{formatNumber(z.avgOccupancy)}%</td>
                    <td className="tabular py-2.5">{signed(z.deltaOccupancy)}</td>
                    <td className="tabular py-2.5">{formatNumber(z.avgFlow)}</td>
                    <td className="tabular py-2.5">{signed(z.deltaFlow)}</td>
                    <td className="tabular py-2.5">{formatNumber(z.avgQueue)}</td>
                    <td className="py-2.5 text-muted">{z.dominantStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, unit, delta }) {
  return (
    <article className="border border-line bg-paper px-5 py-4">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-3 tabular text-3xl font-medium tracking-tight">
        {value}
        {unit ? <span className="ml-1 text-sm font-normal text-muted">{unit}</span> : null}
      </p>
      <p className="mt-2 text-xs text-muted">vs previous window {signed(delta)}</p>
    </article>
  );
}
