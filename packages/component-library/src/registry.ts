import type { Category, ComponentDefinition, Field } from "./types";
import { CATEGORIES } from "./types";
import { layoutComponents } from "./components/layout";
import { navigationComponents } from "./components/navigation";
import { heroComponents } from "./components/hero";
import { contentComponents } from "./components/content";
import { marketingComponents } from "./components/marketing";
import { formsComponents } from "./components/forms";
import { mediaComponents } from "./components/media";
import { commerceComponents } from "./components/commerce";
import { dataComponents } from "./components/data";
import { clone } from "./util";

const ALL: ComponentDefinition[] = [
  ...layoutComponents,
  ...navigationComponents,
  ...heroComponents,
  ...contentComponents,
  ...marketingComponents,
  ...formsComponents,
  ...mediaComponents,
  ...commerceComponents,
  ...dataComponents,
];

export const registry = new Map<string, ComponentDefinition>();
for (const def of ALL) {
  if (registry.has(def.type)) throw new Error(`Duplicate component type: ${def.type}`);
  registry.set(def.type, def);
}

export const getComponent = (type: string): ComponentDefinition | undefined => registry.get(type);
export const listComponents = (category?: Category): ComponentDefinition[] =>
  ALL.filter((d) => !category || d.category === category);

/** Default props for a component (used by the palette and by "add component"). */
export function defaultProps(def: ComponentDefinition): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, field] of Object.entries(def.props)) out[k] = clone(field.default);
  return out;
}

/** Fill missing props at render time. Optional fields become empty. */
export function normalizeProps(def: ComponentDefinition, props: Record<string, any> | undefined): Record<string, any> {
  const out: Record<string, any> = {};
  const src = props ?? {};
  for (const [k, field] of Object.entries(def.props)) {
    if (src[k] !== undefined && src[k] !== null) out[k] = src[k];
    else out[k] = field.optional ? emptyFor(field) : clone(field.default);
  }
  return out;
}

function emptyFor(field: Field): any {
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
export function describeComponents() {
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

export { CATEGORIES };
