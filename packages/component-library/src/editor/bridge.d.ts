/**
 * Editor bridge: a small script injected into the edit-mode page (inside the preview iframe).
 * It turns the rendered page into an editable canvas:
 *   - click to select, hover outline
 *   - double-click any text with data-edit to edit it in place
 *   - corner handles to resize (width in %, height in px)
 *   - drag the grip (or drop from the palette) to place components
 *   - keyboard: Delete, Cmd/Ctrl+D, Cmd/Ctrl+Z / Shift+Z, Escape
 * It never mutates the document itself: it posts messages to the host (see protocol.ts)
 * and the host applies pure operations (ops.ts), then sends back fresh HTML.
 *
 * NOTE: this file contains plain ES5 JavaScript inside String.raw. Do not use backticks or ${} in it.
 */
export declare const EDITOR_CSS: string;
export declare const BRIDGE_SCRIPT: string;
