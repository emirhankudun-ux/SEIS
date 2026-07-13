#!/usr/bin/env node
import { personalPluginLaneCycle } from "../src/lib/plugin-integration.mjs";
import { resolveRepoRoot } from "../src/lib/repo.mjs";

const request = process.argv.slice(2).join(" ").trim();
if (!request || request === "--help" || request === "-h") {
  console.log(`seis-lane-cycle - build a plan-only handoff for all five personal SEIS lanes

Usage:
  npm run lane-cycle -- "review the next AI Core readiness change"

The command reads the canonical plugin integration manifest and produces JSON.
It does not execute providers, MCP sessions, credentials, SSH, deployment,
GitHub mutation, or workspace writes.`);
  process.exit(request ? 0 : 2);
}

const result = personalPluginLaneCycle(resolveRepoRoot(), request);
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.ok ? 0 : 1;
