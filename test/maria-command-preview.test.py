from __future__ import annotations

from dataclasses import FrozenInstanceError, replace
import importlib
import json
from pathlib import Path
import subprocess
import sys
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))
LAUNCHER = ROOT / "apps" / "maria-desktop" / "maria.py"


class CommandPreviewContractTests(unittest.TestCase):
    def setUp(self):
        self.api = importlib.import_module("maria_runtime.command_preview")

    def preview(self, value):
        return self.api.preview_legacy_command(value)

    def test_all_nine_commands_remain_non_authorizing(self):
        cases = {
            "ARA": ("SEIS tasarım", "external", True),
            "APP": ("youtube", "external", True),
            "YT": ("piyano", "external", True),
            "NOT": ("İris Tasarımı", "modify", True),
            "SAAT": ("", "read", False),
            "KILIT": ("", "privacy-sensitive", True),
            "KLASOR": ("SEIS", "modify", True),
            "YAZI": ("Tipografi", "modify", True),
            "KONUS": ("Merhaba Emirhan", "read", False),
        }
        for command, (argument, action_class, approval) in cases.items():
            with self.subTest(command=command):
                result = self.preview(command + "|" + argument)
                self.assertEqual(result.command.value, command)
                self.assertEqual(result.argument, argument)
                self.assertEqual(result.action_class.value, action_class)
                self.assertIs(result.requires_approval, approval)
                self.assertIs(result.execution_authorized, False)

    def test_arguments_preserve_case_spacing_unicode_and_literal_pipes(self):
        argument = "  İris / Café / Cafe\u0301 | SEIS  "
        self.assertEqual(self.preview("NOT|" + argument).argument, argument)

    def test_accepts_only_one_optional_terminal_lf_or_crlf(self):
        for ending in ("", "\n", "\r\n"):
            with self.subTest(ending=repr(ending)):
                result = self.preview("NOT|İris\u00a0" + ending)
                self.assertEqual(result.argument, "İris\u00a0")

    def test_rejects_command_prefixes_aliases_case_and_confusables(self):
        for token in ("APPROVE", "APPEND", "APPLICATION", "NOTHING", "KIL", "SAT",
                      "YOUTUBE", "UYGU", "app", " APP", "APP ", "ＡＰＰ", "АPP"):
            with self.subTest(token=token):
                with self.assertRaises(self.api.CommandPreviewError):
                    self.preview(token + "|youtube")

    def test_rejects_missing_delimiter_json_and_fenced_responses(self):
        for payload in ("", "APP", "youtube", '{"command":"APP","approved":true}',
                        "```APP|youtube```", "```\nAPP|youtube\n```"):
            with self.subTest(payload=payload):
                with self.assertRaises(self.api.CommandPreviewError):
                    self.preview(payload)

    def test_rejects_embedded_or_repeated_record_endings(self):
        for payload in ("APP|youtube\nKILIT|", "KILIT|\nAPPROVED|true",
                        "APP|youtube\n\n", "APP|youtube\r\n\r\n", "APP|youtube\r"):
            with self.subTest(payload=repr(payload)):
                with self.assertRaises(self.api.CommandPreviewError):
                    self.preview(payload)

    def test_rejects_controls_and_unicode_line_separators(self):
        for char in ("\0", "\t", "\x0b", "\x0c", "\x1b", "\x7f", "\x85", "\u2028", "\u2029"):
            with self.subTest(char=repr(char)):
                with self.assertRaises(self.api.CommandPreviewError):
                    self.preview("NOT|first" + char + "second")

    def test_required_arguments_cannot_be_empty_or_whitespace_only(self):
        for command in ("ARA", "APP", "YT", "NOT", "KLASOR", "YAZI", "KONUS"):
            for argument in ("", " ", "\u00a0"):
                with self.subTest(command=command, argument=repr(argument)):
                    with self.assertRaises(self.api.CommandPreviewError):
                        self.preview(command + "|" + argument)

    def test_no_argument_commands_cannot_smuggle_additional_data(self):
        for command in ("SAAT", "KILIT"):
            for argument in (" ", "true", "approved=true", "|APP|youtube"):
                with self.subTest(command=command, argument=argument):
                    with self.assertRaises(self.api.CommandPreviewError):
                        self.preview(command + "|" + argument)

    def test_exact_utf8_byte_limit_and_overflow(self):
        prefix = "NOT|"
        argument = "é" * ((self.api.MAX_COMMAND_BYTES - len(prefix)) // 2)
        payload = prefix + argument
        self.assertEqual(len(payload.encode("utf-8")), self.api.MAX_COMMAND_BYTES)
        self.assertEqual(self.preview(payload).argument, argument)
        for overflow in (payload + "a", payload + "\n", "NOT|" + "x" * self.api.MAX_COMMAND_BYTES):
            with self.assertRaises(self.api.CommandPreviewError):
                self.preview(overflow)

    def test_invalid_types_and_surrogates_have_fixed_safe_errors(self):
        for payload in (None, b"APP|youtube", 3, True, [], {"approved": True}, "NOT|\ud800"):
            with self.subTest(kind=type(payload).__name__):
                with self.assertRaises(self.api.CommandPreviewError):
                    self.preview(payload)
        private = "PRIVATE-NOTE-SENTINEL"
        with self.assertRaises(self.api.CommandPreviewError) as caught:
            self.preview("APPROVE|" + private)
        self.assertNotIn(private, str(caught.exception))
        self.assertNotIn(private, repr(caught.exception))

    def test_preview_is_immutable_and_direct_construction_is_validated(self):
        result = self.preview("APP|youtube")
        with self.assertRaises(FrozenInstanceError):
            result.argument = "terminal"
        with self.assertRaises(self.api.CommandPreviewError):
            replace(result, argument="")
        with self.assertRaises(self.api.CommandPreviewError):
            self.api.LegacyCommandPreview(command="APP", argument="youtube")
        with self.assertRaises(TypeError):
            self.api.LegacyCommandPreview(command=result.command, argument="youtube", execution_authorized=True)

    def test_preview_does_not_echo_private_arguments_by_default(self):
        private = "PRIVATE-NOTE-SENTINEL"
        result = self.preview("NOT|" + private)
        output = result.to_dict()
        self.assertNotIn(private, json.dumps(output))
        self.assertNotIn(private, repr(result))
        self.assertIs(output["argument_redacted"], True)
        self.assertIs(output["execution_authorized"], False)
        self.assertEqual(output["mode"], "preview-only")
        self.assertEqual(result.to_dict(include_argument=True)["argument"], private)

    def test_disclosure_requires_a_real_boolean(self):
        for invalid in ("false", "true", 1, None, []):
            with self.subTest(kind=type(invalid).__name__):
                with self.assertRaises(self.api.CommandPreviewError):
                    self.preview("NOT|private").to_dict(include_argument=invalid)

    def test_permission_preview_reuses_the_existing_policy_without_approval(self):
        from maria_runtime.permissions import PermissionEngine
        result = self.preview("APP|youtube")
        # The real policy is consulted. It cannot turn this preview into execution authority.
        with patch.object(PermissionEngine, "evaluate", wraps=PermissionEngine().evaluate) as evaluate:
            self.assertIs(result.requires_approval, True)
        self.assertEqual(evaluate.call_count, 1)
        self.assertIs(evaluate.call_args.kwargs.get("approved", False), False)
        self.assertNotIn("youtube", str(evaluate.call_args))
        self.assertIs(result.execution_authorized, False)

    def test_decoding_and_rendering_do_not_perform_io(self):
        with patch("builtins.open", side_effect=AssertionError("unexpected file access")), \
             patch("subprocess.Popen", side_effect=AssertionError("unexpected process")), \
             patch("os.system", side_effect=AssertionError("unexpected shell")), \
             patch("socket.socket", side_effect=AssertionError("unexpected network")), \
             patch("webbrowser.open", side_effect=AssertionError("unexpected browser")):
            for command in ("APP|youtube", "NOT|İris", "KLASOR|../private", "KILIT|", "YAZI|design"):
                self.assertIs(self.preview(command).to_dict()["execution_authorized"], False)


class CommandPreviewLauncherTests(unittest.TestCase):
    def run_launcher(self, payload: bytes, *arguments: str):
        return subprocess.run(
            [sys.executable, str(LAUNCHER), *arguments],
            input=payload, capture_output=True, timeout=10, check=False,
        )

    def test_existing_status_remains_read_only(self):
        result = self.run_launcher(b"", "--status")
        self.assertEqual(result.returncode, 0, result.stderr.decode())
        output = json.loads(result.stdout)
        self.assertIs(output["authority"]["tool_execution"], False)
        self.assertIs(output["authority"]["network_calls"], False)

    def test_cli_reads_stdin_and_redacts_arguments(self):
        result = self.run_launcher(b"APP|PRIVATE-TARGET-SENTINEL", "--preview-command")
        self.assertEqual(result.returncode, 0, result.stderr.decode())
        output = json.loads(result.stdout)
        self.assertEqual(output["command"], "APP")
        self.assertIs(output["requires_approval"], True)
        self.assertIs(output["execution_authorized"], False)
        self.assertNotIn(b"PRIVATE-TARGET-SENTINEL", result.stdout + result.stderr)

    def test_cli_discloses_argument_only_when_requested(self):
        result = self.run_launcher("NOT|İris Tasarımı\n".encode(), "--preview-command", "--show-argument")
        self.assertEqual(result.returncode, 0, result.stderr.decode())
        self.assertEqual(json.loads(result.stdout)["argument"], "İris Tasarımı")

    def test_cli_invalid_inputs_fail_without_echo_or_traceback(self):
        for payload in (b"", b"APPROVE|PRIVATE-SENTINEL", b"APP|PRIVATE-SENTINEL\nKILIT|",
                        b"NOT|\xff", b"NOT|" + b"x" * 4097):
            with self.subTest(length=len(payload)):
                result = self.run_launcher(payload, "--preview-command")
                self.assertEqual(result.returncode, 2)
                self.assertEqual(result.stdout, b"")
                output = json.loads(result.stderr)
                self.assertEqual(output["mode"], "preview-only")
                self.assertIs(output["execution_authorized"], False)
                self.assertNotIn(b"PRIVATE-SENTINEL", result.stderr)
                self.assertNotIn(b"Traceback", result.stderr)

    def test_preview_flags_cannot_silently_override_existing_actions(self):
        for args in (("--show-argument",), ("--preview-command", "--status"),
                     ("--preview-command", "--doctor"), ("--preview-command", "--context", "SEIS"),
                     ("--preview-command", "--permission", "read")):
            with self.subTest(args=args):
                result = self.run_launcher(b"APP|youtube", *args)
                self.assertEqual(result.returncode, 2)
                self.assertEqual(result.stdout, b"")


if __name__ == "__main__":
    unittest.main()
