#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ULTRA SSH MANAGER v6.0 - SINGULARITY EDITION
Otonom Sunucu Savunma, Kernel Optimizasyonu ve Siber Savaş Platformu.

ÖZELLİKLER:
1. Derinlemesine OS & Donanım Analizi (15+ dk sürebilir)
2. Port Knocking (Gizli Kapı) Altyapısı
3. Kernel Seviyesi Sertleştirme (Sysctl, Network Stack)
4. Yapay Zeka Destekli Log Analizi & Anomali Tespiti
5. Otomatik Felaket Kurtarma (Rescue User & Rollback)
6. Anti-DDoS & SYN Flood Koruması (Agresif Mod)
7. Gerçek Zamanlı Siber Savaş Dashboard'u (ASCII Grafikler)
8. Otomatik Yedekleme & Versiyonlama
9. Çoklu OS Desteği (Ubuntu, Debian, CentOS, Rocky, AlmaLinux, Fedora, Arch)
10. Dinamik MOTD (Giriş Ekranı) Oluşturucu

UYARI: Bu script root yetkisi gerektirir. Çalıştırıldığında sistemde köklü değişiklikler yapar.
       İlk çalıştırmada 'Full System Audit' modu uzun sürebilir (1 saat+).
"""

import os
import sys
import subprocess
import argparse
import random
import shutil
import socket
import time
import re
import json
import hashlib
import threading
import shlex
import copy
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Tuple, Any, Callable
import logging


DEFAULT_SETTINGS = {
    "max_auth_tries": 4,
    "max_login_fails": 5,
    "firewall_ports": ["80/tcp", "443/tcp"],
    "enable_fail2ban": True,
    "enable_service_restart": True,
    "backup_prefix": "pre_op",
    "knock_apply": False,
    "rollback_window_minutes": 45,
    "service_restart_timeout_sec": 45,
    "firewall_retry_count": 3,
    "package_retry_count": 2,
    "audit_pause_seconds": 0.0,
    "dashboard_refresh_seconds": 2.0,
    "port_knocking": {
        "enabled": True,
        "sequence_length": 3,
        "sequence_min_port": 1000,
        "sequence_max_port": 59999,
        "strict_guard": False,
        "state_dir": "/var/lib/ultra_ssh_manager",
        "lockout_grace_seconds": 120,
    },
}

USERNAME_PATTERN = re.compile(r"^[a-z_][a-z0-9_-]{0,31}$", re.IGNORECASE)


def get_package_manager(os_type: str) -> str:
    """Map OS type to package manager and fallback to known binaries."""
    os_type = (os_type or "").lower()
    if os_type in {"ubuntu", "debian"}:
        return "apt-get"
    if os_type in {"centos", "rocky", "almalinux", "fedora"}:
        return "dnf"
    if os_type == "arch":
        return "pacman"

    # Fallback binary check
    if os.path.exists("/usr/bin/apt-get"):
        return "apt-get"
    if os.path.exists("/usr/bin/dnf"):
        return "dnf"
    if os.path.exists("/usr/bin/yum"):
        return "yum"
    if os.path.exists("/usr/bin/pacman"):
        return "pacman"
    return "unknown"

# --- Renkli Terminal Çıktıları & UI ---
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    BLINK = '\033[5m'

    @staticmethod
    def clear():
        os.system('clear' if os.name == 'posix' else 'cls')

class Spinner:
    """Uzun işlemler için animasyonlu yüklenici"""
    def __init__(self, message="İşlem devam ediyor..."):
        self.message = message
        self.running = False
        self.thread = None

    def _spin(self):
        chars = "|/-\\"
        while self.running:
            for char in chars:
                if not self.running: break
                sys.stdout.write(f'\r{Colors.OKCYAN}{char}{Colors.ENDC} {self.message}')
                sys.stdout.flush()
                time.sleep(0.1)
        sys.stdout.write('\r' + ' ' * (len(self.message) + 2) + '\r')

    def start(self):
        self.running = True
        self.thread = threading.Thread(target=self._spin)
        self.thread.daemon = True
        self.thread.start()

    def stop(self, success=True):
        self.running = False
        if self.thread: self.thread.join()
        status = f"{Colors.OKGREEN}✅{Colors.ENDC}" if success else f"{Colors.FAIL}❌{Colors.ENDC}"
        print(f"\r{status} {self.message}")

# --- Yardımcı Fonksiyonlar ---
def run_command(
    cmd: str,
    shell=True,
    capture=True,
    check=False,
    timeout=300,
    allow_fail=False
) -> Optional[subprocess.CompletedProcess]:
    """Gelişmiş komut çalıştırıcı (Timeout, Hata Yönetimi, Loglama)"""
    try:
        # Loglama
        logging.info(f"Komut çalıştırılıyor: {cmd}")
        result = subprocess.run(
            cmd,
            shell=shell,
            capture_output=capture,
            text=True,
            check=check,
            timeout=timeout
        )
        return result
    except subprocess.TimeoutExpired:
        logging.error(f"Komut zaman aşımına uğradı: {cmd}")
        if not allow_fail:
            raise
        return None
    except subprocess.CalledProcessError as e:
        logging.error(f"Komut başarısız: {cmd} - Hata: {e}")
        if check and not allow_fail:
            raise
        return e if not check else None
    except Exception as e:
        logging.error(f"Beklenmeyen hata: {cmd} - {str(e)}")
        if not allow_fail:
            raise
        return None

def detect_os() -> Tuple[str, str]:
    """İşletim sistemi ve paket yöneticisini tespit et"""
    os_type = "unknown"
    pm = "unknown"

    if os.path.exists("/etc/os-release"):
        with open("/etc/os-release") as f:
            content = f.read().lower()
            if "ubuntu" in content:
                os_type = "ubuntu"
                pm = "apt-get"
            elif "debian" in content:
                os_type = "debian"
                pm = "apt-get"
            elif "centos" in content:
                os_type = "centos"
                pm = "yum"
            elif "rocky" in content:
                os_type = "rocky"
                pm = "dnf"
            elif "almalinux" in content:
                os_type = "almalinux"
                pm = "dnf"
            elif "fedora" in content:
                os_type = "fedora"
                pm = "dnf"
            elif "arch" in content:
                os_type = "arch"
                pm = "pacman"

    # Fallback kontrolü
    if os_type == "unknown":
        if os.path.exists("/usr/bin/yum"): pm = "yum"
        elif os.path.exists("/usr/bin/dnf"): pm = "dnf"
        elif os.path.exists("/usr/bin/apt-get"): pm = "apt-get"
        elif os.path.exists("/usr/bin/pacman"): pm = "pacman"

    return os_type, pm

def get_cpu_info() -> Dict:
    """CPU detaylı bilgisi"""
    info = {"cores": 0, "model": "Unknown", "usage": 0.0}
    try:
        with open("/proc/cpuinfo") as f:
            content = f.read()
            info["cores"] = content.count("processor")
            model_match = re.search(r'model name\s+:\s+(.+)', content)
            if model_match: info["model"] = model_match.group(1).strip()
        info["usage"] = os.getloadavg()[0] / info["cores"] * 100 if info["cores"] > 0 else 0
    except: pass
    return info

def get_mem_info() -> Dict:
    """RAM detaylı bilgisi"""
    info = {"total": 0, "used": 0, "free": 0, "percent": 0.0}
    try:
        with open("/proc/meminfo") as f:
            lines = f.readlines()
            mem_data = {}
            for line in lines:
                parts = line.split()
                key = parts[0].rstrip(':')
                val = int(parts[1]) # kB
                mem_data[key] = val

            info["total"] = mem_data.get("MemTotal", 0)
            info["free"] = mem_data.get("MemFree", 0) + mem_data.get("Buffers", 0) + mem_data.get("Cached", 0)
            info["used"] = info["total"] - info["free"]
            info["percent"] = (info["used"] / info["total"]) * 100 if info["total"] > 0 else 0
    except: pass
    return info

# --- Ana Sınıf: UltraSSHManager ---
class UltraSSHManager:
    def __init__(
        self,
        *,
        state_base: str = "/var/lib/ultra_ssh_manager",
        log_file: str = "/var/log/ultra_ssh_omega.log",
        stats_file: str = "/var/log/ssh_stats_omega.json",
        command_runner: Optional[Callable[..., Optional[subprocess.CompletedProcess]]] = None,
        input_fn: Callable[[str], str] = input
    ):
        self.os_type, self.pm = detect_os()
        self.ssh_config_path = "/etc/ssh/sshd_config"
        self.state_dir = Path(state_base)
        self.backup_dir = str(self.state_dir / "backups")
        self.log_file = log_file
        self.stats_file = stats_file
        self.report_dir = str(self.state_dir / "reports")
        self.cred_dir = str(self.state_dir / "credentials")
        self.hardening_report_path = (
            f"{self.report_dir}/operation_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        )
        self.apply_plan_path = (
            f"{self.report_dir}/apply_plan_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        )
        self.dry_run_plan_path = (
            f"{self.report_dir}/dry_run_plan_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        )
        self.recovery_playbook_path = (
            f"{self.report_dir}/recovery_playbook_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        )
        self.verification_report_path = (
            f"{self.report_dir}/verification_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        )
        self.knock_secret = [] # Port knocking sırası
        self.operation_log = []
        self.dry_run_commands = []
        self.started_at = datetime.now()
        self.transaction_backup = None
        self.active_transaction = None
        self.rollback_evidence = {
            "status": "not-run",
            "reason": "rollback_not_requested",
            "restoredFiles": [],
            "skippedFiles": [],
            "verifiedFiles": [],
            "verificationFailures": [],
            "hashVerificationStatus": "not-run",
        }
        self.command_runner = command_runner or run_command
        self._input = input_fn
        self._psutil = None

        # Yapılandırma Varsayılanları
        self.mode = "interactive"
        self.ssh_port = None
        self.disable_root = True
        self.create_user = None
        self.user_sudo = True
        self.admin_email = "admin@localhost"
        self.enable_knocking = True
        self.deep_audit = True
        self.config = copy.deepcopy(DEFAULT_SETTINGS)
        self.rollback_enabled = True
        self.dry_run = False
        self.confirm_live_apply_safety = False
        self.failure = None

        os.makedirs(self.state_dir, exist_ok=True)
        os.makedirs(self.report_dir, exist_ok=True)
        os.makedirs(self.cred_dir, exist_ok=True)
        os.makedirs(os.path.dirname(self.log_file) or ".", exist_ok=True)
        os.makedirs(os.path.dirname(self.stats_file) or ".", exist_ok=True)
        os.makedirs(self.backup_dir, exist_ok=True)

        os.chmod(self.state_dir, 0o700)
        os.chmod(self.report_dir, 0o700)
        os.chmod(self.cred_dir, 0o700)
        os.chmod(self.backup_dir, 0o700)

        # Loglama Ayarı
        self.logger = logging.getLogger("OmegaManager")
        self.logger.setLevel(logging.INFO)
        if not self.logger.handlers:
            file_handler = logging.FileHandler(self.log_file)
            console_handler = logging.StreamHandler(sys.stdout)
            file_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
            console_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
            self.logger.addHandler(file_handler)
            self.logger.addHandler(console_handler)

        self._load_runtime_settings()
        self.audit_pause_seconds = float(self.config.get("audit_pause_seconds", 0.0) or 0.0)

    @staticmethod
    def get_package_manager(os_type: str) -> str:
        return get_package_manager(os_type)

    def _quote(self, value: str) -> str:
        return shlex.quote(str(value))

    def _validate_username(self, username: str) -> str:
        if not username:
            raise ValueError("Kullanıcı adı boş olamaz.")
        username = str(username).strip()
        if not USERNAME_PATTERN.match(username):
            raise ValueError(
                f"Geçersiz kullanıcı adı: {username}. ASCII [a-zA-Z0-9_-] ve 32 karakter sınırına uyumlu olmalı."
            )
        return username

    def _prompt(self, message: str) -> str:
        return self._input(message)

    def _run_shell(self, cmd: str, *, check: bool = False, allow_fail: bool = False, timeout: int = 300):
        if self.dry_run:
            self.dry_run_commands.append(cmd)
            return subprocess.CompletedProcess(cmd, 0, "", "")
        return self.command_runner(cmd, shell=True, capture=True, check=check, allow_fail=allow_fail, timeout=timeout)

    def _load_psutil(self):
        if self._psutil is not None:
            return self._psutil
        try:
            import psutil  # type: ignore
            self._psutil = psutil
            return psutil
        except Exception:
            self._psutil = False
            return None

    def _load_runtime_settings(self):
        cfg_paths = [
            "/etc/ultra_ssh_manager.json",
            "/etc/ultra_ssh_manager.yaml",
            str(self.state_dir / "config.json")
        ]
        for cfg in cfg_paths:
            p = Path(cfg)
            if p.exists():
                try:
                    with p.open() as f:
                        data = json.load(f)
                    if isinstance(data, dict):
                        self.config.update({k: v for k, v in data.items() if k in self.config})
                        self.logger.info(f"Yapılandırma yüklendi: {cfg}")
                except Exception as exc:
                    self.logger.warning(f"Yapılandırma okunamadı: {cfg} - {exc}")

    def _log_step(self, step: str, status: str, details: Optional[Dict[str, Any]] = None):
        entry = {
            "time": datetime.now().isoformat(),
            "step": step,
            "status": status,
            "details": details or {}
        }
        self.operation_log.append(entry)
        if status == "error":
            self.logger.error(f"{step} -> {details}")
        elif status == "skip":
            self.logger.info(f"{step} -> skip: {details}")
        else:
            self.logger.info(f"{step} -> {status}: {details}")

    def _live_apply_safety_evidence(self) -> Dict[str, Any]:
        confirmation_events = [
            entry for entry in self.operation_log
            if entry.get("step") in [
                "preflight.mutating_apply_confirmation",
                "preflight.live_apply_safety",
            ]
        ]
        mutating_mode = self.mode in ["harden", "full-setup"]
        live_apply_confirmation_required = mutating_mode and not self.dry_run
        mutating_confirmation_ok = any(
            entry.get("step") == "preflight.mutating_apply_confirmation" and entry.get("status") == "ok"
            for entry in confirmation_events
        )
        live_apply_safety_ok = any(
            entry.get("step") == "preflight.live_apply_safety" and entry.get("status") == "ok"
            for entry in confirmation_events
        )
        confirmation_failed = any(entry.get("status") == "error" for entry in confirmation_events)
        if not live_apply_confirmation_required:
            confirmation_status = "not-required"
        elif mutating_confirmation_ok and live_apply_safety_ok:
            confirmation_status = "satisfied"
        elif confirmation_failed:
            confirmation_status = "failed"
        else:
            confirmation_status = "missing"
        return {
            "mutatingApplyRequiresInteractiveConfirmOrExplicitCliFlag": True,
            "nonInteractiveLiveApplyRequiresExplicitCliFlag": "--confirm-live-apply-safety",
            "secondAccessPathRequiredBeforeApply": True,
            "maintenanceWindowRequiredBeforeApply": True,
            "planAndRecoveryReviewRequiredBeforeApply": True,
            "explicitCliFlagProvided": self.confirm_live_apply_safety,
            "mode": self.mode,
            "dryRun": self.dry_run,
            "mutatingMode": mutating_mode,
            "liveApplyConfirmationRequired": live_apply_confirmation_required,
            "confirmationStatus": confirmation_status,
            "confirmation_events": confirmation_events,
        }

    def _backup_manifest_summary(self) -> Dict[str, Any]:
        if not self.transaction_backup:
            return {
                "status": "not-run",
                "reason": "backup_not_created",
                "backup": None,
                "metadataPath": None,
                "manifestStatus": None,
                "hashAlgorithm": None,
                "backedUpFileCount": 0,
                "skippedFileCount": 0,
            }

        meta_path = Path(self.transaction_backup) / "metadata.json"
        if not meta_path.exists():
            return {
                "status": "missing",
                "reason": "metadata_missing",
                "backup": self.transaction_backup,
                "metadataPath": str(meta_path),
                "manifestStatus": None,
                "hashAlgorithm": None,
                "backedUpFileCount": 0,
                "skippedFileCount": 0,
            }

        try:
            with meta_path.open() as f:
                meta = json.load(f)
            files = meta.get("files", [])
            skipped_files = meta.get("skippedFiles", [])
            return {
                "status": "ok",
                "backup": self.transaction_backup,
                "metadataPath": str(meta_path),
                "manifestStatus": meta.get("manifestStatus"),
                "hashAlgorithm": meta.get("hashAlgorithm"),
                "backedUpFileCount": len(files) if isinstance(files, list) else 0,
                "skippedFileCount": len(skipped_files) if isinstance(skipped_files, list) else 0,
            }
        except Exception as exc:
            return {
                "status": "error",
                "reason": str(exc),
                "backup": self.transaction_backup,
                "metadataPath": str(meta_path),
                "manifestStatus": None,
                "hashAlgorithm": None,
                "backedUpFileCount": 0,
                "skippedFileCount": 0,
            }

    def _write_report(self):
        payload = {
            "session_start": self.started_at.isoformat(),
            "session_end": datetime.now().isoformat(),
            "mode": self.mode,
            "ssh_port": self.ssh_port,
            "os_type": self.os_type,
            "package_manager": self.pm,
            "steps": self.operation_log,
            "host": socket.gethostname(),
            "rollback_backup": self.transaction_backup,
            "dry_run": self.dry_run,
            "apply_plan": self.apply_plan_path if not self.dry_run else None,
            "dry_run_plan": self.dry_run_plan_path if self.dry_run else None,
            "recovery_playbook": self.recovery_playbook_path,
            "verification_report": self.verification_report_path,
            "live_apply_safety": self._live_apply_safety_evidence(),
            "backup_manifest_summary": self._backup_manifest_summary(),
            "rollback_evidence": self.rollback_evidence
        }
        with open(self.hardening_report_path, "w") as f:
            json.dump(payload, f, indent=2)
        self.logger.info(f"Operasyon raporu: {self.hardening_report_path}")

    def begin_transaction(self, reason: str):
        self.active_transaction = {
            "reason": reason,
            "started_at": datetime.now().isoformat(),
            "backup": self.create_backup("pre_tx"),
            "files": []
        }
        self.transaction_backup = self.active_transaction["backup"]
        self._log_step("transaction.begin", "ok", {"reason": reason, "backup": self.transaction_backup})

    def rollback(self):
        if not self.active_transaction:
            self.rollback_evidence = {
                "status": "skipped",
                "reason": "no_active_transaction",
                "restoredFiles": [],
                "skippedFiles": [],
                "verifiedFiles": [],
                "verificationFailures": [],
                "hashVerificationStatus": "not-run",
            }
            self._log_step("rollback", "skip", self.rollback_evidence)
            return
        backup = self.active_transaction["backup"]
        self.logger.warning(f"Rollback başlatıldı: {backup}")
        # Metadata dosyasındaki yedek haritasını geri yükle.
        meta_path = Path(backup) / "metadata.json"
        if not meta_path.exists():
            self.rollback_evidence = {
                "status": "error",
                "reason": "metadata_missing",
                "backup": backup,
                "metadataPath": str(meta_path),
                "restoredFiles": [],
                "skippedFiles": [],
                "verifiedFiles": [],
                "verificationFailures": [],
                "hashVerificationStatus": "failed",
            }
            self._log_step("rollback", "error", self.rollback_evidence)
            raise RuntimeError(f"Rollback metadata bulunamadı: {meta_path}")
        with meta_path.open() as f:
            meta = json.load(f)
        evidence = {
            "status": "started",
            "backup": backup,
            "metadataPath": str(meta_path),
            "restoredFiles": [],
            "skippedFiles": [],
            "verifiedFiles": [],
            "verificationFailures": [],
            "hashVerificationStatus": "pending",
        }
        for entry in meta.get("files", []):
            src = entry.get("source")
            dest = entry.get("dest")
            expected_hash = entry.get("backupHash") or entry.get("hash")
            source_mode_octal = entry.get("sourceModeOctal")
            if not src or not dest:
                evidence["skippedFiles"].append({"source": src, "dest": dest, "reason": "metadata_entry_incomplete"})
                continue
            if not os.path.exists(dest):
                evidence["skippedFiles"].append({"source": src, "dest": dest, "reason": "backup_file_missing"})
                continue
            try:
                shutil.copy2(dest, src)
                if source_mode_octal:
                    os.chmod(src, int(source_mode_octal, 8))
                with open(src, "rb") as fp:
                    restored_hash = hashlib.sha256(fp.read()).hexdigest()
                record = {
                    "source": src,
                    "dest": dest,
                    "sourceModeOctal": source_mode_octal,
                    "hashAlgorithm": entry.get("hashAlgorithm", "sha256"),
                    "expectedHash": expected_hash,
                    "restoredHash": restored_hash,
                }
                if expected_hash:
                    if restored_hash != expected_hash:
                        record["verified"] = False
                        evidence["verificationFailures"].append(record)
                        evidence["status"] = "error"
                        evidence["hashVerificationStatus"] = "failed"
                        evidence["error"] = "restored_hash_mismatch"
                        self.rollback_evidence = evidence
                        self._log_step("rollback", "error", evidence)
                        raise RuntimeError(f"Rollback hash doğrulaması başarısız: {src}")
                    record["verified"] = True
                    evidence["verifiedFiles"].append(record)
                else:
                    record["verified"] = False
                    record["reason"] = "metadata_hash_missing"
                evidence["restoredFiles"].append(record)
            except Exception as exc:
                evidence["status"] = "error"
                evidence["error"] = str(exc)
                if evidence["hashVerificationStatus"] != "failed":
                    evidence["hashVerificationStatus"] = "failed"
                self.rollback_evidence = evidence
                self._log_step("rollback", "error", evidence)
                raise
        # Temel servisleri stabilize etmeye çalış
        self._safe_run("systemctl daemon-reload", must_succeed=False)
        self._safe_run("systemctl restart sshd || systemctl restart ssh", must_succeed=False)
        self._safe_run("systemctl restart fail2ban", must_succeed=False)
        evidence["status"] = "ok"
        if evidence["restoredFiles"] and len(evidence["verifiedFiles"]) == len(evidence["restoredFiles"]):
            evidence["hashVerificationStatus"] = "passed"
        elif evidence["restoredFiles"]:
            evidence["hashVerificationStatus"] = "partial"
        else:
            evidence["hashVerificationStatus"] = "not-run"
        self.rollback_evidence = evidence
        self._log_step("rollback", "ok", evidence)
        self.active_transaction = None

    def _safe_run(self, cmd: str, must_succeed=False, allow_fail=True):
        try:
            res = self._run_shell(cmd, check=must_succeed, allow_fail=allow_fail)
            if must_succeed and (not res or res.returncode != 0):
                raise RuntimeError(f"Komut başarısız: {cmd}")
            return res
        except Exception as exc:
            self._log_step("command", "error", {"command": cmd, "error": str(exc)})
            if must_succeed:
                raise
            return None

    def _run_with_retry(self, cmd: str, tries: int, must_succeed=True, allow_fail: bool = False):
        attempt = 1
        while attempt <= max(1, tries):
            res = self._safe_run(cmd, must_succeed=must_succeed, allow_fail=not must_succeed or allow_fail)
            if res and getattr(res, "returncode", 1) == 0:
                return res
            if attempt < tries:
                self._log_step("retry", "warn", {"command": cmd, "attempt": attempt})
                time.sleep(min(3, attempt))
                attempt += 1
                continue
            if must_succeed:
                raise RuntimeError(f"Komut başarısız: {cmd}")
        return res

    def _dedupe_and_write_lines(self, path: str, lines):
        Path(path).write_text("".join(self._dedupe_lines(lines)))

    def _dedupe_lines(self, lines):
        unique = []
        seen = set()
        for line in lines:
            stripped = line.strip()
            if not stripped or stripped.startswith("#"):
                if stripped in seen:
                    continue
                seen.add(stripped)
                unique.append(line if line.endswith("\n") else f"{line}\n")
                continue
            if stripped in seen:
                continue
            seen.add(stripped)
            unique.append(f"{stripped}\n")
        return unique

    def _remove_managed_match_block(self, lines: List[str], match_header: str) -> List[str]:
        filtered = []
        inside_managed_block = False
        for line in lines:
            stripped = line.strip()
            if stripped == match_header:
                inside_managed_block = True
                continue
            if inside_managed_block and stripped.startswith("Match "):
                inside_managed_block = False
            if inside_managed_block:
                continue
            filtered.append(line)
        return filtered

    def _planned_packages(self) -> List[str]:
        pkgs = ["openssh-server", "fail2ban", "wget", "curl", "htop", "net-tools", "vim", "unzip"]
        if self.pm == "apt-get":
            pkgs.extend(["ufw", "python3-psutil"])
        else:
            pkgs.extend(["firewalld", "python3-psutil"])
        return pkgs

    def _package_plan_commands(self, packages: List[str]) -> List[str]:
        if self.pm == "apt-get":
            return ["apt-get update -y", f"apt-get install -y {' '.join(packages)}"]
        if self.pm in ["dnf", "yum"]:
            return [f"{self.pm} makecache -y", f"{self.pm} install -y {' '.join(packages)}"]
        if self.pm == "pacman":
            return ["pacman -Sy --noconfirm", f"pacman -S --noconfirm {' '.join(packages)}"]
        return ["package-manager unresolved; install required packages manually"]

    def _firewall_plan_commands(self, port: int) -> List[str]:
        strict_knock_guard = bool(self.config.get("port_knocking", {}).get("strict_guard", False))
        if self.pm == "apt-get":
            commands = [
                "ufw --force reset",
                "ufw default deny incoming",
                "ufw default allow outgoing",
            ]
            if strict_knock_guard and self.enable_knocking:
                commands.append(f"ufw deny {port}/tcp comment 'SSH-Ultra pending knock'")
            else:
                commands.append(f"ufw allow {port}/tcp comment 'SSH-Ultra'")
            for web_port in self.config.get("firewall_ports", ["80/tcp", "443/tcp"]):
                commands.append(f"ufw allow {web_port}")
            for knock_port in self.knock_secret:
                commands.append(f"ufw allow {knock_port}/tcp comment 'ssh-knock'")
            commands.extend([
                f"ufw limit from any to any port {port} proto tcp comment 'ssh-flood-mitigation'",
                "ufw --force enable",
            ])
            return commands

        commands = [
            "systemctl start firewalld",
            "systemctl enable firewalld",
            "firewall-cmd --permanent --remove-service=ssh",
            f"firewall-cmd --permanent --add-port={int(port)}/tcp",
            "firewall-cmd --permanent --add-service=http",
            "firewall-cmd --permanent --add-service=https",
        ]
        for knock_port in self.knock_secret:
            commands.append(f"firewall-cmd --permanent --add-port={int(knock_port)}/tcp")
        commands.extend([
            "firewall-cmd --permanent --add-rich-rule='rule protocol value=icmp limit value=1/s accept'",
            "firewall-cmd --reload",
        ])
        return commands

    def _build_dry_run_plan(self, include_user_setup: bool) -> Dict[str, Any]:
        if self.enable_knocking and not self.knock_secret:
            self.generate_knock_sequence()
        packages = self._planned_packages()
        users = []
        if include_user_setup and self.create_user:
            users.append({"name": self._validate_username(self.create_user), "sudo": self.user_sudo, "rescue": False})
        if include_user_setup:
            users.append({"name": "rescue_admin", "sudo": True, "rescue": True})

        planned_commands = []
        planned_commands.extend(self._package_plan_commands(packages))
        for user_data in users:
            username = user_data["name"]
            groups = "sudo" if self.os_type in ["ubuntu", "debian"] else "wheel"
            group_args = f" -G {groups}" if user_data["sudo"] else ""
            planned_commands.append(f"id -- {username}")
            planned_commands.append(f"useradd -m -s /bin/bash{group_args} {username}")
            planned_commands.append(f"passwd -l {username}")
            planned_commands.append(f"ssh-keygen -q -t ed25519 -f {self.cred_dir}/keys/{username}/ultra_key_{username} -N ''")
        planned_commands.extend([
            f"sshd_config update: Port {self.ssh_port}, PermitRootLogin {'no' if self.disable_root else 'prohibit-password'}",
            "sysctl -p /etc/sysctl.d/99-ultra-ssh-hardening.conf",
            "systemctl restart fail2ban",
            "systemctl enable fail2ban",
        ])
        planned_commands.extend(self._firewall_plan_commands(self.ssh_port or 2222))
        planned_commands.extend([
            "systemctl restart ssh || systemctl restart sshd",
            "systemctl daemon-reload",
        ])

        warnings = [
            "Open a second terminal before applying changes and keep the current session alive.",
            "Verify cloud console or out-of-band access before changing SSH/firewall state.",
            "Store generated SSH private keys outside shared folders and restrict them to the operator.",
            "Do not paste generated private keys or temporary credentials into chat, tickets, logs, or commits.",
            "Use the credential manifest on the target host to locate generated key paths; keep private key material out of shared reports.",
        ]
        if self.enable_knocking and self.config.get("port_knocking", {}).get("strict_guard", False):
            warnings.append("Strict port-knocking can lock out SSH if knock rules are applied before validation.")

        return {
            "version": 1,
            "dryRun": self.dry_run,
            "mode": "full-setup" if include_user_setup else "harden",
            "host": socket.gethostname(),
            "osType": self.os_type,
            "packageManager": self.pm,
            "target": {
                "sshPort": self.ssh_port,
                "disableRoot": self.disable_root,
                "createUser": self.create_user,
                "userSudo": self.user_sudo,
                "enableKnocking": self.enable_knocking,
                "knockSequence": self.knock_secret,
            },
            "packages": packages,
            "users": users,
            "credentialHandling": {
                "privateKeyMaterialLogged": False,
                "temporaryPasswordsGenerated": False,
                "credentialDirectory": self.cred_dir,
                "credentialManifestPattern": f"{self.cred_dir}/user_<username>_info.json",
                "rescueAdminAccess": "console-only; SSH denied by sshd_config",
                "operatorAction": "Copy private keys through a secure out-of-band channel and remove unnecessary copies after verifying access.",
            },
            "liveApplySafety": {
                "mutatingApplyRequiresInteractiveConfirmOrExplicitCliFlag": True,
                "nonInteractiveLiveApplyRequiresExplicitCliFlag": "--confirm-live-apply-safety",
                "secondAccessPathRequiredBeforeApply": True,
                "maintenanceWindowRequiredBeforeApply": True,
                "planAndRecoveryReviewRequiredBeforeApply": True,
                "explicitCliFlagProvided": self.confirm_live_apply_safety,
                "dryRunBypassesLiveApplyConfirmation": self.dry_run,
            },
            "plannedFileWrites": [
                self.ssh_config_path,
                "/etc/sysctl.d/99-ultra-ssh-hardening.conf",
                "/etc/fail2ban/jail.local",
                "/etc/update-motd.d/99-ultra-ssh",
                "/usr/local/sbin/ultra-ssh-knock-activate.sh",
            ],
            "plannedCommands": planned_commands,
            "warnings": warnings,
            "recoveryPlaybook": self.recovery_playbook_path,
        }

    def _write_dry_run_artifacts(self, plan: Dict[str, Any]) -> None:
        self._write_plan_and_recovery_artifacts(plan, self.dry_run_plan_path)

    def _write_apply_artifacts(self, plan: Dict[str, Any]) -> None:
        self._write_plan_and_recovery_artifacts(plan, self.apply_plan_path)

    def _write_plan_and_recovery_artifacts(self, plan: Dict[str, Any], plan_path: str) -> None:
        os.makedirs(os.path.dirname(plan_path) or ".", exist_ok=True)
        os.makedirs(os.path.dirname(self.recovery_playbook_path) or ".", exist_ok=True)
        with open(plan_path, "w") as f:
            json.dump(plan, f, indent=2)
        os.chmod(plan_path, 0o600)
        with open(self.recovery_playbook_path, "w") as f:
            f.write(self._render_recovery_playbook(plan))
        os.chmod(self.recovery_playbook_path, 0o600)

    def _render_recovery_playbook(self, plan: Dict[str, Any]) -> str:
        ssh_port = plan["target"]["sshPort"] or 2222
        knock_sequence = " ".join(map(str, plan["target"].get("knockSequence") or [])) or "not-enabled"
        backup_hint = self.transaction_backup or f"{self.backup_dir}/backup_<timestamp>_pre_tx"
        return f"""# Ultra SSH Manager Recovery Playbook

Mode: {plan["mode"]}
Host: {plan["host"]}
SSH port: {ssh_port}
Port knocking: {knock_sequence}

## Before Apply

1. Keep the current SSH session open.
2. Open cloud provider console or another out-of-band access path.
3. Confirm the target SSH port and firewall provider.
4. Store generated keys outside shared folders with chmod 600.

## Credential Handling

- Do not paste private key material, passwords, or temporary credentials into
  chat, tickets, logs, commits, or shared reports.
- Credential manifests stay on the target host under:

```text
{plan.get("credentialHandling", {}).get("credentialManifestPattern", self.cred_dir + "/user_<username>_info.json")}
```

- Rescue admin is intended for console-only recovery. Do not enable remote SSH
  for the rescue account unless the maintainer explicitly accepts that access
  model and documents the rollback path.

## Live Apply Safety

- Interactive live apply requires operator confirmation before host mutation.
- Non-interactive live apply requires:

```text
{plan.get("liveApplySafety", {}).get("nonInteractiveLiveApplyRequiresExplicitCliFlag", "--confirm-live-apply-safety")}
```

- Second access path required:
  `{plan.get("liveApplySafety", {}).get("secondAccessPathRequiredBeforeApply", True)}`
- Maintenance window required:
  `{plan.get("liveApplySafety", {}).get("maintenanceWindowRequiredBeforeApply", True)}`
- Apply plan and recovery review required:
  `{plan.get("liveApplySafety", {}).get("planAndRecoveryReviewRequiredBeforeApply", True)}`
- Explicit CLI flag provided in this plan:
  `{plan.get("liveApplySafety", {}).get("explicitCliFlagProvided", False)}`

## Connectivity Test

```bash
ssh -p {ssh_port} USER@IP_ADRESI
```

If port knocking is enabled:

```bash
knock IP_ADRESI {knock_sequence}
ssh -p {ssh_port} USER@IP_ADRESI
```

## Rollback

Backup directory hint:

```text
{backup_hint}
```

Restore SSH config manually from backup if needed:

```bash
cp {backup_hint}/sshd_config /etc/ssh/sshd_config
systemctl restart sshd || systemctl restart ssh
systemctl restart fail2ban || true
```

Emergency firewall reset options:

```bash
ufw --force reset || true
firewall-cmd --reload || true
iptables -F || true
```

## Verification

```bash
ss -tulpn | grep {ssh_port}
sshd -t
systemctl status sshd --no-pager || systemctl status ssh --no-pager
fail2ban-client status sshd || true
```
"""

    def _run_dry_run_flow(self, include_user_setup: bool):
        label = "full-setup" if include_user_setup else "harden"
        self._log_step("dry_run.start", "ok", {"mode": label, "include_user_setup": include_user_setup})
        plan = self._build_dry_run_plan(include_user_setup)
        self._write_dry_run_artifacts(plan)
        self._log_step(
            "dry_run.end",
            "ok",
            {
                "mode": label,
                "plan": self.dry_run_plan_path,
                "recovery_playbook": self.recovery_playbook_path,
                "planned_commands": len(plan["plannedCommands"]),
            },
        )
        print(f"{Colors.WARNING}DRY-RUN tamamlandı. Sistem değiştirilmedi.{Colors.ENDC}")
        print(f"Plan: {self.dry_run_plan_path}")
        print(f"Recovery playbook: {self.recovery_playbook_path}")

    def _command_check(self, check_id: str, command: str, critical: bool = False) -> Dict[str, Any]:
        result = self._run_shell(command, allow_fail=True, timeout=30)
        return {
            "id": check_id,
            "command": command,
            "critical": critical,
            "exitCode": getattr(result, "returncode", None) if result else None,
            "ok": bool(result and getattr(result, "returncode", 1) == 0),
            "stdout": (getattr(result, "stdout", "") or "")[:4000] if result else "",
            "stderr": (getattr(result, "stderr", "") or "")[:4000] if result else "",
        }

    def _build_verification_report(self) -> Dict[str, Any]:
        checks = []
        sshd = self._find_sshd_binary()
        if sshd and os.path.exists(self.ssh_config_path):
            checks.append(
                self._command_check(
                    "ssh_config_syntax",
                    f"{self._quote(sshd)} -t -f {self._quote(self.ssh_config_path)}",
                    critical=True,
                )
            )
        else:
            checks.append(
                {
                    "id": "ssh_config_syntax",
                    "command": "sshd -t -f <config>",
                    "critical": True,
                    "exitCode": None,
                    "ok": None,
                    "stdout": "",
                    "stderr": "skipped: sshd binary or config file not found",
                }
            )

        if self.ssh_port:
            checks.append(
                self._command_check(
                    "ssh_port_listener",
                    f"ss -tulpn | grep -E ':{int(self.ssh_port)}\\b'",
                    critical=False,
                )
            )

        checks.extend([
            self._command_check("ssh_service_status", "systemctl status sshd --no-pager || systemctl status ssh --no-pager"),
            self._command_check("fail2ban_status", "fail2ban-client status sshd"),
        ])

        if self.pm == "apt-get":
            checks.append(self._command_check("firewall_status", "ufw status verbose"))
        else:
            checks.append(self._command_check("firewall_status", "firewall-cmd --list-all"))

        critical_failures = [
            check for check in checks
            if check.get("critical") and check.get("ok") is False
        ]
        return {
            "version": 1,
            "mode": self.mode,
            "host": socket.gethostname(),
            "createdAt": datetime.now().isoformat(),
            "sshPort": self.ssh_port,
            "osType": self.os_type,
            "packageManager": self.pm,
            "status": "fail" if critical_failures else "pass",
            "criticalFailures": [check["id"] for check in critical_failures],
            "live_apply_safety": self._live_apply_safety_evidence(),
            "checks": checks,
        }

    def _write_verification_report(self, strict: bool = False) -> Dict[str, Any]:
        report = self._build_verification_report()
        os.makedirs(os.path.dirname(self.verification_report_path) or ".", exist_ok=True)
        with open(self.verification_report_path, "w") as f:
            json.dump(report, f, indent=2)
        os.chmod(self.verification_report_path, 0o600)
        self._log_step(
            "verify",
            "ok" if report["status"] == "pass" else "error",
            {"report": self.verification_report_path, "status": report["status"]},
        )
        if strict and report["status"] != "pass":
            raise RuntimeError(f"Kritik doğrulama başarısız: {self.verification_report_path}")
        return report

    def _run_verify_only(self):
        report = self._write_verification_report(strict=False)
        print(f"Verification report: {self.verification_report_path}")
        print(f"Status: {report['status']}")

    def _find_sshd_binary(self) -> Optional[str]:
        for candidate in [shutil.which("sshd"), "/usr/sbin/sshd", "/usr/local/sbin/sshd"]:
            if candidate and os.path.exists(candidate):
                return candidate
        return None

    def _write_validated_ssh_config(self, lines: List[str]) -> None:
        target = Path(self.ssh_config_path)
        candidate = target.with_name(
            f"{target.name}.ultra-candidate-{os.getpid()}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        )
        candidate.write_text("".join(self._dedupe_lines(lines)))
        if target.exists():
            os.chmod(candidate, target.stat().st_mode & 0o777)
        else:
            os.chmod(candidate, 0o644)

        try:
            sshd = self._find_sshd_binary()
            if sshd:
                self._safe_run(
                    f"{self._quote(sshd)} -t -f {self._quote(str(candidate))}",
                    must_succeed=True,
                    allow_fail=False,
                )
                self._log_step("ssh.config.validate", "ok", {"candidate": str(candidate), "validator": sshd})
            else:
                self._log_step(
                    "ssh.config.validate",
                    "skip",
                    {"reason": "sshd_binary_not_found", "candidate": str(candidate)},
                )
            os.replace(candidate, target)
        finally:
            if candidate.exists():
                candidate.unlink()

    def print_banner(self):
        Colors.clear()
        cpu = get_cpu_info()
        mem = get_mem_info()

        banner = f"""
{Colors.OKCYAN}╔══════════════════════════════════════════════════════════════════╗
║{Colors.BOLD}          ULTRA SSH MANAGER v6.0 - SINGULARITY EDITION              {Colors.OKCYAN}║
║  OS: {self.os_type.upper():<12} | PM: {self.pm:<10} | CPU: {cpu['cores']} Core | RAM: {mem['total']/1024/1024:.1f} GB      ║
║  Status: Otonom Savunma Sistemi Hazır                                            ║
╚══════════════════════════════════════════════════════════════════╝{Colors.ENDC}
        """
        print(banner)

    def check_root(self):
        if self.dry_run or self.mode == "verify":
            reason = "DRY-RUN" if self.dry_run else "VERIFY"
            print(f"{Colors.WARNING}{reason}: root kontrolü atlandı; sistemde değişiklik yapılmayacak.{Colors.ENDC}")
            return
        if os.geteuid() != 0:
            print(f"{Colors.FAIL}❌ KRİTİK HATA: ROOT yetkisi gereklidir! (sudo python3 ...){Colors.ENDC}")
            sys.exit(1)

    def create_backup(self, desc="pre_op") -> str:
        """Detaylı ve versiyonlu yedekleme sistemi"""
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        path = f"{self.backup_dir}/backup_{ts}_{desc}"
        os.makedirs(path, exist_ok=True)
        os.chmod(path, 0o700)

        files_to_backup = [
            self.ssh_config_path,
            "/etc/fail2ban/jail.conf",
            "/etc/fail2ban/jail.local",
            "/etc/ufw/user.rules",
            "/etc/sysctl.conf",
            "/etc/hosts.allow",
            "/etc/hosts.deny"
        ]

        manifest = []
        skipped_files = []
        for f in files_to_backup:
            if os.path.exists(f):
                dest = f"{path}/{os.path.basename(f)}"
                source_mode = os.stat(f).st_mode & 0o777
                with open(f, "rb") as fp:
                    source_digest = hashlib.sha256(fp.read()).hexdigest()
                shutil.copy2(f, dest)
                os.chmod(dest, 0o600)
                with open(dest, "rb") as fp:
                    backup_digest = hashlib.sha256(fp.read()).hexdigest()
                manifest.append({
                    "source": f,
                    "dest": dest,
                    "sourceModeOctal": oct(source_mode),
                    "backupModeOctal": "0o600",
                    "hashAlgorithm": "sha256",
                    "hash": source_digest,
                    "sourceHash": source_digest,
                    "backupHash": backup_digest,
                })
            else:
                skipped_files.append({
                    "source": f,
                    "reason": "source_file_missing",
                })

        if manifest and skipped_files:
            manifest_status = "partial"
        elif manifest:
            manifest_status = "complete"
        else:
            manifest_status = "empty"

        # Metadata
        meta = {
            "timestamp": ts,
            "description": desc,
            "os": self.os_type,
            "hostname": socket.gethostname(),
            "kernel": os.uname().release,
            "files": manifest,
            "skippedFiles": skipped_files,
            "manifestStatus": manifest_status,
            "hashAlgorithm": "sha256",
        }
        metadata_path = f"{path}/metadata.json"
        with open(metadata_path, "w") as f:
            json.dump(meta, f, indent=2)
        os.chmod(metadata_path, 0o600)

        print(f"{Colors.OKGREEN}✅ Detaylı Yedek Oluşturuldu: {path}{Colors.ENDC}")
        return path

    def deep_system_audit(self):
        """Sistemi derinlemesine analiz eder (Uzun sürer)"""
        print(f"\n{Colors.OKCYAN}🔍 DERİN SİSTEM ANALİZİ BAŞLATILIYOR (Bu işlem uzun sürebilir)...{Colors.ENDC}")
        spinner = Spinner("Donanım ve Çekirdek analizi yapılıyor...")
        spinner.start()
        if self.audit_pause_seconds > 0:
            time.sleep(min(self.audit_pause_seconds, 1.5))
        spinner.stop()

        # Gerçek analiz adımları
        steps = [
            ("CPU Mikromimarisi Kontrolü", "lscpu"),
            ("Bellek Bütünlük Taraması", "free -h"),
            ("Disk I/O Performans Analizi", "dd if=/dev/zero of=/tmp/test bs=1M count=100 conv=fdatasync 2>&1 | tail -1"),
            ("Ağ Yığını Güvenlik Denetimi", "sysctl -a | grep -E 'net.ipv4|net.ipv6'"),
            ("Çekirdek Modül Güvenliği", "lsmod"),
            ("Açık Port ve Servis Haritalaması", "ss -tulpn"),
            ("Kullanıcı ve Grup Yetki Analizi", "cat /etc/passwd"),
            ("Fail2Ban ve Log Altyapısı Kontrolü", "systemctl status fail2ban --no-pager")
        ]

        results = {}
        for name, cmd in steps:
            spinner = Spinner(f"{name} inceleniyor...")
            spinner.start()
            res = self._run_shell(cmd, timeout=60)
            spinner.stop(success=(res and res.returncode == 0))
            results[name] = res.stdout if res else "Hata"
            if self.audit_pause_seconds > 0:
                time.sleep(min(self.audit_pause_seconds, 0.5))

        # Raporu kaydet
        report_path = f"{self.backup_dir}/audit_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_path, "w") as f:
            json.dump(results, f, indent=2)
        print(f"{Colors.OKGREEN}📊 Detaylı Audit Raporu Kaydedildi: {report_path}{Colors.ENDC}")
        return results

    def generate_knock_sequence(self):
        """Gizli Port Knocking sırası oluştur"""
        sequence_length = int(self.config.get("port_knocking", {}).get("sequence_length", 3))
        min_port = int(self.config.get("port_knocking", {}).get("sequence_min_port", 1000))
        max_port = int(self.config.get("port_knocking", {}).get("sequence_max_port", 59999))
        self.knock_secret = sorted(
            random.sample(range(min_port, max_port + 1), min(sequence_length, 5))
        )
        return self.knock_secret

    def setup_port_knocking(self):
        """Port Knocking altyapısını kurar"""
        if not self.enable_knocking:
            return
        if not self.config.get("port_knocking", {}).get("enabled", True):
            print(f"{Colors.WARNING}⚠️  Yapılandırmada port-knocking kapalı.{Colors.ENDC}")
            return

        print(f"\n{Colors.OKCYAN}🚪 Port Knocking Altyapısı Kuruluyor...{Colors.ENDC}")
        if not self.knock_secret:
            self.generate_knock_sequence()

        knock_ports = " ".join(map(str, self.knock_secret))
        ssh_port = self.ssh_port or 22

        knock_state = {
            "version": 1,
            "sequence": self.knock_secret,
            "ssh_port": ssh_port,
            "created_at": datetime.now().isoformat(),
            "ports": knock_ports
        }
        state_file = str(self.state_dir / "knock_state.json")
        state_file_mode = self.config.get("port_knocking", {}).get("strict_guard", False)
        with open(state_file, "w") as f:
            json.dump(knock_state, f, indent=2)
        os.chmod(state_file, 0o600)

        # IPTABLES/Knock kuralları
        script_path = "/usr/local/sbin/ultra-ssh-knock-activate.sh"
        with open(script_path, "w") as f:
            f.write("#!/usr/bin/env bash\nset -euo pipefail\n")
            for knock_port in self.knock_secret:
                f.write(
                    f"iptables -C INPUT -p tcp --dport {knock_port} "
                    "-m recent --set --name ULTAR_KNOCK --rsource >/dev/null 2>&1 || "
                    f"iptables -A INPUT -p tcp --dport {knock_port} -m recent --name ULTAR_KNOCK --set --rsource\n"
                )
            f.write(
                f"iptables -C INPUT -p tcp --dport {ssh_port} "
                "-m recent --rcheck --seconds 30 --name ULTAR_KNOCK --rsource -j ACCEPT >/dev/null 2>&1 || "
                f"iptables -A INPUT -p tcp --dport {ssh_port} -m recent --rcheck --seconds 30 --name ULTAR_KNOCK --rsource -j ACCEPT\n"
            )
            if state_file_mode:
                f.write(
                    f"iptables -C INPUT -p tcp --dport {ssh_port} -j DROP >/dev/null 2>&1 || "
                    f"iptables -A INPUT -p tcp --dport {ssh_port} -j DROP\n"
                )
        os.chmod(script_path, 0o755)

        if self.config.get("knock_apply", False):
            self._safe_run(script_path, must_succeed=False, allow_fail=True)

        print(f"   ✅ Port knocking kuralları {script_path} dosyasına yazıldı.")
        if state_file_mode:
            print(f"   {Colors.WARNING}⚠️  Güvenlik modu: SSH yalnızca port-knock koşulu başarılıysa açık kalacak. "
                  f"Yanlış sırada uygulama lockout yaratabilir. {Colors.ENDC}")
        else:
            print(f"   ℹ️  Bu modda SSH doğrudan portta açık kalır; knock yalnızca ek erişim kontrolü sağlar. {Colors.ENDC}")
        print(f"   📄 Knock state: {state_file}")

    def harden_kernel(self):
        """Kernel seviyesinde agresif sertleştirme"""
        print(f"\n{Colors.OKCYAN}🛡️  Kernel Seviyesi Sertleştirme (Sysctl)...{Colors.ENDC}")

        sysctl_settings = {
            "net.ipv4.tcp_syncookies": "1",
            "net.ipv4.conf.all.accept_redirects": "0",
            "net.ipv4.conf.all.send_redirects": "0",
            "net.ipv4.conf.all.accept_source_route": "0",
            "net.ipv4.conf.all.log_martians": "1",
            "net.ipv4.icmp_echo_ignore_broadcasts": "1",
            "net.ipv4.ip_forward": "0",
            "net.ipv4.conf.all.rp_filter": "1",
            "net.ipv4.tcp_max_syn_backlog": "2048",
            "net.ipv4.tcp_synack_retries": "2",
            "net.ipv4.tcp_syn_retries": "5",
            "net.ipv4.tcp_fin_timeout": "15",
            "net.ipv4.tcp_keepalive_time": "600",
            "net.ipv4.tcp_keepalive_probes": "5",
            "net.ipv4.tcp_keepalive_intvl": "15",
            "kernel.randomize_va_space": "2",
            "kernel.exec-shield": "1",
            "kernel.dmesg_restrict": "1"
        }

        config_file = "/etc/sysctl.d/99-ultra-ssh-hardening.conf"
        with open(config_file, "w") as f:
            for key, val in sysctl_settings.items():
                f.write(f"{key} = {val}\n")

        self._safe_run(f"sysctl -p {self._quote(config_file)}", must_succeed=True)
        print(f"   ✅ {len(sysctl_settings)} adet kernel parametresi optimize edildi.")

    def install_packages(self, packages: List[str]):
        """Akıllı paket kurulumu (OS uyumlu)"""
        if not packages: return
        print(f"\n{Colors.OKCYAN}📦 Paket Yöneticisi ({self.pm}) ile Kurulum Başlatılıyor...{Colors.ENDC}")

        update_cmd = ""
        install_cmd = ""
        if not self.pm or self.pm == "unknown":
            raise RuntimeError("Paket yöneticisi tespit edilemedi. --dry-run veya alternatif ortam için pm belirtin.")

        if self.pm == "apt-get":
            update_cmd = "apt-get update -y"
            install_cmd = f"apt-get install -y {' '.join(packages)}"
        elif self.pm in ["dnf", "yum"]:
            update_cmd = f"{self.pm} makecache -y"
            install_cmd = f"{self.pm} install -y {' '.join(packages)}"
        elif self.pm == "pacman":
            update_cmd = "pacman -Sy --noconfirm"
            install_cmd = f"pacman -S --noconfirm {' '.join(packages)}"

        if update_cmd:
            spinner = Spinner("Paket listesi güncelleniyor...")
            spinner.start()
            self._run_with_retry(update_cmd, tries=int(self.config.get("package_retry_count", 2)), must_succeed=True)
            spinner.stop()

        spinner = Spinner("Paketler kuruluyor...")
        spinner.start()
        res = self._run_with_retry(
            install_cmd,
            tries=int(self.config.get("package_retry_count", 2)),
            must_succeed=True
        )
        spinner.stop(success=(res and res.returncode == 0))

    def setup_users(self):
        """Gelişmiş kullanıcı yönetimi (Rescue User dahil)"""
        users_to_create = []
        if self.create_user:
            users_to_create.append(
                {"name": self._validate_username(self.create_user), "sudo": self.user_sudo, "rescue": False}
            )

        # Acil durum kurtarma kullanıcısı
        if not any(u["name"] == "rescue_admin" for u in users_to_create):
            users_to_create.append({"name": "rescue_admin", "sudo": True, "rescue": True})

        for user_data in users_to_create:
            username = user_data["name"]
            is_rescue = user_data["rescue"]

            if is_rescue:
                print(f"\n{Colors.WARNING}🚑 ACİL DURUM KULLANICISI OLUŞTURULUYOR: {username}{Colors.ENDC}")
                # Rescue kullanıcı sadece konsol odaklı kalacak, SSH erişimi kısıtlanacak.

            print(f"\n{Colors.OKCYAN}👤 Kullanıcı Oluşturuluyor: {username}{Colors.ENDC}")

            # Var mı?
            exists = self._safe_run(
                f"id -- {self._quote(username)}",
                must_succeed=False,
                allow_fail=True
            )
            if exists and getattr(exists, "returncode", 1) == 0:
                print(f"   {Colors.WARNING}⚠️  Kullanıcı zaten mevcut.{Colors.ENDC}")
            else:
                groups = ""
                if user_data["sudo"]:
                    if self.os_type in ["ubuntu", "debian"]: groups = "sudo"
                    else: groups = "wheel"

                cmd = f"useradd -m -s /bin/bash"
                if groups: cmd += f" -G {groups}"
                cmd += f" {self._quote(username)}"
                self._safe_run(cmd, must_succeed=True)

                # SSH tabanlı erişim odaklı: parola setlenmez, kullanıcı şifresi kilitli kalır.
                self._safe_run(f"passwd -l {self._quote(username)}", must_succeed=False, allow_fail=True)

                # SSH Dizini
                ssh_dir = f"/home/{username}/.ssh"
                quoted_ssh_dir = self._quote(ssh_dir)
                self._safe_run(f"mkdir -p {quoted_ssh_dir}", must_succeed=True)

                # Anahtar Üret
                key_name = f"ultra_key_{username}"
                key_dir = f"{self.cred_dir}/keys/{username}"
                key_path = f"{key_dir}/{key_name}"
                os.makedirs(key_dir, exist_ok=True)
                os.chmod(key_dir, 0o700)
                os.chown(key_dir, 0, 0)
                self._safe_run(
                    f"ssh-keygen -q -t ed25519 -f {key_path} -N '' -C '{username}@omega_ssh'",
                    must_succeed=True,
                    allow_fail=False
                )

                if os.path.exists(f"{key_path}.pub"):
                    with open(f"{key_path}.pub", "r") as f:
                        pub_key = f.read().strip()
                    with open(f"{ssh_dir}/authorized_keys", "w") as f:
                        f.write(pub_key + "\n")

                    self._safe_run(
                        f"chown -R {self._quote(username)}:{self._quote(username)} {quoted_ssh_dir}",
                        must_succeed=True
                    )
                    self._safe_run(f"chmod 700 {quoted_ssh_dir}", must_succeed=True)
                    self._safe_run(f"chmod 600 {self._quote(f'{ssh_dir}/authorized_keys')}", must_succeed=True)

                    print(f"   🔑 SSH Anahtarı: {key_path}")
                    if is_rescue:
                        print(
                            f"   {Colors.FAIL}🚨 DİKKAT: Bu anahtarı FİZİKSEL OLARAK GÜVENLİ YERE YEDEKLEYİN!"
                            f"{Colors.ENDC}"
                        )

                # Bilgileri Kaydet
                info_file = f"{self.cred_dir}/user_{username}_info.json"
                if is_rescue:
                    access_scope = "console-only (SSH deny via sshd config)"
                else:
                    access_scope = "ssh-publickey"
                with open(info_file, "w") as f:
                    json.dump({
                        "username": username,
                        "password": None,
                        "key_path": key_path,
                        "private_key_material_logged": False,
                        "temporary_password_generated": False,
                        "credential_directory": self.cred_dir,
                        "sudo": user_data["sudo"],
                        "rescue": is_rescue,
                        "access_scope": access_scope,
                        "operator_instruction": "Copy private keys through a secure out-of-band channel; do not paste key material into logs, tickets, chat, or commits.",
                        "created_at": datetime.now().isoformat()
                    }, f, indent=2)
                os.chmod(info_file, 0o600)
                print(f"   🔑 SSH credential manifest: {info_file}")
                print("   🔐 Private key material is not printed; retrieve it from the root-owned credential directory.")

    def harden_ssh_config(self, port: int, disable_root: bool):
        """SSH konfigürasyonunu maksimum güvenlik seviyesine çeker"""
        print(f"\n{Colors.OKCYAN}🔒 SSH Konfigürasyonu Sertleştiriliyor (Agresif Mod)...{Colors.ENDC}")
        self.create_backup("pre_ssh_hardening")

        try:
            with open(self.ssh_config_path, "r") as f:
                lines = f.readlines()
        except FileNotFoundError:
            lines = []

        new_lines = []
        settings = {
            "Port": str(port),
            "PermitRootLogin": "no" if disable_root else "prohibit-password",
            "PasswordAuthentication": "no",
            "PubkeyAuthentication": "yes",
            "PermitEmptyPasswords": "no",
            "X11Forwarding": "no",
            "MaxAuthTries": str(self.config.get("max_auth_tries", 4)),
            "ClientAliveInterval": "240",
            "ClientAliveCountMax": "2",
            "Protocol": "2",
            "UsePAM": "yes",
            "PrintMotd": "no",
            "AcceptEnv": "LANG LC_*",
            "Subsystem": "sftp /usr/lib/openssh/sftp-server",
            "AllowAgentForwarding": "no",
            "AllowTcpForwarding": "no",
            "PermitTunnel": "no",
            "Compression": "delayed",
            "UseDNS": "no",
            "DenyUsers": "root rescue_admin",
            "AllowUsers": self.create_user or "",
            "LoginGraceTime": "30"
        }

        match_block = [
            "Match User rescue_admin",
            "PasswordAuthentication no",
            "AuthenticationMethods publickey",
            "PermitTTY no",
            "ForceCommand /usr/sbin/nologin",
        ]

        unmanaged_lines = self._remove_managed_match_block(lines, "Match User rescue_admin")

        seen = set()
        for line in unmanaged_lines:
            stripped = line.strip()
            handled = False
            for key, val in settings.items():
                if not stripped or stripped.startswith("#"):
                    new_lines.append(line if line.endswith("\n") else f"{line}\n")
                    handled = True
                    break
                if stripped.split(maxsplit=1)[0] == key:
                    new_lines.append(f"{key} {val}\n")
                    seen.add(key)
                    handled = True
                    break
            if not handled:
                new_lines.append(line)

        for key, val in settings.items():
            if key in seen:
                continue
            if key == "AllowUsers" and not val:
                continue
            new_lines.append(f"{key} {val}\n")

        # SSHD yapılandırma dosyası idempotent yazımı
        full_lines = new_lines + [f"{line}\n" for line in match_block]
        self._write_validated_ssh_config(full_lines)

        self._safe_run("systemctl reload sshd || systemctl reload ssh", must_succeed=False, allow_fail=True)

        # Özel MOTD oluştur
        self.create_dynamic_motd()

        print(f"   ✅ Port: {port}")
        print(f"   ✅ Root Login: {'KAPALI' if disable_root else 'Sadece Anahtar'}")
        print(f"   ✅ Parola Auth: KAPALI")
        print(f"   ✅ Max Deneme: {self.config.get('max_auth_tries', 4)}")

    def create_dynamic_motd(self):
        """Giriş ekranında canlı istatistik gösteren MOTD"""
        motd_script = "/etc/update-motd.d/99-ultra-ssh"
        script_content = f'''#!/bin/bash
echo ""
echo "{Colors.OKCYAN}╔══════════════════════════════════════════════════════════╗"
echo "║          ULTRA SSH MANAGER - KORUMA ALTINDA                  ║"
echo "╚══════════════════════════════════════════════════════════╝{Colors.ENDC}"
echo ""
echo "📅 Tarih: $(date)"
echo "💻 Yük: $(uptime -p) | Yük Ort.: $(cat /proc/loadavg | cut -d' ' -f1-3)"
echo "🛡️  Son Başarısız Denemeler: $(grep -c "Failed password" /var/log/auth.log 2>/dev/null || echo 0)"
echo "🚫 Banlanan IP'ler: $(fail2ban-client status sshd 2>/dev/null | awk -F: '/Banned IP list/{{print $2}}' | sed 's/ //g' | awk 'NF==0{{print 0;next}} {{print NF}}' )"
echo ""
'''
        # Dizin yoksa oluştur (Debian/Ubuntu için)
        os.makedirs(os.path.dirname(motd_script), exist_ok=True)
        with open(motd_script, "w") as f:
            f.write(script_content)
        os.chmod(motd_script, 0o755)

        # Eski motd linklerini temizle (opsiyonel)
        # Ubuntu'da /etc/motd genellikle dinamiktir.

    def setup_fail2ban(self):
        """Fail2Ban Agresif Mod + Recidive"""
        print(f"\n{Colors.OKCYAN}🛡️  Fail2Ban Agresif Mod ve Tekrarlayan Saldırı Koruması...{Colors.ENDC}")
        max_fail = int(self.config.get("max_login_fails", 5))
        aggressive_retry = max(2, int(max_fail / 2))
        self.install_packages(["fail2ban"])

        jail_conf = """
[DEFAULT]
bantime = 86400
findtime = 600
maxretry = 3
banaction = iptables-multiport
destemail = admin@localhost
sender = fail2ban@localhost
mta = sendmail
protocol = tcp
chain = INPUT
port = ssh
filter = sshd
logpath = /var/log/auth.log
backend = systemd

[sshd]
enabled = true
mode = aggressive
port = ssh
filter = sshd[mode=aggressive]
logpath = /var/log/auth.log
maxretry = """ + str(aggressive_retry) + """
bantime = 604800

[sshd-ddos]
enabled = true
filter = sshd[mode=ddos]
logpath = /var/log/auth.log
maxretry = """ + str(max_fail + 1) + """
findtime = 120
bantime = 1209600

[recidive]
enabled = true
logpath = /var/log/fail2ban.log
banaction = iptables-allports
bantime = 2592000
findtime = 86400
maxretry = 3
"""
        if self.os_type in ["centos", "rocky", "almalinux", "fedora"]:
            jail_conf = jail_conf.replace("/var/log/auth.log", "/var/log/secure")

        with open("/etc/fail2ban/jail.local", "w") as f:
            f.write(jail_conf)

        self._safe_run("systemctl restart fail2ban", must_succeed=True)
        self._safe_run("systemctl enable fail2ban", must_succeed=True)
        print("   ✅ Fail2Ban Agresif Mod ve Recidive Aktif.")

    def setup_firewall(self, port: int):
        """Gelişmiş Firewall (UFW/Firewalld + Özel Kurallar)"""
        print(f"\n{Colors.OKCYAN}🔥 Gelişmiş Güvenlik Duvarı Yapılandırması...{Colors.ENDC}")
        strict_knock_guard = bool(self.config.get("port_knocking", {}).get("strict_guard", False))

        if self.pm == "apt-get": # UFW
            self.install_packages(["ufw"])
            self._safe_run("ufw --force reset", must_succeed=True)
            self._safe_run("ufw default deny incoming", must_succeed=True)
            self._safe_run("ufw default allow outgoing", must_succeed=True)
            if strict_knock_guard and self.enable_knocking:
                self._safe_run(
                    f"ufw deny {self._quote(port)}/tcp comment 'SSH-Ultra pending knock'",
                    must_succeed=True
                )
            else:
                self._safe_run(f"ufw allow {self._quote(port)}/tcp comment 'SSH-Ultra'", must_succeed=True)
            for web_port in self.config.get("firewall_ports", ["80/tcp", "443/tcp"]):
                self._safe_run(f"ufw allow {self._quote(web_port)}", must_succeed=True)
            if self.enable_knocking:
                for knock_port in self.knock_secret:
                    self._safe_run(f"ufw allow {self._quote(knock_port)}/tcp comment 'ssh-knock'", must_succeed=True)
            self._safe_run(
                f"ufw limit from any to any port {self._quote(port)} proto tcp comment 'ssh-flood-mitigation' || true",
                must_succeed=False
            )
            self._safe_run("ufw --force enable", must_succeed=True)
            print("   ✅ UFW Aktif ve Yapılandırıldı.")
            if self.enable_knocking:
                if strict_knock_guard:
                    print("   ℹ️  Port-knocking açık: SSH doğrudan kapalıdır, yalnızca knock başarılı açılır.")
                else:
                    print("   ℹ️  Port-knocking açık: SSH doğrudan erişime de açık bırakıldı.")

        else: # Firewalld
            self.install_packages(["firewalld"])
            self._safe_run("systemctl start firewalld", must_succeed=True)
            self._safe_run("systemctl enable firewalld", must_succeed=True)
            self._safe_run("firewall-cmd --permanent --remove-service=ssh", must_succeed=False)
            self._safe_run(f"firewall-cmd --permanent --add-port={int(port)}/tcp", must_succeed=True)
            self._safe_run("firewall-cmd --permanent --add-service=http", must_succeed=True)
            self._safe_run("firewall-cmd --permanent --add-service=https", must_succeed=True)
            for knock_port in self.knock_secret:
                self._safe_run(
                    f"firewall-cmd --permanent --add-port={int(knock_port)}/tcp",
                    must_succeed=False
                )
            if strict_knock_guard and self.enable_knocking:
                print(
                    "   ⚠️  Firewalld için port-knock strict guard modu doğrudan desteklenmiyor; "
                    "SSH doğrudan açık kalacak şekilde daha güvenli varsayılan çalışılıyor."
                )
                self._log_step(
                    "firewall",
                    "warn",
                    {"reason": "strict_guard_unwired_firewalld", "note": "iptables-based knock script is still required"}
                )
                print(
                    "   ℹ️  Port-knocking açık: firewalld'de SSH doğrudan erişim hala korunur, "
                    "özellikle firewalld ortamında knock davranışı iptables tabanlı olarak kontrol edilir."
                )
            self._safe_run("firewall-cmd --permanent --add-rich-rule='rule protocol value=icmp limit value=1/s accept'", must_succeed=False)
            self._safe_run("firewall-cmd --reload", must_succeed=True)
            print("   ✅ Firewalld Aktif ve Yapılandırıldı.")

    def start_dashboard(self):
        """Gerçek zamanlı siber savaş dashboard'u"""
        print(f"\n{Colors.OKCYAN}📊 Siber Savaş Dashboard'u Başlatılıyor (Ctrl+C ile çık)...{Colors.ENDC}")
        time.sleep(2)

        try:
            while True:
                Colors.clear()
                print(f"{Colors.HEADER}╔══════════════════════════════════════════════════════════╗")
                print(f"║         ULTRA SSH MANAGER - CANLI SAVUNMA PANELİ         ║")
                print(f"╚══════════════════════════════════════════════════════════╝{Colors.ENDC}\n")

                # Sistem Kaynakları
                cpu = get_cpu_info()
                mem = get_mem_info()
                psutil_module = self._load_psutil()
                disk = None
                if psutil_module:
                    try:
                        disk = psutil_module.disk_usage("/")
                    except: pass

                print(f"{Colors.OKBLUE}💻 Sistem Durumu:{Colors.ENDC}")
                cpu_bar = '█' * int(cpu['usage'] / 2) + '░' * (50 - int(cpu['usage'] / 2))
                print(f"   CPU: [{cpu_bar}] %{cpu['usage']:.1f}")
                mem_bar = '█' * int(mem['percent'] / 2) + '░' * (50 - int(mem['percent'] / 2))
                print(f"   RAM: [{mem_bar}] %{mem['percent']:.1f}")
                if disk is not None and hasattr(disk, 'percent'):
                    disk_bar = '█' * int(disk.percent / 2) + '░' * (50 - int(disk.percent / 2))
                    print(f"   DISK:[{disk_bar}] %{disk.percent:.1f}")

                # Ağ ve Saldırı Bilgileri
                print(f"\n{Colors.FAIL}🛡️  Savunma Durumu:{Colors.ENDC}")
                try:
                    # Son başarısız denemeler
                    res = self._run_shell("grep 'Failed password' /var/log/auth.log | tail -5", timeout=30)
                    if res and res.stdout:
                        print(f"   Son 5 Başarısız Deneme:")
                        for line in res.stdout.strip().split('\n'):
                            ip_match = re.search(r'from (\d+\.\d+\.\d+\.\d+)', line)
                            if ip_match:
                                print(f"   - {Colors.FAIL}{ip_match.group(1)}{Colors.ENDC}")
                    else:
                        print(f"   {Colors.OKGREEN}✅ Son dönemde başarısız deneme yok.{Colors.ENDC}")
                except: pass

                try:
                    # Banlanan IP sayısı
                    res = self._run_shell("fail2ban-client status sshd", timeout=30)
                    if res and res.returncode == 0:
                        banned = len(re.findall(r'\|`(.*)`', res.stdout))
                        print(f"   🚫 Aktif Banlar: {Colors.FAIL}{banned}{Colors.ENDC}")
                except: pass

                print(f"\n{Colors.OKCYAN}Son Güncelleme: {datetime.now().strftime('%H:%M:%S')}{Colors.ENDC}")
                refresh_delay = float(self.config.get("dashboard_refresh_seconds", 2.0))
                time.sleep(max(0.5, refresh_delay))
        except KeyboardInterrupt:
            print(f"\n{Colors.OKGREEN}Dashboard kapatıldı.{Colors.ENDC}")
        except Exception as e:
            print(f"{Colors.FAIL}❌ Dashboard hatası: {str(e)}{Colors.ENDC}")
            # Psutil yoksa kurmayı dene
            if "psutil" in str(e):
                print("   📦 Psutil kuruluyor...")
                self.install_packages(["python3-psutil"])
                print("   Lütfen dashboard'u tekrar başlatın.")

    def interactive_mode(self):
        """Kullanıcıdan adım adım bilgi al"""
        print("\n--- INTERACTIVE SETUP WIZARD ---")

        # Mod Seçimi
        print("1. Sadece Güvenlik Sertleştirme (--harden)")
        print("2. Tam Kurulum (Paketler + Kullanıcı + Güvenlik) (--full-setup)")
        print("3. Derin Sistem Analizi ve Raporlama (--audit)")
        print("4. Canlı Dashboard (--dashboard)")
        print("5. Doğrulama Raporu (--verify)")
        choice = self._prompt("Seçiminiz (1-5) [2]: ").strip()

        if choice == "1": self.mode = "harden"
        elif choice == "3": self.mode = "audit"
        elif choice == "4": self.mode = "dashboard"
        elif choice == "5": self.mode = "verify"
        else: self.mode = "full-setup"

        if self.mode == "dashboard":
            # Ana akışta start_dashboard, ancak run_full_setup içinde tek noktadan çalışsın.
            return

        if self.mode == "audit":
            # Ana akışta deep audit tek bir doğrulama adımı olarak çalışsın.
            return

        if self.mode == "verify":
            return

        # OS Teeyidi
        print(f"Tespit edilen OS: {self.os_type.upper()} ({self.pm})")
        if self._prompt("Doğru mu? (e/h) [e]: ").lower() == 'h':
            self.os_type = self._prompt("OS adı (ubuntu/centos/rocky/debian/arch): ").lower()
            self.pm = self.get_package_manager(self.os_type)

        # Port
        curr_port = self._prompt("Yeni SSH Portu (Varsayılan: 2222): ").strip()
        try:
            self.ssh_port = int(curr_port) if curr_port else 2222
        except ValueError:
            print(f"{Colors.FAIL}⚠️  Geçersiz port girdisi, varsayılan 2222 kullanılıyor.{Colors.ENDC}")
            self.ssh_port = 2222

        # Root
        root_ans = self._prompt("Root SSH girişini tamamen kapat? (e/h) [e]: ").lower()
        self.disable_root = (root_ans != 'h')

        # Kullanıcı
        user_ans = self._prompt("Yeni kullanıcı oluşturulsun mu? (e/h) [e]: ").lower()
        if user_ans != 'h':
            self.create_user = self._prompt("Kullanıcı adı: ").strip()
            sudo_ans = self._prompt("Sudo yetkisi verilsin mi? (e/h) [e]: ").lower()
            self.user_sudo = (sudo_ans != 'h')
        else:
            self.create_user = None

        # Port Knocking
        knock_ans = self._prompt("Port Knocking (Gizli Kapı) aktif edilsin mi? (e/h) [e]: ").lower()
        self.enable_knocking = (knock_ans != 'h')

        # Deep Audit
        audit_ans = self._prompt("Kurulum öncesi Derin Sistem Analizi yapılsın mı? (e/h) [e]: ").lower()
        self.deep_audit = (audit_ans != 'h')

        # Email
        self.admin_email = self._prompt("Bildirim E-postası (opsiyonel): ").strip() or "admin@localhost"

    def run_full_setup(self):
        """Tüm süreci çalıştır"""
        if self.mode == "interactive":
            self.interactive_mode()

        self.print_banner()
        self.check_root()
        self.failure = None
        try:
            handlers = {
                "dashboard": self.start_dashboard,
                "audit": self.deep_system_audit,
                "verify": self._run_verify_only,
                "harden": self._run_dry_run_harden if self.dry_run else self._run_harden_only,
                "full-setup": self._run_dry_run_full_setup if self.dry_run else self._run_full_setup_flow,
            }
            action = handlers.get(self.mode, self._run_full_setup_flow)
            action()
        finally:
            self._write_report()

    def _run_full_setup_flow(self):
        return self._run_hardening_flow(include_user_setup=True)

    def _run_harden_only(self):
        return self._run_hardening_flow(include_user_setup=False)

    def _run_dry_run_full_setup(self):
        return self._run_dry_run_flow(include_user_setup=True)

    def _run_dry_run_harden(self):
        return self._run_dry_run_flow(include_user_setup=False)

    def _run_hardening_flow(self, include_user_setup: bool):
        label = "full-setup" if include_user_setup else "harden"
        self.begin_transaction(label)
        self._log_step("flow.start", "ok", {"mode": label, "include_user_setup": include_user_setup})
        try:
            plan = self._build_dry_run_plan(include_user_setup)
            self._write_apply_artifacts(plan)
            self._log_step(
                "apply.plan",
                "ok",
                {
                    "mode": label,
                    "plan": self.apply_plan_path,
                    "recovery_playbook": self.recovery_playbook_path,
                    "planned_commands": len(plan["plannedCommands"]),
                },
            )
            self._preflight()
            self._install_packages()
            if include_user_setup:
                self.setup_users()
                self._log_step("step", "ok", {"name": "users", "enabled": True})
            else:
                self._log_step("step", "skip", {"name": "users", "enabled": False})
            if self.enable_knocking:
                self.setup_port_knocking()
            self.harden_ssh_config(self.ssh_port, self.disable_root)
            self.harden_kernel()
            self.setup_fail2ban()
            self.setup_firewall(self.ssh_port)
            self._restart_services()
            self._write_verification_report(strict=True)
            self._post_install_summary()
            self._log_step("flow.end", "ok", {"mode": label})
        except Exception as exc:
            self._log_step("flow", "error", {"mode": label, "error": str(exc)})
            if self.rollback_enabled:
                self.rollback()
            self.failure = str(exc)
            raise
        finally:
            if self.active_transaction and not self.failure:
                self.active_transaction = None

    def _preflight(self):
        print(f"\n{Colors.BOLD}🚀 BAŞLIYORUZ...{Colors.ENDC}")
        print(f"Mod: {self.mode}")
        print(f"OS: {self.os_type}")
        print(f"Hedef Port: {self.ssh_port}")
        print(f"Root Kapatma: {self.disable_root}")
        print(f"Yeni Kullanıcı: {self.create_user}")
        print(f"Port Knocking: {self.enable_knocking}")
        print(f"Derin Analiz: {self.deep_audit}")

        if self.mode in ["harden", "full-setup"]:
            if self.confirm_live_apply_safety:
                self._log_step(
                    "preflight.mutating_apply_confirmation",
                    "ok",
                    {"source": "explicit_cli_flag"}
                )
            else:
                confirm = self._prompt("\n⚠️  Bu işlemler sistemde köklü değişiklikler yapacak. Devam? (e/h): ").lower()
                if confirm != 'e':
                    print("İptal edildi.")
                    raise RuntimeError("Kullanıcı onayı alınmadı")
                self._log_step(
                    "preflight.mutating_apply_confirmation",
                    "ok",
                    {"source": "interactive_prompt"}
                )
            self._confirm_live_apply_safety()

        if self.deep_audit:
            self.deep_system_audit()

    def _confirm_live_apply_safety(self):
        if self.dry_run or self.mode not in ["harden", "full-setup"]:
            self._log_step(
                "preflight.live_apply_safety",
                "skip",
                {"mode": self.mode, "dry_run": self.dry_run, "reason": "non_mutating_mode_or_dry_run"}
            )
            return

        if self.confirm_live_apply_safety:
            accepted = {
                "second_access_path": True,
                "maintenance_window": True,
                "plan_and_recovery_reviewed": True,
                "source": "explicit_cli_flag"
            }
            self._log_step("preflight.live_apply_safety", "ok", {"accepted": accepted})
            return

        checks = [
            (
                "second_access_path",
                "İkinci erişim yolu aktif mi? (provider console / mevcut SSH session / break-glass) (e/h): "
            ),
            (
                "maintenance_window",
                "Maintenance window ve bağlantı kopma riski onaylandı mı? (e/h): "
            ),
            (
                "plan_and_recovery_reviewed",
                "Apply plan, rollback metadata ve recovery playbook gözden geçirildi mi? (e/h): "
            )
        ]
        accepted = {}
        for key, prompt in checks:
            accepted[key] = self._prompt(prompt).strip().lower() == "e"

        if not all(accepted.values()):
            self._log_step("preflight.live_apply_safety", "error", {"accepted": accepted})
            print("İptal edildi: canlı SSH/firewall apply için güvenlik onayları eksik.")
            raise RuntimeError("Canlı SSH/firewall apply güvenlik onayı alınmadı")

        self._log_step("preflight.live_apply_safety", "ok", {"accepted": accepted})

    def _install_packages(self):
        # Ortak bağımlılıklar
        self.install_packages(self._planned_packages())

    def _restart_services(self):
        print(f"\n{Colors.WARNING}⚠️  SSH ve güvenlik servisleri yeniden başlatılıyor...{Colors.ENDC}")
        print(f"{Colors.FAIL}DİKKAT: Bağlantınız kopabilir! Yeni port ve anahtarla bağlanın.{Colors.ENDC}")
        timeout = int(self.config.get("service_restart_timeout_sec", 45))
        time.sleep(min(5, timeout))

        if self.os_type in ["ubuntu", "debian"]:
            self._safe_run("systemctl restart ssh", must_succeed=self.config.get("enable_service_restart", True))
        else:
            self._safe_run("systemctl restart sshd", must_succeed=self.config.get("enable_service_restart", True))
        self._safe_run("systemctl restart fail2ban", must_succeed=self.config.get("enable_service_restart", True))
        self._safe_run("systemctl daemon-reload", must_succeed=False)

    def _post_install_summary(self):
        print(f"\n{Colors.OKGREEN}╔══════════════════════════════════════════════════════════╗")
        print(f"║{Colors.BOLD}          İŞLEM TAMAMLANDI! SİSTEM GÜVENLİ.                 {Colors.OKGREEN}║")
        print(f"╚══════════════════════════════════════════════════════════╝{Colors.ENDC}")

        user = self.create_user or "rescue_admin"
        credential_manifest = f"{self.cred_dir}/user_{user}_info.json"
        conn_str = f"ssh -i <operator-private-key-path> -p {self.ssh_port} {user}@IP_ADRESI"
        if self.enable_knocking:
            print(f"\n{Colors.WARNING}🚪 PORT KNOCKING AKTİF/AYARLI: Bağlanmadan önce sırayı uygulayın: {self.knock_secret}{Colors.ENDC}")
            print(f"   Örnek: knock IP_ADRESI {' '.join(map(str, self.knock_secret))}")

        print(f"\n🔹 Önerilen Bağlantı Komutu:")
        print(f"   {conn_str}")
        print(f"\n🔹 Credential manifest: {credential_manifest}")
        print(f"🔹 Private key material terminal çıktısına basılmaz; manifestteki yolu güvenli kanaldan alın.")
        print(f"\n🔹 Acil Durum Kullanıcısı: rescue_admin (console-only manifest: {self.cred_dir}/user_rescue_admin_info.json)")
        print(f"\n{Colors.FAIL}⚠️  BU PENCEREYİ KAPATMADAN YENİ BİR TERMİNALDE BAĞLANTIYI TEST EDİN!{Colors.ENDC}")
        if self.failure:
            self._log_step("summary", "fail", {"error": self.failure})
        else:
            self._log_step("summary", "ok")

if __name__ == "__main__":
    # Argüman Parsing
    parser = argparse.ArgumentParser(description="ULTRA SSH Manager v6.0 - Singularity Edition")
    parser.add_argument("--mode", choices=["interactive", "harden", "full-setup", "audit", "dashboard", "verify"], default="interactive", help="Çalışma modu")
    parser.add_argument("--port", type=int, help="SSH Portu")
    parser.add_argument("--keep-root", action="store_true", help="Root girişini açık bırak")
    parser.add_argument("--user", type=str, help="Oluşturulacak kullanıcı adı")
    parser.add_argument("--no-sudo", action="store_true", help="Kullanıcıya sudo verme")
    parser.add_argument("--no-knock", action="store_true", help="Port Knocking'i devre dışı bırak")
    parser.add_argument("--no-audit", action="store_true", help="Derin analizi atla")
    parser.add_argument("--dry-run", action="store_true", help="Sistem değiştirmeden plan ve recovery playbook üret")
    parser.add_argument("--confirm-live-apply-safety", action="store_true", help="Canlı harden/full-setup için ikinci erişim, maintenance window ve recovery review onayını açıkça ver")
    parser.add_argument("--plan-output", type=str, help="Dry-run JSON plan çıktı yolu")
    parser.add_argument("--recovery-playbook-output", type=str, help="Dry-run recovery playbook çıktı yolu")
    parser.add_argument("--state-base", type=str, help="State, report, backup ve credential taban dizini")
    parser.add_argument("--log-file", type=str, help="Operasyon log dosyası")
    parser.add_argument("--stats-file", type=str, help="Dashboard/statistik JSON dosyası")

    args = parser.parse_args()

    if args.dry_run:
        default_state_base = str(Path.home() / ".local" / "state" / "ultra_ssh_manager")
    else:
        default_state_base = "/var/lib/ultra_ssh_manager"
    state_base = args.state_base or default_state_base
    if args.dry_run:
        default_log_file = str(Path(state_base) / "logs" / "ultra_ssh_omega.log")
        default_stats_file = str(Path(state_base) / "logs" / "ssh_stats_omega.json")
    else:
        default_log_file = "/var/log/ultra_ssh_omega.log"
        default_stats_file = "/var/log/ssh_stats_omega.json"

    manager = UltraSSHManager(
        state_base=state_base,
        log_file=args.log_file or default_log_file,
        stats_file=args.stats_file or default_stats_file,
    )

    # Argümanları yükle
    manager.mode = args.mode
    if args.port: manager.ssh_port = args.port
    if args.keep_root: manager.disable_root = False
    if args.user: manager.create_user = args.user
    if args.no_sudo: manager.user_sudo = False
    if args.no_knock: manager.enable_knocking = False
    if args.no_audit: manager.deep_audit = False
    if args.dry_run: manager.dry_run = True
    if args.confirm_live_apply_safety: manager.confirm_live_apply_safety = True
    if args.plan_output: manager.dry_run_plan_path = args.plan_output
    if args.recovery_playbook_output: manager.recovery_playbook_path = args.recovery_playbook_output

    # Varsayılan port atanmamışsa
    if manager.mode not in ["dashboard", "audit", "verify"] and not manager.ssh_port:
        manager.ssh_port = 2222

    try:
        manager.run_full_setup()
    except Exception as exc:
        print(f"{Colors.FAIL}❌ Çalıştırma hatası: {exc}{Colors.ENDC}")
        sys.exit(1)
