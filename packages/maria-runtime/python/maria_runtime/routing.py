from __future__ import annotations

from .models import ModelRegistry, ModelSpec


class ModelRouter:
    """Select eligible models; sensitive requests require a local candidate.

    This is a metadata decision, not permission to call a provider. The host
    owns sensitivity classification and must authorize any actual execution.
    """

    def __init__(self, registry: ModelRegistry) -> None:
        self.registry = registry

    def select(
        self,
        *,
        required_capabilities: set[str],
        sensitive: bool,
        estimated_context_tokens: int,
    ) -> ModelSpec:
        if type(sensitive) is not bool:
            raise TypeError("sensitive must be a boolean")
        if type(estimated_context_tokens) is not int:
            raise TypeError("estimated_context_tokens must be an integer")
        if estimated_context_tokens < 0:
            raise ValueError("estimated_context_tokens cannot be negative")

        candidates = [
            model for model in self.registry.available()
            if (not sensitive or model.local is True)
            and required_capabilities.issubset(set(model.capabilities))
            and model.context_size >= estimated_context_tokens
        ]
        if not candidates:
            # Privacy is an eligibility boundary, never a scoring preference.
            if sensitive:
                raise LookupError("no local model satisfies capability/context requirements")
            raise LookupError("no model satisfies capability/context requirements")

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
