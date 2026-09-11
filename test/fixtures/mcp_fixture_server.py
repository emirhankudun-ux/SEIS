#!/usr/bin/env python3
"""Harmless local MCP fixture used only by MARIA integration tests.

The fixture performs no filesystem, network, environment, subprocess, or external
service mutation. It reads newline-delimited JSON-RPC from stdin and implements
only protocol discovery plus a read-only echo method.
"""

from __future__ import annotations

import json
import sys
from typing import Any, Mapping


PROTOCOL_VERSION = "2026-07-28"


def _send(message: Mapping[str, Any]) -> None:
    rendered = json.dumps(
        dict(message),
        ensure_ascii=False,
        separators=(",", ":"),
        allow_nan=False,
    )
    sys.stdout.write(rendered + "\n")
    sys.stdout.flush()


def _error(request_id: Any, code: int, message: str) -> None:
    _send({
        "jsonrpc": "2.0",
        "id": request_id,
        "error": {"code": code, "message": message},
    })


def _handle(request: Mapping[str, Any]) -> None:
    request_id = request.get("id")
    method = request.get("method")

    if method == "server/discover":
        _send({
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {
                "supportedVersions": [PROTOCOL_VERSION],
                "serverInfo": {"name": "seis-test-fixture", "version": "1.0.0"},
            },
        })
        return

    if method == "fixture.echo":
        params = request.get("params")
        if not isinstance(params, Mapping):
            _error(request_id, -32602, "invalid params")
            return
        value = params.get("value")
        if not isinstance(value, str):
            _error(request_id, -32602, "value must be a string")
            return
        _send({
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {"echo": value},
        })
        return

    _error(request_id, -32601, "method not found")


def main() -> int:
    for raw_line in sys.stdin:
        try:
            request = json.loads(raw_line)
        except json.JSONDecodeError:
            _error(None, -32700, "parse error")
            continue
        if not isinstance(request, Mapping) or request.get("jsonrpc") != "2.0":
            _error(request.get("id") if isinstance(request, Mapping) else None, -32600, "invalid request")
            continue
        _handle(request)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
