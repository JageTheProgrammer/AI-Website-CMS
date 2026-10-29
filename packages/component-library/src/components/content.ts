import { defineComponent, f } from "../fields";
import { ICON_NAMES, icon } from "../icons";
import { arr, cx, esc, imgSrc, paragraphs, pick } from "../util";
import { btn } from "./_shared";

const ALIGN: Record<string, string> = { left: "text-left", center: "text-center", right: "text-right" };
const JUST: Record<string, string> = { left: "justify-start", center: "justify-center", right: "justify-end" };

const H_SIZE: Record<string, string> = {
  sm: "text-lg sm:text-xl",
  md: "text-2xl sm:text-3xl",
  lg: "text-3xl sm:text-4xl",
  xl: "text-4xl sm:text-5xl",
  "2xl": "text-5xl sm:text-6xl",
};
const T_SIZE: Record<string, string> = { sm: "text-sm", md: "text-base", lg: "text-lg", xl: "text-xl" };

const RATIO: Record<string, string> = {
  auto: "",
  "1/1": "aspect-square",
  "4/3": "aspect-[4/3]",
  "3/2": "aspect-[3/2]",
  "16/9": "aspect-video",
  "21/9": "aspect-[21/9]",
};
const ROUND: Record<string, string> = { none: "rounded-none", md: "rounded-theme", lg: "rounded-3xl", full: "rounded-full" };

const TONE_BADGE: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  neutral: "bg-surface text-fg border border-line",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-rose-100 text-rose-800",
};
const TONE_CALLOUT: Record<string, { box: string; ic: string; name: string }> = {
  info: { box: "border-sky-200 bg-sky-50 text-sky-900", ic: "text-sky-600", name: "info" },
  success: { box: "border-emerald-200 bg-emerald-50 text-emerald-900", ic: "text-emerald-600", name: "check-circle" },
  warning: { box: "border-amber-200 bg-amber-50 text-amber-900", ic: "text-amber-600", name: "alert-triangle" },
  danger: { box: "border-rose-200 bg-rose-50 text-rose-900", ic: "text-rose-600", name: "alert-triangle" },
};
const ICON_SIZE: Record<string, string> = { sm: "h-8 w-8", md: "h-11 w-11", lg: "h-14 w-14", xl: "h-20 w-20" };
const ICON_GLYPH: Record<string, string> = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-7 w-7", xl: "h-10 w-10" };
const ICON_TONE: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  fg: "bg-surface text-fg border border-line",
  muted: "bg-surface text-muted",
};

export const contentComponents = [
  defineComponent({
    type: "heading",
    label: "Heading",
    category: "content",
    level: "block",
    description: "Heading text (h1-h6 semantics, independent visual size).",
    props: {
      text: f.text("Text", "Section heading", { max: 160 }),
      level: f.select("Semantic level", ["h1", "h2", "h3", "h4", "h5", "h6"], "h2"),
      size: f.select("Size", Object.keys(H_SIZE), "lg"),
      align: f.select("Alignment", Object.keys(ALIGN), "left"),
    },
    resize: { width: true },
    render: (p, ctx) => {
      const tag = /^h[1-6]$/.test(p.level) ? p.level : "h2";
      return `<${tag} class="${cx("font-heading font-bold tracking-tight", pick(H_SIZE, p.size), pick(ALIGN, p.align))}" ${ctx.e("text")}>${esc(p.text)}</${tag}>`;
    },
  }),

  defineComponent({
    type: "text",
    label: "Text",
    category: "content",
    level: "block",
    description: "Paragraph text. Separate paragraphs with a blank line.",
    props: {
      text: f.area("Text", "Write something helpful here. Double-click to edit this text directly on the page.", { max: 2000 }),
      size: f.select("Size", Object.keys(T_SIZE), "md"),
      align: f.select("Alignment", Object.keys(ALIGN), "left"),
      muted: f.bool("Muted color", false),
    },
    resize: { width: true },
    render: (p, ctx) =>
      `<div class="${cx("space-y-4 leading-relaxed", pick(T_SIZE, p.size), pick(ALIGN, p.align), p.muted && "text-muted")}" ${ctx.e("text")}>${paragraphs(p.text)
        .map((t) => `<p>${esc(t).replace(/\n/g, "<br>")}</p>`)
        .join("")}</div>`,
  }),

  defineComponent({
    type: "button",
    label: "Button",
    category: "content",
    level: "block",
    description: "Single button/link. Use submit inside forms.",
    props: {
      label: f.text("Label", "Click me", { max: 40 }),
      href: f.url("Link", "#"),
      variant: f.select("Style", ["primary", "secondary", "outline", "ghost"], "primary"),
      size: f.select("Size", ["sm", "md", "lg"], "md"),
      icon: f.icon("Icon", "", { optional: true }),
      align: f.select("Alignment", Object.keys(JUST), "left"),
      full: f.bool("Full width", false),
      submit: f.bool("Submit form", false, { ai: "true only inside a form" }),
    },
    render: (p, ctx) =>
      `<div class="${cx("flex", pick(JUST, p.align))}">${btn(ctx, p.label, p.href, p.variant, false, "label", p.size, {
        icon: p.icon || undefined,
        submit: !!p.submit,
        full: !!p.full,
      })}</div>`,
  }),

  defineComponent({
    type: "button-group",
    label: "Button group",
    category: "content",
    level: "block",
    description: "Row of 2-4 buttons.",
    props: {
      items: f.list(
        "Buttons",
        {
          label: f.text("Label", "Button", { max: 30 }),
          href: f.url("Link", "#"),
          variant: f.select("Style", ["primary", "secondary", "outline", "ghost"], "primary"),
        },
        [
          { label: "Primary", href: "#", variant: "primary" },
          { label: "Secondary", href: "#", variant: "secondary" },
        ],
        { min: 1, max: 4 },
      ),
      align: f.select("Alignment", Object.keys(JUST), "left"),
      size: f.select("Size", ["sm", "md", "lg"], "md"),
    },
    render: (p, ctx) =>
      `<div class="${cx("flex flex-wrap gap-3", pick(JUST, p.align))}">${arr<any>(p.items)
        .map((b, i) => btn(ctx, b.label, b.href, b.variant, false, `items.${i}.label`, p.size))
        .join("")}</div>`,
  }),

  defineComponent({
    type: "image",
    label: "Image",
    category: "content",
    level: "block",
    description: "Single image with optional caption.",
    props: {
      src: f.image("Image", "placeholder:Image"),
      alt: f.text("Alt text", "Descriptive image text", { max: 160 }),
      ratio: f.select("Aspect ratio", Object.keys(RATIO), "auto"),
      fit: f.select("Fit", ["cover", "contain"], "cover"),
      rounded: f.select("Corners", Object.keys(ROUND), "md"),
      shadow: f.bool("Shadow", false),
      caption: f.text("Caption", "", { max: 160, optional: true }),
    },
    resize: { width: true, height: true, heightMode: "fixed" },
    render: (p, ctx) =>
      `<figure class="flex flex-col gap-2"><img src="${esc(imgSrc(p.src))}" alt="${esc(p.alt)}" loading="lazy" class="${cx(
        "w-full min-h-0 flex-1",
        p.fit === "contain" ? "object-contain" : "object-cover",
        pick(RATIO, p.ratio),
        pick(ROUND, p.rounded),
        p.shadow && "shadow-xl",
      )}">${p.caption ? `<figcaption class="text-center text-sm text-muted" ${ctx.e("caption")}>${esc(p.caption)}</figcaption>` : ""}</figure>`,
  }),

  defineComponent({
    type: "list",
    label: "List",
    category: "content",
    level: "block",
    description: "Bulleted, checked or numbered list.",
    props: {
      items: f.strs("Items", ["First point", "Second point", "Third point"], { max: 12, maxItem: 160 }),
      style: f.select("Style", ["check", "bullets", "numbers", "plain"], "check"),
      size: f.select("Size", Object.keys(T_SIZE), "md"),
    },
    render: (p, ctx) => {
      const items = arr<string>(p.items);
      if (p.style === "numbers" || p.style === "bullets") {
        const tag = p.style === "numbers" ? "ol" : "ul";
        return `<${tag} class="${cx("space-y-2 pl-5", p.style === "numbers" ? "list-decimal" : "list-disc", pick(T_SIZE, p.size))}">${items
          .map((t, i) => `<li ${ctx.e(`items.${i}`)}>${esc(t)}</li>`)
          .join("")}</${tag}>`;
      }
      return `<ul class="${cx("space-y-2", pick(T_SIZE, p.size))}">${items
        .map(
          (t, i) =>
            `<li class="flex items-start gap-3">${p.style === "check" ? `<span class="mt-0.5 shrink-0 text-primary">${icon("check-circle", "h-5 w-5")}</span>` : ""}<span ${ctx.e(`items.${i}`)}>${esc(t)}</span></li>`,
        )
        .join("")}</ul>`;
    },
  }),

  defineComponent({
    type: "quote",
    label: "Quote",
    category: "content",
    level: "block",
    description: "Pull quote with attribution.",
    props: {
      text: f.area("Quote", "Design is not just what it looks like. Design is how it works.", { max: 400 }),
      author: f.text("Author", "Steve Jobs", { max: 60, optional: true }),
      role: f.text("Role", "", { max: 60, optional: true }),
      variant: f.select("Style", ["simple", "boxed"], "simple"),
    },
    render: (p, ctx) =>
      `<figure class="${cx(p.variant === "boxed" ? "rounded-theme border border-line bg-surface p-6" : "border-l-4 border-primary pl-5")}">` +
      `<blockquote class="text-lg italic leading-relaxed" ${ctx.e("text")}>${esc(p.text)}</blockquote>` +
      (p.author
        ? `<figcaption class="mt-3 text-sm"><span class="font-semibold" ${ctx.e("author")}>${esc(p.author)}</span>${p.role ? ` <span class="text-muted" ${ctx.e("role")}>· ${esc(p.role)}</span>` : ""}</figcaption>`
        : "") +
      `</figure>`,
  }),

  defineComponent({
    type: "badge",
    label: "Badge",
    category: "content",
    level: "block",
    description: "Small label / tag.",
    props: {
      label: f.text("Label", "New", { max: 30 }),
      tone: f.select("Tone", Object.keys(TONE_BADGE), "primary"),
    },
    render: (p, ctx) =>
      `<span class="${cx("inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold", pick(TONE_BADGE, p.tone))}" ${ctx.e("label")}>${esc(p.label)}</span>`,
  }),

  defineComponent({
    type: "icon",
    label: "Icon",
    category: "content",
    level: "block",
    description: "Standalone icon in a tinted tile.",
    props: {
      name: f.icon("Icon", "star"),
      size: f.select("Size", Object.keys(ICON_SIZE), "md"),
      tone: f.select("Tone", Object.keys(ICON_TONE), "primary"),
    },
    render: (p) =>
      `<span class="${cx("inline-flex w-fit items-center justify-center rounded-theme", pick(ICON_SIZE, p.size), pick(ICON_TONE, p.tone))}">${icon(p.name, pick(ICON_GLYPH, p.size))}</span>`,
  }),

  defineComponent({
    type: "callout",
    label: "Callout",
    category: "content",
    level: "block",
    description: "Highlighted note: info, success, warning or danger.",
    props: {
      tone: f.select("Tone", Object.keys(TONE_CALLOUT), "info"),
      title: f.text("Title", "Good to know", { max: 80, optional: true }),
      text: f.area("Text", "Add an important note for your readers here.", { max: 400 }),
    },
    render: (p, ctx) => {
      const t = pick(TONE_CALLOUT, p.tone);
      return (
        `<div role="note" class="${cx("flex gap-3 rounded-theme border p-4", t.box)}">` +
        `<span class="${cx("mt-0.5 shrink-0", t.ic)}">${icon(t.name, "h-5 w-5")}</span><div class="text-sm">` +
        (p.title ? `<p class="font-semibold" ${ctx.e("title")}>${esc(p.title)}</p>` : "") +
        `<p class="${p.title ? "mt-1" : ""}" ${ctx.e("text")}>${esc(p.text)}</p></div></div>`
      );
    },
  }),

  defineComponent({
    type: "code-block",
    label: "Code block",
    category: "content",
    level: "block",
    description: "Monospace code snippet (display only, never executed).",
    props: {
      code: f.area("Code", 'npm install my-package\n\nimport { hello } from "my-package";', { max: 4000 }),
      language: f.text("Language label", "bash", { max: 20, optional: true }),
    },
    render: (p, ctx) =>
      `<div class="overflow-hidden rounded-theme bg-slate-900 text-slate-100">` +
      (p.language ? `<div class="border-b border-white/10 px-4 py-2 text-xs uppercase tracking-wider text-slate-400">${esc(p.language)}</div>` : "") +
      `<pre class="overflow-x-auto p-4 text-sm leading-relaxed"><code ${ctx.e("code")}>${esc(p.code)}</code></pre></div>`,
  }),
];

void ICON_NAMES;
void imgSrc;
