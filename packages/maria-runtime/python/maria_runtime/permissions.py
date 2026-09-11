from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Callable, Optional


class ActionClass(str, Enum):
    READ = "read"
    SAFE_EXECUTE = "safe-execute"
    MODIFY = "modify"
    EXTERNAL = "external"
    DESTRUCTIVE = "destructive"
    FINANCIAL = "financial"
    PRIVACY_SENSITIVE = "privacy-sensitive"


def _require_exact_identity(value: object, *, field: str) -> str:
    if type(value) is not str:
        raise TypeError(f"{field} must be str")
    if not value or value != value.strip():
        raise ValueError(f"{field} must be an exact non-empty identity")
    if any(ord(character) < 0x20 or ord(character) == 0x7F for character in value):
        raise ValueError(f"{field} must not contain control characters")
    return value


@dataclass(frozen=True)
class ResolvedTargetEvidence:
    """Adapter-owned target identity evidence consumed by the permission gate."""

    target: str
    source: str
    observed_at: datetime
    verified: bool

    def __post_init__(self) -> None:
        _require_exact_identity(self.target, field="resolved target evidence target")
        _require_exact_identity(self.source, field="resolved target evidence source")
        if not isinstance(self.observed_at, datetime):
            raise TypeError("resolved target evidence observed_at must be datetime")
        if self.observed_at.tzinfo is None or self.observed_at.utcoffset() is None:
            raise ValueError("resolved target evidence observed_at must be timezone-aware")
        if type(self.verified) is not bool:
            raise TypeError("resolved target evidence verified must be bool")


@dataclass(frozen=True)
class PermissionDecision:
    action_class: ActionClass
    target: str
    allowed: bool
    requires_approval: bool
    reason: str
    reversible: Optional[bool]
    target_evidence: Optional[ResolvedTargetEvidence] = None


class PermissionEngine:
    """Fail-closed action policy evaluated at execution boundary.

    LLM intent classification may inform a request, but cannot bypass this
    decision. Every mutating adapter must call this engine before execution.
    """

    _APPROVAL_REQUIRED = {
        ActionClass.MODIFY,
        ActionClass.EXTERNAL,
        ActionClass.DESTRUCTIVE,
        ActionClass.FINANCIAL,
        ActionClass.PRIVACY_SENSITIVE,
    }
    _TARGET_EVIDENCE_MAX_AGE = timedelta(seconds=60)

    def __init__(self, *, clock: Optional[Callable[[], datetime]] = None) -> None:
        if clock is not None and not callable(clock):
            raise TypeError("permission clock must be callable")
        self._clock = clock or (lambda: datetime.now(timezone.utc))

    def evaluate(
        self,
        action_class: ActionClass,
        *,
        target: str,
        approved: bool = False,
        reversible: Optional[bool] = None,
        target_evidence: Optional[ResolvedTargetEvidence] = None,
    ) -> PermissionDecision:
        _require_exact_identity(target, field="permission target")
        if not isinstance(action_class, ActionClass):
            action_class = ActionClass(action_class)
        if type(approved) is not bool:
            raise TypeError("approved must be bool")
        if reversible is not None and type(reversible) is not bool:
            raise TypeError("reversible must be bool or None")
        if target_evidence is not None and type(target_evidence) is not ResolvedTargetEvidence:
            raise TypeError("target_evidence must be ResolvedTargetEvidence or None")

        requires = action_class in self._APPROVAL_REQUIRED
        if requires and not approved:
            return PermissionDecision(
                action_class=action_class,
                target=target,
                allowed=False,
                requires_approval=True,
                reason=f"{action_class.value} action requires explicit owner approval",
                reversible=reversible,
                target_evidence=target_evidence,
            )

        if requires and not self._target_evidence_is_fresh_and_exact(target, target_evidence):
            return PermissionDecision(
                action_class=action_class,
                target=target,
                allowed=False,
                requires_approval=True,
                reason="approved action requires fresh verified target evidence",
                reversible=reversible,
                target_evidence=target_evidence,
            )

        return PermissionDecision(
            action_class=action_class,
            target=target,
            allowed=True,
            requires_approval=requires,
            reason="explicit approval recorded" if requires else "policy allows low-risk action",
            reversible=reversible,
            target_evidence=target_evidence,
        )

    def _target_evidence_is_fresh_and_exact(
        self,
        target: str,
        evidence: Optional[ResolvedTargetEvidence],
    ) -> bool:
        if evidence is None or not evidence.verified or evidence.target != target:
            return False

        now = self._clock()
        if not isinstance(now, datetime):
            raise TypeError("permission clock must return datetime")
        if now.tzinfo is None or now.utcoffset() is None:
            raise ValueError("permission clock must return a timezone-aware datetime")

        age = now.astimezone(timezone.utc) - evidence.observed_at.astimezone(timezone.utc)
        return timedelta(0) <= age <= self._TARGET_EVIDENCE_MAX_AGE
