import type { PropSchema, RenderContext } from "../types";
export declare const BG: readonly ["default", "surface", "primary", "accent", "dark", "gradient"];
export declare const isDark: (p: any) => boolean;
export declare const bgClass: (bg: unknown) => string;
export declare const muted: (dark: boolean) => string;
export declare const WIDTH: Record<string, string>;
export declare const GAP: Record<string, string>;
/** Props every full-width section shares. */
export declare function sectionProps(bg?: string, spacing?: string): PropSchema;
export declare function section(p: any, inner: string, o?: {
    tag?: string;
    width?: string;
    cls?: string;
    noPad?: boolean;
    innerCls?: string;
}): string;
export declare function headerProps(o: {
    eyebrow?: string;
    heading: string;
    sub?: string;
    optionalHeading?: boolean;
}): PropSchema;
export declare function header(p: any, ctx: RenderContext, dark: boolean): string;
export type BtnVariant = "primary" | "secondary" | "outline" | "ghost";
export declare function btn(ctx: RenderContext, label: string, href: string, variant: string, dark: boolean, path: string, size?: string, o?: {
    icon?: string;
    submit?: boolean;
    full?: boolean;
}): string;
export declare function iconBox(name: string, dark: boolean, size?: string): string;
export declare function stars(rating: number, cls?: string): string;
export declare const INPUT_CLS = "w-full rounded-theme border border-line bg-bg px-3.5 py-2.5 text-sm text-fg placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";
