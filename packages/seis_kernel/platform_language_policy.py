"""Platform language policy for Windows-heavy and Apple-native SEIS work."""

from __future__ import annotations

from typing import Any


APPLE_ONLY_LANGUAGE_SURFACES = ("Swift", "SwiftUI", "Objective-C", "Playground", "AppleScript")
APPLE_ALLOWED_SOURCE_ROOTS = (
    "packages/seis_platform_swift/",
    "polyglot/objective-c/",
    "polyglot/swiftui-playground/",
    "polyglot/applescript/",
)

WINDOWS_EXCLUDED_LANGUAGE_SURFACES = ("Swift", "SwiftUI", "Objective-C", "Playground", "AppleScript")
WINDOWS_REQUIRED_LANGUAGE_SURFACES = (
    "C#",
    "F#",
    "Visual Basic",
    "PowerShell",
    "Batch",
    "CMD",
    "C",
    "C++",
    "Rust",
    "Go",
    "Python",
    "Java",
    "Kotlin",
    "SQL",
    "R",
    "Lua",
    "Ruby",
    "PHP",
)
WINDOWS_EXTENDED_LANGUAGE_SURFACES = (
    "TypeScript",
    "JavaScript",
    "Dart",
    "Scala",
    "Groovy",
    "Haskell",
    "OCaml",
    "Nim",
    "Zig",
    "Fortran",
    "COBOL",
    "Perl",
    "Awk",
    "Tcl",
    "Shell",
    "YAML",
    "JSON Schema",
    "OpenAPI",
    "Terraform",
    "Bicep",
    "Dockerfile",
    "Make",
    "CMake",
)


def apple_language_set() -> set[str]:
    return set(APPLE_ONLY_LANGUAGE_SURFACES)


def windows_language_set() -> set[str]:
    return (set(WINDOWS_REQUIRED_LANGUAGE_SURFACES) | set(WINDOWS_EXTENDED_LANGUAGE_SURFACES)) - set(
        WINDOWS_EXCLUDED_LANGUAGE_SURFACES
    )


def build_platform_language_policy() -> dict[str, Any]:
    apple_languages = sorted(apple_language_set())
    windows_languages = sorted(windows_language_set())
    return {
        "version": 1,
        "id": "seis-platform-language-policy",
        "mode": "windows_polyglot_except_apple_only_and_apple_native_only",
        "summary": {
            "appleLanguageCount": len(apple_languages),
            "windowsLanguageCount": len(windows_languages),
            "windowsRequiredLanguageCount": len(WINDOWS_REQUIRED_LANGUAGE_SURFACES),
            "appleOnlyLanguageSurfaces": apple_languages,
            "windowsExcludedLanguageSurfaces": sorted(WINDOWS_EXCLUDED_LANGUAGE_SURFACES),
        },
        "apple": {
            "platforms": ["macos", "ios"],
            "allowedLanguageSurfaces": apple_languages,
            "allowedSourceRoots": list(APPLE_ALLOWED_SOURCE_ROOTS),
            "rule": "Apple platform work uses only Swift, SwiftUI, Objective-C, Playground, and AppleScript surfaces.",
        },
        "windows": {
            "platforms": ["windows"],
            "allowedLanguageSurfaces": windows_languages,
            "requiredLanguageSurfaces": list(WINDOWS_REQUIRED_LANGUAGE_SURFACES),
            "excludedLanguageSurfaces": sorted(WINDOWS_EXCLUDED_LANGUAGE_SURFACES),
            "rule": "Windows work is broad polyglot and excludes Apple-only Swift, SwiftUI, Objective-C, Playground, and AppleScript surfaces.",
        },
        "routingRule": "SEIS remains the primary agent; platform helpers are selected by OS boundary and language policy.",
    }


def platform_languages_for(platforms: list[str] | tuple[str, ...], requested_languages: list[str] | tuple[str, ...]) -> dict[str, list[str]]:
    requested = set(requested_languages)
    result: dict[str, list[str]] = {}
    for platform in platforms:
        if platform in {"macos", "ios"}:
            result[platform] = sorted(apple_language_set())
        elif platform == "windows":
            candidates = requested | set(WINDOWS_REQUIRED_LANGUAGE_SURFACES)
            result[platform] = sorted(candidates & windows_language_set())
        else:
            result[platform] = sorted(requested)
    return result


def validate_platform_language_policy(policy: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    apple_languages = set(policy.get("apple", {}).get("allowedLanguageSurfaces", []))
    windows_languages = set(policy.get("windows", {}).get("allowedLanguageSurfaces", []))
    windows_required = set(policy.get("windows", {}).get("requiredLanguageSurfaces", []))
    windows_excluded = set(policy.get("windows", {}).get("excludedLanguageSurfaces", []))

    if apple_languages != apple_language_set():
        failures.append("Apple language policy must be exactly Swift, SwiftUI, Objective-C, Playground, and AppleScript")
    if "Swift" in windows_languages or "SwiftUI" in windows_languages:
        failures.append("Windows language policy must not include Swift or SwiftUI")
    if windows_excluded != set(WINDOWS_EXCLUDED_LANGUAGE_SURFACES):
        failures.append("Windows excluded language policy must cover Apple-only language surfaces")
    missing_windows = windows_required - windows_languages
    if missing_windows:
        failures.append(f"Windows language policy missing required surfaces: {', '.join(sorted(missing_windows))}")
    if len(windows_languages) < 30:
        failures.append("Windows language policy must remain broad and aggressively polyglot")
    return failures


def validate_platform_language_assignments(items: list[dict[str, Any]]) -> list[str]:
    failures: list[str] = []
    apple_allowed = apple_language_set()
    windows_allowed = windows_language_set()
    for item in items:
        platform_languages = item.get("platformLanguagePolicy", {})
        for platform in ["macos", "ios"]:
            languages = set(platform_languages.get(platform, []))
            if languages and not languages.issubset(apple_allowed):
                failures.append(f"{item.get('id', '<unknown>')} has non-Apple language on {platform}: {sorted(languages - apple_allowed)}")
        languages = set(platform_languages.get("windows", []))
        if languages and not languages.issubset(windows_allowed):
            failures.append(f"{item.get('id', '<unknown>')} has forbidden Windows language: {sorted(languages - windows_allowed)}")
    return failures
