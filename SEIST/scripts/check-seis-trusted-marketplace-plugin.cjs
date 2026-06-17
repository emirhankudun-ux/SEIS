#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const contractPath = path.join(ROOT, "content", "development", "seis-trusted-marketplace-plugin.json");
const intakePath = path.join(ROOT, "content", "development", "trusted-marketplace-intake.json");
const pluginDownloadReadinessPath = path.join(ROOT, "content", "development", "plugin-download-readiness.json");
const docsPath = path.join(ROOT, "docs", "development", "seis-trusted-marketplace-plugin.md");
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

function readText(file) {
  if (!fs.existsSync(file)) {
    failures.push(`Missing ${path.relative(ROOT, file)}`);
    return "";
  }

  return fs.readFileSync(file, "utf8");
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureQualityCommandsExist(commands, scripts, owner) {
  ensure(Array.isArray(commands) && commands.length > 0, `${owner} must define qualityCommands`);

  for (const command of commands || []) {
    const match = /^npm run ([a-z0-9:-]+)$/i.exec(command);
    ensure(Boolean(match), `${owner} quality command must use npm run <script>: ${command}`);
    if (match) {
      ensure(Boolean(scripts[match[1]]), `${owner} quality command references missing npm script: ${command}`);
    }
  }
}

function ensureExactIds(actualIds, expectedIds, owner) {
  const actual = new Set(actualIds || []);
  ensure(actual.size === expectedIds.length, `${owner} must expose exactly ${expectedIds.length} ids`);
  for (const id of expectedIds) {
    ensure(actual.has(id), `${owner} missing ${id}`);
  }
}

const contract = readJson(contractPath);
const intake = readJson(intakePath);
const pluginDownloadReadiness = readJson(pluginDownloadReadinessPath);
const pkg = readJson(packagePath);
const docs = readText(docsPath);

if (contract) {
  ensure(contract.id === "seis-trusted-marketplace-plugin", "plugin contract id must stay stable");
  ensure(contract.status === "local-personal-bridge", "plugin contract status must stay local-personal-bridge");
  ensure(contract.plugin?.name === "seis-trusted-marketplace", "plugin contract must name seis-trusted-marketplace");
  ensure(contract.plugin?.displayName === "SEIS Trusted Marketplace", "plugin contract must keep the display name");
  ensure(contract.plugin?.marketplaceName === "personal", "plugin contract must use the personal marketplace");
  ensure(contract.plugin?.connectionAsset === "assets/seis-repo-connection.json", "plugin contract must point to the connection asset");
  ensure(contract.plugin?.capabilityAsset === "assets/capability-map.json", "plugin contract must point to the capability asset");
  ensure(contract.plugin?.bridgeHealthSnapshot === "assets/bridge-health-snapshot.json", "plugin contract must point to the bridge health snapshot");
  ensure(contract.plugin?.requestedEcosystemBundle === "assets/requested-ecosystem-bundle.json", "plugin contract must point to the requested ecosystem bundle");
  ensure(contract.plugin?.optionalForRemote === true, "plugin local source must be optional for remote checks");
  ensure(contract.pluginRepository?.name === "seis-trusted-marketplace-plugin", "plugin contract must name the plugin source repository");
  ensure(contract.pluginRepository?.mode === "private-personal", "plugin source repository must stay private-personal by default");
  ensure(contract.pluginRepository?.githubRemote === "https://github.com/emirhankudun-ux/seis-trusted-marketplace-plugin.git", "plugin source repository remote must stay stable");
  ensure(contract.repository?.name === "UIX-Apps", "plugin contract must target UIX-Apps");
  ensure(contract.repository?.branch === "UIXAppTTR", "plugin contract must target UIXAppTTR");
  ensure(contract.repository?.githubRemote === "https://github.com/emirhankudun-ux/UIX-Apps.git", "plugin contract must target the UIX-Apps GitHub remote");
  ensure(Array.isArray(contract.capabilityLanes) && contract.capabilityLanes.length === 8, "plugin contract must define the eight capability lanes");
  ensure(Array.isArray(contract.bridgeHealthChecks) && contract.bridgeHealthChecks.length === 5, "plugin contract must define the bridge health checks");
  ensureExactIds(contract.bridgeHealthChecks || [], [
    "manifest-parity",
    "private-personal-mode",
    "uixappttr-binding",
    "github-workflow",
    "safe-install-docs"
  ], "plugin contract bridge health checks");
  ensure(Array.isArray(contract.designerWorkflow) && contract.designerWorkflow.length >= 4, "plugin contract must keep designer workflow steps");
  ensure(Array.isArray(contract.safetyRules) && contract.safetyRules.length >= 4, "plugin contract must keep safety rules");

  for (const repoContract of contract.repoContracts || []) {
    ensure(fs.existsSync(path.join(ROOT, repoContract)), `repo contract path must exist: ${repoContract}`);
  }

  if (pkg) {
    ensureQualityCommandsExist(contract.qualityCommands, pkg.scripts || {}, "plugin contract");
  }

  const pluginSourcePath = contract.plugin?.sourcePath;
  if (pluginSourcePath && fs.existsSync(pluginSourcePath)) {
    const pluginManifest = readJson(path.join(pluginSourcePath, ".codex-plugin", "plugin.json"));
    const pluginPackage = readJson(path.join(pluginSourcePath, "package.json"));
    const connectionAsset = readJson(path.join(pluginSourcePath, contract.plugin.connectionAsset));
    const capabilityAsset = readJson(path.join(pluginSourcePath, contract.plugin.capabilityAsset));
    ensure(fs.existsSync(path.join(pluginSourcePath, "skills", "seis-trusted-marketplace", "SKILL.md")), "local plugin skill must exist");
    ensure(fs.existsSync(path.join(pluginSourcePath, "scripts", "validate-plugin.mjs")), "local plugin validator must exist");
    ensure(fs.existsSync(path.join(pluginSourcePath, "scripts", "plugin-doctor.mjs")), "local plugin doctor must exist");
    ensure(fs.existsSync(path.join(pluginSourcePath, "scripts", "create-bridge-health-snapshot.mjs")), "local plugin bridge snapshot generator must exist");
    ensure(fs.existsSync(path.join(pluginSourcePath, "scripts", "create-requested-ecosystem-bundle.mjs")), "local plugin requested ecosystem bundle generator must exist");
    ensure(fs.existsSync(path.join(pluginSourcePath, "assets", "bridge-health-snapshot.json")), "local plugin bridge health snapshot must exist");
    ensure(fs.existsSync(path.join(pluginSourcePath, "assets", "requested-ecosystem-bundle.json")), "local plugin requested ecosystem bundle must exist");
    ensure(fs.existsSync(path.join(pluginSourcePath, ".github", "workflows", "validate.yml")), "local plugin GitHub validation workflow must exist");

    if (pluginManifest) {
      ensure(pluginManifest.name === contract.plugin.name, "local plugin manifest name must match the repo contract");
      ensure(pluginManifest.interface?.displayName === contract.plugin.displayName, "local plugin display name must match the repo contract");
    }

    if (pluginPackage) {
      ensure(Boolean(pluginPackage.scripts?.["doctor:strict"]), "local plugin package must expose doctor:strict");
      ensure(Boolean(pluginPackage.scripts?.["bridge:snapshot"]), "local plugin package must expose bridge:snapshot");
      ensure(Boolean(pluginPackage.scripts?.["bridge:snapshot:check"]), "local plugin package must expose bridge:snapshot:check");
      ensure(Boolean(pluginPackage.scripts?.["ecosystem:bundle"]), "local plugin package must expose ecosystem:bundle");
      ensure(Boolean(pluginPackage.scripts?.["ecosystem:bundle:check"]), "local plugin package must expose ecosystem:bundle:check");
      ensure((pluginPackage.scripts?.check || "").includes("doctor:strict"), "local plugin check script must fail on doctor readiness regressions");
      ensure((pluginPackage.scripts?.check || "").includes("bridge:snapshot:check"), "local plugin check script must verify the bridge snapshot without rewriting it");
      ensure((pluginPackage.scripts?.check || "").includes("ecosystem:bundle:check"), "local plugin check script must verify the requested ecosystem bundle without rewriting it");
    }

    if (connectionAsset) {
      ensure(connectionAsset.plugin?.name === contract.plugin.name, "connection asset plugin name must match the repo contract");
      ensure(connectionAsset.pluginRepository?.githubRemote === contract.pluginRepository.githubRemote, "connection asset plugin repository remote must match the repo contract");
      ensure(connectionAsset.repository?.githubRemote === contract.repository.githubRemote, "connection asset remote must match the repo contract");
      ensure(connectionAsset.repository?.branch === contract.repository.branch, "connection asset branch must match the repo contract");
      ensure((connectionAsset.repoContracts || []).includes("content/development/seis-trusted-marketplace-plugin.json"), "connection asset must include the repo bridge contract");
    }

    if (capabilityAsset) {
      const capabilityIds = new Set((capabilityAsset.capabilities || []).map((capability) => capability.id));
      for (const lane of contract.capabilityLanes || []) {
        ensure(capabilityIds.has(lane), `capability asset must include ${lane}`);
      }
    }

    const bridgeSnapshot = readJson(path.join(pluginSourcePath, "assets", "bridge-health-snapshot.json"));
    if (bridgeSnapshot) {
      ensure(bridgeSnapshot.id === "seis-trusted-marketplace-bridge-health-snapshot", "bridge snapshot id must stay stable");
      ensure(bridgeSnapshot.schemaVersion === 1, "bridge snapshot schema version must stay stable");
      ensure(bridgeSnapshot.mode === contract.pluginRepository.mode, "bridge snapshot mode must match the repo contract");
      ensure(bridgeSnapshot.plugin?.name === contract.plugin.name, "bridge snapshot plugin name must match the repo contract");
      ensure(Boolean(bridgeSnapshot.plugin?.version), "bridge snapshot must expose plugin version");
      if (pluginManifest) {
        ensure(bridgeSnapshot.plugin.version === pluginManifest.version, "bridge snapshot plugin version must match the local plugin manifest");
      }
      ensure(bridgeSnapshot.repositoryBinding?.productRepository === contract.repository.githubRemote, "bridge snapshot product repository must match the repo contract");
      ensure(bridgeSnapshot.repositoryBinding?.branch === contract.repository.branch, "bridge snapshot branch must match the repo contract");
      ensure(bridgeSnapshot.marketplace?.installation === "codex plugin add seis-trusted-marketplace@personal", "bridge snapshot must keep the personal install command");
      ensureExactIds(bridgeSnapshot.policy?.requiredCheckIds || [], contract.bridgeHealthChecks || [], "bridge snapshot required checks");
      ensureExactIds(bridgeSnapshot.policy?.requiredCapabilityIds || [], contract.capabilityLanes || [], "bridge snapshot required capabilities");
      ensureExactIds((bridgeSnapshot.checks || []).map((check) => check.id), contract.bridgeHealthChecks || [], "bridge snapshot checks");
      ensureExactIds((bridgeSnapshot.capabilityReadiness || []).map((lane) => lane.id), contract.capabilityLanes || [], "bridge snapshot capability readiness");
      ensure(bridgeSnapshot.summary?.checksPassed === bridgeSnapshot.summary?.checksTotal, "bridge snapshot checks must all pass");
      ensure(bridgeSnapshot.summary?.lanesReady === contract.capabilityLanes.length, "bridge snapshot must report all capability lanes ready");
      const readyLanes = new Set((bridgeSnapshot.capabilityReadiness || []).filter((lane) => lane.status === "ready").map((lane) => lane.id));
      for (const lane of contract.capabilityLanes || []) {
        ensure(readyLanes.has(lane), `bridge snapshot must mark ${lane} ready`);
      }
    }

    const ecosystemBundle = readJson(path.join(pluginSourcePath, "assets", "requested-ecosystem-bundle.json"));
    if (ecosystemBundle) {
      ensure(ecosystemBundle.id === "seis-requested-ecosystem-bundle", "requested ecosystem bundle id must stay stable");
      ensure(ecosystemBundle.mode === "curated-not-activated", "requested ecosystem bundle must stay curated-not-activated");
      ensure(ecosystemBundle.summary?.upstreamPlugins === pluginDownloadReadiness.summary?.uniquePlugins, "requested ecosystem bundle upstream count must match UIX plugin download readiness");
      ensure(ecosystemBundle.summary?.totalPlugins >= pluginDownloadReadiness.summary?.uniquePlugins + 3, "requested ecosystem bundle must include UIX inventory plus local requested additions");
      ensure((ecosystemBundle.policy?.requiredLocalUris || []).includes("plugin://seis-trusted-marketplace@personal"), "requested ecosystem bundle must include the personal SEIS plugin");
      ensure((ecosystemBundle.policy?.requiredLocalUris || []).includes("plugin://magicpath@openai-curated"), "requested ecosystem bundle must include MagicPath");
      ensure((ecosystemBundle.policy?.requiredLocalUris || []).includes("plugin://superhuman@openai-curated"), "requested ecosystem bundle must include Superhuman");
      ensure((ecosystemBundle.plugins || []).every((plugin) => plugin.activationPolicy === "activate_only_when_relevant_authenticated_scoped_and_user_approved"), "requested ecosystem bundle must keep every plugin behind activation gates");
    }
  }
}

if (intake) {
  ensure(intake.localCodexPlugin === "content/development/seis-trusted-marketplace-plugin.json", "marketplace intake must link the local Codex plugin bridge");
  ensure((intake.qualityCommands || []).includes("npm run check:seis-trusted-marketplace-plugin"), "marketplace intake must reference the plugin bridge validator");
}

ensure(docs.includes("# SEIS Trusted Marketplace Plugin"), "plugin docs must keep the title");
ensure(docs.includes("seis-trusted-marketplace"), "plugin docs must name the plugin");
ensure(docs.includes("seis-trusted-marketplace-plugin"), "plugin docs must name the plugin source repository");
ensure(docs.includes("UIXAppTTR"), "plugin docs must name the branch");
ensure(docs.includes("npm run doctor"), "plugin docs must mention the plugin doctor command");
ensure(docs.includes("npm run doctor:strict"), "plugin docs must mention the strict plugin doctor command");
ensure(docs.includes("npm run ecosystem:bundle"), "plugin docs must mention the ecosystem bundle command");
ensure(docs.includes("data engineering"), "plugin docs must mention data engineering");
ensure(docs.includes("security"), "plugin docs must mention security");
ensure(docs.includes("testing"), "plugin docs must mention testing");
ensure(docs.includes("content/development/seis-trusted-marketplace-plugin.json"), "plugin docs must link the repo contract");
ensure(docs.includes("npm run check:seis-trusted-marketplace-plugin"), "plugin docs must include the validator command");

if (failures.length > 0) {
  console.error("SEIS trusted marketplace plugin check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS trusted marketplace plugin check passed.");
