#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const contractPath = path.join(ROOT, "content", "development", "seis-trusted-marketplace-plugin.json");
const intakePath = path.join(ROOT, "content", "development", "trusted-marketplace-intake.json");
const marketplacePath = path.join(ROOT, ".agents", "plugins", "marketplace.json");
const bundleCatalogPath = path.join(ROOT, "content", "development", "seis-public-plugin-bundle-catalog.json");
const releaseTrainPath = path.join(ROOT, "content", "development", "seis-core-plugin-release-train.json");
const docsPath = path.join(ROOT, "docs", "development", "seis-trusted-marketplace-plugin.md");
const packagePath = path.join(ROOT, "package.json");
const pluginRoot = path.join(ROOT, "plugins", "seis-core", "seis-trusted-marketplace");
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

function assertPublicSafe(value, label) {
  const serialized = JSON.stringify(value || {});
  ensure(!/\bpersonal\b/i.test(serialized), `${label} must not contain active personal terminology`);
  ensure(!/\/Users\/|\/home\/|[A-Za-z]:\\/.test(serialized), `${label} must not store machine-specific paths`);
}

const contract = readJson(contractPath);
const intake = readJson(intakePath);
const marketplace = readJson(marketplacePath);
const bundleCatalog = readJson(bundleCatalogPath);
const releaseTrain = readJson(releaseTrainPath);
const pkg = readJson(packagePath);
const manifest = readJson(path.join(pluginRoot, ".codex-plugin", "plugin.json"));
const mcp = readJson(path.join(pluginRoot, ".mcp.json"));
const profile = readJson(path.join(pluginRoot, "assets", "plugin-profile.json"));
const docs = readText(docsPath);
const skill = readText(path.join(pluginRoot, "skills", "seis-trusted-marketplace", "SKILL.md"));
const entrypointPath = path.join(pluginRoot, "scripts", "seis-trusted-marketplace-mcp-server.mjs");
const currentRelease = releaseTrain?.currentRelease || {};

if (releaseTrain) {
  ensure(typeof currentRelease.label === "string" && currentRelease.label.length > 0, "release train must expose a current release label");
  ensure(typeof currentRelease.semver === "string" && currentRelease.semver.length > 0, "release train must expose a current strict semver");
}

if (contract) {
  ensure(contract.version === 2, "trusted marketplace bridge schema version must be 2");
  ensure(contract.id === "seis-trusted-marketplace-plugin", "trusted marketplace bridge id must stay stable");
  ensure(contract.status === "public-repository-successor", "trusted marketplace bridge must use public-repository-successor status");
  ensure(contract.plugin?.name === "seis-trusted-marketplace", "trusted marketplace bridge must name the public plugin");
  ensure(contract.plugin?.displayName === "SEIS Trusted Marketplace", "trusted marketplace bridge display name is invalid");
  ensure(contract.plugin?.marketplaceName === "seis-repo", "trusted marketplace bridge must use seis-repo");
  ensure(contract.plugin?.marketplacePath === ".agents/plugins/marketplace.json", "trusted marketplace bridge marketplace path is invalid");
  ensure(contract.plugin?.sourcePath === "plugins/seis-core/seis-trusted-marketplace", "trusted marketplace bridge source path is invalid");
  ensure(contract.plugin?.publicAudience === "everyone", "trusted marketplace bridge must be public to everyone");
  ensure(contract.plugin?.publicMarketplace === true, "trusted marketplace bridge must remain discoverable in the public marketplace");
  ensure(contract.plugin?.publicRepositoryAvailable === true, "trusted marketplace source must remain available in the public repository");
  ensure(contract.plugin?.marketplaceDiscoverable === true, "trusted marketplace source must remain discoverable through a bundle");
  ensure(contract.plugin?.marketplaceCard === false, "trusted marketplace source must not expose a direct marketplace card");
  ensure(contract.plugin?.marketplacePresentation === "retained-source-through-bundle-card", "trusted marketplace presentation must use a retained source through a bundle card");
  ensure(contract.plugin?.distributionBundleId === "seis-application-bundle-06", "trusted marketplace distribution bundle is invalid");
  ensure(contract.plugin?.distributionBundleSourcePath === "./plugins/seis-bundles/seis-application-bundle-06", "trusted marketplace distribution bundle path is invalid");
  ensure(contract.plugin?.distributionInstallId === "seis-application-bundle-06@seis-repo", "trusted marketplace distribution install id is invalid");
  ensure(contract.plugin?.directInstallAvailable === false, "trusted marketplace source must not claim a standalone install");
  ensure(contract.plugin?.activationPolicy === "approval-gated", "trusted marketplace bridge must keep activation approval-gated");
  ensure(contract.currentMarketplaceProjection?.classification === "current-curated-bundle-projection", "trusted marketplace current projection classification is invalid");
  ensure(contract.currentMarketplaceProjection?.current === true, "trusted marketplace current projection must be marked current");
  ensure(contract.currentMarketplaceProjection?.publicCardCount === 34, "trusted marketplace current public-card count is invalid");
  ensure(contract.currentMarketplaceProjection?.canonicalCardCount === 1, "trusted marketplace current canonical-card count is invalid");
  ensure(contract.currentMarketplaceProjection?.bundleCardCount === 33, "trusted marketplace current bundle-card count is invalid");
  ensure(contract.currentMarketplaceProjection?.applicationBundleCardCount === 6, "trusted marketplace current application-bundle count is invalid");
  ensure(contract.currentMarketplaceProjection?.topicBundleCardCount === 27, "trusted marketplace current topic-bundle count is invalid");
  ensure(contract.currentMarketplaceProjection?.retainedSourceCapabilityCount === 380, "trusted marketplace retained-source count is invalid");
  ensure(contract.currentMarketplaceProjection?.directSourceCardCount === 0, "trusted marketplace current direct-source card count must be zero");
  ensure(contract.pluginRepository?.name === "SEIS", "trusted marketplace canonical repository name is invalid");
  ensure(contract.pluginRepository?.mode === "public-repository-app-owned", "trusted marketplace repository mode is invalid");
  ensure(contract.pluginRepository?.canonicalRepository === "SEIS", "trusted marketplace canonical repository is invalid");
  ensure(contract.pluginRepository?.sourcePath === contract.plugin.sourcePath, "trusted marketplace repository source path must match plugin source");
  ensure(contract.pluginRepository?.public === true, "trusted marketplace repository must be public");
  ensure(contract.repository?.name === "SEIS", "trusted marketplace repository binding is invalid");
  ensure(contract.repository?.canonicalBranch === "main", "trusted marketplace canonical branch is invalid");
  ensure(contract.activationBoundary?.externalActivation === "approval-required", "trusted marketplace external activation must require approval");
  ensure(contract.activationBoundary?.network === "disabled-by-default", "trusted marketplace network must be disabled by default");
  ensure(contract.activationBoundary?.secrets === "not-read", "trusted marketplace must not read secrets");
  ensure(contract.activationBoundary?.writes === "disabled-by-default", "trusted marketplace writes must be disabled by default");
  ensure(contract.activationBoundary?.publicReleaseAllowed === false, "trusted marketplace must not claim public release approval");
  ensure(Array.isArray(contract.capabilityLanes) && contract.capabilityLanes.length === 8, "trusted marketplace must keep eight capability lanes");
  ensure(Array.isArray(contract.bridgeHealthChecks) && contract.bridgeHealthChecks.length >= 6, "trusted marketplace must keep explicit bundle and direct-card health checks");
  ensure(contract.bridgeHealthChecks.includes("seis-repo-application-bundle-06-binding"), "trusted marketplace must validate its application bundle binding");
  ensure(contract.bridgeHealthChecks.includes("zero-direct-source-card"), "trusted marketplace must validate the zero-direct-card boundary");
  ensure(Array.isArray(contract.designerWorkflow) && contract.designerWorkflow.length >= 4, "trusted marketplace designer workflow must be explicit");
  ensure(Array.isArray(contract.safetyRules) && contract.safetyRules.length >= 4, "trusted marketplace safety rules must be explicit");
  ensure(contract.migration?.legacyMode === "archived-non-active-reference", "trusted marketplace legacy source must be non-active");
  ensure(contract.migration?.legacyInstallationMutation === false, "trusted marketplace migration must not mutate legacy installations");
  ensure(contract.migration?.replacement === contract.plugin.sourcePath, "trusted marketplace replacement path must match plugin source");
  for (const repoContract of contract.repoContracts || []) {
    ensure(fs.existsSync(path.join(ROOT, repoContract)), `trusted marketplace repo contract path must exist: ${repoContract}`);
  }
  assertPublicSafe(contract, "trusted marketplace bridge");
}

if (marketplace) {
  ensure(marketplace.name === "seis-repo", "public marketplace name must be seis-repo");
  ensure(marketplace.interface?.displayName === "SEIS Repo", "public marketplace display name must be SEIS Repo");
  ensure(Array.isArray(marketplace.plugins) && marketplace.plugins.length === 34, "public marketplace must expose exactly 34 current cards");
  const directCard = (marketplace.plugins || []).find((entry) => entry?.name === "seis-trusted-marketplace");
  const bundleCard = (marketplace.plugins || []).find((entry) => entry?.name === "seis-application-bundle-06");
  ensure(!directCard, "public marketplace must not expose a direct seis-trusted-marketplace card");
  ensure(Boolean(bundleCard), "public marketplace must include seis-application-bundle-06");
  if (bundleCard) {
    ensure(bundleCard.source?.source === "local", "trusted marketplace bundle card source must be local repository source");
    ensure(bundleCard.source?.path === "./plugins/seis-bundles/seis-application-bundle-06", "trusted marketplace bundle card source path is invalid");
    ensure(bundleCard.policy?.installation === "AVAILABLE", "trusted marketplace bundle card must be available");
    ensure(bundleCard.policy?.authentication === "ON_INSTALL", "trusted marketplace bundle card authentication policy is invalid");
    ensure(bundleCard.category === "Developer", "trusted marketplace bundle card category is invalid");
  }
}

if (bundleCatalog) {
  ensure(bundleCatalog.marketplace?.publicCardCount === 34, "bundle catalog current public-card count is invalid");
  ensure(bundleCatalog.marketplace?.canonicalCardCount === 1, "bundle catalog current canonical-card count is invalid");
  ensure(bundleCatalog.marketplace?.bundleCardCount === 33, "bundle catalog current bundle-card count is invalid");
  ensure(bundleCatalog.marketplace?.applicationBundleCardCount === 6, "bundle catalog application-bundle count is invalid");
  ensure(bundleCatalog.marketplace?.topicBundleCardCount === 27, "bundle catalog topic-bundle count is invalid");
  ensure(bundleCatalog.sourceCapabilityInventory?.retainedSourcePackageCount === 380, "bundle catalog retained-source count is invalid");
  ensure(bundleCatalog.sourceCapabilityInventory?.sourcePackagesDeleted === false, "trusted marketplace validation must preserve retained source packages");
  const memberships = (bundleCatalog.bundles || []).filter((bundle) => (bundle?.memberNames || []).includes("seis-trusted-marketplace"));
  ensure(memberships.length === 1, "trusted marketplace source must resolve through exactly one bundle");
  ensure(memberships[0]?.id === "seis-application-bundle-06", "trusted marketplace source must resolve through application bundle 06");
}

if (manifest) {
  ensure(manifest.name === "seis-trusted-marketplace", "trusted marketplace manifest name is invalid");
  ensure(manifest.version === currentRelease.semver, "trusted marketplace manifest version must match the current app release");
  ensure(manifest.interface?.displayName === "SEIS Trusted Marketplace", "trusted marketplace manifest display name is invalid");
  ensure(manifest.mcpServers === "./.mcp.json", "trusted marketplace manifest must expose MCP metadata");
  ensure(manifest.license === "MIT", "trusted marketplace manifest must be MIT licensed");
  assertPublicSafe(manifest, "trusted marketplace manifest");
}

if (mcp) {
  ensure(mcp.mcpServers?.["seis-trusted-marketplace"]?.command === "node", "trusted marketplace MCP command is invalid");
  ensure(Array.isArray(mcp.mcpServers?.["seis-trusted-marketplace"]?.args), "trusted marketplace MCP args are missing");
  ensure(mcp.mcpServers?.["seis-trusted-marketplace"]?.args?.includes("scripts/seis-trusted-marketplace-mcp-server.mjs"), "trusted marketplace MCP entrypoint is invalid");
}

if (profile) {
  ensure(profile.stableId === "seis-trusted-marketplace", "trusted marketplace profile id is invalid");
  ensure(profile.version === currentRelease.semver, "trusted marketplace profile version must match the current app release");
  ensure(profile.releaseTrainVersion === currentRelease.label, "trusted marketplace profile release train must match the current app release");
  ensure(profile.sourceClassification === "public-SEIS-repository", "trusted marketplace profile source classification is invalid");
  ensure(profile.status === "approved-public-readonly", "trusted marketplace profile status is invalid");
  ensure(profile.implementationState === "functional-local-demo", "trusted marketplace profile implementation state is invalid");
  ensure(profile.permissions?.write?.length === 0, "trusted marketplace write permissions must be empty");
  ensure(profile.permissions?.network?.length === 0, "trusted marketplace network permissions must be empty");
  ensure(profile.permissions?.secrets?.length === 0, "trusted marketplace secret permissions must be empty");
  ensure(profile.publicAudience === "everyone", "trusted marketplace profile must be public to everyone");
  ensure(profile.publicMarketplace === true, "trusted marketplace profile must remain public-marketplace discoverable");
  ensure(profile.marketplaceDiscoverable === true, "trusted marketplace profile must remain marketplace discoverable");
  ensure(profile.marketplaceCard === false, "trusted marketplace profile must reject a direct source card");
  ensure(profile.marketplaceBundleId === "seis-application-bundle-06", "trusted marketplace profile bundle id is invalid");
  assertPublicSafe(profile, "trusted marketplace profile");
}

ensure(fs.existsSync(entrypointPath), "trusted marketplace MCP entrypoint must exist");
ensure(skill.includes("# SEIS Trusted Marketplace"), "trusted marketplace skill must keep its title");
ensure(skill.includes("approval"), "trusted marketplace skill must describe approval boundaries");
ensure(skill.includes("read-only"), "trusted marketplace skill must describe its read-only boundary");

if (intake) {
  ensure(intake.publicCodexPlugin?.name === "seis-trusted-marketplace", "trusted marketplace intake must name the public plugin");
  ensure(intake.publicCodexPlugin?.marketplaceName === "seis-repo", "trusted marketplace intake marketplace is invalid");
  ensure(intake.publicCodexPlugin?.sourcePath === "plugins/seis-core/seis-trusted-marketplace", "trusted marketplace intake source path is invalid");
  ensure(intake.publicCodexPlugin?.marketplaceCard === false, "trusted marketplace intake must reject a direct source card");
  ensure(intake.publicCodexPlugin?.marketplacePresentation === "retained-source-through-bundle-card", "trusted marketplace intake presentation is invalid");
  ensure(intake.publicCodexPlugin?.distributionBundleId === "seis-application-bundle-06", "trusted marketplace intake bundle id is invalid");
  ensure(intake.publicCodexPlugin?.distributionInstallId === "seis-application-bundle-06@seis-repo", "trusted marketplace intake bundle install id is invalid");
  ensure(intake.publicCodexPlugin?.directInstallAvailable === false, "trusted marketplace intake must reject a standalone install");
  ensure(intake.publicCodexPlugin?.activationPolicy === "approval-gated", "trusted marketplace intake activation policy is invalid");
  ensure(intake.publicCodexPlugin?.contract === "content/development/seis-trusted-marketplace-plugin.json", "trusted marketplace intake contract path is invalid");
}

if (pkg) {
  ensure(pkg.scripts?.["check:seis-trusted-marketplace-plugin"] === "node scripts/check-seis-trusted-marketplace-plugin.cjs", "package must expose trusted marketplace bridge validation");
  ensure(pkg.scripts?.["check:seis-core-trusted-marketplace"] === "node --test plugins/seis-core/test/trusted-marketplace.test.mjs", "package must expose public trusted marketplace validation");
}

ensure(docs.includes("# SEIS Trusted Marketplace Plugin"), "trusted marketplace docs must keep the title");
ensure(docs.includes("seis-application-bundle-06@seis-repo"), "trusted marketplace docs must name the current distribution bundle");
ensure(docs.includes("plugins/seis-core/seis-trusted-marketplace"), "trusted marketplace docs must link the public source path");
ensure(docs.includes("Marketplace card: `false`"), "trusted marketplace docs must state that the retained source has no direct card");
ensure(!docs.includes("seis-trusted-marketplace@seis-repo"), "trusted marketplace docs must not present a stale standalone install id");
ensure(docs.includes("approval"), "trusted marketplace docs must describe approval boundaries");
ensure(!/\bpersonal\b/i.test(docs), "trusted marketplace docs must not present a personal installation surface");
ensure(!/\/Users\/|\/home\/|[A-Za-z]:\\/.test(docs), "trusted marketplace docs must not store machine-specific paths");

if (failures.length > 0) {
  console.error("SEIS trusted marketplace plugin check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS trusted marketplace plugin check passed.");
