const colors = {
  OK: "bg-ok",
  WARN: "bg-warn",
  CRITICAL: "bg-crit",
};

export function StatusDot({ status = "OK", label = true }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs tracking-wide">
      <span className={`h-1.5 w-1.5 rounded-full ${colors[status] || colors.OK}`} />
      {label ? <span className="text-muted">{status}</span> : null}
    </span>
  );
}
