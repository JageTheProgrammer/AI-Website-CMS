/** Small, dependency-free helpers (isomorphic: works in Node and the browser). */

export const esc = (v: unknown): string =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const cx = (...a: Array<string | false | null | undefined>): string =>
  a.filter(Boolean).join(" ");

export const arr = <T = any>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** Look up a class in a map, falling back to the first entry for unknown keys. */
export function pick<T>(map: Record<string, T>, key: unknown): T {
  const k = String(key);
  return Object.prototype.hasOwnProperty.call(map, k) ? map[k] : map[Object.keys(map)[0]];
}

export function uid(prefix = "n"): string {
  const g: any = globalThis as any;
  let r = "";
  if (g.crypto && g.crypto.getRandomValues) {
    const a = new Uint8Array(6);
    g.crypto.getRandomValues(a);
    r = Array.from(a, (x) => x.toString(36).padStart(2, "0")).join("").slice(0, 9);
  } else {
    r = Math.random().toString(36).slice(2, 11);
  }
  return `${prefix}_${r}`;
}

export const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

/** Split text into paragraphs on blank lines. */
export const paragraphs = (s: string): string[] =>
  String(s ?? "")
    .split(/\n{2,}/)
    .map((x) => x.trim())
    .filter(Boolean);

export const nl2br = (s: string): string => esc(s).replace(/\n/g, "<br>");

const SAFE_URL = /^(#|\/(?!\/)|\.{1,2}\/|\?|https?:\/\/|mailto:|tel:)/i;
export function isSafeUrl(s: string): boolean {
  // eslint-disable-next-line no-control-regex
  return s.length <= 2048 && SAFE_URL.test(s) && !/[\u0000-\u001f]/.test(s);
}

const SAFE_IMG = /^(placeholder:|https?:\/\/|\/(?!\/)|data:image\/(png|jpe?g|gif|webp|svg\+xml)[;,])/i;
export function isSafeImage(s: string): boolean {
  return s.length <= 1_500_000 && SAFE_IMG.test(s);
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Neutral gradient placeholder image as a data URI. */
export function placeholderImage(label: string, w = 800, h = 600): string {
  const hue = hash(label) % 360;
  const text = esc(label.length > 38 ? label.slice(0, 37).trimEnd() + "…" : label);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="hsl(${hue},60%,88%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360},60%,72%)"/>` +
    `</linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>` +
    `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,sans-serif" font-size="${Math.round(w / 28)}" fill="hsl(${hue},35%,28%)">${text}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

/** Resolve an image field value to a usable src. */
export function imgSrc(value: unknown, w = 800, h = 600): string {
  const v = String(value ?? "");
  if (v.startsWith("placeholder:")) return placeholderImage(v.slice(12).trim() || "Image", w, h);
  return v;
}

export const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
