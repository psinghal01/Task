import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

export function verifyToken(token) {
  if (!token || typeof token !== "string") {
    return { ok: false, code: "TOKEN_MISSING" };
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    return { ok: true, payload };
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return { ok: false, code: "TOKEN_EXPIRED" };
    }
    return { ok: false, code: "TOKEN_INVALID" };
  }
}

export function decodeExp(token) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return null;
    return decoded.exp * 1000;
  } catch {
    return null;
  }
}

export function extractBearer(header) {
  if (!header || typeof header !== "string") return null;
  const [scheme, value] = header.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !value) return null;
  return value.trim();
}
