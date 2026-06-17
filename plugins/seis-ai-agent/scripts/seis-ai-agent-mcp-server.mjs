#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const AGENT = {
  id: "seis-ai-agent",
  identity: "SEIS-Agent",
  profilePath: "assets/agent-profile.json",
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

function status() {
  const root = pluginRoot();
  const repo = repoRoot();
  const profile = readJson(path.join(root, AGENT.profilePath));
  const identities = repo ? readJson(path.join(repo, "data", "seis-operating-identities.json")) : null;
  const marketplace = repo ? readJson(path.join(repo, ".agents", "plugins", "marketplace.json")) : null;
  const laneReadiness = Object.fromEntries(LANES.map((lane) => [lane.id, laneStatus(lane).status === "ready"]));
  const readiness = {
    profile: Boolean(profile),
    skill: fs.existsSync(path.join(root, AGENT.skillPath)),
    mcpManifest: fs.existsSync(path.join(root, ".mcp.json")),
    mcpServer: fs.existsSync(path.join(root, "scripts", "seis-ai-agent-mcp-server.mjs")),
    operatingIdentities: Boolean((identities?.identities || []).find((item) => item.name === AGENT.identity)),
    marketplace: Boolean(marketplace?.plugins?.length === 1 && marketplace.plugins?.[0]?.name === AGENT.id && marketplace.plugins?.[0]?.source?.path === "./plugins/seis-ai-agent"),
    installer: repo ? fs.existsSync(path.join(repo, "scripts", "install-seis-ai-agent.mjs")) : false,
    embeddedLanes: Object.values(laneReadiness).every(Boolean),
  };

  return {
    status: Object.values(readiness).every(Boolean) ? "ready" : "partial",
    agent: AGENT.id,
    identity: AGENT.identity,
    pluginRoot: root,
    repoRoot: repo,
    readiness,
    laneReadiness,
    profile,
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
    send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: AGENT.identity, version: "0.1.0" } } });
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
