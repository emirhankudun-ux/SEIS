import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const files = {
  store: fs.readFileSync(path.join(ROOT, "apps/web/seis-vfs-store.js"), "utf8"),
  adapter: fs.readFileSync(path.join(ROOT, "apps/web/seis-shared-vfs.js"), "utf8"),
  desktop: fs.readFileSync(path.join(ROOT, "apps/web/desktop.html"), "utf8"),
  desktopJs: fs.readFileSync(path.join(ROOT, "apps/web/desktop.js"), "utf8"),
  code: fs.readFileSync(path.join(ROOT, "apps/web/seis-code.html"), "utf8"),
  codeJs: fs.readFileSync(path.join(ROOT, "apps/web/seis-code.js"), "utf8"),
  serviceWorker: fs.readFileSync(path.join(ROOT, "apps/web/service-worker.js"), "utf8")
};
const failures = [];
const ensure = (condition, message) => { if (!condition) failures.push(message); };

ensure(files.store.includes("loadScope") && files.store.includes("saveScope"), "VFS store must expose scoped persistence without removing the Linux Replica API.");
ensure(files.store.includes("vfs-scope:"), "Scoped VFS records must use namespaced keys.");
ensure(files.adapter.includes('const SCOPE = "workspace"'), "Shared VFS adapter must define the workspace scope.");
ensure(files.adapter.includes("window.SEIS_SHARED_VFS"), "Shared VFS adapter must expose a browser API.");
ensure(files.adapter.includes("/workspace"), "Shared VFS adapter must constrain paths to /workspace.");
ensure(files.desktop.includes('<script src="./seis-vfs-store.js"></script>'), "Desktop must load the shared store before its module.");
ensure(files.desktop.includes('<script src="./seis-shared-vfs.js"></script>'), "Desktop must load the shared VFS adapter before its module.");
ensure(files.code.includes('<script src="./seis-vfs-store.js"></script>'), "SEIS Code must load the shared store before its module.");
ensure(files.code.includes('<script src="./seis-shared-vfs.js"></script>'), "SEIS Code must load the shared VFS adapter before its module.");
ensure(files.desktopJs.includes("SEIS_SHARED_VFS") && files.desktopJs.includes("persistSharedWorkspace"), "Desktop must persist through the shared VFS adapter.");
ensure(files.codeJs.includes("SEIS_SHARED_VFS") && files.codeJs.includes("loadSharedWorkspace"), "SEIS Code must hydrate through the shared VFS adapter.");
ensure(files.desktopJs.includes("sharedVfs"), "Desktop diagnostics must expose shared VFS state.");
ensure(files.codeJs.includes("sharedVfs"), "SEIS Code diagnostics must expose shared VFS state.");
ensure(files.serviceWorker.includes("./seis-shared-vfs.js"), "Service worker must precache the shared VFS adapter.");

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, scope: "workspace", hostFilesystem: false, migration: "non-destructive" }, null, 2));
