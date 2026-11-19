import { Request, Response, NextFunction } from "express";
import { getPool } from "../../lib/db";

/**
 * Require a specific role (e.g. 'admin'). Must run after auth check.
 */
export function requireRole(role: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Not authenticated.", requestId: (req as any).requestId } });
    }

    try {
      const [rows] = await getPool().query("SELECT role FROM users WHERE id = ?", [userId]);
      const userRows = rows as Array<{ role: string }>;

      if (!userRows.length || userRows[0].role !== role) {
        return res.status(403).json({ error: { code: "FORBIDDEN", message: "Insufficient permissions.", requestId: (req as any).requestId } });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
