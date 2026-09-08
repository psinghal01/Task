import { useAppStore } from "../store/useAppStore.js";

let onUnauthorized = () => {};
let redirecting = false;

export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

export function resetUnauthorizedLatch() {
  redirecting = false;
}

export async function api(path, { method = "GET", body, signal, auth = true } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = useAppStore.getState().token;
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    const e = new Error("Network unavailable");
    e.code = "NETWORK";
    throw e;
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && auth) {
    if (!redirecting) {
      redirecting = true;
      onUnauthorized(data.code);
    }
    const e = new Error(data.error || "Session expired");
    e.code = data.code || "UNAUTHORIZED";
    throw e;
  }

  if (!res.ok) {
    const e = new Error(data.error || "Request failed");
    e.status = res.status;
    throw e;
  }

  return data;
}

export function loginRequest(email, password) {
  return api("/api/auth/login", { method: "POST", body: { email, password }, auth: false });
}

export function meRequest() {
  return api("/api/auth/me");
}

export function logoutRequest() {
  return api("/api/auth/logout", { method: "POST" });
}

export function fetchSummary(signal) {
  return api("/api/dashboard/summary", { signal });
}

export function fetchAlerts(threshold, signal) {
  return api(`/api/dashboard/alerts?threshold=${encodeURIComponent(threshold)}`, { signal });
}

export function fetchEvents(params, signal) {
  const q = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v) q.set(k, v);
  });
  const suffix = q.toString() ? `?${q}` : "";
  return api(`/api/dashboard/events${suffix}`, { signal });
}
