from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from .permissions import ActionClass, PermissionDecision, ResolvedTargetEvidence


PERMISSION_AUDIT_SCHEMA_VERSION = "maria.permission-audit.v1"


def _utc_timestamp(value: datetime) -> str:
    """Return an RFC 3339/JSON-friendly UTC timestamp with a stable Z suffix."""

    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def _exact_text(value: object) -> bool:
    return (
        type(value) is str
        and bool(value)
        and value == value.strip()
        and not any(ord(character) < 0x20 or ord(character) == 0x7F for character in value)
    )


def _decision_is_canonical(decision: PermissionDecision) -> bool:
    if type(decision.action_class) is not ActionClass:
        return False
    if not _exact_text(decision.target) or not _exact_text(decision.reason):
        return False
    if type(decision.allowed) is not bool or type(decision.requires_approval) is not bool:
        return False
    if decision.reversible is not None and type(decision.reversible) is not bool:
        return False

    evidence = decision.target_evidence
    if evidence is None:
        return True
    if type(evidence) is not ResolvedTargetEvidence:
        return False
    if not _exact_text(evidence.target) or not _exact_text(evidence.source):
        return False
    if type(evidence.observed_at) is not datetime:
        return False
    if evidence.observed_at.tzinfo is None or evidence.observed_at.utcoffset() is None:
        return False
    return type(evidence.verified) is bool


def permission_decision_audit_envelope(decision: PermissionDecision) -> dict[str, Any]:
    """Serialize one immutable permission decision into a shared audit envelope.

    This function is intentionally side-effect free. The returned mapping is
    descriptive audit context only: it does not authorize execution, persist
    data, revalidate evidence, contact a provider, or make the payload safe for
    durable logging. Hosts remain responsible for classification/redaction at
    their persistence boundary.
    """

    if type(decision) is not PermissionDecision:
        raise TypeError("decision must be PermissionDecision")
    if not _decision_is_canonical(decision):
        raise TypeError("permission decision is not canonical")

    evidence = decision.target_evidence
    serialized_evidence: dict[str, Any] | None = None
    if evidence is not None:
        serialized_evidence = {
            "target": evidence.target,
            "source": evidence.source,
            "observedAt": _utc_timestamp(evidence.observed_at),
            "verified": evidence.verified,
        }

    return {
        "schemaVersion": PERMISSION_AUDIT_SCHEMA_VERSION,
        "actionClass": decision.action_class.value,
        "target": decision.target,
        "allowed": decision.allowed,
        "requiresApproval": decision.requires_approval,
        "reason": decision.reason,
        "reversible": decision.reversible,
        "targetEvidence": serialized_evidence,
    }
