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
from maria_runtime.projects import ProjectRegistry, WorkMode, default_project_registry
from maria_runtime.continuation import ContinuationResolver


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

    def test_permission_engine_rejects_non_boolean_approval_evidence(self):
        engine = PermissionEngine()
        for approved in ("false", "true", 1, 0, None, [], {}):
            with self.subTest(approved=repr(approved)):
                with self.assertRaises(TypeError):
                    engine.evaluate(ActionClass.MODIFY, target="source", approved=approved)

        denied = engine.evaluate(ActionClass.MODIFY, target="source", approved=False)
        approved_without_target_evidence = engine.evaluate(
            ActionClass.MODIFY,
            target="source",
            approved=True,
        )
        self.assertFalse(denied.allowed)
        self.assertTrue(denied.requires_approval)
        self.assertFalse(approved_without_target_evidence.allowed)
        self.assertTrue(approved_without_target_evidence.requires_approval)

    def test_permission_engine_rejects_non_boolean_reversibility_evidence(self):
        engine = PermissionEngine()
        for reversible in ("false", "true", 1, 0, [], {}):
            with self.subTest(reversible=repr(reversible)):
                with self.assertRaises(TypeError):
                    engine.evaluate(ActionClass.MODIFY, target="source", reversible=reversible)

        unknown = engine.evaluate(ActionClass.READ, target="repo", reversible=None)
        reversible = engine.evaluate(ActionClass.READ, target="repo", reversible=True)
        irreversible = engine.evaluate(ActionClass.READ, target="repo", reversible=False)
        self.assertIsNone(unknown.reversible)
        self.assertIs(reversible.reversible, True)
        self.assertIs(irreversible.reversible, False)

    def test_permission_engine_requires_exact_unambiguous_target_identity(self):
        engine = PermissionEngine()

        for target in (None, 1, False, [], {}):
            with self.subTest(target=repr(target)):
                with self.assertRaises(TypeError):
                    engine.evaluate(ActionClass.READ, target=target)

        for target in (
            "",
            " ",
            "\t",
            "\n",
            " repo",
            "repo ",
            "repo\t",
            "repo\r",
            "repo\n",
            "repo\x00main",
            "repo\rmain",
            "repo\nmain",
        ):
            with self.subTest(target=repr(target)):
                with self.assertRaises(ValueError):
                    engine.evaluate(ActionClass.READ, target=target)

        exact = "workspace:User Documents/SEIS"
        decision = engine.evaluate(ActionClass.READ, target=exact)
        self.assertEqual(decision.target, exact)

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

    def test_default_project_registry_understands_our_real_project_names_and_modes(self):
        registry = default_project_registry()
        deadly = registry.match("Maria, Deadly Evil'e devam et")
        seis = registry.match("SEIS'e kaldığımız yerden devam et")
        eleni = registry.match("Eleni Neferi brief ekranını geliştir")
        pantechnosyni = registry.match("PANTECHNOSYNI atlasını aç")

        self.assertEqual(deadly.id, "deadly-evil")
        self.assertEqual(deadly.work_mode, WorkMode.GAME_DEV)
        self.assertIn("unreal", deadly.preferred_capabilities)
        self.assertEqual(seis.id, "seis")
        self.assertEqual(seis.work_mode, WorkMode.ENGINEERING)
        self.assertEqual(eleni.work_mode, WorkMode.CREATIVE)
        self.assertEqual(pantechnosyni.work_mode, WorkMode.RESEARCH)

    def test_continuation_resolver_builds_a_small_verified_resume_brief(self):
        registry = default_project_registry()
        context = ProjectContextEngine()
        project = "Deadly Evil"
        facts = {
            "active_goal": "DE-006 Enemy AI",
            "current_repo": "emirhankudun-ux/Deadly-Evil",
            "current_branch": "feature/enemy-ai",
            "current_application": "Unreal Engine",
            "current_blocker": "Animation Blueprint reference",
            "last_verification": "18/18 focused tests passed",
            "next_safe_action": "Inspect Animation Blueprint references before mutation",
        }
        for key, value in facts.items():
            context.put(ContextFact(
                key=key,
                value=value,
                source="verified-workspace-state",
                project=project,
                confidence=1.0,
                verified=True,
                observed_at="2026-09-11T12:00:00+00:00",
            ))

        brief = ContinuationResolver(registry, context).resolve("Maria, Deadly Evil'e devam et")
        self.assertEqual(brief.project_id, "deadly-evil")
        self.assertEqual(brief.active_goal, "DE-006 Enemy AI")
        self.assertEqual(brief.current_branch, "feature/enemy-ai")
        self.assertEqual(brief.next_safe_action, "Inspect Animation Blueprint references before mutation")
        self.assertEqual(brief.work_mode, WorkMode.GAME_DEV)
        self.assertLessEqual(len(brief.preferred_agents), 5)
        self.assertTrue(brief.ready_to_resume)


if __name__ == "__main__":
    unittest.main()
