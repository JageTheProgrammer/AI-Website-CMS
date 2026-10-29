import { defineComponent, f } from "../fields";
import { icon } from "../icons";
import { arr, cx, esc, pick } from "../util";
import { INPUT_CLS, btn, header, headerProps, isDark, muted, section, sectionProps } from "./_shared";

const NAME = { max: 40, format: "slug" as const, ai: "lowercase field name, e.g. email" };

const label = (ctx: any, path: string, text: string, required: boolean) =>
  `<span class="font-medium" ${ctx.e(path)}>${esc(text)}${required ? '<span class="text-rose-500"> *</span>' : ""}</span>`;

export const formsComponents = [
  defineComponent({
    type: "contact-form",
    label: "Contact form",
    category: "forms",
    level: "section",
    description: "Ready-made contact section: header, form (name, email, optional phone/subject, message) and optional contact details.",
    aiHint: 'Variants: "simple" (centered form) or "split" (details on the left, form on the right).',
    props: {
      variant: f.select("Variant", ["simple", "split"], "split"),
      ...sectionProps(),
      ...headerProps({ eyebrow: "Contact", heading: "Get in touch", sub: "We usually reply within one business day." }),
      showPhone: f.bool("Phone field", false),
      showSubject: f.bool("Subject field", true),
      submitLabel: f.text("Submit label", "Send message", { max: 30 }),
      email: f.text("Contact email", "hello@example.com", { max: 80, optional: true }),
      phone: f.text("Contact phone", "+1 555 123 4567", { max: 40, optional: true }),
      address: f.text("Address", "123 Main Street, Springfield", { max: 120, optional: true }),
    },
    render: (p, ctx) => {
      const dark = isDark(p);
      const field = (name: string, text: string, type: string, req = true) =>
        `<label class="flex flex-col gap-1.5 text-sm"><span class="font-medium">${esc(text)}${req ? '<span class="text-rose-500"> *</span>' : ""}</span><input type="${type}" name="${name}"${req ? " required" : ""} class="${INPUT_CLS} text-fg"></label>`;
      const form =
        `<form method="post" action="${esc(ctx.formAction)}" class="${cx("flex flex-col gap-4", dark && "rounded-theme bg-bg p-6 text-fg")}"><input type="hidden" name="_form" value="contact">` +
        `<div class="grid gap-4 sm:grid-cols-2">${field("name", "Name", "text")}${field("email", "Email", "email")}</div>` +
        (p.showPhone ? field("phone", "Phone", "tel", false) : "") +
        (p.showSubject ? field("subject", "Subject", "text", false) : "") +
        `<label class="flex flex-col gap-1.5 text-sm"><span class="font-medium">Message<span class="text-rose-500"> *</span></span><textarea name="message" rows="5" required class="${INPUT_CLS} text-fg"></textarea></label>` +
        `<div>${btn(ctx, p.submitLabel, "#", "primary", false, "submitLabel", "md", { submit: true })}</div></form>`;
      const rows = [
        ["mail", p.email],
        ["phone", p.phone],
        ["map-pin", p.address],
      ].filter((r) => r[1]);
      const info = rows
        .map(([ic, v]) => `<li class="flex items-start gap-3"><span class="${cx("mt-0.5 shrink-0", dark ? "" : "text-primary")}">${icon(ic as string, "h-5 w-5")}</span><span>${esc(v)}</span></li>`)
        .join("");
      if (p.variant === "simple")
        return section(p, `${header(p, ctx, dark)}<div class="mx-auto max-w-2xl">${form}</div>`);
      return section(
        p,
        `<div class="grid gap-12 md:grid-cols-2"><div>${header({ ...p, align: "left" }, ctx, dark).replace("mb-12", "mb-8")}<ul class="space-y-4">${info}</ul></div>${form}</div>`,
      );
    },
  }),

  defineComponent({
    type: "contact-info",
    label: "Contact details",
    category: "forms",
    level: "block",
    description: "List of contact details (email, phone, address, hours) with icons.",
    props: {
      variant: f.select("Style", ["list", "cards"], "list"),
      items: f.list(
        "Items",
        {
          icon: f.icon("Icon", "mail"),
          label: f.text("Label", "Email", { max: 30 }),
          value: f.text("Value", "hello@example.com", { max: 100 }),
          href: f.url("Link", "", { optional: true }),
        },
        [
          { icon: "mail", label: "Email", value: "hello@example.com", href: "mailto:hello@example.com" },
          { icon: "phone", label: "Phone", value: "+1 555 123 4567", href: "tel:+15551234567" },
          { icon: "map-pin", label: "Address", value: "123 Main Street, Springfield", href: "" },
          { icon: "clock", label: "Hours", value: "Mon–Fri, 9:00–17:00", href: "" },
        ],
        { min: 1, max: 6 },
      ),
    },
    render: (p, ctx) => {
      const cards = p.variant === "cards";
      return `<ul class="${cx(cards ? "grid gap-4 sm:grid-cols-2" : "space-y-4")}">${arr<any>(p.items)
        .map((it, i) => {
          const val = `<span ${ctx.e(`items.${i}.value`)}>${esc(it.value)}</span>`;
          const body = it.href ? `<a href="${esc(ctx.href(it.href))}" class="hover:underline">${val}</a>` : val;
          return `<li class="${cx("flex items-start gap-3", cards && "rounded-theme border border-line bg-surface p-4 text-fg")}"><span class="mt-0.5 shrink-0 text-primary">${icon(it.icon, "h-5 w-5")}</span><div><p class="text-sm font-semibold" ${ctx.e(`items.${i}.label`)}>${esc(it.label)}</p><p class="text-sm text-muted">${body}</p></div></li>`;
        })
        .join("")}</ul>`;
    },
  }),

  defineComponent({
    type: "form",
    label: "Form",
    category: "forms",
    level: "block",
    accepts: "blocks",
    description: "Custom form container. Put input, textarea, select, checkbox blocks and a submit button inside.",
    aiHint: 'Use the "contact-form" section instead unless a custom field set is needed.',
    props: {
      name: f.text("Form name", "custom", NAME),
      gap: f.select("Gap", ["sm", "md", "lg"], "md"),
    },
    render: (p, ctx) =>
      `<form method="post" action="${esc(ctx.formAction)}" class="${cx("flex flex-col", pick({ sm: "gap-3", md: "gap-4", lg: "gap-6" }, p.gap))}"><input type="hidden" name="_form" value="${esc(p.name)}">${ctx.children}</form>`,
  }),

  defineComponent({
    type: "input",
    label: "Input field",
    category: "forms",
    level: "block",
    description: "Single-line input with label (use inside a form).",
    props: {
      label: f.text("Label", "Your email", { max: 60 }),
      name: f.text("Field name", "email", NAME),
      type: f.select("Type", ["text", "email", "tel", "number", "url", "password", "date"], "text"),
      placeholder: f.text("Placeholder", "", { max: 60, optional: true }),
      required: f.bool("Required", false),
    },
    render: (p, ctx) =>
      `<label class="flex flex-col gap-1.5 text-sm">${label(ctx, "label", p.label, !!p.required)}<input type="${esc(p.type)}" name="${esc(p.name)}" placeholder="${esc(p.placeholder)}"${p.required ? " required" : ""} class="${INPUT_CLS}"></label>`,
  }),

  defineComponent({
    type: "textarea",
    label: "Text area",
    category: "forms",
    level: "block",
    description: "Multi-line input with label (use inside a form).",
    props: {
      label: f.text("Label", "Message", { max: 60 }),
      name: f.text("Field name", "message", NAME),
      placeholder: f.text("Placeholder", "", { max: 60, optional: true }),
      rows: f.num("Rows", 4, 2, 12),
      required: f.bool("Required", false),
    },
    render: (p, ctx) =>
      `<label class="flex flex-col gap-1.5 text-sm">${label(ctx, "label", p.label, !!p.required)}<textarea name="${esc(p.name)}" rows="${Number(p.rows) || 4}" placeholder="${esc(p.placeholder)}"${p.required ? " required" : ""} class="${INPUT_CLS}"></textarea></label>`,
  }),

  defineComponent({
    type: "select",
    label: "Select field",
    category: "forms",
    level: "block",
    description: "Dropdown with label (use inside a form).",
    props: {
      label: f.text("Label", "Choose an option", { max: 60 }),
      name: f.text("Field name", "option", NAME),
      options: f.strs("Options", ["Option A", "Option B", "Option C"], { max: 20, maxItem: 60 }),
      required: f.bool("Required", false),
    },
    render: (p, ctx) =>
      `<label class="flex flex-col gap-1.5 text-sm">${label(ctx, "label", p.label, !!p.required)}<select name="${esc(p.name)}"${p.required ? " required" : ""} class="${INPUT_CLS}">${arr<string>(p.options)
        .map((o) => `<option value="${esc(o)}">${esc(o)}</option>`)
        .join("")}</select></label>`,
  }),

  defineComponent({
    type: "checkbox",
    label: "Checkbox",
    category: "forms",
    level: "block",
    description: "Checkbox with label (use inside a form).",
    props: {
      label: f.text("Label", "I agree to the terms and conditions", { max: 140 }),
      name: f.text("Field name", "agree", NAME),
      required: f.bool("Required", false),
    },
    render: (p, ctx) =>
      `<label class="flex items-start gap-3 text-sm"><input type="checkbox" name="${esc(p.name)}" value="yes"${p.required ? " required" : ""} class="mt-0.5 h-4 w-4 rounded border-line text-primary focus:ring-primary"><span ${ctx.e("label")}>${esc(p.label)}</span></label>`,
  }),
];

void muted;
