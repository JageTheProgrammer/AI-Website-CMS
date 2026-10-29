import { defineComponent, f } from "../fields";
import { arr, cx, pick } from "../util";
import { GAP, WIDTH, sectionProps, section } from "./_shared";

const ALIGN_TEXT: Record<string, string> = { left: "text-left", center: "text-center", right: "text-right" };
const ITEMS: Record<string, string> = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" };
const JUSTIFY: Record<string, string> = { start: "justify-start", center: "justify-center", between: "justify-between", end: "justify-end" };

const gap = (def = "md") => f.select("Gap", Object.keys(GAP), def);

const COLS: Record<string, string> = {
  "1-1": "md:grid-cols-2",
  "1-2": "md:grid-cols-[1fr_2fr]",
  "2-1": "md:grid-cols-[2fr_1fr]",
  "1-3": "md:grid-cols-[1fr_3fr]",
  "3-1": "md:grid-cols-[3fr_1fr]",
  "1-1-1": "md:grid-cols-3",
  "1-2-1": "md:grid-cols-[1fr_2fr_1fr]",
  "1-1-1-1": "md:grid-cols-2 lg:grid-cols-4",
};

const GRID: Record<string, string> = {
  "1": "grid-cols-1",
  "2": "grid-cols-1 sm:grid-cols-2",
  "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  "4": "grid-cols-2 lg:grid-cols-4",
  "5": "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  "6": "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
};

const CARD: Record<string, string> = {
  elevated: "bg-surface text-fg shadow-lg",
  outlined: "border border-line bg-bg text-fg",
  filled: "bg-surface text-fg",
  primary: "bg-primary text-primary-fg",
};
const PAD: Record<string, string> = { sm: "p-4", md: "p-6", lg: "p-8" };

const SPACER: Record<string, string> = { xs: "h-2", sm: "h-4", md: "h-8", lg: "h-16", xl: "h-24", "2xl": "h-32" };

export const layoutComponents = [
  defineComponent({
    type: "section",
    label: "Section",
    category: "layout",
    level: "section",
    accepts: "blocks",
    description: "Generic full-width section that holds any blocks (heading, text, columns, card, image, button...).",
    aiHint: "Use for custom layouts that no ready-made section covers. Put blocks in children.",
    props: {
      ...sectionProps(),
      width: f.select("Content width", Object.keys(WIDTH), "default"),
      align: f.select("Text alignment", Object.keys(ALIGN_TEXT), "left"),
      gap: gap("md"),
    },
    resize: { height: true, heightMode: "min" },
    render: (p, ctx) =>
      section(p, `<div class="${cx("flex flex-col", pick(GAP, p.gap), pick(ALIGN_TEXT, p.align))}">${ctx.children}</div>`, {
        width: pick(WIDTH, p.width),
      }),
  }),

  defineComponent({
    type: "columns",
    label: "Columns",
    category: "layout",
    level: "block",
    accepts: "blocks",
    description: "Side-by-side columns (stack on mobile). Each direct child becomes one column.",
    aiHint: 'layout "1-2" = narrow + wide. Wrap each column\'s content in a "stack" or "card".',
    props: {
      layout: f.select("Layout", Object.keys(COLS), "1-1"),
      gap: gap("lg"),
      align: f.select("Vertical align", Object.keys(ITEMS), "start"),
    },
    resize: { width: true },
    render: (p, ctx) =>
      `<div class="${cx("grid grid-cols-1", pick(COLS, p.layout), pick(GAP, p.gap), pick(ITEMS, p.align))}">${ctx.children}</div>`,
  }),

  defineComponent({
    type: "grid",
    label: "Grid",
    category: "layout",
    level: "block",
    accepts: "blocks",
    description: "Equal-width responsive grid of blocks (1-6 columns).",
    props: {
      columns: f.select("Columns", Object.keys(GRID), "3"),
      gap: gap("md"),
    },
    resize: { width: true },
    render: (p, ctx) => `<div class="${cx("grid", pick(GRID, p.columns), pick(GAP, p.gap))}">${ctx.children}</div>`,
  }),

  defineComponent({
    type: "stack",
    label: "Stack",
    category: "layout",
    level: "block",
    accepts: "blocks",
    description: "Flex container that stacks blocks vertically or in a responsive row.",
    props: {
      direction: f.select("Direction", ["vertical", "horizontal"], "vertical"),
      gap: gap("md"),
      align: f.select("Align", Object.keys(ITEMS), "start"),
      justify: f.select("Justify", Object.keys(JUSTIFY), "start"),
      wrap: f.bool("Wrap", false),
    },
    resize: { width: true },
    render: (p, ctx) =>
      `<div class="${cx(
        "flex",
        p.direction === "horizontal" ? "flex-col sm:flex-row" : "flex-col",
        p.wrap && "flex-wrap",
        pick(GAP, p.gap),
        pick(ITEMS, p.align),
        pick(JUSTIFY, p.justify),
      )}">${ctx.children}</div>`,
  }),

  defineComponent({
    type: "card",
    label: "Card",
    category: "layout",
    level: "block",
    accepts: "blocks",
    description: "Bordered/elevated container for grouping blocks.",
    props: {
      variant: f.select("Style", Object.keys(CARD), "outlined"),
      padding: f.select("Padding", Object.keys(PAD), "md"),
      gap: gap("sm"),
    },
    resize: { width: true, height: true, heightMode: "min" },
    render: (p, ctx) =>
      `<div class="${cx("flex flex-col rounded-theme", pick(CARD, p.variant), pick(PAD, p.padding), pick(GAP, p.gap))}">${ctx.children}</div>`,
  }),

  defineComponent({
    type: "spacer",
    label: "Spacer",
    category: "layout",
    level: "block",
    description: "Empty vertical space.",
    props: { size: f.select("Size", Object.keys(SPACER), "md") },
    resize: { height: true, heightMode: "fixed" },
    render: (p) => `<div class="${pick(SPACER, p.size)}" aria-hidden="true"></div>`,
  }),

  defineComponent({
    type: "divider",
    label: "Divider",
    category: "layout",
    level: "block",
    description: "Horizontal rule.",
    props: {
      style: f.select("Style", ["solid", "dashed", "dotted"], "solid"),
      spacing: f.select("Spacing", ["sm", "md", "lg"], "md"),
    },
    render: (p) =>
      `<hr class="${cx(
        "w-full border-0 border-t border-line",
        pick({ solid: "border-solid", dashed: "border-dashed", dotted: "border-dotted" }, p.style),
        pick({ sm: "my-2", md: "my-4", lg: "my-8" }, p.spacing),
      )}">`,
  }),
];

void arr;
