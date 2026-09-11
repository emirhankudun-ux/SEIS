from __future__ import annotations

from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.work_recovery import CheckpointCorruptError, DurableWorkCheckpointStore


class EnumerationProbe:
    """A finite sentinel stream shared by old and new enumeration paths.

    Crossing the specified read budget is a test failure, not a timeout. The
    scandir shape lets the test also observe deterministic handle closure.
    """

    def __init__(self, parent: Path, suffix: str, budget: int):
        self.parent = parent
        self.suffix = suffix
        self.budget = budget
        self.visited = 0
        self.closed = False

    def values(self, *, as_paths: bool):
        for index in range(self.budget + 1):
            self.visited += 1
            if self.visited > self.budget:
                raise AssertionError("catalog enumerated beyond the detection budget")
            name = f"work-{index:04d}{self.suffix}"
            yield self.parent / name if as_paths else SimpleNamespace(name=name)

    def __enter__(self):
        return self.values(as_paths=False)

    def __exit__(self, exc_type, exc, traceback):
        self.closed = True
        return False


class RecoveryCatalogBoundsTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.parent = self.root / "SEIS"
        self.parent.mkdir()
        self.store = DurableWorkCheckpointStore(self.root)

    def probe(self, suffix: str, budget: int, expected_message: str):
        probe = EnumerationProbe(self.parent, suffix, budget)
        with patch.object(Path, "iterdir", return_value=probe.values(as_paths=True)), \
             patch("maria_runtime.work_recovery.os.scandir", return_value=probe), \
             patch.object(self.store, "assess", side_effect=AssertionError("record parsed before catalog bound")):
            with self.assertRaisesRegex(CheckpointCorruptError, expected_message):
                self.store.discover("SEIS", limit=256)
        self.assertEqual(probe.visited, budget)
        self.assertTrue(probe.closed)

    def test_json_candidate_overflow_stops_at_first_excess_entry(self):
        self.probe(".json", 257, "trusted file bound")

    def test_ignored_entry_overflow_cannot_force_unbounded_scan(self):
        self.probe(".tmp", 1025, "trusted entry bound")

    def test_real_directory_accepts_exact_ignored_entry_bound_without_mutation(self):
        for index in range(1024):
            (self.parent / f"ignored-{index:04d}.tmp").touch()
        before = sorted(path.name for path in self.parent.iterdir())
        self.assertEqual(self.store.discover("SEIS"), ())
        self.assertEqual(sorted(path.name for path in self.parent.iterdir()), before)

    def test_real_directory_rejects_excess_ignored_entries(self):
        for index in range(1025):
            (self.parent / f"ignored-{index:04d}.tmp").touch()
        with self.assertRaisesRegex(CheckpointCorruptError, "trusted entry bound"):
            self.store.discover("SEIS")
        self.assertEqual(len(list(self.parent.iterdir())), 1025)

    def test_real_candidate_overflow_is_checked_before_parsing_files(self):
        for index in range(257):
            (self.parent / f"work-{index:04d}.json").write_text("{invalid", encoding="utf-8")
        with self.assertRaisesRegex(CheckpointCorruptError, "trusted file bound"):
            self.store.discover("SEIS", limit=256)

    def test_enumeration_failure_stays_a_redacted_storage_error(self):
        marker = "synthetic-private-path"
        with patch.object(Path, "iterdir", side_effect=OSError(marker)), \
             patch("maria_runtime.work_recovery.os.scandir", side_effect=OSError(marker)):
            with self.assertRaises(CheckpointCorruptError) as error:
                self.store.discover("SEIS")
        self.assertNotIn(marker, str(error.exception))


if __name__ == "__main__":
    unittest.main()
