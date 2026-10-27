/**
 * Authentication routes: signup, login, logout, verify session, profile management.
 */
import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { config } from "../../lib/env";
import { getPool } from "../../lib/db";
import rateLimit from "express-rate-limit";

const router = Router();

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

function getUserId(req: Request): number | null {
  return (req as any).session?.userId ?? null;
}

// --- Signup ---
router.post("/signup", authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const displayName = typeof req.body?.displayName === "string" ? req.body.displayName : "";

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Email, password, and display name are required.", requestId: (req as any).requestId } });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Password must be at least 8 characters.", requestId: (req as any).requestId } });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const [existing] = await getPool().query("SELECT id FROM users WHERE email = ?", [normalizedEmail]);
    if ((existing as Array<{ id: number }> | any[]).length > 0) {
      return res.status(409).json({ error: { code: "CONFLICT", message: "Email already registered.", requestId: (req as any).requestId } });
    }

    // Hash password and insert user
    const hash = await bcrypt.hash(password, 12);
    const result = await getPool().query(
      "INSERT INTO users (email, password_hash, display_name, role, status) VALUES (?, ?, ?, 'customer', 'active')",
      [normalizedEmail, hash, displayName.slice(0, 120)]
    );

    // Start session
    const userId = (result as any).insertId;
    (req as any).session.userId = userId;

    res.status(201).json({ data: { userId, email: normalizedEmail, displayName: displayName.slice(0, 120) } });
  } catch (err) {
    next(err);
  }
});

// --- Login ---
router.post("/login", authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Email and password are required.", requestId: (req as any).requestId } });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const [rows] = await getPool().query("SELECT id, email, display_name, role, status, password_hash FROM users WHERE email = ?", [normalizedEmail]);
    const users = rows as Array<{ id: number; email: string; display_name: string; role: string; status: string; password_hash: string }>;

    if (!users.length) {
      return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid credentials.", requestId: (req as any).requestId } });
    }

    const user = users[0];

    // Check if account is suspended
    if (user.status === "suspended") {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "Account suspended.", requestId: (req as any).requestId } });
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid credentials.", requestId: (req as any).requestId } });
    }

    // Update last login
    await getPool().query("UPDATE users SET last_login_at = NOW(3) WHERE id = ?", [user.id]);

    // Start session
    (req as any).session.userId = user.id;

    res.json({ data: { userId: user.id, email: user.email, displayName: user.display_name } });
  } catch (err) {
    next(err);
  }
});

// --- Logout ---
router.post("/logout", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!getUserId(req)) {
      return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Not authenticated.", requestId: (req as any).requestId } });
    }
    (req as any).session.destroy(function () {
      res.json({ data: { loggedOut: true } });
    });
  } catch (err) { next(err); }
});

// --- Verify session / current user ---
router.get("/me", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Not authenticated.", requestId: (req as any).requestId } });
    }

    const [rows] = await getPool().query("SELECT id, email, display_name, role, status FROM users WHERE id = ?", [userId]);
    const users = rows as Array<{ id: number; email: string; display_name: string; role: string; status: string }>;

    if (!users.length) {
      (req as any).session.destroy(function () {
        res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Session invalid.", requestId: (req as any).requestId } });
      });
      return;
    }

    const user = users[0];
    res.json({ data: { userId: user.id, email: user.email, displayName: user.display_name, role: user.role, status: user.status } });
  } catch (err) { next(err); }
});

// --- Update profile ---
router.patch("/profile", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Not authenticated.", requestId: (req as any).requestId } });
    }

    const displayName = typeof req.body?.displayName === "string" ? req.body.displayName : "";
    const newEmail = typeof req.body?.email === "string" ? req.body.email : null;

    if (!displayName && !newEmail) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Provide displayName or email.", requestId: (req as any).requestId } });
    }

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (displayName) {
      updates.push("display_name = ?");
      values.push(displayName.slice(0, 120));
    }
    if (newEmail) {
      updates.push("email = ?");
      values.push(newEmail.toLowerCase().trim());
    }

    values.push(userId);
    await getPool().query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);

    res.json({ data: { updated: true } });
  } catch (err) { next(err); }
});

// --- Delete account ---
router.delete("/profile", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Not authenticated.", requestId: (req as any).requestId } });
    }

    await getPool().query("DELETE FROM users WHERE id = ?", [userId]);
    (req as any).session.destroy(function () {
      res.json({ data: { deleted: true } });
    });
  } catch (err) { next(err); }
});

export default router;
