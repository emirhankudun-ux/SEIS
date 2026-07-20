#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  DEFAULT_INDEPENDENT_RUNNER_EVIDENCE_PATH,
  INDEPENDENT_RUNNER_EVIDENCE_CONTRACT_PATH,
  buildIndependentRunnerEvidenceTemplate,
  inspectIndependentRunnerEvidence,
} from "../plugins/seis-core/runtime/public-install-evidence-runtime.mjs";

export {
  DEFAULT_INDEPENDENT_RUNNER_EVIDENCE_PATH,
  INDEPENDENT_RUNNER_EVIDENCE_CONTRACT_PATH,
  buildIndependentRunnerEvidenceTemplate,
  inspectIndependentRunnerEvidence,
};

function parseArgs(argv) {
  const parsed = { requireRecorded: false, inputPath: null, printTemplate: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--require-recorded") parsed.requireRecorded = true;
    else if (value === "--print-template") parsed.printTemplate = true;
    else if (value === "--input") parsed.inputPath = argv[index + 1] || null;
  }
  return parsed;
}

function isEntrypoint() {
  return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isEntrypoint()) {
  const args = parseArgs(process.argv.slice(2));
  if (args.printTemplate) {
    const template = buildIndependentRunnerEvidenceTemplate(process.cwd());
    console.log(JSON.stringify(template, null, 2));
    process.exit(template ? 0 : 1);
  }
  const result = inspectIndependentRunnerEvidence(process.cwd(), args);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}
