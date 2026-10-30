/**
 * Generic provider for any OpenAI-compatible /chat/completions endpoint.
 * Covers Gemini (AI Studio), Cerebras, Mistral, OpenRouter, Groq, etc.
 *
 * Wire it into wherever you build providers (the place that currently does
 * `new GroqProvider(...)`):
 *
 *   import { createOpenAICompatibleProvider } from "./providers/openai-compatible";
 *   ...
 *   case "gemini":
 *   case "cerebras":
 *   case "mistral":
 *   case "openrouter":
 *     return createOpenAICompatibleProvider(config.aiProvider, config);
 */

import type { AIProvider, GenerateInput, GenerateResult } from "./base";

export interface OpenAICompatibleOptions {
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  /** Env var holding a max-token override, e.g. "GEMINI_MAX_TOKENS". */
  maxTokensEnv?: string;
  defaultMaxTokens?: number;
  extraHeaders?: Record<string, string>;
  /** Some free models reject response_format; set false to rely on prompt + repair loop. */
  supportsJsonMode?: boolean;
}

function positiveInt(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

export class OpenAICompatibleProvider implements AIProvider {
  constructor(private readonly opts: OpenAICompatibleOptions) {
    if (!opts.apiKey) {
      throw new Error(`An API key is required to use the ${opts.name} provider.`);
    }
  }

  async generate(input: GenerateInput): Promise<GenerateResult> {
    const { name, baseUrl, apiKey, model } = this.opts;
    const messages = [
      { role: "system" as const, content: input.systemPrompt },
      ...(input.history ?? []),
      { role: "user" as const, content: input.prompt },
    ];
    const maxTokens = positiveInt(
      this.opts.maxTokensEnv ? process.env[this.opts.maxTokensEnv] : undefined,
      this.opts.defaultMaxTokens ?? 8192,
    );

    const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(this.opts.extraHeaders ?? {}),
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        ...(input.jsonMode && this.opts.supportsJsonMode !== false
          ? { response_format: { type: "json_object" } }
          : {}),
      }),
      signal: AbortSignal.timeout(300_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 429) {
        throw new Error(
          `${name} rate limit reached (HTTP 429). Free tiers have per-minute and per-day caps - ` +
            `wait a bit or switch provider. ${text.slice(0, 200)}`,
        );
      }
      throw new Error(`${name} error ${res.status}: ${text.slice(0, 500)}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string | null }; finish_reason?: string | null }>;
      usage?: { completion_tokens?: number };
    };
    const content = data.choices?.[0]?.message?.content ?? "";

    console.info(`[AI:${name}] Completion:`, {
      model,
      characters: content.length,
      finishReason: data.choices?.[0]?.finish_reason,
      outputTokens: data.usage?.completion_tokens,
      configuredOutputLimit: maxTokens,
    });

    if (!content.trim()) {
      throw new Error(`${name} returned an empty response.`);
    }
    if (data.choices?.[0]?.finish_reason === "length") {
      throw new Error(
        `${name} hit its output-token limit (${maxTokens}). ` +
          `Raise ${this.opts.maxTokensEnv ?? "the max tokens setting"} or simplify the site.`,
      );
    }

    return {
      text: content,
      provider: name,
      model,
      usage: data.usage?.completion_tokens ? { tokens: data.usage.completion_tokens } : undefined,
    };
  }
}

const BASE_URLS: Record<string, string> = {
  gemini: "https://generativelanguage.googleapis.com/v1beta/openai",
  cerebras: "https://api.cerebras.ai/v1",
  mistral: "https://api.mistral.ai/v1",
  openrouter: "https://openrouter.ai/api/v1",
  groq: "https://api.groq.com/openai/v1",
};

export function createOpenAICompatibleProvider(
  name: "gemini" | "cerebras" | "mistral" | "openrouter" | "groq",
  cfg: {
    geminiApiKey: string;
    geminiModel: string;
    cerebrasApiKey: string;
    cerebrasModel: string;
    mistralApiKey: string;
    mistralModel: string;
    openrouterApiKey: string;
    openrouterModel: string;
    groqApiKey: string;
    groqModel: string;
  },
): AIProvider {
  const apiKey = cfg[`${name}ApiKey` as const];
  const model = cfg[`${name}Model` as const];
  return new OpenAICompatibleProvider({
    name,
    baseUrl: BASE_URLS[name],
    apiKey,
    model,
    maxTokensEnv: `${name.toUpperCase()}_MAX_TOKENS`,
    // Gemini's OpenAI endpoint and OpenRouter free models are less reliable with response_format.
    supportsJsonMode: name !== "openrouter",
  });
}
