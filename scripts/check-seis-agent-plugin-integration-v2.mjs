#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const root = process.cwd();
const checks = [
  ["distribution", ["scripts/check-seis-general-plugin-distribution.mjs"]],
  ["suite", ["scripts/create-seis-general-unified-suite.mjs", "--check"]],
  ["agent", ["scripts/check-seis-ai-agent-v2.mjs"]],
  ["install smoke", ["scripts/check-seis-general-plugin-install-smoke.mjs", "--mcp-smoke"]],
  ["general-plugin runtime tests", ["--test", "plugins/seis-core/test/general-plugin-runtime.test.mjs"]],
];
const failures = [];
for (const [label, args] of checks) {
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });
  if (result.status !== 0) failures.push(`${label}: ${result.stderr.trim() || result.stdout.trim()}`);
}
if (failures.length) {
  console.error("SEIS Agent/plugin v2 integration check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("SEIS Agent/plugin v2 integration check passed.");
