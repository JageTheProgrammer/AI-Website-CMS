/**
 * Persistence for site documents.
 *
 * A site document (JSON page tree built from the component library) is stored as
 * `project_files.file_path = 'site.json'` on each project version. The rendered preview
 * HTML is also kept in `project_versions.summary`, so the existing preview route and the
 * current editor page keep working unchanged while the new editor reads `site.json`.
 */
import crypto from "node:crypto";
import type { PoolConnection } from "mysql2/promise";
import { getPool } from "../../../lib/db";
import { renderPage, validateDocument, type Issue, type PageDocument } from "@cms/component-library";

export const SITE_FILE = "site.json";
export const RAW_FILE = "generation/raw-response.txt";
export const MANUAL_EDIT_LABEL = "Manual edit";
/** Consecutive manual saves within this window update the same version instead of adding new ones. */
const COALESCE_SECONDS = 600;

export interface ProjectRef {
  id: number;
  name: string;
  slug: string;
  currentVersionNumber: number;
}

export interface StoredDocument {
  document: PageDocument;
  versionId: number;
  versionNumber: number;
  sha256: string;
}

export const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function getProjectBySlug(slug: string, userId: number): Promise<ProjectRef | null> {
  const [rows] = await getPool().query(
    `SELECT id, name, slug, current_version_number
     FROM projects
     WHERE slug = ? AND owner_user_id = ? AND deleted_at IS NULL
     LIMIT 1`,
    [slug, userId],
  );
  const r = (rows as any[])[0];
  return r
    ? { id: Number(r.id), name: r.name, slug: r.slug, currentVersionNumber: Number(r.current_version_number) }
    : null;
}

/** Load a project's document: a specific version, or the newest version that has one. */
export async function loadDocument(projectId: number, versionNumber?: number): Promise<StoredDocument | null> {
  const [rows] = await getPool().query(
    `SELECT pf.content, pv.id AS version_id, pv.version_number
     FROM project_versions pv
     JOIN project_files pf ON pf.project_version_id = pv.id AND pf.file_path = ?
     WHERE pv.project_id = ? ${versionNumber ? "AND pv.version_number = ?" : ""}
     ORDER BY pv.version_number DESC
     LIMIT 1`,
    versionNumber ? [SITE_FILE, projectId, versionNumber] : [SITE_FILE, projectId],
  );
  const r = (rows as any[])[0];
  if (!r) return null;
  const content = String(r.content);
  // Stored documents were validated on save; validating again upgrades old documents and
  // protects the editor/renderer from hand-edited rows.
  const res = validateDocument(JSON.parse(content));
  if (!res.ok || !res.document) return null;
  return {
    document: res.document,
    versionId: Number(r.version_id),
    versionNumber: Number(r.version_number),
    sha256: sha256(content),
  };
}

/** HTML kept in project_versions.summary (what the existing preview endpoint serves). */
export function renderPreviewHtml(document: PageDocument): string {
  return renderPage(document, "/", {
    mode: "preview",
    tailwind: "cdn",
    pageHref: (p) => (p === "/" ? "#" : `#page:${p}`),
  });
}

export async function withTransaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const out = await fn(conn);
    await conn.commit();
    return out;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export interface SaveArgs {
  projectId: number;
  userId: number;
  document: PageDocument;
  sourcePrompt: string;
  rawResponse?: string;
  /** Merge into the latest manual-edit version when it is recent (autosave). */
  coalesce?: boolean;
}

/** Must be called inside a transaction (see withTransaction). */
export async function saveDocumentVersion(
  conn: PoolConnection,
  a: SaveArgs,
): Promise<{ versionId: number; versionNumber: number; coalesced: boolean }> {
  const [projectRows] = await conn.query(
    `SELECT id, current_version_number, status
     FROM projects
     WHERE id = ? AND owner_user_id = ? AND deleted_at IS NULL
     FOR UPDATE`,
    [a.projectId, a.userId],
  );
  const project = (projectRows as any[])[0] as
    | { id: number | string; current_version_number: number | string; status: string }
    | undefined;
  if (!project) throw new Error("The project was deleted or is no longer accessible.");

  const json = JSON.stringify(a.document);
  const html = renderPreviewHtml(a.document);
  const hash = sha256(json);
  const size = Buffer.byteLength(json, "utf8");
  const [versionRows] = await conn.query(
    `SELECT COALESCE(MAX(version_number), 0) AS max_version_number
     FROM project_versions
     WHERE project_id = ?`,
    [a.projectId],
  );
  const maxExistingVersion = Number(
    (versionRows as Array<{ max_version_number: number | string }>)[0]
      ?.max_version_number ?? 0,
  );
  const current = Math.max(Number(project.current_version_number) || 0, maxExistingVersion);

  if (a.coalesce && current > 0) {
    const [latest] = await conn.query(
      `SELECT id FROM project_versions
       WHERE project_id = ? AND version_number = ?
         AND source_prompt = ? AND created_by_user_id = ?
         AND TIMESTAMPDIFF(SECOND, created_at, NOW(3)) < ?
       LIMIT 1`,
      [a.projectId, current, MANUAL_EDIT_LABEL, a.userId, COALESCE_SECONDS],
    );
    const row = (latest as any[])[0];
    if (row) {
      const versionId = Number(row.id);
      await conn.query(`UPDATE project_versions SET summary = ? WHERE id = ?`, [html, versionId]);
      await conn.query(
        `UPDATE project_files SET content = ?, content_sha256 = ?, size_bytes = ?
         WHERE project_version_id = ? AND file_path = ?`,
        [json, hash, size, versionId, SITE_FILE],
      );
      await conn.query(`UPDATE projects SET updated_at = NOW(3) WHERE id = ?`, [a.projectId]);
      return { versionId, versionNumber: current, coalesced: true };
    }
  }

  const versionNumber = current + 1;
  const [vr] = await conn.query(
    `INSERT INTO project_versions
       (project_id, version_number, source_prompt, summary, status, created_by_user_id)
     VALUES (?, ?, ?, ?, 'ready', ?)`,
    [a.projectId, versionNumber, a.sourcePrompt.slice(0, 5000), html, a.userId],
  );
  const versionId = Number((vr as any).insertId);

  await conn.query(
    `INSERT INTO project_files (project_version_id, file_path, content, content_sha256, size_bytes)
     VALUES (?, ?, ?, ?, ?)`,
    [versionId, SITE_FILE, json, hash, size],
  );
  if (a.rawResponse) {
    await conn.query(
      `INSERT INTO project_files (project_version_id, file_path, content, size_bytes)
       VALUES (?, ?, ?, ?)`,
      [versionId, RAW_FILE, a.rawResponse, Buffer.byteLength(a.rawResponse, "utf8")],
    );
  }
  await conn.query(
    `UPDATE projects
     SET current_version_number = ?,
         status = IF(status = 'published', 'published', 'ready'),
         updated_at = NOW(3)
     WHERE id = ?`,
    [versionNumber, a.projectId],
  );
  return { versionId, versionNumber, coalesced: false };
}

export const issuesForClient = (issues: Issue[], limit = 50) => issues.slice(0, limit);
