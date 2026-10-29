"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.THEME_OPTIONS = exports.tailwindExtend = exports.HEX = exports.DEFAULT_THEME = exports.FONTS = exports.THEME_PRESETS = exports.COLOR_TOKENS = void 0;
exports.resolveColors = resolveColors;
exports.themeCss = themeCss;
exports.fontsHref = fontsHref;
exports.COLOR_TOKENS = [
    "primary",
    "primaryFg",
    "accent",
    "accentFg",
    "bg",
    "surface",
    "fg",
    "muted",
    "line",
];
const LIGHT = { bg: "#ffffff", surface: "#f8fafc", fg: "#0f172a", muted: "#64748b", line: "#e2e8f0" };
const DARK = { bg: "#0b1020", surface: "#131a2e", fg: "#e5e7eb", muted: "#94a3b8", line: "#263149" };
exports.THEME_PRESETS = {
    indigo: { primary: "#4f46e5", accent: "#06b6d4", vibe: "modern SaaS, trustworthy" },
    emerald: { primary: "#059669", accent: "#f59e0b", vibe: "fresh, wellness, eco" },
    rose: { primary: "#e11d48", accent: "#6366f1", vibe: "bold, lifestyle, beauty" },
    amber: { primary: "#d97706", accent: "#0f766e", vibe: "warm, food, craft" },
    sky: { primary: "#0284c7", accent: "#7c3aed", vibe: "clean, travel, health" },
    violet: { primary: "#7c3aed", accent: "#ec4899", vibe: "creative, startups, apps" },
    slate: { primary: "#0f172a", accent: "#2563eb", vibe: "corporate, law, finance" },
    orange: { primary: "#ea580c", accent: "#0ea5e9", vibe: "energetic, fitness, events" },
    teal: { primary: "#0d9488", accent: "#f43f5e", vibe: "calm, medical, services" },
    mono: { primary: "#111827", accent: "#6b7280", vibe: "minimal, portfolio, editorial" },
};
/** Whitelisted fonts: name -> Google Fonts family parameter + CSS fallback. */
exports.FONTS = {
    Inter: { google: "Inter:wght@400;500;600;700", stack: "Inter, ui-sans-serif, system-ui, sans-serif" },
    "DM Sans": { google: "DM+Sans:wght@400;500;700", stack: '"DM Sans", ui-sans-serif, system-ui, sans-serif' },
    Poppins: { google: "Poppins:wght@400;500;600;700", stack: "Poppins, ui-sans-serif, system-ui, sans-serif" },
    Manrope: { google: "Manrope:wght@400;500;700;800", stack: "Manrope, ui-sans-serif, system-ui, sans-serif" },
    "Space Grotesk": { google: "Space+Grotesk:wght@400;500;700", stack: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif' },
    "Playfair Display": { google: "Playfair+Display:wght@400;600;700", stack: '"Playfair Display", Georgia, serif' },
    Merriweather: { google: "Merriweather:wght@400;700", stack: "Merriweather, Georgia, serif" },
    Lora: { google: "Lora:wght@400;600;700", stack: "Lora, Georgia, serif" },
    "Plus Jakarta Sans": { google: "Plus+Jakarta+Sans:wght@400;500;700;800", stack: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif' },
    "Work Sans": { google: "Work+Sans:wght@400;500;600;700", stack: '"Work Sans", ui-sans-serif, system-ui, sans-serif' },
};
const RADIUS = {
    none: ["0px", "0px"],
    sm: ["0.25rem", "0.25rem"],
    md: ["0.5rem", "0.5rem"],
    lg: ["0.75rem", "0.75rem"],
    xl: ["1.25rem", "9999px"],
};
exports.DEFAULT_THEME = {
    preset: "indigo",
    mode: "light",
    fontHeading: "Inter",
    fontBody: "Inter",
    radius: "md",
};
exports.HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
function hexToRgb(hex) {
    let h = hex.replace("#", "");
    if (h.length === 3)
        h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function readableOn(hex) {
    const [r, g, b] = hexToRgb(hex).map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? "#0f172a" : "#ffffff";
}
function resolveColors(theme) {
    const preset = exports.THEME_PRESETS[theme.preset ?? ""] ?? exports.THEME_PRESETS[exports.DEFAULT_THEME.preset];
    const base = theme.mode === "dark" ? DARK : LIGHT;
    const out = {
        primary: preset.primary,
        accent: preset.accent,
        ...base,
    };
    // In dark mode a near-black primary would vanish; lift it.
    if (theme.mode === "dark" && readableOn(out.primary) === "#ffffff" && hexToRgb(out.primary).every((v) => v < 60)) {
        out.primary = "#e5e7eb";
    }
    for (const [k, v] of Object.entries(theme.colors ?? {})) {
        if (exports.COLOR_TOKENS.includes(k) && v && exports.HEX.test(v))
            out[k] = v;
    }
    out.primaryFg = theme.colors?.primaryFg && exports.HEX.test(theme.colors.primaryFg) ? theme.colors.primaryFg : readableOn(out.primary);
    out.accentFg = theme.colors?.accentFg && exports.HEX.test(theme.colors.accentFg) ? theme.colors.accentFg : readableOn(out.accent);
    return out;
}
const kebab = (s) => s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
/** CSS custom properties for the theme. Values for colors are space-separated RGB channels. */
function themeCss(theme) {
    const colors = resolveColors(theme);
    const fh = exports.FONTS[theme.fontHeading ?? ""] ?? exports.FONTS[exports.DEFAULT_THEME.fontHeading];
    const fb = exports.FONTS[theme.fontBody ?? ""] ?? exports.FONTS[exports.DEFAULT_THEME.fontBody];
    const [r, rb] = RADIUS[theme.radius ?? exports.DEFAULT_THEME.radius] ?? RADIUS.md;
    const vars = Object.entries(colors)
        .map(([k, v]) => `--c-${kebab(k)}:${hexToRgb(v).join(" ")}`)
        .join(";");
    return `:root{${vars};--radius:${r};--radius-btn:${rb};--font-heading:${fh.stack};--font-body:${fb.stack}}`;
}
function fontsHref(theme) {
    const names = new Set([theme.fontHeading ?? exports.DEFAULT_THEME.fontHeading, theme.fontBody ?? exports.DEFAULT_THEME.fontBody]);
    const fams = [...names].filter((n) => exports.FONTS[n]).map((n) => "family=" + exports.FONTS[n].google);
    return fams.length ? `https://fonts.googleapis.com/css2?${fams.join("&")}&display=swap` : "";
}
const rgbVar = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;
/**
 * Tailwind `theme.extend` shared by the CDN script and by a build-time preset.
 * Use as: module.exports = { presets: [{ theme: { extend: tailwindExtend } }] }
 */
exports.tailwindExtend = {
    colors: {
        primary: { DEFAULT: rgbVar("primary"), fg: rgbVar("primary-fg") },
        accent: { DEFAULT: rgbVar("accent"), fg: rgbVar("accent-fg") },
        bg: rgbVar("bg"),
        surface: rgbVar("surface"),
        fg: rgbVar("fg"),
        muted: rgbVar("muted"),
        line: rgbVar("line"),
    },
    fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
    },
    borderRadius: {
        theme: "var(--radius)",
        btn: "var(--radius-btn)",
    },
};
exports.THEME_OPTIONS = {
    presets: Object.keys(exports.THEME_PRESETS),
    fonts: Object.keys(exports.FONTS),
    radius: Object.keys(RADIUS),
    modes: ["light", "dark"],
};
