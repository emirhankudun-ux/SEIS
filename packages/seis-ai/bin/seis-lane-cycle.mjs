#!/usr/bin/env node
import {
  personalPluginLaneCycle,
  runPersonalLaneCycleChecks,
} from "../src/lib/plugin-integration.mjs";
import { resolveRepoRoot } from "../src/lib/repo.mjs";

const args = process.argv.slice(2);
const runChecks = args.includes("--run-checks");
const request = args.filter((arg) => arg !== "--run-checks").join(" ").trim();
if (!request || request === "--help" || request === "-h") {
  console.log(`seis-lane-cycle - build a plan-only handoff for all five personal SEIS lanes

Usage:
  npm run seis:lane-cycle -- "review the next AI Core readiness change"

Options:
  --run-checks   Run source-declared local validation commands after planning.

The command reads the canonical plugin integration manifest and produces JSON.
It does not execute providers, remote MCP sessions, credentials, SSH,
deployment, GitHub mutation, or workspace writes.`);
  process.exit(request ? 0 : 2);
}

const repoRoot = resolveRepoRoot();
const cycle = personalPluginLaneCycle(repoRoot, request);
const result = runChecks
  ? runPersonalLaneCycleChecks(repoRoot, cycle)
  : cycle;
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.ok ? 0 : 1;
