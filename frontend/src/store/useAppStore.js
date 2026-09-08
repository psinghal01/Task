import { create } from "zustand";
import { SETTINGS_KEY } from "../lib/constants.js";
import { clearAuthStorage, loadSession, persistSession, rememberPreference } from "../lib/sessionPersist.js";
import { isValidTick } from "../lib/tick.js";

function readSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function clampInterval(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 8;
  return Math.min(15, Math.max(5, Math.round(v)));
}

function clampThreshold(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 85;
  return Math.min(95, Math.max(50, Math.round(v)));
}

export const useAppStore = create((set, get) => ({
  token: null,
  user: null,
  expiresAt: null,
  issuedAt: null,
  session: null,
  authReady: false,

  theme: "light",
  pollInterval: 8,
  livePaused: false,
  occupancyThreshold: 85,

  liveByZone: {},
  liveEvents: [],
  lastLiveAt: null,
  liveConnected: false,
  liveOffline: false,

  summary: null,
  alerts: null,
  lastPolledAt: null,
  pollError: null,

  hydrate: () => {
    const settings = readSettings();
    const theme = settings.theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;

    const saved = loadSession();

    set({
      theme,
      pollInterval: clampInterval(settings.pollInterval),
      occupancyThreshold: clampThreshold(settings.occupancyThreshold),
      token: saved?.token || null,
      user: saved?.user || null,
      expiresAt: saved?.expiresAt || null,
      issuedAt: saved?.issuedAt || null,
      authReady: true,
    });
  },

  setSession: ({ token, user, expiresAt, session, issuedAt, remember }) => {
    const issued = issuedAt || Date.now();
    const keep = typeof remember === "boolean" ? remember : rememberPreference();
    persistSession({ token, user, expiresAt, issuedAt: issued }, keep);
    set({ token, user, expiresAt, session: session || null, issuedAt: issued });
  },

  clearSession: () => {
    clearAuthStorage();
    set({
      token: null,
      user: null,
      expiresAt: null,
      issuedAt: null,
      session: null,
      liveByZone: {},
      liveEvents: [],
      lastLiveAt: null,
      liveConnected: false,
      liveOffline: false,
      summary: null,
      alerts: null,
      lastPolledAt: null,
      pollError: null,
      livePaused: false,
    });
  },

  setTheme: (theme) => {
    const next = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    const settings = { ...readSettings(), theme: next };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    set({ theme: next });
  },

  setPollInterval: (n) => {
    const pollInterval = clampInterval(n);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...readSettings(), pollInterval }));
    set({ pollInterval });
  },

  setThreshold: (n) => {
    const occupancyThreshold = clampThreshold(n);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...readSettings(), occupancyThreshold }));
    set({ occupancyThreshold });
  },

  setLivePaused: (livePaused) => set({ livePaused }),

  setLiveStatus: ({ connected, offline }) =>
    set({
      liveConnected: Boolean(connected),
      liveOffline: Boolean(offline),
    }),

  applyTick: (tick) => {
    if (!isValidTick(tick) || get().livePaused) return;
    const liveByZone = { ...get().liveByZone, [tick.zone]: tick };
    const liveEvents = [tick, ...get().liveEvents].slice(0, 40);
    set({
      liveByZone,
      liveEvents,
      lastLiveAt: tick.ts || Date.now(),
      liveOffline: false,
      liveConnected: true,
    });
  },

  setPeriodic: ({ summary, alerts, error }) => {
    if (error) {
      set({ pollError: error });
      return;
    }
    set({
      summary: summary ?? get().summary,
      alerts: alerts ?? get().alerts,
      lastPolledAt: Date.now(),
      pollError: null,
    });
  },
}));
