from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.context import ContextFact, ProjectContextEngine
from maria_runtime.models import ModelRegistry, ModelSpec
from maria_runtime.permissions import ActionClass, PermissionEngine
from maria_runtime.registry import CapabilityRegistry, ToolSpec, ToolStatus
from maria_runtime.routing import ModelRouter
from maria_runtime.safety import CommandPolicy
from maria_runtime.cache import PromptCache


class MariaRuntimeV18Tests(unittest.TestCase):
    def test_capability_registry_prefers_structured_reliable_low_cost_tool(self):
        registry = CapabilityRegistry()
        registry.register(ToolSpec(
            name="vision-clicker",
            capabilities=("unreal.inspect_actors",),
            method_rank=6,
            reliability=0.70,
            latency_ms=900,
            cost=0.02,
            status=ToolStatus.AVAILABLE,
        ))
        registry.register(ToolSpec(
            name="unreal-mcp",
            capabilities=("unreal.inspect_actors",),
            method_rank=2,
            reliability=0.97,
            latency_ms=120,
            cost=0.0,
            status=ToolStatus.AVAILABLE,
        ))
        registry.register(ToolSpec(
            name="unreal-native",
            capabilities=("unreal.inspect_actors",),
            method_rank=1,
            reliability=0.99,
            latency_ms=70,
            cost=0.0,
            status=ToolStatus.DEGRADED,
        ))

        route = registry.resolve("unreal.inspect_actors")
        self.assertEqual(route.name, "unreal-mcp")
        self.assertEqual(route.status, ToolStatus.AVAILABLE)

    def test_permission_engine_requires_approval_for_mutation_external_destructive_and_financial(self):
        engine = PermissionEngine()
        self.assertFalse(engine.evaluate(ActionClass.READ, target="repo").requires_approval)
        self.assertFalse(engine.evaluate(ActionClass.SAFE_EXECUTE, target="tests").requires_approval)
        self.assertTrue(engine.evaluate(ActionClass.MODIFY, target="source").requires_approval)
        self.assertTrue(engine.evaluate(ActionClass.EXTERNAL, target="github-main").requires_approval)
        self.assertTrue(engine.evaluate(ActionClass.DESTRUCTIVE, target="asset").requires_approval)
        self.assertTrue(engine.evaluate(ActionClass.FINANCIAL, target="subscription").requires_approval)

    def test_context_engine_prefers_current_verified_evidence_over_stale_memory(self):
        context = ProjectContextEngine()
        context.put(ContextFact(
            key="active_branch",
            value="feature/old-ai",
            source="episodic-memory",
            project="Deadly Evil",
            confidence=0.80,
            verified=False,
            observed_at="2026-08-01T10:00:00+00:00",
        ))
        context.put(ContextFact(
            key="active_branch",
            value="feature/enemy-ai",
            source="git-status",
            project="Deadly Evil",
            confidence=1.0,
            verified=True,
            observed_at="2026-09-11T12:00:00+00:00",
        ))

        current = context.get("active_branch", project="Deadly Evil")
        self.assertIsNotNone(current)
        self.assertEqual(current.value, "feature/enemy-ai")
        self.assertTrue(current.verified)

    def test_model_router_prefers_local_for_sensitive_work_when_capable(self):
        registry = ModelRegistry()
        registry.register(ModelSpec(
            name="qwen-local",
            provider="ollama",
            local=True,
            capabilities=("coding", "reasoning"),
            context_size=32768,
            reliability=0.82,
            latency_ms=500,
            input_cost_per_million=0.0,
            output_cost_per_million=0.0,
            available=True,
        ))
        registry.register(ModelSpec(
            name="cloud-strong",
            provider="cloud",
            local=False,
            capabilities=("coding", "reasoning", "vision"),
            context_size=200000,
            reliability=0.98,
            latency_ms=700,
            input_cost_per_million=2.0,
            output_cost_per_million=8.0,
            available=True,
        ))
        router = ModelRouter(registry)

        selected = router.select(
            required_capabilities={"coding"},
            sensitive=True,
            estimated_context_tokens=8000,
        )
        self.assertEqual(selected.name, "qwen-local")

    def test_model_router_uses_cloud_when_required_capability_is_missing_locally(self):
        registry = ModelRegistry()
        registry.register(ModelSpec(
            name="qwen-local",
            provider="ollama",
            local=True,
            capabilities=("coding",),
            context_size=32768,
            reliability=0.82,
            latency_ms=500,
            input_cost_per_million=0.0,
            output_cost_per_million=0.0,
            available=True,
        ))
        registry.register(ModelSpec(
            name="cloud-vision",
            provider="cloud",
            local=False,
            capabilities=("vision", "reasoning"),
            context_size=200000,
            reliability=0.98,
            latency_ms=700,
            input_cost_per_million=2.0,
            output_cost_per_million=8.0,
            available=True,
        ))
        router = ModelRouter(registry)

        selected = router.select(
            required_capabilities={"vision"},
            sensitive=False,
            estimated_context_tokens=4000,
        )
        self.assertEqual(selected.name, "cloud-vision")

    def test_prompt_cache_hashes_full_request_not_only_first_messages(self):
        cache = PromptCache(max_size=4)
        a = [{"role": "system", "content": "same"}, {"role": "user", "content": "same"}, {"role": "user", "content": "A"}]
        b = [{"role": "system", "content": "same"}, {"role": "user", "content": "same"}, {"role": "user", "content": "B"}]
        cache.put(a, {"answer": "A"}, model="m1", temperature=0.2)
        self.assertEqual(cache.get(a, model="m1", temperature=0.2), {"answer": "A"})
        self.assertIsNone(cache.get(b, model="m1", temperature=0.2))
        self.assertIsNone(cache.get(a, model="m2", temperature=0.2))

    def test_command_policy_uses_argv_and_blocks_shell_syntax_and_destructive_commands(self):
        policy = CommandPolicy()
        self.assertEqual(policy.prepare("git status --short"), ["git", "status", "--short"])
        for command in [
            "git status && rm -rf ~",
            "cat file | sh",
            "sudo rm -rf /tmp/x",
            "echo hi > /tmp/x",
            "reboot",
        ]:
            with self.assertRaises(ValueError):
                policy.prepare(command)


if __name__ == "__main__":
    unittest.main()
