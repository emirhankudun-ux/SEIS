from __future__ import annotations

from dataclasses import asdict, dataclass
from enum import Enum
from typing import Iterable, Optional


class ProviderStatus(str, Enum):
    """Connection state for a provider integration.

    The default catalog deliberately starts in DISCOVERY_REQUIRED so merely
    naming a provider never implies that credentials, endpoints, models, or
    live service access have been verified.
    """

    DISCOVERY_REQUIRED = "discovery-required"
    AVAILABLE = "available"
    DEGRADED = "degraded"
    AUTH_REQUIRED = "auth-required"
    UNAVAILABLE = "unavailable"
    DISABLED = "disabled"


@dataclass(frozen=True)
class ProviderSpec:
    id: str
    display_name: str
    category: str
    capabilities: tuple[str, ...]
    local: bool = False
    status: ProviderStatus = ProviderStatus.DISCOVERY_REQUIRED
    auth_mode: str = "external-secret-store"
    supports_tool_use: bool = False
    supports_mcp_bridge: bool = False

    def __post_init__(self) -> None:
        if not self.id.strip() or not self.display_name.strip():
            raise ValueError("provider id and display_name are required")
        if not self.category.strip():
            raise ValueError("provider category is required")
        if not self.capabilities:
            raise ValueError("provider must declare at least one capability family")
        if any(not capability.strip() for capability in self.capabilities):
            raise ValueError("provider capabilities must be non-empty strings")


class ProviderRegistry:
    """Metadata-only provider catalog for MARIA × SEIS.

    Provider entries describe intended capability families. They do not make
    network calls and they do not decide a permanent "best" provider. Concrete
    model selection remains the responsibility of ModelRegistry/ModelRouter
    after live discovery has populated verified model metadata.
    """

    def __init__(self, providers: Optional[Iterable[ProviderSpec]] = None) -> None:
        self._providers: dict[str, ProviderSpec] = {}
        for provider in providers or ():
            self.register(provider)

    def register(self, provider: ProviderSpec) -> ProviderSpec:
        if provider.id in self._providers:
            raise ValueError(f"provider already registered: {provider.id}")
        self._providers[provider.id] = provider
        return provider

    def get(self, provider_id: str) -> Optional[ProviderSpec]:
        return self._providers.get(provider_id)

    def all(self) -> list[ProviderSpec]:
        return sorted(self._providers.values(), key=lambda item: item.id)

    def for_capability(self, capability: str) -> list[ProviderSpec]:
        return [
            provider
            for provider in self.all()
            if capability in provider.capabilities
        ]

    def local(self) -> list[ProviderSpec]:
        return [provider for provider in self.all() if provider.local]

    def public_manifest(self) -> list[dict]:
        """Return safe metadata suitable for UI/debug output.

        Secret values and credential field names are intentionally not part of
        ProviderSpec, so they cannot leak through this manifest.
        """

        rows: list[dict] = []
        for provider in self.all():
            row = asdict(provider)
            row["status"] = provider.status.value
            rows.append(row)
        return rows


def default_provider_registry() -> ProviderRegistry:
    """Logical provider families requested for SEIS Intelligence Fabric.

    Capability labels are routing intents, not claims about a currently
    authenticated account or a specific live model/version. Discovery adapters
    must verify real availability before any provider becomes AVAILABLE.
    """

    registry = ProviderRegistry()
    definitions = (
        ProviderSpec(
            id="openai",
            display_name="OpenAI",
            category="cloud-ai",
            capabilities=("chat", "reasoning", "coding", "vision", "tool-use"),
            supports_tool_use=True,
            supports_mcp_bridge=True,
        ),
        ProviderSpec(
            id="codex",
            display_name="Codex",
            category="coding-agent",
            capabilities=("coding", "repo-work", "agentic-engineering"),
            supports_tool_use=True,
            supports_mcp_bridge=True,
        ),
        ProviderSpec(
            id="deepseek",
            display_name="DeepSeek",
            category="cloud-ai",
            capabilities=("chat", "reasoning", "coding"),
        ),
        ProviderSpec(
            id="qwen",
            display_name="Qwen",
            category="model-family",
            capabilities=("chat", "reasoning", "coding", "vision"),
        ),
        ProviderSpec(
            id="gemini",
            display_name="Gemini",
            category="cloud-ai",
            capabilities=("chat", "reasoning", "coding", "vision", "multimodal"),
            supports_tool_use=True,
        ),
        ProviderSpec(
            id="abacus-ai",
            display_name="Abacus AI",
            category="ai-platform",
            capabilities=("chat", "reasoning", "workflow"),
            supports_tool_use=True,
        ),
        ProviderSpec(
            id="ollama",
            display_name="Ollama",
            category="local-runtime",
            capabilities=("local-model-runtime", "chat", "reasoning", "coding"),
            local=True,
        ),
        ProviderSpec(
            id="lm-studio",
            display_name="LM Studio",
            category="local-runtime",
            capabilities=("local-model-runtime", "chat", "reasoning", "coding"),
            local=True,
        ),
    )
    for provider in definitions:
        registry.register(provider)
    return registry
