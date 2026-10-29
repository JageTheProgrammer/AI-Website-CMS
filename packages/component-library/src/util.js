"use strict";
/** Small, dependency-free helpers (isomorphic: works in Node and the browser). */
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = exports.nl2br = exports.paragraphs = exports.clone = exports.arr = exports.cx = exports.esc = void 0;
exports.pick = pick;
exports.uid = uid;
exports.isSafeUrl = isSafeUrl;
exports.isSafeImage = isSafeImage;
exports.placeholderImage = placeholderImage;
exports.imgSrc = imgSrc;
const esc = (v) => String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
exports.esc = esc;
const cx = (...a) => a.filter(Boolean).join(" ");
exports.cx = cx;
const arr = (v) => (Array.isArray(v) ? v : []);
exports.arr = arr;
/** Look up a class in a map, falling back to the first entry for unknown keys. */
function pick(map, key) {
    const k = String(key);
    return Object.prototype.hasOwnProperty.call(map, k) ? map[k] : map[Object.keys(map)[0]];
}
function uid(prefix = "n") {
    const g = globalThis;
    let r = "";
    if (g.crypto && g.crypto.getRandomValues) {
        const a = new Uint8Array(6);
        g.crypto.getRandomValues(a);
        r = Array.from(a, (x) => x.toString(36).padStart(2, "0")).join("").slice(0, 9);
    }
    else {
        r = Math.random().toString(36).slice(2, 11);
    }
    return `${prefix}_${r}`;
}
const clone = (v) => JSON.parse(JSON.stringify(v));
exports.clone = clone;
/** Split text into paragraphs on blank lines. */
const paragraphs = (s) => String(s ?? "")
    .split(/\n{2,}/)
    .map((x) => x.trim())
    .filter(Boolean);
exports.paragraphs = paragraphs;
const nl2br = (s) => (0, exports.esc)(s).replace(/\n/g, "<br>");
exports.nl2br = nl2br;
const SAFE_URL = /^(#|\/(?!\/)|\.{1,2}\/|\?|https?:\/\/|mailto:|tel:)/i;
function isSafeUrl(s) {
    // eslint-disable-next-line no-control-regex
    return s.length <= 2048 && SAFE_URL.test(s) && !/[\u0000-\u001f]/.test(s);
}
const SAFE_IMG = /^(placeholder:|https?:\/\/|\/(?!\/)|data:image\/(png|jpe?g|gif|webp|svg\+xml)[;,])/i;
function isSafeImage(s) {
    return s.length <= 1_500_000 && SAFE_IMG.test(s);
}
function hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++)
        h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
}
/** Neutral gradient placeholder image as a data URI. */
function placeholderImage(label, w = 800, h = 600) {
    const hue = hash(label) % 360;
    const text = (0, exports.esc)(label.length > 38 ? label.slice(0, 37).trimEnd() + "…" : label);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
        `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
        `<stop offset="0" stop-color="hsl(${hue},60%,88%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360},60%,72%)"/>` +
        `</linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>` +
        `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,sans-serif" font-size="${Math.round(w / 28)}" fill="hsl(${hue},35%,28%)">${text}</text></svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
/** Resolve an image field value to a usable src. */
function imgSrc(value, w = 800, h = 600) {
    const v = String(value ?? "");
    if (v.startsWith("placeholder:"))
        return placeholderImage(v.slice(12).trim() || "Image", w, h);
    return v;
}
const slugify = (s) => s
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
exports.slugify = slugify;
