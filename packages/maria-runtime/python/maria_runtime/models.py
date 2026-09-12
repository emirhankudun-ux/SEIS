from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
import re
from typing import Iterable, Optional


_OBSERVED_TIME = re.compile(
    r"[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}"
    r"(?:\.[0-9]{1,6})?(?:Z|[+-](?:[01][0-9]|2[0-3]):[0-5][0-9])"
)


def _parse_model_observed_at(value: str) -> datetime:
    """Parse bounded, offset-aware model metadata without echoing input on error."""
    if type(value) is not str:
        raise TypeError("observed_at must be an ISO timestamp string")
    if len(value) > 32 or _OBSERVED_TIME.fullmatch(value) is None:
        raise ValueError("observed_at must include seconds, a timezone and at most six fractional digits")
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc)
    except (ValueError, OverflowError):
        raise ValueError("observed_at is not a representable UTC instant") from None


@dataclass(frozen=True)
class ModelSpec:
    name: str
    provider: str
    local: bool
    capabilities: tuple[str, ...]
    context_size: int
    reliability: float
    latency_ms: int
    input_cost_per_million: float
    output_cost_per_million: float
    available: bool = True
    privacy_level: str = "standard"
    observed_at: Optional[str] = field(default=None, repr=False)
    source: Optional[str] = field(default=None, repr=False)

    def __post_init__(self) -> None:
        """Validate model metadata; optional observation is normalized to UTC."""
        if self.source is not None:
            if type(self.source) is not str:
                raise TypeError("model metadata source must be a string")
            if not 1 <= len(self.source) <= 128 or self.source != self.source.strip() or not self.source.isprintable():
                raise ValueError("model metadata source must be a bounded nonempty printable label")
        if self.observed_at is not None:
            object.__setattr__(self, "observed_at", _parse_model_observed_at(self.observed_at).isoformat())
        if type(self.local) is not bool or type(self.available) is not bool:
            raise TypeError("model local and available must be booleans")
        if type(self.context_size) is not int:
            raise TypeError("context_size must be an integer")
        if not self.name.strip() or not self.provider.strip():
            raise ValueError("model name and provider are required")
        if self.context_size <= 0:
            raise ValueError("context_size must be positive")
        if not 0.0 <= self.reliability <= 1.0:
            raise ValueError("reliability must be between 0 and 1")
        if self.latency_ms < 0:
            raise ValueError("latency cannot be negative")
        if self.input_cost_per_million < 0 or self.output_cost_per_million < 0:
            raise ValueError("model costs cannot be negative")


class ModelRegistry:
    def __init__(self, models: Optional[Iterable[ModelSpec]] = None) -> None:
        self._models: dict[str, ModelSpec] = {}
        for model in models or ():
            self.register(model)

    def register(self, model: ModelSpec) -> None:
        if model.name in self._models:
            raise ValueError(f"model already registered: {model.name}")
        self._models[model.name] = model

    def all(self) -> list[ModelSpec]:
        """Return a sorted list copy of configured records, including unavailable ones.

        The host owns registration concurrency and metadata freshness. This list
        is not a live provider probe or an atomic cross-process snapshot.
        """
        return sorted(self._models.values(), key=lambda model: model.name)

    def available(self) -> list[ModelSpec]:
        return sorted(
            (model for model in self._models.values() if model.available),
            key=lambda model: model.name,
        )

    def get(self, name: str) -> Optional[ModelSpec]:
        return self._models.get(name)
