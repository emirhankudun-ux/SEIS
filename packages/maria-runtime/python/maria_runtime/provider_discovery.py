from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from .models import ModelRegistry, ModelSpec
from .providers import ProviderRegistry, ProviderStatus


@dataclass(frozen=True)
class ModelDiscoveryFact:
    """A redacted, externally verified observation about one model endpoint.

    ``capabilities`` retains the provider-declared capability vocabulary for
    discovery evidence and backwards compatibility. ``routing_capabilities``
    may provide a separately normalized SEIS capability vocabulary when the
    provider uses transport/runtime-specific names. This prevents native labels
    from silently becoming routing authority.

    Credentials, tokens, headers, and raw secret values are never accepted here.
    """

    provider_id: str
    name: str
    capabilities: tuple[str, ...]
    context_size: int
    reliability: float
    latency_ms: int
    input_cost_per_million: float
    output_cost_per_million: float
    local: bool
    verified: bool
    reachable: bool
    auth_present: bool = False
    evidence_sample_count: int | None = None
    evidence_source: str | None = None
    routing_capabilities: tuple[str, ...] | None = None

    def __post_init__(self) -> None:
        if not self.provider_id.strip() or not self.name.strip():
            raise ValueError("provider_id and model name are required")
        if not self.capabilities or any(not item.strip() for item in self.capabilities):
            raise ValueError("model capabilities must be non-empty")
        if self.routing_capabilities is not None:
            if any(not item.strip() for item in self.routing_capabilities):
                raise ValueError("routing capabilities must contain non-empty strings")
            if len(set(self.routing_capabilities)) != len(self.routing_capabilities):
                raise ValueError("routing capabilities cannot contain duplicates")
        if self.context_size <= 0:
            raise ValueError("context_size must be positive")
        if not 0.0 <= self.reliability <= 1.0:
            raise ValueError("reliability must be between 0 and 1")
        if self.latency_ms < 0:
            raise ValueError("latency cannot be negative")
        if self.input_cost_per_million < 0 or self.output_cost_per_million < 0:
            raise ValueError("model costs cannot be negative")
        if self.evidence_sample_count is not None:
            if (
                isinstance(self.evidence_sample_count, bool)
                or not isinstance(self.evidence_sample_count, int)
                or self.evidence_sample_count <= 0
            ):
                raise ValueError("evidence_sample_count must be a positive integer when present")
        if self.evidence_source is not None and not self.evidence_source.strip():
            raise ValueError("evidence_source must be non-empty when present")
        if (self.evidence_sample_count is None) != (self.evidence_source is None):
            raise ValueError("evidence_sample_count and evidence_source must be supplied together")

    @property
    def effective_routing_capabilities(self) -> tuple[str, ...]:
        if self.routing_capabilities is None:
            return self.capabilities
        return self.routing_capabilities


@dataclass(frozen=True)
class ProviderDiscoveryResult:
    models: ModelRegistry
    provider_status: dict[str, ProviderStatus]


class ProviderDiscoveryAdapter:
    """Convert verified provider observations into routable ModelSpec records.

    The adapter is deliberately side-effect free: it does not probe networks,
    launch local runtimes, read secrets, or mutate provider configuration. A
    separate discovery source must collect facts and explicitly mark them as
    verified before they become available to the ModelRouter.
    """

    def __init__(self, providers: ProviderRegistry) -> None:
        self._providers = providers

    def discover(self, facts: Iterable[ModelDiscoveryFact]) -> ProviderDiscoveryResult:
        models = ModelRegistry()
        statuses: dict[str, ProviderStatus] = {
            provider.id: provider.status for provider in self._providers.all()
        }
        per_provider: dict[str, list[ProviderStatus]] = {}

        for fact in facts:
            provider = self._providers.get(fact.provider_id)
            if provider is None:
                raise ValueError(f"unknown provider: {fact.provider_id}")

            status = self._status_for_fact(fact)
            per_provider.setdefault(fact.provider_id, []).append(status)
            models.register(self._model_from_fact(fact, status))

        for provider_id, observed_statuses in per_provider.items():
            statuses[provider_id] = self._aggregate_status(observed_statuses)

        return ProviderDiscoveryResult(models=models, provider_status=statuses)

    @staticmethod
    def _status_for_fact(fact: ModelDiscoveryFact) -> ProviderStatus:
        if not fact.verified:
            return ProviderStatus.DISCOVERY_REQUIRED
        if not fact.reachable:
            return ProviderStatus.UNAVAILABLE
        if not fact.local and not fact.auth_present:
            return ProviderStatus.AUTH_REQUIRED
        return ProviderStatus.AVAILABLE

    @staticmethod
    def _model_from_fact(fact: ModelDiscoveryFact, status: ProviderStatus) -> ModelSpec:
        return ModelSpec(
            name=fact.name,
            provider=fact.provider_id,
            local=fact.local,
            capabilities=fact.effective_routing_capabilities,
            context_size=fact.context_size,
            reliability=fact.reliability,
            latency_ms=fact.latency_ms,
            input_cost_per_million=fact.input_cost_per_million,
            output_cost_per_million=fact.output_cost_per_million,
            available=status is ProviderStatus.AVAILABLE,
            privacy_level="local" if fact.local else "standard",
            evidence_sample_count=fact.evidence_sample_count,
            evidence_source=fact.evidence_source,
        )

    @staticmethod
    def _aggregate_status(statuses: Iterable[ProviderStatus]) -> ProviderStatus:
        observed = set(statuses)
        for preferred in (
            ProviderStatus.AVAILABLE,
            ProviderStatus.DEGRADED,
            ProviderStatus.AUTH_REQUIRED,
            ProviderStatus.UNAVAILABLE,
            ProviderStatus.DISCOVERY_REQUIRED,
            ProviderStatus.DISABLED,
        ):
            if preferred in observed:
                return preferred
        return ProviderStatus.DISCOVERY_REQUIRED
