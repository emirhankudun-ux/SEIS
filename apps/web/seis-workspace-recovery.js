(() => {
  const adapter = window.SEIS_SHARED_VFS;
  const state = { current: null, pending: null };
  const $ = (selector) => document.querySelector(selector);

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setStatus(message, tone = "") {
    const node = $("[data-status]");
    if (node) {
      node.textContent = message;
      node.dataset.tone = tone;
    }
  }

  function renderCurrent() {
    const current = state.current || { entries: [], mode: "unavailable", restored: false };
    $("[data-scope]").textContent = adapter?.scope || "/workspace";
    $("[data-storage]").textContent = current.mode || "unavailable";
    $("[data-item-count]").textContent = String(current.entries?.length || 0);
    $("[data-loaded-at]").textContent = current.loadedAt ? new Date(current.loadedAt).toLocaleTimeString() : "Now";
    const inventory = $("[data-inventory]");
    const entries = (current.entries || []).filter((entry) => entry.path !== "/workspace").slice().sort((a, b) => a.path.localeCompare(b.path));
    inventory.innerHTML = entries.length
      ? entries.slice(0, 80).map((entry) => `<article class="inventory-item"><strong>${escapeHtml(entry.path)}</strong><small>${escapeHtml(entry.type)} · ${entry.type === "folder" ? "directory" : `${String(entry.content || "").length} characters`}</small></article>`).join("")
      : '<p class="inventory-empty">No shared entries are available yet.</p>';
  }

  function renderPending() {
    const preview = $("[data-snapshot-preview]");
    const title = $("[data-selected-name]");
    const statePill = $("[data-selected-state]");
    const importButton = $("[data-action='import-snapshot']");
    if (!state.pending) {
      title.textContent = "No snapshot selected";
      statePill.textContent = "Idle";
      preview.textContent = "Choose a JSON snapshot to inspect it before merging.";
      importButton.disabled = true;
      return;
    }
    const entries = Array.isArray(state.pending.entries) ? state.pending.entries : [];
    title.textContent = `${entries.length} entries ready`;
    statePill.textContent = state.pending.scope === (adapter?.scope || "workspace") ? "Validated" : "Rejected";
    preview.textContent = JSON.stringify({
      type: state.pending.type || "unknown",
      scope: state.pending.scope || "missing",
      root: state.pending.root || "missing",
      exportedAt: state.pending.exportedAt || "unknown",
      entries: entries.slice(0, 12),
      truncated: Math.max(0, entries.length - 12)
    }, null, 2);
    importButton.disabled = state.pending.scope !== (adapter?.scope || "workspace") || !entries.length;
  }

  async function refresh() {
    if (!adapter?.load) {
      state.current = { entries: [], mode: "unavailable", restored: false };
      setStatus("Shared VFS adapter unavailable.", "error");
      renderCurrent();
      return;
    }
    state.current = { ...(await adapter.load()), loadedAt: new Date().toISOString() };
    renderCurrent();
    setStatus(`Loaded ${state.current.entries.length} browser-local entries from ${state.current.mode}.`);
  }

  async function exportSnapshot() {
    if (!adapter?.exportSnapshot) return null;
    const snapshot = await adapter.exportSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "seis-workspace-snapshot.json";
    link.click();
    URL.revokeObjectURL(url);
    setStatus(`Exported ${snapshot.entries.length} entries. Browser download only.`);
    return snapshot;
  }

  async function importSnapshot(snapshot = state.pending) {
    if (!snapshot || !adapter?.importSnapshot) return { error: "snapshot-not-selected" };
    const result = await adapter.importSnapshot(snapshot, "recovery-import");
    if (result.error) {
      setStatus(`Merge blocked: ${result.error}.`, "error");
      return result;
    }
    state.pending = null;
    renderPending();
    await refresh();
    setStatus(`Merged ${result.imported} entries; kept ${result.skipped} newer local entries.`, "success");
    return result;
  }

  function bind() {
    $("[data-snapshot-input]").addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        state.pending = JSON.parse(await file.text());
        renderPending();
        setStatus(`Selected ${file.name}; review the snapshot before merge.`);
      } catch (error) {
        state.pending = null;
        renderPending();
        setStatus(`Snapshot JSON could not be read: ${error.message}`, "error");
      }
    });
    document.addEventListener("click", (event) => {
      const action = event.target.closest("[data-action]")?.dataset.action;
      if (action === "export-snapshot") void exportSnapshot();
      if (action === "import-snapshot") void importSnapshot();
      if (action === "refresh") void refresh();
    });
  }

  window.__SEIS_WORKSPACE_RECOVERY__ = {
    current: () => state.current,
    pending: () => state.pending,
    refresh,
    exportSnapshot,
    importSnapshot
  };
  bind();
  void refresh();
})();
