from __future__ import annotations

from contextlib import redirect_stdout
import importlib.util
import io
from pathlib import Path
import subprocess
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "check-maria-swift-cancellation-mutations.py"
spec = importlib.util.spec_from_file_location("cancellation_mutations", SCRIPT)
assert spec is not None and spec.loader is not None
checker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(checker)

TARGET = "callerCancellationReachesWorkerAndWaitsForCleanup"
ISSUE = f"Test {TARGET}() recorded an issue at Fixture.swift:1:1: Expectation failed\n"
FAILED = "Test run with 1 test failed after 0.01 seconds with 1 issue.\n"


class CancellationCheckerTests(unittest.TestCase):
    def check(self, *, code: int, output: str, mutation: bool = False) -> None:
        result = subprocess.CompletedProcess([], code, stdout=output, stderr="")
        with patch.object(checker.subprocess, "run", return_value=result) as run:
            with redirect_stdout(io.StringIO()):
                checker.run_check(
                    "/fixture/swift", Path("/fixture/package"), "fixture",
                    failure_test=TARGET if mutation else None,
                )
        argv = run.call_args.args[0]
        self.assertEqual(argv[0], "/fixture/swift")
        self.assertIn("--disable-xctest", argv)
        self.assertEqual(argv[argv.index("--scratch-path") + 1], "/fixture/package/.build-fixture")
        self.assertIsInstance(argv, list)
        self.assertNotIn("shell", run.call_args.kwargs)
        self.assertEqual(run.call_args.kwargs["timeout"], 120)

    def test_baseline_requires_a_completed_nonempty_test_run(self):
        self.check(code=0, output="Test run with 15 tests in 2 suites passed after 0.1 seconds.")
        self.check(code=0, output="Test run with 15 tests passed after 0.1 seconds.")
        for output in ("Build complete!", "Test run with 0 tests passed.", "Test run with 14 tests passed."):
            with self.subTest(output=output), self.assertRaises(RuntimeError):
                self.check(code=0, output=output)

    def test_baseline_nonzero_exit_is_not_success(self):
        with self.assertRaises(RuntimeError):
            self.check(code=1, output="Test run with 15 tests passed.")

    def test_expected_completed_regression_is_detected(self):
        self.check(code=1, output=ISSUE + FAILED, mutation=True)

    def test_zero_exit_never_proves_a_killed_mutation(self):
        with self.assertRaises(RuntimeError):
            self.check(code=0, output=ISSUE + FAILED, mutation=True)

    def test_compiler_failure_or_other_test_failure_is_not_a_killed_mutation(self):
        for output in ("error: could not compile", "Test anotherTest() recorded an issue\n" + FAILED):
            with self.subTest(output=output), self.assertRaises(RuntimeError):
                self.check(code=1, output=output, mutation=True)

    def test_crashed_or_incomplete_mutation_run_cannot_pass(self):
        for code, output in ((-11, ISSUE + FAILED), (1, ISSUE)):
            with self.subTest(code=code), self.assertRaises(RuntimeError):
                self.check(code=code, output=output, mutation=True)

    def test_each_stage_uses_an_independent_build_directory(self):
        result = subprocess.CompletedProcess([], 0, stdout="Test run with 15 tests passed.", stderr="")
        with patch.object(checker.subprocess, "run", return_value=result) as run:
            with redirect_stdout(io.StringIO()):
                for label in ("baseline", "restored"):
                    checker.run_check("/fixture/swift", Path("/fixture/package"), label)
        paths = [call.args[0][call.args[0].index("--scratch-path") + 1] for call in run.call_args_list]
        self.assertEqual(paths, ["/fixture/package/.build-baseline", "/fixture/package/.build-restored"])

    def test_timeout_is_failure_not_regression_evidence(self):
        with patch.object(checker.subprocess, "run", side_effect=subprocess.TimeoutExpired("swift", 120)):
            with self.assertRaisesRegex(RuntimeError, "timed out"):
                checker.run_check("/fixture/swift", Path("/fixture/package"), "fixture", failure_test=TARGET)


if __name__ == "__main__":
    unittest.main()
