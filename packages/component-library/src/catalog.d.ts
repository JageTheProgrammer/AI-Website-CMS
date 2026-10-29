/**
 * AI-facing catalog. Generated from the registry, so adding a component
 * automatically teaches the AI about it. The AI may ONLY use what is listed here.
 */
import type { PageDocument } from "./types";
export interface CatalogOptions {
    /** Restrict to these component types (use for very large libraries / two-step generation). */
    types?: string[];
}
export declare function buildCatalog(opts?: CatalogOptions): string;
/** One line per component, for a cheap first "pick components" step. */
export declare function buildOutlineCatalog(): string;
export declare function buildSystemPrompt(opts?: CatalogOptions): string;
export declare function describeDocumentForAI(doc: PageDocument): string;
