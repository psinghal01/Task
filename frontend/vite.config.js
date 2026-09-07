import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const proxyTarget = process.env.API_PROXY || "http://localhost:4000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": { target: proxyTarget, changeOrigin: true },
      "/ws": { target: proxyTarget, ws: true, changeOrigin: true },
    },
  },
});
