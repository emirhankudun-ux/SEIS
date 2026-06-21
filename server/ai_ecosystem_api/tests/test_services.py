from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from server.ai_ecosystem_api.services import EcosystemService
from server.ai_ecosystem_api.storage import LocalStore


class EcosystemServiceTest(unittest.TestCase):
    def setUp(self) -> None:
        self.repo_root = Path(__file__).resolve().parents[3]
        self.service = EcosystemService(self.repo_root)

    def test_health_and_overview_are_contract_backed(self) -> None:
        health = self.service.health()
        overview = self.service.overview()

        self.assertEqual(health["status"], "ready")
        self.assertEqual(overview["status"], "local-contract-backed")
        self.assertGreaterEqual(overview["counts"]["agents"], 9)
        self.assertGreaterEqual(overview["counts"]["pluginLanes"], 5)
        self.assertGreaterEqual(overview["counts"]["websites"], 4)
        self.assertIn("SEIS AI Core", overview["requiredSystems"])
        self.assertIn("Remote AI Model Connector", overview["requiredSystems"])

    def test_agents_plugins_websites_and_boundaries_are_exposed(self) -> None:
        agents = self.service.agents()["agents"]
        plugins = self.service.plugins()["pluginLanes"]
        websites = self.service.websites()["surfaces"]
        ssh = self.service.ssh()
        model_connectors = self.service.model_connectors()

        self.assertTrue(any(agent["id"] == "plugin-steward" for agent in agents))
        self.assertTrue(any(lane["id"] == "seis-cloud" for lane in plugins))
        self.assertTrue(any(surface["websiteId"] == "seis-ai-demo" for surface in websites))
        self.assertIn("dry-run", ssh["allowedModes"])
        self.assertIn("sudo-live-mutation", ssh["blockedWithoutApproval"])
        self.assertIn("local-only", model_connectors["routeModes"])

    def test_goal_and_memory_contracts_are_exposed(self) -> None:
        goals = self.service.goals()
        memory = self.service.memory()

        self.assertEqual(goals["status"], "active")
        self.assertTrue(any(track["id"] == "ssh-hardening-safety" for track in goals["tracks"]))
        self.assertIn("user-goals", memory["categories"])
        self.assertTrue(any(source["id"] == "knowledge-local-fixture-contracts" for source in memory["sources"]))

    def test_self_evolution_and_knowledge_graphs_are_exposed(self) -> None:
        self_evolution = self.service.self_evolution()
        knowledge_graphs = self.service.knowledge_graphs()
        readiness = self.service.readiness()

        self.assertEqual(self_evolution["mode"], "human-supervised-self-improvement")
        self.assertIn("Analyze", self_evolution["cycle"])
        self.assertTrue(any(engine["id"] == "self-analysis-engine" for engine in self_evolution["engines"]))
        self.assertTrue(any(engine["id"] == "plugin-evolution-engine" for engine in self_evolution["engines"]))
        self.assertTrue(any(graph["id"] == "goal-graph" for graph in knowledge_graphs["graphs"]))
        self.assertIn("local-only", knowledge_graphs["privacyModes"])
        self.assertEqual(readiness["selfEvolutionMode"], "human-supervised-self-improvement")
        self.assertGreaterEqual(readiness["selfEvolutionEngines"], 9)


class LocalStoreTest(unittest.TestCase):
    def test_sqlite_goal_and_memory_storage(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            store = LocalStore(Path(tmpdir) / "seis-ai.sqlite3")
            goal = store.upsert_goal({
                "id": "api-goal",
                "title": "Validate SEIS AI ecosystem API",
                "status": "active",
                "priority": "P1",
                "progress": 25,
                "agentId": "backend-agent",
                "pluginId": "seis-code",
            })
            event = store.record_memory_event({
                "id": "memory-api-event",
                "category": "project-decisions",
                "summary": "API keeps provider and SSH actions contract-backed.",
                "metadata": {"validation": "unit-test"},
            })

            self.assertEqual(goal["id"], "api-goal")
            self.assertEqual(event["category"], "project-decisions")
            self.assertEqual(len(store.list_goals()), 1)
            self.assertEqual(len(store.list_memory_events()), 1)


if __name__ == "__main__":
    unittest.main()
