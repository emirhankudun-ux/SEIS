import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const runtimeRoot = path.dirname(fileURLToPath(import.meta.url));
const MAX_BYTES = 12 * 1024 * 1024;
const MAX_FILES = 5000;
const SKIP_DIRECTORIES = new Set([".git", ".codex", ".next", "build", "coverage", "dist", "node_modules", "vendor"]);

export function startTopicPlugin(topic) {
  const pluginRoot = path.resolve(process.env.SEIS_TOPIC_PLUGIN_ROOT || path.join(runtimeRoot, ".."));
  const workspaceRoot = resolveWorkspaceRoot(pluginRoot);
  const args = process.argv.slice(2);

  if (args.includes("--status")) {
    console.log(JSON.stringify(topicStatus(topic, pluginRoot), null, 2));
    return;
  }
  if (args.includes("--report")) {
    const index = args.indexOf("--path");
    const requestedRoot = index >= 0 && args[index + 1] ? path.resolve(args[index + 1]) : workspaceRoot;
    const reportRoot = resolveInside(requestedRoot, workspaceRoot);
    console.log(JSON.stringify(reportRoot
      ? topicReport(topic, reportRoot)
      : invalidReport(topic, "report path must remain inside the SEIS workspace"), null, 2));
    return;
  }
  startMcpServer(topic, workspaceRoot, pluginRoot);
}

export function topicStatus(topic, pluginRoot) {
  const profilePath = path.join(pluginRoot, "assets", "topic-profile.json");
  const skillPath = path.join(pluginRoot, "skills", topic.id, "SKILL.md");
  const manifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
  return {
    schemaVersion: 1,
    plugin: topic.id,
    displayName: topic.displayName,
    category: topic.category,
    status: fs.existsSync(profilePath) && fs.existsSync(skillPath) && fs.existsSync(manifestPath) ? "ready" : "partial",
    maturity: "prototype",
    mode: "local-read-only",
    implementation: "topic-specific bounded repository evidence lane",
    sourcePath: topic.sourcePath,
    permissions: { read: ["bounded local repository evidence"], write: [], network: [], secrets: [] },
    limitations: [
      "This topic package does not call providers, perform network requests, or mutate files.",
      "A ready status is not a public-release or external-integration claim.",
    ],
  };
}

export function topicReport(topic, reportRoot) {
  const shape = inspectRepositoryShape(reportRoot);
  return {
    schemaVersion: 1,
    id: `${topic.id}-report`,
    plugin: topic.id,
    displayName: topic.displayName,
    category: topic.category,
    state: "repository-shape-evidence",
    ok: shape.ok,
    evidenceMode: "repository-shape",
    workspaceRoot: path.basename(reportRoot),
    topic: {
      categoryId: topic.categoryId,
      sourceText: topic.sourceText,
      sourcePath: topic.sourcePath,
    },
    shape,
    permissions: { read: ["bounded local repository evidence"], write: [], network: [], secrets: [] },
    limitations: [
      "This report reads bounded file names and sizes only; it does not execute project code.",
      "It does not prove provider connectivity, deployment, security approval, or public release readiness.",
      "Sensitive file contents and secret values are never read by this runtime.",
    ],
  };
}

function invalidReport(topic, error) {
  return {
    schemaVersion: 1,
    id: `${topic.id}-report`,
    plugin: topic.id,
    state: "invalid-input",
    ok: false,
    mode: "local-read-only",
    error,
    permissions: { read: [], write: [], network: [], secrets: [] },
  };
}

function inspectRepositoryShape(reportRoot) {
  const extensions = {};
  const sample = [];
  const errors = [];
  let fileCount = 0;
  let totalBytes = 0;
  const stack = [reportRoot];

  while (stack.length > 0 && fileCount < MAX_FILES && totalBytes <= MAX_BYTES) {
    const current = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch (error) {
      errors.push(error.code || "read-failed");
      continue;
    }
    for (const entry of entries) {
      if (entry.name === ".DS_Store") continue;
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRECTORIES.has(entry.name)) stack.push(absolute);
        continue;
      }
      if (!entry.isFile()) continue;
      let size = 0;
      try {
        size = fs.statSync(absolute).size;
      } catch (error) {
        errors.push(error.code || "stat-failed");
        continue;
      }
      fileCount += 1;
      totalBytes += size;
      const relative = path.relative(reportRoot, absolute) || entry.name;
      const extension = path.extname(entry.name).toLowerCase() || "[no-extension]";
      extensions[extension] = (extensions[extension] || 0) + 1;
      if (sample.length < 20) sample.push({ path: relative, bytes: size });
      if (fileCount >= MAX_FILES || totalBytes > MAX_BYTES) break;
    }
  }

  return {
    ok: errors.length === 0,
    fileCount,
    totalBytes,
    capped: fileCount >= MAX_FILES || totalBytes > MAX_BYTES,
    extensionCounts: Object.fromEntries(Object.entries(extensions).sort(([left], [right]) => left.localeCompare(right))),
    sample,
    errors: [...new Set(errors)],
  };
}

function startMcpServer(topic, workspaceRoot, pluginRoot) {
  const prefix = topic.id.replaceAll("-", "_");
  const statusTool = `seis_${prefix}_status`;
  const reportTool = `seis_${prefix}_report`;
  const tools = [
    {
      name: statusTool,
      description: "Report this public SEIS topic package boundary without external access.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: reportTool,
      description: "Read bounded local repository shape evidence for this topic.",
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
      send({ jsonrpc: "2.0", id: message.id, result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: topic.id, version: readPluginVersion(pluginRoot) },
      } });
      return;
    }
    if (message.method === "tools/list") {
      send({ jsonrpc: "2.0", id: message.id, result: { tools } });
      return;
    }
    if (message.method !== "tools/call") return;
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    if (name === statusTool) {
      send({ jsonrpc: "2.0", id: message.id, result: topicStatus(topic, pluginRoot) });
      return;
    }
    if (name === reportTool) {
      const requestedRoot = args.path ? path.resolve(args.path) : workspaceRoot;
      const reportRoot = resolveInside(requestedRoot, workspaceRoot);
      const result = reportRoot ? topicReport(topic, reportRoot) : invalidReport(topic, "report path must remain inside the SEIS workspace");
      send({ jsonrpc: "2.0", id: message.id, result });
      return;
    }
    send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: `Unknown tool: ${name || "undefined"}` } });
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

function resolveWorkspaceRoot(pluginRoot) {
  const candidates = [
    process.env.SEIS_WORKSPACE_ROOT,
    process.env.SEIS_ROOT,
    process.env.SEIS_REPO_ROOT,
    path.resolve(pluginRoot, "../../.."),
  ].filter(Boolean);
  return candidates.map((candidate) => path.resolve(candidate)).find((candidate) => fs.existsSync(path.join(candidate, "package.json"))) || path.resolve(pluginRoot, "../../..");
}

function resolveInside(candidate, workspaceRoot) {
  const root = path.resolve(workspaceRoot);
  const target = path.resolve(candidate);
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative)) ? target : null;
}

function readPluginVersion(pluginRoot) {
  try {
    return JSON.parse(fs.readFileSync(path.join(pluginRoot, "assets", "topic-profile.json"), "utf8")).version || "0.1.0";
  } catch {
    return "0.1.0";
  }
}
