import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const planRelativePath = "content/development/seis-sub-agent-5-year-plan.json";
const versionRegistryRelativePath = "content/development/seis-ai-core-version-registry.json";
const promotionGatesRelativePath = "content/development/seis-ai-core-version-promotion-gates.json";
const pluginIntegrationRelativePath = "content/development/seis-agent-plugin-integration.json";
const mcpRuntimeContractRelativePath = "content/development/seis-ai-core-mcp-runtime-contract.json";
const providerRegistryRelativePath = "content/development/seis-ai-core-provider-registry.json";
const planPath = path.join(root, planRelativePath);
const versionRegistryPath = path.join(root, versionRegistryRelativePath);
const promotionGatesPath = path.join(root, promotionGatesRelativePath);
const pluginIntegrationPath = path.join(root, pluginIntegrationRelativePath);
const mcpRuntimeContractPath = path.join(root, mcpRuntimeContractRelativePath);
const providerRegistryPath = path.join(root, providerRegistryRelativePath);
const reportJsonRelativePath = "reports/seis-sub-agent-five-year-demo-evidence.json";
const reportMdRelativePath = "reports/seis-sub-agent-five-year-demo-evidence.md";
const demoPromotionMapRelativePath = "apps/seis-demo-web/data/seis-ai-core-version-promotion-map.json";
const demoPlanViewRelativePath = "apps/seis-demo-web/data/seis-sub-agent-five-year-plan-view.json";
const reportJsonPath = path.join(root, reportJsonRelativePath);
const reportMdPath = path.join(root, reportMdRelativePath);
const demoPromotionMapPath = path.join(root, demoPromotionMapRelativePath);
const demoPlanViewPath = path.join(root, demoPlanViewRelativePath);
const checkOnly = process.argv.includes("--check");

const installedAiCoreRoutes = [
  {
    systemId: "codex-operator",
    systemName: "Codex",
    versionTargetId: "v0.1-foundation",
    versionLabel: "v0.1 Foundation Kernel",
    providerState: "Available",
    routeMode: "supervised-operator",
    subAgentDuty: "Implementation, validation, and repository-safe edits",
    credentialBoundary: "No browser credential; current Codex session only"
  },
  {
    systemId: "seis-local-demo",
    systemName: "SEIS Local Demo Runtime",
    versionTargetId: "v0.1-foundation",
    versionLabel: "v0.1 Foundation Kernel",
    providerState: "Available",
    routeMode: "no-key-local-demo",
    subAgentDuty: "AI shell, Claude-style REPL demo, tool-call ledger, and VFS evidence",
    credentialBoundary: "No key required; browser-local state only"
  },
  {
    systemId: "claude-review-profile",
    systemName: "Claude Review Profile",
    versionTargetId: "v0.2-read-only-intelligence",
    versionLabel: "v0.2 Read-Only Intelligence",
    providerState: "Missing Key",
    routeMode: "backend-only-planned",
    subAgentDuty: "Architecture, safety, PR review, and large-context review lane",
    credentialBoundary: "Server-only Anthropic credential when explicitly configured"
  },
  {
    systemId: "qwen-review-profile",
    systemName: "Qwen Alternative Review",
    versionTargetId: "v0.3-write-gated-runtime",
    versionLabel: "v0.3 Write-Gated Runtime",
    providerState: "Disabled",
    routeMode: "alternative-review-planned",
    subAgentDuty: "Contradiction detection, archive review, and second-opinion risk checks",
    credentialBoundary: "Server-only or local endpoint later"
  },
  {
    systemId: "gemini-validation-profile",
    systemName: "Gemini Secondary Validation",
    versionTargetId: "v0.4-multi-workspace-readiness",
    versionLabel: "v0.4 Multi-Workspace Readiness",
    providerState: "Disabled",
    routeMode: "secondary-validation-planned",
    subAgentDuty: "Multimodal, product, and secondary validation after provider audit",
    credentialBoundary: "Server-only Gemini credential when explicitly configured"
  },
  {
    systemId: "ollama-local-profile",
    systemName: "Ollama Local Candidate",
    versionTargetId: "v0.2-read-only-intelligence",
    versionLabel: "v0.2 Read-Only Intelligence",
    providerState: "Disabled",
    routeMode: "zero-key-local-provider-planned",
    subAgentDuty: "Local/private inference candidate for local-only workspaces",
    credentialBoundary: "No key; user-controlled local service only"
  }
];

const pluginVersionTargets = {
  "seis": "v0.1-foundation",
  "seis-code": "v0.1-foundation",
  "seis-design": "v0.2-read-only-intelligence",
  "seis-data": "v0.2-read-only-intelligence",
  "seis-cloud": "v0.4-multi-workspace-readiness"
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

const mcpRuntimeContract = readJson(mcpRuntimeContractPath);
const providerRegistry = readJson(providerRegistryPath);

function laneAction(laneId, quarter) {
  const actions = {
    "architecture-agent": "Review architecture boundaries, promotion gates, and source-of-truth alignment.",
    "implementation-agent": "Prepare scoped implementation work while preserving unrelated repository changes.",
    "security-agent": "Check approval boundaries, secret safety, provider honesty, and unsafe autonomy.",
    "documentation-agent": "Record evidence, source links, handoff notes, and current-versus-planned status.",
    "validation-agent": "Run or schedule deterministic checks, browser smoke, and evidence verification.",
    "design-agent": "Review calm UX, accessibility, responsive behavior, and demo clarity."
  };
  return `${actions[laneId] || "Review assigned lane work"} Quarter: ${quarter.id}.`;
}

function mapByYear(entries) {
  return new Map((entries || []).map((entry) => [entry.year, entry]));
}

function buildVersionTargets(versionRegistry, promotionGates) {
  const gatesByYear = mapByYear(promotionGates.gates);

  return (versionRegistry.fiveYearVersionRoadmap || []).map((target) => {
    const gate = gatesByYear.get(target.year);
    return {
      year: target.year,
      versionTarget: target.versionTarget,
      theme: target.theme,
      promotionGate: target.promotionGate,
      promotionGateStatus: gate?.status || "unknown",
      promotionDryRunDecision: gate?.dryRunDecision || "not-ready",
      promotionHumanApprovalRequired: gate?.humanApprovalRequired === true,
      releasePromotionAllowed: gate?.releasePromotionAllowed === true,
      validationCommands: gate?.validationCommands || [],
      nextSafeAction: gate?.nextSafeAction || "Collect missing promotion evidence before promotion."
    };
  });
}

function labelForLane(lane) {
  return String(lane.id || "")
    .replace(/-agent$/, "")
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ") || lane.role || "Agent";
}

function buildPersonalPluginLaneMatrix(pluginIntegration, versionRegistry) {
  const linkedLanes = new Map((versionRegistry.linkedSubAgentLanes || []).map((lane) => [lane.laneId, lane]));
  const manifestLanes = new Map((pluginIntegration.lanes || []).map((lane) => [lane.id, lane]));

  return (pluginIntegration.personalPlugins || []).map((plugin) => {
    const laneId = plugin.embeddedAs || plugin.id.replace("@personal", "");
    const linkedLane = linkedLanes.get(laneId) || {};
    const manifestLane = manifestLanes.get(laneId) || {};
    return {
      pluginId: plugin.id,
      laneId,
      displayName: linkedLane.displayName || manifestLane.displayName || laneId,
      status: plugin.status || "unknown",
      role: manifestLane.role || "personal SEIS plugin lane",
      versionTargetId: pluginVersionTargets[laneId] || "v0.1-foundation",
      statusTool: linkedLane.statusTool || manifestLane.mcpTools?.[0] || "",
      planTool: linkedLane.planTool || manifestLane.mcpTools?.[1] || "",
      permissionLevel: linkedLane.permissionLevel || "plan-only",
      versionDuty: linkedLane.versionDuty || "Keep this plugin lane tied to versioned AI Core evidence.",
      embeddedSkill: plugin.embeddedSkill || manifestLane.embeddedSkill || "",
      sourceMirror: plugin.sourceMirror || manifestLane.sourceMirror || "",
      gate: manifestLane.defaultGate || "npm run check:seis-agent-plugin-integration",
      aiCoreBoundary: "Embedded personal plugin lane; no standalone install, external mutation, credential access, deploy, SSH, or GitHub write without human approval."
    };
  });
}

function buildDemoPlanView(plan) {
  const years = (plan.years || []).map((year) => ({
    year: year.year,
    theme: year.theme,
    quarters: (year.quarters || []).map((quarter) => ({
      id: quarter.id,
      focus: quarter.focus,
      lanes: quarter.primaryLanes || [],
      primaryLanes: quarter.primaryLanes || [],
      outcomes: quarter.outcomes || [],
      gates: quarter.gates || []
    }))
  }));

  const pluginIntegration = readJson(pluginIntegrationPath);
  const versionRegistry = readJson(versionRegistryPath);
  const personalPluginLaneMatrix = buildPersonalPluginLaneMatrix(pluginIntegration, versionRegistry);

  return {
    id: "seis-sub-agent-five-year-plan-view",
    version: 1,
    status: "generated-from-source",
    generatedAt: "deterministic-plan-derived",
    generatedBy: "scripts/create-sub-agent-five-year-demo-evidence.mjs",
    sourcePlan: planRelativePath,
    seisAiCoreVersionRegistry: versionRegistryRelativePath,
    seisAiCoreProviderRegistry: providerRegistryRelativePath,
    seisAiCoreVersionPromotionGates: promotionGatesRelativePath,
    seisAgentPluginIntegration: pluginIntegrationRelativePath,
    seisAiCoreMcpRuntimeContract: mcpRuntimeContractRelativePath,
    seisAiCoreProviderRegistry: providerRegistryRelativePath,
    demoSurface: "apps/seis-demo-web",
    demoBoundary: "local-demo-only",
    truthBoundary: "Generated from the source-of-truth five-year sub-agent plan for read-only Local Demo display; it does not authorize background agents, external mutation, SSH, deployment, credential access, GitHub writes, model training, or release promotion.",
    planStatus: plan.status || "unknown",
    releasePromotionAllowed: false,
    writerPolicy: plan.governance?.writerPolicy || "single-writer",
    defaultWriter: plan.governance?.defaultWriter || "codex",
    subAgentsAre: plan.governance?.subAgentsAre || "bounded helpers under human governance",
    forbiddenAutonomy: plan.governance?.forbiddenAutonomy || [],
    requiredControls: plan.governance?.requiredControls || [],
    yearCount: years.length,
    quarterCount: years.reduce((total, year) => total + year.quarters.length, 0),
    laneCount: (plan.lanes || []).length,
    installedAiCoreRouteCount: installedAiCoreRoutes.length,
    installedAiCoreRoutes,
    personalPluginLaneCount: personalPluginLaneMatrix.length,
    personalPluginLaneMatrix,
    mcpRuntimeSurfaceCount: mcpRuntimeContract.surfaces.length,
    mcpRuntimeToolCount: mcpRuntimeContract.toolCount,
    mcpRuntimeResourceCount: mcpRuntimeContract.resourceCount,
    mcpRuntimePromptCount: mcpRuntimeContract.promptCount,
    mcpRuntimeContract,
    providerRegistry,
    providerRegistryProviderCount: Array.isArray(providerRegistry.providers) ? providerRegistry.providers.length : 0,
    providerRegistryRequiredForCoreCount: Array.isArray(providerRegistry.requiredForCore) ? providerRegistry.requiredForCore.length : 0,
    providerRegistryNoKeyProviderCount: Array.isArray(providerRegistry.noKeyProviders) ? providerRegistry.noKeyProviders.length : 0,
    lanes: (plan.lanes || []).map((lane) => ({
      id: lane.id,
      label: labelForLane(lane),
      role: lane.role,
      authority: lane.defaultAuthority,
      defaultAuthority: lane.defaultAuthority,
      wipLimit: lane.wipLimit
    })),
    years
  };
}

function buildReport(plan, versionRegistry, promotionGates) {
  const records = [];
  const roadmapByYear = mapByYear(versionRegistry.fiveYearVersionRoadmap);
  const gatesByYear = mapByYear(promotionGates.gates);

  for (const year of plan.years || []) {
    const versionTarget = roadmapByYear.get(year.year);
    const promotionGate = gatesByYear.get(year.year);

    for (const quarter of year.quarters || []) {
      records.push({
        sequence: records.length + 1,
        id: `sub-agent-demo-${quarter.id.toLowerCase()}`,
        status: "repo-local-demo-recorded",
        sourcePlanQuarter: quarter.id,
        year: year.year,
        theme: year.theme,
        focus: quarter.focus,
        primaryLanes: quarter.primaryLanes,
        outcomes: quarter.outcomes,
        gates: quarter.gates,
        aiCoreVersionTarget: versionTarget?.versionTarget || "unknown",
        aiCoreVersionTheme: versionTarget?.theme || "unknown",
        aiCoreVersionPromotionGate: versionTarget?.promotionGate || "unknown",
        promotionGateStatus: promotionGate?.status || "unknown",
        promotionDryRunDecision: promotionGate?.dryRunDecision || "not-ready",
        promotionHumanApprovalRequired: promotionGate?.humanApprovalRequired === true,
        promotionReleaseAllowed: promotionGate?.releasePromotionAllowed === true,
        promotionEvidenceRequired: promotionGate?.requiredEvidence || [],
        promotionValidationCommands: promotionGate?.validationCommands || [],
        promotionBlockers: promotionGate?.blockers || [],
        promotionNextSafeAction: promotionGate?.nextSafeAction || "Collect missing promotion evidence before promotion.",
        realExecutionBlocked: true,
        externalMutationPerformed: false,
        credentialAccessPerformed: false,
        agentActions: quarter.primaryLanes.map((laneId) => ({
          laneId,
          action: laneAction(laneId, quarter)
        })),
        evidenceKind: "deterministic-plan-simulation",
        boundary: "local-demo-only"
      });
    }
  }

  const laneCoverage = (plan.lanes || []).map((lane) => ({
    id: lane.id,
    role: lane.role,
    defaultAuthority: lane.defaultAuthority,
    wipLimit: lane.wipLimit,
    recordedQuarterCount: records.filter((record) => record.primaryLanes.includes(lane.id)).length
  }));
  const versionTargets = buildVersionTargets(versionRegistry, promotionGates);
  const pluginIntegration = readJson(pluginIntegrationPath);
  const personalPluginLaneMatrix = buildPersonalPluginLaneMatrix(pluginIntegration, versionRegistry);

  return {
    id: "seis-sub-agent-five-year-demo-evidence",
    version: 1,
    status: "repo-local-demo-evidence",
    mode: "deterministic-plan-simulation",
    generatedAt: "deterministic-plan-derived",
    generatedBy: "scripts/create-sub-agent-five-year-demo-evidence.mjs",
    sourcePlan: planRelativePath,
    seisAiCoreVersionRegistry: versionRegistryRelativePath,
    seisAiCoreVersionPromotionGates: promotionGatesRelativePath,
    seisAgentPluginIntegration: pluginIntegrationRelativePath,
    seisAiCoreMcpRuntimeContract: mcpRuntimeContractRelativePath,
    seisAiCoreProviderRegistry: providerRegistryRelativePath,
    seisSubAgentPlanView: demoPlanViewRelativePath,
    demoSurface: "apps/seis-demo-web",
    demoBoundary: "local-demo-only",
    truthBoundary: "This report proves deterministic demo coverage of the documented five-year plan. It does not prove real five-year autonomous execution.",
    writerPolicy: plan.governance?.writerPolicy || "single-writer",
    defaultWriter: plan.governance?.defaultWriter || "codex",
    forbiddenAutonomy: plan.governance?.forbiddenAutonomy || [],
    validation: [
      "npm run check:seis-sub-agent-5-year-plan",
      "npm run check:seis-sub-agent-five-year-demo-evidence",
      "npm run check:seis-ai-core-version-registry",
      "npm run check:seis-ai-core-provider-registry",
      "npm run check:seis-ai-core-version-promotion-gates",
      "node --test packages/seis-ai/test/mcp-smoke.test.mjs",
      "npm run check:product-experience-browser-smoke"
    ],
    yearCount: (plan.years || []).length,
    quarterCount: records.length,
    recordedQuarterCount: records.length,
    completionPercent: records.length === 20 ? 100 : Math.round((records.length / 20) * 100),
    laneCount: (plan.lanes || []).length,
    laneCoverage,
    installedAiCoreRouteCount: installedAiCoreRoutes.length,
    installedAiCoreRoutes,
    personalPluginLaneCount: personalPluginLaneMatrix.length,
    personalPluginLaneMatrix,
    mcpRuntimeSurfaceCount: mcpRuntimeContract.surfaces.length,
    mcpRuntimeToolCount: mcpRuntimeContract.toolCount,
    mcpRuntimeResourceCount: mcpRuntimeContract.resourceCount,
    mcpRuntimePromptCount: mcpRuntimeContract.promptCount,
    mcpRuntimeContract,
    providerRegistry,
    providerRegistryProviderCount: Array.isArray(providerRegistry.providers) ? providerRegistry.providers.length : 0,
    providerRegistryRequiredForCoreCount: Array.isArray(providerRegistry.requiredForCore) ? providerRegistry.requiredForCore.length : 0,
    providerRegistryNoKeyProviderCount: Array.isArray(providerRegistry.noKeyProviders) ? providerRegistry.noKeyProviders.length : 0,
    versionTargetCount: versionTargets.length,
    promotionGateCount: (promotionGates.gates || []).length,
    dryRunOnly: promotionGates.runtimeBoundary?.dryRunOnly === true,
    releasePromotionAllowed: false,
    versionTargets,
    records
  };
}

function buildDemoPromotionMap(plan, versionRegistry, promotionGates) {
  const versionTargets = buildVersionTargets(versionRegistry, promotionGates);

  return {
    id: "seis-ai-core-version-promotion-map",
    version: 1,
    status: "generated-from-source",
    generatedAt: "deterministic-plan-derived",
    generatedBy: "scripts/create-sub-agent-five-year-demo-evidence.mjs",
    sourcePlan: planRelativePath,
    seisAiCoreVersionRegistry: versionRegistryRelativePath,
    seisAiCoreVersionPromotionGates: promotionGatesRelativePath,
    demoSurface: "apps/seis-demo-web",
    demoBoundary: plan.demoBoundary || "local-demo-only",
    truthBoundary: "Generated from SEIS AI Core registry and promotion gates for read-only Local Demo display; it does not authorize release, live providers, external mutation, SSH, deployment, or write-gated runtime.",
    yearCount: (plan.years || []).length,
    quarterCount: (plan.years || []).reduce((total, year) => total + (year.quarters || []).length, 0),
    versionTargetCount: versionTargets.length,
    promotionGateCount: (promotionGates.gates || []).length,
    dryRunOnly: promotionGates.runtimeBoundary?.dryRunOnly === true,
    releasePromotionAllowed: false,
    validation: [
      "npm run check:seis-ai-core-version-registry",
      "npm run check:seis-ai-core-provider-registry",
      "npm run check:seis-ai-core-version-promotion-gates",
      "npm run check:seis-sub-agent-5-year-plan",
      "npm run check:product-experience-browser-smoke"
    ],
    versionTargets
  };
}

function buildMarkdown(report) {
  const lines = [
    "# SEIS Sub-Agent Five-Year Demo Evidence",
    "",
    "## Purpose",
    "",
    "Provide a deterministic repository-local evidence artifact for the five-year sub-agent Local Demo.",
    "",
    "## Current Status",
    "",
    `- Status: ${report.status}`,
    `- Mode: ${report.mode}`,
    `- Boundary: ${report.demoBoundary}`,
    `- Recorded quarters: ${report.recordedQuarterCount}/${report.quarterCount}`,
    `- Completion: ${report.completionPercent}%`,
    `- AI Core version registry: ${report.seisAiCoreVersionRegistry}`,
    `- AI Core provider registry: ${report.seisAiCoreProviderRegistry}`,
    `- AI Core promotion gates: ${report.seisAiCoreVersionPromotionGates}`,
    `- SEIS-Agent plugin integration: ${report.seisAgentPluginIntegration}`,
    `- SEIS AI Core MCP runtime contract: ${report.seisAiCoreMcpRuntimeContract}`,
    `- Demo plan view: ${report.seisSubAgentPlanView}`,
    `- Installed AI Core routes: ${report.installedAiCoreRouteCount}`,
    `- Personal plugin lanes: ${report.personalPluginLaneCount}`,
    `- MCP runtime: ${report.mcpRuntimeToolCount} tools, ${report.mcpRuntimeResourceCount} resources, ${report.mcpRuntimePromptCount} prompts over ${report.mcpRuntimeContract.transport}`,
    `- Provider registry: ${report.providerRegistryProviderCount} providers, ${report.providerRegistryRequiredForCoreCount} required for core, ${report.providerRegistryNoKeyProviderCount} no-key profiles`,
    `- Release promotion allowed: ${report.releasePromotionAllowed}`,
    "",
    "This report does not prove real five-year autonomous execution, background agents, deploys, SSH execution, credential access, merges, or production writes.",
    "",
    "## Validation",
    "",
    ...report.validation.map((command) => `- \`${command}\``),
    "",
    "## Lane Coverage",
    "",
    "| Lane | Authority | Recorded Quarters |",
    "| --- | --- | --- |",
    ...report.laneCoverage.map((lane) => `| ${lane.id} | ${lane.defaultAuthority} | ${lane.recordedQuarterCount} |`),
    "",
    "## AI Core Version Promotion Map",
    "",
    "| Year | Version Target | Theme | Dry-Run Decision | Release Allowed | Next Safe Action |",
    "| --- | --- | --- | --- | --- | --- |",
    ...report.versionTargets.map((target) => `| ${target.year} | ${target.versionTarget} | ${target.theme} | ${target.promotionDryRunDecision} | ${target.releasePromotionAllowed} | ${target.nextSafeAction} |`),
    "",
    "## Installed AI Core Route Matrix",
    "",
    "| Installed AI | Version Target | Provider State | Route Mode | Sub-Agent Duty |",
    "| --- | --- | --- | --- | --- |",
    ...report.installedAiCoreRoutes.map((route) => `| ${route.systemName} | ${route.versionTargetId} | ${route.providerState} | ${route.routeMode} | ${route.subAgentDuty} |`),
    "",
    "## Personal SEIS Plugin Lane Matrix",
    "",
    "| Plugin | Embedded Lane | Version Target | Permission | Tool Pair | Gate |",
    "| --- | --- | --- | --- | --- | --- |",
    ...report.personalPluginLaneMatrix.map((lane) => `| ${lane.pluginId} | ${lane.displayName} | ${lane.versionTargetId} | ${lane.permissionLevel} | ${lane.statusTool} / ${lane.planTool} | ${lane.gate} |`),
    "",
    "## MCP Runtime Contract",
    "",
    "| Surface | State | Count | Duty |",
    "| --- | --- | --- | --- |",
    ...report.mcpRuntimeContract.surfaces.map((surface) => `| ${surface.label} | ${surface.state} | ${surface.count} | ${surface.duty} |`),
    "",
    `Runtime boundary: ${report.mcpRuntimeContract.credentialBoundary}`,
    "",
    "## Quarter Records",
    "",
    "| Quarter | Year | Version Target | Promotion Decision | Primary Lanes | Gates |",
    "| --- | --- | --- | --- | --- | --- |",
    ...report.records.map((record) => `| ${record.sourcePlanQuarter} | ${record.year} | ${record.aiCoreVersionTarget} | ${record.promotionDryRunDecision} | ${record.primaryLanes.join(", ")} | ${record.gates.join(", ")} |`),
    "",
    "## Next Safe Action",
    "",
    "Keep the browser Local Demo and this repository evidence report in sync before promoting any sub-agent workflow beyond dry-run or status-only behavior.",
    ""
  ];

  return `${lines.join("\n")}\n`;
}

function ensureCurrent(filePath, expected) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing generated evidence file: ${path.relative(root, filePath)}`);
  }
  const actual = fs.readFileSync(filePath, "utf8");
  if (actual !== expected) {
    throw new Error(`Generated evidence file is stale: ${path.relative(root, filePath)}`);
  }
}

const plan = readJson(planPath);
const versionRegistry = readJson(versionRegistryPath);
const promotionGates = readJson(promotionGatesPath);
const report = buildReport(plan, versionRegistry, promotionGates);
const demoPromotionMap = buildDemoPromotionMap(plan, versionRegistry, promotionGates);
const demoPlanView = buildDemoPlanView(plan);
const jsonOutput = stableJson(report);
const markdownOutput = buildMarkdown(report);
const demoPromotionMapOutput = stableJson(demoPromotionMap);
const demoPlanViewOutput = stableJson(demoPlanView);

if (checkOnly) {
  ensureCurrent(reportJsonPath, jsonOutput);
  ensureCurrent(reportMdPath, markdownOutput);
  ensureCurrent(demoPromotionMapPath, demoPromotionMapOutput);
  ensureCurrent(demoPlanViewPath, demoPlanViewOutput);
  console.log("SEIS sub-agent five-year demo evidence check passed.");
} else {
  fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
  fs.mkdirSync(path.dirname(demoPromotionMapPath), { recursive: true });
  fs.writeFileSync(reportJsonPath, jsonOutput);
  fs.writeFileSync(reportMdPath, markdownOutput);
  fs.writeFileSync(demoPromotionMapPath, demoPromotionMapOutput);
  fs.writeFileSync(demoPlanViewPath, demoPlanViewOutput);
  console.log(`Wrote ${path.relative(root, reportJsonPath)}`);
  console.log(`Wrote ${path.relative(root, reportMdPath)}`);
  console.log(`Wrote ${path.relative(root, demoPromotionMapPath)}`);
  console.log(`Wrote ${path.relative(root, demoPlanViewPath)}`);
}
