"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCtx = exports.LIMITS = void 0;
exports.coerceField = coerceField;
exports.coerceStyle = coerceStyle;
exports.canContain = canContain;
exports.createSectionWrapper = createSectionWrapper;
exports.validateTheme = validateTheme;
exports.normalizePagePath = normalizePagePath;
exports.validateDocument = validateDocument;
exports.issuesToText = issuesToText;
const registry_1 = require("./registry");
const icons_1 = require("./icons");
const theme_1 = require("./theme");
const util_1 = require("./util");
exports.LIMITS = { pages: 12, nodesPerPage: 600, depth: 8 };
const warn = (c, path, message) => c.warnings.push({ path, message });
const fail = (c, path, message) => c.errors.push({ path, message });
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;
/** Coerce one value to a field. Returns the cleaned value; records issues on ctx. */
function coerceField(field, v, path, c) {
    const nil = v === undefined || v === null;
    switch (field.kind) {
        case "text":
        case "textarea": {
            if (nil || (typeof v === "string" && v.trim() === "")) {
                if (field.optional)
                    return "";
                if (nil)
                    warn(c, path, "missing; default used");
                else
                    warn(c, path, "empty; default used");
                return field.default;
            }
            if (typeof v === "number" || typeof v === "boolean")
                v = String(v);
            if (typeof v !== "string") {
                warn(c, path, "expected text; default used");
                return field.optional ? "" : field.default;
            }
            let s = v.replace(CONTROL, "").replace(/\r\n?/g, "\n");
            if (field.kind === "text")
                s = s.replace(/\s*\n\s*/g, " ");
            s = s.trim();
            if (field.format === "slug")
                s = (0, util_1.slugify)(s);
            if (s.length > field.max) {
                warn(c, path, `longer than ${field.max} characters; truncated`);
                s = s.slice(0, field.max).trimEnd();
            }
            return s;
        }
        case "url": {
            if (nil || v === "")
                return field.optional ? "" : field.default;
            const s = String(v).trim();
            if (!(0, util_1.isSafeUrl)(s)) {
                warn(c, path, `unsafe or invalid URL "${s.slice(0, 40)}"; replaced`);
                return field.optional ? "" : "#";
            }
            return s;
        }
        case "image": {
            if (nil || v === "")
                return field.optional ? "" : field.default;
            const s = String(v).trim();
            if (!(0, util_1.isSafeImage)(s)) {
                warn(c, path, "invalid image URL; placeholder used");
                return field.optional ? "" : field.default;
            }
            return s;
        }
        case "icon": {
            if (nil || v === "")
                return field.optional ? "" : field.default;
            const s = String(v).trim().toLowerCase();
            if (!(0, icons_1.hasIcon)(s)) {
                warn(c, path, `unknown icon "${s}"; default used`);
                return field.optional ? "" : field.default;
            }
            return s;
        }
        case "select": {
            if (nil)
                return field.default;
            const s = String(v).trim();
            const hit = field.options.find((o) => o === s) ?? field.options.find((o) => o.toLowerCase() === s.toLowerCase());
            if (!hit) {
                warn(c, path, `"${s}" is not one of ${field.options.join("|")}; default used`);
                return field.default;
            }
            return hit;
        }
        case "boolean": {
            if (typeof v === "boolean")
                return v;
            if (v === "true")
                return true;
            if (v === "false")
                return false;
            return nil ? field.default : !!v;
        }
        case "number": {
            const n = typeof v === "number" ? v : Number(v);
            if (nil || !Number.isFinite(n))
                return field.default;
            if (n < field.min || n > field.max)
                warn(c, path, `out of range ${field.min}-${field.max}; clamped`);
            return Math.min(field.max, Math.max(field.min, n));
        }
        case "strings": {
            if (nil)
                return field.optional ? [] : (0, util_1.clone)(field.default);
            let a = Array.isArray(v) ? v : typeof v === "string" ? [v] : null;
            if (!a) {
                warn(c, path, "expected a list of strings; default used");
                return (0, util_1.clone)(field.default);
            }
            a = a
                .filter((x) => typeof x === "string" || typeof x === "number")
                .map((x) => String(x).replace(CONTROL, "").trim().slice(0, field.maxItem));
            if (a.length > field.max) {
                warn(c, path, `more than ${field.max} items; extra dropped`);
                a = a.slice(0, field.max);
            }
            return a;
        }
        case "list": {
            if (nil)
                return field.optional ? [] : (0, util_1.clone)(field.default);
            if (!Array.isArray(v)) {
                warn(c, path, "expected a list; default used");
                return (0, util_1.clone)(field.default);
            }
            let items = v;
            if (items.length > field.max) {
                warn(c, path, `more than ${field.max} items; extra dropped`);
                items = items.slice(0, field.max);
            }
            const out = [];
            items.forEach((it, i) => {
                if (!it || typeof it !== "object" || Array.isArray(it)) {
                    warn(c, `${path}[${i}]`, "item is not an object; dropped");
                    return;
                }
                out.push(coerceProps(field.item, it, `${path}[${i}]`, c, true));
            });
            if (out.length < field.min)
                fail(c, path, `needs at least ${field.min} item(s)`);
            return out;
        }
    }
}
function coerceProps(schema, raw, path, c, quiet = false) {
    const out = {};
    for (const k of Object.keys(raw)) {
        if (!schema[k])
            warn(c, `${path}.${k}`, "unknown prop; dropped");
    }
    for (const [k, field] of Object.entries(schema)) {
        const sub = quiet && raw[k] === undefined ? { errors: c.errors, warnings: [] } : c;
        out[k] = coerceField(field, raw[k], `${path}.${k}`, sub);
    }
    return out;
}
const DIM = /^(auto|\d{1,4}(\.\d{1,2})?(px|%|rem|vh|vw))$/;
function coerceStyle(raw, path, c) {
    if (!raw || typeof raw !== "object")
        return undefined;
    const out = {};
    for (const k of ["width", "height", "maxWidth", "marginTop", "marginBottom"]) {
        const v = raw[k];
        if (v === undefined || v === null || v === "")
            continue;
        if (typeof v === "string" && DIM.test(v.trim()))
            out[k] = v.trim();
        else
            warn(c, `${path}.${k}`, "invalid size; dropped");
    }
    if (raw.align === "left" || raw.align === "center" || raw.align === "right")
        out.align = raw.align;
    return Object.keys(out).length ? out : undefined;
}
/** Can `child` be placed inside `parent` ("null" parent = page root)? */
function canContain(parentType, childType) {
    const child = (0, registry_1.getComponent)(childType);
    if (!child)
        return { ok: false, reason: `Unknown component "${childType}"` };
    if (parentType === null) {
        return child.level === "section"
            ? { ok: true }
            : { ok: true, reason: "will be wrapped in a section" };
    }
    const parent = (0, registry_1.getComponent)(parentType);
    if (!parent || !parent.accepts)
        return { ok: false, reason: `"${parentType}" cannot contain other components` };
    if (parent.accepts === "blocks") {
        return child.level === "block"
            ? { ok: true }
            : { ok: false, reason: `"${childType}" is a full-width section and cannot be nested inside "${parentType}"` };
    }
    return parent.accepts.includes(childType) ? { ok: true } : { ok: false, reason: `"${parentType}" does not accept "${childType}"` };
}
function suggest(type) {
    const t = type.toLowerCase();
    const hits = [...registry_1.registry.keys()].filter((k) => k.includes(t) || t.includes(k) || k.split("-")[0] === t.split("-")[0]).slice(0, 4);
    return hits.length ? ` Did you mean: ${hits.join(", ")}?` : "";
}
function createSectionWrapper(child) {
    const def = (0, registry_1.getComponent)("section");
    return { id: (0, util_1.uid)(), type: "section", props: { ...(0, registry_1.defaultProps)(def), spacing: "md" }, children: [child] };
}
function validateNode(raw, parentType, path, depth, st, c) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        fail(c, path, "node must be an object");
        return null;
    }
    if (depth > exports.LIMITS.depth) {
        fail(c, path, `nesting deeper than ${exports.LIMITS.depth}`);
        return null;
    }
    if (++st.count > exports.LIMITS.nodesPerPage) {
        if (st.count === exports.LIMITS.nodesPerPage + 1)
            fail(c, path, `more than ${exports.LIMITS.nodesPerPage} components on one page`);
        return null;
    }
    const type = typeof raw.type === "string" ? raw.type.trim() : "";
    const def = (0, registry_1.getComponent)(type);
    if (!def) {
        fail(c, `${path}.type`, `Unknown component type "${type}".${suggest(type)}`);
        return null;
    }
    const rel = canContain(parentType, type);
    if (!rel.ok) {
        fail(c, path, rel.reason);
        return null;
    }
    let id = typeof raw.id === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(raw.id) ? raw.id : "";
    if (!id || st.ids.has(id)) {
        if (id)
            warn(c, `${path}.id`, "duplicate id; regenerated");
        id = (0, util_1.uid)();
    }
    st.ids.add(id);
    // Tolerate props placed directly on the node.
    let rawProps = raw.props;
    if (rawProps === undefined) {
        const { id: _i, type: _t, children: _c, style: _s, ...rest } = raw;
        if (Object.keys(rest).length) {
            warn(c, path, "props were placed on the node itself; moved into props");
            rawProps = rest;
        }
    }
    const props = coerceProps(def.props, rawProps && typeof rawProps === "object" ? rawProps : {}, `${path}.props`, c);
    const node = { id, type, props };
    const style = coerceStyle(raw.style, `${path}.style`, c);
    if (style)
        node.style = style;
    if (def.accepts) {
        const kids = [];
        (Array.isArray(raw.children) ? raw.children : []).forEach((ch, i) => {
            const n = validateNode(ch, type, `${path}.children[${i}]`, depth + 1, st, c);
            if (n)
                kids.push(n);
        });
        node.children = kids;
    }
    else if (Array.isArray(raw.children) && raw.children.length) {
        warn(c, `${path}.children`, `"${type}" cannot have children; dropped`);
    }
    return node;
}
function validateTheme(raw, c, path = "theme") {
    const t = { ...theme_1.DEFAULT_THEME };
    if (!raw || typeof raw !== "object")
        return t;
    if (raw.preset !== undefined) {
        if (theme_1.THEME_PRESETS[raw.preset])
            t.preset = raw.preset;
        else
            warn(c, `${path}.preset`, `unknown preset "${raw.preset}"; using ${theme_1.DEFAULT_THEME.preset}`);
    }
    if (raw.mode === "light" || raw.mode === "dark")
        t.mode = raw.mode;
    for (const k of ["fontHeading", "fontBody"]) {
        if (raw[k] === undefined)
            continue;
        if (theme_1.FONTS[raw[k]])
            t[k] = raw[k];
        else
            warn(c, `${path}.${k}`, `unknown font "${raw[k]}"; using ${theme_1.DEFAULT_THEME[k]}`);
    }
    if (["none", "sm", "md", "lg", "xl"].includes(raw.radius))
        t.radius = raw.radius;
    if (raw.colors && typeof raw.colors === "object") {
        const colors = {};
        for (const [k, v] of Object.entries(raw.colors)) {
            if (theme_1.COLOR_TOKENS.includes(k) && typeof v === "string" && theme_1.HEX.test(v))
                colors[k] = v;
            else
                warn(c, `${path}.colors.${k}`, "invalid color override; dropped");
        }
        if (Object.keys(colors).length)
            t.colors = colors;
    }
    return t;
}
function normalizePagePath(p) {
    if (typeof p !== "string")
        return null;
    let s = p.trim().toLowerCase();
    if (!s.startsWith("/"))
        s = "/" + s;
    s = s.replace(/\/{2,}/g, "/");
    if (s.length > 1)
        s = s.replace(/\/+$/, "");
    return /^\/[a-z0-9\-_/]*$/.test(s) && s.length <= 80 ? s : null;
}
function validateDocument(input) {
    const c = { errors: [], warnings: [] };
    const raw = input;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return { ok: false, errors: [{ path: "", message: "document must be a JSON object" }], warnings: [] };
    }
    const meta = {
        title: typeof raw.meta?.title === "string" && raw.meta.title.trim() ? raw.meta.title.trim().slice(0, 70) : "Untitled site",
        description: typeof raw.meta?.description === "string" ? raw.meta.description.trim().slice(0, 200) : "",
        language: typeof raw.meta?.language === "string" && /^[a-z]{2}(-[A-Za-z]{2})?$/.test(raw.meta.language) ? raw.meta.language : "en",
    };
    const theme = validateTheme(raw.theme, c);
    if (!Array.isArray(raw.pages) || raw.pages.length === 0) {
        fail(c, "pages", "pages must be a non-empty array");
        return { ok: false, errors: c.errors, warnings: c.warnings };
    }
    if (raw.pages.length > exports.LIMITS.pages) {
        warn(c, "pages", `more than ${exports.LIMITS.pages} pages; extra dropped`);
    }
    const st = { ids: new Set(), count: 0 };
    const pages = [];
    const seen = new Set();
    raw.pages.slice(0, exports.LIMITS.pages).forEach((rp, pi) => {
        const pp = `pages[${pi}]`;
        if (!rp || typeof rp !== "object") {
            fail(c, pp, "page must be an object");
            return;
        }
        let path = normalizePagePath(rp.path);
        if (!path) {
            fail(c, `${pp}.path`, `invalid page path "${rp.path}" (use "/", "/about", "/our-services")`);
            return;
        }
        if (seen.has(path)) {
            fail(c, `${pp}.path`, `duplicate page path ${path}`);
            return;
        }
        seen.add(path);
        st.count = 0;
        const root = [];
        (Array.isArray(rp.root) ? rp.root : []).forEach((rn, i) => {
            const n = validateNode(rn, null, `${pp}.root[${i}]`, 1, st, c);
            if (!n)
                return;
            if ((0, registry_1.getComponent)(n.type).level === "block") {
                warn(c, `${pp}.root[${i}]`, `"${n.type}" is a block; wrapped in a section`);
                root.push(createSectionWrapper(n));
            }
            else
                root.push(n);
        });
        if (root.length === 0)
            fail(c, `${pp}.root`, "page has no components");
        pages.push({
            path,
            title: typeof rp.title === "string" && rp.title.trim() ? rp.title.trim().slice(0, 70) : meta.title,
            description: typeof rp.description === "string" ? rp.description.trim().slice(0, 200) : undefined,
            root,
        });
    });
    if (!c.errors.length && !pages.some((p) => p.path === "/")) {
        warn(c, "pages", 'no "/" page; first page promoted to "/"');
        pages[0].path = "/";
    }
    if (c.errors.length)
        return { ok: false, errors: c.errors, warnings: c.warnings };
    pages.sort((a, b) => (a.path === "/" ? -1 : b.path === "/" ? 1 : 0));
    return { ok: true, document: { version: 1, meta, theme, pages }, errors: [], warnings: c.warnings };
}
function issuesToText(issues, limit = 25) {
    return issues
        .slice(0, limit)
        .map((i) => `- ${i.path || "(root)"}: ${i.message}`)
        .join("\n");
}
const makeCtx = () => ({ errors: [], warnings: [] });
exports.makeCtx = makeCtx;
