from __future__ import annotations

from pathlib import Path
import os
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
BRANCH = "feature/maria-current-workspace-evidence-v1"
REVISION = "0123456789abcdef0123456789abcdef01234567"
OBSERVED = "2026-09-11T12:00:00Z"


class CurrentWorkspaceEvidenceHardeningTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name) / "workspace"
        (self.root / ".git" / "refs" / "heads").mkdir(parents=True)

    def capture(self):
        return GitWorkspaceEvidenceSource().capture(
            self.root,
            project=PROJECT,
            observed_at=OBSERVED,
        )

    @unittest.skipUnless(hasattr(os, "symlink"), "symlinks unavailable")
    def test_intermediate_loose_ref_directory_symlink_is_rejected(self):
        outside = Path(self.tmp.name) / "outside-refs"
        outside.mkdir()
        (outside / "linked").write_text(f"{REVISION}\n", encoding="ascii")

        feature = self.root / ".git" / "refs" / "heads" / "feature"
        os.symlink(outside, feature)
        (self.root / ".git" / "HEAD").write_text(
            "ref: refs/heads/feature/linked\n",
            encoding="utf-8",
        )

        with self.assertRaises(WorkspaceEvidenceError):
            self.capture()

    @unittest.skipUnless(hasattr(os, "symlink"), "symlinks unavailable")
    def test_final_loose_ref_symlink_is_rejected(self):
        outside = Path(self.tmp.name) / "outside-ref"
        outside.write_text(f"{REVISION}\n", encoding="ascii")
        ref = self.root / ".git" / "refs" / "heads" / "linked"
        os.symlink(outside, ref)
        (self.root / ".git" / "HEAD").write_text(
            "ref: refs/heads/linked\n",
            encoding="utf-8",
        )
        with self.assertRaises(WorkspaceEvidenceError):
            self.capture()

    @unittest.skipUnless(hasattr(os, "symlink"), "symlinks unavailable")
    def test_packed_refs_symlink_is_rejected(self):
        outside = Path(self.tmp.name) / "outside-packed"
        outside.write_text(f"{REVISION} refs/heads/{BRANCH}\n", encoding="ascii")
        os.symlink(outside, self.root / ".git" / "packed-refs")
        (self.root / ".git" / "HEAD").write_text(
            f"ref: refs/heads/{BRANCH}\n",
            encoding="utf-8",
        )
        with self.assertRaises(WorkspaceEvidenceError):
            self.capture()

    def test_duplicate_packed_ref_identity_is_rejected(self):
        ref = f"refs/heads/{BRANCH}"
        (self.root / ".git" / "HEAD").write_text(f"ref: {ref}\n", encoding="utf-8")
        (self.root / ".git" / "packed-refs").write_text(
            f"{REVISION} {ref}\n{REVISION} {ref}\n",
            encoding="ascii",
        )
        with self.assertRaises(WorkspaceEvidenceError):
            self.capture()

    def test_snapshot_timestamp_errors_stay_inside_workspace_contract(self):
        for value in (None, 1, True, "not-a-time"):
            with self.subTest(value=value):
                with self.assertRaises(WorkspaceEvidenceError):
                    WorkspaceEvidenceSnapshot(
                        project=PROJECT,
                        current_branch=BRANCH,
                        repository_revision=REVISION,
                        observed_at=value,
                    )

    def test_sha256_revision_is_preserved_and_normalized(self):
        revision = "ABCDEF0123456789" * 4
        ref = f"refs/heads/{BRANCH}"
        (self.root / ".git" / "HEAD").write_text(f"ref: {ref}\n", encoding="utf-8")
        path = self.root / ".git" / ref
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(f"{revision}\n", encoding="ascii")
        snapshot = self.capture()
        self.assertEqual(snapshot.repository_revision, revision.lower())


if __name__ == "__main__":
    unittest.main()
