/**
 * Document validation. The AI output and every editor save go through here.
 * Lenient on cosmetic problems (they become warnings and are auto-fixed),
 * strict on structure (unknown components, illegal nesting, empty required lists).
 */
import type { Field, Node, NodeStyle, PageDocument, ThemeInput } from "./types";
export interface Issue {
    path: string;
    message: string;
}
export interface ValidationResult {
    ok: boolean;
    document?: PageDocument;
    errors: Issue[];
    warnings: Issue[];
}
export declare const LIMITS: {
    pages: number;
    nodesPerPage: number;
    depth: number;
};
interface Ctx {
    errors: Issue[];
    warnings: Issue[];
}
/** Coerce one value to a field. Returns the cleaned value; records issues on ctx. */
export declare function coerceField(field: Field, v: any, path: string, c: Ctx): any;
export declare function coerceStyle(raw: any, path: string, c: Ctx): NodeStyle | undefined;
/** Can `child` be placed inside `parent` ("null" parent = page root)? */
export declare function canContain(parentType: string | null, childType: string): {
    ok: boolean;
    reason?: string;
};
export declare function createSectionWrapper(child: Node): Node;
export declare function validateTheme(raw: any, c: Ctx, path?: string): ThemeInput;
export declare function normalizePagePath(p: unknown): string | null;
export declare function validateDocument(input: unknown): ValidationResult;
export declare function issuesToText(issues: Issue[], limit?: number): string;
export declare const makeCtx: () => Ctx;
export {};
