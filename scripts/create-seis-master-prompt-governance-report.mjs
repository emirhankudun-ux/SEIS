import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "..");

const implementationMapPath = "data/seis-master-prompt-implementation-map.json";
const acceptanceCriteriaPath = "data/seis-master-prompt-acceptance-criteria.json";
const githubControlsPath = "data/seis-master-prompt-github-controls.json";
const sshHardeningOperationContractPath = "data/ssh-hardening-operation-contract.json";
const reportPath = "reports/seis-master-prompt-governance.md";

function read(relativePath) {
  const absolutePath = resolve(root, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`missing ${relativePath}`);
  }
  return readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function tableRow(cells) {
  return `| ${cells.map(cell => String(cell).replaceAll("|", "\\|")).join(" | ")} |`;
}

function renderList(values) {
  return values.map(value => `- ${value}`).join("\n");
}

function renderReport() {
  const implementationMap = readJson(implementationMapPath);
  const acceptanceCriteria = readJson(acceptanceCriteriaPath);
  const githubControls = readJson(githubControlsPath);
  const sshHardeningOperationContract = readJson(sshHardeningOperationContractPath);
  const domains = Array.isArray(implementationMap.domains) ? implementationMap.domains : [];
  const criteria = Array.isArray(acceptanceCriteria.criteria) ? acceptanceCriteria.criteria : [];
  const controls = Array.isArray(githubControls.controls) ? githubControls.controls : [];
  const commands = Array.isArray(acceptanceCriteria.requiredCommands)
    ? acceptanceCriteria.requiredCommands
    : [];

  const priorityRows = domains
    .slice()
    .sort((left, right) => Number(left.priority || 0) - Number(right.priority || 0))
    .map(domain =>
      tableRow([
        domain.priority,
        domain.name,
        Array.isArray(domain.evidence) ? domain.evidence.join("; ") : "missing evidence"
      ])
    )
    .join("\n");

  const statusRows = [
    ["Master Prompt document", "Active", implementationMap.contractPath],
    ["Decision record", "Active", implementationMap.decisionRecordPath],
    ["Change checklist", "Active", implementationMap.changeChecklistPath],
    ["Review ownership", "Active", implementationMap.reviewOwnershipPath],
    ["GitHub controls manifest", "Active", implementationMap.githubControlsPath],
    ["GitHub controls documentation", "Active", implementationMap.githubControlsDocPath],
    ["SEIS plugin manifest", "Active", implementationMap.pluginManifestPath],
    ["SEIS GitHub workflow skill", "Active", implementationMap.githubWorkflowSkillPath],
    ["SEIS Security Review skill", "Active", implementationMap.securityReviewSkillPath],
    ["SEIS Master Prompt skill", "Active", implementationMap.skillPath],
    ["Agent-facing instructions", "Active", "AGENTS.md links the active Master Prompt"],
    ["README positioning", "Active", "README.md links the Master Prompt surfaces"],
    ["Implementation map", "Active", implementationMapPath],
    ["Acceptance criteria", "Active", acceptanceCriteriaPath],
    ["Objective coverage matrix", "Active", implementationMap.objectiveCoveragePath],
    ["Objective coverage check", "Active", implementationMap.objectiveCoverageCheckPath],
    ["Objective coverage report", "Active", implementationMap.objectiveCoverageReportPath],
    ["Objective coverage report generator", "Active", implementationMap.objectiveCoverageReportGeneratorPath],
    ["Operational goal tracker", "Active", implementationMap.goalTrackerPath],
    ["Operational goal tracker check", "Active", implementationMap.goalTrackerCheckPath],
    ["Dedicated quality check", "Active", implementationMap.qualityGate],
    ["Dedicated CI workflow", "Active", implementationMap.ciWorkflowPath],
    ["Generated governance report", "Active", reportPath],
    ["Full governance chain", "Active", "quality:governance includes the dedicated check"]
  ].map(tableRow).join("\n");

  const domainRows = domains
    .map(domain =>
      tableRow([
        domain.name,
        Array.isArray(domain.surfaces) ? domain.surfaces.join("; ") : "missing surfaces",
        Array.isArray(domain.evidence) ? domain.evidence.join("; ") : "missing evidence"
      ])
    )
    .join("\n");

  const criteriaRows = criteria
    .map(criterion =>
      tableRow([
        criterion.id,
        criterion.priority,
        criterion.requirement,
        Array.isArray(criterion.evidence) ? criterion.evidence.join("; ") : "missing evidence",
        criterion.verification || "missing verification"
      ])
    )
    .join("\n");

  const controlRows = controls
    .map(control =>
      tableRow([
        control.id,
        control.required ? "required" : "optional",
        control.setting,
        control.reason,
        Array.isArray(control.localEvidence) ? control.localEvidence.join("; ") : "missing local evidence",
        control.externalEvidence || "missing external evidence"
      ])
    )
    .join("\n");

  const commandBlock = commands.map(command => command).join("\n");
  const modeExpectations = sshHardeningOperationContract.modeExpectations || {};
  const modeIsolation = sshHardeningOperationContract.modeIsolation || {};
  const firewallAndLockoutSafety = sshHardeningOperationContract.firewallAndLockoutSafety || {};
  const idempotencyAndFailureHandling = sshHardeningOperationContract.idempotencyAndFailureHandling || {};
  const sshOperationRows = [
    [
      "Mode isolation",
      [
        `harden disallows normal user creation: ${modeIsolation.hardenDisallowsNormalUserCreation === true}`,
        `full-setup requires user setup: ${modeIsolation.fullSetupRequiresUserSetupStep === true}`,
        `audit mutates host: ${modeIsolation.auditMutatesHost === true}`,
        `dashboard mutates host: ${modeIsolation.dashboardMutatesHost === true}`,
        `verify mutates host: ${modeIsolation.verifyMutatesHost === true}`,
        `dry-run mutates host: ${modeIsolation.dryRunMutatesHost === true}`
      ].join("; "),
      "Keep audit/dashboard/verify/dry-run non-mutating and keep harden separate from full setup."
    ],
    [
      "Mode expectations",
      Object.entries(modeExpectations).map(([mode, expectation]) => `${mode}: ${expectation}`).join("; "),
      "Make operator intent explicit before applying SSH or firewall changes."
    ],
    [
      "Firewall and lockout safety",
      Object.entries(firewallAndLockoutSafety).map(([key, value]) => `${key}: ${value}`).join("; "),
      "Require a reviewed plan, second access path, and backend-specific port-knock review before live apply."
    ],
    [
      "Rollback and failure handling",
      Object.entries(idempotencyAndFailureHandling).map(([key, value]) => `${key}: ${value}`).join("; "),
      "Keep live hardening reviewable, idempotency-aware, and fail-fast when critical host mutation fails."
    ]
  ].map(tableRow).join("\n");

  return `# SEIS Master Prompt Governance Report

This report is generated from:

- \`${implementationMapPath}\`
- \`${acceptanceCriteriaPath}\`
- \`${githubControlsPath}\`
- \`${sshHardeningOperationContractPath}\`

It tracks how the SEIS Master Prompt is represented in the repository. It is
intentionally short, reviewable, and tied to a dedicated quality gate so the
operating contract does not remain chat-only context.

## Goal

Keep architecture, security, documentation, AI, cloud, automation, design, and
product strategy aligned through a central SEIS operating contract.

## Priority

| Priority | Area | Evidence |
| --- | --- | --- |
${priorityRows}

## Status

| Surface | Status | Evidence |
| --- | --- | --- |
${statusRows}

## Domain Coverage

| Domain | Repository surfaces | Evidence |
| --- | --- | --- |
${domainRows}

## Acceptance Criteria

| Criterion | Priority | Requirement | Evidence | Verification |
| --- | --- | --- | --- | --- |
${criteriaRows}

## GitHub Controls

| Control | Required | Setting | Reason | Local evidence | External evidence |
| --- | --- | --- | --- | --- | --- |
${controlRows}

## SSH Hardening Operation Contract

| Area | Contract evidence | Governance effect |
| --- | --- | --- |
${sshOperationRows}

## Risks

| Risk | Mitigation |
| --- | --- |
| Governance text drifts away from implementation | Keep the implementation map, acceptance criteria, generated report, and dedicated check in the quality chain. |
| Agent instructions become stale | Require \`AGENTS.md\` to link the active Master Prompt. |
| Security principles stay aspirational | Check Master Prompt surfaces for private-key and inline credential patterns. |
| SSH hardening causes lockout or unsafe host mutation | Keep mode isolation, lockout safety, rollback evidence, and fail-fast behavior tied to the SSH operation contract. |
| Documentation becomes theater | Track concrete surfaces, evidence, validation, acceptance criteria, and next steps in this report. |
| Quality claims are overstated | Do not mark validation as passing unless the related command was actually run. |

## Validation

Expected validation path:

\`\`\`bash
${commandBlock}
\`\`\`

Current report status: not locally verified in this editing turn.

## Next Step

Run \`npm run check:seis-master-prompt-report\`, then
\`npm run check:seis-master-prompt\`, then escalate to
\`npm run check:open-source-governance\` and \`npm run quality\` if the focused
checks pass.

## Acceptance Criteria Source

Canonical criteria are maintained in
\`${acceptanceCriteriaPath}\`. Completion must not be claimed unless those
criteria have current evidence and validation has been run or explicitly waived
by the maintainer.
`;
}

const next = renderReport();
const checkMode = process.argv.includes("--check");

if (checkMode) {
  const current = read(reportPath);
  if (current !== next) {
    console.error(`${reportPath} is stale. Run npm run automation:seis-master-prompt-report.`);
    process.exit(1);
  }
  console.log("SEIS master prompt governance report is current.");
} else {
  writeFileSync(resolve(root, reportPath), next);
  console.log(`Wrote ${reportPath}`);
}
