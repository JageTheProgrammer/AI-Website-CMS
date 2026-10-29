"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAILWIND_CDN = void 0;
exports.styleToCss = styleToCss;
exports.renderRoot = renderRoot;
exports.editorMeta = editorMeta;
exports.renderPage = renderPage;
exports.exportSite = exportSite;
const registry_1 = require("./registry");
const paths_1 = require("./paths");
const theme_1 = require("./theme");
const util_1 = require("./util");
const document_1 = require("./document");
const bridge_1 = require("./editor/bridge");
exports.TAILWIND_CDN = "https://cdn.tailwindcss.com/3.4.17";
const ALIGN_STYLE = {
    left: "",
    center: "margin-left:auto;margin-right:auto;",
    right: "margin-left:auto;",
};
function styleToCss(style, def) {
    if (!style)
        return "";
    let css = "";
    if (style.width)
        css += `width:${style.width};max-width:100%;`;
    if (style.maxWidth)
        css += `max-width:${style.maxWidth};`;
    if (style.height)
        css += def.resize?.heightMode === "fixed" ? `height:${style.height};` : `min-height:${style.height};`;
    if (style.marginTop)
        css += `margin-top:${style.marginTop};`;
    if (style.marginBottom)
        css += `margin-bottom:${style.marginBottom};`;
    if (style.align)
        css += (0, util_1.pick)(ALIGN_STYLE, style.align);
    return css;
}
function resizeAttr(def) {
    return (def.resize?.width ? "w" : "") + (def.resize?.height ? "h" : "");
}
/** Insert attributes into the first tag of a component's HTML. */
function injectRootAttrs(html, attrs) {
    return html.replace(/^(\s*<[a-zA-Z][\w-]*)/, `$1 ${attrs}`);
}
function renderNode(node, env) {
    const def = (0, registry_1.getComponent)(node.type);
    if (!def) {
        return env.mode === "edit"
            ? `<div data-node-id="${(0, util_1.esc)(node.id)}" data-type="unknown" class="m-4 rounded border border-dashed border-rose-400 p-4 text-sm text-rose-600">Unknown component: ${(0, util_1.esc)(node.type)}</div>`
            : "";
    }
    const edit = env.mode === "edit";
    const props = (0, registry_1.normalizeProps)(def, node.props);
    let children = (node.children ?? []).map((ch) => renderNode(ch, env)).join("");
    const childCount = node.children?.length ?? 0;
    if (edit && def.accepts && childCount === 0) {
        children = `<div data-empty="1" class="flex min-h-[72px] items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-4 text-sm font-medium text-slate-400">Drop components here</div>`;
    }
    const ctx = {
        mode: env.mode,
        node,
        children,
        childCount,
        formAction: env.formAction,
        href: (u) => env.href(String(u ?? "")),
        e: (path) => {
            if (!edit)
                return "";
            const fld = (0, paths_1.fieldAtPath)(def.props, path);
            return `data-edit="${(0, util_1.esc)(path)}"${fld && fld.kind === "textarea" ? ' data-multiline="1"' : ""}`;
        },
    };
    let html;
    try {
        html = def.render(props, ctx).trim();
    }
    catch (err) {
        return edit
            ? `<div data-node-id="${(0, util_1.esc)(node.id)}" data-type="${(0, util_1.esc)(node.type)}" class="m-4 rounded border border-dashed border-rose-400 p-4 text-sm text-rose-600">Could not render ${(0, util_1.esc)(node.type)}: ${(0, util_1.esc)(err.message)}</div>`
            : "";
    }
    const css = styleToCss(node.style, def);
    let attrs = css ? `style="${(0, util_1.esc)(css)}"` : "";
    if (edit) {
        attrs +=
            ` data-node-id="${(0, util_1.esc)(node.id)}" data-type="${(0, util_1.esc)(node.type)}"` +
                (def.accepts ? ' data-accepts="1"' : "") +
                (resizeAttr(def) ? ` data-resize="${resizeAttr(def)}"` : "") +
                (def.resize?.heightMode === "fixed" ? ' data-hmode="fixed"' : "");
    }
    return attrs ? injectRootAttrs(html, attrs) : html;
}
function makeEnv(doc, opts) {
    const known = new Set(doc.pages.map((p) => p.path));
    const pageHref = opts.pageHref ?? ((p) => p);
    return {
        mode: opts.mode ?? "publish",
        formAction: opts.formEndpoint ?? "#",
        href: (u) => {
            if (!u.startsWith("/") || u.startsWith("//"))
                return u;
            const m = u.match(/^([^?#]*)([?#].*)?$/);
            const path = (0, document_1.normalizePagePath)(m?.[1] || "/");
            return path && known.has(path) ? pageHref(path) + (m?.[2] ?? "") : u;
        },
    };
}
/** Inner HTML of the page body (what the editor swaps in after every change). */
function renderRoot(doc, pagePath, opts = {}) {
    const page = doc.pages.find((p) => p.path === pagePath) ?? doc.pages[0];
    const env = makeEnv(doc, opts);
    return page.root.map((n) => renderNode(n, env)).join("");
}
/** Editor metadata embedded in the page so the bridge can validate drops without the registry. */
function editorMeta() {
    const types = {};
    for (const d of registry_1.registry.values()) {
        types[d.type] = { label: d.label, level: d.level, accepts: d.accepts ?? null };
    }
    return JSON.stringify({ types }).replace(/</g, "\\u003c");
}
function renderPage(doc, pagePath, opts = {}) {
    const mode = opts.mode ?? "publish";
    const page = doc.pages.find((p) => p.path === pagePath) ?? doc.pages[0];
    const body = renderRoot(doc, page.path, opts);
    const fonts = (0, theme_1.fontsHref)(doc.theme);
    const title = page.path === "/" ? page.title : `${page.title} · ${doc.meta.title}`;
    const description = page.description || doc.meta.description;
    const tw = opts.tailwind === "none"
        ? opts.css
            ? `<style>${opts.css}</style>`
            : ""
        : `<script src="${exports.TAILWIND_CDN}"></script><script>tailwind.config={theme:{extend:${JSON.stringify(theme_1.tailwindExtend)}}}</script>`;
    const canonical = opts.baseUrl && mode === "publish" ? `<link rel="canonical" href="${(0, util_1.esc)(opts.baseUrl.replace(/\/$/, "") + (page.path === "/" ? "/" : page.path))}">` : "";
    return (`<!doctype html><html lang="${(0, util_1.esc)(doc.meta.language)}"><head><meta charset="utf-8">` +
        `<meta name="viewport" content="width=device-width,initial-scale=1">` +
        `<title>${(0, util_1.esc)(title)}</title>` +
        (description ? `<meta name="description" content="${(0, util_1.esc)(description)}"><meta property="og:description" content="${(0, util_1.esc)(description)}">` : "") +
        `<meta property="og:title" content="${(0, util_1.esc)(title)}"><meta property="og:type" content="website">` +
        canonical +
        (fonts ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${(0, util_1.esc)(fonts)}">` : "") +
        `<style id="cms-theme">${(0, theme_1.themeCss)(doc.theme)}</style>` +
        tw +
        `<style>html{scroll-behavior:smooth}summary::-webkit-details-marker{display:none}</style>` +
        (mode === "edit" ? `<style>${bridge_1.EDITOR_CSS}</style>` : "") +
        `</head><body class="bg-bg font-body text-fg antialiased"${mode === "edit" ? " data-cms-edit" : ""}>` +
        `<main id="cms-root">${body}</main>` +
        (mode === "edit" ? `<script id="cms-meta" type="application/json">${editorMeta()}</script><script>${bridge_1.BRIDGE_SCRIPT}</script>` : "") +
        `</body></html>`);
}
/** Static export: one HTML file per page ("/" -> index.html, "/about" -> about/index.html). */
function exportSite(doc, opts = {}) {
    const files = {};
    const pageHref = opts.pageHref ?? ((p) => p);
    for (const page of doc.pages) {
        const file = page.path === "/" ? "index.html" : `${page.path.slice(1)}/index.html`;
        files[file] = renderPage(doc, page.path, { ...opts, mode: "publish", pageHref });
    }
    files["robots.txt"] = "User-agent: *\nAllow: /\n";
    return files;
}
