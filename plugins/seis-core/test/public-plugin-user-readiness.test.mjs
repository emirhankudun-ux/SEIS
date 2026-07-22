import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

test("repository readiness reports the ten/30 model without inspecting a local config", () => {
  const result = run(["scripts/check-seis-general-plugin-user-readiness.mjs", "--json"]);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, "repo-ready-local-config-unverified");
  assert.deepEqual(report.marketplace, {
    publicCardCount: 10,
    generalPluginCardCount: 10,
    internalPackageCardCount: 0,
    internalPackageCount: 30,
    maximumPackageSize: 15,
  });
  assert.equal(report.manualUiProofRequired, true);
  assert.equal(report.publication.allowed, false);
  assert.deepEqual(report.automation, {
    initialRoundCount: 5,
    stepsPerInitialRound: 30,
    totalInitialSteps: 150,
    nextWaveCount: 5,
    nextStepsPerWave: 100,
    activeWave: 1,
    activeWaveStatus: "wave-1-in-progress-foreground-only",
    canonicalRunnerGoalId: "SEIS-GOAL-0025",
    reviewedPhaseCount: 48,
    backgroundExecution: false,
  });
});

test("repository readiness is anchored to its own checkout", () => {
  const result = run([path.join(root, "scripts/check-seis-general-plugin-user-readiness.mjs"), "--json"], {}, os.tmpdir());
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).status, "repo-ready-local-config-unverified");
});

test("local readiness flags legacy personal and numbered bundle records without mutating them", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "seis-readiness-"));
  const configPath = path.join(directory, "config.toml");
  const original = [
    '[plugins."seis-ai-agent@seis-repo"]',
    "enabled = true",
    "",
    '[plugins."seis-ai-agent@personal"]',
    "enabled = true",
    "",
    '[plugins."seis-topic-bundle-01@seis-repo"]',
    "enabled = true",
    "",
  ].join("\n");
  fs.writeFileSync(configPath, original);
  const result = run(["scripts/check-seis-general-plugin-user-readiness.mjs", "--json", "--local-config"], { SEIS_CODEX_MARKETPLACE_CONFIG: configPath });
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, "local-config-attention");
  assert.equal(report.localConfig.status, "attention");
  assert.ok(report.localConfig.findings.some((finding) => finding.includes("personal")));
  assert.ok(report.localConfig.findings.some((finding) => finding.includes("numbered bundle")));
  assert.equal(report.localConfig.legacyPersonalRecordCount, 1);
  assert.equal(report.localConfig.retiredNumberedBundleRecordCount, 1);
  assert.equal(fs.readFileSync(configPath, "utf8"), original);
  fs.rmSync(directory, { recursive: true, force: true });
});

test("local readiness is ready for manual UI review when no retired records remain", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "seis-readiness-"));
  const configPath = path.join(directory, "config.toml");
  fs.writeFileSync(configPath, [
    '[plugins."seis-ai-agent@seis-repo"]',
    "enabled = true",
    "",
    '[plugins."seis-general-design-creative@seis-repo"]',
    "enabled = true",
    "",
  ].join("\n"));
  const result = run(["scripts/check-seis-general-plugin-user-readiness.mjs", "--json", "--local-config"], { SEIS_CODEX_MARKETPLACE_CONFIG: configPath });
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, "ready-for-manual-codex-ui-review");
  assert.equal(report.localConfig.status, "compact");
  assert.equal(report.localConfig.retiredPublicRecordCount, 0);
  fs.rmSync(directory, { recursive: true, force: true });
});

function run(args, extraEnv = {}, cwd = root) {
  return spawnSync(process.execPath, args, { cwd, encoding: "utf8", env: { ...process.env, ...extraEnv } });
}
