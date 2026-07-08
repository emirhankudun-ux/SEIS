#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const checks = [
  {
    id: "syntax-public-ai-readiness",
    command: ["node", "--check", "scripts/check-seis-public-ai-readiness.mjs"]
  },
  {
    id: "syntax-fresh-clone-readiness-plan",
    command: ["node", "--check", "scripts/create-seis-agi-github-fresh-clone-readiness-plan.mjs"]
  },
  {
    id: "language-model-intake",
    command: ["npm", "run", "check:seis-language-model-intake"]
  },
  {
    id: "ai-model-ecosystem-catalog",
    command: ["npm", "run", "check:seis-ai-model-ecosystem-catalog"]
  },
  {
    id: "local-ai-runtime-matrix",
    command: ["npm", "run", "check:seis-local-ai-runtime-matrix"]
  },
  {
    id: "plugin-mcp-ten-year-continuity-map",
    command: ["npm", "run", "check:seis-plugin-mcp-ten-year-continuity-map"]
  },
  {
    id: "ai-workforce-training",
    command: ["npm", "run", "check:seis-ai-workforce-training"]
  },
  {
    id: "agi-evaluation-protocol",
    command: ["npm", "run", "check:seis-agi-evaluation-protocol"]
  },
  {
    id: "agi-public-readiness-evidence",
    command: ["npm", "run", "check:seis-agi-public-readiness-evidence"]
  },
  {
    id: "agi-github-user-readiness-gates",
    command: ["npm", "run", "check:seis-agi-github-user-readiness-gates"]
  },
  {
    id: "agi-independent-evidence-ledger",
    command: ["npm", "run", "check:seis-agi-independent-evidence-ledger"]
  },
  {
    id: "512b-apex-model-program",
    command: ["npm", "run", "check:seis-512b-apex-model-program"]
  },
  {
    id: "agi-fresh-clone-readiness-plan",
    command: ["npm", "run", "check:seis-agi-github-fresh-clone-readiness-plan"]
  },
  {
    id: "ai-github-fresh-clone-local-smoke",
    command: ["npm", "run", "check:seis-ai-github-fresh-clone-local-smoke"]
  },
  {
    id: "public-ai-readiness",
    command: ["npm", "run", "check:seis-public-ai-readiness"]
  },
  {
    id: "ai-github-pr-package",
    command: ["npm", "run", "check:seis-ai-github-pr-package"]
  },
  {
    id: "ai-pr-staging-dry-run",
    command: ["npm", "run", "check:seis-ai-pr-staging-dry-run"]
  }
];

const forbiddenCommands = [
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
  "python train",
  "accelerate launch",
  "torchrun"
];

for (const check of checks) {
  const rendered = check.command.join(" ");
  for (const forbidden of forbiddenCommands) {
    if (rendered.includes(forbidden)) {
      console.error(`SEIS AI GitHub readiness chain contains forbidden command in ${check.id}: ${forbidden}`);
      process.exit(1);
    }
  }
}

const startedAt = new Date().toISOString();
const results = [];

for (const check of checks) {
  const [binary, ...args] = check.command;
  console.log(`\n[SEIS AI readiness] ${check.id}`);
  console.log(`$ ${check.command.join(" ")}`);

  const result = spawnSync(binary, args, {
    cwd: process.cwd(),
    env: { ...process.env, SEIS_LOCAL_DEMO_ONLY: "1" },
    encoding: "utf8",
    stdio: "pipe"
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  results.push({
    id: check.id,
    command: check.command.join(" "),
    status: result.status === 0 ? "passed" : "failed",
    exitCode: result.status
  });

  if (result.status !== 0) {
    console.error(`\nSEIS AI GitHub readiness chain failed at ${check.id}.`);
    console.error(JSON.stringify({ startedAt, failedCheck: check.id, results }, null, 2));
    process.exit(result.status || 1);
  }
}

console.log("\nSEIS AI GitHub readiness chain passed.");
console.log(JSON.stringify({
  startedAt,
  finishedAt: new Date().toISOString(),
  mode: "local-demo-only",
  downloadsModels: false,
  trainsModels: false,
  callsProviders: false,
  executesSsh: false,
  pushesOrMerges: false,
  grantsAgiClaim: false,
  checks: results
}, null, 2));
