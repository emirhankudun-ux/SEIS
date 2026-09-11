from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Optional

from .models import ModelRegistry
from .registry import CapabilityRegistry
from .routing import ModelRouter


class RouteKind(str, Enum):
    MODEL = "model"
    TOOL = "tool"


@dataclass(frozen=True)
class CapabilityRequest:
    capability: str
    execution_required: bool = False
    sensitive: bool = False
    estimated_context_tokens: int = 0
    project: Optional[str] = None

    def __post_init__(self) -> None:
        if not self.capability.strip():
            raise ValueError("capability must be non-empty")
        if self.estimated_context_tokens < 0:
            raise ValueError("estimated_context_tokens cannot be negative")


@dataclass(frozen=True)
class RouteDecision:
    capability: str
    kind: RouteKind
    target_name: str
    project: Optional[str] = None


class UnifiedCapabilityRouter:
    """Route cognition to models and real execution to verified tools.

    Execution requests deliberately never fall back to a model, even if a
    model advertises the same capability string. This keeps language-model
    competence separate from authority to mutate or inspect external systems.
    """

    def __init__(self, *, models: ModelRegistry, tools: CapabilityRegistry) -> None:
        self.models = models
        self.tools = tools
        self.model_router = ModelRouter(models)

    def route(self, request: CapabilityRequest) -> RouteDecision:
        if request.execution_required:
            tool = self.tools.resolve(request.capability, project=request.project)
            return RouteDecision(
                capability=request.capability,
                kind=RouteKind.TOOL,
                target_name=tool.name,
                project=request.project,
            )

        model = self.model_router.select(
            required_capabilities={request.capability},
            sensitive=request.sensitive,
            estimated_context_tokens=request.estimated_context_tokens,
        )
        return RouteDecision(
            capability=request.capability,
            kind=RouteKind.MODEL,
            target_name=model.name,
            project=request.project,
        )
