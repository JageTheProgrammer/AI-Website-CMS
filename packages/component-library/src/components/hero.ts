import { defineComponent, f } from "../fields";
import { cx, esc, imgSrc, pick } from "../util";
import { btn, bgClass, header, isDark, muted, section, sectionProps } from "./_shared";

const SIZE: Record<string, string> = {
  md: "py-16 md:py-24",
  lg: "py-20 md:py-32",
  xl: "py-28 md:py-44",
};

export const heroComponents = [
  defineComponent({
    type: "hero",
    label: "Hero",
    category: "hero",
    level: "section",
    description: "Large intro section: headline, subtext, up to two buttons and an optional image.",
    aiHint:
      'Use once at the top (after the navbar). Variants: "centered", "split" (text left, image right), "split-reverse", "image-bg" (full photo background with overlay), "minimal".',
    props: {
      variant: f.select("Variant", ["centered", "split", "split-reverse", "image-bg", "minimal"], "centered"),
      ...sectionProps("default", "lg"),
      size: f.select("Height", Object.keys(SIZE), "lg"),
      eyebrow: f.text("Eyebrow", "Now in beta", { max: 60, optional: true }),
      heading: f.text("Heading", "Build something people love", { max: 100 }),
      subheading: f.area("Subheading", "A short, clear sentence that explains what you do and why it matters.", { max: 260, optional: true }),
      primaryLabel: f.text("Primary button", "Get started", { max: 30, optional: true }),
      primaryHref: f.url("Primary link", "#contact", { optional: true }),
      secondaryLabel: f.text("Secondary button", "Learn more", { max: 30, optional: true }),
      secondaryHref: f.url("Secondary link", "#features", { optional: true }),
      note: f.text("Note under buttons", "", { max: 80, optional: true, ai: 'e.g. "No credit card required"' }),
      image: f.image("Image", "placeholder:Hero image", { optional: true }),
      imageAlt: f.text("Image alt text", "Hero image", { max: 120, optional: true }),
    },
    resize: { height: true, heightMode: "min" },
    render: (p, ctx) => {
      const bgImage = p.variant === "image-bg";
      const dark = bgImage || isDark(p);
      const centered = p.variant === "centered" || bgImage;
      const split = p.variant === "split" || p.variant === "split-reverse";
      const eyebrow = p.eyebrow
        ? `<p class="${cx(
            "mb-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
            dark ? "bg-white/15" : "bg-primary/10 text-primary",
          )}" ${ctx.e("eyebrow")}>${esc(p.eyebrow)}</p>`
        : "";
      const text =
        eyebrow +
        `<h1 class="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" ${ctx.e("heading")}>${esc(p.heading)}</h1>` +
        (p.subheading ? `<p class="${cx("mt-6 text-lg leading-relaxed sm:text-xl", muted(dark))}" ${ctx.e("subheading")}>${esc(p.subheading)}</p>` : "") +
        (p.primaryLabel || p.secondaryLabel
          ? `<div class="${cx("mt-8 flex flex-wrap gap-3", centered && "justify-center")}">${btn(ctx, p.primaryLabel, p.primaryHref, "primary", dark, "primaryLabel", "lg")}${btn(ctx, p.secondaryLabel, p.secondaryHref, "secondary", dark, "secondaryLabel", "lg")}</div>`
          : "") +
        (p.note ? `<p class="${cx("mt-4 text-sm", muted(dark))}" ${ctx.e("note")}>${esc(p.note)}</p>` : "");
      const img = p.image
        ? `<img src="${esc(imgSrc(p.image, 1200, 800))}" alt="${esc(p.imageAlt)}" class="w-full rounded-theme border border-line object-cover shadow-2xl">`
        : "";

      if (bgImage) {
        return (
          `<section${p.anchor ? ` id="${esc(p.anchor)}"` : ""} class="${cx("relative isolate overflow-hidden bg-slate-900 text-white", pick(SIZE, p.size))}">` +
          (p.image ? `<img src="${esc(imgSrc(p.image, 1600, 900))}" alt="" class="absolute inset-0 -z-10 h-full w-full object-cover">` : "") +
          `<div class="absolute inset-0 -z-10 bg-black/55"></div>` +
          `<div class="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">${text}</div></section>`
        );
      }
      if (split) {
        const cols =
          `<div class="grid items-center gap-12 md:grid-cols-2">` +
          `<div class="${cx(p.variant === "split-reverse" && p.image && "md:order-2")}">${text}</div>` +
          (img ? `<div>${img}</div>` : "") +
          `</div>`;
        return section(p, cols, { cls: pick(SIZE, p.size) });
      }
      if (p.variant === "minimal") {
        return section(p, `<div class="max-w-3xl">${text}</div>`, { cls: pick(SIZE, p.size) });
      }
      return section(p, `<div class="mx-auto max-w-3xl text-center">${text}</div>${img ? `<div class="mx-auto mt-14 max-w-5xl">${img}</div>` : ""}`, {
        cls: pick(SIZE, p.size),
      });
    },
  }),

  defineComponent({
    type: "page-header",
    label: "Page header",
    category: "hero",
    level: "section",
    description: "Compact title banner for inner pages (About, Services, Contact...).",
    aiHint: "Use instead of hero on secondary pages.",
    props: {
      ...sectionProps("surface", "md"),
      eyebrow: f.text("Eyebrow", "", { max: 60, optional: true }),
      heading: f.text("Title", "About us", { max: 100 }),
      subheading: f.area("Subtitle", "Learn more about who we are and what drives us.", { max: 260, optional: true }),
      align: f.select("Alignment", ["left", "center"], "left"),
    },
    render: (p, ctx) => {
      const dark = isDark(p);
      return section(
        p,
        `<div class="${cx("max-w-3xl", p.align === "center" && "mx-auto text-center")}">` +
          (p.eyebrow ? `<p class="${cx("mb-3 text-sm font-semibold uppercase tracking-wider", dark ? "opacity-80" : "text-primary")}" ${ctx.e("eyebrow")}>${esc(p.eyebrow)}</p>` : "") +
          `<h1 class="font-heading text-4xl font-bold tracking-tight sm:text-5xl" ${ctx.e("heading")}>${esc(p.heading)}</h1>` +
          (p.subheading ? `<p class="${cx("mt-4 text-lg", muted(dark))}" ${ctx.e("subheading")}>${esc(p.subheading)}</p>` : "") +
          `</div>`,
      );
    },
  }),
];

void header;
void bgClass;
