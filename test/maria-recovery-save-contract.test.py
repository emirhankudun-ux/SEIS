from __future__ import annotations

from dataclasses import replace
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.fabric_router import RouteKind
from maria_runtime.work_execution import WorkPlanCheckpoint, WorkStepExecutionEvidence, WorkStepState
from maria_runtime.work_recovery import DurableWorkCheckpointStore


def completed() -> WorkPlanCheckpoint:
    step = WorkStepExecutionEvidence(
        step_id="build", route_kind=RouteKind.MODEL, target_name="fixture-model",
        state=WorkStepState.SUCCEEDED, attempts=1, depends_on=(), failure=None,
    )
    return WorkPlanCheckpoint(
        steps=(step,), complete=True, succeeded_steps=1, failed_steps=0,
        blocked_steps=0, cancelled_steps=0, next_step_id=None,
    )


class MustNotIterate:
    def __iter__(self):
        raise AssertionError("checkpoint collection consumed before shape validation")


class RecoverySaveContractTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.store = DurableWorkCheckpointStore(self.root)
        self.original = completed()
        self.path = self.store.save("SEIS", "existing", self.original)
        self.original_bytes = self.path.read_bytes()

    def assert_rejected_without_write(self, checkpoint):
        with self.assertRaises(ValueError):
            self.store.save("SEIS", "existing", checkpoint)
        self.assertEqual(self.path.read_bytes(), self.original_bytes)
        self.assertEqual(self.store.load("SEIS", "existing"), self.original)
        self.assertEqual(list(self.root.rglob("*.tmp")), [])

    def test_non_boolean_complete_flag_cannot_be_saved_as_unreadable_json(self):
        for value in (1, 1.0, "true", None):
            with self.subTest(value=value):
                self.assert_rejected_without_write(replace(self.original, complete=value))

    def test_counter_aliases_cannot_be_saved_as_unreadable_json(self):
        for field in ("succeeded_steps", "failed_steps", "blocked_steps", "cancelled_steps"):
            original = getattr(self.original, field)
            for value in (bool(original), float(original), str(original), None, -1, [], {}):
                with self.subTest(field=field, value=value):
                    self.assert_rejected_without_write(replace(self.original, **{field: value}))

    def test_step_collection_is_validated_before_length_or_iteration(self):
        for value in (None, 0, list(self.original.steps), MustNotIterate()):
            with self.subTest(value_type=type(value).__name__):
                self.assert_rejected_without_write(replace(self.original, steps=value))

    def test_route_kind_is_a_real_enum_before_serialization(self):
        for value in ("model", None, [], {}, True):
            with self.subTest(value=value):
                step = replace(self.original.steps[0], route_kind=value)
                self.assert_rejected_without_write(replace(self.original, steps=(step,)))

    def test_step_state_is_a_real_enum_not_a_string_alias(self):
        for value in ("succeeded", None, [], {}, True):
            with self.subTest(value=value):
                step = replace(self.original.steps[0], state=value)
                self.assert_rejected_without_write(replace(self.original, steps=(step,)))

    def test_dependency_collection_is_checked_before_consumption(self):
        for value in (None, 0, "", [], {}, MustNotIterate()):
            with self.subTest(value_type=type(value).__name__):
                step = replace(self.original.steps[0], depends_on=value)
                self.assert_rejected_without_write(replace(self.original, steps=(step,)))

    def test_failure_type_is_checked_before_regular_expression_matching(self):
        for value in (True, 7, [], {}, b"failure"):
            with self.subTest(value=value):
                step = replace(self.original.steps[0], failure=value)
                self.assert_rejected_without_write(replace(self.original, steps=(step,)))

    def test_valid_completed_checkpoint_still_round_trips_unchanged(self):
        self.assertEqual(self.store.load("SEIS", "existing"), self.original)
        record = self.store.load_record("SEIS", "existing")
        self.assertFalse(record.execution_authorized)
        self.assertEqual(record.schema_version, 2)

    def test_invalid_new_checkpoint_creates_no_project_directory(self):
        with self.assertRaises(ValueError):
            self.store.save("OTHER", "new", replace(self.original, complete=1))
        self.assertFalse((self.root / "OTHER").exists())


if __name__ == "__main__":
    unittest.main()
