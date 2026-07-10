#!/usr/bin/env node

import { resolveRepoRoot } from "../src/lib/repo.mjs";
import {
  buildReadOnlyRouteDecision,
  runReadOnlyRouterSmokeChecks,
} from "../src/model/read-only-router.mjs";

const args = process.argv.slice(2);
const root = resolveRepoRoot();

if (args.includes("--help") || args.includes("-h")) {
  console.log(`seis-router — provider-neutral read-only SEIS AI Core route evaluator

Usage:
  node packages/seis-ai/bin/seis-router.mjs [options]

Options:
  --task-type <id>       Metadata-only task type
  --capability <label>   Metadata-only capability label
  --privacy <mode>       local-only | standard | review-gated
  --local-only           Force local-only routing boundary
  --check                Run deterministic no-key smoke checks
  --help                 Show this help

This command never calls a provider, reads credentials, sends prompts, scans a
vault, executes an agent, or performs external mutation.`);
  process.exit(0);
}

if (args.includes("--check")) {
  const result = runReadOnlyRouterSmokeChecks(root);
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(`SEIS read-only router check passed (${result.passed}/${result.total}).`);
  process.exit(0);
}

const input = {
  taskType: readOption("--task-type") || undefined,
  capability: readOption("--capability") || undefined,
  privacyMode: readOption("--privacy") || undefined,
  localOnly: args.includes("--local-only") || undefined,
};

console.log(JSON.stringify(buildReadOnlyRouteDecision(input, { root }), null, 2));

function readOption(name) {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
}
