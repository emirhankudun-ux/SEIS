#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const failures = [];
const paths = {
  doc: "docs/SEIS_GOAL_TRACKING.md",
  agents: "AGENTS.md",
  index: "docs/INDEX.md"
};

for (const [label, relativePath] of Object.entries(paths)) ensureFile(abs(relativePath), label);

const doc = readText(paths.doc, "goal tracking constitution");
const agents = readText(paths.agents, "AGENTS.md");
const index = readText(paths.index, "docs index");

for (const token of [
  "SEIS Goal Tracking Constitution",
  "Apple-first",
  "AI-native",
  "five-year",
  "Clean Worktree Rule",
  "Goal Record Shape",
  "Five-Year Roadmap Order",
  "Required Agent-Swarm Roles",
  "MCP Rule",
  "9Router / Model Router Layer",
  "Definition Of Done",
  "Final Swarm Summary Shape",
  "Repository state: clean"
]) {
  ensure(doc.includes(token), `goal tracking constitution missing ${token}`);
}

for (const category of [
  "design",
  "development",
  "devops",
  "ai",
  "llm",
  "mcp",
  "security",
  "docs",
  "architecture",
  "testing",
  "release"
]) {
  ensure(doc.includes(category), `goal category missing ${category}`);
}

for (const route of [
  "coding_fast",
  "architecture_deep",
  "design_review",
  "vision_review",
  "offline_mode",
  "local_private",
  "low_cost",
  "high_reasoning",
  "safe_mode"
]) {
  ensure(doc.includes(route), `9Router route family missing ${route}`);
}

ensure(agents.includes("docs/SEIS_GOAL_TRACKING.md"), "AGENTS.md must link to docs/SEIS_GOAL_TRACKING.md");
ensure(index.includes("docs/SEIS_GOAL_TRACKING.md") || index.includes("SEIS_GOAL_TRACKING.md"), "docs index must link to SEIS_GOAL_TRACKING.md");
ensureNotIgnored(paths.doc, "goal tracking constitution");


for (const [text, label] of [
  [doc, "goal tracking constitution"],
  [index, "docs index"]
]) {
  requireNotMatches(text, /\/Users\//, `${label} must not include local user paths`);
  requireNotMatches(text, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, `${label} must not include private key blocks`);
  requireNotMatches(text, /gh[pousr]_[A-Za-z0-9_]{20,}/, `${label} must not include GitHub token-shaped values`);
  requireNotMatches(text, /AKIA[0-9A-Z]{16}/, `${label} must not include AWS key-shaped values`);
  requireNotMatches(text, /(?:^|[^A-Za-z])sk-(?:proj-|live-|test-|svcacct-|admin-|org-|user-)?[A-Za-z0-9_]{20,}/, `${label} must not include provider key-shaped values`);
}

if (failures.length > 0) {
  console.error("SEIS goal tracking constitution check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS goal tracking constitution check passed.");

function abs(relativePath) {
  return path.join(root, ...relativePath.split("/"));
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    failures.push(`${label} missing: ${path.relative(root, filePath)}`);
  }
}

function ensureNotIgnored(relativePath, label) {
  if (!fs.existsSync(path.join(root, ".git"))) return;
  const result = spawnSync("git", ["check-ignore", "-q", relativePath], { cwd: root });
  if (result.status === 0) failures.push(`${label} must be committable and not ignored`);
}

function readJson(relativePath, label) {
  const filePath = abs(relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(relativePath, label) {
  const filePath = abs(relativePath);
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} could not be read: ${error.message}`);
    return "";
  }
}

function requireNotMatches(text, pattern, message) {
  if (pattern.test(text)) failures.push(message);
}
