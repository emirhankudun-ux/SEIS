#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const mode = process.argv.length === 2 || process.argv[2] === "--plan" ? "plan" : process.argv[2] === "--apply-safe" ? "apply-safe" : null;
if (!mode || process.argv.length > 3) throw new Error("Usage: node scripts/run-seis-general-plugin-autopilot.mjs [--plan|--apply-safe]");
const result = spawnSync(process.execPath, ["scripts/run-seis-public-plugin-supervised-autopilot.mjs", `--${mode}`], {
  cwd: new URL("..", import.meta.url),
  stdio: "inherit",
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
