import { defineComponent, f } from "../fields";
import { SOCIAL_ICONS, icon } from "../icons";
import { arr, cx, esc, imgSrc, pick } from "../util";
import { btn, bgClass, isDark } from "./_shared";

const NAV_BG = ["default", "surface", "primary", "dark"];

function brand(p: any, ctx: any): string {
  return (
    `<a href="${esc(ctx.href("/"))}" class="flex items-center gap-2 font-heading text-lg font-bold">` +
    (p.logo ? `<img src="${esc(imgSrc(p.logo, 64, 64))}" alt="" class="h-8 w-auto">` : "") +
    `<span ${ctx.e("brand")}>${esc(p.brand)}</span></a>`
  );
}

export const navigationComponents = [
  defineComponent({
    type: "navbar",
    label: "Navbar",
    category: "navigation",
    level: "section",
    description: "Top navigation bar with brand, links, optional call-to-action and mobile menu.",
    aiHint: "Put exactly one at the top of every page. Link targets: page paths (/about) or #anchors.",
    props: {
      variant: f.select("Layout", ["left", "centered"], "left"),
      bg: f.select("Background", NAV_BG, "default"),
      brand: f.text("Brand name", "Acme", { max: 40 }),
      logo: f.image("Logo image", "", { optional: true }),
      links: f.list(
        "Links",
        { label: f.text("Label", "Link", { max: 30 }), href: f.url("Link", "#") },
        [
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "#pricing" },
          { label: "About", href: "#about" },
          { label: "Contact", href: "#contact" },
        ],
        { max: 7 },
      ),
      ctaLabel: f.text("Button label", "Get started", { max: 30, optional: true }),
      ctaHref: f.url("Button link", "#contact", { optional: true }),
      sticky: f.bool("Sticky", true),
      border: f.bool("Bottom border", true),
    },
    render: (p, ctx) => {
      const dark = isDark(p);
      const links = arr<any>(p.links)
        .map(
          (l, i) =>
            `<a href="${esc(ctx.href(l.href))}" class="opacity-80 transition hover:opacity-100" ${ctx.e(`links.${i}.label`)}>${esc(l.label)}</a>`,
        )
        .join("");
      const mobileLinks = arr<any>(p.links)
        .map((l) => `<a href="${esc(ctx.href(l.href))}" class="py-1 text-fg">${esc(l.label)}</a>`)
        .join("");
      const cta = btn(ctx, p.ctaLabel, p.ctaHref, "primary", dark, "ctaLabel", "sm");
      const mobileCta = p.ctaLabel
        ? `<a href="${esc(ctx.href(p.ctaHref))}" class="mt-1 inline-flex justify-center rounded-btn bg-primary px-4 py-2 text-sm font-semibold text-primary-fg">${esc(p.ctaLabel)}</a>`
        : "";
      const menu =
        `<details class="relative md:hidden"><summary class="flex cursor-pointer list-none items-center p-2" aria-label="Menu">${icon("menu", "h-6 w-6")}</summary>` +
        `<div class="absolute right-0 top-full z-50 mt-2 flex w-64 flex-col gap-2 rounded-theme border border-line bg-surface p-4 text-fg shadow-xl">${mobileLinks}${mobileCta}</div></details>`;
      const centered = p.variant === "centered";
      const inner = centered
        ? `<div class="flex flex-col items-center gap-3 py-4">${brand(p, ctx)}<nav class="hidden items-center gap-8 text-sm font-medium md:flex">${links}</nav>${menu}</div>`
        : `<div class="flex h-16 items-center justify-between gap-6">${brand(p, ctx)}<nav class="hidden items-center gap-8 text-sm font-medium md:flex">${links}</nav><div class="hidden md:block">${cta}</div>${menu}</div>`;
      return (
        `<header class="${cx(bgClass(p.bg), p.sticky && "sticky top-0 z-40", p.border && "border-b border-line")}">` +
        `<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">${inner}</div></header>`
      );
    },
  }),

  defineComponent({
    type: "footer",
    label: "Footer",
    category: "navigation",
    level: "section",
    description: "Site footer with brand, link columns, social icons and copyright.",
    aiHint: "Put exactly one at the bottom of every page.",
    props: {
      variant: f.select("Layout", ["columns", "simple", "centered"], "columns"),
      bg: f.select("Background", ["surface", "default", "dark"], "surface"),
      brand: f.text("Brand name", "Acme", { max: 40 }),
      description: f.area("Description", "Building better tools for modern teams.", { max: 200, optional: true }),
      columns: f.list(
        "Link columns",
        {
          title: f.text("Title", "Company", { max: 30 }),
          links: f.list("Links", { label: f.text("Label", "Link", { max: 30 }), href: f.url("Link", "#") }, [], { max: 6 }),
        },
        [
          { title: "Product", links: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }] },
          { title: "Company", links: [{ label: "About", href: "#about" }, { label: "Contact", href: "#contact" }] },
          { title: "Legal", links: [{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }] },
        ],
        { max: 4, optional: true },
      ),
      social: f.list(
        "Social links",
        { icon: f.icon("Network", "twitter", { ai: "one of: " + SOCIAL_ICONS.join(", ") }), href: f.url("Link", "#") },
        [{ icon: "twitter", href: "#" }, { icon: "github", href: "#" }, { icon: "linkedin", href: "#" }],
        { max: 6, optional: true },
      ),
      copyright: f.text("Copyright", "© 2026 Acme. All rights reserved.", { max: 120 }),
    },
    render: (p, ctx) => {
      const dark = p.bg === "dark";
      const m = dark ? "opacity-70" : "text-muted";
      const cols = arr<any>(p.columns);
      const social = arr<any>(p.social)
        .map(
          (s) =>
            `<a href="${esc(ctx.href(s.href))}" class="${cx("transition hover:opacity-100", dark ? "opacity-70" : "text-muted hover:text-fg")}" aria-label="${esc(s.icon)}">${icon(s.icon, "h-5 w-5")}</a>`,
        )
        .join("");
      const colHtml = cols
        .map(
          (c, i) =>
            `<div><h3 class="mb-3 text-sm font-semibold" ${ctx.e(`columns.${i}.title`)}>${esc(c.title)}</h3><ul class="space-y-2 text-sm">${arr<any>(c.links)
              .map(
                (l, j) =>
                  `<li><a href="${esc(ctx.href(l.href))}" class="${cx(m, "transition hover:opacity-100")}" ${ctx.e(`columns.${i}.links.${j}.label`)}>${esc(l.label)}</a></li>`,
              )
              .join("")}</ul></div>`,
        )
        .join("");
      const brandHtml = `<div class="font-heading text-lg font-bold" ${ctx.e("brand")}>${esc(p.brand)}</div>`;
      const desc = p.description ? `<p class="${cx("mt-3 max-w-xs text-sm", m)}" ${ctx.e("description")}>${esc(p.description)}</p>` : "";
      const copy = `<p class="${cx("text-sm", m)}" ${ctx.e("copyright")}>${esc(p.copyright)}</p>`;
      const wrapCls = cx("border-t", dark ? "border-white/10" : "border-line");
      let inner: string;
      if (p.variant === "centered") {
        const flat = cols.flatMap((c) => arr<any>(c.links));
        inner =
          `<div class="flex flex-col items-center gap-5 text-center">${brandHtml}${desc}` +
          (flat.length
            ? `<nav class="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">${flat.map((l) => `<a href="${esc(ctx.href(l.href))}" class="${m}">${esc(l.label)}</a>`).join("")}</nav>`
            : "") +
          `<div class="flex gap-4">${social}</div>${copy}</div>`;
      } else if (p.variant === "simple") {
        const flat = cols.flatMap((c) => arr<any>(c.links));
        inner =
          `<div class="flex flex-col items-center justify-between gap-4 md:flex-row"><div>${brandHtml}</div>` +
          `<nav class="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">${flat.map((l) => `<a href="${esc(ctx.href(l.href))}" class="${m}">${esc(l.label)}</a>`).join("")}</nav>` +
          `<div class="flex gap-4">${social}</div></div><div class="${cx("mt-6 pt-6", wrapCls)}">${copy}</div>`;
      } else {
        inner =
          `<div class="grid gap-10 md:grid-cols-[2fr_repeat(3,1fr)]"><div>${brandHtml}${desc}<div class="mt-4 flex gap-4">${social}</div></div>${colHtml}</div>` +
          `<div class="${cx("mt-10 pt-6", wrapCls)}">${copy}</div>`;
      }
      return `<footer class="${cx(bgClass(p.bg), "py-12")}"><div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">${inner}</div></footer>`;
    },
  }),

  defineComponent({
    type: "breadcrumbs",
    label: "Breadcrumbs",
    category: "navigation",
    level: "block",
    description: "Breadcrumb trail for inner pages.",
    props: {
      items: f.list(
        "Items",
        { label: f.text("Label", "Home", { max: 40 }), href: f.url("Link", "/", { optional: true }) },
        [{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Current page", href: "" }],
        { min: 1, max: 6 },
      ),
    },
    render: (p, ctx) => {
      const items = arr<any>(p.items);
      return (
        `<nav aria-label="Breadcrumb"><ol class="flex flex-wrap items-center gap-2 text-sm text-muted">` +
        items
          .map((it, i) => {
            const last = i === items.length - 1;
            const label = `<span ${ctx.e(`items.${i}.label`)}>${esc(it.label)}</span>`;
            const body =
              !last && it.href
                ? `<a href="${esc(ctx.href(it.href))}" class="transition hover:text-fg">${label}</a>`
                : `<span ${last ? 'aria-current="page" class="text-fg"' : ""}>${label}</span>`;
            return `<li class="flex items-center gap-2">${body}${last ? "" : icon("chevron-right", "h-3.5 w-3.5")}</li>`;
          })
          .join("") +
        `</ol></nav>`
      );
    },
  }),

  defineComponent({
    type: "announcement-bar",
    label: "Announcement bar",
    category: "navigation",
    level: "section",
    description: "Thin banner above the navbar for promotions or news.",
    props: {
      tone: f.select("Tone", ["primary", "dark", "accent"], "primary"),
      text: f.text("Text", "New: our spring collection is live.", { max: 140 }),
      linkLabel: f.text("Link label", "Shop now", { max: 30, optional: true }),
      linkHref: f.url("Link", "#", { optional: true }),
    },
    render: (p, ctx) =>
      `<div class="${cx(bgClass(p.tone), "px-4 py-2 text-center text-sm")}"><span ${ctx.e("text")}>${esc(p.text)}</span>` +
      (p.linkLabel
        ? ` <a href="${esc(ctx.href(p.linkHref))}" class="ml-1 font-semibold underline underline-offset-2"><span ${ctx.e("linkLabel")}>${esc(p.linkLabel)}</span></a>`
        : "") +
      `</div>`,
  }),
];

void pick;
