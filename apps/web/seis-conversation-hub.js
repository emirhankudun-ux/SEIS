(function () {
  "use strict";

  const Bus = window.SEISConversationBus;
  let state = Bus.read();
  let activeSourceId = state.activeSourceId || "command-center";
  let filter = "";
  const el = {
    sourceList: document.getElementById("source-list"),
    sourceFilter: document.getElementById("source-filter"),
    sourceCount: document.getElementById("source-count"),
    sessionCount: document.getElementById("session-count"),
    messageCount: document.getElementById("message-count"),
    sourceAvatar: document.getElementById("source-avatar"),
    contextAvatar: document.getElementById("context-avatar"),
    sourceKind: document.getElementById("source-kind"),
    conversationTitle: document.getElementById("conversation-title"),
    conversationState: document.getElementById("conversation-state"),
    threadTitle: document.getElementById("thread-title"),
    threadUpdated: document.getElementById("thread-updated"),
    messageList: document.getElementById("message-list"),
    messageInput: document.getElementById("message-input"),
    contextTitle: document.getElementById("context-title"),
    contextDescription: document.getElementById("context-description"),
    contextState: document.getElementById("context-state"),
    contextPermissions: document.getElementById("context-permissions"),
    openSource: document.getElementById("open-source"),
    importInput: document.getElementById("conversation-import")
  };

  function source() { return Bus.sourceById(activeSourceId); }
  function session() { state.activeSourceId = activeSourceId; return Bus.ensureSession(state, activeSourceId); }
  function saveRender() { state = Bus.save(state); render(); }
  function setSource(sourceId) { activeSourceId = Bus.sourceById(sourceId).id; state.activeSourceId = activeSourceId; session(); saveRender(); }
  function newSession() { state = Bus.read(); Bus.createSession(state, activeSourceId); saveRender(); el.messageInput.focus(); }

  function localResponse(currentSource, text) {
    const request = text.toLowerCase();
    if (request.includes("boundary") || request.includes("planned") || request.includes("live")) return "Local Demo boundary for " + currentSource.label + ": state is " + currentSource.state + ". Provider, cloud, host filesystem and SSH actions remain outside this browser-local thread.";
    if (request.includes("summar") || request.includes("context")) return "Local Demo summary: " + currentSource.description + " The Hub indexes this source as " + currentSource.state + " and stores only explicit local messages.";
    if (request.includes("plan") || request.includes("next")) return "Local Demo plan: capture the request, attach only approved metadata, then require explicit review before any external capability is introduced.";
    return "Local Demo response recorded for " + currentSource.label + ". No external model call was made; this message can be exported as a merge-only snapshot.";
  }

  function send(text) {
    const value = String(text || "").trim();
    if (!value) return;
    const currentSession = session();
    Bus.appendMessage(state, currentSession.id, "user", value, "local-demo");
    Bus.appendMessage(state, currentSession.id, "assistant", localResponse(source(), value), "local-demo");
    el.messageInput.value = "";
    saveRender();
    el.messageInput.focus();
  }

  function exportChats() {
    const blob = new Blob([JSON.stringify(Bus.exportPayload(state), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "seis-conversation-hub.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importChats(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const incoming = JSON.parse(reader.result);
        state = Bus.merge(state, incoming.state || incoming);
        activeSourceId = state.activeSourceId;
        saveRender();
      } catch (error) {
        window.alert("Conversation snapshot could not be read. No local chats were changed.");
      }
    };
    reader.readAsText(file);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" }[character];
    });
  }

  function time(value) {
    try { return new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date(value)); } catch (error) { return "local"; }
  }

  function renderSources() {
    const sources = Bus.listSources();
    el.sourceCount.textContent = sources.length;
    el.sourceList.innerHTML = sources.map(function (item) {
      const hidden = filter && !item.label.toLowerCase().includes(filter);
      return '<button class="source-item' + (item.id === activeSourceId ? " is-active" : "") + '"' + (hidden ? " hidden" : "") + ' type="button" data-source="' + item.id + '" role="listitem"><span class="source-mini">' + item.short + '</span><span><strong>' + escapeHtml(item.label) + '</strong><small>' + escapeHtml(item.kind) + '</small></span><span class="state-dot ' + item.state + '" title="' + item.state + '"></span></button>';
    }).join("");
  }

  function renderMessages() {
    const currentSession = session();
    const currentSource = source();
    el.messageList.innerHTML = currentSession.messages.map(function (message) {
      const role = message.role === "user" ? "You" : message.role === "assistant" ? "Local Demo" : "System";
      const badge = message.role === "user" ? "YOU" : currentSource.short;
      return '<article class="message ' + message.role + '"><span class="message-badge">' + badge + '</span><div class="message-body"><span class="message-meta">' + role + " / " + time(message.createdAt) + '</span>' + escapeHtml(message.text) + "</div></article>";
    }).join("");
    el.messageList.scrollTop = el.messageList.scrollHeight;
  }

  function renderContext() {
    const currentSource = source();
    const currentSession = session();
    el.sourceAvatar.textContent = currentSource.short;
    el.contextAvatar.textContent = currentSource.short;
    el.sourceKind.textContent = currentSource.kind;
    el.conversationTitle.textContent = currentSource.label;
    el.conversationState.textContent = currentSource.state;
    el.threadTitle.textContent = currentSession.title;
    el.threadUpdated.textContent = "Updated " + time(currentSession.updatedAt);
    el.contextTitle.textContent = currentSource.label;
    el.contextDescription.textContent = currentSource.description;
    el.contextState.textContent = currentSource.state;
    el.contextPermissions.textContent = currentSource.state === "planned" || currentSource.state === "disabled" ? "No external actions" : "No external writes";
    const workspaceUrl = new URL("seis-conversation-workspace.html", window.location.href);
    workspaceUrl.searchParams.set("source", currentSource.id);
    el.openSource.href = workspaceUrl.href;
  }

  function render() {
    renderSources();
    renderContext();
    renderMessages();
    el.sessionCount.textContent = state.sessions.length;
    el.messageCount.textContent = state.sessions.reduce(function (count, item) { return count + item.messages.length; }, 0);
  }

  document.addEventListener("click", function (event) {
    const sourceButton = event.target.closest("[data-source]");
    if (sourceButton) setSource(sourceButton.dataset.source);
    const action = event.target.closest("[data-action]");
    if (action && action.dataset.action === "send") send(el.messageInput.value);
    if (action && action.dataset.action === "export") exportChats();
    if (action && action.dataset.action === "new-session") newSession();
    const suggestion = event.target.closest("[data-suggestion]");
    if (suggestion) { el.messageInput.value = suggestion.dataset.suggestion; el.messageInput.focus(); }
  });
  el.sourceFilter.addEventListener("input", function (event) { filter = event.target.value.trim().toLowerCase(); renderSources(); });
  el.messageInput.addEventListener("keydown", function (event) { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") { event.preventDefault(); send(el.messageInput.value); } });
  el.importInput.addEventListener("change", function (event) { importChats(event.target.files[0]); event.target.value = ""; });
  session();
  saveRender();
})();
