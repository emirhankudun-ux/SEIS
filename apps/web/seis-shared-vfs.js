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

  window.SEIS_SHARED_VFS = {
    scope: SCOPE,
    root: ROOT,
    version: VERSION,
    load,
    save
  };
})();
