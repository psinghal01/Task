const buckets = new Map();

function prune(now) {
  for (const [key, hits] of buckets) {
    const next = hits.filter((t) => now - t < 10 * 60 * 1000);
    if (next.length === 0) buckets.delete(key);
    else buckets.set(key, next);
  }
}

export function loginRateLimit(req, res, next) {
  const now = Date.now();
  if (buckets.size > 500) prune(now);

  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  const hits = (buckets.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (hits.length >= 20) {
    return res.status(429).json({ error: "Too many login attempts. Try again in a few minutes." });
  }
  hits.push(now);
  buckets.set(ip, hits);
  next();
}
