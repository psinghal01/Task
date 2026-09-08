import { useEffect, useMemo, useState } from "react";
import { fetchEvents } from "../api/client.js";
import { Modal } from "../components/Modal.jsx";
import { StatusDot } from "../components/StatusDot.jsx";
import { EVENT_TYPES, STATUSES, ZONES } from "../lib/constants.js";
import { formatDateTime, formatTime } from "../lib/format.js";
import { useAppStore } from "../store/useAppStore.js";

export function Alerts() {
  const alerts = useAppStore((s) => s.alerts);
  const lastPolledAt = useAppStore((s) => s.lastPolledAt);
  const pollError = useAppStore((s) => s.pollError);
  const occupancyThreshold = useAppStore((s) => s.occupancyThreshold);

  const [q, setQ] = useState("");
  const [zone, setZone] = useState("");
  const [status, setStatus] = useState("");
  const [eventType, setEventType] = useState("");
  const [sort, setSort] = useState("newest");
  const [events, setEvents] = useState([]);
  const [eventsError, setEventsError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchEvents({ q, zone, status, eventType, limit: 120 }, controller.signal)
      .then((data) => {
        setEvents(data.items || []);
        setEventsError("");
      })
      .catch((err) => {
        if (err.name === "AbortError" || err.code === "UNAUTHORIZED") return;
        setEventsError(err.message || "Could not load events");
      });
    return () => controller.abort();
  }, [q, zone, status, eventType]);

  const derived = useMemo(() => {
    const items = alerts?.items || [];
    return items.filter((item) => {
      if (zone && item.zone !== zone) return false;
      if (status && item.severity !== status) return false;
      if (q && !`${item.zone} ${item.reason} ${item.kind}`.toLowerCase().includes(q.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [alerts, q, zone, status]);

  const sortedEvents = useMemo(() => {
    const rows = [...events];
    rows.sort((a, b) => (sort === "oldest" ? a.ts - b.ts : b.ts - a.ts));
    return rows;
  }, [events, sort]);

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Alerts</h1>
          <p className="mt-1 text-sm text-muted">
            Threshold alerts from the periodic API, plus filterable live events.
          </p>
        </div>
        <p className="text-xs text-muted">
          Occupancy threshold {occupancyThreshold}% · last updated {formatTime(lastPolledAt)}
          {pollError ? ` · ${pollError}` : ""}
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search"
          className="w-full max-w-xs border border-line bg-paper px-3 py-2 text-sm"
        />
        <Select value={zone} onChange={setZone} options={["", ...ZONES]} labels={["All zones", ...ZONES]} />
        <Select value={status} onChange={setStatus} options={["", ...STATUSES]} labels={["All statuses", ...STATUSES]} />
        <Select
          value={eventType}
          onChange={setEventType}
          options={["", ...EVENT_TYPES]}
          labels={["All events", ...EVENT_TYPES]}
        />
        <Select
          value={sort}
          onChange={setSort}
          options={["newest", "oldest"]}
          labels={["Newest", "Oldest"]}
        />
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-medium">Derived alerts</h2>
        <div className="mt-3 border border-line bg-paper">
          {derived.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted">No derived alerts for the current filters.</p>
          ) : (
            <ul>
              {derived.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelected({ kind: "alert", item })}
                    className="flex w-full flex-wrap items-baseline justify-between gap-2 border-b border-line px-4 py-3 text-left last:border-b-0 hover:bg-bg"
                  >
                    <span className="text-sm">
                      {item.zone}
                      <span className="text-muted"> · {item.kind}</span>
                    </span>
                    <StatusDot status={item.severity} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-medium">Event log</h2>
        {eventsError ? <p className="mt-2 text-sm text-crit">{eventsError}</p> : null}
        <div className="mt-3 border border-line bg-paper">
          {sortedEvents.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted">No events match these filters.</p>
          ) : (
            <ul>
              {sortedEvents.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelected({ kind: "event", item })}
                    className="grid w-full grid-cols-2 gap-2 border-b border-line px-4 py-3 text-left last:border-b-0 hover:bg-bg sm:grid-cols-4"
                  >
                    <span className="text-sm">{item.zone}</span>
                    <span className="text-sm text-muted">{item.eventType}</span>
                    <StatusDot status={item.status} />
                    <span className="text-xs text-muted">{formatTime(item.ts)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <Modal
        open={Boolean(selected)}
        title={selected?.kind === "alert" ? "Alert detail" : "Event detail"}
        onClose={() => setSelected(null)}
      >
        {selected?.kind === "alert" ? (
          <Dl
            rows={[
              ["Zone", selected.item.zone],
              ["Severity", selected.item.severity],
              ["Kind", selected.item.kind],
              ["Reason", selected.item.reason],
              ["Value", String(selected.item.value)],
              ["Threshold", String(selected.item.threshold)],
              ["Created", formatDateTime(selected.item.createdAt)],
            ]}
          />
        ) : selected?.kind === "event" ? (
          <Dl
            rows={[
              ["Zone", selected.item.zone],
              ["Event", selected.item.eventType],
              ["Status", selected.item.status],
              ["Flow", `${selected.item.pedestrianFlow} ppl/min`],
              ["Queue", String(selected.item.vehicleQueue)],
              ["Occupancy", `${selected.item.occupancy}%`],
              ["Message", selected.item.message],
              ["Time", formatDateTime(selected.item.timestamp)],
            ]}
          />
        ) : null}
      </Modal>
    </div>
  );
}

function Select({ value, onChange, options, labels }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-line bg-paper px-3 py-2 text-sm"
    >
      {options.map((opt, i) => (
        <option key={`${opt}-${i}`} value={opt}>
          {labels[i]}
        </option>
      ))}
    </select>
  );
}

function Dl({ rows }) {
  return (
    <dl className="space-y-3 text-sm">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt className="text-xs uppercase tracking-[0.12em] text-muted">{k}</dt>
          <dd className="mt-1">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
