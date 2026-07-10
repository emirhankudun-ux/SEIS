import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const checker = "scripts/check-seis-agi-github-readiness-gates.mjs";
const fixtureFiles = [
  "content/development/seis-agi-github-readiness-gates.json",
  "content/development/seis-agi-independent-evidence-ledger.json",
  "content/development/seis-agi-github-fresh-clone-readiness-plan.json",
  "docs/ai/seis-agi-github-readiness-gates.md",
  "docs/STATUS.md",
  "docs/roadmap/NEXT_PR_QUEUE.md",
  "package.json",
  checker,
  "scripts/check-seis-ai-github-readiness-chain.mjs",
  ".github/workflows/seis-agi-github-readiness.yml"
];

function runFixture(mutate) {
  const fixture = mkdtempSync(path.join(os.tmpdir(), "seis-agi-readiness-"));
  try {
    for (const relativePath of fixtureFiles) {
      const target = path.join(fixture, relativePath);
      mkdirSync(path.dirname(target), { recursive: true });
      cpSync(path.join(root, relativePath), target);
    }

    mutate(fixture);
    return spawnSync(process.execPath, [checker, "--scope", "all"], {
      cwd: fixture,
      encoding: "utf8"
    });
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
}

function updateJson(fixture, relativePath, mutate) {
  const filePath = path.join(fixture, relativePath);
  const value = JSON.parse(readFileSync(filePath, "utf8"));
  mutate(value);
  writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

test("AGI GitHub readiness checker rejects an enabled AGI claim", () => {
  const result = runFixture((fixture) => {
    updateJson(fixture, "content/development/seis-agi-github-readiness-gates.json", (gates) => {
      gates.publicClaimBoundary.canClaimRealAgi = true;
    });
  });

  assert.notEqual(result.status, 0);
  assert.match((result.stdout || "") + (result.stderr || ""), /canClaimRealAgi must remain false/);
});

test("AGI GitHub readiness checker reports malformed gate arrays", () => {
  const result = runFixture((fixture) => {
    updateJson(fixture, "content/development/seis-agi-github-readiness-gates.json", (gates) => {
      gates.readinessGates = {};
    });
  });

  assert.notEqual(result.status, 0);
  assert.match((result.stdout || "") + (result.stderr || ""), /readinessGates must be an array/);
});

test("AGI GitHub readiness checker reports malformed fresh clone commands", () => {
  const result = runFixture((fixture) => {
    updateJson(fixture, "content/development/seis-agi-github-fresh-clone-readiness-plan.json", (plan) => {
      plan.safeCommands = {};
    });
  });

  assert.notEqual(result.status, 0);
  assert.match((result.stdout || "") + (result.stderr || ""), /safeCommands must be an array/);
});

test("AGI GitHub readiness checker reports malformed ledger inquiries", () => {
  const result = runFixture((fixture) => {
    updateJson(fixture, "content/development/seis-agi-independent-evidence-ledger.json", (ledger) => {
      ledger.pendingExternalInquiries = {};
    });
  });

  assert.notEqual(result.status, 0);
  assert.match((result.stdout || "") + (result.stderr || ""), /pendingExternalInquiries must be an array/);
});
