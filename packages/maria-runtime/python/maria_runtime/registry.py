from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Iterable, Optional


class ToolStatus(str, Enum):
    AVAILABLE = "available"
    DEGRADED = "degraded"
    UNAVAILABLE = "unavailable"
    AUTH_REQUIRED = "auth-required"
    INCOMPATIBLE = "incompatible"
    DISABLED = "disabled"


@dataclass(frozen=True)
class ToolSpec:
    name: str
    capabilities: tuple[str, ...]
    method_rank: int
    reliability: float
    latency_ms: int
    cost: float
    status: ToolStatus = ToolStatus.AVAILABLE
    version: str = "unknown"
    permissions: tuple[str, ...] = ()
    supported_projects: tuple[str, ...] = ("*",)

    def __post_init__(self) -> None:
        if not self.name.strip():
            raise ValueError("tool name must be non-empty")
        if not self.capabilities:
            raise ValueError("tool must declare at least one capability")
        if self.method_rank < 1:
            raise ValueError("method_rank must be >= 1")
        if not 0.0 <= self.reliability <= 1.0:
            raise ValueError("reliability must be between 0 and 1")
        if self.latency_ms < 0 or self.cost < 0:
            raise ValueError("latency and cost cannot be negative")


class CapabilityRegistry:
    """Deterministic capability registry using SEIS's reliability hierarchy.

    Healthy tools are preferred to degraded ones. Within the same health class,
    structured method rank dominates, followed by reliability, latency and cost.
    """

    def __init__(self, tools: Optional[Iterable[ToolSpec]] = None) -> None:
        self._tools: dict[str, ToolSpec] = {}
        for tool in tools or ():
            self.register(tool)

    def register(self, tool: ToolSpec) -> None:
        if tool.name in self._tools:
            raise ValueError(f"tool already registered: {tool.name}")
        self._tools[tool.name] = tool

    def all(self) -> list[ToolSpec]:
        return sorted(self._tools.values(), key=lambda item: item.name)

    def resolve(self, capability: str, *, project: Optional[str] = None) -> ToolSpec:
        candidates = [
            tool for tool in self._tools.values()
            if capability in tool.capabilities
            and (project is None or "*" in tool.supported_projects or project in tool.supported_projects)
            and tool.status not in {
                ToolStatus.UNAVAILABLE,
                ToolStatus.AUTH_REQUIRED,
                ToolStatus.INCOMPATIBLE,
                ToolStatus.DISABLED,
            }
        ]
        if not candidates:
            raise LookupError(f"no usable tool for capability: {capability}")

        healthy = [tool for tool in candidates if tool.status == ToolStatus.AVAILABLE]
        pool = healthy or [tool for tool in candidates if tool.status == ToolStatus.DEGRADED]
        if not pool:
            raise LookupError(f"no available or degraded tool for capability: {capability}")

        return min(
            pool,
            key=lambda tool: (
                tool.method_rank,
                -tool.reliability,
                tool.latency_ms,
                tool.cost,
                tool.name,
            ),
        )
