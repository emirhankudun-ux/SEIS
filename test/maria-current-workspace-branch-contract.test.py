from __future__ import annotations

from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.workspace_evidence import (
    GitWorkspaceEvidenceSource,
    WorkspaceEvidenceError,
    WorkspaceEvidenceSnapshot,
)


PROJECT = "SEIS"
REVISION = "0123456789abcdef0123456789abcdef01234567"
OBSERVED = "2026-09-11T14:00:00Z"


class CurrentWorkspaceBranchContractTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name) / "workspace"
        (self.root / ".git" / "refs" / "heads").mkdir(parents=True)

    def write_branch(self, branch: str) -> None:
        ref_name = f"refs/heads/{branch}"
        (self.root / ".git" / "HEAD").write_text(
            f"ref: {ref_name}\n",
            encoding="utf-8",
        )
        ref_path = self.root / ".git" / ref_name
        ref_path.parent.mkdir(parents=True, exist_ok=True)
        ref_path.write_text(f"{REVISION}\n", encoding="ascii")

    def ref_path(self, branch: str) -> Path:
        return self.root / ".git" / "refs" / "heads" / branch

    def capture(self):
        return GitWorkspaceEvidenceSource().capture(
            self.root,
            project=PROJECT,
            observed_at=OBSERVED,
        )

    def test_direct_snapshot_cannot_certify_branch_identity_the_source_rejects(self):
        for branch in ("../escape", "@", f"bad{chr(127)}ref"):
            with self.subTest(branch=repr(branch)):
                with self.assertRaises(WorkspaceEvidenceError):
                    WorkspaceEvidenceSnapshot(
                        project=PROJECT,
                        current_branch=branch,
                        repository_revision=REVISION,
                        observed_at=OBSERVED,
                    )

    def test_capture_rejects_single_at_refname(self):
        self.write_branch("@")
        with self.assertRaises(WorkspaceEvidenceError):
            self.capture()

    def test_capture_rejects_ascii_del_in_refname(self):
        self.write_branch(f"bad{chr(127)}ref")
        with self.assertRaises(WorkspaceEvidenceError):
            self.capture()

    def test_every_ref_component_rejects_lock_suffix(self):
        branch = "release.lock/hotfix"
        with self.assertRaises(WorkspaceEvidenceError):
            WorkspaceEvidenceSnapshot(
                project=PROJECT,
                current_branch=branch,
                repository_revision=REVISION,
                observed_at=OBSERVED,
            )

        self.write_branch(branch)
        with self.assertRaises(WorkspaceEvidenceError):
            self.capture()

    def test_valid_hierarchical_branch_remains_accepted(self):
        branch = "feature/maria-workspace-branch-identity-v1"
        self.write_branch(branch)
        snapshot = self.capture()
        self.assertEqual(snapshot.current_branch, branch)
        self.assertEqual(snapshot.repository_revision, REVISION)
        self.assertFalse(snapshot.execution_authorized)

    def test_valid_unicode_branch_remains_accepted(self):
        branch = "özellik/maria-doğrulama"
        self.write_branch(branch)
        snapshot = self.capture()
        self.assertEqual(snapshot.current_branch, branch)
        self.assertEqual(snapshot.repository_revision, REVISION)

    def test_symbolic_head_preserves_git_valid_trailing_unicode_whitespace(self):
        # Git refname rules ban ASCII space/control bytes, not non-ASCII
        # whitespace such as NBSP. HEAD line-ending removal must not normalize
        # or silently retarget this valid branch identity.
        branch = "feature/maria-unicode\u00a0"
        WorkspaceEvidenceSnapshot(
            project=PROJECT,
            current_branch=branch,
            repository_revision=REVISION,
            observed_at=OBSERVED,
        )
        self.write_branch(branch)
        snapshot = self.capture()
        self.assertEqual(snapshot.current_branch, branch)
        self.assertEqual(snapshot.repository_revision, REVISION)

    def test_loose_ref_rejects_leading_ascii_whitespace_before_revision(self):
        branch = "feature/maria-leading-space-ref"
        self.write_branch(branch)
        self.ref_path(branch).write_text(f" {REVISION}\n", encoding="ascii")
        with self.assertRaises(WorkspaceEvidenceError):
            self.capture()

    def test_loose_ref_keeps_git_accepted_trailing_ascii_whitespace_behavior(self):
        branch = "feature/maria-trailing-space-ref"
        self.write_branch(branch)
        self.ref_path(branch).write_text(f"{REVISION}   \n\n", encoding="ascii")
        snapshot = self.capture()
        self.assertEqual(snapshot.current_branch, branch)
        self.assertEqual(snapshot.repository_revision, REVISION)


if __name__ == "__main__":
    unittest.main()
