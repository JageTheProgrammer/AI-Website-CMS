/**
 * Domain management routes.
 */
import { Router, Request, Response, NextFunction } from "express";
import { getPool } from "../../lib/db";

const router = Router();

function getUserId(req: Request): number | null {
  return (req as any).session?.userId ?? null;
}

// List domains for a project
router.get("/:projectId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Not authenticated.", requestId: (req as any).requestId } });

    const projectId = Number(req.params.projectId);
    if (isNaN(projectId)) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid project ID.", requestId: (req as any).requestId } });

    const [rows] = await getPool().query(
      "SELECT d.*, p.slug as project_slug FROM domains d JOIN projects p ON d.project_id = p.id WHERE p.owner_user_id = ? AND p.id = ? ORDER BY d.created_at DESC",
      [userId, projectId]
    );
    res.json({ data: rows });
  } catch (err) { next(err); }
});

// Add custom domain
router.post("/:projectId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Not authenticated.", requestId: (req as any).requestId } });

    const projectId = Number(req.params.projectId);
    const domainName = typeof req.body?.domainName === "string" ? req.body.domainName : "";

    if (!domainName) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Domain name is required.", requestId: (req as any).requestId } });

    const [project] = await getPool().query("SELECT id FROM projects WHERE id = ? AND owner_user_id = ?", [projectId, userId]);
    if (!(project as Array<any>).length) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Project not found.", requestId: (req as any).requestId } });

    const result = await getPool().query("INSERT INTO domains (project_id, domain_name, status) VALUES (?, ?, 'pending')", [projectId, domainName.slice(0, 253)]);
    res.status(201).json({ data: { id: (result as any).insertId, domainName } });
  } catch (err) { next(err); }
});

// Remove domain
router.delete("/:projectId/:domainId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Not authenticated.", requestId: (req as any).requestId } });

    const domainId = Number(req.params.domainId);
    await getPool().query("DELETE d FROM domains d JOIN projects p ON d.project_id = p.id WHERE d.id = ? AND p.owner_user_id = ?", [domainId, userId]);
    res.json({ data: { deleted: true } });
  } catch (err) { next(err); }
});

export default router;
