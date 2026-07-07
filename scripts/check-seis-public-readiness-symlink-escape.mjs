#!/usr/bin/env node

import assert from "node:assert/strict";
import { copyFileSync, mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const workspace = mkdtempSync(join(tmpdir(), "seis-validator-symlink-escape-"));
const sourceRoot = process.cwd();

try {
  const repoRoot = join(workspace, "repo");
  const outsideRoot = join(workspace, "outside");
  const scriptsDir = join(repoRoot, "scripts");
  const contentDir = join(repoRoot, "content", "development");

  mkdirSync(scriptsDir, { recursive: true });
  mkdirSync(contentDir, { recursive: true });
  mkdirSync(outsideRoot, { recursive: true });

  copyFileSync(
    join(sourceRoot, "scripts", "check-seis-public-readiness-evidence.mjs"),
    join(scriptsDir, "check-seis-public-readiness-evidence.mjs")
  );
  copyFileSync(
    join(sourceRoot, "scripts", "check-seis-public-readiness-sensitive-boundary.mjs"),
    join(scriptsDir, "check-seis-public-readiness-sensitive-boundary.mjs")
  );

  writeFileSync(
    join(repoRoot, "package.json"),
    `${JSON.stringify(
      {
        type: "module",
        scripts: {
          "check:seis-public-readiness-evidence": "node scripts/check-seis-public-readiness-evidence.mjs",
          "check:seis-public-readiness-sensitive-boundary":
            "node scripts/check-seis-public-readiness-sensitive-boundary.mjs"
        }
      },
      null,
      2
    )}\n`
  );

  writeFileSync(join(outsideRoot, "outside-evidence.md"), "outside repository evidence marker\n");
  symlinkSync(join(outsideRoot, "outside-evidence.md"), join(repoRoot, "outside-link.md"));

  writeFileSync(
    join(contentDir, "seis-public-readiness-status.json"),
    `${JSON.stringify(
      {
        id: "seis-public-readiness-status",
        surfaces: [
          {
            id: "symlink-escape-fixture",
            evidence: ["outside-link.md"],
            requiredChecks: []
          }
        ]
      },
      null,
      2
    )}\n`
  );

  const evidence = runValidator(repoRoot, "scripts/check-seis-public-readiness-evidence.mjs");
  const sensitive = runValidator(repoRoot, "scripts/check-seis-public-readiness-sensitive-boundary.mjs");

  assertRejectsRealpathEscape(evidence, "evidence validator");
  assertRejectsRealpathEscape(sensitive, "sensitive-boundary validator");

  console.log("SEIS public-readiness symlink escape check passed.");
} finally {
  rmSync(workspace, { recursive: true, force: true });
}

function runValidator(cwd, script) {
  return spawnSync(process.execPath, [script], {
    cwd,
    encoding: "utf8"
  });
}

function assertRejectsRealpathEscape(result, label) {
  assert.notEqual(result.status, 0, `${label} should reject repo-local symlinks that resolve outside repo root`);
  const combinedOutput = `${result.stdout}\n${result.stderr}`;
  assert.match(
    combinedOutput,
    /evidence real path must stay inside repo root: outside-link\.md/,
    `${label} should report the realpath escape boundary without reading outside evidence`
  );
}
