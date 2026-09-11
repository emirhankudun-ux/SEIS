from __future__ import annotations

import json
import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.mcp_config import MCPConfigImporter
from maria_runtime.mcp_gateway import MCPDiscoveryFact, MCPGateway, MCPMethodFact
from maria_runtime.mcp_invocation import MCPInvocationGuard
from maria_runtime.permissions import ActionClass, PermissionEngine


class MCPInvocationGuardTests(unittest.TestCase):
    def _approved_evaluation(self):
        descriptor = MCPConfigImporter().preview_json(json.dumps({
            "mcpServers": {
                "unreal": {"command": "npx", "args": ["-y", "unreal-mcp"]}
            }
        })).servers[0]
        fact = MCPDiscoveryFact(
            server_name="unreal",
            version="2.4.0",
            verified=True,
            reachable=True,
            schema_valid=True,
            provenance_verified=True,
            reliability=0.97,
            latency_ms=80,
            methods=(
                MCPMethodFact("unreal.inspect_actors", ActionClass.READ),
                MCPMethodFact("unreal.import_asset", ActionClass.MODIFY),
            ),
        )
        return MCPGateway().evaluate(descriptor, fact, approved=True)

    def test_read_method_is_ready_without_extra_owner_approval(self):
        guard = MCPInvocationGuard(PermissionEngine())
        plan = guard.plan(
            self._approved_evaluation(),
            capability="unreal.inspect_actors",
            target="Deadly Evil:actors",
        )

        self.assertTrue(plan.ready)
        self.assertTrue(plan.permission.allowed)
        self.assertFalse(plan.permission.requires_approval)
        self.assertEqual(plan.action_class, ActionClass.READ)

    def test_modify_method_requires_fresh_per_call_approval(self):
        guard = MCPInvocationGuard(PermissionEngine())
        evaluation = self._approved_evaluation()

        pending = guard.plan(
            evaluation,
            capability="unreal.import_asset",
            target="Deadly Evil:/Game/Characters",
        )
        self.assertFalse(pending.ready)
        self.assertTrue(pending.permission.requires_approval)

        approved = guard.plan(
            evaluation,
            capability="unreal.import_asset",
            target="Deadly Evil:/Game/Characters",
            approved=True,
            reversible=True,
        )
        self.assertTrue(approved.ready)
        self.assertTrue(approved.permission.allowed)
        self.assertTrue(approved.permission.requires_approval)

    def test_guard_rejects_unknown_method_even_on_enabled_server(self):
        guard = MCPInvocationGuard(PermissionEngine())
        with self.assertRaises(LookupError):
            guard.plan(
                self._approved_evaluation(),
                capability="unreal.delete_everything",
                target="Deadly Evil",
                approved=True,
            )

    def test_plan_carries_short_lived_non_reusable_lifecycle_identity(self):
        guard = MCPInvocationGuard(
            PermissionEngine(),
            clock=lambda: 42.0,
            nonce_factory=lambda: "deterministic-plan-id",
            ttl_seconds=15.0,
        )
        plan = guard.plan(
            self._approved_evaluation(),
            capability="unreal.inspect_actors",
            target="Deadly Evil:actors",
        )

        self.assertEqual(plan.plan_id, "deterministic-plan-id")
        self.assertEqual(plan.issued_at_monotonic, 42.0)
        self.assertEqual(plan.expires_at_monotonic, 57.0)

    def test_guard_rejects_unbounded_lifecycle_ttl(self):
        with self.assertRaises(ValueError):
            MCPInvocationGuard(
                PermissionEngine(),
                ttl_seconds=MCPInvocationGuard.MAX_TTL_SECONDS + 1,
            )


if __name__ == "__main__":
    unittest.main()
