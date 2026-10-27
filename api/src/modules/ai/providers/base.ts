
/**
 * AI Provider interface and concrete implementations (Ollama / Anthropic).
 */

export interface GenerateInput {
  prompt: string;
  systemPrompt: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
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

    const res = await fetch(
      `${this.baseUrl.replace(/\/+$/, "")}/api/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: false,
          options: {
            num_predict: numPredict,
          },
        }),
        signal: AbortSignal.timeout(300_000),
      },
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Ollama error ${res.status}: ${text.slice(0, 500)}`,
      );
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
