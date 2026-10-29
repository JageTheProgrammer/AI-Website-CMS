import type {
  BooleanField,
  IconField,
  ListField,
  NumberField,
  PropSchema,
  SelectField,
  StringsField,
  TextField,
  UrlField,
  ComponentDefinition,
} from "./types";

type O = { optional?: boolean; ai?: string };

/** Field constructors. Every field carries a default used by the palette. */
export const f = {
  text: (
    label: string,
    def: string,
    o: O & { max?: number; format?: "slug" } = {},
  ): TextField => ({
    kind: "text",
    label,
    default: def,
    max: o.max ?? 120,
    optional: o.optional,
    ai: o.ai,
    format: o.format,
  }),
  area: (label: string, def: string, o: O & { max?: number } = {}): TextField => ({
    kind: "textarea",
    label,
    default: def,
    max: o.max ?? 600,
    optional: o.optional,
    ai: o.ai,
  }),
  url: (label: string, def: string, o: O = {}): UrlField => ({
    kind: "url",
    label,
    default: def,
    optional: o.optional,
    ai: o.ai,
  }),
  image: (label: string, def: string, o: O = {}): UrlField => ({
    kind: "image",
    label,
    default: def,
    optional: o.optional,
    ai: o.ai ?? 'URL, or "placeholder:<short description>" when no real image is available',
  }),
  icon: (label: string, def: string, o: O = {}): IconField => ({
    kind: "icon",
    label,
    default: def,
    optional: o.optional,
    ai: o.ai,
  }),
  select: (
    label: string,
    options: readonly string[],
    def: string,
    o: O = {},
  ): SelectField => ({
    kind: "select",
    label,
    options,
    default: def,
    optional: o.optional,
    ai: o.ai,
  }),
  bool: (label: string, def: boolean, o: O = {}): BooleanField => ({
    kind: "boolean",
    label,
    default: def,
    optional: o.optional,
    ai: o.ai,
  }),
  num: (label: string, def: number, min: number, max: number, o: O = {}): NumberField => ({
    kind: "number",
    label,
    default: def,
    min,
    max,
    optional: o.optional,
    ai: o.ai,
  }),
  strs: (
    label: string,
    def: string[],
    o: O & { max?: number; maxItem?: number } = {},
  ): StringsField => ({
    kind: "strings",
    label,
    default: def,
    max: o.max ?? 12,
    maxItem: o.maxItem ?? 160,
    optional: o.optional,
    ai: o.ai,
  }),
  list: (
    label: string,
    item: PropSchema,
    def: Record<string, any>[],
    o: O & { min?: number; max?: number } = {},
  ): ListField => ({
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
export function defineComponent(def: ComponentDefinition): ComponentDefinition {
  return def;
}
