"""Offline regressions for the existing router's local privacy boundary.

Fixtures describe hypothetical models only; no inference, credentials,
network, SSH, filesystem mutation, or provider call is part of selection.
"""
from __future__ import annotations

from itertools import permutations, product
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))
from maria_runtime import ModelRegistry, ModelRouter, ModelSpec


def model(name="fixture-local", **changes):
    values = dict(name=name, provider="fixture-provider", local=True,
                  capabilities=("coding",), context_size=8192, reliability=0.5,
                  latency_ms=800, input_cost_per_million=0.0,
                  output_cost_per_million=0.0, available=True)
    values.update(changes)
    return ModelSpec(**values)


def select(models, *, sensitive=True, tokens=2048, capabilities=None):
    return ModelRouter(ModelRegistry(models)).select(
        required_capabilities={"coding"} if capabilities is None else capabilities,
        sensitive=sensitive, estimated_context_tokens=tokens,
    )


class SensitiveRoutingTests(unittest.TestCase):
    def test_sensitive_request_never_falls_back_to_cloud_only_registry(self):
        cloud = model("fixture-cloud", local=False, reliability=1.0)
        with self.assertRaises(LookupError):
            select([cloud])

    def test_insufficient_local_context_does_not_relax_privacy(self):
        small = model(context_size=1024)
        cloud = model("fixture-cloud", local=False, context_size=65536)
        with self.assertRaises(LookupError):
            select([small, cloud], tokens=2048)

    def test_missing_local_capability_does_not_relax_privacy(self):
        local = model(capabilities=("coding",))
        cloud = model("fixture-cloud", local=False, capabilities=("vision",))
        with self.assertRaises(LookupError):
            select([local, cloud], capabilities={"vision"})

    def test_unavailable_local_does_not_relax_privacy(self):
        local = model(available=False)
        cloud = model("fixture-cloud", local=False)
        with self.assertRaises(LookupError):
            select([local, cloud])

    def test_nonlocal_metadata_label_is_not_local_execution_evidence(self):
        cloud = model("fixture-cloud", local=False, privacy_level="local")
        with self.assertRaises(LookupError):
            select([cloud])

    def test_eligible_local_wins_even_when_cloud_scores_higher(self):
        local = model(reliability=0.0, latency_ms=10000,
                      input_cost_per_million=100.0, output_cost_per_million=100.0)
        cloud = model("fixture-cloud", local=False, reliability=1.0,
                      latency_ms=0, context_size=1000000)
        self.assertIs(select([local, cloud]), local)

    def test_nonsensitive_request_preserves_cloud_routing(self):
        local = model(context_size=1024)
        cloud = model("fixture-cloud", local=False, context_size=65536)
        self.assertIs(select([local, cloud], sensitive=False), cloud)

    def test_nonsensitive_scoring_remains_quality_cost_latency_based(self):
        local = model(reliability=0.0, latency_ms=10000)
        cloud = model("fixture-cloud", local=False, reliability=1.0, latency_ms=0)
        self.assertIs(select([local, cloud], sensitive=False), cloud)

    def test_context_boundary_and_zero_length_control(self):
        local = model(context_size=2048)
        self.assertIs(select([local], tokens=2048), local)
        self.assertIs(select([local], tokens=0), local)
        with self.assertRaises(LookupError):
            select([local], tokens=2049)

    def test_local_selection_is_deterministic_across_registry_order(self):
        choices = [model("fixture-a"), model("fixture-b"),
                   model("fixture-cloud", local=False, reliability=1.0)]
        for ordering in permutations(choices):
            with self.subTest(order=[m.name for m in ordering]):
                self.assertEqual(select(ordering).name, "fixture-b")

    def test_empty_registry_fails_for_both_privacy_modes(self):
        for sensitive in (False, True):
            with self.subTest(sensitive=sensitive):
                with self.assertRaises(LookupError):
                    select([], sensitive=sensitive)

    def test_sensitive_denial_does_not_disclose_registry_identifiers(self):
        cloud = model("fixture-private-name", provider="fixture-private-provider", local=False)
        try:
            select([cloud])
        except LookupError as error:
            self.assertEqual(str(error), "no local model satisfies capability/context requirements")
            self.assertNotIn(cloud.name, str(error))
            self.assertNotIn(cloud.provider, str(error))
        else:
            self.fail("sensitive request returned a cloud candidate")

    def test_empty_capability_set_does_not_bypass_local_requirement(self):
        cloud = model("fixture-cloud", local=False)
        with self.assertRaises(LookupError):
            select([cloud], capabilities=set())
        local = model()
        self.assertIs(select([local], capabilities=set()), local)

    def test_availability_capability_context_matrix_never_relaxes_privacy(self):
        for local_ready, local_capable, local_fits, cloud_ready, sensitive in product((False, True), repeat=5):
            local = model(available=local_ready,
                          capabilities=("coding",) if local_capable else ("vision",),
                          context_size=8192 if local_fits else 1024)
            cloud = model("fixture-cloud", local=False, available=cloud_ready,
                          reliability=1.0, latency_ms=0, context_size=65536)
            local_eligible = local_ready and local_capable and local_fits
            with self.subTest(local_ready=local_ready, local_capable=local_capable,
                              local_fits=local_fits, cloud_ready=cloud_ready, sensitive=sensitive):
                if sensitive and not local_eligible:
                    with self.assertRaises(LookupError):
                        select([local, cloud], sensitive=True)
                elif not local_eligible and not cloud_ready:
                    with self.assertRaises(LookupError):
                        select([local, cloud], sensitive=False)
                else:
                    chosen = select([local, cloud], sensitive=sensitive)
                    expected = local if sensitive or not cloud_ready else cloud
                    self.assertIs(chosen, expected)

    def test_selection_does_not_mutate_the_registry_or_models(self):
        local = model()
        cloud = model("fixture-cloud", local=False)
        registry = ModelRegistry([cloud, local])
        before = registry.available()
        router = ModelRouter(registry)
        router.select(required_capabilities={"coding"}, sensitive=True, estimated_context_tokens=1)
        with self.assertRaises(LookupError):
            router.select(required_capabilities={"vision"}, sensitive=True, estimated_context_tokens=1)
        self.assertEqual(registry.available(), before)
        self.assertIs(registry.get(local.name), local)


class RoutingInputTests(unittest.TestCase):
    def test_sensitive_requires_exact_boolean_before_registry_access(self):
        class UnreadableRegistry:
            def available(self):
                raise AssertionError("invalid input reached registry")
        router = ModelRouter(UnreadableRegistry())
        for value in ("false", "true", "", 0, 1, None, [], {}):
            with self.subTest(value=value):
                with self.assertRaises(TypeError):
                    router.select(required_capabilities={"coding"}, sensitive=value,
                                  estimated_context_tokens=1)

    def test_context_request_requires_exact_nonnegative_integer(self):
        for value in (True, False, 1.0, float("inf"), float("nan"), "2048", None):
            with self.subTest(value=value):
                with self.assertRaises(TypeError):
                    select([model()], tokens=value)
        with self.assertRaises(ValueError):
            select([model()], tokens=-1)

    def test_model_locality_and_availability_are_exact_booleans(self):
        for field in ("local", "available"):
            for value in ("false", "true", 0, 1, None, [], {}):
                with self.subTest(field=field, value=value):
                    with self.assertRaises(TypeError):
                        model(**{field: value})
        for local in (False, True):
            for available in (False, True):
                candidate = model(local=local, available=available)
                self.assertIs(candidate.local, local)
                self.assertIs(candidate.available, available)

    def test_model_context_capacity_is_exact_positive_integer(self):
        for value in (True, False, 2048.0, float("inf"), float("nan"), "2048", None):
            with self.subTest(value=value):
                with self.assertRaises(TypeError):
                    model(context_size=value)
        for value in (0, -1):
            with self.assertRaises(ValueError):
                model(context_size=value)
        self.assertEqual(model(context_size=1).context_size, 1)


if __name__ == "__main__":
    unittest.main()
