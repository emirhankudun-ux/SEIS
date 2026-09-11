from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.fabric_router import CapabilityRequest, RouteKind, UnifiedCapabilityRouter
from maria_runtime.models import ModelRegistry, ModelSpec
from maria_runtime.registry import CapabilityRegistry, ToolSpec, ToolStatus
from maria_runtime.work_routing import MultiStepWorkRouter, WorkStepRequest


class MultiStepWorkRouterTests(unittest.TestCase):
    def setUp(self) -> None:
        models = ModelRegistry((
            ModelSpec(
                name="cloud-code",
                provider="openai",
                local=False,
                capabilities=("coding", "reasoning"),
                context_size=128_000,
                reliability=0.99,
                latency_ms=200,
                input_cost_per_million=1.0,
                output_cost_per_million=2.0,
            ),
            ModelSpec(
                name="local-code",
                provider="qwen",
                local=True,
                capabilities=("coding", "reasoning"),
                context_size=64_000,
                reliability=0.90,
                latency_ms=400,
                input_cost_per_million=0.0,
                output_cost_per_million=0.0,
                privacy_level="local",
            ),
        ))
        tools = CapabilityRegistry((
            ToolSpec(
                name="mcp:github",
                capabilities=("repo.inspect",),
                method_rank=1,
                reliability=0.99,
                latency_ms=20,
                cost=0.0,
                status=ToolStatus.AVAILABLE,
                supported_projects=("SEIS",),
            ),
        ))
        self.router = MultiStepWorkRouter(
            UnifiedCapabilityRouter(models=models, tools=tools)
        )

    def test_composes_sensitive_cognition_then_project_scoped_execution(self):
        plan = self.router.plan((
            WorkStepRequest(
                step_id="reason",
                request=CapabilityRequest(
                    capability="coding",
                    sensitive=True,
                    estimated_context_tokens=2_000,
                    project="SEIS",
                ),
            ),
            WorkStepRequest(
                step_id="inspect",
                request=CapabilityRequest(
                    capability="repo.inspect",
                    execution_required=True,
                    project="SEIS",
                ),
                depends_on=("reason",),
            ),
        ))

        self.assertEqual(tuple(step.step_id for step in plan.steps), ("reason", "inspect"))
        self.assertEqual(plan.steps[0].route.kind, RouteKind.MODEL)
        self.assertEqual(plan.steps[0].route.target_name, "local-code")
        self.assertEqual(plan.steps[1].route.kind, RouteKind.TOOL)
        self.assertEqual(plan.steps[1].route.target_name, "mcp:github")
        self.assertTrue(plan.requires_execution)

    def test_dependency_order_is_topologically_normalized_without_execution(self):
        plan = self.router.plan((
            WorkStepRequest(
                step_id="inspect",
                request=CapabilityRequest(
                    capability="repo.inspect",
                    execution_required=True,
                    project="SEIS",
                ),
                depends_on=("reason",),
            ),
            WorkStepRequest(
                step_id="reason",
                request=CapabilityRequest(capability="reasoning"),
            ),
        ))

        self.assertEqual(tuple(step.step_id for step in plan.steps), ("reason", "inspect"))

    def test_rejects_unknown_dependency_cycle_duplicate_and_unbounded_plan(self):
        with self.assertRaises(LookupError):
            self.router.plan((
                WorkStepRequest(
                    step_id="a",
                    request=CapabilityRequest(capability="reasoning"),
                    depends_on=("missing",),
                ),
            ))

        with self.assertRaises(ValueError):
            self.router.plan((
                WorkStepRequest(
                    step_id="a",
                    request=CapabilityRequest(capability="reasoning"),
                    depends_on=("b",),
                ),
                WorkStepRequest(
                    step_id="b",
                    request=CapabilityRequest(capability="coding"),
                    depends_on=("a",),
                ),
            ))

        with self.assertRaises(ValueError):
            self.router.plan((
                WorkStepRequest(step_id="dup", request=CapabilityRequest(capability="reasoning")),
                WorkStepRequest(step_id="dup", request=CapabilityRequest(capability="coding")),
            ))

        bounded = MultiStepWorkRouter(self.router.router, max_steps=1)
        with self.assertRaises(ValueError):
            bounded.plan((
                WorkStepRequest(step_id="one", request=CapabilityRequest(capability="reasoning")),
                WorkStepRequest(step_id="two", request=CapabilityRequest(capability="coding")),
            ))

    def test_execution_never_falls_back_to_model_when_tool_is_missing(self):
        with self.assertRaises(LookupError):
            self.router.plan((
                WorkStepRequest(
                    step_id="execute",
                    request=CapabilityRequest(
                        capability="coding",
                        execution_required=True,
                        project="SEIS",
                    ),
                ),
            ))

    def test_project_scope_remains_enforced_for_execution_route(self):
        with self.assertRaises(LookupError):
            self.router.plan((
                WorkStepRequest(
                    step_id="inspect-other",
                    request=CapabilityRequest(
                        capability="repo.inspect",
                        execution_required=True,
                        project="Deadly Evil",
                    ),
                ),
            ))


if __name__ == "__main__":
    unittest.main()
