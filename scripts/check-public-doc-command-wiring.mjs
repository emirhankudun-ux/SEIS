#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const publicDocs = [
  ".github/PULL_REQUEST_TEMPLATE.md",
  ".github/ISSUE_TEMPLATE/master_prompt_governance.md",
  "README.md",
  "docs/INDEX.md",
  "docs/GETTING_STARTED.md",
  "docs/TROUBLESHOOTING.md",
  "docs/PUBLIC_READINESS.md",
  "docs/OBSIDIAN_SECOND_BRAIN.md",
  "docs/LOCAL_AI_SETUP.md",
  "docs/SEIS_SSH_SETUP.md",
  "docs/development/first-run-quickstart.md",
  "docs/governance/branch-policy.md",
  "docs/governance/branch-policy-reconciliation.md",
  "docs/governance/open-source-governance.md",
  "docs/governance/public-readiness-status.md",
];

const failures = [];

function read(file) {
  const absolutePath = resolve(root, file);
  if (!existsSync(absolutePath)) {
    failures.push(`missing ${file}`);
    return "";
  }
  return readFileSync(absolutePath, "utf8");
}

const packageJson = JSON.parse(read("package.json") || "{}");
const scripts = packageJson.scripts || {};

let npmCommandCount = 0;
let directNodeScriptCount = 0;

for (const file of publicDocs) {
  const text = read(file);
  const npmCommands = uniqueMatches(text, /npm run ([A-Za-z0-9:_-]+)/g);
  const directNodeScripts = uniqueMatches(text, /node (scripts\/[A-Za-z0-9_.:/-]+\.mjs)/g);

  npmCommandCount += npmCommands.length;
  directNodeScriptCount += directNodeScripts.length;

  for (const command of npmCommands) {
    if (!scripts[command]) {
      failures.push(`${file} references npm run ${command}, but package.json does not define ${command}`);
    }
  }

  for (const scriptPath of directNodeScripts) {
    if (!existsSync(resolve(root, scriptPath))) {
      failures.push(`${file} references ${scriptPath}, but the script file does not exist`);
    }
  }
}

if (failures.length > 0) {
  console.error("SEIS public docs command wiring check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `SEIS public docs command wiring check passed: ${publicDocs.length} docs, ${npmCommandCount} npm command references, ${directNodeScriptCount} direct node script references.`,
);

function uniqueMatches(text, pattern) {
  return [...new Set([...text.matchAll(pattern)].map((match) => match[1]))].sort();
}
