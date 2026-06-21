"""Small dependency-free response models for the SEIS AI ecosystem API."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass(frozen=True)
class EcosystemModule:
    id: str
    label: str
    status: str
    evidence: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class ApiBoundary:
    id: str
    rule: str
    status: str = "enforced-local-contract"

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


REQUIRED_SYSTEMS = [
    "SEIS AI Core",
    "Autonomous Agent Orchestrator",
    "Plugin Registry",
    "Plugin Feeding System",
    "SSH Connector Layer",
    "Local AI Model Connector",
    "Remote AI Model Connector",
    "Website Builder Agent",
    "UI/UX Agent",
    "Backend Agent",
    "Frontend Agent",
    "Security Agent",
    "Documentation Agent",
    "Goal Tracking Agent",
    "Memory Agent",
    "Task Planner Agent",
    "Code Review Agent",
    "Deployment Agent",
    "Repository Governance Agent",
]


SAFETY_BOUNDARIES = [
    ApiBoundary("no-hardcoded-secrets", "API keys, tokens, SSH keys, and credentials are read from environment or operator-controlled stores only."),
    ApiBoundary("no-live-ssh-mutation", "SSH endpoints expose profiles, safe modes, and dry-run metadata unless explicit approval exists."),
    ApiBoundary("plugin-permission-boundaries", "Plugins feed metadata and plans through declared lanes and cannot expand permissions silently."),
    ApiBoundary("provider-server-side-only", "Browser clients never receive provider API keys or SSH private keys."),
    ApiBoundary("fixture-claims-only", "Local fixtures and validators must not be described as production deployment, live provider execution, or model training."),
]
