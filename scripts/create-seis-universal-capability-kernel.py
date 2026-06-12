#!/usr/bin/env python3

import json
import sys
from pathlib import Path


ROOT = Path.cwd()
sys.path.insert(0, str(ROOT))

from packages.seis_kernel import build_capability_contract, validate_capability_contract  # noqa: E402


SOURCE_PATH = ROOT / "content" / "development" / "seis-universal-capability-kernel.json"
REPORT_JSON_PATH = ROOT / "reports" / "seis-universal-capability-kernel.json"
REPORT_MD_PATH = ROOT / "reports" / "seis-universal-capability-kernel.md"
CHECK_MODE = "--check" in sys.argv

NON_JS_SURFACES = [
    "packages/seis_kernel/plugin_inventory.py",
    "packages/seis_kernel/test_capability_kernel.py",
    "packages/seis_kernel_go/capability_budget.go",
    "packages/seis_kernel_go/capability_budget_test.go",
    "polyglot/rust/seis_capability_kernel.rs",
    "polyglot/sql/seis_capability_kernel_schema.sql",
    "polyglot/rego/seis_capability_gate.rego",
    "polyglot/cue/seis_capability_kernel.cue",
    "packages/seis_platform_swift/Package.swift",
    "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisPlatformPolicy.swift",
    "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAppleContinuationSurface.swift",
    "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAppleRunHandoffContract.swift",
    "packages/seis_platform_swift/Sources/SeisAppleNativeShell/App/SeisAppleNativeShellApp.swift",
    "packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/AppleContinuationWindow.swift",
    "packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisPlatformPolicyTests.swift",
    "polyglot/swiftui-playground/SEISPlatformPlayground.playground/Contents.swift",
    "polyglot/swiftui-playground/SEISPlatformPlayground.playground/contents.xcplayground",
    "packages/seis_kernel/platform_matrix.py",
    "packages/seis_kernel/platform_language_policy.py",
    "packages/seis_kernel/platform_development_tracks.py",
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
    if "--help" in sys.argv or "-h" in sys.argv:
        print_help()
        return 0

    unknown = [arg for arg in sys.argv[1:] if arg not in {"--check", "--help", "-h"}]
    if unknown:
        print(f"Unsupported option: {', '.join(unknown)}", file=sys.stderr)
        print_help()
        return 1

    contract = build_capability_contract()
    failures = validate_capability_contract(contract)
    if failures:
        print("SEIS universal capability kernel is invalid:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    source_json = stable_json(contract)
    report_json = stable_json(build_report(contract))
    report_md = build_markdown(contract)

    if CHECK_MODE:
        return check_outputs(source_json, report_json, report_md)

    write_text(SOURCE_PATH, source_json)
    write_text(REPORT_JSON_PATH, report_json)
    write_text(REPORT_MD_PATH, report_md)
    print("SEIS universal capability kernel written:")
    print(f"- {relative(SOURCE_PATH)}")
    print(f"- {relative(REPORT_JSON_PATH)}")
    print(f"- {relative(REPORT_MD_PATH)}")
    return 0


def print_help() -> None:
    print(
        """SEIS universal capability kernel

Commands:
  python3 scripts/create-seis-universal-capability-kernel.py
  python3 scripts/create-seis-universal-capability-kernel.py --check

The kernel covers AI, agents, MCP, skills, plugins, LLM routing, engineering,
design, data, security, operations, research, and software governance domains.
"""
    )


def build_report(contract: dict) -> dict:
    domains = contract["domains"]
    lanes = contract["summary"]["lanes"]
    return {
        "version": contract["version"],
        "id": "seis-universal-capability-kernel-report",
        "source": relative(SOURCE_PATH),
        "summary": contract["summary"],
        "laneCoverage": [{"lane": lane, "domainCount": count} for lane, count in lanes.items()],
        "pluginInventory": {
            "groupCount": contract["pluginInventory"]["groupCount"],
            "pluginCount": contract["pluginInventory"]["pluginCount"],
            "coveredPluginCount": contract["pluginInventory"]["coveredPluginCount"],
            "coverageByGroup": contract["pluginInventory"]["coverageByGroup"],
        },
        "platformCompatibility": contract["platformCompatibility"],
        "platformLanguagePolicy": contract["platformLanguagePolicy"],
        "platformDevelopmentTracks": contract["platformDevelopmentTracks"],
        "nonJavaScriptSurfaces": NON_JS_SURFACES,
        "domainIndex": [
            {
                "id": item["id"],
                "label": item["label"],
                "lane": item["lane"],
                "agentRole": item["agentRole"],
                "primaryQualityGates": item["qualityGates"][:5],
            }
            for item in domains
        ],
        "executionBoundary": contract["routingContract"]["executionBoundary"],
        "flowchart": contract["flowchart"],
    }


def build_markdown(contract: dict) -> str:
    summary = contract["summary"]
    lines = [
        "# SEIS Universal Capability Kernel",
        "",
        f"- Mode: `{contract['mode']}`",
        f"- Domains: {summary['domainCount']}",
        f"- Lanes: {summary['laneCount']}",
        f"- Required domains: {summary['requiredDomainCount']}",
        f"- Plugin groups: {summary['pluginGroupCount']}",
        f"- Plugins inventoried: {summary['pluginInventoryCount']}",
        f"- Plugins covered by domain routing: {summary['coveredPluginCount']}",
        f"- Platform surfaces: {summary['platformCount']}",
        f"- Apple native languages: {', '.join(contract['platformCompatibility']['summary']['appleLanguages'])}",
        f"- Apple frameworks: {', '.join(contract['platformCompatibility']['summary']['appleFrameworks'])}",
        f"- Windows native languages: {', '.join(contract['platformCompatibility']['summary']['windowsLanguages'])}",
        f"- Windows frameworks: {', '.join(contract['platformCompatibility']['summary']['windowsFrameworks'])}",
        f"- Windows policy language count: {contract['platformLanguagePolicy']['summary']['windowsLanguageCount']}",
        f"- Platform development tracks: {contract['platformDevelopmentTracks']['summary']['trackCount']}",
        f"- Windows development language coverage: {contract['platformDevelopmentTracks']['summary']['windowsLanguageCoverageCount']}",
        "",
        "## SEIS Routing Contract",
        "",
        f"- Entrypoint: `{contract['routingContract']['entrypoint']}`",
        f"- SEIS role: {contract['routingContract']['seisRole']}",
        f"- Execution boundary: {contract['routingContract']['executionBoundary']}",
        "",
        "## Flow",
        "",
        "```mermaid",
        contract["flowchart"],
        "```",
        "",
        "## Lane Coverage",
        "",
        "| Lane | Domain Count |",
        "| --- | ---: |",
    ]

    for lane, count in contract["summary"]["lanes"].items():
        lines.append(f"| `{lane}` | {count} |")

    lines.extend(
        [
            "",
            "## Plugin Group Coverage",
            "",
            "| Group | Routed Mentions |",
            "| --- | ---: |",
        ]
    )

    for group, count in contract["pluginInventory"]["coverageByGroup"].items():
        lines.append(f"| `{group}` | {count} |")

    lines.extend(
        [
            "",
            "## Platform Compatibility",
            "",
            "| Platform | Languages | Local Helpers | Quality Gates |",
            "| --- | --- | --- | --- |",
        ]
    )

    for surface in contract["platformCompatibility"]["surfaces"]:
        lines.append(
            f"| {surface['label']} | {', '.join(surface['languages'])} | {', '.join(surface['localHelpers'])} | {', '.join(surface['qualityGates'][:4])} |"
        )

    lines.extend(
        [
            "",
            "## Platform Language Policy",
            "",
            f"- Apple only: {', '.join(contract['platformLanguagePolicy']['apple']['allowedLanguageSurfaces'])}",
            f"- Windows excludes: {', '.join(contract['platformLanguagePolicy']['windows']['excludedLanguageSurfaces'])}",
            f"- Windows allowed count: {contract['platformLanguagePolicy']['summary']['windowsLanguageCount']}",
            "",
            "## Platform Development Tracks",
            "",
            "| Track | Platforms | Languages | Rule |",
            "| --- | --- | --- | --- |",
        ]
    )

    for track in contract["platformDevelopmentTracks"]["tracks"]:
        languages = ", ".join(track["languages"]) if track["languages"] else "policy-only"
        lines.append(
            f"| {track['label']} | {', '.join(track['platformScope'])} | {languages} | {track['executionRule']} |"
        )

    lines.extend(
        [
            "",
            "## Domain Index",
            "",
            "| Domain | Lane | Agent Role | Algorithms | Quality Gates |",
            "| --- | --- | --- | --- | --- |",
        ]
    )

    for item in contract["domains"]:
        algorithms = ", ".join(item["algorithms"][:3])
        quality = ", ".join(item["qualityGates"][:4])
        lines.append(
            f"| {item['label']} | `{item['lane']}` | `{item['agentRole']}` | {algorithms} | {quality} |"
        )

    lines.extend(
        [
            "",
            "## Source References",
            "",
        ]
    )

    for label, path in contract["sourceReferences"].items():
        lines.append(f"- `{label}`: `{path}`")

    lines.append("")
    return "\n".join(lines)


def check_outputs(source_json: str, report_json: str, report_md: str) -> int:
    failures = []
    expected = {
        SOURCE_PATH: source_json,
        REPORT_JSON_PATH: report_json,
        REPORT_MD_PATH: report_md,
    }

    for path, content in expected.items():
        if not path.exists():
            failures.append(f"missing output: {relative(path)}")
        elif path.read_text(encoding="utf-8") != content:
            failures.append(f"stale output: {relative(path)}")

    for rel_path in NON_JS_SURFACES:
        if not (ROOT / rel_path).exists():
            failures.append(f"missing non-JS surface: {rel_path}")

    if failures:
        print("SEIS universal capability kernel check failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        print("Run: npm run automation:universal-capability-kernel", file=sys.stderr)
        return 1

    print("SEIS universal capability kernel check passed.")
    return 0


def stable_json(data: dict) -> str:
    return json.dumps(data, indent=2, ensure_ascii=False) + "\n"


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


if __name__ == "__main__":
    raise SystemExit(main())
