/**
 * AI-facing catalog. Generated from the registry, so adding a component
 * automatically teaches the AI about it. The AI may ONLY use what is listed here.
 */
import type { Field, PageDocument } from "./types";
import { listComponents } from "./registry";
import { ICON_NAMES, SOCIAL_ICONS } from "./icons";
import { THEME_OPTIONS, THEME_PRESETS } from "./theme";

export interface CatalogOptions {
  /** Restrict to these component types (use for very large libraries / two-step generation). */
  types?: string[];
}

function describeField(f: Field): string {
  const opt = f.optional ? "?" : "";
  let t: string;
  switch (f.kind) {
    case "text":
      t = `text≤${f.max}`;
      break;
    case "textarea":
      t = `text≤${f.max}`;
      break;
    case "url":
      t = "url";
      break;
    case "image":
      t = 'image(url | "placeholder:<description>")';
      break;
    case "icon":
      t = "icon";
      break;
    case "select":
      t = f.options.map((o) => `"${o}"`).join("|") + ` (default "${f.default}")`;
      break;
    case "boolean":
      t = "bool";
      break;
    case "number":
      t = `number ${f.min}-${f.max}`;
      break;
    case "strings":
      t = `text[≤${f.max}]`;
      break;
    case "list":
      t = `list[${f.min}-${f.max}] of {${Object.entries(f.item)
        .map(([k, v]) => `${k}${describeField(v)}`)
        .join(", ")}}`;
      break;
  }
  return `${opt}: ${t}${f.ai ? ` — ${f.ai}` : ""}`;
}

export function buildCatalog(opts: CatalogOptions = {}): string {
  const defs = listComponents().filter((d) => !opts.types || opts.types.includes(d.type));
  const lines: string[] = [];
  let cat = "";
  for (const d of defs) {
    if (d.category !== cat) {
      cat = d.category;
      lines.push(`\n## ${cat.toUpperCase()}`);
    }
    const kids = d.accepts ? (d.accepts === "blocks" ? "children: any block components" : `children: ${d.accepts.join(", ")}`) : "no children";
    lines.push(`\n### ${d.type} [${d.level}] — ${d.description}${d.aiHint ? ` HINT: ${d.aiHint}` : ""}`);
    lines.push(`${kids}`);
    lines.push(
      "props: " +
        Object.entries(d.props)
          .map(([k, v]) => `${k}${describeField(v)}`)
          .join("; "),
    );
  }
  return lines.join("\n").trim();
}

/** One line per component, for a cheap first "pick components" step. */
export function buildOutlineCatalog(): string {
  return listComponents()
    .map((d) => `${d.type} [${d.level}/${d.category}]: ${d.description}`)
    .join("\n");
}

const EXAMPLE = {
  version: 1,
  meta: { title: "Maple Coffee", description: "Small-batch coffee roasters in Helsinki.", language: "en" },
  theme: { preset: "amber", mode: "light", fontHeading: "Playfair Display", fontBody: "Inter", radius: "md" },
  pages: [
    {
      path: "/",
      title: "Maple Coffee — Small-batch roasters",
      root: [
        { type: "navbar", props: { brand: "Maple Coffee", links: [{ label: "Menu", href: "#menu" }, { label: "Visit", href: "#visit" }], ctaLabel: "Order online", ctaHref: "#visit" } },
        { type: "hero", props: { variant: "split", heading: "Coffee roasted with care", subheading: "Single-origin beans, roasted weekly and served warm.", primaryLabel: "See the menu", primaryHref: "#menu", image: "placeholder:Latte art on a wooden table" } },
        { type: "section", props: { bg: "surface", anchor: "visit" }, children: [{ type: "heading", props: { text: "Visit us", align: "center" } }, { type: "text", props: { text: "Mon–Sat 8:00–18:00 · Aleksis Kiven katu 5, Helsinki", align: "center" } }] },
        { type: "footer", props: { brand: "Maple Coffee", copyright: "© 2026 Maple Coffee" } },
      ],
    },
  ],
};

export function buildSystemPrompt(opts: CatalogOptions = {}): string {
  const presets = Object.entries(THEME_PRESETS)
    .map(([k, v]) => `${k} (${v.vibe})`)
    .join("; ");
  return `You are the website generator of a visual site builder. You do NOT write HTML or CSS. You compose websites ONLY from the component library below and reply with ONE JSON document.

# Output contract
- Reply with a single JSON object and nothing else: no markdown fences, no comments, no explanations.
- Use ONLY component types listed in the catalog. Never invent types, props or icon names. Unknown ones are rejected.
- Page roots contain [section]-level components only. Every node inside "children" must be a [block]-level component accepted by its parent.
- NEVER put a [section]-level component (including "section", "gallery", "cta", or any other catalog entry marked [section]) inside "children". Sections are full-width siblings in the page's "root" array. To add content inside a section, use [block] components such as heading, text, columns, grid, or card.
- If a page needs several sections, put each one next to the others in "root"; do not wrap sections inside a "section".
- Node shape: {"type": "<component type>", "props": {...}, "children": [...]}. "id" is optional (the system adds ids). Omit "children" for components that take none.
- Fill EVERY non-optional prop with real, specific copy written for this business. No lorem ipsum, no "Your headline here". Respect the max lengths.
- Images: you cannot see or host images. For every image prop use "placeholder:<short description of the ideal photo>". The user replaces them later.
- Links: use "#anchor" (the target section needs a matching "anchor" prop), page paths like "/about", "mailto:", "tel:" or https URLs.
- Select props must use exactly one of the listed values. Icons must be one of: ${ICON_NAMES.join(", ")} (social: ${SOCIAL_ICONS.join(", ")}).

# Document shape
{"version":1,"meta":{"title","description","language"},"theme":{"preset","mode","fontHeading","fontBody","radius"},"pages":[{"path":"/","title","description?","root":[ ...sections ]}]}
- theme.preset: ${presets}. theme.mode: ${THEME_OPTIONS.modes.join("|")}. fonts: ${THEME_OPTIONS.fonts.join(", ")}. radius: ${THEME_OPTIONS.radius.join("|")}.
- Choose theme values that fit the brand. Colors come only from the preset (no custom hex).
- Create one page unless the user asks for several (or clearly needs them). The first page path must be "/". Other paths are lowercase like "/about".
- Every page starts with a "navbar" and ends with a "footer" (same brand, links and footer on all pages). Multi-page navbars link to page paths.

# Design rules
- Typical landing page: navbar, hero, 2-5 content sections, one social-proof section when it fits (testimonials/logos/stats), cta, footer. Usually 6-9 sections.
- Alternate section backgrounds ("default" and "surface") for rhythm; use "primary"/"dark"/"gradient" sparingly (cta, stats).
- Do not repeat the same section type back to back. Vary variants (e.g. feature-split with reverse true/false).
- Prefer ready-made sections (hero, features, pricing, faq, ...) over hand-built "section" layouts. Use "section" + blocks only for content no ready-made section covers.
- Write in the language of the user's request.

# Editing an existing site
When the user message contains a current document, return the COMPLETE updated document. Keep every "id" and every part the user did not ask to change exactly as it is.

# Example (shortened)
${JSON.stringify(EXAMPLE)}

# Component catalog
${buildCatalog(opts)}`;
}

export function describeDocumentForAI(doc: PageDocument): string {
  return JSON.stringify(doc);
}
