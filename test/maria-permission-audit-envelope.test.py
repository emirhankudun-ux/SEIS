from __future__ import annotations

from datetime import datetime, timezone, timedelta
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime import (
    ActionClass,
    PermissionEngine,
    ResolvedTargetEvidence,
    permission_decision_audit_envelope,
)


class MariaPermissionAuditEnvelopeTests(unittest.TestCase):
    def setUp(self) -> None:
        self.now = datetime(2026, 9, 11, 23, 0, tzinfo=timezone(timedelta(hours=3)))
        self.engine = PermissionEngine(clock=lambda: self.now)
        self.target = "github:emirhankudun-ux/SEIS#246"
        self.evidence = ResolvedTargetEvidence(
            target=self.target,
            source="github-adapter:repository-resolution",
            observed_at=self.now - timedelta(seconds=5),
            verified=True,
        )

    def test_envelope_is_versioned_deterministic_and_json_serializable(self):
        decision = self.engine.evaluate(
            ActionClass.MODIFY,
            target=self.target,
            approved=True,
            reversible=False,
            target_evidence=self.evidence,
        )

        expected = {
            "schemaVersion": "maria.permission-audit.v1",
            "actionClass": "modify",
            "target": self.target,
            "allowed": True,
            "requiresApproval": True,
            "reason": "explicit approval recorded",
            "reversible": False,
            "targetEvidence": {
                "target": self.target,
                "source": "github-adapter:repository-resolution",
                "observedAt": "2026-09-11T19:59:55Z",
                "verified": True,
            },
        }

        first = permission_decision_audit_envelope(decision)
        second = permission_decision_audit_envelope(decision)
        self.assertEqual(first, expected)
        self.assertEqual(second, expected)
        self.assertIsNot(first, second)
        self.assertIsNot(first["targetEvidence"], second["targetEvidence"])
        self.assertEqual(json.loads(json.dumps(first)), expected)

        first["target"] = "mutated"
        first["targetEvidence"]["source"] = "mutated"
        self.assertEqual(permission_decision_audit_envelope(decision), expected)

    def test_denied_and_no_evidence_decisions_preserve_decision_semantics(self):
        denied = self.engine.evaluate(
            ActionClass.MODIFY,
            target=self.target,
            approved=False,
            reversible=None,
            target_evidence=self.evidence,
        )
        envelope = permission_decision_audit_envelope(denied)
        self.assertFalse(envelope["allowed"])
        self.assertTrue(envelope["requiresApproval"])
        self.assertIsNone(envelope["reversible"])
        self.assertEqual(envelope["targetEvidence"]["target"], self.target)

        read = self.engine.evaluate(ActionClass.READ, target=self.target)
        read_envelope = permission_decision_audit_envelope(read)
        self.assertTrue(read_envelope["allowed"])
        self.assertFalse(read_envelope["requiresApproval"])
        self.assertIsNone(read_envelope["targetEvidence"])

    def test_envelope_rejects_non_decision_input(self):
        with self.assertRaises(TypeError):
            permission_decision_audit_envelope({"allowed": True})

    def test_shared_schema_matches_the_runtime_envelope_contract(self):
        schema_path = ROOT / "schemas" / "maria-permission-audit-envelope-v1.schema.json"
        schema = json.loads(schema_path.read_text(encoding="utf-8"))
        self.assertEqual(schema["$schema"], "https://json-schema.org/draft/2020-12/schema")
        self.assertEqual(schema["$id"], "https://seis.dev/schemas/maria-permission-audit-envelope-v1.schema.json")
        self.assertFalse(schema["additionalProperties"])
        self.assertEqual(
            schema["required"],
            [
                "schemaVersion",
                "actionClass",
                "target",
                "allowed",
                "requiresApproval",
                "reason",
                "reversible",
                "targetEvidence",
            ],
        )
        self.assertEqual(schema["properties"]["schemaVersion"]["const"], "maria.permission-audit.v1")
        evidence_object = schema["$defs"]["targetEvidence"]
        self.assertFalse(evidence_object["additionalProperties"])
        self.assertEqual(
            evidence_object["required"],
            ["target", "source", "observedAt", "verified"],
        )
        self.assertEqual(schema["x-seis-authority"], "descriptive-only")
        self.assertEqual(schema["x-seis-persistence"], "host-classified")


if __name__ == "__main__":
    unittest.main()
