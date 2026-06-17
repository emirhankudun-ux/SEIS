#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const checkMode = process.argv.includes("--check");
const inventoryPath = path.join(ROOT, "content", "development", "requested-plugin-inventory.json");
const lanesPath = path.join(ROOT, "content", "development", "plugin-capability-lanes.json");
const sourcePath = path.join(ROOT, "content", "development", "plugin-download-readiness.json");
const reportJsonPath = path.join(ROOT, "reports", "plugin-download-readiness.json");
const reportMarkdownPath = path.join(ROOT, "reports", "plugin-download-readiness.md");

const ACTIVATION_POLICY = "activate_only_when_relevant_authenticated_scoped_and_user_approved";
const INSTALL_POLICY = "download_or_enable_only_for_submitted_plugins_when_available_authenticated_scoped_and_user_approved";
const INSTALL_STRATEGY = "prefer_existing_available_plugin_then_request_install_for_exact_submitted_uri";
const USE_STRATEGY = "activate_plugin_only_for_matching_task_and_authenticated_account";
const SAFE_DOWNLOAD_TARGET = "codex_plugin_catalog_or_current_session_capabilities";
const INSTALL_READINESS = "ready_to_request_install_or_enable";
const USE_READINESS = "ready_when_tool_available_authenticated_and_scoped";
const INSTALL_GATES = [
  "plugin_uri_matches_submitted_inventory",
  "plugin_or_app_is_available_in_current_environment_or_install_catalog",
  "account_authentication_present_when_required",
  "task_scope_matches_capability_lane",
  "no_secrets_committed",
  "targeted_validation_passed"
];

const inventory = readJson(inventoryPath);
const lanes = readJson(lanesPath);
const plugins = Array.isArray(inventory.plugins) ? inventory.plugins : [];
const assignments = Array.isArray(lanes.assignments) ? lanes.assignments : [];
const assignmentByUri = new Map(assignments.map((assignment) => [assignment.uri, assignment]));
const sourceCounts = countBy(plugins, (plugin) => plugin.source);
const laneCounts = countBy(plugins, (plugin) => assignmentByUri.get(plugin.uri)?.primaryLane || "unmapped");

const pluginReadiness = plugins.map((plugin) => {
  const assignment = assignmentByUri.get(plugin.uri) || {};

  return {
    order: plugin.order,
    id: plugin.id,
    label: plugin.label,
    source: plugin.source,
    uri: plugin.uri,
    requestedStatus: plugin.status,
    primaryLane: assignment.primaryLane || "unmapped",
    matchedLanes: assignment.matchedLanes || [],
    downloadStatus: "source_visible_download_ready",
    installReadiness: INSTALL_READINESS,
    useReadiness: USE_READINESS,
    downloadTarget: SAFE_DOWNLOAD_TARGET,
    requestedByUser: true,
    installPolicy: INSTALL_POLICY,
    activationPolicy: plugin.activationPolicy || ACTIVATION_POLICY,
    gates: INSTALL_GATES
  };
});

const contract = {
  version: 1,
  id: "seis-plugin-download-readiness",
  generatedAt: inventory.updatedAt || "2026-06-03",
  mode: "all_submitted_plugins_download_ready_in_environment_sources",
  sourceReferences: {
    submittedPluginInventory: path.relative(ROOT, inventoryPath),
    pluginCapabilityLanes: path.relative(ROOT, lanesPath)
  },
  policy: {
    installPolicy: INSTALL_POLICY,
    installStrategy: INSTALL_STRATEGY,
    useStrategy: USE_STRATEGY,
    downloadTarget: SAFE_DOWNLOAD_TARGET,
    activationPolicy: ACTIVATION_POLICY,
    secretHandling: "never_commit_tokens",
    runtimeActivation: "no_blanket_activation_without_exact_task_scope"
  },
  summary: {
    totalLinks: inventory.summary?.totalLinks || plugins.length,
    uniquePlugins: plugins.length,
    downloadReadyPlugins: pluginReadiness.length,
    installReadyPlugins: pluginReadiness.length,
    useReadyPlugins: pluginReadiness.length,
    laneCount: Object.keys(laneCounts).length,
    sourceCounts,
    laneCounts
  },
  plugins: pluginReadiness,
  governance: [
    "All submitted plugin URIs are visible as download-ready source entries.",
    "Install readiness means the plugin can be requested or enabled from the submitted URI when the environment supports it.",
    "Use readiness still requires the exact task lane, account authentication, and scoped tool availability.",
    "Download readiness is not live activation; credentials and task scope are still required.",
    "Generated entries keep plugin use auditable without committing secrets or vendor folders.",
    "Future install tooling should read this contract instead of re-parsing pasted chat text."
  ]
};

const report = {
  version: 1,
  id: "seis-plugin-download-readiness-report",
  generatedAt: contract.generatedAt,
  sourceId: contract.id,
  sourcePath: path.relative(ROOT, sourcePath),
  summary: contract.summary,
  policy: contract.policy,
  plugins: contract.plugins
};

const markdown = createMarkdown(contract);

if (checkMode) {
  const expectedSource = `${JSON.stringify(contract, null, 2)}\n`;
  const expectedReport = `${JSON.stringify(report, null, 2)}\n`;
  const expectedMarkdown = `${markdown}\n`;
  const drift = [];

  if (readText(sourcePath) !== expectedSource) drift.push(path.relative(ROOT, sourcePath));
  if (readText(reportJsonPath) !== expectedReport) drift.push(path.relative(ROOT, reportJsonPath));
  if (readText(reportMarkdownPath) !== expectedMarkdown) drift.push(path.relative(ROOT, reportMarkdownPath));

  if (drift.length > 0) {
    console.error("Plugin download readiness is stale:");
    for (const file of drift) console.error(`- ${file}`);
    console.error("Run node scripts/create-plugin-download-readiness.cjs to refresh generated files.");
    process.exit(1);
  }

  console.log("Plugin download readiness check passed.");
} else {
  fs.writeFileSync(sourcePath, `${JSON.stringify(contract, null, 2)}\n`);
  fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(reportMarkdownPath, `${markdown}\n`);
  console.log(`Plugin download readiness written: ${path.relative(ROOT, sourcePath)}`);
  console.log(`Plugin download readiness written: ${path.relative(ROOT, reportJsonPath)}`);
  console.log(`Plugin download readiness written: ${path.relative(ROOT, reportMarkdownPath)}`);
}

function createMarkdown(contractData) {
  const lines = [
    "# SEIS Plugin Download Readiness",
    "",
    `- Generated: ${contractData.generatedAt}`,
    `- Mode: ${contractData.mode}`,
    `- Total submitted links: ${contractData.summary.totalLinks}`,
    `- Unique plugins: ${contractData.summary.uniquePlugins}`,
    `- Download-ready plugins: ${contractData.summary.downloadReadyPlugins}`,
    `- Install-ready plugins: ${contractData.summary.installReadyPlugins}`,
    `- Use-ready plugins: ${contractData.summary.useReadyPlugins}`,
    "",
    "## Source Counts",
    "",
    "| source | plugins |",
    "| --- | ---: |",
    ...Object.entries(contractData.summary.sourceCounts).map(([source, count]) => `| ${escapeCell(source)} | ${count} |`),
    "",
    "## Lane Counts",
    "",
    "| lane | plugins |",
    "| --- | ---: |",
    ...Object.entries(contractData.summary.laneCounts).map(([lane, count]) => `| ${escapeCell(lane)} | ${count} |`),
    "",
    "## Download Readiness",
    "",
    "| # | plugin | source | lane | download | install | use |",
    "| ---: | --- | --- | --- | --- | --- | --- |",
    ...contractData.plugins.map((plugin) => [
      plugin.order,
      plugin.id,
      plugin.source,
      plugin.primaryLane,
      plugin.downloadStatus,
      plugin.installReadiness,
      plugin.useReadiness
    ].map(escapeCell).join(" | ")).map((row) => `| ${row} |`),
    "",
    "## Governance",
    "",
    ...contractData.governance.map((item) => `- ${item}`)
  ];

  return lines.join("\n");
}

function countBy(items, keySelector) {
  return items.reduce((counts, item) => {
    const key = keySelector(item);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function readText(file) {
  if (!fs.existsSync(file)) return "";
  return fs.readFileSync(file, "utf8");
}

function escapeCell(value) {
  return String(value || "").replace(/\|/g, "\\|");
}
