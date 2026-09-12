from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from .models import ModelRegistry, ModelSpec, _parse_model_observed_at


class ModelRouteReason(str, Enum):
    """Stable first-blocking-stage codes; never a provider-health attestation."""

    SELECTED = "selected"
    NO_MODELS = "no_models"
    NO_LOCAL_MODELS = "no_local_models"
    MODELS_UNAVAILABLE = "models_unavailable"
    CAPABILITY_UNAVAILABLE = "capability_unavailable"
    CONTEXT_EXCEEDED = "context_exceeded"
    METADATA_STALE = "metadata_stale"


_MESSAGES = {
    ModelRouteReason.METADATA_STALE: "No eligible model has sufficiently recent, sourced metadata.",
    ModelRouteReason.SELECTED: "An eligible model was selected from configured metadata; execution is not authorized.",
    ModelRouteReason.NO_MODELS: "No models are registered.",
    ModelRouteReason.NO_LOCAL_MODELS: "No local models are registered for this request.",
    ModelRouteReason.MODELS_UNAVAILABLE: "No eligible models are marked available.",
    ModelRouteReason.CAPABILITY_UNAVAILABLE: "Available eligible models do not cover all required capabilities.",
    ModelRouteReason.CONTEXT_EXCEEDED: "The requested context exceeds available eligible model capacity.",
}


def _validate_max_age(value: Optional[int]) -> None:
    """None disables freshness; zero is an active exact-instant policy."""
    if value is not None:
        if type(value) is not int:
            raise TypeError("max_metadata_age_seconds must be an integer")
        if value < 0:
            raise ValueError("max_metadata_age_seconds must be nonnegative")


def _utc_now() -> datetime:
    """Read the host clock once; callers can inject an aware instant for tests."""
    return datetime.now(timezone.utc)


def _as_utc(value: datetime) -> datetime:
    """Refuse implicit local-time assumptions and normalize the reference clock."""
    if type(value) is not datetime:
        raise TypeError("freshness reference time must be a datetime")
    try:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError
        return value.astimezone(timezone.utc)
    except (ValueError, OverflowError):
        raise ValueError("freshness reference time must be a representable timezone-aware instant") from None


def _has_fresh_metadata(model: ModelSpec, limit: int, now: datetime) -> bool:
    """Check sourced metadata with exact elapsed microseconds, never rounded age."""
    if model.observed_at is None or model.source is None:
        return False
    age = now - _parse_model_observed_at(model.observed_at)
    age_microseconds = (age.days * 86400 + age.seconds) * 1000000 + age.microseconds
    return 0 <= age_microseconds <= limit * 1000000


@dataclass(frozen=True)
class ModelRouteDecision:
    """Descriptive result. Use to_dict() for identifier-free UI/CLI summaries.

    The in-process model reference is for trusted callers only. Neither this
    value nor its JSON representation is execution permission or fresh proof.
    """

    reason: ModelRouteReason
    sensitive: bool
    model: Optional[ModelSpec] = field(default=None, repr=False)
    max_metadata_age_seconds: Optional[int] = None
    evaluated_at: Optional[datetime] = field(default=None, repr=False)

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
        _validate_max_age(self.max_metadata_age_seconds)
        age_evaluated = self.reason in (ModelRouteReason.SELECTED, ModelRouteReason.METADATA_STALE)
        if self.max_metadata_age_seconds is None:
            if self.evaluated_at is not None or self.reason is ModelRouteReason.METADATA_STALE:
                raise ValueError("freshness evidence requires an active policy")
        elif age_evaluated:
            if self.evaluated_at is None:
                raise ValueError("age-evaluated decision requires a reference time")
            instant = _as_utc(self.evaluated_at)
            object.__setattr__(self, "evaluated_at", instant)
            if self.model is not None and not _has_fresh_metadata(self.model, self.max_metadata_age_seconds, instant):
                raise ValueError("selected model contradicts metadata freshness policy")
        elif self.evaluated_at is not None:
            raise ValueError("a pre-freshness blocker must not claim an age evaluation")

    def to_dict(self) -> dict[str, object]:
        """Return a fresh summary without identities, requests or execution rights."""
        summary: dict[str, object] = {
            "schema_version": "maria.routing-decision.v1",
            "outcome": "selected" if self.model is not None else "blocked",
            "reason": self.reason.value,
            "message": _MESSAGES[self.reason],
            "privacy_mode": "local-only" if self.sensitive else "standard",
            "evidence_basis": "configured-metadata-only",
            "execution_authorized": False,
        }
        if self.max_metadata_age_seconds is not None:
            summary["schema_version"] = "maria.routing-decision.v2"
            summary["metadata_freshness"] = {
                "max_age_seconds": self.max_metadata_age_seconds,
                "evaluated_at": self.evaluated_at.isoformat() if self.evaluated_at is not None else None,
                "selected_observed_at": self.model.observed_at if self.model else None,
                "selected_source": "host-supplied" if self.model else None,
            }
        return summary


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
        max_metadata_age_seconds: Optional[int] = None,
        now: Optional[datetime] = None,
    ) -> ModelSpec:
        """Preserve model return values and legacy LookupError messages."""
        decision = self.explain(
            required_capabilities=required_capabilities,
            sensitive=sensitive,
            estimated_context_tokens=estimated_context_tokens,
            max_metadata_age_seconds=max_metadata_age_seconds,
            now=now,
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
        max_metadata_age_seconds: Optional[int] = None,
        now: Optional[datetime] = None,
    ) -> ModelRouteDecision:
        """Evaluate one snapshot through ordered gates and explain the first blocker.

        Ordering is registry, privacy, availability, capabilities, context,
        optional metadata freshness, then the existing rank. Selection never
        retries with weaker privacy policy.
        """
        if type(sensitive) is not bool:
            raise TypeError("sensitive must be a boolean")
        if type(estimated_context_tokens) is not int:
            raise TypeError("estimated_context_tokens must be an integer")
        if estimated_context_tokens < 0:
            raise ValueError("estimated_context_tokens cannot be negative")

        _validate_max_age(max_metadata_age_seconds)
        if max_metadata_age_seconds is None:
            if now is not None:
                raise ValueError("a reference time requires an active freshness policy")
            instant = None
        else:
            # Validate caller-supplied time before metadata access, but defer
            # reading the host clock until the age gate is actually reached.
            instant = _as_utc(now) if now is not None else None

        def result(reason: ModelRouteReason, model: Optional[ModelSpec] = None) -> ModelRouteDecision:
            """Carry the same evaluated policy into every descriptive outcome."""
            age_evaluated = reason in (ModelRouteReason.SELECTED, ModelRouteReason.METADATA_STALE)
            return ModelRouteDecision(reason, sensitive, model, max_metadata_age_seconds,
                                      instant if age_evaluated else None)

        candidates = self.registry.all()
        if not candidates:
            return result(ModelRouteReason.NO_MODELS)
        if sensitive:
            candidates = [model for model in candidates if model.local is True]
            if not candidates:
                return result(ModelRouteReason.NO_LOCAL_MODELS)
        candidates = [model for model in candidates if model.available is True]
        if not candidates:
            return result(ModelRouteReason.MODELS_UNAVAILABLE)
        candidates = [model for model in candidates
                      if required_capabilities.issubset(set(model.capabilities))]
        if not candidates:
            return result(ModelRouteReason.CAPABILITY_UNAVAILABLE)
        candidates = [model for model in candidates if model.context_size >= estimated_context_tokens]
        if not candidates:
            return result(ModelRouteReason.CONTEXT_EXCEEDED)

        if max_metadata_age_seconds is not None:
            if instant is None:
                instant = _as_utc(_utc_now())
            candidates = [model for model in candidates
                          if _has_fresh_metadata(model, max_metadata_age_seconds, instant)]
            if not candidates:
                return result(ModelRouteReason.METADATA_STALE)

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

        return result(ModelRouteReason.SELECTED, max(candidates, key=score))
