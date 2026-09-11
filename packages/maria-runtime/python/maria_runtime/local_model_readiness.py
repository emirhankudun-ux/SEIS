from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Iterable

from .local_health import ProbeOutcome
from .local_status import LocalRuntimeStatusSnapshot, RuntimeProbeState, RuntimeProbeStatus
from .models import ModelSpec


class LocalModelReadinessState(str, Enum):
    """Redacted UI-safe readiness for explicit local text inference."""

    READY = "ready"
    WARMING = "warming"
    DEGRADED = "degraded"
    UNAVAILABLE = "unavailable"
    EVIDENCE_REQUIRED = "evidence-required"
    UNSUPPORTED = "unsupported"


@dataclass(frozen=True)
class LocalModelReadinessRecord:
    """Immutable presentation contract with no prompts, payloads, URLs, or secrets."""

    provider_id: str
    model_name: str
    state: LocalModelReadinessState
    capabilities: tuple[str, ...]
    context_size: int
    evidence_sample_count: int | None

    @property
    def invokable(self) -> bool:
        return self.state is LocalModelReadinessState.READY


class LocalModelReadinessBuilder:
    """Combine routed model metadata with current normalized runtime evidence.

    This builder performs no I/O and does not launch/probe/load a runtime or model.
    It intentionally supports only the concrete local text adapters currently
    implemented by this branch.
    """

    _PROBE_BY_PROVIDER: dict[str, str] = {
        "ollama": "show",
        "lm-studio": "models",
    }
    _EVIDENCE_BY_PROVIDER: dict[str, str] = {
        "ollama": "local-health:ollama/show",
        "lm-studio": "local-health:lm-studio/models",
    }

    def build(
        self,
        models: Iterable[ModelSpec],
        *,
        runtime_snapshot: LocalRuntimeStatusSnapshot,
    ) -> tuple[LocalModelReadinessRecord, ...]:
        if not isinstance(runtime_snapshot, LocalRuntimeStatusSnapshot):
            raise TypeError("runtime_snapshot must be LocalRuntimeStatusSnapshot")

        normalized = tuple(models)
        seen: set[tuple[str, str]] = set()
        for selected in normalized:
            if not isinstance(selected, ModelSpec):
                raise TypeError("local readiness models must be ModelSpec")
            identity = (selected.provider, selected.name)
            if identity in seen:
                raise ValueError(f"duplicate local model identity: {selected.provider}/{selected.name}")
            seen.add(identity)

        probes: dict[tuple[str, str], RuntimeProbeStatus] = {}
        for status in runtime_snapshot.probes:
            if not isinstance(status, RuntimeProbeStatus):
                raise TypeError("runtime snapshot probes must be RuntimeProbeStatus")
            identity = (status.provider_id, status.probe_name)
            if identity in probes:
                raise ValueError(f"duplicate runtime probe status: {status.provider_id}/{status.probe_name}")
            probes[identity] = status

        records = tuple(self._record(selected, probes) for selected in normalized)
        return tuple(sorted(records, key=lambda item: (item.provider_id, item.model_name)))

    def _record(
        self,
        model: ModelSpec,
        probes: dict[tuple[str, str], RuntimeProbeStatus],
    ) -> LocalModelReadinessRecord:
        state = self._state(model, probes)
        return LocalModelReadinessRecord(
            provider_id=model.provider,
            model_name=model.name,
            state=state,
            capabilities=tuple(model.capabilities),
            context_size=model.context_size,
            evidence_sample_count=model.evidence_sample_count,
        )

    def _state(
        self,
        model: ModelSpec,
        probes: dict[tuple[str, str], RuntimeProbeStatus],
    ) -> LocalModelReadinessState:
        probe_name = self._PROBE_BY_PROVIDER.get(model.provider)
        if not model.local or probe_name is None or "chat" not in model.capabilities:
            return LocalModelReadinessState.UNSUPPORTED
        if not model.available:
            return LocalModelReadinessState.UNAVAILABLE

        expected_evidence = self._EVIDENCE_BY_PROVIDER[model.provider]
        if (
            model.evidence_sample_count is None
            or model.evidence_source != expected_evidence
        ):
            return LocalModelReadinessState.EVIDENCE_REQUIRED

        status = probes.get((model.provider, probe_name))
        if status is None:
            return LocalModelReadinessState.WARMING
        if status.sample_count < model.evidence_sample_count:
            return LocalModelReadinessState.EVIDENCE_REQUIRED
        if status.state is RuntimeProbeState.DEGRADED:
            return LocalModelReadinessState.DEGRADED
        if status.state in (RuntimeProbeState.UNKNOWN, RuntimeProbeState.WARMING):
            return LocalModelReadinessState.WARMING
        if status.state is not RuntimeProbeState.READY:
            return LocalModelReadinessState.WARMING
        if status.latest_outcome is not ProbeOutcome.SUCCESS:
            return LocalModelReadinessState.DEGRADED
        return LocalModelReadinessState.READY
