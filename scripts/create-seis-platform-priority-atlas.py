#!/usr/bin/env python3

import json
import sys
from pathlib import Path


ROOT = Path.cwd()
sys.path.insert(0, str(ROOT))

from packages.seis_kernel.capabilities import REQUIRED_DOMAIN_IDS  # noqa: E402
from packages.seis_kernel.platform_priority_atlas import (  # noqa: E402
    build_platform_priority_atlas,
    validate_platform_priority_atlas,
)


SOURCE_PATH = ROOT / "content" / "development" / "seis-platform-priority-atlas.json"
REPORT_JSON_PATH = ROOT / "reports" / "seis-platform-priority-atlas.json"
REPORT_MD_PATH = ROOT / "reports" / "seis-platform-priority-atlas.md"
CHECK_MODE = "--check" in sys.argv


def main() -> int:
    if "--help" in sys.argv or "-h" in sys.argv:
        print_help()
        return 0

    unknown = [arg for arg in sys.argv[1:] if arg not in {"--check", "--help", "-h"}]
    if unknown:
        print(f"Unsupported option: {', '.join(unknown)}", file=sys.stderr)
        print_help()
        return 1

    atlas = build_platform_priority_atlas(REQUIRED_DOMAIN_IDS)
    failures = validate_platform_priority_atlas(atlas, REQUIRED_DOMAIN_IDS)
    if failures:
        print("SEIS platform priority atlas is invalid:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    source_json = stable_json(atlas)
    report_json = stable_json(build_report(atlas))
    report_md = build_markdown(atlas)

    if CHECK_MODE:
        return check_outputs(source_json, report_json, report_md)

    write_text(SOURCE_PATH, source_json)
    write_text(REPORT_JSON_PATH, report_json)
    write_text(REPORT_MD_PATH, report_md)
    print("SEIS platform priority atlas written:")
    print(f"- {relative(SOURCE_PATH)}")
    print(f"- {relative(REPORT_JSON_PATH)}")
    print(f"- {relative(REPORT_MD_PATH)}")
    return 0


def print_help() -> None:
    print(
        """SEIS platform priority atlas

Commands:
  python3 scripts/create-seis-platform-priority-atlas.py
  python3 scripts/create-seis-platform-priority-atlas.py --check

The atlas keeps SEIS AI, agent, MCP, skills, plugins, LLM, Apple-native,
Windows-polyglot, governance, data, security, and platform work before the
website. The website is the final release surface.
"""
    )


def build_report(atlas: dict) -> dict:
    return {
        "id": "seis-platform-priority-atlas-report",
        "source": relative(SOURCE_PATH),
        "mode": atlas["mode"],
        "summary": atlas["summary"],
        "rules": atlas["rules"],
        "phaseIndex": [
            {
                "order": phase["order"],
                "id": phase["id"],
                "label": phase["label"],
                "platformFocus": phase["platformFocus"],
                "languagePolicy": phase["languagePolicy"],
                "languageCount": len(phase["languages"]),
                "domainCount": len(phase["domains"]),
                "qualityGateCount": len(phase["qualityGates"]),
                "websiteAllowed": phase["websiteAllowed"],
            }
            for phase in atlas["phases"]
        ],
        "domainCoverage": atlas["domainCoverage"],
    }


def build_markdown(atlas: dict) -> str:
    summary = atlas["summary"]
    rules = atlas["rules"]
    lines = [
        "# SEIS Platform Priority Atlas",
        "",
        f"- Mode: `{atlas['mode']}`",
        f"- Phases: {summary['phaseCount']}",
        f"- Website final phase: {summary['websiteFinalPhase']}",
        f"- Apple language count: {summary['appleLanguageCount']}",
        f"- Windows language coverage: {summary['windowsLanguageCoverageCount']}",
        f"- Domain coverage: {summary['domainCoverageCount']}",
        f"- Runtime install policy: `{rules['runtimeInstallPolicy']}`",
        f"- Install all languages: {rules['installAllLanguages']}",
        "",
        "## Platform Rules",
        "",
        f"- Apple: {', '.join(rules['appleLanguageSurfaces'])}",
        f"- Windows excludes: {', '.join(rules['windowsExcludedLanguageSurfaces'])}",
        f"- SEIS primary agent: {rules['seisPrimaryAgent']}",
        "",
        "## Phase Order",
        "",
        "| Order | Phase | Platform Focus | Language Policy | Website | Gates |",
        "| ---: | --- | --- | --- | --- | ---: |",
    ]

    for phase in atlas["phases"]:
        website = "yes" if phase["websiteAllowed"] else "no"
        lines.append(
            f"| {phase['order']} | {phase['label']} | {', '.join(phase['platformFocus'])} | `{phase['languagePolicy']}` | {website} | {len(phase['qualityGates'])} |"
        )

    lines.extend(["", "## Phase Detail", ""])
    for phase in atlas["phases"]:
        lines.extend(
            [
                f"### {phase['order']}. {phase['label']}",
                "",
                f"- ID: `{phase['id']}`",
                f"- Languages: {', '.join(phase['languages'])}",
                f"- Domains: {', '.join(phase['domains'])}",
                f"- Done signal: {phase['doneSignal']}",
                "- Quality gates:",
            ]
        )
        lines.extend(f"  - `{gate}`" for gate in phase["qualityGates"])
        lines.append("")

    lines.extend(["## Covered Domains", ""])
    lines.extend(f"- `{domain}`" for domain in atlas["domainCoverage"])
    lines.append("")
    return "\n".join(lines)


def check_outputs(source_json: str, report_json: str, report_md: str) -> int:
    failures = []
    expected = [
        (SOURCE_PATH, source_json),
        (REPORT_JSON_PATH, report_json),
        (REPORT_MD_PATH, report_md),
    ]
    for path, text in expected:
        if not path.exists():
            failures.append(f"missing output: {relative(path)}")
        elif path.read_text(encoding="utf-8") != text:
            failures.append(f"stale output: {relative(path)}")

    if failures:
        print("SEIS platform priority atlas check failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        print("Run: npm run automation:seis-platform-priority-atlas", file=sys.stderr)
        return 1

    print("SEIS platform priority atlas check passed.")
    return 0


def stable_json(data: dict) -> str:
    return json.dumps(data, indent=2, ensure_ascii=False) + "\n"


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


if __name__ == "__main__":
    raise SystemExit(main())
