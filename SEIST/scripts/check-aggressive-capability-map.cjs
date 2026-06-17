const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const mapPath = path.join(ROOT, "content", "development", "aggressive-capability-map.json");
const docsPath = path.join(ROOT, "docs", "development", "aggressive-capability-activation.md");
const registryPath = path.join(ROOT, "content", "development", "connector-capability-registry.json");
const pluginCatalogPath = path.join(ROOT, "content", "development", "plugin-capability-catalog.json");
const packagePath = path.join(ROOT, "package.json");
const failures = [];

function readJson(file) {
  if (!fs.existsSync(file)) {
    failures.push(`Missing ${path.relative(ROOT, file)}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    failures.push(`Invalid JSON in ${path.relative(ROOT, file)}: ${error.message}`);
    return null;
  }
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

const map = readJson(mapPath);
const registry = readJson(registryPath);
const pluginCatalog = readJson(pluginCatalogPath);
const packageJson = readJson(packagePath);
const docs = fs.existsSync(docsPath) ? fs.readFileSync(docsPath, "utf8") : "";
const packageScripts = new Set(Object.keys(packageJson?.scripts || {}));

function ensureQualityCommandsExist(commands, owner) {
  ensure(Array.isArray(commands) && commands.length > 0, `${owner} must define quality commands`);

  for (const command of commands || []) {
    const scriptName = String(command).match(/^npm run ([^\s]+)/)?.[1];

    ensure(Boolean(scriptName), `${owner} quality command must use npm run <script>: ${command}`);
    if (scriptName) {
      ensure(packageScripts.has(scriptName), `${owner} references missing package script ${scriptName}`);
    }
  }
}

ensure(docs.includes("SEIS Aggressive Capability Activation"), "aggressive capability docs must keep the title");
ensure(docs.includes("npm run check:aggressive-capability-map"), "docs must include the validator command");
ensure(docs.includes("content/development/plugin-capability-catalog.json"), "docs must link the plugin capability catalog");

if (map) {
  ensure(map.id === "seis-aggressive-capability-map", "map id must stay stable");
  ensure(map.mode === "aggressive-safe-activation", "map mode must be aggressive-safe-activation");
  ensure(map.branch === "UIXAppTTR", "map must target UIXAppTTR");
  ensure(map.timeboxMinutes <= 10, "timebox must stay within ten minutes");
  ensure(Array.isArray(map.activationPrinciples) && map.activationPrinciples.length >= 4, "activation principles must be explicit");
  ensure(Array.isArray(map.capabilityLanes) && map.capabilityLanes.length >= 5, "at least five capability lanes are required");
  ensure(map.automationContract?.workspaceAutomation === "seis-agresif-kod-gelistirme-ve-yayin", "workspace automation id must be linked");
  ensure(String(map.automationContract?.pushPolicy || "").includes("never force push"), "push policy must forbid force push");
  ensure(map.serverUploadGate?.status === "blocked-until-target-selected", "server upload must remain blocked until target selection");
  ensure(Array.isArray(map.liveReadinessMatrix) && map.liveReadinessMatrix.length >= 8, "live readiness matrix must include at least eight entries");

  const readinessIds = new Set((map.liveReadinessMatrix || []).map((entry) => entry.id));
  for (const id of ["github-cli", "browser", "figma", "playwright", "output-ai", "cloud-hosting-connectors"]) {
    ensure(readinessIds.has(id), `live readiness matrix missing ${id}`);
  }

  for (const entry of map.liveReadinessMatrix || []) {
    ensure(entry.type, `readiness entry ${entry.id || "unknown"} must define type`);
    ensure(entry.status, `readiness entry ${entry.id || "unknown"} must define status`);
    ensure(Array.isArray(entry.useFor) && entry.useFor.length > 0, `readiness entry ${entry.id || "unknown"} must define useFor`);
    ensure(entry.guard, `readiness entry ${entry.id || "unknown"} must define guard`);
  }

  const cloudLane = (map.capabilityLanes || []).find((lane) => lane.id === "cloud-environment");
  const cloudSurfaces = new Set(cloudLane?.surfaces || []);
  for (const surface of ["Azure Static Web Apps", "AWS Amplify static", "Firebase Hosting"]) {
    ensure(cloudSurfaces.has(surface), `cloud lane missing ${surface}`);
  }

  for (const lane of map.capabilityLanes || []) {
    ensure(lane.id, "each capability lane must define id");
    ensure(Array.isArray(lane.surfaces) && lane.surfaces.length > 0, `lane ${lane.id || "unknown"} must define surfaces`);
    ensure(Array.isArray(lane.allowedActions) && lane.allowedActions.length > 0, `lane ${lane.id || "unknown"} must define allowed actions`);
    ensure(Array.isArray(lane.blockedActions) && lane.blockedActions.length > 0, `lane ${lane.id || "unknown"} must define blocked actions`);
    ensureQualityCommandsExist(lane.qualityCommands, `lane ${lane.id || "unknown"}`);
  }
}

if (registry) {
  const connectors = registry.connectors || [];
  const skills = registry.skills || [];
  ensure(connectors.length >= 14, "connector registry must include at least fourteen candidates");
  ensure(new Set(skills).size >= 24, "skill registry must include at least twenty-four unique candidates");
  ensure(new Set(skills).size === skills.length, "skill registry must not contain duplicate entries");
  for (const id of ["github", "figma", "browser", "playwright", "semgrep", "linear", "notion", "google-drive"]) {
    ensure(connectors.some((connector) => connector.id === id), `connector registry missing ${id}`);
  }
  for (const connector of connectors) {
    ensureQualityCommandsExist(connector.qualityCommands, `connector ${connector.id || "unknown"}`);
  }

  ensure(registry.ecosystemActivation?.pluginCatalog === "content/development/plugin-capability-catalog.json", "registry must point to the plugin capability catalog");
}

if (pluginCatalog) {
  ensure(pluginCatalog.id === "seis-plugin-capability-catalog", "plugin catalog id must stay stable");
  ensure(pluginCatalog.mode === "family-routed-safe-activation", "plugin catalog mode must stay family-routed-safe-activation");
  ensure(pluginCatalog.branch === "UIXAppTTR", "plugin catalog must target UIXAppTTR");
  ensure(Array.isArray(pluginCatalog.activationGates) && pluginCatalog.activationGates.length >= 6, "plugin catalog must define activation gates");
  ensure(Array.isArray(pluginCatalog.families) && pluginCatalog.families.length >= pluginCatalog.reporting?.minimumFamilies, "plugin catalog must include enough capability families");

  const allPlugins = [];
  for (const family of pluginCatalog.families || []) {
    ensure(family.id, "each plugin catalog family must define id");
    ensure(family.purpose, `plugin family ${family.id || "unknown"} must define purpose`);
    ensure(family.defaultMode, `plugin family ${family.id || "unknown"} must define default mode`);
    ensure(family.liveGate, `plugin family ${family.id || "unknown"} must define live gate`);
    ensure(Array.isArray(family.plugins) && family.plugins.length > 0, `plugin family ${family.id || "unknown"} must include plugins`);
    allPlugins.push(...(family.plugins || []));
  }

  const uniquePlugins = new Set(allPlugins);
  ensure(uniquePlugins.size === allPlugins.length, "plugin catalog must not contain duplicate plugin ids");
  ensure(uniquePlugins.size >= pluginCatalog.reporting?.minimumUniquePlugins, "plugin catalog must include the requested broad plugin universe");
}

if (failures.length > 0) {
  console.error("SEIS aggressive capability map check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS aggressive capability map check passed.");
