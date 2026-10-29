"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentComponents = void 0;
const fields_1 = require("../fields");
const icons_1 = require("../icons");
const util_1 = require("../util");
const _shared_1 = require("./_shared");
const ALIGN = { left: "text-left", center: "text-center", right: "text-right" };
const JUST = { left: "justify-start", center: "justify-center", right: "justify-end" };
const H_SIZE = {
    sm: "text-lg sm:text-xl",
    md: "text-2xl sm:text-3xl",
    lg: "text-3xl sm:text-4xl",
    xl: "text-4xl sm:text-5xl",
    "2xl": "text-5xl sm:text-6xl",
};
const T_SIZE = { sm: "text-sm", md: "text-base", lg: "text-lg", xl: "text-xl" };
const RATIO = {
    auto: "",
    "1/1": "aspect-square",
    "4/3": "aspect-[4/3]",
    "3/2": "aspect-[3/2]",
    "16/9": "aspect-video",
    "21/9": "aspect-[21/9]",
};
const ROUND = { none: "rounded-none", md: "rounded-theme", lg: "rounded-3xl", full: "rounded-full" };
const TONE_BADGE = {
    primary: "bg-primary/10 text-primary",
    neutral: "bg-surface text-fg border border-line",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-800",
};
const TONE_CALLOUT = {
    info: { box: "border-sky-200 bg-sky-50 text-sky-900", ic: "text-sky-600", name: "info" },
    success: { box: "border-emerald-200 bg-emerald-50 text-emerald-900", ic: "text-emerald-600", name: "check-circle" },
    warning: { box: "border-amber-200 bg-amber-50 text-amber-900", ic: "text-amber-600", name: "alert-triangle" },
    danger: { box: "border-rose-200 bg-rose-50 text-rose-900", ic: "text-rose-600", name: "alert-triangle" },
};
const ICON_SIZE = { sm: "h-8 w-8", md: "h-11 w-11", lg: "h-14 w-14", xl: "h-20 w-20" };
const ICON_GLYPH = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-7 w-7", xl: "h-10 w-10" };
const ICON_TONE = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    fg: "bg-surface text-fg border border-line",
    muted: "bg-surface text-muted",
};
exports.contentComponents = [
    (0, fields_1.defineComponent)({
        type: "heading",
        label: "Heading",
        category: "content",
        level: "block",
        description: "Heading text (h1-h6 semantics, independent visual size).",
        props: {
            text: fields_1.f.text("Text", "Section heading", { max: 160 }),
            level: fields_1.f.select("Semantic level", ["h1", "h2", "h3", "h4", "h5", "h6"], "h2"),
            size: fields_1.f.select("Size", Object.keys(H_SIZE), "lg"),
            align: fields_1.f.select("Alignment", Object.keys(ALIGN), "left"),
        },
        resize: { width: true },
        render: (p, ctx) => {
            const tag = /^h[1-6]$/.test(p.level) ? p.level : "h2";
            return `<${tag} class="${(0, util_1.cx)("font-heading font-bold tracking-tight", (0, util_1.pick)(H_SIZE, p.size), (0, util_1.pick)(ALIGN, p.align))}" ${ctx.e("text")}>${(0, util_1.esc)(p.text)}</${tag}>`;
        },
    }),
    (0, fields_1.defineComponent)({
        type: "text",
        label: "Text",
        category: "content",
        level: "block",
        description: "Paragraph text. Separate paragraphs with a blank line.",
        props: {
            text: fields_1.f.area("Text", "Write something helpful here. Double-click to edit this text directly on the page.", { max: 2000 }),
            size: fields_1.f.select("Size", Object.keys(T_SIZE), "md"),
            align: fields_1.f.select("Alignment", Object.keys(ALIGN), "left"),
            muted: fields_1.f.bool("Muted color", false),
        },
        resize: { width: true },
        render: (p, ctx) => `<div class="${(0, util_1.cx)("space-y-4 leading-relaxed", (0, util_1.pick)(T_SIZE, p.size), (0, util_1.pick)(ALIGN, p.align), p.muted && "text-muted")}" ${ctx.e("text")}>${(0, util_1.paragraphs)(p.text)
            .map((t) => `<p>${(0, util_1.esc)(t).replace(/\n/g, "<br>")}</p>`)
            .join("")}</div>`,
    }),
    (0, fields_1.defineComponent)({
        type: "button",
        label: "Button",
        category: "content",
        level: "block",
        description: "Single button/link. Use submit inside forms.",
        props: {
            label: fields_1.f.text("Label", "Click me", { max: 40 }),
            href: fields_1.f.url("Link", "#"),
            variant: fields_1.f.select("Style", ["primary", "secondary", "outline", "ghost"], "primary"),
            size: fields_1.f.select("Size", ["sm", "md", "lg"], "md"),
            icon: fields_1.f.icon("Icon", "", { optional: true }),
            align: fields_1.f.select("Alignment", Object.keys(JUST), "left"),
            full: fields_1.f.bool("Full width", false),
            submit: fields_1.f.bool("Submit form", false, { ai: "true only inside a form" }),
        },
        render: (p, ctx) => `<div class="${(0, util_1.cx)("flex", (0, util_1.pick)(JUST, p.align))}">${(0, _shared_1.btn)(ctx, p.label, p.href, p.variant, false, "label", p.size, {
            icon: p.icon || undefined,
            submit: !!p.submit,
            full: !!p.full,
        })}</div>`,
    }),
    (0, fields_1.defineComponent)({
        type: "button-group",
        label: "Button group",
        category: "content",
        level: "block",
        description: "Row of 2-4 buttons.",
        props: {
            items: fields_1.f.list("Buttons", {
                label: fields_1.f.text("Label", "Button", { max: 30 }),
                href: fields_1.f.url("Link", "#"),
                variant: fields_1.f.select("Style", ["primary", "secondary", "outline", "ghost"], "primary"),
            }, [
                { label: "Primary", href: "#", variant: "primary" },
                { label: "Secondary", href: "#", variant: "secondary" },
            ], { min: 1, max: 4 }),
            align: fields_1.f.select("Alignment", Object.keys(JUST), "left"),
            size: fields_1.f.select("Size", ["sm", "md", "lg"], "md"),
        },
        render: (p, ctx) => `<div class="${(0, util_1.cx)("flex flex-wrap gap-3", (0, util_1.pick)(JUST, p.align))}">${(0, util_1.arr)(p.items)
            .map((b, i) => (0, _shared_1.btn)(ctx, b.label, b.href, b.variant, false, `items.${i}.label`, p.size))
            .join("")}</div>`,
    }),
    (0, fields_1.defineComponent)({
        type: "image",
        label: "Image",
        category: "content",
        level: "block",
        description: "Single image with optional caption.",
        props: {
            src: fields_1.f.image("Image", "placeholder:Image"),
            alt: fields_1.f.text("Alt text", "Descriptive image text", { max: 160 }),
            ratio: fields_1.f.select("Aspect ratio", Object.keys(RATIO), "auto"),
            fit: fields_1.f.select("Fit", ["cover", "contain"], "cover"),
            rounded: fields_1.f.select("Corners", Object.keys(ROUND), "md"),
            shadow: fields_1.f.bool("Shadow", false),
            caption: fields_1.f.text("Caption", "", { max: 160, optional: true }),
        },
        resize: { width: true, height: true, heightMode: "fixed" },
        render: (p, ctx) => `<figure class="flex flex-col gap-2"><img src="${(0, util_1.esc)((0, util_1.imgSrc)(p.src))}" alt="${(0, util_1.esc)(p.alt)}" loading="lazy" class="${(0, util_1.cx)("w-full min-h-0 flex-1", p.fit === "contain" ? "object-contain" : "object-cover", (0, util_1.pick)(RATIO, p.ratio), (0, util_1.pick)(ROUND, p.rounded), p.shadow && "shadow-xl")}">${p.caption ? `<figcaption class="text-center text-sm text-muted" ${ctx.e("caption")}>${(0, util_1.esc)(p.caption)}</figcaption>` : ""}</figure>`,
    }),
    (0, fields_1.defineComponent)({
        type: "list",
        label: "List",
        category: "content",
        level: "block",
        description: "Bulleted, checked or numbered list.",
        props: {
            items: fields_1.f.strs("Items", ["First point", "Second point", "Third point"], { max: 12, maxItem: 160 }),
            style: fields_1.f.select("Style", ["check", "bullets", "numbers", "plain"], "check"),
            size: fields_1.f.select("Size", Object.keys(T_SIZE), "md"),
        },
        render: (p, ctx) => {
            const items = (0, util_1.arr)(p.items);
            if (p.style === "numbers" || p.style === "bullets") {
                const tag = p.style === "numbers" ? "ol" : "ul";
                return `<${tag} class="${(0, util_1.cx)("space-y-2 pl-5", p.style === "numbers" ? "list-decimal" : "list-disc", (0, util_1.pick)(T_SIZE, p.size))}">${items
                    .map((t, i) => `<li ${ctx.e(`items.${i}`)}>${(0, util_1.esc)(t)}</li>`)
                    .join("")}</${tag}>`;
            }
            return `<ul class="${(0, util_1.cx)("space-y-2", (0, util_1.pick)(T_SIZE, p.size))}">${items
                .map((t, i) => `<li class="flex items-start gap-3">${p.style === "check" ? `<span class="mt-0.5 shrink-0 text-primary">${(0, icons_1.icon)("check-circle", "h-5 w-5")}</span>` : ""}<span ${ctx.e(`items.${i}`)}>${(0, util_1.esc)(t)}</span></li>`)
                .join("")}</ul>`;
        },
    }),
    (0, fields_1.defineComponent)({
        type: "quote",
        label: "Quote",
        category: "content",
        level: "block",
        description: "Pull quote with attribution.",
        props: {
            text: fields_1.f.area("Quote", "Design is not just what it looks like. Design is how it works.", { max: 400 }),
            author: fields_1.f.text("Author", "Steve Jobs", { max: 60, optional: true }),
            role: fields_1.f.text("Role", "", { max: 60, optional: true }),
            variant: fields_1.f.select("Style", ["simple", "boxed"], "simple"),
        },
        render: (p, ctx) => `<figure class="${(0, util_1.cx)(p.variant === "boxed" ? "rounded-theme border border-line bg-surface p-6" : "border-l-4 border-primary pl-5")}">` +
            `<blockquote class="text-lg italic leading-relaxed" ${ctx.e("text")}>${(0, util_1.esc)(p.text)}</blockquote>` +
            (p.author
                ? `<figcaption class="mt-3 text-sm"><span class="font-semibold" ${ctx.e("author")}>${(0, util_1.esc)(p.author)}</span>${p.role ? ` <span class="text-muted" ${ctx.e("role")}>· ${(0, util_1.esc)(p.role)}</span>` : ""}</figcaption>`
                : "") +
            `</figure>`,
    }),
    (0, fields_1.defineComponent)({
        type: "badge",
        label: "Badge",
        category: "content",
        level: "block",
        description: "Small label / tag.",
        props: {
            label: fields_1.f.text("Label", "New", { max: 30 }),
            tone: fields_1.f.select("Tone", Object.keys(TONE_BADGE), "primary"),
        },
        render: (p, ctx) => `<span class="${(0, util_1.cx)("inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold", (0, util_1.pick)(TONE_BADGE, p.tone))}" ${ctx.e("label")}>${(0, util_1.esc)(p.label)}</span>`,
    }),
    (0, fields_1.defineComponent)({
        type: "icon",
        label: "Icon",
        category: "content",
        level: "block",
        description: "Standalone icon in a tinted tile.",
        props: {
            name: fields_1.f.icon("Icon", "star"),
            size: fields_1.f.select("Size", Object.keys(ICON_SIZE), "md"),
            tone: fields_1.f.select("Tone", Object.keys(ICON_TONE), "primary"),
        },
        render: (p) => `<span class="${(0, util_1.cx)("inline-flex w-fit items-center justify-center rounded-theme", (0, util_1.pick)(ICON_SIZE, p.size), (0, util_1.pick)(ICON_TONE, p.tone))}">${(0, icons_1.icon)(p.name, (0, util_1.pick)(ICON_GLYPH, p.size))}</span>`,
    }),
    (0, fields_1.defineComponent)({
        type: "callout",
        label: "Callout",
        category: "content",
        level: "block",
        description: "Highlighted note: info, success, warning or danger.",
        props: {
            tone: fields_1.f.select("Tone", Object.keys(TONE_CALLOUT), "info"),
            title: fields_1.f.text("Title", "Good to know", { max: 80, optional: true }),
            text: fields_1.f.area("Text", "Add an important note for your readers here.", { max: 400 }),
        },
        render: (p, ctx) => {
            const t = (0, util_1.pick)(TONE_CALLOUT, p.tone);
            return (`<div role="note" class="${(0, util_1.cx)("flex gap-3 rounded-theme border p-4", t.box)}">` +
                `<span class="${(0, util_1.cx)("mt-0.5 shrink-0", t.ic)}">${(0, icons_1.icon)(t.name, "h-5 w-5")}</span><div class="text-sm">` +
                (p.title ? `<p class="font-semibold" ${ctx.e("title")}>${(0, util_1.esc)(p.title)}</p>` : "") +
                `<p class="${p.title ? "mt-1" : ""}" ${ctx.e("text")}>${(0, util_1.esc)(p.text)}</p></div></div>`);
        },
    }),
    (0, fields_1.defineComponent)({
        type: "code-block",
        label: "Code block",
        category: "content",
        level: "block",
        description: "Monospace code snippet (display only, never executed).",
        props: {
            code: fields_1.f.area("Code", 'npm install my-package\n\nimport { hello } from "my-package";', { max: 4000 }),
            language: fields_1.f.text("Language label", "bash", { max: 20, optional: true }),
        },
        render: (p, ctx) => `<div class="overflow-hidden rounded-theme bg-slate-900 text-slate-100">` +
            (p.language ? `<div class="border-b border-white/10 px-4 py-2 text-xs uppercase tracking-wider text-slate-400">${(0, util_1.esc)(p.language)}</div>` : "") +
            `<pre class="overflow-x-auto p-4 text-sm leading-relaxed"><code ${ctx.e("code")}>${(0, util_1.esc)(p.code)}</code></pre></div>`,
    }),
];
void icons_1.ICON_NAMES;
void util_1.imgSrc;
