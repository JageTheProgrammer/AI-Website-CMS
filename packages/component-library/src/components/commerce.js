"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commerceComponents = void 0;
const fields_1 = require("../fields");
const util_1 = require("../util");
const _shared_1 = require("./_shared");
const P_COLS = {
    "2": "grid-cols-1 sm:grid-cols-2",
    "3": "grid-cols-2 lg:grid-cols-3",
    "4": "grid-cols-2 lg:grid-cols-4",
};
exports.commerceComponents = [
    (0, fields_1.defineComponent)({
        type: "product-grid",
        label: "Product grid",
        category: "commerce",
        level: "section",
        description: "Grid of product cards with image, name, price, rating and optional badge.",
        props: {
            ...(0, _shared_1.sectionProps)(),
            ...(0, _shared_1.headerProps)({ eyebrow: "Shop", heading: "Our bestsellers", sub: "" }),
            columns: fields_1.f.select("Columns", Object.keys(P_COLS), "4"),
            products: fields_1.f.list("Products", {
                name: fields_1.f.text("Name", "Product name", { max: 60 }),
                price: fields_1.f.text("Price", "$49", { max: 20 }),
                comparePrice: fields_1.f.text("Old price", "", { max: 20, optional: true }),
                badge: fields_1.f.text("Badge", "", { max: 20, optional: true, ai: 'e.g. "Sale", "New"' }),
                image: fields_1.f.image("Image", "placeholder:Product"),
                rating: fields_1.f.num("Rating (0-5)", 5, 0, 5, { optional: true }),
                href: fields_1.f.url("Link", "#"),
            }, [
                { name: "Classic tee", price: "$29", comparePrice: "", badge: "New", image: "placeholder:Classic tee", rating: 5, href: "#" },
                { name: "Everyday hoodie", price: "$59", comparePrice: "$79", badge: "Sale", image: "placeholder:Everyday hoodie", rating: 4, href: "#" },
                { name: "Canvas tote", price: "$24", comparePrice: "", badge: "", image: "placeholder:Canvas tote", rating: 5, href: "#" },
                { name: "Wool beanie", price: "$19", comparePrice: "", badge: "", image: "placeholder:Wool beanie", rating: 4, href: "#" },
            ], { min: 1, max: 12 }),
        },
        render: (p, ctx) => {
            const cards = (0, util_1.arr)(p.products)
                .map((pr, i) => `<article class="group text-fg"><a href="${(0, util_1.esc)(ctx.href(pr.href))}" class="relative block overflow-hidden rounded-theme bg-surface"><img src="${(0, util_1.esc)((0, util_1.imgSrc)(pr.image, 600, 600))}" alt="${(0, util_1.esc)(pr.name)}" loading="lazy" class="aspect-square w-full object-cover transition duration-300 group-hover:scale-105">${pr.badge ? `<span class="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-fg" ${ctx.e(`products.${i}.badge`)}>${(0, util_1.esc)(pr.badge)}</span>` : ""}</a><div class="mt-3"><h3 class="font-medium" ${ctx.e(`products.${i}.name`)}>${(0, util_1.esc)(pr.name)}</h3>${pr.rating ? `<div class="mt-1">${(0, _shared_1.stars)(pr.rating, "h-3.5 w-3.5")}</div>` : ""}<p class="mt-1 flex items-baseline gap-2"><span class="font-semibold" ${ctx.e(`products.${i}.price`)}>${(0, util_1.esc)(pr.price)}</span>${pr.comparePrice ? `<span class="text-sm text-muted line-through" ${ctx.e(`products.${i}.comparePrice`)}>${(0, util_1.esc)(pr.comparePrice)}</span>` : ""}</p></div></article>`)
                .join("");
            return (0, _shared_1.section)(p, `${(0, _shared_1.header)(p, ctx, (0, _shared_1.isDark)(p))}<div class="${(0, util_1.cx)("grid gap-6", (0, util_1.pick)(P_COLS, p.columns))}">${cards}</div>`);
        },
    }),
    (0, fields_1.defineComponent)({
        type: "product-detail",
        label: "Product highlight",
        category: "commerce",
        level: "section",
        description: "Single product showcase: large image, name, price, rating, description, feature list and buy button.",
        props: {
            ...(0, _shared_1.sectionProps)(),
            reverse: fields_1.f.bool("Image on right", false),
            badge: fields_1.f.text("Badge", "Limited edition", { max: 24, optional: true }),
            name: fields_1.f.text("Name", "Signature product", { max: 80 }),
            price: fields_1.f.text("Price", "$129", { max: 20 }),
            comparePrice: fields_1.f.text("Old price", "$159", { max: 20, optional: true }),
            rating: fields_1.f.num("Rating (0-5)", 5, 0, 5, { optional: true }),
            description: fields_1.f.area("Description", "A beautifully crafted product designed to last. Made from premium materials.", { max: 500 }),
            features: fields_1.f.strs("Features", ["Free shipping over $50", "30-day returns", "2-year warranty"], { max: 6, maxItem: 80 }),
            ctaLabel: fields_1.f.text("Button label", "Add to cart", { max: 30 }),
            ctaHref: fields_1.f.url("Button link", "#"),
            image: fields_1.f.image("Image", "placeholder:Product photo"),
        },
        render: (p, ctx) => {
            const dark = (0, _shared_1.isDark)(p);
            const info = (p.badge ? `<span class="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary" ${ctx.e("badge")}>${(0, util_1.esc)(p.badge)}</span>` : "") +
                `<h2 class="font-heading text-3xl font-bold tracking-tight sm:text-4xl" ${ctx.e("name")}>${(0, util_1.esc)(p.name)}</h2>` +
                (p.rating ? `<div class="mt-3">${(0, _shared_1.stars)(p.rating)}</div>` : "") +
                `<p class="mt-4 flex items-baseline gap-3"><span class="font-heading text-3xl font-bold" ${ctx.e("price")}>${(0, util_1.esc)(p.price)}</span>${p.comparePrice ? `<span class="text-lg text-muted line-through" ${ctx.e("comparePrice")}>${(0, util_1.esc)(p.comparePrice)}</span>` : ""}</p>` +
                `<p class="${(0, util_1.cx)("mt-4 leading-relaxed", (0, _shared_1.muted)(dark))}" ${ctx.e("description")}>${(0, util_1.esc)(p.description)}</p>` +
                `<ul class="mt-6 space-y-2 text-sm">${(0, util_1.arr)(p.features).map((x, i) => `<li class="flex gap-2"><span class="text-primary">✓</span><span ${ctx.e(`features.${i}`)}>${(0, util_1.esc)(x)}</span></li>`).join("")}</ul>` +
                `<div class="mt-8">${(0, _shared_1.btn)(ctx, p.ctaLabel, p.ctaHref, "primary", dark, "ctaLabel", "lg")}</div>`;
            return (0, _shared_1.section)(p, `<div class="grid items-center gap-12 md:grid-cols-2"><div class="${(0, util_1.cx)(p.reverse && "md:order-2")}"><img src="${(0, util_1.esc)((0, util_1.imgSrc)(p.image, 900, 900))}" alt="${(0, util_1.esc)(p.name)}" class="aspect-square w-full rounded-theme object-cover shadow-xl"></div><div>${info}</div></div>`);
        },
    }),
    (0, fields_1.defineComponent)({
        type: "promo-banner",
        label: "Promo banner",
        category: "commerce",
        level: "section",
        description: "Sale / offer banner with optional coupon code and button.",
        props: {
            ...(0, _shared_1.sectionProps)("accent", "md"),
            heading: fields_1.f.text("Heading", "Autumn sale: up to 40% off", { max: 100 }),
            text: fields_1.f.text("Text", "Limited time only. While stocks last.", { max: 140, optional: true }),
            code: fields_1.f.text("Coupon code", "AUTUMN40", { max: 20, optional: true }),
            ctaLabel: fields_1.f.text("Button label", "Shop the sale", { max: 30, optional: true }),
            ctaHref: fields_1.f.url("Button link", "#", { optional: true }),
        },
        render: (p, ctx) => {
            const dark = (0, _shared_1.isDark)(p);
            return (0, _shared_1.section)(p, `<div class="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left"><div><h2 class="font-heading text-2xl font-bold sm:text-3xl" ${ctx.e("heading")}>${(0, util_1.esc)(p.heading)}</h2>${p.text ? `<p class="${(0, util_1.cx)("mt-2", (0, _shared_1.muted)(dark))}" ${ctx.e("text")}>${(0, util_1.esc)(p.text)}</p>` : ""}</div><div class="flex flex-wrap items-center justify-center gap-4">${p.code ? `<span class="rounded-theme border-2 border-dashed border-current px-4 py-2 font-mono text-sm font-bold tracking-widest" ${ctx.e("code")}>${(0, util_1.esc)(p.code)}</span>` : ""}${(0, _shared_1.btn)(ctx, p.ctaLabel, p.ctaHref, "primary", dark, "ctaLabel", "md")}</div></div>`);
        },
    }),
    (0, fields_1.defineComponent)({
        type: "category-grid",
        label: "Category grid",
        category: "commerce",
        level: "section",
        description: "Image tiles for shop categories or service areas with a label overlay.",
        props: {
            ...(0, _shared_1.sectionProps)(),
            ...(0, _shared_1.headerProps)({ eyebrow: "", heading: "Shop by category", sub: "", optionalHeading: true }),
            items: fields_1.f.list("Categories", { name: fields_1.f.text("Name", "Category", { max: 40 }), image: fields_1.f.image("Image", "placeholder:Category"), href: fields_1.f.url("Link", "#") }, [
                { name: "Women", image: "placeholder:Women", href: "#" },
                { name: "Men", image: "placeholder:Men", href: "#" },
                { name: "Accessories", image: "placeholder:Accessories", href: "#" },
            ], { min: 1, max: 8 }),
        },
        render: (p, ctx) => {
            const n = (0, util_1.arr)(p.items).length;
            const tiles = (0, util_1.arr)(p.items)
                .map((it, i) => `<a href="${(0, util_1.esc)(ctx.href(it.href))}" class="group relative block overflow-hidden rounded-theme"><img src="${(0, util_1.esc)((0, util_1.imgSrc)(it.image, 700, 800))}" alt="" loading="lazy" class="aspect-[4/5] w-full object-cover transition duration-300 group-hover:scale-105"><span class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></span><span class="absolute bottom-4 left-4 text-lg font-semibold text-white" ${ctx.e(`items.${i}.name`)}>${(0, util_1.esc)(it.name)}</span></a>`)
                .join("");
            return (0, _shared_1.section)(p, `${(0, _shared_1.header)(p, ctx, (0, _shared_1.isDark)(p))}<div class="${(0, util_1.cx)("grid grid-cols-2 gap-4", n <= 3 ? "md:grid-cols-3" : "md:grid-cols-4")}">${tiles}</div>`);
        },
    }),
];
