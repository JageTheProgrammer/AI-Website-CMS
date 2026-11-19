
import { Router, Request, Response, NextFunction } from "express";
import { getPool } from "../../lib/db";
import { recordAuditLog } from "../../lib/audit-log";

const router = Router();

type AuthenticatedRequest = Request & {
  session?: Request["session"] & {
    userId?: number | string;
    user?: {
      id?: number | string;
      userId?: number | string;
      role?: string;
    };
  };
};

function getUserId(req: Request): number | null {
  const session = (req as AuthenticatedRequest).session;

  const rawId = session?.userId ?? session?.user?.id ?? session?.user?.userId;
  const id = typeof rawId === "string" ? Number(rawId) : rawId;

  return typeof id === "number" && Number.isSafeInteger(id) && id > 0
    ? id
    : null;
}

function requireCustomer(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!getUserId(req)) {
    res.status(401).json({
      error: {
        code: "UNAUTHENTICATED",
        message: "Please sign in to access your account.",
      },
    });
    return;
  }

  next();
}

router.use(requireCustomer);

/**
 * GET /api/customer/projects
 * Returns projects owned by the authenticated user.
 */
router.get(
  "/projects",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req)!;
      const pool = getPool();

      const [rows] = await pool.execute(
        `SELECT
           id,
           name,
           status,
           created_at AS createdAt,
           updated_at AS updatedAt
         FROM projects
         WHERE owner_user_id = ?
           AND deleted_at IS NULL
         ORDER BY created_at DESC
         LIMIT 100`,
        [userId],
      );

      res.json({ data: rows });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/customer/deployments
 * Returns deployments belonging to the user's projects.
 */
router.get(
  "/deployments",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req)!;
      const pool = getPool();

      const [rows] = await pool.execute(
        `SELECT
           d.id,
           d.project_id AS projectId,
           d.status,
           d.created_at AS createdAt,
           d.updated_at AS updatedAt
         FROM deployments d
         INNER JOIN projects p ON p.id = d.project_id
         WHERE p.owner_user_id = ?
           AND p.deleted_at IS NULL
         ORDER BY d.created_at DESC
         LIMIT 100`,
        [userId],
      );

      res.json({ data: rows });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/customer/domains
 * Returns domains belonging to the user's projects.
 */
router.get(
  "/domains",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req)!;
      const pool = getPool();

      const [rows] = await pool.execute(
        `SELECT
           d.id,
           d.project_id AS projectId,
           d.domain,
           d.status,
           d.created_at AS createdAt
         FROM domains d
         INNER JOIN projects p ON p.id = d.project_id
         WHERE p.owner_user_id = ?
           AND p.deleted_at IS NULL
         ORDER BY d.created_at DESC
         LIMIT 100`,
        [userId],
      );

      res.json({ data: rows });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/customer/settings
 * Returns the authenticated user's account settings.
 */
router.get(
  "/settings",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req)!;
      const pool = getPool();

      const [rows] = await pool.execute(
        `SELECT
           id,
           email,
           display_name AS displayName,
           created_at AS createdAt
         FROM users
         WHERE id = ?
         LIMIT 1`,
        [userId],
      );

      const users = rows as Array<Record<string, unknown>>;

      if (!users.length) {
        res.status(404).json({
          error: {
            code: "USER_NOT_FOUND",
            message: "Account not found.",
          },
        });
        return;
      }

      res.json({ data: users[0] });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * PATCH /api/customer/settings
 * Allows users to update their display name only.
 */
router.patch(
  "/settings",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req)!;
      const displayName = req.body?.displayName;

      if (
        typeof displayName !== "string" ||
        displayName.trim().length < 1 ||
        displayName.trim().length > 100
      ) {
        res.status(400).json({
          error: {
            code: "INVALID_DISPLAY_NAME",
            message: "Display name must be between 1 and 100 characters.",
          },
        });
        return;
      }

      const pool = getPool();

      const [result] = await pool.execute(
        `UPDATE users
         SET display_name = ?
         WHERE id = ?`,
        [displayName.trim(), userId],
      );

      const updateResult = result as { affectedRows: number };

      if (updateResult.affectedRows === 0) {
        const [rows] = await pool.execute(
          "SELECT id FROM users WHERE id = ? LIMIT 1",
          [userId],
        );

        if (!(rows as unknown[]).length) {
          res.status(404).json({
            error: {
              code: "USER_NOT_FOUND",
              message: "Account not found.",
            },
          });
          return;
        }
      }

      await recordAuditLog({
        actorUserId: userId,
        action: "profile.updated",
        resourceType: "user",
        resourceId: userId,
        request: req,
        metadata: { field: "display_name" },
      });

      res.json({
        data: {
          displayName: displayName.trim(),
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/customer/activity
 *
 * Returns only activity performed by the authenticated customer.
 */
router.get(
  "/activity",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req)!;
      const [rows] = await getPool().query(
        `SELECT
           a.id,
           a.action,
           a.created_at AS createdAt,
           a.project_id AS projectId,
           a.resource_type AS resourceType,
           a.resource_id AS resourceId,
           a.metadata,
           p.slug AS projectSlug,
           CASE
             WHEN a.action LIKE 'generation.%' THEN 'generation'
             WHEN a.action LIKE 'deployment.%' THEN 'deployment'
             WHEN a.action LIKE 'domain.%' THEN 'domain'
             WHEN a.action LIKE 'account.%' OR a.action LIKE 'profile.%' THEN 'account'
             ELSE 'project'
           END AS type
         FROM audit_logs a
         LEFT JOIN projects p ON p.id = a.project_id
         WHERE a.actor_user_id = ?
         ORDER BY a.created_at DESC
         LIMIT 100`,
        [userId],
      );
      res.json({ data: rows });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
