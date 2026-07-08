#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = parseArgs(process.argv.slice(2));
const shouldWrite = Boolean(args.write);
const shouldCheck = Boolean(args.check);

const paths = {
  secondBrain: "content/development/seis-second-brain-system.json",
  releaseChecklist: "content/development/seis-public-demo-release-checklist-pr54.json",
  securityGate: "reports/seis-public-demo/security-gate-redacted-latest.json",
  agentRegistry: "reports/seis-public-demo/second-brain-agent-registry-latest.json",
  outputJson:
    typeof args.output === "string"
      ? args.output
      : "reports/seis-public-demo/second-brain-public-reviewer-pack-latest.json",
  outputMarkdown:
    typeof args.markdown === "string"
      ? args.markdown
      : "reports/seis-public-demo/second-brain-public-reviewer-pack-latest.md"
};

const failures = [];
const secondBrain = readRequiredJson(paths.secondBrain, "Second Brain contract");
const releaseChecklist = readRequiredJson(paths.releaseChecklist, "public demo release checklist");
const securityGate = readRequiredJson(paths.securityGate, "redacted security gate artifact");
const agentRegistry = readRequiredJson(paths.agentRegistry, "Second Brain agent registry artifact");
const report = buildReport(new Date().toISOString());

validateSourceArtifacts();
validateReport(report, "generated public reviewer pack");

if (shouldWrite) {
  writeJson(paths.outputJson, report);
  writeText(paths.outputMarkdown, renderMarkdown(report));
}

if (shouldCheck) {
  ensureFile(paths.outputJson, "Second Brain public reviewer JSON artifact");
  ensureFile(paths.outputMarkdown, "Second Brain public reviewer Markdown artifact");
  const existingJson = readJson(paths.outputJson, "Second Brain public reviewer JSON artifact");
  const existingMarkdown = readText(paths.outputMarkdown, "Second Brain public reviewer Markdown artifact");
  if (existingJson) validateReport(existingJson, "existing public reviewer pack");
  for (const phrase of [
    "SEIS Second Brain Public Reviewer Pack",
    "NO-GO-review-pack-does-not-approve-release",
    "No API keys required",
    "No private Obsidian vault import",
    "No live provider routing",
    "Security history blocker remains"
  ]) {
    ensure(existingMarkdown.includes(phrase), `Markdown artifact missing phrase: ${phrase}.`);
  }
}

if (failures.length > 0) {
  console.error("SEIS Second Brain public reviewer pack check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (shouldWrite) {
  console.log(`Wrote ${paths.outputJson}`);
  console.log(`Wrote ${paths.outputMarkdown}`);
} else if (shouldCheck) {
  console.log("SEIS Second Brain public reviewer pack check passed.");
} else {
  console.log(JSON.stringify(report, null, 2));
}

function buildReport(generatedAt) {
  return {
    id: "seis-second-brain-public-reviewer-pack-pr104",
    title: "SEIS Second Brain Public Reviewer Pack",
    generatedAt,
    status: "reviewer-ready-no-key-local-demo",
    mode: "github-public-review-no-private-data",
    decision: "NO-GO-review-pack-does-not-approve-release",
    pullRequest: {
      number: 104,
      url: "https://github.com/emirhankudun-ux/SEIS/pull/104",
      branch: "codex/second-brain-readiness-agent-registry-20260701",
      base: "main"
    },
    sourcePaths: {
      secondBrain: paths.secondBrain,
      releaseChecklist: paths.releaseChecklist,
      securityGate: paths.securityGate,
      agentRegistry: paths.agentRegistry
    },
    reviewerAudience: [
      "GitHub reviewer",
      "new contributor",
      "maintainer release reviewer",
      "accessibility reviewer",
      "security reviewer"
    ],
    noKeyLocalDemoContract: {
      requiresApiKeys: false,
      requiresProviderLogin: false,
      requiresPrivateObsidianVault: false,
      requiresSsh: false,
      requiresDeployment: false,
      browserLocalDemoOnly: true,
      secondBrainStatus: secondBrain?.status || "local-demo",
      agentRegistryStatus: agentRegistry?.status || "review-only-agent-registry",
      securityGateDecision: securityGate?.decision || "NO-GO-security-history-remediation-needed"
    },
    quickStart: [
      {
        step: "Install dependencies already expected by the repository.",
        command: "npm install",
        approval: "Only needed if dependencies are missing in a fresh clone."
      },
      {
        step: "Validate the Second Brain readiness contracts.",
        command: "npm run check:seis-second-brain-readiness-contracts",
        approval: "No special approval required."
      },
      {
        step: "Validate the no-key public reviewer pack.",
        command: "npm run check:seis-second-brain-public-reviewer-pack",
        approval: "No special approval required."
      },
      {
        step: "Run the public demo go/no-go classifier.",
        command: "npm run check:seis-public-demo-go-no-go -- --run-fast-checks",
        approval: "No special approval required; expected decision remains NO-GO until gates clear."
      },
      {
        step: "Open the local browser demo route.",
        command: "cd apps/web && python3 -m http.server 50951 --bind 127.0.0.1",
        approval: "No live provider, SSH, or deployment approval is implied."
      }
    ],
    reviewSurfaces: [
      "apps/web/desktop.html",
      "docs/product/seis-second-brain.md",
      "reports/seis-public-demo/second-brain-agent-registry-latest.md",
      "reports/seis-public-demo/obsidian-safe-import-dry-run-latest.md",
      "reports/seis-public-demo/read-only-model-router-decision-latest.md",
      "reports/seis-public-demo/security-gate-redacted-latest.md",
      "reports/seis-public-demo/go-no-go-latest.md",
      "reports/seis-public-demo/evidence-manifest-latest.json"
    ],
    reviewerMustConfirm: [
      "No API keys required for the core demo.",
      "No private Obsidian vault import was performed.",
      "No live provider routing was performed.",
      "Autonomous agent writes remain disabled.",
      "Security history blocker remains until owner-approved remediation.",
      "Browser-smoke evidence and human release approval are still required before public release."
    ],
    blockedUntilApproval: [
      "private Obsidian import",
      "live provider routing",
      "autonomous write execution",
      "SSH execution",
      "deployment",
      "GitHub Pages publication",
      "merge to main",
      "release tag",
      "history rewrite or reviewed security baseline"
    ],
    releaseChecklistSnapshot: {
      status: releaseChecklist?.status || "review-gated-not-released",
      releaseDecision: releaseChecklist?.releaseDecision || "not ready until checklist gates pass",
      requiredValidationCount: releaseChecklist?.requiredValidation?.length || 0,
      requiredArtifactCount: releaseChecklist?.requiredArtifacts?.length || 0
    },
    safetyBoundary: {
      privateObsidianVaultReadPerformed: false,
      privateNoteBodyCopied: false,
      providerCallsPerformed: false,
      credentialValidationPerformed: false,
      browserSecretsExposed: false,
      promptBodiesStored: false,
      autonomousWriteExecutionPerformed: false,
      externalConnectorMutationPerformed: false,
      sshExecuted: false,
      deploymentPerformed: false,
      githubMutationPerformedByReport: false,
      releaseApprovalGranted: false
    }
  };
}

function validateReport(value, label) {
  ensure(value?.id === "seis-second-brain-public-reviewer-pack-pr104", `${label} id mismatch.`);
  ensure(value?.status === "reviewer-ready-no-key-local-demo", `${label} status mismatch.`);
  ensure(value?.mode === "github-public-review-no-private-data", `${label} mode mismatch.`);
  ensure(value?.decision === "NO-GO-review-pack-does-not-approve-release", `${label} decision mismatch.`);
  ensure(value?.pullRequest?.number === 104, `${label} must bind PR #104.`);
  ensure(value?.noKeyLocalDemoContract?.requiresApiKeys === false, `${label} must not require API keys.`);
  ensure(value?.noKeyLocalDemoContract?.requiresProviderLogin === false, `${label} must not require provider login.`);
  ensure(value?.noKeyLocalDemoContract?.requiresPrivateObsidianVault === false, `${label} must not require private Obsidian.`);
  ensure(value?.noKeyLocalDemoContract?.requiresSsh === false, `${label} must not require SSH.`);
  ensure(value?.noKeyLocalDemoContract?.requiresDeployment === false, `${label} must not require deployment.`);
  ensure(value?.noKeyLocalDemoContract?.browserLocalDemoOnly === true, `${label} must stay browser-local.`);
  ensure(value?.noKeyLocalDemoContract?.secondBrainStatus === "local-demo", `${label} must bind the live Second Brain source status.`);
  ensure(value?.noKeyLocalDemoContract?.agentRegistryStatus === "review-only-agent-registry", `${label} must bind the live agent registry source status.`);
  ensure(
    value?.noKeyLocalDemoContract?.securityGateDecision === "NO-GO-security-history-remediation-needed",
    `${label} must bind the live security gate decision.`
  );
  ensure(value?.releaseChecklistSnapshot?.status === "review-gated-not-released", `${label} must bind release checklist status.`);
  ensure((value?.releaseChecklistSnapshot?.requiredValidationCount || 0) >= 1, `${label} must bind release checklist validations.`);
  ensure((value?.releaseChecklistSnapshot?.requiredArtifactCount || 0) >= 1, `${label} must bind release checklist artifacts.`);
  ensureArrayMin(value?.quickStart, 5, `${label} quickStart`);
  ensureArrayMin(value?.reviewSurfaces, 8, `${label} review surfaces`);
  ensureArrayMin(value?.reviewerMustConfirm, 6, `${label} reviewer confirmations`);
  ensureArrayMin(value?.blockedUntilApproval, 8, `${label} approval blockers`);
  for (const required of [
    "No API keys required for the core demo.",
    "No private Obsidian vault import was performed.",
    "No live provider routing was performed.",
    "Security history blocker remains until owner-approved remediation."
  ]) {
    ensureIncludes(value?.reviewerMustConfirm, required, `${label} reviewer confirmations`);
  }
  for (const blocked of [
    "private Obsidian import",
    "live provider routing",
    "autonomous write execution",
    "SSH execution",
    "deployment",
    "merge to main",
    "history rewrite or reviewed security baseline"
  ]) {
    ensureIncludes(value?.blockedUntilApproval, blocked, `${label} approval blockers`);
  }
  for (const [key, expected] of [
    ["privateObsidianVaultReadPerformed", false],
    ["privateNoteBodyCopied", false],
    ["providerCallsPerformed", false],
    ["credentialValidationPerformed", false],
    ["browserSecretsExposed", false],
    ["promptBodiesStored", false],
    ["autonomousWriteExecutionPerformed", false],
    ["externalConnectorMutationPerformed", false],
    ["sshExecuted", false],
    ["deploymentPerformed", false],
    ["githubMutationPerformedByReport", false],
    ["releaseApprovalGranted", false]
  ]) {
    ensure(value?.safetyBoundary?.[key] === expected, `${label} safety boundary ${key} must be ${expected}.`);
  }
  const serialized = JSON.stringify(value);
  ensure(!serialized.includes("file://"), `${label} must not include file:// paths.`);
  ensure(!serialized.includes("/Users/"), `${label} must not include private absolute paths.`);
  validateNoCredentialPatterns(serialized, label);
}

function renderMarkdown(value) {
  const quickStart = value.quickStart
    .map((item) => `- ${item.step}\n  Command: \`${item.command}\`\n  Approval: ${item.approval}`)
    .join("\n");
  const surfaces = value.reviewSurfaces.map((item) => `- \`${item}\``).join("\n");
  const confirmations = value.reviewerMustConfirm.map((item) => `- ${item}`).join("\n");
  const blocked = value.blockedUntilApproval.map((item) => `- ${item}`).join("\n");

  return `# SEIS Second Brain Public Reviewer Pack

Generated: ${value.generatedAt}
Status: ${value.status}
Mode: ${value.mode}
Decision: ${value.decision}
PR: ${value.pullRequest.url}

This pack helps GitHub reviewers inspect the Second Brain slice without private
data, provider keys, SSH, deployment, or release authority.

## No-Key Contract

- No API keys required: ${!value.noKeyLocalDemoContract.requiresApiKeys}
- No private Obsidian vault import: ${!value.noKeyLocalDemoContract.requiresPrivateObsidianVault}
- No live provider routing: ${!value.noKeyLocalDemoContract.requiresProviderLogin}
- Browser-local demo only: ${value.noKeyLocalDemoContract.browserLocalDemoOnly}
- Security history blocker remains: ${value.noKeyLocalDemoContract.securityGateDecision}

## Quick Start

${quickStart}

## Review Surfaces

${surfaces}

## Reviewer Must Confirm

${confirmations}

## Blocked Until Approval

${blocked}
`.trimEnd() + "\n";
}

function parseArgs(values) {
  return values.reduce((acc, value, index) => {
    if (!value.startsWith("--")) return acc;
    const key = value.slice(2);
    const next = values[index + 1];
    acc[key] = next && !next.startsWith("--") ? next : true;
    return acc;
  }, {});
}

function writeJson(targetPath, value) {
  const absolutePath = safeOutputPath(targetPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(targetPath, value) {
  const absolutePath = safeOutputPath(targetPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}

function safeOutputPath(targetPath) {
  const absolutePath = path.resolve(root, targetPath);
  const relativePath = path.relative(root, absolutePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    failures.push(`refusing to write outside repository: ${targetPath}`);
    return path.join(root, "reports", "seis-public-demo", "second-brain-public-reviewer-pack-refused-output.json");
  }
  return absolutePath;
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(path.join(root, filePath))) failures.push(`missing ${label}: ${filePath}`);
}

function readText(filePath, label) {
  const absolutePath = path.join(root, filePath);
  if (!fs.existsSync(absolutePath)) return "";
  try {
    return fs.readFileSync(absolutePath, "utf8");
  } catch (error) {
    failures.push(`unable to read ${label}: ${error.message}`);
    return "";
  }
}

function readJson(filePath, label) {
  const text = readText(filePath, label);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`${label} is not valid JSON: ${error.message}`);
    return null;
  }
}

function readRequiredJson(filePath, label) {
  const absolutePath = path.join(root, filePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing required source artifact ${label}: ${filePath}`);
    return null;
  }
  return readJson(filePath, label);
}

function validateSourceArtifacts() {
  ensure(secondBrain?.status === "local-demo", "Second Brain source contract must be present and local-demo.");
  ensure(releaseChecklist?.status === "review-gated-not-released", "release checklist source must be present and review-gated.");
  ensure(
    securityGate?.decision === "NO-GO-security-history-remediation-needed",
    "security gate source decision must be present and NO-GO."
  );
  ensure(
    agentRegistry?.decision === "NO-GO-autonomous-execution-not-approved",
    "agent registry source decision must be present and NO-GO."
  );
  ensure(
    agentRegistry?.summary?.installedAiProfileCount === (secondBrain?.installedAiProfiles || []).length,
    "agent registry installed AI count must match the Second Brain source contract."
  );
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureArrayMin(value, minimum, label) {
  ensure(Array.isArray(value), `${label} must be an array.`);
  ensure(Array.isArray(value) && value.length >= minimum, `${label} must include at least ${minimum} records.`);
}

function ensureIncludes(values, expected, label) {
  ensure(Array.isArray(values), `${label} must be an array.`);
  ensure(Array.isArray(values) && values.includes(expected), `${label} missing ${expected}.`);
}

function validateNoCredentialPatterns(text, label) {
  const patterns = [
    [/sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API key"],
    [/-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private key block"],
    [/\b(?:password|token|secret|api[_-]?key)\s*=\s*['"][^'"]+['"]/i, "inline credential assignment"]
  ];
  for (const [pattern, description] of patterns) {
    ensure(!pattern.test(text), `${label} contains ${description}.`);
  }
}
