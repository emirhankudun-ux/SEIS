from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.mcp_stdio import (
    MCPStdioFrameCodec,
    MCPStdioFrameError,
    MCPStdioFrameFailure,
)


class MCPStdioFrameCodecTests(unittest.TestCase):
    def test_round_trip_uses_one_newline_delimited_json_rpc_frame(self):
        codec = MCPStdioFrameCodec(max_frame_bytes=4_096)
        message = {
            "jsonrpc": "2.0",
            "id": "discover-1",
            "method": "server/discover",
            "params": {"note": "MARIA\nSEIS", "label": "Akdeniz"},
        }

        frame = codec.encode(message)

        self.assertTrue(frame.endswith(b"\n"))
        self.assertEqual(frame.count(b"\n"), 1)
        self.assertEqual(codec.decode_line(frame), message)

    def test_rejects_frame_over_policy_limit_on_encode_and_decode(self):
        codec = MCPStdioFrameCodec(max_frame_bytes=48)
        message = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {"blob": "x" * 128},
        }

        with self.assertRaises(MCPStdioFrameError) as encoded:
            codec.encode(message)
        self.assertEqual(encoded.exception.kind, MCPStdioFrameFailure.FRAME_TOO_LARGE)

        with self.assertRaises(MCPStdioFrameError) as decoded:
            codec.decode_line(b"{" + (b"x" * 80) + b"}\n")
        self.assertEqual(decoded.exception.kind, MCPStdioFrameFailure.FRAME_TOO_LARGE)

    def test_rejects_multiple_or_embedded_newline_frames(self):
        codec = MCPStdioFrameCodec(max_frame_bytes=4_096)

        with self.assertRaises(MCPStdioFrameError) as multiple:
            codec.decode_line(b'{"jsonrpc":"2.0","id":1}\n{"jsonrpc":"2.0","id":2}\n')
        self.assertEqual(multiple.exception.kind, MCPStdioFrameFailure.EMBEDDED_NEWLINE)

        with self.assertRaises(MCPStdioFrameError) as incomplete:
            codec.decode_line(b'{"jsonrpc":"2.0","id":1}')
        self.assertEqual(incomplete.exception.kind, MCPStdioFrameFailure.MISSING_DELIMITER)

    def test_rejects_invalid_utf8_json_non_object_and_jsonrpc_version(self):
        codec = MCPStdioFrameCodec(max_frame_bytes=4_096)

        cases = (
            (b"\xff\n", MCPStdioFrameFailure.INVALID_UTF8),
            (b"not-json\n", MCPStdioFrameFailure.INVALID_JSON),
            (b"[]\n", MCPStdioFrameFailure.NON_OBJECT),
            (b'{"jsonrpc":"1.0","id":1}\n', MCPStdioFrameFailure.INVALID_JSONRPC),
        )
        for frame, expected in cases:
            with self.subTest(expected=expected):
                with self.assertRaises(MCPStdioFrameError) as raised:
                    codec.decode_line(frame)
                self.assertEqual(raised.exception.kind, expected)

    def test_errors_are_redacted_and_never_echo_raw_frame_content(self):
        codec = MCPStdioFrameCodec(max_frame_bytes=4_096)
        secret = "SUPER_SECRET_TOKEN_123"

        with self.assertRaises(MCPStdioFrameError) as raised:
            codec.decode_line((secret + "\n").encode("utf-8"))

        rendered = repr(raised.exception)
        self.assertNotIn(secret, rendered)
        self.assertIn("invalid-json", rendered)


if __name__ == "__main__":
    unittest.main()
