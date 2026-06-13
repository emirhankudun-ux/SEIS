#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = process.cwd();
const checkMode = process.argv.includes("--check");
const manifestPath = path.join(ROOT, "content", "development", "ai-release-manifest.json");
const reportJsonPath = path.join(ROOT, "reports", "ai-release-manifest.json");
const reportMarkdownPath = path.join(ROOT, "reports", "ai-release-manifest.md");

const manifestPolicy = "activate_only_when_relevant_authenticated_scoped_and_user_approved";
const remoteOrchestratorId = "seis-agent";

const routingIntents = [
  "codex primary execution",
  "quick repo patch",
  "browser research for docs",
  "local offline llama draft",
  "csv log analysis",
  "qwen cross-check",
  "opencode terminal coding",
  "hermes mcp gateway",
  "goose general agent",
  "open design prototype",
  "ux copy narrative pass",
  "translate this interface to turkish",
  "release governance checklist",
  "production reasoning and policy check",
  "local analysis request"
];

function commandExists(command) {
  const result = spawnSync("bash", [ "-lc", `command -v ${command}` ], { encoding: "utf8" });
  return {
    installed: result.status === 0,
    path: result.status === 0 ? (result.stdout || "").trim() : ""
  };
}

function openDesignAppPath() {
  const homeCandidate = path.join(process.env.HOME || "", "Applications", "Open Design.app");
  if (homeCandidate && fs.existsSync(homeCandidate)) return homeCandidate;
  return "/Applications/Open Design.app";
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
}

function ollamaModels() {
  const result = spawnSync("bash", [ "-lc", "ollama list" ], { encoding: "utf8" });
  if (result.status !== 0) {
    return [];
  }

  return (result.stdout || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(1) // skip header
    .map((line) => {
      const [name, id, sizeRaw] = line.split(/\s+/);
      const size = normalizeSize(sizeRaw);
      return {
        id: name || "unknown",
        name: name || id || "unknown model",
        provider: "ollama",
        runtime: "local",
        storage: size,
        route: "local-offline",
        availability: "installed"
      };
    });
}

function normalizeSize(value) {
  if (!value) return "unknown";
  const match = String(value).match(/([0-9.]+)([kmg]i?B)?/i);
  if (!match) return value;
  return value;
}

function chooseRoute(tool) {
  const routing = {
    codex: "release governance checklist",
    claude: "ux copy narrative pass",
    gemini: "browser research for docs",
    openai: "local analysis request",
    qwen: "qwen cross-check",
    kimi: "translate this interface to turkish",
    opencode: "opencode terminal coding",
    hermes: "hermes mcp gateway",
    goose: "goose general agent",
    "open-design": "open design prototype",
    aider: "quick repo patch",
    interpreter: "csv log analysis",
    ollama: "local offline llama draft",
    "seis-agent": "release governance checklist"
  };

  const inverse = Object.entries(routing).find(([candidate]) => candidate === tool);
  return inverse ? inverse[0] : "seis-agent";
}

function buildToolMatrix() {
  const tools = [
    { id: "codex", label: "Codex", commandId: "codex", gate: "primary repo execution", routingIntent: "codex primary execution" },
    { id: "openai", label: "OpenAI", commandId: "openai", gate: "production reasoning", routingIntent: "local analysis request", optional: true },
    { id: "claude", label: "Claude", commandId: "claude", gate: "strategy+copy", routingIntent: "ux copy narrative pass" },
    { id: "gemini", label: "Gemini", commandId: "gemini", gate: "research", routingIntent: "browser research for docs" },
    { id: "qwen", label: "Qwen", commandId: "qwen", gate: "alternative reasoning", routingIntent: "qwen cross-check", optional: true },
    { id: "kimi", label: "Kimi", commandId: "kimi", gate: "translation+multilingual", routingIntent: "translate this interface to turkish", optional: true },
    { id: "opencode", label: "OpenCode", commandId: "opencode", gate: "terminal coding", routingIntent: "opencode terminal coding", optional: true },
    { id: "aider", label: "Aider", commandId: "aider", gate: "small patch editing", routingIntent: "quick repo patch", optional: true },
    { id: "interpreter", label: "Interpreter", commandId: "interpreter", gate: "dataset+trace", routingIntent: "csv log analysis", optional: true },
    { id: "ollama", label: "Ollama", commandId: "ollama", gate: "local/offline", routingIntent: "local offline llama draft", optional: true },
    { id: "hermes", label: "Hermes Agent", commandId: "hermes", gate: "agent gateway+mcp", routingIntent: "hermes mcp gateway", optional: true },
    { id: "goose", label: "Goose", commandId: "goose", gate: "general automation agent", routingIntent: "goose general agent", optional: true },
    { id: "open-design", label: "Open Design", commandId: "open", appPath: openDesignAppPath(), gate: "agent-native design", routingIntent: "open design prototype", optional: true }
  ];

  return tools.map((tool) => {
    const command = commandExists(tool.commandId);
    const appInstalled = tool.appPath ? fs.existsSync(tool.appPath) : true;
    const installed = command.installed && appInstalled;
    const routingMatch = routingIntents.includes(tool.routingIntent) ? tool.id : chooseRoute(tool.id);

    return {
      id: tool.id,
      label: tool.label,
      commandPath: tool.appPath || command.path || null,
      launcherCommandPath: tool.appPath ? command.path || null : null,
      installed,
      gate: tool.gate,
      routingIntent: tool.routingIntent,
      executionMode: "local-helper",
      expectedAutoTool: tool.id,
      routingCoverage: routingMatch === tool.id,
      status: installed ? "installed" : (tool.optional ? "missing-optional" : "missing-required")
    };
  });
}

function remoteController() {
  return {
    id: remoteOrchestratorId,
    label: "SEIS Agent",
    commandPath: null,
    installed: true,
    gate: "orchestration",
    routingIntent: "release governance checklist",
    executionMode: "remote-agent",
    role: "system_orchestrator",
    expectedAutoTool: remoteOrchestratorId,
    routingCoverage: true,
    status: "ready"
  };
}

const fallbackRouting = [
  { intent: "codex primary execution", selectedTool: "codex" },
  { intent: "quick repo patch", selectedTool: "aider" },
  { intent: "browser research for docs", selectedTool: "gemini" },
  { intent: "local offline llama draft", selectedTool: "ollama" },
  { intent: "csv log analysis", selectedTool: "interpreter" },
  { intent: "qwen cross-check", selectedTool: "qwen" },
  { intent: "opencode terminal coding", selectedTool: "opencode" },
  { intent: "hermes mcp gateway", selectedTool: "hermes" },
  { intent: "goose general agent", selectedTool: "goose" },
  { intent: "open design prototype", selectedTool: "open-design" },
  { intent: "ux copy narrative pass", selectedTool: "claude" },
  { intent: "translate this interface to turkish", selectedTool: "kimi" },
  { intent: "local analysis request", selectedTool: "openai" },
  { intent: "production reasoning and policy check", selectedTool: "seis-agent" },
  { intent: "release governance checklist", selectedTool: "seis-agent" }
];

const helperTools = buildToolMatrix();
const aiTools = [...helperTools, remoteController()];
const localModels = ollamaModels();
const releasePackages = [
  {
    id: "seis-large-language-core",
    label: "Büyük Dil Sürümü · Core",
    scope: "SEIS Core",
    provider: "Hybrid (local helpers + SEIS Agent)",
    modelCount: Math.max(1, localModels.length),
    activeLayers: [ "repo", "governance", "release" ],
    deployment: localModels.length > 0 ? "local-first" : "API-first",
    status: localModels.length > 0 ? "ready" : "planned"
  },
  {
    id: "seis-large-language-plus",
    label: "Büyük Dil Sürümü · Plus",
    scope: "Experimentation",
    provider: "Provider-assisted",
    modelCount: Math.max(2, localModels.length + 1),
    activeLayers: [ "analysis", "marketplace", "docs", "translation" ],
    deployment: localModels.length > 0 ? "hybrid" : "gated",
    status: "requires-provider-keys"
  }
];

const environmentPresence = {
  hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
  hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
  hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  hasOllamaHost: Boolean(process.env.OLLAMA_HOST)
};

const existingManifest = checkMode ? null : readJson(manifestPath);
const manifestGeneratedAt = checkMode
  ? (readJson(manifestPath)?.generatedAt || "2026-06-09")
  : (existingManifest?.generatedAt || new Date().toISOString());

const manifest = {
  version: 1,
  id: "seis-ai-release-manifest",
  generatedAt: manifestGeneratedAt,
  mode: "large-language-productivity-surface",
  releaseProfile: {
    id: "seis-large-language-release",
    version: "v12-seed",
    label: "Büyük Dil Sürümü",
    objective: "Keep local intelligence and external model tooling discoverable before runtime activation."
  },
  activationPolicy: manifestPolicy,
  environment: {
    source: "scripts/create-ai-release-manifest.cjs",
    sourceReferences: {
      aiRoutingPolicy: "scripts/ai-routing-policy.cjs",
      aiLauncher: "scripts/ai-launcher.cjs"
    },
    credentialsPresent: environmentPresence
  },
  tools: aiTools,
  packages: releasePackages,
  localModels,
  routing: fallbackRouting,
  execution: {
    remoteOrchestrator: {
      id: remoteOrchestratorId,
      mode: "remote-only-gatekeeper",
      role: "AI task orchestration and policy dispatch"
    },
    helperModes: [
      { mode: "local-helper", tools: helperTools.map((tool) => tool.id) }
    ]
  },
  summary: {
    toolCount: aiTools.length,
    helperToolCount: helperTools.length,
    remoteOrchestratorCount: 1,
    installedTools: aiTools.filter((tool) => tool.installed).length,
    missingRequiredTools: aiTools.filter((tool) => !tool.installed && !tool.status.startsWith("missing-optional")).length,
    localModelCount: localModels.length,
    releasePackageCount: releasePackages.length,
    routeCount: fallbackRouting.length
  },
  notes: [
    "Ollama local model discovery is optional and depends on local daemon availability.",
    "Provider tools are treated as local helper candidates and are gated by credentials and user approval.",
    "Remote runtime is only SEIS Agent. Local helpers never bypass remote policy control."
  ]
};

const report = {
  version: 1,
  id: "seis-ai-release-manifest-report",
  generatedAt: manifest.generatedAt,
  sourceId: manifest.id,
  summary: manifest.summary,
  releaseProfile: manifest.releaseProfile,
  tools: manifest.tools.map((tool) => ({
    id: tool.id,
    label: tool.label,
    installed: tool.installed,
    status: tool.status,
    executionMode: tool.executionMode || "local-helper"
  })),
  execution: manifest.execution,
  packages: manifest.packages,
  localModels,
  routing: manifest.routing
};

const markdown = [
  "# SEIS AI Release Manifest",
  "",
  `- Generated: ${manifest.generatedAt}`,
  `- Source: ${path.relative(ROOT, manifestPath)}`,
  `- Profile: ${manifest.releaseProfile.label} (${manifest.releaseProfile.version})`,
  `- Installed tools: ${manifest.summary.installedTools} / ${manifest.summary.toolCount}`,
  `- Missing required tools: ${manifest.summary.missingRequiredTools}`,
  `- Local model count: ${manifest.summary.localModelCount}`,
  `- Remote orchestrator: ${manifest.execution.remoteOrchestrator.id}`,
  `- Execution mode: ${manifest.execution.remoteOrchestrator.mode}`,
  "",
  "## AI Tools",
  "",
  "| id | label | installed | executionMode | status | route |",
  "| --- | --- | --- | --- | --- | --- |",
  ...manifest.tools.map((tool) => `| ${tool.id} | ${tool.label} | ${tool.installed ? "yes" : "no"} | ${tool.executionMode || "local-helper"} | ${tool.status} | ${tool.routingIntent} |`),
  "",
  "## Release Packages",
  "",
  "| id | label | scope | deployment | status |",
  "| --- | --- | --- | --- | --- |",
  ...manifest.packages.map((pkg) => `| ${pkg.id} | ${pkg.label} | ${pkg.scope} | ${pkg.deployment} | ${pkg.status} |`),
  "",
  "## Local models from Ollama",
  "",
  localModels.length === 0
    ? "- Not detected at the moment."
    : localModels.map((model) => `- ${model.name} (${model.storage})`).join("\n"),
  "",
  "## Routing",
  "",
  ...fallbackRouting.map((route) => `- ${route.intent} → ${route.selectedTool}`)
].join("\n");

fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });

if (checkMode) {
  const expectedJson = `${JSON.stringify(manifest, null, 2)}\n`;
  const expectedReportJson = `${JSON.stringify(report, null, 2)}\n`;
  const expectedMarkdown = `${markdown}\n`;
  const drift = [];

  if (!fs.existsSync(manifestPath) || fs.readFileSync(manifestPath, "utf8") !== expectedJson) {
    drift.push(path.relative(ROOT, manifestPath));
  }
  if (!fs.existsSync(reportJsonPath) || fs.readFileSync(reportJsonPath, "utf8") !== expectedReportJson) {
    drift.push(path.relative(ROOT, reportJsonPath));
  }
  if (!fs.existsSync(reportMarkdownPath) || fs.readFileSync(reportMarkdownPath, "utf8") !== expectedMarkdown) {
    drift.push(path.relative(ROOT, reportMarkdownPath));
  }

  if (drift.length > 0) {
    console.error("AI release manifest is stale:");
    for (const file of drift) {
      console.error(`- ${file}`);
    }
    console.error("Run node scripts/create-ai-release-manifest.cjs to refresh generated files.");
    process.exit(1);
  }

  console.log("AI release manifest check passed.");
} else {
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(reportMarkdownPath, `${markdown}\n`);
  console.log(`AI release manifest written: ${path.relative(ROOT, manifestPath)}`);
  console.log(`AI release manifest report written: ${path.relative(ROOT, reportJsonPath)}`);
  console.log(`AI release manifest markdown written: ${path.relative(ROOT, reportMarkdownPath)}`);
}
