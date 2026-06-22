#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const intakePath = path.join(ROOT, "content", "development", "trusted-marketplace-intake.json");
const docsPath = path.join(ROOT, "docs", "development", "trusted-marketplace-intake.md");
const pluginCatalogPath = path.join(ROOT, "content", "development", "plugin-capability-catalog.json");
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
const docs = readText(docsPath);

if (intake) {
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

ensure(docs.includes("# SEIS Trusted Marketplace Intake"), "marketplace intake docs must keep the title");
ensure(docs.includes("content/development/trusted-marketplace-intake.json"), "marketplace docs must link the intake data");
ensure(docs.includes("npm run check:trusted-marketplace-intake"), "marketplace docs must include the validator command");
ensure(docs.includes("GitHub MCP Registry"), "marketplace docs must mention GitHub MCP Registry");

if (failures.length > 0) {
  console.error("Trusted marketplace intake check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Trusted marketplace intake check passed.");
