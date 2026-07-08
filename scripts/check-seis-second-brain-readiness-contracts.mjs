#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const reportGenerating = process.env.SEIS_PUBLIC_DEMO_REPORT_GENERATING === "1";

const paths = {
  obsidianContract: "content/development/seis-obsidian-bridge-safe-import-contract.json",
  secondBrain: "content/development/seis-second-brain-system.json",
  accessibilityContract: "content/development/seis-second-brain-accessibility-focus-qa.json",
  routerContract: "content/development/seis-read-only-model-router-contract.json",
  releaseChecklist: "content/development/seis-public-demo-release-checklist-pr54.json",
  obsidianDoc: "docs/product/seis-obsidian-bridge-safe-import.md",
  accessibilityDoc: "docs/reviews/SECOND_BRAIN_ACCESSIBILITY_FOCUS_QA.md",
  routerDoc: "docs/ai/read-only-model-router-contract.md",
  releaseDoc: "docs/releases/PUBLIC_DEMO_RELEASE_CHECKLIST_PR54.md",
  secondBrainDoc: "docs/product/seis-second-brain.md",
  modelRouterDoc: "docs/ai/model-router.md",
  publicDemoGoNoGo: "scripts/check-seis-public-demo-go-no-go.mjs",
  publicDemoReportJson: "reports/seis-public-demo/go-no-go-latest.json",
  publicDemoReportMarkdown: "reports/seis-public-demo/go-no-go-latest.md",
  publicDemoEvidenceManifest: "reports/seis-public-demo/evidence-manifest-latest.json",
  publicDemoReviewPacket: "reports/seis-public-demo/pr54-review-packet-latest.md",
  publicDemoWorktreeReview: "reports/seis-public-demo/worktree-review-latest.md",
  publicDemoStagePlan: "reports/seis-public-demo/pr54-stage-plan-latest.md",
  obsidianDryRunScript: "scripts/create-seis-obsidian-safe-import-dry-run.mjs",
  obsidianDryRunJson: "reports/seis-public-demo/obsidian-safe-import-dry-run-latest.json",
  obsidianDryRunMarkdown: "reports/seis-public-demo/obsidian-safe-import-dry-run-latest.md",
  routerDecisionScript: "scripts/create-seis-read-only-model-router-decision.mjs",
  routerDecisionJson: "reports/seis-public-demo/read-only-model-router-decision-latest.json",
  routerDecisionMarkdown: "reports/seis-public-demo/read-only-model-router-decision-latest.md",
  accessibilityFocusScript: "scripts/create-seis-second-brain-accessibility-focus-report.mjs",
  accessibilityFocusJson: "reports/seis-public-demo/second-brain-accessibility-focus-latest.json",
  accessibilityFocusMarkdown: "reports/seis-public-demo/second-brain-accessibility-focus-latest.md",
  agentRegistryScript: "scripts/create-seis-second-brain-agent-registry.mjs",
  agentRegistryJson: "reports/seis-public-demo/second-brain-agent-registry-latest.json",
  agentRegistryMarkdown: "reports/seis-public-demo/second-brain-agent-registry-latest.md",
  publicReviewerPackScript: "scripts/create-seis-second-brain-public-reviewer-pack.mjs",
  publicReviewerPackJson: "reports/seis-public-demo/second-brain-public-reviewer-pack-latest.json",
  publicReviewerPackMarkdown: "reports/seis-public-demo/second-brain-public-reviewer-pack-latest.md",
  securityGateScript: "scripts/create-seis-public-demo-security-gate-report.mjs",
  securityGateJson: "reports/seis-public-demo/security-gate-redacted-latest.json",
  securityGateMarkdown: "reports/seis-public-demo/security-gate-redacted-latest.md",
  securityOwnerHandoffScript: "scripts/create-seis-security-owner-handoff.mjs",
  securityOwnerHandoffJson: "reports/seis-public-demo/security-owner-handoff-latest.json",
  securityOwnerHandoffMarkdown: "reports/seis-public-demo/security-owner-handoff-latest.md",
  securityRemediationPlanJson: "content/development/seis-public-demo-security-remediation-plan-pr127.json",
  securityRemediationPlanDoc: "docs/security/PR127_SECURITY_REMEDIATION_PLAN.md",
  desktopJs: "apps/web/desktop.js",
  desktopCss: "apps/web/desktop.css",
  packageJson: "package.json",
  status: "docs/STATUS.md",
  index: "docs/INDEX.md",
  masterIndex: "docs/SEIS_MASTER_INDEX.md",
  backlog: "docs/roadmap/MASTER_BACKLOG.md",
  nextQueue: "docs/roadmap/NEXT_PR_QUEUE.md",
  readme: "README.md"
};

for (const [label, filePath] of Object.entries(paths)) {
  if (reportGenerating && isGeneratedPublicDemoArtifact(filePath)) continue;
  ensureFile(filePath, label);
}

const obsidianContract = readJson(paths.obsidianContract, "Obsidian bridge safe import contract");
const secondBrain = readJson(paths.secondBrain, "Second Brain contract");
const accessibilityContract = readJson(paths.accessibilityContract, "Second Brain accessibility focus QA contract");
const routerContract = readJson(paths.routerContract, "read-only model-router contract");
const releaseChecklist = readJson(paths.releaseChecklist, "PR 54 public demo release checklist");
const publicDemoReport = reportGenerating ? null : readJson(paths.publicDemoReportJson, "public demo go/no-go report");
const publicDemoEvidenceManifest = reportGenerating ? null : readJson(paths.publicDemoEvidenceManifest, "public demo evidence manifest");
const obsidianDryRun = reportGenerating ? null : readJson(paths.obsidianDryRunJson, "Obsidian safe-import dry-run artifact");
const routerDecision = reportGenerating ? null : readJson(paths.routerDecisionJson, "read-only model-router decision artifact");
const accessibilityFocus = reportGenerating ? null : readJson(paths.accessibilityFocusJson, "Second Brain accessibility/focus artifact");
const agentRegistry = reportGenerating ? null : readJson(paths.agentRegistryJson, "Second Brain agent registry artifact");
const publicReviewerPack = reportGenerating ? null : readJson(paths.publicReviewerPackJson, "Second Brain public reviewer pack artifact");
const securityGate = reportGenerating ? null : readJson(paths.securityGateJson, "public demo security gate redacted artifact");
const securityOwnerHandoff = reportGenerating ? null : readJson(paths.securityOwnerHandoffJson, "security owner handoff artifact");
const securityRemediationPlan = readJson(paths.securityRemediationPlanJson, "PR 127 security remediation plan");
const desktopJs = readText(paths.desktopJs, "Desktop runtime");
const desktopCss = readText(paths.desktopCss, "Desktop styles");
const packageJson = readJson(paths.packageJson, "package.json");

if (obsidianContract) validateObsidianContract(obsidianContract);
if (accessibilityContract) validateAccessibilityContract(accessibilityContract);
if (routerContract) validateRouterContract(routerContract);
if (releaseChecklist) validateReleaseChecklist(releaseChecklist);
if (publicDemoReport && publicDemoEvidenceManifest) validatePublicDemoArtifacts(publicDemoReport, publicDemoEvidenceManifest);
if (obsidianDryRun) validateObsidianDryRun(obsidianDryRun);
if (routerDecision && routerContract && secondBrain) validateRouterDecision(routerDecision, routerContract, secondBrain);
if (accessibilityFocus && accessibilityContract && secondBrain) validateAccessibilityFocus(accessibilityFocus, accessibilityContract, secondBrain);
if (agentRegistry && secondBrain) validateAgentRegistry(agentRegistry, secondBrain);
if (publicReviewerPack) validatePublicReviewerPack(publicReviewerPack);
if (securityGate) validateSecurityGate(securityGate);
if (securityOwnerHandoff) validateSecurityOwnerHandoff(securityOwnerHandoff);
if (securityRemediationPlan) validateSecurityRemediationPlan(securityRemediationPlan);
if (packageJson) validatePackage(packageJson);
validateDesktopAccessibility(desktopJs, desktopCss);
validateDocsAndIndexes();
validateNoSecrets();

if (failures.length > 0) {
  console.error("SEIS Second Brain readiness contracts check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS Second Brain readiness contracts check passed.");

function validateObsidianContract(contract) {
  ensure(contract.id === "seis-obsidian-bridge-safe-import-contract", "Obsidian contract id mismatch.");
  ensure(contract.status === "planned-gated", "Obsidian bridge must stay planned-gated.");
  ensure(contract.mode === "explicit-user-selected-import-only", "Obsidian import mode must require explicit user selection.");
  ensure(
    contract.qualityGate === "npm run check:seis-second-brain-readiness-contracts",
    "Obsidian contract must point at the readiness contracts quality gate."
  );
  ensure(contract.currentRuntime?.privateVaultImportEnabled === false, "Private vault import must remain disabled.");
  ensure(contract.currentRuntime?.hostVaultReadEnabled === false, "Host vault reads must remain disabled.");
  ensure(contract.currentRuntime?.externalMutationEnabled === false, "External mutation must remain disabled.");
  ensureIncludes(contract.requiredGates, "explicit user-selected source path", "Obsidian required gates");
  ensureIncludes(contract.requiredGates, "dry-run manifest before any import", "Obsidian required gates");
  ensureIncludes(contract.requiredGates, "no secret values copied", "Obsidian required gates");
  ensureIncludes(contract.requiredGates, "no private note body committed", "Obsidian required gates");
  ensureIncludes(contract.requiredGates, "provenance record for every imported note", "Obsidian required gates");
  ensureIncludes(contract.requiredGates, "human approval before GitHub publication", "Obsidian required gates");
  for (const field of [
    "sourcePathFingerprint",
    "selectedByUser",
    "candidateNoteCount",
    "blockedFileCount",
    "secretScanSummary",
    "provenanceLabels",
    "publishabilityLabels",
    "redactionSummary",
    "humanApprovalState"
  ]) {
    ensureIncludes(contract.dryRunManifestSchema?.requiredFields, field, "Obsidian dry-run manifest schema required fields");
  }
  ensure(contract.dryRunManifestSchema?.bodyImportPolicy === "metadata-only-by-default", "Obsidian dry-run body import policy must stay metadata-only by default.");
  ensureIncludes(contract.importDecisionLabels, "blocked-private", "Obsidian import decision labels");
  ensureIncludes(contract.importDecisionLabels, "blocked-secret-risk", "Obsidian import decision labels");
  ensureIncludes(contract.reviewPacketRequirements, "dry-run manifest path", "Obsidian review packet requirements");
  ensureIncludes(contract.reviewPacketRequirements, "explicit human approval state", "Obsidian review packet requirements");
  ensureIncludes(contract.forbiddenActions, "automatic home-directory vault discovery", "Obsidian forbidden actions");
  ensureIncludes(contract.forbiddenActions, "automatic Obsidian plugin installation", "Obsidian forbidden actions");
  ensureIncludes(contract.forbiddenActions, "committing private note body content", "Obsidian forbidden actions");
  ensureIncludes(contract.forbiddenActions, "copying .obsidian workspace state", "Obsidian forbidden actions");
  ensureIncludes(contract.forbiddenActions, "sending imported note content to AI providers", "Obsidian forbidden actions");
  ensureIncludes(contract.forbiddenActions, "GitHub push, merge, release, or Pages publication without explicit approval", "Obsidian forbidden actions");
}

function validateObsidianDryRun(report) {
  ensure(report.id === "seis-obsidian-safe-import-dry-run-pr54", "Obsidian dry-run artifact id mismatch.");
  ensure(report.title === "SEIS Obsidian Safe Import Dry-Run", "Obsidian dry-run artifact title mismatch.");
  ensure(report.status === "repo-owned-seed-notes-only", "Obsidian dry-run artifact must stay repo-owned seed notes only.");
  ensure(report.mode === "dry-run-no-private-vault-read", "Obsidian dry-run artifact must not read private vaults.");
  ensure(report.decision === "NO-GO-private-vault-import-not-approved", "Obsidian dry-run artifact must block private vault import.");
  ensure(report.contractPath === paths.obsidianContract, "Obsidian dry-run artifact contract path mismatch.");
  ensure(report.secondBrainPath === "content/development/seis-second-brain-system.json", "Obsidian dry-run artifact Second Brain path mismatch.");
  ensure(/^sha256:[a-f0-9]{64}$/.test(String(report.sourcePathFingerprint || "")), "Obsidian dry-run source fingerprint must be hashed.");
  ensure(report.selectedByUser === false, "Obsidian dry-run selectedByUser must be false before explicit user selection.");
  ensure(report.candidateNoteCount >= 6, "Obsidian dry-run must include current repo-owned seed note count.");
  ensure(report.blockedFileCount === 0, "Obsidian dry-run blockedFileCount must be 0 for repo-owned metadata-only seed notes.");
  ensure(Array.isArray(report.blockedPathMatches) && report.blockedPathMatches.length === 0, "Obsidian dry-run blockedPathMatches must be empty.");
  ensure(report.secretScanSummary?.scannedPrivateVault === false, "Obsidian dry-run must not scan private vaults.");
  ensure(report.secretScanSummary?.hostFilesystemScanned === false, "Obsidian dry-run must not scan host filesystem.");
  ensure(report.secretScanSummary?.findings === 0, "Obsidian dry-run secret scan must have zero findings.");
  ensure(report.provenanceLabels?.["repo-owned-seed"] === report.candidateNoteCount, "Obsidian dry-run provenance labels must cover seed notes.");
  ensure(report.publishabilityLabels?.["public-safe-metadata-only"] === report.candidateNoteCount, "Obsidian dry-run publishability labels must cover seed notes.");
  ensure(report.redactionSummary?.privatePathStored === false, "Obsidian dry-run must not store private paths.");
  ensure(report.redactionSummary?.privateBodyTextCopied === false, "Obsidian dry-run must not copy private body text.");
  ensure(report.attachmentReviewSummary?.attachmentsCopied === 0, "Obsidian dry-run must not copy attachments.");
  ensure(report.bodyImportPolicy === "metadata-only-by-default", "Obsidian dry-run body import policy mismatch.");
  ensure(report.humanApprovalState === "not-requested", "Obsidian dry-run human approval state must be not-requested.");
  ensure(report.safetyBoundary?.privateVaultReadPerformed === false, "Obsidian dry-run privateVaultReadPerformed must be false.");
  ensure(report.safetyBoundary?.githubMutationPerformed === false, "Obsidian dry-run githubMutationPerformed must be false.");
  ensure(report.safetyBoundary?.providerCallsPerformed === false, "Obsidian dry-run providerCallsPerformed must be false.");
  ensure(report.safetyBoundary?.sshExecuted === false, "Obsidian dry-run sshExecuted must be false.");
  ensure(!JSON.stringify(report).includes("file://"), "Obsidian dry-run must not include file:// paths.");
  ensure(!JSON.stringify(report).includes("/Users/"), "Obsidian dry-run must not include absolute private /Users paths.");
  for (const field of [
    "sourcePathFingerprint",
    "selectedByUser",
    "candidateNoteCount",
    "blockedFileCount",
    "blockedPathMatches",
    "secretScanSummary",
    "provenanceLabels",
    "publishabilityLabels",
    "redactionSummary",
    "attachmentReviewSummary",
    "bodyImportPolicy",
    "humanApprovalState"
  ]) {
    ensure(Object.hasOwn(report, field), `Obsidian dry-run missing top-level field ${field}.`);
    ensure(Object.hasOwn(report.dryRunManifest || {}, field), `Obsidian dry-run manifest missing field ${field}.`);
  }
}

function validateAccessibilityContract(contract) {
  ensure(contract.id === "seis-second-brain-accessibility-focus-qa", "Accessibility QA contract id mismatch.");
  ensure(contract.status === "contract-active", "Accessibility QA contract must be active.");
  ensure(
    contract.linkedSmoke === "npm run check:seis-second-brain-browser-smoke",
    "Accessibility QA contract must reference the Second Brain browser smoke."
  );
  ensure(contract.reviewArtifact?.json === paths.accessibilityFocusJson, "Accessibility QA review artifact JSON path mismatch.");
  ensure(contract.reviewArtifact?.markdown === paths.accessibilityFocusMarkdown, "Accessibility QA review artifact Markdown path mismatch.");
  ensure(
    contract.reviewArtifact?.qualityGate === "npm run check:seis-second-brain-accessibility-focus-report",
    "Accessibility QA review artifact quality gate mismatch."
  );
  ensure(contract.selectors?.root === "[data-second-brain-app]", "Accessibility root selector mismatch.");
  ensure(contract.selectors?.noteList === ".second-brain-note-list[role=\"listbox\"]", "Accessibility note list selector mismatch.");
  ensure(contract.selectors?.noteOption === ".second-brain-note-list [role=\"option\"]", "Accessibility note option selector mismatch.");
  ensure(contract.selectors?.graphList === ".second-brain-graph[role=\"listbox\"]", "Accessibility graph selector mismatch.");
  ensure(contract.selectors?.graphOption === ".second-brain-graph [role=\"option\"]", "Accessibility graph option selector mismatch.");
  ensure(contract.selectors?.inspector === "#second-brain-inspector-panel[data-second-brain-inspector]", "Accessibility inspector selector mismatch.");
  for (const phrase of [
    "role=listbox",
    "role=option",
    "aria-selected",
    "aria-controls",
    "aria-live polite",
    "focus-visible",
    "zero cramped or overlapping controls"
  ]) {
    ensureIncludes(contract.acceptanceCriteria, phrase, "Accessibility acceptance criteria");
  }
  for (const phrase of [
    "WCAG 2.2 visible focus indicator",
    "keyboard-only path without pointer input",
    "no keyboard trap",
    "logical focus order matches visual reading order",
    "reduced motion respected for graph state"
  ]) {
    ensureIncludes(contract.wcagFocusChecks, phrase, "Accessibility WCAG/focus checks");
  }
  for (const phrase of [
    "current browser smoke result",
    "manual keyboard transcript",
    "screen-reader transcript",
    "mobile viewport target audit",
    "human accessibility review approval"
  ]) {
    ensureIncludes(contract.evidenceRequiredBeforePublicDemo, phrase, "Accessibility evidence requirements");
  }
}

function validateAccessibilityFocus(report, contract, secondBrainContract) {
  ensure(report.id === "seis-second-brain-accessibility-focus-qa-pr54", "Accessibility focus artifact id mismatch.");
  ensure(report.title === "SEIS Second Brain Accessibility Focus QA", "Accessibility focus artifact title mismatch.");
  ensure(report.status === "review-gated-human-accessibility-needed", "Accessibility focus artifact status mismatch.");
  ensure(report.mode === "repo-static-and-browser-smoke-evidence", "Accessibility focus artifact mode mismatch.");
  ensure(report.decision === "NO-GO-human-accessibility-review-required", "Accessibility focus artifact must block public release.");
  ensure(report.contractPath === paths.accessibilityContract, "Accessibility focus artifact contract path mismatch.");
  ensure(report.secondBrainPath === "content/development/seis-second-brain-system.json", "Accessibility focus artifact Second Brain path mismatch.");
  ensure(report.linkedSmoke === "npm run check:seis-second-brain-browser-smoke", "Accessibility focus artifact linked smoke mismatch.");
  ensure(report.installedAiProfileCount >= 6, "Accessibility focus artifact must include installed AI profile count.");
  ensure(
    report.installedAiProfileCount === (secondBrainContract.installedAiProfiles || []).length,
    "Accessibility focus artifact installed AI profile count must match the Second Brain source contract exactly."
  );
  ensure(report.managedSubAgentLaneCount >= 6, "Accessibility focus artifact must include managed sub-agent lane count.");
  ensure(report.autonomousAgentRosterCount >= 12, "Accessibility focus artifact must include autonomous agent roster count.");
  ensureArrayMin(report.automatedEvidence, 10, "Accessibility focus automated evidence");
  ensureArrayMin(report.requiredEvidence, 6, "Accessibility focus required evidence");
  ensure(report.summary?.automatedFailed === 0, "Accessibility focus automated evidence must have zero failures.");
  ensure(report.summary?.requiredBlocked >= 3, "Accessibility focus required evidence must keep human-review blockers visible.");
  for (const required of contract.evidenceRequiredBeforePublicDemo || []) {
    ensureListEntryContains((report.requiredEvidence || []).map((item) => item.requirement), required, "Accessibility focus required evidence");
  }
  for (const [key, expected] of [
    ["privateObsidianImportPerformed", false],
    ["providerCallsPerformed", false],
    ["credentialAccessPerformed", false],
    ["sshExecuted", false],
    ["deploymentPerformed", false],
    ["githubMutationPerformed", false],
    ["releaseApprovalGranted", false]
  ]) {
    ensure(report.safetyBoundary?.[key] === expected, `Accessibility focus safety boundary ${key} must be ${expected}.`);
  }
  ensureListEntryContains((report.requiredEvidence || []).map((item) => `${item.id}:${item.status}`), "manual-keyboard-transcript:blocked", "Accessibility focus required evidence statuses");
  ensureListEntryContains((report.requiredEvidence || []).map((item) => `${item.id}:${item.status}`), "screen-reader-transcript:blocked", "Accessibility focus required evidence statuses");
  ensureListEntryContains((report.requiredEvidence || []).map((item) => `${item.id}:${item.status}`), "mobile-assistive-technology-review:blocked", "Accessibility focus required evidence statuses");
  ensureListEntryContains((report.requiredEvidence || []).map((item) => `${item.id}:${item.status}`), "human-accessibility-review-approval:blocked", "Accessibility focus required evidence statuses");
  const serialized = JSON.stringify(report);
  ensure(!serialized.includes("file://"), "Accessibility focus artifact must not include file:// paths.");
  ensure(!serialized.includes("/Users/"), "Accessibility focus artifact must not include absolute private /Users paths.");
  ensure(!/sk-[A-Za-z0-9_-]{20,}/.test(serialized), "Accessibility focus artifact must not include OpenAI-style API keys.");
  ensure(!/-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/.test(serialized), "Accessibility focus artifact must not include private keys.");
  ensure(!/\b(?:password|token|secret|api[_-]?key)\s*=\s*['"][^'"]+['"]/i.test(serialized), "Accessibility focus artifact must not include inline credential assignments.");
}

function validateAgentRegistry(report, secondBrainContract) {
  ensure(report.id === "seis-second-brain-agent-registry-pr54", "Second Brain agent registry artifact id mismatch.");
  ensure(report.title === "SEIS Second Brain Agent Registry", "Second Brain agent registry title mismatch.");
  ensure(report.status === "review-only-agent-registry", "Second Brain agent registry must stay review-only.");
  ensure(report.mode === "repo-local-no-live-execution", "Second Brain agent registry mode mismatch.");
  ensure(report.decision === "NO-GO-autonomous-execution-not-approved", "Second Brain agent registry must block autonomous execution.");
  ensure(report.sourcePaths?.secondBrain === "content/development/seis-second-brain-system.json", "Second Brain agent registry source Second Brain path mismatch.");
  ensure(report.sourcePaths?.aiWorkforce === "content/development/ai-workforce-assignments.json", "Second Brain agent registry source AI workforce path mismatch.");
  ensure(report.sourcePaths?.roleSchema === "content/development/seis-ai-core-agent-role-schema.json", "Second Brain agent registry source role schema path mismatch.");
  ensure(report.secondBrainBinding?.status === "local-demo", "Second Brain agent registry must bind local-demo Second Brain.");
  ensure(report.secondBrainBinding?.privateVaultImportEnabled === false, "Second Brain agent registry must not enable private vault import.");
  ensure(report.secondBrainBinding?.hostVaultReadEnabled === false, "Second Brain agent registry must not enable host vault reads.");
  ensure(report.secondBrainBinding?.githubMutationEnabled === false, "Second Brain agent registry must not enable GitHub mutation.");
  ensure(!String(report.secondBrainBinding?.vaultRoot || "").startsWith("/home/"), "Second Brain agent registry vaultRoot must be public-safe and repo-neutral.");
  ensure(!String(report.secondBrainBinding?.trainingPackPath || "").startsWith("/home/"), "Second Brain agent registry trainingPackPath must be public-safe and repo-neutral.");
  ensure(!String(report.secondBrainBinding?.publicContributorPackPath || "").startsWith("/home/"), "Second Brain agent registry publicContributorPackPath must be public-safe and repo-neutral.");
  ensure(!String(report.secondBrainBinding?.obsidianStarterVaultManifestPath || "").startsWith("/home/"), "Second Brain agent registry Obsidian starter manifest path must be public-safe and repo-neutral.");
  ensure(!String(report.secondBrainBinding?.obsidianStarterVaultGuidePath || "").startsWith("/home/"), "Second Brain agent registry Obsidian starter guide path must be public-safe and repo-neutral.");
  ensure(!String(report.secondBrainBinding?.aiCouncilReviewPackPath || "").startsWith("/home/"), "Second Brain agent registry AI council review pack path must be public-safe and repo-neutral.");
  ensure(report.trainingCoverage?.status === "local-demo-read-only", "Second Brain agent registry training coverage must stay local-demo-read-only.");
  ensure(report.trainingCoverage?.trainingPackPath === report.secondBrainBinding?.trainingPackPath, "Second Brain agent registry training coverage path mismatch.");
  ensure(report.trainingCoverage?.publicContributorPackPath === report.secondBrainBinding?.publicContributorPackPath, "Second Brain agent registry training coverage public contributor path mismatch.");
  ensure(report.trainingCoverage?.obsidianStarterVaultManifestPath === report.secondBrainBinding?.obsidianStarterVaultManifestPath, "Second Brain agent registry training coverage Obsidian starter manifest path mismatch.");
  ensure(report.trainingCoverage?.obsidianStarterVaultGuidePath === report.secondBrainBinding?.obsidianStarterVaultGuidePath, "Second Brain agent registry training coverage Obsidian starter guide path mismatch.");
  ensure(report.trainingCoverage?.aiCouncilReviewPackPath === report.secondBrainBinding?.aiCouncilReviewPackPath, "Second Brain agent registry training coverage AI council review pack path mismatch.");
  ensureArrayMin(report.trainingCoverage?.requiredSections, 6, "Second Brain agent registry training coverage required sections");
  ensureIncludes(report.trainingCoverage?.requiredSections, "public contributor no-key onboarding", "Second Brain agent registry training coverage required sections");
  ensureIncludes(report.trainingCoverage?.requiredSections, "Obsidian starter vault no-private-import export", "Second Brain agent registry training coverage required sections");
  ensureIncludes(report.trainingCoverage?.requiredSections, "installed AI council review pack", "Second Brain agent registry training coverage required sections");
  ensure(report.trainingCoverage?.installedAiCoverage?.requireRegistryRequiredLauncherRoutes === true, "Second Brain agent registry training coverage must require launcher routes.");
  ensure(report.trainingCoverage?.installedAiCoverage?.requireSecondBrainProfileForEachLauncherRoute === true, "Second Brain agent registry training coverage must require Second Brain profiles.");
  ensure(report.trainingCoverage?.installedAiCoverage?.requireNoLiveProviderCalls === true, "Second Brain agent registry training coverage must forbid live provider calls.");
  ensure(report.trainingCoverage?.autonomousAgentCoverage?.requiredRosterCount === 12, "Second Brain agent registry training coverage must require the 12-agent roster.");
  ensure(report.trainingCoverage?.autonomousAgentCoverage?.requireNoWriteExecution === true, "Second Brain agent registry training coverage must block autonomous write execution.");
  ensure(report.trainingCoverage?.obsidianCoverage?.bridgeStatus === "planned", "Second Brain agent registry training coverage Obsidian bridge must stay planned.");
  ensure(report.trainingCoverage?.obsidianCoverage?.bodyImportPolicy === "metadata-only-by-default", "Second Brain agent registry training coverage Obsidian body policy mismatch.");
  ensure(!String(report.trainingCoverage?.obsidianCoverage?.starterVaultManifestPath || "").startsWith("/home/"), "Second Brain agent registry training coverage Obsidian starter manifest path must be public-safe and repo-neutral.");
  ensure(!String(report.trainingCoverage?.obsidianCoverage?.starterVaultGuidePath || "").startsWith("/home/"), "Second Brain agent registry training coverage Obsidian starter guide path must be public-safe and repo-neutral.");
  for (const [field, expected] of [
    ["privateVaultReadAllowed", false],
    ["privateNoteBodyCopyAllowed", false],
    ["pluginInstallAllowed", false]
  ]) {
    ensure(report.trainingCoverage?.obsidianCoverage?.[field] === expected, `Second Brain agent registry training coverage Obsidian ${field} must be ${expected}.`);
  }
  ensureArrayMin(report.trainingCoverage?.qualityGates, 3, "Second Brain agent registry training coverage quality gates");
  ensureArrayMin(report.trainingCoverage?.blockedUntil, 4, "Second Brain agent registry training coverage blockers");
  ensureArrayMin(report.providerProfiles, 6, "Second Brain agent registry provider profiles");
  ensureArrayMin(report.workforceAssignments, 10, "Second Brain agent registry workforce assignments");
  ensureArrayMin(report.subAgentMesh?.managedSubAgentLanes, 6, "Second Brain agent registry managed sub-agent lanes");
  ensureArrayMin(report.subAgentMesh?.autonomousAgentRoster, 12, "Second Brain agent registry autonomous agent roster");
  ensureArrayMin(report.subAgentMesh?.roleSchemaRoles, 5, "Second Brain agent registry role schema roles");
  ensureArrayMin(report.subAgentMesh?.permissionLevels, 5, "Second Brain agent registry permission levels");
  ensure(
    report.summary?.installedAiProfileCount === (secondBrainContract.installedAiProfiles || []).length,
    "Second Brain agent registry installed AI profile count must match the Second Brain source contract exactly."
  );
  ensure(report.summary?.mcpVendorSurfaceCount >= 10, "Second Brain agent registry must include MCP vendor surfaces.");
  ensure(report.summary?.installedSkillCount >= 30, "Second Brain agent registry must include installed skill count.");
  ensure(report.launcherEvidence?.snapshotType === "author-observed-local-snapshot", "Second Brain agent registry launcher evidence must be labeled as a local snapshot.");
  ensure(
    report.launcherEvidence?.runtimeValidationPolicy?.countsInstalledRoutesFromCurrentRuntime === true,
    "Second Brain agent registry launcher evidence must require current runtime installed-route counting."
  );
  ensure(
    report.launcherEvidence?.runtimeValidationPolicy?.snapshotIsNotPublicReadinessClaim === true,
    "Second Brain agent registry launcher evidence snapshot must not be treated as public readiness."
  );
  ensure(report.summary?.snapshotInstalledLauncherRouteCount >= 12, "Second Brain agent registry must include snapshot installed launcher route count.");
  ensureArrayMin(report.requiredEvidenceBeforeAutonomousUse, 8, "Second Brain agent registry required evidence before autonomous use");
  for (const profile of report.providerProfiles || []) {
    ensure(profile.liveProviderRouteEnabled === false, `Second Brain agent registry provider ${profile.profileId} must not enable live routing.`);
    ensure(profile.promptBodyStorageAllowed === false, `Second Brain agent registry provider ${profile.profileId} must not allow prompt body storage.`);
    ensure(profile.credentialAccessAllowed === false, `Second Brain agent registry provider ${profile.profileId} must not allow credential access.`);
  }
  for (const [key, expected] of [
    ["privateObsidianVaultReadPerformed", false],
    ["privateNoteBodyCopied", false],
    ["providerCallsPerformed", false],
    ["credentialValidationPerformed", false],
    ["browserSecretsExposed", false],
    ["promptBodiesStored", false],
    ["autonomousWriteExecutionPerformed", false],
    ["backgroundRunnerEnabled", false],
    ["externalConnectorMutationPerformed", false],
    ["sshExecuted", false],
    ["deploymentPerformed", false],
    ["githubMutationPerformed", false],
    ["releaseApprovalGranted", false]
  ]) {
    ensure(report.safetyBoundary?.[key] === expected, `Second Brain agent registry safety boundary ${key} must be ${expected}.`);
  }
  const serialized = JSON.stringify(report);
  ensure(!serialized.includes("file://"), "Second Brain agent registry must not include file:// paths.");
  ensure(!serialized.includes("/Users/"), "Second Brain agent registry must not include absolute private /Users paths.");
  ensure(!/sk-[A-Za-z0-9_-]{20,}/.test(serialized), "Second Brain agent registry must not include OpenAI-style API keys.");
  ensure(!/-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/.test(serialized), "Second Brain agent registry must not include private keys.");
  ensure(!/\b(?:password|token|secret|api[_-]?key)\s*=\s*['"][^'"]+['"]/i.test(serialized), "Second Brain agent registry must not include inline credential assignments.");
  ensure(!/"(?:promptBodyText|promptText|messages|conversation)"\s*:/i.test(serialized), "Second Brain agent registry must not include prompt body fields.");
}

function validatePublicReviewerPack(report) {
  ensure(report.id === "seis-second-brain-public-reviewer-pack-pr104", "Second Brain public reviewer pack id mismatch.");
  ensure(report.title === "SEIS Second Brain Public Reviewer Pack", "Second Brain public reviewer pack title mismatch.");
  ensure(report.status === "reviewer-ready-no-key-local-demo", "Second Brain public reviewer pack status mismatch.");
  ensure(report.mode === "github-public-review-no-private-data", "Second Brain public reviewer pack mode mismatch.");
  ensure(report.decision === "NO-GO-review-pack-does-not-approve-release", "Second Brain public reviewer pack must not approve release.");
  ensure(report.pullRequest?.number === 104, "Second Brain public reviewer pack must bind PR #104.");
  ensure(report.sourcePaths?.secondBrain === "content/development/seis-second-brain-system.json", "Second Brain public reviewer pack source Second Brain path mismatch.");
  ensure(report.sourcePaths?.securityGate === paths.securityGateJson, "Second Brain public reviewer pack source security gate path mismatch.");
  ensure(report.noKeyLocalDemoContract?.requiresApiKeys === false, "Second Brain public reviewer pack must not require API keys.");
  ensure(report.noKeyLocalDemoContract?.requiresProviderLogin === false, "Second Brain public reviewer pack must not require provider login.");
  ensure(report.noKeyLocalDemoContract?.requiresPrivateObsidianVault === false, "Second Brain public reviewer pack must not require private Obsidian.");
  ensure(report.noKeyLocalDemoContract?.requiresSsh === false, "Second Brain public reviewer pack must not require SSH.");
  ensure(report.noKeyLocalDemoContract?.requiresDeployment === false, "Second Brain public reviewer pack must not require deployment.");
  ensure(report.noKeyLocalDemoContract?.browserLocalDemoOnly === true, "Second Brain public reviewer pack must stay browser-local.");
  ensure(report.noKeyLocalDemoContract?.secondBrainStatus === "local-demo", "Second Brain public reviewer pack must bind the live Second Brain source status.");
  ensure(report.noKeyLocalDemoContract?.agentRegistryStatus === "review-only-agent-registry", "Second Brain public reviewer pack must bind the live agent registry source status.");
  ensure(
    report.noKeyLocalDemoContract?.securityGateDecision === "NO-GO-security-history-remediation-needed",
    "Second Brain public reviewer pack must bind the live security gate decision."
  );
  ensure(report.releaseChecklistSnapshot?.status === "review-gated-not-released", "Second Brain public reviewer pack must bind release checklist status.");
  ensure((report.releaseChecklistSnapshot?.requiredValidationCount || 0) >= 1, "Second Brain public reviewer pack must bind release checklist validations.");
  ensure((report.releaseChecklistSnapshot?.requiredArtifactCount || 0) >= 1, "Second Brain public reviewer pack must bind release checklist artifacts.");
  ensureArrayMin(report.quickStart, 5, "Second Brain public reviewer pack quickStart");
  ensureArrayMin(report.reviewSurfaces, 8, "Second Brain public reviewer pack review surfaces");
  ensureArrayMin(report.reviewerMustConfirm, 6, "Second Brain public reviewer pack reviewer confirmations");
  ensureArrayMin(report.blockedUntilApproval, 8, "Second Brain public reviewer pack approval blockers");
  for (const required of [
    "No API keys required for the core demo.",
    "No private Obsidian vault import was performed.",
    "No live provider routing was performed.",
    "Security history blocker remains until owner-approved remediation."
  ]) {
    ensureIncludes(report.reviewerMustConfirm, required, "Second Brain public reviewer pack reviewer confirmations");
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
    ensureIncludes(report.blockedUntilApproval, blocked, "Second Brain public reviewer pack approval blockers");
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
    ensure(report.safetyBoundary?.[key] === expected, `Second Brain public reviewer pack safety boundary ${key} must be ${expected}.`);
  }
  const serialized = JSON.stringify(report);
  ensure(!serialized.includes("file://"), "Second Brain public reviewer pack must not include file:// paths.");
  ensure(!serialized.includes("/Users/"), "Second Brain public reviewer pack must not include absolute private /Users paths.");
  ensure(!/sk-[A-Za-z0-9_-]{20,}/.test(serialized), "Second Brain public reviewer pack must not include OpenAI-style API keys.");
  ensure(!/-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/.test(serialized), "Second Brain public reviewer pack must not include private key bodies.");
  ensure(!/\b(?:password|token|secret|api[_-]?key)\s*=\s*['"][^'"]+['"]/i.test(serialized), "Second Brain public reviewer pack must not include inline credential assignments.");
}

function validateSecurityGate(report) {
  ensure(report.id === "seis-public-demo-security-gate-redacted-pr104", "Security gate artifact id mismatch.");
  ensure(report.title === "SEIS Public Demo Security Gate Redacted Evidence", "Security gate artifact title mismatch.");
  ensure(report.status === "blocked-full-history-security-review", "Security gate artifact must keep full-history blocker visible.");
  ensure(report.mode === "redacted-local-and-ci-evidence", "Security gate artifact mode mismatch.");
  ensure(report.decision === "NO-GO-security-history-remediation-needed", "Security gate artifact must block public release.");
  ensure(report.pullRequest?.number === 104, "Security gate artifact must bind PR #104.");
  validateActiveGateImpacts(report.activeGateImpacts, "Security gate");
  ensure(report.sourcePaths?.workflow === ".github/workflows/security-guardian.yml", "Security gate workflow source path mismatch.");
  ensure(report.sourcePaths?.currentTreeFixture === "apps/web/test/scripts.test.js", "Security gate current-tree fixture source path mismatch.");
  ensure(
    report.sourcePaths?.historicalGeneratedBundle === "sources/github-unified-source/_generated/github-code-bundle.txt",
    "Security gate historical generated bundle source path mismatch."
  );
  ensure(report.currentTreeSecretScan?.status === "clean-redacted-no-git", "Security gate must record current-tree clean scan.");
  ensure(report.currentTreeSecretScan?.findings === 0, "Security gate current-tree findings must be zero.");
  ensure(report.currentTreeSecretScan?.rawSecretValuesStored === false, "Security gate must not store raw current-tree finding values.");
  ensure(report.currentTreeSecretScan?.securityPolicyChanged === false, "Security gate must not change scanner policy.");
  ensure(report.currentTreeSecretScan?.gitleaksAllowlistCommitted === false, "Security gate must not commit a gitleaks allowlist.");
  ensure(report.fullHistorySecretScan?.status === "blocked-redacted-findings", "Security gate must record full-history blocker.");
  ensure(report.fullHistorySecretScan?.redacted === true, "Security gate full-history scan must be redacted.");
  ensure((report.fullHistorySecretScan?.totalFindings || 0) >= 1, "Security gate must include historical finding count.");
  ensure(report.fullHistorySecretScan?.rawSecretValuesStored === false, "Security gate must not store raw historical finding values.");
  ensure(report.fullHistorySecretScan?.fullJobLogDownloaded === false, "Security gate must not store full job logs.");
  ensureListEntryContains(
    (report.fullHistorySecretScan?.findingsByPath || []).map((item) => item.path),
    "sources/github-unified-source/_generated/github-code-bundle.txt",
    "Security gate historical finding paths"
  );
  ensureListEntryContains(
    (report.fullHistorySecretScan?.blockedCommitRefs || []).map((item) => item.ref),
    "f3d385d",
    "Security gate historical finding commit refs"
  );
  for (const required of [
    "history rewrite or affected path removal from repository history",
    "affected-secret rotation decision by repository owner",
    ".gitleaks.toml security-policy change",
    "reviewed security baseline for historical generated bundle findings"
  ]) {
    ensureIncludes(report.requiredApprovalBeforeRemediation, required, "Security gate approval requirements");
  }
  for (const forbidden of [
    "printing raw finding values",
    "downloading or committing full CI job logs",
    "blanket-allowlisting the generated bundle",
    "weakening the Secret & Vulnerability Scan workflow"
  ]) {
    ensureIncludes(report.forbiddenRemediationWithoutApproval, forbidden, "Security gate forbidden remediation");
  }
  for (const [key, expected] of [
    ["rawSecretValuesStored", false],
    ["privateKeyBodyStored", false],
    ["fullSecurityLogStored", false],
    ["gitleaksPolicyChanged", false],
    ["historyRewritePerformed", false],
    ["forcePushPerformed", false],
    ["secretRotationPerformed", false],
    ["githubMutationPerformedByReport", false],
    ["providerCallsPerformed", false],
    ["sshExecuted", false],
    ["deploymentPerformed", false],
    ["releaseApprovalGranted", false]
  ]) {
    ensure(report.safetyBoundary?.[key] === expected, `Security gate safety boundary ${key} must be ${expected}.`);
  }
  ensure(report.releaseImpact?.mergeAllowed === false, "Security gate must block merge.");
  ensure(report.releaseImpact?.publicDemoReleaseAllowed === false, "Security gate must block public demo release.");
  const serialized = JSON.stringify(report);
  ensure(!serialized.includes("REDACTED"), "Security gate must store categories, not redacted value placeholders.");
  ensure(!serialized.includes("file://"), "Security gate must not include file:// paths.");
  ensure(!serialized.includes("/Users/"), "Security gate must not include absolute private /Users paths.");
  ensure(!/sk-[A-Za-z0-9_-]{20,}/.test(serialized), "Security gate must not include OpenAI-style API keys.");
  ensure(!/-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/.test(serialized), "Security gate must not include private key bodies.");
  ensure(!/\b(?:password|token|secret|api[_-]?key)\s*=\s*['"][^'"]+['"]/i.test(serialized), "Security gate must not include inline credential assignments.");
}

function validateSecurityOwnerHandoff(report) {
  ensure(report.id === "seis-security-owner-handoff-pr104", "Security owner handoff artifact id mismatch.");
  ensure(report.title === "SEIS Security Owner Handoff", "Security owner handoff title mismatch.");
  ensure(report.status === "owner-action-required", "Security owner handoff must require owner action.");
  ensure(report.mode === "redacted-owner-review-no-raw-values", "Security owner handoff mode mismatch.");
  ensure(report.decision === "NO-GO-owner-security-decision-required", "Security owner handoff must block release.");
  ensure(report.pullRequest?.number === 104, "Security owner handoff must bind PR #104.");
  validateActiveGateImpacts(report.activeGateImpacts, "Security owner handoff");
  ensure(report.sourceArtifacts?.securityGate === paths.securityGateJson, "Security owner handoff security gate source path mismatch.");
  ensure(report.sourceArtifacts?.agentRegistry === paths.agentRegistryJson, "Security owner handoff agent registry source path mismatch.");
  ensure(report.sourceArtifacts?.publicReviewerPack === paths.publicReviewerPackJson, "Security owner handoff reviewer pack source path mismatch.");
  ensure(report.observedSecurityState?.currentTreeStatus === "clean-redacted-no-git", "Security owner handoff must record current-tree clean status.");
  ensure(report.observedSecurityState?.currentTreeFindings === 0, "Security owner handoff current-tree findings must be zero.");
  ensure(report.observedSecurityState?.fullHistoryStatus === "blocked-redacted-findings", "Security owner handoff must keep full-history blocker visible.");
  ensure((report.observedSecurityState?.fullHistoryFindings || 0) >= 1, "Security owner handoff must include full-history finding count.");
  ensure(report.observedSecurityState?.rawFindingValuesStored === false, "Security owner handoff must not store raw finding values.");
  ensure(report.observedSecurityState?.fullJobLogDownloaded === false, "Security owner handoff must not download full job logs.");
  ensure(report.observedSecurityState?.securityPolicyChanged === false, "Security owner handoff must not change security policy.");
  ensure(report.observedSecurityState?.allowlistCommitted === false, "Security owner handoff must not commit allowlists.");
  ensureArrayMin(report.ownerDecisionsRequired, 4, "security owner handoff owner decisions");
  ensureArrayMin(report.agentAssignments, 4, "security owner handoff agent assignments");
  for (const id of [
    "rotate-or-attest-affected-credentials",
    "history-remediation-approval",
    "security-policy-change-review",
    "release-gate-override-denied"
  ]) {
    ensureListEntryContains((report.ownerDecisionsRequired || []).map((item) => item.id), id, "security owner handoff owner decision ids");
  }
  for (const agent of ["Security Agent", "DevOps Agent", "Documentation Agent", "QA Agent"]) {
    ensureListEntryContains((report.agentAssignments || []).map((item) => item.agent), agent, "security owner handoff agent assignments");
  }
  for (const forbidden of [
    "printing raw finding values",
    "downloading or committing full CI job logs",
    "weakening Secret & Vulnerability Scan",
    "rewriting history",
    "force-pushing rewritten history",
    "merging PR #104"
  ]) {
    ensureIncludes(report.forbiddenWithoutOwnerApproval, forbidden, "security owner handoff forbidden actions");
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
    ensure(report.safetyBoundary?.[key] === expected, `Security owner handoff safety boundary ${key} must be ${expected}.`);
  }
  ensure(report.releaseImpact?.mergeAllowed === false, "Security owner handoff must block merge.");
  ensure(report.releaseImpact?.publicDemoReleaseAllowed === false, "Security owner handoff must block public demo release.");
  ensure(report.releaseImpact?.privateObsidianImportAllowed === false, "Security owner handoff must block private Obsidian import.");
  ensure(report.upstreamReadinessBinding?.secondBrainAgentRegistryDecision === "NO-GO-autonomous-execution-not-approved", "Security owner handoff must bind agent registry decision.");
  ensure(report.upstreamReadinessBinding?.publicReviewerPackDecision === "NO-GO-review-pack-does-not-approve-release", "Security owner handoff must bind public reviewer pack decision.");
  ensure(report.upstreamReadinessBinding?.securityGateDecision === "NO-GO-security-history-remediation-needed", "Security owner handoff must bind security gate decision.");
  const serialized = JSON.stringify(report);
  ensure(!serialized.includes("file://"), "Security owner handoff must not include file:// paths.");
  ensure(!serialized.includes("/Users/"), "Security owner handoff must not include absolute private /Users paths.");
  ensure(!/sk-[A-Za-z0-9_-]{20,}/.test(serialized), "Security owner handoff must not include OpenAI-style API keys.");
  ensure(!/-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/.test(serialized), "Security owner handoff must not include private key bodies.");
  ensure(!/\b(?:password|token|secret|api[_-]?key)\s*=\s*['"][^'"]+['"]/i.test(serialized), "Security owner handoff must not include inline credential assignments.");
}

function validateSecurityRemediationPlan(plan) {
  ensure(plan.id === "seis-public-demo-security-remediation-plan-pr127", "Security remediation plan id mismatch.");
  ensure(plan.title === "SEIS PR 127 Security Remediation Plan", "Security remediation plan title mismatch.");
  ensure(plan.status === "owner-approval-required", "Security remediation plan must require owner approval.");
  ensure(plan.mode === "plan-only-redacted-no-raw-values", "Security remediation plan mode mismatch.");
  ensure(plan.decision === "NO-GO-owner-approved-remediation-required", "Security remediation plan must block release.");
  ensure(plan.pullRequest?.number === 127, "Security remediation plan must bind PR #127.");
  ensure(plan.pullRequest?.url === "https://github.com/emirhankudun-ux/SEIS/pull/127", "Security remediation plan PR URL mismatch.");
  ensure(plan.pullRequest?.branch === "codex/second-brain-agent-registry-roster-20260701-clean", "Security remediation plan branch mismatch.");
  ensure(plan.sourceArtifacts?.securityGate === paths.securityGateJson, "Security remediation plan security gate source mismatch.");
  ensure(plan.sourceArtifacts?.securityOwnerHandoff === paths.securityOwnerHandoffJson, "Security remediation plan owner handoff source mismatch.");
  ensure(plan.sourceArtifacts?.releaseChecklist === paths.releaseDoc, "Security remediation plan release checklist source mismatch.");
  ensure(plan.sourceArtifacts?.nextQueue === paths.nextQueue, "Security remediation plan next queue source mismatch.");
  ensure(plan.scope?.slice === "Second Brain readiness / agent registry release gate", "Security remediation plan slice mismatch.");
  ensure(plan.scope?.privateObsidianVaultsInScope === false, "Security remediation plan must exclude private Obsidian vaults.");
  ensure(plan.scope?.liveProvidersInScope === false, "Security remediation plan must exclude live providers.");
  ensure(plan.scope?.sshInScope === false, "Security remediation plan must exclude SSH.");
  ensure(plan.scope?.deploymentInScope === false, "Security remediation plan must exclude deployment.");
  ensure(plan.observedGate?.status === "blocked-by-full-history-secret-scan", "Security remediation plan gate status mismatch.");
  ensureIncludes(plan.observedGate?.failingGateNames, "Secret & Vulnerability Scan", "Security remediation plan failing gates");
  ensureIncludes(plan.observedGate?.failingGateNames, "Security Summary", "Security remediation plan failing gates");
  ensure(plan.observedGate?.currentTreeScope === "clean-redacted-no-git", "Security remediation plan current tree scope mismatch.");
  ensure(plan.observedGate?.currentTreeFindings === 0, "Security remediation plan current tree findings must be zero.");
  ensure(plan.observedGate?.fullHistoryScope === "blocked-redacted-findings", "Security remediation plan full history scope mismatch.");
  ensure((plan.observedGate?.fullHistoryFindingCount || 0) >= 1, "Security remediation plan must keep full-history finding count visible.");
  for (const [key, expected] of [
    ["rawFindingValuesStored", false],
    ["fullJobLogDownloaded", false],
    ["securityPolicyChanged", false],
    ["historyRewritePerformed", false],
    ["forcePushPerformed", false]
  ]) {
    ensure(plan.observedGate?.[key] === expected, `Security remediation plan observed gate ${key} must be ${expected}.`);
  }
  for (const allowed of [
    "keep redacted security gate and owner handoff current",
    "update docs with blocked PR #127 security status",
    "run local readiness validators",
    "prepare owner decision checklist"
  ]) {
    ensureIncludes(plan.allowedBeforeApproval, allowed, "Security remediation plan allowed pre-approval actions");
  }
  for (const required of [
    "history rewrite or affected path purge",
    "credential rotation or non-secret attestation",
    ".gitleaks.toml policy change",
    "force push after history rewrite",
    "merge or release after Security Summary passes"
  ]) {
    ensureIncludes(plan.requiresOwnerApprovalBeforeExecution, required, "Security remediation plan owner approvals");
  }
  for (const forbidden of [
    "printing raw finding values",
    "downloading or committing full CI job logs",
    "blanket-allowlisting historical generated bundles",
    "weakening Secret & Vulnerability Scan",
    "rewriting history",
    "force-pushing rewritten history",
    "merging PR #127",
    "publishing a public demo release"
  ]) {
    ensureIncludes(plan.forbiddenWithoutOwnerApproval, forbidden, "Security remediation plan forbidden actions");
  }
  ensureArrayMin(plan.ownerDecisionSequence, 5, "Security remediation plan owner decision sequence");
  for (const id of [
    "confirm-redacted-finding-scope",
    "rotate-or-attest-affected-credentials",
    "choose-history-remediation-route",
    "review-scanner-policy",
    "release-gate-after-remediation"
  ]) {
    ensureListEntryContains((plan.ownerDecisionSequence || []).map((item) => item.id), id, "Security remediation plan owner decision ids");
  }
  ensureArrayMin(plan.postApprovalRunbook, 5, "Security remediation plan post-approval runbook");
  for (const step of plan.postApprovalRunbook || []) {
    ensure(step.approvalRequired === true, `Security remediation plan runbook step ${step.step} must require approval.`);
    ensure(step.commandExecutionAllowedByThisPlan === false, `Security remediation plan runbook step ${step.step} must not authorize command execution.`);
    ensureArrayMin(step.evidenceRequired, 2, `Security remediation plan runbook step ${step.step} evidence`);
  }
  ensureArrayMin(plan.rollbackPlan, 3, "Security remediation plan rollback plan");
  for (const validation of [
    "Secret & Vulnerability Scan passes on GitHub",
    "Security Summary passes on GitHub",
    "CodeRabbit review gate is not blocking",
    "npm run check:seis-public-demo-security-gate",
    "npm run check:seis-security-owner-handoff",
    "npm run check:seis-second-brain-readiness-contracts",
    "npm run check:seis-second-brain",
    "git diff --check"
  ]) {
    ensureIncludes(plan.validationRequiredAfterRemediation, validation, "Security remediation plan post-remediation validation");
  }
  ensure(plan.releaseImpact?.mergeAllowed === false, "Security remediation plan must block merge.");
  ensure(plan.releaseImpact?.publicDemoReleaseAllowed === false, "Security remediation plan must block public demo release.");
  ensure(plan.releaseImpact?.githubPagesPublicationAllowed === false, "Security remediation plan must block Pages publication.");
  ensure(plan.releaseImpact?.privateObsidianImportAllowed === false, "Security remediation plan must block private Obsidian import.");
  ensure(plan.releaseImpact?.liveProviderRoutingAllowed === false, "Security remediation plan must block live provider routing.");
  for (const [key, expected] of [
    ["rawFindingValuesStored", false],
    ["fullSecurityLogStored", false],
    ["privateKeyBodyStored", false],
    ["gitleaksPolicyChanged", false],
    ["allowlistCommitted", false],
    ["historyRewritePerformed", false],
    ["forcePushPerformed", false],
    ["secretRotationPerformed", false],
    ["githubMutationPerformedByPlan", false],
    ["privateObsidianVaultReadPerformed", false],
    ["providerCallsPerformed", false],
    ["sshExecuted", false],
    ["deploymentPerformed", false],
    ["releaseApprovalGranted", false]
  ]) {
    ensure(plan.safetyBoundary?.[key] === expected, `Security remediation plan safety boundary ${key} must be ${expected}.`);
  }
  const serialized = JSON.stringify(plan);
  ensure(!serialized.includes("file://"), "Security remediation plan must not include file:// paths.");
  ensure(!serialized.includes("/Users/"), "Security remediation plan must not include absolute private /Users paths.");
  ensure(!/sk-[A-Za-z0-9_-]{20,}/.test(serialized), "Security remediation plan must not include OpenAI-style API keys.");
  ensure(!/-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/.test(serialized), "Security remediation plan must not include private key bodies.");
  ensure(!/\b(?:password|token|secret|api[_-]?key)\s*=\s*['"][^'"]+['"]/i.test(serialized), "Security remediation plan must not include inline credential assignments.");
}

function validateActiveGateImpacts(impacts, label) {
  ensure(Array.isArray(impacts), `${label} active gate impacts must be an array.`);
  ensure(
    (impacts || []).some((item) => item.pullRequest === 127),
    `${label} active gate impacts must include PR #127.`
  );
  for (const impact of impacts || []) {
    ensure(impact.status === "blocked-by-full-history-secret-scan", `${label} active gate impact ${impact.pullRequest} status mismatch.`);
    ensureIncludes(impact.failingGateNames, "Secret & Vulnerability Scan", `${label} active gate impact ${impact.pullRequest} failing gates`);
    ensureIncludes(impact.failingGateNames, "Security Summary", `${label} active gate impact ${impact.pullRequest} failing gates`);
    ensure(impact.currentTreeScope === "clean-redacted-no-git", `${label} active gate impact ${impact.pullRequest} current tree scope mismatch.`);
    ensure(impact.fullHistoryScope === "blocked-redacted-findings", `${label} active gate impact ${impact.pullRequest} full history scope mismatch.`);
    ensure(impact.mergeAllowed === false, `${label} active gate impact ${impact.pullRequest} must block merge.`);
    ensure(impact.releaseAllowed === false, `${label} active gate impact ${impact.pullRequest} must block release.`);
    ensure(impact.requiresOwnerApproval === true, `${label} active gate impact ${impact.pullRequest} must require owner approval.`);
  }
}

function validateRouterContract(contract) {
  ensure(contract.id === "seis-read-only-model-router-contract", "Read-only model-router contract id mismatch.");
  ensure(contract.status === "planned-read-only-contract", "Read-only model-router contract status mismatch.");
  for (const [key, expected] of [
    ["runtimeAuthority", false],
    ["providerCalls", false],
    ["credentialValidation", false],
    ["browserSecrets", false],
    ["silentFallback", false],
    ["localOnlyCanUseCloud", false]
  ]) {
    const value = contract.boundary?.[key] ?? contract[key];
    ensure(value === expected, `Model-router boundary ${key} must be ${expected}.`);
  }
  for (const state of ["Local Demo", "Available", "Missing Key", "Disabled", "Rate Limited", "Error", "Unknown"]) {
    ensureIncludes(contract.providerStates, state, "Model-router provider states");
  }
  for (const rule of [
    "Local-only mode never routes to cloud providers.",
    "Missing Key is not Error",
    "Live execution stays blocked until backend-only provider mediation exists."
  ]) {
    ensureIncludes(contract.routingRules, rule, "Model-router routing rules");
  }
  ensureArrayMin(contract.blockedModelClasses, 6, "blockedModelClasses");
  ensureListEntryContains(contract.blockedModelClasses, "150B", "blockedModelClasses");
  ensureListEntryContains(contract.blockedModelClasses, "512B", "blockedModelClasses");
  for (const [key, expected] of [
    ["readOnlyOnly", true],
    ["executionPerformedAlwaysFalse", true],
    ["noPromptBodyInDecision", true],
    ["noCredentialMaterialInDecision", true],
    ["decisionLogsRedacted", true],
    ["providerStateMustBeNamed", true],
    ["selectedProviderMustBeExplicit", true],
    ["fallbackMustBeExplicit", true],
    ["blockedReasonsRequiredWhenIneligible", true],
    ["privateObsidianContentRoutable", false]
  ]) {
    ensure(contract.decisionIntegrity?.[key] === expected, `Model-router decision integrity ${key} must be ${expected}.`);
  }
  ensureIncludes(contract.reviewOnlyOutputs, "blocked reason list", "Model-router review-only outputs");
  ensureIncludes(contract.reviewOnlyOutputs, "required approval list", "Model-router review-only outputs");
  ensureIncludes(contract.reviewOnlyOutputs, "read-only decision artifact JSON and Markdown path", "Model-router review-only outputs");
  ensure(
    contract.reviewArtifact?.json === paths.routerDecisionJson,
    "Model-router review artifact JSON path mismatch."
  );
  ensure(
    contract.reviewArtifact?.markdown === paths.routerDecisionMarkdown,
    "Model-router review artifact Markdown path mismatch."
  );
  ensure(
    contract.reviewArtifact?.qualityGate === "npm run check:seis-read-only-model-router-decision",
    "Model-router review artifact quality gate mismatch."
  );
}

function validateRouterDecision(report, contract, secondBrainContract) {
  const sourceInstalledAiProfiles = secondBrainContract?.installedAiProfiles || [];
  ensure(report.id === "seis-read-only-model-router-decision-pr54", "Router decision artifact id mismatch.");
  ensure(report.title === "SEIS Read-Only Model Router Decision", "Router decision artifact title mismatch.");
  ensure(report.status === "review-only-no-runtime-authority", "Router decision artifact status mismatch.");
  ensure(report.mode === "provider-neutral-read-only", "Router decision artifact mode mismatch.");
  ensure(report.decision === "NO-GO-live-routing-not-approved", "Router decision artifact must block live routing.");
  ensure(report.contractPath === paths.routerContract, "Router decision artifact contract path mismatch.");
  ensure(report.secondBrainPath === "content/development/seis-second-brain-system.json", "Router decision artifact Second Brain path mismatch.");
  ensureExactArray(report.installedAiProfiles, sourceInstalledAiProfiles, "router decision installedAiProfiles");
  ensure(report.sourceSnapshot?.installedAiProfileCount === sourceInstalledAiProfiles.length, "Router decision source snapshot installed AI profile count mismatch.");
  ensure(report.sourceSnapshot?.providerFixtureForEveryInstalledAiProfile === true, "Router decision must require provider fixture coverage for every installed AI profile.");
  ensureArrayMin(report.managedSubAgentLanes, 6, "router decision managedSubAgentLanes");
  ensureArrayMin(report.autonomousAgentRoster, 12, "router decision autonomousAgentRoster");
  ensure(Array.isArray(report.providerFixtures) && report.providerFixtures.length === sourceInstalledAiProfiles.length, "Router decision providerFixtures must match installed AI profile count exactly.");
  ensureArrayMin(report.decisions, 4, "router decision decisions");
  ensureExactArray(
    (report.providerFixtures || []).map((fixture) => fixture.profile),
    sourceInstalledAiProfiles,
    "router decision provider fixture profiles"
  );
  for (const [key, expected] of Object.entries(contract.decisionIntegrity || {})) {
    ensure(report.decisionIntegrity?.[key] === expected, `Router decision integrity ${key} must be ${expected}.`);
  }
  for (const [key, expected] of [
    ["runtimeAuthority", false],
    ["providerCallsPerformed", false],
    ["credentialValidationPerformed", false],
    ["browserSecretsExposed", false],
    ["promptBodiesStored", false],
    ["privateObsidianContentRouted", false],
    ["silentFallbackUsed", false],
    ["localOnlyCloudFallbackUsed", false],
    ["sshExecuted", false],
    ["deploymentPerformed", false],
    ["githubMutationPerformed", false]
  ]) {
    ensure(report.safetyBoundary?.[key] === expected, `Router decision safety boundary ${key} must be ${expected}.`);
  }
  for (const fixture of report.providerFixtures || []) {
    ensureIncludes(contract.providerStates, fixture.providerState, "Router decision provider fixture states");
    ensure(fixture.providerCallsPerformed === false, "Router provider fixture must not perform provider calls.");
  }
  for (const decision of report.decisions || []) {
    ensureIncludes(contract.providerStates, decision.providerState, "Router decision provider states");
    ensure(decision.routeEligible === false, `Router decision ${decision.id} routeEligible must be false.`);
    ensure(decision.executionPerformed === false, `Router decision ${decision.id} executionPerformed must be false.`);
    ensure(decision.fallbackUsed === false, `Router decision ${decision.id} fallbackUsed must be false.`);
    ensure(decision.promptBodyIncluded === false, `Router decision ${decision.id} must not include prompt body.`);
    ensure(decision.credentialMaterialIncluded === false, `Router decision ${decision.id} must not include credential material.`);
    ensure(decision.decisionLogRedacted === true, `Router decision ${decision.id} decision log must be redacted.`);
    ensureArrayMin(decision.blockedReasons, 1, `Router decision ${decision.id} blockedReasons`);
    ensure(typeof decision.fallbackPolicy === "string" && decision.fallbackPolicy.length > 0, `Router decision ${decision.id} fallback policy missing.`);
  }
  const serialized = JSON.stringify(report);
  ensure(!serialized.includes("file://"), "Router decision artifact must not include file:// paths.");
  ensure(!serialized.includes("/Users/"), "Router decision artifact must not include absolute private /Users paths.");
  ensure(!/sk-[A-Za-z0-9_-]{20,}/.test(serialized), "Router decision artifact must not include OpenAI-style API keys.");
  ensure(!/-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/.test(serialized), "Router decision artifact must not include private keys.");
  ensure(!/\b(?:password|token|secret|api[_-]?key)\s*=\s*['"][^'"]+['"]/i.test(serialized), "Router decision artifact must not include inline credential assignments.");
  ensure(!/promptBodyText|promptText|messages|conversation/i.test(serialized), "Router decision artifact must not include prompt bodies.");
}

function validateReleaseChecklist(checklist) {
  ensure(checklist.id === "seis-public-demo-release-checklist-pr54", "PR 54 release checklist id mismatch.");
  ensure(checklist.status === "review-gated-not-released", "PR 54 release checklist must stay review-gated.");
  ensure(checklist.pullRequest?.number === 54, "PR number must be 54.");
  ensure(checklist.pullRequest?.url === "https://github.com/emirhankudun-ux/SEIS/pull/54", "PR 54 URL mismatch.");
  ensure(checklist.pullRequest?.base === "main", "PR 54 base branch must be main.");
  ensure(checklist.pullRequest?.head === "codex/seis-demo-github-upload-20260624", "PR 54 head branch mismatch.");
  for (const action of [
    "merge to main",
    "GitHub Pages publication",
    "Obsidian private vault import",
    "live provider routing",
    "SSH execution",
    "deployment"
  ]) {
    ensureListEntryContains(checklist.blockedActions, action, "PR 54 blocked actions");
  }
  for (const gate of [
    "npm run check:seis-second-brain-readiness-contracts",
    "npm run check:seis-obsidian-safe-import-dry-run",
    "npm run report:seis-obsidian-safe-import-dry-run",
    "npm run check:seis-read-only-model-router-decision",
    "npm run report:seis-read-only-model-router-decision",
    "npm run check:seis-second-brain-accessibility-focus-report",
    "npm run report:seis-second-brain-accessibility-focus-report",
    "npm run check:seis-second-brain-agent-registry",
    "npm run report:seis-second-brain-agent-registry",
    "npm run check:seis-second-brain-public-reviewer-pack",
    "npm run report:seis-second-brain-public-reviewer-pack",
    "npm run check:seis-public-demo-security-gate",
    "npm run report:seis-public-demo-security-gate",
    "npm run check:seis-security-owner-handoff",
    "npm run report:seis-security-owner-handoff",
    "npm run check:seis-public-demo-go-no-go -- --run-fast-checks",
    "npm run report:seis-public-demo-go-no-go",
    "npm run check:product-experience-browser-smoke",
    "npm test",
    "git diff --check"
  ]) {
    ensureIncludes(checklist.requiredValidation, gate, "PR 54 required validation");
  }
  for (const artifact of [
    "reports/seis-public-demo/go-no-go-latest.json",
    "reports/seis-public-demo/go-no-go-latest.md",
    "reports/seis-public-demo/evidence-manifest-latest.json",
    "reports/seis-public-demo/obsidian-safe-import-dry-run-latest.json",
    "reports/seis-public-demo/obsidian-safe-import-dry-run-latest.md",
    "reports/seis-public-demo/read-only-model-router-decision-latest.json",
    "reports/seis-public-demo/read-only-model-router-decision-latest.md",
    "reports/seis-public-demo/second-brain-accessibility-focus-latest.json",
    "reports/seis-public-demo/second-brain-accessibility-focus-latest.md",
    "reports/seis-public-demo/second-brain-agent-registry-latest.json",
    "reports/seis-public-demo/second-brain-agent-registry-latest.md",
    "reports/seis-public-demo/second-brain-public-reviewer-pack-latest.json",
    "reports/seis-public-demo/second-brain-public-reviewer-pack-latest.md",
    "reports/seis-public-demo/security-gate-redacted-latest.json",
    "reports/seis-public-demo/security-gate-redacted-latest.md",
    "reports/seis-public-demo/security-owner-handoff-latest.json",
    "reports/seis-public-demo/security-owner-handoff-latest.md",
    "content/development/seis-public-demo-security-remediation-plan-pr127.json",
    "docs/security/PR127_SECURITY_REMEDIATION_PLAN.md",
    "reports/seis-public-demo/pr54-review-packet-latest.md",
    "reports/seis-public-demo/worktree-review-latest.md",
    "reports/seis-public-demo/pr54-stage-plan-latest.md"
  ]) {
    ensureIncludes(checklist.requiredArtifacts, artifact, "PR 54 required artifacts");
  }
  ensure(checklist.postPr54ReviewPacket?.status === "required-before-release", "PR 54 post-review packet must be required before release.");
  ensure(
    checklist.postPr54ReviewPacket?.artifact === "reports/seis-public-demo/pr54-review-packet-latest.md",
    "PR 54 post-review packet artifact path mismatch."
  );
  ensureListEntryContains(checklist.postPr54ReviewPacket?.mustAnswer, "current browser-smoke evidence", "PR 54 post-review packet questions");
  ensureListEntryContains(checklist.postPr54ReviewPacket?.mustAnswer, "human owner explicitly approved", "PR 54 post-review packet questions");
  ensureListEntryContains(checklist.postPr54ReviewPacket?.allowedOutcomes, "NO-GO", "PR 54 post-review packet outcomes");
  ensureListEntryContains(checklist.postPr54ReviewPacket?.allowedOutcomes, "GO after strict gate", "PR 54 post-review packet outcomes");
  ensure(checklist.securityRemediationPlan?.status === "owner-approval-required-before-execution", "PR 54 security remediation plan must require owner approval.");
  ensure(checklist.securityRemediationPlan?.json === paths.securityRemediationPlanJson, "PR 54 security remediation plan JSON path mismatch.");
  ensure(checklist.securityRemediationPlan?.markdown === paths.securityRemediationPlanDoc, "PR 54 security remediation plan Markdown path mismatch.");
  ensure(checklist.securityRemediationPlan?.appliesToPullRequest === 127, "PR 54 security remediation plan must bind PR #127.");
  ensure(checklist.securityRemediationPlan?.mustRemainPlanOnly === true, "PR 54 security remediation plan must remain plan-only.");
  ensureListEntryContains(checklist.securityRemediationPlan?.blockedWithoutOwnerApproval, "printing raw finding values", "PR 54 security remediation plan blocked actions");
  ensureListEntryContains(checklist.securityRemediationPlan?.blockedWithoutOwnerApproval, "history rewrite", "PR 54 security remediation plan blocked actions");
  ensureListEntryContains(checklist.requiredReviews, "PR #127 security remediation plan review", "PR 54 required reviews");
  ensure(checklist.stagePlan?.status === "required-before-commit", "PR 54 stage plan must be required before commit.");
  ensure(
    checklist.stagePlan?.artifact === "reports/seis-public-demo/pr54-stage-plan-latest.md",
    "PR 54 stage plan artifact path mismatch."
  );
  ensure(checklist.stagePlan?.mustRemainReadOnly === true, "PR 54 stage plan must remain read-only.");
  ensure(checklist.stagePlan?.requiresHumanRunGitCommands === true, "PR 54 stage plan must require human-run Git commands.");
  ensureListEntryContains(checklist.stagePlan?.blockedWithoutReview, "push, merge", "PR 54 stage plan blocked actions");
}

function validatePublicDemoArtifacts(report, manifest) {
  ensure(report.decision === "NO-GO", "public demo go/no-go report must currently classify release as NO-GO.");
  ensure(report.status === "review-gated-not-released", "public demo go/no-go report status mismatch.");
  ensure(report.mode === "read-only", "public demo go/no-go report must stay read-only.");
  ensure(report.pullRequest?.number === 54, "public demo go/no-go report must bind PR #54.");
  ensure(Array.isArray(report.blockers), "public demo go/no-go report blockers must be an array.");
  const reportBlockers = Array.isArray(report.blockers) ? report.blockers : [];
  const dirtyCount = Number(report.worktreeReview?.dirtyCount || 0);
  if (dirtyCount > 0) {
    ensure(reportBlockers.includes("dirty-worktree"), "public demo go/no-go report must block dirty worktree when dirty paths exist.");
  } else {
    ensure(!reportBlockers.includes("dirty-worktree"), "clean public demo go/no-go report must not block dirty worktree.");
  }
  ensure(reportBlockers.includes("human-release-approval-missing"), "public demo go/no-go report must block missing human approval.");
  const browserSmokeMissing = reportBlockers.includes("current-browser-smoke-evidence-missing");
  ensure(report.evidenceManifest?.artifactPath === "reports/seis-public-demo/evidence-manifest-latest.json", "public demo report must point to evidence manifest artifact.");
  ensure(report.worktreeReview?.artifactPath === "reports/seis-public-demo/worktree-review-latest.md", "public demo report must point to worktree review artifact.");
  ensure(report.stagePlan?.artifactPath === "reports/seis-public-demo/pr54-stage-plan-latest.md", "public demo report must point to stage plan artifact.");

  ensure(manifest.id === "seis-public-demo-evidence-manifest-pr54", "public demo evidence manifest id mismatch.");
  ensure(manifest.decision === "NO-GO", "public demo evidence manifest decision mismatch.");
  ensure(manifest.status === "review-gated-not-released", "public demo evidence manifest status mismatch.");
  ensure(manifest.pullRequest?.number === 54, "public demo evidence manifest must bind PR #54.");
  const manifestItems = Array.isArray(manifest.items) ? manifest.items : [];
  const manifestSummary = manifest.summary || {};
  ensure(report.evidenceManifest?.itemCount === manifestItems.length, "public demo report evidence itemCount must match evidence manifest items.");
  ensure(report.evidenceManifest?.passedCount === manifestSummary.passed, "public demo report evidence passedCount must match evidence manifest summary.");
  ensure(report.evidenceManifest?.blockedCount === manifestSummary.blocked, "public demo report evidence blockedCount must match evidence manifest summary.");
  ensure(report.evidenceManifest?.missingEvidenceCount === manifestSummary.missingCurrentEvidence, "public demo report evidence missingEvidenceCount must match evidence manifest summary.");
  ensure(manifest.summary?.failed === 0, "public demo evidence manifest must have zero failed evidence items.");
  ensure(manifest.summary?.blocked >= 1, "public demo evidence manifest must include release blockers.");
  if (browserSmokeMissing) {
    ensure(manifest.summary?.missingCurrentEvidence >= 1, "public demo evidence manifest must keep missing current browser evidence visible.");
    ensureListEntryContains((manifest.items || []).map((item) => `${item.id}:${item.status}`), "current-browser-smoke:missing-current-evidence", "public demo evidence manifest items");
  } else {
    ensure(manifest.summary?.missingCurrentEvidence === 0, "public demo evidence manifest must have zero missing current evidence after browser smoke is recorded.");
    ensureListEntryContains((manifest.items || []).map((item) => `${item.id}:${item.status}`), "current-browser-smoke:passed", "public demo evidence manifest items");
  }
  ensureListEntryContains((manifest.items || []).map((item) => `${item.id}:${item.status}`), "accessibility-focus-qa-artifact:passed", "public demo evidence manifest items");
  ensureListEntryContains((manifest.items || []).map((item) => `${item.id}:${item.status}`), "second-brain-agent-registry:passed", "public demo evidence manifest items");
  ensureListEntryContains((manifest.items || []).map((item) => `${item.id}:${item.status}`), "obsidian-safe-import-dry-run:passed", "public demo evidence manifest items");
  ensureListEntryContains((manifest.items || []).map((item) => `${item.id}:${item.status}`), "read-only-router-decision:passed", "public demo evidence manifest items");
  ensureListEntryContains((manifest.items || []).map((item) => `${item.id}:${item.status}`), "human-release-approval:blocked", "public demo evidence manifest items");
  ensureListEntryContains((manifest.items || []).map((item) => `${item.id}:${item.status}`), "worktree-review-packet:passed", "public demo evidence manifest items");
  ensureListEntryContains((manifest.items || []).map((item) => `${item.id}:${item.status}`), "pr54-stage-plan:passed", "public demo evidence manifest items");
}

function validatePackage(packageJson) {
  ensure(
    packageJson.scripts?.["check:seis-second-brain-readiness-contracts"] ===
      "node scripts/check-seis-second-brain-readiness-contracts.mjs",
    "package.json must expose check:seis-second-brain-readiness-contracts."
  );
  ensure(
    packageJson.scripts?.["check:seis-obsidian-safe-import-dry-run"] ===
      "node scripts/create-seis-obsidian-safe-import-dry-run.mjs --check",
    "package.json must expose check:seis-obsidian-safe-import-dry-run."
  );
  ensure(
    packageJson.scripts?.["report:seis-obsidian-safe-import-dry-run"] ===
      "node scripts/create-seis-obsidian-safe-import-dry-run.mjs --write",
    "package.json must expose report:seis-obsidian-safe-import-dry-run."
  );
  ensure(
    packageJson.scripts?.["check:seis-read-only-model-router-decision"] ===
      "node scripts/create-seis-read-only-model-router-decision.mjs --check",
    "package.json must expose check:seis-read-only-model-router-decision."
  );
  ensure(
    packageJson.scripts?.["report:seis-read-only-model-router-decision"] ===
      "node scripts/create-seis-read-only-model-router-decision.mjs --write",
    "package.json must expose report:seis-read-only-model-router-decision."
  );
  ensure(
    packageJson.scripts?.["check:seis-second-brain-accessibility-focus-report"] ===
      "node scripts/create-seis-second-brain-accessibility-focus-report.mjs --check",
    "package.json must expose check:seis-second-brain-accessibility-focus-report."
  );
  ensure(
    packageJson.scripts?.["report:seis-second-brain-accessibility-focus-report"] ===
      "node scripts/create-seis-second-brain-accessibility-focus-report.mjs --write",
    "package.json must expose report:seis-second-brain-accessibility-focus-report."
  );
  ensure(
    packageJson.scripts?.["check:seis-second-brain-agent-registry"] ===
      "node scripts/create-seis-second-brain-agent-registry.mjs --check",
    "package.json must expose check:seis-second-brain-agent-registry."
  );
  ensure(
    packageJson.scripts?.["report:seis-second-brain-agent-registry"] ===
      "node scripts/create-seis-second-brain-agent-registry.mjs --write",
    "package.json must expose report:seis-second-brain-agent-registry."
  );
  ensure(
    packageJson.scripts?.["check:seis-second-brain-public-reviewer-pack"] ===
      "node scripts/create-seis-second-brain-public-reviewer-pack.mjs --check",
    "package.json must expose check:seis-second-brain-public-reviewer-pack."
  );
  ensure(
    packageJson.scripts?.["report:seis-second-brain-public-reviewer-pack"] ===
      "node scripts/create-seis-second-brain-public-reviewer-pack.mjs --write",
    "package.json must expose report:seis-second-brain-public-reviewer-pack."
  );
  ensure(
    packageJson.scripts?.["check:seis-public-demo-security-gate"] ===
      "node scripts/create-seis-public-demo-security-gate-report.mjs --check",
    "package.json must expose check:seis-public-demo-security-gate."
  );
  ensure(
    packageJson.scripts?.["report:seis-public-demo-security-gate"] ===
      "node scripts/create-seis-public-demo-security-gate-report.mjs --write",
    "package.json must expose report:seis-public-demo-security-gate."
  );
  ensure(
    packageJson.scripts?.["check:seis-security-owner-handoff"] ===
      "node scripts/create-seis-security-owner-handoff.mjs --check",
    "package.json must expose check:seis-security-owner-handoff."
  );
  ensure(
    packageJson.scripts?.["report:seis-security-owner-handoff"] ===
      "node scripts/create-seis-security-owner-handoff.mjs --write",
    "package.json must expose report:seis-security-owner-handoff."
  );
  ensure(
    packageJson.scripts?.["check:seis-public-demo-go-no-go"] ===
      "node scripts/check-seis-public-demo-go-no-go.mjs",
    "package.json must expose check:seis-public-demo-go-no-go."
  );
  ensure(
    packageJson.scripts?.["check:seis-public-demo-go-no-go:strict"] ===
      "node scripts/check-seis-public-demo-go-no-go.mjs --require-ready",
    "package.json must expose check:seis-public-demo-go-no-go:strict."
  );
  ensure(
    packageJson.scripts?.["report:seis-public-demo-go-no-go"] ===
      "node scripts/check-seis-public-demo-go-no-go.mjs --run-fast-checks --output reports/seis-public-demo/go-no-go-latest.json --markdown reports/seis-public-demo/go-no-go-latest.md --manifest reports/seis-public-demo/evidence-manifest-latest.json --review-packet reports/seis-public-demo/pr54-review-packet-latest.md --worktree-review reports/seis-public-demo/worktree-review-latest.md --stage-plan reports/seis-public-demo/pr54-stage-plan-latest.md",
    "package.json must expose report:seis-public-demo-go-no-go."
  );
}

function validateDesktopAccessibility(js, css) {
  for (const phrase of [
    "role=\"listbox\"",
    "role=\"option\"",
    "aria-selected",
    "aria-controls=\"second-brain-inspector-panel\"",
    "aria-live=\"polite\"",
    "tabindex=\"0\"",
    "focusSecondBrainInspector",
    "aria-activedescendant",
    "second-brain-inspector-heading"
  ]) {
    ensure(js.includes(phrase), `desktop.js missing accessibility marker: ${phrase}`);
  }
  for (const phrase of [":focus-visible", "[tabindex]:focus-visible"]) {
    ensure(css.includes(phrase), `desktop.css missing focus style marker: ${phrase}`);
  }
}

function validateDocsAndIndexes() {
  const requiredPhrases = [
    [paths.obsidianDoc, ["Obsidian Bridge Safe Import", "planned-gated", "No private note body", "dry-run manifest", "metadata-only-by-default", "report:seis-obsidian-safe-import-dry-run", "obsidian-safe-import-dry-run-latest"]],
    [paths.accessibilityDoc, ["Second Brain Accessibility Focus QA", "role=listbox", "focus-visible", "WCAG 2.2 visible focus indicator", "screen-reader transcript", "report:seis-second-brain-accessibility-focus-report", "second-brain-accessibility-focus-latest", "npm run check:seis-second-brain-browser-smoke"]],
    [paths.routerDoc, ["Read-Only Model Router Contract", "Missing Key is not Error", "backend-only provider mediation", "decision integrity", "report:seis-read-only-model-router-decision", "read-only-model-router-decision-latest", "npm run check:seis-second-brain-readiness-contracts"]],
    [paths.releaseDoc, ["Public Demo Release Checklist", "PR #54", "review-gated-not-released", "Do not merge", "check:seis-public-demo-go-no-go", "report:seis-public-demo-go-no-go", "report:seis-obsidian-safe-import-dry-run", "report:seis-read-only-model-router-decision", "report:seis-second-brain-accessibility-focus-report", "report:seis-second-brain-agent-registry", "report:seis-second-brain-public-reviewer-pack", "report:seis-public-demo-security-gate", "report:seis-security-owner-handoff", "second-brain-public-reviewer-pack-latest", "security-gate-redacted-latest", "security-owner-handoff-latest", "PR #127 active security gate impact", "PR #127 security remediation plan", "Secret & Vulnerability Scan", "Security Summary", "PR #54 review packet", "worktree review", "stage plan", "NO-GO"]],
    [paths.securityRemediationPlanDoc, ["PR 127 Security Remediation Plan", "owner-approval-required", "plan-only-redacted-no-raw-values", "NO-GO", "Secret & Vulnerability Scan", "Security Summary", "Forbidden Without Owner Approval", "Post-Approval Runbook", "Validation Required After Remediation", "Safety Boundary"]],
    [paths.secondBrainDoc, ["Obsidian bridge safe import contract", "Obsidian starter vault", "AI council review pack", "Obsidian safe-import dry-run artifact", "read-only model-router decision artifact", "accessibility/focus QA artifact", "Second Brain agent registry artifact", "Second Brain public reviewer pack", "public demo security gate redacted evidence", "security owner handoff", "PR #127 security remediation plan", "Second Brain accessibility/focus QA", "npm run check:seis-second-brain-readiness-contracts", "check:seis-public-demo-go-no-go", "PR #54 review packet", "stage plan"]],
    [paths.modelRouterDoc, ["read-only model-router contract", "Provider-neutral", "Missing Key is not Error", "decision integrity", "read-only model-router decision artifact"]],
    [paths.status, ["SEIS Second Brain readiness contracts", "Obsidian bridge safe import", "Obsidian starter vault", "AI council review pack", "Obsidian safe-import dry-run", "read-only model-router decision", "accessibility/focus QA artifact", "Second Brain agent registry artifact", "Second Brain public reviewer pack", "public demo security gate redacted evidence", "security owner handoff", "PR #127 security remediation plan", "PR #54 public demo release checklist"]],
    [paths.index, ["SEIS Obsidian Bridge Safe Import", "Second Brain Accessibility Focus QA", "Read-Only Model Router Contract", "Public Demo Release Checklist PR54", "check-seis-public-demo-go-no-go.mjs", "create-seis-obsidian-safe-import-dry-run.mjs", "create-seis-read-only-model-router-decision.mjs", "create-seis-second-brain-accessibility-focus-report.mjs", "create-seis-second-brain-agent-registry.mjs", "create-seis-second-brain-public-reviewer-pack.mjs", "create-seis-public-demo-security-gate-report.mjs", "create-seis-security-owner-handoff.mjs", "reports/seis-public-demo/go-no-go-latest", "reports/seis-public-demo/evidence-manifest-latest", "reports/seis-public-demo/obsidian-safe-import-dry-run-latest", "reports/seis-public-demo/read-only-model-router-decision-latest", "reports/seis-public-demo/second-brain-accessibility-focus-latest", "reports/seis-public-demo/second-brain-agent-registry-latest", "reports/seis-public-demo/second-brain-public-reviewer-pack-latest", "reports/seis-public-demo/security-gate-redacted-latest", "reports/seis-public-demo/security-owner-handoff-latest", "PR127_SECURITY_REMEDIATION_PLAN", "seis-public-demo-security-remediation-plan-pr127", "reports/seis-public-demo/pr54-review-packet-latest", "reports/seis-public-demo/worktree-review-latest", "reports/seis-public-demo/pr54-stage-plan-latest"]],
    [paths.masterIndex, ["SEIS Obsidian Bridge Safe Import", "Second Brain Accessibility Focus QA", "Read-Only Model Router Contract", "Public Demo Release Checklist PR54", "check:seis-public-demo-go-no-go", "report:seis-obsidian-safe-import-dry-run", "report:seis-read-only-model-router-decision", "report:seis-second-brain-accessibility-focus-report", "report:seis-second-brain-agent-registry", "report:seis-second-brain-public-reviewer-pack", "report:seis-public-demo-security-gate", "report:seis-security-owner-handoff", "reports/seis-public-demo/go-no-go-latest", "reports/seis-public-demo/evidence-manifest-latest", "reports/seis-public-demo/obsidian-safe-import-dry-run-latest", "reports/seis-public-demo/read-only-model-router-decision-latest", "reports/seis-public-demo/second-brain-accessibility-focus-latest", "reports/seis-public-demo/second-brain-agent-registry-latest", "reports/seis-public-demo/second-brain-public-reviewer-pack-latest", "reports/seis-public-demo/security-gate-redacted-latest", "reports/seis-public-demo/security-owner-handoff-latest", "seis-public-demo-security-remediation-plan-pr127", "PR127_SECURITY_REMEDIATION_PLAN", "reports/seis-public-demo/pr54-review-packet-latest", "reports/seis-public-demo/worktree-review-latest", "reports/seis-public-demo/pr54-stage-plan-latest"]],
    [paths.backlog, ["Obsidian bridge safe import", "Obsidian starter vault", "AI council review pack", "Obsidian safe-import dry-run artifact", "read-only model-router decision artifact", "accessibility/focus QA artifact", "Second Brain agent registry artifact", "Second Brain public reviewer pack", "public demo security gate redacted evidence", "security owner handoff", "PR #127 security remediation plan", "Second Brain accessibility/focus QA", "read-only model-router contract", "PR #54 public demo release checklist", "SEIS public demo go/no-go gate", "PR #54 review packet", "worktree review", "stage plan"]],
    [paths.nextQueue, ["Obsidian bridge safe import", "Obsidian starter vault", "AI council review pack", "Obsidian safe-import dry-run artifact", "read-only model-router decision artifact", "accessibility/focus QA artifact", "Second Brain agent registry artifact", "Second Brain public reviewer pack", "public demo security gate redacted evidence", "security owner handoff", "PR #127 security remediation plan", "Second Brain accessibility/focus QA", "read-only model-router contract", "PR #54 public demo release checklist", "PR #127 active security gate impact", "Secret & Vulnerability Scan", "Security Summary", "PR #54 review packet", "worktree review", "stage plan"]],
    [paths.readme, ["check:seis-second-brain-readiness-contracts", "Second Brain readiness contracts", "Obsidian starter vault", "AI council review pack", "check:seis-public-demo-go-no-go", "report:seis-obsidian-safe-import-dry-run", "report:seis-read-only-model-router-decision", "report:seis-second-brain-accessibility-focus-report", "report:seis-second-brain-agent-registry", "report:seis-second-brain-public-reviewer-pack", "report:seis-public-demo-security-gate", "report:seis-security-owner-handoff", "PR #127 security remediation plan"]],
    [paths.publicDemoGoNoGo, ["human-release-approval-missing", "current-browser-smoke-evidence-missing", "dirty-worktree", "security-full-history-remediation-needed", "obsidian-safe-import-dry-run", "read-only-router-decision", "accessibility-focus-qa-artifact", "second-brain-agent-registry", "second-brain-public-reviewer-pack", "security-gate-redacted-evidence", "security-owner-handoff", "NO-GO"]]
  ];

  for (const [filePath, phrases] of requiredPhrases) {
    const text = readText(filePath, filePath);
    for (const phrase of phrases) {
      ensure(text.includes(phrase), `${filePath} missing phrase: ${phrase}`);
    }
  }
}

function validateNoSecrets() {
  for (const filePath of [
    paths.obsidianContract,
    paths.accessibilityContract,
    paths.routerContract,
    paths.releaseChecklist,
    paths.securityRemediationPlanJson,
    paths.securityRemediationPlanDoc,
    paths.obsidianDoc,
    paths.accessibilityDoc,
    paths.routerDoc,
    paths.releaseDoc,
    paths.secondBrainDoc,
    paths.modelRouterDoc,
    paths.publicDemoGoNoGo,
    paths.publicDemoReportJson,
    paths.publicDemoReportMarkdown,
    paths.publicDemoEvidenceManifest,
    paths.publicDemoReviewPacket,
    paths.publicDemoWorktreeReview,
    paths.publicDemoStagePlan,
    paths.obsidianDryRunScript,
    paths.obsidianDryRunJson,
    paths.obsidianDryRunMarkdown,
    paths.routerDecisionScript,
    paths.routerDecisionJson,
    paths.routerDecisionMarkdown,
    paths.accessibilityFocusScript,
    paths.accessibilityFocusJson,
    paths.accessibilityFocusMarkdown,
    paths.agentRegistryScript,
    paths.agentRegistryJson,
    paths.agentRegistryMarkdown,
    paths.publicReviewerPackScript,
    paths.publicReviewerPackJson,
    paths.publicReviewerPackMarkdown,
    paths.securityGateScript,
    paths.securityGateJson,
    paths.securityGateMarkdown,
    paths.securityOwnerHandoffScript,
    paths.securityOwnerHandoffJson,
    paths.securityOwnerHandoffMarkdown,
    paths.status,
    paths.index,
    paths.masterIndex,
    paths.backlog,
    paths.nextQueue,
    paths.readme,
    "scripts/check-seis-second-brain-readiness-contracts.mjs"
  ]) {
    if (reportGenerating && isGeneratedPublicDemoArtifact(filePath)) continue;
    requireNotMatches(filePath, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
    requireNotMatches(filePath, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
    requireNotMatches(filePath, /\b(?:password|token|secret|api[_-]?key)\s*=\s*['"][^'"]+['"]/i, "inline credential assignments");
  }
}

function isGeneratedPublicDemoArtifact(filePath) {
  return String(filePath).startsWith("reports/seis-public-demo/");
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(path.join(root, filePath))) failures.push(`missing ${label}: ${filePath}`);
}

function ensureArrayMin(value, minimum, label) {
  ensure(Array.isArray(value), `${label} must be an array.`);
  ensure(Array.isArray(value) && value.length >= minimum, `${label} must include at least ${minimum} records.`);
}

function ensureExactArray(value, expected, label) {
  ensure(Array.isArray(value), `${label} must be an array.`);
  ensure(Array.isArray(expected), `${label} expected source must be an array.`);
  if (!Array.isArray(value) || !Array.isArray(expected)) return;
  ensure(value.length === expected.length, `${label} count must match the Second Brain source contract exactly.`);
  for (const expectedValue of expected) {
    ensure(value.includes(expectedValue), `${label} missing source item: ${expectedValue}.`);
  }
  for (const actualValue of value) {
    ensure(expected.includes(actualValue), `${label} includes non-source item: ${actualValue}.`);
  }
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
