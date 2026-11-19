/**
 * Admin routes - platform stats and user management (admin only).
 */
import { Router, Request, Response, NextFunction } from "express";
import { getPool } from "../../lib/db";
import { requireRole } from "../middleware/authorize";
import rateLimit from "express-rate-limit";

const router = Router();

router.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
}));
router.use(requireRole("admin"));

// Platform stats
router.get(
  "/stats",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const pool = getPool();

      const [userRows] = await pool.query(
        "SELECT COUNT(*) AS count FROM users WHERE status = 'active'",
      );

      const [projectRows] = await pool.query(
        "SELECT COUNT(*) AS count FROM projects WHERE deleted_at IS NULL",
      );

      const [subRows] = await pool.query(
        "SELECT COUNT(*) AS count FROM subscriptions WHERE status = 'active'",
      );

      const [revenueRows] = await pool.query(
        `SELECT COALESCE(SUM(amount_minor), 0) AS total
         FROM payments
         WHERE status = 'succeeded'
           AND paid_at >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
           AND paid_at < DATE_FORMAT(
             CURRENT_DATE + INTERVAL 1 MONTH,
             '%Y-%m-01'
           )`,
      );

      const count = (rows: unknown): number => {
        const row = (rows as Array<{ count: number | string }>)[0];
        return Number(row?.count ?? 0);
      };

      const revenue = (revenueRows as Array<{
        total: number | string;
      }>)[0];

      res.json({
        data: {
          totalUsers: count(userRows),
          totalProjects: count(projectRows),
          activeSubscriptions: count(subRows),
          // Total in minor currency units, e.g. cents.
          revenueThisMonth: Number(revenue?.total ?? 0),
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// List users
router.get(
  "/users",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [rows] = await getPool().query(
        `SELECT
           u.id,
           u.email,
           u.display_name,
           u.role,
           u.status,
           u.created_at,
           COUNT(DISTINCT p.id) AS project_count
         FROM users u
         LEFT JOIN projects p
           ON u.id = p.owner_user_id
           AND p.deleted_at IS NULL
         GROUP BY
           u.id,
           u.email,
           u.display_name,
           u.role,
           u.status,
           u.created_at
         ORDER BY u.created_at DESC
         LIMIT 100`,
      );

      res.json({ data: rows });
    } catch (err) {
      next(err);
    }
  },
);

// Get user details
router.get(
  "/users/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.params.id);

      if (!Number.isSafeInteger(userId) || userId <= 0) {
        res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid user ID.",
            requestId: (req as any).requestId,
          },
        });
        return;
      }

      const [rows] = await getPool().query(
        `SELECT
           id,
           email,
           display_name,
           role,
           status,
           created_at,
           last_login_at
         FROM users
         WHERE id = ?
         LIMIT 1`,
        [userId],
      );

      const user = (rows as Record<string, unknown>[])[0];

      if (!user) {
        res.status(404).json({
          error: {
            code: "NOT_FOUND",
            message: "User not found.",
            requestId: (req as any).requestId,
          },
        });
        return;
      }

      res.json({ data: user });
    } catch (err) {
      next(err);
    }
  },
);


/** Recent admin activity */
router.get(
  "/activity",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [rows] = await getPool().query(
        `SELECT
           a.id,
           a.action,
           a.created_at AS createdAt,
           a.actor_user_id AS actorUserId,
           COALESCE(u.display_name, u.email, 'Deleted user') AS actor,
           a.project_id AS projectId,
           a.resource_type AS resourceType,
           a.resource_id AS resourceId,
           a.request_id AS requestId,
           a.metadata,
           COALESCE(p.slug, a.resource_id) AS resource
         FROM audit_logs a
         LEFT JOIN users u ON u.id = a.actor_user_id
         LEFT JOIN projects p ON p.id = a.project_id
         ORDER BY a.created_at DESC
         LIMIT 100`,
      );

      res.json({ data: rows });
    } catch (err) {
      console.error("[Admin Activity] Failed to load activity:", err);
      next(err);
    }
  },
);


export default router;