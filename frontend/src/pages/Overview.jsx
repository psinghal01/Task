import { AnimatePresence, motion } from "framer-motion";
import { MetricCard } from "../components/MetricCard.jsx";
import { StatusDot } from "../components/StatusDot.jsx";
import { ZONES } from "../lib/constants.js";
import { formatTime } from "../lib/format.js";
import { campusAverages } from "../lib/tick.js";
import { useAppStore } from "../store/useAppStore.js";

export function Overview() {
  const liveByZone = useAppStore((s) => s.liveByZone);
  const liveEvents = useAppStore((s) => s.liveEvents);
  const lastLiveAt = useAppStore((s) => s.lastLiveAt);
  const liveConnected = useAppStore((s) => s.liveConnected);
  const liveOffline = useAppStore((s) => s.liveOffline);
  const livePaused = useAppStore((s) => s.livePaused);
  const setLivePaused = useAppStore((s) => s.setLivePaused);

  const avg = campusAverages(liveByZone);
  const liveLabel = livePaused ? "PAUSED" : liveConnected ? "LIVE" : liveOffline ? "OFFLINE" : "CONNECTING";

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-muted">Raw zone telemetry from the live campus feed.</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                liveLabel === "LIVE" ? "bg-ok" : liveLabel === "PAUSED" ? "bg-warn" : "bg-muted"
              }`}
            />
            <span className="tracking-[0.14em]">{liveLabel}</span>
          </span>
          <span className="text-muted">Last received {formatTime(lastLiveAt)}</span>
          <button
            type="button"
            onClick={() => setLivePaused(!livePaused)}
            className="border border-line px-2 py-1 text-muted hover:text-ink"
          >
            {livePaused ? "Resume" : "Pause"}
          </button>
        </div>
      </header>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Pedestrian flow" value={avg.pedestrianFlow} unit="ppl/min" hint="Campus mean" />
        <MetricCard label="Vehicle queue" value={avg.vehicleQueue} unit="vehicles" hint="Campus mean" />
        <MetricCard label="Occupancy" value={avg.occupancy} unit="%" hint={`Status ${avg.status}`} />
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-medium">Zones</h2>
        <div className="mt-3 divide-y divide-line border border-line bg-paper">
          {ZONES.map((zone) => {
            const row = liveByZone[zone];
            return (
              <div key={zone} className="grid grid-cols-2 gap-2 px-4 py-3 sm:grid-cols-5">
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm">{zone}</p>
                  <StatusDot status={row?.status || "OK"} />
                </div>
                <Cell label="Flow" value={row ? `${row.pedestrianFlow.toFixed(1)}` : "—"} />
                <Cell label="Queue" value={row ? `${row.vehicleQueue.toFixed(1)}` : "—"} />
                <Cell label="Occupancy" value={row ? `${row.occupancy.toFixed(1)}%` : "—"} />
                <Cell label="Event" value={row?.eventType || "—"} />
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-medium">Recent events</h2>
        <div className="mt-3 border border-line bg-paper">
          {liveEvents.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted">Waiting for the first live tick.</p>
          ) : (
            <ul>
              <AnimatePresence initial={false}>
                {liveEvents.slice(0, 8).map((event) => (
                  <motion.li
                    key={event.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-4 py-2.5 last:border-b-0"
                  >
                    <span className="text-sm">
                      {event.zone}
                      <span className="text-muted"> · {event.eventType}</span>
                    </span>
                    <span className="text-xs text-muted">{event.message}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function Cell({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="tabular text-sm">{value}</p>
    </div>
  );
}
