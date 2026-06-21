"""Advanced sandboxed shell execution layer."""

from __future__ import annotations

import os
import re
import shlex
import shutil
import subprocess
from pathlib import Path

from config import (
    SANDBOX_ENABLED,
    SANDBOX_TIMEOUT,
    SANDBOX_MAX_OUTPUT,
    SANDBOX_WORKDIR,
    SAFE_SHELL_COMMANDS,
    DATA_DIR,
)


DANGEROUS_PATTERNS = [
    r"rm\s+-rf\s+/",
    r":\(\)\{\s*:\|:&\s*\};:",
    r"\bdd\s+if=.*of=/dev/",
    r"\bmkfs\b",
    r"\b(shutdown|reboot|poweroff|halt|init\s+0|init\s+6)\b",
    r">\s*/dev/sd",
    r"\bchmod\s+-R\s+777\s+/\b",
    r"\bcurl\s+.*\|\s*bash\b",
    r"\bwget\s+.*\|\s*sh\b",
    r"\bnc\s+-l\b",
    r"\beval\b",
    r"\$\(.*\)",
    r"`.*`",
]


class SandboxViolation(Exception):
    pass


def validate(command: str) -> tuple[bool, str]:
    """Validate user command before running."""
    if not SANDBOX_ENABLED:
        return True, ""

    for pat in DANGEROUS_PATTERNS:
        if re.search(pat, command):
            return False, f"Tehlikeli komut reddedildi (pattern: {pat})"

    try:
        parts = shlex.split(command)
    except ValueError as e:
        return False, f"Ayrıştırma hatası: {e}"
    if not parts:
        return False, "Boş komut."

    base = parts[0]
    if "/" in base:
        if not (shutil.which(base) and os.path.isfile(base)):
            return False, f"Çalıştırılabilir değil: {base}"

    if base not in SAFE_SHELL_COMMANDS:
        return False, f"İzinsiz komut: {base}"

    # Restrict redirection outputs outside sandbox
    if ">" in command or "<" in command:
        for token in command.split():
            if token.startswith(">") or token.startswith("<"):
                target = token.lstrip("<>")
                if target and "/" in target and not target.startswith(SANDBOX_WORKDIR):
                    return False, f"Yönlendirme sadece {SANDBOX_WORKDIR} içinde izinli"

    return True, ""


def run(command: str, cwd: str | None = None, env: dict | None = None) -> dict:
    """Execute command in sandbox and return structured response."""
    ok, reason = validate(command)
    if not ok:
        return {
            "ok": False,
            "stdout": "",
            "stderr": reason,
            "code": -1,
            "duration": 0.0,
            "blocked": True,
        }

    workdir = cwd or SANDBOX_WORKDIR
    Path(workdir).mkdir(parents=True, exist_ok=True)

    safe_env = {
        "PATH": "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
        "HOME": str(DATA_DIR),
        "LANG": "C.UTF-8",
        "PWD": workdir,
    }
    if env:
        safe_env.update(env)

    import time

    start = time.time()
    try:
        completed = subprocess.run(
            shlex.split(command),
            cwd=workdir,
            env=safe_env,
            capture_output=True,
            text=True,
            timeout=SANDBOX_TIMEOUT,
            check=False,
        )
        duration = time.time() - start
        stdout = (completed.stdout or "")[:SANDBOX_MAX_OUTPUT]
        stderr = (completed.stderr or "")[:SANDBOX_MAX_OUTPUT]
        truncated = len(completed.stdout or "") > SANDBOX_MAX_OUTPUT
        if truncated:
            stdout += f"\n...[kırpıldı, toplam {len(completed.stdout or '')} karakter]"
        return {
            "ok": completed.returncode == 0,
            "stdout": stdout,
            "stderr": stderr,
            "code": completed.returncode,
            "duration": round(duration, 3),
            "blocked": False,
            "truncated": truncated,
        }
    except subprocess.TimeoutExpired:
        return {
            "ok": False,
            "stdout": "",
            "stderr": f"Zaman aşımı ({SANDBOX_TIMEOUT}s)",
            "code": -1,
            "duration": SANDBOX_TIMEOUT,
            "blocked": False,
        }
    except Exception as e:  # pragma: no cover
        return {
            "ok": False,
            "stdout": "",
            "stderr": str(e),
            "code": -1,
            "duration": 0.0,
            "blocked": False,
        }
