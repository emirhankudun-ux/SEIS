#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const paths = {
  contract: "content/development/seis-full-usage-operating-mode.json",
  runbook: "reports/seis-ai-routing/full-usage-operating-mode.md",
  providerRegistry: "content/development/seis-ai-core-provider-registry.json",
  hermesProtocol: "content/development/seis-hermes-computer-use-protocol.json",
  aiCliStack: "docs/development/ai-cli-stack.md",
  index: "docs/INDEX.md",
  packageJson: "package.json",
};

for (const [label, relativePath] of Object.entries(paths)) ensureFile(abs(relativePath), label);

const contract = readJson(paths.contract, "full usage operating mode");
const providerRegistry = readJson(paths.providerRegistry, "provider registry");
const hermesProtocol = readJson(paths.hermesProtocol, "Hermes protocol");
const runbook = readText(paths.runbook, "full usage runbook");
const aiCliStack = readText(paths.aiCliStack, "AI CLI stack docs");
const index = readText(paths.index, "docs index");
const packageJson = readJson(paths.packageJson, "package.json");
const publicSafeTexts = [
  [JSON.stringify(contract ?? {}, null, 2), "full usage operating mode"],
  [runbook, "full usage runbook"],
  [aiCliStack, "AI CLI stack docs"],
  [index, "docs index"]
];
const forbiddenPublicPatterns = [
  [/\/Users\//, "local macOS user path"],
  [/Mobile Documents/, "local iCloud path detail"],
  [/(^|[\s"'])~\/[A-Za-z0-9._/-]+/m, "home-directory shorthand"],
  [/BEGIN [A-Z ]*PRIVATE KEY/, "private key block"],
  [/(?:^|[^A-Za-z])sk-(?:proj-|live-|test-|svcacct-|admin-|org-|user-)?[A-Za-z0-9_]{20,}/, "provider key-shaped value"],
  [/gh[pousr]_[A-Za-z0-9_]{20,}/, "GitHub token-shaped value"],
  [/AKIA[0-9A-Z]{16}/, "AWS access key-shaped value"]
];

if (contract) {
  ensure(contract.id === "seis-full-usage-operating-mode", "contract id mismatch");
  ensure(contract.status === "documented-operating-mode", "contract status mismatch");
  ensure(contract.qualityGate === "npm run check:seis-full-usage-operating-mode", "quality gate mismatch");
  ensure(contract.sourceOfTruth?.hermesProtocol === paths.hermesProtocol, "contract must point to Hermes protocol");
  ensure(contract.sourceOfTruth?.providerRegistry === paths.providerRegistry, "contract must point to provider registry");
  ensure(contract.sourceOfTruth?.runbook === paths.runbook, "contract must point to runbook");
  ensure(String(contract.purpose || "").includes("Design, Developer, DevOps, Coding, LLM, Software Engineering, and AI"), "purpose must name the operating domains");
  ensure(String(contract.truthBoundary || "").includes("Full usage means using every useful installed or approved helper"), "truth boundary must define full usage");
  ensure(String(contract.truthBoundary || "").includes("silent provider fallback"), "truth boundary must block silent provider fallback");

  ensureArrayIncludesAll((contract.repositoryScope || []).map((repo) => repo.id), [
    "seis-canonical",
    "eleni-neferi",
    "seis-ssh",
    "icloud-github-worktrees",
  ], "repositoryScope");
  ensureArrayIncludesAll((contract.repositoryScope || []).map((repo) => repo.workspaceRef), [
    "canonical-seis-checkout",
    "eleni-neferi-selected-repo",
    "seis-ssh-selected-repo",
    "adjacent-worktree-inventory",
  ], "repositoryScope.workspaceRef");
  ensureArrayIncludesAll((contract.operatingDomains || []).map((domain) => domain.id), [
    "design",
    "developer",
    "devops",
    "coding",
    "llm",
    "software-engineering",
    "ai",
  ], "operatingDomains");
  const requiredSubdomainsByDomain = {
    design: [
      "designops-artifact-lifecycle",
      "token-governance",
      "ai-experience-design",
      "devops-cloud-state-language",
      "visual-qa",
      "ux-research-content-ia"
    ],
    developer: [
      "per-task-helper-packets",
      "ci-runtime-depth",
      "dependency-governance",
      "agent-handoff"
    ],
    devops: [
      "sli-slo-alerting",
      "incident-response",
      "audit-log-contract",
      "iac-provisioning-governance",
      "release-promotion-matrix",
      "rto-rpo-restore-drills"
    ],
    coding: [
      "swift-package-models",
      "domain-fixture-loading",
      "static-checkers",
      "browser-smoke",
      "playwright-visual-baseline"
    ],
    llm: [
      "current-run-provider-readiness",
      "prompt-output-retention-policy",
      "routing-decision-ledger",
      "ollama-no-key-startup-proof",
      "redacted-output-ledgers"
    ],
    "software-engineering": [
      "quality-gates",
      "testing-strategy",
      "release-readiness",
      "technical-debt-register",
      "architecture-scorecard"
    ],
    ai: [
      "agent-swarm",
      "mcp-permissioning",
      "official-vendor-mcp-research",
      "provider-readiness-snapshots",
      "rate-limit-cost-incident-state",
      "safety-eval-evidence"
    ]
  };
  for (const domain of contract.operatingDomains || []) {
    ensure(Array.isArray(domain.subdomains) && domain.subdomains.length >= 8, `${domain.id} must define at least eight subdomains`);
    ensure(Array.isArray(domain.primaryEvidence) && domain.primaryEvidence.length >= 3, `${domain.id} must define primary evidence`);
    ensure(typeof domain.nextGap === "string" && domain.nextGap.length > 30, `${domain.id} must define a useful next gap`);
    ensureArrayIncludesAll(domain.subdomains, requiredSubdomainsByDomain[domain.id] || [], `${domain.id}.subdomains`);
  }
  ensureArrayIncludesAll((contract.domainGapBacklog || []).map((item) => item.id), [
    "design-domain-scorecard",
    "developer-helper-packet",
    "devops-observability-incident-contract",
    "devops-release-promotion-matrix",
    "llm-routing-decision-ledger",
    "ai-provider-readiness-snapshot",
    "software-engineering-scorecard",
  ], "domainGapBacklog");
  for (const item of contract.domainGapBacklog || []) {
    ensure(item.status === "planned", `${item.id} must remain planned until separately implemented`);
    ensure(String(item.artifact || "").startsWith("content/development/"), `${item.id} must define a future content/development artifact`);
    ensure(typeof item.purpose === "string" && item.purpose.length > 40, `${item.id} must describe its purpose`);
  }
  ensure(contract.fiveYearExecutionModel?.minimumHorizonYears === 5, "five-year execution model must keep a minimum five-year horizon");
  ensure(contract.fiveYearExecutionModel?.turnModel === "up-to-200-supervised-turns-with-repo-ledgers", "turn model must preserve 200 supervised turns with ledgers");
  ensure(
    contract.fiveYearExecutionModel?.remoteSyncPolicy?.includes("dry-run and explicit approval"),
    "remote sync policy must require dry-run and explicit approval"
  );
  ensureArrayIncludesAll(contract.defaultLoop, [
    "inspect-current-repo-truth",
    "select-one-work-item",
    "choose-helper-role-if-useful",
    "keep-codex-as-single-writer",
    "record-repo-only-ledger",
  ], "defaultLoop");
  ensureArrayIncludesAll((contract.helperRoles || []).map((role) => role.id), [
    "codex",
    "hermes",
    "eleni-neferi-oracle-layer",
    "local-ai-or-desktop-helper",
  ], "helperRoles");
  ensureArrayIncludesAll(contract.routingOrder, [
    "codex-single-writer",
    "adequate-local-provider",
    "owner-selected-provider",
    "capability-compatible-approved-cloud-provider",
    "repo-local-demo-or-deterministic-validator",
    "feature-disabled",
  ], "routingOrder");
  ensureArrayIncludesAll(contract.fallbackRules, [
    "Provider and model identity must be visible when a helper is used.",
    "Never pretend a fallback provider is the original provider.",
    "Deterministic validators outrank uncaptured model output.",
  ], "fallbackRules");
  ensure(contract.providerConnectionPolicy?.ownerReportedProvidersConnected === true, "provider connection policy must record owner-reported provider connection");
  ensure(contract.providerConnectionPolicy?.noCredentialReadByCodex === true, "provider connection policy must forbid Codex credential reads");
  ensureArrayIncludesAll(contract.providerConnectionPolicy?.notProofOf, [
    "credentialed",
    "quotaReady",
    "verified",
    "safe for private data",
    "approved for external mutation",
  ], "providerConnectionPolicy.notProofOf");
  ensureArrayIncludesAll(contract.providerConnectionPolicy?.requiredBeforeLiveUse, [
    "server-only credential boundary",
    "redacted provider identity",
    "quota or rate-limit state",
    "ownerApproved route scope",
    "captured output or deterministic validator",
    "repo-only ledger",
  ], "providerConnectionPolicy.requiredBeforeLiveUse");
  ensureArrayIncludesAll(contract.forbiddenActionsWithoutExplicitOwnerApproval, [
    "credential reads",
    "secret capture",
    "SSH execution",
    "deployment",
    "GitHub push or merge without dry-run and explicit approval",
    "external connector writes",
  ], "forbiddenActionsWithoutExplicitOwnerApproval");
  ensureArrayIncludesAll(contract.requiredLedgerFields, [
    "repoId",
    "workItemId",
    "selectedHelper",
    "visibleProviderOrModel",
    "outputVisible",
    "repoEvidenceUsed",
    "fallbackTriggered",
    "validationCommands",
  ], "requiredLedgerFields");
  ensureArrayIncludesAll((contract.verificationEvidence || []).map((entry) => entry.repoId), [
    "seis-canonical",
    "eleni-neferi",
    "seis-ssh",
  ], "verificationEvidence");
  const externalEvidence = (contract.verificationEvidence || []).filter((entry) => entry.repoId !== "seis-canonical");
  for (const entry of externalEvidence) {
    ensure(
      String(entry.latestObservedStatus || "").includes("not-current-run-verified"),
      `${entry.repoId} external evidence must not be claimed as current-run verified`
    );
  }
  ensureArrayIncludesAll(contract.completionDefinition, [
    "Every selected repo starts with a status/preflight read.",
    "Exactly one repo is selected for writes at a time.",
    "Codex remains the only writer unless a future explicit handoff exists.",
    "No model output is used as evidence unless captured and recorded.",
    "Owner-reported provider connection is recorded separately from verified provider readiness.",
  ], "completionDefinition");
}

ensure(providerRegistry?.routingPriority?.mode === "local-first-when-adequate", "provider registry must remain local-first");
ensure(hermesProtocol?.id === "seis-hermes-computer-use-protocol", "Hermes protocol id mismatch");

for (const token of [
  "Eleni-Neferi",
  "SEIS-ssh",
  "Codex single writer",
  "Design",
  "Developer",
  "DevOps",
  "Coding",
  "LLM",
  "Software Engineering",
  "AI",
  "No invisible model output is repository evidence.",
  "Owner-reported provider connection",
  "Rate Limited",
  "dry-run",
]) {
  ensure(runbook.includes(token), `runbook missing ${token}`);
}

for (const token of [
  "seis-full-usage-operating-mode.json",
  "full-usage-operating-mode.md",
]) {
  ensure(index.includes(token), `docs index missing ${token}`);
}

ensure(aiCliStack.includes("seis-full-usage-operating-mode.json"), "AI CLI stack must mention full usage operating mode");

for (const [text, label] of publicSafeTexts) {
  for (const [pattern, description] of forbiddenPublicPatterns) {
    ensure(!pattern.test(text), `${label} must not include ${description}`);
  }
}

if (packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-full-usage-operating-mode"] === "node scripts/check-seis-full-usage-operating-mode.mjs",
    "package.json must expose check:seis-full-usage-operating-mode"
  );
  ensure(
    String(packageJson.scripts?.["quality:governance"] || "").includes("npm run check:seis-full-usage-operating-mode"),
    "quality:governance must include check:seis-full-usage-operating-mode"
  );
}

if (failures.length) {
  console.error("SEIS full usage operating mode check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS full usage operating mode check passed.");

function abs(relativePath) {
  return path.join(root, ...relativePath.split("/"));
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(filePath)) failures.push(`${label} missing: ${path.relative(root, filePath)}`);
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) ensure(values.has(item), `${label} missing ${item}`);
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
