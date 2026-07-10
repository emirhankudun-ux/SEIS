#!/usr/bin/env python3
"""SEIS image audit — binary header analysis for the curated drawings.

Reads JPEG/PNG/WebP dimensions directly from file headers (pure stdlib,
no imaging library), then enforces the experience-contract budgets:

  FAIL  unparsable image, any dimension > 8192 px,
        total bytes over publicAssetBudgetBytes
  WARN  dimension > 2560 px (oversized for web), single file > 1 MB

Usage:
  python3 polyglot/python/seis_image_audit.py [drawings-dir] [--json]
"""
from __future__ import annotations

import json
import struct
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DIR = REPO_ROOT / "apps" / "web" / "public" / "media" / "drawings"
CONTRACT = REPO_ROOT / "polyglot" / "contracts" / "seis-experience-contract.json"

HARD_DIM_LIMIT = 8192
WARN_DIM_LIMIT = 2560
WARN_FILE_BYTES = 1024 * 1024

# JPEG start-of-frame markers that carry dimensions (C4=DHT, C8=JPG, CC=DAC excluded)
_SOF_MARKERS = frozenset(
    [0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF]
)


def jpeg_dimensions(data: bytes) -> tuple[int, int] | None:
    """Walk JPEG segments until a SOF marker; return (width, height)."""
    if len(data) < 4 or data[0] != 0xFF or data[1] != 0xD8:
        return None
    i = 2
    while i + 3 < len(data):
        if data[i] != 0xFF:
            return None
        marker = data[i + 1]
        if marker == 0xFF:  # fill byte
            i += 1
            continue
        if marker in (0x01,) or 0xD0 <= marker <= 0xD9:  # standalone markers
            i += 2
            continue
        if i + 3 >= len(data):
            return None
        seglen = struct.unpack(">H", data[i + 2 : i + 4])[0]
        if marker in _SOF_MARKERS:
            if i + 9 > len(data):
                return None
            height, width = struct.unpack(">HH", data[i + 5 : i + 9])
            return (width, height)
        if marker == 0xDA:  # start of scan — no SOF seen, give up
            return None
        i += 2 + seglen
    return None


def png_dimensions(data: bytes) -> tuple[int, int] | None:
    sig = b"\x89PNG\r\n\x1a\n"
    if len(data) < 24 or not data.startswith(sig) or data[12:16] != b"IHDR":
        return None
    width, height = struct.unpack(">II", data[16:24])
    return (width, height)


def webp_dimensions(data: bytes) -> tuple[int, int] | None:
    if len(data) < 30 or data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        return None
    fourcc = data[12:16]
    if fourcc == b"VP8 ":  # lossy: sync code 9D 01 2A then 14-bit dims, LE
        if data[23:26] != b"\x9d\x01\x2a":
            return None
        w = struct.unpack("<H", data[26:28])[0] & 0x3FFF
        h = struct.unpack("<H", data[28:30])[0] & 0x3FFF
        return (w, h)
    if fourcc == b"VP8L":  # lossless: 0x2F then packed 14-bit minus-one dims
        if data[20] != 0x2F:
            return None
        bits = struct.unpack("<I", data[21:25])[0]
        return ((bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1)
    if fourcc == b"VP8X":  # extended: 24-bit minus-one canvas dims at 24/27
        w = int.from_bytes(data[24:27], "little") + 1
        h = int.from_bytes(data[27:30], "little") + 1
        return (w, h)
    return None


def image_dimensions(data: bytes) -> tuple[int, int] | None:
    """Detect format by magic bytes and return (width, height), or None."""
    for parser in (jpeg_dimensions, png_dimensions, webp_dimensions):
        dims = parser(data)
        if dims:
            return dims
    return None


def load_budget_bytes() -> int:
    try:
        contract = json.loads(CONTRACT.read_text(encoding="utf-8"))
        return int(contract["assets"]["publicAssetBudgetBytes"])
    except (OSError, KeyError, ValueError):
        return 10_485_760


def audit(directory: Path, budget_bytes: int) -> dict:
    images, failures, warnings = [], [], []
    total = 0
    exts = {".jpg", ".jpeg", ".png", ".webp"}
    for f in sorted(directory.iterdir()) if directory.is_dir() else []:
        if f.suffix.lower() not in exts:
            continue
        data = f.read_bytes()
        total += len(data)
        dims = image_dimensions(data)
        entry = {"file": f.name, "bytes": len(data), "dimensions": dims}
        images.append(entry)
        if dims is None:
            failures.append(f"{f.name}: unparsable image header")
            continue
        w, h = dims
        if max(w, h) > HARD_DIM_LIMIT:
            failures.append(f"{f.name}: {w}x{h} exceeds hard limit {HARD_DIM_LIMIT}px")
        elif max(w, h) > WARN_DIM_LIMIT:
            warnings.append(f"{f.name}: {w}x{h} larger than {WARN_DIM_LIMIT}px web target")
        if len(data) > WARN_FILE_BYTES:
            warnings.append(f"{f.name}: {len(data) // 1024} KB exceeds 1024 KB advisory")
    if total > budget_bytes:
        failures.append(f"total {total} bytes exceeds budget {budget_bytes}")
    return {
        "ok": not failures,
        "directory": str(directory),
        "imageCount": len(images),
        "totalBytes": total,
        "budgetBytes": budget_bytes,
        "images": images,
        "failures": failures,
        "warnings": warnings,
    }


def main(argv: list[str]) -> int:
    args = [a for a in argv if not a.startswith("--")]
    as_json = "--json" in argv
    directory = Path(args[0]) if args else DEFAULT_DIR
    report = audit(directory, load_budget_bytes())
    if as_json:
        print(json.dumps(report, indent=2))
    else:
        mark = "PASS" if report["ok"] else "FAIL"
        kb = report["totalBytes"] // 1024
        print(f"[{mark}] image-audit  {report['imageCount']} images, {kb} KB "
              f"(budget {report['budgetBytes'] // 1024} KB)")
        for line in report["failures"]:
            print(f"        FAIL: {line}")
        for line in report["warnings"]:
            print(f"        warn: {line}")
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
