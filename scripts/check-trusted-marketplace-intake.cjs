#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const intakePath = path.join(ROOT, "content", "development", "trusted-marketplace-intake.json");
const docsPath = path.join(ROOT, "docs", "development", "trusted-marketplace-intake.md");
const pluginCatalogPath = path.join(ROOT, "content", "development", "plugin-capability-catalog.json");
const publicBridgePath = path.join(ROOT, "content", "development", "seis-trusted-marketplace-plugin.json");
const marketplacePath = path.join(ROOT, ".agents", "plugins", "marketplace.json");
const bundleCatalogPath = path.join(ROOT, "content", "development", "seis-public-plugin-bundle-catalog.json");
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

const intake = readJson(intakePath);
const pluginCatalog = readJson(pluginCatalogPath);
const publicBridge = readJson(publicBridgePath);
const marketplace = readJson(marketplacePath);
const bundleCatalog = readJson(bundleCatalogPath);
const docs = readText(docsPath);

if (intake) {
  ensure(intake.version === 2, "intake schema version must be 2");
  ensure(intake.id === "seis-trusted-marketplace-intake", "intake id must stay stable");
  ensure(intake.mode === "curated-marketplace-readiness", "intake mode must stay curated-marketplace-readiness");
  ensure(intake.branch === "UIXAppTTR", "intake must target UIXAppTTR");
  ensure(Array.isArray(intake.nonCoderWorkflow) && intake.nonCoderWorkflow.length >= 4, "non-coder workflow must stay explicit");
  ensure(Array.isArray(intake.trustSignals) && intake.trustSignals.length >= 5, "trust signals must include enough review criteria");
  ensure(Array.isArray(intake.blockedSignals) && intake.blockedSignals.includes("deprecated_github_app_based_copilot_extension"), "deprecated Copilot extension path must remain blocked");
  ensure(Array.isArray(intake.marketplaceChannels) && intake.marketplaceChannels.length >= 5, "marketplace channels must be listed");
  ensure(Array.isArray(intake.trustedSourceShortlist) && intake.trustedSourceShortlist.length >= 8, "trusted source shortlist must include enough candidates");
  ensure(Array.isArray(intake.publishingPath) && intake.publishingPath.length >= 4, "publishing path must stay staged");
  ensure((intake.qualityCommands || []).includes("npm run check:trusted-marketplace-intake"), "intake must reference its validator");
  ensure(intake.publicCodexPlugin?.name === "seis-trusted-marketplace", "intake must name the public trusted marketplace plugin");
  ensure(intake.publicCodexPlugin?.marketplaceName === "seis-repo", "intake must use the public seis-repo marketplace");
  ensure(intake.publicCodexPlugin?.sourcePath === "plugins/seis-core/seis-trusted-marketplace", "intake must use the public app-owned source path");
  ensure(intake.publicCodexPlugin?.publicRepositoryAvailable === true, "intake source must remain available in the public repository");
  ensure(intake.publicCodexPlugin?.marketplaceDiscoverable === true, "intake source must remain discoverable through a bundle");
  ensure(intake.publicCodexPlugin?.marketplaceCard === false, "intake source must not expose a direct marketplace card");
  ensure(intake.publicCodexPlugin?.marketplacePresentation === "retained-source-through-bundle-card", "intake marketplace presentation is invalid");
  ensure(intake.publicCodexPlugin?.distributionBundleId === "seis-application-bundle-06", "intake distribution bundle is invalid");
  ensure(intake.publicCodexPlugin?.distributionBundleSourcePath === "./plugins/seis-bundles/seis-application-bundle-06", "intake distribution bundle path is invalid");
  ensure(intake.publicCodexPlugin?.distributionInstallId === "seis-application-bundle-06@seis-repo", "intake distribution install id is invalid");
  ensure(intake.publicCodexPlugin?.directInstallAvailable === false, "intake source must not claim a standalone install");
  ensure(intake.publicCodexPlugin?.activationPolicy === "approval-gated", "intake must keep trusted-source activation approval-gated");
  ensure(intake.publicCodexPlugin?.contract === "content/development/seis-trusted-marketplace-plugin.json", "intake must link the public trusted marketplace contract");
  ensure(intake.currentMarketplaceProjection?.classification === "current-curated-bundle-projection", "intake current projection classification is invalid");
  ensure(intake.currentMarketplaceProjection?.current === true, "intake current projection must be marked current");
  ensure(intake.currentMarketplaceProjection?.publicCardCount === 34, "intake current public-card count is invalid");
  ensure(intake.currentMarketplaceProjection?.canonicalCardCount === 1, "intake current canonical-card count is invalid");
  ensure(intake.currentMarketplaceProjection?.bundleCardCount === 33, "intake current bundle-card count is invalid");
  ensure(intake.currentMarketplaceProjection?.applicationBundleCardCount === 6, "intake current application-bundle count is invalid");
  ensure(intake.currentMarketplaceProjection?.topicBundleCardCount === 27, "intake current topic-bundle count is invalid");
  ensure(intake.currentMarketplaceProjection?.retainedSourceCapabilityCount === 380, "intake current retained-source count is invalid");
  ensure(intake.currentMarketplaceProjection?.directSourceCardCount === 0, "intake current direct-source card count must be zero");
  ensure(!/\bpersonal\b/i.test(JSON.stringify(intake.publicCodexPlugin)), "public intake plugin metadata must not contain personal terminology");
  ensure(!/\/Users\/|\/home\/|[A-Za-z]:\\/.test(JSON.stringify(intake.publicCodexPlugin)), "public intake plugin metadata must not store machine paths");

  const channelIds = new Set((intake.marketplaceChannels || []).map((channel) => channel.id));
  for (const id of [
    "github-mcp-registry",
    "github-marketplace-actions",
    "github-marketplace-apps",
    "github-models",
    "awesome-github-copilot",
    "github-app-copilot-extensions"
  ]) {
    ensure(channelIds.has(id), `marketplace channels missing ${id}`);
  }

  for (const channel of intake.marketplaceChannels || []) {
    ensure(channel.label, `channel ${channel.id || "unknown"} must define label`);
    ensure(channel.status, `channel ${channel.id || "unknown"} must define status`);
    ensure(Array.isArray(channel.bestFor) && channel.bestFor.length > 0, `channel ${channel.id || "unknown"} must define bestFor`);
    ensure(channel.gate, `channel ${channel.id || "unknown"} must define gate`);
    ensure(channel.nextAction, `channel ${channel.id || "unknown"} must define nextAction`);
    ensure(/^https:\/\//.test(String(channel.sourceUrl || "")), `channel ${channel.id || "unknown"} must define an https sourceUrl`);
  }

  const mcp = (intake.marketplaceChannels || []).find((channel) => channel.id === "github-mcp-registry");
  ensure(mcp?.status === "preferred-seis-channel", "MCP registry must remain the preferred SEIS channel");

  const retired = (intake.marketplaceChannels || []).find((channel) => channel.id === "github-app-copilot-extensions");
  ensure(retired?.status === "do-not-build-new", "GitHub App-based Copilot Extensions must stay blocked for new builds");

  for (const source of intake.trustedSourceShortlist || []) {
    ensure(source.id, "each trusted source must define id");
    ensure(channelIds.has(source.channel), `trusted source ${source.id || "unknown"} references unknown channel ${source.channel}`);
    ensure(source.publisher, `trusted source ${source.id || "unknown"} must define publisher`);
    ensure(source.family, `trusted source ${source.id || "unknown"} must define family`);
    ensure(source.designerValue, `trusted source ${source.id || "unknown"} must define designer value`);
    ensure(source.activationPosture, `trusted source ${source.id || "unknown"} must define activation posture`);
  }
}

if (pluginCatalog) {
  ensure(pluginCatalog.marketplaceIntake === "content/development/trusted-marketplace-intake.json", "plugin catalog must link the marketplace intake");
}

if (publicBridge) {
  ensure(publicBridge.status === "public-repository-successor", "trusted marketplace bridge must use public-repository-successor status");
  ensure(publicBridge.plugin?.marketplaceName === "seis-repo", "trusted marketplace bridge must use seis-repo");
  ensure(publicBridge.plugin?.sourcePath === "plugins/seis-core/seis-trusted-marketplace", "trusted marketplace bridge source path is invalid");
  ensure(publicBridge.plugin?.publicAudience === "everyone", "trusted marketplace bridge must be public to everyone");
  ensure(publicBridge.plugin?.publicMarketplace === true, "trusted marketplace bridge must remain public-marketplace discoverable");
  ensure(publicBridge.plugin?.marketplaceCard === false, "trusted marketplace bridge must reject a direct source card");
  ensure(publicBridge.plugin?.marketplacePresentation === "retained-source-through-bundle-card", "trusted marketplace bridge presentation is invalid");
  ensure(publicBridge.plugin?.distributionBundleId === "seis-application-bundle-06", "trusted marketplace bridge bundle id is invalid");
  ensure(publicBridge.plugin?.directInstallAvailable === false, "trusted marketplace bridge must reject a standalone install");
  ensure(publicBridge.activationBoundary?.externalActivation === "approval-required", "trusted marketplace bridge must gate external activation");
}

if (marketplace && bundleCatalog) {
  const entries = Array.isArray(marketplace.plugins) ? marketplace.plugins : [];
  const directCard = entries.find((entry) => entry?.name === "seis-trusted-marketplace");
  const bundleCard = entries.find((entry) => entry?.name === "seis-application-bundle-06");
  const memberships = (bundleCatalog.bundles || []).filter((bundle) => (bundle?.memberNames || []).includes("seis-trusted-marketplace"));
  ensure(entries.length === 34, "trusted marketplace intake must validate the current 34-card marketplace");
  ensure(!directCard, "trusted marketplace intake must reject a direct source card");
  ensure(Boolean(bundleCard), "trusted marketplace intake distribution bundle card is missing");
  ensure(bundleCard?.source?.path === "./plugins/seis-bundles/seis-application-bundle-06", "trusted marketplace intake distribution bundle path is invalid");
  ensure(memberships.length === 1 && memberships[0]?.id === "seis-application-bundle-06", "trusted marketplace intake source must resolve through exactly application bundle 06");
  ensure(bundleCatalog.marketplace?.canonicalCardCount === 1 && bundleCatalog.marketplace?.bundleCardCount === 33, "trusted marketplace intake current card composition is invalid");
  ensure(bundleCatalog.marketplace?.applicationBundleCardCount === 6 && bundleCatalog.marketplace?.topicBundleCardCount === 27, "trusted marketplace intake current bundle composition is invalid");
  ensure(bundleCatalog.sourceCapabilityInventory?.retainedSourcePackageCount === 380, "trusted marketplace intake retained-source count is invalid");
}

ensure(docs.includes("# SEIS Trusted Marketplace Intake"), "marketplace intake docs must keep the title");
ensure(docs.includes("content/development/trusted-marketplace-intake.json"), "marketplace docs must link the intake data");
ensure(docs.includes("npm run check:trusted-marketplace-intake"), "marketplace docs must include the validator command");
ensure(docs.includes("GitHub MCP Registry"), "marketplace docs must mention GitHub MCP Registry");
ensure(docs.includes("seis-application-bundle-06@seis-repo"), "marketplace docs must name the current distribution bundle");
ensure(docs.includes("Direct marketplace card: `false`"), "marketplace docs must state that the retained source has no direct card");
ensure(!docs.includes("seis-trusted-marketplace@seis-repo"), "marketplace docs must not present a stale standalone install id");

if (failures.length > 0) {
  console.error("Trusted marketplace intake check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Trusted marketplace intake check passed.");
