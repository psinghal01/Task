import { Router } from "express";
import { EVENT_TYPES, STATUSES, ZONES } from "../data/campus.js";
import { buildAlerts, buildSummary } from "../data/aggregates.js";
import { latestByZone, recentTicks } from "../data/store.js";
import { requireAuth } from "../auth/middleware.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get("/summary", (_req, res) => {
  res.json(buildSummary());
});

dashboardRouter.get("/alerts", (req, res) => {
  const threshold = req.query.threshold;
  res.json(buildAlerts(threshold));
});

dashboardRouter.get("/events", (req, res) => {
  const zone = typeof req.query.zone === "string" ? req.query.zone : "";
  const status = typeof req.query.status === "string" ? req.query.status : "";
  const eventType = typeof req.query.eventType === "string" ? req.query.eventType : "";
  const q = typeof req.query.q === "string" ? req.query.q.trim().toLowerCase() : "";
  const limit = req.query.limit;

  if (zone && !ZONES.includes(zone)) {
    return res.status(400).json({ error: "Unknown zone" });
  }
  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ error: "Unknown status" });
  }
  if (eventType && !EVENT_TYPES.includes(eventType)) {
    return res.status(400).json({ error: "Unknown event type" });
  }

  let rows = recentTicks(limit);
  if (zone) rows = rows.filter((r) => r.zone === zone);
  if (status) rows = rows.filter((r) => r.status === status);
  if (eventType) rows = rows.filter((r) => r.eventType === eventType);
  if (q) {
    rows = rows.filter(
      (r) =>
        r.zone.toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q) ||
        r.eventType.toLowerCase().includes(q)
    );
  }

  res.json({
    generatedAt: new Date().toISOString(),
    count: rows.length,
    items: rows.slice().reverse(),
  });
});

dashboardRouter.get("/snapshot", (_req, res) => {
  res.json({
    generatedAt: new Date().toISOString(),
    zones: latestByZone(),
  });
});
