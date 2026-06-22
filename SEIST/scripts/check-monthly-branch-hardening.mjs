#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const programPath = "content/development/monthly-branch-hardening.json";
const docPath = "docs/development/monthly-branch-hardening.md";
const packagePath = "package.json";
const failures = [];

function readJson(file) {
  if (!existsSync(file)) {
    failures.push(`missing file: ${file}`);
    return null;
  }

  return JSON.parse(readFileSync(file, "utf8"));
}

function readText(file) {
  if (!existsSync(file)) {
    failures.push(`missing file: ${file}`);
    return "";
  }

  return readFileSync(file, "utf8");
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

const program = readJson(programPath);
const pkg = readJson(packagePath);
const doc = readText(docPath);

if (program) {
  ensure(program.id === "seis-monthly-branch-hardening", "monthly hardening id must stay stable");
  ensure(program.month === "2026-06", "monthly hardening month must stay explicit");
  ensure(program.branch === "UIXAppTTR", "monthly hardening must target UIXAppTTR");
  ensure(program.mode === "repo-first-plugin-second", "monthly hardening must keep repo-first-plugin-second mode");
  ensure(Array.isArray(program.principles) && program.principles.length >= 5, "monthly hardening must include at least five principles");
  ensure(Array.isArray(program.workstreams) && program.workstreams.length >= 4, "monthly hardening must define at least four workstreams");
  ensure(Array.isArray(program.stopConditions) && program.stopConditions.length >= 5, "monthly hardening must include at least five stop conditions");

  const requiredWorkstreams = [
    "branch-foundation",
    "capability-contracts",
    "release-and-deploy-readiness",
    "plugin-integration"
  ];
  const workstreamIds = new Set((program.workstreams || []).map((workstream) => workstream.id));
  for (const id of requiredWorkstreams) {
    ensure(workstreamIds.has(id), `monthly hardening missing workstream: ${id}`);
  }

  for (const workstream of program.workstreams || []) {
    ensure(workstream.label, `workstream ${workstream.id || "unknown"} must define label`);
    ensure(workstream.status, `workstream ${workstream.id || "unknown"} must define status`);
    ensure(workstream.goal, `workstream ${workstream.id || "unknown"} must define goal`);
    ensure(Array.isArray(workstream.qualityCommands) && workstream.qualityCommands.length >= 2, `workstream ${workstream.id || "unknown"} must define quality commands`);
    ensure(workstream.exitGate, `workstream ${workstream.id || "unknown"} must define exit gate`);
  }

  ensure((program.sequence || [])[0] === "repo branch foundation", "monthly hardening sequence must start with repo branch foundation");
  ensure((program.sequence || []).includes("plugin integration"), "monthly hardening sequence must include plugin integration");
}

if (pkg) {
  ensure(Boolean(pkg.scripts?.["check:monthly-branch-hardening"]), "package.json must expose check:monthly-branch-hardening");
}

for (const requiredText of [
  "repo first, plugin second",
  "UIXAppTTR",
  "npm run check:monthly-branch-hardening",
  "data engineering",
  "development",
  "design",
  "learning",
  "monitoring",
  "productivity",
  "security",
  "testing",
  "Stop Conditions"
]) {
  ensure(doc.includes(requiredText), `monthly hardening docs must include: ${requiredText}`);
}

if (failures.length > 0) {
  console.error("SEIS monthly branch hardening check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS monthly branch hardening check passed.");
