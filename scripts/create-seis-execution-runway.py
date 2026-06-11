#!/usr/bin/env python3

import json
import sys
from pathlib import Path


ROOT = Path.cwd()
sys.path.insert(0, str(ROOT))

from packages.seis_kernel.execution_runway import build_execution_runway, validate_execution_runway  # noqa: E402


SOURCE_PATH = ROOT / "content" / "development" / "seis-execution-runway.json"
REPORT_JSON_PATH = ROOT / "reports" / "seis-execution-runway.json"
REPORT_MD_PATH = ROOT / "reports" / "seis-execution-runway.md"
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

    runway = build_execution_runway()
    failures = validate_execution_runway(runway)
    if failures:
        print("SEIS execution runway is invalid:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    source_json = stable_json(runway)
    report_json = stable_json(build_report(runway))
    report_md = build_markdown(runway)

    if CHECK_MODE:
        return check_outputs(source_json, report_json, report_md)

    write_text(SOURCE_PATH, source_json)
    write_text(REPORT_JSON_PATH, report_json)
    write_text(REPORT_MD_PATH, report_md)
    print("SEIS execution runway written:")
    print(f"- {relative(SOURCE_PATH)}")
    print(f"- {relative(REPORT_JSON_PATH)}")
    print(f"- {relative(REPORT_MD_PATH)}")
    return 0


def print_help() -> None:
    print(
        """SEIS execution runway

Commands:
  python3 scripts/create-seis-execution-runway.py
  python3 scripts/create-seis-execution-runway.py --check

The runway expands execution packages into an extreme long-duration,
checkpoint-driven SEIS work schedule.
"""
    )


def build_report(runway: dict) -> dict:
    return {
        "id": runway["id"],
        "mode": runway["mode"],
        "sourcePackages": runway["sourcePackages"],
        "duration": runway["duration"],
        "summary": runway["summary"],
        "governance": runway["governance"],
        "phases": runway["phases"],
        "nextSlots": runway["slots"][:12],
        "nextCheckpoints": runway["checkpoints"][:12],
    }


def build_markdown(runway: dict) -> str:
    summary = runway["summary"]
    lines = [
        "# SEIS Execution Runway",
        "",
        f"- Mode: `{runway['mode']}`",
        f"- Source packages: `{runway['sourcePackages']}`",
        f"- Weeks: {runway['duration']['weeks']}",
        f"- Minimum focus hours: {summary['minimumFocusHours']}",
        f"- Phases: {summary['phaseCount']}",
        f"- Slots: {summary['slotCount']}",
        f"- Checkpoints: {summary['checkpointCount']}",
        f"- Package coverage: {summary['packageCoverageCount']}",
        f"- Command coverage: {summary['commandCoverageCount']}",
        f"- Commit policy: `{runway['governance']['commitPolicy']}`",
        f"- Push policy: `{runway['governance']['pushPolicy']}`",
        "",
        "## Phases",
        "",
        "| Phase | Weeks | Lane | Focus Hours |",
        "| --- | --- | --- | ---: |",
    ]
    for phase in runway["phases"]:
        lines.append(f"| {phase['label']} | `{phase['weeks']}` | `{phase['laneId']}` | {phase['focusHours']} |")

    lines.extend([
        "",
        "## Next 12 Slots",
        "",
        "| Slot | Phase | Package | Focus Hours | Required Commands |",
        "| --- | --- | --- | ---: | --- |",
    ])
    for slot in runway["slots"][:12]:
        commands = "<br>".join(f"`{command}`" for command in slot["validationCommands"][:3])
        lines.append(
            f"| `{slot['id']}` | `{slot['phaseId']}` | `{slot['packageId']}` | {slot['focusHours']} | {commands} |"
        )
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
        print("SEIS execution runway check failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        print("Run: npm run automation:seis-execution-runway", file=sys.stderr)
        return 1

    print("SEIS execution runway check passed.")
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
