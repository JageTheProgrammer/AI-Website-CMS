"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INPUT_CLS = exports.GAP = exports.WIDTH = exports.muted = exports.bgClass = exports.isDark = exports.BG = void 0;
exports.sectionProps = sectionProps;
exports.section = section;
exports.headerProps = headerProps;
exports.header = header;
exports.btn = btn;
exports.iconBox = iconBox;
exports.stars = stars;
/** Helpers shared by section-level components. All Tailwind classes are literal strings. */
const fields_1 = require("../fields");
const icons_1 = require("../icons");
const util_1 = require("../util");
exports.BG = ["default", "surface", "primary", "accent", "dark", "gradient"];
const BG_CLASS = {
    default: "bg-bg text-fg",
    surface: "bg-surface text-fg",
    primary: "bg-primary text-primary-fg",
    accent: "bg-accent text-accent-fg",
    dark: "bg-fg text-bg",
    gradient: "bg-gradient-to-br from-primary to-accent text-primary-fg",
};
const INVERSE = new Set(["primary", "accent", "dark", "gradient"]);
const isDark = (p) => INVERSE.has(String(p?.bg));
exports.isDark = isDark;
const bgClass = (bg) => (0, util_1.pick)(BG_CLASS, bg);
exports.bgClass = bgClass;
const muted = (dark) => (dark ? "opacity-80" : "text-muted");
exports.muted = muted;
const SPACING = {
    sm: "py-8 md:py-12",
    md: "py-12 md:py-16",
    lg: "py-16 md:py-24",
    xl: "py-24 md:py-32",
};
exports.WIDTH = {
    narrow: "max-w-3xl",
    default: "max-w-6xl",
    wide: "max-w-7xl",
    full: "max-w-none",
};
exports.GAP = {
    none: "gap-0",
    xs: "gap-2",
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
    xl: "gap-12",
};
/** Props every full-width section shares. */
function sectionProps(bg = "default", spacing = "lg") {
    return {
        bg: fields_1.f.select("Background", exports.BG, bg),
        spacing: fields_1.f.select("Vertical spacing", Object.keys(SPACING), spacing),
        anchor: fields_1.f.text("Anchor id", "", {
            optional: true,
            max: 40,
            format: "slug",
            ai: 'lowercase id other links can target, e.g. "pricing" for href "#pricing"',
        }),
    };
}
function section(p, inner, o = {}) {
    const tag = o.tag ?? "section";
    const id = p.anchor ? ` id="${(0, util_1.esc)(p.anchor)}"` : "";
    return (`<${tag}${id} class="${(0, util_1.cx)((0, exports.bgClass)(p.bg), !o.noPad && (0, util_1.pick)(SPACING, p.spacing), o.cls)}">` +
        `<div class="${(0, util_1.cx)("mx-auto px-4 sm:px-6 lg:px-8", o.width ?? "max-w-6xl", o.innerCls)}">${inner}</div></${tag}>`);
}
function headerProps(o) {
    return {
        eyebrow: fields_1.f.text("Eyebrow", o.eyebrow ?? "", { max: 60, optional: true, ai: "short label above the heading" }),
        heading: fields_1.f.text("Heading", o.heading, { max: 120, optional: o.optionalHeading }),
        subheading: fields_1.f.area("Subheading", o.sub ?? "", { max: 300, optional: true }),
        align: fields_1.f.select("Header alignment", ["center", "left"], "center"),
    };
}
function header(p, ctx, dark) {
    if (!p.heading && !p.eyebrow && !p.subheading)
        return "";
    const c = p.align === "left" ? "" : "mx-auto text-center";
    return (`<div class="${(0, util_1.cx)("mb-12 max-w-2xl", c)}">` +
        (p.eyebrow
            ? `<p class="${(0, util_1.cx)("mb-3 text-sm font-semibold uppercase tracking-wider", dark ? "opacity-80" : "text-primary")}" ${ctx.e("eyebrow")}>${(0, util_1.esc)(p.eyebrow)}</p>`
            : "") +
        (p.heading
            ? `<h2 class="font-heading text-3xl font-bold tracking-tight sm:text-4xl" ${ctx.e("heading")}>${(0, util_1.esc)(p.heading)}</h2>`
            : "") +
        (p.subheading
            ? `<p class="${(0, util_1.cx)("mt-4 text-lg", (0, exports.muted)(dark))}" ${ctx.e("subheading")}>${(0, util_1.esc)(p.subheading)}</p>`
            : "") +
        `</div>`);
}
const BTN_SIZE = {
    sm: "px-3.5 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
};
const BTN_LIGHT = {
    primary: "bg-primary text-primary-fg shadow-sm hover:opacity-90",
    secondary: "border border-line bg-surface text-fg hover:bg-line/50",
    outline: "border border-primary text-primary hover:bg-primary/10",
    ghost: "text-primary hover:bg-primary/10",
};
const BTN_DARK = {
    primary: "bg-bg text-fg shadow-sm hover:opacity-90",
    secondary: "bg-white/15 hover:bg-white/25",
    outline: "border border-current hover:bg-white/10",
    ghost: "hover:bg-white/10",
};
function btn(ctx, label, href, variant, dark, path, size = "md", o = {}) {
    if (!label)
        return "";
    const cls = (0, util_1.cx)("inline-flex items-center justify-center gap-2 rounded-btn font-semibold transition", (0, util_1.pick)(BTN_SIZE, size), (0, util_1.pick)(dark ? BTN_DARK : BTN_LIGHT, variant), o.full && "w-full");
    const inner = `${o.icon ? (0, icons_1.icon)(o.icon, "h-4 w-4") : ""}<span ${ctx.e(path)}>${(0, util_1.esc)(label)}</span>`;
    if (o.submit)
        return `<button type="submit" class="${cls}">${inner}</button>`;
    return `<a href="${(0, util_1.esc)(ctx.href(href))}" class="${cls}">${inner}</a>`;
}
function iconBox(name, dark, size = "h-11 w-11") {
    return `<div class="${(0, util_1.cx)("inline-flex shrink-0 items-center justify-center rounded-theme", size, dark ? "bg-white/15" : "bg-primary/10 text-primary")}">${(0, icons_1.icon)(name, "h-5 w-5")}</div>`;
}
function stars(rating, cls = "h-4 w-4") {
    const n = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    let out = "";
    for (let i = 0; i < 5; i++) {
        out += `<span class="${i < n ? "text-amber-400" : "text-line"}">${(0, icons_1.icon)("star", cls).replace('fill="none"', 'fill="currentColor"')}</span>`;
    }
    return `<div class="flex items-center gap-0.5" role="img" aria-label="${n} out of 5 stars">${out}</div>`;
}
exports.INPUT_CLS = "w-full rounded-theme border border-line bg-bg px-3.5 py-2.5 text-sm text-fg placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";
