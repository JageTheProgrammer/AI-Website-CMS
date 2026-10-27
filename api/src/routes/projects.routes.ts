/**
 * Project CRUD routes with ownership enforcement.
 */
import { Router, Request, Response, NextFunction } from "express";
import { getPool } from "../../lib/db";

const router = Router();

function getUserId(req: Request): number | null {
  const value = (req as any).session?.userId;
  return value == null ? null : Number(value);
}

function unauthorized(res: Response, req: Request) {
  return res.status(401).json({
    error: {
      code: "UNAUTHORIZED",
      message: "Not authenticated.",
      requestId: (req as any).requestId || "",
    },
  });
}

// List projects owned by the current user.
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized(res, req);

    const [rows] = await getPool().query(
      `SELECT id, name, slug, description, framework, status, visibility,
              current_version_number, platform_subdomain, created_at, updated_at
       FROM projects
       WHERE owner_user_id = ? AND deleted_at IS NULL
       ORDER BY updated_at DESC`,
      [userId],
    );

    return res.json({ data: rows });
  } catch (error) {
    return next(error);
  }
});

// Get one project by numeric ID.
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized(res, req);

    const projectId = Number(req.params.id);
    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid project ID.",
          requestId: (req as any).requestId || "",
        },
      });
    }

    const [rows] = await getPool().query(
      `SELECT id, name, slug, description, framework, status, visibility,
              owner_user_id, current_version_number, platform_subdomain,
              created_at, updated_at
       FROM projects
       WHERE id = ? AND owner_user_id = ? AND deleted_at IS NULL
       LIMIT 1`,
      [projectId, userId],
    );

    const project = (rows as any[])[0];
    if (!project) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Project not found.",
          requestId: (req as any).requestId || "",
        },
      });
    }

    return res.json({ data: project });
  } catch (error) {
    return next(error);
  }
});

// Create a project and its initial draft version.
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const pool = getPool();
  let connection: Awaited<ReturnType<typeof pool.getConnection>> | undefined;

  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized(res, req);

    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const description =
      typeof req.body?.description === "string" ? req.body.description.trim() : "";
    const framework =
      typeof req.body?.framework === "string" && req.body.framework.trim()
        ? req.body.framework.trim()
        : "nextjs";
    const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";

    if (!name || !prompt) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Name and prompt are required.",
          requestId: (req as any).requestId || "",
        },
      });
    }

    if (name.length > 160 || prompt.length > 50000 || description.length > 5000) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Project name, description, or prompt is too long.",
          requestId: (req as any).requestId || "",
        },
      });
    }

    const baseSlug =
      name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) ||
      `project-${Date.now()}`;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    let slug = baseSlug;
    let suffix = 1;
    while (true) {
      const [existing] = await connection.query(
        `SELECT id FROM projects
         WHERE owner_user_id = ? AND slug = ?
         LIMIT 1`,
        [userId, slug],
      );
      if ((existing as any[]).length === 0) break;
      slug = `${baseSlug.slice(0, 90)}-${suffix++}`;
    }

    const [projectResult] = await connection.query(
      `INSERT INTO projects
         (owner_user_id, name, slug, description, framework, status, visibility)
       VALUES (?, ?, ?, ?, ?, 'draft', 'private')`,
      [userId, name, slug, description || null, framework],
    );

    const projectId = Number((projectResult as any).insertId);

    await connection.query(
      `INSERT INTO project_versions
         (project_id, version_number, created_by_user_id, source_prompt, status)
       VALUES (?, 1, ?, ?, 'draft')`,
      [projectId, userId, prompt],
    );

    await connection.commit();

    return res.status(201).json({
      data: {
        id: projectId,
        projectId,
        name,
        slug,
        framework,
        status: "draft",
        current_version_number: 1,
        project: { id: projectId, name, slug, framework, status: "draft" },
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {
        // Preserve the original database error.
      }
    }
    return next(error);
  } finally {
    connection?.release();
  }
});

// Soft-delete a project owned by the current user.
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized(res, req);

    const projectId = Number(req.params.id);
    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid project ID.",
          requestId: (req as any).requestId || "",
        },
      });
    }

    const [result] = await getPool().query(
      `UPDATE projects
       SET deleted_at = NOW(3)
       WHERE id = ? AND owner_user_id = ? AND deleted_at IS NULL`,
      [projectId, userId],
    );

    if (Number((result as any).affectedRows) === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Project not found.",
          requestId: (req as any).requestId || "",
        },
      });
    }

    return res.json({ data: { deleted: true, projectId } });
  } catch (error) {
    return next(error);
  }
});

// List versions for a project ID, enforcing project ownership.
router.get("/:id/versions", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized(res, req);

    const projectId = Number(req.params.id);
    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid project ID.",
          requestId: (req as any).requestId || "",
        },
      });
    }

    const [rows] = await getPool().query(
      `SELECT pv.id, pv.version_number, pv.source_prompt, pv.summary, pv.status,
              pv.created_at, u.display_name AS created_by_name
       FROM project_versions pv
       INNER JOIN projects p ON p.id = pv.project_id
       LEFT JOIN users u ON u.id = pv.created_by_user_id
       WHERE pv.project_id = ? AND p.owner_user_id = ? AND p.deleted_at IS NULL
       ORDER BY pv.version_number DESC`,
      [projectId, userId],
    );

    return res.json({ data: rows });
  } catch (error) {
    return next(error);
  }
});

// Return the latest generated website version for a project slug.
router.get(
  "/:slug/preview",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      if (!userId) return unauthorized(res, req);


      const slug = req.params.slug;

      console.log("[Preview Debug]", {
        slug,
        userId,
        expectedOwnerId: 1,
      });
      const [rows] = await getPool().query(
        `SELECT
           p.id AS project_id,
           p.name AS project_name,
           p.slug AS project_slug,
           pv.id AS version_id,
           pv.version_number,
           pv.summary AS html,
           pv.source_prompt,
           pv.created_at
         FROM projects p
         INNER JOIN project_versions pv ON pv.project_id = p.id
         WHERE p.slug = ?
           AND p.owner_user_id = ?
           AND p.deleted_at IS NULL
           AND pv.status = 'ready'
         ORDER BY pv.version_number DESC, pv.id DESC
         LIMIT 1`,
        [slug, userId],
      );

      const versions = rows as Array<{
        project_id: number;
        project_name: string;
        project_slug: string;
        version_id: number;
        version_number: number;
        html: string | null;
        source_prompt: string | null;
        created_at: Date;
      }>;

      if (versions.length === 0) {
        return res.status(404).json({
          error: {
            code: "PREVIEW_NOT_FOUND",
            message: "No generated website version was found for this project.",
            requestId: (req as any).requestId || "",
          },
        });
      }

      const version = versions[0];
      if (typeof version.html !== "string" || !version.html.trim()) {
        return res.status(422).json({
          error: {
            code: "EMPTY_PREVIEW",
            message: "The generated version does not contain website HTML.",
            requestId: (req as any).requestId || "",
          },
        });
      }

      return res.json({
        data: {
          projectId: version.project_id,
          projectName: version.project_name,
          projectSlug: version.project_slug,
          versionId: version.version_id,
          versionNumber: version.version_number,
          html: version.html,
          prompt: version.source_prompt,
          createdAt: version.created_at,
        },
      });
    } catch (error) {
      return next(error);
    }
  },
);

export default router;
