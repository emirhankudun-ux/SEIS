#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import {
  APP_PLUGIN_EXPANSION_TARGET,
  PLUGIN_AUDIT_DEFINITIONS,
} from "../plugins/seis-core/runtime/plugin-audit-definitions.mjs";

const root = process.cwd();
const checkMode = process.argv.includes("--check");
const sourceRoot = path.join(root, "plugins", "seis-core");
const releaseTrain = readJson(path.join(root, "content", "development", "seis-core-plugin-release-train.json"));
const currentRelease = releaseTrain.currentRelease;

if (PLUGIN_AUDIT_DEFINITIONS.length !== 10) {
  throw new Error("Expansion definition count must retain exactly ten bounded audit plugins.");
}

for (const definition of PLUGIN_AUDIT_DEFINITIONS) {
  const files = expectedFiles(definition);
  for (const [relativePath, body] of Object.entries(files)) {
    const absolutePath = path.join(sourceRoot, definition.id, relativePath);
    if (checkMode) {
      const actual = fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, "utf8") : "";
      if (actual !== body) throw new Error(`${path.relative(root, absolutePath)} is stale. Run: npm run automation:seis-core-plugin-expansion`);
    } else {
      fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
      fs.writeFileSync(absolutePath, body);
    }
  }
}

if (!checkMode) console.log(`Wrote ${PLUGIN_AUDIT_DEFINITIONS.length} new app-owned plugins; total target ${APP_PLUGIN_EXPANSION_TARGET}.`);
else console.log(`SEIS app plugin expansion check passed for ${PLUGIN_AUDIT_DEFINITIONS.length} plugins.`);

function expectedFiles(definition) {
  const skillName = definition.id;
  const manifest = {
    id: definition.id,
    name: definition.id,
    version: currentRelease.semver,
    description: definition.description,
    author: { name: "emirhankudun-ux" },
    license: "MIT",
    keywords: ["seis", "public-repository", "read-only", ...definition.category.toLowerCase().split(/\s+/)],
    skills: "./skills/",
    mcpServers: "./.mcp.json",
    interface: {
      displayName: definition.displayName,
      shortDescription: definition.description,
      longDescription: `${definition.description} It reads bounded SEIS evidence only and never performs external writes.`,
      developerName: "emirhankudun-ux",
      category: "Developer",
      capabilities: definition.capabilities,
      defaultPrompt: [`Run ${definition.displayName} in read-only mode.`, "Summarize evidence and separate limitations."],
      brandColor: "#38BDF8",
    },
  };
  const profile = {
    stableId: definition.id,
    slug: definition.id,
    version: currentRelease.semver,
    releaseMicroUnits: currentRelease.microUnits,
    releaseRevision: currentRelease.revision,
    releaseMajor: currentRelease.major,
    releaseKind: currentRelease.kind,
    releaseTrainVersion: currentRelease.label,
    category: definition.category.toLowerCase().replaceAll(" ", "-"),
    owner: "@seis-core",
    publisher: "emirhankudun-ux",
    sourceClassification: "public-SEIS-repository",
    license: "MIT",
    status: "approved-public-readonly",
    implementationState: "functional-local-demo",
    entrypoint: `scripts/${definition.id}-mcp-server.mjs`,
    permissions: { read: ["bounded SEIS repository evidence"], write: [], network: [], secrets: [] },
    risk: "low",
    audit: { mode: "read-only-report", checkCount: definition.checks.length },
    validation: [
      `node scripts/${definition.id}-mcp-server.mjs --status`,
      `node scripts/${definition.id}-mcp-server.mjs --report --path /path/to/tree`,
    ],
    rollback: "Disable or remove the local app-owned plugin; no source data is mutated.",
    reviewState: "public-repository-preview",
    publicRepositoryAvailable: true,
    publicAudience: "everyone",
    publicMarketplace: true,
    liveRuntimeStatus: "local-demo-or-auth-gated",
    provenance: "Created from the SEIS master prompt plugin portfolio for SEIS-GOAL-021.",
  };
  const mcp = {
    mcpServers: {
      [definition.id]: { command: "node", args: [profile.entrypoint] },
    },
  };
  const server = `#!/usr/bin/env node\nimport { startAuditPlugin } from "../../runtime/plugin-audit-runtime.mjs";\n\nstartAuditPlugin(${JSON.stringify(definition.id)});\n`;
  const skill = `---\nname: ${definition.id}\ndescription: ${definition.description}\n---\n\n# ${definition.displayName}\n\nRead-only SEIS application plugin for SEIS-GOAL-021.\n\n## Safety boundary\n\n- Reads bounded repository evidence only.\n- Never writes files, calls providers, deploys, publishes, or reads secrets.\n- A ready report is not a human approval or release claim.\n\n## Commands\n\n    node scripts/${definition.id}-mcp-server.mjs --status\n    node scripts/${definition.id}-mcp-server.mjs --report --path /path/to/tree\n\n## Goal linkage\n\nUse within SEIS-GOAL-021 and attach the report to the relevant local handoff.\n`;
  return {
    ".codex-plugin/plugin.json": `${JSON.stringify(manifest, null, 2)}\n`,
    ".mcp.json": `${JSON.stringify(mcp, null, 2)}\n`,
    "assets/plugin-profile.json": `${JSON.stringify(profile, null, 2)}\n`,
    [`scripts/${definition.id}-mcp-server.mjs`]: server,
    [`skills/${skillName}/SKILL.md`]: skill,
  };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
