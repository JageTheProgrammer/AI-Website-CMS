/**
 * Support ticket routes.
 */
import { Router, Request, Response, NextFunction } from "express";
import { getPool } from "../../lib/db";

const router = Router();

function getUserId(req: Request): number | null {
  return (req as any).session?.userId ?? null;
}

// Create support ticket
router.post("/tickets", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Not authenticated.", requestId: (req as any).requestId } });

    const subject = typeof req.body?.subject === "string" ? req.body.subject : "";
    const message = typeof req.body?.message === "string" ? req.body.message : "";
    const projectId = typeof req.body?.projectId === "number" ? req.body.projectId : null;

    if (!subject || !message) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Subject and message are required.", requestId: (req as any).requestId } });

    const result = await getPool().query("INSERT INTO support_tickets (user_id, subject, message) VALUES (?, ?, ?)", [userId, subject.slice(0, 200), message.slice(0, 5000)]);
    res.status(201).json({ data: { id: (result as any).insertId, subject } });
  } catch (err) { next(err); }
});

// List user's tickets
router.get("/tickets", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Not authenticated.", requestId: (req as any).requestId } });

    const [rows] = await getPool().query("SELECT id, subject, status, priority, created_at FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC LIMIT 50", [userId]);
    res.json({ data: rows });
  } catch (err) { next(err); }
});

export default router;
