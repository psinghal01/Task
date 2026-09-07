import { ZONES, clamp, eventFromTransition, statusFromMetrics } from "./campus.js";
import { pushTick } from "./store.js";

const zoneState = new Map();

function seed() {
  for (const zone of ZONES) {
    zoneState.set(zone, {
      pedestrianFlow: 18 + Math.random() * 22,
      vehicleQueue: 3 + Math.random() * 8,
      occupancy: 40 + Math.random() * 30,
      status: "OK",
    });
  }
}

function walk(value, step, min, max) {
  return clamp(value + (Math.random() - 0.48) * step, min, max);
}

export function createTick() {
  const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
  const prev = zoneState.get(zone);
  const pedestrianFlow = Number(walk(prev.pedestrianFlow, 6, 2, 80).toFixed(1));
  const vehicleQueue = Number(walk(prev.vehicleQueue, 3, 0, 28).toFixed(1));
  const occupancy = Number(walk(prev.occupancy, 5, 8, 99).toFixed(1));
  const status = statusFromMetrics(occupancy, vehicleQueue);
  const eventType = eventFromTransition(prev.status, status, occupancy);

  const tick = {
    id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    zone,
    pedestrianFlow,
    vehicleQueue,
    occupancy,
    status,
    eventType,
    message: messageFor(zone, eventType, occupancy, vehicleQueue),
    timestamp: new Date().toISOString(),
    ts: Date.now(),
  };

  zoneState.set(zone, { pedestrianFlow, vehicleQueue, occupancy, status });
  pushTick(tick);
  return tick;
}

function messageFor(zone, eventType, occupancy, queue) {
  switch (eventType) {
    case "INCIDENT":
      return `${zone}: occupancy ${occupancy}% — incident threshold reached`;
    case "CONGESTION":
      return `${zone}: queue ${queue} — congestion forming`;
    case "CLEAR":
      return `${zone}: flow normalized`;
    case "ENTRY":
      return `${zone}: inbound pedestrian pulse`;
    default:
      return `${zone}: outbound movement`;
  }
}

seed();
