/**
 * Environment configuration.
 */

import "dotenv/config";


const REQUIRED = [
  "NODE_ENV",
  "PORT",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "SESSION_SECRET",
  "AI_PROVIDER",
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

export function validateEnv(): void {
  const missing = checkRequired();
  if (missing.length > 0) {
    throw new Error("Missing required env vars: " + missing.join(", ") + "\nCreate api/.env from .env.example and fill in the values.");
  }
}

export const config = {
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT) || 4000,
  host: process.env.HOST ?? "127.0.0.1",

  db: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME ?? "ai_cms",
    user: process.env.DB_USER ?? "ai_cms_app",
    password: process.env.DB_PASSWORD ?? "1687",
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    connectTimeout: 10_000,
    timezone: "+00:00",
  },

  sessionSecret: process.env.SESSION_SECRET ?? "",
  corsOrigin: (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(",").map(function (s) { return s.trim(); }),

  aiProvider: ((process.env.AI_PROVIDER ?? "ollama") as "ollama" | "anthropic"),
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
  ollamaModel: process.env.OLLAMA_MODEL ?? "qwen3:14b",
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  groqModel: process.env.GROQ_MODEL ?? "openai/gpt-oss-120b",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  anthropicModel: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",

  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 90000_000,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 100000,

  isProd: process.env.NODE_ENV === "production",
};
