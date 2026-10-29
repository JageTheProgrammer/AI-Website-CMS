/** Palette data for the editor's left panel, generated from the registry. */
import { CATEGORIES, type Category, type PageDocument } from "../types";
import { listComponents } from "../registry";
import { createNode } from "../ops";

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

export function getPalette(): PaletteGroup[] {
  return CATEGORIES.map((c) => ({
    category: c.id,
    label: c.label,
    items: listComponents(c.id).map((d) => ({
      type: d.type,
      label: d.label,
      description: d.description,
      level: d.level,
      isContainer: !!d.accepts,
    })),
  })).filter((g) => g.items.length);
}

/** One-component document, for rendering palette thumbnails (render with mode "preview"). */
export function previewDocument(type: string, theme: PageDocument["theme"] = {}): PageDocument {
  const node = createNode(type);
  const def = listComponents().find((d) => d.type === type)!;
  const root =
    def.level === "section"
      ? [node]
      : [createNode("section", { spacing: "sm" })].map((s) => ({ ...s, children: [node] }));
  return {
    version: 1,
    meta: { title: def.label, description: "", language: "en" },
    theme,
    pages: [{ path: "/", title: def.label, root }],
  };
}
