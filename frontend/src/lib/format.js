export function formatTime(value) {
  if (!value) return "—";
  const d = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatNumber(n, digits = 1) {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}

export function signed(n) {
  if (!Number.isFinite(n)) return "—";
  const v = n.toFixed(1);
  return n > 0 ? `+${v}` : v;
}

export function remaining(expiresAt) {
  if (!expiresAt) return "—";
  const ms = expiresAt - Date.now();
  if (ms <= 0) return "expired";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${String(s).padStart(2, "0")}s`;
}
