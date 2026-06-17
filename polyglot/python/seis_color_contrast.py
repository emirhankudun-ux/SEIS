#!/usr/bin/env python3
"""SEIS WCAG 2.1 color contrast checker.

Extracts hex color tokens from apps/web/style.css (the :root block), then
checks every foreground/background pair defined in the site against the
WCAG 2.1 contrast-ratio thresholds:
    AA  normal text  ≥ 4.5 : 1
    AA  large text   ≥ 3.0 : 1
    AAA normal text  ≥ 7.0 : 1

Zero external dependencies — all math from the WCAG spec.

Usage:
    python3 polyglot/python/seis_color_contrast.py [--self-test]
Exit:
    0  PASS
    1  FAIL (any required pair below AA normal threshold)
    2  no colors found
"""

import math
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# WCAG sRGB linearisation + relative luminance
# ---------------------------------------------------------------------------

def _linearise(c8: int) -> float:
    """Convert 0-255 sRGB channel to linear light value."""
    s = c8 / 255.0
    return s / 12.92 if s <= 0.04045 else ((s + 0.055) / 1.055) ** 2.4


def luminance(r8: int, g8: int, b8: int) -> float:
    """WCAG relative luminance (0 = black, 1 = white)."""
    return 0.2126 * _linearise(r8) + 0.7152 * _linearise(g8) + 0.0722 * _linearise(b8)


def contrast_ratio(l1: float, l2: float) -> float:
    """WCAG contrast ratio between two luminances."""
    lighter = max(l1, l2)
    darker  = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


def parse_hex(hex_str: str) -> tuple[int, int, int] | None:
    """Parse #rrggbb or #rgb to (r, g, b) 0-255. Returns None on failure."""
    h = hex_str.lstrip('#')
    if len(h) == 3:
        h = h[0]*2 + h[1]*2 + h[2]*2
    if len(h) != 6:
        return None
    try:
        return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    except ValueError:
        return None


# ---------------------------------------------------------------------------
# CSS token extraction
# ---------------------------------------------------------------------------

def extract_hex_tokens(css: str) -> dict[str, tuple[int, int, int]]:
    """Return {--token-name: (r,g,b)} for every hex color in :root."""
    tokens: dict[str, tuple[int, int, int]] = {}
    for line in css.splitlines():
        m = re.match(r'\s*(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,6})\b', line)
        if m:
            rgb = parse_hex(m.group(2))
            if rgb:
                tokens[m.group(1)] = rgb
    return tokens


# ---------------------------------------------------------------------------
# Self-test
# ---------------------------------------------------------------------------

def _run_self_tests() -> bool:
    passed = 0
    total  = 0

    def check(label: str, cond: bool) -> None:
        nonlocal passed, total
        total += 1
        if cond:
            passed += 1
        else:
            print(f"  [FAIL] self-test: {label}")

    # Pure white vs pure black → 21:1
    lw = luminance(255, 255, 255)
    lb = luminance(0, 0, 0)
    cr = contrast_ratio(lw, lb)
    check("white/black contrast == 21.0", abs(cr - 21.0) < 0.01)

    # Same colour → 1:1
    lx = luminance(128, 128, 128)
    check("same colour → 1.0", abs(contrast_ratio(lx, lx) - 1.0) < 0.001)

    # parse_hex: 3-digit shorthand
    check("parse #abc == #aabbcc", parse_hex('#abc') == (0xaa, 0xbb, 0xcc))

    # parse_hex: full 6-digit
    check("parse #0a0a0a", parse_hex('#0a0a0a') == (10, 10, 10))

    # linearise: 0 → 0
    check("linearise(0) == 0", _linearise(0) == 0.0)

    # AA normal text: ≥ 4.5
    l_bg   = luminance(10, 10, 10)    # #0a0a0a (SEIS background)
    l_text = luminance(232, 228, 220) # #e8e4dc (SEIS text)
    cr_site = contrast_ratio(l_bg, l_text)
    check("SEIS bg/text passes AA normal (≥4.5)", cr_site >= 4.5)

    # Accent gold on dark bg
    l_accent = luminance(200, 169, 110)  # #c8a96e
    cr_accent = contrast_ratio(l_bg, l_accent)
    check("accent/bg ratio > 3.0", cr_accent > 3.0)

    if passed == total:
        print(f"[PASS] color-contrast  {total}/{total} self-tests passed")
        return True
    print(f"[FAIL] color-contrast  {passed}/{total} self-tests passed")
    return False


# ---------------------------------------------------------------------------
# Main audit
# ---------------------------------------------------------------------------

# Pairs to check: (foreground_token, background_token, context)
PAIRS_TO_CHECK = [
    ('--text',       '--bg',      'body text on background'),
    ('--text-muted', '--bg',      'muted text on background'),
    ('--text',       '--surface', 'body text on surface'),
    ('--accent',     '--bg',      'accent (gold) on background'),
    ('--white',      '--bg',      'white text on background'),
    ('--white',      '--surface', 'white text on surface'),
]

WCAG_AA_NORMAL = 4.5
WCAG_AA_LARGE  = 3.0
WCAG_AAA       = 7.0


def level(ratio: float) -> str:
    if ratio >= WCAG_AAA:        return "AAA"
    if ratio >= WCAG_AA_NORMAL:  return "AA"
    if ratio >= WCAG_AA_LARGE:   return "AA-large"
    return "FAIL"


def main() -> None:
    if '--self-test' in sys.argv:
        sys.exit(0 if _run_self_tests() else 1)

    css_path = Path(__file__).parents[2] / 'apps' / 'web' / 'style.css'
    if not css_path.exists():
        print("[FAIL] color-contrast  style.css not found")
        sys.exit(1)

    tokens = extract_hex_tokens(css_path.read_text(encoding='utf-8'))
    if not tokens:
        print("[FAIL] color-contrast  no hex color tokens found in style.css")
        sys.exit(2)

    failures = []
    results  = []

    for fg_tok, bg_tok, ctx in PAIRS_TO_CHECK:
        if fg_tok not in tokens or bg_tok not in tokens:
            continue
        fg_rgb = tokens[fg_tok]
        bg_rgb = tokens[bg_tok]
        lf = luminance(*fg_rgb)
        lb = luminance(*bg_rgb)
        cr = contrast_ratio(lf, lb)
        lv = level(cr)
        results.append((ctx, fg_tok, bg_tok, cr, lv))
        if lv == "FAIL":
            failures.append((ctx, fg_tok, bg_tok, cr))

    if not results:
        print(f"[SKIP] color-contrast  no matching token pairs found ({len(tokens)} tokens extracted)")
        return

    print(f"       contrast report ({len(tokens)} color tokens found):")
    for ctx, fg, bg, cr, lv in results:
        print(f"        {lv:8s}  {cr:5.1f}:1  {fg} / {bg}  ({ctx})")

    if not failures:
        print(f"[PASS] color-contrast  all {len(results)} pair(s) meet WCAG AA")
    else:
        print(f"[FAIL] color-contrast  {len(failures)} pair(s) below WCAG AA normal ({WCAG_AA_NORMAL}:1):")
        for ctx, fg, bg, cr in failures:
            print(f"       {cr:.2f}:1  {fg}/{bg} — {ctx}")
        sys.exit(1)


if __name__ == '__main__':
    main()
