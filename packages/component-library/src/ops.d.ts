/**
 * Pure, immutable editing operations used by the editor (drag/drop, inline edit, resize...).
 * Every function takes a page's `root` array and returns a new one.
 */
import type { Node, NodeStyle } from "./types";
export interface Found {
    node: Node;
    parent: Node | null;
    siblings: Node[];
    index: number;
}
export declare function findNode(root: Node[], id: string, parent?: Node | null): Found | null;
export declare function isDescendant(root: Node[], ancestorId: string, id: string): boolean;
/** Create a node with default props (what the palette inserts). */
export declare function createNode(type: string, props?: Record<string, any>): Node;
/** Deep copy with fresh ids. */
export declare function cloneWithNewIds(node: Node): Node;
export declare function canDrop(root: Node[], parentId: string | null, childType: string, movingId?: string): {
    ok: boolean;
    reason?: string;
};
/**
 * Insert a node. parentId null = page root; blocks dropped at the root are wrapped in a new section.
 * Returns the new root, or the same root with `error` when the drop is not allowed.
 */
export declare function insertNode(root: Node[], node: Node, parentId: string | null, index?: number): {
    root: Node[];
    error?: string;
};
/** Move a node. `index` is relative to the target list *after* the node was removed from it. */
export declare function moveNode(root: Node[], id: string, parentId: string | null, index?: number): {
    root: Node[];
    error?: string;
};
export declare function removeNode(root: Node[], id: string): Node[];
export declare function duplicateNode(root: Node[], id: string): {
    root: Node[];
    newId?: string;
};
/** Move a node one step among its siblings. */
export declare function shiftNode(root: Node[], id: string, delta: -1 | 1): Node[];
/** Update one prop by path ("heading", "items.1.title"). The value is validated against the schema. */
export declare function setProp(root: Node[], id: string, path: string, value: any): {
    root: Node[];
    error?: string;
};
/** Replace a whole list/strings prop (add/remove/reorder items from the inspector). */
export declare const setPropValue: typeof setProp;
/** Merge size/alignment changes. A null value removes that key. */
export declare function setStyle(root: Node[], id: string, patch: Partial<Record<keyof NodeStyle, string | null>>): Node[];
