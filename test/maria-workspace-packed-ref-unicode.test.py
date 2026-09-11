from __future__ import annotations

from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.workspace_evidence import GitWorkspaceEvidenceSource


PROJECT = "SEIS"
REVISION = "0123456789abcdef0123456789abcdef01234567"
OBSERVED = "2026-09-11T18:55:00+03:00"


class WorkspacePackedRefUnicodeTests(unittest.TestCase):
    def capture_packed(self, branch: str):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        root = Path(tmp.name) / "workspace"
        git = root / ".git"
        git.mkdir(parents=True)
        (git / "HEAD").write_text(
            f"ref: refs/heads/{branch}\n",
            encoding="utf-8",
        )
        (git / "packed-refs").write_bytes(
            (
                "# pack-refs with: peeled fully-peeled sorted \n"
                f"{REVISION} refs/heads/{branch}\n"
            ).encode("utf-8")
        )
        return GitWorkspaceEvidenceSource().capture(
            root,
            project=PROJECT,
            observed_at=OBSERVED,
        )

    def test_unicode_branch_survives_packed_ref_fallback(self) -> None:
        branch = "özellik/maria-doğrulama"
        snapshot = self.capture_packed(branch)
        self.assertEqual(snapshot.current_branch, branch)
        self.assertEqual(snapshot.repository_revision, REVISION)
        self.assertFalse(snapshot.execution_authorized)

    def test_git_valid_unicode_line_separator_is_not_a_record_boundary(self) -> None:
        # Git accepts U+2028 inside a ref name. Python str.splitlines() treats it
        # as a line boundary, so packed-ref parsing must split metadata on ASCII
        # LF/CRLF only or it silently changes a valid branch identity.
        branch = "feature/maria-\u2028-identity"
        snapshot = self.capture_packed(branch)
        self.assertEqual(snapshot.current_branch, branch)
        self.assertEqual(snapshot.repository_revision, REVISION)
        self.assertFalse(snapshot.execution_authorized)


if __name__ == "__main__":
    unittest.main()
