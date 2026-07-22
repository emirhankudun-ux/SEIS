#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { APP_PLUGIN_EXPANSION_TARGET } from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";
import { TOPIC_PLUGIN_SOURCE_ROOT, TOPIC_PLUGIN_TARGET } from "../plugins/seis-topics/runtime/topic-definitions.mjs";

const ROOT = process.cwd();
const args = parseArgs(process.argv.slice(2));
const failures = [];
const PUBLIC_FAMILY_PATH = path.join(ROOT, "content", "development", "seis-public-plugin-family.json");
const BUNDLE_CATALOG_PATH = path.join(ROOT, "content", "development", "seis-public-plugin-bundle-catalog.json");
const CURATED_BUNDLE_MODE = "public_seis_agent_with_curated_bounded_repository_bundle_cards";

const standaloneLanes = [
  {
    name: "seis-cloud",
    displayName: "SEIS Cloud",
    marketplaceCategory: "Developer",
    pluginRootEnv: "SEIS_CLOUD_PLUGIN_ROOT",
    mcpServer: "seis-cloud",
    tools: ["seis_cloud_status", "seis_cloud_plan"],
  },
  {
    name: "seis-code",
    displayName: "SEIS-Code",
    marketplaceCategory: "Developer",
    pluginRootEnv: "SEIS_CODE_PLUGIN_ROOT",
    mcpServer: "seis-code",
    tools: ["seis_code_status", "seis_code_plan"],
  },
  {
    name: "seis-design",
    displayName: "SEIS-Design",
    marketplaceCategory: "Design",
    pluginRootEnv: "SEIS_DESIGN_PLUGIN_ROOT",
    mcpServer: "seis-design",
    tools: ["seis_design_status", "seis_design_plan"],
  },
  {
    name: "seis-data",
    displayName: "SEIS-DATA",
    marketplaceCategory: "Data",
    pluginRootEnv: "SEIS_DATA_PLUGIN_ROOT",
    mcpServer: "seis-data",
    tools: ["seis_data_status", "seis_data_plan"],
  },
  {
    name: "seis-security",
    displayName: "SEIS Security",
    marketplaceCategory: "Security",
    pluginRootEnv: "SEIS_SECURITY_PLUGIN_ROOT",
    mcpServer: "seis-security",
    tools: ["seis_security_status", "seis_security_plan"],
  },
  {
    name: "seis-research",
    displayName: "SEIS Research",
    marketplaceCategory: "Research",
    pluginRootEnv: "SEIS_RESEARCH_PLUGIN_ROOT",
    mcpServer: "seis-research",
    tools: ["seis_research_status", "seis_research_plan"],
  },
  {
    name: "seis-automation",
    displayName: "SEIS Automation",
    marketplaceCategory: "Developer",
    pluginRootEnv: "SEIS_AUTOMATION_PLUGIN_ROOT",
    mcpServer: "seis-automation",
    tools: ["seis_automation_status", "seis_automation_plan"],
  },
  {
    name: "seis-product",
    displayName: "SEIS Product",
    marketplaceCategory: "Productivity",
    pluginRootEnv: "SEIS_PRODUCT_PLUGIN_ROOT",
    mcpServer: "seis-product",
    tools: ["seis_product_status", "seis_product_plan"],
  },
];

const governanceLane = {
  name: "seis-governance",
  displayName: "SEIS Governance",
  marketplaceCategory: "Developer",
  mcpServer: "seis-governance",
  tools: ["seis_governance_status", "seis_governance_plan"],
  embeddedOnly: true,
};

const lanes = [
  ...standaloneLanes,
  governanceLane,
];

const canonicalMarketplaceEntries = [{
  name: "seis-ai-agent",
  path: "./plugins/seis-ai-agent",
  category: "Developer",
}];
const migratedRootMarketplaceEntries = [
  { name: "seis", path: "./plugins/seis", category: "Developer" },
  { name: "seis-cloud", path: "./plugins/seis-cloud", category: "Developer" },
  { name: "seis-code", path: "./plugins/seis-code", category: "Developer" },
  { name: "seis-design", path: "./plugins/seis-design", category: "Design" },
  { name: "seis-data", path: "./plugins/seis-data", category: "Data" },
];
const embeddedModuleNames = [
  "seis-ai-agent",
  "seis",
  "seis-cloud",
  "seis-code",
  "seis-design",
  "seis-data",
  "seis-security",
  "seis-research",
  "seis-automation",
  "seis-product",
];

const includeLegacyPersonal = args["include-legacy-personal"] === true && args["no-local"] !== true;
const legacyPersonalSources = includeLegacyPersonal ? discoverLegacyPersonalSources() : [];
const personalMarketplacePath = path.join(homeDir(), ".agents", "plugins", "marketplace.json");
const checkLocalMarketplace = includeLegacyPersonal && fs.existsSync(personalMarketplacePath);

if (args.help) {
  console.log(`
Usage:
  node scripts/check-seis-specialist-plugins.mjs [options]

Options:
  --include-legacy-personal
               Statically discover legacy personal SEIS sources from configured
               roots, ~/plugins, and every readable Codex personal-cache version.
               Each discovered source must have a public-safe repo counterpart;
               local source code is never executed by this mode. The result
               reports only package names and discovery-origin categories, never
               local paths.
  --no-local   Skip local plugin root and personal marketplace checks.
  --help       Show usage
`);
  process.exit(0);
}

for (const lane of standaloneLanes) {
  validatePluginRoot(path.join(ROOT, "plugins", lane.name), lane, "repo");
}

for (const source of legacyPersonalSources) {
  const lane = standaloneLanes.find((candidate) => candidate.name === source.name);
  if (lane) {
    validatePluginRoot(source.root, lane, "legacy personal", {
      requirePublicLicense: false,
      runMcpSmoke: false,
    });
  }
  validateLegacyPersonalMirror(source);
}

const specialistManifest = validateJsonObject(path.join(ROOT, "data", "seis-specialist-plugins-2026-06-12.json"), "specialist plugin manifest", ["id", "version", "plugins", "marketplace", "centralMcpTools"]);
if (specialistManifest) {
  ensure(specialistManifest.mode === "single-public-seis-agent-with-embedded-modules", "specialist plugin manifest must use the single public SEIS-Agent mode");
  ensure(Array.isArray(specialistManifest.centralMcpTools), "specialist plugin manifest centralMcpTools must be an array");
  ensure(Array.isArray(specialistManifest.sourceEvidence), "specialist plugin manifest sourceEvidence must be an array");
  ensure(
    specialistManifest.sourceEvidence?.includes("docs/platform/seis-legacy-personal-plugin-reconciliation.md"),
    "specialist plugin manifest sourceEvidence must include the legacy personal reconciliation record"
  );
  ensure(specialistManifest.consolidation?.primaryInstallId === "seis-ai-agent@seis-repo", "specialist plugin manifest must point at the SEIS-Agent primary install id");
  ensure(specialistManifest.consolidation?.defaultInstallMode === "single-public-plugin", "specialist plugin manifest must use the single public install mode");
  ensure(specialistManifest.consolidation?.legacyPersonalMarketplace === "compatibility-mirror-only", "specialist plugin manifest must mark personal marketplace as compatibility mirror only");
  ensure(specialistManifest.consolidation?.standaloneLaneInstallMode === "source-module-only", "specialist plugin manifest must retain lanes as source modules only");
  ensure(specialistManifest.consolidation?.marketplacePolicy === "seis-agent-is-the-canonical-public-orchestrator-with-curated-bounded-public-bundles", "specialist plugin manifest must publish the canonical orchestrator and curated public bundles");
  for (const entry of canonicalMarketplaceEntries) {
    ensure(specialistManifest.marketplace?.publishedPlugins?.includes(entry.name), `specialist plugin manifest marketplace missing ${entry.name}`);
  }
  ensure(specialistManifest.marketplace?.publishedPlugins?.length === 1, "specialist plugin manifest marketplace must contain only SEIS-Agent");
  ensureArrayContainsAll(specialistManifest.embeddedModules, embeddedModuleNames, "specialist plugin manifest embeddedModules");
  for (const tool of ["seis_specialist_lanes", "seis_specialist_lane_status", "seis_specialist_lane_plan"]) {
    ensure(specialistManifest.centralMcpTools?.includes(tool), `specialist plugin manifest centralMcpTools missing ${tool}`);
  }
}

validateEmbeddedAgentPlugin();
ensureFile(
  path.join(ROOT, "docs", "platform", "seis-legacy-personal-plugin-reconciliation.md"),
  "legacy personal plugin reconciliation record"
);

const centralMcp = path.join(ROOT, "mcp", "seis-mcp-server.mjs");
ensureFile(centralMcp, "central SEIS MCP server");
for (const token of [
  "seis_specialist_lanes",
  "seis_specialist_lane_status",
  "seis_specialist_lane_plan",
  ...standaloneLanes.flatMap((lane) => lane.tools),
]) {
  validateCodeContains(centralMcp, token, `central MCP server must expose ${token}`);
}
validateCentralMcpSmoke(centralMcp);

validateMarketplace(path.join(ROOT, ".agents", "plugins", "marketplace.json"), "repo marketplace", "seis-repo");
if (checkLocalMarketplace) {
  validateMarketplace(personalMarketplacePath, "personal marketplace", "personal");
}

if (failures.length > 0) {
  console.error("SEIS specialist plugin check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

if (includeLegacyPersonal) reportLegacyPersonalSourceAudit(legacyPersonalSources);
console.log("SEIS specialist plugin check passed.");

function validatePluginRoot(pluginRoot, lane, scope, options = {}) {
  const requirePublicLicense = options.requirePublicLicense ?? scope === "repo";
  const runMcpSmoke = options.runMcpSmoke ?? scope === "repo";
  ensureDir(pluginRoot, `${scope} ${lane.name} plugin root`);
  const manifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
  const mcpPath = path.join(pluginRoot, ".mcp.json");
  const skillPath = path.join(pluginRoot, "skills", lane.name, "SKILL.md");
  const openaiYamlPath = path.join(pluginRoot, "skills", lane.name, "agents", "openai.yaml");
  const profilePath = path.join(pluginRoot, "assets", "lane-profile.json");
  const readmePath = path.join(pluginRoot, "README.md");
  const statusScript = path.join(pluginRoot, "scripts", `${lane.name}-status.mjs`);
  const mcpScript = path.join(pluginRoot, "scripts", `${lane.name}-mcp-server.mjs`);

  for (const [filePath, label] of [
    [manifestPath, `${scope} ${lane.name} plugin manifest`],
    [mcpPath, `${scope} ${lane.name} MCP manifest`],
    [skillPath, `${scope} ${lane.name} skill`],
    [openaiYamlPath, `${scope} ${lane.name} openai metadata`],
    [profilePath, `${scope} ${lane.name} lane profile`],
    [readmePath, `${scope} ${lane.name} README`],
    [statusScript, `${scope} ${lane.name} status script`],
    [mcpScript, `${scope} ${lane.name} MCP server script`],
  ]) {
    ensureFile(filePath, label);
  }

  const manifest = readJson(manifestPath);
  if (manifest) {
    ensure(manifest.name === lane.name, `${scope} ${lane.name}: manifest name must match`);
    if (requirePublicLicense) {
      ensure(manifest.license === "MIT", `${scope} ${lane.name}: manifest license must be MIT for public plugin availability`);
    }
    ensure(manifest.mcpServers === "./.mcp.json", `${scope} ${lane.name}: manifest must reference .mcp.json`);
    ensure(manifest.interface?.displayName === lane.displayName, `${scope} ${lane.name}: displayName must be ${lane.displayName}`);
    ensure(Array.isArray(manifest.interface?.capabilities) && manifest.interface.capabilities.length >= 5, `${scope} ${lane.name}: capabilities must be meaningful`);
    ensure(Array.isArray(manifest.interface?.defaultPrompt) && manifest.interface.defaultPrompt.length > 0, `${scope} ${lane.name}: defaultPrompt must be present`);
  }

  const mcp = readJson(mcpPath);
  if (mcp) {
    ensure(mcp.mcpServers?.[lane.mcpServer]?.command === "node", `${scope} ${lane.name}: MCP server command must be node`);
    ensure(Array.isArray(mcp.mcpServers?.[lane.mcpServer]?.args), `${scope} ${lane.name}: MCP server args must be an array`);
  }

  const profile = readJson(profilePath);
  if (profile) {
    ensure(profile.id === lane.name, `${scope} ${lane.name}: profile id must match`);
    ensure(Array.isArray(profile.qualityCommands) && profile.qualityCommands.length > 0, `${scope} ${lane.name}: profile must define quality commands`);
    if (lane.name === "seis-cloud") {
      ensure(profile.accessPolicy?.publicCloud?.audience === "everyone", `${scope} seis-cloud: profile must expose public cloud audience`);
      ensure(profile.accessPolicy?.teamVpnCloud?.audience === "workplaces-and-teams", `${scope} seis-cloud: profile must expose team VPN cloud audience`);
      ensure(profile.qualityCommands.includes("npm run check:cloud-access-policy"), `${scope} seis-cloud: profile must include cloud access policy check`);
    }
  }

  if (lane.name === "seis-cloud") {
    const skill = fs.existsSync(skillPath) ? fs.readFileSync(skillPath, "utf8") : "";
    ensure(skill.includes("public cloud"), `${scope} seis-cloud: skill must mention public cloud`);
    ensure(skill.includes("team/workplace VPN cloud"), `${scope} seis-cloud: skill must mention team/workplace VPN cloud`);
  }

  for (const tool of lane.tools) {
    validateCodeContains(mcpScript, tool, `${scope} ${lane.name}: MCP script must expose ${tool}`);
  }
  if (runMcpSmoke) {
    validateMcpServerSmoke(pluginRoot, mcpScript, lane, scope);
  }
}

function validateMcpServerSmoke(pluginRoot, mcpScript, lane, scope) {
  if (!fs.existsSync(mcpScript)) {
    return;
  }

  const request = `Validate ${lane.displayName} lane readiness.`;
  const input = [
    frameMcpMessage({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
    frameMcpMessage({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }),
    frameMcpMessage({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: lane.tools[0], arguments: {} },
    }),
    frameMcpMessage({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: { name: lane.tools[1], arguments: { request } },
    }),
  ].join("");

  const result = spawnSync(process.execPath, [mcpScript], {
    cwd: pluginRoot,
    env: smokeEnvironment(lane, pluginRoot),
    input,
    timeout: 5000,
  });

  if (result.error) {
    fail(`${scope} ${lane.name}: MCP smoke failed: ${result.error.message}`);
    return;
  }
  if (result.status !== 0) {
    fail(`${scope} ${lane.name}: MCP smoke exited ${exitDetail(result)}: ${trimmedOutputText(result.stderr)}`);
    return;
  }

  const responses = parseMcpResponses(result.stdout, `${scope} ${lane.name}`);
  const toolsList = responses.find((message) => message.id === 2)?.result?.tools || [];
  for (const tool of lane.tools) {
    ensure(
      toolsList.some((record) => record.name === tool),
      `${scope} ${lane.name}: MCP tools/list missing ${tool}`
    );
  }

  const statusPayload = responses.find((message) => message.id === 3)?.result;
  ensure(statusPayload?.status === "ready", `${scope} ${lane.name}: MCP status must be ready`);
  ensure(statusPayload?.lane === lane.name, `${scope} ${lane.name}: MCP status lane must match`);
  ensure(statusPayload?.repoMirrorExists === true, `${scope} ${lane.name}: MCP status must see repo mirror`);

  const planPayload = responses.find((message) => message.id === 4)?.result;
  ensure(planPayload?.lane === lane.name, `${scope} ${lane.name}: MCP plan lane must match`);
  ensure(planPayload?.request === request, `${scope} ${lane.name}: MCP plan must echo request`);
  ensure(Array.isArray(planPayload?.steps) && planPayload.steps.length >= 4, `${scope} ${lane.name}: MCP plan must include steps`);
  ensure(Array.isArray(planPayload?.defaultChecks) && planPayload.defaultChecks.length > 0, `${scope} ${lane.name}: MCP plan must include default checks`);
  if (lane.name === "seis-cloud") {
    ensure(statusPayload?.accessPolicy?.publicCloud?.audience === "everyone", `${scope} seis-cloud: MCP status must expose public cloud policy`);
    ensure(statusPayload?.accessPolicy?.teamVpnCloud?.audience === "workplaces-and-teams", `${scope} seis-cloud: MCP status must expose team VPN cloud policy`);
    ensure(
      planPayload.steps.some((step) => String(step).includes("public cloud") && String(step).includes("team/workplace VPN cloud")),
      `${scope} seis-cloud: MCP plan must classify public vs team VPN cloud`
    );
  }
}

function validateCentralMcpSmoke(centralMcp) {
  if (!fs.existsSync(centralMcp)) {
    return;
  }

  const request = "Plan a governed specialist plugin handoff.";
  const input = [
    frameMcpMessage({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
    frameMcpMessage({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }),
    frameMcpMessage({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "seis_specialist_lanes", arguments: {} },
    }),
    frameMcpMessage({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: { name: "seis_specialist_lane_status", arguments: { lane: "seis-code" } },
    }),
    frameMcpMessage({
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: { name: "seis_specialist_lane_plan", arguments: { lane: "seis-data", request } },
    }),
    frameMcpMessage({
      jsonrpc: "2.0",
      id: 6,
      method: "tools/call",
      params: { name: "seis_specialist_lane_status", arguments: { lane: "seis-governance" } },
    }),
    frameMcpMessage({
      jsonrpc: "2.0",
      id: 7,
      method: "tools/call",
      params: { name: "seis_specialist_lane_plan", arguments: { lane: "seis-governance", request } },
    }),
  ].join("");

  const result = spawnSync(process.execPath, [centralMcp], {
    cwd: ROOT,
    env: { ...process.env, SEIS_ROOT: ROOT },
    input,
    timeout: 5000,
  });

  if (result.error) {
    fail(`central MCP smoke failed: ${result.error.message}`);
    return;
  }
  if (result.status !== 0) {
    fail(`central MCP smoke exited ${exitDetail(result)}: ${trimmedOutputText(result.stderr)}`);
    return;
  }

  const responses = parseMcpResponses(result.stdout, "central MCP");
  const toolsList = responses.find((message) => message.id === 2)?.result?.tools || [];
  for (const tool of ["seis_specialist_lanes", "seis_specialist_lane_status", "seis_specialist_lane_plan"]) {
    ensure(
      toolsList.some((record) => record.name === tool),
      `central MCP tools/list missing ${tool}`
    );
  }

  const lanesPayload = responses.find((message) => message.id === 3)?.result;
  ensure(lanesPayload?.status === "ready", "central MCP specialist lanes status must be ready");
  ensure(lanesPayload?.laneCount === lanes.length, "central MCP specialist lane count must match");

  const statusPayload = responses.find((message) => message.id === 4)?.result;
  ensure(statusPayload?.id === "seis-code", "central MCP specialist status id must match");
  ensure(statusPayload?.status === "ready", "central MCP specialist status must be ready");

  const planPayload = responses.find((message) => message.id === 5)?.result;
  ensure(planPayload?.lane === "seis-data", "central MCP specialist plan lane must match");
  ensure(planPayload?.request === request, "central MCP specialist plan must echo request");
  ensure(Array.isArray(planPayload?.steps) && planPayload.steps.length >= 4, "central MCP specialist plan must include steps");

  const governanceStatusPayload = responses.find((message) => message.id === 6)?.result;
  ensure(governanceStatusPayload?.id === "seis-governance", "central MCP governance status id must match");
  ensure(governanceStatusPayload?.status === "ready", "central MCP governance status must be ready");

  const governancePlanPayload = responses.find((message) => message.id === 7)?.result;
  ensure(governancePlanPayload?.lane === "seis-governance", "central MCP governance plan lane must match");
  ensure(governancePlanPayload?.request === request, "central MCP governance plan must echo request");
  ensure(Array.isArray(governancePlanPayload?.steps) && governancePlanPayload.steps.length >= 4, "central MCP governance plan must include steps");
}

function frameMcpMessage(message) {
  const body = JSON.stringify(message);
  return `Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`;
}

function smokeEnvironment(lane, pluginRoot) {
  return {
    ...process.env,
    SEIS_ROOT: ROOT,
    SEIS_REPO_ROOT: ROOT,
    [lane.pluginRootEnv]: pluginRoot,
  };
}

function parseMcpResponses(output, label) {
  const responses = [];
  if (!output) {
    fail(`${label}: MCP smoke produced no output`);
    return responses;
  }

  const buffer = Buffer.isBuffer(output) ? output : Buffer.from(String(output), "utf8");
  let cursor = 0;

  while (cursor < buffer.length) {
    const separatorIndex = buffer.indexOf("\r\n\r\n", cursor, "utf8");
    if (separatorIndex < 0) break;
    const header = buffer.subarray(cursor, separatorIndex).toString("utf8");
    const lengthMatch = /Content-Length:\s*(\d+)/i.exec(header);
    if (!lengthMatch) {
      fail(`${label}: malformed MCP response header`);
      break;
    }
    const contentLength = Number.parseInt(lengthMatch[1], 10);
    const bodyStart = separatorIndex + 4;
    const bodyEnd = bodyStart + contentLength;
    const body = buffer.subarray(bodyStart, bodyEnd);
    if (body.length !== contentLength) {
      fail(`${label}: truncated MCP response body`);
      break;
    }
    try {
      responses.push(JSON.parse(body.toString("utf8")));
    } catch {
      fail(`${label}: invalid MCP response JSON`);
      break;
    }
    cursor = bodyEnd;
  }

  ensure(responses.length >= 4, `${label}: MCP smoke should return initialize, tools/list, status, and plan responses`);
  return responses;
}

function outputText(output) {
  if (!output) return "";
  return Buffer.isBuffer(output) ? output.toString("utf8") : String(output);
}

function trimmedOutputText(output) {
  return outputText(output).trim();
}

function exitDetail(result) {
  return result.status ?? result.signal ?? "unknown";
}

function validateMarketplace(marketplacePath, label, expectedName) {
  const marketplace = readJson(marketplacePath);
  if (!marketplace) {
    fail(`${label} missing or invalid: ${marketplacePath}`);
    return;
  }
  ensure(marketplace.name === expectedName, `${label}: name must be ${expectedName}`);
  ensure(Array.isArray(marketplace.plugins), `${label}: plugins must be an array`);

  if (expectedName === "seis-repo") {
    const publicFamily = readJson(PUBLIC_FAMILY_PATH);
    const bundleCatalog = readJson(BUNDLE_CATALOG_PATH);
    if (publicFamily?.mode === CURATED_BUNDLE_MODE) {
      validateCuratedPublicMarketplace(marketplace, publicFamily, bundleCatalog, label);
      return;
    }
    const applicationEntries = marketplace.plugins.filter((plugin) => plugin?.source?.path?.startsWith("./plugins/seis-core/"));
    const topicEntries = marketplace.plugins.filter((plugin) => plugin?.source?.path?.startsWith(`./${TOPIC_PLUGIN_SOURCE_ROOT}/`));
    const bundleEntries = marketplace.plugins.filter((plugin) => plugin?.source?.path?.startsWith("./plugins/seis-bundles/"));
    const legacyBundleCatalog = readJson(path.join(ROOT, "content", "development", "seis-public-plugin-bundle-catalog.json"));
    const catalogBundles = Array.isArray(legacyBundleCatalog?.bundles) ? legacyBundleCatalog.bundles : [];
    const applicationBundles = catalogBundles.filter((bundle) => bundle?.family === "application");
    const topicBundles = catalogBundles.filter((bundle) => bundle?.family === "topic");
    const memberNames = catalogBundles.flatMap((bundle) => Array.isArray(bundle?.memberNames) ? bundle.memberNames : []);
    ensure(applicationEntries.length === 0, `${label}: app-owned source capabilities must not be separate discovery cards`);
    ensure(topicEntries.length === 0, `${label}: topic source capabilities must not be separate discovery cards`);
    ensure(bundleEntries.length === 33, `${label}: must publish exactly 33 curated bundle cards`);
    ensure(applicationBundles.length === 6, `${label}: must retain six application bundle cards`);
    ensure(topicBundles.length === 27, `${label}: must retain twenty-seven topic bundle cards`);
    ensure(legacyBundleCatalog?.marketplace?.publicCardCount === 34 && legacyBundleCatalog?.marketplace?.canonicalCardCount === 1 && legacyBundleCatalog?.marketplace?.bundleCardCount === 33, `${label}: bundle catalog card counts are stale`);
    ensure(memberNames.length === APP_PLUGIN_EXPANSION_TARGET + TOPIC_PLUGIN_TARGET && new Set(memberNames).size === memberNames.length, `${label}: retained app and topic capabilities must have exact-once bundle coverage`);
    ensure(marketplace.plugins.length === canonicalMarketplaceEntries.length + bundleEntries.length, `${label}: must publish one canonical card and 33 curated bundles`);
    for (const expected of canonicalMarketplaceEntries) {
      const entry = marketplace.plugins?.find((plugin) => plugin.name === expected.name);
      ensure(entry, `${label}: entry missing: ${expected.name}`);
      if (!entry) continue;
      ensure(entry.source?.source === "local", `${label} ${expected.name}: source must be local`);
      ensure(entry.source?.path === expected.path, `${label} ${expected.name}: path must be ${expected.path}`);
      ensure(entry.policy?.installation === "AVAILABLE", `${label} ${expected.name}: installation must be AVAILABLE`);
      ensure(entry.policy?.authentication === "ON_INSTALL", `${label} ${expected.name}: authentication must be ON_INSTALL`);
      ensure(entry.category === expected.category, `${label} ${expected.name}: category must be ${expected.category}`);
      ensure(fs.existsSync(path.join(ROOT, expected.path)), `${label} ${expected.name}: source path must exist`);
      const manifest = readJson(path.join(ROOT, expected.path, ".codex-plugin", "plugin.json"));
      ensure(manifest?.license === "MIT", `${label} ${expected.name}: manifest must be MIT`);
    }
    for (const expected of migratedRootMarketplaceEntries) {
      ensure(marketplace.plugins.every((plugin) => plugin?.name !== expected.name), `${label}: migrated root source ${expected.name} must not be a separate discovery card`);
      ensure(fs.existsSync(path.join(ROOT, expected.path)), `${label}: retained root source path must exist: ${expected.name}`);
    }
    for (const entry of bundleEntries) {
      const sourcePath = entry.source?.path || "";
      ensure(fs.existsSync(path.join(ROOT, sourcePath)), `${label} ${entry.name}: public bundle source path must exist`);
      ensure(entry.source?.source === "local", `${label} ${entry.name}: source must be local`);
      ensure(entry.policy?.installation === "AVAILABLE", `${label} ${entry.name}: installation must be AVAILABLE`);
      ensure(entry.policy?.authentication === "ON_INSTALL", `${label} ${entry.name}: authentication must be ON_INSTALL`);
      const manifest = readJson(path.join(ROOT, sourcePath, ".codex-plugin", "plugin.json"));
      const profile = readJson(path.join(ROOT, sourcePath, "assets", "bundle-profile.json"));
      ensure(manifest?.license === "MIT", `${label} ${entry.name}: manifest must be MIT`);
      ensure(profile?.id === entry.name, `${label} ${entry.name}: bundle profile id must match`);
      ensure(Number.isSafeInteger(profile?.memberCount) && profile.memberCount >= 1 && profile.memberCount <= 15, `${label} ${entry.name}: bundle member count must stay between 1 and 15`);
      ensure(catalogBundles.some((bundle) => bundle?.id === entry.name && bundle?.sourcePath === sourcePath && bundle?.memberCount === profile?.memberCount), `${label} ${entry.name}: bundle catalog projection is stale`);
    }
    for (const bundle of catalogBundles) {
      const sourceRoot = bundle?.family === "application" ? "plugins/seis-core" : TOPIC_PLUGIN_SOURCE_ROOT;
      for (const memberName of Array.isArray(bundle?.memberNames) ? bundle.memberNames : []) {
        ensure(fs.existsSync(path.join(ROOT, sourceRoot, memberName)), `${label}: retained ${bundle?.family || "unknown"} source path must exist: ${memberName}`);
      }
    }
    return;
  }

  ensure(Array.isArray(marketplace.plugins), `${label}: legacy plugin inventory must remain readable`);
}

function validateCuratedPublicMarketplace(marketplace, publicFamily, bundleCatalog, label) {
  const cards = marketplace.plugins;
  const familyMarketplace = publicFamily?.marketplace || {};
  const expectedEntries = Array.isArray(familyMarketplace.entries) ? familyMarketplace.entries : [];
  const bundles = Array.isArray(bundleCatalog?.bundles) ? bundleCatalog.bundles : [];
  const bundleById = new Map(bundles.map((bundle) => [bundle?.id, bundle]));
  const cardNames = cards.map((card) => card?.name);

  ensure(familyMarketplace.publicPluginCount === 34, `${label}: curated family must declare 34 public cards`);
  ensure(familyMarketplace.canonicalOrchestratorCount === 1, `${label}: curated family must declare one canonical orchestrator`);
  ensure(familyMarketplace.bundlePluginCount === 33, `${label}: curated family must declare 33 optional bundles`);
  ensure(familyMarketplace.applicationBundlePluginCount === 6, `${label}: curated family must declare six application bundles`);
  ensure(familyMarketplace.topicBundlePluginCount === 27, `${label}: curated family must declare 27 topic bundles`);
  ensure(familyMarketplace.applicationPluginCount === APP_PLUGIN_EXPANSION_TARGET, `${label}: curated family must retain all application source packages`);
  ensure(familyMarketplace.topicPluginCount === TOPIC_PLUGIN_TARGET, `${label}: curated family must retain all topic source packages`);
  ensure(familyMarketplace.sourceCapabilityCount === 380, `${label}: curated family must retain 380 source capabilities`);
  ensure(cards.length === familyMarketplace.publicPluginCount, `${label}: card count must match curated family`);
  ensure(expectedEntries.length === cards.length, `${label}: curated family entries must match marketplace cards`);
  ensure(new Set(cardNames).size === cards.length, `${label}: curated marketplace card names must be unique`);
  ensure(bundles.length === familyMarketplace.bundlePluginCount, `${label}: bundle catalog count must match curated family`);
  ensure(bundleCatalog?.marketplace?.publicCardCount === cards.length, `${label}: bundle catalog public card count must match marketplace`);
  ensure(bundleCatalog?.marketplace?.canonicalCardCount === 1 && bundleCatalog?.marketplace?.bundleCardCount === bundles.length, `${label}: bundle catalog card composition is invalid`);
  ensure(bundleCatalog?.sourceCapabilityInventory?.rootSourceModuleCount === 5, `${label}: bundle catalog must retain five root source modules`);
  ensure(bundleCatalog?.sourceCapabilityInventory?.applicationSourcePackageCount === APP_PLUGIN_EXPANSION_TARGET, `${label}: bundle catalog application source count is invalid`);
  ensure(bundleCatalog?.sourceCapabilityInventory?.topicSourcePackageCount === TOPIC_PLUGIN_TARGET, `${label}: bundle catalog topic source count is invalid`);
  ensure(bundleCatalog?.sourceCapabilityInventory?.retainedSourcePackageCount === 380, `${label}: bundle catalog retained source count is invalid`);
  ensure(bundleCatalog?.sourceCapabilityInventory?.sourcePackagesDeleted === false, `${label}: curated packaging must not delete source packages`);

  const canonical = cards.filter((card) => card?.name === "seis-ai-agent");
  ensure(canonical.length === 1, `${label}: curated marketplace must contain exactly one SEIS-Agent card`);
  const canonicalCard = canonical[0];
  ensure(canonicalCard?.source?.source === "local" && canonicalCard?.source?.path === "./plugins/seis-ai-agent", `${label}: canonical SEIS-Agent source is invalid`);
  ensure(canonicalCard?.policy?.installation === "AVAILABLE" && canonicalCard?.policy?.authentication === "ON_INSTALL", `${label}: canonical SEIS-Agent policy is invalid`);
  ensure(canonicalCard?.category === "Developer", `${label}: canonical SEIS-Agent category is invalid`);
  ensure(fs.existsSync(path.join(ROOT, canonicalCard.source.path)), `${label}: canonical SEIS-Agent source path must exist`);
  ensure(readJson(path.join(ROOT, canonicalCard.source.path, ".codex-plugin", "plugin.json"))?.license === "MIT", `${label}: canonical SEIS-Agent manifest must be MIT`);

  const bundleCards = cards.filter((card) => card?.source?.path?.startsWith("./plugins/seis-bundles/"));
  ensure(bundleCards.length === bundles.length, `${label}: marketplace must contain exactly the declared bundle cards`);
  ensure(cards.length === canonical.length + bundleCards.length, `${label}: curated marketplace must contain no direct source-package cards`);
  for (const expected of expectedEntries) {
    const card = cards.find((candidate) => candidate?.name === expected?.name);
    ensure(card, `${label}: curated entry missing: ${expected?.name}`);
    if (!card) continue;
    ensure(card?.source?.source === "local" && card?.source?.path === expected?.sourcePath, `${label} ${expected?.name}: source path must match curated family`);
    ensure(card?.policy?.installation === expected?.installation && card?.policy?.authentication === expected?.authentication, `${label} ${expected?.name}: policy must match curated family`);
    ensure(card?.category === expected?.category, `${label} ${expected?.name}: category must match curated family`);
  }

  const memberNames = [];
  const memberPaths = [];
  for (const card of bundleCards) {
    const sourcePath = card?.source?.path || "";
    const bundleId = card?.name;
    const bundle = bundleById.get(bundleId);
    ensure(bundle, `${label} ${bundleId}: bundle card is missing from the catalog`);
    ensure(sourcePath === bundle?.sourcePath, `${label} ${bundleId}: source path must match the bundle catalog`);
    ensure(card?.source?.source === "local", `${label} ${bundleId}: bundle source must be local`);
    ensure(card?.policy?.installation === "AVAILABLE" && card?.policy?.authentication === "ON_INSTALL", `${label} ${bundleId}: bundle policy is invalid`);
    ensure(card?.category === bundle?.category, `${label} ${bundleId}: bundle category must match the catalog`);
    ensure(fs.existsSync(path.join(ROOT, sourcePath)), `${label} ${bundleId}: bundle source path must exist`);
    const manifest = readJson(path.join(ROOT, sourcePath, ".codex-plugin", "plugin.json"));
    const profile = readJson(path.join(ROOT, sourcePath, "assets", "bundle-profile.json"));
    ensure(manifest?.name === bundleId && manifest?.license === "MIT", `${label} ${bundleId}: bundle manifest is invalid`);
    ensure(profile?.id === bundleId && profile?.status === "repository-local-public-bundle", `${label} ${bundleId}: bundle profile identity is invalid`);
    ensure(profile?.memberCount === bundle?.memberCount && profile?.memberCount > 0 && profile?.memberCount <= 15, `${label} ${bundleId}: bundle membership bound is invalid`);
    ensure(Array.isArray(profile?.members) && profile.members.length === profile.memberCount, `${label} ${bundleId}: bundle member list is invalid`);
    ensure(JSON.stringify(profile.members.map((member) => member?.name)) === JSON.stringify(bundle?.memberNames), `${label} ${bundleId}: bundle member names must match the catalog`);
    ensure(Array.isArray(profile?.permissions?.write) && profile.permissions.write.length === 0, `${label} ${bundleId}: bundle write permissions must be empty`);
    ensure(Array.isArray(profile?.permissions?.network) && profile.permissions.network.length === 0, `${label} ${bundleId}: bundle network permissions must be empty`);
    ensure(Array.isArray(profile?.permissions?.secrets) && profile.permissions.secrets.length === 0, `${label} ${bundleId}: bundle secret permissions must be empty`);
    ensure(profile?.installationPolicy?.optionalSelectionBundle === true && profile?.installationPolicy?.bundleMembersAutoInstalled === false && profile?.installationPolicy?.sourcePackagesRetained === true && profile?.installationPolicy?.sourcePackagesDeleted === false, `${label} ${bundleId}: bundle installation boundary is invalid`);
    for (const member of profile.members) {
      memberNames.push(member?.name);
      memberPaths.push(member?.sourcePath);
      ensure(typeof member?.sourcePath === "string" && member.sourcePath.startsWith("./plugins/") && !member.sourcePath.includes(".."), `${label} ${bundleId}: member source path is invalid`);
      ensure(fs.existsSync(path.join(ROOT, member.sourcePath)), `${label} ${bundleId}: retained member source must exist`);
    }
  }
  ensure(memberNames.length === APP_PLUGIN_EXPANSION_TARGET + TOPIC_PLUGIN_TARGET, `${label}: curated bundles must cover all application and topic source packages`);
  ensure(new Set(memberNames).size === memberNames.length && new Set(memberPaths).size === memberPaths.length, `${label}: curated bundle source coverage must be exact-once`);
}

function validateEmbeddedAgentPlugin() {
  const agentRoot = path.join(ROOT, "plugins", "seis-ai-agent");
  const profile = readJson(path.join(agentRoot, "assets", "agent-profile.json"));
  ensureFile(path.join(agentRoot, ".codex-plugin", "plugin.json"), "embedded SEIS-Agent manifest");
  ensureFile(path.join(agentRoot, "scripts", "seis-ai-agent-mcp-server.mjs"), "embedded SEIS-Agent MCP server");
  ensure(profile?.consolidationPolicy?.standaloneLaneInstallMode === "source-module-only", "SEIS-Agent profile must retain lanes as source modules only");
  ensure(profile?.consolidationPolicy?.marketplacePolicy === "seis-agent-is-the-canonical-public-orchestrator-with-curated-bounded-public-bundles", "SEIS-Agent profile must expose the canonical orchestrator and curated public bundle policy");

  for (const skill of ["seis-ai-agent", "seis-hub", ...lanes.map((lane) => lane.name)]) {
    ensureFile(path.join(agentRoot, "skills", skill, "SKILL.md"), `embedded ${skill} skill`);
    ensure(profile?.consolidationPolicy?.embeddedSkills?.includes(skill), `SEIS-Agent profile embeddedSkills missing ${skill}`);
  }

  for (const lane of lanes) {
    ensureFile(path.join(agentRoot, "assets", "lanes", `${lane.name}.json`), `embedded ${lane.name} lane profile`);
    validateCodeContains(path.join(agentRoot, "scripts", "seis-ai-agent-mcp-server.mjs"), lane.tools[0], `SEIS-Agent MCP server must expose embedded ${lane.tools[0]}`);
    validateCodeContains(path.join(agentRoot, "scripts", "seis-ai-agent-mcp-server.mjs"), lane.tools[1], `SEIS-Agent MCP server must expose embedded ${lane.tools[1]}`);
  }
}

function parseArgs(argv) {
  const result = {};
  for (const token of argv) {
    if (token === "--include-legacy-personal") result["include-legacy-personal"] = true;
    if (token === "--no-local") result["no-local"] = true;
    if (token === "--help") result.help = true;
  }
  return result;
}

function ensure(condition, message) {
  if (!condition) fail(message);
}

function ensureArrayContainsAll(candidate, expected, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of expected) ensure(values.has(item), `${label} missing ${item}`);
}

function ensureDir(candidate, label) {
  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isDirectory()) {
    fail(`${label} not found: ${candidate}`);
  }
}

function ensureFile(candidate, label) {
  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) {
    fail(`${label} missing: ${candidate}`);
  }
}

function fail(message) {
  failures.push(message);
}

function homeDir() {
  return process.env.HOME || process.env.USERPROFILE || "";
}

function discoverLegacyPersonalSources() {
  const sources = new Map();
  const addSource = (name, root, origin) => {
    if (!isSeisPluginName(name) || !isPluginRoot(root)) return;
    const normalizedRoot = path.resolve(root);
    sources.set(`${name}:${normalizedRoot}`, { name, root: normalizedRoot, origin });
  };

  const cacheRoot = process.env.SEIS_LEGACY_PERSONAL_CACHE_ROOT
    || path.join(homeDir(), ".codex", "plugins", "cache", "personal");
  if (fs.existsSync(cacheRoot) && fs.statSync(cacheRoot).isDirectory()) {
    for (const entry of fs.readdirSync(cacheRoot, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      if (!entry.isDirectory() || !isSeisPluginName(entry.name)) continue;
      const pluginCacheRoot = path.join(cacheRoot, entry.name);
      const versions = fs.readdirSync(pluginCacheRoot, { withFileTypes: true })
        .filter((candidate) => candidate.isDirectory())
        .map((candidate) => candidate.name)
        .sort((left, right) => right.localeCompare(left, undefined, { numeric: true }));
      for (const version of versions) {
        const versionRoot = path.join(pluginCacheRoot, version);
        if (isPluginRoot(versionRoot)) addSource(entry.name, versionRoot, "codex-personal-cache");
      }
    }
  }

  const manualPluginRoot = path.join(homeDir(), "plugins");
  if (fs.existsSync(manualPluginRoot) && fs.statSync(manualPluginRoot).isDirectory()) {
    for (const entry of fs.readdirSync(manualPluginRoot, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      if (entry.isDirectory() && isSeisPluginName(entry.name)) {
        addSource(entry.name, path.join(manualPluginRoot, entry.name), "legacy-plugin-root");
      }
    }
  }

  for (const lane of standaloneLanes) {
    const configuredRoot = lane.pluginRootEnv ? process.env[lane.pluginRootEnv] : "";
    if (configuredRoot) addSource(lane.name, configuredRoot, "configured-plugin-root");
  }

  const configuredHubRoot = process.env.SEIS_PLUGIN_ROOT;
  if (configuredHubRoot) addSource("seis", configuredHubRoot, "configured-plugin-root");

  return [...sources.values()].sort((left, right) => {
    const byName = left.name.localeCompare(right.name);
    return byName || left.origin.localeCompare(right.origin) || left.root.localeCompare(right.root);
  });
}

function reportLegacyPersonalSourceAudit(sources) {
  if (sources.length === 0) {
    console.log("Legacy personal-source audit: no SEIS source packages discovered in configured roots.");
    return;
  }

  const names = [...new Set(sources.map((source) => source.name))].join(", ");
  const origins = [...new Set(sources.map((source) => source.origin))].sort().join(", ");
  console.log(
    `Legacy personal-source audit: verified ${sources.length} source root(s) for ${new Set(sources.map((source) => source.name)).size} package(s) (${names}); origins: ${origins}; local MCP execution: disabled.`
  );
}

function isSeisPluginName(name) {
  return name === "seis" || name.startsWith("seis-");
}

function isPluginRoot(candidate) {
  return fs.existsSync(path.join(candidate, ".codex-plugin", "plugin.json"));
}

function validateLegacyPersonalMirror(source) {
  const manifestPath = path.join(source.root, ".codex-plugin", "plugin.json");
  const manifest = readJson(manifestPath);
  ensure(manifest?.name === source.name, `legacy personal ${source.name}: manifest name must match its source directory`);
  ensure(manifest?.mcpServers === "./.mcp.json", `legacy personal ${source.name}: manifest must reference .mcp.json`);

  const repoRoot = path.join(ROOT, "plugins", source.name);
  ensureDir(repoRoot, `repo counterpart for legacy personal ${source.name}`);
  const repoManifest = readJson(path.join(repoRoot, ".codex-plugin", "plugin.json"));
  ensure(repoManifest?.name === source.name, `repo counterpart for legacy personal ${source.name}: manifest name must match`);
  ensure(repoManifest?.license === "MIT", `repo counterpart for legacy personal ${source.name}: public manifest license must be MIT`);

  const localFiles = listPortablePluginFiles(source.root);
  ensure(localFiles.length > 0, `legacy personal ${source.name}: source must contain portable plugin files`);
  for (const relativePath of localFiles) {
    if (isSensitiveLocalPluginPath(relativePath)) {
      fail(`legacy personal ${source.name}: sensitive local path must not be promoted: ${relativePath}`);
      continue;
    }
    ensureFile(
      path.join(repoRoot, relativePath),
      `repo counterpart for legacy personal ${source.name}: missing promoted source path ${relativePath}`
    );
  }
}

function listPortablePluginFiles(root) {
  const files = [];
  const ignoredDirectories = new Set([".git", "node_modules", "dist", "build", "coverage"]);
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!ignoredDirectories.has(entry.name)) walk(path.join(directory, entry.name));
        continue;
      }
      if (entry.isFile() && entry.name !== ".DS_Store") {
        files.push(path.relative(root, path.join(directory, entry.name)));
      }
    }
  };
  walk(root);
  return files.sort();
}

function isSensitiveLocalPluginPath(relativePath) {
  const fileName = path.basename(relativePath).toLowerCase();
  return fileName === ".env"
    || (fileName.startsWith(".env.") && fileName !== ".env.example")
    || fileName === "credentials.json"
    || fileName === "tokens.json"
    || fileName === "id_rsa"
    || fileName === "id_ed25519"
    || fileName.endsWith(".pem")
    || fileName.endsWith(".key");
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    fail(`invalid JSON: ${filePath}`);
    return null;
  }
}

function validateJsonObject(filePath, label, requiredKeys = []) {
  const record = readJson(filePath);
  if (!record || typeof record !== "object") {
    fail(`${label} must be a JSON object: ${path.relative(ROOT, filePath)}`);
    return;
  }

  for (const key of requiredKeys) {
    ensure(record[key] !== undefined, `${label}: key '${key}' is missing`);
  }

  return record;
}

function validateCodeContains(filePath, token, message) {
  if (!fs.existsSync(filePath)) {
    fail(`file not found: ${path.relative(ROOT, filePath)}`);
    return;
  }

  const text = fs.readFileSync(filePath, "utf8");
  ensure(text.includes(token), `${message}: ${path.relative(ROOT, filePath)}`);
}
