import type { Field, PropSchema, TextField } from "./types";

/** Resolve the schema field addressed by a prop path like "items.2.title" or "bullets.1". */
export function fieldAtPath(schema: PropSchema, path: string): Field | null {
  const parts = path.split(".");
  let field: Field | undefined = schema[parts[0]];
  let i = 1;
  while (field && i < parts.length) {
    if (field.kind === "list") {
      if (!/^\d+$/.test(parts[i])) return null;
      i++;
      if (i >= parts.length) return null;
      field = field.item[parts[i]];
      i++;
    } else if (field.kind === "strings") {
      if (!/^\d+$/.test(parts[i])) return null;
      const t: TextField = { kind: "text", label: field.label, default: "", max: field.maxItem };
      return i === parts.length - 1 ? t : null;
    } else return null;
  }
  return field ?? null;
}

const SAFE_KEY = /^(?!__proto__$|constructor$|prototype$)[A-Za-z0-9_]+$/;

/** Immutable-style set on a (cloned) props object. Returns false if the path is invalid. */
export function setByPath(obj: any, path: string, value: any): boolean {
  const parts = path.split(".");
  if (!parts.every((p) => SAFE_KEY.test(p))) return false;
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    cur = cur?.[parts[i]];
    if (cur === undefined || cur === null || typeof cur !== "object") return false;
  }
  const last = parts[parts.length - 1];
  if (Array.isArray(cur) && !/^\d+$/.test(last)) return false;
  if (Array.isArray(cur) && Number(last) >= cur.length) return false;
  cur[last] = value;
  return true;
}
