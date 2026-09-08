import { EVENT_TYPES, STATUSES, ZONES } from "./constants.js";

export function isValidTick(tick) {
  if (!tick || typeof tick !== "object") return false;
  return (
    ZONES.includes(tick.zone) &&
    STATUSES.includes(tick.status) &&
    EVENT_TYPES.includes(tick.eventType) &&
    Number.isFinite(tick.pedestrianFlow) &&
    Number.isFinite(tick.vehicleQueue) &&
    Number.isFinite(tick.occupancy)
  );
}

export function campusAverages(byZone) {
  const rows = Object.values(byZone || {});
  if (!rows.length) {
    return { pedestrianFlow: 0, vehicleQueue: 0, occupancy: 0, status: "OK" };
  }
  const sum = rows.reduce(
    (acc, r) => ({
      pedestrianFlow: acc.pedestrianFlow + r.pedestrianFlow,
      vehicleQueue: acc.vehicleQueue + r.vehicleQueue,
      occupancy: acc.occupancy + r.occupancy,
    }),
    { pedestrianFlow: 0, vehicleQueue: 0, occupancy: 0 }
  );
  const n = rows.length;
  const occupancy = sum.occupancy / n;
  const vehicleQueue = sum.vehicleQueue / n;
  let status = "OK";
  if (occupancy >= 90 || vehicleQueue >= 18) status = "CRITICAL";
  else if (occupancy >= 75 || vehicleQueue >= 12) status = "WARN";
  return {
    pedestrianFlow: sum.pedestrianFlow / n,
    vehicleQueue,
    occupancy,
    status,
  };
}
