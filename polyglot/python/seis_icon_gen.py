#!/usr/bin/env python3
"""SEIS icon generator — writes the PWA icons declared in manifest.json.

Pure stdlib PNG encoder (zlib + struct, no imaging library). The motif is
a centered gold diamond ring with an inner diamond accent, drawn from the
manifest's background_color / theme_color so the icons always match the
site palette. Output is deterministic: same manifest, same bytes.

Usage:
  python3 polyglot/python/seis_icon_gen.py [--manifest path] [--out-root dir]
"""
from __future__ import annotations

import json
import struct
import sys
import zlib
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MANIFEST = REPO_ROOT / "apps" / "web" / "manifest.json"

INNER_ACCENT = "#e8d5a8"  # site --accent2; manifest carries only two colors


def parse_hex(color: str) -> tuple[int, int, int]:
    c = color.lstrip("#")
    if len(c) == 3:
        c = "".join(ch * 2 for ch in c)
    return (int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16))


def png_chunk(kind: bytes, payload: bytes) -> bytes:
    crc = zlib.crc32(kind + payload) & 0xFFFFFFFF
    return struct.pack(">I", len(payload)) + kind + payload + struct.pack(">I", crc)


def encode_png(width: int, height: int, rgb_rows: list[bytes]) -> bytes:
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)  # 8-bit truecolor
    raw = b"".join(b"\x00" + row for row in rgb_rows)  # filter 0 per scanline
    return (
        b"\x89PNG\r\n\x1a\n"
        + png_chunk(b"IHDR", ihdr)
        + png_chunk(b"IDAT", zlib.compress(raw, 9))
        + png_chunk(b"IEND", b"")
    )


def render_icon(size: int, bg: str, ring: str, inner: str) -> bytes:
    """Diamond ring motif, kept inside the maskable-safe centre zone."""
    bg_px = bytes(parse_hex(bg))
    ring_px = bytes(parse_hex(ring))
    inner_px = bytes(parse_hex(inner))
    centre = (size - 1) / 2
    ring_outer = size * 0.34
    ring_inner = size * 0.27
    core = size * 0.10

    rows = []
    for y in range(size):
        row = bytearray()
        for x in range(size):
            d = abs(x - centre) + abs(y - centre)  # diamond (L1) distance
            if d <= core:
                row += inner_px
            elif ring_inner <= d <= ring_outer:
                row += ring_px
            else:
                row += bg_px
        rows.append(bytes(row))
    return encode_png(size, size, rows)


def declared_icons(manifest: dict) -> list[tuple[str, int]]:
    out = []
    for icon in manifest.get("icons", []):
        src = icon.get("src", "")
        sizes = icon.get("sizes", "")
        if not src or "x" not in sizes:
            continue
        out.append((src, int(sizes.split("x")[0])))
    return out


def generate(manifest_path: Path, out_root: Path) -> list[Path]:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    bg = manifest.get("background_color", "#0a0a0a")
    ring = manifest.get("theme_color", "#c8a96e")
    written = []
    for src, size in declared_icons(manifest):
        target = out_root / src
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(render_icon(size, bg, ring, INNER_ACCENT))
        written.append(target)
    return written


def main(argv: list[str]) -> int:
    manifest_path = DEFAULT_MANIFEST
    out_root = None
    it = iter(range(len(argv)))
    for i in it:
        if argv[i] == "--manifest" and i + 1 < len(argv):
            manifest_path = Path(argv[i + 1]); next(it, None)
        elif argv[i] == "--out-root" and i + 1 < len(argv):
            out_root = Path(argv[i + 1]); next(it, None)
    if out_root is None:
        out_root = manifest_path.parent
    written = generate(manifest_path, out_root)
    for p in written:
        print(f"wrote {p.relative_to(out_root)} ({p.stat().st_size} bytes)")
    if not written:
        print("manifest declares no sized icons", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
