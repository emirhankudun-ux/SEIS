import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const html = fs.readFileSync(path.join(ROOT, "apps", "web", "seis-linux-replica.html"), "utf8");
const store = fs.readFileSync(path.join(ROOT, "apps", "web", "seis-vfs-store.js"), "utf8");
const failures = [];
const ensure = (condition, message) => { if (!condition) failures.push(message); };

ensure(store.includes("indexedDB.open"), "VFS store must open IndexedDB.");
ensure(store.includes("createObjectStore"), "VFS store must define its object store.");
ensure(store.includes("localStorage"), "VFS store must retain a bounded fallback.");
ensure(store.includes("MAX_BYTES"), "VFS store must enforce a bounded serialized payload.");
ensure(html.includes('<script src="./seis-vfs-store.js"></script>'), "Linux Replica must load the VFS store before the app script.");
ensure(html.includes("loadPersistentVfs"), "Linux Replica must restore VFS state before boot.");
ensure(html.includes("persistVfs"), "Linux Replica must persist browser-local VFS mutations.");
ensure(html.includes("vfsPersistence:()=>"), "Linux Replica diagnostics must expose VFS persistence state.");
ensure(html.includes('document.addEventListener("click",()=>persistVfs("interaction"))'), "Browser interactions must checkpoint VFS state.");
ensure(html.includes('document.addEventListener("keydown",()=>persistVfs("interaction"))'), "Terminal keyboard interactions must checkpoint VFS state.");
ensure(html.includes("vfsLastFingerprint"), "VFS persistence must avoid redundant writes.");
ensure(html.includes("No host filesystem access"), "VFS persistence must keep the host filesystem boundary explicit.");

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, storage: "indexeddb-with-bounded-localstorage-fallback", hostFilesystem: false }, null, 2));
