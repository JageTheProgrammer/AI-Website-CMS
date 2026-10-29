"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formsComponents = void 0;
const fields_1 = require("../fields");
const icons_1 = require("../icons");
const util_1 = require("../util");
const _shared_1 = require("./_shared");
const NAME = { max: 40, format: "slug", ai: "lowercase field name, e.g. email" };
const label = (ctx, path, text, required) => `<span class="font-medium" ${ctx.e(path)}>${(0, util_1.esc)(text)}${required ? '<span class="text-rose-500"> *</span>' : ""}</span>`;
exports.formsComponents = [
    (0, fields_1.defineComponent)({
        type: "contact-form",
        label: "Contact form",
        category: "forms",
        level: "section",
        description: "Ready-made contact section: header, form (name, email, optional phone/subject, message) and optional contact details.",
        aiHint: 'Variants: "simple" (centered form) or "split" (details on the left, form on the right).',
        props: {
            variant: fields_1.f.select("Variant", ["simple", "split"], "split"),
            ...(0, _shared_1.sectionProps)(),
            ...(0, _shared_1.headerProps)({ eyebrow: "Contact", heading: "Get in touch", sub: "We usually reply within one business day." }),
            showPhone: fields_1.f.bool("Phone field", false),
            showSubject: fields_1.f.bool("Subject field", true),
            submitLabel: fields_1.f.text("Submit label", "Send message", { max: 30 }),
            email: fields_1.f.text("Contact email", "hello@example.com", { max: 80, optional: true }),
            phone: fields_1.f.text("Contact phone", "+1 555 123 4567", { max: 40, optional: true }),
            address: fields_1.f.text("Address", "123 Main Street, Springfield", { max: 120, optional: true }),
        },
        render: (p, ctx) => {
            const dark = (0, _shared_1.isDark)(p);
            const field = (name, text, type, req = true) => `<label class="flex flex-col gap-1.5 text-sm"><span class="font-medium">${(0, util_1.esc)(text)}${req ? '<span class="text-rose-500"> *</span>' : ""}</span><input type="${type}" name="${name}"${req ? " required" : ""} class="${_shared_1.INPUT_CLS} text-fg"></label>`;
            const form = `<form method="post" action="${(0, util_1.esc)(ctx.formAction)}" class="${(0, util_1.cx)("flex flex-col gap-4", dark && "rounded-theme bg-bg p-6 text-fg")}"><input type="hidden" name="_form" value="contact">` +
                `<div class="grid gap-4 sm:grid-cols-2">${field("name", "Name", "text")}${field("email", "Email", "email")}</div>` +
                (p.showPhone ? field("phone", "Phone", "tel", false) : "") +
                (p.showSubject ? field("subject", "Subject", "text", false) : "") +
                `<label class="flex flex-col gap-1.5 text-sm"><span class="font-medium">Message<span class="text-rose-500"> *</span></span><textarea name="message" rows="5" required class="${_shared_1.INPUT_CLS} text-fg"></textarea></label>` +
                `<div>${(0, _shared_1.btn)(ctx, p.submitLabel, "#", "primary", false, "submitLabel", "md", { submit: true })}</div></form>`;
            const rows = [
                ["mail", p.email],
                ["phone", p.phone],
                ["map-pin", p.address],
            ].filter((r) => r[1]);
            const info = rows
                .map(([ic, v]) => `<li class="flex items-start gap-3"><span class="${(0, util_1.cx)("mt-0.5 shrink-0", dark ? "" : "text-primary")}">${(0, icons_1.icon)(ic, "h-5 w-5")}</span><span>${(0, util_1.esc)(v)}</span></li>`)
                .join("");
            if (p.variant === "simple")
                return (0, _shared_1.section)(p, `${(0, _shared_1.header)(p, ctx, dark)}<div class="mx-auto max-w-2xl">${form}</div>`);
            return (0, _shared_1.section)(p, `<div class="grid gap-12 md:grid-cols-2"><div>${(0, _shared_1.header)({ ...p, align: "left" }, ctx, dark).replace("mb-12", "mb-8")}<ul class="space-y-4">${info}</ul></div>${form}</div>`);
        },
    }),
    (0, fields_1.defineComponent)({
        type: "contact-info",
        label: "Contact details",
        category: "forms",
        level: "block",
        description: "List of contact details (email, phone, address, hours) with icons.",
        props: {
            variant: fields_1.f.select("Style", ["list", "cards"], "list"),
            items: fields_1.f.list("Items", {
                icon: fields_1.f.icon("Icon", "mail"),
                label: fields_1.f.text("Label", "Email", { max: 30 }),
                value: fields_1.f.text("Value", "hello@example.com", { max: 100 }),
                href: fields_1.f.url("Link", "", { optional: true }),
            }, [
                { icon: "mail", label: "Email", value: "hello@example.com", href: "mailto:hello@example.com" },
                { icon: "phone", label: "Phone", value: "+1 555 123 4567", href: "tel:+15551234567" },
                { icon: "map-pin", label: "Address", value: "123 Main Street, Springfield", href: "" },
                { icon: "clock", label: "Hours", value: "Mon–Fri, 9:00–17:00", href: "" },
            ], { min: 1, max: 6 }),
        },
        render: (p, ctx) => {
            const cards = p.variant === "cards";
            return `<ul class="${(0, util_1.cx)(cards ? "grid gap-4 sm:grid-cols-2" : "space-y-4")}">${(0, util_1.arr)(p.items)
                .map((it, i) => {
                const val = `<span ${ctx.e(`items.${i}.value`)}>${(0, util_1.esc)(it.value)}</span>`;
                const body = it.href ? `<a href="${(0, util_1.esc)(ctx.href(it.href))}" class="hover:underline">${val}</a>` : val;
                return `<li class="${(0, util_1.cx)("flex items-start gap-3", cards && "rounded-theme border border-line bg-surface p-4 text-fg")}"><span class="mt-0.5 shrink-0 text-primary">${(0, icons_1.icon)(it.icon, "h-5 w-5")}</span><div><p class="text-sm font-semibold" ${ctx.e(`items.${i}.label`)}>${(0, util_1.esc)(it.label)}</p><p class="text-sm text-muted">${body}</p></div></li>`;
            })
                .join("")}</ul>`;
        },
    }),
    (0, fields_1.defineComponent)({
        type: "form",
        label: "Form",
        category: "forms",
        level: "block",
        accepts: "blocks",
        description: "Custom form container. Put input, textarea, select, checkbox blocks and a submit button inside.",
        aiHint: 'Use the "contact-form" section instead unless a custom field set is needed.',
        props: {
            name: fields_1.f.text("Form name", "custom", NAME),
            gap: fields_1.f.select("Gap", ["sm", "md", "lg"], "md"),
        },
        render: (p, ctx) => `<form method="post" action="${(0, util_1.esc)(ctx.formAction)}" class="${(0, util_1.cx)("flex flex-col", (0, util_1.pick)({ sm: "gap-3", md: "gap-4", lg: "gap-6" }, p.gap))}"><input type="hidden" name="_form" value="${(0, util_1.esc)(p.name)}">${ctx.children}</form>`,
    }),
    (0, fields_1.defineComponent)({
        type: "input",
        label: "Input field",
        category: "forms",
        level: "block",
        description: "Single-line input with label (use inside a form).",
        props: {
            label: fields_1.f.text("Label", "Your email", { max: 60 }),
            name: fields_1.f.text("Field name", "email", NAME),
            type: fields_1.f.select("Type", ["text", "email", "tel", "number", "url", "password", "date"], "text"),
            placeholder: fields_1.f.text("Placeholder", "", { max: 60, optional: true }),
            required: fields_1.f.bool("Required", false),
        },
        render: (p, ctx) => `<label class="flex flex-col gap-1.5 text-sm">${label(ctx, "label", p.label, !!p.required)}<input type="${(0, util_1.esc)(p.type)}" name="${(0, util_1.esc)(p.name)}" placeholder="${(0, util_1.esc)(p.placeholder)}"${p.required ? " required" : ""} class="${_shared_1.INPUT_CLS}"></label>`,
    }),
    (0, fields_1.defineComponent)({
        type: "textarea",
        label: "Text area",
        category: "forms",
        level: "block",
        description: "Multi-line input with label (use inside a form).",
        props: {
            label: fields_1.f.text("Label", "Message", { max: 60 }),
            name: fields_1.f.text("Field name", "message", NAME),
            placeholder: fields_1.f.text("Placeholder", "", { max: 60, optional: true }),
            rows: fields_1.f.num("Rows", 4, 2, 12),
            required: fields_1.f.bool("Required", false),
        },
        render: (p, ctx) => `<label class="flex flex-col gap-1.5 text-sm">${label(ctx, "label", p.label, !!p.required)}<textarea name="${(0, util_1.esc)(p.name)}" rows="${Number(p.rows) || 4}" placeholder="${(0, util_1.esc)(p.placeholder)}"${p.required ? " required" : ""} class="${_shared_1.INPUT_CLS}"></textarea></label>`,
    }),
    (0, fields_1.defineComponent)({
        type: "select",
        label: "Select field",
        category: "forms",
        level: "block",
        description: "Dropdown with label (use inside a form).",
        props: {
            label: fields_1.f.text("Label", "Choose an option", { max: 60 }),
            name: fields_1.f.text("Field name", "option", NAME),
            options: fields_1.f.strs("Options", ["Option A", "Option B", "Option C"], { max: 20, maxItem: 60 }),
            required: fields_1.f.bool("Required", false),
        },
        render: (p, ctx) => `<label class="flex flex-col gap-1.5 text-sm">${label(ctx, "label", p.label, !!p.required)}<select name="${(0, util_1.esc)(p.name)}"${p.required ? " required" : ""} class="${_shared_1.INPUT_CLS}">${(0, util_1.arr)(p.options)
            .map((o) => `<option value="${(0, util_1.esc)(o)}">${(0, util_1.esc)(o)}</option>`)
            .join("")}</select></label>`,
    }),
    (0, fields_1.defineComponent)({
        type: "checkbox",
        label: "Checkbox",
        category: "forms",
        level: "block",
        description: "Checkbox with label (use inside a form).",
        props: {
            label: fields_1.f.text("Label", "I agree to the terms and conditions", { max: 140 }),
            name: fields_1.f.text("Field name", "agree", NAME),
            required: fields_1.f.bool("Required", false),
        },
        render: (p, ctx) => `<label class="flex items-start gap-3 text-sm"><input type="checkbox" name="${(0, util_1.esc)(p.name)}" value="yes"${p.required ? " required" : ""} class="mt-0.5 h-4 w-4 rounded border-line text-primary focus:ring-primary"><span ${ctx.e("label")}>${(0, util_1.esc)(p.label)}</span></label>`,
    }),
];
void _shared_1.muted;
