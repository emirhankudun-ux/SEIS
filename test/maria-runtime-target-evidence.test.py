from __future__ import annotations

from dataclasses import replace
from datetime import datetime, timedelta, timezone
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime import ActionClass, PermissionEngine
import maria_runtime.permissions as permissions


class MariaRuntimeTargetEvidenceTests(unittest.TestCase):
    def test_adapter_target_evidence_is_fresh_bound_and_non_authorizing(self):
        self.assertTrue(
            hasattr(permissions, "AdapterTargetEvidence"),
            "runtime must expose an adapter-owned target evidence contract",
        )
        evidence_type = permissions.AdapterTargetEvidence
        now = datetime(2026, 9, 11, 19, 30, tzinfo=timezone.utc)
        evidence = evidence_type(
            adapter_id="github-rest",
            requested_target="repo:emirhankudun-ux/SEIS",
            resolved_target="github:repository:1260112881",
            provenance="github-rest:get-repository",
            observed_at=now - timedelta(seconds=30),
        )
        engine = PermissionEngine()

        denied = engine.evaluate_resolved(
            ActionClass.MODIFY,
            evidence=evidence,
            approved=False,
            now=now,
            max_age=timedelta(minutes=5),
        )
        self.assertFalse(denied.allowed)
        self.assertTrue(denied.requires_approval)
        self.assertEqual(denied.target, evidence.resolved_target)
        self.assertEqual(denied.target_evidence, evidence)

        granted = engine.evaluate_resolved(
            ActionClass.MODIFY,
            evidence=evidence,
            approved=True,
            now=now,
            max_age=timedelta(minutes=5),
        )
        self.assertTrue(granted.allowed)
        self.assertTrue(granted.requires_approval)
        self.assertEqual(granted.target_evidence.requested_target, evidence.requested_target)
        self.assertEqual(granted.target_evidence.provenance, evidence.provenance)

        plain = engine.evaluate(ActionClass.READ, target=evidence.resolved_target)
        self.assertIsNone(plain.target_evidence)

        stale = replace(evidence, observed_at=now - timedelta(minutes=6))
        with self.assertRaisesRegex(ValueError, "stale"):
            engine.evaluate_resolved(ActionClass.READ, evidence=stale, now=now)

        future = replace(evidence, observed_at=now + timedelta(seconds=1))
        with self.assertRaisesRegex(ValueError, "future"):
            engine.evaluate_resolved(ActionClass.READ, evidence=future, now=now)

        naive = replace(evidence, observed_at=datetime(2026, 9, 11, 19, 29, 30))
        with self.assertRaisesRegex(ValueError, "timezone-aware"):
            engine.evaluate_resolved(ActionClass.READ, evidence=naive, now=now)

        for field, invalid in (
            ("adapter_id", " github-rest"),
            ("requested_target", "repo:SEIS\nmain"),
            ("resolved_target", "github:repository:1260112881 "),
            ("provenance", "github-rest:\x00get-repository"),
        ):
            with self.subTest(field=field, invalid=repr(invalid)):
                with self.assertRaises((TypeError, ValueError)):
                    engine.evaluate_resolved(
                        ActionClass.READ,
                        evidence=replace(evidence, **{field: invalid}),
                        now=now,
                    )

        with self.assertRaises(TypeError):
            engine.evaluate_resolved(ActionClass.READ, evidence="github:repository:1260112881", now=now)
        with self.assertRaises(TypeError):
            engine.evaluate_resolved(ActionClass.READ, evidence=evidence, now="2026-09-11T19:30:00Z")
        with self.assertRaises(TypeError):
            engine.evaluate_resolved(ActionClass.READ, evidence=evidence, now=now, max_age=300)
        with self.assertRaises(ValueError):
            engine.evaluate_resolved(ActionClass.READ, evidence=evidence, now=now, max_age=timedelta(0))


if __name__ == "__main__":
    unittest.main()
