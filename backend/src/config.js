function requiredInProd(name, fallback) {
  const value = process.env[name] || fallback;
  if (process.env.NODE_ENV === "production" && !process.env[name] && !fallback) {
    throw new Error(`${name} is required`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: requiredInProd("JWT_SECRET", "dev-campus-pulse-secret-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "45m",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development",
  tickMs: 1000,
  bufferMax: 900,
  windowMs: 15 * 60 * 1000,
};
