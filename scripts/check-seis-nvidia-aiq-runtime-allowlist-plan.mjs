#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const files = {
  plan: "content/development/seis-nvidia-aiq-runtime-allowlist-plan.json",
  installed: "content/development/seis-nvidia-installed-integrations.json",
  catalog: "content/development/seis-nvidia-accelerator-catalog.json",
  doc: "docs/ai/nvidia-aiq-runtime-allowlist-plan.md",
  review: "docs/reviews/NVIDIA_AIQ_RUNTIME_ALLOWLIST_REVIEW.md",
  index: "docs/INDEX.md",
  masterIndex: "docs/SEIS_MASTER_INDEX.md",
  status: "docs/STATUS.md",
  backlog: "docs/roadmap/MASTER_BACKLOG.md",
  nextQueue: "docs/roadmap/NEXT_PR_QUEUE.md",
  desktop: "apps/web/desktop.js",
  packageJson: "package.json"
};

for (const [label, relativePath] of Object.entries(files)) ensureFile(relativePath, label);

const plan = readJson(files.plan, "AI-Q runtime allowlist plan");
const installed = readJson(files.installed, "NVIDIA installed integrations registry");
const catalog = readJson(files.catalog, "NVIDIA accelerator catalog");
const doc = readText(files.doc, "AI-Q runtime allowlist docs");
const review = readText(files.review, "AI-Q runtime allowlist review");
const index = readText(files.index, "docs index");
const masterIndex = readText(files.masterIndex, "SEIS master index");
const status = readText(files.status, "status doc");
const backlog = readText(files.backlog, "master backlog");
const nextQueue = readText(files.nextQueue, "next PR queue");
const desktop = readText(files.desktop, "Desktop runtime");
const packageJson = readJson(files.packageJson, "package.json");

if (plan) {
  ensure(plan.id === "seis-nvidia-aiq-runtime-allowlist-plan", "plan id mismatch");
  ensure(plan.status === "planned-approval-gated-no-runtime-execution", "plan status mismatch");
  ensure(plan.qualityGate === "npm run check:seis-nvidia-aiq-runtime-allowlist-plan", "quality gate mismatch");
  ensure(plan.sourceRecords?.acceleratorCatalog === files.catalog, "plan must link accelerator catalog");
  ensure(plan.sourceRecords?.installedIntegrations === files.installed, "plan must link installed integrations");
  ensure(plan.sourceRecords?.primaryDoc === files.doc, "plan must link AI-Q doc");
  ensure(plan.sourceRecords?.reviewDoc === files.review, "plan must link review doc");
  ensureArrayIncludesAll(plan.sourceSkills?.map((skill) => skill.id), ["aiq-deploy", "aiq-research"], "sourceSkills");
  ensure(plan.runtimeCandidate?.lane === "NVIDIA AI-Q", "runtime lane mismatch");
  ensure(plan.runtimeCandidate?.defaultServerUrl === "http://localhost:8000", "default AI-Q URL mismatch");
  ensure(String(plan.runtimeCandidate?.credentialModel || "").includes("outside chat"), "credential model must keep secrets outside chat");
  for (const flag of [
    "repoCloneAllowed",
    "networkInstallAllowed",
    "envFileWriteAllowed",
    "secretReadAllowed",
    "dockerAllowed",
    "kubernetesAllowed",
    "helmAllowed",
    "nodeServiceAllowed",
    "pythonServiceAllowed",
    "portBindAllowed",
    "aiqEndpointCallAllowed",
    "researchQueryAllowed",
    "nonLocalBackendAllowed",
    "gpuRuntimeAllowed",
    "sshAllowed",
    "githubWriteAllowed",
    "deploymentAllowed"
  ]) {
    ensure(plan.currentAuthority?.[flag] === false, `currentAuthority.${flag} must remain false`);
  }
  ensure(plan.currentAuthority?.metadataAndDocsAllowed === true, "metadata and docs must be allowed");
  ensure(plan.currentAuthority?.desktopUiAllowed === true, "Desktop UI must be allowed");
  ensure(plan.currentAuthority?.localValidatorAllowed === true, "local validator must be allowed");
  ensure(Array.isArray(plan.approvalChecklist) && plan.approvalChecklist.length >= 10, "approval checklist is too small");
  ensure(Array.isArray(plan.plannedRuntimePhases) && plan.plannedRuntimePhases.length >= 7, "runtime phases are missing");
  ensure(plan.plannedRuntimePhases[0]?.status === "complete", "phase 0 must remain complete metadata state");
  for (const phase of plan.plannedRuntimePhases.slice(1)) {
    ensure(phase.allowedNow === false, `${phase.id} must not be allowed now`);
    ensure(phase.approvalRequired === true, `${phase.id} must require approval`);
  }
  ensureArrayIncludesAll(plan.blockedActions, [
    "Clone or update https://github.com/NVIDIA-AI-Blueprints/aiq without approval.",
    "Create or modify deploy/.env without approval and ignore-rule proof.",
    "Start Docker Compose, local Python, local Node, Helm, Kubernetes, PostgreSQL, or GPU-backed services.",
    "Call AI-Q health, chat, async-agent, polling, or report endpoints before a runtime window is approved."
  ], "blockedActions");
  ensureArrayIncludesAll(plan.safeCurrentCommands, [
    "npm run check:seis-nvidia-aiq-runtime-allowlist-plan",
    "npm run check:seis-nvidia-installed-integrations",
    "npm run check:seis-nvidia-accelerator-catalog",
    "npm run plan:nvidia-catalog-install"
  ], "safeCurrentCommands");
  ensure(plan.runtimeValidationPlan?.notRunYet === true, "runtime validation must remain notRunYet");
  ensure(plan.desktopSurface?.appId === "nvidia-catalog", "Desktop surface must stay NVIDIA Catalog");
}

if (installed) {
  ensure(
    installed.documentation?.aiqRuntimeAllowlistPlan === files.plan,
    "installed integrations registry must link AI-Q runtime allowlist plan"
  );
  ensure((installed.safeCurrentCommands || []).includes("npm run check:seis-nvidia-aiq-runtime-allowlist-plan"), "installed registry must list the AI-Q plan check");
}

if (catalog) {
  ensure(catalog.installedIntegrationsRegistry === files.installed, "catalog must still link installed integrations");
}

for (const token of [
  "NVIDIA AI-Q Runtime Allowlist Plan",
  "Planned/Gated",
  "No AI-Q runtime has been started",
  "http://localhost:8000",
  "npm run check:seis-nvidia-aiq-runtime-allowlist-plan",
  "Runtime validation has not been run"
]) {
  ensure(doc.includes(token), `AI-Q docs missing ${token}`);
}

for (const token of [
  "NVIDIA AI-Q Runtime Allowlist Review",
  "PR queue item: `1D.1`",
  "SEIS-BL-052",
  "What Is Not Real Yet",
  "No Docker, Python service, Node service, Kubernetes",
  "Ready for internal review"
]) {
  ensure(review.includes(token), `AI-Q review missing ${token}`);
}

for (const [label, text] of [
  ["docs index", index],
  ["SEIS master index", masterIndex],
  ["status doc", status],
  ["master backlog", backlog],
  ["next PR queue", nextQueue]
]) {
  ensure(text.includes("NVIDIA AI-Q runtime allowlist"), `${label} missing NVIDIA AI-Q runtime allowlist`);
  ensure(text.includes("seis-nvidia-aiq-runtime-allowlist-plan"), `${label} missing AI-Q plan record token`);
}

for (const token of [
  "aiqRuntimeAllowlistPlan",
  "NVIDIA AI-Q Runtime Allowlist",
  "metadata-only-no-runtime",
  "check:seis-nvidia-aiq-runtime-allowlist-plan",
  "AI-Q runtime plan",
  "renderNvidiaCatalog"
]) {
  ensure(desktop.includes(token), `Desktop missing ${token}`);
}

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-nvidia-aiq-runtime-allowlist-plan"] === "node scripts/check-seis-nvidia-aiq-runtime-allowlist-plan.mjs",
    "package.json must expose check:seis-nvidia-aiq-runtime-allowlist-plan"
  );
}

const secretAssignmentPattern = /(NVIDIA_API_KEY|TAVILY_API_KEY|SERPER_API_KEY|EXA_API_KEY|AIQ_SERVER_URL)\s*=\s*["']?[A-Za-z0-9_./:-]{8,}/;
for (const [label, text] of [
  ["plan", JSON.stringify(plan || {})],
  ["doc", doc],
  ["review", review]
]) {
  ensure(!secretAssignmentPattern.test(text), `${label} appears to contain a concrete provider value`);
}

finish();

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) failures.push(`${label} missing: ${relativePath}`);
}

function readJson(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`${label} could not be read: ${error.message}`);
    return "";
  }
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) ensure(values.has(item), `${label} missing ${item}`);
}

function finish() {
  if (failures.length > 0) {
    console.error("SEIS NVIDIA AI-Q runtime allowlist plan check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log("SEIS NVIDIA AI-Q runtime allowlist plan check passed.");
}
