"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.layoutComponents = void 0;
const fields_1 = require("../fields");
const util_1 = require("../util");
const _shared_1 = require("./_shared");
const ALIGN_TEXT = { left: "text-left", center: "text-center", right: "text-right" };
const ITEMS = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" };
const JUSTIFY = { start: "justify-start", center: "justify-center", between: "justify-between", end: "justify-end" };
const gap = (def = "md") => fields_1.f.select("Gap", Object.keys(_shared_1.GAP), def);
const COLS = {
    "1-1": "md:grid-cols-2",
    "1-2": "md:grid-cols-[1fr_2fr]",
    "2-1": "md:grid-cols-[2fr_1fr]",
    "1-3": "md:grid-cols-[1fr_3fr]",
    "3-1": "md:grid-cols-[3fr_1fr]",
    "1-1-1": "md:grid-cols-3",
    "1-2-1": "md:grid-cols-[1fr_2fr_1fr]",
    "1-1-1-1": "md:grid-cols-2 lg:grid-cols-4",
};
const GRID = {
    "1": "grid-cols-1",
    "2": "grid-cols-1 sm:grid-cols-2",
    "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    "4": "grid-cols-2 lg:grid-cols-4",
    "5": "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
    "6": "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
};
const CARD = {
    elevated: "bg-surface text-fg shadow-lg",
    outlined: "border border-line bg-bg text-fg",
    filled: "bg-surface text-fg",
    primary: "bg-primary text-primary-fg",
};
const PAD = { sm: "p-4", md: "p-6", lg: "p-8" };
const SPACER = { xs: "h-2", sm: "h-4", md: "h-8", lg: "h-16", xl: "h-24", "2xl": "h-32" };
exports.layoutComponents = [
    (0, fields_1.defineComponent)({
        type: "section",
        label: "Section",
        category: "layout",
        level: "section",
        accepts: "blocks",
        description: "Generic full-width section that holds any blocks (heading, text, columns, card, image, button...).",
        aiHint: "Use for custom layouts that no ready-made section covers. Put blocks in children.",
        props: {
            ...(0, _shared_1.sectionProps)(),
            width: fields_1.f.select("Content width", Object.keys(_shared_1.WIDTH), "default"),
            align: fields_1.f.select("Text alignment", Object.keys(ALIGN_TEXT), "left"),
            gap: gap("md"),
        },
        resize: { height: true, heightMode: "min" },
        render: (p, ctx) => (0, _shared_1.section)(p, `<div class="${(0, util_1.cx)("flex flex-col", (0, util_1.pick)(_shared_1.GAP, p.gap), (0, util_1.pick)(ALIGN_TEXT, p.align))}">${ctx.children}</div>`, {
            width: (0, util_1.pick)(_shared_1.WIDTH, p.width),
        }),
    }),
    (0, fields_1.defineComponent)({
        type: "columns",
        label: "Columns",
        category: "layout",
        level: "block",
        accepts: "blocks",
        description: "Side-by-side columns (stack on mobile). Each direct child becomes one column.",
        aiHint: 'layout "1-2" = narrow + wide. Wrap each column\'s content in a "stack" or "card".',
        props: {
            layout: fields_1.f.select("Layout", Object.keys(COLS), "1-1"),
            gap: gap("lg"),
            align: fields_1.f.select("Vertical align", Object.keys(ITEMS), "start"),
        },
        resize: { width: true },
        render: (p, ctx) => `<div class="${(0, util_1.cx)("grid grid-cols-1", (0, util_1.pick)(COLS, p.layout), (0, util_1.pick)(_shared_1.GAP, p.gap), (0, util_1.pick)(ITEMS, p.align))}">${ctx.children}</div>`,
    }),
    (0, fields_1.defineComponent)({
        type: "grid",
        label: "Grid",
        category: "layout",
        level: "block",
        accepts: "blocks",
        description: "Equal-width responsive grid of blocks (1-6 columns).",
        props: {
            columns: fields_1.f.select("Columns", Object.keys(GRID), "3"),
            gap: gap("md"),
        },
        resize: { width: true },
        render: (p, ctx) => `<div class="${(0, util_1.cx)("grid", (0, util_1.pick)(GRID, p.columns), (0, util_1.pick)(_shared_1.GAP, p.gap))}">${ctx.children}</div>`,
    }),
    (0, fields_1.defineComponent)({
        type: "stack",
        label: "Stack",
        category: "layout",
        level: "block",
        accepts: "blocks",
        description: "Flex container that stacks blocks vertically or in a responsive row.",
        props: {
            direction: fields_1.f.select("Direction", ["vertical", "horizontal"], "vertical"),
            gap: gap("md"),
            align: fields_1.f.select("Align", Object.keys(ITEMS), "start"),
            justify: fields_1.f.select("Justify", Object.keys(JUSTIFY), "start"),
            wrap: fields_1.f.bool("Wrap", false),
        },
        resize: { width: true },
        render: (p, ctx) => `<div class="${(0, util_1.cx)("flex", p.direction === "horizontal" ? "flex-col sm:flex-row" : "flex-col", p.wrap && "flex-wrap", (0, util_1.pick)(_shared_1.GAP, p.gap), (0, util_1.pick)(ITEMS, p.align), (0, util_1.pick)(JUSTIFY, p.justify))}">${ctx.children}</div>`,
    }),
    (0, fields_1.defineComponent)({
        type: "card",
        label: "Card",
        category: "layout",
        level: "block",
        accepts: "blocks",
        description: "Bordered/elevated container for grouping blocks.",
        props: {
            variant: fields_1.f.select("Style", Object.keys(CARD), "outlined"),
            padding: fields_1.f.select("Padding", Object.keys(PAD), "md"),
            gap: gap("sm"),
        },
        resize: { width: true, height: true, heightMode: "min" },
        render: (p, ctx) => `<div class="${(0, util_1.cx)("flex flex-col rounded-theme", (0, util_1.pick)(CARD, p.variant), (0, util_1.pick)(PAD, p.padding), (0, util_1.pick)(_shared_1.GAP, p.gap))}">${ctx.children}</div>`,
    }),
    (0, fields_1.defineComponent)({
        type: "spacer",
        label: "Spacer",
        category: "layout",
        level: "block",
        description: "Empty vertical space.",
        props: { size: fields_1.f.select("Size", Object.keys(SPACER), "md") },
        resize: { height: true, heightMode: "fixed" },
        render: (p) => `<div class="${(0, util_1.pick)(SPACER, p.size)}" aria-hidden="true"></div>`,
    }),
    (0, fields_1.defineComponent)({
        type: "divider",
        label: "Divider",
        category: "layout",
        level: "block",
        description: "Horizontal rule.",
        props: {
            style: fields_1.f.select("Style", ["solid", "dashed", "dotted"], "solid"),
            spacing: fields_1.f.select("Spacing", ["sm", "md", "lg"], "md"),
        },
        render: (p) => `<hr class="${(0, util_1.cx)("w-full border-0 border-t border-line", (0, util_1.pick)({ solid: "border-solid", dashed: "border-dashed", dotted: "border-dotted" }, p.style), (0, util_1.pick)({ sm: "my-2", md: "my-4", lg: "my-8" }, p.spacing))}">`,
    }),
];
void util_1.arr;
