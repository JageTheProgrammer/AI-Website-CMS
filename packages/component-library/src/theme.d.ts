/**
 * Design tokens. Components only use semantic Tailwind colors
 * (bg-primary, text-fg, border-line ...) so a theme swap restyles the whole site.
 */
import type { ThemeInput } from "./types";
export declare const COLOR_TOKENS: readonly ["primary", "primaryFg", "accent", "accentFg", "bg", "surface", "fg", "muted", "line"];
export type ColorToken = (typeof COLOR_TOKENS)[number];
export declare const THEME_PRESETS: Record<string, {
    primary: string;
    accent: string;
    vibe: string;
}>;
/** Whitelisted fonts: name -> Google Fonts family parameter + CSS fallback. */
export declare const FONTS: Record<string, {
    google: string;
    stack: string;
}>;
export declare const DEFAULT_THEME: Required<Pick<ThemeInput, "preset" | "mode" | "fontHeading" | "fontBody" | "radius">>;
export declare const HEX: RegExp;
export declare function resolveColors(theme: ThemeInput): Record<ColorToken, string>;
/** CSS custom properties for the theme. Values for colors are space-separated RGB channels. */
export declare function themeCss(theme: ThemeInput): string;
export declare function fontsHref(theme: ThemeInput): string;
/**
 * Tailwind `theme.extend` shared by the CDN script and by a build-time preset.
 * Use as: module.exports = { presets: [{ theme: { extend: tailwindExtend } }] }
 */
export declare const tailwindExtend: {
    colors: {
        primary: {
            DEFAULT: string;
            fg: string;
        };
        accent: {
            DEFAULT: string;
            fg: string;
        };
        bg: string;
        surface: string;
        fg: string;
        muted: string;
        line: string;
    };
    fontFamily: {
        heading: string[];
        body: string[];
    };
    borderRadius: {
        theme: string;
        btn: string;
    };
};
export declare const THEME_OPTIONS: {
    presets: string[];
    fonts: string[];
    radius: string[];
    modes: string[];
};
