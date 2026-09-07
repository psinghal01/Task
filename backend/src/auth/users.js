import bcrypt from "bcryptjs";

const RAW_USERS = [
  {
    id: "u-admin",
    email: "admin@campus.edu",
    password: "campus123",
    name: "Ada Okonkwo",
    role: "operator",
  },
  {
    id: "u-viewer",
    email: "viewer@campus.edu",
    password: "campus123",
    name: "Leo Park",
    role: "viewer",
  },
];

const users = RAW_USERS.map((u) => ({
  id: u.id,
  email: u.email.toLowerCase(),
  name: u.name,
  role: u.role,
  passwordHash: bcrypt.hashSync(u.password, 10),
}));

const sessions = new Map();

export function findUserByEmail(email) {
  if (!email || typeof email !== "string") return null;
  return users.find((u) => u.email === email.trim().toLowerCase()) || null;
}

export async function verifyPassword(user, password) {
  if (!user || typeof password !== "string" || password.length === 0) return false;
  try {
    return await bcrypt.compare(password, user.passwordHash);
  } catch {
    return false;
  }
}

export function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export function recordLogin(userId) {
  const now = Date.now();
  const prev = sessions.get(userId) || {};
  sessions.set(userId, { ...prev, lastLoginAt: now, lastActivityAt: now });
  return sessions.get(userId);
}

export function touchActivity(userId) {
  const prev = sessions.get(userId);
  if (!prev) return;
  prev.lastActivityAt = Date.now();
}

export function getSessionMeta(userId) {
  return sessions.get(userId) || null;
}

export function clearSessionMeta(userId) {
  sessions.delete(userId);
}
