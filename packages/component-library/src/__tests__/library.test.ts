import { test } from "node:test";
import assert from "node:assert/strict";
import {
  registry,
  listComponents,
  validateDocument,
  renderPage,
  renderRoot,
  exportSite,
  createNode,
  insertNode,
  moveNode,
  removeNode,
  duplicateNode,
  setProp,
  setStyle,
  canDrop,
  findNode,
  buildCatalog,
  buildSystemPrompt,
  generateDocument,
  extractJson,
  sampleSite,
  getPalette,
  previewDocument,
  defaultProps,
  coerceField,
  type Node,
  type PageDocument,
  type Field,
} from "../index";

const docWith = (root: Node[]): PageDocument => ({
  version: 1,
  meta: { title: "T", description: "", language: "en" },
  theme: {},
  pages: [{ path: "/", title: "T", root }],
});
const wrap = (n: Node): Node[] => (registry.get(n.type)!.level === "section" ? [n] : [{ ...createNode("section"), children: [n] }]);

test("library has a large, well-formed registry", () => {
  assert.ok(registry.size >= 50, `only ${registry.size} components`);
  for (const d of listComponents()) {
    assert.ok(d.label && d.description.length > 10, d.type);
    assert.ok(Object.keys(d.props).length > 0 || d.accepts, d.type);
  }
});

test("every component's defaults validate cleanly and render in all modes", () => {
  for (const d of listComponents()) {
    const node = createNode(d.type);
    const doc = docWith(wrap(node));
    const v = validateDocument(JSON.parse(JSON.stringify(doc)));
    assert.ok(v.ok, `${d.type}: ${JSON.stringify(v.errors)}`);
    assert.equal(
      v.warnings.filter((w) => !/wrapped/.test(w.message)).length,
      0,
      `${d.type} default props produce warnings: ${JSON.stringify(v.warnings)}`,
    );
    for (const mode of ["publish", "preview", "edit"] as const) {
      const html = renderRoot(v.document!, "/", { mode });
      assert.ok(html.length > 20, `${d.type}/${mode} empty`);
      assert.ok(!/undefined|NaN|\[object Object\]/.test(html), `${d.type}/${mode} leaks undefined/NaN`);
    }
  }
});

test("root tag of every component has no inline style (renderer owns it) and edit mode tags nodes", () => {
  for (const d of listComponents()) {
    const node = createNode(d.type);
    const html = renderRoot(docWith(wrap(node)), "/", { mode: "publish" });
    const firstTag = html.match(/^<[^>]+>/)![0];
    assert.ok(!/style=/.test(firstTag), `${d.type} root has style`);
    const edit = renderRoot(docWith(wrap(node)), "/", { mode: "edit" });
    assert.ok(edit.includes(`data-node-id="${node.id}"`), `${d.type} not tagged in edit mode`);
    assert.ok(!html.includes("data-node-id"), `${d.type} leaks editor attrs when published`);
  }
});

test("invalid select/props never produce 'undefined' output", () => {
  for (const d of listComponents()) {
    for (const [k, fld] of Object.entries(d.props)) {
      if (fld.kind !== "select") continue;
      const node = createNode(d.type, { [k]: "zzz-invalid" });
      const html = renderRoot(docWith(wrap(node)), "/", { mode: "publish" });
      assert.ok(!/undefined/.test(html), `${d.type}.${k}`);
    }
  }
});

test("text is HTML-escaped everywhere", () => {
  const evil = '<script>alert(1)</script>"\'';
  for (const d of listComponents()) {
    const props: Record<string, any> = {};
    for (const [k, fld] of Object.entries(d.props)) if (fld.kind === "text" || fld.kind === "textarea") props[k] = evil;
    const html = renderRoot(docWith(wrap(createNode(d.type, props))), "/", { mode: "publish" });
    assert.ok(!html.includes("<script>alert(1)"), `${d.type} did not escape`);
  }
});

test("validator: unknown type, nesting rules, sanitising", () => {
  let r = validateDocument({ pages: [{ path: "/", root: [{ type: "herro", props: {} }] }] });
  assert.equal(r.ok, false);
  assert.match(r.errors[0].message, /Unknown component type "herro"/);

  r = validateDocument({ pages: [{ path: "/", root: [{ type: "section", children: [{ type: "hero", props: {} }] }] }] });
  assert.equal(r.ok, false, "section inside section must be rejected");

  r = validateDocument({
    pages: [{ path: "about", root: [{ type: "heading", props: { text: "Hi", level: "H2", size: "huge" } }, { type: "button", props: { label: "Go", href: "javascript:alert(1)" } }] }],
  });
  assert.ok(r.ok, JSON.stringify(r.errors));
  const page = r.document!.pages[0];
  assert.equal(page.path, "/", "single page promoted to /");
  assert.equal(page.root[0].type, "section", "root blocks are wrapped");
  const [h, b] = page.root.map((s) => s.children![0]);
  assert.equal(h.props.level, "h2");
  assert.equal(h.props.size, "lg");
  assert.equal(b.props.href, "#", "javascript: URL removed");
  assert.ok(r.warnings.length >= 3);
});

test("validator: field coercion", () => {
  const ctx = { errors: [] as any[], warnings: [] as any[] };
  const text: Field = { kind: "text", label: "x", default: "d", max: 5 };
  assert.equal(coerceField(text, "abcdefgh", "p", ctx), "abcde");
  assert.equal(coerceField({ kind: "number", label: "n", default: 1, min: 0, max: 10 }, "99", "p", ctx), 10);
  assert.equal(coerceField({ kind: "icon", label: "i", default: "star" }, "nope", "p", ctx), "star");
  assert.equal(coerceField({ kind: "image", label: "i", default: "placeholder:x" }, "javascript:x", "p", ctx), "placeholder:x");
  assert.deepEqual(coerceField({ kind: "strings", label: "s", default: [], max: 2, maxItem: 3 }, ["abcd", "b", "c"], "p", ctx), ["abc", "b"]);
});

test("validator: ids unique, props on node tolerated, empty required list is an error", () => {
  const r = validateDocument({
    pages: [{ path: "/", root: [{ id: "a", type: "heading", text: "x" }, { id: "a", type: "faq", props: { items: [] } }] }],
  });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /at least 1/.test(e.message)));
});

test("sample site validates and renders every page", () => {
  const r = validateDocument(sampleSite);
  assert.ok(r.ok, JSON.stringify(r.errors));
  const files = exportSite(r.document!);
  assert.deepEqual(Object.keys(files).sort(), ["about/index.html", "index.html", "robots.txt"]);
  assert.match(files["index.html"], /<title>Northlight — Plan projects without the noise<\/title>/);
  assert.match(files["index.html"], /id="pricing"/);
  assert.ok(files["about/index.html"].includes('href="/about"'), "internal page link kept");
});

test("page-aware links", () => {
  const r = validateDocument(sampleSite);
  const html = renderPage(r.document!, "/about", { pageHref: (p) => `?page=${p}` });
  assert.ok(html.includes('href="?page=/"'));
});

test("ops: insert, wrap, move, duplicate, remove, setProp, setStyle", () => {
  let root: Node[] = [createNode("navbar"), createNode("hero")];
  // block at root gets wrapped
  let res = insertNode(root, createNode("heading"), null, 1);
  assert.equal(res.error, undefined);
  root = res.root;
  assert.equal(root[1].type, "section");
  assert.equal(root[1].children![0].type, "heading");

  // section cannot go into a section
  const sectionId = root[1].id;
  const bad = insertNode(root, createNode("hero"), sectionId);
  assert.ok(bad.error);

  // columns inside section, text inside columns
  root = insertNode(root, createNode("columns"), sectionId).root;
  const cols = root[1].children![1];
  root = insertNode(root, createNode("text"), cols.id).root;
  assert.equal(findNode(root, cols.id)!.node.children!.length, 1);

  // cannot move a container into itself
  assert.equal(moveNode(root, sectionId, cols.id).error !== undefined, true);

  // move heading to the end of the columns
  const headingId = root[1].children![0].id;
  const mv = moveNode(root, headingId, cols.id, 0);
  assert.equal(mv.error, undefined);
  assert.equal(findNode(mv.root, cols.id)!.node.children![0].id, headingId);

  // duplicate assigns new ids
  const dup = duplicateNode(root, root[0].id);
  assert.equal(dup.root.length, 4);
  assert.notEqual(dup.root[1].id, root[0].id);

  // inline edit
  const heroId = root[2 - 1 + 1]?.id ?? root[root.length - 1].id;
  void heroId;
  const hero = root.find((n) => n.type === "hero")!;
  const edited = setProp(root, hero.id, "heading", "x".repeat(500));
  assert.equal(edited.error, undefined);
  assert.equal(findNode(edited.root, hero.id)!.node.props.heading.length, 100, "clamped to schema max");
  assert.ok(setProp(root, hero.id, "nope", "x").error);

  const nav = root.find((n) => n.type === "navbar")!;
  const edited2 = setProp(root, nav.id, "links.0.label", "Docs");
  assert.equal(findNode(edited2.root, nav.id)!.node.props.links[0].label, "Docs");

  // style
  const styled = setStyle(root, hero.id, { width: "50%", height: "400px" });
  assert.deepEqual(findNode(styled, hero.id)!.node.style, { width: "50%", height: "400px" });
  const html = renderRoot(docWith(styled), "/", { mode: "publish" });
  assert.match(html, /style="width:50%;max-width:100%;min-height:400px;"/);
  assert.equal(findNode(setStyle(styled, hero.id, { width: null, height: null }), hero.id)!.node.style, undefined);
  assert.equal(findNode(setStyle(root, hero.id, { width: "javascript:1" as any }), hero.id)!.node.style, undefined);

  assert.equal(removeNode(root, hero.id).some((n) => n.id === hero.id), false);
  assert.equal(canDrop(root, null, "hero").ok, true);
});

test("palette and previews", () => {
  const groups = getPalette();
  assert.equal(groups.reduce((n, g) => n + g.items.length, 0), registry.size);
  for (const d of listComponents()) {
    const doc = previewDocument(d.type);
    assert.ok(validateDocument(doc).ok, d.type);
  }
});

test("catalog covers every component and stays a manageable size", () => {
  const cat = buildCatalog();
  for (const d of listComponents()) assert.ok(cat.includes(`### ${d.type} [`), d.type);
  const sys = buildSystemPrompt();
  console.log(`system prompt: ${sys.length} chars (~${Math.round(sys.length / 4)} tokens), ${registry.size} components`);
  assert.ok(sys.length < 90_000);
  assert.match(sys, /NEVER put a \[section\]-level component.*inside "children"/);
  assert.match(sys, /put each one next to the others in "root"/);
  assert.ok(buildCatalog({ types: ["hero"] }).length < 3000);
});

test("extractJson handles fences, chatter and braces inside strings", () => {
  assert.deepEqual(extractJson('Here you go:\n```json\n{"a":{"b":"}"}}\n```\nbye'), { a: { b: "}" } });
  assert.deepEqual(extractJson('text {"x":1} more'), { x: 1 });
  assert.equal(extractJson("no json"), null);
  assert.equal(extractJson('{"broken": '), null);
});

test("generateDocument repairs invalid output and gives up after max attempts", async () => {
  const calls: string[] = [];
  const good = JSON.stringify(sampleSite);
  const replies = ["not json at all", JSON.stringify({ pages: [{ path: "/", root: [{ type: "mystery" }] }] }), good];
  const res = await generateDocument({
    prompt: "a site",
    complete: async ({ prompt, history }) => {
      calls.push(prompt);
      assert.equal(history.length, (calls.length - 1) * 2);
      return replies[calls.length - 1];
    },
  });
  assert.equal(res.attempts, 3);
  assert.match(calls[1], /not a single valid JSON/);
  assert.match(calls[2], /Unknown component type "mystery"/);

  await assert.rejects(
    generateDocument({ prompt: "x", maxAttempts: 2, complete: async () => "nope" }),
    (e: any) => e.code === "INVALID_JSON",
  );
  await assert.rejects(
    generateDocument({ prompt: "x", maxAttempts: 1, complete: async () => JSON.stringify({ pages: [{ path: "/", root: [{ type: "zzz" }] }] }) }),
    (e: any) => e.code === "INVALID_DOCUMENT" && e.issues.length > 0,
  );
});

test("generateDocument repair prompt explains how to fix nested section components", async () => {
  const invalid = docWith([
    createNode("navbar"),
    {
      ...createNode("section"),
      children: [
        createNode("heading"),
        createNode("gallery"),
        { id: "mystery", type: "mystery", props: {} },
      ],
    },
  ]);
  const prompts: string[] = [];

  const result = await generateDocument({
    prompt: "a travel site",
    maxAttempts: 2,
    complete: async ({ prompt }) => {
      prompts.push(prompt);
      return prompts.length === 1 ? JSON.stringify(invalid) : JSON.stringify(sampleSite);
    },
  });

  assert.equal(result.attempts, 2);
  assert.match(prompts[1], /Unknown component type "mystery"/);
  assert.match(prompts[1], /Structural rule:/);
  assert.match(prompts[1], /Never nest a section-level component/);
  assert.match(prompts[1], /move it to the page's "root" array/);
});

test("generateDocument promotes invalid nested sections to page root", async () => {
  const nested = docWith([
    createNode("navbar"),
    {
      ...createNode("section"),
      children: [
        createNode("heading"),
        {
          ...createNode("section"),
          children: [createNode("features"), createNode("gallery")],
        },
        createNode("text"),
      ],
    },
    createNode("footer"),
  ]);
  let attempts = 0;

  const result = await generateDocument({
    prompt: "a travel site",
    maxAttempts: 1,
    complete: async () => {
      attempts++;
      return JSON.stringify(nested);
    },
  });

  const root = result.document.pages[0].root;
  assert.equal(attempts, 1);
  assert.deepEqual(root.map((node) => node.type), [
    "navbar",
    "section",
    "section",
    "features",
    "gallery",
    "footer",
  ]);
  assert.deepEqual(root[1].children?.map((node) => node.type), [
    "heading",
    "text",
  ]);
  assert.ok(result.warnings.some((warning) => /moved to the page root/.test(warning.message)));
});

test("editing flow sends the current document", async () => {
  const doc = validateDocument(sampleSite).document!;
  let seen = "";
  await generateDocument({
    prompt: "make the hero heading shorter",
    current: doc,
    complete: async ({ prompt }) => {
      seen = prompt;
      return JSON.stringify(doc);
    },
  });
  assert.match(seen, /CURRENT SITE DOCUMENT/);
  assert.match(seen, /make the hero heading shorter/);
});

test("default props are deep copies", () => {
  const def = registry.get("features")!;
  const a = defaultProps(def);
  a.items[0].title = "changed";
  assert.notEqual(defaultProps(def).items[0].title, "changed");
});
