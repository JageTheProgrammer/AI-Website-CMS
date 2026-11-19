/**
 * Deployment management routes.
 */
import { Router, Request, Response, NextFunction } from "express";
import { getPool } from "../../lib/db";
import { recordAuditLog } from "../../lib/audit-log";

const router = Router();

function getUserId(req: Request): number | null {
  return (req as any).session?.userId ?? null;
}

// List deployments for a project
router.get("/project/:projectId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Not authenticated.", requestId: (req as any).requestId } });

    const projectId = Number(req.params.projectId);
    if (isNaN(projectId)) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid project ID.", requestId: (req as any).requestId } });

    const [rows] = await getPool().query(
      `SELECT d.*, pv.version_number, p.slug as project_slug FROM deployments d JOIN projects p ON d.project_id = p.id JOIN project_versions pv ON d.project_version_id = pv.id WHERE p.owner_user_id = ? AND d.project_id = ? ORDER BY d.created_at DESC LIMIT 50`,
      [userId, projectId]
    );
    res.json({ data: rows });
  } catch (err) { next(err); }
});

// Create deployment
router.post("/project/:projectId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Not authenticated.", requestId: (req as any).requestId } });

    const projectId = Number(req.params.projectId);
    if (isNaN(projectId)) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid project ID.", requestId: (req as any).requestId } });

    const versionId = typeof req.body?.versionId === "number" ? req.body.versionId : 0;
    const target = typeof req.body?.target === "string" ? req.body.target : "platform";

    const [project] = await getPool().query("SELECT id FROM projects WHERE id = ? AND owner_user_id = ?", [projectId, userId]);
    if (!(project as Array<any>).length) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Project not found.", requestId: (req as any).requestId } });

    // Get current version if none specified
    let ver = versionId;
    if (!ver) {
      const [verRows] = await getPool().query("SELECT current_version_number FROM projects WHERE id = ?", [projectId]);
      ver = ((verRows as any).rows?.[0]?.current_version_number ?? 1) as number;
    }

    const result = await getPool().query("INSERT INTO deployments (project_id, project_version_id, created_by_user_id, target, status) VALUES (?, ?, ?, ?, 'queued')", [projectId, ver, userId, target]);
    await recordAuditLog({
      actorUserId: userId,
      projectId,
      action: "deployment.created",
      resourceType: "deployment",
      resourceId: (result as any).insertId,
      request: req,
      metadata: { target },
    });
    res.status(201).json({ data: { id: (result as any).insertId, status: "queued" } });
  } catch (err) { next(err); }
});

// Get deployment status
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Not authenticated.", requestId: (req as any).requestId } });

    const deployId = Number(req.params.id);
    const [rows] = await getPool().query(
      `SELECT d.*, pv.version_number FROM deployments d JOIN project_versions pv ON d.project_version_id = pv.id WHERE d.id = ? AND (SELECT owner_user_id FROM projects WHERE id = d.project_id) = ?`,
      [deployId, userId]
    );
    const deploy = (rows as Array<any>).pop();

    if (!deploy) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Deployment not found.", requestId: (req as any).requestId } });
    res.json({ data: deploy });
  } catch (err) { next(err); }
});

export default router;
