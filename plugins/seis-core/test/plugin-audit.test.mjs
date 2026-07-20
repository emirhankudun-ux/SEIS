import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  APP_PLUGIN_EXPANSION_TARGET,
  PLUGIN_AUDIT_DEFINITIONS,
} from "../runtime/plugin-audit-definitions.mjs";
import {
  pluginStatus,
  runAudit,
} from "../runtime/plugin-audit-runtime.mjs";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(pluginRoot, "../..");

test("the app expansion defines ten named audit plugins and reaches 63 packages", () => {
  assert.equal(PLUGIN_AUDIT_DEFINITIONS.length, 10);
  assert.equal(APP_PLUGIN_EXPANSION_TARGET, 63);
  for (const definition of PLUGIN_AUDIT_DEFINITIONS) {
    assert.equal(definition.checks.length, 3);
    assert.ok(definition.checks.every((check) => check.label));
  }
});

test("every new audit plugin reports a ready bounded local status", () => {
  for (const definition of PLUGIN_AUDIT_DEFINITIONS) {
    const status = pluginStatus(definition, path.join(pluginRoot, definition.id));
    assert.equal(status.status, "ready", definition.id);
    assert.equal(status.network, "disabled-by-design", definition.id);
    assert.equal(status.secrets, "not-read", definition.id);
  }
});

test("every new audit plugin produces a ready report without external actions", () => {
  for (const definition of PLUGIN_AUDIT_DEFINITIONS) {
    const report = runAudit(definition, repoRoot);
    assert.equal(report.ok, true, `${definition.id}: ${JSON.stringify(report.checks)}`);
    assert.equal(report.counts.total, 3);
    assert.equal(report.counts.failed, 0);
    assert.deepEqual(report.permissions, { write: [], network: [], secrets: [] });
  }
});

test("audit plugin CLI exposes report mode without writing the repository", () => {
  const entrypoint = path.join(pluginRoot, "seis-prompt-injection-audit", "scripts", "seis-prompt-injection-audit-mcp-server.mjs");
  const output = execFileSync(process.execPath, [entrypoint, "--report", "--path", repoRoot], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { PATH: process.env.PATH || "", LANG: "C", TZ: "UTC" },
  });
  const report = JSON.parse(output);
  assert.equal(report.id, "seis-prompt-injection-audit-report");
  assert.equal(report.ok, true);
  assert.deepEqual(report.permissions.write, []);
});

test("audit plugin CLI rejects report roots outside the SEIS workspace", () => {
  const entrypoint = path.join(pluginRoot, "seis-prompt-injection-audit", "scripts", "seis-prompt-injection-audit-mcp-server.mjs");
  const output = execFileSync(process.execPath, [entrypoint, "--report", "--path", "/tmp"], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { PATH: process.env.PATH || "", LANG: "C", TZ: "UTC" },
  });
  const report = JSON.parse(output);
  assert.equal(report.state, "invalid-input");
  assert.equal(report.ok, false);
  assert.match(report.error, /inside the SEIS workspace/);
  assert.deepEqual(report.permissions, { write: [], network: [], secrets: [] });
});
