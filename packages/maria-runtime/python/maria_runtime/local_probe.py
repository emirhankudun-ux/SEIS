from __future__ import annotations

from collections.abc import Callable, Mapping
from dataclasses import dataclass
import http.client
import json
import time
from typing import Any
from urllib.parse import urlsplit


class LocalProbeError(RuntimeError):
    """Raised when bounded localhost discovery evidence cannot be trusted."""


@dataclass(frozen=True)
class LocalProbeRequest:
    provider_id: str
    url: str
    method: str
    headers: tuple[tuple[str, str], ...]
    body: bytes | None
    timeout_seconds: float
    max_response_bytes: int


@dataclass(frozen=True)
class LocalProbeResponse:
    status_code: int
    content_type: str
    body: bytes
    redirected: bool = False


@dataclass(frozen=True)
class LocalProbeResult:
    provider_id: str
    endpoint: str
    payload: Mapping[str, Any]
    latency_ms: int
    response_bytes: int


Transport = Callable[[LocalProbeRequest], LocalProbeResponse]
Clock = Callable[[], float]


class _LoopbackHTTPTransport:
    """Minimal HTTP transport that cannot resolve or contact non-loopback hosts."""

    def __call__(self, request: LocalProbeRequest) -> LocalProbeResponse:
        parsed = urlsplit(request.url)
        if parsed.scheme != "http" or parsed.hostname != "127.0.0.1":
            raise LocalProbeError("local runtime target must use literal IPv4 loopback")
        if parsed.username is not None or parsed.password is not None:
            raise LocalProbeError("local runtime target must not contain credentials")
        if parsed.port is None:
            raise LocalProbeError("local runtime target requires an explicit port")
        if parsed.fragment:
            raise LocalProbeError("local runtime target must not contain a fragment")

        path = parsed.path or "/"
        if parsed.query:
            path = f"{path}?{parsed.query}"

        connection = http.client.HTTPConnection(
            "127.0.0.1",
            parsed.port,
            timeout=request.timeout_seconds,
        )
        try:
            connection.request(
                request.method,
                path,
                body=request.body,
                headers=dict(request.headers),
            )
            response = connection.getresponse()
            body = response.read(request.max_response_bytes + 1)
            return LocalProbeResponse(
                status_code=response.status,
                content_type=response.getheader("Content-Type", ""),
                body=body,
                redirected=300 <= response.status < 400,
            )
        except (TimeoutError, OSError, http.client.HTTPException) as exc:
            raise LocalProbeError("local runtime probe transport failed") from exc
        finally:
            connection.close()


class LocalRuntimeProbe:
    """Bounded read-only discovery probes for supported localhost AI runtimes.

    Targets are generated internally from validated ports and the literal
    127.0.0.1 loopback address. Callers cannot provide arbitrary hosts, paths,
    headers, credentials, or methods through this API. The probe never starts a
    runtime and never follows redirects.
    """

    _LM_STUDIO_PATH = "/api/v1/models"
    _OLLAMA_SHOW_PATH = "/api/show"
    _MAX_MODEL_NAME_CHARS = 512

    def __init__(
        self,
        *,
        transport: Transport | None = None,
        clock: Clock = time.monotonic,
        timeout_seconds: float = 1.5,
        max_response_bytes: int = 1_048_576,
        lm_studio_port: int = 1234,
        ollama_port: int = 11434,
    ) -> None:
        if timeout_seconds <= 0:
            raise ValueError("timeout_seconds must be positive")
        if max_response_bytes <= 0:
            raise ValueError("max_response_bytes must be positive")
        self._validate_port(lm_studio_port, "lm_studio_port")
        self._validate_port(ollama_port, "ollama_port")

        self._transport = transport or _LoopbackHTTPTransport()
        self._clock = clock
        self._timeout_seconds = float(timeout_seconds)
        self._max_response_bytes = max_response_bytes
        self._lm_studio_port = lm_studio_port
        self._ollama_port = ollama_port

    def probe_lm_studio_models(self) -> LocalProbeResult:
        return self._probe(
            provider_id="lm-studio",
            url=f"http://127.0.0.1:{self._lm_studio_port}{self._LM_STUDIO_PATH}",
            method="GET",
            headers=(("Accept", "application/json"),),
            body=None,
        )

    def probe_ollama_show(self, model_name: str) -> LocalProbeResult:
        normalized_name = model_name.strip()
        if not normalized_name:
            raise ValueError("Ollama model name must be non-empty")
        if len(normalized_name) > self._MAX_MODEL_NAME_CHARS:
            raise ValueError("Ollama model name is too long")
        if any(ord(character) < 32 for character in normalized_name):
            raise ValueError("Ollama model name contains control characters")

        body = json.dumps(
            {"model": normalized_name},
            ensure_ascii=False,
            separators=(",", ":"),
        ).encode("utf-8")

        return self._probe(
            provider_id="ollama",
            url=f"http://127.0.0.1:{self._ollama_port}{self._OLLAMA_SHOW_PATH}",
            method="POST",
            headers=(
                ("Accept", "application/json"),
                ("Content-Type", "application/json"),
            ),
            body=body,
        )

    def _probe(
        self,
        *,
        provider_id: str,
        url: str,
        method: str,
        headers: tuple[tuple[str, str], ...],
        body: bytes | None,
    ) -> LocalProbeResult:
        request = LocalProbeRequest(
            provider_id=provider_id,
            url=url,
            method=method,
            headers=headers,
            body=body,
            timeout_seconds=self._timeout_seconds,
            max_response_bytes=self._max_response_bytes,
        )

        started_at = self._clock()
        try:
            response = self._transport(request)
        except LocalProbeError:
            raise
        except Exception as exc:
            raise LocalProbeError("local runtime probe transport failed") from exc
        finished_at = self._clock()

        if response.redirected or 300 <= response.status_code < 400:
            raise LocalProbeError("local runtime probe redirects are not allowed")
        if response.status_code != 200:
            raise LocalProbeError("local runtime probe returned a non-success status")
        if len(response.body) > self._max_response_bytes:
            raise LocalProbeError("local runtime probe response exceeded the size limit")

        media_type = response.content_type.split(";", 1)[0].strip().lower()
        if media_type != "application/json":
            raise LocalProbeError("local runtime probe response must be application/json")

        try:
            decoded = response.body.decode("utf-8")
            payload = json.loads(decoded)
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise LocalProbeError("local runtime probe returned invalid JSON") from exc
        if not isinstance(payload, Mapping):
            raise LocalProbeError("local runtime probe JSON root must be an object")

        elapsed_seconds = max(0.0, finished_at - started_at)
        return LocalProbeResult(
            provider_id=provider_id,
            endpoint=url,
            payload=payload,
            latency_ms=round(elapsed_seconds * 1000),
            response_bytes=len(response.body),
        )

    @staticmethod
    def _validate_port(port: int, field_name: str) -> None:
        if isinstance(port, bool) or not isinstance(port, int) or not 1 <= port <= 65535:
            raise ValueError(f"{field_name} must be an integer between 1 and 65535")
