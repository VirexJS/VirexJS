/**
 * Generate the HMR client script that's injected into HTML during dev mode.
 * This is a plain JavaScript string (not TypeScript).
 *
 * Features:
 * - WebSocket connection to HMR server
 * - Auto-reconnect on disconnect (with exponential backoff)
 * - Handle message types: page-update, css-update, full-reload, error
 * - Error overlay: create a div with stack trace display
 * - CSS hot swap: update link href without page reload
 *
 * Note: The error overlay uses textContent and DOM APIs for XSS safety.
 * Only dev-mode internal error messages are displayed.
 */
export function generateHMRClientScript(hmrPort: number): string {
	return `(function() {
  var ws;
  var retryDelay = 100;
  var maxRetryDelay = 5000;

  function connect() {
    ws = new WebSocket("ws://localhost:${hmrPort}");

    ws.onopen = function() {
      retryDelay = 100;
      console.log("[VirexJS] HMR connected");
      removeErrorOverlay();
    };

    ws.onmessage = function(event) {
      var msg;
      try { msg = JSON.parse(event.data); } catch(e) { return; }

      switch (msg.type) {
        case "connected":
          break;
        case "full-reload":
          console.log("[VirexJS] Full reload");
          location.reload();
          break;
        case "css-update":
          updateCSS(msg.href);
          break;
        case "page-update":
          console.log("[VirexJS] Page update: " + msg.path);
          location.reload();
          break;
        case "error":
          showErrorOverlay(msg.message, msg.file, msg.line);
          break;
      }
    };

    ws.onclose = function() {
      console.log("[VirexJS] HMR disconnected, retrying in " + retryDelay + "ms");
      setTimeout(function() {
        retryDelay = Math.min(retryDelay * 2, maxRetryDelay);
        connect();
      }, retryDelay);
    };
  }

  function updateCSS(href) {
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      if (link.href && link.href.indexOf(href) !== -1) {
        var newLink = link.cloneNode();
        newLink.href = href + "?t=" + Date.now();
        link.parentNode.insertBefore(newLink, link.nextSibling);
        link.remove();
        console.log("[VirexJS] CSS updated: " + href);
        return;
      }
    }
  }

  function showErrorOverlay(message, file, line) {
    removeErrorOverlay();
    var overlay = document.createElement("div");
    overlay.id = "vrx-error-overlay";
    overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);color:#ff6b6b;font-family:monospace;font-size:14px;padding:32px;z-index:99999;overflow:auto;box-sizing:border-box;";

    var container = document.createElement("div");
    container.style.cssText = "max-width:800px;margin:0 auto;";

    var h2 = document.createElement("h2");
    h2.style.cssText = "color:#ff6b6b;margin-top:0;";
    h2.textContent = "Build Error";
    container.appendChild(h2);

    var info = document.createElement("p");
    info.style.color = "#999";
    info.textContent = file ? file + (line ? ":" + line : "") : "Error";
    container.appendChild(info);

    var pre = document.createElement("pre");
    pre.style.cssText = "color:#fff;white-space:pre-wrap;word-wrap:break-word;background:#1a1a1a;padding:16px;border-radius:8px;";
    pre.textContent = message;
    container.appendChild(pre);

    var btn = document.createElement("button");
    btn.style.cssText = "background:#333;color:#fff;border:none;padding:8px 16px;cursor:pointer;border-radius:4px;";
    btn.textContent = "Dismiss";
    btn.onclick = function() { overlay.remove(); };
    container.appendChild(btn);

    overlay.appendChild(container);
    document.body.appendChild(overlay);
  }

  function removeErrorOverlay() {
    var overlay = document.getElementById("vrx-error-overlay");
    if (overlay) overlay.remove();
  }

  connect();
})();`;
}
