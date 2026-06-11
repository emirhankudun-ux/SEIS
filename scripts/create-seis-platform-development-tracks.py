#!/usr/bin/env python3

import json
import sys
from pathlib import Path


ROOT = Path.cwd()
sys.path.insert(0, str(ROOT))

from packages.seis_kernel.platform_development_tracks import (  # noqa: E402
    build_platform_development_tracks,
    validate_platform_development_tracks,
)


SOURCE_PATH = ROOT / "content" / "development" / "seis-platform-development-tracks.json"
REPORT_JSON_PATH = ROOT / "reports" / "seis-platform-development-tracks.json"
REPORT_MD_PATH = ROOT / "reports" / "seis-platform-development-tracks.md"
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

    bundle = build_platform_development_tracks()
    failures = validate_platform_development_tracks(bundle)
    if failures:
        print("SEIS platform development tracks are invalid:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    source_json = stable_json(bundle)
    report_json = stable_json(build_report(bundle))
    report_md = build_markdown(bundle)

    if CHECK_MODE:
        return check_outputs(source_json, report_json, report_md)

    write_text(SOURCE_PATH, source_json)
    write_text(REPORT_JSON_PATH, report_json)
    write_text(REPORT_MD_PATH, report_md)
    print("SEIS platform development tracks written:")
    print(f"- {relative(SOURCE_PATH)}")
    print(f"- {relative(REPORT_JSON_PATH)}")
    print(f"- {relative(REPORT_MD_PATH)}")
    return 0


def print_help() -> None:
    print(
        """SEIS platform development tracks

Commands:
  python3 scripts/create-seis-platform-development-tracks.py
  python3 scripts/create-seis-platform-development-tracks.py --check

The tracks keep macOS Apple-native only while Windows stays broad polyglot
without Swift/SwiftUI/Objective-C/Playground/AppleScript execution surfaces.
"""
    )


def build_report(bundle: dict) -> dict:
    return {
        "id": bundle["id"],
        "mode": bundle["mode"],
        "summary": bundle["summary"],
        "platformBoundaries": bundle["platformBoundaries"],
        "tracks": [
            {
                "id": track["id"],
                "label": track["label"],
                "lane": track["lane"],
                "platformScope": track["platformScope"],
                "languages": track["languages"],
                "validationCommands": track["validationCommands"],
                "qualityGates": track["qualityGates"],
                "executionRule": track["executionRule"],
            }
            for track in bundle["tracks"]
        ],
    }


def build_markdown(bundle: dict) -> str:
    summary = bundle["summary"]
    lines = [
        "# SEIS Platform Development Tracks",
        "",
        f"- Mode: `{bundle['mode']}`",
        f"- Tracks: {summary['trackCount']}",
        f"- Apple language count: {summary['appleLanguageCount']}",
        f"- Windows required languages: {summary['windowsRequiredLanguageCount']}",
        f"- Windows extended languages: {summary['windowsExtendedLanguageCount']}",
        f"- Windows language coverage: {summary['windowsLanguageCoverageCount']}",
        f"- Quality gates: {summary['qualityGateCount']}",
        f"- JavaScript policy: `{bundle['platformBoundaries']['javascriptPolicy']}`",
        "",
        "## Platform Boundaries",
        "",
        f"- Apple only: {', '.join(bundle['platformBoundaries']['appleOnlyLanguageSurfaces'])}",
        f"- Windows excludes: {', '.join(bundle['platformBoundaries']['windowsExcludedLanguageSurfaces'])}",
        "",
        "## Track Index",
        "",
        "| Track | Platforms | Languages | Validation | Rule |",
        "| --- | --- | --- | --- | --- |",
    ]

    for track in bundle["tracks"]:
        languages = ", ".join(track["languages"]) if track["languages"] else "policy-only"
        commands = "<br>".join(f"`{command}`" for command in track["validationCommands"][:4])
        lines.append(
            f"| {track['label']} | {', '.join(track['platformScope'])} | {languages} | {commands} | {track['executionRule']} |"
        )

    lines.extend(["", "## Required Gates", ""])
    for track in bundle["tracks"]:
        lines.append(f"### {track['label']}")
        lines.extend(f"- `{gate}`" for gate in track["qualityGates"])
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
        print("SEIS platform development tracks check failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        print("Run: npm run automation:seis-platform-development-tracks", file=sys.stderr)
        return 1

    print("SEIS platform development tracks check passed.")
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
