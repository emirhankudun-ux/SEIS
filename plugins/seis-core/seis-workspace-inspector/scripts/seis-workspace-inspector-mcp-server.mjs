#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(scriptDir, "..");
const ignoredNames = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "target",
  "DerivedData",
  ".next",
  "coverage",
  "vendor",
  "cache",
  "caches",
  "model-weights",
]);
const manifestNames = [
  "package.json",
  "pnpm-workspace.yaml",
  "Cargo.toml",
  "Package.swift",
  "pyproject.toml",
  "requirements.txt",
  "go.mod",
  "pom.xml",
  "build.gradle",
  "composer.json",
];
const technologyByManifest = new Map([
  ["package.json", "Node.js"],
  ["pnpm-workspace.yaml", "pnpm"],
  ["Cargo.toml", "Rust"],
  ["Package.swift", "Swift Package Manager"],
  ["pyproject.toml", "Python"],
  ["requirements.txt", "Python"],
  ["go.mod", "Go"],
  ["pom.xml", "JVM"],
  ["build.gradle", "JVM"],
  ["composer.json", "PHP"],
]);
const riskName = (name) =>
  name === ".env" ||
  (name.startsWith(".env.") && name !== ".env.example") ||
  /(?:\.pem|\.key|credentials\.json|tokens\.json|^id_(?:rsa|ed25519)$)$/i.test(name);

function pluginStatus() {
  return {
    plugin: "seis-workspace-inspector",
    status: fs.existsSync(path.join(pluginRoot, ".codex-plugin", "plugin.json")) &&
      fs.existsSync(path.join(pluginRoot, ".mcp.json")) &&
      fs.existsSync(path.join(pluginRoot, "skills", "seis-workspace-inspector", "SKILL.md"))
      ? "ready"
      : "partial",
    mode: "local-read-only",
    network: "disabled-by-design",
    writes: "disabled-by-design",
    secrets: "not-read",
  };
}

function resolveWorkspace(rawValue) {
  const candidate = path.resolve(rawValue || process.env.SEIS_WORKSPACE_ROOT || process.cwd());
  let stat;
  try {
    stat = fs.lstatSync(candidate);
  } catch {
    return { error: "workspace-not-found" };
  }
  if (stat.isSymbolicLink()) return { error: "symlink-target-refused" };
  if (!stat.isDirectory()) return { error: "workspace-is-not-directory" };
  return { candidate };
}

function inspectWorkspace(rawValue) {
  const resolved = resolveWorkspace(rawValue);
  if (resolved.error) {
    return { state: "invalid-input", error: resolved.error, mode: "local-read-only" };
  }
  const root = resolved.candidate;
  const entries = [];
  const manifests = [];
  const technologies = [];
  const markers = {};
  const riskEntries = [];
  for (const name of [".git", ".github", "AGENTS.md", "project.ecosystem.yaml", "goals", "docs", "scripts"]) {
    markers[name] = fs.existsSync(path.join(root, name));
  }
  let dirEntries = [];
  try {
    dirEntries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return { state: "unreadable", rootName: path.basename(root), mode: "local-read-only" };
  }
  for (const entry of dirEntries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (ignoredNames.has(entry.name)) continue;
    const kind = entry.isSymbolicLink() ? "symlink" : entry.isDirectory() ? "directory" : "file";
    entries.push({ name: entry.name, kind });
    if (riskName(entry.name)) riskEntries.push(entry.name);
    if (entry.isFile() && manifestNames.includes(entry.name)) {
      manifests.push(entry.name);
      technologies.push(technologyByManifest.get(entry.name));
    }
  }
  const uniqueTechnologies = [...new Set(technologies)].sort();
  return {
    state: riskEntries.length ? "attention" : "ready",
    mode: "local-read-only",
    rootName: path.basename(root) || "/",
    entryCount: entries.length,
    entries,
    manifests: manifests.sort(),
    technologies: uniqueTechnologies,
    repositoryMarkers: markers,
    riskEntryNames: riskEntries.sort(),
    limitations: [
      "Only root-level metadata is inspected.",
      "Ignored build, dependency, cache, and model directories are not traversed.",
      "File contents, credentials, network endpoints, and symlink targets are not read.",
    ],
  };
}

const tools = [
  {
    name: "seis_workspace_inspector_status",
    description: "Report the local-only readiness and permission boundary of the workspace inspector.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "seis_workspace_inspect",
    description: "Inspect safe root-level workspace metadata without writing or reading file contents.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string", description: "Workspace path; defaults to the current working directory." } },
    },
  },
];

function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`);
}

let pending = Buffer.alloc(0);
function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") {
    send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "seis-workspace-inspector", version: "0.1.0" } } });
  } else if (message.method === "tools/list") {
    send({ jsonrpc: "2.0", id: message.id, result: { tools } });
  } else if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const result = name === "seis_workspace_inspector_status" ? pluginStatus() : name === "seis_workspace_inspect" ? inspectWorkspace(args.path) : null;
    if (result) send({ jsonrpc: "2.0", id: message.id, result });
    else send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: `Unknown tool: ${name ?? "undefined"}` } });
  }
}

function processStream() {
  while (true) {
    const separator = pending.indexOf("\r\n\r\n");
    if (separator < 0) return;
    const header = pending.slice(0, separator).toString("utf8");
    const match = /Content-Length:\s*(\d+)/i.exec(header);
    if (!match) {
      pending = pending.slice(separator + 4);
      continue;
    }
    const length = Number.parseInt(match[1], 10);
    const bodyStart = separator + 4;
    if (pending.length < bodyStart + length) return;
    try {
      handle(JSON.parse(pending.slice(bodyStart, bodyStart + length).toString("utf8")));
    } catch {
      // Ignore malformed input; the server never writes to the inspected workspace.
    }
    pending = pending.slice(bodyStart + length);
  }
}

const args = process.argv.slice(2);
if (args.includes("--status")) {
  console.log(JSON.stringify(pluginStatus(), null, 2));
} else if (args.includes("--inspect")) {
  const index = args.indexOf("--path");
  console.log(JSON.stringify(inspectWorkspace(index >= 0 ? args[index + 1] : undefined), null, 2));
} else {
  process.stdin.on("data", (chunk) => {
    pending = Buffer.concat([pending, Buffer.from(chunk)]);
    processStream();
  });
  process.stdin.on("end", () => process.exit(0));
}
