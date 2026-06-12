"""macOS and Windows platform compatibility matrix for SEIS."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .platform_language_policy import (
    APPLE_ONLY_LANGUAGE_SURFACES,
    WINDOWS_REQUIRED_LANGUAGE_SURFACES,
    windows_language_set,
)


@dataclass(frozen=True)
class PlatformSurface:
    id: str
    label: str
    os_family: str
    languages: tuple[str, ...]
    local_helpers: tuple[str, ...]
    remote_helpers: tuple[str, ...]
    agent_roles: tuple[str, ...]
    quality_gates: tuple[str, ...]
    source_surfaces: tuple[str, ...]
    frameworks: tuple[str, ...] = ()

    def as_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "label": self.label,
            "osFamily": self.os_family,
            "languages": list(self.languages),
            "localHelpers": list(self.local_helpers),
            "remoteHelpers": list(self.remote_helpers),
            "agentRoles": list(self.agent_roles),
            "qualityGates": list(self.quality_gates),
            "sourceSurfaces": list(self.source_surfaces),
            "frameworks": list(self.frameworks),
        }


APPLE_NATIVE_LANGUAGES = set(APPLE_ONLY_LANGUAGE_SURFACES)

WINDOWS_DEVELOPMENT_LANGUAGES = {
    *windows_language_set(),
}


PLATFORM_SURFACES = [
    PlatformSurface(
        id="macos-apple-native",
        label="macOS Apple Native",
        os_family="macos",
        languages=("Swift", "SwiftUI", "Objective-C", "Playground", "AppleScript"),
        local_helpers=("SwiftPM", "xcodebuild", "xcrun", "osascript", "osacompile"),
        remote_helpers=("SEIS Agent", "OpenAI", "Claude", "Gemini"),
        agent_roles=("macos-agent", "apple-platform-agent", "local-helper-agent"),
        quality_gates=(
            "swift_test",
            "swiftui_playground_surface",
            "objective_c_syntax",
            "applescript_syntax_when_available",
            "apple_native_only_policy",
            "permission_scope",
            "offline_fallback",
            "notarization_awareness",
            "accessibility_when_ui",
        ),
        source_surfaces=(
            "packages/seis_platform_swift/Package.swift",
            "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisPlatformPolicy.swift",
            "polyglot/objective-c/SEISPlatformBridge.h",
            "polyglot/objective-c/SEISPlatformBridge.m",
            "polyglot/swiftui-playground/SEISPlatformPlayground.playground/Contents.swift",
            "polyglot/applescript/seis_platform_automation.applescript",
        ),
        frameworks=("SwiftUI", "AppKit", "Metal", "Combine", "Core Data", "CloudKit", "Foundation", "PlaygroundSupport", "AppleScript"),
    ),
    PlatformSurface(
        id="ios-apple-native",
        label="iOS Apple Native",
        os_family="ios",
        languages=("Swift", "SwiftUI", "Objective-C"),
        local_helpers=("Xcode", "xcodebuild", "xcrun", "simctl"),
        remote_helpers=("SEIS Agent", "OpenAI", "Claude", "Gemini"),
        agent_roles=("ios-agent", "apple-platform-agent", "mobile-agent"),
        quality_gates=(
            "swift_test",
            "swiftui_ios_surface",
            "objective_c_bridge_review",
            "uikit_accessibility",
            "metal_rendering_budget",
            "combine_state_flow_review",
            "coredata_cloudkit_sync_review",
            "app_privacy_review",
        ),
        source_surfaces=(
            "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisPlatformPolicy.swift",
            "packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisPlatformPolicyTests.swift",
            "polyglot/swift/SEISMotionPolicy.swift",
        ),
        frameworks=("SwiftUI", "UIKit", "Metal", "Combine", "Core Data", "CloudKit", "Foundation"),
    ),
    PlatformSurface(
        id="windows-native",
        label="Windows Native",
        os_family="windows",
        languages=tuple(sorted(WINDOWS_REQUIRED_LANGUAGE_SURFACES)),
        local_helpers=("PowerShell", "dotnet", "winget", "python", "go", "rustc", "javac", "clang++"),
        remote_helpers=("SEIS Agent", "OpenAI", "Claude", "Gemini"),
        agent_roles=("windows-agent", "powershell-ops-agent", "dotnet-agent", "polyglot-runtime-agent"),
        quality_gates=(
            "powershell_policy",
            "dotnet_readiness",
            "windows_multilang_source_surface",
            "native_cpp_syntax_when_available",
            "jvm_syntax_when_available",
            "windows_path_safety",
            "permission_scope",
            "offline_fallback",
            "event_log_awareness",
            "no_swift_windows_surface",
        ),
        source_surfaces=(
            "packages/seis_windows_csharp/SeisPlatformPolicy.cs",
            "packages/seis_windows_csharp/SeisPlatformPolicy.csproj",
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
        ),
        frameworks=(".NET", "WinUI", "WPF", "Windows Terminal", "WSL-aware CLI"),
    ),
]


def build_platform_contract() -> dict[str, Any]:
    apple_languages = sorted(
        {
            language
            for surface in PLATFORM_SURFACES
            if surface.os_family in {"macos", "ios"}
            for language in surface.languages
            if language in APPLE_NATIVE_LANGUAGES
        }
    )
    windows_languages = sorted(
        {
            language
            for surface in PLATFORM_SURFACES
            if surface.os_family == "windows"
            for language in surface.languages
            if language in WINDOWS_DEVELOPMENT_LANGUAGES
        }
    )
    apple_frameworks = sorted(
        {
            framework
            for surface in PLATFORM_SURFACES
            if surface.os_family in {"macos", "ios"}
            for framework in surface.frameworks
        }
    )
    windows_frameworks = sorted(
        {
            framework
            for surface in PLATFORM_SURFACES
            if surface.os_family == "windows"
            for framework in surface.frameworks
        }
    )
    return {
        "version": 1,
        "id": "seis-platform-compatibility-kernel",
        "mode": "macos_windows_native_and_cross_platform_support",
        "summary": {
            "platformCount": len(PLATFORM_SURFACES),
            "appleLanguageCount": len(apple_languages),
            "windowsLanguageCount": len(windows_languages),
            "appleLanguages": apple_languages,
            "windowsLanguages": windows_languages,
            "appleFrameworks": apple_frameworks,
            "windowsFrameworks": windows_frameworks,
        },
        "surfaces": [surface.as_dict() for surface in PLATFORM_SURFACES],
        "routingRule": "SEIS remains the user-facing agent; platform helpers execute only inside local permission, credential, and OS boundaries.",
    }
