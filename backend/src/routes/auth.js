import { Router } from "express";
import { decodeExp, signToken } from "../auth/jwt.js";
import { loginRateLimit } from "../auth/rateLimit.js";
import { requireAuth } from "../auth/middleware.js";
import {
  clearSessionMeta,
  findUserByEmail,
  getSessionMeta,
  publicUser,
  recordLogin,
  verifyPassword,
} from "../auth/users.js";
import { asyncHandler } from "../middleware/error.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const authRouter = Router();

authRouter.post(
  "/login",
  loginRateLimit,
  asyncHandler(async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Enter a valid email address" });
    }

    const user = findUserByEmail(email);
    const dummy = { passwordHash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy" };
    const ok = await verifyPassword(user || dummy, password);

    if (!user || !ok) {
      return res.status(401).json({ error: "Email or password is incorrect" });
    }

    const token = signToken(user);
    const expiresAt = decodeExp(token);
    const meta = recordLogin(user.id);

    res.json({
      token,
      expiresAt,
      user: publicUser(user),
      session: meta,
    });
  })
);

authRouter.get(
  "/me",
  requireAuth,
  (req, res) => {
    const exp = req.tokenPayload?.exp ? req.tokenPayload.exp * 1000 : null;
    res.json({
      user: publicUser(req.user),
      expiresAt: exp,
      issuedAt: req.tokenPayload?.iat ? req.tokenPayload.iat * 1000 : null,
      session: getSessionMeta(req.user.id),
    });
  }
);

authRouter.post("/logout", requireAuth, (req, res) => {
  clearSessionMeta(req.user.id);
  res.json({ ok: true });
});
