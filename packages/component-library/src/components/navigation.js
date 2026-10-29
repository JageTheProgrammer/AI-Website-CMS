"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.navigationComponents = void 0;
const fields_1 = require("../fields");
const icons_1 = require("../icons");
const util_1 = require("../util");
const _shared_1 = require("./_shared");
const NAV_BG = ["default", "surface", "primary", "dark"];
function brand(p, ctx) {
    return (`<a href="${(0, util_1.esc)(ctx.href("/"))}" class="flex items-center gap-2 font-heading text-lg font-bold">` +
        (p.logo ? `<img src="${(0, util_1.esc)((0, util_1.imgSrc)(p.logo, 64, 64))}" alt="" class="h-8 w-auto">` : "") +
        `<span ${ctx.e("brand")}>${(0, util_1.esc)(p.brand)}</span></a>`);
}
exports.navigationComponents = [
    (0, fields_1.defineComponent)({
        type: "navbar",
        label: "Navbar",
        category: "navigation",
        level: "section",
        description: "Top navigation bar with brand, links, optional call-to-action and mobile menu.",
        aiHint: "Put exactly one at the top of every page. Link targets: page paths (/about) or #anchors.",
        props: {
            variant: fields_1.f.select("Layout", ["left", "centered"], "left"),
            bg: fields_1.f.select("Background", NAV_BG, "default"),
            brand: fields_1.f.text("Brand name", "Acme", { max: 40 }),
            logo: fields_1.f.image("Logo image", "", { optional: true }),
            links: fields_1.f.list("Links", { label: fields_1.f.text("Label", "Link", { max: 30 }), href: fields_1.f.url("Link", "#") }, [
                { label: "Features", href: "#features" },
                { label: "Pricing", href: "#pricing" },
                { label: "About", href: "#about" },
                { label: "Contact", href: "#contact" },
            ], { max: 7 }),
            ctaLabel: fields_1.f.text("Button label", "Get started", { max: 30, optional: true }),
            ctaHref: fields_1.f.url("Button link", "#contact", { optional: true }),
            sticky: fields_1.f.bool("Sticky", true),
            border: fields_1.f.bool("Bottom border", true),
        },
        render: (p, ctx) => {
            const dark = (0, _shared_1.isDark)(p);
            const links = (0, util_1.arr)(p.links)
                .map((l, i) => `<a href="${(0, util_1.esc)(ctx.href(l.href))}" class="opacity-80 transition hover:opacity-100" ${ctx.e(`links.${i}.label`)}>${(0, util_1.esc)(l.label)}</a>`)
                .join("");
            const mobileLinks = (0, util_1.arr)(p.links)
                .map((l) => `<a href="${(0, util_1.esc)(ctx.href(l.href))}" class="py-1 text-fg">${(0, util_1.esc)(l.label)}</a>`)
                .join("");
            const cta = (0, _shared_1.btn)(ctx, p.ctaLabel, p.ctaHref, "primary", dark, "ctaLabel", "sm");
            const mobileCta = p.ctaLabel
                ? `<a href="${(0, util_1.esc)(ctx.href(p.ctaHref))}" class="mt-1 inline-flex justify-center rounded-btn bg-primary px-4 py-2 text-sm font-semibold text-primary-fg">${(0, util_1.esc)(p.ctaLabel)}</a>`
                : "";
            const menu = `<details class="relative md:hidden"><summary class="flex cursor-pointer list-none items-center p-2" aria-label="Menu">${(0, icons_1.icon)("menu", "h-6 w-6")}</summary>` +
                `<div class="absolute right-0 top-full z-50 mt-2 flex w-64 flex-col gap-2 rounded-theme border border-line bg-surface p-4 text-fg shadow-xl">${mobileLinks}${mobileCta}</div></details>`;
            const centered = p.variant === "centered";
            const inner = centered
                ? `<div class="flex flex-col items-center gap-3 py-4">${brand(p, ctx)}<nav class="hidden items-center gap-8 text-sm font-medium md:flex">${links}</nav>${menu}</div>`
                : `<div class="flex h-16 items-center justify-between gap-6">${brand(p, ctx)}<nav class="hidden items-center gap-8 text-sm font-medium md:flex">${links}</nav><div class="hidden md:block">${cta}</div>${menu}</div>`;
            return (`<header class="${(0, util_1.cx)((0, _shared_1.bgClass)(p.bg), p.sticky && "sticky top-0 z-40", p.border && "border-b border-line")}">` +
                `<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">${inner}</div></header>`);
        },
    }),
    (0, fields_1.defineComponent)({
        type: "footer",
        label: "Footer",
        category: "navigation",
        level: "section",
        description: "Site footer with brand, link columns, social icons and copyright.",
        aiHint: "Put exactly one at the bottom of every page.",
        props: {
            variant: fields_1.f.select("Layout", ["columns", "simple", "centered"], "columns"),
            bg: fields_1.f.select("Background", ["surface", "default", "dark"], "surface"),
            brand: fields_1.f.text("Brand name", "Acme", { max: 40 }),
            description: fields_1.f.area("Description", "Building better tools for modern teams.", { max: 200, optional: true }),
            columns: fields_1.f.list("Link columns", {
                title: fields_1.f.text("Title", "Company", { max: 30 }),
                links: fields_1.f.list("Links", { label: fields_1.f.text("Label", "Link", { max: 30 }), href: fields_1.f.url("Link", "#") }, [], { max: 6 }),
            }, [
                { title: "Product", links: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }] },
                { title: "Company", links: [{ label: "About", href: "#about" }, { label: "Contact", href: "#contact" }] },
                { title: "Legal", links: [{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }] },
            ], { max: 4, optional: true }),
            social: fields_1.f.list("Social links", { icon: fields_1.f.icon("Network", "twitter", { ai: "one of: " + icons_1.SOCIAL_ICONS.join(", ") }), href: fields_1.f.url("Link", "#") }, [{ icon: "twitter", href: "#" }, { icon: "github", href: "#" }, { icon: "linkedin", href: "#" }], { max: 6, optional: true }),
            copyright: fields_1.f.text("Copyright", "© 2026 Acme. All rights reserved.", { max: 120 }),
        },
        render: (p, ctx) => {
            const dark = p.bg === "dark";
            const m = dark ? "opacity-70" : "text-muted";
            const cols = (0, util_1.arr)(p.columns);
            const social = (0, util_1.arr)(p.social)
                .map((s) => `<a href="${(0, util_1.esc)(ctx.href(s.href))}" class="${(0, util_1.cx)("transition hover:opacity-100", dark ? "opacity-70" : "text-muted hover:text-fg")}" aria-label="${(0, util_1.esc)(s.icon)}">${(0, icons_1.icon)(s.icon, "h-5 w-5")}</a>`)
                .join("");
            const colHtml = cols
                .map((c, i) => `<div><h3 class="mb-3 text-sm font-semibold" ${ctx.e(`columns.${i}.title`)}>${(0, util_1.esc)(c.title)}</h3><ul class="space-y-2 text-sm">${(0, util_1.arr)(c.links)
                .map((l, j) => `<li><a href="${(0, util_1.esc)(ctx.href(l.href))}" class="${(0, util_1.cx)(m, "transition hover:opacity-100")}" ${ctx.e(`columns.${i}.links.${j}.label`)}>${(0, util_1.esc)(l.label)}</a></li>`)
                .join("")}</ul></div>`)
                .join("");
            const brandHtml = `<div class="font-heading text-lg font-bold" ${ctx.e("brand")}>${(0, util_1.esc)(p.brand)}</div>`;
            const desc = p.description ? `<p class="${(0, util_1.cx)("mt-3 max-w-xs text-sm", m)}" ${ctx.e("description")}>${(0, util_1.esc)(p.description)}</p>` : "";
            const copy = `<p class="${(0, util_1.cx)("text-sm", m)}" ${ctx.e("copyright")}>${(0, util_1.esc)(p.copyright)}</p>`;
            const wrapCls = (0, util_1.cx)("border-t", dark ? "border-white/10" : "border-line");
            let inner;
            if (p.variant === "centered") {
                const flat = cols.flatMap((c) => (0, util_1.arr)(c.links));
                inner =
                    `<div class="flex flex-col items-center gap-5 text-center">${brandHtml}${desc}` +
                        (flat.length
                            ? `<nav class="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">${flat.map((l) => `<a href="${(0, util_1.esc)(ctx.href(l.href))}" class="${m}">${(0, util_1.esc)(l.label)}</a>`).join("")}</nav>`
                            : "") +
                        `<div class="flex gap-4">${social}</div>${copy}</div>`;
            }
            else if (p.variant === "simple") {
                const flat = cols.flatMap((c) => (0, util_1.arr)(c.links));
                inner =
                    `<div class="flex flex-col items-center justify-between gap-4 md:flex-row"><div>${brandHtml}</div>` +
                        `<nav class="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">${flat.map((l) => `<a href="${(0, util_1.esc)(ctx.href(l.href))}" class="${m}">${(0, util_1.esc)(l.label)}</a>`).join("")}</nav>` +
                        `<div class="flex gap-4">${social}</div></div><div class="${(0, util_1.cx)("mt-6 pt-6", wrapCls)}">${copy}</div>`;
            }
            else {
                inner =
                    `<div class="grid gap-10 md:grid-cols-[2fr_repeat(3,1fr)]"><div>${brandHtml}${desc}<div class="mt-4 flex gap-4">${social}</div></div>${colHtml}</div>` +
                        `<div class="${(0, util_1.cx)("mt-10 pt-6", wrapCls)}">${copy}</div>`;
            }
            return `<footer class="${(0, util_1.cx)((0, _shared_1.bgClass)(p.bg), "py-12")}"><div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">${inner}</div></footer>`;
        },
    }),
    (0, fields_1.defineComponent)({
        type: "breadcrumbs",
        label: "Breadcrumbs",
        category: "navigation",
        level: "block",
        description: "Breadcrumb trail for inner pages.",
        props: {
            items: fields_1.f.list("Items", { label: fields_1.f.text("Label", "Home", { max: 40 }), href: fields_1.f.url("Link", "/", { optional: true }) }, [{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Current page", href: "" }], { min: 1, max: 6 }),
        },
        render: (p, ctx) => {
            const items = (0, util_1.arr)(p.items);
            return (`<nav aria-label="Breadcrumb"><ol class="flex flex-wrap items-center gap-2 text-sm text-muted">` +
                items
                    .map((it, i) => {
                    const last = i === items.length - 1;
                    const label = `<span ${ctx.e(`items.${i}.label`)}>${(0, util_1.esc)(it.label)}</span>`;
                    const body = !last && it.href
                        ? `<a href="${(0, util_1.esc)(ctx.href(it.href))}" class="transition hover:text-fg">${label}</a>`
                        : `<span ${last ? 'aria-current="page" class="text-fg"' : ""}>${label}</span>`;
                    return `<li class="flex items-center gap-2">${body}${last ? "" : (0, icons_1.icon)("chevron-right", "h-3.5 w-3.5")}</li>`;
                })
                    .join("") +
                `</ol></nav>`);
        },
    }),
    (0, fields_1.defineComponent)({
        type: "announcement-bar",
        label: "Announcement bar",
        category: "navigation",
        level: "section",
        description: "Thin banner above the navbar for promotions or news.",
        props: {
            tone: fields_1.f.select("Tone", ["primary", "dark", "accent"], "primary"),
            text: fields_1.f.text("Text", "New: our spring collection is live.", { max: 140 }),
            linkLabel: fields_1.f.text("Link label", "Shop now", { max: 30, optional: true }),
            linkHref: fields_1.f.url("Link", "#", { optional: true }),
        },
        render: (p, ctx) => `<div class="${(0, util_1.cx)((0, _shared_1.bgClass)(p.tone), "px-4 py-2 text-center text-sm")}"><span ${ctx.e("text")}>${(0, util_1.esc)(p.text)}</span>` +
            (p.linkLabel
                ? ` <a href="${(0, util_1.esc)(ctx.href(p.linkHref))}" class="ml-1 font-semibold underline underline-offset-2"><span ${ctx.e("linkLabel")}>${(0, util_1.esc)(p.linkLabel)}</span></a>`
                : "") +
            `</div>`,
    }),
];
void util_1.pick;
