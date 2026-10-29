import { defineComponent, f } from "../fields";
import { icon } from "../icons";
import { arr, cx, esc, imgSrc, pick } from "../util";
import { btn, header, headerProps, iconBox, isDark, muted, section, sectionProps, bgClass, INPUT_CLS } from "./_shared";

const FEATURE_COLS: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};
const PLAN_COLS: Record<number, string> = { 1: "max-w-md mx-auto", 2: "md:grid-cols-2 max-w-4xl mx-auto", 3: "lg:grid-cols-3", 4: "md:grid-cols-2 lg:grid-cols-4" };
const TEAM_COLS: Record<string, string> = { "2": "sm:grid-cols-2", "3": "sm:grid-cols-2 lg:grid-cols-3", "4": "sm:grid-cols-2 lg:grid-cols-4" };
const TESTI_COLS: Record<string, string> = { "1": "", "2": "md:grid-cols-2", "3": "md:grid-cols-2 lg:grid-cols-3" };
const LOGO_COLS: Record<string, string> = { "3": "grid-cols-2 md:grid-cols-3", "4": "grid-cols-2 md:grid-cols-4", "6": "grid-cols-2 md:grid-cols-3 lg:grid-cols-6" };

const sampleFeatures = [
  { icon: "zap", title: "Lightning fast", text: "Pages load instantly so visitors never wait." },
  { icon: "shield", title: "Secure by default", text: "Your data is encrypted and protected end to end." },
  { icon: "layers", title: "Flexible and modular", text: "Mix and match building blocks to fit your needs." },
  { icon: "users", title: "Built for teams", text: "Collaborate with your whole team in real time." },
  { icon: "bar-chart", title: "Clear insights", text: "Understand what works with simple analytics." },
  { icon: "heart", title: "Loved by customers", text: "Thousands of happy customers trust us daily." },
];

export const marketingComponents = [
  defineComponent({
    type: "features",
    label: "Features",
    category: "marketing",
    level: "section",
    description: "Grid of features/services/benefits, each with icon, title and text.",
    aiHint: 'Variants: "grid" (icon on top), "cards" (boxed), "list" (icon left, two columns), "centered" (centered text). 3-6 items.',
    props: {
      variant: f.select("Variant", ["grid", "cards", "list", "centered"], "grid"),
      ...sectionProps(),
      ...headerProps({ eyebrow: "Features", heading: "Everything you need to succeed", sub: "A short intro that frames the benefits below." }),
      columns: f.select("Columns", Object.keys(FEATURE_COLS), "3"),
      items: f.list(
        "Items",
        { icon: f.icon("Icon", "zap"), title: f.text("Title", "Feature", { max: 60 }), text: f.area("Text", "Short description.", { max: 200 }) },
        sampleFeatures,
        { min: 1, max: 12 },
      ),
    },
    render: (p, ctx) => {
      const dark = isDark(p);
      const items = arr<any>(p.items)
        .map((it, i) => {
          const title = `<h3 class="text-lg font-semibold" ${ctx.e(`items.${i}.title`)}>${esc(it.title)}</h3>`;
          const text = `<p class="${cx("mt-2", muted(dark))}" ${ctx.e(`items.${i}.text`)}>${esc(it.text)}</p>`;
          if (p.variant === "list")
            return `<div class="flex gap-4">${iconBox(it.icon, dark)}<div>${title}${text}</div></div>`;
          if (p.variant === "cards")
            return `<div class="rounded-theme border border-line bg-surface p-6 text-fg shadow-sm"><div class="mb-4">${iconBox(it.icon, false)}</div>${title}<p class="mt-2 text-muted" ${ctx.e(`items.${i}.text`)}>${esc(it.text)}</p></div>`;
          if (p.variant === "centered")
            return `<div class="text-center"><div class="mb-4 flex justify-center">${iconBox(it.icon, dark)}</div>${title}${text}</div>`;
          return `<div><div class="mb-4">${iconBox(it.icon, dark)}</div>${title}${text}</div>`;
        })
        .join("");
      const cols = p.variant === "list" ? "md:grid-cols-2" : pick(FEATURE_COLS, p.columns);
      return section(p, `${header(p, ctx, dark)}<div class="${cx("grid grid-cols-1 gap-8", cols)}">${items}</div>`);
    },
  }),

  defineComponent({
    type: "feature-split",
    label: "Feature split",
    category: "marketing",
    level: "section",
    description: "Image beside text with optional bullet points and a button. Great for about/story/product highlight sections.",
    aiHint: "Alternate `reverse` on consecutive feature-split sections for rhythm.",
    props: {
      ...sectionProps(),
      reverse: f.bool("Image on left", false),
      eyebrow: f.text("Eyebrow", "Why us", { max: 60, optional: true }),
      heading: f.text("Heading", "A better way to get things done", { max: 120 }),
      text: f.area("Text", "Explain the value of this feature in two or three sentences. Keep it concrete and benefit-focused.", { max: 600 }),
      bullets: f.strs("Bullet points", ["Easy to set up", "Works with your tools", "Support when you need it"], { max: 6, maxItem: 100, ai: "optional, 3-4 short points" }),
      ctaLabel: f.text("Button label", "Learn more", { max: 30, optional: true }),
      ctaHref: f.url("Button link", "#", { optional: true }),
      image: f.image("Image", "placeholder:Feature image"),
      imageAlt: f.text("Image alt text", "Feature image", { max: 120, optional: true }),
    },
    render: (p, ctx) => {
      const dark = isDark(p);
      const bullets = arr<string>(p.bullets);
      const text =
        (p.eyebrow ? `<p class="${cx("mb-3 text-sm font-semibold uppercase tracking-wider", dark ? "opacity-80" : "text-primary")}" ${ctx.e("eyebrow")}>${esc(p.eyebrow)}</p>` : "") +
        `<h2 class="font-heading text-3xl font-bold tracking-tight sm:text-4xl" ${ctx.e("heading")}>${esc(p.heading)}</h2>` +
        `<p class="${cx("mt-4 text-lg leading-relaxed", muted(dark))}" ${ctx.e("text")}>${esc(p.text)}</p>` +
        (bullets.length
          ? `<ul class="mt-6 space-y-3">${bullets.map((b, i) => `<li class="flex items-start gap-3"><span class="mt-0.5 shrink-0">${icon("check-circle", "h-5 w-5")}</span><span ${ctx.e(`bullets.${i}`)}>${esc(b)}</span></li>`).join("")}</ul>`
          : "") +
        (p.ctaLabel ? `<div class="mt-8">${btn(ctx, p.ctaLabel, p.ctaHref, "primary", dark, "ctaLabel", "md")}</div>` : "");
      const img = `<img src="${esc(imgSrc(p.image, 1000, 750))}" alt="${esc(p.imageAlt)}" loading="lazy" class="w-full rounded-theme object-cover shadow-xl">`;
      return section(
        p,
        `<div class="grid items-center gap-12 md:grid-cols-2 lg:gap-16"><div class="${cx(p.reverse && "md:order-2")}">${text}</div><div>${img}</div></div>`,
      );
    },
  }),

  defineComponent({
    type: "pricing",
    label: "Pricing",
    category: "marketing",
    level: "section",
    description: "Pricing plans side by side (1-4). Mark one plan as highlighted.",
    props: {
      ...sectionProps("surface"),
      ...headerProps({ eyebrow: "Pricing", heading: "Simple, transparent pricing", sub: "Choose the plan that fits. Upgrade or cancel anytime." }),
      plans: f.list(
        "Plans",
        {
          name: f.text("Name", "Starter", { max: 30 }),
          price: f.text("Price", "$19", { max: 20, ai: 'include currency, e.g. "$19" or "€0"' }),
          period: f.text("Period", "/month", { max: 20, optional: true }),
          description: f.text("Description", "For individuals getting started.", { max: 100, optional: true }),
          features: f.strs("Features", ["Feature one", "Feature two"], { max: 10, maxItem: 80 }),
          ctaLabel: f.text("Button label", "Choose plan", { max: 30 }),
          ctaHref: f.url("Button link", "#contact"),
          highlighted: f.bool("Highlighted", false),
          badge: f.text("Badge", "", { max: 20, optional: true, ai: 'e.g. "Most popular" (highlighted plan only)' }),
        },
        [
          { name: "Starter", price: "$0", period: "/month", description: "For trying things out.", features: ["1 project", "Basic analytics", "Community support"], ctaLabel: "Start free", ctaHref: "#contact", highlighted: false, badge: "" },
          { name: "Pro", price: "$29", period: "/month", description: "For growing teams.", features: ["Unlimited projects", "Advanced analytics", "Priority support", "Custom domain"], ctaLabel: "Get Pro", ctaHref: "#contact", highlighted: true, badge: "Most popular" },
          { name: "Business", price: "$99", period: "/month", description: "For larger organisations.", features: ["Everything in Pro", "SSO and audit logs", "Dedicated manager"], ctaLabel: "Contact sales", ctaHref: "#contact", highlighted: false, badge: "" },
        ],
        { min: 1, max: 4 },
      ),
    },
    render: (p, ctx) => {
      const plans = arr<any>(p.plans);
      const cards = plans
        .map((pl, i) => {
          const hl = !!pl.highlighted;
          return (
            `<div class="${cx("relative flex flex-col rounded-theme border p-8 text-fg", hl ? "border-primary bg-bg shadow-xl ring-2 ring-primary" : "border-line bg-bg shadow-sm")}">` +
            (pl.badge ? `<span class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-fg" ${ctx.e(`plans.${i}.badge`)}>${esc(pl.badge)}</span>` : "") +
            `<h3 class="text-lg font-semibold" ${ctx.e(`plans.${i}.name`)}>${esc(pl.name)}</h3>` +
            (pl.description ? `<p class="mt-1 text-sm text-muted" ${ctx.e(`plans.${i}.description`)}>${esc(pl.description)}</p>` : "") +
            `<p class="mt-6 flex items-baseline gap-1"><span class="font-heading text-4xl font-bold" ${ctx.e(`plans.${i}.price`)}>${esc(pl.price)}</span>${pl.period ? `<span class="text-sm text-muted" ${ctx.e(`plans.${i}.period`)}>${esc(pl.period)}</span>` : ""}</p>` +
            `<ul class="mt-6 flex-1 space-y-3 text-sm">${arr<string>(pl.features).map((ft, j) => `<li class="flex items-start gap-3"><span class="mt-0.5 shrink-0 text-primary">${icon("check", "h-4 w-4")}</span><span ${ctx.e(`plans.${i}.features.${j}`)}>${esc(ft)}</span></li>`).join("")}</ul>` +
            `<div class="mt-8">${btn(ctx, pl.ctaLabel, pl.ctaHref, hl ? "primary" : "outline", false, `plans.${i}.ctaLabel`, "md", { full: true })}</div></div>`
          );
        })
        .join("");
      const cols = pick(PLAN_COLS, Math.max(1, Math.min(4, plans.length)));
      return section(p, `${header(p, ctx, isDark(p))}<div class="${cx("grid grid-cols-1 items-stretch gap-8", cols)}">${cards}</div>`);
    },
  }),

  defineComponent({
    type: "testimonials",
    label: "Testimonials",
    category: "marketing",
    level: "section",
    description: "Customer quotes. Variants: cards grid, single big quote, minimal.",
    props: {
      variant: f.select("Variant", ["cards", "single", "minimal"], "cards"),
      ...sectionProps(),
      ...headerProps({ eyebrow: "Testimonials", heading: "Loved by customers", sub: "" }),
      columns: f.select("Columns", Object.keys(TESTI_COLS), "3"),
      items: f.list(
        "Testimonials",
        {
          quote: f.area("Quote", "This changed how we work. Highly recommended.", { max: 300 }),
          name: f.text("Name", "Jane Doe", { max: 50 }),
          role: f.text("Role", "CEO, Company", { max: 60, optional: true }),
          avatar: f.image("Avatar", "", { optional: true }),
        },
        [
          { quote: "We launched in a week instead of a month. The results speak for themselves.", name: "Sara Lindqvist", role: "Founder, Northwind", avatar: "" },
          { quote: "Simple, fast and genuinely delightful to use. Our whole team adopted it right away.", name: "Mikko Aalto", role: "Product lead, Lumo", avatar: "" },
          { quote: "Support has been outstanding. Every question answered within the hour.", name: "Emma Clarke", role: "Owner, Bloom Studio", avatar: "" },
        ],
        { min: 1, max: 9 },
      ),
    },
    render: (p, ctx) => {
      const dark = isDark(p);
      const items = arr<any>(p.items);
      const avatar = (it: any) =>
        it.avatar
          ? `<img src="${esc(imgSrc(it.avatar, 96, 96))}" alt="" class="h-10 w-10 rounded-full object-cover">`
          : `<span class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">${esc(String(it.name || "?").trim().charAt(0).toUpperCase())}</span>`;
      const who = (it: any, i: number) =>
        `<div class="flex items-center gap-3">${avatar(it)}<div class="text-left"><p class="text-sm font-semibold" ${ctx.e(`items.${i}.name`)}>${esc(it.name)}</p>${it.role ? `<p class="${cx("text-sm", muted(dark))}" ${ctx.e(`items.${i}.role`)}>${esc(it.role)}</p>` : ""}</div></div>`;
      if (p.variant === "single") {
        const it = items[0] || {};
        return section(
          p,
          `<div class="mx-auto max-w-3xl text-center">${header({ ...p, align: "center" }, ctx, dark)}<blockquote class="font-heading text-2xl font-medium leading-snug sm:text-3xl" ${ctx.e("items.0.quote")}>“${esc(it.quote)}”</blockquote><div class="mt-8 flex justify-center">${who(it, 0)}</div></div>`,
        );
      }
      const cards = items
        .map((it, i) =>
          p.variant === "minimal"
            ? `<figure><blockquote class="leading-relaxed" ${ctx.e(`items.${i}.quote`)}>“${esc(it.quote)}”</blockquote><figcaption class="mt-4">${who(it, i)}</figcaption></figure>`
            : `<figure class="flex flex-col justify-between rounded-theme border border-line bg-surface p-6 text-fg shadow-sm"><blockquote class="leading-relaxed" ${ctx.e(`items.${i}.quote`)}>“${esc(it.quote)}”</blockquote><figcaption class="mt-6">${who(it, i)}</figcaption></figure>`,
        )
        .join("");
      return section(p, `${header(p, ctx, dark)}<div class="${cx("grid grid-cols-1 gap-6", pick(TESTI_COLS, p.columns))}">${cards}</div>`);
    },
  }),

  defineComponent({
    type: "faq",
    label: "FAQ",
    category: "marketing",
    level: "section",
    description: "Frequently asked questions as an accordion (no JavaScript).",
    props: {
      ...sectionProps(),
      ...headerProps({ eyebrow: "FAQ", heading: "Frequently asked questions", sub: "" }),
      items: f.list(
        "Questions",
        { question: f.text("Question", "Question?", { max: 140 }), answer: f.area("Answer", "Answer.", { max: 600 }) },
        [
          { question: "How do I get started?", answer: "Sign up, pick a template and start customizing. It takes only a few minutes." },
          { question: "Can I cancel anytime?", answer: "Yes. There are no long-term contracts and you can cancel whenever you like." },
          { question: "Do you offer support?", answer: "Our team is available by email and chat on every plan." },
        ],
        { min: 1, max: 12 },
      ),
    },
    render: (p, ctx) => {
      const dark = isDark(p);
      const open = ctx.mode === "edit" ? " open" : "";
      const items = arr<any>(p.items)
        .map(
          (it, i) =>
            `<details${open} class="${cx("group py-4", dark ? "border-white/20" : "border-line", "border-b")}"><summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold"><span ${ctx.e(`items.${i}.question`)}>${esc(it.question)}</span><span class="shrink-0 transition group-open:rotate-180">${icon("chevron-down", "h-5 w-5")}</span></summary><p class="${cx("mt-3 leading-relaxed", muted(dark))}" ${ctx.e(`items.${i}.answer`)}>${esc(it.answer)}</p></details>`,
        )
        .join("");
      return section(p, `${header(p, ctx, dark)}<div class="mx-auto max-w-3xl border-t ${dark ? "border-white/20" : "border-line"}">${items}</div>`, { width: "max-w-6xl" });
    },
  }),

  defineComponent({
    type: "cta",
    label: "Call to action",
    category: "marketing",
    level: "section",
    description: "Conversion section with heading, text and up to two buttons.",
    aiHint: 'Use near the bottom of the page. Variants: "banner" (centered), "split" (text left, buttons right), "card" (rounded panel).',
    props: {
      variant: f.select("Variant", ["banner", "split", "card"], "banner"),
      ...sectionProps("primary", "lg"),
      heading: f.text("Heading", "Ready to get started?", { max: 100 }),
      text: f.area("Text", "Join thousands of happy customers today. No commitment required.", { max: 260, optional: true }),
      primaryLabel: f.text("Primary button", "Get started", { max: 30, optional: true }),
      primaryHref: f.url("Primary link", "#contact", { optional: true }),
      secondaryLabel: f.text("Secondary button", "Talk to us", { max: 30, optional: true }),
      secondaryHref: f.url("Secondary link", "#contact", { optional: true }),
    },
    render: (p, ctx) => {
      // The "card" variant paints its own primary panel on light backgrounds, so its content is "inverse".
      const panel = p.variant === "card" && (p.bg === "default" || p.bg === "surface");
      const dark = isDark(p) || panel;
      const title = `<h2 class="font-heading text-3xl font-bold tracking-tight sm:text-4xl" ${ctx.e("heading")}>${esc(p.heading)}</h2>`;
      const text = p.text ? `<p class="${cx("mt-4 text-lg", muted(dark))}" ${ctx.e("text")}>${esc(p.text)}</p>` : "";
      const buttons = `${btn(ctx, p.primaryLabel, p.primaryHref, "primary", dark, "primaryLabel", "lg")}${btn(ctx, p.secondaryLabel, p.secondaryHref, "secondary", dark, "secondaryLabel", "lg")}`;
      if (p.variant === "split")
        return section(p, `<div class="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center"><div class="max-w-2xl">${title}${text}</div><div class="flex flex-wrap gap-3">${buttons}</div></div>`);
      if (p.variant === "card") {
        const id = p.anchor ? ` id="${esc(p.anchor)}"` : "";
        return `<section${id} class="${cx("py-16 md:py-24", p.bg === "default" || p.bg === "surface" ? bgClass(p.bg) : "bg-bg text-fg")}"><div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"><div class="${cx("rounded-3xl px-8 py-14 text-center", p.bg === "default" || p.bg === "surface" ? "bg-primary text-primary-fg" : bgClass(p.bg))}">${title}${text}<div class="mt-8 flex flex-wrap justify-center gap-3">${buttons}</div></div></div></section>`;
      }
      return section(p, `<div class="mx-auto max-w-3xl text-center">${title}${text}<div class="mt-8 flex flex-wrap justify-center gap-3">${buttons}</div></div>`);
    },
  }),

  defineComponent({
    type: "logos",
    label: "Logo cloud",
    category: "marketing",
    level: "section",
    description: "Row of customer/partner names or logos (\"trusted by\").",
    aiHint: "Without real logo images, provide names only; they render as styled wordmarks.",
    props: {
      ...sectionProps("default", "md"),
      heading: f.text("Heading", "Trusted by teams at", { max: 80, optional: true }),
      columns: f.select("Columns", Object.keys(LOGO_COLS), "6"),
      items: f.list(
        "Logos",
        { name: f.text("Name", "Company", { max: 40 }), image: f.image("Logo image", "", { optional: true }) },
        [{ name: "Northwind", image: "" }, { name: "Lumo", image: "" }, { name: "Bloom", image: "" }, { name: "Vertex", image: "" }, { name: "Helio", image: "" }, { name: "Orbit", image: "" }],
        { min: 1, max: 12 },
      ),
    },
    render: (p, ctx) => {
      const items = arr<any>(p.items)
        .map((it, i) =>
          it.image
            ? `<div class="flex items-center justify-center"><img src="${esc(imgSrc(it.image, 200, 80))}" alt="${esc(it.name)}" class="h-8 w-auto opacity-70 grayscale"></div>`
            : `<div class="flex items-center justify-center font-heading text-xl font-bold opacity-50" ${ctx.e(`items.${i}.name`)}>${esc(it.name)}</div>`,
        )
        .join("");
      return section(
        p,
        (p.heading ? `<p class="mb-8 text-center text-sm font-medium ${muted(isDark(p))}" ${ctx.e("heading")}>${esc(p.heading)}</p>` : "") +
          `<div class="${cx("grid items-center gap-8", pick(LOGO_COLS, p.columns))}">${items}</div>`,
      );
    },
  }),

  defineComponent({
    type: "steps",
    label: "Steps",
    category: "marketing",
    level: "section",
    description: "Numbered process / how-it-works steps.",
    props: {
      variant: f.select("Variant", ["horizontal", "vertical"], "horizontal"),
      ...sectionProps(),
      ...headerProps({ eyebrow: "How it works", heading: "Get going in three simple steps", sub: "" }),
      items: f.list(
        "Steps",
        { title: f.text("Title", "Step", { max: 60 }), text: f.area("Text", "Describe this step.", { max: 200 }) },
        [
          { title: "Sign up", text: "Create your free account in under a minute." },
          { title: "Customize", text: "Pick components and make them your own." },
          { title: "Launch", text: "Publish to your domain with a single click." },
        ],
        { min: 2, max: 6 },
      ),
    },
    render: (p, ctx) => {
      const dark = isDark(p);
      const num = (i: number) => `<span class="${cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold", dark ? "bg-white/20" : "bg-primary text-primary-fg")}">${i + 1}</span>`;
      const items = arr<any>(p.items).map((it, i) =>
        p.variant === "vertical"
          ? `<li class="flex gap-4">${num(i)}<div><h3 class="text-lg font-semibold" ${ctx.e(`items.${i}.title`)}>${esc(it.title)}</h3><p class="${cx("mt-1", muted(dark))}" ${ctx.e(`items.${i}.text`)}>${esc(it.text)}</p></div></li>`
          : `<li><div class="mb-4">${num(i)}</div><h3 class="text-lg font-semibold" ${ctx.e(`items.${i}.title`)}>${esc(it.title)}</h3><p class="${cx("mt-2", muted(dark))}" ${ctx.e(`items.${i}.text`)}>${esc(it.text)}</p></li>`,
      );
      const list =
        p.variant === "vertical"
          ? `<ol class="mx-auto max-w-2xl space-y-8">${items.join("")}</ol>`
          : `<ol class="${cx("grid grid-cols-1 gap-8", items.length >= 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3")}">${items.join("")}</ol>`;
      return section(p, `${header(p, ctx, dark)}${list}`);
    },
  }),

  defineComponent({
    type: "team",
    label: "Team",
    category: "marketing",
    level: "section",
    description: "Team members with photo, name, role and short bio.",
    props: {
      ...sectionProps(),
      ...headerProps({ eyebrow: "Our team", heading: "Meet the people behind the product", sub: "" }),
      columns: f.select("Columns", Object.keys(TEAM_COLS), "3"),
      members: f.list(
        "Members",
        {
          name: f.text("Name", "Alex Morgan", { max: 50 }),
          role: f.text("Role", "Founder", { max: 50 }),
          bio: f.area("Bio", "", { max: 200, optional: true }),
          image: f.image("Photo", "placeholder:Team member", { optional: true }),
        },
        [
          { name: "Alex Morgan", role: "Founder & CEO", bio: "Ten years building products people love.", image: "placeholder:Alex" },
          { name: "Priya Nair", role: "Head of Design", bio: "Obsessed with details and delightful interactions.", image: "placeholder:Priya" },
          { name: "Jonas Weber", role: "Lead Engineer", bio: "Turns complex problems into simple systems.", image: "placeholder:Jonas" },
        ],
        { min: 1, max: 12 },
      ),
    },
    render: (p, ctx) => {
      const dark = isDark(p);
      const members = arr<any>(p.members)
        .map(
          (m, i) =>
            `<div class="text-center">${m.image ? `<img src="${esc(imgSrc(m.image, 400, 400))}" alt="${esc(m.name)}" loading="lazy" class="mx-auto mb-4 h-40 w-40 rounded-full object-cover">` : ""}<h3 class="text-lg font-semibold" ${ctx.e(`members.${i}.name`)}>${esc(m.name)}</h3><p class="${cx("text-sm", dark ? "opacity-80" : "text-primary")}" ${ctx.e(`members.${i}.role`)}>${esc(m.role)}</p>${m.bio ? `<p class="${cx("mt-2 text-sm", muted(dark))}" ${ctx.e(`members.${i}.bio`)}>${esc(m.bio)}</p>` : ""}</div>`,
        )
        .join("");
      return section(p, `${header(p, ctx, dark)}<div class="${cx("grid grid-cols-1 gap-10", pick(TEAM_COLS, p.columns))}">${members}</div>`);
    },
  }),

  defineComponent({
    type: "blog-grid",
    label: "Blog / news grid",
    category: "marketing",
    level: "section",
    description: "Cards for blog posts, news or case studies.",
    props: {
      ...sectionProps(),
      ...headerProps({ eyebrow: "Journal", heading: "Latest from the blog", sub: "" }),
      posts: f.list(
        "Posts",
        {
          title: f.text("Title", "Post title", { max: 100 }),
          excerpt: f.area("Excerpt", "A short summary of the post.", { max: 200, optional: true }),
          image: f.image("Image", "placeholder:Post image", { optional: true }),
          date: f.text("Date", "Oct 12, 2026", { max: 30, optional: true }),
          tag: f.text("Tag", "News", { max: 24, optional: true }),
          href: f.url("Link", "#"),
        },
        [
          { title: "Five ways to grow your audience", excerpt: "Practical tactics you can apply this week.", image: "placeholder:Growth", date: "Oct 12, 2026", tag: "Guides", href: "#" },
          { title: "Behind the scenes of our redesign", excerpt: "How we rebuilt everything from the ground up.", image: "placeholder:Redesign", date: "Sep 28, 2026", tag: "Company", href: "#" },
          { title: "Customer story: Bloom Studio", excerpt: "How Bloom doubled bookings in two months.", image: "placeholder:Story", date: "Sep 3, 2026", tag: "Stories", href: "#" },
        ],
        { min: 1, max: 9 },
      ),
    },
    render: (p, ctx) => {
      const dark = isDark(p);
      const cards = arr<any>(p.posts)
        .map(
          (po, i) =>
            `<article class="overflow-hidden rounded-theme border border-line bg-surface text-fg shadow-sm">${po.image ? `<img src="${esc(imgSrc(po.image, 800, 450))}" alt="" loading="lazy" class="aspect-video w-full object-cover">` : ""}<div class="p-6"><div class="mb-3 flex items-center gap-3 text-xs">${po.tag ? `<span class="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary" ${ctx.e(`posts.${i}.tag`)}>${esc(po.tag)}</span>` : ""}${po.date ? `<span class="text-muted" ${ctx.e(`posts.${i}.date`)}>${esc(po.date)}</span>` : ""}</div><h3 class="text-lg font-semibold"><a href="${esc(ctx.href(po.href))}" ${ctx.e(`posts.${i}.title`)}>${esc(po.title)}</a></h3>${po.excerpt ? `<p class="mt-2 text-sm text-muted" ${ctx.e(`posts.${i}.excerpt`)}>${esc(po.excerpt)}</p>` : ""}</div></article>`,
        )
        .join("");
      return section(p, `${header(p, ctx, dark)}<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">${cards}</div>`);
    },
  }),

  defineComponent({
    type: "newsletter",
    label: "Newsletter signup",
    category: "marketing",
    level: "section",
    description: "Email capture with heading and subscribe button.",
    props: {
      variant: f.select("Variant", ["inline", "card"], "inline"),
      ...sectionProps("surface", "lg"),
      heading: f.text("Heading", "Stay in the loop", { max: 100 }),
      text: f.area("Text", "Get product news and helpful tips delivered to your inbox. No spam.", { max: 200, optional: true }),
      placeholder: f.text("Input placeholder", "you@example.com", { max: 40 }),
      buttonLabel: f.text("Button label", "Subscribe", { max: 24 }),
    },
    render: (p, ctx) => {
      const dark = isDark(p);
      const form = `<form method="post" action="${esc(ctx.formAction)}" class="mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row"><input type="hidden" name="_form" value="newsletter"><input type="email" name="email" required placeholder="${esc(p.placeholder)}" aria-label="Email" class="${INPUT_CLS}">${btn(ctx, p.buttonLabel, "#", "primary", dark, "buttonLabel", "md", { submit: true })}</form>`;
      const head = `<h2 class="font-heading text-3xl font-bold tracking-tight" ${ctx.e("heading")}>${esc(p.heading)}</h2>${p.text ? `<p class="${cx("mt-3 text-lg", muted(dark))}" ${ctx.e("text")}>${esc(p.text)}</p>` : ""}`;
      if (p.variant === "card")
        return section(p, `<div class="mx-auto max-w-2xl rounded-3xl border border-line bg-bg p-10 text-center text-fg shadow-sm"><div class="flex flex-col items-center">${head.replace("text-muted", "text-muted")}${form}</div></div>`);
      return section(p, `<div class="flex flex-col items-center text-center">${head}${form}</div>`);
    },
  }),
];
