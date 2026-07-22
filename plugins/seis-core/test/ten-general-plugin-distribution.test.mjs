import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

test("ten general plugins expose exactly thirty bounded internal packages", () => {
  const family = readJson("content/development/seis-public-plugin-family.json");
  const marketplace = readJson(".agents/plugins/marketplace.json");
  assert.equal(marketplace.plugins.length, 10);
  assert.equal(marketplace.plugins[0].name, "seis-ai-agent");
  assert.equal(family.generalPlugins.length, 10);
  assert.equal(family.internalPackages.length, 30);
  assert.equal(new Set(family.generalPlugins.map((plugin) => plugin.displayName)).size, 10);
  assert.ok(family.generalPlugins.every((plugin) => plugin.internalPackageIds.length === 3));
  const ids = family.generalPlugins.flatMap((plugin) => plugin.internalPackageIds);
  assert.equal(new Set(ids).size, 30);
  assert.deepEqual(new Set(ids), new Set(family.internalPackages.map((pkg) => pkg.id)));
  assert.ok(family.internalPackages.every((pkg) => pkg.memberCount >= 1 && pkg.memberCount <= 15));
  assert.equal(family.internalPackages.reduce((sum, pkg) => sum + pkg.memberCount, 0), 375);
});

test("distribution generator, suite, release policy, installer, and MCP smoke pass", () => {
  const commands = [
    ["scripts/create-seis-general-plugin-distribution.mjs", "--check"],
    ["scripts/check-seis-general-plugin-distribution.mjs"],
    ["scripts/check-seis-public-plugin-release-policy.mjs"],
    ["scripts/create-seis-general-unified-suite.mjs", "--check"],
    ["scripts/check-seis-general-plugin-install-smoke.mjs", "--mcp-smoke"],
  ];
  for (const args of commands) {
    const result = spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });
    assert.equal(result.status, 0, `${args.join(" ")} failed: ${result.stderr || result.stdout}`);
  }
});

test("installer recommends one task-matched general plugin and never an internal package", () => {
  const result = spawnSync(process.execPath, ["scripts/install-seis-general-plugin.mjs", "--find", "backend testing release"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.installationPerformed, false);
  assert.ok(output.candidates.length > 0 && output.candidates.length <= 3);
  assert.ok(output.candidates.every((candidate) => candidate.name.startsWith("seis-general-") || candidate.name === "seis-ai-agent"));
  assert.ok(output.candidates.every((candidate) => candidate.internalPackageCount === 3));
});

function readJson(relativePath) { return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8")); }
