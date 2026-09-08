import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutRequest } from "../api/client.js";
import { formatDateTime, remaining } from "../lib/format.js";
import { PATHS } from "../lib/paths.js";
import { useAppStore } from "../store/useAppStore.js";

export function Profile() {
  const user = useAppStore((s) => s.user);
  const expiresAt = useAppStore((s) => s.expiresAt);
  const issuedAt = useAppStore((s) => s.issuedAt);
  const session = useAppStore((s) => s.session);
  const clearSession = useAppStore((s) => s.clearSession);
  const navigate = useNavigate();
  const [clock, setClock] = useState(remaining(expiresAt));

  useEffect(() => {
    const id = window.setInterval(() => setClock(remaining(expiresAt)), 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  async function logout() {
    try {
      await logoutRequest();
    } catch {
      /* local clear still required */
    }
    clearSession();
    navigate(PATHS.home, { replace: true });
  }

  const nearExpiry = expiresAt && expiresAt - Date.now() < 5 * 60 * 1000;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-medium tracking-tight">Profile</h1>
      <p className="mt-1 text-sm text-muted">Session identity and token lifetime.</p>

      <section className="mt-8 border border-line bg-paper px-5 py-5">
        <Row label="Name" value={user?.name} />
        <Row label="Email" value={user?.email} />
        <Row label="Role" value={user?.role} />
      </section>

      <section className="mt-4 border border-line bg-paper px-5 py-5">
        <Row label="Signed in" value={formatDateTime(session?.lastLoginAt || issuedAt)} />
        <Row label="Last activity" value={formatDateTime(session?.lastActivityAt)} />
        <Row label="Token issued" value={formatDateTime(issuedAt)} />
        <Row label="Expires" value={formatDateTime(expiresAt)} />
        <Row label="Time remaining" value={clock} />
        {nearExpiry ? (
          <p className="mt-4 text-sm text-warn">Session will expire soon. You will be signed out automatically.</p>
        ) : null}
      </section>

      <button
        type="button"
        onClick={logout}
        className="mt-6 border border-line px-3 py-2 text-sm"
      >
        Sign out
      </button>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-b-0">
      <span className="text-xs uppercase tracking-[0.12em] text-muted">{label}</span>
      <span className="tabular text-sm">{value || "—"}</span>
    </div>
  );
}
