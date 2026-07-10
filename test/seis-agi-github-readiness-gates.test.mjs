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
  "scripts/check-seis-agi-independent-evidence-ledger.mjs",
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

test("AGI GitHub readiness checker rejects duplicate fresh clone commands", () => {
  const result = runFixture((fixture) => {
    updateJson(fixture, "content/development/seis-agi-github-fresh-clone-readiness-plan.json", (plan) => {
      plan.safeCommands[3] = { ...plan.safeCommands[0] };
    });
  });

  assert.notEqual(result.status, 0);
  assert.match((result.stdout || "") + (result.stderr || ""), /fresh clone safe command ids missing run-readiness-chain/);
});

test("AGI GitHub readiness checker rejects weakened independent evidence gates", () => {
  const result = runFixture((fixture) => {
    updateJson(fixture, "content/development/seis-agi-github-readiness-gates.json", (gates) => {
      gates.readinessGates.find((gate) => gate.id === "independent-agi-evaluation").independentEvidenceRequired = false;
    });
  });

  assert.notEqual(result.status, 0);
  assert.match((result.stdout || "") + (result.stderr || ""), /independent-agi-evaluation\.independentEvidenceRequired must remain true/);
});

test("AGI GitHub readiness checker rejects removed forbidden claims", () => {
  const result = runFixture((fixture) => {
    updateJson(fixture, "content/development/seis-agi-github-readiness-gates.json", (gates) => {
      gates.forbiddenClaims[2] = "placeholder";
    });
  });

  assert.notEqual(result.status, 0);
  assert.match((result.stdout || "") + (result.stderr || ""), /forbidden claims missing SEIS has trained or owns a 20B foundation model/);
});

test("AGI GitHub readiness checker rejects replaced release evidence", () => {
  const result = runFixture((fixture) => {
    updateJson(fixture, "content/development/seis-agi-github-readiness-gates.json", (gates) => {
      gates.requiredEvidence[0] = "placeholder";
    });
  });

  assert.notEqual(result.status, 0);
  assert.match((result.stdout || "") + (result.stderr || ""), /requiredEvidence missing versioned model card and data provenance record/);
});

test("AGI GitHub readiness checker requires workflow guard paths for each trigger", () => {
  const result = runFixture((fixture) => {
    const workflowPath = path.join(fixture, ".github/workflows/seis-agi-github-readiness.yml");
    const workflow = readFileSync(workflowPath, "utf8");
    writeFileSync(workflowPath, workflow.replaceAll('      - "scripts/check-seis-agi-github-readiness-gates.mjs"\n', ""));
  });

  assert.notEqual(result.status, 0);
  assert.match((result.stdout || "") + (result.stderr || ""), /workflow pull_request paths missing scripts\/check-seis-agi-github-readiness-gates\.mjs/);
});

test("AGI GitHub readiness checker requires the canonical independent evidence ledger in the chain", () => {
  const result = runFixture((fixture) => {
    const chainPath = path.join(fixture, "scripts/check-seis-ai-github-readiness-chain.mjs");
    const chain = readFileSync(chainPath, "utf8");
    writeFileSync(chainPath, chain.replace("scripts/check-seis-agi-independent-evidence-ledger.mjs", "removed-ledger-check.mjs"));
  });

  assert.notEqual(result.status, 0);
  assert.match((result.stdout || "") + (result.stderr || ""), /AGI GitHub readiness chain missing scripts\/check-seis-agi-independent-evidence-ledger\.mjs/);
});
