#!/usr/bin/env python3

import json
import sys
from pathlib import Path


ROOT = Path.cwd()
sys.path.insert(0, str(ROOT))

from packages.seis_kernel.active_board import build_active_mission_board, validate_active_mission_board  # noqa: E402


SOURCE_PATH = ROOT / "content" / "development" / "seis-active-mission-board.json"
REPORT_JSON_PATH = ROOT / "reports" / "seis-active-mission-board.json"
REPORT_MD_PATH = ROOT / "reports" / "seis-active-mission-board.md"
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

    board = build_active_mission_board()
    failures = validate_active_mission_board(board)
    if failures:
        print("SEIS active mission board is invalid:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    source_json = stable_json(board)
    report_json = stable_json(build_report(board))
    report_md = build_markdown(board)

    if CHECK_MODE:
        return check_outputs(source_json, report_json, report_md)

    write_text(SOURCE_PATH, source_json)
    write_text(REPORT_JSON_PATH, report_json)
    write_text(REPORT_MD_PATH, report_md)
    print("SEIS active mission board written:")
    print(f"- {relative(SOURCE_PATH)}")
    print(f"- {relative(REPORT_JSON_PATH)}")
    print(f"- {relative(REPORT_MD_PATH)}")
    return 0


def print_help() -> None:
    print(
        """SEIS active mission board

Commands:
  python3 scripts/create-seis-active-mission-board.py
  python3 scripts/create-seis-active-mission-board.py --check

The board converts the 52-week SEIS mission plan into a deterministic
first-90-days execution surface with now, next, and queued lanes.
"""
    )


def build_report(board: dict) -> dict:
    return {
        "id": board["id"],
        "mode": board["mode"],
        "sourcePlan": board["sourcePlan"],
        "focusWindow": board["focusWindow"],
        "summary": board["summary"],
        "installPolicy": board["installPolicy"],
        "lanes": [
            {
                "id": lane["id"],
                "label": lane["label"],
                "waveId": lane["waveId"],
                "wipLimit": lane["wipLimit"],
                "cardCount": sum(1 for card in board["cards"] if card["laneId"] == lane["id"]),
            }
            for lane in board["lanes"]
        ],
        "executionSlice": board["cards"][:12],
    }


def build_markdown(board: dict) -> str:
    summary = board["summary"]
    lines = [
        "# SEIS Active Mission Board",
        "",
        f"- Mode: `{board['mode']}`",
        f"- Source plan: `{board['sourcePlan']}`",
        f"- Focus window: {board['focusWindow']['weeks']} weeks",
        f"- Lanes: {summary['laneCount']}",
        f"- Cards: {summary['cardCount']}",
        f"- Platform coverage: {summary['platformCoverageCount']}",
        f"- Language coverage: {summary['languageCoverageCount']}",
        f"- Quality gate coverage: {summary['qualityGateCoverageCount']}",
        f"- Runtime install policy: `{board['installPolicy']['default']}`",
        "",
        "## Lanes",
        "",
        "| Lane | Wave | WIP Limit | Cards | Cadence |",
        "| --- | --- | ---: | ---: | --- |",
    ]
    for lane in board["lanes"]:
        card_count = sum(1 for card in board["cards"] if card["laneId"] == lane["id"])
        lines.append(
            f"| `{lane['id']}` | `{lane['waveId']}` | {lane['wipLimit']} | {card_count} | {lane['cadence']} |"
        )

    lines.extend([
        "",
        "## First 30 Execution Cards",
        "",
        "| Order | Lane | Mission | Platforms | Languages | Gates |",
        "| ---: | --- | --- | --- | --- | --- |",
    ])
    for card in board["cards"][:30]:
        platforms = ", ".join(card["platformScope"])
        languages = ", ".join(card["primaryLanguages"][:6])
        gates = ", ".join(card["qualityGates"][:4])
        lines.append(
            f"| {card['order']} | `{card['laneId']}` | `{card['missionId']}` | {platforms} | {languages} | {gates} |"
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
        print("SEIS active mission board check failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        print("Run: npm run automation:seis-active-mission-board", file=sys.stderr)
        return 1

    print("SEIS active mission board check passed.")
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
