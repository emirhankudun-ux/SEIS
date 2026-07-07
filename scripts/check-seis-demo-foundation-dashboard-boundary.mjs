#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const files = {
  dashboard: "apps/seis-demo-web/data/seis-foundation-dashboard.json",
  demoScript: "apps/seis-demo-web/script.js",
  nextQueue: "docs/roadmap/NEXT_PR_QUEUE.md",
  packageJson: "package.json",
  sequence: "content/development/seis-pr0-pr1-pr2-implementation-sequence.json"
};

const command = "node scripts/check-seis-demo-foundation-dashboard-boundary.mjs";
const npmScriptName = "check:seis-demo-foundation-dashboard-boundary";
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

function metricValue(card, label) {
  return (card.metrics || []).find((metric) => metric.label === label)?.value;
}

const dashboardText = readText(files.dashboard);
const demoScriptText = readText(files.demoScript);
const nextQueueText = readText(files.nextQueue);
const packageJsonText = readText(files.packageJson);
const sequenceText = readText(files.sequence);
const dashboard = readJson(files.dashboard);
const packageJson = readJson(files.packageJson);
const sequence = readJson(files.sequence);
const pr2 = (sequence.sequence || []).find((entry) => entry.id === "pr2-web-demo-visibility-data-first") || {};

ensure(packageJson.scripts?.[npmScriptName] === command, `package.json must expose ${npmScriptName}`);
ensure(dashboard.validation?.includes(command), "dashboard validation must include boundary checker");
ensure(pr2.status === "data-ready-ui-pending", "PR2 status must be data-ready-ui-pending");
ensure(pr2.validation?.includes("no-key/fake-live scan"), "PR2 validation must retain no-key/fake-live scan");
ensure(pr2.validation?.includes("fallback data test"), "PR2 validation must retain fallback data test");
ensure(pr2.nonGoals?.includes("live AI"), "PR2 non-goals must block live AI");
ensure(pr2.nonGoals?.includes("provider keys"), "PR2 non-goals must block provider keys");
ensure(pr2.nonGoals?.includes("asset import"), "PR2 non-goals must block asset import");
ensure(pr2.nonGoals?.some((goal) => goal.includes("apps/seis-demo-web/script.js") && goal.includes("PR2")), "PR2 non-goals must protect apps/seis-demo-web/script.js");

ensure(dashboard.status === "static-data-ready-ui-pending", "dashboard status must keep UI pending");
ensure(dashboard.mode === "no-key-static-dashboard-data", "dashboard mode must stay no-key static");
ensure(dashboard.visibility === "public-safe", "dashboard visibility must be public-safe");
ensure(dashboard.truthBoundary?.requiresApiKey === false, "dashboard must not require API keys");
ensure(dashboard.truthBoundary?.providerCallsAllowed === false, "dashboard must block provider calls");
ensure(dashboard.truthBoundary?.fakeLiveClaimsAllowed === false, "dashboard must block fake live claims");
ensure(dashboard.truthBoundary?.externalMutationAllowed === false, "dashboard must block external mutation");
ensure(dashboard.truthBoundary?.assetImportAllowed === false, "dashboard must block asset import");
ensure(dashboard.truthBoundary?.existingDemoScriptTouched === false, "dashboard must not claim demo script edits");
ensure(dashboard.truthBoundary?.webScriptDataBindingStatus === "not-wired", "dashboard must keep web script binding not wired");
ensure(dashboard.truthBoundary?.uiIntegrationStatus === "pending-after-swift-foundation", "dashboard UI integration must remain pending");
ensure(dashboard.truthBoundary?.fallbackMustBeVisibleBeforeUiBinding === true, "dashboard must require fallback before UI binding");
ensure(dashboard.fallback?.enabled === true, "dashboard fallback must be enabled");
ensure(dashboard.fallback?.requiredCardCount === 4, "dashboard fallback must preserve four-card shape");

ensure(Array.isArray(dashboard.cards) && dashboard.cards.length === 4, "dashboard must keep four cards");
ensure(metricValue(dashboard.cards.find((card) => card.id === "agency-orchestration") || {}, "Subagent write access") === "disabled", "agency card must keep subagent write access disabled");
ensure(metricValue(dashboard.cards.find((card) => card.id === "mcp-risk") || {}, "Blanket activation") === "blocked", "MCP card must block blanket activation");
ensure(metricValue(dashboard.cards.find((card) => card.id === "stitch-families") || {}, "Asset import") === "review-gated", "Stitch card must keep asset import review-gated");
ensure(metricValue(dashboard.cards.find((card) => card.id === "swift-bridge") || {}, "SwiftUI shell") === "deferred", "Swift card must defer SwiftUI shell");

const claimScanText = [
  dashboardText,
  nextQueueText,
  packageJsonText,
  sequenceText
].join("\n");

for (const forbidden of [
  /\b(live|real|production)\s+(AI|provider|model|runtime)\s+(is|are|enabled|ready|connected|running|active|available|operational)\b/i,
  /\bprovider\s+calls?\s+(is|are|enabled|ready|running|active|available|operational)\b/i,
  /\bmodel\s+calls?\s+(is|are|enabled|ready|running|active|available|operational)\b/i,
  /\bconnected\s+to\s+(OpenAI|Anthropic|Gemini|Claude)\b/i,
  /\bcalls\s+(OpenAI|Anthropic|Gemini|Claude)\b/i,
  /\b(API|provider)\s+keys?\s+(is|are|configured|available|present|loaded)\b/i
]) {
  ensure(!forbidden.test(claimScanText), `PR2 data/docs contain a fake-live claim pattern: ${forbidden}`);
}

for (const forbidden of [
  "seis-foundation-dashboard.json",
  "seis-demo-foundation-dashboard"
]) {
  ensure(!demoScriptText.includes(forbidden), `existing demo script must not wire PR2 dashboard data yet: ${forbidden}`);
}

for (const secretPattern of [
  /\/Use.rs\//,
  /BEGIN PRIVATE KEY/,
  /sk-[A-Za-z0-9_-]{16,}/,
  /AKIA[0-9A-Z]{16}/,
  /ghp_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}/
]) {
  ensure(!secretPattern.test(dashboardText), `dashboard boundary text matches sensitive pattern: ${secretPattern}`);
}

if (existsSync(".git")) {
  const stagedPaths = execFileSync("git", ["diff", "--cached", "--name-only"], {
    encoding: "utf8"
  })
    .split("\n")
    .filter(Boolean);

  ensure(!stagedPaths.includes(files.demoScript), `PR2 staged boundary must not include ${files.demoScript}`);
}

if (failures.length > 0) {
  console.error("SEIS demo foundation dashboard boundary check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS demo foundation dashboard boundary check passed.");
