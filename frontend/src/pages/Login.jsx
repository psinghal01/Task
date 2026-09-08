import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginRequest } from "../api/client.js";
import { PATHS, safeReturnPath } from "../lib/paths.js";
import { rememberPreference } from "../lib/sessionPersist.js";
import { useAppStore } from "../store/useAppStore.js";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAppStore((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(() => rememberPreference());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }
    setBusy(true);
    try {
      const data = await loginRequest(email.trim(), password);
      setSession({
        token: data.token,
        user: data.user,
        expiresAt: data.expiresAt,
        session: data.session,
        issuedAt: Date.now(),
        remember,
      });
      setShowPassword(false);
      navigate(safeReturnPath(location.state?.from), { replace: true });
    } catch (err) {
      setError(err.message || "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <Link to={PATHS.home} className="inline-block">
          <img src="/logo.png" alt="Campus Pulse" className="h-16 w-16 object-contain" />
        </Link>
        <p className="mt-4 text-[13px] font-medium uppercase tracking-[0.18em]">Campus Pulse</p>
        <h1 className="mt-3 text-2xl font-medium tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted">Campus traffic and event monitor.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
          <label className="block">
            <span className="text-xs text-muted">Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm"
            />
          </label>
          <div>
            <label htmlFor="password" className="text-xs text-muted">
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-line bg-paper px-3 py-2 pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((open) => !open)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted hover:text-ink"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            <span>Remember me</span>
          </label>
          {error ? <p className="text-sm text-crit">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-accent px-3 py-2 text-sm text-paper disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-xs">
          <Link to={PATHS.home} className="text-muted underline-offset-2 hover:text-ink hover:underline">
            Back to home
          </Link>
        </p>

        <p className="mt-8 text-xs leading-5 text-muted">
          Demo accounts
          <br />
          admin@campus.edu / campus123
          <br />
          viewer@campus.edu / campus123
        </p>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 3l18 18M10.5 10.6A3 3 0 0 0 13.4 13.5M6.7 6.8C4.2 8.3 2.5 12 2.5 12s3.5 7 10 7c1.8 0 3.4-.4 4.7-1.1M9.6 5.3C10.4 5.1 11.2 5 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2" />
    </svg>
  );
}
