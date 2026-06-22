#!/usr/bin/env python3

import json
import sys
from pathlib import Path


ROOT = Path.cwd()
sys.path.insert(0, str(ROOT))

from packages.seis_kernel.execution_packages import build_execution_packages, validate_execution_packages  # noqa: E402


SOURCE_PATH = ROOT / "content" / "development" / "seis-execution-packages.json"
REPORT_JSON_PATH = ROOT / "reports" / "seis-execution-packages.json"
REPORT_MD_PATH = ROOT / "reports" / "seis-execution-packages.md"
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

    bundle = build_execution_packages()
    failures = validate_execution_packages(bundle)
    if failures:
        print("SEIS execution packages are invalid:", file=sys.stderr)
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
    print("SEIS execution packages written:")
    print(f"- {relative(SOURCE_PATH)}")
    print(f"- {relative(REPORT_JSON_PATH)}")
    print(f"- {relative(REPORT_MD_PATH)}")
    return 0


def print_help() -> None:
    print(
        """SEIS execution packages

Commands:
  python3 scripts/create-seis-execution-packages.py
  python3 scripts/create-seis-execution-packages.py --check

Execution packages convert active mission cards into daily, reversible,
validation-ready task packets for long-duration SEIS development.
"""
    )


def build_report(bundle: dict) -> dict:
    return {
        "id": bundle["id"],
        "mode": bundle["mode"],
        "sourceBoard": bundle["sourceBoard"],
        "summary": bundle["summary"],
        "governance": bundle["governance"],
        "commandCoverage": bundle["commandCoverage"],
        "artifactRoots": bundle["artifactRoots"],
        "nextPackets": bundle["packages"][:10],
    }


def build_markdown(bundle: dict) -> str:
    summary = bundle["summary"]
    lines = [
        "# SEIS Execution Packages",
        "",
        f"- Mode: `{bundle['mode']}`",
        f"- Source board: `{bundle['sourceBoard']}`",
        f"- Packages: {summary['packageCount']}",
        f"- Now packages: {summary['nowPackageCount']}",
        f"- Next packages: {summary['nextPackageCount']}",
        f"- Queued packages: {summary['queuedPackageCount']}",
        f"- Validation commands: {summary['validationCommandCount']}",
        f"- Artifact roots: {summary['artifactRootCount']}",
        f"- Runtime install policy: `{bundle['governance']['runtimeInstallPolicy']}`",
        f"- Commit policy: `{bundle['governance']['commitPolicy']}`",
        f"- Push policy: `{bundle['governance']['pushPolicy']}`",
        "",
        "## Command Coverage",
        "",
    ]
    lines.extend(f"- `{command}`" for command in bundle["commandCoverage"])
    lines.extend([
        "",
        "## Next 10 Packets",
        "",
        "| Packet | Lane | Mission | Agent | Commands | Gates |",
        "| ---: | --- | --- | --- | --- | --- |",
    ])
    for package in bundle["packages"][:10]:
        commands = "<br>".join(f"`{command}`" for command in package["validationCommands"])
        gates = ", ".join(package["acceptanceGates"][:5])
        lines.append(
            f"| {package['packetNumber']} | `{package['laneId']}` | `{package['missionId']}` | `{package['agentRole']}` | {commands} | {gates} |"
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
        print("SEIS execution packages check failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        print("Run: npm run automation:seis-execution-packages", file=sys.stderr)
        return 1

    print("SEIS execution packages check passed.")
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
