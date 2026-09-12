"""Opt-in routing freshness, with fixed clocks and hypothetical model metadata."""
from __future__ import annotations

from contextlib import redirect_stdout
from dataclasses import fields
from datetime import datetime, timedelta, timezone
import importlib.util
import inspect
import io
import json
from pathlib import Path
import subprocess
import sys
import unittest
from unittest.mock import patch
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages/maria-runtime/python"))
import maria_runtime.routing as routing
from maria_runtime import ModelRegistry, ModelRouter, ModelRouteDecision, ModelRouteReason, ModelSpec

NOW = datetime(2026, 9, 13, 12, 0, tzinfo=timezone.utc)
LAUNCHER = ROOT / "apps/maria-desktop/maria.py"


def legacy_model(name="fixture-local", **changes):
    """Build metadata without loading a model or contacting any provider."""
    data = dict(name=name, provider="fixture-private-provider", local=True,
                capabilities=("coding",), context_size=8192, reliability=0.5,
                latency_ms=10, input_cost_per_million=0.0, output_cost_per_million=0.0)
    data.update(changes)
    return ModelSpec(**data)


class FreshnessTests(unittest.TestCase):
    def observed(self, *, age=30, source="fixture-private-source", **changes):
        """Assert the new contract before building a dated fixture."""
        self.assertIn("observed_at", {field.name for field in fields(ModelSpec)})
        return legacy_model(observed_at=(NOW - timedelta(seconds=age)).isoformat(),
                            source=source, **changes)

    def explain(self, candidates, *, limit=60, now=NOW, sensitive=True, **changes):
        """Use the real router; missing API support must be an assertion failure."""
        self.assertIn("max_metadata_age_seconds", inspect.signature(ModelRouter.explain).parameters)
        args = dict(required_capabilities={"coding"}, sensitive=sensitive,
                    estimated_context_tokens=4096, max_metadata_age_seconds=limit, now=now)
        args.update(changes)
        return ModelRouter(ModelRegistry(candidates)).explain(**args)

    def test_optional_metadata_preserves_existing_construction(self):
        """Existing records need not provide timestamps or provenance labels."""
        record = legacy_model()
        self.assertTrue(hasattr(record, "observed_at"))
        self.assertIsNone(record.observed_at)
        self.assertIsNone(record.source)

    def test_observation_is_canonical_utc_without_rounding(self):
        """Equivalent offset timestamps normalize to the exact same UTC instant."""
        self.observed()
        record = legacy_model(observed_at="2026-09-13T15:00:00.123456+03:00", source="fixture")
        self.assertEqual(record.observed_at, "2026-09-13T12:00:00.123456+00:00")
        self.assertEqual(legacy_model(observed_at="2026-09-13T12:00:00Z").observed_at,
                         NOW.isoformat())

    def test_timestamp_rejects_ambiguous_malformed_or_excess_precision(self):
        """Timezone-less and truncated-precision input cannot manufacture freshness."""
        self.observed()
        for value in ["2026-09-13", "2026-09-13T12:00:00", "2026-09-13 12:00:00Z",
                      "2026-09-13T12:00:00.1234567Z", "2026-02-30T12:00:00Z",
                      "2026-09-13T12:00:00+99:00", "2026-09-13T12:00:00Z\n",
                      "0001-01-01T00:00:00+14:00", "fixture-secret", "x" * 1000]:
            with self.subTest(value=value[:40]):
                with self.assertRaises(ValueError) as caught:
                    legacy_model(observed_at=value)
                self.assertNotIn(value, str(caught.exception))
        for value in [True, 1, NOW, {}, []]:
            with self.assertRaises(TypeError):
                legacy_model(observed_at=value)

    def test_source_is_optional_bounded_and_not_silently_coerced(self):
        """Source labels remain host data, not an arbitrary executable object."""
        self.observed()
        for value in ["", " ", " fixture", "fixture\n", "x" * 129]:
            with self.assertRaises(ValueError):
                legacy_model(source=value)
        for value in [False, 1, [], {}]:
            with self.assertRaises(TypeError):
                legacy_model(source=value)
        self.assertEqual(legacy_model(source="δοκιμή").source, "δοκιμή")

    def test_source_and_timestamp_do_not_leak_via_model_repr(self):
        """Incidental model logging must not include the new provenance fields."""
        record = self.observed()
        self.assertNotIn(record.source, repr(record))
        self.assertNotIn(record.observed_at, repr(record))

    def test_default_selection_ignores_new_optional_freshness(self):
        """No freshness policy retains prior selection, even for old sourced data."""
        stale = self.observed(age=100000)
        router = ModelRouter(ModelRegistry([stale]))
        args = dict(required_capabilities={"coding"}, sensitive=True, estimated_context_tokens=4096)
        with patch("maria_runtime.routing._utc_now", side_effect=AssertionError("unexpected clock read")):
            self.assertIs(router.select(**args), stale)
            self.assertEqual(router.explain(**args).to_dict()["schema_version"], "maria.routing-decision.v1")

    def test_exact_inclusive_age_boundaries_and_future_time(self):
        """Subsecond age and future timestamps cannot pass through rounding."""
        for age, expected in [(0, "selected"), (60, "selected"), (60.000001, "metadata_stale"),
                              (-0.000001, "metadata_stale"), (86400, "metadata_stale")]:
            with self.subTest(age=age):
                self.assertEqual(self.explain([self.observed(age=age)]).reason.value, expected)

    def test_zero_age_is_an_active_policy_not_the_disabled_default(self):
        """A zero-second policy accepts only an exact observation instant."""
        self.assertEqual(self.explain([self.observed(age=0)], limit=0).reason.value, "selected")
        self.assertEqual(self.explain([self.observed(age=0.000001)], limit=0).reason.value, "metadata_stale")

    def test_missing_time_or_source_fails_closed_when_enabled(self):
        """Unknown provenance is not silently labeled fresh."""
        self.observed()
        candidates = [legacy_model(), legacy_model(observed_at=NOW.isoformat()),
                      legacy_model(source="fixture")]
        for record in candidates:
            self.assertEqual(self.explain([record]).reason.value, "metadata_stale")

    def test_stale_local_does_not_fall_back_to_fresh_cloud(self):
        """Fresh cloud metadata never relaxes sensitive local-only eligibility."""
        stale = self.observed(age=61)
        cloud = self.observed(name="fixture-cloud", local=False, reliability=1.0)
        result = self.explain([stale, cloud])
        self.assertEqual(result.reason.value, "metadata_stale")
        self.assertIsNone(result.model)
        self.assertIs(self.explain([stale, cloud], sensitive=False).model, cloud)

    def test_freshness_filters_before_ranking(self):
        """A higher score cannot resurrect a stale eligible model."""
        stale = self.observed(age=61, name="high-score", reliability=1.0)
        fresh = self.observed(name="fresh", reliability=0.0)
        self.assertIs(self.explain([stale, fresh]).model, fresh)

    def test_previous_first_blocking_reasons_are_preserved(self):
        """Freshness is applied after existing eligibility gates, before ranking."""
        self.observed()
        cases = [([], "no_models"), ([legacy_model(local=False)], "no_local_models"),
                 ([legacy_model(available=False)], "models_unavailable"),
                 ([legacy_model(capabilities=("vision",))], "capability_unavailable"),
                 ([legacy_model(context_size=1024)], "context_exceeded")]
        for records, reason in cases:
            self.assertEqual(self.explain(records).reason.value, reason)

    def test_explain_and_select_share_freshness_and_legacy_errors(self):
        """The original selection API must not bypass the new explanation gate."""
        fresh, stale = self.observed(), self.observed(age=61)
        self.assertIn("max_metadata_age_seconds", inspect.signature(ModelRouter.select).parameters)
        for sensitive in (True, False):
            args = dict(required_capabilities={"coding"}, sensitive=sensitive,
                        estimated_context_tokens=4096, max_metadata_age_seconds=60, now=NOW)
            router = ModelRouter(ModelRegistry([fresh]))
            self.assertIs(router.select(**args), router.explain(**args).model)
            with self.assertRaisesRegex(LookupError, "model satisfies capability/context requirements"):
                ModelRouter(ModelRegistry([stale])).select(**args)

    def test_one_trusted_clock_read_per_evaluation(self):
        """All candidates in one decision use the same reference instant."""
        records = [self.observed(name=str(i)) for i in range(5)]
        with patch("maria_runtime.routing._utc_now", return_value=NOW) as clock:
            decision = self.explain(records, now=None)
        self.assertEqual(clock.call_count, 1)
        self.assertEqual(decision.evaluated_at, NOW)

    def test_offset_clock_and_long_intervals_use_elapsed_time(self):
        """UTC offsets and centuries do not change exact age boundaries."""
        record = self.observed(age=60)
        offset_now = NOW.astimezone(timezone(timedelta(hours=-5)))
        self.assertEqual(self.explain([record], now=offset_now).reason.value, "selected")
        ancient = legacy_model(observed_at="0001-01-01T00:00:00Z", source="fixture")
        delta = NOW - datetime(1, 1, 1, tzinfo=timezone.utc)
        limit = delta.days * 86400 + delta.seconds
        self.assertEqual(self.explain([ancient], limit=limit).reason.value, "selected")
        self.assertEqual(self.explain([ancient], limit=limit, now=NOW + timedelta(microseconds=1)).reason.value,
                         "metadata_stale")

    def test_later_evaluation_can_expire_an_earlier_decision(self):
        """A descriptive selection is not a reusable freshness authorization."""
        record = self.observed(age=60)
        before = self.explain([record])
        after = self.explain([record], now=NOW + timedelta(microseconds=1))
        self.assertEqual(before.reason.value, "selected")
        self.assertEqual(after.reason.value, "metadata_stale")
        self.assertIs(before.to_dict()["execution_authorized"], False)

    def test_invalid_policy_fails_before_registry_access(self):
        """Malformed policy must not default to a disabled guard."""
        self.assertIn("max_metadata_age_seconds", inspect.signature(ModelRouter.explain).parameters)
        class Unreadable:
            def all(self):
                raise AssertionError("invalid policy read registry")
        router = ModelRouter(Unreadable())
        base = dict(required_capabilities={"coding"}, sensitive=True, estimated_context_tokens=1)
        for value in [True, False, 1.5, float("nan"), float("inf"), "60"]:
            with self.assertRaises(TypeError):
                router.explain(**base, max_metadata_age_seconds=value, now=NOW)
        with self.assertRaises(ValueError):
            router.explain(**base, max_metadata_age_seconds=-1, now=NOW)
        with self.assertRaises(ValueError):
            router.explain(**base, now=NOW)
        for value in [NOW.replace(tzinfo=None), "2026-09-13", False]:
            with self.assertRaises((ValueError, TypeError)):
                router.explain(**base, max_metadata_age_seconds=60, now=value)

    def test_daylight_saving_fold_is_compared_as_elapsed_utc(self):
        """Repeated wall-clock hours cannot make hour-old metadata appear fresh."""
        self.observed()
        record = legacy_model(observed_at="2025-11-02T01:15:00-04:00", source="fixture")
        zone = ZoneInfo("America/New_York")
        first = datetime(2025, 11, 2, 1, 30, tzinfo=zone, fold=0)
        second = first.replace(fold=1)
        self.assertEqual(self.explain([record], now=first, limit=3600).reason.value, "selected")
        self.assertEqual(self.explain([record], now=second, limit=3600).reason.value, "metadata_stale")

    def test_clock_failure_never_silently_disables_the_guard(self):
        """A failing clock cannot yield an unchecked selection or a provider call."""
        record = self.observed()
        with patch("socket.socket", side_effect=AssertionError("unexpected network")), \
             patch("maria_runtime.routing._utc_now", side_effect=RuntimeError("fixture clock failure")):
            with self.assertRaisesRegex(RuntimeError, "fixture clock failure"):
                self.explain([record], now=None)

    def test_prior_blockers_do_not_read_the_clock(self):
        """Clock failure must not mask the first closed eligibility gate."""
        cases = [([], "no_models"), ([legacy_model(local=False)], "no_local_models"),
                 ([legacy_model(available=False)], "models_unavailable"),
                 ([legacy_model(capabilities=("vision",))], "capability_unavailable"),
                 ([legacy_model(context_size=1024)], "context_exceeded")]
        for records, reason in cases:
            with self.subTest(reason=reason), \
                 patch("maria_runtime.routing._utc_now", side_effect=RuntimeError("clock failure")) as clock:
                try:
                    decision = self.explain(records, now=None)
                except RuntimeError:
                    self.fail("clock failure masked an earlier eligibility blocker")
                self.assertEqual(decision.reason.value, reason)
                self.assertIsNone(decision.evaluated_at)
                self.assertIsNone(decision.to_dict()["metadata_freshness"]["evaluated_at"])
                self.assertIs(decision.to_dict()["execution_authorized"], False)
                clock.assert_not_called()

    def test_unevaluated_freshness_is_not_given_an_invented_timestamp(self):
        """An earlier blocker carries the requested policy, not a performed age check."""
        decision = ModelRouteDecision(ModelRouteReason.NO_MODELS, True, max_metadata_age_seconds=60)
        self.assertIsNone(decision.to_dict()["metadata_freshness"]["evaluated_at"])
        with self.assertRaises(ValueError):
            ModelRouteDecision(ModelRouteReason.NO_MODELS, True,
                               max_metadata_age_seconds=60, evaluated_at=NOW)
        with self.assertRaises(ValueError):
            ModelRouteDecision(ModelRouteReason.METADATA_STALE, True, max_metadata_age_seconds=60)

    def test_guarded_summary_is_versioned_and_redacted(self):
        """Expose timestamp and source category, never the arbitrary source label."""
        record = self.observed()
        decision = self.explain([record])
        summary = decision.to_dict()
        self.assertEqual(summary["schema_version"], "maria.routing-decision.v2")
        self.assertIs(summary["execution_authorized"], False)
        self.assertEqual(summary["evidence_basis"], "configured-metadata-only")
        freshness = summary["metadata_freshness"]
        self.assertEqual(freshness["max_age_seconds"], 60)
        self.assertEqual(freshness["evaluated_at"], NOW.isoformat())
        self.assertEqual(freshness["selected_observed_at"], record.observed_at)
        self.assertEqual(freshness["selected_source"], "host-supplied")
        encoded = json.dumps(summary)
        for private in [record.name, record.provider, record.source]:
            self.assertNotIn(private, encoded)
        freshness["selected_source"] = "modified-copy"
        self.assertEqual(decision.to_dict()["metadata_freshness"]["selected_source"], "host-supplied")

    def test_blocked_summary_does_not_expose_candidate_provenance(self):
        """No selected model means no leaked timestamp or source from a rejected one."""
        summary = self.explain([self.observed(age=61)]).to_dict()
        self.assertEqual(summary["outcome"], "blocked")
        self.assertIsNone(summary["metadata_freshness"]["selected_observed_at"])
        self.assertIsNone(summary["metadata_freshness"]["selected_source"])

    def test_direct_decision_cannot_claim_contradictory_freshness(self):
        """Direct construction preserves descriptive policy consistency."""
        record = self.observed(age=61)
        self.assertIn("max_metadata_age_seconds", inspect.signature(ModelRouteDecision).parameters)
        with self.assertRaises(ValueError):
            ModelRouteDecision(ModelRouteReason.SELECTED, True, record,
                               max_metadata_age_seconds=60, evaluated_at=NOW)
        with self.assertRaises(ValueError):
            ModelRouteDecision(ModelRouteReason.METADATA_STALE, True, max_metadata_age_seconds=60)
        with self.assertRaises(ValueError):
            ModelRouteDecision(ModelRouteReason.NO_MODELS, True, evaluated_at=NOW)


class FreshnessCLITests(unittest.TestCase):
    def run_cli(self, *args):
        """Invoke the real launcher without shell evaluation."""
        return subprocess.run([sys.executable, str(LAUNCHER), *args], cwd=ROOT,
                              capture_output=True, text=True, timeout=10)

    def test_opt_in_cli_retains_truthful_fixture_and_first_blocker(self):
        """Unobserved demo data must not be relabeled as a live probe."""
        result = self.run_cli("--route-check", "coding", "--route-max-metadata-age-seconds", "60")
        self.assertEqual(result.returncode, 3, result.stderr)
        data = json.loads(result.stdout)
        self.assertEqual(data["schema_version"], "maria.routing-decision.v2")
        self.assertEqual(data["reason"], "models_unavailable")
        self.assertEqual(data["metadata_freshness"]["max_age_seconds"], 60)
        self.assertEqual(data["registry_source"], "built-in-demo-fixture")
        self.assertIs(data["live_probe_performed"], False)
        self.assertIs(data["execution_authorized"], False)

    def test_cli_rejects_policy_without_route_or_invalid_seconds(self):
        """Misconfigured freshness flags produce usage errors, not fallback status."""
        for args in [("--route-max-metadata-age-seconds", "60"),
                     ("--route-check", "coding", "--route-max-metadata-age-seconds", "-1"),
                     ("--route-check", "coding", "--route-max-metadata-age-seconds", "0.5")]:
            result = self.run_cli(*args)
            self.assertEqual(result.returncode, 2)
            self.assertEqual(result.stdout, "")
            self.assertNotIn("Traceback", result.stderr)

    def test_no_opt_in_keeps_v1_cli_shape(self):
        """Legacy invocations do not acquire a time-dependent output field."""
        result = self.run_cli("--route-check", "coding")
        self.assertEqual(result.returncode, 3)
        data = json.loads(result.stdout)
        self.assertEqual(data["schema_version"], "maria.routing-decision.v1")
        self.assertNotIn("metadata_freshness", data)

    def test_cli_passes_policy_to_the_real_router(self):
        """A controlled available fixture with unknown age is blocked, not selected."""
        spec = importlib.util.spec_from_file_location("maria_freshness_launcher", LAUNCHER)
        launcher = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(launcher)
        output = io.StringIO()
        with patch.object(launcher, "build_demo_models", return_value=ModelRegistry([legacy_model()])), \
             patch.object(sys, "argv", [str(LAUNCHER), "--route-check", "coding",
                                       "--route-max-metadata-age-seconds", "60"]), \
             redirect_stdout(output):
            try:
                result = launcher.main()
            except SystemExit:
                self.fail("freshness CLI option is not implemented")
        self.assertEqual(result, 3)
        self.assertEqual(json.loads(output.getvalue())["reason"], "metadata_stale")


if __name__ == "__main__":
    unittest.main()
