#!/usr/bin/env python3

import json
import sys
from pathlib import Path


ROOT = Path.cwd()
sys.path.insert(0, str(ROOT))

from packages.seis_kernel.long_horizon import build_long_horizon_plan, validate_long_horizon_plan  # noqa: E402


SOURCE_PATH = ROOT / "content" / "development" / "seis-long-horizon-missions.json"
REPORT_JSON_PATH = ROOT / "reports" / "seis-long-horizon-missions.json"
REPORT_MD_PATH = ROOT / "reports" / "seis-long-horizon-missions.md"
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

    plan = build_long_horizon_plan()
    failures = validate_long_horizon_plan(plan)
    if failures:
        print("SEIS long-horizon mission kernel is invalid:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    source_json = stable_json(plan)
    report_json = stable_json(build_report(plan))
    report_md = build_markdown(plan)

    if CHECK_MODE:
        return check_outputs(source_json, report_json, report_md)

    write_text(SOURCE_PATH, source_json)
    write_text(REPORT_JSON_PATH, report_json)
    write_text(REPORT_MD_PATH, report_md)
    print("SEIS long-horizon mission kernel written:")
    print(f"- {relative(SOURCE_PATH)}")
    print(f"- {relative(REPORT_JSON_PATH)}")
    print(f"- {relative(REPORT_MD_PATH)}")
    return 0


def print_help() -> None:
    print(
        """SEIS long-horizon mission kernel

Commands:
  python3 scripts/create-seis-long-horizon-missions.py
  python3 scripts/create-seis-long-horizon-missions.py --check

The mission kernel generates a deterministic 52-week backlog for aggressive
Apple, Windows, AI agent, MCP, plugin, data, design, security, and delivery work.
"""
    )


def build_report(plan: dict) -> dict:
    summary = plan["summary"]
    return {
        "id": plan["id"],
        "mode": plan["mode"],
        "summary": summary,
        "installPolicy": plan["installPolicy"],
        "topWaves": [
            {
                "id": wave["id"],
                "label": wave["label"],
                "horizon": wave["horizon"],
                "agentRole": wave["agent_role"],
                "missionCount": sum(1 for mission in plan["missions"] if mission["waveId"] == wave["id"]),
            }
            for wave in plan["waves"]
        ],
        "nextProgressSlice": plan["missions"][:12],
    }


def build_markdown(plan: dict) -> str:
    summary = plan["summary"]
    lines = [
        "# SEIS Long-Horizon Mission Kernel",
        "",
        f"- Mode: `{plan['mode']}`",
        f"- Duration: {plan['duration']['weeks']} weeks",
        f"- Waves: {summary['waveCount']}",
        f"- Missions: {summary['missionCount']}",
        f"- Domain coverage: {summary['domainCoverageCount']}",
        f"- Language coverage: {summary['languageCoverageCount']}",
        f"- Apple missions: {summary['appleMissionCount']}",
        f"- Windows missions: {summary['windowsMissionCount']}",
        f"- Minimum quality gates per mission: {summary['minimumQualityGateCount']}",
        "",
        "## Install Policy",
        "",
        f"- Default: `{plan['installPolicy']['default']}`",
    ]
    for item in plan["installPolicy"]["allowedWhen"]:
        lines.append(f"- Allowed when: {item}")

    lines.extend([
        "",
        "## Waves",
        "",
        "| Wave | Horizon | Agent | Mission Count |",
        "| --- | --- | --- | ---: |",
    ])
    for wave in plan["waves"]:
        count = sum(1 for mission in plan["missions"] if mission["waveId"] == wave["id"])
        lines.append(f"| {wave['label']} | `{wave['horizon']}` | `{wave['agent_role']}` | {count} |")

    lines.extend([
        "",
        "## First 20 Missions",
        "",
        "| Order | Mission | Domain | Languages | Gates |",
        "| ---: | --- | --- | --- | --- |",
    ])
    for mission in plan["missions"][:20]:
        languages = ", ".join(mission["primaryLanguages"][:5])
        gates = ", ".join(mission["qualityGates"][:4])
        lines.append(f"| {mission['order']} | `{mission['id']}` | `{mission['domainId']}` | {languages} | {gates} |")

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
        print("SEIS long-horizon mission check failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        print("Run: npm run automation:seis-long-horizon-missions", file=sys.stderr)
        return 1

    print("SEIS long-horizon mission check passed.")
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
