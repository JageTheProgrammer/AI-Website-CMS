/**
 * Health endpoints — liveness and readiness checks.
 */
import { Router } from "express";
import { dbReady } from "../../lib/db";

const router = Router();

// Liveness: process is alive
router.get("/live", (_req, res) => {
  res.json({ status: "ok" });
});

// Readiness: dependencies are healthy
router.get("/ready", async (_req, res) => {
  const dbOk = await dbReady();
  if (!dbOk) {
    return res.status(503).json({ status: "degraded", reason: "Database unavailable" });
  }
  res.json({ status: "ok" });
});

export default router;
