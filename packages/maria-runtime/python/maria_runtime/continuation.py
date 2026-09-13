from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional

from .context import ProjectContextEngine
from .projects import ProjectRegistry, WorkMode


@dataclass(frozen=True)
class ContinuationBrief:
    project_id: str
    project_name: str
    work_mode: WorkMode
    active_goal: Optional[str]
    current_repo: Optional[str]
    current_branch: Optional[str]
    current_application: Optional[str]
    current_blocker: Optional[str]
    last_verification: Optional[str]
    next_safe_action: Optional[str]
    preferred_agents: tuple[str, ...]
    preferred_capabilities: tuple[str, ...]
    ready_to_resume: bool
    missing_context: tuple[str, ...]

    def to_dict(self) -> dict[str, Any]:
        return {
            "project_id": self.project_id,
            "project_name": self.project_name,
            "work_mode": self.work_mode.value,
            "active_goal": self.active_goal,
            "current_repo": self.current_repo,
            "current_branch": self.current_branch,
            "current_application": self.current_application,
            "current_blocker": self.current_blocker,
            "last_verification": self.last_verification,
            "next_safe_action": self.next_safe_action,
            "preferred_agents": list(self.preferred_agents),
            "preferred_capabilities": list(self.preferred_capabilities),
            "ready_to_resume": self.ready_to_resume,
            "missing_context": list(self.missing_context),
        }


class ContinuationResolver:
    """Resolve natural project continuation into a compact verified work brief."""

    _FIELDS = (
        "active_goal",
        "current_repo",
        "current_branch",
        "current_application",
        "current_blocker",
        "last_verification",
        "next_safe_action",
    )
    _REQUIRED_FOR_RESUME = (
        "active_goal",
        "current_repo",
        "current_branch",
        "next_safe_action",
    )

    def __init__(self, projects: ProjectRegistry, context: ProjectContextEngine) -> None:
        self.projects = projects
        self.context = context

    def resolve(self, request: str) -> ContinuationBrief:
        profile = self.projects.match(request)
        facts: dict[str, Any] = {}
        verified: dict[str, bool] = {}
        for field in self._FIELDS:
            fact = self.context.get(field, project=profile.display_name)
            facts[field] = fact.value if fact is not None else None
            verified[field] = bool(fact and fact.verified)

        missing = tuple(
            field for field in self._REQUIRED_FOR_RESUME
            if facts[field] is None or not verified[field]
        )
        return ContinuationBrief(
            project_id=profile.id,
            project_name=profile.display_name,
            work_mode=profile.work_mode,
            active_goal=facts["active_goal"],
            current_repo=facts["current_repo"],
            current_branch=facts["current_branch"],
            current_application=facts["current_application"],
            current_blocker=facts["current_blocker"],
            last_verification=facts["last_verification"],
            next_safe_action=facts["next_safe_action"],
            preferred_agents=profile.preferred_agents,
            preferred_capabilities=profile.preferred_capabilities,
            ready_to_resume=not missing,
            missing_context=missing,
        )
