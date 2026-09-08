import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logoutRequest } from "../api/client.js";
import { useLiveStream } from "../hooks/useLiveStream.js";
import { usePeriodic } from "../hooks/usePeriodic.js";
import { PATHS } from "../lib/paths.js";
import { useAppStore } from "../store/useAppStore.js";

const links = [
  { to: PATHS.overview, label: "Overview", end: true },
  { to: "/analytics", label: "Analytics" },
  { to: "/alerts", label: "Alerts" },
  { to: "/settings", label: "Settings" },
  { to: "/profile", label: "Profile" },
];

export function Shell() {
  useLiveStream();
  usePeriodic();

  const user = useAppStore((s) => s.user);
  const clearSession = useAppStore((s) => s.clearSession);
  const navigate = useNavigate();

  async function logout() {
    try {
      await logoutRequest();
    } catch {
      /* still clear locally */
    }
    clearSession();
    navigate(PATHS.home, { replace: true });
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-line bg-paper md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-5 md:block">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Campus Pulse" className="h-11 w-11 object-contain" />
            <div>
              <p className="text-[13px] font-medium tracking-[0.18em] uppercase">Campus Pulse</p>
              <p className="mt-1 text-xs text-muted">Traffic & events</p>
            </div>
          </div>
          <nav className="mt-0 flex gap-4 overflow-x-auto text-sm md:mt-8 md:flex-col md:gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-0 py-1.5 ${isActive ? "text-ink" : "text-muted hover:text-ink"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="hidden border-t border-line px-5 py-4 md:block">
          <p className="text-sm">{user?.name}</p>
          <p className="text-xs text-muted">{user?.email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 px-5 py-6 md:px-10 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
