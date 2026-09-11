from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional

from .context import ProjectContextEngine
from .memory_retrieval import ProjectContextRetriever
from .projects import ProjectRegistry, WorkMode


@dataclass(frozen=True)
class ContinuationContextItem:
    key: str
    value: Any
    source: str
    fact_type: str
    observed_at: str
    confidence: float
    verified: bool
    score: float

    def to_dict(self) -> dict[str, Any]:
        return {
            "key": self.key,
            "value": self.value,
            "source": self.source,
            "fact_type": self.fact_type,
            "observed_at": self.observed_at,
            "confidence": self.confidence,
            "verified": self.verified,
            "score": self.score,
        }


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
    related_context: tuple[ContinuationContextItem, ...] = ()

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
            "related_context": [item.to_dict() for item in self.related_context],
        }


class ContinuationResolver:
    """Resolve natural project continuation into a compact verified work brief.

    Core resume fields still use ``ProjectContextEngine.get`` and therefore keep
    the existing verified/recency/confidence resolution policy. A small related
    context section is added from project-scoped BM25 retrieval so natural
    continuation requests can recover verified architectural details without
    loading the full project history.
    """

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

    def __init__(
        self,
        projects: ProjectRegistry,
        context: ProjectContextEngine,
        *,
        related_context_limit: int = 3,
    ) -> None:
        if related_context_limit < 0:
            raise ValueError("related_context_limit cannot be negative")
        self.projects = projects
        self.context = context
        self.related_context_limit = int(related_context_limit)
        self.retriever = ProjectContextRetriever(context)

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
        related_context = self._related_context(
            request=request,
            project=profile.display_name,
            facts=facts,
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
            related_context=related_context,
        )

    def _related_context(
        self,
        *,
        request: str,
        project: str,
        facts: dict[str, Any],
    ) -> tuple[ContinuationContextItem, ...]:
        if self.related_context_limit == 0:
            return ()

        query_parts = (
            request,
            facts.get("active_goal"),
            facts.get("next_safe_action"),
        )
        query = " ".join(str(part) for part in query_parts if part)
        candidates = self.retriever.search(
            query,
            project=project,
            top_k=self.related_context_limit + len(self._FIELDS),
            verified_only=True,
        )

        related: list[ContinuationContextItem] = []
        for hit in candidates:
            fact = hit.fact
            if fact.key in self._FIELDS:
                continue
            related.append(
                ContinuationContextItem(
                    key=fact.key,
                    value=fact.value,
                    source=fact.source,
                    fact_type=fact.fact_type,
                    observed_at=fact.observed_at,
                    confidence=fact.confidence,
                    verified=fact.verified,
                    score=hit.score,
                )
            )
            if len(related) >= self.related_context_limit:
                break
        return tuple(related)
