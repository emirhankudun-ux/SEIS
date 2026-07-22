#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const BUNDLE = {
  "id": "seis-topic-bundle-06",
  "displayName": "SEIS Topic: Cloud Computing 01 of 02",
  "family": "topic",
  "memberCount": 13,
  "members": [
    {
      "name": "seis-topic-cloud-computing",
      "displayName": "SEIS Cloud Computing",
      "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing",
      "category": "Cloud Computing"
    },
    {
      "name": "seis-topic-cloud-computing-ci-cd",
      "displayName": "SEIS CI/CD",
      "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-ci-cd",
      "category": "Cloud Computing"
    },
    {
      "name": "seis-topic-cloud-computing-cloud-native",
      "displayName": "SEIS Cloud Native",
      "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-cloud-native",
      "category": "Cloud Computing"
    },
    {
      "name": "seis-topic-cloud-computing-containers",
      "displayName": "SEIS Containers",
      "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-containers",
      "category": "Cloud Computing"
    },
    {
      "name": "seis-topic-cloud-computing-devops",
      "displayName": "SEIS DevOps",
      "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-devops",
      "category": "Cloud Computing"
    },
    {
      "name": "seis-topic-cloud-computing-devsecops",
      "displayName": "SEIS DevSecOps",
      "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-devsecops",
      "category": "Cloud Computing"
    },
    {
      "name": "seis-topic-cloud-computing-docker",
      "displayName": "SEIS Docker",
      "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-docker",
      "category": "Cloud Computing"
    },
    {
      "name": "seis-topic-cloud-computing-edge-computing",
      "displayName": "SEIS Edge Computing",
      "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-edge-computing",
      "category": "Cloud Computing"
    },
    {
      "name": "seis-topic-cloud-computing-hybrid-cloud",
      "displayName": "SEIS Hybrid Cloud",
      "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-hybrid-cloud",
      "category": "Cloud Computing"
    },
    {
      "name": "seis-topic-cloud-computing-infrastructure",
      "displayName": "SEIS Infrastructure",
      "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-infrastructure",
      "category": "Cloud Computing"
    },
    {
      "name": "seis-topic-cloud-computing-infrastructure-as-code",
      "displayName": "SEIS Infrastructure as Code",
      "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-infrastructure-as-code",
      "category": "Cloud Computing"
    },
    {
      "name": "seis-topic-cloud-computing-kubernetes",
      "displayName": "SEIS Kubernetes",
      "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-kubernetes",
      "category": "Cloud Computing"
    },
    {
      "name": "seis-topic-cloud-computing-logging",
      "displayName": "SEIS Logging",
      "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-logging",
      "category": "Cloud Computing"
    }
  ],
  "canonicalInstall": "seis-ai-agent@seis-repo",
  "statusTool": "seis_topic_bundle_06_status",
  "membersTool": "seis_topic_bundle_06_members",
  "planTool": "seis_topic_bundle_06_plan"
};

let pending = Buffer.alloc(0);
let outputBackpressured = false;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const MAX_HEADER_BYTES = 8 * 1024;
const MAX_FRAME_BYTES = 64 * 1024;
const MAX_BUFFER_BYTES = MAX_HEADER_BYTES + MAX_FRAME_BYTES;
const MAX_RESPONSE_BYTES = 64 * 1024;
const MAX_REQUEST_CHARACTERS = 4 * 1024;
const MAX_METADATA_FILE_BYTES = 512 * 1024;
const SAFE_PERMISSIONS = Object.freeze({
  read: Object.freeze(["bundle profile", "bounded member manifest presence"]),
  write: Object.freeze([]),
  network: Object.freeze([]),
  secrets: Object.freeze([]),
});

function pluginRoot() {
  return safeDirectory(process.env.SEIS_PUBLIC_BUNDLE_ROOT || path.join(scriptDir, ".."));
}

function repositoryRoot() {
  const candidates = [
    process.env.SEIS_ROOT,
    process.env.SEIS_REPO_ROOT,
    path.resolve(pluginRoot(), "..", "..", ".."),
  ].filter(Boolean);
  for (const candidate of candidates) {
    const root = safeDirectory(candidate);
    if (root && regularFileWithin(root, "package.json", MAX_METADATA_FILE_BYTES)) return root;
  }
  return null;
}

function profile() {
  const root = pluginRoot();
  const profilePath = regularFileWithin(root, "assets/bundle-profile.json", MAX_METADATA_FILE_BYTES);
  if (!profilePath) throw new Error("Bundle profile is unavailable or unsafe.");
  const descriptor = fs.openSync(profilePath, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile() || stat.size > MAX_METADATA_FILE_BYTES) throw new Error("Bundle profile is unavailable or unsafe.");
    return validateProfile(JSON.parse(fs.readFileSync(descriptor, "utf8")));
  } finally {
    fs.closeSync(descriptor);
  }
}

function validateProfile(value) {
  if (!plainObject(value)
      || value.schemaVersion !== 1
      || value.id !== BUNDLE.id
      || value.family !== BUNDLE.family
      || value.memberCount !== BUNDLE.memberCount
      || value.canonicalInstall !== BUNDLE.canonicalInstall
      || !Array.isArray(value.members)
      || value.members.length !== BUNDLE.memberCount
      || !sameMembers(value.members, BUNDLE.members)
      || !plainObject(value.installationPolicy)
      || value.installationPolicy.defaultInstall !== false
      || value.installationPolicy.optionalSelectionBundle !== true
      || value.installationPolicy.bundleMembersAutoInstalled !== false
      || value.installationPolicy.sourcePackagesRetained !== true
      || value.installationPolicy.sourcePackagesDeleted !== false
      || !samePermissions(value.permissions, SAFE_PERMISSIONS)) {
    throw new Error("Bundle profile is unavailable or unsafe.");
  }
  return value;
}

function plainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function sameMembers(actual, expected) {
  return actual.every((member, index) => plainObject(member)
    && member.name === expected[index].name
    && member.displayName === expected[index].displayName
    && member.sourcePath === expected[index].sourcePath
    && member.category === expected[index].category
    && Object.keys(member).sort().join(",") === "category,displayName,name,sourcePath");
}

function samePermissions(actual, expected) {
  if (!plainObject(actual) || Object.keys(actual).sort().join(",") !== "network,read,secrets,write") return false;
  return ["read", "write", "network", "secrets"].every((key) => Array.isArray(actual[key])
    && actual[key].length === expected[key].length
    && actual[key].every((entry, index) => entry === expected[key][index]));
}

function memberReadiness(member, repoRoot) {
  const sourcePath = String(member?.sourcePath || "");
  const relative = sourcePath.startsWith("./plugins/") ? sourcePath.slice(2) : "";
  const manifestPath = repoRoot && relative
    ? regularFileWithin(repoRoot, path.posix.join(relative, ".codex-plugin", "plugin.json"), MAX_METADATA_FILE_BYTES)
    : null;
  return {
    name: member?.name || null,
    displayName: member?.displayName || null,
    category: member?.category || null,
    sourcePath: member?.sourcePath || null,
    retainedSourceManifest: Boolean(manifestPath),
  };
}

function safeDirectory(candidate) {
  if (typeof candidate !== "string" || !candidate.trim()) return null;
  const absolute = path.resolve(candidate);
  try {
    const stat = fs.lstatSync(absolute);
    return stat.isDirectory() && !stat.isSymbolicLink() ? absolute : null;
  } catch {
    return null;
  }
}

function regularFileWithin(root, relativePath, maximumBytes) {
  if (!root || typeof relativePath !== "string" || path.isAbsolute(relativePath)) return null;
  const parts = relativePath.replaceAll("\\", "/").split("/");
  if (parts.length === 0 || parts.some((part) => !part || part === "." || part === "..")) return null;
  let current = root;
  try {
    for (let index = 0; index < parts.length; index += 1) {
      current = path.join(current, parts[index]);
      const stat = fs.lstatSync(current);
      if (stat.isSymbolicLink()) return null;
      if (index < parts.length - 1 && !stat.isDirectory()) return null;
      if (index === parts.length - 1 && (!stat.isFile() || stat.size > maximumBytes)) return null;
    }
  } catch {
    return null;
  }
  const relative = path.relative(root, current);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative) ? current : null;
}

function status() {
  const currentProfile = profile();
  const repoRoot = repositoryRoot();
  const members = Array.isArray(currentProfile.members) ? currentProfile.members : [];
  const readiness = members.map((member) => memberReadiness(member, repoRoot));
  return {
    status: readiness.every((member) => member.retainedSourceManifest) ? "ready" : "partial",
    bundle: BUNDLE.id,
    family: BUNDLE.family,
    canonicalInstall: BUNDLE.canonicalInstall,
    memberCount: members.length,
    retainedSourceManifestCount: readiness.filter((member) => member.retainedSourceManifest).length,
    optionalSelectionBundle: currentProfile.installationPolicy?.optionalSelectionBundle === true,
    bulkInstallRequired: false,
    permissions: SAFE_PERMISSIONS,
  };
}

function members() {
  const currentProfile = profile();
  const repoRoot = repositoryRoot();
  return {
    bundle: BUNDLE.id,
    memberCount: currentProfile.memberCount,
    members: (Array.isArray(currentProfile.members) ? currentProfile.members : []).map((member) => memberReadiness(member, repoRoot)),
  };
}

function plan(input) {
  const request = typeof input?.request === "string" ? input.request.trim() : "";
  if (!request || request.length > MAX_REQUEST_CHARACTERS) {
    return { error: { code: -32602, message: "Invalid params: request must contain 1-4096 characters." } };
  }
  profile();
  return {
    bundle: BUNDLE.id,
    request,
    steps: [
      "Read the active goal and select only members relevant to the request.",
      "Inspect each retained source package before depending on member-specific behavior.",
      "Keep SEIS-Agent as the canonical default installation and avoid bulk installation.",
      "Run the smallest relevant local validation and record risks and rollback.",
      "Require human approval for external writes, deployments, credentials, destructive actions, or marketplace publication.",
    ],
    permissions: SAFE_PERMISSIONS,
  };
}

const TOOLS = [
  { name: BUNDLE.statusTool, description: "Report read-only bundle and retained member-manifest readiness.", inputSchema: { type: "object", additionalProperties: false, properties: {} } },
  { name: BUNDLE.membersTool, description: "List the bounded 13-member source capability map.", inputSchema: { type: "object", additionalProperties: false, properties: {} } },
  { name: BUNDLE.planTool, description: "Create a bounded plan for this optional SEIS bundle.", inputSchema: { type: "object", additionalProperties: false, required: ["request"], properties: { request: { type: "string", minLength: 1, maxLength: MAX_REQUEST_CHARACTERS } } } },
];

function send(message) {
  let body = JSON.stringify(message);
  if (Buffer.byteLength(body, "utf8") > MAX_RESPONSE_BYTES) {
    body = JSON.stringify({
      jsonrpc: "2.0",
      id: safeResponseId(message?.id),
      error: { code: -32603, message: "Response exceeds the configured limit." },
    });
  }
  const frame = "Content-Length: " + Buffer.byteLength(body, "utf8") + "\r\n\r\n" + body;
  if (!process.stdout.write(frame) && !outputBackpressured) {
    outputBackpressured = true;
    process.stdin.pause();
    process.stdout.once("drain", () => {
      outputBackpressured = false;
      process.stdin.resume();
    });
  }
}

function safeResponseId(value) {
  if (Number.isSafeInteger(value)) return value;
  return typeof value === "string" && value.length <= 128 ? value : null;
}

function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "initialize") {
    send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: BUNDLE.id, version: "0.1.0" } } });
    return;
  }
  if (message.method === "tools/list") {
    send({ jsonrpc: "2.0", id: message.id, result: { tools: TOOLS } });
    return;
  }
  if (message.method === "tools/call") {
    const name = message.params?.name;
    const input = message.params?.arguments || {};
    let result;
    try {
      result = name === BUNDLE.statusTool ? status() : name === BUNDLE.membersTool ? members() : name === BUNDLE.planTool ? plan(input) : null;
    } catch {
      send({ jsonrpc: "2.0", id: message.id, error: { code: -32603, message: "Bundle metadata is unavailable or unsafe." } });
      return;
    }
    if (result?.error) {
      send({ jsonrpc: "2.0", id: message.id, error: result.error });
    } else if (result) {
      send({ jsonrpc: "2.0", id: message.id, result });
    } else {
      send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: "Unknown tool: " + String(name || "undefined") } });
    }
  }
}

function processStream() {
  while (true) {
    const separator = pending.indexOf("\r\n\r\n");
    if (separator < 0) {
      if (pending.length > MAX_HEADER_BYTES) rejectPendingFrame("Header exceeds the configured limit.");
      return;
    }
    if (separator > MAX_HEADER_BYTES) {
      rejectPendingFrame("Header exceeds the configured limit.");
      return;
    }
    const header = pending.slice(0, separator).toString("utf8");
    const lengths = header.split("\r\n")
      .map((line) => /^Content-Length:\s*(\d+)\s*$/i.exec(line))
      .filter(Boolean);
    if (lengths.length !== 1) {
      rejectPendingFrame("Exactly one Content-Length header is required.");
      return;
    }
    const contentLength = Number.parseInt(lengths[0][1], 10);
    if (!Number.isSafeInteger(contentLength) || contentLength <= 0 || contentLength > MAX_FRAME_BYTES) {
      rejectPendingFrame("Content-Length exceeds the configured limit.");
      return;
    }
    const bodyStart = separator + 4;
    const bodyEnd = bodyStart + contentLength;
    if (pending.length < bodyEnd) return;
    const body = pending.slice(bodyStart, bodyEnd);
    pending = pending.slice(bodyEnd);
    try {
      handle(JSON.parse(body.toString("utf8")));
    } catch {
      send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Invalid JSON frame." } });
    }
  }
}

function rejectPendingFrame(message) {
  pending = Buffer.alloc(0);
  send({ jsonrpc: "2.0", id: null, error: { code: -32700, message } });
}

process.stdin.on("data", (chunk) => {
  if (!Buffer.isBuffer(chunk) || pending.length + chunk.length > MAX_BUFFER_BYTES) {
    rejectPendingFrame("Input buffer exceeds the configured limit.");
    return;
  }
  pending = Buffer.concat([pending, chunk]);
  processStream();
});
