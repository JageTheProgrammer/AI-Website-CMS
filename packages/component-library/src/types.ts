/**
 * Core types shared by the registry, validator, renderer, AI catalog and editor.
 */

export type Category =
  | "layout"
  | "navigation"
  | "hero"
  | "content"
  | "marketing"
  | "forms"
  | "media"
  | "commerce"
  | "data";

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "layout", label: "Layout" },
  { id: "navigation", label: "Navigation" },
  { id: "hero", label: "Hero" },
  { id: "content", label: "Content" },
  { id: "marketing", label: "Marketing" },
  { id: "forms", label: "Forms" },
  { id: "media", label: "Media" },
  { id: "commerce", label: "Commerce" },
  { id: "data", label: "Data" },
];

// ---------------------------------------------------------------------------
// Prop schema (one DSL drives validation, inspector UI and the AI catalog)
// ---------------------------------------------------------------------------

interface FieldBase {
  label: string;
  /** Optional fields may be empty; when the AI omits them they become "". */
  optional?: boolean;
  /** Extra hint shown to the AI in the catalog. */
  ai?: string;
}

export interface TextField extends FieldBase {
  kind: "text" | "textarea";
  default: string;
  max: number;
  format?: "slug";
}
export interface UrlField extends FieldBase {
  kind: "url" | "image";
  default: string;
}
export interface IconField extends FieldBase {
  kind: "icon";
  default: string;
}
export interface SelectField extends FieldBase {
  kind: "select";
  options: readonly string[];
  default: string;
}
export interface BooleanField extends FieldBase {
  kind: "boolean";
  default: boolean;
}
export interface NumberField extends FieldBase {
  kind: "number";
  default: number;
  min: number;
  max: number;
}
export interface StringsField extends FieldBase {
  kind: "strings";
  default: string[];
  max: number;
  maxItem: number;
}
export interface ListField extends FieldBase {
  kind: "list";
  item: PropSchema;
  default: Record<string, any>[];
  min: number;
  max: number;
}

export type Field =
  | TextField
  | UrlField
  | IconField
  | SelectField
  | BooleanField
  | NumberField
  | StringsField
  | ListField;

export type PropSchema = Record<string, Field>;

// ---------------------------------------------------------------------------
// Document model
// ---------------------------------------------------------------------------

export interface NodeStyle {
  width?: string;
  height?: string;
  maxWidth?: string;
  align?: "left" | "center" | "right";
  marginTop?: string;
  marginBottom?: string;
}

export interface Node {
  id: string;
  type: string;
  props: Record<string, any>;
  style?: NodeStyle;
  children?: Node[];
}

export interface Page {
  path: string;
  title: string;
  description?: string;
  root: Node[];
}

export interface ThemeInput {
  preset?: string;
  mode?: "light" | "dark";
  fontHeading?: string;
  fontBody?: string;
  radius?: "none" | "sm" | "md" | "lg" | "xl";
  colors?: Partial<Record<string, string>>;
}

export interface PageDocument {
  version: 1;
  meta: { title: string; description: string; language: string };
  theme: ThemeInput;
  pages: Page[];
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

export type RenderMode = "edit" | "preview" | "publish";

export interface RenderContext {
  mode: RenderMode;
  node: Node;
  /** Rendered children (includes an empty-slot placeholder in edit mode). */
  children: string;
  childCount: number;
  /** data-edit attribute for inline text editing (edit mode only). */
  e(path: string): string;
  /** Safe, page-aware href. */
  href(url: string): string;
  /** Form endpoint for published sites. */
  formAction: string;
}

export interface ComponentDefinition {
  type: string;
  label: string;
  category: Category;
  /** "section" components live at page root; "block" components live inside containers. */
  level: "section" | "block";
  description: string;
  aiHint?: string;
  props: PropSchema;
  /** Containers: "blocks" = any block, or an explicit list of component types. */
  accepts?: "blocks" | string[];
  resize?: { width?: boolean; height?: boolean; heightMode?: "min" | "fixed" };
  render(props: any, ctx: RenderContext): string;
}
