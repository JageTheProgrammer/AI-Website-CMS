"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CATEGORIES = exports.listComponents = exports.getComponent = exports.registry = void 0;
exports.defaultProps = defaultProps;
exports.normalizeProps = normalizeProps;
exports.describeComponents = describeComponents;
const types_1 = require("./types");
Object.defineProperty(exports, "CATEGORIES", { enumerable: true, get: function () { return types_1.CATEGORIES; } });
const layout_1 = require("./components/layout");
const navigation_1 = require("./components/navigation");
const hero_1 = require("./components/hero");
const content_1 = require("./components/content");
const marketing_1 = require("./components/marketing");
const forms_1 = require("./components/forms");
const media_1 = require("./components/media");
const commerce_1 = require("./components/commerce");
const data_1 = require("./components/data");
const util_1 = require("./util");
const ALL = [
    ...layout_1.layoutComponents,
    ...navigation_1.navigationComponents,
    ...hero_1.heroComponents,
    ...content_1.contentComponents,
    ...marketing_1.marketingComponents,
    ...forms_1.formsComponents,
    ...media_1.mediaComponents,
    ...commerce_1.commerceComponents,
    ...data_1.dataComponents,
];
exports.registry = new Map();
for (const def of ALL) {
    if (exports.registry.has(def.type))
        throw new Error(`Duplicate component type: ${def.type}`);
    exports.registry.set(def.type, def);
}
const getComponent = (type) => exports.registry.get(type);
exports.getComponent = getComponent;
const listComponents = (category) => ALL.filter((d) => !category || d.category === category);
exports.listComponents = listComponents;
/** Default props for a component (used by the palette and by "add component"). */
function defaultProps(def) {
    const out = {};
    for (const [k, field] of Object.entries(def.props))
        out[k] = (0, util_1.clone)(field.default);
    return out;
}
/** Fill missing props at render time. Optional fields become empty. */
function normalizeProps(def, props) {
    const out = {};
    const src = props ?? {};
    for (const [k, field] of Object.entries(def.props)) {
        if (src[k] !== undefined && src[k] !== null)
            out[k] = src[k];
        else
            out[k] = field.optional ? emptyFor(field) : (0, util_1.clone)(field.default);
    }
    return out;
}
function emptyFor(field) {
    switch (field.kind) {
        case "list":
        case "strings":
            return [];
        case "boolean":
            return false;
        case "number":
            return field.default;
        default:
            return "";
    }
}
/** Serializable description of the registry for the editor UI (no functions). */
function describeComponents() {
    return ALL.map((d) => ({
        type: d.type,
        label: d.label,
        category: d.category,
        level: d.level,
        description: d.description,
        accepts: d.accepts ?? null,
        resize: d.resize ?? null,
        props: d.props,
    }));
}
