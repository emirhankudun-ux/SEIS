import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(process.env.SEIS_STATIC_ROOT || "dist/seis-static");
const workspaceRoot = resolve(process.env.SEIS_WORKSPACE_ROOT || ".");
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 4177);

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".txt", "text/plain; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"]
]);

if (!existsSync(root)) {
  console.error(`Static root not found: ${root}`);
  process.exit(1);
}

const server = createServer((request, response) => {
  if (!request.url || request.method !== "GET") {
    sendJson(response, 405, { ok: false, error: "method_not_allowed" });
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);
  const filePath = resolveSafePath(url.pathname);

  if (!filePath) {
    sendJson(response, 403, { ok: false, error: "forbidden" });
    return;
  }

  if (url.pathname === "/_server/health") {
    sendJson(response, 200, buildHealthPayload());
    return;
  }

  if (url.pathname === "/_server/handoff") {
    sendJson(response, 200, buildHandoffPayload());
    return;
  }

  if (url.pathname === "/_server/efficiency") {
    sendJson(response, 200, buildEfficiencyPayload());
    return;
  }

  if (url.pathname === "/_server/development-mode") {
    sendJson(response, 200, buildDevelopmentModePayload());
    return;
  }

  if (url.pathname === "/_server/weekly-usage") {
    sendJson(response, 200, buildWeeklyUsagePayload());
    return;
  }

  if (url.pathname === "/_server/fullstack-contract") {
    sendJson(response, 200, buildFullstackPayload("self"));
    return;
  }

  if (url.pathname === "/_server/session") {
    sendJson(response, 200, buildFullstackPayload("session"));
    return;
  }

  if (url.pathname === "/_server/capabilities") {
    sendJson(response, 200, buildFullstackPayload("capabilities"));
    return;
  }

  if (url.pathname === "/_server/projects") {
    sendJson(response, 200, buildFullstackPayload("projects"));
    return;
  }

  if (url.pathname === "/_server/app-installs") {
    sendJson(response, 200, buildFullstackPayload("appInstalls"));
    return;
  }

  if (url.pathname === "/_server/provider-status") {
    sendJson(response, 200, buildFullstackPayload("providerStatus"));
    return;
  }

  if (url.pathname === "/_server/audit-log") {
    sendJson(response, 200, buildFullstackPayload("auditLogs"));
    return;
  }

  if (url.pathname === "/_server/agent-tasks") {
    sendJson(response, 200, buildFullstackPayload("agentTasks"));
    return;
  }

  if (url.pathname === "/_server/plugin-sources") {
    sendJson(response, 200, buildPluginSourcesPayload());
    return;
  }

  serveFile(filePath, response);
});

server.listen(port, host, () => {
  console.log(`SEIS static server listening on http://${host}:${port}`);
});

function resolveSafePath(pathname) {
  const decodedPath = decodeURIComponent(pathname);
  const normalizedPath = normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const relativePath = normalizedPath === "/" ? "index.html" : normalizedPath.replace(/^[/\\]/, "");
  const candidate = resolve(join(root, relativePath));

  if (!candidate.startsWith(root)) {
    return null;
  }

  if (existsSync(candidate) && statSync(candidate).isDirectory()) {
    return resolve(join(candidate, "index.html"));
  }

  if (existsSync(candidate)) {
    return candidate;
  }

  if (extname(relativePath)) {
    return candidate;
  }

  const fallback = resolve(join(root, "index.html"));
  return existsSync(fallback) ? fallback : candidate;
}

function serveFile(filePath, response) {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    sendJson(response, 404, { ok: false, error: "not_found" });
    return;
  }

  const extension = extname(filePath).toLowerCase();
  const contentType = mimeTypes.get(extension) || "application/octet-stream";
  const cacheControl = isImmutableAsset(filePath)
    ? "public, max-age=31536000, immutable"
    : "public, max-age=300";

  response.writeHead(200, {
    "content-type": contentType,
    "cache-control": cacheControl,
    "x-content-type-options": "nosniff"
  });
  createReadStream(filePath).pipe(response);
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function buildHealthPayload() {
  const releasePath = resolve(join(root, "health.json"));
  if (!existsSync(releasePath)) {
    return { ok: true, name: "seis-static", source: "node-server" };
  }

  try {
    const release = JSON.parse(readText(releasePath));
    return { ...release, source: "node-server" };
  } catch (_error) {
    return { ok: true, name: "seis-static", source: "node-server", releaseReadable: false };
  }
}

function buildHandoffPayload() {
  const handoffPath = resolve(join(root, "content/lab/handoff-checklist.json"));
  if (!existsSync(handoffPath)) {
    return { ok: false, source: "node-server", error: "handoff_checklist_missing" };
  }

  try {
    const handoff = JSON.parse(readText(handoffPath));
    return { ok: true, source: "node-server", ...handoff };
  } catch (_error) {
    return { ok: false, source: "node-server", error: "handoff_checklist_unreadable" };
  }
}

function buildEfficiencyPayload() {
  const efficiencyPath = resolve(join(root, "content/lab/efficiency-governor.json"));
  if (!existsSync(efficiencyPath)) {
    return { ok: false, source: "node-server", error: "efficiency_governor_missing" };
  }

  try {
    const efficiency = JSON.parse(readText(efficiencyPath));
    return { ok: true, source: "node-server", ...efficiency };
  } catch (_error) {
    return { ok: false, source: "node-server", error: "efficiency_governor_unreadable" };
  }
}

function buildDevelopmentModePayload() {
  const developmentModePath = resolve(join(root, "content/lab/development-mode.json"));
  if (!existsSync(developmentModePath)) {
    return { ok: false, source: "node-server", error: "development_mode_missing" };
  }

  try {
    const developmentMode = JSON.parse(readText(developmentModePath));
    return { ok: true, source: "node-server", ...developmentMode };
  } catch (_error) {
    return { ok: false, source: "node-server", error: "development_mode_unreadable" };
  }
}

function buildWeeklyUsagePayload() {
  const weeklyUsagePath = resolve(join(root, "content/lab/weekly-usage-governor.json"));
  if (!existsSync(weeklyUsagePath)) {
    return { ok: false, source: "node-server", error: "weekly_usage_governor_missing" };
  }

  try {
    const weeklyUsage = JSON.parse(readText(weeklyUsagePath));
    return { ok: true, source: "node-server", ...weeklyUsage };
  } catch (_error) {
    return { ok: false, source: "node-server", error: "weekly_usage_governor_unreadable" };
  }
}

function buildPluginSourcesPayload() {
  const environmentPath = resolve(join(workspaceRoot, "deploy/cloud-environment.json"));
  if (!existsSync(environmentPath)) {
    return { ok: false, source: "node-server", error: "cloud_environment_missing" };
  }

  try {
    const environment = JSON.parse(readText(environmentPath));
    const sources = environment.sources || {};
    return {
      ok: true,
      source: "node-server",
      sourceKeys: Object.keys(sources),
      uniquePlugins: sources.submittedPluginInventory?.uniquePlugins || 0,
      capabilityLanes: sources.submittedPluginCapabilityLanes?.laneCount || 0,
      requestedTechnologies: sources.requestedSoftwareStack?.technologyCount || 0
    };
  } catch (_error) {
    return { ok: false, source: "node-server", error: "cloud_environment_unreadable" };
  }
}

function buildFullstackPayload(sourceKey) {
  const contract = readFullstackContract();
  if (!contract) {
    return { ok: false, source: "node-server", error: "fullstack_contract_missing" };
  }

  if (sourceKey === "self") {
    return { ok: true, source: "node-server", ...contract };
  }

  if (!Object.prototype.hasOwnProperty.call(contract, sourceKey)) {
    return { ok: false, source: "node-server", error: "fullstack_contract_key_missing", sourceKey };
  }

  return {
    ok: true,
    source: "node-server",
    contractId: contract.id,
    sourceKey,
    data: contract[sourceKey]
  };
}

function readFullstackContract() {
  const contractPath = resolve(join(workspaceRoot, "content/development/seis-fullstack-contract.json"));
  if (!existsSync(contractPath)) return null;

  try {
    return JSON.parse(readText(contractPath));
  } catch (_error) {
    return null;
  }
}

function readText(filePath) {
  return readFileSync(filePath, "utf8");
}

function isImmutableAsset(filePath) {
  return filePath.includes("/public/media/") || filePath.endsWith(".svg");
}
