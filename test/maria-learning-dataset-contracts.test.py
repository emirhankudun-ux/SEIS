from __future__ import annotations

import hashlib
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.learning_dataset import DatasetCandidate, DatasetPlanner
from maria_runtime.learning_fabric import (
    LearningApproval,
    LearningSource,
    LearningUse,
    ModelIdentity,
    SourceKind,
)


def digest(label: str) -> str:
    return hashlib.sha256(label.encode("utf-8")).hexdigest()


class LearningDatasetContractTests(unittest.TestCase):
    def setUp(self) -> None:
        self.target = ModelIdentity("local-runtime", "fixture-student", "snapshot-1")
        source = LearningSource("fixture-source", digest("fixture-source"), SourceKind.PROJECT, "origin-1")
        approval = LearningApproval(
            source,
            LearningUse.KNOWLEDGE,
            "SEIS",
            self.target,
            "review-1",
            2_000.0,
            rights_reviewed=True,
            privacy_reviewed=True,
            quality_reviewed=True,
        )
        self.candidates = (DatasetCandidate(source, approval),)
        self.planner = DatasetPlanner()

    def test_invalid_project_is_rejected_before_nontraining_purpose_short_circuit(self):
        with self.assertRaises((TypeError, ValueError)):
            self.planner.plan(
                candidates=self.candidates,
                purpose=LearningUse.KNOWLEDGE,
                project="*",
                target=self.target,
                support=None,
                now=1_000.0,
            )

    def test_nonfinite_boolean_or_nonpositive_time_is_rejected_before_short_circuit(self):
        for now in (float("nan"), float("inf"), True, 0, -1):
            with self.subTest(now=now):
                with self.assertRaises((TypeError, ValueError)):
                    self.planner.plan(
                        candidates=self.candidates,
                        purpose=LearningUse.KNOWLEDGE,
                        project="SEIS",
                        target=self.target,
                        support=None,
                        now=now,
                    )

    def test_candidate_approval_must_be_bound_to_exact_source_at_construction(self):
        other = LearningSource("other-source", digest("other-source"), SourceKind.PROJECT, "origin-2")
        with self.assertRaises((TypeError, ValueError)):
            DatasetCandidate(other, self.candidates[0].approval)

    def test_planner_never_exposes_execution_authority(self):
        result = self.planner.plan(
            candidates=self.candidates,
            purpose=LearningUse.KNOWLEDGE,
            project="SEIS",
            target=self.target,
            support=None,
            now=1_000.0,
        )
        self.assertFalse(result.training_started)
        self.assertFalse(hasattr(result, "execute"))
        self.assertFalse(hasattr(self.planner, "train"))


if __name__ == "__main__":
    unittest.main()
