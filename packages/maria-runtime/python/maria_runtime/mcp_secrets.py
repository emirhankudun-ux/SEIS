from __future__ import annotations

import threading
from typing import Mapping, Protocol

from .mcp_config import MCPServerDescriptor
from .mcp_gateway import MCPGatewayEvaluation
from .registry import ToolStatus


class MCPSecretSource(Protocol):
    """Opaque secret lookup boundary.

    Implementations may use macOS Keychain, an OS credential store, a process
    broker, or another approved secure backend. Secret values must never be
    persisted into repository configuration or lifecycle evidence.
    """

    def resolve(self, *, server_name: str, key: str) -> str | None:
        ...


class MCPResolvedEnvironmentLease:
    """One-shot in-memory environment material for a reviewed MCP server.

    Values are deliberately private and omitted from ``repr``. The lease may be
    materialized exactly once for the matching server and then clears its
    internal mapping. Python cannot guarantee physical zeroization of immutable
    strings, so this class minimizes retention rather than claiming zeroization.
    """

    __slots__ = ("server_name", "keys", "_values", "_consumed", "_lock")

    def __init__(self, *, server_name: str, values: Mapping[str, str]) -> None:
        if not server_name.strip():
            raise ValueError("server_name must be non-empty")
        normalized: dict[str, str] = {}
        for key, value in values.items():
            if not isinstance(key, str) or not key.strip():
                raise ValueError("environment keys must be non-empty strings")
            if not isinstance(value, str):
                raise TypeError("environment values must be strings")
            if "\x00" in key or "=" in key:
                raise ValueError("environment key contains an invalid character")
            if "\x00" in value:
                raise ValueError("environment value contains an invalid character")
            normalized[key] = value

        self.server_name = server_name
        self.keys = tuple(sorted(normalized))
        self._values = normalized
        self._consumed = False
        self._lock = threading.Lock()

    @property
    def consumed(self) -> bool:
        with self._lock:
            return self._consumed

    def matches(self, *, server_name: str, keys: tuple[str, ...]) -> bool:
        with self._lock:
            return (
                not self._consumed
                and self.server_name == server_name
                and self.keys == tuple(sorted(keys))
            )

    def materialize_once(self, *, server_name: str) -> dict[str, str]:
        with self._lock:
            if self._consumed:
                raise PermissionError("MCP environment lease has already been consumed")
            if server_name != self.server_name:
                raise PermissionError("MCP environment lease/server identity mismatch")
            materialized = dict(self._values)
            self._values.clear()
            self._consumed = True
            return materialized

    def __repr__(self) -> str:
        return (
            "MCPResolvedEnvironmentLease("
            f"server_name={self.server_name!r}, keys={self.keys!r}, "
            f"consumed={self.consumed!r})"
        )


class MCPEnvironmentResolver:
    """Resolve only descriptor-declared environment keys after gateway approval."""

    def __init__(self, source: MCPSecretSource) -> None:
        self._source = source

    def resolve(
        self,
        descriptor: MCPServerDescriptor,
        evaluation: MCPGatewayEvaluation,
    ) -> MCPResolvedEnvironmentLease:
        if evaluation.tool.name != f"mcp:{descriptor.name}":
            raise PermissionError("MCP environment resolution server mismatch")
        if evaluation.tool.status is not ToolStatus.AVAILABLE or evaluation.blockers:
            raise PermissionError("MCP server is not approved for environment resolution")

        values: dict[str, str] = {}
        for key in descriptor.env_keys:
            try:
                value = self._source.resolve(server_name=descriptor.name, key=key)
            except Exception:
                # Secret backends may include sensitive details in exception text.
                raise LookupError("MCP environment resolution failed") from None
            if value is None or not isinstance(value, str):
                raise LookupError("required MCP environment value is unavailable")
            if "\x00" in value:
                raise LookupError("required MCP environment value is invalid")
            values[key] = value

        return MCPResolvedEnvironmentLease(
            server_name=descriptor.name,
            values=values,
        )
