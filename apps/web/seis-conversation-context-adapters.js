(function (global) {
  "use strict";

  const VERSION = 1;
  const CONTEXT_NAMESPACE = ["seis", "conversation", "context", "v1"].join(".");
  const SAFE_INTERACTIVE_SELECTOR = "button,a[href],[role=button],[role=tab],[role=menuitem],select,textarea";
  const SAFE_LANDMARK_SELECTOR = "main,nav,header,footer,aside,[role=main],[role=navigation],[role=dialog]";

  function timestamp() {
    return new Date().toISOString();
  }

  function readStore() {
    try {
      const raw = global.localStorage.getItem(CONTEXT_NAMESPACE);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function writeStore(store) {
    try {
      global.localStorage.setItem(CONTEXT_NAMESPACE, JSON.stringify(store));
    } catch (error) {}
  }

  function unavailable(source, reason) {
    return {
      version: VERSION,
      sourceId: source.id,
      state: "unavailable",
      reason: String(reason || "Context preview is unavailable."),
      capturedAt: timestamp()
    };
  }

  function safeCount(documentRef, selector) {
    try {
      return Math.min(documentRef.querySelectorAll(selector).length, 9999);
    } catch (error) {
      return 0;
    }
  }

  function capture(frame, source) {
    if (!frame || !source) return unavailable(source || { id: "unknown" }, "Adapter input is incomplete.");
    try {
      const frameWindow = frame.contentWindow;
      const frameDocument = frame.contentDocument;
      const frameUrl = new URL(frameWindow.location.href);
      if (frameUrl.origin !== global.location.origin) return unavailable(source, "Cross-origin preview metadata is not readable.");
      if (!frameDocument || frameDocument.readyState === "loading") return unavailable(source, "Preview is still loading.");
      const context = {
        version: VERSION,
        sourceId: source.id,
        state: "connected-readonly",
        title: String(frameDocument.title || source.label).slice(0, 160),
        route: frameUrl.pathname + frameUrl.search,
        interactiveControls: safeCount(frameDocument, SAFE_INTERACTIVE_SELECTOR),
        landmarks: safeCount(frameDocument, SAFE_LANDMARK_SELECTOR),
        viewport: {
          width: Math.max(0, Math.round(frameWindow.innerWidth || 0)),
          height: Math.max(0, Math.round(frameWindow.innerHeight || 0))
        },
        permissions: ["route", "title", "element-counts"],
        forbidden: ["text-content", "input-values", "storage", "credentials", "files", "network-payloads"],
        capturedAt: timestamp()
      };
      const store = readStore();
      store[source.id] = context;
      writeStore(store);
      global.dispatchEvent(new CustomEvent("seis:conversation-context", { detail: context }));
      return context;
    } catch (error) {
      return unavailable(source, "Sandbox metadata could not be captured.");
    }
  }

  function read(sourceId) {
    const store = readStore();
    return store[sourceId] || null;
  }

  global.SEISConversationContextAdapters = {
    VERSION,
    capture,
    read,
    list: function () {
      return Object.values(readStore());
    },
    privacyContract: function () {
      return {
        allowed: ["route", "document-title", "interactive-control-count", "landmark-count", "viewport"],
        forbidden: ["text-content", "input-values", "local-storage-from-preview", "credentials", "file-content", "network-payloads"]
      };
    }
  };
})(window);
