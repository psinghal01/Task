import { formatNumber } from "../lib/format.js";

export function MetricCard({ label, value, unit, hint }) {
  return (
    <article className="border border-line bg-paper px-5 py-4">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-3 tabular text-3xl font-medium tracking-tight">
        {formatNumber(value)}
        {unit ? <span className="ml-1 text-sm font-normal text-muted">{unit}</span> : null}
      </p>
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </article>
  );
}
