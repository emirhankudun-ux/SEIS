#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const outputJson = args.has("--json");
const strict = args.has("--strict");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function git(argsList) {
  try {
    return execFileSync("git", argsList, { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

const codexManifest = readJson(".codex-plugin/plugin.json");
const rootManifest = readJson("plugin.json");
const connection = readJson("assets/seis-repo-connection.json");
const capabilityMap = readJson("assets/capability-map.json");
const marketplaceListing = readJson("assets/marketplace-listing.json");
const readme = readText("README.md");
const skill = readText("skills/seis-trusted-marketplace/SKILL.md");

const capabilityReadiness = (capabilityMap.capabilities || []).map((capability) => {
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

const checks = [
  {
    id: "manifest-parity",
    status: codexManifest.name === rootManifest.name && codexManifest.version === rootManifest.version ? "pass" : "fail",
    detail: "Root plugin.json and .codex-plugin/plugin.json should name the same plugin and version."
  },
  {
    id: "private-personal-mode",
    status: marketplaceListing.privatePersonal?.recommended === true && connection.pluginRepository?.mode === "private-personal" ? "pass" : "fail",
    detail: "Plugin should remain private/personal until public readiness review is complete."
  },
  {
    id: "uixappttr-binding",
    status: connection.repository?.branch === "UIXAppTTR" && connection.repository?.githubRemote === "https://github.com/emirhankudun-ux/UIX-Apps.git" ? "pass" : "fail",
    detail: "Plugin should stay bound to the UIX-Apps UIXAppTTR branch contract."
  },
  {
    id: "github-workflow",
    status: exists(".github/workflows/validate.yml") ? "pass" : "fail",
    detail: "GitHub Actions validation workflow should exist."
  },
  {
    id: "safe-install-docs",
    status: exists("docs/install-update-remove.md") && exists("examples/personal-marketplace.example.json") ? "pass" : "fail",
    detail: "Install, update, remove, and marketplace examples should be documented."
  }
];

const report = {
  id: "seis-trusted-marketplace-doctor-report",
  generatedAt: new Date().toISOString(),
  plugin: {
    name: codexManifest.name,
    version: codexManifest.version,
    displayName: codexManifest.interface?.displayName,
    sourceRepository: connection.pluginRepository?.githubRemote,
    mode: connection.pluginRepository?.mode
  },
  repositoryBinding: {
    productRepository: connection.repository?.githubRemote,
    branch: connection.repository?.branch,
    localWorkspace: connection.repository?.localWorkspace
  },
  git: {
    status: git(["status", "--short", "--branch"]),
    remote: git(["remote", "get-url", "origin"]),
    latestCommit: git(["log", "-1", "--oneline"])
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

const hasFailures = checks.some((check) => check.status === "fail") || capabilityReadiness.some((capability) => capability.status !== "ready");

if (outputJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("SEIS Trusted Marketplace doctor report");
  console.log(`- plugin: ${report.plugin.name} ${report.plugin.version}`);
  console.log(`- mode: ${report.plugin.mode}`);
  console.log(`- source repo: ${report.plugin.sourceRepository}`);
  console.log(`- product branch: ${report.repositoryBinding.branch}`);
  console.log(`- checks: ${report.summary.checksPassed}/${report.summary.checksTotal} passed`);
  console.log(`- capability lanes: ${report.summary.lanesReady}/${report.summary.lanesTotal} ready`);

  for (const check of checks) {
    console.log(`- ${check.status}: ${check.id}`);
  }

  for (const capability of capabilityReadiness) {
    console.log(`- ${capability.status}: ${capability.id}`);
    if (capability.missing.length > 0) {
      console.log(`  missing: ${capability.missing.join(", ")}`);
    }
  }
}

if (strict && hasFailures) {
  process.exit(1);
}
