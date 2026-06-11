#!/usr/bin/env python3

import json
import subprocess
import sys
from pathlib import Path


ROOT = Path.cwd()

REQUIRED_FILES = [
    "packages/seis_kernel/__init__.py",
    "packages/seis_kernel/capabilities.py",
    "packages/seis_kernel/plugin_inventory.py",
    "packages/seis_kernel/platform_matrix.py",
    "packages/seis_kernel/test_capability_kernel.py",
    "packages/seis_kernel_go/go.mod",
    "packages/seis_kernel_go/capability_budget.go",
    "packages/seis_kernel_go/capability_budget_test.go",
    "polyglot/rust/seis_capability_kernel.rs",
    "polyglot/sql/seis_capability_kernel_schema.sql",
    "polyglot/rego/seis_capability_gate.rego",
    "polyglot/cue/seis_capability_kernel.cue",
    "packages/seis_platform_swift/Package.swift",
    "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisPlatformPolicy.swift",
    "packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisPlatformPolicyTests.swift",
    "polyglot/swiftui-playground/SEISPlatformPlayground.playground/Contents.swift",
    "polyglot/swiftui-playground/SEISPlatformPlayground.playground/contents.xcplayground",
    "polyglot/objective-c/SEISPlatformBridge.h",
    "polyglot/objective-c/SEISPlatformBridge.m",
    "polyglot/applescript/seis_platform_automation.applescript",
    "packages/seis_windows_csharp/SeisPlatformPolicy.csproj",
    "packages/seis_windows_csharp/SeisPlatformPolicy.cs",
    "polyglot/powershell/SeisPlatformReadiness.ps1",
    "polyglot/windows/dotnet/SeisWindowsPlatform.fs",
    "polyglot/windows/dotnet/SeisWindowsPlatform.vb",
    "polyglot/windows/native/seis_windows_platform.hpp",
    "polyglot/windows/native/seis_windows_platform.cpp",
    "polyglot/windows/go/seis_windows_platform.go",
    "polyglot/windows/rust/seis_windows_platform.rs",
    "polyglot/windows/jvm/SeisWindowsPlatform.java",
    "polyglot/windows/jvm/SeisWindowsPlatform.kt",
    "polyglot/windows/scripting/seis_windows_platform.py",
    "polyglot/windows/scripting/seis_windows_platform.bat",
    "polyglot/windows/scripting/seis_windows_platform.cmd",
    "polyglot/windows/scripting/seis_windows_platform.lua",
    "polyglot/windows/scripting/seis_windows_platform.rb",
    "polyglot/windows/scripting/seis_windows_platform.php",
    "polyglot/windows/data/seis_windows_platform.sql",
    "polyglot/windows/data/seis_windows_platform.r",
]

PYTHON_COMPILE_TARGETS = [
    "packages/seis_kernel/__init__.py",
    "packages/seis_kernel/capabilities.py",
    "packages/seis_kernel/plugin_inventory.py",
    "packages/seis_kernel/platform_matrix.py",
    "scripts/create-seis-universal-capability-kernel.py",
    "scripts/check-seis-nonjs-kernel.py",
    "scripts/check-seis-platform-kernel.py",
    "polyglot/windows/scripting/seis_windows_platform.py",
]


def main() -> int:
    failures: list[str] = []

    for rel_path in REQUIRED_FILES:
        if not (ROOT / rel_path).exists():
            failures.append(f"missing non-JS kernel surface: {rel_path}")

    if failures:
        return fail(failures)

    failures.extend(run(["python3", "-m", "py_compile", *PYTHON_COMPILE_TARGETS], ROOT))
    failures.extend(run(["python3", "-m", "unittest", "packages.seis_kernel.test_capability_kernel"], ROOT))
    failures.extend(run(["go", "test", "./..."], ROOT / "packages" / "seis_kernel_go"))
    failures.extend(run(["python3", "scripts/check-seis-platform-kernel.py"], ROOT))
    failures.extend(validate_contract())

    if failures:
        return fail(failures)

    print("SEIS non-JavaScript kernel check passed.")
    return 0


def validate_contract() -> list[str]:
    path = ROOT / "content" / "development" / "seis-universal-capability-kernel.json"
    if not path.exists():
        return [f"missing generated kernel contract: {relative(path)}"]

    data = json.loads(path.read_text(encoding="utf-8"))
    summary = data.get("summary", {})
    failures = []
    if summary.get("domainCount", 0) < 38:
        failures.append("kernel contract must keep at least 38 domains")
    if summary.get("pluginInventoryCount", 0) < 120:
        failures.append("kernel contract must keep at least 120 inventoried plugins")
    if summary.get("coveredPluginCount", 0) < 60:
        failures.append("kernel contract must route at least 60 plugins through domains")
    if summary.get("platformCount", 0) < 2:
        failures.append("kernel contract must include macOS and Windows platform support")
    if summary.get("appleLanguageCount", 0) < 3:
        failures.append("kernel contract must include Swift, Objective-C, and AppleScript")
    if summary.get("windowsLanguageCount", 0) < 12:
        failures.append("kernel contract must include primary Windows development language families")
    if "pluginInventory" not in data:
        failures.append("kernel contract must include pluginInventory")
    if "platformCompatibility" not in data:
        failures.append("kernel contract must include platformCompatibility")
    return failures


def run(command: list[str], cwd: Path) -> list[str]:
    result = subprocess.run(command, cwd=cwd, text=True, capture_output=True)
    if result.returncode == 0:
        return []
    output = "\n".join(part for part in [result.stdout.strip(), result.stderr.strip()] if part)
    return [f"{' '.join(command)} failed in {relative(cwd)}: {output}"]


def fail(failures: list[str]) -> int:
    print("SEIS non-JavaScript kernel check failed:", file=sys.stderr)
    for failure in failures:
        print(f"- {failure}", file=sys.stderr)
    return 1


def relative(path: Path) -> str:
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        return str(path)


if __name__ == "__main__":
    raise SystemExit(main())
