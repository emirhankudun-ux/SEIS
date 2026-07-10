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

test("AGI GitHub readiness checker rejects an enabled AGI claim", () => {
  const fixture = mkdtempSync(path.join(os.tmpdir(), "seis-agi-readiness-"));
  try {
    for (const relativePath of fixtureFiles) {
      const target = path.join(fixture, relativePath);
      mkdirSync(path.dirname(target), { recursive: true });
      cpSync(path.join(root, relativePath), target);
    }

    const gatesPath = path.join(fixture, "content/development/seis-agi-github-readiness-gates.json");
    const gates = JSON.parse(readFileSync(gatesPath, "utf8"));
    gates.publicClaimBoundary.canClaimRealAgi = true;
    writeFileSync(gatesPath, JSON.stringify(gates, null, 2) + "\n");

    const result = spawnSync(process.execPath, [checker, "--scope", "all"], {
      cwd: fixture,
      encoding: "utf8"
    });

    assert.notEqual(result.status, 0);
    assert.match((result.stdout || "") + (result.stderr || ""), /canClaimRealAgi must remain false/);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
