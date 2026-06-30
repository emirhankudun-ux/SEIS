#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = parseArgs(process.argv.slice(2));
const requireReady = Boolean(args["require-ready"]);
const runFastChecks = Boolean(args["run-fast-checks"]);
const approved = Boolean(args.approved);
const browserSmokeCurrentRun = Boolean(args["browser-smoke-current-run"]);
const allowDirtyWorktree = Boolean(args["allow-dirty-worktree"]);
const outputPath = typeof args.output === "string" ? args.output : "";
const markdownPath = typeof args.markdown === "string" ? args.markdown : "";
const manifestPath = typeof args.manifest === "string" ? args.manifest : "";
const reviewPacketPath = typeof args["review-packet"] === "string" ? args["review-packet"] : "";
const worktreeReviewPath = typeof args["worktree-review"] === "string" ? args["worktree-review"] : "";
const stagePlanPath = typeof args["stage-plan"] === "string" ? args["stage-plan"] : "";

if (args.help) {
  printHelp();
  process.exit(0);
}

const files = {
  checklist: "content/development/seis-public-demo-release-checklist-pr54.json",
  secondBrain: "content/development/seis-second-brain-system.json",
  obsidian: "content/development/seis-obsidian-bridge-safe-import-contract.json",
  accessibility: "content/development/seis-second-brain-accessibility-focus-qa.json",
  router: "content/development/seis-read-only-model-router-contract.json",
  obsidianDryRunJson: "reports/seis-public-demo/obsidian-safe-import-dry-run-latest.json",
  obsidianDryRunMarkdown: "reports/seis-public-demo/obsidian-safe-import-dry-run-latest.md",
  routerDecisionJson: "reports/seis-public-demo/read-only-model-router-decision-latest.json",
  routerDecisionMarkdown: "reports/seis-public-demo/read-only-model-router-decision-latest.md",
  accessibilityFocusJson: "reports/seis-public-demo/second-brain-accessibility-focus-latest.json",
  accessibilityFocusMarkdown: "reports/seis-public-demo/second-brain-accessibility-focus-latest.md",
  agentRegistryJson: "reports/seis-public-demo/second-brain-agent-registry-latest.json",
  agentRegistryMarkdown: "reports/seis-public-demo/second-brain-agent-registry-latest.md",
  publicReviewerPackJson: "reports/seis-public-demo/second-brain-public-reviewer-pack-latest.json",
  publicReviewerPackMarkdown: "reports/seis-public-demo/second-brain-public-reviewer-pack-latest.md",
  securityGateJson: "reports/seis-public-demo/security-gate-redacted-latest.json",
  securityGateMarkdown: "reports/seis-public-demo/security-gate-redacted-latest.md",
  releaseDoc: "docs/releases/PUBLIC_DEMO_RELEASE_CHECKLIST_PR54.md",
  secondBrainDoc: "docs/product/seis-second-brain.md",
  statusDoc: "docs/STATUS.md",
  nextQueue: "docs/roadmap/NEXT_PR_QUEUE.md",
  packageJson: "package.json"
};

const failures = [];
const blockers = [];
const warnings = [];
const checks = {};

for (const [label, filePath] of Object.entries(files)) {
  ensureFile(filePath, label);
}

const checklist = readJson(files.checklist, "public demo checklist");
const secondBrain = readJson(files.secondBrain, "Second Brain contract");
const obsidian = readJson(files.obsidian, "Obsidian safe import contract");
const accessibility = readJson(files.accessibility, "Second Brain accessibility contract");
const router = readJson(files.router, "read-only router contract");
const obsidianDryRun = readJson(files.obsidianDryRunJson, "Obsidian safe-import dry-run artifact");
const routerDecision = readJson(files.routerDecisionJson, "read-only model-router decision artifact");
const accessibilityFocus = readJson(files.accessibilityFocusJson, "Second Brain accessibility/focus artifact");
const agentRegistry = readJson(files.agentRegistryJson, "Second Brain agent registry artifact");
const publicReviewerPack = readJson(files.publicReviewerPackJson, "Second Brain public reviewer pack artifact");
const securityGate = readJson(files.securityGateJson, "public demo security gate redacted artifact");
const packageJson = readJson(files.packageJson, "package.json");

validateContracts();
validateDocs();
validateNoSecrets();
validateGitState();
if (runFastChecks) runFastValidation();

if (!approved) blockers.push("human-release-approval-missing");
if (!browserSmokeCurrentRun) blockers.push("current-browser-smoke-evidence-missing");
if (securityGate?.decision === "NO-GO-security-history-remediation-needed") {
  blockers.push("security-full-history-remediation-needed");
}

const ready = failures.length === 0 && blockers.length === 0;
const report = {
  ok: failures.length === 0,
  decision: ready ? "GO" : "NO-GO",
  status: ready ? "ready-for-public-demo-release" : "review-gated-not-released",
  mode: "read-only",
  pullRequest: checklist?.pullRequest || null,
  checkedAt: new Date().toISOString(),
  checks,
  failures,
  blockers: unique(blockers),
  warnings: unique(warnings),
  nextActions: nextActions(unique(blockers), failures),
  safety: [
    "This command is read-only.",
    "It does not push, merge, tag, deploy, publish GitHub Pages, import an Obsidian vault, execute SSH, or call model providers.",
    "Use --require-ready only after human approval and current browser-smoke evidence exist."
  ]
};
const evidenceManifest = buildEvidenceManifest(report);
const worktreeReview = buildWorktreeReview(report);
const stagePlan = buildStagePlan(report, worktreeReview);
report.evidenceManifest = {
  itemCount: evidenceManifest.items.length,
  passedCount: evidenceManifest.summary.passed,
  blockedCount: evidenceManifest.summary.blocked,
  missingEvidenceCount: evidenceManifest.summary.missingCurrentEvidence,
  artifactPath: manifestPath || null
};
report.worktreeReview = {
  artifactPath: worktreeReviewPath || null,
  dirtyCount: worktreeReview.summary.dirtyCount,
  workstreamCount: worktreeReview.summary.workstreamCount,
  releaseBlocking: worktreeReview.summary.releaseBlocking
};
report.stagePlan = {
  artifactPath: stagePlanPath || null,
  candidatePathCount: stagePlan.summary.candidatePathCount,
  excludedPathCount: stagePlan.summary.excludedPathCount,
  readyForHumanReview: stagePlan.summary.readyForHumanReview
};

if (outputPath) writeJsonReport(outputPath, report);
if (markdownPath) writeMarkdownReport(markdownPath, report);
if (manifestPath) writeJsonReport(manifestPath, evidenceManifest);
if (reviewPacketPath) writeReviewPacket(reviewPacketPath, report, evidenceManifest);
if (worktreeReviewPath) writeWorktreeReview(worktreeReviewPath, worktreeReview);
if (stagePlanPath) writeStagePlan(stagePlanPath, stagePlan);

console.log(JSON.stringify(report, null, 2));

if (failures.length > 0) process.exit(1);
if (requireReady && !ready) process.exit(1);

function validateContracts() {
  if (!checklist) return;

  checks.checklist = {
    id: checklist.id,
    status: checklist.status,
    releaseDecision: checklist.releaseDecision,
    requiredValidation: checklist.requiredValidation?.length || 0,
    blockedActions: checklist.blockedActions?.length || 0,
    approvalNeeded: checklist.approvalNeeded?.length || 0
  };

  ensure(checklist.id === "seis-public-demo-release-checklist-pr54", "Checklist id mismatch.");
  ensure(checklist.status === "review-gated-not-released", "Checklist must remain review-gated until release is approved.");
  ensure(checklist.pullRequest?.number === 54, "Checklist must bind PR #54.");
  ensure(checklist.pullRequest?.base === "main", "PR #54 base branch must be main.");
  ensure(checklist.pullRequest?.head === "codex/seis-demo-github-upload-20260624", "PR #54 head branch mismatch.");
  ensureIncludes(checklist.requiredValidation, "npm run check:seis-public-demo-go-no-go -- --run-fast-checks", "required validation");
  ensureIncludes(checklist.requiredValidation, "npm run report:seis-public-demo-go-no-go", "required validation");
  ensureIncludes(checklist.requiredValidation, "npm run check:seis-obsidian-safe-import-dry-run", "required validation");
  ensureIncludes(checklist.requiredValidation, "npm run report:seis-obsidian-safe-import-dry-run", "required validation");
  ensureIncludes(checklist.requiredValidation, "npm run check:seis-read-only-model-router-decision", "required validation");
  ensureIncludes(checklist.requiredValidation, "npm run report:seis-read-only-model-router-decision", "required validation");
  ensureIncludes(checklist.requiredValidation, "npm run check:seis-second-brain-accessibility-focus-report", "required validation");
  ensureIncludes(checklist.requiredValidation, "npm run report:seis-second-brain-accessibility-focus-report", "required validation");
  ensureIncludes(checklist.requiredValidation, "npm run check:seis-second-brain-agent-registry", "required validation");
  ensureIncludes(checklist.requiredValidation, "npm run report:seis-second-brain-agent-registry", "required validation");
  ensureIncludes(checklist.requiredValidation, "npm run check:seis-second-brain-public-reviewer-pack", "required validation");
  ensureIncludes(checklist.requiredValidation, "npm run report:seis-second-brain-public-reviewer-pack", "required validation");
  ensureIncludes(checklist.requiredValidation, "npm run check:seis-public-demo-security-gate", "required validation");
  ensureIncludes(checklist.requiredValidation, "npm run report:seis-public-demo-security-gate", "required validation");
  ensureIncludes(checklist.requiredValidation, "npm run check:seis-second-brain", "required validation");
  ensureIncludes(checklist.requiredValidation, "npm run check:seis-second-brain-browser-smoke", "required validation");
  ensureIncludes(checklist.requiredValidation, "npm run check:seis-second-brain-readiness-contracts", "required validation");
  ensureIncludes(checklist.requiredValidation, "git diff --check", "required validation");
  ensureIncludes(checklist.requiredArtifacts, "reports/seis-public-demo/go-no-go-latest.json", "required artifacts");
  ensureIncludes(checklist.requiredArtifacts, "reports/seis-public-demo/go-no-go-latest.md", "required artifacts");
  ensureIncludes(checklist.requiredArtifacts, "reports/seis-public-demo/evidence-manifest-latest.json", "required artifacts");
  ensureIncludes(checklist.requiredArtifacts, "reports/seis-public-demo/obsidian-safe-import-dry-run-latest.json", "required artifacts");
  ensureIncludes(checklist.requiredArtifacts, "reports/seis-public-demo/obsidian-safe-import-dry-run-latest.md", "required artifacts");
  ensureIncludes(checklist.requiredArtifacts, "reports/seis-public-demo/read-only-model-router-decision-latest.json", "required artifacts");
  ensureIncludes(checklist.requiredArtifacts, "reports/seis-public-demo/read-only-model-router-decision-latest.md", "required artifacts");
  ensureIncludes(checklist.requiredArtifacts, "reports/seis-public-demo/second-brain-accessibility-focus-latest.json", "required artifacts");
  ensureIncludes(checklist.requiredArtifacts, "reports/seis-public-demo/second-brain-accessibility-focus-latest.md", "required artifacts");
  ensureIncludes(checklist.requiredArtifacts, "reports/seis-public-demo/second-brain-agent-registry-latest.json", "required artifacts");
  ensureIncludes(checklist.requiredArtifacts, "reports/seis-public-demo/second-brain-agent-registry-latest.md", "required artifacts");
  ensureIncludes(checklist.requiredArtifacts, "reports/seis-public-demo/second-brain-public-reviewer-pack-latest.json", "required artifacts");
  ensureIncludes(checklist.requiredArtifacts, "reports/seis-public-demo/second-brain-public-reviewer-pack-latest.md", "required artifacts");
  ensureIncludes(checklist.requiredArtifacts, "reports/seis-public-demo/security-gate-redacted-latest.json", "required artifacts");
  ensureIncludes(checklist.requiredArtifacts, "reports/seis-public-demo/security-gate-redacted-latest.md", "required artifacts");
  ensureIncludes(checklist.requiredArtifacts, "reports/seis-public-demo/pr54-review-packet-latest.md", "required artifacts");
  ensureIncludes(checklist.requiredArtifacts, "reports/seis-public-demo/worktree-review-latest.md", "required artifacts");
  ensureIncludes(checklist.requiredArtifacts, "reports/seis-public-demo/pr54-stage-plan-latest.md", "required artifacts");

  for (const action of [
    "merge to main",
    "GitHub Pages publication",
    "Obsidian private vault import",
    "live provider routing",
    "SSH execution",
    "deployment",
    "claiming production readiness"
  ]) {
    ensureListEntryContains(checklist.blockedActions, action, "blocked actions");
  }

  if (secondBrain) {
    checks.secondBrain = {
      status: secondBrain.status,
      privateVaultImportForbidden: secondBrain.obsidianBridge?.forbiddenToday?.includes("import private Obsidian vaults"),
      githubMutation: secondBrain.securityBoundary?.githubMutation
    };
    ensure(secondBrain.status === "local-demo", "Second Brain must remain local-demo before public release.");
    ensure(secondBrain.securityBoundary?.githubMutation === false, "Second Brain must not mutate GitHub.");
    ensure(secondBrain.securityBoundary?.providerCalls === false, "Second Brain must not call providers.");
    ensure(secondBrain.trainingPackPath === "/home/seis/SecondBrain/07-learning/seis-agent-training-pack.md", "Second Brain training pack path mismatch.");
  }

  if (obsidian) {
    checks.obsidian = {
      status: obsidian.status,
      hostVaultReadEnabled: obsidian.currentRuntime?.hostVaultReadEnabled,
      privateVaultImportEnabled: obsidian.currentRuntime?.privateVaultImportEnabled
    };
    ensure(obsidian.status === "planned-gated", "Obsidian bridge must remain planned-gated.");
    ensure(obsidian.currentRuntime?.hostVaultReadEnabled === false, "Host Obsidian vault reads must remain disabled.");
    ensure(obsidian.currentRuntime?.privateVaultImportEnabled === false, "Private Obsidian vault import must remain disabled.");
  }

  if (obsidianDryRun) {
    checks.obsidianDryRun = {
      status: obsidianDryRun.status,
      mode: obsidianDryRun.mode,
      selectedByUser: obsidianDryRun.selectedByUser,
      candidateNoteCount: obsidianDryRun.candidateNoteCount,
      humanApprovalState: obsidianDryRun.humanApprovalState
    };
    ensure(obsidianDryRun.id === "seis-obsidian-safe-import-dry-run-pr54", "Obsidian dry-run artifact id mismatch.");
    ensure(obsidianDryRun.status === "repo-owned-seed-notes-only", "Obsidian dry-run artifact must stay repo-owned seed notes only.");
    ensure(obsidianDryRun.mode === "dry-run-no-private-vault-read", "Obsidian dry-run artifact must not read a private vault.");
    ensure(obsidianDryRun.decision === "NO-GO-private-vault-import-not-approved", "Obsidian dry-run must block private vault import.");
    ensure(obsidianDryRun.selectedByUser === false, "Obsidian dry-run selectedByUser must remain false.");
    ensure(obsidianDryRun.bodyImportPolicy === "metadata-only-by-default", "Obsidian dry-run body import policy mismatch.");
    ensure(obsidianDryRun.humanApprovalState === "not-requested", "Obsidian dry-run human approval state must remain not-requested.");
    ensure(obsidianDryRun.secretScanSummary?.scannedPrivateVault === false, "Obsidian dry-run must not scan private vaults.");
    ensure(obsidianDryRun.secretScanSummary?.hostFilesystemScanned === false, "Obsidian dry-run must not scan host filesystem.");
    ensure(obsidianDryRun.secretScanSummary?.findings === 0, "Obsidian dry-run secret scan must have zero findings.");
    ensure(obsidianDryRun.safetyBoundary?.privateVaultReadPerformed === false, "Obsidian dry-run must not read private vaults.");
    ensure(obsidianDryRun.safetyBoundary?.githubMutationPerformed === false, "Obsidian dry-run must not mutate GitHub.");
    ensure(obsidianDryRun.safetyBoundary?.providerCallsPerformed === false, "Obsidian dry-run must not call model providers.");
    ensure(obsidianDryRun.safetyBoundary?.sshExecuted === false, "Obsidian dry-run must not execute SSH.");
  }

  if (accessibility) {
    checks.accessibility = {
      status: accessibility.status,
      linkedBrowserSmoke: accessibility.linkedBrowserSmoke || accessibility.linkedSmoke
    };
    ensure(accessibility.status === "contract-active", "Second Brain accessibility/focus QA contract must be active.");
    ensure(
      accessibility.linkedBrowserSmoke === "npm run check:seis-second-brain-browser-smoke",
      "Accessibility QA must link to the dedicated browser smoke."
    );
  }

  if (accessibilityFocus) {
    checks.accessibilityFocus = {
      status: accessibilityFocus.status,
      mode: accessibilityFocus.mode,
      decision: accessibilityFocus.decision,
      automatedFailed: accessibilityFocus.summary?.automatedFailed,
      requiredBlocked: accessibilityFocus.summary?.requiredBlocked
    };
    ensure(accessibilityFocus.id === "seis-second-brain-accessibility-focus-qa-pr54", "Accessibility focus artifact id mismatch.");
    ensure(accessibilityFocus.status === "review-gated-human-accessibility-needed", "Accessibility focus artifact must stay review-gated.");
    ensure(accessibilityFocus.mode === "repo-static-and-browser-smoke-evidence", "Accessibility focus artifact mode mismatch.");
    ensure(accessibilityFocus.decision === "NO-GO-human-accessibility-review-required", "Accessibility focus artifact must block public release.");
    ensure(accessibilityFocus.summary?.automatedFailed === 0, "Accessibility focus artifact automated checks must not fail.");
    ensure(accessibilityFocus.summary?.requiredBlocked >= 3, "Accessibility focus artifact must keep manual review blockers visible.");
    ensure(accessibilityFocus.safetyBoundary?.privateObsidianImportPerformed === false, "Accessibility focus must not import private Obsidian.");
    ensure(accessibilityFocus.safetyBoundary?.providerCallsPerformed === false, "Accessibility focus must not call providers.");
    ensure(accessibilityFocus.safetyBoundary?.credentialAccessPerformed === false, "Accessibility focus must not access credentials.");
    ensure(accessibilityFocus.safetyBoundary?.sshExecuted === false, "Accessibility focus must not execute SSH.");
    ensure(accessibilityFocus.safetyBoundary?.deploymentPerformed === false, "Accessibility focus must not deploy.");
    ensure(accessibilityFocus.safetyBoundary?.githubMutationPerformed === false, "Accessibility focus must not mutate GitHub.");
    ensure(accessibilityFocus.safetyBoundary?.releaseApprovalGranted === false, "Accessibility focus must not grant release approval.");
  }

  if (agentRegistry) {
    checks.agentRegistry = {
      status: agentRegistry.status,
      mode: agentRegistry.mode,
      decision: agentRegistry.decision,
      installedAiProfileCount: agentRegistry.summary?.installedAiProfileCount,
      autonomousAgentRosterCount: agentRegistry.summary?.autonomousAgentRosterCount,
      mcpVendorSurfaceCount: agentRegistry.summary?.mcpVendorSurfaceCount
    };
    ensure(agentRegistry.id === "seis-second-brain-agent-registry-pr54", "Second Brain agent registry artifact id mismatch.");
    ensure(agentRegistry.status === "review-only-agent-registry", "Second Brain agent registry must stay review-only.");
    ensure(agentRegistry.mode === "repo-local-no-live-execution", "Second Brain agent registry mode mismatch.");
    ensure(agentRegistry.decision === "NO-GO-autonomous-execution-not-approved", "Second Brain agent registry must block autonomous execution.");
    ensure(agentRegistry.secondBrainBinding?.status === "local-demo", "Second Brain agent registry must bind local-demo Second Brain.");
    ensure(agentRegistry.secondBrainBinding?.privateVaultImportEnabled === false, "Second Brain agent registry must not enable private vault import.");
    ensure(agentRegistry.secondBrainBinding?.hostVaultReadEnabled === false, "Second Brain agent registry must not enable host vault reads.");
    ensure(agentRegistry.secondBrainBinding?.githubMutationEnabled === false, "Second Brain agent registry must not enable GitHub mutation.");
    ensure((agentRegistry.summary?.installedAiProfileCount || 0) >= 6, "Second Brain agent registry must include installed AI profiles.");
    ensure((agentRegistry.summary?.workforceAssignmentCount || 0) >= 10, "Second Brain agent registry must include AI workforce assignments.");
    ensure((agentRegistry.summary?.autonomousAgentRosterCount || 0) >= 12, "Second Brain agent registry must include the autonomous agent roster.");
    ensure((agentRegistry.summary?.mcpVendorSurfaceCount || 0) >= 10, "Second Brain agent registry must include MCP vendor surfaces.");
    ensure(agentRegistry.safetyBoundary?.privateObsidianVaultReadPerformed === false, "Second Brain agent registry must not read private Obsidian.");
    ensure(agentRegistry.safetyBoundary?.providerCallsPerformed === false, "Second Brain agent registry must not call providers.");
    ensure(agentRegistry.safetyBoundary?.credentialValidationPerformed === false, "Second Brain agent registry must not validate credentials.");
    ensure(agentRegistry.safetyBoundary?.autonomousWriteExecutionPerformed === false, "Second Brain agent registry must not run autonomous writes.");
    ensure(agentRegistry.safetyBoundary?.externalConnectorMutationPerformed === false, "Second Brain agent registry must not mutate connectors.");
    ensure(agentRegistry.safetyBoundary?.sshExecuted === false, "Second Brain agent registry must not execute SSH.");
    ensure(agentRegistry.safetyBoundary?.deploymentPerformed === false, "Second Brain agent registry must not deploy.");
    ensure(agentRegistry.safetyBoundary?.githubMutationPerformed === false, "Second Brain agent registry must not mutate GitHub.");
    ensure(agentRegistry.safetyBoundary?.releaseApprovalGranted === false, "Second Brain agent registry must not grant release approval.");
  }

  if (publicReviewerPack) {
    checks.publicReviewerPack = {
      status: publicReviewerPack.status,
      mode: publicReviewerPack.mode,
      decision: publicReviewerPack.decision,
      requiresApiKeys: publicReviewerPack.noKeyLocalDemoContract?.requiresApiKeys,
      requiresPrivateObsidianVault: publicReviewerPack.noKeyLocalDemoContract?.requiresPrivateObsidianVault,
      quickStartCount: publicReviewerPack.quickStart?.length || 0,
      reviewSurfaceCount: publicReviewerPack.reviewSurfaces?.length || 0
    };
    ensure(publicReviewerPack.id === "seis-second-brain-public-reviewer-pack-pr104", "Second Brain public reviewer pack id mismatch.");
    ensure(publicReviewerPack.status === "reviewer-ready-no-key-local-demo", "Second Brain public reviewer pack status mismatch.");
    ensure(publicReviewerPack.mode === "github-public-review-no-private-data", "Second Brain public reviewer pack mode mismatch.");
    ensure(publicReviewerPack.decision === "NO-GO-review-pack-does-not-approve-release", "Second Brain public reviewer pack must not approve release.");
    ensure(publicReviewerPack.noKeyLocalDemoContract?.requiresApiKeys === false, "Second Brain public reviewer pack must not require API keys.");
    ensure(publicReviewerPack.noKeyLocalDemoContract?.requiresProviderLogin === false, "Second Brain public reviewer pack must not require provider login.");
    ensure(publicReviewerPack.noKeyLocalDemoContract?.requiresPrivateObsidianVault === false, "Second Brain public reviewer pack must not require private Obsidian.");
    ensure(publicReviewerPack.noKeyLocalDemoContract?.requiresSsh === false, "Second Brain public reviewer pack must not require SSH.");
    ensure(publicReviewerPack.noKeyLocalDemoContract?.requiresDeployment === false, "Second Brain public reviewer pack must not require deployment.");
    ensure((publicReviewerPack.quickStart?.length || 0) >= 5, "Second Brain public reviewer pack must include quick-start steps.");
    ensure((publicReviewerPack.reviewSurfaces?.length || 0) >= 8, "Second Brain public reviewer pack must include review surfaces.");
    ensure(publicReviewerPack.safetyBoundary?.privateObsidianVaultReadPerformed === false, "Second Brain public reviewer pack must not read private Obsidian.");
    ensure(publicReviewerPack.safetyBoundary?.providerCallsPerformed === false, "Second Brain public reviewer pack must not call providers.");
    ensure(publicReviewerPack.safetyBoundary?.sshExecuted === false, "Second Brain public reviewer pack must not execute SSH.");
    ensure(publicReviewerPack.safetyBoundary?.deploymentPerformed === false, "Second Brain public reviewer pack must not deploy.");
    ensure(publicReviewerPack.safetyBoundary?.releaseApprovalGranted === false, "Second Brain public reviewer pack must not grant release approval.");
  }

  if (securityGate) {
    checks.securityGate = {
      status: securityGate.status,
      mode: securityGate.mode,
      decision: securityGate.decision,
      currentTreeStatus: securityGate.currentTreeSecretScan?.status,
      currentTreeFindings: securityGate.currentTreeSecretScan?.findings,
      fullHistoryStatus: securityGate.fullHistorySecretScan?.status,
      fullHistoryFindings: securityGate.fullHistorySecretScan?.totalFindings,
      rawSecretValuesStored: securityGate.safetyBoundary?.rawSecretValuesStored
    };
    ensure(securityGate.id === "seis-public-demo-security-gate-redacted-pr104", "Security gate artifact id mismatch.");
    ensure(securityGate.status === "blocked-full-history-security-review", "Security gate artifact must keep full-history blocker visible.");
    ensure(securityGate.mode === "redacted-local-and-ci-evidence", "Security gate artifact mode mismatch.");
    ensure(securityGate.decision === "NO-GO-security-history-remediation-needed", "Security gate artifact must block public release.");
    ensure(securityGate.currentTreeSecretScan?.status === "clean-redacted-no-git", "Security gate must record current-tree clean scan.");
    ensure(securityGate.currentTreeSecretScan?.findings === 0, "Security gate current-tree findings must be zero.");
    ensure(securityGate.currentTreeSecretScan?.securityPolicyChanged === false, "Security gate must not change scanner policy.");
    ensure(securityGate.currentTreeSecretScan?.gitleaksAllowlistCommitted === false, "Security gate must not commit a gitleaks allowlist.");
    ensure(securityGate.fullHistorySecretScan?.status === "blocked-redacted-findings", "Security gate must record full-history blocker.");
    ensure((securityGate.fullHistorySecretScan?.totalFindings || 0) >= 1, "Security gate must include historical finding count.");
    ensure(securityGate.fullHistorySecretScan?.rawSecretValuesStored === false, "Security gate must not store raw historical finding values.");
    ensure(securityGate.fullHistorySecretScan?.fullJobLogDownloaded === false, "Security gate must not store full job logs.");
    ensure(securityGate.safetyBoundary?.rawSecretValuesStored === false, "Security gate must not store raw secret values.");
    ensure(securityGate.safetyBoundary?.gitleaksPolicyChanged === false, "Security gate must not change gitleaks policy.");
    ensure(securityGate.safetyBoundary?.historyRewritePerformed === false, "Security gate must not rewrite history.");
    ensure(securityGate.safetyBoundary?.forcePushPerformed === false, "Security gate must not force-push.");
    ensure(securityGate.safetyBoundary?.releaseApprovalGranted === false, "Security gate must not grant release approval.");
  }

  if (router) {
    checks.router = {
      status: router.status,
      providerCalls: router.providerCalls,
      browserSecrets: router.browserSecrets,
      silentFallback: router.silentFallback
    };
    ensure(router.status === "planned-read-only-contract", "Model-router contract must stay planned read-only.");
    ensure(router.providerCalls === false, "Model-router contract must not call providers.");
    ensure(router.browserSecrets === false, "Model-router contract must not expose browser secrets.");
    ensure(router.silentFallback === false, "Model-router contract must not allow silent fallback.");
  }

  if (routerDecision) {
    checks.routerDecision = {
      status: routerDecision.status,
      mode: routerDecision.mode,
      decision: routerDecision.decision,
      decisionCount: routerDecision.decisions?.length || 0,
      providerFixtureCount: routerDecision.providerFixtures?.length || 0
    };
    ensure(routerDecision.id === "seis-read-only-model-router-decision-pr54", "Router decision artifact id mismatch.");
    ensure(routerDecision.status === "review-only-no-runtime-authority", "Router decision artifact must stay review-only.");
    ensure(routerDecision.mode === "provider-neutral-read-only", "Router decision artifact mode mismatch.");
    ensure(routerDecision.decision === "NO-GO-live-routing-not-approved", "Router decision artifact must block live routing.");
    ensure(routerDecision.safetyBoundary?.runtimeAuthority === false, "Router decision must not have runtime authority.");
    ensure(routerDecision.safetyBoundary?.providerCallsPerformed === false, "Router decision must not call providers.");
    ensure(routerDecision.safetyBoundary?.credentialValidationPerformed === false, "Router decision must not validate credentials.");
    ensure(routerDecision.safetyBoundary?.browserSecretsExposed === false, "Router decision must not expose browser secrets.");
    ensure(routerDecision.safetyBoundary?.promptBodiesStored === false, "Router decision must not store prompt bodies.");
    ensure(routerDecision.safetyBoundary?.privateObsidianContentRouted === false, "Router decision must not route private Obsidian content.");
    ensure(routerDecision.safetyBoundary?.silentFallbackUsed === false, "Router decision must not use silent fallback.");
    ensure(routerDecision.safetyBoundary?.localOnlyCloudFallbackUsed === false, "Router decision must not use local-only cloud fallback.");
    ensure(routerDecision.safetyBoundary?.sshExecuted === false, "Router decision must not execute SSH.");
    ensure(routerDecision.safetyBoundary?.deploymentPerformed === false, "Router decision must not deploy.");
    ensure(routerDecision.safetyBoundary?.githubMutationPerformed === false, "Router decision must not mutate GitHub.");
    ensure(Array.isArray(routerDecision.decisions) && routerDecision.decisions.length >= 4, "Router decision artifact must include decisions.");
    for (const decision of routerDecision.decisions || []) {
      ensure(decision.routeEligible === false, `Router decision ${decision.id} routeEligible must be false.`);
      ensure(decision.executionPerformed === false, `Router decision ${decision.id} executionPerformed must be false.`);
      ensure(decision.fallbackUsed === false, `Router decision ${decision.id} fallbackUsed must be false.`);
      ensure(Array.isArray(decision.blockedReasons) && decision.blockedReasons.length > 0, `Router decision ${decision.id} needs blocked reasons.`);
    }
  }

  if (packageJson) {
    checks.packageScripts = {
      obsidianDryRun: packageJson.scripts?.["check:seis-obsidian-safe-import-dry-run"] || null,
      obsidianDryRunReport: packageJson.scripts?.["report:seis-obsidian-safe-import-dry-run"] || null,
      routerDecision: packageJson.scripts?.["check:seis-read-only-model-router-decision"] || null,
      routerDecisionReport: packageJson.scripts?.["report:seis-read-only-model-router-decision"] || null,
      accessibilityFocus: packageJson.scripts?.["check:seis-second-brain-accessibility-focus-report"] || null,
      accessibilityFocusReport: packageJson.scripts?.["report:seis-second-brain-accessibility-focus-report"] || null,
      agentRegistry: packageJson.scripts?.["check:seis-second-brain-agent-registry"] || null,
      agentRegistryReport: packageJson.scripts?.["report:seis-second-brain-agent-registry"] || null,
      publicReviewerPack: packageJson.scripts?.["check:seis-second-brain-public-reviewer-pack"] || null,
      publicReviewerPackReport: packageJson.scripts?.["report:seis-second-brain-public-reviewer-pack"] || null,
      securityGate: packageJson.scripts?.["check:seis-public-demo-security-gate"] || null,
      securityGateReport: packageJson.scripts?.["report:seis-public-demo-security-gate"] || null,
      goNoGo: packageJson.scripts?.["check:seis-public-demo-go-no-go"] || null,
      goNoGoStrict: packageJson.scripts?.["check:seis-public-demo-go-no-go:strict"] || null
    };
    ensure(
      packageJson.scripts?.["check:seis-obsidian-safe-import-dry-run"] === "node scripts/create-seis-obsidian-safe-import-dry-run.mjs --check",
      "package.json must expose check:seis-obsidian-safe-import-dry-run."
    );
    ensure(
      packageJson.scripts?.["report:seis-obsidian-safe-import-dry-run"] === "node scripts/create-seis-obsidian-safe-import-dry-run.mjs --write",
      "package.json must expose report:seis-obsidian-safe-import-dry-run."
    );
    ensure(
      packageJson.scripts?.["check:seis-read-only-model-router-decision"] === "node scripts/create-seis-read-only-model-router-decision.mjs --check",
      "package.json must expose check:seis-read-only-model-router-decision."
    );
    ensure(
      packageJson.scripts?.["report:seis-read-only-model-router-decision"] === "node scripts/create-seis-read-only-model-router-decision.mjs --write",
      "package.json must expose report:seis-read-only-model-router-decision."
    );
    ensure(
      packageJson.scripts?.["check:seis-second-brain-accessibility-focus-report"] === "node scripts/create-seis-second-brain-accessibility-focus-report.mjs --check",
      "package.json must expose check:seis-second-brain-accessibility-focus-report."
    );
    ensure(
      packageJson.scripts?.["report:seis-second-brain-accessibility-focus-report"] === "node scripts/create-seis-second-brain-accessibility-focus-report.mjs --write",
      "package.json must expose report:seis-second-brain-accessibility-focus-report."
    );
    ensure(
      packageJson.scripts?.["check:seis-second-brain-agent-registry"] === "node scripts/create-seis-second-brain-agent-registry.mjs --check",
      "package.json must expose check:seis-second-brain-agent-registry."
    );
    ensure(
      packageJson.scripts?.["report:seis-second-brain-agent-registry"] === "node scripts/create-seis-second-brain-agent-registry.mjs --write",
      "package.json must expose report:seis-second-brain-agent-registry."
    );
    ensure(
      packageJson.scripts?.["check:seis-second-brain-public-reviewer-pack"] === "node scripts/create-seis-second-brain-public-reviewer-pack.mjs --check",
      "package.json must expose check:seis-second-brain-public-reviewer-pack."
    );
    ensure(
      packageJson.scripts?.["report:seis-second-brain-public-reviewer-pack"] === "node scripts/create-seis-second-brain-public-reviewer-pack.mjs --write",
      "package.json must expose report:seis-second-brain-public-reviewer-pack."
    );
    ensure(
      packageJson.scripts?.["check:seis-public-demo-security-gate"] === "node scripts/create-seis-public-demo-security-gate-report.mjs --check",
      "package.json must expose check:seis-public-demo-security-gate."
    );
    ensure(
      packageJson.scripts?.["report:seis-public-demo-security-gate"] === "node scripts/create-seis-public-demo-security-gate-report.mjs --write",
      "package.json must expose report:seis-public-demo-security-gate."
    );
    ensure(
      packageJson.scripts?.["check:seis-public-demo-go-no-go"] === "node scripts/check-seis-public-demo-go-no-go.mjs",
      "package.json must expose check:seis-public-demo-go-no-go."
    );
    ensure(
      packageJson.scripts?.["check:seis-public-demo-go-no-go:strict"] === "node scripts/check-seis-public-demo-go-no-go.mjs --require-ready",
      "package.json must expose check:seis-public-demo-go-no-go:strict."
    );
  }
}

function validateDocs() {
  const required = [
    [files.releaseDoc, ["Public Demo Release Checklist", "check:seis-public-demo-go-no-go", "report:seis-obsidian-safe-import-dry-run", "report:seis-read-only-model-router-decision", "report:seis-second-brain-accessibility-focus-report", "report:seis-second-brain-agent-registry", "report:seis-second-brain-public-reviewer-pack", "report:seis-public-demo-security-gate", "obsidian-safe-import-dry-run-latest", "read-only-model-router-decision-latest", "second-brain-accessibility-focus-latest", "second-brain-agent-registry-latest", "second-brain-public-reviewer-pack-latest", "security-gate-redacted-latest", "NO-GO", "Do not merge PR #54"]],
    [files.secondBrainDoc, ["Agent training pack", "Second Brain agent registry artifact", "check:seis-public-demo-go-no-go", "Build Training Pack"]],
    [files.statusDoc, ["SEIS public demo go/no-go gate", "check:seis-public-demo-go-no-go"]],
    [files.nextQueue, ["SEIS public demo go/no-go gate", "check:seis-public-demo-go-no-go"]]
  ];

  for (const [filePath, phrases] of required) {
    const text = readText(filePath, filePath);
    for (const phrase of phrases) {
      ensure(text.includes(phrase), `${filePath} missing phrase: ${phrase}`);
    }
  }
}

function validateGitState() {
  const status = run("git", ["status", "--short"]);
  const dirtyLines = status.stdout.split("\n").filter(Boolean);
  checks.git = {
    commandStatus: status.status,
    dirtyCount: dirtyLines.length,
    dirtyPaths: dirtyLines
  };

  if (status.status !== 0) {
    failures.push("git status --short failed.");
    return;
  }

  if (dirtyLines.length > 0 && !allowDirtyWorktree) blockers.push("dirty-worktree");
}

function runFastValidation() {
  const commands = [
    ["npm", ["run", "check:seis-obsidian-safe-import-dry-run"], {}],
    ["npm", ["run", "check:seis-read-only-model-router-decision"], {}],
    ["npm", ["run", "check:seis-second-brain-accessibility-focus-report"], {}],
    ["npm", ["run", "check:seis-second-brain-agent-registry"], {}],
    ["npm", ["run", "check:seis-second-brain-public-reviewer-pack"], {}],
    ["npm", ["run", "check:seis-public-demo-security-gate"], {}],
    ["npm", ["run", "check:seis-second-brain-readiness-contracts"], { SEIS_PUBLIC_DEMO_REPORT_GENERATING: "1" }],
    ["npm", ["run", "check:seis-second-brain"], {}],
    ["git", ["diff", "--check"], {}]
  ];

  checks.fastValidation = commands.map(([command, commandArgs, extraEnv]) => {
    const result = run(command, commandArgs, extraEnv);
    const label = [command, ...commandArgs].join(" ");
    if (result.status !== 0) failures.push(`fast validation failed: ${label}`);
    return {
      command: label,
      status: result.status,
      stdout: result.stdout.slice(0, 4000),
      stderr: result.stderr.slice(0, 4000)
    };
  });
}

function validateNoSecrets() {
  for (const filePath of Object.values(files)) {
    requireNotMatches(filePath, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API key");
    requireNotMatches(filePath, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private key block");
    requireNotMatches(filePath, /\b(?:password|token|secret|api[_-]?key)\s*=\s*['"][^'"]+['"]/i, "inline credential assignment");
  }
}

function nextActions(items, validationFailures) {
  const actions = [];
  if (validationFailures.length > 0) actions.push("Fix release gate contract failures before reviewing public demo readiness.");
  if (items.includes("dirty-worktree")) actions.push("Review and stage only coherent release-candidate changes, or rerun with --allow-dirty-worktree for a planning-only report.");
  if (items.includes("security-full-history-remediation-needed")) actions.push("Resolve the GitHub security full-history blocker through explicit owner-approved history remediation, affected-secret rotation, or reviewed security baseline.");
  if (items.includes("current-browser-smoke-evidence-missing")) actions.push("Run current browser-smoke evidence in an environment that can bind localhost and launch Chrome.");
  if (items.includes("human-release-approval-missing")) actions.push("Get explicit human owner approval before merge, Pages publication, release tag, deployment, SSH, live providers, or public launch.");
  return actions;
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

function printHelp() {
  console.log(`Usage:
  npm run check:seis-public-demo-go-no-go
  npm run check:seis-public-demo-go-no-go -- --run-fast-checks
  npm run check:seis-public-demo-go-no-go -- --run-fast-checks --output reports/seis-public-demo/go-no-go-latest.json --markdown reports/seis-public-demo/go-no-go-latest.md --manifest reports/seis-public-demo/evidence-manifest-latest.json --review-packet reports/seis-public-demo/pr54-review-packet-latest.md --worktree-review reports/seis-public-demo/worktree-review-latest.md --stage-plan reports/seis-public-demo/pr54-stage-plan-latest.md
  npm run check:seis-public-demo-go-no-go:strict -- --run-fast-checks --approved --browser-smoke-current-run

This gate is read-only. Normal mode validates that the release decision is
accurately classified. Strict mode exits 1 until every public demo blocker is
resolved.`);
}

function writeJsonReport(targetPath, value) {
  const absolutePath = safeOutputPath(targetPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdownReport(targetPath, value) {
  const absolutePath = safeOutputPath(targetPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, renderMarkdownReport(value));
}

function writeReviewPacket(targetPath, value, manifest) {
  const absolutePath = safeOutputPath(targetPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, renderPr54ReviewPacket(value, manifest));
}

function writeWorktreeReview(targetPath, value) {
  const absolutePath = safeOutputPath(targetPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, renderWorktreeReview(value));
}

function writeStagePlan(targetPath, value) {
  const absolutePath = safeOutputPath(targetPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, renderStagePlan(value));
}

function safeOutputPath(targetPath) {
  const absolutePath = path.resolve(root, targetPath);
  const relativePath = path.relative(root, absolutePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    failures.push(`refusing to write report outside repository: ${targetPath}`);
    return path.join(root, "reports", "seis-public-demo", "go-no-go-refused-output.json");
  }
  return absolutePath;
}

function renderMarkdownReport(value) {
  const blockers = value.blockers.length ? value.blockers.map((item) => `- ${item}`).join("\n") : "- None";
  const failuresText = value.failures.length ? value.failures.map((item) => `- ${item}`).join("\n") : "- None";
  const warningsText = value.warnings.length ? value.warnings.map((item) => `- ${item}`).join("\n") : "- None";
  const actions = value.nextActions.length ? value.nextActions.map((item) => `- ${item}`).join("\n") : "- None";
  const validation = (value.checks.fastValidation || [])
    .map((item) => `- ${item.command}: ${item.status === 0 ? "passed" : "failed"}`)
    .join("\n") || "- Not run";

  return `# SEIS Public Demo Go/No-Go Report

Generated: ${value.checkedAt}
Decision: ${value.decision}
Status: ${value.status}
Mode: ${value.mode}
PR: ${value.pullRequest?.url || "not configured"}
Evidence manifest: ${value.evidenceManifest?.artifactPath || "not written"}

## Fast Validation

${validation}

## Blockers

${blockers}

## Failures

${failuresText}

## Warnings

${warningsText}

## Next Actions

${actions}

## Safety

${value.safety.map((item) => `- ${item}`).join("\n")}
`.trimEnd() + "\n";
}

function renderPr54ReviewPacket(value, manifest) {
  const fastValidation = (value.checks.fastValidation || [])
    .map((item) => `- ${item.command}: ${item.status === 0 ? "passed" : "failed"}`)
    .join("\n") || "- Not run";
  const blockers = value.blockers.length ? value.blockers.map((item) => `- ${item}`).join("\n") : "- None";
  const evidenceRows = manifest.items
    .map((item) => `| ${item.id} | ${item.status} | ${item.evidence || ""} |`)
    .join("\n");

  return `# PR #54 Public Demo Review Packet

Generated: ${value.checkedAt}
Decision: ${value.decision}
Status: ${value.status}
Mode: ${value.mode}
PR: ${value.pullRequest?.url || "not configured"}

## Review Scope

This packet is read-only evidence for PR #54 review. It does not approve merge,
GitHub Pages publication, release tagging, deployment, SSH execution, private
Obsidian import, live provider routing, or production-readiness claims.

## Required Reviewer Decisions

- Confirm whether the dirty worktree is a coherent release-candidate slice.
- Confirm whether current browser-smoke evidence exists for this exact release candidate.
- Confirm whether the human owner explicitly approves public demo release.
- Confirm that Obsidian import, model routing, SSH, deployment, and GitHub publication remain disabled until separately approved.

## Fast Validation

${fastValidation}

## Current Blockers

${blockers}

## Evidence Manifest Summary

| Metric | Count |
| --- | ---: |
| Total | ${manifest.summary.total} |
| Passed | ${manifest.summary.passed} |
| Blocked | ${manifest.summary.blocked} |
| Missing current evidence | ${manifest.summary.missingCurrentEvidence} |
| Failed | ${manifest.summary.failed} |

## Evidence Items

| ID | Status | Evidence |
| --- | --- | --- |
${evidenceRows}

## Final Gate

Do not merge PR #54, publish GitHub Pages, tag a release, deploy, import a
private Obsidian vault, enable live provider routing, execute SSH, or announce a
public demo until the strict gate reports GO with explicit approval and current
browser-smoke evidence.
`.trimEnd() + "\n";
}

function renderWorktreeReview(value) {
  const groups = value.groups
    .map((group) => `## ${group.label}

Status: ${group.releaseScope}

${group.items.map((item) => `- ${item.status} ${item.path}`).join("\n") || "- None"}
`)
    .join("\n");

  return `# SEIS Public Demo Worktree Review

Generated: ${value.generatedAt}
Decision: ${value.decision}
Release blocking: ${value.summary.releaseBlocking ? "yes" : "no"}
Dirty paths: ${value.summary.dirtyCount}
Workstreams: ${value.summary.workstreamCount}

## Review Rule

This is a read-only worktree classification for PR #54 public demo review. It
does not stage, commit, push, merge, delete, reset, deploy, import Obsidian,
execute SSH, or call model providers.

Dirty paths remain release-blocking until a human reviews the slice, unrelated
work is separated or approved, current browser evidence is present, and release
approval exists.

${groups}
`.trimEnd() + "\n";
}

function renderStagePlan(value) {
  const candidateLines = value.candidatePaths.map((item) => `- ${item.status} ${item.path}`).join("\n") || "- None";
  const excludedLines = value.excludedPaths.map((item) => `- ${item.status} ${item.path} (${item.group})`).join("\n") || "- None";
  const addCommands = value.safeHumanCommands.gitAdd.map((command) => `- \`${command}\``).join("\n") || "- None";
  const validation = value.validationCommands.map((command) => `- \`${command}\``).join("\n");
  const forbidden = value.forbiddenActions.map((action) => `- ${action}`).join("\n");

  return `# PR #54 Stage Plan

Generated: ${value.generatedAt}
Decision: ${value.decision}
Status: ${value.status}
Ready for human review: ${value.summary.readyForHumanReview ? "yes" : "no"}
Candidate paths: ${value.summary.candidatePathCount}
Excluded paths: ${value.summary.excludedPathCount}

## Scope

This is a read-only stage plan for the Second Brain readiness / PR #54 public
demo gate slice. It does not run Git commands, stage files, commit, push, merge,
delete, reset, deploy, import Obsidian, execute SSH, or call model providers.

## Candidate Paths For One Review Slice

${candidateLines}

## Excluded Separate Workstreams

${excludedLines}

## Human-Run Git Add Commands

Run only after reviewing the diff and confirming these paths belong in the same
PR #54 readiness slice:

${addCommands}

## Required Validation Before Commit

${validation}

## Forbidden Actions

${forbidden}
`.trimEnd() + "\n";
}

function buildWorktreeReview(value) {
  const dirty = value.checks.git?.dirtyPaths || [];
  const groupsByKey = new Map();
  for (const rawLine of dirty) {
    const item = parseDirtyLine(rawLine);
    const group = classifyDirtyPath(item.path);
    if (!groupsByKey.has(group.key)) {
      groupsByKey.set(group.key, {
        ...group,
        items: []
      });
    }
    groupsByKey.get(group.key).items.push(item);
  }
  const groups = [...groupsByKey.values()].sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
  return {
    id: "seis-public-demo-worktree-review-pr54",
    title: "SEIS Public Demo Worktree Review After PR 54 Review",
    generatedAt: value.checkedAt,
    decision: value.decision,
    status: value.status,
    pullRequest: value.pullRequest,
    summary: {
      dirtyCount: dirty.length,
      workstreamCount: groups.length,
      releaseBlocking: dirty.length > 0,
      groups: groups.map((group) => ({
        key: group.key,
        label: group.label,
        count: group.items.length,
        releaseScope: group.releaseScope
      }))
    },
    groups,
    safety: value.safety
  };
}

function buildStagePlan(value, worktreeReview) {
  const candidateGroup = worktreeReview.groups.find((group) => group.key === "second-brain-readiness");
  const candidatePaths = (candidateGroup?.items || []).map((item) => ({ ...item, group: candidateGroup.label }));
  const excludedPaths = worktreeReview.groups
    .filter((group) => group.key !== "second-brain-readiness")
    .flatMap((group) => group.items.map((item) => ({ ...item, group: group.label })));
  const candidateAddPaths = candidatePaths.map((item) => item.path).filter(Boolean);

  return {
    id: "seis-public-demo-pr54-stage-plan",
    title: "SEIS PR #54 Second Brain Readiness Stage Plan",
    generatedAt: value.checkedAt,
    decision: value.decision,
    status: value.status,
    pullRequest: value.pullRequest,
    summary: {
      candidatePathCount: candidatePaths.length,
      excludedPathCount: excludedPaths.length,
      readyForHumanReview: candidatePaths.length > 0 && value.blockers.includes("dirty-worktree")
    },
    candidatePaths,
    excludedPaths,
    safeHumanCommands: {
      gitAdd: chunk(candidateAddPaths, 8).map((paths) => `git add -- ${paths.map(shellQuote).join(" ")}`),
      gitCommitTemplate: "git commit -m \"docs: add SEIS Second Brain readiness release gates\""
    },
    validationCommands: [
      "npm run check:seis-second-brain",
      "npm run check:seis-second-brain-readiness-contracts",
      "npm run check:seis-second-brain-agent-registry",
      "npm run check:seis-second-brain-browser-smoke",
      "npm run check:seis-public-demo-go-no-go -- --run-fast-checks --browser-smoke-current-run",
      "git diff --check"
    ],
    forbiddenActions: [
      "Do not stage excluded separate-workstream paths without explicit review.",
      "Do not push, merge, tag, deploy, publish GitHub Pages, import Obsidian, execute SSH, or call model providers from this plan.",
      "Do not commit secrets, private vault content, provider keys, SSH keys, .env values, or private workspace state.",
      "Do not use git reset, checkout, clean, or file deletion to make the tree look clean."
    ],
    safety: value.safety
  };
}

function parseDirtyLine(line) {
  const status = line.slice(0, 2).trim() || line.slice(0, 2);
  return {
    status,
    path: line.slice(3).trim()
  };
}

function chunk(values, size) {
  const chunks = [];
  for (let index = 0; index < values.length; index += size) chunks.push(values.slice(index, index + size));
  return chunks;
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function classifyDirtyPath(filePath) {
  const rules = [
    {
      key: "second-brain-readiness",
      label: "Second Brain Readiness And PR #54 Gate",
      order: 1,
      releaseScope: "candidate-scope-needs-review",
      matches: [
        ".gitignore",
        "content/development/seis-obsidian-bridge-safe-import-contract.json",
        "content/development/seis-public-demo-release-checklist-pr54.json",
        "content/development/seis-read-only-model-router-contract.json",
        "content/development/seis-second-brain-accessibility-focus-qa.json",
        "content/development/seis-second-brain-system.json",
        "docs/product/seis-obsidian-bridge-safe-import.md",
        "docs/product/seis-second-brain.md",
        "docs/releases/PUBLIC_DEMO_RELEASE_CHECKLIST_PR54.md",
        "docs/reviews/SECOND_BRAIN_ACCESSIBILITY_FOCUS_QA.md",
        "docs/INDEX.md",
        "docs/SEIS_MASTER_INDEX.md",
        "docs/STATUS.md",
        "docs/roadmap/MASTER_BACKLOG.md",
        "docs/roadmap/NEXT_PR_QUEUE.md",
        "docs/ai/read-only-model-router-contract.md",
        "docs/ai/model-router.md",
        "scripts/check-seis-second-brain.mjs",
        "scripts/check-seis-second-brain-browser-smoke.mjs",
        "scripts/check-seis-second-brain-readiness-contracts.mjs",
        "scripts/create-seis-obsidian-safe-import-dry-run.mjs",
        "scripts/create-seis-read-only-model-router-decision.mjs",
        "scripts/create-seis-second-brain-accessibility-focus-report.mjs",
        "scripts/create-seis-second-brain-agent-registry.mjs",
        "scripts/create-seis-second-brain-public-reviewer-pack.mjs",
        "scripts/check-seis-public-demo-go-no-go.mjs",
        "reports/seis-public-demo/",
        "apps/web/desktop.js",
        "package.json",
        "README.md"
      ]
    },
    {
      key: "nvidia-catalog",
      label: "NVIDIA Catalog Intake",
      order: 2,
      releaseScope: "separate-workstream-needs-review",
      matches: ["scripts/plan-nvidia-catalog-install.mjs"],
      contains: ["nvidia"]
    },
    {
      key: "google-workspace",
      label: "Google Workspace Integration",
      order: 3,
      releaseScope: "separate-workstream-needs-review",
      matches: ["integrations/README.md", "integrations/google-workspace.json"],
      contains: ["google-workspace"]
    },
    {
      key: "reference-bank",
      label: "Reference Bank / Linux Replica",
      order: 4,
      releaseScope: "separate-workstream-needs-review",
      matches: ["apps/web/reference-banks/", "apps/web/seis-linux-replica.html", "scripts/check-seis-linux-replica-browser-smoke.mjs"]
    }
  ];

  const normalized = filePath.toLowerCase();
  for (const rule of rules) {
    if (
      rule.matches.some((match) => matchesDirtyPath(normalized, match.toLowerCase()))
      || (rule.contains || []).some((match) => normalized.includes(match.toLowerCase()))
    ) {
      return {
        key: rule.key,
        label: rule.label,
        order: rule.order,
        releaseScope: rule.releaseScope
      };
    }
  }
  return {
    key: "unclassified",
    label: "Unclassified Dirty Paths",
    order: 99,
    releaseScope: "needs-human-review"
  };
}

function matchesDirtyPath(filePath, match) {
  if (match.endsWith("/")) return filePath.startsWith(match);
  return filePath === match;
}

function buildEvidenceManifest(value) {
  const fastValidationItems = (value.checks.fastValidation || []).map((item) => ({
    id: commandId(item.command),
    type: "command",
    requirement: item.command,
    status: item.status === 0 ? "passed" : "failed",
    evidence: item.status === 0 ? "Command exited 0 in the current run." : "Command failed in the current run.",
    command: item.command
  }));
  const items = [
    {
      id: "second-brain-local-demo-boundary",
      type: "contract",
      requirement: "Second Brain remains browser-local Local Demo before public release.",
      status: value.checks.secondBrain?.status === "local-demo" ? "passed" : "failed",
      evidence: files.secondBrain
    },
    {
      id: "obsidian-private-import-disabled",
      type: "contract",
      requirement: "Private Obsidian import and host vault reads remain disabled.",
      status: value.checks.obsidian?.privateVaultImportEnabled === false && value.checks.obsidian?.hostVaultReadEnabled === false ? "passed" : "failed",
      evidence: files.obsidian
    },
    {
      id: "read-only-router-boundary",
      type: "contract",
      requirement: "Provider router remains read-only, provider-neutral, and no-secret.",
      status: value.checks.router?.providerCalls === false && value.checks.router?.browserSecrets === false && value.checks.router?.silentFallback === false ? "passed" : "failed",
      evidence: files.router
    },
    {
      id: "accessibility-focus-contract-active",
      type: "contract",
      requirement: "Second Brain accessibility/focus QA contract stays active and linked to browser smoke.",
      status: value.checks.accessibility?.status === "contract-active" ? "passed" : "failed",
      evidence: files.accessibility
    },
    {
      id: "accessibility-focus-qa-artifact",
      type: "artifact",
      requirement: "Second Brain accessibility/focus QA artifact exists and keeps human review blockers visible.",
      status:
        value.checks.accessibilityFocus?.mode === "repo-static-and-browser-smoke-evidence"
        && value.checks.accessibilityFocus?.decision === "NO-GO-human-accessibility-review-required"
        && value.checks.accessibilityFocus?.automatedFailed === 0
          ? "passed"
          : "failed",
      evidence: files.accessibilityFocusJson
    },
    {
      id: "second-brain-agent-registry",
      type: "artifact",
      requirement: "Second Brain agent registry artifact exists and keeps installed AI, sub-agent, Obsidian, plugin, and MCP boundaries review-only.",
      status:
        value.checks.agentRegistry?.mode === "repo-local-no-live-execution"
        && value.checks.agentRegistry?.decision === "NO-GO-autonomous-execution-not-approved"
        && (value.checks.agentRegistry?.installedAiProfileCount || 0) >= 6
        && (value.checks.agentRegistry?.autonomousAgentRosterCount || 0) >= 12
          ? "passed"
          : "failed",
      evidence: files.agentRegistryJson
    },
    {
      id: "obsidian-safe-import-dry-run",
      type: "artifact",
      requirement: "Repo-owned Obsidian safe-import dry-run manifest exists and proves no private vault read.",
      status:
        value.checks.obsidianDryRun?.mode === "dry-run-no-private-vault-read"
        && value.checks.obsidianDryRun?.selectedByUser === false
        && value.checks.obsidianDryRun?.humanApprovalState === "not-requested"
          ? "passed"
          : "failed",
      evidence: files.obsidianDryRunJson
    },
    {
      id: "read-only-router-decision",
      type: "artifact",
      requirement: "Provider-neutral read-only router decision artifact exists and proves no live provider routing.",
      status:
        value.checks.routerDecision?.mode === "provider-neutral-read-only"
        && value.checks.routerDecision?.decision === "NO-GO-live-routing-not-approved"
        && (value.checks.routerDecision?.decisionCount || 0) >= 4
          ? "passed"
          : "failed",
      evidence: files.routerDecisionJson
    },
    {
      id: "security-gate-redacted-evidence",
      type: "artifact",
      requirement: "Public demo security gate has redacted current-tree and full-history evidence before release review.",
      status:
        value.checks.securityGate?.currentTreeStatus === "clean-redacted-no-git"
        && value.checks.securityGate?.currentTreeFindings === 0
        && value.checks.securityGate?.fullHistoryStatus === "blocked-redacted-findings"
        && value.checks.securityGate?.rawSecretValuesStored === false
          ? "blocked"
          : "failed",
      evidence: files.securityGateJson
    },
    {
      id: "second-brain-public-reviewer-pack",
      type: "artifact",
      requirement: "GitHub reviewers have a no-key Second Brain review pack before public demo review.",
      status:
        value.checks.publicReviewerPack?.mode === "github-public-review-no-private-data"
        && value.checks.publicReviewerPack?.decision === "NO-GO-review-pack-does-not-approve-release"
        && value.checks.publicReviewerPack?.requiresApiKeys === false
        && value.checks.publicReviewerPack?.requiresPrivateObsidianVault === false
        && (value.checks.publicReviewerPack?.quickStartCount || 0) >= 5
          ? "passed"
          : "failed",
      evidence: files.publicReviewerPackJson
    },
    {
      id: "go-no-go-report-json",
      type: "artifact",
      requirement: "Machine-readable go/no-go report exists for PR review.",
      status: outputPath ? "passed" : "not-requested",
      evidence: outputPath || null
    },
    {
      id: "go-no-go-report-markdown",
      type: "artifact",
      requirement: "Reader-facing go/no-go report exists for PR review.",
      status: markdownPath ? "passed" : "not-requested",
      evidence: markdownPath || null
    },
    {
      id: "pr54-review-packet",
      type: "artifact",
      requirement: "PR #54 review packet exists for public demo release review.",
      status: reviewPacketPath ? "passed" : "not-requested",
      evidence: reviewPacketPath || null
    },
    {
      id: "worktree-review-packet",
      type: "artifact",
      requirement: "Dirty worktree is classified for PR #54 release-candidate review.",
      status: worktreeReviewPath ? "passed" : "not-requested",
      evidence: worktreeReviewPath || null
    },
    {
      id: "pr54-stage-plan",
      type: "artifact",
      requirement: "PR #54 stage plan separates the Second Brain readiness slice from unrelated workstreams.",
      status: stagePlanPath ? "passed" : "not-requested",
      evidence: stagePlanPath || null
    },
    {
      id: "current-browser-smoke",
      type: "runtime-evidence",
      requirement: "Current Second Brain browser smoke evidence exists for this release candidate.",
      status: value.blockers.includes("current-browser-smoke-evidence-missing") ? "missing-current-evidence" : "passed",
      evidence: "npm run check:seis-second-brain-browser-smoke"
    },
    {
      id: "release-worktree-review",
      type: "repository-state",
      requirement: "Release candidate worktree has been reviewed and is not carrying unrelated dirty files.",
      status: value.blockers.includes("dirty-worktree") ? "blocked" : "passed",
      evidence: "git status --short"
    },
    {
      id: "human-release-approval",
      type: "approval",
      requirement: "Human owner explicitly approves public demo release.",
      status: value.blockers.includes("human-release-approval-missing") ? "blocked" : "passed",
      evidence: "explicit approval required"
    },
    ...fastValidationItems
  ];

  return {
    id: "seis-public-demo-evidence-manifest-pr54",
    title: "SEIS Public Demo Evidence Manifest After PR 54 Review",
    generatedAt: value.checkedAt,
    decision: value.decision,
    status: value.status,
    mode: value.mode,
    pullRequest: value.pullRequest,
    summary: summarizeEvidence(items),
    items,
    safety: value.safety
  };
}

function commandId(command) {
  return command
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function summarizeEvidence(items) {
  return {
    total: items.length,
    passed: items.filter((item) => item.status === "passed").length,
    blocked: items.filter((item) => item.status === "blocked").length,
    missingCurrentEvidence: items.filter((item) => item.status === "missing-current-evidence").length,
    failed: items.filter((item) => item.status === "failed").length,
    notRequested: items.filter((item) => item.status === "not-requested").length
  };
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(path.join(root, filePath))) failures.push(`missing ${label}: ${filePath}`);
}

function ensureIncludes(values, expected, label) {
  ensure(Array.isArray(values), `${label} must be an array.`);
  ensure(Array.isArray(values) && values.includes(expected), `${label} missing ${expected}.`);
}

function ensureListEntryContains(values, expected, label) {
  ensure(Array.isArray(values), `${label} must be an array.`);
  ensure(
    Array.isArray(values) && values.some((value) => String(value).includes(expected)),
    `${label} missing entry containing ${expected}.`
  );
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
    failures.push(`invalid JSON in ${label}: ${error.message}`);
    return null;
  }
}

function requireNotMatches(filePath, pattern, label) {
  const text = readText(filePath, filePath);
  if (pattern.test(text)) failures.push(`${filePath} contains ${label}.`);
}

function run(command, commandArgs, extraEnv = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    env: { ...process.env, ...extraEnv },
    encoding: "utf8"
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error?.message || null
  };
}

function unique(values) {
  return Array.from(new Set(values));
}
