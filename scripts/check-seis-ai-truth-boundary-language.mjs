#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const policyPath = "content/development/seis-ai-truth-boundary-language-policy.json";
const policy = readJson(policyPath, "truth-boundary language policy");

ensure(policy?.id === "seis-ai-truth-boundary-language-policy", "policy id mismatch");
ensure(policy?.status === "active-governance-check", "policy status must stay active-governance-check");
ensure(policy?.qualityGate === "npm run check:seis-ai-truth-boundary-language", "policy quality gate mismatch");
ensure(
  String(policy?.truthBoundary || "").includes("does not train models") &&
    String(policy?.truthBoundary || "").includes("execute SSH") &&
    String(policy?.truthBoundary || "").includes("approve autonomous background agents"),
  "policy truthBoundary must forbid model, SSH, cloud, and autonomous-agent claims"
);

const files = Object.fromEntries(
  (Array.isArray(policy?.scanFiles) ? policy.scanFiles : []).map((entry) => [entry.id, entry.path])
);

const texts = Object.fromEntries(
  Object.entries(files).map(([label, relativePath]) => [label, readText(relativePath, label)])
);
const packageJson = readJson(files.packageJson, "package.json");

ensure(Object.keys(files).length >= 7, "policy must define all scan files");
ensure(files.packageJson === "package.json", "policy must include package.json scan file");

for (const rule of Array.isArray(policy?.disallowedPatterns) ? policy.disallowedPatterns : []) {
  ensure(typeof rule.id === "string" && rule.id.length > 0, "disallowed pattern missing id");
  ensure(typeof rule.label === "string" && rule.label.length > 0, `${rule.id || "unknown"} missing label`);
  ensure(Array.isArray(rule.fileIds) && rule.fileIds.length > 0, `${rule.id || "unknown"} missing fileIds`);
  ensure(typeof rule.pattern === "string" && rule.pattern.length > 0, `${rule.id || "unknown"} missing pattern`);
  for (const label of rule.fileIds || []) {
    ensureNoMatch(label, new RegExp(rule.pattern), rule.label);
  }
}

ensure((policy?.disallowedPatterns || []).length >= 5, "policy must define at least five disallowed phrase rules");

for (const required of Array.isArray(policy?.requiredPhrases) ? policy.requiredPhrases : []) {
  ensure(typeof required.fileId === "string" && required.fileId.length > 0, `${required.id || "unknown"} missing fileId`);
  ensure(typeof required.phrase === "string" && required.phrase.length > 0, `${required.id || "unknown"} missing phrase`);
  ensure(
    String(texts[required.fileId] || "").includes(required.phrase),
    required.message || `${required.fileId} must include ${required.phrase}`
  );
}

ensure((policy?.requiredPhrases || []).length >= 4, "policy must define required safe-language phrases");

ensure(
  packageJson?.scripts?.[policy?.packageScripts?.checkScriptName] === policy?.packageScripts?.checkScriptCommand,
  "package.json must expose check:seis-ai-truth-boundary-language"
);
ensure(
  String(packageJson?.scripts?.["quality:governance"] || "").includes(policy?.packageScripts?.qualityGovernanceMustInclude),
  "quality:governance must include check:seis-ai-truth-boundary-language"
);

if (failures.length > 0) {
  console.error("SEIS AI truth-boundary language check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS AI truth-boundary language check passed.");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureNoMatch(label, pattern, description) {
  const text = texts[label] || "";
  const match = text.match(pattern);
  if (!match) return;

  const index = match.index ?? 0;
  const line = text.slice(0, index).split(/\r?\n/).length;
  failures.push(`${files[label]}:${line} contains disallowed ${description}`);
}

function readText(relativePath, label) {
  const filePath = path.join(root, relativePath);
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} could not be read: ${relativePath}: ${error.message}`);
    return "";
  }
}

function readJson(relativePath, label) {
  try {
    return JSON.parse(readText(relativePath, label));
  } catch (error) {
    failures.push(`${label} is invalid JSON: ${relativePath}: ${error.message}`);
    return null;
  }
}
