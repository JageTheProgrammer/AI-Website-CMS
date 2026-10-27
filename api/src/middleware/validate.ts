import { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";

export function validate(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: firstError.message || "Invalid input.",
          requestId: (req as any).requestId || "",
          field: firstError.path.join("."),
        },
      });
      return;
    }
    next();
  };
}
