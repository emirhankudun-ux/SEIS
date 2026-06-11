"""Platform development tracks for Apple-native and Windows-polyglot SEIS work."""

from __future__ import annotations

from typing import Any

from .platform_language_policy import (
    APPLE_ONLY_LANGUAGE_SURFACES,
    WINDOWS_EXCLUDED_LANGUAGE_SURFACES,
    WINDOWS_EXTENDED_LANGUAGE_SURFACES,
    WINDOWS_REQUIRED_LANGUAGE_SURFACES,
    apple_language_set,
    windows_language_set,
)


APPLE_QUALITY_GATES = (
    "swift_test",
    "swiftui_playground_surface",
    "objective_c_syntax",
    "applescript_syntax_when_available",
    "xcode_toolchain_verified",
    "accessibility_when_ui",
    "sandbox_permission_review",
    "notarization_awareness",
)

WINDOWS_REQUIRED_QUALITY_GATES = (
    "no_swift_windows_surface",
    "dotnet_readiness_when_available",
    "powershell_policy",
    "cmd_batch_path_safety",
    "native_cpp_syntax_when_available",
    "jvm_syntax_when_available",
    "offline_fallback",
    "remote_agent_reasoning_only",
)

WINDOWS_EXTENDED_QUALITY_GATES = (
    "no_swift_windows_surface",
    "language_budget_kept_under_target",
    "runtime_install_requirement_led",
    "artifact_root_declared",
    "polyglot_matrix_consistent",
    "generated_output_idempotent",
)

GOVERNANCE_QUALITY_GATES = (
    "apple_native_only_boundary",
    "windows_no_apple_only_boundary",
    "javascript_compatibility_only",
    "explicit_commit_approval",
    "explicit_push_approval",
    "deterministic_refresh",
)


def build_platform_development_tracks() -> dict[str, Any]:
    apple_track = {
        "id": "apple-native-macos-track",
        "label": "Apple Native macOS Track",
        "lane": "apple_native",
        "platformScope": ["macos"],
        "relatedPlatforms": ["ios"],
        "languages": sorted(APPLE_ONLY_LANGUAGE_SURFACES),
        "forbiddenLanguages": sorted(windows_language_set() - {"C", "C++"}),
        "sourceRoots": [
            "packages/seis_platform_swift/",
            "polyglot/objective-c/",
            "polyglot/swiftui-playground/",
            "polyglot/applescript/",
        ],
        "validationCommands": [
            "swift test",
            "xcrun swift --version",
            "xcodebuild -version",
            "xcrun clang -fsyntax-only -fobjc-arc -framework Foundation polyglot/objective-c/SEISPlatformBridge.m",
            "osacompile -o /tmp/seis-platform-automation.scpt polyglot/applescript/seis_platform_automation.applescript",
        ],
        "agentRoles": ["macos-agent", "apple-platform-agent", "local-helper-agent"],
        "artifacts": [
            "SwiftPM package surfaces",
            "SwiftUI playground live view",
            "Objective-C bridge header and implementation",
            "AppleScript automation bridge",
        ],
        "qualityGates": list(APPLE_QUALITY_GATES),
        "executionRule": "Apple platform work may only use Swift, SwiftUI, Objective-C, Playground, and AppleScript surfaces.",
    }

    windows_required_track = {
        "id": "windows-required-polyglot-track",
        "label": "Windows Required Polyglot Track",
        "lane": "windows_required",
        "platformScope": ["windows"],
        "languages": list(WINDOWS_REQUIRED_LANGUAGE_SURFACES),
        "forbiddenLanguages": sorted(WINDOWS_EXCLUDED_LANGUAGE_SURFACES),
        "sourceRoots": [
            "packages/seis_windows_csharp/",
            "polyglot/powershell/",
            "polyglot/windows/dotnet/",
            "polyglot/windows/native/",
            "polyglot/windows/go/",
            "polyglot/windows/rust/",
            "polyglot/windows/jvm/",
            "polyglot/windows/scripting/",
            "polyglot/windows/data/",
        ],
        "validationCommands": [
            "dotnet --info",
            "pwsh --version",
            "python3 --version",
            "go version",
            "rustc --version",
            "javac -version",
            "npm run check:seis-platform-kernel",
        ],
        "agentRoles": ["windows-agent", "dotnet-agent", "powershell-ops-agent", "polyglot-runtime-agent"],
        "artifacts": [
            ".NET C#/F#/Visual Basic policy surfaces",
            "PowerShell/Batch/CMD operation surfaces",
            "Native C/C++ and Rust/Go system surfaces",
            "JVM, scripting, and data-language surfaces",
        ],
        "qualityGates": list(WINDOWS_REQUIRED_QUALITY_GATES),
        "executionRule": "Windows work is broad polyglot and must never use Swift, SwiftUI, Objective-C, Playground, or AppleScript surfaces.",
    }

    windows_extended_languages = [
        language
        for language in WINDOWS_EXTENDED_LANGUAGE_SURFACES
        if language not in WINDOWS_EXCLUDED_LANGUAGE_SURFACES
    ]
    windows_extended_track = {
        "id": "windows-extended-polyglot-track",
        "label": "Windows Extended Polyglot Track",
        "lane": "windows_extended",
        "platformScope": ["windows"],
        "languages": windows_extended_languages,
        "forbiddenLanguages": sorted(WINDOWS_EXCLUDED_LANGUAGE_SURFACES),
        "sourceRoots": [
            "content/development/fullstack-language-matrix.json",
            "reports/language-distribution.json",
            "polyglot/windows/",
        ],
        "validationCommands": [
            "npm run check:fullstack-language-matrix",
            "npm run check:language-distribution",
            "npm run check:seis-nonjs-kernel",
        ],
        "agentRoles": ["polyglot-runtime-agent", "fullstack-agent", "data-platform-agent"],
        "artifacts": [
            "Full-stack language matrix alignment",
            "Generated language budget reports",
            "Future Windows language adapters",
        ],
        "qualityGates": list(WINDOWS_EXTENDED_QUALITY_GATES),
        "executionRule": "Extended Windows languages are allowed as needed; JavaScript stays compatibility-only and below the language budget.",
    }

    governance_track = {
        "id": "seis-platform-boundary-governance-track",
        "label": "SEIS Platform Boundary Governance Track",
        "lane": "governance",
        "platformScope": ["macos", "windows"],
        "languages": [],
        "forbiddenLanguages": [],
        "sourceRoots": [
            "packages/seis_kernel/",
            "scripts/",
            "content/development/",
            "reports/",
        ],
        "validationCommands": [
            "npm run check:seis-platform-language-policy",
            "npm run check:seis-platform-kernel",
            "npm run check:seis-nonjs-kernel",
            "npm run automation:refresh-seis-surface -- --summary",
        ],
        "agentRoles": ["seis-governance-agent", "quality-gate-agent"],
        "artifacts": [
            "Platform policy JSON and Markdown",
            "Development track JSON and Markdown",
            "Idempotent refresh summary",
        ],
        "qualityGates": list(GOVERNANCE_QUALITY_GATES),
        "executionRule": "SEIS stays primary; platform tracks only constrain safe execution boundaries.",
        "boundaryRules": [
            "macOS artifacts stay Apple-native only",
            "Windows artifacts exclude Apple-only language surfaces",
            "runtime installs are requirement-led, never percentage-led",
            "commit and push require explicit user approval",
        ],
    }

    tracks = [apple_track, windows_required_track, windows_extended_track, governance_track]
    windows_language_coverage = sorted(
        set(windows_required_track["languages"]) | set(windows_extended_track["languages"])
    )
    return {
        "version": 1,
        "id": "seis-platform-development-tracks",
        "mode": "macos_apple_native_and_windows_polyglot_execution_tracks",
        "summary": {
            "trackCount": len(tracks),
            "appleTrackCount": 1,
            "windowsTrackCount": 2,
            "governanceTrackCount": 1,
            "appleLanguageCount": len(apple_track["languages"]),
            "windowsRequiredLanguageCount": len(windows_required_track["languages"]),
            "windowsExtendedLanguageCount": len(windows_extended_track["languages"]),
            "windowsLanguageCoverageCount": len(windows_language_coverage),
            "qualityGateCount": len({gate for track in tracks for gate in track["qualityGates"]}),
        },
        "platformBoundaries": {
            "appleOnlyLanguageSurfaces": sorted(APPLE_ONLY_LANGUAGE_SURFACES),
            "windowsExcludedLanguageSurfaces": sorted(WINDOWS_EXCLUDED_LANGUAGE_SURFACES),
            "javascriptPolicy": "compatibility_only_keep_under_language_budget",
        },
        "tracks": tracks,
    }


def validate_platform_development_tracks(bundle: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    tracks = bundle.get("tracks", [])
    track_by_id = {track.get("id"): track for track in tracks}

    if len(tracks) < 4:
        failures.append("platform development tracks must include Apple, Windows required, Windows extended, and governance tracks")
    if len(track_by_id) != len(tracks):
        failures.append("platform development track ids must be unique")

    apple_track = track_by_id.get("apple-native-macos-track", {})
    if set(apple_track.get("languages", [])) != apple_language_set():
        failures.append("Apple development track must be exactly Swift, SwiftUI, Objective-C, Playground, and AppleScript")
    if "AppleScript" in set(apple_track.get("forbiddenLanguages", [])):
        failures.append("Apple development track must allow AppleScript")
    if any(command.startswith("code ") or "VS Code" in command for command in apple_track.get("validationCommands", [])):
        failures.append("Apple development track must not assume VS Code")

    windows_required = track_by_id.get("windows-required-polyglot-track", {})
    windows_required_languages = set(windows_required.get("languages", []))
    missing_required = set(WINDOWS_REQUIRED_LANGUAGE_SURFACES) - windows_required_languages
    if missing_required:
        failures.append(f"Windows required track missing languages: {', '.join(sorted(missing_required))}")

    windows_tracks = [
        track
        for track in tracks
        if "windows" in track.get("platformScope", []) and track.get("id") != "seis-platform-boundary-governance-track"
    ]
    for track in windows_tracks:
        forbidden = set(track.get("languages", [])) & set(WINDOWS_EXCLUDED_LANGUAGE_SURFACES)
        if forbidden:
            failures.append(f"{track.get('id', '<unknown>')} must not include Apple-only languages: {', '.join(sorted(forbidden))}")
        if "no_swift_windows_surface" not in track.get("qualityGates", []):
            failures.append(f"{track.get('id', '<unknown>')} must include no_swift_windows_surface")

    windows_coverage = set().union(*(set(track.get("languages", [])) for track in windows_tracks)) if windows_tracks else set()
    if len(windows_coverage) < 40:
        failures.append("Windows development tracks must keep broad language coverage")

    governance = track_by_id.get("seis-platform-boundary-governance-track", {})
    for gate in ["explicit_commit_approval", "explicit_push_approval", "deterministic_refresh"]:
        if gate not in governance.get("qualityGates", []):
            failures.append(f"governance track missing quality gate: {gate}")

    summary = bundle.get("summary", {})
    if summary.get("trackCount") != len(tracks):
        failures.append("platform development track summary must match track count")
    if summary.get("windowsLanguageCoverageCount", 0) < 40:
        failures.append("platform development summary must count broad Windows language coverage")

    return failures
