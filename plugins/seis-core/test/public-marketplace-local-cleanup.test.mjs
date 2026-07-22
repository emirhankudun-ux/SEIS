import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "../../..");
const runner = path.join(root, "scripts/manage-seis-public-marketplace-switch.mjs");

test("public marketplace cleanup plan is read-only and reports aggregate counts", () => {
  const fixture = makeFixture();
  const before = fs.readFileSync(fixture.configPath, "utf8");
  try {
    const result = run(["--plan", "--config", fixture.configPath]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const report = parseReport(result);
    assert.equal(report.mode, "plan");
    assert.equal(report.action, "remove-personal");
    assert.equal(report.status, "planned");
    assert.equal(report.writesPerformed, false);
    assert.equal(report.backupCreated, false);
    assert.equal(report.before.personalSeisPluginRecordCount, 2);
    assert.equal(report.before.personalSeisPluginEnabledCount, 2);
    assert.equal(report.before.seisRepoPluginRecordCount, 2);
    assert.equal(report.before.seisRepoPluginEnabledCount, 2);
    assert.equal(report.before.canonicalPublicPluginId, "seis-ai-agent@seis-repo");
    assert.equal(report.before.canonicalPublicPluginEnabled, true);
    assert.equal(report.plannedChangeCount, 2);
    assert.equal(report.config.pathDisclosed, false);
    assert.equal(report.publicBoundary.networkAccess, false);
    assert.equal(report.publicBoundary.sourceDirectoriesRemoved, false);
    assert.equal(report.publicBoundary.cacheDirectoriesRemoved, false);
    assert.equal(fs.readFileSync(fixture.configPath, "utf8"), before);
  } finally {
    cleanup(fixture.root);
  }
});

test("remove mode backs up, removes only personal SEIS tables, and is idempotent", () => {
  const fixture = makeFixture();
  const original = fs.readFileSync(fixture.configPath, "utf8");
  try {
    const result = run(["--apply", "--remove-personal", "--config", fixture.configPath]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const report = parseReport(result);
    assert.equal(report.mode, "apply");
    assert.equal(report.action, "remove-personal");
    assert.equal(report.status, "applied");
    assert.equal(report.writesPerformed, true);
    assert.equal(report.backupCreated, true);
    assert.equal(report.after.personalSeisPluginRecordCount, 0);
    assert.equal(report.after.personalSeisPluginEnabledCount, 0);
    assert.equal(report.after.canonicalPublicPluginEnabled, true);

    const changed = fs.readFileSync(fixture.configPath, "utf8");
    assert.doesNotMatch(changed, /\[plugins\."seis(?:-[^"]*)?@personal"\]/);
    assert.match(changed, /\[plugins\."seis-ai-agent@seis-repo"\]/);
    assert.match(changed, /\[plugins\."unrelated@personal"\]/);
    const backupPath = path.join(path.dirname(fixture.configPath), report.backupFileName);
    assert.equal(fs.readFileSync(backupPath, "utf8"), original);

    const second = run(["--apply", "--remove-personal", "--config", fixture.configPath]);
    assert.equal(second.status, 0, second.stderr || second.stdout);
    const secondReport = parseReport(second);
    assert.equal(secondReport.status, "already-public-only");
    assert.equal(secondReport.writesPerformed, false);
    assert.equal(secondReport.backupCreated, false);
  } finally {
    cleanup(fixture.root);
  }
});

test("disable mode preserves personal tables but turns off only their enabled flags", () => {
  const fixture = makeFixture();
  try {
    const result = run(["--apply", "--disable-personal", "--config", fixture.configPath]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const report = parseReport(result);
    assert.equal(report.status, "applied");
    assert.equal(report.after.personalSeisPluginRecordCount, 2);
    assert.equal(report.after.personalSeisPluginEnabledCount, 0);
    assert.equal(report.after.seisRepoPluginEnabledCount, 2);

    const changed = fs.readFileSync(fixture.configPath, "utf8");
    assert.match(changed, /\[plugins\."seis@personal"\]\nenabled = false/);
    assert.match(changed, /\[plugins\."seis-design@personal"\]\nenabled = false/);
    assert.match(changed, /\[plugins\."unrelated@personal"\]\nenabled = true/);
  } finally {
    cleanup(fixture.root);
  }
});

test("canonical public mode retains SEIS-Agent and optional bundles while removing embedded direct source records", () => {
  const fixture = makeFixture({ includeOptionalBundle: true, includeSecondLegacyPublicSource: true });
  const original = fs.readFileSync(fixture.configPath, "utf8");
  try {
    const plan = run(["--plan", "--canonicalize-public", "--config", fixture.configPath]);
    assert.equal(plan.status, 0, plan.stderr || plan.stdout);
    const planReport = parseReport(plan);
    assert.equal(planReport.mode, "plan");
    assert.equal(planReport.action, "canonicalize-public");
    assert.equal(planReport.plannedChangeCount, 2);
    assert.equal(planReport.before.seisRepoPluginRecordCount, 4);
    assert.equal(planReport.before.embeddedPublicSourceRecordCount, 2);
    assert.equal(planReport.canonicalDefaultProfile.canonicalDefaultInstallId, "seis-ai-agent@seis-repo");
    assert.equal(planReport.canonicalDefaultProfile.embeddedDirectPublicRecordCount, 2);
    assert.equal(planReport.canonicalDefaultProfile.preservedOptionalBundleRecordCount, 1);
    assert.equal(planReport.canonicalDefaultProfile.unmanagedPublicRecordCount, 0);
    assert.equal(planReport.canonicalDefaultProfile.optionalBundlesPreserved, true);
    assert.equal(fs.readFileSync(fixture.configPath, "utf8"), original);

    const apply = run(["--apply", "--canonicalize-public", "--config", fixture.configPath]);
    assert.equal(apply.status, 0, apply.stderr || apply.stdout);
    const report = parseReport(apply);
    assert.equal(report.status, "applied");
    assert.equal(report.after.seisRepoPluginRecordCount, 2);
    assert.equal(report.after.embeddedPublicSourceRecordCount, 0);
    assert.equal(report.canonicalDefaultProfile.preservedOptionalBundleRecordCount, 1);

    const changed = fs.readFileSync(fixture.configPath, "utf8");
    assert.doesNotMatch(changed, /\[plugins\."seis-cloud@seis-repo"\]/);
    assert.doesNotMatch(changed, /\[plugins\."seis-design@seis-repo"\]/);
    assert.match(changed, /\[plugins\."seis-ai-agent@seis-repo"\]/);
    assert.match(changed, /\[plugins\."seis-application-bundle-01@seis-repo"\]/);
    assert.match(changed, /\[plugins\."seis@personal"\]/);
    assert.equal(fs.readFileSync(path.join(path.dirname(fixture.configPath), report.backupFileName), "utf8"), original);
  } finally {
    cleanup(fixture.root);
  }
});

test("restore accepts only a verified tool backup in the same config directory", () => {
  const fixture = makeFixture();
  const original = fs.readFileSync(fixture.configPath, "utf8");
  try {
    const remove = run(["--apply", "--remove-personal", "--config", fixture.configPath]);
    assert.equal(remove.status, 0, remove.stderr || remove.stdout);
    const backupName = parseReport(remove).backupFileName;
    const restore = run(["--apply", "--restore", backupName, "--config", fixture.configPath]);
    assert.equal(restore.status, 0, restore.stderr || restore.stdout);
    const report = parseReport(restore);
    assert.equal(report.mode, "restore");
    assert.equal(report.status, "restored");
    assert.equal(report.writesPerformed, true);
    assert.equal(report.restoredFromFileName, backupName);
    assert.equal(fs.readFileSync(fixture.configPath, "utf8"), original);
  } finally {
    cleanup(fixture.root);
  }
});

test("the tool fails closed when the public canonical record is unavailable, disabled, or malformed", () => {
  const missingCanonical = makeFixture({ includeCanonical: false });
  const disabledCanonical = makeFixture({ canonicalEnabled: false });
  const malformedCanonical = makeFixture({ duplicateCanonicalEnabledField: true });
  try {
    const missing = run(["--plan", "--config", missingCanonical.configPath]);
    assert.notEqual(missing.status, 0);
    assert.match(missing.stderr, /exactly one canonical public SEIS-Agent plugin table is required/);

    const disabled = run(["--plan", "--config", disabledCanonical.configPath]);
    assert.notEqual(disabled.status, 0);
    assert.match(disabled.stderr, /canonical public SEIS-Agent must be enabled/);

    const malformed = run(["--plan", "--config", malformedCanonical.configPath]);
    assert.notEqual(malformed.status, 0);
    assert.match(malformed.stderr, /must contain exactly one literal enabled/);
  } finally {
    cleanup(missingCanonical.root);
    cleanup(disabledCanonical.root);
    cleanup(malformedCanonical.root);
  }
});

test("source contains no network, shell, automatic install, or broad filesystem deletion path", () => {
  const source = fs.readFileSync(runner, "utf8");
  assert.match(source, /--apply requires exactly one/);
  assert.match(source, /--canonicalize-public/);
  assert.match(source, /canonical public SEIS-Agent must be enabled/);
  assert.match(source, /Automatic rollback restored the original configuration/);
  assert.match(source, /sourceDirectoriesRemoved: false/);
  assert.match(source, /cacheDirectoriesRemoved: false/);
  assert.match(source, /optionalBundleRecordsModified: false/);
  assert.doesNotMatch(source, /https?:\/\/|fetch\s*\(|spawnSync|execSync|execFileSync|git\s+push|rm\s+-rf|child_process/);
});

function makeFixture({
  includeCanonical = true,
  canonicalEnabled = true,
  duplicateCanonicalEnabledField = false,
  includeOptionalBundle = false,
  includeSecondLegacyPublicSource = false,
} = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "seis-public-marketplace-cleanup-"));
  const configPath = path.join(root, "config.toml");
  const lines = [
    'model = "gpt-5"',
    "",
  ];
  if (includeCanonical) {
    lines.push(
      '[plugins."seis-ai-agent@seis-repo"]',
      `enabled = ${canonicalEnabled}`,
    );
    if (duplicateCanonicalEnabledField) lines.push("enabled = true");
    lines.push("");
  }
  lines.push(
    '[plugins."seis-cloud@seis-repo"]',
    "enabled = true",
    "",
  );
  if (includeSecondLegacyPublicSource) {
    lines.push(
      '[plugins."seis-design@seis-repo"]',
      "enabled = true",
      "",
    );
  }
  if (includeOptionalBundle) {
    lines.push(
      '[plugins."seis-application-bundle-01@seis-repo"]',
      "enabled = true",
      "",
    );
  }
  lines.push(
    '[plugins."seis@personal"]',
    "enabled = true",
    "",
    '[plugins."seis-design@personal"]',
    "enabled = true",
    "",
    '[plugins."unrelated@personal"]',
    "enabled = true",
    "",
  );
  fs.writeFileSync(configPath, `${lines.join("\n")}\n`, { mode: 0o600 });
  return { configPath, root };
}

function run(argumentsList) {
  return spawnSync(process.execPath, [runner, ...argumentsList], {
    cwd: root,
    encoding: "utf8",
  });
}

function parseReport(result) {
  return JSON.parse(result.stdout);
}

function cleanup(target) {
  fs.rmSync(target, { recursive: true, force: true });
}
