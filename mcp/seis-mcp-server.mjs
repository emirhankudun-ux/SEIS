#!/usr/bin/env node
import fs from "node:fs";
import process from "node:process";
import path from "node:path";
import { PLAN_VERSION, planTask } from "../packages/ai-language/src/llm-task-planner.mjs";

let pending = "";
let initializationStarted = false;
let initialized = false;
const SEIS_ROOT = path.resolve(process.env.SEIS_ROOT || process.cwd());
const BRIDGE_MANIFEST = path.join(SEIS_ROOT, "data", "seis-repos-llm-bridge-2026-06-08.json");
const SPECIALIST_LANES = [
  {
    id: "seis-cloud",
    label: "SEIS Cloud",
    pluginPath: "plugins/seis-cloud",
    profilePath: "plugins/seis-cloud/assets/lane-profile.json",
    skillPath: "plugins/seis-cloud/skills/seis-cloud/SKILL.md",
    mcpToolStatus: "seis_cloud_status",
    mcpToolPlan: "seis_cloud_plan",
    focus: "provider-neutral deployment readiness, public cloud targets for everyone, team/workplace VPN cloud, cloud preflight, rollback planning, and secret-safe infrastructure automation",
    planSteps: [
      "Inspect git status, branch, remote, and current cloud target records.",
      "Classify access audience: public cloud for everyone or team/workplace VPN cloud for approved peers.",
      "Classify provider, server target, secrets, public URL, rollback owner, and authentication scope.",
      "Run or update provider-neutral preflight records before provider-specific mutation.",
      "Keep apply/deploy commands behind explicit user confirmation.",
      "Validate cloud access policy, cloud reports, server target checks, rollback notes, and blockers.",
    ],
  },
  {
    id: "seis-code",
    label: "SEIS-Code",
    pluginPath: "plugins/seis-code",
    profilePath: "plugins/seis-code/assets/lane-profile.json",
    skillPath: "plugins/seis-code/skills/seis-code/SKILL.md",
    mcpToolStatus: "seis_code_status",
    mcpToolPlan: "seis_code_plan",
    focus: "architecture-aware implementation, refactors, tests, CI, MCP/plugin code, and repository automation",
    planSteps: [
      "Inspect git status, branch, and remote before edits.",
      "Read nearest repo context and map affected code lane.",
      "Implement the smallest durable engineering change.",
      "Run scoped tests or checks tied to touched paths.",
      "Record validation, risks, rollback notes, and changed files.",
    ],
  },
  {
    id: "seis-design",
    label: "SEIS-Design",
    pluginPath: "plugins/seis-design",
    profilePath: "plugins/seis-design/assets/lane-profile.json",
    skillPath: "plugins/seis-design/skills/seis-design/SKILL.md",
    mcpToolStatus: "seis_design_status",
    mcpToolPlan: "seis_design_plan",
    focus: "product design, UI/UX architecture, design systems, accessibility, motion, and visual QA",
    planSteps: [
      "Read the current product surface and audience context.",
      "Map workflow, accessibility, responsive, and reduced-motion requirements.",
      "Design or implement the smallest reusable product/design-system change.",
      "Validate with screenshots or static checks when a runnable surface exists.",
      "Document durable design decisions and remaining risks.",
    ],
  },
  {
    id: "seis-data",
    label: "SEIS-DATA",
    pluginPath: "plugins/seis-data",
    profilePath: "plugins/seis-data/assets/lane-profile.json",
    skillPath: "plugins/seis-data/skills/seis-data/SKILL.md",
    mcpToolStatus: "seis_data_status",
    mcpToolPlan: "seis_data_plan",
    focus: "data architecture, analytics, reports, schemas, knowledge registries, RAG or memory planning, and provenance",
    planSteps: [
      "Classify source data, generated outputs, sensitivity, and provenance.",
      "Find the source of truth and generator before editing records.",
      "Model or transform data with structured parsers and deterministic ordering.",
      "Regenerate paired reports when source records change.",
      "Validate schema, parity, privacy, provenance, and relevant checks.",
    ],
  },
  {
    id: "seis-governance",
    label: "SEIS Governance",
    pluginPath: "plugins/seis-ai-agent",
    profilePath: "plugins/seis-ai-agent/assets/lanes/seis-governance.json",
    skillPath: "plugins/seis-ai-agent/skills/seis-governance/SKILL.md",
    mcpToolStatus: "seis_governance_status",
    mcpToolPlan: "seis_governance_plan",
    focus: "memory and context governance, release readiness, traceability, and policy-consistent cross-lane orchestration",
    planSteps: [
      "Check policy constraints and repo-level governance evidence before making lane-level changes.",
      "Assess quality commands and specialist lane coupling points.",
      "Define traceable implementation steps with explicit ownership and risk controls.",
      "Run repository checks that validate consistency across agent, lane, and manifest surfaces.",
      "Document outcomes, rollback points, and handoff notes.",
    ],
  },
];

const MCP_TOOLS = [
  {
    name: "seis_repos_bridge_status",
    description: "Read the SEIS bridge manifest and MCP bundle readiness summary.",
    inputSchema: {
      type: "object",
      properties: {
        strict: {
          type: "boolean",
          description: "If true, report absent optional assets as errors.",
          default: false,
        },
      },
    },
  },
  {
    name: "seis_llm_package_snapshot",
    description: "Summarize governed LLM package assets and readiness files.",
    inputSchema: {
      type: "object",
      properties: {
        strict: {
          type: "boolean",
          description: "If true, treat missing optional assets as blockers.",
          default: false,
        },
      },
    },
  },
  {
    name: "seis_llm_plan_request",
    description: "Generate a basic LLM routing plan for a requested SEIS task.",
    inputSchema: {
      type: "object",
      required: ["request"],
      properties: {
        request: {
          type: "string",
          description: "Task text to evaluate.",
        },
      },
    },
  },
  {
    name: "seis_llm_role_plan_request",
    description: "Generate a role-aware LLM routing plan using designer / engineer / software context.",
    inputSchema: {
      type: "object",
      required: ["request"],
      properties: {
        request: {
          type: "string",
          description: "Task text to evaluate.",
        },
        preferredRole: {
          type: "string",
          description: "Preferred role bias: designer | engineer | software | auto.",
        },
      },
    },
  },
  {
    name: "seis_specialist_lanes",
    description: "List the SEIS Cloud, SEIS-Code, SEIS-Design, SEIS-DATA, and SEIS Governance specialist plugin lanes and readiness summaries.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "seis_specialist_lane_status",
    description: "Report readiness for one SEIS specialist plugin lane.",
    inputSchema: {
      type: "object",
      required: ["lane"],
      properties: {
        lane: {
          type: "string",
          description: "Lane id: seis-cloud | seis-code | seis-design | seis-data | seis-governance",
        },
      },
    },
  },
  {
    name: "seis_specialist_lane_plan",
    description: "Create a scoped SEIS specialist lane plan for a task.",
    inputSchema: {
      type: "object",
      required: ["lane", "request"],
      properties: {
        lane: {
          type: "string",
          description: "Lane id: seis-cloud | seis-code | seis-design | seis-data | seis-governance",
        },
        request: {
          type: "string",
          description: "Task text to plan.",
        },
      },
    },
  },
];

function safeParseJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function summarizeArrayValue(value, fallback = []) {
  const normalized = Array.isArray(value) ? value : fallback;
  return {
    count: normalized.length,
    sample: normalized.slice(0, 3),
  };
}

function summarizeRecord(filePath, requiredKeys, strict) {
  const result = safeParseJson(filePath);
  const exists = fs.existsSync(filePath);
  const keys = requiredKeys || [];

  if (!exists) {
    return {
      exists: false,
      status: strict ? "missing" : "optional-missing",
      payload: null,
      missingKeys: [],
      message: "file missing",
    };
  }

  if (!result || typeof result !== "object") {
    return {
      exists: true,
      status: strict ? "invalid" : "invalid",
      payload: null,
      missingKeys: keys,
      message: "invalid JSON",
    };
  }

  const missingKeys = [];
  for (const key of keys) {
    if (result[key] === undefined) {
      missingKeys.push(key);
    }
  }

  return {
    exists: true,
    status: missingKeys.length > 0 ? "invalid" : "ok",
    payload: result,
    missingKeys,
    message: missingKeys.length > 0 ? "required keys missing" : "ok",
  };
}

function toBool(value, fallback = false) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  return Boolean(value);
}

function bridgeStatus(payload = {}) {
  const strict = toBool(payload.strict);
  const requiredPaths = [
    "data/seis-mcp-server-2026-06-07.json",
    "data/seis-repos-llm-bridge-2026-06-08.json",
    "content/development/llm-package-registry.json",
    "content/development/llm-task-routing-policy.json",
    "content/development/llm-adapter-readiness.json",
    "content/development/llm-request-blueprints.json",
    "packages/ai-language/src/llm-task-planner.mjs",
    "mcp/seis-mcp-server.mjs",
    "plugins/seis/.mcp.json",
    "plugins/seis/scripts/seis-mcp-bundle-audit.sh",
    "plugins/seis/scripts/seis-mcp-launcher.mjs",
    "plugins/seis-cloud/.codex-plugin/plugin.json",
    "plugins/seis-cloud/.mcp.json",
    "plugins/seis-cloud/skills/seis-cloud/SKILL.md",
    "plugins/seis-code/.codex-plugin/plugin.json",
    "plugins/seis-code/.mcp.json",
    "plugins/seis-code/skills/seis-code/SKILL.md",
    "plugins/seis-design/.codex-plugin/plugin.json",
    "plugins/seis-design/.mcp.json",
    "plugins/seis-design/skills/seis-design/SKILL.md",
    "plugins/seis-data/.codex-plugin/plugin.json",
    "plugins/seis-data/.mcp.json",
    "plugins/seis-data/skills/seis-data/SKILL.md",
  ];
  const pluginPath = path.join(SEIS_ROOT, "plugins/seis");

  const records = {
    present: [],
    missing: [],
    strict,
  };

  for (const rel of requiredPaths) {
    const absolute = path.join(SEIS_ROOT, rel);
    const exists = fs.existsSync(absolute);
    if (exists) {
      records.present.push(rel);
      continue;
    }
    records.missing.push(rel);
  }

  const bridgeFile = safeParseJson(BRIDGE_MANIFEST);
  if (strict && !bridgeFile) {
    records.missing.push("data/seis-repos-llm-bridge-2026-06-08.json (invalid JSON)");
  }

  const pluginManifest = safeParseJson(path.join(pluginPath, ".codex-plugin", "plugin.json"));
  if (pluginManifest?.mcpServers !== "./.mcp.json") {
    records.missing.push("plugins/seis/.codex-plugin/plugin.json (missing mcpServers)");
  }

  const mcpManifest = safeParseJson(path.join(pluginPath, ".mcp.json"));
  if (!mcpManifest?.mcpServers?.seis) {
    records.missing.push("plugins/seis/.mcp.json (missing mcpServers.seis)");
  }

  return {
    status: "ok",
    root: SEIS_ROOT,
    pluginRoot: pluginPath,
    strict,
    records,
    bridge: bridgeFile ? {
      id: bridgeFile.id,
      version: bridgeFile.version,
      updatedAt: bridgeFile.updatedAt,
      llmPackages: bridgeFile.llmPackages || null,
    } : null,
  };
}

function findSpecialistLane(laneId) {
  const normalized = typeof laneId === "string" ? laneId.trim().toLowerCase() : "";
  return SPECIALIST_LANES.find((lane) => lane.id === normalized || lane.label.toLowerCase() === normalized);
}

function specialistLaneStatus(lane) {
  const pluginRoot = path.join(SEIS_ROOT, lane.pluginPath);
  const manifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
  const mcpPath = path.join(pluginRoot, ".mcp.json");
  const profilePath = path.join(SEIS_ROOT, lane.profilePath);
  const skillPath = path.join(SEIS_ROOT, lane.skillPath);
  const manifest = safeParseJson(manifestPath);
  const mcp = safeParseJson(mcpPath);
  const profile = safeParseJson(profilePath);

  return {
    id: lane.id,
    label: lane.label,
    status: manifest && profile && fs.existsSync(skillPath) ? "ready" : "partial",
    pluginPath: lane.pluginPath,
    skillPath: lane.skillPath,
    profilePath: lane.profilePath,
    manifest: manifest ? {
      name: manifest.name,
      version: manifest.version,
      displayName: manifest.interface?.displayName || null,
      capabilities: summarizeArrayValue(manifest.interface?.capabilities),
    } : null,
    mcp: {
      manifestExists: Boolean(mcp),
      serverConfigured: Boolean(mcp?.mcpServers?.[lane.id]),
      statusTool: lane.mcpToolStatus,
      planTool: lane.mcpToolPlan,
    },
    profile,
  };
}

function specialistLanes() {
  const lanes = SPECIALIST_LANES.map(specialistLaneStatus);
  return {
    status: lanes.every((lane) => lane.status === "ready") ? "ready" : "partial",
    root: SEIS_ROOT,
    laneCount: lanes.length,
    lanes,
  };
}

function specialistLaneStatusRequest(input = {}) {
  const lane = findSpecialistLane(input.lane);
  if (!lane) {
    return {
      error: {
        code: -32602,
        message: "Invalid params: lane must be one of seis-cloud, seis-code, seis-design, seis-data, or seis-governance.",
      },
    };
  }

  return specialistLaneStatus(lane);
}

function specialistLanePlan(input = {}) {
  const lane = findSpecialistLane(input.lane);
  if (!lane) {
    return {
      error: {
        code: -32602,
        message: "Invalid params: lane must be one of seis-cloud, seis-code, seis-design, seis-data, or seis-governance.",
      },
    };
  }

  if (typeof input.request !== "string" || !input.request.trim()) {
    return {
      error: {
        code: -32602,
        message: "Invalid params: request is required and must be a non-empty string.",
      },
    };
  }

  const status = specialistLaneStatus(lane);
  return {
    tool: "seis_specialist_lane_plan",
    lane: lane.id,
    label: lane.label,
    request: input.request,
    focus: lane.focus,
    steps: lane.planSteps,
    defaultChecks: status.profile?.qualityCommands || [],
    readiness: {
      status: status.status,
      pluginPath: status.pluginPath,
      skillPath: status.skillPath,
    },
  };
}

function llmPackageSnapshot(input = {}) {
  const strict = toBool(input.strict);
  const registryPath = "content/development/llm-package-registry.json";
  const routingPolicyPath = "content/development/llm-task-routing-policy.json";
  const adapterReadinessPath = "content/development/llm-adapter-readiness.json";
  const requestBlueprintsPath = "content/development/llm-request-blueprints.json";
  const plannerPath = "packages/ai-language/src/llm-task-planner.mjs";

  const registry = summarizeRecord(path.join(SEIS_ROOT, registryPath), ["id", "packages"], strict);
  const routingPolicy = summarizeRecord(path.join(SEIS_ROOT, routingPolicyPath), ["id", "policy"], strict);
  const adapterReadiness = summarizeRecord(path.join(SEIS_ROOT, adapterReadinessPath), ["id", "adapters"], strict);
  const requestBlueprints = summarizeRecord(path.join(SEIS_ROOT, requestBlueprintsPath), ["id", "blueprints"], strict);
  const plannerFileExists = fs.existsSync(path.join(SEIS_ROOT, plannerPath));
  const failed = [registry, routingPolicy, adapterReadiness, requestBlueprints]
    .filter((record) => record.status !== "ok");

  return {
    status: failed.length > 0 ? (strict ? "invalid" : "partial") : "ok",
    strict,
    root: SEIS_ROOT,
    planner: {
      file: plannerPath,
      exists: plannerFileExists,
      version: PLAN_VERSION,
      exportsPlanTask: typeof planTask === "function",
    },
    packageRegistry: {
      path: registryPath,
      status: registry.status,
      message: registry.message,
      id: registry.payload?.id ?? null,
      missingKeys: registry.missingKeys,
      packages: summarizeArrayValue(registry.payload?.packages),
    },
    routingPolicy: {
      path: routingPolicyPath,
      status: routingPolicy.status,
      message: routingPolicy.message,
      id: routingPolicy.payload?.id ?? null,
      default: routingPolicy.payload?.default ?? null,
      tiers: Object.keys(routingPolicy.payload?.policy?.tiers || {}),
      routingRulesCount: summarizeArrayValue(routingPolicy.payload?.policy?.routingRules).count,
    },
    adapterReadiness: {
      path: adapterReadinessPath,
      status: adapterReadiness.status,
      message: adapterReadiness.message,
      id: adapterReadiness.payload?.id ?? null,
      adapters: summarizeArrayValue(adapterReadiness.payload?.adapters),
    },
    requestBlueprints: {
      path: requestBlueprintsPath,
      status: requestBlueprints.status,
      message: requestBlueprints.message,
      id: requestBlueprints.payload?.id ?? null,
      blueprints: summarizeArrayValue(requestBlueprints.payload?.blueprints),
    },
    invalid: failed.map((entry) => entry.message).filter(Boolean),
  };
}

function llmPlan(input) {
  if (typeof input?.request !== "string" || !input.request.trim()) {
    return {
      error: {
        code: -32602,
        message: "Invalid params: request is required and must be a non-empty string.",
      },
    };
  }

  const result = planTask(input.request);
  return {
    tool: "seis_llm_plan_request",
    plan: result,
    plannerVersion: PLAN_VERSION,
  };
}

function llmRolePlan(input) {
  if (typeof input?.request !== "string" || !input.request.trim()) {
    return {
      error: {
        code: -32602,
        message: "Invalid params: request is required and must be a non-empty string.",
      },
    };
  }

  const role = typeof input.preferredRole === "string" ? input.preferredRole.trim() : "";
  const result = planTask(input.request, { preferredRole: role });
  return {
    tool: "seis_llm_role_plan_request",
    plan: result,
    plannerVersion: PLAN_VERSION,
  };
}

function sendResponse(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function sendError(id, code, message) {
  sendResponse({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
}

function parseBody(body) {
  if (!body) {
    return null;
  }
  try {
    return JSON.parse(body);
  } catch (error) {
    return null;
  }
}

function handleMessage(message) {
  if (!message || typeof message !== "object") {
    sendError(null, -32600, "Invalid Request");
    return;
  }

  if (message.method === "initialize") {
    if (initializationStarted) {
      sendError(message.id, -32600, "Initialize may only be sent once.");
      return;
    }
    initializationStarted = true;
    sendResponse({
      jsonrpc: "2.0",
      id: message.id,
      result: {
        protocolVersion: message.params?.protocolVersion || "2024-11-05",
        capabilities: {
          tools: {
            listChanged: false,
          },
          logging: {},
        },
        serverInfo: {
          name: "seis-mcp-server",
          version: "0.1.0",
        },
      },
    });
    return;
  }

  if (message.method === "notifications/initialized") {
    initialized = initializationStarted;
    return;
  }

  if (!initialized) {
    if (message.id !== undefined) sendError(message.id, -32002, "Server not initialized.");
    return;
  }

  if (message.method === "tools/list") {
    sendResponse({
      jsonrpc: "2.0",
      id: message.id,
      result: {
        tools: MCP_TOOLS,
      },
    });
    return;
  }

  if (message.method === "tools/call") {
    const toolName = message.params?.name;
    const argumentsData = message.params?.arguments || {};

  if (toolName === "seis_repos_bridge_status") {
      sendResponse({
        jsonrpc: "2.0",
        id: message.id,
        result: bridgeStatus(argumentsData),
      });
      return;
    }

    if (toolName === "seis_llm_package_snapshot") {
      sendResponse({
        jsonrpc: "2.0",
        id: message.id,
        result: llmPackageSnapshot(argumentsData),
      });
      return;
    }

    if (toolName === "seis_llm_plan_request") {
      const plan = llmPlan(argumentsData, message.id);
      if (plan.error) {
        sendResponse({
          jsonrpc: "2.0",
          id: message.id,
          error: plan.error,
        });
        return;
      }
      sendResponse({
        jsonrpc: "2.0",
        id: message.id,
        result: plan,
      });
      return;
    }

    if (toolName === "seis_llm_role_plan_request") {
      const plan = llmRolePlan(argumentsData, message.id);
      if (plan.error) {
        sendResponse({
          jsonrpc: "2.0",
          id: message.id,
          error: plan.error,
        });
        return;
      }
      sendResponse({
        jsonrpc: "2.0",
        id: message.id,
        result: plan,
      });
      return;
    }

    if (toolName === "seis_specialist_lanes") {
      sendResponse({
        jsonrpc: "2.0",
        id: message.id,
        result: specialistLanes(argumentsData),
      });
      return;
    }

    if (toolName === "seis_specialist_lane_status") {
      const result = specialistLaneStatusRequest(argumentsData);
      if (result.error) {
        sendResponse({
          jsonrpc: "2.0",
          id: message.id,
          error: result.error,
        });
        return;
      }
      sendResponse({
        jsonrpc: "2.0",
        id: message.id,
        result,
      });
      return;
    }

    if (toolName === "seis_specialist_lane_plan") {
      const result = specialistLanePlan(argumentsData);
      if (result.error) {
        sendResponse({
          jsonrpc: "2.0",
          id: message.id,
          error: result.error,
        });
        return;
      }
      sendResponse({
        jsonrpc: "2.0",
        id: message.id,
        result,
      });
      return;
    }

    sendResponse({
      jsonrpc: "2.0",
      id: message.id,
      error: {
        code: -32601,
        message: `Unknown tool: ${toolName ?? "undefined"}`,
      },
    });
    return;
  }

  if (message.id !== undefined) {
    sendError(message.id, -32601, `Method not found: ${message.method ?? "undefined"}`);
  }
}

function processStream() {
  while (true) {
    const newlineIndex = pending.indexOf("\n");
    if (newlineIndex < 0) {
      return;
    }
    const line = pending.slice(0, newlineIndex).replace(/\r$/, "");
    pending = pending.slice(newlineIndex + 1);
    if (!line.trim()) continue;
    handleMessage(parseBody(line));
  }
}

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  pending += chunk;
  processStream();
});

process.stdin.on("end", () => process.exit(0));
