#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import {
  TOPIC_PLUGIN_SOURCE_ROOT,
  TOPIC_PLUGIN_TARGET,
  assertTopicObjective,
  flattenTopicObjective,
  readTopicObjective,
} from "../plugins/seis-topics/runtime/topic-definitions.mjs";
import { buildSeisPublicTopicBundles } from "./lib/seis-public-bundle-plan.mjs";

const ROOT = process.cwd();
const checkMode = process.argv.includes("--check");
const RELEASE_VERSION = "0.1.0";
const SOURCE_ROOT = TOPIC_PLUGIN_SOURCE_ROOT;
const objective = readTopicObjective(ROOT);
const topics = flattenTopicObjective(objective);
assertTopicObjective(objective, topics);
const topicBundles = buildSeisPublicTopicBundles({
  topicPlugins: topics.map((topic) => ({
    name: topic.id,
    displayName: topic.displayName,
    sourcePath: topic.sourcePath,
    category: topic.category,
  })),
});
const topicBundleByMember = buildTopicBundleMap(topicBundles);
const runtimePath = path.join(ROOT, SOURCE_ROOT, "runtime", "topic-plugin-runtime.mjs");
const runtimeSource = readRequiredText(runtimePath);

const outputs = [
  [path.join(SOURCE_ROOT, "README.md"), rootReadme(topics)],
  ...topics.flatMap((topic) => topicOutputs(topic)),
].map(([file, content]) => [file, normalizeFileEnding(content)]);

if (checkMode) {
  const stale = outputs.filter(([file, expected]) => readText(file) !== expected).map(([file]) => file);
  const actualDirectories = fs.existsSync(path.join(ROOT, SOURCE_ROOT))
    ? fs.readdirSync(path.join(ROOT, SOURCE_ROOT), { withFileTypes: true }).filter((entry) => entry.isDirectory() && entry.name !== "runtime").map((entry) => entry.name).sort()
    : [];
  const expectedDirectories = topics.map((topic) => topic.id).sort();
  if (stale.length > 0 || JSON.stringify(actualDirectories) !== JSON.stringify(expectedDirectories)) {
    console.error(`SEIS topic plugin family is stale: ${stale.length} generated files differ; directories=${actualDirectories.length}/${expectedDirectories.length}`);
    if (stale.length > 0) for (const file of stale.slice(0, 20)) console.error(`- ${file}`);
    process.exit(1);
  }
  console.log(`SEIS topic plugin family check passed: ${topics.length} packages.`);
} else {
  for (const [file, content] of outputs) {
    fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
    fs.writeFileSync(path.join(ROOT, file), content);
  }
  console.log(`SEIS topic plugin family written: ${topics.length} packages.`);
}

function topicOutputs(topic) {
  const base = path.join(SOURCE_ROOT, topic.id);
  return [
    [path.join(base, ".codex-plugin", "plugin.json"), `${JSON.stringify(topicManifest(topic), null, 2)}\n`],
    [path.join(base, ".mcp.json"), `${JSON.stringify(topicMcpManifest(topic), null, 2)}\n`],
    [path.join(base, "assets", "topic-profile.json"), `${JSON.stringify(topicProfile(topic), null, 2)}\n`],
    [path.join(base, "README.md"), topicReadme(topic)],
    [path.join(base, "skills", topic.id, "SKILL.md"), topicSkill(topic)],
    [path.join(base, "scripts", `${topic.id}-mcp-server.mjs`), topicMcpScript(topic)],
    [path.join(base, "runtime", "topic-plugin-runtime.mjs"), runtimeSource],
  ];
}

function topicManifest(topic) {
  const displayName = `SEIS ${topic.displayName}`;
  const description = `Public SEIS topic plugin for ${topic.displayName} in the ${topic.category} lane. It provides bounded, read-only repository evidence and planning context without provider, network, secret, or write access.`;
  return {
    name: topic.id,
    version: RELEASE_VERSION,
    description,
    author: {
      name: "emirhankudun-ux",
      url: "https://github.com/emirhankudun-ux",
    },
    homepage: "https://github.com/emirhankudun-ux/SEIS",
    repository: "https://github.com/emirhankudun-ux/SEIS",
    license: "MIT",
    keywords: ["seis", "topic", topic.categoryId, "read-only", "repository-evidence", "mcp"],
    skills: "./skills/",
    mcpServers: "./.mcp.json",
    interface: {
      displayName,
      shortDescription: `Read-only ${topic.displayName} topic lane.`,
      longDescription: description,
      developerName: "emirhankudun-ux",
      category: topic.category,
      capabilities: [
        "Bounded repository evidence",
        "Topic-focused planning context",
        "Read-only status reporting",
        "MCP status and report tools",
        "Explicit safety boundaries",
      ],
      websiteURL: "https://github.com/emirhankudun-ux/SEIS",
      defaultPrompt: [
        `Use SEIS ${topic.displayName} to inspect this repository surface.`,
        `Report bounded evidence for the ${topic.displayName} topic.`,
      ],
      brandColor: brandColor(topic.categoryId),
    },
  };
}

function topicMcpManifest(topic) {
  return {
    mcpServers: {
      [topic.id]: {
        command: "node",
        args: [`./scripts/${topic.id}-mcp-server.mjs`],
      },
    },
  };
}

function topicProfile(topic) {
  const marketplaceBundleId = requiredTopicBundleId(topic.id);
  return {
    schemaVersion: 2,
    id: topic.id,
    displayName: topic.displayName,
    category: topic.category,
    categoryId: topic.categoryId,
    kind: topic.kind,
    sourceText: topic.sourceText,
    directiveNormalized: topic.directive,
    sourcePath: topic.sourcePath,
    marketplace: topic.marketplace,
    installId: topic.installId,
    version: RELEASE_VERSION,
    status: topic.status,
    maturity: topic.maturity,
    publicMarketplace: true,
    marketplaceDiscoverable: true,
    marketplaceCard: false,
    marketplaceBundleId,
    publicAudience: topic.audience,
    license: topic.license,
    liveRuntimeStatus: "local-demo-only",
    permissions: {
      read: ["bounded local repository evidence"],
      write: [],
      network: [],
      secrets: [],
    },
    qualityCommands: [
      `node ${topic.sourcePath.slice(2)}/scripts/${topic.id}-mcp-server.mjs --status`,
      "npm run check:seis-topic-plugin-family",
    ],
    limitations: [
      "Marketplace availability does not grant authenticated provider, cloud, GitHub, SSH, connector, or deployment access.",
      "Repository-shape reports are evidence aids, not release, security, or integration approval.",
    ],
  };
}

function topicReadme(topic) {
  const marketplaceBundleId = requiredTopicBundleId(topic.id);
  return [
    `# ${topic.displayName} — SEIS Topic Plugin`,
    "",
    `This is an objective-derived retained SEIS topic source package for the **${topic.category}** family. It is discoverable through the optional \`${marketplaceBundleId}@seis-repo\` card and is not a direct marketplace card.`,
    "",
    `The package gives Codex a bounded **${topic.displayName}** context lane: deterministic status, repository-shape evidence, and planning boundaries. It does not call external providers, read secrets, use the network, or write files.`,
    "",
    "## Package boundary",
    "",
    "- `.codex-plugin/plugin.json` defines the retained source-package identity.",
    "- `.mcp.json` exposes the local MCP server.",
    `- \`skills/${topic.id}/SKILL.md\` defines the topic workflow.`,
    "- `assets/topic-profile.json` records source, audience, license, maturity, and permissions.",
    `- \`scripts/${topic.id}-mcp-server.mjs\` exposes status and bounded report tools.`,
    "",
    "## Safety",
    "",
    "Public repository availability is not authentication. Live cloud, provider, GitHub write, SSH, deployment, connector, destructive, and secret-bearing actions remain outside this package and require explicit approval in the relevant SEIS workflow.",
    "",
    "## Validate",
    "",
    "```bash",
    `node plugins/seis-topics/${topic.id}/scripts/${topic.id}-mcp-server.mjs --status`,
    "npm run check:seis-topic-plugin-family",
    "```",
    "",
  ].join("\n");
}

function topicSkill(topic) {
  return [
    "---",
    `name: ${topic.id}`,
    `description: Read-only ${topic.displayName} context and bounded repository evidence for SEIS work.`,
    "---",
    "",
    `# ${topic.displayName}`,
    "",
    `Use this public SEIS topic skill when the task is specifically about **${topic.displayName}** within the **${topic.category}** family.`,
    "",
    "## Workflow",
    "",
    "1. Read the repository instructions, project manifest, active goal, and nearby architecture docs.",
    `2. Classify the request as ${topic.displayName} evidence, design, implementation planning, validation, or documentation.`,
    "3. Inspect only bounded repository paths that are in scope for the active goal.",
    "4. Produce an explicit result with observed evidence, limitations, risks, rollback, and next action.",
    "5. Run the smallest relevant validation command and disclose skipped or unavailable checks.",
    "",
    "## Permission boundary",
    "",
    "- Read: bounded local repository evidence only.",
    "- Write: none by default.",
    "- Network: disabled by design.",
    "- Secrets: never read or requested.",
    "- External or destructive actions: approval-gated outside this topic package.",
    "",
    "A local-ready result is not a claim of provider connectivity, deployment, public release, or production maturity.",
    "",
  ].join("\n");
}

function topicMcpScript(topic) {
  return `#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin(${JSON.stringify({
    id: topic.id,
    displayName: topic.displayName,
    category: topic.category,
    categoryId: topic.categoryId,
    sourceText: topic.sourceText,
    sourcePath: topic.sourcePath,
  }, null, 2)});
`;
}

function rootReadme(allTopics) {
  const grouped = new Map();
  for (const topic of allTopics) {
    if (!grouped.has(topic.category)) grouped.set(topic.category, []);
    grouped.get(topic.category).push(topic);
  }
  return [
    "# SEIS Topic Plugins",
    "",
    `The SEIS repository retains ${allTopics.length} objective-derived topic source packages and exposes them through ${topicBundles.length} bounded optional cards in the \`seis-repo\` marketplace.`,
    "",
    "These packages are public, MIT-licensed, available to everyone, and implemented as local read-only demo lanes. The canonical SEIS-Agent remains the default orchestration install; each topic source maps to exactly one optional bundle and is not a separate card.",
    "",
    "## Source of truth",
    "",
    "- Objective taxonomy: `content/development/seis-topic-plugin-objective.json`",
    "- Generator: `scripts/create-seis-topic-plugin-family.mjs`",
    "- Marketplace: `.agents/plugins/marketplace.json`",
    "- Runtime: `plugins/seis-topics/runtime/topic-plugin-runtime.mjs`",
    "",
    "## Families",
    "",
    ...[...grouped.entries()].map(([category, topics]) => `- ${category}: ${topics.length} packages`),
    "",
    "## Safety boundary",
    "",
    "Topic packages do not grant provider, cloud, GitHub write, SSH, deployment, connector, secret, or destructive-action access. Their MCP servers report bounded local repository evidence only.",
    "",
    "## Validate",
    "",
    "```bash",
    "npm run check:seis-topic-plugin-family",
    "```",
    "",
  ].join("\n");
}

function brandColor(categoryId) {
  const colors = ["#2563EB", "#7C3AED", "#0F766E", "#DC2626", "#0891B2", "#DB2777", "#EA580C", "#4F46E5"];
  let hash = 0;
  for (const character of categoryId) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return colors[hash % colors.length];
}

function buildTopicBundleMap(bundles) {
  const mapping = new Map();
  for (const bundle of bundles) {
    for (const member of bundle.members || []) {
      if (mapping.has(member.name)) throw new Error(`SEIS topic plugin family: duplicate bundle member ${member.name}`);
      mapping.set(member.name, bundle.id);
    }
  }
  if (bundles.length !== 27 || mapping.size !== TOPIC_PLUGIN_TARGET) throw new Error("SEIS topic plugin family: topic bundle coverage is incomplete");
  return mapping;
}

function requiredTopicBundleId(topicId) {
  const bundleId = topicBundleByMember.get(topicId);
  if (!bundleId) throw new Error(`SEIS topic plugin family: missing bundle mapping for ${topicId}`);
  return bundleId;
}

function readText(file) {
  const absolutePath = path.join(ROOT, file);
  return fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, "utf8") : null;
}

function readRequiredText(file) {
  const text = readText(path.relative(ROOT, file));
  if (text === null) throw new Error(`Required SEIS topic runtime is missing: ${file}`);
  return text;
}

function normalizeFileEnding(content) {
  return `${String(content).replace(/\s+$/u, "")}\n`;
}
