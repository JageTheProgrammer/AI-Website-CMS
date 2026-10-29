/** Convert a video page URL into a privacy-friendly embed URL, or null when unsupported. */
export declare function videoEmbed(url: string): {
    kind: "iframe" | "file";
    src: string;
} | null;
export declare const mediaComponents: import("..").ComponentDefinition[];
