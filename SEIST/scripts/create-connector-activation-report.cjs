#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = process.cwd();
const checkMode = process.argv.includes("--check");
const registryPath = path.join(ROOT, "content", "development", "connector-capability-registry.json");
const pluginCatalogPath = path.join(ROOT, "content", "development", "plugin-capability-catalog.json");
const reportPath = path.join(ROOT, "reports", "connector-activation-report.md");
const contractPath = path.join(ROOT, "reports", "connector-activation-report.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const pluginCatalog = readJson(pluginCatalogPath) || {};
const existingContract = readExistingContract(contractPath);
const generatedAt = process.env.SEIS_CONNECTOR_REPORT_REFRESH_TIMESTAMP === "1" || !existingContract?.generatedAt
  ? new Date().toISOString()
  : existingContract.generatedAt;

function run(command, args) {
  return spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: "0"
    }
  });
}

function envSet(name) {
  return typeof process.env[name] === "string" && process.env[name].trim().length > 0;
}

function gitClean() {
  const status = run("git", ["status", "--short"]);
  return status.status === 0 && String(status.stdout || "").trim().length === 0;
}

function githubAuthReady() {
  const auth = run("gh", ["auth", "status", "-h", "github.com"]);
  return auth.status === 0;
}

const liveSignals = {
  clean_worktree: gitClean(),
  publish_readiness_pass: run("npm", ["run", "automation:publish-readiness"]).status === 0,
  github_auth: githubAuthReady(),
  provider_token: envSet("CLOUDFLARE_API_TOKEN") || envSet("VERCEL_TOKEN") || envSet("NETLIFY_AUTH_TOKEN"),
  site_selection: envSet("SEIS_SITE_URL"),
  route_selection: envSet("SEIS_CLOUD_ROUTE"),
  project_selection: envSet("SEIS_OBSERVABILITY_PROJECT"),
  auth_scope: envSet("SEIS_CONNECTOR_AUTH_SCOPE"),
  user_approval: envSet("SEIS_CONNECTOR_APPROVED"),
  channel_scope: envSet("SEIS_NOTIFICATION_CHANNEL"),
  destination_selection: envSet("SEIS_HANDOFF_DESTINATION"),
  workflow_scope: envSet("SEIS_OUTPUT_WORKFLOW_SCOPE"),
  outputai_task_fit: envSet("SEIS_OUTPUTAI_TASK_FIT"),
  public_equity_plugin_available: envSet("SEIS_PUBLIC_EQUITY_PLUGIN_AVAILABLE"),
  financial_data_auth: envSet("SEIS_FINANCIAL_DATA_AUTH"),
  target_company_scope: envSet("SEIS_TARGET_COMPANY") || envSet("SEIS_PUBLIC_EQUITY_TARGET"),
  product_design_plugin_available: envSet("SEIS_PRODUCT_DESIGN_PLUGIN_AVAILABLE"),
  product_design_auth: envSet("SEIS_PRODUCT_DESIGN_AUTH"),
  product_design_scope: envSet("SEIS_PRODUCT_DESIGN_SCOPE"),
  investment_banking_plugin_available: envSet("SEIS_INVESTMENT_BANKING_PLUGIN_AVAILABLE"),
  investment_banking_auth: envSet("SEIS_INVESTMENT_BANKING_AUTH"),
  deal_scope: envSet("SEIS_DEAL_SCOPE"),
  figma_file_or_node: envSet("SEIS_FIGMA_TARGET"),
  design_scope: envSet("SEIS_DESIGN_SCOPE"),
  known_local_url_or_file: envSet("SEIS_BROWSER_TARGET"),
  ui_change_scope: envSet("SEIS_UI_CHANGE_SCOPE"),
  low_power_browser_budget: envSet("SEIS_BROWSER_LOW_POWER_BUDGET"),
  ui_or_canvas_change: envSet("SEIS_UI_OR_CANVAS_CHANGE"),
  test_target_url: envSet("SEIS_TEST_TARGET_URL"),
  browser_budget: envSet("SEIS_BROWSER_TEST_BUDGET"),
  security_sensitive_change: envSet("SEIS_SECURITY_SENSITIVE_CHANGE"),
  scan_scope: envSet("SEIS_SECURITY_SCAN_SCOPE"),
  no_autofix_confirmation: envSet("SEIS_NO_AUTOFIX_CONFIRMATION"),
  workspace_auth: envSet("SEIS_WORKSPACE_AUTH"),
  project_destination: envSet("SEIS_PROJECT_DESTINATION"),
  page_destination: envSet("SEIS_PAGE_DESTINATION"),
  drive_auth: envSet("SEIS_DRIVE_AUTH"),
  folder_destination: envSet("SEIS_FOLDER_DESTINATION"),
  task_scope: envSet("SEIS_TASK_SCOPE"),
  plugin_target: envSet("SEIS_PLUGIN_TARGET"),
  mcp_target: envSet("SEIS_MCP_TARGET"),
  skill_target: envSet("SEIS_SKILL_TARGET"),
  write_scope: envSet("SEIS_WRITE_SCOPE")
};
const localSignals = checkMode && existingContract?.localSignals
  ? existingContract.localSignals
  : liveSignals;

function evaluateConnector(connector) {
  const blockers = connector.blockedWithout || [];
  const missing = blockers.filter((blocker) => !localSignals[blocker]);
  return {
    id: connector.id,
    surface: connector.surface,
    status: missing.length === 0 ? "activatable" : "blocked",
    activationPolicy: connector.activationPolicy,
    missing,
    qualityCommands: connector.qualityCommands || []
  };
}

const connectors = registry.connectors.map(evaluateConnector);
const activatable = connectors.filter((connector) => connector.status === "activatable");
const blocked = connectors.filter((connector) => connector.status === "blocked");
const pluginFamilies = Array.isArray(pluginCatalog.families) ? pluginCatalog.families : [];
const pluginIds = pluginFamilies.flatMap((family) => Array.isArray(family.plugins) ? family.plugins : []);
const uniquePluginIds = [...new Set(pluginIds)];
const contract = {
  version: 1,
  id: "seis-connector-activation-report",
  generatedAt,
  mode: registry.mode,
  policy: registry.policy,
  localSignals,
  summary: {
    connectors: connectors.length,
    activatable: activatable.length,
    blocked: blocked.length,
    capabilityFamilies: Array.isArray(registry.capabilityFamilies) ? registry.capabilityFamilies.length : 0,
    pluginCatalogFamilies: pluginFamilies.length,
    pluginCatalogPlugins: uniquePluginIds.length
  },
  ecosystemActivation: registry.ecosystemActivation || null,
  capabilityFamilies: registry.capabilityFamilies || [],
  pluginCatalog: {
    id: pluginCatalog.id || null,
    mode: pluginCatalog.mode || null,
    branch: pluginCatalog.branch || null,
    families: pluginFamilies.map((family) => ({
      id: family.id,
      defaultMode: family.defaultMode,
      liveGate: family.liveGate,
      plugins: Array.isArray(family.plugins) ? family.plugins.length : 0
    })),
    uniquePlugins: uniquePluginIds.length,
    blockedLiveUseMessage: pluginCatalog.reporting?.blockedLiveUseMessage || null
  },
  connectors,
  nextActions: activatable.length > 0
    ? ["Use only one activatable connector when it directly advances the current task."]
    : [
        "Keep connector actions local until a task-specific target and approval exist.",
        "Set only the environment gates required by the connector you intend to use.",
        "Rerun npm run automation:connector-activation-report."
      ]
};

const markdown = [
  "# SEIS Connector Activation Report",
  "",
  `- Generated: ${generatedAt}`,
  `- Mode: ${contract.mode}`,
  `- Connectors: ${contract.summary.connectors}`,
  `- Activatable: ${contract.summary.activatable}`,
  `- Blocked: ${contract.summary.blocked}`,
  `- Capability families: ${contract.summary.capabilityFamilies}`,
  `- Plugin catalog families: ${contract.summary.pluginCatalogFamilies}`,
  `- Plugin catalog plugins: ${contract.summary.pluginCatalogPlugins}`,
  "",
  "## Ecosystem Activation",
  "",
  contract.ecosystemActivation?.intent || "No ecosystem activation policy recorded.",
  "",
  "## Capability Families",
  "",
  "| family | default action | live write gate |",
  "| --- | --- | --- |",
  ...(contract.capabilityFamilies || []).map((family) => `| ${family.id} | ${family.defaultAction} | ${family.liveWriteGate} |`),
  "",
  "## Plugin Catalog",
  "",
  contract.pluginCatalog.blockedLiveUseMessage || "No plugin catalog policy recorded.",
  "",
  "| family | default mode | live gate | plugins |",
  "| --- | --- | --- | --- |",
  ...(contract.pluginCatalog.families || []).map((family) => `| ${family.id} | ${family.defaultMode} | ${family.liveGate} | ${family.plugins} |`),
  "",
  "## Connector Status",
  "",
  "| connector | surface | status | missing gates |",
  "| --- | --- | --- | --- |",
  ...connectors.map((connector) => `| ${connector.id} | ${connector.surface} | ${connector.status} | ${connector.missing.join(", ") || "none"} |`),
  "",
  "## Next Actions",
  "",
  ...contract.nextActions.map((action) => `- ${action}`),
  ""
].join("\n");

fs.mkdirSync(path.dirname(reportPath), { recursive: true });

if (checkMode) {
  const expectedContract = `${JSON.stringify(contract, null, 2)}\n`;
  const expectedMarkdown = `${markdown}\n`;
  const drift = [];

  if (readText(contractPath) !== expectedContract) drift.push(path.relative(ROOT, contractPath));
  if (readText(reportPath) !== expectedMarkdown) drift.push(path.relative(ROOT, reportPath));

  if (drift.length > 0) {
    console.error("Connector activation report is stale:");
    for (const file of drift) console.error(`- ${file}`);
    console.error("Run npm run automation:connector-activation-report to refresh generated files.");
    process.exit(1);
  }

  console.log("Connector activation report check passed.");
} else {
  fs.writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
  fs.writeFileSync(reportPath, `${markdown}\n`);
  console.log(`Connector activation report written: ${path.relative(ROOT, reportPath)}`);
  console.log(`Connector activation contract written: ${path.relative(ROOT, contractPath)}`);
}

function readExistingContract(file) {
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (_error) {
    return null;
  }
}

function readJson(file) {
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (_error) {
    return null;
  }
}

function readText(file) {
  if (!fs.existsSync(file)) return "";
  return fs.readFileSync(file, "utf8");
}
