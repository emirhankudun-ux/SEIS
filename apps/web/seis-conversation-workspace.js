(function () {
  "use strict";

  const Bus = window.SEISConversationBus;
  const Approvals = window.SEISClientApprovalBus;
  const ContextAdapters = window.SEISConversationContextAdapters;
  const sources = Bus.listSources();
  const requestedSource = new URLSearchParams(window.location.search).get("source");
  let sourceId = Bus.sourceById(requestedSource || "command-center").id;
  let state = Bus.read();
  let capturedContext = null;
  const el = {
    sourceSelect: document.getElementById("workspace-source"),
    sourceKind: document.getElementById("source-kind"),
    sourceName: document.getElementById("source-name"),
    sourceState: document.getElementById("source-state"),
    adapterState: document.getElementById("adapter-state"),
    openDirect: document.getElementById("open-direct"),
    preview: document.getElementById("source-preview"),
    previewRoute: document.getElementById("preview-route"),
    boundary: document.getElementById("preview-boundary-copy"),
    adapterDetail: document.getElementById("adapter-detail"),
    grid: document.getElementById("workspace-grid"),
    threadTitle: document.getElementById("thread-title"),
    chatState: document.getElementById("chat-state"),
    total: document.getElementById("message-total"),
    messages: document.getElementById("messages"),
    input: document.getElementById("composer-input")
  };

  function source() {
    return Bus.sourceById(sourceId);
  }

  function session() {
    state.activeSourceId = sourceId;
    return Bus.ensureSession(state, sourceId);
  }

  function save() {
    state = Bus.save(state);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" }[character];
    });
  }

  function localReply(currentSource, text) {
    const intent = text.toLowerCase();
    if (intent.includes("plan") || intent.includes("milestone")) return "Agency Local Demo plan for " + currentSource.label + ": capture the client outcome, define acceptance evidence, preserve existing work, and keep live permissions behind a separate approval.";
    if (intent.includes("summar") || intent.includes("context")) {
      const evidence = capturedContext && capturedContext.state === "connected-readonly" ? " Read-only adapter evidence: " + capturedContext.title + ", " + capturedContext.interactiveControls + " interactive controls and " + capturedContext.landmarks + " structural landmarks." : " Read-only adapter evidence is not available yet.";
      return "Local context summary for " + currentSource.label + ": " + currentSource.description + " Current contract state is " + currentSource.state + "." + evidence;
    }
    return "Message recorded beside " + currentSource.label + ". The preview and thread share browser-local context; no provider or remote action was invoked.";
  }

  function send() {
    const text = el.input.value.trim();
    if (!text) return;
    const currentSession = session();
    Bus.appendMessage(state, currentSession.id, "user", text, "local-demo");
    Bus.appendMessage(state, currentSession.id, "assistant", localReply(source(), text), "local-demo");
    el.input.value = "";
    save();
    renderThread();
    el.input.focus();
  }

  function requestApproval() {
    const currentSource = source();
    const currentSession = session();
    const request = Approvals.create({
      sourceId: currentSource.id,
      threadId: currentSession.id,
      title: "Approve next " + currentSource.label + " milestone",
      summary: "Client review requested for the next agency-delivered " + currentSource.label + " scope. Current source state: " + currentSource.state + ".",
      risk: currentSource.state === "planned" || currentSource.state === "disabled" ? "approval-gated" : "local-scope"
    });
    window.location.href = "seis-client-approval-desk.html?request=" + encodeURIComponent(request.id);
  }

  function renderSource() {
    const currentSource = source();
    el.sourceSelect.value = currentSource.id;
    el.sourceKind.textContent = currentSource.kind;
    el.sourceName.textContent = currentSource.label;
    el.sourceState.textContent = currentSource.state;
    el.adapterState.textContent = "adapter pending";
    el.adapterState.className = "adapter-state is-pending";
    el.adapterDetail.textContent = "Waiting for read-only context adapter.";
    el.chatState.textContent = currentSource.state + " / browser-local";
    el.openDirect.href = currentSource.href;
    el.previewRoute.textContent = currentSource.href;
    if (el.preview.getAttribute("src") !== currentSource.href) el.preview.setAttribute("src", currentSource.href);
    el.preview.title = currentSource.label + " preview";
    el.boundary.textContent = currentSource.state === "disabled" || currentSource.state === "planned" ? "This source is " + currentSource.state + "; the preview adds no external permission." : "No host, provider, cloud, deployment, or SSH permissions are added by this shell.";
    const url = new URL(window.location.href);
    url.searchParams.set("source", currentSource.id);
    window.history.replaceState({}, "", url);
  }

  function captureContext() {
    capturedContext = ContextAdapters.capture(el.preview, source());
    el.adapterState.textContent = capturedContext.state;
    el.adapterState.className = "adapter-state " + (capturedContext.state === "connected-readonly" ? "is-connected" : "is-unavailable");
    el.adapterDetail.textContent = capturedContext.state === "connected-readonly"
      ? capturedContext.title + " / " + capturedContext.interactiveControls + " controls / " + capturedContext.landmarks + " landmarks"
      : capturedContext.reason;
  }

  function renderThread() {
    const currentSession = session();
    el.threadTitle.textContent = currentSession.title;
    el.total.textContent = currentSession.messages.length + " messages";
    el.messages.innerHTML = currentSession.messages.map(function (message) {
      const label = message.role === "user" ? "Client" : message.role === "assistant" ? "Agency Local Demo" : "System";
      return '<article class="message ' + message.role + '"><small>' + label + '</small><p>' + escapeHtml(message.text) + "</p></article>";
    }).join("");
    el.messages.scrollTop = el.messages.scrollHeight;
  }

  function render() {
    renderSource();
    renderThread();
  }

  el.sourceSelect.innerHTML = sources.map(function (item) {
    return '<option value="' + item.id + '">' + escapeHtml(item.label) + " / " + item.state + "</option>";
  }).join("");
  el.sourceSelect.addEventListener("change", function (event) {
    sourceId = Bus.sourceById(event.target.value).id;
    session();
    save();
    render();
  });
  el.preview.addEventListener("load", captureContext);
  document.addEventListener("click", function (event) {
    const action = event.target.closest("[data-action]");
    if (action && action.dataset.action === "send") send();
    if (action && action.dataset.action === "request-approval") requestApproval();
    if (action && action.dataset.action === "new-thread") {
      Bus.createSession(state, sourceId);
      save();
      renderThread();
      el.input.focus();
    }
    const prompt = event.target.closest("[data-prompt]");
    if (prompt) {
      el.input.value = prompt.dataset.prompt;
      el.input.focus();
    }
    const panel = event.target.closest("[data-panel]");
    if (panel) {
      el.grid.dataset.mobilePanel = panel.dataset.panel;
      document.querySelectorAll("[data-panel]").forEach(function (button) { button.classList.toggle("is-active", button === panel); });
    }
  });
  el.input.addEventListener("keydown", function (event) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      send();
    }
  });

  session();
  save();
  render();
})();
