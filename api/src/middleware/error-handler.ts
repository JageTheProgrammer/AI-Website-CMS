import { Request, Response, NextFunction } from "express";
import { logger } from "../../lib/logger";

interface AppError {
  code?: string;
  message?: string;
}

export function errorHandler(err: Error & AppError, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = err.code === "VALIDATION_ERROR" ? 400 : err.code === "UNAUTHORIZED" ? 401 : 500;
  const message = err.message || "Internal server error.";

  // Log full details server-side only
  if (statusCode >= 500) {
    logger.error("Unhandled error", { error: err.message, stack: err.stack });
  } else {
    logger.warn(`Client error ${statusCode}: ${err.message}`);
  }

  res.status(statusCode).json({
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: statusCode >= 500 ? "Something went wrong. Please try again later." : message,
      requestId: (res as Response & { getHeader: (name: string) => unknown }).getHeader("X-Request-ID") as string || "",
    },
  });
}
