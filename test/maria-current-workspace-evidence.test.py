from __future__ import annotations

from pathlib import Path
import os
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.context import ContextFact, ProjectContextEngine
from maria_runtime.fabric_router import RouteKind
from maria_runtime.recovery_reconciliation import (
    RecoveryAnchor,
    RecoveryReconciler,
    RecoveryReconciliationDisposition,
)
from maria_runtime.work_execution import (
    WorkPlanCheckpoint,
    WorkStepExecutionEvidence,
    WorkStepState,
)

try:
    from maria_runtime.workspace_evidence import (
        GitWorkspaceEvidenceSource,
        WorkspaceEvidenceError,
        WorkspaceEvidenceSnapshot,
    )
except ImportError as exc:  # intentional RED until implementation exists
    raise AssertionError("current-workspace evidence module is missing") from exc


PROJECT = "SEIS"
GOAL = "SEIS-GOAL-021"
REPO = "emirhankudun-ux/SEIS"
BRANCH = "feature/maria-current-workspace-evidence-v1"
REVISION = "0123456789abcdef0123456789abcdef01234567"
OBSERVED = "2026-09-11T12:00:00Z"


def fact(key: str, value: str, observed_at: str) -> ContextFact:
    return ContextFact(
        key=key,
        value=value,
        source="fixture",
        project=PROJECT,
        confidence=1.0,
        verified=True,
        observed_at=observed_at,
    )


def cancelled_checkpoint() -> WorkPlanCheckpoint:
    step = WorkStepExecutionEvidence(
        step_id="build",
        route_kind=RouteKind.MODEL,
        target_name="fixture-model",
        state=WorkStepState.CANCELLED,
        attempts=0,
        depends_on=(),
        failure="cancel-requested",
    )
    return WorkPlanCheckpoint(
        steps=(step,),
        complete=False,
        succeeded_steps=0,
        failed_steps=0,
        blocked_steps=0,
        cancelled_steps=1,
        next_step_id="build",
    )


class CurrentWorkspaceEvidenceTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name) / "workspace"
        (self.root / ".git" / "refs" / "heads" / "feature" / "maria").mkdir(parents=True)

    def write_symbolic_head(self, *, branch: str = BRANCH, revision: str = REVISION) -> None:
        relative = branch.removeprefix("feature/")
        ref = f"refs/heads/feature/{relative}"
        (self.root / ".git" / "HEAD").write_text(f"ref: {ref}\n", encoding="utf-8")
        ref_path = self.root / ".git" / ref
        ref_path.parent.mkdir(parents=True, exist_ok=True)
        ref_path.write_text(f"{revision}\n", encoding="ascii")

    def capture(self) -> WorkspaceEvidenceSnapshot:
        return GitWorkspaceEvidenceSource().capture(
            self.root,
            project=PROJECT,
            observed_at=OBSERVED,
        )

    def test_symbolic_head_produces_only_verified_branch_and_revision_facts(self):
        self.write_symbolic_head()
        snapshot = self.capture()
        self.assertEqual(snapshot.project, PROJECT)
        self.assertEqual(snapshot.current_branch, BRANCH)
        self.assertEqual(snapshot.repository_revision, REVISION)
        self.assertEqual(snapshot.observed_at, OBSERVED)
        self.assertFalse(snapshot.execution_authorized)

        facts = snapshot.context_facts()
        self.assertEqual(tuple(item.key for item in facts), ("current_branch", "repository_revision"))
        self.assertEqual(tuple(item.value for item in facts), (BRANCH, REVISION))
        self.assertTrue(all(item.verified for item in facts))
        self.assertTrue(all(item.project == PROJECT for item in facts))
        self.assertTrue(all(item.source == "git-workspace-head" for item in facts))
        self.assertTrue(all(item.observed_at == OBSERVED for item in facts))

    def test_packed_refs_is_used_when_loose_branch_ref_is_absent(self):
        ref = f"refs/heads/{BRANCH}"
        (self.root / ".git" / "HEAD").write_text(f"ref: {ref}\n", encoding="utf-8")
        (self.root / ".git" / "packed-refs").write_text(
            f"# pack-refs with: peeled fully-peeled\n{REVISION} {ref}\n",
            encoding="ascii",
        )
        snapshot = self.capture()
        self.assertEqual(snapshot.current_branch, BRANCH)
        self.assertEqual(snapshot.repository_revision, REVISION)

    def test_detached_or_unsafe_head_never_fabricates_branch_identity(self):
        cases = (
            f"{REVISION}\n",
            "ref: refs/heads/../../outside\n",
            "ref: refs/tags/release\n",
            "ref: refs/heads/feature//broken\n",
        )
        for value in cases:
            with self.subTest(value=value.strip()):
                (self.root / ".git" / "HEAD").write_text(value, encoding="utf-8")
                with self.assertRaises(WorkspaceEvidenceError):
                    self.capture()

    @unittest.skipUnless(hasattr(os, "symlink"), "symlinks unavailable")
    def test_symlinked_git_metadata_is_rejected_without_following_aliases(self):
        outside = Path(self.tmp.name) / "outside"
        outside.mkdir()
        (outside / "HEAD").write_text(f"ref: refs/heads/{BRANCH}\n", encoding="utf-8")
        git_dir = self.root / ".git"
        for child in sorted(git_dir.rglob("*"), reverse=True):
            if child.is_file():
                child.unlink()
            elif child.is_dir():
                child.rmdir()
        git_dir.rmdir()
        os.symlink(outside, git_dir)
        with self.assertRaises(WorkspaceEvidenceError):
            self.capture()

    def test_head_and_ref_reads_are_bounded_before_parsing(self):
        (self.root / ".git" / "HEAD").write_bytes(b"x" * 4097)
        with self.assertRaises(WorkspaceEvidenceError):
            self.capture()

        self.write_symbolic_head(revision=REVISION)
        ref_path = self.root / ".git" / "refs" / "heads" / BRANCH
        ref_path.write_bytes(b"a" * 4097)
        with self.assertRaises(WorkspaceEvidenceError):
            self.capture()

    def test_stale_workspace_facts_become_evidence_required_not_drift(self):
        self.write_symbolic_head()
        snapshot = self.capture()
        context = ProjectContextEngine(
            (
                fact("active_goal", GOAL, "2026-09-11T12:09:30Z"),
                fact("current_repo", REPO, "2026-09-11T12:09:30Z"),
                *snapshot.context_facts(),
            )
        )
        anchor = RecoveryAnchor(
            project=PROJECT,
            active_goal=GOAL,
            current_repo=REPO,
            current_branch=BRANCH,
            repository_revision=REVISION,
        )
        assessment = RecoveryReconciler(
            context,
            max_evidence_age_seconds=300,
        ).reconcile(
            cancelled_checkpoint(),
            anchor,
            as_of="2026-09-11T12:10:00Z",
        )
        self.assertEqual(assessment.disposition, RecoveryReconciliationDisposition.EVIDENCE_REQUIRED)
        self.assertEqual(assessment.drift_fields, ())
        self.assertEqual(assessment.missing_context, ("current_branch", "repository_revision"))
        self.assertFalse(assessment.execution_authorized)

    def test_fresh_workspace_facts_preserve_aligned_replan_semantics(self):
        self.write_symbolic_head()
        snapshot = GitWorkspaceEvidenceSource().capture(
            self.root,
            project=PROJECT,
            observed_at="2026-09-11T12:09:30Z",
        )
        context = ProjectContextEngine(
            (
                fact("active_goal", GOAL, "2026-09-11T12:09:30Z"),
                fact("current_repo", REPO, "2026-09-11T12:09:30Z"),
                *snapshot.context_facts(),
            )
        )
        assessment = RecoveryReconciler(
            context,
            max_evidence_age_seconds=300,
        ).reconcile(
            cancelled_checkpoint(),
            RecoveryAnchor(
                project=PROJECT,
                active_goal=GOAL,
                current_repo=REPO,
                current_branch=BRANCH,
                repository_revision=REVISION,
            ),
            as_of="2026-09-11T12:10:00Z",
        )
        self.assertEqual(
            assessment.disposition,
            RecoveryReconciliationDisposition.ALIGNED_REPLAN_REQUIRED,
        )
        self.assertEqual(assessment.missing_context, ())
        self.assertFalse(assessment.execution_authorized)

    def test_future_dated_verified_fact_is_not_treated_as_fresh(self):
        context = ProjectContextEngine(
            (
                fact("active_goal", GOAL, "2026-09-11T12:09:30Z"),
                fact("current_repo", REPO, "2026-09-11T12:09:30Z"),
                fact("current_branch", BRANCH, "2026-09-11T12:11:00Z"),
                fact("repository_revision", REVISION, "2026-09-11T12:09:30Z"),
            )
        )
        assessment = RecoveryReconciler(context, max_evidence_age_seconds=300).reconcile(
            cancelled_checkpoint(),
            RecoveryAnchor(PROJECT, GOAL, REPO, BRANCH, REVISION),
            as_of="2026-09-11T12:10:00Z",
        )
        self.assertEqual(assessment.disposition, RecoveryReconciliationDisposition.EVIDENCE_REQUIRED)
        self.assertEqual(assessment.missing_context, ("current_branch",))

    def test_freshness_configuration_is_strictly_bounded(self):
        for value in (True, 0, -1, 1.5, "300"):
            with self.subTest(value=value):
                with self.assertRaises((TypeError, ValueError)):
                    RecoveryReconciler(ProjectContextEngine(), max_evidence_age_seconds=value)


if __name__ == "__main__":
    unittest.main()
