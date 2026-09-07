import { config } from "../config.js";

const ticks = [];

export function pushTick(tick) {
  ticks.push(tick);
  if (ticks.length > config.bufferMax) {
    ticks.splice(0, ticks.length - config.bufferMax);
  }
}

export function recentTicks(limit = 80) {
  const n = clampInt(limit, 1, 200);
  return ticks.slice(-n);
}

export function ticksInRange(fromTs, toTs) {
  return ticks.filter((t) => t.ts >= fromTs && t.ts < toTs);
}

export function latestByZone() {
  const map = new Map();
  for (let i = ticks.length - 1; i >= 0; i -= 1) {
    const tick = ticks[i];
    if (!map.has(tick.zone)) map.set(tick.zone, tick);
    if (map.size === 5) break;
  }
  return [...map.values()];
}

function clampInt(n, min, max) {
  const v = Number.parseInt(n, 10);
  if (!Number.isFinite(v)) return min;
  return Math.min(max, Math.max(min, v));
}
