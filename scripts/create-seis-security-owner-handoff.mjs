#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = parseArgs(process.argv.slice(2));
const shouldWrite = Boolean(args.write);
const shouldCheck = Boolean(args.check);

const paths = {
  securityGateJson: "reports/seis-public-demo/security-gate-redacted-latest.json",
  securityGateMarkdown: "reports/seis-public-demo/security-gate-redacted-latest.md",
  agentRegistryJson: "reports/seis-public-demo/second-brain-agent-registry-latest.json",
  publicReviewerPackJson: "reports/seis-public-demo/second-brain-public-reviewer-pack-latest.json",
  nextQueue: "docs/roadmap/NEXT_PR_QUEUE.md",
  releaseDoc: "docs/releases/PUBLIC_DEMO_RELEASE_CHECKLIST_PR54.md",
  outputJson:
    typeof args.output === "string"
      ? args.output
      : "reports/seis-public-demo/security-owner-handoff-latest.json",
  outputMarkdown:
    typeof args.markdown === "string"
      ? args.markdown
      : "reports/seis-public-demo/security-owner-handoff-latest.md"
};

const failures = [];

const securityGate = readJson(paths.securityGateJson, "security gate redacted artifact");
const agentRegistry = readJson(paths.agentRegistryJson, "Second Brain agent registry artifact");
const publicReviewerPack = readJson(paths.publicReviewerPackJson, "Second Brain public reviewer pack artifact");
const nextQueueText = readText(paths.nextQueue, "next PR queue");
const releaseDocText = readText(paths.releaseDoc, "public demo release checklist");

const report = buildReport(new Date().toISOString());
validateReport(report, "generated security owner handoff");
validateSourceLinks();

if (shouldWrite) {
  writeJson(paths.outputJson, report);
  writeText(paths.outputMarkdown, renderMarkdown(report));
}

if (shouldCheck) {
  ensureFile(paths.outputJson, "security owner handoff JSON artifact");
  ensureFile(paths.outputMarkdown, "security owner handoff Markdown artifact");
  const existingJson = readJson(paths.outputJson, "security owner handoff JSON artifact");
  const existingMarkdown = readText(paths.outputMarkdown, "security owner handoff Markdown artifact");
  if (existingJson) validateReport(existingJson, "existing security owner handoff");
  for (const phrase of [
    "SEIS Security Owner Handoff",
    "NO-GO-owner-security-decision-required",
    "Owner decisions required",
    "Raw finding values stored: false",
    "Agent assignments"
  ]) {
    ensure(existingMarkdown.includes(phrase), `Markdown artifact missing phrase: ${phrase}.`);
  }
}

if (failures.length > 0) {
  console.error("SEIS security owner handoff check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (shouldWrite) {
  console.log(`Wrote ${paths.outputJson}`);
  console.log(`Wrote ${paths.outputMarkdown}`);
} else if (shouldCheck) {
  console.log("SEIS security owner handoff check passed.");
} else {
  console.log(JSON.stringify(report, null, 2));
}

function buildReport(generatedAt) {
  const fullHistory = securityGate?.fullHistorySecretScan || {};
  const currentTree = securityGate?.currentTreeSecretScan || {};
  const safetyBoundary = securityGate?.safetyBoundary || {};

  return {
    id: "seis-security-owner-handoff-pr104",
    title: "SEIS Security Owner Handoff",
    generatedAt,
    status: "owner-action-required",
    mode: "redacted-owner-review-no-raw-values",
    decision: "NO-GO-owner-security-decision-required",
    pullRequest: securityGate?.pullRequest || {
      number: 104,
      url: "https://github.com/emirhankudun-ux/SEIS/pull/104",
      branch: "codex/second-brain-readiness-agent-registry-20260701",
      base: "main"
    },
    sourceArtifacts: {
      securityGate: paths.securityGateJson,
      securityGateMarkdown: paths.securityGateMarkdown,
      agentRegistry: paths.agentRegistryJson,
      publicReviewerPack: paths.publicReviewerPackJson,
      releaseChecklist: paths.releaseDoc,
      nextQueue: paths.nextQueue
    },
    observedSecurityState: {
      currentTreeStatus: currentTree.status,
      currentTreeFindings: currentTree.findings,
      fullHistoryStatus: fullHistory.status,
      fullHistoryFindings: fullHistory.totalFindings,
      fullHistoryRules: fullHistory.findingsByRule || {},
      fullHistoryPaths: fullHistory.findingsByPath || [],
      blockedCommitRefs: fullHistory.blockedCommitRefs || [],
      rawFindingValuesStored: Boolean(fullHistory.rawSecretValuesStored),
      fullJobLogDownloaded: Boolean(fullHistory.fullJobLogDownloaded),
      securityPolicyChanged: Boolean(currentTree.securityPolicyChanged || safetyBoundary.gitleaksPolicyChanged),
      allowlistCommitted: Boolean(currentTree.gitleaksAllowlistCommitted)
    },
    ownerDecisionsRequired: [
      {
        id: "rotate-or-attest-affected-credentials",
        owner: "human-owner",
        decisionNeeded: "Decide whether affected historical credentials must be rotated or can be attested as non-sensitive fixtures.",
        requiredEvidence: [
          "dated owner decision",
          "scope of affected credential classes",
          "rotation or non-secret attestation path",
          "no raw values committed to repository"
        ],
        status: "blocked-owner-required"
      },
      {
        id: "history-remediation-approval",
        owner: "human-owner",
        decisionNeeded: "Approve either history rewrite/path purge or an explicit reviewed security baseline for the historical generated bundle.",
        requiredEvidence: [
          "chosen remediation route",
          "rollback plan",
          "force-push approval if history rewrite is chosen",
          "post-remediation scan result"
        ],
        status: "blocked-owner-required"
      },
      {
        id: "security-policy-change-review",
        owner: "security-agent-plus-human-owner",
        decisionNeeded: "Review any proposed .gitleaks.toml change separately; this handoff does not approve scanner weakening.",
        requiredEvidence: [
          "narrow rule justification",
          "path-specific reasoning",
          "independent no-secret review",
          "explicit owner approval"
        ],
        status: "blocked-owner-required"
      },
      {
        id: "release-gate-override-denied",
        owner: "release-owner",
        decisionNeeded: "Keep merge, release, deploy, and Pages publication blocked until security checks pass or a reviewed baseline is approved.",
        requiredEvidence: [
          "GitHub Security Summary pass or approved baseline",
          "reviewDecision not blocking",
          "draft status resolved",
          "current browser-smoke evidence"
        ],
        status: "blocked-owner-required"
      }
    ],
    agentAssignments: [
      {
        agent: "Security Agent",
        allowedActions: [
          "classify redacted finding categories",
          "prepare owner decision checklist",
          "validate no raw values are stored"
        ],
        forbiddenActions: [
          "print raw finding values",
          "weaken secret scanning",
          "approve release"
        ]
      },
      {
        agent: "DevOps Agent",
        allowedActions: [
          "draft owner-approved remediation commands",
          "prepare rollback notes",
          "rerun checks after approval"
        ],
        forbiddenActions: [
          "rewrite history without approval",
          "force-push without approval",
          "download full security job logs into the repo"
        ]
      },
      {
        agent: "Documentation Agent",
        allowedActions: [
          "keep PR #104 blocker notes current",
          "link handoff artifacts from release docs",
          "separate mock, planned, blocked, and approved states"
        ],
        forbiddenActions: [
          "claim production readiness",
          "hide release blockers",
          "publish private vault content"
        ]
      },
      {
        agent: "QA Agent",
        allowedActions: [
          "run local no-git secret scans",
          "run readiness validators",
          "verify generated handoff artifacts"
        ],
        forbiddenActions: [
          "treat local current-tree pass as full-history pass",
          "skip GitHub security gates",
          "approve merge"
        ]
      }
    ],
    allowedNextActionsWithoutApproval: [
      "regenerate this redacted handoff",
      "run current-tree no-git secret scan",
      "update docs with blocked security status",
      "prepare a proposed owner-approved remediation plan"
    ],
    forbiddenWithoutOwnerApproval: [
      "printing raw finding values",
      "downloading or committing full CI job logs",
      "blanket-allowlisting historical generated bundles",
      "weakening Secret & Vulnerability Scan",
      "rewriting history",
      "force-pushing rewritten history",
      "merging PR #104",
      "publishing a public demo release"
    ],
    releaseImpact: {
      mergeAllowed: false,
      publicDemoReleaseAllowed: false,
      githubPagesPublicationAllowed: false,
      liveProviderRoutingAllowed: false,
      privateObsidianImportAllowed: false,
      reason: "Owner security decisions and GitHub security gates are still required."
    },
    safetyBoundary: {
      rawFindingValuesStored: false,
      fullSecurityLogStored: false,
      privateKeyBodyStored: false,
      gitleaksPolicyChanged: false,
      allowlistCommitted: false,
      historyRewritePerformed: false,
      forcePushPerformed: false,
      secretRotationPerformed: false,
      githubMutationPerformedByReport: false,
      privateObsidianVaultReadPerformed: false,
      providerCallsPerformed: false,
      sshExecuted: false,
      deploymentPerformed: false,
      releaseApprovalGranted: false
    },
    upstreamReadinessBinding: {
      secondBrainAgentRegistryDecision: agentRegistry?.decision || null,
      publicReviewerPackDecision: publicReviewerPack?.decision || null,
      securityGateDecision: securityGate?.decision || null
    }
  };
}

function validateReport(value, label) {
  ensure(value?.id === "seis-security-owner-handoff-pr104", `${label} id mismatch.`);
  ensure(value?.status === "owner-action-required", `${label} status mismatch.`);
  ensure(value?.mode === "redacted-owner-review-no-raw-values", `${label} mode mismatch.`);
  ensure(value?.decision === "NO-GO-owner-security-decision-required", `${label} decision mismatch.`);
  ensure(value?.pullRequest?.number === 104, `${label} must bind PR #104.`);
  ensure(value?.sourceArtifacts?.securityGate === paths.securityGateJson, `${label} security gate source mismatch.`);
  ensure(value?.observedSecurityState?.currentTreeStatus === "clean-redacted-no-git", `${label} must preserve current-tree clean status.`);
  ensure(value?.observedSecurityState?.currentTreeFindings === 0, `${label} current-tree findings must be zero.`);
  ensure(value?.observedSecurityState?.fullHistoryStatus === "blocked-redacted-findings", `${label} must preserve full-history blocker.`);
  ensure((value?.observedSecurityState?.fullHistoryFindings || 0) >= 1, `${label} must include full-history finding count.`);
  ensure(value?.observedSecurityState?.rawFindingValuesStored === false, `${label} must not store raw finding values.`);
  ensure(value?.observedSecurityState?.fullJobLogDownloaded === false, `${label} must not download full job logs.`);
  ensure(value?.observedSecurityState?.securityPolicyChanged === false, `${label} must not change security policy.`);
  ensure(value?.observedSecurityState?.allowlistCommitted === false, `${label} must not commit an allowlist.`);
  ensure((value?.ownerDecisionsRequired || []).length >= 4, `${label} must include owner decisions.`);
  for (const required of [
    "rotate-or-attest-affected-credentials",
    "history-remediation-approval",
    "security-policy-change-review",
    "release-gate-override-denied"
  ]) {
    ensure((value?.ownerDecisionsRequired || []).some((item) => item.id === required), `${label} missing owner decision ${required}.`);
  }
  for (const agent of ["Security Agent", "DevOps Agent", "Documentation Agent", "QA Agent"]) {
    ensure((value?.agentAssignments || []).some((item) => item.agent === agent), `${label} missing ${agent} assignment.`);
  }
  for (const forbidden of [
    "printing raw finding values",
    "downloading or committing full CI job logs",
    "weakening Secret & Vulnerability Scan",
    "rewriting history",
    "force-pushing rewritten history",
    "merging PR #104"
  ]) {
    ensureIncludes(value?.forbiddenWithoutOwnerApproval, forbidden, `${label} forbidden actions`);
  }
  for (const [key, expected] of [
    ["rawFindingValuesStored", false],
    ["fullSecurityLogStored", false],
    ["privateKeyBodyStored", false],
    ["gitleaksPolicyChanged", false],
    ["allowlistCommitted", false],
    ["historyRewritePerformed", false],
    ["forcePushPerformed", false],
    ["secretRotationPerformed", false],
    ["githubMutationPerformedByReport", false],
    ["privateObsidianVaultReadPerformed", false],
    ["providerCallsPerformed", false],
    ["sshExecuted", false],
    ["deploymentPerformed", false],
    ["releaseApprovalGranted", false]
  ]) {
    ensure(value?.safetyBoundary?.[key] === expected, `${label} safety boundary ${key} must be ${expected}.`);
  }
  ensure(value?.releaseImpact?.mergeAllowed === false, `${label} must block merge.`);
  ensure(value?.releaseImpact?.publicDemoReleaseAllowed === false, `${label} must block public demo release.`);
  ensure(value?.releaseImpact?.privateObsidianImportAllowed === false, `${label} must block private Obsidian import.`);
  ensure(value?.upstreamReadinessBinding?.securityGateDecision === "NO-GO-security-history-remediation-needed", `${label} must bind security gate decision.`);
  validateNoCredentialPatterns(JSON.stringify(value), label);
}

function validateSourceLinks() {
  ensure(securityGate?.decision === "NO-GO-security-history-remediation-needed", "security gate must remain NO-GO.");
  ensure(agentRegistry?.decision === "NO-GO-autonomous-execution-not-approved", "agent registry must remain review-only.");
  ensure(publicReviewerPack?.decision === "NO-GO-review-pack-does-not-approve-release", "public reviewer pack must not approve release.");
  for (const phrase of ["PR #104 security scan remediation", "do not print values", "Do not blanket-allowlist"]) {
    ensure(nextQueueText.toLowerCase().includes(phrase.toLowerCase()), `NEXT_PR_QUEUE missing phrase: ${phrase}`);
  }
  for (const phrase of ["security-gate-redacted-latest", "Secret & Vulnerability Scan historical findings"]) {
    ensure(releaseDocText.includes(phrase), `release checklist missing phrase: ${phrase}`);
  }
}

function renderMarkdown(value) {
  const decisionRows = value.ownerDecisionsRequired
    .map((item) => `| ${item.id} | ${item.owner} | ${item.status} | ${item.decisionNeeded} |`)
    .join("\n");
  const agentRows = value.agentAssignments
    .map((item) => `| ${item.agent} | ${item.allowedActions.join("; ")} | ${item.forbiddenActions.join("; ")} |`)
    .join("\n");
  const allowed = value.allowedNextActionsWithoutApproval.map((item) => `- ${item}`).join("\n");
  const forbidden = value.forbiddenWithoutOwnerApproval.map((item) => `- ${item}`).join("\n");

  return `# SEIS Security Owner Handoff

Generated: ${value.generatedAt}
Status: ${value.status}
Mode: ${value.mode}
Decision: ${value.decision}
PR: ${value.pullRequest.url}

This handoff turns the PR #104 security blocker into owner-reviewable decisions
without storing raw finding values, full security logs, private vault content, or
provider credentials.

Raw finding values stored: ${value.safetyBoundary.rawFindingValuesStored}
Full security log stored: ${value.safetyBoundary.fullSecurityLogStored}
History rewrite performed: ${value.safetyBoundary.historyRewritePerformed}
Force push performed: ${value.safetyBoundary.forcePushPerformed}
Release approval granted: ${value.safetyBoundary.releaseApprovalGranted}

## Observed Security State

- Current-tree status: ${value.observedSecurityState.currentTreeStatus}
- Current-tree findings: ${value.observedSecurityState.currentTreeFindings}
- Full-history status: ${value.observedSecurityState.fullHistoryStatus}
- Full-history findings: ${value.observedSecurityState.fullHistoryFindings}
- Security policy changed: ${value.observedSecurityState.securityPolicyChanged}
- Allowlist committed: ${value.observedSecurityState.allowlistCommitted}

## Owner decisions required

| Decision | Owner | Status | Needed |
| --- | --- | --- | --- |
${decisionRows}

## Agent assignments

| Agent | Allowed | Forbidden |
| --- | --- | --- |
${agentRows}

## Allowed Without Approval

${allowed}

## Forbidden Without Owner Approval

${forbidden}

Merge, public demo release, Pages publication, live provider routing, and private
Obsidian import remain blocked.
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
    return path.join(root, "reports", "seis-public-demo", "security-owner-handoff-refused-output.json");
  }
  return absolutePath;
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(path.join(root, filePath))) failures.push(`missing ${label}: ${filePath}`);
}

function readText(filePath, label) {
  const absolutePath = path.join(root, filePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${label}: ${filePath}`);
    return "";
  }
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

function ensure(condition, message) {
  if (!condition) failures.push(message);
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
