
/**
 * AI Provider interface and concrete implementations (Ollama / Groq / Anthropic).
 */

export interface GenerateInput {
  prompt: string;
  systemPrompt: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  /**
   * Ask the provider to return a single JSON object (used for site documents).
   * Ollama enforces it with `format: "json"`; Anthropic has no JSON mode, so the
   * system prompt + server-side validation/repair loop handle it there.
   */
  jsonMode?: boolean;
}

export interface GenerateResult {
  text: string;
  provider: string;
  model: string;
  usage?: { tokens?: number };
}

export interface AIProvider {
  generate(input: GenerateInput): Promise<GenerateResult>;
}

export class OllamaUnavailableError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "OllamaUnavailableError";
  }
}

function getPositiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

// ---------------------------------------------------------------------------
// Ollama provider (local development)
// ---------------------------------------------------------------------------

export class OllamaProvider implements AIProvider {
  constructor(
    private baseUrl: string,
    private model: string,
  ) {}

  async generate(input: GenerateInput): Promise<GenerateResult> {
    const messages = [
      { role: "system" as const, content: input.systemPrompt },
      ...(input.history || []),
      { role: "user" as const, content: input.prompt },
    ];

    const numPredict = getPositiveInteger(
      process.env.OLLAMA_NUM_PREDICT,
      16384,
    );

    let res: Response;
    try {
      res = await fetch(
        `${this.baseUrl.replace(/\/+$/, "")}/api/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: this.model,
            messages,
            stream: false,
            ...(input.jsonMode ? { format: "json" } : {}),
            options: {
              num_predict: numPredict,
            },
          }),
          signal: AbortSignal.timeout(300_000),
        },
      );
    } catch (error) {
      const message =
        error instanceof Error && error.name === "TimeoutError"
          ? "Ollama request timed out."
          : "Could not connect to Ollama.";
      throw new OllamaUnavailableError(message);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 404 || res.status === 408 || res.status === 429 || res.status >= 500) {
        throw new OllamaUnavailableError(
          `Ollama is unavailable (HTTP ${res.status}).`,
          res.status,
        );
      }
      throw new Error(`Ollama request failed (HTTP ${res.status}): ${text.slice(0, 300)}`);
    }

    const data = (await res.json()) as {
      message?: { content?: string };
      done?: boolean;
      done_reason?: string;
      prompt_eval_count?: number;
      eval_count?: number;
    };

    const content = data.message?.content || "";

    console.info("[AI:Ollama] Completion:", {
      model: this.model,
      characters: content.length,
      done: data.done,
      doneReason: data.done_reason,
      promptTokens: data.prompt_eval_count,
      outputTokens: data.eval_count,
      configuredOutputLimit: numPredict,
    });

    if (!content.trim()) {
      throw new Error("Ollama returned an empty response.");
    }

    return {
      text: content,
      provider: "ollama",
      model: this.model,
      usage: data.eval_count
        ? { tokens: data.eval_count }
        : undefined,
    };
  }
}

// ---------------------------------------------------------------------------
// Groq provider (Ollama availability fallback)
// ---------------------------------------------------------------------------

export class GroqProvider implements AIProvider {
  constructor(
    private apiKey: string,
    private model: string,
  ) {
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is required to use the Groq provider.");
    }
  }

  async generate(input: GenerateInput): Promise<GenerateResult> {
    const messages = [
      { role: "system" as const, content: input.systemPrompt },
      ...(input.history ?? []),
      { role: "user" as const, content: input.prompt },
    ];
    const maxTokens = getPositiveInteger(process.env.GROQ_MAX_TOKENS, 8192);
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        max_tokens: maxTokens,
        ...(input.jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: AbortSignal.timeout(300_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Groq error ${res.status}: ${text.slice(0, 500)}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{
        message?: { content?: string | null };
        finish_reason?: string | null;
      }>;
      usage?: { completion_tokens?: number };
    };
    const content = data.choices?.[0]?.message?.content ?? "";

    console.info("[AI:Groq] Completion:", {
      model: this.model,
      characters: content.length,
      finishReason: data.choices?.[0]?.finish_reason,
      outputTokens: data.usage?.completion_tokens,
      configuredOutputLimit: maxTokens,
    });

    if (!content.trim()) {
      throw new Error("Groq returned an empty response.");
    }

    return {
      text: content,
      provider: "groq",
      model: this.model,
      usage: data.usage?.completion_tokens
        ? { tokens: data.usage.completion_tokens }
        : undefined,
    };
  }
}

// ---------------------------------------------------------------------------
// Anthropic provider (production)
// ---------------------------------------------------------------------------

export class AnthropicProvider implements AIProvider {
  constructor(
    private apiKey: string,
    private model: string,
  ) {}

  async generate(input: GenerateInput): Promise<GenerateResult> {
    const messages = input.history
      ? [
          ...input.history,
          { role: "user" as const, content: input.prompt },
        ]
      : [{ role: "user" as const, content: input.prompt }];

    const maxTokens = getPositiveInteger(
      process.env.ANTHROPIC_MAX_TOKENS,
      16384,
    );

    const res = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: maxTokens,
          system: input.systemPrompt,
          messages,
        }),
        signal: AbortSignal.timeout(300_000),
      },
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Anthropic error ${res.status}: ${text.slice(0, 500)}`,
      );
    }

    const data = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
      stop_reason?: string | null;
      usage?: { output_tokens?: number; input_tokens?: number };
    };

    const content = (data.content || [])
      .filter((block) => block.type === "text")
      .map((block) => block.text || "")
      .join("");

    console.info("[AI:Anthropic] Completion:", {
      model: this.model,
      characters: content.length,
      stopReason: data.stop_reason,
      inputTokens: data.usage?.input_tokens,
      outputTokens: data.usage?.output_tokens,
      configuredOutputLimit: maxTokens,
    });

    if (!content.trim()) {
      throw new Error("Anthropic returned an empty response.");
    }

    if (data.stop_reason === "max_tokens") {
      throw new Error(
        `Anthropic reached its output-token limit (${maxTokens}). ` +
        "Reduce the website's complexity or configure a supported higher limit.",
      );
    }

    return {
      text: content,
      provider: "anthropic",
      model: this.model,
      usage: data.usage?.output_tokens
        ? { tokens: data.usage.output_tokens }
        : undefined,
    };
  }
}
