#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const files = {
  skill: "plugins/seis/skills/seis-god-mode-developer/SKILL.md",
  agent: "plugins/seis/skills/seis-god-mode-developer/agents/openai.yaml",
  contract: "content/development/seis-god-mode-developer-contract.json",
  manifest: "plugins/seis/.codex-plugin/plugin.json",
  readme: "plugins/seis/README.md",
  packageJson: "package.json",
  masterPrompt: "docs/governance/seis-master-prompt.md",
  supremeVision: "docs/governance/seis-supreme-vision.md",
  commandCenter: "docs/architecture/seis-command-center.md",
  goalTracker: "data/seis-operational-goal-tracker.json"
};

for (const file of Object.values(files)) read(file);

for (const [file, token] of [
  [files.skill, "name: seis-god-mode-developer"],
  [files.skill, "SEIS God Mode Developer"],
  [files.skill, "God Mode is not permission to skip validation"],
  [files.skill, "Protect user work before editing"],
  [files.skill, "npm run check:seis-god-mode-developer"],
  [files.agent, "display_name: \"SEIS God Mode Developer\""],
  [files.agent, "short_description: \"High-agency SEIS engineering lane with strict evidence and safety gates.\""],
  [files.contract, "seis-god-mode-developer-contract"],
  [files.contract, "SEIS God Mode Developer"],
  [files.contract, "Protect user work"],
  [files.contract, "Do not claim deployed, online, mobile-ready, protected, pushed, or merged without current evidence."],
  [files.manifest, "SEIS God Mode Developer operating lane"],
  [files.manifest, "Use SEIS God Mode Developer"],
  [files.readme, "skills/seis-god-mode-developer/SKILL.md"],
  [files.packageJson, "\"check:seis-god-mode-developer\""],
  [files.packageJson, "npm run check:seis-god-mode-developer"],
  [files.masterPrompt, "Protect user work"],
  [files.supremeVision, "The ecosystem itself is the product"],
  [files.commandCenter, "Operating Model"],
  [files.goalTracker, "SEIS Operational Goal Tracker"]
]) {
  requireIncludes(file, token);
}

const contract = readJson(files.contract);
if (contract) {
  ensure(contract.status === "active", `${files.contract} must be active`);
  ensure(contract.qualityGate === "npm run check:seis-god-mode-developer", `${files.contract} must expose dedicated qualityGate`);
  ensure(Array.isArray(contract.requiredBehavior) && contract.requiredBehavior.length >= 6, `${files.contract} must define requiredBehavior`);
  ensure(Array.isArray(contract.forbiddenBehavior) && contract.forbiddenBehavior.length >= 4, `${files.contract} must define forbiddenBehavior`);
  ensure(Array.isArray(contract.evidenceSurfaces) && contract.evidenceSurfaces.includes(files.skill), `${files.contract} must cite the skill surface`);
}

for (const file of Object.values(files)) {
  requireNotMatches(file, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
  requireNotMatches(file, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
  requireNotMatches(file, /\b(?:password|token|secret)\s*=\s*['"][^'"]+['"]/i, "inline credential assignments");
}

if (failures.length > 0) {
  console.error("SEIS God Mode Developer check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS God Mode Developer check passed.");

function absolute(file) {
  return path.join(root, file);
}

function read(file) {
  const full = absolute(file);
  if (!existsSync(full)) {
    fail(`missing ${file}`);
    return "";
  }
  return readFileSync(full, "utf8");
}

function readJson(file) {
  try {
    return JSON.parse(read(file));
  } catch (error) {
    fail(`${file} must contain valid JSON: ${error.message}`);
    return null;
  }
}

function requireIncludes(file, token) {
  if (!read(file).includes(token)) fail(`${file} must include ${token}`);
}

function requireNotMatches(file, pattern, reason) {
  if (pattern.test(read(file))) fail(`${file} must not include ${reason}`);
}

function ensure(condition, message) {
  if (!condition) fail(message);
}

function fail(message) {
  failures.push(message);
}
