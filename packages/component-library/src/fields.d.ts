import type { BooleanField, IconField, ListField, NumberField, PropSchema, SelectField, StringsField, TextField, UrlField, ComponentDefinition } from "./types";
type O = {
    optional?: boolean;
    ai?: string;
};
/** Field constructors. Every field carries a default used by the palette. */
export declare const f: {
    text: (label: string, def: string, o?: O & {
        max?: number;
        format?: "slug";
    }) => TextField;
    area: (label: string, def: string, o?: O & {
        max?: number;
    }) => TextField;
    url: (label: string, def: string, o?: O) => UrlField;
    image: (label: string, def: string, o?: O) => UrlField;
    icon: (label: string, def: string, o?: O) => IconField;
    select: (label: string, options: readonly string[], def: string, o?: O) => SelectField;
    bool: (label: string, def: boolean, o?: O) => BooleanField;
    num: (label: string, def: number, min: number, max: number, o?: O) => NumberField;
    strs: (label: string, def: string[], o?: O & {
        max?: number;
        maxItem?: number;
    }) => StringsField;
    list: (label: string, item: PropSchema, def: Record<string, any>[], o?: O & {
        min?: number;
        max?: number;
    }) => ListField;
};
/** Identity helper that gives authoring-time type checking. */
export declare function defineComponent(def: ComponentDefinition): ComponentDefinition;
export {};
