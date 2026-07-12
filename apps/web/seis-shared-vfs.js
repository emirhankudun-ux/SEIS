(() => {
  const SCOPE = "workspace";
  const ROOT = "/workspace";
  const VERSION = 1;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeEntries(entries) {
    if (!Array.isArray(entries)) return [];
    return entries
      .filter((entry) => entry && typeof entry === "object")
      .map((entry) => ({
        ...entry,
        path: String(entry.path || ""),
        type: entry.type === "folder" || entry.type === "dir" ? "folder" : "file",
        content: entry.type === "folder" || entry.type === "dir" ? "" : String(entry.content || "")
      }))
      .filter((entry) => entry.path === ROOT || entry.path.startsWith(`${ROOT}/`));
  }

  function snapshotEntries(snapshot) {
    if (Array.isArray(snapshot)) return normalizeEntries(snapshot);
    if (Array.isArray(snapshot?.entries)) return normalizeEntries(snapshot.entries);
    if (Array.isArray(snapshot?.root?.entries)) return normalizeEntries(snapshot.root.entries);
    return [];
  }

  function entryTimestamp(entry) {
    return Date.parse(entry?.updatedAt || entry?.createdAt || "") || 0;
  }

  function mergeEntries(currentEntries, incomingEntries) {
    const merged = new Map(normalizeEntries(currentEntries).map((entry) => [entry.path, entry]));
    let imported = 0;
    let skipped = 0;
    for (const incoming of normalizeEntries(incomingEntries)) {
      const current = merged.get(incoming.path);
      if (!current || entryTimestamp(incoming) >= entryTimestamp(current)) {
        merged.set(incoming.path, incoming);
        imported += 1;
      } else {
        skipped += 1;
      }
    }
    return { entries: Array.from(merged.values()), imported, skipped };
  }

  async function load() {
    const store = window.SEIS_VFS_STORE;
    if (!store?.loadScope) return { entries: [], mode: "memory", restored: false };
    const result = await store.loadScope(SCOPE);
    const root = result?.root;
    const entries = normalizeEntries(Array.isArray(root) ? root : root?.entries);
    return {
      entries,
      mode: result?.mode || "memory",
      restored: Boolean(result?.restored && entries.length)
    };
  }

  async function save(entries, reason = "workspace-mutation") {
    const store = window.SEIS_VFS_STORE;
    if (!store?.saveScope) return { mode: "memory", error: "shared-vfs-store-unavailable" };
    const snapshot = {
      version: VERSION,
      root: ROOT,
      entries: normalizeEntries(clone(entries))
    };
    return store.saveScope(SCOPE, snapshot, reason);
  }

  async function exportSnapshot() {
    const current = await load();
    return {
      type: "seis-shared-vfs-snapshot",
      version: VERSION,
      scope: SCOPE,
      root: ROOT,
      exportedAt: new Date().toISOString(),
      storageMode: current.mode,
      entries: current.entries
    };
  }

  async function importSnapshot(snapshot, reason = "recovery-import") {
    if (snapshot?.scope && snapshot.scope !== SCOPE) return { mode: "memory", error: "snapshot-scope-mismatch" };
    if (typeof snapshot?.root === "string" && snapshot.root !== ROOT) return { mode: "memory", error: "snapshot-root-mismatch" };
    const incoming = snapshotEntries(snapshot);
    if (!incoming.length) return { mode: "memory", error: "snapshot-empty" };
    const current = await load();
    const merged = mergeEntries(current.entries, incoming);
    const saved = await save(merged.entries, reason);
    return { ...saved, imported: merged.imported, skipped: merged.skipped, itemCount: merged.entries.length };
  }

  window.SEIS_SHARED_VFS = {
    scope: SCOPE,
    root: ROOT,
    version: VERSION,
    load,
    save,
    exportSnapshot,
    importSnapshot
  };
})();
