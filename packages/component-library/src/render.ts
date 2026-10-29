/**
 * Document -> HTML renderer. Pure string functions (runs in Node and in the browser).
 * Output is styled with Tailwind utility classes and the theme's semantic colors.
 */
import type { ComponentDefinition, Node, NodeStyle, PageDocument, RenderContext, RenderMode } from "./types";
import { getComponent, normalizeProps, registry } from "./registry";
import { fieldAtPath } from "./paths";
import { fontsHref, tailwindExtend, themeCss } from "./theme";
import { esc, pick } from "./util";
import { normalizePagePath } from "./document";
import { BRIDGE_SCRIPT, EDITOR_CSS } from "./editor/bridge";

export const TAILWIND_CDN = "https://cdn.tailwindcss.com/3.4.17";

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

interface Env {
  mode: RenderMode;
  formAction: string;
  href: (u: string) => string;
}

const ALIGN_STYLE: Record<string, string> = {
  left: "",
  center: "margin-left:auto;margin-right:auto;",
  right: "margin-left:auto;",
};

export function styleToCss(style: NodeStyle | undefined, def: ComponentDefinition): string {
  if (!style) return "";
  let css = "";
  if (style.width) css += `width:${style.width};max-width:100%;`;
  if (style.maxWidth) css += `max-width:${style.maxWidth};`;
  if (style.height) css += def.resize?.heightMode === "fixed" ? `height:${style.height};` : `min-height:${style.height};`;
  if (style.marginTop) css += `margin-top:${style.marginTop};`;
  if (style.marginBottom) css += `margin-bottom:${style.marginBottom};`;
  if (style.align) css += pick(ALIGN_STYLE, style.align);
  return css;
}

function resizeAttr(def: ComponentDefinition): string {
  return (def.resize?.width ? "w" : "") + (def.resize?.height ? "h" : "");
}

/** Insert attributes into the first tag of a component's HTML. */
function injectRootAttrs(html: string, attrs: string): string {
  return html.replace(/^(\s*<[a-zA-Z][\w-]*)/, `$1 ${attrs}`);
}

function renderNode(node: Node, env: Env): string {
  const def = getComponent(node.type);
  if (!def) {
    return env.mode === "edit"
      ? `<div data-node-id="${esc(node.id)}" data-type="unknown" class="m-4 rounded border border-dashed border-rose-400 p-4 text-sm text-rose-600">Unknown component: ${esc(node.type)}</div>`
      : "";
  }
  const edit = env.mode === "edit";
  const props = normalizeProps(def, node.props);

  let children = (node.children ?? []).map((ch) => renderNode(ch, env)).join("");
  const childCount = node.children?.length ?? 0;
  if (edit && def.accepts && childCount === 0) {
    children = `<div data-empty="1" class="flex min-h-[72px] items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-4 text-sm font-medium text-slate-400">Drop components here</div>`;
  }

  const ctx: RenderContext = {
    mode: env.mode,
    node,
    children,
    childCount,
    formAction: env.formAction,
    href: (u) => env.href(String(u ?? "")),
    e: (path) => {
      if (!edit) return "";
      const fld = fieldAtPath(def.props, path);
      return `data-edit="${esc(path)}"${fld && fld.kind === "textarea" ? ' data-multiline="1"' : ""}`;
    },
  };

  let html: string;
  try {
    html = def.render(props, ctx).trim();
  } catch (err) {
    return edit
      ? `<div data-node-id="${esc(node.id)}" data-type="${esc(node.type)}" class="m-4 rounded border border-dashed border-rose-400 p-4 text-sm text-rose-600">Could not render ${esc(node.type)}: ${esc((err as Error).message)}</div>`
      : "";
  }

  const css = styleToCss(node.style, def);
  let attrs = css ? `style="${esc(css)}"` : "";
  if (edit) {
    attrs +=
      ` data-node-id="${esc(node.id)}" data-type="${esc(node.type)}"` +
      (def.accepts ? ' data-accepts="1"' : "") +
      (resizeAttr(def) ? ` data-resize="${resizeAttr(def)}"` : "") +
      (def.resize?.heightMode === "fixed" ? ' data-hmode="fixed"' : "");
  }
  return attrs ? injectRootAttrs(html, attrs) : html;
}

function makeEnv(doc: PageDocument, opts: RenderOptions): Env {
  const known = new Set(doc.pages.map((p) => p.path));
  const pageHref = opts.pageHref ?? ((p: string) => p);
  return {
    mode: opts.mode ?? "publish",
    formAction: opts.formEndpoint ?? "#",
    href: (u) => {
      if (!u.startsWith("/") || u.startsWith("//")) return u;
      const m = u.match(/^([^?#]*)([?#].*)?$/);
      const path = normalizePagePath(m?.[1] || "/");
      return path && known.has(path) ? pageHref(path) + (m?.[2] ?? "") : u;
    },
  };
}

/** Inner HTML of the page body (what the editor swaps in after every change). */
export function renderRoot(doc: PageDocument, pagePath: string, opts: RenderOptions = {}): string {
  const page = doc.pages.find((p) => p.path === pagePath) ?? doc.pages[0];
  const env = makeEnv(doc, opts);
  return page.root.map((n) => renderNode(n, env)).join("");
}

/** Editor metadata embedded in the page so the bridge can validate drops without the registry. */
export function editorMeta(): string {
  const types: Record<string, unknown> = {};
  for (const d of registry.values()) {
    types[d.type] = { label: d.label, level: d.level, accepts: d.accepts ?? null };
  }
  return JSON.stringify({ types }).replace(/</g, "\\u003c");
}

export function renderPage(doc: PageDocument, pagePath: string, opts: RenderOptions = {}): string {
  const mode = opts.mode ?? "publish";
  const page = doc.pages.find((p) => p.path === pagePath) ?? doc.pages[0];
  const body = renderRoot(doc, page.path, opts);
  const fonts = fontsHref(doc.theme);
  const title = page.path === "/" ? page.title : `${page.title} · ${doc.meta.title}`;
  const description = page.description || doc.meta.description;
  const tw =
    opts.tailwind === "none"
      ? opts.css
        ? `<style>${opts.css}</style>`
        : ""
      : `<script src="${TAILWIND_CDN}"></script><script>tailwind.config={theme:{extend:${JSON.stringify(tailwindExtend)}}}</script>`;
  const canonical = opts.baseUrl && mode === "publish" ? `<link rel="canonical" href="${esc(opts.baseUrl.replace(/\/$/, "") + (page.path === "/" ? "/" : page.path))}">` : "";

  return (
    `<!doctype html><html lang="${esc(doc.meta.language)}"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<title>${esc(title)}</title>` +
    (description ? `<meta name="description" content="${esc(description)}"><meta property="og:description" content="${esc(description)}">` : "") +
    `<meta property="og:title" content="${esc(title)}"><meta property="og:type" content="website">` +
    canonical +
    (fonts ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${esc(fonts)}">` : "") +
    `<style id="cms-theme">${themeCss(doc.theme)}</style>` +
    tw +
    `<style>html{scroll-behavior:smooth}summary::-webkit-details-marker{display:none}</style>` +
    (mode === "edit" ? `<style>${EDITOR_CSS}</style>` : "") +
    `</head><body class="bg-bg font-body text-fg antialiased"${mode === "edit" ? " data-cms-edit" : ""}>` +
    `<main id="cms-root">${body}</main>` +
    (mode === "edit" ? `<script id="cms-meta" type="application/json">${editorMeta()}</script><script>${BRIDGE_SCRIPT}</script>` : "") +
    `</body></html>`
  );
}

/** Static export: one HTML file per page ("/" -> index.html, "/about" -> about/index.html). */
export function exportSite(doc: PageDocument, opts: RenderOptions = {}): Record<string, string> {
  const files: Record<string, string> = {};
  const pageHref = opts.pageHref ?? ((p: string) => p);
  for (const page of doc.pages) {
    const file = page.path === "/" ? "index.html" : `${page.path.slice(1)}/index.html`;
    files[file] = renderPage(doc, page.path, { ...opts, mode: "publish", pageHref });
  }
  files["robots.txt"] = "User-agent: *\nAllow: /\n";
  return files;
}
