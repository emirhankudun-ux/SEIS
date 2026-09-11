from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from statistics import median


class ProbeOutcome(str, Enum):
    SUCCESS = "success"
    TIMEOUT = "timeout"
    TRANSPORT_ERROR = "transport-error"
    HTTP_ERROR = "http-error"
    POLICY_REJECTED = "policy-rejected"
    INVALID_RESPONSE = "invalid-response"


_PROVIDER_PROBES: dict[str, frozenset[str]] = {
    "lm-studio": frozenset({"models"}),
    "ollama": frozenset({"tags", "show"}),
}


@dataclass(frozen=True)
class ProbeObservation:
    """A deliberately redacted local-runtime health observation.

    The schema has no raw body, header, exception-message, prompt, model output,
    or credential field. It is suitable for bounded in-memory reliability
    evidence without turning transport failures into a secret-bearing log.
    """

    provider_id: str
    probe_name: str
    outcome: ProbeOutcome
    latency_ms: int | None = None
    response_bytes: int | None = None

    def __post_init__(self) -> None:
        _validate_probe(self.provider_id, self.probe_name)
        if not isinstance(self.outcome, ProbeOutcome):
            raise ValueError("outcome must be a ProbeOutcome")
        if self.latency_ms is not None:
            if isinstance(self.latency_ms, bool) or not isinstance(self.latency_ms, int) or self.latency_ms < 0:
                raise ValueError("latency_ms must be a non-negative integer when present")
        if self.response_bytes is not None:
            if (
                isinstance(self.response_bytes, bool)
                or not isinstance(self.response_bytes, int)
                or self.response_bytes < 0
            ):
                raise ValueError("response_bytes must be a non-negative integer when present")
        if self.outcome is ProbeOutcome.SUCCESS:
            if self.latency_ms is None or self.response_bytes is None:
                raise ValueError("successful observations require latency and response size")

    @classmethod
    def success(
        cls,
        provider_id: str,
        probe_name: str,
        *,
        latency_ms: int,
        response_bytes: int,
    ) -> "ProbeObservation":
        return cls(
            provider_id=provider_id,
            probe_name=probe_name,
            outcome=ProbeOutcome.SUCCESS,
            latency_ms=latency_ms,
            response_bytes=response_bytes,
        )

    @classmethod
    def failure(
        cls,
        provider_id: str,
        probe_name: str,
        outcome: ProbeOutcome,
        *,
        latency_ms: int | None = None,
        response_bytes: int | None = None,
    ) -> "ProbeObservation":
        if outcome is ProbeOutcome.SUCCESS:
            raise ValueError("failure observation cannot use the success outcome")
        return cls(
            provider_id=provider_id,
            probe_name=probe_name,
            outcome=outcome,
            latency_ms=latency_ms,
            response_bytes=response_bytes,
        )


@dataclass(frozen=True)
class ProbeHealthSummary:
    provider_id: str
    probe_name: str
    sample_count: int
    success_count: int
    failure_count: int
    reliability: float | None
    median_success_latency_ms: int | None


class LocalHealthEvidenceLedger:
    """Bounded in-memory evidence ledger for local runtime probe health.

    Reliability is never invented from a single success. Until the configured
    minimum number of observations exists, the summary exposes `None`.
    """

    def __init__(
        self,
        *,
        max_samples_per_probe: int = 20,
        minimum_reliability_samples: int = 3,
    ) -> None:
        if (
            isinstance(max_samples_per_probe, bool)
            or not isinstance(max_samples_per_probe, int)
            or max_samples_per_probe <= 0
        ):
            raise ValueError("max_samples_per_probe must be a positive integer")
        if (
            isinstance(minimum_reliability_samples, bool)
            or not isinstance(minimum_reliability_samples, int)
            or minimum_reliability_samples <= 0
        ):
            raise ValueError("minimum_reliability_samples must be a positive integer")
        if minimum_reliability_samples > max_samples_per_probe:
            raise ValueError("minimum_reliability_samples cannot exceed max_samples_per_probe")

        self._max_samples = max_samples_per_probe
        self._minimum_samples = minimum_reliability_samples
        self._observations: dict[tuple[str, str], list[ProbeObservation]] = {}

    def record(self, observation: ProbeObservation) -> None:
        key = (observation.provider_id, observation.probe_name)
        bucket = self._observations.setdefault(key, [])
        bucket.append(observation)
        overflow = len(bucket) - self._max_samples
        if overflow > 0:
            del bucket[:overflow]

    def recent(self, provider_id: str, probe_name: str) -> tuple[ProbeObservation, ...]:
        _validate_probe(provider_id, probe_name)
        return tuple(self._observations.get((provider_id, probe_name), ()))

    def summary(self, provider_id: str, probe_name: str) -> ProbeHealthSummary:
        observations = self.recent(provider_id, probe_name)
        sample_count = len(observations)
        successful = [item for item in observations if item.outcome is ProbeOutcome.SUCCESS]
        success_count = len(successful)
        failure_count = sample_count - success_count

        reliability: float | None = None
        if sample_count >= self._minimum_samples:
            reliability = success_count / sample_count

        latency_values = [
            item.latency_ms
            for item in successful
            if item.latency_ms is not None
        ]
        median_latency: int | None = None
        if latency_values:
            median_latency = round(median(latency_values))

        return ProbeHealthSummary(
            provider_id=provider_id,
            probe_name=probe_name,
            sample_count=sample_count,
            success_count=success_count,
            failure_count=failure_count,
            reliability=reliability,
            median_success_latency_ms=median_latency,
        )


def _validate_probe(provider_id: str, probe_name: str) -> None:
    if provider_id not in _PROVIDER_PROBES:
        raise ValueError(f"unsupported local runtime provider: {provider_id}")
    if probe_name not in _PROVIDER_PROBES[provider_id]:
        raise ValueError(f"unsupported probe for {provider_id}: {probe_name}")
