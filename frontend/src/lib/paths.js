export const PATHS = {
  home: "/",
  login: "/login",
  overview: "/overview",
  analytics: "/analytics",
  alerts: "/alerts",
  settings: "/settings",
  profile: "/profile",
};

const APP_PATHS = [
  PATHS.overview,
  PATHS.analytics,
  PATHS.alerts,
  PATHS.settings,
  PATHS.profile,
];

export function safeReturnPath(from) {
  if (typeof from !== "string" || !from.startsWith("/") || from.startsWith("//")) {
    return PATHS.overview;
  }
  const path = from.split("?")[0];
  if (path === PATHS.home || path === PATHS.login) return PATHS.overview;
  if (APP_PATHS.some((p) => path === p || path.startsWith(`${p}/`))) return path;
  return PATHS.overview;
}
