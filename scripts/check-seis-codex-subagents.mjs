#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const manifestPath = "data/seis-codex-subagent-installation.json";
const configPath = ".codex/config.toml";
const codexAgentsPath = ".codex/AGENTS.md";
const packagePath = "package.json";
const failures = [];

function fail(message) {
  failures.push(message);
}

function readJson(filePath) {
  if (!existsSync(filePath)) {
    fail(`missing ${filePath}`);
    return {};
  }
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`invalid JSON in ${filePath}: ${error.message}`);
    return {};
  }
}

function textOf(filePath) {
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

const manifest = readJson(manifestPath);
const packageJson = readJson(packagePath);
const configText = textOf(configPath);
const codexAgentsText = textOf(codexAgentsPath);
const serializedManifest = JSON.stringify(manifest);

if (manifest.id !== "seis-codex-subagent-installation") {
  fail("manifest id must be seis-codex-subagent-installation");
}

if (manifest.status !== "repo-local-installed") {
  fail("manifest status must be repo-local-installed");
}

if (!configText.includes("[features]") || !configText.includes("multi_agent = true")) {
  fail(".codex/config.toml must enable multi_agent");
}

for (const preserved of manifest.existingAgentsPreserved ?? []) {
  if (!configText.includes(`[agents.${preserved}]`)) {
    fail(`preserved agent ${preserved} must remain configured`);
  }
}

for (const agent of manifest.installedAgents ?? []) {
  const configHeader = `[agents.${agent.id}]`;
  if (!configText.includes(configHeader)) {
    fail(`missing ${configHeader} in .codex/config.toml`);
  }
  if (!configText.includes(`config_file = "${agent.configFile}"`)) {
    fail(`${agent.id} must point at ${agent.configFile}`);
  }

  const profilePath = `.codex/${agent.configFile}`;
  if (!existsSync(profilePath)) {
    fail(`missing profile ${profilePath}`);
    continue;
  }
  const profileText = textOf(profilePath);
  for (const required of ["model = \"gpt-5.4\"", "model_reasoning_effort", "sandbox_mode = \"read-only\"", "developer_instructions"]) {
    if (!profileText.includes(required)) {
      fail(`${profilePath} must include ${required}`);
    }
  }
  for (const safetyToken of ["Do not", "approval", "secrets", "push", "deploy"]) {
    if (!profileText.toLowerCase().includes(safetyToken.toLowerCase())) {
      fail(`${profilePath} must include safety token ${safetyToken}`);
    }
  }
}

if (!codexAgentsText.includes("SEIS Codex sub-agents are installed")) {
  fail(".codex/AGENTS.md must document installed SEIS Codex sub-agents");
}

if (packageJson.scripts?.["check:seis-codex-subagents"] !== "node scripts/check-seis-codex-subagents.mjs") {
  fail("package.json must expose check:seis-codex-subagents");
}

if (!`${packageJson.scripts?.["check:seis-ai-local-integration"] ?? ""}`.includes("check:seis-codex-subagents")) {
  fail("check:seis-ai-local-integration must include check:seis-codex-subagents");
}

for (const forbidden of [
  /\/Users\//,
  /BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY/,
  /(^|[^A-Za-z0-9_-])sk-[A-Za-z0-9_-]{20,}/,
  /(^|[^A-Za-z0-9_])gh[pousr]_[A-Za-z0-9_]{20,}/
]) {
  if (forbidden.test(serializedManifest) || forbidden.test(configText)) {
    fail(`Codex sub-agent files contain forbidden sensitive or machine-specific pattern: ${forbidden}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS Codex sub-agent check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS Codex sub-agent check passed.");
