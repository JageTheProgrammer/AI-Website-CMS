import type { Category, ComponentDefinition } from "./types";
import { CATEGORIES } from "./types";
export declare const registry: Map<string, ComponentDefinition>;
export declare const getComponent: (type: string) => ComponentDefinition | undefined;
export declare const listComponents: (category?: Category) => ComponentDefinition[];
/** Default props for a component (used by the palette and by "add component"). */
export declare function defaultProps(def: ComponentDefinition): Record<string, any>;
/** Fill missing props at render time. Optional fields become empty. */
export declare function normalizeProps(def: ComponentDefinition, props: Record<string, any> | undefined): Record<string, any>;
/** Serializable description of the registry for the editor UI (no functions). */
export declare function describeComponents(): {
    type: string;
    label: string;
    category: Category;
    level: "block" | "section";
    description: string;
    accepts: "blocks" | string[] | null;
    resize: {
        width?: boolean;
        height?: boolean;
        heightMode?: "min" | "fixed";
    } | null;
    props: import("./types").PropSchema;
}[];
export { CATEGORIES };
