"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BRIDGE_SCRIPT = exports.EDITOR_CSS = void 0;
exports.EDITOR_CSS = String.raw `
[data-cms-edit] a,[data-cms-edit] button,[data-cms-edit] summary{cursor:default}
[data-cms-edit] input,[data-cms-edit] textarea,[data-cms-edit] select,[data-cms-edit] video,[data-cms-edit] iframe{pointer-events:none}
[data-cms-edit] [data-edit]:hover{outline:1px dashed rgba(59,130,246,.7);outline-offset:2px;cursor:text}
[data-cms-edit] [contenteditable]{outline:2px solid #3b82f6!important;outline-offset:2px;cursor:text;user-select:text;-webkit-user-select:text}
#cms-ov{position:absolute;left:0;top:0;width:0;height:0;z-index:2147483000;font:500 12px/1 system-ui,sans-serif}
#cms-ov *{box-sizing:border-box}
#cms-hover,#cms-sel,#cms-target{position:absolute;display:none;pointer-events:none}
#cms-hover{outline:1px dashed #3b82f6;outline-offset:-1px;background:rgba(59,130,246,.05)}
#cms-target{outline:2px dashed #3b82f6;outline-offset:-2px;background:rgba(59,130,246,.06)}
#cms-sel{outline:2px solid #3b82f6;outline-offset:-1px}
#cms-bar{position:absolute;left:-2px;top:-28px;height:26px;display:flex;align-items:center;gap:2px;padding:0 4px;background:#3b82f6;color:#fff;border-radius:6px 6px 0 0;pointer-events:auto;white-space:nowrap}
#cms-bar.below{top:auto;bottom:-28px;border-radius:0 0 6px 6px}
#cms-bar button,#cms-grip{all:unset;display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;border-radius:4px;cursor:pointer;color:#fff;font:600 12px system-ui,sans-serif}
#cms-bar button:hover,#cms-grip:hover{background:rgba(255,255,255,.25)}
#cms-grip{cursor:grab}
#cms-name{padding:0 6px;font-weight:600}
.cms-h{position:absolute;width:12px;height:12px;background:#fff;border:2px solid #3b82f6;border-radius:3px;pointer-events:auto;display:none}
.cms-h[data-h=nw]{left:-7px;top:-7px;cursor:nwse-resize}.cms-h[data-h=ne]{right:-7px;top:-7px;cursor:nesw-resize}
.cms-h[data-h=sw]{left:-7px;bottom:-7px;cursor:nesw-resize}.cms-h[data-h=se]{right:-7px;bottom:-7px;cursor:nwse-resize}
#cms-drop{position:absolute;display:none;pointer-events:none;background:#3b82f6;border-radius:2px;box-shadow:0 0 0 2px rgba(59,130,246,.3)}
.cms-dragging #cms-ov *{pointer-events:none!important}
#cms-size{position:absolute;right:0;bottom:-26px;padding:3px 6px;background:#0f172a;color:#fff;border-radius:4px;display:none;pointer-events:none;white-space:nowrap}
`;
exports.BRIDGE_SCRIPT = String.raw `
(function () {
  'use strict';
  var META = {};
  try { META = JSON.parse(document.getElementById('cms-meta').textContent || '{}'); } catch (e) {}
  var TYPES = META.types || {};
  var root = document.getElementById('cms-root');
  var selId = null, editEl = null, editId = null, editPath = null, editHTML = '', editOrig = '', multiline = false;
  var dragId = null, dragType = null, resizing = null, raf = 0;

  function post(m) { m.source = 'cms-editor'; window.parent.postMessage(m, '*'); }
  function nodeEl(id) { return id ? root.querySelector('[data-node-id="' + id + '"]') : null; }
  function nodeOf(t) { return t && t.closest ? t.closest('[data-node-id]') : null; }
  function $(id) { return document.getElementById(id); }

  // ---- overlay -----------------------------------------------------------
  var ov = document.createElement('div');
  ov.id = 'cms-ov';
  ov.innerHTML =
    '<div id="cms-hover"></div><div id="cms-target"></div>' +
    '<div id="cms-sel"><div id="cms-bar"><span id="cms-grip" draggable="true" title="Drag to move">⠿</span>' +
    '<span id="cms-name"></span>' +
    '<button data-act="parent" title="Select parent">↑</button>' +
    '<button data-act="move-up" title="Move up">▲</button>' +
    '<button data-act="move-down" title="Move down">▼</button>' +
    '<button data-act="duplicate" title="Duplicate">⧉</button>' +
    '<button data-act="delete" title="Delete">✕</button></div>' +
    '<i class="cms-h" data-h="nw"></i><i class="cms-h" data-h="ne"></i><i class="cms-h" data-h="sw"></i><i class="cms-h" data-h="se"></i>' +
    '<div id="cms-size"></div></div><div id="cms-drop"></div>';
  document.body.appendChild(ov);

  function rect(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + window.pageXOffset, y: r.top + window.pageYOffset, w: r.width, h: r.height };
  }
  function place(box, el) {
    var r = rect(el);
    box.style.display = 'block';
    box.style.left = r.x + 'px'; box.style.top = r.y + 'px';
    box.style.width = r.w + 'px'; box.style.height = r.h + 'px';
  }
  function refresh() {
    var s = $('cms-sel');
    var el = nodeEl(selId);
    if (!el) { s.style.display = 'none'; return; }
    place(s, el);
    var t = TYPES[el.getAttribute('data-type')] || {};
    $('cms-name').textContent = t.label || el.getAttribute('data-type');
    $('cms-bar').className = rect(el).y < 34 ? 'below' : '';
    var rs = el.getAttribute('data-resize') || '';
    var hs = s.querySelectorAll('.cms-h');
    for (var i = 0; i < hs.length; i++) hs[i].style.display = rs ? 'block' : 'none';
  }
  function schedule() { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; refresh(); }); }
  window.addEventListener('scroll', schedule, true);
  window.addEventListener('resize', schedule);
  try { new MutationObserver(schedule).observe(root, { childList: true, subtree: true, attributes: true, characterData: true }); } catch (e) {}
  try { new ResizeObserver(schedule).observe(document.body); } catch (e) {}

  function select(id, silent) {
    if (editEl) commitEdit();
    selId = id || null;
    refresh();
    if (!silent) {
      var el = nodeEl(selId);
      post({ type: 'select', nodeId: selId, nodeType: el ? el.getAttribute('data-type') : null });
    }
  }

  // ---- click / hover -----------------------------------------------------
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('#cms-ov')) return;
    if (editEl && editEl.contains(e.target)) return;
    e.preventDefault(); e.stopPropagation();
    var n = nodeOf(e.target);
    select(n ? n.getAttribute('data-node-id') : null);
  }, true);

  document.addEventListener('submit', function (e) { e.preventDefault(); }, true);

  document.addEventListener('mouseover', function (e) {
    var h = $('cms-hover');
    if (dragId || resizing || editEl || (e.target.closest && e.target.closest('#cms-ov'))) { h.style.display = 'none'; return; }
    var n = nodeOf(e.target);
    if (!n || n.getAttribute('data-node-id') === selId) { h.style.display = 'none'; return; }
    place(h, n);
  });
  document.addEventListener('mouseleave', function () { $('cms-hover').style.display = 'none'; });

  ov.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!b || !selId) return;
    e.stopPropagation();
    act(b.getAttribute('data-act'));
  });
  function act(name) {
    if (name === 'parent') {
      var el = nodeEl(selId);
      var p = el && el.parentElement ? nodeOf(el.parentElement) : null;
      if (p) select(p.getAttribute('data-node-id'));
      return;
    }
    post({ type: 'action', action: name, nodeId: selId });
  }

  // ---- inline text editing -------------------------------------------------
  function readText(el) {
    var t = (el.innerText || el.textContent || '').replace(/ /g, ' ');
    t = t.replace(/\n+$/, '');
    if (!multiline) t = t.replace(/\s*\n\s*/g, ' ');
    return t.trim();
  }
  document.addEventListener('dblclick', function (e) {
    if (e.target.closest && e.target.closest('#cms-ov')) return;
    var t = e.target.closest ? e.target.closest('[data-edit]') : null;
    if (!t) return;
    e.preventDefault();
    var n = nodeOf(t);
    if (n) select(n.getAttribute('data-node-id'));
    startEdit(t, n ? n.getAttribute('data-node-id') : null);
  }, true);

  function startEdit(el, id) {
    if (editEl) commitEdit();
    editEl = el; editId = id;
    editPath = el.getAttribute('data-edit');
    multiline = el.hasAttribute('data-multiline');
    editHTML = el.innerHTML;
    editOrig = readText(el);
    try { el.contentEditable = 'plaintext-only'; } catch (err) {}
    if (el.contentEditable !== 'plaintext-only') el.contentEditable = 'true';
    el.addEventListener('paste', onPaste);
    el.addEventListener('blur', onBlur);
    el.focus();
    try {
      var r = document.createRange(); r.selectNodeContents(el);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    } catch (err2) {}
    $('cms-hover').style.display = 'none';
  }
  function onPaste(e) {
    e.preventDefault();
    var t = (e.clipboardData || window.clipboardData).getData('text/plain');
    if (!multiline) t = t.replace(/\s*\n\s*/g, ' ');
    document.execCommand('insertText', false, t);
  }
  function onBlur() { commitEdit(); }
  function finishEdit() {
    var el = editEl;
    el.removeEventListener('paste', onPaste);
    el.removeEventListener('blur', onBlur);
    el.removeAttribute('contenteditable');
    editEl = null;
    return el;
  }
  function commitEdit() {
    if (!editEl) return;
    var v = readText(editEl);
    var id = editId, path = editPath, orig = editOrig, html = editHTML;
    var el = finishEdit();
    if (v !== orig) post({ type: 'edit', nodeId: id, path: path, value: v });
    else el.innerHTML = html;
    var sel = window.getSelection(); if (sel) sel.removeAllRanges();
    schedule();
  }
  function cancelEdit() {
    if (!editEl) return;
    var html = editHTML;
    var el = finishEdit();
    el.innerHTML = html;
    schedule();
  }

  // ---- resize ----------------------------------------------------------------
  $('cms-sel').addEventListener('pointerdown', function (e) {
    var h = e.target.closest ? e.target.closest('.cms-h') : null;
    if (!h) return;
    var el = nodeEl(selId);
    if (!el) return;
    e.preventDefault(); e.stopPropagation();
    var mode = el.getAttribute('data-resize') || '';
    var fixed = el.getAttribute('data-hmode') === 'fixed';
    var r = el.getBoundingClientRect();
    var parent = el.parentElement;
    var cs = getComputedStyle(parent);
    var pr = parent.getBoundingClientRect();
    var pw = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var centered = pw > r.width + 6 && Math.abs((r.left - pr.left) - (pw - r.width) / 2) < pw * 0.1 + 4;
    resizing = {
      el: el, dir: h.getAttribute('data-h'), mode: mode, fixed: fixed,
      x: e.clientX, y: e.clientY, w: r.width, h: r.height, pw: pw, centered: centered,
      outW: null, outH: null
    };
    try { h.setPointerCapture(e.pointerId); } catch (err) {}
    $('cms-hover').style.display = 'none';
  });
  document.addEventListener('pointermove', function (e) {
    if (!resizing) return;
    var s = resizing;
    var sx = s.dir.indexOf('w') >= 0 ? -1 : 1;
    var sy = s.dir.indexOf('n') >= 0 ? -1 : 1;
    var dx = (e.clientX - s.x) * sx * (s.centered ? 2 : 1);
    var dy = (e.clientY - s.y) * sy;
    var nw = Math.max(40, s.w + dx), nh = Math.max(24, s.h + dy);
    if (e.shiftKey && s.mode.indexOf('w') >= 0 && s.mode.indexOf('h') >= 0) {
      var ratio = s.w / s.h;
      if (Math.abs(dx) / s.w > Math.abs(dy) / s.h) nh = nw / ratio; else nw = nh * ratio;
    }
    var label = [];
    if (s.mode.indexOf('w') >= 0) {
      var pct = Math.min(100, Math.max(5, Math.round(nw / s.pw * 1000) / 10));
      s.outW = pct + '%';
      s.el.style.width = s.outW; s.el.style.maxWidth = '100%';
      label.push(pct + '%');
    }
    if (s.mode.indexOf('h') >= 0) {
      s.outH = Math.round(nh) + 'px';
      if (s.fixed) s.el.style.height = s.outH; else s.el.style.minHeight = s.outH;
      label.push(s.outH);
    }
    var tip = $('cms-size'); tip.style.display = 'block'; tip.textContent = label.join(' × ');
    refresh();
  });
  document.addEventListener('pointerup', function () {
    if (!resizing) return;
    var s = resizing; resizing = null;
    $('cms-size').style.display = 'none';
    var style = {};
    if (s.outW) style.width = s.outW;
    if (s.outH) style.height = s.outH;
    if (s.outW || s.outH) post({ type: 'resize', nodeId: selId, style: style });
  });
  $('cms-sel').addEventListener('dblclick', function (e) {
    if (e.target.closest && e.target.closest('.cms-h')) {
      e.stopPropagation();
      post({ type: 'resize', nodeId: selId, style: { width: null, height: null } });
    }
  });

  // ---- drag & drop ----------------------------------------------------------
  function isCms(e) {
    var t = e.dataTransfer && e.dataTransfer.types;
    return !!t && Array.prototype.indexOf.call(t, 'application/x-cms') >= 0;
  }
  $('cms-grip').addEventListener('dragstart', function (e) {
    var el = nodeEl(selId);
    if (!el) { e.preventDefault(); return; }
    dragId = selId; dragType = el.getAttribute('data-type');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/x-cms', JSON.stringify({ kind: 'move', id: dragId }));
    e.dataTransfer.setData('text/plain', 'cms-move');
    try { e.dataTransfer.setDragImage(el, 12, 12); } catch (err) {}
    setTimeout(function () { document.documentElement.classList.add('cms-dragging'); }, 0);
  });
  $('cms-grip').addEventListener('dragend', endDrag);
  function endDrag() {
    dragId = null; dragType = null;
    document.documentElement.classList.remove('cms-dragging');
    $('cms-drop').style.display = 'none';
    $('cms-target').style.display = 'none';
  }
  function accepts(containerType, childType) {
    if (!containerType) return true;
    var C = TYPES[containerType]; var ch = childType ? TYPES[childType] : null;
    if (!C || !C.accepts) return false;
    if (!ch) return true;
    if (C.accepts === 'blocks') return ch.level === 'block';
    return C.accepts.indexOf(childType) >= 0;
  }
  function childNodes(holder, skipId) {
    var out = [], all = holder.querySelectorAll('[data-node-id]');
    for (var i = 0; i < all.length; i++) {
      var a = all[i];
      if (skipId && a.getAttribute('data-node-id') === skipId) continue;
      var pn = a.parentElement ? a.parentElement.closest('[data-node-id]') : null;
      if (holder === root ? !pn : pn === holder) out.push(a);
    }
    return out;
  }
  function dropTarget(e) {
    var el = document.elementFromPoint(e.clientX, e.clientY);
    var cand = nodeOf(el);
    var moving = dragId ? nodeEl(dragId) : null;
    while (cand) {
      var bad = moving && (cand === moving || moving.contains(cand));
      if (!bad && cand.hasAttribute('data-accepts') && accepts(cand.getAttribute('data-type'), dragType)) break;
      cand = cand.parentElement ? nodeOf(cand.parentElement) : null;
    }
    var holder = cand || root;
    var kids = childNodes(holder, dragId);
    var idx = 0, line;
    if (!kids.length) {
      var hr = rect(holder);
      line = { x: hr.x + 8, y: hr.y + 8, w: Math.max(0, hr.w - 16), h: 4 };
    } else {
      var best = 0, bestD = 1e12;
      for (var i = 0; i < kids.length; i++) {
        var b = kids[i].getBoundingClientRect();
        var dx = e.clientX < b.left ? b.left - e.clientX : (e.clientX > b.right ? e.clientX - b.right : 0);
        var dy = e.clientY < b.top ? b.top - e.clientY : (e.clientY > b.bottom ? e.clientY - b.bottom : 0);
        var d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = i; }
      }
      var bb = kids[best].getBoundingClientRect();
      var rowish = false;
      for (var j = 0; j < kids.length; j++) {
        if (j !== best && Math.abs(kids[j].getBoundingClientRect().top - bb.top) < 6) { rowish = true; break; }
      }
      var cx = bb.left + bb.width / 2, cy = bb.top + bb.height / 2;
      var horizontal = rowish && Math.abs((e.clientX - cx) / bb.width) > Math.abs((e.clientY - cy) / bb.height);
      var before = horizontal ? e.clientX < cx : e.clientY < cy;
      idx = best + (before ? 0 : 1);
      var sx = window.pageXOffset, sy = window.pageYOffset;
      if (horizontal) line = { x: (before ? bb.left : bb.right) + sx - 2, y: bb.top + sy, w: 4, h: bb.height };
      else line = { x: bb.left + sx, y: (before ? bb.top : bb.bottom) + sy - 2, w: bb.width, h: 4 };
    }
    return { parentId: cand ? cand.getAttribute('data-node-id') : null, index: idx, line: line, holder: holder };
  }
  function showDrop(t) {
    var d = $('cms-drop'), tg = $('cms-target');
    if (!t) { d.style.display = 'none'; tg.style.display = 'none'; return; }
    d.style.display = 'block';
    d.style.left = t.line.x + 'px'; d.style.top = t.line.y + 'px';
    d.style.width = t.line.w + 'px'; d.style.height = t.line.h + 'px';
    if (t.holder !== root) place(tg, t.holder); else tg.style.display = 'none';
  }
  document.addEventListener('dragover', function (e) {
    if (!isCms(e)) return;
    e.preventDefault();
    var t = dropTarget(e);
    showDrop(t);
    e.dataTransfer.dropEffect = dragId ? 'move' : 'copy';
  });
  document.addEventListener('dragleave', function (e) { if (!e.relatedTarget) showDrop(null); });
  document.addEventListener('drop', function (e) {
    if (!isCms(e)) return;
    e.preventDefault();
    var t = dropTarget(e);
    showDrop(null);
    var payload = null;
    try { payload = JSON.parse(e.dataTransfer.getData('application/x-cms')); } catch (err) {}
    if (!payload && dragId) payload = { kind: 'move', id: dragId };
    if (payload) post({ type: 'drop', payload: payload, parentId: t.parentId, index: t.index });
    endDrag();
  });

  // ---- keyboard --------------------------------------------------------------
  document.addEventListener('keydown', function (e) {
    if (editEl) {
      if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
      else if (e.key === 'Enter' && !e.shiftKey && !multiline) { e.preventDefault(); commitEdit(); }
      return;
    }
    var mod = e.metaKey || e.ctrlKey, k = String(e.key).toLowerCase();
    if (mod && k === 'z') { e.preventDefault(); post({ type: 'key', key: e.shiftKey ? 'redo' : 'undo' }); }
    else if (mod && k === 'y') { e.preventDefault(); post({ type: 'key', key: 'redo' }); }
    else if (!selId) return;
    else if (k === 'delete' || k === 'backspace') { e.preventDefault(); act('delete'); }
    else if (mod && k === 'd') { e.preventDefault(); act('duplicate'); }
    else if (k === 'escape') { select(null); }
  });

  // ---- messages from the host ------------------------------------------------
  window.addEventListener('message', function (e) {
    var m = e.data;
    if (!m || m.target !== 'cms-bridge' || e.source !== window.parent) return;
    if (m.type === 'set-html') {
      if (editEl) cancelEdit();
      root.innerHTML = m.html;
      if (m.selectId !== undefined) selId = m.selectId;
      refresh();
    } else if (m.type === 'select') {
      selId = m.nodeId || null; refresh();
      if (m.reveal) { var el = nodeEl(selId); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    } else if (m.type === 'drag-start') {
      dragType = m.nodeType || null;
    } else if (m.type === 'drag-end') {
      endDrag();
    }
  });

  post({ type: 'ready' });
})();
`;
