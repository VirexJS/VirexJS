/**
 * Generate the HMR client script that's injected into HTML during dev mode.
 *
 * Features:
 * - WebSocket connection to HMR server with auto-reconnect
 * - CSS hot swap (no page reload needed)
 * - Smart page reload (fetch + swap body content)
 * - Error overlay with file/line info
 * - Dev widget (bottom-right status indicator)
 *
 * All DOM manipulation uses safe APIs (createElement, textContent).
 * No innerHTML — all content is programmatically constructed.
 */
export function generateHMRClientScript(hmrPort: number): string {
	return `(function() {
  "use strict";
  var ws, connected = false, reloadCount = 0, startTime = Date.now();
  var retryDelay = 100, maxRetryDelay = 5000;

  // ─── Dev Widget ─────────────────────────────────────────────
  function createDevWidget() {
    var widget = document.createElement("div");
    widget.id = "vrx-dev-widget";
    widget.style.cssText = "position:fixed;bottom:12px;right:12px;z-index:99998;font-family:system-ui,sans-serif;font-size:12px;";

    var badge = document.createElement("div");
    badge.id = "vrx-dev-badge";
    badge.style.cssText = "background:#111;color:#fff;padding:6px 12px;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);";

    var dot = document.createElement("span");
    dot.id = "vrx-dev-dot";
    dot.style.cssText = "width:8px;height:8px;border-radius:50%;background:#22c55e;";
    badge.appendChild(dot);

    var label = document.createElement("span");
    label.textContent = "VirexJS";
    badge.appendChild(label);

    var panel = document.createElement("div");
    panel.id = "vrx-dev-panel";
    panel.style.cssText = "display:none;background:#111;color:#d1d5db;padding:12px 16px;border-radius:8px;min-width:200px;box-shadow:0 2px 12px rgba(0,0,0,0.2);font-size:12px;line-height:1.8;position:absolute;bottom:40px;right:0;";

    badge.onclick = function() {
      panel.style.display = panel.style.display === "none" ? "block" : "none";
      updatePanel();
    };

    widget.appendChild(panel);
    widget.appendChild(badge);
    document.body.appendChild(widget);
  }

  function updatePanel() {
    var panel = document.getElementById("vrx-dev-panel");
    if (!panel || panel.style.display === "none") return;
    var uptime = Math.round((Date.now() - startTime) / 1000);
    // Clear and rebuild with safe DOM APIs
    while (panel.firstChild) panel.removeChild(panel.firstChild);

    var title = document.createElement("div");
    title.style.cssText = "margin-bottom:8px;font-weight:600;color:#fff;font-size:13px;";
    title.textContent = "VirexJS Dev";
    panel.appendChild(title);

    var items = [
      ["Status", connected ? "Connected" : "Disconnected", connected ? "#22c55e" : "#ef4444"],
      ["HMR Port", "${hmrPort}", "#d1d5db"],
      ["Reloads", String(reloadCount), "#d1d5db"],
      ["Session", uptime + "s", "#d1d5db"]
    ];
    items.forEach(function(item) {
      var row = document.createElement("div");
      row.textContent = item[0] + ": ";
      var val = document.createElement("span");
      val.style.color = item[2];
      val.textContent = item[1];
      row.appendChild(val);
      panel.appendChild(row);
    });

    var sep = document.createElement("div");
    sep.style.cssText = "margin-top:8px;border-top:1px solid #333;padding-top:8px;color:#9ca3af;";
    var l1 = document.createElement("div");
    l1.textContent = "CSS: hot swap";
    var l2 = document.createElement("div");
    l2.textContent = "Code: smart reload";
    sep.appendChild(l1);
    sep.appendChild(l2);
    panel.appendChild(sep);
  }

  function setWidgetStatus(isConnected) {
    connected = isConnected;
    var dot = document.getElementById("vrx-dev-dot");
    if (dot) dot.style.background = isConnected ? "#22c55e" : "#ef4444";
    updatePanel();
  }

  // ─── Smart Reload ──────────────────────────────────────────
  function smartReload() {
    reloadCount++;
    fetch(location.href)
      .then(function(res) { return res.text(); })
      .then(function(html) {
        var parser = new DOMParser();
        var newDoc = parser.parseFromString(html, "text/html");
        var newTitle = newDoc.querySelector("title");
        if (newTitle) document.title = newTitle.textContent || "";
        var newBody = newDoc.querySelector("body");
        if (newBody) {
          var widget = document.getElementById("vrx-dev-widget");
          document.body.replaceChildren();
          while (newBody.firstChild) {
            document.body.appendChild(newBody.firstChild);
          }
          if (widget) document.body.appendChild(widget);
          if (window.__vrx_boot) window.__vrx_boot();
          console.log("[VirexJS] Smart reload");
          updatePanel();
        }
      })
      .catch(function() { location.reload(); });
  }

  // ─── CSS Hot Swap ──────────────────────────────────────────
  function updateCSS(href) {
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      if (link.href && link.href.indexOf(href) !== -1) {
        var newLink = link.cloneNode();
        newLink.href = href + "?t=" + Date.now();
        link.parentNode.insertBefore(newLink, link.nextSibling);
        link.remove();
        console.log("[VirexJS] CSS hot swap");
        return;
      }
    }
  }

  // ─── Error Overlay ─────────────────────────────────────────
  function showErrorOverlay(message, file, line) {
    removeErrorOverlay();
    var overlay = document.createElement("div");
    overlay.id = "vrx-error-overlay";
    overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);color:#ff6b6b;font-family:monospace;font-size:14px;padding:32px;z-index:99999;overflow:auto;";

    var container = document.createElement("div");
    container.style.cssText = "max-width:700px;margin:0 auto;";

    var h2 = document.createElement("h2");
    h2.style.cssText = "color:#fff;font-size:18px;margin-bottom:8px;";
    h2.textContent = "Build Error";
    container.appendChild(h2);

    if (file) {
      var info = document.createElement("p");
      info.style.cssText = "color:#9ca3af;margin-bottom:12px;font-size:13px;";
      info.textContent = file + (line ? ":" + line : "");
      container.appendChild(info);
    }

    var pre = document.createElement("pre");
    pre.style.cssText = "color:#fca5a5;white-space:pre-wrap;background:#1a1a1a;padding:16px;border-radius:8px;border:1px solid #333;font-size:13px;";
    pre.textContent = message;
    container.appendChild(pre);

    var btn = document.createElement("button");
    btn.style.cssText = "background:#333;color:#fff;border:none;padding:8px 20px;cursor:pointer;border-radius:6px;margin-top:12px;font-size:13px;";
    btn.textContent = "Dismiss";
    btn.onclick = function() { overlay.remove(); };
    container.appendChild(btn);

    overlay.appendChild(container);
    document.body.appendChild(overlay);
  }

  function removeErrorOverlay() {
    var el = document.getElementById("vrx-error-overlay");
    if (el) el.remove();
  }

  // ─── WebSocket ─────────────────────────────────────────────
  function connect() {
    ws = new WebSocket("ws://localhost:${hmrPort}");
    ws.onopen = function() {
      retryDelay = 100;
      setWidgetStatus(true);
      removeErrorOverlay();
      console.log("[VirexJS] HMR connected");
    };
    ws.onmessage = function(event) {
      var msg;
      try { msg = JSON.parse(event.data); } catch(e) { return; }
      switch (msg.type) {
        case "connected": break;
        case "ping": ws.send(JSON.stringify({type:"pong"})); break;
        case "full-reload": smartReload(); break;
        case "css-update": updateCSS(msg.href); break;
        case "page-update": smartReload(); break;
        case "error": showErrorOverlay(msg.message, msg.file, msg.line); break;
      }
    };
    ws.onclose = function() {
      setWidgetStatus(false);
      setTimeout(function() {
        retryDelay = Math.min(retryDelay * 2, maxRetryDelay);
        connect();
      }, retryDelay);
    };
  }

  // ─── Boot ──────────────────────────────────────────────────
  function boot() { createDevWidget(); connect(); }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();`;
}
