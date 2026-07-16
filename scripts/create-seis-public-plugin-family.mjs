#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const checkMode = process.argv.includes("--check");
const GENERATED_AT = "2026-07-12";
const UNIFIED_RELEASE_VERSION = "0.3.0+codex.20260712";

const publicPlugins = [
  {
    name: "seis-ai-agent",
    displayName: "SEIS-Agent",
    role: "orchestrator",
    category: "Developer",
    sourcePath: "./plugins/seis-ai-agent",
    validation: "python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-ai-agent",
  },
  {
    name: "seis",
    displayName: "SEIS",
    role: "governance",
    category: "Developer",
    sourcePath: "./plugins/seis",
    validation: "python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis",
  },
  {
    name: "seis-cloud",
    displayName: "SEIS Cloud",
    role: "cloud",
    category: "Developer",
    sourcePath: "./plugins/seis-cloud",
    validation: "python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-cloud",
  },
  {
    name: "seis-code",
    displayName: "SEIS-Code",
    role: "code",
    category: "Developer",
    sourcePath: "./plugins/seis-code",
    validation: "python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-code",
  },
  {
    name: "seis-design",
    displayName: "SEIS-Design",
    role: "design",
    category: "Design",
    sourcePath: "./plugins/seis-design",
    validation: "python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-design",
  },
  {
    name: "seis-data",
    displayName: "SEIS-DATA",
    role: "data",
    category: "Data",
    sourcePath: "./plugins/seis-data",
    validation: "python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-data",
  },
  {
    name: "seis-security",
    displayName: "SEIS Security",
    role: "security",
    category: "Security",
    sourcePath: "./plugins/seis-security",
    validation: "python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-security",
    materialize: true,
    shortDescription: "Security, secrets, and release-risk lane.",
    longDescription: "SEIS Security gives Codex a public SEIS plugin lane for threat modeling, secret-safety review, dependency and permission risk, CI/security gates, cloud access safety, SSH/VPN hardening, and release-blocking security checks under SEIS-Agent governance.",
    manifestCategory: "Security",
    brandColor: "#DC2626",
    keywords: ["seis", "security", "threat-modeling", "secrets", "codex", "mcp"],
    capabilities: [
      "Threat modeling",
      "Secret-safety review",
      "Dependency and permission risk",
      "Cloud and SSH access safety",
      "Release security gates",
      "Rollback security review",
    ],
    defaultPrompt: [
      "Use SEIS Security to review this release risk.",
      "Check this SEIS change for secrets and access risk.",
      "Plan security validation for this SEIS workflow.",
    ],
    planSteps: [
      "Inspect git status, branch, remotes, and the affected security surface.",
      "Read SECURITY.md, deployment docs, plugin manifests, and relevant check scripts.",
      "Check secret, permission, dependency, cloud, SSH/VPN, and release risk without printing secret values.",
      "Prefer least privilege, explicit approval gates, reversible changes, and narrow tool scope.",
      "Validate with security, cloud access, SSH hardening, and plugin integration checks before handoff.",
    ],
  },
  {
    name: "seis-research",
    displayName: "SEIS Research",
    role: "research",
    category: "Research",
    sourcePath: "./plugins/seis-research",
    validation: "python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-research",
    materialize: true,
    shortDescription: "Evidence-led SEIS research lane.",
    longDescription: "SEIS Research gives Codex a public SEIS plugin lane for official-source research, standards and version checks, source evaluation, product and architecture discovery, ecosystem analysis, and research-to-decision synthesis under SEIS-Agent governance.",
    manifestCategory: "Research",
    brandColor: "#9333EA",
    keywords: ["seis", "research", "evidence", "documentation", "codex", "mcp"],
    capabilities: [
      "Official-source research",
      "Standards and version checks",
      "Source evaluation",
      "Architecture discovery",
      "Research-to-decision synthesis",
      "Provenance review",
    ],
    defaultPrompt: [
      "Use SEIS Research to verify this decision.",
      "Find official source context for this SEIS change.",
      "Turn this research into a SEIS decision record.",
    ],
    planSteps: [
      "Define the decision question, affected SEIS surface, and evidence level.",
      "Prefer official docs, standards, release notes, and source repositories.",
      "Verify version, date, compatibility, licensing, security, and maintenance status when relevant.",
      "Separate observed facts from inference, recommendation, and stale or partial evidence.",
      "Record provenance in docs, reports, or decision artifacts before implementation.",
    ],
  },
  {
    name: "seis-automation",
    displayName: "SEIS Automation",
    role: "automation",
    category: "Developer",
    sourcePath: "./plugins/seis-automation",
    validation: "python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-automation",
    materialize: true,
    shortDescription: "Repeatable SEIS workflow lane.",
    longDescription: "SEIS Automation gives Codex a public SEIS plugin lane for repeatable scripts, checks, generators, scheduled jobs, CI steps, runbooks, agent loops, and human-approved automation gates under SEIS-Agent governance.",
    manifestCategory: "Developer Tools",
    brandColor: "#F59E0B",
    keywords: ["seis", "automation", "ci", "runbooks", "codex", "mcp"],
    capabilities: [
      "Repeatable workflow design",
      "Script and check planning",
      "CI and runbook scaffolding",
      "Dry-run automation gates",
      "Agent loop planning",
      "Validation reporting",
    ],
    defaultPrompt: [
      "Use SEIS Automation to make this workflow repeatable.",
      "Plan a dry-run automation gate for this SEIS task.",
      "Document the inputs and validation for this script.",
    ],
    planSteps: [
      "Classify the automation as a script, check, generator, CI step, runbook, scheduled job, or agent loop.",
      "Define inputs, outputs, owner, rollback path, failure behavior, and validation command.",
      "Reuse existing scripts and package commands before adding a new workflow.",
      "Default mutating automation to plan-only or dry-run mode.",
      "Validate syntax and one representative execution path before handoff.",
    ],
  },
  {
    name: "seis-product",
    displayName: "SEIS Product",
    role: "product",
    category: "Productivity",
    sourcePath: "./plugins/seis-product",
    validation: "python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-product",
    materialize: true,
    shortDescription: "Product scope and launch-readiness lane.",
    longDescription: "SEIS Product gives Codex a public SEIS plugin lane for product requirements, roadmap slices, acceptance criteria, UX outcomes, launch readiness, open-source positioning, prioritization, and validation-backed delivery plans under SEIS-Agent governance.",
    manifestCategory: "Productivity",
    brandColor: "#0F766E",
    keywords: ["seis", "product", "roadmap", "launch", "codex", "mcp"],
    capabilities: [
      "Product requirements",
      "Roadmap slice planning",
      "Acceptance criteria",
      "Launch-readiness scope",
      "Open-source positioning",
      "Validation-backed delivery plans",
    ],
    defaultPrompt: [
      "Use SEIS Product to scope this roadmap slice.",
      "Turn this SEIS idea into acceptance criteria.",
      "Review launch readiness for this product surface.",
    ],
    planSteps: [
      "Define the target user, job, product surface, and measurable outcome.",
      "Convert the idea into a bounded slice with acceptance criteria and non-goals.",
      "Map ownership across SEIS-Agent, Cloud, Code, Design, Data, Security, Research, and Automation.",
      "Tie product claims to validation, screenshots, tests, docs, or generated reports.",
      "Record rollout, rollback, risks, and the next implementation step.",
    ],
  },
];

const marketplacePath = ".agents/plugins/marketplace.json";
const sourcePath = "content/development/seis-public-plugin-family.json";
const reportPath = "reports/seis-public-plugin-family.md";

const materializedPlugins = publicPlugins.filter((plugin) => plugin.materialize);
const publicMarketplacePlugins = publicPlugins.filter((plugin) => plugin.name === "seis-ai-agent");
const applicationMarketplacePlugins = discoverApplicationMarketplacePlugins();
const marketplacePlugins = [...publicMarketplacePlugins, ...applicationMarketplacePlugins];

const marketplace = {
  name: "seis-repo",
  interface: {
    displayName: "SEIS Repo",
  },
  plugins: marketplacePlugins.map((plugin) => ({
    name: plugin.name,
    source: {
      source: "local",
      path: plugin.sourcePath,
    },
    policy: {
      installation: "AVAILABLE",
      authentication: "ON_INSTALL",
    },
    category: plugin.category,
  })),
};

const contract = {
  version: 3,
  id: "seis-public-plugin-family",
  generatedAt: GENERATED_AT,
  mode: "public_seis_agent_with_public_app_repository_plugins",
  summary:
    "SEIS exposes SEIS-Agent as the canonical public orchestrator and publishes the 60 app-owned MIT packages directly from the public SEIS repository marketplace. The specialist lanes remain embedded source modules inside SEIS-Agent.",
  defaultInstall: {
    installId: "seis-ai-agent@seis-repo",
    mode: "single-public-plugin",
    unifiedSuite: "plugins/seis-ai-agent/assets/unified-suite.json",
    standaloneLaneInstallMode: "source-module-only",
  },
  marketplace: {
    path: marketplacePath,
    name: marketplace.name,
    installationPolicy: "AVAILABLE",
    authenticationPolicy: "ON_INSTALL",
    publicAudience: "everyone",
    publicPluginCount: marketplace.plugins.length,
    canonicalOrchestratorCount: publicMarketplacePlugins.length,
    applicationPluginCount: applicationMarketplacePlugins.length,
    entries: marketplace.plugins.map((entry) => ({
      name: entry.name,
      sourcePath: entry.source.path,
      category: entry.category,
      installation: entry.policy.installation,
      authentication: entry.policy.authentication,
    })),
  },
  applicationPlugins: applicationMarketplacePlugins.map((plugin) => ({
    name: plugin.name,
    sourcePath: plugin.sourcePath,
    category: plugin.category,
    installId: `${plugin.name}@seis-repo`,
    license: "MIT",
    publicStatus: "repo_marketplace_available",
    liveRuntimeStatus: "local_demo_or_auth_gated",
  })),
  seisAiConnection: {
    orchestrator: "seis-ai-agent@seis-repo",
    mcpServer: "plugins/seis-ai-agent/scripts/seis-ai-agent-mcp-server.mjs",
    connectedLanes: publicPlugins.map((plugin) => plugin.name),
    embeddedSkillSource: "plugins/seis-ai-agent/skills",
    embeddedLaneProfiles: "plugins/seis-ai-agent/assets/lanes",
  },
  securityModel: {
    secrets: "no_secrets_credentials_tokens_env_values_private_keys_or_cookies_are_committed_or_required_for_core_demo",
    cloud: "public_plugin_availability_does_not_grant_cloud_deploy_ssh_or_provider_access",
    data: "public_plugin_availability_does_not_grant_private_dataset_connector_or_export_access",
    auth: "oauth_account_login_and_live_integrations_require_explicit_user_action",
    destructiveActions: "delete_force_push_deploy_merge_and_live_ssh_actions_remain_approval_gated",
  },
  longHorizonGovernance: [
    "Keep SEIS-Agent as the canonical orchestration layer for cross-lane work.",
    "Keep source modules under plugins/seis-* embedded in SEIS-Agent, not exposed as separate public marketplace plugins.",
    "Keep every app-owned package under plugins/seis-core available as a public MIT package in the seis-repo marketplace.",
    "Require every future plugins/seis-* manifest to enter the unified suite before it can be used through SEIS AI.",
    "Validate manifests, MCP tools, marketplace entries, and SEIS-AI lane wiring before claiming public readiness.",
    "Record mock, disabled, planned, and connected states honestly.",
    "Do not treat marketplace availability as authenticated runtime access.",
  ],
  publicPlugins: publicMarketplacePlugins.map((plugin) => ({
    name: plugin.name,
    displayName: plugin.displayName,
    role: plugin.role,
    category: plugin.category,
    sourcePath: plugin.sourcePath,
    installId: `${plugin.name}@seis-repo`,
    license: "MIT",
    publicStatus: "repo_marketplace_available",
    liveRuntimeStatus: "local_demo_or_auth_gated",
    connectedToSeisAi: true,
  })),
  embeddedModules: publicPlugins.map((plugin) => ({
    name: plugin.name,
    displayName: plugin.displayName,
    role: plugin.role,
    category: plugin.category,
    sourcePath: plugin.sourcePath,
    validation: plugin.validation,
    canonicalInstallId: "seis-ai-agent@seis-repo",
    license: "MIT",
    publicStatus: plugin.name === "seis-ai-agent" ? "public-plugin" : "embedded-source-module",
    liveRuntimeStatus: "local_demo_or_auth_gated",
    connectedToSeisAi: true,
  })),
  validation: [
    "npm run check:seis-public-plugin-family",
    "npm run check:seis-specialist-plugins",
    "npm run check:seis-ai-agent",
    "npm run check:seis-plugin-bundle -- --no-local",
    ...publicPlugins.map((plugin) => plugin.validation),
  ],
};

const markdown = [
  "# SEIS Public Plugin Family",
  "",
  `- Generated: ${contract.generatedAt}`,
  `- Mode: ${contract.mode}`,
  `- Marketplace: ${contract.marketplace.name}`,
  `- Public audience: ${contract.marketplace.publicAudience}`,
  `- SEIS AI orchestrator: ${contract.seisAiConnection.orchestrator}`,
  "",
  "## Public Distribution",
  "",
  `- Canonical install: ${contract.defaultInstall.installId}`,
  `- Public plugin count: ${contract.marketplace.publicPluginCount}`,
  `- Mode: ${contract.defaultInstall.mode}`,
  `- Unified suite: ${contract.defaultInstall.unifiedSuite}`,
  `- Standalone lanes: ${contract.defaultInstall.standaloneLaneInstallMode}`,
  "",
  "## Canonical Public Plugin",
  "",
  "| plugin | role | source | category | install policy | auth policy | runtime state | SEIS AI |",
  "| --- | --- | --- | --- | --- | --- | --- | --- |",
  ...contract.publicPlugins.map(
    (plugin) =>
      `| ${plugin.name} | ${plugin.role} | ${plugin.sourcePath} | ${plugin.category} | AVAILABLE | ON_INSTALL | ${plugin.liveRuntimeStatus} | connected |`,
  ),
  "",
  "## Public SEIS Core Repository Packages",
  "",
  `- Marketplace entries: ${contract.marketplace.applicationPluginCount}`,
  "- Source root: plugins/seis-core",
  "- Audience: everyone",
  "- License: MIT",
  "- Runtime: local demo or auth-gated; live external capabilities remain approval-gated.",
  "",
  "## Embedded Modules",
  "",
  "| module | role | source | SEIS AI | direct public install |",
  "| --- | --- | --- | --- | --- |",
  ...contract.embeddedModules.map(
    (plugin) =>
      `| ${plugin.name} | ${plugin.role} | ${plugin.sourcePath} | connected | no |`,
  ),
  "",
  "## SEIS AI Connection",
  "",
  `- Orchestrator: ${contract.seisAiConnection.orchestrator}`,
  `- MCP server: ${contract.seisAiConnection.mcpServer}`,
  `- Embedded skills: ${contract.seisAiConnection.embeddedSkillSource}`,
  `- Embedded lane profiles: ${contract.seisAiConnection.embeddedLaneProfiles}`,
  "",
  "## Security Model",
  "",
  "- No API keys, tokens, cookies, SSH private keys, or `.env` values are required for core plugin install.",
  "- Public plugin availability does not grant cloud deployment, SSH, GitHub write, connector, private dataset, or destructive-action authority.",
  "- OAuth/account login and live external integrations remain explicit user actions.",
  "- Mock, disabled, planned, and connected states must stay labeled in product and docs surfaces.",
  "",
  "## Long-Horizon Rules",
  "",
  ...contract.longHorizonGovernance.map((rule) => `- ${rule}`),
  "",
  "## Validate",
  "",
  "```bash",
  ...contract.validation,
  "```",
].join("\n");

const outputs = [
  [sourcePath, `${JSON.stringify(contract, null, 2)}\n`],
  [marketplacePath, `${JSON.stringify(marketplace, null, 2)}\n`],
  [reportPath, `${markdown}\n`],
  ...materializedPlugins.flatMap((plugin) => pluginOutputs(plugin)),
];

if (checkMode) {
  const stale = outputs.filter(([file, expected]) => readText(file) !== expected).map(([file]) => file);
  if (stale.length > 0) {
    console.error("SEIS public plugin family files are stale:");
    for (const file of stale) console.error(`- ${file}`);
    console.error("Run node scripts/create-seis-public-plugin-family.mjs to refresh generated files.");
    process.exit(1);
  }
  console.log("SEIS public plugin family check passed.");
} else {
  for (const [file, text] of outputs) {
    const absolutePath = path.join(ROOT, file);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, text);
    console.log(`SEIS public plugin family written: ${file}`);
  }
}

function pluginOutputs(plugin) {
  const skillSource = path.join("plugins", "seis-ai-agent", "skills", plugin.name);
  const skillText = readRequiredText(path.join(skillSource, "SKILL.md"));
  const agentYaml = readRequiredText(path.join(skillSource, "agents", "openai.yaml"));
  const profile = readRequiredJson(path.join("plugins", "seis-ai-agent", "assets", "lanes", `${plugin.name}.json`));
  const base = path.join("plugins", plugin.name);
  return [
    [path.join(base, ".codex-plugin", "plugin.json"), `${JSON.stringify(pluginManifest(plugin), null, 2)}\n`],
    [path.join(base, ".mcp.json"), `${JSON.stringify(pluginMcpManifest(plugin), null, 2)}\n`],
    [path.join(base, "README.md"), pluginReadme(plugin)],
    [path.join(base, "assets", "lane-profile.json"), `${JSON.stringify(profile, null, 2)}\n`],
    [path.join(base, "skills", plugin.name, "SKILL.md"), skillText],
    [path.join(base, "skills", plugin.name, "agents", "openai.yaml"), agentYaml],
    [path.join(base, "scripts", `${plugin.name}-status.mjs`), statusScript(plugin)],
    [path.join(base, "scripts", `${plugin.name}-mcp-server.mjs`), mcpServerScript(plugin)],
  ];
}

function discoverApplicationMarketplacePlugins() {
  const sourceRoot = path.join(ROOT, "plugins", "seis-core");
  if (!fs.existsSync(sourceRoot)) return [];
  return fs.readdirSync(sourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const pluginRoot = path.join(sourceRoot, entry.name);
      const manifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
      const profilePath = path.join(pluginRoot, "assets", "plugin-profile.json");
      if (!fs.existsSync(manifestPath) || !fs.existsSync(profilePath)) return null;
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      const profile = JSON.parse(fs.readFileSync(profilePath, "utf8"));
      return {
        name: manifest.name || entry.name,
        sourcePath: `./plugins/seis-core/${entry.name}`,
        category: manifest.interface?.category || profile.category || "Developer",
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.name.localeCompare(right.name));
}

function pluginManifest(plugin) {
  return {
    name: plugin.name,
    version: UNIFIED_RELEASE_VERSION,
    description: plugin.longDescription,
    author: {
      name: "emirhankudun-ux",
      url: "https://github.com/emirhankudun-ux",
    },
    homepage: "https://github.com/emirhankudun-ux/SEIS",
    repository: "https://github.com/emirhankudun-ux/SEIS",
    license: "MIT",
    keywords: plugin.keywords,
    skills: "./skills/",
    mcpServers: "./.mcp.json",
    interface: {
      displayName: plugin.displayName,
      shortDescription: plugin.shortDescription,
      longDescription: plugin.longDescription,
      developerName: "emirhankudun-ux",
      category: plugin.manifestCategory,
      capabilities: plugin.capabilities,
      websiteURL: "https://github.com/emirhankudun-ux/SEIS",
      defaultPrompt: plugin.defaultPrompt,
      brandColor: plugin.brandColor,
    },
  };
}

function pluginMcpManifest(plugin) {
  return {
    mcpServers: {
      [plugin.name]: {
        command: "node",
        args: [`./scripts/${plugin.name}-mcp-server.mjs`],
      },
    },
  };
}

function pluginReadme(plugin) {
  return [
    `# ${plugin.displayName} Plugin`,
    "",
    `${plugin.displayName} is a preserved SEIS-Agent source module. ${plugin.longDescription}`,
    "",
    "## Components",
    "",
    "- `.codex-plugin/plugin.json` defines the Codex plugin card.",
    `- \`.mcp.json\` exposes the local \`${plugin.name}\` MCP server.`,
    `- \`skills/${plugin.name}/SKILL.md\` carries the lane workflow.`,
    "- `assets/lane-profile.json` records the lane contract and validation commands.",
    `- \`scripts/${plugin.name}-status.mjs\` prints deterministic local readiness.`,
    `- \`scripts/${plugin.name}-mcp-server.mjs\` exposes status and planning tools.`,
    "",
    "## Unified Module Use",
    "",
    `SEIS-Agent embeds this lane through \`plugins/seis-ai-agent/skills/${plugin.name}/SKILL.md\`. The repo marketplace does not expose this module as a separate public plugin card; install \`seis-ai-agent@seis-repo\` instead. Public availability does not imply live credentials, external account access, deployment authority, private data access, or destructive-action permission.`,
    "",
    "## Validate",
    "",
    "```bash",
    plugin.validation,
    `node plugins/${plugin.name}/scripts/${plugin.name}-status.mjs`,
    "npm run check:seis-public-plugin-family",
    "npm run check:seis-specialist-plugins",
    "```",
    "",
  ].join("\n");
}

function statusScript(plugin) {
  return `#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const LANE_ID = ${JSON.stringify(plugin.name)};
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(process.argv[2] || path.join(scriptDir, ".."));
const repoRoot = findRepoRoot();
const profile = readJson(path.join(pluginRoot, "assets", "lane-profile.json"));
const manifest = readJson(path.join(pluginRoot, ".codex-plugin", "plugin.json"));
const mcp = readJson(path.join(pluginRoot, ".mcp.json"));
const agentProfile = repoRoot ? readJson(path.join(repoRoot, "plugins", "seis-ai-agent", "assets", "agent-profile.json")) : null;

console.log(JSON.stringify({
  plugin: manifest.name,
  version: manifest.version,
  lane: profile.lane,
  status: "ready",
  repoRoot,
  skill: fs.existsSync(path.join(pluginRoot, "skills", LANE_ID, "SKILL.md")),
  mcpServer: Boolean(mcp.mcpServers?.[LANE_ID]),
  connectedToSeisAi: Boolean(agentProfile?.composedLanes?.includes(LANE_ID) && agentProfile?.consolidationPolicy?.embeddedSkills?.includes(LANE_ID)),
  qualityCommands: profile.qualityCommands,
}, null, 2));

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function findRepoRoot() {
  const candidates = [
    process.env.SEIS_ROOT,
    process.env.SEIS_REPO_ROOT,
    path.resolve(pluginRoot, "..", ".."),
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "package.json"))) return path.resolve(candidate);
  }
  return null;
}
`;
}

function mcpServerScript(plugin) {
  const statusTool = toolName(plugin, "status");
  const planTool = toolName(plugin, "plan");
  return `#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const LANE = {
  id: ${JSON.stringify(plugin.name)},
  label: ${JSON.stringify(plugin.displayName)},
  pluginName: ${JSON.stringify(plugin.name)},
  skillPath: ${JSON.stringify(`skills/${plugin.name}/SKILL.md`)},
  focus: ${JSON.stringify(plugin.longDescription)},
  statusTool: ${JSON.stringify(statusTool)},
  planTool: ${JSON.stringify(planTool)},
  planSteps: ${JSON.stringify(plugin.planSteps, null, 2)},
};

let pending = Buffer.alloc(0);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));

function pluginRoot() {
  return path.resolve(process.env[envName(LANE.id)] || path.join(scriptDir, ".."));
}

function repoRoot() {
  const candidates = [
    process.env.SEIS_ROOT,
    process.env.SEIS_REPO_ROOT,
    path.resolve(pluginRoot(), "..", ".."),
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(path.join(candidate, "package.json"))) || null;
}

const TOOLS = [
  {
    name: LANE.statusTool,
    description: "Report embedded SEIS source-module lane readiness and SEIS-Agent connection status.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: LANE.planTool,
    description: "Create a scoped plan for this embedded SEIS source-module lane.",
    inputSchema: {
      type: "object",
      required: ["request"],
      properties: {
        request: { type: "string", description: "SEIS lane request to plan." },
      },
    },
  },
];

function status() {
  const root = pluginRoot();
  const repo = repoRoot();
  const profile = readJson(path.join(root, "assets", "lane-profile.json"));
  const agentProfile = repo ? readJson(path.join(repo, "plugins", "seis-ai-agent", "assets", "agent-profile.json")) : null;
  return {
    status: profile ? "ready" : "partial",
    lane: LANE.id,
    pluginRoot: root,
    repoRoot: repo,
    skillExists: fs.existsSync(path.join(root, LANE.skillPath)),
    mcpManifestExists: fs.existsSync(path.join(root, ".mcp.json")),
    repoMirrorExists: repo ? fs.existsSync(path.join(repo, "plugins", LANE.pluginName, ".codex-plugin", "plugin.json")) : false,
    connectedToSeisAi: Boolean(agentProfile?.composedLanes?.includes(LANE.id) && agentProfile?.consolidationPolicy?.embeddedSkills?.includes(LANE.id)),
    profile,
  };
}

function plan(input) {
  if (typeof input?.request !== "string" || !input.request.trim()) {
    return { error: { code: -32602, message: "Invalid params: request is required." } };
  }
  return {
    lane: LANE.id,
    request: input.request,
    focus: LANE.focus,
    steps: LANE.planSteps,
    connection: "planned through the single public SEIS-Agent plugin",
    defaultChecks: status().profile?.qualityCommands || [],
  };
}

function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write(\`Content-Length: \${Buffer.byteLength(body, "utf8")}\\r\\n\\r\\n\${body}\`);
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function envName(value) {
  return \`\${value.toUpperCase().replaceAll("-", "_")}_PLUGIN_ROOT\`;
}

function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") {
    send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: LANE.id, version: "${UNIFIED_RELEASE_VERSION}" } } });
    return;
  }
  if (message.method === "tools/list") {
    send({ jsonrpc: "2.0", id: message.id, result: { tools: TOOLS } });
    return;
  }
  if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === LANE.statusTool ? status() : name === LANE.planTool ? plan(args) : null;
    if (result?.error) {
      send({ jsonrpc: "2.0", id: message.id, error: result.error });
      return;
    }
    if (result) {
      send({ jsonrpc: "2.0", id: message.id, result });
      return;
    }
    send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: \`Unknown tool: \${name ?? "undefined"}\` } });
  }
}

function parseBody(bodyBuffer) {
  try {
    return JSON.parse(bodyBuffer.toString("utf8"));
  } catch {
    return null;
  }
}

function processStream() {
  while (true) {
    const separatorIndex = pending.indexOf("\\r\\n\\r\\n");
    if (separatorIndex < 0) return;
    const headerRaw = pending.slice(0, separatorIndex).toString("utf8");
    const lengthMatch = /Content-Length:\\s*(\\d+)/i.exec(headerRaw);
    if (!lengthMatch) {
      pending = pending.slice(separatorIndex + 4);
      continue;
    }
    const contentLength = Number.parseInt(lengthMatch[1], 10);
    const bodyStart = separatorIndex + 4;
    if (pending.length < bodyStart + contentLength) return;
    const body = parseBody(pending.slice(bodyStart, bodyStart + contentLength));
    pending = pending.slice(bodyStart + contentLength);
    handle(body);
  }
}

process.stdin.on("data", (chunk) => {
  pending = Buffer.concat([pending, Buffer.from(chunk)]);
  processStream();
});

process.stdin.on("end", () => process.exit(0));
`;
}

function toolName(plugin, action) {
  return `${plugin.name.replaceAll("-", "_")}_${action}`;
}

function readText(file) {
  const absolutePath = path.join(ROOT, file);
  return fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, "utf8") : "";
}

function readRequiredText(file) {
  const text = readText(file);
  if (!text) throw new Error(`Missing required source file: ${file}`);
  return text.endsWith("\n") ? text : `${text}\n`;
}

function readRequiredJson(file) {
  return JSON.parse(readRequiredText(file));
}
