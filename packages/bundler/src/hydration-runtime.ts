/**
 * Generate the client-side hydration runtime script.
 * This script finds island markers in the DOM, loads island modules,
 * and hydrates them based on the configured strategy.
 *
 * Hydration strategies:
 * - "immediate" — Hydrate as soon as JS loads
 * - "visible" — Hydrate when element enters viewport (IntersectionObserver)
 * - "interaction" — Hydrate on first user interaction (click, focus, mouseover)
 * - "idle" — Hydrate during browser idle time (requestIdleCallback)
 */
export function generateHydrationRuntime(islandBasePath: string): string {
	return `(function() {
  "use strict";

  var ISLAND_MODULES = {};
  var BASE = "${islandBasePath}";

  /**
   * Parse island markers from HTML comments in the DOM.
   * Returns array of { name, props, strategy, container }.
   */
  function discoverIslands() {
    var islands = [];
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT);
    var node;
    while (node = walker.nextNode()) {
      var text = node.textContent || "";
      if (text.indexOf("vrx-island:") !== 0) continue;

      var parts = text.split(":");
      if (parts.length < 4) continue;

      var name = parts[1];
      var propsJSON = parts.slice(2, -1).join(":");
      var strategy = parts[parts.length - 1];
      var props;
      try { props = JSON.parse(propsJSON); } catch(e) { props = {}; }

      // The container is the next element sibling (div[data-vrx-island])
      var container = node.nextElementSibling;
      if (!container || container.getAttribute("data-vrx-island") !== name) {
        container = node.nextSibling;
        while (container && container.nodeType !== 1) container = container.nextSibling;
      }

      if (container) {
        islands.push({ name: name, props: props, strategy: strategy, container: container });
      }
    }
    return islands;
  }

  /**
   * Load an island module from the server.
   */
  function loadIsland(name) {
    if (ISLAND_MODULES[name]) return ISLAND_MODULES[name];
    var url = BASE + name + ".js";
    ISLAND_MODULES[name] = import(url).then(function(mod) {
      ISLAND_MODULES[name] = Promise.resolve(mod);
      return mod;
    });
    return ISLAND_MODULES[name];
  }

  /**
   * Hydrate an island: load the module, call its mount function,
   * and replace the static HTML with the interactive version.
   */
  function hydrate(island) {
    loadIsland(island.name).then(function(mod) {
      var mount = mod.mount || mod.default;
      if (typeof mount === "function") {
        island.container.setAttribute("data-vrx-hydrated", "true");
        mount(island.container, island.props);
      }
    }).catch(function(err) {
      console.error("[VirexJS] Failed to hydrate island: " + island.name, err);
    });
  }

  /**
   * Schedule hydration based on strategy.
   */
  function scheduleHydration(island) {
    switch (island.strategy) {
      case "immediate":
        hydrate(island);
        break;

      case "visible":
        if ("IntersectionObserver" in window) {
          var observer = new IntersectionObserver(function(entries) {
            for (var i = 0; i < entries.length; i++) {
              if (entries[i].isIntersecting) {
                observer.disconnect();
                hydrate(island);
                break;
              }
            }
          }, { rootMargin: "200px" });
          observer.observe(island.container);
        } else {
          hydrate(island);
        }
        break;

      case "interaction":
        var events = ["click", "focusin", "mouseover", "touchstart"];
        function onInteraction() {
          for (var i = 0; i < events.length; i++) {
            island.container.removeEventListener(events[i], onInteraction);
          }
          hydrate(island);
        }
        for (var i = 0; i < events.length; i++) {
          island.container.addEventListener(events[i], onInteraction, { once: true, passive: true });
        }
        break;

      case "idle":
        if ("requestIdleCallback" in window) {
          requestIdleCallback(function() { hydrate(island); });
        } else {
          setTimeout(function() { hydrate(island); }, 200);
        }
        break;

      default:
        hydrate(island);
    }
  }

  // Boot: discover and schedule all islands
  function boot() {
    var islands = discoverIslands();
    for (var i = 0; i < islands.length; i++) {
      scheduleHydration(islands[i]);
    }
    if (islands.length > 0) {
      console.log("[VirexJS] " + islands.length + " island(s) discovered");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();`;
}
