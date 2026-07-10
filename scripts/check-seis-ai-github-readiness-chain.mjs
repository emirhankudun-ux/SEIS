#!/usr/bin/env node
/* eslint-disable no-console */

import { spawnSync } from "node:child_process";

const checks = [
  { id: "gate-manifest", scope: "gates" },
  { id: "independent-evidence-ledger", scope: "ledger" },
  { id: "fresh-clone-plan", scope: "fresh-clone" },
  { id: "cross-artifact-contract", scope: "all" }
];

const forbiddenFragments = [
  "ollama pull",
  "huggingface-cli download",
  "git push",
  "git merge",
  "ssh ",
  "scp ",
  "rsync ",
  "docker run",
  "kubectl ",
  "terraform ",
  "torchrun",
  "accelerate launch"
];

const results = [];
for (const check of checks) {
  const command = [process.execPath, "scripts/check-seis-agi-github-readiness-gates.mjs", "--scope", check.scope];
  const rendered = command.join(" ");
  for (const forbidden of forbiddenFragments) {
    if (rendered.includes(forbidden)) {
      console.error("SEIS AI GitHub readiness chain contains forbidden command in " + check.id + ": " + forbidden);
      process.exit(1);
    }
  }

  console.log("\n[SEIS AI readiness] " + check.id);
  console.log("$ " + rendered);
  const result = spawnSync(command[0], command.slice(1), {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "pipe"
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  const passed = result.status === 0;
  results.push({ id: check.id, scope: check.scope, status: passed ? "passed" : "failed", exitCode: result.status });
  if (!passed) {
    console.error("\nSEIS AI GitHub readiness chain failed.");
    console.error(JSON.stringify({ mode: "local-demo-only", results }, null, 2));
    process.exit(result.status || 1);
  }
}

console.log("\nSEIS AI GitHub readiness chain passed.");
console.log(JSON.stringify({
  mode: "local-demo-only",
  downloadsModelWeights: false,
  trainsModels: false,
  callsProviders: false,
  executesSsh: false,
  mutatesGitHub: false,
  grantsAgiClaim: false,
  results
}, null, 2));
