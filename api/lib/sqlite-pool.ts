/**
 * SQLite adapter that mimics the small part of the mysql2/promise Pool API
 * this project uses: pool.query/execute, getConnection(), beginTransaction(),
 * commit(), rollback(), release(), ping(), end().
 *
 * Uses Node's built-in `node:sqlite` (Node >= 22.5), so no native module has to
 * be rebuilt for Electron.
 *
 * Differences from MySQL that are handled here:
 *  - NOW(n) / CURRENT_TIMESTAMP(n)      -> UTC text timestamp
 *  - INSERT IGNORE                      -> INSERT OR IGNORE
 *  - "FOR UPDATE"                       -> removed (SQLite locks the whole DB)
 *  - GET_LOCK()/RELEASE_LOCK()          -> no-ops (one process, transactions are serialized)
 *  - `IN (?)` with an array param       -> expanded to `IN (?, ?, ...)`
 *  - result: [rows, fields] for SELECT, [{insertId, affectedRows}, undefined] otherwise
 *  - *_at columns come back as Date, `metadata` columns as parsed JSON
 *
 * NOT supported (throws a clear error): ON DUPLICATE KEY UPDATE.
 * Other MySQL-only functions (DATE_SUB, UNIX_TIMESTAMP, ...) fail with SQLite's
 * own "no such function" error - rewrite those queries when you hit them.
 */

import fs from "node:fs";
import path from "node:path";

type Params = unknown[] | undefined;

interface SqliteStatement {
  all(...params: unknown[]): Array<Record<string, unknown>>;
  run(...params: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint };
}
interface SqliteDatabase {
  exec(sql: string): void;
  prepare(sql: string): SqliteStatement;
  close(): void;
}

const NOW_SQL = "strftime('%Y-%m-%d %H:%M:%f','now')";

/* ------------------------------ helpers ---------------------------------- */

function pad(n: number, len = 2): string {
  return String(n).padStart(len, "0");
}

function dateToSql(d: Date): string {
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${pad(d.getUTCMilliseconds(), 3)}`
  );
}

const SQL_DATETIME = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/;

function sqlToDate(value: string): Date {
  return new Date(value.replace(" ", "T") + (value.includes(".") ? "" : ".000") + "Z");
}

function convertParam(value: unknown): unknown {
  if (value === undefined) return null;
  if (value === null) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (value instanceof Date) return dateToSql(value);
  if (typeof value === "bigint") return value;
  if (Buffer.isBuffer(value)) return value;
  if (typeof value === "object") return JSON.stringify(value);
  return value;
}

/** Expand array params for `IN (?)` and flatten the parameter list. */
function expandPlaceholders(sql: string, params: Params): { sql: string; params: unknown[] } {
  if (!params || params.length === 0) return { sql, params: [] };

  let out = "";
  const flat: unknown[] = [];
  let paramIndex = 0;
  let quote: string | null = null;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (quote) {
      out += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      out += ch;
      continue;
    }
    if (ch === "?") {
      const value = params[paramIndex++];
      if (Array.isArray(value)) {
        if (value.length === 0) {
          out += "NULL";
        } else {
          out += value.map(() => "?").join(", ");
          flat.push(...value.map(convertParam));
        }
      } else {
        out += "?";
        flat.push(convertParam(value));
      }
      continue;
    }
    out += ch;
  }
  return { sql: out, params: flat };
}

function translate(sql: string): string {
  if (/\bON\s+DUPLICATE\s+KEY\s+UPDATE\b/i.test(sql)) {
    throw new Error(
      "SQLite adapter: 'ON DUPLICATE KEY UPDATE' is not supported. Rewrite as " +
        "INSERT ... ON CONFLICT (<unique columns>) DO UPDATE SET col = excluded.col.\nSQL: " +
        sql.replace(/\s+/g, " ").slice(0, 200),
    );
  }
  return sql
    .replace(/\b(?:NOW|UTC_TIMESTAMP|CURRENT_TIMESTAMP)\s*\(\s*\d*\s*\)/gi, NOW_SQL)
    .replace(/\bINSERT\s+IGNORE\b/gi, "INSERT OR IGNORE")
    .replace(/\s+FOR\s+UPDATE\b/gi, "");
}

function convertRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(row)) {
    let value = row[key];
    if (typeof value === "string") {
      if (/_at$/.test(key) && SQL_DATETIME.test(value)) {
        value = sqlToDate(value);
      } else if (key === "metadata" && /^\s*[\[{]/.test(value)) {
        try {
          value = JSON.parse(value);
        } catch {
          /* leave as text */
        }
      }
    } else if (typeof value === "bigint") {
      value = Number(value);
    }
    out[key] = value;
  }
  return out;
}

function returnsRows(sql: string): boolean {
  const head = sql.trimStart().slice(0, 12).toUpperCase();
  return (
    head.startsWith("SELECT") ||
    head.startsWith("WITH") ||
    head.startsWith("PRAGMA") ||
    head.startsWith("EXPLAIN") ||
    /\bRETURNING\b/i.test(sql)
  );
}

/* ------------------------------- core ------------------------------------ */

export interface SqlitePoolOptions {
  file: string;
  /** Optional explicit schema path. Otherwise a few default locations are tried. */
  schemaPath?: string;
}

function findSchema(explicit?: string): string | null {
  const here = typeof __dirname !== "undefined" ? __dirname : process.cwd();
  const candidates = [
    explicit,
    process.env.SQLITE_SCHEMA_PATH,
    path.join(process.cwd(), "sql", "schema.sqlite.sql"),
    path.join(here, "..", "..", "sql", "schema.sqlite.sql"),
    path.join(here, "..", "sql", "schema.sqlite.sql"),
  ].filter((p): p is string => Boolean(p));
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

export function createSqlitePool(options: SqlitePoolOptions) {
  const sqlite = (process as unknown as { getBuiltinModule(id: string): any }).getBuiltinModule("node:sqlite");
  if (!sqlite?.DatabaseSync) {
    throw new Error("node:sqlite is not available. Node.js 22.5+ (or Electron 35+) is required.");
  }

  fs.mkdirSync(path.dirname(options.file), { recursive: true });
  const db: SqliteDatabase = new sqlite.DatabaseSync(options.file);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec("PRAGMA busy_timeout = 5000");

  const schema = findSchema(options.schemaPath);
  if (!schema) {
    throw new Error("schema.sqlite.sql not found. Set SQLITE_SCHEMA_PATH or ship api/sql with the app.");
  }
  db.exec(fs.readFileSync(schema, "utf8"));

  const statements = new Map<string, SqliteStatement>();
  function prepare(sql: string): SqliteStatement {
    let stmt = statements.get(sql);
    if (!stmt) {
      stmt = db.prepare(sql);
      statements.set(sql, stmt);
    }
    return stmt;
  }

  /** Executes one statement synchronously and shapes the result like mysql2. */
  function exec(rawSql: string, rawParams: Params): [any, any] {
    if (/^\s*SELECT\s+GET_LOCK\s*\(/i.test(rawSql)) return [[{ acquired: 1 }], undefined];
    if (/^\s*SELECT\s+RELEASE_LOCK\s*\(/i.test(rawSql)) return [[{ released: 1 }], undefined];

    const { sql, params } = expandPlaceholders(translate(rawSql), rawParams);

    if (returnsRows(sql)) {
      const rows = prepare(sql).all(...params).map(convertRow);
      return [rows, undefined];
    }
    const info = prepare(sql).run(...params);
    return [
      {
        fieldCount: 0,
        affectedRows: Number(info.changes),
        changedRows: Number(info.changes),
        insertId: Number(info.lastInsertRowid),
        serverStatus: 0,
        warningStatus: 0,
        info: "",
      },
      undefined,
    ];
  }

  /* ---- transaction lock: one open transaction at a time ---- */

  let txOwner: object | null = null;
  const waiters: Array<() => void> = [];

  function acquire(owner: object, timeoutMs = 30_000): Promise<void> {
    if (txOwner === null) {
      txOwner = owner;
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      const grant = () => {
        clearTimeout(timer);
        txOwner = owner;
        resolve();
      };
      const timer = setTimeout(() => {
        const i = waiters.indexOf(grant);
        if (i >= 0) waiters.splice(i, 1);
        reject(
          new Error(
            "SQLite: timed out waiting for another transaction to finish. " +
              "(A route may be calling pool.query() while it holds a connection with an open transaction.)",
          ),
        );
      }, timeoutMs);
      waiters.push(grant);
    });
  }

  function release(owner: object): void {
    if (txOwner !== owner) return;
    txOwner = null;
    const next = waiters.shift();
    if (next) next();
  }

  async function runOutsideTransaction(sql: string, params: Params): Promise<[any, any]> {
    const owner = {};
    await acquire(owner);
    try {
      return exec(sql, params);
    } finally {
      release(owner);
    }
  }

  function makeConnection() {
    const conn = {
      inTransaction: false,
      async query(sql: string, params?: Params) {
        if (conn.inTransaction) return exec(sql, params);
        return runOutsideTransaction(sql, params);
      },
      async execute(sql: string, params?: Params) {
        return conn.query(sql, params);
      },
      async beginTransaction() {
        if (conn.inTransaction) return;
        await acquire(conn);
        try {
          db.exec("BEGIN IMMEDIATE");
          conn.inTransaction = true;
        } catch (error) {
          release(conn);
          throw error;
        }
      },
      async commit() {
        if (!conn.inTransaction) return;
        try {
          db.exec("COMMIT");
        } finally {
          conn.inTransaction = false;
          release(conn);
        }
      },
      async rollback() {
        if (!conn.inTransaction) return;
        try {
          db.exec("ROLLBACK");
        } finally {
          conn.inTransaction = false;
          release(conn);
        }
      },
      async ping() {
        db.prepare("SELECT 1").all();
      },
      release() {
        if (conn.inTransaction) {
          try {
            db.exec("ROLLBACK");
          } catch {
            /* already closed */
          }
          conn.inTransaction = false;
          release(conn);
        }
      },
      destroy() {
        conn.release();
      },
    };
    return conn;
  }

  return {
    query: (sql: string, params?: Params) => runOutsideTransaction(sql, params),
    execute: (sql: string, params?: Params) => runOutsideTransaction(sql, params),
    async getConnection() {
      return makeConnection();
    },
    async end() {
      try {
        db.close();
      } catch {
        /* already closed */
      }
    },
  };
}
