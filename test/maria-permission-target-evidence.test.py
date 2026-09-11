from __future__ import annotations

from datetime import datetime, timedelta, timezone
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.permissions import ActionClass, PermissionEngine


class MariaPermissionTargetEvidenceTests(unittest.TestCase):
    def test_approved_mutation_requires_fresh_verified_target_evidence(self):
        target = "github:emirhankudun-ux/SEIS#243"

        # Approval alone must not be sufficient to authorize a mutation.
        missing = PermissionEngine().evaluate(
            ActionClass.MODIFY,
            target=target,
            approved=True,
        )
        self.assertFalse(missing.allowed)
        self.assertTrue(missing.requires_approval)
        self.assertEqual(
            missing.reason,
            "approved action requires fresh verified target evidence",
        )

        from maria_runtime.permissions import ResolvedTargetEvidence

        now = datetime(2026, 9, 11, 20, 0, tzinfo=timezone.utc)
        engine = PermissionEngine(clock=lambda: now)
        valid = ResolvedTargetEvidence(
            target=target,
            source="github-adapter",
            observed_at=now,
            verified=True,
        )

        granted = engine.evaluate(
            ActionClass.MODIFY,
            target=target,
            approved=True,
            target_evidence=valid,
        )
        self.assertTrue(granted.allowed)
        self.assertTrue(granted.requires_approval)
        self.assertEqual(granted.reason, "explicit approval recorded")

        cases = {
            "mismatched-target": ResolvedTargetEvidence(
                target="github:emirhankudun-ux/SEIS#242",
                source="github-adapter",
                observed_at=now,
                verified=True,
            ),
            "stale": ResolvedTargetEvidence(
                target=target,
                source="github-adapter",
                observed_at=now - timedelta(seconds=61),
                verified=True,
            ),
            "future": ResolvedTargetEvidence(
                target=target,
                source="github-adapter",
                observed_at=now + timedelta(microseconds=1),
                verified=True,
            ),
            "unverified": ResolvedTargetEvidence(
                target=target,
                source="github-adapter",
                observed_at=now,
                verified=False,
            ),
        }
        for label, evidence in cases.items():
            with self.subTest(label=label):
                denied = engine.evaluate(
                    ActionClass.MODIFY,
                    target=target,
                    approved=True,
                    target_evidence=evidence,
                )
                self.assertFalse(denied.allowed)
                self.assertTrue(denied.requires_approval)
                self.assertEqual(
                    denied.reason,
                    "approved action requires fresh verified target evidence",
                )

    def test_target_evidence_is_typed_and_identity_strict(self):
        from maria_runtime.permissions import ResolvedTargetEvidence

        now = datetime(2026, 9, 11, 20, 0, tzinfo=timezone.utc)
        target = "workspace:User Documents/SEIS"

        for source in ("", " github-adapter", "github-adapter ", "github\nadapter"):
            with self.subTest(source=repr(source)):
                with self.assertRaises(ValueError):
                    ResolvedTargetEvidence(
                        target=target,
                        source=source,
                        observed_at=now,
                        verified=True,
                    )

        with self.assertRaises(TypeError):
            ResolvedTargetEvidence(
                target=target,
                source="github-adapter",
                observed_at=now,
                verified="true",
            )
        with self.assertRaises(TypeError):
            ResolvedTargetEvidence(
                target=target,
                source="github-adapter",
                observed_at="2026-09-11T20:00:00+00:00",
                verified=True,
            )
        with self.assertRaises(ValueError):
            ResolvedTargetEvidence(
                target=target,
                source="github-adapter",
                observed_at=datetime(2026, 9, 11, 20, 0),
                verified=True,
            )

        engine = PermissionEngine(clock=lambda: now)
        with self.assertRaises(TypeError):
            engine.evaluate(
                ActionClass.MODIFY,
                target=target,
                approved=True,
                target_evidence={"target": target},
            )

    def test_existing_denial_and_low_risk_paths_remain_compatible(self):
        target = "repo"
        denied = PermissionEngine().evaluate(
            ActionClass.MODIFY,
            target=target,
            approved=False,
        )
        self.assertFalse(denied.allowed)
        self.assertTrue(denied.requires_approval)
        self.assertEqual(
            denied.reason,
            "modify action requires explicit owner approval",
        )

        read = PermissionEngine().evaluate(ActionClass.READ, target=target)
        self.assertTrue(read.allowed)
        self.assertFalse(read.requires_approval)


if __name__ == "__main__":
    unittest.main()
