#!/usr/bin/env node

import { spawnSync } from "node:child_process";

// Compatibility gate for older automation. Workspace routing is now a static,
// repository-owned contract; live local discovery remains an explicit,
// read-only inspection command and is never run in CI.
const result = spawnSync(
  process.execPath,
  ["scripts/check-seis-local-workspace-registry.mjs"],
  {
    cwd: process.cwd(),
    encoding: "utf8"
  }
);

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

if (result.error) {
  console.error("SEIS workspace routing check could not start.");
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("SEIS workspace routing compatibility check passed.");
