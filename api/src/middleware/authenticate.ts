import { Request, Response, NextFunction } from "express";

export interface AuthUser {
  id: number;
  email: string;
  display_name: string;
  role: "customer" | "admin";
}

// Augment express-session data with the authenticated user ID.
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.userId) {
    res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Not authenticated.", requestId: (req as any).requestId || "" },
    });
    return;
  }
  next();
}
