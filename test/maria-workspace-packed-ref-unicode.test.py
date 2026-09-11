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
    def test_unicode_branch_survives_packed_ref_fallback(self) -> None:
        branch = "özellik/maria-doğrulama"
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "workspace"
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

            snapshot = GitWorkspaceEvidenceSource().capture(
                root,
                project=PROJECT,
                observed_at=OBSERVED,
            )

            self.assertEqual(snapshot.current_branch, branch)
            self.assertEqual(snapshot.repository_revision, REVISION)
            self.assertFalse(snapshot.execution_authorized)


if __name__ == "__main__":
    unittest.main()
