/**
 * Document routes: the JSON page tree the visual editor reads and writes.
 *
 *   GET  /api/documents/components     component registry for the palette/inspector
 *   GET  /api/documents/:slug          latest document
 *   PUT  /api/documents/:slug          save (validated; creates or coalesces a version)
 *   POST /api/documents/:slug/restore  copy an older version forward as a new version
 *   GET  /api/documents/:slug/render   HTML for one page (?page=/about&mode=preview|edit)
 *   GET  /api/documents/:slug/export   static files { path: html } for deployment
 */
import { Router, Request, Response, NextFunction } from "express";
import { recordAuditLog } from "../../lib/audit-log";
import {
  THEME_OPTIONS,
  CATEGORIES,
  ICON_NAMES,
  describeComponents,
  exportSite,
  normalizePagePath,
  renderPage,
  validateDocument,
} from "@cms/component-library";
import {
  MANUAL_EDIT_LABEL,
  getProjectBySlug,
  issuesForClient,
  loadDocument,
  saveDocumentVersion,
  sha256,
  withTransaction,
} from "../modules/documents/document-store";

const router = Router();

const requestId = (req: Request) => (req as any).requestId;
const getUserId = (req: Request): number | null => (req as any).session?.userId ?? null;

function sendError(req: Request, res: Response, status: number, code: string, message: string, details?: unknown) {
  return res.status(status).json({ error: { code, message, details, requestId: requestId(req) } });
}

/** Resolve the signed-in user and the project they own, or send the error response. */
async function projectFor(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    sendError(req, res, 401, "UNAUTHORIZED", "Not authenticated.");
    return null;
  }
  const slug = String(req.params.slug ?? "").trim();
  const project = slug ? await getProjectBySlug(slug, userId) : null;
  if (!project) {
    sendError(req, res, 404, "NOT_FOUND", "Project not found.");
    return null;
  }
  return { userId, project };
}

// Component registry (static; safe to cache briefly)
router.get("/components", (req: Request, res: Response) => {
  if (!getUserId(req)) return sendError(req, res, 401, "UNAUTHORIZED", "Not authenticated.");
  res.set("Cache-Control", "private, max-age=300");
  res.json({
    data: {
      components: describeComponents(),
      categories: CATEGORIES,
      theme: THEME_OPTIONS,
      icons: ICON_NAMES,
    },
  });
});

router.get("/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = await projectFor(req, res);
    if (!ctx) return;
    const stored = await loadDocument(ctx.project.id);
    if (!stored) {
      return sendError(
        req,
        res,
        404,
        "NO_DOCUMENT",
        "This project has no editable document yet. Generate it with a prompt first.",
      );
    }
    res.json({
      data: {
        projectId: ctx.project.id,
        projectSlug: ctx.project.slug,
        projectName: ctx.project.name,
        versionNumber: stored.versionNumber,
        document: stored.document,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.put("/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = await projectFor(req, res);
    if (!ctx) return;

    const result = validateDocument(req.body?.document);
    if (!result.ok || !result.document) {
      return sendError(req, res, 422, "INVALID_DOCUMENT", "The document is not valid.", issuesForClient(result.errors));
    }

    const current = await loadDocument(ctx.project.id);
    const baseVersion = req.body?.baseVersion;
    if (baseVersion !== undefined && current && Number(baseVersion) !== current.versionNumber) {
      return sendError(
        req,
        res,
        409,
        "VERSION_CONFLICT",
        "The project changed since you opened it (for example an AI generation finished). Reload to continue.",
        { currentVersion: current.versionNumber },
      );
    }

    const json = JSON.stringify(result.document);
    if (current && sha256(json) === current.sha256) {
      return res.json({
        data: { versionNumber: current.versionNumber, versionId: current.versionId, unchanged: true, warnings: [] },
      });
    }

    const saved = await withTransaction((conn) =>
      saveDocumentVersion(conn, {
        projectId: ctx.project.id,
        userId: ctx.userId,
        document: result.document!,
        sourcePrompt: typeof req.body?.label === "string" && req.body.label.trim() ? req.body.label.trim() : MANUAL_EDIT_LABEL,
        coalesce: req.body?.coalesce !== false,
      }),
    );

    await recordAuditLog({
      actorUserId: ctx.userId,
      projectId: ctx.project.id,
      action: "document.saved",
      resourceType: "document",
      resourceId: saved.versionNumber,
      request: req,
      metadata: { coalesced: saved.coalesced },
    });

    res.json({
      data: {
        versionNumber: saved.versionNumber,
        versionId: saved.versionId,
        coalesced: saved.coalesced,
        unchanged: false,
        document: result.document,
        warnings: issuesForClient(result.warnings),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/:slug/restore", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = await projectFor(req, res);
    if (!ctx) return;
    const versionNumber = Number(req.body?.versionNumber);
    if (!Number.isInteger(versionNumber) || versionNumber < 1) {
      return sendError(req, res, 400, "VALIDATION_ERROR", "versionNumber must be a positive integer.");
    }
    const old = await loadDocument(ctx.project.id, versionNumber);
    if (!old) return sendError(req, res, 404, "NOT_FOUND", "That version has no editable document.");

    const saved = await withTransaction((conn) =>
      saveDocumentVersion(conn, {
        projectId: ctx.project.id,
        userId: ctx.userId,
        document: old.document,
        sourcePrompt: `Restored version ${versionNumber}`,
      }),
    );
    await recordAuditLog({
      actorUserId: ctx.userId,
      projectId: ctx.project.id,
      action: "document.restored",
      resourceType: "document",
      resourceId: saved.versionNumber,
      request: req,
      metadata: { restoredVersion: versionNumber },
    });
    res.status(201).json({ data: { versionNumber: saved.versionNumber, document: old.document } });
  } catch (err) {
    next(err);
  }
});

router.get("/:slug/render", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = await projectFor(req, res);
    if (!ctx) return;
    const requested = Number(req.query.version);
    const stored = await loadDocument(ctx.project.id, Number.isInteger(requested) && requested > 0 ? requested : undefined);
    if (!stored) return sendError(req, res, 404, "NO_DOCUMENT", "No document for this project.");

    const page = normalizePagePath(req.query.page ?? "/") ?? "/";
    const mode = req.query.mode === "edit" ? "edit" : "preview";
    const html = renderPage(stored.document, page, {
      mode,
      tailwind: "cdn",
      pageHref: (p) => `?page=${encodeURIComponent(p)}&mode=${mode}`,
    });
    res.set("Content-Type", "text/html; charset=utf-8");
    res.set("X-Content-Type-Options", "nosniff");
    res.send(html);
  } catch (err) {
    next(err);
  }
});

router.get("/:slug/export", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = await projectFor(req, res);
    if (!ctx) return;
    const stored = await loadDocument(ctx.project.id);
    if (!stored) return sendError(req, res, 404, "NO_DOCUMENT", "No document for this project.");
    const formEndpoint = typeof req.query.formEndpoint === "string" ? req.query.formEndpoint : undefined;
    res.json({ data: { versionNumber: stored.versionNumber, files: exportSite(stored.document, { formEndpoint }) } });
  } catch (err) {
    next(err);
  }
});

export default router;
