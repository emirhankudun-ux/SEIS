from __future__ import annotations

from dataclasses import dataclass
import json
from typing import Any

from .registry import ToolSpec, ToolStatus


_SHELL_WRAPPERS = {
    "sh",
    "bash",
    "zsh",
    "fish",
    "powershell",
    "pwsh",
    "cmd",
    "cmd.exe",
}

_SECRET_KEY_MARKERS = (
    "token",
    "secret",
    "key",
    "password",
    "credential",
    "auth",
)


@dataclass(frozen=True)
class MCPServerDescriptor:
    name: str
    command: str
    args: tuple[str, ...]
    env_keys: tuple[str, ...] = ()
    secret_env_keys: tuple[str, ...] = ()
    transport: str = "stdio"
    enabled: bool = False
    requires_review: bool = False
    review_reasons: tuple[str, ...] = ()

    def __post_init__(self) -> None:
        if not self.name.strip():
            raise ValueError("MCP server name is required")
        if not self.command.strip():
            raise ValueError("MCP server command is required")
        if self.transport != "stdio":
            raise ValueError("only stdio MCP import preview is supported in this foundation")
        if self.enabled:
            raise ValueError("import preview cannot enable an unverified MCP server")

    def as_tool_spec(self) -> ToolSpec:
        """Expose a disabled discovery capability without executing the server."""

        return ToolSpec(
            name=f"mcp:{self.name}",
            capabilities=(f"mcp.{self.name}.discover",),
            method_rank=2,
            reliability=0.0,
            latency_ms=0,
            cost=0.0,
            status=ToolStatus.DISABLED,
            version="unverified",
            permissions=("mcp:discover",),
        )


@dataclass(frozen=True)
class MCPImportPreview:
    servers: tuple[MCPServerDescriptor, ...]
    warnings: tuple[str, ...] = ()


class MCPConfigImporter:
    """Parse MCP JSON into a redacted, non-executable review preview.

    This foundation intentionally does not launch processes, resolve secrets,
    write configuration files, or mark imported servers healthy. It only
    validates structure and returns descriptors safe enough for review/UI use.
    """

    def preview_json(self, raw_json: str) -> MCPImportPreview:
        try:
            document = json.loads(raw_json)
        except json.JSONDecodeError as exc:
            raise ValueError(f"invalid MCP JSON: {exc.msg}") from exc
        return self.preview_dict(document)

    def preview_dict(self, document: Any) -> MCPImportPreview:
        if not isinstance(document, dict):
            raise ValueError("MCP configuration root must be an object")

        servers = document.get("mcpServers")
        if not isinstance(servers, dict):
            raise ValueError("mcpServers must be an object")

        descriptors: list[MCPServerDescriptor] = []
        warnings: list[str] = []
        for name in sorted(servers):
            payload = servers[name]
            if not isinstance(name, str) or not name.strip():
                raise ValueError("MCP server names must be non-empty strings")
            if not isinstance(payload, dict):
                raise ValueError(f"MCP server {name!r} must be an object")

            command = payload.get("command")
            if not isinstance(command, str) or not command.strip():
                raise ValueError(f"MCP server {name!r} requires a command")

            args_raw = payload.get("args", [])
            if not isinstance(args_raw, list) or any(not isinstance(arg, str) for arg in args_raw):
                raise ValueError(f"MCP server {name!r} args must be an array of strings")

            env_raw = payload.get("env", {})
            if not isinstance(env_raw, dict) or any(not isinstance(key, str) for key in env_raw):
                raise ValueError(f"MCP server {name!r} env must be an object with string keys")

            env_keys = tuple(sorted(env_raw))
            secret_env_keys = tuple(
                key
                for key in env_keys
                if self._looks_secret(key)
            )

            reasons: list[str] = []
            executable = command.replace("\\", "/").rsplit("/", 1)[-1].lower()
            if executable in _SHELL_WRAPPERS:
                reasons.append("shell-wrapper")
            if any(marker in command for marker in (";", "&&", "||", "|", ">", "<", "`")):
                reasons.append("command-shell-syntax")

            transport = payload.get("transport", "stdio")
            if transport != "stdio":
                raise ValueError(
                    f"MCP server {name!r} uses unsupported transport {transport!r}; "
                    "only stdio preview is supported"
                )

            descriptor = MCPServerDescriptor(
                name=name,
                command=command,
                args=tuple(args_raw),
                env_keys=env_keys,
                secret_env_keys=secret_env_keys,
                transport=transport,
                enabled=False,
                requires_review=bool(reasons),
                review_reasons=tuple(reasons),
            )
            descriptors.append(descriptor)

            if secret_env_keys:
                warnings.append(
                    f"{name}: {len(secret_env_keys)} secret-like environment key(s) require secure resolution"
                )
            if reasons:
                warnings.append(f"{name}: manual review required ({', '.join(reasons)})")

        return MCPImportPreview(
            servers=tuple(descriptors),
            warnings=tuple(warnings),
        )

    @staticmethod
    def _looks_secret(key: str) -> bool:
        lowered = key.lower()
        return any(marker in lowered for marker in _SECRET_KEY_MARKERS)
