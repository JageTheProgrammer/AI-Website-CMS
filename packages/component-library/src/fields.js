"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.f = void 0;
exports.defineComponent = defineComponent;
/** Field constructors. Every field carries a default used by the palette. */
exports.f = {
    text: (label, def, o = {}) => ({
        kind: "text",
        label,
        default: def,
        max: o.max ?? 120,
        optional: o.optional,
        ai: o.ai,
        format: o.format,
    }),
    area: (label, def, o = {}) => ({
        kind: "textarea",
        label,
        default: def,
        max: o.max ?? 600,
        optional: o.optional,
        ai: o.ai,
    }),
    url: (label, def, o = {}) => ({
        kind: "url",
        label,
        default: def,
        optional: o.optional,
        ai: o.ai,
    }),
    image: (label, def, o = {}) => ({
        kind: "image",
        label,
        default: def,
        optional: o.optional,
        ai: o.ai ?? 'URL, or "placeholder:<short description>" when no real image is available',
    }),
    icon: (label, def, o = {}) => ({
        kind: "icon",
        label,
        default: def,
        optional: o.optional,
        ai: o.ai,
    }),
    select: (label, options, def, o = {}) => ({
        kind: "select",
        label,
        options,
        default: def,
        optional: o.optional,
        ai: o.ai,
    }),
    bool: (label, def, o = {}) => ({
        kind: "boolean",
        label,
        default: def,
        optional: o.optional,
        ai: o.ai,
    }),
    num: (label, def, min, max, o = {}) => ({
        kind: "number",
        label,
        default: def,
        min,
        max,
        optional: o.optional,
        ai: o.ai,
    }),
    strs: (label, def, o = {}) => ({
        kind: "strings",
        label,
        default: def,
        max: o.max ?? 12,
        maxItem: o.maxItem ?? 160,
        optional: o.optional,
        ai: o.ai,
    }),
    list: (label, item, def, o = {}) => ({
        kind: "list",
        label,
        item,
        default: def,
        min: o.min ?? 0,
        max: o.max ?? 12,
        optional: o.optional,
        ai: o.ai,
    }),
};
/** Identity helper that gives authoring-time type checking. */
function defineComponent(def) {
    return def;
}
