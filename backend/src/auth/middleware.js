import { extractBearer, verifyToken } from "./jwt.js";
import { findUserByEmail, touchActivity } from "./users.js";

export function requireAuth(req, res, next) {
  const token = extractBearer(req.headers.authorization);
  const result = verifyToken(token);

  if (!result.ok) {
    const message =
      result.code === "TOKEN_EXPIRED"
        ? "Session expired"
        : result.code === "TOKEN_MISSING"
          ? "Authentication required"
          : "Invalid session";
    return res.status(401).json({ error: message, code: result.code });
  }

  const user = findUserByEmail(result.payload.email);
  if (!user) {
    return res.status(401).json({ error: "Invalid session", code: "TOKEN_INVALID" });
  }

  touchActivity(user.id);
  req.user = user;
  req.tokenPayload = result.payload;
  next();
}
