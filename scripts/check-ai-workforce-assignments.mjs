#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const contractPath = path.join(root, "content", "development", "ai-workforce-assignments.json");
const secondBrainPath = path.join(root, "content", "development", "seis-second-brain-system.json");
const docsPath = path.join(root, "docs", "development", "agents", "ai-workforce-assignments.md");
const requiredAssignments = [
  "codex",
  "claude",
  "qwen",
  "gemini",
  "coderabbit",
  "ollama",
  "open-design",
  "github-actions",
  "kimi",
  "opencode"
];
const requiredWorkflowSteps = [
  "intake",
  "architecture_review",
  "contradiction_review",
  "public_readiness_review",
  "design_review",
  "private_draft_review",
  "implementation",
  "ci_validation",
  "pr_review",
  "repair_and_handoff"
];
const forbiddenApprovalGates = [
  "merge",
  "deployment",
  "secret rotation",
  "SSH command execution",
  "model training",
  "dataset download"
];

ensureFile(contractPath, "AI workforce assignment contract");
ensureFile(secondBrainPath, "Second Brain contract");
ensureFile(docsPath, "AI workforce assignment docs");

const contract = readJson(contractPath, "AI workforce assignment contract");
const secondBrain = readJson(secondBrainPath, "Second Brain contract");
const docs = readText(docsPath, "AI workforce assignment docs");

if (contract) {
  ensure(contract.id === "seis-ai-workforce-assignments", "contract id must be seis-ai-workforce-assignments");
  ensure(contract.status === "documented", "contract status must be documented");
  ensure(
    contract.qualityGate === "node scripts/check-ai-workforce-assignments.mjs",
    "contract qualityGate must point to this validator"
  );
  ensure(contract.writerPolicy?.primaryWriter === "codex", "Codex must remain the primary writer");
  ensure(
    String(contract.writerPolicy?.rule || "").includes("Exactly one assistant"),
    "writer policy must require exactly one writer"
  );
  ensure(
    String(contract.credentialBoundary?.rule || "").includes("never copied"),
    "credential boundary must forbid copying keys into artifacts"
  );
  ensure(
    Array.isArray(contract.credentialBoundary?.forbiddenStorage) &&
      contract.credentialBoundary.forbiddenStorage.includes("browser storage") === false,
    "credential boundary must use explicit storage surfaces rather than vague browser storage"
  );
  for (const surface of ["repository files", "IndexedDB", "localStorage", "agent memory", "prompt transcripts"]) {
    ensure(
      contract.credentialBoundary?.forbiddenStorage?.includes(surface),
      `credential boundary missing forbidden storage surface: ${surface}`
    );
  }
  ensure(Array.isArray(contract.safetyRules) && contract.safetyRules.length >= 8, "contract must include at least eight safety rules");
  for (const phrase of ["Codex remains final", "No assistant receives secrets", "AI-generated output is untrusted", "Fallback model identity"]) {
    ensure(
      contract.safetyRules.some((rule) => String(rule).includes(phrase)),
      `safety rules missing phrase: ${phrase}`
    );
  }

  ensure(Array.isArray(contract.workflow), "contract.workflow must be an array");
  const workflowSteps = new Set((contract.workflow || []).map((step) => step.step));
  for (const step of requiredWorkflowSteps) {
    ensure(workflowSteps.has(step), `workflow step missing: ${step}`);
  }

  ensure(Array.isArray(contract.assignments), "contract.assignments must be an array");
  const assignments = new Map((contract.assignments || []).map((assignment) => [assignment.id, assignment]));
  const assignmentsByRoute = new Map((contract.assignments || []).map((assignment) => [assignment.route, assignment]));
  const secondBrainProfiles = new Set(secondBrain?.installedAiProfiles || []);
  for (const assignmentId of requiredAssignments) {
    const assignment = assignments.get(assignmentId);
    ensure(Boolean(assignment), `assignment missing: ${assignmentId}`);
    if (!assignment) continue;
    ensureNonEmptyString(assignment.displayName, `${assignmentId}.displayName`);
    ensureNonEmptyString(assignment.route, `${assignmentId}.route`);
    ensureNonEmptyString(assignment.launcherStatus, `${assignmentId}.launcherStatus`);
    ensureNonEmptyString(assignment.category, `${assignmentId}.category`);
    ensureArrayWithMinimum(assignment.coreDuties, 2, `${assignmentId}.coreDuties`);
    ensureArrayWithMinimum(assignment.allowedOutputs, 1, `${assignmentId}.allowedOutputs`);
    ensureArrayWithMinimum(assignment.deniedActions, 2, `${assignmentId}.deniedActions`);
    ensureNonEmptyString(assignment.validationDuty, `${assignmentId}.validationDuty`);
  }

  ensure(assignments.get("codex")?.category === "primary-writer", "Codex assignment must be primary-writer");
  ensure(
    (assignments.get("claude")?.deniedActions || []).some((action) => String(action).includes("direct repository writes")),
    "Claude must be denied direct repository writes by default"
  );
  ensure(
    (assignments.get("ollama")?.coreDuties || []).some((duty) => String(duty).includes("offline")),
    "Ollama assignment must cover offline analysis"
  );
  ensure(
    (assignments.get("github-actions")?.deniedActions || []).some((action) => String(action).includes("secret echoing")),
    "GitHub Actions assignment must forbid secret echoing"
  );

  ensure(contract.currentLauncherEvidence?.command === "npm run ai -- list", "launcher evidence must point to npm run ai -- list");
  ensure(contract.currentLauncherEvidence?.mode === "local route readiness only", "launcher evidence must stay local route readiness only");
  ensureArrayWithMinimum(contract.currentLauncherEvidence?.tools, 18, "currentLauncherEvidence.tools");
  const installedTools = (contract.currentLauncherEvidence?.tools || []).filter((tool) => tool.launcherStatus === "installed");
  ensure(installedTools.length >= 12, "launcher evidence must include at least twelve installed local routes");

  for (const tool of contract.currentLauncherEvidence?.tools || []) {
    ensureNonEmptyString(tool.route, "currentLauncherEvidence.tools[].route");
    ensureNonEmptyString(tool.launcherStatus, `${tool.route}.launcherStatus`);
    if (!tool.registryRequired) continue;

    const assignment = assignmentsByRoute.get(tool.route);
    ensure(Boolean(assignment), `launcher route ${tool.route} missing workforce assignment`);
    ensure(
      assignment?.launcherStatus === tool.launcherStatus,
      `launcher route ${tool.route} status mismatch between launcher evidence and workforce assignment`
    );
    ensureNonEmptyString(tool.secondBrainProfileId, `${tool.route}.secondBrainProfileId`);
    ensure(
      secondBrainProfiles.has(tool.secondBrainProfileId),
      `launcher route ${tool.route} missing Second Brain profile ${tool.secondBrainProfileId}`
    );
  }

  ensure(Array.isArray(contract.approvalRequiredFor), "approvalRequiredFor must be an array");
  for (const gate of forbiddenApprovalGates) {
    ensure(contract.approvalRequiredFor.includes(gate), `approval gate missing: ${gate}`);
  }
}

if (docs) {
  for (const phrase of [
    "Codex is the primary writer",
    "Exactly one assistant",
    "API keys may exist",
    "Claude",
    "Qwen",
    "Gemini",
    "CodeRabbit",
    "Ollama",
    "OpenDesign",
    "GitHub Actions",
    "Kimi",
    "OpenCode",
    "node scripts/check-ai-workforce-assignments.mjs"
  ]) {
    ensure(docs.includes(phrase), `docs missing phrase: ${phrase}`);
  }
}

finish("SEIS AI workforce assignment check passed.");

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    failures.push(`${label} missing: ${path.relative(root, filePath)}`);
  }
}

function readJson(filePath, label) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(filePath, label) {
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} could not be read: ${error.message}`);
    return "";
  }
}

function ensureNonEmptyString(candidate, label) {
  ensure(typeof candidate === "string" && candidate.trim().length > 0, `${label} must be a non-empty string`);
}

function ensureArrayWithMinimum(candidate, minimum, label) {
  ensure(Array.isArray(candidate) && candidate.length >= minimum, `${label} must include at least ${minimum} entries`);
}

function finish(successMessage) {
  if (failures.length > 0) {
    console.error("SEIS AI workforce assignment check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(successMessage);
}
