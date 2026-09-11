from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Optional


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

    def __post_init__(self) -> None:
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

    def available(self) -> list[ModelSpec]:
        return sorted(
            (model for model in self._models.values() if model.available),
            key=lambda model: model.name,
        )

    def get(self, name: str) -> Optional[ModelSpec]:
        return self._models.get(name)
