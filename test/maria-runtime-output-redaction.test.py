from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.fabric_router import RouteKind
from maria_runtime.mcp_executor import MCPInvocationEvidence, MCPInvocationResult
from maria_runtime.permissions import ActionClass
from maria_runtime.work_execution import (
    WorkPlanExecutionResult,
    WorkStepExecutionEvidence,
    WorkStepExecutionResult,
    WorkStepRunResult,
    WorkStepState,
)


class RuntimeOutputRedactionTests(unittest.TestCase):
    def test_transient_runner_result_payload_is_hidden_from_repr(self):
        secret = "TRANSIENT_MODEL_OUTPUT_SECRET"
        result = WorkStepRunResult.success({"text": secret})

        self.assertEqual(result.result, {"text": secret})
        self.assertNotIn(secret, repr(result))

    def test_completed_step_and_plan_hide_raw_result_payloads_from_repr(self):
        secret = "TRANSIENT_TOOL_OUTPUT_SECRET"
        step = WorkStepExecutionResult(
            evidence=WorkStepExecutionEvidence(
                step_id="inspect",
                route_kind=RouteKind.TOOL,
                target_name="mcp:fixture",
                state=WorkStepState.SUCCEEDED,
                attempts=1,
                depends_on=(),
            ),
            result={"raw": secret},
        )
        plan = WorkPlanExecutionResult(steps=(step,), succeeded=True)

        self.assertEqual(step.result, {"raw": secret})
        self.assertNotIn(secret, repr(step))
        self.assertNotIn(secret, repr(plan))

    def test_successful_mcp_invocation_hides_raw_tool_output_from_repr(self):
        secret = "RAW_MCP_OUTPUT_SECRET"
        invocation = MCPInvocationResult(
            success=True,
            result={"value": secret},
            evidence=MCPInvocationEvidence(
                tool_name="mcp:fixture",
                capability="fixture.echo",
                action_class=ActionClass.READ,
                permission_allowed=True,
                request_id="redaction-test",
                success=True,
                response_bytes=64,
                duration_ms=1,
            ),
        )

        self.assertEqual(invocation.result, {"value": secret})
        self.assertNotIn(secret, repr(invocation))


if __name__ == "__main__":
    unittest.main()
