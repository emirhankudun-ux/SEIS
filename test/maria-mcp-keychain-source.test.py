from __future__ import annotations

from dataclasses import dataclass
import subprocess
import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.mcp_keychain import MCPKeychainSecretSource


@dataclass
class _Completed:
    returncode: int = 0
    stdout: bytes = b""
    stderr: bytes = b""


class _Runner:
    def __init__(self, result=None, error=None):
        self.result = result or _Completed()
        self.error = error
        self.calls = []

    def __call__(self, argv, **kwargs):
        self.calls.append((tuple(argv), dict(kwargs)))
        if self.error is not None:
            raise self.error
        return self.result


class MCPKeychainSecretSourceTests(unittest.TestCase):
    def test_reads_exact_server_key_from_absolute_security_binary(self):
        runner = _Runner(_Completed(stdout=b"super-secret\n"))
        source = MCPKeychainSecretSource(runner=runner)

        value = source.resolve(server_name="unreal", key="OPENAI_API_KEY")

        self.assertEqual(value, "super-secret")
        self.assertEqual(len(runner.calls), 1)
        argv, kwargs = runner.calls[0]
        self.assertEqual(argv[0], "/usr/bin/security")
        self.assertEqual(
            argv[1:],
            (
                "find-generic-password",
                "-s",
                "SEIS.MCP.unreal",
                "-a",
                "OPENAI_API_KEY",
                "-w",
            ),
        )
        self.assertFalse(kwargs["shell"])
        self.assertTrue(kwargs["capture_output"])
        self.assertFalse(kwargs["text"])
        self.assertEqual(kwargs["env"], {})
        self.assertGreater(kwargs["timeout"], 0)

    def test_missing_item_returns_none_without_echoing_stderr(self):
        secret_error = b"sensitive keychain diagnostics"
        source = MCPKeychainSecretSource(
            runner=_Runner(_Completed(returncode=44, stderr=secret_error))
        )

        self.assertIsNone(source.resolve(server_name="unreal", key="TOKEN"))

    def test_runner_exception_is_normalized_without_sensitive_message(self):
        source = MCPKeychainSecretSource(
            runner=_Runner(error=RuntimeError("SENSITIVE_RUNNER_FAILURE"))
        )

        with self.assertRaises(RuntimeError) as ctx:
            source.resolve(server_name="unreal", key="TOKEN")

        self.assertNotIn("SENSITIVE_RUNNER_FAILURE", str(ctx.exception))

    def test_rejects_control_characters_and_unbounded_secret_output(self):
        source = MCPKeychainSecretSource(runner=_Runner())
        with self.assertRaises(ValueError):
            source.resolve(server_name="bad\nserver", key="TOKEN")
        with self.assertRaises(ValueError):
            source.resolve(server_name="unreal", key="BAD\x00KEY")

        oversized = MCPKeychainSecretSource(
            runner=_Runner(_Completed(stdout=b"x" * 33)),
            max_secret_bytes=32,
        )
        with self.assertRaises(RuntimeError):
            oversized.resolve(server_name="unreal", key="TOKEN")

    def test_timeout_is_normalized_and_secret_value_is_not_retained_in_repr(self):
        source = MCPKeychainSecretSource(
            runner=_Runner(error=subprocess.TimeoutExpired(cmd="redacted", timeout=0.1)),
            timeout_seconds=0.1,
        )
        with self.assertRaises(RuntimeError) as ctx:
            source.resolve(server_name="unreal", key="TOKEN")
        self.assertEqual(str(ctx.exception), "macOS Keychain lookup failed")
        self.assertNotIn("TOKEN", repr(source))


if __name__ == "__main__":
    unittest.main()
