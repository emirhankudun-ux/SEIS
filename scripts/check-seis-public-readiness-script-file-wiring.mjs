#!/usr/bin/env node

import assert from "node:assert/strict";
import { copyFileSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const workspace = mkdtempSync(join(tmpdir(), "seis-required-script-file-wiring-"));
const sourceRoot = process.cwd();

try {
  const repoRoot = join(workspace, "repo");
  const scriptsDir = join(repoRoot, "scripts");
  const contentDir = join(repoRoot, "content", "development");

  mkdirSync(scriptsDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });

  copyFileSync(
    join(sourceRoot, "scripts", "check-seis-public-readiness-evidence.mjs"),
    join(scriptsDir, "check-seis-public-readiness-evidence.mjs")
  );

  writeFileSync(join(repoRoot, "README.md"), "fixture public readiness evidence\n");
  writeFileSync(
    join(repoRoot, "package.json"),
    `${JSON.stringify(
      {
        type: "module",
        scripts: {
          "check:seis-public-readiness-evidence": "node scripts/check-seis-public-readiness-evidence.mjs",
          "check:missing-fixture-validator": "node scripts/missing-fixture-validator.mjs"
        }
      },
      null,
      2
    )}\n`
  );

  writeFileSync(
    join(contentDir, "seis-public-readiness-status.json"),
    `${JSON.stringify(
      {
        id: "seis-public-readiness-status",
        surfaces: [
          {
            id: "script-file-wiring-fixture",
            evidence: ["README.md"],
            requiredChecks: ["npm run check:missing-fixture-validator"]
          }
        ]
      },
      null,
      2
    )}\n`
  );

  const result = spawnSync(process.execPath, ["scripts/check-seis-public-readiness-evidence.mjs"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.notEqual(result.status, 0, "evidence validator should reject package scripts whose command file is missing");
  assert.match(
    `${result.stdout}\n${result.stderr}`,
    /package script command file missing: npm run check:missing-fixture-validator -> scripts\/missing-fixture-validator\.mjs/,
    "evidence validator should identify the missing required package script file"
  );

  console.log("SEIS public-readiness script-file wiring check passed.");
} finally {
  rmSync(workspace, { recursive: true, force: true });
}
