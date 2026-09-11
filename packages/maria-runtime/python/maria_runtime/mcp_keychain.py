from __future__ import annotations

import subprocess
from typing import Callable, Any


Runner = Callable[..., Any]


class MCPKeychainSecretSource:
    """Bounded macOS Keychain-backed MCP secret source.

    The source reads one generic-password item whose service is scoped to the
    MCP server and whose account is the exact reviewed environment key. It uses
    the absolute system ``security`` binary, never a shell, never inherited
    environment variables, and never includes secret output/stderr in raised
    errors or object representations.

    This adapter performs no writes to Keychain. Provisioning/rotating entries
    remains an explicit user/admin action outside this boundary.
    """

    def __init__(
        self,
        *,
        runner: Runner = subprocess.run,
        security_binary: str = "/usr/bin/security",
        service_prefix: str = "SEIS.MCP",
        timeout_seconds: float = 2.0,
        max_secret_bytes: int = 8 * 1024,
    ) -> None:
        if not security_binary.startswith("/"):
            raise ValueError("security_binary must be an absolute path")
        if not service_prefix.strip() or self._has_control(service_prefix):
            raise ValueError("service_prefix must be a non-empty control-free string")
        if timeout_seconds <= 0:
            raise ValueError("timeout_seconds must be positive")
        if max_secret_bytes <= 0:
            raise ValueError("max_secret_bytes must be positive")

        self._runner = runner
        self._security_binary = security_binary
        self._service_prefix = service_prefix
        self._timeout_seconds = float(timeout_seconds)
        self._max_secret_bytes = int(max_secret_bytes)

    def resolve(self, *, server_name: str, key: str) -> str | None:
        self._validate_identity("server_name", server_name)
        self._validate_identity("key", key)
        service = f"{self._service_prefix}.{server_name}"

        argv = (
            self._security_binary,
            "find-generic-password",
            "-s",
            service,
            "-a",
            key,
            "-w",
        )
        try:
            completed = self._runner(
                argv,
                capture_output=True,
                text=False,
                shell=False,
                timeout=self._timeout_seconds,
                env={},
                check=False,
            )
        except Exception:
            raise RuntimeError("macOS Keychain lookup failed") from None

        returncode = getattr(completed, "returncode", None)
        if returncode != 0:
            return None

        stdout = getattr(completed, "stdout", None)
        if not isinstance(stdout, (bytes, bytearray)):
            raise RuntimeError("macOS Keychain lookup returned invalid output")
        raw = bytes(stdout).rstrip(b"\r\n")
        if not raw:
            return None
        if len(raw) > self._max_secret_bytes:
            raise RuntimeError("macOS Keychain secret exceeds configured byte limit")
        if b"\x00" in raw:
            raise RuntimeError("macOS Keychain secret contains an invalid character")
        try:
            return raw.decode("utf-8", errors="strict")
        except UnicodeDecodeError:
            raise RuntimeError("macOS Keychain secret is not valid UTF-8") from None

    @staticmethod
    def _has_control(value: str) -> bool:
        return any(ord(character) < 32 or ord(character) == 127 for character in value)

    @classmethod
    def _validate_identity(cls, field: str, value: str) -> None:
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"{field} must be a non-empty string")
        if cls._has_control(value) or "\x00" in value:
            raise ValueError(f"{field} contains an invalid control character")
        if len(value.encode("utf-8")) > 512:
            raise ValueError(f"{field} exceeds the configured identity size limit")

    def __repr__(self) -> str:
        return (
            "MCPKeychainSecretSource("
            f"security_binary={self._security_binary!r}, "
            f"service_prefix={self._service_prefix!r}, "
            f"timeout_seconds={self._timeout_seconds!r}, "
            f"max_secret_bytes={self._max_secret_bytes!r})"
        )
