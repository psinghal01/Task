import { ZONES, clamp } from "./campus.js";
import { ticksInRange } from "./store.js";
import { config } from "../config.js";

function avg(rows, key) {
  if (!rows.length) return 0;
  return Number((rows.reduce((s, r) => s + r[key], 0) / rows.length).toFixed(1));
}

function mode(rows, key) {
  if (!rows.length) return "OK";
  const counts = {};
  for (const row of rows) counts[row[key]] = (counts[row[key]] || 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function zoneStats(rows, prevRows, zone) {
  const cur = rows.filter((r) => r.zone === zone);
  const prev = prevRows.filter((r) => r.zone === zone);
  const avgFlow = avg(cur, "pedestrianFlow");
  const avgQueue = avg(cur, "vehicleQueue");
  const avgOccupancy = avg(cur, "occupancy");
  return {
    zone,
    sampleCount: cur.length,
    avgFlow,
    avgQueue,
    avgOccupancy,
    dominantStatus: mode(cur, "status"),
    deltaFlow: Number((avgFlow - avg(prev, "pedestrianFlow")).toFixed(1)),
    deltaQueue: Number((avgQueue - avg(prev, "vehicleQueue")).toFixed(1)),
    deltaOccupancy: Number((avgOccupancy - avg(prev, "occupancy")).toFixed(1)),
  };
}

export function buildSummary() {
  const now = Date.now();
  const current = ticksInRange(now - config.windowMs, now);
  const previous = ticksInRange(now - 2 * config.windowMs, now - config.windowMs);
  const zones = ZONES.map((zone) => zoneStats(current, previous, zone));

  const campusAvg = (key) =>
    Number((zones.reduce((s, z) => s + z[key], 0) / zones.length).toFixed(1));

  const bucketMs = 60 * 1000;
  const history = [];
  for (let i = 11; i >= 0; i -= 1) {
    const to = now - i * bucketMs;
    const from = to - bucketMs;
    const slice = ticksInRange(from, to);
    history.push({
      t: new Date(to).toISOString(),
      avgOccupancy: avg(slice, "occupancy"),
      avgFlow: avg(slice, "pedestrianFlow"),
      avgQueue: avg(slice, "vehicleQueue"),
    });
  }

  return {
    windowMinutes: 15,
    generatedAt: new Date(now).toISOString(),
    sampleCount: current.length,
    campus: {
      avgFlow: campusAvg("avgFlow"),
      avgQueue: campusAvg("avgQueue"),
      avgOccupancy: campusAvg("avgOccupancy"),
      deltaFlow: campusAvg("deltaFlow"),
      deltaQueue: campusAvg("deltaQueue"),
      deltaOccupancy: campusAvg("deltaOccupancy"),
    },
    zones,
    history,
  };
}

export function buildAlerts(threshold = 85) {
  const occupancyThreshold = clamp(Number(threshold) || 85, 50, 99);
  const now = Date.now();
  const current = ticksInRange(now - config.windowMs, now);
  const latest = new Map();
  for (let i = current.length - 1; i >= 0; i -= 1) {
    const tick = current[i];
    if (!latest.has(tick.zone)) latest.set(tick.zone, tick);
  }

  const items = [];
  for (const zone of ZONES) {
    const tick = latest.get(zone);
    if (!tick) continue;
    if (tick.occupancy >= occupancyThreshold) {
      items.push({
        id: `alert-occ-${zone}`,
        zone,
        severity: tick.occupancy >= 90 ? "CRITICAL" : "WARN",
        kind: "OCCUPANCY",
        reason: `Average-window occupancy ${tick.occupancy}% exceeds ${occupancyThreshold}%`,
        value: tick.occupancy,
        threshold: occupancyThreshold,
        createdAt: tick.timestamp,
      });
    }
    if (tick.vehicleQueue >= 12) {
      items.push({
        id: `alert-queue-${zone}`,
        zone,
        severity: tick.vehicleQueue >= 18 ? "CRITICAL" : "WARN",
        kind: "QUEUE",
        reason: `Vehicle queue ${tick.vehicleQueue} above derived threshold`,
        value: tick.vehicleQueue,
        threshold: 12,
        createdAt: tick.timestamp,
      });
    }
  }

  items.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === "CRITICAL" ? -1 : 1;
    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });

  return {
    generatedAt: new Date(now).toISOString(),
    occupancyThreshold,
    items,
  };
}
