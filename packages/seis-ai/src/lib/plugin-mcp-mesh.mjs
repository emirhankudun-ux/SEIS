import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { redactSecretText } from "./redaction.mjs";

export const SEIS_PLUGIN_MCP_MESH_ID = "seis-plugin-mcp-mesh";
export const SEIS_PLUGIN_MCP_MESH_SCHEMA_VERSION = "1.0.0";
export const SEIS_PLUGIN_MCP_MESH_TIMEOUT_MS = 30_000;

const PLUGIN_MCP_SOURCES = Object.freeze([
  { id: "seis-ai-agent", serverId: "seis-ai-agent", pluginRoot: "plugins/seis-ai-agent" },
  { id: "seis", serverId: "seis", pluginRoot: "plugins/seis" },
  { id: "seis-cloud", serverId: "seis-cloud", pluginRoot: "plugins/seis-cloud" },
  { id: "seis-code", serverId: "seis-code", pluginRoot: "plugins/seis-code" },
  { id: "seis-design", serverId: "seis-design", pluginRoot: "plugins/seis-design" },
  { id: "seis-data", serverId: "seis-data", pluginRoot: "plugins/seis-data" },
]);

const SAFE_TOOL_PROBES = Object.freeze({
  "seis-ai-agent": { name: "seis_ai_agent_status", arguments: {} },
  seis: { name: "seis_repos_bridge_status", arguments: {} },
  "seis-cloud": { name: "seis_cloud_status", arguments: {} },
  "seis-code": { name: "seis_code_status", arguments: {} },
  "seis-design": { name: "seis_design_status", arguments: {} },
  "seis-data": { name: "seis_data_status", arguments: {} },
});

const SAFE_ENV_KEYS = ["HOME", "PATH", "TMPDIR", "LANG", "LC_ALL"];
const MCP_OUTPUT_LIMIT = 64 * 1024;

function safeEnvironment(repoRoot, pluginRoot) {
  const env = Object.fromEntries(
    SAFE_ENV_KEYS.map((key) => [key, process.env[key] || (key === "PATH" ? "/usr/bin:/bin" : "")]),
  );
  return {
    ...env,
    CI: "1",
    NODE_ENV: "test",
    SEIS_ROOT: repoRoot,
    SEIS_REPO_ROOT: repoRoot,
    SEIS_AI_AGENT_PLUGIN_ROOT: path.join(repoRoot, "plugins/seis-ai-agent"),
    SEIS_CLOUD_PLUGIN_ROOT: path.join(repoRoot, "plugins/seis-cloud"),
    SEIS_CODE_PLUGIN_ROOT: path.join(repoRoot, "plugins/seis-code"),
    SEIS_DESIGN_PLUGIN_ROOT: path.join(repoRoot, "plugins/seis-design"),
    SEIS_DATA_PLUGIN_ROOT: path.join(repoRoot, "plugins/seis-data"),
    SEIS_PLUGIN_ROOT: path.join(repoRoot, pluginRoot),
  };
}

function redactedOutput(value) {
  const output = redactSecretText(String(value || ""))
    .replace(/\/Users\/[^\r\n"'`]+/g, "[local-path-redacted]")
    .replace(/\/home\/[^\r\n"'`]+/g, "[local-path-redacted]");
  return output.length > MCP_OUTPUT_LIMIT
    ? `${output.slice(0, MCP_OUTPUT_LIMIT)}\n[output truncated]`
    : output;
}

function relativePath(repoRoot, absolutePath) {
  const relative = path.relative(repoRoot, absolutePath);
  return relative || ".";
}

function readServerRecord(repoRoot, source) {
  const configPath = path.join(repoRoot, source.pluginRoot, ".mcp.json");
  const pluginManifestPath = path.join(repoRoot, source.pluginRoot, ".codex-plugin", "plugin.json");
  const skillRoot = path.join(repoRoot, source.pluginRoot, "skills");
  const record = {
    id: source.id,
    serverId: source.serverId,
    pluginRoot: source.pluginRoot,
    configPath: relativePath(repoRoot, configPath),
    pluginManifestPath: relativePath(repoRoot, pluginManifestPath),
    skillRoot: relativePath(repoRoot, skillRoot),
    configExists: existsSync(configPath),
    pluginManifestExists: existsSync(pluginManifestPath),
    skillRootExists: existsSync(skillRoot),
    command: null,
    args: [],
    entrypoint: null,
    entrypointExists: false,
    status: "missing",
  };

  if (!record.configExists) return record;

  try {
    const config = JSON.parse(readFileSync(configPath, "utf8"));
    const server = config?.mcpServers?.[source.serverId];
    record.command = typeof server?.command === "string" ? server.command : null;
    record.args = Array.isArray(server?.args) ? server.args.map(String) : [];
    if (record.command !== "node" || record.args.length !== 1) {
      record.status = "invalid-config";
      return record;
    }
    const pluginRoot = path.resolve(repoRoot, source.pluginRoot);
    const entrypoint = path.resolve(pluginRoot, record.args[0]);
    const relativeEntrypoint = path.relative(pluginRoot, entrypoint);
    if (
      !relativeEntrypoint ||
      relativeEntrypoint.startsWith("..") ||
      path.isAbsolute(relativeEntrypoint)
    ) {
      record.status = "invalid-config";
      record.error = "MCP entrypoint must remain inside its plugin root.";
      return record;
    }
    record.entrypoint = relativePath(repoRoot, entrypoint);
    record.entrypointExists = existsSync(entrypoint);
    record.status = record.entrypointExists && record.pluginManifestExists && record.skillRootExists
      ? "configured"
      : "partial";
  } catch (error) {
    record.status = "invalid-config";
    record.error = redactedOutput(error.message);
  }

  return record;
}

export function buildSeisPluginMcpMesh(repoRoot = process.cwd()) {
  const servers = PLUGIN_MCP_SOURCES.map((source) => readServerRecord(repoRoot, source));
  const configured = servers.filter((server) => server.status === "configured").length;

  return {
    id: SEIS_PLUGIN_MCP_MESH_ID,
    schemaVersion: SEIS_PLUGIN_MCP_MESH_SCHEMA_VERSION,
    status: configured === servers.length ? "configured-local-read-only" : "partial-local-read-only",
    mode: "manifest-backed-no-live-session",
    serverCount: servers.length,
    configuredServerCount: configured,
    servers: servers.map((server) => ({
      ...server,
      executionAuthority: false,
      credentialsRead: false,
      networkCalled: false,
      externalMutationPerformed: false,
      toolInventory: {
        mode: "not-probed",
        toolCount: null,
        toolNames: [],
      },
    })),
    boundary: {
      sourceOfTruth: ".mcp.json plus local plugin entrypoints",
      transport: "stdio newline-delimited JSON-RPC",
      probeScope: "initialize and tools/list only; no tool execution or OS-level side-effect instrumentation",
      liveSessionStarted: false,
      probeOptIn: true,
      shell: false,
      credentialsRead: false,
      networkCalled: false,
      externalMutationPerformed: false,
      humanApprovalRequiredForExternalMutation: true,
    },
  };
}

function frame(request) {
  return `${JSON.stringify(request)}\n`;
}

function parseFrames(output) {
  const responses = [];
  for (const line of String(output || "").split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      responses.push(JSON.parse(line));
    } catch {
      // Ignore malformed lines and report a bounded probe failure below.
    }
  }
  return responses;
}

function summarizeSafeToolResponse(response, safeTool) {
  const result = response?.result;
  return {
    mode: "stdio-safe-tool-call",
    requestedTool: safeTool.name,
    status: response?.error ? "failed" : "verified",
    resultKeys: result && typeof result === "object" ? Object.keys(result).sort() : [],
    reportedStatus: typeof result?.status === "string" ? result.status : null,
    reportedLane: typeof result?.lane === "string" ? result.lane : null,
    executionAuthority: result?.executionAuthority === false ? false : null,
    humanApprovalRequiredForLiveActions: result?.humanApprovalRequiredForLiveActions === true ? true : null,
    error: response?.error?.message ? redactedOutput(response.error.message) : null,
  };
}

function probeServer(repoRoot, server, timeoutMs, options = {}) {
  if (server.status !== "configured" || !server.entrypoint) {
    return {
      ...server,
      status: "blocked",
      probeError: "MCP entrypoint is not configured and cannot be probed.",
    };
  }

  const entrypoint = path.join(repoRoot, server.entrypoint);
  const safeTool = options.probeSafeTools === true ? SAFE_TOOL_PROBES[server.id] : null;
  const input = [
    frame({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "seis-mcp-mesh-check", version: "1.0.0" },
      },
    }),
    frame({ jsonrpc: "2.0", method: "notifications/initialized" }),
    frame({ jsonrpc: "2.0", id: 2, method: "tools/list" }),
    ...(safeTool
      ? [frame({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: { name: safeTool.name, arguments: safeTool.arguments },
      })]
      : []),
  ].join("");

  try {
    const output = execFileSync(process.execPath, [entrypoint], {
      cwd: repoRoot,
      env: safeEnvironment(repoRoot, server.pluginRoot),
      input,
      encoding: "utf8",
      timeout: timeoutMs,
      maxBuffer: MCP_OUTPUT_LIMIT,
      shell: false,
    });
    const responses = parseFrames(output);
    const initialize = responses.find((response) => response.id === 1);
    const toolsList = responses.find((response) => response.id === 2);
    if (initialize?.error || toolsList?.error || !Array.isArray(toolsList?.result?.tools)) {
      return {
        ...server,
        status: "probe-failed",
        probeError: redactedOutput(
          initialize?.error?.message || toolsList?.error?.message || "tools/list did not return a tool array",
        ),
        toolInventory: { mode: "stdio-probe", toolCount: 0, toolNames: [] },
      };
    }
    const tools = toolsList.result.tools.filter((tool) => typeof tool?.name === "string");
    const safeToolResponse = safeTool ? responses.find((response) => response.id === 3) : null;
    const safeToolProbe = safeTool ? summarizeSafeToolResponse(safeToolResponse, safeTool) : null;
    if (safeTool && (!safeToolResponse || safeToolProbe.status !== "verified")) {
      return {
        ...server,
        status: "probe-tool-failed",
        serverInfo: initialize.result?.serverInfo || null,
        toolInventory: {
          mode: "stdio-probe",
          toolCount: tools.length,
          toolNames: tools.map((tool) => tool.name).sort(),
        },
        safeToolProbe,
        probeError: safeToolProbe?.error || "allowlisted safe tool probe did not return a result",
      };
    }
    return {
      ...server,
      status: "probe-verified",
      serverInfo: initialize.result?.serverInfo || null,
      toolInventory: {
        mode: "stdio-probe",
        toolCount: tools.length,
        toolNames: tools.map((tool) => tool.name).sort(),
      },
      ...(safeToolProbe ? { safeToolProbe } : {}),
      probeError: null,
    };
  } catch (error) {
    const timedOut = error?.signal === "SIGTERM" || error?.killed === true;
    return {
      ...server,
      status: timedOut ? "probe-timeout" : "probe-failed",
      probeError: redactedOutput([error?.stdout, error?.stderr, error?.message].filter(Boolean).join("\n")),
      toolInventory: { mode: "stdio-probe", toolCount: 0, toolNames: [] },
    };
  }
}

export function probeSeisPluginMcpMesh(repoRoot = process.cwd(), options = {}) {
  const mesh = buildSeisPluginMcpMesh(repoRoot);
  const timeoutMs = Math.min(
    Math.max(Number(options.timeoutMs) || 5_000, 250),
    SEIS_PLUGIN_MCP_MESH_TIMEOUT_MS,
  );
  const probeSafeTools = options.probeSafeTools === true;
  const servers = mesh.servers.map((server) => probeServer(repoRoot, server, timeoutMs, { probeSafeTools }));
  const verified = servers.filter((server) => server.status === "probe-verified").length;
  const failed = servers.length - verified;

  return {
    ...mesh,
    status: failed === 0 ? "probe-verified-local-read-only" : "probe-blocked-local-read-only",
    servers,
    probe: {
      performed: true,
      timeoutMs,
      verifiedServerCount: verified,
      failedServerCount: failed,
      transport: "stdio newline-delimited JSON-RPC",
      lifecycle: probeSafeTools
        ? "initialize -> notifications/initialized -> tools/list -> allowlisted status tool"
        : "initialize -> notifications/initialized -> tools/list",
      ...(probeSafeTools
        ? {
          safeToolCallsPerformed: true,
          safeToolProbeCount: servers.filter((server) => server.safeToolProbe?.status === "verified").length,
        }
        : {}),
    },
    boundary: {
      ...mesh.boundary,
      liveSessionStarted: false,
      localProbePerformed: true,
      probeScope: probeSafeTools
        ? "initialize -> notifications/initialized -> tools/list plus one allowlisted repository-local status tool per server"
        : mesh.boundary.probeScope,
      ...(probeSafeTools
        ? {
          safeToolCallsPerformed: true,
          safeToolProbePolicy: "one repository-local status tool per bundled server; no plan, auth, network, shell, or mutation tool calls",
        }
        : {}),
      externalMutationPerformed: false,
    },
    ok: failed === 0,
  };
}
