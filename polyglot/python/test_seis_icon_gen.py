#!/usr/bin/env python3
"""Tests for seis_icon_gen — validates output with the sibling image-audit parser."""
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from seis_icon_gen import declared_icons, generate, parse_hex, render_icon  # noqa: E402
from seis_image_audit import png_dimensions  # noqa: E402


class HexParsing(unittest.TestCase):
    def test_six_digit(self):
        self.assertEqual(parse_hex("#c8a96e"), (0xC8, 0xA9, 0x6E))

    def test_three_digit_expands(self):
        self.assertEqual(parse_hex("#fff"), (255, 255, 255))


class IconRendering(unittest.TestCase):
    def test_output_is_valid_png_with_declared_size(self):
        png = render_icon(64, "#0a0a0a", "#c8a96e", "#e8d5a8")
        self.assertEqual(png_dimensions(png), (64, 64))

    def test_deterministic_bytes(self):
        a = render_icon(32, "#0a0a0a", "#c8a96e", "#e8d5a8")
        b = render_icon(32, "#0a0a0a", "#c8a96e", "#e8d5a8")
        self.assertEqual(a, b)

    def test_corner_is_background_centre_is_inner(self):
        import zlib, struct  # decode one row back out of the IDAT

        size = 33
        png = render_icon(size, "#010203", "#c8a96e", "#e8d5a8")
        idat_start = png.find(b"IDAT") + 4
        idat_len = struct.unpack(">I", png[idat_start - 8 : idat_start - 4])[0]
        raw = zlib.decompress(png[idat_start : idat_start + idat_len])
        stride = 1 + size * 3
        first_px = tuple(raw[1:4])
        mid_row = raw[(size // 2) * stride :]
        centre_px = tuple(mid_row[1 + (size // 2) * 3 :][:3])
        self.assertEqual(first_px, (1, 2, 3))  # corner = background
        self.assertEqual(centre_px, (0xE8, 0xD5, 0xA8))  # centre = inner accent


class ManifestDriven(unittest.TestCase):
    def test_generates_every_declared_icon(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            manifest = root / "manifest.json"
            manifest.write_text(json.dumps({
                "background_color": "#0a0a0a",
                "theme_color": "#c8a96e",
                "icons": [
                    {"src": "icons/icon-192.png", "sizes": "192x192"},
                    {"src": "icons/icon-512.png", "sizes": "512x512"},
                ],
            }))
            written = generate(manifest, root)
            self.assertEqual(len(written), 2)
            self.assertEqual(png_dimensions((root / "icons/icon-192.png").read_bytes()), (192, 192))
            self.assertEqual(png_dimensions((root / "icons/icon-512.png").read_bytes()), (512, 512))

    def test_skips_entries_without_sizes(self):
        self.assertEqual(declared_icons({"icons": [{"src": "x.png"}]}), [])


if __name__ == "__main__":
    unittest.main(verbosity=1)
