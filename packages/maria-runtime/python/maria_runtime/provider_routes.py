from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
import hashlib
import json
import re

from .routing import ModelRouteDecision


_LABEL_MAX = 128
_FINGERPRINT = re.compile(r"sha256:[0-9a-f]{64}")


class ProviderRetention(str, Enum):
    """Declared endpoint retention posture; UNKNOWN is never privacy-eligible."""

    NONE = "none"
    TRANSIENT = "transient"
    PERSISTENT = "persistent"
    UNKNOWN = "unknown"


class ProviderTrainingUse(str, Enum):
    """Declared provider use of request data for model training."""

    DENIED = "denied"
    ALLOWED = "allowed"
    UNKNOWN = "unknown"


class ProviderRoutePrivacyReason(str, Enum):
    """Stable first-blocker codes for descriptive provider-route checks."""

    ELIGIBLE = "eligible"
    ROUTE_NOT_SELECTED = "route_not_selected"
    ROUTE_IDENTITY_MISMATCH = "route_identity_mismatch"
    LOCALITY_MISMATCH = "locality_mismatch"
    PROCESSOR_NOT_ALLOWED = "processor_not_allowed"
    REGION_NOT_ALLOWED = "region_not_allowed"
    RETENTION_NOT_ALLOWED = "retention_not_allowed"
    TRAINING_NOT_ALLOWED = "training_not_allowed"
    ZDR_REQUIRED = "zdr_required"
    FALLBACK_NOT_ALLOWED = "fallback_not_allowed"


_MESSAGES = {
    ProviderRoutePrivacyReason.ELIGIBLE:
        "The configured route manifest satisfies the supplied privacy policy; execution is not authorized.",
    ProviderRoutePrivacyReason.ROUTE_NOT_SELECTED:
        "No model route was selected, so provider-route privacy cannot be established.",
    ProviderRoutePrivacyReason.ROUTE_IDENTITY_MISMATCH:
        "The route manifest does not bind to the selected configured model identity.",
    ProviderRoutePrivacyReason.LOCALITY_MISMATCH:
        "The route manifest locality does not match the selected configured model.",
    ProviderRoutePrivacyReason.PROCESSOR_NOT_ALLOWED:
        "The resolved processor chain is outside the privacy policy allowlist.",
    ProviderRoutePrivacyReason.REGION_NOT_ALLOWED:
        "The resolved processing region is outside the privacy policy allowlist.",
    ProviderRoutePrivacyReason.RETENTION_NOT_ALLOWED:
        "The route retention posture is unknown or exceeds the privacy policy.",
    ProviderRoutePrivacyReason.TRAINING_NOT_ALLOWED:
        "The route training posture is unknown or exceeds the privacy policy.",
    ProviderRoutePrivacyReason.ZDR_REQUIRED:
        "The privacy policy requires zero-data-retention evidence for this route.",
    ProviderRoutePrivacyReason.FALLBACK_NOT_ALLOWED:
        "The resolved route used fallback while the privacy policy forbids it.",
}

_RETENTION_RANK = {
    ProviderRetention.NONE: 0,
    ProviderRetention.TRANSIENT: 1,
    ProviderRetention.PERSISTENT: 2,
}


def _label(value: object, name: str) -> str:
    if type(value) is not str:
        raise TypeError(f"{name} must be a string")
    if not 1 <= len(value) <= _LABEL_MAX or value != value.strip() or not value.isprintable():
        raise ValueError(f"{name} must be a bounded nonempty printable label")
    return value


def _labels(value: object, name: str) -> tuple[str, ...]:
    if type(value) is not tuple:
        raise TypeError(f"{name} must be a tuple")
    if not value:
        raise ValueError(f"{name} must not be empty")
    checked = tuple(_label(item, name) for item in value)
    if len(set(checked)) != len(checked):
        raise ValueError(f"{name} must not contain duplicates")
    return checked


def _exact_bool(value: object, name: str) -> bool:
    if type(value) is not bool:
        raise TypeError(f"{name} must be a boolean")
    return value


def _fingerprint(payload: dict[str, object]) -> str:
    canonical = json.dumps(payload, ensure_ascii=True, sort_keys=True, separators=(",", ":"))
    return "sha256:" + hashlib.sha256(canonical.encode("utf-8")).hexdigest()


@dataclass(frozen=True)
class ProviderPrivacyPolicy:
    """Host-supplied privacy envelope for one prospective provider route.

    This is configuration, not proof that an endpoint actually follows the
    declared policy and not authorization to send data.
    """

    allowed_processors: tuple[str, ...]
    allowed_regions: tuple[str, ...]
    maximum_retention: ProviderRetention
    allow_training: bool
    require_zero_data_retention: bool
    allow_fallback: bool

    def __post_init__(self) -> None:
        object.__setattr__(self, "allowed_processors", _labels(self.allowed_processors, "allowed_processors"))
        object.__setattr__(self, "allowed_regions", _labels(self.allowed_regions, "allowed_regions"))
        if type(self.maximum_retention) is not ProviderRetention:
            raise TypeError("maximum_retention must be ProviderRetention")
        _exact_bool(self.allow_training, "allow_training")
        _exact_bool(self.require_zero_data_retention, "require_zero_data_retention")
        _exact_bool(self.allow_fallback, "allow_fallback")

    def fingerprint(self) -> str:
        """Fingerprint security semantics without exposing policy labels in summaries."""
        return _fingerprint({
            "schema": "maria.provider-privacy-policy.v1",
            "allowed_processors": sorted(self.allowed_processors),
            "allowed_regions": sorted(self.allowed_regions),
            "maximum_retention": self.maximum_retention.value,
            "allow_training": self.allow_training,
            "require_zero_data_retention": self.require_zero_data_retention,
            "allow_fallback": self.allow_fallback,
        })


@dataclass(frozen=True)
class ProviderRouteManifest:
    """Immutable host assertion describing the route intended for execution.

    The manifest is not endpoint attestation. A future effect boundary must
    re-resolve the actual route, compare fingerprints and obtain independent
    execution authorization immediately before sending data.
    """

    requested_provider: str
    requested_model: str
    resolved_provider: str
    resolved_model: str
    processor_chain: tuple[str, ...]
    region: str
    retention: ProviderRetention
    training_use: ProviderTrainingUse
    zero_data_retention: bool
    fallback_used: bool
    local: bool
    policy_revision: str

    def __post_init__(self) -> None:
        for name in (
            "requested_provider", "requested_model", "resolved_provider",
            "resolved_model", "region", "policy_revision",
        ):
            _label(getattr(self, name), name)
        object.__setattr__(self, "processor_chain", _labels(self.processor_chain, "processor_chain"))
        if self.requested_provider not in self.processor_chain:
            raise ValueError("requested_provider must be represented in processor_chain")
        if self.resolved_provider not in self.processor_chain:
            raise ValueError("resolved_provider must be represented in processor_chain")
        if type(self.retention) is not ProviderRetention:
            raise TypeError("retention must be ProviderRetention")
        if type(self.training_use) is not ProviderTrainingUse:
            raise TypeError("training_use must be ProviderTrainingUse")
        _exact_bool(self.zero_data_retention, "zero_data_retention")
        _exact_bool(self.fallback_used, "fallback_used")
        _exact_bool(self.local, "local")

    def fingerprint(self) -> str:
        """Fingerprint the complete declared route so drift becomes detectable."""
        return _fingerprint({
            "schema": "maria.provider-route-manifest.v1",
            "requested_provider": self.requested_provider,
            "requested_model": self.requested_model,
            "resolved_provider": self.resolved_provider,
            "resolved_model": self.resolved_model,
            "processor_chain": list(self.processor_chain),
            "region": self.region,
            "retention": self.retention.value,
            "training_use": self.training_use.value,
            "zero_data_retention": self.zero_data_retention,
            "fallback_used": self.fallback_used,
            "local": self.local,
            "policy_revision": self.policy_revision,
        })


@dataclass(frozen=True)
class ProviderRoutePrivacyDecision:
    """Descriptive privacy result; never a network/effect capability token."""

    reason: ProviderRoutePrivacyReason
    sensitive: bool
    policy_fingerprint: str
    route_fingerprint: str
    route_local: bool
    fallback_used: bool
    execution_authorized: bool = field(default=False, init=False)

    def __post_init__(self) -> None:
        if type(self.reason) is not ProviderRoutePrivacyReason:
            raise TypeError("reason must be ProviderRoutePrivacyReason")
        _exact_bool(self.sensitive, "sensitive")
        _exact_bool(self.route_local, "route_local")
        _exact_bool(self.fallback_used, "fallback_used")
        for value, name in (
            (self.policy_fingerprint, "policy_fingerprint"),
            (self.route_fingerprint, "route_fingerprint"),
        ):
            if type(value) is not str or _FINGERPRINT.fullmatch(value) is None:
                raise ValueError(f"{name} must be a canonical sha256 fingerprint")

    @property
    def privacy_eligible(self) -> bool:
        return self.reason is ProviderRoutePrivacyReason.ELIGIBLE

    def matches_current(self, manifest: ProviderRouteManifest, policy: ProviderPrivacyPolicy) -> bool:
        """Invalidate reuse when route or policy security semantics change."""
        if type(manifest) is not ProviderRouteManifest or type(policy) is not ProviderPrivacyPolicy:
            raise TypeError("current route and policy must use canonical provider-route contracts")
        return (
            self.privacy_eligible
            and self.route_fingerprint == manifest.fingerprint()
            and self.policy_fingerprint == policy.fingerprint()
        )

    def to_dict(self) -> dict[str, object]:
        """Return an identifier-free summary suitable for controlled diagnostics."""
        return {
            "schema_version": "maria.provider-route-privacy.v1",
            "outcome": "eligible" if self.privacy_eligible else "blocked",
            "reason": self.reason.value,
            "message": _MESSAGES[self.reason],
            "privacy_mode": "local-only" if self.sensitive else "standard",
            "route_scope": "local" if self.route_local else "remote",
            "fallback_used": self.fallback_used,
            "policy_fingerprint": self.policy_fingerprint,
            "route_fingerprint": self.route_fingerprint,
            "evidence_basis": "configured-route-manifest-only",
            "execution_authorized": False,
        }


def evaluate_provider_route_privacy(
    route: ModelRouteDecision,
    manifest: ProviderRouteManifest,
    policy: ProviderPrivacyPolicy,
) -> ProviderRoutePrivacyDecision:
    """Bind a selected model route to explicit provider privacy constraints.

    The function is deterministic and side-effect-free. It does not verify
    provider claims, read secrets, perform discovery, contact an endpoint or
    authorize execution. The first failed gate is returned for diagnostics.
    """
    if type(route) is not ModelRouteDecision:
        raise TypeError("route must be ModelRouteDecision")
    if type(manifest) is not ProviderRouteManifest:
        raise TypeError("manifest must be ProviderRouteManifest")
    if type(policy) is not ProviderPrivacyPolicy:
        raise TypeError("policy must be ProviderPrivacyPolicy")

    policy_fingerprint = policy.fingerprint()
    route_fingerprint = manifest.fingerprint()

    def result(reason: ProviderRoutePrivacyReason) -> ProviderRoutePrivacyDecision:
        return ProviderRoutePrivacyDecision(
            reason=reason,
            sensitive=route.sensitive,
            policy_fingerprint=policy_fingerprint,
            route_fingerprint=route_fingerprint,
            route_local=manifest.local,
            fallback_used=manifest.fallback_used,
        )

    if route.model is None:
        return result(ProviderRoutePrivacyReason.ROUTE_NOT_SELECTED)
    if (
        route.model.provider != manifest.requested_provider
        or route.model.name != manifest.requested_model
        or route.model.name != manifest.resolved_model
    ):
        return result(ProviderRoutePrivacyReason.ROUTE_IDENTITY_MISMATCH)
    if route.model.local is not manifest.local:
        return result(ProviderRoutePrivacyReason.LOCALITY_MISMATCH)
    if any(processor not in policy.allowed_processors for processor in manifest.processor_chain):
        return result(ProviderRoutePrivacyReason.PROCESSOR_NOT_ALLOWED)
    if manifest.region not in policy.allowed_regions:
        return result(ProviderRoutePrivacyReason.REGION_NOT_ALLOWED)
    if (
        manifest.retention is ProviderRetention.UNKNOWN
        or policy.maximum_retention is ProviderRetention.UNKNOWN
        or _RETENTION_RANK[manifest.retention] > _RETENTION_RANK[policy.maximum_retention]
    ):
        return result(ProviderRoutePrivacyReason.RETENTION_NOT_ALLOWED)
    if (
        manifest.training_use is ProviderTrainingUse.UNKNOWN
        or (manifest.training_use is ProviderTrainingUse.ALLOWED and not policy.allow_training)
    ):
        return result(ProviderRoutePrivacyReason.TRAINING_NOT_ALLOWED)
    if policy.require_zero_data_retention and not manifest.zero_data_retention:
        return result(ProviderRoutePrivacyReason.ZDR_REQUIRED)
    if manifest.fallback_used and not policy.allow_fallback:
        return result(ProviderRoutePrivacyReason.FALLBACK_NOT_ALLOWED)
    return result(ProviderRoutePrivacyReason.ELIGIBLE)
