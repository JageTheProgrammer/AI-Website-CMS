import type { NextFunction, Request, Response } from "express";
import { config } from "../../lib/env";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const allowedOrigins = new Set(config.corsOrigin);

function requestOrigin(req: Request): { present: boolean; origin: string | null } {
  const origin = req.get("origin");
  const referer = req.get("referer");
  const source = origin ?? referer;
  if (!source) return { present: false, origin: null };
  if (source === "null") return { present: true, origin: null };

  try {
    return { present: true, origin: new URL(source).origin };
  } catch {
    return { present: true, origin: null };
  }
}

export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (SAFE_METHODS.has(req.method.toUpperCase())) {
    next();
    return;
  }

  const source = requestOrigin(req);
  const fetchSite = req.get("sec-fetch-site")?.toLowerCase();
  const rejected =
    (source.present && (source.origin === null || !allowedOrigins.has(source.origin))) ||
    (!source.present && fetchSite === "cross-site");

  if (rejected) {
    res.status(403).json({
      error: {
        code: "CSRF_BLOCKED",
        message: "Request origin is not allowed.",
        requestId: (req as Request & { requestId?: string }).requestId ?? "",
      },
    });
    return;
  }

  next();
}
