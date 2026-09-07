import { WebSocketServer } from "ws";
import { verifyToken } from "../auth/jwt.js";
import { findUserByEmail } from "../auth/users.js";

export function attachLiveSocket(server, { onReady }) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    try {
      const host = req.headers.host || "localhost";
      const url = new URL(req.url, `http://${host}`);
      if (url.pathname !== "/ws/live") {
        socket.destroy();
        return;
      }

      const result = verifyToken(url.searchParams.get("token"));
      const user = result.ok ? findUserByEmail(result.payload.email) : null;
      if (!result.ok || !user) {
        socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
        socket.destroy();
        return;
      }

      wss.handleUpgrade(req, socket, head, (ws) => {
        ws.userId = user.id;
        wss.emit("connection", ws);
      });
    } catch {
      socket.destroy();
    }
  });

  wss.on("connection", (ws) => {
    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });
    ws.on("error", () => {
      try {
        ws.close();
      } catch {
        /* ignore */
      }
    });
  });

  const ping = setInterval(() => {
    for (const client of wss.clients) {
      if (!client.isAlive) {
        client.terminate();
        continue;
      }
      client.isAlive = false;
      client.ping();
    }
  }, 25000);

  wss.on("close", () => clearInterval(ping));

  function broadcast(tick) {
    const payload = JSON.stringify({ type: "tick", payload: tick });
    for (const client of wss.clients) {
      if (client.readyState === 1) {
        try {
          client.send(payload);
        } catch {
          /* drop client send errors */
        }
      }
    }
  }

  onReady({ broadcast });
  return wss;
}
