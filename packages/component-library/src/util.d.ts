/** Small, dependency-free helpers (isomorphic: works in Node and the browser). */
export declare const esc: (v: unknown) => string;
export declare const cx: (...a: Array<string | false | null | undefined>) => string;
export declare const arr: <T = any>(v: unknown) => T[];
/** Look up a class in a map, falling back to the first entry for unknown keys. */
export declare function pick<T>(map: Record<string, T>, key: unknown): T;
export declare function uid(prefix?: string): string;
export declare const clone: <T>(v: T) => T;
/** Split text into paragraphs on blank lines. */
export declare const paragraphs: (s: string) => string[];
export declare const nl2br: (s: string) => string;
export declare function isSafeUrl(s: string): boolean;
export declare function isSafeImage(s: string): boolean;
/** Neutral gradient placeholder image as a data URI. */
export declare function placeholderImage(label: string, w?: number, h?: number): string;
/** Resolve an image field value to a usable src. */
export declare function imgSrc(value: unknown, w?: number, h?: number): string;
export declare const slugify: (s: string) => string;
