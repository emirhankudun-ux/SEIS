from __future__ import annotations

from enum import Enum
import json
from typing import Any, Mapping


class MCPStdioFrameFailure(str, Enum):
    EMPTY_FRAME = "empty-frame"
    FRAME_TOO_LARGE = "frame-too-large"
    MISSING_DELIMITER = "missing-delimiter"
    EMBEDDED_NEWLINE = "embedded-newline"
    INVALID_UTF8 = "invalid-utf8"
    INVALID_JSON = "invalid-json"
    NON_OBJECT = "non-object"
    INVALID_JSONRPC = "invalid-jsonrpc"


class MCPStdioFrameError(ValueError):
    """Redacted framing failure.

    Only the normalized failure kind is retained. Raw frame bytes, decoded text,
    JSON payloads, credentials, prompts, and tool output are intentionally never
    embedded in the exception message or attributes.
    """

    def __init__(self, kind: MCPStdioFrameFailure) -> None:
        self.kind = kind
        super().__init__(kind.value)


class MCPStdioFrameCodec:
    """Bounded newline-delimited JSON-RPC framing for a future MCP stdio adapter.

    MCP stdio carries exactly one JSON-RPC message per newline-delimited frame.
    This codec performs no process I/O and grants no execution authority; it is
    a pure serialization boundary that prevents unbounded or ambiguous frames
    from reaching the future transport lifecycle.
    """

    def __init__(self, *, max_frame_bytes: int = 64 * 1024) -> None:
        if max_frame_bytes <= 0:
            raise ValueError("max_frame_bytes must be positive")
        self._max_frame_bytes = max_frame_bytes

    @property
    def max_frame_bytes(self) -> int:
        return self._max_frame_bytes

    def encode(self, message: Mapping[str, Any]) -> bytes:
        if not isinstance(message, Mapping):
            raise MCPStdioFrameError(MCPStdioFrameFailure.NON_OBJECT)
        if message.get("jsonrpc") != "2.0":
            raise MCPStdioFrameError(MCPStdioFrameFailure.INVALID_JSONRPC)

        try:
            rendered = json.dumps(
                dict(message),
                ensure_ascii=False,
                separators=(",", ":"),
                allow_nan=False,
            )
        except (TypeError, ValueError):
            raise MCPStdioFrameError(MCPStdioFrameFailure.INVALID_JSON) from None

        payload = rendered.encode("utf-8")
        if b"\n" in payload or b"\r" in payload:
            raise MCPStdioFrameError(MCPStdioFrameFailure.EMBEDDED_NEWLINE)

        frame = payload + b"\n"
        if len(frame) > self._max_frame_bytes:
            raise MCPStdioFrameError(MCPStdioFrameFailure.FRAME_TOO_LARGE)
        return frame

    def decode_line(self, frame: bytes) -> dict[str, Any]:
        if not isinstance(frame, bytes):
            raise TypeError("frame must be bytes")
        if not frame:
            raise MCPStdioFrameError(MCPStdioFrameFailure.EMPTY_FRAME)
        if len(frame) > self._max_frame_bytes:
            raise MCPStdioFrameError(MCPStdioFrameFailure.FRAME_TOO_LARGE)
        if not frame.endswith(b"\n"):
            raise MCPStdioFrameError(MCPStdioFrameFailure.MISSING_DELIMITER)

        payload = frame[:-1]
        if not payload:
            raise MCPStdioFrameError(MCPStdioFrameFailure.EMPTY_FRAME)
        if b"\n" in payload or b"\r" in payload:
            raise MCPStdioFrameError(MCPStdioFrameFailure.EMBEDDED_NEWLINE)

        try:
            decoded = payload.decode("utf-8", errors="strict")
        except UnicodeDecodeError:
            raise MCPStdioFrameError(MCPStdioFrameFailure.INVALID_UTF8) from None

        try:
            message = json.loads(decoded)
        except json.JSONDecodeError:
            raise MCPStdioFrameError(MCPStdioFrameFailure.INVALID_JSON) from None

        if not isinstance(message, dict):
            raise MCPStdioFrameError(MCPStdioFrameFailure.NON_OBJECT)
        if message.get("jsonrpc") != "2.0":
            raise MCPStdioFrameError(MCPStdioFrameFailure.INVALID_JSONRPC)
        return message
