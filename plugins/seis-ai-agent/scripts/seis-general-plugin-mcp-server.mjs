#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const guide = readJson("assets/public-bundle-selection-guide.json");
const suite = readJson("assets/unified-suite.json");
const profile = readJson("assets/agent-profile.json");
const LANES = [
  ["seis_hub", "SEIS Hub", "repository governance, architecture, documentation, and GitHub readiness"],
  ["seis_governance", "SEIS Governance", "goal tracking, public release gates, ownership, and rollback"],
  ["seis_cloud", "SEIS Cloud", "cloud, infrastructure, DevOps, reliability, and approved deployment planning"],
  ["seis_code", "SEIS Code", "implementation, tests, CI, packages, frontend, backend, and refactors"],
  ["seis_design", "SEIS Design", "design systems, UX, accessibility, frontend experience, and visual QA"],
  ["seis_data", "SEIS Data", "data architecture, analytics, knowledge, retrieval, memory, and provenance"],
  ["seis_security", "SEIS Security", "security, permissions, secrets safety, governance, and risk review"],
  ["seis_research", "SEIS Research", "evidence, official documentation, evaluation, and decision records"],
  ["seis_automation", "SEIS Automation", "foreground-only automation, validation, planning, and runbooks"],
  ["seis_product", "SEIS Product", "product strategy, delivery, scope, acceptance criteria, and release readiness"],
].map(([id, label, focus]) => ({ id, label, focus, statusTool: `${id}_status`, planTool: `${id}_plan` }));

validateStartup();
if (process.argv.includes("--smoke")) {
  console.log(JSON.stringify({
    status: "ok",
    server: "seis-general-plugin-mcp-server",
    generalPluginCount: guide.starterPaths.length,
    internalPackageCount: guide.marketplace.internalPackageCount,
    laneCount: LANES.length,
    writeAccess: false,
    networkAccess: false,
  }, null, 2));
  process.exit(0);
}

const lineReader = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
lineReader.on("line", (line) => {
  if (!line.trim()) return;
  let request;
  try { request = JSON.parse(line); } catch { return writeError(null, -32700, "Invalid JSON-RPC payload"); }
  if (request.method === "notifications/initialized") return;
  if (request.method === "initialize") return writeResult(request.id, {
    protocolVersion: request.params?.protocolVersion || "2024-11-05",
    capabilities: { tools: {} },
    serverInfo: { name: "seis-ai-agent", version: profile?.releaseVersion || "0.4.0" },
  });
  if (request.method === "tools/list") return writeResult(request.id, { tools: toolDefinitions() });
  if (request.method === "tools/call") return handleToolCall(request);
  writeError(request.id, -32601, "Method not found");
});

function toolDefinitions() {
  const tools = [
    definition("seis_ai_agent_status", "Show the verified ten-general-plugin SEIS-Agent status.", { type: "object", additionalProperties: false }),
    definition("seis_agent_lanes", "List supervised SEIS specialist lanes; each plans in the current invocation and never runs in the background.", { type: "object", additionalProperties: false }),
    definition("seis_general_plugin_guide", "Show the ten public general plugins and their three hidden internal package selections.", { type: "object", additionalProperties: false }),
    definition("seis_general_plugin_find", "Find up to three task-matched general plugins using only local deterministic metadata.", { type: "object", required: ["query"], properties: { query: { type: "string", minLength: 2, maxLength: 96 } }, additionalProperties: false }),
    definition("seis_general_plugin_recommend", "Recommend exactly one reviewed general plugin for a scoped task; it never installs anything.", { type: "object", required: ["generalPluginId"], properties: { generalPluginId: { type: "string", pattern: "^[a-z0-9][a-z0-9-]{0,80}$" } }, additionalProperties: false }),
    definition("seis_public_bundle_guide", "Compatibility alias for the general-plugin guide; legacy bundle cards are retired.", { type: "object", additionalProperties: false }),
    definition("seis_public_bundle_find", "Compatibility alias for the general-plugin finder; legacy bundle cards are retired.", { type: "object", required: ["query"], properties: { query: { type: "string", minLength: 2, maxLength: 96 } }, additionalProperties: false }),
    definition("seis_public_bundle_recommend", "Compatibility alias for general-plugin recommendation; legacy bundle cards are retired.", { type: "object", required: ["journeyId"], properties: { journeyId: { type: "string", pattern: "^[a-z0-9][a-z0-9-]{0,80}$" } }, additionalProperties: false }),
  ];
  for (const lane of LANES) {
    tools.push(definition(lane.statusTool, `Show ${lane.label} scope and safety status.`, { type: "object", additionalProperties: false }));
    tools.push(definition(lane.planTool, `Create a foreground-only, reviewable ${lane.label} plan without executing external writes.`, { type: "object", additionalProperties: false }));
  }
  return tools;
}

function handleToolCall(request) {
  const name = request.params?.name;
  const args = request.params?.arguments || {};
  try {
    let payload;
    if (name === "seis_ai_agent_status") payload = status();
    else if (name === "seis_agent_lanes") payload = { executionModel: "foreground-sequential-reviewed", lanes: LANES };
    else if (name === "seis_general_plugin_guide" || name === "seis_public_bundle_guide") payload = selectionGuide();
    else if (name === "seis_general_plugin_find" || name === "seis_public_bundle_find") payload = findPlugins(args.query);
    else if (name === "seis_general_plugin_recommend") payload = recommend(args.generalPluginId);
    else if (name === "seis_public_bundle_recommend") payload = recommend(args.journeyId);
    else {
      const lane = LANES.find((candidate) => candidate.statusTool === name || candidate.planTool === name);
      if (!lane) throw new Error("Unknown SEIS tool");
      payload = lane.statusTool === name ? laneStatus(lane) : lanePlan(lane);
    }
    writeResult(request.id, textContent(payload));
  } catch (error) {
    writeError(request.id, -32602, error.message);
  }
}

function status() {
  return {
    identity: "SEIS-Agent",
    releaseVersion: profile?.releaseVersion,
    suiteStatus: suite?.status,
    marketplace: {
      name: guide.marketplace.name,
      publicCardCount: guide.marketplace.publicCardCount,
      generalPluginCardCount: guide.marketplace.generalPluginCardCount,
      internalPackageCardCount: guide.marketplace.internalPackageCardCount,
      internalPackageCount: guide.marketplace.internalPackageCount,
      maximumPackageSize: guide.marketplace.maximumPackageSize,
    },
    selectionBoundary: guide.selectionBoundary,
    executionBoundary: {
      mode: "foreground-sequential-reviewed",
      persistentBackgroundExecution: false,
      networkAccess: false,
      writeAccess: false,
      publicationRequiresHumanApproval: true,
    },
  };
}

function selectionGuide() {
  return {
    status: "active-ten-general-plugin-selection",
    deprecatedLegacyBundleToolAlias: true,
    marketplace: guide.marketplace,
    selectionBoundary: guide.selectionBoundary,
    generalPlugins: guide.starterPaths.map((entry) => ({
      id: entry.id,
      displayName: entry.label,
      category: entry.category,
      installId: entry.generalPlugin.installId,
      internalPackageCount: entry.internalPackageIds.length,
      keywords: entry.keywords,
    })),
    nextSteps: ["Choose one task-matched general plugin.", "Review the plan before an explicit installation action.", "Never install internal packages directly or in bulk."],
  };
}

function findPlugins(query) {
  if (typeof query !== "string" || !query.trim() || Array.from(query).length > guide.finder.maximumQueryLength) throw new Error("query must be a non-empty string within 96 characters");
  const terms = normalizeTerms(query);
  if (!terms.length) throw new Error("query must contain a specific local task term");
  const candidates = guide.starterPaths
    .map((entry) => {
      const corpus = new Set(normalizeTerms([entry.id, entry.label, entry.category, ...(entry.keywords || [])].join(" ")));
      const matchedTerms = terms.filter((term) => corpus.has(term) || [...corpus].some((value) => value.startsWith(term)));
      return { entry, matchedTerms };
    })
    .filter((candidate) => candidate.matchedTerms.length)
    .sort((left, right) => right.matchedTerms.length - left.matchedTerms.length || left.entry.id.localeCompare(right.entry.id))
    .slice(0, guide.finder.maximumResults)
    .map(({ entry, matchedTerms }) => ({
      id: entry.id,
      displayName: entry.label,
      installId: entry.generalPlugin.installId,
      internalPackageCount: entry.internalPackageIds.length,
      matchedTermCount: matchedTerms.length,
      planCommand: `npm run install:seis-ai-agent -- --general-plugin ${entry.id}`,
    }));
  return { query: query.trim(), mode: guide.finder.mode, installationPerformed: false, candidates };
}

function recommend(id) {
  const entry = guide.starterPaths.find((candidate) => candidate.id === id || candidate.generalPlugin?.name === id);
  if (!entry) throw new Error("generalPluginId must identify one known general SEIS plugin");
  return {
    id: entry.id,
    displayName: entry.label,
    installId: entry.generalPlugin.installId,
    internalPackageIds: entry.internalPackageIds,
    installationPerformed: false,
    planCommand: `npm run install:seis-ai-agent -- --general-plugin ${entry.id}`,
    applyCommand: `npm run install:seis-ai-agent -- --apply --general-plugin ${entry.id}`,
    reminder: "This is one general plugin selection; its internal packages are not additional install targets.",
  };
}

function laneStatus(lane) {
  return { lane: lane.label, focus: lane.focus, execution: "foreground-only planning and review", externalWriteAccess: false, recommendedGeneralPluginBoundary: "choose one general plugin only when it matches the scoped task" };
}
function lanePlan(lane) {
  return { lane: lane.label, steps: ["Inspect repository and task context.", `Select ${lane.label} only if it fits the scoped task.`, "Produce a reviewable local plan and validate it.", "Request explicit approval before external writes, publication, deployment, or credential use."], execution: "foreground-only; no background agent was started" };
}

function validateStartup() {
  if (
    guide?.id !== "seis-general-plugin-selection-guide"
    || guide?.marketplace?.publicCardCount !== 10
    || guide?.marketplace?.generalPluginCardCount !== 10
    || guide?.marketplace?.internalPackageCount !== 30
    || guide?.marketplace?.internalPackageCardCount !== 0
    || guide?.selectionBoundary?.maximumGeneralPluginSelectionsPerTask !== 1
    || guide?.finder?.maximumResults !== 3
    || !Array.isArray(guide?.starterPaths)
    || guide.starterPaths.length !== 10
    || suite?.status !== "active-ten-general-plugin-suite"
  ) throw new Error("SEIS general plugin metadata is missing or invalid");
}

function definition(name, description, inputSchema) { return { name, description, inputSchema }; }
function textContent(payload) { return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] }; }
function writeResult(id, result) { process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, result })}\n`); }
function writeError(id, code, message) { process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } })}\n`); }
function readJson(relativePath) { try { return JSON.parse(fs.readFileSync(path.join(pluginRoot, relativePath), "utf8")); } catch { return null; } }
function normalizeTerms(value) { return [...new Set(String(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().match(/[a-z0-9]+/g) || [])].filter((term) => term.length >= 2 && !new Set(["seis", "plugin", "plugins", "general", "task", "with", "the", "and"]).has(term)); }
