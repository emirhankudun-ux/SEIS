import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  APP_PLUGIN_EXPANSION_TARGET,
  getPluginAuditDefinition,
} from "./plugin-audit-definitions.mjs";

const runtimeRoot = path.dirname(fileURLToPath(import.meta.url));

export function startAuditPlugin(pluginId) {
  const definition = getPluginAuditDefinition(pluginId);
  if (!definition) throw new Error(`Unknown SEIS app audit plugin: ${pluginId}`);
  const pluginRoot = process.env.SEIS_PLUGIN_ROOT || path.join(runtimeRoot, "..", pluginId);
  const workspaceRoot = process.env.SEIS_WORKSPACE_ROOT || path.resolve(runtimeRoot, "../../..");
  const args = process.argv.slice(2);

  if (args.includes("--status")) {
    console.log(JSON.stringify(pluginStatus(definition, pluginRoot), null, 2));
    return;
  }
  if (args.includes("--report")) {
    const index = args.indexOf("--path");
    const requestedRoot = index >= 0 && args[index + 1] ? path.resolve(args[index + 1]) : workspaceRoot;
    const reportRoot = resolveReportRoot(requestedRoot, workspaceRoot);
    console.log(JSON.stringify(reportRoot ? runAudit(definition, reportRoot) : invalidReport(definition, "report path must remain inside the SEIS workspace"), null, 2));
    return;
  }
  startMcpServer(definition, workspaceRoot, pluginRoot);
}

function invalidReport(definition, error) {
  return {
    schemaVersion: 1,
    id: `${definition.id}-report`,
    plugin: definition.id,
    goalId: "SEIS-GOAL-021",
    state: "invalid-input",
    ok: false,
    mode: "local-read-only",
    error,
    permissions: { write: [], network: [], secrets: [] },
  };
}

export function pluginStatus(definition, pluginRoot) {
  const skillPath = path.join(pluginRoot, "skills", definition.id, "SKILL.md");
  return {
    plugin: definition.id,
    status: fs.existsSync(skillPath) ? "ready" : "partial",
    mode: "local-read-only",
    executesChecks: false,
    reportAction: "read-only",
    writes: "disabled-by-design",
    network: "disabled-by-design",
    secrets: "not-read",
  };
}

export function runAudit(definition, workspaceRoot) {
  const checks = definition.checks.map((check) => evaluateCheck(check, workspaceRoot));
  const failed = checks.filter((check) => !check.ok);
  return {
    schemaVersion: 1,
    id: `${definition.id}-report`,
    plugin: definition.id,
    goalId: "SEIS-GOAL-021",
    application: "apps/seis-core",
    state: failed.length ? "attention" : "ready",
    ok: failed.length === 0,
    mode: "local-read-only",
    workspaceRoot: path.basename(workspaceRoot),
    targetPluginCount: APP_PLUGIN_EXPANSION_TARGET,
    checks,
    counts: {
      total: checks.length,
      passed: checks.length - failed.length,
      failed: failed.length,
    },
    permissions: { write: [], network: [], secrets: [] },
    limitations: [
      "This report reads bounded repository evidence only.",
      "It does not execute builds, providers, deployment, filesystem writes, or external network calls.",
      "A ready local report is not a human approval or public release claim.",
    ],
  };
}

function evaluateCheck(check, workspaceRoot) {
  const filePath = check.path ? safeWorkspacePath(workspaceRoot, check.path) : null;
  try {
    if (check.kind === "exists") {
      return { id: check.id, label: check.label, kind: check.kind, path: check.path, ok: Boolean(filePath && fs.existsSync(filePath)) };
    }
    if (check.kind === "contains") {
      const text = readBounded(filePath);
      return {
        id: check.id,
        label: check.label,
        kind: check.kind,
        path: check.path,
        ok: text.toLowerCase().includes(String(check.needle).toLowerCase()),
      };
    }
    if (check.kind === "release-consistency") {
      return releaseConsistencyCheck(workspaceRoot, check);
    }
    return { id: check.id, label: check.label, kind: check.kind, ok: false, error: "unsupported-check-kind" };
  } catch (error) {
    return { id: check.id, label: check.label, kind: check.kind, path: check.path || null, ok: false, error: error.code || "read-failed" };
  }
}

function releaseConsistencyCheck(workspaceRoot, check) {
  const release = readJson(workspaceRoot, "content/development/seis-core-plugin-release-train.json");
  const source = readJson(workspaceRoot, "apps/seis-core/data/seis-core-plugin-sources.json");
  const catalog = readJson(workspaceRoot, "apps/seis-core/data/seis-core-plugin-catalog.json");
  const matrix = readJson(workspaceRoot, "content/development/seis-core-plugin-matrix.json");
  const label = release.currentRelease?.label;
  const labels = [source.releaseTrainVersion, catalog.release?.label, matrix.release?.label];
  const counts = [source.pluginCount, catalog.counts?.discovered, matrix.pluginCount];
  const ok = Boolean(label) && labels.every((value) => value === label) && counts.every((value) => value === APP_PLUGIN_EXPANSION_TARGET);
  return { id: check.id, label: check.label, kind: check.kind, ok, releaseLabel: label || null, pluginCounts: counts };
}

function readJson(workspaceRoot, relativePath) {
  return JSON.parse(readBounded(safeWorkspacePath(workspaceRoot, relativePath)));
}

function readBounded(filePath) {
  if (!filePath || !fs.existsSync(filePath)) throw new Error("evidence-not-found");
  const stat = fs.statSync(filePath);
  if (!stat.isFile() || stat.size > 12 * 1024 * 1024) throw new Error("evidence-out-of-bounds");
  return fs.readFileSync(filePath, "utf8");
}

function safeWorkspacePath(workspaceRoot, relativePath) {
  const root = path.resolve(workspaceRoot);
  const target = path.resolve(root, relativePath);
  const relative = path.relative(root, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("path-escapes-workspace");
  return target;
}

function resolveReportRoot(candidate, workspaceRoot) {
  const root = path.resolve(workspaceRoot);
  const target = path.resolve(candidate);
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative)) ? target : null;
}

function startMcpServer(definition, workspaceRoot, pluginRoot) {
  const toolPrefix = definition.id.replaceAll("-", "_");
  const tools = [
    {
      name: `seis_${toolPrefix}_status`,
      description: "Report the bounded local plugin boundary.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: `seis_${toolPrefix}_report`,
      description: "Read bounded SEIS repository evidence without executing it.",
      inputSchema: { type: "object", properties: { path: { type: "string" } } },
    },
  ];
  let pending = Buffer.alloc(0);

  function send(message) {
    const body = JSON.stringify(message);
    process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`);
  }

  function handle(message) {
    if (!message || typeof message !== "object") return;
    if (message.method === "initialize") {
      send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: definition.id, version: readPluginVersion(pluginRoot) } } });
    } else if (message.method === "tools/list") {
      send({ jsonrpc: "2.0", id: message.id, result: { tools } });
    } else if (message.method === "tools/call") {
      const name = message.params?.name;
      const args = message.params?.arguments || {};
      const statusName = `seis_${toolPrefix}_status`;
      const reportName = `seis_${toolPrefix}_report`;
      const result = name === statusName
        ? pluginStatus(definition, pluginRoot)
        : name === reportName
          ? (() => {
              const requestedRoot = args.path ? path.resolve(args.path) : workspaceRoot;
              const reportRoot = resolveReportRoot(requestedRoot, workspaceRoot);
              return reportRoot ? runAudit(definition, reportRoot) : invalidReport(definition, "report path must remain inside the SEIS workspace");
            })()
          : null;
      if (result) send({ jsonrpc: "2.0", id: message.id, result });
      else send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: `Unknown tool: ${name ?? "undefined"}` } });
    }
  }

  function processStream() {
    while (true) {
      const separator = pending.indexOf("\r\n\r\n");
      if (separator < 0) return;
      const match = /Content-Length:\s*(\d+)/i.exec(pending.slice(0, separator).toString("utf8"));
      if (!match) {
        pending = pending.slice(separator + 4);
        continue;
      }
      const length = Number.parseInt(match[1], 10);
      const start = separator + 4;
      if (pending.length < start + length) return;
      try {
        handle(JSON.parse(pending.slice(start, start + length).toString("utf8")));
      } catch {
        // Malformed local input is ignored; no external action is attempted.
      }
      pending = pending.slice(start + length);
    }
  }

  process.stdin.on("data", (chunk) => {
    pending = Buffer.concat([pending, Buffer.from(chunk)]);
    processStream();
  });
}

function readPluginVersion(pluginRoot) {
  try {
    return JSON.parse(fs.readFileSync(path.join(pluginRoot, "assets", "plugin-profile.json"), "utf8")).version || "unknown";
  } catch {
    return "unknown";
  }
}
