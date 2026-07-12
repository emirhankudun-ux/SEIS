import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const adapter = read("apps/web/seis-shared-vfs.js");
const html = read("apps/web/seis-workspace-recovery.html");
const css = read("apps/web/seis-workspace-recovery.css");
const js = read("apps/web/seis-workspace-recovery.js");
const serviceWorker = read("apps/web/service-worker.js");
const routes = JSON.parse(read("apps/web/src/config/routes.json"));
const failures = [];
const ensure = (condition, message) => { if (!condition) failures.push(message); };

ensure(adapter.includes("exportSnapshot") && adapter.includes("importSnapshot"), "Shared VFS adapter must expose snapshot export/import APIs.");
ensure(adapter.includes("mergeEntries") && adapter.includes("snapshot-scope-mismatch"), "Snapshot recovery must validate scope and merge without replacement.");
ensure(html.includes('data-action="export-snapshot"'), "Recovery route must expose an export action.");
ensure(html.includes('data-action="import-snapshot"'), "Recovery route must expose a merge import action.");
ensure(html.includes('accept="application/json,.json"'), "Recovery route must restrict imports to JSON snapshots.");
ensure(html.includes("No host filesystem, SSH, cloud, or provider access."), "Recovery route must expose its safety boundary.");
ensure(css.includes("@media (prefers-reduced-motion: reduce)"), "Recovery route must include reduced-motion support.");
ensure(js.includes("window.__SEIS_WORKSPACE_RECOVERY__"), "Recovery route must expose browser smoke diagnostics.");
ensure(js.includes("Merge blocked") && js.includes("Browser download only"), "Recovery route must label safe failure and export behavior.");
ensure(serviceWorker.includes("./seis-workspace-recovery.html") && serviceWorker.includes("./seis-workspace-recovery.js"), "Service worker must precache the recovery route.");
ensure(routes.routes.some((route) => route.path === "/seis-workspace-recovery.html"), "Route registry must include workspace recovery.");

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, scope: "workspace", mode: "merge-only", destructiveActions: false }, null, 2));
