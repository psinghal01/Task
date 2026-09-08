import { useEffect } from "react";
import { fetchAlerts, fetchSummary } from "../api/client.js";
import { useAppStore } from "../store/useAppStore.js";

export function usePeriodic() {
  const token = useAppStore((s) => s.token);
  const pollInterval = useAppStore((s) => s.pollInterval);
  const occupancyThreshold = useAppStore((s) => s.occupancyThreshold);
  const setPeriodic = useAppStore((s) => s.setPeriodic);

  useEffect(() => {
    if (!token) return undefined;

    let cancelled = false;
    let inFlight = false;
    let controller;

    async function pull() {
      if (inFlight) return;
      inFlight = true;
      controller = new AbortController();
      try {
        const [summary, alerts] = await Promise.all([
          fetchSummary(controller.signal),
          fetchAlerts(occupancyThreshold, controller.signal),
        ]);
        if (!cancelled) setPeriodic({ summary, alerts });
      } catch (err) {
        if (err.name === "AbortError" || cancelled) return;
        if (err.code === "UNAUTHORIZED") return;
        setPeriodic({ error: err.message || "Refresh failed" });
      } finally {
        inFlight = false;
      }
    }

    pull();
    const id = window.setInterval(pull, pollInterval * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      controller?.abort();
    };
  }, [token, pollInterval, occupancyThreshold, setPeriodic]);
}
