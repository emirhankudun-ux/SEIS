"""Read-only routing explanations and launcher acceptance, using fixtures only."""
from __future__ import annotations

from contextlib import redirect_stdout
from dataclasses import FrozenInstanceError
import importlib.util
import io
from itertools import permutations, product
import json
from pathlib import Path
import subprocess
import sys
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages/maria-runtime/python"))
import maria_runtime as runtime
from maria_runtime import ModelRegistry, ModelRouter, ModelSpec

LAUNCHER = ROOT / "apps/maria-desktop/maria.py"


def model(name="fixture-local", **changes):
    """Build hypothetical provider metadata without an adapter."""
    values = dict(name=name, provider="fixture-private-provider", local=True,
                  capabilities=("coding",), context_size=8192, reliability=0.5,
                  latency_ms=800, input_cost_per_million=0.0,
                  output_cost_per_million=0.0, available=True)
    values.update(changes)
    return ModelSpec(**values)


class RouteDiagnosticTests(unittest.TestCase):
    def explain(self, models, *, sensitive=True, tokens=2048, capabilities=None):
        """Require the diagnostic API before exercising real selection logic."""
        router = ModelRouter(ModelRegistry(models))
        self.assertTrue(callable(getattr(router, "explain", None)), "missing routing diagnostic API")
        return router.explain(required_capabilities={"coding"} if capabilities is None else capabilities,
                              sensitive=sensitive, estimated_context_tokens=tokens)

    def test_empty_registry_has_a_distinct_reason(self):
        """An empty registry must not be reported as a context or privacy error."""
        self.assertEqual(self.explain([]).reason.value, "no_models")

    def test_cloud_only_registry_explains_local_requirement(self):
        """Privacy rejection takes precedence over cloud quality or health."""
        result = self.explain([model(local=False)])
        self.assertEqual(result.reason.value, "no_local_models")
        self.assertIsNone(result.model)

    def test_disabled_local_model_explains_availability(self):
        """A present but unavailable record is not a missing-model report."""
        result = self.explain([model(available=False), model("cloud", local=False)])
        self.assertEqual(result.reason.value, "models_unavailable")

    def test_missing_capability_has_its_own_reason(self):
        """Available local models cannot borrow a cloud-only capability."""
        result = self.explain([model(capabilities=("vision",)), model("cloud", local=False)])
        self.assertEqual(result.reason.value, "capability_unavailable")

    def test_insufficient_context_has_its_own_reason(self):
        """Context is checked after privacy, availability and capability."""
        self.assertEqual(self.explain([model(context_size=1024)]).reason.value, "context_exceeded")

    def test_success_matches_existing_selection_identity(self):
        """Explain and select must return the same original model object."""
        local = model()
        cloud = model("cloud", local=False, reliability=1.0, latency_ms=0)
        router = ModelRouter(ModelRegistry([local, cloud]))
        for sensitive in (True, False):
            result = self.explain([local, cloud], sensitive=sensitive)
            chosen = router.select(required_capabilities={"coding"}, sensitive=sensitive,
                                   estimated_context_tokens=2048)
            self.assertEqual(result.reason.value, "selected")
            self.assertIs(result.model, chosen)

    def test_32_case_matrix_keeps_reason_and_selection_in_sync(self):
        """Every candidate combination must fail at its first closed gate."""
        for ready, capable, fits, cloud_ready, sensitive in product((False, True), repeat=5):
            local = model(available=ready, capabilities=("coding",) if capable else ("vision",),
                          context_size=8192 if fits else 1024)
            cloud = model("cloud", local=False, available=cloud_ready, reliability=1.0, latency_ms=0)
            expected = ("models_unavailable" if not ready else
                        "capability_unavailable" if not capable else
                        "context_exceeded" if not fits else "selected")
            if not sensitive and cloud_ready:
                expected = "selected"
            with self.subTest(ready=ready, capable=capable, fits=fits,
                              cloud_ready=cloud_ready, sensitive=sensitive):
                result = self.explain([local, cloud], sensitive=sensitive)
                self.assertEqual(result.reason.value, expected)
                router = ModelRouter(ModelRegistry([local, cloud]))
                args = dict(required_capabilities={"coding"}, sensitive=sensitive,
                            estimated_context_tokens=2048)
                if expected == "selected":
                    self.assertIs(router.select(**args), result.model)
                else:
                    with self.assertRaises(LookupError) as caught:
                        router.select(**args)
                    self.assertEqual(str(caught.exception),
                                     "no local model satisfies capability/context requirements" if sensitive else
                                     "no model satisfies capability/context requirements")

    def test_summary_is_versioned_identifier_free_and_non_authorizing(self):
        """Serialization excludes private model/provider/capability identifiers."""
        candidate = model("fixture-private-model", capabilities=("fixture-private-capability",))
        decision = self.explain([candidate], capabilities={"fixture-private-capability"})
        summary = decision.to_dict()
        self.assertEqual(set(summary), {"schema_version", "outcome", "reason", "message",
                                       "privacy_mode", "evidence_basis", "execution_authorized"})
        self.assertEqual(summary["schema_version"], "maria.routing-decision.v1")
        self.assertEqual(summary["outcome"], "selected")
        self.assertEqual(summary["reason"], "selected")
        self.assertEqual(summary["privacy_mode"], "local-only")
        self.assertEqual(summary["evidence_basis"], "configured-metadata-only")
        self.assertIs(summary["execution_authorized"], False)
        encoded = json.dumps(summary)
        for identifier in (candidate.name, candidate.provider, candidate.capabilities[0]):
            self.assertNotIn(identifier, encoded)
        summary["execution_authorized"] = True
        self.assertIs(decision.to_dict()["execution_authorized"], False)

    def test_blocked_summary_has_no_false_success(self):
        """Blocked output must preserve its local-only privacy boundary."""
        summary = self.explain([model(local=False)]).to_dict()
        self.assertEqual(summary["outcome"], "blocked")
        self.assertEqual(summary["reason"], "no_local_models")
        self.assertIs(summary["execution_authorized"], False)

    def test_decision_is_immutable_and_not_retrospectively_updated(self):
        """Later registry additions do not change an earlier denial."""
        registry = ModelRegistry()
        router = ModelRouter(registry)
        self.assertTrue(callable(getattr(router, "explain", None)))
        decision = router.explain(required_capabilities={"coding"}, sensitive=True,
                                  estimated_context_tokens=1)
        registry.register(model())
        self.assertEqual(decision.reason.value, "no_models")
        with self.assertRaises(FrozenInstanceError):
            decision.sensitive = False

    def test_direct_construction_rejects_contradictory_shapes(self):
        """A blocked reason cannot carry a selected model."""
        self.assertTrue(hasattr(runtime, "ModelRouteDecision"))
        self.assertTrue(hasattr(runtime, "ModelRouteReason"))
        Decision, Reason = runtime.ModelRouteDecision, runtime.ModelRouteReason
        with self.assertRaises(TypeError):
            Decision(reason="selected", sensitive=True, model=model())
        with self.assertRaises(TypeError):
            Decision(reason=Reason.NO_MODELS, sensitive="false")
        with self.assertRaises(ValueError):
            Decision(reason=Reason.SELECTED, sensitive=True)
        with self.assertRaises(ValueError):
            Decision(reason=Reason.NO_MODELS, sensitive=True, model=model())
        with self.assertRaises(ValueError):
            Decision(reason=Reason.SELECTED, sensitive=True, model=model(local=False))
        with self.assertRaises(ValueError):
            Decision(reason=Reason.SELECTED, sensitive=False, model=model(available=False))

    def test_registry_snapshot_includes_disabled_models_and_is_isolated(self):
        """Read configured records without exposing mutable registry storage."""
        registry = ModelRegistry([model("z", available=False), model("a")])
        self.assertTrue(callable(getattr(registry, "all", None)))
        snapshot = registry.all()
        self.assertEqual([m.name for m in snapshot], ["a", "z"])
        snapshot.clear()
        self.assertEqual(len(registry.all()), 2)
        self.assertEqual([m.name for m in registry.available()], ["a"])

    def test_one_snapshot_per_decision(self):
        """Do not mix two changing registry views in one evaluation."""
        class CountingRegistry(ModelRegistry):
            def all(self):
                """Count registry reads around real snapshot behavior."""
                self.calls = getattr(self, "calls", 0) + 1
                return super().all()
        registry = CountingRegistry([model()])
        router = ModelRouter(registry)
        self.assertTrue(callable(getattr(router, "explain", None)))
        router.explain(required_capabilities={"coding"}, sensitive=True, estimated_context_tokens=1)
        self.assertEqual(registry.calls, 1)
        router.select(required_capabilities={"coding"}, sensitive=True, estimated_context_tokens=1)
        self.assertEqual(registry.calls, 2)

    def test_diagnostic_order_is_deterministic(self):
        """Registration order must not change selection."""
        candidates = [model("a"), model("b"), model("c", local=False)]
        for ordering in permutations(candidates):
            decision = self.explain(ordering)
            self.assertEqual(decision.model.name, "b")
            self.assertEqual(decision.reason.value, "selected")

    def test_invalid_inputs_fail_before_reading_registry(self):
        """Explanation must retain select's strict input validation."""
        class UnreadableRegistry:
            def all(self):
                """Fail if validation permits a registry read."""
                raise AssertionError("invalid request reached metadata")
        router = ModelRouter(UnreadableRegistry())
        self.assertTrue(callable(getattr(router, "explain", None)))
        for sensitive, tokens, error in [("false", 1, TypeError), (True, False, TypeError),
                                          (True, 1.5, TypeError), (True, -1, ValueError)]:
            with self.assertRaises(error):
                router.explain(required_capabilities={"coding"}, sensitive=sensitive,
                               estimated_context_tokens=tokens)

    def test_empty_capabilities_and_zero_context_keep_privacy(self):
        """Empty task constraints never disable the local-only gate."""
        self.assertEqual(self.explain([model(local=False)], tokens=0, capabilities=set()).reason.value,
                         "no_local_models")
        self.assertEqual(self.explain([model()], tokens=0, capabilities=set()).reason.value, "selected")

    def test_diagnostics_do_not_open_network_connections(self):
        """A selected fixture remains metadata rather than actual inference."""
        with patch("socket.socket", side_effect=AssertionError("unexpected network access")):
            result = self.explain([model()])
        self.assertIs(result.to_dict()["execution_authorized"], False)


class RouteLauncherTests(unittest.TestCase):
    def run_cli(self, *args):
        """Run the real launcher with a timeout and no shell interpolation."""
        return subprocess.run([sys.executable, str(LAUNCHER), *args], cwd=ROOT,
                              text=True, capture_output=True, timeout=10)

    def test_real_cli_explains_fixture_unavailability(self):
        """Default checks truthfully label the built-in demo registry."""
        result = self.run_cli("--route-check", "coding")
        self.assertEqual(result.returncode, 3, result.stderr)
        data = json.loads(result.stdout)
        self.assertEqual(data["reason"], "models_unavailable")
        self.assertEqual(data["privacy_mode"], "local-only")
        self.assertEqual(data["registry_source"], "built-in-demo-fixture")
        self.assertIs(data["live_probe_performed"], False)
        self.assertIs(data["execution_authorized"], False)
        self.assertEqual(result.stderr, "")

    def test_cli_accepts_multiple_capabilities_and_standard_mode(self):
        """Standard routing is a metadata choice, not implicit cloud consent."""
        result = self.run_cli("--route-check", "coding", "--route-check", "reasoning",
                              "--route-privacy", "standard", "--route-context-tokens", "4096")
        self.assertEqual(result.returncode, 3, result.stderr)
        self.assertEqual(json.loads(result.stdout)["privacy_mode"], "standard")

    def test_route_specific_options_require_route_check(self):
        """An incomplete invocation must not silently fall back to status."""
        for args in [("--route-privacy", "local-only"), ("--route-context-tokens", "0")]:
            result = self.run_cli(*args)
            self.assertEqual(result.returncode, 2)
            self.assertEqual(result.stdout, "")

    def test_route_check_cannot_hide_other_requested_actions(self):
        """Conflicting actions are rejected rather than chosen by precedence."""
        for args in [("--status",), ("--doctor",), ("--context", "fixture"), ("--permission", "read")]:
            result = self.run_cli("--route-check", "coding", *args)
            self.assertEqual(result.returncode, 2)
            self.assertEqual(result.stdout, "")

    def test_cli_rejects_invalid_context_or_blank_capability(self):
        """Input errors are usage errors, not tracebacks or success output."""
        for args in [("--route-context-tokens", "-1"), ("--route-context-tokens", "1.5"),
                     ("--route-privacy", "cloud-auto")]:
            result = self.run_cli("--route-check", "coding", *args)
            self.assertEqual(result.returncode, 2)
            self.assertNotIn("Traceback", result.stderr)
        self.assertEqual(self.run_cli("--route-check", "  ").returncode, 2)

    def test_existing_doctor_and_help_remain_usable(self):
        """Preserve doctor behavior and include the new command in help."""
        result = self.run_cli("--doctor")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue(json.loads(result.stdout)["ok"])
        help_result = self.run_cli("--help")
        self.assertEqual(help_result.returncode, 0)
        self.assertIn("--route-check", help_result.stdout)

    def test_cli_success_is_non_authorizing_with_controlled_metadata(self):
        """A fixture selection returns zero but never grants execution."""
        spec = importlib.util.spec_from_file_location("maria_launcher_fixture", LAUNCHER)
        launcher = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(launcher)
        output = io.StringIO()
        with patch.object(launcher, "build_demo_models", return_value=ModelRegistry([model()])), \
             patch.object(sys, "argv", [str(LAUNCHER), "--route-check", "coding"]), \
             redirect_stdout(output):
            try:
                code = launcher.main()
            except SystemExit as error:
                self.fail(f"route-check parser not implemented: {error.code}")
        self.assertEqual(code, 0)
        data = json.loads(output.getvalue())
        self.assertEqual(data["outcome"], "selected")
        self.assertIs(data["execution_authorized"], False)
        self.assertIs(data["live_probe_performed"], False)


if __name__ == "__main__":
    unittest.main()
