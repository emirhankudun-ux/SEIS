#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";

const files = {
  dashboard: "apps/seis-demo-web/data/seis-foundation-dashboard.json",
  sequence: "content/development/seis-pr0-pr1-pr2-implementation-sequence.json",
  agency: "content/development/seis-five-year-agency-orchestration-contract.json",
  mcp: "content/development/seis-mcp-permission-risk-matrix.json",
  stitch: "content/development/seis-stitch-ux-screen-catalog.json",
  swift: "content/development/seis-swift-apple-bridge-manifest.json"
};

const failures = [];

function fail(message) {
  failures.push(message);
}

function ensure(condition, message) {
  if (!condition) fail(message);
}

function readText(file) {
  if (!existsSync(file)) {
    fail(`missing ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function readJson(file) {
  const text = readText(file);
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    fail(`invalid JSON in ${file}: ${error.message}`);
    return {};
  }
}

function cardById(cards, id) {
  return (cards || []).find((card) => card.id === id) || {};
}

function metricValue(card, label) {
  return (card.metrics || []).find((metric) => metric.label === label)?.value;
}

const dashboardText = readText(files.dashboard);
const dashboard = readJson(files.dashboard);
const sequence = readJson(files.sequence);
const agency = readJson(files.agency);
const mcp = readJson(files.mcp);
const stitch = readJson(files.stitch);
const swift = readJson(files.swift);
const localUsersPathMarker = "/Use" + "rs/";
const privateKeyMarker = "BEGIN " + "PRIVATE KEY";

ensure(dashboard.id === "seis-demo-foundation-dashboard", "dashboard id mismatch");
ensure(dashboard.status === "static-data-ready-ui-pending", "dashboard status must keep UI integration pending");
ensure(dashboard.visibility === "public-safe", "dashboard must be public-safe");
ensure(dashboard.mode === "no-key-static-dashboard-data", "dashboard must be no-key static data");
ensure(dashboard.truthBoundary?.requiresApiKey === false, "dashboard must not require API keys");
ensure(dashboard.truthBoundary?.providerCallsAllowed === false, "dashboard must block provider calls");
ensure(dashboard.truthBoundary?.fakeLiveClaimsAllowed === false, "dashboard must block fake live claims");
ensure(dashboard.truthBoundary?.externalMutationAllowed === false, "dashboard must block external mutation");
ensure(dashboard.truthBoundary?.assetImportAllowed === false, "dashboard must block asset import");
ensure(dashboard.truthBoundary?.existingDemoScriptTouched === false, "dashboard must not claim the existing demo script was touched");
ensure(dashboard.truthBoundary?.webScriptDataBindingStatus === "not-wired", "dashboard must keep web script data binding not wired");
ensure(dashboard.truthBoundary?.fallbackMustBeVisibleBeforeUiBinding === true, "dashboard must require fallback before UI binding");
ensure(dashboard.fallback?.enabled === true, "dashboard must define a fallback state");
ensure(dashboard.fallback?.requiredCardCount === 4, "dashboard fallback must expect four cards");
ensure(Array.isArray(dashboard.cards) && dashboard.cards.length === 4, "dashboard must expose four cards");

for (const [key, file] of Object.entries(dashboard.sourceRefs || {})) {
  ensure(typeof key === "string" && key.length > 0, "sourceRefs keys must be named");
  ensure(typeof file === "string" && file.length > 0, `sourceRefs.${key} must be a path`);
  ensure(existsSync(file), `sourceRefs.${key} path missing: ${file}`);
}

ensure(dashboard.sourceRefs?.implementationSequence === files.sequence, "sequence source ref mismatch");
ensure(dashboard.sourceRefs?.agencyOrchestration === files.agency, "agency source ref mismatch");
ensure(dashboard.sourceRefs?.mcpRiskMatrix === files.mcp, "MCP source ref mismatch");
ensure(dashboard.sourceRefs?.stitchCatalog === files.stitch, "Stitch source ref mismatch");
ensure(dashboard.sourceRefs?.swiftAppleBridge === files.swift, "Swift source ref mismatch");

const pr2 = (sequence.sequence || []).find((entry) => entry.id === "pr2-web-demo-visibility-data-first") || {};
ensure(pr2.status === "data-ready-ui-pending", "PR2 source sequence must mark static data ready while UI integration remains pending");
ensure(pr2.scope?.includes("static dashboard data/checker"), "PR2 source sequence must include static dashboard data/checker");
ensure(pr2.validation?.includes("fallback data test"), "PR2 source sequence must include fallback data test");
ensure(pr2.validation?.includes("no-key/fake-live scan"), "PR2 source sequence must include no-key/fake-live scan");

const agencyCard = cardById(dashboard.cards, "agency-orchestration");
ensure(agencyCard.sourceRef === "agencyOrchestration", "agency card source ref mismatch");
ensure(metricValue(agencyCard, "Departments") === agency.agencyDepartments?.length, "agency department metric mismatch");
ensure(metricValue(agencyCard, "Planned rounds") === agency.developmentSteps?.length, "agency planned round metric mismatch");
ensure(metricValue(agencyCard, "Subagent write access") === "disabled", "agency card must keep subagent write access disabled");
ensure(agency.truthBoundary?.subagentsMayWrite === false, "agency source must keep subagent writes disabled");
ensure(agency.truthBoundary?.demoModeMustRemainNoKey === true, "agency source must keep demo no-key");

const mcpCard = cardById(dashboard.cards, "mcp-risk");
ensure(mcpCard.sourceRef === "mcpRiskMatrix", "MCP card source ref mismatch");
ensure(metricValue(mcpCard, "Risk records") === mcp.records?.length, "MCP risk record metric mismatch");
ensure(metricValue(mcpCard, "Blanket activation") === "blocked", "MCP card must block blanket activation");
ensure(metricValue(mcpCard, "Credential storage") === "disabled", "MCP card must disable credential storage");
ensure(mcp.activationPolicy?.noBlanketActivation === true, "MCP source must block blanket activation");
ensure(mcp.activationPolicy?.credentialStorageAllowed === false, "MCP source must block credential storage");

const stitchCard = cardById(dashboard.cards, "stitch-families");
ensure(stitchCard.sourceRef === "stitchCatalog", "Stitch card source ref mismatch");
ensure(metricValue(stitchCard, "Archives") === stitch.archives?.length, "Stitch archive metric mismatch");
ensure(metricValue(stitchCard, "Module families") === stitch.moduleFamilies?.length, "Stitch module family metric mismatch");
ensure(metricValue(stitchCard, "Asset import") === "review-gated", "Stitch card must keep asset import review-gated");
ensure(stitch.usageBoundary?.rawArchiveDumpAllowed === false, "Stitch source must block raw archive dumps");
ensure(stitch.usageBoundary?.codeCopyAllowedWithoutReview === false, "Stitch source must block unreviewed code copy");

const swiftCard = cardById(dashboard.cards, "swift-bridge");
ensure(swiftCard.sourceRef === "swiftAppleBridge", "Swift card source ref mismatch");
ensure(metricValue(swiftCard, "Proposed Swift models") === swift.proposedSwiftModels?.length, "Swift model metric mismatch");
ensure(metricValue(swiftCard, "Implementation stages") === swift.implementationStages?.length, "Swift stage metric mismatch");
ensure(metricValue(swiftCard, "SwiftUI shell") === "deferred", "Swift card must keep SwiftUI shell deferred");
ensure(swift.validation?.swiftChecksRequiredWhen?.includes("Swift source is added or edited"), "Swift source must define validation boundary");

for (const required of [
  "node scripts/check-seis-demo-foundation-dashboard-data.mjs",
  "node scripts/check-seis-demo-foundation-dashboard-boundary.mjs",
  "node scripts/check-seis-pr0-pr1-pr2-implementation-sequence.mjs",
  "node scripts/check-seis-mcp-permission-risk-matrix.mjs",
  "node scripts/check-seis-stitch-ux-screen-catalog.mjs",
  "node scripts/check-seis-swift-apple-bridge-manifest.mjs"
]) {
  ensure(dashboard.validation?.includes(required), `dashboard validation must include ${required}`);
}

ensure(!dashboardText.includes(localUsersPathMarker), "dashboard must not contain machine-local absolute paths");
ensure(!dashboardText.includes(privateKeyMarker), "dashboard must not contain private key markers");
ensure(!/sk-[A-Za-z0-9_-]{16,}/.test(dashboardText), "dashboard must not contain provider API key-shaped values");
ensure(!/AKIA[0-9A-Z]{16}/.test(dashboardText), "dashboard must not contain AWS access-key-shaped values");
ensure(!/ghp_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}/.test(dashboardText), "dashboard must not contain GitHub token-shaped values");

if (failures.length > 0) {
  console.error("SEIS demo foundation dashboard data check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS demo foundation dashboard data check passed.");
