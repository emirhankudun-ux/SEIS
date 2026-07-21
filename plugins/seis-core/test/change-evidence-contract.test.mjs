import assert from "node:assert/strict";
import test from "node:test";

import {
  assertSeisCorePluginChangeEvidence,
  SEIS_CORE_PLUGIN_CHANGE_EVIDENCE_ID,
  SEIS_CORE_PLUGIN_CHANGE_SCOPE,
} from "../../../scripts/seis-core-plugin-change-evidence.mjs";

const validEvidence = {
  schemaVersion: 1,
  id: SEIS_CORE_PLUGIN_CHANGE_EVIDENCE_ID,
  goalId: "SEIS-GOAL-021",
  baseCommit: "0123456789abcdef0123456789abcdef01234567",
  generatedAt: "2026-07-21",
  scope: {
    application: "apps/seis-core",
    sourceRoot: "plugins/seis-core",
    paths: [...SEIS_CORE_PLUGIN_CHANGE_SCOPE],
    codeExtensions: [".cjs", ".css", ".go", ".html", ".js", ".mjs", ".py", ".rs", ".sh", ".swift", ".ts", ".tsx"],
  },
  threshold: 500,
  codeLinesAdded: 520,
  codeLinesRemoved: 5,
  codeLinesChanged: 525,
  eligible: true,
  files: [
    {
      path: "scripts/example-change-evidence.mjs",
      added: 520,
      removed: 5,
      changed: 525,
      state: "tracked-diff",
    },
  ],
};

test("accepts a canonical recorded change-evidence snapshot", () => {
  assert.deepEqual(assertSeisCorePluginChangeEvidence(validEvidence, { threshold: 500 }), validEvidence);
});

test("rejects an evidence snapshot whose totals are inconsistent", () => {
  const invalidEvidence = { ...validEvidence, codeLinesChanged: 524 };
  assert.throws(
    () => assertSeisCorePluginChangeEvidence(invalidEvidence, { threshold: 500 }),
    /codeLinesChanged must equal additions plus removals/,
  );
});
