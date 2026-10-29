"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPalette = getPalette;
exports.previewDocument = previewDocument;
/** Palette data for the editor's left panel, generated from the registry. */
const types_1 = require("../types");
const registry_1 = require("../registry");
const ops_1 = require("../ops");
function getPalette() {
    return types_1.CATEGORIES.map((c) => ({
        category: c.id,
        label: c.label,
        items: (0, registry_1.listComponents)(c.id).map((d) => ({
            type: d.type,
            label: d.label,
            description: d.description,
            level: d.level,
            isContainer: !!d.accepts,
        })),
    })).filter((g) => g.items.length);
}
/** One-component document, for rendering palette thumbnails (render with mode "preview"). */
function previewDocument(type, theme = {}) {
    const node = (0, ops_1.createNode)(type);
    const def = (0, registry_1.listComponents)().find((d) => d.type === type);
    const root = def.level === "section"
        ? [node]
        : [(0, ops_1.createNode)("section", { spacing: "sm" })].map((s) => ({ ...s, children: [node] }));
    return {
        version: 1,
        meta: { title: def.label, description: "", language: "en" },
        theme,
        pages: [{ path: "/", title: def.label, root }],
    };
}
