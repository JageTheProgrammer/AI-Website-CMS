/**
 * Document -> HTML renderer. Pure string functions (runs in Node and in the browser).
 * Output is styled with Tailwind utility classes and the theme's semantic colors.
 */
import type { ComponentDefinition, NodeStyle, PageDocument, RenderMode } from "./types";
export declare const TAILWIND_CDN = "https://cdn.tailwindcss.com/3.4.17";
export interface RenderOptions {
    mode?: RenderMode;
    /** "cdn" injects the Tailwind Play CDN (fast previews). "none" expects `css` (compiled Tailwind) or an external stylesheet. */
    tailwind?: "cdn" | "none";
    css?: string;
    /** Where published forms POST to. */
    formEndpoint?: string;
    /** Map a page path to a URL (default: identity). */
    pageHref?: (path: string) => string;
    /** Absolute site URL, used for canonical + og:url when given. */
    baseUrl?: string;
}
export declare function styleToCss(style: NodeStyle | undefined, def: ComponentDefinition): string;
/** Inner HTML of the page body (what the editor swaps in after every change). */
export declare function renderRoot(doc: PageDocument, pagePath: string, opts?: RenderOptions): string;
/** Editor metadata embedded in the page so the bridge can validate drops without the registry. */
export declare function editorMeta(): string;
export declare function renderPage(doc: PageDocument, pagePath: string, opts?: RenderOptions): string;
/** Static export: one HTML file per page ("/" -> index.html, "/about" -> about/index.html). */
export declare function exportSite(doc: PageDocument, opts?: RenderOptions): Record<string, string>;
