from __future__ import annotations

from dataclasses import dataclass, field
import http.client
import socket
import threading
import time
from typing import Callable


HARD_MAX_REQUEST_BYTES = 1_048_576
HARD_MAX_RESPONSE_BYTES = 4_194_304
HARD_MAX_TIMEOUT_MS = 300_000


def _bounded_int(value: object, maximum: int) -> bool:
    return isinstance(value, int) and not isinstance(value, bool) and 1 <= value <= maximum


@dataclass(frozen=True)
class LocalModelRequest:
    """One inference request. Hosts, paths, methods and headers are not injectable."""

    provider_id: str
    port: int
    body: bytes = field(repr=False)
    timeout_ms: int
    max_response_bytes: int

    def __post_init__(self) -> None:
        if self.provider_id not in ("ollama", "lm-studio"):
            raise ValueError("unsupported local inference provider")
        if not _bounded_int(self.port, 65_535):
            raise ValueError("local inference port must be between 1 and 65535")
        if not isinstance(self.body, bytes):
            raise TypeError("local inference body must be bytes")
        if not 1 <= len(self.body) <= HARD_MAX_REQUEST_BYTES:
            raise ValueError("local inference request exceeds the hard byte bounds")
        if not _bounded_int(self.timeout_ms, HARD_MAX_TIMEOUT_MS):
            raise ValueError("local inference timeout exceeds the hard bounds")
        if not _bounded_int(self.max_response_bytes, HARD_MAX_RESPONSE_BYTES):
            raise ValueError("local inference response budget exceeds the hard bounds")

    @property
    def path(self) -> str:
        return "/api/chat" if self.provider_id == "ollama" else "/v1/chat/completions"


@dataclass(frozen=True)
class LocalModelResponse:
    """Untrusted transient transport output; keep every raw field out of repr."""

    status_code: int = field(repr=False)
    content_type: str = field(repr=False)
    body: bytes = field(repr=False)
    redirected: bool = field(default=False, repr=False)


LocalModelTransport = Callable[[LocalModelRequest], LocalModelResponse]


class LoopbackModelHTTPTransport:
    """Explicit, single-call HTTP transport with a whole-I/O deadline.

    Only literal IPv4 loopback is contacted. No environment proxy, DNS hostname,
    redirect, credential lookup, process launch, retry, or decompression is used.
    Construction does no I/O. A joined watchdog interrupts even slow-drip headers
    and bodies; a socket inactivity timeout alone would not bound those cases.
    """

    def __call__(self, request: LocalModelRequest) -> LocalModelResponse:
        # An exact type check prevents a subclass from overriding the derived
        # provider path and turning this fixed-endpoint transport into an
        # arbitrary local HTTP client.
        if type(request) is not LocalModelRequest:
            raise TypeError("local model transport requires exact LocalModelRequest")
        # Revalidate at the I/O boundary, not only at request construction.
        request.__post_init__()
        seconds = request.timeout_ms / 1000.0
        deadline = time.monotonic() + seconds
        connection = http.client.HTTPConnection("127.0.0.1", request.port, timeout=seconds)
        response: http.client.HTTPResponse | None = None
        watchdog: threading.Timer | None = None
        expired = threading.Event()
        try:
            connection.connect()
            connected_socket = connection.sock
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                raise TimeoutError
            if connected_socket is None:
                raise OSError
            connected_socket.settimeout(remaining)

            def expire() -> None:
                expired.set()
                try:
                    # Keep the original socket reference: HTTP/1.0 and
                    # Connection: close can clear connection.sock during reads.
                    connected_socket.shutdown(socket.SHUT_RDWR)
                except OSError:
                    pass

            watchdog = threading.Timer(remaining, expire)
            watchdog.name = "maria-model-deadline"
            watchdog.daemon = True
            watchdog.start()
            connection.request(
                "POST", request.path, body=request.body,
                headers={"Accept": "application/json", "Content-Type": "application/json",
                         "Connection": "close"},
            )
            response = connection.getresponse()
            # Error/redirect bodies are unnecessary for normalized diagnostics.
            body = response.read(request.max_response_bytes + 1) if response.status == 200 else b""
            if expired.is_set() or time.monotonic() >= deadline:
                raise TimeoutError
            if (response.status == 200 and len(body) <= request.max_response_bytes
                    and response.length not in (None, 0)):
                raise http.client.IncompleteRead(b"")
            return LocalModelResponse(
                status_code=response.status,
                content_type=response.getheader("Content-Type", ""),
                body=body,
                redirected=300 <= response.status < 400,
            )
        except TimeoutError:
            raise TimeoutError("local model request timed out") from None
        except (OSError, http.client.HTTPException):
            if expired.is_set() or time.monotonic() >= deadline:
                raise TimeoutError("local model request timed out") from None
            raise OSError("local model transport failed") from None
        finally:
            if watchdog is not None:
                watchdog.cancel()
                watchdog.join()
            if response is not None:
                response.close()
            connection.close()
