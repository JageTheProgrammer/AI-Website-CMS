/**
 * postMessage protocol between the editor page (host) and the canvas iframe (bridge).
 * Always check `event.source === iframe.contentWindow` before trusting a message.
 */
import type { NodeStyle } from "../types";

/** Messages the canvas sends to the host. */
export type BridgeToHost =
  | { source: "cms-editor"; type: "ready" }
  | { source: "cms-editor"; type: "select"; nodeId: string | null; nodeType: string | null }
  | { source: "cms-editor"; type: "edit"; nodeId: string; path: string; value: string }
  | { source: "cms-editor"; type: "resize"; nodeId: string; style: { width?: string | null; height?: string | null } }
  | {
      source: "cms-editor";
      type: "drop";
      payload: DragPayload;
      /** null = page root */
      parentId: string | null;
      index: number;
    }
  | {
      source: "cms-editor";
      type: "action";
      action: "delete" | "duplicate" | "move-up" | "move-down";
      nodeId: string;
    }
  | { source: "cms-editor"; type: "key"; key: "undo" | "redo" };

/** What a drag carries (set as "application/x-cms" JSON on dataTransfer). */
export type DragPayload =
  | { kind: "new"; type: string }
  | { kind: "move"; id: string }
  | { kind: "template"; node: unknown };

/** Messages the host sends to the canvas (always include target: "cms-bridge"). */
export type HostToBridge =
  | { target: "cms-bridge"; type: "set-html"; html: string; selectId?: string | null }
  | { target: "cms-bridge"; type: "select"; nodeId: string | null; reveal?: boolean }
  | { target: "cms-bridge"; type: "drag-start"; nodeType: string }
  | { target: "cms-bridge"; type: "drag-end" };

export const DRAG_MIME = "application/x-cms";

export type { NodeStyle };
