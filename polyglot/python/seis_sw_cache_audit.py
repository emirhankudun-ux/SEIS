#!/usr/bin/env python3
"""SEIS service worker PRECACHE integrity auditor.

Reads apps/web/service-worker.js, extracts every path in the PRECACHE array,
and verifies each one resolves to an existing file under apps/web/.

The "./" root entry maps to "index.html" (the directory default).  All other
"./foo" entries map to "apps/web/foo".

If a PRECACHE entry is missing from disk the service worker install step will
fail silently in the browser — the site appears to work but offline mode is
broken.

Usage: python3 polyglot/python/seis_sw_cache_audit.py [--self-test]
Exit:  0 PASS, 1 FAIL
"""

import re
import sys
from pathlib import Path

SW_FILE   = Path("apps/web/service-worker.js")
WEB_ROOT  = Path("apps/web")

# ─── extraction ──────────────────────────────────────────────────────────────

def extract_precache(source: str) -> list[str]:
    """Return the list of path strings from the PRECACHE array."""
    m = re.search(r'(?:var|const|let)\s+PRECACHE\s*=\s*\[([^\]]*)\]', source, re.DOTALL)
    if not m:
        return []
    block = m.group(1)
    return re.findall(r'["\']([^"\']+)["\']', block)


def resolve_path(entry: str, web_root: Path) -> Path:
    """Map a PRECACHE entry to an absolute file path."""
    stripped = entry.lstrip('.').lstrip('/')
    if stripped == '':
        return web_root / 'index.html'
    return web_root / stripped


# ─── self-test ───────────────────────────────────────────────────────────────

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

    # extract_precache
    src1 = 'var PRECACHE = ["./", "./index.html", "./style.css"];'
    check("extracts 3 entries",    extract_precache(src1) == ["./", "./index.html", "./style.css"])

    src2 = "var PRECACHE = ['./script.js'];"
    check("single-quoted entry",   extract_precache(src2) == ["./script.js"])

    src3 = 'var OTHER = ["x"];'
    check("missing PRECACHE → []", extract_precache(src3) == [])

    # resolve_path
    root = Path("/web")
    check("./ maps to index.html",   resolve_path("./",           root) == root / "index.html")
    check("./index.html resolves",    resolve_path("./index.html", root) == root / "index.html")
    check("./style.css resolves",     resolve_path("./style.css",  root) == root / "style.css")
    check("./dir/file.js resolves",   resolve_path("./dir/f.js",   root) == root / "dir" / "f.js")

    # end-to-end: entries that exist on the current machine
    web_root = Path("apps/web")
    if web_root.exists():
        real_src = SW_FILE.read_text(encoding="utf-8")
        entries  = extract_precache(real_src)
        check("at least 5 PRECACHE entries found", len(entries) >= 5)
        missing  = [e for e in entries if not resolve_path(e, web_root).exists()]
        check("all real PRECACHE entries on disk",  len(missing) == 0)

    if passed == total:
        print(f"[PASS] sw-cache-audit  {total}/{total} self-tests passed")
        return True
    print(f"[FAIL] sw-cache-audit  {passed}/{total} self-tests passed")
    return False


# ─── main ────────────────────────────────────────────────────────────────────

def main() -> None:
    if '--self-test' in sys.argv:
        sys.exit(0 if _run_self_tests() else 1)

    if not SW_FILE.exists():
        print(f"[FAIL] sw-cache-audit  {SW_FILE} not found")
        sys.exit(1)

    source  = SW_FILE.read_text(encoding='utf-8')
    entries = extract_precache(source)

    if not entries:
        print("[FAIL] sw-cache-audit  no PRECACHE array found in service-worker.js")
        sys.exit(1)

    missing = []
    for entry in entries:
        path = resolve_path(entry, WEB_ROOT)
        if not path.exists():
            missing.append((entry, path))

    print(f"       service-worker.js: {len(entries)} PRECACHE entries")

    if not missing:
        print(f"[PASS] sw-cache-audit  all {len(entries)} precached files exist on disk")
    else:
        print(f"[FAIL] sw-cache-audit  {len(missing)} precached file(s) missing:")
        for entry, path in missing:
            print(f"       '{entry}' → {path}")
        sys.exit(1)


if __name__ == '__main__':
    main()
