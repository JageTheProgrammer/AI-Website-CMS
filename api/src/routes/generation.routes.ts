/**
 * Generation routes - create generation jobs and check their status.
 */
import { Router, Request, Response, NextFunction } from "express";
import { getPool } from "../../lib/db";
import { config } from "../../lib/env";
import { OllamaProvider, AnthropicProvider } from "../modules/ai/providers/base";

const router = Router();

function getUserId(req: Request): number | null {
  return (req as any).session?.userId ?? null;
}

// Create a generation job

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Not authenticated.",
          requestId: (req as any).requestId,
        },
      });
    }

    const projectSlug =
      typeof req.body?.projectSlug === "string"
        ? req.body.projectSlug.trim()
        : "";

    const prompt =
      typeof req.body?.prompt === "string"
        ? req.body.prompt.trim()
        : "";

    if (!projectSlug || !prompt) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "projectSlug and prompt are required.",
          requestId: (req as any).requestId,
        },
      });
    }

    if (prompt.length > 50000) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Prompt must be 50,000 characters or fewer.",
          requestId: (req as any).requestId,
        },
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
        error: {
          code: "NOT_FOUND",
          message: "Project not found.",
          requestId: (req as any).requestId,
        },
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

    // Start processing after responding to the client.
    // For reliable production processing across restarts, use a durable worker/queue.
    res.status(201).json({
      data: {
        jobId,
        projectId,
        status: "queued",
      },
    });

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
      [jobId, userId]
    );
    const job = (rows as Array<any>).pop();

    if (!job) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Generation job not found.", requestId: (req as any).requestId } });

    res.json({ data: job });
  } catch (err) { next(err); }
});

// Run the generation
/**
 * Extract a complete HTML document from an AI response.
 * Supports raw HTML and HTML inside Markdown code fences.
 */

/**
 * Extract a complete HTML document from an AI response.
 * Supports raw HTML, Markdown fences, and introductory prose.
 */
function extractHtml(response: string): string | null {
  const text = response.trim();

  if (!text) return null;

  // Prefer a complete HTML document inside a Markdown fence.
  const fencedBlocks = [
    ...text.matchAll(/```(?:html|htm)\s*\n?([\s\S]*?)```/gi),
  ];

  const candidates = [
    ...fencedBlocks.map((match) => match[1].trim()),
    text,
  ];

  for (const candidate of candidates) {
    const doctypeIndex = candidate.search(/<!doctype\s+html\b/i);
    const htmlIndex = candidate.search(/<html(?:\s|>)/i);

    const start =
      doctypeIndex >= 0
        ? doctypeIndex
        : htmlIndex;

    if (start < 0) continue;

    const html = candidate.slice(start).trim();

    // A complete document must have both opening and closing tags.
    if (
      /<html(?:\s|>)/i.test(html) &&
      /<\/html\s*>/i.test(html)
    ) {
      return html;
    }
  }

  return null;
}


async function runGeneration(
  jobId: number,
  projectId: number,
  userId: number,
  prompt: string,
): Promise<void> {
  const systemPrompt = [
    "You are a professional website builder AI.",
    "Generate a complete, responsive, production-quality website.",
    "Return a single, complete, valid HTML document.",
    "Include all CSS and JavaScript inside the HTML document.",
    "Do not truncate the output.",
    "Do not include explanations or Markdown code fences.",
    "Ensure the document includes closing HTML tags.",
  ].join(" ");

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

    const provider: any =
      config.aiProvider === "anthropic"
        ? new AnthropicProvider(
          config.anthropicApiKey,
          config.anthropicModel,
        )
        : new OllamaProvider(
          config.ollamaBaseUrl,
          config.ollamaModel,
        );

    const result = await provider.generate({
      prompt,
      systemPrompt,
    });

    if (typeof result?.text !== "string" || !result.text.trim()) {
      throw new Error("The AI provider returned an empty response.");
    }


    const rawResponse: string = result.text;
    const html = extractHtml(rawResponse);

    if (!html) {
      console.error("[Generation] Incomplete HTML response:", {
        jobId,
        responseCharacters: rawResponse.length,
        responseBytes: Buffer.byteLength(rawResponse, "utf8"),
        responseEnding: rawResponse.slice(-300),
      });

      throw new Error(
        `The AI returned incomplete HTML (${rawResponse.length} characters). ` +
        "Check the model output limit and generation logs, then retry.",
      );
    }

    console.info("[Generation] HTML extracted:", {
      jobId,
      responseCharacters: rawResponse.length,
      htmlCharacters: html.length,
      htmlBytes: Buffer.byteLength(html, "utf8"),
    });


    await getPool().query(
      `UPDATE generation_jobs
       SET progress_percent = 70
       WHERE id = ?`,
      [jobId],
    );

    // Save the version and project counter atomically.
    const connection = await getPool().getConnection();

    let versionId: number;
    let versionNumber: number;

    try {
      await connection.beginTransaction();

      // Lock the project row to prevent concurrent generations
      // from assigning the same version number.
      const [projectRows] = await connection.query(
        `SELECT id, current_version_number
         FROM projects
         WHERE id = ?
           AND owner_user_id = ?
           AND deleted_at IS NULL
         FOR UPDATE`,
        [projectId, userId],
      );

      const project = (projectRows as any[])[0];

      if (!project) {
        throw new Error(
          "The project was deleted or is no longer accessible.",
        );
      }

      versionNumber = Number(project.current_version_number) + 1;

      const [versionResult] = await connection.query(
        `INSERT INTO project_versions (
           project_id,
           version_number,
           source_prompt,
           summary,
           status,
           created_by_user_id
         )
         VALUES (?, ?, ?, ?, 'ready', ?)`,
        [
          projectId,
          versionNumber,
          prompt.slice(0, 5000),
          html,
          userId,
        ],
      );

      versionId = Number((versionResult as any).insertId);

      // Keep the original AI output for debugging and future editing.
      // The preview uses project_versions.summary, which now contains HTML.
      await connection.query(
        `INSERT INTO project_files (
           project_version_id,
           file_path,
           content,
           size_bytes
         )
         VALUES (?, ?, ?, ?)`,
        [
          versionId,
          "GENERATED_MANIFEST.md",
          rawResponse,
          Buffer.byteLength(rawResponse, "utf8"),
        ],
      );

      await connection.query(
        `UPDATE projects
         SET current_version_number = ?,
             status = 'ready',
             updated_at = NOW(3)
         WHERE id = ?
           AND owner_user_id = ?`,
        [versionNumber, projectId, userId],
      );

      await connection.query(
        `UPDATE generation_jobs
         SET status = 'succeeded',
             progress_percent = 100,
             result_version_id = ?,
             error_code = NULL,
             error_message = NULL,
             finished_at = NOW(3)
         WHERE id = ?`,
        [versionId, jobId],
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    console.info("[Generation] Completed:", {
      jobId,
      projectId,
      versionId,
      versionNumber,
      htmlBytes: Buffer.byteLength(html, "utf8"),
    });
  } catch (err: any) {
    console.error(`[Generation] Job ${jobId} failed:`, err);

    await getPool().query(
      `UPDATE generation_jobs
       SET status = 'failed',
           error_code = ?,
           error_message = ?,
           progress_percent = 100,
           finished_at = NOW(3)
       WHERE id = ?`,
      [
        "GENERATION_FAILED",
        String(err?.message || "Unknown generation error").slice(0, 5000),
        jobId,
      ],
    );
  }
}


export default router;
