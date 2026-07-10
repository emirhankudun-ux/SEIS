import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "..");
const failures = [];

function read(relativePath) {
  const absolutePath = resolve(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return readFileSync(absolutePath, "utf8");
}

function requireIncludes(file, text, reason = text) {
  const contents = read(file);
  if (!contents.includes(text)) {
    failures.push(`${file} must include ${reason}`);
  }
}

function requireNotMatches(file, pattern, reason) {
  const contents = read(file);
  if (pattern.test(contents)) {
    failures.push(`${file} must not include ${reason}`);
  }
}

const constitutionalPath = "AGENTS.md";
const masterPromptPath = "docs/governance/seis-master-prompt.md";
const supremeVisionPath = "docs/governance/seis-supreme-vision.md";
const decisionRecordPath = "docs/governance/adr-0001-seis-master-prompt-operating-contract.md";
const changeChecklistPath = "docs/governance/seis-master-prompt-change-checklist.md";
const ciWorkflowPath = ".github/workflows/seis-master-prompt-governance.yml";
const implementationMapPath = "data/seis-master-prompt-implementation-map.json";
const acceptanceCriteriaPath = "data/seis-master-prompt-acceptance-criteria.json";
const githubControlsPath = "data/seis-master-prompt-github-controls.json";
const githubControlsDocPath = "docs/governance/seis-master-prompt-github-controls.md";
const pluginManifestPath = "plugins/seis/.codex-plugin/plugin.json";
const githubWorkflowSkillPath = "plugins/seis/skills/seis-github-workflow/SKILL.md";
const githubWorkflowSkillAgentPath = "plugins/seis/skills/seis-github-workflow/agents/openai.yaml";
const securityReviewSkillPath = "plugins/seis/skills/seis-security-review/SKILL.md";
const securityReviewSkillAgentPath = "plugins/seis/skills/seis-security-review/agents/openai.yaml";
const skillPath = "plugins/seis/skills/seis-master-prompt/SKILL.md";
const skillAgentPath = "plugins/seis/skills/seis-master-prompt/agents/openai.yaml";
const reportGeneratorPath = "scripts/create-seis-master-prompt-governance-report.mjs";
const sshHardeningContractPath = "scripts/check-ssh-hardening-contract.mjs";
const sshHardeningOperationContractPath = "data/ssh-hardening-operation-contract.json";
const sshWireGuardDeploymentGuidePath = "docs/deployment/ssh-wireguard-vps-cloud-server.md";
const objectiveCoveragePath = "data/seis-master-objective-coverage.json";
const objectiveCoverageCheckPath = "scripts/check-seis-master-objective-coverage.mjs";
const objectiveCoverageReportPath = "reports/seis-master-objective-coverage.md";
const objectiveCoverageReportGeneratorPath = "scripts/create-seis-master-objective-coverage-report.mjs";
const operationalGoalTrackerPath = "data/seis-operational-goal-tracker.json";
const operationalGoalTrackerCheckPath = "scripts/check-seis-operational-goal-tracker.mjs";
const governanceReportPath = "reports/seis-master-prompt-governance.md";
const issueTemplatePath = ".github/ISSUE_TEMPLATE/master_prompt_governance.md";
const codeownersPath = ".github/CODEOWNERS";

for (const file of [
  "README.md",
  "AGENTS.md",
  codeownersPath,
  ciWorkflowPath,
  pluginManifestPath,
  githubWorkflowSkillPath,
  githubWorkflowSkillAgentPath,
  securityReviewSkillPath,
  securityReviewSkillAgentPath,
  skillPath,
  skillAgentPath,
  ".github/PULL_REQUEST_TEMPLATE.md",
  issueTemplatePath,
  "package.json",
  "scripts/check-open-source-governance.mjs",
  sshHardeningContractPath,
  objectiveCoverageCheckPath,
  objectiveCoverageReportGeneratorPath,
  operationalGoalTrackerCheckPath,
  reportGeneratorPath,
  githubControlsPath,
  sshHardeningOperationContractPath,
  sshWireGuardDeploymentGuidePath,
  objectiveCoveragePath,
  operationalGoalTrackerPath,
  githubControlsDocPath,
  supremeVisionPath,
  acceptanceCriteriaPath,
  changeChecklistPath,
  decisionRecordPath,
  implementationMapPath,
  governanceReportPath,
  objectiveCoverageReportPath,
  masterPromptPath
]) {
  read(file);
}

for (const [file, required] of [
  ["README.md", "SEIS Master Prompt"],
  ["README.md", decisionRecordPath],
  ["README.md", supremeVisionPath],
  ["README.md", changeChecklistPath],
  ["README.md", ciWorkflowPath],
  ["README.md", githubControlsDocPath],
  ["README.md", skillPath],
  ["README.md", securityReviewSkillPath],
  ["README.md", masterPromptPath],
  ["README.md", supremeVisionPath],
  ["README.md", acceptanceCriteriaPath],
  ["README.md", objectiveCoveragePath],
  ["README.md", objectiveCoverageReportPath],
  ["README.md", operationalGoalTrackerPath],
  ["README.md", implementationMapPath],
  ["README.md", governanceReportPath],
  ["README.md", "npm run check:seis-master-prompt"],
  ["README.md", "npm run check:seis-master-prompt-report"],
  ["AGENTS.md", "Master Prompt"],
  ["AGENTS.md", "Enterprise v4.0"],
  ["AGENTS.md", "Apple-First Constitution"],
  ["AGENTS.md", "docs/SEIS_GOAL_TRACKING.md"],
  ["AGENTS.md", "Final Execution Protocol"],
  ["plugins/seis/README.md", "skills/seis-master-prompt/SKILL.md"],
  ["plugins/seis/README.md", "skills/seis-security-review/SKILL.md"],
  ["plugins/seis/README.md", "npm run check:seis-master-prompt-report"],
  ["plugins/seis/README.md", "npm run check:seis-master-prompt"],
  [codeownersPath, "/docs/governance/seis-master-prompt.md @emirhankudun-ux"],
  [codeownersPath, "/docs/governance/seis-supreme-vision.md @emirhankudun-ux"],
  [codeownersPath, "/docs/governance/seis-master-prompt-change-checklist.md @emirhankudun-ux"],
  [codeownersPath, "/docs/governance/seis-master-prompt-github-controls.md @emirhankudun-ux"],
  [codeownersPath, "/docs/governance/adr-0001-seis-master-prompt-operating-contract.md @emirhankudun-ux"],
  [codeownersPath, "/data/seis-master-prompt-implementation-map.json @emirhankudun-ux"],
  [codeownersPath, "/data/seis-master-prompt-acceptance-criteria.json @emirhankudun-ux"],
  [codeownersPath, "/data/seis-master-prompt-github-controls.json @emirhankudun-ux"],
  [codeownersPath, "/docs/deployment/ssh-wireguard-vps-cloud-server.md @emirhankudun-ux"],
  [codeownersPath, "/reports/seis-master-prompt-governance.md @emirhankudun-ux"],
  [codeownersPath, "/scripts/check-seis-master-prompt.mjs @emirhankudun-ux"],
  [codeownersPath, "/scripts/create-seis-master-prompt-governance-report.mjs @emirhankudun-ux"],
  [codeownersPath, "/plugins/seis/.codex-plugin/plugin.json @emirhankudun-ux"],
  [codeownersPath, "/plugins/seis/skills/seis-github-workflow/SKILL.md @emirhankudun-ux"],
  [codeownersPath, "/plugins/seis/skills/seis-github-workflow/agents/openai.yaml @emirhankudun-ux"],
  [codeownersPath, "/plugins/seis/skills/seis-master-prompt/SKILL.md @emirhankudun-ux"],
  [codeownersPath, "/plugins/seis/skills/seis-master-prompt/agents/openai.yaml @emirhankudun-ux"],
  [codeownersPath, "/plugins/seis/skills/seis-security-review/SKILL.md @emirhankudun-ux"],
  [codeownersPath, "/plugins/seis/skills/seis-security-review/agents/openai.yaml @emirhankudun-ux"],
  [pluginManifestPath, "SEIS Master Prompt governance"],
  [pluginManifestPath, "SEIS GitHub workflow governance"],
  [pluginManifestPath, "SEIS Security Review governance"],
  [pluginManifestPath, "Use SEIS Master Prompt governance for architecture, security, documentation, AI, cloud, product, and quality changes."],
  [pluginManifestPath, "Use SEIS GitHub workflow governance to plan branch, PR, checks, CODEOWNERS, and source-of-truth handoff."],
  [pluginManifestPath, "Use SEIS Security Review governance to inspect secrets, least privilege, SSH/cloud risk, GitHub readiness, and validation claims."],
  [githubWorkflowSkillPath, "name: seis-github-workflow"],
  [githubWorkflowSkillPath, "Govern SEIS GitHub source-of-truth workflows"],
  [githubWorkflowSkillPath, "Canonical Surfaces"],
  [githubWorkflowSkillPath, ".github/workflows/seis-master-prompt-governance.yml"],
  [githubWorkflowSkillPath, "Do not claim pushed, merged, deployed, connected, ready, or protected without"],
  [githubWorkflowSkillAgentPath, "display_name: \"SEIS GitHub Workflow\""],
  [githubWorkflowSkillAgentPath, "short_description: \"Govern SEIS GitHub PR and check workflows.\""],
  [securityReviewSkillPath, "name: seis-security-review"],
  [securityReviewSkillPath, "Review SEIS security, privacy, least-privilege"],
  [securityReviewSkillPath, "Canonical Surfaces"],
  [securityReviewSkillPath, "scripts/ultra_ssh_manager.py"],
  [securityReviewSkillPath, "Do not claim pushed, merged, deployed, connected"],
  [securityReviewSkillAgentPath, "display_name: \"SEIS Security Review\""],
  [securityReviewSkillAgentPath, "short_description: \"Review SEIS security and privacy changes.\""],
  [skillPath, "name: seis-master-prompt"],
  [skillPath, "Govern SEIS Master Prompt work inside the SEIS GitHub repository"],
  [skillPath, "Canonical Surfaces"],
  [skillPath, "data/seis-master-prompt-github-controls.json"],
  [skillPath, "npm run check:seis-master-prompt-report"],
  [skillPath, "Verify GitHub settings or check runs before claiming external readiness"],
  [skillAgentPath, "display_name: \"SEIS Master Prompt\""],
  [skillAgentPath, "short_description: \"Govern SEIS Master Prompt workflows.\""],
  [".github/PULL_REQUEST_TEMPLATE.md", "Goal ID"],
  [".github/PULL_REQUEST_TEMPLATE.md", "Architecture Impact"],
  [".github/PULL_REQUEST_TEMPLATE.md", "Failed or Skipped Checks"],
  [".github/PULL_REQUEST_TEMPLATE.md", "Preserves demo/live and public/private boundaries"],
  [".github/PULL_REQUEST_TEMPLATE.md", "Reports failed and skipped checks honestly"],
  [issueTemplatePath, "SEIS Master Prompt governance"],
  [issueTemplatePath, "docs/governance/seis-master-prompt.md"],
  [issueTemplatePath, "docs/governance/seis-master-prompt-change-checklist.md"],
  [issueTemplatePath, "data/seis-master-prompt-implementation-map.json"],
  [issueTemplatePath, "data/seis-master-prompt-acceptance-criteria.json"],
  [issueTemplatePath, "scripts/check-seis-master-prompt.mjs"],
  [issueTemplatePath, "npm run check:seis-master-prompt-report"],
  [issueTemplatePath, "npm run check:seis-master-prompt"],
  [issueTemplatePath, "explicitly waived by the maintainer"],
  [issueTemplatePath, "No deploy, merge, push, delete, or history rewrite"],
  [ciWorkflowPath, "SEIS Master Prompt Governance"],
  [ciWorkflowPath, "actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5"],
  [ciWorkflowPath, "npm run check:seis-master-prompt-report"],
  [ciWorkflowPath, "npm run check:seis-master-prompt"],
  [ciWorkflowPath, githubControlsPath],
  [ciWorkflowPath, githubControlsDocPath],
  [ciWorkflowPath, pluginManifestPath],
  [ciWorkflowPath, githubWorkflowSkillPath],
  [ciWorkflowPath, githubWorkflowSkillAgentPath],
  [ciWorkflowPath, securityReviewSkillPath],
  [ciWorkflowPath, securityReviewSkillAgentPath],
  [ciWorkflowPath, skillPath],
  [ciWorkflowPath, skillAgentPath],
  [ciWorkflowPath, sshWireGuardDeploymentGuidePath],
  [ciWorkflowPath, "permissions:"],
  [ciWorkflowPath, "contents: read"],
  ["scripts/check-open-source-governance.mjs", masterPromptPath],
  [decisionRecordPath, "# ADR 0001: SEIS Master Prompt as Operating Contract"],
  [decisionRecordPath, "Status: Superseded"],
  [decisionRecordPath, "Root `AGENTS.md` Enterprise v4.0"],
  [masterPromptPath, "Status: Compatibility companion"],
  [masterPromptPath, "Root `AGENTS.md` Enterprise v4.0"],
  [decisionRecordPath, "Root `AGENTS.md` Enterprise v4.0 is the active repository operating"],
  [decisionRecordPath, "npm run check:seis-master-prompt"],
  [decisionRecordPath, "Validation must not be claimed unless these commands are actually run"],
  [masterPromptPath, supremeVisionPath],
  [masterPromptPath, "ecosystem itself is the product"],
  [supremeVisionPath, "# SEIS Supreme Vision"],
  [supremeVisionPath, "Status: Active long-term vision"],
  [supremeVisionPath, "Apple-first, AI-native, design-driven"],
  [supremeVisionPath, "human-AI collaborative intelligence"],
  [supremeVisionPath, "SEIS is not about creating more code or complexity"],
  [supremeVisionPath, "architecture, knowledge"],
  [supremeVisionPath, "automation, design"],
  [supremeVisionPath, "engineering excellence"],
  [supremeVisionPath, "## Long-Term Vision"],
  [supremeVisionPath, "world-class intelligence ecosystem"],
  [supremeVisionPath, "human creativity"],
  [supremeVisionPath, "software engineering"],
  [supremeVisionPath, "product design"],
  [supremeVisionPath, "knowledge systems"],
  [supremeVisionPath, "autonomous agents"],
  [supremeVisionPath, "large language models"],
  [supremeVisionPath, "research systems"],
  [supremeVisionPath, "cloud infrastructure"],
  [supremeVisionPath, "automation workflows"],
  [supremeVisionPath, "decision intelligence"],
  [supremeVisionPath, "Architecture compounds"],
  [supremeVisionPath, "Knowledge compounds"],
  [supremeVisionPath, "Documentation compounds"],
  [supremeVisionPath, "Automation compounds"],
  [supremeVisionPath, "Trust compounds"],
  [supremeVisionPath, "## Operating Principles"],
  [supremeVisionPath, "Protect user work"],
  [supremeVisionPath, "Protect privacy"],
  [supremeVisionPath, "Protect security"],
  [supremeVisionPath, "Preserve architectural integrity"],
  [supremeVisionPath, "Prefer simplicity"],
  [supremeVisionPath, "Prefer maintainability"],
  [supremeVisionPath, "Prefer clarity"],
  [supremeVisionPath, "Never expose secrets"],
  [supremeVisionPath, "Never sacrifice security"],
  [supremeVisionPath, "Never create artificial complexity"],
  [supremeVisionPath, "## Focus Mode"],
  [supremeVisionPath, "SEIS uses focus mode"],
  [supremeVisionPath, "unnecessary context switching"],
  [supremeVisionPath, "tool inflation"],
  [supremeVisionPath, "Focus mode is not a shortcut"],
  [supremeVisionPath, "## Intelligence Layer"],
  [supremeVisionPath, "future AI systems"],
  [supremeVisionPath, "The objective is not replacing humans"],
  [supremeVisionPath, "understand, reason, plan"],
  [supremeVisionPath, "organize, document, automate, learn, and collaborate"],
  [supremeVisionPath, "## Engineering Layer"],
  [supremeVisionPath, "platform engineering"],
  [supremeVisionPath, "security engineering"],
  [supremeVisionPath, "AI engineering"],
  [supremeVisionPath, "infrastructure"],
  [supremeVisionPath, "maintainability, performance, security"],
  [supremeVisionPath, "scalability, ecosystem maturity, and long-term value"],
  [supremeVisionPath, "## Design Layer"],
  [supremeVisionPath, "Design is infrastructure"],
  [supremeVisionPath, "premium, minimal, elegant, accessible"],
  [supremeVisionPath, "modern, calm"],
  [supremeVisionPath, "## Knowledge Layer"],
  [supremeVisionPath, "Knowledge is a strategic asset"],
  [supremeVisionPath, "architecture decisions"],
  [supremeVisionPath, "lessons"],
  [supremeVisionPath, "learned"],
  [supremeVisionPath, "reusable patterns"],
  [supremeVisionPath, "institutional memory"],
  [supremeVisionPath, "## Autonomy Layer"],
  [supremeVisionPath, "planning, reasoning, automation, memory, tooling, and workflows"],
  [supremeVisionPath, "Autonomy must remain safe, observable, and controllable"],
  [supremeVisionPath, "Security and governance"],
  [supremeVisionPath, "## Future Direction"],
  [supremeVisionPath, "AI-native software"],
  [supremeVisionPath, "collaborative intelligence"],
  [supremeVisionPath, "## Final Directive"],
  [supremeVisionPath, "The ecosystem itself is the product, and SEIS uses focus mode"],
  [changeChecklistPath, "# SEIS Master Prompt Change Checklist"],
  [changeChecklistPath, "User Work Protection"],
  [changeChecklistPath, "Security and Privacy"],
  [changeChecklistPath, "Architecture and Maintainability"],
  [changeChecklistPath, "Validation"],
  [changeChecklistPath, "npm run check:seis-master-prompt-report"],
  [changeChecklistPath, "explicit maintainer approval"],
  [githubControlsDocPath, "# SEIS Master Prompt GitHub Controls"],
  [githubControlsDocPath, "GitHub branch protection settings"],
  [githubControlsDocPath, "Required status checks"],
  [githubControlsDocPath, "CODEOWNERS review"],
  [githubControlsDocPath, "Do not claim these controls are active unless"],
  [githubControlsDocPath, githubControlsPath],
  [sshHardeningContractPath, "SEIS SSH hardening contract check passed."],
  [sshHardeningContractPath, "credentialHandling"],
  [sshHardeningContractPath, "check:ssh-hardening-contract"],
  [sshHardeningContractPath, "backup metadata must record source hash"],
  [sshHardeningContractPath, "backup metadata must record backup copy hash"],
  [sshHardeningContractPath, "backup metadata must record skipped missing sources"],
  [sshHardeningContractPath, "backup metadata must expose manifest status"],
  [sshHardeningContractPath, "backup metadata must represent partial manifests when sources are skipped"],
  [sshHardeningContractPath, "backup directory must be owner-only"],
  [sshHardeningContractPath, "backup metadata must be owner-only"],
  [sshHardeningContractPath, "rollback must restore source file mode"],
  [sshHardeningContractPath, "operation reports must summarize backup manifests"],
  [sshHardeningContractPath, "operation reports must expose rollback evidence"],
  [sshHardeningContractPath, "rollback evidence must list restored files"],
  [sshHardeningContractPath, "rollback evidence must default to not-run"],
  [sshHardeningContractPath, "rollback evidence must list hash-verified files"],
  [sshHardeningContractPath, "rollback evidence must expose hash verification status"],
  [sshHardeningContractPath, "mode dispatch must remain explicit"],
  [sshHardeningContractPath, "harden mode must skip normal user setup"],
  [sshHardeningContractPath, "firewalld strict port-knock limitations must be explicit"],
  [sshHardeningContractPath, "managed configuration writes must stay idempotency-aware"],
  [sshHardeningContractPath, "live apply must require explicit operator safety confirmation"],
  [sshHardeningContractPath, "non-interactive live apply must use an explicit safety confirmation flag"],
  [sshHardeningContractPath, "mutating apply confirmation must be logged before live hardening"],
  [sshHardeningContractPath, "dry-run/apply plans must expose live-apply safety policy"],
  [sshHardeningContractPath, "operation reports must expose live-apply safety evidence"],
  [sshHardeningContractPath, "verification reports to expose live-apply safety evidence"],
  [sshHardeningContractPath, "live-apply safety evidence must expose confirmation status"],
  [sshHardeningContractPath, "recovery playbook must include live-apply safety instructions"],
  [sshHardeningOperationContractPath, "SEIS SSH Hardening Operation Contract"],
  [sshHardeningOperationContractPath, "\"privateKeyMaterialLogged\": false"],
  [sshHardeningOperationContractPath, "\"temporaryPasswordsGenerated\": false"],
  [sshHardeningOperationContractPath, "\"backupMetadataMustRecordSourceAndBackupHashes\": true"],
  [sshHardeningOperationContractPath, "\"backupMetadataHashAlgorithm\": \"sha256\""],
  [sshHardeningOperationContractPath, "\"backupMetadataMustRecordSkippedSources\": true"],
  [sshHardeningOperationContractPath, "\"backupMetadataMustExposeManifestStatus\": true"],
  [sshHardeningOperationContractPath, "\"backupDirectoryMode\": \"0700\""],
  [sshHardeningOperationContractPath, "\"backupMetadataMode\": \"0600\""],
  [sshHardeningOperationContractPath, "\"backupArtifactFileMode\": \"0600\""],
  [sshHardeningOperationContractPath, "\"rollbackMustRestoreSourceFileMode\": true"],
  [sshHardeningOperationContractPath, "\"backupMetadataManifestStatusValues\""],
  [sshHardeningOperationContractPath, "\"operationReportMustSummarizeBackupManifest\": true"],
  [sshHardeningOperationContractPath, "\"operationReportMustExposeRollbackEvidence\": true"],
  [sshHardeningOperationContractPath, "\"rollbackEvidenceMustListRestoredAndSkippedFiles\": true"],
  [sshHardeningOperationContractPath, "\"rollbackEvidenceDefaultStatus\": \"not-run\""],
  [sshHardeningOperationContractPath, "\"rollbackEvidenceStatusValues\""],
  [sshHardeningOperationContractPath, "\"rollbackMustVerifyRestoredFileHashes\": true"],
  [sshHardeningOperationContractPath, "\"rollbackHashVerificationStatusValues\""],
  [sshHardeningOperationContractPath, "\"modeIsolation\""],
  [sshHardeningOperationContractPath, "\"hardenDisallowsNormalUserCreation\": true"],
  [sshHardeningOperationContractPath, "\"firewallAndLockoutSafety\""],
  [sshHardeningOperationContractPath, "\"portKnockApplyDefault\": false"],
  [sshHardeningOperationContractPath, "\"liveApplyPreflightConfirmationRequired\": true"],
  [sshHardeningOperationContractPath, "\"liveApplyRequiresPlanAndRecoveryReview\": true"],
  [sshHardeningOperationContractPath, "\"mutatingApplyRequiresInteractiveConfirmOrExplicitCliFlag\": true"],
  [sshHardeningOperationContractPath, "\"nonInteractiveLiveApplyRequiresExplicitCliFlag\": \"--confirm-live-apply-safety\""],
  [sshHardeningOperationContractPath, "\"planMustExposeLiveApplySafetyPolicy\": true"],
  [sshHardeningOperationContractPath, "\"operationReportMustExposeLiveApplySafetyEvidence\": true"],
  [sshHardeningOperationContractPath, "\"verificationReportMustExposeLiveApplySafetyEvidence\": true"],
  [sshHardeningOperationContractPath, "\"liveApplySafetyEvidenceMustExposeConfirmationStatus\": true"],
  [sshHardeningOperationContractPath, "\"idempotencyAndFailureHandling\""],
  [sshHardeningOperationContractPath, "\"singleOperationReportRequired\": true"],
  [sshWireGuardDeploymentGuidePath, "Mode separation"],
  [sshWireGuardDeploymentGuidePath, "Lockout safety"],
  [sshWireGuardDeploymentGuidePath, "Rollback and evidence"],
  [sshWireGuardDeploymentGuidePath, "liveApplySafety"],
  [objectiveCoveragePath, "SEIS Master Objective Coverage"],
  [objectiveCoveragePath, "\"user-work-protection\""],
  [objectiveCoveragePath, "\"security-and-privacy\""],
  [objectiveCoveragePath, "\"apple-first-platform\""],
  [objectiveCoveragePath, "\"design-accessibility-experience\""],
  [objectiveCoveragePath, "\"ai-data-cloud-automation\""],
  [objectiveCoveragePath, "\"open-source-github-readiness\""],
  [objectiveCoverageCheckPath, "SEIS master objective coverage check passed."],
  [objectiveCoverageCheckPath, "check:seis-master-objective-coverage"],
  [objectiveCoverageCheckPath, "SSH Hardening Operation Coverage"],
  [objectiveCoverageCheckPath, "mode-isolation"],
  [objectiveCoverageCheckPath, "lockout-safety"],
  [objectiveCoverageCheckPath, "fail-fast"],
  [objectiveCoverageReportPath, "# SEIS Master Objective Coverage Report"],
  [objectiveCoverageReportPath, "## Coverage Matrix"],
  [objectiveCoverageReportPath, "## SSH Hardening Operation Coverage"],
  [objectiveCoverageReportPath, "Mode isolation"],
  [objectiveCoverageReportPath, "Firewall and lockout safety"],
  [objectiveCoverageReportPath, "Idempotency and failure handling"],
  [objectiveCoverageReportPath, "## Required Validation Path"],
  [objectiveCoverageReportGeneratorPath, "renderReport"],
  [objectiveCoverageReportGeneratorPath, "--check"],
  [objectiveCoverageReportGeneratorPath, sshHardeningOperationContractPath],
  [objectiveCoverageReportGeneratorPath, "SSH Hardening Operation Coverage"],
  [operationalGoalTrackerPath, "SEIS Operational Goal Tracker"],
  [operationalGoalTrackerPath, "\"goal\""],
  [operationalGoalTrackerPath, "\"priority\""],
  [operationalGoalTrackerPath, "\"status\""],
  [operationalGoalTrackerPath, "\"risks\""],
  [operationalGoalTrackerPath, "\"validation\""],
  [operationalGoalTrackerPath, "\"nextStep\""],
  [operationalGoalTrackerCheckPath, "SEIS operational goal tracker check passed."],
  [operationalGoalTrackerCheckPath, "check:seis-operational-goal-tracker"],
  [operationalGoalTrackerCheckPath, "Mode drift"],
  [operationalGoalTrackerCheckPath, "Harden and full-setup remain separate code paths"],
  [operationalGoalTrackerCheckPath, "Live apply requires reviewed plan"],
  [operationalGoalTrackerCheckPath, "dry-run plan"],
  [reportGeneratorPath, "renderReport"],
  [reportGeneratorPath, "--check"],
  [reportGeneratorPath, implementationMapPath],
  [reportGeneratorPath, acceptanceCriteriaPath],
  [reportGeneratorPath, githubControlsPath],
  [reportGeneratorPath, governanceReportPath],
  [reportGeneratorPath, "pluginManifestPath"],
  [reportGeneratorPath, "skillPath"],
  [reportGeneratorPath, "securityReviewSkillPath"],
  [reportGeneratorPath, "objectiveCoveragePath"],
  [reportGeneratorPath, "objectiveCoverageReportPath"],
  [reportGeneratorPath, "goalTrackerPath"],
  [reportGeneratorPath, sshHardeningOperationContractPath],
  [reportGeneratorPath, "SSH Hardening Operation Contract"],
  [reportGeneratorPath, "Mode isolation"],
  [reportGeneratorPath, "Firewall and lockout safety"],
  [reportGeneratorPath, "Rollback and failure handling"],
  [acceptanceCriteriaPath, "mode isolation"],
  [acceptanceCriteriaPath, "lockout safety"],
  [acceptanceCriteriaPath, "rollback evidence"],
  [acceptanceCriteriaPath, "fail-fast expectations"],
  [implementationMapPath, "SSH hardening mode-isolation contract"],
  [implementationMapPath, "firewall and port-knock lockout safety contract"],
  [implementationMapPath, "rollback, idempotency, and fail-fast operation evidence contract"],
  [masterPromptPath, "# SEIS Master Prompt"],
  [masterPromptPath, "Mission"],
  [masterPromptPath, "Core Principles"],
  [masterPromptPath, "Operating Roles"],
  [masterPromptPath, "Standard Workflow"],
  [masterPromptPath, "Technology Direction"],
  [masterPromptPath, "Repository Rules"],
  [masterPromptPath, "Security Rules"],
  [masterPromptPath, "Quality Rules"],
  [masterPromptPath, "Tracking Format"],
  [masterPromptPath, changeChecklistPath],
  [masterPromptPath, decisionRecordPath],
  [masterPromptPath, "Implementation Map"],
  [masterPromptPath, objectiveCoveragePath],
  [masterPromptPath, objectiveCoverageReportPath],
  [masterPromptPath, operationalGoalTrackerPath],
  [masterPromptPath, securityReviewSkillPath],
  [masterPromptPath, acceptanceCriteriaPath],
  [masterPromptPath, implementationMapPath],
  [masterPromptPath, governanceReportPath],
  [masterPromptPath, "Success Definition"],
  [masterPromptPath, "Protect user work"],
  [masterPromptPath, "Prioritize security and privacy"],
  [masterPromptPath, "Preserve architectural integrity"],
  [masterPromptPath, "least privilege"],
  [masterPromptPath, "Do not deploy, merge, push, delete, or rewrite history without explicit user approval"],
  [masterPromptPath, "Final Directive"]
]) {
  requireIncludes(file, required);
}

for (const required of [
  "# SEIS Master Prompt Governance Report",
  "This report is generated from:",
  implementationMapPath,
  acceptanceCriteriaPath,
  githubControlsPath,
  "## Goal",
  "## Priority",
  "## Status",
  "## Domain Coverage",
  "## Acceptance Criteria",
  "## GitHub Controls",
  sshHardeningOperationContractPath,
  "## SSH Hardening Operation Contract",
  "Mode isolation",
  "Firewall and lockout safety",
  "Rollback and failure handling",
  "SSH hardening causes lockout or unsafe host mutation",
  pluginManifestPath,
  githubWorkflowSkillPath,
  securityReviewSkillPath,
  skillPath,
  "## Risks",
  "## Validation",
  "## Next Step",
  "## Acceptance Criteria Source",
  "npm run check:seis-master-prompt-report",
  "npm run check:seis-master-prompt",
  "Current report status: not locally verified in this editing turn"
]) {
  requireIncludes(governanceReportPath, required);
}

let implementationMap = {};
try {
  implementationMap = JSON.parse(read(implementationMapPath) || "{}");
} catch (error) {
  failures.push(`${implementationMapPath} must contain valid JSON: ${error.message}`);
}

let acceptanceCriteria = {};
try {
  acceptanceCriteria = JSON.parse(read(acceptanceCriteriaPath) || "{}");
} catch (error) {
  failures.push(`${acceptanceCriteriaPath} must contain valid JSON: ${error.message}`);
}

let githubControls = {};
try {
  githubControls = JSON.parse(read(githubControlsPath) || "{}");
} catch (error) {
  failures.push(`${githubControlsPath} must contain valid JSON: ${error.message}`);
}

if (githubControls.contract !== "SEIS Enterprise Constitution") {
  failures.push(`${githubControlsPath} must identify the SEIS Enterprise Constitution`);
}
if (githubControls.contractPath !== constitutionalPath) {
  failures.push(`${githubControlsPath} must point to ${constitutionalPath}`);
}
if (githubControls.companionContractPath !== masterPromptPath) {
  failures.push(`${githubControlsPath} must retain ${masterPromptPath} as a companion`);
}
const requiredControls = [
  "main-branch-protection",
  "required-master-prompt-checks",
  "codeowners-review",
  "no-direct-deploy-or-push-assumption"
];
const controls = Array.isArray(githubControls.controls) ? githubControls.controls : [];
for (const control of requiredControls) {
  const match = controls.find(entry => entry && entry.id === control);
  if (!match) {
    failures.push(`${githubControlsPath} must include ${control} control`);
    continue;
  }
  if (match.required !== true) {
    failures.push(`${githubControlsPath} ${control} must be required`);
  }
  if (!Array.isArray(match.localEvidence) || match.localEvidence.length < 1) {
    failures.push(`${githubControlsPath} ${control} must list local evidence`);
  }
  if (!match.externalEvidence) {
    failures.push(`${githubControlsPath} ${control} must list external evidence`);
  }
}

if (acceptanceCriteria.contract !== "SEIS Enterprise Constitution") {
  failures.push(`${acceptanceCriteriaPath} must identify the SEIS Enterprise Constitution`);
}
if (acceptanceCriteria.contractPath !== constitutionalPath) {
  failures.push(`${acceptanceCriteriaPath} must point to ${constitutionalPath}`);
}
if (acceptanceCriteria.companionContractPath !== masterPromptPath) {
  failures.push(`${acceptanceCriteriaPath} must retain ${masterPromptPath} as a companion`);
}

const requiredCriteria = [
  "user-work-protection",
  "security-and-privacy",
  "architecture-integrity",
  "documentation-and-traceability",
  "quality-gate-integration",
  "ai-cloud-product-coverage"
];
const criteria = Array.isArray(acceptanceCriteria.criteria) ? acceptanceCriteria.criteria : [];
for (const criterion of requiredCriteria) {
  const match = criteria.find(entry => entry && entry.id === criterion);
  if (!match) {
    failures.push(`${acceptanceCriteriaPath} must include ${criterion} acceptance criterion`);
    continue;
  }
  if (!Array.isArray(match.evidence) || match.evidence.length < 2) {
    failures.push(`${acceptanceCriteriaPath} ${criterion} criterion must list evidence`);
  }
  if (!match.verification) {
    failures.push(`${acceptanceCriteriaPath} ${criterion} criterion must include verification guidance`);
  }
}
for (const command of [
  "npm run check:seis-master-prompt-report",
  "npm run check:seis-master-prompt",
  "npm run check:seis-master-objective-coverage-report",
  "npm run check:seis-master-objective-coverage",
  "npm run check:seis-operational-goal-tracker",
  "npm run check:ssh-hardening-contract",
  "npm run check:open-source-governance",
  "npm run quality"
]) {
  if (!Array.isArray(acceptanceCriteria.requiredCommands) || !acceptanceCriteria.requiredCommands.includes(command)) {
    failures.push(`${acceptanceCriteriaPath} must require ${command}`);
  }
}

if (implementationMap.contract !== "SEIS Enterprise Constitution") {
  failures.push(`${implementationMapPath} must identify the SEIS Enterprise Constitution`);
}
if (implementationMap.contractPath !== constitutionalPath) {
  failures.push(`${implementationMapPath} must point to ${constitutionalPath}`);
}
if (implementationMap.companionContractPath !== masterPromptPath) {
  failures.push(`${implementationMapPath} must retain ${masterPromptPath} as a companion`);
}
if (implementationMap.decisionRecordPath !== decisionRecordPath) {
  failures.push(`${implementationMapPath} must point to ${decisionRecordPath}`);
}
if (implementationMap.changeChecklistPath !== changeChecklistPath) {
  failures.push(`${implementationMapPath} must point to ${changeChecklistPath}`);
}
if (implementationMap.reviewOwnershipPath !== codeownersPath) {
  failures.push(`${implementationMapPath} must point to ${codeownersPath}`);
}
if (implementationMap.githubControlsPath !== githubControlsPath) {
  failures.push(`${implementationMapPath} must point to ${githubControlsPath}`);
}
if (implementationMap.githubControlsDocPath !== githubControlsDocPath) {
  failures.push(`${implementationMapPath} must point to ${githubControlsDocPath}`);
}
if (implementationMap.pluginManifestPath !== pluginManifestPath) {
  failures.push(`${implementationMapPath} must point to ${pluginManifestPath}`);
}
if (implementationMap.githubWorkflowSkillPath !== githubWorkflowSkillPath) {
  failures.push(`${implementationMapPath} must point to ${githubWorkflowSkillPath}`);
}
if (implementationMap.securityReviewSkillPath !== securityReviewSkillPath) {
  failures.push(`${implementationMapPath} must point to ${securityReviewSkillPath}`);
}
if (implementationMap.skillPath !== skillPath) {
  failures.push(`${implementationMapPath} must point to ${skillPath}`);
}
if (implementationMap.ciWorkflowPath !== ciWorkflowPath) {
  failures.push(`${implementationMapPath} must point to ${ciWorkflowPath}`);
}
if (implementationMap.reportGeneratorPath !== reportGeneratorPath) {
  failures.push(`${implementationMapPath} must point to ${reportGeneratorPath}`);
}
if (implementationMap.objectiveCoveragePath !== objectiveCoveragePath) {
  failures.push(`${implementationMapPath} must point to ${objectiveCoveragePath}`);
}
if (implementationMap.objectiveCoverageCheckPath !== objectiveCoverageCheckPath) {
  failures.push(`${implementationMapPath} must point to ${objectiveCoverageCheckPath}`);
}
if (implementationMap.objectiveCoverageReportPath !== objectiveCoverageReportPath) {
  failures.push(`${implementationMapPath} must point to ${objectiveCoverageReportPath}`);
}
if (implementationMap.objectiveCoverageReportGeneratorPath !== objectiveCoverageReportGeneratorPath) {
  failures.push(`${implementationMapPath} must point to ${objectiveCoverageReportGeneratorPath}`);
}
if (implementationMap.goalTrackerPath !== operationalGoalTrackerPath) {
  failures.push(`${implementationMapPath} must point to ${operationalGoalTrackerPath}`);
}
if (implementationMap.goalTrackerCheckPath !== operationalGoalTrackerCheckPath) {
  failures.push(`${implementationMapPath} must point to ${operationalGoalTrackerCheckPath}`);
}
if (implementationMap.qualityGate !== "npm run check:seis-master-prompt") {
  failures.push(`${implementationMapPath} must expose the dedicated quality gate`);
}
if (!JSON.stringify(implementationMap).includes(acceptanceCriteriaPath)) {
  failures.push(`${implementationMapPath} must reference ${acceptanceCriteriaPath}`);
}
if (!JSON.stringify(implementationMap).includes(decisionRecordPath)) {
  failures.push(`${implementationMapPath} must reference ${decisionRecordPath}`);
}
if (!JSON.stringify(implementationMap).includes(changeChecklistPath)) {
  failures.push(`${implementationMapPath} must reference ${changeChecklistPath}`);
}
if (!JSON.stringify(implementationMap).includes(codeownersPath)) {
  failures.push(`${implementationMapPath} must reference ${codeownersPath}`);
}
if (!JSON.stringify(implementationMap).includes(githubControlsPath)) {
  failures.push(`${implementationMapPath} must reference ${githubControlsPath}`);
}
if (!JSON.stringify(implementationMap).includes(githubControlsDocPath)) {
  failures.push(`${implementationMapPath} must reference ${githubControlsDocPath}`);
}
if (!JSON.stringify(implementationMap).includes(pluginManifestPath)) {
  failures.push(`${implementationMapPath} must reference ${pluginManifestPath}`);
}
if (!JSON.stringify(implementationMap).includes(githubWorkflowSkillPath)) {
  failures.push(`${implementationMapPath} must reference ${githubWorkflowSkillPath}`);
}
if (!JSON.stringify(implementationMap).includes(securityReviewSkillPath)) {
  failures.push(`${implementationMapPath} must reference ${securityReviewSkillPath}`);
}
if (!JSON.stringify(implementationMap).includes(skillPath)) {
  failures.push(`${implementationMapPath} must reference ${skillPath}`);
}
if (!JSON.stringify(implementationMap).includes(ciWorkflowPath)) {
  failures.push(`${implementationMapPath} must reference ${ciWorkflowPath}`);
}
if (!JSON.stringify(implementationMap).includes(reportGeneratorPath)) {
  failures.push(`${implementationMapPath} must reference ${reportGeneratorPath}`);
}
if (!JSON.stringify(implementationMap).includes(objectiveCoveragePath)) {
  failures.push(`${implementationMapPath} must reference ${objectiveCoveragePath}`);
}
if (!JSON.stringify(implementationMap).includes(objectiveCoverageCheckPath)) {
  failures.push(`${implementationMapPath} must reference ${objectiveCoverageCheckPath}`);
}
if (!JSON.stringify(implementationMap).includes(objectiveCoverageReportPath)) {
  failures.push(`${implementationMapPath} must reference ${objectiveCoverageReportPath}`);
}
if (!JSON.stringify(implementationMap).includes(objectiveCoverageReportGeneratorPath)) {
  failures.push(`${implementationMapPath} must reference ${objectiveCoverageReportGeneratorPath}`);
}
if (!JSON.stringify(implementationMap).includes(operationalGoalTrackerPath)) {
  failures.push(`${implementationMapPath} must reference ${operationalGoalTrackerPath}`);
}
if (!JSON.stringify(implementationMap).includes(operationalGoalTrackerCheckPath)) {
  failures.push(`${implementationMapPath} must reference ${operationalGoalTrackerCheckPath}`);
}
if (!JSON.stringify(implementationMap).includes(governanceReportPath)) {
  failures.push(`${implementationMapPath} must reference ${governanceReportPath}`);
}

const requiredDomains = [
  "architecture",
  "security",
  "documentation",
  "ai-and-agent-systems",
  "cloud-and-automation",
  "product-and-design"
];
const domains = Array.isArray(implementationMap.domains) ? implementationMap.domains : [];
for (const domain of requiredDomains) {
  const match = domains.find(entry => entry && entry.name === domain);
  if (!match) {
    failures.push(`${implementationMapPath} must include ${domain} domain mapping`);
    continue;
  }
  if (!Array.isArray(match.surfaces) || match.surfaces.length < 2) {
    failures.push(`${implementationMapPath} ${domain} domain must list repository surfaces`);
  }
  if (!Array.isArray(match.evidence) || match.evidence.length < 1) {
    failures.push(`${implementationMapPath} ${domain} domain must list evidence`);
  }
}

const packageJson = JSON.parse(read("package.json") || "{}");
const scripts = packageJson.scripts || {};
if (scripts["check:seis-master-prompt"] !== "node scripts/check-seis-master-prompt.mjs") {
  failures.push("package.json must expose check:seis-master-prompt");
}
if (scripts["check:seis-master-prompt-report"] !== "node scripts/create-seis-master-prompt-governance-report.mjs --check") {
  failures.push("package.json must expose check:seis-master-prompt-report");
}
if (scripts["automation:seis-master-prompt-report"] !== "node scripts/create-seis-master-prompt-governance-report.mjs") {
  failures.push("package.json must expose automation:seis-master-prompt-report");
}
if (!String(scripts["quality:governance"] || "").includes("npm run check:seis-master-prompt")) {
  failures.push("quality:governance must include npm run check:seis-master-prompt");
}
if (!String(scripts["quality:governance"] || "").includes("npm run check:seis-master-prompt-report")) {
  failures.push("quality:governance must include npm run check:seis-master-prompt-report");
}
if (scripts["check:ssh-hardening-contract"] !== "node scripts/check-ssh-hardening-contract.mjs") {
  failures.push("package.json must expose check:ssh-hardening-contract");
}
if (!String(scripts["quality:governance"] || "").includes("npm run check:ssh-hardening-contract")) {
  failures.push("quality:governance must include npm run check:ssh-hardening-contract");
}
if (scripts["check:seis-master-objective-coverage"] !== "node scripts/check-seis-master-objective-coverage.mjs") {
  failures.push("package.json must expose check:seis-master-objective-coverage");
}
if (!String(scripts["quality:governance"] || "").includes("npm run check:seis-master-objective-coverage")) {
  failures.push("quality:governance must include npm run check:seis-master-objective-coverage");
}
if (scripts["check:seis-master-objective-coverage-report"] !== "node scripts/create-seis-master-objective-coverage-report.mjs --check") {
  failures.push("package.json must expose check:seis-master-objective-coverage-report");
}
if (scripts["automation:seis-master-objective-coverage-report"] !== "node scripts/create-seis-master-objective-coverage-report.mjs") {
  failures.push("package.json must expose automation:seis-master-objective-coverage-report");
}
if (!String(scripts["quality:governance"] || "").includes("npm run check:seis-master-objective-coverage-report")) {
  failures.push("quality:governance must include npm run check:seis-master-objective-coverage-report");
}
if (scripts["check:seis-operational-goal-tracker"] !== "node scripts/check-seis-operational-goal-tracker.mjs") {
  failures.push("package.json must expose check:seis-operational-goal-tracker");
}
if (!String(scripts["quality:governance"] || "").includes("npm run check:seis-operational-goal-tracker")) {
  failures.push("quality:governance must include npm run check:seis-operational-goal-tracker");
}

for (const file of [masterPromptPath, decisionRecordPath, changeChecklistPath, githubControlsDocPath, githubControlsPath, governanceReportPath, objectiveCoverageReportPath, issueTemplatePath, codeownersPath, pluginManifestPath, githubWorkflowSkillPath, githubWorkflowSkillAgentPath, securityReviewSkillPath, securityReviewSkillAgentPath, skillPath, skillAgentPath, sshHardeningContractPath, sshHardeningOperationContractPath, sshWireGuardDeploymentGuidePath, objectiveCoveragePath, objectiveCoverageCheckPath, objectiveCoverageReportGeneratorPath, operationalGoalTrackerPath, operationalGoalTrackerCheckPath, "AGENTS.md", "README.md"]) {
  requireNotMatches(file, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
  requireNotMatches(file, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
  requireNotMatches(file, /\b(?:password|token|secret)\s*=\s*['"][^'"]+['"]/i, "inline credential assignments");
}

if (failures.length > 0) {
  console.error("SEIS master prompt governance check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS master prompt governance check passed.");
