from __future__ import annotations

from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.workspace_evidence import GitWorkspaceEvidenceSource, WorkspaceEvidenceError


PROJECT = "SEIS"
BRANCH = "feature/maria-current-workspace-evidence-v1"
REVISION_A = "0123456789abcdef0123456789abcdef01234567"
REVISION_B = "89abcdef0123456789abcdef0123456789abcdef"
OBSERVED = "2026-09-11T12:00:00Z"


class HeadSwitchingSource(GitWorkspaceEvidenceSource):
    def __init__(self, root: Path) -> None:
        self.root = root
        self.resolutions = 0

    def _resolve_ref(self, git_dir: Path, ref_name: str) -> str:
        revision = super()._resolve_ref(git_dir, ref_name)
        self.resolutions += 1
        if self.resolutions == 1:
            (self.root / ".git" / "HEAD").write_text(f"{REVISION_B}\n", encoding="ascii")
        return revision


class RefMovingSource(GitWorkspaceEvidenceSource):
    def __init__(self, ref_path: Path) -> None:
        self.ref_path = ref_path
        self.resolutions = 0

    def _resolve_ref(self, git_dir: Path, ref_name: str) -> str:
        revision = super()._resolve_ref(git_dir, ref_name)
        self.resolutions += 1
        if self.resolutions == 1:
            self.ref_path.write_text(f"{REVISION_B}\n", encoding="ascii")
        return revision


class CurrentWorkspaceEvidenceCoherenceTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name) / "workspace"
        self.ref_name = f"refs/heads/{BRANCH}"
        self.ref_path = self.root / ".git" / self.ref_name
        self.ref_path.parent.mkdir(parents=True)
        (self.root / ".git" / "HEAD").write_text(f"ref: {self.ref_name}\n", encoding="utf-8")
        self.ref_path.write_text(f"{REVISION_A}\n", encoding="ascii")

    def capture(self, source: GitWorkspaceEvidenceSource):
        return source.capture(self.root, project=PROJECT, observed_at=OBSERVED)

    def test_branch_switch_during_capture_is_rejected_instead_of_certified(self):
        with self.assertRaises(WorkspaceEvidenceError):
            self.capture(HeadSwitchingSource(self.root))

    def test_revision_move_during_capture_is_rejected_instead_of_certified(self):
        with self.assertRaises(WorkspaceEvidenceError):
            self.capture(RefMovingSource(self.ref_path))

    def test_stable_identity_remains_accepted(self):
        snapshot = self.capture(GitWorkspaceEvidenceSource())
        self.assertEqual(snapshot.current_branch, BRANCH)
        self.assertEqual(snapshot.repository_revision, REVISION_A)
        self.assertFalse(snapshot.execution_authorized)


if __name__ == "__main__":
    unittest.main()
