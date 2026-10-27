/**
 * Application entry point — starts the Express server, validates config,
 * connects the database pool, and registers graceful shutdown.
 */
import { validateEnv, config } from "../lib/env";
import { getPool, closePool } from "../lib/db";
import { logger } from "../lib/logger";
import { app } from "./app";

// Validate required environment before starting
validateEnv();

const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || "127.0.0.1";

let server: ReturnType<typeof app.listen> | null = null;

async function start() {
  // Verify DB connection on startup
  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    logger.info(`Database connected — ${config.db.host}:${config.db.port}/${config.db.database}`);
    conn.release();
  } catch (err: any) {
    logger.error(`Database connection failed: ${err.message}`);
    process.exit(1);
  }

  server = app.listen(PORT, HOST, () => {
    logger.info(`API listening on http://${HOST}:${PORT}`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      logger.error(`Port ${PORT} is already in use`);
      process.exit(1);
    }
    logger.error(`Server error: ${err.message}`);
  });
}

// Graceful shutdown
function shutdown() {
  logger.info("Shutting down...");
  server?.close(() => {
    closePool();
    logger.info("Server closed");
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

start().catch((err) => {
  logger.error(`Startup failed: ${err.message}`);
  process.exit(1);
});
