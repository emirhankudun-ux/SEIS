#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import tempfile
import unittest
import json
import io
from contextlib import redirect_stdout
from pathlib import Path
from types import SimpleNamespace

from scripts.ultra_ssh_manager import UltraSSHManager


class FakeCommandRunner:
    def __init__(self):
        self.calls = []

    def __call__(self, cmd, *, shell=True, capture=True, check=False, timeout=300, allow_fail=False):
        self.calls.append((cmd, shell, capture, check, timeout, allow_fail))
        return SimpleNamespace(returncode=0, stdout="", stderr="")


class UltraSSHManagerTests(unittest.TestCase):
    def _make_manager(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        runner = FakeCommandRunner()
        manager = UltraSSHManager(
            state_base=f"{tmp.name}/state",
            log_file=f"{tmp.name}/ultra.log",
            stats_file=f"{tmp.name}/stats.json",
            command_runner=runner,
            input_fn=lambda *_: "",
        )
        # Keep command interception isolated.
        manager.command_runner_calls = runner.calls
        return manager

    def test_validate_username(self):
        manager = self._make_manager()
        self.assertEqual(manager._validate_username("app_user"), "app_user")
        self.assertEqual(manager._validate_username("dev-ops"), "dev-ops")
        with self.assertRaises(ValueError):
            manager._validate_username("bad user")
        with self.assertRaises(ValueError):
            manager._validate_username("!root")

    def test_setup_firewall_ufw_strict_guard_uses_deny(self):
        manager = self._make_manager()
        manager.pm = "apt-get"
        manager.knock_secret = [4001, 4002]
        manager.config["port_knocking"]["strict_guard"] = True
        manager.enable_knocking = True
        manager.config["firewall_ports"] = ["80/tcp"]
        manager.install_packages = lambda *_: None

        manager._safe_run_calls = []

        def _track(cmd, *_, **__):
            manager._safe_run_calls.append(cmd)
            return None
        manager._safe_run = _track

        manager.setup_firewall(2222)

        self.assertIn("ufw deny 2222/tcp comment 'SSH-Ultra pending knock'", manager._safe_run_calls)
        self.assertNotIn("ufw allow 2222/tcp comment 'SSH-Ultra'", manager._safe_run_calls)

    def test_harden_ssh_config_keeps_rescue_match_block(self):
        manager = self._make_manager()
        tmp_conf = Path(manager.state_dir) / "sshd_config_test"
        tmp_conf.write_text("PermitRootLogin no\n")
        manager.ssh_config_path = str(tmp_conf)
        manager.create_user = "appuser"
        manager._safe_run = lambda *_, **__: None
        manager.create_backup = lambda *_: str(Path(manager.backup_dir) / "test_backup")
        manager.create_dynamic_motd = lambda: None

        manager.harden_ssh_config(2222, True)

        content = tmp_conf.read_text()
        self.assertIn("Match User rescue_admin", content)
        self.assertIn("ForceCommand /usr/sbin/nologin", content)
        self.assertEqual(content.count("Match User rescue_admin"), 1)
        self.assertIn("AllowUsers appuser", content)

        manager.harden_ssh_config(2222, True)
        content = tmp_conf.read_text()
        self.assertEqual(content.count("Match User rescue_admin"), 1)

    def test_create_backup_metadata_records_source_and_backup_hashes(self):
        manager = self._make_manager()
        tmp_conf = Path(manager.state_dir) / "sshd_config_backup_test"
        tmp_conf.write_text("Port 22\n")
        manager.ssh_config_path = str(tmp_conf)

        backup = Path(manager.create_backup("unit"))
        metadata = json.loads((backup / "metadata.json").read_text())
        entry = next(item for item in metadata["files"] if item["source"] == str(tmp_conf))

        self.assertEqual(metadata["hashAlgorithm"], "sha256")
        self.assertIn("skippedFiles", metadata)
        self.assertIn(metadata["manifestStatus"], ["complete", "partial", "empty"])
        self.assertEqual(metadata["manifestStatus"], "partial")
        self.assertEqual(oct(backup.stat().st_mode & 0o777), "0o700")
        self.assertEqual(oct((backup / "metadata.json").stat().st_mode & 0o777), "0o600")
        self.assertEqual(entry["hashAlgorithm"], "sha256")
        self.assertEqual(entry["backupModeOctal"], "0o600")
        self.assertEqual(entry["sourceHash"], entry["hash"])
        self.assertEqual(entry["backupHash"], entry["hash"])

    def test_harden_ssh_config_validates_candidate_when_sshd_exists(self):
        manager = self._make_manager()
        tmp_conf = Path(manager.state_dir) / "sshd_config_validate_test"
        tmp_conf.write_text("PermitRootLogin no\n")
        manager.ssh_config_path = str(tmp_conf)
        manager.create_backup = lambda *_: str(Path(manager.backup_dir) / "test_backup")
        manager.create_dynamic_motd = lambda: None
        manager._find_sshd_binary = lambda: "/usr/sbin/sshd"
        calls = []

        def _track(cmd, *_, **__):
            calls.append(cmd)
            return SimpleNamespace(returncode=0, stdout="", stderr="")

        manager._safe_run = _track

        manager.harden_ssh_config(2222, True)

        self.assertTrue(any("/usr/sbin/sshd -t -f" in cmd for cmd in calls))
        self.assertTrue(any("systemctl reload sshd" in cmd for cmd in calls))
        self.assertIn("Port 2222", tmp_conf.read_text())

    def test_run_hardening_flow_separates_user_step(self):
        manager = self._make_manager()
        calls = []
        manager.ssh_port = 2222
        manager.create_user = "appuser"

        manager._safe_run = lambda *_, **__: None
        manager._preflight = lambda: calls.append("preflight")
        manager._install_packages = lambda: calls.append("install_packages")
        manager.setup_users = lambda: calls.append("setup_users")
        manager.setup_port_knocking = lambda: calls.append("setup_port_knocking")
        manager.harden_ssh_config = lambda *_: calls.append("harden_ssh_config")
        manager.harden_kernel = lambda: calls.append("harden_kernel")
        manager.setup_fail2ban = lambda: calls.append("setup_fail2ban")
        manager.setup_firewall = lambda *_: calls.append("setup_firewall")
        manager._restart_services = lambda: calls.append("restart_services")
        manager._post_install_summary = lambda: calls.append("post_install_summary")
        manager._write_report = lambda: None
        manager._log_step = lambda *_, **__: None
        manager.begin_transaction = lambda *_, **__: calls.append("begin_transaction")
        manager.rollback = lambda: calls.append("rollback")
        manager.active_transaction = {"files": []}
        manager.rollback_enabled = False

        manager._run_hardening_flow(include_user_setup=True)
        self.assertIn("setup_users", calls)
        apply_plan = Path(manager.apply_plan_path)
        recovery_playbook = Path(manager.recovery_playbook_path)
        self.assertTrue(apply_plan.exists())
        self.assertTrue(recovery_playbook.exists())
        self.assertTrue(Path(manager.verification_report_path).exists())
        self.assertFalse(json.loads(apply_plan.read_text())["dryRun"])
        self.assertIn("Recovery Playbook", recovery_playbook.read_text())
        calls.clear()

        manager._run_hardening_flow(include_user_setup=False)
        self.assertNotIn("setup_users", calls)

    def test_verify_mode_writes_non_mutating_report(self):
        manager = self._make_manager()
        manager.mode = "verify"
        manager.ssh_port = 2222
        manager.pm = "apt-get"
        manager.print_banner = lambda: None
        manager._find_sshd_binary = lambda: None

        manager.run_full_setup()

        report_path = Path(manager.verification_report_path)
        self.assertTrue(report_path.exists())
        report = json.loads(report_path.read_text())
        self.assertEqual(report["status"], "pass")
        self.assertEqual(
            report["live_apply_safety"]["nonInteractiveLiveApplyRequiresExplicitCliFlag"],
            "--confirm-live-apply-safety"
        )
        self.assertEqual(report["live_apply_safety"]["confirmationStatus"], "not-required")
        commands = "\n".join(call[0] for call in manager.command_runner_calls)
        self.assertIn("systemctl status sshd", commands)
        self.assertIn("ufw status verbose", commands)
        self.assertNotIn("systemctl restart", commands)
        self.assertNotIn("useradd", commands)

    def test_live_apply_safety_confirmation_blocks_missing_access_path(self):
        answers = iter(["h", "e", "e"])
        manager = self._make_manager()
        manager._input = lambda *_: next(answers)
        manager.mode = "harden"
        manager.dry_run = False

        with self.assertRaises(RuntimeError):
            manager._confirm_live_apply_safety()

    def test_live_apply_safety_confirmation_accepts_required_operator_checks(self):
        answers = iter(["e", "e", "e"])
        manager = self._make_manager()
        manager._input = lambda *_: next(answers)
        manager.mode = "full-setup"
        manager.dry_run = False

        manager._confirm_live_apply_safety()
        self.assertEqual(manager.operation_log[-1]["step"], "preflight.live_apply_safety")
        self.assertEqual(manager.operation_log[-1]["status"], "ok")

    def test_live_apply_safety_confirmation_accepts_explicit_cli_flag(self):
        manager = self._make_manager()
        manager.mode = "harden"
        manager.dry_run = False
        manager.confirm_live_apply_safety = True

        manager._confirm_live_apply_safety()

        self.assertEqual(manager.operation_log[-1]["step"], "preflight.live_apply_safety")
        self.assertEqual(manager.operation_log[-1]["status"], "ok")
        self.assertEqual(
            manager.operation_log[-1]["details"]["accepted"]["source"],
            "explicit_cli_flag"
        )

    def test_preflight_accepts_explicit_live_apply_flag_without_prompt(self):
        manager = self._make_manager()
        manager.mode = "harden"
        manager.dry_run = False
        manager.confirm_live_apply_safety = True
        manager.ssh_port = 2222
        manager.deep_audit = False

        def _fail_prompt(*_):
            raise AssertionError("preflight should not prompt when explicit live-apply flag is set")

        manager._input = _fail_prompt

        manager._preflight()

        steps = [entry["step"] for entry in manager.operation_log]
        self.assertIn("preflight.mutating_apply_confirmation", steps)
        self.assertIn("preflight.live_apply_safety", steps)

    def test_operation_report_includes_live_apply_safety_evidence(self):
        manager = self._make_manager()
        manager.mode = "harden"
        manager.confirm_live_apply_safety = True
        manager._log_step(
            "preflight.mutating_apply_confirmation",
            "ok",
            {"source": "explicit_cli_flag"}
        )
        manager._log_step(
            "preflight.live_apply_safety",
            "ok",
            {"accepted": {"source": "explicit_cli_flag"}}
        )

        manager._write_report()

        report = json.loads(Path(manager.hardening_report_path).read_text())
        self.assertTrue(report["live_apply_safety"]["explicitCliFlagProvided"])
        self.assertTrue(report["live_apply_safety"]["liveApplyConfirmationRequired"])
        self.assertEqual(report["live_apply_safety"]["confirmationStatus"], "satisfied")
        self.assertEqual(
            report["live_apply_safety"]["nonInteractiveLiveApplyRequiresExplicitCliFlag"],
            "--confirm-live-apply-safety"
        )
        self.assertEqual(len(report["live_apply_safety"]["confirmation_events"]), 2)
        self.assertEqual(report["backup_manifest_summary"]["status"], "not-run")
        self.assertEqual(report["backup_manifest_summary"]["reason"], "backup_not_created")
        self.assertEqual(report["rollback_evidence"]["status"], "not-run")
        self.assertEqual(report["rollback_evidence"]["reason"], "rollback_not_requested")

    def test_operation_report_summarizes_backup_manifest(self):
        manager = self._make_manager()
        backup = Path(manager.backup_dir) / "summary_test"
        backup.mkdir(parents=True)
        metadata = {
            "manifestStatus": "partial",
            "hashAlgorithm": "sha256",
            "files": [{"source": "a", "dest": "b"}],
            "skippedFiles": [{"source": "c", "reason": "source_file_missing"}],
        }
        (backup / "metadata.json").write_text(json.dumps(metadata))
        manager.transaction_backup = str(backup)

        manager._write_report()

        report = json.loads(Path(manager.hardening_report_path).read_text())
        summary = report["backup_manifest_summary"]
        self.assertEqual(summary["status"], "ok")
        self.assertEqual(summary["manifestStatus"], "partial")
        self.assertEqual(summary["hashAlgorithm"], "sha256")
        self.assertEqual(summary["backedUpFileCount"], 1)
        self.assertEqual(summary["skippedFileCount"], 1)

    def test_rollback_records_restored_and_skipped_file_evidence(self):
        manager = self._make_manager()
        backup = Path(manager.backup_dir) / "rollback_test"
        backup.mkdir(parents=True)
        source = Path(manager.state_dir) / "sshd_config"
        source.write_text("mutated\n")
        saved = backup / "sshd_config"
        saved.write_text("original\n")
        saved_hash = __import__("hashlib").sha256(saved.read_bytes()).hexdigest()
        metadata = {
            "files": [
                {
                    "source": str(source),
                    "dest": str(saved),
                    "hashAlgorithm": "sha256",
                    "hash": saved_hash,
                    "sourceHash": saved_hash,
                    "backupHash": saved_hash,
                },
                {"source": str(Path(manager.state_dir) / "missing"), "dest": str(backup / "missing"), "hash": "def"},
            ]
        }
        (backup / "metadata.json").write_text(json.dumps(metadata))
        manager.active_transaction = {"backup": str(backup)}
        manager._safe_run = lambda *_, **__: None

        manager.rollback()

        self.assertEqual(source.read_text(), "original\n")
        self.assertEqual(manager.rollback_evidence["status"], "ok")
        self.assertEqual(len(manager.rollback_evidence["restoredFiles"]), 1)
        self.assertEqual(len(manager.rollback_evidence["skippedFiles"]), 1)
        self.assertEqual(len(manager.rollback_evidence["verifiedFiles"]), 1)
        self.assertEqual(manager.rollback_evidence["hashVerificationStatus"], "passed")

    def test_rollback_hash_mismatch_records_error_evidence(self):
        manager = self._make_manager()
        backup = Path(manager.backup_dir) / "rollback_hash_mismatch_test"
        backup.mkdir(parents=True)
        source = Path(manager.state_dir) / "sshd_config"
        source.write_text("mutated\n")
        saved = backup / "sshd_config"
        saved.write_text("original\n")
        metadata = {
            "files": [
                {"source": str(source), "dest": str(saved), "hash": "bad-hash"},
            ]
        }
        (backup / "metadata.json").write_text(json.dumps(metadata))
        manager.active_transaction = {"backup": str(backup)}
        manager._safe_run = lambda *_, **__: None

        with self.assertRaises(RuntimeError):
            manager.rollback()

        self.assertEqual(manager.rollback_evidence["status"], "error")
        self.assertEqual(manager.rollback_evidence["hashVerificationStatus"], "failed")
        self.assertEqual(len(manager.rollback_evidence["verificationFailures"]), 1)

    def test_rollback_without_active_transaction_records_skipped_evidence(self):
        manager = self._make_manager()

        manager.rollback()

        self.assertEqual(manager.rollback_evidence["status"], "skipped")
        self.assertEqual(manager.rollback_evidence["reason"], "no_active_transaction")

    def test_dry_run_full_setup_writes_plan_and_playbook_without_commands(self):
        manager = self._make_manager()
        manager.mode = "full-setup"
        manager.dry_run = True
        manager.ssh_port = 2222
        manager.create_user = "appuser"
        manager.os_type = "ubuntu"
        manager.pm = "apt-get"
        manager.print_banner = lambda: None

        manager.run_full_setup()

        self.assertEqual(manager.command_runner_calls, [])
        plan_path = Path(manager.dry_run_plan_path)
        playbook_path = Path(manager.recovery_playbook_path)
        self.assertTrue(plan_path.exists())
        self.assertTrue(playbook_path.exists())

        plan = json.loads(plan_path.read_text())
        self.assertTrue(plan["dryRun"])
        self.assertEqual(plan["mode"], "full-setup")
        self.assertEqual(plan["target"]["sshPort"], 2222)
        self.assertIn("rescue_admin", [user["name"] for user in plan["users"]])
        self.assertFalse(plan["credentialHandling"]["privateKeyMaterialLogged"])
        self.assertFalse(plan["credentialHandling"]["temporaryPasswordsGenerated"])
        self.assertIn("console-only", plan["credentialHandling"]["rescueAdminAccess"])
        self.assertEqual(
            plan["liveApplySafety"]["nonInteractiveLiveApplyRequiresExplicitCliFlag"],
            "--confirm-live-apply-safety"
        )
        self.assertTrue(plan["liveApplySafety"]["secondAccessPathRequiredBeforeApply"])
        self.assertTrue(plan["liveApplySafety"]["maintenanceWindowRequiredBeforeApply"])
        self.assertTrue(plan["liveApplySafety"]["planAndRecoveryReviewRequiredBeforeApply"])
        self.assertIn("Do not paste generated private keys", "\n".join(plan["warnings"]))
        self.assertIn("apt-get install -y", "\n".join(plan["plannedCommands"]))
        playbook = playbook_path.read_text()
        self.assertIn("Recovery Playbook", playbook)
        self.assertIn("Credential Handling", playbook)
        self.assertIn("Live Apply Safety", playbook)
        self.assertIn("--confirm-live-apply-safety", playbook)
        self.assertIn("Do not paste private key material", playbook)

    def test_post_install_summary_redacts_private_key_path(self):
        manager = self._make_manager()
        manager.create_user = "appuser"
        manager.ssh_port = 2222
        manager.enable_knocking = False

        captured = io.StringIO()
        with redirect_stdout(captured):
            manager._post_install_summary()

        output = captured.getvalue()
        self.assertIn("<operator-private-key-path>", output)
        self.assertIn("user_appuser_info.json", output)
        self.assertIn("Private key material", output)
        self.assertNotIn("/keys/appuser/ultra_key_appuser", output)


if __name__ == "__main__":
    unittest.main()
