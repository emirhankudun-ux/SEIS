from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Iterable

from .local_discovery import LocalModelCandidate
from .local_health import LocalHealthEvidenceLedger, ProbeOutcome


_KNOWN_PROBES: tuple[tuple[str, str], ...] = (
    ("lm-studio", "models"),
    ("ollama", "show"),
    ("ollama", "tags"),
)


class RuntimeProbeState(str, Enum):
    """UI-safe state derived only from normalized local health evidence."""

    UNKNOWN = "unknown"
    WARMING = "warming"
    READY = "ready"
    DEGRADED = "degraded"


@dataclass(frozen=True)
class RuntimeProbeStatus:
    """Immutable, redacted probe status suitable for presentation layers.

    Raw response sizes, bodies, headers, exception text, prompts and credentials
    are deliberately absent. The snapshot exposes only bounded aggregate evidence.
    """

    provider_id: str
    probe_name: str
    state: RuntimeProbeState
    sample_count: int
    success_count: int
    failure_count: int
    reliability: float | None
    median_success_latency_ms: int | None
    latest_outcome: ProbeOutcome | None

    def __post_init__(self) -> None:
        if (self.provider_id, self.probe_name) not in _KNOWN_PROBES:
            raise ValueError(f"unsupported local runtime probe: {self.provider_id}/{self.probe_name}")
        if not isinstance(self.state, RuntimeProbeState):
            raise ValueError("state must be a RuntimeProbeState")
        for value, field_name in (
            (self.sample_count, "sample_count"),
            (self.success_count, "success_count"),
            (self.failure_count, "failure_count"),
        ):
            if isinstance(value, bool) or not isinstance(value, int) or value < 0:
                raise ValueError(f"{field_name} must be a non-negative integer")
        if self.success_count + self.failure_count != self.sample_count:
            raise ValueError("success_count + failure_count must equal sample_count")
        if self.reliability is not None and not 0.0 <= self.reliability <= 1.0:
            raise ValueError("reliability must be between 0 and 1 when present")
        if self.median_success_latency_ms is not None:
            if (
                isinstance(self.median_success_latency_ms, bool)
                or not isinstance(self.median_success_latency_ms, int)
                or self.median_success_latency_ms < 0
            ):
                raise ValueError("median_success_latency_ms must be non-negative when present")
        if self.latest_outcome is not None and not isinstance(self.latest_outcome, ProbeOutcome):
            raise ValueError("latest_outcome must be a ProbeOutcome when present")


@dataclass(frozen=True)
class LocalRuntimeStatusSnapshot:
    """Point-in-time immutable status for the future Integration Center UI."""

    ollama_inventory: tuple[LocalModelCandidate, ...]
    probes: tuple[RuntimeProbeStatus, ...]


class LocalRuntimeSnapshotBuilder:
    """Build a deterministic, immutable view over mutable runtime evidence.

    This class performs no I/O and does not launch, probe, stop or mutate local
    runtimes. Callers may safely hand the returned frozen dataclasses to UI or
    serialization adapters without exposing the ledger itself.
    """

    def __init__(self, health: LocalHealthEvidenceLedger) -> None:
        self._health = health

    def build(
        self,
        *,
        ollama_inventory: Iterable[LocalModelCandidate] = (),
    ) -> LocalRuntimeStatusSnapshot:
        inventory = self._normalize_ollama_inventory(ollama_inventory)
        probes = tuple(self._probe_status(provider_id, probe_name) for provider_id, probe_name in _KNOWN_PROBES)
        return LocalRuntimeStatusSnapshot(
            ollama_inventory=inventory,
            probes=probes,
        )

    def _probe_status(self, provider_id: str, probe_name: str) -> RuntimeProbeStatus:
        summary = self._health.summary(provider_id, probe_name)
        recent = self._health.recent(provider_id, probe_name)
        latest_outcome = recent[-1].outcome if recent else None

        if latest_outcome is None:
            state = RuntimeProbeState.UNKNOWN
        elif latest_outcome is not ProbeOutcome.SUCCESS:
            state = RuntimeProbeState.DEGRADED
        elif summary.reliability is None:
            state = RuntimeProbeState.WARMING
        else:
            state = RuntimeProbeState.READY

        return RuntimeProbeStatus(
            provider_id=summary.provider_id,
            probe_name=summary.probe_name,
            state=state,
            sample_count=summary.sample_count,
            success_count=summary.success_count,
            failure_count=summary.failure_count,
            reliability=summary.reliability,
            median_success_latency_ms=summary.median_success_latency_ms,
            latest_outcome=latest_outcome,
        )

    @staticmethod
    def _normalize_ollama_inventory(
        candidates: Iterable[LocalModelCandidate],
    ) -> tuple[LocalModelCandidate, ...]:
        normalized = tuple(candidates)
        seen_names: set[str] = set()
        for candidate in normalized:
            if candidate.provider_id != "ollama":
                raise ValueError("ollama_inventory may contain only Ollama candidates")
            if candidate.name in seen_names:
                raise ValueError(f"duplicate Ollama inventory candidate: {candidate.name}")
            seen_names.add(candidate.name)
        return tuple(sorted(normalized, key=lambda item: item.name))
