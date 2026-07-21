#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import {
  collectSeisCorePluginChangeEvidence,
  readSeisCorePluginChangeEvidenceArtifact,
  SEIS_CORE_PLUGIN_CHANGE_EVIDENCE_THRESHOLD,
} from "./seis-core-plugin-change-evidence.mjs";

const root = process.cwd();
const outputPath = path.join(root, "content", "development", "seis-core-plugin-change-evidence.json");
const checkMode = process.argv.includes("--check");
const evidence = checkMode
  ? readSeisCorePluginChangeEvidenceArtifact(root, { threshold: SEIS_CORE_PLUGIN_CHANGE_EVIDENCE_THRESHOLD })
  : collectSeisCorePluginChangeEvidence(root, { threshold: SEIS_CORE_PLUGIN_CHANGE_EVIDENCE_THRESHOLD });
const expected = `${JSON.stringify(evidence, null, 2)}\n`;

if (checkMode) {
  const actual = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8") : "";
  if (actual !== expected) {
    console.error("SEIS Core plugin change evidence is stale. Run: npm run automation:seis-core-plugin-change-evidence");
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, mode: "recorded-artifact", id: evidence.id, baseCommit: evidence.baseCommit, codeLinesChanged: evidence.codeLinesChanged, eligible: evidence.eligible }, null, 2));
  process.exit(0);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, expected);
console.log(JSON.stringify({
  ok: true,
  outputPath,
  baseCommit: evidence.baseCommit,
  codeLinesAdded: evidence.codeLinesAdded,
  codeLinesRemoved: evidence.codeLinesRemoved,
  codeLinesChanged: evidence.codeLinesChanged,
  threshold: evidence.threshold,
  eligible: evidence.eligible,
}, null, 2));
