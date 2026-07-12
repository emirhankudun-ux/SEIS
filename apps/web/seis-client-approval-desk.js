(function () {
  "use strict";

  const Bus = window.SEISClientApprovalBus;
  let state = Bus.read();
  let selectedId = new URLSearchParams(window.location.search).get("request") || (state.requests[0] && state.requests[0].id) || "";
  let filter = "all";
  const el = {
    awaiting: document.getElementById("awaiting-count"),
    approved: document.getElementById("approved-count"),
    changes: document.getElementById("changes-count"),
    total: document.getElementById("total-count"),
    queue: document.getElementById("queue-count"),
    list: document.getElementById("request-list"),
    empty: document.getElementById("empty-state"),
    detail: document.getElementById("request-detail"),
    source: document.getElementById("detail-source"),
    title: document.getElementById("detail-title"),
    status: document.getElementById("detail-state"),
    summary: document.getElementById("detail-summary"),
    risk: document.getElementById("detail-risk"),
    created: document.getElementById("detail-created"),
    thread: document.getElementById("detail-thread"),
    note: document.getElementById("decision-note"),
    timeline: document.getElementById("timeline"),
    workspace: document.getElementById("related-workspace"),
    importInput: document.getElementById("approval-import")
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" }[character];
    });
  }

  function formatDate(value) {
    try { return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); } catch (error) { return "local"; }
  }

  function selected() {
    return state.requests.find(function (request) { return request.id === selectedId; }) || null;
  }

  function renderMetrics() {
    el.awaiting.textContent = state.requests.filter(function (request) { return request.state === "awaiting-client"; }).length;
    el.approved.textContent = state.requests.filter(function (request) { return request.state === "approved-local"; }).length;
    el.changes.textContent = state.requests.filter(function (request) { return request.state === "changes-requested"; }).length;
    el.total.textContent = state.requests.reduce(function (count, request) { return count + request.events.length; }, 0);
    el.queue.textContent = state.requests.length;
  }

  function renderList() {
    const visible = state.requests.filter(function (request) { return filter === "all" || request.state === filter; });
    if (!visible.length) {
      el.list.innerHTML = '<p class="empty-list">No requests in this filter. Create one from Conversation Workspace.</p>';
      return;
    }
    el.list.innerHTML = visible.map(function (request) {
      return '<button class="request-card' + (request.id === selectedId ? " is-active" : "") + '" type="button" data-request="' + request.id + '"><span><em>' + escapeHtml(request.sourceId) + '</em><em>' + escapeHtml(request.state) + '</em></span><strong>' + escapeHtml(request.title) + '</strong><small>' + formatDate(request.updatedAt) + "</small></button>";
    }).join("");
  }

  function renderDetail() {
    const request = selected();
    el.empty.hidden = Boolean(request);
    el.detail.hidden = !request;
    if (!request) return;
    el.source.textContent = request.sourceId;
    el.title.textContent = request.title;
    el.status.textContent = request.state;
    el.summary.textContent = request.summary;
    el.risk.textContent = request.risk;
    el.created.textContent = formatDate(request.createdAt);
    el.thread.textContent = request.threadId || "No thread";
    el.workspace.href = "seis-conversation-workspace.html?source=" + encodeURIComponent(request.sourceId);
    el.timeline.innerHTML = request.events.slice().reverse().map(function (event) {
      return "<li><strong>" + escapeHtml(event.type) + " / " + escapeHtml(event.actor) + "</strong>" + escapeHtml(event.note) + "<small>" + formatDate(event.createdAt) + "</small></li>";
    }).join("");
  }

  function render() {
    state = Bus.read();
    if (selectedId && !selected()) selectedId = (state.requests[0] && state.requests[0].id) || "";
    renderMetrics();
    renderList();
    renderDetail();
  }

  function decide(decision) {
    if (!selectedId) return;
    const updated = Bus.decide(selectedId, decision, el.note.value.trim());
    if (!updated) return;
    el.note.value = "";
    render();
  }

  function exportLog() {
    const blob = new Blob([JSON.stringify(Bus.exportPayload(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "seis-client-approval-log.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importLog(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const incoming = JSON.parse(reader.result);
        state = Bus.merge(Bus.read(), incoming.state || incoming);
        selectedId = (state.requests[0] && state.requests[0].id) || selectedId;
        render();
      } catch (error) {
        window.alert("Approval log could not be read. No local decision records were changed.");
      }
    };
    reader.readAsText(file);
  }

  document.addEventListener("click", function (event) {
    const request = event.target.closest("[data-request]");
    if (request) {
      selectedId = request.dataset.request;
      const url = new URL(window.location.href);
      url.searchParams.set("request", selectedId);
      window.history.replaceState({}, "", url);
      render();
    }
    const decision = event.target.closest("[data-decision]");
    if (decision) decide(decision.dataset.decision);
    const action = event.target.closest("[data-action]");
    if (action && action.dataset.action === "export") exportLog();
    const filterButton = event.target.closest("[data-filter]");
    if (filterButton) {
      filter = filterButton.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach(function (button) { button.classList.toggle("is-active", button === filterButton); });
      renderList();
    }
  });
  el.importInput.addEventListener("change", function (event) { importLog(event.target.files[0]); event.target.value = ""; });
  render();
})();
