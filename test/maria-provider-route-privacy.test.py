"""Offline provider-route privacy regressions for MARIA routing.

The fixtures are descriptive only. They never call a provider, read credentials,
open a network connection, authorize execution, or claim endpoint provenance.
"""
from __future__ import annotations

from dataclasses import FrozenInstanceError
from pathlib import Path
import json
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime import (
    ModelRegistry,
    ModelRouter,
    ModelSpec,
    ProviderPrivacyPolicy,
    ProviderRetention,
    ProviderRouteManifest,
    ProviderRoutePrivacyReason,
    ProviderTrainingUse,
    evaluate_provider_route_privacy,
)


def model(name="fixture-model", provider="fixture-gateway", *, local=False):
    return ModelSpec(
        name=name,
        provider=provider,
        local=local,
        capabilities=("coding",),
        context_size=8192,
        reliability=0.9,
        latency_ms=250,
        input_cost_per_million=1.0,
        output_cost_per_million=2.0,
        available=True,
    )


def selected(candidate=None, *, sensitive=False):
    candidate = candidate or model()
    return ModelRouter(ModelRegistry([candidate])).explain(
        required_capabilities={"coding"},
        sensitive=sensitive,
        estimated_context_tokens=1024,
    )


def policy(**changes):
    values = dict(
        allowed_processors=("fixture-gateway", "fixture-processor"),
        allowed_regions=("eu",),
        maximum_retention=ProviderRetention.TRANSIENT,
        allow_training=False,
        require_zero_data_retention=True,
        allow_fallback=False,
    )
    values.update(changes)
    return ProviderPrivacyPolicy(**values)


def manifest(**changes):
    values = dict(
        requested_provider="fixture-gateway",
        requested_model="fixture-model",
        resolved_provider="fixture-processor",
        resolved_model="fixture-model",
        processor_chain=("fixture-gateway", "fixture-processor"),
        region="eu",
        retention=ProviderRetention.TRANSIENT,
        training_use=ProviderTrainingUse.DENIED,
        zero_data_retention=True,
        fallback_used=False,
        local=False,
        policy_revision="fixture-policy-v1",
    )
    values.update(changes)
    return ProviderRouteManifest(**values)


class ProviderRoutePrivacyTests(unittest.TestCase):
    def test_compliant_remote_route_is_privacy_eligible_but_never_execution_authorized(self):
        decision = evaluate_provider_route_privacy(selected(), manifest(), policy())
        self.assertIs(decision.reason, ProviderRoutePrivacyReason.ELIGIBLE)
        self.assertIs(decision.privacy_eligible, True)
        self.assertIs(decision.execution_authorized, False)
        self.assertEqual(decision.to_dict()["outcome"], "eligible")
        self.assertIs(decision.to_dict()["execution_authorized"], False)

    def test_blocked_router_decision_cannot_be_upgraded_by_a_manifest(self):
        route = ModelRouter(ModelRegistry([])).explain(
            required_capabilities={"coding"}, sensitive=False, estimated_context_tokens=1
        )
        decision = evaluate_provider_route_privacy(route, manifest(), policy())
        self.assertIs(decision.reason, ProviderRoutePrivacyReason.ROUTE_NOT_SELECTED)
        self.assertIs(decision.privacy_eligible, False)

    def test_manifest_must_bind_the_selected_requested_identity(self):
        for changes in (
            {"requested_provider": "other-gateway"},
            {"requested_model": "other-model"},
            {"resolved_model": "other-model"},
        ):
            with self.subTest(changes=changes):
                decision = evaluate_provider_route_privacy(selected(), manifest(**changes), policy())
                self.assertIs(decision.reason, ProviderRoutePrivacyReason.ROUTE_IDENTITY_MISMATCH)
                self.assertIs(decision.privacy_eligible, False)

    def test_sensitive_selection_cannot_be_rebound_to_remote_execution(self):
        local_model = model(provider="fixture-gateway", local=True)
        route = selected(local_model, sensitive=True)
        remote = manifest(local=False)
        decision = evaluate_provider_route_privacy(route, remote, policy())
        self.assertIs(decision.reason, ProviderRoutePrivacyReason.LOCALITY_MISMATCH)
        self.assertIs(decision.privacy_eligible, False)

    def test_local_selection_requires_a_local_manifest(self):
        local_model = model(provider="fixture-gateway", local=True)
        route = selected(local_model, sensitive=True)
        local_manifest = manifest(
            local=True,
            resolved_provider="fixture-gateway",
            processor_chain=("fixture-gateway",),
            region="local",
            retention=ProviderRetention.NONE,
        )
        local_policy = policy(
            allowed_processors=("fixture-gateway",),
            allowed_regions=("local",),
            maximum_retention=ProviderRetention.NONE,
        )
        decision = evaluate_provider_route_privacy(route, local_manifest, local_policy)
        self.assertIs(decision.reason, ProviderRoutePrivacyReason.ELIGIBLE)
        self.assertIs(decision.execution_authorized, False)

    def test_resolved_processor_chain_must_be_fully_allowlisted(self):
        decision = evaluate_provider_route_privacy(
            selected(),
            manifest(processor_chain=("fixture-gateway", "fixture-processor", "hidden-processor")),
            policy(),
        )
        self.assertIs(decision.reason, ProviderRoutePrivacyReason.PROCESSOR_NOT_ALLOWED)

    def test_resolved_provider_must_be_present_in_processor_chain(self):
        with self.assertRaises(ValueError):
            manifest(processor_chain=("fixture-gateway",))

    def test_region_must_be_explicitly_allowed(self):
        decision = evaluate_provider_route_privacy(selected(), manifest(region="us"), policy())
        self.assertIs(decision.reason, ProviderRoutePrivacyReason.REGION_NOT_ALLOWED)

    def test_unknown_region_is_not_a_wildcard(self):
        decision = evaluate_provider_route_privacy(
            selected(), manifest(region="unknown"), policy(allowed_regions=("eu", "us"))
        )
        self.assertIs(decision.reason, ProviderRoutePrivacyReason.REGION_NOT_ALLOWED)

    def test_retention_may_not_exceed_policy(self):
        decision = evaluate_provider_route_privacy(
            selected(), manifest(retention=ProviderRetention.PERSISTENT), policy()
        )
        self.assertIs(decision.reason, ProviderRoutePrivacyReason.RETENTION_NOT_ALLOWED)

    def test_unknown_retention_fails_closed_even_under_permissive_maximum(self):
        decision = evaluate_provider_route_privacy(
            selected(),
            manifest(retention=ProviderRetention.UNKNOWN),
            policy(maximum_retention=ProviderRetention.PERSISTENT),
        )
        self.assertIs(decision.reason, ProviderRoutePrivacyReason.RETENTION_NOT_ALLOWED)

    def test_training_must_be_denied_when_policy_disallows_it(self):
        decision = evaluate_provider_route_privacy(
            selected(), manifest(training_use=ProviderTrainingUse.ALLOWED), policy()
        )
        self.assertIs(decision.reason, ProviderRoutePrivacyReason.TRAINING_NOT_ALLOWED)

    def test_unknown_training_use_fails_closed(self):
        decision = evaluate_provider_route_privacy(
            selected(), manifest(training_use=ProviderTrainingUse.UNKNOWN), policy(allow_training=True)
        )
        self.assertIs(decision.reason, ProviderRoutePrivacyReason.TRAINING_NOT_ALLOWED)

    def test_zdr_requirement_is_independent_from_training_and_retention(self):
        decision = evaluate_provider_route_privacy(
            selected(), manifest(zero_data_retention=False), policy()
        )
        self.assertIs(decision.reason, ProviderRoutePrivacyReason.ZDR_REQUIRED)

    def test_fallback_cannot_widen_the_route_silently(self):
        decision = evaluate_provider_route_privacy(
            selected(), manifest(fallback_used=True), policy(allow_fallback=False)
        )
        self.assertIs(decision.reason, ProviderRoutePrivacyReason.FALLBACK_NOT_ALLOWED)

    def test_fallback_is_still_subject_to_processor_and_region_policy(self):
        permissive = policy(allow_fallback=True)
        self.assertIs(
            evaluate_provider_route_privacy(
                selected(), manifest(fallback_used=True, region="us"), permissive
            ).reason,
            ProviderRoutePrivacyReason.REGION_NOT_ALLOWED,
        )
        self.assertIs(
            evaluate_provider_route_privacy(
                selected(),
                manifest(
                    fallback_used=True,
                    resolved_provider="unexpected",
                    processor_chain=("fixture-gateway", "unexpected"),
                ),
                permissive,
            ).reason,
            ProviderRoutePrivacyReason.PROCESSOR_NOT_ALLOWED,
        )

    def test_allow_training_does_not_accept_unknown_training_policy(self):
        permissive = policy(allow_training=True)
        unknown = manifest(training_use=ProviderTrainingUse.UNKNOWN)
        self.assertIs(
            evaluate_provider_route_privacy(selected(), unknown, permissive).reason,
            ProviderRoutePrivacyReason.TRAINING_NOT_ALLOWED,
        )

    def test_policy_and_manifest_are_immutable(self):
        p = policy()
        m = manifest()
        with self.assertRaises(FrozenInstanceError):
            p.allow_fallback = True
        with self.assertRaises(FrozenInstanceError):
            m.region = "us"

    def test_policy_and_manifest_reject_ambiguous_or_duplicate_labels(self):
        for kwargs in (
            {"allowed_processors": ()},
            {"allowed_processors": ("fixture", "fixture")},
            {"allowed_regions": ()},
            {"allowed_regions": ("eu", "eu")},
            {"allowed_processors": (" fixture",)},
            {"allowed_regions": ("eu\n",)},
        ):
            with self.subTest(kwargs=kwargs):
                with self.assertRaises(ValueError):
                    policy(**kwargs)
        for kwargs in (
            {"processor_chain": ()},
            {"processor_chain": ("fixture-gateway", "fixture-gateway")},
            {"region": ""},
            {"policy_revision": " bad"},
        ):
            with self.subTest(kwargs=kwargs):
                with self.assertRaises(ValueError):
                    manifest(**kwargs)

    def test_exact_boolean_fields_do_not_accept_integer_or_string_surrogates(self):
        for target, field in ((policy, "allow_training"), (policy, "require_zero_data_retention"),
                              (policy, "allow_fallback"), (manifest, "zero_data_retention"),
                              (manifest, "fallback_used"), (manifest, "local")):
            for value in (0, 1, "false", "true", None):
                with self.subTest(target=target.__name__, field=field, value=value):
                    with self.assertRaises(TypeError):
                        target(**{field: value})

    def test_enums_require_canonical_enum_instances(self):
        with self.assertRaises(TypeError):
            policy(maximum_retention="transient")
        with self.assertRaises(TypeError):
            manifest(retention="transient")
        with self.assertRaises(TypeError):
            manifest(training_use="denied")

    def test_fingerprints_are_deterministic_and_change_with_security_semantics(self):
        p = policy()
        m = manifest()
        first = evaluate_provider_route_privacy(selected(), m, p)
        again = evaluate_provider_route_privacy(selected(), manifest(), policy())
        self.assertEqual(first.policy_fingerprint, again.policy_fingerprint)
        self.assertEqual(first.route_fingerprint, again.route_fingerprint)
        self.assertNotEqual(
            first.policy_fingerprint,
            evaluate_provider_route_privacy(
                selected(), m, policy(allow_fallback=True)
            ).policy_fingerprint,
        )
        self.assertNotEqual(
            first.route_fingerprint,
            evaluate_provider_route_privacy(
                selected(), manifest(policy_revision="fixture-policy-v2"), p
            ).route_fingerprint,
        )

    def test_old_decision_becomes_stale_when_policy_or_route_fingerprint_changes(self):
        decision = evaluate_provider_route_privacy(selected(), manifest(), policy())
        self.assertIs(decision.matches_current(manifest(), policy()), True)
        self.assertIs(decision.matches_current(manifest(region="us"), policy()), False)
        self.assertIs(decision.matches_current(manifest(), policy(allow_fallback=True)), False)

    def test_safe_summary_redacts_route_identities_and_policy_labels(self):
        m = manifest(
            requested_provider="private-gateway-name",
            resolved_provider="private-processor-name",
            processor_chain=("private-gateway-name", "private-processor-name"),
            region="private-region-name",
            policy_revision="private-policy-revision",
        )
        p = policy(
            allowed_processors=("private-gateway-name", "private-processor-name"),
            allowed_regions=("private-region-name",),
        )
        route = selected(model(provider="private-gateway-name"))
        summary = evaluate_provider_route_privacy(route, m, p).to_dict()
        serialized = json.dumps(summary, sort_keys=True)
        for secretish_identifier in (
            "private-gateway-name",
            "private-processor-name",
            "private-region-name",
            "private-policy-revision",
            "fixture-model",
        ):
            self.assertNotIn(secretish_identifier, serialized)
        self.assertEqual(summary["schema_version"], "maria.provider-route-privacy.v1")
        self.assertIs(summary["execution_authorized"], False)

    def test_policy_evaluation_does_not_mutate_router_model_or_manifest(self):
        candidate = model()
        route = selected(candidate)
        p = policy()
        m = manifest()
        before = (candidate, route, p, m)
        evaluate_provider_route_privacy(route, m, p)
        self.assertEqual((candidate, route, p, m), before)


if __name__ == "__main__":
    unittest.main()
