#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import {
  SEIS_APPLICATION_BUNDLE_PREFIX,
  SEIS_PUBLIC_BUNDLE_ROOT,
  SEIS_PUBLIC_BUNDLE_SIZE,
  SEIS_PUBLIC_MARKETPLACE_MAX_CARD_COUNT,
  SEIS_PUBLIC_MARKETPLACE_MIN_CARD_COUNT,
  SEIS_TOPIC_BUNDLE_PREFIX,
} from "./lib/seis-public-bundle-plan.mjs";
import { validateExpectedBundleTree } from "./lib/seis-public-bundle-output-tree.mjs";

const ROOT = process.cwd();
const CHECK_MODE = process.argv.includes("--check");
const FAMILY_PATH = "content/development/seis-public-plugin-family.json";
const CATALOG_PATH = "content/development/seis-public-plugin-bundle-catalog.json";
const GENERATED_AT = "2026-07-22";
const BUNDLE_VERSION = "0.1.0";
const MAX_GENERATOR_INPUT_BYTES = 16 * 1024 * 1024;
const MAX_GENERATED_FILE_BYTES = 2 * 1024 * 1024;
let writeSequence = 0;

const family = readJson(FAMILY_PATH);
const bundles = Array.isArray(family?.bundlePackages) ? family.bundlePackages : [];
validateBundleFamily(family, bundles);

const catalog = {
  schemaVersion: 1,
  id: "seis-public-plugin-bundle-catalog",
  goalId: "SEIS-GOAL-021",
  generatedAt: GENERATED_AT,
  status: "repository-local-public-bundle-packages",
  maturity: "prototype",
  purpose: "Materialize curated, bounded public SEIS Repo selection bundles without deleting source packages or making bulk-install, provider, network, write, or release claims.",
  canonicalInstall: "seis-ai-agent@seis-repo",
  marketplace: {
    name: "seis-repo",
    publicCardCount: family.marketplace.publicPluginCount,
    canonicalCardCount: family.publicPlugins.length,
    bundleCardCount: bundles.length,
    applicationBundleCardCount: bundles.filter((bundle) => bundle.family === "application").length,
    topicBundleCardCount: bundles.filter((bundle) => bundle.family === "topic").length,
  },
  sourceCapabilityInventory: {
    rootSourceModuleCount: family.migratedRootPlugins.length,
    applicationSourcePackageCount: family.applicationPlugins.length,
    topicSourcePackageCount: family.topicPlugins.length,
    retainedSourcePackageCount: family.migratedRootPlugins.length + family.applicationPlugins.length + family.topicPlugins.length,
    sourcePackagesDeleted: false,
  },
  installationPolicy: {
    default: `Install SEIS-Agent. Choose at most one optional bundle when its scope of no more than ${SEIS_PUBLIC_BUNDLE_SIZE} capabilities matches the task.`,
    bulkInstallRequired: false,
    bundleMembersAutoInstalled: false,
    bundleMembersRemainRepositorySources: true,
  },
  bundles: bundles.map((bundle) => ({
    id: bundle.id,
    family: bundle.family,
    journeyId: bundle.journeyId,
    journeyLabel: bundle.journeyLabel,
    journeyPart: bundle.journeyPart,
    journeyPartCount: bundle.journeyPartCount,
    sourcePath: bundle.sourcePath,
    memberCount: bundle.memberCount,
    category: bundle.category,
    categoryLabels: bundle.categoryLabels,
    memberNames: bundle.members.map((member) => member.name),
  })),
  permissions: {
    read: ["bundle profile", "bounded repository member manifests"],
    write: [],
    network: [],
    secrets: [],
  },
  validation: [
    "npm run check:seis-public-plugin-bundles",
    "npm run check:seis-public-plugin-family",
    "npm run check:seis-repo-marketplace",
  ],
  externalClaims: {
    publicRelease: false,
    providerConnectivity: false,
    deployment: false,
    signing: false,
    automaticSourceDeletion: false,
  },
  rollback: {
    strategy: "revert",
    scope: "Revert the generated bundle packages and marketplace projection on the feature branch; retained source packages and SEIS-Agent remain intact.",
    dataMigrationRequired: false,
  },
};

const outputs = [
  [CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`],
  ...bundles.flatMap((bundle) => bundleOutputs(bundle)),
];
const expectedBundleFiles = outputs
  .map(([file]) => file.replaceAll(path.sep, "/"))
  .filter((file) => file.startsWith(`${SEIS_PUBLIC_BUNDLE_ROOT}/`));

if (CHECK_MODE) {
  const stale = outputs.filter(([file, expected]) => readOptionalText(file) !== expected).map(([file]) => file);
  if (stale.length > 0) {
    console.error("SEIS public bundle package files are stale:");
    for (const file of stale) console.error(`- ${file}`);
    console.error("Run node scripts/create-seis-public-plugin-bundles.mjs to refresh generated public bundle packages.");
    process.exit(1);
  }
  const tree = validateExpectedBundleTree({ repositoryRoot: ROOT, bundleRootRelative: SEIS_PUBLIC_BUNDLE_ROOT, expectedFilePaths: expectedBundleFiles });
  console.log(`SEIS public bundle package check passed (${bundles.length} bundles / ${tree.fileCount} allowlisted files / ${family.marketplace.publicPluginCount} cards).`);
} else {
  for (const [file, text] of outputs) {
    writeText(file, text);
    console.log(`SEIS public bundle package written: ${file}`);
  }
  const tree = validateExpectedBundleTree({ repositoryRoot: ROOT, bundleRootRelative: SEIS_PUBLIC_BUNDLE_ROOT, expectedFilePaths: expectedBundleFiles });
  console.log(`SEIS public bundle tree verified (${tree.fileCount} allowlisted files).`);
}

function validateBundleFamily(publicFamily, candidateBundles) {
  assert(publicFamily?.id === "seis-public-plugin-family", "public family input is invalid");
  assert(publicFamily?.defaultInstall?.installId === "seis-ai-agent@seis-repo", "SEIS-Agent must stay canonical");
  assert(publicFamily?.marketplace?.publicPluginCount >= SEIS_PUBLIC_MARKETPLACE_MIN_CARD_COUNT
    && publicFamily?.marketplace?.publicPluginCount <= SEIS_PUBLIC_MARKETPLACE_MAX_CARD_COUNT,
  `public family must project ${SEIS_PUBLIC_MARKETPLACE_MIN_CARD_COUNT}-${SEIS_PUBLIC_MARKETPLACE_MAX_CARD_COUNT} marketplace cards`);
  assert(candidateBundles.length === publicFamily.marketplace.publicPluginCount - 1, "bundle package count must match the marketplace projection");
  const application = candidateBundles.filter((bundle) => bundle?.family === "application");
  const topics = candidateBundles.filter((bundle) => bundle?.family === "topic");
  assert(application.length === publicFamily?.marketplace?.applicationBundlePluginCount && application.length > 0, "application bundle count is inconsistent");
  assert(topics.length === publicFamily?.marketplace?.topicBundlePluginCount && topics.length > 0, "topic bundle count is inconsistent");
  assert(candidateBundles.every((bundle) => Number.isInteger(bundle?.memberCount)
    && bundle.memberCount > 0
    && bundle.memberCount <= SEIS_PUBLIC_BUNDLE_SIZE
    && Array.isArray(bundle?.members)
    && bundle.members.length === bundle.memberCount), `every bundle must contain 1-${SEIS_PUBLIC_BUNDLE_SIZE} members`);
  assert(application.every((bundle, index) => bundle.id === `${SEIS_APPLICATION_BUNDLE_PREFIX}-${String(index + 1).padStart(2, "0")}`), "application bundle IDs are not deterministic");
  assert(topics.every((bundle, index) => bundle.id === `${SEIS_TOPIC_BUNDLE_PREFIX}-${String(index + 1).padStart(2, "0")}`), "topic bundle IDs are not deterministic");
  assert(candidateBundles.every((bundle) => typeof bundle.journeyId === "string"
    && bundle.journeyId.length > 0
    && typeof bundle.journeyLabel === "string"
    && bundle.journeyLabel.length > 0
    && Number.isInteger(bundle.journeyPart)
    && Number.isInteger(bundle.journeyPartCount)
    && bundle.journeyPart > 0
    && bundle.journeyPart <= bundle.journeyPartCount), "bundle journey metadata is invalid");
  assert(topics.every((bundle) => Array.isArray(bundle.categoryLabels) && bundle.categoryLabels.length === 1), "topic bundles must preserve one category boundary");
  for (const protectedCategory of ["ELENI-NEFERI", "PANTECHNOEPISTEMONOESIS", "SEIS"]) {
    assert(topics.some((bundle) => bundle.categoryLabels?.length === 1 && bundle.categoryLabels[0] === protectedCategory), `missing protected topic boundary: ${protectedCategory}`);
  }
  const names = candidateBundles.flatMap((bundle) => bundle.members.map((member) => member?.name));
  const paths = candidateBundles.flatMap((bundle) => bundle.members.map((member) => member?.sourcePath));
  assert(new Set(names).size === names.length, "bundle member names must be unique");
  assert(new Set(paths).size === paths.length, "bundle member paths must be unique");
  assert(application.flatMap((bundle) => bundle.members).length === publicFamily.applicationPlugins.length, "application bundles must cover every app source package");
  assert(topics.flatMap((bundle) => bundle.members).length === publicFamily.topicPlugins.length, "topic bundles must cover every topic source package");
  assertSameSet(application.flatMap((bundle) => bundle.members.map((member) => member.name)), publicFamily.applicationPlugins.map((plugin) => plugin.name), "application bundle coverage");
  assertSameSet(topics.flatMap((bundle) => bundle.members.map((member) => member.name)), publicFamily.topicPlugins.map((plugin) => plugin.name), "topic bundle coverage");
}

function bundleOutputs(bundle) {
  const base = path.join(SEIS_PUBLIC_BUNDLE_ROOT, bundle.id);
  return [
    [path.join(base, ".codex-plugin", "plugin.json"), `${JSON.stringify(pluginManifest(bundle), null, 2)}\n`],
    [path.join(base, ".mcp.json"), `${JSON.stringify(pluginMcpManifest(bundle), null, 2)}\n`],
    [path.join(base, "assets", "bundle-profile.json"), `${JSON.stringify(bundleProfile(bundle), null, 2)}\n`],
    [path.join(base, "skills", bundle.id, "SKILL.md"), bundleSkill(bundle)],
    [path.join(base, "scripts", "seis-bundle-mcp-server.mjs"), bundleMcpServer(bundle)],
    [path.join(base, "README.md"), bundleReadme(bundle)],
  ];
}

function pluginManifest(bundle) {
  return {
    name: bundle.id,
    version: BUNDLE_VERSION,
    description: bundle.longDescription,
    author: {
      name: "emirhankudun-ux",
      url: "https://github.com/emirhankudun-ux",
    },
    homepage: "https://github.com/emirhankudun-ux/SEIS",
    repository: "https://github.com/emirhankudun-ux/SEIS",
    license: "MIT",
    keywords: ["seis", "bundle", bundle.family, "read-only", "repository-source", "mcp"],
    skills: "./skills/",
    mcpServers: "./.mcp.json",
    interface: {
      displayName: bundle.displayName,
      shortDescription: bundle.shortDescription,
      longDescription: bundle.longDescription,
      developerName: "emirhankudun-ux",
      category: bundle.category,
      capabilities: [
        `${bundle.memberCount} source capabilities`,
        "Read-only bundle inventory",
        "Bundle selection planning",
        "MCP status and member tools",
        "Explicit safety boundaries",
      ],
      websiteURL: "https://github.com/emirhankudun-ux/SEIS",
      defaultPrompt: [
        `Show the ${bundle.memberCount} source capabilities in ${bundle.displayName}.`,
        `Plan a safe SEIS task using ${bundle.displayName}.`,
      ],
      brandColor: bundle.family === "application" ? "#0F766E" : "#2563EB",
    },
  };
}

function pluginMcpManifest(bundle) {
  return {
    mcpServers: {
      [bundle.id]: {
        command: "node",
        args: ["./scripts/seis-bundle-mcp-server.mjs"],
      },
    },
  };
}

function bundleProfile(bundle) {
  return {
    schemaVersion: 1,
    id: bundle.id,
    family: bundle.family,
    journeyId: bundle.journeyId,
    journeyLabel: bundle.journeyLabel,
    journeyPart: bundle.journeyPart,
    journeyPartCount: bundle.journeyPartCount,
    generatedAt: GENERATED_AT,
    status: "repository-local-public-bundle",
    maturity: "prototype",
    memberCount: bundle.memberCount,
    category: bundle.category,
    categoryLabels: bundle.categoryLabels,
    members: bundle.members,
    canonicalInstall: "seis-ai-agent@seis-repo",
    installationPolicy: {
      defaultInstall: false,
      optionalSelectionBundle: true,
      bundleMembersAutoInstalled: false,
      sourcePackagesRetained: true,
      sourcePackagesDeleted: false,
    },
    permissions: {
      read: ["bundle profile", "bounded member manifest presence"],
      write: [],
      network: [],
      secrets: [],
    },
    qualityCommands: [
      "npm run check:seis-public-plugin-bundles",
      "npm run check:seis-public-plugin-family",
      "npm run check:seis-repo-marketplace",
    ],
    externalClaims: {
      providerConnectivity: false,
      deployment: false,
      publicRelease: false,
      automaticMerge: false,
      sourceDeletion: false,
    },
  };
}

function bundleSkill(bundle) {
  return [
    "---",
    `name: ${bundle.id}`,
    `description: Select and plan with ${bundle.memberCount} retained ${bundle.family} source capabilities without bulk installation or external writes.`,
    "---",
    "",
    `# ${bundle.displayName}`,
    "",
    bundle.longDescription,
    "",
    "## Workflow",
    "",
    "1. Read the repository instructions, project manifest, active goal, and public bundle profile.",
    `2. Use the bundle MCP status and members tools to identify the bounded ${bundle.memberCount}-member source set.`,
    "3. Keep SEIS-Agent as the canonical default installation; choose this bundle only when its scope fits.",
    "4. Inspect the retained source package before relying on a member-specific runtime or command.",
    "5. Produce a bounded plan with validation, risks, rollback, and explicit approval gates for external actions.",
    "",
    "## Safety boundary",
    "",
    "- Read-only bundle metadata and bounded repository member-manifest checks only.",
    "- No bulk installation, automatic source merge, deletion, provider connection, network access, secrets, deployment, or write action.",
    "- Member source packages remain in the public repository and are not silently removed by this bundle.",
    "",
    "## Included source capabilities",
    "",
    ...bundle.members.map((member) => `- ${member.displayName} — \`${member.name}\` (${member.category})`),
    "",
    "## MCP tools",
    "",
    `- \`${toolName(bundle, "status")}\` reports package and member-manifest readiness.`,
    `- \`${toolName(bundle, "members")}\` returns the bounded ${bundle.memberCount}-member map.`,
    `- \`${toolName(bundle, "plan")}\` creates a local planning outline without writes.`,
    "",
  ].join("\n");
}

function bundleReadme(bundle) {
  return [
    `# ${bundle.displayName}`,
    "",
    bundle.longDescription,
    "",
    "## What this package is",
    "",
    `This is an optional public SEIS Repo selection bundle that groups exactly ${bundle.memberCount} retained ${bundle.family} source capabilities. It is not a bulk installer and does not claim live provider, deployment, signing, or external write access.`,
    "",
    "## Components",
    "",
    "- `.codex-plugin/plugin.json` defines the public bundle card.",
    "- `.mcp.json` exposes a local read-only bundle MCP server.",
    `- \`assets/bundle-profile.json\` records the deterministic ${bundle.memberCount}-member map.`,
    `- \`skills/${bundle.id}/SKILL.md\` documents bounded selection and planning workflows.`,
    "",
    "## Installation policy",
    "",
    "Install `seis-ai-agent@seis-repo` by default. This bundle is optional and never auto-installs each member. The listed source packages remain retained in the public repository so a rollback only reverts this marketplace projection.",
    "",
    "## Validate",
    "",
    "```bash",
    "npm run check:seis-public-plugin-bundles",
    "npm run check:seis-public-plugin-family",
    "npm run check:seis-repo-marketplace",
    "```",
    "",
  ].join("\n");
}

function bundleMcpServer(bundle) {
  const statusTool = toolName(bundle, "status");
  const membersTool = toolName(bundle, "members");
  const planTool = toolName(bundle, "plan");
  return `#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const BUNDLE = ${JSON.stringify({
    id: bundle.id,
    displayName: bundle.displayName,
    family: bundle.family,
    memberCount: bundle.memberCount,
    members: bundle.members.map((member) => ({
      name: member.name,
      displayName: member.displayName,
      sourcePath: member.sourcePath,
      category: member.category,
    })),
    canonicalInstall: "seis-ai-agent@seis-repo",
    statusTool,
    membersTool,
    planTool,
  }, null, 2)};

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
  const parts = relativePath.replaceAll("\\\\", "/").split("/");
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
  { name: BUNDLE.membersTool, description: "List the bounded ${bundle.memberCount}-member source capability map.", inputSchema: { type: "object", additionalProperties: false, properties: {} } },
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
  const frame = "Content-Length: " + Buffer.byteLength(body, "utf8") + "\\r\\n\\r\\n" + body;
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
    send({ jsonrpc: "2.0", id: message.id, result: { protocolVersion: "2024-11-05", capabilities: { tools: { listChanged: false } }, serverInfo: { name: BUNDLE.id, version: "${BUNDLE_VERSION}" } } });
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
    const separator = pending.indexOf("\\r\\n\\r\\n");
    if (separator < 0) {
      if (pending.length > MAX_HEADER_BYTES) rejectPendingFrame("Header exceeds the configured limit.");
      return;
    }
    if (separator > MAX_HEADER_BYTES) {
      rejectPendingFrame("Header exceeds the configured limit.");
      return;
    }
    const header = pending.slice(0, separator).toString("utf8");
    const lengths = header.split("\\r\\n")
      .map((line) => /^Content-Length:\\s*(\\d+)\\s*$/i.exec(line))
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
`;
}

function toolName(bundle, suffix) {
  return `${bundle.id.replaceAll("-", "_")}_${suffix}`;
}

function readJson(relativePath) {
  return JSON.parse(readRequiredText(relativePath));
}

function readRequiredText(relativePath) {
  return readBoundedText(relativePath, MAX_GENERATOR_INPUT_BYTES, true);
}

function readOptionalText(relativePath) {
  return readBoundedText(relativePath, MAX_GENERATED_FILE_BYTES, false);
}

function readBoundedText(relativePath, maximumBytes, required) {
  const absolutePath = safePath(relativePath);
  const rootStat = fs.lstatSync(ROOT);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) {
    throw new Error("SEIS public bundle packages: repository root must be a regular directory");
  }
  const relative = path.relative(ROOT, absolutePath);
  const parts = relative.split(path.sep).filter(Boolean);
  let current = ROOT;
  for (const [index, part] of parts.entries()) {
    current = path.join(current, part);
    if (!fs.existsSync(current)) {
      if (required) throw new Error(`SEIS public bundle packages: required input is missing: ${relativePath}`);
      return null;
    }
    const stat = fs.lstatSync(current);
    if (stat.isSymbolicLink()) {
      throw new Error(`SEIS public bundle packages: symbolic-link path component is forbidden: ${path.relative(ROOT, current)}`);
    }
    const isFinal = index === parts.length - 1;
    if (!isFinal && !stat.isDirectory()) {
      throw new Error(`SEIS public bundle packages: input ancestor must be a directory: ${path.relative(ROOT, current)}`);
    }
    if (isFinal && (!stat.isFile() || stat.size > maximumBytes)) {
      throw new Error(`SEIS public bundle packages: input must be a bounded regular file: ${relativePath}`);
    }
  }
  const descriptor = fs.openSync(absolutePath, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile() || stat.size > maximumBytes) {
      throw new Error(`SEIS public bundle packages: input must be a bounded regular file: ${relativePath}`);
    }
    return fs.readFileSync(descriptor, "utf8");
  } finally {
    fs.closeSync(descriptor);
  }
}

function writeText(relativePath, value) {
  const absolutePath = safePath(relativePath);
  ensureSafeParent(path.dirname(absolutePath));
  if (fs.existsSync(absolutePath)) {
    const stat = fs.lstatSync(absolutePath);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      throw new Error(`SEIS public bundle packages: output must be a regular non-link file: ${relativePath}`);
    }
  }
  writeSequence += 1;
  const temporaryPath = path.join(ROOT, `.seis-public-bundle-write.${process.pid}.${writeSequence}.tmp`);
  let descriptor = null;
  try {
    descriptor = fs.openSync(
      temporaryPath,
      fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW,
      0o644,
    );
    fs.writeFileSync(descriptor, value, "utf8");
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = null;
    ensureSafeParent(path.dirname(absolutePath));
    if (fs.existsSync(absolutePath)) {
      const stat = fs.lstatSync(absolutePath);
      if (!stat.isFile() || stat.isSymbolicLink()) {
        throw new Error(`SEIS public bundle packages: output changed to an unsafe entry: ${relativePath}`);
      }
    }
    fs.renameSync(temporaryPath, absolutePath);
  } catch (error) {
    if (descriptor !== null) fs.closeSync(descriptor);
    if (fs.existsSync(temporaryPath) && !fs.lstatSync(temporaryPath).isSymbolicLink()) fs.unlinkSync(temporaryPath);
    throw error;
  }
}

function safePath(relativePath) {
  if (typeof relativePath !== "string" || !relativePath || path.isAbsolute(relativePath)) {
    throw new Error(`SEIS public bundle packages: invalid repository-relative path: ${String(relativePath)}`);
  }
  const absolutePath = path.resolve(ROOT, relativePath);
  const relative = path.relative(ROOT, absolutePath);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`SEIS public bundle packages: path escapes repository root: ${relativePath}`);
  return absolutePath;
}

function ensureSafeParent(parentPath) {
  const rootStat = fs.lstatSync(ROOT);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) {
    throw new Error("SEIS public bundle packages: repository root must be a regular directory");
  }
  const relative = path.relative(ROOT, parentPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("SEIS public bundle packages: output parent escapes repository root");
  }
  let current = ROOT;
  for (const part of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    if (!fs.existsSync(current)) fs.mkdirSync(current, { mode: 0o755 });
    const stat = fs.lstatSync(current);
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
      throw new Error(`SEIS public bundle packages: output parent is not a regular directory: ${path.relative(ROOT, current)}`);
    }
  }
}

function assertSameSet(actual, expected, label) {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  assert(actualSet.size === actual.length, `${label} contains duplicates`);
  assert(expectedSet.size === expected.length, `${label} source inventory contains duplicates`);
  assert(actualSet.size === expectedSet.size && [...actualSet].every((value) => expectedSet.has(value)), `${label} is not exact-once`);
}

function assert(condition, message) {
  if (!condition) throw new Error(`SEIS public bundle packages: ${message}`);
}
