#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const maximumRepositoryContractBytes = 1024 * 1024;
const allowedArguments = new Set(["--check", "--json", "--local-config"]);
for (const argument of process.argv.slice(2)) if (!allowedArguments.has(argument)) fail(`unsupported argument: ${argument}`);
const localConfigRequested = process.argv.includes("--local-config");
const jsonMode = process.argv.includes("--json");
const failures = [];
const checks = [];

run("distribution", ["scripts/check-seis-general-plugin-distribution.mjs"]);
run("release-policy", ["scripts/check-seis-public-plugin-release-policy.mjs"]);
run("unified-suite", ["scripts/create-seis-general-unified-suite.mjs", "--check"]);
run("agent", ["scripts/check-seis-ai-agent-v2.mjs"]);
run("autopilot", ["scripts/create-seis-general-plugin-autopilot.mjs", "--check"]);
const roadmap = readRepositoryJson("content/development/seis-general-plugin-autopilot.json");
ensure(
  roadmap?.immediateCycle?.roundCount === 5
    && roadmap?.immediateCycle?.stepsPerRound === 30
    && roadmap?.immediateCycle?.totalSteps === 150
    && roadmap?.immediateCycle?.completedRoundCount === 5
    && roadmap?.fiveWaveSeries?.activeWave === 1
    && roadmap?.fiveWaveSeries?.status === "wave-1-in-progress-foreground-only"
    && roadmap?.canonicalAutomation?.goalId === "SEIS-GOAL-0025"
    && roadmap?.canonicalAutomation?.reviewedPhaseCount === 48
    && roadmap?.canonicalAutomation?.repositoryAnchored === true
    && roadmap?.commandAllowlist === undefined,
  "five-round roadmap or hardened automation delegation is invalid",
);

let localConfig = { requested: false, status: "not-checked" };
if (localConfigRequested) localConfig = inspectLocalConfig();
const status = failures.length
  ? "invalid-repository-contract"
  : !localConfigRequested
    ? "repo-ready-local-config-unverified"
    : localConfig.status === "compact"
      ? "ready-for-manual-codex-ui-review"
      : "local-config-attention";
const report = {
  id: "seis-general-plugin-user-readiness",
  status,
  marketplace: { publicCardCount: 10, generalPluginCardCount: 10, internalPackageCardCount: 0, internalPackageCount: 30, maximumPackageSize: 15 },
  userRule: "Choose one general plugin per scoped task; never install internal packages directly.",
  automation: {
    initialRoundCount: roadmap?.immediateCycle?.roundCount ?? null,
    stepsPerInitialRound: roadmap?.immediateCycle?.stepsPerRound ?? null,
    totalInitialSteps: roadmap?.immediateCycle?.totalSteps ?? null,
    nextWaveCount: roadmap?.fiveWaveSeries?.waves ?? null,
    nextStepsPerWave: roadmap?.fiveWaveSeries?.stepsPerWave ?? null,
    activeWave: roadmap?.fiveWaveSeries?.activeWave ?? null,
    activeWaveStatus: roadmap?.fiveWaveSeries?.status ?? null,
    canonicalRunnerGoalId: roadmap?.canonicalAutomation?.goalId ?? null,
    reviewedPhaseCount: roadmap?.canonicalAutomation?.reviewedPhaseCount ?? null,
    backgroundExecution: false,
  },
  checks,
  localConfig,
  manualUiProofRequired: true,
  manualUiInstruction: "Refresh Codex and confirm the SEIS Repo section shows the ten concise general plugin names without numbered duplicate topic cards.",
  publication: { allowed: false, reason: "Marketplace publication and release remain human-approved." },
  failures,
};
if (jsonMode) console.log(JSON.stringify(report, null, 2));
else console.log(`SEIS general-plugin user readiness: ${status}`);
if (failures.length) process.exit(1);

function run(label, args) {
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });
  const ok = result.status === 0;
  checks.push({ label, ok });
  if (!ok) failures.push(`${label}: ${result.stderr.trim() || result.stdout.trim()}`);
}

function inspectLocalConfig() {
  const configPath = process.env.SEIS_CODEX_MARKETPLACE_CONFIG || path.join(os.homedir(), ".codex", "config.toml");
  const personalPlan = runLocalConfigPlan("--remove-personal", configPath);
  const convergencePlan = runLocalConfigPlan("--converge-ten-general-plugins", configPath);
  if (!personalPlan || !convergencePlan) {
    return {
      requested: true,
      status: "unreadable",
      findings: ["Codex config could not be verified through the bounded read-only migration planner."],
      action: "Check that the local Codex configuration is an accessible regular TOML file before any cleanup.",
    };
  }

  const profile = convergencePlan.tenGeneralPluginProfile;
  if (
    !profile
    || !Number.isInteger(profile.retiredPublicRecordCount)
    || !Number.isInteger(profile.retiredNumberedBundleRecordCount)
    || !Number.isInteger(personalPlan.plannedChangeCount)
  ) {
    return {
      requested: true,
      status: "unreadable",
      findings: ["Codex config migration evidence was incomplete; no local change was made."],
      action: "Regenerate and validate the ten-general-plugin repository profile before attempting cleanup.",
    };
  }

  const findings = [];
  if (personalPlan.plannedChangeCount > 0) findings.push(`legacy personal SEIS records remain (${personalPlan.plannedChangeCount})`);
  if (profile.retiredNumberedBundleRecordCount > 0) findings.push(`legacy numbered bundle records remain (${profile.retiredNumberedBundleRecordCount})`);
  const retiredDirectSourceCount = profile.retiredPublicRecordCount - profile.retiredNumberedBundleRecordCount;
  if (retiredDirectSourceCount > 0) findings.push(`retired direct public SEIS records remain (${retiredDirectSourceCount})`);
  return {
    requested: true,
    status: findings.length ? "attention" : "compact",
    findings,
    legacyPersonalRecordCount: personalPlan.plannedChangeCount,
    retiredPublicRecordCount: profile.retiredPublicRecordCount,
    retiredNumberedBundleRecordCount: profile.retiredNumberedBundleRecordCount,
    action: findings.length
      ? "Review the read-only plan; remove personal SEIS records first, then converge retired public cards to the ten general plugins."
      : "Refresh Codex for the required manual UI check.",
  };
}

function runLocalConfigPlan(action, configPath) {
  const result = spawnSync(
    process.execPath,
    ["scripts/manage-seis-public-marketplace-switch.mjs", "--plan", action, "--config", configPath],
    { cwd: root, encoding: "utf8" },
  );
  if (result.status !== 0) return null;
  try {
    return JSON.parse(result.stdout);
  } catch {
    return null;
  }
}

function readRepositoryJson(relativePath) {
  try {
    const absolutePath = path.resolve(root, relativePath);
    if (!absolutePath.startsWith(`${root}${path.sep}`)) throw new Error("path escaped repository root");
    const state = fs.lstatSync(absolutePath);
    if (!state.isFile() || state.isSymbolicLink() || state.size > maximumRepositoryContractBytes) throw new Error("unsafe repository contract");
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    failures.push(`roadmap: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function ensure(condition, message) { if (!condition) failures.push(message); }
function fail(message) { console.error(`SEIS general-plugin user readiness failed: ${message}`); process.exit(1); }
