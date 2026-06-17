#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  ".codex-plugin/plugin.json",
  "plugin.json",
  "skills/seis-trusted-marketplace/SKILL.md",
  "assets/seis-repo-connection.json",
  "assets/capability-map.json",
  "assets/marketplace-listing.json",
  "assets/bridge-health-snapshot.json",
  "assets/requested-ecosystem-bundle.json",
  "README.md",
  "CHANGELOG.md",
  "LICENSE",
  "docs/SEIS-UIXAppTTR-branch-binding.md",
  "docs/install-update-remove.md",
  "docs/publication-readiness.md",
  "docs/marketplace-setup.md",
  "docs/operations.md",
  "examples/personal-marketplace.example.json",
  ".github/workflows/validate.yml",
  "scripts/plugin-doctor.mjs",
  "scripts/create-bridge-health-snapshot.mjs",
  "scripts/create-requested-ecosystem-bundle.mjs"
];

function fail(message) {
  failures.push(message);
}

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    fail(`Missing ${relativePath}`);
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    fail(`Invalid JSON in ${relativePath}: ${error.message}`);
    return null;
  }
}

function readText(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    fail(`Missing ${relativePath}`);
    return "";
  }

  return fs.readFileSync(fullPath, "utf8");
}

function ensure(condition, message) {
  if (!condition) fail(message);
}

for (const relativePath of requiredFiles) {
  ensure(fs.existsSync(path.join(root, relativePath)), `Required file missing: ${relativePath}`);
}

const codexManifest = readJson(".codex-plugin/plugin.json");
const rootManifest = readJson("plugin.json");
const connection = readJson("assets/seis-repo-connection.json");
const capabilityMap = readJson("assets/capability-map.json");
const marketplaceListing = readJson("assets/marketplace-listing.json");
const bridgeSnapshot = readJson("assets/bridge-health-snapshot.json");
const ecosystemBundle = readJson("assets/requested-ecosystem-bundle.json");
const marketplaceExample = readJson("examples/personal-marketplace.example.json");
const skill = readText("skills/seis-trusted-marketplace/SKILL.md");
const readme = readText("README.md");
const branchDocs = readText("docs/SEIS-UIXAppTTR-branch-binding.md");
const workflow = readText(".github/workflows/validate.yml");

if (codexManifest && rootManifest) {
  ensure(codexManifest.name === "seis-trusted-marketplace", "Codex manifest name must stay stable");
  ensure(rootManifest.name === codexManifest.name, "Root manifest name must match Codex manifest");
  ensure(rootManifest.version === codexManifest.version, "Root manifest version must match Codex manifest");
  ensure(codexManifest.skills === "./skills/", "Codex manifest must point to skills directory");
  ensure(rootManifest.skills === "./skills/", "Root manifest must point to skills directory");
  ensure(codexManifest.interface?.displayName === "SEIS Trusted Marketplace", "Display name must stay stable");
  ensure(Array.isArray(codexManifest.interface?.capabilities), "Codex manifest must expose capabilities");
}

const requiredCapabilityIds = [
  "data-engineering",
  "development",
  "design",
  "learning",
  "monitoring",
  "productivity",
  "security",
  "testing"
];
const requiredCheckIds = [
  "manifest-parity",
  "private-personal-mode",
  "uixappttr-binding",
  "github-workflow",
  "safe-install-docs"
];

function ensureExactIds(actualIds, expectedIds, label) {
  const actual = new Set(actualIds || []);
  ensure(actual.size === expectedIds.length, `${label} must expose exactly ${expectedIds.length} ids`);
  for (const id of expectedIds) {
    ensure(actual.has(id), `${label} missing ${id}`);
  }
}

if (capabilityMap) {
  ensure(capabilityMap.id === "seis-trusted-marketplace-capability-map", "Capability map id must stay stable");
  const ids = new Set((capabilityMap.capabilities || []).map((capability) => capability.id));
  for (const id of requiredCapabilityIds) {
    ensure(ids.has(id), `Capability map missing ${id}`);
  }

  for (const capability of capabilityMap.capabilities || []) {
    ensure(capability.label, `Capability ${capability.id || "unknown"} must define label`);
    ensure(capability.designerValue, `Capability ${capability.id || "unknown"} must define designerValue`);
    ensure((capability.routingSignals || []).length >= 4, `Capability ${capability.id || "unknown"} needs routing signals`);
    ensure((capability.activationGates || []).length >= 4, `Capability ${capability.id || "unknown"} needs activation gates`);
    ensure((capability.qualitySignals || []).length >= 4, `Capability ${capability.id || "unknown"} needs quality signals`);
  }
}

if (connection) {
  ensure(connection.id === "seis-trusted-marketplace-repo-connection", "Connection asset id must stay stable");
  ensure(connection.plugin?.name === "seis-trusted-marketplace", "Connection asset must name the plugin");
  ensure(connection.pluginRepository?.name === "seis-trusted-marketplace-plugin", "Connection asset must name the plugin source repository");
  ensure(connection.repository?.branch === "UIXAppTTR", "Connection asset must bind to UIXAppTTR");
  ensure(connection.repository?.githubRemote === "https://github.com/emirhankudun-ux/UIX-Apps.git", "Connection asset must bind to UIX-Apps remote");
}

if (marketplaceListing) {
  ensure(marketplaceListing.privatePersonal?.recommended === true, "Marketplace listing must recommend private personal mode");
  ensure(marketplaceListing.privatePersonal?.installation === "codex plugin add seis-trusted-marketplace@personal", "Marketplace listing must include install command");
  ensure(Array.isArray(marketplaceListing.publicPublishReady?.recommendedBeforePublicRelease), "Marketplace listing must include public readiness checklist");
}

if (bridgeSnapshot) {
  ensure(bridgeSnapshot.id === "seis-trusted-marketplace-bridge-health-snapshot", "Bridge snapshot id must stay stable");
  ensure(bridgeSnapshot.schemaVersion === 1, "Bridge snapshot schema version must stay stable");
  ensure(bridgeSnapshot.mode === "private-personal", "Bridge snapshot must keep private-personal mode");
  ensure(bridgeSnapshot.plugin?.name === "seis-trusted-marketplace", "Bridge snapshot must name the plugin");
  ensure(bridgeSnapshot.repositoryBinding?.branch === "UIXAppTTR", "Bridge snapshot must bind to UIXAppTTR");
  ensure(bridgeSnapshot.marketplace?.installation === "codex plugin add seis-trusted-marketplace@personal", "Bridge snapshot must keep the personal install command");
  ensureExactIds(bridgeSnapshot.policy?.requiredCheckIds, requiredCheckIds, "Bridge snapshot required check policy");
  ensureExactIds(bridgeSnapshot.policy?.requiredCapabilityIds, requiredCapabilityIds, "Bridge snapshot required capability policy");
  ensureExactIds((bridgeSnapshot.checks || []).map((check) => check.id), requiredCheckIds, "Bridge snapshot checks");
  ensureExactIds((bridgeSnapshot.capabilityReadiness || []).map((capability) => capability.id), requiredCapabilityIds, "Bridge snapshot capability readiness");
  ensure(bridgeSnapshot.summary?.checksPassed === bridgeSnapshot.summary?.checksTotal, "Bridge snapshot checks must all pass");
  ensure(bridgeSnapshot.summary?.lanesReady === requiredCapabilityIds.length, "Bridge snapshot must report all capability lanes ready");
  ensure((bridgeSnapshot.capabilityReadiness || []).length === requiredCapabilityIds.length, "Bridge snapshot must include all capability lanes");
}

if (ecosystemBundle) {
  ensure(ecosystemBundle.id === "seis-requested-ecosystem-bundle", "Requested ecosystem bundle id must stay stable");
  ensure(ecosystemBundle.mode === "curated-not-activated", "Requested ecosystem bundle must stay curated-not-activated");
  ensure(ecosystemBundle.summary?.totalPlugins >= 303, "Requested ecosystem bundle must include the UIX inventory plus local requested additions");
  ensure(ecosystemBundle.summary?.uniquePluginUris === ecosystemBundle.summary?.totalPlugins, "Requested ecosystem bundle plugin URIs must stay unique");
  ensure((ecosystemBundle.policy?.requiredLocalUris || []).includes("plugin://seis-trusted-marketplace@personal"), "Requested ecosystem bundle must include the personal SEIS plugin");
  ensure((ecosystemBundle.policy?.requiredLocalUris || []).includes("plugin://magicpath@openai-curated"), "Requested ecosystem bundle must include MagicPath");
  ensure((ecosystemBundle.policy?.requiredLocalUris || []).includes("plugin://superhuman@openai-curated"), "Requested ecosystem bundle must include Superhuman");
  ensure((ecosystemBundle.plugins || []).every((plugin) => plugin.activationPolicy === "activate_only_when_relevant_authenticated_scoped_and_user_approved"), "Requested ecosystem bundle must keep every plugin behind activation gates");
}

if (marketplaceExample) {
  const plugin = marketplaceExample.plugins?.[0];
  ensure(marketplaceExample.name === "personal", "Example marketplace must be named personal");
  ensure(plugin?.name === "seis-trusted-marketplace", "Example marketplace must reference the plugin");
  ensure(plugin?.policy?.installation === "AVAILABLE", "Example marketplace must include installation policy");
  ensure(plugin?.policy?.authentication === "ON_INSTALL", "Example marketplace must include authentication policy");
}

for (const phrase of [
  "Data Engineering",
  "Development",
  "Design",
  "Learning",
  "Monitoring",
  "Productivity",
  "Security",
  "Testing",
  "UIXAppTTR",
  "npm run validate"
]) {
  ensure(skill.includes(phrase) || readme.includes(phrase) || branchDocs.includes(phrase), `Documentation must mention ${phrase}`);
}

ensure(workflow.includes("npm run validate"), "GitHub workflow must run npm run validate");
ensure(workflow.includes("npm run doctor:strict"), "GitHub workflow must run npm run doctor:strict");
ensure(workflow.includes("npm run bridge:snapshot:check"), "GitHub workflow must check the bridge snapshot");
ensure(readme.includes("npm run doctor"), "README must document npm run doctor");
ensure(readme.includes("npm run doctor:strict"), "README must document npm run doctor:strict");
ensure(readme.includes("npm run ecosystem:bundle"), "README must document npm run ecosystem:bundle");

if (failures.length > 0) {
  console.error("SEIS Trusted Marketplace plugin validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS Trusted Marketplace plugin validation passed.");
