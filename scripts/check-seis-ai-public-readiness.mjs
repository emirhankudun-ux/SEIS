#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const checks = [
  "check:seis-language-model-intake",
  "check:seis-retrieval-source-provenance",
  "check:seis-retrieval-evaluation-fixtures",
  "check:seis-retrieval-evaluation-dry-run",
  "check:seis-retrieval-citation-scorer-dry-run",
  "check:seis-no-secret-answer-log-scan",
  "check:seis-redacted-answer-log-schema",
  "check:seis-language-model-training-curriculum",
  "check:seis-ai-workforce-training",
  "check:seis-agent-workforce",
  "check:seis-ai-fresh-clone-readiness",
  "check:seis-model-scaling-hardware-profile",
  "check:seis-model-parameter-ladder",
  "check:seis-model-scaling-subagent-council",
  "check:seis-512b-apex-model-program",
  "check:seis-agi-evaluation-protocol",
  "check:seis-agi-public-readiness-evidence",
  "check:seis-agi-github-user-readiness-gates",
  "check:seis-agi-independent-evidence-ledger",
  "check:seis-ai-public-readiness-program",
  "check:seis-ai-public-readiness-report"
];

const results = [];

for (const scriptName of checks) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(npmCommand, ["run", scriptName], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  results.push({
    scriptName,
    startedAt,
    status: result.status === 0 ? "passed" : "failed",
    exitCode: result.status,
    stdout: tail(result.stdout),
    stderr: tail(result.stderr)
  });

  if (result.status !== 0) {
    console.error(`SEIS AI public readiness failed at ${scriptName}.`);
    if (result.stdout) console.error(result.stdout.trim());
    if (result.stderr) console.error(result.stderr.trim());
    console.error(JSON.stringify({ checks: results }, null, 2));
    process.exit(result.status || 1);
  }
}

const summary = {
  id: "seis-ai-public-readiness-check",
  status: "passed",
  mode: "local-demo-readiness-only",
  boundary: {
    installsModels: false,
    downloadsCheckpoints: false,
    trainsModels: false,
    callsProviders: false,
    provisionsCloudOrGpu: false,
    executesSsh: false,
    pushesOrMerges: false,
    grantsAgiClaim: false,
    grants512bRouteEligibility: false
  },
  checks: results.map((item) => ({
    scriptName: item.scriptName,
    status: item.status,
    exitCode: item.exitCode
  }))
};

console.log("SEIS AI public readiness check passed.");
console.log(JSON.stringify(summary, null, 2));

function tail(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.split("\n").slice(-8).join("\n");
}
