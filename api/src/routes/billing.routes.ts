/**
 * Billing routes - pricing tiers and subscription info.
 */
import { Router, Request, Response, NextFunction } from "express";
import { getPool } from "../../lib/db";

const router = Router();

function getUserId(req: Request): number | null {
  return (req as any).session?.userId ?? null;
}

// All billing routes require auth
router.use(async (req, res, next) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Not authenticated.", requestId: (req as any).requestId } });
  next();
});

// Get pricing tiers
router.get("/pricing", (_req, res) => {
  res.json({
    data: [
      { code: "free", name: "Free", price: 0, currency: "USD", period: "month", features: ["1 project", "Platform subdomain", "Community support"] },
      { code: "pro", name: "Pro", price: 19, currency: "USD", period: "month", features: ["Unlimited projects", "Custom domains", "Priority support", "Version history"] },
      { code: "enterprise", name: "Enterprise", price: 79, currency: "USD", period: "month", features: ["Everything in Pro", "Dedicated support", "SLA", "Team access"] },
    ],
  });
});

// Get current subscription
router.get("/subscription", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) return;

    const [rows] = await getPool().query(
      "SELECT plan_code, status, current_period_end, cancel_at_period_end FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [userId]
    );
    const sub = (rows as Array<any>).pop();

    if (!sub) return res.json({ data: { planCode: "free", status: "active" } });
    res.json({ data: sub });
  } catch (err) { next(err); }
});

// Get payment history
router.get("/payments", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) return;

    const [rows] = await getPool().query(
      "SELECT id, amount_minor, currency, status, description, paid_at FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
      [userId]
    );
    res.json({ data: rows });
  } catch (err) { next(err); }
});

export default router;
