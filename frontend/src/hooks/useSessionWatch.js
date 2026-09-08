import { useEffect } from "react";
import { meRequest, resetUnauthorizedLatch, setUnauthorizedHandler } from "../api/client.js";
import { useAppStore } from "../store/useAppStore.js";

export function useSessionWatch() {
  const hydrate = useAppStore((s) => s.hydrate);
  const token = useAppStore((s) => s.token);
  const expiresAt = useAppStore((s) => s.expiresAt);
  const clearSession = useAppStore((s) => s.clearSession);
  const setSession = useAppStore((s) => s.setSession);
  const authReady = useAppStore((s) => s.authReady);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
    });
  }, [clearSession]);

  useEffect(() => {
    if (!authReady || !token) return undefined;
    let cancelled = false;
    meRequest()
      .then((data) => {
        if (cancelled) return;
        setSession({
          token,
          user: data.user,
          expiresAt: data.expiresAt,
          issuedAt: data.issuedAt,
          session: data.session,
        });
      })
      .catch((err) => {
        if (cancelled || err.code === "UNAUTHORIZED") return;
      });
    return () => {
      cancelled = true;
    };
  }, [authReady, token, setSession]);

  useEffect(() => {
    if (!expiresAt) return undefined;
    const ms = expiresAt - Date.now();
    if (ms <= 0) {
      clearSession();
      return undefined;
    }
    const id = window.setTimeout(() => {
      clearSession();
    }, ms);
    return () => window.clearTimeout(id);
  }, [expiresAt, clearSession]);

  useEffect(() => {
    if (token) resetUnauthorizedLatch();
  }, [token]);
}
