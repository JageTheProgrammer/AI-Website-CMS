/** Palette data for the editor's left panel, generated from the registry. */
import { type Category, type PageDocument } from "../types";
export interface PaletteItem {
    type: string;
    label: string;
    description: string;
    level: "section" | "block";
    isContainer: boolean;
}
export interface PaletteGroup {
    category: Category;
    label: string;
    items: PaletteItem[];
}
export declare function getPalette(): PaletteGroup[];
/** One-component document, for rendering palette thumbnails (render with mode "preview"). */
export declare function previewDocument(type: string, theme?: PageDocument["theme"]): PageDocument;
