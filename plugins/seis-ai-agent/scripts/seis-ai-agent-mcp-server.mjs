#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const AGENT = {
  id: "seis-ai-agent",
  identity: "SEIS-Agent",
  profilePath: "assets/agent-profile.json",
  unifiedSuitePath: "assets/unified-suite.json",
  publicBundleSelectionGuidePath: "assets/public-bundle-selection-guide.json",
  skillPath: "skills/seis-ai-agent/SKILL.md",
};

const LANES = [
  {
    id: "seis-hub",
    label: "SEIS Hub",
    skillPath: "skills/seis-hub/SKILL.md",
    statusTool: "seis_hub_status",
    planTool: "seis_hub_plan",
    focus: "repository governance, architecture, documentation, migration safety, GitHub readiness, and source-of-truth discipline",
    defaultChecks: ["npm run check:open-source-governance", "npm run check:foundation"],
    steps: [
      "Inspect git status, branch, remote, and GitHub auth readiness.",
      "Read the nearest SEIS governance and repository context.",
      "Keep main as the canonical branch and preserve rollback evidence.",
      "Record durable decisions in repo docs, manifests, or generated reports.",
      "Validate governance, marketplace, and quality gates before handoff.",
    ],
  },
  {
    id: "seis-governance",
    label: "SEIS Governance",
    skillPath: "skills/seis-governance/SKILL.md",
    profilePath: "assets/lanes/seis-governance.json",
    statusTool: "seis_governance_status",
    planTool: "seis_governance_plan",
    focus: "branch discipline, repo governance policy, release readiness, identity and marketplace evidence, and long-running operating contracts.",
    defaultChecks: [
      "npm run check:open-source-governance",
      "npm run check:foundation",
      "npm run check:seis-operating-identities",
      "npm run check:seis-repo-marketplace",
    ],
    steps: [
      "Verify main-branch discipline, git status, remote freshness, and active GitHub identity/permissions.",
      "Confirm repo marketplace and installed plugin inventory match consolidation policy.",
      "Validate operating identities and lane policy before modifying any release-facing artifact.",
      "Collect evidence paths and keep the same evidence trail for every release gating action.",
      "Only propose apply-only actions after explicit user confirmation.",
    ],
  },
  {
    id: "seis-cloud",
    label: "SEIS Cloud",
    skillPath: "skills/seis-cloud/SKILL.md",
    profilePath: "assets/lanes/seis-cloud.json",
    statusTool: "seis_cloud_status",
    planTool: "seis_cloud_plan",
    focus: "public cloud readiness, team/workplace VPN cloud, server targets, provider preflight, secrets hygiene, and rollback",
    defaultChecks: ["npm run check:cloud-access-policy", "npm run check:cloud-environment", "npm run check:server-target"],
    steps: [
      "Classify the access audience as public cloud or team/workplace VPN cloud.",
      "Verify provider assumptions, authentication state, target URL, secrets, and rollback owner without exposing secret values.",
      "Prefer plan/preflight commands before provider-specific mutation.",
      "Keep apply/deploy commands behind explicit user confirmation.",
      "Validate cloud reports, server targets, access policy, and rollback notes.",
    ],
  },
  {
    id: "seis-code",
    label: "SEIS-Code",
    skillPath: "skills/seis-code/SKILL.md",
    profilePath: "assets/lanes/seis-code.json",
    statusTool: "seis_code_status",
    planTool: "seis_code_plan",
    focus: "architecture-aware implementation, refactors, tests, CI, MCP/plugin engineering, Apple-first packages, and repo automation",
    defaultChecks: ["npm run seis:check", "npm run check:seis-ai-agent", "npm run check:seis-platform-kernel"],
    steps: [
      "Inspect repo safety before edits.",
      "Read local context, package manifests, scripts, tests, and nearby docs.",
      "Map the affected code lane and make the smallest durable change.",
      "Validate with the lightest reliable checks, then scale by risk.",
      "Keep generated files synchronized with their source scripts.",
    ],
  },
  {
    id: "seis-design",
    label: "SEIS-Design",
    skillPath: "skills/seis-design/SKILL.md",
    profilePath: "assets/lanes/seis-design.json",
    statusTool: "seis_design_status",
    planTool: "seis_design_plan",
    focus: "product design, UI/UX architecture, design systems, accessibility, calm motion, responsive ergonomics, and visual QA",
    defaultChecks: ["npm run check:motion-evidence", "npm run check:mobile-ergonomics", "npm run check:web"],
    steps: [
      "Read the current product or docs surface before proposing UI changes.",
      "Identify the audience, workflow, accessibility needs, and target platform.",
      "Reuse existing tokens, components, routes, and interaction patterns.",
      "Validate rendered surfaces with screenshots when a runnable UI exists.",
      "Document durable design-system decisions when they affect reusable patterns.",
    ],
  },
  {
    id: "seis-data",
    label: "SEIS-DATA",
    skillPath: "skills/seis-data/SKILL.md",
    profilePath: "assets/lanes/seis-data.json",
    statusTool: "seis_data_status",
    planTool: "seis_data_plan",
    focus: "data architecture, analytics, generated reports, schema design, knowledge registries, memory/RAG planning, provenance, and safe data handling",
    defaultChecks: ["npm run check:plugin-capability-lanes", "npm run check:seis-technology-stack", "npm run check:language-distribution"],
    steps: [
      "Classify the data surface and check sensitivity before reading or transforming.",
      "Find the source of truth and generator before editing records.",
      "Use structured parsers and deterministic ordering.",
      "Regenerate paired JSON/Markdown reports when source records change.",
      "Validate schema, parity, privacy, provenance, and generated report checks.",
    ],
  },
  {
    id: "seis-security",
    label: "SEIS Security",
    skillPath: "skills/seis-security/SKILL.md",
    profilePath: "assets/lanes/seis-security.json",
    statusTool: "seis_security_status",
    planTool: "seis_security_plan",
    focus: "threat modeling, secret-safety review, dependency and permission risk, CI/security gates, cloud access safety, SSH/VPN hardening, and release-blocking security checks",
    defaultChecks: [
      "npm run check:seis-ai-agent",
      "npm run check:seis-agent-plugin-integration",
      "npm run check:cloud-access-policy",
      "npm run check:ssh-hardening-contract",
    ],
    steps: [
      "Identify the security surface: secrets, dependency risk, access control, cloud target, SSH/VPN, plugin permission, CI gate, or release.",
      "Read the nearest SECURITY, deployment, governance, manifest, and check-script sources before editing.",
      "Check for secret leakage without printing secret values.",
      "Prefer least privilege, explicit approval gates, reversible changes, and narrow tool scope.",
      "Report pass, blocked, or unverified status with evidence and validation gaps.",
    ],
  },
  {
    id: "seis-research",
    label: "SEIS Research",
    skillPath: "skills/seis-research/SKILL.md",
    profilePath: "assets/lanes/seis-research.json",
    statusTool: "seis_research_status",
    planTool: "seis_research_plan",
    focus: "evidence-led technical research, source evaluation, product and architecture discovery, official documentation review, standards/version checks, and research-to-decision synthesis",
    defaultChecks: [
      "npm run check:seis-ai-agent",
      "npm run check:seis-agent-plugin-integration",
      "npm run check:seis-governance-index",
    ],
    steps: [
      "Define the decision question, affected SEIS surface, and required evidence level.",
      "Prefer primary sources, official documentation, standards, release notes, and repository-owned records.",
      "Verify version, date, compatibility, licensing, security, and maintenance status when they matter.",
      "Separate facts from inference and mark stale, partial, or gated evidence.",
      "Turn research into a decision, recommendation, or scoped next action with source provenance.",
    ],
  },
  {
    id: "seis-automation",
    label: "SEIS Automation",
    skillPath: "skills/seis-automation/SKILL.md",
    profilePath: "assets/lanes/seis-automation.json",
    statusTool: "seis_automation_status",
    planTool: "seis_automation_plan",
    focus: "repeatable workflows, scripts, checks, scheduled jobs, runbooks, CI steps, agent loops, and human-approved automation gates",
    defaultChecks: [
      "npm run check:seis-ai-agent",
      "npm run check:seis-agent-plugin-integration",
      "npm run check:seis-command-center",
      "npm run check:seis-god-mode-validation-plan",
    ],
    steps: [
      "Classify the automation target: check, generator, CI step, runbook, scheduled job, agent loop, or integration helper.",
      "Define inputs, outputs, owner, execution mode, rollback, failure behavior, and validation command.",
      "Reuse existing scripts and repo conventions before introducing a new workflow.",
      "Make automation deterministic and idempotent where practical, with dry-run or plan mode for mutating actions.",
      "Document the workflow and validate syntax plus one representative execution path.",
    ],
  },
  {
    id: "seis-product",
    label: "SEIS Product",
    skillPath: "skills/seis-product/SKILL.md",
    profilePath: "assets/lanes/seis-product.json",
    statusTool: "seis_product_status",
    planTool: "seis_product_plan",
    focus: "scoped product requirements, roadmap slices, acceptance criteria, UX outcomes, launch readiness, open-source positioning, and validation-backed delivery plans",
    defaultChecks: [
      "npm run check:seis-ai-agent",
      "npm run check:seis-agent-plugin-integration",
      "npm run check:seis-governance-index",
      "npm run check:seis-god-mode-work-package",
    ],
    steps: [
      "Define the target user, job, product surface, and measurable outcome.",
      "Turn the request into a bounded slice with acceptance criteria, non-goals, dependencies, and rollback notes.",
      "Map ownership across SEIS-Agent, Cloud, Code, Design, Data, Security, Research, and Automation lanes.",
      "Keep launch, open-source, and app-readiness claims evidence-backed.",
      "Document the next product decision or delivery artifact in the relevant SEIS docs or manifest.",
    ],
  },
];

const PUBLIC_MARKETPLACE_PLUGIN = "seis-ai-agent";
const CURATED_MARKETPLACE = Object.freeze({
  publicCardCount: 34,
  canonicalCardCount: 1,
  optionalBundleCardCount: 33,
  maximumBundleSize: 15,
});
const JOURNEY_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,64}$/;
const EMBEDDED_SOURCE_MODULES = [
  "seis-ai-agent",
  "seis",
  "seis-cloud",
  "seis-code",
  "seis-design",
  "seis-data",
  "seis-security",
  "seis-research",
  "seis-automation",
  "seis-product",
];

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
let pending = Buffer.alloc(0);

const tools = [
  {
    name: "seis_ai_agent_status",
    description: "Report SEIS-Agent readiness across identities, marketplace, cloud, code, design, data, memory, context, and install surfaces.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "seis_ai_agent_plan",
    description: "Create a lane-aware SEIS-Agent plan for an engineering, cloud, design, data, memory, context, MCP, skill, plugin, or governance request.",
    inputSchema: {
      type: "object",
      required: ["request"],
      properties: {
        request: { type: "string", description: "SEIS-Agent request to plan." },
      },
    },
  },
  {
    name: "seis_agent_lanes",
    description: "List every embedded SEIS-Agent lane and its skill/profile readiness inside the single plugin.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "seis_public_bundle_guide",
    description: "Show the bounded public SEIS starter paths and journey map without installing packages or accessing external services.",
    inputSchema: { type: "object", additionalProperties: false, properties: {} },
  },
  {
    name: "seis_public_bundle_recommend",
    description: "Recommend the one initial optional SEIS bundle for a known public journey; no bundle is installed automatically.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["journeyId"],
      properties: {
        journeyId: { type: "string", pattern: "^[a-z0-9][a-z0-9-]{0,64}$", description: "A journey id returned by seis_public_bundle_guide." },
      },
    },
  },
  ...LANES.flatMap((lane) => [
    {
      name: lane.statusTool,
      description: `Report ${lane.label} readiness inside the unified SEIS-Agent plugin.`,
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: lane.planTool,
      description: `Create a ${lane.label} plan through the unified SEIS-Agent plugin.`,
      inputSchema: {
        type: "object",
        required: ["request"],
        properties: {
          request: { type: "string", description: `${lane.label} request to plan.` },
        },
      },
    },
  ]),
];

function pluginRoot() {
  return path.resolve(process.env.SEIS_AI_AGENT_PLUGIN_ROOT || path.join(scriptDir, ".."));
}

function repoRoot() {
  const candidates = [
    process.env.SEIS_ROOT,
    process.env.SEIS_REPO_ROOT,
    path.resolve(scriptDir, "..", "..", ".."),
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(path.join(candidate, "package.json"))) || null;
}

function plainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function validBundleReference(value) {
  return plainObject(value)
    && typeof value.id === "string"
    && /^seis-(application|topic)-bundle-\d{2}$/.test(value.id)
    && typeof value.displayName === "string"
    && value.displayName.length > 0
    && value.installId === `${value.id}@seis-repo`
    && Number.isInteger(value.memberCount)
    && value.memberCount > 0
    && value.memberCount <= CURATED_MARKETPLACE.maximumBundleSize
    && Number.isInteger(value.journeyPart)
    && Number.isInteger(value.journeyPartCount)
    && value.journeyPart > 0
    && value.journeyPart <= value.journeyPartCount;
}

function validSelectionGuide(value) {
  if (!plainObject(value)
    || value.schemaVersion !== 1
    || value.id !== "seis-public-plugin-selection-guide"
    || value.canonicalInstall !== "seis-ai-agent@seis-repo"
    || !plainObject(value.marketplace)
    || value.marketplace.publicCardCount !== CURATED_MARKETPLACE.publicCardCount
    || value.marketplace.canonicalCardCount !== CURATED_MARKETPLACE.canonicalCardCount
    || value.marketplace.optionalBundleCardCount !== CURATED_MARKETPLACE.optionalBundleCardCount
    || value.marketplace.maximumBundleSize !== CURATED_MARKETPLACE.maximumBundleSize
    || !plainObject(value.selectionBoundary)
    || value.selectionBoundary.maximumOptionalBundleSelectionsPerTask !== 1
    || value.selectionBoundary.bulkInstallAllowed !== false
    || value.selectionBoundary.bundleMembersAutoInstalled !== false
    || value.selectionBoundary.sourcePackagesRetained !== true
    || !Array.isArray(value.defaultWorkflow)
    || value.defaultWorkflow.length !== 4
    || !Array.isArray(value.starterPaths)
    || value.starterPaths.length !== 6
    || !Array.isArray(value.journeys)
    || value.journeys.length !== 19) return false;
  const journeysById = new Map();
  const bundleIds = new Set();
  for (const journey of value.journeys) {
    if (!plainObject(journey)
      || typeof journey.id !== "string"
      || !JOURNEY_ID_PATTERN.test(journey.id)
      || journeysById.has(journey.id)
      || typeof journey.label !== "string"
      || journey.label.length === 0
      || !["application", "topic"].includes(journey.family)
      || !Number.isInteger(journey.bundleCount)
      || journey.bundleCount <= 0
      || !Number.isInteger(journey.sourceCapabilityCount)
      || journey.sourceCapabilityCount <= 0
      || !validBundleReference(journey.initialBundle)
      || !Array.isArray(journey.continuationBundleIds)
      || !Array.isArray(journey.bundleIds)
      || journey.bundleIds.length !== journey.bundleCount
      || journey.bundleIds[0] !== journey.initialBundle.id
      || journey.initialBundle.journeyPart !== 1
      || journey.initialBundle.journeyPartCount !== journey.bundleCount
      || (journey.family === "application" && !journey.initialBundle.id.startsWith("seis-application-bundle-"))
      || (journey.family === "topic" && !journey.initialBundle.id.startsWith("seis-topic-bundle-"))
      || journey.continuationBundleIds.length !== journey.bundleCount - 1
      || !journey.bundleIds.every((id) => typeof id === "string" && /^seis-(application|topic)-bundle-\d{2}$/.test(id))
      || !journey.continuationBundleIds.every((id, index) => id === journey.bundleIds[index + 1])) return false;
    journeysById.set(journey.id, journey);
    for (const id of journey.bundleIds) {
      if (bundleIds.has(id)) return false;
      bundleIds.add(id);
    }
  }
  if (bundleIds.size !== CURATED_MARKETPLACE.optionalBundleCardCount) return false;
  const starterIds = new Set();
  for (const starter of value.starterPaths) {
    const journey = journeysById.get(starter?.journeyId);
    if (!plainObject(starter)
      || typeof starter.journeyId !== "string"
      || !journey
      || starterIds.has(starter.journeyId)
      || starter.journeyLabel !== journey.label
      || typeof starter.intent !== "string"
      || starter.intent.length === 0
      || !validBundleReference(starter.initialBundle)
      || starter.initialBundle.id !== journey.initialBundle.id
      || starter.initialBundle.installId !== journey.initialBundle.installId) return false;
    starterIds.add(starter.journeyId);
  }
  return true;
}

function publicBundleSelectionGuide() {
  const guide = readJson(path.join(pluginRoot(), AGENT.publicBundleSelectionGuidePath));
  return validSelectionGuide(guide) ? guide : null;
}

function curatedMarketplaceStatus(marketplace) {
  const entries = Array.isArray(marketplace?.plugins) ? marketplace.plugins : [];
  const canonicalEntries = entries.filter((entry) => entry?.name === PUBLIC_MARKETPLACE_PLUGIN);
  const bundleEntries = entries.filter((entry) => entry?.source?.path?.startsWith("./plugins/seis-bundles/"));
  const unknownEntries = entries.filter((entry) => entry?.name !== PUBLIC_MARKETPLACE_PLUGIN && !bundleEntries.includes(entry));
  const bundleIds = bundleEntries.map((entry) => entry?.name);
  const canonicalReady = canonicalEntries.length === CURATED_MARKETPLACE.canonicalCardCount
    && canonicalEntries[0]?.source?.path === `./plugins/${PUBLIC_MARKETPLACE_PLUGIN}`
    && canonicalEntries[0]?.policy?.installation === "AVAILABLE"
    && canonicalEntries[0]?.policy?.authentication === "ON_INSTALL";
  const bundlesReady = bundleEntries.length === CURATED_MARKETPLACE.optionalBundleCardCount
    && bundleIds.every((id) => typeof id === "string" && /^seis-(application|topic)-bundle-\d{2}$/.test(id))
    && new Set(bundleIds).size === bundleIds.length
    && bundleEntries.every((entry) => entry?.source?.path === `./plugins/seis-bundles/${entry.name}`
      && entry?.policy?.installation === "AVAILABLE"
      && entry?.policy?.authentication === "ON_INSTALL");
  const ready = entries.length === CURATED_MARKETPLACE.publicCardCount
    && canonicalReady
    && bundlesReady
    && unknownEntries.length === 0;
  return {
    status: ready ? "ready" : "partial",
    publicCardCount: entries.length,
    canonicalCardCount: canonicalEntries.length,
    optionalBundleCardCount: bundleEntries.length,
    unknownCardCount: unknownEntries.length,
    defaultInstall: "seis-ai-agent@seis-repo",
    maximumOptionalBundleSelectionsPerTask: 1,
    bulkInstallAllowed: false,
  };
}

function status() {
  const root = pluginRoot();
  const repo = repoRoot();
  const manifest = readJson(path.join(root, ".codex-plugin", "plugin.json"));
  const profile = readJson(path.join(root, AGENT.profilePath));
  const unifiedSuite = readJson(path.join(root, AGENT.unifiedSuitePath));
  const identities = repo ? readJson(path.join(repo, "data", "seis-operating-identities.json")) : null;
  const marketplace = repo ? readJson(path.join(repo, ".agents", "plugins", "marketplace.json")) : null;
  const selectionGuide = publicBundleSelectionGuide();
  const curatedMarketplace = curatedMarketplaceStatus(marketplace);
  const laneReadiness = Object.fromEntries(LANES.map((lane) => [lane.id, laneStatus(lane).status === "ready"]));
  const readiness = {
    profile: Boolean(profile),
    skill: fs.existsSync(path.join(root, AGENT.skillPath)),
    mcpManifest: fs.existsSync(path.join(root, ".mcp.json")),
    mcpServer: fs.existsSync(path.join(root, "scripts", "seis-ai-agent-mcp-server.mjs")),
    unifiedSuite: Boolean(
      unifiedSuite?.status === "active-single-public-plugin" &&
        unifiedSuite?.canonicalInstall?.installId === "seis-ai-agent@seis-repo" &&
        unifiedSuite?.componentCount >= EMBEDDED_SOURCE_MODULES.length &&
        unifiedSuite?.publicDistribution?.publicPluginCount === 1 &&
        unifiedSuite?.publicDistribution?.embeddedModuleCount >= EMBEDDED_SOURCE_MODULES.length
    ),
    operatingIdentities: Boolean((identities?.identities || []).find((item) => item.name === AGENT.identity)),
    marketplace: curatedMarketplace.status === "ready",
    publicBundleSelectionGuide: Boolean(selectionGuide),
    installer: repo ? fs.existsSync(path.join(repo, "scripts", "install-seis-ai-agent.mjs")) : false,
    embeddedLanes: Object.values(laneReadiness).every(Boolean),
  };

  return {
    status: Object.values(readiness).every(Boolean) ? "ready" : "partial",
    agent: AGENT.id,
    identity: AGENT.identity,
    version: manifest?.version || null,
    pluginRoot: root,
    repoRoot: repo,
    readiness,
    laneReadiness,
    curatedMarketplace,
    publicBundleSelectionGuide: selectionGuide
      ? {
          status: selectionGuide.status,
          starterPathCount: selectionGuide.starterPaths.length,
          journeyCount: selectionGuide.journeys.length,
          maximumOptionalBundleSelectionsPerTask: selectionGuide.selectionBoundary.maximumOptionalBundleSelectionsPerTask,
          bulkInstallAllowed: selectionGuide.selectionBoundary.bulkInstallAllowed,
        }
      : null,
    profile,
    unifiedSuite: unifiedSuite
      ? {
          status: unifiedSuite.status,
          releaseVersion: unifiedSuite.releaseVersion,
          canonicalInstallId: unifiedSuite.canonicalInstall?.installId ?? null,
          defaultInstallMode: unifiedSuite.canonicalInstall?.defaultInstallMode ?? null,
          componentCount: unifiedSuite.componentCount ?? null,
          publicPluginCount: unifiedSuite.publicDistribution?.publicPluginCount ?? null,
          embeddedModuleCount: unifiedSuite.publicDistribution?.embeddedModuleCount ?? null,
          legacyAliasCount: unifiedSuite.compatibility?.legacyAliasCount ?? null,
          standaloneLaneInstallMode: unifiedSuite.compatibility?.standaloneLaneInstallMode ?? null,
          personalMarketplaceMutation: unifiedSuite.compatibility?.personalMarketplaceMutation === true,
        }
      : null,
    operatingIdentities: identities?.identities?.map((item) => item.name) || [],
  };
}

function laneStatus(lane) {
  const root = pluginRoot();
  const skill = fs.existsSync(path.join(root, lane.skillPath));
  const profile = lane.profilePath ? readJson(path.join(root, lane.profilePath)) : null;
  const profileReady = lane.profilePath ? Boolean(profile) : true;
  return {
    id: lane.id,
    label: lane.label,
    status: skill && profileReady ? "ready" : "partial",
    skillPath: lane.skillPath,
    profilePath: lane.profilePath || null,
    focus: lane.focus,
    tools: [lane.statusTool, lane.planTool],
    defaultChecks: profile?.qualityCommands || lane.defaultChecks,
    profile,
  };
}

function lanesStatus() {
  const lanes = LANES.map(laneStatus);
  return {
    status: lanes.every((lane) => lane.status === "ready") ? "ready" : "partial",
    agent: AGENT.id,
    identity: AGENT.identity,
    laneCount: lanes.length,
    lanes,
  };
}

function publicBundleGuide() {
  const guide = publicBundleSelectionGuide();
  if (!guide) return { error: { code: -32603, message: "Public bundle selection guide is unavailable or unsafe." } };
  return {
    status: "ready",
    agent: AGENT.id,
    canonicalInstall: guide.canonicalInstall,
    marketplace: guide.marketplace,
    selectionBoundary: guide.selectionBoundary,
    defaultWorkflow: guide.defaultWorkflow,
    starterPaths: guide.starterPaths,
    journeys: guide.journeys,
    permissions: guide.permissions,
  };
}

function publicBundleRecommendation(input) {
  const journeyId = typeof input?.journeyId === "string" ? input.journeyId.trim() : "";
  if (!JOURNEY_ID_PATTERN.test(journeyId)) {
    return { error: { code: -32602, message: "Invalid params: journeyId must be a known public selection journey." } };
  }
  const guide = publicBundleSelectionGuide();
  if (!guide) return { error: { code: -32603, message: "Public bundle selection guide is unavailable or unsafe." } };
  const journey = guide.journeys.find((candidate) => candidate.id === journeyId);
  if (!journey) {
    return { error: { code: -32602, message: "Invalid params: journeyId must be a known public selection journey." } };
  }
  return {
    status: "ready",
    agent: AGENT.id,
    canonicalInstall: guide.canonicalInstall,
    journey: {
      id: journey.id,
      label: journey.label,
      family: journey.family,
      sourceCapabilityCount: journey.sourceCapabilityCount,
    },
    recommendedOptionalBundle: journey.initialBundle,
    continuationBundleIds: journey.continuationBundleIds,
    selectionBoundary: {
      maximumOptionalBundleSelectionsPerTask: guide.selectionBoundary.maximumOptionalBundleSelectionsPerTask,
      bulkInstallAllowed: guide.selectionBoundary.bulkInstallAllowed,
      bundleMembersAutoInstalled: guide.selectionBoundary.bundleMembersAutoInstalled,
      sourcePackagesRetained: guide.selectionBoundary.sourcePackagesRetained,
    },
    nextSteps: [
      "Start with SEIS-Agent as the canonical public entry point.",
      `Use ${journey.initialBundle.installId} only if this journey directly matches the current task.`,
      "Do not bulk-install bundles or members; scope a later continuation bundle as a separate task.",
      "Require explicit human approval for writes, deployment, credentials, destructive actions, or publication.",
    ],
  };
}

function lanePlan(lane, input) {
  if (typeof input?.request !== "string" || !input.request.trim()) {
    return { error: { code: -32602, message: "Invalid params: request is required." } };
  }
  const current = laneStatus(lane);
  return {
    agent: AGENT.id,
    identity: AGENT.identity,
    lane: lane.id,
    label: lane.label,
    request: input.request,
    focus: lane.focus,
    steps: lane.steps,
    defaultChecks: current.defaultChecks,
    readiness: {
      status: current.status,
      skillPath: current.skillPath,
      profilePath: current.profilePath,
    },
  };
}

function plan(input) {
  if (typeof input?.request !== "string" || !input.request.trim()) {
    return { error: { code: -32602, message: "Invalid params: request is required." } };
  }
  return {
    agent: AGENT.id,
    identity: AGENT.identity,
    request: input.request,
    lanes: [
      "SEIS: repository governance, architecture, documentation, quality, and source-of-truth discipline.",
      "SEIS-Agent: unified orchestration across MCP, skills, plugins, automation, memory, context, and delivery.",
      "SEIS-Cloud: public cloud for everyone; SSH/WireGuard VPN cloud for approved workplaces and teams.",
      "SEIS-Code: implementation, tests, CI, MCP/plugin code, and repo automation.",
      "SEIS-Design: premium, minimal, cinematic, accessible, responsive product and design-system work.",
      "SEIS-Data: memory, context systems, analytics, reports, source intake, and provenance.",
      "SEIS Security: threat, secrets, access, cloud safety, SSH/VPN hardening, and release-risk review.",
      "SEIS Research: source evaluation, official documentation, version checks, and evidence-led decisions.",
      "SEIS Automation: repeatable scripts, checks, CI steps, runbooks, and human-approved agent loops.",
      "SEIS Product: roadmap slices, acceptance criteria, launch readiness, and product scope.",
    ],
    steps: [
      "Confirm the request belongs under the SEIS ecosystem objective.",
      "Inspect repository status, branch, remotes, and affected generated reports.",
      "Map ownership to the smallest useful SEIS identity or lane.",
      "Create durable repo artifacts instead of prose-only decisions.",
      "Keep cloud, SSH, repository visibility, and source-intake work plan-first until explicit apply approval.",
      "Validate targeted checks, generated reports, and npm run quality before handoff.",
    ],
    embeddedTools: tools.map((tool) => tool.name),
    defaultChecks: status().profile?.qualityCommands || [],
  };
}

function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") {
    send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: AGENT.identity, version: agentVersion(pluginRoot()) } } });
    return;
  }
  if (message.method === "tools/list") {
    send({ jsonrpc: "2.0", id: message.id, result: { tools } });
    return;
  }
  if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const lane = LANES.find((candidate) => candidate.statusTool === name || candidate.planTool === name);
    const result = name === "seis_ai_agent_status"
      ? status()
      : name === "seis_ai_agent_plan"
        ? plan(args)
        : name === "seis_agent_lanes"
          ? lanesStatus()
          : name === "seis_public_bundle_guide"
            ? publicBundleGuide()
            : name === "seis_public_bundle_recommend"
              ? publicBundleRecommendation(args)
          : lane?.statusTool === name
            ? laneStatus(lane)
            : lane?.planTool === name
              ? lanePlan(lane, args)
              : null;
    if (result?.error) {
      send({ jsonrpc: "2.0", id: message.id, error: result.error });
      return;
    }
    if (result) {
      send({ jsonrpc: "2.0", id: message.id, result });
      return;
    }
    send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: `Unknown tool: ${name || "undefined"}` } });
  }
}

function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`);
}

function readJson(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function agentVersion(root) {
  return readJson(path.join(root, ".codex-plugin", "plugin.json"))?.version || "unknown";
}

function parseBody(bodyBuffer) {
  try {
    return JSON.parse(bodyBuffer.toString("utf8"));
  } catch {
    return null;
  }
}

function pump() {
  while (true) {
    const separatorIndex = pending.indexOf("\r\n\r\n");
    if (separatorIndex < 0) return;
    const header = pending.slice(0, separatorIndex).toString("utf8");
    const match = /Content-Length:\s*(\d+)/i.exec(header);
    if (!match) {
      pending = pending.slice(separatorIndex + 4);
      continue;
    }
    const start = separatorIndex + 4;
    const end = start + Number(match[1]);
    if (pending.length < end) return;
    const body = parseBody(pending.slice(start, end));
    pending = pending.slice(end);
    handle(body);
  }
}

process.stdin.on("data", (chunk) => {
  pending = Buffer.concat([pending, Buffer.from(chunk)]);
  pump();
});

process.stdin.on("end", () => process.exit(0));
