from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any

from .provider_discovery import ModelDiscoveryFact


_OLLAMA_ROUTING_CAPABILITY_MAP: dict[str, str] = {
    "completion": "chat",
    "embedding": "embedding",
    "insert": "fill-in-middle",
    "thinking": "reasoning",
    "tools": "tool-use",
    "vision": "vision",
}


def _ollama_routing_capabilities(declared: tuple[str, ...]) -> tuple[str, ...]:
    """Map only explicit Ollama declarations into SEIS routing capabilities.

    Unknown provider-native labels are deliberately omitted from routing while
    remaining present in the discovery fact's native ``capabilities`` evidence.
    No model-name, family-name, parameter-size, or publisher heuristics are used.
    """

    return tuple(sorted({
        canonical
        for native in declared
        if (canonical := _OLLAMA_ROUTING_CAPABILITY_MAP.get(native)) is not None
    }))


@dataclass(frozen=True)
class LocalModelCandidate:
    """A local model identity discovered before capability verification.

    Candidates are intentionally not routable `ModelSpec` records. They only
    carry inventory metadata that can be used to request a deeper, bounded
    metadata probe such as Ollama `/api/show`.
    """

    provider_id: str
    name: str
    digest: str
    size_bytes: int
    modified_at: str


class LMStudioV1DiscoverySource:
    """Parse a successful LM Studio `/api/v1/models` response into redacted facts.

    Network I/O remains outside this class. Callers must supply measured latency
    and a reliability observation from the surrounding health/evidence layer.
    """

    def parse_models(
        self,
        payload: Mapping[str, Any],
        *,
        latency_ms: int,
        reliability: float,
    ) -> tuple[ModelDiscoveryFact, ...]:
        models = payload.get("models")
        if not isinstance(models, list):
            raise ValueError("LM Studio models response must contain a models list")

        facts: list[ModelDiscoveryFact] = []
        for item in models:
            if not isinstance(item, Mapping):
                raise ValueError("LM Studio model entry must be an object")
            if item.get("type") != "llm":
                continue

            name = item.get("key")
            context_size = item.get("max_context_length")
            if not isinstance(name, str) or not name.strip():
                raise ValueError("LM Studio LLM entry requires a non-empty key")
            if not isinstance(context_size, int) or context_size <= 0:
                raise ValueError("LM Studio LLM entry requires max_context_length")

            capabilities = {"chat"}
            declared = item.get("capabilities")
            if declared is not None:
                if not isinstance(declared, Mapping):
                    raise ValueError("LM Studio capabilities must be an object")
                if declared.get("vision") is True:
                    capabilities.add("vision")
                if declared.get("trained_for_tool_use") is True:
                    capabilities.add("tool-use")
                reasoning = declared.get("reasoning")
                if reasoning is not None:
                    if not isinstance(reasoning, Mapping):
                        raise ValueError("LM Studio reasoning capability must be an object")
                    capabilities.add("reasoning")

            facts.append(ModelDiscoveryFact(
                provider_id="lm-studio",
                name=name,
                capabilities=tuple(sorted(capabilities)),
                context_size=context_size,
                reliability=reliability,
                latency_ms=latency_ms,
                input_cost_per_million=0.0,
                output_cost_per_million=0.0,
                local=True,
                verified=True,
                reachable=True,
            ))

        return tuple(facts)


class OllamaTagsDiscoverySource:
    """Parse Ollama `/api/tags` into non-routable local model candidates."""

    def parse_models(self, payload: Mapping[str, Any]) -> tuple[LocalModelCandidate, ...]:
        models = payload.get("models")
        if not isinstance(models, list):
            raise ValueError("Ollama tags response must contain a models list")

        candidates: list[LocalModelCandidate] = []
        seen_names: set[str] = set()
        for item in models:
            if not isinstance(item, Mapping):
                raise ValueError("Ollama tags model entry must be an object")

            name = item.get("name")
            model = item.get("model")
            digest = item.get("digest")
            size_bytes = item.get("size")
            modified_at = item.get("modified_at")

            if not isinstance(name, str) or not name.strip():
                raise ValueError("Ollama tags entry requires a non-empty name")
            normalized_name = name.strip()
            if not isinstance(model, str) or model.strip() != normalized_name:
                raise ValueError("Ollama tags entry model must match name")
            if not isinstance(digest, str) or not digest.strip():
                raise ValueError("Ollama tags entry requires a non-empty digest")
            if isinstance(size_bytes, bool) or not isinstance(size_bytes, int) or size_bytes <= 0:
                raise ValueError("Ollama tags entry requires a positive size")
            if not isinstance(modified_at, str) or not modified_at.strip():
                raise ValueError("Ollama tags entry requires modified_at")
            if normalized_name in seen_names:
                raise ValueError(f"duplicate Ollama model candidate: {normalized_name}")
            seen_names.add(normalized_name)

            candidates.append(LocalModelCandidate(
                provider_id="ollama",
                name=normalized_name,
                digest=digest.strip(),
                size_bytes=size_bytes,
                modified_at=modified_at.strip(),
            ))

        return tuple(sorted(candidates, key=lambda item: item.name))


class OllamaShowDiscoverySource:
    """Parse one successful Ollama `/api/show` response into a redacted fact."""

    def parse_model(
        self,
        model_name: str,
        payload: Mapping[str, Any],
        *,
        latency_ms: int,
        reliability: float,
    ) -> ModelDiscoveryFact:
        if not model_name.strip():
            raise ValueError("Ollama model name must be non-empty")

        model_info = payload.get("model_info")
        if not isinstance(model_info, Mapping):
            raise ValueError("Ollama show response must contain model_info")

        context_lengths = [
            value
            for key, value in model_info.items()
            if isinstance(key, str)
            and key.endswith(".context_length")
            and isinstance(value, int)
            and value > 0
        ]
        if not context_lengths:
            raise ValueError("Ollama show response does not report a context length")

        declared = payload.get("capabilities")
        if not isinstance(declared, list) or not declared:
            raise ValueError("Ollama show response must report capabilities")
        if any(not isinstance(item, str) or not item.strip() for item in declared):
            raise ValueError("Ollama capabilities must be non-empty strings")

        native_capabilities = tuple(sorted(set(declared)))
        routing_capabilities = _ollama_routing_capabilities(native_capabilities)

        return ModelDiscoveryFact(
            provider_id="ollama",
            name=model_name,
            capabilities=native_capabilities,
            routing_capabilities=routing_capabilities,
            context_size=max(context_lengths),
            reliability=reliability,
            latency_ms=latency_ms,
            input_cost_per_million=0.0,
            output_cost_per_million=0.0,
            local=True,
            verified=True,
            reachable=True,
        )
