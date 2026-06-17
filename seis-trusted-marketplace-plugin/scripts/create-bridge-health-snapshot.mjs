#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");
const snapshotPath = path.join(root, "assets", "bridge-health-snapshot.json");
const requiredCheckIds = [
  "manifest-parity",
  "private-personal-mode",
  "uixappttr-binding",
  "github-workflow",
  "safe-install-docs"
];
const requiredCapabilityIds = [
  "data-engineering",
  "development",
  "design",
  "learning",
  "monitoring",
  "productivity",
  "security",
  "testing"
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function buildCapabilityReadiness(capabilityMap, readme, skill) {
  return (capabilityMap.capabilities || []).map((capability) => {
    const evidence = {
      routingSignals: capability.routingSignals?.length || 0,
      activationGates: capability.activationGates?.length || 0,
      qualitySignals: capability.qualitySignals?.length || 0,
      documentedInSkill: skill.includes(capability.label),
      documentedInReadme: readme.includes(capability.label)
    };

    const missing = [];
    if (evidence.routingSignals < 4) missing.push("routing signals");
    if (evidence.activationGates < 4) missing.push("activation gates");
    if (evidence.qualitySignals < 4) missing.push("quality signals");
    if (!evidence.documentedInSkill && !evidence.documentedInReadme) missing.push("documentation mention");

    return {
      id: capability.id,
      label: capability.label,
      status: missing.length === 0 ? "ready" : "needs_attention",
      evidence,
      missing
    };
  });
}

function buildChecks(codexManifest, rootManifest, connection, marketplaceListing) {
  return [
    {
      id: "manifest-parity",
      status: codexManifest.name === rootManifest.name && codexManifest.version === rootManifest.version ? "pass" : "fail"
    },
    {
      id: "private-personal-mode",
      status: marketplaceListing.privatePersonal?.recommended === true && connection.pluginRepository?.mode === "private-personal" ? "pass" : "fail"
    },
    {
      id: "uixappttr-binding",
      status: connection.repository?.branch === "UIXAppTTR" && connection.repository?.githubRemote === "https://github.com/emirhankudun-ux/UIX-Apps.git" ? "pass" : "fail"
    },
    {
      id: "github-workflow",
      status: fs.existsSync(path.join(root, ".github", "workflows", "validate.yml")) ? "pass" : "fail"
    },
    {
      id: "safe-install-docs",
      status: fs.existsSync(path.join(root, "docs", "install-update-remove.md")) && fs.existsSync(path.join(root, "examples", "personal-marketplace.example.json")) ? "pass" : "fail"
    }
  ];
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

const codexManifest = readJson(".codex-plugin/plugin.json");
const rootManifest = readJson("plugin.json");
const connection = readJson("assets/seis-repo-connection.json");
const capabilityMap = readJson("assets/capability-map.json");
const marketplaceListing = readJson("assets/marketplace-listing.json");
const readme = readText("README.md");
const skill = readText("skills/seis-trusted-marketplace/SKILL.md");

const capabilityReadiness = buildCapabilityReadiness(capabilityMap, readme, skill);
const checks = buildChecks(codexManifest, rootManifest, connection, marketplaceListing);

const snapshot = {
  id: "seis-trusted-marketplace-bridge-health-snapshot",
  schemaVersion: 1,
  mode: connection.pluginRepository?.mode,
  plugin: {
    name: codexManifest.name,
    version: codexManifest.version,
    displayName: codexManifest.interface?.displayName,
    sourceRepository: connection.pluginRepository?.githubRemote
  },
  repositoryBinding: {
    productRepository: connection.repository?.githubRemote,
    branch: connection.repository?.branch,
    localWorkspace: connection.repository?.localWorkspace
  },
  marketplace: {
    name: connection.plugin?.marketplaceName || "personal",
    path: connection.plugin?.marketplacePath,
    installation: marketplaceListing.privatePersonal?.installation,
    privatePersonalRecommended: marketplaceListing.privatePersonal?.recommended === true
  },
  policy: {
    requiredCheckIds,
    requiredCapabilityIds
  },
  checks,
  capabilityReadiness,
  summary: {
    checksPassed: checks.filter((check) => check.status === "pass").length,
    checksTotal: checks.length,
    lanesReady: capabilityReadiness.filter((capability) => capability.status === "ready").length,
    lanesTotal: capabilityReadiness.length
  }
};

if (checkOnly) {
  const expected = stableJson(snapshot);
  const current = fs.existsSync(snapshotPath) ? fs.readFileSync(snapshotPath, "utf8") : "";
  if (current !== expected) {
    console.error("Bridge health snapshot is stale.");
    console.error("Run npm run bridge:snapshot to refresh assets/bridge-health-snapshot.json.");
    process.exit(1);
  }
  console.log("Bridge health snapshot check passed.");
} else {
  writeJson(snapshotPath, snapshot);
  console.log(`Bridge health snapshot written: ${path.relative(root, snapshotPath)}`);
}
