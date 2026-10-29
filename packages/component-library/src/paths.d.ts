import type { Field, PropSchema } from "./types";
/** Resolve the schema field addressed by a prop path like "items.2.title" or "bullets.1". */
export declare function fieldAtPath(schema: PropSchema, path: string): Field | null;
/** Immutable-style set on a (cloned) props object. Returns false if the path is invalid. */
export declare function setByPath(obj: any, path: string, value: any): boolean;
