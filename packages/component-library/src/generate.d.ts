/**
 * Provider-agnostic AI generation loop: prompt -> JSON -> validate -> repair (up to N attempts).
 * The caller supplies `complete`, so this works with Ollama, Anthropic or anything else.
 */
import type { PageDocument } from "./types";
import { CatalogOptions } from "./catalog";
import { Issue } from "./document";
export type Turn = {
    role: "user" | "assistant";
    content: string;
};
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
export declare class DocumentGenerationError extends Error {
    code: "INVALID_JSON" | "INVALID_DOCUMENT";
    issues: Issue[];
    raw: string;
    constructor(code: "INVALID_JSON" | "INVALID_DOCUMENT", message: string, issues?: Issue[], raw?: string);
}
/** Extract the first balanced JSON object from model output (handles fences and chatter). */
export declare function extractJson(text: string): unknown | null;
export declare function buildUserPrompt(prompt: string, current?: PageDocument | null): string;
export declare function generateDocument(opts: GenerateDocumentOptions): Promise<GenerateDocumentResult>;
