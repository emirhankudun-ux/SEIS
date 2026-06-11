#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = process.cwd();
const checkMode = process.argv.includes("--check");
const environmentPath = path.join(ROOT, "deploy", "cloud-environment.json");
const inventoryPath = path.join(ROOT, "content", "development", "requested-plugin-inventory.json");
const reportPath = path.join(ROOT, "reports", "requested-plugin-trace.json");
const capabilityLanesPath = path.join(ROOT, "content", "development", "plugin-capability-lanes.json");
const capabilityLanesReportPath = path.join(ROOT, "reports", "plugin-capability-lanes.json");
const downloadReadinessPath = path.join(ROOT, "content", "development", "plugin-download-readiness.json");
const downloadReadinessReportPath = path.join(ROOT, "reports", "plugin-download-readiness.json");
const requestedSoftwareStackPath = path.join(ROOT, "content", "development", "requested-software-stack.json");
const requestedSoftwareStackReportPath = path.join(ROOT, "reports", "requested-software-stack.json");
const fullstackLanguageMatrixPath = path.join(ROOT, "content", "development", "fullstack-language-matrix.json");
const fullstackLanguageMatrixReportPath = path.join(ROOT, "reports", "fullstack-language-matrix.json");
const llmPackageRegistryPath = path.join(ROOT, "content", "development", "llm-package-registry.json");
const llmTaskRoutingPolicyPath = path.join(ROOT, "content", "development", "llm-task-routing-policy.json");
const llmAdapterReadinessPath = path.join(ROOT, "content", "development", "llm-adapter-readiness.json");
const llmRequestBlueprintsPath = path.join(ROOT, "content", "development", "llm-request-blueprints.json");
const llmPlannerPath = path.join(ROOT, "packages", "ai-language", "src", "llm-task-planner.mjs");
const llmBridgePath = path.join(ROOT, "data", "seis-repos-llm-bridge-2026-06-08.json");
const localAiToolReadinessPath = path.join(ROOT, "reports", "local-ai-tool-readiness.json");
const thirdPartyAiToolInventoryPath = path.join(ROOT, "reports", "third-party-ai-tool-inventory.json");
const thirdPartyAdaptationPlanPath = path.join(ROOT, "content", "development", "third-party-adaptation-plan.json");
const toolchainRuntimeReadinessPath = path.join(ROOT, "content", "development", "toolchain-runtime-readiness.json");
const desktopAppIntegrationPath = path.join(ROOT, "content", "development", "desktop-app-integration.json");
const thirdPartySourceRoot = process.env.SEIS_THIRD_PARTY_SOURCE_ROOT || path.join(ROOT, "..", "3.taraf kodlar");
const THIRD_PARTY_AI_HELPERS = [
  { id: "claude-code", label: "Claude Code", aliases: ["claude-code"], markerHints: [".claude", ".claude-plugin", ".git"] },
  { id: "gemini-cli", label: "Gemini CLI", aliases: ["gemini-cli"], markerHints: [".gemini", ".github", "packages"] },
  { id: "antigravity", label: "Antigravity IDE", aliases: ["antigravity"], markerHints: ["Contents", "Configuration", "Plugins"] },
  { id: "deepseek-coder", label: "DeepSeek Coder", aliases: ["DeepSeek-Coder", "deepseek-coder"], markerHints: [".github", "finetune", "Evaluation"] },
  { id: "awesome-deepseek-agent", label: "Awesome DeepSeek Agent", aliases: ["awesome-deepseek-agent", "deepseek"], markerHints: [".github", "docs", "README.md"] }
];
const LOCAL_AI_HELPERS = [
  { id: "openai", label: "OpenAI", command: "openai", credentialEnv: "OPENAI_API_KEY" },
  { id: "claude", label: "Claude", command: "claude", credentialEnv: "ANTHROPIC_API_KEY" },
  { id: "gemini", label: "Gemini", command: "gemini", credentialEnv: "GEMINI_API_KEY" },
  { id: "qwen", label: "Qwen", command: "qwen" },
  { id: "kimi", label: "Kimi", command: "kimi", offlineFallback: true },
  { id: "ollama", label: "Ollama", command: "ollama", offlineFallback: true, runtimeCheck: checkOllamaHealth },
  { id: "opencode", label: "OpenCode", command: "opencode" },
  { id: "aider", label: "Aider", command: "aider" },
  { id: "interpreter", label: "Interpreter", command: "interpreter" }
];

const environment = readJson(environmentPath);
const inventory = readJson(inventoryPath);
const plugins = Array.isArray(inventory.plugins) ? inventory.plugins : [];
const sourceCounts = plugins.reduce((counts, plugin) => {
  counts[plugin.source] = (counts[plugin.source] || 0) + 1;
  return counts;
}, {});

const submittedPluginInventory = {
  id: inventory.id,
  path: path.relative(ROOT, inventoryPath),
  reportPath: path.relative(ROOT, reportPath),
  updatedAt: inventory.updatedAt,
  totalLinks: inventory.summary?.totalLinks || plugins.length,
  uniquePlugins: plugins.length,
  sourceCounts,
  activationPolicy: "activate_only_when_relevant_authenticated_scoped_and_user_approved",
  plugins: plugins.map((plugin) => ({
    order: plugin.order,
    id: plugin.id,
    label: plugin.label,
    source: plugin.source,
    uri: plugin.uri,
    status: plugin.status
  }))
};

const submittedPluginCapabilityLanes = fs.existsSync(capabilityLanesPath)
  ? createCapabilityLaneSource(readJson(capabilityLanesPath))
  : null;
const pluginDownloadReadiness = fs.existsSync(downloadReadinessPath)
  ? createDownloadReadinessSource(readJson(downloadReadinessPath))
  : null;
const requestedSoftwareStack = fs.existsSync(requestedSoftwareStackPath)
  ? createRequestedSoftwareStackSource(readJson(requestedSoftwareStackPath))
  : null;
const fullstackLanguageMatrix = fs.existsSync(fullstackLanguageMatrixPath)
  ? createFullstackLanguageMatrixSource(readJson(fullstackLanguageMatrixPath))
  : null;
const llmPackageRegistry = fs.existsSync(llmPackageRegistryPath)
  ? createLlmPackageRegistrySource(readJson(llmPackageRegistryPath))
  : null;
const llmTaskRoutingPolicy = fs.existsSync(llmTaskRoutingPolicyPath)
  ? createLlmTaskRoutingPolicySource(readJson(llmTaskRoutingPolicyPath))
  : null;
const llmAdapterReadiness = fs.existsSync(llmAdapterReadinessPath)
  ? createLlmAdapterReadinessSource(readJson(llmAdapterReadinessPath))
  : null;
const llmRequestBlueprints = fs.existsSync(llmRequestBlueprintsPath)
  ? createLlmRequestBlueprintSource(readJson(llmRequestBlueprintsPath))
  : null;
const llmBridge = fs.existsSync(llmBridgePath) ? createLlmBridgeSource(readJson(llmBridgePath)) : null;
const localAiToolReadiness = createLocalAiToolReadinessSource(environment?.sources?.localAiToolReadiness);
const thirdPartyAiToolInventory = createThirdPartyAiToolInventorySource(environment?.sources?.thirdPartyAiToolInventory);
const thirdPartyAdaptationPlan = fs.existsSync(thirdPartyAdaptationPlanPath)
  ? createThirdPartyAdaptationPlanSource(readJson(thirdPartyAdaptationPlanPath))
  : null;
const toolchainRuntimeReadiness = fs.existsSync(toolchainRuntimeReadinessPath)
  ? createToolchainRuntimeReadinessSource(readJson(toolchainRuntimeReadinessPath))
  : null;
const desktopAppIntegration = fs.existsSync(desktopAppIntegrationPath)
  ? createDesktopAppIntegrationSource(readJson(desktopAppIntegrationPath))
  : null;

const expected = withSubmittedPluginSources(
  environment,
  submittedPluginInventory,
  submittedPluginCapabilityLanes,
  pluginDownloadReadiness,
  requestedSoftwareStack,
  fullstackLanguageMatrix,
  llmPackageRegistry,
  llmTaskRoutingPolicy,
  llmAdapterReadiness,
  llmRequestBlueprints,
  llmBridge,
  localAiToolReadiness,
  thirdPartyAiToolInventory,
  thirdPartyAdaptationPlan,
  toolchainRuntimeReadiness,
  desktopAppIntegration
);
const expectedText = `${JSON.stringify(expected, null, 2)}\n`;

if (checkMode) {
  const currentText = fs.readFileSync(environmentPath, "utf8");
  if (currentText !== expectedText) {
    console.error("Plugin environment sources are stale.");
    console.error("Run node scripts/sync-plugin-environment-sources.cjs to refresh deploy/cloud-environment.json.");
    process.exit(1);
  }

  console.log("Plugin environment sources check passed.");
} else {
  fs.writeFileSync(environmentPath, expectedText);
  fs.mkdirSync(path.dirname(localAiToolReadinessPath), { recursive: true });
  fs.writeFileSync(localAiToolReadinessPath, `${JSON.stringify(localAiToolReadiness, null, 2)}\n`);
  fs.writeFileSync(thirdPartyAiToolInventoryPath, `${JSON.stringify(thirdPartyAiToolInventory, null, 2)}\n`);
  console.log("Plugin environment sources synced: deploy/cloud-environment.json");
  console.log(`Local AI readiness report written: ${path.relative(ROOT, localAiToolReadinessPath)}`);
  console.log(`Third-party AI inventory written: ${path.relative(ROOT, thirdPartyAiToolInventoryPath)}`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function checkOllamaHealth() {
  const result = spawnSync("bash", ["-lc", "ollama list"], { encoding: "utf8" });
  return result.status === 0;
}

function commandExists(command) {
  const result = spawnSync("bash", ["-lc", `command -v ${command}`], { encoding: "utf8" });
  return {
    installed: result.status === 0,
    path: result.status === 0 ? (result.stdout || "").trim() : null
  };
}

function formatLocalAiToolState(tool) {
  const commandState = commandExists(tool.command);
  const hasCredential = !tool.credentialEnv || Boolean(process.env[tool.credentialEnv]);
  const runtimeOk = !tool.runtimeCheck ? true : Boolean(tool.runtimeCheck());
  let status = "ready";
  const issues = [];

  if (!commandState.installed) {
    status = "missing-command";
    issues.push("command-not-found");
  } else if (!hasCredential) {
    status = "missing-credential";
    issues.push(`missing-${tool.credentialEnv}`);
  } else if (!runtimeOk) {
    status = "runtime-not-ready";
    issues.push("runtime-check-failed");
  }

  return {
    id: tool.id,
    label: tool.label,
    command: tool.command,
    commandPath: commandState.path,
    installed: commandState.installed,
    credentialState: tool.credentialEnv ? {
      env: tool.credentialEnv,
      present: hasCredential
    } : null,
    runtimeOk,
    offlineFallbackCapable: Boolean(tool.offlineFallback),
    status,
    issueCodes: issues
  };
}

function createLocalAiToolReadinessSource(existingSource) {
  const tools = LOCAL_AI_HELPERS.map(formatLocalAiToolState);
  return {
    id: "seis-local-ai-tool-readiness",
    path: path.relative(ROOT, localAiToolReadinessPath),
    generatedAt: existingSource?.generatedAt || new Date().toISOString(),
    helperCount: tools.length,
    readyCount: tools.filter((tool) => tool.status === "ready").length,
    missingCredentialCount: tools.filter((tool) => tool.status === "missing-credential").length,
    missingCommandCount: tools.filter((tool) => tool.status === "missing-command").length,
    runtimeNotReadyCount: tools.filter((tool) => tool.status === "runtime-not-ready").length,
    tools
  };
}

function findThirdPartyCandidateDirectory(root, aliases) {
  if (!fs.existsSync(root)) return null;
  const entries = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const lowerAliases = aliases.map((alias) => String(alias || "").toLowerCase());
  const lowerEntries = entries.map((entry) => entry.toLowerCase());

  for (const alias of aliases) {
    const directPath = path.join(root, alias);
    if (fs.existsSync(directPath) && fs.statSync(directPath).isDirectory()) {
      return directPath;
    }
  }

  for (const alias of lowerAliases) {
    const exactMatch = lowerEntries.find((entry) => entry === alias);
    if (exactMatch) return path.join(root, entries[lowerEntries.indexOf(exactMatch)]);
  }

  for (const alias of lowerAliases) {
    const fuzzyMatch = lowerEntries.find((entry) => entry.includes(alias));
    if (fuzzyMatch) return path.join(root, entries[lowerEntries.indexOf(fuzzyMatch)]);
  }

  return null;
}

function checkThirdPartyCandidate(root, definition) {
  const candidateRoot = findThirdPartyCandidateDirectory(root, definition.aliases);
  const markerHits = [];

  if (candidateRoot) {
    for (const marker of definition.markerHints || []) {
      if (fs.existsSync(path.join(candidateRoot, marker))) markerHits.push(marker);
    }
  }

  return {
    id: definition.id,
    label: definition.label,
    status: candidateRoot ? "detected" : "missing",
    sourceRoot: candidateRoot ? path.relative(ROOT, candidateRoot) : null,
    aliases: definition.aliases,
    markerHints: definition.markerHints || [],
    markerHits
  };
}

function createThirdPartyAiToolInventorySource(existingSource) {
  const sourceRootExists = fs.existsSync(thirdPartySourceRoot);
  const candidates = sourceRootExists
    ? THIRD_PARTY_AI_HELPERS.map((definition) => checkThirdPartyCandidate(thirdPartySourceRoot, definition))
    : [];

  return {
    id: "seis-third-party-ai-tool-inventory",
    sourceRoot: path.relative(ROOT, thirdPartySourceRoot),
    path: path.relative(ROOT, thirdPartyAiToolInventoryPath),
    generatedAt: existingSource?.generatedAt || new Date().toISOString(),
    available: sourceRootExists,
    candidateCount: THIRD_PARTY_AI_HELPERS.length,
    detectedCount: candidates.filter((entry) => entry.status === "detected").length,
    candidates
  };
}

function createCapabilityLaneSource(capabilityLanes) {
  const lanes = Array.isArray(capabilityLanes.laneSummaries) ? capabilityLanes.laneSummaries : [];
  const assignments = Array.isArray(capabilityLanes.assignments) ? capabilityLanes.assignments : [];

  return {
    id: capabilityLanes.id,
    path: path.relative(ROOT, capabilityLanesPath),
    reportPath: path.relative(ROOT, capabilityLanesReportPath),
    generatedAt: capabilityLanes.generatedAt,
    activationPolicy: capabilityLanes.policy?.activationPolicy || "activate_only_when_relevant_authenticated_scoped_and_user_approved",
    uniquePlugins: capabilityLanes.summary?.uniquePlugins || assignments.length,
    laneCount: lanes.length,
    laneCounts: capabilityLanes.summary?.laneCounts || {},
    remotePlugins: (capabilityLanes.remotePlugins || []).map((plugin) => ({
      id: plugin.id,
      uri: plugin.uri,
      primaryLane: plugin.primaryLane,
      matchedLanes: plugin.matchedLanes || []
    })),
    lanes: lanes.map((lane) => ({
      id: lane.id,
      label: lane.label,
      pluginCount: lane.pluginCount,
      qualityCommands: lane.qualityCommands
    }))
  };
}

function createDownloadReadinessSource(downloadReadiness) {
  const plugins = Array.isArray(downloadReadiness.plugins) ? downloadReadiness.plugins : [];

  return {
    id: downloadReadiness.id,
    path: path.relative(ROOT, downloadReadinessPath),
    reportPath: path.relative(ROOT, downloadReadinessReportPath),
    generatedAt: downloadReadiness.generatedAt,
    mode: downloadReadiness.mode,
    policy: downloadReadiness.policy || {},
    totalLinks: downloadReadiness.summary?.totalLinks || plugins.length,
    uniquePlugins: plugins.length,
    downloadReadyPlugins: downloadReadiness.summary?.downloadReadyPlugins || plugins.length,
    installReadyPlugins: downloadReadiness.summary?.installReadyPlugins || plugins.length,
    useReadyPlugins: downloadReadiness.summary?.useReadyPlugins || plugins.length,
    sourceCounts: downloadReadiness.summary?.sourceCounts || {},
    laneCounts: downloadReadiness.summary?.laneCounts || {},
    plugins: plugins.map((plugin) => ({
      order: plugin.order,
      id: plugin.id,
      label: plugin.label,
      source: plugin.source,
      uri: plugin.uri,
      primaryLane: plugin.primaryLane,
      downloadStatus: plugin.downloadStatus,
      installReadiness: plugin.installReadiness,
      useReadiness: plugin.useReadiness,
      downloadTarget: plugin.downloadTarget,
      requestedByUser: plugin.requestedByUser,
      installPolicy: plugin.installPolicy,
      activationPolicy: plugin.activationPolicy
    }))
  };
}

function createRequestedSoftwareStackSource(stackSource) {
  const technologies = Array.isArray(stackSource.technologies) ? stackSource.technologies : [];

  return {
    id: stackSource.id,
    path: path.relative(ROOT, requestedSoftwareStackPath),
    reportPath: path.relative(ROOT, requestedSoftwareStackReportPath),
    generatedAt: stackSource.generatedAt,
    mode: stackSource.mode,
    activationPolicy: stackSource.activationPolicy,
    technologyCount: technologies.length,
    entrypointCount: stackSource.summary?.entrypointCount || 0,
    sourceReferences: stackSource.sourceReferences || {},
    technologies: technologies.map((technology) => ({
      id: technology.id,
      label: technology.label,
      runtimeRole: technology.runtimeRole,
      primaryLane: technology.primaryLane,
      entrypoints: technology.entrypoints,
      supportingPlugins: technology.supportingPlugins
    }))
  };
}

function createFullstackLanguageMatrixSource(matrixSource) {
  const layers = Array.isArray(matrixSource.layers) ? matrixSource.layers : [];
  const languages = Array.isArray(matrixSource.languages) ? matrixSource.languages : [];

  return {
    id: matrixSource.id,
    path: path.relative(ROOT, fullstackLanguageMatrixPath),
    reportPath: path.relative(ROOT, fullstackLanguageMatrixReportPath),
    generatedAt: matrixSource.generatedAt,
    mode: matrixSource.mode,
    activationPolicy: matrixSource.activationPolicy,
    languageCount: languages.length,
    layerCount: layers.length,
    entrypointCount: matrixSource.summary?.entrypointCount || 0,
    sourceReferences: matrixSource.sourceReferences || {},
    layers: layers.map((layer) => ({
      id: layer.id,
      label: layer.label,
      languageCount: layer.languageCount
    })),
    languages: languages.map((language) => ({
      order: language.order,
      language: language.language,
      layer: language.layer,
      layerLabel: language.layerLabel,
      role: language.role,
      entrypoints: language.entrypoints,
      requestedCoreStack: language.requestedCoreStack
    }))
  };
}

function createLlmPackageRegistrySource(registrySource) {
  const packages = Array.isArray(registrySource.packages) ? registrySource.packages : [];

  return {
    id: registrySource.id,
    path: path.relative(ROOT, llmPackageRegistryPath),
    generatedAt: registrySource.updatedAt,
    providerCount: packages.length,
    activePackageCount: packages.filter((pkg) => pkg.status === "ready").length,
    packages: packages.map((pkg) => ({
      id: pkg.id,
      provider: pkg.provider,
      mode: pkg.mode,
      scope: pkg.scope || [],
      status: pkg.status
    }))
  };
}

function createLlmTaskRoutingPolicySource(routingSource) {
  const policy = routingSource.policy || {};
  const localHelpers = Array.isArray(policy.executionBoundary?.localHelpers)
    ? policy.executionBoundary.localHelpers
    : [];
  const remoteOnly = Array.isArray(policy.executionBoundary?.remoteOnly)
    ? policy.executionBoundary.remoteOnly
    : [];
  const routingRules = Array.isArray(policy.routingRules) ? policy.routingRules : [];

  return {
    id: routingSource.id,
    path: path.relative(ROOT, llmTaskRoutingPolicyPath),
    generatedAt: routingSource.updatedAt,
    defaultLane: routingSource.default,
    remoteOrchestrator: policy.executionBoundary?.remoteOrchestrator || "seis-agent",
    localHelpers,
    remoteOnly,
    routingRuleCount: routingRules.length,
    routingRules: routingRules.map((rule) => ({
      keyword: rule.keyword,
      primary: rule.primary
    }))
  };
}

function createLlmAdapterReadinessSource(adapterSource) {
  const adapters = Array.isArray(adapterSource.adapters) ? adapterSource.adapters : [];

  return {
    id: adapterSource.id,
    path: path.relative(ROOT, llmAdapterReadinessPath),
    generatedAt: adapterSource.updatedAt,
    adapterCount: adapters.length,
    readyAdapterCount: adapters.filter((adapter) => adapter.status === "ready").length,
    adapters: adapters.map((adapter) => ({
      id: adapter.id,
      status: adapter.status,
      mode: adapter.mode,
      capabilities: adapter.capabilities || []
    }))
  };
}

function createLlmRequestBlueprintSource(blueprintSource) {
  const blueprints = Array.isArray(blueprintSource.blueprints) ? blueprintSource.blueprints : [];

  return {
    id: blueprintSource.id,
    path: path.relative(ROOT, llmRequestBlueprintsPath),
    generatedAt: blueprintSource.updatedAt,
    blueprintCount: blueprints.length,
    blueprints: blueprints.map((blueprint) => ({
      id: blueprint.id,
      name: blueprint.name,
      taskCount: Array.isArray(blueprint.tasks) ? blueprint.tasks.length : 0
    }))
  };
}

function createLlmBridgeSource(bridgeSource) {
  return {
    id: bridgeSource.id,
    path: path.relative(ROOT, llmBridgePath),
    generatedAt: bridgeSource.updatedAt,
    canonicalRepo: bridgeSource.canonical?.repo,
    canonicalBranch: bridgeSource.canonical?.branch,
    pluginManifest: bridgeSource.plugin?.manifest,
    mcpServer: bridgeSource.mcp?.server,
    launcher: bridgeSource.mcp?.launcher,
    planner: path.relative(ROOT, llmPlannerPath)
  };
}

function createThirdPartyAdaptationPlanSource(plan) {
  const candidates = Array.isArray(plan.candidates) ? plan.candidates : [];

  return {
    id: plan.id,
    path: path.relative(ROOT, thirdPartyAdaptationPlanPath),
    generatedAt: plan.generatedAt,
    sourceRoot: plan.sourceRoot,
    candidateCount: plan.summary?.candidateCount || candidates.length,
    detectedCount: plan.summary?.detectedCount || candidates.filter((candidate) => candidate.detected).length,
    blockedDeleteCount: plan.summary?.blockedDeleteCount || candidates.filter((candidate) => candidate.deletionReadiness === "blocked").length,
    highRiskCount: plan.summary?.highRiskCount || candidates.filter((candidate) => candidate.riskLevel === "high").length,
    codeImport: plan.policy?.codeImport,
    deletePolicy: plan.policy?.deletePolicy,
    githubPublishPolicy: plan.policy?.githubPublishPolicy,
    candidates: candidates.map((candidate) => ({
      id: candidate.id,
      kind: candidate.kind,
      detected: candidate.detected,
      riskLevel: candidate.riskLevel,
      allowedUse: candidate.allowedUse,
      deletionReadiness: candidate.deletionReadiness,
      githubPublishReadiness: candidate.githubPublishReadiness
    }))
  };
}

function createToolchainRuntimeReadinessSource(readiness) {
  const tools = Array.isArray(readiness.tools) ? readiness.tools : [];

  return {
    id: readiness.id,
    path: path.relative(ROOT, toolchainRuntimeReadinessPath),
    generatedAt: readiness.generatedAt,
    toolCount: readiness.summary?.toolCount || tools.length,
    installedCount: readiness.summary?.installedCount || tools.filter((tool) => tool.installed).length,
    missingCount: readiness.summary?.missingCount || tools.filter((tool) => !tool.installed).length,
    aiAgentCliCount: readiness.summary?.aiAgentCliCount || tools.filter((tool) => tool.category === "ai-agent-cli").length,
    languageRuntimeCount: readiness.summary?.languageRuntimeCount || tools.filter((tool) => tool.category === "language-runtime").length,
    installExecution: readiness.installPolicy?.installExecution,
    neverInstallSilently: readiness.installPolicy?.neverInstallSilently,
    tools: tools.map((tool) => ({
      id: tool.id,
      category: tool.category,
      installed: tool.installed,
      commandPath: tool.commandPath,
      installAction: tool.installAction
    }))
  };
}

function createDesktopAppIntegrationSource(integration) {
  const apps = Array.isArray(integration.apps) ? integration.apps : [];

  return {
    id: integration.id,
    path: path.relative(ROOT, desktopAppIntegrationPath),
    generatedAt: integration.generatedAt,
    appCount: integration.summary?.appCount || apps.length,
    detectedCount: integration.summary?.detectedCount || apps.filter((app) => app.detected).length,
    missingCount: integration.summary?.missingCount || apps.filter((app) => !app.detected).length,
    launchMode: integration.policy?.launchMode,
    defaultIde: integration.policy?.defaultIde,
    apps: apps.map((app) => ({
      id: app.id,
      role: app.role,
      detected: app.detected,
      appPath: app.appPath,
      integrationAction: app.integrationAction
    }))
  };
}

function withSubmittedPluginSources(
  payload,
  submittedPluginInventorySource,
  submittedPluginCapabilityLaneSource,
  pluginDownloadReadinessSource,
  requestedSoftwareStackSource,
  fullstackLanguageMatrixSource,
  llmPackageRegistrySource,
  llmTaskRoutingPolicySource,
  llmAdapterReadinessSource,
  llmRequestBlueprintsSource,
  llmBridgeSource,
  localAiToolReadinessSource,
  thirdPartyAiToolInventorySource,
  thirdPartyAdaptationPlanSource,
  toolchainRuntimeReadinessSource,
  desktopAppIntegrationSource
) {
  const existingSources = payload.sources && typeof payload.sources === "object"
    ? payload.sources
    : {};
  const nextSources = {
    ...existingSources,
    submittedPluginInventory: submittedPluginInventorySource
  };

  if (submittedPluginCapabilityLaneSource) {
    nextSources.submittedPluginCapabilityLanes = submittedPluginCapabilityLaneSource;
  }

  if (pluginDownloadReadinessSource) {
    nextSources.pluginDownloadReadiness = pluginDownloadReadinessSource;
  }

  if (requestedSoftwareStackSource) {
    nextSources.requestedSoftwareStack = requestedSoftwareStackSource;
  }

  if (fullstackLanguageMatrixSource) {
    nextSources.fullstackLanguageMatrix = fullstackLanguageMatrixSource;
  }

  if (llmPackageRegistrySource) {
    nextSources.llmSystem = llmPackageRegistrySource;
  }

  if (llmTaskRoutingPolicySource) {
    nextSources.llmTaskRoutingPolicy = llmTaskRoutingPolicySource;
  }

  if (llmAdapterReadinessSource) {
    nextSources.llmAdapterReadiness = llmAdapterReadinessSource;
  }

  if (llmRequestBlueprintsSource) {
    nextSources.llmRequestBlueprints = llmRequestBlueprintsSource;
  }

  if (llmBridgeSource) {
    nextSources.llmBridge = llmBridgeSource;
  }

  if (localAiToolReadinessSource) {
    nextSources.localAiToolReadiness = localAiToolReadinessSource;
  }

  if (thirdPartyAiToolInventorySource) {
    nextSources.thirdPartyAiToolInventory = thirdPartyAiToolInventorySource;
  }

  if (thirdPartyAdaptationPlanSource) {
    nextSources.thirdPartyAdaptationPlan = thirdPartyAdaptationPlanSource;
  }

  if (toolchainRuntimeReadinessSource) {
    nextSources.toolchainRuntimeReadiness = toolchainRuntimeReadinessSource;
  }

  if (desktopAppIntegrationSource) {
    nextSources.desktopAppIntegration = desktopAppIntegrationSource;
  }

  const next = {};
  let inserted = false;

  for (const [key, value] of Object.entries(payload)) {
    if (key === "sources") continue;
    next[key] = value;

    if (key === "environment") {
      next.sources = nextSources;
      inserted = true;
    }
  }

  if (!inserted) next.sources = nextSources;
  return next;
}
