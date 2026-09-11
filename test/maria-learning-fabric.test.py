from __future__ import annotations

from dataclasses import FrozenInstanceError, replace
import importlib.util
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))
from maria_runtime.models import ModelSpec
from maria_runtime.registry import CapabilityRegistry, ToolSpec, ToolStatus

SPEC = importlib.util.find_spec("maria_runtime.learning_fabric")
if SPEC is not None:
    from maria_runtime.learning_fabric import (
        HostSurface, LearningUse, SourceKind, ModelIdentity, LearningSource,
        LearningApproval, TrainingSupport, LearningAdmissionPolicy,
        PluginSkillBinding, SkillEvaluation, PluginSkillPolicy,
    )


class LearningFabricTests(unittest.TestCase):
    def setUp(self):
        self.assertIsNotNone(SPEC, "learning and plugin evidence policies are missing")
        self.now = 1000.0
        self.target = ModelIdentity("local-runtime", "fixture-student", "snapshot-1")
        self.source = LearningSource("example-1", "a" * 64, SourceKind.PROJECT, "owner-fixture")
        self.purpose = LearningUse.FINETUNE
        self.approval = LearningApproval(
            self.source, self.purpose, "SEIS", self.target, "review-1", 2000.0,
            rights_reviewed=True, privacy_reviewed=True, quality_reviewed=True,
        )
        self.support = TrainingSupport(
            self.target, (LearningUse.FINETUNE, LearningUse.DISTILLATION),
            "support-review-1", 2000.0, verified=True,
        )
        self.binding = PluginSkillBinding(
            "fixture-plugin", "fixture-skill", HostSurface.CODEX, "1.0.0",
            "b" * 64, "fixture-tool", "code-review", "1.0.0",
        )
        self.tool = ToolSpec(
            name="fixture-tool", capabilities=("code-review",), method_rank=1,
            reliability=1.0, latency_ms=1, cost=0.0, version="1.0.0",
            supported_projects=("SEIS",),
        )
        self.evaluation = SkillEvaluation(
            self.binding, self.target, "SEIS", 10, 10, "report-1", 2000.0,
        )

    def admit(self, **changes):
        args = dict(source=self.source, purpose=self.purpose, project="SEIS", target=self.target,
                    approval=self.approval, support=self.support, now=self.now)
        args.update(changes)
        return LearningAdmissionPolicy().assess(**args)

    def skill(self, **changes):
        args = dict(binding=self.binding, target=self.target, host=HostSurface.CODEX,
                    project="SEIS", registry=CapabilityRegistry((self.tool,)),
                    evaluation=self.evaluation, now=self.now)
        args.update(changes)
        return PluginSkillPolicy().assess(**args)

    def test_learning_denied_by_default_and_no_job_is_started(self):
        result = self.admit(approval=None)
        self.assertFalse(result.admitted)
        self.assertEqual(result.reason, "approval-required")
        self.assertFalse(result.training_started)
        admitted = self.admit()
        self.assertTrue(admitted.admitted)
        self.assertFalse(admitted.training_started)
        with self.assertRaises((FrozenInstanceError, AttributeError)):
            admitted.training_started = True

    def test_inference_availability_does_not_prove_training_support(self):
        spec = ModelSpec("fixture-student", "local-runtime", True, ("chat",), 8192,
                         1.0, 1, 0.0, 0.0, available=True)
        self.assertEqual(ModelIdentity.from_spec(spec, "snapshot-1"), self.target)
        self.assertEqual(self.admit(support=None).reason, "training-support-required")
        self.assertEqual(self.admit(support=replace(self.support, verified=False)).reason,
                         "training-support-required")

    def test_provider_and_model_revision_are_part_of_identity(self):
        for target in (replace(self.target, provider="another-provider"),
                       replace(self.target, revision="snapshot-2"),
                       replace(self.target, name="another-model")):
            with self.subTest(target=target):
                self.assertEqual(self.admit(target=target).reason, "approval-mismatch")

    def test_source_revision_origin_kind_and_project_are_approval_bound(self):
        for source in (replace(self.source, revision="c" * 64),
                       replace(self.source, origin_id="other-origin"),
                       replace(self.source, kind=SourceKind.TOOL_TRACE)):
            self.assertEqual(self.admit(source=source).reason, "approval-mismatch")
        self.assertEqual(self.admit(project="OtherProject").reason, "approval-mismatch")

    def test_rights_privacy_and_quality_are_separate_required_reviews(self):
        for field in ("rights_reviewed", "privacy_reviewed", "quality_reviewed"):
            with self.subTest(field=field):
                result = self.admit(approval=replace(self.approval, **{field: False}))
                self.assertFalse(result.admitted)
                self.assertEqual(result.reason, "review-incomplete")

    def test_revoked_and_expired_approvals_fail_closed_at_boundary(self):
        self.assertEqual(self.admit(approval=replace(self.approval, revoked=True)).reason,
                         "approval-revoked")
        self.assertEqual(self.admit(now=2000.0).reason, "approval-expired")
        self.assertTrue(self.admit(now=1999.999).admitted)

    def test_training_support_is_exact_purpose_target_and_expiry_scoped(self):
        cases = [replace(self.support, target=replace(self.target, revision="snapshot-2")),
                 replace(self.support, purposes=(LearningUse.DISTILLATION,)),
                 replace(self.support, expires_at=1000.0)]
        for support in cases:
            self.assertEqual(self.admit(support=support).reason, "training-support-required")

    def test_retrieval_permission_is_not_finetuning_permission(self):
        approval = replace(self.approval, purpose=LearningUse.KNOWLEDGE)
        result = self.admit(purpose=LearningUse.KNOWLEDGE, approval=approval, support=None)
        self.assertTrue(result.admitted)
        self.assertFalse(result.training_started)
        self.assertEqual(self.admit(approval=approval).reason, "approval-mismatch")

    def test_teacher_outputs_require_explicit_distillation_review(self):
        source = replace(self.source, kind=SourceKind.MODEL_OUTPUT)
        approval = replace(self.approval, source=source)
        self.assertEqual(self.admit(source=source, approval=approval).reason,
                         "teacher-requires-distillation")
        approval = replace(approval, purpose=LearningUse.DISTILLATION)
        self.assertTrue(self.admit(source=source, approval=approval,
                                  purpose=LearningUse.DISTILLATION).admitted)

    def test_multiple_teacher_sources_do_not_inherit_each_others_approval(self):
        for origin in ("teacher-a", "teacher-b", "teacher-c"):
            source = replace(self.source, kind=SourceKind.MODEL_OUTPUT, origin_id=origin)
            approval = replace(self.approval, source=source, purpose=LearningUse.DISTILLATION)
            self.assertTrue(self.admit(source=source, approval=approval,
                                      purpose=LearningUse.DISTILLATION).admitted)
            other = replace(source, origin_id="unreviewed-teacher")
            self.assertFalse(self.admit(source=other, approval=approval,
                                       purpose=LearningUse.DISTILLATION).admitted)

    def test_bad_types_nonfinite_times_and_wildcards_are_rejected(self):
        for value in ("true", "yes", 1):
            with self.assertRaises((ValueError, TypeError)):
                replace(self.approval, rights_reviewed=value)
        for value in (float("nan"), float("inf"), True, -1):
            with self.assertRaises((ValueError, TypeError)):
                self.admit(now=value)
            with self.assertRaises((ValueError, TypeError)):
                replace(self.support, expires_at=value)
        for revision in ("", "z" * 64, "a" * 63):
            with self.assertRaises((ValueError, TypeError)):
                replace(self.source, revision=revision)
        with self.assertRaises((ValueError, TypeError)):
            replace(self.approval, project="*")
        with self.assertRaises((ValueError, TypeError)):
            self.admit(purpose="finetune")
        with self.assertRaises((ValueError, TypeError)):
            replace(self.support, purposes=[LearningUse.FINETUNE])

    def test_registered_tool_is_not_automatically_a_verified_skill(self):
        result = self.skill(evaluation=None)
        self.assertFalse(result.verified)
        self.assertEqual(result.reason, "evaluation-required")
        self.assertFalse(result.execution_authorized)

    def test_chatgpt_codex_and_seis_evidence_are_not_interchangeable(self):
        for surface in HostSurface:
            binding = replace(self.binding, host=surface)
            evaluation = replace(self.evaluation, binding=binding)
            self.assertTrue(self.skill(binding=binding, host=surface, evaluation=evaluation).verified)
        self.assertEqual(self.skill(host=HostSurface.CHATGPT).reason, "host-mismatch")
        self.assertEqual(self.skill(host=HostSurface.SEIS).reason, "host-mismatch")

    def test_missing_disabled_degraded_or_unauthenticated_tools_are_blocked(self):
        self.assertEqual(self.skill(registry=CapabilityRegistry()).reason, "tool-unavailable")
        for status in ToolStatus:
            if status is ToolStatus.AVAILABLE:
                continue
            registry = CapabilityRegistry((replace(self.tool, status=status),))
            self.assertEqual(self.skill(registry=registry).reason, "tool-unavailable")

    def test_tool_version_capability_and_project_restrictions_are_preserved(self):
        for change, expected in (({"version": "2.0.0"}, "version-mismatch"),
                                 ({"capabilities": ("other",)}, "capability-mismatch"),
                                 ({"supported_projects": ("OtherProject",)}, "project-denied")):
            result = self.skill(registry=CapabilityRegistry((replace(self.tool, **change),)))
            self.assertEqual(result.reason, expected)

    def test_skill_evaluation_is_bound_to_model_and_exact_skill_content(self):
        changes = [replace(self.evaluation, target=replace(self.target, revision="snapshot-2")),
                   replace(self.evaluation, binding=replace(self.binding, revision="c" * 64)),
                   replace(self.evaluation, binding=replace(self.binding, host=HostSurface.CHATGPT)),
                   replace(self.evaluation, binding=replace(self.binding, version="2.0.0"))]
        for evaluation in changes:
            self.assertEqual(self.skill(evaluation=evaluation).reason, "evaluation-mismatch")

    def test_expired_and_failed_skill_evaluations_never_become_verified(self):
        self.assertEqual(self.skill(now=2000.0).reason, "evaluation-expired")
        self.assertEqual(self.skill(evaluation=replace(self.evaluation, passed_cases=9)).reason,
                         "evaluation-failed")
        result = self.skill()
        self.assertTrue(result.verified)
        self.assertFalse(result.execution_authorized)

    def test_evaluation_counts_require_real_nonempty_integer_totals(self):
        for changes in ({"total_cases": 0, "passed_cases": 0}, {"passed_cases": True},
                        {"total_cases": 2.5}, {"passed_cases": 11}, {"passed_cases": -1}):
            with self.assertRaises((ValueError, TypeError)):
                replace(self.evaluation, **changes)

    def test_sensitive_metadata_is_absent_from_reprs_and_decision_reasons(self):
        target = replace(self.target, name="PRIVATE_MODEL_FIXTURE")
        source = replace(self.source, origin_id="PRIVATE_ORIGIN_FIXTURE")
        approval = replace(self.approval, source=source, target=target, review_id="PRIVATE_REVIEW_FIXTURE")
        support = replace(self.support, target=target, review_id="PRIVATE_REVIEW_FIXTURE")
        binding = replace(self.binding, skill_id="PRIVATE_SKILL_FIXTURE")
        evaluation = replace(self.evaluation, binding=binding, target=target,
                             report_id="PRIVATE_REPORT_FIXTURE")
        for value in (target, source, approval, support, binding, evaluation,
                      self.admit(source=source, target=target), self.skill(binding=binding)):
            self.assertNotIn("PRIVATE_", repr(value))

    def test_plugin_and_tool_versions_are_independent(self):
        binding = replace(self.binding, version="plugin-2026.09")
        evaluation = replace(self.evaluation, binding=binding)
        self.assertTrue(self.skill(binding=binding, evaluation=evaluation).verified)

    def test_skill_evaluation_is_project_scoped_even_for_general_tools(self):
        registry = CapabilityRegistry((replace(self.tool, supported_projects=("*",)),))
        self.assertEqual(self.skill(project="OtherProject", registry=registry).reason,
                         "evaluation-mismatch")

    def test_planning_does_not_mutate_runtime_registry(self):
        registry = CapabilityRegistry((self.tool,))
        before = registry.all()
        self.assertTrue(self.skill(registry=registry).verified)
        self.assertEqual(registry.all(), before)
        self.assertTrue(self.admit().admitted)


if __name__ == "__main__":
    unittest.main()
