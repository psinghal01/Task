import { EXP_KEY, ISSUED_KEY, REMEMBER_KEY, TOKEN_KEY, USER_KEY } from "./constants.js";

const AUTH_KEYS = [TOKEN_KEY, USER_KEY, EXP_KEY, ISSUED_KEY];

function wipe(store) {
  try {
    AUTH_KEYS.forEach((key) => store.removeItem(key));
  } catch {
    /* private mode / quota */
  }
}

function writeAuth(store, { token, user, expiresAt, issuedAt }) {
  store.setItem(TOKEN_KEY, token);
  store.setItem(USER_KEY, JSON.stringify(user));
  store.setItem(EXP_KEY, String(expiresAt));
  if (issuedAt) store.setItem(ISSUED_KEY, String(issuedAt));
}

function readAuth(store) {
  try {
    const token = store.getItem(TOKEN_KEY);
    const exp = Number(store.getItem(EXP_KEY));
    let user = null;
    try {
      user = JSON.parse(store.getItem(USER_KEY) || "null");
    } catch {
      user = null;
    }
    if (!token || !user || !Number.isFinite(exp)) return null;
    return {
      token,
      user,
      expiresAt: exp,
      issuedAt: Number(store.getItem(ISSUED_KEY)) || null,
    };
  } catch {
    return null;
  }
}

export function rememberPreference() {
  try {
    return localStorage.getItem(REMEMBER_KEY) === "1";
  } catch {
    return false;
  }
}

export function persistSession(payload, remember) {
  const data = {
    token: payload.token,
    user: payload.user,
    expiresAt: payload.expiresAt,
    issuedAt: payload.issuedAt || Date.now(),
  };
  try {
    if (remember) {
      writeAuth(localStorage, data);
      wipe(sessionStorage);
      localStorage.setItem(REMEMBER_KEY, "1");
    } else {
      writeAuth(sessionStorage, data);
      wipe(localStorage);
      localStorage.setItem(REMEMBER_KEY, "0");
    }
  } catch {
    try {
      writeAuth(sessionStorage, data);
      wipe(localStorage);
    } catch {
      /* cannot persist — in-memory store still holds the session */
    }
  }
}

export function loadSession() {
  let remembered = false;
  try {
    remembered = localStorage.getItem(REMEMBER_KEY) === "1";
  } catch {
    remembered = false;
  }

  const primary = remembered ? localStorage : sessionStorage;
  const secondary = remembered ? sessionStorage : localStorage;
  const data = readAuth(primary) || readAuth(secondary);
  if (!data) return null;
  if (Date.now() >= data.expiresAt) {
    clearAuthStorage();
    return null;
  }
  return data;
}

export function clearAuthStorage() {
  wipe(sessionStorage);
  wipe(localStorage);
}
