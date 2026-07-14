import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { buildSeisPluginMcpMesh } from "../lib/plugin-mcp-mesh.mjs";

export const SEIS_CORE_ECOSYSTEM_SNAPSHOT_ID = "seis-core-ecosystem-registry";
export const SEIS_CORE_ECOSYSTEM_SNAPSHOT_PATH = "apps/seis-core/data/seis-core-ecosystem-registry.json";

const SOURCE_PATHS = Object.freeze({
  identities: "data/seis-operating-identities.json",
  capabilityAtlas: "data/seis-runtime-capability-atlas.json",
  pluginIntegration: "content/development/seis-agent-plugin-integration.json",
  providerRegistry: "content/development/seis-ai-core-provider-registry.json",
  mcpRuntime: "content/development/seis-ai-core-mcp-runtime-contract.json",
  agentRegistry: "content/development/seis-agent-registry.json",
  designInventory: "content/development/seis-design-component-inventory.json",
  dataRegistry: "content/development/seis-data-schema-registry.json",
  sshContract: "deploy/seis-ssh-public-access-contract.json",
  sshEvidence: "content/development/seis-ssh-live-readiness-evidence.json",
  desktopRuntime: "apps/web/desktop.js",
});

const PLUGIN_ROOTS = Object.freeze([
  "plugins/seis-ai-agent",
  "plugins/seis",
  "plugins/seis-cloud",
  "plugins/seis-code",
  "plugins/seis-design",
  "plugins/seis-data",
]);

const CORE_LANES = Object.freeze([
  {
    id: "seis",
    label: "SEIS",
    identity: "SEIS",
    plugin: "seis",
    kind: "Ecosystem governance",
    status: "Ready",
    mode: "Core contract",
    route: {
      kind: "desktop-app",
      href: "../web/desktop.html?app=seis-command-center",
      targetId: "seis-command-center",
      label: "Open Command Center",
    },
  },
  {
    id: "seis-cloud",
    label: "SEIS Cloud",
    identity: "SEIS-Cloud",
    plugin: "seis-cloud",
    kind: "Cloud readiness lane",
    status: "Review",
    mode: "Mock Safe",
    route: {
      kind: "desktop-app",
      href: "../web/desktop.html?app=seis-cloud",
      targetId: "seis-cloud",
      label: "Open Cloud workspace",
    },
  },
  {
    id: "seis-code",
    label: "SEIS Code",
    identity: "SEIS-Code",
    plugin: "seis-code",
    kind: "Engineering lane",
    status: "Ready",
    mode: "Browser Local",
    route: {
      kind: "standalone-page",
      href: "../web/seis-code.html",
      targetId: "seis-code",
      label: "Open Code IDE",
      source: "apps/web/seis-code.html",
    },
  },
  {
    id: "seis-design",
    label: "SEIS Design",
    identity: "SEIS-Design",
    plugin: "seis-design",
    kind: "Design system lane",
    status: "Ready",
    mode: "Browser Local",
    route: {
      kind: "desktop-app",
      href: "../web/desktop.html?app=seis-design",
      targetId: "seis-design",
      label: "Open Design Studio",
    },
  },
  {
    id: "seis-data",
    label: "SEIS Data",
    identity: "SEIS-Data",
    plugin: "seis-data",
    kind: "Data and knowledge lane",
    status: "Ready",
    mode: "Registry-backed",
    route: {
      kind: "desktop-app",
      href: "../web/desktop.html?app=second-brain",
      targetId: "second-brain",
      label: "Open Data workspace",
    },
  },
]);

export function buildSeisEcosystemCapabilitySnapshot(repoRoot = process.cwd()) {
  const identities = readJson(repoRoot, SOURCE_PATHS.identities);
  const atlas = readJson(repoRoot, SOURCE_PATHS.capabilityAtlas);
  const integration = readJson(repoRoot, SOURCE_PATHS.pluginIntegration);
  const providers = readJson(repoRoot, SOURCE_PATHS.providerRegistry);
  const mcp = readJson(repoRoot, SOURCE_PATHS.mcpRuntime);
  const pluginMcpMesh = buildSeisPluginMcpMesh(repoRoot);
  const agents = readJson(repoRoot, SOURCE_PATHS.agentRegistry);
  const design = readJson(repoRoot, SOURCE_PATHS.designInventory);
  const data = readJson(repoRoot, SOURCE_PATHS.dataRegistry);
  const sshContract = readJson(repoRoot, SOURCE_PATHS.sshContract);
  const sshEvidence = readJson(repoRoot, SOURCE_PATHS.sshEvidence);
  const desktopRuntime = readText(repoRoot, SOURCE_PATHS.desktopRuntime);

  validateSources({ identities, atlas, integration, providers, mcp, agents, design, data, sshContract, sshEvidence });

  const plugins = PLUGIN_ROOTS.map((pluginRoot) => buildPluginRecord(repoRoot, pluginRoot));
  const pluginsById = new Map(plugins.map((plugin) => [plugin.id, plugin]));
  const identitiesByName = new Map(identities.identities.map((identity) => [identity.name, identity]));
  const integrationById = new Map(integration.lanes.map((lane) => [lane.id, lane]));
  const atlasById = new Map(atlas.lanes.map((lane) => [lane.laneId, lane]));
  const personalPluginByLane = new Map(integration.personalPlugins.map((plugin) => [plugin.embeddedAs, plugin]));

  const lanes = CORE_LANES.map((config) => {
    const identity = requiredMapValue(identitiesByName, config.identity, `operating identity ${config.identity}`);
    const integrationLane = requiredMapValue(integrationById, config.id, `plugin lane ${config.id}`);
    const atlasLane = requiredMapValue(atlasById, config.id, `capability lane ${config.id}`);
    const plugin = requiredMapValue(pluginsById, config.plugin, `plugin ${config.plugin}`);
    const personalPlugin = requiredMapValue(personalPluginByLane, config.id, `personal plugin lane ${config.id}`);

    validateRoute(repoRoot, desktopRuntime, config.route);

    const record = {
      id: config.id,
      label: config.label,
      identity: config.identity,
      kind: config.kind,
      status: config.status,
      mode: config.mode,
      role: integrationLane.role,
      scope: identity.scope,
      executionAuthority: false,
      coreBinding: `${config.label} is embedded in the canonical SEIS-Agent runtime and exposed through the source-backed SEIS Core control plane.`,
      storeBinding: `${config.label} is catalogued as a browser-local capability; external activation and mutation remain separately approval-gated.`,
      route: config.route,
      pluginBinding: {
        runtimePlugin: integration.canonicalAgent.publishedPlugin,
        runtimeInstallId: integration.primaryInstallId,
        sourcePlugin: plugin.id,
        sourceManifest: plugin.manifestPath,
        personalInstallId: personalPlugin.id,
        auditedStatus: personalPlugin.status,
        embeddedSkill: personalPlugin.embeddedSkill,
        standaloneInstallMode: integration.canonicalAgent.standaloneLaneInstallMode,
      },
      mcp: {
        server: integration.canonicalAgent.publishedPlugin,
        sourceServer: atlasLane.mcpServer,
        tools: [...integrationLane.mcpTools],
        toolCount: integrationLane.mcpTools.length,
        state: "contract-listed-local-smoke",
        executionAuthority: false,
      },
      skills: uniqueStrings([
        personalPlugin.embeddedSkill,
        ...plugin.skills.map((skill) => skill.path),
      ]),
      capabilities: [...atlasLane.capabilities],
      agentIds: [...atlasLane.agentIds],
      moduleIds: [...atlasLane.moduleIds],
      qualityGates: uniqueStrings([
        identity.qualityGate,
        integrationLane.defaultGate,
        ...atlasLane.qualityGates,
      ]),
      sourceRefs: uniqueStrings([
        SOURCE_PATHS.identities,
        SOURCE_PATHS.capabilityAtlas,
        SOURCE_PATHS.pluginIntegration,
        plugin.manifestPath,
        personalPlugin.embeddedSkill,
      ]),
    };

    if (config.id === "seis-cloud") {
      record.sshBinding = buildSshBinding(sshContract, sshEvidence);
    }
    if (config.id === "seis") {
      record.authorityNote = "Runtime authority follows the canonical SEIS-Agent and SEIS Hub tools; the capability atlas source keeps its historical SEIS Governance server label as evidence only.";
    }
    if (config.id === "seis-design") {
      record.designSystem = {
        componentCount: design.components.length,
        validatedComponentCount: design.components.filter((component) => component.status === "validated").length,
        source: SOURCE_PATHS.designInventory,
      };
    }
    if (config.id === "seis-data") {
      record.dataSystem = {
        contractCount: data.records.length,
        validatedContractCount: data.records.filter((record) => record.currentStatus === "validated").length,
        scaffoldedContractCount: data.records.filter((record) => record.currentStatus === "scaffolded").length,
        source: SOURCE_PATHS.dataRegistry,
      };
    }

    return record;
  });

  const storeLane = buildStoreLane(desktopRuntime);
  lanes.push(storeLane);

  const providerRecords = providers.providers.map((provider) => ({
    id: provider.id,
    displayName: provider.displayName,
    category: provider.category,
    publicStatus: provider.publicStatus,
    configured: provider.configured === true,
    enabled: provider.enabled === true,
    routingEligible: provider.routingEligible === true,
    credentialRequirement: provider.credentialRequirement,
    backendOnly: provider.backendOnly === true,
    frontendSecretAllowed: provider.frontendSecretAllowed === true,
  }));
  const repoSkillCount = plugins.reduce((total, plugin) => total + plugin.skillCount, 0);
  const validatedDataContracts = data.records.filter((record) => record.currentStatus === "validated").length;
  const validatedDesignComponents = design.components.filter((component) => component.status === "validated").length;

  return {
    id: SEIS_CORE_ECOSYSTEM_SNAPSHOT_ID,
    schemaVersion: "2.0.0",
    status: "source-backed-local-demo",
    mode: "read-only-capability-control-plane",
    updatedAt: "2026-07-12",
    purpose: "Expose the SEIS product lanes, bundled plugin and skill sources, provider registry, MCP contract, and real browser-local launch targets through one fail-closed Core snapshot.",
    sourceOfTruth: {
      ...SOURCE_PATHS,
      pluginRoots: [...PLUGIN_ROOTS],
      generator: "scripts/create-seis-core-ecosystem-snapshot.mjs",
      output: SEIS_CORE_ECOSYSTEM_SNAPSHOT_PATH,
    },
    counts: {
      coreLanes: lanes.length,
      bundledPluginSources: plugins.length,
      repoSkills: repoSkillCount,
      auditedInstalledEnabledPlugins: integration.auditedSnapshot.installedEnabledCount,
      cataloguedHelperPlugins: integration.helperPluginUniverse.uniquePlugins,
      providers: providerRecords.length,
      mcpTools: mcp.toolCount,
      mcpResources: mcp.resourceCount,
      mcpPrompts: mcp.promptCount,
      productModules: atlas.productModules.length,
      dataContracts: data.records.length,
      validatedDataContracts,
      designComponents: design.components.length,
      validatedDesignComponents,
      managedAgentRoles: agents.counts.secondBrainAgentRoles,
    },
    pluginAudit: {
      auditedAt: integration.auditedSnapshot.auditedAt,
      installedEnabledCount: integration.auditedSnapshot.installedEnabledCount,
      notInstalledCount: integration.auditedSnapshot.notInstalledCount,
      authenticationClaim: integration.auditedSnapshot.authenticationClaim,
      state: "dated-source-audit-not-live-rescan",
    },
    helperPluginUniverse: {
      uniquePlugins: integration.helperPluginUniverse.uniquePlugins,
      totalLinks: integration.helperPluginUniverse.totalLinks,
      laneCount: integration.helperPluginUniverse.laneCount,
      activationPolicy: integration.helperPluginUniverse.activationPolicy,
      state: "catalogued-not-blanket-activated",
    },
    providers: {
      id: providers.id,
      status: providers.status,
      state: "source-registry-not-live-probe",
      records: providerRecords,
    },
    mcpRuntime: {
      id: mcp.id,
      status: mcp.status,
      transport: mcp.transport,
      toolCount: mcp.toolCount,
      resourceCount: mcp.resourceCount,
      promptCount: mcp.promptCount,
      boundary: mcp.boundary,
      liveBrowserSessionStarted: false,
      pluginMesh: pluginMcpMesh,
    },
    agentRegistry: {
      id: agents.id,
      status: agents.status,
      counts: agents.counts,
      executionAuthority: false,
    },
    plugins,
    lanes,
    runtimeBoundary: {
      browserLocalReadOnly: true,
      providerCalls: false,
      credentialsRead: false,
      frontendSecretsAllowed: false,
      liveMcpSessionStarted: false,
      backgroundAutomation: false,
      agentExecution: false,
      sshExecuted: false,
      deploymentPerformed: false,
      githubMutationPerformed: false,
      packageInstallationPerformed: false,
      privateContentRead: false,
      humanApprovalRequiredForExternalMutation: true,
    },
    qualityGates: [
      "npm run check:seis-core-ecosystem-registry",
      "npm run check:seis-agent-plugin-integration",
      "npm run check:seis-agent-registry",
      "npm run check:seis-runtime-capability-atlas",
      "npm run check:seis-ai-core-provider-registry",
      "npm run check:seis-command-center",
      "npm run check:desktop-os",
      "node --test packages/seis-ai/test/ecosystem-capability-snapshot.test.mjs",
    ],
  };
}

function validateSources({ identities, atlas, integration, providers, mcp, agents, design, data, sshContract, sshEvidence }) {
  if (identities.id !== "seis-operating-identities") throw new Error("SEIS operating identities id mismatch");
  const identityNames = new Set(identities.identities?.map((identity) => identity.name));
  for (const lane of CORE_LANES) {
    if (!identityNames.has(lane.identity)) throw new Error(`SEIS operating identity missing: ${lane.identity}`);
  }

  if (atlas.id !== "seis-runtime-capability-atlas" || atlas.runtimeBoundary?.currentLevel !== "status-and-plan-only") {
    throw new Error("SEIS runtime capability atlas must remain status-and-plan-only");
  }
  if (atlas.runtimeBoundary?.writeExecution !== "disabled" || atlas.runtimeBoundary?.providerCalls !== "disabled") {
    throw new Error("SEIS runtime capability atlas must keep writes and provider calls disabled");
  }
  if (!Array.isArray(atlas.lanes) || atlas.lanes.length !== 5 || !Array.isArray(atlas.productModules) || atlas.productModules.length < 18) {
    throw new Error("SEIS runtime capability atlas coverage drifted");
  }

  if (integration.id !== "seis-agent-plugin-integration" || integration.status !== "active") {
    throw new Error("SEIS-Agent plugin integration is unavailable");
  }
  if (integration.canonicalAgent?.publishedPlugin !== "seis-ai-agent" || integration.canonicalAgent?.standaloneLaneInstallMode !== "disabled") {
    throw new Error("SEIS-Agent must remain the single canonical runtime plugin");
  }
  if (integration.activationPolicy?.noBlanketActivation !== true
    || integration.activationPolicy?.noSecretDisclosure !== true
    || integration.activationPolicy?.externalMutationRequiresUserConfirmation !== true) {
    throw new Error("SEIS plugin activation policy must remain task-scoped and approval-gated");
  }
  if (!Array.isArray(integration.personalPlugins) || integration.personalPlugins.length !== 5) {
    throw new Error("SEIS personal plugin lane coverage drifted");
  }

  if (providers.id !== "seis-ai-core-provider-registry" || !Array.isArray(providers.providers) || providers.providers.length !== 7) {
    throw new Error("SEIS AI Core provider registry coverage drifted");
  }
  for (const provider of providers.providers) {
    if (provider.backendOnly !== true || provider.frontendSecretAllowed !== false) {
      throw new Error(`Provider ${provider.id} violates the backend-only secret boundary`);
    }
    if (!providers.publicStates.includes(provider.publicStatus)) {
      throw new Error(`Provider ${provider.id} uses an unsupported public state`);
    }
  }

  if (mcp.id !== "seis-ai-core-mcp-runtime-contract" || mcp.status !== "local-smoke-verified") {
    throw new Error("SEIS MCP runtime contract is not locally verified");
  }
  if (![mcp.toolCount, mcp.resourceCount, mcp.promptCount].every((count) => Number.isInteger(count) && count > 0)) {
    throw new Error("SEIS MCP runtime counts are invalid");
  }

  if (agents.id !== "seis-agent-registry"
    || agents.runtimeBoundary?.registryGrantsPermissions !== false
    || agents.runtimeBoundary?.liveCapabilities?.autonomousWriteExecution !== false) {
    throw new Error("SEIS agent registry must keep agent execution disabled");
  }
  if (agents.counts?.secondBrainAgentRoles !== 13 || agents.counts?.personalExecutablePlanningLanes !== 5) {
    throw new Error("SEIS agent registry counts drifted");
  }

  if (design.id !== "seis-design-component-inventory" || !Array.isArray(design.components) || design.components.length === 0) {
    throw new Error("SEIS design component inventory is unavailable");
  }
  if (data.id !== "seis-data-schema-registry" || !Array.isArray(data.records) || data.records.length === 0) {
    throw new Error("SEIS data schema registry is unavailable");
  }

  if (sshContract.id !== "seis-ssh-public-access-contract"
    || sshContract.serverAndPortPolicy?.mode !== "preserve-existing-server-and-port") {
    throw new Error("SEIS-SSH must preserve the existing server and port");
  }
  if (sshEvidence.id !== "seis-ssh-live-readiness-evidence" || sshEvidence.liveProbe?.strictReady !== false) {
    throw new Error("SEIS-SSH evidence must not claim strict live readiness");
  }
}

function buildPluginRecord(repoRoot, pluginRoot) {
  const manifestPath = `${pluginRoot}/.codex-plugin/plugin.json`;
  const mcpConfigPath = `${pluginRoot}/.mcp.json`;
  const skillsRoot = `${pluginRoot}/skills`;
  const manifest = readJson(repoRoot, manifestPath);
  const skills = listSkills(repoRoot, skillsRoot);

  if (!manifest.name || !manifest.version || !manifest.interface?.displayName || !Array.isArray(manifest.interface?.capabilities)) {
    throw new Error(`Plugin manifest is incomplete: ${manifestPath}`);
  }
  if (!exists(repoRoot, mcpConfigPath)) throw new Error(`Plugin MCP config is missing: ${mcpConfigPath}`);
  if (skills.length === 0) throw new Error(`Plugin has no repo skill: ${pluginRoot}`);

  return {
    id: manifest.name,
    displayName: manifest.interface.displayName,
    version: manifest.version,
    license: manifest.license,
    category: manifest.interface.category,
    status: "bundled-repository-source",
    manifestPath,
    mcpConfigPath,
    skillCount: skills.length,
    skills,
    capabilities: [...manifest.interface.capabilities],
    executionAuthority: false,
  };
}

function listSkills(repoRoot, relativeRoot) {
  const absoluteRoot = resolve(repoRoot, relativeRoot);
  if (!existsSync(absoluteRoot)) return [];
  return readdirSync(absoluteRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      id: entry.name,
      path: `${relativeRoot}/${entry.name}/SKILL.md`,
    }))
    .filter((skill) => exists(repoRoot, skill.path))
    .sort((left, right) => left.id.localeCompare(right.id));
}

function buildStoreLane(desktopRuntime) {
  const route = {
    kind: "desktop-app",
    href: "../web/desktop.html?app=seis-store",
    targetId: "seis-store",
    label: "Open SEIS Store",
  };
  validateDesktopApp(desktopRuntime, route.targetId);
  return {
    id: "seis-store",
    label: "SEIS Store",
    identity: "SEIS Store",
    kind: "Browser-local marketplace",
    status: "Ready",
    mode: "Local Demo",
    role: "Browse and persist browser-local app, plugin, theme, tool, update, and enable states without remote installation.",
    scope: "Local catalog and install-state demonstration only.",
    executionAuthority: false,
    coreBinding: "SEIS Core exposes Store as the local catalog authority for the demo ecosystem.",
    storeBinding: "The Store owns browser-local catalog state and has no remote package installer.",
    route,
    pluginBinding: null,
    mcp: {
      server: null,
      tools: [],
      toolCount: 0,
      state: "no-remote-mcp",
      executionAuthority: false,
    },
    skills: [],
    capabilities: [
      "Browser-local app catalog",
      "Install and update state persistence",
      "Enable and disable state",
      "Category and search discovery",
    ],
    agentIds: [],
    moduleIds: ["store", "plugins", "launchpad"],
    qualityGates: ["npm run check:desktop-os"],
    sourceRefs: [SOURCE_PATHS.desktopRuntime],
  };
}

function buildSshBinding(contract, evidence) {
  return {
    alias: contract.targetAlias,
    contract: SOURCE_PATHS.sshContract,
    evidence: SOURCE_PATHS.sshEvidence,
    evidenceStatus: evidence.status,
    strictReady: evidence.liveProbe.strictReady,
    serverAndPortPolicy: contract.serverAndPortPolicy.mode,
    serverOrPortChanged: evidence.serverAndPortPolicy.serverOrPortChanged,
    runtimeMode: "status-and-plan-only",
    liveClaim: "blocked-until-strict-online-evidence",
  };
}

function validateRoute(repoRoot, desktopRuntime, route) {
  if (route.kind === "desktop-app") {
    validateDesktopApp(desktopRuntime, route.targetId);
    return;
  }
  if (route.kind === "standalone-page" && route.source && exists(repoRoot, route.source)) return;
  throw new Error(`SEIS ecosystem route is not verifiable: ${route.targetId}`);
}

function validateDesktopApp(desktopRuntime, appId) {
  if (!desktopRuntime.includes(`["${appId}",`)) {
    throw new Error(`SEIS desktop app target is missing: ${appId}`);
  }
}

function requiredMapValue(map, key, label) {
  const value = map.get(key);
  if (!value) throw new Error(`Missing ${label}`);
  return value;
}

function uniqueStrings(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}

function exists(repoRoot, relativePath) {
  return existsSync(resolve(repoRoot, relativePath));
}

function readJson(repoRoot, relativePath) {
  return JSON.parse(readText(repoRoot, relativePath));
}

function readText(repoRoot, relativePath) {
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

function resolve(repoRoot, relativePath) {
  return path.join(repoRoot, ...relativePath.split("/"));
}
