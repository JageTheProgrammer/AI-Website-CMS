/**
 * Pure, immutable editing operations used by the editor (drag/drop, inline edit, resize...).
 * Every function takes a page's `root` array and returns a new one.
 */
import type { Node, NodeStyle } from "./types";
import { getComponent, defaultProps } from "./registry";
import { canContain, coerceField, coerceStyle, createSectionWrapper, makeCtx } from "./document";
import { fieldAtPath, setByPath } from "./paths";
import { clone, uid } from "./util";

export interface Found {
  node: Node;
  parent: Node | null;
  siblings: Node[];
  index: number;
}

export function findNode(root: Node[], id: string, parent: Node | null = null): Found | null {
  for (let i = 0; i < root.length; i++) {
    if (root[i].id === id) return { node: root[i], parent, siblings: root, index: i };
    if (root[i].children) {
      const hit = findNode(root[i].children!, id, root[i]);
      if (hit) return hit;
    }
  }
  return null;
}

export function isDescendant(root: Node[], ancestorId: string, id: string): boolean {
  const a = findNode(root, ancestorId);
  return !!a && !!a.node.children && !!findNode(a.node.children, id, a.node);
}

/** Create a node with default props (what the palette inserts). */
export function createNode(type: string, props?: Record<string, any>): Node {
  const def = getComponent(type);
  if (!def) throw new Error(`Unknown component type: ${type}`);
  const node: Node = { id: uid(), type, props: { ...defaultProps(def), ...(props ?? {}) } };
  if (def.accepts) node.children = [];
  return node;
}

/** Deep copy with fresh ids. */
export function cloneWithNewIds(node: Node): Node {
  const copy = clone(node);
  const walk = (n: Node) => {
    n.id = uid();
    n.children?.forEach(walk);
  };
  walk(copy);
  return copy;
}

export function canDrop(root: Node[], parentId: string | null, childType: string, movingId?: string) {
  if (parentId !== null) {
    if (movingId && (parentId === movingId || isDescendant(root, movingId, parentId))) {
      return { ok: false, reason: "Cannot drop a component into itself" };
    }
    const parent = findNode(root, parentId);
    if (!parent) return { ok: false, reason: "Target not found" };
    return canContain(parent.node.type, childType);
  }
  return canContain(null, childType);
}

function removeFrom(root: Node[], id: string): Node | null {
  const hit = findNode(root, id);
  if (!hit) return null;
  hit.siblings.splice(hit.index, 1);
  return hit.node;
}

/**
 * Insert a node. parentId null = page root; blocks dropped at the root are wrapped in a new section.
 * Returns the new root, or the same root with `error` when the drop is not allowed.
 */
export function insertNode(root: Node[], node: Node, parentId: string | null, index?: number): { root: Node[]; error?: string } {
  const check = canDrop(root, parentId, node.type);
  if (!check.ok) return { root, error: check.reason };
  const next = clone(root);
  let toInsert = node;
  let list: Node[];
  if (parentId === null) {
    list = next;
    if (getComponent(node.type)!.level === "block") toInsert = createSectionWrapper(node);
  } else {
    const parent = findNode(next, parentId)!;
    parent.node.children = parent.node.children ?? [];
    list = parent.node.children;
  }
  const at = index === undefined || index < 0 || index > list.length ? list.length : index;
  list.splice(at, 0, clone(toInsert));
  return { root: next };
}

/** Move a node. `index` is relative to the target list *after* the node was removed from it. */
export function moveNode(root: Node[], id: string, parentId: string | null, index?: number): { root: Node[]; error?: string } {
  const src = findNode(root, id);
  if (!src) return { root, error: "Component not found" };
  const check = canDrop(root, parentId, src.node.type, id);
  if (!check.ok) return { root, error: check.reason };
  const next = clone(root);
  const node = removeFrom(next, id)!;
  return insertNode(next, node, parentId, index);
}

export function removeNode(root: Node[], id: string): Node[] {
  const next = clone(root);
  removeFrom(next, id);
  return next;
}

export function duplicateNode(root: Node[], id: string): { root: Node[]; newId?: string } {
  const hit = findNode(root, id);
  if (!hit) return { root };
  const next = clone(root);
  const h = findNode(next, id)!;
  const copy = cloneWithNewIds(hit.node);
  h.siblings.splice(h.index + 1, 0, copy);
  return { root: next, newId: copy.id };
}

/** Move a node one step among its siblings. */
export function shiftNode(root: Node[], id: string, delta: -1 | 1): Node[] {
  const hit = findNode(root, id);
  if (!hit) return root;
  const to = hit.index + delta;
  if (to < 0 || to >= hit.siblings.length) return root;
  const next = clone(root);
  const h = findNode(next, id)!;
  const [n] = h.siblings.splice(h.index, 1);
  h.siblings.splice(to, 0, n);
  return next;
}

/** Update one prop by path ("heading", "items.1.title"). The value is validated against the schema. */
export function setProp(root: Node[], id: string, path: string, value: any): { root: Node[]; error?: string } {
  const hit = findNode(root, id);
  if (!hit) return { root, error: "Component not found" };
  const def = getComponent(hit.node.type);
  if (!def) return { root, error: "Unknown component" };
  const field = fieldAtPath(def.props, path);
  if (!field) return { root, error: `Unknown prop "${path}"` };
  const ctx = makeCtx();
  const clean = coerceField({ ...field, optional: true } as any, value, path, ctx);
  if (ctx.errors.length) return { root, error: ctx.errors[0].message };
  const next = clone(root);
  const h = findNode(next, id)!;
  if (!setByPath(h.node.props, path, clean)) {
    // Top-level props that do not exist yet.
    if (!path.includes(".")) h.node.props[path] = clean;
    else return { root, error: `Cannot set "${path}"` };
  }
  return { root: next };
}

/** Replace a whole list/strings prop (add/remove/reorder items from the inspector). */
export const setPropValue = setProp;

/** Merge size/alignment changes. A null value removes that key. */
export function setStyle(root: Node[], id: string, patch: Partial<Record<keyof NodeStyle, string | null>>): Node[] {
  const hit = findNode(root, id);
  if (!hit) return root;
  const next = clone(root);
  const h = findNode(next, id)!;
  const merged: Record<string, any> = { ...(h.node.style ?? {}) };
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === undefined || v === "") delete merged[k];
    else merged[k] = v;
  }
  const ctx = makeCtx();
  const clean = coerceStyle(merged, "style", ctx);
  if (clean) h.node.style = clean;
  else delete h.node.style;
  return next;
}
