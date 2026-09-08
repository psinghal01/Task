import { useEffect } from "react";
import { api } from "../api/client.js";
import { useAppStore } from "../store/useAppStore.js";
import { isValidTick } from "../lib/tick.js";

export function useLiveStream() {
  const token = useAppStore((s) => s.token);
  const livePaused = useAppStore((s) => s.livePaused);
  const applyTick = useAppStore((s) => s.applyTick);
  const setLiveStatus = useAppStore((s) => s.setLiveStatus);
  const clearSession = useAppStore((s) => s.clearSession);

  useEffect(() => {
    if (!token) return undefined;
    const controller = new AbortController();
    api("/api/dashboard/snapshot", { signal: controller.signal })
      .then((data) => {
        for (const tick of data.zones || []) applyTick(tick);
      })
      .catch((err) => {
        if (err.name === "AbortError" || err.code === "UNAUTHORIZED") return;
      });
    return () => controller.abort();
  }, [token, applyTick]);

  useEffect(() => {
    if (!token || livePaused) {
      setLiveStatus({ connected: false, offline: !token ? false : true });
      return undefined;
    }

    let ws;
    let retries = 0;
    let closedByUs = false;
    let retryTimer;
    let unauthorized = false;

    function connect() {
      const proto = window.location.protocol === "https:" ? "wss" : "ws";
      const url = `${proto}://${window.location.host}/ws/live?token=${encodeURIComponent(token)}`;
      try {
        ws = new WebSocket(url);
      } catch {
        scheduleRetry();
        return;
      }

      ws.onopen = () => {
        retries = 0;
        setLiveStatus({ connected: true, offline: false });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.type === "tick" && isValidTick(data.payload)) {
            applyTick(data.payload);
          }
        } catch {
          /* drop malformed frames */
        }
      };

      ws.onclose = (event) => {
        setLiveStatus({ connected: false, offline: !closedByUs && !unauthorized });
        if (closedByUs || unauthorized) return;
        if (event.code === 1008 || event.code === 4001) {
          unauthorized = true;
          clearSession();
          return;
        }
        scheduleRetry();
      };

      ws.onerror = () => {
        /* onclose handles retry */
      };
    }

    function scheduleRetry() {
      if (closedByUs || unauthorized || retries >= 8) return;
      const delay = Math.min(8000, 400 * 2 ** retries);
      retries += 1;
      retryTimer = window.setTimeout(connect, delay);
    }

    connect();

    return () => {
      closedByUs = true;
      window.clearTimeout(retryTimer);
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close();
      }
    };
  }, [token, livePaused, applyTick, setLiveStatus, clearSession]);
}
