import { defineComponent, f } from "../fields";
import { icon } from "../icons";
import { arr, cx, esc, imgSrc, pick } from "../util";
import { header, headerProps, isDark, muted, section, sectionProps } from "./_shared";

const G_COLS: Record<string, string> = {
  "2": "grid-cols-1 sm:grid-cols-2",
  "3": "grid-cols-2 md:grid-cols-3",
  "4": "grid-cols-2 md:grid-cols-4",
};
const M_COLS: Record<string, string> = {
  "2": "columns-1 sm:columns-2",
  "3": "columns-2 md:columns-3",
  "4": "columns-2 md:columns-4",
};
const V_RATIO: Record<string, string> = { "16/9": "aspect-video", "4/3": "aspect-[4/3]", "1/1": "aspect-square" };

/** Convert a video page URL into a privacy-friendly embed URL, or null when unsupported. */
export function videoEmbed(url: string): { kind: "iframe" | "file"; src: string } | null {
  const u = String(url || "").trim();
  let m = u.match(/^https:\/\/(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([\w-]{11})/i) || u.match(/^https:\/\/youtu\.be\/([\w-]{11})/i) || u.match(/^https:\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([\w-]{11})/i);
  if (m) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${m[1]}` };
  m = u.match(/^https:\/\/(?:www\.)?vimeo\.com\/(\d+)/i) || u.match(/^https:\/\/player\.vimeo\.com\/video\/(\d+)/i);
  if (m) return { kind: "iframe", src: `https://player.vimeo.com/video/${m[1]}` };
  if (/^(https:\/\/|\/).+\.(mp4|webm)(\?.*)?$/i.test(u)) return { kind: "file", src: u };
  return null;
}

const MAP_EMBED = /^https:\/\/(www\.openstreetmap\.org\/export\/embed\.html|www\.google\.com\/maps\/embed)/i;

export const mediaComponents = [
  defineComponent({
    type: "gallery",
    label: "Gallery",
    category: "media",
    level: "section",
    description: "Image gallery. Variants: uniform grid or masonry columns.",
    props: {
      variant: f.select("Variant", ["grid", "masonry"], "grid"),
      ...sectionProps(),
      ...headerProps({ eyebrow: "Gallery", heading: "A closer look", sub: "", optionalHeading: true }),
      columns: f.select("Columns", Object.keys(G_COLS), "3"),
      rounded: f.bool("Rounded corners", true),
      items: f.list(
        "Images",
        { src: f.image("Image", "placeholder:Photo"), alt: f.text("Alt text", "Gallery image", { max: 120 }) },
        [1, 2, 3, 4, 5, 6].map((n) => ({ src: `placeholder:Photo ${n}`, alt: `Gallery image ${n}` })),
        { min: 1, max: 24 },
      ),
    },
    render: (p, ctx) => {
      const imgs = arr<any>(p.items).map((it, i) => {
        const h = p.variant === "masonry" ? [600, 800, 500, 700][i % 4] : 600;
        const cls = cx("w-full object-cover", p.variant === "grid" && "aspect-square", p.rounded && "rounded-theme");
        const img = `<img src="${esc(imgSrc(it.src, 800, h))}" alt="${esc(it.alt)}" loading="lazy" class="${cls}">`;
        return p.variant === "masonry" ? `<div class="mb-4 break-inside-avoid">${img}</div>` : img;
      });
      const body =
        p.variant === "masonry"
          ? `<div class="${cx("gap-4", pick(M_COLS, p.columns))}">${imgs.join("")}</div>`
          : `<div class="${cx("grid gap-4", pick(G_COLS, p.columns))}">${imgs.join("")}</div>`;
      return section(p, `${header(p, ctx, isDark(p))}${body}`);
    },
  }),

  defineComponent({
    type: "carousel",
    label: "Carousel",
    category: "media",
    level: "section",
    description: "Horizontally scrollable slides with image, title and text (swipe/scroll, no JavaScript).",
    props: {
      ...sectionProps(),
      ...headerProps({ eyebrow: "", heading: "Featured work", sub: "", optionalHeading: true }),
      slides: f.list(
        "Slides",
        {
          image: f.image("Image", "placeholder:Slide"),
          title: f.text("Title", "Slide title", { max: 60, optional: true }),
          text: f.text("Text", "", { max: 140, optional: true }),
        },
        [
          { image: "placeholder:Project one", title: "Project one", text: "A short description." },
          { image: "placeholder:Project two", title: "Project two", text: "A short description." },
          { image: "placeholder:Project three", title: "Project three", text: "A short description." },
          { image: "placeholder:Project four", title: "Project four", text: "A short description." },
        ],
        { min: 1, max: 12 },
      ),
    },
    render: (p, ctx) => {
      const dark = isDark(p);
      const slides = arr<any>(p.slides)
        .map(
          (s, i) =>
            `<figure class="w-[85%] shrink-0 snap-center sm:w-[60%] lg:w-[38%]"><img src="${esc(imgSrc(s.image, 900, 600))}" alt="${esc(s.title)}" loading="lazy" class="aspect-[3/2] w-full rounded-theme object-cover">${s.title || s.text ? `<figcaption class="mt-3">${s.title ? `<p class="font-semibold" ${ctx.e(`slides.${i}.title`)}>${esc(s.title)}</p>` : ""}${s.text ? `<p class="${cx("text-sm", muted(dark))}" ${ctx.e(`slides.${i}.text`)}>${esc(s.text)}</p>` : ""}</figcaption>` : ""}</figure>`,
        )
        .join("");
      return section(p, `${header(p, ctx, dark)}<div class="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">${slides}</div>`);
    },
  }),

  defineComponent({
    type: "video",
    label: "Video",
    category: "media",
    level: "block",
    description: "Embedded video: YouTube, Vimeo or a direct .mp4/.webm file.",
    props: {
      url: f.url("Video URL", "https://www.youtube.com/watch?v=dQw4w9WgXcQ", { ai: "YouTube/Vimeo page URL or direct .mp4/.webm URL" }),
      title: f.text("Title", "Video", { max: 100 }),
      ratio: f.select("Aspect ratio", Object.keys(V_RATIO), "16/9"),
      poster: f.image("Poster image", "", { optional: true }),
    },
    resize: { width: true },
    render: (p) => {
      const v = videoEmbed(p.url);
      const box = cx("w-full overflow-hidden rounded-theme bg-slate-900", pick(V_RATIO, p.ratio));
      if (!v)
        return `<div class="${box} flex items-center justify-center text-sm text-slate-300">Unsupported video URL</div>`;
      if (v.kind === "file")
        return `<div class="${box}"><video controls preload="metadata" class="h-full w-full"${p.poster ? ` poster="${esc(imgSrc(p.poster))}"` : ""} src="${esc(v.src)}" title="${esc(p.title)}"></video></div>`;
      return `<div class="${box}"><iframe src="${esc(v.src)}" title="${esc(p.title)}" loading="lazy" allowfullscreen referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups" class="h-full w-full border-0"></iframe></div>`;
    },
  }),

  defineComponent({
    type: "map",
    label: "Map",
    category: "media",
    level: "block",
    description: "Location card. Embeds OpenStreetMap/Google Maps when an embed URL is given, otherwise shows the address with a link.",
    props: {
      address: f.text("Address", "123 Main Street, Springfield", { max: 140 }),
      embedUrl: f.url("Embed URL", "", { optional: true, ai: "only an openstreetmap.org/export/embed.html or google.com/maps/embed URL; otherwise leave empty" }),
      height: f.select("Height", ["sm", "md", "lg"], "md"),
    },
    resize: { width: true },
    render: (p, ctx) => {
      const h = pick({ sm: "h-56", md: "h-80", lg: "h-[28rem]" }, p.height);
      if (p.embedUrl && MAP_EMBED.test(p.embedUrl))
        return `<div class="${cx("w-full overflow-hidden rounded-theme border border-line", h)}"><iframe src="${esc(p.embedUrl)}" title="Map" loading="lazy" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin" class="h-full w-full border-0"></iframe></div>`;
      const link = "https://www.openstreetmap.org/search?query=" + encodeURIComponent(p.address || "");
      return `<div class="${cx("flex w-full flex-col items-center justify-center gap-3 rounded-theme border border-line bg-surface p-6 text-center text-fg", h)}"><span class="text-primary">${icon("map-pin", "h-8 w-8")}</span><p class="font-medium" ${ctx.e("address")}>${esc(p.address)}</p><a href="${esc(link)}" target="_blank" rel="noopener noreferrer" class="text-sm font-semibold text-primary hover:underline">Open in maps</a></div>`;
    },
  }),
];
