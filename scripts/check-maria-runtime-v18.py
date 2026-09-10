#!/usr/bin/env python3
from __future__ import annotations

import ast
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
PKG = ROOT / "packages" / "maria-runtime" / "python" / "maria_runtime"
LAUNCHER = ROOT / "apps" / "maria-desktop" / "maria.py"
TEST = ROOT / "test" / "maria-runtime-v18.test.py"
DOC = ROOT / "docs" / "architecture" / "MARIA_RUNTIME_V18.md"

required = [
    PKG / "__init__.py",
    PKG / "context.py",
    PKG / "registry.py",
    PKG / "permissions.py",
    PKG / "models.py",
    PKG / "routing.py",
    PKG / "cache.py",
    PKG / "safety.py",
    LAUNCHER,
    TEST,
    DOC,
]

errors: list[str] = []
for path in required:
    if not path.exists():
        errors.append(f"missing artifact: {path.relative_to(ROOT)}")

if not errors:
    for path in list(PKG.glob("*.py")) + [LAUNCHER]:
        try:
            ast.parse(path.read_text("utf-8"), filename=str(path))
        except SyntaxError as exc:
            errors.append(f"syntax error in {path.relative_to(ROOT)}: {exc}")

for path in list(PKG.glob("*.py")) + ([LAUNCHER] if LAUNCHER.exists() else []):
    text = path.read_text("utf-8")
    forbidden = [
        "shell=True",
        "urllib.request.urlopen",
        "requests.",
        "subprocess.Popen(",
        "os.system(",
    ]
    for marker in forbidden:
        if marker in text:
            errors.append(f"forbidden runtime marker {marker!r} in {path.relative_to(ROOT)}")

if LAUNCHER.exists():
    result = subprocess.run(
        [sys.executable, str(LAUNCHER), "--doctor"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=20,
    )
    if result.returncode != 0:
        errors.append(f"launcher doctor failed: {result.stdout[-500:]} {result.stderr[-500:]}")

if errors:
    print("maria-runtime-v18: failed")
    for error in errors:
        print(f"- {error}")
    raise SystemExit(1)

print("maria-runtime-v18: ok (modular, standard-library-only, no live execution)")
