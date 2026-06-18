#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const files = {
  packageJson: "package.json",
  sshManager: "scripts/ultra_ssh_manager.py",
  sshManagerTests: "scripts/tests/test_ultra_ssh_manager.py",
  securitySkill: "plugins/seis/skills/seis-security-review/SKILL.md",
  securityPolicy: "SECURITY.md",
  codexGuide: "CODEX.md",
  deploymentGuide: "docs/deployment/ssh-wireguard-vps-cloud-server.md",
  operationContract: "data/ssh-hardening-operation-contract.json",
  implementationMap: "data/seis-master-prompt-implementation-map.json",
  acceptanceCriteria: "data/seis-master-prompt-acceptance-criteria.json",
};

for (const file of Object.values(files)) {
  read(file);
}

for (const [file, token, reason] of [
  [files.sshManager, "\"credentialHandling\"", "dry-run/apply plans must expose credential handling policy"],
  [files.sshManager, "\"privateKeyMaterialLogged\": False", "plans must state that private key material is not logged"],
  [files.sshManager, "\"temporaryPasswordsGenerated\": False", "plans must state that temporary passwords are not generated"],
  [files.sshManager, "\"credentialManifestPattern\"", "plans must point operators to root-owned credential manifests"],
  [files.sshManager, "## Credential Handling", "recovery playbook must include credential handling instructions"],
  [files.sshManager, "<operator-private-key-path>", "terminal summary must redact direct private key paths"],
  [files.sshManager, "Private key material is not printed", "terminal summary must avoid printing private key material"],
  [files.sshManager, "console-only manifest", "rescue account handoff must remain console-only"],
  [files.sshManager, "handlers = {", "mode dispatch must remain explicit"],
  [files.sshManager, "\"harden\": self._run_dry_run_harden if self.dry_run else self._run_harden_only", "harden mode must use its own handler"],
  [files.sshManager, "\"full-setup\": self._run_dry_run_full_setup if self.dry_run else self._run_full_setup_flow", "full-setup mode must use its own handler"],
  [files.sshManager, "return self._run_hardening_flow(include_user_setup=False)", "harden mode must skip normal user setup"],
  [files.sshManager, "return self._run_hardening_flow(include_user_setup=True)", "full-setup mode must include user setup"],
  [files.sshManager, "self._run_shell(cmd, check=must_succeed", "dry-run command capture must avoid live host mutation"],
  [files.sshManager, "self.rollback()", "apply failure must trigger rollback when enabled"],
  [files.sshManager, "\"hashAlgorithm\": \"sha256\"", "backup metadata must record hash algorithm"],
  [files.sshManager, "\"sourceHash\": source_digest", "backup metadata must record source hash"],
  [files.sshManager, "\"backupHash\": backup_digest", "backup metadata must record backup copy hash"],
  [files.sshManager, "\"reason\": \"source_file_missing\"", "backup metadata must record skipped missing sources"],
  [files.sshManager, "\"manifestStatus\"", "backup metadata must expose manifest status"],
  [files.sshManager, "manifest_status = \"partial\"", "backup metadata must represent partial manifests when sources are skipped"],
  [files.sshManager, "os.chmod(path, 0o700)", "backup directory must be owner-only"],
  [files.sshManager, "os.chmod(metadata_path, 0o600)", "backup metadata must be owner-only"],
  [files.sshManager, "os.chmod(dest, 0o600)", "backup artifact files must be owner-only"],
  [files.sshManager, "\"sourceModeOctal\": oct(source_mode)", "backup metadata must record source file mode"],
  [files.sshManager, "os.chmod(src, int(source_mode_octal, 8))", "rollback must restore source file mode"],
  [files.sshManager, "_backup_manifest_summary", "operation reports must summarize backup manifests"],
  [files.sshManager, "\"backup_manifest_summary\": self._backup_manifest_summary()", "operation report must include backup manifest summary"],
  [files.sshManager, "rollback_evidence", "operation reports must expose rollback evidence"],
  [files.sshManager, "\"restoredFiles\"", "rollback evidence must list restored files"],
  [files.sshManager, "\"skippedFiles\"", "rollback evidence must list skipped files"],
  [files.sshManager, "\"verifiedFiles\"", "rollback evidence must list hash-verified files"],
  [files.sshManager, "\"verificationFailures\"", "rollback evidence must list hash verification failures"],
  [files.sshManager, "\"hashVerificationStatus\"", "rollback evidence must expose hash verification status"],
  [files.sshManager, "\"status\": \"not-run\"", "rollback evidence must default to not-run"],
  [files.sshManager, "\"status\": \"skipped\"", "rollback evidence must record skipped rollback state"],
  [files.sshManager, "\"status\": \"error\"", "rollback evidence must record rollback error state"],
  [files.sshManager, "strict_guard_unwired_firewalld", "firewalld strict port-knock limitations must be explicit"],
  [files.sshManager, "_dedupe_lines", "managed configuration writes must stay idempotency-aware"],
  [files.sshManager, "_confirm_live_apply_safety", "live apply must require explicit operator safety confirmation"],
  [files.sshManager, "confirm_live_apply_safety", "non-interactive live apply must use an explicit safety confirmation flag"],
  [files.sshManager, "--confirm-live-apply-safety", "CLI must expose explicit live-apply safety confirmation"],
  [files.sshManager, "explicit_cli_flag", "live apply confirmation must log explicit CLI-flag source"],
  [files.sshManager, "preflight.mutating_apply_confirmation", "mutating apply confirmation must be logged before live hardening"],
  [files.sshManager, "\"liveApplySafety\"", "dry-run/apply plans must expose live-apply safety policy"],
  [files.sshManager, "\"explicitCliFlagProvided\": self.confirm_live_apply_safety", "plans must expose whether explicit live-apply flag was provided"],
  [files.sshManager, "_live_apply_safety_evidence", "operation reports must expose live-apply safety evidence"],
  [files.sshManager, "\"live_apply_safety\": self._live_apply_safety_evidence()", "operation report must include live-apply safety evidence"],
  [files.sshManager, "\"live_apply_safety\": self._live_apply_safety_evidence()", "verification report must include live-apply safety evidence"],
  [files.sshManager, "\"liveApplyConfirmationRequired\"", "live-apply safety evidence must expose whether confirmation is required"],
  [files.sshManager, "\"confirmationStatus\"", "live-apply safety evidence must expose confirmation status"],
  [files.sshManager, "\"mutatingMode\"", "live-apply safety evidence must expose whether the mode is mutating"],
  [files.sshManager, "\"confirmation_events\"", "operation report must include live-apply confirmation events"],
  [files.sshManager, "## Live Apply Safety", "recovery playbook must include live-apply safety instructions"],
  [files.sshManager, "Explicit CLI flag provided in this plan", "recovery playbook must disclose explicit CLI flag state"],
  [files.sshManager, "second_access_path", "live apply preflight must require a second access path"],
  [files.sshManager, "maintenance_window", "live apply preflight must require a maintenance window"],
  [files.sshManager, "plan_and_recovery_reviewed", "live apply preflight must require plan and recovery review"],
  [files.sshManagerTests, "test_post_install_summary_redacts_private_key_path", "unit tests must cover redacted post-install summary"],
  [files.sshManagerTests, "credentialHandling", "unit tests must cover credential handling plan fields"],
  [files.sshManagerTests, "test_live_apply_safety_confirmation_blocks_missing_access_path", "unit tests must cover missing live-apply safety confirmation"],
  [files.sshManagerTests, "test_live_apply_safety_confirmation_accepts_required_operator_checks", "unit tests must cover accepted live-apply safety confirmation"],
  [files.sshManagerTests, "test_live_apply_safety_confirmation_accepts_explicit_cli_flag", "unit tests must cover explicit CLI-flag live-apply safety confirmation"],
  [files.sshManagerTests, "test_preflight_accepts_explicit_live_apply_flag_without_prompt", "unit tests must cover non-interactive explicit live-apply preflight"],
  [files.sshManagerTests, "test_operation_report_includes_live_apply_safety_evidence", "unit tests must cover live-apply safety operation report evidence"],
  [files.sshManagerTests, "test_operation_report_summarizes_backup_manifest", "unit tests must cover operation report backup manifest summary"],
  [files.sshManagerTests, "test_create_backup_metadata_records_source_and_backup_hashes", "unit tests must cover backup source/backup hash metadata"],
  [files.sshManagerTests, "test_rollback_records_restored_and_skipped_file_evidence", "unit tests must cover rollback restored/skipped evidence"],
  [files.sshManagerTests, "test_rollback_hash_mismatch_records_error_evidence", "unit tests must cover rollback hash mismatch evidence"],
  [files.sshManagerTests, "test_rollback_without_active_transaction_records_skipped_evidence", "unit tests must cover skipped rollback evidence"],
  [files.sshManagerTests, "liveApplySafety", "unit tests must cover live-apply safety plan fields"],
  [files.sshManagerTests, "Live Apply Safety", "unit tests must cover live-apply safety recovery playbook section"],
  [files.securitySkill, "credential", "security review skill must cover credential handling"],
  [files.securitySkill, "rollback", "security review skill must cover rollback"],
  [files.securitySkill, "Do not claim", "security review skill must block unverified readiness claims"],
  [files.securityPolicy, "check:ssh-hardening-contract", "security policy must expose the SSH hardening contract check"],
  [files.codexGuide, "check:ssh-hardening-contract", "Codex guide must expose the SSH hardening contract check"],
  [files.deploymentGuide, "check:ssh-hardening-contract", "deployment guide must expose the SSH hardening contract check"],
  [files.deploymentGuide, "Mode separation", "deployment guide must document SSH manager mode separation"],
  [files.deploymentGuide, "Lockout safety", "deployment guide must document lockout safety"],
  [files.deploymentGuide, "Rollback and evidence", "deployment guide must document rollback and evidence expectations"],
  [files.deploymentGuide, "liveApplySafety", "deployment guide must document live-apply safety plan evidence"],
  [files.operationContract, "SEIS SSH Hardening Operation Contract", "operation contract must identify itself"],
  [files.operationContract, "\"privateKeyMaterialLogged\": false", "operation contract must prohibit private key material logging"],
  [files.operationContract, "\"temporaryPasswordsGenerated\": false", "operation contract must prohibit temporary password generation"],
  [files.operationContract, "<operator-private-key-path>", "operation contract must define redacted private key placeholder"],
  [files.operationContract, "console-only; SSH denied by sshd_config", "operation contract must keep rescue admin console-only"],
  [files.operationContract, "\"backupMetadataMustRecordSourceAndBackupHashes\": true", "operation contract must require source and backup hashes in backup metadata"],
  [files.operationContract, "\"backupMetadataHashAlgorithm\": \"sha256\"", "operation contract must define backup metadata hash algorithm"],
  [files.operationContract, "\"backupMetadataMustRecordSkippedSources\": true", "operation contract must require skipped backup source evidence"],
  [files.operationContract, "\"backupMetadataMustExposeManifestStatus\": true", "operation contract must require backup manifest status"],
  [files.operationContract, "\"backupDirectoryMode\": \"0700\"", "operation contract must define backup directory mode"],
  [files.operationContract, "\"backupMetadataMode\": \"0600\"", "operation contract must define backup metadata mode"],
  [files.operationContract, "\"backupArtifactFileMode\": \"0600\"", "operation contract must define backup artifact file mode"],
  [files.operationContract, "\"rollbackMustRestoreSourceFileMode\": true", "operation contract must require source file mode restore"],
  [files.operationContract, "\"backupMetadataManifestStatusValues\"", "operation contract must define backup manifest status values"],
  [files.operationContract, "\"operationReportMustSummarizeBackupManifest\": true", "operation contract must require operation reports to summarize backup manifests"],
  [files.operationContract, "\"operationReportMustExposeRollbackEvidence\": true", "operation contract must require operation reports to expose rollback evidence"],
  [files.operationContract, "\"rollbackEvidenceMustListRestoredAndSkippedFiles\": true", "operation contract must require rollback restored/skipped evidence"],
  [files.operationContract, "\"rollbackEvidenceDefaultStatus\": \"not-run\"", "operation contract must define rollback evidence default status"],
  [files.operationContract, "\"rollbackEvidenceStatusValues\"", "operation contract must define rollback evidence status values"],
  [files.operationContract, "\"rollbackMustVerifyRestoredFileHashes\": true", "operation contract must require restored-file hash verification"],
  [files.operationContract, "\"rollbackHashVerificationStatusValues\"", "operation contract must define rollback hash verification statuses"],
  [files.operationContract, "\"modeIsolation\"", "operation contract must define mode isolation"],
  [files.operationContract, "\"hardenDisallowsNormalUserCreation\": true", "operation contract must keep harden separate from full setup"],
  [files.operationContract, "\"firewallAndLockoutSafety\"", "operation contract must define firewall and lockout safety rules"],
  [files.operationContract, "\"portKnockApplyDefault\": false", "operation contract must keep port-knock apply opt-in"],
  [files.operationContract, "\"liveApplyPreflightConfirmationRequired\": true", "operation contract must require live-apply preflight confirmation"],
  [files.operationContract, "\"liveApplyRequiresPlanAndRecoveryReview\": true", "operation contract must require plan and recovery review"],
  [files.operationContract, "\"mutatingApplyRequiresInteractiveConfirmOrExplicitCliFlag\": true", "operation contract must require interactive confirmation or explicit CLI flag"],
  [files.operationContract, "\"nonInteractiveLiveApplyRequiresExplicitCliFlag\": \"--confirm-live-apply-safety\"", "operation contract must require explicit CLI flag for non-interactive live apply"],
  [files.operationContract, "\"planMustExposeLiveApplySafetyPolicy\": true", "operation contract must require plans to expose live-apply safety policy"],
  [files.operationContract, "\"operationReportMustExposeLiveApplySafetyEvidence\": true", "operation contract must require operation reports to expose live-apply safety evidence"],
  [files.operationContract, "\"verificationReportMustExposeLiveApplySafetyEvidence\": true", "operation contract must require verification reports to expose live-apply safety evidence"],
  [files.operationContract, "\"liveApplySafetyEvidenceMustExposeConfirmationStatus\": true", "operation contract must require live-apply safety confirmation status"],
  [files.operationContract, "\"idempotencyAndFailureHandling\"", "operation contract must define idempotency and fail-fast rules"],
  [files.operationContract, "\"singleOperationReportRequired\": true", "operation contract must require a single operation report"],
  [files.operationContract, "python3 -m unittest scripts.tests.test_ultra_ssh_manager", "operation contract must list SSH manager unit validation"],
  [files.implementationMap, files.operationContract, "implementation map must track the SSH hardening operation contract"],
  [files.implementationMap, files.sshManager, "implementation map must track the SSH manager"],
  [files.implementationMap, "scripts/check-ssh-hardening-contract.mjs", "implementation map must track the SSH hardening contract check"],
  [files.acceptanceCriteria, files.operationContract, "acceptance criteria must cite the SSH hardening operation contract"],
  [files.acceptanceCriteria, "scripts/check-ssh-hardening-contract.mjs", "acceptance criteria must cite the SSH hardening contract check"],
]) {
  requireIncludes(file, token, reason);
}

requireNotIncludes(
  files.sshManager,
  "conn_str = f\"ssh -i {key_hint}",
  "post-install summary must not interpolate root-owned private key path directly into SSH command"
);

const packageJson = parseJson(files.packageJson);
if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:ssh-hardening-contract"] !== "node scripts/check-ssh-hardening-contract.mjs") {
    fail("package.json must expose check:ssh-hardening-contract");
  }
  if (!String(scripts["quality:governance"] || "").includes("npm run check:ssh-hardening-contract")) {
    fail("quality:governance must include npm run check:ssh-hardening-contract");
  }
}

for (const file of [
  files.sshManager,
  files.sshManagerTests,
  files.securitySkill,
  files.securityPolicy,
  files.codexGuide,
  files.deploymentGuide,
  files.operationContract,
]) {
  requireNotMatches(file, /sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style API keys");
  requireNotMatches(file, /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/, "private keys");
  requireNotMatches(file, /\b(?:password|token|secret)\s*=\s*['"][^'"]+['"]/i, "inline credential assignments");
}

if (failures.length > 0) {
  console.error("SEIS SSH hardening contract check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS SSH hardening contract check passed.");

function read(file) {
  const absolutePath = path.join(root, file);
  if (!fs.existsSync(absolutePath)) {
    fail(`missing ${file}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function requireIncludes(file, token, reason = token) {
  if (!read(file).includes(token)) {
    fail(`${file} must include ${reason}`);
  }
}

function requireNotIncludes(file, token, reason = token) {
  if (read(file).includes(token)) {
    fail(`${file} must not include ${reason}`);
  }
}

function requireNotMatches(file, pattern, reason) {
  if (pattern.test(read(file))) {
    fail(`${file} must not include ${reason}`);
  }
}

function parseJson(file) {
  try {
    return JSON.parse(read(file));
  } catch (error) {
    fail(`${file} must contain valid JSON: ${error.message}`);
    return null;
  }
}

function fail(message) {
  failures.push(message);
}
