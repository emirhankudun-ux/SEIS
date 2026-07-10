#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const target = resolve(process.cwd(), "scripts", "create-seis-second-brain-accessibility-focus-report.mjs");
const result = spawnSync(process.execPath, [target, ...process.argv.slice(2)], {
  stdio: "inherit"
});

if (result.error) {
  throw new Error(`Unable to run accessibility/focus report script: ${result.error.message}`);
}

if (result.status !== null && result.status !== 0) {
  process.exit(result.status);
}

