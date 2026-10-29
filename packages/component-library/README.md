# @cms/component-library

One shared package that defines **every component the builder can use**. The AI, the editor and the
renderer all read the same registry, so the AI can only ever produce what the editor can edit.

```
src/
  components/      54 components in 9 categories (one file per category)
  fields.ts        prop-schema DSL (drives validation, inspector UI and the AI catalog)
  registry.ts      collects all components
  document.ts      validateDocument(): strict on structure, lenient + auto-fix on cosmetics
  catalog.ts       builds the AI system prompt from the registry
  generate.ts      provider-agnostic generate -> validate -> repair loop
  render.ts        document -> HTML (Tailwind classes), static export
  ops.ts           pure editing ops: insert / move / remove / duplicate / setProp / setStyle
  editor/          bridge.ts (script injected in the canvas iframe), protocol.ts, palette.ts
  theme.ts         presets, fonts, radius -> CSS variables + Tailwind theme extension
  sample.ts        complete example site
```

## Set up

```bash
cd packages/component-library && npm install && npm test   # builds to dist/ and runs the tests
```

Add it to **both** `api/package.json` and `web/package.json` (no workspace restructuring needed):

```json
"dependencies": { "@cms/component-library": "file:../packages/component-library" }
```

then `npm install` in each. Rebuild the library (`npm run build`) after changing it.
Next.js: add `transpilePackages: ["@cms/component-library"]` to `next.config.ts` if you import it from client code.

## Add a component

Create a definition in `src/components/<category>.ts` with `defineComponent({...})` and add it to that
file's array. That is all: the palette, inspector schema, AI catalog, validation and export pick it up.
Rules: every Tailwind class must be a literal string (so the Tailwind CLI can find it), return ONE root
element, escape text with `esc()`, and mark editable text with `${ctx.e("propName")}`.
`npm test` renders every component in every mode and fails on broken output.

## Tailwind

Components use semantic colors (`bg-primary`, `text-fg`, `border-line`, `rounded-theme`) backed by CSS
variables, so a theme change restyles the whole site. Two ways to ship CSS:

* **Previews / editor:** `renderPage(doc, "/", { tailwind: "cdn" })` (default) injects the Tailwind Play CDN.
* **Production:** `renderPage(..., { tailwind: "none", css })` with CSS you compile once:

```js
// tailwind.config.js (build step of the deploy pipeline)
const { tailwindExtend } = require("@cms/component-library");
module.exports = { content: ["./out/**/*.html"], theme: { extend: tailwindExtend } };
```

## Editor integration (host page)

The canvas is an `<iframe>` whose document is `renderPage(doc, path, { mode: "edit" })`. It talks to your
editor page through `postMessage` (types in `editor/protocol.ts`). The host owns the document and applies
pure operations from `ops.ts`; after each change it sends the new HTML back with `set-html`.

```tsx
import { renderPage, renderRoot, getPalette, DRAG_MIME, validateDocument,
         createNode, insertNode, moveNode, removeNode, duplicateNode, shiftNode, setProp, setStyle,
         type BridgeToHost, type Node, type PageDocument } from "@cms/component-library";

// 1) mount
const [doc, setDoc] = useState<PageDocument>(initial);
const [pagePath] = useState("/");
const frame = useRef<HTMLIFrameElement>(null);
const history = useRef<{ past: PageDocument[]; future: PageDocument[] }>({ past: [], future: [] });

<iframe ref={frame} title="canvas" className="h-full w-full"
        srcDoc={renderPage(doc, pagePath, { mode: "edit" })}
        sandbox="allow-scripts" />   // NOTE: no allow-same-origin; the bridge only needs postMessage

// 2) apply changes (immutable root -> new root), keep history, re-render in place
function commit(mutate: (root: Node[]) => { root: Node[]; error?: string }) {
  const page = doc.pages.find(p => p.path === pagePath)!;
  const res = mutate(page.root);
  if (res.error) return toast(res.error);
  const next = { ...doc, pages: doc.pages.map(p => p.path === pagePath ? { ...p, root: res.root } : p) };
  history.current.past.push(doc); history.current.future = [];
  setDoc(next);
  frame.current?.contentWindow?.postMessage(
    { target: "cms-bridge", type: "set-html", html: renderRoot(next, pagePath, { mode: "edit" }) }, "*");
  scheduleAutosave(next);            // debounce 800ms -> PUT /api/documents/:slug
}

// 3) listen to the canvas
useEffect(() => {
  const onMsg = (e: MessageEvent<BridgeToHost>) => {
    if (e.source !== frame.current?.contentWindow || e.data?.source !== "cms-editor") return;
    const m = e.data;
    if (m.type === "edit")   commit(r => setProp(r, m.nodeId, m.path, m.value));
    if (m.type === "resize") commit(r => ({ root: setStyle(r, m.nodeId, m.style) }));
    if (m.type === "drop") {
      if (m.payload.kind === "new")  commit(r => insertNode(r, createNode(m.payload.type), m.parentId, m.index));
      if (m.payload.kind === "move") commit(r => moveNode(r, m.payload.id, m.parentId, m.index));
    }
    if (m.type === "action") {
      if (m.action === "delete")    commit(r => ({ root: removeNode(r, m.nodeId) }));
      if (m.action === "duplicate") commit(r => duplicateNode(r, m.nodeId));
      if (m.action === "move-up")   commit(r => ({ root: shiftNode(r, m.nodeId, -1) }));
      if (m.action === "move-down") commit(r => ({ root: shiftNode(r, m.nodeId, 1) }));
    }
    if (m.type === "key") undoOrRedo(m.key);
  };
  window.addEventListener("message", onMsg);
  return () => window.removeEventListener("message", onMsg);
}, [doc]);

// 4) palette (left panel) - generated from the registry
getPalette().map(group => group.items.map(item => (
  <div key={item.type} draggable
       onDragStart={e => {
         e.dataTransfer.setData(DRAG_MIME, JSON.stringify({ kind: "new", type: item.type }));
         frame.current?.contentWindow?.postMessage({ target: "cms-bridge", type: "drag-start", nodeType: item.type }, "*");
       }}
       onDragEnd={() => frame.current?.contentWindow?.postMessage({ target: "cms-bridge", type: "drag-end" }, "*")}>
    {item.label}
  </div>
)));
```

Inspector: fetch `GET /api/documents/components` (or import `describeComponents()`), look up the selected
node's `type`, and render one control per `props` field (`kind` is text | textarea | url | image | icon |
select | boolean | number | strings | list). Change values with `setProp(root, id, "path.to.prop", value)`.

## API contract (added in `api/`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/documents/components` | registry for palette / inspector |
| GET | `/api/documents/:slug` | latest document (404 `NO_DOCUMENT` for legacy HTML projects) |
| PUT | `/api/documents/:slug` | save `{ document, baseVersion?, label?, coalesce? }`; 422 with issues, 409 on version conflict |
| POST | `/api/documents/:slug/restore` | `{ versionNumber }` copy an old version forward |
| GET | `/api/documents/:slug/render?page=/about&mode=preview` | HTML for one page |
| GET | `/api/documents/:slug/export` | `{ files: { "index.html": "..." } }` for deployment |

`POST /api/generation` and `GET /api/generation/:jobId` keep their existing shape.
During generation, section-level components incorrectly returned inside a container are promoted
to page-root siblings before strict validation; other invalid document structures are still rejected
and sent through the repair loop.

The Next.js app proxies the component registry, document load/save and version restore through
`web/src/app/api/documents/`. Its project editor uses the library palette, inspector schema,
iframe bridge and immutable operations, then autosaves document changes as project versions.
