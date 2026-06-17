#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const checkMode = process.argv.includes("--check");
const sourcePath = path.join(ROOT, "content", "development", "requested-plugin-trace.json");
const inventoryPath = path.join(ROOT, "content", "development", "requested-plugin-inventory.json");
const jsonReportPath = path.join(ROOT, "reports", "requested-plugin-trace.json");
const markdownReportPath = path.join(ROOT, "reports", "requested-plugin-trace.md");

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
const requestedPlugins = Array.isArray(source.requestedPlugins) ? source.requestedPlugins : [];
const submittedPlugins = Array.isArray(inventory.plugins) ? inventory.plugins : [];
const blocked = requestedPlugins.filter((plugin) => String(plugin.observedSessionStatus || "").includes("not-callable"));
const sourceCounts = submittedPlugins.reduce((counts, plugin) => {
  counts[plugin.source] = (counts[plugin.source] || 0) + 1;
  return counts;
}, {});

const contract = {
  version: 1,
  id: "seis-requested-plugin-trace-report",
  generatedAt: source.updatedAt,
  sourceId: source.id,
  inventoryId: inventory.id,
  mode: source.mode,
  summary: {
    requestedPlugins: requestedPlugins.length,
    exactPluginBlocked: blocked.length,
    submittedPluginLinks: inventory.summary?.totalLinks || submittedPlugins.length,
    uniqueSubmittedPlugins: submittedPlugins.length,
    submittedPluginSources: sourceCounts
  },
  requestedPlugins: requestedPlugins.map((plugin) => ({
    id: plugin.id,
    uri: plugin.uri,
    surface: plugin.surface,
    observedSessionStatus: plugin.observedSessionStatus,
    nearestAvailableSurface: plugin.nearestAvailableSurface,
    activationPolicy: plugin.activationPolicy,
    blockedWithout: plugin.blockedWithout || []
  })),
  submittedPluginInventory: submittedPlugins.map((plugin) => ({
    order: plugin.order,
    id: plugin.id,
    label: plugin.label,
    source: plugin.source,
    uri: plugin.uri,
    status: plugin.status,
    activationPolicy: plugin.activationPolicy
  }))
};

const markdown = [
  "# SEIS Requested Plugin Trace",
  "",
  `- Generated: ${contract.generatedAt}`,
  `- Source: ${path.relative(ROOT, sourcePath)}`,
  `- Submitted inventory: ${path.relative(ROOT, inventoryPath)}`,
  `- Requested plugins: ${contract.summary.requestedPlugins}`,
  `- Exact plugin blocked: ${contract.summary.exactPluginBlocked}`,
  `- Submitted plugin links: ${contract.summary.submittedPluginLinks}`,
  `- Unique submitted plugins: ${contract.summary.uniqueSubmittedPlugins}`,
  "",
  "## Plugin Status",
  "",
  "| requested plugin | surface | session status | nearest available surface | missing gates |",
  "| --- | --- | --- | --- | --- |",
  ...contract.requestedPlugins.map((plugin) => [
    plugin.id,
    plugin.surface,
    plugin.observedSessionStatus,
    plugin.nearestAvailableSurface,
    plugin.blockedWithout.join(", ") || "none"
  ].map(escapeCell).join(" | ")).map((row) => `| ${row} |`),
  "",
  "## Submitted Plugin Inventory",
  "",
  "| # | plugin | source | uri | status |",
  "| --- | --- | --- | --- | --- |",
  ...contract.submittedPluginInventory.map((plugin) => [
    plugin.order,
    plugin.id,
    plugin.source,
    plugin.uri,
    plugin.status
  ].map(escapeCell).join(" | ")).map((row) => `| ${row} |`),
  "",
  "## Governance Notes",
  "",
  "- These entries are source-visible because the user explicitly requested them.",
  "- The submitted inventory keeps the full pasted plugin list visible without treating every plugin as active.",
  "- Exact unavailable plugins remain blocked until the matching plugin, authentication, scope, and approval gates are present.",
  "- Nearby tools can inform analysis only when their own auth, subscription, and scope requirements are satisfied.",
  ""
].join("\n");

fs.mkdirSync(path.dirname(jsonReportPath), { recursive: true });

if (checkMode) {
  const expectedJson = `${JSON.stringify(contract, null, 2)}\n`;
  const expectedMarkdown = `${markdown}\n`;
  const drift = [];

  if (readText(jsonReportPath) !== expectedJson) drift.push(path.relative(ROOT, jsonReportPath));
  if (readText(markdownReportPath) !== expectedMarkdown) drift.push(path.relative(ROOT, markdownReportPath));

  if (drift.length > 0) {
    console.error("Requested plugin trace is stale:");
    for (const file of drift) console.error(`- ${file}`);
    console.error("Run node scripts/create-requested-plugin-trace.cjs to refresh generated files.");
    process.exit(1);
  }

  console.log("Requested plugin trace check passed.");
} else {
  fs.writeFileSync(jsonReportPath, `${JSON.stringify(contract, null, 2)}\n`);
  fs.writeFileSync(markdownReportPath, `${markdown}\n`);
  console.log(`Requested plugin trace written: ${path.relative(ROOT, jsonReportPath)}`);
  console.log(`Requested plugin trace written: ${path.relative(ROOT, markdownReportPath)}`);
}

function readText(file) {
  if (!fs.existsSync(file)) return "";
  return fs.readFileSync(file, "utf8");
}

function escapeCell(value) {
  return String(value ?? "").replaceAll("\\", "\\\\").replaceAll("|", "\\|").split(/\r?\n/).join("<br>");
}
