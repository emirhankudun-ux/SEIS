#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const checkMode = process.argv.includes("--check");
const inventoryPath = path.join(ROOT, "content", "development", "requested-plugin-inventory.json");
const lanesPath = path.join(ROOT, "content", "development", "plugin-capability-lanes.json");
const manifestPath = path.join(ROOT, "polyglot", "manifest.json");
const sourcePath = path.join(ROOT, "content", "development", "requested-software-stack.json");
const reportJsonPath = path.join(ROOT, "reports", "requested-software-stack.json");
const reportMarkdownPath = path.join(ROOT, "reports", "requested-software-stack.md");

const ACTIVATION_POLICY = "activate_only_when_relevant_authenticated_scoped_and_user_approved";

const requestedTechnologies = [
  {
    id: "javascript",
    label: "JavaScript",
    runtimeRole: "Browser interaction, source-summary helpers, and dependency-free runtime checks.",
    primaryLane: "builder-and-prototyping",
    entrypoints: [
      "apps/web/app.js",
      "polyglot/javascript/plugin-source-runtime.js"
    ],
    supportingPlugins: ["base44", "wix", "lovable", "replit", "build-web-apps", "frontend-design"]
  },
  {
    id: "nodejs",
    label: "Node.js",
    runtimeRole: "Local automation, static server endpoints, and source-readiness validation.",
    primaryLane: "cloud-devops-and-release",
    entrypoints: [
      "server/node/static-server.mjs",
      "polyglot/node/requested_stack_readiness.mjs",
      "scripts/create-requested-software-stack.cjs"
    ],
    supportingPlugins: ["render", "vercel", "netlify", "cloudflare", "github", "replit"]
  },
  {
    id: "mysql",
    label: "MySQL",
    runtimeRole: "Future plugin source ledger and requested-stack registry schema.",
    primaryLane: "backend-data-and-api",
    entrypoints: ["polyglot/mysql/plugin_source_registry.mysql.sql"],
    supportingPlugins: ["planetscale", "prisma", "supabase", "quicknode", "oracle-ai-data-platform-workbench-spark-connectors"]
  },
  {
    id: "react",
    label: "React",
    runtimeRole: "Typed UI component contract for source-visible plugin stack dashboards.",
    primaryLane: "creative-production-and-design",
    entrypoints: ["polyglot/react/PluginSourceDashboard.tsx"],
    supportingPlugins: ["figma", "canva", "product-design", "build-web-apps", "frontend-design", "lovable"]
  },
  {
    id: "expressjs",
    label: "Express.js",
    runtimeRole: "Express-compatible route adapter for plugin source and software stack endpoints.",
    primaryLane: "backend-data-and-api",
    entrypoints: ["server/express/plugin-source-routes.mjs"],
    supportingPlugins: ["postman", "render", "vercel", "twilio-developer-kit", "datadog", "sentry"]
  },
  {
    id: "typescript",
    label: "TypeScript",
    runtimeRole: "Source contracts for requested stack payloads and release integration.",
    primaryLane: "platform-native-and-polyglot",
    entrypoints: [
      "polyglot/typescript/release-contract.ts",
      "polyglot/typescript/fullstack-plugin-contract.ts"
    ],
    supportingPlugins: ["openai-developers", "convex", "supabase", "ui5-typescript-conversion", "apollo-skills"]
  }
];

const inventory = readJson(inventoryPath);
const lanes = readJson(lanesPath);
const manifest = readJson(manifestPath);
const inventoryPlugins = Array.isArray(inventory.plugins) ? inventory.plugins : [];
const laneAssignments = Array.isArray(lanes.assignments) ? lanes.assignments : [];
const pluginById = new Map(inventoryPlugins.map((plugin) => [plugin.id, plugin]));
const laneByPluginId = new Map(laneAssignments.map((assignment) => [assignment.id, assignment]));

const technologies = requestedTechnologies.map((technology) => ({
  ...technology,
  activationPolicy: ACTIVATION_POLICY,
  supportingPluginUris: technology.supportingPlugins
    .map((pluginId) => pluginById.get(pluginId))
    .filter(Boolean)
    .map((plugin) => plugin.uri),
  supportingPluginLanes: technology.supportingPlugins
    .map((pluginId) => laneByPluginId.get(pluginId)?.primaryLane)
    .filter(Boolean)
}));

const entrypoints = [...new Set(technologies.flatMap((technology) => technology.entrypoints))];
const missingEntrypoints = entrypoints.filter((entrypoint) => !fs.existsSync(path.join(ROOT, entrypoint)));
const manifestLanguages = new Set((manifest.languages || []).map((language) => language.language));

const contract = {
  version: 1,
  id: "seis-requested-software-stack",
  generatedAt: inventory.updatedAt || "2026-06-03",
  mode: "source_visible_fullstack_polyglot_governance",
  sourceReferences: {
    submittedPluginInventory: path.relative(ROOT, inventoryPath),
    pluginCapabilityLanes: path.relative(ROOT, lanesPath),
    polyglotManifest: path.relative(ROOT, manifestPath)
  },
  activationPolicy: ACTIVATION_POLICY,
  summary: {
    technologyCount: technologies.length,
    entrypointCount: entrypoints.length,
    uniqueSubmittedPlugins: inventoryPlugins.length,
    capabilityLaneCount: lanes.summary?.laneCount || 0,
    polyglotLanguageSurfaces: manifest.languages?.length || 0,
    missingEntrypoints
  },
  requiredStack: requestedTechnologies.map((technology) => technology.id),
  technologies,
  entrypoints,
  governance: [
    "Keep JavaScript, Node.js, React, Express.js, TypeScript, and MySQL visible as small source surfaces.",
    "Do not install runtime dependencies until a concrete app route or deploy target needs them.",
    "Use plugin lanes as activation guidance, not blanket connector activation.",
    "Keep credentials and live connector tokens out of source control."
  ]
};

const report = {
  version: 1,
  id: "seis-requested-software-stack-report",
  generatedAt: contract.generatedAt,
  sourceId: contract.id,
  sourcePath: path.relative(ROOT, sourcePath),
  summary: contract.summary,
  technologies: contract.technologies.map((technology) => ({
    id: technology.id,
    label: technology.label,
    runtimeRole: technology.runtimeRole,
    primaryLane: technology.primaryLane,
    entrypoints: technology.entrypoints,
    supportingPlugins: technology.supportingPlugins,
    supportingPluginUris: technology.supportingPluginUris
  }))
};

const markdown = createMarkdown(contract);

if (missingEntrypoints.length > 0) {
  console.error("Requested software stack has missing entrypoints:");
  for (const entrypoint of missingEntrypoints) console.error(`- ${entrypoint}`);
  process.exit(1);
}

for (const requiredLanguage of ["JavaScript", "TypeScript", "Node.js", "MySQL", "React", "Express.js"]) {
  if (!manifestLanguages.has(requiredLanguage)) {
    console.error(`Requested software stack is missing manifest language: ${requiredLanguage}`);
    process.exit(1);
  }
}

if (checkMode) {
  const expectedSource = `${JSON.stringify(contract, null, 2)}\n`;
  const expectedReport = `${JSON.stringify(report, null, 2)}\n`;
  const expectedMarkdown = `${markdown}\n`;
  const drift = [];

  if (readText(sourcePath) !== expectedSource) drift.push(path.relative(ROOT, sourcePath));
  if (readText(reportJsonPath) !== expectedReport) drift.push(path.relative(ROOT, reportJsonPath));
  if (readText(reportMarkdownPath) !== expectedMarkdown) drift.push(path.relative(ROOT, reportMarkdownPath));

  if (drift.length > 0) {
    console.error("Requested software stack is stale:");
    for (const file of drift) console.error(`- ${file}`);
    console.error("Run node scripts/create-requested-software-stack.cjs to refresh generated files.");
    process.exit(1);
  }

  console.log("Requested software stack check passed.");
} else {
  fs.writeFileSync(sourcePath, `${JSON.stringify(contract, null, 2)}\n`);
  fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(reportMarkdownPath, `${markdown}\n`);
  console.log(`Requested software stack written: ${path.relative(ROOT, sourcePath)}`);
  console.log(`Requested software stack written: ${path.relative(ROOT, reportJsonPath)}`);
  console.log(`Requested software stack written: ${path.relative(ROOT, reportMarkdownPath)}`);
}

function createMarkdown(contractData) {
  const lines = [
    "# SEIS Requested Software Stack",
    "",
    `- Generated: ${contractData.generatedAt}`,
    `- Mode: ${contractData.mode}`,
    `- Technologies: ${contractData.summary.technologyCount}`,
    `- Entry points: ${contractData.summary.entrypointCount}`,
    `- Unique submitted plugins: ${contractData.summary.uniqueSubmittedPlugins}`,
    `- Capability lanes: ${contractData.summary.capabilityLaneCount}`,
    "",
    "## Stack Map",
    "",
    "| technology | role | primary lane | entrypoints | supporting plugins |",
    "| --- | --- | --- | --- | --- |",
    ...contractData.technologies.map((technology) => [
      technology.label,
      technology.runtimeRole,
      technology.primaryLane,
      technology.entrypoints.join(", "),
      technology.supportingPlugins.join(", ")
    ].map(escapeCell).join(" | ")).map((row) => `| ${row} |`),
    "",
    "## Governance",
    "",
    ...contractData.governance.map((item) => `- ${item}`)
  ];

  return lines.join("\n");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function readText(file) {
  if (!fs.existsSync(file)) return "";
  return fs.readFileSync(file, "utf8");
}

function escapeCell(value) {
  return String(value ?? "").replaceAll("\\", "\\\\").replaceAll("|", "\\|").split(/\r?\n/).join("<br>");
}
