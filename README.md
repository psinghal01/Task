# Campus Pulse

A campus traffic and event monitoring dashboard. The backend invents dummy zone telemetry (gates, plazas, occupancy). Identity is a dummy login. Session handling is real: JWT issue, expiry, protected APIs, and logout.

## What you get

- Live WebSocket feed: pedestrian flow, vehicle queue, occupancy, status, event type
- Periodic APIs: 15-minute averages, trend deltas, threshold-derived alerts
- Public landing page, login, and six app pages: Overview, Analytics, Alerts, Settings, Profile
- Dummy users, real JWT (default 45 minutes), route guards, 401 cleanup
- Quiet light/dark theme — paper, ink, hairline borders

## Tech

JavaScript only. React + Vite + Tailwind + Zustand + Framer Motion + Recharts on the frontend. Express + `ws` + JWT on the backend. Docker Compose starts both.

## Dummy credentials

| Email | Password | Role |
| --- | --- | --- |
| admin@campus.edu | campus123 | operator |
| viewer@campus.edu | campus123 | viewer |

## Quick start (Docker)

```bash
docker compose up --build
```

- App: http://localhost:5173
- API: http://localhost:4000/api/health

## Local without Docker

Needs Node 20+.

```bash
cp .env.example .env

cd backend && npm install && npm run dev
# other terminal
cd frontend && npm install && npm run dev
```

Frontend proxies `/api` and `/ws` to `http://localhost:4000`.

## Environment

See `.env.example`.

| Variable | Purpose | Default |
| --- | --- | --- |
| `JWT_SECRET` | Signs session tokens | dev secret |
| `JWT_EXPIRES_IN` | Token lifetime | `45m` |
| `PORT` | Backend port | `4000` |
| `CORS_ORIGIN` | Allowed browser origin | `http://localhost:5173` |

`.env` is gitignored. Do not commit secrets.

## API

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | no | Dummy email/password → JWT |
| GET | `/api/auth/me` | yes | Current user + expiry |
| POST | `/api/auth/logout` | yes | Clears server session metadata |
| GET | `/api/dashboard/summary` | yes | Window averages and deltas |
| GET | `/api/dashboard/alerts` | yes | Derived alerts (`?threshold=`) |
| GET | `/api/dashboard/events` | yes | Filterable event list |
| GET | `/api/dashboard/snapshot` | yes | Latest tick per zone |
| WS | `/ws/live?token=` | yes | Raw ticks about once per second |

Live tick shape is not the same as summary/alerts. Summary is aggregates. Alerts are threshold-derived.

## Pages

| Route | Content |
| --- | --- |
| `/` | Public landing — copy left, dashboard preview right, Login top-right |
| `/login` | Sign in |
| `/overview` | Live metrics, LIVE/OFFLINE, last received |
| `/analytics` | Periodic charts and zone deltas |
| `/alerts` | Search/filter, derived alerts, event modal |
| `/settings` | Theme, poll interval, live pause, occupancy threshold |
| `/profile` | Identity, expiry countdown, sign out |

The site opens on `/`. Login is top-right. Dashboard routes require a session. A valid session on `/login` goes to Overview (or the page you were blocked from). Logout returns home. Expired or invalid JWT clears local state, stops polling, closes the socket, and returns to login.

## Layout

```
Task/
  docker-compose.yml
  .env.example
  frontend/     Vite + React
  backend/      Express + WebSocket
```

## License

MIT. See `LICENSE`.
