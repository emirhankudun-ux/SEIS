from __future__ import annotations

from .models import ModelRegistry, ModelSpec


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
        if estimated_context_tokens < 0:
            raise ValueError("estimated_context_tokens cannot be negative")

        candidates = [
            model for model in self.registry.available()
            if required_capabilities.issubset(set(model.capabilities))
            and model.context_size >= estimated_context_tokens
        ]
        if not candidates:
            raise LookupError("no model satisfies capability/context requirements")

        if sensitive:
            local = [model for model in candidates if model.local]
            if local:
                candidates = local

        def score(model: ModelSpec) -> tuple[float, str]:
            context_headroom = min(1.0, model.context_size / max(1, estimated_context_tokens * 4))
            cost = model.input_cost_per_million + model.output_cost_per_million
            cost_score = 1.0 / (1.0 + cost)
            latency_score = 1.0 / (1.0 + (model.latency_ms / 1000.0))
            locality = 1.0 if model.local else 0.0
            value = (
                model.reliability * 0.45
                + context_headroom * 0.15
                + latency_score * 0.15
                + cost_score * 0.15
                + locality * (0.10 if sensitive else 0.03)
            )
            return value, model.name

        return max(candidates, key=score)
