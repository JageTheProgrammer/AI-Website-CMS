import type { NextFunction, Request, Response } from "express";
import { getPool } from "../../lib/db";
import {
  normalizePagePath,
  renderPage,
  validateDocument,
} from "@cms/component-library";
import { getPublicSiteDomain } from "../modules/sites/public-site-config";

const RESERVED_HOSTS = new Set(["admin", "api", "app", "assets", "mail", "static", "www"]);

function hostnameFromRequest(req: Request): string | null {
  const host = req.get("host");
  if (!host) return null;

  try {
    return new URL(`http://${host}`).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export async function servePublicSite(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (req.method !== "GET" && req.method !== "HEAD") {
    next();
    return;
  }

  let domain: string;
  try {
    domain = getPublicSiteDomain();
  } catch (error) {
    next(error);
    return;
  }

  const hostname = hostnameFromRequest(req);
  if (!hostname || !hostname.endsWith(`.${domain}`)) {
    next();
    return;
  }

  const subdomain = hostname.slice(0, -(domain.length + 1));
  if (!subdomain || subdomain.includes(".") || RESERVED_HOSTS.has(subdomain)) {
    next();
    return;
  }

  try {
    const [rows] = await getPool().query(
      `SELECT pf.content
       FROM projects p
       INNER JOIN project_versions pv
         ON pv.project_id = p.id
        AND pv.version_number = p.current_version_number
       INNER JOIN project_files pf
         ON pf.project_version_id = pv.id
        AND pf.file_path = 'site.json'
       WHERE p.platform_subdomain = ?
         AND p.status = 'published'
         AND p.visibility = 'public'
         AND p.deleted_at IS NULL
         AND pv.status IN ('ready', 'published')
       LIMIT 1`,
      [subdomain],
    );

    const row = (rows as Array<{ content: string | Buffer }>)[0];
    if (!row) {
      res.status(404).type("text/plain").send("Website not found.");
      return;
    }

    const parsed: unknown = JSON.parse(
      Buffer.isBuffer(row.content) ? row.content.toString("utf8") : row.content,
    );
    const result = validateDocument(parsed);
    if (!result.ok || !result.document) {
      console.error("[Public Site] Stored document failed validation:", {
        subdomain,
        issues: result.errors,
      });
      res.status(500).type("text/plain").send("Website content is temporarily unavailable.");
      return;
    }

    const page = normalizePagePath(req.path);
    if (!page) {
      res.status(404).type("text/plain").send("Page not found.");
      return;
    }

    if (!result.document.pages.some((candidate) => candidate.path === page)) {
      res.status(404).type("text/plain").send("Page not found.");
      return;
    }

    const html = renderPage(result.document, page, {
      mode: "publish",
      tailwind: "cdn",
      pageHref: (path) => path,
      baseUrl: `https://${subdomain}.${domain}`,
    });

    res
      .status(200)
      .set("Content-Type", "text/html; charset=utf-8")
      .set("X-Content-Type-Options", "nosniff");

    if (req.method === "HEAD") {
      res.end();
    } else {
      res.send(html);
    }
  } catch (error) {
    next(error);
  }
}
