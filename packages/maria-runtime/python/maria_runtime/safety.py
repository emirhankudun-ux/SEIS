from __future__ import annotations

import re
import shlex


class CommandPolicy:
    """Parse a narrow command string into argv without invoking a shell.

    This class is policy only; it intentionally does not execute commands.
    """

    _SHELL_SYNTAX = re.compile(r"(?:&&|\|\||[|;&><`$\n\r])")
    _BLOCKED_EXECUTABLES = {
        "sudo",
        "su",
        "reboot",
        "shutdown",
        "halt",
        "poweroff",
        "mkfs",
        "fdisk",
        "diskutil",
        "dd",
    }
    _BLOCKED_RM_FLAGS = {"-rf", "-fr", "--recursive", "--force"}

    def prepare(self, command: str) -> list[str]:
        if not isinstance(command, str) or not command.strip():
            raise ValueError("command must be non-empty")
        if self._SHELL_SYNTAX.search(command):
            raise ValueError("shell composition/redirection is not allowed")

        try:
            argv = shlex.split(command, posix=True)
        except ValueError as exc:
            raise ValueError("invalid command quoting") from exc
        if not argv:
            raise ValueError("command must be non-empty")

        executable = argv[0].rsplit("/", 1)[-1].lower()
        if executable in self._BLOCKED_EXECUTABLES:
            raise ValueError(f"blocked executable: {executable}")

        if executable == "rm":
            flags = {token.lower() for token in argv[1:] if token.startswith("-")}
            if flags & self._BLOCKED_RM_FLAGS or any("r" in flag and "f" in flag for flag in flags):
                raise ValueError("recursive/forced rm is not allowed")

        return argv
