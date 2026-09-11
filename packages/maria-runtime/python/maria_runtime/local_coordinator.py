from __future__ import annotations

from dataclasses import replace

from .local_discovery import (
    LMStudioV1DiscoverySource,
    LocalModelCandidate,
    OllamaShowDiscoverySource,
    OllamaTagsDiscoverySource,
)
from .local_health import LocalHealthEvidenceLedger, ProbeHealthSummary, ProbeObservation, ProbeOutcome
from .local_probe import LocalProbeError, LocalProbeFailureKind, LocalProbeResult, LocalRuntimeProbe
from .local_status import LocalRuntimeSnapshotBuilder, LocalRuntimeStatusSnapshot
from .provider_discovery import ModelDiscoveryFact


_FAILURE_OUTCOMES: dict[LocalProbeFailureKind, ProbeOutcome] = {
    LocalProbeFailureKind.TIMEOUT: ProbeOutcome.TIMEOUT,
    LocalProbeFailureKind.TRANSPORT_ERROR: ProbeOutcome.TRANSPORT_ERROR,
    LocalProbeFailureKind.HTTP_ERROR: ProbeOutcome.HTTP_ERROR,
    LocalProbeFailureKind.POLICY_REJECTED: ProbeOutcome.POLICY_REJECTED,
    LocalProbeFailureKind.INVALID_RESPONSE: ProbeOutcome.INVALID_RESPONSE,
}


class LocalDiscoveryCoordinator:
    """Bind local runtime probes, provenance and redacted health evidence.

    Ollama `/api/show` calls are permitted only for a model name from the most
    recent successfully parsed `/api/tags` inventory, unless the caller records
    an explicit user selection. Successful HTTP responses do not become health
    successes until their provider-specific payload parser also accepts them.
    """

    def __init__(
        self,
        *,
        probe: LocalRuntimeProbe,
        health: LocalHealthEvidenceLedger,
    ) -> None:
        self._probe = probe
        self._health = health
        self._ollama_inventory: dict[str, LocalModelCandidate] = {}
        self._lm_studio = LMStudioV1DiscoverySource()
        self._ollama_tags = OllamaTagsDiscoverySource()
        self._ollama_show = OllamaShowDiscoverySource()

    def current_ollama_inventory(self) -> tuple[LocalModelCandidate, ...]:
        return tuple(sorted(self._ollama_inventory.values(), key=lambda item: item.name))

    def status_snapshot(self) -> LocalRuntimeStatusSnapshot:
        """Return a frozen, redacted point-in-time view for presentation layers."""

        return LocalRuntimeSnapshotBuilder(self._health).build(
            ollama_inventory=self.current_ollama_inventory(),
        )

    def refresh_ollama_inventory(self) -> tuple[LocalModelCandidate, ...]:
        # A failed refresh must not leave an older inventory implicitly trusted as
        # current. Re-population happens only after both transport and parsing pass.
        self._ollama_inventory = {}
        try:
            result = self._probe.probe_ollama_tags()
        except LocalProbeError as exc:
            self._record_probe_failure("ollama", "tags", exc)
            raise

        try:
            candidates = self._ollama_tags.parse_models(result.payload)
        except ValueError:
            self._health.record(ProbeObservation.failure(
                "ollama",
                "tags",
                ProbeOutcome.INVALID_RESPONSE,
                latency_ms=result.latency_ms,
                response_bytes=result.response_bytes,
            ))
            raise

        self._record_probe_success("ollama", "tags", result)
        self._ollama_inventory = {item.name: item for item in candidates}
        return candidates

    def discover_ollama_model(
        self,
        model_name: str,
        *,
        explicit_user_selection: bool = False,
    ) -> ModelDiscoveryFact:
        normalized_name = model_name.strip()
        if not normalized_name:
            raise ValueError("Ollama model name must be non-empty")
        if normalized_name not in self._ollama_inventory and not explicit_user_selection:
            raise PermissionError(
                "Ollama model metadata probe requires current inventory provenance or explicit user selection"
            )

        try:
            result = self._probe.probe_ollama_show(normalized_name)
        except LocalProbeError as exc:
            self._record_probe_failure("ollama", "show", exc)
            raise

        try:
            provisional = self._ollama_show.parse_model(
                normalized_name,
                result.payload,
                latency_ms=result.latency_ms,
                reliability=0.0,
            )
        except ValueError:
            self._health.record(ProbeObservation.failure(
                "ollama",
                "show",
                ProbeOutcome.INVALID_RESPONSE,
                latency_ms=result.latency_ms,
                response_bytes=result.response_bytes,
            ))
            raise

        self._record_probe_success("ollama", "show", result)
        summary = self._required_health_summary("ollama", "show")
        return replace(
            provisional,
            reliability=summary.reliability,
            evidence_sample_count=summary.sample_count,
            evidence_source="local-health:ollama/show",
        )

    def discover_lm_studio_models(self) -> tuple[ModelDiscoveryFact, ...]:
        try:
            result = self._probe.probe_lm_studio_models()
        except LocalProbeError as exc:
            self._record_probe_failure("lm-studio", "models", exc)
            raise

        try:
            provisional = self._lm_studio.parse_models(
                result.payload,
                latency_ms=result.latency_ms,
                reliability=0.0,
            )
        except ValueError:
            self._health.record(ProbeObservation.failure(
                "lm-studio",
                "models",
                ProbeOutcome.INVALID_RESPONSE,
                latency_ms=result.latency_ms,
                response_bytes=result.response_bytes,
            ))
            raise

        self._record_probe_success("lm-studio", "models", result)
        summary = self._required_health_summary("lm-studio", "models")
        return tuple(
            replace(
                fact,
                reliability=summary.reliability,
                evidence_sample_count=summary.sample_count,
                evidence_source="local-health:lm-studio/models",
            )
            for fact in provisional
        )

    def _record_probe_success(
        self,
        provider_id: str,
        probe_name: str,
        result: LocalProbeResult,
    ) -> None:
        self._health.record(ProbeObservation.success(
            provider_id,
            probe_name,
            latency_ms=result.latency_ms,
            response_bytes=result.response_bytes,
        ))

    def _record_probe_failure(
        self,
        provider_id: str,
        probe_name: str,
        error: LocalProbeError,
    ) -> None:
        self._health.record(ProbeObservation.failure(
            provider_id,
            probe_name,
            _FAILURE_OUTCOMES[error.kind],
        ))

    def _required_health_summary(self, provider_id: str, probe_name: str) -> ProbeHealthSummary:
        summary = self._health.summary(provider_id, probe_name)
        if summary.reliability is None:
            raise LookupError(
                f"insufficient health evidence for {provider_id}/{probe_name}; model remains non-routable"
            )
        return summary
