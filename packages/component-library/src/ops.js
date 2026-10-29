"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPropValue = void 0;
exports.findNode = findNode;
exports.isDescendant = isDescendant;
exports.createNode = createNode;
exports.cloneWithNewIds = cloneWithNewIds;
exports.canDrop = canDrop;
exports.insertNode = insertNode;
exports.moveNode = moveNode;
exports.removeNode = removeNode;
exports.duplicateNode = duplicateNode;
exports.shiftNode = shiftNode;
exports.setProp = setProp;
exports.setStyle = setStyle;
const registry_1 = require("./registry");
const document_1 = require("./document");
const paths_1 = require("./paths");
const util_1 = require("./util");
function findNode(root, id, parent = null) {
    for (let i = 0; i < root.length; i++) {
        if (root[i].id === id)
            return { node: root[i], parent, siblings: root, index: i };
        if (root[i].children) {
            const hit = findNode(root[i].children, id, root[i]);
            if (hit)
                return hit;
        }
    }
    return null;
}
function isDescendant(root, ancestorId, id) {
    const a = findNode(root, ancestorId);
    return !!a && !!a.node.children && !!findNode(a.node.children, id, a.node);
}
/** Create a node with default props (what the palette inserts). */
function createNode(type, props) {
    const def = (0, registry_1.getComponent)(type);
    if (!def)
        throw new Error(`Unknown component type: ${type}`);
    const node = { id: (0, util_1.uid)(), type, props: { ...(0, registry_1.defaultProps)(def), ...(props ?? {}) } };
    if (def.accepts)
        node.children = [];
    return node;
}
/** Deep copy with fresh ids. */
function cloneWithNewIds(node) {
    const copy = (0, util_1.clone)(node);
    const walk = (n) => {
        n.id = (0, util_1.uid)();
        n.children?.forEach(walk);
    };
    walk(copy);
    return copy;
}
function canDrop(root, parentId, childType, movingId) {
    if (parentId !== null) {
        if (movingId && (parentId === movingId || isDescendant(root, movingId, parentId))) {
            return { ok: false, reason: "Cannot drop a component into itself" };
        }
        const parent = findNode(root, parentId);
        if (!parent)
            return { ok: false, reason: "Target not found" };
        return (0, document_1.canContain)(parent.node.type, childType);
    }
    return (0, document_1.canContain)(null, childType);
}
function removeFrom(root, id) {
    const hit = findNode(root, id);
    if (!hit)
        return null;
    hit.siblings.splice(hit.index, 1);
    return hit.node;
}
/**
 * Insert a node. parentId null = page root; blocks dropped at the root are wrapped in a new section.
 * Returns the new root, or the same root with `error` when the drop is not allowed.
 */
function insertNode(root, node, parentId, index) {
    const check = canDrop(root, parentId, node.type);
    if (!check.ok)
        return { root, error: check.reason };
    const next = (0, util_1.clone)(root);
    let toInsert = node;
    let list;
    if (parentId === null) {
        list = next;
        if ((0, registry_1.getComponent)(node.type).level === "block")
            toInsert = (0, document_1.createSectionWrapper)(node);
    }
    else {
        const parent = findNode(next, parentId);
        parent.node.children = parent.node.children ?? [];
        list = parent.node.children;
    }
    const at = index === undefined || index < 0 || index > list.length ? list.length : index;
    list.splice(at, 0, (0, util_1.clone)(toInsert));
    return { root: next };
}
/** Move a node. `index` is relative to the target list *after* the node was removed from it. */
function moveNode(root, id, parentId, index) {
    const src = findNode(root, id);
    if (!src)
        return { root, error: "Component not found" };
    const check = canDrop(root, parentId, src.node.type, id);
    if (!check.ok)
        return { root, error: check.reason };
    const next = (0, util_1.clone)(root);
    const node = removeFrom(next, id);
    return insertNode(next, node, parentId, index);
}
function removeNode(root, id) {
    const next = (0, util_1.clone)(root);
    removeFrom(next, id);
    return next;
}
function duplicateNode(root, id) {
    const hit = findNode(root, id);
    if (!hit)
        return { root };
    const next = (0, util_1.clone)(root);
    const h = findNode(next, id);
    const copy = cloneWithNewIds(hit.node);
    h.siblings.splice(h.index + 1, 0, copy);
    return { root: next, newId: copy.id };
}
/** Move a node one step among its siblings. */
function shiftNode(root, id, delta) {
    const hit = findNode(root, id);
    if (!hit)
        return root;
    const to = hit.index + delta;
    if (to < 0 || to >= hit.siblings.length)
        return root;
    const next = (0, util_1.clone)(root);
    const h = findNode(next, id);
    const [n] = h.siblings.splice(h.index, 1);
    h.siblings.splice(to, 0, n);
    return next;
}
/** Update one prop by path ("heading", "items.1.title"). The value is validated against the schema. */
function setProp(root, id, path, value) {
    const hit = findNode(root, id);
    if (!hit)
        return { root, error: "Component not found" };
    const def = (0, registry_1.getComponent)(hit.node.type);
    if (!def)
        return { root, error: "Unknown component" };
    const field = (0, paths_1.fieldAtPath)(def.props, path);
    if (!field)
        return { root, error: `Unknown prop "${path}"` };
    const ctx = (0, document_1.makeCtx)();
    const clean = (0, document_1.coerceField)({ ...field, optional: true }, value, path, ctx);
    if (ctx.errors.length)
        return { root, error: ctx.errors[0].message };
    const next = (0, util_1.clone)(root);
    const h = findNode(next, id);
    if (!(0, paths_1.setByPath)(h.node.props, path, clean)) {
        // Top-level props that do not exist yet.
        if (!path.includes("."))
            h.node.props[path] = clean;
        else
            return { root, error: `Cannot set "${path}"` };
    }
    return { root: next };
}
/** Replace a whole list/strings prop (add/remove/reorder items from the inspector). */
exports.setPropValue = setProp;
/** Merge size/alignment changes. A null value removes that key. */
function setStyle(root, id, patch) {
    const hit = findNode(root, id);
    if (!hit)
        return root;
    const next = (0, util_1.clone)(root);
    const h = findNode(next, id);
    const merged = { ...(h.node.style ?? {}) };
    for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === undefined || v === "")
            delete merged[k];
        else
            merged[k] = v;
    }
    const ctx = (0, document_1.makeCtx)();
    const clean = (0, document_1.coerceStyle)(merged, "style", ctx);
    if (clean)
        h.node.style = clean;
    else
        delete h.node.style;
    return next;
}
