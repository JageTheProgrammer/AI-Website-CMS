"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import {
  DRAG_MIME,
  describeComponents,
  getPalette,
  insertNode,
  createNode,
  moveNode,
  removeNode,
  duplicateNode,
  shiftNode,
  setProp,
  setStyle,
  renderPage,
  renderRoot,
  type BridgeToHost,
  type Field,
  type Node,
  type PageDocument,
  type PropSchema,
} from "@cms/component-library";
import {
  Check,
  ChevronDown,
  CircleAlert,
  ImagePlus,
  Box,
  Layers,
  PanelBottom,
  PanelTop,
  LoaderCircle,
  Redo2,
  Save,
  Undo2,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type DocumentResponse = {
  data?: {
    document: PageDocument;
    versionNumber: number;
  };
  error?: { message?: string };
};

type Props = {
  slug: string;
  reloadKey: number;
  previewPath: string;
  onVersionChange: (version: number) => void;
  onRenderedHtml: (html: string, path: string) => void;
  onRegisterSaveHandler: (handler: () => Promise<boolean>) => void;
};

const palette = getPalette();
const componentDefinitions = describeComponents();

export default function DocumentEditor({
  slug,
  reloadKey,
  previewPath,
  onVersionChange,
  onRenderedHtml,
  onRegisterSaveHandler,
}: Props) {
  const [document, setDocument] = useState<PageDocument | null>(null);
  const [pagePath, setPagePath] = useState("/");
  const [canvasHtml, setCanvasHtml] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">(
    "saved",
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const frameRef = useRef<HTMLIFrameElement>(null);
  const documentRef = useRef<PageDocument | null>(null);
  const versionRef = useRef(0);
  const pendingRef = useRef<PageDocument | null>(null);
  const dirtyRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pastRef = useRef<PageDocument[]>([]);
  const futureRef = useRef<PageDocument[]>([]);
  const activeSaveRef = useRef<Promise<boolean> | null>(null);
  const saveDocumentRef = useRef<() => Promise<boolean>>(async () => true);

  const currentPage = document?.pages.find((page) => page.path === pagePath);
  const selectedNode = useMemo(
    () =>
      currentPage?.root
        ? findNode(currentPage.root, selectedId)
        : null,
    [currentPage, selectedId],
  );
  const selectedDefinition = selectedNode
    ? componentDefinitions.find((definition) => definition.type === selectedNode.type)
    : undefined;

  const postToCanvas = useCallback((message: Record<string, unknown>) => {
    frameRef.current?.contentWindow?.postMessage(
      { target: "cms-bridge", ...message },
      "*",
    );
  }, []);

  const renderDocument = useCallback(
    (doc: PageDocument, path: string) => {
      const routes = JSON.stringify(doc.pages.map((page) => page.path)).replace(/</g, "\\u003c");
      const navigationBridge =
        `<script>(function(){var routes=${routes};var current=${JSON.stringify(path)};var base="https://cms-preview.invalid"+(current==="/"?"/":current);document.addEventListener("click",function(event){var link=event.target.closest&&event.target.closest("a[href]");if(!link)return;var href=link.getAttribute("href");if(!href||href.charAt(0)==="#"||href.indexOf("//")===0)return;var url=new URL(href,base);if(url.origin!=="https://cms-preview.invalid"||!routes.includes(url.pathname)||url.pathname===current)return;event.preventDefault();parent.postMessage({target:"cms-preview",path:url.pathname},"*");});})();</script>`;
      const html = renderPage(doc, path, { mode: "preview", tailwind: "cdn" });
      onRenderedHtml(html.replace("</body>", `${navigationBridge}</body>`), path);
    },
    [onRenderedHtml],
  );

  useEffect(() => {
    saveDocumentRef.current = async () => {
      if (!slug) return false;
      if (activeSaveRef.current) {
        const saved = await activeSaveRef.current;
        if (saved && pendingRef.current) return saveDocumentRef.current();
        return saved;
      }

      const snapshot = pendingRef.current ?? documentRef.current;
      if (!snapshot || !dirtyRef.current) return true;

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }

      pendingRef.current = null;
      setSaveState("saving");
      setSaveError(null);

      const savePromise = (async () => {
        try {
          const response = await fetch(
            `/api/documents/${encodeURIComponent(slug)}`,
            {
              method: "PUT",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                document: snapshot,
                baseVersion: versionRef.current,
                coalesce: true,
              }),
            },
          );
          const result = (await response.json()) as DocumentResponse;

          if (!response.ok) {
            throw new Error(
              result.error?.message ?? "Could not save your document.",
            );
          }

          const version = result.data?.versionNumber;
          if (typeof version !== "number" || !Number.isSafeInteger(version)) {
            throw new Error("The server did not return a saved version number.");
          }

          versionRef.current = version;
          onVersionChange(version);
          if (documentRef.current === snapshot && !pendingRef.current) {
            dirtyRef.current = false;
            setIsDirty(false);
            setSaveState("saved");
          }
          return true;
        } catch (error) {
          pendingRef.current = snapshot;
          setSaveState("error");
          setSaveError(
            error instanceof Error
              ? error.message
              : "Could not save your document.",
          );
          return false;
        } finally {
          if (pendingRef.current && pendingRef.current !== snapshot) {
            saveTimerRef.current = setTimeout(
              () => void saveDocumentRef.current(),
              800,
            );
          }
        }
      })();
      activeSaveRef.current = savePromise;
      const saved = await savePromise;
      if (activeSaveRef.current === savePromise) activeSaveRef.current = null;
      if (saved && pendingRef.current) return saveDocumentRef.current();
      return saved;
    };
  }, [onVersionChange, slug]);

  useEffect(() => {
    onRegisterSaveHandler(() => saveDocumentRef.current());
  }, [onRegisterSaveHandler]);

  const queueSave = useCallback(
    (next: PageDocument) => {
      pendingRef.current = next;
      dirtyRef.current = true;
      setIsDirty(true);
      setSaveState("saving");
      setSaveError(null);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(
        () => void saveDocumentRef.current(),
        800,
      );
    },
    [],
  );

  const loadDocument = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setSaveError(null);
    setSaveState("saved");
    setDocument(null);
    documentRef.current = null;
    dirtyRef.current = false;
    pendingRef.current = null;
    pastRef.current = [];
    futureRef.current = [];
    setCanUndo(false);
    setCanRedo(false);
    setIsDirty(false);
    setSelectedId(null);

    try {
      const response = await fetch(
        `/api/documents/${encodeURIComponent(slug)}`,
        { credentials: "include", cache: "no-store" },
      );
      const result = (await response.json()) as DocumentResponse;

      if (!response.ok) {
        throw new Error(result.error?.message ?? "Could not load the document.");
      }

      if (!result.data?.document) {
        throw new Error("The API returned no editable document.");
      }

      const doc = result.data.document;
      documentRef.current = doc;
      versionRef.current = result.data.versionNumber;
      setDocument(doc);
      const path = doc.pages.some((page) => page.path === "/") ? "/" : doc.pages[0]?.path ?? "/";
      setPagePath(path);
      setCanvasHtml(renderPage(doc, path, { mode: "edit", tailwind: "cdn" }));
      onVersionChange(result.data.versionNumber);
      renderDocument(doc, path);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Could not load the document.",
      );
    } finally {
      setLoading(false);
    }
  }, [onVersionChange, renderDocument, slug]);

  useEffect(() => {
    void loadDocument();
  }, [loadDocument, reloadKey]);

  useEffect(() => {
    if (document?.pages.some((page) => page.path === previewPath) && previewPath !== pagePath) {
      setPagePath(previewPath);
      setSelectedId(null);
    }
  }, [document, pagePath, previewPath]);

  useEffect(
    () => () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!document || !currentPage) return;
    postToCanvas({
      type: "set-html",
      html: renderRoot(document, pagePath, { mode: "edit" }),
      selectId: selectedId,
    });
    renderDocument(document, pagePath);
  }, [currentPage, document, pagePath, postToCanvas, renderDocument, selectedId]);

  const commit = useCallback(
    (mutate: (root: Node[]) => { root: Node[]; error?: string }) => {
      const doc = documentRef.current;
      if (!doc) return;
      const page = doc.pages.find((item) => item.path === pagePath);
      if (!page) return;

      const result = mutate(page.root);
      if (result.error) {
        setSaveError(result.error);
        return;
      }

      const next = {
        ...doc,
        pages: doc.pages.map((item) =>
          item.path === pagePath ? { ...item, root: result.root } : item,
        ),
      };
      pastRef.current = [...pastRef.current.slice(-49), doc];
      futureRef.current = [];
      setCanUndo(true);
      setCanRedo(false);
      documentRef.current = next;
      setDocument(next);
      queueSave(next);
    },
    [pagePath, queueSave],
  );

  const undo = useCallback(() => {
    const previous = pastRef.current.pop();
    const current = documentRef.current;
    if (!previous || !current) return;
    futureRef.current = [...futureRef.current, current];
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(true);
    documentRef.current = previous;
    setDocument(previous);
    queueSave(previous);
  }, [queueSave]);

  const redo = useCallback(() => {
    const next = futureRef.current.pop();
    const current = documentRef.current;
    if (!next || !current) return;
    pastRef.current = [...pastRef.current, current];
    setCanUndo(true);
    setCanRedo(futureRef.current.length > 0);
    documentRef.current = next;
    setDocument(next);
    queueSave(next);
  }, [queueSave]);

  useEffect(() => {
    const onMessage = (event: MessageEvent<BridgeToHost>) => {
      if (event.source !== frameRef.current?.contentWindow) return;
      const message = event.data;
      if (!message || message.source !== "cms-editor") return;

      if (message.type === "ready") {
        const doc = documentRef.current;
        if (doc) {
          postToCanvas({
            type: "set-html",
            html: renderRoot(doc, pagePath, { mode: "edit" }),
            selectId: selectedId,
          });
        }
      } else if (message.type === "select") {
        setSelectedId(message.nodeId);
      } else if (message.type === "edit") {
        commit((root) => setProp(root, message.nodeId, message.path, message.value));
      } else if (message.type === "resize") {
        commit((root) => ({ root: setStyle(root, message.nodeId, message.style) }));
      } else if (message.type === "drop") {
        const payload = message.payload;
        if (payload.kind === "new") {
          commit((root) =>
            insertNode(root, createNode(payload.type), message.parentId, message.index),
          );
        } else if (payload.kind === "move") {
          commit((root) => moveNode(root, payload.id, message.parentId, message.index));
        }
      } else if (message.type === "action") {
        if (message.action === "delete") {
          commit((root) => ({ root: removeNode(root, message.nodeId) }));
          setSelectedId(null);
        } else if (message.action === "duplicate") {
          commit((root) => duplicateNode(root, message.nodeId));
        } else if (message.action === "move-up" || message.action === "move-down") {
          const delta = message.action === "move-up" ? -1 : 1;
          commit((root) => ({ root: shiftNode(root, message.nodeId, delta) }));
        }
      } else if (message.type === "key") {
        if (message.key === "undo") undo();
        else redo();
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [commit, pagePath, postToCanvas, redo, selectedId, undo]);

  const changeField = (path: string, value: unknown) => {
    if (!selectedId) return;
    commit((root) => setProp(root, selectedId, path, value));
  };

  const addPaletteItem = (type: string) => {
    commit((root) => insertNode(root, createNode(type), null));
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center gap-3 text-sm text-zinc-400">
        <LoaderCircle className="h-4 w-4 animate-spin text-indigo-300" />
        Loading editable document…
      </div>
    );
  }

  if (loadError || !document) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-lg rounded-2xl border border-white/[0.08] bg-[#0d0e12] p-6">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <CircleAlert className="h-4 w-4 text-amber-300" />
            Visual editor unavailable
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {loadError || "This project does not have an editable document yet."}
          </p>
          <p className="mt-2 text-xs leading-5 text-zinc-600">
            Generate a site with the prompt box below, then open Design again.
            Older HTML-only project versions cannot be edited with components.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[420px] overflow-hidden">
      <aside className="flex w-56 shrink-0 flex-col border-r border-white/[0.07] bg-[#0a0b0e] xl:w-64">
        <div className="border-b border-white/[0.07] px-4 py-3">
          <label htmlFor="editor-page" className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            Page
          </label>
          <div className="relative">
            <select
              id="editor-page"
              value={pagePath}
              onChange={(event) => {
                setSelectedId(null);
                setPagePath(event.target.value);
                setCanvasHtml(
                  renderPage(document, event.target.value, {
                    mode: "edit",
                    tailwind: "cdn",
                  }),
                );
              }}
              className="h-9 w-full appearance-none rounded-lg border border-white/[0.08] bg-[#111217] px-3 pr-8 text-xs text-zinc-200 outline-none focus:border-indigo-400/40"
            >
              {document.pages.map((page) => (
                <option key={page.path} value={page.path}>
                  {page.title || page.path}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <h2 className="mb-3 px-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Components
          </h2>
          <div className="space-y-4">
            {palette.map((group) => (
              <section key={group.category}>
                <h3 className="mb-1.5 px-1 text-[10px] font-medium text-zinc-600">
                  {group.label}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      draggable
                      onClick={() => addPaletteItem(item.type)}
                      onDragStart={(event) => {
                        event.dataTransfer.setData(
                          DRAG_MIME,
                          JSON.stringify({ kind: "new", type: item.type }),
                        );
                        event.dataTransfer.setData("text/plain", "cms-palette");
                        event.dataTransfer.effectAllowed = "copy";
                        postToCanvas({ type: "drag-start", nodeType: item.type });
                      }}
                      onDragEnd={() => postToCanvas({ type: "drag-end" })}
                      title={`${item.label}: ${item.description}`}
                      className="group w-full rounded-xl border border-white/[0.055] bg-white/[0.015] px-2.5 py-2.5 text-left text-zinc-300 transition hover:border-indigo-400/20 hover:bg-indigo-400/[0.05] hover:text-white"
                    >
                      <span className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.035] text-zinc-400 transition-colors group-hover:border-indigo-400/20 group-hover:bg-indigo-400/[0.08] group-hover:text-indigo-200">
                          {item.type === "navbar" ? (
                            <PanelTop className="h-4 w-4" />
                          ) : item.type === "footer" ? (
                            <PanelBottom className="h-4 w-4" />
                          ) : item.isContainer ? (
                            <Layers className="h-4 w-4" />
                          ) : (
                            <Box className="h-4 w-4" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-1">
                            <span className="truncate text-[11px] font-semibold text-zinc-200">
                              {item.label}
                            </span>
                            <span className="shrink-0 rounded border border-white/[0.06] px-1 py-0.5 text-[8px] uppercase tracking-wide text-zinc-600">
                              {item.level === "section" ? "Section" : "Block"}
                            </span>
                          </span>
                          <span className="mt-1 block line-clamp-2 text-[10px] leading-4 text-zinc-500">
                            {item.description}
                          </span>
                          <span className="mt-1 block font-mono text-[9px] text-zinc-700">
                            {item.type}
                          </span>
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col bg-[#101115]">
        <div className="flex min-h-11 shrink-0 items-center gap-2 border-b border-white/[0.07] px-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            aria-label="Undo"
            title="Undo"
            className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            aria-label="Redo"
            title="Redo"
            className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
          >
            <Redo2 className="h-4 w-4" />
          </Button>

          <span className="ml-1 flex items-center gap-1.5 text-[11px] text-zinc-500" aria-live="polite">
            {saveState === "saving" ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin text-indigo-300" />
            ) : saveState === "error" ? (
              <CircleAlert className="h-3.5 w-3.5 text-red-300" />
            ) : (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            )}
            {saveState === "saving" ? "Saving…" : saveState === "error" ? "Not saved" : "Saved"}
          </span>
          <Button
            type="button"
            size="sm"
            onClick={() => void saveDocumentRef.current()}
            disabled={saveState === "saving" || !isDirty}
            className="ml-auto h-8 gap-1.5 rounded-lg bg-indigo-500 px-2.5 text-[11px] text-white hover:bg-indigo-400"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        </div>

        {saveError && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-2 border-b border-red-400/10 bg-red-400/[0.06] px-3 py-2 text-[11px] text-red-200">
            <span>{saveError}</span>
            <button
              type="button"
              onClick={() => void loadDocument()}
              disabled={saveState === "saving"}
              className="shrink-0 underline underline-offset-2 hover:text-white disabled:opacity-50"
            >
              Discard edits &amp; reload
            </button>
          </div>
        )}

        <div className="flex min-h-0 flex-1 items-start justify-center overflow-auto p-3 sm:p-5">
          <iframe
            ref={frameRef}
            title={`${document.meta.title || "Website"} editor canvas`}
            srcDoc={canvasHtml}
            sandbox="allow-scripts"
            className={cn(
              "h-full min-h-[420px] w-full border-0 bg-white shadow-2xl",
              "max-w-full",
            )}
          />
        </div>
      </section>

      <aside className="w-64 shrink-0 overflow-y-auto border-l border-white/[0.07] bg-[#0a0b0e] xl:w-72">
        <div className="border-b border-white/[0.07] px-4 py-3">
          <h2 className="text-xs font-semibold text-zinc-200">Inspector</h2>
          <p className="mt-1 truncate text-[10px] text-zinc-500">
            {selectedNode?.type ?? "Select a component"}
          </p>
        </div>
        {selectedNode && selectedDefinition ? (
          <div className="space-y-4 p-4">
            {Object.entries(selectedDefinition.props).map(([name, field]) => (
              <InspectorField
                key={`${selectedNode.id}-${name}`}
                field={field}
                name={name}
                value={selectedNode.props[name]}
                onChange={(value) => changeField(name, value)}
              />
            ))}
            {selectedDefinition.resize && (
              <div className="space-y-3 border-t border-white/[0.07] pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  Size
                </p>
                {(["width", "height"] as const)
                  .filter((key) => selectedDefinition.resize?.[key])
                  .map((key) => (
                    <label key={key} className="block text-[11px] text-zinc-400">
                      {key === "width" ? "Width" : "Height"}
                      <input
                        type="text"
                        value={selectedNode.style?.[key] ?? ""}
                        placeholder={key === "width" ? "Auto" : "Auto"}
                        onChange={(event) =>
                          commit((root) => ({
                            root: setStyle(root, selectedNode.id, {
                              [key]: event.target.value || null,
                            }),
                          }))
                        }
                        className="mt-1.5 h-8 w-full rounded-md border border-white/[0.08] bg-[#111217] px-2 text-xs text-zinc-200 outline-none focus:border-indigo-400/40"
                      />
                    </label>
                  ))}
              </div>
            )}
          </div>
        ) : (
          <p className="p-4 text-xs leading-5 text-zinc-600">
            Select an item on the canvas to edit its content and settings.
          </p>
        )}
      </aside>
    </div>
  );
}

function InspectorField({
  field,
  name,
  value,
  onChange,
}: {
  field: Field;
  name: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const id = `inspector-${name}`;
  const label = (
    <label htmlFor={id} className="mb-1.5 block text-[11px] font-medium text-zinc-400">
      {field.label}
    </label>
  );
  const inputClass =
    "w-full rounded-md border border-white/[0.08] bg-[#111217] px-2.5 text-xs text-zinc-200 outline-none focus:border-indigo-400/40";

  if (field.kind === "boolean") {
    return (
      <label className="flex items-center justify-between gap-3 text-[11px] text-zinc-400">
        {field.label}
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="accent-indigo-400"
        />
      </label>
    );
  }

  if (field.kind === "select" || field.kind === "icon") {
    const options = field.kind === "select" ? field.options : [];
    return (
      <div>
        {label}
        {options.length > 0 ? (
          <select
            id={id}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
            className={cn(inputClass, "h-8")}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            type="text"
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
            className={cn(inputClass, "h-8")}
          />
        )}
      </div>
    );
  }

  if (field.kind === "strings") {
    const values = Array.isArray(value) ? value.map(String) : [];
    return (
      <div>
        {label}
        <textarea
          id={id}
          rows={Math.min(6, Math.max(2, values.length))}
          value={values.join("\n")}
          onChange={(event) =>
            onChange(event.target.value.split("\n").slice(0, field.max))
          }
          className={cn(inputClass, "py-2")}
          placeholder="One item per line"
        />
      </div>
    );
  }

  if (field.kind === "list") {
    const values = Array.isArray(value) ? value as Record<string, unknown>[] : [];
    return (
      <div className="space-y-2">
        {label}
        {values.map((item, index) => (
          <div key={`${id}-${index}`} className="space-y-2 rounded-lg border border-white/[0.07] p-2">
            {Object.entries(field.item).map(([key, childField]) => (
              <InspectorField
                key={`${id}-${index}-${key}`}
                field={childField}
                name={`${name}-${index}-${key}`}
                value={item[key]}
                onChange={(nextValue) => {
                  const next = values.map((entry) => ({ ...entry }));
                  next[index][key] = nextValue;
                  onChange(next);
                }}
              />
            ))}
            <button
              type="button"
              disabled={values.length <= field.min}
              onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
              className="text-[10px] text-red-300 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Remove item
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={values.length >= field.max}
          onClick={() => onChange([...values, defaultListItem(field.item)])}
          className="text-[10px] text-indigo-300 hover:text-indigo-200 disabled:opacity-40"
        >
          Add item
        </button>
      </div>
    );
  }

  if (field.kind === "number") {
    return (
      <div>
        {label}
        <input
          id={id}
          type="number"
          min={field.min}
          max={field.max}
          value={typeof value === "number" ? value : field.default}
          onChange={(event) => {
            if (event.target.value !== "") onChange(Number(event.target.value));
          }}
          className={cn(inputClass, "h-8")}
        />
      </div>
    );
  }

  if (field.kind === "image") {
    return (
      <div className="space-y-2">
        {label}
        <input
          id={id}
          type="url"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputClass, "h-8")}
          placeholder="https://…"
        />
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-white/[0.12] px-3 py-2 text-[11px] text-zinc-300 transition hover:border-indigo-400/40 hover:bg-indigo-400/[0.05]">
          <ImagePlus className="h-3.5 w-3.5" />
          {uploading ? "Reading image…" : "Choose image from computer"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            disabled={uploading}
            className="sr-only"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              setUploadError(null);
              if (!file) return;
              if (file.size > 1_000_000) {
                setUploadError("Choose an image smaller than 1 MB.");
                return;
              }
              if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) {
                setUploadError("Use a PNG, JPEG, WebP, or GIF image.");
                return;
              }
              setUploading(true);
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result !== "string" || reader.result.length > 1_500_000) {
                  setUploadError("This image is too large to store in the document.");
                } else {
                  onChange(reader.result);
                }
                setUploading(false);
              };
              reader.onerror = () => {
                setUploadError("Could not read this image file.");
                setUploading(false);
              };
              reader.readAsDataURL(file);
            }}
          />
        </label>
        {typeof value === "string" && value.startsWith("data:image/") && (
          <Image
            src={value}
            alt="Selected image preview"
            width={448}
            height={112}
            unoptimized
            className="max-h-28 w-full rounded-md border border-white/[0.08] object-cover"
          />
        )}
        {uploadError && <p role="alert" className="text-[10px] text-red-300">{uploadError}</p>}
        <p className="text-[10px] leading-4 text-zinc-600">
          Uploaded images are stored with this project (max 1 MB each).
        </p>
      </div>
    );
  }

  const isMultiline = field.kind === "textarea";
  const inputType = field.kind === "url" ? "url" : "text";
  return (
    <div>
      {label}
      {isMultiline ? (
        <textarea
          id={id}
          rows={3}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputClass, "py-2")}
        />
      ) : (
        <input
          id={id}
          type={inputType}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputClass, "h-8")}
        />
      )}
    </div>
  );
}

function defaultListItem(schema: PropSchema): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(schema).map(([key, field]) => [
      key,
      field.kind === "list" ? [] : field.default,
    ]),
  );
}

function findNode(root: Node[], id: string | null): Node | null {
  if (!id) return null;
  for (const node of root) {
    if (node.id === id) return node;
    const child = node.children && findNode(node.children, id);
    if (child) return child;
  }
  return null;
}
