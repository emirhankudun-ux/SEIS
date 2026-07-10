#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagePath = path.join(root, "apps/web/seis-terminal.html");
const docsPath = path.join(root, "docs/product/seis-terminal-demo.md");

const requiredCommands = ["help", "status", "ssh status", "git status", "sync plan", "clear"];

const requiredMarkers = [
  "data-seis-terminal-demo",
  "data-run-command",
  "data-action=\"reset-terminal\"",
  "command-form",
  "command-input",
  "localStorage",
  "SSH status",
  "disabled",
  "planned",
  "safe browser demo mode"
];

const requiredSafetyPhrases = [
  "No API keys are required",
  "No shell command is executed",
  "No SSH is executed",
  "No private key is read",
  "No GitHub mutation is performed",
  "No Git push is performed",
  "No deployment is triggered",
  "No file mutation is performed",
  "No AI provider call is performed",
  "No branch protection is changed"
];

const forbiddenClaims = [
  "real SSH is enabled",
  "shell execution is enabled",
  "GitHub mutation is enabled",
  "deployment mutation is enabled",
  "Git push is enabled",
  "private key is loaded",
  "branch protection bypass is enabled",
  "live AI provider calls are enabled",
  "API keys are stored in localStorage"
];

function fail(message) {
  console.error(`SEIS Terminal demo check failed: ${message}`);
  process.exit(1);
}

for (const filePath of [pagePath, docsPath]) {
  if (!fs.existsSync(filePath)) {
    fail(`missing ${path.relative(root, filePath)}`);
  }
}

const page = fs.readFileSync(pagePath, "utf8");
const docs = fs.readFileSync(docsPath, "utf8");

if (!/<title>[\s\S]*?<\/title>/i.test(page)) {
  fail("Terminal page is missing a title");
}

if (!/<meta\s+name=["']viewport["']/i.test(page)) {
  fail("Terminal page is missing viewport metadata");
}

for (const marker of requiredMarkers) {
  if (!page.includes(marker) && !docs.includes(marker)) {
    fail(`Terminal demo is missing marker: ${marker}`);
  }
}

for (const command of requiredCommands) {
  if (!page.includes(command) || !docs.includes(`\`${command}\``)) {
    fail(`Terminal demo is missing allowlisted command: ${command}`);
  }
}

for (const phrase of requiredSafetyPhrases) {
  if (!docs.includes(phrase)) {
    fail(`Terminal docs are missing safety phrase: ${phrase}`);
  }
}

const combined = `${page}\n${docs}`.toLowerCase();
for (const claim of forbiddenClaims) {
  if (combined.includes(claim.toLowerCase())) {
    fail(`forbidden live/security claim found: ${claim}`);
  }
}

console.log("SEIS Terminal demo check passed.");
