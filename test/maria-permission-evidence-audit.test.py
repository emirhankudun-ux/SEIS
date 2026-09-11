from __future__ import annotations

from datetime import datetime, timedelta, timezone
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime import ActionClass, PermissionEngine, ResolvedTargetEvidence


class MariaPermissionEvidenceAuditTests(unittest.TestCase):
    def test_permission_decision_retains_the_exact_target_evidence_snapshot(self):
        now = datetime(2026, 9, 11, 20, 0, tzinfo=timezone.utc)
        engine = PermissionEngine(clock=lambda: now)
        target = "github:emirhankudun-ux/SEIS#244"
        fresh = ResolvedTargetEvidence(
            target=target,
            source="github-adapter",
            observed_at=now,
            verified=True,
        )

        granted = engine.evaluate(
            ActionClass.MODIFY,
            target=target,
            approved=True,
            target_evidence=fresh,
        )
        self.assertTrue(granted.allowed)
        self.assertIs(granted.target_evidence, fresh)

        unapproved = engine.evaluate(
            ActionClass.MODIFY,
            target=target,
            approved=False,
            target_evidence=fresh,
        )
        self.assertFalse(unapproved.allowed)
        self.assertIs(unapproved.target_evidence, fresh)

        stale = ResolvedTargetEvidence(
            target=target,
            source="github-adapter",
            observed_at=now - timedelta(seconds=61),
            verified=True,
        )
        stale_denial = engine.evaluate(
            ActionClass.MODIFY,
            target=target,
            approved=True,
            target_evidence=stale,
        )
        self.assertFalse(stale_denial.allowed)
        self.assertIs(stale_denial.target_evidence, stale)

        read = engine.evaluate(
            ActionClass.READ,
            target=target,
            target_evidence=fresh,
        )
        self.assertTrue(read.allowed)
        self.assertIs(read.target_evidence, fresh)

        no_evidence = engine.evaluate(ActionClass.READ, target=target)
        self.assertIsNone(no_evidence.target_evidence)


if __name__ == "__main__":
    unittest.main()
