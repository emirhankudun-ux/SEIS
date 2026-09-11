from __future__ import annotations

import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.fabric_router import RouteKind
from maria_runtime.work_execution import (
    WorkPlanCheckpoint,
    WorkStepExecutionEvidence,
    WorkStepState,
)

try:
    from maria_runtime.work_recovery import (
        CheckpointCorruptError,
        DurableWorkCheckpointStore,
        RecoveryDisposition,
    )
except ImportError as exc:  # intentional RED until implementation exists
    raise AssertionError("durable checkpoint recovery module is missing") from exc


def evidence(
    step_id: str,
    state: WorkStepState,
    *,
    failure: str | None = None,
    depends_on: tuple[str, ...] = (),
    attempts: int | None = None,
) -> WorkStepExecutionEvidence:
    if attempts is None:
        attempts = 1 if state is not WorkStepState.CANCELLED else 0
    return WorkStepExecutionEvidence(
        step_id=step_id,
        route_kind=RouteKind.MODEL,
        target_name="fixture-model",
        state=state,
        attempts=attempts,
        depends_on=depends_on,
        failure=failure,
    )


def checkpoint(*steps: WorkStepExecutionEvidence, next_step_id: str | None = None) -> WorkPlanCheckpoint:
    succeeded = sum(step.state is WorkStepState.SUCCEEDED for step in steps)
    failed = sum(step.state is WorkStepState.FAILED for step in steps)
    blocked = sum(step.state is WorkStepState.BLOCKED for step in steps)
    cancelled = sum(step.state is WorkStepState.CANCELLED for step in steps)
    return WorkPlanCheckpoint(
        steps=tuple(steps),
        complete=cancelled == 0,
        succeeded_steps=succeeded,
        failed_steps=failed,
        blocked_steps=blocked,
        cancelled_steps=cancelled,
        next_step_id=next_step_id,
    )


class DurableCheckpointRecoveryTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.store = DurableWorkCheckpointStore(self.root)

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def test_round_trip_preserves_only_redacted_checkpoint_evidence(self):
        original = checkpoint(
            evidence("plan", WorkStepState.SUCCEEDED),
            evidence("build", WorkStepState.CANCELLED, failure="cancel-requested"),
            next_step_id="build",
        )
        self.store.save("SEIS", "work-001", original)
        loaded = self.store.load("SEIS", "work-001")
        self.assertEqual(loaded, original)

        payload = json.loads(self.store.path_for("SEIS", "work-001").read_text("utf-8"))
        serialized = json.dumps(payload, sort_keys=True).lower()
        for forbidden in ("result", "prompt", "parameters", "credential", "permission_target", "raw_output"):
            self.assertNotIn(forbidden, serialized)

    def test_save_is_atomic_and_leaves_no_temporary_checkpoint(self):
        self.store.save("SEIS", "work-001", checkpoint(evidence("plan", WorkStepState.SUCCEEDED)))
        self.assertTrue(self.store.path_for("SEIS", "work-001").is_file())
        self.assertEqual(list(self.root.rglob("*.tmp")), [])

    def test_ids_cannot_escape_store_root(self):
        cp = checkpoint(evidence("plan", WorkStepState.SUCCEEDED))
        bad_values = ("../escape", "a/b", "a\\b", "", ".", "..", "*", " white space ")
        for bad in bad_values:
            with self.subTest(bad=bad):
                with self.assertRaises(ValueError):
                    self.store.save(bad, "work-001", cp)
                with self.assertRaises(ValueError):
                    self.store.save("SEIS", bad, cp)

    def test_missing_checkpoint_returns_none_without_creating_files(self):
        self.assertIsNone(self.store.load("SEIS", "missing"))
        self.assertEqual(list(self.root.rglob("*")), [])

    def test_corrupt_json_fails_closed(self):
        path = self.store.path_for("SEIS", "work-001", create_parent=True)
        path.write_text("{not-json", "utf-8")
        with self.assertRaises(CheckpointCorruptError):
            self.store.load("SEIS", "work-001")

    def test_duplicate_json_keys_fail_closed(self):
        self.store.save("SEIS", "work-001", checkpoint(evidence("plan", WorkStepState.SUCCEEDED)))
        path = self.store.path_for("SEIS", "work-001")
        serialized = path.read_text("utf-8")
        serialized = serialized.replace(
            '"project_id":"SEIS"',
            '"project_id":"OTHER","project_id":"SEIS"',
            1,
        )
        path.write_text(serialized, "utf-8")
        with self.assertRaises(CheckpointCorruptError):
            self.store.load("SEIS", "work-001")

    def test_unknown_schema_version_fails_closed(self):
        self.store.save("SEIS", "work-001", checkpoint(evidence("plan", WorkStepState.SUCCEEDED)))
        path = self.store.path_for("SEIS", "work-001")
        payload = json.loads(path.read_text("utf-8"))
        payload["schema_version"] = 999
        path.write_text(json.dumps(payload), "utf-8")
        with self.assertRaises(CheckpointCorruptError):
            self.store.load("SEIS", "work-001")

    def test_inconsistent_checkpoint_counts_are_rejected_on_load(self):
        self.store.save("SEIS", "work-001", checkpoint(evidence("plan", WorkStepState.SUCCEEDED)))
        path = self.store.path_for("SEIS", "work-001")
        payload = json.loads(path.read_text("utf-8"))
        payload["checkpoint"]["succeeded_steps"] = 42
        path.write_text(json.dumps(payload), "utf-8")
        with self.assertRaises(CheckpointCorruptError):
            self.store.load("SEIS", "work-001")

    def test_oversized_checkpoint_is_rejected_before_json_parse(self):
        small = DurableWorkCheckpointStore(self.root, max_bytes=256)
        path = small.path_for("SEIS", "work-001", create_parent=True)
        path.write_text("{" + ("x" * 512) + "}", "utf-8")
        with self.assertRaises(CheckpointCorruptError):
            small.load("SEIS", "work-001")

    def test_non_finite_checkpoint_timestamp_fails_closed(self):
        self.store.save("SEIS", "work-001", checkpoint(evidence("plan", WorkStepState.SUCCEEDED)))
        path = self.store.path_for("SEIS", "work-001")
        payload = json.loads(path.read_text("utf-8"))
        for non_finite in (float("nan"), float("inf"), float("-inf")):
            with self.subTest(non_finite=non_finite):
                payload["saved_at"] = non_finite
                path.write_text(json.dumps(payload), "utf-8")
                with self.assertRaises(CheckpointCorruptError):
                    self.store.load("SEIS", "work-001")

    def test_load_rejects_checkpoint_symlink_instead_of_following_it(self):
        original = checkpoint(evidence("plan", WorkStepState.SUCCEEDED))
        path = self.store.save("SEIS", "work-001", original)
        serialized = path.read_bytes()
        path.unlink()

        with tempfile.TemporaryDirectory(dir=self.root.parent) as external_dir:
            external = Path(external_dir) / "work-001.json"
            external.write_bytes(serialized)
            path.symlink_to(external)
            with self.assertRaises(CheckpointCorruptError):
                self.store.load("SEIS", "work-001")

    def test_save_rejects_symlinked_project_directory(self):
        with tempfile.TemporaryDirectory(dir=self.root.parent) as external_dir:
            project_dir = self.root / "SEIS"
            project_dir.symlink_to(Path(external_dir), target_is_directory=True)
            with self.assertRaises(ValueError):
                self.store.save(
                    "SEIS",
                    "work-001",
                    checkpoint(evidence("plan", WorkStepState.SUCCEEDED)),
                )
            self.assertFalse((Path(external_dir) / "work-001.json").exists())

    def test_completed_checkpoint_is_not_a_recovery_candidate(self):
        self.store.save("SEIS", "work-001", checkpoint(evidence("plan", WorkStepState.SUCCEEDED)))
        assessment = self.store.assess("SEIS", "work-001")
        self.assertEqual(assessment.disposition, RecoveryDisposition.COMPLETE)
        self.assertFalse(assessment.replan_required)
        self.assertFalse(assessment.execution_authorized)

    def test_cancelled_checkpoint_requires_replan_and_never_authorizes_execution(self):
        cp = checkpoint(
            evidence("plan", WorkStepState.SUCCEEDED),
            evidence("build", WorkStepState.CANCELLED, failure="cancel-requested"),
            next_step_id="build",
        )
        self.store.save("SEIS", "work-001", cp)
        assessment = self.store.assess("SEIS", "work-001")
        self.assertEqual(assessment.disposition, RecoveryDisposition.REPLAN_REQUIRED)
        self.assertEqual(assessment.next_step_id, "build")
        self.assertTrue(assessment.replan_required)
        self.assertFalse(assessment.execution_authorized)

    def test_missing_checkpoint_assessment_is_explicit_and_non_executable(self):
        assessment = self.store.assess("SEIS", "missing")
        self.assertEqual(assessment.disposition, RecoveryDisposition.NOT_FOUND)
        self.assertFalse(assessment.replan_required)
        self.assertFalse(assessment.execution_authorized)

    def test_failure_categories_are_bounded_safe_identifiers(self):
        unsafe = checkpoint(
            evidence("build", WorkStepState.FAILED, failure="Bearer super-secret-value"),
        )
        with self.assertRaises(ValueError):
            self.store.save("SEIS", "work-001", unsafe)

    def test_dependencies_must_be_unique_and_reference_earlier_steps(self):
        cases = (
            checkpoint(evidence("build", WorkStepState.SUCCEEDED, depends_on=("missing",))),
            checkpoint(evidence("build", WorkStepState.SUCCEEDED, depends_on=("build",))),
            checkpoint(
                evidence("plan", WorkStepState.SUCCEEDED, depends_on=("build",)),
                evidence("build", WorkStepState.SUCCEEDED),
            ),
            checkpoint(
                evidence("plan", WorkStepState.SUCCEEDED),
                evidence("build", WorkStepState.SUCCEEDED, depends_on=("plan", "plan")),
            ),
        )
        for index, invalid in enumerate(cases):
            with self.subTest(case=index):
                with self.assertRaises(ValueError):
                    self.store.save("SEIS", f"work-deps-{index}", invalid)

    def test_step_attempts_cannot_exceed_executor_policy_limit(self):
        invalid = checkpoint(
            evidence("build", WorkStepState.SUCCEEDED, attempts=4),
        )
        with self.assertRaises(ValueError):
            self.store.save("SEIS", "work-attempts", invalid)

    def test_next_step_must_be_first_cancelled_step(self):
        invalid = checkpoint(
            evidence("plan", WorkStepState.SUCCEEDED),
            evidence("build", WorkStepState.CANCELLED, failure="cancelled"),
            evidence("verify", WorkStepState.CANCELLED, failure="cancelled"),
            next_step_id="verify",
        )
        with self.assertRaises(ValueError):
            self.store.save("SEIS", "work-next", invalid)


if __name__ == "__main__":
    unittest.main()
