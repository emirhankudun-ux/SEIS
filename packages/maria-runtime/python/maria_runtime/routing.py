from __future__ import annotations

from dataclasses import dataclass

from .models import ModelRegistry, ModelSpec


@dataclass(frozen=True)
class ModelRouteDecision:
    """Deterministic, redacted explanation of one model-routing decision."""

    model: ModelSpec
    required_capabilities: tuple[str, ...]
    sensitive: bool
    estimated_context_tokens: int
    candidate_names: tuple[str, ...]
    local_privacy_bias_applied: bool
    score: float
    evidence_sample_count: int | None
    evidence_source: str | None


class ModelRouter:
    """Capability-aware model selection with explicit local-first privacy bias."""

    def __init__(self, registry: ModelRegistry) -> None:
        self.registry = registry

    def select(
        self,
        *,
        required_capabilities: set[str],
        sensitive: bool,
        estimated_context_tokens: int,
    ) -> ModelSpec:
        return self.explain_select(
            required_capabilities=required_capabilities,
            sensitive=sensitive,
            estimated_context_tokens=estimated_context_tokens,
        ).model

    def explain_select(
        self,
        *,
        required_capabilities: set[str],
        sensitive: bool,
        estimated_context_tokens: int,
    ) -> ModelRouteDecision:
        if estimated_context_tokens < 0:
            raise ValueError("estimated_context_tokens cannot be negative")
        if any(not item.strip() for item in required_capabilities):
            raise ValueError("required capabilities must be non-empty strings")

        eligible = [
            model for model in self.registry.available()
            if required_capabilities.issubset(set(model.capabilities))
            and model.context_size >= estimated_context_tokens
        ]
        if not eligible:
            raise LookupError("no model satisfies capability/context requirements")

        candidates = eligible
        local_privacy_bias_applied = False
        if sensitive:
            local = [model for model in eligible if model.local]
            if local:
                candidates = local
                local_privacy_bias_applied = True

        scored = [(self._score(model, sensitive=sensitive, estimated_context_tokens=estimated_context_tokens), model) for model in candidates]
        score, selected = max(scored, key=lambda item: (item[0], item[1].name))

        return ModelRouteDecision(
            model=selected,
            required_capabilities=tuple(sorted(required_capabilities)),
            sensitive=sensitive,
            estimated_context_tokens=estimated_context_tokens,
            candidate_names=tuple(sorted(model.name for model in candidates)),
            local_privacy_bias_applied=local_privacy_bias_applied,
            score=score,
            evidence_sample_count=selected.evidence_sample_count,
            evidence_source=selected.evidence_source,
        )

    @staticmethod
    def _score(
        model: ModelSpec,
        *,
        sensitive: bool,
        estimated_context_tokens: int,
    ) -> float:
        context_headroom = min(1.0, model.context_size / max(1, estimated_context_tokens * 4))
        cost = model.input_cost_per_million + model.output_cost_per_million
        cost_score = 1.0 / (1.0 + cost)
        latency_score = 1.0 / (1.0 + (model.latency_ms / 1000.0))
        locality = 1.0 if model.local else 0.0
        return (
            model.reliability * 0.45
            + context_headroom * 0.15
            + latency_score * 0.15
            + cost_score * 0.15
            + locality * (0.10 if sensitive else 0.03)
        )
