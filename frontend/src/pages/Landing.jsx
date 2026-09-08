import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PATHS } from "../lib/paths.js";
import { useAppStore } from "../store/useAppStore.js";

const SLIDE_MS = 4500;

const SLIDES = [
  {
    id: "overview",
    label: "Overview",
    caption: "Live zone telemetry",
    aria: "Preview of the live overview dashboard",
  },
  {
    id: "analytics",
    label: "Analytics",
    caption: "15-minute averages",
    aria: "Preview of the analytics trend view",
  },
  {
    id: "alerts",
    label: "Alerts",
    caption: "Derived warnings",
    aria: "Preview of the alerts list",
  },
];

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function Landing() {
  const authReady = useAppStore((s) => s.authReady);
  const token = useAppStore((s) => s.token);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const [logoOk, setLogoOk] = useState(true);

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="flex shrink-0 justify-center px-4 pt-4 pb-2">
        <nav
          className="flex w-full max-w-3xl items-center justify-between gap-3 rounded-full border border-line bg-paper px-2.5 py-2"
          aria-label="Site"
        >
          <Link
            to={PATHS.home}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-paper"
          >
            Campus Pulse
          </Link>

          <div className="flex shrink-0 items-center gap-1 pr-0.5">
            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={theme === "dark"}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-bg"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <div className="min-w-16 text-right">
              {authReady ? (
                token ? (
                  <Link
                    to={PATHS.overview}
                    className="inline-block rounded-full bg-accent px-3 py-1.5 text-sm text-paper"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to={PATHS.login}
                    className="inline-block rounded-full bg-accent px-3 py-1.5 text-sm text-paper"
                  >
                    Login
                  </Link>
                )
              ) : (
                <span className="inline-block px-3 py-1.5 text-sm invisible">Login</span>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="grid min-h-0 flex-1 md:grid-cols-2">
        <section className="flex min-h-0 flex-col justify-center px-5 py-6 md:px-10 lg:px-14">
          {logoOk ? (
            <img
              src="/logo.png"
              alt="Campus Pulse"
              className="mb-6 h-20 w-20 object-contain md:h-28 md:w-28"
              onError={() => setLogoOk(false)}
            />
          ) : null}
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Campus operations</p>
          <h1 className="mt-3 text-3xl font-medium tracking-tight md:text-[2.35rem] md:leading-tight">
            Watch how busy campus is, as it happens.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted">
            Traffic and events for gates and plazas. Live ticks every second: flow, queue,
            occupancy, and status. A slower pass turns that memory into averages, trends,
            and threshold alerts — not a copy of the raw feed.
          </p>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted">
            Five zones. One language. Dummy campus data, real session handling.
          </p>
        </section>

        <section className="min-h-0 border-t border-line bg-paper px-5 py-6 md:border-t-0 md:border-l md:px-8 md:py-8">
          <div className="flex h-full min-h-0 items-center justify-center">
            <PreviewCarousel />
          </div>
        </section>
      </main>
    </div>
  );
}

function PreviewCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = prefersReducedMotion();
  const slide = SLIDES[index] || SLIDES[0];

  useEffect(() => {
    if (paused || reduceMotion) return undefined;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion]);

  function goTo(next) {
    if (!Number.isInteger(next) || next < 0 || next >= SLIDES.length) return;
    setIndex(next);
  }

  return (
    <figure
      className="w-full max-w-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      <div className="relative h-[300px] overflow-hidden border border-line bg-bg">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slide.id}
            role="img"
            aria-label={slide.aria}
            className="absolute inset-0"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            {slide.id === "overview" ? <OverviewSlide /> : null}
            {slide.id === "analytics" ? <AnalyticsSlide /> : null}
            {slide.id === "alerts" ? <AlertsSlide /> : null}
          </motion.div>
        </AnimatePresence>
      </div>
      <figcaption className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-muted">
          {slide.label} — {slide.caption}
        </span>
        <div className="flex gap-1.5" role="tablist" aria-label="Dashboard previews">
          {SLIDES.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={item.label}
              onClick={() => goTo(i)}
              className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-ink" : "bg-line"}`}
            />
          ))}
        </div>
      </figcaption>
    </figure>
  );
}

function SlideChrome({ title, badge, children }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-line px-3 py-2 text-[11px]">
        <span>{title}</span>
        <span className="text-muted">{badge}</span>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M16.5 13.5A6.5 6.5 0 0 1 10.5 5a7 7 0 1 0 6 8.5Z" />
    </svg>
  );
}

function OverviewSlide() {
  return (
    <SlideChrome
      title="Overview"
      badge={
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-ok" />
          LIVE
        </span>
      }
    >
      <div className="flex h-full flex-col p-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          ["Flow", "24.1"],
          ["Queue", "7.4"],
          ["Occupancy", "71%"],
        ].map(([label, value]) => (
          <div key={label} className="border border-line bg-paper px-2.5 py-2">
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted">{label}</p>
            <p className="mt-1 tabular text-lg">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 flex min-h-0 flex-1 flex-col justify-between">
        {[
          ["North Gate", "OK", "18.2"],
          ["Library Plaza", "WARN", "81.4"],
          ["South Gate", "OK", "54.0"],
          ["Sports Complex", "CRITICAL", "92.1"],
        ].map(([zone, status, occ]) => (
          <div
            key={zone}
            className="flex items-center justify-between border border-line bg-paper px-2.5 py-1.5 text-[11px]"
          >
            <span>{zone}</span>
            <span className="tabular text-muted">
              {occ}% · {status}
            </span>
          </div>
        ))}
      </div>
      </div>
    </SlideChrome>
  );
}

function AnalyticsSlide() {
  const bars = [28, 36, 32, 44, 40, 52, 48, 61, 57, 64];
  return (
    <SlideChrome title="Analytics" badge="15-min window">
      <div className="flex h-full flex-col p-3">
        <div className="flex min-h-0 flex-1 items-end gap-1">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 bg-ink/70" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="mt-3 flex shrink-0 justify-between text-[11px] text-muted">
          <span>Occupancy 68%</span>
          <span>Δ +2.1 vs last window</span>
        </div>
      </div>
    </SlideChrome>
  );
}

function AlertsSlide() {
  return (
    <SlideChrome title="Alerts" badge="Threshold 85%">
      <div className="flex h-full flex-col justify-between p-3">
        {[
          ["Sports Complex", "CRITICAL", "Occupancy"],
          ["North Gate", "WARN", "Queue"],
          ["Admin Block", "OK", "Clear"],
          ["Library Plaza", "WARN", "Occupancy"],
        ].map(([zone, status, kind]) => (
          <div
            key={zone}
            className="flex items-center justify-between border border-line bg-paper px-2.5 py-2 text-[11px]"
          >
            <span>
              {zone}
              <span className="text-muted"> · {kind}</span>
            </span>
            <span className="text-muted">{status}</span>
          </div>
        ))}
      </div>
    </SlideChrome>
  );
}
