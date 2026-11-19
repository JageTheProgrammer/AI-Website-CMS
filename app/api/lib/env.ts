/**
 * Environment configuration.
 */

import "dotenv/config";
import path from "node:path";

const isSqlite = (process.env.DB_DRIVER ?? "mysql") === "sqlite";

const REQUIRED = [
  "NODE_ENV",
  "PORT",
  "SESSION_SECRET",
  "AI_PROVIDER",
  // MySQL connection settings are not needed in SQLite (desktop) mode.
  ...(isSqlite ? [] : ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"]),
];

function checkRequired(): string[] {
  const missing: string[] = [];
  for (const key of REQUIRED) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  return missing;
}

function parseCorsOrigins(value: string): string[] {
  const origins = value.split(",").map((origin) => origin.trim());
  if (origins.some((origin) => !origin)) {
    throw new Error("CORS_ORIGIN must contain a comma-separated list of valid HTTP(S) origins.");
  }

  return origins.map((origin) => {
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error(`Invalid CORS_ORIGIN entry: ${origin}`);
    }

    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.origin !== origin ||
      parsed.username ||
      parsed.password
    ) {
      throw new Error(`CORS_ORIGIN entries must be exact HTTP(S) origins: ${origin}`);
    }

    return parsed.origin;
  });
}

export function validateEnv(): void {
  const missing = checkRequired();
  if (missing.length > 0) {
    throw new Error(
      "Missing required env vars: " +
        missing.join(", ") +
        "\nCreate api/.env from .env.example and fill in the values.",
    );
  }
  const sessionSecret = process.env.SESSION_SECRET ?? "";
  if (sessionSecret.trim().length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 non-whitespace characters.");
  }
}

export type AiProviderName =
  | "ollama"
  | "anthropic"
  | "groq"
  | "gemini"
  | "cerebras"
  | "mistral"
  | "openrouter";

export const config = {
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT) || 4000,
  host: process.env.HOST ?? "127.0.0.1",

  /** True when running inside the desktop app. */
  localMode: process.env.LOCAL_MODE === "1",

  db: {
    driver: (isSqlite ? "sqlite" : "mysql") as "sqlite" | "mysql",
    sqlitePath:
      process.env.SQLITE_PATH ??
      path.join(process.env.DATA_DIR ?? process.cwd(), "cms.sqlite"),
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME ?? "ai_cms",
    user: process.env.DB_USER ?? "ai_cms_app",
    // No default: a password must never be baked into source.
    password: process.env.DB_PASSWORD ?? "",
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    connectTimeout: 10_000,
    timezone: "+00:00",
  },

  sessionSecret: process.env.SESSION_SECRET?.trim() ?? "",
  corsOrigin: parseCorsOrigins(process.env.CORS_ORIGIN ?? "http://localhost:3000"),

  aiProvider: (process.env.AI_PROVIDER ?? "ollama") as AiProviderName,
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
  ollamaModel: process.env.OLLAMA_MODEL ?? "qwen3:14b",
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  groqModel: process.env.GROQ_MODEL ?? "openai/gpt-oss-120b",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  anthropicModel: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",

  // Free-tier OpenAI-compatible providers (check each provider's current model names).
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  cerebrasApiKey: process.env.CEREBRAS_API_KEY ?? "",
  cerebrasModel: process.env.CEREBRAS_MODEL ?? "llama-3.3-70b",
  mistralApiKey: process.env.MISTRAL_API_KEY ?? "",
  mistralModel: process.env.MISTRAL_MODEL ?? "mistral-small-latest",
  openrouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  openrouterModel: process.env.OPENROUTER_MODEL ?? "openrouter/free",

  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 300,

  isProd: process.env.NODE_ENV === "production",
};
