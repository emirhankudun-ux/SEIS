#!/usr/bin/env python3

import json
import sys
from pathlib import Path


ROOT = Path.cwd()
sys.path.insert(0, str(ROOT))

from packages.seis_kernel.platform_language_policy import (  # noqa: E402
    build_platform_language_policy,
    validate_platform_language_policy,
)


SOURCE_PATH = ROOT / "content" / "development" / "seis-platform-language-policy.json"
REPORT_JSON_PATH = ROOT / "reports" / "seis-platform-language-policy.json"
REPORT_MD_PATH = ROOT / "reports" / "seis-platform-language-policy.md"
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

    policy = build_platform_language_policy()
    failures = validate_platform_language_policy(policy)
    if failures:
        print("SEIS platform language policy is invalid:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    source_json = stable_json(policy)
    report_json = stable_json(build_report(policy))
    report_md = build_markdown(policy)

    if CHECK_MODE:
        return check_outputs(source_json, report_json, report_md)

    write_text(SOURCE_PATH, source_json)
    write_text(REPORT_JSON_PATH, report_json)
    write_text(REPORT_MD_PATH, report_md)
    print("SEIS platform language policy written:")
    print(f"- {relative(SOURCE_PATH)}")
    print(f"- {relative(REPORT_JSON_PATH)}")
    print(f"- {relative(REPORT_MD_PATH)}")
    return 0


def print_help() -> None:
    print(
        """SEIS platform language policy

Commands:
  python3 scripts/create-seis-platform-language-policy.py
  python3 scripts/create-seis-platform-language-policy.py --check

The policy keeps new SEIS platform work Apple-native first while Windows remains broad polyglot
without Swift/SwiftUI/Objective-C/Playground/AppleScript surfaces.
"""
    )


def build_report(policy: dict) -> dict:
    return {
        "id": policy["id"],
        "mode": policy["mode"],
        "summary": policy["summary"],
        "apple": policy["apple"],
        "windows": policy["windows"],
        "routingRule": policy["routingRule"],
    }


def build_markdown(policy: dict) -> str:
    lines = [
        "# SEIS Platform Language Policy",
        "",
        f"- Mode: `{policy['mode']}`",
        f"- Apple language surfaces: {', '.join(policy['apple']['allowedLanguageSurfaces'])}",
        f"- Apple native frameworks: {', '.join(policy['apple']['prioritizedFrameworks'])}",
        f"- Windows language surfaces: {policy['summary']['windowsLanguageCount']}",
        f"- Windows excluded surfaces: {', '.join(policy['windows']['excludedLanguageSurfaces'])}",
        "",
        "## Apple Rule",
        "",
        policy["apple"]["rule"],
        policy["apple"]["continuationRule"],
        "",
        "## Windows Rule",
        "",
        policy["windows"]["rule"],
        "",
        "## Windows Required Language Surfaces",
        "",
    ]
    lines.extend(f"- {language}" for language in policy["windows"]["requiredLanguageSurfaces"])
    lines.extend(["", "## Windows Extended Language Surfaces", ""])
    extended = [
        language
        for language in policy["windows"]["allowedLanguageSurfaces"]
        if language not in policy["windows"]["requiredLanguageSurfaces"]
    ]
    lines.extend(f"- {language}" for language in extended)
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
        print("SEIS platform language policy check failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        print("Run: npm run automation:seis-platform-language-policy", file=sys.stderr)
        return 1

    print("SEIS platform language policy check passed.")
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
