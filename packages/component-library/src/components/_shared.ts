/** Helpers shared by section-level components. All Tailwind classes are literal strings. */
import { f } from "../fields";
import { icon } from "../icons";
import { cx, esc, pick } from "../util";
import type { PropSchema, RenderContext } from "../types";

export const BG = ["default", "surface", "primary", "accent", "dark", "gradient"] as const;

const BG_CLASS: Record<string, string> = {
  default: "bg-bg text-fg",
  surface: "bg-surface text-fg",
  primary: "bg-primary text-primary-fg",
  accent: "bg-accent text-accent-fg",
  dark: "bg-fg text-bg",
  gradient: "bg-gradient-to-br from-primary to-accent text-primary-fg",
};
const INVERSE = new Set(["primary", "accent", "dark", "gradient"]);
export const isDark = (p: any): boolean => INVERSE.has(String(p?.bg));
export const bgClass = (bg: unknown): string => pick(BG_CLASS, bg);
export const muted = (dark: boolean): string => (dark ? "opacity-80" : "text-muted");

const SPACING: Record<string, string> = {
  sm: "py-8 md:py-12",
  md: "py-12 md:py-16",
  lg: "py-16 md:py-24",
  xl: "py-24 md:py-32",
};
export const WIDTH: Record<string, string> = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
  full: "max-w-none",
};
export const GAP: Record<string, string> = {
  none: "gap-0",
  xs: "gap-2",
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-12",
};

/** Props every full-width section shares. */
export function sectionProps(bg = "default", spacing = "lg"): PropSchema {
  return {
    bg: f.select("Background", BG, bg),
    spacing: f.select("Vertical spacing", Object.keys(SPACING), spacing),
    anchor: f.text("Anchor id", "", {
      optional: true,
      max: 40,
      format: "slug",
      ai: 'lowercase id other links can target, e.g. "pricing" for href "#pricing"',
    }),
  };
}

export function section(
  p: any,
  inner: string,
  o: { tag?: string; width?: string; cls?: string; noPad?: boolean; innerCls?: string } = {},
): string {
  const tag = o.tag ?? "section";
  const id = p.anchor ? ` id="${esc(p.anchor)}"` : "";
  return (
    `<${tag}${id} class="${cx(bgClass(p.bg), !o.noPad && pick(SPACING, p.spacing), o.cls)}">` +
    `<div class="${cx("mx-auto px-4 sm:px-6 lg:px-8", o.width ?? "max-w-6xl", o.innerCls)}">${inner}</div></${tag}>`
  );
}

export function headerProps(o: { eyebrow?: string; heading: string; sub?: string; optionalHeading?: boolean }): PropSchema {
  return {
    eyebrow: f.text("Eyebrow", o.eyebrow ?? "", { max: 60, optional: true, ai: "short label above the heading" }),
    heading: f.text("Heading", o.heading, { max: 120, optional: o.optionalHeading }),
    subheading: f.area("Subheading", o.sub ?? "", { max: 300, optional: true }),
    align: f.select("Header alignment", ["center", "left"], "center"),
  };
}

export function header(p: any, ctx: RenderContext, dark: boolean): string {
  if (!p.heading && !p.eyebrow && !p.subheading) return "";
  const c = p.align === "left" ? "" : "mx-auto text-center";
  return (
    `<div class="${cx("mb-12 max-w-2xl", c)}">` +
    (p.eyebrow
      ? `<p class="${cx("mb-3 text-sm font-semibold uppercase tracking-wider", dark ? "opacity-80" : "text-primary")}" ${ctx.e("eyebrow")}>${esc(p.eyebrow)}</p>`
      : "") +
    (p.heading
      ? `<h2 class="font-heading text-3xl font-bold tracking-tight sm:text-4xl" ${ctx.e("heading")}>${esc(p.heading)}</h2>`
      : "") +
    (p.subheading
      ? `<p class="${cx("mt-4 text-lg", muted(dark))}" ${ctx.e("subheading")}>${esc(p.subheading)}</p>`
      : "") +
    `</div>`
  );
}

export type BtnVariant = "primary" | "secondary" | "outline" | "ghost";
const BTN_SIZE: Record<string, string> = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};
const BTN_LIGHT: Record<string, string> = {
  primary: "bg-primary text-primary-fg shadow-sm hover:opacity-90",
  secondary: "border border-line bg-surface text-fg hover:bg-line/50",
  outline: "border border-primary text-primary hover:bg-primary/10",
  ghost: "text-primary hover:bg-primary/10",
};
const BTN_DARK: Record<string, string> = {
  primary: "bg-bg text-fg shadow-sm hover:opacity-90",
  secondary: "bg-white/15 hover:bg-white/25",
  outline: "border border-current hover:bg-white/10",
  ghost: "hover:bg-white/10",
};

export function btn(
  ctx: RenderContext,
  label: string,
  href: string,
  variant: string,
  dark: boolean,
  path: string,
  size = "md",
  o: { icon?: string; submit?: boolean; full?: boolean } = {},
): string {
  if (!label) return "";
  const cls = cx(
    "inline-flex items-center justify-center gap-2 rounded-btn font-semibold transition",
    pick(BTN_SIZE, size),
    pick(dark ? BTN_DARK : BTN_LIGHT, variant),
    o.full && "w-full",
  );
  const inner = `${o.icon ? icon(o.icon, "h-4 w-4") : ""}<span ${ctx.e(path)}>${esc(label)}</span>`;
  if (o.submit) return `<button type="submit" class="${cls}">${inner}</button>`;
  return `<a href="${esc(ctx.href(href))}" class="${cls}">${inner}</a>`;
}

export function iconBox(name: string, dark: boolean, size = "h-11 w-11"): string {
  return `<div class="${cx("inline-flex shrink-0 items-center justify-center rounded-theme", size, dark ? "bg-white/15" : "bg-primary/10 text-primary")}">${icon(name, "h-5 w-5")}</div>`;
}

export function stars(rating: number, cls = "h-4 w-4"): string {
  const n = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  let out = "";
  for (let i = 0; i < 5; i++) {
    out += `<span class="${i < n ? "text-amber-400" : "text-line"}">${icon("star", cls).replace('fill="none"', 'fill="currentColor"')}</span>`;
  }
  return `<div class="flex items-center gap-0.5" role="img" aria-label="${n} out of 5 stars">${out}</div>`;
}

export const INPUT_CLS =
  "w-full rounded-theme border border-line bg-bg px-3.5 py-2.5 text-sm text-fg placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";
