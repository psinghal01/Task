import http from "node:http";
import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { createTick } from "./data/generator.js";
import { attachLiveSocket } from "./ws/live.js";

const app = express();
app.set("trust proxy", 1);
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: false,
  })
);
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "campus-pulse" });
});

app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);

let broadcast = () => {};
attachLiveSocket(server, {
  onReady: (api) => {
    broadcast = api.broadcast;
  },
});

const timer = setInterval(() => {
  try {
    const tick = createTick();
    broadcast(tick);
  } catch (err) {
    if (config.nodeEnv !== "production") console.error(err);
  }
}, config.tickMs);

for (let i = 12 * 60; i > 0; i -= 1) {
  const tick = createTick();
  tick.ts = Date.now() - i * 1000;
  tick.timestamp = new Date(tick.ts).toISOString();
}

function shutdown() {
  clearInterval(timer);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

server.listen(config.port, () => {
  console.log(`Campus Pulse API on :${config.port}`);
});
