import mysql from "mysql2/promise";
import { config } from "./env";
import { createSqlitePool } from "./sqlite-pool";

// Typed as mysql.Pool so every existing route keeps compiling unchanged.
// In desktop/local mode (DB_DRIVER=sqlite) this is a SQLite adapter with the same API.
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    if (config.db.driver === "sqlite") {
      pool = createSqlitePool({ file: config.db.sqlitePath }) as unknown as mysql.Pool;
    } else {
      pool = mysql.createPool({
        host: config.db.host,
        port: config.db.port,
        database: config.db.database,
        user: config.db.user,
        password: config.db.password,
        waitForConnections: true,
        connectionLimit: config.db.connectionLimit,
        connectTimeout: config.db.connectTimeout,
        timezone: config.db.timezone,
      });
    }
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/** Health-check the database without exposing credentials. */
export async function dbReady(): Promise<boolean> {
  try {
    const conn = await getPool().getConnection();
    await conn.ping();
    conn.release();
    return true;
  } catch {
    return false;
  }
}
