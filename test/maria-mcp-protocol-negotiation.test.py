from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.mcp_protocol import (
    MCP_LEGACY_PROTOCOL_VERSION,
    MCP_MODERN_PROTOCOL_VERSION,
    MCPProtocolEra,
    MCPProtocolNegotiator,
)


class MCPProtocolNegotiationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.negotiator = MCPProtocolNegotiator(
            client_name="MARIA-SEIS",
            client_version="1.0.0",
        )

    def test_modern_stdio_probe_uses_current_discovery_metadata_envelope(self):
        probe = self.negotiator.discovery_probe(request_id="discover-1")

        self.assertEqual(probe.timeout_ms, 5_000)
        self.assertEqual(probe.era, MCPProtocolEra.MODERN)
        self.assertEqual(probe.protocol_version, MCP_MODERN_PROTOCOL_VERSION)
        self.assertEqual(probe.request["jsonrpc"], "2.0")
        self.assertEqual(probe.request["id"], "discover-1")
        self.assertEqual(probe.request["method"], "server/discover")
        self.assertEqual(
            probe.request["params"]["_meta"],
            {
                "io.modelcontextprotocol/protocolVersion": "2026-07-28",
                "io.modelcontextprotocol/clientInfo": {
                    "name": "MARIA-SEIS",
                    "version": "1.0.0",
                },
                "io.modelcontextprotocol/clientCapabilities": {},
            },
        )

    def test_discover_result_selects_modern_era_without_legacy_fallback(self):
        decision = self.negotiator.decide_after_probe({
            "jsonrpc": "2.0",
            "id": "discover-1",
            "result": {
                "resultType": "complete",
                "supportedVersions": ["2026-07-28"],
                "capabilities": {"tools": {}},
                "_meta": {
                    "io.modelcontextprotocol/serverInfo": {
                        "name": "example",
                        "version": "9.9.9",
                    }
                },
            },
        })

        self.assertEqual(decision.era, MCPProtocolEra.MODERN)
        self.assertEqual(decision.protocol_version, MCP_MODERN_PROTOCOL_VERSION)
        self.assertFalse(decision.fallback_used)
        self.assertEqual(decision.reason, "discover-result")

    def test_modern_version_error_uses_advertised_supported_version_without_initialize(self):
        decision = self.negotiator.decide_after_probe({
            "jsonrpc": "2.0",
            "id": "discover-1",
            "error": {
                "code": -32022,
                "message": "unsupported protocol version",
                "data": {"supported": ["2026-07-28"]},
            },
        })

        self.assertEqual(decision.era, MCPProtocolEra.MODERN)
        self.assertEqual(decision.protocol_version, MCP_MODERN_PROTOCOL_VERSION)
        self.assertFalse(decision.fallback_used)
        self.assertEqual(decision.reason, "modern-version-error")

    def test_modern_version_error_without_mutual_version_fails_closed(self):
        with self.assertRaises(LookupError):
            self.negotiator.decide_after_probe({
                "jsonrpc": "2.0",
                "id": "discover-1",
                "error": {
                    "code": -32022,
                    "message": "unsupported protocol version",
                    "data": {"supported": ["2099-01-01"]},
                },
            })

    def test_timeout_or_unrecognized_error_falls_back_to_latest_legacy_initialize(self):
        timeout = self.negotiator.decide_after_probe(None)
        self.assertEqual(timeout.era, MCPProtocolEra.LEGACY)
        self.assertEqual(timeout.protocol_version, MCP_LEGACY_PROTOCOL_VERSION)
        self.assertTrue(timeout.fallback_used)
        self.assertEqual(timeout.reason, "probe-timeout")

        unknown = self.negotiator.decide_after_probe({
            "jsonrpc": "2.0",
            "id": "discover-1",
            "error": {"code": -32601, "message": "method not found"},
        })
        self.assertEqual(unknown.era, MCPProtocolEra.LEGACY)
        self.assertEqual(unknown.protocol_version, MCP_LEGACY_PROTOCOL_VERSION)
        self.assertTrue(unknown.fallback_used)
        self.assertEqual(unknown.reason, "legacy-probe-error")

    def test_confirmed_modern_server_without_mutual_modern_version_fails_closed(self):
        with self.assertRaises(LookupError):
            self.negotiator.decide_after_probe({
                "jsonrpc": "2.0",
                "id": "discover-1",
                "result": {
                    "resultType": "complete",
                    "supportedVersions": ["2099-01-01"],
                    "capabilities": {},
                },
            })

    def test_legacy_initialize_request_is_explicit_and_does_not_use_modern_meta(self):
        request = self.negotiator.legacy_initialize_request(request_id="init-1")

        self.assertEqual(request["jsonrpc"], "2.0")
        self.assertEqual(request["id"], "init-1")
        self.assertEqual(request["method"], "initialize")
        self.assertEqual(request["params"]["protocolVersion"], MCP_LEGACY_PROTOCOL_VERSION)
        self.assertEqual(request["params"]["capabilities"], {})
        self.assertEqual(
            request["params"]["clientInfo"],
            {"name": "MARIA-SEIS", "version": "1.0.0"},
        )
        self.assertNotIn("_meta", request["params"])


if __name__ == "__main__":
    unittest.main()
