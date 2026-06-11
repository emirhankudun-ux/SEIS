#!/usr/bin/env python3

import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path.cwd()

REQUIRED_FILES = [
    "packages/seis_platform_swift/Package.swift",
    "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisPlatformPolicy.swift",
    "packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisPlatformPolicyTests.swift",
    "polyglot/swiftui-playground/SEISPlatformPlayground.playground/Contents.swift",
    "polyglot/swiftui-playground/SEISPlatformPlayground.playground/contents.xcplayground",
    "packages/seis_kernel/platform_matrix.py",
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


def main() -> int:
    failures: list[str] = []
    for rel_path in REQUIRED_FILES:
        if not (ROOT / rel_path).exists():
            failures.append(f"missing platform surface: {rel_path}")

    if failures:
        return fail(failures)

    failures.extend(run([
        "python3",
        "-m",
        "py_compile",
        "packages/seis_kernel/platform_matrix.py",
        "scripts/check-seis-platform-kernel.py",
        "polyglot/windows/scripting/seis_windows_platform.py",
    ], ROOT))
    failures.extend(validate_surface_contents())
    failures.extend(run_swift_tests())
    failures.extend(run_objective_c_syntax())
    failures.extend(run_cpp_syntax_when_available())
    failures.extend(run_java_syntax_when_available())
    failures.extend(run_powershell_syntax_when_available())
    failures.extend(run_dotnet_build_when_available())

    if failures:
        return fail(failures)

    print("SEIS platform kernel check passed.")
    return 0


def validate_surface_contents() -> list[str]:
    failures: list[str] = []
    playground = (ROOT / "polyglot/swiftui-playground/SEISPlatformPlayground.playground/Contents.swift").read_text(
        encoding="utf-8"
    )
    if "import SwiftUI" not in playground or "PlaygroundPage.current.setLiveView" not in playground:
        failures.append("SwiftUI playground must import SwiftUI and set a live view")

    matrix = (ROOT / "packages/seis_kernel/platform_matrix.py").read_text(encoding="utf-8")
    for language in ["C#", "F#", "Visual Basic", "PowerShell", "Batch", "C++", "Rust", "Go", "Python", "Java", "Kotlin", "SQL"]:
        if language not in matrix:
            failures.append(f"Windows platform matrix missing language: {language}")
    return failures


def run_swift_tests() -> list[str]:
    if shutil.which("swift") is None:
        return ["swift is required for the macOS Apple-language platform package"]
    return run(["swift", "test"], ROOT / "packages" / "seis_platform_swift")


def run_objective_c_syntax() -> list[str]:
    if shutil.which("xcrun") is None:
        return []
    return run(
        [
            "xcrun",
            "clang",
            "-fsyntax-only",
            "-fobjc-arc",
            "-framework",
            "Foundation",
            "polyglot/objective-c/SEISPlatformBridge.m",
        ],
        ROOT,
    )


def run_cpp_syntax_when_available() -> list[str]:
    if shutil.which("xcrun") is None:
        return []
    return run(
        [
            "xcrun",
            "clang++",
            "-std=c++20",
            "-fsyntax-only",
            "polyglot/windows/native/seis_windows_platform.cpp",
        ],
        ROOT,
    )


def run_java_syntax_when_available() -> list[str]:
    if shutil.which("javac") is None:
        return []
    with tempfile.TemporaryDirectory(prefix="seis-java-check-") as temp_dir:
        return run(
            [
                "javac",
                "-d",
                temp_dir,
                "polyglot/windows/jvm/SeisWindowsPlatform.java",
            ],
            ROOT,
        )


def run_powershell_syntax_when_available() -> list[str]:
    pwsh = shutil.which("pwsh") or shutil.which("powershell")
    if pwsh is None:
        return []
    command = [
        pwsh,
        "-NoProfile",
        "-Command",
        "& { . './polyglot/powershell/SeisPlatformReadiness.ps1'; Test-SEISPlatformReadiness -Platform Windows -Languages @('C#','PowerShell') -QualityGates @('a','b','c','d','e') -OfflineHelperAvailable -RemoteBridgeAvailable | Out-Null }",
    ]
    return run(command, ROOT)


def run_dotnet_build_when_available() -> list[str]:
    if shutil.which("dotnet") is None:
        return []
    return run(["dotnet", "build", "--nologo"], ROOT / "packages" / "seis_windows_csharp")


def run(command: list[str], cwd: Path) -> list[str]:
    result = subprocess.run(command, cwd=cwd, text=True, capture_output=True)
    if result.returncode == 0:
        return []
    output = "\n".join(part for part in [result.stdout.strip(), result.stderr.strip()] if part)
    return [f"{' '.join(command)} failed in {relative(cwd)}: {output}"]


def fail(failures: list[str]) -> int:
    print("SEIS platform kernel check failed:", file=sys.stderr)
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
