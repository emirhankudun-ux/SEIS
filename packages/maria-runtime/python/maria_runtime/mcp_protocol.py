from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any, Mapping


MCP_MODERN_PROTOCOL_VERSION = "2026-07-28"
MCP_LEGACY_PROTOCOL_VERSION = "2025-11-25"

_DEFAULT_MODERN_VERSIONS = (MCP_MODERN_PROTOCOL_VERSION,)
_DEFAULT_LEGACY_VERSIONS = (
    MCP_LEGACY_PROTOCOL_VERSION,
    "2025-06-18",
    "2025-03-26",
    "2024-11-05",
)


class MCPProtocolEra(str, Enum):
    MODERN = "modern"
    LEGACY = "legacy"


@dataclass(frozen=True)
class MCPProtocolProbe:
    era: MCPProtocolEra
    protocol_version: str
    request: Mapping[str, Any]
    timeout_ms: int


@dataclass(frozen=True)
class MCPProtocolDecision:
    era: MCPProtocolEra
    protocol_version: str
    fallback_used: bool
    reason: str


class MCPProtocolNegotiator:
    """Plan MCP stdio lifecycle negotiation without launching a process.

    MCP 2026-07-28 uses the modern, stateless lifecycle: clients SHOULD probe
    stdio servers with ``server/discover`` and carry protocol/client metadata on
    each request. Older protocol revisions use the legacy ``initialize``
    handshake. This class keeps that era decision deterministic and isolated
    from process authority.

    A discovery result proves the server understands the modern era. In that
    case, lack of a mutually supported modern version fails closed rather than
    silently downgrading. Timeouts and ordinary JSON-RPC errors may fall back to
    the latest configured legacy revision, matching the stdio compatibility
    rules for pre-2026 servers.
    """

    def __init__(
        self,
        *,
        client_name: str,
        client_version: str,
        discovery_timeout_ms: int = 5_000,
        modern_versions: tuple[str, ...] = _DEFAULT_MODERN_VERSIONS,
        legacy_versions: tuple[str, ...] = _DEFAULT_LEGACY_VERSIONS,
    ) -> None:
        if not client_name.strip():
            raise ValueError("client_name must be non-empty")
        if not client_version.strip():
            raise ValueError("client_version must be non-empty")
        if discovery_timeout_ms <= 0:
            raise ValueError("discovery_timeout_ms must be positive")
        self._validate_versions("modern_versions", modern_versions)
        self._validate_versions("legacy_versions", legacy_versions)

        self._client_name = client_name
        self._client_version = client_version
        self._discovery_timeout_ms = discovery_timeout_ms
        self._modern_versions = modern_versions
        self._legacy_versions = legacy_versions

    def discovery_probe(self, *, request_id: str | int = "seis-discover-1") -> MCPProtocolProbe:
        preferred = self._modern_versions[0]
        request = {
            "jsonrpc": "2.0",
            "id": request_id,
            "method": "server/discover",
            "params": {
                "_meta": self.modern_request_meta(protocol_version=preferred),
            },
        }
        return MCPProtocolProbe(
            era=MCPProtocolEra.MODERN,
            protocol_version=preferred,
            request=request,
            timeout_ms=self._discovery_timeout_ms,
        )

    def modern_request_meta(self, *, protocol_version: str | None = None) -> dict[str, Any]:
        version = protocol_version or self._modern_versions[0]
        if version not in self._modern_versions:
            raise ValueError("protocol_version is not in configured modern_versions")
        return {
            "io.modelcontextprotocol/protocolVersion": version,
            "io.modelcontextprotocol/clientInfo": {
                "name": self._client_name,
                "version": self._client_version,
            },
            "io.modelcontextprotocol/clientCapabilities": {},
        }

    def decide_after_probe(self, response: Mapping[str, Any] | None) -> MCPProtocolDecision:
        if response is None:
            return self._legacy_decision("probe-timeout")
        if not isinstance(response, Mapping):
            raise ValueError("probe response must be a JSON object or None")

        result = response.get("result")
        if isinstance(result, Mapping):
            supported = self._version_list(result.get("supportedVersions"), field="supportedVersions")
            selected = self._select_preferred(self._modern_versions, supported)
            if selected is None:
                raise LookupError("modern MCP server has no mutually supported modern protocol version")
            return MCPProtocolDecision(
                era=MCPProtocolEra.MODERN,
                protocol_version=selected,
                fallback_used=False,
                reason="discover-result",
            )

        error = response.get("error")
        if isinstance(error, Mapping):
            data = error.get("data")
            if isinstance(data, Mapping) and "supported" in data:
                supported = self._version_list(data.get("supported"), field="error.data.supported")
                selected = self._select_preferred(self._modern_versions, supported)
                if selected is not None:
                    return MCPProtocolDecision(
                        era=MCPProtocolEra.MODERN,
                        protocol_version=selected,
                        fallback_used=False,
                        reason="modern-version-error",
                    )
            return self._legacy_decision("legacy-probe-error")

        raise ValueError("probe response must contain either result or error")

    def legacy_initialize_request(
        self,
        *,
        request_id: str | int = "seis-initialize-1",
        protocol_version: str | None = None,
    ) -> dict[str, Any]:
        version = protocol_version or self._legacy_versions[0]
        if version not in self._legacy_versions:
            raise ValueError("protocol_version is not in configured legacy_versions")
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "method": "initialize",
            "params": {
                "protocolVersion": version,
                "capabilities": {},
                "clientInfo": {
                    "name": self._client_name,
                    "version": self._client_version,
                },
            },
        }

    def _legacy_decision(self, reason: str) -> MCPProtocolDecision:
        return MCPProtocolDecision(
            era=MCPProtocolEra.LEGACY,
            protocol_version=self._legacy_versions[0],
            fallback_used=True,
            reason=reason,
        )

    @staticmethod
    def _select_preferred(preferred: tuple[str, ...], supported: tuple[str, ...]) -> str | None:
        supported_set = set(supported)
        return next((version for version in preferred if version in supported_set), None)

    @staticmethod
    def _version_list(value: Any, *, field: str) -> tuple[str, ...]:
        if not isinstance(value, list) or not value:
            raise ValueError(f"{field} must be a non-empty array")
        if any(not isinstance(item, str) or not item.strip() for item in value):
            raise ValueError(f"{field} entries must be non-empty strings")
        return tuple(value)

    @staticmethod
    def _validate_versions(name: str, versions: tuple[str, ...]) -> None:
        if not versions or any(not isinstance(version, str) or not version.strip() for version in versions):
            raise ValueError(f"{name} must contain non-empty protocol version strings")
        if len(set(versions)) != len(versions):
            raise ValueError(f"{name} cannot contain duplicates")
