#!/usr/bin/env node
// Aggregate gate for the SEIS governance + design-system checks. Runs them in
// one command so CI and contributors have a single, maintainable entry point.
// Each sub-check stays independently runnable; this only orchestrates them.
import { spawnSync } from "node:child_process";

const checks = [
  ["constitution", "scripts/check-seis-master-prompt-v14.mjs"],
  ["ai-routing-policy", "scripts/check-ai-routing-policy.cjs"],
  ["seis-ai-model", "scripts/check-seis-ai-model.cjs"],
  ["open-modules", "scripts/check-open-modules.cjs"],
  ["doc-links", "scripts/check-doc-links.mjs"],
  ["design-system", "scripts/check-design-system.mjs"],
];

let failed = 0;
for (const [name, script] of checks) {
  const result = spawnSync("node", [script], { encoding: "utf8" });
  const out = `${result.stdout || ""}${result.stderr || ""}`.trim();
  if (result.status === 0) {
    console.log(`[pass] ${name}`);
  } else {
    failed += 1;
    console.error(`[FAIL] ${name}`);
    if (out) console.error(out.split("\n").map((l) => `        ${l}`).join("\n"));
  }
}

console.log("");
if (failed > 0) {
  console.error(`Governance aggregate: ${failed} of ${checks.length} checks failed.`);
  process.exit(1);
}
console.log(`Governance aggregate: all ${checks.length} checks passed.`);
