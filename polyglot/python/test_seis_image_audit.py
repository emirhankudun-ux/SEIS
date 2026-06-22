#!/usr/bin/env python3
"""Unit tests for seis_image_audit — synthetic binary fixtures, no real images."""
import struct
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from seis_image_audit import (  # noqa: E402
    audit,
    image_dimensions,
    jpeg_dimensions,
    png_dimensions,
    webp_dimensions,
)


def make_jpeg(width: int, height: int) -> bytes:
    """Minimal JPEG: SOI, APP0 stub, SOF0 with given dims, EOI."""
    app0 = b"\xff\xe0" + struct.pack(">H", 4) + b"\x00\x00"
    sof0 = b"\xff\xc0" + struct.pack(">H", 11) + b"\x08" + struct.pack(">HH", height, width) + b"\x01\x11\x00"
    return b"\xff\xd8" + app0 + sof0 + b"\xff\xd9"


def make_png(width: int, height: int) -> bytes:
    ihdr = struct.pack(">II", width, height) + b"\x08\x02\x00\x00\x00"
    return b"\x89PNG\r\n\x1a\n" + struct.pack(">I", 13) + b"IHDR" + ihdr + b"\x00" * 4


def make_webp_vp8(width: int, height: int) -> bytes:
    body = b"VP8 " + struct.pack("<I", 10) + b"\x00\x00\x00" + b"\x9d\x01\x2a"
    body += struct.pack("<HH", width, height)
    return b"RIFF" + struct.pack("<I", len(body) + 4) + b"WEBP" + body


class JpegParsing(unittest.TestCase):
    def test_reads_sof0_dimensions(self):
        self.assertEqual(jpeg_dimensions(make_jpeg(640, 480)), (640, 480))

    def test_rejects_non_jpeg(self):
        self.assertIsNone(jpeg_dimensions(b"not a jpeg at all"))

    def test_rejects_truncated(self):
        self.assertIsNone(jpeg_dimensions(b"\xff\xd8\xff"))

    def test_skips_restart_markers(self):
        data = b"\xff\xd8" + b"\xff\xd0" + make_jpeg(10, 20)[2:]
        self.assertEqual(jpeg_dimensions(data), (10, 20))


class PngParsing(unittest.TestCase):
    def test_reads_ihdr(self):
        self.assertEqual(png_dimensions(make_png(1200, 800)), (1200, 800))

    def test_rejects_bad_signature(self):
        self.assertIsNone(png_dimensions(b"\x89PNX" + b"\x00" * 30))


class WebpParsing(unittest.TestCase):
    def test_reads_vp8_lossy(self):
        self.assertEqual(webp_dimensions(make_webp_vp8(404, 316)), (404, 316))

    def test_rejects_non_riff(self):
        self.assertIsNone(webp_dimensions(b"JUNK" * 10))


class FormatDetection(unittest.TestCase):
    def test_dispatches_by_magic(self):
        self.assertEqual(image_dimensions(make_png(2, 3)), (2, 3))
        self.assertEqual(image_dimensions(make_jpeg(4, 5)), (4, 5))
        self.assertIsNone(image_dimensions(b"\x00" * 64))


class AuditBehaviour(unittest.TestCase):
    def test_passes_small_clean_directory(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            (d / "a.jpg").write_bytes(make_jpeg(800, 600))
            (d / "b.png").write_bytes(make_png(400, 300))
            report = audit(d, budget_bytes=7_000_000)
            self.assertTrue(report["ok"])
            self.assertEqual(report["imageCount"], 2)
            self.assertEqual(report["failures"], [])

    def test_fails_on_unparsable_image(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            (d / "broken.jpg").write_bytes(b"\x00\x01\x02\x03")
            report = audit(d, budget_bytes=7_000_000)
            self.assertFalse(report["ok"])
            self.assertIn("unparsable", report["failures"][0])

    def test_fails_over_total_budget(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            (d / "a.jpg").write_bytes(make_jpeg(100, 100) + b"\x00" * 5000)
            report = audit(d, budget_bytes=1000)
            self.assertFalse(report["ok"])
            self.assertTrue(any("budget" in f for f in report["failures"]))

    def test_fails_on_insane_dimensions(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            (d / "huge.png").write_bytes(make_png(9000, 100))
            report = audit(d, budget_bytes=7_000_000)
            self.assertFalse(report["ok"])
            self.assertTrue(any("hard limit" in f for f in report["failures"]))

    def test_warns_on_oversized_web_image(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            (d / "big.jpg").write_bytes(make_jpeg(3000, 2000))
            report = audit(d, budget_bytes=7_000_000)
            self.assertTrue(report["ok"])  # warning only
            self.assertTrue(any("web target" in w for w in report["warnings"]))

    def test_ignores_non_image_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            (d / "notes.txt").write_text("hi")
            report = audit(d, budget_bytes=7_000_000)
            self.assertEqual(report["imageCount"], 0)
            self.assertTrue(report["ok"])


if __name__ == "__main__":
    unittest.main(verbosity=1)
