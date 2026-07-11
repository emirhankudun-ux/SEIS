(() => {
  const DB_NAME = "seis-linux-replica";
  const STORE_NAME = "browser-state";
  const RECORD_KEY = "vfs-root-v1";
  const FALLBACK_KEY = "seis-linux-replica-vfs.v1";
  const MAX_BYTES = 2000000;
  let databasePromise = null;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function openDatabase() {
    if (!window.indexedDB) return Promise.resolve(null);
    if (databasePromise) return databasePromise;
    databasePromise = new Promise((resolve, reject) => {
      let request;
      try {
        request = window.indexedDB.open(DB_NAME, 1);
      } catch (error) {
        reject(error);
        return;
      }
      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE_NAME, { keyPath: "key" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("IndexedDB open failed"));
    });
    return databasePromise;
  }

  function readRecord(database) {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(RECORD_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error("IndexedDB read failed"));
      transaction.onerror = () => reject(transaction.error || new Error("IndexedDB read transaction failed"));
    });
  }

  function writeRecord(database, root, reason) {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put({
        key: RECORD_KEY,
        root,
        reason: String(reason || "mutation"),
        updatedAt: new Date().toISOString()
      });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error("IndexedDB write failed"));
      transaction.onabort = () => reject(transaction.error || new Error("IndexedDB write aborted"));
    });
  }

  function readFallback() {
    try {
      const raw = window.localStorage.getItem(FALLBACK_KEY);
      if (!raw) return null;
      const record = JSON.parse(raw);
      return record && record.root ? record : { root: record };
    } catch {
      return null;
    }
  }

  async function load() {
    let indexedDbAvailable = false;
    try {
      const database = await openDatabase();
      indexedDbAvailable = Boolean(database);
      if (database) {
        const record = await readRecord(database);
        if (record?.root) return { root: record.root, mode: "indexeddb" };
      }
    } catch {
      indexedDbAvailable = false;
    }
    const fallback = readFallback();
    if (fallback?.root) return { root: fallback.root, mode: "localstorage" };
    return { root: null, mode: indexedDbAvailable ? "indexeddb" : "memory" };
  }

  async function save(root, reason) {
    let snapshot;
    try {
      snapshot = clone(root);
      if (JSON.stringify(snapshot).length > MAX_BYTES) {
        return { mode: "memory", error: "vfs-size-limit" };
      }
    } catch {
      return { mode: "memory", error: "vfs-serialization-failed" };
    }
    try {
      const database = await openDatabase();
      if (database) {
        await writeRecord(database, snapshot, reason);
        return { mode: "indexeddb", savedAt: new Date().toISOString() };
      }
    } catch {
      // Fall through to the bounded localStorage fallback.
    }
    try {
      window.localStorage.setItem(FALLBACK_KEY, JSON.stringify({
        root: snapshot,
        reason: String(reason || "mutation"),
        updatedAt: new Date().toISOString()
      }));
      return { mode: "localstorage", savedAt: new Date().toISOString() };
    } catch {
      return { mode: "memory", error: "browser-storage-unavailable" };
    }
  }

  window.SEIS_VFS_STORE = { load, save, version: 1, maxBytes: MAX_BYTES };
})();
