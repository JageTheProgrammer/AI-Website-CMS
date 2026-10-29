/**
 * Generation routes - create generation jobs and check their status.
 *
 * The AI no longer writes HTML. It returns a JSON page tree built ONLY from the component
 * library (@cms/component-library). The server validates it (with automatic repair rounds),
 * stores it as site.json and renders the preview HTML from it.
 */
import { Router, Request, Response, NextFunction } from "express";
import { recordAuditLog } from "../../lib/audit-log";
import { DocumentGenerationError, generateDocument } from "@cms/component-library";
import { getPool } from "../../lib/db";
import { config } from "../../lib/env";
import {
  AnthropicProvider,
  GroqProvider,
  OllamaProvider,
  OllamaUnavailableError,
  type AIProvider,
} from "../modules/ai/providers/base";
import { loadDocument, saveDocumentVersion, withTransaction } from "../modules/documents/document-store";
import { getPublicSiteUrl } from "../modules/sites/public-site-config";

const router = Router();

/** How many times the model may be asked to fix an invalid document. */
const MAX_ATTEMPTS = Math.max(1, Number(process.env.AI_MAX_ATTEMPTS) || 3);

function getUserId(req: Request): number | null {
  return (req as any).session?.userId ?? null;
}

// Create a generation job

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Not authenticated.", requestId: (req as any).requestId },
      });
    }

    const projectSlug = typeof req.body?.projectSlug === "string" ? req.body.projectSlug.trim() : "";
    const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";

    if (!projectSlug || !prompt) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "projectSlug and prompt are required.", requestId: (req as any).requestId },
      });
    }

    if (prompt.length > 50000) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Prompt must be 50,000 characters or fewer.", requestId: (req as any).requestId },
      });
    }

    const [projectRows] = await getPool().query(
      `SELECT id
       FROM projects
       WHERE slug = ?
         AND owner_user_id = ?
         AND deleted_at IS NULL
       LIMIT 1`,
      [projectSlug, userId],
    );

    const projects = projectRows as Array<{ id: number | string }>;

    if (projects.length === 0) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Project not found.", requestId: (req as any).requestId },
      });
    }

    const projectId = Number(projects[0].id);

    const providerName = config.aiProvider;
    const model =
      config.aiProvider === "anthropic"
        ? config.anthropicModel
        : config.ollamaModel;

    const [insertResult] = await getPool().query(
      `INSERT INTO generation_jobs
        (project_id, requested_by_user_id, provider, model, prompt, status)
       VALUES (?, ?, ?, ?, ?, 'queued')`,
      [projectId, userId, providerName, model, prompt],
    );

    const jobId = Number((insertResult as any).insertId);
    await recordAuditLog({
      actorUserId: userId,
      projectId,
      action: "generation.started",
      resourceType: "generation_job",
      resourceId: jobId,
      request: req,
    });

    // Start processing after responding to the client.
    // For reliable production processing across restarts, use a durable worker/queue.
    res.status(201).json({ data: { jobId, projectId, status: "queued" } });

    void runGeneration(jobId, projectId, userId, prompt).catch((err) => {
      console.error(`[Generation] Job ${jobId} failed unexpectedly:`, err);
    });
  } catch (err) {
    console.error("[Generation] Failed to create job:", err);
    next(err);
  }
});

// Get generation job status
router.get("/:jobId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Not authenticated.", requestId: (req as any).requestId } });

    const jobId = Number(req.params.jobId);
    if (isNaN(jobId)) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid job ID.", requestId: (req as any).requestId } });

    const [rows] = await getPool().query(
      "SELECT id, project_id, status, progress_percent, error_code, error_message, result_version_id, started_at, finished_at, created_at, updated_at FROM generation_jobs WHERE id = ? AND requested_by_user_id = ?",
      [jobId, userId],
    );
    const job = (rows as Array<any>).pop();

    if (!job) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Generation job not found.", requestId: (req as any).requestId } });

    res.json({ data: job });
  } catch (err) { next(err); }
});

function createProvider(): AIProvider {
  return config.aiProvider === "anthropic"
    ? new AnthropicProvider(config.anthropicApiKey, config.anthropicModel)
    : new OllamaProvider(config.ollamaBaseUrl, config.ollamaModel);
}

function createGroqFallback(): AIProvider {
  return new GroqProvider(config.groqApiKey, config.groqModel);
}

async function setProgress(jobId: number, percent: number): Promise<void> {
  await getPool().query(`UPDATE generation_jobs SET progress_percent = ? WHERE id = ?`, [percent, jobId]);
}

async function runGeneration(jobId: number, projectId: number, userId: number, prompt: string): Promise<void> {
  let actualProvider: string = config.aiProvider;
  let actualModel =
    config.aiProvider === "anthropic" ? config.anthropicModel : config.ollamaModel;

  try {
    await getPool().query(
      `UPDATE generation_jobs
       SET status = 'running',
           progress_percent = 10,
           started_at = NOW(3),
           error_code = NULL,
           error_message = NULL
       WHERE id = ?`,
      [jobId],
    );

    // An existing document means this is a modification request, not a fresh site.
    const existing = await loadDocument(projectId);
    const provider = createProvider();

    const result = await generateDocument({
      prompt,
      current: existing?.document ?? null,
      maxAttempts: MAX_ATTEMPTS,
      onAttempt: (attempt) => {
        console.info("[Generation] Attempt", { jobId, attempt, modifying: !!existing });
        void setProgress(jobId, Math.min(60, 20 + attempt * 15)).catch(() => undefined);
      },
      complete: async ({ system, prompt: userPrompt, history }) => {
        const input = {
          systemPrompt: system,
          prompt: userPrompt,
          history,
          jsonMode: true,
        } as const;
        let out;
        try {
          out = await provider.generate(input);
        } catch (error) {
          if (
            config.aiProvider !== "ollama" ||
            !(error instanceof OllamaUnavailableError)
          ) {
            throw error;
          }

          if (!config.groqApiKey) {
            throw new Error(
              `${error.message} Configure GROQ_API_KEY to enable Groq fallback.`,
            );
          }

          actualProvider = "groq";
          actualModel = config.groqModel;
          await getPool().query(
            "UPDATE generation_jobs SET provider = ?, model = ? WHERE id = ?",
            [actualProvider, actualModel, jobId],
          );
          console.warn("[AI] Ollama unavailable; using configured Groq fallback.", {
            jobId,
            ollamaStatus: error.status ?? null,
            fallbackModel: actualModel,
          });
          out = await createGroqFallback().generate(input);
        }
        if (typeof out?.text !== "string" || !out.text.trim()) {
          throw new Error("The AI provider returned an empty response.");
        }
        return out.text;
      },
    });

    console.info("[Generation] Document accepted:", {
      jobId,
      attempts: result.attempts,
      pages: result.document.pages.length,
      warnings: result.warnings.length,
    });

    await setProgress(jobId, 80);

    // Saving, publishing, and registering its deployment are atomic.
    const saved = await withTransaction(async (conn) => {
      const v = await saveDocumentVersion(conn, {
        projectId,
        userId,
        document: result.document,
        sourcePrompt: prompt,
        rawResponse: result.raw,
      });
      const [projectRows] = await conn.query(
        "SELECT platform_subdomain FROM projects WHERE id = ? FOR UPDATE",
        [projectId],
      );
      const project = (projectRows as Array<{ platform_subdomain: string | null }>)[0];
      if (!project?.platform_subdomain) {
        throw new Error("The project does not have a reserved public subdomain.");
      }

      const deploymentUrl = getPublicSiteUrl(project.platform_subdomain);
      await conn.query(
        `UPDATE projects
         SET status = 'published', visibility = 'public', updated_at = NOW(3)
         WHERE id = ?`,
        [projectId],
      );
      await conn.query(
        `UPDATE project_versions SET status = 'published' WHERE id = ?`,
        [v.versionId],
      );
      const [deploymentResult] = await conn.query(
        `INSERT INTO deployments
           (project_id, project_version_id, created_by_user_id, target, status,
            deployment_url, build_id, started_at, finished_at)
         VALUES (?, ?, ?, 'platform', 'succeeded', ?, ?, NOW(3), NOW(3))`,
        [projectId, v.versionId, userId, deploymentUrl, `generation-${jobId}`],
      );
      await conn.query(
        `UPDATE generation_jobs
         SET status = 'succeeded',
             progress_percent = 100,
             result_version_id = ?,
             error_code = NULL,
             error_message = NULL,
             finished_at = NOW(3)
         WHERE id = ?`,
        [v.versionId, jobId],
      );
      return { ...v, deploymentId: Number((deploymentResult as any).insertId), deploymentUrl };
    });

    console.info("[Generation] Completed:", { jobId, projectId, versionId: saved.versionId, versionNumber: saved.versionNumber });
    await recordAuditLog({
      actorUserId: userId,
      projectId,
      action: "generation.completed",
      resourceType: "generation_job",
      resourceId: jobId,
      metadata: { versionNumber: saved.versionNumber },
    });
    await recordAuditLog({
      actorUserId: userId,
      projectId,
      action: "deployment.published",
      resourceType: "deployment",
      resourceId: saved.deploymentId,
      metadata: { versionNumber: saved.versionNumber, url: saved.deploymentUrl },
    });
  } catch (err: any) {
    console.error(`[Generation] Job ${jobId} failed:`, err);

    const code = err instanceof DocumentGenerationError ? err.code : "GENERATION_FAILED";
    if (actualProvider === "groq") {
      await getPool().query(
        "UPDATE generation_jobs SET provider = ?, model = ? WHERE id = ?",
        [actualProvider, actualModel, jobId],
      );
    }
    await recordAuditLog({
      actorUserId: userId,
      projectId,
      action: "generation.failed",
      resourceType: "generation_job",
      resourceId: jobId,
      metadata: { errorCode: code },
    });
    await getPool().query(
      `UPDATE generation_jobs
       SET status = 'failed',
           error_code = ?,
           error_message = ?,
           progress_percent = 100,
           finished_at = NOW(3)
       WHERE id = ?`,
      [code, String(err?.message || "Unknown generation error").slice(0, 5000), jobId],
    );
  }
}

export default router;
