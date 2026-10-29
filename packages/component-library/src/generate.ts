/**
 * Provider-agnostic AI generation loop: prompt -> JSON -> validate -> repair (up to N attempts).
 * The caller supplies `complete`, so this works with Ollama, Anthropic or anything else.
 */
import type { PageDocument } from "./types";
import { buildSystemPrompt, CatalogOptions, describeDocumentForAI } from "./catalog";
import { canContain, Issue, issuesToText, validateDocument } from "./document";
import { getComponent } from "./registry";

export type Turn = { role: "user" | "assistant"; content: string };

export interface CompleteInput {
  system: string;
  prompt: string;
  history: Turn[];
}

export interface GenerateDocumentOptions {
  prompt: string;
  /** Existing document when modifying a site. */
  current?: PageDocument | null;
  complete: (input: CompleteInput) => Promise<string>;
  maxAttempts?: number;
  catalog?: CatalogOptions;
  onAttempt?: (attempt: number, previousIssues?: Issue[]) => void;
}

export interface GenerateDocumentResult {
  document: PageDocument;
  warnings: Issue[];
  attempts: number;
  raw: string;
}

export class DocumentGenerationError extends Error {
  constructor(
    public code: "INVALID_JSON" | "INVALID_DOCUMENT",
    message: string,
    public issues: Issue[] = [],
    public raw = "",
  ) {
    super(message);
    this.name = "DocumentGenerationError";
  }
}

/** Extract the first balanced JSON object from model output (handles fences and chatter). */
export function extractJson(text: string): unknown | null {
  const s = String(text ?? "").trim();
  if (!s) return null;
  const candidates: string[] = [];
  for (const m of s.matchAll(/```(?:json)?\s*\n?([\s\S]*?)```/gi)) candidates.push(m[1]);
  candidates.push(s);
  for (const cand of candidates) {
    const start = cand.indexOf("{");
    if (start < 0) continue;
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = start; i < cand.length; i++) {
      const ch = cand[i];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === "\\") esc = true;
        else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') inStr = true;
      else if (ch === "{") depth++;
      else if (ch === "}" && --depth === 0) {
        try {
          return JSON.parse(cand.slice(start, i + 1));
        } catch {
          break;
        }
      }
    }
  }
  return null;
}

export function buildUserPrompt(prompt: string, current?: PageDocument | null): string {
  if (current) {
    return `CURRENT SITE DOCUMENT:\n${describeDocumentForAI(current)}\n\nCHANGE REQUEST:\n${prompt}\n\nReturn the complete updated JSON document.`;
  }
  return `Create a website for this request:\n\n${prompt}\n\nReturn the JSON document.`;
}

function promoteNestedSections(input: unknown): { document: unknown; warnings: Issue[] } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { document: input, warnings: [] };
  }

  const rawDocument = input as Record<string, unknown>;
  if (!Array.isArray(rawDocument.pages)) {
    return { document: input, warnings: [] };
  }

  const warnings: Issue[] = [];
  const pages = rawDocument.pages.map((rawPage, pageIndex) => {
    if (!rawPage || typeof rawPage !== "object" || Array.isArray(rawPage)) {
      return rawPage;
    }

    const page = rawPage as Record<string, unknown>;
    if (!Array.isArray(page.root)) return rawPage;

    type PromotedNode = { node: unknown; path: string };
    const normalizeNode = (
      value: unknown,
      path: string,
    ): { node: unknown; promoted: PromotedNode[] } => {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return { node: value, promoted: [] };
      }

      const node = value as Record<string, unknown>;
      if (typeof node.type !== "string" || !Array.isArray(node.children)) {
        return { node: value, promoted: [] };
      }

      const definition = getComponent(node.type);
      if (!definition?.accepts) return { node: value, promoted: [] };

      const children: unknown[] = [];
      const promoted: PromotedNode[] = [];
      node.children.forEach((child, childIndex) => {
        const childPath = `${path}.children[${childIndex}]`;
        const childType =
          child && typeof child === "object" && !Array.isArray(child)
            ? (child as Record<string, unknown>).type
            : undefined;
        const childDefinition =
          typeof childType === "string" ? getComponent(childType) : undefined;
        const normalized = normalizeNode(child, childPath);

        if (
          childDefinition?.level === "section" &&
          !canContain(definition.type, childDefinition.type).ok
        ) {
          promoted.push(
            { node: normalized.node, path: childPath },
            ...normalized.promoted,
          );
          warnings.push({
            path: childPath,
            message: `"${childDefinition.type}" was moved to the page root because it cannot be nested inside "${definition.type}"`,
          });
        } else {
          children.push(normalized.node);
          promoted.push(...normalized.promoted);
        }
      });

      return { node: { ...node, children }, promoted };
    };

    const root: unknown[] = [];
    page.root.forEach((node, nodeIndex) => {
      const normalized = normalizeNode(node, `pages[${pageIndex}].root[${nodeIndex}]`);
      root.push(normalized.node, ...normalized.promoted.map((item) => item.node));
    });

    return { ...page, root };
  });

  return { document: { ...rawDocument, pages }, warnings };
}

export async function generateDocument(opts: GenerateDocumentOptions): Promise<GenerateDocumentResult> {
  const max = Math.max(1, opts.maxAttempts ?? 3);
  const system = buildSystemPrompt(opts.catalog);
  const history: Turn[] = [];
  let prompt = buildUserPrompt(opts.prompt, opts.current);
  let lastIssues: Issue[] = [];
  let raw = "";

  for (let attempt = 1; attempt <= max; attempt++) {
    opts.onAttempt?.(attempt, attempt > 1 ? lastIssues : undefined);
    raw = await opts.complete({ system, prompt, history: [...history] });
    const json = extractJson(raw);

    let problem: string;
    if (json === null) {
      lastIssues = [{ path: "", message: "reply was not valid JSON" }];
      problem = "Your reply was not a single valid JSON object. Reply with the JSON document only, no markdown, no text before or after.";
    } else {
      const normalized = promoteNestedSections(json);
      const res = validateDocument(normalized.document);
      if (res.ok && res.document) {
        return {
          document: res.document,
          warnings: [...normalized.warnings, ...res.warnings],
          attempts: attempt,
          raw,
        };
      }
      lastIssues = res.errors;
      problem = `The document was rejected. Fix these problems and return the COMPLETE corrected JSON document. Structural rule: page "root" contains section-level components as siblings; a node's "children" may contain only block-level components accepted by that parent. Never nest a section-level component (such as "section", "gallery", or "cta") inside "children"; move it to the page's "root" array instead.\n${issuesToText(res.errors)}`;
    }
    history.push({ role: "user", content: prompt }, { role: "assistant", content: raw });
    prompt = problem;
  }

  const isJson = lastIssues.length === 1 && lastIssues[0].message.startsWith("reply was not valid JSON");
  throw new DocumentGenerationError(
    isJson ? "INVALID_JSON" : "INVALID_DOCUMENT",
    `The AI did not produce a valid site after ${max} attempts.\n${issuesToText(lastIssues, 8)}`,
    lastIssues,
    raw,
  );
}
