from __future__ import annotations

from dataclasses import dataclass
import json
import math
import time
from typing import Any, Callable

from .local_model_transport import (
    HARD_MAX_REQUEST_BYTES, HARD_MAX_RESPONSE_BYTES, HARD_MAX_TIMEOUT_MS,
    LocalModelRequest, LocalModelResponse, LocalModelTransport,
    LoopbackModelHTTPTransport, _bounded_int,
)
from .model_work_runner import ModelAdapterResult, ModelWorkInput
from .models import ModelSpec


@dataclass(frozen=True)
class LocalModelLimits:
    """Per-call ceilings, independent of the model's advertised maximum context."""

    max_request_bytes: int = 262_144
    max_response_bytes: int = 1_048_576
    max_context_tokens: int = 8_192
    max_timeout_ms: int = 120_000

    def __post_init__(self) -> None:
        for name, maximum in (
            ("max_request_bytes", HARD_MAX_REQUEST_BYTES),
            ("max_response_bytes", HARD_MAX_RESPONSE_BYTES),
            ("max_context_tokens", 65_536),
            ("max_timeout_ms", HARD_MAX_TIMEOUT_MS),
        ):
            if not _bounded_int(getattr(self, name), maximum):
                raise ValueError(f"{name} must be a positive integer within its hard ceiling")


class _Rejected(ValueError):
    """Internal fixed vocabulary only. Never initialized with provider text."""


def _unique_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise _Rejected("invalid-response")
        result[key] = value
    return result


def _reject_constant(_value: str) -> None:
    raise _Rejected("invalid-response")


def _token_count(value: object) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise _Rejected("invalid-response")
    return value


class _LocalChatAdapter:
    """Text cognition only. Does not grant or execute any tool capability.

    Injected transports/clocks are trusted host code, not a Python sandbox.
    The default transport enforces the actual socket deadline; a late injected
    transport result is rejected, but arbitrary injected Python cannot be killed.
    """

    PROVIDER_ID: str
    DEFAULT_PORT: int

    def __init__(
        self, *, port: int | None = None,
        limits: LocalModelLimits | None = None,
        transport: LocalModelTransport | None = None,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self._port = self.DEFAULT_PORT if port is None else port
        if not _bounded_int(self._port, 65_535):
            raise ValueError("local inference port must be between 1 and 65535")
        self._limits = LocalModelLimits() if limits is None else limits
        if not isinstance(self._limits, LocalModelLimits):
            raise TypeError("limits must be LocalModelLimits")
        self._transport = LoopbackModelHTTPTransport() if transport is None else transport
        if not callable(self._transport) or not callable(clock):
            raise TypeError("transport and clock must be callable")
        self._clock = clock

    def invoke(
        self, model: ModelSpec, work_input: ModelWorkInput, *,
        timeout_ms: int, max_output_tokens: int,
    ) -> ModelAdapterResult:
        try:
            request, context_limit = self._request(model, work_input, timeout_ms, max_output_tokens)
        except _Rejected as exc:
            return ModelAdapterResult.failure(str(exc))
        except (TypeError, ValueError, UnicodeError, RecursionError):
            return ModelAdapterResult.failure("invalid-model-input")

        try:
            started = self._clock()
            received = self._transport(request)
            elapsed = self._clock() - started
            if not math.isfinite(elapsed) or elapsed < 0:
                return ModelAdapterResult.failure("transport-failure")
            if elapsed * 1000 >= timeout_ms:
                return ModelAdapterResult.failure("timeout", retryable=True)
        except TimeoutError:
            return ModelAdapterResult.failure("timeout", retryable=True)
        except Exception:
            # Never retain exception messages, URLs, HTTP bodies, or prompts.
            return ModelAdapterResult.failure("transport-failure", retryable=True)

        try:
            payload = self._payload(received)
            if payload.get("model") != model.name:
                raise _Rejected("model-mismatch")
            if "error" in payload:
                raise _Rejected("provider-failure")
            message, input_tokens, output_tokens = self._completion(payload)
            if output_tokens > max_output_tokens:
                raise _Rejected("output-budget-exceeded")
            if input_tokens + output_tokens > context_limit:
                raise _Rejected("context-budget-exceeded")
            return ModelAdapterResult.success(message, input_tokens=input_tokens, output_tokens=output_tokens)
        except _Rejected as exc:
            category = str(exc)
            return ModelAdapterResult.failure(category, retryable=category in (
                "timeout", "rate-limited", "temporarily-unavailable",
            ))
        except (TypeError, ValueError, KeyError, UnicodeError, RecursionError):
            return ModelAdapterResult.failure("invalid-response")

    def _request(
        self, model: ModelSpec, work_input: ModelWorkInput,
        timeout_ms: int, max_output_tokens: int,
    ) -> tuple[LocalModelRequest, int]:
        if (not isinstance(model, ModelSpec) or model.provider != self.PROVIDER_ID
                or model.local is not True or model.available is not True
                or not isinstance(model.capabilities, tuple) or "chat" not in model.capabilities
                or isinstance(model.context_size, bool) or not isinstance(model.context_size, int)
                or model.context_size <= 0 or not isinstance(model.name, str)
                or not model.name or model.name != model.name.strip() or len(model.name) > 512
                or any(ord(char) < 32 or ord(char) == 127 for char in model.name)):
            raise _Rejected("policy-rejected")
        if (not _bounded_int(timeout_ms, self._limits.max_timeout_ms)
                or not _bounded_int(max_output_tokens, 65_536)):
            raise _Rejected("policy-rejected")
        if (not isinstance(work_input, ModelWorkInput)
                or not _bounded_int(work_input.estimated_input_tokens, 65_536)):
            raise _Rejected("invalid-model-input")
        context_limit = min(model.context_size, self._limits.max_context_tokens)
        if work_input.estimated_input_tokens + max_output_tokens > context_limit:
            raise _Rejected("context-budget-exceeded")
        payload = work_input.payload
        if not isinstance(payload, dict) or set(payload) != {"messages"}:
            raise _Rejected("invalid-model-input")
        source = payload["messages"]
        if not isinstance(source, (list, tuple)):
            raise _Rejected("invalid-model-input")
        if not 1 <= len(source) <= 64:
            raise _Rejected("invalid-model-input")
        messages = []
        characters = 0
        for item in source:
            if (not isinstance(item, dict) or set(item) != {"role", "content"}
                    or item["role"] not in ("system", "user", "assistant")
                    or not isinstance(item["content"], str)):
                raise _Rejected("invalid-model-input")
            characters += len(item["content"])
            # Bound allocations before encoding JSON; the final UTF-8 byte
            # check also counts escaping, roles, model identity and framing.
            if characters > self._limits.max_request_bytes:
                raise _Rejected("request-too-large")
            messages.append({"role": item["role"], "content": item["content"]})
        body_payload: dict[str, Any] = {"model": model.name, "messages": messages, "stream": False}
        if self.PROVIDER_ID == "ollama":
            body_payload["options"] = {"num_predict": max_output_tokens, "num_ctx": context_limit}
        else:
            body_payload["max_tokens"] = max_output_tokens
        body = json.dumps(body_payload, ensure_ascii=False, allow_nan=False, separators=(",", ":")).encode("utf-8")
        if len(body) > self._limits.max_request_bytes:
            raise _Rejected("request-too-large")
        return LocalModelRequest(
            provider_id=self.PROVIDER_ID, port=self._port, body=body,
            timeout_ms=timeout_ms, max_response_bytes=self._limits.max_response_bytes,
        ), context_limit

    def _payload(self, received: LocalModelResponse) -> dict[str, Any]:
        if (not isinstance(received, LocalModelResponse)
                or not _bounded_int(received.status_code, 599) or received.status_code < 100
                or not isinstance(received.redirected, bool)
                or not isinstance(received.body, bytes)
                or not isinstance(received.content_type, str)):
            raise _Rejected("invalid-response")
        if received.redirected or 300 <= received.status_code < 400:
            raise _Rejected("policy-rejected")
        if len(received.body) > self._limits.max_response_bytes:
            raise _Rejected("response-too-large")
        status = received.status_code
        if status in (401, 403):
            raise _Rejected("authentication-required")
        if status == 429:
            raise _Rejected("rate-limited")
        if status in (408, 504):
            raise _Rejected("timeout")
        if status in (502, 503):
            raise _Rejected("temporarily-unavailable")
        if status != 200:
            raise _Rejected("provider-failure")
        if (len(received.content_type) > 256
                or received.content_type.split(";", 1)[0].strip().lower() != "application/json"):
            raise _Rejected("invalid-response")
        payload = json.loads(received.body.decode("utf-8"),
                             object_pairs_hook=_unique_object, parse_constant=_reject_constant)
        if not isinstance(payload, dict):
            raise _Rejected("invalid-response")
        return payload

    def _completion(self, payload: dict[str, Any]) -> tuple[str, int, int]:
        if self.PROVIDER_ID == "ollama":
            if payload.get("done") is not True or payload.get("done_reason") != "stop":
                raise _Rejected("incomplete-output")
            message = payload.get("message")
            input_tokens = _token_count(payload.get("prompt_eval_count"))
            output_tokens = _token_count(payload.get("eval_count"))
        else:
            choices = payload.get("choices")
            if (not isinstance(choices, list) or len(choices) != 1
                    or not isinstance(choices[0], dict)
                    or type(choices[0].get("index")) is not int or choices[0]["index"] != 0):
                raise _Rejected("invalid-response")
            choice = choices[0]
            if choice.get("finish_reason") != "stop":
                raise _Rejected("incomplete-output")
            message = choice.get("message")
            usage = payload.get("usage")
            if not isinstance(usage, dict):
                raise _Rejected("invalid-response")
            input_tokens = _token_count(usage.get("prompt_tokens"))
            output_tokens = _token_count(usage.get("completion_tokens"))
            if "total_tokens" in usage and _token_count(usage["total_tokens"]) != input_tokens + output_tokens:
                raise _Rejected("invalid-response")
        if not isinstance(message, dict) or message.get("role") != "assistant":
            raise _Rejected("invalid-response")
        if (message.get("tool_calls") not in (None, [])
                or message.get("function_call") is not None or message.get("images") not in (None, [])):
            raise _Rejected("unsupported-output")
        content = message.get("content")
        if not isinstance(content, str):
            raise _Rejected("invalid-response")
        if not content:
            raise _Rejected("incomplete-output")
        # Provider thinking, diagnostics and auxiliary fields are never returned.
        return content, input_tokens, output_tokens


class OllamaModelWorkAdapter(_LocalChatAdapter):
    """Explicit text inference through Ollama POST /api/chat, without streaming."""

    PROVIDER_ID = "ollama"
    DEFAULT_PORT = 11434


class LMStudioModelWorkAdapter(_LocalChatAdapter):
    """Explicit text inference through LM Studio POST /v1/chat/completions."""

    PROVIDER_ID = "lm-studio"
    DEFAULT_PORT = 1234
