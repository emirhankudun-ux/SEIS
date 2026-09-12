from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional

from .models import ModelRegistry, ModelSpec


class ModelRouteReason(str, Enum):
    """Stable first-blocking-stage codes; never a provider-health attestation."""

    SELECTED = "selected"
    NO_MODELS = "no_models"
    NO_LOCAL_MODELS = "no_local_models"
    MODELS_UNAVAILABLE = "models_unavailable"
    CAPABILITY_UNAVAILABLE = "capability_unavailable"
    CONTEXT_EXCEEDED = "context_exceeded"


_MESSAGES = {
    ModelRouteReason.SELECTED: "An eligible model was selected from configured metadata; execution is not authorized.",
    ModelRouteReason.NO_MODELS: "No models are registered.",
    ModelRouteReason.NO_LOCAL_MODELS: "No local models are registered for this request.",
    ModelRouteReason.MODELS_UNAVAILABLE: "No eligible models are marked available.",
    ModelRouteReason.CAPABILITY_UNAVAILABLE: "Available eligible models do not cover all required capabilities.",
    ModelRouteReason.CONTEXT_EXCEEDED: "The requested context exceeds available eligible model capacity.",
}


@dataclass(frozen=True)
class ModelRouteDecision:
    """Descriptive result. Use to_dict() for identifier-free UI/CLI summaries.

    The in-process model reference is for trusted callers only. Neither this
    value nor its JSON representation is execution permission or fresh proof.
    """

    reason: ModelRouteReason
    sensitive: bool
    model: Optional[ModelSpec] = field(default=None, repr=False)

    def __post_init__(self) -> None:
        """Reject contradictory direct construction without granting authority."""
        if type(self.reason) is not ModelRouteReason or type(self.sensitive) is not bool:
            raise TypeError("route reason and sensitivity must have canonical types")
        if self.model is not None and type(self.model) is not ModelSpec:
            raise TypeError("selected model must be ModelSpec")
        if (self.reason is ModelRouteReason.SELECTED) != (self.model is not None):
            raise ValueError("route reason and selected model disagree")
        if self.model is not None and (
            self.model.available is not True or (self.sensitive and self.model.local is not True)
        ):
            raise ValueError("selected model contradicts routing eligibility")

    def to_dict(self) -> dict[str, str | bool]:
        """Return a fresh summary without identities, requests or execution rights."""
        return {
            "schema_version": "maria.routing-decision.v1",
            "outcome": "selected" if self.model is not None else "blocked",
            "reason": self.reason.value,
            "message": _MESSAGES[self.reason],
            "privacy_mode": "local-only" if self.sensitive else "standard",
            "evidence_basis": "configured-metadata-only",
            "execution_authorized": False,
        }


class ModelRouter:
    """Select eligible models; sensitive requests require a local candidate.

    This is a metadata decision, not permission to call a provider. The host
    owns sensitivity classification and must authorize any actual execution.
    """

    def __init__(self, registry: ModelRegistry) -> None:
        """Keep the existing host-owned model registry without initializing adapters."""
        self.registry = registry

    def select(
        self,
        *,
        required_capabilities: set[str],
        sensitive: bool,
        estimated_context_tokens: int,
    ) -> ModelSpec:
        """Preserve model return values and legacy LookupError messages."""
        decision = self.explain(
            required_capabilities=required_capabilities,
            sensitive=sensitive,
            estimated_context_tokens=estimated_context_tokens,
        )
        if decision.model is None:
            if sensitive:
                raise LookupError("no local model satisfies capability/context requirements")
            raise LookupError("no model satisfies capability/context requirements")
        return decision.model

    def explain(
        self,
        *,
        required_capabilities: set[str],
        sensitive: bool,
        estimated_context_tokens: int,
    ) -> ModelRouteDecision:
        """Evaluate one snapshot through ordered gates and explain the first blocker.

        Ordering is registry, privacy, availability, capabilities, context, then
        the existing rank. Selection never retries with weaker privacy policy.
        """
        if type(sensitive) is not bool:
            raise TypeError("sensitive must be a boolean")
        if type(estimated_context_tokens) is not int:
            raise TypeError("estimated_context_tokens must be an integer")
        if estimated_context_tokens < 0:
            raise ValueError("estimated_context_tokens cannot be negative")

        candidates = self.registry.all()
        if not candidates:
            return ModelRouteDecision(ModelRouteReason.NO_MODELS, sensitive)
        if sensitive:
            candidates = [model for model in candidates if model.local is True]
            if not candidates:
                return ModelRouteDecision(ModelRouteReason.NO_LOCAL_MODELS, sensitive)
        candidates = [model for model in candidates if model.available is True]
        if not candidates:
            return ModelRouteDecision(ModelRouteReason.MODELS_UNAVAILABLE, sensitive)
        candidates = [model for model in candidates
                      if required_capabilities.issubset(set(model.capabilities))]
        if not candidates:
            return ModelRouteDecision(ModelRouteReason.CAPABILITY_UNAVAILABLE, sensitive)
        candidates = [model for model in candidates if model.context_size >= estimated_context_tokens]
        if not candidates:
            return ModelRouteDecision(ModelRouteReason.CONTEXT_EXCEEDED, sensitive)

        def score(model: ModelSpec) -> tuple[float, str]:
            """Retain the existing weighted rank and deterministic name tie-break."""
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

        return ModelRouteDecision(ModelRouteReason.SELECTED, sensitive, max(candidates, key=score))
