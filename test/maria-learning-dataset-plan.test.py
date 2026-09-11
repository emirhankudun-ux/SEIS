from __future__ import annotations

from dataclasses import replace
import hashlib
import importlib.util
from pathlib import Path
import random
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.learning_fabric import (
    LearningApproval,
    LearningSource,
    LearningUse,
    ModelIdentity,
    SourceKind,
    TrainingSupport,
)

SPEC = importlib.util.find_spec("maria_runtime.learning_dataset")
if SPEC is not None:
    from maria_runtime.learning_dataset import (
        DatasetCandidate,
        DatasetPlanner,
        DatasetSplit,
    )


def digest(label: str) -> str:
    return hashlib.sha256(label.encode("utf-8")).hexdigest()


class LearningDatasetPlanTests(unittest.TestCase):
    def setUp(self) -> None:
        self.assertIsNotNone(SPEC, "learning dataset planning module is missing")
        self.now = 1_000.0
        self.project = "SEIS"
        self.target = ModelIdentity("local-runtime", "fixture-student", "snapshot-1")
        self.purpose = LearningUse.FINETUNE
        self.support = TrainingSupport(
            target=self.target,
            purposes=(LearningUse.FINETUNE, LearningUse.DISTILLATION),
            review_id="support-review-1",
            expires_at=2_000.0,
            verified=True,
        )
        self.candidates = tuple(
            self._candidate(f"source-{index}", f"origin-{index}")
            for index in range(1, 7)
        )
        self.planner = DatasetPlanner()

    def _candidate(
        self,
        source_id: str,
        origin_id: str,
        *,
        kind: SourceKind = SourceKind.PROJECT,
        purpose: LearningUse | None = None,
    ):
        source = LearningSource(
            source_id=source_id,
            revision=digest(source_id),
            kind=kind,
            origin_id=origin_id,
        )
        approval = LearningApproval(
            source=source,
            purpose=purpose or self.purpose,
            project=self.project,
            target=self.target,
            review_id=f"review-{source_id}",
            expires_at=2_000.0,
            rights_reviewed=True,
            privacy_reviewed=True,
            quality_reviewed=True,
        )
        return DatasetCandidate(source=source, approval=approval)

    def plan(self, **changes):
        args = dict(
            candidates=self.candidates,
            purpose=self.purpose,
            project=self.project,
            target=self.target,
            support=self.support,
            now=self.now,
        )
        args.update(changes)
        return self.planner.plan(**args)

    def test_training_dataset_requires_training_purpose(self):
        result = self.plan(purpose=LearningUse.KNOWLEDGE, support=None)
        self.assertFalse(result.planned)
        self.assertEqual(result.reason, "training-purpose-required")
        self.assertIsNone(result.plan)
        self.assertFalse(result.training_started)

    def test_only_admitted_sources_can_enter_plan(self):
        broken = list(self.candidates)
        broken[0] = replace(
            broken[0],
            approval=replace(broken[0].approval, privacy_reviewed=False),
        )
        result = self.plan(candidates=tuple(broken))
        self.assertFalse(result.planned)
        self.assertEqual(result.reason, "candidate-review-incomplete")
        self.assertIsNone(result.plan)

    def test_expired_revoked_or_mismatched_approval_fails_closed(self):
        cases = (
            replace(self.candidates[0].approval, expires_at=self.now),
            replace(self.candidates[0].approval, revoked=True),
            replace(self.candidates[0].approval, project="OtherProject"),
        )
        expected = (
            "candidate-approval-expired",
            "candidate-approval-revoked",
            "candidate-approval-mismatch",
        )
        for approval, reason in zip(cases, expected):
            with self.subTest(reason=reason):
                changed = (replace(self.candidates[0], approval=approval),) + self.candidates[1:]
                result = self.plan(candidates=changed)
                self.assertFalse(result.planned)
                self.assertEqual(result.reason, reason)

    def test_training_support_is_revalidated_for_exact_target_and_purpose(self):
        cases = (
            None,
            replace(self.support, verified=False),
            replace(self.support, target=replace(self.target, revision="snapshot-2")),
            replace(self.support, purposes=(LearningUse.DISTILLATION,)),
            replace(self.support, expires_at=self.now),
        )
        for support in cases:
            with self.subTest(support=support):
                result = self.plan(support=support)
                self.assertFalse(result.planned)
                self.assertEqual(result.reason, "candidate-training-support-required")

    def test_teacher_outputs_require_distillation_approval(self):
        teacher = self._candidate(
            "teacher-output",
            "teacher-origin",
            kind=SourceKind.MODEL_OUTPUT,
            purpose=LearningUse.FINETUNE,
        )
        result = self.plan(candidates=(teacher,) + self.candidates)
        self.assertFalse(result.planned)
        self.assertEqual(result.reason, "candidate-teacher-requires-distillation")

        distillation_teacher = self._candidate(
            "teacher-output",
            "teacher-origin",
            kind=SourceKind.MODEL_OUTPUT,
            purpose=LearningUse.DISTILLATION,
        )
        distillation_candidates = (distillation_teacher,) + tuple(
            replace(candidate, approval=replace(candidate.approval, purpose=LearningUse.DISTILLATION))
            for candidate in self.candidates
        )
        result = self.plan(
            candidates=distillation_candidates,
            purpose=LearningUse.DISTILLATION,
        )
        self.assertTrue(result.planned)

    def test_duplicate_content_revisions_are_rejected_to_prevent_split_leakage(self):
        duplicate_source = replace(
            self.candidates[-1].source,
            source_id="different-source-id",
            origin_id="different-origin",
            revision=self.candidates[0].source.revision,
        )
        duplicate = DatasetCandidate(
            source=duplicate_source,
            approval=replace(
                self.candidates[-1].approval,
                source=duplicate_source,
                review_id="review-duplicate",
            ),
        )
        result = self.plan(candidates=self.candidates + (duplicate,))
        self.assertFalse(result.planned)
        self.assertEqual(result.reason, "duplicate-content")

    def test_at_least_three_independent_origins_are_required_for_held_out_splits(self):
        collapsed = tuple(
            DatasetCandidate(
                source=replace(candidate.source, origin_id=f"origin-{index % 2}"),
                approval=replace(
                    candidate.approval,
                    source=replace(candidate.source, origin_id=f"origin-{index % 2}"),
                ),
            )
            for index, candidate in enumerate(self.candidates)
        )
        result = self.plan(candidates=collapsed)
        self.assertFalse(result.planned)
        self.assertEqual(result.reason, "insufficient-independent-origins")

    def test_successful_plan_has_nonempty_train_validation_and_test_splits(self):
        result = self.plan()
        self.assertTrue(result.planned)
        self.assertEqual(result.reason, "dataset-plan-ready")
        plan = result.plan
        self.assertIsNotNone(plan)
        assert plan is not None
        counts = {split: 0 for split in DatasetSplit}
        for entry in plan.entries:
            counts[entry.split] += 1
        self.assertGreater(counts[DatasetSplit.TRAIN], 0)
        self.assertGreater(counts[DatasetSplit.VALIDATION], 0)
        self.assertGreater(counts[DatasetSplit.TEST], 0)
        self.assertEqual(sum(counts.values()), len(self.candidates))
        self.assertFalse(plan.training_started)

    def test_same_origin_never_crosses_dataset_splits(self):
        grouped = self.candidates + (
            self._candidate("source-a2", "origin-1"),
            self._candidate("source-a3", "origin-1"),
            self._candidate("source-b2", "origin-2"),
        )
        result = self.plan(candidates=grouped)
        self.assertTrue(result.planned)
        assert result.plan is not None
        seen = {}
        for entry in result.plan.entries:
            prior = seen.setdefault(entry.origin_id, entry.split)
            self.assertEqual(prior, entry.split)

    def test_plan_is_deterministic_even_when_candidate_order_changes(self):
        first = self.plan()
        shuffled = list(self.candidates)
        random.Random(42).shuffle(shuffled)
        second = self.plan(candidates=tuple(shuffled))
        self.assertTrue(first.planned and second.planned)
        assert first.plan is not None and second.plan is not None
        self.assertEqual(first.plan.manifest_digest, second.plan.manifest_digest)
        self.assertEqual(first.plan.entries, second.plan.entries)

    def test_plan_is_bound_to_project_target_and_purpose(self):
        result = self.plan()
        self.assertTrue(result.planned)
        assert result.plan is not None
        self.assertEqual(result.plan.project, self.project)
        self.assertEqual(result.plan.target, self.target)
        self.assertEqual(result.plan.purpose, self.purpose)

    def test_manifest_digest_changes_when_source_set_changes(self):
        first = self.plan()
        extra = self._candidate("source-extra", "origin-extra")
        second = self.plan(candidates=self.candidates + (extra,))
        self.assertTrue(first.planned and second.planned)
        assert first.plan is not None and second.plan is not None
        self.assertNotEqual(first.plan.manifest_digest, second.plan.manifest_digest)

    def test_sensitive_source_identifiers_are_absent_from_diagnostic_repr(self):
        sensitive = self._candidate("PRIVATE_SOURCE_FIXTURE", "PRIVATE_ORIGIN_FIXTURE")
        candidates = self.candidates + (sensitive,)
        result = self.plan(candidates=candidates)
        self.assertTrue(result.planned)
        for value in (sensitive, result, result.plan, *result.plan.entries):
            text = repr(value)
            self.assertNotIn("PRIVATE_SOURCE_FIXTURE", text)
            self.assertNotIn("PRIVATE_ORIGIN_FIXTURE", text)

    def test_bad_container_and_candidate_types_are_rejected(self):
        with self.assertRaises((TypeError, ValueError)):
            self.plan(candidates=list(self.candidates))
        with self.assertRaises((TypeError, ValueError)):
            self.plan(candidates=self.candidates + ("not-a-candidate",))
        with self.assertRaises((TypeError, ValueError)):
            self.plan(purpose="finetune")


if __name__ == "__main__":
    unittest.main()
