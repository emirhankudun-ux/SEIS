#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const paths = {
  contract: "content/development/seis-ai-fresh-clone-readiness.json",
  publicReadinessProgram: "content/development/seis-ai-public-readiness-program.json",
  githubUserReadinessGates: "content/development/seis-agi-github-user-readiness-gates.json",
  agiPublicReadinessEvidence: "content/development/seis-agi-public-readiness-evidence.json",
  readme: "README.md",
  securityPolicy: "SECURITY.md",
  packageJson: "package.json",
  doc: "docs/ai/seis-ai-fresh-clone-readiness.md"
};

for (const [label, relativePath] of Object.entries(paths)) ensureFile(relativePath, label);

const contract = readJson(paths.contract, "AI fresh-clone readiness contract");
const publicProgram = readJson(paths.publicReadinessProgram, "AI public readiness program");
const githubGates = readJson(paths.githubUserReadinessGates, "AGI GitHub user readiness gates");
const publicEvidence = readJson(paths.agiPublicReadinessEvidence, "AGI public readiness evidence");
const packageJson = readJson(paths.packageJson, "package.json");
const readme = readText(paths.readme, "README");
const securityPolicy = readText(paths.securityPolicy, "SECURITY policy");
const doc = readText(paths.doc, "AI fresh-clone readiness docs");

if (contract) {
  ensure(contract.id === "seis-ai-fresh-clone-readiness", "contract id mismatch");
  ensure(contract.status === "contract-defined-not-release-evidence", "contract status mismatch");
  ensure(contract.resourceUri === "seis://ai/fresh-clone-readiness.json", "contract resource URI mismatch");
  ensure(contract.qualityGate === "npm run check:seis-ai-fresh-clone-readiness", "contract qualityGate mismatch");
  ensure(contract.coreCredentialRequirement === "none", "coreCredentialRequirement must remain none");
  ensure(contract.defaultRuntimeMode === "seis-local-demo", "defaultRuntimeMode must remain seis-local-demo");
  ensure(contract.freshCloneVerified === false, "freshCloneVerified must stay false until real target-commit evidence exists");
  ensure(contract.githubReadyForEveryone === false, "githubReadyForEveryone must stay false");
  ensure(contract.publicReadyForLocalDemo === true, "publicReadyForLocalDemo must be true");
  ensure(contract.publicReadyAsAgi === false, "publicReadyAsAgi must stay false");
  ensure(contract.routeEligibleToday === false, "routeEligibleToday must stay false");
  ensure(contract.runtimeAuthority === false, "runtimeAuthority must stay false");

  for (const phrase of [
    "does not perform a network clone",
    "install models",
    "download checkpoints",
    "train models",
    "run inference",
    "call providers",
    "provision cloud/GPU resources",
    "execute SSH",
    "push, merge, deploy",
    "grant runtime authority",
    "prove AGI"
  ]) {
    ensure(String(contract.truthBoundary || "").includes(phrase), `truthBoundary missing phrase: ${phrase}`);
  }

  ensureSource(contract, "publicReadinessProgram", paths.publicReadinessProgram);
  ensureSource(contract, "githubUserReadinessGates", paths.githubUserReadinessGates);
  ensureSource(contract, "agiPublicReadinessEvidence", paths.agiPublicReadinessEvidence);
  ensureSource(contract, "readme", paths.readme);
  ensureSource(contract, "securityPolicy", paths.securityPolicy);
  ensureSource(contract, "packageJson", paths.packageJson);
  ensureSource(contract, "doc", paths.doc);

  ensureArrayIncludesAll(
    (contract.githubPublicReadinessBaseline || []).map((entry) => entry.id),
    ["readme-start-path", "security-policy", "code-security"],
    "githubPublicReadinessBaseline"
  );
  for (const entry of contract.githubPublicReadinessBaseline || []) {
    ensureNonEmpty(entry.source, `${entry.id}.source`);
    ensureNonEmpty(entry.requirement, `${entry.id}.requirement`);
    ensureNonEmpty(entry.seisCheck, `${entry.id}.seisCheck`);
  }

  ensureArrayIncludesAll(contract.requiredFreshCloneCommands, [
    "npm run check:seis-ai-public-readiness",
    "npm run check:seis-ai-public-readiness-program",
    "npm run check:seis-ai-fresh-clone-readiness"
  ], "requiredFreshCloneCommands");

  ensureArrayIncludesAll(
    (contract.freshCloneAcceptanceGates || []).map((gate) => gate.id),
    [
      "install-and-no-key-start",
      "ai-readiness-validator",
      "security-and-secret-boundary",
      "public-claim-review",
      "release-and-rollback"
    ],
    "freshCloneAcceptanceGates"
  );
  for (const gate of contract.freshCloneAcceptanceGates || []) {
    ensure(Array.isArray(gate.requiredEvidence) && gate.requiredEvidence.length >= 2, `${gate.id}.requiredEvidence must be populated`);
    ensure(gate.blocksAgiClaim === true, `${gate.id}.blocksAgiClaim must stay true`);
  }
  ensure((contract.freshCloneAcceptanceGates || []).some((gate) => gate.id === "install-and-no-key-start" && gate.blocksGithubReadyForEveryone === true), "install gate must block everyone-ready");
  ensure((contract.freshCloneAcceptanceGates || []).some((gate) => gate.id === "ai-readiness-validator" && gate.status === "available"), "AI readiness validator gate must be available");
  ensure((contract.freshCloneAcceptanceGates || []).some((gate) => gate.id === "release-and-rollback" && gate.status === "approval-gated"), "release gate must be approval-gated");

  ensureArrayIncludesAll(contract.requiredBeforeFreshCloneVerified, [
    "fresh clone created from the target commit",
    "dependencies installed without secrets",
    "npm run check:seis-ai-public-readiness passes in the clone",
    "README Local Demo instructions reviewed",
    "SECURITY.md reviewed",
    "secret scan completed",
    "human reviewer records the target commit and environment"
  ], "requiredBeforeFreshCloneVerified");

  ensureArrayIncludesAll(contract.requiredBeforeGithubReadyForEveryone, [
    "freshCloneVerified is true",
    "all freshCloneAcceptanceGates are satisfied or explicitly approved",
    "all required CI checks green on the target commit",
    "human release approval recorded",
    "release notes and rollback plan accepted",
    "AGI and 512B claim boundaries preserved"
  ], "requiredBeforeGithubReadyForEveryone");

  ensureArrayIncludesAll(contract.forbiddenClaims, [
    "Fresh clone success proves AGI.",
    "Fresh clone success proves 512B inference.",
    "Local Demo is a trained 512B model.",
    "A passing readiness validator grants runtime authority.",
    "A public README can replace model cards, dataset cards, benchmark reports, or training logs."
  ], "forbiddenClaims");
}

ensure(publicProgram?.sourceOfTruth?.freshCloneReadiness === paths.contract, "AI public readiness program must reference fresh-clone readiness");
ensure(publicProgram?.githubReadyForEveryone === false, "AI public readiness program must not mark everyone-ready");
ensure(githubGates?.sourceOfTruth?.freshCloneReadiness === paths.contract, "GitHub user readiness gates must reference fresh-clone readiness");
ensure(githubGates?.githubReadyForEveryone === false, "GitHub user readiness gates must not mark everyone-ready");
ensure(publicEvidence?.publicReadyAsAgi === false, "AGI public readiness evidence must not allow AGI");
ensure(packageJson?.scripts?.["check:seis-ai-fresh-clone-readiness"] === "node scripts/check-seis-ai-fresh-clone-readiness.mjs", "package.json must expose check:seis-ai-fresh-clone-readiness");

for (const [text, label] of [
  [readme, "README"],
  [securityPolicy, "SECURITY policy"],
  [doc, "AI fresh-clone readiness docs"]
]) {
  ensure(text.includes("Local Demo"), `${label} must mention Local Demo`);
}

ensure(readme.includes("check:seis-ai-public-readiness"), "README must document the AI public readiness command");
ensure(doc.includes("seis-ai-fresh-clone-readiness"), "fresh-clone docs must reference the contract id");
ensure(doc.includes("seis://ai/fresh-clone-readiness.json"), "fresh-clone docs must reference the MCP resource URI");
ensure(doc.includes("npm run check:seis-ai-fresh-clone-readiness"), "fresh-clone docs must document its validator");

finish("SEIS AI fresh-clone readiness check passed.");

function ensureSource(contract, key, expected) {
  ensure(contract.sourceOfTruth?.[key] === expected, `sourceOfTruth.${key} mismatch`);
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!relativePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) failures.push(`${label} missing: ${relativePath}`);
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) ensure(values.has(item), `${label} missing ${item}`);
}

function ensureNonEmpty(value, label) {
  ensure(typeof value === "string" && value.trim().length > 0, `${label} must be a non-empty string`);
}

function readJson(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} unreadable: ${error.message}`);
    return "";
  }
}

function finish(successMessage) {
  if (failures.length > 0) {
    console.error("SEIS AI fresh-clone readiness check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(successMessage);
}
