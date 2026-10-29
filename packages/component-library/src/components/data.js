"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataComponents = void 0;
const fields_1 = require("../fields");
const util_1 = require("../util");
const _shared_1 = require("./_shared");
const STAT_COLS = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
};
exports.dataComponents = [
    (0, fields_1.defineComponent)({
        type: "stats",
        label: "Stats",
        category: "data",
        level: "section",
        description: "Key numbers (customers, uptime, years...) in a row.",
        aiHint: "2-4 items. value includes units, e.g. \"10k+\", \"99.9%\".",
        props: {
            variant: fields_1.f.select("Variant", ["plain", "cards", "divided"], "plain"),
            ...(0, _shared_1.sectionProps)("surface", "md"),
            ...(0, _shared_1.headerProps)({ eyebrow: "", heading: "", sub: "", optionalHeading: true }),
            items: fields_1.f.list("Stats", {
                value: fields_1.f.text("Value", "10k+", { max: 14 }),
                label: fields_1.f.text("Label", "Happy customers", { max: 50 }),
                description: fields_1.f.text("Description", "", { max: 100, optional: true }),
            }, [
                { value: "10k+", label: "Happy customers", description: "" },
                { value: "99.9%", label: "Uptime", description: "" },
                { value: "24/7", label: "Support", description: "" },
                { value: "50+", label: "Countries", description: "" },
            ], { min: 1, max: 6 }),
        },
        render: (p, ctx) => {
            const dark = (0, _shared_1.isDark)(p);
            const items = (0, util_1.arr)(p.items);
            const cells = items
                .map((it, i) => `<div class="${(0, util_1.cx)("text-center", p.variant === "cards" && "rounded-theme border border-line bg-bg p-6 text-fg shadow-sm", p.variant === "divided" && i > 0 && "sm:border-l sm:border-current/20")}"><p class="${(0, util_1.cx)("font-heading text-4xl font-bold tracking-tight sm:text-5xl", !dark && p.variant !== "cards" && "text-primary", p.variant === "cards" && "text-primary")}" ${ctx.e(`items.${i}.value`)}>${(0, util_1.esc)(it.value)}</p><p class="${(0, util_1.cx)("mt-2 font-medium", p.variant === "cards" ? "text-fg" : "")}" ${ctx.e(`items.${i}.label`)}>${(0, util_1.esc)(it.label)}</p>${it.description ? `<p class="${(0, util_1.cx)("mt-1 text-sm", (0, _shared_1.muted)(dark))}" ${ctx.e(`items.${i}.description`)}>${(0, util_1.esc)(it.description)}</p>` : ""}</div>`)
                .join("");
            return (0, _shared_1.section)(p, `${(0, _shared_1.header)(p, ctx, dark)}<div class="${(0, util_1.cx)("grid gap-6", (0, util_1.pick)(STAT_COLS, Math.max(1, Math.min(4, items.length))))}">${cells}</div>`);
        },
    }),
    (0, fields_1.defineComponent)({
        type: "table",
        label: "Table",
        category: "data",
        level: "section",
        description: "Data or comparison table (e.g. plan comparison, schedule, specifications).",
        aiHint: "Every row's cells array should have the same length as columns.",
        props: {
            ...(0, _shared_1.sectionProps)(),
            ...(0, _shared_1.headerProps)({ eyebrow: "", heading: "Compare plans", sub: "", optionalHeading: true }),
            columns: fields_1.f.list("Columns", { label: fields_1.f.text("Heading", "Column", { max: 40 }) }, [{ label: "Feature" }, { label: "Basic" }, { label: "Pro" }], { min: 2, max: 6 }),
            rows: fields_1.f.list("Rows", { cells: fields_1.f.strs("Cells", ["", "", ""], { max: 6, maxItem: 80 }) }, [
                { cells: ["Projects", "3", "Unlimited"] },
                { cells: ["Storage", "5 GB", "100 GB"] },
                { cells: ["Support", "Email", "Priority"] },
            ], { min: 1, max: 30 }),
            striped: fields_1.f.bool("Striped rows", true),
        },
        render: (p, ctx) => {
            const cols = (0, util_1.arr)(p.columns);
            const head = cols.map((c, i) => `<th scope="col" class="px-4 py-3 text-left font-semibold" ${ctx.e(`columns.${i}.label`)}>${(0, util_1.esc)(c.label)}</th>`).join("");
            const body = (0, util_1.arr)(p.rows)
                .map((r, ri) => `<tr class="${(0, util_1.cx)(p.striped && ri % 2 === 1 && "bg-surface")}">${cols
                .map((_, ci) => {
                const v = (0, util_1.arr)(r.cells)[ci] ?? "";
                return `<td class="${(0, util_1.cx)("border-t border-line px-4 py-3", ci === 0 && "font-medium")}" ${ctx.e(`rows.${ri}.cells.${ci}`)}>${(0, util_1.esc)(v)}</td>`;
            })
                .join("")}</tr>`)
                .join("");
            return (0, _shared_1.section)(p, `${(0, _shared_1.header)(p, ctx, (0, _shared_1.isDark)(p))}<div class="overflow-x-auto rounded-theme border border-line bg-bg text-fg"><table class="w-full min-w-[32rem] border-collapse text-sm"><thead class="bg-surface"><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`);
        },
    }),
    (0, fields_1.defineComponent)({
        type: "timeline",
        label: "Timeline",
        category: "data",
        level: "section",
        description: "Vertical timeline for history, milestones or roadmap.",
        props: {
            ...(0, _shared_1.sectionProps)(),
            ...(0, _shared_1.headerProps)({ eyebrow: "Our story", heading: "Milestones along the way", sub: "" }),
            items: fields_1.f.list("Events", { date: fields_1.f.text("Date", "2024", { max: 24 }), title: fields_1.f.text("Title", "Event", { max: 60 }), text: fields_1.f.area("Text", "", { max: 240, optional: true }) }, [
                { date: "2022", title: "Founded", text: "Started in a small garage with a big idea." },
                { date: "2023", title: "First 1,000 customers", text: "Word of mouth carried us further than we imagined." },
                { date: "2024", title: "Global launch", text: "Opened our doors to customers in more than 50 countries." },
                { date: "2026", title: "Next chapter", text: "Investing in the tools our community asked for most." },
            ], { min: 1, max: 10 }),
        },
        render: (p, ctx) => {
            const dark = (0, _shared_1.isDark)(p);
            const items = (0, util_1.arr)(p.items)
                .map((it, i) => `<li class="relative pb-10 pl-8 last:pb-0"><span class="${(0, util_1.cx)("absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full ring-4", dark ? "bg-current ring-white/20" : "bg-primary ring-primary/20")}"></span><p class="${(0, util_1.cx)("text-sm font-semibold", dark ? "opacity-80" : "text-primary")}" ${ctx.e(`items.${i}.date`)}>${(0, util_1.esc)(it.date)}</p><h3 class="mt-1 text-lg font-semibold" ${ctx.e(`items.${i}.title`)}>${(0, util_1.esc)(it.title)}</h3>${it.text ? `<p class="${(0, util_1.cx)("mt-1", (0, _shared_1.muted)(dark))}" ${ctx.e(`items.${i}.text`)}>${(0, util_1.esc)(it.text)}</p>` : ""}</li>`)
                .join("");
            return (0, _shared_1.section)(p, `${(0, _shared_1.header)(p, ctx, dark)}<ol class="${(0, util_1.cx)("mx-auto max-w-2xl border-l-2", dark ? "border-white/30" : "border-line")}">${items}</ol>`);
        },
    }),
    (0, fields_1.defineComponent)({
        type: "progress",
        label: "Progress bars",
        category: "data",
        level: "section",
        description: "Skill / metric bars with percentages.",
        props: {
            ...(0, _shared_1.sectionProps)(),
            ...(0, _shared_1.headerProps)({ eyebrow: "", heading: "What we're good at", sub: "", optionalHeading: true }),
            items: fields_1.f.list("Bars", { label: fields_1.f.text("Label", "Skill", { max: 40 }), value: fields_1.f.num("Value (0-100)", 80, 0, 100) }, [
                { label: "Design", value: 95 },
                { label: "Development", value: 88 },
                { label: "Strategy", value: 76 },
            ], { min: 1, max: 8 }),
        },
        render: (p, ctx) => {
            const dark = (0, _shared_1.isDark)(p);
            const bars = (0, util_1.arr)(p.items)
                .map((it, i) => {
                const v = Math.max(0, Math.min(100, Number(it.value) || 0));
                return `<div><div class="mb-2 flex justify-between text-sm font-medium"><span ${ctx.e(`items.${i}.label`)}>${(0, util_1.esc)(it.label)}</span><span>${v}%</span></div><div class="${(0, util_1.cx)("h-2.5 overflow-hidden rounded-full", dark ? "bg-white/20" : "bg-line")}" role="progressbar" aria-valuenow="${v}" aria-valuemin="0" aria-valuemax="100"><div class="${(0, util_1.cx)("h-full rounded-full", dark ? "bg-current" : "bg-primary")}" style="width:${v}%"></div></div></div>`;
            })
                .join("");
            return (0, _shared_1.section)(p, `${(0, _shared_1.header)(p, ctx, dark)}<div class="mx-auto max-w-2xl space-y-6">${bars}</div>`);
        },
    }),
];
