#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const checkMode = process.argv.includes("--check");
const inventoryPath = path.join(ROOT, "content", "development", "requested-plugin-inventory.json");
const sourcePath = path.join(ROOT, "content", "development", "plugin-capability-lanes.json");
const reportJsonPath = path.join(ROOT, "reports", "plugin-capability-lanes.json");
const reportMarkdownPath = path.join(ROOT, "reports", "plugin-capability-lanes.md");

const ACTIVATION_POLICY = "activate_only_when_relevant_authenticated_scoped_and_user_approved";
const COMMON_GATES = [
  "matching_plugin_or_tool_available",
  "account_authentication_present",
  "task_scope_matches_lane",
  "secrets_not_committed",
  "lightweight_validation_passed"
];

const laneDefinitions = [
  {
    id: "builder-and-prototyping",
    label: "Builder and prototyping",
    intent: "Create or iterate app surfaces, prototypes, landing systems, and runnable demos.",
    preferredEvidence: ["local branch", "generated app source", "preview or static route", "scoped validation"],
    qualityCommands: ["npm run check:plugin-capability-lanes", "npm run check:plugin-environment-sources"],
    matchIds: [
      "app-builder",
      "appwrite",
      "base44",
      "build-web-apps",
      "build-web-data-visualization",
      "cwc-makers",
      "expo",
      "fakechat",
      "feature-dev",
      "game-studio",
      "hostinger",
      "lovable",
      "playground",
      "replit",
      "responsive",
      "stardust",
      "wix"
    ]
  },
  {
    id: "creative-production-and-design",
    label: "Creative production and design",
    intent: "Shape UI direction, visual assets, design systems, campaign creative, and media outputs.",
    preferredEvidence: ["design brief", "asset inventory", "accessibility notes", "visual QA"],
    qualityCommands: ["npm run check:motion-evidence", "npm run check:mobile-ergonomics"],
    matchIds: [
      "adobe-for-creativity",
      "biorender",
      "canva",
      "cloudinary",
      "creative-production",
      "fal",
      "figma",
      "frontend-design",
      "heygen",
      "hyperframes",
      "picsart",
      "product-design",
      "remotion",
      "runway-api",
      "shutterstock"
    ]
  },
  {
    id: "finance-investing-and-payments",
    label: "Finance, investing, and payments",
    intent: "Support capital markets research, deal analysis, market data, and payment workflow planning.",
    preferredEvidence: ["source visible memo", "non-advice disclaimer", "account or market data gate", "audit trail"],
    qualityCommands: ["npm run check:plugin-capability-lanes", "npm run check:cloud-environment"],
    matchIds: [
      "alpaca",
      "bigdata-com",
      "binance",
      "brex",
      "daloopa",
      "dow-jones-factiva",
      "investment-banking",
      "keybid-puls",
      "mercadopago",
      "moody-s",
      "mt-newswires",
      "pigment",
      "pitchbook",
      "public-equity-investing",
      "quartr",
      "razorpay",
      "stripe",
      "sumup"
    ]
  },
  {
    id: "sales-gtm-and-market-intelligence",
    label: "Sales, GTM, and market intelligence",
    intent: "Research accounts, enrich prospects, plan outreach, and map revenue motions.",
    preferredEvidence: ["scoped account list", "CRM write gate", "PII minimization", "handoff notes"],
    qualityCommands: ["npm run check:plugin-capability-lanes", "npm run check:connector-activation-report"],
    matchIds: [
      "apollo",
      "apollo-skills",
      "attio",
      "calendly",
      "carta-crm",
      "cb-insights",
      "channel99",
      "clay",
      "clickup",
      "close",
      "common-room",
      "datasite",
      "demandbase",
      "docket",
      "happenstance",
      "help-scout",
      "hg-insights",
      "highlevel",
      "hubspot",
      "hunter",
      "intercom",
      "meticulate",
      "particl-market-research",
      "pylon",
      "rox",
      "sales",
      "streak",
      "zoominfo"
    ]
  },
  {
    id: "analytics-observability-and-growth",
    label: "Analytics, observability, and growth",
    intent: "Measure product behavior, traffic, experiments, reliability, search visibility, and business metrics.",
    preferredEvidence: ["metric definition", "date range", "dashboard/report path", "sampling caveats"],
    qualityCommands: ["npm run check:plugin-capability-lanes", "npm run check:cloud-environment"],
    matchIds: [
      "adobe-analytics",
      "adobe-cja",
      "amplitude",
      "brand24",
      "conductor",
      "coupler-io",
      "cube",
      "data-analytics",
      "datadog",
      "deepnote",
      "domotz-preview",
      "dovetail",
      "marcopolo",
      "mixpanel",
      "mixpanel-headless",
      "omni-analytics",
      "posthog",
      "ranked-ai",
      "semrush",
      "sentry",
      "sentry-cli",
      "similarweb",
      "statsig",
      "thoughtspot",
      "vantage",
      "waldo",
      "windsor-ai"
    ]
  },
  {
    id: "backend-data-and-api",
    label: "Backend, data, and API",
    intent: "Model data, inspect schemas, build API integrations, and maintain backend execution layers.",
    preferredEvidence: ["schema or contract", "migration plan", "API collection", "rollback path"],
    qualityCommands: ["npm run check:plugin-capability-lanes", "npm run check:cloud-environment"],
    matchIds: [
      "airtable",
      "alloydb",
      "apollo-skills",
      "aurora-dsql",
      "cds-mcp",
      "clickhouse",
      "cloud-sql-postgresql",
      "convex",
      "data-agent-kit-starter-pack",
      "datahub-skills",
      "datarobot-agent-skills",
      "databases-on-aws",
      "dataverse",
      "duckdb-skills",
      "firebase",
      "google-bigquery",
      "motherduck",
      "mongodb",
      "neon",
      "neon-postgres",
      "oracle-ai-data-platform-workbench-spark-connectors",
      "pinecone",
      "planetscale",
      "postman",
      "prisma",
      "quicknode",
      "redis-development",
      "snowflake-cortex-code",
      "supabase",
      "temporal",
      "yepcode",
      "zilliz"
    ]
  },
  {
    id: "cloud-devops-and-release",
    label: "Cloud, DevOps, and release",
    intent: "Coordinate deploy targets, CI/CD, hosting, infrastructure, incidents, and release safety.",
    preferredEvidence: ["provider target", "dry run", "CI status", "rollback notes"],
    qualityCommands: ["npm run check:cloud-environment", "npm run check:server-target"],
    matchIds: [
      "aws-agents",
      "aws-amplify",
      "aws-core",
      "aws-dev-toolkit",
      "aws-serverless",
      "azure",
      "buildkite",
      "circleci",
      "cloudflare",
      "deploy-on-aws",
      "fastly-agent-toolkit",
      "github",
      "gitlab",
      "mcp-tunnels",
      "netlify",
      "netlify-skills",
      "pagerduty",
      "railway",
      "render",
      "rootly",
      "teamcity-cli",
      "terraform",
      "vercel"
    ]
  },
  {
    id: "security-quality-and-governance",
    label: "Security, quality, and governance",
    intent: "Review code quality, dependency risk, API security, policy posture, and repository governance.",
    preferredEvidence: ["scan scope", "finding severity", "remediation plan", "non-destructive review"],
    qualityCommands: ["npm run check:plugin-capability-lanes", "npm run check:cloud-environment"],
    matchIds: [
      "42crunch-api-security-testing",
      "aikido",
      "ai-plugins",
      "code-modernization",
      "code-simplifier",
      "coderabbit",
      "codex-security",
      "crowdstrike-falcon-foundry",
      "greptile",
      "nightvision",
      "pr-review-toolkit",
      "qodo-skills",
      "security-guidance",
      "semgrep",
      "sonarqube",
      "sonatype-guide",
      "sourcegraph",
      "zscaler"
    ]
  },
  {
    id: "collaboration-calendar-and-support",
    label: "Collaboration, calendar, and support",
    intent: "Coordinate team work, email, documents, meetings, signatures, support context, and project systems.",
    preferredEvidence: ["workspace scope", "recipient/action gate", "meeting or issue reference", "permission check"],
    qualityCommands: ["npm run check:plugin-capability-lanes", "npm run check:connector-activation-report"],
    matchIds: [
      "asana",
      "atlassian",
      "atlassian-rovo",
      "box",
      "circleback",
      "discord",
      "docusign",
      "documents",
      "egnyte",
      "fireflies",
      "fyxer",
      "gmail",
      "google-calendar",
      "google-drive",
      "granola",
      "imessage",
      "jam",
      "linear",
      "monday-com",
      "notion",
      "otter-ai",
      "outlook-email",
      "presentations",
      "read-ai",
      "readwise",
      "signnow",
      "slack",
      "spreadsheets",
      "zoom",
      "zoom-plugin"
    ]
  },
  {
    id: "platform-native-and-polyglot",
    label: "Platform native and polyglot",
    intent: "Support native apps, SDK-specific implementation, maps, messaging, language conversion, and platform APIs.",
    preferredEvidence: ["target runtime", "SDK version", "simulator or platform check", "language surface"],
    qualityCommands: ["npm run check:software-languages", "npm run check:plugin-capability-lanes"],
    matchIds: [
      "amazon-location-service",
      "azure-sdk-dotnet",
      "azure-sdk-java",
      "azure-sdk-python",
      "azure-sdk-rust",
      "azure-sdk-typescript",
      "build-ios-apps",
      "build-macos-apps",
      "expo",
      "laravel-boost",
      "liquid-lsp",
      "liquid-skills",
      "mapbox",
      "qt-development-skills",
      "test-android-apps",
      "twilio-developer-kit",
      "ui5",
      "ui5-typescript-conversion",
      "workos",
      "zoom-plugin"
    ]
  },
  {
    id: "specialized-domain-and-research",
    label: "Specialized domain and research",
    intent: "Route domain-heavy work through science, policy, geospatial, AI/ML, legal, and research-specific constraints.",
    preferredEvidence: ["domain source", "citation path", "safety note", "expert review gate"],
    qualityCommands: ["npm run check:plugin-capability-lanes", "npm run check:cloud-environment"],
    matchIds: [
      "aem-6-5-lts",
      "aem-cloud-service",
      "aem-edge-delivery-services",
      "adobe-cja",
      "adobe-analytics",
      "adobe-for-creativity",
      "atlantis",
      "govtribe",
      "hugging-face",
      "huggingface-skills",
      "latex",
      "legalzoom",
      "life-science-research",
      "math-olympiad",
      "microsoft-docs",
      "nvidia-skills",
      "policynote",
      "sagemaker-ai",
      "skywatch",
      "togetherai-skills",
      "zotero"
    ]
  },
  {
    id: "ai-workflow-docs-and-knowledge",
    label: "AI workflow, docs, and knowledge",
    intent: "Manage assistant workflows, knowledge bases, docs, browser/document tools, plugin creation, and MCP systems.",
    preferredEvidence: ["local instruction file", "generated artifact", "source citation", "approval boundary"],
    qualityCommands: ["npm run check:plugin-capability-lanes", "npm run check:workspace"],
    matchIds: [
      "agent-sdk-dev",
      "agentforce-adlc",
      "atomic-agents",
      "browser",
      "chrome",
      "claude-code-setup",
      "claude-md-management",
      "codex",
      "context7",
      "deep-wiki",
      "explanatory-output-style",
      "learning-output-style",
      "mcp-apps",
      "mcp-server-dev",
      "mem",
      "microsoft-docs",
      "openai-developers",
      "outputai",
      "plugin-dev",
      "plugin-eval",
      "remember",
      "skill-creator",
      "superpowers"
    ]
  }
];

const inventory = readJson(inventoryPath);
const plugins = Array.isArray(inventory.plugins) ? inventory.plugins : [];
const assignments = plugins.map(assignPlugin);
const laneSummaries = laneDefinitions.map((lane) => {
  const laneAssignments = assignments.filter((assignment) => assignment.primaryLane === lane.id);
  return {
    id: lane.id,
    label: lane.label,
    intent: lane.intent,
    activationPolicy: ACTIVATION_POLICY,
    qualityCommands: lane.qualityCommands,
    preferredEvidence: lane.preferredEvidence,
    pluginCount: laneAssignments.length,
    plugins: laneAssignments.map((assignment) => assignment.id)
  };
});

const sourceCounts = countBy(plugins, (plugin) => plugin.source);
const laneCounts = Object.fromEntries(laneSummaries.map((lane) => [lane.id, lane.pluginCount]));
const remotePlugins = assignments.filter((assignment) => assignment.source === "openai-curated-remote");

const contract = {
  version: 1,
  id: "seis-plugin-capability-lanes",
  generatedAt: inventory.updatedAt || "2026-06-03",
  source: {
    inventoryPath: path.relative(ROOT, inventoryPath),
    inventoryId: inventory.id,
    totalLinks: inventory.summary?.totalLinks || plugins.length,
    uniquePlugins: plugins.length
  },
  policy: {
    mode: "source_visible_activation_lanes",
    activationPolicy: ACTIVATION_POLICY,
    gates: COMMON_GATES,
    liveConnectorRule: "do_not_activate_blanket_connectors; use only the lane that directly supports the active task"
  },
  summary: {
    laneCount: laneDefinitions.length,
    totalAssignments: assignments.length,
    uniquePlugins: plugins.length,
    submittedPluginSources: sourceCounts,
    laneCounts,
    remotePluginCount: remotePlugins.length
  },
  laneDefinitions: laneDefinitions.map(stripMatchers),
  laneSummaries,
  remotePlugins: remotePlugins.map((assignment) => ({
    id: assignment.id,
    uri: assignment.uri,
    primaryLane: assignment.primaryLane,
    matchedLanes: assignment.matchedLanes
  })),
  assignments
};

const report = {
  version: 1,
  id: "seis-plugin-capability-lanes-report",
  generatedAt: contract.generatedAt,
  sourceId: contract.id,
  sourcePath: path.relative(ROOT, sourcePath),
  inventoryPath: path.relative(ROOT, inventoryPath),
  summary: contract.summary,
  lanes: contract.laneSummaries.map((lane) => ({
    id: lane.id,
    label: lane.label,
    pluginCount: lane.pluginCount,
    intent: lane.intent,
    qualityCommands: lane.qualityCommands,
    plugins: lane.plugins
  })),
  assignments: contract.assignments
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
    console.error("Plugin capability lanes are stale:");
    for (const file of drift) console.error(`- ${file}`);
    console.error("Run node scripts/create-plugin-capability-lanes.cjs to refresh generated files.");
    process.exit(1);
  }

  console.log("Plugin capability lanes check passed.");
} else {
  fs.mkdirSync(path.dirname(sourcePath), { recursive: true });
  fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
  fs.writeFileSync(sourcePath, `${JSON.stringify(contract, null, 2)}\n`);
  fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(reportMarkdownPath, `${markdown}\n`);
  console.log(`Plugin capability lanes written: ${path.relative(ROOT, sourcePath)}`);
  console.log(`Plugin capability lanes written: ${path.relative(ROOT, reportJsonPath)}`);
  console.log(`Plugin capability lanes written: ${path.relative(ROOT, reportMarkdownPath)}`);
}

function assignPlugin(plugin) {
  const matchedLanes = laneDefinitions
    .filter((lane) => matchesLane(plugin, lane))
    .map((lane) => lane.id);
  const primaryLane = matchedLanes[0] || "ai-workflow-docs-and-knowledge";

  return {
    order: plugin.order,
    id: plugin.id,
    label: plugin.label,
    source: plugin.source,
    uri: plugin.uri,
    status: plugin.status,
    primaryLane,
    matchedLanes: matchedLanes.length > 0 ? matchedLanes : [primaryLane],
    activationPolicy: plugin.activationPolicy || ACTIVATION_POLICY,
    blockedWithout: COMMON_GATES
  };
}

function matchesLane(plugin, lane) {
  const id = String(plugin.id || "").toLowerCase();
  const label = String(plugin.label || "").toLowerCase();
  const uri = String(plugin.uri || "").toLowerCase();
  const text = `${id} ${label} ${uri}`;

  return lane.matchIds.some((candidate) => {
    const match = candidate.toLowerCase();
    return id === match || label === match || uri.includes(`plugin://${match}@`) || text.includes(`/${match}`);
  });
}

function createMarkdown(contractData) {
  const lines = [
    "# SEIS Plugin Capability Lanes",
    "",
    `- Generated: ${contractData.generatedAt}`,
    `- Inventory: ${contractData.source.inventoryPath}`,
    `- Unique plugins: ${contractData.summary.uniquePlugins}`,
    `- Submitted links: ${contractData.source.totalLinks}`,
    `- Activation policy: ${contractData.policy.activationPolicy}`,
    "",
    "## Lane Summary",
    "",
    "| lane | plugins | intent | quality commands |",
    "| --- | ---: | --- | --- |",
    ...contractData.laneSummaries.map((lane) => [
      lane.label,
      lane.pluginCount,
      lane.intent,
      lane.qualityCommands.join(", ")
    ].map(escapeCell).join(" | ")).map((row) => `| ${row} |`),
    "",
    "## Remote Source Plugins",
    "",
    "| plugin | primary lane | matched lanes | uri |",
    "| --- | --- | --- | --- |",
    ...contractData.remotePlugins.map((plugin) => [
      plugin.id,
      plugin.primaryLane,
      plugin.matchedLanes.join(", "),
      plugin.uri
    ].map(escapeCell).join(" | ")).map((row) => `| ${row} |`),
    "",
    "## Full Assignment",
    ""
  ];

  for (const lane of contractData.laneSummaries) {
    const assignments = contractData.assignments.filter((assignment) => assignment.primaryLane === lane.id);
    lines.push(`### ${lane.label}`);
    lines.push("");
    lines.push("| # | plugin | source | matched lanes | uri |");
    lines.push("| ---: | --- | --- | --- | --- |");

    for (const assignment of assignments) {
      lines.push(`| ${[
        assignment.order,
        assignment.id,
        assignment.source,
        assignment.matchedLanes.join(", "),
        assignment.uri
      ].map(escapeCell).join(" | ")} |`);
    }

    if (assignments.length === 0) lines.push("| 0 | none | none | none | none |");
    lines.push("");
  }

  lines.push("## Governance Notes");
  lines.push("");
  lines.push("- Every submitted plugin URI is visible in the inventory and mapped to a primary capability lane.");
  lines.push("- Lane assignment is source governance, not blanket connector activation.");
  lines.push("- Live use still requires the matching tool/plugin, authentication, scoped task intent, and low-power validation.");

  return lines.join("\n");
}

function stripMatchers(lane) {
  return {
    id: lane.id,
    label: lane.label,
    intent: lane.intent,
    activationPolicy: ACTIVATION_POLICY,
    gates: COMMON_GATES,
    preferredEvidence: lane.preferredEvidence,
    qualityCommands: lane.qualityCommands
  };
}

function countBy(items, keySelector) {
  return items.reduce((counts, item) => {
    const key = keySelector(item) || "unknown";
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
