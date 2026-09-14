from __future__ import annotations

from dataclasses import dataclass
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


@dataclass(frozen=True)
class PermissionDecision:
    action_class: ActionClass
    target: str
    allowed: bool
    requires_approval: bool
    reason: str
    reversible: Optional[bool]


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
        if not target.strip():
            raise ValueError("permission target must be non-empty")
        if not isinstance(action_class, ActionClass):
            action_class = ActionClass(action_class)
        if type(approved) is not bool:
            raise TypeError("approved must be bool")

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
