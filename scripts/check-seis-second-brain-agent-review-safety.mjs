#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const paths = {
  desktop: "apps/web/desktop.js",
  reviewSkill: "plugins/seis-ai-agent/skills/seis-second-brain-review/SKILL.md",
  reviewAgent: "plugins/seis-ai-agent/skills/seis-second-brain-review/agents/openai.yaml",
  packageJson: "package.json"
};

for (const [label, relativePath] of Object.entries(paths)) {
  ensureFile(relativePath, label);
}

const desktop = readText(paths.desktop, "SEIS Desktop Second Brain source");
const reviewSkill = readText(paths.reviewSkill, "SEIS Second Brain review skill");
const reviewAgent = readText(paths.reviewAgent, "SEIS Second Brain review agent metadata");
const packageJson = readJson(paths.packageJson, "package.json");

for (const marker of [
  "SEIS_SECOND_BRAIN_AGENT_REVIEW_ASSIGNMENT",
  "maxLedgerEntries: 24",
  "maxBriefCharacters: 600",
  "buildSecondBrainAgentReviewLedgerRecord",
  "buildSecondBrainAgentReviewLedgerMarkdown",
  "agent-review-assignment.md",
  "agent-review-assignment.json",
  "agent-review-ledger.md",
  "agent-review-ledger.json",
  "agentExecuted: false",
  "providerCallsPerformed: false",
  "mcpInvocationsPerformed: false",
  "Plan-only assignment: ${assignment.agent.name}",
  "data-second-brain-agent-review-brief",
  "data-ai-second-brain-agent-review-brief",
  "data-second-brain-agent-review-outcome",
  "reviewOutcome",
  "approved-for-human-follow-up",
  "externalActionAllowed: false",
  "agentExecutionAllowed: false",
  "humanReviewBrief",
  "human-authored-browser-local",
  "#human-selected"
]) {
  ensure(desktop.includes(marker), `SEIS Desktop must retain the plan-only review safety marker: ${marker}.`);
}

for (const marker of [
  "agentExecuted: true",
  "providerCallsPerformed: true",
  "mcpInvocationsPerformed: true"
]) {
  ensure(!desktop.includes(marker), `SEIS Desktop must not claim live agent execution in the browser-local review flow: ${marker}.`);
}

for (const marker of ["@seis", "@seis-cloud", "@seis-code", "@seis-design", "@seis-data"]) {
  ensure(reviewSkill.includes(marker), `Second Brain review skill must name the installed lane ${marker}.`);
}

for (const marker of ["Plan-only", "Obsidian", "approval", "GitHub"]) {
  ensure(reviewSkill.toLowerCase().includes(marker.toLowerCase()), `Second Brain review skill must retain its ${marker} boundary.`);
}

ensure(reviewAgent.length > 0, "Second Brain review skill must include agent metadata.");
ensure(
  packageJson?.scripts?.["check:seis-second-brain-agent-review-safety"] ===
    "node scripts/check-seis-second-brain-agent-review-safety.mjs",
  "package.json must expose check:seis-second-brain-agent-review-safety."
);
ensure(
  packageJson?.scripts?.["check:seis-second-brain"] === "node scripts/check-seis-second-brain.mjs",
  "package.json must preserve the canonical check:seis-second-brain command."
);
ensure(
  packageJson?.scripts?.["check:seis-second-brain:full"] ===
    "npm run check:seis-second-brain && npm run check:seis-second-brain-agent-review-safety",
  "package.json must expose the combined Second Brain safety check."
);

if (failures.length > 0) {
  console.error("SEIS Second Brain agent review safety check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS Second Brain agent review safety check passed.");

function abs(relativePath) {
  return path.join(root, ...relativePath.split("/"));
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(relativePath, label) {
  if (!fs.existsSync(abs(relativePath))) {
    failures.push(`${label} missing: ${relativePath}`);
  }
}

function readText(relativePath, label) {
  try {
    return fs.readFileSync(abs(relativePath), "utf8");
  } catch (error) {
    failures.push(`${label} could not be read: ${error.message}`);
    return "";
  }
}

function readJson(relativePath, label) {
  try {
    return JSON.parse(fs.readFileSync(abs(relativePath), "utf8"));
  } catch (error) {
    failures.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}
