from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.context import ContextFact, ProjectContextEngine
from maria_runtime.continuation import ContinuationResolver
from maria_runtime.projects import default_project_registry


class MariaContextualContinuationTests(unittest.TestCase):
    def _required_facts(self):
        return (
            ContextFact(
                key="active_goal",
                value="Improve SEIS local AI routing",
                source="goal-tracker",
                project="SEIS",
                confidence=1.0,
                verified=True,
                observed_at="2026-09-11T08:00:00Z",
            ),
            ContextFact(
                key="current_repo",
                value="emirhankudun-ux/SEIS",
                source="github",
                project="SEIS",
                confidence=1.0,
                verified=True,
                observed_at="2026-09-11T08:00:00Z",
            ),
            ContextFact(
                key="current_branch",
                value="feature/maria-contextual-continuation-v1",
                source="github",
                project="SEIS",
                confidence=1.0,
                verified=True,
                observed_at="2026-09-11T08:00:00Z",
            ),
            ContextFact(
                key="next_safe_action",
                value="Continue verified local model routing work",
                source="goal-tracker",
                project="SEIS",
                confidence=1.0,
                verified=True,
                observed_at="2026-09-11T08:00:00Z",
            ),
        )

    def test_continuation_includes_verified_related_context_without_repeating_core_fields(self):
        engine = ProjectContextEngine(
            self._required_facts()
            + (
                ContextFact(
                    key="routing-note",
                    value="Qwen local coding routes use the Ollama-compatible fallback path",
                    source="architecture-review",
                    project="SEIS",
                    confidence=0.96,
                    verified=True,
                    observed_at="2026-09-11T08:05:00Z",
                    fact_type="architecture-decision",
                ),
            )
        )
        resolver = ContinuationResolver(default_project_registry(), engine)

        brief = resolver.resolve("SEIS Qwen routing tarafına devam")

        self.assertTrue(brief.ready_to_resume)
        self.assertEqual(len(brief.related_context), 1)
        self.assertEqual(brief.related_context[0].key, "routing-note")
        self.assertEqual(brief.related_context[0].source, "architecture-review")
        self.assertTrue(brief.related_context[0].verified)
        serialized = brief.to_dict()
        self.assertEqual(serialized["related_context"][0]["key"], "routing-note")
        self.assertNotIn("active_goal", {item["key"] for item in serialized["related_context"]})

    def test_continuation_related_context_uses_current_verified_fact_only(self):
        engine = ProjectContextEngine(
            self._required_facts()
            + (
                ContextFact(
                    key="provider-note",
                    value="Qwen obsolete cloud-only routing decision",
                    source="old-review",
                    project="SEIS",
                    confidence=0.99,
                    verified=True,
                    observed_at="2026-09-11T07:00:00Z",
                    fact_type="architecture-decision",
                ),
                ContextFact(
                    key="provider-note",
                    value="Qwen current local routing decision",
                    source="current-review",
                    project="SEIS",
                    confidence=0.99,
                    verified=True,
                    observed_at="2026-09-11T08:10:00Z",
                    fact_type="architecture-decision",
                ),
                ContextFact(
                    key="experimental-note",
                    value="Qwen unverified experimental provider shortcut",
                    source="scratchpad",
                    project="SEIS",
                    confidence=0.90,
                    verified=False,
                    observed_at="2026-09-11T08:11:00Z",
                ),
            )
        )
        resolver = ContinuationResolver(default_project_registry(), engine)

        brief = resolver.resolve("SEIS Qwen provider routing devam")
        related = brief.to_dict()["related_context"]

        self.assertEqual([item["key"] for item in related], ["provider-note"])
        self.assertIn("current local routing", related[0]["value"])
        self.assertNotIn("obsolete", related[0]["value"])
        self.assertNotIn("experimental-note", {item["key"] for item in related})

    def test_related_context_can_be_disabled_for_minimal_briefs(self):
        engine = ProjectContextEngine(
            self._required_facts()
            + (
                ContextFact(
                    key="routing-note",
                    value="Qwen local routing detail",
                    source="architecture-review",
                    project="SEIS",
                    confidence=0.96,
                    verified=True,
                    observed_at="2026-09-11T08:05:00Z",
                ),
            )
        )
        resolver = ContinuationResolver(
            default_project_registry(),
            engine,
            related_context_limit=0,
        )

        brief = resolver.resolve("SEIS Qwen routing devam")

        self.assertEqual(brief.related_context, ())


if __name__ == "__main__":
    unittest.main()
