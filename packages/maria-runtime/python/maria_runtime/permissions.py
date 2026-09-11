from __future__ import annotations

from dataclasses import dataclass, replace
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Optional


class ActionClass(str, Enum):
    READ = "read"
    SAFE_EXECUTE = "safe-execute"
    MODIFY = "modify"
    EXTERNAL = "external"
    DESTRUCTIVE = "destructive"
    FINANCIAL = "financial"
    PRIVACY_SENSITIVE = "privacy-sensitive"


def _validate_exact_identity(value: object, *, label: str) -> str:
    if type(value) is not str:
        raise TypeError(f"{label} must be str")
    if not value or value != value.strip():
        raise ValueError(f"{label} must be an exact non-empty identity")
    if any(ord(character) < 0x20 or ord(character) == 0x7F for character in value):
        raise ValueError(f"{label} must not contain control characters")
    return value


@dataclass(frozen=True)
class AdapterTargetEvidence:
    """Adapter-declared binding from a requested target to a resolved identity.

    This is evidence, not authority. Hosts must construct it only after their
    adapter resolves a real resource. Permission policy still decides whether an
    action is allowed, and mutation still requires explicit owner approval.
    """

    adapter_id: str
    requested_target: str
    resolved_target: str
    provenance: str
    observed_at: datetime

    def validate(self, *, now: datetime, max_age: timedelta) -> None:
        _validate_exact_identity(self.adapter_id, label="adapter id")
        _validate_exact_identity(self.requested_target, label="requested target")
        _validate_exact_identity(self.resolved_target, label="resolved target")
        _validate_exact_identity(self.provenance, label="target evidence provenance")

        if type(self.observed_at) is not datetime:
            raise TypeError("target evidence observed_at must be datetime")
        if self.observed_at.tzinfo is None or self.observed_at.utcoffset() is None:
            raise ValueError("target evidence observed_at must be timezone-aware")
        if type(now) is not datetime:
            raise TypeError("target evidence now must be datetime")
        if now.tzinfo is None or now.utcoffset() is None:
            raise ValueError("target evidence now must be timezone-aware")
        if type(max_age) is not timedelta:
            raise TypeError("target evidence max_age must be timedelta")
        if max_age <= timedelta(0):
            raise ValueError("target evidence max_age must be positive")

        observed_utc = self.observed_at.astimezone(timezone.utc)
        now_utc = now.astimezone(timezone.utc)
        if observed_utc > now_utc:
            raise ValueError("target evidence must not be future-dated")
        if now_utc - observed_utc > max_age:
            raise ValueError("target evidence is stale")


@dataclass(frozen=True)
class PermissionDecision:
    action_class: ActionClass
    target: str
    allowed: bool
    requires_approval: bool
    reason: str
    reversible: Optional[bool]
    target_evidence: Optional[AdapterTargetEvidence] = None


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

    def evaluate(
        self,
        action_class: ActionClass,
        *,
        target: str,
        approved: bool = False,
        reversible: Optional[bool] = None,
    ) -> PermissionDecision:
        target = _validate_exact_identity(target, label="permission target")
        if not isinstance(action_class, ActionClass):
            action_class = ActionClass(action_class)
        if type(approved) is not bool:
            raise TypeError("approved must be bool")
        if reversible is not None and type(reversible) is not bool:
            raise TypeError("reversible must be bool or None")

        requires = action_class in self._APPROVAL_REQUIRED
        if requires and not approved:
            return PermissionDecision(
                action_class=action_class,
                target=target,
                allowed=False,
                requires_approval=True,
                reason=f"{action_class.value} action requires explicit owner approval",
                reversible=reversible,
            )

        return PermissionDecision(
            action_class=action_class,
            target=target,
            allowed=True,
            requires_approval=requires,
            reason="explicit approval recorded" if requires else "policy allows low-risk action",
            reversible=reversible,
        )

    def evaluate_resolved(
        self,
        action_class: ActionClass,
        *,
        evidence: AdapterTargetEvidence,
        approved: bool = False,
        reversible: Optional[bool] = None,
        now: Optional[datetime] = None,
        max_age: timedelta = timedelta(minutes=5),
    ) -> PermissionDecision:
        """Evaluate policy against a fresh adapter-resolved resource identity.

        Evidence is intentionally separate from approval. A valid resource
        binding cannot authorize a mutation on its own.
        """

        if type(evidence) is not AdapterTargetEvidence:
            raise TypeError("evidence must be AdapterTargetEvidence")
        if now is None:
            now = datetime.now(timezone.utc)
        evidence.validate(now=now, max_age=max_age)
        decision = self.evaluate(
            action_class,
            target=evidence.resolved_target,
            approved=approved,
            reversible=reversible,
        )
        return replace(decision, target_evidence=evidence)
