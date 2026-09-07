export const ZONES = [
  "North Gate",
  "South Gate",
  "Library Plaza",
  "Sports Complex",
  "Admin Block",
];

export const EVENT_TYPES = ["ENTRY", "EXIT", "CONGESTION", "CLEAR", "INCIDENT"];
export const STATUSES = ["OK", "WARN", "CRITICAL"];

export function clamp(n, min, max) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function statusFromMetrics(occupancy, queue) {
  if (occupancy >= 90 || queue >= 18) return "CRITICAL";
  if (occupancy >= 75 || queue >= 12) return "WARN";
  return "OK";
}

export function eventFromTransition(prevStatus, nextStatus, occupancy) {
  if (nextStatus === "CRITICAL" && prevStatus !== "CRITICAL") return "INCIDENT";
  if (nextStatus === "WARN" && prevStatus === "OK") return "CONGESTION";
  if (nextStatus === "OK" && prevStatus !== "OK") return "CLEAR";
  return occupancy > 70 ? "ENTRY" : "EXIT";
}

export function isValidTick(tick) {
  if (!tick || typeof tick !== "object") return false;
  return (
    ZONES.includes(tick.zone) &&
    STATUSES.includes(tick.status) &&
    EVENT_TYPES.includes(tick.eventType) &&
    Number.isFinite(tick.pedestrianFlow) &&
    Number.isFinite(tick.vehicleQueue) &&
    Number.isFinite(tick.occupancy) &&
    Number.isFinite(tick.ts)
  );
}
