import { useAppStore } from "../store/useAppStore.js";

export function Settings() {
  const theme = useAppStore((s) => s.theme);
  const pollInterval = useAppStore((s) => s.pollInterval);
  const livePaused = useAppStore((s) => s.livePaused);
  const occupancyThreshold = useAppStore((s) => s.occupancyThreshold);
  const setTheme = useAppStore((s) => s.setTheme);
  const setPollInterval = useAppStore((s) => s.setPollInterval);
  const setLivePaused = useAppStore((s) => s.setLivePaused);
  const setThreshold = useAppStore((s) => s.setThreshold);

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-medium tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted">Preferences stay on this browser. Live pause is for this session only.</p>

      <section className="mt-8 border border-line bg-paper px-5 py-5">
        <h2 className="text-sm font-medium">Appearance</h2>
        <div className="mt-4 flex gap-2">
          {["light", "dark"].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTheme(mode)}
              className={`border px-3 py-1.5 text-sm capitalize ${
                theme === mode ? "border-ink text-ink" : "border-line text-muted"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 border border-line bg-paper px-5 py-5">
        <h2 className="text-sm font-medium">Periodic refresh</h2>
        <label className="mt-4 block">
          <span className="text-xs text-muted">Interval {pollInterval}s (5–15)</span>
          <input
            type="range"
            min="5"
            max="15"
            step="1"
            value={pollInterval}
            onChange={(e) => setPollInterval(e.target.value)}
            className="mt-2 w-full"
          />
        </label>
      </section>

      <section className="mt-4 border border-line bg-paper px-5 py-5">
        <h2 className="text-sm font-medium">Live feed</h2>
        <button
          type="button"
          onClick={() => setLivePaused(!livePaused)}
          className="mt-4 border border-line px-3 py-1.5 text-sm"
        >
          {livePaused ? "Resume live updates" : "Pause live updates"}
        </button>
      </section>

      <section className="mt-4 border border-line bg-paper px-5 py-5">
        <h2 className="text-sm font-medium">Alert threshold</h2>
        <label className="mt-4 block">
          <span className="text-xs text-muted">
            Occupancy {occupancyThreshold}% — changes which derived alerts appear
          </span>
          <input
            type="range"
            min="50"
            max="95"
            step="1"
            value={occupancyThreshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="mt-2 w-full"
          />
        </label>
      </section>
    </div>
  );
}
