#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { chooseAutoRoute, chooseAutoTool } = require("./ai-routing-policy.cjs");

const ROOT = process.cwd();
const POLICY_PATH = path.join(ROOT, "content", "development", "llm-task-routing-policy.json");
const REGISTRY_PATH = path.join(ROOT, "content", "development", "llm-package-registry.json");
const ADAPTER_PATH = path.join(ROOT, "content", "development", "llm-adapter-readiness.json");
const REPORT_PATH = path.join(ROOT, "reports", "ai-release-manifest.json");
const CLOUD_ENV_PATH = path.join(ROOT, "deploy", "cloud-environment.json");

const failures = [];
const REMOTE_ORCHESTRATOR = "seis-agent";
const REQUIRED_LOCAL_HELPERS = [
  "codex",
  "antigravity",
  "antigravity-ide",
  "cursor",
  "xcode",
  "openai",
  "claude",
  "gemini",
  "qwen",
  "kimi",
  "ollama",
  "opencode",
  "aider",
  "interpreter",
  "hermes",
  "goose",
  "open-design"
];
const REQUIRED_REMOTE_ONLY_KEYWORDS = ["release governance", "security policy", "governance check", "cross-tool orchestration"];
const EXPECTED_ORCHESTRATOR_SCOPE = ["policy", "release-governance", "tool-orchestration", "lane-routing"];
const EXPECTED_ORCHESTRATOR_CAPABILITIES = ["orchestrate", "policy", "route", "manifest-check"];

const policy = readJson(POLICY_PATH);
const registry = readJson(REGISTRY_PATH);
const adapterReadiness = readJson(ADAPTER_PATH);
const report = readJson(REPORT_PATH);
const cloudEnv = readJson(CLOUD_ENV_PATH);

if (!policy) {
  failures.push(`Cannot read policy file: ${path.relative(ROOT, POLICY_PATH)}`);
} else {
  ensure(policy.id, "policy file must define id");
  ensure(policy.default === REMOTE_ORCHESTRATOR, `policy default lane must be ${REMOTE_ORCHESTRATOR}`);

  const executionBoundary = policy.policy?.executionBoundary;
  ensure(executionBoundary, "executionBoundary must be defined under policy");

  if (executionBoundary) {
    ensure(
      executionBoundary.remoteOrchestrator === REMOTE_ORCHESTRATOR,
      `executionBoundary.remoteOrchestrator must be ${REMOTE_ORCHESTRATOR}`
    );

    const localHelpers = normalizeList(executionBoundary.localHelpers);
    const remoteOnly = normalizeList(executionBoundary.remoteOnly);
    ensure(localHelpers.length > 0, "executionBoundary.localHelpers must not be empty");
    ensure(remoteOnly.length > 0, "executionBoundary.remoteOnly must not be empty");

    for (const helper of REQUIRED_LOCAL_HELPERS) {
      ensure(localHelpers.includes(helper), `local helper missing from policy: ${helper}`);
    }

    for (const keyword of REQUIRED_REMOTE_ONLY_KEYWORDS) {
      ensure(remoteOnly.includes(keyword), `remoteOnly missing policy keyword: ${keyword}`);
    }

    ensure(!localHelpers.includes(REMOTE_ORCHESTRATOR), "localHelpers must not include remote orchestrator");
  }

  const routingRules = normalizeRoutingRules(policy.policy?.routingRules);
  ensure(routingRules.length > 0, "routingRules must include at least one rule");

  const routingRemoteRules = routingRules.filter((rule) => rule.primary === REMOTE_ORCHESTRATOR);
  ensure(routingRemoteRules.length >= 1, `routingRules must include at least one intent for ${REMOTE_ORCHESTRATOR}`);

  for (const rule of routingRemoteRules) {
    ensure(
      isGovernanceRouting(rule.keyword),
      `remote rule must target governance keywords: ${rule.keyword}`
    );
  }

  for (const rule of routingRules) {
    if (rule.primary !== REMOTE_ORCHESTRATOR && !REQUIRED_LOCAL_HELPERS.includes(rule.primary)) {
      failures.push(`routing rule uses unexpected executor '${rule.primary}'; expected local helper or ${REMOTE_ORCHESTRATOR}`);
    }
  }

  ensure(chooseAutoTool("policy") === REMOTE_ORCHESTRATOR, `auto routing should map 'policy' to ${REMOTE_ORCHESTRATOR}`);
  ensure(chooseAutoTool("governance") === REMOTE_ORCHESTRATOR, `auto routing should map 'governance' to ${REMOTE_ORCHESTRATOR}`);
  ensure(chooseAutoTool("security policy") === REMOTE_ORCHESTRATOR, `auto routing should map 'security policy' to ${REMOTE_ORCHESTRATOR}`);
  ensure(chooseAutoTool("local") === "ollama", "auto routing should map local intents to ollama");
  ensure(chooseAutoTool("qwen cross-check") === "qwen", "auto routing should map qwen cross-check intents to qwen");
  ensure(chooseAutoTool("opencode terminal coding") === "opencode", "auto routing should map opencode intents to opencode");
  ensure(chooseAutoTool("codex primary execution") === "codex", "auto routing should map codex primary execution intents to codex");
  ensure(chooseAutoTool("antigravity ide workspace") === "antigravity-ide", "auto routing should map Antigravity IDE intents to antigravity-ide");
  ensure(chooseAutoTool("antigravity 2.0 app") === "antigravity", "auto routing should map Antigravity 2.x intents to antigravity");
  ensure(chooseAutoTool("cursor review") === "cursor", "auto routing should map Cursor intents to cursor");
  ensure(chooseAutoTool("xcode swiftui signing") === "xcode", "auto routing should map Xcode intents to xcode");
  ensure(chooseAutoTool("hermes mcp gateway") === "hermes", "auto routing should map hermes gateway intents to hermes");
  ensure(chooseAutoTool("goose general agent") === "goose", "auto routing should map goose agent intents to goose");
  ensure(chooseAutoTool("open design prototype") === "open-design", "auto routing should map Open Design intents to open-design");
  ensure(chooseAutoTool("translate") === "kimi", "auto routing should map translation intents to kimi");
  ensure(chooseAutoTool("research") === "gemini", "auto routing should map research intents to gemini");
  ensure(chooseAutoTool("özet") === "openai", "auto routing should map translation-aware summary intents to openai");
  ensure(chooseAutoRoute("audit token redaction vulnerability exposure").laneId === "seis-security", "SEIS router should map security-sensitive intents to seis-security");
  ensure(chooseAutoRoute("browser research for docs mcp").laneId === "seis-research", "SEIS router should map research intents to seis-research");
  ensure(chooseAutoRoute("idempotent automation workflow dry-run runbook").laneId === "seis-automation", "SEIS router should map automation intents to seis-automation");
  ensure(chooseAutoRoute("product requirements acceptance launch readiness").laneId === "seis-product", "SEIS router should map product intents to seis-product");
}

if (!registry) {
  failures.push(`Cannot read package registry: ${path.relative(ROOT, REGISTRY_PATH)}`);
} else {
  const packages = Array.isArray(registry.packages) ? registry.packages : [];
  ensure(packages.length > 0, "llm package registry must include at least one package");

  const remotePackages = packages.filter((entry) => String(entry.mode || "").toLowerCase() === "remote-orchestrator");
  ensure(remotePackages.length === 1, "exactly one remote-orchestrator package is required");

  const orchestratorPackage = packages.find((entry) => entry.id === REMOTE_ORCHESTRATOR);
  ensure(Boolean(orchestratorPackage), `llm package registry must include ${REMOTE_ORCHESTRATOR}`);

  if (orchestratorPackage) {
    ensure(String(orchestratorPackage.mode || "").toLowerCase() === "remote-orchestrator", `${REMOTE_ORCHESTRATOR} package must be remote-orchestrator`);
    ensure(String(orchestratorPackage.status || "").toLowerCase() === "ready", `${REMOTE_ORCHESTRATOR} package must be ready`);
    ensure(orchestratorPackage.provider === "seis", `${REMOTE_ORCHESTRATOR} provider must be seis`);

    const scope = normalizeList(orchestratorPackage.scope);
    for (const expectedScope of EXPECTED_ORCHESTRATOR_SCOPE) {
      ensure(scope.includes(expectedScope), `${REMOTE_ORCHESTRATOR} package scope must include ${expectedScope}`);
    }
  }

  for (const entry of packages) {
    if (String(entry.mode || "").toLowerCase() === "remote-orchestrator" && entry.id !== REMOTE_ORCHESTRATOR) {
      failures.push(`unexpected remote-orchestrator package: ${entry.id}`);
    }
  }
}

if (!adapterReadiness) {
  failures.push(`Cannot read adapter readiness: ${path.relative(ROOT, ADAPTER_PATH)}`);
} else {
  const adapters = Array.isArray(adapterReadiness.adapters) ? adapterReadiness.adapters : [];
  ensure(adapters.length > 0, "llm adapter readiness must include at least one adapter");

  const remoteAdapters = adapters.filter((entry) => String(entry.mode || "").toLowerCase() === "remote-orchestrator");
  ensure(remoteAdapters.length === 1, "exactly one remote-orchestrator adapter is required");

  const orchestratorAdapter = adapters.find((entry) => entry.id === REMOTE_ORCHESTRATOR);
  ensure(Boolean(orchestratorAdapter), `llm adapter readiness must include ${REMOTE_ORCHESTRATOR}`);

  if (orchestratorAdapter) {
    ensure(String(orchestratorAdapter.mode || "").toLowerCase() === "remote-orchestrator", `${REMOTE_ORCHESTRATOR} adapter must be remote-orchestrator`);
    ensure(String(orchestratorAdapter.status || "").toLowerCase() === "ready", `${REMOTE_ORCHESTRATOR} adapter must be ready`);

    const capabilities = new Set(normalizeList(orchestratorAdapter.capabilities));
    for (const expectedCapability of EXPECTED_ORCHESTRATOR_CAPABILITIES) {
      ensure(capabilities.has(expectedCapability), `${REMOTE_ORCHESTRATOR} adapter must expose ${expectedCapability}`);
    }
  }

  for (const entry of adapters) {
    if (String(entry.mode || "").toLowerCase() === "remote-orchestrator" && entry.id !== REMOTE_ORCHESTRATOR) {
      failures.push(`unexpected remote-orchestrator adapter: ${entry.id}`);
    }
  }
}

if (!report) {
  failures.push(`Cannot read AI release manifest report: ${path.relative(ROOT, REPORT_PATH)}`);
} else {
  const remoteTools = Array.isArray(report.tools)
    ? report.tools.filter((tool) => tool.executionMode === "remote-agent")
    : [];

  ensure(remoteTools.length === 1, "AI release manifest must report exactly one remote-agent tool");
  ensure(remoteTools[0]?.id === REMOTE_ORCHESTRATOR, `AI release manifest remote tool must be ${REMOTE_ORCHESTRATOR}`);

  ensure(
    report.execution?.remoteOrchestrator?.id === REMOTE_ORCHESTRATOR,
    `AI release manifest remote orchestrator must be ${REMOTE_ORCHESTRATOR}`
  );
}

if (!cloudEnv) {
  failures.push(`Cannot read cloud environment: ${path.relative(ROOT, CLOUD_ENV_PATH)}`);
} else {
  const routingSource = cloudEnv.sources?.llmTaskRoutingPolicy || {};
  const systemSource = cloudEnv.sources?.llmSystem || {};
  const adapterSource = cloudEnv.sources?.llmAdapterReadiness || {};

  ensure(routingSource.path === path.relative(ROOT, POLICY_PATH), "cloud source for llmTaskRoutingPolicy is stale");
  ensure(systemSource.path === path.relative(ROOT, REGISTRY_PATH), "cloud source for llmSystem is stale");
  ensure(adapterSource.path === path.relative(ROOT, ADAPTER_PATH), "cloud source for llmAdapterReadiness is stale");

  ensure(routingSource.remoteOrchestrator === REMOTE_ORCHESTRATOR, "cloud routing source remoteOrchestrator must be SEIS Agent");
  if (Array.isArray(routingSource.localHelpers)) {
    const localHelpers = normalizeList(routingSource.localHelpers);
    for (const helper of REQUIRED_LOCAL_HELPERS) {
      ensure(localHelpers.includes(helper), `cloud source localHelpers missing ${helper}`);
    }
  }

  if (systemSource.adapterCount !== undefined) {
    ensure(
      Number(systemSource.adapterCount) >= 5,
      "cloud source should expose at least five llm packages"
    );
  }

  if (adapterSource.adapterCount !== undefined) {
    ensure(
      adapterSource.readyAdapterCount >= 1,
      "cloud source should expose at least one ready llm adapter"
    );
  }
}

if (failures.length > 0) {
  console.error("LLM orchestration policy check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("LLM orchestration policy check passed.");

function ensure(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function normalizeList(value) {
  if (!Array.isArray(value)) return [];

  return Array.from(new Set(
    value
      .map((item) => String(item || "").trim().toLowerCase())
      .filter(Boolean)
  ));
}

function normalizeRoutingRules(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((rule) => ({
      keyword: String(rule.keyword || "").toLowerCase(),
      primary: String(rule.primary || "").toLowerCase()
    }))
    .filter((rule) => rule.keyword && rule.primary);
}

function isGovernanceRouting(keyword) {
  const governanceHints = [
    ...REQUIRED_REMOTE_ONLY_KEYWORDS,
    "policy",
    "governance",
    "karar",
    "release",
    "security"
  ];

  return governanceHints.some((hint) => keyword.includes(hint));
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (_error) {
    return null;
  }
}
